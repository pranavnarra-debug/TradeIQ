/**
 * Technical indicator calculations.
 * All functions are pure and operate on plain arrays of numbers.
 */

/**
 * Simple Moving Average.
 * @param {number[]} values
 * @param {number} period
 * @returns {(number|null)[]} array same length as values; null where not enough data
 */
export function calcSMA(values, period) {
  const out = new Array(values.length).fill(null);
  if (!values || values.length < period) return out;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

/**
 * Exponential Moving Average.
 * @param {number[]} values
 * @param {number} period
 * @returns {(number|null)[]}
 */
export function calcEMA(values, period) {
  const out = new Array(values.length).fill(null);
  if (!values || values.length < period) return out;
  const k = 2 / (period + 1);

  // Seed with SMA of first `period` values
  let seedSum = 0;
  for (let i = 0; i < period; i++) seedSum += values[i];
  let prevEma = seedSum / period;
  out[period - 1] = prevEma;

  for (let i = period; i < values.length; i++) {
    const ema = values[i] * k + prevEma * (1 - k);
    out[i] = ema;
    prevEma = ema;
  }
  return out;
}

/**
 * Relative Strength Index (Wilder's smoothing) for the most recent candle.
 * @param {number[]} closes
 * @param {number} period
 * @returns {number|null}
 */
export function calcRSI(closes, period = 14) {
  if (!closes || closes.length < period + 1) return null;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Bollinger Bands.
 * @param {number[]} closes
 * @param {number} period
 * @param {number} stdDevMult
 * @returns {{upper:(number|null)[], middle:(number|null)[], lower:(number|null)[]}}
 */
export function calcBollingerBands(closes, period = 20, stdDevMult = 2) {
  const middle = calcSMA(closes, period);
  const upper = new Array(closes.length).fill(null);
  const lower = new Array(closes.length).fill(null);

  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = middle[i];
    const variance = slice.reduce((acc, v) => acc + (v - mean) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);
    upper[i] = mean + stdDevMult * stdDev;
    lower[i] = mean - stdDevMult * stdDev;
  }

  return { upper, middle, lower };
}

/**
 * Volume Weighted Average Price across the provided candle set.
 * @param {number[]} highs
 * @param {number[]} lows
 * @param {number[]} closes
 * @param {number[]} volumes
 * @returns {number|null}
 */
export function calcVWAP(highs, lows, closes, volumes) {
  if (!closes || closes.length === 0) return null;
  let cumulativePV = 0;
  let cumulativeVol = 0;
  for (let i = 0; i < closes.length; i++) {
    const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3;
    cumulativePV += typicalPrice * volumes[i];
    cumulativeVol += volumes[i];
  }
  if (cumulativeVol === 0) return null;
  return cumulativePV / cumulativeVol;
}

/**
 * 52-week high/low from a closes array (assumes daily candles, ~252 trading days/year).
 * Uses whatever history is provided, capped at the trailing 252 candles.
 * @param {number[]} closes
 * @returns {{high:number, low:number}}
 */
export function calc52WeekHighLow(closes) {
  if (!closes || closes.length === 0) return { high: null, low: null };
  const window = closes.slice(-252);
  return {
    high: Math.max(...window),
    low: Math.min(...window),
  };
}

/**
 * Average True Range.
 * @param {number[]} highs
 * @param {number[]} lows
 * @param {number[]} closes
 * @param {number} period
 * @returns {number|null}
 */
export function calcATR(highs, lows, closes, period = 14) {
  if (!closes || closes.length < period + 1) return null;

  const trueRanges = [];
  for (let i = 1; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }

  // Wilder smoothing, seeded with simple average of first `period` true ranges
  let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
  }
  return atr;
}

/**
 * Current volume relative to the average of preceding volumes.
 * @param {number[]} volumes
 * @returns {number|null} ratio, e.g. 1.5 = 150% of average prior volume
 */
export function calcRelativeVolume(volumes) {
  if (!volumes || volumes.length < 2) return null;
  const current = volumes[volumes.length - 1];
  const prior = volumes.slice(0, -1);
  const avgPrior = prior.reduce((a, b) => a + b, 0) / prior.length;
  if (avgPrior === 0) return null;
  return current / avgPrior;
}

/**
 * Simple pattern detection from a candle array.
 * Each candle: { date, open, high, low, close, volume }
 * @param {Array<{date:string, open:number, high:number, low:number, close:number, volume:number}>} candles
 * @returns {{pattern: 'uptrend'|'downtrend'|'consolidation'|'breakout'|'none', description: string}}
 */
export function detectPattern(candles) {
  if (!candles || candles.length < 20) {
    return { pattern: 'none', description: 'Not enough price history to detect a pattern.' };
  }

  const closes = candles.map((c) => c.close);
  const last20 = candles.slice(-20);
  const last20Closes = last20.map((c) => c.close);
  const todayClose = closes[closes.length - 1];

  // Breakout: today's close > highest close in prior 20 days (excluding today)
  const prior20Closes = closes.slice(-21, -1);
  if (prior20Closes.length === 20 && todayClose > Math.max(...prior20Closes)) {
    return {
      pattern: 'breakout',
      description: `Price closed at $${todayClose.toFixed(2)}, a new high versus the prior 20 sessions.`,
    };
  }

  // Uptrend: 3 consecutive higher highs
  const last4 = candles.slice(-4);
  if (last4.length === 4) {
    const highs = last4.map((c) => c.high);
    const higherHighs = highs[1] > highs[0] && highs[2] > highs[1] && highs[3] > highs[2];
    if (higherHighs) {
      return {
        pattern: 'uptrend',
        description: 'Three consecutive higher highs indicate an active uptrend.',
      };
    }
    const lows = last4.map((c) => c.low);
    const lowerLows = lows[1] < lows[0] && lows[2] < lows[1] && lows[3] < lows[2];
    if (lowerLows) {
      return {
        pattern: 'downtrend',
        description: 'Three consecutive lower lows indicate an active downtrend.',
      };
    }
  }

  // Consolidation: price range < 5% over last 10 days
  const last10 = candles.slice(-10);
  if (last10.length === 10) {
    const highs10 = last10.map((c) => c.high);
    const lows10 = last10.map((c) => c.low);
    const rangeHigh = Math.max(...highs10);
    const rangeLow = Math.min(...lows10);
    const rangePct = (rangeHigh - rangeLow) / rangeLow;
    if (rangePct < 0.05) {
      return {
        pattern: 'consolidation',
        description: `Price has stayed within a tight ${(rangePct * 100).toFixed(1)}% range over the last 10 sessions.`,
      };
    }
  }

  return {
    pattern: 'none',
    description: 'No clear directional pattern detected in recent price action.',
  };
}
