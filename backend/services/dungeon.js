// The Dungeon: an endless climb open to every player from day one, so the game
// starts before the first boss unlocks. Each floor is one fight in the normal
// battle engine against a money monster that gets tougher with depth; every
// 5th floor is a Guardian with a gimmick. Losing ends the run (back to floor 1).
//
// Questions come from Unit 1 chapter 1 plus every lesson the player finished,
// so new players learn by playing and veterans get their whole curriculum.
import { UNITS } from '../content/index.js';

// Learning should stay the best-paying activity: the dungeon's daily coin cap
// starts at 10 and grows 10 per lesson passed that day, up to 60. Gear drops
// are limited the same way (lootCapFor).
export const DAILY_COIN_CAP = 60;
export const BASE_COIN_CAP = 10;
export const DAILY_XP_CAP = 120;
export const coinCapFor = (lessonsToday) => Math.min(DAILY_COIN_CAP, BASE_COIN_CAP + 10 * lessonsToday);
// Gear drops per day: 1 free, plus 1 for each lesson passed today.
export const DAILY_LOOT_CAP = 6;
export const lootCapFor = (lessonsToday) => Math.min(DAILY_LOOT_CAP, 1 + lessonsToday);

const MONSTERS = [
  { key: 'late-fee-imp', signature: 'bounce', name: 'Late Fee Imp', title: 'Collector of Oopsies', template: 'blob', body: '#ff7a45', accent: '#ffd23f',
    lesson: 'Autopay and calendar reminders make late fees disappear.', intro: 'Due yesterday? That will be $35, plus my emotional damages.', defeat: 'Autopay?! That is just mean.',
    taunts: ['Tick tock, due date o\'clock.', 'One day late is still late!'], patterns: ['aimed', 'ring', 'rain'], mechanic: { type: 'countdown', value: 20, text: 'Fees pile up: its attacks hit 10% harder every 20 seconds.' } },
  { key: 'impulse-goblin', signature: 'tantrum', name: 'Impulse Buy Goblin', title: 'Add-to-Cart Gremlin', template: 'brute', body: '#12985a', accent: '#ff5a4e',
    lesson: 'A 24-hour wait before non-essential buys kills most impulse spending.', intro: 'Limited time only! Buy now, think never!', defeat: 'You... waited a day? Unbelievable.',
    taunts: ['Free shipping if you spend $20 more!', 'Treat yourself. Again.'], patterns: ['charge', 'volley', 'aimed'], mechanic: { type: 'enrage_below', value: 30, text: 'Below 30% HP it panics and attacks faster: flash sale!' } },
  { key: 'overdraft-ooze', signature: 'lava', name: 'Overdraft Ooze', title: 'Drip of Negative Balance', template: 'blob', body: '#3d8bfd', accent: '#17140f',
    lesson: 'Overdraft fees are avoidable: track your balance or opt out of overdraft coverage.', intro: 'Your balance says $3. Your coffee says $6. I say $34 fee.', defeat: 'You opted out of overdraft? Rude.',
    taunts: ['Drip... drip... fee.', 'Negative numbers are my favorite.'], patterns: ['rain', 'homing', 'ring'], mechanic: { type: 'regen', value: 1, text: 'It oozes back 1 HP per second outside Focus Time. Hit hard.' } },
  { key: 'subscription-swarm', signature: 'spiral', name: 'Subscription Swarm', title: 'Monthly Charge Hive', template: 'bird', body: '#8b5cf6', accent: '#ffd23f',
    lesson: 'Audit subscriptions every few months; small monthly charges add up to hundreds a year.', intro: 'You forgot about us, didn\'t you? $9.99 times twelve of us...', defeat: 'Cancelled... all of us...',
    taunts: ['Your free trial ended yesterday.', 'We auto-renew. Forever.'], patterns: ['volley', 'homing', 'wall'], mechanic: { type: 'summon', value: 14, text: 'Calls in more tiny subscriptions that heal it. Shoot them down.' } },
  { key: 'fomo-phantom', signature: 'sine', name: 'FOMO Phantom', title: 'Whisperer of Hype', template: 'specter', body: '#e8577a', accent: '#fffaf0',
    lesson: 'Chasing what already went up is buying high. Have a plan before the hype.', intro: 'Everyone else is getting rich. Why aren\'t you? Buy! Buy!', defeat: 'You stuck to your plan? Boring... and correct.',
    taunts: ['It\'s up 400% this week!', 'Don\'t miss out!'], patterns: ['aimed', 'charge', 'rain'], mechanic: { type: 'mood_swing', value: 12, text: 'Swings between euphoric (fast, takes +20% damage) and despair (slow, hits harder).' } },
  { key: 'hidden-fee-gremlin', signature: 'shuffle', name: 'Hidden Fee Gremlin', title: 'Fine Print Lurker', template: 'bot', body: '#6b7280', accent: '#ff5a4e',
    lesson: 'Expense ratios and account fees compound against you; always read the fee table.', intro: 'Only 2% a year. What could that possibly cost you? (Everything.)', defeat: 'You found the fee table. Nobody finds the fee table.',
    taunts: ['Read the fine print? Ha!', 'Just a small maintenance fee.'], patterns: ['wall', 'aimed', 'slam'], mechanic: { type: 'shield_phase', value: 20, text: 'Hides behind fine print: a shield every 20 seconds. Correct answers break it.' } },
  { key: 'payday-leech', signature: 'beam', name: 'Payday Lender Leech', title: 'Sucker of Paychecks', template: 'beast', body: '#c7362c', accent: '#ffd23f',
    lesson: 'Payday loans can cost 400% APR. An emergency fund is the real shield.', intro: 'Need cash fast? Sign here. Don\'t read that number.', defeat: 'You had an emergency fund?! I\'m starving.',
    taunts: ['Just $15 per $100! Every two weeks!', 'Roll it over, it\'s easy.'], patterns: ['charge', 'slam', 'homing'], mechanic: { type: 'settlement', value: 25, text: 'At low HP it demands payment: a forced question. Right heals you, wrong hurts.' } },
  { key: 'creep-crawler', signature: 'balloon', name: 'Lifestyle Creep Crawler', title: 'Inflater of Wants', template: 'beast', body: '#ffd23f', accent: '#8b5cf6',
    lesson: 'When your income rises, raise your savings rate first, then your spending.', intro: 'You got a raise? Time for a nicer everything.', defeat: 'You saved the raise. I can\'t grow on that.',
    taunts: ['Upgrade your phone. And your car.', 'You deserve it. Spend it.'], patterns: ['homing', 'ring', 'volley'], mechanic: { type: 'none', text: '' } },
  { key: 'min-payment-mimic', signature: 'pyramid', name: 'Minimum Payment Mimic', title: 'Friendly Debt Trap', template: 'suit', body: '#2f3e66', accent: '#ff7ab8',
    lesson: 'Paying only the minimum can take decades and double the cost. Pay more than the minimum.', intro: 'Just pay the minimum! See you in 2047.', defeat: 'Paid in full? I hate that phrase.',
    taunts: ['Only $25 this month!', 'Interest? Never heard of it.'], patterns: ['aimed', 'wall', 'rain'], mechanic: { type: 'mirror', value: 20, text: 'Makes decoy copies. The real one has a gold shadow.' } },
  { key: 'rug-pull-rat', signature: 'dive', name: 'Rug Pull Rat', title: 'Promoter of Moon Coins', template: 'brute', body: '#9a6440', accent: '#1fbf75',
    lesson: 'If an investment promises guaranteed huge returns, it\'s probably a scam.', intro: 'Guaranteed 1000% returns! Trust me, I\'m a rat.', defeat: 'You asked for the audit? I\'m out.',
    taunts: ['To the moon!', 'Totally not a scam.'], patterns: ['slam', 'charge', 'volley', 'ring'], mechanic: { type: 'enrage_below', value: 40, text: 'Below 40% HP it panics and tries to run off with everything: faster attacks.' } },
];

