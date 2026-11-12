/* KAGE — Hollow Rem's fighting style: the family form grown up and broken (core.echo4, the Core's last echo, a sub-boss).

   The school: the Hoshimura family form as Rem ran it, fast and fluid: the dash, the rising cut, the aerial off the
   double jump, the flowing finish (FAMILY_FORM 'rem', run by AIController.startForm), now with nothing left of the boy's
   play in it. Where young Rem ended a string with a grin, the echo does not end it: it presses. Quick three-cut strings
   (the form's own k1 -> k2 -> k3), the dash cut with the rising cut behind it, the kesa and the return, one after the
   other with no gap a man could stand in, and the cross-up: it leaps clean over Kage and is behind him cutting.
   It is the brother he knew with the pauses cut out, and the corruption shows in the timing (a stutter, then a burst).

   New technique: the False Step (BOSS_ABILITIES.remFalseStep). A short violet flicker (the tell: the eyes flash, the
   blade drops), then a low leap over Kage's head that lands at his back and cuts the instant its feet touch, k1, k2.
   It comes when Kage guards (the mix-up for a man standing behind his blade) and when Kage cuts at it from close (it
   goes over the cut). Anti-air it: it is in the air for a third of a second and a cut that meets it is a counter-hit;
   turn and guard on the glint when it lands; or step through it, it lands where you were.

   What it teaches: the parry and not turning your back to the fight. It is relentless but honest: every string ends in
   a real recovery (the flow cut's long one, the aerial's landing), and a parried cut leaves it reeling with a long
   recovery (parriedStun), so one clean parry gives the opening a block never does. Blocking the strings and
   standing still is how to lose; mashing meets the dodge, the cross-up and a critical; backing away is pursued (the
   dash cut). The hardest of the four echoes: it is faster than Kage and it does not stop. */

function hollowRemMash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}
const HOLLOW_REM_TINT = 'rgba(169,112,255,0.38)';

