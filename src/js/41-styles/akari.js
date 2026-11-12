/* KAGE — Akari, the Memory Blade (act2.boss): Kasumi-ryū ninjutsu, the mist school, with twin blades and a chain scythe.

   The school. Ninjutsu does not trade blows. Akari never stands in front of Kage long enough to be struck: her art is
   deception and angles. She fights hit-and-away (irimi in, two or three cuts, out again before the answer comes),
   crosses through him to his back (ura: a blow from behind is a critical), feints (False Opening; a second fang held a
   beat so an early parry spends itself on air), and denies standing still with poison, kunai and traps. She does not
   guard: she slips. Her guard is the empty space where she was, so her posture is thin. When the player finally reads
   her, parrying a fang on the beat or catching her as she lands, she breaks quickly and the next blow is a critical.

   Her game plan, phase by phase (the story's phases and their ability lists are unchanged; her own techniques below are
   reached from this style's strings, decide and respond):
     I   The Silent Assassin  Two-beat flurries (Kagehira, Yūrei) and the delayed fang; Utsusemi, the crossing step:
                              a blow that would land finds her gone, and she cuts from behind him. A guard held in
                              front of her is swept (Ashibari: the leg sweep under the guard into the rising fang).
     II  The Crimson Petal    Three-beat flurries with one delayed beat; a held guard is bound by the chain.
     III The Demon of Petals  Four-beat flurries ending in a cross-up; shorter rests, more evasion.
   In every phase the fight breathes: a burst of pressure, then distance (poison kunai, the chain, traps, storms).
   The same move thrown at her again and again meets Kawarimi: the blow strikes a husk of petals and she is behind
   him. A jump-in is answered from the ground: kunai thrown up at him, or the rising fang if he lands on top of her.

   How the player beats her: do not mash and do not repeat (she is simply gone and behind you); do not turtle (swept,
   or bound). Hold back, let her come, and PARRY the flurry in rhythm: the beats are quick, but one is always late, so
   parry the late one late. Turn when she crosses (the glint before her back cut is the tell). Punish the moment she
   lands from a flip, a blink or a flurry: caught there, her thin posture breaks and the next blow is a critical. */

// hard because she is skilled, not because of raw numbers (base 600 hp, 1.05 dmg)
Object.assign(ENEMIES.akari, { hp: 560, dmg: 0.97 });

// Akari's numbers (tells are x the difficulty mode's windup). Per-phase arrays are [I, II, III].
const AKARI_STYLE = {
  // the pressure / distance rhythm: seconds of pressing, then seconds of keeping her distance
  press: [[2.6, 3.4], [2.8, 3.6], [3.0, 3.8]],
  rest: [[1.5, 2.1], [1.2, 1.7], [0.9, 1.3]],
  stringBias: [0.55, 0.6, 0.65],         // in a pressing spell, how often she reaches for her own strings first
  // Utsusemi: a blow that would land finds her gone; a cool-down so she cannot slip every one
  evade: { chance: [0.42, 0.5, 0.58], cd: [1.7, 1.4, 1.15], cross: [0.55, 0.65, 0.75] },
  cross: { cd: 2.4, tell: 0.3, move: 0.16, glint: 0.22, dmg: 8, behind: 95 },
  kawarimi: { cd: 6.5, gone: 0.3, glint: 0.26, dmg: 11 },
  sweep: { cd: 4.8, windup: 0.34, dmg: 4, rise: 9 },
  antiAir: { cd: 2.6, windup: 0.16, dmg: 4, count: 2, close: 175 },
  caught: { posture: 42 },               // struck in her opening (a landing, a recovery): kuzushi
  parried: { posture: 12, stun: 0.8 }    // a parried fang: extra posture, and she reels
};

