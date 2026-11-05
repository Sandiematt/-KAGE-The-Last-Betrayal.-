'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic } = loadLogic();

test('each level needs 120 more XP than the last, starting at 200', () => {
  assert.equal(Logic.xpForLevel(1), 200);
  assert.equal(Logic.xpForLevel(2), 320);
  assert.equal(Logic.xpForLevel(10), 1280);
});

test('a new player has 232 health (220 plus the starting gear); each level adds 4', () => {
  const s = Logic.defaultSave();
  assert.equal(Logic.playerMaxHp(s), 232);
  s.level = 6;
  assert.equal(Logic.playerMaxHp(s), 252);
});

test('upgrading a weapon raises its shown stats; no shop weapon reaches 100 speed or reach', () => {
  assert.deepEqual({ ...Logic.weaponStats('kagetsu', 1) }, { damage: 60, speed: 64, reach: 58 });
  assert.deepEqual({ ...Logic.weaponStats('kagetsu', 3) }, { damage: 70, speed: 67, reach: 60 });
  const maxed = Logic.weaponStats('iwakudaki', Logic.GEAR_MAX.weapons);
  assert.deepEqual({ ...maxed }, { damage: 153, speed: 19, reach: 73 });
});

test('upgrade costs scale with the item price and level, rounded to 10 coins', () => {
  // kagetsu has no price: base 500 -> 500 * 0.65 (324.99... in floating point) -> 320
  assert.equal(Logic.upgradeCost('weapons', 'kagetsu', 1), 320);
  assert.equal(Logic.upgradeCost('weapons', 'kagetsu', 2), 480);
});

test('gear you cannot afford, already own, or that is a boss trophy cannot be bought', () => {
  const s = Logic.defaultSave(); s.coins = 0; s.gems = 0;
  const shop = Object.entries(Logic.gearTable('weapons')).find(([, w]) => !w.exclusive && w.price);
  assert.ok(shop, 'there is a coin-priced shop weapon');
  assert.equal(Logic.buyItem(s, 'weapons', shop[0]), false);
  assert.equal(s.owned.weapons[shop[0]], undefined);
  s.coins = shop[1].price;
  assert.equal(Logic.buyItem(s, 'weapons', shop[0]), true);
  assert.equal(s.coins, 0);
  assert.equal(s.owned.weapons[shop[0]], 1);
  s.coins = shop[1].price;
  assert.equal(Logic.buyItem(s, 'weapons', shop[0]), false, 'already owned');
  assert.equal(s.coins, shop[1].price);
  const trophy = Object.keys(Logic.gearTable('weapons')).find(id => Logic.gearTable('weapons')[id].exclusive);
  s.coins = 1e9; s.gems = 1e9;
  assert.equal(Logic.buyItem(s, 'weapons', trophy), false);
});

test('upgrading spends the upgrade cost and stops at the cap', () => {
  const s = Logic.defaultSave(); s.coins = 1e9;
  assert.equal(Logic.upgradeItem(s, 'weapons', 'kagetsu'), true);
  assert.equal(s.owned.weapons.kagetsu, 2);
  assert.equal(s.coins, 1e9 - 320);
  while (Logic.upgradeItem(s, 'weapons', 'kagetsu'));
  assert.equal(s.owned.weapons.kagetsu, Logic.GEAR_MAX.weapons);
  assert.equal(Logic.upgradeItem(s, 'weapons', 'iwakudaki'), false, 'gear you do not own cannot be upgraded');
});

test('upgrading needs enough coins', () => {
  const s = Logic.defaultSave(); s.coins = 319;
  assert.equal(Logic.upgradeItem(s, 'weapons', 'kagetsu'), false);
  assert.equal(s.coins, 319);
  assert.equal(s.owned.weapons.kagetsu, 1);
});

test('only owned gear can be equipped, into its own slot', () => {
  const s = Logic.defaultSave();
  assert.equal(Logic.equipItem(s, 'weapons', 'iwakudaki'), false);
  assert.equal(s.equipped.weapon, 'kagetsu');
  s.owned.helmets.kuro_zukin = 1;
  assert.equal(Logic.equipItem(s, 'helmets', 'kuro_zukin'), true);
  assert.equal(s.equipped.helmet, 'kuro_zukin');
});