const ATTACK_TEXT = {
  bounce: ['Bouncing Fees', 'Shots that ricochet off the walls twice.'],
  tantrum: ['Spending Spree', 'A chain of slams marching toward you. Move sideways.'],
  lava: ['Overdraft Pools', 'Puddles that hurt while you stand in them for six seconds.'],
  spiral: ['Auto-Renew Spiral', 'A spinning three-arm spray. Rotate with the gaps.'],
  sine: ['Hype Wave', 'A weaving stream. Step out of its lane.'],
  shuffle: ['Fine Print Shuffle', 'Shots freeze, then all re-aim at you. Move after they stop.'],
  beam: ['Rollover Beam', 'A red line locks on, then fires. Step off the line.'],
  balloon: ['Lifestyle Balloon', 'Swelling bubbles that pop into rings.'],
  pyramid: ['Interest on Interest', 'One shot splits into two, then four, then eight.'],
  dive: ['Exit Scam Dash', 'A dash straight through you that sheds debris.'],
  ring: ['Fee Burst', 'An expanding ring. Slip through a gap or dash through it.'],
  volley: ['Charge Spray', 'A fan of shots. Step out of the spread.'],
  aimed: ['Sniped Bill', 'A fast shot at where you stand. Keep moving.'],
  rain: ['Bill Rain', 'Shadows mark where things land. Step out of the circles.'],
  charge: ['Shopping Rush', 'It dashes at you. Sidestep or dash away.'],
  homing: ['Tracking Cookie', 'A slow shot that follows you. Outrun it or shoot it.'],
  wall: ['Paywall', 'A wall sweeps across. Find the gap.'],
  slam: ['Repo Slam', 'A shockwave around it. Keep your distance.'],
};

// Mob types unlock with depth, so early floors teach one enemy at a time.
const MOB_UNLOCKS = [[1, 'zombie'], [2, 'swarmer'], [3, 'shooter'], [4, 'bomber'], [6, 'splitter'], [8, 'tank'], [10, 'turret'], [12, 'healer']];

