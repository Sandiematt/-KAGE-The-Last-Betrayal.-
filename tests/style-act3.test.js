'use strict';
// Act III's sub-bosses, Young Rem (the Interlude spar) and Hollow Rem (the Core's last echo) fight in their own schools
// (src/js/41-styles/gonryu.js, shizune.js, moro.js, soma.js, young_rem.js, hollow_rem.js): each has a style, a whole fight
// runs, and each one's signature behaviour happens in a scripted situation.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSim } = require('./helpers/load-sim');

const DT = 1 / 60;
const STAGES = { gonryu: 'act3.sub1', shizune: 'act3.sub2', moro: 'act3.sub3', soma: 'act3.sub4', young_rem: 'interlude.spar', hollow_rem: 'core.echo4' };
const ABILITIES = [['gonryu', 'gonryuShove'], ['shizune', 'shizuneDraw'], ['moro', 'moroSpin'], ['soma', 'somaTwoBeat'], ['hollow_rem', 'remFalseStep']];

// a live fight at the foe's story stage, past the intro. `quiet`: the foe's own decisions are switched off, so a test
// drives one behaviour.
function fight(id, quiet, seed) {
  const S = loadSim({ seed: seed || 11, exports: ['FIGHT_STYLES', 'Budo', 'BUDO', 'PARRY_WINDOW', 'BOSS_ABILITIES', 'MOVES'] });
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
  // every blow that lands on Kage: its move object (the area blows carry their own tags)
  const hits = [];
  const dm = S.Combat.damage.bind(S.Combat);
  S.Combat.damage = (w, att, def, dmg, m, ...r) => { if (def.isPlayer) hits.push(m); return dm(w, att, def, dmg, m, ...r); };
  return { S, s, e, p, run, sure, started, hits };
}
const place = (F, gap) => { const { e, p } = F; e.x = 0; p.x = gap; e.facing = 1; p.facing = -1; e.setState('idle'); p.setState('idle'); e.vx = p.vx = 0; p.invuln = 0; };

test('each of the six has a fighting style with a school', () => {
  const S = loadSim({ seed: 1, exports: ['FIGHT_STYLES'] });
  for (const id of Object.keys(STAGES)) {
    const st = S.FIGHT_STYLES[id];
    assert.ok(st && typeof st.art === 'string' && st.art.length > 2, `${id} has an art`);
    assert.ok(Array.isArray(st.strings) && st.strings.length >= 4, `${id} has its own strings`);
    for (const s of st.strings) for (const step of s.seq) {
      if (step.startsWith('move:')) assert.ok(S.MOVES[step.slice(5)], `${id}: ${step} is a move`);
      if (step.startsWith('ab:')) assert.ok(S.BOSS_ABILITIES[step.slice(3)], `${id}: ${step} is an ability`);
    }
  }
  for (const [id, ab] of ABILITIES) {
    assert.ok(S.BOSS_ABILITIES[ab], `${ab} is registered`);
    assert.ok(S.ENEMIES[id].phases.every(ph => ph.abilities.includes(ab)), `${id} uses ${ab} in every phase`);
  }
  // the story's own signature abilities are kept
  assert.ok(S.ENEMIES.gonryu.phases[0].abilities.includes('gateSmash'));
  assert.ok(S.ENEMIES.shizune.phases[0].abilities.includes('stillReturn'));
  assert.ok(S.ENEMIES.moro.phases[0].abilities.includes('conduitCleave'));
  assert.ok(S.ENEMIES.soma.phases[0].abilities.includes('severingCleave') && S.ENEMIES.soma.phases[1].abilities.includes('severingReturn'));
  assert.equal(S.ENEMIES.young_rem.form, 'rem');
  assert.equal(S.ENEMIES.hollow_rem.form, 'rem');
  assert.equal(S.ENEMIES.hollow_rem.echoOf, 'rem');
});

