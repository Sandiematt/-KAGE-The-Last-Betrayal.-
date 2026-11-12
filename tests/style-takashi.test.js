'use strict';
// Takashi's and Hollow Takashi's fighting style (41-styles/takashi.js, 41-styles/hollow_takashi.js) and the deflection
// duel they fight (66-takashi.js: TakashiGuard, TakashiKata): seeded, scripted situations stepped through the real
// simulation.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSim } = require('./helpers/load-sim');

const DT = 1 / 60;
const EXPORTS = ['FIGHT_STYLES', 'Budo', 'BUDO', 'TakashiGuard', 'TakashiKata', 'TK_DUEL', 'TK_BEATS'];
// a live fight on `stage`, past the intro; `still`: his own decisions off, so each test drives one situation
function fight(stage, still) {
  const S = loadSim({ seed: 11, exports: EXPORTS });
  S.SaveManager.data = S.Logic.defaultSave();
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, stage));
  for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
  const e = s.enemy, p = s.player;
  if (still) { e.ai.decide = () => {}; e.ai.tryAbility = () => false; e.ai.readStrike = () => false; e.ai.respond = () => {}; e.ai.formCd = 1e9; }
  p.maxHp = p.hp = 5000;
  const step = (n) => { for (let i = 0; i < n; i++) { s.step(DT); S.InputManager.endTick(); } };
  // face each other at sword's distance, both settled
  const stand = () => { e.x = 0; p.x = 150; p.facing = -1; e.facing = 1; e.abil = null; e.setState('idle'); p.setState('idle'); e.tkx = null; step(1); };
  return { S, s, e, p, step, stand };
}
// a varied cut of Kage's arriving on him (Combat.applyHit, as Combat.resolve would call it)
const cut = (F, id, extra) => F.S.Combat.applyHit(F.s, F.p, F.e, Object.assign({ id: id || 'k2', kind: 'weapon', dmg: 10, kb: 120, hs: 0.3, imp: 1 }, extra), 80, -130, -1);
// make his varied deflection certain (or impossible) for a scripted test
function setDuel(F, o) { const st = F.S.FIGHT_STYLES[F.e.def.id]; st.duel = Object.assign({}, st.duel, o); st._duel = null; }

test('both foes fight their own style, with an art', () => {
  const S = loadSim({ seed: 1, exports: EXPORTS });
  for (const id of ['takashi', 'hollow_takashi']) {
    const st = S.FIGHT_STYLES[id];
    assert.ok(st && st.art, `${id} has a style with an art`);
    assert.ok(st.duel && st.strings.length, `${id} has its duel numbers and kata strings`);
    for (const s of st.strings) for (const step of s.seq) if (step.startsWith('ab:')) assert.ok(S.BOSS_ABILITIES[step.slice(3)], `${step} is a registered technique`);
  }
  assert.notEqual(S.FIGHT_STYLES.hollow_takashi, S.FIGHT_STYLES.takashi, 'the echo has its own, lesser entry');
  const T = S.TakashiGuard.cfg({ def: { id: 'takashi' } }), H = S.TakashiGuard.cfg({ def: S.ENEMIES.hollow_takashi });
  assert.ok(H.deflect < T.deflect && H.kataGuard < T.kataGuard && H.open > T.open, 'the echo turns fewer cuts aside and stands open longer');
});

test('a fight against each runs for 60 game seconds without throwing', () => {
  for (const stage of ['act3.boss', 'core.echo3']) {
    const F = fight(stage, false);
    let i = 0;
    // a crude Kage: closes in, cuts in turn, now and then raises his guard
    const moves = ['weapon', 'kick', 'punch', 'weapon'];
    for (; i < 60 * 60 && F.s.phase === 'fight'; i++) {
      const IM = F.S.InputManager, toward = F.e.x > F.p.x ? 'right' : 'left';
      for (const k of ['left', 'right', 'block']) IM.virtualUp(k);
      if (Math.abs(F.e.x - F.p.x) > 160) IM.virtualDown(toward);
      else if (i % 40 === 0) { const b = moves[(i / 40) % moves.length]; IM.virtualUp(b); IM.virtualDown(b); }
      else if (i % 40 === 20) for (const b of moves) IM.virtualUp(b);
      if (F.e.telegraph > 0 && F.e.telegraph < 0.1) IM.virtualDown('block');
      F.s.step(DT); IM.endTick();
    }
    assert.ok(i >= 60 * 60 || F.s.phase !== 'fight', `${stage} ran`);
  }
});

test('the Iron Guard turns a varied cut aside, and the riposte comes at the fixed tempo with a glint', () => {
  const F = fight('act3.boss', true), { S, e, p } = F;
  F.stand();
  setDuel(F, { deflect: 1 });
  cut(F, 'k2');
  assert.equal(p.state, 'stun', 'Kage\'s cut is deflected');
  assert.equal(p.deflected, true);
  // the riposte: the draw cut, its wind-up the telegraph, its cut at TK_DUEL.riposte after the deflection
  let t = 0, cutAt = null, tel = 0;
  for (let i = 0; i < 90 && cutAt == null; i++) {
    F.step(1); t += DT;
    if (e.abil && e.abil.tkBeat === 'iai') { tel = Math.max(tel, e.telegraph); if (e.abil.cut) cutAt = t; }
  }
  assert.ok(cutAt != null, 'he answers with the draw cut');
  const want = S.TakashiGuard.cfg(e).riposte;
  assert.ok(Math.abs(cutAt - want) < 0.06, `the cut falls ${cutAt.toFixed(2)} s after the deflection (tempo ${want})`);
  assert.ok(tel > want - 0.08, 'the wind-up is telegraphed');
});