/** Small deterministic RNG so a floor always has the same layout. */
function rng(seed) {
  let x = seed * 2654435761 % 4294967296 || 1;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}

/** The waves that come before a floor's monster. Guardian floors end with an elite mini-boss. */
export function wavesFor(floor) {
  const r = rng(floor + 7);
  // Lobbyists only matter once the monster is out, so they come mid-fight instead (below).
  const kinds = MOB_UNLOCKS.filter(([f, t]) => floor >= f && t !== 'healer').map(([, t]) => t);
  const nWaves = Math.min(4, 1 + Math.floor(floor / 3));
  const size = Math.min(10, 3 + Math.floor(floor / 2));
  const waves = [];
  const newest = MOB_UNLOCKS.find(([f, t]) => f === floor && t !== 'healer')?.[1];
  const CAP = { turret: 2, tank: 2, healer: 2, bomber: 4 };
  for (let i = 0; i < nWaves; i++) {
    const counts = {};
    // A newly unlocked mob gets introduced on its own floor's first wave.
    if (newest && i === 0) counts[newest] = Math.min(CAP[newest] || 3, 3);
    let left = size - Object.values(counts).reduce((a, b) => a + b, 0);
    let guard = 40;
    while (left > 0 && guard--) {
      const t = kinds[Math.floor(r() * kinds.length)];
      if ((counts[t] || 0) >= (CAP[t] || 99)) continue;
      counts[t] = (counts[t] || 0) + 1; left--;
    }
    const mobs = Object.entries(counts).map(([type, count]) => ({ type, count }));
    if (floor > 10 && r() < (floor - 10) / 20) mobs.push({ type: kinds[Math.floor(r() * kinds.length)], count: 1, elite: true });
    waves.push({ at: 'start', mobs });
  }
  if (floor % 5 === 0) {
    const big = kinds.filter((t) => t !== 'swarmer');
    const eliteType = big[Math.floor(r() * big.length)];
    waves.push({ at: 'start', label: 'Mini-boss!', mobs: [{ type: eliteType, count: 1, elite: true }, { type: 'swarmer', count: Math.min(6, 2 + Math.floor(floor / 5)) }] });
  }
  // Mid-fight reinforcements once the monster is half dead.
  if (floor >= 6) waves.push({ at: 0.5, mobs: [{ type: floor >= 12 ? 'healer' : 'zombie', count: floor >= 12 ? 2 : 3 }] });
  return waves;
}

/** The floor's monster, as a boss definition the battle engine understands. */
export function monsterFor(floor) {
  const f = Math.max(1, Math.floor(floor));
  const m = MONSTERS[(f - 1) % MONSTERS.length];
  const guardian = f % 5 === 0;
  const lap = Math.floor((f - 1) / MONSTERS.length); // how many times we've looped the roster
  const nAttacks = Math.min(m.patterns.length, 1 + Math.floor(f / 4));
  // From floor 3 on, the monster also uses its signature move.
  const patterns = [...m.patterns.slice(0, nAttacks), ...(f >= 3 ? [m.signature] : [])];
  return {
    id: `dungeon-${f}`,
    dungeon: true,
    floor: f,
    name: guardian ? `${m.name} Guardian` : m.name,
    title: `Floor ${f}${guardian ? ' Guardian' : ''} · ${m.title}`,
    world: 1,
    hp: Math.round((90 + 35 * (f - 1)) * (guardian ? 1.4 : 1)),
    speed: Math.min(1.05, 0.55 + f * 0.02),
    lesson: m.lesson,
    intro: m.intro,
    taunts: m.taunts,
    defeat: m.defeat,
    look: { body: m.body, accent: m.accent, eye: '#17140f', template: m.template },
    // Gimmicks appear on Guardian floors, and on every floor after the first lap.
    mechanic: guardian || lap > 0 ? m.mechanic : { type: 'none', text: '' },
    waves: wavesFor(f),
    attacks: patterns.map((p) => ({
      pattern: p,
      name: ATTACK_TEXT[p][0],
      text: ATTACK_TEXT[p][1],
      damage: Math.round(5 + f * 0.6),
      cooldown: Math.max(7, 14 - f * 0.3),
      count: p === 'ring' ? 10 + Math.min(8, f) : p === 'volley' ? 3 + Math.min(4, Math.floor(f / 3)) : undefined,
    })),
    unlock: null,
    rewards: {},
  };
}

/** Lessons a player's dungeon questions come from: Unit 1 chapter 1 plus everything they've finished. */
export function dungeonLessons(completed) {
  const starter = UNITS[0].chapters[0].lessons.map((l) => l.id);
  return [...new Set([...starter, ...completed])];
}

/** Coins and XP for clearing a floor, before daily caps. */
export function floorRewards(floor) {
  return { coins: 3 + floor, xp: 5 + 2 * floor };
}
