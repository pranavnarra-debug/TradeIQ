import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

import { query } from './db/pool.js';
import authRoutes from './routes/auth.js';
import marketRoutes from './routes/market.js';
import portfolioRoutes from './routes/portfolio.js';
import lessonsRoutes from './routes/lessons.js';
import adminRoutes from './routes/admin.js';
import { startMarketCacheJobs } from './jobs/marketCache.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// --- Security & core middleware ---
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// --- Rate limiting on auth routes ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/auth', authLimiter);

// --- Mount API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// --- Serve frontend static files ---
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- Generic error handler (catches anything that slips past route-level try/catch) ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// =========================================================
// Socket.io real-time layer
// =========================================================
const io = new SocketIOServer(server, {
  cors: { origin: FRONTEND_URL, credentials: true },
});

// In-memory online users map: userId -> { username, socketId, connectedAt, lastActivity, currentPage }
const onlineUsers = new Map();
app.set('onlineUsers', onlineUsers);
app.set('io', io);

function broadcastOnlineCount() {
  io.to('admins').emit('online_count', onlineUsers.size);
}

function broadcastAdminOnlineUsers() {
  const list = Array.from(onlineUsers.entries()).map(([userId, info]) => ({
    userId,
    username: info.username,
    connectedAt: info.connectedAt,
    lastActivity: info.lastActivity,
    currentPage: info.currentPage,
  }));
  io.to('admins').emit('admin_online_users', list);
}

async function buildAdminStatsPayload() {
  const totalUsersResult = await query('SELECT COUNT(*)::int AS count FROM users');
  const newTodayResult = await query("SELECT COUNT(*)::int AS count FROM users WHERE created_at >= CURRENT_DATE");
  const newWeekResult = await query("SELECT COUNT(*)::int AS count FROM users WHERE created_at >= NOW() - INTERVAL '7 days'");
  const totalTradesResult = await query('SELECT COUNT(*)::int AS count FROM trades');
  const totalLessonsResult = await query('SELECT COUNT(*)::int AS count FROM lesson_progress WHERE completed = TRUE');
  const topStrategiesResult = await query(`
    SELECT strategy, COUNT(*)::int AS count FROM trades
    WHERE strategy IS NOT NULL GROUP BY strategy ORDER BY count DESC LIMIT 5
  `);
  const recentRegResult = await query(`
    SELECT username, email, created_at AS "createdAt" FROM users ORDER BY created_at DESC LIMIT 10
  `);

  return {
    totalUsers: totalUsersResult.rows[0].count,
    activeNow: onlineUsers.size,
    newUsersToday: newTodayResult.rows[0].count,
    newUsersThisWeek: newWeekResult.rows[0].count,
    totalTrades: totalTradesResult.rows[0].count,
    totalLessonsCompleted: totalLessonsResult.rows[0].count,
    topStrategies: topStrategiesResult.rows,
    recentRegistrations: recentRegResult.rows,
  };
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.user = { userId: payload.userId, username: payload.username, role: payload.role };
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
});

io.on('connection', async (socket) => {
  const { userId, username, role } = socket.user;

  if (role === 'admin') {
    socket.join('admins');
  }
  socket.join('users');

  onlineUsers.set(userId, {
    username,
    socketId: socket.id,
    connectedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    currentPage: 'ai-trader',
  });

  try {
    await query(
      `INSERT INTO user_sessions (user_id, socket_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [userId, socket.id, socket.handshake.address, socket.handshake.headers['user-agent'] || null]
    );
  } catch (err) {
    console.error('Failed to log session:', err.message);
  }

  broadcastOnlineCount();
  broadcastAdminOnlineUsers();

  socket.on('page_change', (section) => {
    const info = onlineUsers.get(userId);
    if (info) {
      info.currentPage = section;
      info.lastActivity = new Date().toISOString();
      onlineUsers.set(userId, info);
      broadcastAdminOnlineUsers();
    }
  });

  socket.on('disconnect', async () => {
    onlineUsers.delete(userId);
    try {
      await query(
        `UPDATE user_sessions SET disconnected_at = NOW() WHERE socket_id = $1`,
        [socket.id]
      );
    } catch (err) {
      console.error('Failed to update session on disconnect:', err.message);
    }
    broadcastOnlineCount();
    broadcastAdminOnlineUsers();
  });
});

// Emit admin_stats every 30 seconds to the admins room
setInterval(async () => {
  if (io.sockets.adapter.rooms.get('admins')?.size > 0) {
    try {
      const payload = await buildAdminStatsPayload();
      io.to('admins').emit('admin_stats', payload);
    } catch (err) {
      console.error('Failed to broadcast admin stats:', err.message);
    }
  }
}, 30000);

// --- Start scheduled jobs ---
startMarketCacheJobs();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`TradeIQ backend listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

export default app;
