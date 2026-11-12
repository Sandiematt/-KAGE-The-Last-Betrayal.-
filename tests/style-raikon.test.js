'use strict';
// Raikon's and Hollow Raikon's fighting styles (41-styles/raikon.js, 41-styles/hollow_raikon.js), stepped through the
// real simulation: Jigen-ryū's single committed cuts, Ichi no Tachi, Tai-atari, the thunder drum, the Redline counter
// stance, and the echo's stuttering cut.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSim } = require('./helpers/load-sim');

const DT = 1 / 60;
// a live fight on the foe's stage, past the intro; `quiet` switches the foe's own decisions off so a test drives one move
function fight(stage, quiet, seed) {
  const S = loadSim({ seed: seed || 11, exports: ['FIGHT_STYLES', 'Budo'] });
  S.SaveManager.data = S.Logic.defaultSave();
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, stage));
  for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
  const e = s.enemy, p = s.player;
  if (quiet) { e.ai.decide = () => {}; e.ai.tryAbility = () => false; e.ai.respond = () => {}; e.ai.spamPunish = () => false; e.ai.update = () => {}; }
  const run = (sec, each) => { for (let i = 0; i < Math.round(sec * 60); i++) { if (each && each(i) === false) break; s.step(DT); S.InputManager.endTick(); } };
  const place = (gap) => { e.x = 0; p.x = gap; e.facing = 1; p.facing = -1; e.setState('idle'); p.setState('idle'); s.step(DT); };
  return { S, s, e, p, run, place };
}

test('both foes fight in their own school', () => {
  const { S } = fight('act1.boss');
  assert.match(S.FIGHT_STYLES.raikon.art, /Jigen/);
  assert.match(S.FIGHT_STYLES.hollow_raikon.art, /Jigen/);
  assert.notEqual(S.FIGHT_STYLES.hollow_raikon, S.FIGHT_STYLES.raikon, 'the echo has its own, lesser entry');
  for (const id of ['ichiNoTachi', 'taiAtari', 'raikoGaeshi', 'raijinDaiko', 'redlineCounter', 'hollowIchi']) assert.equal(typeof S.BOSS_ABILITIES[id].run, 'function', id);
});

for (const [foe, stage] of [['raikon', 'act1.boss'], ['hollow_raikon', 'core.echo1']]) {
  test(`${foe}: a minute of fighting a Kage who attacks now and then runs without error and uses the style`, () => {
    const F = fight(stage, false, 5), { S, s, e, p } = F;
    let strings = 0;
    const orig = e.ai.tryString.bind(e.ai);
    e.ai.tryString = (pp, d) => { const r = orig(pp, d); if (r) strings++; return r; };
    p.maxHp = p.hp = 5000;
    F.run(60, i => {
      if (s.phase !== 'fight') return false;
      if (i % 50 === 0) { S.InputManager.virtualDown('weapon'); } else if (i % 50 === 2) S.InputManager.virtualUp('weapon');
      if (i % 240 < 120) { S.InputManager.virtualDown(e.x > p.x ? 'right' : 'left'); } else { S.InputManager.virtualUp('right'); S.InputManager.virtualUp('left'); }
    });
    assert.ok(strings >= 3, `${foe} threw its own strings (${strings})`);
    assert.ok(p.hp < p.maxHp, `${foe} struck Kage`);
  });
}

test('Redline Counter: a blow into the settled stance is turned aside and answered by an unblockable critical', () => {
  const F = fight('act1.boss', true), { S, s, e, p } = F;
  e.ai.phase = 1; F.place(150);
  S.BOSS_ABILITIES.redlineCounter.run(e, s, e.ai, p);
  F.run(0.3);
  assert.equal(e.counterStance, true, 'the stance has settled');
  const hp0 = p.hp;
  S.Combat.applyHit(s, p, e, { id: 'k1', kind: 'weapon', dmg: 10, kb: 100, hs: 0.2 }, 70, -120, -1);
  assert.equal(p.state, 'stun', 'Kage\'s cut is turned aside');
  F.run(0.5);
  assert.ok(p.hp < hp0, 'the punish lands');
  assert.equal(s.lastCrit && s.lastCrit.att, e, 'as a critical');
});

test('Redline Counter: a blow already on its way as the stance forms lands as a plain hit', () => {
  const F = fight('act1.boss', true), { S, s, e, p } = F;
  e.ai.phase = 1; F.place(150);
  S.BOSS_ABILITIES.redlineCounter.run(e, s, e.ai, p);
  const hp0 = e.hp;
  S.Combat.applyHit(s, p, e, { id: 'k3', kind: 'weapon', dmg: 10, kb: 100, hs: 0.2, imp: 2 }, 70, -120, -1);
  assert.ok(e.hp < hp0, 'not yet settled: the blow lands');
});

