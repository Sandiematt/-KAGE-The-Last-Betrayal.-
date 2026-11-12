/* KAGE — Hollow Raikon, Echo of the Lightning Ascendant (core.echo1, a sub-boss): Jigen-ryū remembered wrongly.

   The Core's memory of Raikon keeps the shape of his school and loses its certainty. It still raises the blade into
   tonbo and still means the one cut, but the rhythm is broken: it hesitates before it strikes, its Ichi no Tachi
   STUTTERS (a twitch toward the cut that freezes back into tonbo, then the real cut), and it is slow to come back out of
   every follow-through. Fewer techniques than Raikon: the single overhead and kesa cuts, the stuttering Ichi no Tachi,
   and its corrupted Thunder Swing and Storm Break (CORE_ECHO_MOVES). No Redline, no shoulder check, no thunder drum, no
   lightning follow-up.

   How the player beats it: do not parry the twitch, parry the cut (wait for the second glint); punish the long
   follow-through; jump or dash the violet wave; do not mash (it still reads a repeated move and punishes the whiff) and
   do not turtle (the overhead comes down on a held guard). */

// a little harder than before (it fought on the generic boss strings at 480 hp, 1.0 dmg; against a fully geared Kage
// in the Core it fell too easily), still well below Raikon in tempo and in technique
Object.assign(ENEMIES.hollow_raikon, { hp: 620, dmg: 1.35 });

// the stuttering Ichi no Tachi: Raikon's own code with the echo's numbers (violet, glitching, lighter, slower back out)
BOSS_ABILITIES.hollowIchi = { id: 'hollowIchi', cd: 7, range: [230, 560], chance: 0,
  run(f, w, ai, p) { BOSS_ABILITIES.ichiNoTachi.run(f, w, ai, p, { label: 'HOLLOW ICHI', tint: ECHO_TINT, glitch: 1, windup: 0.66, stutter: 0.34, dmg: 0.75, gb: 70, recover: 1.35 }); } };

// its long wind-ups are not thrown into a blade already swinging at it (the memory still knows that much)
const hollowRaikonClear = (f, w, ai, p, dist) => !(p.state === 'move' && dist < 340);
for (const id of ['hollowThunder', 'hollowBreak', 'hollowIchi']) BOSS_ABILITIES[id].cond = hollowRaikonClear;

FIGHT_STYLES.hollow_raikon = {
  art: 'Jigen-ryū, remembered wrongly',
  tune: { pref: 175, aggr: 0.72, block: 0.45, parry: 0.3, dodge: 0.05, react: [0.16, 0.28], combo: [1, 2], punish: 0.9, grab: 0.05, jump: 0, kunai: 0, dashIn: 0 },
  poise: 0.85,
  postureRegen: 10,
  parriedStun: 0.75,     // it reels longer than he did
  footwork: { away: 0.2, stepIn: 120 },
  strings: [
    // the one cut, after a hesitation (the memory falters, then commits)
    { seq: ['wait:0.3', 'w:down'], range: [0, 205], w: 2, tell: 0.26 },
    { seq: ['w:diagDown'], range: [0, 205], w: 1.5, tell: 0.24 },
    // the cut that stutters: a kesa cut, a dead beat, and the rising return it half remembers
    { seq: ['w:diagDown', 'wait:0.28', 'w:up'], range: [0, 200], w: 1.3, tell: 0.24 },
    // a step in that stops dead, then the horizontal cut
    { seq: ['fwd', 'wait:0.35', 'w:fwd'], range: [150, 300], w: 1.2, tell: 0.2 },
    // the stuttering Ichi no Tachi from range
    { seq: ['ab:hollowIchi'], range: [230, 560], w: 3, when: (ai, p, dist) => (ai.cds.hollowIchi || 0) <= 0 && hollowRaikonClear(ai.f, ai.world, ai, p, dist) }
  ],
  // every follow-through is slow to come back out of
  init(f) { f.recoveryMul = (f.recoveryMul || 1) * 1.12; },
  decide(ai, p, dist) {
    const f = ai.f;
    if (!f.canAct()) return false;
    // a guard held in front of it: the overhead comes down on it (the memory of the shoulder is gone)
    if (p.state === 'block' && p.st > 0.5 && dist < 190 && chance(0.55)) { f.telegraph = Math.max(f.telegraph, 0.3 * ai.p.windup); ai.startSeq(['w:down'], 0.3 * ai.p.windup); return true; }
    // a Kage who keeps swinging at it: it sets its guard and waits for the blow (answered from on.block)
    const t = ai.world.time; ai._press = (ai._press || []).filter(x => t - x < 2.5);
    if (p.state === 'move' && p.mphase <= 1 && dist < 320 && chance(ai._press.length >= 2 ? 0.8 : 0.3)) { ai.block = rand(0.4, 0.6); return true; }
    return false;
  },
  // (the same, when it sees the blow coming in time) at it is met with the guard, and every blocked blow is remembered and answered
  respond(ai, p, dist, toward, m) {
    const f = ai.f, t = ai.world.time;
    ai._press = (ai._press || []).filter(x => t - x < 2.5);
    if (ai._press.length >= 2 && f.grounded && f.canAct() && !m.unb && m.kind !== 'grab' && chance(0.75)) { f.ctrl.blockHeld = true; f.setState('block'); f.blockT = 0; ai.block = rand(0.3, 0.45); return true; }
    return false;
  },
  // the cut that answers its own parry (Kage's deflected blade) is a critical
  crit(att, def) { return def.deflected && def.state === 'stun'; },
  on: {
    hurt(ai, w) { (ai._press = ai._press || []).push(w.time); },
    // a blocked blow is answered at once with the kesa cut, into Kage's next wind-up
    block(ai, w, by) {
      (ai._press = ai._press || []).push(w.time);
      if (!ai.seq && chance(0.5)) { ai.block = 0; ai.startSeq(['w:diagDown'], 0.06); }
    },
    // a parried Ichi no Tachi: it reels and its posture goes, like his
    parried(ai, w, by, m) {
      const f = ai.f;
      if (m && m.tech === 'ichi') { if (f.state === 'stun') f.stunT = Math.max(f.stunT, 1.2); Budo.postureHit(w, f, 30 / FIGHT_STYLES.hollow_raikon.poise, f.x, f.y - 120 * f.scale, -f.facing, by); }
    }
  }
};
