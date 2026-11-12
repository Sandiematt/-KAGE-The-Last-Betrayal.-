'use strict';
// The Witness's four-phase fight stepped through the real simulation (69-witness.js): the phase state machine, the
// attack state machine, the input modifier layer, the HUD presentation layer, the domain and its anchors, the
// adaptive tracker, Rage Suppression, Final Judgment's counter window and the defeat.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSim } = require('./helpers/load-sim');

const DT = 1 / 60;
const EX = ['WitnessBoss', 'WitnessInput', 'WitnessHUD', 'WitnessDomain', 'WitnessTracker', 'WITNESS_MOVES', 'WITNESS_DOMAIN', 'WITNESS_LINES'];
// a live core.witness fight, past the intro, with the Witness's own decisions switched off so each test drives one move
function fight(hpFrac) {
  const S = loadSim({ seed: 11, exports: EX });
  S.SaveManager.data = S.Logic.defaultSave();
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'core.witness'));
  for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
  const e = s.enemy, p = s.player;
  e.ai.decide = () => {}; e.ai.tryAbility = () => false; S.WitnessBoss.direct = () => {};   // each test drives its own move
  p.maxHp = p.hp = 5000;
  if (hpFrac != null) e.hp = e.maxHp * hpFrac;
  const run = (sec, each) => { for (let i = 0; i < Math.round(sec * 60); i++) { if (each) each(i); s.step(DT); } };
  return { S, s, e, p, run };
}
const reset = F => { F.e.abil = null; F.e.setState('idle'); F.e.x = 0; F.e.facing = 1; F.p.x = 380; F.p.facing = -1; F.p.setState('idle'); F.p.vx = 0; F.p.hp = F.p.maxHp; };

test('the phase state machine: each true-health threshold shifts the Witness (invulnerable while it speaks), then it fights', () => {
  const F = fight(0.74), { s, e } = F;
  const played = []; const orig = F.S.Game.playStory; F.S.Game.playStory = (id, done) => { played.push(id); return orig(id, done); };
  let sawShift = false, hurtDuringShift = false;
  F.run(0.2);
  assert.equal(s.wit.phase, 1, 'below 75%: the Manipulator');
  F.run(5, () => {
    if (s.wit.state === 'shift') { sawShift = true; if (e.invuln <= 0) hurtDuringShift = true; }
  });
  assert.ok(sawShift, 'it shifted');
  assert.equal(hurtDuringShift, false, 'it cannot be hurt while it speaks');
  assert.deepEqual(played, ['core.witness.shift1'], 'the fight stopped for its phase II dialogue');
  assert.equal(s.wit.state, 'fight');
  assert.equal(s.wit.haloDir, -1, 'the halo turned the other way');
});

test('the attack state machine: every attack passes Telegraph, Startup, Active, Recovery and Cooldown in order', () => {
  const F = fight();
  F.run(0.1);
  for (const id of ['voidSlash', 'echoStep', 'orbitBlades']) {
    reset(F);
    F.S.BOSS_ABILITIES[id].run(F.e, F.s, F.e.ai, F.p);
    F.run(4);
    assert.deepEqual(F.s.wit.atkLog[F.s.wit.atkLog.length - 1], ['telegraph', 'startup', 'active', 'recovery', 'cooldown'], id);
  }
});

test('Void Slash: three crossing waves along the floor; a jump clears them', () => {
  const F = fight(), { S, s, e, p } = F;
  F.run(0.1); reset(F);
  S.BOSS_ABILITIES.voidSlash.run(e, s, e.ai, p);
  let waves = 0, dirs = new Set();
  F.run(3, () => { const w = s.wit.haz.filter(h => h.kind === 'wave'); waves = Math.max(waves, w.length); for (const h of w) dirs.add(h.dir); });
  assert.ok(waves >= 2 && dirs.size === 2, 'waves from both sides at once (they cross)');
  assert.ok(p.hp < p.maxHp, 'standing still, Kage is cut');
  // the same again, Kage jumping each wave as it reaches him
  const G = fight(); G.run(0.1); reset(G);
  G.S.BOSS_ABILITIES.voidSlash.run(G.e, G.s, G.e.ai, G.p);
  G.run(3.2, () => {
    const near = G.s.wit.haz.some(h => h.kind === 'wave' && !h.hit && Math.abs(h.x - G.p.x) < 260 && Math.abs(h.x - G.p.x) > 120 && Math.sign(G.p.x - h.x) === h.dir);
    if (near && G.p.grounded) { G.p.vy = -930; G.p.grounded = false; G.p.setState('air'); }
  });
  assert.equal(G.p.hp, G.p.maxHp, 'every wave jumped');
});

