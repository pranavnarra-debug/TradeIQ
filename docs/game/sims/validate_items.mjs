// Validates docs/game/items-v1.json against the rules in docs/game/GAME_DESIGN.md.
// Run: node docs/game/sims/validate_items.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, '..', 'items-v1.json'), 'utf8'));

const errors = [];
const err = (m) => errors.push(m);
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEX = /^#[0-9A-Fa-f]{6}$/;
const STAT_KEYS = ['power', 'defense', 'focus', 'luck'];
const ARMOR = ['helmet', 'chest', 'legs', 'boots'];
const RARITY = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

if (JSON.stringify(Object.keys(data.stats)) !== JSON.stringify(STAT_KEYS)) err('stats must be exactly power, defense, focus, luck');

const ids = new Set();
const setIds = new Set();
for (const s of data.sets) {
  if (!KEBAB.test(s.id)) err(`set id not kebab: ${s.id}`);
  if (setIds.has(s.id)) err(`duplicate set id ${s.id}`);
  setIds.add(s.id);
  for (const k of ['A', 'B', 'C']) if (!HEX.test(s.palette?.[k] || '')) err(`set ${s.id} palette ${k} bad`);
  const pieces = (s.bonuses || []).map((b) => b.pieces).join(',');
  if (pieces !== '2,4') err(`set ${s.id} bonuses must be for 2 and 4 pieces`);
  for (const b of s.bonuses) for (const k of Object.keys(b.stats)) if (!STAT_KEYS.includes(k)) err(`set ${s.id} bonus stat ${k}`);
}

for (const it of data.items) {
  if (!KEBAB.test(it.id)) err(`item id not kebab: ${it.id}`);
  if (ids.has(it.id) || setIds.has(it.id)) err(`duplicate id ${it.id}`);
  ids.add(it.id);
  if (!data.slots.includes(it.slot)) err(`${it.id} bad slot ${it.slot}`);
  if (!RARITY.includes(it.rarity)) err(`${it.id} bad rarity`);
  if (!Number.isInteger(it.price) || it.price < 0) err(`${it.id} bad price`);
  if (JSON.stringify(Object.keys(it.stats)) !== JSON.stringify(STAT_KEYS)) err(`${it.id} stats keys`);
  if (it.set && !setIds.has(it.set)) err(`${it.id} unknown set ${it.set}`);
  if (it.set && !ARMOR.includes(it.slot)) err(`${it.id} only armor can be in a set`);
  if (!it.set && ARMOR.includes(it.slot)) err(`${it.id} armor without set`);
  if (!it.set && !it.palette) err(`${it.id} non-armor item needs its own palette`);
  if (it.price === 0 && /^shop/.test(it.unlock)) err(`${it.id} is a free shop item`);
  if (it.price > 0 && !/^shop/.test(it.unlock)) err(`${it.id} has a price but is not a shop item`);
  for (const f of ['name', 'unlock', 'lesson', 'flavor']) if (!it[f]) err(`${it.id} missing ${f}`);
}

for (const s of data.sets) {
  const pieces = data.items.filter((i) => i.set === s.id).map((i) => i.slot).sort();
  if (JSON.stringify(pieces) !== JSON.stringify([...ARMOR].sort())) err(`set ${s.id} must have exactly helmet, chest, legs, boots (has ${pieces})`);
}

// Effects: allowed types, shape, and the "no interchangeable items" rules.
const TYPES = data.effectTypes || {};
const checkEffects = (owner, effects) => {
  if (!Array.isArray(effects)) return err(`${owner} effects must be an array`);
  for (const e of effects) {
    if (!(e.type in TYPES)) err(`${owner} unknown effect type ${e.type}`);
    if (e.type === 'low_hp_power') err(`${owner} uses low_hp_power, which is reserved (revenge-trading pattern)`);
    if (typeof e.value !== 'number') err(`${owner} effect ${e.type} needs a numeric value`);
    if (!e.text) err(`${owner} effect ${e.type} needs text`);
  }
};
for (const s of data.sets) {
  for (const b of s.bonuses) checkEffects(`set ${s.id} ${b.pieces}pc`, b.effects);
  const four = s.bonuses.find((b) => b.pieces === 4);
  if (s.id !== 'rookie-threads' && !(four?.effects?.length)) err(`set ${s.id} needs a 4-piece effect`);
}
const starterEffects = data.sets.find((s) => s.id === 'rookie-threads').bonuses.flatMap((b) => b.effects);
if (starterEffects.length !== 1) err('starter outfit should have exactly one small effect');
for (const it of data.items) {
  checkEffects(it.id, it.effects);
  for (const [k, v] of Object.entries(it.stats)) if (v < -3) err(`${it.id} ${k} below -3`);
  if (it.price > 0 && !it.effects.length) err(`${it.id} is sold but has no effect`);
}
// within the same world and slot: no shared effect types, no identical stat spreads
const groups = new Map();
for (const it of data.items) {
  const key = `${it.world}:${it.slot}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(it);
}
for (const [key, list] of groups) {
  const seenType = new Map();
  const seenSpread = new Map();
  for (const it of list) {
    for (const e of it.effects) {
      if (seenType.has(e.type)) err(`world/slot ${key}: ${it.id} and ${seenType.get(e.type)} share effect ${e.type}`);
      seenType.set(e.type, it.id);
    }
    const spread = JSON.stringify(it.stats);
    if (seenSpread.has(spread)) err(`world/slot ${key}: ${it.id} and ${seenSpread.get(spread)} have identical stats`);
    seenSpread.set(spread, it.id);
  }
}
const coinBonus = data.items.flatMap((i) => i.effects).filter((e) => e.type === 'coin_bonus').reduce((s, e) => s + e.value, 0);
if (coinBonus > 25) err(`coin_bonus across all items is ${coinBonus}% (cap 25%)`);

const count = (slot) => data.items.filter((i) => i.slot === slot).length;
const w1Sets = data.sets.filter((s) => s.world === 1 && s.id !== 'rookie-threads').length;
if (w1Sets < 3) err('need 3+ World 1 armor sets');
for (const w of [2, 3, 4]) if (!data.sets.some((s) => s.world === w)) err(`no set for world ${w}`);
if (count('weapon') < 6) err('need 6+ weapons');
if (count('offhand') < 4) err('need 4+ offhands');
if (count('trinket') < 6) err('need 6+ trinkets');

// Summary
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
console.log(`items-v1.json: ${data.sets.length} sets, ${data.items.length} items (${count('weapon')} weapons, ${count('offhand')} offhands, ${count('trinket')} trinkets)`);
for (const w of [1, 2, 3, 4]) {
  const shop = data.items.filter((i) => i.world === w && i.price > 0);
  console.log(`  World ${w}: ${shop.length} shop items, total ${sum(shop.map((i) => i.price))} coins; free (quest/boss/achievement/starter): ${data.items.filter((i) => i.world === w && i.price === 0).length}`);
}
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n - ` + errors.join('\n - '));
  process.exit(1);
}
console.log('OK');
