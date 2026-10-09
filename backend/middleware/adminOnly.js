import { query } from '../db/pool.js';

/**
 * Requires `authenticate` to have run first. Re-checks the role in the
 * database rather than trusting the JWT claim alone, so demoting or
 * deactivating an admin takes effect immediately instead of when their
 * 15-minute access token happens to expire.
 */
export async function adminOnly(req, res, next) {
  if (!req.user) return res.status(403).json({ error: 'Admin access required' });
  try {
    const { rows } = await query('SELECT role, is_active FROM users WHERE id = $1', [req.user.userId]);
    if (!rows[0] || rows[0].role !== 'admin' || !rows[0].is_active) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    next(err);
  }
}

export default adminOnly;
