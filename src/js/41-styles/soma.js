/* KAGE — Soma, the Silent Blademaster (act3.sub4): odachi-jutsu.

   The school: the field odachi of the Silent War, a blade as long as a man, and the Order's first sword who swore the
   oath of silence: he says nothing and wastes nothing. The art of the long sword is the deliberate cut: the blade is too
   long to be hurried, so every cut is a decision, and the second is already decided when the first is thrown. His
   reach is the longest of any sword, and he keeps it: he stands at the edge of it and lets Kage come inside. He does not
   chase; he walks Kage down.

   New technique: Futatsu-uchi, the two beats (BOSS_ABILITIES.somaTwoBeat). The first beat is the wide horizontal cut
   (a glint on the blade as it comes round). The blade stops; a held beat, a second glint, and the second beat comes
   steps in and overhead, with the whole weight behind it. It is aimed at where Kage stands when it is released and it
   crushes a guard: the beat in between is the lesson. Parry the first beat and the second is never thrown. Block it
   and the second takes the guard apart. Back straight away from the first and the second step reaches him: it is aimed
   at the man who backs away. Step in under it, or round it, and the second whiffs: a long recovery.

   He keeps the story's Severing Cleave (the dragged low blade and the one rising cut) and, from the Oath of Silence,
   Severing Return (a quiet guard: strike it and it is turned aside, and the rising cut answers). He reads a move
   thrown three times and parries it (the sub-boss adaptation), and a cut turned aside on his own blade is answered
   with the return cut.

   What it teaches: parrying the first beat, and never retreating in a straight line from the second. The last test
   before Takashi and the hardest sub-boss in the game: the odachi is slower than the katana, and Soma is fair, but he
   never gives a second chance to the man who backs away. */

function somaMash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}
const SOMA_BEAT = { hold: 0.42, glint: 0.16, reach: 330 };

// Futatsu-uchi: the first beat (a wide horizontal cut, parriable), a held beat, the second (a stepping overhead cut that
// finds the man who backed away). Parry the first and the ability ends (Combat.parry clears it).
BOSS_ABILITIES.somaTwoBeat = { id: 'somaTwoBeat', cd: 4.4, range: [110, 340], chance: 0.7,
  run(f, w, ai) {
    const W = 0.32 * ai.p.windup, B = SOMA_BEAT, H = B.hold * Math.max(0.9, ai.p.windup);
    f.telegraph = W;
    f.startAbility({ dur: W + 0.2 + H + 0.2 + 0.66, rate: 22, trail: true,
      pose: (f, t) => somaBeatPose(f, t, W, H),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'FUTATSU-UCHI', f.accent || '#e8c25c'); AudioManager.play('teleport', { pitch: 0.75 }); this.a = 0; this.b = 0; },
      update(f, w, t, dt) {
        const p = w.player;
        // beat one: a wide horizontal cut at a step
        if (t < W) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (!this.g1 && t > W - 0.15) { this.g1 = 1; w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#ffe6a0'); }
          return;
        }
        if (!this.a) {
          this.a = 1; f.facing = p.x > f.x ? 1 : -1; f.vx = f.facing * 360; AudioManager.play('heavyswing', { pitch: 0.9 });
          this.h1 = Combat.area(w, f, fbox(f, -10, -215, 215, 150), { dmg: 12 * f.dmgMul, kb: 280, up: -40, hs: 0.38, imp: 2, hsnd: 'slash', stamp: 'FIRST BEAT', gb: 55, somaBeat: 1 });
        }
        if (!this.h1 && t < W + 0.2) this.h1 = Combat.area(w, f, fbox(f, -10, -215, 215, 150), { dmg: 12 * f.dmgMul, kb: 280, up: -40, hs: 0.38, imp: 2, hsnd: 'slash', stamp: 'FIRST BEAT', gb: 55, somaBeat: 1 });
        // the held beat: still, the blade drawn back over the shoulder; a second glint
        const t2 = W + 0.2 + H;
        if (t < t2) {
          f.vx = damp(f.vx, 0, 14, dt);
          if (!this.g2 && t > t2 - B.glint) { this.g2 = 1; f.telegraph = B.glint; w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#fff2c8'); AudioManager.play('orb', { pitch: 1.3 }); }
          return;
        }
        // beat two: the step in is aimed at where Kage stands now (it finds a man who backed away)
        if (!this.b) {
          this.b = 1; f.facing = p.x > f.x ? 1 : -1;
          const gap = Math.abs(p.x - f.x) - 120 * f.scale;
          f.vx = f.facing * clamp(gap * 5, 260, 660);
          AudioManager.play('heavyswing', { pitch: 0.7 }); w.fx.dust(f.x, 0, 8);
          this.h2 = Combat.area(w, f, fbox(f, -10, -270, 205, 270), { dmg: 17 * f.dmgMul, kb: 380, up: -300, hs: 0.5, kd: 1, imp: 3, hsnd: 'heavy', stamp: 'SECOND BEAT', gb: 105, somaBeat: 2 });
        }
        if (!this.h2 && t < t2 + 0.22) this.h2 = Combat.area(w, f, fbox(f, -10, -270, 205, 270), { dmg: 17 * f.dmgMul, kb: 380, up: -300, hs: 0.5, kd: 1, imp: 3, hsnd: 'heavy', stamp: 'SECOND BEAT', gb: 105, somaBeat: 2 });
        f.vx = damp(f.vx, 0, 9, dt);
        if (!this.tell && t > t2 + 0.34) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
      } });
  } };
