/* ============================================================
   TradeIQ — admin.js
   Admin Dashboard: metrics, charts, live users, user management
   ============================================================ */

const AdminSection = (() => {
  let state = {
    charts: {},
    page: 1,
    search: '',
    onlineListenerAttached: false,
    statsListenerAttached: false,
  };

  function fmtMoney(n) {
    if (n == null || isNaN(n)) return '—';
    return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function timeAgo(dateStr) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  async function render() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <div class="admin-cards-row" id="admin-cards-row">
        ${renderMetricCardSkeleton('🟢', 'Active Now', 'admin-active-now')}
        ${renderMetricCardSkeleton('👥', 'Total Users', 'admin-total-users')}
        ${renderMetricCardSkeleton('📅', 'New Today', 'admin-new-today')}
        ${renderMetricCardSkeleton('📅', 'New This Week', 'admin-new-week')}
        ${renderMetricCardSkeleton('📊', 'Total Trades', 'admin-total-trades')}
        ${renderMetricCardSkeleton('🎓', 'Lessons Completed', 'admin-total-lessons')}
      </div>

      <div class="admin-charts-row">
        <div class="card admin-chart-card">
          <div class="card-title">New Registrations (30d)</div>
          <div class="chart-wrap-sm"><canvas id="admin-registrations-chart"></canvas></div>
        </div>
        <div class="card admin-chart-card">
          <div class="card-title">Lessons Completed by Lesson #</div>
          <div class="chart-wrap-sm"><canvas id="admin-lessons-chart"></canvas></div>
        </div>
        <div class="card admin-chart-card">
          <div class="card-title">Strategy Usage</div>
          <div class="chart-wrap-sm"><canvas id="admin-strategy-chart"></canvas></div>
        </div>
      </div>

      <div class="admin-grid-layout">
        <div>
          <div class="card" style="margin-bottom: 16px;">
            <div class="card-title"><span class="live-dot"></span>Live Online Users</div>
            <table>
              <thead><tr><th>Username</th><th>Connected At</th><th>Last Activity</th><th>Current Section</th></tr></thead>
              <tbody id="admin-online-table-body"><tr><td colspan="4" class="empty-state">No users currently online</td></tr></tbody>
            </table>
          </div>

          <div class="card">
            <div class="card-title">Users Management</div>
            <div class="admin-users-search">
              <input class="input" id="admin-search-input" placeholder="Search by username or email..." />
              <button class="btn" id="admin-search-btn">Search</button>
            </div>
            <table>
              <thead><tr><th>#</th><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th>Last Login</th><th>Trades</th><th>Lessons</th><th>Status</th></tr></thead>
              <tbody id="admin-users-table-body"><tr><td colspan="9" class="empty-state">Loading...</td></tr></tbody>
            </table>
            <div class="pagination-row" id="admin-pagination"></div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Recent Registrations</div>
          <div id="admin-recent-registrations"></div>
        </div>
      </div>

      <div id="admin-user-modal-root"></div>
    `;

    document.getElementById('admin-search-btn').addEventListener('click', () => {
      state.search = document.getElementById('admin-search-input').value.trim();
      state.page = 1;
      loadUsersTable();
    });
    document.getElementById('admin-search-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        state.search = e.target.value.trim();
        state.page = 1;
        loadUsersTable();
      }
    });

    await loadDashboard();
    await loadUsersTable();
    await loadOnlineUsers();
    attachSocketListeners();
  }

  function renderMetricCardSkeleton(icon, label, id) {
    return `
      <div class="card admin-metric-card">
        <div class="icon">${icon}</div>
        <div class="metric-value" id="${id}">—</div>
        <div class="metric-label">${label}</div>
      </div>
    `;
  }

  function applyDashboardData(data) {
    document.getElementById('admin-active-now').textContent = data.activeNow ?? 0;
    document.getElementById('admin-total-users').textContent = data.totalUsers ?? 0;
    document.getElementById('admin-new-today').textContent = data.newUsersToday ?? 0;
    document.getElementById('admin-new-week').textContent = data.newUsersThisWeek ?? 0;
    document.getElementById('admin-total-trades').textContent = data.totalTrades ?? 0;
    document.getElementById('admin-total-lessons').textContent = data.totalLessonsCompleted ?? 0;

    const recentEl = document.getElementById('admin-recent-registrations');
    if (recentEl) {
      recentEl.innerHTML = (data.recentRegistrations || []).length === 0
        ? '<div class="empty-state">No registrations yet</div>'
        : data.recentRegistrations.map((r) => `
          <div class="recent-reg-item">
            <div><strong>${escapeHtml(r.username)}</strong><br/><span class="text-dim">${escapeHtml(r.email)}</span></div>
            <div class="reg-time">${timeAgo(r.createdAt)}</div>
          </div>
        `).join('');
    }

    renderStrategyChart(data.topStrategies || []);
  }

  async function loadDashboard() {
    try {
      const data = await api.get('/admin/dashboard');
      applyDashboardData(data);
      renderLessonsChart(data.lessonCompletionRates || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    }

    try {
      const history = await api.get('/admin/metrics/history');
      renderRegistrationsChart(history);
    } catch (err) {
      console.error('Failed to load metrics history:', err);
    }
  }

  function renderRegistrationsChart(history) {
    const canvas = document.getElementById('admin-registrations-chart');
    if (!canvas) return;
    ChartHelpers.destroyIfExists(state.charts.registrations);

    // Group snapshots by day, using max total_users delta as a proxy for daily new signups.
    const byDay = new Map();
    history.forEach((row) => {
      const day = new Date(row.snapshot_time).toLocaleDateString();
      byDay.set(day, row.total_users);
    });
    const days = Array.from(byDay.keys());
    const totals = Array.from(byDay.values());
    const deltas = totals.map((t, i) => (i === 0 ? 0 : Math.max(0, t - totals[i - 1])));

    state.charts.registrations = ChartHelpers.buildLineChart(canvas, days, deltas, 'New Users', '#58a6ff');
  }

  function renderLessonsChart(rates) {
    const canvas = document.getElementById('admin-lessons-chart');
    if (!canvas) return;
    ChartHelpers.destroyIfExists(state.charts.lessons);
    const labels = rates.map((r) => `L${r.lessonNumber}`);
    const data = rates.map((r) => r.completedCount);
    state.charts.lessons = ChartHelpers.buildBarChart(canvas, labels, data, 'Completed', '#3fb950');
  }

  function renderStrategyChart(topStrategies) {
    const canvas = document.getElementById('admin-strategy-chart');
    if (!canvas) return;
    ChartHelpers.destroyIfExists(state.charts.strategy);
    if (!topStrategies || topStrategies.length === 0) {
      return;
    }
    const labels = topStrategies.map((s) => s.strategy);
    const data = topStrategies.map((s) => s.count);
    state.charts.strategy = ChartHelpers.buildPieChart(canvas, labels, data);
  }

  async function loadOnlineUsers() {
    try {
      const list = await api.get('/admin/online');
      renderOnlineTable(list);
    } catch (err) {
      console.error('Failed to load online users:', err);
    }
  }

  function renderOnlineTable(list) {
    const body = document.getElementById('admin-online-table-body');
    if (!body) return;
    if (!list || list.length === 0) {
      body.innerHTML = '<tr><td colspan="4" class="empty-state">No users currently online</td></tr>';
      return;
    }
    body.innerHTML = list.map((u) => `
      <tr>
        <td>${escapeHtml(u.username)}</td>
        <td>${new Date(u.connectedAt).toLocaleTimeString()}</td>
        <td>${new Date(u.lastActivity).toLocaleTimeString()}</td>
        <td><span class="badge badge-hold">${escapeHtml(u.currentPage) || '—'}</span></td>
      </tr>
    `).join('');
  }

  async function loadUsersTable() {
    try {
      const params = new URLSearchParams({ page: state.page, limit: 20 });
      if (state.search) params.set('search', state.search);
      const data = await api.get(`/admin/users?${params.toString()}`);

      const body = document.getElementById('admin-users-table-body');
      if (!body) return;
      if (!data.users || data.users.length === 0) {
        body.innerHTML = '<tr><td colspan="9" class="empty-state">No users found</td></tr>';
      } else {
        body.innerHTML = data.users.map((u, i) => `
          <tr class="user-row" data-user-id="${u.id}" style="cursor:pointer;">
            <td>${(state.page - 1) * 20 + i + 1}</td>
            <td>${escapeHtml(u.username)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td><span class="badge ${u.role === 'admin' ? 'badge-buy' : 'badge-hold'}">${u.role}</span></td>
            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            <td>${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</td>
            <td>${u.tradesCount}</td>
            <td>${u.lessonsCompleted}</td>
            <td><span class="status-dot ${u.isActive ? 'active' : 'inactive'}"></span> ${u.isActive ? 'Active' : 'Inactive'}</td>
          </tr>
        `).join('');

        document.querySelectorAll('.user-row').forEach((row) => {
          row.addEventListener('click', () => openUserDetailModal(row.dataset.userId));
        });
      }

      renderPagination(data.page, data.totalPages);
    } catch (err) {
      console.error('Failed to load users table:', err);
    }
  }

  function renderPagination(page, totalPages) {
    const el = document.getElementById('admin-pagination');
    if (!el) return;
    el.innerHTML = `
      <button class="btn btn-sm" id="prev-page-btn" ${page <= 1 ? 'disabled' : ''}>Prev</button>
      <span>Page ${page} of ${totalPages || 1}</span>
      <button class="btn btn-sm" id="next-page-btn" ${page >= totalPages ? 'disabled' : ''}>Next</button>
    `;
    document.getElementById('prev-page-btn')?.addEventListener('click', () => {
      if (state.page > 1) { state.page -= 1; loadUsersTable(); }
    });
    document.getElementById('next-page-btn')?.addEventListener('click', () => {
      state.page += 1; loadUsersTable();
    });
  }

  async function openUserDetailModal(userId) {
    try {
      const detail = await api.get(`/admin/users/${userId}`);
      const root = document.getElementById('admin-user-modal-root');
      const u = detail.user;

      root.innerHTML = `
        <div class="modal-overlay" id="user-modal-overlay">
          <div class="modal-box" style="max-width: 560px;">
            <h3>${escapeHtml(u.username)} <span class="badge ${u.role === 'admin' ? 'badge-buy' : 'badge-hold'}">${u.role}</span></h3>
            <p class="text-dim" style="margin-top:-8px;">${escapeHtml(u.email)}</p>

            <div class="grid-2" style="margin-bottom: 16px;">
              ${detail.portfolios.map((p) => `
                <div class="card">
                  <div class="card-title">${escapeHtml(p.portfolioType.toUpperCase())} Portfolio</div>
                  <div class="text-dim" style="font-size: 12.5px;">Equity: ${fmtMoney(p.equity)}</div>
                  <div class="text-dim" style="font-size: 12.5px;">Realized P&L: ${fmtMoney(p.realizedPnl)}</div>
                  <div class="text-dim" style="font-size: 12.5px;">Win Rate: ${p.winRate}%</div>
                </div>
              `).join('')}
            </div>

            <div class="card-title">Lesson Progress</div>
            <div class="lessons-progress-track" style="margin-bottom: 14px;">
              <div class="lessons-progress-fill" style="width: ${(detail.lessonProgress.filter(l => l.completed).length / 20) * 100}%;"></div>
            </div>

            <div class="card-title">Last 20 Trades</div>
            <div style="max-height: 180px; overflow-y: auto; margin-bottom: 16px;">
              <table>
                <tbody>
                  ${detail.recentTrades.length === 0 ? '<tr><td class="empty-state">No trades</td></tr>' : detail.recentTrades.map((t) => `
                    <tr><td>${escapeHtml(t.symbol)}</td><td>${escapeHtml(t.action)}</td><td>${t.quantity}</td><td>${fmtMoney(Number(t.price))}</td></tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="modal-actions" style="justify-content: space-between;">
              <div class="flex-row">
                <button class="btn btn-sm" id="toggle-role-btn">${u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}</button>
                <button class="btn btn-sm ${u.isActive ? 'btn-red' : 'btn-green'}" id="toggle-active-btn">${u.isActive ? 'Deactivate' : 'Reactivate'}</button>
              </div>
              <button class="btn" id="close-modal-btn">Close</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('close-modal-btn').addEventListener('click', () => root.innerHTML = '');
      document.getElementById('user-modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'user-modal-overlay') root.innerHTML = '';
      });
      document.getElementById('toggle-role-btn').addEventListener('click', async () => {
        const newRole = u.role === 'admin' ? 'user' : 'admin';
        await api.patch(`/admin/users/${userId}`, { role: newRole });
        root.innerHTML = '';
        loadUsersTable();
      });
      document.getElementById('toggle-active-btn').addEventListener('click', async () => {
        await api.patch(`/admin/users/${userId}`, { isActive: !u.isActive });
        root.innerHTML = '';
        loadUsersTable();
      });
    } catch (err) {
      console.error('Failed to load user detail:', err);
    }
  }

  function attachSocketListeners() {
    if (!state.onlineListenerAttached) {
      window.addEventListener('admin-online-users', (e) => renderOnlineTable(e.detail));
      window.addEventListener('admin-online-count', (e) => {
        const el = document.getElementById('admin-active-now');
        if (el) el.textContent = e.detail;
      });
      state.onlineListenerAttached = true;
    }
    if (!state.statsListenerAttached) {
      window.addEventListener('admin-stats-update', (e) => applyDashboardData(e.detail));
      state.statsListenerAttached = true;
    }
  }

  return { render };
})();

window.AdminSection = AdminSection;
