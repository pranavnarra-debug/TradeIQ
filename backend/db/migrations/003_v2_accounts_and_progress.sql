-- TradeIQ v2: username-first accounts, optional email, hashed tokens,
-- gamified progress (XP, streaks, achievements), unit exams, email log.
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------

-- Email becomes optional. Uniqueness moves to case-insensitive partial indexes
-- so "Maya@x.com" and "maya@x.com" can't be two accounts, while any number of
-- users can have no email at all.
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users (LOWER(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username_lower ON users (LOWER(username));

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_expires TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_code_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_version VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_opt_in BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_unsubscribe_token VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_reminder_sent_on DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_digest_sent_on DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) DEFAULT 'America/New_York';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(20) DEFAULT 'chip';
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN DEFAULT TRUE;

-- Gamification counters live on the user row for cheap reads; xp_events is the
-- ledger they're derived from.
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_current INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_best INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_last_day DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_freezes INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS owned_avatars TEXT[] DEFAULT ARRAY['chip','penny'];

-- v1 required a verified email to log in; v2 doesn't. Existing users keep
-- their email (marked verified only if they had already verified it).
-- Plaintext one-time tokens from v1 are cleared: v2 stores only SHA-256 hashes.
UPDATE users SET email_verify_token = NULL, reset_password_token = NULL, reset_password_expires = NULL
  WHERE email_verify_token IS NOT NULL OR reset_password_token IS NOT NULL;
UPDATE users SET email_unsubscribe_token = encode(gen_random_bytes(24), 'hex') WHERE email_unsubscribe_token IS NULL;
UPDATE users SET terms_accepted_at = created_at, terms_version = 'v1-legacy' WHERE terms_accepted_at IS NULL;

-- Refresh tokens are now stored as SHA-256 hashes (column name kept for
-- compatibility). Existing plaintext rows can't be matched any more, so they're
-- dropped: every user logs in once after this migration.
DELETE FROM refresh_tokens WHERE LENGTH(token) <> 64 OR token !~ '^[0-9a-f]{64}$';
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS user_agent VARCHAR(120);
-- When a token was rotated out. A replay within a few seconds is almost always
-- two browser tabs refreshing at once, not theft, and is handled gently.
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS rotated_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- ---------------------------------------------------------------------------
-- Learning progress (v2 curriculum uses string lesson ids like 'money-1-what-is-money')
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_completions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id VARCHAR(80) NOT NULL,
  unit_id VARCHAR(20) NOT NULL,
  best_score INTEGER NOT NULL DEFAULT 0 CHECK (best_score BETWEEN 0 AND 100),
  attempts INTEGER NOT NULL DEFAULT 1,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  first_completed_at TIMESTAMPTZ DEFAULT NOW(),
  last_completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson ON lesson_completions(lesson_id);

CREATE TABLE IF NOT EXISTS unit_exams (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id VARCHAR(20) NOT NULL,
  best_score INTEGER NOT NULL DEFAULT 0 CHECK (best_score BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  attempts INTEGER NOT NULL DEFAULT 1,
  passed_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, unit_id)
);

-- Ledger of every XP grant. Weekly leaderboards and "XP today" read from here.
CREATE TABLE IF NOT EXISTS xp_events (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(30) NOT NULL,         -- lesson | lesson_retry | exam | streak | achievement | trade
  ref VARCHAR(80),
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_time ON xp_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_xp_events_time ON xp_events(created_at);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(40) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ---------------------------------------------------------------------------
-- Email automation log. Stores what was sent and whether it worked, never the
-- message body, so the admin panel can show deliverability without becoming a
-- second copy of everyone's inbox.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_log (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  kind VARCHAR(30) NOT NULL,
  status VARCHAR(12) NOT NULL,         -- sent | failed | skipped
  provider_id VARCHAR(100),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_log_time ON email_log(created_at);
