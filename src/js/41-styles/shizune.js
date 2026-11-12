/* KAGE — Shizune, the First Disciple (act3.sub2): iaijutsu, Takashi's school in his first student's hands.

   The school: Ittō-ryū as Takashi taught it before his sons were born, a beat slower than he does it. Stillness first:
   she settles at sword's distance and waits (kamae); the blade stays in the scabbard until a man commits, and then one
   draw (nukitsuke) answers him. Her art is the deflection: a cut Kage throws into her stillness is turned aside
   (Budo.deflect: his blade is off line, a short recoil), and the answer comes at a FIXED tempo with a glint just
   before it (Kaeshi, the return). It is a rehearsal for the master: the same exchange, shorter, and she does not read
   as much.

   New techniques:
   - Nukitsuke (BOSS_ABILITIES.shizuneDraw): she stops dead at mid-range with her hand on the hilt (STILLNESS: white eyes)
     and holds. A man who starts a cut inside her reach is met by the draw before his blade is up (a counter-hit
     critical); a man who waits her out gets the draw anyway, a dash cut to where he stands, and then a long
     recovery. Step out of the draw, or parry it, then step in.
   - Kaeshi (BOSS_ABILITIES.shizuneReturn): the answer to a deflection. 0.40 s after she turns a cut aside the return
     cut comes, a gold glint 0.15 s before it. Raise the guard on the glint (not before: a guard held through the
     recoil is thrown, and the answer crits a Kage who is still reeling) and it is parried: she reels with her
     posture cut, and Kage's cut after it is the critical.
   She keeps Takashi's Still Return (the story's counter stance: strike into it and it is turned aside) and the form as
   he taught it, a beat slower, from range.

   What it teaches: deflecting the return. Each deflection takes 30 off Kage's posture, so cutting into her over and over
   breaks him on the third; varied cuts get through more often, a repeated one is always turned. Beat the glint and
   she is the one who breaks. Mashing meets the deflection and a critical return; guarding never ends it (the throw).
   Harder than Act II's last: she gives nothing for free, but every answer of hers has a tempo that can be learned. */

function shizuneMash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}
const SHIZUNE = { tempo: 0.4, glint: 0.15, deflectCd: 1.4, floor: 28 };

// Nukitsuke: the stillness, then one draw. `early`: a cut begun inside her reach is answered before it is up.
BOSS_ABILITIES.shizuneDraw = { id: 'shizuneDraw', cd: 5, range: [160, 400], chance: 0.6,
  run(f, w, ai) {
    const hold = rand(0.55, 0.85), G = 0.17 * ai.p.windup, p0 = w.player;
    f.telegraph = hold + G;
    f.startAbility({ dur: hold + G + 0.72, rate: 22, trail: true,
      pose: (f) => (f.abil && f.abil.drawn ? MOVES.kc.s : MOVES.kc.w),
      start(f) { f.facing = p0.x > f.x ? 1 : -1; w.fx.popText(f, 'STILLNESS', f.accent || '#d9c08a'); AudioManager.play('block', { pitch: 0.8 }); this.cut = 0; this.go = null; },
      update(f, w, t, dt) {
        const p = w.player, d = Math.abs(p.x - f.x), front = Math.sign(p.x - f.x) === f.facing;
        if (this.go == null) {
          f.vx = damp(f.vx, 0, 14, dt); f.facing = p.x > f.x ? 1 : -1;
          // a man who commits inside her reach starts the draw at once
          const commit = p.alive && d < 230 * f.scale && front && (p.state === 'move' && p.mphase <= 1 || p.state === 'dash');
          if (commit || t >= hold) {
            this.go = t; f.telegraph = Math.max(f.telegraph, commit ? 0.05 : G);
            if (!commit || t >= hold - 0.01) w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#fff2c8');
            this.early = commit;
          }
          return;
        }
        const k = t - this.go, lag = this.early ? 0.04 : G;
        if (k < lag) { f.vx = damp(f.vx, 0, 16, dt); return; }
        if (!this.cut) {
          this.cut = 1; this.drawn = 1; f.vx = f.facing * 760; AudioManager.play('heavyswing', { pitch: 1.15 });
          this.hit = Combat.area(w, f, fbox(f, -10, -205, 235, 120), { dmg: 14 * f.dmgMul, kb: 400, up: -140, hs: 0.42, imp: 2, hsnd: 'slash', stamp: 'NUKITSUKE', shDraw: 1 });
        }
        if (!this.hit && k < lag + 0.17) this.hit = Combat.area(w, f, fbox(f, -10, -205, 235, 120), { dmg: 14 * f.dmgMul, kb: 400, up: -140, hs: 0.42, imp: 2, hsnd: 'slash', stamp: 'NUKITSUKE', shDraw: 1 });
        if (((t * 60) | 0) % 2 === 0 && k < lag + 0.2) w.fx.afterimage(f, 'rgba(232,210,150,0.3)');
        f.vx = damp(f.vx, 0, 8, dt);
        if (!this.tell && k > lag + 0.3) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
      } });
  } };