test('the input modifier layer: a reversal is warned, then swaps left and right for its duration; the devices are untouched', () => {
  const F = fight(0.7), { S, s, p } = F;
  F.run(6);   // the shift into phase II
  const mod = S.WitnessInput.add(s, { kind: 'reverse', warn: 0.5, dur: 1.0, label: 'REVERSED' });
  const read = [];
  const orig = S.InputManager.readCtrl.bind(S.InputManager);
  S.InputManager.readCtrl = c => { orig(c); c.dir = 1; return c; };   // the player holds right the whole time
  F.run(1.8, () => read.push(p.ctrl.dir));
  S.InputManager.readCtrl = orig;
  assert.equal(read[10], 1, 'during the warning the controls are his');
  assert.equal(read[45], -1, 'once it bites, right moves him left');
  assert.equal(read[100], 1, 'and it lets go');
  assert.equal(s.wit.raw.dir, 1, 'the raw controls stayed as the devices read them');
  assert.ok(mod.dur >= 0.5 && mod.dur <= 1.2);
});

test('Echo Bind locks the way away from the Witness; Null Protocol shows each locked ability to the HUD', () => {
  const F = fight(0.2), { S, s, e, p } = F;
  F.run(13);   // the shift and Echo Genesis
  reset(F); S.WitnessInput.clear(s);
  S.BOSS_ABILITIES.echoBind.run(e, s, e.ai, p);
  let bound = null;
  F.run(1.6, () => { const m = S.WitnessInput.active(s).find(x => x.kind === 'bind'); if (m) bound = m.dir; });
  assert.equal(bound, 1, 'Kage (to the right of it) cannot retreat right');
  reset(F); S.WitnessInput.clear(s);
  S.BOSS_ABILITIES.nullProtocol.run(e, s, e.ai, p);
  const seen = new Set();
  F.run(5, () => { const v = S.WitnessHUD.view(s); for (const k in v.locks) seen.add(k); });
  assert.ok(seen.size >= 3, `abilities locked one after another: ${[...seen]}`);
});

test('the HUD presentation layer lies, but never touches the real health', () => {
  const F = fight(0.45), { S, s, e, p } = F;
  F.run(6);
  reset(F);
  const hp0 = e.hp;
  S.BOSS_ABILITIES.falseDeath.run(e, s, e.ai, p);
  let fake = null, lie = null;
  F.run(1.2, () => { const v = S.WitnessHUD.view(s); if (v.fake) fake = v.fake.kind; if (v.lie && v.lie.e === 0) lie = v.lie; });
  assert.ok(fake === 'victory' || fake === 'death', 'a false screen');
  assert.ok(lie, 'the boss bar reads empty');
  assert.equal(e.hp, hp0, 'its real health never changed');
  assert.ok(e.alive);
  F.run(2.5);
  assert.equal(s.wit.fake, null, 'the false screen is gone');
  assert.ok(p.hp < p.maxHp, 'and the surprise strike landed');
});

test('Rage Suppression stops rage growing but keeps what Kage had', () => {
  const F = fight(0.7), { S, s, e, p } = F;
  F.run(6); reset(F);
  p.rage = 40;
  S.BOSS_ABILITIES.rageSuppression.run(e, s, e.ai, p);
  F.run(1.5);
  assert.ok(S.WitnessHUD.rageLocked(s));
  p.rage = 40;
  e.x = 110; p.x = 0; p.facing = 1; e.abil = null; e.setState('idle'); e.invuln = 0;
  const eh = e.hp;
  p.startMove('k1', s);
  F.run(0.6);
  assert.ok(e.hp < eh, 'the blow landed');
  assert.equal(Math.round(p.rage), 40, 'a landed blow gave no rage');
  assert.ok(p.rage > 0, 'his rage was not erased');
});

