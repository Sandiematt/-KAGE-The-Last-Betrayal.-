'use strict';
// Akari's fighting style (41-styles/akari.js) and her Hollow echo's (41-styles/hollow_akari.js), stepped through the
// real simulation: Kasumi-ryū ninjutsu, the crossing step to his back, Kawarimi against a repeated move, the leg sweep
// under a held guard, a thin posture that breaks when she is parried or caught landing, and the echo's misplaced step.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSim } = require('./helpers/load-sim');

const DT = 1 / 60;
// a live fight at the foe's stage, past the intro, with its own decisions switched off so each test drives one move
function fight(stage, o) {
  o = o || {};
  const S = loadSim({ seed: o.seed || 11, exports: ['FIGHT_STYLES', 'Budo', 'BUDO', 'AKARI_STYLE', 'AIController'] });
  S.SaveManager.data = S.Logic.defaultSave();
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, stage));
  for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
  const e = s.enemy, p = s.player;
  if (!o.live) { e.ai.decide = () => {}; e.ai.tryAbility = () => false; e.ai.respond = () => {}; e.ai.formCd = 1e9; }
  p.maxHp = p.hp = 1000;
  const run = (sec, each) => { for (let i = 0; i < sec * 60; i++) { if (each) each(i); s.step(DT); } };
  // Math.random inside the simulation: pinned low (every chance() passes) while `fn` runs
  const lucky = fn => { const n = S.rng.next; S.rng.next = () => 0.001; try { return fn(); } finally { S.rng.next = n; } };
  return { S, s, e, p, run, lucky };
}
const place = (F, ex, px) => { F.e.x = ex; F.p.x = px; F.e.facing = Math.sign(px - ex); F.p.facing = -F.e.facing; F.e.setState('idle'); F.p.setState('idle'); };

test('Akari and her Hollow echo each have their own style with an art', () => {
  const { S } = fight('act2.boss');
  const a = S.FIGHT_STYLES.akari, h = S.FIGHT_STYLES.hollow_akari;
  assert.ok(a && a.art && /ninjutsu/i.test(a.art), 'Akari: Kasumi-ryū ninjutsu');
  assert.ok(h && h.art && h !== a, 'the echo does not inherit the full boss style');
  assert.ok(a.poise > 1 && h.poise > 1, 'both have a thin posture: they slip blows, they do not stand under them');
  assert.ok(a.tune.block < 0.1, 'Akari hardly ever blocks');
  assert.ok(a.strings.some(x => x.seq.some(st => st.startsWith('wait:'))), 'a flurry with a delayed beat');
});

for (const [id, stage] of [['akari', 'act2.boss'], ['hollow_akari', 'core.echo2']]) {
  test(`a 60-second fight against ${id} runs without throwing`, () => {
    const F = fight(stage, { live: true });
    F.p.maxHp = F.p.hp = 1e6;
    F.e.maxHp = F.e.hp = 1e6;
    const { S, s, p } = F;
    // Kage presses the weapon every so often and holds guard for a while, so her answers to both run
    F.run(60, i => {
      if (i % 40 === 0) { S.InputManager.virtualDown('weapon'); } else if (i % 40 === 2) S.InputManager.virtualUp('weapon');
      if (i % 300 === 150) S.InputManager.virtualDown('block'); else if (i % 300 === 260) S.InputManager.virtualUp('block');
      S.InputManager.endTick();
    });
    assert.ok(s.enemy.alive && p.alive);
  });
}

test('Utsusemi: she crosses through Kage to his back and the cut from behind is a critical', () => {
  const F = fight('act2.boss'), { S, s, e, p } = F;
  place(F, 0, 200);
  S.BOSS_ABILITIES.akariCross.run(e, s, e.ai, p);
  let crit = null;
  F.run(1.4, () => { if (s.lastCrit && s.lastCrit.att === e) crit = s.lastCrit; });
  assert.ok(e.x > p.x, `she ends on his far side (${Math.round(e.x)} vs ${Math.round(p.x)})`);
  assert.ok(p.hp < p.maxHp, 'the back cut landed');
  assert.ok(crit && crit.def === p, 'as a critical');
});

