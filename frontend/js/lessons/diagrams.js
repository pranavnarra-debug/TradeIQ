/* ============================================================
   TradeIQ — diagrams.js
   Every named figure used by lesson content, drawn as inline SVG in
   the house style: ink outlines, flat paper fills, hard shadows.
   Payoff diagrams are computed from the actual option math, and
   chart diagrams from a seeded price series, so they're accurate.
   ============================================================ */

const Diagrams = (() => {
  const C = {
    ink: '#17140f', paper: '#fffaf0', paper2: '#efe5d0', muted: '#776d5c', soft: '#d8ccb4',
    mint: '#1fbf75', mintL: '#c9f2dc', tomato: '#ff5a4e', tomatoL: '#ffd7d2', sun: '#ffd23f', sunL: '#fff1b8',
    sky: '#3d8bfd', skyL: '#d6e6ff', grape: '#8b5cf6', grapeL: '#e6dcff', tang: '#ff7a45', tangL: '#ffe0d1',
  };
  const FONT = "font-family=\"'Bricolage Grotesque Variable', sans-serif\"";
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // ---------- primitives ----------
  const svg = (w, h, body, label = 'Diagram') => `<svg class="diagram" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" ${FONT}>
    <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C.ink}"/></marker></defs>${body}</svg>`;
  const T = (x, y, s, { size = 15, w = 600, anchor = 'middle', fill = C.ink, mono = false } = {}) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" text-anchor="${anchor}" fill="${fill}" ${mono ? 'font-family="JetBrains Mono, monospace"' : ''}>${esc(s)}</text>`;
  function box(x, y, w, h, fill, label, sub, { r = 12, size = 15 } = {}) {
    return `<rect x="${x + 4}" y="${y + 4}" width="${w}" height="${h}" rx="${r}" fill="${C.ink}"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${C.ink}" stroke-width="2.5"/>
      ${label ? T(x + w / 2, y + h / 2 + (sub ? -3 : 5), label, { size, w: 800 }) : ''}
      ${sub ? T(x + w / 2, y + h / 2 + 15, sub, { size: 12, w: 500, fill: C.muted }) : ''}`;
  }
  const arrow = (x1, y1, x2, y2, { label, dash = false, color = C.ink, lx, ly, curve = 0 } = {}) => {
    const mx = (x1 + x2) / 2 + curve;
    const my = (y1 + y2) / 2 - Math.abs(curve) * 0.3;
    const d = curve ? `M${x1},${y1} Q${mx},${my} ${x2},${y2}` : `M${x1},${y1} L${x2},${y2}`;
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" ${dash ? 'stroke-dasharray="6 5"' : ''} marker-end="url(#ah)"/>
      ${label ? `<g>${T(lx ?? mx, (ly ?? my) - 6, label, { size: 12.5, w: 700, fill: C.ink })}</g>` : ''}`;
  };
  const line = (x1, y1, x2, y2, color = C.ink, w = 2, dash = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
  const pathFrom = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const poly = (pts, color, w = 3, extra = '') => `<path d="${pathFrom(pts)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
  const pill = (x, y, s, fill) => {
    const w = s.length * 7.4 + 18;
    return `<rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="24" rx="12" fill="${fill}" stroke="${C.ink}" stroke-width="2"/>${T(x, y + 4, s, { size: 12.5, w: 800 })}`;
  };
  const frame = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>`;

  // seeded random for repeatable "market" series
  function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }
  function series(n, { seed = 7, start = 100, drift = 0.1, vol = 1.6, shape } = {}) {
    const r = rng(seed);
    const out = [];
    let p = start;
    for (let i = 0; i < n; i++) {
      const target = shape ? shape(i / (n - 1)) : null;
      const pull = target != null ? (target - p) * 0.25 : 0;
      const o = p;
      p = p + drift + pull + (r() - 0.5) * vol * 2;
      const c = p;
      const hi = Math.max(o, c) + r() * vol;
      const lo = Math.min(o, c) - r() * vol;
      out.push({ o, c, hi, lo, v: 40 + r() * 60 + Math.abs(c - o) * 25 });
    }
    return out;
  }
  function scaler(vals, top, bottom) {
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const pad = (max - min) * 0.08 || 1;
    return (v) => bottom - ((v - (min - pad)) / (max - min + 2 * pad)) * (bottom - top);
  }
  function candles(data, x0, x1, y) {
    const step = (x1 - x0) / data.length;
    const bw = Math.max(3, step * 0.6);
    return data.map((d, i) => {
      const x = x0 + i * step + step / 2;
      const up = d.c >= d.o;
      const top = y(Math.max(d.o, d.c));
      const h = Math.max(2, y(Math.min(d.o, d.c)) - top);
      return `${line(x, y(d.hi), x, y(d.lo), C.ink, 1.6)}<rect x="${x - bw / 2}" y="${top}" width="${bw}" height="${h}" fill="${up ? C.mint : C.tomato}" stroke="${C.ink}" stroke-width="1.4"/>`;
    }).join('');
  }
  const sma = (arr, n) => arr.map((_, i) => (i < n - 1 ? null : arr.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n));
  const ema = (arr, n) => { const k = 2 / (n + 1); let e = arr[0]; return arr.map((v) => (e = v * k + e * (1 - k))); };
  const xsOf = (n, x0, x1) => (i) => x0 + ((x1 - x0) / n) * (i + 0.5);

  // ---------- option payoff plotter ----------
  // legs: [{type:'call'|'put'|'stock', side:1|-1, strike, premium, qty}] per-share P/L
  function payoffAt(legs, S) {
    return legs.reduce((sum, l) => {
      const q = l.qty || 1;
      if (l.type === 'stock') return sum + l.side * (S - l.strike) * q;
      const intrinsic = l.type === 'call' ? Math.max(0, S - l.strike) : Math.max(0, l.strike - S);
      return sum + l.side * (intrinsic - l.premium) * q;
    }, 0);
  }
  function payoff(legs, { lo = 60, hi = 140, title = '', notes = [], spot } = {}) {
    const W = 640; const H = 352; const x0 = 70; const x1 = 610; const yT = 58; const yB = 296;
    const N = 160;
    const pts = Array.from({ length: N + 1 }, (_, i) => { const S = lo + ((hi - lo) * i) / N; return [S, payoffAt(legs, S)]; });
    const vals = pts.map((p) => p[1]);
    const maxAbs = Math.max(5, ...vals.map(Math.abs)) * 1.15;
    const X = (S) => x0 + ((S - lo) / (hi - lo)) * (x1 - x0);
    const Y = (v) => (yT + yB) / 2 - (v / maxAbs) * ((yB - yT) / 2);
    const y0 = Y(0);
    // fill profit/loss areas
    let areas = '';
    for (let i = 0; i < N; i++) {
      const [sa, va] = pts[i]; const [sb, vb] = pts[i + 1];
      const col = (va + vb) / 2 >= 0 ? C.mintL : C.tomatoL;
      areas += `<path d="M${X(sa)},${y0} L${X(sa)},${Y(va)} L${X(sb)},${Y(vb)} L${X(sb)},${y0} Z" fill="${col}"/>`;
    }
    // breakevens
    const bes = [];
    for (let i = 0; i < N; i++) {
      const [sa, va] = pts[i]; const [sb, vb] = pts[i + 1];
      if ((va < 0 && vb >= 0) || (va > 0 && vb <= 0)) bes.push(sa + ((0 - va) / (vb - va)) * (sb - sa));
    }
    const strikes = [...new Set(legs.filter((l) => l.type !== 'stock').map((l) => l.strike))];
    const ticks = [];
    for (let s = Math.ceil(lo / 10) * 10; s <= hi; s += 10) ticks.push(s);
    const body = `${frame(x0 - 10, yT - 10, x1 - x0 + 20, yB - yT + 20)}${areas}
      ${line(x0, y0, x1, y0, C.ink, 2)}
      ${ticks.map((s) => `${line(X(s), yB + 10, X(s), yB + 16)}${T(X(s), yB + 32, `$${s}`, { size: 12, w: 600, fill: C.muted })}`).join('')}
      ${strikes.map((k) => `${line(X(k), yT, X(k), yB, C.muted, 1.5, '4 4')}${T(X(k), yT - 14, `K $${k}`, { size: 12, w: 800 })}`).join('')}
      ${spot ? `${line(X(spot), yT, X(spot), yB, C.sky, 2, '2 4')}${T(X(spot), yB - 6, 'now', { size: 11, w: 700, fill: C.sky })}` : ''}
      ${poly(pts.map(([S, v]) => [X(S), Y(v)]), C.ink, 3.5)}
      ${bes.map((b) => `<circle cx="${X(b)}" cy="${y0}" r="6" fill="${C.sun}" stroke="${C.ink}" stroke-width="2"/>${T(X(b), y0 + 22, `BE $${b.toFixed(b % 1 ? 2 : 0)}`, { size: 11.5, w: 800 })}`).join('')}
      ${T(x0 - 18, Y(maxAbs / 1.3), 'profit', { size: 12, w: 700, fill: C.mint, anchor: 'end' })}
      ${T(x0 - 18, Y(-maxAbs / 1.3), 'loss', { size: 12, w: 700, fill: C.tomato, anchor: 'end' })}
      ${T(x0 - 18, y0 + 4, '$0', { size: 12, w: 700, anchor: 'end' })}
      ${title ? T(W / 2, 22, title, { size: 15, w: 800 }) : ''}
      ${notes.map((n, i) => pill(i ? x1 - n.length * 3.7 - 18 : x0 + n.length * 3.7 + 18, yT + 16, n, i % 2 ? C.sunL : C.paper)).join('')}
      ${T(W / 2, H - 4, 'Stock price at expiration (per-share P/L; one contract = 100x)', { size: 11.5, w: 600, fill: C.muted })}`;
    return svg(W, H, body, title || 'Option payoff diagram');
  }

  // ---------- generic TA chart frame ----------
  function chartFrame(data, { overlays = [], top = 30, bottom = 250, x0 = 30, x1 = 610, extra = '', h = 290, label = 'Price chart', yvals } = {}) {
    const vals = yvals || data.flatMap((d) => [d.hi, d.lo]).concat(overlays.flatMap((o) => o.vals.filter((v) => v != null)));
    const y = scaler(vals, top, bottom);
    const xi = xsOf(data.length, x0, x1);
    const ov = overlays.map((o) => poly(o.vals.map((v, i) => (v == null ? null : [xi(i), y(v)])).filter(Boolean), o.color, o.w || 3, o.dash ? `stroke-dasharray="${o.dash}"` : '')).join('');
    return { y, xi, svg: svg(640, h, `${frame(x0 - 12, top - 14, x1 - x0 + 24, bottom - top + 28)}${candles(data, x0, x1, y)}${ov}${extra}`, label) };
  }

  // ---------- the catalog ----------
  const D = {
    // ===== money =====
    'money-flow': () => svg(640, 340, `
      ${box(250, 14, 140, 52, C.grapeL, 'The Fed', 'sets the rate')}
      ${box(250, 140, 140, 60, C.sunL, 'Banks', 'hold + lend')}
      ${box(30, 140, 150, 60, C.skyL, 'Households', 'you, Maya, Leo')}
      ${box(460, 140, 150, 60, C.mintL, 'Businesses', "Ms. Ortiz's bakery")}
      ${box(250, 266, 140, 52, C.tangL, 'Government', 'taxes + spending')}
      ${arrow(320, 68, 320, 136, { label: 'rates + reserves', lx: 390 })}
      ${arrow(184, 158, 246, 158, { label: 'deposits' })}
      ${arrow(394, 158, 456, 158, { label: 'loans' })}
      ${arrow(456, 186, 186, 186, { label: 'wages + dividends', curve: 0, ly: 222 })}
      ${arrow(105, 204, 246, 284, { label: 'taxes', curve: -30 })}
      ${arrow(394, 284, 535, 204, { label: 'contracts, spending', curve: -30 })}`, 'How money flows through the economy'),

    'bank-lending': () => svg(640, 320, `
      ${box(20, 40, 150, 70, C.skyL, 'Maya deposits', '$1,000')}
      ${box(245, 40, 150, 70, C.sunL, 'Bank A', 'keeps some, lends $900')}
      ${box(470, 40, 150, 70, C.mintL, 'Leo borrows', '$900 for a bike')}
      ${box(470, 200, 150, 70, C.tangL, 'Bike shop', 'gets paid $900')}
      ${box(245, 200, 150, 70, C.sunL, 'Bank B', 'new $900 deposit')}
      ${box(20, 200, 150, 70, C.grapeL, 'Lends again', '...and the chain continues')}
      ${arrow(172, 75, 241, 75)}${arrow(397, 75, 466, 75)}${arrow(545, 114, 545, 196)}${arrow(466, 235, 399, 235)}${arrow(241, 235, 174, 235)}
      ${T(320, 160, "One deposit -> a loan -> someone else's deposit. That's how banks create money.", { size: 13.5, w: 700 })}`, 'Bank lending creates deposits'),

    'fed-rates': () => svg(640, 330, `
      ${box(240, 14, 160, 56, C.grapeL, 'Fed funds rate', 'FOMC decision')}
      ${box(240, 120, 160, 56, C.sunL, 'Bank borrowing costs', '')}
      ${arrow(320, 72, 320, 116)}
      ${[['Mortgages', C.skyL], ['Credit cards', C.tomatoL], ['Savings APY', C.mintL], ['Stock prices', C.tangL]].map(([t, f], i) => `${box(18 + i * 158, 236, 140, 60, f, t, i === 3 ? 'valuations shift' : 'move with it')}${arrow(320, 178, 88 + i * 158, 232, { curve: (i - 1.5) * 10 })}`).join('')}
      ${pill(530, 44, 'Rate up = borrowing costs more', C.tomatoL)}${pill(110, 44, 'Rate down = borrowing cheaper', C.mintL)}`, 'How the Fed rate ripples out'),

    'payment-rails': () => {
      const rows = [['Card swipe', 'Authorize in seconds, settle in 1-2 days', C.skyL, 0.35], ['ACH', 'Batches, usually 1-3 business days', C.sunL, 0.75],
        ['Wire (Fedwire)', 'Same day, final, fees', C.tangL, 0.25], ['Instant (FedNow / RTP)', 'Seconds, 24/7, final', C.mintL, 0.06], ['P2P apps', 'Feels instant; bank rails behind it', C.grapeL, 0.3]];
      return svg(640, 320, rows.map(([n, d, f, w], i) => `${box(16, 18 + i * 60, 180, 44, f, n, '', { size: 14 })}
        <rect x="220" y="${22 + i * 60}" width="${400 * w}" height="16" rx="6" fill="${f}" stroke="${C.ink}" stroke-width="2"/>${T(220, 58 + i * 60, d, { size: 12.5, w: 600, anchor: 'start' })}`).join('')
        + T(410, 312, 'bar length = how long until the money is really moved', { size: 11.5, w: 600, fill: C.muted }), 'Payment rails and speeds');
    },

    'inflation-basket': () => {
      const yrs = [['2016', 50], ['2020', 56], ['2023', 66], ['2026', 72]];
      return svg(640, 330, yrs.map(([y, v], i) => {
        const h = v * 3; const x = 60 + i * 145; const base = 290;
        return `<rect x="${x + 4}" y="${base - h + 4}" width="90" height="${h}" rx="8" fill="${C.ink}"/><rect x="${x}" y="${base - h}" width="90" height="${h}" rx="8" fill="${[C.mintL, C.sunL, C.tangL, C.tomatoL][i]}" stroke="${C.ink}" stroke-width="2.5"/>
          ${T(x + 45, base - h - 10, `$${v}`, { size: 18, w: 800, mono: true })}${T(x + 45, 316, y, { size: 14, w: 700 })}
          ${[0, 1, 2].map((k) => `<rect x="${x + 14 + k * 22}" y="${base - 14 - k * 4}" width="18" height="10" rx="3" fill="#fff" stroke="${C.ink}" stroke-width="1.5"/>`).join('')}`;
      }).join('') + T(320, 24, 'Same grocery basket, bigger receipt (illustrative)', { size: 14, w: 800 }), 'Inflation basket');
    },

    'compound-curve': () => {
      const yrs = 40; const X = (t) => 60 + t * 13.5; const Y = (v) => 270 - (v / 46000) * 230;
      const simple = Array.from({ length: yrs + 1 }, (_, t) => [X(t), Y(1000 + 1000 * 0.08 * t * 1)]);
      const comp = Array.from({ length: yrs + 1 }, (_, t) => [X(t), Y(1000 * Math.pow(1.08, t))]);
      const cash = Array.from({ length: yrs + 1 }, (_, t) => [X(t), Y(1000)]);
      return svg(640, 310, `${frame(44, 26, 570, 258)}
        ${[0, 10, 20, 30, 40].map((t) => `${T(X(t), 300, `${t} yrs`, { size: 12, w: 600, fill: C.muted })}`).join('')}
        ${poly(cash, C.muted, 2.5, 'stroke-dasharray="6 5"')}${poly(simple, C.sky, 3.5)}${poly(comp, C.mint, 4.5)}
        ${pill(470, 70, `Compound: $${Math.round(1000 * Math.pow(1.08, 40)).toLocaleString()}`, C.mintL)}${pill(500, 200, 'Simple: $4,200', C.skyL)}${pill(160, 250, 'Cash: $1,000', C.paper)}
        ${T(330, 18, '$1,000 at 8% a year for 40 years (illustrative)', { size: 14, w: 800 })}`, 'Simple vs compound growth');
    },

    'risk-ladder': () => {
      const rungs = [['Cash / savings', 'tiny swings, inflation risk', C.mintL], ['Bonds / T-bills', 'small swings', C.skyL], ['Index funds', 'medium swings, long-run growth', C.sunL], ['Single stocks', 'big swings', C.tangL], ['Options / futures / crypto', 'huge swings, can go to zero', C.tomatoL]];
      return svg(640, 330, `${line(40, 300, 40, 24, C.ink, 3)}<path d="M33,32 L40,18 L47,32 Z" fill="${C.ink}"/>${T(48, 16, 'more risk + more potential return', { size: 12.5, w: 700, anchor: 'start' })}
        ${rungs.map(([n, d, f], i) => box(70 + i * 22, 250 - i * 56, 440 - i * 22, 44, f, n, d, { size: 14.5 })).join('')}
        ${UIgrizz(560, 34)}`, 'Risk ladder');
    },

    diversification: () => {
      const one = series(40, { seed: 3, vol: 4.5, drift: 0.15 }).map((d) => d.c);
      const many = sma(series(40, { seed: 3, vol: 4.5, drift: 0.15 }).map((d, i) => d.c), 1).map((v, i) => 100 + i * 0.2 + Math.sin(i / 3) * 1.6);
      const y = scaler(one.concat(many), 40, 270);
      const xi = xsOf(40, 50, 610);
      return svg(640, 310, `${frame(36, 26, 588, 258)}${poly(one.map((v, i) => [xi(i), y(v)]), C.tomato, 3)}${poly(many.map((v, i) => [xi(i), y(v)]), C.mint, 4.5)}
        ${pill(150, 50, 'One stock: wild ride', C.tomatoL)}${pill(470, 300 - 30, 'Basket of 500: smoother', C.mintL)}`, 'Diversification smooths the ride');
    },

    'asset-classes': () => {
      const items = [['Stocks', 'own a piece of a company', C.mintL, 'bull'], ['Bonds', 'lend money, get interest', C.skyL, 'receipt'], ['Cash', 'safe, slow, inflation bites', C.sunL, 'coin'], ['Real estate', 'property + rent', C.tangL, 'house'], ['Commodities', 'oil, gold, wheat', C.grapeL, 'gold']];
      return svg(640, 300, items.map(([n, d, f, ic], i) => {
        const x = 12 + (i % 3) * 210 + (i >= 3 ? 105 : 0); const y = i < 3 ? 20 : 160;
        return `${box(x, y, 190, 116, f, '', '')}<g transform="translate(${x + 79},${y + 12}) scale(2.6)">${iconPaths(ic)}</g>${T(x + 95, y + 78, n, { size: 17, w: 800 })}${T(x + 95, y + 98, d, { size: 12, w: 500, fill: C.muted })}`;
      }).join(''), 'Asset classes');
    },

    'account-types': () => {
      const a = [['Taxable brokerage', 'Any amount, any time. Gains taxed.', C.paper], ['Roth IRA', 'Pay tax now, grow + withdraw tax-free in retirement', C.mintL], ['Traditional IRA', 'Tax break now, taxed when you withdraw', C.skyL], ['401(k) / 403(b)', 'Through work. Employer match = free money', C.sunL], ['HSA', 'Health costs. Triple tax advantage', C.grapeL]];
      return svg(640, 330, a.map(([n, d, f], i) => `${box(20, 14 + i * 62, 200, 48, f, n, '', { size: 14.5 })}${T(240, 44 + i * 62, d, { size: 13.5, w: 600, anchor: 'start' })}`).join('')
        + T(320, 326, 'Contribution limits change yearly. Check IRS.gov for the current numbers.', { size: 11.5, w: 600, fill: C.muted }), 'Investment account types');
    },

    'market-sessions': () => {
      const X = (h) => 30 + ((h - 4) / 16) * 580;
      const segs = [[4, 9.5, C.skyL, 'Pre-market', '4:00-9:30'], [9.5, 16, C.mint, 'Regular session', '9:30-4:00'], [16, 20, C.grapeL, 'After-hours', '4:00-8:00']];
      return svg(640, 260, `${segs.map(([a, b, f, n, t]) => `<rect x="${X(a)}" y="90" width="${X(b) - X(a)}" height="70" fill="${f}" stroke="${C.ink}" stroke-width="2.5"/>${T((X(a) + X(b)) / 2, 122, n, { size: 15, w: 800 })}${T((X(a) + X(b)) / 2, 142, `${t} ET`, { size: 12, w: 600 })}`).join('')}
        ${[4, 6, 8, 10, 12, 14, 16, 18, 20].map((h) => `${line(X(h), 160, X(h), 170)}${T(X(h), 188, `${h > 12 ? h - 12 : h}${h >= 12 ? 'pm' : 'am'}`, { size: 12, w: 600, fill: C.muted })}`).join('')}
        ${pill(X(9.5), 66, 'Opening bell', C.sun)}${pill(X(16), 66, 'Closing bell', C.sun)}
        ${T(320, 30, 'US stock market day (Eastern Time, Mon-Fri)', { size: 15, w: 800 })}
        ${T(320, 222, 'Outside 9:30-4:00: thinner trading, wider spreads, usually limit orders only.', { size: 12.5, w: 600 })}
        ${T(320, 244, 'Some brokers offer overnight sessions. Check your broker.', { size: 12, w: 500, fill: C.muted })}`, 'Market sessions');
    },

    'trade-lifecycle': () => {
      const st = [['You', 'tap Buy', C.skyL], ['Broker', 'routes order', C.sunL], ['Market maker / exchange', 'matches a seller', C.mintL], ['Clearing (NSCC)', 'guarantees it', C.grapeL], ['Settled T+1', 'shares + cash swap', C.tangL]];
      return svg(640, 220, st.map(([n, d, f], i) => `${box(8 + i * 127, 70, 112, 78, f, '', '')}${T(64 + i * 127, 104, n.length > 14 ? n.split(' / ')[0] : n, { size: 13.5, w: 800 })}${n.includes('/') ? T(64 + i * 127, 120, '/ exchange', { size: 12, w: 700 }) : ''}${T(64 + i * 127, 138, d, { size: 11, w: 600, fill: C.muted })}${i < 4 ? arrow(122 + i * 127, 109, 133 + i * 127, 109) : ''}`).join('')
        + T(320, 40, 'Milliseconds to execute. One business day to settle.', { size: 14, w: 800 }), 'Life of a trade');
    },

    'order-book': () => {
      const asks = [[100.08, 900], [100.06, 400], [100.04, 1200], [100.02, 300]];
      const bids = [[100.0, 500], [99.98, 1100], [99.96, 700], [99.94, 1500]];
      const row = (p, sz, i, side) => {
        const y = side === 'a' ? 40 + i * 34 : 196 + i * 34;
        const w = sz / 1500 * 200;
        return `<rect x="${side === 'a' ? 330 : 310 - w}" y="${y}" width="${w}" height="26" rx="4" fill="${side === 'a' ? C.tomatoL : C.mintL}" stroke="${C.ink}" stroke-width="1.5"/>
          ${T(side === 'a' ? 320 : 320, y + 18, `$${p.toFixed(2)}`, { size: 13, w: 800, mono: true, anchor: side === 'a' ? 'end' : 'start' })}
          ${T(side === 'a' ? 336 + w + 6 : 304 - w - 6, y + 18, `${sz}`, { size: 12, w: 600, mono: true, anchor: side === 'a' ? 'start' : 'end', fill: C.muted })}`;
      };
      return svg(640, 340, `${T(500, 26, 'ASKS (sellers)', { size: 13, w: 800, fill: C.tomato })}${T(140, 330, 'BIDS (buyers)', { size: 13, w: 800, fill: C.mint })}
        ${asks.map((a, i) => row(a[0], a[1], i, 'a')).join('')}${bids.map((b, i) => row(b[0], b[1], i, 'b')).join('')}
        <rect x="200" y="176" width="240" height="18" rx="9" fill="${C.sun}" stroke="${C.ink}" stroke-width="2"/>${T(320, 189, 'spread: $0.02', { size: 12, w: 800 })}
        ${T(110, 70, 'Market BUY pays the lowest ask', { size: 12, w: 700 })}${T(110, 88, '($100.02)', { size: 12, w: 700, mono: true })}
        ${T(540, 250, 'Market SELL gets the highest bid', { size: 12, w: 700 })}${T(540, 268, '($100.00)', { size: 12, w: 700, mono: true })}`, 'Order book');
    },

    'bull-bear': () => {
      const bull = Array.from({ length: 30 }, (_, i) => 100 + i * 2.2 + Math.sin(i * 1.3) * 5);
      const bear = Array.from({ length: 30 }, (_, i) => 160 - i * 2.1 + Math.sin(i * 1.1) * 5);
      const y = scaler(bull.concat(bear), 60, 250);
      return svg(640, 300, `${frame(14, 40, 296, 236)}${frame(330, 40, 296, 236)}
        ${poly(bull.map((v, i) => [30 + i * 9.4, y(v)]), C.mint, 4)}${poly(bear.map((v, i) => [346 + i * 9.4, y(v)]), C.tomato, 4)}
        <g transform="translate(30,48) scale(3)">${charPaths('chip')}</g><g transform="translate(560,48) scale(3)">${charPaths('grizz')}</g>
        ${T(162, 26, 'Bull market: up 20%+ from a low', { size: 14, w: 800 })}${T(478, 26, 'Bear market: down 20%+ from a high', { size: 14, w: 800 })}`, 'Bull and bear markets');
    },

    'bond-seesaw': () => svg(640, 280, `
      <path d="M300,230 L340,230 L320,190 Z" fill="${C.sun}" stroke="${C.ink}" stroke-width="2.5"/>
      <g transform="rotate(-12 320 190)">${line(110, 190, 530, 190, C.ink, 8)}${box(100, 140, 120, 46, C.tomatoL, 'Rates', 'go UP')}${box(420, 140, 120, 46, C.skyL, 'Bond prices', 'go DOWN')}</g>
      ${T(320, 40, 'Rates and existing bond prices move in opposite directions', { size: 14.5, w: 800 })}
      ${T(320, 262, 'Why: a new bond paying 6% makes your old 3% bond less attractive, so its price drops.', { size: 12.5, w: 600 })}`, 'Bond seesaw'),

    'dividend-flow': () => svg(640, 240, `
      ${box(14, 80, 140, 64, C.mintL, 'Company', 'earns profit')}
      ${box(180, 80, 120, 64, C.sunL, 'Board', 'declares dividend')}
      ${box(326, 80, 130, 64, C.skyL, 'You', 'get cash per share')}
      ${box(484, 80, 140, 64, C.grapeL, 'DRIP', 'buys more shares')}
      ${arrow(156, 112, 176, 112)}${arrow(302, 112, 322, 112)}${arrow(458, 112, 480, 112)}
      ${arrow(554, 148, 391, 152, { curve: 0, label: 'more shares = bigger next dividend', ly: 196 })}
      ${T(320, 36, 'Profit -> dividend -> reinvest -> repeat', { size: 15, w: 800 })}`, 'Dividend flow'),

    ponzi: () => {
      const tiers = [1, 2, 4, 8];
      return svg(640, 330, `${tiers.map((n, t) => Array.from({ length: n }, (_, i) => {
        const w = 560 / n; const x = 40 + i * w + w / 2 - 22; const y = 24 + t * 70;
        return `<rect x="${x}" y="${y}" width="44" height="40" rx="8" fill="${t === 3 ? C.tomatoL : t === 0 ? C.sun : C.paper}" stroke="${C.ink}" stroke-width="2"/>${T(x + 22, y + 26, t === 0 ? 'boss' : '$', { size: 13, w: 800 })}`;
      }).join('')).join('')}
        ${T(320, 318, 'New investors\' money pays "returns" to earlier ones. It needs endless new money, so it always collapses.', { size: 12.5, w: 700 })}
        ${T(320, 290, 'the newest investors are left holding nothing', { size: 12.5, w: 800, fill: C.tomato })}`, 'Ponzi scheme structure');
    },

    // ===== stocks =====
    'ipo-path': () => {
      const st = [['Garage', 'founders + savings'], ['Angels / VC', 'private funding rounds'], ['Underwriters', 'banks price the IPO'], ['IPO day', 'shares start trading'], ['Public company', 'quarterly reports']];
      return svg(640, 230, st.map(([n, d], i) => `${box(8 + i * 127, 80, 112, 72, [C.paper, C.skyL, C.sunL, C.mint, C.mintL][i], n, d, { size: 14 })}${i < 4 ? arrow(122 + i * 127, 116, 133 + i * 127, 116) : ''}`).join('')
        + T(320, 46, 'From private startup to stock ticker', { size: 15, w: 800 }) + T(320, 196, 'Alternatives: direct listing (no new shares sold), SPAC (merge with a shell company)', { size: 12, w: 600, fill: C.muted }), 'Path to an IPO');
    },

    'stock-split': () => svg(640, 260, `
      ${box(40, 70, 200, 120, C.skyL, '1 share', '$600 each')}
      ${arrow(260, 130, 360, 130, { label: '3-for-1 split' })}
      ${[0, 1, 2].map((i) => box(380 + i * 80, 70, 68, 120, C.mintL, '1', '$200')).join('')}
      ${T(140, 220, 'Total: $600', { size: 15, w: 800, mono: true })}${T(492, 220, 'Total: still $600', { size: 15, w: 800, mono: true })}
      ${T(320, 36, 'Same pizza, more slices. A split changes share count, not value.', { size: 14, w: 800 })}`, 'Stock split'),

    'income-statement': () => {
      const rows = [['Revenue', 2000, C.skyL], ['- Cost of goods sold', -900, C.tomatoL], ['= Gross profit', 1100, C.mintL], ['- Operating expenses', -700, C.tomatoL], ['= Operating income', 400, C.mintL], ['- Interest + taxes', -120, C.tomatoL], ['= Net income', 280, C.sun]];
      return svg(640, 330, rows.map(([n, v, f], i) => `${T(20, 34 + i * 42, n, { size: 14, w: 700, anchor: 'start' })}
        <rect x="250" y="${16 + i * 42}" width="${Math.abs(v) / 2000 * 300}" height="28" rx="5" fill="${f}" stroke="${C.ink}" stroke-width="2"/>
        ${T(260 + Math.abs(v) / 2000 * 300, 35 + i * 42, `$${(Math.abs(v) / 1000).toFixed(2)}M`, { size: 12.5, w: 700, mono: true, anchor: 'start' })}`).join('')
        + T(320, 322, 'Ortiz Bakeries Inc., one year (illustrative)', { size: 11.5, w: 600, fill: C.muted }), 'Income statement waterfall');
    },

    'balance-sheet': () => svg(640, 320, `
      ${T(165, 30, 'ASSETS (what it owns)', { size: 14, w: 800 })}${T(475, 30, 'LIABILITIES + EQUITY', { size: 14, w: 800 })}
      ${box(40, 44, 250, 80, C.skyL, 'Cash $360K', '')}${box(40, 124, 250, 70, C.skyL, 'Inventory + receivables', '')}${box(40, 194, 250, 100, C.skyL, 'Ovens, building', 'long-term assets')}
      ${box(350, 44, 250, 110, C.tomatoL, 'Liabilities', 'loans, bills owed')}${box(350, 154, 250, 140, C.mintL, "Shareholders' equity", "owners' stake (book value)")}
      ${T(320, 180, '=', { size: 40, w: 800 })}`, 'Balance sheet'),

    'cash-flow': () => svg(640, 300, `
      ${box(20, 30, 180, 70, C.mintL, 'Operating', '+$350K from selling')}
      ${box(230, 30, 180, 70, C.tomatoL, 'Investing', '-$250K new ovens')}
      ${box(440, 30, 180, 70, C.skyL, 'Financing', '-$110K loans, dividends')}
      ${box(170, 180, 300, 70, C.sun, 'Free cash flow = $100K', 'operating cash - capital spending')}
      ${arrow(110, 104, 250, 176)}${arrow(320, 104, 320, 176)}
      ${T(320, 284, 'Profit is an opinion; cash is a fact. Watch where the money actually went.', { size: 12.5, w: 700 })}`, 'Cash flow statement'),

    moat: () => svg(640, 320, `
      <ellipse cx="320" cy="180" rx="290" ry="118" fill="${C.skyL}" stroke="${C.ink}" stroke-width="3"/>
      <ellipse cx="320" cy="180" rx="200" ry="76" fill="${C.mintL}" stroke="${C.ink}" stroke-width="3"/>
      <rect x="264" y="122" width="112" height="86" fill="${C.paper}" stroke="${C.ink}" stroke-width="3"/>
      ${[264, 290, 316, 342].map((x) => `<rect x="${x}" y="108" width="16" height="16" fill="${C.paper}" stroke="${C.ink}" stroke-width="2.5"/>`).join('')}
      ${T(320, 172, 'Profits', { size: 16, w: 800 })}
      ${['Network effects', 'Switching costs', 'Cost advantage', 'Brands + patents', 'Efficient scale'].map((t, i) => pill([110, 530, 90, 550, 320][i], [104, 104, 250, 250, 290][i], t, C.paper)).join('')}
      ${T(320, 30, "A moat keeps competitors from storming the castle's profits", { size: 14, w: 800 })}`, 'Economic moat'),

    'margin-of-safety': () => svg(640, 260, `
      ${line(40, 170, 600, 170, C.ink, 3)}
      ${[['$60', 160, C.mint, 'Price you pay'], ['$100', 520, C.sky, 'Your value estimate']].map(([p, x, f, t]) => `<circle cx="${x}" cy="170" r="12" fill="${f}" stroke="${C.ink}" stroke-width="2.5"/>${T(x, 210, p, { size: 18, w: 800, mono: true })}${T(x, 232, t, { size: 13, w: 700 })}`).join('')}
      <rect x="172" y="132" width="336" height="26" rx="8" fill="${C.sunL}" stroke="${C.ink}" stroke-width="2"/>${T(340, 150, 'Margin of safety: 40% cushion for being wrong', { size: 13, w: 800 })}
      ${T(320, 40, 'Buy well below what you think it is worth', { size: 15, w: 800 })}`, 'Margin of safety'),

    'candlestick-anatomy': () => svg(640, 320, `
      ${[['up', 190, C.mint, 'Close', 'Open'], ['down', 450, C.tomato, 'Open', 'Close']].map(([k, x, f, a, b]) => `
        ${line(x, 40, x, 280, C.ink, 3)}<rect x="${x - 34}" y="90" width="68" height="140" fill="${f}" stroke="${C.ink}" stroke-width="3"/>
        ${T(x + 50, 46, 'High', { size: 13, w: 700, anchor: 'start' })}${T(x + 50, 96, a, { size: 13, w: 700, anchor: 'start' })}
        ${T(x + 50, 232, b, { size: 13, w: 700, anchor: 'start' })}${T(x + 50, 284, 'Low', { size: 13, w: 700, anchor: 'start' })}
        ${T(x, 308, k === 'up' ? 'Bullish (closed higher)' : 'Bearish (closed lower)', { size: 13.5, w: 800 })}`).join('')}
      ${T(80, 70, 'upper wick', { size: 12, w: 600, fill: C.muted })}${T(80, 170, 'body', { size: 12, w: 600, fill: C.muted })}${T(80, 260, 'lower wick', { size: 12, w: 600, fill: C.muted })}`, 'Candlestick anatomy'),

    trends: () => {
      const up = [[40, 250], [110, 170], [150, 205], [220, 120], [260, 160], [310, 70]];
      const dn = [[340, 70], [400, 150], [440, 115], [500, 200], [540, 170], [610, 255]];
      return svg(640, 300, `${frame(20, 40, 600, 240)}${poly(up, C.mint, 4)}${poly(dn, C.tomato, 4)}
        ${[[110, 170, 'HH'], [220, 120, 'HH'], [150, 205, 'HL'], [260, 160, 'HL']].map(([x, y, t]) => pill(x, y - (t === 'HH' ? 18 : -22), t, C.mintL)).join('')}
        ${[[440, 115, 'LH'], [540, 170, 'LH'], [400, 150, 'LL'], [500, 200, 'LL']].map(([x, y, t]) => pill(x, y + (t === 'LL' ? 22 : -18), t, C.tomatoL)).join('')}
        ${T(170, 28, 'Uptrend: higher highs + higher lows', { size: 13.5, w: 800 })}${T(480, 28, 'Downtrend: lower highs + lower lows', { size: 13.5, w: 800 })}`, 'Trends');
    },

    'support-resistance': () => {
      const data = series(48, { seed: 11, vol: 1.3, start: 100, drift: 0, shape: (t) => (t < 0.82 ? 100 + Math.sin(t * 22) * 6 : 112) });
      const f = chartFrame(data, { yvals: data.flatMap((d) => [d.hi, d.lo]).concat([94, 107]) });
      const y = f.y;
      return f.svg.replace('</svg>', `${line(30, y(106.5), 610, y(106.5), C.tomato, 3, '8 6')}${line(30, y(94), 610, y(94), C.mint, 3, '8 6')}
        ${pill(110, y(106.5) - 16, 'Resistance (ceiling)', C.tomatoL)}${pill(110, y(94) + 18, 'Support (floor)', C.mintL)}${pill(540, 40, 'Breakout!', C.sun)}</svg>`);
    },

    'moving-averages': () => {
      const data = series(70, { seed: 21, vol: 1.6, drift: 0.05, shape: (t) => 100 - 8 * Math.sin(t * 3.4) + t * 14 });
      const cl = data.map((d) => d.c);
      const f = chartFrame(data, { overlays: [{ vals: sma(cl, 10), color: C.sky }, { vals: sma(cl, 30), color: C.grape, w: 4 }] });
      return f.svg.replace('</svg>', `${pill(120, 30, '10-day SMA (fast)', C.skyL)}${pill(300, 30, '30-day SMA (slow)', C.grapeL)}</svg>`);
    },

    'rsi-zones': () => {
      const data = series(60, { seed: 9, vol: 1.8, shape: (t) => 100 + Math.sin(t * 9) * 10 });
      const cl = data.map((d) => d.c);
      const rsi = cl.map((_, i) => {
        if (i < 14) return null;
        let g = 0; let l = 0;
        for (let k = i - 13; k <= i; k++) { const d = cl[k] - cl[k - 1]; if (d > 0) g += d; else l -= d; }
        return l === 0 ? 100 : 100 - 100 / (1 + g / l);
      });
      const f = chartFrame(data, { bottom: 170, h: 340 });
      const ry = (v) => 330 - (v / 100) * 120;
      const xi = f.xi;
      return f.svg.replace('</svg>', `<rect x="18" y="${ry(100)}" width="604" height="${ry(70) - ry(100)}" fill="${C.tomatoL}"/><rect x="18" y="${ry(30)}" width="604" height="${ry(0) - ry(30)}" fill="${C.mintL}"/>
        <rect x="18" y="${ry(100)}" width="604" height="120" fill="none" stroke="${C.ink}" stroke-width="2.5" rx="8"/>
        ${poly(rsi.map((v, i) => (v == null ? null : [xi(i), ry(v)])).filter(Boolean), C.grape, 3)}
        ${T(610, ry(70) - 4, '70 overbought', { size: 11.5, w: 800, anchor: 'end' })}${T(610, ry(30) + 14, '30 oversold', { size: 11.5, w: 800, anchor: 'end' })}${T(30, ry(100) + 14, 'RSI (14)', { size: 12, w: 800, anchor: 'start' })}</svg>`);
    },

    macd: () => {
      const data = series(70, { seed: 33, vol: 1.4, shape: (t) => 100 - 10 * Math.cos(t * 5) });
      const cl = data.map((d) => d.c);
      const e12 = ema(cl, 12); const e26 = ema(cl, 26);
      const m = cl.map((_, i) => e12[i] - e26[i]);
      const sig = ema(m, 9);
      const f = chartFrame(data, { bottom: 170, h: 340 });
      const max = Math.max(...m.map(Math.abs), ...sig.map(Math.abs));
      const my = (v) => 270 - (v / max) * 55;
      const xi = f.xi;
      return f.svg.replace('</svg>', `<rect x="18" y="206" width="604" height="128" fill="#fff" stroke="${C.ink}" stroke-width="2.5" rx="8"/>${line(30, my(0), 610, my(0), C.soft, 1.5)}
        ${m.map((v, i) => { const h = v - sig[i]; return `<rect x="${xi(i) - 3}" y="${Math.min(my(h), my(0))}" width="6" height="${Math.abs(my(h) - my(0))}" fill="${h >= 0 ? C.mint : C.tomato}"/>`; }).join('')}
        ${poly(m.map((v, i) => [xi(i), my(v)]), C.sky, 3)}${poly(sig.map((v, i) => [xi(i), my(v)]), C.tang, 3)}
        ${T(30, 222, 'MACD (blue) vs signal (orange); bars = the gap', { size: 12, w: 800, anchor: 'start' })}</svg>`);
    },

    bollinger: () => {
      const data = series(70, { seed: 5, vol: 1.2, shape: (t) => (t < 0.55 ? 100 + Math.sin(t * 30) * 1.5 : 100 + (t - 0.55) * 60) });
      const cl = data.map((d) => d.c);
      const mid = sma(cl, 20);
      const sd = cl.map((_, i) => (i < 19 ? null : Math.sqrt(cl.slice(i - 19, i + 1).reduce((a, v) => a + (v - mid[i]) ** 2, 0) / 20)));
      const up = mid.map((v, i) => (v == null ? null : v + 2 * sd[i]));
      const lo = mid.map((v, i) => (v == null ? null : v - 2 * sd[i]));
      const f = chartFrame(data, { overlays: [{ vals: up, color: C.grape }, { vals: mid, color: C.muted, dash: '6 5', w: 2 }, { vals: lo, color: C.grape }] });
      return f.svg.replace('</svg>', `${pill(220, 40, 'Squeeze: bands tighten', C.sunL)}${pill(500, 40, 'Expansion: breakout', C.mintL)}</svg>`);
    },

    volume: () => {
      const data = series(40, { seed: 14, vol: 1.2, shape: (t) => (t < 0.7 ? 100 + Math.sin(t * 18) * 2 : 112) });
      data.forEach((d, i) => { if (i >= 28 && i <= 30) d.v = 180 + i; });
      const f = chartFrame(data, { bottom: 190, h: 330 });
      const vmax = Math.max(...data.map((d) => d.v));
      return f.svg.replace('</svg>', `${data.map((d, i) => `<rect x="${f.xi(i) - 5}" y="${320 - (d.v / vmax) * 100}" width="10" height="${(d.v / vmax) * 100}" fill="${d.c >= d.o ? C.mintL : C.tomatoL}" stroke="${C.ink}" stroke-width="1.2"/>`).join('')}
        ${pill(f.xi(29), 206, 'Volume surge confirms breakout', C.sun)}</svg>`);
    },

    'chart-patterns': () => {
      const pats = [['Head + shoulders', [[0, 60], [15, 35], [25, 55], [40, 15], [55, 55], [65, 35], [80, 60], [92, 80]]],
        ['Double top', [[0, 70], [20, 20], [40, 55], [60, 22], [80, 60], [92, 80]]],
        ['Bull flag', [[0, 80], [30, 15], [45, 30], [55, 22], [70, 38], [80, 30], [92, 5]]],
        ['Triangle', [[0, 20], [15, 75], [30, 30], [45, 65], [58, 38], [70, 55], [80, 44], [92, 10]]],
        ['Double bottom', [[0, 20], [20, 75], [40, 40], [60, 73], [80, 35], [92, 15]]],
        ['Cup + handle', [[0, 15], [10, 45], [25, 70], [45, 72], [60, 45], [70, 18], [76, 30], [84, 26], [92, 5]]]];
      return svg(640, 330, pats.map(([n, pts], i) => {
        const x = 14 + (i % 3) * 210; const y = 18 + Math.floor(i / 3) * 156;
        return `${frame(x, y, 196, 140)}${poly(pts.map(([px, py]) => [x + 12 + px * 1.9, y + 20 + py]), i === 0 || i === 1 ? C.tomato : C.mint, 3.5)}${T(x + 98, y + 128, n, { size: 13, w: 800 })}`;
      }).join(''), 'Common chart patterns');
    },

    'position-sizing': () => svg(640, 300, `
      ${box(20, 30, 180, 70, C.skyL, 'Account $10,000', '')}${box(230, 30, 180, 70, C.sunL, 'Risk 1% = $100', 'max loss per trade')}${box(440, 30, 180, 70, C.tomatoL, 'Stop distance $3', 'entry $50, stop $47')}
      ${arrow(110, 104, 280, 176)}${arrow(320, 104, 320, 176)}${arrow(530, 104, 360, 176)}
      ${box(170, 180, 300, 76, C.mint, '$100 / $3 = 33 shares', 'position size')}
      ${T(320, 290, 'Size comes from the stop, not from how excited you are.', { size: 13, w: 700 })}`, 'Position sizing'),

    // ===== options =====
    'call-payoff': () => payoff([{ type: 'call', side: 1, strike: 100, premium: 5 }], { title: 'Long call: strike $100, premium $5', notes: ['Max loss = $5 premium', 'Upside: unlimited'] }),
    'put-payoff': () => payoff([{ type: 'put', side: 1, strike: 100, premium: 4 }], { title: 'Long put: strike $100, premium $4', notes: ['Max loss = $4 premium', 'Max gain = $96'] }),
    'covered-call': () => payoff([{ type: 'stock', side: 1, strike: 100 }, { type: 'call', side: -1, strike: 110, premium: 3 }], { title: 'Covered call: own stock at $100, sell $110 call for $3', notes: ['Upside capped at $13', 'Cushion: $3'] }),
    'protective-put': () => payoff([{ type: 'stock', side: 1, strike: 100 }, { type: 'put', side: 1, strike: 95, premium: 3 }], { title: 'Protective put: own stock at $100, buy $95 put for $3', notes: ['Max loss = $8', 'Upside stays open'] }),
    'vertical-spread': () => payoff([{ type: 'call', side: 1, strike: 100, premium: 5 }, { type: 'call', side: -1, strike: 110, premium: 2 }], { title: 'Bull call spread: buy $100 call ($5), sell $110 call ($2)', notes: ['Max loss = $3 net debit', 'Max gain = $7'] }),
    straddle: () => payoff([{ type: 'call', side: 1, strike: 100, premium: 5 }, { type: 'put', side: 1, strike: 100, premium: 5 }], { title: 'Long straddle: buy $100 call + $100 put ($10 total)', notes: ['Max loss = $10 if price sits at $100', 'Needs a big move'] }),
    'iron-condor': () => payoff([{ type: 'put', side: 1, strike: 85, premium: 0.8 }, { type: 'put', side: -1, strike: 90, premium: 1.8 }, { type: 'call', side: -1, strike: 110, premium: 1.8 }, { type: 'call', side: 1, strike: 115, premium: 0.8 }], { title: 'Iron condor: sell 90/110, buy 85/115 wings ($2 credit)', notes: ['Max gain = $2 credit', 'Max loss = $3'] }),

    moneyness: () => svg(640, 280, `
      ${line(40, 150, 600, 150, C.ink, 3)}${line(320, 60, 320, 210, C.ink, 3, '6 5')}${T(320, 52, 'Stock price now: $100', { size: 14, w: 800 })}
      ${[[90, 'K $90'], [200, 'K $95'], [320, 'K $100'], [440, 'K $105'], [550, 'K $110']].map(([x, t]) => `<circle cx="${x}" cy="150" r="9" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>${T(x, 180, t, { size: 13, w: 800, mono: true })}`).join('')}
      <rect x="40" y="96" width="270" height="30" rx="8" fill="${C.mintL}" stroke="${C.ink}" stroke-width="2"/>${T(175, 116, 'CALLS: in the money', { size: 13, w: 800 })}
      <rect x="330" y="96" width="270" height="30" rx="8" fill="${C.tomatoL}" stroke="${C.ink}" stroke-width="2"/>${T(465, 116, 'CALLS: out of the money', { size: 13, w: 800 })}
      <rect x="40" y="202" width="270" height="30" rx="8" fill="${C.tomatoL}" stroke="${C.ink}" stroke-width="2"/>${T(175, 222, 'PUTS: out of the money', { size: 13, w: 800 })}
      <rect x="330" y="202" width="270" height="30" rx="8" fill="${C.mintL}" stroke="${C.ink}" stroke-width="2"/>${T(465, 222, 'PUTS: in the money', { size: 13, w: 800 })}
      ${T(320, 266, 'At the money = strike right at the current price', { size: 12.5, w: 700 })}`, 'Option moneyness'),

    'intrinsic-extrinsic': () => svg(640, 280, `
      ${T(320, 30, '$105 stock, $100 call, option price $7.50', { size: 15, w: 800 })}
      <rect x="120" y="60" width="160" height="190" fill="${C.mintL}" stroke="${C.ink}" stroke-width="3"/><rect x="120" y="60" width="160" height="70" fill="${C.sunL}" stroke="${C.ink}" stroke-width="3"/>
      ${T(200, 100, '$2.50', { size: 18, w: 800, mono: true })}${T(200, 196, '$5.00', { size: 18, w: 800, mono: true })}
      ${T(310, 94, 'Extrinsic (time value)', { size: 14, w: 800, anchor: 'start' })}${T(310, 114, 'what you pay for time + volatility; melts to $0', { size: 12, w: 500, anchor: 'start', fill: C.muted })}
      ${T(310, 190, 'Intrinsic value', { size: 14, w: 800, anchor: 'start' })}${T(310, 210, '$105 - $100 = $5 real value if exercised now', { size: 12, w: 500, anchor: 'start', fill: C.muted })}`, 'Intrinsic vs extrinsic value'),

    greeks: () => {
      const g = [['Delta', 'Price moves ~$0.50 per $1 stock move', C.skyL], ['Gamma', 'How fast delta changes', C.grapeL], ['Theta', 'Value lost per day from time', C.tomatoL], ['Vega', 'Change per 1-point move in volatility', C.sunL], ['Rho', 'Change per 1% move in interest rates', C.mintL]];
      return svg(640, 320, g.map(([n, d, f], i) => `${box(20, 14 + i * 60, 140, 46, f, n, '', { size: 16 })}${T(180, 42 + i * 60, d, { size: 14, w: 600, anchor: 'start' })}`).join(''), 'The Greeks');
    },

    'time-decay': () => {
      const pts = Array.from({ length: 61 }, (_, i) => { const d = 60 - i; return [60 + i * 9, 270 - 220 * Math.sqrt(d / 60)]; });
      return svg(640, 310, `${frame(44, 30, 570, 250)}${poly(pts, C.tomato, 4.5)}
        ${[60, 45, 30, 15, 0].map((d) => T(60 + (60 - d) * 9, 300, `${d}d`, { size: 12, w: 600, fill: C.muted })).join('')}
        ${pill(200, 60, 'Slow melt far from expiry', C.paper)}${pill(510, 200, 'Fast melt in the last weeks', C.tomatoL)}
        ${T(330, 22, 'Time value of an at-the-money option vs days to expiration', { size: 13.5, w: 800 })}`, 'Time decay');
    },

    'iv-crush': () => svg(640, 300, `
      ${frame(30, 30, 580, 240)}
      ${poly([[50, 230], [150, 210], [250, 170], [340, 100], [380, 70], [400, 220], [500, 225], [590, 228]], C.grape, 4.5)}
      ${line(390, 40, 390, 260, C.ink, 2, '6 5')}${pill(390, 50, 'Earnings', C.sun)}
      ${pill(250, 120, 'IV climbs before the news', C.grapeL)}${pill(500, 190, 'IV collapses after', C.tomatoL)}
      ${T(320, 292, 'Even if the stock moves your way, the option can lose value when IV drops.', { size: 12.5, w: 700 })}`, 'IV crush'),

    // ===== futures =====
    'futures-contract': () => svg(640, 300, `
      ${box(30, 100, 170, 80, C.sunL, 'Farmer', 'will SELL 5,000 bu wheat')}${box(440, 100, 170, 80, C.tangL, 'Ms. Ortiz', 'will BUY 5,000 bu wheat')}
      ${box(220, 70, 200, 140, C.paper, '', '')}${T(320, 100, 'FUTURES CONTRACT', { size: 13, w: 800 })}
      ${['Wheat, 5,000 bu', 'Price: locked today', 'Delivery: September', 'Cleared by exchange'].map((t, i) => T(320, 128 + i * 20, t, { size: 12.5, w: 600 })).join('')}
      ${arrow(202, 140, 218, 140)}${arrow(438, 140, 422, 140)}
      ${T(320, 40, 'A binding deal today for a trade in the future', { size: 15, w: 800 })}
      ${T(320, 260, 'Standardized size + date, traded on an exchange, guaranteed by a clearinghouse.', { size: 12.5, w: 600 })}`, 'Futures contract'),

    'hedger-speculator': () => svg(640, 280, `
      ${box(20, 60, 260, 150, C.mintL, '', '')}${box(360, 60, 260, 150, C.sunL, '', '')}
      ${T(150, 90, 'HEDGERS', { size: 17, w: 800 })}${['Farmers, airlines, bakeries', 'Want to REDUCE risk', 'Lock in prices they need'].map((t, i) => T(150, 120 + i * 24, t, { size: 13, w: 600 })).join('')}
      ${T(490, 90, 'SPECULATORS', { size: 17, w: 800 })}${['Traders, funds', 'Take on risk for profit', 'Provide liquidity'].map((t, i) => T(490, 120 + i * 24, t, { size: 13, w: 600 })).join('')}
      ${arrow(284, 120, 356, 120)}${arrow(356, 160, 284, 160)}${T(320, 108, 'risk', { size: 12.5, w: 800 })}${T(320, 236, 'speculators get paid (potential profit) for taking that risk', { size: 12.5, w: 700 })}`, 'Hedgers vs speculators'),

    'mark-to-market': () => {
      const days = [['Mon', 300, 5300], ['Tue', 600, 5900], ['Wed', -1400, 4500], ['Thu', -800, 3700], ['Fri', 700, 4400]];
      return svg(640, 300, `${line(40, 150, 600, 150, C.ink, 2)}
        ${days.map(([d, pl, bal], i) => { const x = 70 + i * 120; const h = pl / 1400 * 90; return `<rect x="${x - 30}" y="${pl >= 0 ? 150 - h : 150}" width="60" height="${Math.abs(h) || 2}" fill="${pl >= 0 ? C.mintL : C.tomatoL}" stroke="${C.ink}" stroke-width="2"/>
          ${T(x, 274, d, { size: 13, w: 800 })}${T(x, pl >= 0 ? 140 - h : 168 + Math.abs(h), `${pl >= 0 ? '+' : '-'}$${Math.abs(pl)}`, { size: 12.5, w: 800, mono: true })}${T(x, 294, `$${bal.toLocaleString()}`, { size: 11.5, w: 600, mono: true, fill: C.muted })}`; }).join('')}
        ${T(320, 52, 'Started Monday with $5,000 (illustrative)', { size: 12, w: 600, fill: C.muted })}
        ${T(320, 28, 'Gains and losses settle into your account in cash, every day', { size: 14, w: 800 })}`, 'Mark to market');
    },

    'contango-backwardation': () => {
      const X = (i) => 90 + i * 100;
      const cont = [70, 72, 74, 75.5, 77, 78].map((v, i) => [X(i), 260 - (v - 60) * 8]);
      const back = [80, 77.5, 75.5, 74, 73, 72.4].map((v, i) => [X(i), 260 - (v - 60) * 8]);
      return svg(640, 300, `${frame(50, 30, 560, 250)}${poly(cont, C.sky, 4)}${poly(back, C.tang, 4)}
        ${cont.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${C.sky}" stroke="${C.ink}" stroke-width="1.5"/>`).join('')}${back.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${C.tang}" stroke="${C.ink}" stroke-width="1.5"/>`).join('')}
        ${['Front', '+1 mo', '+2', '+3', '+4', '+5'].map((t, i) => T(X(i), 296, t, { size: 12, w: 600, fill: C.muted })).join('')}
        ${pill(480, 90, 'Contango: later months cost more', C.skyL)}${pill(200, 70, 'Backwardation: later months cheaper', C.tangL)}`, 'Contango vs backwardation');
    },

    'basis-convergence': () => {
      const fut = Array.from({ length: 31 }, (_, i) => [60 + i * 18, 80 + (i / 30) * 70 + Math.sin(i) * 3]);
      const spot = Array.from({ length: 31 }, (_, i) => [60 + i * 18, 150 + Math.sin(i * 0.8) * 4 - (1 - i / 30) * 0]);
      return svg(640, 280, `${frame(44, 30, 570, 220)}${poly(fut, C.grape, 4)}${poly(spot, C.mint, 4)}
        ${line(240, 112, 240, 150, C.ink, 2)}${T(250, 135, 'basis', { size: 12.5, w: 800, anchor: 'start' })}
        ${pill(130, 60, 'Futures price', C.grapeL)}${pill(160, 200, 'Spot (cash) price', C.mintL)}${pill(510, 82, 'Converge at expiration', C.sun)}`, 'Basis convergence');
    },

    rollover: () => svg(640, 260, `
      ${[['Mar (H)', C.paper], ['Jun (M)', C.skyL], ['Sep (U)', C.paper], ['Dec (Z)', C.paper]].map(([t, f], i) => box(30 + i * 150, 90, 130, 70, f, t, i === 0 ? 'expiring' : i === 1 ? 'next front month' : '')).join('')}
      ${arrow(110, 86, 245, 86, { curve: 0, label: 'roll: close March, open June', ly: 70 })}
      ${T(320, 30, 'Equity index futures: quarterly contracts, third Friday expiration', { size: 14, w: 800 })}
      ${T(320, 210, 'Traders usually roll about a week before expiration, when volume moves to the next contract.', { size: 12.5, w: 600 })}
      ${T(320, 236, 'Month codes: F G H J K M N Q U V X Z = Jan through Dec', { size: 12.5, w: 700, mono: true })}`, 'Futures rollover'),

    'futures-sessions': () => {
      const X = (h) => 30 + (h / 24) * 580;
      const segs = [[18, 24, C.grapeL, 'Asia'], [0, 3, C.grapeL, ''], [3, 9.5, C.skyL, 'London'], [9.5, 16, C.mint, 'NY (cash open)'], [16, 17, C.sunL, ''], [17, 18, C.tomatoL, 'break']];
      return svg(640, 240, `${segs.map(([a, b, f, n]) => `<rect x="${X(a)}" y="80" width="${X(b) - X(a)}" height="64" fill="${f}" stroke="${C.ink}" stroke-width="2.5"/>${n ? T((X(a) + X(b)) / 2, 117, n, { size: 13, w: 800 }) : ''}`).join('')}
        ${[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => `${T(X(h), 166, `${h % 12 || 12}${h < 12 || h === 24 ? 'a' : 'p'}`, { size: 12, w: 600, fill: C.muted })}`).join('')}
        ${T(320, 36, 'CME equity index futures: Sun 6pm to Fri 5pm ET, daily 5-6pm break', { size: 13.5, w: 800 })}
        ${T(320, 210, 'Biggest volume: around 8:30am data releases and the 9:30am stock open (ET).', { size: 12.5, w: 600 })}`, 'Futures trading sessions');
    },
  };

  // Small helpers that embed sprite/icon pixel art inside larger diagrams.
  function gridPaths(grid, pal) {
    let out = '';
    grid.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const c = pal[row[x]]; if (c) out += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c}"/>`; } });
    return out;
  }
  const PAL = { k: C.ink, w: '#fffaf0', W: '#e8dcc4', g: C.mint, G: '#12985a', p: '#ffb3a7', P: '#ef8f80', b: '#9a6440', B: '#6e4329', l: '#e2b48a', y: C.sun, Y: '#e0a800', q: '#ff9fb2', Q: '#e46f8c', u: '#4f7cff', s: '#c9d2dc', S: '#8a96a3', c: '#6fe3ff', r: C.tomato, n: '#7a705f', o: C.tang, t: '#3e9e5a', h: '#c98a3a', v: C.grape };
  function charPaths(name) { return gridPaths(Sprites.CHARS[name], PAL); }
  function iconPaths(name) { return gridPaths(Sprites.ICONS[name], PAL); }
  function UIgrizz(x, y) { return `<g transform="translate(${x},${y}) scale(4)">${charPaths('grizz')}</g>`; }

  function render(name) {
    const fn = D[name];
    if (!fn) return `<div class="empty-state">Diagram "${escapeHtml(name)}" is missing.</div>`;
    try {
      return fn();
    } catch (err) {
      console.error('diagram failed', name, err);
      return '<div class="empty-state">This diagram failed to draw.</div>';
    }
  }

  return { render, payoff, names: () => Object.keys(D) };
})();

window.Diagrams = Diagrams;
