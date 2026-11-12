/* KAGE — Young Rem's fighting style: the family form at play (interlude.spar, a memory).

   The school: Takashi's Ittō-ryū as a gifted, impatient boy runs it: the family form (FAMILY_FORM 'rem') faster than
   Kage can, with a grin. It is a friendly bout between brothers and it can never be lost (Logic.fightFormat 'spar'), so
   this style is a light one: a playful rhythm (he bounces on his feet, never presses a string for long, and breaks off
   to see what Kage does) and one clear lesson, told plainly. Before the form he stops and flashes his eyes (the tell:
   a held beat, a grin); before his rising cut he does too. Block or parry the rising cut, then step in under his
   landing. A parry is the thing that makes him laugh: he reels (parriedStun) and it is Kage's cut to take.

   What it teaches: the parry, safely. His cuts are quick but light and the tell is long, so a late guard is a block
   and an early one a parry; nothing here is a guard-crusher and he never throws, grabs or answers a flurry in anger. */

function youngRemMash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}

FIGHT_STYLES.young_rem = {
  art: 'Ittō-ryū · the family form',
  // quick feet, a short temper for patience: he never stands long in one place
  tune: { pref: 175, aggr: 0.46, block: 0.16, parry: 0, dodge: 0.3, react: [0.18, 0.3], combo: [1, 2], punish: 0.45, grab: 0, jump: 0.1, kunai: 0, dashIn: 0.12 },
  poise: 1.5,                     // a boy: his posture goes quickly...
  parriedStun: 0.95,              // ...and a parry leaves him reeling a long beat, laughing
  footwork: { away: 0.4, stepIn: 90 },
  strings: [
    // two light cuts
    { seq: ['weapon', 'weapon'], range: [0, 180], w: 3 },
    // the rising cut with a clear tell: block it or parry it, then step in under his landing
    { seq: ['move:k2'], range: [90, 260], w: 3, tell: 0.45 },
    // the long horizontal from a step away, telegraphed
    { seq: ['w:fwd'], range: [150, 290], w: 1.2, tell: 0.4 },
    // an airborne Kage: the rising cut
    { seq: ['w:up'], range: [0, 190], w: 4, when: (ai, p) => !p.grounded }
  ],
  decide(ai, p, dist) {
    const f = ai.f;
    if (!f.canAct()) return false;
    // a bout is not a fight: now and then he skips back and bounces to see what Kage does
    if (dist < 220 && chance(0.2)) { ai.plan = 'strafe'; ai.strafeDir = chance(0.5) ? 1 : -1; ai.t = rand(0.3, 0.55) * ai.p.idle; return true; }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!f.canAct() || !f.grounded || m.proj) return false;
    // he skips back out of a flurry, laughing; he never guards against one
    if (youngRemMash(w) >= 6 && chance(0.5)) { f.ctrl.dashP = true; f.ctrl.dir = -toward; return true; }
    return false;
  },
  on: {
    // parried: he reels, and it is a lesson, not a punishment
    parried(ai, w, other) {
      const f = ai.f; ai.seq = null;
      if (f.alive) w.fx.popText(f, 'HEY!', f.accent || '#a970ff');
      if (chance(0.5)) { ai.plan = 'retreat'; ai.t = 0.45; }
    }
  },
  // the form's opening beat is a plain, readable tell (a held beat and a flash of the eyes): the lesson is in it
  init(f) {
    const ai = f.ai;
    if (ai && ai.form && ai.form.steps[0]) ai.form.steps[0].wait = 0.5;
    if (ai) { const sf = ai.startForm.bind(ai); ai.startForm = function () { f.telegraph = Math.max(f.telegraph, 0.5); sf(); }; }
  }
};
