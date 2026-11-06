// The gameplay lock (anime redesign, ticket 01): scripted, seeded fights stepped through the real simulation, recorded
// frame by frame. tests/gameplay-lock.test.js compares the recording with tests/snapshots/gameplay-lock.json.
//
// What a frame records (all from simulation state, nothing from drawing): the session phase, every fighter's state,
// move and move phase, pose name, position, velocity, facing, hp, rage, guard, i-frames (invuln), hitstun / stun,
// combo count, the 20 skeleton joints (rounded to 0.1 px), its hitbox and hurtbox; the camera (x, y, zoom) and the
// screen-feel values (shake trauma and offsets, hit-stop, slow motion, zoom punch). Damage, parries, clashes, grabs,
// perfect dodges, KOs, move starts and boss abilities are logged as events.
//
// The frame loop copies Game.loop at a fixed 60 Hz real clock (hit-stop freezes the sim, slow motion stretches it).
// Randomness: Math.random is a seeded stream, reseeded from the fight and frame number at the start of every frame, so
// a random call added or removed in construction or drawing code cannot shift the rest of the fight.
'use strict';
const crypto = require('node:crypto');
const { loadSim } = require('./load-sim');

const SEED = 0x6b616765;   // 'kage'
const SAMPLE_EVERY = 60;   // a readable frame is kept every second; every frame is hashed

// The foes: one of each family, one sub-boss and every main boss, in their own story arena and format.
const FIGHTS = [
  { id: 'order', cfg: { mode: 'campaign', enemyId: 'order_footman', env: 'highlands', diff: 1, ng: 0 }, frames: 1500 },
  { id: 'hollow', cfg: { mode: 'campaign', enemyId: 'hollow_shade', env: 'highlands', diff: 1, ng: 0 }, frames: 1500 },
  { id: 'garan', stage: 'act1.sub2', frames: 1800 },
  { id: 'raikon', stage: 'act1.boss', frames: 2100 },
  { id: 'akari', stage: 'act2.boss', frames: 2100 },
  { id: 'takashi', stage: 'act3.boss', frames: 2100 },
  { id: 'witness', stage: 'core.witness', frames: 2400 }
];

// Player input macros: [frame offset, action, 'down' | 'up' | 'tap'] (a tap is down now, up two frames later).
// `toward` / `away` resolve to left or right against the foe; `rage` fills the rage bar so the special can fire.
const MACROS = {
  punch3: [[0, 'punch', 'tap'], [12, 'punch', 'tap'], [24, 'punch', 'tap'], [36, 'punch', 'tap']],
  weapon3: [[0, 'weapon', 'tap'], [14, 'weapon', 'tap'], [28, 'weapon', 'tap'], [42, 'weapon', 'tap']],
  kickTap: [[0, 'kick', 'tap']],
  kickCharge: [[0, 'kick', 'down'], [42, 'kick', 'up']],
  dashIn: [[0, 'toward', 'down'], [0, 'dash', 'tap'], [10, 'toward', 'up']],
  dashPunch: [[0, 'toward', 'down'], [0, 'dash', 'tap'], [4, 'punch', 'tap'], [10, 'toward', 'up']],
  slide: [[0, 'toward', 'down'], [0, 'dash', 'tap'], [4, 'kick', 'tap'], [10, 'toward', 'up']],
  jumpPunch: [[0, 'jump', 'tap'], [16, 'punch', 'tap'], [30, 'punch', 'tap']],
  jumpKick: [[0, 'toward', 'down'], [0, 'jump', 'tap'], [18, 'kick', 'tap'], [20, 'toward', 'up']],
  jumpWeapon: [[0, 'jump', 'tap'], [16, 'weapon', 'tap'], [32, 'weapon', 'tap']],
  doubleJump: [[0, 'jump', 'tap'], [16, 'jump', 'tap'], [30, 'weapon', 'tap']],
  airDash: [[0, 'jump', 'tap'], [14, 'toward', 'down'], [14, 'dash', 'tap'], [22, 'punch', 'tap'], [24, 'toward', 'up']],
  grab: [[0, 'block', 'down'], [2, 'punch', 'tap'], [6, 'block', 'up']],
  kunai: [[0, 'special', 'tap']],
  special: [[0, 'rage', 'set'], [0, 'special', 'tap']],
  guard: [[0, 'block', 'down'], [36, 'block', 'up']],
  backstep: [[0, 'away', 'down'], [0, 'dash', 'tap'], [10, 'away', 'up']],
  walkBack: [[0, 'away', 'down'], [24, 'away', 'up']],
  launcher: [[0, 'punch', 'tap'], [12, 'punch', 'tap'], [24, 'kick', 'tap'], [40, 'jump', 'tap'], [56, 'punch', 'tap'], [68, 'kick', 'tap']]
};
const ORDER = ['punch3', 'kickCharge', 'weapon3', 'kunai', 'jumpWeapon', 'dashPunch', 'kickTap', 'guard', 'slide', 'jumpPunch', 'special',
  'weapon3', 'grab', 'doubleJump', 'backstep', 'airDash', 'launcher', 'jumpKick', 'dashIn', 'walkBack', 'weapon3', 'punch3'];
