// Boss Rush (SAN-37): every boss of the story in story order, each available once beaten in the story; a run fights
// the available ones back to back with health carried over (partly restored) and keeps a best record.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic } = loadLogic();
const fresh = () => Logic.defaultSave();
const beaten = (...ids) => { const s = fresh(); for (const id of ids) s.defeated[id] = 1; return s; };

test('a fresh save lists every boss, all locked, and has no run to start', () => {
  const r = Logic.bossRushRoster(fresh());
  assert.equal(r.length, 20);
  assert.ok(r.every(b => b.available === false));
  assert.equal(Logic.bossRushRun(fresh()), null);
});

test('the roster is the 12 sub-bosses, Raikon, Akari, Takashi, the 4 Core echoes and the Witness, in story order', () => {
  const roster = Logic.bossRushRoster(fresh());
  assert.deepEqual(roster.map(b => b.stageId), [
    'act1.sub1', 'act1.sub2', 'act1.sub3', 'act1.sub4', 'act1.boss',
    'act2.sub1', 'act2.sub2', 'act2.sub3', 'act2.sub4', 'act2.boss',
    'act3.sub1', 'act3.sub2', 'act3.sub3', 'act3.sub4', 'act3.boss',
    'core.echo1', 'core.echo2', 'core.echo3', 'core.echo4', 'core.witness']);
  const names = roster.map(b => b.name);
  for (const n of ['Raikon', 'Akari', 'Takashi', 'Hollow Raikon', 'Hollow Akari', 'Hollow Takashi', 'Hollow Rem', 'The Witness'])
    assert.ok(names.includes(n), n);
  for (const b of roster) assert.ok(b.enemyId && b.name && b.title, b.stageId);
});

test('a boss becomes available only once beaten in the story, and a run takes the available ones in story order', () => {
  const s = beaten('act2.boss', 'act1.sub2', 'act1.boss');
  assert.deepEqual(Logic.bossRushRoster(s).filter(b => b.available).map(b => b.stageId), ['act1.sub2', 'act1.boss', 'act2.boss']);
  // winning the stage in the story is what records the defeat, and it is kept in the saved data
  const p = fresh();
  for (const st of Logic.stages()) { if (st.id === 'act1.sub1') break; Logic.completeStage(p, st.id); }
  assert.equal(Logic.bossRushRoster(p)[0].available, false);
  Logic.completeStage(p, 'act1.sub1');
  assert.equal(Logic.bossRushRoster(Logic.normalizeSave(JSON.parse(JSON.stringify(p))))[0].available, true);
  const run = Logic.bossRushRun(s);
  assert.deepEqual(run.stages, ['act1.sub2', 'act1.boss', 'act2.boss']);
  assert.equal(run.index, 0); assert.equal(run.beaten, 0); assert.equal(run.time, 0); assert.equal(run.done, false); assert.equal(run.hp, null);
  // a start point skips the bosses before it
  assert.deepEqual(Logic.bossRushRun(s, 'act1.boss').stages, ['act1.boss', 'act2.boss']);
});

test('Echo Trials boss echoes are the available part of the roster', () => {
  const s = beaten('act3.sub1', 'core.echo2', 'act1.boss');
  assert.deepEqual(Logic.echoTrialBosses(s).map(b => b.stageId), ['act1.boss', 'act3.sub1', 'core.echo2']);
  assert.deepEqual(Logic.echoTrialBosses(s)[0], { stageId: 'act1.boss', enemyId: Logic.stage('act1.boss').enemy, name: 'Raikon', kind: 'boss' });
});

test('every rush fight is the story boss format in its own arena: one bar, no clock, phases, no reabsorb', () => {
  const s = beaten(...Logic.bossRushRoster(fresh()).map(b => b.stageId));
  for (const b of Logic.bossRushRoster(s)) {
    const cfg = Logic.bossRushConfig(s, b.stageId);
    assert.equal(cfg.mode, 'bossrush');
    assert.equal(cfg.stageId, b.stageId);
    assert.equal(cfg.format.name, 'boss'); assert.equal(cfg.format.roundsToWin, 1); assert.equal(cfg.format.timer, 0);
    assert.ok(cfg.format.phases >= 1);
    assert.equal(cfg.env, Logic.stageConfig(s, b.stageId).env);
    assert.equal(cfg.format.defeat, 'finisher', b.stageId);
  }
  assert.equal(Logic.bossRushConfig(s, 'act1.boss').format.phases, 3);
});

