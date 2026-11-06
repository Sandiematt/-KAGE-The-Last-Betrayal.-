'use strict';
// The developer unlock (DEV.unlockAll in 10-data.js): everything open and owned for testing, on its own save key so the
// real save is never touched. The helper loads with it OFF unless asked ({ dev: true }), so every other test file holds
// the real locks.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const dev = loadLogic({ dev: true });
const off = loadLogic();
const NORMAL = 'kage.lastbetrayal.save.v2';

test('the helper loads with the developer unlock off by default, and on when asked', () => {
  assert.equal(off.DEV.unlockAll, false);
  assert.equal(off.Logic.devUnlocked(), false);
  assert.equal(dev.Logic.devUnlocked(), true);
  assert.equal(off.Logic.isStageUnlocked(off.Logic.defaultSave(), 'act3.boss'), false, 'normal locks without it');
});

test('dev mode: every chapter and stage is open on a fresh save, and stages complete in any order', () => {
  const { Logic } = dev, s = Logic.openSave({}).save;
  for (const ch of Logic.chapters()) assert.equal(Logic.isChapterUnlocked(s, ch.id), true, ch.id);
  for (const st of Logic.stages()) assert.equal(Logic.isStageUnlocked(s, st.id), true, st.id);
  const done = Logic.completeStage(s, 'core.witness');
  assert.ok(done, 'the Witness can be cleared straight away');
  assert.equal(s.cleared['core.witness'], true);
  assert.equal(Logic.applyFightResult(s, { mode: 'campaign', stageId: 'act3.boss', ng: 0, win: true, hpLeft: 0.5, time: 90, maxCombo: 1, parries: 0, flawless: false }).rejected, undefined);
});

test('dev mode: the whole Boss Rush roster is available and boss echoes come from every boss', () => {
  const { Logic } = dev, s = Logic.openSave({}).save;
  const roster = Logic.bossRushRoster(s);
  assert.ok(roster.length >= 14);
  assert.ok(roster.every(b => b.available));
  assert.equal(Logic.echoTrialBosses(s).length, roster.length);
  assert.equal(Logic.bossRushRun(s).stages.length, roster.length);
});

test('dev mode: the save owns every weapon, helmet and armour at level 1, with 99,999 coins, 999 gems and New Game+ open', () => {
  const { Logic, WEAPONS, HELMETS, ARMORS } = dev, s = Logic.openSave({}).save;
  for (const [kind, table] of [['weapons', WEAPONS], ['helmets', HELMETS], ['armors', ARMORS]])
    for (const id in table) {
      if (table[id].enemy || id === 'fists') continue;
      assert.equal(s.owned[kind][id], 1, `${kind} ${id}`);
      assert.equal(Logic.isLocked(s, kind, id), false, `${kind} ${id} not locked`);
    }
  for (const id of ['raiko_no_tachi', 'mugen_no_ha', 'shinsen']) assert.equal(s.owned.weapons[id], 1, id);
  assert.equal(s.owned.armors.shinsei_yoroi, 1, 'NG-only gear too');
  assert.equal(s.coins, 99999); assert.equal(s.gems, 999);
  assert.equal(s.ngUnlocked, true);
  assert.equal(Logic.upgradeItem(s, 'weapons', 'kagetsu'), true, 'upgrades can still be tested');
  // a dev save that already upgraded something keeps the level
  const again = Logic.openSave({ [Logic.DEV_SAVE_KEY]: JSON.stringify(s) }).save;
  assert.equal(again.owned.weapons.kagetsu, 2);
  assert.equal(Logic.resetSave(s).owned.weapons.mugen_no_ha, 1, 'erasing progress in dev mode keeps everything unlocked');
});

test('dev mode plays on its own save key; the normal save is never read or deleted', () => {
  assert.equal(dev.Logic.DEV_SAVE_KEY, NORMAL + '.dev');
  assert.equal(dev.Logic.ACTIVE_SAVE_KEY, NORMAL + '.dev');
  assert.equal(off.Logic.ACTIVE_SAVE_KEY, NORMAL);
  assert.equal(dev.Logic.CORRUPT_SAVE_KEY, NORMAL + '.dev.corrupt');
  const real = off.Logic.defaultSave(); real.coins = 1234;
  const stored = { [NORMAL]: JSON.stringify(real), 'kage.save.v1': '{}' };
  const opened = dev.Logic.openSave(stored);
  assert.deepEqual(opened.remove, ['kage.save.v1'], 'only the old game\'s key is deleted');
  assert.ok(!opened.remove.includes(NORMAL));
  assert.equal(opened.fresh, true, 'the dev save starts fresh; the real one is not read');
  assert.equal(opened.save.coins, 99999);
  for (const L of [dev.Logic, off.Logic]) {
    assert.ok(!L.LEGACY_SAVE_KEYS.includes(NORMAL) && !L.LEGACY_SAVE_KEYS.includes(L.DEV_SAVE_KEY));
  }
  // turning DEV off returns to the untouched normal save with normal locks
  const back = off.Logic.openSave(stored).save;
  assert.equal(back.coins, 1234);
  assert.equal(back.owned.weapons.mugen_no_ha, undefined);
  assert.equal(off.Logic.isStageUnlocked(back, 'act1.boss'), false);
});