for (const id of Object.keys(STAGES)) {
  test(`${id}: a fight runs for 60 game seconds without throwing, and the style's strings (or the form) fire`, () => {
    const F = fight(id, false, 3);
    let strings = 0;
    const ts = F.e.ai.tryString.bind(F.e.ai); F.e.ai.tryString = (p, d) => { const ok = ts(p, d); if (ok) strings++; return ok; };
    const sf = F.e.ai.startForm.bind(F.e.ai); F.e.ai.startForm = () => { strings++; sf(); };
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
    assert.ok(F.p.alive, `Kage is alive (the spar cannot be lost; the others are not meant to kill a 5000 hp Kage in a minute)`);
    assert.ok(strings >= 3, `${id} threw its own strings (${strings})`);
  });
}

test('gonryu: a parried swing costs him far more posture than a plain parry, and a second breaks him', () => {
  const F = fight('gonryu', true);
  const { S, s, e, p } = F;
  place(F, 130);
  p.setState('block'); p.blockT = 0;
  S.Combat.applyHit(s, e, p, S.MOVES.m1, 60, -150, 1);
  assert.equal(e.state, 'stun', 'parried, he reels');
  const plain = S.BUDO.posture.parried.sub * S.FIGHT_STYLES.gonryu.poise;
  assert.ok(100 - e.guard > plain + 15, `posture lost ${100 - e.guard} (a plain parry: ${plain})`);
  assert.ok(e.stunT >= 0.8, `and he reels a long time (${e.stunT.toFixed(2)} s)`);
  e.setState('idle'); p.setState('block'); p.blockT = 0;
  S.Combat.applyHit(s, e, p, S.MOVES.m1, 60, -150, 1);
  assert.ok(e.broken, 'the second parry breaks his posture');
});

test('gonryu: the haft shove crushes a held guard, and a blocked swing is a guard-crusher too', () => {
  const F = fight('gonryu', true);
  const { S, s, e, p } = F;
  place(F, 110);
  S.BOSS_ABILITIES.gonryuShove.run(e, s, e.ai, p);
  S.InputManager.virtualDown('block');   // Kage holds his guard through it
  let least = 100;
  F.run(1.2, () => { least = Math.min(least, p.guard); });
  S.InputManager.virtualUp('block');
  assert.ok(100 - least >= 50 || p.broken, `Kage's posture lost ${100 - least}`);
  // one blocked kanabo swing alone takes more than half the guard
  const G = fight('gonryu', true);
  place(G, 130);
  G.p.setState('block'); G.p.blockT = 1;
  G.S.Combat.applyHit(G.s, G.e, G.p, G.S.MOVES.m1, 60, -150, 1);
  assert.ok(G.p.guard <= 100 - 55 * 1 || G.p.broken, `a blocked swing leaves the guard at ${G.p.guard}`);
});

test('shizune: a cut thrown at her is turned aside, and the return comes at a fixed tempo with a glint', () => {
  const F = fight('shizune', true);
  const { S, s, e, p } = F;
  place(F, 120);
  p.startMove('k1', s);
  const ok = F.sure(() => S.FIGHT_STYLES.shizune.respond(e.ai, p, 120, 1, p.move));
  assert.equal(ok, true, 'she answers the cut');
  assert.equal(e.state, 'block');
  // the cut lands on her blade: a deflection
  F.sure(() => S.Combat.applyHit(s, p, e, S.MOVES.k1, 70, -150, -1));
  assert.equal(p.state, 'stun', 'Kage\'s cut is deflected');
  assert.ok(p.deflected);
  assert.ok(e.guard <= 100);
  // the return: a fixed tempo, a glint just before the cut
  const t0 = s.time;
  let cutAt = null, glintAt = null;
  const glint = s.fx.glint; s.fx.glint = (...a) => { if (glintAt == null) glintAt = s.time - t0; return glint.apply(s.fx, a); };
  const dm = S.Combat.damage; S.Combat.damage = (...a) => { if (a[2] === p && cutAt == null) cutAt = s.time - t0; return dm.apply(S.Combat, a); };
  F.run(0.9);
  assert.ok(cutAt != null, 'the return lands on a Kage who did not guard');
  assert.ok(Math.abs(cutAt - 0.42) < 0.14, `at the fixed tempo (${cutAt.toFixed(2)} s)`);
  assert.ok(glintAt != null && glintAt < cutAt && cutAt - glintAt < 0.3, 'after a glint');
  assert.ok(F.hits.some(m => m && m.shReturn), 'it was her return');
});

