// How a virtual player behaves. Shared by the player simulator
// (scripts/simulate.js) and the live AI rivals (jobs/rivals.js), so what we
// measure in simulation is what rivals actually do on the site.
//
// A Brain plays through the real HTTP API: lessons are graded, fights are
// checked and rewards are paid by exactly the same code as for people.

export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const chance = (p) => Math.random() < p;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export function weighted(obj) {
  const total = Object.values(obj).reduce((s, v) => s + v, 0);
  let r = Math.random() * total;
  for (const [k, v] of Object.entries(obj)) { if ((r -= v) <= 0) return k; }
  return Object.keys(obj)[0];
}

// ---------------------------------------------------------------- personas
const FIRST = ['maya', 'sam', 'jo', 'alex', 'nina', 'leo', 'ava', 'kai', 'zoe', 'eli', 'mia', 'noah', 'ivy', 'omar', 'liam', 'emma', 'raj', 'sofia', 'theo', 'luna', 'max', 'aria', 'jay', 'ella', 'dev', 'nora', 'ben', 'lily', 'cole', 'ruby', 'ezra', 'jade', 'finn', 'isla', 'arjun', 'priya', 'diego', 'lucia', 'mateo', 'chloe', 'tyler', 'grace', 'ryan', 'hana', 'yuki', 'kofi', 'amara', 'sean', 'tess', 'drew'];
const WORDS = ['stocks', 'invests', 'trader', 'bull', 'bear', 'money', 'cash', 'coin', 'value', 'chart', 'dip', 'hodl', 'alpha', 'gains', 'fund', 'saver', 'market', 'ticker', 'theta', 'candle', 'gold', 'wolf', 'moon', 'piggy', 'budget'];

/** A plausible, valid username (^[A-Za-z0-9_]{3,20}$) not in `taken`. */
export function makeUsername(taken = new Set()) {
  for (;;) {
    const f = pick(FIRST); const w = pick(WORDS); const n = Math.floor(rand(1, 2010));
    const name = weighted({ a: 3, b: 3, c: 2, d: 2, e: 1 }) === 'a' ? `${f}${n}`
      : weighted({ x: 1, y: 1 }) === 'x' ? `${f}_${w}` : chance(0.5) ? `${w}${f}${n % 100}` : `${f}${w}${n % 1000}`;
    const clean = name.slice(0, 20);
    if (clean.length >= 3 && !taken.has(clean.toLowerCase())) { taken.add(clean.toLowerCase()); return clean; }
  }
}

const TZ = { 'America/New_York': 5, 'America/Chicago': 3, 'America/Denver': 1, 'America/Los_Angeles': 3, 'Europe/London': 1, 'Asia/Kolkata': 1 };
export const TYPES = {
  // share of players, chance of returning on a given day, actions per session
  tourist: { share: 0.35, stay: 0.18, pace: [1, 3] },
  casual: { share: 0.38, stay: 0.5, pace: [1, 4] },
  regular: { share: 0.21, stay: 0.8, pace: [2, 6] },
  hardcore: { share: 0.06, stay: 0.95, pace: [4, 10] },
};

export function makePersona() {
  const type = weighted(Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [k, v.share])));
  return {
    type,
    skill: Math.min(0.97, Math.max(0.35, rand(0.45, 0.9) + (type === 'hardcore' ? 0.06 : 0))), // chance of knowing an answer
    dex: rand(0.1, 0.95), // dodging
    aim: rand(0.45, 0.95),
    grit: rand(0.3, 0.9), // retry after failing
    journaler: rand(0, 1),
    likes: { learn: rand(3, 6), arena: rand(0.5, 4), trade: rand(0.2, 3), hideout: rand(0.3, 2), quests: rand(1, 3) },
    tz: weighted(TZ),
  };
}

/** Odds this persona plays on a given day, `daysIn` days after joining. */
export function stayOdds(persona, daysIn) {
  return TYPES[persona.type].stay * Math.pow(0.97, Math.max(0, daysIn));
}

