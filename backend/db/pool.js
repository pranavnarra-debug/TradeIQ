import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

// Return DATE columns as 'YYYY-MM-DD' strings instead of JS Dates at local
// midnight, which silently shift a day when server and user timezones differ.
pg.types.setTypeParser(1082, (v) => v);

// Managed Postgres providers (Railway, Render, Neon...) require TLS on public
// connection strings. Private-network URLs don't, so only enable it when the
// URL asks for it or PGSSL=true is set.
const wantsSsl = /sslmode=require/.test(config.databaseUrl || '') || process.env.PGSSL === 'true';

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: wantsSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Lightweight query helper with basic logging on failure. Logs the SQL text
// only, never parameter values (which can contain hashes or emails).
export async function query(text, params) {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error('DB query error:', { text: text.slice(0, 300), error: err.message });
    throw err;
  }
}

/**
 * Runs fn(client) inside BEGIN/COMMIT, rolling back on any throw. Use for
 * anything that must be all-or-nothing, like a trade that moves cash and
 * opens a position.
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
