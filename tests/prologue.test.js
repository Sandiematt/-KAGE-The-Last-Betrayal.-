'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, ENEMIES, SCENES } = loadLogic();
const P = 'prologue.1';

/* ---------------- the Prologue level: The Empty Village ---------------- */

test('the Prologue has exactly three clues, each with its own scene', () => {
  const s = Logic.stretch(P);
  assert.equal(s.clues.length, 3);
  const scenes = s.clues.map(c => Logic.clueScene(P, c.id));
  for (const id of scenes) assert.ok(Logic.scene(id), `clue scene ${id}`);
  assert.equal(new Set(scenes).size, 3);
});

test('the clues are the broken recording, the photograph and the second message, in that order along the road', () => {
  const s = Logic.stretch(P);
  const [rec, photo, msg] = s.clues;
  assert.ok(rec.x < photo.x && photo.x < msg.x);
  const lines = id => SCENES[Logic.clueScene(P, id)].steps;
  assert.ok(lines(rec.id).some(st => st.say === 'recording' && /Find the Witness/.test(st.text)));
  assert.ok(lines(photo.id).some(st => st.illus === 'photograph'));
  assert.ok(lines(msg.id).some(st => /If you remember everything, he will find you\./.test(st.text || '')));
});

test('the Prologue has a single encounter: one Hollow that mimics Kage before it attacks', () => {
  const s = Logic.stretch(P);
  assert.equal(s.encounters.length, 1);
  const [enc] = s.encounters;
  assert.deepEqual(enc.waves, [['hollow_tutorial']]);
  assert.equal(ENEMIES.hollow_tutorial.family, 'hollow');
  assert.ok(enc.mimicIntro >= 1 && enc.mimicIntro <= 3, `mimicIntro ${enc.mimicIntro}`);
});

test('the Prologue\'s Hollow is a gentle tutorial Shade: same look, far less damage and some less health, on every mode', () => {
  const t = ENEMIES.hollow_tutorial, shade = ENEMIES.hollow_shade;
  assert.equal(t.tutorial, true);
  for (const k of ['name', 'family', 'unit', 'ai', 'weapon', 'helmet', 'armor']) assert.equal(t[k], shade[k], k);
  const cfg = Logic.stageConfig(Logic.defaultSave(), P);
  for (const mode of Logic.DIFFICULTY_IDS) {
    const s = Logic.defaultSave(); Logic.setDifficulty(s, mode);
    const tut = Logic.enemyStats(s, cfg, 'hollow_tutorial'), normalShade = Logic.enemyStats(Logic.defaultSave(), cfg, 'hollow_shade');
    assert.ok(tut.dmgMul <= 0.5, `${mode}: damage x${tut.dmgMul}`);
    assert.ok(tut.dmgMul < normalShade.dmgMul * 0.6, `${mode}: well under a Normal Shade's damage`);
    assert.ok(tut.hp < normalShade.hp, `${mode}: less health than a Normal Shade (${tut.hp})`);
  }
  for (const st of Logic.stages()) if (st.id !== P && st.kind === 'stretch')
    assert.ok(!Logic.stretch(st.id).encounters.some(e => e.waves.flat().includes('hollow_tutorial')), `${st.id} must not use the tutorial Hollow`);
});

test('the Prologue opens on the one video card and closes with the memory-ash scene', () => {
  const open = SCENES[Logic.stageScene(P, 'before')];
  assert.ok('video' in open.steps[0]);
  const close = SCENES[Logic.stageScene(P, 'after')];
  assert.ok(close.steps.some(st => st.illus === 'memory_ash'));
});

test('the video card is still the only one in all scene data', () => {
  let n = 0;
  for (const id in SCENES) for (const st of SCENES[id].steps) if ('video' in st) n++;
  assert.equal(n, 1);
});

test('completing the Prologue unlocks Act I\'s first stretch, and that survives a save round trip', () => {
  const s = Logic.defaultSave();
  assert.equal(Logic.isStageUnlocked(s, 'act1.stretch1'), false);
  Logic.applyFightResult(s, { mode: 'campaign', win: true, stageId: P, ng: 0, time: 90, hpLeft: 0.9, flawless: false, maxCombo: 3, parries: 0 });
  const back = Logic.loadSave(JSON.stringify(s)).save;
  assert.equal(Logic.isStageUnlocked(back, 'act1.stretch1'), true);
  assert.equal(Logic.nextStage(back), 'act1.stretch1');
});

