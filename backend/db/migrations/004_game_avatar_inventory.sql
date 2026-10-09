-- TradeIQ game layer v1: customizable avatar, inventory, equipped gear.
-- Item definitions live in code (backend/content/game/items.json); the
-- database only stores who owns what and what they're wearing.

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_config JSONB;

CREATE TABLE IF NOT EXISTS user_items (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id VARCHAR(60) NOT NULL,
  source VARCHAR(30) NOT NULL DEFAULT 'shop',   -- starter | shop | quest | boss | achievement | admin
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS user_equipment (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot VARCHAR(12) NOT NULL CHECK (slot IN ('helmet', 'chest', 'legs', 'boots', 'weapon', 'offhand', 'trinket')),
  item_id VARCHAR(60) NOT NULL,
  equipped_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, slot),
  FOREIGN KEY (user_id, item_id) REFERENCES user_items(user_id, item_id) ON DELETE CASCADE
);

-- Coin ledger: every coin spent or earned outside xp_events (shop purchases
-- today, quests later) so balances can be audited and refunded.
CREATE TABLE IF NOT EXISTS coin_events (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,                     -- negative = spent
  reason VARCHAR(30) NOT NULL,                 -- shop | quest | refund | admin
  ref VARCHAR(80),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coin_events_user ON coin_events(user_id, created_at);
