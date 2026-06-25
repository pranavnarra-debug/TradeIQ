/* ============================================================
   TradeIQ — research.js
   Stock Research: AI analysis + user's own analysis + comparison
   ============================================================ */

const ResearchSection = (() => {
  let state = {
    symbol: null,
    analysis: null,
    myAnalysis: null,
  };

  function fmt(n, d = 2) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtMoney(n) {
    if (n == null || isNaN(n)) return '—';
    return `$${fmt(n)}`;
  }
  function fmtLargeNum(n) {
    if (n == null || isNaN(n)) return '—';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${fmt(n)}`;
  }

  async function render() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <div class="flex-row" style="margin-bottom: 18px;">
        <input class="input" id="research-ticker-input" placeholder="Enter ticker (e.g. AAPL)" style="max-width: 220px;" />
        <button class="btn btn-primary" id="research-go-btn"><i class="fa-solid fa-magnifying-glass"></i> Research</button>
        <span id="research-loading" style="display:none;"><span class="spinner"></span></span>
      </div>
      <div id="research-results"></div>
    `;

    document.getElementById('research-go-btn').addEventListener('click', handleResearch);
    document.getElementById('research-ticker-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleResearch();
    });
  }

  async function handleResearch() {
    const input = document.getElementById('research-ticker-input');
    const symbol = input.value.trim().toUpperCase();
    if (!symbol) return;

    state.symbol = symbol;
    state.myAnalysis = null;
    document.getElementById('research-loading').style.display = 'inline-block';
    document.getElementById('research-results').innerHTML = '';

    try {
      const analysis = await api.get(`/market/analysis/${symbol}`);
      state.analysis = analysis;
      renderResults(analysis);
    } catch (err) {
      document.getElementById('research-results').innerHTML = `<div class="empty-state">Could not load analysis for ${escapeHtml(symbol)}. ${escapeHtml(err.message)}</div>`;
    } finally {
      document.getElementById('research-loading').style.display = 'none';
    }
  }

  function momentumColor(score) {
    if (score >= 7) return '#3fb950';
    if (score >= 4) return '#d29922';
    return '#f85149';
  }

  function verdictClass(signal) {
    if (signal === 'BUY') return 'buy';
    if (signal === 'AVOID') return 'avoid';
    return 'hold';
  }
  function verdictIcon(signal) {
    if (signal === 'BUY') return '🟢';
    if (signal === 'AVOID') return '🔴';
    return '🟡';
  }

  function canslimRowClass(row) {
    if (row.pass) return 'pass';
    return 'fail';
  }

  function renderResults(a) {
    const t = a.technical;
    const q = a.quote;
    const changeColor = (q.change ?? 0) >= 0 ? 'text-green' : 'text-red';
    const changeSign = (q.change ?? 0) >= 0 ? '+' : '';

    const el = document.getElementById('research-results');
    el.innerHTML = `
      <div class="trading-layout research-layout">
        <div>
          <div class="card" style="margin-bottom: 16px;">
            <div class="company-header">
              <div class="company-logo-placeholder">${escapeHtml(a.symbol.slice(0, 2))}</div>
              <div class="company-header-info">
                <h2>${escapeHtml(a.profile?.name || a.symbol)} (${escapeHtml(a.symbol)})</h2>
                <div class="meta">${escapeHtml(a.profile?.sector) || '—'} · ${escapeHtml(a.profile?.industry) || '—'} · ${fmtLargeNum(a.profile?.marketCap)}</div>
              </div>
              <div style="margin-left:auto; text-align:right;">
                <div style="font-size:20px; font-weight:800;">${fmtMoney(q.price)}</div>
                <div class="${changeColor}" style="font-size:13px;">${changeSign}${fmt(q.change)} (${changeSign}${fmt(q.changePercent)}%)</div>
              </div>
            </div>
          </div>

          <div class="card" style="margin-bottom: 16px;">
            <div class="card-title">Technical Snapshot</div>
            <table>
              <tbody>
                <tr><td>Current Price</td><td>${fmtMoney(t.price)}</td><td>52-Week High</td><td>${fmtMoney(t.high52)}</td></tr>
                <tr><td>52-Week Low</td><td>${fmtMoney(t.low52)}</td><td>RSI(14)</td><td>${t.rsi != null ? fmt(t.rsi, 1) : '—'}</td></tr>
                <tr><td>EMA-9</td><td>${fmtMoney(t.ema9)}</td><td>EMA-21</td><td>${fmtMoney(t.ema21)}</td></tr>
                <tr><td>EMA-50</td><td>${fmtMoney(t.ema50)}</td><td>BB Position</td><td>${t.bbPosition}</td></tr>
                <tr><td>VWAP</td><td>${fmtMoney(t.vwap)}</td><td>Relative Volume</td><td>${t.relativeVolume != null ? fmt(t.relativeVolume) + 'x' : '—'}</td></tr>
                <tr><td>Market State</td><td colspan="3"><span class="market-badge ${t.marketState === 'REGULAR' ? 'open' : 'closed'}">${t.marketState}</span></td></tr>
              </tbody>
            </table>
          </div>

          <div class="card" style="margin-bottom: 16px;">
            <div class="card-title">CANSLIM Scorecard — ${a.canslim.score}/${a.canslim.total}</div>
            <table class="canslim-table">
              <thead><tr><th>Criterion</th><th>Status</th><th>Justification</th></tr></thead>
              <tbody>
                ${a.canslim.rows.map((r) => `
                  <tr class="${canslimRowClass(r)}">
                    <td><strong>${escapeHtml(r.letter)}</strong> — ${escapeHtml(r.name)}</td>
                    <td>${r.pass ? '✅ Pass' : '❌ Fail'}</td>
                    <td class="text-dim">${escapeHtml(r.justification)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="grid-2" style="margin-bottom: 16px;">
            <div class="card">
              <div class="card-title">Momentum Score</div>
              <div class="momentum-gauge-wrap">
                <div class="momentum-gauge" style="background: conic-gradient(${momentumColor(a.momentumScore)} ${a.momentumScore * 36}deg, var(--border) 0deg); color: ${momentumColor(a.momentumScore)};">
                  ${a.momentumScore}
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-title">Pattern Detection</div>
              <div style="text-align:center; padding: 18px 0;">
                <span class="badge badge-hold" style="font-size:13px; padding: 8px 16px;">${escapeHtml(a.pattern.pattern)}</span>
                <p class="text-dim" style="font-size: 12.5px; margin-top: 12px;">${escapeHtml(a.pattern.description)}</p>
              </div>
            </div>
          </div>

          <div class="card" style="margin-bottom: 16px;">
            <div class="card-title">Recent News</div>
            ${a.news && a.news.length > 0 ? a.news.map((n) => `
              <div class="news-item">
                <div class="news-item-title">${n.url ? `<a href="${escapeHtml(n.url)}" target="_blank" rel="noopener">${escapeHtml(n.title)}</a>` : escapeHtml(n.title)}</div>
                <div class="news-item-meta">${escapeHtml(n.publisher) || ''} ${n.publishedAt ? '· ' + new Date(n.publishedAt).toLocaleDateString() : ''}</div>
              </div>
            `).join('') : '<div class="empty-state">No recent news found</div>'}
          </div>

          <div class="card">
            <div class="card-title">AI Verdict</div>
            <div class="verdict-badge-large ${verdictClass(a.verdict.signal)}">
              <span class="verdict-icon">${verdictIcon(a.verdict.signal)}</span>
              <div>
                <div class="verdict-text">${a.verdict.signal}</div>
                <div class="text-dim" style="font-size:12.5px;">${a.verdict.confidence}% confidence</div>
              </div>
            </div>
            <p style="font-size: 13.5px; color: #c9d1d9; line-height: 1.6;">${escapeHtml(a.verdict.rationale)}</p>
            <ul class="risk-bullets">
              ${a.verdict.riskBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card-title">My Analysis</div>
            <form id="my-analysis-form">
              <div class="form-group">
                <label>Trend Assessment</label>
                <select class="input" id="my-trend">
                  <option value="Uptrend">Uptrend</option>
                  <option value="Downtrend">Downtrend</option>
                  <option value="Sideways">Sideways</option>
                </select>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label>Support Level</label>
                  <input class="input" type="number" step="0.01" id="my-support" />
                </div>
                <div class="form-group">
                  <label>Resistance Level</label>
                  <input class="input" type="number" step="0.01" id="my-resistance" />
                </div>
              </div>
              <div class="form-group">
                <label>CANSLIM Assessment</label>
                <div class="checkbox-grid">
                  ${['C', 'A', 'N', 'S', 'L', 'I', 'M'].map((l) => `<label><input type="checkbox" name="canslim-check" value="${l}" /> ${l}</label>`).join('')}
                </div>
              </div>
              <div class="form-group">
                <label>My Verdict</label>
                <select class="input" id="my-verdict">
                  <option value="BUY">BUY</option>
                  <option value="HOLD">HOLD</option>
                  <option value="AVOID">AVOID</option>
                </select>
              </div>
              <div class="form-group">
                <label>Reasoning (min 20 characters)</label>
                <textarea class="input" id="my-reasoning" rows="4"></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-block"><i class="fa-solid fa-pen"></i> Submit My Analysis</button>
            </form>
          </div>
          <div id="comparison-view"></div>
        </div>
      </div>
    `;

    document.getElementById('my-analysis-form').addEventListener('submit', handleSubmitAnalysis);
  }

  async function handleSubmitAnalysis(e) {
    e.preventDefault();
    const trendAssessment = document.getElementById('my-trend').value;
    const supportLevel = Number(document.getElementById('my-support').value) || null;
    const resistanceLevel = Number(document.getElementById('my-resistance').value) || null;
    const verdict = document.getElementById('my-verdict').value;
    const reasoning = document.getElementById('my-reasoning').value.trim();
    const canslimChecks = Array.from(document.querySelectorAll('input[name="canslim-check"]:checked')).map((cb) => cb.value);

    if (reasoning.length < 20) {
      alert('Please write at least 20 characters of reasoning');
      return;
    }

    try {
      await api.post('/portfolio/analysis', {
        symbol: state.symbol,
        trendAssessment,
        supportLevel,
        resistanceLevel,
        canslimChecks,
        verdict,
        reasoning,
      });
      state.myAnalysis = { trendAssessment, supportLevel, resistanceLevel, canslimChecks, verdict, reasoning };
      renderComparison();
    } catch (err) {
      alert(err.message || 'Failed to save analysis');
    }
  }

  function closeOrDiffer(aVal, bVal, tolerancePct = 3) {
    if (aVal == null || bVal == null) return { label: '—', cls: '' };
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      const diffPct = Math.abs(aVal - bVal) / Math.max(Math.abs(aVal), 1) * 100;
      if (diffPct < 0.5) return { label: '✅ Agree', cls: 'agree' };
      if (diffPct <= tolerancePct) return { label: '≈ Close', cls: 'close' };
      return { label: '❌ Differ', cls: 'differ' };
    }
    return aVal === bVal ? { label: '✅ Agree', cls: 'agree' } : { label: '❌ Differ', cls: 'differ' };
  }

  function renderComparison() {
    if (!state.analysis || !state.myAnalysis) return;
    const a = state.analysis;
    const my = state.myAnalysis;

    const aiTrend = a.pattern.pattern === 'uptrend' ? 'Uptrend' : a.pattern.pattern === 'downtrend' ? 'Downtrend' : 'Sideways';
    const trendCompare = closeOrDiffer(aiTrend, my.trendAssessment);
    const verdictCompare = closeOrDiffer(a.verdict.signal, my.verdict);
    const aiCanslimScore = a.canslim.score;
    const myCanslimScore = my.canslimChecks.length;
    const canslimCompare = closeOrDiffer(aiCanslimScore, myCanslimScore, 15);
    const supportCompare = closeOrDiffer(a.technical.low52, my.supportLevel, 5);

    const differences = [];
    if (trendCompare.cls === 'differ') differences.push(`You assessed the trend as ${escapeHtml(my.trendAssessment)} while the AI sees ${escapeHtml(aiTrend)}.`);
    if (verdictCompare.cls === 'differ') differences.push(`Your verdict (${escapeHtml(my.verdict)}) differs from the AI's (${escapeHtml(a.verdict.signal)}) — review which CANSLIM criteria you may be weighing differently.`);
    if (canslimCompare.cls !== 'agree') differences.push(`Your CANSLIM score (${myCanslimScore}/7) differs from the AI's (${aiCanslimScore}/7).`);
    if (differences.length === 0) differences.push('Your analysis closely matches the AI assessment — nice work staying objective!');

    const el = document.getElementById('comparison-view');
    el.innerHTML = `
      <div class="card section-spacer">
        <div class="card-title">Comparison</div>
        <table class="comparison-table">
          <thead><tr><th>Dimension</th><th>AI Assessment</th><th>My Assessment</th><th>Agreement</th></tr></thead>
          <tbody>
            <tr><td>Trend</td><td>${escapeHtml(aiTrend)}</td><td>${escapeHtml(my.trendAssessment)}</td><td class="${trendCompare.cls}">${trendCompare.label}</td></tr>
            <tr><td>Support</td><td>${fmtMoney(a.technical.low52)}</td><td>${fmtMoney(my.supportLevel)}</td><td class="${supportCompare.cls}">${supportCompare.label}</td></tr>
            <tr><td>Verdict</td><td>${escapeHtml(a.verdict.signal)}</td><td>${escapeHtml(my.verdict)}</td><td class="${verdictCompare.cls}">${verdictCompare.label}</td></tr>
            <tr><td>CANSLIM Score</td><td>${aiCanslimScore}/7</td><td>${myCanslimScore}/7</td><td class="${canslimCompare.cls}">${canslimCompare.label}</td></tr>
          </tbody>
        </table>
        <div class="reasoning-box" style="margin-top: 14px;">
          <strong>Key Differences:</strong> ${differences.map(escapeHtml).join(' ')}
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render };
})();

window.ResearchSection = ResearchSection;
