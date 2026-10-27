#!/usr/bin/env node
// Snapshots the simulated players in the local tradeiq_sim database (made by
// scripts/simulate.js) into content/rivals/seed.json.gz. When a server starts
// with RIVALS_ENABLED=1 and has no rivals yet, it imports this file once
// (jobs/rivals.js), so the AI rivals arrive with their history intact.
//
//   npm run export-rivals
//
// Times are stored as "seconds before the snapshot" and rebuilt relative to
// the import time, so a lesson passed 3 days before the snapshot shows as
// 3 days ago on the live site.
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import { makePersona } from '../services/rivalBrain.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'content', 'rivals', 'seed.json.gz');

const url = new URL(process.env.DATABASE_URL || '');
if (!['localhost', '127.0.0.1'].includes(url.hostname)) {
  console.error('Refusing to run: DATABASE_URL is not a local database.');
  process.exit(1);
}
url.pathname = '/tradeiq_sim';

const USER_COLS = ['username', 'timezone', 'avatar', 'avatar_config', 'xp', 'coins', 'streak_current', 'streak_best', 'streak_last_day', 'streak_freezes', 'owned_avatars', 'created_at', 'last_login'];
// table -> columns to copy (ids and user_id are rebuilt on import)
const TABLES = {
  lesson_completions: ['lesson_id', 'unit_id', 'best_score', 'attempts', 'xp_awarded', 'first_completed_at', 'last_completed_at'],
  unit_exams: ['unit_id', 'best_score', 'passed', 'attempts', 'passed_at', 'last_attempt_at'],
  user_achievements: ['achievement_id', 'unlocked_at'],
  xp_events: ['source', 'ref', 'amount', 'created_at'],
  coin_events: ['amount', 'reason', 'ref', 'created_at'],
  user_items: ['item_id', 'source', 'acquired_at'],
  user_equipment: ['slot', 'item_id', 'equipped_at'],
  battles: ['boss_id', 'status', 'correct', 'wrong', 'hints_used', 'damage_taken', 'duration_ms', 'reward_coins', 'reward_item', 'started_at', 'finished_at'],
  quest_claims: ['quest_id', 'period_key', 'coins', 'item_id', 'claimed_at'],
  activity_log: ['kind', 'ref', 'amount', 'created_at'],
};

const db = new pg.Client({ connectionString: url.toString() });
await db.connect();
const now = (await db.query('SELECT NOW() AS t, CURRENT_DATE::text AS d')).rows[0];
const nowMs = new Date(now.t).getTime();
const ago = (v) => (v == null ? null : Math.round((nowMs - new Date(v).getTime()) / 1000));
const daysAgo = (v) => (v == null ? null : Math.round((new Date(now.d) - new Date(v)) / 86400000));
const TIME = /(_at|_login)$/;

const users = (await db.query(`SELECT id, ${USER_COLS.join(', ')}, streak_last_day::text AS streak_last_day FROM users WHERE role = 'user' ORDER BY id`)).rows;
const scores = new Map((await db.query(
  `SELECT user_id, COUNT(*)::int AS n, AVG(best_score)::int AS avg FROM lesson_completions GROUP BY user_id`
)).rows.map((r) => [r.user_id, r]));
const byLessons = [...users].sort((a, b) => (scores.get(a.id)?.n || 0) - (scores.get(b.id)?.n || 0));
const rankOf = new Map(byLessons.map((u, i) => [u.id, i / Math.max(1, users.length - 1)]));

const out = [];
for (const u of users) {
  // Personality: how much they played in the sim says what kind of player they are.
  const r = rankOf.get(u.id);
  const persona = makePersona();
  persona.type = r > 0.94 ? 'hardcore' : r > 0.73 ? 'regular' : r > 0.35 ? 'casual' : 'tourist';
  const avg = scores.get(u.id)?.avg;
  if (avg) persona.skill = Math.min(0.97, Math.max(0.35, avg / 100 - 0.05));
  persona.tz = u.timezone || persona.tz;

  const rec = {
    user: Object.fromEntries(USER_COLS.map((c) => [c, c === 'streak_last_day' ? daysAgo(u[c]) : TIME.test(c) ? ago(u[c]) : u[c]])),
    persona,
    rows: {},
  };
  for (const [t, cols] of Object.entries(TABLES)) {
    let { rows } = await db.query(`SELECT ${cols.join(', ')} FROM ${t} WHERE user_id = $1`, [u.id]);
    // Daily/weekly quest periods are tied to real dates; only story claims carry over.
    if (t === 'quest_claims') rows = rows.filter((x) => x.period_key === 'story');
    if (t === 'battles') rows = rows.filter((x) => x.status !== 'active');
    // Finished fights don't need their question decks; the column just can't be null.
    const extra = t === 'battles' ? { questions: [] } : {};
    if (rows.length) rec.rows[t] = rows.map((x) => ({ ...Object.fromEntries(cols.map((c) => [c, TIME.test(c) ? ago(x[c]) : x[c]])), ...extra }));
  }
  out.push(rec);
}
await db.end();

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, zlib.gzipSync(JSON.stringify({ version: 1, snapshotAt: new Date(nowMs).toISOString(), players: out })));
const types = out.reduce((m, p) => ({ ...m, [p.persona.type]: (m[p.persona.type] || 0) + 1 }), {});
console.log(`[export-rivals] ${out.length} players -> ${path.relative(process.cwd(), OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`, types);
