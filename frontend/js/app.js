/* ============================================================
   TradeIQ — app.js
   Router, top bar + HUD, footer, socket presence.
   Public: home, course map, legal pages.
   Everything else asks you to sign up first.
   ============================================================ */

const App = (() => {
  let socket = null;
  let portfolios = [];
  let currentCleanup = null;
  let site = { name: 'TradeIQ', contactEmail: '' };

  const ROUTES = [
    { path: /^\/$/, name: 'home', render: () => Landing.render() },
    { path: /^\/learn\/?$/, name: 'learn', render: () => Learn.render() },
    { path: /^\/lesson\/([a-z0-9-]+)$/, name: 'lesson', auth: true, focus: true, render: (m) => Player.render(m[1]) },
    { path: /^\/exam\/([a-z]+)$/, name: 'exam', auth: true, focus: true, render: (m) => Exam.render(m[1]) },
    { path: /^\/trade\/?$/, name: 'trade', auth: true, legacy: true, render: (m, q) => withPortfolios(() => MyDeskSection.render(portfolioId('manual'), paramsFrom(q))) },
    { path: /^\/bot\/?$/, name: 'bot', auth: true, legacy: true, render: (m, q) => withPortfolios(() => AiTraderSection.render(portfolioId('ai'), paramsFrom(q))) },
    { path: /^\/research\/?$/, name: 'research', auth: true, legacy: true, render: () => ResearchSection.render() },
    { path: /^\/me\/?$/, name: 'me', auth: true, render: () => Profile.render() },
    { path: /^\/hideout\/?$/, name: 'hideout', auth: true, render: () => Hideout.render() },
    { path: /^\/ranks\/?$/, name: 'ranks', auth: true, render: () => Ranks.render() },
    { path: /^\/settings\/?$/, name: 'settings', auth: true, render: () => Settings.render() },
    { path: /^\/admin\/?$/, name: 'admin', auth: true, admin: true, legacy: true, render: () => AdminSection.render() },
    { path: /^\/(terms|privacy|disclaimer)\/?$/, name: 'legal', render: (m) => Legal.render(m[1]) },
    { path: /^\/reset-password\/?$/, name: 'reset', render: (m, q) => Utility.resetPassword(q) },
    { path: /^\/unsubscribe\/?$/, name: 'unsub', render: (m, q) => Utility.unsubscribe(q) },
    { path: /^\/(login|signup)\/?$/, name: 'auth', render: (m) => { Landing.render(); AuthModal.open(m[1]); } },
  ];

  const LEGACY_HEAD = {
    trade: ['chip', 'Trading Desk', '$50,000 of simulated money on real market data. Mistakes here cost nothing.', 'Practice'],
    bot: ['bolt', 'Bolt the Bot', 'Pick a strategy and watch Bolt follow its rules on live data. Rule-based, not AI, and never advice.', 'Strategies'],
    research: ['hoot', 'Research', 'Look up a ticker: technicals, a CANSLIM checklist, then write your own take and compare.', 'Analyze'],
  };

  const NAV = [
    { href: '/learn', label: 'Learn', icon: 'map', name: 'learn' },
    { href: '/hideout', label: 'Hideout', icon: 'house', name: 'hideout' },
    { href: '/trade', label: 'Trade', icon: 'chart', name: 'trade' },
    { href: '/bot', label: 'Bot', icon: 'bolt', name: 'bot' },
    { href: '/research', label: 'Research', icon: 'magnifier', name: 'research' },
    { href: '/ranks', label: 'Ranks', icon: 'trophy', name: 'ranks' },
  ];

  function paramsFrom(q) {
    const s = q.get('strategy');
    return s ? { strategy: s } : undefined;
  }
  function portfolioId(type) {
    const p = portfolios.find((x) => x.portfolioType === type);
    return p ? p.portfolioId : null;
  }
  async function withPortfolios(fn) {
    if (!portfolios.length) {
      try { portfolios = await api.get('/portfolio'); } catch { portfolios = []; }
    }
    return fn();
  }

  // ---------- Navigation ----------
  function go(path, { replace = false } = {}) {
    if (replace) history.replaceState({}, '', path);
    else history.pushState({}, '', path);
    route();
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = a.getAttribute('href');
    if (!href.startsWith('/') || href.startsWith('/api/') || a.target || a.hasAttribute('download') || a.dataset.external != null) return;
    if (href.startsWith('/#')) {
      if (location.pathname === '/') {
        e.preventDefault();
        document.getElementById(href.slice(2))?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    e.preventDefault();
    go(href);
  });
  window.addEventListener('popstate', route);

  function route() {
    const path = location.pathname;
    const q = new URLSearchParams(location.search);
    const r = ROUTES.find((x) => x.path.test(path));
    if (typeof currentCleanup === 'function') { try { currentCleanup(); } catch { /* ignore */ } }
    currentCleanup = null;
    document.querySelectorAll('.modal-overlay').forEach((m) => m.remove());

    if (!r) return renderNotFound();
    if (r.name === 'home' && Session.isLoggedIn()) return go(`/learn${location.search}`, { replace: true });

    if (r.auth && !Session.isLoggedIn()) {
      renderChrome(false);
      Landing.render();
      AuthModal.open('signup', { next: path + location.search, reason: r.name === 'lesson' ? 'lesson' : 'feature' });
      return;
    }
    if (r.admin && Session.user?.role !== 'admin') return go('/learn', { replace: true });

    renderChrome(Boolean(r.focus), r.name);
    window.scrollTo(0, 0);
    if (socket && socket.connected) socket.emit('page_change', r.name);
    const view = document.getElementById('view');
    if (r.legacy) {
      const h = LEGACY_HEAD[r.name];
      view.innerHTML = `<div class="page wrap legacy">${h ? `<div class="page-head legacy-head">${Sprites.character(h[0], 64)}<div><span class="eyebrow">${h[3]}</span><h1>${h[1]}</h1><p>${h[2]}</p></div></div>` : ''}<div id="content-area"></div></div>`;
    }
    try {
      const out = r.render(r.path.exec(path), q);
      Promise.resolve(out).then((cleanup) => { currentCleanup = cleanup; }).catch(renderError);
    } catch (err) {
      renderError(err);
    }
    showNotice(q.get('notice'));
  }

  function renderError(err) {
    console.error(err);
    const view = document.getElementById('view');
    view.innerHTML = `<div class="page wrap"><div class="empty-state">${Sprites.character('grizz', 96)}
      <h3>Something broke.</h3><p>${escapeHtml(err.message || 'Please try again.')}</p>
      <a class="btn" href="/learn">Back to the map</a></div></div>`;
  }

  function renderNotFound() {
    renderChrome(false);
    document.getElementById('view').innerHTML = `<div class="page wrap"><div class="empty-state">${Sprites.character('hoot', 110)}
      <h2>404: page not found</h2><p>Hoot looked everywhere. This page doesn't exist.</p>
      <a class="btn btn-primary" href="/">Go home</a></div></div>`;
  }

  function showNotice(n) {
    if (!n) return;
    const map = {
      'email-verified': ['Email confirmed! You can now use it to reset your password.', 'success'],
      'email-invalid': ['That email link is invalid or expired. Request a new one in Settings.', 'error'],
    };
    if (map[n]) UI.toast(map[n][0], map[n][1], { ms: 6000 });
    if (n === 'email-verified') UI.confetti(60);
    history.replaceState({}, '', location.pathname);
  }

  // ---------- Chrome ----------
  function renderChrome(focus, active) {
    document.body.classList.toggle('focus-mode', focus);
    document.body.classList.toggle('signed-in', Session.isLoggedIn());
    const top = document.getElementById('topbar');
    const foot = document.getElementById('footer');
    const tab = document.getElementById('tabbar');
    if (focus) {
      top.innerHTML = '';
      foot.innerHTML = '';
      tab.innerHTML = '';
      return;
    }
    const u = Session.user;
    const nav = NAV.concat(u?.role === 'admin' ? [{ href: '/admin', label: 'Admin', icon: 'shield', name: 'admin' }] : []);
    top.innerHTML = `<div class="wrap topbar-inner">
      <a class="brand" href="${u ? '/learn' : '/'}">${Sprites.character('chip', 38)}<span class="word">Trade<b>IQ</b></span></a>
      ${u ? `<nav class="mainnav" aria-label="Main">${nav.map((n) => `<a href="${n.href}" class="${n.name === active ? 'active' : ''}">${Sprites.icon(n.icon, 20)}${n.label}</a>`).join('')}</nav>` : `
        <nav class="mainnav" aria-label="Main"><a href="/#worlds">Lessons</a><a href="/#how">How it works</a><a href="/#faq">FAQ</a></nav>`}
      <div class="hud" id="hud">${u ? hudHtml(u) : `
        <button class="btn btn-ghost btn-sm" data-auth="login">Log in</button>
        <button class="btn btn-primary btn-sm" data-auth="signup">Start free</button>`}</div>
    </div>`;
    top.querySelectorAll('[data-auth]').forEach((b) => b.addEventListener('click', () => AuthModal.open(b.dataset.auth)));
    const av = top.querySelector('#avatar-btn');
    if (av) av.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });

    tab.innerHTML = u ? nav.slice(0, 4).concat([{ href: '/me', label: 'Me', icon: 'person', name: 'me' }])
      .map((n) => `<a href="${n.href}" class="${n.name === active ? 'active' : ''}">${Sprites.icon(n.icon, 24)}${n.label}</a>`).join('') : '';

    if (!foot.innerHTML) foot.innerHTML = footerHtml();
  }

  function hudHtml(u) {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: u.timezone || 'America/New_York' });
    const alive = u.streakLastDay === today;
    return `
      <a class="hud-pill streak ${alive ? '' : 'cold'}" href="/me" title="${alive ? 'Streak alive today' : 'Do a lesson today to keep your streak'}">${Sprites.icon('fire', 20)}<span>${u.streak}</span></a>
      <a class="hud-pill" href="/me" title="Level ${u.level.level}: ${escapeHtml(u.level.title)}">${Sprites.icon('star', 20)}<span>${u.xp.toLocaleString()}</span></a>
      <a class="hud-pill coins" href="/me#shop" title="Coins">${Sprites.icon('coin', 20)}<span>${u.coins}</span></a>
      <div style="position:relative">
        <button class="avatar-btn" id="avatar-btn" aria-label="Account menu">${Sprites.character(u.avatar, 34)}</button>
      </div>`;
  }

  function toggleMenu() {
    const existing = document.querySelector('.menu');
    if (existing) { existing.remove(); return; }
    const u = Session.user;
    const m = document.createElement('div');
    m.className = 'menu';
    m.innerHTML = `<div class="menu-head"><b>${escapeHtml(u.username)}</b><br><small class="muted">Level ${u.level.level} · ${escapeHtml(u.level.title)}</small></div>
      <a href="/me">${Sprites.icon('person', 18)} Profile & badges</a>
      <a href="/hideout">${Sprites.icon('house', 18)} Hideout & gear</a>
      <a href="/research">${Sprites.icon('magnifier', 18)} Research</a>
      <a href="/settings">${Sprites.icon('gear', 18)} Settings</a>
      ${u.role === 'admin' ? `<a href="/admin">${Sprites.icon('shield', 18)} Admin</a>` : ''}
      <button data-logout>${Sprites.icon('door', 18)} Log out</button>`;
    document.getElementById('avatar-btn').parentElement.appendChild(m);
    m.querySelector('[data-logout]').onclick = logout;
    m.addEventListener('click', (e) => { if (e.target.closest('a')) m.remove(); });
    setTimeout(() => document.addEventListener('click', function close(e) {
      if (!m.contains(e.target)) { m.remove(); document.removeEventListener('click', close); }
    }), 0);
  }

  function footerHtml() {
    return `<div class="wrap">
      <div class="footer-grid">
        <div><a class="brand" href="/">${Sprites.character('chip', 32)} Trade<b>IQ</b></a>
          <p class="muted" style="margin-top:10px;max-width:360px">Learn money, markets and trading like it's a game. Practice with fake money before you ever risk real money.</p></div>
        <div><h4>Explore</h4><a href="/learn">Course map</a><a href="/#how">How it works</a><a href="/#faq">FAQ</a></div>
        <div><h4>The fine print</h4><a href="/terms">Terms of Service</a><a href="/privacy">Privacy Policy</a><a href="/disclaimer">Disclaimer</a>
          ${site.contactEmail ? `<a href="mailto:${escapeHtml(site.contactEmail)}" data-external>Contact</a>` : ''}</div>
      </div>
      <div class="disclaimer-box"><b>Education only.</b> TradeIQ teaches; it doesn't give financial advice. All trading here uses simulated money.
        Market data is for learning and may be delayed or wrong.${site.dataSources ? ` Prices: ${escapeHtml(site.dataSources.prices)}. Company financials and filings: ${escapeHtml(site.dataSources.company)}.` : ''} Investing involves risk, including loss of principal. Talk to a licensed professional before making real financial decisions.</div>
      <p class="muted" style="font-size:13px;margin-top:16px">&copy; ${new Date().getFullYear()} ${escapeHtml(site.legalEntity || 'TradeIQ')}</p>
    </div>`;
  }

  async function refreshHud() {
    if (!Session.isLoggedIn()) return;
    try {
      Session.setUser(await api.get('/me'));
    } catch { /* ignore */ }
  }

  Session.onChange((u) => {
    const hud = document.getElementById('hud');
    if (hud && u && !document.body.classList.contains('focus-mode')) {
      hud.innerHTML = hudHtml(u);
      hud.querySelector('#avatar-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
    }
  });

  // ---------- Session lifecycle ----------
  function connectSocket() {
    if (typeof io === 'undefined' || !Session.token) return;
    if (socket) socket.disconnect();
    socket = io({ auth: (cb) => cb({ token: Session.token }) });
    socket.on('online_count', (n) => window.dispatchEvent(new CustomEvent('admin-online-count', { detail: n })));
    socket.on('admin_online_users', (l) => window.dispatchEvent(new CustomEvent('admin-online-users', { detail: l })));
    socket.on('admin_stats', (s) => window.dispatchEvent(new CustomEvent('admin-stats-update', { detail: s })));
    window.TradeIQSocket = socket;
  }

  function onLoggedIn(next) {
    portfolios = [];
    connectSocket();
    document.getElementById('footer').innerHTML = '';
    go(next || '/learn');
  }

  async function logout() {
    try { await api.post('/auth/logout'); } catch { /* best effort */ }
    if (socket) socket.disconnect();
    socket = null;
    portfolios = [];
    Session.clear();
    document.getElementById('footer').innerHTML = '';
    go('/');
    UI.toast('Logged out. See you soon!', 'info');
  }

  window.addEventListener('session-expired', () => {
    UI.toast('Your session expired. Please log in again.', 'error');
    AuthModal.open('login', { next: location.pathname });
  });

  // Legacy hook used by older modules ("Try it in the sim" etc.)
  function goToSection(section, params) {
    const map = { 'ai-trader': '/bot', 'my-desk': '/trade', research: '/research', lessons: '/learn', admin: '/admin' };
    const qs = params && params.strategy ? `?strategy=${encodeURIComponent(params.strategy)}` : '';
    go((map[section] || '/learn') + qs);
  }

  async function init() {
    api.get('/site').then((s) => { site = s; document.getElementById('footer').innerHTML = ''; if (!document.body.classList.contains('focus-mode')) document.getElementById('footer').innerHTML = footerHtml(); }).catch(() => {});
    try {
      await Session.refresh();
      connectSocket();
    } catch {
      // not logged in; that's fine
    }
    route();
  }

  return {
    init, go, route, onLoggedIn, logout, refreshHud, goToSection,
    getAiPortfolioId: () => portfolioId('ai'),
    getManualPortfolioId: () => portfolioId('manual'),
    reloadPortfolios: async () => { portfolios = await api.get('/portfolio'); },
    get site() { return site; },
  };
})();

window.App = App;
window.TradeIQApp = App;
document.addEventListener('DOMContentLoaded', App.init);
