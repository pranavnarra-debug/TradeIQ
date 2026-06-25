-- TradeIQ security migration 001
-- Run this ONCE against your existing production database.
-- Safe to re-run: every statement uses IF NOT EXISTS / IF EXISTS guards.

-- Account lockout tracking on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_failed_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Refresh token rotation/reuse-detection support
-- Requires pgcrypto for gen_random_uuid(); Railway's managed Postgres has this
-- available by default, but the extension still needs to be enabled once.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS family_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS revoked BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family_id);

-- Admin audit log (new table, not an alter)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log(target_user_id);

-- Sanity check: confirm the new columns/tables exist
SELECT
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'locked_until') AS users_lockout_col,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'refresh_tokens' AND column_name = 'family_id') AS refresh_family_col,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'admin_audit_log') AS audit_table;
-- Expect: 1, 1, 1
