/* KAGE — Sayo, the Quiet Hand (act2.sub2): kodachijutsu, the art of the short blade and the counter.

   The school: the corps' close-quarters drill, a kodachi held reversed and low, the half-speed of a pupil who
   learned the form and not the temper. She does not chase. She walks into the pocket (a short blade needs it) and stands
   there, guard up, and waits to be cut at: the blow is turned aside on the beat it lands (a parry, never a hold) and the
   answer is already coming out of it (kaeshi: the weapon's own counter cut, a critical on a Kage still reeling from the
   deflection). Her cuts are short and quick, two or three, and over before a man can answer; the third one is the
   heavy low sweep that takes the legs. She tells a fighter's habits from his hands: a cut she has seen twice she turns
   aside nine times in ten; a cut she has not seen she reads half the time.

   New technique: Slow Hand (BOSS_ABILITIES.sayoSlowHand). The feint that punishes the parry. She lowers the blade and
   goes still (the tell, a long half second), then cuts late: a Kage who raised his guard on the tell has held it too
   long and is only blocking, and what follows a held guard is a posture-crushing overhead. Wait for it, guard on the
   beat or step out of it.

   What it teaches: feints and timing, and to throw. A string thrown on a rhythm is turned aside every time; a cut that
   is delayed, a cut that is cancelled into a guard (she is left parrying air), a different cut each time, beat her. The
   guard she holds in front of herself is no wall: a throw goes through it. A counterfighter does not like to be
   waited out. Harder than Tsugumi: close, quiet, and precise. */

function sayoCutId(m) { return m && m.id; }

// Slow Hand: still, the blade low, then the cut that comes a beat late
BOSS_ABILITIES.sayoSlowHand = { id: 'sayoSlowHand', cd: 5, range: [40, 190], chance: 0.5,
  run(f, w, ai) {
    const W = 0.34 * ai.p.windup;
    f.telegraph = W;
    f.startAbility({ dur: W + 0.1, rate: 20,
      pose: (f, t) => MOVES.k1.w,
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'SLOW HAND', f.accent || '#9b8cc9'); AudioManager.play('teleport', { pitch: 0.7 }); },
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 12, dt);
        if (t < W) { if (!this.g && t > W * 0.7) { this.g = 1; w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#e6dcff'); } return; }
        f.facing = w.player.x > f.x ? 1 : -1;
        f.endAbility(w);
        // the cut is late by design: the blade is held a beat longer than a guard raised on the tell can stay a parry
        if (f.startMove('k1', w)) { f.mdur[0] = Math.max(f.mdur[0], 0.42); f.slowHand = w.time; }
      } });
  } };

