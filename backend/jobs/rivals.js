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
import { UNITS, bossPool } from '../content/index.js';
import { onlineUsers, presenceChanged } from '../services/presence.js';
import { Brain, stayOdds, makePersona, makeUsername, pick, chance } from '../services/rivalBrain.js';

const BASE = () => `http://127.0.0.1:${config.port}/api`;
const AT_ONCE = 6;
const shared = { catalog: null, lessonCache: new Map(), stats: { errors: {} }, examBank: examBank() };

/** question text -> right answer, for every unit exam question (see Brain.exam). */
function examBank() {
  const bank = new Map();
  for (const u of UNITS) for (const q of bossPool(u.id)) bank.set(String(q.q).trim(), String(q.options[q.answer]).trim());
  return bank;
}

// ---------------------------------------------------------------- presence
// Rivals show up in "Online now" while they play, and browse for a while after.
const PAGE_FOR = [[/^\/lessons/, 'learn'], [/^\/battles/, 'arena'], [/^\/quests/, 'arena'], [/^\/game/, 'hideout'], [/^\/portfolio/, 'trade']];
const lingerTimers = new Map();

function goOnline(rival, page = 'learn') {
  const now = new Date().toISOString();
  const cur = onlineUsers.get(rival.user_id);
  if (cur && cur.socketId !== 'rival') return; // a real socket for this id wins
  clearTimeout(lingerTimers.get(rival.user_id));
  onlineUsers.set(rival.user_id, { username: rival.username, socketId: 'rival', connectedAt: cur?.connectedAt || now, lastActivity: now, currentPage: page });
  presenceChanged();
}
function setPage(userId, page) {
  const info = onlineUsers.get(userId);
  if (info?.socketId === 'rival' && info.currentPage !== page) { info.currentPage = page; info.lastActivity = new Date().toISOString(); presenceChanged(); }
}
function goOfflineIn(userId, ms) {
  clearTimeout(lingerTimers.get(userId));
  lingerTimers.set(userId, setTimeout(() => {
    lingerTimers.delete(userId);
    if (onlineUsers.get(userId)?.socketId === 'rival') { onlineUsers.delete(userId); presenceChanged(); }
  }, ms));
}
const rivalsOnline = () => [...onlineUsers.values()].filter((i) => i.socketId === 'rival').length;

/** How many rivals should be around at this hour (New York time): busy evenings, quiet nights. */
function onlineTarget(now = localNow('America/New_York')) {
  const h = Math.floor(now.minute / 60);
  const base = h < 6 ? 3 : h < 9 ? 6 : h < 15 ? 10 : h < 23 ? 16 : 6;
  return base + Math.floor(unit(`online:${now.day}:${h}`) * 6);
}
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
  // Brand-new players always try it out the day they sign up, a few minutes in.
  const ageMin = (Date.now() - new Date(rival.created_at).getTime()) / 60000;
  if (ageMin < 24 * 60 && !rival.last_played_day) return ageMin >= 2;
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
    const page = PAGE_FOR.find(([re]) => re.test(url));
    if (page && !rival.browseOnly) setPage(rival.user_id, page[1]);
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
  goOnline(rival, rival.browseOnly ? pick(['learn', 'learn', 'hideout', 'arena', 'ranks', 'trade', 'me']) : 'learn');
  try {
    await brain.loadProgress();
    if (rival.browseOnly) await brain.quests();
    else await brain.play();
  } finally {
    // stick around a few minutes after, like people do
    goOfflineIn(rival.user_id, (rival.browseOnly ? 8 + crypto.randomInt(18) : 3 + crypto.randomInt(13)) * 60000);
  }
}

/** Keeps a believable number of rivals online: tops up with short browsing visits. */
async function keepCompany(rows, run) {
  const need = onlineTarget() - rivalsOnline();
  if (need <= 0) return;
  const idle = rows.filter((r) => !onlineUsers.has(r.user_id));
  for (let i = 0; i < Math.min(need, 4) && idle.length; i++) {
    const r = idle.splice(crypto.randomInt(idle.length), 1)[0];
    run({ ...r, browseOnly: true });
  }
}

