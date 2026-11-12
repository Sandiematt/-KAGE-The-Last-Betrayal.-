/* KAGE — Hollow Akari, Echo of the Memory Blade (core.echo2, a sub-boss): Kasumi-ryū, half-remembered.

   The Core's memory of Akari keeps the shape of her art and loses its precision. It still slips and crosses and cuts
   from behind, but its crossing step sometimes MISPLACES it (it lands short, in front of Kage, open and confused), it
   has fewer tools (no Kawarimi, no chain, no kunai thrown up at a jump-in: Hollow Fang, Hollow Step, one Hollow Opening
   a fight, the two-beat flurry, the sweep), it slips fewer blows, and after every flurry it stands in its recovery a
   long beat before it remembers to leave. A little harder than an ordinary sub-boss, well below Akari.

   How the player beats it: parry the late second fang late; punish the long recovery after its flurry; when it lands
   in front of you after its step, it is open; jump the sweep; do not mash (it still slips and cuts from behind). */

// an echo from the Core, met with Kage's best gear: it must still be a fight (base 440 hp, 0.98 dmg)
Object.assign(ENEMIES.hollow_akari, { hp: 580, dmg: 1.7 });

FIGHT_STYLES.hollow_akari = Object.assign(akariStyle({
  // fewer blows slipped, a longer rhythm of its own between slips, and its step sometimes lands it short
  evade: { chance: [0.42, 0.5, 0.5], cd: [1.9, 1.7, 1.7], cross: [0.5, 0.55, 0.55] },
  press: [[2.4, 3.0], [2.6, 3.2], [2.6, 3.2]], rest: [[1.6, 2.3], [1.4, 2.0], [1.4, 2.0]], stringBias: [0.55, 0.6, 0.6],
  kawarimi: false, bind: false, skyKunai: false, airCrit: false, closeAir: 160, rising: { cd: 3.2, startup: 0.16, tint: ECHO_TINT },
  crossId: 'hollowCross', crossO: { misplace: 0.35, tint: ECHO_TINT, glitch: 1, label: 'HOLLOW CROSS' },
  sweepId: 'hollowSweep', sweep: { windup: 0.44, dmg: 3, rise: 7, label: 'HOLLOW SWEEP', tint: ECHO_TINT, glitch: 1 }, turtle: 0.7,
  restDist: 240, restAbility: 0.4, caughtPosture: 46, parriedPosture: 14, parriedStun: 0.9, awayOnLand: 0.2
}), {
  art: 'Kasumi-ryū, half-remembered',
  tune: { pref: 190, aggr: 0.55, block: 0.06, parry: 0.08, dodge: 0.2, react: [0.05, 0.1], combo: [1, 2], punish: 0.7, grab: 0, jump: 0.03, kunai: 0.1, dashIn: 0.15 },
  poise: 1.4,
  postureRegen: 10,
  parriedStun: 0.85,
  footwork: { away: 0.45, stepIn: 150 },
  strings: [
    // the two fangs, then it stands in the follow-through (the memory forgets to leave)
    { seq: ['move:tw1', 'move:tw2', 'wait:0.25'], range: [0, 170], w: 2 },
    // the delayed fang, held longer than hers
    { seq: ['move:tw1', 'wait:0.36', 'move:tw2_diagDown', 'wait:0.22'], range: [0, 170], w: 1.5, tell: 0.18 },
    { seq: ['fwd', 'move:tw1_fwd', 'move:tw2'], range: [150, 290], w: 1.2 },
    { seq: ['ab:hollowCross'], range: [110, 340], w: 1, when: ai => (ai.cds.hollowCross || 0) <= 0 },
    // its second phase: three beats, the third late
    { seq: ['move:tw1', 'move:tw2', 'wait:0.3', 'move:tw4_diagUp', 'wait:0.22'], range: [0, 170], w: 1.6, phase: 1, tell: 0.16 }
  ],
  // every follow-through is slow to come back out of
  init(f) { f.recoveryMul = (f.recoveryMul || 1) * 1.12; }
});

// its crossing step: Akari's own, slower to gather and to glint, lighter, sometimes misplaced
BOSS_ABILITIES.hollowCross = { id: 'hollowCross', cd: 3.4, range: [0, 360], chance: 0,
  run(f, w, ai, p, o) { akariShift(f, w, ai, p, Object.assign({ tell: 0.4, glint: 0.3, dmg: 6, misplace: 0.35, label: 'HOLLOW CROSS', tint: ECHO_TINT, glitch: 1 }, o)); } };
// its blink (Hollow Step, from the echo's own list) is the same misplaced step: sometimes it comes out short, in front
// of Kage, open and confused
BOSS_ABILITIES.hollowStep.run = function (f, w, ai, p, o) {
  akariShift(f, w, ai, p, Object.assign({ tell: 0.46, glint: 0.3, dmg: 6, misplace: 0.4, label: 'HOLLOW STEP', tint: ECHO_TINT, glitch: 1 }, o));
};
// its sweep: slower, lighter
BOSS_ABILITIES.hollowSweep = { id: 'hollowSweep', cd: 6, range: [0, 190], chance: 0,
  run(f, w, ai, p, o) { BOSS_ABILITIES.akariSweep.run(f, w, ai, p, Object.assign({ windup: 0.44, dmg: 3, rise: 7, label: 'HOLLOW SWEEP', tint: ECHO_TINT, glitch: 1 }, o)); } };
