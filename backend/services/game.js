// Game layer: item catalog, avatar appearance options, stats and set bonuses.
// Item definitions are data (content/game/items.json, written by the game
// designer); this module validates them once at startup.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'content', 'game', 'items.json');

export const SLOTS = ['helmet', 'chest', 'legs', 'boots', 'weapon', 'offhand', 'trinket'];
export const ARMOR_SLOTS = ['helmet', 'chest', 'legs', 'boots'];
export const STAT_KEYS = ['power', 'defense', 'focus', 'luck'];
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const HEX = /^#[0-9a-fA-F]{6}$/;
export const EFFECT_TYPES = [
  'streak_damage', 'first_strike', 'shield_on_correct', 'second_chance', 'time_bonus', 'heal_on_streak',
  'crit_damage', 'thorns', 'coin_bonus', 'xp_bonus', 'hint', 'dodge', 'low_hp_power', 'steady',
];
function checkEffects(effects, where, errors, extraTypes) {
  if (effects == null) return;
  if (!Array.isArray(effects)) { errors.push(`${where}: effects must be an array`); return; }
  for (const e of effects) {
    if (!EFFECT_TYPES.includes(e?.type) && !extraTypes.has(e?.type)) errors.push(`${where}: unknown effect ${e?.type}`);
    if (typeof e?.value !== 'number') errors.push(`${where}: effect value must be a number`);
    if (typeof e?.text !== 'string' || !e.text) errors.push(`${where}: effect needs text`);
  }
}
const ID = /^[a-z0-9-]{2,60}$/;

// ---------- appearance ----------
// Every option is an allowed value; the frontend renderer knows how to draw each.
export const APPEARANCE = {
  skin: ['#ffe0c7', '#f2c29b', '#d9a066', '#b07a4a', '#8a5532', '#5c3a21'],
  hairStyle: ['short', 'spiky', 'long', 'buzz', 'bun', 'curly', 'mohawk', 'none'],
  hairColor: ['#17140f', '#5a3a1e', '#9a6440', '#e0b04a', '#d9452f', '#ece4d6', '#4f7cff', '#ff7ab8'],
  eyeColor: ['#17140f', '#3355c8', '#12985a', '#7a4a1e', '#8b5cf6'],
  shirt: ['#3d8bfd', '#1fbf75', '#ff5a4e', '#ffd23f', '#8b5cf6', '#ff7a45', '#fffaf0', '#2b2b2b'],
  pants: ['#2f3e66', '#4a3b2a', '#17140f', '#6b7280', '#12985a', '#c7362c'],
  shoes: ['#17140f', '#fffaf0', '#9a6440', '#ff5a4e', '#3d8bfd', '#ffd23f'],
};
export const DEFAULT_APPEARANCE = {
  skin: APPEARANCE.skin[1], hairStyle: 'short', hairColor: APPEARANCE.hairColor[1], eyeColor: APPEARANCE.eyeColor[0],
  shirt: APPEARANCE.shirt[0], pants: APPEARANCE.pants[0], shoes: APPEARANCE.shoes[0],
};

export function cleanAppearance(input) {
  const out = {};
  for (const [key, allowed] of Object.entries(APPEARANCE)) {
    const v = input?.[key];
    if (v === undefined) continue;
    if (!allowed.includes(v)) return { error: `Invalid ${key}` };
    out[key] = v;
  }
  return { value: out };
}

// ---------- catalog ----------