// Kaeshi: the return after a deflection, at a fixed tempo with a glint just before it
BOSS_ABILITIES.shizuneReturn = { id: 'shizuneReturn', cd: 0, range: [0, 9999], chance: 0,
  run(f, w, ai) {
    const T = SHIZUNE.tempo * Math.max(0.9, ai.p.windup);
    f.telegraph = T;
    f.startAbility({ dur: T + 0.62, rate: 22, trail: true,
      pose: (f, t) => (t < T ? MOVES.kc.w : MOVES.kc.s),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'KAESHI', f.accent || '#d9c08a'); },
      update(f, w, t, dt) {
        if (t < T) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (!this.glint && t > T - SHIZUNE.glint) { this.glint = 1; w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#fff2c8'); AudioManager.play('orb', { pitch: 1.5 }); }
          return;
        }
        if (!this.cut) {
          this.cut = 1; f.vx = f.facing * 640; AudioManager.play('heavyswing', { pitch: 1.05 });
          this.hit = Combat.area(w, f, fbox(f, -10, -210, 215, 130), { dmg: 12 * f.dmgMul, kb: 420, up: -200, hs: 0.45, imp: 2, hsnd: 'slash', stamp: 'KAESHI', shReturn: 1 });
        }
        if (!this.hit && t < T + 0.17) this.hit = Combat.area(w, f, fbox(f, -10, -210, 215, 130), { dmg: 12 * f.dmgMul, kb: 420, up: -200, hs: 0.45, imp: 2, hsnd: 'slash', stamp: 'KAESHI', shReturn: 1 });
        f.vx = damp(f.vx, 0, 9, dt);
        if (!this.tell && t > T + 0.3) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
      } });
  } };
for (const ph of ENEMIES.shizune.phases) if (!ph.abilities.includes('shizuneDraw')) ph.abilities.push('shizuneDraw');