// ---------------------------------------------------------------- new signups
// New rivals join every day (10-40, set per day), spread from 8:00 to
// 23:00 New York time, so the player count keeps growing like a real site.
let lockedHash = null;

function signupPlan(now = localNow('America/New_York')) {
  const total = 10 + Math.floor(unit(`signups:${now.day}`) * 31); // 10-40 a day
  const open = 8 * 60; const close = 23 * 60;
  const frac = Math.max(0, Math.min(1, (now.minute - open) / (close - open)));
  return { day: now.day, total, dueByNow: Math.floor(total * frac + 1e-9) };
}

/** `now` is only for tests: { day: 'YYYY-MM-DD', minute } in New York time. */
export async function signUpRivals(now) {
  const plan = signupPlan(now);
  const { rows } = await query(
    `SELECT COUNT(*)::int AS n FROM ai_rivals
     WHERE persona->>'joined' = 'live' AND (created_at AT TIME ZONE 'America/New_York')::date = $1::date`,
    [plan.day]
  );
  let missing = plan.dueByNow - rows[0].n;
  if (missing <= 0) return 0;
  missing = Math.min(missing, 3); // at most a few per tick, so they don't arrive in a clump
  lockedHash ||= await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
  const taken = new Set((await query('SELECT LOWER(username) AS u FROM users')).rows.map((r) => r.u));
  for (let i = 0; i < missing; i++) {
    const persona = { ...makePersona(), joined: 'live' };
    const name = makeUsername(taken);
    const look = chance(0.6) ? Object.fromEntries(Object.entries(APPEARANCE).map(([k, opts]) => [k, pick(opts)])) : {};
    await withTransaction(async (db) => {
      const ins = await db.query(
        `INSERT INTO users (username, email, password_hash, role, email_verified, recovery_code_hash, terms_accepted_at, terms_version,
           age_confirmed, email_unsubscribe_token, email_opt_in, timezone, avatar_config, last_login, is_bot)
         VALUES ($1, NULL, $2, 'user', FALSE, $2, NOW(), $3, TRUE, $4, FALSE, $5, $6, NOW(), TRUE) RETURNING id`,
        [name, lockedHash, config.termsVersion, crypto.randomBytes(24).toString('hex'), persona.tz, JSON.stringify(look)]
      );
      const id = ins.rows[0].id;
      await db.query(
        `INSERT INTO portfolios (user_id, portfolio_type, name, starting_capital, cash)
         VALUES ($1, 'manual', 'My Trading Desk', 50000, 50000), ($1, 'ai', 'Bolt the Bot', 100000, 100000)`,
        [id]
      );
      await db.query('INSERT INTO ai_rivals (user_id, persona) VALUES ($1, $2)', [id, JSON.stringify(persona)]);
    });
  }
  return missing;
}

const browsing = new Set();

/** `force` (tests/manual runs): play up to `force` rivals now, ignoring the schedule. */
export async function runRivalsTick({ force = 0 } = {}) {
  try {
    // These run every tick, even while a long batch of play sessions is still going.
    await signUpRivals().catch((err) => console.error('[rivals] signups failed:', err.message));
    const { rows } = await query(
      `SELECT r.user_id, r.persona, r.last_played_day::text AS last_played_day, u.created_at, u.username
       FROM ai_rivals r JOIN users u ON u.id = r.user_id WHERE r.active AND u.is_active AND u.is_bot`
    );
    if (!shared.catalog) await loadCatalog();
    await keepCompany(rows, (r) => {
      if (browsing.has(r.user_id)) return;
      browsing.add(r.user_id);
      playSession(r).catch((err) => console.error(`[rivals] ${r.username}: ${err.message}`)).finally(() => browsing.delete(r.user_id));
    });

    if (running) return;
    running = true;
    const due = force ? rows.slice(0, force) : rows.filter((r) => { try { return isDue(r); } catch { return false; } });
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
    running = false;
  } catch (err) {
    running = false;
    console.error('[rivals] tick failed:', err.message);
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
