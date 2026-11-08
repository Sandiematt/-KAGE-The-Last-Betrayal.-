'use strict';
// Directional sword arcs (11-sword-arcs.js: W / A / S / D + attack, the diagonals, the dash strike and the air cuts),
// the directional combo, and the spam read (SPAM_READ: every foe, regular enemies, sub-bosses and bosses alike, dodges a
// spammed action to Kage's far side and punishes it).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');
const { openFight } = require('./helpers/spar-pilot');

const { Logic, MOVES, WEAPONS } = loadLogic();
const FORMS = ['fwd', 'up', 'down', 'diagUp', 'diagDown', 'airUp', 'airDown', 'dash'];
const FAMILIES = ['fists', 'tsubame', 'kagetsu', 'onikiri', 'mizuchi', 'yamigama', 'iwakudaki', 'shinsen'];

/* ---------------- data ---------------- */

test('every weapon carries the eight directional cuts of its family', () => {
  for (const [id, w] of Object.entries(WEAPONS)) {
    assert.ok(w.dirs, `${id} has directional cuts`);
    assert.deepEqual(Object.keys(w.dirs).sort(), FORMS.slice().sort(), `${id}: exactly the eight cuts`);
    for (const f of FORMS) {
      const m = MOVES[w.dirs[f]];
      assert.ok(m, `${id} ${f}: ${w.dirs[f]}`);
      assert.equal(m.aim, f);
      assert.equal(m.kind, f === 'airUp' || f === 'airDown' ? 'air' : 'weapon', `${id} ${f} kind`);
    }
  }
});

test('each cut does what its direction says', () => {
  for (const fam of FAMILIES) {
    const d = WEAPONS[fam].dirs, M = k => MOVES[d[k]];
    assert.ok(M('fwd').lunge >= 420, `${fam}: the horizontal slash closes the gap`);
    assert.equal(M('fwd').next, WEAPONS[fam].moves[1], `${fam}: the horizontal slash flows into the string's second hit`);
    assert.ok(M('up').up <= -700 && M('up').hop < 0, `${fam}: the rising slash launches and lifts Kage after the foe`);
    assert.ok(M('down').kd && M('down').spike > 0 && M('down').gb >= 55, `${fam}: the downward slash knocks down, spikes and breaks guard`);
    assert.ok(M('diagUp').lunge > 0 && M('diagUp').up < -300 && !M('diagUp').hop, `${fam}: the rising diagonal travels and pops up, Kage stays down`);
    assert.ok(M('diagDown').lunge > 0 && M('diagDown').kd, `${fam}: the kesa diagonal travels and knocks down`);
    assert.ok(M('airDown').dive > 0, `${fam}: the plunge dives`);
    assert.ok(M('airUp').up < 0 && M('airUp').hop < 0, `${fam}: the air rising cut carries up`);
    assert.ok(M('dash').lunge > M('fwd').lunge, `${fam}: the dash strike reaches furthest`);
  }
});

test('no attack turns the whole body: no spin, no rotation, no squash, in any move', () => {
  for (const [id, m] of Object.entries(MOVES)) {
    assert.ok(!m.rot, `${id} has no whole-body rotation`);
    for (const k of ['a', 'w', 's', 'f']) if (m[k]) assert.ok(!m[k].rot, `${id}.${k} pose has no rot`);
  }
});

