/* KAGE — Echo Warden (a boss-type echo of the Core, the Echo Trials' boss): Kaeshi-ryū, the school of the return.

   The school. Kaeshi-ryū is the art of go no sen, "the initiative after the other's": it never begins the exchange it
   cannot win. The Warden stands behind a guard (chūdan no kamae), the cutter blade held across the line, lets Kage commit,
   turns the blow aside and answers it in the same breath (kaeshi-waza), then steps out of reach before the answer can be
   answered (zanshin). It is a counter fighter: patient, hard to hurry, and slow to act first. What it does start is
   measured: one cut, or a cut and a delayed second cut that punishes a guard raised too early (okuri-waza).

   Its game plan. In reach, its cuts are single and deliberate (one kesa cut, then it stands in the follow-through); from
   mid-range it feints with a lunging cut and finishes after a beat. Pressed (Kage's blows on it, or its posture low) it
   takes the counter stance (the echo of Takashi's Guard Return, `hollowReturn`): strike into it and it is turned aside
   and answered. A cut it parries is answered at once. A guard held near it is answered by the overhead that crushes it.
   Its own cut blocked, it steps back out of the pocket.

   How the player beats it: do not attack into its guard or its counter stance; bait the first cut and parry it (it
   reels long and loses a lot of posture); let a lunging cut go by and punish the beat; vary the strikes (it reads a
   repeated one); get behind it (its counter is a front guard); and wait out the stance, which leaves it open.

   Everything is the style's own: strings, decide, respond and on.* hooks, over the techniques it already has (lunge,
   moonDash, teleport, clones, groundSlam, and `hollowReturn`, the counter stance). It adds none. */

// a counter fighter hits less often than the placeholder did, and every blow of it is a lesson
Object.assign(ENEMIES.echo_warden, { dmg: 0.78 });

const WARDEN_STYLE = { returnCd: 4.2, pressure: 2, riposteDelay: 0.07 };
const wdReady = (ai, id) => (ai.cds[id] || 0) <= 0;
function wdPressure(ai) { const t = ai.world.time; ai._press = (ai._press || []).filter(x => t - x < 2.5); return ai._press.length; }
function wdSeq(ai, seq, tell) {
  const f = ai.f, t = (tell || 0) * ai.p.windup;
  if (t) { f.telegraph = Math.max(f.telegraph, t); AudioManager.play('teleport'); }
  ai.startSeq(seq, t); return true;
}
// the counter stance: the echo of Guard Return (Takashi's, tinted violet), thrown on its own cool-down
function wdReturn(ai, p) {
  const a = BOSS_ABILITIES.hollowReturn, f = ai.f;
  if (!a || !wdReady(ai, 'hollowReturn') || !f.canAct() || !f.grounded) return false;
  ai.seq = null; ai.cds.hollowReturn = Math.max(a.cd, WARDEN_STYLE.returnCd); a.run(f, ai.world, ai, p);
  return true;
}

FIGHT_STYLES.echo_warden = {
  art: 'Kaeshi-ryū · go no sen',
  // patient and guarded: it waits behind its guard, parries well, rarely dodges, and punishes everything
  tune: { pref: 150, aggr: 0.36, block: 0.55, parry: 0.24, dodge: 0.06, react: [0.15, 0.26], combo: [1, 2], punish: 0.9, grab: 0.1, jump: 0, kunai: 0, dashIn: 0.05 },
  poise: 0.85,
  postureRegen: 14,
  parriedStun: 0.62,
  footwork: { away: 0.45, stepIn: 150 },
  strings: [
    // the measured cut: one kesa cut, then it stands in the follow-through (no second blow)
    { seq: ['w:diagDown'], range: [0, 195], w: 2.2, tell: 0.26 },
    // the feint: a lunging cut from the edge of its reach, a beat of stillness, then the second cut, aimed where a guard
    // raised against the first would be (okuri-waza)
    { seq: ['w:fwd', 'wait:0.32', 'w:diagDown'], range: [110, 270], w: 1.6, tell: 0.22 },
    // the rising cut that answers a jump
    { seq: ['w:up'], range: [0, 220], w: 2.4, when: (ai, p) => !p.grounded, tell: 0.2 },
    // the counter stance, when the room is tight
    { seq: ['ab:hollowReturn'], range: [40, 240], w: 1.6, when: ai => wdReady(ai, 'hollowReturn') && wdPressure(ai) >= 1 }
  ],
  decide(ai, p, dist, toward) {
    const f = ai.f;
    if (!f.canAct()) return false;
    // a guard held near it is never safe: the overhead that crushes it
    if (p.state === 'block' && p.st > 0.55 && dist < 190 && chance(0.6)) return wdSeq(ai, ['w:down'], 0.3);
    // pressed, or its posture low: the counter stance
    if (dist > 50 && dist < 250 && p.state !== 'move' && (wdPressure(ai) >= WARDEN_STYLE.pressure || f.guard < 45) && chance(0.4)) return wdReturn(ai, p);
    // it does not chase: out of reach it stands behind its guard and lets Kage come
    if (dist > 230 && dist < 420 && chance(0.4)) { ai.plan = 'hold'; ai.t = rand(0.3, 0.55); return true; }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f;
    // Kage commits to a blow within its reach: go no sen, the counter stance as it comes (a repeated blow most of all)
    if (m && f.grounded && f.canAct() && m.kind !== 'grab' && dist < 200 && wdReady(ai, 'hollowReturn')) {
      const read = ai.world.predictability(m.id) > 0.4;
      if (chance(read ? 0.6 : 0.16)) return wdReturn(ai, p);
    }
    return false;
  },
  // its own criticals: a counter-hit on a blow in its wind-up is the core's; here also the cut that answers its own parry
  // (Kage's deflected blade) and the punish of a repeated move
  crit(att, def, m) { return (def.deflected && def.state === 'stun') || (att.punishMove && att.punishMove === att.move); },
  on: {
    hurt(ai, w) { (ai._press = ai._press || []).push(w.time); },
    block(ai, w) { (ai._press = ai._press || []).push(w.time); },
    // it turned Kage's cut aside: the answer, at once
    parry(ai, w) {
      (ai._press = ai._press || []).push(w.time);
      const f = ai.f;
      if (f.alive && !f.broken && (!f.abil || !f.abil.onCounter)) { ai.seq = null; ai.block = 0; ai.startSeq(['w:fwd'], WARDEN_STYLE.riposteDelay); w.fx.popText(f, 'KAESHI', '#b48aff'); }
    },
    // its cut was blocked: it steps back out of the pocket before the answer
    blocked(ai) { if (ai.f.state === 'move' && chance(0.6)) { ai.seq = null; ai.plan = 'retreat'; ai.t = rand(0.3, 0.5); } },
    // its cut was parried: the reel is long, and a cut parried is a lesson (the same cut is not thrown twice running)
    parried(ai, w) { ai.cds.hollowReturn = Math.max(ai.cds.hollowReturn || 0, 1.2); }
  }
};
