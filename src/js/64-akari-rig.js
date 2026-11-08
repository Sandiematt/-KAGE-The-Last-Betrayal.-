/* KAGE — Akari's scythe rig: a Spine-style skeletal layer that animates her arms and the sakura scythe.

   Bones     shoulders (from the fighter's skeleton) -> the weapon pivot bone (its angle and its offset from the shoulders
             are keyed) -> the weapon bone (the staff, drawn by 21-characters/bosses/akari/scythe.js)
   IK        two constraints: the front hand on the staff above the pivot, the back hand on it below (two-bone solve,
             elbows hanging); a throw frees the back hand to the fighter's own pose
   Clips     keyed timelines (time, angle, pivot x, pivot y) with a cubic-bezier curve into each key, like Spine's curves;
             one-shot clips hold their last key, looping clips wrap
   Controller  an animation state machine reading her real timing: the wind-up while her telegraph runs, each swing
             of a move at the moment the move's numbers (AKARI_MOVES) put it, a crossfade between clips, a recover back
             to the idle carry when a move ends; hurt, block and dash have their own clips
   It is a drawing layer: Fighter.draw swaps the rig's arms and weapon angle into the skeleton for the draw and puts the
   simulation's back afterwards, so combat, hitboxes, the hurtbox and the gameplay lock never see it. It also feeds the
   WebGL energy trail and the sparks and petals off the blade (64-akari-gl.js). */

// angle: degrees in the skeleton's convention (0 hangs down, 90 points forward, 180 up, 270 back); x, y: the pivot's
// offset from the shoulders in body units (x forward, y down); `swing` clips draw the energy trail
const AK_CLIPS = {
  idle:    { loop: 2.4, keys: [[0, 142, 13, 5], [1.2, 149, 14, 3], [2.4, 142, 13, 5]] },
  ready:   { keys: [[0, 170, 10, -2], [0.24, 262, 0, -12, [0.2, 0.9, 0.3, 1]]] },                      // drawn back over the shoulder
  low:     { keys: [[0, 140, 13, 5], [0.3, 38, 10, 16]] },                                              // lowered, guard open
  cross:   { keys: [[0, 150, 12, 2], [0.28, 184, 12, -6]] },                                            // upright before her face
  spin:    { loop: 0.34, keys: [[0, 190, 8, -16, 'linear'], [0.34, -170, 8, -16, 'linear']] },          // twirled overhead
  raise:   { keys: [[0, 170, 10, -2], [0.2, 218, 2, -18]] },
  throw:   { free: true, keys: [[0, 150, 12, 3], [0.2, 212, 4, -8]] },                                  // back hand free to throw
  sweep:   { swing: 1, keys: [[0, 262, 0, -12], [0.05, 190, 14, -6, [0.6, 0, 0.8, 0.5]], [0.11, 95, 24, 3, 'linear'], [0.17, 40, 20, 10, [0.1, 0.6, 0.3, 1]], [0.3, 22, 16, 13, [0.2, 0.8, 0.4, 1]]] },
  rising:  { swing: 1, keys: [[0, 28, 18, 12], [0.06, 70, 24, 6, [0.6, 0, 0.8, 0.5]], [0.12, 150, 18, -8, 'linear'], [0.18, 212, 8, -16, [0.1, 0.6, 0.3, 1]], [0.3, 226, 6, -16]] },
  chop:    { swing: 1, keys: [[0, 218, 2, -18], [0.06, 172, 14, -12, [0.6, 0, 0.8, 0.5]], [0.12, 92, 24, 0, 'linear'], [0.18, 38, 20, 12, [0.1, 0.6, 0.3, 1]], [0.3, 28, 16, 14]] },
  thrust:  { swing: 1, keys: [[0, 128, 4, -2], [0.07, 96, 28, -3, [0.2, 0.9, 0.3, 1]], [0.2, 102, 22, 0]] },
  flurry:  { swing: 1, loop: 0.18, keys: [[0, 262, 4, -10, 'linear'], [0.09, 82, 22, 4, 'linear'], [0.18, -98, 4, -10, 'linear']] },
  hurt:    { keys: [[0, 150, 8, 2], [0.16, 168, 2, 8]] },
  block:   { keys: [[0, 150, 13, 2], [0.12, 172, 18, -6]] },
  drag:    { keys: [[0, 150, 10, 2], [0.14, 300, -6, 8]] }                                              // trailed behind on a dash
};
const AK_EASE = [0.42, 0, 0.58, 1];

