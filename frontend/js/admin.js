/* ============================================================
   TradeIQ — admin.js
   Admin panel: overview metrics, users, a read-only Data Explorer
   for every table, email delivery log, and the audit trail.
   ============================================================ */

const AdminSection = (() => {
  let tab = 'overview';
  let charts = {};
  let usersState = { page: 1, search: '' };
  let dbState = { table: 'users', page: 1, search: '', sort: '', dir: 'desc' };
  let listeners = false;

  const timeAgo = (d) => {
    if (!d) return '—';
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  };
  const fmtCell = (v) => {
    if (v == null) return '<span class="muted">null</span>';
    if (typeof v === 'object') return `<code>${escapeHtml(JSON.stringify(v)).slice(0, 160)}</code>`;
    const s = String(v);
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return `<span title="${escapeHtml(s)}">${escapeHtml(new Date(s).toLocaleString())}</span>`;
    if (s === '[redacted]') return '<span class="chip-tag">redacted</span>';
    return escapeHtml(s.length > 120 ? `${s.slice(0, 120)}…` : s);
  };

  function render() {
    const root = document.getElementById('content-area');
    root.innerHTML = `<div class="page-head"><div><span class="eyebrow">Admin</span><h1>Control room</h1></div><div class="spacer"></div>
      <div class="tabs" id="adm-tabs">${[['overview', 'Overview'], ['users', 'Users'], ['data', 'Data Explorer'], ['emails', 'Emails'], ['audit', 'Audit log']]
        .map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div id="adm-body"></div>`;
    root.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; render(); });
    Object.values(charts).forEach((c) => ChartHelpers.destroyIfExists(c));
    charts = {};
    ({ overview, users, data: dataExplorer, emails, audit })[tab]();
    attachSocketListeners();
  }

  // ---------- Overview ----------
  async function overview() {
    const body = document.getElementById('adm-body');
    body.innerHTML = '<div class="empty-state"><span class="spinner"></span></div>';
    const d = await api.get('/admin/dashboard');
    const metric = (label, val, id, icon) => `<div class="card admin-metric-card">${Sprites.icon(icon, 26)}<div class="metric-value" ${id ? `id="${id}"` : ''}>${val}</div><div class="metric-label">${label}</div></div>`;
    body.innerHTML = `<div class="admin-cards-row">
        ${metric('Online now', d.activeNow, 'adm-online-count', 'heart')}${metric('Total users', d.totalUsers, '', 'person')}${metric('New today', d.newUsersToday, '', 'star')}
        ${metric('Active this week', d.activeThisWeek, '', 'fire')}${metric('Lessons completed', d.totalLessonsCompleted, '', 'book')}${metric('Exams passed', d.examsPassed, '', 'trophy')}
        ${metric('Simulated trades', d.totalTrades, '', 'chart')}${metric('Users with email', d.usersWithEmail, '', 'card')}</div>
      <div class="admin-charts-row">
        <div class="card"><div class="card-title">Signups, last 30 days</div><div class="chart-wrap-sm"><canvas id="c-signups"></canvas></div></div>
        <div class="card"><div class="card-title">Strategy usage</div><div class="chart-wrap-sm"><canvas id="c-strat"></canvas></div></div>
      </div>
      <div class="card" style="margin-top:20px"><div class="card-title">Lesson funnel <small class="muted" style="font-weight:500">how many people finished each lesson, in order. Big drops = lessons to improve.</small></div>
        <div class="chart-wrap-tall"><canvas id="c-funnel"></canvas></div></div>
      <div class="admin-grid-layout" style="margin-top:20px">
        <div class="card"><div class="card-title"><span class="live-dot"></span>Online now</div><div id="adm-online"></div></div>
        <div class="card"><div class="card-title">Newest users</div>${d.recentRegistrations.map((r) => `<div class="recent-reg-item"><b>${escapeHtml(r.username)}</b><span class="muted">${r.xp} XP · ${timeAgo(r.createdAt)}</span></div>`).join('') || '<div class="empty-state">No users yet</div>'}</div>
      </div>
      <div class="card" style="margin-top:20px"><div class="card-title">Email activity (7 days)</div>
        ${d.emailStats.length ? `<table class="data-table"><thead><tr><th>Kind</th><th>Status</th><th>Count</th></tr></thead><tbody>${d.emailStats.map((e) => `<tr><td>${escapeHtml(e.kind)}</td><td>${statusTag(e.status)}</td><td>${e.n}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No emails sent this week.</p>'}</div>`;

    const days = d.signupsByDay.map((r) => r.day.slice(5));
    charts.signups = ChartHelpers.buildBarChart(document.getElementById('c-signups'), days, d.signupsByDay.map((r) => r.n), 'Signups', '#1fbf75');
    if (d.topStrategies.length) charts.strat = ChartHelpers.buildPieChart(document.getElementById('c-strat'), d.topStrategies.map((s) => s.strategy), d.topStrategies.map((s) => s.count));
    const colors = { money: '#1fbf75', stocks: '#3d8bfd', options: '#ff7a45', futures: '#8b5cf6' };
    charts.funnel = ChartHelpers.buildBarChart(document.getElementById('c-funnel'), d.lessonFunnel.map((l, i) => `${i + 1}`), d.lessonFunnel.map((l) => l.completed), 'Completed', d.lessonFunnel.map((l) => colors[l.unitId]));
    loadOnline();
  }

  const statusTag = (s) => `<span class="chip-tag" style="background:${s === 'sent' ? 'var(--mint-l)' : s === 'failed' ? 'var(--tomato-l)' : 'var(--paper-2)'}">${escapeHtml(s)}</span>`;

  async function loadOnline(list) {
    const el = document.getElementById('adm-online');
    if (!el) return;
    const rows = list || await api.get('/admin/online').catch(() => []);
    el.innerHTML = rows.length ? `<table class="data-table"><thead><tr><th>User</th><th>Page</th><th>Since</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${escapeHtml(r.username)}</td><td>${escapeHtml(r.currentPage)}</td><td>${timeAgo(r.connectedAt)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Nobody online right now.</p>';
  }

  // ---------- Users ----------
  async function users() {
    const body = document.getElementById('adm-body');
    body.innerHTML = `<div class="card"><div class="row-wrap" style="margin-bottom:14px"><input class="input" id="u-search" placeholder="Search username or email" value="${escapeHtml(usersState.search)}" style="max-width:320px" /><button class="btn btn-sm" id="u-go">Search</button></div>
      <div class="table-scroll" id="u-table"><div class="empty-state"><span class="spinner"></span></div></div><div class="pagination-row" id="u-pages"></div></div>`;
    const go = () => { usersState.search = document.getElementById('u-search').value.trim(); usersState.page = 1; loadUsers(); };
    document.getElementById('u-go').onclick = go;
    document.getElementById('u-search').onkeydown = (e) => { if (e.key === 'Enter') go(); };
    loadUsers();
  }

  async function loadUsers() {
    const d = await api.get(`/admin/users?page=${usersState.page}&limit=25&search=${encodeURIComponent(usersState.search)}`);
    document.getElementById('u-table').innerHTML = `<table class="data-table"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>XP</th><th>Lessons</th><th>Trades</th><th>Joined</th><th>Last login</th><th>Status</th></tr></thead><tbody>
      ${d.users.map((u) => `<tr class="user-row" data-id="${u.id}"><td><b>${escapeHtml(u.username)}</b></td><td>${u.email ? `${escapeHtml(u.email)}${u.emailVerified ? ' ✓' : ''}` : '<span class="muted">none</span>'}</td>
        <td>${u.role === 'admin' ? '<span class="chip-tag" style="background:var(--sun)">admin</span>' : 'user'}</td><td class="mono">${u.xp}</td><td>${u.lessonsCompleted}</td><td>${u.tradesCount}</td>
        <td>${new Date(u.createdAt).toLocaleDateString()}</td><td>${timeAgo(u.lastLogin)}</td>
        <td>${!u.isActive ? '<span class="chip-tag" style="background:var(--tomato-l)">deactivated</span>' : u.locked ? '<span class="chip-tag" style="background:var(--sun-l)">locked</span>' : '<span class="chip-tag" style="background:var(--mint-l)">active</span>'}</td></tr>`).join('')}
      </tbody></table>${d.users.length ? '' : '<div class="empty-state">No users found</div>'}`;
    document.querySelectorAll('.user-row').forEach((r) => r.onclick = () => userModal(Number(r.dataset.id)));
    pages('u-pages', d.page, d.totalPages, (p) => { usersState.page = p; loadUsers(); });
  }

  function pages(id, page, total, go) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = total > 1 ? `<button class="btn btn-sm" ${page <= 1 ? 'disabled' : ''} data-p="${page - 1}">Prev</button><span class="mono">${page} / ${total}</span><button class="btn btn-sm" ${page >= total ? 'disabled' : ''} data-p="${page + 1}">Next</button>` : '';
    el.querySelectorAll('[data-p]').forEach((b) => b.onclick = () => go(Number(b.dataset.p)));
  }

  async function userModal(id) {
    const d = await api.get(`/admin/users/${id}`);
    const u = d.user;
    const isMe = u.id === Session.user.id;
    const m = UI.modal(`<span class="eyebrow">User #${u.id}</span><h2>${escapeHtml(u.username)}</h2>
      <div class="row-wrap" style="margin-bottom:12px"><span class="chip-tag">${u.role}</span><span class="chip-tag">${u.xp} XP</span><span class="chip-tag">streak ${u.streak}</span>
        <span class="chip-tag">${d.activeSessions} active session(s)</span>${u.lockedUntil && new Date(u.lockedUntil) > new Date() ? '<span class="chip-tag" style="background:var(--sun)">locked</span>' : ''}</div>
      <p class="muted" style="font-size:14px">Email: ${u.email ? escapeHtml(u.email) + (u.emailVerified ? ' (confirmed)' : ' (unconfirmed)') : 'none'} · Timezone: ${escapeHtml(u.timezone)} · Joined ${new Date(u.createdAt).toLocaleDateString()} · Failed logins: ${u.failedLogins}</p>
      <h4>Portfolios</h4><table class="data-table"><thead><tr><th>Type</th><th>Cash</th><th>Trades</th><th>Realized P/L</th><th>Win rate</th></tr></thead><tbody>
        ${d.portfolios.map((p) => `<tr><td>${p.portfolioType}</td><td>${UI.fmtMoney(p.cash)}</td><td>${p.totalTrades}</td><td>${UI.fmtMoney(p.realizedPnl)}</td><td>${p.winRate}%</td></tr>`).join('')}</tbody></table>
      <h4>Lessons (${d.lessonProgress.length}) · Exams: ${d.exams.map((e) => `${e.unit_id} ${e.passed ? '✓' : '✗'} ${e.best_score}%`).join(', ') || 'none'}</h4>
      <div style="max-height:160px;overflow:auto">${d.lessonProgress.slice(0, 50).map((l) => `<div class="recent-reg-item"><span>${escapeHtml(l.title)}</span><span class="mono">${l.best_score}%</span></div>`).join('') || '<p class="muted">None yet</p>'}</div>
      <h4>Actions</h4><div class="row-wrap">
        <button class="btn btn-sm" data-a="unlock">Unlock login</button><button class="btn btn-sm" data-a="revoke">Sign out everywhere</button>
        ${isMe ? '' : `<button class="btn btn-sm" data-a="role">${u.role === 'admin' ? 'Remove admin' : 'Make admin'}</button>
        <button class="btn btn-sm" data-a="active">${u.isActive ? 'Deactivate' : 'Reactivate'}</button><button class="btn btn-sm btn-danger" data-a="delete">Delete user</button>`}
      </div>`, { wide: true });
    m.el.querySelectorAll('[data-a]').forEach((b) => b.onclick = async () => {
      try {
        const a = b.dataset.a;
        if (a === 'unlock') UI.toast((await api.post(`/admin/users/${id}/unlock`)).message, 'success');
        if (a === 'revoke') UI.toast((await api.post(`/admin/users/${id}/revoke-sessions`)).message, 'success');
        if (a === 'role') {
          if (!(await UI.confirm({ title: 'Change role?', message: `Make ${escapeHtml(u.username)} ${u.role === 'admin' ? 'a regular user' : 'an admin'}?` }))) return;
          await api.patch(`/admin/users/${id}`, { role: u.role === 'admin' ? 'user' : 'admin' });
        }
        if (a === 'active') await api.patch(`/admin/users/${id}`, { isActive: !u.isActive });
        if (a === 'delete') {
          const name = prompt(`Type ${u.username} to permanently delete this user and all their data:`);
          if (name == null) return;
          UI.toast((await api.delete(`/admin/users/${id}`, { confirmUsername: name })).message, 'success');
        }
        m.close();
        if (tab === 'users') loadUsers();
      } catch (err) { UI.toast(err.message, 'error'); }
    });
  }

  // ---------- Data Explorer ----------
  async function dataExplorer() {
    const body = document.getElementById('adm-body');
    const tables = await api.get('/admin/db/tables');
    body.innerHTML = `<div class="explorer">
      <aside class="card explorer-tables"><div class="card-title">${Sprites.icon('book', 20)} Tables</div>
        ${tables.map((t) => `<button data-t="${t.name}" class="${dbState.table === t.name ? 'on' : ''}"><span>${t.name}</span><small>~${t.approx_rows}</small></button>`).join('')}
        <p class="muted" style="font-size:12.5px;margin-top:10px">Read-only. Passwords, tokens and recovery codes are always redacted. Exports are audit-logged.</p></aside>
      <section class="card explorer-main"><div class="row-wrap" style="margin-bottom:12px"><b class="mono" id="db-name"></b><span class="muted" id="db-count"></span><span class="spacer"></span>
        <input class="input" id="db-search" placeholder="Search text columns" value="${escapeHtml(dbState.search)}" style="max-width:240px;padding:8px 12px" />
        <button class="btn btn-sm" id="db-go">Search</button><button class="btn btn-sm btn-sun" id="db-csv">Export CSV</button></div>
        <div class="table-scroll" id="db-table"><div class="empty-state"><span class="spinner"></span></div></div><div class="pagination-row" id="db-pages"></div></section></div>`;
    body.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { dbState = { table: b.dataset.t, page: 1, search: '', sort: '', dir: 'desc' }; dataExplorer(); });
    const go = () => { dbState.search = document.getElementById('db-search').value.trim(); dbState.page = 1; loadTable(); };
    document.getElementById('db-go').onclick = go;
    document.getElementById('db-search').onkeydown = (e) => { if (e.key === 'Enter') go(); };
    document.getElementById('db-csv').onclick = exportCsv;
    loadTable();
  }

  const dbQuery = () => `page=${dbState.page}&limit=50&search=${encodeURIComponent(dbState.search)}&sort=${encodeURIComponent(dbState.sort)}&dir=${dbState.dir}`;

  async function loadTable() {
    const d = await api.get(`/admin/db/tables/${dbState.table}?${dbQuery()}`);
    dbState.sort = d.sort;
    document.getElementById('db-name').textContent = d.table;
    document.getElementById('db-count').textContent = `${d.total.toLocaleString()} row${d.total === 1 ? '' : 's'}`;
    const cols = d.columns.map((c) => c.column_name);
    document.getElementById('db-table').innerHTML = `<table class="data-table"><thead><tr>${cols.map((c) => `<th data-sort="${c}" class="sortable">${escapeHtml(c)}${d.sort === c ? (d.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>`).join('')}</tr></thead>
      <tbody>${d.rows.map((r) => `<tr>${cols.map((c) => `<td>${fmtCell(r[c])}</td>`).join('')}</tr>`).join('')}</tbody></table>${d.rows.length ? '' : '<div class="empty-state">No rows</div>'}`;
    document.querySelectorAll('[data-sort]').forEach((th) => th.onclick = () => {
      dbState.dir = dbState.sort === th.dataset.sort && dbState.dir === 'desc' ? 'asc' : 'desc';
      dbState.sort = th.dataset.sort;
      loadTable();
    });
    pages('db-pages', d.page, Math.ceil(d.total / d.limit), (p) => { dbState.page = p; loadTable(); });
  }

  async function exportCsv() {
    try {
      const res = await fetch(`/api/admin/db/tables/${dbState.table}/export?${dbQuery()}`, { headers: { Authorization: `Bearer ${Session.token}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${dbState.table}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) { UI.toast(err.message, 'error'); }
  }

  // ---------- Emails ----------
  async function emails() {
    const body = document.getElementById('adm-body');
    const rows = await api.get('/admin/emails');
    body.innerHTML = `<div class="card"><div class="row-wrap" style="margin-bottom:12px"><div class="card-title" style="margin:0">Email log</div><span class="spacer"></span>
        <button class="btn btn-sm" data-job="reminders">Run streak reminders now</button><button class="btn btn-sm" data-job="digest">Run weekly digest now</button></div>
      <p class="muted" style="font-size:14px">Streak reminders run hourly (6pm in each user's timezone). Digests run Sundays at 15:00 UTC. "skipped" means RESEND_API_KEY isn't set, so emails print to the server log.</p>
      <div class="table-scroll"><table class="data-table"><thead><tr><th>When</th><th>User</th><th>Kind</th><th>Status</th><th>Error</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${timeAgo(r.createdAt)}</td><td>${escapeHtml(r.username || '—')}</td><td>${escapeHtml(r.kind)}</td><td>${statusTag(r.status)}</td><td class="muted">${escapeHtml(r.error || '')}</td></tr>`).join('')}
      </tbody></table>${rows.length ? '' : '<div class="empty-state">No emails yet</div>'}</div></div>`;
    body.querySelectorAll('[data-job]').forEach((b) => b.onclick = async () => {
      UI.setBusy(b, true);
      try { UI.toast((await api.post(`/admin/emails/run/${b.dataset.job}`)).message, 'success'); emails(); } catch (err) { UI.toast(err.message, 'error'); UI.setBusy(b, false); }
    });
  }

  // ---------- Audit ----------
  async function audit() {
    const body = document.getElementById('adm-body');
    const rows = await api.get('/admin/audit-log');
    body.innerHTML = `<div class="card"><div class="card-title">Audit log <small class="muted" style="font-weight:500">every admin action, newest first</small></div><div class="table-scroll"><table class="data-table"><thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Target</th><th>Details</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${new Date(r.createdAt).toLocaleString()}</td><td>${escapeHtml(r.admin || 'CLI / system')}</td><td><b>${escapeHtml(r.action)}</b></td><td>${escapeHtml(r.target || '—')}</td><td>${fmtCell(r.details)}</td></tr>`).join('')}
      </tbody></table>${rows.length ? '' : '<div class="empty-state">Nothing logged yet</div>'}</div></div>`;
  }

  function attachSocketListeners() {
    if (listeners) return;
    listeners = true;
    window.addEventListener('admin-online-count', (e) => { const el = document.getElementById('adm-online-count'); if (el) el.textContent = e.detail; });
    window.addEventListener('admin-online-users', (e) => loadOnline(e.detail));
  }

  return { render };
})();

window.AdminSection = AdminSection;