/* ---- helpers ---- */
const akS = ai => ai.ak || (ai.ak = { mode: 'press', until: 0, evadeT: 0, caught: false, hurt: [] });
const akReady = (ai, id) => (ai.cds[id] || 0) <= 0;
// run a technique from decide or respond, with its cool-down
function akUse(ai, id, p, o) {
  const a = BOSS_ABILITIES[id], f = ai.f;
  if (!a || !(f.canAct() || (f.state === 'move' && f.mphase === 0))) return false;
  ai.seq = null; ai.block = 0; ai.cds[id] = a.cd;
  if (f.state === 'move') { f.endMove(); f.setState('idle'); }
  a.run(f, ai.world, ai, p, o);
  return true;
}

/* ---- Utsusemi / Kasumi-gaeshi: the crossing step, and Kawarimi, the substitution ----
   Both put her behind Kage and cut from there (a back hit: a critical, AKARI style crit).
   cross    (from a string: a cross-up) she sinks low for a readable beat with afterimages flickering off her, then
            blurs straight through him (untouchable while she passes) and lands at his back; a glint on Yūrei, then
            one cut. Beat it: strike her in the crouch, step back out of it, or turn and parry the glint.
   evade    (from respond: a blow on its way) the same step with no crouch: the blow finds her gone.
   kawarimi (from respond: a move he has thrown again and again) she is struck... and it is a husk of petals that
            falls apart; she is gone a moment, then behind him with a heavier, knocking-down cut after a longer glint.
            Beat it: vary your strikes; when the husk falls, turn and guard.
   o: { tell, dmg, glint, kawarimi, noCut, misplace (Hollow Akari: the chance her step lands her short, in front of
        him and open), label, tint, glitch } */
