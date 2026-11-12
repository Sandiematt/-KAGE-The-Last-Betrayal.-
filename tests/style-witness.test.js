'use strict';
// The Witness's fighting style (41-styles/witness.js + the sim half in 69-witness.js) and the two generic Core echoes'
// styles (41-styles/echo_warden.js, echo_sentinel.js): seeded, scripted situations stepped through the real simulation.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSim } = require('./helpers/load-sim');

const DT = 1 / 60;
const EXPORTS = ['FIGHT_STYLES', 'Budo', 'BUDO', 'WitnessBoss', 'WitnessInput', 'WitnessStyle', 'WITNESS_MOVES', 'WITNESS_PACE', 'WITNESS_PLAYS', 'WITNESS_OPEN', 'WITNESS_DUEL', 'PARRY_WINDOW'];
// a live fight on `stage`, past the intro; `still`: its own decisions off, so each test drives one situation
function fight(stage, o) {
  o = o || {};
  const S = loadSim({ seed: o.seed || 11, exports: EXPORTS });
  S.SaveManager.data = S.Logic.defaultSave();
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const cfg = o.enemy ? { mode: 'campaign', enemyId: o.enemy, env: 'highlands', diff: o.diff || 3, pos: 2, ng: 0 } : S.Logic.stageConfig(S.SaveManager.data, stage);
  const s = new S.FightSession(cfg);
  for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
  const e = s.enemy, p = s.player;
  if (o.still) { e.ai.decide = () => {}; e.ai.tryAbility = () => false; e.ai.respond = () => {}; e.ai.readStrike = () => false; S.WitnessBoss.direct = () => {}; }
  p.maxHp = p.hp = 5000;
  if (o.hp != null) e.hp = e.maxHp * o.hp;
  const step = n => { for (let i = 0; i < n; i++) { s.step(DT); S.InputManager.endTick(); } };
  // face each other at sword's distance, both settled
  const stand = (d) => { e.x = 0; e.facing = 1; e.abil = null; e.move = null; e.setState('idle'); e.vx = 0; p.x = d || 150; p.facing = -1; p.vx = 0; p.setState('idle'); p.hp = p.maxHp; step(1); };
  return { S, s, e, p, step, stand };
}
// a cut of Kage's arriving on it (Combat.applyHit, as Combat.resolve would call it)
const cut = (F, id, extra) => F.S.Combat.applyHit(F.s, F.p, F.e, Object.assign({ id: id || 'k2', kind: 'weapon', dmg: 10, kb: 120, hs: 0.3, imp: 1 }, extra), 80, -130, -1);
const WIT = 'core.witness';
// to the start of phase `ph` (0-3): its true health, the shift played through
function toPhase(F, ph) {
  const at = [1, 0.74, 0.49, 0.24][ph];
  F.e.hp = F.e.maxHp * at; F.step(60 * (ph ? 14 : 1));
  return F;
}

test('all three foes fight their own style, with an art, and every technique they name exists', () => {
  const S = loadSim({ seed: 1, exports: EXPORTS });
  for (const id of ['witness', 'echo_warden', 'echo_sentinel']) {
    const st = S.FIGHT_STYLES[id];
    assert.ok(st && st.art, `${id} has a style with an art`);
    assert.ok(st.strings && st.strings.length, `${id} has strings`);
    for (const x of st.strings) for (const step of x.seq) if (step.startsWith('ab:')) assert.ok(S.BOSS_ABILITIES[step.slice(3)], `${id}: ${step} is a registered technique`);
  }
  assert.notEqual(S.FIGHT_STYLES.echo_warden.art, S.FIGHT_STYLES.echo_sentinel.art);
  for (const id of ['mirrorGuard']) assert.ok(S.BOSS_ABILITIES[id] && S.Logic.witnessMove(id), `${id} is a technique with its numbers`);
  for (const p of S.Logic.bossPhases('witness').slice(2)) assert.ok(p.abilities.includes('mirrorGuard'), `${p.name} carries Mirror Guard`);
});

