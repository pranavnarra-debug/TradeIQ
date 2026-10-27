// Boss battles. The arena runs in the browser, but everything that decides
// rewards happens here: questions are drawn and graded server-side, and a
// claimed win must be backed by enough correct answers to have dealt the
// boss's HP.
import express from 'express';
import { query, withTransaction } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import {
  BOSSES, BOSS_BY_ID, requiredLessons, drawQuestions, resolveQuestion, minCorrectToWin, publicBoss,
} from '../services/battles.js';
import { ITEMS, computeStats } from '../services/game.js';
import { awardXp, touchStreak, checkAchievements, levelFor } from '../services/progress.js';
import { logActivity } from '../services/activity.js';
import { ensureStarterKit } from './game.js';
import { isAdmin } from '../services/adminAccess.js';

const router = express.Router();
router.use(authenticate);

const UUID = /^[0-9a-f-]{36}$/;
const MIN_WIN_SECONDS = 20;

async function playerContext(db, userId, admin = false) {
  // New players may reach the Arena before ever opening the Hideout.
  await ensureStarterKit(db, userId);
  const [done, exams, equipped, wins] = await Promise.all([
    db.query('SELECT lesson_id FROM lesson_completions WHERE user_id = $1', [userId]),
    db.query('SELECT COUNT(*)::int AS n FROM unit_exams WHERE user_id = $1 AND passed', [userId]),
    db.query('SELECT item_id FROM user_equipment WHERE user_id = $1', [userId]),
    db.query(
      `SELECT boss_id, COUNT(*)::int AS wins, MIN(duration_ms) AS best_ms, MIN(damage_taken) AS best_damage, MIN(finished_at) AS first_win
       FROM battles WHERE user_id = $1 AND status = 'won' GROUP BY boss_id`,
      [userId]
    ),
  ]);
  const completed = new Set(done.rows.map((r) => r.lesson_id));
  const { stats, effects, sets } = computeStats(equipped.rows.map((r) => r.item_id).filter((id) => ITEMS.has(id)));
  return {
    completed,
    admin,
    worldsCleared: exams.rows[0].n,
    loadout: { hp: 100 + 10 * exams.rows[0].n, stats, effects, sets },
    wins: new Map(wins.rows.map((r) => [r.boss_id, r])),
  };
}

function bossStatus(boss, ctx) {
  const req = requiredLessons(boss);
  const done = req.filter((id) => ctx.completed.has(id)).length;
  const w = ctx.wins.get(boss.id);
  return {
    ...publicBoss(boss),
    unlocked: ctx.admin || (req.length > 0 && done === req.length),
    progress: { done, total: req.length },
    wins: w?.wins || 0,
    bestMs: w?.best_ms ?? null,
    bestDamage: w?.best_damage ?? null,
    firstWin: w?.first_win ?? null,
    rewardItem: boss.rewards?.item ? { id: boss.rewards.item, name: ITEMS.get(boss.rewards.item)?.name } : null,
  };
}

// GET /api/battles
router.get('/', async (req, res, next) => {
  try {
    const ctx = await playerContext({ query }, req.user.userId, isAdmin(req));
    res.json({ bosses: BOSSES.map((b) => bossStatus(b, ctx)), loadout: ctx.loadout });
  } catch (err) {
    next(err);
  }
});

// POST /api/battles/:bossId/start
router.post('/:bossId/start', async (req, res, next) => {
  try {
    const boss = BOSS_BY_ID.get(req.params.bossId);
    if (!boss) return res.status(404).json({ error: 'No such boss' });
    const ctx = await playerContext({ query }, req.user.userId, isAdmin(req));
    const status = bossStatus(boss, ctx);
    if (!status.unlocked) return res.status(403).json({ error: `${status.unlockText} to challenge ${boss.name}.` });
    const deck = drawQuestions(boss);
    if (deck.length < 5) return res.status(503).json({ error: 'Not enough questions for this fight yet' });
    // One fight at a time: any unfinished battle is abandoned.
    await query(`UPDATE battles SET status = 'abandoned', finished_at = NOW() WHERE user_id = $1 AND status = 'active'`, [req.user.userId]);
    const { rows } = await query(
      'INSERT INTO battles (user_id, boss_id, questions, loadout) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.user.userId, boss.id, JSON.stringify(deck), JSON.stringify(ctx.loadout)]
    );
    res.json({ battleId: rows[0].id, boss: publicBoss(boss), loadout: ctx.loadout, questionCount: deck.length, minCorrect: minCorrectToWin(boss, ctx.loadout.stats.power) });
  } catch (err) {
    next(err);
  }
});