const MELEE_RANGE = 150;

const r1 = v => { const n = Math.round(v * 10) / 10; return n === 0 ? 0 : n; };
const r3 = v => { const n = Math.round(v * 1000) / 1000; return n === 0 ? 0 : n; };

function fighterLabel(f) { return f.isPlayer ? 'kage' : `${f.def ? f.def.id : '?'}#${f.uid}`; }

function recordFighter(S, f, box) {
  const sk = {};
  for (const k of S.SK_KEYS) sk[k] = [r1(f.sk[k].x), r1(f.sk[k].y)];
  const hb = f.hitbox(box.a), hu = f.hurtbox(box.b);
  return {
    id: fighterLabel(f), alive: f.alive, vis: f.visible, state: f.state, move: f.move ? f.move.id : null, mphase: f.mphase,
    pose: f.poseName || null, x: r1(f.x), y: r1(f.y), vx: r1(f.vx), vy: r1(f.vy), facing: f.facing,
    hp: r1(f.hp), rage: r1(f.rage), guard: r1(f.guard), invuln: r3(Math.max(0, f.invuln)), hitstun: r3(Math.max(0, f.hitstun)),
    stun: r3(Math.max(0, f.stunT)), combo: f.comboHits, rot: r1(f.bodyRot || 0),
    hit: hb ? [r1(hb.x), r1(hb.y), r1(hb.w), r1(hb.h)] : null, hurt: [r1(hu.x), r1(hu.y), r1(hu.w), r1(hu.h)], sk
  };
}

function recordFrame(S, s, frame, box) {
  const fx = s.fx, c = s.cam;
  return {
    frame, phase: s.phase,
    cam: [r1(c.x), r1(c.y), r3(c.zoom)],
    feel: { trauma: r3(fx.trauma), shake: [r1(fx.shakeX), r1(fx.shakeY), r3(fx.shakeR)], hitStop: r3(Math.max(0, fx.hitStop)), slow: r3(fx.slowScale), punch: r3(fx.zoomPunch) },
    fighters: s.fighters.map(f => recordFighter(S, f, box))
  };
}

const hash = rec => crypto.createHash('sha1').update(JSON.stringify(rec)).digest('hex').slice(0, 10);

