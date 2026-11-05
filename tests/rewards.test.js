'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic } = loadLogic();

// A campaign fight result as the fight session reports it. Defaults: a scrappy win rated C.
const fight = (o) => Object.assign({ mode: 'campaign', act: 0, stage: 0, enemyId: 'shiro', ng: 0, win: true,
  hpLeft: 0.2, time: 90, maxCombo: 1, parries: 0, flawless: false }, o);
const SCRAPPY = { hpLeft: 0.2, time: 90, maxCombo: 1, parries: 0, flawless: false };   // 8+0+2 = 10 -> C
const DOMINANT = { hpLeft: 1, time: 30, maxCombo: 10, parries: 1, flawless: false };    // 40+20+20+5 = 85 -> S

test('fight ratings: a loss is always C; S needs a dominant win', () => {
  assert.equal(Logic.rateFight({ ...DOMINANT, win: false }), 'C');
  assert.equal(Logic.rateFight({ ...SCRAPPY, win: true }), 'C');
  assert.equal(Logic.rateFight({ ...DOMINANT, win: true }), 'S');
  assert.equal(Logic.rateFight({ win: true, hpLeft: 0.8, time: 60, maxCombo: 6, parries: 1, flawless: false }), 'B'); // 32+10+12+5 = 59
});

test('rating thresholds: 62 is A, 42 is B', () => {
  // 40 (full hp) + 10 (time 60) + 12 (combo 6) = 62
  assert.equal(Logic.rateFight({ win: true, hpLeft: 1, time: 60, maxCombo: 6, parries: 0, flawless: false }), 'A');
  // 20 (half hp) + 10 + 12 = 42
  assert.equal(Logic.rateFight({ win: true, hpLeft: 0.5, time: 60, maxCombo: 6, parries: 0, flawless: false }), 'B');
});

test('first win over an Act I duelist pays 105 coins and 80 XP and clears the stage', () => {
  const s = Logic.defaultSave();
  const out = Logic.applyFightResult(s, fight());
  assert.equal(out.rating, 'C');
  assert.equal(out.firstClear, true);
  assert.equal(out.coins, 105);
  assert.equal(out.gems, 0);
  assert.equal(out.xp, 80);
  assert.deepEqual(out.seals, [true, false, false]);
  assert.equal(s.coins, 250 + 105);
  assert.equal(s.xp, 80);
  assert.equal(Logic.isStageCleared(s, 0, 0), true);
  assert.equal(s.defeated.shiro, 1);
  assert.equal(s.stats.wins, 1);
});

test('replaying a cleared stage pays half coins and is not a first clear', () => {
  const s = Logic.defaultSave();
  Logic.applyFightResult(s, fight());
  const out = Logic.applyFightResult(s, fight());
  assert.equal(out.firstClear, false);
  assert.equal(out.coins, 55);
  assert.equal(s.defeated.shiro, 2);
});

test('a flawless win earns a bonus gem and the flawless seal', () => {
  const s = Logic.defaultSave();
  const out = Logic.applyFightResult(s, fight({ flawless: true, time: 50 }));
  assert.equal(out.gems, 1);
  assert.deepEqual(out.seals, [true, true, true]);
  assert.equal(s.stats.perfects, 1);
});

test('a loss pays a quarter of the base coins and 20 XP per act difficulty', () => {
  const s = Logic.defaultSave();
  const out = Logic.applyFightResult(s, fight({ win: false }));
  assert.equal(out.rating, 'C');
  assert.equal(out.coins, 25);
  assert.equal(out.xp, 20);
  assert.equal(Logic.isStageCleared(s, 0, 0), false);
  assert.equal(s.stats.losses, 1);
});