FIGHT_STYLES.shizune = {
  art: 'Iaijutsu · Ittō-ryū',
  // patient: she waits at sword's distance in stillness and answers what comes
  tune: { pref: 190, aggr: 0.62, block: 0.4, parry: 0, dodge: 0.1, react: [0.06, 0.12], combo: [2, 3], punish: 0.85, grab: 0.1, jump: 0, kunai: 0, dashIn: 0.06 },
  poise: 0.95,
  postureRegen: 14,
  parriedStun: 0.78,              // the return parried: she is a beat slow to recover (a beat slower than him)
  footwork: { away: 0.3, stepIn: 130 },
  strings: [
    // the draw from stillness
    { seq: ['ab:shizuneDraw'], range: [160, 400], w: 3.5, when: ai => (ai.cds.shizuneDraw || 0) <= 0 },
    // the form's first cuts, close: the rising cut into the horizontal flow
    { seq: ['weapon', 'weapon', 'weapon'], range: [0, 175], w: 2.2, tell: 0.2 },
    { seq: ['weapon', 'weapon'], range: [0, 175], w: 2 },
    // nukitsuke on the move: the dash cut and the rising cut after it
    { seq: ['dash', 'weapon'], range: [210, 430], w: 2, tell: 0.3 },
    // one long horizontal at the edge of her reach, then back to stillness
    { seq: ['w:fwd', 'back'], range: [150, 260], w: 1.6 },
    // a raised guard: the overhead (crushes), or the clinch
    { seq: ['w:down'], range: [0, 220], w: 4, tell: 0.2, when: (ai, p) => p.state === 'block' },
    { seq: ['grab'], range: [0, 100], w: 2, when: (ai, p) => p.state === 'block' },
    // an airborne Kage: the rising cut
    { seq: ['w:up'], range: [0, 190], w: 6, when: (ai, p) => !p.grounded }
  ],
  decide(ai, p, dist) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // Kage's posture is failing (he has been turned aside too often): press the full string into it
    if (p.guard < 38 && dist < 200 && chance(0.6)) { ai.startSeq(['weapon', 'weapon', 'weapon']); return true; }
    // her own posture is failing: out of reach, let it come back
    if (f.guard < 32 && dist < 240 && chance(0.5)) { ai.plan = 'retreat'; ai.t = rand(0.3, 0.5); return true; }
    // kamae: at sword's distance she waits a moment before taking the initiative
    if (dist < 280 && dist > 110 && p.isNeutral() && chance(0.35)) { ai.plan = 'hold'; ai.t = rand(0.25, 0.45) * ai.p.idle; return true; }
    return false;
  },
  // a cut thrown at her is turned aside (a parry with her blade: a deflection), its answer follows (on.parry). A pattern
  // or a flurry is always turned; a varied cut is turned now and then. Never a guard-breaker, a grab or a rage art.
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!f.canAct() || !f.grounded || m.proj || m.kind === 'throw' || m.kind === 'grab' || m.unb) return false;
    if (dist > 250 || f.guard < SHIZUNE.floor || (ai.cds.shDeflect || 0) > 0) return false;
    // a downward cut crushes a guard: step out of it, or take it on the blade only when read
    if (m.aim === 'down' || m.aim === 'diagDown') return false;
    const read = shizuneMash(w) >= 6 || w.predictability(m.id) > 0.45;
    if (!chance(read ? 0.92 : 0.55)) return false;
    const left = p.mdur[0] - p.mt;
    ai.block = 0.3; f.ctrl.blockHeld = true;
    if (f.state !== 'block') f.setState('block');
    f.blockT = -Math.max(0, left - 0.05);    // the parry window opens as the cut arrives
    return true;
  },
  // the return cut that finds Kage still reeling from the deflection is a critical, and so is the draw into a cut begun
  crit(att, def, m) { return !!((m.shReturn && def.state === 'stun' && def.deflected) || (m.shDraw && def.state === 'move' && def.mphase === 0)); },
  on: {
    // she turned a cut aside: the return, at its fixed tempo
    parry(ai, w, other) {
      const f = ai.f;
      if (!f.alive || f.broken || !other || !other.isPlayer) return;
      ai.cds.shDeflect = SHIZUNE.deflectCd; ai.seq = null; ai.block = 0;
      ai.startSeq(['ab:shizuneReturn'], 0.02);   // (Combat.parry puts her idle after this hook: the return starts next tick)
    },
    // her return was turned back: she reels, her posture cut; no pride, she gives ground once she can
    parried(ai, w, other, m) {
      const f = ai.f; ai.seq = null;
      if (m && m.shReturn) { Budo.postureHit(w, f, 16, f.x, f.y - f.height() * 0.6, -f.facing, other); w.fx.popText(f, 'A BEAT SLOW', C.gold); }
      if (chance(0.4)) { ai.plan = 'retreat'; ai.t = 0.4; }
    },
    // a cut blocked on her blade, or a flurry: the clinch, or the cut back
    block(ai, w) { if (chance(shizuneMash(w) >= 6 ? 0.6 : 0.2)) { ai.block = 0; ai.startSeq(['weapon'], 0.04); } },
    blocked(ai, w, other) { if (Math.abs(other.x - ai.f.x) < 110 && chance(0.25)) ai.startSeq(['grab'], 0.08); }
  }
};

// a sub-boss in her own right: a little more weight behind the draw
Object.assign(ENEMIES.shizune, { hp: 440, dmg: 1.32 });
