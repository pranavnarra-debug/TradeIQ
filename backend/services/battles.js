// Boss definitions (content/game/bosses.json, written by the game designer)
// plus the rules the server enforces: unlocks, question draws and the minimum
// number of correct answers a real win requires.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { UNITS } from '../content/index.js';
import { ITEMS } from './game.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOSSES_PATH = path.join(__dirname, '..', 'content', 'game', 'bosses.json');

const PATTERNS = ['ring', 'volley', 'aimed', 'rain', 'charge', 'homing', 'wall', 'slam'];
const MECHANICS = ['regen', 'enrage_below', 'shield_phase', 'mood_swing', 'countdown', 'settlement', 'summon', 'mirror', 'none'];
const UNIT_IDS = ['money', 'stocks', 'options', 'futures'];

function validate(list) {
  const errors = [];
  const ids = new Set();
  for (const b of list) {
    const w = `boss ${b.id}`;
    if (!/^[a-z0-9-]+$/.test(b.id || '')) errors.push(`${w}: bad id`);
    if (ids.has(b.id)) errors.push(`${w}: duplicate`);
    ids.add(b.id);
    if (!(b.hp > 0)) errors.push(`${w}: hp`);
    if (!UNIT_IDS.includes(b.unlock?.unit)) errors.push(`${w}: unlock.unit`);
    if (!UNIT_IDS.includes(b.questionPool?.unit)) errors.push(`${w}: questionPool.unit`);
    if (!MECHANICS.includes(b.mechanic?.type)) errors.push(`${w}: mechanic ${b.mechanic?.type}`);
    if (!Array.isArray(b.attacks) || !b.attacks.length) errors.push(`${w}: attacks`);
    for (const a of b.attacks || []) if (!PATTERNS.includes(a.pattern)) errors.push(`${w}: pattern ${a.pattern}`);
    if (b.rewards?.item && !ITEMS.has(b.rewards.item)) errors.push(`${w}: reward item ${b.rewards.item} not in catalog`);
  }
  return errors;
}

function load() {
  if (!fs.existsSync(BOSSES_PATH)) {
    console.warn('[battles] content/game/bosses.json not found; no bosses available');
    return [];
  }
  const list = JSON.parse(fs.readFileSync(BOSSES_PATH, 'utf8')).bosses || [];
  const errors = validate(list);
  if (errors.length) {
    console.error(`[battles] bosses.json problems:\n  ${errors.join('\n  ')}`);
    throw new Error('Invalid bosses.json');
  }
  return list.sort((a, b) => a.world - b.world || a.order - b.order);
}

export const BOSSES = load();
export const BOSS_BY_ID = new Map(BOSSES.map((b) => [b.id, b]));
console.log(`[battles] Loaded ${BOSSES.length} bosses`);

function unit(id) { return UNITS.find((u) => u.id === id); }

/** Lesson ids a boss requires (one chapter, or the whole unit for "all"). */
export function requiredLessons(boss) {
  const u = unit(boss.unlock.unit);
  if (!u) return [];
  const chapters = boss.unlock.chapter === 'all' ? u.chapters : [u.chapters[Number(boss.unlock.chapter) - 1]].filter(Boolean);
  return chapters.flatMap((c) => c.lessons.map((l) => l.id));
}

export function unlockText(boss) {
  const u = unit(boss.unlock.unit);
  if (boss.unlock.chapter === 'all') return `Finish every lesson in ${u?.title || boss.unlock.unit}`;
  const ch = u?.chapters[Number(boss.unlock.chapter) - 1];
  return `Finish ${u?.title} chapter ${boss.unlock.chapter}${ch ? `: ${ch.title}` : ''}`;
}

/** Every multiple-choice question from the boss's question pool. */
function poolFor(boss) {
  const u = unit(boss.questionPool.unit);
  if (!u) return [];
  const chapters = boss.questionPool.chapters === 'all'
    ? u.chapters
    : (boss.questionPool.chapters || []).map((n) => u.chapters[Number(n) - 1]).filter(Boolean);
  const out = [];
  for (const ch of chapters) {
    for (const lesson of ch.lessons) {
      lesson.steps.forEach((s, si) => {
        if (s.type === 'quiz') s.questions.forEach((q, qi) => out.push({ ref: [lesson.id, si, qi], q: q.q, options: q.options, answer: q.answer, explain: q.explain }));
        if (s.type === 'check' && s.options.length >= 3) out.push({ ref: [lesson.id, si, -1], q: s.question, options: s.options, answer: s.answer, explain: s.explain });
      });
    }
  }
  return out;
}

const shuffled = (n) => {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/** Draw a battle's question deck: refs + option shuffles, stored server-side. */
export function drawQuestions(boss, count = 40) {
  const pool = poolFor(boss);
  return shuffled(pool.length).slice(0, Math.min(count, pool.length)).map((i) => ({ ref: pool[i].ref, perm: shuffled(pool[i].options.length) }));
}

/** Resolve a stored deck entry back into the question (with answer). */
export function resolveQuestion(entry) {
  const [lessonId, si, qi] = entry.ref;
  for (const u of UNITS) for (const ch of u.chapters) for (const l of ch.lessons) {
    if (l.id !== lessonId) continue;
    const s = l.steps[si];
    if (!s) return null;
    const base = qi >= 0 ? s.questions[qi] : { q: s.question, options: s.options, answer: s.answer, explain: s.explain };
    return {
      q: base.q,
      options: entry.perm.map((p) => base.options[p]),
      answer: entry.perm.indexOf(base.answer),
      explain: base.explain,
      lessonTitle: l.title,
    };
  }
  return null;
}

/**
 * Smallest number of correct answers that could possibly deal the boss's HP.
 * Each correct answer is one charge pip worth (30 + 3 x power) damage, and we
 * allow a generous 3x for every multiplier stacking at once.
 */
export function minCorrectToWin(boss, power) {
  const perPip = 30 + 3 * Math.max(0, power || 0);
  return Math.max(3, Math.ceil(boss.hp / (perPip * 3)));
}

export function publicBoss(b) {
  // Everything the client needs to render and run the fight (no secrets here).
  const { questionPool, ...rest } = b;
  return { ...rest, unlockText: unlockText(b) };
}
