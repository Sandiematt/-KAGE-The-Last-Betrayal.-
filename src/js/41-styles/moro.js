/* KAGE — Moro, the Conduit Warden (act3.sub3): naginata-jutsu.

   The school: the temple-guard's naginata, a blade on a long shaft: the art of the arc. Where the spear thrusts, the
   naginata sweeps: the wide horizontal that clears a doorway (his reach is the longest of any foe's blade), the kesa
   diagonal that comes down through the shoulder, the rising return, and the low cut that takes the legs. He stands at
   the end of the blade, where nothing but its arc can reach, and walks round Kage in a half circle (the strafe) feeding
   the blade in. Half a Hollow after ten years of listening to the walls: his rhythm is a little wrong, a pause where
   there should be none, a sweep that comes twice.

   The reckless step-in is what his school is built to punish. After a sweep, with Kage inside the shaft, the naginata is
   turned in his hands: the butt comes round and the blade follows it in a full turn (kaiten).

   New technique: Kaiten (BOSS_ABILITIES.moroSpin). The shaft spins round him once, two sweeps (first one way, then the
   other, a beat apart) that reach both sides: a short tell (the blade dragged up and the eyes flash), the first sweep
   clears whatever is in front, the second catches the man who dashed through it. It is only thrown at a man who is
   already inside the shaft when a sweep ends or who rushes in. Back out of the first sweep and step in on the
   second's recovery; or stay out until a sweep has passed and step in on it.

   What it teaches: stepping in on the recovery of a sweep, and the parry. A sweep parried (parriedStun) leaves the long
   shaft out of line with Kage inside it, the way Kuroe's staff is, and his posture is low. Nothing here wins by
   rushing: a dash in is the spin. A sweep that comes down the other side of a jump is the low cut: jump it.
   A little harder than Act II's: he never stands still, and the half-Hollow rhythm hides the second sweep. */

function moroMash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}
// Kage is coming in at the shaft: a dash, a run toward him, a cut started on the way in
function moroRushing(f, p, dist) {
  const toward = Math.sign(f.x - p.x) || 1;
  if (dist > 260) return false;
  if (p.state === 'dash') return true;
  return (p.state === 'run' || p.state === 'walk') && Math.sign(p.vx) === toward && Math.abs(p.vx) > 140;
}

// Kaiten: two sweeps of the shaft, round him one way, then back; both sides, so nothing is behind him either.
// Telegraphed: the blade is dragged up and across, the eyes flash. Blockable; parry the first and the second never comes.
BOSS_ABILITIES.moroSpin = { id: 'moroSpin', cd: 4.2, range: [0, 240], chance: 0.7,
  run(f, w, ai) {
    const W = 0.2 * ai.p.windup, G = 0.34;
    f.telegraph = W;
    f.startAbility({ dur: W + G + 0.62, rate: 26, trail: true,
      pose: (f, t) => (t < W ? MOVES.s3.w : t < W + G * 0.9 ? MOVES.s3.s : MOVES.s2.s),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'KAITEN', f.accent || '#9b7cff'); AudioManager.play('teleport', { pitch: 0.9 }); this.n = 0; },
      update(f, w, t, dt) {
        if (t < W) { f.vx = damp(f.vx, 0, 12, dt); return; }
        const i = t < W + G ? 0 : 1;
        if (i !== this.n - 1) {
          this.n = i + 1; this.hit = false;
          if (i === 1) f.facing = -f.facing;   // the turn: the second sweep comes round the other way
          f.vx = f.facing * 150; AudioManager.play('swing', { pitch: 0.85 + i * 0.1 }); w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#cbbdff');
        }
        if (!this.hit) this.hit = Combat.area(w, f, fbox(f, -20, -150, 240, 110), { dmg: (i ? 9 : 8) * f.dmgMul, kb: i ? 380 : 260, up: i ? -240 : -60, hs: 0.4, imp: i ? 2 : 1, hsnd: 'slash', stamp: i ? 'KAITEN' : null, gb: 38, moroSpin: i + 1 });
        f.vx = damp(f.vx, 0, 10, dt);
        if (!this.tell && t > W + G + 0.3) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
      } });
  } };
for (const ph of ENEMIES.moro.phases) if (!ph.abilities.includes('moroSpin')) ph.abilities.push('moroSpin');
// the spin is for the man inside the shaft or rushing in: on its own only then
BOSS_ABILITIES.moroSpin.cond = (f, w, ai, p, dist) => dist < 170 || moroRushing(f, p, dist);

// the string step: spin only if Kage is inside the shaft as the sweep ends; otherwise the string simply ends (no spin)
BOSS_ABILITIES.moroSpinIf = { id: 'moroSpinIf', cd: 0, range: [0, 9999], chance: 1,
  run(f, w, ai, p) {
    const d = Math.abs(p.x - f.x);
    if (d < 175 && (ai.cds.moroSpin || 0) <= 0) { ai.cds.moroSpin = BOSS_ABILITIES.moroSpin.cd; BOSS_ABILITIES.moroSpin.run(f, w, ai, p); }
  } };

