// The signed-in user's own account: profile, preferences, email, password,
// recovery code, data export and account deletion.
import express from 'express';
import bcrypt from 'bcrypt';
import { query, withTransaction } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { recoveryCode, normalizeRecoveryCode } from '../services/tokens.js';
import { passwordProblem, emailProblem, normalizeEmail, isValidTimezone } from '../services/validate.js';
import { sendSecurityNotice } from '../services/emailService.js';
import { SHOP } from '../services/progress.js';
import {
  publicUser, startEmailVerification, revokeAllSessions, clearRefreshCookie, BCRYPT_ROUNDS,
} from './auth.js';

const router = express.Router();
router.use(authenticate);

async function loadUser(id) {
  return (await query('SELECT * FROM users WHERE id = $1', [id])).rows[0];
}

async function requirePassword(user, password, res) {
  if (typeof password !== 'string' || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: 'Current password is incorrect', field: 'password' });
    return false;
  }
  return true;
}

router.get('/', async (req, res, next) => {
  try {
    const user = await loadUser(req.user.userId);
    if (!user || !user.is_active) return res.status(401).json({ error: 'Account not available', code: 'AUTH_REQUIRED' });
    res.json(publicUser(user));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/me  { avatar?, timezone?, emailOptIn?, showOnLeaderboard? }
router.patch('/', async (req, res, next) => {
  try {
    const user = await loadUser(req.user.userId);
    const { avatar, timezone, emailOptIn, showOnLeaderboard } = req.body || {};
    const sets = [];
    const params = [];
    if (avatar !== undefined) {
      if (!(user.owned_avatars || []).includes(avatar)) return res.status(400).json({ error: "You haven't unlocked that avatar yet" });
      params.push(avatar);
      sets.push(`avatar = $${params.length}`);
    }
    if (timezone !== undefined) {
      if (!isValidTimezone(timezone)) return res.status(400).json({ error: 'Unknown timezone' });
      params.push(timezone);
      sets.push(`timezone = $${params.length}`);
    }
    if (emailOptIn !== undefined) {
      params.push(Boolean(emailOptIn));
      sets.push(`email_opt_in = $${params.length}`);
    }
    if (showOnLeaderboard !== undefined) {
      params.push(Boolean(showOnLeaderboard));
      sets.push(`show_on_leaderboard = $${params.length}`);
    }
    if (!sets.length) return res.json(publicUser(user));
    params.push(user.id);
    const { rows } = await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
    res.json(publicUser(rows[0]));
  } catch (err) {
    next(err);
  }
});

// PUT /api/me/email  { email }   add or change the optional email
router.put('/email', async (req, res, next) => {
  try {
    const user = await loadUser(req.user.userId);
    const email = normalizeEmail(req.body?.email || '');
    const problem = emailProblem(email);
    if (problem) return res.status(400).json({ error: problem, field: 'email' });
    if (user.email && user.email.toLowerCase() === email.toLowerCase() && user.email_verified) {
      return res.json(publicUser(user));
    }
    const clash = await query('SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) AND id <> $2', [email, user.id]);
    if (clash.rows.length) return res.status(409).json({ error: 'That email is already on another account', field: 'email' });

    const oldEmail = user.email_verified ? user.email : null;
    await startEmailVerification(user, email);
    if (oldEmail) sendSecurityNotice(user, oldEmail, `Your email was changed to ${email}`).catch(() => {});
    res.json({ ...publicUser(await loadUser(user.id)), message: `Check ${email} for a confirmation link.` });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'That email is already on another account', field: 'email' });
    next(err);
  }
});

// POST /api/me/email/resend
router.post('/email/resend', async (req, res, next) => {
  try {
    const user = await loadUser(req.user.userId);
    if (!user.email || user.email_verified) return res.status(400).json({ error: 'Nothing to confirm' });
    await startEmailVerification(user, user.email);
    res.json({ message: `Sent a new link to ${user.email}.` });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/me/email
router.delete('/email', async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE users SET email = NULL, email_verified = FALSE, email_verify_token = NULL, email_verify_expires = NULL,
         email_opt_in = FALSE, reset_password_token = NULL WHERE id = $1 RETURNING *`,
      [req.user.userId]
    );
    res.json(publicUser(rows[0]));
  } catch (err) {
    next(err);
  }
});

// PUT /api/me/password  { currentPassword, newPassword }
router.put('/password', async (req, res, next) => {
  try {
    const user = await loadUser(req.user.userId);
    const { currentPassword, newPassword } = req.body || {};
    if (!(await requirePassword(user, currentPassword, res))) return;
    const problem = passwordProblem(newPassword, user.username);
    if (problem) return res.status(400).json({ error: problem, field: 'newPassword' });
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(newPassword, BCRYPT_ROUNDS), user.id]);
    // Sign out every other device; this one gets logged out too and will log back in.
    await revokeAllSessions(user.id);
    clearRefreshCookie(res);
    if (user.email && user.email_verified) sendSecurityNotice(user, user.email, 'Your password was changed').catch(() => {});
    res.json({ message: 'Password changed. Please log in again.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/me/recovery-code  { password }   generate a new recovery code
router.post('/recovery-code', async (req, res, next) => {
  try {
    const user = await loadUser(req.user.userId);
    if (!(await requirePassword(user, req.body?.password, res))) return;
    const code = recoveryCode();
    await query('UPDATE users SET recovery_code_hash = $1 WHERE id = $2', [await bcrypt.hash(normalizeRecoveryCode(code), 10), user.id]);
    res.json({ recoveryCode: code });
  } catch (err) {
    next(err);
  }
});

// POST /api/me/logout-all
router.post('/logout-all', async (req, res, next) => {
  try {
    await revokeAllSessions(req.user.userId);
    clearRefreshCookie(res);
    res.json({ message: 'Logged out everywhere' });
  } catch (err) {
    next(err);
  }
});

// POST /api/me/shop  { item }
router.post('/shop', async (req, res, next) => {
  try {
    const item = String(req.body?.item || '');
    const offer = SHOP[item];
    if (!offer) return res.status(400).json({ error: 'Unknown item' });
    const result = await withTransaction(async (db) => {
      const u = (await db.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [req.user.userId])).rows[0];
      if (u.coins < offer.cost) return { error: `You need ${offer.cost - u.coins} more coins` };
      if (item === 'streak_freeze') {
        if (u.streak_freezes >= offer.max) return { error: `You can hold at most ${offer.max} freezes` };
        await db.query('UPDATE users SET coins = coins - $1, streak_freezes = streak_freezes + 1 WHERE id = $2', [offer.cost, u.id]);
      } else {
        const avatar = item.split(':')[1];
        if ((u.owned_avatars || []).includes(avatar)) return { error: 'Already unlocked' };
        await db.query(
          'UPDATE users SET coins = coins - $1, owned_avatars = array_append(owned_avatars, $2) WHERE id = $3',
          [offer.cost, avatar, u.id]
        );
      }
      return { user: (await db.query('SELECT * FROM users WHERE id = $1', [u.id])).rows[0] };
    });
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(publicUser(result.user));
  } catch (err) {
    next(err);
  }
});

// GET /api/me/export   everything we store about you, as JSON (privacy right of access)
router.get('/export', async (req, res, next) => {
  try {
    const id = req.user.userId;
    // One connection, one transaction: a consistent snapshot without
    // opening nine connections at once.
    const [user, portfolios, positions, trades, analyses, lessons, exams, achievements, xp] = await withTransaction(async (db) => {
      const out = [];
      for (const [sql, params] of [
        [
        `SELECT username, email, email_verified, role, created_at, last_login, timezone, avatar, xp, coins,
           streak_current, streak_best, email_opt_in, show_on_leaderboard, terms_accepted_at, terms_version
         FROM users WHERE id = $1`,
        [id]],
        ['SELECT id, portfolio_type, name, starting_capital, cash, created_at FROM portfolios WHERE user_id = $1', [id]],
        ['SELECT p.* FROM positions p JOIN portfolios pf ON pf.id = p.portfolio_id WHERE pf.user_id = $1', [id]],
        ['SELECT t.* FROM trades t JOIN portfolios pf ON pf.id = t.portfolio_id WHERE pf.user_id = $1 ORDER BY t.executed_at', [id]],
        ['SELECT symbol, trend_assessment, support_level, resistance_level, canslim_checks, verdict, reasoning, created_at FROM user_analyses WHERE user_id = $1', [id]],
        ['SELECT lesson_id, unit_id, best_score, attempts, xp_awarded, first_completed_at, last_completed_at FROM lesson_completions WHERE user_id = $1', [id]],
        ['SELECT unit_id, best_score, passed, attempts, passed_at FROM unit_exams WHERE user_id = $1', [id]],
        ['SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1', [id]],
        ['SELECT source, ref, amount, created_at FROM xp_events WHERE user_id = $1 ORDER BY created_at', [id]],
      ]) out.push(await db.query(sql, params));
      return out;
    });
    res.setHeader('Content-Disposition', `attachment; filename="tradeiq-export-${req.user.username}.json"`);
    res.json({
      exportedAt: new Date().toISOString(),
      account: user.rows[0],
      portfolios: portfolios.rows,
      positions: positions.rows,
      trades: trades.rows,
      analyses: analyses.rows,
      lessonCompletions: lessons.rows,
      unitExams: exams.rows,
      achievements: achievements.rows,
      xpHistory: xp.rows,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/me  { password, confirm: "DELETE" }   permanently delete the account
router.delete('/', async (req, res, next) => {
  try {
    const user = await loadUser(req.user.userId);
    if (req.body?.confirm !== 'DELETE') return res.status(400).json({ error: 'Type DELETE to confirm' });
    if (!(await requirePassword(user, req.body?.password, res))) return;
    if (user.role === 'admin') {
      const admins = await query("SELECT COUNT(*)::int AS n FROM users WHERE role = 'admin' AND is_active");
      if (admins.rows[0].n <= 1) return res.status(400).json({ error: "You're the only admin. Make someone else admin first." });
    }
    const email = user.email_verified ? user.email : null;
    // Every user-owned table cascades on users.id, so this one delete removes it all.
    await query('DELETE FROM users WHERE id = $1', [user.id]);
    clearRefreshCookie(res);
    if (email) sendSecurityNotice({ id: null, username: user.username }, email, 'Your account and all its data were deleted').catch(() => {});
    res.json({ message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
