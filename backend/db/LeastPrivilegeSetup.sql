-- TradeIQ least-privilege database role setup (run manually; not a migration)
--
-- Run this ONCE, connected as the superuser/owner Railway gave you (the
-- DATABASE_PUBLIC_URL you've already been using). It creates a separate,
-- restricted role for the app to actually run as day-to-day, instead of the
-- app connecting with full owner/superuser privileges on every request.
--
-- After running this, update your app's DATABASE_URL (and DATABASE_PUBLIC_URL
-- if you use that locally) to use the new 'tradeiq_app' role's connection
-- string instead of the original superuser one. Keep the original superuser
-- credentials for running schema changes/migrations only, not for the app
-- itself to connect with at runtime.

-- 1. Create a dedicated login role for the app.
--    Replace 'REPLACE_WITH_A_STRONG_RANDOM_PASSWORD' with a real generated
--    password (e.g. `openssl rand -hex 24`) before running this.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tradeiq_app') THEN
    CREATE ROLE tradeiq_app WITH LOGIN PASSWORD 'REPLACE_WITH_A_STRONG_RANDOM_PASSWORD';
  END IF;
END
$$;

-- 2. Grant only what the app actually needs at runtime: read/write on every
--    table's rows, but NOT the ability to create, alter, or drop tables, and
--    NOT superuser/role-management privileges of any kind.
GRANT CONNECT ON DATABASE railway TO tradeiq_app;
GRANT USAGE ON SCHEMA public TO tradeiq_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO tradeiq_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tradeiq_app;

-- 3. Make sure any tables created LATER (future migrations run by the
--    superuser) automatically grant the same access to tradeiq_app, so you
--    don't have to remember to re-run grants after every schema change.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tradeiq_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO tradeiq_app;

-- 4. Sanity check: confirm the role exists and has no superuser/createdb/
--    createrole rights.
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole
FROM pg_roles WHERE rolname = 'tradeiq_app';
-- Expect: rolsuper = false, rolcreatedb = false, rolcreaterole = false

-- ---------------------------------------------------------------------------
-- OPTIONAL: a read-only role for browsing the database in a GUI tool
-- (TablePlus, Postico, DBeaver, pgAdmin) without any risk of editing or
-- deleting data by accident. Use this one day-to-day; keep the owner
-- credentials for migrations only.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tradeiq_readonly') THEN
    CREATE ROLE tradeiq_readonly WITH LOGIN PASSWORD 'REPLACE_WITH_ANOTHER_STRONG_RANDOM_PASSWORD';
  END IF;
END
$$;
GRANT CONNECT ON DATABASE railway TO tradeiq_readonly;
GRANT USAGE ON SCHEMA public TO tradeiq_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO tradeiq_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO tradeiq_readonly;
-- Never let the read-only role see password hashes or token hashes.
REVOKE SELECT ON users, refresh_tokens FROM tradeiq_readonly;
GRANT SELECT (id, username, email, email_verified, role, created_at, last_login, is_active, xp, coins,
  streak_current, streak_best, streak_last_day, timezone, avatar, email_opt_in, show_on_leaderboard,
  failed_login_count, locked_until, terms_accepted_at, terms_version) ON users TO tradeiq_readonly;
GRANT SELECT (id, user_id, family_id, revoked, expires_at, created_at, rotated_at, user_agent) ON refresh_tokens TO tradeiq_readonly;