FIGHT_STYLES.moro = {
  art: 'Naginata-jutsu',
  // he lives at the end of the blade and keeps moving round it
  tune: { pref: 230, aggr: 0.82, block: 0.45, parry: 0.1, dodge: 0.3, react: [0.08, 0.15], combo: [2, 3], punish: 0.75, grab: 0.04, jump: 0, dashIn: 0.05 },
  poise: 1,
  postureRegen: 16,
  parriedStun: 0.8,               // a sweep parried: the long shaft is out of line with Kage inside it
  footwork: { away: 0.4, stepIn: 170 },
  strings: [
    // the wide horizontal arc from the edge of the blade, and the turn if Kage rushed in under it
    { seq: ['w:fwd', 'ab:moroSpinIf'], range: [150, 330], w: 3, tell: 0.14 },
    // the kesa down through the shoulder, the rising return, the horizontal after it: the arcs flow into one another
    { seq: ['w:diagDown', 'w:diagUp', 'w:fwd'], range: [110, 300], w: 2.4, tell: 0.14 },
    { seq: ['w:diagDown', 'ab:moroSpinIf'], range: [90, 270], w: 2 },
    // two thrusts to the face and the low sweep after them (jump it): telegraphed
    { seq: ['weapon', 'weapon', 'weapon'], range: [120, 300], w: 2, tell: 0.2 },
    // inside the shaft: step out to the tip and sweep (hit and away), or the turn at once
    { seq: ['back', 'wait:0.12', 'w:fwd'], range: [0, 140], w: 3 },
    { seq: ['ab:moroSpin'], range: [0, 150], w: 2.5 },
    // a raised guard: the shaft comes down overhead, or the sweep under it
    { seq: ['w:down'], range: [0, 280], w: 4, tell: 0.2, when: (ai, p) => p.state === 'block' },
    // an airborne Kage: the rising cut
    { seq: ['w:up'], range: [0, 290], w: 6, when: (ai, p) => !p.grounded },
    // from outside: the running dash cut
    { seq: ['dash', 'weapon'], range: [340, 500], w: 1.2, tell: 0.14 }
  ],
  decide(ai, p, dist) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // a man who rushes in at the shaft is turned on
    if (moroRushing(f, p, dist) && dist < 200 && (ai.cds.moroSpin || 0) <= 0 && chance(0.55)) { ai.cds.moroSpin = BOSS_ABILITIES.moroSpin.cd; BOSS_ABILITIES.moroSpin.run(f, w, ai, p); return true; }
    // a flurry up close: guard it, the turn comes off the block
    if (dist < 210 && moroMash(w) >= 7 && chance(0.55)) { ai.block = rand(0.3, 0.5); return true; }
    // his own posture is failing: away round the blade
    if (f.guard < 35 && dist < 260 && chance(0.5)) { ai.plan = 'retreat'; ai.t = rand(0.3, 0.5); return true; }
    // between strings he walks the half circle at the tip of the blade, never standing where Kage can reach
    if (dist > 180 && dist < 320 && p.isNeutral() && chance(0.3)) { ai.plan = 'strafe'; ai.strafeDir = chance(0.5) ? 1 : -1; ai.t = rand(0.25, 0.4) * ai.p.idle; return true; }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!f.canAct() || !f.grounded || m.kind === 'throw' || m.proj) return false;
    const left = p.mdur[0] - p.mt;
    // a slow cut from outside Kage's own reach: the blade is longer, the arc comes into his wind-up
    if (dist > 190 && dist < 330 && left > 0.11 && chance(0.4)) { ai.startSeq(['w:fwd']); return true; }
    // inside the shaft when a cut starts: the turn
    if (dist < 170 && (ai.cds.moroSpin || 0) <= 0 && chance(0.4)) { ai.cds.moroSpin = BOSS_ABILITIES.moroSpin.cd; ai.seq = null; BOSS_ABILITIES.moroSpin.run(f, w, ai, p); return true; }
    // a flurry is read: the shaft comes across it
    if (!m.unb && m.kind !== 'grab' && (moroMash(w) >= 7 || w.predictability(m.id) > 0.45) && chance(0.8)) {
      ai.block = rand(0.3, 0.45); f.ctrl.blockHeld = true;
      if (f.state !== 'block') f.setState('block');
      f.blockT = left < 0.14 ? 0 : PARRY_WINDOW + 0.05;
      return true;
    }
    return false;
  },
  // the turn that catches a man dashing in is a critical; the arc that meets a rush is too
  crit(att, def, m) { return !!(m.moroSpin && (def.state === 'dash' || def.state === 'run')); },
  on: {
    // a cut turned aside on the shaft: the sweep comes back along it
    parry(ai) { if (chance(0.8)) { ai.block = 0; ai.startSeq(['w:diagDown'], 0.05); } },
    block(ai, w) { if (chance(moroMash(w) >= 7 ? 0.7 : 0.25)) { ai.block = 0; ai.startSeq(['ab:moroSpin'], 0.04); } },
    // a sweep parried: no pride; round the blade again as soon as he can
    parried(ai) { ai.seq = null; if (chance(0.45)) { ai.plan = 'retreat'; ai.t = 0.4; } }
  }
};

// a sub-boss a step above Act II's: the longest blade in the game
Object.assign(ENEMIES.moro, { hp: 450, dmg: 1.55 });
