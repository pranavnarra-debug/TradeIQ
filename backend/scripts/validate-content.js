#!/usr/bin/env node
// Validates lesson content files against content/SCHEMA.md.
//   node scripts/validate-content.js                 -> every chapter in content/*/
//   node scripts/validate-content.js content/x/y.js  -> just those files
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { ICONS, DIAGRAMS, WIDGETS, SPRITES, MOODS, CALLOUT_VARIANTS } from '../content/registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'content');

const ALLOWED_TAGS = new Set(['p', 'strong', 'em', 'ul', 'ol', 'li', 'h4', 'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span']);
const ALLOWED_SPAN_CLASSES = new Set(['hl', 'up', 'down', 'term']);
const BANNED = [
  'dive in', 'delve', "today's fast-paced", 'unlock', 'embark', 'journey', 'navigate the world',
  'game-changer', 'game changer', "it's important to note", 'in conclusion', 'whether you\'re',
  'buckle up', "let's explore", 'landscape', 'realm', 'harness',
];
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function listChapterFiles() {
  const out = [];
  for (const unit of fs.readdirSync(contentDir)) {
    const dir = path.join(contentDir, unit);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.js')) out.push(path.join(dir, f));
  }
  return out.sort();
}

function wordCount(html = '') {
  return html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

function checkHtml(html, where, errors) {
  if (typeof html !== 'string' || !html.trim()) { errors.push(`${where}: html missing`); return; }
  const tagRe = /<\/?([a-zA-Z0-9]+)([^>]*)>/g;
  let m;
  while ((m = tagRe.exec(html))) {
    const tag = m[1].toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) errors.push(`${where}: tag <${tag}> not allowed`);
    if (/style\s*=|on\w+\s*=|href\s*=|src\s*=/i.test(m[2])) errors.push(`${where}: attribute not allowed in <${tag}${m[2]}>`);
    if (tag === 'span' && !m[0].startsWith('</')) {
      const cls = /class="([^"]+)"/.exec(m[2]);
      if (!cls || !ALLOWED_SPAN_CLASSES.has(cls[1])) errors.push(`${where}: span needs class hl|up|down|term`);
      if (cls && cls[1] === 'term' && !/data-def="[^"]+"/.test(m[2])) errors.push(`${where}: term span needs data-def`);
    }
  }
}

function checkText(s, where, errors, warnings) {
  if (typeof s !== 'string' || !s.trim()) { errors.push(`${where}: text missing`); return; }
  const lower = s.toLowerCase();
  for (const b of BANNED) if (lower.includes(b)) warnings.push(`${where}: banned phrase "${b}"`);
  if (EMOJI_RE.test(s)) warnings.push(`${where}: contains emoji`);
}

function checkQuestion(q, where, errors, warnings, minOptions = 4) {
  checkText(q.q, `${where}.q`, errors, warnings);
  if (!Array.isArray(q.options) || q.options.length < minOptions || q.options.length > 4) errors.push(`${where}: needs ${minOptions === 4 ? 'exactly 4' : `${minOptions}-4`} options`);
  else q.options.forEach((o, i) => checkText(o, `${where}.options[${i}]`, errors, warnings));
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length || 0)) errors.push(`${where}: answer index out of range`);
  checkText(q.explain, `${where}.explain`, errors, warnings);
}

