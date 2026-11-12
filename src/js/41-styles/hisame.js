/* KAGE — Hisame, the Rain Courier (act1.sub3): tessenjutsu.

   The school: the iron war fan, the courier's weapon that is not a weapon. Two fans (the twin-blade forms: tw1-tw5, the
   counter cut twc, the dash strike twc_dash). The art is evasion and the counter: circular footwork that never stands
   where the blow lands, the fan snapped open across a cut to turn it aside, and the answer from inside the opened fan.
   Her attacks are quick light strings (two or three fan cuts, never one big blow), and one sudden lunge: the dashing
   fan strike from range, or Lightning Cut (the reduced Thunder Swing, 40-ai.js).

   New technique: Kochō (the butterfly step, BOSS_ABILITIES.hisameKocho). A Kage who chases her is not there to be
   hit: she springs in an arc over his head and lands at his back, and her fans come round a beat later (a glint first,
   time enough to turn and guard). It is her answer to being chased, never something she opens with.

   What it teaches: not mashing, not chasing. A flurry is read and turned aside by the fans, and the counter cut follows
   from inside the deflection (a critical on a Kage still in his cut). Chase her and she circles behind. Wait, guard,
   and her lunge comes: parry it (she reels long, being light: parriedStun, poise) and punish. Harder than Garan: she
   is fast, she parries, and she does not stay where Kage can hit her. */

function hisameMash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}
// Kage is coming after her: walking or running at her, or dashing in
function hisameChased(f, p, dist) {
  const toward = Math.sign(f.x - p.x) || 1;
  return dist < 280 && p.grounded && ((p.state === 'run' || p.state === 'walk') && Math.sign(p.vx) === toward && Math.abs(p.vx) > 120 || p.state === 'dash');
}

