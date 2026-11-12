/* KAGE — Garan, the Stormbroken (act1.sub2): karate and sumō.

   The school: a deserter's brawling, half Okinawan karate (body blows, the stepping lunge punch, the spinning side kick)
   and half sumō: the tachi-ai charge, the tsuppari palm barrage that drives a man backwards out of the ring, and the
   clinch and throw. He fights inside, under his iron armour (heavyArmor: a light blow neither staggers nor stops him),
   with slow wind-ups and terrible weight. A guard in front of him is clinched and thrown; a flurry of light cuts into
   his armour is shrugged off and answered with the same clinch, or with a body blow under his armour.

   New technique: Tsuppari (BOSS_ABILITIES.garanTsuppari). He settles into the shikiri crouch (the tell), then walks
   forward through four open-palm thrusts, each crushing a blocked guard (posture). Parry the first palm and the barrage
   is over; block all four and the guard is nearly gone; step back out of it and the last palm leaves him open.

   What it teaches: posture. Garan barely blocks: his posture is his weakness, and the parry is what takes it. A parried
   blow costs him far more posture than anyone else (on.parried), two clean parries break him, and a broken Garan takes
   the critical. Standing in front of his armour mashing is the way to lose: the armour eats the cuts and the clinch
   comes. Harder than Kuroe: he takes the fight to Kage. */

function garanMash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}

// Tsuppari: the shikiri crouch, then four palm thrusts walking forward. Each palm is its own blow (block, parry, or
// step out); a parried palm ends it (Combat.parry clears the ability). Every palm leans on the guard (gb).
BOSS_ABILITIES.garanTsuppari = { id: 'garanTsuppari', cd: 6, range: [0, 230], chance: 0.55,
  run(f, w, ai) {
    const W = 0.5 * ai.p.windup, N = 4, gap = 0.17;
    f.telegraph = W;
    f.startAbility({ dur: W + N * gap + 0.5, rate: 24,
      pose: (f, t) => (t < W ? MOVES.grab.w : (((t - W) / gap) | 0) % 2 ? MOVES.p2.s : MOVES.p1.s),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'TSUPPARI', f.accent || '#ff6a52'); AudioManager.play('charge'); },
      update(f, w, t, dt) {
        if (t < W) { f.vx = damp(f.vx, 0, 10, dt); return; }
        const i = ((t - W) / gap) | 0;
        if (i >= N) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (!this.tell) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
          return;
        }
        f.vx = f.facing * 170;
        if (i !== this.i) {
          this.i = i; AudioManager.play('swing', { pitch: 0.8 });
          const last = i === N - 1;
          Combat.area(w, f, fbox(f, 10, -195, 125, 95), { dmg: (last ? 10 : 6) * f.dmgMul, kb: last ? 520 : 240, hs: last ? 0.45 : 0.3, imp: last ? 2 : 1, hsnd: 'punch', gb: 24, stamp: last ? 'TSUPPARI' : null });
        }
      } });
  } };
for (const ph of ENEMIES.garan.phases) if (!ph.abilities.includes('garanTsuppari')) ph.abilities.push('garanTsuppari');

FIGHT_STYLES.garan = {
  art: 'Karate · Sumō',
  // he walks forward and swings; he hardly guards at all (the armour does that)
  tune: { pref: 120, aggr: 0.46, block: 0.1, parry: 0, dodge: 0.02, react: [0.06, 0.14], combo: [1, 3], punish: 0.6, grab: 0.3, jump: 0, dashIn: 0.1 },
  poise: 0.85,                    // blocked blows barely move him...
  parriedStun: 0.9,               // ...but a parried one leaves all that weight off balance
  footwork: { away: 0.12, stepIn: 110 },
  strings: [
    // jab, cross, rising uppercut: the body-blow string
    { seq: ['punch', 'punch', 'w:up'], range: [0, 140], w: 2.5 },
    // the iron palm and the hammer blow behind it (pa1 -> pa2, a knock-down): telegraphed
    { seq: ['weapon', 'weapon'], range: [0, 210], w: 2, tell: 0.3 },
    // the spinning side kick: slow, heavy, guard-crushing
    { seq: ['heavy'], range: [60, 180], w: 1.2, tell: 0.35 },
    // a guard in front of him: the clinch (sumō), or the overhead hammer
    { seq: ['grab'], range: [0, 115], w: 5, when: (ai, p) => p.state === 'block' },
    { seq: ['w:down'], range: [0, 190], w: 2, tell: 0.3, when: (ai, p) => p.state === 'block' },
    // from a step out: the stepping lunge punch, or the low sweep
    { seq: ['w:fwd', 'punch'], range: [140, 300], w: 2 },
    { seq: ['w:diagDown'], range: [120, 260], w: 1 },
    // an airborne Kage: the uppercut
    { seq: ['w:up'], range: [0, 170], w: 6, when: (ai, p) => !p.grounded }
  ],
  decide(ai, p, dist) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // a guard or a flurry right in front of him: hug and throw
    if (dist < 115 && (p.state === 'block' || garanMash(w) >= 7) && chance(0.55)) { ai.startSeq(['grab']); return true; }
    return false;
  },
  // a cut coming at him: he does not step back, he squares up behind his gauntlets (a plain block, never a parry: he
  // has no finesse) and answers off the block (on.block). A flurry is read and squared up to far more often.
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!f.canAct() || !f.grounded || m.kind === 'throw' || m.kind === 'grab' || m.proj || m.unb || dist > 340) return false;
    const read = garanMash(w) >= 7 || w.predictability(m.id) > 0.45;
    if (!chance(read ? 0.85 : 0.12)) return false;
    ai.block = rand(0.3, 0.45); f.ctrl.blockHeld = true;
    if (f.state !== 'block') f.setState('block');
    f.blockT = PARRY_WINDOW + 0.05;
    return true;
  },
  on: {
    // a light cut that his armour ate (he did not even flinch): clinch the man who threw it
    hurt(ai, w, other, m) {
      const f = ai.f;
      if (!m || (m.imp || 0) > 1 || m.kd || !f.canAct() || ai.seq || Math.abs(other.x - f.x) > 120) return;
      if (chance(garanMash(w) >= 7 ? 0.6 : 0.22)) ai.startSeq(['grab'], 0.04);
    },
    // a cut taken on the gauntlets: hug and throw if Kage is on top of him, else the stepping lunge punch into his
    // recovery
    block(ai, w, other) {
      const f = ai.f, d = Math.abs(other.x - f.x), read = garanMash(w) >= 7;
      if (!chance(read ? 0.85 : 0.45)) return;
      ai.block = 0; ai.startSeq([d < 110 ? 'grab' : 'w:fwd'], 0.03);
    },
    // his blow blocked: step through into the clinch
    blocked(ai, w, other) { if (Math.abs(other.x - ai.f.x) < 120 && chance(0.35)) ai.startSeq(['grab'], 0.08); },
    // parried: all that weight off balance. His posture is his weakness.
    parried(ai, w, other) {
      const f = ai.f; ai.seq = null;
      Budo.postureHit(w, f, 50, f.x, f.y - f.height() * 0.6, -f.facing, other);
      if (f.alive && !f.broken) w.fx.popText(f, 'OFF BALANCE', C.gold);
    }
  }
};

// a sub-boss a little harder than before: his tsuppari, his clinch and his charge do that; the body itself is a little
// less of a wall (420 -> 395 hp) so that parrying, not chopping at his armour, is what ends the fight
Object.assign(ENEMIES.garan, { hp: 395 });
