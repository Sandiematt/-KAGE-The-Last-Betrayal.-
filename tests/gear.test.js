'use strict';
// The gear list of Yomi: starting loadout, tiers, effective stats per upgrade level, locked trophies,
// and gear granted by clearing campaign stages. Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, WEAPONS, HELMETS, ARMORS, CAMPAIGN } = loadLogic();
const KINDS = ['weapons', 'helmets', 'armors'];

test('a new save owns and wears Kagetsu, the White Face-Wrap and the Tachibana Yoroi', () => {
  const s = Logic.defaultSave();
  assert.deepEqual(s.equipped, { weapon: 'kagetsu', helmet: 'shiro_maki', armor: 'tachibana_yoroi' });
  assert.equal(s.owned.weapons.kagetsu, 1);
  assert.equal(s.owned.helmets.shiro_maki, 1);
  assert.equal(s.owned.armors.tachibana_yoroi, 1);
  assert.equal(WEAPONS.kagetsu.name, 'Kagetsu');
  assert.equal(ARMORS.tachibana_yoroi.name, 'Tachibana Yoroi');
  assert.equal(HELMETS.shiro_maki.name, 'White Face-Wrap');
});

test('upgrading Kagetsu raises its effective stats level by level', () => {
  assert.deepEqual({ ...Logic.weaponStats('kagetsu', 1) }, { damage: 60, speed: 64, reach: 58 });
  assert.deepEqual({ ...Logic.weaponStats('kagetsu', 2) }, { damage: 65, speed: 66, reach: 59 });
  assert.deepEqual({ ...Logic.weaponStats('kagetsu', 8) }, { damage: 94, speed: 75, reach: 64 });
  // in a fight: +8% damage per level
  assert.equal(Logic.weaponMul('kagetsu', 1).dmg, 1);
  assert.ok(Math.abs(Logic.weaponMul('kagetsu', 8).dmg - 1.56) < 1e-9);
});

test('a boss weapon hits far harder than its style\'s shop weapon, at a fixed level', () => {
  // Shinsen fights on the katana forms with 150 damage against Kagetsu's 60
  assert.ok(Math.abs(Logic.weaponMul('shinsen', 1).dmg - 2.5) < 1e-9);
  assert.equal(Logic.maxLevel('weapons', 'shinsen'), 1);
});

test('Kagetsu climbs from Common to Rare to Epic as it is upgraded', () => {
  assert.equal(Logic.itemTier('weapons', 'kagetsu', 1), 'common');
  assert.equal(Logic.itemTier('weapons', 'kagetsu', 4), 'rare');
  assert.equal(Logic.itemTier('weapons', 'kagetsu', 8), 'epic');
  const s = Logic.defaultSave(); s.coins = 1e9;
  while (Logic.upgradeItem(s, 'weapons', 'kagetsu'));
  assert.equal(s.owned.weapons.kagetsu, 8);
  assert.equal(Logic.itemTier('weapons', 'kagetsu', s.owned.weapons.kagetsu), 'epic');
});

test('upgrades stop at each item\'s cap: shop weapons 8, helmets and armour 5, trophies cannot be upgraded', () => {
  assert.equal(Logic.maxLevel('weapons', 'tsubame'), 8);
  assert.equal(Logic.maxLevel('helmets', 'tetsu_kabuto'), 5);
  assert.equal(Logic.maxLevel('armors', 'kozane_do'), 5);
  assert.equal(Logic.maxLevel('helmets', 'kasa'), 1);
  const s = Logic.defaultSave(); s.coins = 1e9;
  s.owned.armors.kozane_do = 1; s.owned.weapons.raiko_no_tachi = 1;
  while (Logic.upgradeItem(s, 'armors', 'kozane_do'));
  assert.equal(s.owned.armors.kozane_do, 5);
  assert.equal(Logic.upgradeItem(s, 'weapons', 'raiko_no_tachi'), false);
  assert.equal(s.owned.weapons.raiko_no_tachi, 1);
});

test('even the starting gear gets tougher when upgraded', () => {
  assert.ok(Math.abs(Logic.gearDef('helmets', 'shiro_maki', 5) - 0.058) < 1e-9);
  assert.equal(Logic.gearHp('armors', 'tachibana_yoroi', 5), 11);
});