async function activeBattle(db, battleId, userId, lock = false) {
  if (!UUID.test(battleId)) return null;
  const { rows } = await db.query(
    `SELECT * FROM battles WHERE id = $1 AND user_id = $2 AND status = 'active'${lock ? ' FOR UPDATE' : ''}`,
    [battleId, userId]
  );
  return rows[0] || null;
}

// POST /api/battles/:battleId/next   -> the next unanswered question (no answer)
router.post('/:battleId/next', async (req, res, next) => {
  try {
    const b = await activeBattle({ query }, req.params.battleId, req.user.userId);
    if (!b) return res.status(404).json({ error: 'Battle not found or already over' });
    const answered = Object.keys(b.answered).length;
    // Decks recycle once exhausted so long fights never run dry.
    const index = answered;
    const entry = b.questions[index % b.questions.length];
    const q = resolveQuestion(entry);
    if (!q) return res.status(500).json({ error: 'Question missing' });
    res.json({ index, q: q.q, options: q.options, from: q.lessonTitle });
  } catch (err) {
    next(err);
  }
});

// POST /api/battles/:battleId/answer  { index, choice }   choice -1 = ran out of time
router.post('/:battleId/answer', async (req, res, next) => {
  try {
    const index = Number(req.body?.index);
    const choice = Number(req.body?.choice);
    if (!Number.isInteger(index) || index < 0 || !Number.isInteger(choice)) return res.status(400).json({ error: 'Bad answer' });
    const out = await withTransaction(async (db) => {
      const b = await activeBattle(db, req.params.battleId, req.user.userId, true);
      if (!b) return { status: 404, error: 'Battle not found or already over' };
      if (index !== Object.keys(b.answered).length) return { status: 409, error: 'Answer the current question' };
      const q = resolveQuestion(b.questions[index % b.questions.length]);
      const correct = choice === q.answer;
      const answered = { ...b.answered, [index]: { correct } };
      await db.query(
        `UPDATE battles SET answered = $1, correct = correct + $2, wrong = wrong + $3 WHERE id = $4`,
        [JSON.stringify(answered), correct ? 1 : 0, correct ? 0 : 1, b.id]
      );
      return { correct, answer: q.answer, explain: q.explain };
    });
    if (out.error) return res.status(out.status).json({ error: out.error });
    res.json(out);
  } catch (err) {
    next(err);
  }
});

// POST /api/battles/:battleId/hint  { index }  -> wrong options to cross out (needs a "hint" effect)
router.post('/:battleId/hint', async (req, res, next) => {
  try {
    const out = await withTransaction(async (db) => {
      const b = await activeBattle(db, req.params.battleId, req.user.userId, true);
      if (!b) return { status: 404, error: 'Battle not found or already over' };
      const allowed = (b.loadout?.effects || []).filter((e) => e.type === 'hint').length;
      if (b.hints_used >= allowed) return { status: 403, error: 'No hints left this fight' };
      const index = Object.keys(b.answered).length;
      const q = resolveQuestion(b.questions[index % b.questions.length]);
      const removeCount = Math.max(1, Math.round(Math.max(...(b.loadout.effects || []).filter((e) => e.type === 'hint').map((e) => e.value || 1))));
      const wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer).slice(0, Math.min(removeCount, q.options.length - 2));
      await db.query('UPDATE battles SET hints_used = hints_used + 1 WHERE id = $1', [b.id]);
      return { index, remove: wrong, left: allowed - b.hints_used - 1 };
    });
    if (out.error) return res.status(out.status).json({ error: out.error });
    res.json(out);
  } catch (err) {
    next(err);
  }
});

