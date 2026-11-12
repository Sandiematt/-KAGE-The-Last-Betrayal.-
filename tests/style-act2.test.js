'use strict';
// Act II's sub-bosses fight in their own schools (src/js/41-styles/tsugumi.js, sayo.js, utsushi.js, kasane.js): each has
// a style, a whole fight runs, and each one's signature behaviour happens in a scripted situation.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSim } = require('./helpers/load-sim');

const DT = 1 / 60;
const STAGES = { tsugumi: 'act2.sub1', sayo: 'act2.sub2', utsushi: 'act2.sub3', kasane: 'act2.sub4' };

// a live fight at the foe's story stage, past the intro. `quiet`: the foe's own decisions are switched off, so a test
// drives one behaviour.
function fight(id, quiet, seed) {
  const S = loadSim({ seed: seed || 11, exports: ['FIGHT_STYLES', 'Budo', 'BUDO', 'PARRY_WINDOW', 'WeaponSystem'] });
  S.SaveManager.data = S.Logic.defaultSave();
  S.Game.playStory = (sid, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, STAGES[id]));
  for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
  const e = s.enemy, p = s.player;
  if (quiet) { e.ai.decide = () => {}; e.ai.tryAbility = () => false; e.ai.t = 1e9; }
  p.maxHp = p.hp = 5000;
  const run = (sec, each) => { for (let i = 0; i < sec * 60; i++) { if (each) each(i); s.step(DT); } };
  // force every chance() roll to pass while fn runs
  const sure = (fn) => { const n = S.rng.next; S.rng.next = () => 0; try { return fn(); } finally { S.rng.next = n; } };
  const started = [];
  const sm = e.startMove.bind(e); e.startMove = (mid, w, o) => { const ok = sm(mid, w, o); if (ok) started.push(mid); return ok; };
  return { S, s, e, p, run, sure, started };
}
const place = (F, gap) => { const { e, p } = F; e.x = 0; p.x = gap; e.facing = 1; p.facing = -1; e.setState('idle'); p.setState('idle'); e.vx = p.vx = 0; p.invuln = 0; e.invuln = 0; };

test('each Act II sub-boss has a fighting style with a school', () => {
  const S = loadSim({ seed: 1, exports: ['FIGHT_STYLES'] });
  for (const id of Object.keys(STAGES)) {
    const st = S.FIGHT_STYLES[id];
    assert.ok(st && typeof st.art === 'string' && st.art.length > 2, `${id} has an art`);
    assert.ok(Array.isArray(st.strings) && st.strings.length >= 5, `${id} has its own strings`);
    for (const s of st.strings) for (const step of s.seq) {
      if (step.startsWith('move:')) assert.ok(S.MOVES[step.slice(5)], `${id}: ${step} is a move`);
      if (step.startsWith('ab:')) assert.ok(S.BOSS_ABILITIES[step.slice(3)], `${id}: ${step} is an ability`);
    }
  }
  for (const ab of ['tsugumiFan', 'sayoSlowHand', 'utsushiMoon', 'kasaneChain']) assert.ok(S.BOSS_ABILITIES[ab], `${ab} is registered`);
  // the story's own signature abilities are kept
  assert.ok(S.ENEMIES.tsugumi.phases[0].abilities.includes('courierStep'));
  assert.ok(S.ENEMIES.sayo.phases[1].abilities.includes('counterStance'));
  assert.ok(S.ENEMIES.utsushi.phases[1].abilities.includes('stolenFang'));
  assert.ok(S.ENEMIES.kasane.phases[1].abilities.includes('ledgerStep'));
  // the sub-bosses stay sub-bosses (a step above Act I's, not main bosses): sub type, one or two phases
  for (const id of Object.keys(STAGES)) { assert.equal(S.ENEMIES[id].type, 'sub'); assert.ok(S.ENEMIES[id].phases.length <= 2); }
});

