'use strict';
// Act I's sub-bosses fight in their own schools (src/js/41-styles/kuroe.js, garan.js, hisame.js, shiden.js): each has a
// style, a whole fight runs, and each one's signature behaviour happens in a scripted situation.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSim } = require('./helpers/load-sim');

const DT = 1 / 60;
const STAGES = { kuroe: 'act1.sub1', garan: 'act1.sub2', hisame: 'act1.sub3', shiden: 'act1.sub4' };

// a live fight at the foe's story stage, past the intro. `quiet`: the foe's own decisions are switched off, so a test
// drives one behaviour.
function fight(id, quiet, seed) {
  const S = loadSim({ seed: seed || 11, exports: ['FIGHT_STYLES', 'Budo', 'BUDO', 'PARRY_WINDOW'] });
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
const place = (F, gap) => { const { e, p } = F; e.x = 0; p.x = gap; e.facing = 1; p.facing = -1; e.setState('idle'); p.setState('idle'); e.vx = p.vx = 0; p.invuln = 0; };

test('each Act I sub-boss has a fighting style with a school', () => {
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
  for (const [id, ab] of [['garan', 'garanTsuppari'], ['hisame', 'hisameKocho'], ['shiden', 'shidenBrace']]) {
    assert.ok(S.BOSS_ABILITIES[ab], `${ab} is registered`);
    assert.ok(S.ENEMIES[id].phases.every(ph => ph.abilities.includes(ab)), `${id} uses ${ab} in every phase`);
  }
  // the story's own signature abilities are kept
  assert.ok(S.ENEMIES.kuroe.phases[0].abilities.includes('censure'));
  assert.ok(S.ENEMIES.garan.phases[1].abilities.includes('charge'));
  assert.ok(S.ENEMIES.hisame.phases[0].abilities.includes('lightningCut'));
  assert.ok(S.ENEMIES.shiden.phases[1].abilities.includes('vanguardGuard'));
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

test('kuroe: a cut turned aside by the staff is answered by a thrust (the riposte off his parry)', () => {
  const F = fight('kuroe', true);
  const { S, s, e, p } = F;
  place(F, 150);
  e.ai.block = 0.3; e.setState('block'); e.blockT = 0;
  F.sure(() => S.Combat.applyHit(s, p, e, S.MOVES.k1, 70, -150, -1));
  assert.equal(p.state, 'stun', 'Kage\'s cut is deflected');
  assert.ok(p.deflected);
  F.run(0.4);
  assert.ok(F.started.includes('s1'), `the riposte thrust (started: ${F.started.join(',')})`);
});

test('garan: a parried blow costs him far more posture than a plain parry, and a second breaks him', () => {
  const F = fight('garan', true);
  const { S, s, e, p } = F;
  place(F, 110);
  p.setState('block'); p.blockT = 0;
  S.Combat.applyHit(s, e, p, S.MOVES.pa2, 60, -150, 1);
  assert.equal(e.state, 'stun', 'parried, he reels');
  const plain = S.BUDO.posture.parried.sub * S.FIGHT_STYLES.garan.poise;
  assert.ok(100 - e.guard > plain + 30, `posture lost ${100 - e.guard} (a plain parry: ${plain})`);
  e.setState('idle'); p.setState('block'); p.blockT = 0;
  S.Combat.applyHit(s, e, p, S.MOVES.pa2, 60, -150, 1);
  assert.ok(e.broken, 'the second parry breaks his posture');
});

test('garan: Tsuppari drives four palms into a held guard and crushes posture', () => {
  const F = fight('garan', true);
  const { S, s, e, p } = F;
  place(F, 120);
  F.S.BOSS_ABILITIES.garanTsuppari.run(e, s, e.ai, p);
  S.InputManager.virtualDown('block');   // Kage holds his guard through it
  let least = 100;
  F.run(1.4, () => { least = Math.min(least, p.guard); });
  S.InputManager.virtualUp('block');
  p.guard = least;
  assert.ok(100 - p.guard >= 3 * 24 - 1 || p.broken, `Kage's posture lost ${100 - p.guard}`);
});

test('garan: a guard in front of him is clinched and thrown', () => {
  const F = fight('garan', false);
  const { S, s, e, p } = F;
  place(F, 90);
  e.ai.tryAbility = () => false;
  p.setState('block'); p.st = 2;
  F.sure(() => S.FIGHT_STYLES.garan.decide(e.ai, p, 90, 1));
  let thrown = false;
  F.run(0.6, () => { p.ctrl.blockHeld = true; if (p.state === 'grabbed' || e.state === 'throwing') thrown = true; });
  assert.ok(thrown, 'the clinch catches the guard');
});

test('hisame: chased, she springs over Kage and lands at his back (Kochō), the fans following', () => {
  const F = fight('hisame', true);
  const { S, s, e, p } = F;
  place(F, 200);
  p.setState('run'); p.vx = -400;
  assert.ok(S.BOSS_ABILITIES.hisameKocho.cond(e, s, e.ai, p, 200), 'a running Kage is chasing her');
  S.BOSS_ABILITIES.hisameKocho.run(e, s, e.ai, p);
  p.vx = 0; p.setState('idle');
  F.run(0.6);
  assert.ok(e.x > p.x, `she is past him (her x ${e.x | 0}, his ${p.x | 0})`);
  assert.ok(F.started.includes('tw1'), 'and her fans come round');
});

test('hisame: a flurry is read; the fan turns the cut aside and the counter cut follows', () => {
  const F = fight('hisame', true);
  const { S, s, e, p } = F;
  place(F, 120);
  s.hitLog = Array.from({ length: 10 }, (_, i) => ({ id: 'k1', t: s.time - i * 0.3, hit: false }));
  p.startMove('k1', s);
  const ok = F.sure(() => S.FIGHT_STYLES.hisame.respond(e.ai, p, 120, 1, p.move));
  assert.equal(ok, true, 'the flurry is read');
  assert.equal(e.state, 'block');
  F.run(0.5, () => { e.ai.block = Math.max(e.ai.block, 0); });
  assert.ok(F.started.includes('twc'), `the counter cut (started: ${F.started.join(',')})`);
});

test('shiden: the braced spear meets a rushing Kage with a counter-hit critical; left alone, it lifts', () => {
  const F = fight('shiden', true);
  const { S, s, e, p } = F;
  place(F, 330);
  S.BOSS_ABILITIES.shidenBrace.run(e, s, e.ai, p);
  F.run(0.4);
  assert.equal(e.braced, true, 'the spear is set');
  const hp0 = p.hp;
  let crit = null;
  S.InputManager.virtualDown('left');   // Kage runs onto the point
  F.run(0.8, () => { if (s.lastCrit && s.lastCrit.att === e) crit = crit || s.lastCrit; });
  S.InputManager.virtualUp('left');
  assert.ok(p.hp < hp0, 'the thrust lands');
  assert.ok(crit, 'as a critical');
  // nobody comes: he holds it, then lifts it (the stance ends on its own)
  const G = fight('shiden', true);
  place(G, 330);
  G.S.BOSS_ABILITIES.shidenBrace.run(G.e, G.s, G.e.ai, G.p);
  const php = G.p.hp;
  G.run(2.4);
  assert.equal(G.p.hp, php, 'a Kage who waits is not touched');
  assert.notEqual(G.e.state, 'ability', 'the stance is over');
});
