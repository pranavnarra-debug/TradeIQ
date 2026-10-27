// Dungeon loot + coin pacing. Reads the live catalog and loot table.
// Run: node docs/game/sims/dungeon_loot_sim.mjs [--days 60] [--cap 60] [--uncapped-dupes]
// By default duplicate coins count toward the daily cap (the recommendation); --uncapped-dupes shows the risk if they don't.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const items = JSON.parse(readFileSync(join(root, 'backend/content/game/items.json'), 'utf8')).items.filter((i) => /^dungeon\b/.test(i.unlock));
const L = JSON.parse(readFileSync(join(root, 'backend/content/game/dungeon-loot.json'), 'utf8'));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const DAYS = arg('--days', 60), CAP = arg('--cap', 60), RUNS = 400, UNCAPPED_DUPES = process.argv.includes('--uncapped-dupes');

const band = (f) => L.bands.find((b) => f >= b.fromFloor && (b.toFloor == null || f <= b.toFloor));
const ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
function roll(f) {
  if (Math.random() >= (f % 5 === 0 ? L.guardianDropChance : L.normalDropChance)) return null;
  const w = band(f).weights; let r = Math.random() * Object.values(w).reduce((a, b) => a + b, 0); let rar = 'common';
  for (const [k, v] of Object.entries(w)) if ((r -= v) <= 0) { rar = k; break; }
  for (const rr of ORDER.slice(ORDER.indexOf(rar))) { const p = items.filter((i) => i.rarity === rr && i.minFloor <= f); if (p.length) return p[Math.floor(Math.random() * p.length)]; }
  return null;
}
// Deepest floor reached per run, by day: skill + gear grow over time.
const players = {
  Casual: { runsPerDay: 1, playDays: 4 / 7, depth: (d) => 4 + Math.min(8, d / 6) },
  Regular: { runsPerDay: 2, playDays: 6 / 7, depth: (d) => 6 + Math.min(14, d / 3) },
  Grinder: { runsPerDay: 4, playDays: 1, depth: (d) => 8 + Math.min(24, d / 2) },
};
for (const [name, P] of Object.entries(players)) {
  const acc = { days: { common: [], uncommon: [], rare: [], epic: [], legendary: [] }, coins: 0, dup: 0, owned: 0 };
  for (let s = 0; s < RUNS; s++) {
    const own = new Set(); const done = {};
    for (let day = 1; day <= DAYS; day++) {
      if (Math.random() > P.playDays) continue;
      let today = 0;
      for (let r = 0; r < P.runsPerDay; r++) {
        const top = Math.max(1, Math.round(P.depth(day) + (Math.random() * 4 - 2)));
        for (let f = 1; f <= top; f++) {
          const c = Math.min(3 + f, CAP - today); today += c; acc.coins += c;
          const it = roll(f); if (!it) continue;
          if (!own.has(it.id)) { own.add(it.id); continue; }
          const dc = UNCAPPED_DUPES ? L.duplicateCoins[it.rarity] : Math.min(L.duplicateCoins[it.rarity], CAP - today);
          acc.dup += dc; if (!UNCAPPED_DUPES) today += dc;
        }
      }
      for (const rar of ORDER) if (!done[rar] && items.filter((i) => i.rarity === rar).every((i) => own.has(i.id))) done[rar] = day;
    }
    for (const rar of ORDER) acc.days[rar].push(done[rar] ?? Infinity);
    acc.owned += own.size;
  }
  const med = (a) => { const s = [...a].sort((x, y) => x - y); const v = s[Math.floor(s.length / 2)]; return v === Infinity ? `>${DAYS}` : v; };
  console.log(`${name}: floor coins ${(acc.coins / RUNS / DAYS).toFixed(1)}/day, duplicate coins ${(acc.dup / RUNS / DAYS).toFixed(1)}/day, owns ${(acc.owned / RUNS).toFixed(0)}/${items.length} dungeon items by day ${DAYS}; median day each rarity is complete: ` +
    ORDER.slice().reverse().map((r) => `${r} ${med(acc.days[r])}`).join(', '));
}
