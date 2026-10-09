import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config.js';
import { query } from './db/pool.js';
import { verifyAccessToken } from './services/tokens.js';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';
import marketRoutes from './routes/market.js';
import portfolioRoutes from './routes/portfolio.js';
import lessonsRoutes from './routes/lessons.js';
import adminRoutes from './routes/admin.js';
import emailRoutes from './routes/email.js';
import { startMarketCacheJobs } from './jobs/marketCache.js';
import { startDataRetentionJobs } from './jobs/dataRetention.js';
import { startEmailJobs } from './jobs/emailJobs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

// Railway (and most PaaS hosts) terminate TLS at a proxy. Trust exactly one hop
// so req.ip is the real client (for rate limits) without letting clients spoof it.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// --- Security headers ---
// The CSP only allows scripts from our own origin. Everything the frontend
// needs (Chart.js, fonts, socket.io client) is served locally from npm
// packages, so no third-party CDN can inject code and no visitor IPs leak to
// font CDNs.
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'font-src': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'upgrade-insecure-requests': config.isProd ? [] : null,
    },
  },
  hsts: config.isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false,
}));
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

// The frontend is served from this same origin, so CORS is only needed if you
// deliberately host the UI elsewhere (set CORS_ORIGIN for that).
if (process.env.CORS_ORIGIN) app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// --- Rate limiting ---
const limiter = (windowMin, max, message, keyGenerator) => rateLimit({
  windowMs: windowMin * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: message },
  ...(keyGenerator ? { keyGenerator } : {}),
});

const ipKey = (req) => rateLimit.ipKeyGenerator ? rateLimit.ipKeyGenerator(req.ip) : req.ip;
// Per IP+username, so one attacker can't burn through guesses on one account
// and a busy school network doesn't lock everyone out at once.
const credentialLimiter = limiter(15, config.isProd ? 10 : 500, 'Too many attempts. Wait a few minutes and try again.',
  (req) => `${ipKey(req)}:${String(req.body?.username || '').toLowerCase().slice(0, 40)}`);
const signupLimiter = limiter(60, config.isProd ? 8 : 200, 'Too many accounts created from this network. Try again later.');
const authLimiter = limiter(15, config.isProd ? 120 : 2000, 'Too many requests, please try again later.');
const apiLimiter = limiter(1, 300, 'Slow down a little.');

app.use('/api/auth/login', credentialLimiter);
app.use('/api/auth/recover', credentialLimiter);
app.use('/api/auth/forgot-password', credentialLimiter);
app.use('/api/auth/reset-password', credentialLimiter);
app.use('/api/auth/register', signupLimiter);
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', time: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'db-unavailable' });
  }
});

// Public, non-secret site settings used by the legal pages and footer.
app.get('/api/site', (req, res) => {
  res.json({ ...config.site, termsVersion: config.termsVersion });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// --- Static files ---
const frontendPath = path.join(__dirname, '..', 'frontend');
const nm = path.join(__dirname, 'node_modules');
const staticOpts = { maxAge: config.isProd ? '7d' : 0, immutable: false };
app.use('/vendor/chart.umd.min.js', (req, res) => res.sendFile(path.join(nm, 'chart.js', 'dist', 'chart.umd.min.js')));
app.use('/vendor/fonts/bricolage', express.static(path.join(nm, '@fontsource-variable', 'bricolage-grotesque'), staticOpts));
app.use('/vendor/fonts/silkscreen', express.static(path.join(nm, '@fontsource', 'silkscreen'), staticOpts));
app.use('/vendor/fonts/jetbrains', express.static(path.join(nm, '@fontsource', 'jetbrains-mono'), staticOpts));

app.get('/.well-known/security.txt', (req, res) => {
  res.type('text/plain').send(`Contact: mailto:${config.site.contactEmail}\nPreferred-Languages: en\nPolicy: ${config.appUrl}/terms\n`);
});

app.use(express.static(frontendPath, { maxAge: config.isProd ? '1h' : 0, index: false }));
// Client-side routes (/learn, /lesson/x, /terms...) all get the app shell.
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- Error handler: log details server-side, never leak them to clients ---
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on our end' });
});

// =========================================================
// Socket.io: live "who's online" for the admin dashboard
// =========================================================
const io = new SocketIOServer(server, {
  cors: process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN, credentials: true } : undefined,
  maxHttpBufferSize: 10_000,
});

const onlineUsers = new Map();
app.set('onlineUsers', onlineUsers);
app.set('io', io);

function adminOnlineList() {
  return Array.from(onlineUsers.entries()).map(([userId, info]) => ({
    userId, username: info.username, connectedAt: info.connectedAt, lastActivity: info.lastActivity, currentPage: info.currentPage,
  }));
}
function broadcastPresence() {
  io.to('admins').emit('online_count', onlineUsers.size);
  io.to('admins').emit('admin_online_users', adminOnlineList());
}

io.use(async (socket, next) => {
  try {
    const payload = verifyAccessToken(socket.handshake.auth?.token);
    // Role comes from the database, not the token, before joining the admin room.
    const { rows } = await query('SELECT role, is_active FROM users WHERE id = $1', [payload.userId]);
    if (!rows[0]?.is_active) return next(new Error('Account not available'));
    socket.user = { userId: payload.userId, username: payload.username, role: rows[0].role };
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

const PAGE_RE = /^[a-z0-9-]{1,40}$/;
io.on('connection', async (socket) => {
  const { userId, username, role } = socket.user;
  if (role === 'admin') socket.join('admins');

  const now = new Date().toISOString();
  onlineUsers.set(userId, { username, socketId: socket.id, connectedAt: now, lastActivity: now, currentPage: 'learn' });

  try {
    await query(
      'INSERT INTO user_sessions (user_id, socket_id, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
      [userId, socket.id, socket.handshake.address, (socket.handshake.headers['user-agent'] || '').slice(0, 120) || null]
    );
  } catch (err) {
    console.error('Failed to log session:', err.message);
  }
  broadcastPresence();

  socket.on('page_change', (section) => {
    const info = onlineUsers.get(userId);
    if (info && typeof section === 'string' && PAGE_RE.test(section)) {
      info.currentPage = section;
      info.lastActivity = new Date().toISOString();
      broadcastPresence();
    }
  });

  socket.on('disconnect', async () => {
    if (onlineUsers.get(userId)?.socketId === socket.id) onlineUsers.delete(userId);
    try {
      await query('UPDATE user_sessions SET disconnected_at = NOW() WHERE socket_id = $1', [socket.id]);
    } catch (err) {
      console.error('Failed to update session on disconnect:', err.message);
    }
    broadcastPresence();
  });
});

// --- Start ---
startMarketCacheJobs();
startDataRetentionJobs();
startEmailJobs();

server.listen(config.port, () => {
  console.log(`TradeIQ listening on ${config.appUrl} (port ${config.port}, ${config.isProd ? 'production' : 'development'})`);
  if (!config.email.resendApiKey) console.log('[email] RESEND_API_KEY not set: emails will be printed to this console instead of sent.');
});

export default app;
