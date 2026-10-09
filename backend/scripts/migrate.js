#!/usr/bin/env node
// Applies db/migrations/*.sql in filename order, once each, recording what ran
// in schema_migrations. Uses MIGRATION_DATABASE_URL when set so schema changes
// can run as the DB owner while the app itself connects as a least-privilege
// role (see db/LeastPrivilegeSetup.sql).
//
//   npm run migrate            apply pending migrations
//   npm run migrate -- status  list applied / pending
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'db', 'migrations');
const url = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;

export async function migrate({ connectionString = url, log = console.log } = {}) {
  if (!connectionString) throw new Error('Set DATABASE_URL (or MIGRATION_DATABASE_URL)');
  const ssl = /sslmode=require/.test(connectionString) || process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined;
  const client = new pg.Client({ connectionString, ssl });
  await client.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(200) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    // Serialize concurrent deploys: only one process migrates at a time.
    await client.query('SELECT pg_advisory_lock(72817)');
    const applied = new Set((await client.query('SELECT filename FROM schema_migrations')).rows.map((r) => r.filename));
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

    if (process.argv[2] === 'status') {
      files.forEach((f) => log(`${applied.has(f) ? 'applied ' : 'PENDING '} ${f}`));
      return;
    }

    let ran = 0;
    for (const f of files) {
      if (applied.has(f)) continue;
      const sql = fs.readFileSync(path.join(dir, f), 'utf8');
      log(`[migrate] applying ${f}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [f]);
        await client.query('COMMIT');
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${f} failed: ${err.message}`);
      }
    }
    log(ran ? `[migrate] applied ${ran} migration(s)` : '[migrate] database is up to date');
  } finally {
    await client.query('SELECT pg_advisory_unlock(72817)').catch(() => {});
    await client.end();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  migrate().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
