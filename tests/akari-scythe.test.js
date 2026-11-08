'use strict';
// Akari's scythe moves, driven through the real fight simulation (Reaping Arc, Chain Reap, Binding Chain, Petal Burst;
// 40-ai.js, 62b-akari-chain.js, Fighter.updateBound in 20-fighter.js). Her AI is switched off and each move is run on
// its own against a Kage who stands, blocks, dashes or breaks the chain with his rage art.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSim } = require('./helpers/load-sim');

const REAL = 1 / 60;

// a fresh Act II boss fight, past its intro, Akari still and Kage `gap` px in front of her, at her phase for `hp`
function arena(gap, hp) {
  const S = loadSim({ seed: 7 });
  const save = S.SaveManager.data = S.Logic.defaultSave();
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const s = new S.FightSession(S.Logic.stageConfig(save, 'act2.boss'));
  for (let i = 0; i < 900 && s.phase !== 'fight'; i++) step(S, s, 1);
  assert.equal(s.phase, 'fight', 'the fight starts');
  const e = s.enemy, p = s.player;
  e.ai.decide = function () {}; e.ai.tryAbility = function () { return false; };
  p.maxHp = p.hp = 5000;
  e.x = -200; p.x = e.x + gap; e.facing = 1; p.facing = -1; e.vx = p.vx = 0;
  e.hp = e.maxHp * (hp == null ? 0.9 : hp); e.ai.checkPhase();
  e.abil = null; e.setState('idle'); p.setState('idle');
  step(S, s, 2);
  return { S, s, e, p };
}
function step(S, s, n) {
  for (let i = 0; i < n; i++) {
    if (s.fx.hitStop > 0) s.fx.update(REAL, 0);
    else { s.step(S.STEP); S.InputManager.endTick(); s.fx.update(REAL, REAL); }
  }
}
const run = (A, id) => { A.S.BOSS_ABILITIES[id].run(A.e, A.s, A.e.ai); };
const tap = (A, key) => { A.S.InputManager.virtualDown(key); step(A.S, A.s, 2); A.S.InputManager.virtualUp(key); };
// step until `cond` holds (or `max` frames pass); returns the frames it took, or -1
function until(A, cond, max) { for (let i = 0; i < (max || 600); i++) { if (cond()) return i; step(A.S, A.s, 1); } return cond() ? max : -1; }

test('her phases carry the scythe: Reaping Arc and Chain Reap from the start, Petal Burst from phase 2, Binding Chain in phase 3', () => {
  const { S } = arena(400);
  const ph = S.Logic.bossPhases('akari');
  for (const a of ['reapingArc', 'chainReap']) for (const p of ph) assert.ok(p.abilities.includes(a), a);
  assert.ok(!ph[0].abilities.includes('petalBurst') && ph[1].abilities.includes('petalBurst') && ph[2].abilities.includes('petalBurst'));
  assert.ok(!ph[1].abilities.includes('chainBind') && ph[2].abilities.includes('chainBind'));
  assert.ok(ph[2].burstBind, 'phase 3 throws the chain into Petal Burst');
  const ar = S.BOSS_ABILITIES.reapingArc, cr = S.BOSS_ABILITIES.chainReap;
  assert.ok(ar.range[1] <= cr.range[0] + 40, 'the swing is for close range, the chain for range');
});

test('Reaping Arc: up close, one wide sweep and a return cut land on a standing Kage', () => {
  const A = arena(170);
  const hp0 = A.p.hp; run(A, 'reapingArc');
  step(A.S, A.s, 90);
  assert.ok(A.p.hp < hp0 - 8, `the sweep connects (${hp0 - A.p.hp})`);
});

test('Chain Reap: the blade flies on its chain across the arena, cuts him and is reeled home', () => {
  const A = arena(620);
  const hp0 = A.p.hp; run(A, 'chainReap');
  assert.ok(until(A, () => A.e.akChainOut, 120) >= 0, 'the head leaves the staff');
  const c = A.e.akChainOut;
  assert.ok(until(A, () => c.phase !== 'out', 120) >= 0);
  assert.ok(A.p.hp < hp0 - 5, `it cuts him at range (${hp0 - A.p.hp})`);
  assert.ok(until(A, () => A.e.state !== 'ability', 240) >= 0, 'the move ends once it is home');
  assert.equal(A.e.akChainOut, null, 'the head is back on the staff');
  assert.equal((A.s.akChains || []).length, 0);
});

test('Chain Reap is blockable: a guard takes chip damage only', () => {
  const A = arena(560);
  A.S.InputManager.virtualDown('block'); step(A.S, A.s, 4);
  const hp0 = A.p.hp; run(A, 'chainReap');
  until(A, () => A.e.state !== 'ability', 300);
  A.S.InputManager.virtualUp('block');
  assert.ok(hp0 - A.p.hp < 3, `blocked (${hp0 - A.p.hp})`);
});

// throw a Binding Chain at a standing Kage and wait until it holds him
function bound(A) {
  run(A, 'chainBind');
  assert.ok(until(A, () => A.p.state === 'bound', 200) >= 0, 'the chain binds him');
  step(A.S, A.s, 20);   // past the catch's hit-stop
}