test('blade cuts move the hands along the arc (IK) and sweep their hitbox the way the blade travels', () => {
  for (const fam of FAMILIES.filter(f => f !== 'fists')) {
    const d = WEAPONS[fam].dirs;
    for (const f of FORMS) {
      const m = MOVES[d[f]];
      for (const k of ['a', 'w', 's', 'f']) assert.equal(m[k].gk, 1, `${m.id}.${k} drives the hand by IK`);
      assert.ok(m.sweep && m.sweep.length === 2, `${m.id} has a swept hitbox`);
    }
    const top = (id, i) => MOVES[d[id]].sweep[i][1];
    assert.ok(top('up', 1) < top('up', 0), `${fam}: the rising cut's box climbs`);
    assert.ok(top('diagUp', 1) < top('diagUp', 0), `${fam}: the rising diagonal's box climbs`);
    assert.ok(top('down', 1) > top('down', 0), `${fam}: the overhead's box falls`);
    assert.ok(top('diagDown', 1) > top('diagDown', 0), `${fam}: the kesa diagonal's box falls`);
    // the blade's start and end angles: rising cuts end higher than they start, falling cuts lower
    const up = MOVES[d.up], dn = MOVES[d.down];
    assert.ok(up.w.wa < 90 && up.s.wa > 150, `${fam}: the rising cut starts low and ends high`);
    assert.ok(dn.w.wa > 180 && dn.s.wa < 60, `${fam}: the overhead starts high and ends low`);
  }
});

/* ---------------- the spam read rule ---------------- */

const seq = (k, n, gap, t0) => Array.from({ length: n }, (_, i) => ({ k, t: (t0 || 0) + i * (gap || 0.25) }));

test('finishing the weapon string is not spam; one press past its end is', () => {
  const three = seq('weapon', 3);
  assert.equal(Logic.spamRead(three, 0.5, 3), null);
  assert.deepEqual(Logic.spamRead(seq('weapon', 4), 0.75, 3), { key: 'weapon', streak: 4 });
  // Tsubame's five-cut string: six presses
  assert.equal(Logic.spamRead(seq('weapon', 5), 1, 5), null);
  assert.ok(Logic.spamRead(seq('weapon', 6), 1.25, 5));
});

test('punches, kicks, dashes, jumps and a repeated directional cut are read too', () => {
  assert.ok(Logic.spamRead(seq('kick', 4), 0.75));
  assert.ok(Logic.spamRead(seq('punch', 4), 0.75));
  assert.ok(Logic.spamRead(seq('dash', 3, 0.45), 0.9));
  assert.equal(Logic.spamRead(seq('dash', 2, 0.45), 0.45), null);
  // a hop, its double jump, a long fall and the next hop: jumps may be further apart than presses
  const hops = [{ k: 'jump', t: 0 }, { k: 'jump', t: 0.33 }, { k: 'jump', t: 1.6 }, { k: 'jump', t: 1.93 }];
  assert.ok(Logic.spamRead(hops, 2));
  assert.equal(Logic.spamRead(hops.slice(0, 3), 1.6), null);
  assert.ok(Logic.spamRead(seq('dir:up', 3, 0.5), 1));
});

test('a pause, a different direction or a different button breaks the streak', () => {
  const paused = seq('weapon', 3).concat([{ k: 'weapon', t: 0.5 + 1.3 }]);
  assert.equal(Logic.spamRead(paused, 1.8, 3), null);
  const mixed = [{ k: 'weapon', t: 0 }, { k: 'dir:up', t: 0.25 }, { k: 'dir:down', t: 0.5 }, { k: 'dir:fwd', t: 0.75 }, { k: 'weapon', t: 1 }, { k: 'kick', t: 1.25 }];
  assert.equal(Logic.spamRead(mixed, 1.25, 3), null);
  assert.equal(Logic.spamRead([{ k: 'grab', t: 0 }, { k: 'grab', t: 0.2 }, { k: 'grab', t: 0.4 }, { k: 'grab', t: 0.6 }], 0.6), null);
  assert.equal(Logic.spamKey(MOVES.k1), 'weapon');
  assert.equal(Logic.spamKey(MOVES.k2_up), 'dir:up');
  assert.equal(Logic.spamKey(MOVES.kunai), 'kunai');
});

/* ---------------- directional input in the real simulation ---------------- */