test('shizune: guarding on the glint parries the return: she reels with her posture cut', () => {
  const F = fight('shizune', true);
  const { S, s, e, p } = F;
  place(F, 120);
  p.startMove('k1', s);
  F.sure(() => S.FIGHT_STYLES.shizune.respond(e.ai, p, 120, 1, p.move));
  F.sure(() => S.Combat.applyHit(s, p, e, S.MOVES.k1, 70, -150, -1));
  const guard0 = e.guard;
  let parried = false;
  const pr = S.Combat.parry; S.Combat.parry = (w, att, def, ...r) => { if (att === e && def === p) parried = true; return pr.call(S.Combat, w, att, def, ...r); };
  F.run(0.9, () => {
    // Kage presses guard as the glint shows (telegraph about to run out), after the recoil allows it
    if (e.telegraph > 0 && e.telegraph < 0.13 && p.state === 'stun') S.InputManager.virtualDown('block');
  });
  S.InputManager.virtualUp('block');
  assert.ok(parried, 'the return is turned back');
  assert.ok(e.guard < guard0 || e.state === 'stun' || e.broken, 'she is hurt for it');
});

test('shizune: the draw from stillness meets a cut begun inside her reach before it is up (a counter-hit critical)', () => {
  const F = fight('shizune', true);
  const { S, s, e, p } = F;
  place(F, 170);
  S.BOSS_ABILITIES.shizuneDraw.run(e, s, e.ai, p);
  F.run(0.25);
  assert.equal(e.state, 'ability', 'she is still, hand on the hilt');
  assert.equal(p.hp, 5000, 'nothing has happened yet');
  p.startMove('k1', s);   // Kage commits
  let crit = null;
  F.run(0.7, () => { if (s.lastCrit && s.lastCrit.att === e) crit = crit || s.lastCrit; });
  assert.ok(p.hp < 5000, 'the draw lands');
  assert.ok(crit, 'as a critical');
  // a Kage who waits her out gets the draw anyway, at where he stands, and she is left with a long recovery
  const G = fight('shizune', true);
  place(G, 380);
  G.S.BOSS_ABILITIES.shizuneDraw.run(G.e, G.s, G.e.ai, G.p);
  G.run(1.8);
  assert.ok(G.e.abil == null && G.hits.length === 0, 'out of her reach the draw whiffs');
});

test('moro: the turn (kaiten) sweeps both sides of him, one way and then the other', () => {
  const F = fight('moro', true);
  const { S, s, e, p } = F;
  place(F, 110);
  S.BOSS_ABILITIES.moroSpin.run(e, s, e.ai, p);
  F.run(0.8);
  assert.ok(F.hits.some(m => m && m.moroSpin === 1), 'the first sweep lands in front');
  // a Kage who slipped behind him gets the second
  const G = fight('moro', true);
  place(G, 110);
  G.S.BOSS_ABILITIES.moroSpin.run(G.e, G.s, G.e.ai, G.p);
  G.run(0.2); G.p.x = G.e.x - 110; G.p.invuln = 0; G.p.vx = 0;
  G.run(0.8);
  assert.ok(G.hits.some(m => m && m.moroSpin === 2), 'the second sweep comes round the other way');
});

test('moro: a sweep that ends with Kage inside the shaft turns into the spin; with Kage out of it, no spin', () => {
  const F = fight('moro', true);
  const { S, s, e, p } = F;
  place(F, 110);
  e.ai.cds.moroSpin = 0;
  S.BOSS_ABILITIES.moroSpinIf.run(e, s, e.ai, p);
  assert.equal(e.state, 'ability', 'Kage is inside: the turn');
  const G = fight('moro', true);
  place(G, 300);
  G.e.ai.cds.moroSpin = 0;
  G.S.BOSS_ABILITIES.moroSpinIf.run(G.e, G.s, G.e.ai, G.p);
  assert.notEqual(G.e.state, 'ability', 'Kage is out of the shaft: nothing');
});