// The scripted player: walks in, runs the next macro in ORDER, and guards on the foe's wind-up every other time it sees
// one (a parry when the blow lands inside the window, a block otherwise). A deterministic function of the sim state.
class Pilot {
  constructor(S, s) { this.S = S; this.s = s; this.i = 0; this.macro = null; this.t = 0; this.held = new Set(); this.taps = []; this.threats = 0; this.sawWindup = false; this.wait = 0; }
  dirKeys() { const p = this.s.player, e = this.s.enemy; const toward = e.x >= p.x ? 'right' : 'left'; return { toward, away: toward === 'right' ? 'left' : 'right' }; }
  down(a) { if (!this.held.has(a)) { this.held.add(a); this.S.InputManager.virtualDown(a); } }
  up(a) { if (this.held.has(a)) { this.held.delete(a); this.S.InputManager.virtualUp(a); } }
  releaseAll() { for (const a of [...this.held]) this.up(a); this.taps.length = 0; }
  start(name) { this.macro = MACROS[name]; this.name = name; this.t = 0; this.dir = this.dirKeys(); }
  frame() {
    const s = this.s, p = s.player, e = s.enemy;
    // finish taps
    for (let i = this.taps.length - 1; i >= 0; i--) if (--this.taps[i].n <= 0) { this.up(this.taps[i].a); this.taps.splice(i, 1); }
    if (s.phase !== 'fight') { this.releaseAll(); this.macro = null; return; }
    const dist = Math.abs(e.x - p.x);
    // reactive guard: the foe winds up close by while no macro is running
    const windup = e.alive && ((e.state === 'move' && e.mphase === 0) || (e.state === 'ability' && e.abil && e.abil.t < 0.1)) && dist < 300;
    if (windup && !this.sawWindup) {
      this.threats++;
      if (this.threats % 2 === 1 && !this.macro && p.grounded && p.canAct()) { this.releaseAll(); this.start('guard'); }
    }
    this.sawWindup = windup;
    if (!this.macro) {
      if (this.wait > 0) { this.wait--; return; }
      if (!p.canAct() && p.state !== 'air') return;
      const next = ORDER[this.i % ORDER.length];
      const ranged = next === 'kunai' || next === 'walkBack' || next === 'backstep';
      const k = this.dirKeys();
      if (!ranged && dist > MELEE_RANGE && p.grounded) { this.up(k.away); this.down(k.toward); return; }
      this.up('left'); this.up('right');
      this.i++; this.start(next);
    }
    for (const [at, act, how] of this.macro) {
      if (at !== this.t) continue;
      const a = act === 'toward' ? this.dir.toward : act === 'away' ? this.dir.away : act;
      if (how === 'set') { p.rage = 100; continue; }
      if (how === 'down') this.down(a); else if (how === 'up') this.up(a); else { this.down(a); this.taps.push({ a, n: 2 }); }
    }
    this.t++;
    if (this.t > this.macro[this.macro.length - 1][0] + 3) { this.macro = null; this.wait = 6; }
  }
}