function validateStep(step, where, errors, warnings) {
  switch (step.type) {
    case 'read':
      checkHtml(step.html, where, errors);
      collectText(step.html, where, errors, warnings);
      if (step.sprite) {
        if (!SPRITES.includes(step.sprite.who)) errors.push(`${where}: unknown sprite ${step.sprite.who}`);
        if (!MOODS.includes(step.sprite.mood)) errors.push(`${where}: unknown mood ${step.sprite.mood}`);
        checkText(step.sprite.say, `${where}.sprite.say`, errors, warnings);
        if ((step.sprite.say || '').length > 180) warnings.push(`${where}: sprite line is long`);
      }
      if (wordCount(step.html) > 260) warnings.push(`${where}: read step is ${wordCount(step.html)} words (aim <= 220)`);
      return wordCount(step.html);
    case 'callout':
      if (!CALLOUT_VARIANTS.includes(step.variant)) errors.push(`${where}: bad callout variant ${step.variant}`);
      checkText(step.title, `${where}.title`, errors, warnings);
      checkHtml(step.html, where, errors);
      collectText(step.html, where, errors, warnings);
      return wordCount(step.html);
    case 'cards':
      if (!Array.isArray(step.cards) || step.cards.length < 2 || step.cards.length > 8) errors.push(`${where}: cards needs 2-8 cards`);
      (step.cards || []).forEach((c, i) => { checkText(c.front, `${where}.cards[${i}].front`, errors, warnings); checkText(c.back, `${where}.cards[${i}].back`, errors, warnings); });
      return (step.cards || []).reduce((n, c) => n + wordCount(c.back), 0);
    case 'diagram':
      if (!DIAGRAMS.includes(step.name)) errors.push(`${where}: unknown diagram "${step.name}"`);
      checkText(step.caption, `${where}.caption`, errors, warnings);
      return wordCount(step.caption);
    case 'widget':
      if (!WIDGETS.includes(step.name)) errors.push(`${where}: unknown widget "${step.name}"`);
      checkText(step.caption, `${where}.caption`, errors, warnings);
      return wordCount(step.caption);
    case 'check':
      checkQuestion({ q: step.question, options: step.options, answer: step.answer, explain: step.explain }, where, errors, warnings, 3);
      return 0;
    case 'truefalse':
      checkText(step.statement, `${where}.statement`, errors, warnings);
      if (typeof step.answer !== 'boolean') errors.push(`${where}: answer must be boolean`);
      checkText(step.explain, `${where}.explain`, errors, warnings);
      return 0;
    case 'numeric':
      checkText(step.question, `${where}.question`, errors, warnings);
      if (typeof step.answer !== 'number' || !Number.isFinite(step.answer)) errors.push(`${where}: answer must be a number`);
      if (typeof step.tolerance !== 'number' || step.tolerance < 0) errors.push(`${where}: tolerance must be a non-negative number`);
      if (!['$', '%', ''].includes(step.unit)) errors.push(`${where}: unit must be '$', '%' or ''`);
      checkText(step.explain, `${where}.explain`, errors, warnings);
      return 0;
    case 'match':
      checkText(step.prompt, `${where}.prompt`, errors, warnings);
      if (!Array.isArray(step.pairs) || step.pairs.length < 3 || step.pairs.length > 5) errors.push(`${where}: match needs 3-5 pairs`);
      (step.pairs || []).forEach((p, i) => { checkText(p.left, `${where}.pairs[${i}].left`, errors, warnings); checkText(p.right, `${where}.pairs[${i}].right`, errors, warnings); });
      return 0;
    case 'order':
      checkText(step.prompt, `${where}.prompt`, errors, warnings);
      if (!Array.isArray(step.items) || step.items.length < 3 || step.items.length > 6) errors.push(`${where}: order needs 3-6 items`);
      checkText(step.explain, `${where}.explain`, errors, warnings);
      return 0;
    case 'quiz':
      if (!Array.isArray(step.questions) || step.questions.length < 4) errors.push(`${where}: quiz needs 4+ questions`);
      (step.questions || []).forEach((q, i) => checkQuestion(q, `${where}.questions[${i}]`, errors, warnings));
      return 0;
    default:
      errors.push(`${where}: unknown step type "${step.type}"`);
      return 0;
  }
}

function collectText(html, where, errors, warnings) {
  if (typeof html === 'string') checkText(html.replace(/<[^>]+>/g, ' '), where, errors, warnings);
}

const INTERACTIVE = new Set(['check', 'truefalse', 'numeric', 'match', 'order', 'widget']);

