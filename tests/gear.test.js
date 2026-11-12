'use strict';
// The gear list of Yomi: starting loadout, tiers, effective stats per upgrade level, locked trophies,
// and gear granted by clearing campaign stages. Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, WEAPONS, HELMETS, ARMORS, CAMPAIGN } = loadLogic();
const KINDS = ['weapons', 'helmets', 'armors'];
const GEAR_RANK = (tier) => ({ starter: 0, common: 1, rare: 2, epic: 3, trophy: 4, boss: 5 })[tier];

test('a new save owns and wears Kagetsu, the Crimson Scarf and the Shinobi Garb', () => {
  const s = Logic.defaultSave();
  assert.deepEqual(s.equipped, { weapon: 'kagetsu', helmet: 'shiro_maki', armor: 'tachibana_yoroi' });
  assert.equal(s.owned.weapons.kagetsu, 1);
  assert.equal(s.owned.helmets.shiro_maki, 1);
  assert.equal(s.owned.armors.tachibana_yoroi, 1);
  assert.equal(WEAPONS.kagetsu.name, 'Kagetsu');
  assert.equal(ARMORS.tachibana_yoroi.name, 'Shinobi Garb', 'the starting armour keeps its saved id');
  assert.equal(HELMETS.shiro_maki.name, 'Crimson Scarf');
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
  assert.equal(Logic.maxLevel('armors', 'raiko_yoroi'), 5);
  assert.equal(Logic.maxLevel('helmets', 'kasa'), 1);
  const s = Logic.defaultSave(); s.coins = 1e9;
  s.owned.armors.raiko_yoroi = 1; s.owned.weapons.raiko_no_tachi = 1;
  while (Logic.upgradeItem(s, 'armors', 'raiko_yoroi'));
  assert.equal(s.owned.armors.raiko_yoroi, 5);
  assert.equal(Logic.upgradeItem(s, 'weapons', 'raiko_no_tachi'), false);
  assert.equal(s.owned.weapons.raiko_no_tachi, 1);
});

test('even the starting gear gets tougher when upgraded', () => {
  assert.ok(Math.abs(Logic.gearDef('helmets', 'shiro_maki', 5) - 0.058) < 1e-9);
  assert.equal(Logic.gearHp('armors', 'tachibana_yoroi', 5), 11);
});

test('armour and helmets add defence and health that grow with each upgrade', () => {
  assert.equal(Logic.gearDef('armors', 'raiko_yoroi', 1), 0.11);
  assert.ok(Math.abs(Logic.gearDef('armors', 'raiko_yoroi', 5) - 0.158) < 1e-9);
  assert.equal(Logic.gearHp('armors', 'raiko_yoroi', 1), 32);
  assert.equal(Logic.gearHp('armors', 'raiko_yoroi', 5), 45);
});

