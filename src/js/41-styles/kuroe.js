/* KAGE — Kuroe, the Ink Censor (act1.sub1): bōjutsu.

   The school: the temple staff of the Order's archive monks, Kukishin-ryū in spirit. Six feet of oak held in the middle,
   both ends live. The whole art is ma-ai: he stands where the tip of his staff reaches Kage and Kage's sword does not,
   and keeps it that way. A straight thrust (tsuki, s1) is his jab; two thrusts and a low spinning sweep (s3) are his
   combination; when Kage gets inside, he steps back out to the tip and thrusts again (hit and away), or clears him off
   with a rising end of the staff. A dash at him is met by a stop-thrust. Against a raised guard he brings the staff down
   overhead. His spinning guard is Censure (the reduced Redline Counter, 40-ai.js): strike into it and it is turned aside.

   What it teaches: the parry. His thrust is quick but plain, and he leans into it: parry it and he reels longer than
   a sub-boss usually does (parriedStun 0.75 s against the default 0.62), the staff out of line, and Kage is inside its reach. Blocking it only costs posture
   and he steps away again; chasing him swing after swing walks into the stop-thrust and his riposte off a block.
   The gentlest of Act I's four: slow to press, quick to give ground. */

// how many attacks Kage has started in the last 4 s: a fighter who mixes, waits and moves rarely passes 6, a masher
// sits at 9 to 12 (world.hitLog logs every move he starts)
function kuroeMash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}

FIGHT_STYLES.kuroe = {
  art: 'Bōjutsu · Kukishin-ryū',
  // patient and guarded: he waits at the staff's tip and lets Kage come to him
  tune: { pref: 205, aggr: 0.5, block: 0.58, parry: 0.18, dodge: 0.1, react: [0.1, 0.18], combo: [1, 3], punish: 0.8, grab: 0.22, dashIn: 0, jump: 0 },
  poise: 1,
  parriedStun: 0.75,              // parry his thrust and the staff is out of line for a long beat: that is the lesson
  footwork: { away: 0.6, stepIn: 80 },
  strings: [
    // tsuki at the very tip of the staff
    { seq: ['move:s1'], range: [165, 320], w: 3 },
    // two thrusts, high after low
    { seq: ['weapon', 'weapon'], range: [150, 300], w: 2 },
    // thrust, thrust, the low spinning sweep (jump it): telegraphed
    { seq: ['weapon', 'weapon', 'weapon'], range: [120, 270], w: 1.2, tell: 0.28 },
    // too close: step back out to the tip, then thrust
    { seq: ['back', 'wait:0.14', 'move:s1'], range: [0, 165], w: 3 },
    // too close and no room: the rising end of the staff knocks him off, then away
    { seq: ['w:diagUp', 'back'], range: [0, 150], w: 1.4 },
    // a raised guard: the staff comes down overhead
    { seq: ['w:down'], range: [0, 250], w: 4, tell: 0.2, when: (ai, p) => p.state === 'block' },
    // an airborne Kage: the rising thrust
    { seq: ['w:up'], range: [0, 270], w: 6, when: (ai, p) => !p.grounded },
    // from outside: a long dash thrust
    { seq: ['dash', 'weapon'], range: [320, 470], w: 1 }
  ],
  decide(ai, p, dist, toward) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // a dash at him is met at the end of the staff: the stop-thrust
    if (p.state === 'dash' && dist < 330 && chance(0.7)) { ai.startSeq(['move:s1']); return true; }
    // a flurry up close: guard, and the riposte comes off the block (on.block)
    if (dist < 210 && kuroeMash(w) >= 7 && chance(0.55)) { ai.block = rand(0.3, 0.5); return true; }
    // his own posture failing: give ground and let it come back
    if (f.guard < 40 && dist < 260 && chance(0.5)) { ai.plan = 'retreat'; ai.t = rand(0.3, 0.5); return true; }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!f.canAct() || !f.grounded || m.kind === 'throw' || m.proj) return false;
    const left = p.mdur[0] - p.mt;
    // Kage swings a slow cut from just outside his own reach: the staff is longer. Stop-thrust into his wind-up.
    if (dist > 175 && dist < 300 && left > 0.11 && chance(0.45)) { ai.startSeq(['move:s1']); return true; }
    // a flurry is read: the staff comes up across it (a parry when the timing is there, else a block) and the
    // riposte follows (on.parry / on.block)
    if (!m.unb && m.kind !== 'grab' && (kuroeMash(w) >= 7 || w.predictability(m.id) > 0.45) && chance(0.8)) {
      ai.block = rand(0.3, 0.45); f.ctrl.blockHeld = true;
      if (f.state !== 'block') f.setState('block');
      f.blockT = left < 0.14 ? 0 : PARRY_WINDOW + 0.05;
      return true;
    }
    return false;
  },
  // the stop-thrust that catches a dashing Kage is a critical
  crit(att, def) { return def.state === 'dash'; },
  on: {
    // a cut blocked on the staff: the shaft slides along it into a thrust (the counter, s1)
    block(ai, w) { if (chance(kuroeMash(w) >= 7 ? 0.75 : 0.35)) { ai.block = 0; ai.startSeq(['weapon'], 0.03); } },
    // a cut turned aside by the spinning staff: thrust while Kage recoils
    parry(ai) { if (chance(0.8)) { ai.block = 0; ai.startSeq(['weapon'], 0.05); } },
    // parried himself: no pride in it, step away once he can
    parried(ai) { ai.seq = null; if (chance(0.5)) { ai.plan = 'retreat'; ai.t = 0.5; } }
  }
};

// a little harder than before (a sub-boss), still the gentlest of Act I's four: his staff lands a touch heavier
Object.assign(ENEMIES.kuroe, { dmg: 1.15 });
