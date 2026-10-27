// Drives the AI rivals (see db/migrations/006_ai_rivals.sql). Every few
// minutes, rivals whose turn it is play one session through the site's own
// API, so they earn exactly what a person would for the same play.
//
// Who plays when is derived from a hash of (rival, local date): stable across
// restarts and deploys, spread through each rival's waking hours, and never
// more than one session per rival per day. Turn on with RIVALS_ENABLED=1.
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import cron from 'node-cron';
import { query, withTransaction } from '../db/pool.js';
import { config } from '../config.js';
import { signAccessToken } from '../services/tokens.js';
import { APPEARANCE } from '../services/game.js';
import { Brain, stayOdds } from '../services/rivalBrain.js';

const BASE = () => `http://127.0.0.1:${config.port}/api`;
const AT_ONCE = 4;
const shared = { catalog: null, lessonCache: new Map(), stats: { errors: {} } };
let running = false;

function unit(seed) {
  return parseInt(crypto.createHash('sha256').update(seed).digest('hex').slice(0, 8), 16) / 0xffffffff;
}

function localNow(tz) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { day: `${parts.year}-${parts.month}-${parts.day}`, minute: Number(parts.hour) * 60 + Number(parts.minute) };
}

/** True when this rival should start today's session now. */
export function isDue(rival, now = localNow(rival.persona.tz || 'America/New_York')) {
  if (rival.last_played_day === now.day) return false;
  const daysIn = Math.floor((Date.now() - new Date(rival.created_at).getTime()) / 86400000);
  if (unit(`${rival.user_id}:${now.day}:play`) >= stayOdds(rival.persona, daysIn)) return false;
  const start = 7 * 60 + Math.floor(unit(`${rival.user_id}:${now.day}:at`) * 16.5 * 60); // 7:00 to 23:30 local
  return now.minute >= start;
}

async function loadCatalog() {
  const [lessons, game] = await Promise.all([
    fetch(`${BASE()}/lessons/catalog`).then((r) => r.json()),
    fetch(`${BASE()}/game/catalog`).then((r) => r.json()),
  ]);
  shared.catalog = { ...lessons, ...game, appearance: APPEARANCE };
}

