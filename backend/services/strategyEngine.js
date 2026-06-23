import {
  calcSMA,
  calcEMA,
  calcRSI,
  calcBollingerBands,
  calcVWAP,
  calc52WeekHighLow,
  calcATR,
  calcRelativeVolume,
  detectPattern,
} from './indicators.js';

function last(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[arr.length - 1];
}

function lastDefined(arr) {
  if (!arr) return null;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null && arr[i] !== undefined) return arr[i];
  }
  return null;
}

function buildResult({ signal, rules, stopLoss, takeProfit, entryPrice, reasoning }) {
  const passed = rules.filter((r) => r.passed).length;
  const confidence = Math.round((passed / rules.length) * 100);
  let riskReward = null;
  if (stopLoss != null && takeProfit != null && entryPrice != null) {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    riskReward = risk > 0 ? Math.round((reward / risk) * 100) / 100 : null;
  }
  return {
    signal,
    confidence,
    reasoning,
    rules,
    stopLoss: stopLoss != null ? Math.round(stopLoss * 100) / 100 : null,
    takeProfit: takeProfit != null ? Math.round(takeProfit * 100) / 100 : null,
    riskReward,
  };
}

class StrategyEngine {
  evaluate(strategyId, candles, quote, openPosition = null) {
    if (!candles || candles.length < 25) {
      return buildResult({
        signal: 'HOLD',
        rules: [{ name: 'Sufficient history', passed: false, value: `${candles?.length ?? 0} candles (need 25+)` }],
        stopLoss: null,
        takeProfit: null,
        entryPrice: null,
        reasoning: 'Not enough price history to evaluate this strategy yet.',
      });
    }

    switch (strategyId) {
      case 'canslim':
        return this._canslim(candles, quote, openPosition);
      case 'momentum_breakout':
        return this._momentumBreakout(candles, quote);
      case 'vwap_reversion':
        return this._vwapReversion(candles, quote);
      case 'ema_crossover':
        return this._emaCrossover(candles, quote);
      case 'opening_range_breakout':
        return this._openingRangeBreakout(candles, quote);
      case 'gap_and_go':
        return this._gapAndGo(candles, quote);
      case 'rsi_swing':
        return this._rsiSwing(candles, quote);
      case 'bollinger_squeeze':
        return this._bollingerSqueeze(candles, quote);
      default:
        throw new Error(`Unknown strategy: ${strategyId}`);
    }
  }

  // --- STRATEGY 1: CANSLIM ---
  _canslim(candles, quote, openPosition) {
    const closes = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);
    const price = quote?.price ?? last(closes);

    const sma50 = lastDefined(calcSMA(closes, 50));
    const sma200 = lastDefined(calcSMA(closes, 200));
    const rsi = calcRSI(closes, 14);
    const { high: high52 } = calc52WeekHighLow(closes);
    const recentWindow = closes.slice(-60);
    const newHigh60 = recentWindow.length > 0 && Math.max(...recentWindow) >= high52 * 0.995;
    const avgVol30 = volumes.slice(-31, -1).reduce((a, b) => a + b, 0) / Math.max(volumes.slice(-31, -1).length, 1);
    const currentVol = last(volumes);
    const volSurge = avgVol30 > 0 && currentVol > 1.3 * avgVol30;

    const rules = [
      { name: 'Price > SMA50', passed: sma50 != null && price > sma50, value: sma50 != null ? `$${price.toFixed(2)} vs $${sma50.toFixed(2)}` : 'n/a' },
      { name: 'RSI between 50-70', passed: rsi != null && rsi >= 50 && rsi <= 70, value: rsi != null ? rsi.toFixed(1) : 'n/a' },
      { name: 'New 52-week high (last 60d)', passed: newHigh60, value: newHigh60 ? 'Yes' : 'No' },
      { name: 'Volume > 1.3x 30-day avg', passed: volSurge, value: avgVol30 > 0 ? `${(currentVol / avgVol30).toFixed(2)}x` : 'n/a' },
      { name: 'Price > SMA200', passed: sma200 != null && price > sma200, value: sma200 != null ? `$${price.toFixed(2)} vs $${sma200.toFixed(2)}` : 'n/a' },
    ];

    const passed = rules.filter((r) => r.passed).length;
    const confidencePct = (passed / rules.length) * 100;