function somaBeatPose(f, t, W, H) {
  return t < W ? MOVES.c1.w : t < W + 0.2 ? MOVES.c1.s : t < W + 0.2 + H ? MOVES.c3.a : MOVES.c3.s;
}
for (const ph of ENEMIES.soma.phases) if (!ph.abilities.includes('somaTwoBeat')) ph.abilities.push('somaTwoBeat');

FIGHT_STYLES.soma = {
  art: 'Ōdachi-jutsu',
  // deliberate: he holds the edge of the blade's reach and lets Kage come, then every cut is a decision
  tune: { pref: 215, aggr: 0.8, block: 0.42, parry: 0.14, dodge: 0.16, react: [0.1, 0.18], combo: [2, 3], punish: 0.85, grab: 0.03, jump: 0.02, dashIn: 0.05 },
  poise: 0.9,
  postureRegen: 14,
  parriedStun: 0.75,
  footwork: { away: 0.3, stepIn: 175 },
  strings: [
    // the two beats
    { seq: ['ab:somaTwoBeat'], range: [110, 340], w: 4, when: ai => (ai.cds.somaTwoBeat || 0) <= 0 },
    // the wide horizontal, then the rising return cut
    { seq: ['weapon', 'weapon'], range: [100, 270], w: 2.2, tell: 0.22 },
    // one long horizontal from the edge of the blade, then he steps out of the pocket
    { seq: ['w:fwd', 'back'], range: [170, 340], w: 2, tell: 0.18 },
    // from outside: the iai dash cut into the rising cut
    { seq: ['dash', 'weapon'], range: [300, 520], w: 1.4, tell: 0.3 },
    // a raised guard: the overhead that crushes it (parry it), or the kesa
    { seq: ['w:down'], range: [0, 260], w: 5, tell: 0.28, when: (ai, p) => p.state === 'block' },
    { seq: ['w:diagDown'], range: [0, 260], w: 2, tell: 0.24, when: (ai, p) => p.state === 'block' },
    // too close: the blade is long; step back to its edge, then the horizontal
    { seq: ['back', 'wait:0.12', 'w:fwd'], range: [0, 120], w: 3 },
    // an airborne Kage: the rising cut
    { seq: ['w:up'], range: [0, 270], w: 6, when: (ai, p) => !p.grounded }
  ],
  decide(ai, p, dist) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // Kage's posture is failing: the two beats at once
    if (p.guard < 40 && dist < 320 && (ai.cds.somaTwoBeat || 0) <= 0 && chance(0.6)) { ai.cds.somaTwoBeat = BOSS_ABILITIES.somaTwoBeat.cd; BOSS_ABILITIES.somaTwoBeat.run(f, w, ai, p); return true; }
    // a flurry up close: the guard comes up, the return cut comes off it
    if (dist < 230 && somaMash(w) >= 7 && chance(0.55)) { ai.block = rand(0.3, 0.45); return true; }
    // his own posture is failing: back to the edge of the blade
    if (f.guard < 35 && dist < 260 && chance(0.5)) { ai.plan = 'retreat'; ai.t = rand(0.3, 0.5); return true; }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!f.canAct() || !f.grounded || m.kind === 'throw' || m.proj) return false;
    const left = p.mdur[0] - p.mt;
    // a slow cut from outside Kage's reach: the blade is longer, the horizontal meets it in its wind-up
    if (dist > 195 && dist < 340 && left > 0.11 && chance(0.35)) { ai.startSeq(['w:fwd']); return true; }
    // a repeated cut or a flurry is read and turned aside on the blade (a parry when the timing is there)
    if (!m.unb && m.kind !== 'grab' && (somaMash(w) >= 7 || w.predictability(m.id) > 0.45) && chance(0.85)) {
      ai.block = rand(0.3, 0.45); f.ctrl.blockHeld = true;
      if (f.state !== 'block') f.setState('block');
      f.blockT = -Math.max(0, left - 0.05);
      return true;
    }
    return false;
  },
  // the second beat that finds a man who stepped straight back from the first is a critical
  crit(att, def, m) { return !!(m.somaBeat === 2 && def.state === 'dash'); },
  on: {
    // a cut turned aside on the blade: the return cut comes straight back, rising
    parry(ai) { if (chance(0.9)) { ai.block = 0; ai.startSeq(['w:diagUp'], 0.05); } },
    block(ai, w) { if (chance(somaMash(w) >= 7 ? 0.75 : 0.22)) { ai.block = 0; ai.startSeq(['weapon'], 0.04); } },
    // parried: not a word; the blade goes back to the edge of its reach
    parried(ai) { ai.seq = null; if (chance(0.55)) { ai.plan = 'retreat'; ai.t = 0.4; } }
  }
};

// the hardest of the four: every cut he commits to hurts (the odachi's own numbers are modest beside Takashi's)
Object.assign(ENEMIES.soma, { dmg: 1.36 });