export async function validateChapterFile(file, seenIds = new Set()) {
  const errors = [];
  const warnings = [];
  let chapter;
  try {
    chapter = (await import(pathToFileURL(path.resolve(file)).href)).default;
  } catch (err) {
    return { file, errors: [`could not import: ${err.message}`], warnings, lessons: 0, words: 0 };
  }
  if (!chapter || typeof chapter !== 'object') return { file, errors: ['no default export'], warnings, lessons: 0, words: 0 };

  if (!/^[a-z0-9-]+$/.test(chapter.id || '')) errors.push('chapter.id must be kebab-case');
  checkText(chapter.title, 'chapter.title', errors, warnings);
  checkText(chapter.blurb, 'chapter.blurb', errors, warnings);
  if (!Array.isArray(chapter.lessons) || chapter.lessons.length === 0) errors.push('chapter.lessons empty');
  if (!Array.isArray(chapter.bossQuestions) || chapter.bossQuestions.length < 3) errors.push('chapter.bossQuestions needs 3+ questions');
  (chapter.bossQuestions || []).forEach((q, i) => checkQuestion(q, `bossQuestions[${i}]`, errors, warnings));

  let totalWords = 0;
  for (const [li, lesson] of (chapter.lessons || []).entries()) {
    const lw = `lesson[${li}] ${lesson.id || '?'}`;
    if (!/^[a-z0-9-]+$/.test(lesson.id || '')) errors.push(`${lw}: id must be kebab-case`);
    if (seenIds.has(lesson.id)) errors.push(`${lw}: duplicate lesson id`);
    seenIds.add(lesson.id);
    checkText(lesson.title, `${lw}.title`, errors, warnings);
    checkText(lesson.summary, `${lw}.summary`, errors, warnings);
    if (!ICONS.includes(lesson.icon)) errors.push(`${lw}: unknown icon "${lesson.icon}"`);
    if (!Number.isInteger(lesson.minutes) || lesson.minutes < 3) errors.push(`${lw}: minutes must be an integer >= 3`);
    const steps = lesson.steps || [];
    if (steps.length < 8) warnings.push(`${lw}: only ${steps.length} steps`);
    if (!steps.length || steps[steps.length - 1].type !== 'quiz') errors.push(`${lw}: last step must be a quiz`);
    if (steps.filter((s) => s.type === 'quiz').length > 1) errors.push(`${lw}: only one quiz allowed (the last step)`);
    const interactive = steps.filter((s) => INTERACTIVE.has(s.type)).length;
    if (interactive < 3) warnings.push(`${lw}: only ${interactive} interactive steps before the quiz`);
    let words = 0;
    steps.forEach((s, si) => { words += validateStep(s, `${lw} step[${si}] (${s.type})`, errors, warnings) || 0; });
    if (words < 600) warnings.push(`${lw}: only ~${words} teaching words`);
    totalWords += words;
  }
  return { file, errors, warnings, lessons: (chapter.lessons || []).length, words: totalWords };
}

async function main() {
  const args = process.argv.slice(2);
  const files = args.length ? args : listChapterFiles();
  const seen = new Set();
  let failed = false;
  let totalLessons = 0;
  let totalWords = 0;
  for (const f of files) {
    const r = await validateChapterFile(f, seen);
    totalLessons += r.lessons;
    totalWords += r.words;
    const rel = path.relative(process.cwd(), r.file);
    console.log(`\n${r.errors.length ? 'FAIL' : 'ok  '} ${rel}  (${r.lessons} lessons, ~${r.words} words)`);
    r.errors.forEach((e) => console.log(`   error: ${e}`));
    r.warnings.forEach((w) => console.log(`   warn:  ${w}`));
    if (r.errors.length) failed = true;
  }
  console.log(`\n${files.length} file(s), ${totalLessons} lessons, ~${totalWords} words of teaching text.`);
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
