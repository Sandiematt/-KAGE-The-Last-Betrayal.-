/* KAGE — Gonryu, the Gate Warden (act3.sub1): kanabo-jutsu.

   The school: the gate guard's iron-studded club, taught from an Order drill manual: no finesse, all weight. He stands
   in the gate (the pocket in front of him is his ground) and swings: the overhead (tetsu-uchi, m1) that splits the floor,
   the wide boulder swing (m2) that follows it, the ground smash (Gate Smash, from Takashi's own Ground Smash) and, when
   a man is too close for the club, a shove with its haft. His armour (heavyArmor) eats a light cut and his swings carry
   super armour: he is not stopped by being struck, only by being turned.

   Every blow of his is a guard-crusher (gb 140-160 on a posture of 100): a single blocked swing leaves Kage at the edge of
   breaking, two break him, and a broken Kage takes the smash as a critical. Blocking him is how you lose.

   New technique: Oshi, the haft shove (BOSS_ABILITIES.gonryuShove). A short shoulder-first step with the haft across his
   body (the tell: he drops his weight and the eyes flash), a hard shove that crushes a held guard (posture) and throws
   Kage back. It is what he does to a man who stands close mashing at his armour or holds his guard in front of him.
   Parry it, or step out of it; neither takes his swing.

   What it teaches: the parry, and the opening after a swing. His posture collapses fast for his size (poise, on.parried):
   two parries break him, and a parried Gonryu reels the longest of any sub-boss. His recoveries are honest and he never
   steps back (no footwork): dash out of a swing, then walk into the long recovery. Mashing at his armour is the way to
   lose: it is read, and the haft comes. The bluntest of Act III's four, the gate before the school. */

function gonryuMash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}

// Oshi: drop the weight, then a shoulder-first step and a shove of the haft that crushes a guard. Blockable (it is a
// shove, not a cut) but it eats most of the posture, and a parry turns it into the opening it should be.
BOSS_ABILITIES.gonryuShove = { id: 'gonryuShove', cd: 4.2, range: [0, 175], chance: 0.6,
  run(f, w, ai) {
    const W = 0.3 * ai.p.windup;
    f.telegraph = W;
    f.startAbility({ dur: W + 0.62, rate: 22, trail: false,
      pose: (f, t) => (t < W ? MOVES.m2.w : MOVES.m2.s),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'OSHI', f.accent || '#c9a45c'); AudioManager.play('charge', { pitch: 0.8 }); },
      update(f, w, t, dt) {
        if (t < W) { f.vx = damp(f.vx, 0, 12, dt); return; }
        if (!this.hit0) {
          this.hit0 = 1; f.vx = f.facing * 520; AudioManager.play('heavyswing', { pitch: 0.7 });
          this.hit = Combat.area(w, f, fbox(f, 0, -200, 120, 170), { dmg: 8 * f.dmgMul, kb: 760, up: -60, hs: 0.42, imp: 2, hsnd: 'heavy', stamp: 'SHOVE', gb: 62, gonryuShove: 1 });
        }
        f.vx = damp(f.vx, 0, 9, dt);
        if (!this.tell && t > W + 0.3) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
      } });
  } };
for (const ph of ENEMIES.gonryu.phases) if (!ph.abilities.includes('gonryuShove')) ph.abilities.push('gonryuShove');
// the Gate Smash comes a little less often: the club's own strings are his main game
BOSS_ABILITIES.gateSmash.cd = 7;