test('beating the Act I boss pays boss rewards, grants the trophy and opens Act II exactly once', () => {
  const s = Logic.defaultSave();
  const out = Logic.applyFightResult(s, fight({ stage: 6, enemyId: 'noctis', ...DOMINANT }));
  assert.equal(out.rating, 'S');
  assert.equal(out.coins, 535);
  assert.equal(out.gems, 5);
  assert.equal(out.xp, 300);
  assert.deepEqual(out.unlocks.map(u => ({ ...u })), [
    { kind: 'weapons', id: 'phantom_sickle' }, { kind: 'helmets', id: 'hollow_crest' }, { kind: 'act', id: 1 }]);
  assert.equal(s.owned.weapons.phantom_sickle, 1);
  assert.equal(s.owned.helmets.hollow_crest, 1);
  assert.equal(Logic.isActUnlocked(s, 1), true);
  assert.equal(s.stats.bosses, 1);

  const again = Logic.applyFightResult(s, fight({ stage: 6, enemyId: 'noctis', ...DOMINANT }));
  assert.deepEqual(again.unlocks, [], 'trophies and the act are granted only once');
  assert.equal(again.gems, 1, 'a boss replay still pays one gem');
});

test('a trophy already owned is not granted again', () => {
  const s = Logic.defaultSave();
  s.owned.weapons.phantom_sickle = 4;
  const out = Logic.applyFightResult(s, fight({ stage: 6, enemyId: 'noctis' }));
  assert.equal(s.owned.weapons.phantom_sickle, 4);
  assert.ok(!out.unlocks.some(u => u.id === 'phantom_sickle'));
});

test('beating the final boss unlocks New Game+ and records the completed cycle', () => {
  const s = Logic.defaultSave(); s.unlockedActs = 3;
  const out = Logic.applyFightResult(s, fight({ act: 2, stage: 6, enemyId: 'malgrath' }));
  assert.ok(out.unlocks.some(u => u.kind === 'ng'));
  assert.ok(!out.unlocks.some(u => u.kind === 'act'), 'there is no Act IV');
  assert.equal(s.ngUnlocked, true);
  assert.equal(s.ngCompletions, 1);
  assert.equal(s.owned.weapons.titan_hammer, 1);
});

test('New Game+ raises rewards by 60% per cycle', () => {
  const s = Logic.defaultSave(); s.ng = 1;
  const out = Logic.applyFightResult(s, fight({ ng: 1 }));
  assert.equal(out.coins, 170);
  assert.equal(out.xp, 128);
});

test('enough XP levels the player up and carries the remainder over', () => {
  const s = Logic.defaultSave(); s.xp = 150;
  const out = Logic.applyFightResult(s, fight());
  assert.equal(out.levelUps, 1);
  assert.equal(out.levelBefore, 1);
  assert.equal(out.xpBefore, 150);
  assert.equal(s.level, 2);
  assert.equal(s.xp, 30);
});

test('the stage card previews the first-clear reward and the replay reward', () => {
  const s = Logic.defaultSave();
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 0, 0) }, { coins: 105, gems: 0 });
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 0, 6) }, { coins: 355, gems: 5 });
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 0, 2) }, { coins: 230, gems: 2 });
  s.cleared['0-6'] = true;
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 0, 6) }, { coins: 180, gems: 0 });
});

test('survival waves pay rising coins and a gem every 5th wave', () => {
  assert.deepEqual({ ...Logic.survivalWaveReward(1) }, { coins: 37, gems: 0 });
  assert.deepEqual({ ...Logic.survivalWaveReward(4) }, { coins: 73, gems: 0 });
  assert.deepEqual({ ...Logic.survivalWaveReward(5) }, { coins: 85, gems: 1 });
  assert.deepEqual({ ...Logic.survivalWaveReward(10) }, { coins: 145, gems: 1 });
});

test('a survival run banks its coins and gems, 40 XP per wave, and tracks the best wave', () => {
  const s = Logic.defaultSave();
  const out = Logic.applyFightResult(s, { mode: 'survival', waves: 7, survivalCoins: 400, survivalGems: 1, ng: 0 });
  assert.equal(out.coins, 400);
  assert.equal(out.gems, 1);
  assert.equal(out.xp, 280);
  assert.equal(out.rating, 'B');
  assert.equal(out.newBest, true);
  assert.deepEqual(out.seals, [true, false, false]);
  assert.equal(s.survivalBest, 7);
  assert.equal(s.coins, 650);
  assert.equal(s.gems, 6);
  const worse = Logic.applyFightResult(s, { mode: 'survival', waves: 3, survivalCoins: 100, survivalGems: 0, ng: 0 });
  assert.equal(worse.newBest, false);
  assert.equal(worse.rating, 'C');
  assert.equal(s.survivalBest, 7);
});