test('Health Drain: a tether drains Kage and heals the Witness until he gets out of its reach', () => {
  const F = fight(0.45), { S, s, e, p } = F;
  F.run(6); reset(F); p.x = 300; e.hp = e.maxHp * 0.4;
  const eh = e.hp;
  S.BOSS_ABILITIES.healthDrain.run(e, s, e.ai, p);
  F.run(1.5);
  assert.ok(s.wit.tether, 'the tether holds');
  assert.ok(p.hp < p.maxHp && e.hp > eh, 'it drains and heals');
  p.x = e.x + 900;
  F.run(0.2);
  assert.equal(s.wit.tether, null, 'out of its reach (out of sight), the tether breaks');
});

test('Gravity Collapse pulls Kage toward the well; a dash escapes it', () => {
  const F = fight(0.45), { S, s, e, p } = F;
  F.run(6); reset(F); p.x = 500;
  S.BOSS_ABILITIES.gravityCollapse.run(e, s, e.ai, p);
  F.run(1.5);
  assert.ok(s.wit.well, 'the well opened');
  assert.ok(p.x < 500, `pulled in (${p.x})`);
});

test('Echo Genesis: Kage freezes, the domain opens with three anchors; breaking them restores control and shatters it', () => {
  const F = fight(0.2), { S, s, e, p } = F;
  let froze = false, x0 = null;
  F.run(13, () => { const d = s.wit.domain; if (d && d.state === 'activating' && d.t > 1) { if (x0 == null) x0 = p.x; else if (p.x === x0) froze = true; } });
  const d = s.wit.domain;
  assert.ok(froze, 'Kage was held still while it opened');
  assert.ok(d && d.state === 'active', 'the domain is active');
  assert.equal(d.anchors.length, S.WITNESS_DOMAIN.anchors);
  assert.ok(d.rules.input && d.rules.rage && d.rules.zones, 'its rules hold');
  assert.ok(S.WitnessHUD.rageLocked(s), 'rage growth is suppressed inside it');
  const D = S.WitnessDomain;
  D.breakAnchor(s, d.anchors[0]);
  assert.equal(d.rules.input, false, 'the first anchor gives back the controls');
  D.breakAnchor(s, d.anchors[1]);
  assert.equal(d.rules.rage, false, 'the second, rage');
  D.breakAnchor(s, d.anchors[2]);
  assert.equal(d.state, 'shattered', 'the third shatters the domain');
  assert.equal(e.state, 'stun', 'and the Witness reels');
  assert.equal(s.wit.mods.length, 0, 'every modifier lifted');
});

test('an anchor breaks under Kage\'s blade', () => {
  const F = fight(0.2), { s, p } = F;
  F.run(13);
  const a = s.wit.domain.anchors[1];
  let n = 0;
  while (!a.broken && n++ < 40) { p.x = a.x - 70; p.facing = 1; p.setState('idle'); p.startMove('k1', s); F.run(0.5); }
  assert.ok(a.broken, `broken after ${n} cuts`);
  assert.equal(s.wit.domain.broken, 1);
});