/* ---------------- tutorial prompts ---------------- */

test('the Prologue teaches move, jump, slash, block and dodge, in that order', () => {
  assert.deepEqual(Logic.stretch(P).tutorial.map(t => t.step), ['move', 'jump', 'slash', 'block', 'dodge']);
});

const LEVEL = { length: 3000, encounters: [], clues: [], tutorial: [{ step: 'move', at: 0 }, { step: 'jump', at: 500 }, { step: 'slash', at: 900 }] };

test('a prompt shows once Kage reaches it and every earlier prompt is cleared', () => {
  assert.equal(Logic.tutorialPrompt(LEVEL, 0, 160).step, 'move');
  assert.equal(Logic.tutorialPrompt(LEVEL, 1, 300), null);          // jump waits for its spot on the road
  assert.equal(Logic.tutorialPrompt(LEVEL, 1, 520).step, 'jump');
  assert.equal(Logic.tutorialPrompt(LEVEL, 1, 2000).step, 'jump');   // walking past it does not skip it
  assert.equal(Logic.tutorialPrompt(LEVEL, 3, 2000), null);          // all done
  assert.equal(Logic.tutorialPrompt({ length: 100, encounters: [], clues: [] }, 0, 50), null);   // a stretch without a tutorial
});

test('a prompt clears only when Kage performs its action while it shows', () => {
  assert.equal(Logic.advanceTutorial(LEVEL, 0, 160, ['jump']), 0);
  assert.equal(Logic.advanceTutorial(LEVEL, 0, 160, ['move']), 1);
  assert.equal(Logic.advanceTutorial(LEVEL, 1, 300, ['jump']), 1);   // not shown yet
  assert.equal(Logic.advanceTutorial(LEVEL, 1, 600, ['jump', 'slash']), 2);   // one prompt per press
  assert.equal(Logic.advanceTutorial(LEVEL, 2, 950, ['slash']), 3);
  assert.equal(Logic.advanceTutorial(LEVEL, 3, 950, ['slash']), 3);
});

test('prompt labels match the input device in use', () => {
  assert.deepEqual(Logic.tutorialLabel('jump', 'keyboard').keys, ['W', 'Space']);
  assert.deepEqual(Logic.tutorialLabel('jump', 'touch').keys, ['Jump']);
  assert.deepEqual(Logic.tutorialLabel('jump', 'pad').keys, ['A']);
  assert.deepEqual(Logic.tutorialLabel('slash', 'keyboard').keys, ['U']);
  assert.deepEqual(Logic.tutorialLabel('slash', 'touch').keys, ['Strike']);
  assert.deepEqual(Logic.tutorialLabel('slash', 'pad').keys, ['RB']);
  assert.deepEqual(Logic.tutorialLabel('block', 'keyboard').keys, ['S']);
  assert.deepEqual(Logic.tutorialLabel('block', 'touch').keys, ['Guard']);
  assert.deepEqual(Logic.tutorialLabel('block', 'pad').keys, ['LT']);
  assert.deepEqual(Logic.tutorialLabel('dodge', 'keyboard').keys, ['L', 'Shift']);
  assert.deepEqual(Logic.tutorialLabel('dodge', 'touch').keys, ['Dash']);
  assert.deepEqual(Logic.tutorialLabel('dodge', 'pad').keys, ['B']);
  assert.deepEqual(Logic.tutorialLabel('move', 'keyboard').keys, ['A', 'D']);
  assert.deepEqual(Logic.tutorialLabel('move', 'touch').keys, ['Stick']);
  assert.deepEqual(Logic.tutorialLabel('move', 'pad').keys, ['Left stick']);
  assert.equal(Logic.tutorialLabel('slash', 'keyboard').verb, 'Slash');
  assert.deepEqual(Logic.tutorialLabel('jump', 'smoke-signals').keys, ['W', 'Space']);   // unknown device: keyboard
  assert.equal(Logic.tutorialLabel('nope', 'keyboard'), null);
});