FIGHT_STYLES.gonryu = {
  art: 'Kanabō-jutsu',
  // he walks to club's length and swings; he never guards, never dodges, never steps back
  tune: { pref: 150, aggr: 0.66, block: 0.04, parry: 0, dodge: 0, react: [0.3, 0.46], combo: [1, 2], punish: 0.55, grab: 0, jump: 0, dashIn: 0.04 },
  poise: 1.3,                     // all that weight, off its feet: his posture goes fast (two parries break it)
  postureRegen: 10,
  parriedStun: 1.05,              // the longest of any sub-boss: turn the swing and the club is a long way out of line
  footwork: { away: 0, stepIn: 90 },
  strings: [
    // tetsu-uchi: the overhead that splits the floor (jump or dash out of it, or parry it): telegraphed
    { seq: ['move:m1'], range: [70, 250], w: 3, tell: 0.42 },
    // the overhead, then the boulder swing behind it (the first dodged leaves the second waiting)
    { seq: ['weapon', 'weapon'], range: [60, 240], w: 2.2, tell: 0.38 },
    // the boulder swing from the edge of his reach: a long, lunging arc
    { seq: ['w:fwd'], range: [150, 330], w: 2.5, tell: 0.4 },
    // the landslide diagonal
    { seq: ['w:diagDown'], range: [100, 260], w: 1.2, tell: 0.38 },
    // a man in front of the haft: the shove
    { seq: ['ab:gonryuShove'], range: [0, 165], w: 3.5 },
    // a raised guard in front of him: the bell (overhead, crushes), or the shove
    { seq: ['w:down'], range: [0, 260], w: 4, tell: 0.38, when: (ai, p) => p.state === 'block' },
    { seq: ['ab:gonryuShove'], range: [0, 165], w: 4, when: (ai, p) => p.state === 'block' },
    // an airborne Kage: the rising swing
    { seq: ['w:up'], range: [0, 260], w: 6, when: (ai, p) => !p.grounded }
  ],
  decide(ai, p, dist) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // a flurry at his armour: the haft
    if (dist < 160 && gonryuMash(w) >= 6 && chance(0.5) && (ai.cds.gonryuShove || 0) <= 0) { ai.startSeq(['ab:gonryuShove']); return true; }
    // Kage's posture is failing: the swing that finishes the guard
    if (p.guard < 38 && dist < 250 && chance(0.55)) { ai.startSeq(['move:m1'], 0.3 * ai.p.windup); f.telegraph = 0.3 * ai.p.windup; return true; }
    return false;
  },
  // he never answers a cut, he takes it on the armour: a flurry only gets the haft
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!f.canAct() || !f.grounded || m.proj) return false;
    if (dist < 165 && gonryuMash(w) >= 6 && (ai.cds.gonryuShove || 0) <= 0 && chance(0.45)) { ai.startSeq(['ab:gonryuShove']); return true; }
    return true;
  },
  // the shove that catches a man mid-cut is a critical like any counter-hit; the smash on a broken guard already is
  on: {
    // a light cut the armour ate: he turns the haft on the man who threw it
    hurt(ai, w, other, m) {
      const f = ai.f;
      if (!m || (m.imp || 0) > 1 || m.kd || !f.canAct() || ai.seq || Math.abs(other.x - f.x) > 150 || (ai.cds.gonryuShove || 0) > 0) return;
      if (chance(gonryuMash(w) >= 6 ? 0.55 : 0.18)) ai.startSeq(['ab:gonryuShove'], 0.04);
    },
    // a swing blocked: the guard is nearly gone; the next blow is the one that breaks it
    blocked(ai, w, other) {
      if (Math.abs(other.x - ai.f.x) < 200 && other.guard < 55 && chance(0.55)) ai.startSeq(['weapon'], 0.12 * ai.p.windup);
    },
    // parried: all that weight, off its line. His posture is his weakness.
    parried(ai, w, other) {
      const f = ai.f; ai.seq = null;
      Budo.postureHit(w, f, 22, f.x, f.y - f.height() * 0.6, -f.facing, other);
      if (f.alive && !f.broken) w.fx.popText(f, 'OFF BALANCE', C.gold);
    }
  }
};

// hard because every swing is a guard-crusher he commits to, not because he is a wall: a touch more weight behind the club
Object.assign(ENEMIES.gonryu, { dmg: 1.2 });