for (const id of Object.keys(STAGES)) {
  test(`${id}: a fight runs for 60 game seconds without throwing, and the style's strings fire`, () => {
    const F = fight(id, false, 3);
    let strings = 0;
    const ts = F.e.ai.tryString.bind(F.e.ai); F.e.ai.tryString = (p, d) => { const ok = ts(p, d); if (ok) strings++; return ok; };
    // Kage walks in and cuts now and then, so the foe has something to answer
    F.run(60, (i) => {
      const p = F.p, e = F.e, c = F.S.InputManager;
      if (i % 50 === 0) c.virtualDown(e.x > p.x ? 'right' : 'left');
      if (i % 50 === 20) { c.virtualUp('right'); c.virtualUp('left'); }
      if (i % 50 === 25) c.virtualDown('weapon');
      if (i % 50 === 28) c.virtualUp('weapon');
      if (F.e.hp < 60) F.e.hp = F.e.maxHp;   // keep the fight going the whole minute
    });
    assert.ok(F.e.alive, `${id} is still fighting`);
    assert.ok(strings >= 3, `${id} threw its own strings (${strings})`);
  });
}

test('tsugumi: the Courier\'s Fan throws three kunai at three heights, and a swing of the blade cuts one down', () => {
  const F = fight('tsugumi', true);
  const { S, s, e, p } = F;
  place(F, 380);
  S.BOSS_ABILITIES.tsugumiFan.run(e, s, e.ai, p);
  assert.ok(e.telegraph > 0.25, 'the throw is telegraphed');
  const seen = [];
  F.run(0.9, () => { for (const pr of s.projectiles) if (!seen.includes(pr)) seen.push(pr); });
  assert.equal(seen.length, 3, 'three kunai');
  const ys = seen.map(pr => pr.vy);
  assert.ok(new Set(ys.map(v => Math.round(v))).size === 3, `at three different slopes (${ys.map(Math.round)})`);
  // Kage cutting at one in flight deflects it
  const G = fight('tsugumi', true);
  place(G, 380);
  const pr = G.S.WeaponSystem.spawn(G.s, 'kunai', G.e, { dmg: 5 });
  pr.x = G.p.x - 40; pr.y = G.p.y - 120; pr.vy = 0; pr.vx = -400;
  G.p.startMove('k1', G.s);
  G.run(0.3);
  assert.ok(pr.dead, 'the kunai is deflected by the swing');
});

test('tsugumi: a Kage who jumps is met by a kunai (far) or the rising knife (near); a read flurry is not stood in', () => {
  const F = fight('tsugumi', false);
  const { S, s, e, p } = F;
  e.ai.t = 1e9;
  place(F, 330);
  p.grounded = false; p.y = -150; p.vy = -300; p.setState('air');
  F.run(0.4);
  assert.ok(F.started.includes('kunai'), `a kunai at the jumper (started: ${F.started.join(',')})`);
  const G = fight('tsugumi', false);
  G.e.ai.t = 1e9;
  place(G, 150);
  G.p.grounded = false; G.p.y = -150; G.p.vy = -300; G.p.setState('air');
  G.run(0.4);
  assert.ok(G.started.includes('tw3_up'), `the rising knife at a close jumper (started: ${G.started.join(',')})`);
  // a flurry: Kage has swung ten times in four seconds; the blow lands on crossed knives or on empty air, never on her
  const H = fight('tsugumi', true, 5);
  place(H, 120);
  H.s.hitLog = Array.from({ length: 10 }, (_, i) => ({ id: 'k1', t: H.s.time - i * 0.3, hit: false }));
  const ehp = H.e.hp;
  let blocked = 0, dashed = 0;
  H.sure(() => { H.p.startMove('k1', H.s); H.run(0.5, () => { if (H.e.state === 'dash') dashed++; if (H.e.state === 'block') blocked++; }); });
  assert.equal(H.e.hp, ehp, 'the flurry cut nothing');
  assert.ok(blocked > 0 || dashed > 0, 'she crossed her knives or was gone');
});

test('tsugumi: against a wall with Kage on her she vanishes in the smoke (Courier Step); in the open she does not', () => {
  const F = fight('tsugumi', false);
  const { S, s, e, p } = F;
  const ran = [];
  const run0 = S.BOSS_ABILITIES.courierStep.run; S.BOSS_ABILITIES.courierStep.run = function (...a) { ran.push(1); return run0.apply(this, a); };
  place(F, 130); e.x = s.bounds.l + 40; p.x = e.x + 130; e.ai.cds.courierStep = 0;
  F.sure(() => S.FIGHT_STYLES.tsugumi.decide(e.ai, p, 130, 1));
  assert.equal(ran.length, 1, 'cornered: the smoke');
  const G = fight('tsugumi', false);
  const run1 = G.S.BOSS_ABILITIES.courierStep.run; let n = 0; G.S.BOSS_ABILITIES.courierStep.run = function (...a) { n++; return run1.apply(this, a); };
  place(G, 130); G.e.x = 0; G.p.x = 130; G.e.ai.cds.courierStep = 0;
  G.sure(() => G.S.FIGHT_STYLES.tsugumi.decide(G.e.ai, G.p, 130, 1));
  assert.equal(n, 0, 'in the open: she steps out the other way instead');
});