// False Step: a flicker, a low leap over Kage, and the cut the instant it lands behind him. The leap is no invulnerability:
// a cut that meets it in the air is a counter-hit and stops it.
BOSS_ABILITIES.remFalseStep = { id: 'remFalseStep', cd: 3.6, range: [60, 300], chance: 0.55,
  run(f, w, ai) {
    const p = w.player, s = f.scale, W = 0.17 * ai.p.windup, E = 0.3, x0 = f.x, toward = Math.sign(p.x - f.x) || 1;
    const dest = clamp(p.x + toward * 105 * s, w.bounds.l + 30, w.bounds.r - 30);
    // against the wall there is no room behind him: a quick step back and the dash cut instead
    if (Math.abs(dest - p.x) < 60 * s) { ai.startSeq(['back', 'wait:0.1', 'dash', 'weapon']); return; }
    f.telegraph = W;
    w.fx.popText(f, 'FALSE STEP', f.accent || '#a970ff'); AudioManager.play('teleport', { pitch: 1.5 });
    f.startAbility({ dur: W + E + 0.1, float: true, rate: 30, trail: true,
      pose: (f, t) => (t < W ? POSES.land : POSES.jump),
      start(f) { f.vx = 0; f.facing = toward; },
      update(f, w, t) {
        f.vx = 0; f.vy = 0;
        if (t < W) return;
        const u = clamp((t - W) / E, 0, 1);
        f.x = lerp(x0, dest, Ease.inOut(u)); f.y = -Math.sin(u * Math.PI) * 135 * s; f.grounded = false;
        if (((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, HOLLOW_REM_TINT);
        if (u < 1) return;
        f.y = 0; f.grounded = true; f.facing = Math.sign(p.x - f.x) || -toward;
        w.fx.smoke(f.x, -30, 3);
        f.endAbility(w);
        // the cut the instant it lands, a glint first (a beat to turn and guard), then the form's rising pair
        if (f.startMove('k1', w)) { f.mdur[0] = Math.max(f.mdur[0], 0.17); w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#d9c2ff'); ai.startSeq(['weapon'], 0.02); }
      } });
  } };
for (const ph of ENEMIES.hollow_rem.phases) if (!ph.abilities.includes('remFalseStep')) ph.abilities.push('remFalseStep');

FIGHT_STYLES.hollow_rem = {
  art: 'Ittō-ryū · Rem\'s form, broken',
  // fast and aggressive: he never waits, he stays inside dash distance and presses
  tune: { pref: 150, aggr: 0.9, block: 0.2, parry: 0.04, dodge: 0.32, react: [0.08, 0.16], combo: [3, 4], punish: 0.85, grab: 0.03, jump: 0.15, kunai: 0, dashIn: 0.45 },
  poise: 1,
  postureRegen: 18,
  parriedStun: 0.62,              // a parried cut: a real recovery, a real opening (the honest side of the pressure)
  footwork: { away: 0.12, stepIn: 200 },
  strings: [
    // the form's own cut string: rising, rising, the flow: no gap
    { seq: ['weapon', 'weapon', 'weapon'], range: [0, 200], w: 3 },
    // kesa, the rising return, the horizontal: each cut in a new direction, flowing from the last
    { seq: ['w:diagDown', 'w:diagUp', 'w:fwd'], range: [0, 210], w: 2.4 },
    // the dash cut and the rising pair behind it: closes any gap (and pursues a man who backed away)
    { seq: ['dash', 'weapon', 'weapon'], range: [160, 430], w: 3.2, tell: 0.14 },
    // the mix-up for a guard: the leap over it, or the overhead into the horizontal
    { seq: ['ab:remFalseStep'], range: [60, 230], w: 5, when: (ai, p) => p.state === 'block' && (ai.cds.remFalseStep || 0) <= 0 },
    { seq: ['w:down', 'w:fwd'], range: [0, 190], w: 3, tell: 0.16, when: (ai, p) => p.state === 'block' },
    // the aerial pair: up off the rising cut
    { seq: ['w:up'], range: [0, 200], w: 6, when: (ai, p) => !p.grounded },
    // out of the pocket, one cut, back out
    { seq: ['w:fwd', 'back'], range: [150, 300], w: 1.4 }
  ],
  decide(ai, p, dist) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // from dash range the whole family form, faster than Kage's own and with the pauses cut out
    if (ai.form && ai.formCd <= 0 && dist > 160 && dist < 460 && chance(0.85)) { ai.startForm(); return true; }
    // Kage's posture is failing: no pause
    if (p.guard < 40 && dist < 220 && chance(0.6)) { ai.startSeq(['weapon', 'weapon', 'weapon']); return true; }
    // his own posture is failing: out of the pocket, then back in
    if (f.guard < 30 && dist < 230 && chance(0.4)) { ai.plan = 'retreat'; ai.t = rand(0.25, 0.4); return true; }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!f.canAct() || !f.grounded || m.kind === 'throw' || m.proj) return false;
    // a cut thrown at him from close: over it and behind
    if (dist < 170 && (ai.cds.remFalseStep || 0) <= 0 && !m.unb && chance(0.3)) { ai.cds.remFalseStep = BOSS_ABILITIES.remFalseStep.cd; ai.seq = null; BOSS_ABILITIES.remFalseStep.run(f, w, ai, p); return true; }
    // a flurry is read: guard, and the cut comes off it
    if (!m.unb && m.kind !== 'grab' && (hollowRemMash(w) >= 7 || w.predictability(m.id) > 0.45) && chance(0.75)) {
      const left = p.mdur[0] - p.mt;
      ai.block = rand(0.25, 0.4); f.ctrl.blockHeld = true;
      if (f.state !== 'block') f.setState('block');
      f.blockT = left < 0.14 ? 0 : PARRY_WINDOW + 0.05;
      return true;
    }
    return false;
  },
  // the cut that lands the instant he does, on a man who turned too slowly, is a critical: Kage's back is to him
  crit(att, def, m, world) { return def.facing === att.facing && Math.abs(def.x - att.x) < 160; },
  on: {
    // a cut blocked: no rest: over the guard
    blocked(ai, w, other) { if (chance(0.3) && (ai.cds.remFalseStep || 0) <= 0) ai.startSeq(['ab:remFalseStep'], 0.02); },
    // a cut turned aside: the cut back, fast
    parry(ai) { if (chance(0.7)) { ai.block = 0; ai.startSeq(['weapon', 'weapon'], 0.04); } },
    block(ai, w) { if (chance(hollowRemMash(w) >= 7 ? 0.7 : 0.2)) { ai.block = 0; ai.startSeq(['weapon'], 0.03); } },
    // parried: the recovery is real; he drops out of the pocket and comes back
    parried(ai) { ai.seq = null; if (chance(0.5)) { ai.plan = 'retreat'; ai.t = 0.35; } }
  },
  // the form's first pause is a readable tell: the eyes flash, the blade drops
  init(f) {
    const ai = f.ai;
    if (ai && ai.form && ai.form.steps[0]) ai.form.steps[0].wait = 0.3;
    if (ai) { const sf = ai.startForm.bind(ai); ai.startForm = function () { f.telegraph = Math.max(f.telegraph, 0.3); sf(); }; }
  }
};

// the hardest of the four echoes: a Kage in full gear meets a sub-boss that does not stop
Object.assign(ENEMIES.hollow_rem, { hp: 470, dmg: 1.32 });
