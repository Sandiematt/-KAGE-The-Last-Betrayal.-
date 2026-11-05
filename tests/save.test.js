'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic } = loadLogic();

test('a new save starts with 250 coins, 5 gems, level 1 and the Moon Katana equipped', () => {
  const s = Logic.defaultSave();
  assert.equal(s.coins, 250);
  assert.equal(s.gems, 5);
  assert.equal(s.level, 1);
  assert.equal(s.xp, 0);
  assert.equal(s.equipped.weapon, 'moon_katana');
  assert.equal(s.owned.weapons.moon_katana, 1);
  assert.equal(s.unlockedActs, 1);
  assert.deepEqual(s.cleared, {});
});

test('each default save is a fresh object', () => {
  const a = Logic.defaultSave();
  a.coins = 0; a.owned.weapons.titan_hammer = 1;
  const b = Logic.defaultSave();
  assert.equal(b.coins, 250);
  assert.equal(b.owned.weapons.titan_hammer, undefined);
});

test('with no stored save, loading gives the default save without an error', () => {
  const { save, error } = Logic.loadSave(null);
  assert.equal(error, null);
  assert.deepEqual(save, Logic.defaultSave());
});

test('a corrupt save falls back to the default save and reports the error', () => {
  const { save, error } = Logic.loadSave('{"coins": 9000,,, oops');
  assert.ok(error instanceof Error);
  assert.deepEqual(save, Logic.defaultSave());
});

test('a stored value that is not an object is ignored', () => {
  for (const raw of ['42', 'null', '"text"']) {
    const { save, error } = Logic.loadSave(raw);
    assert.equal(error, null);
    assert.deepEqual(save, Logic.defaultSave());
  }
});

test('a saved game round-trips: progress, gear and settings survive save and load', () => {
  const s = Logic.defaultSave();
  s.coins = 1234; s.level = 7; s.cleared['0-0'] = true; s.unlockedActs = 2;
  s.owned.weapons.titan_hammer = 3; s.equipped.weapon = 'titan_hammer'; s.settings.shake = 'off';
  const { save } = Logic.loadSave(JSON.stringify(s));
  assert.deepEqual(save, s);
});

test('an old save missing newer fields is filled in with defaults, keeping what it has', () => {
  const old = { coins: 900, owned: { weapons: { titan_hammer: 2 } }, settings: { sound: false } };
  const { save } = Logic.loadSave(JSON.stringify(old));
  assert.equal(save.coins, 900);
  assert.equal(save.gems, 5);
  assert.equal(save.owned.weapons.titan_hammer, 2);
  assert.equal(save.owned.weapons.moon_katana, 1, 'the starter katana is always owned');
  assert.equal(save.owned.helmets.topknot, 1);
  assert.equal(save.equipped.weapon, 'moon_katana');
  assert.equal(save.settings.sound, false);
  assert.equal(save.settings.music, true);
  assert.deepEqual(save.stats, Logic.defaultSave().stats);
  assert.deepEqual(save.cleared, {});
});

test('erasing progress gives a fresh save but keeps the player\'s settings', () => {
  const s = Logic.defaultSave();
  s.coins = 5000; s.level = 9; s.settings.reduceFlash = true;
  const fresh = Logic.resetSave(s);
  assert.equal(fresh.coins, 250);
  assert.equal(fresh.level, 1);
  assert.equal(fresh.settings.reduceFlash, true);
});