function akariShift(f, w, ai, p, o) {
  o = o || {};
  const S = AKARI_STYLE, pl = w.player, kw = !!o.kawarimi;
  const W = (o.tell != null ? o.tell : S.cross.tell) * ai.p.windup, M = kw ? S.kawarimi.gone : S.cross.move;
  const R = Math.max(0.16, (o.glint || (kw ? S.kawarimi.glint : S.cross.glint)) * ai.p.windup);
  const side = Math.sign(pl.x - f.x) || f.facing, l = w.bounds.l + 30, r = w.bounds.r - 30;
  let dest = pl.x + side * S.cross.behind * f.scale, through = true;
  // no room behind him: out of his reach the other way instead (hit-and-away), no cut
  if (dest < l || dest > r) { dest = clamp(f.x - side * 220 * f.scale, l, r); through = false; }
  const lost = through && o.misplace && chance(o.misplace);
  if (lost) dest = clamp(pl.x - side * 62 * f.scale, l, r);   // the memory slips: she lands short, in front of him
  const cut = through && !lost && !o.noCut;
  const after = cut ? R + 0.5 : lost ? 0.75 : 0.25;
  f.telegraph = W;
  f.startAbility({ dur: W + M + after, rate: 30, trail: true,
    pose: (f, t) => (t < W ? AKARI_POSE.smokeCrouch : t < W + M ? AKARI_POSE.crossThrough : lost ? POSES.land : !cut ? AKARI_POSE.smokeCrouch : t < W + M + R ? AKARI_POSE.fangBack : MOVES.tw2.s),
    start(f) {
      f.facing = side; corruptFrames(f, o);
      if (o.label) w.fx.popText(f, o.label, o.tint || AKARI_VIOLET);
      // a blow on its way finds her gone at once
      if (W < 0.08 || kw) f.invuln = Math.max(f.invuln, W + M + 0.06);
      if (kw) {
        // the husk: an afterimage where she stood, coming apart into petals and smoke
        w.fx.afterimage(f, 'rgba(255,170,210,0.6)', { dur: 0.55 });
        AkariSakura.play(w, f, 'sakura_veil', f.x, AkariSakura.body(f)) || w.fx.smokePuff(f.x, 0, { life: 0.4, radius: 40 });
        w.fx.popText(f, 'KAWARIMI', o.tint || AKARI_VIOLET); AudioManager.play('smoke', { pitch: 1.4 });
        f.visible = false;
      } else AudioManager.play('dash', { pitch: 1.5 });
    },
    update(f, w, t, dt) {
      if (t < W) {
        f.vx = damp(f.vx, 0, 12, dt);
        if (((t * 60) | 0) % 5 === 0) w.fx.afterimage(f, AkariSakura.ghost(f, 0.35, 'rgba(180,140,240,0.35)'), { dur: 0.2, dx: rand(-14, 14) });
        return;
      }
      if (t < W + M) {
        if (!this.go) { this.go = 1; this.x0 = f.x; f.invuln = Math.max(f.invuln, M + 0.06); if (!kw) AkariSakura.play(w, f, 'sakura_veil', f.x, AkariSakura.body(f), { scale: f.scale * 0.6 }); }
        f.vx = 0;
        if (!kw) { const u = clamp((t - W) / M, 0, 1); f.x = lerp(this.x0, dest, Ease.inOut(u)); if (((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, AkariSakura.ghost(f, 0.4, 'rgba(200,60,120,0.4)'), { dur: 0.22 }); }
        return;
      }
      if (!this.out) {
        this.out = 1; f.x = dest; f.visible = true; f.alpha = 1; f.facing = Math.sign(pl.x - f.x) || -side;
        if (kw) AkariSakura.play(w, f, 'sakura_veil', f.x, AkariSakura.body(f), { scale: f.scale * 0.7 }) || w.fx.smokePuff(f.x, 0, { life: 0.3, radius: 30 });
        w.fx.dust(f.x, 0, 4);
        if (lost) { this.tell = 1; w.fx.popText(f, '...', o.tint || AKARI_VIOLET); w.fx.popText(f, 'OPENING', C.gold); AudioManager.play('land'); }
        else if (cut) { f.telegraph = R; akariGlint(f, w, 'w2t'); }
      }
      if (!cut) { f.vx = damp(f.vx, 0, 12, dt); return; }
      const k = t - W - M;
      if (k < R) { f.vx = damp(f.vx, 0, 14, dt); f.facing = Math.sign(pl.x - f.x) || f.facing; return; }
      if (!this.cutT) { this.cutT = 1; f.vx = f.facing * 480; AudioManager.play(kw ? 'heavyswing' : 'swing', { pitch: 1.3 }); AkariSakura.play(w, f, 'sakura_slash', f.x + f.facing * 95 * f.scale, AkariSakura.chest(f), { rot: kw ? 0.35 : -0.4, rate: 1.3 }); }
      if (!this.hit && k < R + 0.14) {
        const dmg = o.dmg || (kw ? S.kawarimi.dmg : S.cross.dmg);
        this.hit = Combat.area(w, f, fbox(f, 0, -205, 135, 150), kw
          ? { dmg: dmg * f.dmgMul, kb: 440, up: -340, hs: 0.5, kd: 1, imp: 3, hsnd: 'slash', stamp: 'KAWARIMI', tech: 'kawarimi' }
          : { dmg: dmg * f.dmgMul, kb: 300, up: -160, hs: 0.38, imp: 2, hsnd: 'slash', stamp: 'URA', tech: 'cross' });
        if (f.abil !== this) return;
      }
      f.vx = damp(f.vx, 0, 10, dt);
      if (!this.tell && k > R + 0.24) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
    },
    end(f) { f.visible = true; f.alpha = 1; } });
}
BOSS_ABILITIES.akariCross = { id: 'akariCross', cd: AKARI_STYLE.cross.cd, range: [0, 380], chance: 0,
  run(f, w, ai, p, o) { akariShift(f, w, ai, p, Object.assign({ label: 'UTSUSEMI' }, o)); } };
BOSS_ABILITIES.akariKawarimi = { id: 'akariKawarimi', cd: AKARI_STYLE.kawarimi.cd, range: [0, 400], chance: 0,
  run(f, w, ai, p, o) { akariShift(f, w, ai, p, Object.assign({ kawarimi: true, tell: 0 }, o)); } };

/* ---- Ashibari: the leg sweep under a held guard, into the rising fang ----
   Tell: she sinks to the floor, a low glint at her front foot. Then a sweep along the floor that no guard stops (a
   guard is held high; the sweep takes the legs) and pops him up, and the rising fang follows on the falling body. It
   only touches a fighter on his feet: JUMP it, back off, or strike her in the crouch (no armour). o: { windup, dmg,
   rise, label, tint, glitch } */
BOSS_ABILITIES.akariSweep = { id: 'akariSweep', cd: AKARI_STYLE.sweep.cd, range: [0, 190], chance: 0,
  run(f, w, ai, p, o) {
    o = o || {};
    const S = AKARI_STYLE.sweep, W = (o.windup || S.windup) * ai.p.windup, SW = 0.15, GAP = 0.2;
    f.telegraph = W;
    f.startAbility({ dur: W + SW + GAP + 0.55, rate: 30, trail: true,
      pose: (f, t) => (t < W ? AKARI_POSE.smokeCrouch : t < W + SW ? (MOVES.slide.s || AKARI_POSE.crossThrough) : t < W + SW + GAP ? AKARI_POSE.smokeCrouch : MOVES.tw3.s),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label || 'ASHIBARI', o.tint || AKARI_VIOLET); corruptFrames(f, o); AudioManager.play('teleport', { pitch: 1.3 }); },
      update(f, w, t, dt) {
        if (t < W) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (((t * 60) | 0) % 6 === 0) w.fx.dust(f.x + f.facing * 30 * f.scale, 0, 2);
          if (!this.g && t > W - 0.14) { this.g = 1; w.fx.glint(f.x + f.facing * 60 * f.scale, -18 * f.scale, AkariSakura.glint(f) || '#e0ccff'); AudioManager.play('orb', { pitch: 2.1 }); }
          return;
        }
        if (t < W + SW) {
          if (!this.go) { this.go = 1; f.vx = f.facing * 420; AudioManager.play('swing', { pitch: 0.9 }); w.fx.dust(f.x, 0, 8); }
          if (!this.swept) {
            this.swept = Combat.area(w, f, fbox(f, -10, -70, 155, 70), { dmg: (o.dmg || S.dmg) * f.dmgMul, kb: 80, up: -430, hs: 0.5, imp: 1, hsnd: 'blunt', unb: 1, groundOnly: 1, stamp: 'ASHIBARI', tech: 'sweep' });
            if (f.abil !== this) return;
          }
          return;
        }
        f.vx = damp(f.vx, 0, 12, dt);
        if (t < W + SW + GAP) return;
        // the rising fang: on the swept body it is a juggle; on a fighter who jumped the sweep it meets him coming down
        if (!this.rise) { this.rise = 1; f.vx = f.facing * 260; AudioManager.play('swing', { pitch: 1.35 }); AkariSakura.play(w, f, 'sakura_slash', f.x + f.facing * 80 * f.scale, AkariSakura.chest(f), { rot: -1.1, rate: 1.3 }); }
        if (!this.hit && t < W + SW + GAP + 0.14) {
          this.hit = Combat.area(w, f, fbox(f, -6, -330, 140, 330), { dmg: (o.rise || S.rise) * f.dmgMul, kb: 180, up: -620, hs: 0.45, imp: 2, hsnd: 'slash', stamp: this.swept ? 'RISING FANG' : null, tech: 'rise' });
          if (f.abil !== this) return;
        }
        if (!this.tell && t > W + SW + GAP + 0.3) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
      } });
  } };

