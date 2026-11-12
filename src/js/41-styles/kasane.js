/* KAGE — Kasane, the Ledger Warden (act2.sub4): kusarigamajutsu.
   (This file also holds the two small helpers the four Act II styles share: act2Mash and act2Guard.)

   The school: the chain-and-sickle of the old intelligence corps, kusarigama as a keeper of accounts. The weighted chain
   (h2) is the long arm: swung, then thrown to wrap a man from ten feet away and haul him in; the sickle (h1, h3 and the
   directional cuts) is the short one, the reaping cut that follows the pull. He stands at the end of the chain, where
   the sickle cannot be reached and the weight can, and he keeps that distance (zanshin, then the step back out). A
   Kage who closes inside the chain is inside his reach, and the sickle is a short, hooked blade that he handles well
   too: he gives ground, or he guards, and the chain comes again from the new distance. Nothing he does is hurried; every
   entry is made once and checked twice.

   New technique: Ledger Chain (BOSS_ABILITIES.kasaneChain). He lets the weight out and spins it overhead (the tell: the
   chain's hum, a glint on the weight, a long half second), then throws. A clean hit hauls Kage in, and the sickle
   reaps him on the way (a counter-hit critical: the reap lands on a man he has just pulled). A GUARD HELD AGAINST THE
   CHAIN IS THE WRONG ANSWER: the chain wraps it, he is dragged in with posture crushed and the reap comes a beat later.
   PARRY the weight and the chain falls slack, the warden reels, his posture is wrecked and he stands open. Or get inside
   it: the weight has a dead zone at his feet.

   What it teaches: the parry as the answer to range, and not turtling. A guard held in front of the chain is what he
   wants; so the turtle is hauled in and reaped. Spamming is worse: the weight is thrown into the swing. The hardest of
   Act II's four, the last test before Akari: patient, with real reach, and every chain throw is a question that needs
   a precise answer. */

// how many attacks Kage has started in the last 4 s: a fighter who mixes, waits and moves rarely passes 6, a masher
// sits at 9 to 12 (world.hitLog logs every move he starts). Shared by the four Act II styles.
function act2Mash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}
// The timed guard the Act II styles share: a foe that has decided to parry a blow raises its guard so that it lands
// `win` seconds before the blow does (blockT under PARRY_WINDOW is a parry). Returns true on the frame it fires. Called
// from the style's per-tick hook (each style's `init` wraps its AI's update) so the timing does not depend on how fast
// the AI reacts.
function act2Guard(ai, p, dist, win) {
  const f = ai.f;
  if (!f.grounded || !f.canAct() || p.state !== 'move' || !p.move || p.mphase !== 0 || p.mdur[0] - p.mt >= win || !ai.threatened(p, dist)) return false;
  ai.seq = null; ai.block = 0.3; f.ctrl.blockHeld = true; f.setState('block'); f.blockT = 0; f.facing = Math.sign(p.x - f.x) || f.facing;
  return true;
}

const KASANE_CHAIN = { whirl: 0.5, dmg: 8 };

// Ledger Chain: the weight spun overhead with a glint on it, then thrown (the real chain move, h2: a hit pulls Kage in,
// a block is entangled (on.blocked below), a parry leaves the warden open (on.parried))
BOSS_ABILITIES.kasaneChain = { id: 'kasaneChain', cd: 5.5, range: [150, 350], chance: 0.7,
  run(f, w, ai) {
    const K = KASANE_CHAIN, W = K.whirl * ai.p.windup;
    f.telegraph = W;
    f.startAbility({ dur: W + 0.1, rate: 24, trail: true,
      pose: (f, t) => MOVES.h2.w,
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'LEDGER CHAIN', f.accent || '#b48ae6'); AudioManager.play('chain', { pitch: 0.8 }); },
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 12, dt);
        if (t < W) {
          if (((t * 60) | 0) % 5 === 0) w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#e0ccff');
          return;
        }
        f.facing = w.player.x > f.x ? 1 : -1;
        f.endAbility(w);
        if (f.startMove('h2', w)) { f.chainAb = w.time; AudioManager.play('chain'); }
      } });
  } };

