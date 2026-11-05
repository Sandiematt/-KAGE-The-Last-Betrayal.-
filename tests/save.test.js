'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic } = loadLogic();

test('a new save starts with 250 coins, 5 gems, level 1 and Kagetsu equipped', () => {
  const s = Logic.defaultSave();
  assert.equal(s.coins, 250);
  assert.equal(s.gems, 5);
  assert.equal(s.level, 1);
  assert.equal(s.xp, 0);
  assert.equal(s.equipped.weapon, 'kagetsu');
  assert.equal(s.owned.weapons.kagetsu, 1);
  assert.equal(Logic.nextStage(s), 'prologue.1');
  assert.deepEqual(s.cleared, {});
});

test('each default save is a fresh object', () => {
  const a = Logic.defaultSave();
  a.coins = 0; a.owned.weapons.iwakudaki = 1;
  const b = Logic.defaultSave();
  assert.equal(b.coins, 250);
  assert.equal(b.owned.weapons.iwakudaki, undefined);
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
  s.coins = 1234; s.level = 7; s.cleared['prologue.1'] = true; s.defeated['prologue.1'] = 3;
  s.owned.weapons.iwakudaki = 3; s.equipped.weapon = 'iwakudaki'; s.settings.shake = 'off';
  const { save } = Logic.loadSave(JSON.stringify(s));
  assert.deepEqual(save, s);
});

test('an old save missing newer fields is filled in with defaults, keeping what it has', () => {
  const old = { coins: 900, owned: { weapons: { iwakudaki: 2 } }, settings: { sound: false } };
  const { save } = Logic.loadSave(JSON.stringify(old));
  assert.equal(save.coins, 900);
  assert.equal(save.gems, 5);
  assert.equal(save.owned.weapons.iwakudaki, 2);
  assert.equal(save.owned.weapons.kagetsu, 1, 'the starter katana is always owned');
  assert.equal(save.owned.helmets.shiro_maki, 1);
  assert.equal(save.equipped.weapon, 'kagetsu');
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

/* ---------------- The Last Betrayal: new save key, old saves deleted ---------------- */

test('on first launch both saves from the old game are deleted and nothing carries over', () => {
  const rich = JSON.stringify({ coins: 99999, gems: 400, level: 30, cleared: { '0-0': true }, unlockedActs: 3 });
  const { save, error, remove } = Logic.openSave({ 'kage.save.v1': rich, 'ashbound.save.v1': rich });
  assert.equal(error, null);
  assert.deepEqual([...remove].sort(), ['ashbound.save.v1', 'kage.save.v1']);
  assert.equal(save.coins, 250);
  assert.equal(save.level, 1);
  assert.deepEqual(save.cleared, {});
  assert.deepEqual(save, Logic.defaultSave());
});

test('a brand-new player gets a fresh default save that should be written, with nothing to delete', () => {
  const { save, error, remove, fresh } = Logic.openSave({});
  assert.equal(error, null);
  assert.deepEqual(remove, []);
  assert.equal(fresh, true);
  assert.deepEqual(save, Logic.defaultSave());
});

test('new saves use schema version 2 under a key different from both old keys', () => {
  assert.equal(Logic.defaultSave().v, 2);
  assert.equal(Logic.SAVE_KEY, 'kage.lastbetrayal.save.v2');
  assert.ok(!['kage.save.v1', 'ashbound.save.v1'].includes(Logic.SAVE_KEY));
});

test('a corrupt new save falls back to a fresh save, reports the error, and the old saves are still deleted', () => {
  const { save, error, remove } = Logic.openSave({ 'kage.lastbetrayal.save.v2': '{"coins": 9000,,, oops', 'kage.save.v1': '{"coins": 777}' });
  assert.ok(error instanceof Error);
  assert.deepEqual(remove, ['kage.save.v1']);
  assert.deepEqual(save, Logic.defaultSave());
});

test('a returning player keeps their Last Betrayal progress and is not given a fresh save', () => {
  const s = Logic.defaultSave();
  s.coins = 1600; s.level = 4; s.cleared['prologue.1'] = true;
  const { save, error, remove, fresh } = Logic.openSave({ 'kage.lastbetrayal.save.v2': JSON.stringify(s), 'ashbound.save.v1': '{"coins": 5}' });
  assert.equal(error, null);
  assert.equal(fresh, false);
  assert.deepEqual(remove, ['ashbound.save.v1']);
  assert.equal(save.coins, 1600);
  assert.equal(save.level, 4);
  assert.equal(save.cleared['prologue.1'], true);
});

test('gear the game no longer has is dropped and the starting loadout is worn instead', () => {
  const stale = { coins: 10, owned: { weapons: { moon_katana: 4, iwakudaki: 2 }, helmets: { topknot: 1 }, armors: { wraps: 1 } },
    equipped: { weapon: 'moon_katana', helmet: 'topknot', armor: 'wraps' } };
  const { save } = Logic.loadSave(JSON.stringify(stale));
  assert.equal(save.owned.weapons.moon_katana, undefined);
  assert.equal(save.owned.weapons.iwakudaki, 2);
  assert.deepEqual(save.equipped, { weapon: 'kagetsu', helmet: 'shiro_maki', armor: 'tachibana_yoroi' });
});
