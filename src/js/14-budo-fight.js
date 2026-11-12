/* KAGE — Budo, the fight-time half (see 13-budo.js for the rules, the tuning table BUDO and FIGHT_STYLES).
   Criticals, posture, the parry and the deflect, style events, the per-tick step and the posture bars. */
Object.assign(Budo, {
  emit(world, f, ev, other, m) {
    const st = f && f.ai && f.ai.style;
    if (st && st.on && st.on[ev]) st.on[ev](f.ai, world, other, m);
  },
  // a fighter joins a fight (FightSession.makeEnemy)
  join(f, world) {
    const st = this.style(f);
    if (!st) return;
    if (st.postureRegen != null) f.postureRegen = st.postureRegen;
    if (st.init) st.init(f, world);
  },

  /* ---- criticals ---- */
  // Is this clean blow a critical? Returns null or { why, mul }. `counter`: the target was struck in its own wind-up.
  crit(world, att, def, m, front, counter) {
    if (m.proj || m.quiet || m.kind === 'grab') return null;
    const C = BUDO.crit;
    if (def.broken && def.state === 'stun') return { why: 'broken', mul: att.isPlayer ? C.mul : C.foeMul };
    if (att.isPlayer) {
      if (m.counter && att.riposte) return { why: 'riposte', mul: C.mul };
      if ((att.critCd || 0) > world.time) return null;
      const why = counter ? 'counter' : !front ? 'back' : chance(C.chance) ? 'clean' : null;
      if (!why) return null;
      att.critCd = world.time + C.kageCd;
      return { why, mul: C.mul };
    }
    if (!C.who[this.role(att)] || (att.critCd || 0) > world.time) return null;
    const st = this.style(att);
    const punish = def.state === 'move' && def.mphase === 2 && !def.moveHit;   // caught in the recovery of a whiff
    const own = !!(st && st.crit && st.crit(att, def, m, world));
    if (!counter && !punish && !own) return null;
    att.critCd = world.time + C.foeCd;
    return { why: counter ? 'counter' : punish ? 'punish' : 'style', mul: C.foeMul };
  },
  // the critical's moment: the screen holds still, then slow motion, a punch-in and a tint in the striker's colour
  critFx(world, att, def, crit, ix, iy, dir) {
    const fx = world.fx, C = BUDO.crit;
    fx.stop(C.freeze); fx.slowmo(C.slow, C.freeze + C.slowT);
    fx.impactFrame(ix, iy, 3); fx.punch(C.punch); fx.shake(C.shake);
    if (fx.screenTint) fx.screenTint(att.isPlayer ? 'rgba(232,186,84,' : 'rgba(255,59,47,', 0.4);
    fx.ring(ix, iy, 170, att.isPlayer ? 'rgba(255,226,168,0.95)' : 'rgba(255,90,70,0.95)', 0.4, 6);
    AudioManager.play('impact', { pitch: 0.9 });
    world.lastCrit = { t: world.time, att, def, why: crit.why };
    if (world.onCritical) world.onCritical(att, def, crit);
    this.emit(world, def, 'critical', att, null);
  },
  // thrown back on his heels: a struck fighter on his feet slides back and stays reeling; one in the air is carried
  // further. Heavy armour halves it. The striker drags a half-step after him so the gap reads as a hit, not a miss.
  reel(world, att, def, dir) {
    if (!def.alive) return;
    const R = BUDO.crit.reel, k = def.def && def.def.heavyArmor ? R.heavy : 1;
    if (def.state === 'hit' || def.state === 'stun') {
      def.vx = dir * Math.max(Math.abs(def.vx), R.kb * k);
      if (def.state === 'hit') { def.hitstun = Math.max(def.hitstun, R.hs * (1 - def.stunRes * 0.4)); def.hitGut = false; def.reelT = def.hitstun; }
      else def.reelT = 0.4;
    } else if (def.state === 'juggle') def.vx = dir * Math.max(Math.abs(def.vx), R.air * k);
    if (att && att.grounded && att.state === 'move') att.vx = Math.max(Math.abs(att.vx), R.pull) * Math.sign(dir || att.facing);
  },

  /* ---- posture (kuzushi) ---- */
  // posture damage; returns true when the guard broke
  postureHit(world, f, amount, ix, iy, dir, by) {
    if (!f.alive || amount <= 0) return false;
    const st = this.style(f);
    f.guard -= amount * (st && st.poise != null ? st.poise : 1);
    f.postureDelay = BUDO.posture.delay;
    if (f.guard > 0) return false;
    this.breakPosture(world, f, ix, iy, dir, by);
    return true;
  },
  breakPosture(world, f, ix, iy, dir, by) {
    const P = BUDO.posture, fx = world.fx;
    f.guard = P.refill; f.move = null;
    if (f.abil) { if (f.abil.uninterruptible) return; f.endAbility(world); }
    f.setState('stun'); f.stunT = (P.breakStun[this.role(f)] || 1) * (1 - f.stunRes * 0.5); f.broken = true; f.deflected = false;
    fx.stamp('GUARD BREAK', ix, iy, 2, null, 'POSTURE BROKEN'); AudioManager.play('guardbreak'); fx.hit(ix, iy, dir, 2, 'blunt');
    if (by && by.isPlayer) fx.slowmo(0.5, 0.3);
    this.emit(world, f, 'broken', by, null);
  },
  // a blow was parried (Combat.parry has already put the attacker in `stun`): how long he reels, and his posture
  parried(world, att, def, m, ix, iy, dir) {
    if (att.isPlayer) this.deflect(world, att, def, ix, iy, dir);
    else {
      const st = this.style(att), role = this.role(att);
      att.stunT = (st && st.parriedStun != null ? st.parriedStun : BUDO.parryStun[role]) * (1 - att.stunRes * 0.5);
      this.postureHit(world, att, BUDO.posture.parried[role], ix, iy, -dir, def);
    }
    this.emit(world, att, 'parried', def, m); this.emit(world, def, 'parry', att, m);
  },
  // Kage's cut turned aside by a foe: a short recoil (state `stun`, `deflected`) that a fresh guard press may end
  // early (Fighter.update), and a share of his posture. Any foe's parry uses it; so does Takashi's Iron Guard.
  deflect(world, att, def, ix, iy, dir) {
    att.move = null; if (att.state !== 'stun') att.setState('stun');
    att.stunT = BUDO.deflect.stun * (1 - att.stunRes * 0.5); att.deflected = true;
    this.postureHit(world, att, BUDO.posture.playerParried, ix, iy, -dir, def);
  },

  /* ---- per tick (FightSession.simulate) ---- */
  step(world, dt) {
    for (const f of world.fighters) {
      // a reeling fighter drags dust off his heels
      if (f.reelT > 0 && f.grounded && Math.abs(f.vx) > 140 && ((world.time * 60) | 0) % 3 === 0) world.fx.dust(f.x - Math.sign(f.vx) * 14 * f.scale, 0, 1);
    }
  },

  /* ---- drawing: a posture bar over a fighter whose posture is hurt or broken (world space) ---- */
  drawWorld(ctx, world) {
    for (const f of world.fighters) {
      if (!f.alive || !f.visible || f.clone || f.dissolve) continue;
      const k = clamp(f.guard / 100, 0, 1);
      if (k >= 0.995 && !f.broken) { f._pb = 0; continue; }
      f._pb = Math.min(1, (f._pb || 0) + 0.12);
      const w = 74 * f.scale, x = f.x - w / 2, y = f.y - f.height() - 26 * f.scale, h = 4;
      ctx.globalAlpha = f._pb * 0.92;
      ctx.fillStyle = 'rgba(3,3,3,0.72)'; ctx.fillRect(x - 1.5, y - 1.5, w + 3, h + 3);
      // the bar empties toward the middle: full is calm, a thin core left is about to break
      const col = f.broken ? '#ff3b2f' : k < 0.34 ? '#ff7a3c' : f.isPlayer ? '#e8c25c' : '#ece5d3';
      ctx.fillStyle = col; ctx.fillRect(x + w * (1 - k) / 2, y, w * k, h);
      if (f.broken) { ctx.globalAlpha = f._pb * (0.5 + 0.5 * Math.sin(world.time * 26)); ctx.fillRect(x, y, w, h); }
      ctx.globalAlpha = 1;
    }
  }
});
