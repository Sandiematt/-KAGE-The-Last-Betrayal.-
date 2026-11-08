'use strict';
// Kage's seven shop weapons after the 2026-11-08 redesign: each its own drawing (21-characters/kage/weapons.js), its
// own signature directional cuts and footwork (ARC_STYLES, 11-sword-arcs.js; Kagetsu keeps the katana arcs), Shizuka's
// own iai string with its delayed silent cut, and each its own cinematic rage art (67-rage-arts.js): the world holds
// still through the anticipation, the foe is bound and cut, the finisher lands, and the arena is given back. The foes
// whose arms share a family keep the shared forms and the original one-beat rage arts.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');
const { loadSim } = require('./helpers/load-sim');

const SHOP = ['kagetsu', 'tsubame', 'shizuka', 'onikiri', 'mizuchi', 'yamigama', 'iwakudaki'];
const ARTS = { kagetsu: 'crimsonMoon', tsubame: 'swallowStorm', shizuka: 'silentMoon', onikiri: 'hellSplitter', mizuchi: 'waterDragon', yamigama: 'reaperRequiem', iwakudaki: 'goldenQuake' };
const FORMS = ['fwd', 'up', 'down', 'diagUp', 'diagDown', 'airUp', 'airDown', 'dash'];
const { MOVES, WEAPONS } = loadLogic();

/* ---------------- data ---------------- */

test('each shop weapon has its own rage art, with a name and a description', () => {
  const { SPECIALS } = loadSim({ exports: ['SPECIALS'] });
  const seen = new Set();
  for (const id of SHOP) {
    const art = WEAPONS[id].special;
    assert.equal(art, ARTS[id], `${id}'s rage art`);
    assert.ok(!seen.has(art), `${id}: its rage art is its own`); seen.add(art);
    assert.ok(SPECIALS[art] && SPECIALS[art].name && SPECIALS[art].desc.length > 40, `${art} is described`);
  }
});

test('the foes that share a family keep the original one-beat rage arts', () => {
  assert.equal(WEAPONS.akari_blades.special, 'thousandCuts');
  assert.equal(WEAPONS.raikon_tachi.special, 'mountainSplit');
  assert.equal(WEAPONS.cutter_blade.special, 'crescentMoon');
  assert.equal(WEAPONS.ledger_kusari.special, 'reapersHarvest');
  assert.equal(WEAPONS.gate_kanabo.special, 'earthshatter');
  assert.equal(WEAPONS.vanguard_yari.special, 'dragonLance');
  // boss weapons keep their own
  assert.equal(WEAPONS.raiko_no_tachi.special, 'thunderSwing');
  assert.equal(WEAPONS.kagehira_yurei.special, 'smokeStep');
});

test('Shizuka cuts its own iai string, ending in the sheathe whose silent cut lands a beat later', () => {
  const w = WEAPONS.shizuka;
  assert.deepEqual(w.moves, ['sz1', 'sz2', 'sz3', 'sz4']);
  assert.equal(w.counter, 'szc'); assert.equal(w.air, 'sza');
  for (const k of w.moves) assert.ok(MOVES[k] && MOVES[k].t[0] <= 0.12, `${k} draws quickly`);
  assert.ok(MOVES.sz1.t[0] < MOVES.k1.t[0], 'quicker to draw than Kagetsu');
  assert.ok(MOVES.sz3.multi && MOVES.sz3.multi[0] === 2, 'the thrust pierces twice');
  assert.ok(MOVES.sz4.echo && MOVES.sz4.echo.delay > 0.2, 'the sheathe leaves a delayed cut');
  assert.ok(MOVES.sz4.f.wa > 240, 'the follow-through returns the blade to the scabbard');
  assert.equal(w.base, 'kagetsu', 'its damage is still measured against Kagetsu');
});

test('each shop weapon but Kagetsu cuts its own signature forms; the foes keep the shared ones', () => {
  for (const id of SHOP) {
    const d = WEAPONS[id].dirs;
    assert.deepEqual(Object.keys(d).sort(), FORMS.slice().sort());
    if (id === 'kagetsu') { assert.equal(d.fwd, 'k3_fwd', 'Kagetsu keeps the katana arcs it was authored on'); continue; }
    for (const f of FORMS) assert.equal(d[f], `${id}_${f}`, `${id} ${f}`);
    assert.ok(MOVES[d.fwd].label && MOVES[d.fwd].label !== 'HORIZONTAL SLASH', `${id}: its level cut has its own name`);
  }
  assert.equal(WEAPONS.akari_blades.dirs.fwd, 'tw1_fwd');
  assert.equal(WEAPONS.raikon_tachi.dirs.down, 'c3_down');
  assert.equal(WEAPONS.vanguard_yari.dirs.up, 's2_up');
  assert.equal(WEAPONS.ledger_kusari.dirs.dash, 'h1_dash');
});