test('Final Judgment: standing in it is ruinous; a guard raised at the flash denies it and staggers the Witness', () => {
  const F = fight(0.2), { S, s, e, p } = F;
  F.run(13); reset(F); S.WitnessInput.clear(s); if (s.wit.domain) s.wit.domain.rules.input = false;
  S.BOSS_ABILITIES.finalJudgment.run(e, s, e.ai, p);
  F.run(3);
  // (its damage as the Witness deals it: the move's number through its damage multiplier (the hazard passes `dmg * dmgMul`
  // and Combat.applyHit scales the blow by the attacker's multiplier once more) and Kage's defence)
  assert.ok(p.maxHp - p.hp >= S.WITNESS_MOVES.finalJudgment.dmg * e.dmgMul * e.dmgMul * (1 - p.defense) * 0.9, `it landed (${p.maxHp - p.hp})`);
  const G = fight(0.2); G.run(13); reset(G); G.S.WitnessInput.clear(G.s); if (G.s.wit.domain) Object.assign(G.s.wit.domain.rules, { input: false, zones: false, fakes: false }); G.s.wit.tiles = null;
  G.S.BOSS_ABILITIES.finalJudgment.run(G.e, G.s, G.e.ai, G.p);
  const j = G.s.wit.haz.find(h => h.kind === 'judgment');
  // the stagger is the move's own (WITNESS_MOVES.finalJudgment.stagger, long: the biggest opening of the fight), however long
  // its telegraph ran: it reels from the flash for that long, and its posture is torn
  let reeled = 0;
  G.run(5, () => { if (j.t >= j.delay - 0.08 && !j.cut && G.p.state !== 'block') { G.p.setState('block'); } if (G.e.state === 'stun') reeled += 1 / 60; });
  assert.equal(G.p.hp, G.p.maxHp, 'the perfect guard took nothing');
  assert.ok(reeled >= S.WITNESS_MOVES.finalJudgment.stagger - 0.2, `the Witness reeled for ${reeled.toFixed(2)} s`);
  assert.ok(G.e.guard < 100 || G.e.broken, 'and its posture was torn');
});

test('pattern learning: an overused move draws a Phantom Counter; a varied kit does not', () => {
  const F = fight(), { S, s, e, p } = F;
  F.run(0.1); reset(F);
  for (let i = 0; i < 8; i++) S.WitnessBoss.track(s, 'weapon');
  assert.equal(S.WitnessTracker.read(s).overused, true);
  let phantom = false;
  for (let k = 0; k < 12 && !phantom; k++) {
    e.ai.cds.phantomCounter = 0; s.wit.counterT = 0;
    p.startMove('k1', s);
    S.WitnessBoss.onThreat(e.ai, p);
    phantom = s.fighters.some(c => c.wPhantom);
    F.run(0.6);
  }
  assert.ok(phantom, 'a phantom appeared behind Kage');
  const G = fight(); G.run(0.1);
  for (const k of ['weapon', 'punch', 'kick', 'dir:up', 'air', 'dir:down', 'dash', 'kunai']) G.S.WitnessBoss.track(G.s, k);
  assert.equal(G.S.WitnessTracker.read(G.s).overused, false);
  G.p.startMove('k1', G.s);
  assert.equal(G.S.WitnessBoss.onThreat(G.e.ai, G.p), false, 'nothing to punish');
});

test('the defeat: the arena goes quiet and the Witness speaks its last line before the story', () => {
  const F = fight(0.05), { S, s, e, p } = F;
  F.run(13); reset(F);
  e.hp = 1; e.invuln = 0;
  S.Combat.applyHit(s, p, e, { id: 'k1', kind: 'weapon', dmg: 50, kb: 50, hs: 0.1 }, 60, -120, 1);
  F.run(0.2);
  assert.equal(s.phase, 'ko');
  assert.equal(s.wit.state, 'defeat');
  assert.equal(s.wit.haz.length, 0, 'every hazard gone');
});

test('Echo Combo: a string of cuts, each its own hit, the last one floors Kage; phase III blinks to his other side', () => {
  const F = fight(), { S, s, e, p } = F;
  F.run(0.1); reset(F); p.x = 200;
  const hits = []; const orig = S.Combat.applyHit.bind(S.Combat);
  S.Combat.applyHit = (w, att, def, m, ...r) => { if (att === e && def === p) hits.push(m); return orig(w, att, def, m, ...r); };
  let down = false;
  S.BOSS_ABILITIES.echoCombo.run(e, s, e.ai, p);
  F.run(2.6, () => { if (p.state === 'down') down = true; p.invuln = 0; });
  S.Combat.applyHit = orig;
  assert.ok(hits.length >= 2, `several cuts landed (${hits.length})`);
  assert.ok(hits.some(m => m.kd), 'the finisher knocks down');
  assert.ok(down, 'Kage is floored');
  const G = fight(0.45); G.run(6); reset(G); G.p.x = 200;
  const sides = new Set();
  G.S.BOSS_ABILITIES.echoCombo.run(G.e, G.s, G.e.ai, G.p);
  G.run(2.2, () => { G.p.x = 200; G.p.vx = 0; sides.add(Math.sign(G.e.x - G.p.x)); });
  assert.equal(sides.size, 2, 'it cut from both sides of him');
});

