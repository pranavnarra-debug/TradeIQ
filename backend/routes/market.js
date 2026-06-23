import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.js';
import marketData from '../services/marketData.js';
import strategyEngine from '../services/strategyEngine.js';
import {
  calcSMA,
  calcEMA,
  calcRSI,
  calcBollingerBands,
  calcVWAP,
  calc52WeekHighLow,
  calcRelativeVolume,
  detectPattern,
} from '../services/indicators.js';

const router = express.Router();

const marketLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?.userId?.toString() || req.ip,
  message: { error: 'Too many market data requests, please slow down' },
});

router.use(authenticate);
router.use(marketLimiter);

router.get('/quote/:symbol', async (req, res) => {
  try {
    const data = await marketData.getQuote(req.params.symbol.toUpperCase());
    res.json(data);
  } catch (err) {
    console.error('Quote error:', err);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

router.get('/candles/:symbol', async (req, res) => {
  try {
    const { period = '3mo', interval = '1d' } = req.query;
    const data = await marketData.getCandles(req.params.symbol.toUpperCase(), period, interval);
    res.json(data);
  } catch (err) {
    console.error('Candles error:', err);
    res.status(500).json({ error: 'Failed to fetch candles' });
  }
});

router.get('/profile/:symbol', async (req, res) => {
  try {
    const data = await marketData.getProfile(req.params.symbol.toUpperCase());
    res.json(data);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/news/:symbol', async (req, res) => {
  try {
    const data = await marketData.getNews(req.params.symbol.toUpperCase());
    res.json(data);
  } catch (err) {
    console.error('News error:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

router.get('/strategy/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { strategy } = req.query;
    if (!strategy) {
      return res.status(400).json({ error: 'strategy query param is required' });
    }

    const [candles, quote] = await Promise.all([
      marketData.getCandles(symbol, '1y', '1d'),
      marketData.getQuote(symbol),
    ]);

    if (candles.error || quote.error) {
      return res.status(503).json({ error: 'Data temporarily unavailable' });
    }

    const result = strategyEngine.evaluate(strategy, candles, quote);
    res.json({ symbol, strategy, ...result });
  } catch (err) {
    console.error('Strategy error:', err);
    res.status(500).json({ error: 'Failed to evaluate strategy' });
  }
});

router.get('/analysis/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const [candles, quote, profile, news, spyCandles] = await Promise.all([
      marketData.getCandles(symbol, '1y', '1d'),
      marketData.getQuote(symbol),
      marketData.getProfile(symbol),
      marketData.getNews(symbol),
      marketData.getCandles('SPY', '1y', '1d'),
    ]);

    if (candles.error) {
      return res.status(503).json({ error: 'Data temporarily unavailable' });
    }

    const closes = candles.map((c) => c.close);
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const volumes = candles.map((c) => c.volume);
    const price = quote.price ?? closes[closes.length - 1];

    const sma50 = lastDefined(calcSMA(closes, 50));
    const sma200 = lastDefined(calcSMA(closes, 200));
    const ema9 = lastDefined(calcEMA(closes, 9));
    const ema21 = lastDefined(calcEMA(closes, 21));
    const ema50 = lastDefined(calcEMA(closes, 50));
    const rsi = calcRSI(closes, 14);
    const bb = calcBollingerBands(closes, 20, 2);
    const bbUpper = lastDefined(bb.upper);
    const bbLower = lastDefined(bb.lower);
    const vwap = calcVWAP(highs, lows, closes, volumes);
    const { high: high52, low: low52 } = calc52WeekHighLow(closes);
    const relativeVolume = calcRelativeVolume(volumes);
    const pattern = detectPattern(candles);

    let bbPosition = 'middle';
    if (bbUpper != null && price > bbUpper) bbPosition = 'above upper band';
    else if (bbLower != null && price < bbLower) bbPosition = 'below lower band';

    // CANSLIM scorecard
    const avgVol30 = volumes.slice(-31, -1).reduce((a, b) => a + b, 0) / Math.max(volumes.slice(-31, -1).length, 1);
    const currentVol = volumes[volumes.length - 1];
    const recentNewsCount = Array.isArray(news)
      ? news.filter((n) => n.publishedAt && Date.now() - new Date(n.publishedAt).getTime() < 30 * 24 * 60 * 60 * 1000).length
      : 0;
    const newHighRecently = closes.slice(-60).some((c) => c >= high52 * 0.99);

    let spyFavorable = null;
    if (Array.isArray(spyCandles) && !spyCandles.error) {
      const spyCloses = spyCandles.map((c) => c.close);
      const spySma50 = lastDefined(calcSMA(spyCloses, 50));
      const spyPrice = spyCloses[spyCloses.length - 1];
      spyFavorable = spySma50 != null && spyPrice > spySma50;
    }

    const canslim = [
      { letter: 'C', name: 'Current Earnings (proxy: RSI + trend)', pass: rsi != null && rsi > 50 && sma50 != null && price > sma50, justification: `RSI ${rsi != null ? rsi.toFixed(1) : 'n/a'}, price ${sma50 != null && price > sma50 ? 'above' : 'below'} SMA50` },
      { letter: 'A', name: 'Annual Earnings (proxy: new 52w high)', pass: newHighRecently, justification: newHighRecently ? 'Made a new 52-week high in the past ~3 months' : 'No new 52-week high recently' },
      { letter: 'N', name: 'New (news catalyst)', pass: recentNewsCount > 5, justification: `${recentNewsCount} news items in the last 30 days` },
      { letter: 'S', name: 'Supply & Demand (volume)', pass: avgVol30 > 0 && currentVol > 1.2 * avgVol30, justification: avgVol30 > 0 ? `Volume at ${(currentVol / avgVol30).toFixed(2)}x 30-day average` : 'Insufficient volume history' },
      { letter: 'L', name: 'Leader (EMA stack)', pass: ema9 != null && ema21 != null && ema50 != null && price > ema9 && price > ema21 && price > ema50, justification: 'Price relative to EMA-9, EMA-21, and EMA-50' },
      { letter: 'I', name: 'Institutional Sponsorship (proxy: SMA200)', pass: sma200 != null && price > sma200, justification: sma200 != null ? `Price ${price > sma200 ? 'above' : 'below'} 200-day SMA` : 'Insufficient history for SMA200' },
      { letter: 'M', name: 'Market Direction (SPY vs SMA50)', pass: spyFavorable === true, justification: spyFavorable == null ? 'SPY data unavailable' : spyFavorable ? 'SPY trading above its 50-day SMA' : 'SPY trading below its 50-day SMA' },
    ];
    const canslimScore = canslim.filter((c) => c.pass).length;

    // Momentum score: weighted average of normalized signals, 1-10
    const rsiNorm = rsi != null ? Math.min(Math.max(rsi / 100, 0), 1) : 0.5;
    const canslimNorm = canslimScore / 7;
    const emaNorm = [ema9, ema21, ema50].filter((e) => e != null && price > e).length / 3;
    const volNorm = relativeVolume != null ? Math.min(relativeVolume / 2, 1) : 0.5;
    const momentumRaw = rsiNorm * 0.3 + canslimNorm * 0.3 + emaNorm * 0.25 + volNorm * 0.15;
    const momentumScore = Math.max(1, Math.min(10, Math.round(momentumRaw * 10)));

    let verdict = 'HOLD';
    if (momentumScore >= 7) verdict = 'BUY';
    else if (momentumScore < 4) verdict = 'AVOID';

    const riskBullets = [];
    if (rsi != null && rsi > 75) riskBullets.push('RSI is in overbought territory, raising pullback risk.');
    if (relativeVolume != null && relativeVolume < 0.8) riskBullets.push('Volume is below average, suggesting weak conviction behind the move.');
    if (spyFavorable === false) riskBullets.push('Broad market (SPY) is below its 50-day SMA, an unfavorable backdrop.');
    if (riskBullets.length === 0) riskBullets.push('No major technical red flags detected, but always size positions to manage risk.');
    while (riskBullets.length < 3) riskBullets.push('Past performance does not guarantee future results — confirm with your own research.');

    res.json({
      symbol,
      quote,
      profile,
      news: Array.isArray(news) ? news.slice(0, 5) : [],
      technical: {
        price,
        high52,
        low52,
        rsi,
        ema9,
        ema21,
        ema50,
        sma50,
        sma200,
        bbUpper,
        bbLower,
        bbPosition,
        vwap,
        relativeVolume,
        marketState: quote.marketState ?? 'CLOSED',
      },
      canslim: { rows: canslim, score: canslimScore, total: 7 },
      momentumScore,
      pattern,
      verdict: {
        signal: verdict,
        confidence: Math.round(momentumRaw * 100),
        rationale: `Momentum score of ${momentumScore}/10 reflects ${rsi != null ? `RSI at ${rsi.toFixed(1)}` : 'mixed RSI signals'} and a CANSLIM pass rate of ${canslimScore}/7. ${verdict === 'BUY' ? 'Technical conditions favor continued upside.' : verdict === 'AVOID' ? 'Multiple technical factors suggest caution here.' : 'Signals are mixed, warranting a wait-and-see approach.'}`,
        riskBullets: riskBullets.slice(0, 3),
      },
    });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
});

router.get('/batch-quotes', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      return res.status(400).json({ error: 'symbols query param is required' });
    }
    const symbolList = symbols.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    const data = await marketData.getMultipleQuotes(symbolList);
    res.json(data);
  } catch (err) {
    console.error('Batch quotes error:', err);
    res.status(500).json({ error: 'Failed to fetch batch quotes' });
  }
});

function lastDefined(arr) {
  if (!arr) return null;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null && arr[i] !== undefined) return arr[i];
  }
  return null;
}

export default router;