test('sayo: a cut she has seen before is turned aside on the beat, and the answer comes a beat later (a parry of it is possible)', () => {
  const F = fight('sayo', true);
  const { S, s, e, p } = F;
  place(F, 110);
  let deflected = false;
  F.sure(() => {
    e.ai.syoLast = ['k1'];   // she has seen this cut
    p.startMove('k1', s);
    F.run(0.5, () => { if (p.deflected) deflected = true; });
  });
  assert.ok(e.stats.parries >= 1, 'she parried it');
  assert.ok(deflected, 'Kage is deflected');
  assert.ok(100 - p.guard >= S.BUDO.posture.playerParried * 0.9, `and loses posture (${100 - p.guard})`);
  // the answer is not a reflex: it is out of the parry a beat later, and it is her counter cut
  const G = fight('sayo', true);
  place(G, 110);
  let parryT = null, kcT = null;
  const sm = G.e.startMove;
  G.e.startMove = (mid, w, o) => { const ok = sm(mid, w, o); if (ok && mid === 'kc' && kcT == null) kcT = G.s.time; return ok; };
  G.sure(() => {
    G.e.ai.syoLast = ['k1']; G.p.startMove('k1', G.s);
    G.run(1.0, () => { if (parryT == null && G.e.stats.parries > 0) parryT = G.s.time; });
  });
  assert.ok(G.started.includes('kc'), `the counter cut (started: ${G.started.join(',')})`);
  assert.ok(kcT - parryT >= 0.12, `a beat after the parry, not instantly (${(kcT - parryT).toFixed(2)} s)`);
});

test('sayo: Slow Hand cuts late (a guard raised on the tell has held too long), and the overhead follows on the guard', () => {
  const F = fight('sayo', true);
  const { S, s, e, p } = F;
  place(F, 110);
  S.BOSS_ABILITIES.sayoSlowHand.run(e, s, e.ai, p);
  assert.ok(e.telegraph > 0.25, 'the tell is long');
  let cutAt = null, t = 0, start = 0;
  F.run(1.4, () => { t += DT; if (cutAt == null && e.state === 'move' && e.move && e.move.id === 'k1') { cutAt = t; start = e.mdur[0]; } });
  assert.ok(cutAt != null, 'the cut comes');
  assert.ok(start >= 0.42, `held a beat longer than a normal start-up (${start.toFixed(2)})`);
  // against a guard held since the tell the cut is only blocked, and the overhead follows
  const G = fight('sayo', true);
  place(G, 110);
  G.S.BOSS_ABILITIES.sayoSlowHand.run(G.e, G.s, G.e.ai, G.p);
  G.S.InputManager.virtualDown('block');
  G.run(1.6);
  G.S.InputManager.virtualUp('block');
  assert.ok(G.started.includes('k1_down'), `the overhead onto the guard (started: ${G.started.join(',')})`);
  assert.ok(G.e.stats.parries === 0 && G.p.stats.parries === 0, 'a guard held that long is not a parry');
});

