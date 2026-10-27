// Quests (content/game/quests.json, written by the game designer). Progress
// isn't stored; it's counted from what the player actually did, so it can
// never drift out of sync with reality.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { ITEMS, computeStats } from './game.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUESTS_PATH = path.join(__dirname, '..', 'content', 'game', 'quests.json');

// signal -> how to count it. `kind` = activity_log kind for windowed counts.
const ACTIVITY = {
  lessons_passed: 'lesson_pass', lessons_perfect: 'lesson_perfect', review_lessons: 'lesson_review',
  boss_wins: 'boss_win', boss_flawless: 'boss_flawless', trades_journaled: 'trade_journaled', analyses: 'analysis',
};
const PREFIXED = ['lesson_in_unit:', 'lesson:', 'exam_passed:', 'boss_win:'];
const PLAIN = [...Object.keys(ACTIVITY), 'lesson_days', 'boss_correct', 'streak', 'items_owned', 'set_max_pieces', 'sets_worn', 'email_verified'];

export function validSignal(s) {
  return PLAIN.includes(s) || PREFIXED.some((p) => String(s).startsWith(p) && String(s).length > p.length);
}

function load() {
  if (!fs.existsSync(QUESTS_PATH)) {
    console.warn('[quests] content/game/quests.json not found; no quests available');
    return [];
  }
  const list = JSON.parse(fs.readFileSync(QUESTS_PATH, 'utf8')).quests || [];
  const errors = [];
  const ids = new Set();
  for (const q of list) {
    if (!/^q-[a-z0-9-]+$/.test(q.id || '')) errors.push(`quest id ${q.id}`);
    if (ids.has(q.id)) errors.push(`duplicate ${q.id}`);
    ids.add(q.id);
    if (!['daily', 'weekly', 'story'].includes(q.type)) errors.push(`${q.id}: type`);
    if (!validSignal(q.signal)) errors.push(`${q.id}: unknown signal ${q.signal}`);
    if (!(q.target > 0)) errors.push(`${q.id}: target`);
    if (q.reward?.item && !ITEMS.has(q.reward.item)) errors.push(`${q.id}: reward item ${q.reward.item} not in catalog`);
  }
  for (const q of list) if (q.requires && !ids.has(q.requires)) errors.push(`${q.id}: requires unknown ${q.requires}`);
  if (errors.length) {
    console.error(`[quests] quests.json problems:\n  ${errors.join('\n  ')}`);
    throw new Error('Invalid quests.json');
  }
  return list;
}

export const QUESTS = load();
export const QUEST_BY_ID = new Map(QUESTS.map((q) => [q.id, q]));
console.log(`[quests] Loaded ${QUESTS.length} quests`);

/** Current daily/weekly period keys + start timestamps in the user's timezone. */
export async function periods(db, userId) {
  const { rows } = await db.query(
    `SELECT tz,
       (NOW() AT TIME ZONE tz)::date::text AS day,
       ((NOW() AT TIME ZONE tz)::date::timestamp AT TIME ZONE tz) AS day_start,
       date_trunc('week', NOW() AT TIME ZONE tz)::date::text AS week,
       (date_trunc('week', NOW() AT TIME ZONE tz) AT TIME ZONE tz) AS week_start
     FROM (SELECT COALESCE(timezone, 'America/New_York') AS tz FROM users WHERE id = $1) t`,
    [userId]
  );
  return rows[0];
}