test('a fight against each runs for 60 game seconds without throwing', () => {
  for (const o of [{ stage: WIT, hp: 0.5 }, { stage: WIT }, { enemy: 'echo_warden' }, { enemy: 'echo_sentinel' }]) {
    const F = fight(o.stage, o);
    const IM = F.S.InputManager, moves = ['weapon', 'kick', 'punch', 'weapon'];
    F.p.maxHp = F.p.hp = 1e6;
    let i = 0;
    // a crude Kage: closes in, cuts in turn, now and then raises his guard
    for (; i < 60 * 60 && F.s.phase === 'fight'; i++) {
      const toward = F.e.x > F.p.x ? 'right' : 'left';
      for (const k of ['left', 'right', 'block']) IM.virtualUp(k);
      if (Math.abs(F.e.x - F.p.x) > 160) IM.virtualDown(toward);
      else if (i % 40 === 0) { const b = moves[(i / 40) % moves.length]; IM.virtualUp(b); IM.virtualDown(b); }
      else if (i % 40 === 20) for (const b of moves) IM.virtualUp(b);
      if (F.e.telegraph > 0 && F.e.telegraph < 0.1) IM.virtualDown('block');
      F.s.step(DT); IM.endTick();
    }
    assert.ok(i >= 60 * 60 || F.s.phase !== 'fight', `${o.stage || o.enemy} ran`);
  }
});

/* ---- the Witness ---- */
test('posture on a long fight: its poise falls as the phases advance, and worse in its own recovery', () => {
  const F = fight(WIT, { still: true }), { S, s, e } = F;
  F.step(2);
  const k0 = S.FIGHT_STYLES.witness.poise;
  assert.ok(k0 < 0.8, `high poise in the first phase (${k0})`);
  toPhase(F, 3);
  F.step(2);
  assert.ok(S.FIGHT_STYLES.witness.poise > k0, 'and lower by the last');
  // in the recovery of its own attack it breaks sooner
  F.stand(); S.WitnessStyle.step(s, e);
  const base = S.FIGHT_STYLES.witness.poise;
  e.wOver = s.time + 1; S.WitnessStyle.step(s, e);
  assert.ok(S.FIGHT_STYLES.witness.poise > base, 'in recovery its posture gives way sooner');
  // a whiffed cut costs it posture outright
  e.wOver = 0; e.guard = 100; S.WitnessStyle.overcommit(s, e, 14);
  assert.ok(Math.abs((100 - e.guard) - 14) < 0.01, `a whiffed finisher drains 14 posture (${(100 - e.guard).toFixed(1)})`);
});

test('a posture break is a real event: it stays open a long beat, and the blows in it are criticals', () => {
  const F = fight(WIT, { still: true }), { S, s, e, p } = F;
  F.stand(130);
  const open = S.WITNESS_OPEN.stun[0];
  S.Budo.postureHit(s, e, 400, e.x, -120, -1, p);
  assert.equal(e.state, 'stun');
  assert.ok(e.broken, 'its guard is broken');
  assert.ok(e.stunT >= open - 0.01, `a long stagger (${e.stunT.toFixed(2)} s, wanted ${open})`);
  let crit = null;
  const cd = s.onCritical; s.onCritical = (att, def, c) => { crit = c; };
  cut(F, 'k2');
  s.onCritical = cd;
  assert.ok(crit && crit.why === 'broken', 'the first blow in the opening is a critical');
  // the next blow does not knock it out of the opening: it is still open (and still crit) a third of a second later
  F.step(20);
  assert.ok(e.wOpen > s.time, 'it is still open');
  assert.equal(e.state, 'stun', 'kept staggered by the blow that would only have hit-stunned it');
  assert.ok(e.guard <= S.WITNESS_OPEN.keep + 1, 'and what posture it has after the break is low');
});

