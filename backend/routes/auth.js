import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

const router = express.Router();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

const MAX_FAILED_ATTEMPTS = 6;
const LOCKOUT_MINUTES = 15;

/**
 * Revokes every refresh token for a user, forcing logout on all other devices/sessions.
 * Used after a password change/reset, since a stolen old session shouldn't survive
 * the user taking the corrective action of changing their password.
 */
async function revokeAllSessionsForUser(userId) {
  await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || !USERNAME_RE.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters, alphanumeric and underscores only' });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    if (!validPassword(password)) {
      return res.status(400).json({ error: 'Password must be 8+ characters with at least 1 uppercase letter and 1 number' });
    }

    const existing = await query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase() ? 'admin' : 'user';
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const insertResult = await query(
      `INSERT INTO users (username, email, password_hash, role, email_verify_token)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [username, email, passwordHash, role, verifyToken]
    );
    const userId = insertResult.rows[0].id;

    await query(
      `INSERT INTO portfolios (user_id, portfolio_type, name, starting_capital, cash)
       VALUES ($1, 'manual', 'My Trading Desk', 50000.00, 50000.00)`,
      [userId]
    );
    await query(
      `INSERT INTO portfolios (user_id, portfolio_type, name, starting_capital, cash)
       VALUES ($1, 'ai', 'AI Trader', 100000.00, 100000.00)`,
      [userId]
    );

    try {
      await sendVerificationEmail(email, verifyToken);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message);
    }

    res.status(201).json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// GET /api/auth/check-username?username=foo
router.get('/check-username', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || !USERNAME_RE.test(username)) {
      return res.json({ available: false, reason: 'Invalid format' });
    }
    const result = await query('SELECT id FROM users WHERE username = $1', [username]);
    res.json({ available: result.rows.length === 0 });
  } catch (err) {
    console.error('Check username error:', err);
    res.status(500).json({ error: 'Failed to check username' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      // Same generic message as a wrong password, so this endpoint doesn't reveal
      // whether an email is registered.
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Account lockout check — runs before the password comparison so a locked
    // account doesn't leak timing/behavior differences based on password correctness.
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      return res.status(429).json({ error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.` });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      const newCount = (user.failed_login_count || 0) + 1;
      const shouldLock = newCount >= MAX_FAILED_ATTEMPTS;
      await query(
        `UPDATE users SET failed_login_count = $1, last_failed_login_at = NOW(),
         locked_until = $2 WHERE id = $3`,
        [newCount, shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null, user.id]
      );
      if (shouldLock) {
        return res.status(429).json({ error: `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.` });
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'This account has been deactivated. Contact support for help.' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in. Check your inbox for the verification link.' });
    }

    // Successful login: clear any failed-attempt counter/lock from past tries.
    await query(
      'UPDATE users SET last_login = NOW(), failed_login_count = 0, locked_until = NULL WHERE id = $1',
      [user.id]
    );

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // New login = new family. Every token produced by rotating this one (via /refresh)
    // shares this family_id, which is what lets us revoke the whole chain on reuse.
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const result = await query(
      'SELECT rt.*, u.username, u.role FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token = $1',
      [refreshToken]
    );
    const tokenRow = result.rows[0];
    if (!tokenRow) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Reuse detection: this exact token was already rotated out once before.
    // A legitimate client would have moved on to its replacement token and
    // never present this one again — so seeing it now means it was almost
    // certainly copied/stolen and is being replayed by someone else. Revoke
    // every token in the family so both the thief and the legitimate user are
    // logged out, forcing a fresh login (and the legitimate user will notice).
    if (tokenRow.revoked) {
      await query('DELETE FROM refresh_tokens WHERE family_id = $1', [tokenRow.family_id]);
      return res.status(401).json({ error: 'This session is no longer valid. Please log in again.' });
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      await query('DELETE FROM refresh_tokens WHERE id = $1', [tokenRow.id]);
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    const newAccessToken = jwt.sign(
      { userId: tokenRow.user_id, username: tokenRow.username, role: tokenRow.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = generateRefreshToken();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Mark the old token revoked (rather than deleting it) so a later replay
    // attempt can be detected and matched back to this family.
    await query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [tokenRow.id]);
    await query(
      'INSERT INTO refresh_tokens (user_id, token, family_id, expires_at) VALUES ($1, $2, $3, $4)',
      [tokenRow.user_id, newRefreshToken, tokenRow.family_id, newExpiresAt]
    );

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (refreshToken) {
      await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Failed to log out' });
  }
});

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const result = await query('SELECT id FROM users WHERE email_verify_token = $1', [token]);
    const user = result.rows[0];

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/?verified=false`);
    }

    await query(
      'UPDATE users SET email_verified = TRUE, email_verify_token = NULL WHERE id = $1',
      [user.id]
    );

    res.redirect(`${process.env.FRONTEND_URL}/?verified=true`);
  } catch (err) {
    console.error('Verify email error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/?verified=false`);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await query('SELECT id FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await query(
        'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
        [resetToken, expires, user.id]
      );
      try {
        await sendPasswordResetEmail(email, resetToken);
      } catch (emailErr) {
        console.error('Failed to send reset email:', emailErr.message);
      }
    }

    // Always return the same message, whether or not the email exists, to avoid leaking account existence.
    res.json({ message: 'If that email exists, a reset link was sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !validPassword(password)) {
      return res.status(400).json({ error: 'Valid token and a password (8+ chars, 1 uppercase, 1 number) are required' });
    }

    const result = await query(
      'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ error: 'Reset link is invalid or has expired' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await query(
      `UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL,
       failed_login_count = 0, locked_until = NULL
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    // Force logout everywhere: if an attacker had a stolen session, resetting
    // the password shouldn't leave that session valid for another 7 days.
    await revokeAllSessionsForUser(user.id);

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
