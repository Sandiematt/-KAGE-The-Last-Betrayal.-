/* KAGE — Shiden, the Last Lieutenant (act1.sub4): sōjutsu.

   The school: the vanguard's war spear, Hōzōin-ryū in spirit: the yari is a thrusting weapon first and last. Thrust,
   thrust, sweep (s1 -> s2 -> s3, the weapon's own string) is his combination; a single long lunging thrust (s1_fwd) and
   the running dash thrust (s1_dash) are how he closes or keeps the distance; the low sweep (s3_diagDown) takes the legs,
   the overhead shaft (s3_down) comes down on a guard, the rising thrust (s2_up) meets a jump. He is the captain's
   lieutenant: disciplined, guarded (he parries and answers from the parry), patient behind the point.

   New technique: the Braced Spear (BOSS_ABILITIES.shidenBrace, 'KAMAE'). He sets the spear low and level, rear foot
   planted (the tell: a held stance, a glint on the point). Anything that rushes in on the point (a dash, a run, a cut
   started on the way in) is met by the thrust: a counter-hit critical. Left alone, he holds it for a moment and lifts
   it, open (OPENING). Beat it by not rushing: wait it out, or bait the thrust from just outside its reach and parry it.

   Kept from his story: Vanguard Break (the reduced Storm Break) in both phases, Hold the Line (the reduced Redline
   Counter) in the second.

   What it teaches: the counter-hit critical, from both sides. Rushing a spear is punished; a thrust parried or stepped
   out of leaves the long shaft out of line and Kage inside it, where the critical is his. The hardest of Act I's four,
   the last test before Raikon: fast hands, a real parry, no wasted motion. */

function shidenMash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}
// is Kage coming in on the point? (a dash, a run or walk toward him, a cut started on the way in)
function shidenRushing(f, p) {
  const toward = Math.sign(f.x - p.x) || 1;
  if (p.state === 'dash') return true;
  if ((p.state === 'run' || p.state === 'walk') && Math.sign(p.vx) === toward && Math.abs(p.vx) > 140) return true;
  return p.state === 'move' && p.mphase === 0 && p.facing === toward && Math.sign(p.vx) === toward && Math.abs(p.vx) > 60;
}
// trigger: how close a rushing Kage must come (x scale) before the point goes out; reach: how far the thrust carries
const SHIDEN_BRACE = { hold: 1.25, reach: 280, trigger: 215, dmg: 15, open: 0.55 };

BOSS_ABILITIES.shidenBrace = { id: 'shidenBrace', cd: 6.5, range: [150, 420], chance: 0.5,
  run(f, w, ai) {
    const B = SHIDEN_BRACE, set = 0.22 * ai.p.windup;
    f.telegraph = set;
    f.startAbility({ dur: set + B.hold + B.open, rate: 20,
      pose: (f, t) => (shidenBraceThrust(f) ? MOVES.s1.s : MOVES.s1.w),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'KAMAE', f.accent || '#b07cff'); AudioManager.play('block'); f.braced = false; f.braceCrit = 0; },
      update(f, w, t, dt) {
        const p = w.player;
        f.vx = damp(f.vx, 0, 14, dt);
        if (t < set) return;
        if (!this.thrust && t < set + B.hold) {
          f.braced = true;
          if (!this.glint) { this.glint = 1; w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#e4d6ff'); }
          const d = Math.abs(p.x - f.x), front = Math.sign(p.x - f.x) === f.facing;
          if (p.alive && front && d < B.trigger * f.scale && shidenRushing(f, p)) { this.thrust = t; f.braced = false; }
          return;
        }
        f.braced = false;
        if (this.thrust != null) {
          const k = t - this.thrust;
          if (!this.cut) { this.cut = 1; f.vx = f.facing * 520; AudioManager.play('heavyswing'); w.fx.stamp('BRACED', f.x + f.facing * 90, f.y - 150 * f.scale, 2, f.accent); }
          if (!this.hit && k < 0.24) {
            f.braceCrit = w.time + 0.2;   // FIGHT_STYLES.shiden.crit: the spear met a man rushing onto it
            this.hit = Combat.area(w, f, fbox(f, 20, -205, B.reach, 80), { dmg: B.dmg * f.dmgMul, kb: 560, up: -160, hs: 0.5, imp: 3, hsnd: 'slash', stamp: 'BRACED' });
          }
          if (k > 0.5) { f.braceCrit = 0; return false; }
          return;
        }
        // nobody came: he lifts the point, open for a moment
        if (!this.tell) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
      },
      end(f) { f.braced = false; f.braceCrit = 0; } });
  } };
// the pose helper the brace's pose reads: has the thrust gone out?
function shidenBraceThrust(f) { return !!(f.abil && f.abil.thrust != null); }
for (const ph of ENEMIES.shiden.phases) if (!ph.abilities.includes('shidenBrace')) ph.abilities.push('shidenBrace');

