'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic } = loadLogic();

// A campaign fight result as the fight session reports it. Defaults: a scrappy win rated C.
const fight = (o) => Object.assign({ mode: 'campaign', stageId: 'prologue.1', enemyId: 'hollow_shade', ng: 0, win: true,
  hpLeft: 0.2, time: 90, maxCombo: 1, parries: 0, flawless: false }, o);
const SCRAPPY = { hpLeft: 0.2, time: 90, maxCombo: 1, parries: 0, flawless: false };   // 8+0+2 = 10 -> C
const DOMINANT = { hpLeft: 1, time: 30, maxCombo: 10, parries: 1, flawless: false };    // 40+20+20+5 = 85 -> S
// Clears every stage before `id` in story order, so `id` is the open frontier.
const reach = (s, id) => { for (const st of Logic.stages()) { if (st.id === id) break; Logic.completeStage(s, st.id); } };

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

test('first win on the Prologue stretch pays 105 coins and 80 XP and clears the stage', () => {
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
  assert.equal(Logic.isStageComplete(s, 'prologue.1'), true);
  assert.equal(Logic.defeatedCount(s, 'prologue.1'), 1);
  assert.equal(out.next, 'act1.stretch1');
  assert.deepEqual(out.unlocks.map(u => ({ ...u })), [{ kind: 'chapter', id: 'act1' }]);
  assert.equal(s.stats.wins, 1);
});

test('replaying a cleared stage pays half coins and is not a first clear', () => {
  const s = Logic.defaultSave();
  Logic.applyFightResult(s, fight());
  const out = Logic.applyFightResult(s, fight());
  assert.equal(out.firstClear, false);
  assert.equal(out.coins, 55);
  assert.equal(Logic.defeatedCount(s, 'prologue.1'), 2);
  assert.deepEqual(out.unlocks, []);
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
  assert.equal(Logic.isStageComplete(s, 'prologue.1'), false);
  assert.equal(Logic.nextStage(s), 'prologue.1');
  assert.equal(s.stats.losses, 1);
});

test('beating Raikon pays boss rewards and opens the Interlude exactly once', () => {
  const s = Logic.defaultSave(); reach(s, 'act1.boss');
  const out = Logic.applyFightResult(s, fight({ stageId: 'act1.boss', enemyId: 'echo_warden', ...DOMINANT }));
  assert.equal(out.rating, 'S');
  assert.equal(out.coins, 535);
  assert.equal(out.gems, 5);
  assert.equal(out.xp, 300);
  assert.deepEqual(out.unlocks.map(u => ({ ...u })), [{ kind: 'chapter', id: 'interlude' }]);
  assert.equal(Logic.isChapterUnlocked(s, 'interlude'), true);
  assert.equal(s.stats.bosses, 1);

  const again = Logic.applyFightResult(s, fight({ stageId: 'act1.boss', enemyId: 'echo_warden', ...DOMINANT }));
  assert.deepEqual(again.unlocks, [], 'the chapter opens only once');
  assert.equal(again.gems, 1, 'a boss replay still pays one gem');
});

test('sub-bosses, the spar and the Core echoes pay sub-boss rewards scaled by their chapter', () => {
  const s = Logic.defaultSave(); reach(s, 'act1.sub1');
  const sub = Logic.applyFightResult(s, fight({ stageId: 'act1.sub1', enemyId: 'echo_sentinel' }));
  assert.equal(sub.coins, 230);
  assert.equal(sub.gems, 2);
  assert.equal(sub.xp, 150);
  const t = Logic.defaultSave(); reach(t, 'core.echo1');
  const echo = Logic.applyFightResult(t, fight({ stageId: 'core.echo1', enemyId: 'echo_sentinel' }));
  assert.equal(echo.coins, 430);
  assert.equal(echo.gems, 2);
  assert.equal(echo.xp, 450);
});

test('winning a stage that is still locked earns replay rewards and clears nothing', () => {
  const s = Logic.defaultSave();
  const out = Logic.applyFightResult(s, fight({ stageId: 'act2.boss', enemyId: 'echo_warden' }));
  assert.equal(out.firstClear, false);
  assert.equal(Logic.isStageComplete(s, 'act2.boss'), false);
});

test('beating the Witness opens the Epilogue but New Game+ waits for the story to end', () => {
  const s = Logic.defaultSave(); reach(s, 'core.witness');
  const out = Logic.applyFightResult(s, fight({ stageId: 'core.witness', enemyId: 'echo_warden' }));
  assert.deepEqual(out.unlocks.map(u => ({ ...u })), [{ kind: 'chapter', id: 'epilogue' }]);
  assert.equal(out.xp, 900);
  assert.equal(s.ngUnlocked, false);
  assert.ok(Logic.completeStage(s, 'epilogue').unlocks.some(u => u.kind === 'ng'));
  assert.equal(s.ngUnlocked, true);
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
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 'prologue.1') }, { coins: 105, gems: 0 });
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 'act1.boss') }, { coins: 355, gems: 5 });
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 'act1.sub1') }, { coins: 230, gems: 2 });
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 'interlude.spar') }, { coins: 230, gems: 2 });
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 'epilogue') }, { coins: 0, gems: 0 }, 'story scenes pay nothing');
  reach(s, 'act1.boss'); Logic.completeStage(s, 'act1.boss');
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 'act1.boss') }, { coins: 180, gems: 0 });
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