// her moves: the clip while each telegraph (wind-up) runs, and the swings after each release, [clip, seconds after it]
const AK_SCHED = {
  twinFang:     { wind: ['ready'], rel: [[['sweep', 0], ['rising', 0.17]]] },
  smokeStep:    { wind: ['ready', 'ready'], rel: [[], [['sweep', 0]]] },
  blink:        { wind: ['ready'], rel: [[]] },
  falseOpening: { wind: ['low', 'ready'], rel: [[], [['chop', 0]]] },
  petalCross:   { wind: ['cross'], rel: [[['sweep', 0], ['rising', 0.1]]] },
  poisonKunai:  { throw: 1 }, shadowFlip: { throw: 1 }, kunaiFan: { throw: 1 }, poisonTrap: { throw: 1 },
  petalStorm:   { wind: ['spin'], rel: [[['chop', 0]]] },
  aerialDive:   { wind: ['ready'], rel: [[['raise', 0], ['chop', 0.82]]] },
  phantomDash:  { wind: ['ready'], rel: [[['thrust', 0.22], ['sweep', 0.5], ['thrust', 0.78]]] },
  thousandCuts: { wind: ['ready'], rel: [[['flurry', 0], ['chop', 0.54]]] },
  petalTornado: { wind: ['spin'], rel: [[['sweep', 0]]] },
  mirrorClones: { wind: ['spin'], rel: [[['sweep', 0]]] },
  demonRequiem: { wind: ['spin'], rel: [[['sweep', 0.3], ['rising', 0.8], ['chop', 1.3], ['throw', 1.65], ['spin', 2.7]]] },
  roar:         { wind: ['raise'], rel: [[['spin', 0]]] },
  // the scythe moves (62b-akari-chain.js): a forward sweep and a rising return; the launch swing, then the staff held
  // out level while the head flies on its chain; the chain whirled overhead and thrown; Petal Burst's raised scythe,
  // the sweep that sends the petals out, and the cut as they burst
  reapingArc:   { wind: ['ready'], rel: [[['sweep', 0], ['rising', 0.2]]] },
  chainReap:    { wind: ['ready'], rel: [[['sweep', 0], ['thrust', 0.12]]] },
  chainBind:    { wind: ['spin'], rel: [[['sweep', 0], ['thrust', 0.12]]] },
  petalBurst:   { wind: ['raise'], rel: [[['raise', 0], ['sweep', 0.8], ['raise', 1.15], ['chop', 4.7]]] }
};
const AK_SCHED_DEFAULT = { wind: ['ready'], rel: [[['sweep', 0]]] };

// a CSS-style cubic bezier easing: x(t) solved by Newton steps, y returned
function _akBezier(c, x) {
  if (c === 'linear') return x;
  const [x1, y1, x2, y2] = c || AK_EASE;
  let t = x;
  for (let i = 0; i < 6; i++) {
    const u = 1 - t, xt = 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t - x;
    const dx = 3 * u * u * x1 + 6 * u * t * (x2 - x1) + 3 * t * t * (1 - x2);
    if (Math.abs(dx) < 1e-5) break;
    t = clamp(t - xt / dx, 0, 1);
  }
  const u = 1 - t;
  return 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t;
}
// sample a clip at time t: { a, x, y }
function akClipSample(clip, t, out) {
  const K = clip.keys, end = K[K.length - 1][0];
  if (clip.loop) t = ((t % clip.loop) + clip.loop) % clip.loop; else t = clamp(t, 0, end);
  let i = 1; while (i < K.length - 1 && K[i][0] < t) i++;
  const k0 = K[i - 1], k1 = K[i], span = Math.max(1e-4, k1[0] - k0[0]), e = _akBezier(k1[4], clamp((t - k0[0]) / span, 0, 1));
  out.a = lerp(k0[1], k1[1], e); out.x = lerp(k0[2], k1[2], e); out.y = lerp(k0[3], k1[3], e);
  return out;
}