test('Echo Combo: every beat can be parried; in phases I-II the string ends, in the duel (III) it comes back on the next beat', () => {
  for (const ph of [0, 2]) {
    const F = fight(WIT, { still: true }), { S, s, e, p } = F;
    toPhase(F, ph);
    S.WitnessBoss.direct = () => {};
    F.stand(150);
    const IM = S.InputManager;
    let beats = [], parried = 0, breaks = 0;
    const bp = S.Budo.breakPosture; S.Budo.breakPosture = function (w, f, ...r) { if (f === e) breaks++; return bp.call(this, w, f, ...r); };
    const orig = S.Combat.parry; S.Combat.parry = function (w, att, def, m, ...r) { if (def === p) { parried++; } return orig.call(this, w, att, def, m, ...r); };
    const apply = S.Combat.applyHit; S.Combat.applyHit = function (w, att, def, m, ...r) { if (att === e && def === p && m.tech === 'echoCut') beats.push(m.beat); return apply.call(this, w, att, def, m, ...r); };
    S.BOSS_ABILITIES.echoCombo.run(e, s, e.ai, p);
    const g0 = e.guard;
    // Kage keeps his guard up, a fresh press at each glint (a parry window, then released)
    for (let i = 0; i < 60 * 6; i++) {
      p.x = 150; p.hp = p.maxHp;
      if (e.telegraph > 0 && e.telegraph < 0.1 && p.state !== 'block') { IM.virtualDown('block'); }
      if (p.state === 'block' && p.st > 0.2) IM.virtualUp('block');
      F.step(1);
    }
    IM.virtualUp('block'); S.Combat.parry = orig; S.Combat.applyHit = apply; S.Budo.breakPosture = bp;
    // (the beats that landed on Kage while he guarded are blocked ones: a parry is not a landing)
    if (ph === 0) {
      assert.equal(parried, 1, `phase I: one parry, and the string is over (${parried})`);
      assert.ok(e.guard > 70, 'it lost one parry of posture, not more');
    } else {
      assert.ok(parried >= 3, `phase III: the string comes back after each parry (${parried} parries)`);
      assert.equal(breaks, 1, `parry the whole rhythm and it breaks (${breaks} breaks; posture ${g0.toFixed(0)} -> ${e.guard.toFixed(0)} after)`);
    }
  }
});

test('the mirror: Kage\'s own latest string is played back at him in the greatsword\'s cuts', () => {
  const F = fight(WIT, { still: true }), { S, s, e, p } = F;
  F.stand(180);
  // Kage cuts: a weapon string, then a directional cut
  s.hitLog.push({ id: 'k1', t: s.time - 0.5, hit: true }, { id: 'k2', t: s.time - 0.25, hit: true }, { id: 'k1_down', t: s.time, hit: true });
  const steps = S.WitnessBoss.mirrorSteps(s, p);
  assert.deepEqual(steps.map(x => x.id), ['c1', 'c2', 'c3_down'], 'translated to the greatsword');
  assert.ok(steps[1].wait >= 0.25, 'in his own rhythm (a little slower)');
  e.ai.cds = {}; s.wit.mirrorT = 0;
  assert.equal(S.WitnessBoss.mirror(e.ai, p), true);
  assert.ok(e.ai.playback, 'it plays the string back');
  const used = [];
  const sm = e.startMove.bind(e); e.startMove = (id, w) => { used.push(id); return sm(id, w); };
  F.step(150);
  assert.ok(used.includes('c1'), `it cut with the greatsword: ${used}`);
  // the same string again: it is not played back, it is read (its opening move is adapted to)
  e.ai.endPlayback(); e.ai.cds = {}; s.wit.mirrorT = 0; e.abil = null; e.setState('idle');
  assert.equal(S.WitnessBoss.mirror(e.ai, p), false, 'a repeated string is not mirrored');
  assert.equal(e.ai.adapted, 'k1', 'it has read how it begins');
});

test('Mirror Guard: a blow into the stance is deflected and answered by a critical riposte; waiting it out spends it', () => {
  const F = fight(WIT, { still: true }), { S, s, e, p } = F;
  toPhase(F, 2);
  S.WitnessBoss.direct = () => {};
  F.stand(140);
  e.ai.cds = {}; e.ai.phase = 2;
  S.BOSS_ABILITIES.mirrorGuard.run(e, s, e.ai, p);
  F.step(40);
  assert.ok(e.counterStance, 'the stance is set');
  cut(F, 'k2');
  assert.ok(p.deflected && p.state === 'stun', 'Kage is deflected');
  assert.ok(!e.counterStance, 'the stance answered');
  let crit = null;
  for (let i = 0; i < 90 && !crit; i++) { F.step(1); if (s.lastCrit && s.lastCrit.att === e) crit = s.lastCrit; }
  assert.ok(crit, 'the riposte is a critical on Kage who stands reeling');
  // left alone: spent, posture torn, open
  const G = fight(WIT, { still: true }); toPhase(G, 2); G.S.WitnessBoss.direct = () => {}; G.stand(220); G.e.ai.cds = {}; G.e.guard = 100;
  G.S.BOSS_ABILITIES.mirrorGuard.run(G.e, G.s, G.e.ai, G.p);
  let spent = false;
  for (let i = 0; i < 160; i++) { G.p.x = 220; G.step(1); if (G.e.abil && G.e.abil.spentAt != null) spent = true; }
  assert.ok(spent, 'the stance ran out');
  assert.ok(G.e.guard <= 100 - G.S.WITNESS_MOVES.mirrorGuard.spent + 8, `and it lost posture (${G.e.guard.toFixed(0)})`);
});

