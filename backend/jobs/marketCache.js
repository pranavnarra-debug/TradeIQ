import cron from 'node-cron';
import { query } from '../db/pool.js';
import marketData from '../services/marketData.js';

const DEFAULT_TICKERS = ['AAPL', 'NVDA', 'TSLA', 'AMZN', 'META', 'MSFT', 'GOOGL', 'JPM', 'SPY', 'QQQ'];

function isMarketHoursET() {
  // Approximate ET by offsetting from UTC (does not account for DST transitions precisely,
  // which is an acceptable simplification for a pre-fetch/caching job).
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const totalMinutes = utcHour * 60 + utcMinutes;

  // Market hours 9:30am-4pm ET ~ 13:30-20:00 UTC (EDT) or 14:30-21:00 UTC (EST).
  // Use the wider EDT window so the cache still warms during standard time, erring toward over-fetching.
  const day = now.getUTCDay(); // 0 = Sunday
  const isWeekday = day >= 1 && day <= 5;
  const afterOpen = totalMinutes >= 13 * 60 + 30;
  const beforeClose = totalMinutes <= 21 * 60;

  return isWeekday && afterOpen && beforeClose;
}

export function startMarketCacheJobs() {
  // Job 1: Pre-fetch and cache quotes for default tickers every hour during market hours.
  cron.schedule('0 * * * *', async () => {
    if (!isMarketHoursET()) return;
    try {
      await marketData.getMultipleQuotes(DEFAULT_TICKERS);
      console.log(`[marketCache] Pre-fetched quotes for ${DEFAULT_TICKERS.length} default tickers`);
    } catch (err) {
      console.error('[marketCache] Failed to pre-fetch default ticker quotes:', err.message);
    }
  });

  // Job 2: Insert an hourly admin metrics snapshot.
  cron.schedule('0 * * * *', async () => {
    try {
      const totalUsersResult = await query('SELECT COUNT(*)::int AS count FROM users');
      const totalTradesResult = await query('SELECT COUNT(*)::int AS count FROM trades');
      const totalLessonsResult = await query(
        'SELECT COUNT(*)::int AS count FROM lesson_progress WHERE completed = TRUE'
      );

      await query(
        `INSERT INTO admin_metrics_snapshots (active_users, total_users, total_trades, total_lessons_completed)
         VALUES ($1, $2, $3, $4)`,
        [0, totalUsersResult.rows[0].count, totalTradesResult.rows[0].count, totalLessonsResult.rows[0].count]
      );
      console.log('[marketCache] Inserted hourly admin metrics snapshot');
    } catch (err) {
      console.error('[marketCache] Failed to insert metrics snapshot:', err.message);
    }
  });
}

export default startMarketCacheJobs;
