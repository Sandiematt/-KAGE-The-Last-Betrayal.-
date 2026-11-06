'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic } = loadLogic();
const ids = list => list.map(x => x.id);
const kinds = list => list.map(x => x.kind);
const COMBAT = ['stretch', 'subboss', 'boss', 'spar', 'echo'];
// Completes every stage before `id` in story order (not `id` itself).
const clearUpTo = (s, id) => { for (const st of Logic.stages()) { if (st.id === id) break; Logic.completeStage(s, st.id); } };

/* ---------------- the map ---------------- */

test('the chapters run Prologue, Act I, Interlude, Act II, Act III, The Core, Epilogue', () => {
  assert.deepEqual(ids(Logic.chapters()), ['prologue', 'act1', 'interlude', 'act2', 'act3', 'core', 'epilogue']);
  assert.deepEqual(Logic.chapters().map(c => c.name), ['Prologue', 'Act I', 'Interlude', 'Act II', 'Act III', 'The Core', 'Epilogue']);
});

test('the Prologue is a single stretch', () => {
  assert.deepEqual(ids(Logic.chapter('prologue').stages), ['prologue.1']);
  assert.deepEqual(kinds(Logic.chapter('prologue').stages), ['stretch']);
});

test('each act is four stretches, each followed by its sub-boss, then the main boss', () => {
  const bosses = { act1: 'Raikon', act2: 'Akari', act3: 'Takashi' };
  for (const act of ['act1', 'act2', 'act3']) {
    const st = Logic.chapter(act).stages;
    assert.deepEqual(ids(st), [`${act}.stretch1`, `${act}.sub1`, `${act}.stretch2`, `${act}.sub2`, `${act}.stretch3`, `${act}.sub3`,
      `${act}.stretch4`, `${act}.sub4`, `${act}.boss`]);
    assert.deepEqual(kinds(st), ['stretch', 'subboss', 'stretch', 'subboss', 'stretch', 'subboss', 'stretch', 'subboss', 'boss']);
    assert.equal(st.filter(s => s.kind === 'subboss').length, 4);
    assert.equal(st.filter(s => s.kind === 'boss').length, 1);
    assert.equal(st[8].foe, bosses[act]);
  }
});

test('the Interlude is the Rem spar and sits between Act I and Act II', () => {
  const order = ids(Logic.chapters());
  assert.equal(order.indexOf('interlude'), order.indexOf('act1') + 1);
  assert.equal(order.indexOf('act2'), order.indexOf('interlude') + 1);
  assert.deepEqual(ids(Logic.chapter('interlude').stages), ['interlude.spar']);
  assert.equal(Logic.stage('interlude.spar').kind, 'spar');
  assert.equal(Logic.stage('interlude.spar').foe, 'Rem');
});

test('The Core is one stretch, four echoes (Hollow Rem last), then the Witness', () => {
  const st = Logic.chapter('core').stages;
  assert.deepEqual(ids(st), ['core.stretch1', 'core.echo1', 'core.echo2', 'core.echo3', 'core.echo4', 'core.witness']);
  assert.deepEqual(kinds(st), ['stretch', 'echo', 'echo', 'echo', 'echo', 'boss']);
  assert.deepEqual(st.slice(1).map(s => s.foe), ['Hollow Raikon', 'Hollow Akari', 'Hollow Takashi', 'Hollow Rem', 'The Witness']);
});

test('the Epilogue has no combat stage', () => {
  const st = Logic.chapter('epilogue').stages;
  assert.ok(st.length >= 1);
  for (const s of st) {
    assert.equal(s.kind, 'scene');
    assert.equal(Logic.isCombatStage(s.id), false);
    assert.equal(s.enemy, undefined);
  }
  assert.equal(Logic.stage('epilogue').name, 'The Last Choice');
});