FIGHT_STYLES.sayo = {
  art: 'Kodachijutsu',
  // quiet and close: she lets him come and answers
  tune: { pref: 85, aggr: 0.32, block: 0.5, parry: 0.3, dodge: 0.06, react: [0.08, 0.15], combo: [1, 3], punish: 0.9, grab: 0.1, jump: 0, dashIn: 0.05 },
  poise: 0.9,
  parriedStun: 0.62,              // parry her counter and she reels (the deflection duel is hers to lose too)
  footwork: { away: 0.15, stepIn: 110 },
  strings: [
    // short and quick: two cuts, and the third, low, if the guard is down
    { seq: ['weapon', 'weapon'], range: [0, 150], w: 3 },
    { seq: ['weapon', 'weapon', 'weapon'], range: [0, 150], w: 1.8, tell: 0.2 },
    { seq: ['w:diagDown', 'w:diagUp'], range: [0, 165], w: 1.8 },
    // the feint: the delayed cut
    { seq: ['ab:sayoSlowHand'], range: [40, 190], w: 2.5 },
    // from a step out: the dash cut (telegraphed; this is the one to parry)
    { seq: ['dash', 'weapon'], range: [210, 400], w: 1.2, tell: 0.28 },
    // the guard in front of her is held: the clinch under it, or the overhead onto it
    { seq: ['grab'], range: [0, 100], w: 4, when: (ai, p) => p.state === 'block' },
    { seq: ['w:down'], range: [0, 185], w: 3, tell: 0.2, when: (ai, p) => p.state === 'block' },
    // an airborne Kage: the rising cut
    { seq: ['w:up'], range: [0, 200], w: 6, when: (ai, p) => !p.grounded }
  ],
  init(f, world) {
    const ai = f.ai, update = ai.update.bind(ai);
    ai.update = function (dt) {
      update(dt);
      const w = this.world, p = w.player;
      if (!f.alive || !p || !p.alive || w.phase !== 'fight') return;
      const dist = Math.abs(p.x - f.x);
      if (p.state === 'move' && p.move) {
        // once per blow: will she turn it aside? A habit (a cut seen before, a flurry) nearly always; a new cut, half.
        if (p.move !== this.syoSeen) {
          this.syoSeen = p.move;
          const id = sayoCutId(p.move), seen = (this.syoLast || []).includes(id);
          const read = act2Mash(w) >= 6 || w.predictability(id) > 0.45 || seen;
          this.syoParry = chance(read ? 0.92 : 0.5) && !p.move.proj && p.move.kind !== 'grab' && !p.move.unb;
          this.syoLast = (this.syoLast || []).concat(id).slice(-2);
        }
        if (this.syoParry && act2Guard(this, p, dist, 0.075)) this.syoParry = false;
      } else this.syoSeen = null;
    };
  },
  decide(ai, p, dist, toward) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // a flurry up close: she stands and turns it aside; the answer comes off the parry (on.parry)
    if (dist < 200 && act2Mash(w) >= 6 && chance(0.6)) { ai.block = rand(0.25, 0.4); return true; }
    // Kage's posture is failing: press the string into it
    if (p.guard < 40 && dist < 190 && chance(0.55)) { ai.startSeq(['weapon', 'weapon', 'weapon']); return true; }
    // her own posture failing: step back out of the pocket and let it come back
    if (f.guard < 35 && dist < 180 && chance(0.5)) { ai.plan = 'retreat'; ai.t = rand(0.3, 0.45); return true; }
    return false;
  },
  // the cut that answers a deflection is a critical
  crit(att, def, m) { return !!m.counter && def.deflected; },
  on: {
    // turned aside: the answer, the weapon's counter cut. Its timing is never the same twice: a beat after the parry (a
    // fresh guard on the glint parries it), or later still, when a reflex guard is only a block
    parry(ai) { if (chance(0.9)) { ai.block = 0; ai.startSeq(['weapon'], chance(0.55) ? rand(0.17, 0.24) : rand(0.3, 0.4)); } },   // on the beat, or a beat later still: a reflex guard is only a block
    // taken on the guard: a quick poke back into his recovery
    block(ai, w) { if (chance(act2Mash(w) >= 6 ? 0.65 : 0.4)) { ai.block = 0; ai.startSeq(['weapon'], 0.1); } },
    // her slow cut landed or was blocked: the overhead behind it, onto whatever guard is up
    land(ai, w, other, m) { if (ai.f.slowHand && w.time - ai.f.slowHand < 1.2 && m && m.id === 'k1' && chance(0.6)) { ai.f.slowHand = 0; ai.startSeq(['w:down'], 0.05); } },
    blocked(ai, w, other, m) { if (ai.f.slowHand && w.time - ai.f.slowHand < 1.2 && m && m.id === 'k1') { ai.f.slowHand = 0; ai.seq = null; ai.startSeq(['w:down'], 0.12); } },
    // parried herself: she gives up a half-step
    parried(ai) { ai.seq = null; if (chance(0.5)) { ai.plan = 'retreat'; ai.t = 0.35; } }
  }
};

// a sub-boss a step above Act I's: a little more stamina, a little more bite in the short blade
Object.assign(ENEMIES.sayo, { hp: 425, dmg: 1.1 });
