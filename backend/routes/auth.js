import express from 'express';
import bcrypt from 'bcrypt';
import { query, withTransaction } from '../db/pool.js';
import { config } from '../config.js';
import {
  sha256, randomToken, recoveryCode, normalizeRecoveryCode, signAccessToken, safeEqual,
} from '../services/tokens.js';
import { usernameProblem, passwordProblem, emailProblem, normalizeEmail, isValidTimezone } from '../services/validate.js';
import { sendVerifyEmail, sendPasswordResetEmail, sendSecurityNotice, sendWelcomeEmail } from '../services/emailService.js';
import { levelFor, checkAchievementsSafe } from '../services/progress.js';
import { isAdminRow } from '../services/adminAccess.js';

const router = express.Router();

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 6;
const LOCKOUT_MINUTES = 15;
const REFRESH_COOKIE = 'tiq_rt';
const ROTATION_GRACE_MS = 20 * 1000;
// Compared against when a username doesn't exist, so "no such user" takes the
// same time as "wrong password" and can't be told apart by timing.
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer-not-a-real-password', BCRYPT_ROUNDS);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

export function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    role: isAdminRow(u) ? 'admin' : 'user',
    email: u.email || null,
    emailVerified: Boolean(u.email && u.email_verified),
    emailOptIn: Boolean(u.email_opt_in),
    avatar: u.avatar || 'chip',
    ownedAvatars: u.owned_avatars || ['chip', 'penny'],
    timezone: u.timezone || 'America/New_York',
    showOnLeaderboard: u.show_on_leaderboard !== false,
    xp: u.xp || 0,
    coins: u.coins || 0,
    streak: u.streak_current || 0,
    streakBest: u.streak_best || 0,
    streakLastDay: u.streak_last_day || null,
    streakFreezes: u.streak_freezes || 0,
    level: levelFor(u.xp || 0),
    createdAt: u.created_at,
  };
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: config.refreshTtlDays * 24 * 60 * 60 * 1000,
  };
}

function clearRefreshCookie(res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(REFRESH_COOKIE, opts);
}

/**
 * Cookie-authenticated endpoints must come from our own pages. SameSite=Strict
 * already stops cross-site requests from carrying the cookie; this Origin check
 * is a second, independent layer against CSRF.
 */
function sameOrigin(req, res, next) {
  const origin = req.get('origin');
  if (!origin) return next(); // same-origin GET/navigations may omit it
  try {
    const o = new URL(origin);
    const allowed = new Set([req.get('host'), new URL(config.appUrl).host]);
    if (allowed.has(o.host)) return next();
  } catch {
    // fall through
  }
  return res.status(403).json({ error: 'Cross-site request blocked' });
}

async function issueSession(res, user, req, db = { query }, familyId = null) {
  const token = randomToken(48);
  const expiresAt = new Date(Date.now() + config.refreshTtlDays * 24 * 60 * 60 * 1000);
  const ua = (req.get('user-agent') || '').slice(0, 120) || null;
  if (familyId) {
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, family_id, expires_at, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [user.id, sha256(token), familyId, expiresAt, ua]
    );
  } else {
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at, user_agent) VALUES ($1, $2, $3, $4)',
      [user.id, sha256(token), expiresAt, ua]
    );
  }
  res.cookie(REFRESH_COOKIE, token, cookieOptions());
  return signAccessToken(user);
}