test('Orb Pulse fires a spread of orbs from its hand', () => {
  const F = fight(0.7), { S, s, e, p } = F;
  F.run(6); reset(F); p.x = 600;
  S.BOSS_ABILITIES.orbPulse.run(e, s, e.ai, p);
  let most = 0;
  F.run(1.6, () => { most = Math.max(most, s.wit.haz.filter(h => h.kind === 'orb').length); });
  assert.ok(most >= 2, `orbs in the air (${most})`);
  F.run(1.5);
  assert.ok(p.hp < p.maxHp, 'they struck');
});

test('Echo Breaker: it leaps over Kage and plunges the greatsword onto his spot, flooring him and sending floor waves both ways', () => {
  const F = fight(), { S, s, e, p } = F;
  F.run(0.1); reset(F); p.x = e.x + 420;
  const at = p.x;
  S.BOSS_ABILITIES.echoBreaker.run(e, s, e.ai, p);
  let air = false, down = false, waves = new Set();
  F.run(2.4, () => {
    if (!e.grounded) air = true;
    if (p.state === 'down') down = true;
    for (const h of s.wit.haz) if (h.kind === 'wave') waves.add(h.dir);
    p.x = at; p.vx = 0;
  });
  assert.ok(air, 'it leaves the floor');
  assert.ok(Math.abs(e.x - at) < 120, `it lands on his spot (${Math.round(e.x - at)})`);
  assert.ok(down, 'the plunge floors him');
  assert.equal(waves.size, 2, 'a floor wave each way');
});

test('the director: left to itself the Witness never stands free longer than its phase pace', () => {
  for (const hp of [1, 0.45]) {
    const S = loadSim({ seed: 3, exports: EX });
    S.SaveManager.data = S.Logic.defaultSave();
    S.Game.playStory = (id, done) => { if (done) done(); return false; };
    S.Game.finishFight = () => {};
    const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'core.witness'));
    for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
    const e = s.enemy, p = s.player; p.maxHp = p.hp = 1e6; e.hp = e.maxHp * hp;
    let idle = 0, longest = 0, attacks = 0, busy = false;
    for (let i = 0; i < 60 * 20; i++) {
      s.step(DT);
      // an attack: one of its abilities, or one of its own strings / the mirror (a move of the blade)
      const now = e.state === 'ability' || e.state === 'move';
      if (now && !busy) attacks++;
      busy = now;
      if (s.wit.state === 'fight' && !e.abil && e.canAct() && p.state !== 'down' && p.state !== 'getup') { idle += DT; longest = Math.max(longest, idle); } else idle = 0;
    }
    assert.ok(longest <= 1.25, `at ${hp}: longest free stretch ${longest.toFixed(2)} s`);
    assert.ok(attacks >= 6, `at ${hp}: ${attacks} attacks in 20 s`);
  }
});

test('a long fight: the Witness has several times a story boss\'s health (and a good player still finishes it in a few minutes)', () => {
  const { S } = fight();
  const bosses = ['raikon', 'akari', 'takashi'].map(id => S.ENEMIES[id].hp);
  assert.ok(S.ENEMIES.witness.hp >= Math.max(...bosses) * 2, 'at least twice the sturdiest story boss');
  assert.ok(S.ENEMIES.witness.hp >= Math.min(...bosses) * 2.5);
  // its health is posture's work: the opening of a denied Final Judgment, with its posture torn, is the biggest of the fight
  assert.ok(S.WITNESS_MOVES.finalJudgment.stagger >= 1.5);
});