test('every stage has a unique id, a known kind and a chapter; every combat stage names a foe', () => {
  const all = Logic.stages();
  assert.equal(new Set(ids(all)).size, all.length);
  assert.equal(all.length, 1 + 9 + 1 + 9 + 9 + 6 + 1);
  for (const s of all) {
    assert.ok([...COMBAT, 'scene'].includes(s.kind), s.id);
    assert.equal(Logic.chapterOf(s.id).id, s.id.split('.')[0]);
    assert.equal(Logic.isCombatStage(s.id), s.kind !== 'scene');
  }
});

test('the old 21-fight roster is gone', () => {
  const { ENEMIES } = loadLogic();
  for (const old of ['shiro', 'mako', 'gorran', 'sable', 'kairo', 'veyra', 'noctis', 'bao', 'lio', 'tessaro', 'ishe', 'rokan',
    'zephar', 'eryndor', 'vosk', 'grull', 'kessa', 'rhaz', 'brakk', 'drazek', 'malgrath']) assert.equal(ENEMIES[old], undefined, old);
});

/* ---------------- unlock, next, complete, replay ---------------- */

test('a new player can only play the Prologue', () => {
  const s = Logic.defaultSave();
  assert.equal(Logic.isStageUnlocked(s, 'prologue.1'), true);
  assert.equal(Logic.isStageUnlocked(s, 'act1.stretch1'), false);
  assert.equal(Logic.isChapterUnlocked(s, 'act1'), false);
  assert.equal(Logic.nextStage(s), 'prologue.1');
});

test('completing the Prologue unlocks Act I stretch 1 and opens Act I', () => {
  const s = Logic.defaultSave();
  const out = Logic.completeStage(s, 'prologue.1');
  assert.equal(out.firstClear, true);
  assert.equal(out.next, 'act1.stretch1');
  assert.deepEqual(out.unlocks.map(u => ({ ...u })), [{ kind: 'chapter', id: 'act1' }]);
  assert.equal(Logic.isStageComplete(s, 'prologue.1'), true);
  assert.equal(Logic.isChapterComplete(s, 'prologue'), true);
  assert.equal(Logic.isStageUnlocked(s, 'act1.stretch1'), true);
  assert.equal(Logic.isStageUnlocked(s, 'act1.sub1'), false);
  assert.equal(Logic.nextStage(s), 'act1.stretch1');
});

test('a stretch unlocks its own sub-boss next, and the fourth sub-boss unlocks the act boss', () => {
  const s = Logic.defaultSave();
  clearUpTo(s, 'act1.stretch2');
  assert.equal(Logic.isStageUnlocked(s, 'act1.stretch2'), true);
  assert.equal(Logic.isStageUnlocked(s, 'act1.sub2'), false);
  Logic.completeStage(s, 'act1.stretch2');
  assert.equal(Logic.nextStage(s), 'act1.sub2');
  clearUpTo(s, 'act1.boss');
  assert.equal(Logic.isStageUnlocked(s, 'act1.boss'), true);
  assert.equal(Logic.isChapterUnlocked(s, 'interlude'), false);
});

test('beating Raikon opens the Interlude, and the spar opens Act II', () => {
  const s = Logic.defaultSave();
  clearUpTo(s, 'act1.boss');
  assert.deepEqual(Logic.completeStage(s, 'act1.boss').unlocks.filter(u => u.kind === 'chapter').map(u => ({ ...u })), [{ kind: 'chapter', id: 'interlude' }]);
  assert.equal(Logic.nextStage(s), 'interlude.spar');
  Logic.completeStage(s, 'interlude.spar');
  assert.equal(Logic.isChapterUnlocked(s, 'act2'), true);
  assert.equal(Logic.nextStage(s), 'act2.stretch1');
});

test('a stage cannot be completed while it is locked', () => {
  const s = Logic.defaultSave();
  const out = Logic.completeStage(s, 'act2.boss');
  assert.equal(out, null);
  assert.equal(Logic.isStageComplete(s, 'act2.boss'), false);
});

