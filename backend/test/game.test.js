// Unit tests for the item catalog's stat math (no server or database needed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats } from '../services/game.js';

test('mix_bonus: +2 every stat only with 4 armor pieces from 3+ sets', () => {
  const armor3 = ['rookie-cap', 'emergency-fund-chestplate', 'rule-of-72-greaves', 'envelope-boots'];
  const armor2 = ['rookie-cap', 'rookie-hoodie', 'safety-net-leggings', 'puddle-proof-boots'];
  const base = computeStats(armor3).stats;
  const charmed = computeStats([...armor3, 'correlation-charm']).stats;
  const charm = computeStats(['correlation-charm']).stats;
  for (const k of Object.keys(base)) assert.equal(charmed[k], base[k] + charm[k] + 2, `${k} gets +2`);

  const two = computeStats(armor2).stats;
  const twoCharmed = computeStats([...armor2, 'correlation-charm']).stats;
  for (const k of Object.keys(two)) assert.equal(twoCharmed[k], two[k] + charm[k], `${k}: only 2 sets, no bonus`);

  const three = computeStats([...armor3.slice(0, 3), 'correlation-charm']).stats;
  const threeBase = computeStats(armor3.slice(0, 3)).stats;
  for (const k of Object.keys(three)) assert.equal(three[k], threeBase[k] + charm[k], `${k}: empty armor slot, no bonus`);
});
