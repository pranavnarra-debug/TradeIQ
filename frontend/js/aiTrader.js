/* ============================================================
   TradeIQ — aiTrader.js
   AI Trader section: autonomous strategy execution + visualization
   ============================================================ */

const AiTraderSection = (() => {
  const TICKERS = ['AAPL', 'NVDA', 'TSLA', 'AMZN', 'META', 'MSFT', 'GOOGL', 'JPM', 'SPY', 'QQQ'];
  const POLL_INTERVAL_S = 15;
  const LONG_TERM_POLL_INTERVAL_S = 300; // long-term fundamentals don't change minute to minute
  const CONFIDENCE_THRESHOLD = 65;
  const STYLE_LABELS = { day: 'Day trading', swing: 'Swing trading', long_term: 'Long-term investing' };

  let state = {
    portfolioId: null,
    strategy: 'momentum_breakout',
    strategies: [],
    ticker: 'AAPL',
    period: '3mo',
    running: false,
    pollTimer: null,
    countdownTimer: null,
    secondsLeft: POLL_INTERVAL_S,
    chartInstance: null,
    tradeMarkers: [],
    lastResult: null,
  };

  function currentStrategyMeta() {
    return state.strategies.find((s) => s.id === state.strategy) || {};
  }
  function isLongTerm() {
    return currentStrategyMeta().style === 'long_term';
  }
  function pollIntervalSeconds() {
    return isLongTerm() ? LONG_TERM_POLL_INTERVAL_S : POLL_INTERVAL_S;
  }

  function fmt(n, decimals = 2) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function fmtMoney(n) {
    if (n == null || isNaN(n)) return '—';
    const sign = n < 0 ? '-' : '';
    return `${sign}$${fmt(Math.abs(n))}`;
  }

  function strategyOptionsHtml() {
    const byStyle = { day: [], swing: [], long_term: [] };
    state.strategies.forEach((s) => { if (byStyle[s.style]) byStyle[s.style].push(s); });
    return Object.entries(byStyle)
      .filter(([, list]) => list.length > 0)
      .map(([style, list]) => `
        <optgroup label="${STYLE_LABELS[style] || style}">
          ${list.map((s) => `<option value="${s.id}" ${s.id === state.strategy ? 'selected' : ''}>${s.name}</option>`).join('')}
        </optgroup>
      `).join('');
  }
  function tickerOptionsHtml() {
    return TICKERS.map((t) => `<option value="${t}" ${t === state.ticker ? 'selected' : ''}>${t}</option>`).join('');
  }

  async function render(portfolioId, params) {
    state.portfolioId = portfolioId;
    if (params && params.strategy) {
      state.strategy = params.strategy;
    }

    const content = document.getElementById('content-area');
    content.innerHTML = `<div class="empty-state"><span class="spinner"></span> Loading...</div>`;

    try {
      const data = await api.get('/market/strategies');
      state.strategies = data.strategies || [];
    } catch (err) {
      console.error('Failed to load strategy list:', err);
      state.strategies = [];
    }

    content.innerHTML = `
      <div class="controls-row">
        <select class="input" id="ai-strategy-select">${strategyOptionsHtml()}</select>
        <select class="input" id="ai-ticker-select">${tickerOptionsHtml()}</select>
        <button class="btn btn-green ai-toggle-btn" id="ai-toggle-btn"><i class="fa-solid fa-play"></i> Start AI</button>
        <span class="countdown-indicator" id="ai-countdown"></span>
      </div>
      <div class="text-dim" id="ai-style-note" style="font-size:12.5px;margin:-6px 0 14px;"></div>

      <div class="trading-layout">
        <div class="card">
          <div class="card-title">Price Chart — <span id="chart-ticker-label">${state.ticker}</span></div>
          <div class="chart-wrap"><canvas id="ai-price-chart"></canvas></div>
          <div class="period-toggle-row">
            ${['1M', '3M', '6M', '1Y'].map((p) => `<button class="period-btn ${p === '3M' ? 'active' : ''}" data-period="${p}">${p}</button>`).join('')}
          </div>
        </div>

        <div>
          <div class="card" style="margin-bottom: 16px;">
            <div class="thought-panel-header">
              <span class="strategy-name" id="ai-strategy-name">${currentStrategyMeta().name || ''}</span>
              <span class="badge badge-hold" id="ai-signal-badge">HOLD</span>
            </div>
            <div class="confidence-bar-wrap">
              <div class="confidence-bar-label"><span>Confidence</span><span id="ai-confidence-pct">0%</span></div>
              <div class="confidence-bar-track"><div class="confidence-bar-fill" id="ai-confidence-fill" style="width:0%;"></div></div>
            </div>
            <div class="rules-checklist" id="ai-rules-checklist">
              <div class="empty-state">Start the AI to see live signal analysis.</div>
            </div>
            <div class="reasoning-box" id="ai-reasoning-box">Waiting for analysis...</div>
            <div class="position-status-row">
              <span class="text-dim">Position</span>
              <span id="ai-position-status">FLAT</span>
            </div>
            <div class="risk-reward-row" id="ai-risk-reward">
              Stop: — &nbsp;|&nbsp; Target: — &nbsp;|&nbsp; R:R —
            </div>
          </div>

          <div class="card" id="ai-portfolio-summary">
            <div class="card-title">AI Portfolio</div>
            <div class="empty-state">Loading...</div>
          </div>
        </div>
      </div>

      <div class="card section-spacer">
        <div class="card-title">AI Trade Log</div>
        <div style="max-height: 320px; overflow-y: auto;">
          <table>
            <thead><tr><th>Time</th><th>Ticker</th><th>Strategy</th><th>Action</th><th>Price</th><th>Qty</th><th>Reasoning</th><th>P&L</th></tr></thead>
            <tbody id="ai-trade-log-body"><tr><td colspan="8" class="empty-state">No trades yet</td></tr></tbody>
          </table>
        </div>
      </div>
    `;

    updateStyleNote();

    document.getElementById('ai-strategy-select').addEventListener('change', (e) => {
      state.strategy = e.target.value;
      document.getElementById('ai-strategy-name').textContent = currentStrategyMeta().name || '';
      updateStyleNote();
      refreshSignal();
      if (state.running) {
        stopPolling();
        startPolling();
      }
    });
    document.getElementById('ai-ticker-select').addEventListener('change', async (e) => {
      state.ticker = e.target.value;
      document.getElementById('chart-ticker-label').textContent = state.ticker;
      await loadChart();
      refreshSignal();
    });
    document.querySelectorAll('.period-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('.period-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const map = { '1M': '1mo', '3M': '3mo', '6M': '6mo', '1Y': '1y' };
        state.period = map[btn.dataset.period];
        await loadChart();
      });
    });
    document.getElementById('ai-toggle-btn').addEventListener('click', toggleAi);

    await Promise.all([loadChart(), refreshSignal(), loadPortfolioSummary(), loadTradeLog()]);
  }

  async function loadChart() {
    try {
      const candles = await api.get(`/market/candles/${state.ticker}?period=${state.period}&interval=1d`);
      if (!Array.isArray(candles) || candles.length === 0) return;

      const closes = candles.map((c) => c.close);
      const ema9 = calcEmaLocal(closes, 9);
      const ema21 = calcEmaLocal(closes, 21);
      const ema50 = calcEmaLocal(closes, 50);

      ChartHelpers.destroyIfExists(state.chartInstance);
      const canvas = document.getElementById('ai-price-chart');
      if (!canvas) return;
      state.chartInstance = ChartHelpers.buildPriceChart(canvas, candles, { ema9, ema21, ema50 }, state.tradeMarkers);
    } catch (err) {
      console.error('Failed to load chart:', err);
    }
  }

  // Lightweight client-side EMA for chart overlay only (server is authoritative for strategy decisions)
  function calcEmaLocal(values, period) {
    const out = new Array(values.length).fill(null);
    if (values.length < period) return out;
    const k = 2 / (period + 1);
    let seedSum = 0;
    for (let i = 0; i < period; i++) seedSum += values[i];
    let prev = seedSum / period;
    out[period - 1] = prev;
    for (let i = period; i < values.length; i++) {
      prev = values[i] * k + prev * (1 - k);
      out[i] = prev;
    }
    return out;
  }

  function renderRulesChecklist(rules) {
    const el = document.getElementById('ai-rules-checklist');
    if (!el) return;
    if (!rules || rules.length === 0) {
      el.innerHTML = '<div class="empty-state">No rule data</div>';
      return;
    }
    el.innerHTML = rules.map((r) => `
      <div class="rule-row">
        <i class="fa-solid ${r.passed ? 'fa-check rule-icon pass' : 'fa-xmark rule-icon fail'}"></i>
        <span class="rule-name">${r.name}</span>
        <span class="rule-value">${r.value}</span>
      </div>
    `).join('');
  }

  function renderSignalBadge(signal) {
    const el = document.getElementById('ai-signal-badge');
    if (!el) return;
    el.className = `badge ${signal === 'BUY' ? 'badge-buy' : signal === 'SELL' ? 'badge-sell' : 'badge-hold'}`;
    el.textContent = signal;
  }

  function renderConfidence(confidence) {
    const fill = document.getElementById('ai-confidence-fill');
    const pct = document.getElementById('ai-confidence-pct');
    if (!fill || !pct) return;
    pct.textContent = `${confidence}%`;
    fill.style.width = `${confidence}%`;
    let color = '#f85149';
    if (confidence >= 65) color = '#3fb950';
    else if (confidence >= 40) color = '#d29922';
    fill.style.background = color;
  }

  async function refreshSignal() {
    try {
      const result = await api.get(`/market/strategy/${state.ticker}?strategy=${state.strategy}`);
      state.lastResult = result;
      renderSignalBadge(result.signal);
      renderConfidence(result.confidence);
      renderRulesChecklist(result.rules);
      document.getElementById('ai-reasoning-box').textContent = result.reasoning;
      document.getElementById('ai-risk-reward').innerHTML =
        `Stop: <strong>${fmtMoney(result.stopLoss)}</strong> &nbsp;|&nbsp; Target: <strong>${fmtMoney(result.takeProfit)}</strong> &nbsp;|&nbsp; R:R <strong>1:${result.riskReward ?? '—'}</strong>`;

      if (state.running) {
        await maybeAutoTrade(result);
      }
    } catch (err) {
      console.error('Failed to refresh signal:', err);
    }
  }

  async function maybeAutoTrade(result) {
    if (!state.portfolioId) return;
    try {
      const positions = await api.get(`/portfolio/${state.portfolioId}/positions`);
      const openPos = positions.find((p) => p.symbol === state.ticker);
      const longTerm = isLongTerm();
      // Long-term conviction buys use a larger notional sizing than quick swing/day entries,
      // since this represents a real buy-and-hold position rather than a short-term trade.
      const notional = longTerm ? 5000 : 2000;
      // Long-term holds shouldn't flip to SELL on a single weak reading the way a day
      // trade would — require a confidently bad fundamentals read (signal SELL AND low
      // confidence in the BUY case means the thesis has clearly broken) before exiting.
      const shouldExitLongTerm = longTerm && result.signal === 'SELL' && result.confidence < 30;

      if (!openPos && result.signal === 'BUY' && result.confidence > CONFIDENCE_THRESHOLD) {
        const quote = await api.get(`/market/quote/${state.ticker}`);
        const qty = Math.max(1, Math.floor(notional / quote.price));
        await api.post(`/portfolio/${state.portfolioId}/trade`, {
          symbol: state.ticker, action: 'BUY', quantity: qty, orderType: 'market',
          strategy: state.strategy, reasoning: result.reasoning,
        });
        document.getElementById('ai-position-status').innerHTML = `<span class="text-green">LONG since just now</span>`;
        await loadTradeLog();
        await loadPortfolioSummary();
        await loadChart();
      } else if (openPos && (longTerm ? shouldExitLongTerm : result.signal === 'SELL')) {
        await api.post(`/portfolio/${state.portfolioId}/close/${openPos.id}`, {});
        document.getElementById('ai-position-status').textContent = 'FLAT';
        await loadTradeLog();
        await loadPortfolioSummary();
        await loadChart();
      } else if (openPos) {
        const pnl = openPos.unrealizedPnl;
        document.getElementById('ai-position-status').innerHTML =
          `<span class="${pnl >= 0 ? 'text-green' : 'text-red'}">LONG · P&L: ${fmtMoney(pnl)}</span>`;
      }
    } catch (err) {
      console.error('Auto-trade error:', err);
    }
  }

  async function loadPortfolioSummary() {
    if (!state.portfolioId) return;
    try {
      const stats = await api.get(`/portfolio/${state.portfolioId}/stats`);
      const el = document.getElementById('ai-portfolio-summary');
      if (!el) return;
      el.innerHTML = `
        <div class="card-title">AI Portfolio</div>
        <div class="stats-bar" style="padding: 0; flex-direction: column; gap: 10px;">
          <div class="flex-between"><span class="text-dim">Starting Capital</span><strong>${fmtMoney(stats.startingCapital)}</strong></div>
          <div class="flex-between"><span class="text-dim">Equity</span><strong>${fmtMoney(stats.equity)}</strong></div>
          <div class="flex-between"><span class="text-dim">Cash</span><strong>${fmtMoney(stats.cash)}</strong></div>
          <div class="flex-between"><span class="text-dim">Unrealized P&L</span><strong class="${stats.unrealizedPnl >= 0 ? 'text-green' : 'text-red'}">${fmtMoney(stats.unrealizedPnl)}</strong></div>
          <div class="flex-between"><span class="text-dim">Realized P&L</span><strong class="${stats.realizedPnl >= 0 ? 'text-green' : 'text-red'}">${fmtMoney(stats.realizedPnl)}</strong></div>
          <div class="flex-between"><span class="text-dim">Win Rate</span><strong>${fmt(stats.winRate, 1)}%</strong></div>
          <div class="flex-between"><span class="text-dim">Total Trades</span><strong>${stats.totalTrades}</strong></div>
          <div class="flex-between"><span class="text-dim">Best Trade</span><strong class="text-green">${stats.bestTrade ? fmtMoney(stats.bestTrade.realized_pnl) : '—'}</strong></div>
          <div class="flex-between"><span class="text-dim">Worst Trade</span><strong class="text-red">${stats.worstTrade ? fmtMoney(stats.worstTrade.realized_pnl) : '—'}</strong></div>
        </div>
      `;
    } catch (err) {
      console.error('Failed to load AI portfolio summary:', err);
    }
  }

  async function loadTradeLog() {
    if (!state.portfolioId) return;
    try {
      const history = await api.get(`/portfolio/${state.portfolioId}/history`);
      const body = document.getElementById('ai-trade-log-body');
      if (!body) return;
      if (!history || history.length === 0) {
        body.innerHTML = '<tr><td colspan="8" class="empty-state">No trades yet</td></tr>';
        return;
      }
      body.innerHTML = history.slice(0, 20).map((t) => `
        <tr>
          <td>${new Date(t.executed_at).toLocaleString()}</td>
          <td>${t.symbol}</td>
          <td>${t.strategy || '—'}</td>
          <td><span class="badge ${t.action === 'BUY' ? 'badge-buy' : 'badge-sell'}">${t.action}</span></td>
          <td>${fmtMoney(Number(t.price))}</td>
          <td>${t.quantity}</td>
          <td style="max-width:240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${(t.reasoning || '').replace(/"/g, '&quot;')}">${t.reasoning || '—'}</td>
          <td class="${t.realized_pnl == null ? '' : Number(t.realized_pnl) >= 0 ? 'pnl-cell positive' : 'pnl-cell negative'}">${t.realized_pnl == null ? '—' : fmtMoney(Number(t.realized_pnl))}</td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Failed to load trade log:', err);
    }
  }

  function toggleAi() {
    state.running = !state.running;
    const btn = document.getElementById('ai-toggle-btn');
    if (state.running) {
      btn.className = 'btn btn-red ai-toggle-btn';
      btn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop AI';
      startPolling();
    } else {
      btn.className = 'btn btn-green ai-toggle-btn';
      btn.innerHTML = '<i class="fa-solid fa-play"></i> Start AI';
      stopPolling();
    }
  }

  function startPolling() {
    const intervalS = pollIntervalSeconds();
    state.secondsLeft = intervalS;
    updateCountdownDisplay();
    state.countdownTimer = setInterval(() => {
      state.secondsLeft -= 1;
      if (state.secondsLeft <= 0) state.secondsLeft = intervalS;
      updateCountdownDisplay();
    }, 1000);
    state.pollTimer = setInterval(refreshSignal, intervalS * 1000);
    refreshSignal();
  }

  function stopPolling() {
    clearInterval(state.pollTimer);
    clearInterval(state.countdownTimer);
    state.pollTimer = null;
    state.countdownTimer = null;
    const el = document.getElementById('ai-countdown');
    if (el) el.textContent = '';
  }

  function updateCountdownDisplay() {
    const el = document.getElementById('ai-countdown');
    if (el) el.textContent = `Next update in ${state.secondsLeft}s`;
  }

  function updateStyleNote() {
    const el = document.getElementById('ai-style-note');
    if (!el) return;
    const meta = currentStrategyMeta();
    if (!meta.style) { el.textContent = ''; return; }
    if (meta.style === 'long_term') {
      el.innerHTML = `<i class="fa-solid fa-clock"></i> Long-term strategy — re-checks fundamentals every 5 minutes, not every few seconds. This isn't a day trade.`;
    } else if (meta.style === 'day') {
      el.innerHTML = `<i class="fa-solid fa-bolt"></i> Day trading strategy — designed for intraday moves, closed out same session.`;
    } else {
      el.innerHTML = `<i class="fa-solid fa-chart-line"></i> Swing trading strategy — typically held for days to a few weeks.`;
    }
  }

  return { render, TICKERS };
})();

window.AiTraderSection = AiTraderSection;