test('the signature forms keep every direction rule', () => {
  for (const id of SHOP) {
    const d = WEAPONS[id].dirs, M = k => MOVES[d[k]];
    assert.ok(M('fwd').lunge >= 420, `${id}: the level cut closes the gap`);
    assert.equal(M('fwd').next, WEAPONS[id].moves[1], `${id}: it flows into the string`);
    assert.ok(M('up').up <= -700 && M('up').hop < 0, `${id}: the rising cut launches`);
    assert.ok(M('down').kd && M('down').spike > 0 && M('down').gb >= 55, `${id}: the overhead knocks down and breaks guard`);
    assert.ok(M('diagUp').lunge > 0 && M('diagUp').up < -300 && !M('diagUp').hop, `${id}: the rising diagonal`);
    assert.ok(M('diagDown').lunge > 0 && M('diagDown').kd, `${id}: the kesa diagonal`);
    assert.ok(M('airDown').dive > 0 && M('airUp').up < 0 && M('airUp').hop < 0, `${id}: the air cuts`);
    assert.ok(M('dash').lunge > M('fwd').lunge, `${id}: the dash strike reaches furthest`);
    for (const f of FORMS) for (const k of ['a', 'w', 's', 'f']) { assert.equal(M(f)[k].gk, 1, `${d[f]}.${k} IK`); assert.ok(!M(f)[k].rot, `${d[f]}.${k} never turns the body`); }
    assert.ok(M('up').w.wa < 90 && M('up').s.wa > 150, `${id}: the rising cut starts low and ends high`);
    assert.ok(M('down').w.wa > 180 && M('down').s.wa < 60, `${id}: the overhead starts high and ends low`);
  }
});

test('the weapons differ in pace, reach and mechanics, not only in name', () => {
  const D = id => WEAPONS[id].dirs, M = (id, f) => MOVES[D(id)[f]], start = (id, f) => M(id, f).t[0];
  assert.ok(start('tsubame', 'fwd') < start('kagetsu', 'fwd') && start('kagetsu', 'fwd') < start('onikiri', 'fwd') && start('onikiri', 'fwd') < start('iwakudaki', 'fwd'), 'swallow, katana, cleaver, hammer: ever slower');
  assert.equal(M('tsubame', 'fwd').multi[0], 3, 'Tsubame: three cuts out of each motion');
  assert.ok(M('yamigama', 'fwd').chain >= 200 && M('yamigama', 'fwd').box[2] >= MOVES.h1_fwd.box[2] + 150 && M('yamigama', 'fwd').box[2] > M('kagetsu', 'fwd').box[2] + 100, 'Yamigama: the level cut lashes out on the chain');
  assert.ok(M('yamigama', 'dash').pull, "Yamigama: the dash strike drags the foe in");
  assert.ok(M('onikiri', 'down').shock && M('onikiri', 'down').armor, 'Onikiri: the overhead splits the floor, under armour');
  assert.ok(M('iwakudaki', 'fwd').armor && M('iwakudaki', 'down').shock, 'Iwakudaki: every grounded swing under armour, the overhead quakes');
  assert.equal(M('mizuchi', 'fwd').multi[0], 2, 'Mizuchi: the double thrust');
  assert.ok(M('mizuchi', 'diagDown').low, 'Mizuchi: the undertow takes the legs');
  assert.ok(M('shizuka', 'dash').echo, 'Shizuka: the dash strike leaves a silent cut');
  // footwork
  const { ARC_STYLES } = loadSim({ exports: ['ARC_STYLES'] });
  assert.ok(!ARC_STYLES.kagetsu, 'Kagetsu keeps the reference pace');
  assert.ok(ARC_STYLES.tsubame.move.dash > 1 && ARC_STYLES.iwakudaki.move.dash < 1 && ARC_STYLES.onikiri.move.walk < 1, 'light weapons dart, heavy ones stomp');
});

/* ---------------- drawing ---------------- */

test('each shop weapon draws its own redesigned blade, in every mode', () => {
  const G = loadSim({ exports: ['WEAPON_LOOK', 'KAGE_BLADES', 'twinShape', 'SHAPE', 'drawWeaponShape'] });
  const { recordCtx } = require('./helpers/record-ctx');
  const colors = (log) => new Set(log.ops.filter(o => o.op !== 'image').map(o => o.color));
  const looks = new Set();
  for (const id of SHOP) {
    const look = G.twinShape(G.WEAPONS[id], G.SHAPE[id], 0);
    assert.equal(look, G.WEAPON_LOOK[id]); assert.ok(G.KAGE_BLADES[look], `${id} has a drawing`);
    assert.ok(!looks.has(look)); looks.add(look);
    for (const mode of ['ink', 'flat', 'rim', 'art']) {
      const c = recordCtx(); G.drawWeaponShape(c, look, 90, mode, 1, '#030303', null);
      assert.ok(c.log.ops.length > 0, `${id} draws in ${mode} mode`);
      if (mode === 'flat') assert.deepEqual([...colors(c.log)].filter(x => x !== '#030303'), [], `${id}: one colour on the flat pass`);
    }
  }
  // the foes' arms on the same families keep their own shapes
  assert.equal(G.twinShape(G.WEAPONS.cutter_blade, G.SHAPE.cutter_blade, 0), 'katana');
  assert.equal(G.twinShape(G.WEAPONS.akari_blades, G.SHAPE.akari_blades, 1), 'yurei');
});

