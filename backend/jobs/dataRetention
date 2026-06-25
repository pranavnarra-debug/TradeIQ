import cron from 'node-cron';
import { query } from '../db/pool.js';

/**
 * Data retention jobs: periodically purge data that has no ongoing product
 * use once it's old enough, rather than retaining it indefinitely by default.
 * Keeping only what's actually useful reduces what's exposed in the event of
 * a database breach and keeps these tables from growing unbounded forever.
 */
export function startDataRetentionJobs() {
  // Daily at 3am: drop session/connection logs older than 30 days. These exist
  // for short-term security investigation (e.g. "did someone log in from an
  // unfamiliar IP recently"), not as a permanent record — nothing in the app
  // reads rows older than a few days today.
  cron.schedule('0 3 * * *', async () => {
    try {
      const result = await query(
        `DELETE FROM user_sessions WHERE connected_at < NOW() - INTERVAL '30 days'`
      );
      console.log(`[dataRetention] Purged ${result.rowCount} user_sessions rows older than 30 days`);
    } catch (err) {
      console.error('[dataRetention] Failed to purge old user_sessions:', err.message);
    }
  });

  // Daily at 3am: drop expired or revoked refresh tokens. Expired tokens are
  // already rejected at the application layer, and revoked tokens have already
  // served their reuse-detection purpose once enough time has passed that a
  // delayed replay is no longer plausible — there's no reason to keep either
  // around indefinitely.
  cron.schedule('0 3 * * *', async () => {
    try {
      const result = await query(
        `DELETE FROM refresh_tokens WHERE expires_at < NOW() OR (revoked = TRUE AND created_at < NOW() - INTERVAL '7 days')`
      );
      console.log(`[dataRetention] Purged ${result.rowCount} expired/stale refresh_tokens rows`);
    } catch (err) {
      console.error('[dataRetention] Failed to purge old refresh_tokens:', err.message);
    }
  });

  // Monthly on the 1st at 3am: trim admin_metrics_snapshots beyond a year of
  // history. The admin dashboard only ever charts the trailing 30 days; a full
  // year of hourly snapshots is already generous headroom for any future use.
  cron.schedule('0 3 1 * *', async () => {
    try {
      const result = await query(
        `DELETE FROM admin_metrics_snapshots WHERE snapshot_time < NOW() - INTERVAL '1 year'`
      );
      console.log(`[dataRetention] Purged ${result.rowCount} admin_metrics_snapshots rows older than 1 year`);
    } catch (err) {
      console.error('[dataRetention] Failed to purge old admin_metrics_snapshots:', err.message);
    }
  });
}

export default startDataRetentionJobs;