// POST /api/battles/:battleId/finish  { result: 'won'|'lost'|'abandoned', damageTaken }
router.post('/:battleId/finish', async (req, res, next) => {
  try {
    const result = req.body?.result;
    if (!['won', 'lost', 'abandoned'].includes(result)) return res.status(400).json({ error: 'Bad result' });
    const damageTaken = Math.max(0, Math.min(100000, Math.round(Number(req.body?.damageTaken) || 0)));
    const userId = req.user.userId;

    const out = await withTransaction(async (db) => {
      const b = await activeBattle(db, req.params.battleId, userId, true);
      if (!b) return { status: 404, error: 'Battle not found or already over' };
      const boss = BOSS_BY_ID.get(b.boss_id);
      const seconds = (Date.now() - new Date(b.started_at).getTime()) / 1000;
      const need = minCorrectToWin(boss, b.loadout?.stats?.power);
      if (result === 'won' && (b.correct < need || seconds < MIN_WIN_SECONDS)) {
        await db.query(`UPDATE battles SET status = 'abandoned', finished_at = NOW() WHERE id = $1`, [b.id]);
        return { status: 400, error: "That win doesn't add up. Every win needs enough correct answers behind it." };
      }

      const before = (await db.query('SELECT xp, coins FROM users WHERE id = $1 FOR UPDATE', [userId])).rows[0];
      let coins = 0;
      let item = null;
      let firstWin = false;
      let streak = null;
      let newAchievements = [];
      if (result === 'won') {
        const prior = await db.query(
          `SELECT
             (SELECT COUNT(*) FROM battles WHERE user_id = $1 AND boss_id = $2 AND status = 'won')::int AS wins,
             (SELECT COUNT(*) FROM xp_events WHERE user_id = $1 AND source = 'boss_repeat' AND created_at >= date_trunc('day', NOW()))::int AS paid_today`,
          [userId, boss.id]
        );
        firstWin = prior.rows[0].wins === 0;
        if (firstWin) {
          coins = boss.rewards?.firstWinCoins || 0;
          if (boss.rewards?.item && ITEMS.has(boss.rewards.item)) {
            const ins = await db.query(
              `INSERT INTO user_items (user_id, item_id, source) VALUES ($1, $2, 'boss') ON CONFLICT DO NOTHING RETURNING item_id`,
              [userId, boss.rewards.item]
            );
            if (ins.rows.length) item = ITEMS.get(boss.rewards.item);
          }
          await awardXp(db, userId, 'boss', boss.id, boss.rewards?.xp || 0, coins);
        } else if (prior.rows[0].paid_today === 0) {
          // Repeat wins pay a little, once per day across all bosses: farming isn't a strategy.
          coins = boss.rewards?.repeatCoins || 0;
          await awardXp(db, userId, 'boss_repeat', boss.id, 0, coins);
        }
        await logActivity(db, userId, 'boss_win', boss.id);
        if (damageTaken === 0) await logActivity(db, userId, 'boss_flawless', boss.id);
        streak = await touchStreak(db, userId);
      }
      if (b.correct > 0) await logActivity(db, userId, 'boss_correct', boss.id, b.correct);
      await db.query(
        `UPDATE battles SET status = $1, finished_at = NOW(), damage_taken = $2, duration_ms = $3, reward_coins = $4, reward_item = $5 WHERE id = $6`,
        [result, damageTaken, Math.round(seconds * 1000), coins, item?.id || null, b.id]
      );
      if (result === 'won') newAchievements = await checkAchievements(db, userId);
      const after = (await db.query('SELECT xp, coins FROM users WHERE id = $1', [userId])).rows[0];
      return {
        result, firstWin, coins: after.coins - before.coins, xp: after.xp - before.xp, item: item ? { id: item.id, name: item.name, rarity: item.rarity } : null,
        correct: b.correct, wrong: b.wrong, seconds: Math.round(seconds), damageTaken, streak,
        newAchievements: newAchievements.map(({ id, name, desc, sprite }) => ({ id, name, desc, sprite })),
        level: levelFor(after.xp), leveledUp: levelFor(after.xp).level > levelFor(before.xp).level,
      };
    });
    if (out.error) return res.status(out.status).json({ error: out.error });
    res.json(out);
  } catch (err) {
    next(err);
  }
});

export default router;