/* ---------------- in the fight ---------------- */

// a fight against an Order ironclad with Kage holding `wid`, past the intro, the foe's AI off, `gap` px apart
function fight(wid, gap) {
  const S = loadSim({ seed: 11, exports: ['RageArts', 'RAGE_ARTS'] });
  const save = S.SaveManager.data = S.Logic.defaultSave();
  save.owned.weapons[wid] = 1; save.equipped.weapon = wid;
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const s = new S.FightSession({ mode: 'campaign', enemyId: 'order_ironclad', env: 'highlands', diff: 1, ng: 0 });
  const step = (n) => { for (let i = 0; i < n; i++) { if (s.fx.hitStop > 0) s.fx.update(1 / 60, 0); else { s.step(S.STEP); S.InputManager.endTick(); s.fx.update(1 / 60, 1 / 60); } } };
  for (let i = 0; i < 1200 && s.phase !== 'fight'; i++) step(1);
  const p = s.player, e = s.enemy;
  e.ai.update = function () {};
  p.maxHp = p.hp = 100000; e.maxHp = e.hp = 100000;
  p.x = -(gap || 280) / 2; e.x = (gap || 280) / 2; p.facing = 1; e.facing = -1; p.setState('idle'); e.setState('idle'); p.vx = e.vx = 0;
  step(2);
  return { S, s, p, e, step };
}

for (const wid of SHOP) {
  test(`${wid}'s rage art (${ARTS[wid]}): the world holds, the foe is cut and bound, the finisher lands, the arena comes back`, () => {
    const F = fight(wid, 300), { s, p, e } = F;
    p.rage = 100;
    let fired = null; const os = s.onSpecial; s.onSpecial = function (f, name) { fired = name; return os.apply(this, arguments); };
    const ex = e.x, ehp = e.hp;
    p.doSpecial(s);
    assert.equal(fired, ARTS[wid], 'its own art fires'); assert.equal(p.rage, 0, 'the meter is spent');
    assert.ok(s.rart && s.rart.id === ARTS[wid] && s.rart.cine, 'the cinematic is running');
    // anticipation: the foe holds still and untouched
    F.step(12);
    assert.equal(e.x, ex, 'the foe holds still through the anticipation'); assert.equal(e.hp, ehp, 'no blow lands before the execution');
    assert.ok(p.invuln > 0 && p.rageArt, 'Kage is untouchable through it');
    // execution and finisher
    let maxImpact = 0, hpMid = null;
    for (let i = 0; i < 260 && p.state === 'ability'; i++) { F.step(1); if (s.fx.impact) maxImpact = Math.max(maxImpact, s.fx.impact.tier); if (hpMid == null && e.hp < ehp) hpMid = i; }
    assert.notEqual(p.state, 'ability', 'the art ends');
    const dealt = ehp - e.hp;
    assert.ok(dealt >= 18, `it lands real damage (${dealt.toFixed(1)})`);
    assert.ok(maxImpact >= 3, 'its finisher lands an impact frame');
    assert.ok(!p.rageArt && !s.fx.impactTint, 'the art lets go of Kage and the impact colour');
    F.step(90);
    assert.equal(s.rart, null, 'the arena is given back');
    assert.ok(p.y <= 0 && p.alive && e.alive);
  });
}

test("Shizuka's sheathe: the silent cut lands on its own, a beat after the blade has passed", () => {
  const F = fight('shizuka', 160), { s, p, e, S } = F;
  const hits = [];
  const oh = S.Combat.applyHit; S.Combat.applyHit = function (w, att, def, m) { if (att === p) hits.push({ t: s.time, echo: !!m.echoCut }); return oh.apply(this, arguments); };
  p.startMove('sz4', s);
  F.step(70);
  S.Combat.applyHit = oh;
  const cut = hits.find(h => !h.echo), echo = hits.find(h => h.echo);
  assert.ok(cut, 'the draw cuts'); assert.ok(echo, 'the silent cut opens');
  assert.ok(echo.t - cut.t > 0.2, `a beat later (${(echo.t - cut.t).toFixed(2)} s)`);
});

test('footwork: Tsubame darts further on a dash than Kagetsu, Iwakudaki less', () => {
  const dash = (wid) => { const F = fight(wid, 600); const x0 = F.p.x; F.p.startDash(1, F.s); F.step(14); return F.p.x - x0; };
  const k = dash('kagetsu'), t = dash('tsubame'), i = dash('iwakudaki');
  assert.ok(t > k * 1.1, `tsubame ${t | 0} > kagetsu ${k | 0}`);
  assert.ok(i < k * 0.92, `iwakudaki ${i | 0} < kagetsu ${k | 0}`);
});
