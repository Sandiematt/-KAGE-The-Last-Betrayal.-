// Echo Trials (replaces Survival): endless Hollow waves in a shifting memory arena. Wave contents come from
// Logic.echoTrialWave(save, n, rand); a boss echo every 5th wave, drawn only from bosses beaten in the story.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, ENEMIES, TRIALS } = loadLogic();
const fresh = () => Logic.defaultSave();
const seq = (...xs) => { let i = 0; return () => xs[i++ % xs.length]; };
const lo = () => 0, hi = () => 0.999;
const beaten = (...ids) => { const s = fresh(); for (const id of ids) s.defeated[id] = 1; return s; };

test('waves send only Hollows, and the first wave is one light Hollow', () => {
  const w = Logic.echoTrialWave(fresh(), 1, hi);
  assert.equal(w.foes.length, 1);
  assert.ok(['hollow_shade', 'hollow_flicker'].includes(w.foes[0]), w.foes[0]);
  for (let n = 1; n <= 40; n++) for (const r of [lo, hi, Math.random]) {
    const wv = Logic.echoTrialWave(fresh(), n, r);
    for (const id of wv.foes) { assert.ok(ENEMIES[id], id); assert.equal(ENEMIES[id].family, 'hollow', `${n}: ${id}`); }
  }
});

test('waves escalate: more Hollows and heavier units as the waves climb', () => {
  const count = n => Logic.echoTrialWave(fresh(), n, lo).foes.length;
  assert.equal(count(1), 1); assert.equal(count(3), 1);
  assert.equal(count(4), 2); assert.equal(count(7), 2);
  assert.equal(count(8), 3); assert.equal(count(29), 3);
  // the husk (heavy) only joins from wave 6
  const has = (n, id) => [0, 0.2, 0.4, 0.6, 0.8, 0.999].some(x => Logic.echoTrialWave(fresh(), n, () => x).foes.includes(id));
  assert.equal(has(2, 'hollow_husk'), false);
  assert.equal(has(6, 'hollow_husk'), true);
  assert.equal(has(2, 'hollow_ward'), false);
  assert.equal(has(3, 'hollow_ward'), true);
});

test('the same wave and random function always give the same wave', () => {
  const s = beaten('act1.boss', 'act1.sub1', 'act2.sub2');
  for (const n of [1, 4, 5, 9, 10, 17]) assert.deepEqual(Logic.echoTrialWave(s, n, seq(0.3, 0.7, 0.1)), Logic.echoTrialWave(s, n, seq(0.3, 0.7, 0.1)));
});

test('boss echoes appear only on multiples of 5', () => {
  const s = beaten('act1.boss', 'act1.sub1', 'act1.sub2');
  for (let n = 1; n <= 30; n++) {
    const w = Logic.echoTrialWave(s, n, Math.random);
    if (n % 5 === 0) assert.ok(w.bossEcho, `wave ${n} has a boss echo`);
    else assert.equal(w.bossEcho, null, `wave ${n} has none`);
  }
});

test('boss echoes are drawn only from bosses beaten in the story', () => {
  const s = beaten('act1.boss', 'act1.sub1', 'act2.sub2', 'act1.stretch1', 'prologue.1');
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const w = Logic.echoTrialWave(s, 5 * (1 + (i % 6)), Math.random);
    seen.add(w.bossEcho.stageId);
    assert.deepEqual(w.foes, [w.bossEcho.enemyId], 'a boss echo fights alone');
  }
  assert.deepEqual([...seen].sort(), ['act1.boss', 'act1.sub1', 'act2.sub2']);
  const r = Logic.echoTrialWave(s, 5, lo).bossEcho;
  assert.deepEqual({ ...r }, { stageId: 'act1.sub1', enemyId: 'kuroe', name: 'Kuroe', kind: 'subboss' });
  assert.deepEqual({ ...Logic.echoTrialWave(s, 5, hi).bossEcho }, { stageId: 'act2.sub2', enemyId: 'sayo', name: 'Sayo', kind: 'subboss' });
});

test('sub-bosses, main bosses and the Core echoes all count as beaten bosses', () => {
  assert.deepEqual(Logic.echoTrialBosses(beaten('core.echo2', 'core.witness', 'act3.sub4', 'act3.stretch2', 'interlude.spar')).map(b => b.enemyId),
    ['soma', 'hollow_akari', 'witness']);
  assert.deepEqual(Logic.echoTrialBosses(fresh()), []);
});