test('better gear noticeably raises Kage\'s health, defence and damage', () => {
  const s = Logic.defaultSave();
  const start = Logic.playerCombatStats(s);
  assert.equal(start.hp, 232, '220 base + 8 from the Shinobi Garb + 4 from the Crimson Scarf');
  assert.ok(Math.abs(start.defense - 0.03) < 1e-9);
  assert.equal(start.weaponDmg, 1);
  s.owned.armors.mugen_yoroi = 5; s.owned.helmets.shika_kabuto = 5; s.owned.weapons.iwakudaki = 8;
  s.equipped = { weapon: 'iwakudaki', helmet: 'shika_kabuto', armor: 'mugen_yoroi' };
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

test('the shop sells ten helmets and the seven armours after the Shinobi Garb, across Common, Rare and Epic', () => {
  for (const [kind, n] of [['helmets', 10], ['armors', 7]]) {
    const t = Logic.gearTable(kind), shop = Object.keys(t).filter(id => !t[id].enemy && !Logic.isLocked(Logic.defaultSave(), kind, id) && t[id].tier !== 'starter');
    assert.equal(shop.length, n, kind);
    assert.deepEqual([...new Set(shop.map(id => t[id].tier))].sort(), ['common', 'epic', 'rare'], kind);
  }
});

// The armour line, as on the user's armory sheet: Shinobi Garb (the start) up to the Mugen Armor, each better than
// the one before it.
const ARMOR_LINE = ['tachibana_yoroi', 'ronin_yoroi', 'yami_yoroi', 'shinsen_yoroi', 'raiko_yoroi', 'kagehira_yoroi', 'yurei_yoroi', 'mugen_yoroi'];

test('the armour line climbs: each armour beats the one before it in defence, health, perks and price', () => {
  assert.deepEqual(ARMOR_LINE.map(id => ARMORS[id].name), ['Shinobi Garb', 'Ronin Armor', 'Yami Armor', 'Shinsen Armor', 'Raikō Armor', 'Kagehira Armor', 'Yūrei Armor', 'Mugen Armor']);
  for (let i = 1; i < ARMOR_LINE.length; i++) {
    const a = ARMORS[ARMOR_LINE[i - 1]], b = ARMORS[ARMOR_LINE[i]];
    assert.ok(b.def > a.def, `${b.name} defence`);
    assert.ok(b.hp > a.hp, `${b.name} health`);
    assert.ok(b.price > a.price, `${b.name} price`);
    assert.ok(Object.keys(b.perks).length >= Object.keys(a.perks).length, `${b.name} perks`);
    assert.ok(Object.values(b.perks).every(v => v > 0), `${b.name} has no drawback perks`);
    assert.ok(GEAR_RANK(b.tier) >= GEAR_RANK(a.tier), `${b.name} tier`);
    assert.match(b.hue, /^#[0-9a-f]{6}$/, `${b.name} card colour`);
  }
  const m = ARMORS.mugen_yoroi;
  assert.equal(m.price, 4200); assert.equal(m.gems, 25);
  assert.deepEqual(m.perks, { dmg: 0.07, rage: 0.2, stunRes: 0.2 });
});

test('the Mugen Armor takes coins and gems, and needs both', () => {
  const s = Logic.defaultSave(); s.coins = 4200; s.gems = 24;
  assert.equal(Logic.buyItem(s, 'armors', 'mugen_yoroi'), false, 'one gem short');
  s.gems = 25; s.coins = 4199;
  assert.equal(Logic.buyItem(s, 'armors', 'mugen_yoroi'), false, 'one coin short');
  s.coins = 5000;
  assert.equal(Logic.buyItem(s, 'armors', 'mugen_yoroi'), true);
  assert.equal(s.coins, 800); assert.equal(s.gems, 0); assert.equal(s.owned.armors.mugen_yoroi, 1);
});

test('the shop armour retired by the line is never sold, and a save that owned it is refunded and dressed again', () => {
  const retired = Object.keys(ARMORS).filter(id => ARMORS[id].retired);
  assert.equal(retired.length, 10, 'the old shop armour: Kawa-dō to Gōka Yoroi');
  const s0 = Logic.defaultSave(); s0.coins = 1e9; s0.gems = 1e9;
  for (const id of retired) assert.equal(Logic.buyItem(s0, 'armors', id), false, id);
  const old = Logic.defaultSave();
  old.coins = 10; old.gems = 1;
  old.owned.armors = { tachibana_yoroi: 1, kozane_do: 3, raiun_mantle: 1 };
  old.equipped.armor = 'kozane_do';
  const s = Logic.normalizeSave(JSON.parse(JSON.stringify(old)));
  assert.equal(s.coins, 10 + 1300 + Logic.upgradeCost('armors', 'kozane_do', 1) + Logic.upgradeCost('armors', 'kozane_do', 2));
  assert.equal(s.gems, 1 + 15);
  assert.deepEqual(s.owned.armors, { tachibana_yoroi: 1 });
  assert.equal(s.equipped.armor, 'tachibana_yoroi');
  // loading the refunded save again pays nothing more
  const again = Logic.normalizeSave(JSON.parse(JSON.stringify(s)));
  assert.equal(again.coins, s.coins); assert.equal(again.gems, s.gems);
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

test('Acts I to III (each boss and its four sub-bosses) and the Epilogue grant gear: the Core echoes grant gems, never gear', () => {
  const granting = ['act1.sub1', 'act1.sub2', 'act1.sub3', 'act1.sub4', 'act1.boss', 'act2.sub1', 'act2.sub2', 'act2.sub3', 'act2.sub4', 'act2.boss', 'act3.sub1', 'act3.sub2', 'act3.sub3', 'act3.sub4', 'act3.boss', 'epilogue'];
  const gearOf = (st) => ['weapons', 'helmets', 'armors'].flatMap(k => (st.reward || {})[k] || []);
  for (const st of Logic.stages()) if (!granting.includes(st.id)) assert.deepEqual(gearOf(st), [], st.id);
  for (const st of Logic.stages()) if (st.reward && !granting.includes(st.id)) assert.equal(st.kind, 'echo', `${st.id}: only the echoes pay a gem reward`);
  assert.deepEqual(Logic.stage('act1.boss').reward, { weapons: ['raiko_no_tachi'], helmets: ['raijin_kabuto'] });
  assert.deepEqual(Logic.stage('act2.boss').reward, { weapons: ['kagehira_yurei', 'shinsen'], armors: ['mei_en_garb'] });
  assert.deepEqual(Logic.stage('act3.boss').reward, { helmets: ['kasa'] }, 'Takashi leaves only his Kasa; the Shinsei Yoroi is New Game+ only');
  assert.deepEqual(Logic.stage('epilogue').reward, { weapons: ['mugen_no_ha'], armors: ['kysmei_robe', 'kurokumo_yoroi', 'shinsei_yoroi'] }, 'the post-story unlocks (Shinsei Yoroi ngOnly)');
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
  L.stage('act3.boss').reward = { weapons: ['mugen_no_ha'], armors: ['shinsei_yoroi'] };
  const s = L.defaultSave();
  clearUpTo(L, s, 'act3.boss');
  const first = L.completeStage(s, 'act3.boss');
  assert.deepEqual(first.gear, [{ kind: 'weapons', id: 'mugen_no_ha' }]);
  assert.equal(s.owned.armors.shinsei_yoroi, undefined);
  for (const st of L.stages()) L.completeStage(s, st.id);
  assert.equal(L.startNewGamePlus(s), true);
  clearUpTo(L, s, 'act3.boss');
  const ng = L.completeStage(s, 'act3.boss');
  assert.deepEqual(ng.gear, [{ kind: 'armors', id: 'shinsei_yoroi' }]);
  assert.equal(s.owned.armors.shinsei_yoroi, 1);
  assert.equal(s.owned.weapons.mugen_no_ha, 1);
});
