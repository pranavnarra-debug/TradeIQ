import express from 'express';
import { query, withTransaction } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { LESSONS, LESSON_ORDER, UNITS } from '../content/index.js';
import { runStreakReminders, runWeeklyDigest } from '../jobs/emailJobs.js';

const router = express.Router();
router.use(authenticate);
router.use(adminOnly);

async function audit(req, targetUserId, action, details) {
  try {
    await query(
      'INSERT INTO admin_audit_log (admin_user_id, target_user_id, action, details) VALUES ($1, $2, $3, $4)',
      [req.user.userId, targetUserId ?? null, action, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('Failed to write admin audit log:', err.message);
  }
}

function parseId(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
router.get('/dashboard', async (req, res, next) => {
  try {
    const onlineUsers = req.app.get('onlineUsers');
    const [counts, topStrategies, lessonRates, examRates, recent, signups, emailStats] = await Promise.all([
      query(`SELECT
        (SELECT COUNT(*) FROM users)::int AS total_users,
        (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE)::int AS new_today,
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new_week,
        (SELECT COUNT(*) FROM users WHERE last_login >= NOW() - INTERVAL '7 days')::int AS active_week,
        (SELECT COUNT(*) FROM users WHERE email IS NOT NULL AND email_verified)::int AS with_email,
        (SELECT COUNT(*) FROM trades)::int AS total_trades,
        (SELECT COUNT(*) FROM lesson_completions)::int AS total_lessons,
        (SELECT COUNT(*) FROM unit_exams WHERE passed)::int AS exams_passed,
        (SELECT COALESCE(SUM(amount),0) FROM xp_events WHERE created_at >= CURRENT_DATE)::int AS xp_today`),
      query(`SELECT strategy, COUNT(*)::int AS count FROM trades WHERE strategy IS NOT NULL GROUP BY strategy ORDER BY count DESC LIMIT 6`),
      query(`SELECT lesson_id, COUNT(*)::int AS n, ROUND(AVG(best_score))::int AS avg_score FROM lesson_completions GROUP BY lesson_id`),
      query(`SELECT unit_id, COUNT(*) FILTER (WHERE passed)::int AS passed, COUNT(*)::int AS attempted FROM unit_exams GROUP BY unit_id`),
      query(`SELECT id, username, created_at AS "createdAt", xp FROM users ORDER BY created_at DESC LIMIT 10`),
      query(`SELECT DATE(created_at) AS day, COUNT(*)::int AS n FROM users WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY 1 ORDER BY 1`),
      query(`SELECT kind, status, COUNT(*)::int AS n FROM email_log WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY 1, 2 ORDER BY 1`),
    ]);
    const c = counts.rows[0];
    const byLesson = new Map(lessonRates.rows.map((r) => [r.lesson_id, r]));
    // The funnel: how many people reached each lesson, in curriculum order.
    const lessonFunnel = LESSON_ORDER.map((id) => {
      const r = byLesson.get(id);
      return { lessonId: id, title: LESSONS.get(id).lesson.title, unitId: LESSONS.get(id).unitId, completed: r?.n || 0, avgScore: r?.avg_score ?? null };
    });
    res.json({
      totalUsers: c.total_users,
      activeNow: onlineUsers ? onlineUsers.size : 0,
      newUsersToday: c.new_today,
      newUsersThisWeek: c.new_week,
      activeThisWeek: c.active_week,
      usersWithEmail: c.with_email,
      totalTrades: c.total_trades,
      totalLessonsCompleted: c.total_lessons,
      examsPassed: c.exams_passed,
      xpToday: c.xp_today,
      topStrategies: topStrategies.rows,
      lessonFunnel,
      units: UNITS.map((u) => ({ id: u.id, title: u.title })),
      examRates: examRates.rows,
      recentRegistrations: recent.rows,
      signupsByDay: signups.rows,
      emailStats: emailStats.rows,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
router.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const search = String(req.query.search || '').trim().slice(0, 100);
    const params = [];
    let where = '';
    if (search) {
      params.push(`%${search.replace(/[%_\\]/g, '\\$&')}%`);
      where = 'WHERE u.username ILIKE $1 OR u.email ILIKE $1';
    }
    const total = (await query(`SELECT COUNT(*)::int AS n FROM users u ${where}`, params)).rows[0].n;
    const { rows } = await query(
      `SELECT u.id, u.username, u.email, u.email_verified AS "emailVerified", u.role, u.created_at AS "createdAt",
         u.last_login AS "lastLogin", u.is_active AS "isActive", u.xp, u.streak_current AS streak,
         (u.locked_until IS NOT NULL AND u.locked_until > NOW()) AS locked,
         (SELECT COUNT(*) FROM trades t JOIN portfolios p ON p.id = t.portfolio_id WHERE p.user_id = u.id)::int AS "tradesCount",
         (SELECT COUNT(*) FROM lesson_completions lc WHERE lc.user_id = u.id)::int AS "lessonsCompleted"
       FROM users u ${where}
       ORDER BY u.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    res.json({ users: rows, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: 'User not found' });
    const user = (await query(
      `SELECT id, username, email, email_verified AS "emailVerified", role, created_at AS "createdAt", last_login AS "lastLogin",
         is_active AS "isActive", xp, coins, streak_current AS streak, streak_best AS "streakBest", timezone,
         failed_login_count AS "failedLogins", locked_until AS "lockedUntil", email_opt_in AS "emailOptIn"
       FROM users WHERE id = $1`,
      [id]
    )).rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [portfolios, lessons, exams, trades, sessions, achievements] = await Promise.all([
      query(
        `SELECT p.id AS "portfolioId", p.portfolio_type AS "portfolioType", p.cash::float, p.starting_capital::float AS "startingCapital",
           COUNT(t.id)::int AS "totalTrades", COALESCE(SUM(t.realized_pnl),0)::float AS "realizedPnl",
           COUNT(t.id) FILTER (WHERE t.realized_pnl > 0)::int AS wins, COUNT(t.id) FILTER (WHERE t.realized_pnl IS NOT NULL)::int AS closed
         FROM portfolios p LEFT JOIN trades t ON t.portfolio_id = p.id WHERE p.user_id = $1 GROUP BY p.id`,
        [id]
      ),
      query('SELECT lesson_id, best_score, attempts, first_completed_at FROM lesson_completions WHERE user_id = $1 ORDER BY first_completed_at DESC', [id]),
      query('SELECT unit_id, best_score, passed, attempts FROM unit_exams WHERE user_id = $1', [id]),
      query(
        `SELECT t.symbol, t.action, t.quantity, t.price, t.realized_pnl, t.strategy, t.executed_at FROM trades t
         JOIN portfolios p ON p.id = t.portfolio_id WHERE p.user_id = $1 ORDER BY t.executed_at DESC LIMIT 20`,
        [id]
      ),
      query('SELECT COUNT(*)::int AS n FROM refresh_tokens WHERE user_id = $1 AND NOT revoked AND expires_at > NOW()', [id]),
      query('SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1', [id]),
    ]);
    res.json({
      user,
      portfolios: portfolios.rows.map((p) => ({ ...p, winRate: p.closed ? Math.round((p.wins / p.closed) * 1000) / 10 : 0 })),
      lessonProgress: lessons.rows.map((r) => ({ ...r, title: LESSONS.get(r.lesson_id)?.lesson.title || r.lesson_id })),
      exams: exams.rows,
      recentTrades: trades.rows,
      activeSessions: sessions.rows[0].n,
      achievements: achievements.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const targetId = parseId(req.params.id);
    if (!targetId) return res.status(404).json({ error: 'User not found' });
    const { role, isActive } = req.body || {};
    if (role === undefined && isActive === undefined) return res.status(400).json({ error: 'Provide role or isActive to update' });
    if (role === 'admin') {
      // Promotion is deliberately impossible from the web app. See services/adminAccess.js.
      await audit(req, targetId, 'blocked_promotion_attempt');
      return res.status(403).json({ error: 'Admins can only be added by the site owner (ADMIN_USER_IDS in the hosting settings).' });
    }
    if (role !== undefined && role !== 'user') return res.status(400).json({ error: 'role can only be set to user' });
    if (targetId === req.user.userId) {
      if (role === 'user') return res.status(400).json({ error: 'You cannot remove your own admin role' });
      if (isActive === false) return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }
    const sets = [];
    const params = [];
    if (role !== undefined) { params.push(role); sets.push(`role = $${params.length}`); }
    if (isActive !== undefined) { params.push(Boolean(isActive)); sets.push(`is_active = $${params.length}`); }
    params.push(targetId);
    const { rows } = await query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING id, username, role, is_active AS "isActive"`,
      params
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    // Deactivating or changing role ends their current sessions.
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [targetId]);
    await audit(req, targetId, 'update_user', { role, isActive });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/users/:id/unlock', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    await query('UPDATE users SET locked_until = NULL, failed_login_count = 0 WHERE id = $1', [id]);
    await audit(req, id, 'unlock_user');
    res.json({ message: 'Unlocked' });
  } catch (err) {
    next(err);
  }
});

router.post('/users/:id/revoke-sessions', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { rowCount } = await query('DELETE FROM refresh_tokens WHERE user_id = $1', [id]);
    await audit(req, id, 'revoke_sessions', { count: rowCount });
    res.json({ message: `Signed out of ${rowCount} session(s)` });
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: 'User not found' });
    if (id === req.user.userId) return res.status(400).json({ error: 'Delete your own account from Settings instead' });
    if (req.body?.confirmUsername == null) return res.status(400).json({ error: 'Type the username to confirm' });
    const u = (await query('SELECT username FROM users WHERE id = $1', [id])).rows[0];
    if (!u) return res.status(404).json({ error: 'User not found' });
    if (u.username !== req.body.confirmUsername) return res.status(400).json({ error: "Username doesn't match" });
    await withTransaction(async (db) => {
      await db.query(
        'INSERT INTO admin_audit_log (admin_user_id, target_user_id, action, details) VALUES ($1, NULL, $2, $3)',
        [req.user.userId, 'delete_user', JSON.stringify({ deletedUserId: id, username: u.username })]
      );
      await db.query('DELETE FROM users WHERE id = $1', [id]);
    });
    res.json({ message: `Deleted ${u.username}` });
  } catch (err) {
    next(err);
  }
});

router.get('/online', (req, res) => {
  const onlineUsers = req.app.get('onlineUsers');
  if (!onlineUsers) return res.json([]);
  res.json(Array.from(onlineUsers.entries()).map(([userId, info]) => ({
    userId, username: info.username, connectedAt: info.connectedAt, lastActivity: info.lastActivity, currentPage: info.currentPage,
  })));
});

router.get('/metrics/history', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM admin_metrics_snapshots WHERE snapshot_time >= NOW() - INTERVAL '30 days' ORDER BY snapshot_time ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/audit-log', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT l.id, l.action, l.details, l.created_at AS "createdAt", a.username AS admin, t.username AS target
       FROM admin_audit_log l LEFT JOIN users a ON a.id = l.admin_user_id LEFT JOIN users t ON t.id = l.target_user_id
       ORDER BY l.created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/emails', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT e.id, e.kind, e.status, e.error, e.created_at AS "createdAt", u.username
       FROM email_log e LEFT JOIN users u ON u.id = e.user_id ORDER BY e.created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Manually trigger an email job (handy for testing your Resend setup).
router.post('/emails/run/:job', async (req, res, next) => {
  try {
    const job = req.params.job;
    let sent;
    if (job === 'reminders') sent = await runStreakReminders();
    else if (job === 'digest') sent = await runWeeklyDigest();
    else return res.status(400).json({ error: 'Unknown job' });
    await audit(req, null, 'run_email_job', { job, sent });
    res.json({ message: `${job}: ${sent} email(s) queued` });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Data Explorer: read-only browsing of the database from the admin panel.
// Table and column names come ONLY from this whitelist + information_schema,
// never from the request, so there's no way to inject SQL through it.
// Secret columns are always redacted.
// ---------------------------------------------------------------------------
const EXPLORER_TABLES = [
  'users', 'portfolios', 'positions', 'trades', 'lesson_completions', 'unit_exams', 'xp_events',
  'user_achievements', 'user_analyses', 'user_sessions', 'refresh_tokens', 'email_log',
  'admin_audit_log', 'admin_metrics_snapshots', 'lesson_progress', 'schema_migrations',
];
const REDACT = new Set([
  'password_hash', 'token', 'email_verify_token', 'reset_password_token', 'recovery_code_hash', 'email_unsubscribe_token',
]);

async function tableColumns(table) {
  const { rows } = await query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
    [table]
  );
  return rows;
}

function quoteIdent(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

router.get('/db/tables', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT relname AS name, n_live_tup::int AS approx_rows FROM pg_stat_user_tables WHERE relname = ANY($1) ORDER BY relname`,
      [EXPLORER_TABLES]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

async function explorerQuery(req, { forExport = false } = {}) {
  const table = req.params.table;
  if (!EXPLORER_TABLES.includes(table)) return { error: 'Unknown table' };
  const cols = await tableColumns(table);
  if (!cols.length) return { error: 'Unknown table' };
  const names = cols.map((c) => c.column_name);

  const limit = forExport ? 10000 : Math.max(1, Math.min(200, parseInt(req.query.limit, 10) || 50));
  const page = forExport ? 1 : Math.max(1, parseInt(req.query.page, 10) || 1);
  const sort = names.includes(req.query.sort) ? req.query.sort : (names.includes('id') ? 'id' : names[0]);
  const dir = req.query.dir === 'asc' ? 'ASC' : 'DESC';
  const search = String(req.query.search || '').trim().slice(0, 100);

  const select = cols.map((c) => (REDACT.has(c.column_name)
    ? `CASE WHEN ${quoteIdent(c.column_name)} IS NULL THEN NULL ELSE '[redacted]' END AS ${quoteIdent(c.column_name)}`
    : quoteIdent(c.column_name))).join(', ');
  const searchable = cols.filter((c) => !REDACT.has(c.column_name) && /char|text|uuid/.test(c.data_type)).map((c) => c.column_name);
  const params = [];
  let where = '';
  if (search && searchable.length) {
    params.push(`%${search.replace(/[%_\\]/g, '\\$&')}%`);
    where = `WHERE ${searchable.map((c) => `${quoteIdent(c)}::text ILIKE $1`).join(' OR ')}`;
  }
  const total = (await query(`SELECT COUNT(*)::int AS n FROM ${quoteIdent(table)} ${where}`, params)).rows[0].n;
  const { rows } = await query(
    `SELECT ${select} FROM ${quoteIdent(table)} ${where} ORDER BY ${quoteIdent(sort)} ${dir} NULLS LAST
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, (page - 1) * limit]
  );
  return { table, columns: cols, rows, total, page, limit, sort, dir: dir.toLowerCase() };
}

router.get('/db/tables/:table', async (req, res, next) => {
  try {
    const out = await explorerQuery(req);
    if (out.error) return res.status(404).json(out);
    res.json(out);
  } catch (err) {
    next(err);
  }
});

function csvCell(v) {
  if (v == null) return '';
  let s = v instanceof Date ? v.toISOString() : typeof v === 'object' ? JSON.stringify(v) : String(v);
  // Neutralize spreadsheet formula injection (=, +, -, @ at the start of a cell).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

router.get('/db/tables/:table/export', async (req, res, next) => {
  try {
    const out = await explorerQuery(req, { forExport: true });
    if (out.error) return res.status(404).json(out);
    await audit(req, null, 'export_table', { table: out.table, rows: out.rows.length, search: req.query.search || null });
    const header = out.columns.map((c) => c.column_name);
    const lines = [header.join(','), ...out.rows.map((r) => header.map((h) => csvCell(r[h])).join(','))];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${out.table}-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(lines.join('\n'));
  } catch (err) {
    next(err);
  }
});

export default router;