export async function revokeAllSessions(userId, db = { query }) {
  await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

async function recordFailedLogin(user) {
  const newCount = (user.failed_login_count || 0) + 1;
  const lock = newCount >= MAX_FAILED_ATTEMPTS;
  await query(
    'UPDATE users SET failed_login_count = $1, last_failed_login_at = NOW(), locked_until = $2 WHERE id = $3',
    [lock ? 0 : newCount, lock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null, user.id]
  );
  return lock;
}

function lockedMessage(user) {
  if (!user.locked_until || new Date(user.locked_until) <= new Date()) return null;
  const mins = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
  return `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`;
}

export async function startEmailVerification(user, email) {
  const token = randomToken(32);
  await query(
    `UPDATE users SET email = $1, email_verified = FALSE, email_verify_token = $2,
       email_verify_expires = NOW() + INTERVAL '24 hours' WHERE id = $3`,
    [email, sha256(token), user.id]
  );
  sendVerifyEmail(user, email, token).catch(() => {});
}

// ---------------------------------------------------------------------------
// routes
// ---------------------------------------------------------------------------

// GET /api/auth/check-username?username=foo
router.get('/check-username', async (req, res, next) => {
  try {
    const { username } = req.query;
    const problem = usernameProblem(username);
    if (problem) return res.json({ available: false, reason: problem });
    const { rows } = await query('SELECT 1 FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    res.json({ available: rows.length === 0, reason: rows.length ? 'Taken' : null });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, email, acceptTerms, confirmAge, emailOptIn, timezone, website } = req.body || {};

    // Honeypot: a field real users never see. Bots fill every input.
    if (website) return res.status(400).json({ error: 'Registration failed' });

    const uProblem = usernameProblem(username);
    if (uProblem) return res.status(400).json({ error: uProblem, field: 'username' });
    const pProblem = passwordProblem(password, username);
    if (pProblem) return res.status(400).json({ error: pProblem, field: 'password' });
    let cleanEmail = null;
    if (email != null && String(email).trim() !== '') {
      cleanEmail = normalizeEmail(email);
      const eProblem = emailProblem(cleanEmail);
      if (eProblem) return res.status(400).json({ error: eProblem, field: 'email' });
    }
    if (acceptTerms !== true) return res.status(400).json({ error: 'Please accept the Terms and Privacy Policy', field: 'acceptTerms' });
    if (confirmAge !== true) return res.status(400).json({ error: 'You must be at least 13 to use TradeIQ', field: 'confirmAge' });

    const taken = await query(
      'SELECT LOWER(username) = LOWER($1) AS name_taken FROM users WHERE LOWER(username) = LOWER($1) OR (email IS NOT NULL AND LOWER(email) = LOWER($2))',
      [username, cleanEmail || '']
    );
    if (taken.rows.some((r) => r.name_taken)) return res.status(409).json({ error: 'That username is taken', field: 'username' });
    // An email already on another account is dropped silently rather than
    // rejected, so signup can't be used to discover who uses which address.
    if (taken.rows.length) cleanEmail = null;

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const code = recoveryCode();
    const codeHash = await bcrypt.hash(normalizeRecoveryCode(code), 10);

    let user;
    let accessToken;
    await withTransaction(async (db) => {
      const ins = await db.query(
        `INSERT INTO users (username, email, password_hash, role, email_verified, recovery_code_hash,
           terms_accepted_at, terms_version, age_confirmed, email_unsubscribe_token, email_opt_in, timezone)
         VALUES ($1, NULL, $2, 'user', FALSE, $3, NOW(), $4, TRUE, $5, $6, $7)
         RETURNING *`,
        [username, passwordHash, codeHash, config.termsVersion, randomToken(24), Boolean(cleanEmail && emailOptIn === true),
          isValidTimezone(timezone) ? timezone : 'America/New_York']
      );
      user = ins.rows[0];
      await db.query(
        `INSERT INTO portfolios (user_id, portfolio_type, name, starting_capital, cash)
         VALUES ($1, 'manual', 'My Trading Desk', 50000, 50000), ($1, 'ai', 'Bolt the Bot', 100000, 100000)`,
        [user.id]
      );
      accessToken = await issueSession(res, user, req, db);
    });

    if (cleanEmail) {
      await startEmailVerification(user, cleanEmail).catch((e) => console.error('verify email start failed', e.message));
      user.email = cleanEmail;
    }

    res.status(201).json({ accessToken, user: publicUser(user), recoveryCode: code });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'That username is taken', field: 'username' });
    next(err);
  }
});