test('a riposte turned back: the Witness loses posture and reels longer', () => {
  const F = fight(WIT, { still: true }), { S, s, e, p } = F;
  toPhase(F, 2);
  S.WitnessBoss.direct = () => {};
  F.stand(140); e.ai.cds = {}; e.ai.phase = 2; e.guard = 100;
  S.BOSS_ABILITIES.mirrorGuard.run(e, s, e.ai, p);
  F.step(40);
  cut(F, 'k2');
  const IM = S.InputManager, want = S.WITNESS_MOVES.mirrorGuard.riposte;
  let t = 0, parried = false, g0 = e.guard;
  const orig = S.Combat.parry; S.Combat.parry = function (w, att, def, ...r) { if (def === p) parried = true; return orig.call(this, w, att, def, ...r); };
  for (let i = 0; i < 90 && !parried; i++) {
    t += DT;
    if (t > want - 0.09 && p.state !== 'block') IM.virtualDown('block');   // a fresh guard, in time for the parry window
    F.step(1);
  }
  IM.virtualUp('block'); S.Combat.parry = orig;
  assert.ok(parried, 'Kage turned the riposte back');
  assert.ok(g0 - e.guard >= 20, `its posture fell (${g0.toFixed(0)} -> ${e.guard.toFixed(0)})`);
  assert.ok(e.state === 'stun' && e.stunT > 0.6, `and it reels (${e.stunT.toFixed(2)} s)`);
});

test('the duel: in phase III it turns a cut of Kage aside and answers with a slow, parryable riposte; in phase I it never does', () => {
  for (const ph of [0, 2]) {
    const F = fight(WIT, { still: true }), { S, s, e, p } = F;
    toPhase(F, ph);
    S.WitnessBoss.direct = () => {};
    delete e.ai.respond;   // its own answer to an incoming cut (the style's), as in a real fight
    S.WITNESS_DUEL.deflect[2] = 1;   // (phase I's own chance is 0)
    let read = 0; const ot = S.WitnessBoss.onThreat.bind(S.WitnessBoss); S.WitnessBoss.onThreat = (ai, pl) => { const r = ot(ai, pl); if (ai.wDeflect != null) read++; return r; };
    F.stand(120); e.ai.phase = ph; e.ai.cds = {};
    const orig = S.Combat.parry; let turned = 0; S.Combat.parry = function (w, att, def, ...r) { if (def === e) turned++; return orig.call(this, w, att, def, ...r); };
    p.startMove('k2', s);
    let riposte = false, tel = 0;
    for (let i = 0; i < 70; i++) { F.step(1); if (e.move && e.move.id === (e.weapon().counter || 'c2') && e.wRipUntil > s.time) { riposte = true; tel = Math.max(tel, e.telegraph); } }
    S.Combat.parry = orig;
    if (ph === 2) { assert.ok(turned >= 1 && p.deflected !== undefined, 'phase III: a cut of Kage was turned aside'); assert.ok(riposte, 'and it answered with the counter cut'); assert.ok(tel >= 0.3, `after a readable tell (${tel.toFixed(2)} s)`); }
    else assert.equal(read, 0, 'phase I: it never reads a cut by the duel');
  }
});