FIGHT_STYLES.shiden = {
  art: 'Sōjutsu · Hōzōin-ryū',
  // disciplined and quick: he keeps the point at Kage's chest and answers from the guard
  tune: { pref: 215, aggr: 0.4, block: 0.42, parry: 0.2, dodge: 0.14, react: [0.1, 0.18], combo: [2, 3], punish: 0.6, grab: 0.05, jump: 0.02, dashIn: 0.1 },
  poise: 0.9,
  parriedStun: 0.58,              // a captain's recovery: a parried thrust leaves only a short opening
  footwork: { away: 0.45, stepIn: 170 },
  strings: [
    // thrust, thrust, sweep: the spear's own string (jump the sweep), telegraphed
    { seq: ['weapon', 'weapon', 'weapon'], range: [130, 300], w: 3, tell: 0.2 },
    // the double thrust and out
    { seq: ['weapon', 'weapon', 'back'], range: [120, 290], w: 2 },
    // the held thrust: the point stops, then goes out a beat late (a guard raised on rhythm is early, a parry mistimed)
    { seq: ['weapon', 'wait:0.24', 'weapon', 'weapon'], range: [130, 290], w: 2.5 },
    // the long lunging thrust from the edge of his reach
    { seq: ['w:fwd'], range: [200, 360], w: 2 },
    // from outside: the running dash thrust
    { seq: ['dash', 'weapon'], range: [320, 500], w: 1.5, tell: 0.25 },
    // too close for the point: step back to it, then thrust
    { seq: ['back', 'wait:0.12', 'weapon', 'weapon'], range: [0, 140], w: 2 },
    // the low sweep that takes the legs
    { seq: ['w:diagDown'], range: [100, 260], w: 1.2 },
    // a guard: the shaft overhead, or the sweep under it
    { seq: ['w:down'], range: [0, 260], w: 4, tell: 0.2, when: (ai, p) => p.state === 'block' },
    // a jump: the rising thrust
    { seq: ['w:up'], range: [0, 280], w: 6, when: (ai, p) => !p.grounded }
  ],
  decide(ai, p, dist) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // a dash at the point: stop-thrust
    if (p.state === 'dash' && dist < 340 && chance(0.45)) { ai.startSeq(['move:s1']); return true; }
    // a flurry up close: guard, the riposte comes off it
    if (dist < 220 && shidenMash(w) >= 7 && chance(0.55)) { ai.block = rand(0.3, 0.45); return true; }
    // Kage's posture is failing: press the full string into it
    if (p.guard < 40 && dist < 300 && chance(0.6)) { ai.startSeq(['weapon', 'weapon', 'weapon']); return true; }
    // his own posture is failing: step back behind the point
    if (f.guard < 35 && dist < 260 && chance(0.5)) { ai.plan = 'retreat'; ai.t = rand(0.3, 0.5); return true; }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!f.canAct() || !f.grounded || m.kind === 'throw' || m.proj) return false;
    const left = p.mdur[0] - p.mt;
    // a slow cut started from outside Kage's own reach: the point is longer. Stop-thrust into the wind-up.
    if (dist > 185 && dist < 320 && left > 0.11 && chance(0.3)) { ai.startSeq(['move:s1']); return true; }
    // a flurry is read: the shaft comes across it (a parry when the timing is there, else a block)
    if (!m.unb && m.kind !== 'grab' && (shidenMash(w) >= 7 || w.predictability(m.id) > 0.45) && chance(0.85)) {
      ai.block = rand(0.3, 0.45); f.ctrl.blockHeld = true;
      if (f.state !== 'block') f.setState('block');
      f.blockT = left < 0.14 ? 0 : PARRY_WINDOW + 0.05;
      return true;
    }
    return false;
  },
  // the braced thrust that meets a rushing Kage is a critical; so is the stop-thrust that catches a dash
  crit(att, def, m, world) { return (att.braceCrit || 0) > world.time || def.state === 'dash'; },
  on: {
    // a cut turned aside on the shaft: the point comes straight back (the counter thrust)
    parry(ai) { if (chance(0.9)) { ai.block = 0; ai.startSeq(['weapon'], 0.04); } },
    block(ai, w) { if (chance(shidenMash(w) >= 7 ? 0.75 : 0.22)) { ai.block = 0; ai.startSeq(['weapon'], 0.03); } },
    parried(ai) { ai.seq = null; if (chance(0.4)) { ai.plan = 'retreat'; ai.t = 0.4; } }
  }
};

// hard because he is skilled, not because he is a wall of health: a little less stamina and weight than before; his skill does the rest
Object.assign(ENEMIES.shiden, { hp: 400, dmg: 0.93 });