FIGHT_STYLES.kasane = {
  art: 'Kusarigamajutsu',
  // patient: he holds the end of the chain, guards often, and gives ground when Kage closes
  tune: { pref: 255, aggr: 0.6, block: 0.46, parry: 0.22, dodge: 0.08, react: [0.09, 0.17], combo: [2, 3], punish: 0.85, grab: 0, jump: 0, dashIn: 0.08 },
  poise: 0.9,
  parriedStun: 0.7,
  footwork: { away: 0.55, stepIn: 150 },
  strings: [
    // the signature: the weight spun, then thrown (the tell is the technique's own)
    { seq: ['ab:kasaneChain'], range: [170, 350], w: 4 },
    // the short throw: a flick of the weight with a shorter tell, and the reap behind it
    { seq: ['move:h2', 'weapon'], range: [150, 340], w: 2, tell: 0.26 },
    // sickle, chain, reap: the weapon's own string, thrown from the middle of his reach
    { seq: ['weapon', 'weapon', 'weapon'], range: [105, 205], w: 3, tell: 0.12 },
    // inside the chain: the sickle's short cuts, then he is out of the pocket
    { seq: ['w:diagDown', 'w:up', 'back'], range: [0, 125], w: 2.5 },
    { seq: ['weapon', 'w:diagUp'], range: [0, 135], w: 2 },
    // a step back out of the pocket, then the weight from the new distance
    { seq: ['back', 'wait:0.16', 'ab:kasaneChain'], range: [0, 150], w: 2.5 },
    // a guard held up: the overhead hook comes down on it, and the chain wraps what is left
    { seq: ['w:down'], range: [0, 200], w: 3, tell: 0.2, when: (ai, p) => p.state === 'block' },
    { seq: ['move:h2', 'weapon'], range: [120, 340], w: 4, tell: 0.2, when: (ai, p) => p.state === 'block' },
    // from outside: the dash with the sickle
    { seq: ['dash', 'weapon'], range: [340, 520], w: 1.4, tell: 0.24 },
    // an airborne Kage: the rising hook
    { seq: ['w:up'], range: [0, 230], w: 6, when: (ai, p) => !p.grounded }
  ],
  init(f, world) {
    const ai = f.ai, update = ai.update.bind(ai);
    ai.update = function (dt) {
      update(dt);
      const w = this.world, p = w.player;
      if (!f.alive || !p || !p.alive || w.phase !== 'fight') return;
      const dist = Math.abs(p.x - f.x);
      // the warden's guard: a read habit is parried on the beat (never the chain: that is for him to throw)
      if (p.state === 'move' && p.move) {
        if (p.move !== this.ksSeen) {
          this.ksSeen = p.move;
          const read = act2Mash(w) >= 6 || w.predictability(p.move.id) > 0.45;
          this.ksParry = chance(read ? 0.8 : 0.22);
        }
        if (this.ksParry && !p.move.proj && p.move.kind !== 'grab' && !p.move.unb && act2Guard(this, p, dist, 0.075)) this.ksParry = false;
      } else this.ksSeen = null;
    };
  },
  decide(ai, p, dist, toward) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    const mash = act2Mash(w);
    // a flurry: he does not trade; the weight into it from range, the guard up close
    if (mash >= 6) {
      if (dist > 170 && chance(0.7)) { ai.startSeq(['move:h2', 'weapon'], 0.12); return true; }
      if (dist < 150 && chance(0.5)) { ai.block = rand(0.3, 0.45); return true; }
    }
    // his own posture failing: give ground and let it come back
    if (f.guard < 35 && dist < 240 && chance(0.55)) { ai.plan = 'retreat'; ai.t = rand(0.3, 0.5); return true; }
    // Kage's posture failing: the full account, chain and reap into it
    if (p.guard < 40 && dist > 110 && dist < 330 && chance(0.55)) { ai.startSeq(['weapon', 'weapon', 'weapon']); return true; }
    // too close for the chain: step out to the end of it
    if (dist < 95 && chance(0.4)) { ai.startSeq(['back', 'wait:0.14', 'ab:kasaneChain']); return true; }
    return false;
  },
  // the chain that catches a rushing Kage, and the reap that follows a pull, are criticals
  crit(att, def, m, world) { return m.id === 'h3' && (att.chainCrit || 0) > world.time; },
  on: {
    // the weight landed: the reap comes at once on the man he has just pulled in (a critical)
    land(ai, w, other, m) {
      const f = ai.f;
      if (!m || m.id !== 'h2') return;
      f.chainCrit = w.time + 0.9;
      ai.startSeq(['weapon'], 0.06);
    },
    // a guard held against the chain is wrapped: dragged in, posture crushed, and the reap a beat behind it. The beat
    // is long enough for a fresh guard (a parry of the reap) to answer.
    blocked(ai, w, other, m) {
      const f = ai.f;
      if (!m || m.id !== 'h2') return;
      f.chainCrit = 0;
      w.fx.popText(other, 'ENTANGLED', f.accent || '#b48ae6'); AudioManager.play('chain', { pitch: 0.9 });
      Budo.postureHit(w, other, 24, other.x, other.y - other.height() * 0.6, -f.facing, f);
      if (other.broken) return;
      const dest = f.x + f.facing * 78 * f.scale;
      other.move = null; other.setState('hit'); other.hitstun = 0.32; other.hitGut = true; other.vx = (dest - other.x) * 7;
      ai.startSeq(['weapon'], 0.3);
    },
    // a parried chain: the weight falls slack, the warden is wrecked and open
    parried(ai, w, other, m) {
      const f = ai.f; ai.seq = null; f.chainCrit = 0;
      if (m && m.id === 'h2') {
        Budo.postureHit(w, f, 32, f.x, f.y - f.height() * 0.6, -f.facing, other);
        if (f.alive && !f.broken) w.fx.popText(f, 'OPEN', C.gold);
      } else if (chance(0.4)) { ai.plan = 'retreat'; ai.t = 0.4; }
    },
    // a cut turned aside on the sickle's hook: the answer comes straight back, a beat late (a parry of it is possible)
    parry(ai) { if (chance(0.7)) { ai.block = 0; ai.startSeq(['weapon'], rand(0.16, 0.24)); } },
    block(ai, w) { if (chance(act2Mash(w) >= 6 ? 0.6 : 0.25)) { ai.block = 0; ai.startSeq(['weapon'], 0.1); } }
  }
};

// a sub-boss a step above Act I's and the hardest of Act II's four: heavier stamina and a weightier chain
Object.assign(ENEMIES.kasane, { hp: 470, dmg: 1.03 });