const TICKERS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'SPY', 'QQQ', 'VOO', 'DIS', 'NKE', 'KO', 'COST', 'JPM', 'AMD', 'NFLX', 'SBUX', 'F', 'T'];
const NOTES = [
  'Buying because earnings beat and the trend is above the 50 day average. Stop below last swing low.',
  'Small starter position, I like the long term story. Will add if it holds support.',
  'Trying a breakout over resistance, stop just under the breakout level.',
  'Index fund for the long run, not timing anything.',
  'Taking profit, it hit my target and RSI looks stretched.',
  'Cutting this, it broke my stop. Lesson learned about chasing.',
];
const itemScore = (i) => Object.values(i.stats || {}).reduce((s, v) => s + v, 0) + (i.effects?.length || 0) * 1.5;

/**
 * shared: { catalog (lesson catalog + game catalog merged), lessonCache: Map, stats }
 * api(method, url, body) -> { status, data }
 */
export class Brain {
  constructor({ persona, api, shared, allowTrade = true }) {
    this.p = persona;
    this.api = api;
    this.shared = shared;
    this.allowTrade = allowTrade;
    this.known = new Map(); // question text -> correct option text (what this player has studied)
    this.done = new Set();
    this.examPassed = new Set();
    this.styled = false;
  }

  get catalog() { return this.shared.catalog; }
  get lessonOrder() {
    return (this.shared.lessonOrder ||= this.catalog.units.flatMap((u) => u.chapters.flatMap((c) => c.lessons.map((l) => ({ id: l.id, unit: u.id })))));
  }
  note(key) { const e = this.shared.stats.errors; e[key] = (e[key] || 0) + 1; }

  /** Rebuilds memory from the server (used by live rivals, which don't stay in memory). */
  async loadProgress() {
    const prog = (await this.api('GET', '/lessons/progress')).data;
    this.done = new Set(Object.keys(prog.completions || {}));
    this.examPassed = new Set(Object.entries(prog.unitExams || {}).filter(([, e]) => e.passed).map(([u]) => u));
    for (const id of this.done) this.study(await this.lesson(id));
  }

  /** One play session: a handful of actions weighted by what this player likes. */
  async play() {
    const [lo, hi] = TYPES[this.p.type].pace;
    let actions = Math.round(rand(lo, hi)) + 2;
    let lessonsToday = 0;
    const likes = this.allowTrade ? this.p.likes : { ...this.p.likes, trade: 0 };
    while (actions-- > 0) {
      const what = weighted(likes);
      try {
        if (what === 'learn') lessonsToday += await this.learn();
        else if (what === 'arena') await this.arena();
        else if (what === 'trade') await this.trade();
        else if (what === 'hideout') await this.hideout();
        else await this.quests();
      } catch (err) {
        this.note(`${what}: ${err.message}`);
      }
    }
    if (lessonsToday || chance(0.5)) await this.quests();
  }

  async lesson(id) {
    const cache = this.shared.lessonCache;
    if (!cache.has(id)) {
      const r = await this.api('GET', `/lessons/lesson/${id}`);
      if (r.status !== 200) return {};
      cache.set(id, r.data);
    }
    return cache.get(id);
  }

  study(lesson) {
    for (const s of lesson.steps || []) {
      for (const q of s.questions || (s.options ? [s] : [])) {
        if (q.options && q.answer != null && chance(this.p.skill)) this.known.set(String(q.q || '').trim(), String(q.options[q.answer]).trim());
      }
    }
  }

  /** Plays the next lesson (mostly in order; some people skip around). Returns 1 if passed. */
  async learn() {
    const exam = this.examReady();
    if (exam && chance(0.7)) { await this.exam(exam); return 0; }
    let next = this.lessonOrder.find((l) => !this.done.has(l.id));
    if (next && chance(0.08)) next = pick(this.lessonOrder.filter((l) => l.unit === next.unit));
    if (!next) return 0;
    const lesson = await this.lesson(next.id);
    if (!lesson.steps) return 0;
    this.study(lesson);
    const quiz = lesson.steps[lesson.steps.length - 1];
    for (let attempt = 0; attempt < 3; attempt++) {
      const p = Math.min(0.98, this.p.skill + attempt * 0.12 + 0.08);
      const answers = quiz.questions.map((q) => (chance(p) ? q.answer : (q.answer + 1 + Math.floor(Math.random() * (q.options.length - 1))) % q.options.length));
      const r = await this.api('POST', `/lessons/lesson/${next.id}/complete`, { answers });
      if (r.data.passed) { this.done.add(next.id); return 1; }
      this.shared.stats.lessonsFailed = (this.shared.stats.lessonsFailed || 0) + 1;
      if (!chance(this.p.grit)) return 0;
    }
    return 0;
  }

