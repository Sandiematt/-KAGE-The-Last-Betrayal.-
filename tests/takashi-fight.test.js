'use strict';
// Takashi's redesigned fight, stepped through the real simulation (66-takashi.js): the Iron Guard, the golden kunai,
// the Yashiro Titan's blows and the domain, Tenrai: Heaven's Final Judgment.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSim } = require('./helpers/load-sim');

const DT = 1 / 60;
// a live act3.boss fight, past the intro, with Takashi's own decisions switched off so each test drives one move
function fight(hpFrac) {
  const S = loadSim({ seed: 7 });
  S.SaveManager.data = S.Logic.defaultSave();
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'act3.boss'));
  for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
  const e = s.enemy, p = s.player;
  e.ai.decide = () => {}; e.ai.tryAbility = () => false; e.ai.readStrike = () => false; e.ai.formCd = 1e9;
  p.maxHp = p.hp = 1000;
  if (hpFrac != null) { e.hp = e.maxHp * hpFrac; }
  const run = (sec, each) => { for (let i = 0; i < sec * 60; i++) { if (each) each(i); s.step(DT); } };
  return { S, s, e, p, run };
}
// settle into a phase: the phase change and its roar, the titan rising or the domain opening
function settle(F, sec) { F.run(sec || 3); F.e.endAbility(F.s); F.e.setState('idle'); }

test('the Iron Guard: a strike Kage used in his last few moves is parried; a fresh one lands', () => {
  const { S, s, e, p } = fight();
  assert.equal(S.Logic.ironGuardReads(['p1', 'k1', 'p2', 'k1'], 'k1'), true, 'k1 used two moves ago');
  assert.equal(S.Logic.ironGuardReads(['k1', 'p1', 'p2', 'kk', 'ak', 'k1'], 'k1'), false, 'five moves since the last k1');
  assert.equal(S.Logic.ironGuardReads(['k1'], 'k1'), false, 'the first strike is never read');
  e.x = 0; p.x = 120; p.facing = -1; e.facing = 1; s.step(DT);
  assert.equal(e.ironGuard, true, 'phase 1 has the Iron Guard');
  const blow = { id: 'k1', kind: 'weapon', dmg: 10, kb: 100, hs: 0.2 };
  s.history = ['k1', 'p1', 'k1'];
  const hp0 = e.hp;
  S.Combat.applyHit(s, p, e, blow, 60, -120, -1);
  assert.equal(e.hp, hp0, 'the repeated strike was parried');
  assert.equal(p.state, 'stun', 'and Kage reels');
  p.setState('idle'); e.abil = null; e.setState('idle'); e.tkx = null;
  s.history = ['p1', 'k2', 'kk', 'ak', 'k1'];
  // since the deflection duel (41-styles/takashi.js) a varied strike is turned aside at a chance that falls with his
  // posture; with his posture cracking (below the duel's floor) it always lands
  e.guard = 10;
  S.Combat.applyHit(s, p, e, blow, 60, -120, -1);
  assert.ok(e.hp < hp0, 'a varied strike lands');
});

test('golden kunai: a fan of gold kunai; Kunai Execution pins Kage and cuts', () => {
  const F = fight(), { S, s, e, p } = F;
  e.x = 0; p.x = 500;
  S.BOSS_ABILITIES.goldKunai.run(e, s, e.ai, p);
  F.run(0.9);
  // the kunai are thrown by then, and some may already have struck
  const thrown = s.projectiles.filter(q => q.gold).length + (p.hp < p.maxHp ? 1 : 0);
  assert.ok(thrown >= 1, 'gold kunai are in the air or have struck');
  const F2 = fight(), s2 = F2.s, e2 = F2.e, p2 = F2.p;
  e2.x = 0; p2.x = 520; p2.hp = p2.maxHp;
  let pinned = false;
  F2.S.BOSS_ABILITIES.kunaiExecution.run(e2, s2, e2.ai, p2);
  F2.run(2.4, () => { if (p2.state === 'bound') pinned = true; });
  assert.ok(pinned, 'the execution kunai pins him');
  assert.ok(p2.hp <= p2.maxHp - 26 * 0.8, `the execution cut lands (${p2.maxHp - p2.hp} damage)`);
});

test('the Yashiro Titan: he grows, armour rises, and a Titan Slash takes half of Kage\'s health and floors him', () => {
  const F = fight(0.6), { S, s, e, p } = F;
  settle(F);
  assert.ok(e.tk && e.tk.k > 0.95, 'the titan has risen');
  assert.ok(e.scale > e.tk.base * 1.15, 'Takashi has grown');
  assert.ok(e.titanArmor > 0 && e.titanArmor < 1, 'the titan\'s armour');
  assert.equal(e.ironGuard, false);
  e.x = 0; p.x = 380; p.hp = p.maxHp;
  let down = false;
  S.BOSS_ABILITIES.titanSlash.run(e, s, e.ai, p);
  F.run(2.2, () => { if (p.state === 'down') down = true; });
  assert.ok(Math.abs((p.maxHp - p.hp) / p.maxHp - 0.5) < 0.02, `half his health (${p.maxHp - p.hp})`);
  assert.ok(down, 'he is put on the ground');
});

