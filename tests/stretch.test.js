'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, ENEMIES } = loadLogic();

/* ---------------- stretch data ---------------- */

test('every stretch stage is a wide level with encounters of Order soldiers and Hollows; placeholders have two and a clue', () => {
  const stretches = Logic.stages().filter(s => s.kind === 'stretch');
  assert.equal(stretches.length, 14);
  for (const st of stretches) {
    const s = Logic.stretch(st.id);
    assert.ok(s.length >= 3 * 1280 && s.length <= 5 * 1280, `${st.id} length ${s.length}`);
    const authored = st.id === 'prologue.1' || st.chapter === 'act1';   // the story updates replace the placeholders one by one
    if (!authored) assert.equal(s.encounters.length, 2);
    for (const e of s.encounters) {
      assert.ok(e.waves.length >= 1 && e.waves.length <= 3);
      for (const wave of e.waves) for (const id of wave) assert.ok(['order', 'hollow'].includes(ENEMIES[id].family), id);
      assert.ok(e.x > 0 && e.gate > e.x && e.gate < s.length);
    }
    if (!authored) assert.equal(s.clues.length, 1);
    if (st.id === 'prologue.1') { assert.equal(s.encounters.length, 1); assert.equal(s.clues.length, 3); }
  }
});

/* ---------------- encounters, the gate and the end ---------------- */

const LEVEL = { length: 4000, encounters: [{ x: 1000, gate: 1600, waves: [['hollow_shade']] }, { x: 2500, gate: 3100, waves: [['hollow_shade']] }], clues: [] };

test('crossing a trigger starts the next uncleared encounter, and only that one', () => {
  assert.equal(Logic.encounterAt(LEVEL, 0, 999), -1);
  assert.equal(Logic.encounterAt(LEVEL, 0, 1000), 0);
  assert.equal(Logic.encounterAt(LEVEL, 0, 2600), 0);   // the first is still owed even if Kage got past its trigger
  assert.equal(Logic.encounterAt(LEVEL, 1, 1200), -1);
  assert.equal(Logic.encounterAt(LEVEL, 1, 2500), 1);
  assert.equal(Logic.encounterAt(LEVEL, 2, 3900), -1);
});

test('a gate blocks the way until its encounter is cleared, then the next gate does', () => {
  assert.equal(Logic.stretchLimit(LEVEL, 0), 1600);
  assert.equal(Logic.stretchLimit(LEVEL, 1), 3100);
  assert.equal(Logic.stretchLimit(LEVEL, 2), 4000);
});

test('the stretch completes only at the end with every encounter cleared', () => {
  assert.equal(Logic.isStretchComplete(LEVEL, 2, 3990), true);
  assert.equal(Logic.isStretchComplete(LEVEL, 2, 3000), false);
  assert.equal(Logic.isStretchComplete(LEVEL, 1, 3990), false);
});

test('a stretch stage hands its level to the fight session; arena stages do not get one', () => {
  const s = Logic.defaultSave();
  const cfg = Logic.stageConfig(s, 'prologue.1');
  assert.equal(cfg.kind, 'stretch');
  assert.equal(cfg.stretch.encounters.length, 1);
  assert.equal(cfg.env, 'hoshimura');
  assert.equal(cfg.foeName, 'The Empty Village');
  assert.equal(Logic.stageConfig(s, 'act1.sub1').stretch, undefined);
  assert.equal(Logic.stretch('act1.sub1'), null);
});

test('winning a stretch completes it and unlocks the next stage', () => {
  const s = Logic.defaultSave();
  assert.equal(Logic.isStageUnlocked(s, 'act1.stretch1'), false);
  const out = Logic.applyFightResult(s, { mode: 'campaign', win: true, stageId: 'prologue.1', ng: 0, time: 120, hpLeft: 0.7, flawless: false, maxCombo: 6, parries: 1 });
  assert.equal(out.firstClear, true);
  assert.equal(Logic.isStageComplete(s, 'prologue.1'), true);
  assert.equal(Logic.isStageUnlocked(s, 'act1.stretch1'), true);
  assert.deepEqual(out.unlocks, [{ kind: 'chapter', id: 'act1' }]);
});

/* ---------------- clues ---------------- */

test('a clue is recorded once, and only clues the stage has', () => {
  const s = Logic.defaultSave();
  assert.deepEqual(Logic.cluesFound(s, 'prologue.1'), []);
  assert.equal(Logic.collectClue(s, 'prologue.1', 'recording'), true);
  assert.equal(Logic.collectClue(s, 'prologue.1', 'recording'), false);
  assert.equal(Logic.collectClue(s, 'prologue.1', 'nope'), false);
  assert.equal(Logic.collectClue(s, 'act1.sub1', 'clue1'), false);
  assert.deepEqual(Logic.cluesFound(s, 'prologue.1'), ['recording']);
  assert.deepEqual(Logic.cluesFound(s, 'act1.stretch1'), []);
});

test('found clues survive saving and loading, and through New Game+', () => {
  const s = Logic.defaultSave();
  Logic.collectClue(s, 'prologue.1', 'recording');
  const back = Logic.loadSave(JSON.stringify(s)).save;
  assert.deepEqual(Logic.cluesFound(back, 'prologue.1'), ['recording']);
  back.ngUnlocked = true; Logic.startNewGamePlus(back);
  assert.deepEqual(Logic.cluesFound(back, 'prologue.1'), ['recording']);
});

test('clues for unknown stages or clues are dropped when a save loads', () => {
  const raw = JSON.stringify(Object.assign(Logic.defaultSave(), { clues: { 'prologue.1': { recording: true, ghost: true }, 'old.stage': { clue1: true } } }));
  const s = Logic.loadSave(raw).save;
  assert.deepEqual(s.clues, { 'prologue.1': { recording: true } });
});

test('a new save has found no clues', () => {
  assert.deepEqual(Logic.defaultSave().clues, {});
});