test('Redline Counter left alone is spent: his posture drops and he stands open', () => {
  const F = fight('act1.boss', true), { S, s, e, p } = F;
  e.ai.phase = 1; F.place(400);
  S.BOSS_ABILITIES.redlineCounter.run(e, s, e.ai, p);
  const g0 = e.guard;
  F.run(1.6);
  assert.equal(e.redlineSpent, true, 'the stance is spent');
  assert.equal(e.counterStance, false);
  assert.ok(g0 - e.guard >= 30, `posture drained (${g0} -> ${e.guard})`);
  // a blow on the spent stance drains it further
  const g1 = e.guard;
  S.Combat.applyHit(s, p, e, { id: 'k1', kind: 'weapon', dmg: 6, kb: 100, hs: 0.2 }, 70, -120, -1);
  assert.ok(e.guard < g1 || e.broken, 'struck while spent, the posture goes');
});

test('Ichi no Tachi: parried on the cut, he reels long and loses far more posture than a plain parry', () => {
  const F = fight('act1.boss', true), { S, s, e, p } = F;
  F.place(330);
  S.BOSS_ABILITIES.ichiNoTachi.run(e, s, e.ai, p);
  const W = 0.8 * e.ai.p.windup;
  let raised = false;
  F.run(1.5, () => {
    if (!raised && e.abil && e.abil.t >= W - 0.03) { raised = true; S.InputManager.virtualDown('block'); }
    if (e.state === 'stun') return false;
  });
  S.InputManager.virtualUp('block');
  assert.equal(e.state, 'stun', 'the cut was parried');
  assert.ok(e.stunT > 0.8, `he reels (${e.stunT.toFixed(2)} s left)`);
  assert.ok(e.guard < 60, `a plain parry costs him about 20 posture; this one left ${e.guard.toFixed(0)}`);
});

test('Tai-atari breaks a held guard and the cut follows onto the open body', () => {
  const F = fight('act1.boss', true), { S, s, e, p } = F;
  F.place(130);
  S.InputManager.virtualDown('block');
  F.run(0.4);
  assert.equal(p.state, 'block');
  p.maxHp = p.hp = 1000;
  S.BOSS_ABILITIES.taiAtari.run(e, s, e.ai, p);
  let broke = false;
  F.run(1.2, () => { if (p.broken) broke = true; });
  S.InputManager.virtualUp('block');
  assert.ok(broke, 'the held guard broke');
  assert.ok(p.hp < 1000, 'and the follow-up cut landed');
});

test('Raijin Daiko: a parried beat does not end the drum, the next beat comes', () => {
  const F = fight('act1.boss', true), { S, s, e, p } = F;
  e.ai.phase = 2; F.place(160);
  S.BOSS_ABILITIES.raijinDaiko.run(e, s, e.ai, p);
  const B = 0.62 * Math.max(0.85, e.ai.p.windup);
  let raised = false;
  F.run(1.2, () => {
    if (!raised && e.abil && e.abil.t >= B - 0.13) { raised = true; S.InputManager.virtualDown('block'); }
    if (e.state === 'stun') return false;
  });
  S.InputManager.virtualUp('block');
  assert.equal(e.state, 'stun', 'the first beat was parried');
  assert.equal(e.ai.drumFrom, 1, 'the drum resumes on the second beat');
});

test('a jump-in on Raikon is met by the rising cut, as a critical', () => {
  const F = fight('act1.boss', false, 3), { S, s, e, p } = F;
  e.ai.tryAbility = () => false; e.ai.spamPunish = () => false;
  F.place(190); e.ai.t = 0;
  p.setState('air'); p.grounded = false; p.y = -120; p.vy = -50;
  let rose = false;
  F.run(0.6, () => { if (e.move && e.move.id === 'c2_up') rose = true; });
  assert.ok(rose, 'Kiriage');
  assert.ok(S.FIGHT_STYLES.raikon.crit(e, { grounded: false, state: 'juggle' }, { aim: 'up' }), 'a rising cut on a body in the air is his critical');
});

test('Hollow Raikon\'s Ichi no Tachi stutters: it releases later than Raikon\'s, and lighter', () => {
  const go = (stage, id) => {
    const F = fight(stage, true), { S, s, e, p } = F;
    F.place(330); p.maxHp = p.hp = 1000;
    S.BOSS_ABILITIES[id].run(e, s, e.ai, p);
    let t = 0, at = null;
    F.run(2, () => { t += DT; if (at == null && e.abil && e.abil.go) at = t; });
    return { at, dealt: 1000 - p.hp, unit: e.dmgMul };
  };
  const r = go('act1.boss', 'ichiNoTachi'), h = go('core.echo1', 'hollowIchi');
  assert.ok(r.at && h.at && h.at > r.at + 0.15, `the echo's cut comes later (${r.at.toFixed(2)} vs ${h.at.toFixed(2)})`);
  assert.ok(h.dealt / h.unit < r.dealt / r.unit, 'and lighter');
});