test('Phantom Counter: the copy\'s cut is the Witness\'s own, a critical, and a parry of it shatters the copy and turns on the Witness', () => {
  const F = fight(WIT, { still: true }), { S, s, e, p } = F;
  F.stand(300);
  e.ai.cds = {};
  S.WitnessBoss.phantom(e, s, p);
  let crit = null;
  for (let i = 0; i < 120 && !crit; i++) { p.invuln = 0; F.step(1); if (s.lastCrit && s.lastCrit.att === e) crit = s.lastCrit; }
  assert.ok(crit && crit.why === 'style', `the phantom's cut is a critical (${crit && crit.why})`);
  // a parry of it
  const G = fight(WIT, { still: true }); G.stand(300); G.e.ai.cds = {}; G.e.guard = 100;
  G.S.WitnessBoss.phantom(G.e, G.s, G.p);
  let parried = false; const orig = G.S.Combat.parry; G.S.Combat.parry = function (w, att, def, ...r) { if (def === G.p) parried = true; return orig.call(this, w, att, def, ...r); };
  for (let i = 0; i < 120 && !parried; i++) {
    const ph = G.s.fighters.find(c => c.wPhantom);
    if (ph && ph.abil && ph.telegraph > -0.02 && ph.telegraph < 0.03 && G.p.state !== 'block') G.S.InputManager.virtualDown('block');   // the guard as the glint breaks
    G.step(1);
  }
  G.S.InputManager.virtualUp('block'); G.S.Combat.parry = orig;
  assert.ok(parried, 'Kage parried the copy');
  assert.ok(G.e.guard < 100, 'the Witness lost posture');
});

test('fair windows: after a modifier bites the Witness holds its blade, and control moves never stack', () => {
  const F = fight(WIT, { still: true }), { S, s, e, p } = F;
  toPhase(F, 1);
  F.stand(160);
  S.WitnessInput.add(s, { kind: 'reverse', warn: 0.5, dur: 1.0, label: 'REVERSED' });
  assert.equal(S.WitnessBoss.calm(s), true, 'the window is open while it warns and just after it bites');
  F.step(60);
  assert.equal(S.WitnessBoss.calm(s), true, 'still calm within WITNESS_PACE.calm of the bite');
  F.step(60);
  assert.equal(S.WitnessBoss.calm(s), false, 'and it ends');
  // no control move while one is in force or just before
  const ids = ['echoBind', 'realityRewrite', 'nullProtocol', 'healthDrain'];
  S.WitnessInput.add(s, { kind: 'bind', dir: 1, warn: 0.5, dur: 1 });
  for (const id of ids) { const a = S.BOSS_ABILITIES[id]; assert.equal(!!a.cond(e, s, e.ai, p, 200), false, `${id} waits while a modifier is in force`); }
  S.WitnessInput.clear(s); s.wit.ctrlT = s.time + 3;
  assert.equal(S.BOSS_ABILITIES.realityRewrite.cond(e, s, e.ai, p, 200), false, 'and for the gap after the last control move');
  s.wit.ctrlT = 0; s.wit.tiles = null;
  assert.ok(S.BOSS_ABILITIES.realityRewrite.cond(e, s, e.ai, p, 200), 'then it is free again');
  // and the AI itself holds while calm
  S.WitnessInput.add(s, { kind: 'delay', keys: ['dir'], delay: 0.14, warn: 0.5, dur: 1 });
  F.step(10);
  assert.equal(S.FIGHT_STYLES.witness.decide(e.ai, p, 160, 1), true, 'the style holds (no new attack) while calm');
  assert.equal(e.ai.plan, 'hold');
});

test('a spammer is read: a move Kage has thrown three times running is turned aside the moment it starts, and punished', () => {
  const F = fight(WIT, { still: true }), { S, s, e, p } = F;
  delete e.ai.respond;
  F.stand(125); e.ai.cds = {};
  e.ai.adapted = 'k1';   // (BUDO.adapt: the same move three times running)
  const orig = S.Combat.parry; let turned = 0; S.Combat.parry = function (w, att, def, ...r) { if (def === e) turned++; return orig.call(this, w, att, def, ...r); };
  p.startMove('k1', s);
  let crit = null;
  for (let i = 0; i < 80 && !crit; i++) { F.step(1); if (s.lastCrit && s.lastCrit.att === e) crit = s.lastCrit; }
  S.Combat.parry = orig;
  assert.equal(turned, 1, 'it raised its guard as the cut started and turned it aside');
  assert.ok(crit, 'and the answer is a critical');
});

test('the punish of a repeated move is a critical (the spam read\'s cut), a single varied cut is not', () => {
  const F = fight(WIT, { still: true }), { S, s, e, p } = F;
  F.stand(150);
  const st = S.FIGHT_STYLES.witness;
  const m = { id: 'c2', kind: 'weapon' };
  e.move = m; e.punishMove = m;
  assert.equal(!!st.crit(e, p, m, s), true);
  e.punishMove = null;
  assert.equal(!!st.crit(e, p, m, s), false);
});