test('a guard raised in time turns the back cut aside', () => {
  const F = fight('act2.boss'), { S, s, e, p } = F;
  place(F, 0, 200);
  S.BOSS_ABILITIES.akariCross.run(e, s, e.ai, p);
  // Kage turns to her as she lands and raises his guard on the glint
  F.run(1.4, () => { if (e.state === 'ability' && e.x > p.x && !p.ctrl.blockHeld && e.telegraph > 0) { p.facing = 1; S.InputManager.virtualDown('block'); } S.InputManager.endTick(); });
  S.InputManager.virtualUp('block');
  assert.ok(p.maxHp - p.hp < 4, `guarded (${(p.maxHp - p.hp).toFixed(1)} chip)`);
});

test('Kawarimi: a move Kage keeps repeating strikes a husk, and she is behind him', () => {
  const F = fight('act2.boss'), { S, s, e, p } = F;
  place(F, 0, 140);
  const id = p.weapon().moves[0];
  s.history = [id, id, id, id, id, id];
  p.startMove(id, s);
  const st = S.FIGHT_STYLES.akari;
  const acted = F.lucky(() => st.respond(e.ai, p, 140, 1, p.move));
  assert.equal(acted, true, 'she answers the repeated move');
  assert.equal(e.state, 'ability');
  assert.ok(e.invuln > 0 && !e.visible, 'the blow finds only the husk');
  const hp0 = e.hp;
  F.run(1.5);
  assert.equal(e.hp, hp0, 'she was never struck');
  assert.ok(e.x > p.x, 'she came out behind him');
  assert.ok(p.hp < p.maxHp, 'and cut');
});

test('Ashibari: the sweep goes under a held guard; a jump clears it', () => {
  const F = fight('act2.boss'), { S, s, e, p } = F;
  place(F, 0, 130);
  S.InputManager.virtualDown('block');
  F.run(0.3, () => S.InputManager.endTick());
  assert.equal(p.state, 'block');
  S.BOSS_ABILITIES.akariSweep.run(e, s, e.ai, p);
  let up = false;
  F.run(1.4, () => { if (p.state === 'juggle') up = true; S.InputManager.endTick(); });
  S.InputManager.virtualUp('block');
  assert.ok(up && p.hp < p.maxHp, 'swept off his feet through the guard');

  const G = fight('act2.boss');
  place(G, 0, 130);
  const W = G.S.AKARI_STYLE.sweep.windup * G.e.ai.p.windup;
  G.S.BOSS_ABILITIES.akariSweep.run(G.e, G.s, G.e.ai, G.p);
  let swept = false;
  G.run(0.5, i => { if (Math.abs(i / 60 - (W - 0.1)) < 0.5 / 60 && G.p.grounded) { G.p.vy = -930; G.p.grounded = false; G.p.setState('air'); } if (G.p.state === 'juggle') swept = true; });
  assert.ok(!swept, 'the sweep passes under a jump');
});

test('her thin posture: two parried fangs break it, and the next blow is a critical', () => {
  const F = fight('act2.boss'), { S, s, e, p } = F;
  place(F, 0, 120);
  const m = S.MOVES.tw1;
  for (let k = 0; k < 2; k++) {
    e.setState('move'); e.move = m;
    S.Combat.parry(s, e, p, m, 60, -120, 1);
    p.setState('idle');
  }
  assert.equal(e.broken, true, 'posture broken');
  assert.equal(e.state, 'stun');
  const c = S.Budo.crit(s, p, e, { id: 'k1', kind: 'weapon', dmg: 8 }, true, false);
  assert.ok(c && c.why === 'broken', 'Kage\'s next blow is a critical');
});

test('caught as she lands, she is thrown off balance: her posture breaks', () => {
  const F = fight('act2.boss'), { S, s, e, p } = F;
  delete e.ai.decide;   // the style's own decide answers the catch
  place(F, 0, 110);
  e.guard = 55; e.setState('land');
  S.Combat.applyHit(s, p, e, { id: 'k1', kind: 'weapon', dmg: 6, kb: 100, hs: 0.3 }, 50, -120, -1);
  let broke = false;
  F.run(0.3, () => { if (e.broken) broke = true; });
  assert.ok(broke, 'kuzushi: the guard broke');
});

test('Hollow Akari\'s step sometimes misplaces it: it lands short, in front of Kage, and cuts nothing', () => {
  const F = fight('core.echo2'), { S, s, e, p } = F;
  place(F, 0, 220);
  F.lucky(() => S.BOSS_ABILITIES.hollowCross.run(e, s, e.ai, p));
  F.run(1.4);
  assert.ok(e.x < p.x, `it is still in front of him (${Math.round(e.x)} vs ${Math.round(p.x)})`);
  assert.ok(Math.abs(p.x - e.x) < 110, 'inside his reach');
  assert.equal(p.hp, p.maxHp, 'no cut');
});

