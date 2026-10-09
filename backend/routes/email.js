import express from 'express';
import { query } from '../db/pool.js';

const router = express.Router();

// GET from an email link: send the browser to a confirm page instead of
// unsubscribing immediately, because corporate link-scanners "click" every URL.
router.get('/unsubscribe', (req, res) => {
  const token = String(req.query.token || '');
  res.redirect(`/unsubscribe?token=${encodeURIComponent(token)}`);
});

// POST: the confirm button, or RFC 8058 one-click from Gmail/Yahoo.
router.post('/unsubscribe', express.urlencoded({ extended: false, limit: '2kb' }), async (req, res, next) => {
  try {
    const token = String(req.query.token || req.body?.token || '');
    if (!/^[0-9a-f]{48}$/.test(token)) return res.status(400).json({ error: 'Invalid unsubscribe link' });
    const { rowCount } = await query('UPDATE users SET email_opt_in = FALSE WHERE email_unsubscribe_token = $1', [token]);
    if (!rowCount) return res.status(404).json({ error: 'Invalid unsubscribe link' });
    res.json({ message: "You're unsubscribed from reminders and digests. Security emails (like password resets) still come through." });
  } catch (err) {
    next(err);
  }
});

export default router;
