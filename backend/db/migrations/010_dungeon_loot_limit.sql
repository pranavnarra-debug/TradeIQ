-- Dungeon loot is limited per day: 1 free drop, plus 1 per lesson passed today
-- (services/dungeon.js lootCapFor), so the climb rewards studying too.
ALTER TABLE dungeon_progress ADD COLUMN IF NOT EXISTS drops_today INTEGER NOT NULL DEFAULT 0;