function validateCatalog(cat) {
  const errors = [];
  const extraTypes = new Set(Object.keys(cat.effectTypes || {}));
  const setIds = new Set();
  for (const s of cat.sets || []) {
    if (!ID.test(s.id || '')) errors.push(`set id "${s.id}"`);
    if (setIds.has(s.id)) errors.push(`duplicate set ${s.id}`);
    setIds.add(s.id);
    for (const k of ['A', 'B', 'C']) if (!HEX.test(s.palette?.[k] || '')) errors.push(`set ${s.id} palette.${k}`);
    for (const b of s.bonuses || []) {
      if (!Number.isInteger(b.pieces) || b.pieces < 2 || b.pieces > 4) errors.push(`set ${s.id} bonus pieces`);
      for (const k of Object.keys(b.stats || {})) if (!STAT_KEYS.includes(k)) errors.push(`set ${s.id} bonus stat ${k}`);
      checkEffects(b.effects, `set ${s.id} bonus`, errors, extraTypes);
    }
  }
  const ids = new Set();
  for (const it of cat.items || []) {
    const w = `item ${it.id}`;
    if (!ID.test(it.id || '')) errors.push(`${w}: bad id`);
    if (ids.has(it.id)) errors.push(`${w}: duplicate`);
    ids.add(it.id);
    if (!SLOTS.includes(it.slot)) errors.push(`${w}: bad slot ${it.slot}`);
    if (it.set != null && !setIds.has(it.set)) errors.push(`${w}: unknown set ${it.set}`);
    if (it.set != null && !ARMOR_SLOTS.includes(it.slot)) errors.push(`${w}: only armor can belong to a set`);
    if (!RARITIES.includes(it.rarity)) errors.push(`${w}: bad rarity`);
    if (!Number.isInteger(it.world) || it.world < 1 || it.world > 4) errors.push(`${w}: bad world`);
    if (!Number.isInteger(it.price) || it.price < 0) errors.push(`${w}: bad price`);
    for (const k of Object.keys(it.stats || {})) if (!STAT_KEYS.includes(k)) errors.push(`${w}: unknown stat ${k}`);
    checkEffects(it.effects, w, errors, extraTypes);
    if (!it.set && it.palette) for (const k of ['A', 'B', 'C']) if (!HEX.test(it.palette[k] || '')) errors.push(`${w}: palette.${k}`);
  }
  return errors;
}

function loadCatalog() {
  const raw = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  // "unlock" is descriptive text that starts with a keyword:
  // starter | shop | quest | boss | achievement. Keep the keyword for logic.
  for (const it of raw.items || []) it.unlockKind = String(it.unlock || '').trim().split(/[\s:(]/)[0].toLowerCase();
  const errors = validateCatalog(raw);
  if (errors.length) {
    console.error(`[game] items.json has ${errors.length} problem(s):\n  ${errors.slice(0, 20).join('\n  ')}`);
    throw new Error('Invalid game catalog');
  }
  return raw;
}

export const CATALOG = loadCatalog();
export const ITEMS = new Map(CATALOG.items.map((i) => [i.id, i]));
export const SETS = new Map(CATALOG.sets.map((s) => [s.id, s]));
export const STARTER_ITEMS = CATALOG.items.filter((i) => i.unlockKind === 'starter');
console.log(`[game] Loaded ${CATALOG.items.length} items in ${CATALOG.sets.length} sets`);

/** The palette an item is drawn with: its own, else its set's. */
export function paletteFor(item) {
  return item.palette || SETS.get(item.set)?.palette || { A: '#c9d2dc', B: '#8a96a3', C: '#ffd23f' };
}

/** Total stats + active set bonuses for a list of equipped item ids. */
export function computeStats(equippedIds) {
  const stats = Object.fromEntries(STAT_KEYS.map((k) => [k, 0]));
  const setCounts = new Map();
  const effects = [];
  for (const id of equippedIds) {
    const it = ITEMS.get(id);
    if (!it) continue;
    for (const k of STAT_KEYS) stats[k] += it.stats?.[k] || 0;
    for (const e of it.effects || []) effects.push({ ...e, from: it.name });
    if (it.set) setCounts.set(it.set, (setCounts.get(it.set) || 0) + 1);
  }
  const sets = [];
  for (const [setId, count] of setCounts) {
    const set = SETS.get(setId);
    const bonuses = (set.bonuses || []).map((b) => ({ ...b, active: count >= b.pieces }));
    for (const b of bonuses) {
      if (!b.active) continue;
      for (const k of STAT_KEYS) stats[k] += b.stats?.[k] || 0;
      for (const e of b.effects || []) effects.push({ ...e, from: `${set.name} (${b.pieces}pc)` });
    }
    sets.push({ id: setId, name: set.name, count, bonuses });
  }
  return { stats, sets, effects };
}

/**
 * Which worlds' shops a player can buy from. Learning unlocks the game:
 * world 1 is open; world N opens once the player passes world N-1's exam.
 */
export function unlockedWorlds({ passedExams }) {
  const order = ['money', 'stocks', 'options', 'futures'];
  const out = [1];
  for (let n = 2; n <= 4; n++) {
    if (passedExams.has(order[n - 2])) out.push(n);
    else break;
  }
  return out;
}

export { validateCatalog };
