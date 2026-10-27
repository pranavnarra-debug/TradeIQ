-- AI rivals: computer-controlled players who learn, fight and climb the
-- leaderboards alongside real people. The site discloses that leaderboards
-- include AI rivals; individual rivals are flagged here, in the database only,
-- so the owner's stats can always separate humans from bots.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_users_is_bot ON users(is_bot);

CREATE TABLE IF NOT EXISTS ai_rivals (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  persona JSONB NOT NULL,           -- type, skill, dex, aim, grit, likes, pace
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_played_day DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