test('Titan Slash is a low sweep: a jump over it clears it', () => {
  const F = fight(0.6), { S, s, e, p } = F;
  settle(F);
  e.x = 0; p.x = 380; p.hp = p.maxHp;
  const W = S.Logic.takashiMove('titanSlash').windup * e.ai.p.windup;
  S.BOSS_ABILITIES.titanSlash.run(e, s, e.ai, p);
  F.run(2.2, i => { if (Math.abs(i / 60 - (W - 0.06)) < 0.5 / 60) { p.ctrl.jumpP = true; p.buf.jump = 0.2; } if (i / 60 > W - 0.06 && i / 60 < W + 0.3 && p.grounded && p.state !== 'down') { p.vy = -930; p.grounded = false; p.setState('air'); } });
  assert.equal(p.hp, p.maxHp, 'the sweep passes under him');
});

test('Heaven Cleaver takes 70% of Kage\'s health on the marked ground; stepping off the mark avoids it', () => {
  const F = fight(0.6), { S, s, e, p } = F;
  settle(F);
  e.x = 0; p.x = 400; p.hp = p.maxHp;
  S.BOSS_ABILITIES.heavenCleaver.run(e, s, e.ai, p);
  F.run(2.6);
  assert.ok(Math.abs((p.maxHp - p.hp) / p.maxHp - 0.7) < 0.02, `70% (${p.maxHp - p.hp})`);
  const G = fight(0.6);
  settle(G);
  G.e.x = 0; G.p.x = 400; G.p.hp = G.p.maxHp;
  const W = G.S.Logic.takashiMove('heavenCleaver');
  G.S.BOSS_ABILITIES.heavenCleaver.run(G.e, G.s, G.e.ai, G.p);
  G.run(2.6, i => { if (i / 60 > W.windup * W.track * G.e.ai.p.windup + 0.05 && i / 60 < W.windup * G.e.ai.p.windup) G.p.x = Math.min(G.p.x + 9, 790); });
  assert.equal(G.p.hp, G.p.maxHp, 'off the mark when it falls');
});

test('the titan\'s other moves all run and hit: Blade Rain, Crushing Grasp, Titan Spear, Domain Pulse', () => {
  for (const id of ['bladeRain', 'crushingGrasp', 'titanSpear', 'domainPulse']) {
    const F = fight(0.6), { S, s, e, p } = F;
    settle(F);
    e.x = 0; p.x = id === 'titanSpear' ? 600 : 360; p.hp = p.maxHp;
    S.BOSS_ABILITIES[id].run(e, s, e.ai, p);
    F.run(3.5);
    assert.ok(p.hp < p.maxHp, `${id} hit a Kage who stood still (${p.maxHp - p.hp})`);
  }
});

test('Tenrai: the domain turns the arena gold behind a shrine, and the divine thunder kills a Kage who does not break it', () => {
  const F = fight(0.3), { s, e, p } = F;
  e.x = 0; p.x = 420;
  let cracked = false;
  F.run(9, () => { if (s.tkCrack) cracked = true; });
  assert.ok(s.tkDomain && s.tkDomain.k > 0.9, 'the golden arena');
  assert.ok(cracked, 'the sword went into the floor and it cracked');
  assert.ok(e.scale > e.tk.base * 1.35, 'he stays huge');
  assert.ok(e.tk.k < 0.05, 'the titan is gone');
  assert.equal(p.alive, false, 'the divine thunder killed him');
});

test('Tenrai: striking him hard enough during the channel breaks the domain and leaves him reeling', () => {
  const F = fight(0.3), { S, s, e, p } = F;
  e.x = 0; p.x = 420;
  let broke = false;
  F.run(9, () => {
    const c = s.tkCrack;
    if (c && !c.done && c.t > 0.5 && c.dealt < c.need) S.Combat.damage(s, p, e, 8, { imp: 1 }, e.x, -120, -1, 1);
    if (c && c.done && c.dealt >= c.need) broke = true;
  });
  assert.ok(broke, 'the domain broke');
  assert.equal(p.alive, true, 'no thunder fell');
  F.run(4);
  assert.equal(s.tkDomain, null, 'the golden arena is gone: the fortress is back');
  assert.ok(e.scale < e.tk.base * 1.05, `he is back to his own size (${(e.scale / e.tk.base).toFixed(2)}x)`);
});
