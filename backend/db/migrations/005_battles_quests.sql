-- Boss battles + quests.

-- Every battle is a server-side session. Questions are drawn and graded on
-- the server, so a client can't see answers or claim a win it didn't earn.
CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  boss_id VARCHAR(60) NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'abandoned')),
  questions JSONB NOT NULL,            -- [{ ref: [lessonId, stepIdx, qIdx], perm: [..] }]
  answered JSONB NOT NULL DEFAULT '{}', -- { "<index>": { correct: bool } }
  correct INTEGER NOT NULL DEFAULT 0,
  wrong INTEGER NOT NULL DEFAULT 0,
  hints_used INTEGER NOT NULL DEFAULT 0,
  loadout JSONB,                        -- stats/effects snapshot at start
  damage_taken INTEGER,
  duration_ms INTEGER,
  reward_coins INTEGER DEFAULT 0,
  reward_item VARCHAR(60),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_battles_user ON battles(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_battles_user_boss ON battles(user_id, boss_id, status);

-- Things players do, for quest progress ("pass 2 lessons today", "win a boss
-- fight this week"). Append-only; pruned after 120 days by the retention job.
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind VARCHAR(30) NOT NULL,            -- lesson_pass | lesson_perfect | lesson_review | boss_win | boss_correct | boss_flawless | trade_journaled | analysis
  ref VARCHAR(80),
  amount INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_user_kind_time ON activity_log(user_id, kind, created_at);

CREATE TABLE IF NOT EXISTS quest_claims (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id VARCHAR(60) NOT NULL,
  period_key VARCHAR(20) NOT NULL,      -- 'YYYY-MM-DD' (daily), 'W:YYYY-MM-DD' (week start), 'story'
  coins INTEGER NOT NULL DEFAULT 0,
  item_id VARCHAR(60),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, quest_id, period_key)
);
