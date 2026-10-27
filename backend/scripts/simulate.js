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

// ---------------------------------------------------------------- randomness
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const chance = (p) => Math.random() < p;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function weighted(obj) {
  const total = Object.values(obj).reduce((s, v) => s + v, 0);
  let r = Math.random() * total;
  for (const [k, v] of Object.entries(obj)) { if ((r -= v) <= 0) return k; }
  return Object.keys(obj)[0];
}

// ---------------------------------------------------------------- personas
const FIRST = ['maya', 'sam', 'jo', 'alex', 'nina', 'leo', 'ava', 'kai', 'zoe', 'eli', 'mia', 'noah', 'ivy', 'omar', 'liam', 'emma', 'raj', 'sofia', 'theo', 'luna', 'max', 'aria', 'jay', 'ella', 'dev', 'nora', 'ben', 'lily', 'cole', 'ruby', 'ezra', 'jade', 'finn', 'isla', 'arjun', 'priya', 'diego', 'lucia', 'mateo', 'chloe', 'tyler', 'grace', 'ryan', 'hana', 'yuki', 'kofi', 'amara', 'sean', 'tess', 'drew'];
const WORDS = ['stocks', 'invests', 'trader', 'bull', 'bear', 'money', 'cash', 'coin', 'value', 'chart', 'dip', 'hodl', 'alpha', 'gains', 'fund', 'saver', 'market', 'ticker', 'theta', 'candle', 'gold', 'wolf', 'moon', 'piggy', 'budget'];
const usedNames = new Set();
function username() {
  for (;;) {
    const f = pick(FIRST); const w = pick(WORDS); const n = Math.floor(rand(1, 2010));
    const name = weighted({ a: 3, b: 3, c: 2, d: 2, e: 1 }) === 'a' ? `${f}${n}`
      : weighted({ x: 1, y: 1 }) === 'x' ? `${f}_${w}` : chance(0.5) ? `${w}${f}${n % 100}` : `${f}${w}${n % 1000}`;
    const clean = name.slice(0, 20);
    if (clean.length >= 3 && !usedNames.has(clean)) { usedNames.add(clean); return clean; }
  }
}
const TZ = { 'America/New_York': 5, 'America/Chicago': 3, 'America/Denver': 1, 'America/Los_Angeles': 3, 'Europe/London': 1, 'Asia/Kolkata': 1 };
const TYPES = {
  // share, chance of returning on a given day, lessons per session
  tourist: { share: 0.35, stay: 0.18, pace: [1, 3] },
  casual: { share: 0.38, stay: 0.5, pace: [1, 4] },
  regular: { share: 0.21, stay: 0.8, pace: [2, 6] },
  hardcore: { share: 0.06, stay: 0.95, pace: [4, 10] },
};
function persona() {
  const type = weighted(Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [k, v.share])));
  const skill = Math.min(0.97, Math.max(0.35, rand(0.45, 0.9) + (type === 'hardcore' ? 0.06 : 0)));
  return {
    type,
    skill, // chance of knowing an answer
    dex: rand(0.1, 0.95), // dodging
    aim: rand(0.45, 0.95),
    grit: rand(0.3, 0.9), // retry after failing
    journaler: rand(0, 1),
    likes: { learn: rand(3, 6), arena: rand(0.5, 4), trade: rand(0.2, 3), hideout: rand(0.3, 2), quests: rand(1, 3) },
    tz: weighted(TZ),
    joinDay: 1 + Math.floor(Math.pow(Math.random(), 1.6) * Math.max(1, Math.ceil(DAYS * 0.6))),
  };
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
let CATALOG; let ITEMS; let LESSON_ORDER;
const LESSON_CACHE = new Map();
const TICKERS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'SPY', 'QQQ', 'VOO', 'DIS', 'NKE', 'KO', 'COST', 'JPM', 'AMD', 'NFLX', 'SBUX', 'F', 'T'];
const NOTES = [
  'Buying because earnings beat and the trend is above the 50 day average. Stop below last swing low.',
  'Small starter position, I like the long term story. Will add if it holds support.',
  'Trying a breakout over resistance, stop just under the breakout level.',
  'Index fund for the long run, not timing anything.',
  'Taking profit, it hit my target and RSI looks stretched.',
  'Cutting this, it broke my stop. Lesson learned about chasing.',
];