/* ---- Tenchi kunai: the answer to a jump-in ----
   He is in the air coming at her: she skips back half a step and throws poisoned kunai up at him (a short tell: the
   jump was his commitment). Block them in the air, or do not jump in on her. Landing on top of her instead meets the
   rising fang (decide / respond). */
BOSS_ABILITIES.akariSkyKunai = { id: 'akariSkyKunai', cd: AKARI_STYLE.antiAir.cd, range: [0, 460], chance: 0,
  run(f, w, ai, p, o) {
    o = o || {};
    const S = AKARI_STYLE.antiAir, W = S.windup * ai.p.windup;
    f.telegraph = W;
    f.startAbility({ dur: W + 0.42, rate: 26,
      pose: (f, t) => (t < W ? AKARI_POSE.throwBack : AKARI_POSE.throwOut),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; f.vx = -f.facing * 260; w.fx.glint(f.sk.fha.x, f.sk.fha.y, '#b6f0a0'); AudioManager.play('orb', { pitch: 2 }); },
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 8, dt);
        if (t < W || this.threw) return;
        this.threw = 1; AudioManager.play('throw');
        const pl = w.player, n = o.count || S.count;
        for (let i = 0; i < n; i++) akariKunai(f, w, { dmg: o.dmg || S.dmg, poison: 1 }, pl.x + pl.vx * 0.12, pl.y - 90 * pl.scale + pl.vy * 0.1, (i - (n - 1) / 2) * 0.14, 0);
      } });
  } };