test('armour and helmets add defence and health that grow with each upgrade', () => {
  assert.equal(Logic.gearDef('armors', 'kozane_do', 1), 0.1);
  assert.ok(Math.abs(Logic.gearDef('armors', 'kozane_do', 5) - 0.148) < 1e-9);
  assert.equal(Logic.gearHp('armors', 'kozane_do', 1), 28);
  assert.equal(Logic.gearHp('armors', 'kozane_do', 5), 39);
});

test('better gear noticeably raises Kage\'s health, defence and damage', () => {
  const s = Logic.defaultSave();
  const start = Logic.playerCombatStats(s);
  assert.equal(start.hp, 232, '220 base + 8 from the Tachibana Yoroi + 4 from the face-wrap');
  assert.ok(Math.abs(start.defense - 0.03) < 1e-9);
  assert.equal(start.weaponDmg, 1);
  s.owned.armors.kurogane_do = 5; s.owned.helmets.shika_kabuto = 5; s.owned.weapons.iwakudaki = 8;
  s.equipped = { weapon: 'iwakudaki', helmet: 'shika_kabuto', armor: 'kurogane_do' };
  const geared = Logic.playerCombatStats(s);
  assert.equal(geared.hp, 220 + 77 + 31);
  assert.ok(Math.abs(geared.defense - 0.376) < 1e-9);
  assert.ok(Math.abs(geared.weaponDmg - 1.56) < 1e-9);
});

test('every boss weapon has at least 1.5x the total stats of the best fully upgraded shop weapon', () => {
  const shop = Object.keys(WEAPONS).filter(id => ['common', 'rare', 'epic'].includes(WEAPONS[id].tier));
  assert.equal(shop.length, 7, 'Kagetsu plus six buyable weapons');
  const best = Math.max(...shop.map(id => Logic.weaponTotal(id, Logic.maxLevel('weapons', id))));
  assert.equal(best, 258, 'Mizuchi at level 8: 81 + 71 + 106');
  const bosses = ['shinsen', 'raiko_no_tachi', 'kagehira_yurei', 'mugen_no_ha'];
  for (const id of bosses) {
    assert.equal(WEAPONS[id].tier, 'boss', id);
    assert.ok(Logic.weaponTotal(id, Logic.maxLevel('weapons', id)) >= 1.5 * best, `${id} total ${Logic.weaponTotal(id, 1)}`);
  }
});

test('trophies beat every fully upgraded shop item of their slot', () => {
  for (const kind of ['helmets', 'armors']) {
    const t = Logic.gearTable(kind), ids = Object.keys(t);
    const shop = ids.filter(id => ['common', 'rare', 'epic'].includes(t[id].tier));
    const bestDef = Math.max(...shop.map(id => Logic.gearDef(kind, id, Logic.maxLevel(kind, id))));
    const bestHp = Math.max(...shop.map(id => Logic.gearHp(kind, id, Logic.maxLevel(kind, id))));
    for (const id of ids.filter(i => t[i].tier === 'trophy')) {
      assert.ok(Logic.gearDef(kind, id, 1) >= bestDef, `${id} defence`);
      assert.ok(Logic.gearHp(kind, id, 1) >= bestHp, `${id} health`);
    }
  }
});

test('every weapon, helmet and armour carries a lore line', () => {
  for (const kind of KINDS) for (const [id, it] of Object.entries(Logic.gearTable(kind))) {
    if (it.enemy || id === 'fists') continue;
    assert.equal(typeof it.lore, 'string', `${kind}.${id}`);
    assert.ok(it.lore.trim().length > 20, `${kind}.${id} lore is a real line`);
  }
});

test('the shop sells ten helmets and ten armours across Common, Rare and Epic', () => {
  for (const kind of ['helmets', 'armors']) {
    const t = Logic.gearTable(kind), shop = Object.keys(t).filter(id => !Logic.isLocked(Logic.defaultSave(), kind, id) && t[id].tier !== 'starter');
    assert.equal(shop.length, 10, kind);
    assert.deepEqual([...new Set(shop.map(id => t[id].tier))].sort(), ['common', 'epic', 'rare'], kind);
  }
});