test('Final Judgment denied by a guard at the flash: a long stagger and its posture torn', () => {
  const F = fight(WIT, { still: true }), { S, s, e, p } = F;
  toPhase(F, 3);
  S.WitnessBoss.direct = () => {};
  if (s.wit.domain) Object.assign(s.wit.domain.rules, { input: false, zones: false, fakes: false });
  S.WitnessInput.clear(s); s.wit.tiles = null;
  F.stand(380); e.guard = 100;
  S.BOSS_ABILITIES.finalJudgment.run(e, s, e.ai, p);
  const j = s.wit.haz.find(h => h.kind === 'judgment');
  let stunned = 0, started = false;
  for (let i = 0; i < 60 * 4; i++) {
    if (j.t >= j.delay - 0.08 && !j.cut && p.state !== 'block') p.setState('block');
    F.step(1);
    if (e.state === 'stun') { started = true; stunned += DT; }
  }
  assert.equal(p.hp, p.maxHp, 'the perfect guard took nothing');
  assert.ok(started && stunned >= S.WITNESS_MOVES.finalJudgment.stagger - 0.2, `the Witness reeled for ${stunned.toFixed(2)} s`);
  assert.ok(e.guard < 100 || e.broken, 'its posture was torn');
});

/* ---- the two generic Core echoes ---- */
test('the Warden answers a parry at once and takes the counter stance when pressed', () => {
  const F = fight(null, { enemy: 'echo_warden', still: true }), { S, s, e, p } = F;
  delete e.ai.respond;
  F.stand(150);
  e.setState('block'); e.blockT = 0; e.ctrl.blockHeld = true;
  cut(F, 'k2');
  assert.equal(e.stats.parries, 1, 'it parried the cut');
  let riposte = false;
  for (let i = 0; i < 60 && !riposte; i++) { F.step(1); if (e.state === 'move') riposte = true; }
  assert.ok(riposte, 'and answers it with a cut of its own');
  // pressed: two of Kage's blows on it and it settles into the counter stance
  const G = fight(null, { enemy: 'echo_warden', still: true }); G.stand(150); G.e.ai.cds = {};
  G.e.ai._press = [G.s.time, G.s.time];
  const st = S.FIGHT_STYLES.echo_warden;
  let stance = false;
  for (let i = 0; i < 60 && !stance; i++) { G.e.ai.cds.hollowReturn = 0; G.e.abil = null; G.e.setState('idle'); G.e.ai._press = [G.s.time, G.s.time]; st.decide(G.e.ai, G.p, 150, 1); stance = !!G.e.abil; G.step(1); }
  assert.ok(stance, 'it took the counter stance');
});

test('the Sentinel throws a crescent along the line and then stands still; its strings end in a step back', () => {
  const F = fight(null, { enemy: 'echo_sentinel', still: true }), { S, s, e, p } = F;
  F.stand(420);
  S.BOSS_ABILITIES.crescentArc.run(e, s, e.ai, p);
  let seen = false, openAt = null;
  for (let i = 0; i < 120; i++) { F.step(1); if (s.projectiles.some(q => q.type === 'crescent' && q.owner === e)) { seen = true; if (openAt == null) openAt = i; } }
  assert.ok(seen, 'a crescent flew');
  assert.ok(openAt >= 15, `after a readable wind-up (${openAt} frames)`);
  assert.ok(e.state === 'ability' || e.state === 'idle', 'and it recovers');
  for (const x of S.FIGHT_STYLES.echo_sentinel.strings.filter(q => !q.seq[0].startsWith('ab:'))) assert.equal(x.seq[x.seq.length - 1], 'back', `${x.seq.join(' ')} ends in a step back`);
  // chased: it does not trade
  const G = fight(null, { enemy: 'echo_sentinel', still: true }); G.stand(120); G.p.setState('walk');
  let out = false;
  for (let i = 0; i < 80 && !out; i++) { G.e.ai.cds = {}; G.p.state = 'walk'; S.FIGHT_STYLES.echo_sentinel.decide(G.e.ai, G.p, 120, 1); if (G.e.ai.plan === 'retreat' || G.e.abil) out = true; }
  assert.ok(out, 'it steps out of a chase');
});
