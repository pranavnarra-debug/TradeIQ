-- TradeIQ least-privilege database role setup
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
