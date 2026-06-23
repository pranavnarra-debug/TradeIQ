/* ============================================================
   TradeIQ — app.js
   Main app shell: sidebar, topbar, routing, socket.io wiring
   ============================================================ */

const TradeIQApp = (() => {
  let socket = null;
  let currentSection = 'ai-trader';
  let portfolios = [];

  const SECTIONS = [
    { id: 'ai-trader', label: 'AI Trader', icon: 'fa-solid fa-robot' },
    { id: 'my-desk', label: 'My Desk', icon: 'fa-solid fa-table-columns' },
    { id: 'research', label: 'Research', icon: 'fa-solid fa-magnifying-glass-chart' },
    { id: 'lessons', label: 'Lessons', icon: 'fa-solid fa-graduation-cap' },
  ];

  function getInitials(username) {
    if (!username) return '?';
    return username.slice(0, 2).toUpperCase();
  }

  function connectSocket() {
    const token = auth.getAccessToken();
    if (!token) return;
    if (socket) socket.disconnect();

    socket = io({ auth: { token } });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('online_count', (count) => {
      window.dispatchEvent(new CustomEvent('admin-online-count', { detail: count }));
    });
    socket.on('admin_online_users', (list) => {
      window.dispatchEvent(new CustomEvent('admin-online-users', { detail: list }));
    });
    socket.on('admin_stats', (stats) => {
      window.dispatchEvent(new CustomEvent('admin-stats-update', { detail: stats }));
    });

    window.TradeIQSocket = socket;
  }

  function emitPageChange(section) {
    if (socket && socket.connected) {
      socket.emit('page_change', section);
    }
  }

  async function fetchMarketBadge() {
    try {
      const quote = await api.get('/market/quote/SPY');
      const state = (quote.marketState || 'CLOSED').toUpperCase();
      renderMarketBadge(state);
    } catch {
      renderMarketBadge('CLOSED');
    }
  }

  function renderMarketBadge(state) {
    const el = document.getElementById('market-status-badge');
    if (!el) return;
    const map = {
      REGULAR: { cls: 'open', text: 'MARKET OPEN', icon: 'fa-circle' },
      PRE: { cls: 'pre', text: 'PRE-MARKET', icon: 'fa-clock' },
      POST: { cls: 'post', text: 'AFTER HOURS', icon: 'fa-clock' },
      CLOSED: { cls: 'closed', text: 'MARKET CLOSED', icon: 'fa-circle' },
    };
    const info = map[state] || map.CLOSED;
    el.className = `market-badge ${info.cls}`;
    el.innerHTML = `<i class="fa-solid ${info.icon}" style="font-size:8px;"></i> ${info.text}`;
  }

  function renderShell(user) {
    const app = document.getElementById('app');
    const isAdmin = user.role === 'admin';

    app.innerHTML = `
      <button class="sidebar-toggle" id="sidebar-toggle"><i class="fa-solid fa-bars"></i></button>
      <div class="app-shell">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-logo"><i class="fa-solid fa-chart-line logo-icon"></i> TradeIQ</div>
          <nav class="sidebar-nav" id="sidebar-nav">
            ${SECTIONS.map((s) => `
              <button class="nav-link" data-section="${s.id}">
                <i class="${s.icon}"></i> ${s.label}
              </button>
            `).join('')}
            ${isAdmin ? `
              <button class="nav-link admin-link" data-section="admin">
                <i class="fa-solid fa-shield-halved"></i> Admin Dashboard
              </button>
            ` : ''}
          </nav>
          <div class="sidebar-footer">
            <div class="avatar-circle">${getInitials(user.username)}</div>
            <div class="sidebar-footer-info">
              <div class="username">${user.username}</div>
            </div>
            <button class="logout-btn" id="logout-btn" title="Log out"><i class="fa-solid fa-right-from-bracket"></i></button>
          </div>
        </aside>

        <div class="main-area">
          <div class="topbar">
            <div class="topbar-title" id="topbar-title">AI Trader</div>
            <div class="topbar-right">
              <span class="market-badge closed" id="market-status-badge">MARKET CLOSED</span>
              <span>Hi, ${user.username}</span>
            </div>
          </div>
          <div class="content-area" id="content-area"></div>
          <div class="app-footer">
            ⚠️ TradeIQ is for educational purposes only. All trading is paper trading only.
            Market data via Yahoo Finance for educational use. Nothing here is financial advice.
          </div>
        </div>
      </div>
    `;

    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('mobile-open');
    });

    document.querySelectorAll('.nav-link').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigateTo(btn.dataset.section);
        document.getElementById('sidebar').classList.remove('mobile-open');
      });
    });

    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    fetchMarketBadge();
  }

  async function handleLogout() {
    try {
      const refreshToken = localStorage.getItem('tradeiq_refresh_token');
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {
      // best-effort; proceed with local logout regardless
    }
    if (socket) socket.disconnect();
    auth.clearTokens();
    AuthScreens.init();
  }

  const SECTION_TITLES = {
    'ai-trader': 'AI Trader',
    'my-desk': 'My Trading Desk',
    research: 'Stock Research',
    lessons: 'Lessons',
    admin: 'Admin Dashboard',
  };

  const SECTION_RENDERERS = {
    'ai-trader': () => window.AiTraderSection && window.AiTraderSection.render(getAiPortfolioId()),
    'my-desk': () => window.MyDeskSection && window.MyDeskSection.render(getManualPortfolioId()),
    research: () => window.ResearchSection && window.ResearchSection.render(),
    lessons: (params) => window.LessonsSection && window.LessonsSection.render(params),
    admin: () => window.AdminSection && window.AdminSection.render(),
  };

  function getAiPortfolioId() {
    const p = portfolios.find((p) => p.portfolioType === 'ai');
    return p ? p.portfolioId : null;
  }
  function getManualPortfolioId() {
    const p = portfolios.find((p) => p.portfolioType === 'manual');
    return p ? p.portfolioId : null;
  }

  function navigateTo(section, params) {
    currentSection = section;
    document.querySelectorAll('.nav-link').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });
    document.getElementById('topbar-title').textContent = SECTION_TITLES[section] || section;

    const content = document.getElementById('content-area');
    content.classList.remove('section-fade');
    content.innerHTML = '<div class="empty-state"><span class="spinner"></span> Loading...</div>';

    requestAnimationFrame(() => {
      content.classList.add('section-fade');
    });

    emitPageChange(section);

    const renderer = SECTION_RENDERERS[section];
    if (renderer) {
      Promise.resolve(renderer(params)).catch((err) => {
        console.error(`Failed to render section ${section}:`, err);
        content.innerHTML = `<div class="empty-state">Something went wrong loading this section. Please try again.</div>`;
      });
    } else {
      content.innerHTML = `<div class="empty-state">Section not found.</div>`;
    }
  }

  // Exposed so feature modules (e.g. "Try It in the Sim" from lessons) can jump sections.
  function goToSection(section, params) {
    navigateTo(section, params);
  }

  async function loadPortfolios() {
    try {
      portfolios = await api.get('/portfolio');
    } catch (err) {
      console.error('Failed to load portfolios:', err);
      portfolios = [];
    }
  }

  async function boot() {
    const user = auth.getUser();
    if (!user) {
      AuthScreens.init();
      return;
    }

    renderShell(user);
    connectSocket();
    await loadPortfolios();
    navigateTo('ai-trader');
  }

  function initListeners() {
    window.addEventListener('login-success', async () => {
      const user = auth.getUser();
      renderShell(user);
      connectSocket();
      await loadPortfolios();
      navigateTo('ai-trader');
    });

    window.addEventListener('logout', () => {
      AuthScreens.init();
    });
  }

  function init() {
    initListeners();

    if (auth.isAuthenticated()) {
      // We have a refresh token but no access token yet (page reload case).
      // Try to silently refresh, then boot the app shell.
      api.get('/lessons/stats')
        .then(() => boot())
        .catch(() => {
          auth.clearTokens();
          AuthScreens.init();
        });
    } else {
      AuthScreens.init();
    }
  }

  return { init, navigateTo, goToSection, getAiPortfolioId, getManualPortfolioId, reloadPortfolios: loadPortfolios };
})();

window.TradeIQApp = TradeIQApp;

document.addEventListener('DOMContentLoaded', () => {
  TradeIQApp.init();
});