async function playSession(rival) {
  const user = { id: rival.user_id, username: rival.username, role: 'user' };
  const api = async (method, url, body) => {
    const res = await fetch(BASE() + url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${signAccessToken(user)}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = res.headers.get('content-type')?.includes('json') ? await res.json() : {};
    return { status: res.status, data };
  };
  // Rivals never trade: that would spend real market-data quota on bots.
  const brain = new Brain({ persona: rival.persona, api, shared, allowTrade: false });
  brain.styled = true;
  // Playing counts as being active, like a person logging in.
  await query('UPDATE users SET last_login = NOW() WHERE id = $1', [rival.user_id]);
  await brain.loadProgress();
  await brain.play();
}

/** `force` (tests/manual runs): play up to `force` rivals now, ignoring the schedule. */
export async function runRivalsTick({ force = 0 } = {}) {
  if (running) return;
  running = true;
  try {
    const { rows } = await query(
      `SELECT r.user_id, r.persona, r.last_played_day::text AS last_played_day, u.created_at, u.username
       FROM ai_rivals r JOIN users u ON u.id = r.user_id WHERE r.active AND u.is_active AND u.is_bot`
    );
    const due = force ? rows.slice(0, force) : rows.filter((r) => { try { return isDue(r); } catch { return false; } });
    if (!due.length) return;
    if (!shared.catalog) await loadCatalog();
    let i = 0;
    await Promise.all(Array.from({ length: Math.min(AT_ONCE, due.length) }, async () => {
      while (i < due.length) {
        const r = due[i++];
        const today = localNow(r.persona.tz || 'America/New_York').day;
        // Mark first, so a crash or redeploy mid-session can't double-play the day.
        await query('UPDATE ai_rivals SET last_played_day = $1 WHERE user_id = $2', [today, r.user_id]);
        await playSession(r).catch((err) => console.error(`[rivals] ${r.username}: ${err.message}`));
      }
    }));
  } catch (err) {
    console.error('[rivals] tick failed:', err.message);
  } finally {
    running = false;
  }
}

// ---------------------------------------------------------------- one-time import
const SEED = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content', 'rivals', 'seed.json.gz');
const TIME = /(_at|_login)$/;

/**
 * Imports content/rivals/seed.json.gz (scripts/export-rivals.js) when there are
 * no rivals yet. Rivals can't log in: their password is a random secret that
 * is thrown away.
 */
export async function seedRivals() {
  if (!fs.existsSync(SEED)) return 0;
  if ((await query('SELECT 1 FROM ai_rivals LIMIT 1')).rows.length) return 0;
  const { players } = JSON.parse(zlib.gunzipSync(fs.readFileSync(SEED)).toString('utf8'));
  const lockedHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
  const nowMs = Date.now();
  const at = (secsAgo) => (secsAgo == null ? null : new Date(nowMs - secsAgo * 1000).toISOString());
  const taken = new Set((await query('SELECT LOWER(username) AS u FROM users')).rows.map((r) => r.u));
  let added = 0;
  for (const p of players) {
    // Spread signups over about a month: shift this rival's whole history back 0-21 days.
    const shift = crypto.randomInt(22) * 86400;
    for (const k of ['created_at', 'last_login']) if (p.user[k] != null) p.user[k] += shift;
    if (p.user.streak_last_day != null) p.user.streak_last_day += shift / 86400;
    for (const rows of Object.values(p.rows)) for (const r of rows) for (const c of Object.keys(r)) if (TIME.test(c) && r[c] != null) r[c] += shift;
    let name = p.user.username;
    while (taken.has(name.toLowerCase())) name = `${name.slice(0, 16)}${Math.floor(Math.random() * 1000)}`;
    taken.add(name.toLowerCase());
    const u = p.user;
    await withTransaction(async (db) => {
      const ins = await db.query(
        `INSERT INTO users (username, email, password_hash, role, email_verified, recovery_code_hash, terms_accepted_at, terms_version,
           age_confirmed, email_unsubscribe_token, email_opt_in, timezone, avatar, avatar_config, xp, coins, streak_current, streak_best,
           streak_last_day, streak_freezes, owned_avatars, created_at, last_login, is_bot)
         VALUES ($1, NULL, $2, 'user', FALSE, $2, $3, $4, TRUE, $5, FALSE, $6, $7, $8, $9, $10, $11, $12,
           CASE WHEN $13::int IS NULL THEN NULL ELSE CURRENT_DATE - $13::int END, $14, $15, $16, $17, TRUE)
         RETURNING id`,
        [name, lockedHash, at(u.created_at), config.termsVersion, crypto.randomBytes(24).toString('hex'), u.timezone || 'America/New_York',
          u.avatar || 'chip', JSON.stringify(u.avatar_config || {}), u.xp || 0, u.coins || 0, u.streak_current || 0, u.streak_best || 0,
          u.streak_last_day, u.streak_freezes || 0, u.owned_avatars || ['chip', 'penny'], at(u.created_at), at(u.last_login)]
      );
      const id = ins.rows[0].id;
      await db.query(
        `INSERT INTO portfolios (user_id, portfolio_type, name, starting_capital, cash)
         VALUES ($1, 'manual', 'My Trading Desk', 50000, 50000), ($1, 'ai', 'Bolt the Bot', 100000, 100000)`,
        [id]
      );
      for (const [table, rows] of Object.entries(p.rows)) {
        const cols = Object.keys(rows[0]);
        const data = rows.map((r) => Object.fromEntries(cols.map((c) => [c, TIME.test(c) ? at(r[c]) : r[c]])))
          .map((r) => ({ ...r, user_id: id }));
        const list = ['user_id', ...cols].map((c) => `"${c}"`).join(', ');
        await db.query(`INSERT INTO ${table} (${list}) SELECT ${list} FROM json_populate_recordset(NULL::${table}, $1) ON CONFLICT DO NOTHING`, [JSON.stringify(data)]);
      }
      await db.query('INSERT INTO ai_rivals (user_id, persona) VALUES ($1, $2)', [id, JSON.stringify(p.persona)]);
    });
    added++;
  }
  console.log(`[rivals] imported ${added} AI rivals`);
  return added;
}

export function startRivalJobs() {
  if (process.env.RIVALS_ENABLED !== '1') return;
  seedRivals().catch((err) => console.error('[rivals] import failed:', err.message));
  cron.schedule('*/5 * * * *', () => { runRivalsTick(); });
  console.log('[rivals] AI rivals enabled');
}