function firstMove(keys, gap) {
  const F = openFight({ enemyId: 'order_footman' }).ready(gap || 200).freeze();
  const moves = [];
  const orig = F.p.startMove.bind(F.p);
  F.p.startMove = (id, w, o) => { const ok = orig(id, w, o); if (ok) moves.push({ id, facing: F.p.facing }); return ok; };
  for (const k of keys) F.down(k);
  F.run(2); F.tap('weapon'); F.run(30);
  return { moves, F };
}

test('W / S / A / D + attack pick the cut on the screen; A and D cut to that side, turning to face it', () => {
  // the foe is on the right: D is toward him, A turns Kage round to cut to the left
  const cases = {
    '': ['k1', 1], right: ['k3_fwd', 1], left: ['k3_fwd', -1], up: ['k2_up', 1], block: ['k1_down', 1],
    'up+right': ['k2_diagUp', 1], 'up+left': ['k2_diagUp', -1], 'block+right': ['k1_diagDown', 1], 'block+left': ['k1_diagDown', -1]
  };
  for (const [keys, [want, facing]] of Object.entries(cases)) {
    const { moves } = firstMove(keys ? keys.split('+') : []);
    assert.equal(moves[0].id, want, `${keys || 'neutral'} + attack`);
    assert.equal(moves[0].facing, facing, `${keys || 'neutral'} + attack faces ${facing}`);
  }
});

test('a cut never turns the whole body: the skeleton stays upright through every direction', () => {
  for (const keys of [['right'], ['left'], ['up'], ['block'], ['up', 'right'], ['block', 'left']]) {
    const F = openFight({ enemyId: 'order_footman' }).ready(200).freeze();
    for (const k of keys) F.down(k);
    F.run(2); F.tap('weapon');
    let maxRot = 0, maxTurn = 0;
    F.run(30, () => { if (F.p.state === 'move') { maxRot = Math.max(maxRot, Math.abs(F.p.extraRot), Math.abs(F.p.pose.rot)); maxTurn = Math.max(maxTurn, Math.abs(1 - F.p.turnX)); } });
    assert.ok(maxRot < 1, `${keys.join('+')}: body rotation ${maxRot}`);
    assert.equal(maxTurn, 0, `${keys.join('+')}: no squash`);
    // the hands keep their bone lengths (IK, natural proportions)
    const sk = F.p.sk, arm = Math.hypot(sk.fel.x - sk.shF.x, sk.fel.y - sk.shF.y) + Math.hypot(sk.fha.x - sk.fel.x, sk.fha.y - sk.fel.y);
    assert.ok(Math.abs(arm - 70 * F.p.scale * F.p.build.arms) < 2, `${keys.join('+')}: arm length ${arm}`);
  }
});

test('the double-jump flip still turns the whole body over', () => {
  const F = openFight({ enemyId: 'order_footman' }).ready(300).freeze();
  F.tap('jump'); F.run(16); F.tap('jump');
  let maxRot = 0;
  F.run(24, () => { maxRot = Math.max(maxRot, Math.abs(F.p.extraRot)); });
  assert.ok(maxRot > 90, `the flip rotates (${maxRot})`);
});

test('directional combo: a cut flows into a cut in a new direction, faster and harder; a repeat does not chain', () => {
  const F = openFight({ enemyId: 'order_footman' }).ready(140).freeze();
  F.e.maxHp = F.e.hp = 5000;
  const log = [];
  const orig = F.p.startMove.bind(F.p);
  F.p.startMove = (id, w, o) => { const ok = orig(id, w, o); if (ok) log.push({ id, chain: !!(o && o.chain), step: F.p.dirChain, d0: F.p.mdur[0] }); return ok; };
  F.down('right'); F.run(1); F.tap('weapon'); F.run(3); F.up('right');
  F.run(14); F.down('block'); F.run(1); F.tap('weapon'); F.run(3); F.up('block');
  F.run(40);
  assert.equal(log[0].id, 'k3_fwd');
  assert.equal(log[1].id, 'k1_down', 'the overhead follows the horizontal');
  assert.ok(log[1].chain && log[1].step === 2, 'it chained as the second step of the combo');
  assert.ok(log[1].d0 < MOVES.k1_down.t[0], 'the chained cut skips its anticipation (shorter start-up)');
  // the same direction twice: the second press waits for stance
  const G = openFight({ enemyId: 'order_footman' }).ready(140).freeze();
  G.e.maxHp = G.e.hp = 5000;
  const log2 = []; const o2 = G.p.startMove.bind(G.p);
  G.p.startMove = (id, w, o) => { const ok = o2(id, w, o); if (ok) log2.push({ id, chain: !!(o && o.chain) }); return ok; };
  G.down('up'); G.tap('jump'); G.run(1); G.tap('weapon'); G.run(4); G.up('up');
  G.run(12); G.down('up'); G.run(1); G.tap('weapon'); G.run(4); G.up('up'); G.run(40);
  assert.ok(!log2.slice(1).some(e => e.chain), 'a repeated direction never chains');
});

