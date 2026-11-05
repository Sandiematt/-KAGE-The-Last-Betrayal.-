'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic } = loadLogic();
const clear = (s, a, st) => { s.cleared[`${a}-${st}`] = true; };

test('a new player can only fight the first stage of Act I', () => {
  const s = Logic.defaultSave();
  assert.equal(Logic.stageUnlocked(s, 0, 0), true);
  assert.equal(Logic.stageUnlocked(s, 0, 1), false);
  assert.equal(Logic.stageUnlocked(s, 1, 0), false, 'Act II is locked');
  assert.deepEqual({ ...Logic.nextStage(s) }, { act: 0, stage: 0 });
});

test('clearing a stage unlocks the next stage in the act, and cleared stages stay replayable', () => {
  const s = Logic.defaultSave();
  clear(s, 0, 0);
  assert.equal(Logic.stageUnlocked(s, 0, 0), true);
  assert.equal(Logic.stageUnlocked(s, 0, 1), true);
  assert.equal(Logic.stageUnlocked(s, 0, 2), false);
  assert.deepEqual({ ...Logic.nextStage(s) }, { act: 0, stage: 1 });
});

test('the next stage is the first uncleared one, even with a gap', () => {
  const s = Logic.defaultSave();
  clear(s, 0, 0); clear(s, 0, 1); clear(s, 0, 3);
  assert.deepEqual({ ...Logic.nextStage(s) }, { act: 0, stage: 2 });
});

test('with Act I fully cleared but Act II still locked there is no next stage', () => {
  const s = Logic.defaultSave();
  for (let i = 0; i < 7; i++) clear(s, 0, i);
  assert.equal(Logic.nextStage(s), null);
});

test('once an act is unlocked its first stage is open and comes next', () => {
  const s = Logic.defaultSave();
  for (let i = 0; i < 7; i++) clear(s, 0, i);
  s.unlockedActs = 2;
  assert.equal(Logic.isActUnlocked(s, 1), true);
  assert.equal(Logic.isActUnlocked(s, 2), false);
  assert.equal(Logic.stageUnlocked(s, 1, 0), true);
  assert.deepEqual({ ...Logic.nextStage(s) }, { act: 1, stage: 0 });
});

test('an act counts as cleared when its boss stage is cleared', () => {
  const s = Logic.defaultSave();
  assert.equal(Logic.isActCleared(s, 0), false);
  clear(s, 0, 6);
  assert.equal(Logic.isActCleared(s, 0), true);
  assert.equal(Logic.isStageCleared(s, 0, 6), true);
  assert.equal(Logic.isStageCleared(s, 0, 5), false);
});

test('a stage config names the stage foe, the act arena and the New Game+ cycle', () => {
  const s = Logic.defaultSave(); s.ng = 2;
  const cfg = Logic.stageConfig(s, 0, 6);
  assert.deepEqual({ ...cfg }, { mode: 'campaign', act: 0, stage: 6, enemyId: 'noctis', env: 'rooftops', ng: 2 });
});

test('New Game+ needs the campaign beaten, then resets campaign progress only', () => {
  const s = Logic.defaultSave();
  assert.equal(Logic.startNewGamePlus(s), false);
  s.ngUnlocked = true; s.unlockedActs = 3; s.coins = 999; clear(s, 2, 6);
  assert.equal(Logic.startNewGamePlus(s), true);
  assert.equal(s.ng, 1);
  assert.equal(s.unlockedActs, 1);
  assert.deepEqual({ ...s.cleared }, {});
  assert.equal(s.coins, 999);
});
