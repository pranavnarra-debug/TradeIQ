/* ============================================================
   TradeIQ — widgets.js
   Interactive tools embedded in lessons. Each widget is mounted
   into a container with optional props from the lesson content.
   ============================================================ */

const Widgets = (() => {
  const money = (n, d = 0) => `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })}`;
  const pct = (n, d = 1) => `${n.toFixed(d)}%`;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function slider(key, label, min, max, step, value, fmt = (v) => v) {
    return `<label class="w-slider"><span class="w-lbl">${label}<b data-out="${key}">${fmt(value)}</b></span>
      <input type="range" data-k="${key}" min="${min}" max="${max}" step="${step}" value="${value}" /></label>`;
  }
  const stat = (label, key, big = false) => `<div class="w-stat ${big ? 'big' : ''}"><span class="px-label">${label}</span><b data-o="${key}">—</b></div>`;

  /** Wire sliders: calls update(values) on every input. fmts formats the inline labels. */
  function wire(el, fmts, update) {
    const vals = {};
    el.querySelectorAll('input[data-k], select[data-k]').forEach((i) => {
      vals[i.dataset.k] = i.type === 'range' || i.type === 'number' ? Number(i.value) : i.value;
      i.addEventListener('input', () => {
        vals[i.dataset.k] = i.type === 'range' || i.type === 'number' ? Number(i.value) : i.value;
        const out = el.querySelector(`[data-out="${i.dataset.k}"]`);
        if (out && fmts[i.dataset.k]) out.textContent = fmts[i.dataset.k](vals[i.dataset.k]);
        update(vals);
      });
    });
    update(vals);
    return vals;
  }
  const set = (el, key, html) => { const o = el.querySelector(`[data-o="${key}"]`); if (o) o.innerHTML = html; };

  function bars(values, { colors = ['#1fbf75'], h = 140, labels = [] } = {}) {
    // values: array of arrays (stacked)
    const max = Math.max(...values.map((v) => v.reduce((a, b) => a + b, 0)), 1);
    const w = 600 / values.length;
    return `<svg class="w-chart" viewBox="0 0 620 ${h + 24}">${values.map((stack, i) => {
      let y = h;
      return stack.map((v, k) => {
        const bh = (v / max) * (h - 6);
        y -= bh;
        return `<rect x="${10 + i * w + w * 0.15}" y="${y}" width="${w * 0.7}" height="${Math.max(0, bh)}" fill="${colors[k % colors.length]}" stroke="#17140f" stroke-width="1.2"/>`;
      }).join('') + (labels[i] ? `<text x="${10 + i * w + w / 2}" y="${h + 18}" font-size="11" text-anchor="middle" fill="#776d5c">${labels[i]}</text>` : '');
    }).join('')}</svg>`;
  }
  function lineChart(series, { h = 150, colors = ['#17140f'], band } = {}) {
    const all = series.flat();
    const max = Math.max(...all); const min = Math.min(...all, band ?? Infinity);
    const span = max - min || 1;
    const X = (i, n) => 10 + (i / (n - 1)) * 600;
    const Y = (v) => 8 + (1 - (v - min) / span) * (h - 16);
    return `<svg class="w-chart" viewBox="0 0 620 ${h}">${band != null ? `<line x1="10" x2="610" y1="${Y(band)}" y2="${Y(band)}" stroke="#ff5a4e" stroke-width="2" stroke-dasharray="6 5"/>` : ''}
      ${series.map((s, k) => `<path d="${s.map((v, i) => `${i ? 'L' : 'M'}${X(i, s.length).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${colors[k]}" stroke-width="3" stroke-linejoin="round"/>`).join('')}</svg>`;
  }
  function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }

  const W = {
    'compound-interest': (el, p) => {
      const P = p.principal ?? 1000; const M = p.monthly ?? 100; const R = p.rate ?? 7; const Y = p.years ?? 30;
      el.innerHTML = `<div class="w-title">Compound growth calculator</div>
        ${slider('principal', 'Starting amount', 0, 50000, 100, P, money)}${slider('monthly', 'Added each month', 0, 2000, 10, M, money)}
        ${slider('rate', 'Yearly return', 0, 15, 0.5, R, (v) => pct(v))}${slider('years', 'Years', 1, 50, 1, Y, (v) => `${v} yrs`)}
        <div class="w-stats">${stat('Ends at', 'end', true)}${stat('You put in', 'in')}${stat('Growth earned', 'gain')}</div><div data-o="chart"></div>
        <p class="w-note">Assumes a steady return, compounded monthly. Real returns jump around year to year.</p>`;
      wire(el, { principal: money, monthly: money, rate: pct, years: (v) => `${v} yrs` }, (v) => {
        const r = v.rate / 100 / 12;
        let bal = v.principal; let contrib = v.principal;
        const rows = [];
        for (let m = 1; m <= v.years * 12; m++) {
          bal = bal * (1 + r) + v.monthly;
          contrib += v.monthly;
          if (m % 12 === 0) rows.push([contrib, Math.max(0, bal - contrib)]);
        }
        set(el, 'end', money(bal));
        set(el, 'in', money(contrib));
        set(el, 'gain', `<span class="up">${money(bal - contrib)}</span>`);
        const step = Math.ceil(rows.length / 25);
        const pick = rows.filter((_, i) => (i + 1) % step === 0 || i === rows.length - 1);
        set(el, 'chart', bars(pick, { colors: ['#d6e6ff', '#1fbf75'], labels: pick.map((_, i) => (i % 3 === 0 ? `y${Math.min(v.years, (i + 1) * step)}` : '')) }));
      });
    },

    'rule-of-72': (el, p) => {
      el.innerHTML = `<div class="w-title">Rule of 72</div>${slider('rate', 'Growth (or inflation) rate', 1, 15, 0.5, p.rate ?? 8, (v) => pct(v))}
        <div class="w-stats">${stat('Rule of 72 says', 'est', true)}${stat('Exact math', 'exact')}</div><div class="coin-chain" data-o="chain"></div>`;
      wire(el, { rate: pct }, (v) => {
        const est = 72 / v.rate;
        const exact = Math.log(2) / Math.log(1 + v.rate / 100);
        set(el, 'est', `${est.toFixed(1)} years to double`);
        set(el, 'exact', `${exact.toFixed(1)} years`);
        const n = Math.min(5, Math.floor(40 / est));
        set(el, 'chain', `${Array.from({ length: n + 1 }, (_, i) => `<span class="cc"><b>${money(1000 * 2 ** i)}</b><small>year ${Math.round(est * i)}</small></span>`).join('<span class="cc-arrow">&rarr;</span>')}`);
      });
    },

    inflation: (el, p) => {
      el.innerHTML = `<div class="w-title">What inflation does to your cash</div>
        ${slider('amount', 'Cash today', 10, 10000, 10, p.amount ?? 100, money)}${slider('rate', 'Inflation per year', 0, 10, 0.5, p.rate ?? 3, (v) => pct(v))}${slider('years', 'Years', 1, 40, 1, p.years ?? 20, (v) => `${v} yrs`)}
        <div class="w-stats">${stat('Buying power later', 'power', true)}${stat("Today's $ price later", 'price')}${stat('Lost', 'lost')}</div>`;
      wire(el, { amount: money, rate: pct, years: (v) => `${v} yrs` }, (v) => {
        const f = (1 + v.rate / 100) ** v.years;
        set(el, 'power', money(v.amount / f));
        set(el, 'price', money(v.amount * f));
        set(el, 'lost', `<span class="down">${pct((1 - 1 / f) * 100, 0)}</span>`);
      });
    },

    budget: (el, p) => {
      el.innerHTML = `<div class="w-title">50 / 30 / 20 budget</div>${slider('income', 'Monthly take-home pay', 500, 10000, 50, p.income ?? 3000, money)}<div data-o="split"></div>
        <p class="w-note">A starting framework, not a law. High-rent cities often need a different split.</p>`;
      wire(el, { income: money }, (v) => {
        const parts = [['Needs', 0.5, '#d6e6ff', 'rent, groceries, transport, minimum payments'], ['Wants', 0.3, '#ffe0d1', 'eating out, games, trips'], ['Save + invest', 0.2, '#1fbf75', 'emergency fund, investing, extra debt payoff']];
        set(el, 'split', `<div class="split-bar">${parts.map(([n, f, c]) => `<span style="flex:${f};background:${c}">${n}</span>`).join('')}</div>
          <div class="w-stats">${parts.map(([n, f, , d]) => `<div class="w-stat"><span class="px-label">${n} ${f * 100}%</span><b>${money(v.income * f)}</b><small>${d}</small></div>`).join('')}</div>`);
      });
    },

    'emergency-fund': (el, p) => {
      el.innerHTML = `<div class="w-title">Emergency fund target</div>${slider('exp', 'Monthly must-pay expenses', 200, 8000, 50, p.monthlyExpenses ?? 2000, money)}
        ${slider('months', 'Months of cushion', 1, 12, 1, 4, (v) => `${v} months`)}${slider('save', 'You can save per month', 25, 2000, 25, 300, money)}
        <div class="w-stats">${stat('Target', 'target', true)}${stat('Time to build it', 'time')}</div>`;
      wire(el, { exp: money, months: (v) => `${v} months`, save: money }, (v) => {
        const t = v.exp * v.months;
        set(el, 'target', money(t));
        const m = Math.ceil(t / v.save);
        set(el, 'time', m > 24 ? `${(m / 12).toFixed(1)} years` : `${m} months`);
      });
    },

    'credit-card-payoff': (el, p) => {
      el.innerHTML = `<div class="w-title">Credit card payoff</div>${slider('bal', 'Balance', 100, 20000, 50, p.balance ?? 2000, money)}${slider('apr', 'APR', 0, 36, 0.5, p.apr ?? 24, (v) => pct(v))}
        ${slider('pay', 'Monthly payment', 10, 2000, 5, p.payment ?? 60, money)}<div class="w-stats">${stat('Paid off in', 'time', true)}${stat('Interest paid', 'int')}${stat('Total paid', 'tot')}</div><div data-o="msg"></div>`;
      wire(el, { bal: money, apr: pct, pay: money }, (v) => {
        const r = v.apr / 100 / 12;
        let b = v.bal; let m = 0; let interest = 0;
        if (v.pay <= b * r) {
          set(el, 'time', '<span class="down">Never</span>'); set(el, 'int', '∞'); set(el, 'tot', '∞');
          set(el, 'msg', `<div class="w-warn">Your payment doesn't even cover the ${money(b * r, 2)} of monthly interest. The balance grows forever.</div>`);
          return;
        }
        while (b > 0.005 && m < 1200) { const i = b * r; interest += i; b = b + i - v.pay; m++; }
        set(el, 'time', m >= 12 ? `${Math.floor(m / 12)}y ${m % 12}m` : `${m} months`);
        set(el, 'int', `<span class="down">${money(interest)}</span>`);
        set(el, 'tot', money(v.bal + interest));
        set(el, 'msg', interest > v.bal * 0.5 ? '<div class="w-warn">Interest is costing you more than half the original balance. Paying more each month shrinks this fast.</div>' : '');
      });
    },

    'market-clock': (el) => {
      el.innerHTML = `<div class="w-title">Is the US stock market open right now?</div><div class="clock-face" data-o="clock"></div>
        <div class="w-stats">${stat('Stocks', 'stocks', true)}${stat('Index futures (CME)', 'fut')}${stat('Crypto', 'crypto')}</div>
        <p class="w-note">Holidays and early closes aren't shown. Check the NYSE and CME calendars for those.</p>`;
      function etParts() {
        const f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false });
        const parts = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
        return { day: parts.weekday, h: Number(parts.hour) % 24, m: Number(parts.minute), s: Number(parts.second) };
      }
      function tick() {
        if (!el.isConnected) return clearInterval(timer);
        const { day, h, m, s } = etParts();
        const t = h + m / 60;
        const weekday = !['Sat', 'Sun'].includes(day);
        let session = 'Closed'; let cls = 'down';
        if (weekday && t >= 4 && t < 9.5) { session = 'Pre-market'; cls = ''; }
        if (weekday && t >= 9.5 && t < 16) { session = 'OPEN (regular session)'; cls = 'up'; }
        if (weekday && t >= 16 && t < 20) { session = 'After-hours'; cls = ''; }
        const futOpen = (day === 'Sun' && t >= 18) || (['Mon', 'Tue', 'Wed', 'Thu'].includes(day) && !(t >= 17 && t < 18)) || (day === 'Fri' && t < 17);
        set(el, 'clock', `<span class="mono">${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}</span><small>${day}, New York time</small>`);
        set(el, 'stocks', `<span class="${cls}">${session}</span>`);
        set(el, 'fut', futOpen ? '<span class="up">Trading</span>' : '<span class="down">Closed / break</span>');
        set(el, 'crypto', '<span class="up">24/7</span>');
      }
      const timer = setInterval(tick, 1000);
      tick();
    },

    dca: (el, p) => {
      let seed = 4;
      el.innerHTML = `<div class="w-title">Dollar-cost averaging vs lump sum</div>${slider('monthly', 'Invest per month', 50, 1000, 10, p.monthly ?? 200, money)}${slider('months', 'Months', 6, 60, 1, p.months ?? 24, (v) => `${v} months`)}
        <div data-o="chart"></div><div class="w-stats">${stat('DCA avg cost/share', 'dca', true)}${stat('Avg price', 'avg')}${stat('DCA value', 'dv')}${stat('Lump sum value', 'lv')}</div>
        <button class="btn btn-sm" data-new>New random market</button><p class="w-note">Made-up prices. Lump sum tends to win when markets mostly rise; DCA reduces regret and timing risk.</p>`;
      const run = (v) => {
        const r = rng(seed);
        const prices = [50];
        for (let i = 1; i < v.months; i++) prices.push(Math.max(10, prices[i - 1] * (1 + (r() - 0.46) * 0.16)));
        const shares = prices.reduce((a, pr) => a + v.monthly / pr, 0);
        const total = v.monthly * v.months;
        const last = prices[prices.length - 1];
        set(el, 'chart', lineChart([prices], { colors: ['#3d8bfd'] }));
        set(el, 'dca', money(total / shares, 2));
        set(el, 'avg', money(prices.reduce((a, b) => a + b, 0) / prices.length, 2));
        set(el, 'dv', money(shares * last));
        set(el, 'lv', money((total / prices[0]) * last));
      };
      const vals = wire(el, { monthly: money, months: (v) => `${v} months` }, run);
      el.querySelector('[data-new]').onclick = () => { seed = Math.floor(Math.random() * 1e6) + 1; run(vals); };
    },

    'dividend-income': (el, p) => {
      el.innerHTML = `<div class="w-title">Dividend income</div>${slider('port', 'Portfolio value', 1000, 1000000, 1000, p.portfolio ?? 50000, money)}${slider('yld', 'Dividend yield', 0.5, 8, 0.1, p.yield ?? 3.5, (v) => pct(v))}
        <div class="w-stats">${stat('Per year', 'yr', true)}${stat('Per month', 'mo')}${stat('To earn $1,000/mo', 'need')}</div>
        <p class="w-note">Before taxes. Dividends can be cut, and a very high yield is often a warning sign.</p>`;
      wire(el, { port: money, yld: pct }, (v) => {
        const y = v.port * v.yld / 100;
        set(el, 'yr', money(y)); set(el, 'mo', money(y / 12)); set(el, 'need', money(12000 / (v.yld / 100)));
      });
    },

    'bid-ask': (el) => {
      let asks; let bids; let log = [];
      const reset = () => {
        asks = [[100.02, 300], [100.04, 500], [100.06, 800], [100.08, 1000]];
        bids = [[100.0, 400], [99.98, 600], [99.96, 900], [99.94, 1200]];
      };
      reset();
      const draw = () => {
        el.innerHTML = `<div class="w-title">Mini order book</div>
          <div class="book"><div class="book-side asks">${asks.slice().reverse().map(([p, q]) => `<div><span>$${p.toFixed(2)}</span><span>${q}</span></div>`).join('')}</div>
          <div class="book-spread">spread ${(asks[0][0] - bids[0][0]).toFixed(2)}</div>
          <div class="book-side bids">${bids.map(([p, q]) => `<div><span>$${p.toFixed(2)}</span><span>${q}</span></div>`).join('')}</div></div>
          <div class="row-wrap" style="margin:12px 0"><label class="w-lbl" style="margin:0">Shares <input class="input" type="number" min="1" max="3000" value="200" data-qty style="width:100px;padding:6px 10px" /></label>
            <button class="btn btn-sm btn-primary" data-act="mbuy">Market buy</button><button class="btn btn-sm btn-danger" data-act="msell">Market sell</button>
            <button class="btn btn-sm" data-act="lbuy">Limit buy @ $99.98</button><button class="btn btn-sm" data-act="reset">Reset</button></div>
          <div class="w-log">${log.slice(-4).map((l) => `<div>${l}</div>`).join('') || '<div class="muted">Place an order to see where it fills.</div>'}</div>`;
        el.querySelectorAll('[data-act]').forEach((b) => b.onclick = () => act(b.dataset.act, Number(el.querySelector('[data-qty]').value) || 0));
      };
      const sweep = (book, qty) => {
        let left = qty; let cost = 0; const fills = [];
        while (left > 0 && book.length) {
          const [p, q] = book[0];
          const take = Math.min(q, left);
          cost += take * p; left -= take; fills.push(`${take}@${p.toFixed(2)}`);
          if (take === q) book.shift(); else book[0][1] -= take;
        }
        return { filled: qty - left, avg: cost / Math.max(1, qty - left), fills };
      };
      const act = (a, q) => {
        q = clamp(Math.floor(q), 1, 3000);
        if (a === 'reset') { reset(); log = []; return draw(); }
        if (a === 'mbuy') { const r = sweep(asks, q); log.push(`Market BUY ${r.filled}: filled ${r.fills.join(', ')} → avg <b>$${r.avg.toFixed(3)}</b>${r.fills.length > 1 ? ' (you ate through levels = slippage)' : ''}`); }
        if (a === 'msell') { const r = sweep(bids, q); log.push(`Market SELL ${r.filled}: filled ${r.fills.join(', ')} → avg <b>$${r.avg.toFixed(3)}</b>`); }
        if (a === 'lbuy') {
          const lvl = bids.find((b) => b[0] === 99.98);
          if (lvl) lvl[1] += q; else bids.splice(1, 0, [99.98, q]);
          log.push(`Limit BUY ${q} @ $99.98 is <b>resting in the book</b>. It only fills if a seller comes down to your price.`);
        }
        draw();
      };
      draw();
    },

    'pe-ratio': (el, p) => {
      el.innerHTML = `<div class="w-title">P/E ratio</div>${slider('price', 'Share price', 1, 500, 1, p.price ?? 150, money)}${slider('eps', 'Earnings per share (EPS)', 0.1, 30, 0.1, p.eps ?? 6, (v) => money(v, 2))}
        <div class="w-stats">${stat('P/E', 'pe', true)}${stat('Earnings yield', 'ey')}${stat('Years of earnings to "pay back" price', 'yrs')}</div><div data-o="tag"></div>`;
      wire(el, { price: money, eps: (v) => money(v, 2) }, (v) => {
        const pe = v.price / v.eps;
        set(el, 'pe', pe.toFixed(1)); set(el, 'ey', pct(100 / pe)); set(el, 'yrs', `${pe.toFixed(1)} yrs (if earnings never grew)`);
        set(el, 'tag', `<p class="w-note">${pe < 12 ? 'Low P/E: cheap, or the market expects trouble.' : pe < 25 ? 'Middle-of-the-road P/E. Compare with similar companies.' : 'High P/E: investors expect strong growth. Disappointment hurts.'}</p>`);
      });
    },

    'intrinsic-value': (el, p) => {
      el.innerHTML = `<div class="w-title">DCF-lite: what is one share worth?</div>
        ${slider('fcf', 'Free cash flow per share now', 0.5, 20, 0.1, p.fcf ?? 4, (v) => money(v, 2))}${slider('growth', 'Growth per year (forecast period)', 0, 30, 0.5, p.growth ?? 8, (v) => pct(v))}
        ${slider('years', 'Forecast years', 3, 15, 1, p.years ?? 5, (v) => `${v} yrs`)}${slider('discount', 'Discount rate (your required return)', 5, 15, 0.5, p.discount ?? 10, (v) => pct(v))}
        ${slider('terminal', 'Growth forever after', 0, 4, 0.5, p.terminal ?? 2.5, (v) => pct(v))}${slider('price', 'Current share price', 5, 400, 1, 50, money)}
        <div class="w-stats">${stat('Estimated value', 'iv', true)}${stat('From forecast years', 'pv')}${stat('From terminal value', 'tv')}${stat('Margin of safety', 'mos')}</div>
        <p class="w-note">Tiny changes to growth or discount rate swing the answer a lot. That's the lesson: treat a DCF as a range, not a number.</p>`;
      wire(el, { fcf: (v) => money(v, 2), growth: pct, years: (v) => `${v} yrs`, discount: pct, terminal: pct, price: money }, (v) => {
        const d = v.discount / 100; const g = v.growth / 100; const tg = Math.min(v.terminal / 100, d - 0.005);
        let cf = v.fcf; let pv = 0;
        for (let t = 1; t <= v.years; t++) { cf *= 1 + g; pv += cf / (1 + d) ** t; }
        const tv = (cf * (1 + tg)) / (d - tg) / (1 + d) ** v.years;
        const iv = pv + tv;
        const mos = (iv - v.price) / iv;
        set(el, 'iv', money(iv, 2)); set(el, 'pv', money(pv, 2)); set(el, 'tv', `${money(tv, 2)} (${pct((tv / iv) * 100, 0)})`);
        set(el, 'mos', mos > 0 ? `<span class="up">${pct(mos * 100, 0)} below value</span>` : `<span class="down">${pct(-mos * 100, 0)} above value</span>`);
      });
    },

    'position-size': (el, p) => {
      el.innerHTML = `<div class="w-title">Position size calculator</div>${slider('acct', 'Account size', 1000, 200000, 500, p.account ?? 10000, money)}${slider('risk', 'Risk per trade', 0.25, 5, 0.25, p.riskPct ?? 1, (v) => pct(v, 2))}
        ${slider('entry', 'Entry price', 1, 500, 0.5, p.entry ?? 50, (v) => money(v, 2))}${slider('stop', 'Stop-loss price', 0.5, 499, 0.5, p.stop ?? 47, (v) => money(v, 2))}
        <div class="w-stats">${stat('Buy this many shares', 'sh', true)}${stat('Max loss', 'loss')}${stat('Position value', 'val')}${stat('% of account', 'pa')}</div><div data-o="msg"></div>`;
      wire(el, { acct: money, risk: (v) => pct(v, 2), entry: (v) => money(v, 2), stop: (v) => money(v, 2) }, (v) => {
        const per = v.entry - v.stop;
        if (per <= 0) { set(el, 'sh', '—'); set(el, 'msg', '<div class="w-warn">For a long trade, the stop must be below the entry.</div>'); return; }
        const riskD = v.acct * v.risk / 100;
        let sh = Math.floor(riskD / per);
        const capped = sh * v.entry > v.acct;
        if (capped) sh = Math.floor(v.acct / v.entry);
        set(el, 'sh', sh.toLocaleString()); set(el, 'loss', money(sh * per, 2)); set(el, 'val', money(sh * v.entry)); set(el, 'pa', pct((sh * v.entry / v.acct) * 100, 0));
        set(el, 'msg', capped ? '<div class="w-warn">Capped by your cash: the stop is so tight the math wants more shares than you can afford.</div>' : '');
      });
    },

    'risk-reward': (el, p) => {
      el.innerHTML = `<div class="w-title">Risk / reward</div>${slider('entry', 'Entry', 10, 300, 0.5, p.entry ?? 100, (v) => money(v, 2))}${slider('stop', 'Stop', 5, 299, 0.5, p.stop ?? 95, (v) => money(v, 2))}${slider('target', 'Target', 11, 400, 0.5, p.target ?? 115, (v) => money(v, 2))}
        <div data-o="vis"></div><div class="w-stats">${stat('Reward : risk', 'rr', true)}${stat('Breakeven win rate', 'be')}</div>`;
      wire(el, { entry: (v) => money(v, 2), stop: (v) => money(v, 2), target: (v) => money(v, 2) }, (v) => {
        const risk = v.entry - v.stop; const rew = v.target - v.entry;
        if (risk <= 0 || rew <= 0) { set(el, 'rr', '—'); set(el, 'be', 'Stop must be below entry, target above'); set(el, 'vis', ''); return; }
        const rr = rew / risk;
        set(el, 'rr', `${rr.toFixed(2)} : 1`); set(el, 'be', pct(100 / (1 + rr), 0));
        set(el, 'vis', `<div class="rr-bar"><span class="rr-risk" style="flex:${risk}">-${money(risk, 2)}</span><span class="rr-rew" style="flex:${rew}">+${money(rew, 2)}</span></div>`);
      });
    },

    'candle-builder': (el) => {
      el.innerHTML = `<div class="w-title">Build a candle</div><div class="candle-wrap"><div data-o="svg"></div><div style="flex:1">
        ${slider('o', 'Open', 0, 100, 1, 40)}${slider('c', 'Close', 0, 100, 1, 70)}${slider('h', 'High', 0, 100, 1, 85)}${slider('l', 'Low', 0, 100, 1, 30)}
        <div class="w-stats">${stat('This candle', 'name', true)}</div></div></div>`;
      wire(el, { o: (v) => v, c: (v) => v, h: (v) => v, l: (v) => v }, (v) => {
        const hi = Math.max(v.h, v.o, v.c); const lo = Math.min(v.l, v.o, v.c);
        const Y = (x) => 10 + (100 - x) * 2.2;
        const up = v.c >= v.o;
        const body = Math.abs(v.c - v.o); const range = hi - lo || 1;
        const lower = Math.min(v.o, v.c) - lo; const upper = hi - Math.max(v.o, v.c);
        let name = up ? 'Bullish candle' : 'Bearish candle';
        if (body / range < 0.1) name = 'Doji (indecision)';
        else if (lower > body * 2 && upper < body * 0.6) name = 'Hammer shape (buyers pushed back)';
        else if (upper > body * 2 && lower < body * 0.6) name = 'Shooting star shape (sellers pushed back)';
        else if (body / range > 0.85) name = up ? 'Big bullish (marubozu-ish)' : 'Big bearish (marubozu-ish)';
        set(el, 'svg', `<svg viewBox="0 0 120 240" width="120" height="240"><line x1="60" x2="60" y1="${Y(hi)}" y2="${Y(lo)}" stroke="#17140f" stroke-width="4"/>
          <rect x="35" y="${Y(Math.max(v.o, v.c))}" width="50" height="${Math.max(3, body * 2.2)}" fill="${up ? '#1fbf75' : '#ff5a4e'}" stroke="#17140f" stroke-width="3"/></svg>`);
        set(el, 'name', name);
      });
    },

    'option-payoff': (el, p) => {
      el.innerHTML = `<div class="w-title">Option payoff explorer</div>
        <div class="row-wrap" style="margin-bottom:8px"><div class="tabs" data-g="kind"><button data-v="call">Call</button><button data-v="put">Put</button></div>
          <div class="tabs" data-g="side"><button data-v="long">Buy (long)</button><button data-v="short">Sell (short)</button></div></div>
        ${slider('strike', 'Strike', 50, 150, 1, p.strike ?? 100, money)}${slider('premium', 'Premium (per share)', 0.5, 20, 0.25, p.premium ?? 3, (v) => money(v, 2))}${slider('spot', 'Price at expiration', 50, 150, 1, p.spot ?? p.strike ?? 100, money)}
        <div data-o="chart"></div><div class="w-stats">${stat('P/L at that price (1 contract)', 'pl', true)}${stat('Breakeven', 'be')}${stat('Max gain', 'mg')}${stat('Max loss', 'ml')}</div>`;
      const st = { kind: p.kind || 'call', side: p.side || 'long' };
      let vals;
      const update = (v) => {
        vals = v;
        const s = st.side === 'long' ? 1 : -1;
        const legs = [{ type: st.kind, side: s, strike: v.strike, premium: v.premium }];
        set(el, 'chart', Diagrams.payoff(legs, { lo: 50, hi: 150, spot: v.spot }));
        const intrinsic = st.kind === 'call' ? Math.max(0, v.spot - v.strike) : Math.max(0, v.strike - v.spot);
        const pl = s * (intrinsic - v.premium) * 100;
        set(el, 'pl', `<span class="${pl >= 0 ? 'up' : 'down'}">${money(pl)}</span>`);
        set(el, 'be', money(st.kind === 'call' ? v.strike + v.premium : v.strike - v.premium, 2));
        const prem = v.premium * 100;
        if (st.side === 'long') {
          set(el, 'mg', st.kind === 'call' ? 'Unlimited' : money((v.strike - v.premium) * 100));
          set(el, 'ml', money(-prem));
        } else {
          set(el, 'mg', money(prem));
          set(el, 'ml', st.kind === 'call' ? '<span class="down">Unlimited</span>' : `<span class="down">${money(-(v.strike - v.premium) * 100)}</span>`);
        }
      };
      el.querySelectorAll('.tabs').forEach((g) => {
        const paint = () => g.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === st[g.dataset.g]));
        g.querySelectorAll('button').forEach((b) => b.onclick = () => { st[g.dataset.g] = b.dataset.v; paint(); update(vals); });
        paint();
      });
      wire(el, { strike: money, premium: (v) => money(v, 2), spot: money }, update);
    },

    'option-chain': (el, p) => {
      const spot = p.spot ?? 100;
      // Black-Scholes with 30% vol, 30 days, 4% rate: illustrative premiums
      const N = (x) => { const t = 1 / (1 + 0.2316419 * Math.abs(x)); const d = 0.3989423 * Math.exp(-x * x / 2); const pr = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return x > 0 ? 1 - pr : pr; };
      const bs = (K, kind) => { const T = 30 / 365; const v = 0.3; const r = 0.04; const d1 = (Math.log(spot / K) + (r + v * v / 2) * T) / (v * Math.sqrt(T)); const d2 = d1 - v * Math.sqrt(T); return kind === 'call' ? spot * N(d1) - K * Math.exp(-r * T) * N(d2) : K * Math.exp(-r * T) * N(-d2) - spot * N(-d1); };
      const strikes = [-15, -10, -5, 0, 5, 10, 15].map((d) => Math.round(spot + d));
      el.innerHTML = `<div class="w-title">Option chain (stock at ${money(spot)}, 30 days left)</div>
        <table class="chain"><thead><tr><th>Call price</th><th>Strike</th><th>Put price</th></tr></thead><tbody>
        ${strikes.map((K) => `<tr><td class="${K < spot ? 'itm' : ''}" data-k="${K}" data-t="call">${bs(K, 'call').toFixed(2)}</td><td class="strike">${money(K)}</td><td class="${K > spot ? 'itm' : ''}" data-k="${K}" data-t="put">${bs(K, 'put').toFixed(2)}</td></tr>`).join('')}
        </tbody></table><div class="w-explain" data-o="ex">Tap any price. Shaded cells are in the money.</div>
        <p class="w-note">Prices are illustrative (a textbook pricing model), quoted per share. One contract = 100 shares.</p>`;
      el.querySelectorAll('td[data-k]').forEach((td) => td.onclick = () => {
        el.querySelectorAll('td.sel').forEach((x) => x.classList.remove('sel'));
        td.classList.add('sel');
        const K = Number(td.dataset.k); const kind = td.dataset.t; const price = bs(K, kind);
        const intr = kind === 'call' ? Math.max(0, spot - K) : Math.max(0, K - spot);
        const status = intr > 0 ? 'in the money' : K === spot ? 'at the money' : 'out of the money';
        set(el, 'ex', `<b>${money(K)} ${kind}</b> is ${status}. Price ${money(price, 2)} = intrinsic <b>${money(intr, 2)}</b> + time value <b>${money(price - intr, 2)}</b>. One contract costs about <b>${money(price * 100)}</b>.`);
      });
    },

    'theta-decay': (el, p) => {
      const P = p.premium ?? 4; const D = p.days ?? 45;
      el.innerHTML = `<div class="w-title">Watch time value melt</div>${slider('d', 'Days left', 0, D, 1, D, (v) => `${v} days`)}<div data-o="chart"></div>
        <div class="w-stats">${stat('Time value left', 'left', true)}${stat('Lost today (approx.)', 'today')}</div>
        <p class="w-note">At-the-money option, nothing else changing. Decay roughly follows the square root of time left, which is why the last weeks hurt most.</p>`;
      const curve = Array.from({ length: D + 1 }, (_, i) => P * Math.sqrt((D - i) / D));
      wire(el, { d: (v) => `${v} days` }, (v) => {
        const now = P * Math.sqrt(v.d / D);
        const tomorrow = P * Math.sqrt(Math.max(0, v.d - 1) / D);
        set(el, 'left', `${money(now, 2)} <small>(${money(now * 100)} per contract)</small>`);
        set(el, 'today', `<span class="down">-${money((now - tomorrow) * 100, 2)}</span> per contract`);
        const X = (i) => 10 + (i / D) * 600;
        const Y = (val) => 10 + (1 - val / P) * 130;
        const path = curve.map((val, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(val).toFixed(1)}`).join(' ');
        const i = D - v.d;
        set(el, 'chart', `<svg class="w-chart" viewBox="0 0 620 150"><path d="${path}" fill="none" stroke="#ff5a4e" stroke-width="3.5"/>
          <line x1="${X(i)}" x2="${X(i)}" y1="6" y2="144" stroke="#17140f" stroke-width="2" stroke-dasharray="4 4"/>
          <circle cx="${X(i)}" cy="${Y(curve[i])}" r="7" fill="#ffd23f" stroke="#17140f" stroke-width="2.5"/></svg>`);
      });
    },

    'futures-leverage': (el, p) => {
      const SPECS = {
        ES: { name: 'E-mini S&P 500', mult: 50, tick: 0.25, price: 6000, margin: 24000 },
        MES: { name: 'Micro E-mini S&P 500', mult: 5, tick: 0.25, price: 6000, margin: 2400 },
        NQ: { name: 'E-mini Nasdaq-100', mult: 20, tick: 0.25, price: 21000, margin: 33000 },
        MNQ: { name: 'Micro E-mini Nasdaq-100', mult: 2, tick: 0.25, price: 21000, margin: 3300 },
        CL: { name: 'Crude oil (1,000 barrels)', mult: 1000, tick: 0.01, price: 70, margin: 6500 },
        GC: { name: 'Gold (100 oz)', mult: 100, tick: 0.1, price: 4000, margin: 18000 },
      };
      const start = SPECS[p.contract] ? p.contract : 'MES';
      el.innerHTML = `<div class="w-title">Futures leverage</div>
        <label class="w-lbl">Contract <select class="input" data-k="c" style="margin-top:6px">${Object.entries(SPECS).map(([k, s]) => `<option value="${k}" ${k === start ? 'selected' : ''}>${k}: ${s.name}</option>`).join('')}</select></label>
        ${slider('move', 'Price move (%)', -5, 5, 0.1, 1, (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`)}
        <div class="w-stats">${stat('Notional (what you control)', 'not', true)}${stat('Margin (illustrative)', 'mar')}${stat('Tick value', 'tick')}${stat('P/L for this move', 'pl')}${stat('Return on margin', 'rom')}</div>
        <p class="w-note">Margins are illustrative and change often; prices are round example levels. Losses can exceed the margin you posted.</p>`;
      wire(el, { move: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` }, (v) => {
        const s = SPECS[v.c];
        const notional = s.price * s.mult;
        const pl = notional * v.move / 100;
        set(el, 'not', money(notional)); set(el, 'mar', money(s.margin)); set(el, 'tick', `${s.tick} pts = ${money(s.tick * s.mult, 2)}`);
        set(el, 'pl', `<span class="${pl >= 0 ? 'up' : 'down'}">${money(pl)}</span>`);
        set(el, 'rom', `<span class="${pl >= 0 ? 'up' : 'down'}">${pct((pl / s.margin) * 100, 0)}</span>`);
      });
    },

    'margin-call': (el) => {
      const START = 5000; const MAINT = 3600; const PT = 5; // 1 MES-like contract, $5/pt
      let day; let bal; let hist; let r; let over;
      const reset = () => { day = 0; bal = START; hist = [START]; r = rng(Math.floor(Math.random() * 1e6) + 1); over = false; };
      const draw = (msg = '') => {
        el.innerHTML = `<div class="w-title">Margin call simulator (1 micro contract, $5 per point)</div>
          ${lineChart([hist.length > 1 ? hist : [START, START]], { colors: ['#17140f'], band: MAINT })}
          <div class="w-stats">${stat('Day', 'd')}${stat('Account', 'b', true)}${stat('Maintenance level', 'm')}</div>
          <div data-o="msg">${msg}</div>
          <div class="row-wrap"><button class="btn btn-sm btn-primary" data-next ${over ? 'disabled' : ''}>Next trading day</button><button class="btn btn-sm" data-reset>Start over</button></div>`;
        set(el, 'd', day); set(el, 'b', money(bal)); set(el, 'm', `<span class="down">${money(MAINT)}</span>`);
        el.querySelector('[data-next]').onclick = next;
        el.querySelector('[data-reset]').onclick = () => { reset(); draw(); };
      };
      const next = () => {
        day++;
        const pts = Math.round((r() - 0.56) * 130);
        bal += pts * PT;
        hist.push(bal);
        let msg = `<p class="w-note">Settled today: ${pts >= 0 ? '+' : ''}${pts} points = <b class="${pts >= 0 ? 'up' : 'down'}">${money(pts * PT)}</b>, credited or debited in cash tonight.</p>`;
        if (bal < MAINT) {
          over = true;
          msg = `<div class="w-warn"><b>MARGIN CALL on day ${day}.</b> Your account (${money(bal)}) fell below maintenance. Deposit more cash or the broker closes your position, possibly at a terrible price.</div>`;
          UI.cameo('grizz', 'Margin call! This is why we size small and use stops.', 'warn', 3200);
        }
        draw(msg);
      };
      reset();
      draw('<p class="w-note">Start with $5,000. Each click settles one day of gains or losses.</p>');
    },
  };

  function mount(el, name, props = {}) {
    const fn = W[name];
    if (!fn) { el.innerHTML = `<div class="empty-state">Widget "${escapeHtml(name)}" is missing.</div>`; return; }
    try {
      el.classList.add('widget', `w-${name}`);
      fn(el, props || {});
    } catch (err) {
      console.error('widget failed', name, err);
      el.innerHTML = '<div class="empty-state">This tool failed to load.</div>';
    }
  }

  return { mount, names: () => Object.keys(W) };
})();

window.Widgets = Widgets;