/** How far along a signal is. `since` null = all time. */
export async function countSignal(db, userId, signal, since, tz) {
  const one = async (sql, params) => Number((await db.query(sql, params)).rows[0]?.n || 0);
  const after = since ? 'AND created_at >= $2' : '';
  const p = since ? [userId, since] : [userId];

  if (ACTIVITY[signal]) {
    // All-time lesson counts include lessons finished before quests existed.
    if (!since && signal === 'lessons_passed') return one('SELECT COUNT(*) AS n FROM lesson_completions WHERE user_id = $1', [userId]);
    if (!since && signal === 'lessons_perfect') return one('SELECT COUNT(*) AS n FROM lesson_completions WHERE user_id = $1 AND best_score = 100', [userId]);
    return one(`SELECT COUNT(*) AS n FROM activity_log WHERE user_id = $1 AND kind = '${ACTIVITY[signal]}' ${after}`, p);
  }
  if (signal === 'boss_correct') return one(`SELECT COALESCE(SUM(amount), 0) AS n FROM activity_log WHERE user_id = $1 AND kind = 'boss_correct' ${after}`, p);
  if (signal === 'lesson_days') {
    return one(
      `SELECT COUNT(DISTINCT (created_at AT TIME ZONE $${p.length + 1})::date) AS n FROM activity_log WHERE user_id = $1 AND kind = 'lesson_pass' ${after}`,
      [...p, tz]
    );
  }
  if (signal.startsWith('lesson_in_unit:')) {
    const unit = signal.split(':')[1];
    if (!since) return one('SELECT COUNT(*) AS n FROM lesson_completions WHERE user_id = $1 AND unit_id = $2', [userId, unit]);
    return one(`SELECT COUNT(*) AS n FROM activity_log WHERE user_id = $1 AND created_at >= $2 AND kind = 'lesson_pass' AND ref LIKE $3`, [userId, since, `${unit}-%`]);
  }
  if (signal.startsWith('lesson:')) {
    const id = signal.slice(7);
    if (!since) return one('SELECT COUNT(*) AS n FROM lesson_completions WHERE user_id = $1 AND lesson_id = $2', [userId, id]);
    return one(`SELECT COUNT(*) AS n FROM activity_log WHERE user_id = $1 AND created_at >= $2 AND kind = 'lesson_pass' AND ref = $3`, [userId, since, id]);
  }
  if (signal.startsWith('boss_win:')) {
    return one(`SELECT COUNT(*) AS n FROM activity_log WHERE user_id = $1 AND kind = 'boss_win' AND ref = $${p.length + 1} ${after}`, [...p, signal.slice(9)]);
  }
  if (signal.startsWith('exam_passed:')) return one('SELECT COUNT(*) AS n FROM unit_exams WHERE user_id = $1 AND unit_id = $2 AND passed', [userId, signal.split(':')[1]]);
  if (signal === 'streak') return one('SELECT streak_current AS n FROM users WHERE id = $1', [userId]);
  if (signal === 'email_verified') return one('SELECT (email IS NOT NULL AND email_verified)::int AS n FROM users WHERE id = $1', [userId]);
  if (signal === 'items_owned') return one('SELECT COUNT(*) AS n FROM user_items WHERE user_id = $1', [userId]);
  if (signal === 'set_max_pieces' || signal === 'sets_worn') {
    const eq = (await db.query('SELECT item_id FROM user_equipment WHERE user_id = $1', [userId])).rows.map((r) => r.item_id);
    const { sets } = computeStats(eq);
    return signal === 'sets_worn' ? sets.length : Math.max(0, ...sets.map((s) => s.count));
  }
  return 0;
}

function seededPick(list, seed, n) {
  const scored = list.map((q) => ({ q, k: crypto.createHash('sha256').update(`${seed}:${q.id}`).digest('hex') }));
  return scored.sort((a, b) => (a.k < b.k ? -1 : 1)).slice(0, n).map((x) => x.q);
}

/** The quests a player sees right now. */
export function activeQuests({ userId, day, week, worlds, claimedStory, bossUnlocked }) {
  // Don't offer boss quests before the player can fight any boss.
  const open = (q) => worlds.includes(q.world || 1) && (bossUnlocked || !String(q.signal).startsWith('boss'));
  const daily = seededPick(QUESTS.filter((q) => q.type === 'daily' && open(q)), `${userId}:${day}`, 3);
  const weekly = seededPick(QUESTS.filter((q) => q.type === 'weekly' && open(q)), `${userId}:${week}`, 3);
  const story = QUESTS.filter((q) => q.type === 'story' && open(q) && !claimedStory.has(q.id) && (!q.requires || claimedStory.has(q.requires)))
    .slice(0, 5);
  return { daily, weekly, story };
}