  examReady() {
    for (const u of this.catalog.units) {
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
    (this.shared.stats.exams ||= []).push({ unit: unitId, score: r.score, passed: !!r.passed, type: this.p.type });
    if (r.passed) this.examPassed.add(unitId);
  }

  /** A boss fight: the real question flow, with dodging and aiming modeled from the persona. */
  async arena() {
    const list = (await this.api('GET', '/battles')).data;
    if (!list.bosses) return;
    const open = list.bosses.filter((b) => b.unlocked);
    const fresh = open.filter((b) => !b.wins);
    // No boss yet (or just feeling it): climb the Dungeon instead.
    const dungeon = !open.length || chance(fresh.length ? 0.3 : 0.6);
    const pickBoss = dungeon ? null : fresh.length && chance(0.85) ? fresh[0] : pick(open);
    const start = await this.api('POST', `/battles/${dungeon ? 'dungeon' : pickBoss.id}/start`);
    if (start.status !== 200) return;
    const { battleId, loadout } = start.data;
    const boss = start.data.boss;
    const began = Date.now();
    const world = dungeon ? 1 + Math.min(3, Math.floor((boss.floor || 1) / 8)) : Math.max(1, Math.ceil((list.bosses.findIndex((b) => b.id === boss.id) + 1) / 2.5));
    let nextPop = 30;
    let bossHp = boss.hp; let hp = loadout.hp; let pips = 0; let t = 0; let correct = 0; let wrong = 0; let index = 0;
    const perPip = 30 + 3 * (loadout.stats.power || 0);
    const armor = 1 - Math.min(0.6, 0.03 * (loadout.stats.defense || 0));
    const pressure = (1.6 + world * 0.9) * (1.15 - this.p.dex) * armor; // HP lost per second of open fighting
    const regen = boss.mechanic?.type === 'regen' ? 1 : 0;
    let result = 'lost';
    while (t < 300) {
      // The boss's Pop Quiz comes about every 30 seconds of play.
      const pop = t >= nextPop;
      if (pop) nextPop += 30;
      const q = (await this.api('POST', `/battles/${battleId}/next`, pop ? { pop: true } : undefined)).data;
      if (!q.options) break;
      const want = this.known.get(String(q.q).trim());
      const known = want ? q.options.findIndex((o) => String(o).trim() === want) : -1;
      const choice = known >= 0 && chance(0.93) ? known : Math.floor(Math.random() * q.options.length);
      const a = (await this.api('POST', `/battles/${battleId}/answer`, { index, choice })).data;
      index++;
      const think = rand(3, 9);
      t += think; hp -= pressure * think * 0.2; // time runs at 20% while thinking
      if (a.correct) { correct++; pips = Math.min(3, pips + 1); } else { wrong++; pips = Math.max(0, pips - 1); }
      const fight = rand(3, 7);
      t += fight; hp -= pressure * fight * rand(0.6, 1.4); bossHp = Math.min(boss.hp, bossHp + regen * fight);
      if (pips === 3) { if (chance(this.p.aim)) bossHp -= 3 * perPip * (chance(0.03) ? 2 : 1); pips = 0; }
      if (bossHp <= 0) { result = 'won'; break; }
      if (hp <= 0) break;
      if (chance(0.01)) { result = 'abandoned'; break; }
    }
    // A real fight takes real time; the server also refuses wins under 20s.
    // (The simulator sets shared.fastFights to use just the minimum.)
    const wait = (this.shared.fastFights ? 21000 : Math.max(21000, Math.min(t * 1000 * 0.5, 70000))) - (Date.now() - began);
    if (wait > 0) await sleep(wait);
    const fin = await this.api('POST', `/battles/${battleId}/finish`, { result, damageTaken: Math.max(0, Math.round(loadout.hp - Math.max(0, hp))) });
    (this.shared.stats.fights ||= []).push({ boss: boss.dungeon ? `dungeon (floor ${boss.floor})` : boss.id, result, accepted: fin.status === 200, correct, wrong, simSeconds: Math.round(t), type: this.p.type, power: loadout.stats.power, coins: fin.data.coins || 0 });
  }

  async trade() {
    if (!this.allowTrade) return;
    const ports = (await this.api('GET', '/portfolio')).data;
    const manual = Array.isArray(ports) ? ports.find((p) => p.portfolioType === 'manual') : null;
    if (!manual) return;
    const pid = manual.portfolioId;
    const positions = (await this.api('GET', `/portfolio/${pid}/positions`)).data;
    const writes = chance(this.p.journaler);
    if (Array.isArray(positions) && positions.length && chance(0.35)) {
      const pos = pick(positions);
      const r = await this.api('POST', `/portfolio/${pid}/close/${pos.id}`, writes ? { reasoning: pick(NOTES.slice(4)) } : {});
      if (r.status === 200) this.shared.stats.trades = (this.shared.stats.trades || 0) + 1;
      return;
    }
    const r = await this.api('POST', `/portfolio/${pid}/trade`, {
      symbol: pick(TICKERS), action: 'BUY', quantity: Math.ceil(rand(1, 20)), orderType: 'market',
      ...(writes ? { reasoning: pick(NOTES.slice(0, 4)) } : {}),
    });
    if (r.status === 200) this.shared.stats.trades = (this.shared.stats.trades || 0) + 1;
    if (chance(0.15)) {
      await this.api('POST', '/portfolio/analysis', { symbol: pick(TICKERS), verdict: pick(['BUY', 'HOLD', 'AVOID']), trendAssessment: pick(['uptrend', 'downtrend', 'sideways']), reasoning: 'Looked at the trend, support and resistance, and the earnings growth before deciding.' });
    }
  }

  async hideout() {
    const st = (await this.api('GET', '/game/state')).data;
    if (!st.inventory) return;
    const look = this.catalog.appearance;
    if (!this.styled && look && chance(0.6)) {
      this.styled = true;
      await this.api('PUT', '/game/appearance', Object.fromEntries(Object.entries(look).map(([k, opts]) => [k, pick(opts)])));
    }
    const owned = new Set(st.inventory.map((i) => i.id));
    const items = this.catalog.items;
    const shop = items.filter((i) => i.unlockKind === 'shop' && st.unlockedWorlds.includes(i.world) && !owned.has(i.id) && i.price <= st.coins);
    if (shop.length && chance(0.6)) {
      // most people buy the strongest thing they can afford; some buy for looks
      const choice = chance(0.7) ? shop.sort((a, b) => itemScore(b) - itemScore(a))[0] : pick(shop);
      const r = await this.api('POST', '/game/buy', { itemId: choice.id });
      if (r.status === 200) { this.shared.stats.buys = (this.shared.stats.buys || 0) + 1; owned.add(choice.id); }
    }
    for (const slot of this.catalog.slots) {
      const mine = items.filter((i) => i.slot === slot && owned.has(i.id)).sort((a, b) => itemScore(b) - itemScore(a));
      if (mine[0] && st.equipment[slot] !== mine[0].id && chance(0.8)) await this.api('PUT', '/game/equip', { slot, itemId: mine[0].id });
    }
  }

  async quests() {
    const b = (await this.api('GET', '/quests')).data;
    if (!b.daily) return;
    for (const q of [...b.daily, ...b.weekly, ...b.story]) {
      if (q.done && !q.claimed && chance(0.9)) {
        const r = await this.api('POST', `/quests/${q.id}/claim`);
        if (r.status === 200) this.shared.stats.claims = (this.shared.stats.claims || 0) + 1;
      }
    }
  }
}