const AkariRig = {
  // her sakura scythe is rigged while she stands and fights (not knocked down, dead or ragdolled)
  applies(f) {
    return !!(f && f.sk && f.sk.sh && f.hasWeapon && f.weaponId && f.weaponId() === 'akari_blades' && f.state !== 'dead' && f.state !== 'down' && f.state !== 'juggle');
  },
  // the controller: which clip plays now, from her state, her move and its timing
  _want(f, R) {
    const st = f.state;
    if (st === 'hit' || st === 'stun' || st === 'grabbed') return ['hurt', f.time - (R.hurtT ?? (R.hurtT = f.time))];
    R.hurtT = null;
    if (st === 'block') return ['block', f.time - (R.blockT ?? (R.blockT = f.time))];
    R.blockT = null;
    if (st === 'ability' && f.abil) {
      const a = f.abil, tag = f._akAbil && f._akAbil.abil === a ? f._akAbil : null, S = (tag && AK_SCHED[tag.id]) || AK_SCHED_DEFAULT, tele = f.telegraph || 0;
      if (R.abil !== a) { R.abil = a; R.rel = tele > 0 ? -1 : 0; R.relT = tele > 0 ? null : a.t; R.prevTele = tele; }
      if (R.prevTele > 0 && tele <= 0) { R.rel++; R.relT = a.t; }
      R.prevTele = tele;
      if (S.throw) return ['throw', a.t];
      if (tele > 0) { const w = S.wind[Math.min(S.wind.length - 1, R.rel + 1)]; return [w, a.t - (R.windT && R.windAbil === a && R.windRel === R.rel ? R.windT : (R.windT = a.t, R.windAbil = a, R.windRel = R.rel, a.t))]; }
      const rel = S.rel[Math.min(S.rel.length - 1, Math.max(0, R.rel))] || [], el = a.t - (R.relT ?? a.t);
      let pick = null; for (const sw of rel) if (sw[1] <= el) pick = sw;
      if (pick) return [pick[0], el - pick[1], pick];
      return [S.wind[Math.min(S.wind.length - 1, Math.max(0, R.rel))], 9];   // between release and the first swing: hold the wind-up
    }
    R.abil = null;
    if (st === 'move' && f.move) {
      const d = f.mdur || [0.1, 0.1, 0.1];
      if (f.mphase === 0) return ['ready', f.mt];
      return ['sweep', f.mt - d[0]];
    }
    if (st === 'dash' || Math.abs(f.vx || 0) > 700) return ['drag', f.time - (R.dragT ?? (R.dragT = f.time))];
    R.dragT = null;
    return ['idle', f.time];
  },
  // advance once per simulated frame; returns the pose { a, x, y, free, swing }
  update(f) {
    const R = f._akRig || (f._akRig = { out: { a: 142, x: 13, y: 5, free: false, swing: 0 }, from: { a: 142, x: 13, y: 5 }, cur: null, fadeT: 0, fadeDur: 0, last: -1, s: { a: 0, x: 0, y: 0 } });
    if (R.last === f.time) return R.out;
    R.last = f.time;
    const [name, ct, key] = this._want(f, R), clip = AK_CLIPS[name] || AK_CLIPS.idle, id = name + (key ? ':' + key[1] : '');
    if (R.cur !== id) {
      // crossfade from wherever the pose is: quick into a swing, slower back to the carry
      R.from.a = R.out.a; R.from.x = R.out.x; R.from.y = R.out.y;
      R.fadeT = f.time; R.fadeDur = clip.swing ? 0.035 : name === 'idle' ? 0.26 : 0.1; R.cur = id;
    }
    akClipSample(clip, ct, R.s);
    const k = R.fadeDur > 0 ? clamp((f.time - R.fadeT) / R.fadeDur, 0, 1) : 1, e = k * k * (3 - 2 * k);
    let da = R.s.a - R.from.a; if (!clip.loop && !clip.swing) { da = ((da + 540) % 360) - 180; }   // the short way round, except a swing's own arc
    const prevA = R.out.a;
    R.out.a = R.from.a + da * e; R.out.x = lerp(R.from.x, R.s.x, e); R.out.y = lerp(R.from.y, R.s.y, e);
    R.out.free = !!clip.free; R.out.swing = clip.swing && (clip.loop || ct < clip.keys[clip.keys.length - 1][0] * 0.75) ? 1 : 0;
    R.out.spin = Math.abs(R.out.a - prevA);
    return R.out;
  },
  // two-bone IK: shoulder `sh` reaching for (tx, ty), the elbow hanging below; writes el, ha
  _ik(sh, tx, ty, a, b, el, ha) {
    const dx = tx - sh.x, dy = ty - sh.y, d = clamp(Math.hypot(dx, dy), Math.abs(a - b) + 0.01, a + b - 0.01);
    const base = Math.atan2(dy, dx), A = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const e1x = sh.x + Math.cos(base + A) * a, e1y = sh.y + Math.sin(base + A) * a, e2x = sh.x + Math.cos(base - A) * a, e2y = sh.y + Math.sin(base - A) * a;
    const first = e1y > e2y; el.x = first ? e1x : e2x; el.y = first ? e1y : e2y;
    const ang = Math.atan2(ty - el.y, tx - el.x); ha.x = el.x + Math.cos(ang) * b; ha.y = el.y + Math.sin(ang) * b;
  },
  // pose the skeleton for drawing; returns what it replaced (restore() puts it back)
  apply(f) {
    const P = this.update(f), sk = f.sk, U = f.scale, fc = f.facing < 0 ? -1 : 1, b = f.build;
    const save = this._save || (this._save = []);
    const rec = { fel: { ...sk.fel }, fha: { ...sk.fha }, bel: { ...sk.bel }, bha: { ...sk.bha }, wt: { ...sk.wt }, wb: { ...sk.wb }, wAng: f.wAng, wx: f.wVec.x, wy: f.wVec.y };
    const rot = ((f.pose.rot || 0) + (f.extraRot || 0)) * DEG, cr = Math.cos(rot), sr = Math.sin(rot);
    const W = (lx, ly) => [(lx * cr - ly * sr) * fc, lx * sr + ly * cr];
    const off = W(P.x * U, P.y * U), A = P.a * DEG, dir = W(Math.sin(A), Math.cos(A));
    const px = sk.sh.x + off[0], py = sk.sh.y + off[1], L = f.weaponLen();
    const up = BODY.upper * U * b.arms, fo = BODY.fore * U * b.arms;
    this._ik(sk.shF, px + dir[0] * L * 0.2, py + dir[1] * L * 0.2, up, fo, sk.fel, sk.fha);
    if (!P.free) this._ik(sk.shB, px - dir[0] * L * 0.34, py - dir[1] * L * 0.34, up, fo, sk.bel, sk.bha);
    f.wVec.x = dir[0]; f.wVec.y = dir[1]; f.wAng = Math.atan2(dir[1], dir[0]);
    sk.wt.x = sk.fha.x + dir[0] * L; sk.wt.y = sk.fha.y + dir[1] * L; sk.wb.x = sk.fha.x + dir[0] * L * 0.55; sk.wb.y = sk.fha.y + dir[1] * L * 0.55;
    // where the head of the scythe is (her chain runs from it: 62b-akari-chain.js)
    const hk = typeof AK_SCY_HEAD === 'number' ? AK_SCY_HEAD : 1; f._akHeadW = { x: sk.fha.x + dir[0] * L * hk, y: sk.fha.y + dir[1] * L * hk, t: f.time };
    // the energy trail and the sparks and petals off the blade (once per simulated frame)
    if (typeof AkariGL !== 'undefined' && R_last(f) && AkariGL.live()) AkariGL.feed(f, P, L);
    return rec;
  },
  restore(f, rec) {
    const sk = f.sk;
    for (const k of ['fel', 'fha', 'bel', 'bha', 'wt', 'wb']) { sk[k].x = rec[k].x; sk[k].y = rec[k].y; }
    f.wAng = rec.wAng; f.wVec.x = rec.wx; f.wVec.y = rec.wy;
  }
};
// true the first time a fighter is posed in a simulated frame (the outline, flat and colour passes all draw her)
function R_last(f) { const R = f._akRig; if (!R || R.fed === f.time) return false; R.fed = f.time; return true; }

