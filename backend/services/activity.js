// Append-only log of things players do, used to count quest progress.
import { query } from '../db/pool.js';

export async function logActivity(db, userId, kind, ref = null, amount = 1) {
  try {
    await (db || { query }).query(
      'INSERT INTO activity_log (user_id, kind, ref, amount) VALUES ($1, $2, $3, $4)',
      [userId, kind, ref, amount]
    );
  } catch (err) {
    // Quest progress is nice-to-have; never fail the real action over it.
    console.error('[activity] log failed:', err.message);
  }
}

export default logActivity;