// the rising fang off the floor at a body coming down on her (a critical on a fighter in the air)
function akariRisingFang(ai, toward, o) {
  const f = ai.f, w = ai.world;
  if (!f.grounded || !(f.canAct() || (f.state === 'move' && f.mphase === 0)) || !akReady(ai, 'risingFang')) return false;
  ai.seq = null; ai.block = 0; ai.cds.risingFang = (o && o.cd) || 2.2;
  if (f.state === 'move') f.endMove();
  f.setState('idle'); f.facing = toward; f.startMove('tw3_up', w);
  if (f.move) { f.mdur[0] = Math.min(f.mdur[0], (o && o.startup) || 0.1); w.fx.popText(f, 'RISING FANG', (o && o.tint) || AKARI_VIOLET); }
  return !!f.move;
}

/* ---- the style, built for Akari and (with gaps) for her Hollow echo (41-styles/hollow_akari.js) ----
   K: { evade, cross / kawarimi / bind / skyKunai switches, misplace, rhythm, stringBias, sweep o, crossO } */
function akariStyle(K) {
  const ph = ai => Math.min(2, ai.phase || 0);
  return {
    decide(ai, p, dist, toward) {
      const f = ai.f, w = ai.world, A = akS(ai), i = ph(ai);
      // caught in her opening a moment ago (on.hurt): her thin posture gives (kuzushi); the next blow is a critical
      if (A.caught) {
        A.caught = false;
        if (f.alive && (f.state === 'hit' || f.state === 'stun' || f.state === 'juggle')) {
          if (f.state !== 'juggle') Budo.postureHit(w, f, K.caughtPosture, f.x, f.y - 120 * f.scale, -f.facing, p);
          A.mode = 'rest'; A.until = w.time + rand(K.rest[i][0], K.rest[i][1]);
        }
        ai.t = 0.05;
        return true;
      }
      if (!f.canAct()) return false;
      // the rhythm: a spell of pressure, then a spell of distance
      if (w.time >= A.until) {
        A.mode = A.mode === 'press' ? 'rest' : 'press';
        const r = A.mode === 'press' ? K.press[i] : K.rest[i];
        A.until = w.time + rand(r[0], r[1]);
      }
      // a jump-in: answered from the ground
      if (!p.grounded && dist < 460 && p.state !== 'juggle') {
        if (dist < K.closeAir && akariRisingFang(ai, toward, K.rising)) return true;
        if (K.skyKunai && dist > 140 && akReady(ai, 'akariSkyKunai') && chance(0.7)) return akUse(ai, 'akariSkyKunai', p);
      }
      // a guard held in front of her: under it (the sweep), round it (to his back), or the chain round it
      if (p.state === 'block' && p.st > K.turtle && dist < 560 && chance(0.7)) {
        if (K.bind && i >= 1 && dist > 90 && akReady(ai, 'chainBind') && !f.akChainOut && p.state !== 'bound') { ai.cds.chainBind = BOSS_ABILITIES.chainBind.cd; return akUse(ai, 'chainBind', p); }
        if (dist < 200 && akReady(ai, K.sweepId)) return akUse(ai, K.sweepId, p, K.sweep);
        if (dist < 360 && akReady(ai, K.crossId)) return akUse(ai, K.crossId, p, K.crossO);
      }
      if (A.mode === 'rest') {
        // distance: out of his reach, then her tools from range (kunai, chain, traps, storms), or a blink back in
        if (dist < K.restDist) {
          if (f.dashCd <= 0 && chance(0.5)) ai.startSeq(['back']); else { ai.plan = 'retreat'; ai.t = rand(0.25, 0.4); }
          return true;
        }
        if (chance(K.restAbility) && ai.tryAbility(p, dist, toward)) return true;
        ai.plan = chance(0.55) ? 'strafe' : 'hold'; ai.strafeDir = chance(0.5) ? toward : -toward; ai.t = rand(0.2, 0.4) * ai.p.idle;
        return true;
      }
      // pressing: her own strings first; otherwise the generic logic reaches for her signature moves
      if (chance(K.stringBias[i]) && ai.tryString(p, dist)) return true;
      return false;
    },
    respond(ai, p, dist, toward, m) {
      const f = ai.f, w = ai.world, A = akS(ai), i = ph(ai);
      if (!f.grounded || !m || m.kind === 'throw') return false;
      // an air attack coming down on her: the rising fang
      if (!p.grounded && m.kind === 'air' && dist < K.closeAir + 40) return akariRisingFang(ai, toward, K.rising);
      // the same move again and again: it strikes a husk, and she is behind him
      const repeated = ai.adapted === m.id || w.predictability(m.id) > 0.45;
      if (K.kawarimi && repeated && akReady(ai, 'akariKawarimi') && chance(0.85)) return akUse(ai, 'akariKawarimi', p);
      // she slips, she does not guard; but not every blow (the evasion keeps its own rhythm)
      if (A.evadeT > w.time || !chance(K.evade.chance[i])) return false;
      A.evadeT = w.time + K.evade.cd[i];
      if (dist < 230 && chance(K.evade.cross[i]) && akReady(ai, K.crossId + 'Evade')) {
        ai.cds[K.crossId + 'Evade'] = 0.6;
        return akUse(ai, K.crossId, p, Object.assign({}, K.crossO, { tell: 0.02, label: null }));
      }
      // out of reach (hit-and-away): a backstep
      ai.seq = null; ai.block = 0;
      if (f.state === 'move') { f.endMove(); f.setState('idle'); }
      f.ctrl.dashP = true; f.ctrl.dir = -toward;
      return true;
    },
    // her own criticals: a blow from behind him (the crossing step, Kawarimi, any back cut), the rising fang on a body
    // in the air
    crit(att, def, m) {
      if (m.proj) return false;
      if (m.tech === 'cross' || m.tech === 'kawarimi') return true;
      if ((Math.sign(att.x - def.x) || 1) !== def.facing) return true;
      return K.airCrit && m.aim === 'up' && !def.grounded;
    },
    on: {
      hurt(ai, w, by, m) {
        const f = ai.f, A = akS(ai);
        // caught where she cannot slip: her opening after a technique, a landing, the recovery of a cut that missed
        const open = (f.state === 'ability' && f.abil && f.abil.tell) || f.state === 'land' || (f.state === 'move' && f.mphase === 2 && !f.moveHit) || (f.state === 'air' && f.vy > 0 && f.y > -60);
        if (open && by && by.isPlayer && f.alive) {
          A.caught = true; ai.seq = null; ai.block = 0; ai.t = 0;
          w.fx.popText(f, 'CAUGHT', C.gold);
        }
        // struck twice in a breath: she wants out
        A.hurt = A.hurt.filter(x => w.time - x < 1.2); A.hurt.push(w.time);
        if (A.hurt.length >= 2 && A.mode === 'press') { A.mode = 'rest'; A.until = w.time + rand(0.8, 1.3); }
      },
      // a fang parried on the beat: she reels, and her thin posture goes
      parried(ai, w, by) {
        const f = ai.f;
        if (f.state === 'stun') f.stunT = Math.max(f.stunT, K.parriedStun);
        if (f.alive && !f.broken) Budo.postureHit(w, f, K.parriedPosture, f.x, f.y - 120 * f.scale, -f.facing, by);
      },
      broken(ai, w) { const A = akS(ai); A.mode = 'rest'; A.until = w.time + 1.6; w.fx.popText(ai.f, 'READ', C.gold); },
      // a flurry landed: out before the answer (hit-and-away)
      land(ai, w, other, m) {
        const f = ai.f;
        if (!m || m.proj || f.state !== 'move' || ai.seq || !other || !other.isPlayer) return;
        if (chance(K.awayOnLand)) ai.startSeq(['back']);
      }
    }
  };
}

