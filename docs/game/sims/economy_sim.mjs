// TradeIQ economy simulation (v1).
// Run:  node docs/game/sims/economy_sim.mjs            (full report)
//       node docs/game/sims/economy_sim.mjs --days 90  (longer horizon)
//
// Part A: COINS. Simulates casual / regular / grinder players day by day under
//   (1) the coin payouts live in the app today (backend/services/progress.js,
//       backend/routes/lessons.js) and (2) the recommended payouts from
//   docs/game/GAME_DESIGN.md (quests + raised lesson/exam coins). Item prices are
//   read from docs/game/items-v1.json so the sim never drifts from the catalogue.
// Part B: NET WORTH (in-game cash). Monte Carlo of the Net Worth hub accounts on
//   the Life Clock (1 play day = 1 game month), reporting net worth percentiles and
//   where income comes from in each world.
// Everything is deterministic (seeded PRNG), so numbers in the doc are reproducible.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ITEMS = JSON.parse(readFileSync(join(here, '..', 'items-v1.json'), 'utf8'));
const argDays = process.argv.indexOf('--days');
const DAYS = argDays > 0 ? Number(process.argv[argDays + 1]) : 60;

// ---------- seeded RNG ----------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function normal(rng) {
  const u = Math.max(rng(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

// ---------- curriculum (docs/CURRICULUM.md) ----------
const UNITS = [
  { id: 'money', name: 'Money Moves', lessons: 37 },
  { id: 'stocks', name: 'Stock Smarts', lessons: 34 },
  { id: 'options', name: 'Options Arena', lessons: 19 },
  { id: 'futures', name: 'Futures Frontier', lessons: 16 },
];

// ---------- player archetypes ----------
// week: which weekdays they play (Mon..Sun). lessons: lessons per play day (cycled).
const PLAYERS = {
  casual: {
    label: 'Casual', week: [1, 1, 0, 1, 0, 1, 0], lessons: [1], dailies: 1, weekliesPerWeek: 1,
    perfect: 0.3, examPass: 0.55, bossWin: 0.45, buysFreezes: false, cosmeticShare: 0.6,
    contractsNew: 0.5, contractsOld: 0, savingsRate: 0.15, skill: -0.002,
  },
  regular: {
    label: 'Regular', week: [1, 1, 1, 1, 1, 1, 0], lessons: [1, 2], dailies: 2, weekliesPerWeek: 2,
    perfect: 0.5, examPass: 0.7, bossWin: 0.6, buysFreezes: true, cosmeticShare: 0.5,
    contractsNew: 1, contractsOld: 0.5, savingsRate: 0.2, skill: 0.002,
  },
  grinder: {
    label: 'Grinder', week: [1, 1, 1, 1, 1, 1, 1], lessons: [5], dailies: 3, weekliesPerWeek: 3,
    perfect: 0.75, examPass: 0.85, bossWin: 0.75, buysFreezes: true, cosmeticShare: 0.5,
    contractsNew: 2, contractsOld: 1, savingsRate: 0.3, skill: 0.004,
  },
};

// ---------- coin payout models ----------
const STREAK_BONUS_XP = { 3: 15, 7: 40, 14: 60, 30: 150, 60: 250, 100: 500 }; // coins = round(xp/3)
const ACH_LESSONS = [[1, 10], [10, 20], [25, 40], [50, 60], [100, 120]];
const ACH_PERFECT = [[1, 10], [10, 40]];
const ACH_STREAK = [[3, 15], [7, 30], [30, 100]];
const ACH_ALL_UNITS = 200;
const ACH_DESK = 10 + 10 + 10; // first_trade, first_profit, cut_loss (once the player uses a desk in World 2)

const MODELS = {
  current: {
    label: 'Current app payouts (no quests)',
    lesson: 5, perfect: 5, exam: 50, bossWin: 0,
    daily: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
    weekly: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
    story: [0, 0, 0, 0],
  },
  recommended: {
    label: 'Recommended payouts (quests + raised lesson/exam coins)',
    lesson: 10, perfect: 5, exam: 150, bossWin: 100,
    // 3 daily quests per day, per world
    daily: [[15, 15, 20], [20, 20, 25], [25, 25, 30], [30, 30, 40]],
    // 3 weekly quests per week, per world
    weekly: [[60, 80, 100], [80, 100, 130], [100, 130, 160], [120, 160, 200]],
    // total story-quest coins per world, paid out evenly as lessons in that world are finished
    story: [400, 500, 450, 450],
  },
};

// ---------- shopping lists (from items-v1.json) ----------
const byId = new Map(ITEMS.items.map((i) => [i.id, i]));
const KITS = [
  // "Key kit" per world: what a player needs to feel geared for that world's boss.
  { world: 1, label: 'W1 key kit: Budget Blade + 3 shop pieces of Rainy-Day + Patience Charm', ids: ['budget-blade', 'rainy-day-hood', 'safety-net-leggings', 'puddle-proof-boots', 'patience-charm'] },
  { world: 2, label: 'W2 key kit: Bull-Horn Lance + 3 Stop-Loss Sentinel pieces + Mood Ring', ids: ['bull-horn-lance', 'sentinel-sallet', 'position-size-brigandine', 'two-percent-greaves', 'mr-markets-mood-ring'] },
  { world: 3, label: 'W3 key kit: Delta Daggers + 3 Covered Caller pieces + Greeks Monocle', ids: ['delta-daggers', 'strike-price-circlet', 'covered-call-coat', 'income-leggings', 'greeks-monocle'] },
  { world: 4, label: 'W4 key kit: Tick-Value Trident + 3 Micro Manager pieces + Contango Compass', ids: ['tick-value-trident', 'tick-size-helmet', 'micro-contract-mail', 'mark-to-market-leggings', 'contango-compass'] },
];
for (const k of KITS) k.cost = k.ids.reduce((s, id) => s + byId.get(id).price, 0);
const SHOP_BY_WORLD = [1, 2, 3, 4].map((w) => ITEMS.items.filter((i) => i.world === w && i.price > 0).sort((a, b) => a.price - b.price));
const SHOP_TOTAL = SHOP_BY_WORLD.flat().reduce((s, i) => s + i.price, 0);
// Cosmetics (dyes, emotes, desk decor, titles) are not in items-v1.json yet; modeled as a budget per world.
const COSMETIC_BUDGET = [1200, 1600, 2000, 2500];
const FREEZE_COST = 50;
const RESERVE = 0; // players spend down to zero

function simCoins(ptype, model, days = DAYS, seed = 7) {
  const P = PLAYERS[ptype];
  const M = MODELS[model];
  const rng = mulberry32(seed);
  let coins = 0, earned = 0, spentItems = 0, spentCosmetics = 0, spentFreezes = 0;
  let world = 0; // index into UNITS of the world being studied
  let unlockedWorld = 1; // highest world whose shop is open
  let lessonsInUnit = 0, totalLessons = 0, perfects = 0;
  let examPending = false, examTries = 0, bossPending = false, bossTries = 0;
  const passed = new Set();
  let streak = 0, lastPlay = -10, freezes = 0;
  const achGot = new Set();
  const owned = new Set();
  const cosmeticSpent = [0, 0, 0, 0];
  const kitDay = {};
  const worldUnlockDay = { 1: 1 };
  const balance = [];
  let lessonCycle = 0;
  let weekliesThisWeek = 0;

  const gain = (n) => { coins += n; earned += n; };
  const ach = (key, c) => { if (!achGot.has(key)) { achGot.add(key); gain(c); } };

  for (let day = 1; day <= days; day++) {
    const dow = (day - 1) % 7;
    if (dow === 0) weekliesThisWeek = 0;
    const plays = P.week[dow] === 1;
    if (plays) {
      // streak (with freezes covering exactly one missed day)
      const gap = day - lastPlay;
      if (gap === 1) streak++;
      else if (gap === 2 && freezes > 0) { freezes--; streak++; }
      else streak = 1;
      lastPlay = day;
      const sb = STREAK_BONUS_XP[streak];
      if (sb) gain(Math.round(sb / 3));
      for (const [n, c] of ACH_STREAK) if (streak >= n) ach(`streak${n}`, c);

      // learning
      const w = Math.min(world, 3);
      if (world < 4) {
        if (examPending) {
          examTries++;
          const p = Math.min(0.97, P.examPass + 0.15 * (examTries - 1));
          if (rng() < p) {
            examPending = false;
            passed.add(world);
            gain(M.exam);
            bossPending = M.bossWin > 0;
            bossTries = 0;
            unlockedWorld = Math.min(4, world + 2);
            if (world + 2 <= 4) worldUnlockDay[world + 2] = day;
            if (world === 0) ach('desk', ACH_DESK);
            if (passed.size === 4) ach('allUnits', ACH_ALL_UNITS);
            world++;
            lessonsInUnit = 0;
          }
        } else {
          const n = P.lessons[lessonCycle++ % P.lessons.length];
          for (let i = 0; i < n && !examPending; i++) {
            lessonsInUnit++;
            totalLessons++;
            gain(M.lesson);
            if (rng() < P.perfect) { perfects++; gain(M.perfect); }
            gain(M.story[w] / UNITS[w].lessons);
            if (lessonsInUnit >= UNITS[w].lessons) { examPending = true; examTries = 0; }
          }
          for (const [n2, c] of ACH_LESSONS) if (totalLessons >= n2) ach(`l${n2}`, c);
          for (const [n2, c] of ACH_PERFECT) if (perfects >= n2) ach(`p${n2}`, c);
        }
      }
      // boss combat (first win pays once); attempted on play days after the exam
      if (bossPending && !examPending) {
        bossTries++;
        if (rng() < Math.min(0.95, P.bossWin + 0.15 * (bossTries - 1))) { gain(M.bossWin); bossPending = false; }
      }
      // quests (current world's board; after the course, World 4 board)
      const qw = Math.min(world, 3);
      const daily = M.daily[qw];
      for (let i = 0; i < P.dailies; i++) gain(daily[i]);
      // weeklies: completed on the first play days of the week
      if (weekliesThisWeek < P.weekliesPerWeek) {
        gain(M.weekly[qw][weekliesThisWeek]);
        weekliesThisWeek++;
      }

      // ---- spending ----
      // 1) keep one streak freeze in stock
      if (P.buysFreezes && freezes < 1 && coins >= FREEZE_COST) { coins -= FREEZE_COST; spentFreezes += FREEZE_COST; freezes++; }
      // 2) key kits, in world order, only for unlocked worlds
      for (const k of KITS) {
        if (k.world > unlockedWorld || kitDay[k.world]) continue;
        const missing = k.ids.filter((id) => !owned.has(id));
        const cost = missing.reduce((s, id) => s + byId.get(id).price, 0);
        if (coins >= cost) { coins -= cost; spentItems += cost; missing.forEach((id) => owned.add(id)); kitDay[k.world] = day; }
        break; // finish one kit before saving for the next
      }
      // 3) once the current kit is done, spend the rest on other shop items and cosmetics
      const kitDone = KITS.filter((k) => k.world <= unlockedWorld).every((k) => kitDay[k.world]);
      if (kitDone) {
        for (let w2 = 0; w2 < unlockedWorld; w2++) {
          for (const it of SHOP_BY_WORLD[w2]) {
            if (owned.has(it.id) || coins < it.price) continue;
            coins -= it.price; spentItems += it.price; owned.add(it.id);
          }
        }
        let budget = Math.floor(coins * P.cosmeticShare);
        for (let w2 = 0; w2 < unlockedWorld && budget > 0; w2++) {
          const room = COSMETIC_BUDGET[w2] - cosmeticSpent[w2];
          const spend = Math.min(room, budget);
          cosmeticSpent[w2] += spend; budget -= spend; coins -= spend; spentCosmetics += spend;
        }
      }
    }
    balance.push(Math.round(coins));
  }
  const shopOwned = [...owned].reduce((s, id) => s + byId.get(id).price, 0);
  return {
    kitDay, worldUnlockDay, balance, earned: Math.round(earned), spentItems, spentCosmetics, spentFreezes,
    shopOwnedShare: shopOwned / SHOP_TOTAL, cosmeticShareBought: cosmeticSpent.reduce((a, b) => a + b, 0) / COSMETIC_BUDGET.reduce((a, b) => a + b, 0),
    worldsPassed: passed.size, totalLessons,
  };
}

// Daily earn rate per world (recommended model), for the doc's table.
function earnRates(ptype, model) {
  const P = PLAYERS[ptype];
  const M = MODELS[model];
  const playFrac = P.week.reduce((a, b) => a + b, 0) / 7;
  const lessonsPerPlay = P.lessons.reduce((a, b) => a + b, 0) / P.lessons.length;
  return [0, 1, 2, 3].map((w) => {
    const lessonCoins = lessonsPerPlay * (M.lesson + P.perfect * M.perfect + M.story[w] / UNITS[w].lessons);
    const dailyCoins = M.daily[w].slice(0, P.dailies).reduce((a, b) => a + b, 0);
    const weeklyCoins = M.weekly[w].slice(0, P.weekliesPerWeek).reduce((a, b) => a + b, 0) / 7 / playFrac;
    return Math.round((lessonCoins + dailyCoins + weeklyCoins) * playFrac);
  });
}

// =====================================================================
// Part B: Net Worth (in-game cash). 1 play day = 1 game month (Life Clock).
// The clock only moves on days the player visits, so absence never costs money.
// =====================================================================
const CAREER = [ // gross monthly pay and withholding, by highest world unlocked
  { title: 'Gig Board side hustle', gross: 900, tax: 0.08 },
  { title: 'Research Intern', gross: 2000, tax: 0.12 },
  { title: 'Junior Analyst', gross: 3500, tax: 0.15 },
  { title: 'Desk Associate', gross: 5000, tax: 0.18 },
];
const HYSA_APY = 0.04;
const LADDER_APY = 0.043;
const INDEX_FEE = 0.0003;
// Monthly index return: mixture calibrated to roughly 8%/yr and 15% vol with a fat left tail.
const indexMonthly = (rng) => (rng() < 0.05 ? -0.06 + 0.06 * normal(rng) : 0.01 + 0.038 * normal(rng));
// Desk P&L per game month on desk capital. Means are modest on purpose: trading desks are not
// "better" than the index. They add variance; good process (skill) nudges the mean.
const DESKS = {
  // drift: market return the desk carries. Covered calls on the index keep most of the index drift
  // with less volatility; micro index futures carry index drift on ~2x notional, with 2x the swings.
  swing: { world: 2, grant: 2500, contract: 300, drift: 0, sd: 0.05, tail: 0, tailHit: 0 },
  options: { world: 3, grant: 5000, contract: 700, drift: 0.008, sd: 0.03, tail: 0.05, tailHit: -0.1 },
  futures: { world: 4, grant: 8000, contract: 1500, drift: 0.01, sd: 0.09, tail: 0.03, tailHit: -0.3 },
};
const STORY_CASH = [1500, 3000, 4000, 5000];
const LIFE_EVENT_P = 0.08; // "Life Happens" bill = 1.5x monthly needs
const SPLITS = [
  { index: 0.8, ladder: 0.2 },
  { index: 0.6, ladder: 0.1, swing: 0.3 },
  { index: 0.55, ladder: 0.1, swing: 0.15, options: 0.2 },
  { index: 0.5, ladder: 0.1, swing: 0.1, options: 0.15, futures: 0.15 },
];
const SOURCES = ['paycheck', 'questCash', 'contracts', 'interest', 'index', 'swing', 'options', 'futures', 'lifeEvents'];

function cashPath(ptype, unlockDays, seed, checkpoints, flows, months) {
  const P = PLAYERS[ptype];
  const rng = mulberry32(seed);
  const playDaysPerWeek = P.week.reduce((a, b) => a + b, 0);
  const a = { hysa: 500, ladder: 0, index: 0, swing: 0, options: 0, futures: 0, debt: 0 };
  const out = {};
  let liquidations = 0;
  for (let day = 1; day <= DAYS; day++) {
    let w = 1;
    for (const k of [2, 3, 4]) if (unlockDays[k] && day >= unlockDays[k]) w = k;
    for (const [name, d] of Object.entries(DESKS)) if (unlockDays[d.world] === day) a[name] += d.grant;
    if (P.week[(day - 1) % 7] === 1) {
      months[w - 1]++;
      const F = flows[w - 1];
      const job = CAREER[w - 1];
      const net = job.gross * (1 - job.tax);
      F.paycheck += net;
      const needs = net * 0.5;
      let toSave = net * P.savingsRate;
      const worldLen = Math.max(10, (unlockDays[w + 1] || DAYS) - (unlockDays[w] || 1));
      const questCash = (STORY_CASH[w - 1] / worldLen) * (7 / playDaysPerWeek);
      F.questCash += questCash; toSave += questCash;
      let contracts = 0;
      for (const d of Object.values(DESKS)) if (w >= d.world) contracts += (d.world === w ? P.contractsNew : P.contractsOld) * d.contract;
      F.contracts += contracts; toSave += contracts * 0.8;
      if (rng() < LIFE_EVENT_P) {
        const bill = needs * 1.5;
        F.lifeEvents -= bill;
        const fromEf = Math.min(a.hysa, bill);
        a.hysa -= fromEf; a.debt += bill - fromEf;
      }
      a.debt *= 1.02; // 24% APR card
      const pay = Math.min(a.debt, toSave); a.debt -= pay; toSave -= pay;
      const toEf = Math.min(Math.max(0, needs * 3 - a.hysa), toSave); a.hysa += toEf; toSave -= toEf;
      for (const [k, v] of Object.entries(SPLITS[w - 1])) a[k] += toSave * v;
      const interest = a.hysa * (HYSA_APY / 12) + a.ladder * (LADDER_APY / 12);
      a.hysa *= 1 + HYSA_APY / 12; a.ladder *= 1 + LADDER_APY / 12;
      F.interest += interest;
      const ir = indexMonthly(rng) - INDEX_FEE / 12;
      F.index += a.index * ir; a.index *= 1 + ir;
      for (const [name, d] of Object.entries(DESKS)) {
        if (w < d.world || a[name] <= 0) continue;
        let r = d.drift + P.skill + d.sd * normal(rng);
        if (rng() < d.tail) r += d.tailHit;
        F[name] += a[name] * r; a[name] *= 1 + r;
        if (name === 'futures' && a.futures < 500) { F.futures -= a.futures; a.futures = 0; liquidations++; }
      }
    }
    if (checkpoints.includes(day)) out[day] = a.hysa + a.ladder + a.index + a.swing + a.options + a.futures - a.debt;
  }
  return { out, liquidations };
}

function simCash(ptype, unlockDays, runs = 2000) {
  const checkpoints = [7, 14, 30, 60, 90].filter((d) => d <= DAYS);
  const flows = [0, 1, 2, 3].map(() => Object.fromEntries(SOURCES.map((s) => [s, 0])));
  const months = [0, 0, 0, 0];
  const at = Object.fromEntries(checkpoints.map((d) => [d, []]));
  let liq = 0;
  for (let r = 0; r < runs; r++) {
    const { out, liquidations } = cashPath(ptype, unlockDays, 1000 + r, checkpoints, flows, months);
    liq += liquidations;
    for (const d of checkpoints) at[d].push(out[d]);
  }
  const pct = (arr, p) => { const s = [...arr].sort((x, y) => x - y); return s[Math.floor(p * (s.length - 1))]; };
  return {
    nw: Object.fromEntries(checkpoints.map((d) => [d, { p10: pct(at[d], 0.1), p50: pct(at[d], 0.5), p90: pct(at[d], 0.9) }])),
    perMonth: flows.map((F, i) => (months[i] ? Object.fromEntries(Object.entries(F).map(([k, v]) => [k, v / months[i]])) : null)),
    liqPerPlayer: liq / runs,
  };
}

// =====================================================================
// Report
// =====================================================================
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const money = (n) => (n < 0 ? '-$' : '$') + fmt(Math.abs(n));
function spark(values, width = 30) {
  const ticks = ' .:-=+*#%@';
  const step = Math.max(1, Math.ceil(values.length / width));
  const pts = values.filter((_, i) => i % step === 0);
  const max = Math.max(...pts, 1);
  return pts.map((v) => ticks[Math.min(9, Math.round((v / max) * 9))]).join('');
}

console.log(`# TradeIQ economy sim (horizon ${DAYS} days)\n`);
console.log('## Key kit prices (read from items-v1.json)\n');
console.log('| Kit | Coins |\n|---|---|');
for (const k of KITS) console.log(`| ${k.label} | ${k.cost} |`);
console.log(`\nEvery shop item in every world: ${fmt(SHOP_TOTAL)} coins. Cosmetics budget modeled: ${fmt(COSMETIC_BUDGET.reduce((a, b) => a + b, 0))} coins.\n`);

const results = {};
for (const model of ['current', 'recommended']) {
  console.log(`## Coins: ${MODELS[model].label}\n`);
  console.log(`| Player | W2 opens | W3 opens | W4 opens | W1 kit | W2 kit | W3 kit | W4 kit | Earned by day 7 | Earned by day ${DAYS} | Balance day ${DAYS} | Shop items owned |`);
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const p of Object.keys(PLAYERS)) {
    const r = simCoins(p, model);
    results[`${model}:${p}`] = r;
    const e7 = simCoins(p, model, 7).earned;
    const kd = (w) => (r.kitDay[w] ? `day ${r.kitDay[w]}` : 'not yet');
    console.log(`| ${PLAYERS[p].label} | ${r.worldUnlockDay[2] ?? '-'} | ${r.worldUnlockDay[3] ?? '-'} | ${r.worldUnlockDay[4] ?? '-'} | ${kd(1)} | ${kd(2)} | ${kd(3)} | ${kd(4)} | ${fmt(e7)} | ${fmt(r.earned)} | ${fmt(r.balance.at(-1))} | ${Math.round(r.shopOwnedShare * 100)}% |`);
  }
  console.log('\nCoin balance over time (left = day 1, right = last day; height relative to that player\'s peak):\n');
  console.log('```');
  for (const p of Object.keys(PLAYERS)) console.log(`${PLAYERS[p].label.padEnd(8)} |${spark(results[`${model}:${p}`].balance)}| peak ${fmt(Math.max(...results[`${model}:${p}`].balance))}`);
  console.log('```\n');
}

console.log('## Coins per calendar day while in each world (recommended payouts, before one-time rewards)\n');
console.log('| Player | World 1 | World 2 | World 3 | World 4 |\n|---|---|---|---|---|');
for (const p of Object.keys(PLAYERS)) console.log(`| ${PLAYERS[p].label} | ${earnRates(p, 'recommended').join(' | ')} |`);
console.log('');

console.log('## Net worth (in-game cash): Monte Carlo, 2,000 runs per player type\n');
for (const p of Object.keys(PLAYERS)) {
  const unlock = results[`recommended:${p}`].worldUnlockDay;
  const c = simCash(p, unlock);
  console.log(`### ${PLAYERS[p].label} (Worlds 2/3/4 open on days ${[2, 3, 4].map((w) => unlock[w] ?? '-').join(' / ')})\n`);
  console.log('| Day | 10th pct | Median | 90th pct |\n|---|---|---|---|');
  for (const [d, v] of Object.entries(c.nw)) console.log(`| ${d} | ${money(v.p10)} | ${money(v.p50)} | ${money(v.p90)} |`);
  console.log('\nAverage income per game month, by source, while in each world:\n');
  console.log('| Source | World 1 | World 2 | World 3 | World 4 |\n|---|---|---|---|---|');
  for (const k of SOURCES) console.log(`| ${k} | ${c.perMonth.map((m) => (m ? money(m[k]) : '-')).join(' | ')} |`);
  console.log(`\nFutures desk liquidations per player over ${DAYS} days: ${c.liqPerPlayer.toFixed(2)}\n`);
}
