#!/usr/bin/env node
// Player simulator: N virtual players use the real API the way people do, over
// several simulated days, then prints a report on progression, bosses, the
// coin economy and retention. Use it to tune balance before real players do.
//
//   npm run simulate -- --bots 1000 --days 14
//
// It runs against its OWN database (tradeiq_sim) and its own server on port
// 3002, never your dev data and never production. Each simulated day ends by
// moving every timestamp in the sim database back 24 hours, so streaks, daily
// quests and "3 days later" reviews behave as if real days passed.
//
// Options: --bots N  --days N  --concurrency N  --keep (reuse the existing sim
// database instead of starting fresh)  --report path.json
import { spawn, execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import { Brain, makePersona, makeUsername, stayOdds, chance, sleep } from '../services/rivalBrain.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return acc;
}, []));
const BOTS = Number(args.bots || 1000);
const DAYS = Number(args.days || 14);
const CONC = Number(args.concurrency || 150);
const PORT = Number(args.port || 3002);
const BASE = `http://127.0.0.1:${PORT}/api`;
const REPORT = args.report || path.join(ROOT, '..', 'docs', 'sim', `report-${new Date().toISOString().slice(0, 10)}.json`);

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run: NODE_ENV=production. The simulator only runs locally.');
  process.exit(1);
}
const baseUrl = new URL(process.env.DATABASE_URL || '');
if (!['localhost', '127.0.0.1'].includes(baseUrl.hostname)) {
  console.error(`Refusing to run: DATABASE_URL points at ${baseUrl.hostname}, not a local database.`);
  process.exit(1);
}
const simUrl = new URL(baseUrl); simUrl.pathname = '/tradeiq_sim';
const adminUrl = new URL(baseUrl); adminUrl.pathname = '/postgres';

// ---------------------------------------------------------------- personas
const usedNames = new Set();
function persona() {
  return { ...makePersona(), joinDay: 1 + Math.floor(Math.pow(Math.random(), 1.6) * Math.max(1, Math.ceil(DAYS * 0.6))) };
}

// ---------------------------------------------------------------- sim server + database
async function setupDatabase() {
  const admin = new pg.Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  const exists = (await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', ['tradeiq_sim'])).rows.length;
  if (exists && !args.keep) {
    await admin.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'tradeiq_sim'`);
    await admin.query('DROP DATABASE tradeiq_sim');
  }
  if (!exists || !args.keep) await admin.query(`CREATE DATABASE tradeiq_sim OWNER "${baseUrl.username}"`);
  await admin.end();
  execFileSync(process.execPath, [path.join(__dirname, 'migrate.js')], { env: { ...process.env, DATABASE_URL: simUrl.toString() }, stdio: 'ignore' });
}

function startServer() {
  const child = spawn(process.execPath, [path.join(ROOT, 'server.js')], {
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL: simUrl.toString(), PORT: String(PORT), SIM_NO_RATE_LIMIT: '1', NODE_ENV: 'development', APP_URL: `http://127.0.0.1:${PORT}` },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const log = fs.createWriteStream(path.join(ROOT, '.sim-server.log'));
  child.stdout.pipe(log); child.stderr.pipe(log);
  return child;
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`${BASE}/lessons/catalog`)).ok) return; } catch { /* starting */ }
    await sleep(500);
  }
  throw new Error('Sim server did not start; see backend/.sim-server.log');
}

/** Moves every timestamp in the sim database back one day = one day passes. */
async function advanceDay(db) {
  const cols = (await db.query(
    `SELECT table_name, column_name, data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND data_type IN ('timestamp with time zone', 'timestamp without time zone', 'date')
       AND table_name NOT LIKE '%migrations%'`
  )).rows;
  const byTable = {};
  for (const c of cols) (byTable[c.table_name] ||= []).push(c);
  for (const [t, cs] of Object.entries(byTable)) {
    const sets = cs.map((c) => (c.data_type === 'date' ? `"${c.column_name}" = "${c.column_name}" - 1` : `"${c.column_name}" = "${c.column_name}" - INTERVAL '1 day'`));
    await db.query(`UPDATE "${t}" SET ${sets.join(', ')}`);
  }
}

// ---------------------------------------------------------------- one player
const stats = { requests: 0, errors: {}, fights: [], exams: [], lessonsFailed: 0, trades: 0, buys: 0, claims: 0 };
const shared = { catalog: null, lessonCache: new Map(), stats, fastFights: true };