test('soma: the two beats: the second is aimed at where Kage stands, so a man who backs straight away is caught by it', () => {
  const F = fight('soma', true);
  const { S, s, e, p } = F;
  place(F, 200);
  S.BOSS_ABILITIES.somaTwoBeat.run(e, s, e.ai, p);
  // Kage steps straight back after the first beat has started
  F.run(0.6, (i) => { if (i === 40) { p.x = e.x + 340; p.vx = 0; } });
  F.run(1.4);
  assert.ok(F.hits.some(m => m && m.somaBeat === 2), `the second beat finds him (blows: ${F.hits.map(m => m && (m.stamp || m.id)).join(',')})`);
});

test('soma: parry the first beat and the second is never thrown', () => {
  const F = fight('soma', true);
  const { S, s, e, p } = F;
  place(F, 400);   // out of reach of the first beat
  S.BOSS_ABILITIES.somaTwoBeat.run(e, s, e.ai, p);
  F.run(0.25);
  assert.equal(e.state, 'ability');
  S.Combat.parry(s, e, p, { kind: 'weapon', dmg: 1, id: 'x' }, e.x + 100, -100, 1);
  assert.equal(e.state, 'stun', 'parried, he reels');
  assert.equal(e.abil, null, 'and the ability is over');
  p.x = e.x + 150;
  F.run(1.6);
  assert.ok(!F.hits.some(m => m && m.somaBeat === 2), 'no second beat');
});

test('hollow rem: the False Step carries him over Kage to his back, and the cut comes the instant he lands', () => {
  const F = fight('hollow_rem', true);
  const { S, s, e, p } = F;
  place(F, 150);
  S.BOSS_ABILITIES.remFalseStep.run(e, s, e.ai, p);
  F.run(0.7);
  assert.ok(e.x > p.x, `he is past Kage (his x ${e.x | 0}, Kage's ${p.x | 0})`);
  assert.ok(F.started.includes('k1'), 'and the cut comes');
});

test('hollow rem: guarding a cut of his is answered by the cross-up', () => {
  const F = fight('hollow_rem', true);
  const { S, s, e, p } = F;
  place(F, 120);
  e.ai.cds.remFalseStep = 0;
  p.setState('block'); p.blockT = 1;
  // his cut is blocked: the style answers with the leap over the guard
  F.sure(() => S.FIGHT_STYLES.hollow_rem.on.blocked(e.ai, s, p, S.MOVES.k1));
  assert.deepEqual(e.ai.seq, ['ab:remFalseStep'], 'the cross-up is queued');
});

test('young rem: a gentle style: the form and his rising cut are told first, and the spar rules are untouched', () => {
  const F = fight('young_rem', true);
  const { S, s, e, p } = F;
  const st = S.FIGHT_STYLES.young_rem;
  assert.ok(e.ai.form.steps[0].wait >= 0.45, 'the form opens with a held beat');
  const rise = st.strings.find(x => x.seq.includes('move:k2'));
  assert.ok(rise && rise.tell >= 0.4, 'the rising cut has a long tell');
  // the form starts with the eyes flashing
  e.ai.formCd = 0; e.telegraph = 0;
  e.ai.startForm();
  assert.ok(e.telegraph >= 0.45, 'telegraphed');
  // the format is still the spar's: one round, no KO
  const fmt = S.Logic.stageConfig(S.SaveManager.data, 'interlude.spar').format;
  assert.equal(fmt.name, 'spar');
  assert.equal(fmt.preventKO, true);
  // a parry makes him reel a long beat
  place(F, 110);
  p.setState('block'); p.blockT = 0;
  S.Combat.applyHit(s, e, p, S.MOVES.k2, 60, -150, 1);
  assert.equal(e.state, 'stun');
  assert.ok(e.stunT >= 0.6, `he reels (${e.stunT.toFixed(2)} s)`);
});