test('health carries over between fights with +30% of max health restored, capped at max', () => {
  assert.equal(Logic.BOSS_RUSH.heal, 0.3);
  assert.equal(Logic.bossRushCarryHp(100, 400), 220);
  assert.equal(Logic.bossRushCarryHp(350, 400), 400);
  assert.equal(Logic.bossRushCarryHp(0, 400), 120);
});

test('advancing a run: a win moves on with carried health, a loss or the last boss ends it', () => {
  const s = beaten('act1.sub1', 'act1.sub2', 'act1.sub3');
  let run = Logic.bossRushRun(s);
  run = Logic.bossRushAdvance(run, { win: true, time: 40, hp: 100, maxHp: 400 });
  assert.equal(run.index, 1); assert.equal(run.beaten, 1); assert.equal(run.time, 40); assert.equal(run.hp, 220); assert.equal(run.done, false);
  run = Logic.bossRushAdvance(run, { win: true, time: 30.5, hp: 390, maxHp: 400 });
  assert.equal(run.hp, 400); assert.equal(run.beaten, 2);
  const lost = Logic.bossRushAdvance(run, { win: false, time: 10, hp: 0, maxHp: 400 });
  assert.equal(lost.done, true); assert.equal(lost.beaten, 2); assert.equal(lost.cleared, false); assert.equal(lost.time, 80.5);
  const won = Logic.bossRushAdvance(run, { win: true, time: 10, hp: 50, maxHp: 400 });
  assert.equal(won.done, true); assert.equal(won.beaten, 3); assert.equal(won.cleared, true);
});

test('the best record: more bosses beaten wins, then a faster time; it survives a save reload', () => {
  const s = beaten('act1.sub1', 'act1.sub2');
  assert.deepEqual(s.bossRushBest, { bosses: 0, time: 0 });
  const end = (n, time) => ({ stages: ['act1.sub1', 'act1.sub2'], index: n, beaten: n, time, hp: 100, done: true, cleared: n === 2 });
  let out = Logic.applyBossRushResult(s, end(1, 50));
  assert.equal(out.newBest, true); assert.deepEqual(s.bossRushBest, { bosses: 1, time: 50 });
  out = Logic.applyBossRushResult(s, end(1, 60));
  assert.equal(out.newBest, false); assert.deepEqual(s.bossRushBest, { bosses: 1, time: 50 });
  out = Logic.applyBossRushResult(s, end(1, 45));
  assert.equal(out.newBest, true); assert.equal(s.bossRushBest.time, 45);
  out = Logic.applyBossRushResult(s, end(2, 200));
  assert.equal(out.newBest, true); assert.deepEqual(s.bossRushBest, { bosses: 2, time: 200 });
  // a run that beat nobody is never a record
  assert.equal(Logic.applyBossRushResult(fresh(), end(0, 5)).newBest, false);
  assert.deepEqual(Logic.normalizeSave(JSON.parse(JSON.stringify(s))).bossRushBest, { bosses: 2, time: 200 });
  assert.deepEqual(Logic.normalizeSave({ bossRushBest: 'junk' }).bossRushBest, { bosses: 0, time: 0 });
  assert.deepEqual(Logic.normalizeSave({ bossRushBest: { bosses: -3, time: 'x' } }).bossRushBest, { bosses: 0, time: 0 });
});

test('a run pays a modest coin purse per boss and never touches story progress, rewards or fates', () => {
  const s = beaten('act1.sub1', 'act1.boss', 'act3.boss');
  s.cleared = { 'prologue.1': true }; s.bossFates = { 'act1.boss': 'killed', 'act3.boss': 'escaped' }; s.storyFlags = { met: true };
  const before = JSON.parse(JSON.stringify(s));
  let run = Logic.bossRushRun(s);
  for (const id of run.stages) { Logic.bossRushConfig(s, id); run = Logic.bossRushAdvance(run, { win: true, time: 20, hp: 300, maxHp: 400 }); }
  const out = Logic.applyBossRushResult(s, run);
  assert.equal(Logic.BOSS_RUSH.coins, 30);
  assert.equal(out.coins, 90);
  assert.equal(out.gems, 0);
  assert.equal(s.coins, before.coins + 90);
  for (const k of ['cleared', 'defeated', 'bossFates', 'storyFlags', 'seenScenes', 'owned', 'equipped', 'gems', 'xp', 'level', 'ng', 'stats', 'seenRewards', 'trialsBest'])
    assert.deepEqual(s[k], before[k], k);
});
