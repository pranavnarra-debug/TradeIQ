import express from 'express';
import { query, withTransaction } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import marketData from '../services/marketData.js';
import { cleanSymbol, clampText } from '../services/validate.js';
import { checkAchievementsSafe } from '../services/progress.js';

const router = express.Router();
router.use(authenticate);

async function ownsPortfolio(userId, portfolioId) {
  if (!Number.isInteger(Number(portfolioId))) return null;
  const result = await query('SELECT * FROM portfolios WHERE id = $1 AND user_id = $2', [portfolioId, userId]);
  return result.rows[0] || null;
}

async function computePortfolioStats(portfolio) {
  const positionsResult = await query(
    'SELECT * FROM positions WHERE portfolio_id = $1 AND is_open = TRUE',
    [portfolio.id]
  );
  const openPositions = positionsResult.rows;

  let unrealizedPnl = 0;
  const enrichedPositions = [];
  for (const pos of openPositions) {
    let currentPrice = Number(pos.entry_price);
    try {
      const quote = await marketData.getQuote(pos.symbol);
      if (quote && !quote.error && quote.price != null) currentPrice = quote.price;
    } catch {
      // fall back to entry price if quote fails
    }
    const qty = Number(pos.quantity);
    const entry = Number(pos.entry_price);
    const pnl = pos.side === 'long' ? (currentPrice - entry) * qty : (entry - currentPrice) * qty;
    unrealizedPnl += pnl;
    enrichedPositions.push({
      ...pos,
      currentPrice,
      unrealizedPnl: Math.round(pnl * 100) / 100,
      unrealizedPnlPct: entry > 0 ? Math.round(((pnl / (entry * qty)) * 100) * 100) / 100 : 0,
    });
  }

  const tradesResult = await query(
    'SELECT * FROM trades WHERE portfolio_id = $1 ORDER BY executed_at DESC',
    [portfolio.id]
  );
  const trades = tradesResult.rows;
  const closedTrades = trades.filter((t) => t.realized_pnl !== null);
  const wins = closedTrades.filter((t) => Number(t.realized_pnl) > 0);
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  const realizedPnl = closedTrades.reduce((sum, t) => sum + Number(t.realized_pnl), 0);
  const bestTrade = closedTrades.reduce((best, t) => (best == null || Number(t.realized_pnl) > Number(best.realized_pnl) ? t : best), null);
  const worstTrade = closedTrades.reduce((worst, t) => (worst == null || Number(t.realized_pnl) < Number(worst.realized_pnl) ? t : worst), null);

  const cash = Number(portfolio.cash);
  const positionsValue = enrichedPositions.reduce((sum, p) => sum + p.currentPrice * Number(p.quantity), 0);
  const equity = cash + positionsValue;

  return {
    portfolioId: portfolio.id,
    portfolioType: portfolio.portfolio_type,
    name: portfolio.name,
    startingCapital: Number(portfolio.starting_capital),
    cash,
    equity: Math.round(equity * 100) / 100,
    unrealizedPnl: Math.round(unrealizedPnl * 100) / 100,
    realizedPnl: Math.round(realizedPnl * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    totalTrades: trades.length,
    closedTrades: closedTrades.length,
    bestTrade: bestTrade ? { ...bestTrade, realized_pnl: Number(bestTrade.realized_pnl) } : null,
    worstTrade: worstTrade ? { ...worstTrade, realized_pnl: Number(worstTrade.realized_pnl) } : null,
    positions: enrichedPositions,
  };
}

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM portfolios WHERE user_id = $1 ORDER BY id', [req.user.userId]);
    const stats = await Promise.all(result.rows.map((p) => computePortfolioStats(p)));
    res.json(stats);
  } catch (err) {
    console.error('Get portfolios error:', err);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

const MAX_QTY = 1_000_000;
const STRATEGY_RE = /^[a-z_]{1,50}$/;

function parseId(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

router.post('/:id/trade', async (req, res) => {
  try {
    const portfolioId = parseId(req.params.id);
    if (!portfolioId) return res.status(404).json({ error: 'Portfolio not found' });

    const { symbol, action, orderType = 'market', limitPrice, strategy, reasoning } = req.body || {};
    const quantity = Number(req.body?.quantity);
    const upperSymbol = cleanSymbol(symbol);

    if (!upperSymbol) return res.status(400).json({ error: 'Enter a valid ticker symbol' });
    if (!['BUY', 'SELL'].includes(action)) return res.status(400).json({ error: 'action must be BUY or SELL' });
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > MAX_QTY) {
      return res.status(400).json({ error: `Quantity must be a whole number from 1 to ${MAX_QTY.toLocaleString()}` });
    }
    if (!['market', 'limit'].includes(orderType)) return res.status(400).json({ error: 'orderType must be market or limit' });
    const limit = orderType === 'limit' ? Number(limitPrice) : null;
    if (orderType === 'limit' && !(limit > 0 && Number.isFinite(limit))) {
      return res.status(400).json({ error: 'Enter a positive limit price' });
    }
    if (strategy != null && !STRATEGY_RE.test(strategy)) return res.status(400).json({ error: 'Unknown strategy' });

    const quote = await marketData.getQuote(upperSymbol);
    if (quote.error || !(quote.price > 0)) {
      return res.status(503).json({ error: 'Market data temporarily unavailable, please try again shortly' });
    }

    // Limit orders fill at the market price only if the market is at or better
    // than the limit (like a real exchange). v1 filled at the typed limit
    // price, which let anyone "buy" at $0.01 and sell at market for free money.
    if (orderType === 'limit') {
      const marketable = action === 'BUY' ? quote.price <= limit : quote.price >= limit;
      if (!marketable) {
        return res.status(400).json({
          error: `Not filled: ${upperSymbol} is at $${quote.price.toFixed(2)}, which doesn't meet your $${limit.toFixed(2)} limit. The simulator only fills limit orders that are marketable right now.`,
        });
      }
    }
    const executionPrice = quote.price;
    const cleanReasoning = clampText(reasoning, 1000);

    const outcome = await withTransaction(async (db) => {
      // Row lock: two simultaneous orders can't both spend the same cash.
      const pr = await db.query('SELECT * FROM portfolios WHERE id = $1 AND user_id = $2 FOR UPDATE', [portfolioId, req.user.userId]);
      const portfolio = pr.rows[0];
      if (!portfolio) return { status: 404, error: 'Portfolio not found' };

      if (action === 'BUY') {
        const cost = executionPrice * quantity;
        if (cost > Number(portfolio.cash)) return { status: 400, error: 'Not enough cash for this trade' };
        await db.query(
          `INSERT INTO trades (portfolio_id, symbol, action, quantity, price, order_type, strategy, reasoning)
           VALUES ($1, $2, 'BUY', $3, $4, $5, $6, $7)`,
          [portfolio.id, upperSymbol, quantity, executionPrice, orderType, strategy ?? null, cleanReasoning]
        );
        await db.query(
          `INSERT INTO positions (portfolio_id, symbol, side, quantity, entry_price, strategy) VALUES ($1, $2, 'long', $3, $4, $5)`,
          [portfolio.id, upperSymbol, quantity, executionPrice, strategy ?? null]
        );
        await db.query('UPDATE portfolios SET cash = cash - $1 WHERE id = $2', [cost, portfolio.id]);
        return { ok: true };
      }

      const open = await db.query(
        `SELECT * FROM positions WHERE portfolio_id = $1 AND symbol = $2 AND is_open = TRUE AND side = 'long'
         ORDER BY entry_time ASC FOR UPDATE`,
        [portfolio.id, upperSymbol]
      );
      const held = open.rows.reduce((sum, p) => sum + Number(p.quantity), 0);
      if (held < quantity) return { status: 400, error: `You only hold ${held} share${held === 1 ? '' : 's'} of ${upperSymbol}` };

      let remaining = quantity;
      let realized = 0;
      for (const pos of open.rows) {
        if (remaining <= 0) break;
        const sellQty = Math.min(Number(pos.quantity), remaining);
        realized += (executionPrice - Number(pos.entry_price)) * sellQty;
        if (sellQty === Number(pos.quantity)) await db.query('UPDATE positions SET is_open = FALSE WHERE id = $1', [pos.id]);
        else await db.query('UPDATE positions SET quantity = quantity - $1 WHERE id = $2', [sellQty, pos.id]);
        remaining -= sellQty;
      }
      await db.query(
        `INSERT INTO trades (portfolio_id, symbol, action, quantity, price, order_type, strategy, reasoning, realized_pnl)
         VALUES ($1, $2, 'SELL', $3, $4, $5, $6, $7, $8)`,
        [portfolio.id, upperSymbol, quantity, executionPrice, orderType, strategy ?? null, cleanReasoning, realized]
      );
      await db.query('UPDATE portfolios SET cash = cash + $1 WHERE id = $2', [executionPrice * quantity, portfolio.id]);
      return { ok: true };
    });

    if (outcome.error) return res.status(outcome.status).json({ error: outcome.error });

    const newAchievements = await checkAchievementsSafe(req.user.userId);
    const stats = await computePortfolioStats(await ownsPortfolio(req.user.userId, portfolioId));
    res.json({ ...stats, newAchievements: newAchievements.map(({ id, name, desc, sprite }) => ({ id, name, desc, sprite })) });
  } catch (err) {
    console.error('Trade error:', err);
    res.status(500).json({ error: 'Failed to execute trade' });
  }
});

router.get('/:id/positions', async (req, res) => {
  try {
    const portfolio = await ownsPortfolio(req.user.userId, req.params.id);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    const stats = await computePortfolioStats(portfolio);
    res.json(stats.positions);
  } catch (err) {
    console.error('Get positions error:', err);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const portfolio = await ownsPortfolio(req.user.userId, req.params.id);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    const result = await query(
      'SELECT * FROM trades WHERE portfolio_id = $1 ORDER BY executed_at DESC LIMIT 200',
      [portfolio.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
});

router.post('/:id/close/:posId', async (req, res) => {
  try {
    const portfolioId = parseId(req.params.id);
    const posId = parseId(req.params.posId);
    if (!portfolioId || !posId) return res.status(404).json({ error: 'Open position not found' });

    const pre = await query(
      `SELECT p.symbol FROM positions p JOIN portfolios pf ON pf.id = p.portfolio_id
       WHERE p.id = $1 AND pf.id = $2 AND pf.user_id = $3 AND p.is_open = TRUE`,
      [posId, portfolioId, req.user.userId]
    );
    if (!pre.rows[0]) return res.status(404).json({ error: 'Open position not found' });

    const quote = await marketData.getQuote(pre.rows[0].symbol);
    if (quote.error || !(quote.price > 0)) {
      return res.status(503).json({ error: 'Market data temporarily unavailable, please try again shortly' });
    }
    const exitPrice = quote.price;

    const outcome = await withTransaction(async (db) => {
      const pf = await db.query('SELECT id FROM portfolios WHERE id = $1 AND user_id = $2 FOR UPDATE', [portfolioId, req.user.userId]);
      if (!pf.rows[0]) return { error: 'Portfolio not found' };
      const pr = await db.query('SELECT * FROM positions WHERE id = $1 AND portfolio_id = $2 AND is_open = TRUE FOR UPDATE', [posId, portfolioId]);
      const position = pr.rows[0];
      if (!position) return { error: 'Open position not found' };
      const qty = Number(position.quantity);
      const entry = Number(position.entry_price);
      const pnl = position.side === 'long' ? (exitPrice - entry) * qty : (entry - exitPrice) * qty;
      await db.query('UPDATE positions SET is_open = FALSE WHERE id = $1', [position.id]);
      await db.query(
        `INSERT INTO trades (portfolio_id, symbol, action, quantity, price, order_type, strategy, reasoning, realized_pnl)
         VALUES ($1, $2, 'SELL', $3, $4, 'market', $5, 'Closed position', $6)`,
        [portfolioId, position.symbol, qty, exitPrice, position.strategy, pnl]
      );
      const cashDelta = position.side === 'long' ? exitPrice * qty : entry * qty + pnl;
      await db.query('UPDATE portfolios SET cash = cash + $1 WHERE id = $2', [cashDelta, portfolioId]);
      return { ok: true };
    });
    if (outcome.error) return res.status(404).json({ error: outcome.error });

    const newAchievements = await checkAchievementsSafe(req.user.userId);
    const stats = await computePortfolioStats(await ownsPortfolio(req.user.userId, portfolioId));
    res.json({ ...stats, newAchievements: newAchievements.map(({ id, name, desc, sprite }) => ({ id, name, desc, sprite })) });
  } catch (err) {
    console.error('Close position error:', err);
    res.status(500).json({ error: 'Failed to close position' });
  }
});

router.get('/:id/stats', async (req, res) => {
  try {
    const portfolio = await ownsPortfolio(req.user.userId, req.params.id);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    const stats = await computePortfolioStats(portfolio);

    const tradesResult = await query(
      'SELECT * FROM trades WHERE portfolio_id = $1 AND realized_pnl IS NOT NULL ORDER BY executed_at',
      [portfolio.id]
    );
    const closedTrades = tradesResult.rows;
    let avgRMultiple = null;
    if (closedTrades.length > 0) {
      // Approximate R using a flat 1R = 2% of entry value per trade (since stop distance isn't stored per trade)
      const rValues = closedTrades.map((t) => {
        const riskAmount = Number(t.price) * Number(t.quantity) * 0.02;
        return riskAmount > 0 ? Number(t.realized_pnl) / riskAmount : 0;
      });
      avgRMultiple = rValues.reduce((a, b) => a + b, 0) / rValues.length;
    }

    res.json({
      ...stats,
      avgRMultiple: avgRMultiple != null ? Math.round(avgRMultiple * 100) / 100 : null,
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch portfolio stats' });
  }
});

router.post('/analysis', async (req, res) => {
  try {
    const { symbol, trendAssessment, supportLevel, resistanceLevel, canslimChecks, verdict, reasoning } = req.body || {};

    const sym = cleanSymbol(symbol);
    if (!sym || !['BUY', 'HOLD', 'AVOID', 'SELL'].includes(verdict) || typeof reasoning !== 'string' || reasoning.length < 20) {
      return res.status(400).json({ error: 'symbol, verdict, and a reasoning of at least 20 characters are required' });
    }
    const num = (v) => (v === '' || v == null || !Number.isFinite(Number(v)) ? null : Number(v));

    const result = await query(
      `INSERT INTO user_analyses (user_id, symbol, trend_assessment, support_level, resistance_level, canslim_checks, verdict, reasoning)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.user.userId,
        sym,
        clampText(trendAssessment, 20),
        num(supportLevel),
        num(resistanceLevel),
        canslimChecks && typeof canslimChecks === 'object' ? JSON.stringify(canslimChecks).slice(0, 2000) : null,
        verdict,
        clampText(reasoning, 4000),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Save analysis error:', err);
    res.status(500).json({ error: 'Failed to save analysis' });
  }
});

router.get('/analysis', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM user_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get analyses error:', err);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

export default router;