FIGHT_STYLES.akari = Object.assign(akariStyle({
  evade: AKARI_STYLE.evade, press: AKARI_STYLE.press, rest: AKARI_STYLE.rest, stringBias: AKARI_STYLE.stringBias,
  kawarimi: true, bind: true, skyKunai: true, airCrit: true, closeAir: AKARI_STYLE.antiAir.close, rising: null,
  crossId: 'akariCross', crossO: null, sweepId: 'akariSweep', sweep: null, turtle: 0.5,
  restDist: 280, restAbility: 0.5, caughtPosture: AKARI_STYLE.caught.posture,
  parriedPosture: AKARI_STYLE.parried.posture, parriedStun: AKARI_STYLE.parried.stun, awayOnLand: 0.45
}), {
  art: 'Kasumi-ryū ninjutsu',
  // quick and evasive: she reacts fast, hardly ever blocks, parries only now and then, and strings short flurries
  tune: { pref: 200, aggr: 0.6, block: 0.04, parry: 0.12, dodge: 0.25, react: [0.03, 0.07], combo: [2, 3], punish: 0.8, grab: 0, jump: 0.04, kunai: 0.2, dashIn: 0.2 },
  poise: 1.45,            // thin posture: she slips blows, she does not stand under them
  postureRegen: 12,
  parriedStun: 0.7,
  footwork: { away: 0.8, stepIn: 210 },
  strings: [
    // I on: the two fangs, Kagehira then Yūrei, and out
    { seq: ['move:tw1', 'move:tw2', 'back'], range: [0, 175], w: 2, tell: 0.24 },
    // the delayed fang: the second blade held a beat (an early parry spends itself on air)
    { seq: ['move:tw1', 'wait:0.3', 'move:tw2_diagDown', 'back'], range: [0, 175], w: 1.6, tell: 0.22 },
    // irimi: the step in from the edge of her reach
    { seq: ['fwd', 'move:tw1_fwd', 'move:tw2', 'back'], range: [150, 300], w: 1.4, tell: 0.24 },
    // the cross-up from mid range: through him and the cut from behind
    { seq: ['ab:akariCross'], range: [110, 360], w: 1.2, when: ai => akReady(ai, 'akariCross') },
    // II on: three beats, the third one late, and out
    { seq: ['move:tw1', 'move:tw2', 'wait:0.24', 'move:tw4_diagUp', 'back'], range: [0, 175], w: 2.2, phase: [1, 2], tell: 0.22 },
    { seq: ['move:tw2', 'wait:0.28', 'move:tw1', 'move:tw2_diagDown', 'back'], range: [0, 175], w: 1.4, phase: [1, 2], tell: 0.22 },
    // III: four beats, the fourth late, ending through him to his back
    { seq: ['move:tw1', 'move:tw2', 'move:tw1', 'wait:0.22', 'move:tw3_up', 'ab:akariCross'], range: [0, 175], w: 2.4, phase: 2, tell: 0.22 }
  ]
});
