// Who is an admin. Two independent conditions must BOTH hold:
//   1. users.role = 'admin' (and the account is active), and
//   2. the user's numeric id is listed in the ADMIN_USER_IDS env var.
// The id list lives in the hosting dashboard, not the database, so neither a
// database edit, a bug in an admin screen, nor someone re-registering a
// deleted admin's username can create a new admin. In production an empty
// list means nobody is an admin (fail closed).
import { config } from '../config.js';

const ids = new Set(
  String(process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)
);

export function adminAllowlistActive() {
  return ids.size > 0 || config.isProd;
}

export function isAdminRow(row) {
  if (!row || row.role !== 'admin' || row.is_active === false) return false;
  // Local development without an allowlist: the database role alone is enough.
  if (!adminAllowlistActive()) return true;
  return ids.has(Number(row.id));
}

export function allowlistedIds() {
  return [...ids];
}
