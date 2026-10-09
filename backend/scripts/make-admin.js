#!/usr/bin/env node
// Grants (or revokes) the admin role from the command line. This replaces v1's
// "whoever registers with ADMIN_EMAIL becomes admin", which let anyone who
// guessed that address first claim the admin account. Admin access ALSO
// requires the user id in ADMIN_USER_IDS (see services/adminAccess.js).
//
//   npm run make-admin -- <username>
//   npm run make-admin -- <username> --revoke
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const [username, flag] = process.argv.slice(2);
if (!username) {
  console.error('Usage: npm run make-admin -- <username> [--revoke]');
  process.exit(1);
}
const role = flag === '--revoke' ? 'user' : 'admin';
const url = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
const ssl = /sslmode=require/.test(url || '') || process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined;
const client = new pg.Client({ connectionString: url, ssl });

try {
  await client.connect();
  const res = await client.query(
    'UPDATE users SET role = $1 WHERE LOWER(username) = LOWER($2) RETURNING id, username, role',
    [role, username]
  );
  if (!res.rows.length) {
    console.error(`No user named "${username}". Register on the site first, then re-run this.`);
    process.exitCode = 1;
  } else {
    await client.query(
      `INSERT INTO admin_audit_log (admin_user_id, target_user_id, action, details) VALUES (NULL, $1, 'cli_set_role', $2)`,
      [res.rows[0].id, JSON.stringify({ role })]
    );
    // Drop their sessions so the new role takes effect on next login.
    await client.query('DELETE FROM refresh_tokens WHERE user_id = $1', [res.rows[0].id]);
    console.log(`${res.rows[0].username} (user id ${res.rows[0].id}) now has role: ${res.rows[0].role}. They'll need to log in again.`);
    if (role === 'admin') {
      console.log(`\nIMPORTANT: the role alone is not enough. Admin access also requires this id in the`);
      console.log(`ADMIN_USER_IDS environment variable (comma-separated) on your host, e.g. ADMIN_USER_IDS=${res.rows[0].id}`);
    }
  }
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
