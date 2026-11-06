'use strict';
// The story boss format (one round, one health bar, three phases, a defeat outcome read from the boss's data)
// and Raikon, the Act I boss. Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic } = loadLogic();
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
const win = (stageId) => ({ mode: 'campaign', stageId, win: true, ng: 0, hpLeft: 0.5, time: 70, maxCombo: 4, parries: 0, flawless: false });

/* ---------------- Raikon ---------------- */

test('Raikon, the Lightning Ascendant, is the foe of the Act I boss stage', () => {
  const cfg = Logic.stageConfig(Logic.defaultSave(), 'act1.boss');
  assert.equal(cfg.enemyId, 'raikon');
  assert.equal(cfg.foeName, 'Raikon');
  assert.equal(cfg.foeTitle, 'the Lightning Ascendant');
});

test('Raikon fights in three phases that open at two-thirds and one-third health', () => {
  const phases = Logic.bossPhases('raikon');
  assert.equal(phases.length, 3);
  assert.deepEqual(phases.map(p => p.at), [1, 0.66, 0.33]);
  assert.equal(Logic.bossPhaseAt('raikon', 1), 0);
  assert.equal(Logic.bossPhaseAt('raikon', 0.67), 0);
  assert.equal(Logic.bossPhaseAt('raikon', 0.6), 1);
  assert.equal(Logic.bossPhaseAt('raikon', 0.2), 2);
  assert.equal(Logic.bossPhaseAt('raikon', 0), 2);
});

test('Raikon swings Thunder Swing and Storm Break from the start, adds Redline Counter, and chains a delayed second wave in phase 3', () => {
  const [p1, p2, p3] = Logic.bossPhases('raikon');
  for (const a of ['thunderSwing', 'stormBreak']) assert.ok(p1.abilities.includes(a), `phase 1 ${a}`);
  assert.ok(!p1.abilities.includes('redlineCounter'));
  for (const a of ['thunderSwing', 'stormBreak', 'redlineCounter']) { assert.ok(p2.abilities.includes(a), `phase 2 ${a}`); assert.ok(p3.abilities.includes(a), `phase 3 ${a}`); }
  assert.ok(!p1.secondWave && !p2.secondWave);
  assert.ok(p3.secondWave > 0, 'phase 3 Thunder Swing sends a delayed second wave');
});

test('Raikon is armoured: light hits do not make him flinch, and he cannot be thrown', () => {
  const { ENEMIES } = loadLogic();
  assert.equal(ENEMIES.raikon.heavyArmor, 1);
  assert.equal(ENEMIES.raikon.noGrab, 1);
});

/* ---------------- the boss format ---------------- */

test('story boss stages are one round with one health bar, three phases and no round clock', () => {
  for (const id of ['act1.boss', 'act2.boss', 'act3.boss', 'core.witness']) {
    const f = Logic.stageConfig(Logic.defaultSave(), id).format;
    assert.equal(f.name, 'boss', id);
    assert.equal(f.roundsToWin, 1, id);
    assert.equal(f.timer, 0, `${id} has no timer, so no time-out loss`);
    assert.equal(f.phases, 3, id);
  }
});

test('other arena fights keep their rounds and timers', () => {
  const sub = Logic.fightFormat({ mode: 'campaign', enemyId: 'order_footman' });   // an arena fight outside the boss format
  assert.equal(sub.name, 'duel'); assert.equal(sub.roundsToWin, 2); assert.equal(sub.timer, 75);
  const surv = Logic.fightFormat({ mode: 'trials', enemyId: 'order_footman' });
  assert.equal(surv.name, 'trials'); assert.equal(surv.roundsToWin, 1); assert.equal(surv.timer, 90);
  assert.equal(Logic.stageConfig(Logic.defaultSave(), 'act1.stretch1').format.name, 'stretch');
});