test('two cuts meeting in flight clash, whatever their directions (each arc full box)', () => {
  for (const [mine, his] of [['fwd', 'fwd'], ['down', 'up'], ['diagDown', 'diagUp'], ['up', 'fwd']]) {
    const F = openFight({ enemyId: 'order_footman' }).ready(180).freeze();
    let clash = 0; const orig = F.s.fx.clashFlare.bind(F.s.fx); F.s.fx.clashFlare = (x, y) => { clash++; orig(x, y); };
    F.p.facing = 1; F.e.facing = -1;
    F.p.startMove(F.p.weapon().dirs[mine], F.s); F.e.startMove(F.e.weapon().dirs[his], F.s);
    // line the two active windows up
    F.e.mt = F.e.mdur[0] - F.p.mdur[0];
    F.run(30);
    assert.equal(clash, 1, `${mine} against ${his}`);
  }
});

test('the downward slash spikes a foe in the air into the floor', () => {
  const F = openFight({ enemyId: 'order_footman' }).ready(130).freeze();
  F.e.maxHp = F.e.hp = 5000;
  F.e.y = -120; F.e.grounded = false; F.e.setState('juggle'); F.e.vy = -100;
  F.down('block'); F.run(1); F.tap('weapon');
  let spiked = false;
  F.run(30, () => { if (F.e.vy > 900) spiked = true; });
  assert.ok(spiked, 'the foe was driven down');
});

test('W + attack is the rising slash, not a jump; in the air W / S + attack rise or plunge', () => {
  const F = openFight({ enemyId: 'order_footman' }).ready(160).freeze();
  const moves = []; const orig = F.p.startMove.bind(F.p);
  F.p.startMove = (id, w, o) => { const ok = orig(id, w, o); if (ok) moves.push(id); return ok; };
  F.down('up'); F.tap('jump'); F.run(1); F.tap('weapon');   // W is both up and jump
  F.run(20);
  assert.equal(moves[0], 'k2_up');
  assert.equal(F.e.state, 'juggle', 'the rising slash launches the foe');
  F.up('up'); F.down('block'); F.tap('weapon'); F.run(40);
  assert.ok(moves.includes('ka_airDown'), 'a down press in the air plunges');
});

test('double tapping toward dashes, and attack out of the dash is the dash strike', () => {
  const F = openFight({ enemyId: 'order_footman' }).ready(420).freeze();
  const moves = []; const orig = F.p.startMove.bind(F.p);
  F.p.startMove = (id, w, o) => { const ok = orig(id, w, o); if (ok) moves.push(id); return ok; };
  F.tap('right'); F.run(5); F.tap('right'); F.run(4);
  assert.equal(F.p.state, 'dash');
  F.tap('weapon'); F.run(40);
  assert.equal(moves[0], 'kc_dash');
});

