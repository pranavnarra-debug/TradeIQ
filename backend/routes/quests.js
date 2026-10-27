import express from 'express';
import { isAdmin } from '../services/adminAccess.js';
import { query, withTransaction } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { QUEST_BY_ID, periods, countSignal, activeQuests } from '../services/quests.js';
import { ITEMS, computeStats, unlockedWorlds } from '../services/game.js';
import { BOSSES, requiredLessons } from '../services/battles.js';

const router = express.Router();
router.use(authenticate);

async function board(db, userId, admin = false) {
  const per = await periods(db, userId);
  const [claims, exams, eq, done] = await Promise.all([
    db.query('SELECT quest_id, period_key FROM quest_claims WHERE user_id = $1', [userId]),
    db.query('SELECT unit_id FROM unit_exams WHERE user_id = $1 AND passed', [userId]),
    db.query('SELECT item_id FROM user_equipment WHERE user_id = $1', [userId]),
    db.query('SELECT lesson_id FROM lesson_completions WHERE user_id = $1', [userId]),
  ]);
  const completed = new Set(done.rows.map((r) => r.lesson_id));
  const bossUnlocked = admin || BOSSES.some((b) => { const req = requiredLessons(b); return req.length && req.every((id) => completed.has(id)); });
  const worldsCleared = exams.rows.length;
  const claimed = new Set(claims.rows.map((r) => `${r.quest_id}|${r.period_key}`));
  const claimedStory = new Set(claims.rows.filter((r) => r.period_key === 'story').map((r) => r.quest_id));
  const worlds = admin ? [1, 2, 3, 4] : unlockedWorlds({ passedExams: new Set(exams.rows.map((r) => r.unit_id)) });
  const { effects } = computeStats(eq.rows.map((r) => r.item_id));
  // Gear with a "coin_bonus" effect pays more for quests (capped at +25%).
  const coinBonus = Math.min(25, effects.filter((e) => e.type === 'coin_bonus').reduce((s, e) => s + (e.value || 0), 0));

  const act = activeQuests({ userId, day: per.day, week: per.week, worlds, claimedStory, bossUnlocked });
  const keyFor = (q) => (q.type === 'daily' ? per.day : q.type === 'weekly' ? `W:${per.week}` : 'story');
  const sinceFor = (q) => (q.type === 'daily' ? per.day_start : q.type === 'weekly' ? per.week_start : null);
  const shape = async (q) => {
    const progress = Math.min(q.target, await countSignal(db, userId, q.signal, sinceFor(q), per.tz));
    const isClaimed = claimed.has(`${q.id}|${keyFor(q)}`);
    return {
      id: q.id, type: q.type, world: q.world || 1, name: q.name, desc: q.desc, lesson: q.lesson,
      target: q.target, progress, done: progress >= q.target, claimed: isClaimed,
      reward: {
        // Dailies/weeklies grow with progress: +5 / +20 coins per world cleared.
        coins: Math.round(((q.reward?.coins || 0) + (q.type === 'daily' ? 5 * worldsCleared : q.type === 'weekly' ? 20 * worldsCleared : 0)) * (1 + coinBonus / 100)),
        item: q.reward?.item ? { id: q.reward.item, name: ITEMS.get(q.reward.item)?.name, rarity: ITEMS.get(q.reward.item)?.rarity } : null,
      },
    };
  };
  const sections = {};
  for (const k of ['daily', 'weekly', 'story']) sections[k] = await Promise.all(act[k].map(shape));
  return {
    ...sections,
    coinBonus,
    resets: { day: per.day, week: per.week },
    storyDone: claimedStory.size,
    _keyFor: keyFor,
  };
}

// GET /api/quests
router.get('/', async (req, res, next) => {
  try {
    const b = await board({ query }, req.user.userId, isAdmin(req));
    delete b._keyFor;
    res.json(b);
  } catch (err) {
    next(err);
  }
});

// POST /api/quests/:id/claim
router.post('/:id/claim', async (req, res, next) => {
  try {
    const quest = QUEST_BY_ID.get(req.params.id);
    if (!quest) return res.status(404).json({ error: 'No such quest' });
    const out = await withTransaction(async (db) => {
      await db.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [req.user.userId]);
      const b = await board(db, req.user.userId, isAdmin(req));
      const entry = [...b.daily, ...b.weekly, ...b.story].find((q) => q.id === quest.id);
      if (!entry) return { status: 400, error: "That quest isn't on your board right now" };
      if (entry.claimed) return { status: 400, error: 'Already claimed' };
      if (!entry.done) return { status: 400, error: `Not done yet: ${entry.progress}/${entry.target}` };
      const period = b._keyFor(quest);
      await db.query(
        'INSERT INTO quest_claims (user_id, quest_id, period_key, coins, item_id) VALUES ($1, $2, $3, $4, $5)',
        [req.user.userId, quest.id, period, entry.reward.coins, entry.reward.item?.id || null]
      );
      if (entry.reward.coins) {
        await db.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [entry.reward.coins, req.user.userId]);
        await db.query(`INSERT INTO coin_events (user_id, amount, reason, ref) VALUES ($1, $2, 'quest', $3)`, [req.user.userId, entry.reward.coins, quest.id]);
      }
      let item = null;
      if (entry.reward.item?.id) {
        const ins = await db.query(
          `INSERT INTO user_items (user_id, item_id, source) VALUES ($1, $2, 'quest') ON CONFLICT DO NOTHING RETURNING item_id`,
          [req.user.userId, entry.reward.item.id]
        );
        if (ins.rows.length) item = entry.reward.item;
      }
      const after = await board(db, req.user.userId, isAdmin(req));
      delete after._keyFor;
      const coins = (await db.query('SELECT coins FROM users WHERE id = $1', [req.user.userId])).rows[0].coins;
      return { claimed: { id: quest.id, coins: entry.reward.coins, item }, board: after, coins };
    });
    if (out.error) return res.status(out.status).json({ error: out.error });
    res.json(out);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Already claimed' });
    next(err);
  }
});

export default router;
