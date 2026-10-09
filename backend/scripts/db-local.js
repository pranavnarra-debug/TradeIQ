#!/usr/bin/env node
// Zero-install local Postgres for development. Downloads a Postgres binary via
// npm the first time, keeps data in backend/.local-db/, and prints the
// DATABASE_URL to put in your .env. Ctrl+C stops it.
//
//   npm run db:local
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import EmbeddedPostgres from 'embedded-postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '.local-db');
const port = Number(process.env.LOCAL_DB_PORT) || 54329;

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'tradeiq',
  password: 'tradeiq-local',
  port,
  persistent: true,
  onLog: () => {},
});

const fresh = !fs.existsSync(path.join(dataDir, 'PG_VERSION'));
if (fresh) await pg.initialise();
await pg.start();
if (fresh) await pg.createDatabase('tradeiq');

console.log(`\nLocal Postgres running on port ${port}.`);
console.log(`DATABASE_URL=postgresql://tradeiq:tradeiq-local@localhost:${port}/tradeiq\n`);
console.log('Leave this running. In another terminal: npm run migrate && npm run dev');

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
setInterval(() => {}, 1 << 30);