test('how a boss is defeated is read from its data', () => {
  assert.deepEqual([...Logic.BOSS_DEFEATS], ['finisher', 'escape', 'reabsorb']);
  assert.equal(Logic.bossDefeat('raikon'), 'finisher');
  assert.equal(Logic.stageConfig(Logic.defaultSave(), 'act1.boss').format.defeat, 'finisher');
  const { Logic: L, ENEMIES } = loadLogic();
  ENEMIES.raikon.defeat = 'escape';
  assert.equal(L.bossDefeat('raikon'), 'escape');
  ENEMIES.raikon.defeat = 'reabsorb';
  assert.equal(L.bossDefeat('raikon'), 'reabsorb');
  ENEMIES.raikon.defeat = 'something else';
  assert.equal(L.bossDefeat('raikon'), 'finisher', 'an unknown outcome falls back to the finisher');
  assert.equal(L.bossDefeat('order_footman'), null, 'regular foes have no boss outcome');
});

test('beating Raikon records him as killed; an escaping boss is recorded as escaped', () => {
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'act1.boss');
  assert.equal(Logic.bossFate(s, 'act1.boss'), null);
  Logic.applyFightResult(s, win('act1.boss'));
  assert.equal(Logic.bossFate(s, 'act1.boss'), 'killed');
  const { Logic: L, ENEMIES } = loadLogic();
  ENEMIES.raikon.defeat = 'escape';
  const e = L.defaultSave(); clearUpTo(L, e, 'act1.boss');
  assert.equal(L.completeStage(e, 'act1.boss').fate, 'escaped');
  assert.equal(L.bossFate(e, 'act1.boss'), 'escaped');
});

test('a lost boss fight records no fate, and a recorded fate survives saving and loading', () => {
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'act1.boss');
  Logic.applyFightResult(s, Object.assign(win('act1.boss'), { win: false }));
  assert.equal(Logic.bossFate(s, 'act1.boss'), null);
  Logic.applyFightResult(s, win('act1.boss'));
  const back = Logic.loadSave(JSON.stringify(s)).save;
  assert.equal(Logic.bossFate(back, 'act1.boss'), 'killed');
  assert.equal(Logic.bossFate(Logic.loadSave(JSON.stringify({ bossFates: { 'act1.boss': 'eaten', 'no.stage': 'killed' } })).save, 'act1.boss'), null);
});

/* ---------------- rewards and story ---------------- */

test('clearing Raikon\'s stage grants Raijin Kabuto and Raikō no Tachi exactly once', () => {
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'act1.boss');
  assert.equal(Logic.isLocked(s, 'weapons', 'raiko_no_tachi'), true);
  assert.equal(Logic.isLocked(s, 'helmets', 'raijin_kabuto'), true);
  const out = Logic.applyFightResult(s, win('act1.boss'));
  assert.deepEqual(out.unlocks.filter(u => u.kind !== 'chapter').map(u => ({ ...u })),
    [{ kind: 'weapons', id: 'raiko_no_tachi' }, { kind: 'helmets', id: 'raijin_kabuto' }]);
  assert.equal(s.owned.weapons.raiko_no_tachi, 1);
  assert.equal(s.owned.helmets.raijin_kabuto, 1);
  const again = Logic.applyFightResult(s, win('act1.boss'));
  assert.deepEqual(again.unlocks, [], 'a replay grants nothing');
  assert.equal(s.owned.weapons.raiko_no_tachi, 1);
});

test('Raikō no Tachi\'s rage art is Thunder Swing', () => {
  const { WEAPONS } = loadLogic();
  assert.equal(WEAPONS.raiko_no_tachi.special, 'thunderSwing');
});

test('Raikon has a before scene and a defeat scene; the defeat scene hands over the damaged access token', () => {
  const { SCENES } = loadLogic();
  const before = Logic.stageScene('act1.boss', 'before'), defeat = Logic.stageScene('act1.boss', 'defeat');
  assert.ok(before && defeat);
  assert.ok(SCENES[before].steps.some(s => s.say === 'raikon' && /supposed to stay buried/.test(s.text)));
  assert.ok(SCENES[defeat].steps.some(s => s.flag === 'act1.access_token'));
  const said = SCENES[defeat].steps.filter(s => s.say === 'raikon').map(s => s.text).join(' ');
  for (const w of [/Rem/, /Core/, /memor/i]) assert.match(said, w);
});