// Run one scripted fight; returns { frames: [hash...], samples: {frame: record}, events: [...] }.
function runFight(spec, opts) {
  const o = opts || {};
  const S = loadSim({ seed: SEED });
  const save = S.SaveManager.data = S.Logic.defaultSave();
  const events = [];
  let frame = 0, s = null;
  const ev = (type, o2) => events.push(Object.assign({ f: frame, type }, o2));
  // log the gameplay events (wrapping, never changing, the real functions)
  const C = S.Combat;
  const wrap = (obj, name, log) => { const orig = obj[name]; obj[name] = function (...a) { const out = orig.apply(this, a); log.call(this, a, out); return out; }; };
  wrap(C, 'damage', ([w, att, def, dmg, m, ix, iy, dir, tier, crit]) => ev('dmg', { att: fighterLabel(att), def: fighterLabel(def), move: m && (m.id || m.stamp || null), dmg: r1(Math.max(1, dmg)), tier: tier == null ? null : tier, crit: !!crit, hp: r1(def.hp) }));
  wrap(C, 'parry', ([w, att, def]) => ev('parry', { att: fighterLabel(att), def: fighterLabel(def) }));
  wrap(C, 'clash', ([w, a, b]) => ev('clash', { a: fighterLabel(a), b: fighterLabel(b) }));
  wrap(C, 'grab', ([w, att, def]) => ev('grab', { att: fighterLabel(att), def: fighterLabel(def), ok: def.state === 'grabbed' }));
  wrap(C, 'perfectDodge', ([w, def, att]) => ev('dodge', { def: fighterLabel(def), att: fighterLabel(att) }));
  wrap(S.Fighter.prototype, 'startMove', function (a, out) { if (out) ev('move', { who: fighterLabel(this), move: a[0] }); });
  for (const [id, a] of Object.entries(S.BOSS_ABILITIES)) if (a && typeof a.run === 'function') wrap(a, 'run', ([f]) => ev('ability', { who: fighterLabel(f), id }));
  // story scenes and the result screen are outside the lock: a scene ends at once, the result is kept
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = r => { s.result = r; };

  const fightNo = FIGHTS.indexOf(spec) + 1;
  S.rng.reseed(SEED ^ (fightNo * 0x9e3779b1));
  const cfg = spec.stage ? S.Logic.stageConfig(save, spec.stage) : Object.assign({}, spec.cfg);
  s = new S.FightSession(cfg);
  // a fighter's clock (idle breathing) starts at a random time: set it from a fresh stream, so randomness that art code
  // might add to fighter construction cannot move it
  S.rng.reseed(SEED + fightNo);
  for (const f of s.fighters) f.time = S.rng.next() * 10;
  if (o.patch) o.patch(S, s);
  wrap(s, 'onKO', ([def, att]) => ev('ko', { def: fighterLabel(def), att: att ? fighterLabel(att) : null }));
  wrap(s, 'onBossPhase', ([f, idx]) => ev('phase', { who: fighterLabel(f), idx }));
  wrap(s, 'onSpecial', ([f, name]) => ev('special', { who: fighterLabel(f), name }));
  // a long-lived, hard-hitting Kage, so every fight runs its full script and reaches the foe's later phases and its KO
  s.player.maxHp = s.player.hp = 100000;
  s.player.dmgMul *= spec.dmgMul || 3;
  const pilot = new Pilot(S, s);
  const box = { a: { x: 0, y: 0, w: 0, h: 0 }, b: { x: 0, y: 0, w: 0, h: 0 } };
  const out = { frames: [], samples: {}, events };
  const STEP = S.STEP, real = 1 / 60;
  let acc = 0;
  for (frame = 0; frame < (o.frames || spec.frames); frame++) {
    S.rng.reseed((SEED + fightNo * 1000003 + frame * 7919) >>> 0);
    if (s.phase !== 'done') {
      pilot.frame();
      // Game.loop, minus drawing, audio and story
      if (s.fx.hitStop > 0) s.fx.update(real, 0);
      else {
        acc += real * s.fx.slowScale;
        let n = 0;
        while (acc >= STEP && n < 5) { s.step(STEP); S.InputManager.endTick(); acc -= STEP; n++; if (s.phase === 'done') break; }
        if (acc > STEP) acc = STEP;
        s.fx.update(real, real * s.fx.slowScale);
      }
    }
    const rec = recordFrame(S, s, frame, box);
    out.frames.push(hash(rec));
    if (frame % SAMPLE_EVERY === 0) out.samples[frame] = rec;
    if (o.onFrame) o.onFrame(rec);
  }
  return out;
}

function recordAll() {
  const fights = {};
  for (const spec of FIGHTS) fights[spec.id] = runFight(spec);
  return fights;
}

// Snapshot file layout: per fight, the frame hashes (60 to a line, one second each), the samples and the events.
function toSnapshot(fights) {
  const out = { about: 'Gameplay lock (anime redesign ticket 01). Regenerate only for an intended gameplay change: UPDATE_SNAPSHOT=1 node --test tests/gameplay-lock.test.js', seed: SEED, fights: {} };
  for (const [id, f] of Object.entries(fights)) {
    const lines = [];
    for (let i = 0; i < f.frames.length; i += 60) lines.push(f.frames.slice(i, i + 60).join(' '));
    out.fights[id] = { frames: f.frames.length, hashes: lines, events: f.events.map(e => JSON.stringify(e)), samples: Object.fromEntries(Object.entries(f.samples).map(([k, v]) => [k, JSON.stringify(v)])) };
  }
  return out;
}
function fromSnapshot(fight) {
  return { frames: fight.hashes.join(' ').split(' '), events: fight.events, samples: Object.fromEntries(Object.entries(fight.samples).map(([k, v]) => [k, JSON.parse(v)])) };
}

module.exports = { FIGHTS, MACROS, runFight, recordAll, toSnapshot, fromSnapshot, SAMPLE_EVERY };