// Kochō: a short wind-up (fans spread), an arc over Kage to land at his back, then the fan cut with a readable start-up
BOSS_ABILITIES.hisameKocho = { id: 'hisameKocho', cd: 4.5, range: [60, 300], chance: 0.6,
  cond: (f, w, ai, p, dist) => hisameChased(f, p, dist),
  run(f, w, ai) {
    const p = w.player, s = f.scale, W = 0.14 * ai.p.windup, E = 0.34, x0 = f.x, toward = Math.sign(p.x - f.x) || 1;
    const dest = clamp(p.x + toward * 110 * s, w.bounds.l + 30, w.bounds.r - 30);
    if (Math.abs(dest - p.x) < 60 * s) return BOSS_ABILITIES.hisameKocho.back(f, w, ai, toward);   // a wall behind him
    f.telegraph = W;
    w.fx.popText(f, 'KOCHŌ', f.accent || '#7fb8ff'); AudioManager.play('teleport', { pitch: 1.4 });
    f.startAbility({ dur: W + E + 0.1, float: true, rate: 30,
      pose: (f, t) => (t < W ? POSES.land : POSES.jump),
      start(f) { f.invuln = Math.max(f.invuln, W + E); f.vx = 0; f.facing = toward; },
      update(f, w, t) {
        f.vx = 0; f.vy = 0;
        if (t < W) return;
        const u = clamp((t - W) / E, 0, 1);
        f.x = lerp(x0, dest, Ease.inOut(u)); f.y = -Math.sin(u * Math.PI) * 150 * s; f.grounded = false;
        if (((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, 'rgba(127,184,255,0.35)');
        if (u < 1) return;
        f.y = 0; f.grounded = true; f.facing = Math.sign(p.x - f.x) || -toward;
        w.fx.smoke(f.x, -30, 3);
        f.endAbility(w);
        // the fans come round: a glint, then the cut (time to turn and guard)
        if (f.startMove('tw1', w)) { f.mdur[0] = Math.max(f.mdur[0], 0.2); w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#9fd4ff'); }
      } });
  },
  // no room behind him: a light back-spring out of reach instead
  back(f, w, ai, toward) { ai.startSeq(['back', 'wait:0.2', 'dash', 'weapon']); }
};
for (const ph of ENEMIES.hisame.phases) if (!ph.abilities.includes('hisameKocho')) ph.abilities.push('hisameKocho');

FIGHT_STYLES.hisame = {
  art: 'Tessenjutsu',
  // quick, evasive, a fan that turns cuts aside; she would rather not be where the blow lands than block it
  tune: { pref: 175, aggr: 0.6, block: 0.2, parry: 0.38, dodge: 0.32, react: [0.08, 0.16], combo: [2, 3], punish: 0.85, grab: 0.06, jump: 0.06, dashIn: 0.15 },
  poise: 1.15,                    // light: her guard does not hold a heavy blow
  parriedStun: 0.85,              // parry the lunge and she is off her line for a long beat
  footwork: { away: 0.6, stepIn: 150 },
  strings: [
    // light fan strings: two or three cuts, then out
    { seq: ['weapon', 'weapon'], range: [0, 150], w: 2.5 },
    { seq: ['weapon', 'weapon', 'weapon'], range: [0, 140], w: 1.5 },
    { seq: ['w:diagDown', 'w:diagUp'], range: [0, 160], w: 1.5 },
    // the sudden lunge: the dashing fan strike from range (telegraphed: wait for it, parry it)
    { seq: ['dash', 'weapon'], range: [190, 400], w: 2.5, tell: 0.24 },
    // a guard: the full fan dance into the spinning finisher, or the clinch
    { seq: ['weapon', 'weapon', 'weapon', 'weapon', 'weapon'], range: [0, 140], w: 3, when: (ai, p) => p.state === 'block' },
    { seq: ['grab'], range: [0, 100], w: 2, when: (ai, p) => p.state === 'block' },
    // an airborne Kage: the rising fans
    { seq: ['w:up'], range: [0, 160], w: 6, when: (ai, p) => !p.grounded }
  ],
  decide(ai, p, dist) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // chased: the butterfly step over him (its cool-down permitting), else circle away
    if (hisameChased(f, p, dist) && chance(0.5)) {
      if ((ai.cds.hisameKocho || 0) <= 0) { ai.cds.hisameKocho = BOSS_ABILITIES.hisameKocho.cd; BOSS_ABILITIES.hisameKocho.run(f, w, ai, p); return true; }
      ai.plan = 'retreat'; ai.t = rand(0.25, 0.4); return true;
    }
    // a flurry close in: the fans come up, the counter waits inside them (respond / on.parry)
    if (dist < 190 && hisameMash(w) >= 7 && chance(0.5)) { ai.block = rand(0.25, 0.4); return true; }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!f.canAct() || !f.grounded || m.kind === 'throw' || m.kind === 'grab' || m.proj || m.unb) return false;
    // a flurry is read: the fan snaps open across the cut (a parry when the timing is there, else a block)
    if (hisameMash(w) >= 7 || w.predictability(m.id) > 0.45) {
      if (!chance(0.85)) return false;
      const left = p.mdur[0] - p.mt;
      ai.block = rand(0.25, 0.4); f.ctrl.blockHeld = true;
      if (f.state !== 'block') f.setState('block');
      f.blockT = left < 0.14 ? 0 : PARRY_WINDOW + 0.05;
      return true;
    }
    return false;
  },
  on: {
    // turned aside by the fan: the counter cut from inside it (twc, the weapon's counter)
    parry(ai) { if (chance(0.85)) { ai.block = 0; ai.startSeq(['weapon'], 0.04); } },
    block(ai, w) { if (chance(hisameMash(w) >= 7 ? 0.7 : 0.3)) { ai.block = 0; ai.startSeq(['weapon'], 0.03); } },
    // her lunge parried: when she can move again, she is gone
    parried(ai) { ai.seq = null; ai.plan = 'retreat'; ai.t = 0.45; },
    // struck: slip out rather than stand in a combo
    hurt(ai, w, other) { if (ai.f.canAct() && chance(0.3)) { ai.plan = 'retreat'; ai.t = 0.3; } }
  }
};

// a sub-boss a little harder than before: a touch more stamina (330 -> 375); most of it is her skill (fans, circling, lunge)
Object.assign(ENEMIES.hisame, { hp: 375 });