class Player {
  constructor() {
    this.p = persona();
    this.name = makeUsername(usedNames);
    this.password = `${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 8)}Q7`;
    this.cookie = ''; this.token = '';
    this.active = true; this.joined = false;
    this.daysPlayed = 0; this.lastDay = 0;
    this.brain = new Brain({ persona: this.p, api: (m, u, body) => this.api(m, u, body), shared });
  }

  get done() { return this.brain.done; }

  async api(method, url, body, { auth = true } = {}) {
    for (let attempt = 0; attempt < 2; attempt++) {
      stats.requests++;
      const res = await fetch(BASE + url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(auth && this.token ? { Authorization: `Bearer ${this.token}` } : {}), ...(this.cookie ? { Cookie: this.cookie } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      }).catch((err) => ({ ok: false, status: 0, err }));
      if (!res.status) { stats.errors.network = (stats.errors.network || 0) + 1; return { status: 0, data: {} }; }
      const set = res.headers.get('set-cookie');
      if (set) this.cookie = set.split(';')[0];
      const data = res.headers.get('content-type')?.includes('json') ? await res.json() : {};
      if (res.status === 401 && auth && attempt === 0 && await this.refresh()) continue;
      if (res.status >= 500) { const k = `${method} ${url.replace(/[0-9a-f-]{36}|\d+/g, ':id')} ${res.status}`; stats.errors[k] = (stats.errors[k] || 0) + 1; }
      return { status: res.status, data };
    }
    return { status: 401, data: {} };
  }