    let signal = 'HOLD';
    let entryPrice = price;
    let stopLoss = price * 0.92;
    let takeProfit = price * 1.2;

    if (openPosition) {
      entryPrice = openPosition.entry_price ?? openPosition.entryPrice ?? price;
      stopLoss = entryPrice * 0.92;
      takeProfit = entryPrice * 1.2;
      const droppedStop = price <= stopLoss;
      const overbought = rsi != null && rsi > 80;
      if (droppedStop || overbought) {
        signal = 'SELL';
      } else {
        signal = 'HOLD';
      }
    } else if (confidencePct >= 60) {
      signal = 'BUY';
    }

    const reasoning =
      `CANSLIM: ${passed}/5 rules met. Price ${price > (sma50 ?? Infinity) ? 'above' : 'below'} 50-day SMA at $${sma50 != null ? sma50.toFixed(2) : 'n/a'}. ` +
      `RSI at ${rsi != null ? rsi.toFixed(1) : 'n/a'}. Volume ${volSurge ? 'surging' : 'normal'}. ` +
      `${price > (sma200 ?? Infinity) ? 'Above' : 'Below'} 200-day SMA.`;

    return buildResult({ signal, rules, stopLoss, takeProfit, entryPrice: price, reasoning });
  }

  // --- STRATEGY 2: Momentum Breakout ---
  _momentumBreakout(candles, quote) {
    const closes = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);
    const price = quote?.price ?? last(closes);

    const last20Closes = closes.slice(-21, -1);
    const high20 = last20Closes.length > 0 ? Math.max(...last20Closes) : null;
    const breakout = high20 != null && price > high20;

    const avgVol20 = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / Math.max(volumes.slice(-21, -1).length, 1);
    const currentVol = last(volumes);
    const volConfirm = avgVol20 > 0 && currentVol > 1.5 * avgVol20;

    const sma20 = lastDefined(calcSMA(closes, 20));
    const rsi = calcRSI(closes, 14);

    const rules = [
      { name: 'Breakout above 20d high', passed: breakout, value: high20 != null ? `$${price.toFixed(2)} vs $${high20.toFixed(2)}` : 'n/a' },
      { name: 'Volume > 1.5x 20d avg', passed: volConfirm, value: avgVol20 > 0 ? `${(currentVol / avgVol20).toFixed(2)}x` : 'n/a' },
      { name: 'Price > SMA20', passed: sma20 != null && price > sma20, value: sma20 != null ? `$${price.toFixed(2)} vs $${sma20.toFixed(2)}` : 'n/a' },
      { name: 'RSI > 50', passed: rsi != null && rsi > 50, value: rsi != null ? rsi.toFixed(1) : 'n/a' },
    ];

    const passed = rules.filter((r) => r.passed).length;
    const confidencePct = (passed / rules.length) * 100;
    const signal = confidencePct >= 75 && breakout ? 'BUY' : confidencePct < 50 ? 'SELL' : 'HOLD';

    const last5Low = Math.min(...candles.slice(-5).map((c) => c.low));
    const stopLoss = last5Low;
    const takeProfit = high20 != null ? price + 2 * (price - high20) : price * 1.1;

    const reasoning = `Momentum Breakout: Price broke above $${high20 != null ? high20.toFixed(2) : 'n/a'} resistance. Volume confirmation ${volConfirm ? 'present' : 'absent'}. RSI at ${rsi != null ? rsi.toFixed(1) : 'n/a'}.`;

    return buildResult({ signal, rules, stopLoss, takeProfit, entryPrice: price, reasoning });
  }

  // --- STRATEGY 3: VWAP Mean Reversion ---
  _vwapReversion(candles, quote) {
    const closes = candles.map((c) => c.close);
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const volumes = candles.map((c) => c.volume);
    const price = quote?.price ?? last(closes);

    const vwap = calcVWAP(highs, lows, closes, volumes);
    const rsi = calcRSI(closes, 14);
    const sma50 = lastDefined(calcSMA(closes, 50));
    const pattern = detectPattern(candles);

    const belowVwap = vwap != null && price < vwap * 0.985;
    const oversold = rsi != null && rsi < 40;
    const uptrendFilter = sma50 != null && price > sma50;
    const noDowntrend = pattern.pattern !== 'downtrend';

    const rules = [
      { name: 'Price < 98.5% of VWAP', passed: belowVwap, value: vwap != null ? `$${price.toFixed(2)} vs VWAP $${vwap.toFixed(2)}` : 'n/a' },
      { name: 'RSI < 40', passed: oversold, value: rsi != null ? rsi.toFixed(1) : 'n/a' },
      { name: 'Price > SMA50 (uptrend filter)', passed: uptrendFilter, value: sma50 != null ? `$${price.toFixed(2)} vs $${sma50.toFixed(2)}` : 'n/a' },
      { name: 'No downtrend detected', passed: noDowntrend, value: pattern.pattern },
    ];

    const passed = rules.filter((r) => r.passed).length;
    const confidencePct = (passed / rules.length) * 100;
    const recoveredToVwap = vwap != null && price >= vwap;
    const signal = belowVwap && oversold && confidencePct >= 75 ? 'BUY' : recoveredToVwap ? 'SELL' : 'HOLD';

    const stopLoss = price * 0.98;
    const takeProfit = vwap ?? price * 1.02;
    const pctBelow = vwap != null ? (((vwap - price) / vwap) * 100).toFixed(1) : 'n/a';

    const reasoning = `VWAP Mean Reversion: Price $${price.toFixed(2)} is ${pctBelow}% below VWAP ($${vwap != null ? vwap.toFixed(2) : 'n/a'}). RSI oversold at ${rsi != null ? rsi.toFixed(1) : 'n/a'}. Looking for snap-back.`;

    return buildResult({ signal, rules, stopLoss, takeProfit, entryPrice: price, reasoning });
  }

  // --- STRATEGY 4: EMA Crossover ---
  _emaCrossover(candles, quote) {
    const closes = candles.map((c) => c.close);
    const price = quote?.price ?? last(closes);

    const ema9Arr = calcEMA(closes, 9);
    const ema21Arr = calcEMA(closes, 21);
    const ema50Arr = calcEMA(closes, 50);
    const ema9 = lastDefined(ema9Arr);
    const ema21 = lastDefined(ema21Arr);
    const ema50 = lastDefined(ema50Arr);
    const rsi = calcRSI(closes, 14);
    const prevClose = closes[closes.length - 2];

    // Detect bullish cross in the last 3 candles: ema9 crossed above ema21
    let bullishCross = false;
    let daysAgo = null;
    for (let i = 1; i <= 3; i++) {
      const idx = ema9Arr.length - 1 - i;
      const idxPrev = idx - 1;
      if (idx < 1 || ema9Arr[idx] == null || ema21Arr[idx] == null || ema9Arr[idxPrev] == null || ema21Arr[idxPrev] == null) continue;
      if (ema9Arr[idxPrev] <= ema21Arr[idxPrev] && ema9Arr[idx] > ema21Arr[idx]) {
        bullishCross = true;
        daysAgo = i;
      }
    }
    // Also check "today" relative to yesterday
    const n = ema9Arr.length;
    if (!bullishCross && n >= 2 && ema9Arr[n - 2] != null && ema21Arr[n - 2] != null && ema9Arr[n - 2] <= ema21Arr[n - 2] && ema9 > ema21) {
      bullishCross = true;
      daysAgo = 0;
    }
    const currentlyAbove = ema9 != null && ema21 != null && ema9 > ema21;

    const stacked = ema21 != null && ema50 != null && ema21 > ema50;
    const rsiInRange = rsi != null && rsi >= 45 && rsi <= 75;
    const priceUp = prevClose != null && price > prevClose;

    const rules = [
      { name: 'EMA9 > EMA21 (recent cross)', passed: bullishCross || currentlyAbove, value: ema9 != null && ema21 != null ? `${ema9.toFixed(2)} vs ${ema21.toFixed(2)}` : 'n/a' },
      { name: 'Price > EMA50', passed: ema50 != null && price > ema50, value: ema50 != null ? `$${price.toFixed(2)} vs $${ema50.toFixed(2)}` : 'n/a' },
      { name: 'EMA21 > EMA50 (stacked)', passed: stacked, value: ema21 != null && ema50 != null ? `${ema21.toFixed(2)} vs ${ema50.toFixed(2)}` : 'n/a' },
      { name: 'RSI between 45-75', passed: rsiInRange, value: rsi != null ? rsi.toFixed(1) : 'n/a' },
      { name: 'Price > previous close', passed: priceUp, value: prevClose != null ? `$${price.toFixed(2)} vs $${prevClose.toFixed(2)}` : 'n/a' },
    ];

    const passed = rules.filter((r) => r.passed).length;
    const confidencePct = (passed / rules.length) * 100;
    const signal = confidencePct >= 60 && (bullishCross || currentlyAbove) ? 'BUY' : ema9 != null && ema21 != null && ema9 < ema21 ? 'SELL' : 'HOLD';

    const stopLoss = ema21 ?? price * 0.95;
    const takeProfit = ema9 != null && ema21 != null ? price + 3 * (ema9 - ema21) : price * 1.05;

    const reasoning = `EMA Crossover: 9-EMA ($${ema9 != null ? ema9.toFixed(2) : 'n/a'}) crossed above 21-EMA ($${ema21 != null ? ema21.toFixed(2) : 'n/a'}) ${daysAgo != null ? `${daysAgo} days ago` : 'recently'}. ${stacked ? 'All' : 'Partial'} EMAs stacked bullishly.`;

    return buildResult({ signal, rules, stopLoss, takeProfit, entryPrice: price, reasoning });
  }

  // --- STRATEGY 5: Opening Range Breakout ---
  _openingRangeBreakout(candles, quote) {
    const closes = candles.map((c) => c.close);
    const price = quote?.price ?? last(closes);
    const firstCandle = candles[0];
    const openingHigh = firstCandle.high;
    const openingLow = firstCandle.low;
    const openingSize = openingHigh - openingLow;
    const openingVolume = firstCandle.volume;
    const breakoutCandleVolume = last(candles.map((c) => c.volume));

    const sma20 = lastDefined(calcSMA(closes, 20));
    const rsi = calcRSI(closes, 14);

    const brokeAbove = price > openingHigh * 1.003;
    const volConfirm = openingVolume > 0 && breakoutCandleVolume > 1.2 * openingVolume;
    const uptrend = sma20 != null && price > sma20;
    const notOverbought = rsi != null && rsi < 75;

    const rules = [
      { name: 'Price > opening high + 0.3%', passed: brokeAbove, value: `$${price.toFixed(2)} vs $${(openingHigh * 1.003).toFixed(2)}` },
      { name: 'Breakout volume > 1.2x opening volume', passed: volConfirm, value: openingVolume > 0 ? `${(breakoutCandleVolume / openingVolume).toFixed(2)}x` : 'n/a' },
      { name: 'Overall uptrend (price > SMA20)', passed: uptrend, value: sma20 != null ? `$${price.toFixed(2)} vs $${sma20.toFixed(2)}` : 'n/a' },
      { name: 'RSI < 75 (not overbought)', passed: notOverbought, value: rsi != null ? rsi.toFixed(1) : 'n/a' },
    ];

    const passed = rules.filter((r) => r.passed).length;
    const confidencePct = (passed / rules.length) * 100;
    const signal = confidencePct >= 75 && brokeAbove ? 'BUY' : price < openingLow ? 'SELL' : 'HOLD';

    const stopLoss = openingLow;
    const takeProfit = openingLow + 2 * openingSize;

    const reasoning = `ORB: Price broke above opening range high of $${openingHigh.toFixed(2)}. Volume ${volConfirm ? 'confirming' : 'weak'}. Target: $${takeProfit.toFixed(2)}.`;

    return buildResult({ signal, rules, stopLoss, takeProfit, entryPrice: price, reasoning });
  }

  // --- STRATEGY 6: Gap and Go ---
  _gapAndGo(candles, quote) {
    const closes = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);
    const price = quote?.price ?? last(closes);

    const today = candles[candles.length - 1];
    const yesterday = candles[candles.length - 2];
    const gapUp = today.open > yesterday.close * 1.015;
    const gapPct = ((today.open - yesterday.close) / yesterday.close) * 100;

    const holdingAboveOpen = price >= today.open * 0.995;

    const avgVol20 = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / Math.max(volumes.slice(-21, -1).length, 1);
    const currentVol = last(volumes);
    const momentum = avgVol20 > 0 && currentVol > 2 * avgVol20;

    const sma20 = lastDefined(calcSMA(closes, 20));
    const aboveSma20 = sma20 != null && price > sma20;

    const rules = [
      { name: 'Gap up > 1.5%', passed: gapUp, value: `${gapPct.toFixed(2)}%` },
      { name: 'Holding above gap open (no fill-back)', passed: holdingAboveOpen, value: `$${price.toFixed(2)} vs open $${today.open.toFixed(2)}` },
      { name: 'Volume > 2x 20d avg', passed: momentum, value: avgVol20 > 0 ? `${(currentVol / avgVol20).toFixed(2)}x` : 'n/a' },
      { name: 'Price > SMA20', passed: aboveSma20, value: sma20 != null ? `$${price.toFixed(2)} vs $${sma20.toFixed(2)}` : 'n/a' },
    ];

    const passed = rules.filter((r) => r.passed).length;
    const confidencePct = (passed / rules.length) * 100;
    const signal = confidencePct >= 75 && gapUp && holdingAboveOpen ? 'BUY' : !holdingAboveOpen ? 'SELL' : 'HOLD';

    const stopLoss = price * 0.98; // trailing 2% below current price
    const takeProfit = today.open * 1.03;

    const reasoning = `Gap & Go: Stock gapped up $${(today.open - yesterday.close).toFixed(2)} (${gapPct.toFixed(2)}%) from yesterday's close of $${yesterday.close.toFixed(2)}. Gap ${holdingAboveOpen ? 'holding' : 'filling'}. Volume ${momentum ? 'strong' : 'weak'}.`;

    return buildResult({ signal, rules, stopLoss, takeProfit, entryPrice: price, reasoning });
  }

  // --- STRATEGY 7: RSI Swing ---
  _rsiSwing(candles, quote) {
    const closes = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);
    const price = quote?.price ?? last(closes);

    const rsi = calcRSI(closes, 14);
    const sma200 = lastDefined(calcSMA(closes, 200));
    const sma50 = lastDefined(calcSMA(closes, 50));

    const prevCandle = candles[candles.length - 2];
    const reversalCandle = prevCandle != null && prevCandle.close > prevCandle.open;

    const avgVol20 = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / Math.max(volumes.slice(-21, -1).length, 1);
    const currentVol = last(volumes);
    const volAboveAvg = avgVol20 > 0 && currentVol > avgVol20;

    const oversold = rsi != null && rsi < 30;
    const longTermUp = sma200 != null && price > sma200;
    const mediumTermUp = sma50 != null && price > sma50;

    const rules = [
      { name: 'RSI(14) < 30 (oversold)', passed: oversold, value: rsi != null ? rsi.toFixed(1) : 'n/a' },
      { name: 'Price > SMA200 (long-term uptrend)', passed: longTermUp, value: sma200 != null ? `$${price.toFixed(2)} vs $${sma200.toFixed(2)}` : 'n/a' },
      { name: 'Price > SMA50 (medium-term)', passed: mediumTermUp, value: sma50 != null ? `$${price.toFixed(2)} vs $${sma50.toFixed(2)}` : 'n/a' },
      { name: 'Previous candle is a reversal candle', passed: reversalCandle, value: prevCandle != null ? `close $${prevCandle.close.toFixed(2)} vs open $${prevCandle.open.toFixed(2)}` : 'n/a' },
      { name: 'Volume above 20d average', passed: volAboveAvg, value: avgVol20 > 0 ? `${(currentVol / avgVol20).toFixed(2)}x` : 'n/a' },
    ];

    const passed = rules.filter((r) => r.passed).length;
    const confidencePct = (passed / rules.length) * 100;
    const recovered = rsi != null && rsi >= 50;
    const signal = confidencePct >= 60 && oversold ? 'BUY' : recovered ? 'SELL' : 'HOLD';

    const stopLoss = price * 0.95;
    const takeProfit = price * 1.08;

    const reasoning = `RSI Swing: RSI at ${rsi != null ? rsi.toFixed(1) : 'n/a'} (oversold). Price is ${sma200 != null ? (price > sma200 ? 'above' : 'below') : 'n/a relative to'} the 200-day SMA at $${sma200 != null ? sma200.toFixed(2) : 'n/a'}. Reversal candle ${reversalCandle ? 'present' : 'absent'}. Looking for bounce.`;

    return buildResult({ signal, rules, stopLoss, takeProfit, entryPrice: price, reasoning });
  }

  // --- STRATEGY 8: Bollinger Squeeze ---
  _bollingerSqueeze(candles, quote) {
    const closes = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);
    const price = quote?.price ?? last(closes);

    const bb = calcBollingerBands(closes, 20, 2);
    const upper = lastDefined(bb.upper);
    const middle = lastDefined(bb.middle);
    const lower = lastDefined(bb.lower);
    const bandWidth = upper != null && lower != null && middle ? (upper - lower) / middle : null;

    const squeeze = bandWidth != null && bandWidth < 0.1;
    const breakingAbove = upper != null && price > upper;

    const avgVol20 = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / Math.max(volumes.slice(-21, -1).length, 1);
    const currentVol = last(volumes);
    const volAboveAvg = avgVol20 > 0 && currentVol > avgVol20;

    const rsi = calcRSI(closes, 14);
    const bullishMomentum = rsi != null && rsi > 50;

    const sma20 = lastDefined(calcSMA(closes, 20));
    const aboveSma20 = sma20 != null && price > sma20;

    const rules = [
      { name: 'Band width < 10% (squeeze)', passed: squeeze, value: bandWidth != null ? `${(bandWidth * 100).toFixed(1)}%` : 'n/a' },
      { name: 'Price breaking above upper band', passed: breakingAbove, value: upper != null ? `$${price.toFixed(2)} vs $${upper.toFixed(2)}` : 'n/a' },
      { name: 'Volume above 20d average', passed: volAboveAvg, value: avgVol20 > 0 ? `${(currentVol / avgVol20).toFixed(2)}x` : 'n/a' },
      { name: 'RSI > 50 (bullish momentum)', passed: bullishMomentum, value: rsi != null ? rsi.toFixed(1) : 'n/a' },
      { name: 'Price > SMA20', passed: aboveSma20, value: sma20 != null ? `$${price.toFixed(2)} vs $${sma20.toFixed(2)}` : 'n/a' },
    ];

    const passed = rules.filter((r) => r.passed).length;
    const confidencePct = (passed / rules.length) * 100;
    const backInsideBands = upper != null && price < upper;
    const signal = confidencePct >= 60 && breakingAbove ? 'BUY' : backInsideBands && !squeeze ? 'SELL' : 'HOLD';

    const bandWidthAbs = upper != null && lower != null ? upper - lower : price * 0.05;
    const stopLoss = middle ?? price * 0.97;
    const takeProfit = upper != null ? upper + bandWidthAbs * 2 : price * 1.06;

    const reasoning = `BB Squeeze: Bands narrowed to ${bandWidth != null ? (bandWidth * 100).toFixed(1) : 'n/a'}% width. Price ${breakingAbove ? 'breaking out' : 'building pressure'}. RSI at ${rsi != null ? rsi.toFixed(1) : 'n/a'}.`;

    return buildResult({ signal, rules, stopLoss, takeProfit, entryPrice: price, reasoning });
  }
}

export default new StrategyEngine();

export const STRATEGY_LIST = [
  { id: 'canslim', name: 'CANSLIM', description: "O'Neil's growth-stock screen: trend, strength, and volume confirmation." },
  { id: 'momentum_breakout', name: 'Momentum Breakout', description: 'Buys confirmed breakouts above recent resistance with volume support.' },
  { id: 'vwap_reversion', name: 'VWAP Mean Reversion', description: 'Buys oversold dips below VWAP within an established uptrend.' },
  { id: 'ema_crossover', name: 'EMA Crossover', description: 'Trades bullish crosses of the 9/21/50 EMA stack.' },
  { id: 'opening_range_breakout', name: 'Opening Range Breakout', description: "Buys breaks above the day's opening range with volume." },
  { id: 'gap_and_go', name: 'Gap and Go', description: 'Trades stocks gapping up on strong volume that hold their gap.' },
  { id: 'rsi_swing', name: 'RSI Swing', description: 'Buys oversold RSI dips within a longer-term uptrend.' },
  { id: 'bollinger_squeeze', name: 'Bollinger Squeeze', description: 'Trades volatility expansion breakouts after a low-volatility squeeze.' },
];
