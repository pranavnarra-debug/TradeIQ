// Boss battles. The arena runs in the browser, but everything that decides
// rewards happens here: questions are drawn and graded server-side, and a
// claimed win must be backed by enough correct answers to have dealt the
// boss's HP.
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
import { monsterFor, dungeonLessons, floorRewards, coinCapFor, lootCapFor, DAILY_LOOT_CAP, DAILY_XP_CAP } from '../services/dungeon.js';

const router = express.Router();
router.use(authenticate);

const UUID = /^[0-9a-f-]{36}$/;
// The fastest a real win can be: small dungeon monsters go down quickly, big
// bosses can't. Wins also need enough correct answers (minCorrectToWin).
const minWinSeconds = (boss) => Math.min(20, 6 + boss.hp / 20);
// Pop Quizzes: the client asks one about every 30s of play; the server expects
// at least one per POP_EXPECT_SECONDS of wall time (looser, to allow for
// pauses and slow connections). Each wrong or skipped one costs coins.
const POP_EXPECT_SECONDS = 45;
const POP_COINS = 2;
const POP_MAX_COINS = 6;
const XP_BONUS_CAP = 25;

/** Battle XP with the loadout's xp_bonus gear (the loadout saved at start, never the client's). */
function withXpBonus(xp, loadout) {
  const pct = Math.min(XP_BONUS_CAP, (loadout?.effects || []).filter((e) => e.type === 'xp_bonus').reduce((s, e) => s + (e.value || 0), 0));
  return Math.round(xp * (1 + pct / 100));
}

/** review_queue gear: up to N distinct questions missed this fight, with the right answer and why. */
function journalFor(b) {
  const max = (b.loadout?.effects || []).filter((e) => e.type === 'review_queue').reduce((s, e) => s + (e.value || 0), 0);
  if (!max) return [];
  const seen = new Set();
  const out = [];
  for (const [index, a] of Object.entries(b.answered)) {
    if (a.correct || out.length >= max) continue;
    const q = resolveQuestion(b.questions[Number(index) % b.questions.length]);
    if (!q || seen.has(q.q)) continue;
    seen.add(q.q);
    out.push({ q: q.q, answer: q.options[q.answer], explain: q.explain });
  }
  return out;
}

/** A boss from bosses.json, or a Dungeon floor's monster ("dungeon-<floor>"). */
function bossFor(id) {
  const m = /^dungeon-(\d{1,4})$/.exec(String(id));
  return m ? monsterFor(Number(m[1])) : BOSS_BY_ID.get(id);
}

// ---------------------------------------------------------------- dungeon helpers
const LOOT_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content', 'game', 'dungeon-loot.json');
let lootCache = null;
function lootTable() {
  if (!lootCache && fs.existsSync(LOOT_PATH)) lootCache = JSON.parse(fs.readFileSync(LOOT_PATH, 'utf8'));
  return lootCache;
}
const bandFor = (table, floor) => table.bands.find((b) => floor >= b.fromFloor && (b.toFloor == null || floor <= b.toFloor)) || table.bands[table.bands.length - 1];

/** Rolls a floor's loot. Odds come from content/game/dungeon-loot.json and are shown to players. */
function rollLoot(floor, guardian) {
  const table = lootTable();
  if (!table) return null;
  const chance = guardian ? table.guardianDropChance : table.normalDropChance;
  if (crypto.randomInt(1_000_000) / 1_000_000 >= chance) return null;
  const weights = bandFor(table, floor).weights;
  const order = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = (crypto.randomInt(1_000_000) / 1_000_000) * total;
  let rarity = 'common';
  for (const [k, w] of Object.entries(weights)) { if ((r -= w) <= 0) { rarity = k; break; } }
  // Fall back to the next rarity down if nothing of this rarity drops this shallow.
  for (const rr of order.slice(order.indexOf(rarity))) {
    const pool = [...ITEMS.values()].filter((i) => i.unlockKind === 'dungeon' && i.rarity === rr && (i.minFloor || 1) <= floor);
    if (pool.length) return pool[crypto.randomInt(pool.length)];
  }
  return null;
}

