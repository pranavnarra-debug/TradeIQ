// Loads every chapter file under content/<unit>/ at startup and assembles the
// curriculum. Chapter files are discovered by filename order (ch1-..., ch2-...),
// so adding a chapter is just dropping a file in the folder.
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UNIT_META = [
  {
    id: 'money',
    number: 1,
    title: 'Money Moves',
    subtitle: 'How money flows, banking, investing basics, market hours and passive income',
    world: 'Coin Cove',
    color: '#1fbf75',
    sprite: 'penny',
  },
  {
    id: 'stocks',
    number: 2,
    title: 'Stock Smarts',
    subtitle: 'What stocks are, reading financials, value investing, charts and indicators',
    world: 'Candle City',
    color: '#3d8bfd',
    sprite: 'chip',
  },
  {
    id: 'options',
    number: 3,
    title: 'Options Arena',
    subtitle: 'Calls, puts, the Greeks and the strategies pros actually use',
    world: 'Volatility Volcano',
    color: '#ff7a45',
    sprite: 'hoot',
  },
  {
    id: 'futures',
    number: 4,
    title: 'Futures Frontier',
    subtitle: 'Contracts, margin, leverage, hedging and the 23-hour market',
    world: 'Orbit Exchange',
    color: '#8b5cf6',
    sprite: 'bolt',
  },
];

// Target minutes of lesson time per "day" when building the suggested schedule.
const MINUTES_PER_DAY = 30;

async function loadUnit(meta) {
  const dir = path.join(__dirname, meta.id);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^ch\d+.*\.js$/.test(f)) : [];
  files.sort((a, b) => parseInt(a.slice(2), 10) - parseInt(b.slice(2), 10));
  const chapters = [];
  for (const f of files) {
    try {
      const mod = await import(pathToFileURL(path.join(dir, f)).href);
      if (mod.default && Array.isArray(mod.default.lessons)) chapters.push(mod.default);
    } catch (err) {
      console.error(`[content] Failed to load ${meta.id}/${f}: ${err.message}`);
    }
  }
  return { ...meta, chapters };
}

export const UNITS = await Promise.all(UNIT_META.map(loadUnit));

// Flat lookups.
export const LESSONS = new Map();   // lessonId -> { lesson, unitId, chapterId, order, day }
export const LESSON_ORDER = [];     // lessonIds in curriculum order

let day = 1;
let minutesToday = 0;
let order = 0;
for (const unit of UNITS) {
  for (const chapter of unit.chapters) {
    for (const lesson of chapter.lessons) {
      if (minutesToday > 0 && minutesToday + lesson.minutes > MINUTES_PER_DAY) {
        day++;
        minutesToday = 0;
      }
      minutesToday += lesson.minutes;
      LESSONS.set(lesson.id, { lesson, unitId: unit.id, chapterId: chapter.id, order: order++, day });
      LESSON_ORDER.push(lesson.id);
    }
  }
  // Each unit exam gets its own day.
  if (unit.chapters.length) {
    unit.examDay = ++day;
    day++;
    minutesToday = 0;
  }
}
export const TOTAL_DAYS = Math.max(day - 1, 0);

export function unitLessonIds(unitId) {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit) return [];
  return unit.chapters.flatMap((c) => c.lessons.map((l) => l.id));
}

export function bossPool(unitId) {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit) return [];
  return unit.chapters.flatMap((c, ci) => (c.bossQuestions || []).map((q, qi) => ({ ...q, ref: [ci, qi] })));
}

function quizStep(lesson) {
  return lesson.steps[lesson.steps.length - 1];
}
export function lessonQuiz(lessonId) {
  const entry = LESSONS.get(lessonId);
  return entry ? quizStep(entry.lesson) : null;
}

/** Public catalog: everything a logged-out visitor may see (no lesson bodies). */
export function publicCatalog() {
  return {
    totalDays: TOTAL_DAYS,
    totalLessons: LESSON_ORDER.length,
    units: UNITS.map((u) => ({
      id: u.id,
      number: u.number,
      title: u.title,
      subtitle: u.subtitle,
      world: u.world,
      color: u.color,
      sprite: u.sprite,
      examDay: u.examDay ?? null,
      lessonCount: u.chapters.reduce((n, c) => n + c.lessons.length, 0),
      minutes: u.chapters.reduce((n, c) => n + c.lessons.reduce((m, l) => m + l.minutes, 0), 0),
      chapters: u.chapters.map((c) => ({
        id: c.id,
        title: c.title,
        blurb: c.blurb,
        lessons: c.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          summary: l.summary,
          minutes: l.minutes,
          icon: l.icon,
          steps: l.steps.length,
          questions: quizStep(l)?.questions?.length || 0,
          day: LESSONS.get(l.id).day,
        })),
      })),
    })),
  };
}

const counts = UNITS.map((u) => `${u.id}:${u.chapters.reduce((n, c) => n + c.lessons.length, 0)}`).join(' ');
console.log(`[content] Loaded ${LESSON_ORDER.length} lessons (${counts}) across ${TOTAL_DAYS} days`);