class Player {
  constructor() {
    this.p = persona();
    this.name = username();
    this.password = `${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 8)}Q7`;
    this.cookie = ''; this.token = '';
    this.known = new Map(); // question text -> correct option text (things this player has studied)
    this.active = true; this.joined = false;
    this.done = new Set(); this.examPassed = new Set();
    this.daysPlayed = 0; this.lastDay = 0;
    this.styled = false;
  }

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

  async session(day) {
    if (!this.joined) { if (day < this.p.joinDay) return; if (!(await this.signUp())) return; }
    else {
      // churn: after the first day, people come back with their type's odds, fading slowly
      const stay = TYPES[this.p.type].stay * Math.pow(0.97, day - this.p.joinDay);
      if (!chance(stay)) { if (chance(0.25)) this.active = false; return; }
      if (!(await this.refresh())) await this.login();
    }
    this.daysPlayed++; this.lastDay = day;
    const [lo, hi] = TYPES[this.p.type].pace;
    let actions = Math.round(rand(lo, hi)) + 2;
    let lessonsToday = 0;
    while (actions-- > 0) {
      const what = weighted(this.p.likes);
      try {
        if (what === 'learn') lessonsToday += await this.learn();
        else if (what === 'arena') await this.arena();
        else if (what === 'trade') await this.trade();
        else if (what === 'hideout') await this.hideout();
        else await this.quests();
      } catch (err) {
        stats.errors[`${what}: ${err.message}`] = (stats.errors[`${what}: ${err.message}`] || 0) + 1;
      }
    }
    if (lessonsToday || chance(0.5)) await this.quests();
  }

  async login() {
    const r = await this.api('POST', '/auth/login', { username: this.name, password: this.password }, { auth: false });
    if (r.data.accessToken) this.token = r.data.accessToken;
  }

  async lesson(id) {
    if (!LESSON_CACHE.has(id)) LESSON_CACHE.set(id, (await this.api('GET', `/lessons/lesson/${id}`)).data);
    return LESSON_CACHE.get(id);
  }

  study(lesson) {
    for (const s of lesson.steps || []) {
      for (const q of s.questions || (s.options ? [s] : [])) {
        if (q.options && q.answer != null && chance(this.p.skill)) this.known.set(String(q.q || '').trim(), String(q.options[q.answer]).trim());
      }
    }
  }

  /** Plays the next lesson (mostly in order; some people skip around). */
  async learn() {
    const exam = this.examReady();
    if (exam && chance(0.7)) { await this.exam(exam); return 0; }
    let next = LESSON_ORDER.find((l) => !this.done.has(l.id));
    if (chance(0.08)) next = pick(LESSON_ORDER.filter((l) => l.unit === (next?.unit || 'money')));
    if (!next) return 0;
    const lesson = await this.lesson(next.id);
    if (!lesson.steps) return 0;
    this.study(lesson);
    const quiz = lesson.steps[lesson.steps.length - 1];
    for (let attempt = 0; attempt < 3; attempt++) {
      const boost = attempt * 0.12;
      const answers = quiz.questions.map((q) => (chance(Math.min(0.98, this.p.skill + boost + 0.08)) ? q.answer : (q.answer + 1 + Math.floor(Math.random() * (q.options.length - 1))) % q.options.length));
      const r = await this.api('POST', `/lessons/lesson/${next.id}/complete`, { answers });
      if (r.data.passed) { this.done.add(next.id); return 1; }
      stats.lessonsFailed++;
      if (!chance(this.p.grit)) return 0;
    }
    return 0;
  }

  examReady() {
    for (const u of CATALOG.units) {
      if (this.examPassed.has(u.id)) continue;
      const ids = u.chapters.flatMap((c) => c.lessons.map((l) => l.id));
      if (ids.every((id) => this.done.has(id))) return u.id;
    }
    return null;
  }