async function dungeonProgress(db, userId, lock = false) {
  await db.query('INSERT INTO dungeon_progress (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);
  const { rows } = await db.query(
    `SELECT d.*, (NOW() AT TIME ZONE COALESCE(u.timezone, 'America/New_York'))::date::text AS today, d.day::text AS day_text
     FROM dungeon_progress d JOIN users u ON u.id = d.user_id WHERE d.user_id = $1${lock ? ' FOR UPDATE OF d' : ''}`,
    [userId]
  );
  const p = rows[0];
  if (p.day_text !== p.today) { p.coins_today = 0; p.xp_today = 0; p.drops_today = 0; }
  const lessons = await db.query(
    `SELECT COUNT(*)::int AS n FROM activity_log WHERE user_id = $1 AND kind = 'lesson_pass'
       AND (created_at AT TIME ZONE (SELECT COALESCE(timezone, 'America/New_York') FROM users WHERE id = $1))::date = $2::date`,
    [userId, p.today]
  );
  p.coin_cap = coinCapFor(lessons.rows[0].n);
  p.loot_cap = lootCapFor(lessons.rows[0].n);
  return p;
}

function dungeonView(p) {
  const table = lootTable();
  const next = p.current_floor + 1;
  return {
    currentFloor: p.current_floor,
    nextFloor: next,
    bestFloor: p.best_floor,
    runs: p.runs,
    coinsToday: p.coins_today,
    xpToday: p.xp_today,
    dropsToday: p.drops_today,
    caps: { coins: p.coin_cap, xp: DAILY_XP_CAP, maxCoins: 60, perLesson: 10, loot: p.loot_cap, maxLoot: DAILY_LOOT_CAP },
    monster: publicBoss({ ...monsterFor(next), questionPool: null }),
    odds: table ? {
      normalDropChance: table.normalDropChance,
      guardianDropChance: table.guardianDropChance,
      band: bandFor(table, next),
      bands: table.bands.map((b) => ({ fromFloor: b.fromFloor, toFloor: b.toFloor, oddsText: b.oddsText })),
    } : null,
    lootCount: [...ITEMS.values()].filter((i) => i.unlockKind === 'dungeon').length,
  };
}

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

// GET /api/battles/dungeon   -> your run, the next floor's monster, today's caps and the loot odds
router.get('/dungeon', async (req, res, next) => {
  try {
    const ctx = await playerContext({ query }, req.user.userId, isAdmin(req));
    const p = await dungeonProgress({ query }, req.user.userId);
    res.json({ ...dungeonView(p), loadout: ctx.loadout });
  } catch (err) {
    next(err);
  }
});

// POST /api/battles/:bossId/start   (bossId "dungeon" = the next floor of your run)
router.post('/:bossId/start', async (req, res, next) => {
  try {
    const ctx = await playerContext({ query }, req.user.userId, isAdmin(req));
    let boss;
    if (req.params.bossId === 'dungeon') {
      const p = await dungeonProgress({ query }, req.user.userId);
      boss = { ...monsterFor(p.current_floor + 1), questionPool: { lessons: dungeonLessons(ctx.completed) } };
    } else {
      boss = BOSS_BY_ID.get(req.params.bossId);
      if (!boss) return res.status(404).json({ error: 'No such boss' });
      const status = bossStatus(boss, ctx);
      if (!status.unlocked) return res.status(403).json({ error: `${status.unlockText} to challenge ${boss.name}.` });
    }
    const deck = drawQuestions(boss);
    if (deck.length < 5) return res.status(503).json({ error: 'Not enough questions for this fight yet' });
    // One fight at a time: any unfinished battle is abandoned.
    await query(`UPDATE battles SET status = 'abandoned', finished_at = NOW() WHERE user_id = $1 AND status = 'active'`, [req.user.userId]);
    const { rows } = await query(
      'INSERT INTO battles (user_id, boss_id, questions, loadout) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.user.userId, boss.id, JSON.stringify(deck), JSON.stringify(ctx.loadout)]
    );
    res.json({ battleId: rows[0].id, boss: publicBoss({ ...boss, questionPool: null }), loadout: ctx.loadout, questionCount: deck.length, minCorrect: minCorrectToWin(boss, ctx.loadout.stats.power) });
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
    // { pop: true } = the boss's Pop Quiz; the server remembers which index it was.
    const pop = req.body?.pop === true;
    if (pop && !b.pop_indexes.includes(index)) {
      await query('UPDATE battles SET pop_indexes = pop_indexes || $1::jsonb WHERE id = $2', [JSON.stringify([index]), b.id]);
    }
    res.json({ index, q: q.q, options: q.options, from: q.lessonTitle, pop: pop || b.pop_indexes.includes(index) });
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
      const pop = b.pop_indexes.includes(index);
      await db.query(
        `UPDATE battles SET answered = $1, correct = correct + $2, wrong = wrong + $3, pop_wrong = pop_wrong + $4 WHERE id = $5`,
        [JSON.stringify(answered), correct ? 1 : 0, correct ? 0 : 1, pop && !correct ? 1 : 0, b.id]
      );
      return { correct, answer: q.answer, explain: q.explain, pop, coinsAtRisk: pop && !correct ? POP_COINS : 0 };
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
      const boss = bossFor(b.boss_id);
      const seconds = (Date.now() - new Date(b.started_at).getTime()) / 1000;
      const need = minCorrectToWin(boss, b.loadout?.stats?.power);
      if (result === 'won' && (b.correct < need || seconds < minWinSeconds(boss))) {
        await db.query(`UPDATE battles SET status = 'abandoned', finished_at = NOW() WHERE id = $1`, [b.id]);
        return { status: 400, error: "That win doesn't add up. Every win needs enough correct answers behind it." };
      }

      const before = (await db.query('SELECT xp, coins FROM users WHERE id = $1 FOR UPDATE', [userId])).rows[0];
      let coins = 0;
      let item = null;
      let firstWin = false;
      let streak = null;
      let newAchievements = [];
      let dungeon = null;

      if (boss.dungeon) {
        const p = await dungeonProgress(db, userId, true);
        dungeon = { floor: boss.floor, best: p.best_floor, newBest: false, coins: 0, xp: 0, capped: false, duplicateCoins: 0, lootLocked: false };
        if (result === 'won' && boss.floor === p.current_floor + 1) {
          const r = floorRewards(boss.floor);
          const rx = withXpBonus(r.xp, b.loadout);
          let c = Math.max(0, Math.min(r.coins, p.coin_cap - p.coins_today));
          const x = Math.max(0, Math.min(rx, DAILY_XP_CAP - p.xp_today));
          dungeon = { ...dungeon, coins: c, xp: x, capped: c < r.coins || x < rx, best: Math.max(p.best_floor, boss.floor), newBest: boss.floor > p.best_floor };
          // Loot: odds from content/game/dungeon-loot.json; duplicates become coins.
          // Only while today's loot limit (1 + lessons passed today) has room.
          const lootLeft = p.drops_today < p.loot_cap;
          const drop = lootLeft ? rollLoot(boss.floor, boss.floor % 5 === 0) : null;
          dungeon.lootLocked = !lootLeft;
          if (drop) {
            p.drops_today += 1;
            const ins = await db.query(
              `INSERT INTO user_items (user_id, item_id, source) VALUES ($1, $2, 'dungeon') ON CONFLICT DO NOTHING RETURNING item_id`,
              [userId, drop.id]
            );
            if (ins.rows.length) item = drop;
            else {
              // Duplicates turn into coins, inside the same daily cap.
              dungeon.duplicateCoins = Math.max(0, Math.min(lootTable()?.duplicateCoins?.[drop.rarity] || 0, p.coin_cap - p.coins_today - c));
              c += dungeon.duplicateCoins;
            }
          }
          coins = c;
          await awardXp(db, userId, 'dungeon', boss.id, x, coins);
          await db.query(
            `UPDATE dungeon_progress SET current_floor = $1, best_floor = GREATEST(best_floor, $1), day = $2::date,
               coins_today = $3, xp_today = $4, drops_today = $5, updated_at = NOW() WHERE user_id = $6`,
            [boss.floor, p.today, p.coins_today + c, p.xp_today + x, p.drops_today, userId]
          );
          await logActivity(db, userId, 'dungeon_floor', String(boss.floor));
          streak = await touchStreak(db, userId);
        } else if (result !== 'won') {
          // The run ends: back to floor 1 next time.
          await db.query(`UPDATE dungeon_progress SET current_floor = 0, runs = runs + 1, updated_at = NOW() WHERE user_id = $1 AND current_floor > 0`, [userId]);
        }
      } else if (result === 'won') {
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
          await awardXp(db, userId, 'boss', boss.id, withXpBonus(boss.rewards?.xp || 0, b.loadout), coins);
        } else if (prior.rows[0].paid_today === 0) {
          // Repeat wins pay a little, once per day across all bosses: farming isn't a strategy.
          coins = boss.rewards?.repeatCoins || 0;
          await awardXp(db, userId, 'boss_repeat', boss.id, 0, coins);
        }
        await logActivity(db, userId, 'boss_win', boss.id);
        if (damageTaken === 0) await logActivity(db, userId, 'boss_flawless', boss.id);
        streak = await touchStreak(db, userId);
      }
      // Pop Quizzes (taken after this fight's rewards, never below 0): wrong answers, plus ones the fight should have had but didn't, cost coins.
      // Missing ones only count on wins (pausing can stretch a lost fight's clock), at most 1.
      const popMissed = result === 'won' ? Math.min(1, Math.max(0, Math.floor(seconds / POP_EXPECT_SECONDS) - b.pop_indexes.length)) : 0;
      const coinsLost = Math.min(POP_MAX_COINS, (b.pop_wrong + popMissed) * POP_COINS, (await db.query('SELECT coins FROM users WHERE id = $1', [userId])).rows[0].coins);
      if (coinsLost > 0) {
        await db.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [coinsLost, userId]);
        await db.query(`INSERT INTO coin_events (user_id, amount, reason, ref) VALUES ($1, $2, 'pop_quiz', $3)`, [userId, -coinsLost, boss.id]);
      }

      if (b.correct > 0) await logActivity(db, userId, 'boss_correct', boss.id, b.correct);
      await db.query(
        `UPDATE battles SET status = $1, finished_at = NOW(), damage_taken = $2, duration_ms = $3, reward_coins = $4, reward_item = $5, coins_lost = $6 WHERE id = $7`,
        [result, damageTaken, Math.round(seconds * 1000), coins, item?.id || null, coinsLost, b.id]
      );
      if (result === 'won') newAchievements = await checkAchievements(db, userId);
      const after = (await db.query('SELECT xp, coins FROM users WHERE id = $1', [userId])).rows[0];
      return {
        result, firstWin, coins: after.coins - before.coins + coinsLost, xp: after.xp - before.xp, item: item ? { id: item.id, name: item.name, rarity: item.rarity } : null,
        correct: b.correct, wrong: b.wrong, seconds: Math.round(seconds), damageTaken, streak,
        dungeon, coinsLost, popWrong: b.pop_wrong, popMissed, journal: journalFor(b),
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
