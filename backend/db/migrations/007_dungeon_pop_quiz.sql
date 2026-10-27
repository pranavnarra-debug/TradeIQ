-- The Dungeon: an endless climb open from day one (services/dungeon.js).
CREATE TABLE IF NOT EXISTS dungeon_progress (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_floor INTEGER NOT NULL DEFAULT 0,   -- floors cleared in the current run
  best_floor INTEGER NOT NULL DEFAULT 0,
  runs INTEGER NOT NULL DEFAULT 0,
  day DATE,                                    -- the day the caps below count for
  coins_today INTEGER NOT NULL DEFAULT 0,
  xp_today INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pop Quizzes: the boss forces a question every so often; wrong or skipped
-- ones cost coins. Which question indexes were pop quizzes is decided by the
-- server, so the client can't relabel them.
ALTER TABLE battles ADD COLUMN IF NOT EXISTS pop_indexes JSONB NOT NULL DEFAULT '[]';
ALTER TABLE battles ADD COLUMN IF NOT EXISTS pop_wrong INTEGER NOT NULL DEFAULT 0;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS coins_lost INTEGER NOT NULL DEFAULT 0;