test('the echo is reduced: no Kawarimi, no chain, a slower step than Akari\'s', () => {
  const { S } = fight('core.echo2');
  const lists = S.ENEMIES.hollow_akari.phases.flatMap(x => x.abilities);
  assert.ok(!lists.includes('chainBind') && !lists.includes('akariKawarimi'));
  assert.ok(S.FIGHT_STYLES.hollow_akari.tune.combo[1] < S.FIGHT_STYLES.akari.tune.combo[1]);
  assert.ok(S.BOSS_ABILITIES.hollowCross.cd > S.BOSS_ABILITIES.akariCross.cd);
});

test('the delayed fang: the second blade is held a beat, so an early parry spends itself on air', () => {
  // the gap between the first cut beginning and the second beginning, for a plain two-beat string and for the delayed one
  const gap = (seq, second) => {
    const F = fight('act2.boss'), { e, p } = F;
    place(F, 0, 130);
    e.ai.startSeq(seq);
    const seen = [];
    let last = null;
    F.run(2.5, i => { const id = e.state === 'move' && e.move ? e.move.id : null; if (id && id !== last) seen.push({ id, t: i / 60 }); last = id; p.hp = p.maxHp; });
    const x = seen.find(v => v.id === 'tw1'), y = seen.find(v => v.id === second);
    assert.ok(x && y, `both cuts thrown (${seen.map(v => v.id)})`);
    return y.t - x.t;
  };
  const plain = gap(['move:tw1', 'move:tw2'], 'tw2'), late = gap(['move:tw1', 'wait:0.3', 'move:tw2_diagDown'], 'tw2_diagDown');
  assert.ok(late - plain >= 0.2, `the delayed second fang comes ${(late - plain).toFixed(2)} s later than the plain one (${plain.toFixed(2)} vs ${late.toFixed(2)})`);
});

test('a jump-in is answered from the ground: kunai thrown up at him, the rising fang if he lands on her', () => {
  const F = fight('act2.boss'), { S, s, e, p } = F;
  const st = S.FIGHT_STYLES.akari;
  place(F, 0, 330);
  p.grounded = false; p.setState('air'); p.y = -150; p.vy = -100;
  F.lucky(() => st.decide(e.ai, p, 330, 1));
  assert.equal(e.state, 'ability', 'she answers the jump');
  let thrown = 0;
  F.run(0.9, () => { p.y = -150; p.vy = 0; thrown = Math.max(thrown, s.projectiles.filter(x => x.team !== p.team).length); });
  assert.ok(thrown >= 2, `poisoned kunai in the air (${thrown})`);

  const G = fight('act2.boss');
  place(G, 0, 110);
  G.p.grounded = false; G.p.setState('air'); G.p.y = -120; G.p.vy = 200;
  G.lucky(() => G.S.FIGHT_STYLES.akari.decide(G.e.ai, G.p, 110, 1));
  assert.equal(G.e.state, 'move');
  assert.equal(G.e.move.id, 'tw3_up', 'the rising fang');
});

test('a guard held in front of her is bound by her chain from the second phase on', () => {
  const F = fight('act2.boss'), { S, s, e, p } = F;
  e.ai.phase = 1;
  place(F, 0, 300);
  S.InputManager.virtualDown('block');
  F.run(0.6, () => S.InputManager.endTick());
  assert.equal(p.state, 'block');
  p.st = 1;
  const abil = [];
  const orig = S.BOSS_ABILITIES.chainBind.run;
  S.BOSS_ABILITIES.chainBind.run = function (...a) { abil.push('chainBind'); return orig.apply(this, a); };
  try { F.lucky(() => S.FIGHT_STYLES.akari.decide(e.ai, p, 300, 1)); } finally { S.BOSS_ABILITIES.chainBind.run = orig; S.InputManager.virtualUp('block'); }
  assert.deepEqual(abil, ['chainBind']);
});

test('Hollow Akari: its blink (Hollow Step) can misplace it too', () => {
  const F = fight('core.echo2'), { S, s, e, p } = F;
  place(F, 0, 220);
  F.lucky(() => S.BOSS_ABILITIES.hollowStep.run(e, s, e.ai, p));
  F.run(1.6);
  assert.ok(e.x < p.x && Math.abs(p.x - e.x) < 110, `it came out short, in front of him (${Math.round(e.x)} vs ${Math.round(p.x)})`);
  assert.equal(p.hp, p.maxHp, 'and cut nothing');
});