test('a repeated strike is always read; a varied one is never turned once his posture is below the floor', () => {
  const F = fight('act3.boss', true), { S, s, e, p } = F;
  F.stand();
  setDuel(F, { deflect: 1 });
  s.history = ['k1', 'p1', 'k1'];
  e.guard = 5;   // even with his posture all but gone, a repeat is read
  cut(F, 'k1');
  assert.ok(p.deflected, 'the repeat is read');
  F.stand(); e.guard = S.TakashiGuard.cfg(e).floor - 1; s.history = ['p1', 'k3', 'kk'];
  const hp0 = e.hp;
  cut(F, 'k2');
  assert.ok(e.hp < hp0 && !p.deflected, 'below the floor his guard is cracking: the varied cut lands');
  F.stand(); e.guard = 100; s.history = [];
  const hp1 = e.hp;
  cut(F, 'k1_down', { gb: 55 });
  assert.ok(e.hp < hp1 && !p.deflected, 'a guard-breaking downward cut is never turned aside');
});

test('the exchange: Kage parries the riposte, it costs the father posture, and his kata goes on', () => {
  const F = fight('act3.boss', true), { S, e, p } = F;
  F.stand();
  setDuel(F, { deflect: 1 });
  cut(F, 'k2');
  const IM = S.InputManager, want = S.TakashiGuard.cfg(e).riposte;
  let t = 0, parried = false, g0 = e.guard;
  const st0 = S.Combat.parry; S.Combat.parry = function (...a) { if (a[2] === p) parried = true; return st0.apply(this, a); };
  for (let i = 0; i < 60 && !parried; i++) {
    t += DT;
    if (t > want - 0.09) IM.virtualDown('block');   // a fresh guard, in time for the parry window
    F.step(1);
  }
  IM.virtualUp('block');
  assert.ok(parried, 'Kage turned the riposte back');
  const loss = BUDO_parried(S) * S.FIGHT_STYLES.takashi.poise;
  assert.ok(g0 - e.guard >= loss - 0.5, `his posture fell (${g0.toFixed(0)} -> ${e.guard.toFixed(0)})`);
  assert.ok(e.tkx && e.tkx.pending, 'his kata goes on: the next beat is pending');
  F.step(30);
  assert.ok(e.tkx && e.abil && e.abil.tkBeat && e.abil.tkBeat !== 'iai', 'and the next beat of the kata runs');
});
const BUDO_parried = S => S.BUDO.posture.parried.boss;

test('a riposte that finds Kage still reeling is a critical; the overhead crushes a held guard', () => {
  const F = fight('act3.boss', true), { S, s, e, p } = F;
  F.stand();
  setDuel(F, { deflect: 1 });
  cut(F, 'k2');
  let crit = null;
  for (let i = 0; i < 60 && !crit; i++) { F.step(1); if (s.lastCrit && s.lastCrit.att === e) crit = s.lastCrit; }
  assert.ok(crit, 'he did not raise his guard: the riposte is a critical');
  // karatake-wari on a guard held long: most of Kage's posture
  const G = fight('act3.boss', true);
  G.stand(); G.p.hp = G.p.maxHp; G.p.guard = 100;
  G.S.InputManager.virtualDown('block'); G.step(20);
  G.S.TakashiKata.start(G.e, G.s, ['overhead']);
  let lowest = 100;
  for (let i = 0; i < 60; i++) { G.step(1); lowest = Math.min(lowest, G.p.guard); }
  G.S.InputManager.virtualUp('block');
  assert.ok(100 - lowest >= 60 || G.p.broken, `the blocked overhead took ${(100 - lowest).toFixed(0)} posture`);
});

test('the last beat of a kata parried leaves him open; his posture comes back when Kage stands off', () => {
  const F = fight('act3.boss', true), { S, s, e, p } = F;
  F.stand();
  S.TakashiKata.start(e, s, ['kesa']);
  const IM = S.InputManager, T = S.TK_BEATS.kesa.T * S.TakashiGuard.cfg(e).tempo;
  let t = 0, open = 0;
  for (let i = 0; i < 60; i++) { t += DT; if (t > T - 0.08) IM.virtualDown('block'); F.step(1); if (e.state === 'stun' && !e.tkx) open = Math.max(open, e.stunT); }
  IM.virtualUp('block');
  assert.ok(open > 0.3, `he stands open after the last beat (${open.toFixed(2)} s)`);
  // posture: slow in the duel, fast with Kage out of reach
  F.stand(); e.guard = 40; e.postureDelay = 0; p.x = 160; F.step(30);
  const near = e.guard - 40;
  e.guard = 40; e.postureDelay = 0; p.x = 700; F.step(30);
  const far = e.guard - 40;
  assert.ok(far > near * 2, `posture returns faster at range (${far.toFixed(1)} vs ${near.toFixed(1)})`);
});

test('Hollow Takashi keeps the Iron Guard and the kata, at its own lesser numbers', () => {
  const F = fight('core.echo3', true), { S, e, p } = F;
  F.stand();
  assert.equal(e.ironGuard, true, 'the echo remembers the Iron Guard');
  setDuel(F, { deflect: 1 });
  cut(F, 'k2');
  assert.ok(p.deflected, 'it turns a cut aside');
  let beat = null;
  for (let i = 0; i < 60 && !beat; i++) { F.step(1); if (e.abil && e.abil.tkBeat) beat = e.abil.tkBeat; }
  assert.equal(beat, 'iai', 'and answers with its broken draw cut');
  assert.ok(S.TakashiGuard.cfg(e).riposte > S.TK_DUEL.riposte, 'later than the father\'s');
});