  async exam(unitId) {
    const ex = (await this.api('GET', `/lessons/exam/${unitId}`)).data;
    if (!ex.token) return;
    const answers = ex.questions.map((q) => {
      const want = this.known.get(String(q.q).trim());
      const i = want ? q.options.findIndex((o) => String(o).trim() === want) : -1;
      return i >= 0 && chance(0.95) ? i : Math.floor(Math.random() * q.options.length);
    });
    const r = (await this.api('POST', `/lessons/exam/${unitId}`, { token: ex.token, answers })).data;
    stats.exams.push({ unit: unitId, score: r.score, passed: !!r.passed, type: this.p.type });
    if (r.passed) this.examPassed.add(unitId);
  }

  /** A boss fight: the real question flow, with dodging and aiming simulated from the persona. */
  async arena() {
    const list = (await this.api('GET', '/battles')).data;
    if (!list.bosses) return;
    const open = list.bosses.filter((b) => b.unlocked);
    if (!open.length) return;
    const fresh = open.filter((b) => !b.wins);
    const boss = fresh.length && chance(0.85) ? fresh[0] : pick(open);
    const start = await this.api('POST', `/battles/${boss.id}/start`);
    if (start.status !== 200) return;
    const { battleId, loadout } = start.data;
    const began = Date.now();
    const world = Math.max(1, Math.ceil((list.bosses.indexOf(boss) + 1) / 2.5));
    let bossHp = boss.hp; let hp = loadout.hp; let pips = 0; let t = 0; let correct = 0; let wrong = 0; let index = 0;
    const perPip = 30 + 3 * (loadout.stats.power || 0);
    const armor = 1 - Math.min(0.6, 0.03 * (loadout.stats.defense || 0));
    const pressure = (1.6 + world * 0.9) * (1.15 - this.p.dex) * armor; // HP lost per second of open fighting
    const regen = boss.mechanic?.type === 'regen' ? 1 : 0;
    let result = 'lost';
    while (t < 300) {
      // Focus Time: a real question from the server
      const q = (await this.api('POST', `/battles/${battleId}/next`)).data;
      if (!q.options) break;
      const want = this.known.get(String(q.q).trim());
      const known = want ? q.options.findIndex((o) => String(o).trim() === want) : -1;
      const choice = known >= 0 && chance(0.93) ? known : Math.floor(Math.random() * q.options.length);
      const a = (await this.api('POST', `/battles/${battleId}/answer`, { index, choice })).data;
      index++;
      const think = rand(3, 9);
      t += think; hp -= pressure * think * 0.2; // time runs at 20% while thinking
      if (a.correct) { correct++; pips = Math.min(3, pips + 1); } else { wrong++; pips = Math.max(0, pips - 1); }
      // open fighting between questions
      const fight = rand(3, 7);
      t += fight; hp -= pressure * fight * rand(0.6, 1.4); bossHp = Math.min(boss.hp, bossHp + regen * fight);
      if (pips === 3) { if (chance(this.p.aim)) bossHp -= 3 * perPip * (chance(0.03) ? 2 : 1); pips = 0; }
      if (bossHp <= 0) { result = 'won'; break; }
      if (hp <= 0) break;
      if (chance(0.01)) { result = 'abandoned'; break; }
    }
    // A real fight takes real time; the server also refuses wins under 20s.
    const wait = Math.max(21000, Math.min(t * 1000 * 0.5, 70000)) - (Date.now() - began);
    if (wait > 0) await sleep(wait);
    const fin = await this.api('POST', `/battles/${battleId}/finish`, { result, damageTaken: Math.max(0, Math.round(loadout.hp - Math.max(0, hp))) });
    stats.fights.push({ boss: boss.id, result, accepted: fin.status === 200, correct, wrong, simSeconds: Math.round(t), type: this.p.type, power: loadout.stats.power, coins: fin.data.coins || 0 });
  }