test('utsushi: Stolen Moon throws a slow crescent that a blade breaks; each stolen form has its own tell', () => {
  const F = fight('utsushi', true);
  const { S, s, e, p } = F;
  place(F, 420);
  S.BOSS_ABILITIES.utsushiMoon.run(e, s, e.ai, p);
  assert.ok(e.telegraph >= 0.4, 'a long tell');
  let cr = null;
  F.run(1.2, () => { if (!cr) cr = s.projectiles.find(x => x.type === 'crescent'); });
  assert.ok(cr, 'the crescent is thrown');
  assert.ok(Math.abs(cr.vx) <= 600, 'slower than the rage art (980)');
  assert.ok(cr.d.deflect, 'and one a blade breaks');
  const B = fight('utsushi', true);
  place(B, 420);
  const c2 = B.S.WeaponSystem.spawn(B.s, 'crescent', B.e, { dmg: 9 });
  c2.d = Object.assign({}, c2.d, { deflect: 1 });
  c2.x = B.p.x - 200; c2.vx = 560; c2.y = B.p.y - 110;
  B.p.startMove('k1', B.s);
  B.run(0.3);
  assert.ok(c2.dead || !B.s.projectiles.includes(c2), 'a swing of the blade breaks the crescent');
  // three stolen forms, three different tells: the crescent's half-circle, the blink's floor mark, the fang's glints
  const tells = new Set();
  for (const [ab, label] of [['utsushiMoon', 'moon'], ['stolenBlink', 'blink'], ['stolenFang', 'fang']]) {
    const G = fight('utsushi', true);
    place(G, ab === 'stolenFang' ? 150 : 420);
    const texts = [];
    const pt = G.s.fx.popText.bind(G.s.fx); G.s.fx.popText = (f, t, c) => { texts.push(t); return pt(f, t, c); };
    G.S.BOSS_ABILITIES[ab].run(G.e, G.s, G.e.ai, G.p);
    G.run(0.2);
    assert.ok(G.e.telegraph > 0.15 || G.e.state === 'ability', `${ab} telegraphs`);
    tells.add(texts.join('|'));
  }
  assert.equal(tells.size, 3, 'three different calls');
});

test('kasane: the Ledger Chain is spun first, then thrown; a clean hit pulls Kage in and the reap that follows is a critical', () => {
  const F = fight('kasane', true);
  const { S, s, e, p } = F;
  place(F, 230);
  S.BOSS_ABILITIES.kasaneChain.run(e, s, e.ai, p);
  assert.ok(e.telegraph >= 0.4, 'a long spin first');
  F.run(0.3);
  assert.ok(!F.started.includes('h2'), 'not yet thrown');
  let crit = null;
  let near = 999;
  F.run(1.6, () => { near = Math.min(near, Math.abs(p.x - e.x)); if (s.lastCrit && s.lastCrit.att === e) crit = crit || s.lastCrit; });
  assert.ok(F.started.includes('h2'), 'then the weight is thrown');
  assert.ok(near < 200, `Kage was hauled in (closest ${near | 0})`);
  assert.ok(F.started.includes('h3'), 'and the sickle reaps');
  assert.ok(crit && crit.why === 'style', 'the reap on a man he has pulled in is a critical');
});

test('kasane: a guard held against the chain is entangled (dragged in, posture crushed); a parried chain leaves him open', () => {
  const F = fight('kasane', true);
  const { S, s, e, p } = F;
  place(F, 230);
  p.setState('block'); p.blockT = 1;   // a guard held, not a parry
  S.InputManager.virtualDown('block');
  e.startMove('h2', s);
  let least = 100;
  F.run(1.0, () => { least = Math.min(least, p.guard); });
  S.InputManager.virtualUp('block');
  assert.ok(least <= 100 - 24, `Kage's posture was crushed (${least})`);
  assert.ok(Math.abs(p.x - e.x) < 200, `and he was dragged in (gap ${Math.abs(p.x - e.x) | 0})`);
  assert.ok(F.started.includes('h3'), 'the reap follows the entanglement');
  // parried: the warden loses far more posture than a plain parry
  const G = fight('kasane', true);
  place(G, 180);
  G.p.setState('block'); G.p.blockT = 0;
  G.S.Combat.applyHit(G.s, G.e, G.p, G.S.MOVES.h2, 120, -150, 1);
  assert.equal(G.e.state, 'stun', 'parried, he reels');
  const plain = G.S.BUDO.posture.parried.sub * G.S.FIGHT_STYLES.kasane.poise;
  assert.ok(100 - G.e.guard > plain + 25, `posture lost ${100 - G.e.guard} (a plain parry: ${plain})`);
});

for (const id of ['sayo', 'utsushi', 'kasane']) {
  test(`${id}: a flurry (ten cuts in four seconds) is read and parried on the beat`, () => {
    const F = fight(id, true, 7);
    const { s, e, p } = F;
    place(F, 110);
    s.hitLog = Array.from({ length: 10 }, (_, i) => ({ id: 'k1', t: s.time - i * 0.3, hit: false }));
    const ehp = e.hp;
    F.sure(() => { p.startMove('k1', s); F.run(0.5); });
    assert.ok(e.stats.parries >= 1, `${id} turned the cut aside`);
    assert.equal(e.hp, ehp, 'and took nothing');
  });
}
