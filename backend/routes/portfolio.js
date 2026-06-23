import express from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import marketData from '../services/marketData.js';

const router = express.Router();
router.use(authenticate);

async function ownsPortfolio(userId, portfolioId) {
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

router.post('/:id/trade', async (req, res) => {
  try {
    const portfolio = await ownsPortfolio(req.user.userId, req.params.id);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    const { symbol, action, quantity, orderType = 'market', limitPrice, strategy, reasoning } = req.body || {};

    if (!symbol || !['BUY', 'SELL'].includes(action) || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'symbol, action (BUY/SELL), and a positive quantity are required' });
    }
    if (!['market', 'limit'].includes(orderType)) {
      return res.status(400).json({ error: 'orderType must be market or limit' });
    }
    if (orderType === 'limit' && !limitPrice) {
      return res.status(400).json({ error: 'limitPrice is required for limit orders' });
    }

    const upperSymbol = symbol.toUpperCase();
    const quote = await marketData.getQuote(upperSymbol);
    if (quote.error) {
      return res.status(503).json({ error: 'Market data temporarily unavailable, please try again shortly' });
    }
    const executionPrice = orderType === 'limit' ? Number(limitPrice) : quote.price;
    const cost = executionPrice * quantity;

    if (action === 'BUY') {
      if (cost > Number(portfolio.cash)) {
        return res.status(400).json({ error: 'Insufficient cash for this trade' });
      }

      await query(
        `INSERT INTO trades (portfolio_id, symbol, action, quantity, price, order_type, strategy, reasoning)
         VALUES ($1, $2, 'BUY', $3, $4, $5, $6, $7)`,
        [portfolio.id, upperSymbol, quantity, executionPrice, orderType, strategy ?? null, reasoning ?? null]
      );

      await query(
        `INSERT INTO positions (portfolio_id, symbol, side, quantity, entry_price, strategy)
         VALUES ($1, $2, 'long', $3, $4, $5)`,
        [portfolio.id, upperSymbol, quantity, executionPrice, strategy ?? null]
      );

      await query('UPDATE portfolios SET cash = cash - $1 WHERE id = $2', [cost, portfolio.id]);
    } else {
      // SELL: close existing long position(s) for this symbol, FIFO, up to requested quantity
      const openPositions = await query(
        `SELECT * FROM positions WHERE portfolio_id = $1 AND symbol = $2 AND is_open = TRUE ORDER BY entry_time ASC`,
        [portfolio.id, upperSymbol]
      );

      const totalOpenQty = openPositions.rows.reduce((sum, p) => sum + Number(p.quantity), 0);
      if (totalOpenQty < quantity) {
        return res.status(400).json({ error: 'Cannot sell more shares than currently held' });
      }

      let remaining = quantity;
      let totalRealizedPnl = 0;

      for (const pos of openPositions.rows) {
        if (remaining <= 0) break;
        const posQty = Number(pos.quantity);
        const sellQty = Math.min(posQty, remaining);
        const entry = Number(pos.entry_price);
        const pnl = (executionPrice - entry) * sellQty;
        totalRealizedPnl += pnl;

        if (sellQty === posQty) {
          await query('UPDATE positions SET is_open = FALSE WHERE id = $1', [pos.id]);
        } else {
          await query('UPDATE positions SET quantity = quantity - $1 WHERE id = $2', [sellQty, pos.id]);
        }
        remaining -= sellQty;
      }

      await query(
        `INSERT INTO trades (portfolio_id, symbol, action, quantity, price, order_type, strategy, reasoning, realized_pnl)
         VALUES ($1, $2, 'SELL', $3, $4, $5, $6, $7, $8)`,
        [portfolio.id, upperSymbol, quantity, executionPrice, orderType, strategy ?? null, reasoning ?? null, totalRealizedPnl]
      );

      await query('UPDATE portfolios SET cash = cash + $1 WHERE id = $2', [executionPrice * quantity, portfolio.id]);
    }

    const updatedPortfolio = await ownsPortfolio(req.user.userId, req.params.id);
    const stats = await computePortfolioStats(updatedPortfolio);
    res.json(stats);
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
    const portfolio = await ownsPortfolio(req.user.userId, req.params.id);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    const posResult = await query(
      'SELECT * FROM positions WHERE id = $1 AND portfolio_id = $2 AND is_open = TRUE',
      [req.params.posId, portfolio.id]
    );
    const position = posResult.rows[0];
    if (!position) return res.status(404).json({ error: 'Open position not found' });

    const quote = await marketData.getQuote(position.symbol);
    if (quote.error) {
      return res.status(503).json({ error: 'Market data temporarily unavailable, please try again shortly' });
    }

    const qty = Number(position.quantity);
    const entry = Number(position.entry_price);
    const exitPrice = quote.price;
    const pnl = position.side === 'long' ? (exitPrice - entry) * qty : (entry - exitPrice) * qty;

    await query('UPDATE positions SET is_open = FALSE WHERE id = $1', [position.id]);
    await query(
      `INSERT INTO trades (portfolio_id, symbol, action, quantity, price, order_type, strategy, reasoning, realized_pnl)
       VALUES ($1, $2, 'SELL', $3, $4, 'market', $5, $6, $7)`,
      [portfolio.id, position.symbol, qty, exitPrice, position.strategy, 'Manual position close', pnl]
    );

    const cashDelta = position.side === 'long' ? exitPrice * qty : entry * qty + pnl;
    await query('UPDATE portfolios SET cash = cash + $1 WHERE id = $2', [cashDelta, portfolio.id]);

    const updatedPortfolio = await ownsPortfolio(req.user.userId, req.params.id);
    const stats = await computePortfolioStats(updatedPortfolio);
    res.json(stats);
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

    if (!symbol || !verdict || !reasoning || reasoning.length < 20) {
      return res.status(400).json({ error: 'symbol, verdict, and a reasoning of at least 20 characters are required' });
    }

    const result = await query(
      `INSERT INTO user_analyses (user_id, symbol, trend_assessment, support_level, resistance_level, canslim_checks, verdict, reasoning)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.user.userId,
        symbol.toUpperCase(),
        trendAssessment ?? null,
        supportLevel ?? null,
        resistanceLevel ?? null,
        canslimChecks ? JSON.stringify(canslimChecks) : null,
        verdict,
        reasoning,
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