// the blade's two trail points in the weapon frame (units of L, y toward the blade; drawMainWeapon flips y facing left)
const AK_BLADE_IN = [1.06, 0.1], AK_BLADE_OUT = [1.98, 0.7];
function akBladePoint(f, L, p) {
  const a = f.wAng, c = Math.cos(a), s = Math.sin(a), x = p[0] * L, y = p[1] * L * (f.facing < 0 ? -1 : 1);
  return [f.sk.fha.x + x * c - y * s, f.sk.fha.y + x * s + y * c];
}

// Fighter.draw: her rigged arms and scythe for the draw, the simulation's skeleton back afterwards
{
  const draw0 = Fighter.prototype.draw;
  Fighter.prototype.draw = function (ctx, opt) {
    if (!AkariRig.applies(this)) return draw0.call(this, ctx, opt);
    const rec = AkariRig.apply(this);
    try { return draw0.call(this, ctx, opt); } finally { AkariRig.restore(this, rec); }
  };
}

// which of her moves is running: tag the fighter as each Akari ability starts (only observes; changes nothing)
for (const id of Object.keys(AK_SCHED)) {
  const a = BOSS_ABILITIES[id]; if (!a || a._akTag) continue;
  const run0 = a.run;
  a.run = function (f) { const r = run0.apply(this, arguments); if (f && f.abil) f._akAbil = { id, abil: f.abil }; return r; };
  a._akTag = 1;
}