// POST /api/auth/login  { username, password }   (username may also be a verified email)
router.post('/login', async (req, res, next) => {
  try {
    const identifier = String(req.body?.username || '').trim();
    const password = req.body?.password;
    if (!identifier || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const { rows } = await query(
      `SELECT * FROM users WHERE LOWER(username) = LOWER($1)
         OR (email_verified AND email IS NOT NULL AND LOWER(email) = LOWER($1))
       ORDER BY (LOWER(username) = LOWER($1)) DESC LIMIT 1`,
      [identifier]
    );
    const user = rows[0];
    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    const locked = lockedMessage(user);
    if (locked) return res.status(429).json({ error: locked });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const nowLocked = await recordFailedLogin(user);
      if (nowLocked) return res.status(429).json({ error: `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.` });
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'This account has been deactivated. Contact support for help.' });
    }

    await query('UPDATE users SET last_login = NOW(), failed_login_count = 0, locked_until = NULL WHERE id = $1', [user.id]);
    const accessToken = await issueSession(res, user, req);
    res.json({ accessToken, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh   (refresh token comes from the httpOnly cookie)
router.post('/refresh', sameOrigin, async (req, res, next) => {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) return res.status(204).end();

    const { rows } = await query(
      `SELECT rt.*, u.username, u.role, u.is_active FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id WHERE rt.token = $1`,
      [sha256(raw)]
    );
    const row = rows[0];
    if (!row) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'NO_SESSION' });
    }

    if (row.revoked) {
      const recentlyRotated = row.rotated_at && Date.now() - new Date(row.rotated_at).getTime() < ROTATION_GRACE_MS;
      if (!recentlyRotated) {
        // A token that was rotated out long ago is being replayed: assume it
        // was stolen and kill the whole session chain.
        await query('DELETE FROM refresh_tokens WHERE family_id = $1', [row.family_id]);
        clearRefreshCookie(res);
        return res.status(401).json({ error: 'This session is no longer valid. Please log in again.', code: 'NO_SESSION' });
      }
      // Two tabs refreshed at the same moment. Hand this one its own fresh token in the same family.
    }

    if (new Date(row.expires_at) < new Date() || !row.is_active) {
      await query('DELETE FROM refresh_tokens WHERE id = $1', [row.id]);
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'NO_SESSION' });
    }

    if (!row.revoked) {
      await query('UPDATE refresh_tokens SET revoked = TRUE, rotated_at = NOW() WHERE id = $1', [row.id]);
    }
    const userRow = (await query('SELECT * FROM users WHERE id = $1', [row.user_id])).rows[0];
    const accessToken = await issueSession(res, userRow, req, { query }, row.family_id);
    res.json({ accessToken, user: publicUser(userRow) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', sameOrigin, async (req, res, next) => {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (raw) {
      const { rows } = await query('SELECT family_id FROM refresh_tokens WHERE token = $1', [sha256(raw)]);
      if (rows[0]) await query('DELETE FROM refresh_tokens WHERE family_id = $1', [rows[0].family_id]);
    }
    clearRefreshCookie(res);
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/verify-email?token=...   (link from the email)
router.get('/verify-email', async (req, res) => {
  try {
    const token = String(req.query.token || '');
    if (!/^[0-9a-f]{64}$/.test(token)) return res.redirect('/?notice=email-invalid');
    const { rows } = await query(
      `UPDATE users SET email_verified = TRUE, email_verify_token = NULL, email_verify_expires = NULL
       WHERE email_verify_token = $1 AND email_verify_expires > NOW() AND email IS NOT NULL
       RETURNING *`,
      [sha256(token)]
    );
    if (!rows[0]) return res.redirect('/?notice=email-invalid');
    const user = rows[0];
    checkAchievementsSafe(user.id);
    sendWelcomeEmail(user, user.email).catch(() => {});
    res.redirect('/?notice=email-verified');
  } catch (err) {
    console.error('verify-email error:', err.message);
    res.redirect('/?notice=email-invalid');
  }
});

// POST /api/auth/forgot-password  { username }  (username or verified email)
router.post('/forgot-password', async (req, res, next) => {
  try {
    const identifier = String(req.body?.username || '').trim();
    const generic = {
      message: "If that account has a confirmed email, a reset link is on its way. No email on the account? Use your recovery code instead.",
    };
    if (!identifier) return res.json(generic);

    const { rows } = await query(
      `SELECT * FROM users WHERE (LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1))
         AND email IS NOT NULL AND email_verified AND is_active LIMIT 1`,
      [identifier]
    );
    const user = rows[0];
    if (user) {
      const token = randomToken(32);
      await query(
        `UPDATE users SET reset_password_token = $1, reset_password_expires = NOW() + INTERVAL '1 hour' WHERE id = $2`,
        [sha256(token), user.id]
      );
      sendPasswordResetEmail(user, user.email, token).catch(() => {});
    }
    // Same answer either way so this can't be used to probe for accounts.
    res.json(generic);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password  { token, password }
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) {
      return res.status(400).json({ error: 'Reset link is invalid or has expired' });
    }
    const { rows } = await query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [sha256(token)]
    );
    const user = rows[0];
    if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired' });
    const problem = passwordProblem(password, user.username);
    if (problem) return res.status(400).json({ error: problem, field: 'password' });

    await query(
      `UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL,
         failed_login_count = 0, locked_until = NULL WHERE id = $2`,
      [await bcrypt.hash(password, BCRYPT_ROUNDS), user.id]
    );
    await revokeAllSessions(user.id);
    sendSecurityNotice(user, user.email, 'Your password was reset').catch(() => {});
    res.json({ message: 'Password updated. Log in with your new password.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/recover  { username, recoveryCode, password }
// For accounts without email: the one-time code shown at signup resets the password.
router.post('/recover', async (req, res, next) => {
  try {
    const { username, recoveryCode: code, password } = req.body || {};
    const fail = () => res.status(400).json({ error: "That username and recovery code don't match" });
    if (typeof username !== 'string' || typeof code !== 'string') return fail();

    const { rows } = await query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username.trim()]);
    const user = rows[0];
    if (!user || !user.recovery_code_hash) {
      await bcrypt.compare('x', DUMMY_HASH);
      return fail();
    }
    const locked = lockedMessage(user);
    if (locked) return res.status(429).json({ error: locked });

    const ok = await bcrypt.compare(normalizeRecoveryCode(code), user.recovery_code_hash);
    if (!ok) {
      await recordFailedLogin(user);
      return fail();
    }
    const problem = passwordProblem(password, user.username);
    if (problem) return res.status(400).json({ error: problem, field: 'password' });

    // Codes are single-use: issue a fresh one.
    const newCode = recoveryCode();
    await query(
      `UPDATE users SET password_hash = $1, recovery_code_hash = $2, failed_login_count = 0, locked_until = NULL WHERE id = $3`,
      [await bcrypt.hash(password, BCRYPT_ROUNDS), await bcrypt.hash(normalizeRecoveryCode(newCode), 10), user.id]
    );
    await revokeAllSessions(user.id);
    if (user.email && user.email_verified) sendSecurityNotice(user, user.email, 'Your password was reset with a recovery code').catch(() => {});
    res.json({ message: 'Password updated. Save your NEW recovery code, the old one no longer works.', recoveryCode: newCode });
  } catch (err) {
    next(err);
  }
});

// Exported for routes/me.js
export { issueSession, clearRefreshCookie, BCRYPT_ROUNDS, safeEqual };
export default router;