test('a cleared stage stays unlocked for replay, and replaying it is not a first clear and unlocks nothing', () => {
  const s = Logic.defaultSave();
  Logic.completeStage(s, 'prologue.1');
  Logic.completeStage(s, 'act1.stretch1');
  assert.equal(Logic.isStageUnlocked(s, 'prologue.1'), true);
  const again = Logic.completeStage(s, 'prologue.1');
  assert.equal(again.firstClear, false);
  assert.deepEqual(again.unlocks, []);
  assert.equal(Logic.nextStage(s), 'act1.sub1', 'replays do not move the story frontier');
});

test('chapter progress counts cleared stages', () => {
  const s = Logic.defaultSave();
  clearUpTo(s, 'act1.stretch3');
  assert.deepEqual({ ...Logic.chapterProgress(s, 'act1') }, { done: 4, total: 9 });
  assert.deepEqual({ ...Logic.chapterProgress(s, 'core') }, { done: 0, total: 6 });
});

test('the Witness opens the Epilogue; finishing the Epilogue completes the story and unlocks New Game+', () => {
  const s = Logic.defaultSave();
  clearUpTo(s, 'epilogue');
  assert.equal(Logic.nextStage(s), 'epilogue');
  assert.equal(Logic.isCampaignComplete(s), false);
  assert.equal(s.ngUnlocked, false);
  const out = Logic.completeStage(s, 'epilogue');
  assert.ok(out.unlocks.some(u => u.kind === 'ng'));
  assert.equal(out.next, null);
  assert.equal(Logic.isCampaignComplete(s), true);
  assert.equal(Logic.nextStage(s), null);
  assert.equal(s.ngUnlocked, true);
  assert.equal(s.ngCompletions, 1);
  assert.ok(!Logic.completeStage(s, 'epilogue').unlocks.some(u => u.kind === 'ng'), 'New Game+ is announced once');
});

test('a stage config names the foe, the arena, the chapter difficulty and the New Game+ cycle', () => {
  const s = Logic.defaultSave(); s.ng = 2;
  const cfg = Logic.stageConfig(s, 'act1.boss');
  assert.equal(cfg.mode, 'campaign');
  assert.equal(cfg.stageId, 'act1.boss');
  assert.equal(cfg.kind, 'boss');
  assert.equal(cfg.foeName, 'Raikon');
  assert.equal(cfg.ng, 2);
  assert.equal(cfg.diff, 1);
  assert.equal(typeof cfg.enemyId, 'string');
  assert.equal(typeof cfg.env, 'string');
  assert.equal(Logic.stageConfig(s, 'act3.stretch1').diff, 3);
});

test('New Game+ needs the story finished, then resets campaign progress only', () => {
  const s = Logic.defaultSave();
  assert.equal(Logic.startNewGamePlus(s), false);
  for (const st of Logic.stages()) Logic.completeStage(s, st.id);
  s.coins = 999;
  assert.equal(Logic.startNewGamePlus(s), true);
  assert.equal(s.ng, 1);
  assert.equal(Logic.nextStage(s), 'prologue.1');
  assert.equal(Logic.isStageUnlocked(s, 'act1.stretch1'), false);
  assert.equal(Logic.isStageComplete(s, 'core.witness'), false);
  assert.equal(s.coins, 999);
  assert.equal(Logic.defeatedCount(s, 'core.witness'), 1, 'lifetime defeats survive New Game+');
});

test('saves keep clears by stage id and drop clear keys the map does not know', () => {
  const raw = JSON.stringify({ cleared: { 'prologue.1': true, '0-3': true, 'act9.boss': true }, defeated: { 'act1.boss': 2, noctis: 4 }, unlockedActs: 3 });
  const { save } = Logic.loadSave(raw);
  assert.deepEqual({ ...save.cleared }, { 'prologue.1': true });
  assert.deepEqual({ ...save.defeated }, { 'act1.boss': 2 });
  assert.equal(save.unlockedActs, undefined);
  assert.equal(Logic.nextStage(save), 'act1.stretch1');
});
