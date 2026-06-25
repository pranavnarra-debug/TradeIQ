/* ============================================================
   TradeIQ — myDesk.js
   My Trading Desk: manual paper trading with live signal indicator
   ============================================================ */

const MyDeskSection = (() => {
  const STRATEGY_INFO = {
    canslim: { name: 'CANSLIM', entry: 'Price > SMA50, RSI 50-70, new 52w high, volume surge, price > SMA200', exit: 'RSI > 80 or 8% stop hit', indicators: 'SMA50, SMA200, RSI, Volume', risk: '8% stop / 20% target' },
    momentum_breakout: { name: 'Momentum Breakout', entry: 'Breakout above 20d high with 1.5x volume', exit: 'Loss of momentum below 5d low', indicators: 'SMA20, RSI, Volume', risk: 'Stop at 5-day low' },
    vwap_reversion: { name: 'VWAP Mean Reversion', entry: 'Price 1.5% below VWAP, RSI < 40, in uptrend', exit: 'Price recovers to VWAP', indicators: 'VWAP, RSI, SMA50', risk: '2% stop below entry' },
    ema_crossover: { name: 'EMA Crossover', entry: '9-EMA crosses above 21-EMA, stacked bullishly', exit: '9-EMA crosses back below 21-EMA', indicators: 'EMA9, EMA21, EMA50, RSI', risk: 'Stop below EMA21' },
    opening_range_breakout: { name: 'Opening Range Breakout', entry: 'Price breaks opening range high + volume', exit: 'Price falls back below opening range', indicators: 'Opening range, SMA20, RSI', risk: 'Stop below opening range low' },
    gap_and_go: { name: 'Gap and Go', entry: 'Gap up > 1.5%, holding above open, 2x volume', exit: 'Gap fills back below open', indicators: 'Gap %, Volume, SMA20', risk: 'Trailing 2% stop' },
    rsi_swing: { name: 'RSI Swing', entry: 'RSI < 30 in a long-term uptrend with reversal candle', exit: 'RSI recovers to 50+', indicators: 'RSI, SMA200, SMA50', risk: '5% stop below entry' },
    bollinger_squeeze: { name: 'Bollinger Squeeze', entry: 'Bands squeeze < 10% width, breaks upper band', exit: 'Price falls back inside bands', indicators: 'Bollinger Bands, RSI, Volume', risk: 'Stop at middle band' },
    quality_compounder: { name: 'Quality Compounder', entry: 'Strong ROE, manageable debt, growing revenue & earnings, reasonable P/E', exit: 'Fundamentals deteriorate (rare — this is a buy-and-hold approach)', indicators: 'ROE, debt-to-equity, margins, revenue/earnings growth, P/E, PEG', risk: 'Wide drawdown tolerance — ride out volatility' },
  };
  const STYLE_LABELS = { day: 'Day trading', swing: 'Swing trading', long_term: 'Long-term investing' };
  const TICKERS = ['AAPL', 'NVDA', 'TSLA', 'AMZN', 'META', 'MSFT', 'GOOGL', 'JPM', 'SPY', 'QQQ'];

  let state = {
    portfolioId: null,
    ticker: 'AAPL',
    strategy: 'momentum_breakout',
    strategyMeta: [],
    period: '3mo',
    orderSide: 'BUY',
    chartInstance: null,
    signalTimer: null,
    historyVisible: false,
  };

  function fmt(n, d = 2) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtMoney(n) {
    if (n == null || isNaN(n)) return '—';
    const sign = n < 0 ? '-' : '';
    return `${sign}$${fmt(Math.abs(n))}`;
  }

  function currentStyle() {
    const meta = state.strategyMeta.find((s) => s.id === state.strategy);
    return meta ? meta.style : null;
  }

  function strategySelectHtml() {
    const byStyle = { day: [], swing: [], long_term: [] };
    state.strategyMeta.forEach((s) => { if (byStyle[s.style] && STRATEGY_INFO[s.id]) byStyle[s.style].push(s); });
    // Fallback: if metadata hasn't loaded yet, just list everything ungrouped.
    if (state.strategyMeta.length === 0) {
      return Object.entries(STRATEGY_INFO).map(([id, s]) => `<option value="${id}" ${id === state.strategy ? 'selected' : ''}>${s.name}</option>`).join('');
    }
    return Object.entries(byStyle)
      .filter(([, list]) => list.length > 0)
      .map(([style, list]) => `
        <optgroup label="${STYLE_LABELS[style] || style}">
          ${list.map((s) => `<option value="${s.id}" ${s.id === state.strategy ? 'selected' : ''}>${STRATEGY_INFO[s.id].name}</option>`).join('')}
        </optgroup>
      `).join('');
  }

  async function render(portfolioId, params) {
    state.portfolioId = portfolioId;
    if (params && params.strategy && STRATEGY_INFO[params.strategy]) {
      state.strategy = params.strategy;
    }
    const content = document.getElementById('content-area');
    content.innerHTML = `<div class="empty-state"><span class="spinner"></span> Loading...</div>`;

    try {
      const data = await api.get('/market/strategies');
      state.strategyMeta = data.strategies || [];
    } catch (err) {
      console.error('Failed to load strategy metadata:', err);
      state.strategyMeta = [];
    }

    content.innerHTML = `
      <div class="controls-row">
        <select class="input" id="desk-ticker-select">${TICKERS.map((t) => `<option value="${t}" ${t === state.ticker ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <select class="input" id="desk-strategy-select">${strategySelectHtml()}</select>
        <span class="badge badge-hold" id="desk-signal-indicator">NEUTRAL</span>
      </div>
      <div class="text-dim" id="desk-style-note" style="font-size:12.5px;margin:-6px 0 14px;"></div>

      <div class="trading-layout">
        <div class="card">
          <div class="card-title">Price Chart — <span id="desk-chart-ticker">${state.ticker}</span></div>
          <div class="chart-wrap"><canvas id="desk-price-chart"></canvas></div>
          <div class="period-toggle-row">
            ${['1M', '3M', '6M', '1Y'].map((p) => `<button class="period-btn desk-period-btn ${p === '3M' ? 'active' : ''}" data-period="${p}">${p}</button>`).join('')}
          </div>
        </div>

        <div>
          <div class="card" style="margin-bottom: 16px;">
            <div class="card-title">Place Order</div>
            <div class="order-toggle-row">
              <button class="order-toggle-btn buy active" id="order-buy-btn">BUY</button>
              <button class="order-toggle-btn sell" id="order-sell-btn">SELL</button>
            </div>
            <div class="form-group">
              <label>Quantity</label>
              <input class="input" type="number" id="order-qty" min="1" value="10" />
            </div>
            <div class="form-group">
              <label>Order Type</label>
              <div class="radio-row">
                <label><input type="radio" name="order-type" value="market" checked /> Market</label>
                <label><input type="radio" name="order-type" value="limit" /> Limit</label>
              </div>
              <input class="input" type="number" id="limit-price-input" placeholder="Limit price" style="display:none;" />
            </div>
            <div class="estimated-cost" id="estimated-cost">≈ $0.00</div>
            <button class="btn btn-primary btn-block" id="place-trade-btn">Place Trade</button>
          </div>

          <div class="card">
            <div class="card-title">Strategy Reference</div>
            <dl class="strategy-info-box" id="strategy-info-box"></dl>
          </div>
        </div>
      </div>

      <div class="card section-spacer">
        <div class="card-title">Open Positions</div>
        <table>
          <thead><tr><th>Ticker</th><th>Side</th><th>Qty</th><th>Entry</th><th>Current</th><th>Unr. P&L</th><th>%</th><th></th></tr></thead>
          <tbody id="positions-table-body"><tr><td colspan="8" class="empty-state">Loading...</td></tr></tbody>
        </table>
      </div>

      <div class="card section-spacer">
        <div class="card-title">Portfolio Stats</div>
        <div class="stats-bar" id="desk-stats-bar"></div>
      </div>

      <div class="card section-spacer">
        <div class="collapsible-header" id="history-toggle">
          <div class="card-title" style="margin-bottom:0;">Trade History</div>
          <i class="fa-solid fa-chevron-down"></i>
        </div>
        <div id="history-table-wrap" style="display:none; margin-top: 14px;">
          <table>
            <thead><tr><th>Time</th><th>Ticker</th><th>Action</th><th>Entry/Exit</th><th>Qty</th><th>Realized P&L</th><th>Strategy</th></tr></thead>
            <tbody id="history-table-body"></tbody>
          </table>
        </div>
      </div>
    `;

    renderStrategyInfo();
    updateStyleNote();

    document.getElementById('desk-ticker-select').addEventListener('change', async (e) => {
      state.ticker = e.target.value;
      document.getElementById('desk-chart-ticker').textContent = state.ticker;
      await loadChart();
      await refreshSignalIndicator();
      updateEstimatedCost();
    });
    document.getElementById('desk-strategy-select').addEventListener('change', (e) => {
      state.strategy = e.target.value;
      renderStrategyInfo();
      updateStyleNote();
      refreshSignalIndicator();
      restartSignalPolling();
    });
    document.querySelectorAll('.desk-period-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('.desk-period-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const map = { '1M': '1mo', '3M': '3mo', '6M': '6mo', '1Y': '1y' };
        state.period = map[btn.dataset.period];
        await loadChart();
      });
    });

    document.getElementById('order-buy-btn').addEventListener('click', () => setOrderSide('BUY'));
    document.getElementById('order-sell-btn').addEventListener('click', () => setOrderSide('SELL'));
    document.getElementById('order-qty').addEventListener('input', updateEstimatedCost);
    document.querySelectorAll('input[name="order-type"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const isLimit = document.querySelector('input[name="order-type"]:checked').value === 'limit';
        document.getElementById('limit-price-input').style.display = isLimit ? 'block' : 'none';
        updateEstimatedCost();
      });
    });
    document.getElementById('limit-price-input').addEventListener('input', updateEstimatedCost);
    document.getElementById('place-trade-btn').addEventListener('click', handlePlaceTradeClick);
    document.getElementById('history-toggle').addEventListener('click', toggleHistory);

    await Promise.all([loadChart(), refreshSignalIndicator(), loadPositions(), loadStats()]);
    updateEstimatedCost();

    restartSignalPolling();
  }

  function restartSignalPolling() {
    if (state.signalTimer) clearInterval(state.signalTimer);
    const intervalMs = currentStyle() === 'long_term' ? 5 * 60 * 1000 : 15000;
    state.signalTimer = setInterval(refreshSignalIndicator, intervalMs);
  }

  function updateStyleNote() {
    const el = document.getElementById('desk-style-note');
    if (!el) return;
    const style = currentStyle();
    if (style === 'long_term') {
      el.innerHTML = `<i class="fa-solid fa-clock"></i> Long-term strategy — signal reflects fundamentals, not minute-to-minute price action.`;
    } else if (style === 'day') {
      el.innerHTML = `<i class="fa-solid fa-bolt"></i> Day trading strategy — meant to be opened and closed within the same session.`;
    } else if (style === 'swing') {
      el.innerHTML = `<i class="fa-solid fa-chart-line"></i> Swing trading strategy — typically held for days to a few weeks.`;
    } else {
      el.textContent = '';
    }
  }

  function setOrderSide(side) {
    state.orderSide = side;
    document.getElementById('order-buy-btn').classList.toggle('active', side === 'BUY');
    document.getElementById('order-sell-btn').classList.toggle('active', side === 'SELL');
  }

  function renderStrategyInfo() {
    const info = STRATEGY_INFO[state.strategy];
    const el = document.getElementById('strategy-info-box');
    if (!el || !info) return;
    el.innerHTML = `
      <dt>Entry Rules</dt><dd>${info.entry}</dd>
      <dt>Exit Rules</dt><dd>${info.exit}</dd>
      <dt>Key Indicators</dt><dd>${info.indicators}</dd>
      <dt>Risk Rule</dt><dd>${info.risk}</dd>
    `;
  }

  async function loadChart() {
    try {
      const candles = await api.get(`/market/candles/${state.ticker}?period=${state.period}&interval=1d`);
      if (!Array.isArray(candles) || candles.length === 0) return;
      ChartHelpers.destroyIfExists(state.chartInstance);
      const canvas = document.getElementById('desk-price-chart');
      if (!canvas) return;
      state.chartInstance = ChartHelpers.buildPriceChart(canvas, candles, {});
    } catch (err) {
      console.error('Failed to load My Desk chart:', err);
    }
  }

  async function refreshSignalIndicator() {
    try {
      const result = await api.get(`/market/strategy/${state.ticker}?strategy=${state.strategy}`);
      const el = document.getElementById('desk-signal-indicator');
      if (!el) return;
      el.className = `badge ${result.signal === 'BUY' ? 'badge-buy' : result.signal === 'SELL' ? 'badge-sell' : 'badge-hold'}`;
      el.textContent = result.signal === 'HOLD' ? 'NEUTRAL' : result.signal;
    } catch (err) {
      console.error('Failed to refresh signal indicator:', err);
    }
  }

  async function updateEstimatedCost() {
    const qty = Number(document.getElementById('order-qty').value) || 0;
    const isLimit = document.querySelector('input[name="order-type"]:checked').value === 'limit';
    const limitPrice = Number(document.getElementById('limit-price-input').value) || 0;

    let price = limitPrice;
    if (!isLimit) {
      try {
        const quote = await api.get(`/market/quote/${state.ticker}`);
        price = quote.price || 0;
      } catch {
        price = 0;
      }
    }
    const el = document.getElementById('estimated-cost');
    if (el) el.textContent = `≈ $${fmt(price * qty)}`;
  }

  async function handlePlaceTradeClick() {
    const qty = Number(document.getElementById('order-qty').value);
    const orderType = document.querySelector('input[name="order-type"]:checked').value;
    const limitPrice = Number(document.getElementById('limit-price-input').value) || null;

    if (!qty || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    if (orderType === 'limit' && !limitPrice) {
      alert('Please enter a limit price');
      return;
    }

    let displayPrice = limitPrice;
    if (orderType === 'market') {
      try {
        const quote = await api.get(`/market/quote/${state.ticker}`);
        displayPrice = quote.price;
      } catch {
        displayPrice = null;
      }
    }

    const estTotal = displayPrice ? (displayPrice * qty).toFixed(2) : '—';
    showConfirmModal({
      title: 'Confirm Trade',
      message: `${state.orderSide === 'BUY' ? 'Buy' : 'Sell'} ${qty} shares of ${state.ticker} at ${displayPrice ? '$' + fmt(displayPrice) : 'market price'} (${orderType}) = $${estTotal}. Confirm?`,
      onConfirm: async () => {
        try {
          await api.post(`/portfolio/${state.portfolioId}/trade`, {
            symbol: state.ticker,
            action: state.orderSide,
            quantity: qty,
            orderType,
            limitPrice: orderType === 'limit' ? limitPrice : undefined,
            strategy: state.strategy,
            reasoning: 'Manual trade from My Trading Desk',
          });
          await Promise.all([loadPositions(), loadStats()]);
          showToast('success', 'Trade executed successfully');
        } catch (err) {
          showToast('error', err.message || 'Trade failed');
        }
      },
    });
  }

  async function loadPositions() {
    if (!state.portfolioId) return;
    try {
      const positions = await api.get(`/portfolio/${state.portfolioId}/positions`);
      const body = document.getElementById('positions-table-body');
      if (!body) return;
      if (!positions || positions.length === 0) {
        body.innerHTML = '<tr><td colspan="8" class="empty-state">No open positions</td></tr>';
        return;
      }
      body.innerHTML = positions.map((p) => `
        <tr>
          <td>${p.symbol}</td>
          <td>${p.side}</td>
          <td>${p.quantity}</td>
          <td>${fmtMoney(Number(p.entry_price))}</td>
          <td>${fmtMoney(p.currentPrice)}</td>
          <td class="${p.unrealizedPnl >= 0 ? 'pnl-cell positive' : 'pnl-cell negative'}">${fmtMoney(p.unrealizedPnl)}</td>
          <td class="${p.unrealizedPnlPct >= 0 ? 'pnl-cell positive' : 'pnl-cell negative'}">${fmt(p.unrealizedPnlPct, 1)}%</td>
          <td><button class="btn btn-sm close-position-btn" data-pos-id="${p.id}" data-symbol="${p.symbol}">Close</button></td>
        </tr>
      `).join('');

      document.querySelectorAll('.close-position-btn').forEach((btn) => {
        btn.addEventListener('click', () => handleClosePosition(btn.dataset.posId, btn.dataset.symbol));
      });
    } catch (err) {
      console.error('Failed to load positions:', err);
    }
  }

  function handleClosePosition(posId, symbol) {
    showConfirmModal({
      title: 'Close Position',
      message: `Close your ${symbol} position at the current market price?`,
      onConfirm: async () => {
        try {
          await api.post(`/portfolio/${state.portfolioId}/close/${posId}`, {});
          await Promise.all([loadPositions(), loadStats()]);
          showToast('success', 'Position closed');
        } catch (err) {
          showToast('error', err.message || 'Failed to close position');
        }
      },
    });
  }

  async function loadStats() {
    if (!state.portfolioId) return;
    try {
      const stats = await api.get(`/portfolio/${state.portfolioId}/stats`);
      const el = document.getElementById('desk-stats-bar');
      if (!el) return;
      el.innerHTML = `
        <div class="stats-bar-item"><span class="label">Starting</span><span class="value">${fmtMoney(stats.startingCapital)}</span></div>
        <div class="stats-bar-item"><span class="label">Equity</span><span class="value">${fmtMoney(stats.equity)}</span></div>
        <div class="stats-bar-item"><span class="label">Cash</span><span class="value">${fmtMoney(stats.cash)}</span></div>
        <div class="stats-bar-item"><span class="label">P&L</span><span class="value ${stats.realizedPnl + stats.unrealizedPnl >= 0 ? 'text-green' : 'text-red'}">${fmtMoney(stats.realizedPnl + stats.unrealizedPnl)}</span></div>
        <div class="stats-bar-item"><span class="label">Win Rate</span><span class="value">${fmt(stats.winRate, 1)}%</span></div>
      `;

      const historyBody = document.getElementById('history-table-body');
      const history = await api.get(`/portfolio/${state.portfolioId}/history`);
      if (historyBody) {
        historyBody.innerHTML = history.length === 0
          ? '<tr><td colspan="7" class="empty-state">No trade history yet</td></tr>'
          : history.map((t) => `
            <tr>
              <td>${new Date(t.executed_at).toLocaleString()}</td>
              <td>${t.symbol}</td>
              <td><span class="badge ${t.action === 'BUY' ? 'badge-buy' : 'badge-sell'}">${t.action}</span></td>
              <td>${fmtMoney(Number(t.price))}</td>
              <td>${t.quantity}</td>
              <td class="${t.realized_pnl == null ? '' : Number(t.realized_pnl) >= 0 ? 'pnl-cell positive' : 'pnl-cell negative'}">${t.realized_pnl == null ? '—' : fmtMoney(Number(t.realized_pnl))}</td>
              <td>${t.strategy || '—'}</td>
            </tr>
          `).join('');
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  function toggleHistory() {
    state.historyVisible = !state.historyVisible;
    document.getElementById('history-table-wrap').style.display = state.historyVisible ? 'block' : 'none';
    document.getElementById('history-toggle').classList.toggle('collapsed', !state.historyVisible);
  }

  function showConfirmModal({ title, message, onConfirm }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <h3>${title}</h3>
        <p class="text-dim">${message}</p>
        <div class="modal-actions">
          <button class="btn" id="modal-cancel-btn">Cancel</button>
          <button class="btn btn-primary" id="modal-confirm-btn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#modal-cancel-btn').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#modal-confirm-btn').addEventListener('click', async () => {
      overlay.remove();
      await onConfirm();
    });
  }

  function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  return { render };
})();

window.MyDeskSection = MyDeskSection;
