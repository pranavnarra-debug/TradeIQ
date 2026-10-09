// Gamification rules: XP, levels, coins, streaks and achievements. Every XP
// grant goes through awardXp() so the users.xp counter and the xp_events
// ledger can't drift apart.
import { query } from '../db/pool.js';

export const LEVELS = [
  { xp: 0, title: 'Piggy Bank Rookie' },
  { xp: 100, title: 'Coin Collector' },
  { xp: 250, title: 'Budget Boss' },
  { xp: 450, title: 'Savings Specialist' },
  { xp: 700, title: 'Market Apprentice' },
  { xp: 1000, title: 'Chart Reader' },
  { xp: 1400, title: 'Value Hunter' },
  { xp: 1900, title: 'Dividend Collector' },
  { xp: 2500, title: 'Indicator Wizard' },
  { xp: 3200, title: 'Options Tactician' },
  { xp: 4000, title: 'Greeks Guru' },
  { xp: 5000, title: 'Futures Pilot' },
  { xp: 6200, title: 'Risk Manager' },
  { xp: 7600, title: 'Market Veteran' },
  { xp: 9200, title: 'TradeIQ Legend' },
];

export function levelFor(xp = 0) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  return {
    level: i + 1,
    title: cur.title,
    xpIntoLevel: xp - cur.xp,
    xpForNext: next ? next.xp - cur.xp : null,
    nextTitle: next ? next.title : null,
  };
}

export const ACHIEVEMENTS = [
  { id: 'first_lesson', name: 'First Steps', desc: 'Finish your first lesson', xp: 20, coins: 10, sprite: 'chip' },
  { id: 'lessons_10', name: 'Warmed Up', desc: 'Finish 10 lessons', xp: 50, coins: 20, sprite: 'penny' },
  { id: 'lessons_25', name: 'Bookworm', desc: 'Finish 25 lessons', xp: 100, coins: 40, sprite: 'hoot' },
  { id: 'lessons_50', name: 'Halfway Hero', desc: 'Finish 50 lessons', xp: 150, coins: 60, sprite: 'chip' },
  { id: 'lessons_100', name: 'Centurion', desc: 'Finish 100 lessons', xp: 300, coins: 120, sprite: 'bolt' },
  { id: 'perfect_1', name: 'Flawless', desc: 'Score 100% on a lesson quiz', xp: 20, coins: 10, sprite: 'hoot' },
  { id: 'perfect_10', name: 'Sharpshooter', desc: 'Score 100% on 10 lesson quizzes', xp: 100, coins: 40, sprite: 'hoot' },
  { id: 'streak_3', name: 'On Fire', desc: 'Keep a 3-day streak', xp: 30, coins: 15, sprite: 'chip' },
  { id: 'streak_7', name: 'Week Warrior', desc: 'Keep a 7-day streak', xp: 70, coins: 30, sprite: 'chip' },
  { id: 'streak_30', name: 'Unstoppable', desc: 'Keep a 30-day streak', xp: 300, coins: 100, sprite: 'chip' },
  { id: 'unit_money', name: 'Money Master', desc: 'Pass the Unit 1 exam', xp: 0, coins: 0, sprite: 'penny' },
  { id: 'unit_stocks', name: 'Stock Sage', desc: 'Pass the Unit 2 exam', xp: 0, coins: 0, sprite: 'chip' },
  { id: 'unit_options', name: 'Options Ace', desc: 'Pass the Unit 3 exam', xp: 0, coins: 0, sprite: 'hoot' },
  { id: 'unit_futures', name: 'Futures Pilot', desc: 'Pass the Unit 4 exam', xp: 0, coins: 0, sprite: 'bolt' },
  { id: 'all_units', name: 'Grand Champion', desc: 'Pass all four unit exams', xp: 500, coins: 200, sprite: 'chip' },
  { id: 'first_trade', name: 'Off the Bench', desc: 'Place your first simulated trade', xp: 15, coins: 10, sprite: 'bolt' },
  { id: 'trades_25', name: 'Desk Jockey', desc: 'Place 25 simulated trades', xp: 50, coins: 20, sprite: 'bolt' },
  { id: 'first_profit', name: 'In the Green', desc: 'Close a simulated trade at a profit', xp: 20, coins: 10, sprite: 'chip' },
  { id: 'cut_loss', name: 'Grizz Approves', desc: 'Close a losing trade (cutting losses is a skill)', xp: 20, coins: 10, sprite: 'grizz' },
  { id: 'email_verified', name: 'Backup Plan', desc: 'Add and confirm a recovery email', xp: 20, coins: 10, sprite: 'penny' },
];
const ACH_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export const SHOP = {
  streak_freeze: { cost: 50, label: 'Streak Freeze', max: 2 },
  'avatar:hoot': { cost: 100, label: 'Hoot avatar' },
  'avatar:grizz': { cost: 150, label: 'Grizz avatar' },
  'avatar:bolt': { cost: 250, label: 'Bolt avatar' },
};

const STREAK_BONUS = { 3: 15, 7: 40, 14: 60, 30: 150, 60: 250, 100: 500 };

