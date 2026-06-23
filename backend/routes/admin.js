import express from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = express.Router();
router.use(authenticate);
router.use(adminOnly);

router.get('/dashboard', async (req, res) => {
  try {
    const onlineUsers = req.app.get('onlineUsers');

    const totalUsersResult = await query('SELECT COUNT(*)::int AS count FROM users');
    const newTodayResult = await query(
      "SELECT COUNT(*)::int AS count FROM users WHERE created_at >= CURRENT_DATE"
    );
    const newWeekResult = await query(
      "SELECT COUNT(*)::int AS count FROM users WHERE created_at >= NOW() - INTERVAL '7 days'"
    );
    const totalTradesResult = await query('SELECT COUNT(*)::int AS count FROM trades');
    const totalLessonsResult = await query(
      'SELECT COUNT(*)::int AS count FROM lesson_progress WHERE completed = TRUE'
    );

    const topStrategiesResult = await query(`
      SELECT strategy, COUNT(*)::int AS count
      FROM trades
      WHERE strategy IS NOT NULL
      GROUP BY strategy
      ORDER BY count DESC
      LIMIT 5
    `);

    const lessonRatesResult = await query(`
      SELECT lesson_number, COUNT(*)::int AS completed_count
      FROM lesson_progress
      WHERE completed = TRUE
      GROUP BY lesson_number
      ORDER BY lesson_number
    `);
    const lessonRatesMap = new Map(lessonRatesResult.rows.map((r) => [r.lesson_number, r.completed_count]));
    const lessonCompletionRates = [];
    for (let i = 1; i <= 20; i++) {
      lessonCompletionRates.push({ lessonNumber: i, completedCount: lessonRatesMap.get(i) || 0 });
    }

    const recentRegResult = await query(`
      SELECT username, email, created_at AS "createdAt"
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      totalUsers: totalUsersResult.rows[0].count,
      activeNow: onlineUsers ? onlineUsers.size : 0,
      newUsersToday: newTodayResult.rows[0].count,
      newUsersThisWeek: newWeekResult.rows[0].count,
      totalTrades: totalTradesResult.rows[0].count,
      totalLessonsCompleted: totalLessonsResult.rows[0].count,
      topStrategies: topStrategiesResult.rows,
      lessonCompletionRates,
      recentRegistrations: recentRegResult.rows,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    let whereClause = '';
    const params = [];
    if (search) {
      whereClause = 'WHERE u.username ILIKE $1 OR u.email ILIKE $1';
      params.push(`%${search}%`);
    }

    const countResult = await query(`SELECT COUNT(*)::int AS count FROM users u ${whereClause}`, params);

    const usersResult = await query(
      `
      SELECT
        u.id, u.username, u.email, u.role, u.created_at AS "createdAt",
        u.last_login AS "lastLogin", u.is_active AS "isActive",
        (SELECT COUNT(*) FROM trades t JOIN portfolios p ON p.id = t.portfolio_id WHERE p.user_id = u.id)::int AS "tradesCount",
        (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.completed = TRUE)::int AS "lessonsCompleted"
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, limit, offset]
    );

    res.json({
      users: usersResult.rows,
      page,
      limit,
      total: countResult.rows[0].count,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (err) {
    console.error('Admin users list error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const userResult = await query(
      `SELECT id, username, email, role, created_at AS "createdAt", last_login AS "lastLogin", is_active AS "isActive"
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const portfoliosResult = await query('SELECT * FROM portfolios WHERE user_id = $1', [req.params.id]);

    const portfolioStats = [];
    for (const p of portfoliosResult.rows) {
      const tradesResult = await query(
        'SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE realized_pnl > 0)::int AS wins, COUNT(*) FILTER (WHERE realized_pnl IS NOT NULL)::int AS closed, COALESCE(SUM(realized_pnl), 0)::float AS realized FROM trades WHERE portfolio_id = $1',
        [p.id]
      );
      const t = tradesResult.rows[0];
      portfolioStats.push({
        portfolioId: p.id,
        portfolioType: p.portfolio_type,
        cash: Number(p.cash),
        startingCapital: Number(p.starting_capital),
        equity: Number(p.cash),
        realizedPnl: t.realized,
        winRate: t.closed > 0 ? Math.round((t.wins / t.closed) * 10000) / 100 : 0,
        totalTrades: t.total,
      });
    }

    const lessonResult = await query(
      'SELECT lesson_number, completed, completed_at, quiz_score FROM lesson_progress WHERE user_id = $1 ORDER BY lesson_number',
      [req.params.id]
    );

    const tradeHistoryResult = await query(
      `SELECT t.* FROM trades t
       JOIN portfolios p ON p.id = t.portfolio_id
       WHERE p.user_id = $1
       ORDER BY t.executed_at DESC
       LIMIT 20`,
      [req.params.id]
    );

    res.json({
      user,
      portfolios: portfolioStats,
      lessonProgress: lessonResult.rows,
      recentTrades: tradeHistoryResult.rows,
    });
  } catch (err) {
    console.error('Admin user detail error:', err);
    res.status(500).json({ error: 'Failed to fetch user detail' });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { role, isActive } = req.body || {};
    if (role === undefined && isActive === undefined) {
      return res.status(400).json({ error: 'Provide role or isActive to update' });
    }
    if (role !== undefined && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'role must be user or admin' });
    }

    const fields = [];
    const params = [];
    let idx = 1;
    if (role !== undefined) {
      fields.push(`role = $${idx++}`);
      params.push(role);
    }
    if (isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      params.push(Boolean(isActive));
    }
    params.push(req.params.id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, username, email, role, is_active AS "isActive"`,
      params
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.get('/online', (req, res) => {
  const onlineUsers = req.app.get('onlineUsers');
  if (!onlineUsers) return res.json([]);

  const list = Array.from(onlineUsers.entries()).map(([userId, info]) => ({
    userId,
    username: info.username,
    connectedAt: info.connectedAt,
    lastActivity: info.lastActivity,
    currentPage: info.currentPage,
  }));
  res.json(list);
});

router.get('/metrics/history', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM admin_metrics_snapshots WHERE snapshot_time >= NOW() - INTERVAL '30 days' ORDER BY snapshot_time ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Admin metrics history error:', err);
    res.status(500).json({ error: 'Failed to fetch metrics history' });
  }
});

export default router;
