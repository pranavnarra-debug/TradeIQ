// Curriculum API. The catalog (titles, summaries, schedule) is public so
// visitors can browse the course map; lesson bodies, grading and exams need
// an account.
import express from 'express';
import crypto from 'crypto';
import { query, withTransaction } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import {
  UNITS, LESSONS, LESSON_ORDER, publicCatalog, lessonQuiz, unitLessonIds, bossPool,
} from '../content/index.js';
import { awardXp, touchStreak, checkAchievements, levelFor, ACHIEVEMENTS } from '../services/progress.js';
import { signExamToken, verifyExamToken } from '../services/tokens.js';

const router = express.Router();

const LESSON_PASS = 60;
const EXAM_PASS = 70;
const EXAM_SIZE = 15;
const EXAM_XP = 200;
const EXAM_COINS = 150;

const catalogCache = publicCatalog();

// ---------- public ----------

router.get('/catalog', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(catalogCache);
});

router.get('/achievements', (req, res) => {
  res.json(ACHIEVEMENTS.map(({ id, name, desc, sprite }) => ({ id, name, desc, sprite })));
});

// ---------- signed-in ----------
router.use(authenticate);

// GET /api/lessons/progress
router.get('/progress', async (req, res, next) => {
  try {
    const id = req.user.userId;
    const [comp, exams, ach, user, today, week] = await Promise.all([
      query('SELECT lesson_id, best_score, attempts, first_completed_at FROM lesson_completions WHERE user_id = $1', [id]),
      query('SELECT unit_id, best_score, passed, attempts, passed_at FROM unit_exams WHERE user_id = $1', [id]),
      query('SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1 ORDER BY unlocked_at', [id]),
      query('SELECT xp, coins, streak_current, streak_best, streak_last_day, streak_freezes, timezone FROM users WHERE id = $1', [id]),
      query(
        `SELECT COALESCE(SUM(e.amount), 0)::int AS xp FROM xp_events e JOIN users u ON u.id = e.user_id
         WHERE e.user_id = $1 AND (e.created_at AT TIME ZONE COALESCE(u.timezone, 'America/New_York'))::date
           = (NOW() AT TIME ZONE COALESCE(u.timezone, 'America/New_York'))::date`,
        [id]
      ),
      query(`SELECT COALESCE(SUM(amount), 0)::int AS xp FROM xp_events WHERE user_id = $1 AND created_at >= date_trunc('week', NOW())`, [id]),
    ]);
    const completions = {};
    comp.rows.forEach((r) => { completions[r.lesson_id] = { score: r.best_score, attempts: r.attempts, at: r.first_completed_at }; });
    const unitExams = {};
    exams.rows.forEach((r) => { unitExams[r.unit_id] = { score: r.best_score, passed: r.passed, attempts: r.attempts, passedAt: r.passed_at }; });
    const nextLessonId = LESSON_ORDER.find((lid) => !completions[lid]) || null;
    const u = user.rows[0];
    res.json({
      completions,
      unitExams,
      achievements: ach.rows.map((r) => ({ id: r.achievement_id, at: r.unlocked_at })),
      nextLessonId,
      xp: u.xp,
      coins: u.coins,
      level: levelFor(u.xp),
      streak: u.streak_current,
      streakBest: u.streak_best,
      streakLastDay: u.streak_last_day,
      streakFreezes: u.streak_freezes,
      xpToday: today.rows[0].xp,
      xpThisWeek: week.rows[0].xp,
      totalLessons: LESSON_ORDER.length,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/lessons/lesson/:lessonId  -> full lesson content
router.get('/lesson/:lessonId', (req, res) => {
  const entry = LESSONS.get(req.params.lessonId);
  if (!entry) return res.status(404).json({ error: 'Lesson not found' });
  const idx = LESSON_ORDER.indexOf(entry.lesson.id);
  const unit = UNITS.find((u) => u.id === entry.unitId);
  const chapter = unit.chapters.find((c) => c.id === entry.chapterId);
  res.json({
    ...entry.lesson,
    unitId: entry.unitId,
    unitTitle: unit.title,
    unitColor: unit.color,
    chapterId: entry.chapterId,
    chapterTitle: chapter.title,
    day: entry.day,
    prevLessonId: LESSON_ORDER[idx - 1] || null,
    nextLessonId: LESSON_ORDER[idx + 1] || null,
  });
});

// POST /api/lessons/lesson/:lessonId/complete  { answers: [optionIndex per quiz question] }
router.post('/lesson/:lessonId/complete', async (req, res, next) => {
  try {
    const entry = LESSONS.get(req.params.lessonId);
    if (!entry) return res.status(404).json({ error: 'Lesson not found' });
    const quiz = lessonQuiz(entry.lesson.id);
    const answers = req.body?.answers;
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length || !answers.every((a) => Number.isInteger(a))) {
      return res.status(400).json({ error: 'Answer every quiz question first' });
    }
    const correct = quiz.questions.map((q, i) => answers[i] === q.answer);
    const score = Math.round((correct.filter(Boolean).length / quiz.questions.length) * 100);
    const passed = score >= LESSON_PASS;
    const userId = req.user.userId;

    const result = await withTransaction(async (db) => {
      const before = (await db.query('SELECT xp, coins FROM users WHERE id = $1 FOR UPDATE', [userId])).rows[0];
      if (!passed) return { xpGained: 0, coinsGained: 0, newAchievements: [], streak: null, before, after: before, firstTime: false };

      const prev = (await db.query(
        'SELECT best_score, xp_awarded FROM lesson_completions WHERE user_id = $1 AND lesson_id = $2',
        [userId, entry.lesson.id]
      )).rows[0];

      // First pass: 20 base + up to 30 for score. Retakes only pay the score difference.
      const target = 20 + Math.round(score * 0.3);
      let xpGained = 0;
      let coinsGained = 0;
      if (!prev) {
        xpGained = target;
        coinsGained = 10 + (score === 100 ? 5 : 0);
        await db.query(
          `INSERT INTO lesson_completions (user_id, lesson_id, unit_id, best_score, xp_awarded) VALUES ($1, $2, $3, $4, $5)`,
          [userId, entry.lesson.id, entry.unitId, score, xpGained]
        );
        await awardXp(db, userId, 'lesson', entry.lesson.id, xpGained, coinsGained);
      } else {
        xpGained = Math.max(0, target - prev.xp_awarded);
        coinsGained = score === 100 && prev.best_score < 100 ? 5 : 0;
        await db.query(
          `UPDATE lesson_completions SET best_score = GREATEST(best_score, $3), attempts = attempts + 1,
             xp_awarded = xp_awarded + $4, last_completed_at = NOW() WHERE user_id = $1 AND lesson_id = $2`,
          [userId, entry.lesson.id, score, xpGained]
        );
        await awardXp(db, userId, 'lesson_retry', entry.lesson.id, xpGained, coinsGained);
      }
      const streak = await touchStreak(db, userId);
      const newAchievements = await checkAchievements(db, userId);
      const after = (await db.query('SELECT xp, coins FROM users WHERE id = $1', [userId])).rows[0];
      return { xpGained, coinsGained, newAchievements, streak, before, after, firstTime: !prev };
    });

    const lvlBefore = levelFor(result.before.xp);
    const lvlAfter = levelFor(result.after.xp);
    res.json({
      passed,
      score,
      passMark: LESSON_PASS,
      correct,
      firstTime: result.firstTime,
      xpGained: result.after.xp - result.before.xp,
      lessonXp: result.xpGained,
      coinsGained: result.after.coins - result.before.coins,
      streak: result.streak,
      newAchievements: result.newAchievements.map(({ id, name, desc, sprite }) => ({ id, name, desc, sprite })),
      level: lvlAfter,
      leveledUp: lvlAfter.level > lvlBefore.level,
      nextLessonId: LESSON_ORDER[LESSON_ORDER.indexOf(entry.lesson.id) + 1] || null,
    });
  } catch (err) {
    next(err);
  }
});

function shuffled(n) {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// GET /api/lessons/exam/:unitId   -> questions WITHOUT answers + a signed exam token
router.get('/exam/:unitId', async (req, res, next) => {
  try {
    const unit = UNITS.find((u) => u.id === req.params.unitId);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    const ids = unitLessonIds(unit.id);
    const done = await query(
      'SELECT COUNT(*)::int AS n FROM lesson_completions WHERE user_id = $1 AND unit_id = $2',
      [req.user.userId, unit.id]
    );
    if (done.rows[0].n < ids.length) {
      return res.status(403).json({ error: `Finish all ${ids.length} lessons in ${unit.title} to unlock the exam (${done.rows[0].n} done).`, code: 'EXAM_LOCKED' });
    }
    const pool = bossPool(unit.id);
    const pick = shuffled(pool.length).slice(0, Math.min(EXAM_SIZE, pool.length)).map((i) => pool[i]);
    const items = pick.map((q) => ({ ref: q.ref, perm: shuffled(q.options.length) }));
    const token = signExamToken({ uid: req.user.userId, unit: unit.id, items });
    res.json({
      unitId: unit.id,
      title: `${unit.title} Final Exam`,
      passMark: EXAM_PASS,
      token,
      questions: pick.map((q, i) => ({ q: q.q, options: items[i].perm.map((p) => q.options[p]) })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/lessons/exam/:unitId  { token, answers: [displayed option index] }
router.post('/exam/:unitId', async (req, res, next) => {
  try {
    let payload;
    try {
      payload = verifyExamToken(String(req.body?.token || ''));
    } catch {
      return res.status(400).json({ error: 'This exam expired. Start a new one.' });
    }
    if (payload.uid !== req.user.userId || payload.unit !== req.params.unitId) {
      return res.status(400).json({ error: 'Exam does not match' });
    }
    const unit = UNITS.find((u) => u.id === payload.unit);
    const answers = req.body?.answers;
    if (!Array.isArray(answers) || answers.length !== payload.items.length) {
      return res.status(400).json({ error: 'Answer every question first' });
    }
    const results = payload.items.map((item, i) => {
      const q = unit.chapters[item.ref[0]].bossQuestions[item.ref[1]];
      const chosen = item.perm[answers[i]];
      return {
        correct: chosen === q.answer,
        correctIndex: item.perm.indexOf(q.answer),
        explain: q.explain,
      };
    });
    const score = Math.round((results.filter((r) => r.correct).length / results.length) * 100);
    const passed = score >= EXAM_PASS;
    const userId = req.user.userId;

    const out = await withTransaction(async (db) => {
      const before = (await db.query('SELECT xp, coins FROM users WHERE id = $1 FOR UPDATE', [userId])).rows[0];
      const prev = (await db.query('SELECT passed FROM unit_exams WHERE user_id = $1 AND unit_id = $2', [userId, unit.id])).rows[0];
      await db.query(
        `INSERT INTO unit_exams (user_id, unit_id, best_score, passed, passed_at) VALUES ($1, $2, $3, $4, CASE WHEN $4 THEN NOW() END)
         ON CONFLICT (user_id, unit_id) DO UPDATE SET best_score = GREATEST(unit_exams.best_score, $3),
           passed = unit_exams.passed OR $4, attempts = unit_exams.attempts + 1, last_attempt_at = NOW(),
           passed_at = COALESCE(unit_exams.passed_at, CASE WHEN $4 THEN NOW() END)`,
        [userId, unit.id, score, passed]
      );
      let newAchievements = [];
      let streak = null;
      if (passed && !prev?.passed) await awardXp(db, userId, 'exam', unit.id, EXAM_XP, EXAM_COINS);
      if (passed) {
        streak = await touchStreak(db, userId);
        newAchievements = await checkAchievements(db, userId);
      }
      const after = (await db.query('SELECT xp, coins FROM users WHERE id = $1', [userId])).rows[0];
      return { before, after, newAchievements, streak };
    });

    res.json({
      score,
      passed,
      passMark: EXAM_PASS,
      results,
      xpGained: out.after.xp - out.before.xp,
      coinsGained: out.after.coins - out.before.coins,
      streak: out.streak,
      newAchievements: out.newAchievements.map(({ id, name, desc, sprite }) => ({ id, name, desc, sprite })),
      level: levelFor(out.after.xp),
      leveledUp: levelFor(out.after.xp).level > levelFor(out.before.xp).level,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/lessons/leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const [weekly, allTime, me] = await Promise.all([
      query(
        `SELECT u.username, u.avatar, SUM(e.amount)::int AS xp FROM xp_events e JOIN users u ON u.id = e.user_id
         WHERE e.created_at >= date_trunc('week', NOW()) AND u.show_on_leaderboard AND u.is_active
         GROUP BY u.id ORDER BY xp DESC LIMIT 25`
      ),
      query(
        `SELECT username, avatar, xp, streak_current AS streak FROM users
         WHERE show_on_leaderboard AND is_active AND xp > 0 ORDER BY xp DESC LIMIT 25`
      ),
      query(
        `SELECT
           (SELECT COALESCE(SUM(amount),0)::int FROM xp_events WHERE user_id = $1 AND created_at >= date_trunc('week', NOW())) AS week_xp,
           (SELECT xp FROM users WHERE id = $1) AS xp,
           (SELECT COUNT(*)::int + 1 FROM users WHERE show_on_leaderboard AND is_active AND xp > (SELECT xp FROM users WHERE id = $1)) AS all_time_rank`,
        [req.user.userId]
      ),
    ]);
    res.json({ weekly: weekly.rows, allTime: allTime.rows, me: me.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