test('boss weapons and trophies are in the Armory but locked, with a hint, and cannot be bought', () => {
  const s = Logic.defaultSave(); s.coins = 1e9; s.gems = 1e9;
  const locked = [['weapons', 'shinsen'], ['weapons', 'raiko_no_tachi'], ['weapons', 'kagehira_yurei'], ['weapons', 'mugen_no_ha'],
    ['helmets', 'raijin_kabuto'], ['helmets', 'kasa'], ['armors', 'mei_en_garb'], ['armors', 'shinsei_yoroi'], ['armors', 'kysmei_robe'], ['armors', 'kurokumo_yoroi']];
  for (const [kind, id] of locked) {
    assert.equal(Logic.isLocked(s, kind, id), true, id);
    assert.equal(Logic.buyItem(s, kind, id), false, id);
    assert.equal(s.owned[kind][id], undefined, id);
  }
  assert.equal(Logic.lockHint('weapons', 'raiko_no_tachi'), 'Defeat Raikon');
  assert.equal(Logic.isLocked(s, 'weapons', 'tsubame'), false);
  s.owned.weapons.shinsen = 1;
  assert.equal(Logic.isLocked(s, 'weapons', 'shinsen'), false, 'an owned trophy is no longer locked');
});

// Stage rewards: later tickets put `reward: { weapons, helmets, armors }` on a CAMPAIGN stage.
// Each test loads fresh tables, so the reward it adds stays local to it.
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
const win = (stageId, ng) => ({ mode: 'campaign', stageId, win: true, ng: ng || 0, hpLeft: 0.5, time: 70, maxCombo: 4, parries: 0, flawless: false });

test('only Raikon’s stage grants gear so far: the other boss tickets add theirs', () => {
  for (const st of Logic.stages()) if (st.id !== 'act1.boss') assert.equal(st.reward, undefined, st.id);
  assert.deepEqual(Logic.stage('act1.boss').reward, { weapons: ['raiko_no_tachi'], helmets: ['raijin_kabuto'] });
});

test('clearing a stage with a gear reward grants it once and reports it', () => {
  const L = loadLogic().Logic;
  L.stage('act1.boss').reward = { weapons: ['raiko_no_tachi'], helmets: ['raijin_kabuto'] };
  const s = L.defaultSave();
  clearUpTo(L, s, 'act1.boss');
  assert.equal(L.isLocked(s, 'weapons', 'raiko_no_tachi'), true);
  const out = L.applyFightResult(s, win('act1.boss'));
  assert.equal(s.owned.weapons.raiko_no_tachi, 1);
  assert.equal(s.owned.helmets.raijin_kabuto, 1);
  assert.deepEqual(out.unlocks.filter(u => u.kind !== 'chapter'), [{ kind: 'weapons', id: 'raiko_no_tachi' }, { kind: 'helmets', id: 'raijin_kabuto' }]);
  assert.equal(L.equipItem(s, 'weapons', 'raiko_no_tachi'), true, 'a granted trophy can be equipped');
  const again = L.applyFightResult(s, win('act1.boss'));
  assert.deepEqual(again.unlocks, [], 'replaying grants nothing new');
  assert.equal(s.owned.weapons.raiko_no_tachi, 1);
});

test('a New Game+ only trophy drops only when the stage is cleared during New Game+', () => {
  const L = loadLogic().Logic;
  L.stage('act3.boss').reward = { weapons: ['shinsen'], armors: ['shinsei_yoroi'] };
  const s = L.defaultSave();
  clearUpTo(L, s, 'act3.boss');
  const first = L.completeStage(s, 'act3.boss');
  assert.deepEqual(first.gear, [{ kind: 'weapons', id: 'shinsen' }]);
  assert.equal(s.owned.armors.shinsei_yoroi, undefined);
  for (const st of L.stages()) L.completeStage(s, st.id);
  assert.equal(L.startNewGamePlus(s), true);
  clearUpTo(L, s, 'act3.boss');
  const ng = L.completeStage(s, 'act3.boss');
  assert.deepEqual(ng.gear, [{ kind: 'armors', id: 'shinsei_yoroi' }]);
  assert.equal(s.owned.armors.shinsei_yoroi, 1);
  assert.equal(s.owned.weapons.shinsen, 1);
});