  async trade() {
    const ports = (await this.api('GET', '/portfolio')).data;
    const manual = Array.isArray(ports) ? ports.find((p) => p.portfolioType === 'manual') : null;
    if (!manual) return;
    const pid = manual.portfolioId;
    const positions = (await this.api('GET', `/portfolio/${pid}/positions`)).data;
    const writes = chance(this.p.journaler);
    if (Array.isArray(positions) && positions.length && chance(0.35)) {
      const pos = pick(positions);
      const r = await this.api('POST', `/portfolio/${pid}/close/${pos.id}`, writes ? { reasoning: pick(NOTES.slice(4)) } : {});
      if (r.status === 200) stats.trades++;
      return;
    }
    const r = await this.api('POST', `/portfolio/${pid}/trade`, {
      symbol: pick(TICKERS), action: 'BUY', quantity: Math.ceil(rand(1, 20)), orderType: 'market',
      ...(writes ? { reasoning: pick(NOTES.slice(0, 4)) } : {}),
    });
    if (r.status === 200) stats.trades++;
    if (chance(0.15)) {
      await this.api('POST', '/portfolio/analysis', { symbol: pick(TICKERS), verdict: pick(['BUY', 'HOLD', 'AVOID']), trendAssessment: pick(['uptrend', 'downtrend', 'sideways']), reasoning: 'Looked at the trend, support and resistance, and the earnings growth before deciding.' });
    }
  }

  async hideout() {
    const st = (await this.api('GET', '/game/state')).data;
    if (!st.inventory) return;
    if (!this.styled && chance(0.6)) {
      this.styled = true;
      await this.api('PUT', '/game/appearance', {
        skin: pick(CATALOG.appearance.skin), hairStyle: pick(CATALOG.appearance.hairStyle), hairColor: pick(CATALOG.appearance.hairColor),
        eyeColor: pick(CATALOG.appearance.eyeColor), shirt: pick(CATALOG.appearance.shirt), pants: pick(CATALOG.appearance.pants), shoes: pick(CATALOG.appearance.shoes),
      });
    }
    const owned = new Set(st.inventory.map((i) => i.id));
    const shop = ITEMS.filter((i) => i.unlockKind === 'shop' && st.unlockedWorlds.includes(i.world) && !owned.has(i.id) && i.price <= st.coins);
    if (shop.length && chance(0.6)) {
      // most people buy what looks strongest they can afford; some buy for looks
      const score = (i) => Object.values(i.stats || {}).reduce((s, v) => s + v, 0) + (i.effects?.length || 0) * 1.5;
      const choice = chance(0.7) ? shop.sort((a, b) => score(b) - score(a))[0] : pick(shop);
      const r = await this.api('POST', '/game/buy', { itemId: choice.id });
      if (r.status === 200) { stats.buys++; owned.add(choice.id); }
    }
    // equip the best owned item per slot
    const score = (i) => Object.values(i.stats || {}).reduce((s, v) => s + v, 0) + (i.effects?.length || 0) * 1.5;
    for (const slot of CATALOG.slots) {
      const mine = ITEMS.filter((i) => i.slot === slot && owned.has(i.id)).sort((a, b) => score(b) - score(a));
      if (mine[0] && st.equipment[slot] !== mine[0].id && chance(0.8)) await this.api('PUT', '/game/equip', { slot, itemId: mine[0].id });
    }
  }

  async quests() {
    const b = (await this.api('GET', '/quests')).data;
    if (!b.daily) return;
    for (const q of [...b.daily, ...b.weekly, ...b.story]) {
      if (q.done && !q.claimed && chance(0.9)) {
        const r = await this.api('POST', `/quests/${q.id}/claim`);
        if (r.status === 200) stats.claims++;
      }
    }
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
  CATALOG = { ...(await (await fetch(`${BASE}/lessons/catalog`)).json()), ...(await (await fetch(`${BASE}/game/catalog`)).json()) };
  CATALOG.appearance ||= (await import('../services/game.js')).APPEARANCE;
  ITEMS = CATALOG.items;
  LESSON_ORDER = CATALOG.units.flatMap((u) => u.chapters.flatMap((c) => c.lessons.map((l) => ({ id: l.id, unit: u.id }))));
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