/** Grant XP (and optionally coins). `db` is a pg client inside a transaction, or the pool helper. */
export async function awardXp(db, userId, source, ref, amount, coins = 0) {
  if (amount <= 0 && coins <= 0) return;
  if (amount > 0) {
    await db.query('INSERT INTO xp_events (user_id, source, ref, amount) VALUES ($1, $2, $3, $4)', [userId, source, ref, amount]);
  }
  await db.query('UPDATE users SET xp = xp + $1, coins = coins + $2 WHERE id = $3', [Math.max(amount, 0), Math.max(coins, 0), userId]);
}

/**
 * Advances the daily streak based on the user's own timezone. Missing exactly
 * one day burns a Streak Freeze if they own one. Returns the new streak state.
 */
export async function touchStreak(db, userId) {
  const { rows } = await db.query(
    `SELECT streak_current, streak_best, streak_last_day, streak_freezes,
            (NOW() AT TIME ZONE COALESCE(timezone, 'America/New_York'))::date AS today
     FROM users WHERE id = $1 FOR UPDATE`,
    [userId]
  );
  const u = rows[0];
  const today = u.today;
  const last = u.streak_last_day;
  const dayDiff = last ? Math.round((new Date(today) - new Date(last)) / 86400000) : null;

  if (dayDiff === 0) return { streak: u.streak_current, extended: false, bonusXp: 0, usedFreeze: false };

  let streak;
  let usedFreeze = false;
  if (dayDiff === 1) streak = u.streak_current + 1;
  else if (dayDiff === 2 && u.streak_freezes > 0) {
    streak = u.streak_current + 1;
    usedFreeze = true;
  } else streak = 1;

  await db.query(
    `UPDATE users SET streak_current = $1, streak_best = GREATEST(streak_best, $1), streak_last_day = $2,
       streak_freezes = streak_freezes - $3 WHERE id = $4`,
    [streak, today, usedFreeze ? 1 : 0, userId]
  );
  const bonusXp = STREAK_BONUS[streak] || 0;
  if (bonusXp) await awardXp(db, userId, 'streak', `day-${streak}`, bonusXp, Math.round(bonusXp / 3));
  return { streak, extended: true, bonusXp, usedFreeze };
}

/**
 * Checks every achievement whose condition might now be met and unlocks the
 * new ones. Returns the newly unlocked achievement objects.
 */
export async function checkAchievements(db, userId) {
  const [have, stats] = await Promise.all([
    db.query('SELECT achievement_id FROM user_achievements WHERE user_id = $1', [userId]),
    db.query(
      `SELECT
         (SELECT COUNT(*) FROM lesson_completions WHERE user_id = $1)::int AS lessons,
         (SELECT COUNT(*) FROM lesson_completions WHERE user_id = $1 AND best_score = 100)::int AS perfects,
         (SELECT ARRAY_AGG(unit_id) FROM unit_exams WHERE user_id = $1 AND passed) AS units,
         (SELECT COUNT(*) FROM trades t JOIN portfolios p ON p.id = t.portfolio_id WHERE p.user_id = $1)::int AS trades,
         (SELECT COUNT(*) FROM trades t JOIN portfolios p ON p.id = t.portfolio_id WHERE p.user_id = $1 AND t.realized_pnl > 0)::int AS wins,
         (SELECT COUNT(*) FROM trades t JOIN portfolios p ON p.id = t.portfolio_id WHERE p.user_id = $1 AND t.realized_pnl < 0)::int AS losses,
         u.streak_current AS streak, u.email_verified AS verified
       FROM users u WHERE u.id = $1`,
      [userId]
    ),
  ]);
  const owned = new Set(have.rows.map((r) => r.achievement_id));
  const s = stats.rows[0];
  const units = new Set(s.units || []);
  const earned = {
    first_lesson: s.lessons >= 1,
    lessons_10: s.lessons >= 10,
    lessons_25: s.lessons >= 25,
    lessons_50: s.lessons >= 50,
    lessons_100: s.lessons >= 100,
    perfect_1: s.perfects >= 1,
    perfect_10: s.perfects >= 10,
    streak_3: s.streak >= 3,
    streak_7: s.streak >= 7,
    streak_30: s.streak >= 30,
    unit_money: units.has('money'),
    unit_stocks: units.has('stocks'),
    unit_options: units.has('options'),
    unit_futures: units.has('futures'),
    all_units: ['money', 'stocks', 'options', 'futures'].every((u) => units.has(u)),
    first_trade: s.trades >= 1,
    trades_25: s.trades >= 25,
    first_profit: s.wins >= 1,
    cut_loss: s.losses >= 1,
    email_verified: Boolean(s.verified),
  };

  const unlocked = [];
  for (const [id, ok] of Object.entries(earned)) {
    if (!ok || owned.has(id)) continue;
    const ins = await db.query(
      'INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING achievement_id',
      [userId, id]
    );
    if (!ins.rows.length) continue;
    const a = ACH_BY_ID.get(id);
    await awardXp(db, userId, 'achievement', id, a.xp, a.coins);
    unlocked.push(a);
  }
  return unlocked;
}

/** Convenience for non-transactional callers (e.g. after a trade). */
export async function checkAchievementsSafe(userId) {
  try {
    return await checkAchievements({ query }, userId);
  } catch (err) {
    console.error('[progress] achievement check failed:', err.message);
    return [];
  }
}