test('Binding Chain: caught, he cannot move; when the hold runs out she reels him in for heavy damage', () => {
  const A = arena(520, 0.25);
  bound(A);
  const x0 = A.p.x, hp0 = A.p.hp;
  A.S.InputManager.virtualDown('right'); step(A.S, A.s, 40); A.S.InputManager.virtualUp('right');
  assert.equal(A.p.state, 'bound', 'still bound while he pushes');
  assert.ok(Math.abs(A.p.x - x0) < 2, 'and he does not move');
  tap(A, 'punch'); tap(A, 'jump'); tap(A, 'dash');
  assert.equal(A.p.state, 'bound', 'no attack, jump or dash breaks it');
  let near = 1e9;
  assert.ok(until(A, () => { near = Math.min(near, Math.abs(A.p.x - A.e.x)); return A.p.state !== 'bound'; }, 300) >= 0, 'the hold ends');
  step(A.S, A.s, 30);
  assert.ok(hp0 - A.p.hp >= 30, `the reaping cut is significant (${hp0 - A.p.hp})`);
  assert.ok(near < 200, `he was reeled in to her (${near | 0} px)`);
});

test('Binding Chain: without full rage the special does not free him', () => {
  const A = arena(520, 0.25);
  bound(A); A.p.rage = 60;
  tap(A, 'special');
  assert.equal(A.p.state, 'bound');
});

test('Binding Chain: his rage art breaks the chain, spares him the cut and leaves her reeling', () => {
  const A = arena(520, 0.25);
  bound(A); A.p.rage = 100;
  const hp0 = A.p.hp; let special = null;
  const os = A.s.onSpecial; A.s.onSpecial = function (f, name) { special = name; return os.apply(this, arguments); };
  tap(A, 'special'); step(A.S, A.s, 2);
  assert.notEqual(A.p.state, 'bound', 'free');
  assert.ok(special, 'the rage art fired');
  assert.ok(A.p.rage < 100, 'the rage meter was spent');
  assert.equal(A.e.state, 'stun', 'she reels from the broken chain');
  assert.equal(A.e.akChainOut, null);
  step(A.S, A.s, 200);
  assert.ok(hp0 - A.p.hp < 12, `no reaping cut (${hp0 - A.p.hp})`);
});

test('Binding Chain can be jumped or dashed through', () => {
  const A = arena(520, 0.25);
  run(A, 'chainBind');
  // dash through it as it arrives
  until(A, () => A.e.akChainOut && Math.abs(A.e.akChainOut.x - A.p.x) < 150, 200);
  A.S.InputManager.virtualDown('left'); tap(A, 'dash'); A.S.InputManager.virtualUp('left');
  step(A.S, A.s, 120);
  assert.notEqual(A.p.state, 'bound');
});

test('Petal Burst (phase 2): blade petals ring her, swing round the arena cutting him, and burst home', () => {
  const A = arena(380, 0.5);
  assert.equal(A.e.petal, 'crimson', 'phase 2');
  const hp0 = A.p.hp; run(A, 'petalBurst');
  assert.ok(until(A, () => (A.s.akPetals || []).length > 0, 120) >= 0, 'the petals form');
  assert.equal(A.s.akPetals.length, A.S.Logic.akariMove('petalBurst').count);
  // they spread across the arena, well past him
  let far = 0;
  until(A, () => { for (const q of A.s.akPetals || []) far = Math.max(far, Math.abs(q.x - A.e.x)); return false; }, 150);
  assert.ok(far > 380 + 150, `the loops reach past him (${far | 0} px)`);
  assert.ok(until(A, () => A.e.state !== 'ability', 600) >= 0, 'the move ends');
  assert.ok(A.p.hp < hp0, `petals cut a Kage who stands still (${hp0 - A.p.hp})`);
  assert.equal((A.s.akPetals || []).filter(q => q.owner === A.e).length, 0, 'no petals left behind');
});

test('Petal Burst (phase 3): the chain goes into the storm and the lotus bursts on a bound Kage', () => {
  const A = arena(380, 0.25);
  assert.equal(A.e.petal, 'demon', 'phase 3');
  let worst = 0;
  const od = A.S.Combat.damage; A.S.Combat.damage = function (w, att, def, dmg) { if (def === A.p) worst = Math.max(worst, dmg); return od.apply(this, arguments); };
  run(A, 'petalBurst');
  assert.equal((A.s.akPetals || []).length, 0);
  assert.ok(until(A, () => A.p.state === 'bound', 400) >= 0, 'Binding Bloom catches him');
  assert.ok(until(A, () => !!A.s.akLotus, 300) >= 0, 'the petals converge into a lotus over him');
  assert.ok(until(A, () => A.e.state !== 'ability', 400) >= 0);
  assert.ok(worst >= 30, `the burst is significant (${worst | 0})`);
  assert.equal(A.s.akLotus, null, 'the lotus is gone after');
});