  async refresh() {
    const r = await fetch(`${BASE}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: this.cookie } });
    const set = r.headers.get('set-cookie');
    if (set) this.cookie = set.split(';')[0];
    if (!r.ok) return false;
    this.token = (await r.json()).accessToken;
    return true;
  }

  async signUp() {
    const r = await this.api('POST', '/auth/register', { username: this.name, password: this.password, acceptTerms: true, confirmAge: true }, { auth: false });
    if (r.status !== 201) { this.active = false; return false; }
    this.token = r.data.accessToken;
    this.id = r.data.user.id;
    await this.api('PATCH', '/me', { timezone: this.p.tz });
    this.joined = true;
    return true;
  }

  async login() {
    const r = await this.api('POST', '/auth/login', { username: this.name, password: this.password }, { auth: false });
    if (r.data.accessToken) this.token = r.data.accessToken;
  }

  async session(day) {
    if (!this.joined) { if (day < this.p.joinDay) return; if (!(await this.signUp())) return; }
    else {
      // after the first day, people come back with their type's odds, fading slowly
      if (!chance(stayOdds(this.p, day - this.p.joinDay))) { if (chance(0.25)) this.active = false; return; }
      if (!(await this.refresh())) await this.login();
    }
    this.daysPlayed++; this.lastDay = day;
    await this.brain.play();
  }
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const it = items[i++]; await fn(it); }
  }));
}

// ---------------------------------------------------------------- report
async function report(db, players) {
  const one = async (sql, p = []) => (await db.query(sql, p)).rows;
  const users = (await one('SELECT COUNT(*)::int AS n FROM users'))[0].n;
  const lessonDist = await one(`SELECT width_bucket(n, 0, 120, 6) AS b, COUNT(*)::int AS players FROM (SELECT u.id, COUNT(lc.id) AS n FROM users u LEFT JOIN lesson_completions lc ON lc.user_id = u.id GROUP BY u.id) t GROUP BY 1 ORDER BY 1`);
  const exams = await one(`SELECT unit_id, COUNT(*) FILTER (WHERE passed)::int AS passed, COUNT(*)::int AS players, ROUND(AVG(best_score)) AS avg_best FROM unit_exams GROUP BY unit_id`);
  const bosses = await one(`SELECT boss_id, COUNT(*)::int AS fights, COUNT(*) FILTER (WHERE status='won')::int AS wins, COUNT(DISTINCT user_id) FILTER (WHERE status='won')::int AS beaten_by, ROUND(AVG(correct)) AS avg_correct FROM battles GROUP BY boss_id ORDER BY boss_id`);
  const coins = await one(`SELECT percentile_cont(ARRAY[0.1,0.5,0.9]) WITHIN GROUP (ORDER BY coins) AS p, MAX(coins) AS max FROM users`);
  const coinFlow = await one(`SELECT reason, SUM(amount)::int AS total, COUNT(*)::int AS events FROM coin_events GROUP BY reason ORDER BY total DESC`);
  const xp = await one(`SELECT source, SUM(amount)::int AS total FROM xp_events GROUP BY source ORDER BY total DESC`);
  const levels = await one(`SELECT percentile_cont(ARRAY[0.1,0.5,0.9]) WITHIN GROUP (ORDER BY xp) AS p FROM users`);
  const streaks = await one(`SELECT percentile_cont(ARRAY[0.5,0.9]) WITHIN GROUP (ORDER BY streak_best) AS p, MAX(streak_best) AS max FROM users`);
  const items = await one(`SELECT item_id, COUNT(*)::int AS owners FROM user_items WHERE source = 'shop' GROUP BY item_id ORDER BY owners DESC LIMIT 10`);
  const quests = await one(`SELECT quest_id, COUNT(*)::int AS claims FROM quest_claims GROUP BY quest_id ORDER BY claims DESC LIMIT 10`);
  const retention = {};
  for (const d of [1, 3, 7, 14].filter((x) => x < DAYS)) {
    const eligible = players.filter((p) => p.joined && p.p.joinDay + d <= DAYS);
    retention[`D${d}`] = eligible.length ? Math.round((100 * eligible.filter((p) => p.lastDay >= p.p.joinDay + d).length) / eligible.length) : null;
  }
  const byType = {};
  for (const p of players.filter((x) => x.joined)) {
    const t = (byType[p.p.type] ||= { players: 0, lessons: 0, days: 0 });
    t.players++; t.lessons += p.done.size; t.days += p.daysPlayed;
  }
  for (const t of Object.values(byType)) { t.avgLessons = Math.round(t.lessons / t.players); t.avgDays = +(t.days / t.players).toFixed(1); delete t.lessons; delete t.days; }
  const fightsByBoss = {};
  for (const f of stats.fights) {
    const b = (fightsByBoss[f.boss] ||= { fights: 0, won: 0, rejected: 0, avgSimSeconds: 0 });
    b.fights++; if (f.result === 'won' && f.accepted) b.won++; if (f.result === 'won' && !f.accepted) b.rejected++; b.avgSimSeconds += f.simSeconds;
  }
  for (const b of Object.values(fightsByBoss)) { b.winRate = Math.round((100 * b.won) / b.fights); b.avgSimSeconds = Math.round(b.avgSimSeconds / b.fights); }
  return {
    ranAt: new Date().toISOString(), bots: BOTS, days: DAYS, users, requests: stats.requests,
    retention, byType, lessonsPerPlayer: lessonDist, exams, bosses, fightsByBoss,
    coinsNow: coins[0], coinFlow, xpBySource: xp, xpPercentiles: levels[0].p, streaks: streaks[0],
    topShopItems: items, topQuests: quests, lessonsFailed: stats.lessonsFailed, trades: stats.trades, itemsBought: stats.buys, questClaims: stats.claims,
    serverErrors: stats.errors,
  };
}

// ---------------------------------------------------------------- main
console.log(`[sim] ${BOTS} players, ${DAYS} days, concurrency ${CONC}`);
await setupDatabase();
const server = startServer();
const stop = () => { try { server.kill(); } catch { /* gone */ } };
process.on('SIGINT', () => { stop(); process.exit(130); });
try {
  await waitForServer();
  shared.catalog = { ...(await (await fetch(`${BASE}/lessons/catalog`)).json()), ...(await (await fetch(`${BASE}/game/catalog`)).json()) };
  shared.catalog.appearance ||= (await import('../services/game.js')).APPEARANCE;
  const db = new pg.Client({ connectionString: simUrl.toString() });
  await db.connect();
  const players = Array.from({ length: BOTS }, () => new Player());
  for (let day = 1; day <= DAYS; day++) {
    const t0 = Date.now();
    const today = players.filter((p) => p.active && (p.joined || p.p.joinDay === day));
    await pool(today.sort(() => Math.random() - 0.5), CONC, (p) => p.session(day).catch((err) => { stats.errors[err.message] = (stats.errors[err.message] || 0) + 1; }));
    const playedToday = players.filter((p) => p.lastDay === day).length;
    console.log(`[sim] day ${day}/${DAYS}: ${playedToday} played, ${players.filter((p) => p.joined).length} signed up, ${stats.fights.length} fights so far (${Math.round((Date.now() - t0) / 1000)}s)`);
    if (day < DAYS) await advanceDay(db);
  }
  const out = await report(db, players);
  await db.end();
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(out, null, 2));
  console.log(JSON.stringify({ retention: out.retention, byType: out.byType, fightsByBoss: out.fightsByBoss, exams: out.exams, coinsNow: out.coinsNow, serverErrors: out.serverErrors }, null, 1));
  console.log(`[sim] full report: ${REPORT}`);
} finally {
  stop();
}
