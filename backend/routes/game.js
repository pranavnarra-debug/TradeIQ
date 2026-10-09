// Hideout API: avatar appearance, inventory, equipment and the item shop.
import express from 'express';
import { query, withTransaction } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { UNITS, unitLessonIds } from '../content/index.js';
import {
  CATALOG, ITEMS, SETS, SLOTS, STARTER_ITEMS, APPEARANCE, DEFAULT_APPEARANCE,
  cleanAppearance, computeStats, unlockedWorlds, paletteFor,
} from '../services/game.js';

const router = express.Router();

// Public: the catalog (no user data), so the landing page could show gear too.
router.get('/catalog', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    slots: SLOTS,
    stats: CATALOG.stats,
    sets: CATALOG.sets,
    items: CATALOG.items.map((i) => ({ ...i, palette: paletteFor(i) })),
    appearance: APPEARANCE,
  });
});

router.use(authenticate);

/** Gives every player the starter items once, and equips them into empty slots. */
async function ensureStarterKit(db, userId) {
  // Items retired from the catalog no longer occupy a slot.
  await db.query('DELETE FROM user_equipment WHERE user_id = $1 AND NOT (item_id = ANY($2::text[]))', [userId, [...ITEMS.keys()]]);
  if (!STARTER_ITEMS.length) return;
  const ids = STARTER_ITEMS.map((i) => i.id);
  const ins = await db.query(
    `INSERT INTO user_items (user_id, item_id, source)
     SELECT $1, unnest($2::text[]), 'starter' ON CONFLICT DO NOTHING RETURNING item_id`,
    [userId, ids]
  );
  if (!ins.rows.length) return;
  for (const row of ins.rows) {
    const item = ITEMS.get(row.item_id);
    await db.query(
      `INSERT INTO user_equipment (user_id, slot, item_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, slot) DO NOTHING`,
      [userId, item.slot, item.id]
    );
  }
}

async function loadState(db, userId) {
  await ensureStarterKit(db, userId);
  const [user, owned, equipped, lessons, exams] = await Promise.all([
    db.query('SELECT avatar_config, coins FROM users WHERE id = $1', [userId]),
    db.query('SELECT item_id, source, acquired_at FROM user_items WHERE user_id = $1 ORDER BY acquired_at', [userId]),
    db.query('SELECT slot, item_id FROM user_equipment WHERE user_id = $1', [userId]),
    db.query('SELECT unit_id, COUNT(*)::int AS n FROM lesson_completions WHERE user_id = $1 GROUP BY unit_id', [userId]),
    db.query('SELECT unit_id FROM unit_exams WHERE user_id = $1 AND passed', [userId]),
  ]);
  const equipment = Object.fromEntries(equipped.rows.filter((r) => ITEMS.has(r.item_id)).map((r) => [r.slot, r.item_id]));
  return {
    appearance: { ...DEFAULT_APPEARANCE, ...(user.rows[0].avatar_config || {}) },
    coins: user.rows[0].coins,
    inventory: owned.rows.filter((r) => ITEMS.has(r.item_id)).map((r) => ({ id: r.item_id, source: r.source, at: r.acquired_at })),
    equipment,
    ...computeStats(Object.values(equipment)),
    unlockedWorlds: unlockedWorlds({ passedExams: new Set(exams.rows.map((r) => r.unit_id)) }),
  };
}

// GET /api/game/state
router.get('/state', async (req, res, next) => {
  try {
    res.json(await withTransaction((db) => loadState(db, req.user.userId)));
  } catch (err) {
    next(err);
  }
});

// PUT /api/game/appearance  { skin?, hairStyle?, hairColor?, eyeColor?, shirt?, pants?, shoes? }
router.put('/appearance', async (req, res, next) => {
  try {
    const { value, error } = cleanAppearance(req.body || {});
    if (error) return res.status(400).json({ error });
    const cur = (await query('SELECT avatar_config FROM users WHERE id = $1', [req.user.userId])).rows[0]?.avatar_config || {};
    await query('UPDATE users SET avatar_config = $1 WHERE id = $2', [JSON.stringify({ ...DEFAULT_APPEARANCE, ...cur, ...value }), req.user.userId]);
    res.json(await withTransaction((db) => loadState(db, req.user.userId)));
  } catch (err) {
    next(err);
  }
});

// PUT /api/game/equip  { slot, itemId }   itemId null = take it off
router.put('/equip', async (req, res, next) => {
  try {
    const { slot, itemId } = req.body || {};
    if (!SLOTS.includes(slot)) return res.status(400).json({ error: 'Unknown slot' });
    const state = await withTransaction(async (db) => {
      if (itemId == null) {
        await db.query('DELETE FROM user_equipment WHERE user_id = $1 AND slot = $2', [req.user.userId, slot]);
        return loadState(db, req.user.userId);
      }
      const item = ITEMS.get(String(itemId));
      if (!item) return { error: 'Unknown item', status: 400 };
      if (item.slot !== slot) return { error: `That goes in the ${item.slot} slot`, status: 400 };
      const own = await db.query('SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = $2', [req.user.userId, item.id]);
      if (!own.rows.length) return { error: "You don't own that item", status: 403 };
      await db.query(
        `INSERT INTO user_equipment (user_id, slot, item_id) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, slot) DO UPDATE SET item_id = EXCLUDED.item_id, equipped_at = NOW()`,
        [req.user.userId, slot, item.id]
      );
      return loadState(db, req.user.userId);
    });
    if (state.error) return res.status(state.status).json({ error: state.error });
    res.json(state);
  } catch (err) {
    next(err);
  }
});

// POST /api/game/buy  { itemId }
router.post('/buy', async (req, res, next) => {
  try {
    const item = ITEMS.get(String(req.body?.itemId || ''));
    if (!item) return res.status(400).json({ error: 'Unknown item' });
    if (item.unlockKind !== 'shop') return res.status(400).json({ error: `${item.name} can't be bought. ${item.unlockKind === 'starter' ? 'Everyone already has it.' : `Earn it: ${item.unlock}`}` });
    const result = await withTransaction(async (db) => {
      const before = await loadState(db, req.user.userId);
      if (!before.unlockedWorlds.includes(item.world)) return { error: `Pass the World ${item.world - 1} final exam to unlock World ${item.world} gear.`, status: 403 };
      if (before.inventory.some((i) => i.id === item.id)) return { error: 'You already own this', status: 400 };
      // Row lock on the user so two purchases can't spend the same coins.
      const u = (await db.query('SELECT coins FROM users WHERE id = $1 FOR UPDATE', [req.user.userId])).rows[0];
      if (u.coins < item.price) return { error: `You need ${item.price - u.coins} more coins`, status: 400 };
      await db.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [item.price, req.user.userId]);
      await db.query('INSERT INTO user_items (user_id, item_id, source) VALUES ($1, $2, $3)', [req.user.userId, item.id, 'shop']);
      await db.query('INSERT INTO coin_events (user_id, amount, reason, ref) VALUES ($1, $2, $3, $4)', [req.user.userId, -item.price, 'shop', item.id]);
      return loadState(db, req.user.userId);
    });
    if (result.error) return res.status(result.status).json({ error: result.error });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export { SETS };
export default router;