test('with no boss beaten, every 5th wave is an elite Hollow wave instead', () => {
  for (const n of [5, 10, 15]) {
    const w = Logic.echoTrialWave(fresh(), n, Math.random);
    assert.equal(w.bossEcho, null);
    assert.equal(w.elite, true);
    assert.ok(w.foes.length >= 2, 'a pack');
    assert.equal(w.foes[0], 'hollow_husk', 'led by a husk');
    for (const id of w.foes) assert.equal(ENEMIES[id].family, 'hollow');
  }
  assert.equal(Logic.echoTrialWave(fresh(), 4, lo).elite, false);
  assert.equal(Logic.echoTrialWave(beaten('act1.sub1'), 5, lo).elite, false);
});

test('the arena shifts through remembered places every few waves; a boss echo fights in its own arena', () => {
  const env = n => Logic.echoTrialWave(fresh(), n, lo).env;
  assert.equal(env(1), env(2)); assert.equal(env(2), env(3));
  assert.notEqual(env(3), env(4));
  for (let n = 1; n <= 30; n++) assert.ok(TRIALS.envs.includes(env(n)), env(n));
  assert.equal(Logic.echoTrialWave(beaten('act2.sub1'), 5, lo).env, 'echoes');
  assert.equal(Logic.echoTrialWave(beaten('act3.boss'), 10, lo).env, 'fortress');
  assert.ok(TRIALS.envNames[env(1)], 'every arena has a remembered name');
});

test('waves pay rising coins and a gem every 5th wave', () => {
  assert.deepEqual({ ...Logic.trialWaveReward(1) }, { coins: 37, gems: 0 });
  assert.deepEqual({ ...Logic.trialWaveReward(4) }, { coins: 73, gems: 0 });
  assert.deepEqual({ ...Logic.trialWaveReward(5) }, { coins: 85, gems: 1 });
  assert.deepEqual({ ...Logic.trialWaveReward(10) }, { coins: 145, gems: 1 });
});

test('a run banks its coins and gems, 40 XP per wave, and tracks the best wave', () => {
  const s = fresh();
  const out = Logic.applyFightResult(s, { mode: 'trials', waves: 7, trialCoins: 400, trialGems: 1, ng: 0 });
  assert.equal(out.coins, 400); assert.equal(out.gems, 1); assert.equal(out.xp, 280);
  assert.equal(out.newBest, true); assert.equal(s.trialsBest, 7);
  const worse = Logic.applyFightResult(s, { mode: 'trials', waves: 3, trialCoins: 100, trialGems: 0, ng: 0 });
  assert.equal(worse.newBest, false); assert.equal(s.trialsBest, 7);
});

test('an older save keeps its best Survival wave as its best Echo Trials wave', () => {
  assert.equal(Logic.normalizeSave({ survivalBest: 12 }).trialsBest, 12);
  assert.equal(Logic.normalizeSave({ survivalBest: 12, trialsBest: 14 }).trialsBest, 14);
  assert.equal('survivalBest' in Logic.normalizeSave({ survivalBest: 12 }), false);
});

test('the selected difficulty mode applies to Echo Trials foes and boss echoes', () => {
  const on = m => { const s = fresh(); s.difficulty = m; return s; };
  const cfg = { mode: 'trials', wave: 1, ng: 0 };
  for (const id of ['hollow_shade', 'raikon']) {
    const e = Logic.enemyStats(on('easy'), cfg, id, { wave: 5 }), n = Logic.enemyStats(on('normal'), cfg, id, { wave: 5 }), h = Logic.enemyStats(on('impossible'), cfg, id, { wave: 5 });
    assert.ok(e.hp < n.hp && n.hp < h.hp, `${id} hp by mode`);
    assert.ok(e.dmgMul < n.dmgMul && n.dmgMul < h.dmgMul, `${id} damage by mode`);
    assert.equal(h.difficulty, 'impossible');
  }
  // and the waves still climb on top of the mode
  assert.ok(Logic.enemyStats(on('hard'), cfg, 'hollow_shade', { wave: 10 }).hp > Logic.enemyStats(on('hard'), cfg, 'hollow_shade', { wave: 2 }).hp);
});

test('an elite Hollow is tougher than the same Hollow in a regular wave', () => {
  const cfg = { mode: 'trials', wave: 5, ng: 0 }, s = fresh();
  const reg = Logic.enemyStats(s, cfg, 'hollow_husk', { wave: 5 }), el = Logic.enemyStats(s, cfg, 'hollow_husk', { wave: 5, role: 'elite' });
  assert.ok(el.hp > reg.hp * 1.4); assert.ok(el.dmgMul > reg.dmgMul);
});

test('Echo Trials fights one round per wave against a 90 s clock', () => {
  const f = Logic.fightFormat({ mode: 'trials', enemyId: 'hollow_shade' });
  assert.equal(f.name, 'trials'); assert.equal(f.roundsToWin, 1); assert.equal(f.timer, 90);
});
