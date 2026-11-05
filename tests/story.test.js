'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, SCENES } = loadLogic();

/* ---------------- the Prologue video placeholder ---------------- */

test('exactly one video placeholder exists in all scene data: the start of the Prologue', () => {
  const videos = [];
  for (const id in SCENES) SCENES[id].steps.forEach((s, i) => { if ('video' in s) videos.push({ id, i }); });
  assert.equal(videos.length, 1);
  assert.equal(videos[0].id, Logic.stageScene('prologue.1', 'before'));
  assert.equal(videos[0].i, 0);
});

/* ---------------- which scene plays when ---------------- */

test('a stage plays the scene attached to a hook, and nothing for a hook it has no scene on', () => {
  assert.equal(Logic.stageScene('prologue.1', 'before'), 'prologue.open');
  assert.equal(Logic.stageScene('prologue.1', 'after'), 'prologue.close');
  assert.equal(Logic.stageScene('prologue.1', 'defeat'), null);
  assert.equal(Logic.stageScene('prologue.1', 'sometime'), null);
  assert.equal(Logic.stageScene('act1.stretch1', 'before'), 'act1.stretch1.before');
  assert.equal(Logic.stageScene('act2.stretch1', 'before'), null);
  assert.equal(Logic.stageScene('no.such.stage', 'before'), null);
});

test('the Epilogue is a scene stage that plays its scene', () => {
  assert.equal(Logic.isCombatStage('epilogue'), false);
  assert.ok(Logic.scene(Logic.stageScene('epilogue', 'before')));
});

test('a boss defeat, a stage end and a clue pickup can each carry a scene', () => {
  const { Logic: L, CAMPAIGN, SCENES: S } = loadLogic();
  S['test.beat'] = { steps: [{ say: 'kage', text: 'Down.' }] };
  const boss = CAMPAIGN.chapters.find(c => c.id === 'act1').stages.find(s => s.id === 'act1.boss');
  boss.scenes = { defeat: 'test.beat', after: 'test.beat' };
  const stretch = CAMPAIGN.chapters.find(c => c.id === 'act1').stages.find(s => s.id === 'act1.stretch1');
  stretch.stretch = Object.assign({}, stretch.stretch, { clues: [{ id: 'clue1', x: 100, label: 'A page', scene: 'test.beat' }, { id: 'clue2', x: 200, label: 'Ash' }] });
  assert.equal(L.stageScene('act1.boss', 'defeat'), 'test.beat');
  assert.equal(L.stageScene('act1.boss', 'after'), 'test.beat');
  assert.equal(L.clueScene('act1.stretch1', 'clue1'), 'test.beat');
  assert.equal(L.clueScene('act1.stretch1', 'clue2'), null);
  assert.equal(L.clueScene('act1.boss', 'clue1'), null);
});

test('a hook naming a scene that does not exist plays nothing', () => {
  const { Logic: L, CAMPAIGN } = loadLogic();
  CAMPAIGN.chapters.find(c => c.id === 'act1').stages[0].scenes = { before: 'missing.scene' };
  assert.equal(L.stageScene('act1.stretch1', 'before'), null);
});

/* ---------------- seen scenes and story flags ---------------- */

test('played scenes and story flags are saved, survive a reload and New Game+', () => {
  const save = Logic.defaultSave();
  assert.equal(Logic.isSceneSeen(save, 'prologue.open'), false);
  assert.equal(Logic.markSceneSeen(save, 'prologue.open'), true);
  assert.equal(Logic.markSceneSeen(save, 'no.such.scene'), false);
  assert.equal(Logic.setStoryFlag(save, 'prologue.photo_found'), true);
  const back = Logic.loadSave(JSON.stringify(save)).save;
  assert.equal(Logic.isSceneSeen(back, 'prologue.open'), true);
  assert.equal(Logic.storyFlag(back, 'prologue.photo_found'), true);
  assert.equal(Logic.storyFlag(back, 'something.else'), false);
  back.ngUnlocked = true;
  Logic.startNewGamePlus(back);
  assert.equal(Logic.isSceneSeen(back, 'prologue.open'), true);
});

test('a reload drops seen scenes the game no longer has and keeps only true flags', () => {
  const raw = JSON.stringify(Object.assign(Logic.defaultSave(), { seenScenes: { 'prologue.open': true, 'old.scene': true }, storyFlags: { a: true, b: 'yes', c: false } }));
  const s = Logic.loadSave(raw).save;
  assert.deepEqual(s.seenScenes, { 'prologue.open': true });
  assert.deepEqual(s.storyFlags, { a: true });
});

test('every scene step is one of the known kinds', () => {
  for (const id in SCENES) for (const s of SCENES[id].steps) {
    const kinds = ['say', 'illus', 'video', 'wait', 'flag'].filter(k => k in s);
    assert.equal(kinds.length, 1, `${id}: ${JSON.stringify(s)}`);
    if ('say' in s) assert.ok(typeof s.text === 'string' && s.text.length > 0, `${id}: a line needs text`);
  }
});

/* ---------------- speakers and illustrations ---------------- */

// The story art module is self-contained: load it on its own and run its painters against a recording context.
const { moduleSource } = require('./helpers/load-logic');
const ART = new Function(`'use strict';\n${moduleSource('52-story-art.js')}\nreturn { SPEAKERS, ILLUSTRATIONS };`)();
function recordingContext() {
  const calls = [];
  const g = new Proxy({}, {
    get(t, k) { if (k in t) return t[k]; return (...a) => { calls.push(k); return { addColorStop() {} }; }; },
    set(t, k, v) { t[k] = v; return true; }
  });
  return { g, calls };
}

test('the cast has a portrait for every speaker the story needs', () => {
  for (const id of ['kage', 'rem', 'takashi', 'raikon', 'akari', 'witness', 'narrator', 'recording']) {
    assert.ok(ART.SPEAKERS[id], `missing speaker ${id}`);
    const { g, calls } = recordingContext();
    ART.SPEAKERS[id].portrait(g);
    assert.ok(calls.includes('fill'), `${id} portrait draws nothing`);
  }
  assert.equal(ART.SPEAKERS.kage.name, 'Kage');
  assert.equal(ART.SPEAKERS.witness.name, 'The Witness');
});

test('the shared illustrations exist and draw', () => {
  for (const id of ['hoshimura_ruins', 'photograph', 'memory_ash', 'memory']) {
    assert.ok(ART.ILLUSTRATIONS[id], `missing illustration ${id}`);
    const { g, calls } = recordingContext();
    ART.ILLUSTRATIONS[id].paint(g);
    assert.ok(calls.length > 10, `${id} draws nothing`);
  }
});

test('every scene names only speakers and illustrations that exist', () => {
  for (const id in SCENES) for (const s of SCENES[id].steps) {
    if ('say' in s) assert.ok(ART.SPEAKERS[s.say], `${id}: unknown speaker ${s.say}`);
    if ('illus' in s && s.illus !== null) assert.ok(ART.ILLUSTRATIONS[s.illus], `${id}: unknown illustration ${s.illus}`);
  }
});

test('the Prologue opening shows the ruins and Kage speaks after the video card; the photograph waits as a clue', () => {
  const steps = Logic.scene('prologue.open').steps;
  assert.ok(steps.some(s => s.illus === 'hoshimura_ruins'));
  assert.ok(steps.slice(1).some(s => s.say === 'kage'));
  assert.ok(!steps.some(s => s.illus === 'photograph'));
  assert.ok(Logic.scene(Logic.clueScene('prologue.1', 'photograph')).steps.some(s => s.illus === 'photograph'));
});