test('mashing attack runs the string; a direction mid-string branches it', () => {
  const F = openFight({ enemyId: 'order_footman' }).ready(150).freeze();
  const moves = []; const orig = F.p.startMove.bind(F.p);
  F.p.startMove = (id, w, o) => { const ok = orig(id, w, o); if (ok) moves.push(id); return ok; };
  F.run(44, i => { if (i % 14 === 0) F.tap('weapon'); });
  assert.deepEqual(moves.slice(0, 3), ['k1', 'k2', 'k3']);
  F.run(80);
  moves.length = 0;
  F.tap('weapon'); F.run(14); F.down('up'); F.tap('weapon'); F.run(4); F.up('up'); F.run(30);
  assert.deepEqual(moves.slice(0, 2), ['k1', 'k2_up']);
});

/* ---------------- the spam read in the real simulation ---------------- */

// Kage mashes `btn` every `every` frames for `frames` frames against a live foe; returns what the foe did about it
function spam(target, btn, o) {
  o = o || {};
  const F = openFight(target, { difficulty: o.difficulty }).ready(o.gap || 150);
  const out = { reads: 0, punished: 0, crossed: 0, F };
  const s = F.s, orig = s.onSpamPunish.bind(s);
  s.onSpamPunish = (att, def) => { if (def === F.p) out.punished++; orig(att, def); };
  let cd = 0;
  F.run(o.frames || 480, i => {
    if (i % (o.every || 14) === 0) F.tap(btn);
    const c = F.e.ai.cds.spamRead || 0;
    if (c > cd + 1) { out.reads++; out.side0 = out.side0 == null ? Math.sign(F.e.x - F.p.x) : out.side0; out.at = out.at == null ? i : out.at; }
    cd = c;
    if (out.at != null && i === out.at + 24 && Math.sign(F.e.x - F.p.x) !== out.sideBefore) out.crossed++;
    if (out.at == null) out.sideBefore = Math.sign(F.e.x - F.p.x);
  });
  return out;
}

const FOES = [
  ['an Order soldier', { enemyId: 'order_footman' }],
  ['a Hollow', { enemyId: 'hollow_shade' }],
  ['an Act I sub-boss', 'act1.sub1'],
  ['an Act II sub-boss', 'act2.sub1'],
  ['an Act III sub-boss', 'act3.sub1'],
  ['Raikon', 'act1.boss'],
  ['Akari', 'act2.boss'],
  ['Takashi', 'act3.boss'],
  ['a Core echo', 'core.echo1'],
  ['the Witness', 'core.witness']
];

for (const [name, target] of FOES) {
  test(`spamming the attack button against ${name}: it reads the spam, slips to Kage's other side and punishes`, () => {
    const r = spam(target, 'weapon');
    assert.ok(r.reads >= 1, `${name} never read the spam`);
    assert.ok(r.at < 120, `${name} read it late (frame ${r.at})`);
    assert.ok(r.crossed >= 1, `${name} did not end up on Kage's other side`);
    assert.ok(r.punished >= 1, `${name} never landed the punish`);
  });
}

test('dash spam and jump spam are read as well', () => {
  const d = spam('act2.boss', 'dash', { every: 30, gap: 260 });
  assert.ok(d.reads >= 1, 'dash spam read');
  const j = spam('act1.boss', 'jump', { every: 20 });
  assert.ok(j.reads >= 1, 'jump spam read');
});

test('a varied attack never triggers the read', () => {
  const F = openFight('act2.boss').ready(150).freeze();
  let reads = 0;
  const orig = F.e.ai.spamPunish.bind(F.e.ai);
  F.e.ai.spamPunish = (p, read) => { reads++; return orig(p, read); };
  const plan = [[], ['up'], ['block'], ['right'], ['left'], ['block', 'right'], ['up', 'left'], []];
  for (let round = 0; round < 3; round++) for (const keys of plan) {
    for (const k of keys) F.down(k);
    F.run(1); F.tap('weapon'); F.run(3); F.releaseAll(); F.run(40);
    F.e.x = F.p.x + 150; F.e.setState('idle'); F.e.y = 0; F.e.grounded = true;
  }
  assert.equal(reads, 0);
});
