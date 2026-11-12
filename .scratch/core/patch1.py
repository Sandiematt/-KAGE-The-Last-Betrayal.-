import io
def sub(path, pairs):
    s = open(path, encoding='utf8').read()
    for old, new in pairs:
        if s.count(old) != 1:
            raise SystemExit('PATCH MISS (%d) in %s:\n%s' % (s.count(old), path, old[:160]))
        s = s.replace(old, new)
    open(path, 'w', encoding='utf8', newline='').write(s)

sub('src/js/30-combat.js', [
# blocking: posture
("""      const chip = m.dmg * 0.12 * att.dmgMul;
      def.hp = Math.max(1, def.hp - chip);
      def.guard -= (m.gb || m.dmg * 1.3);
      def.vx = dir * (m.kb || 150) * 0.45;""",
"""      const chip = m.dmg * 0.12 * att.dmgMul;
      def.hp = Math.max(1, def.hp - chip);
      def.vx = dir * (m.kb || 150) * 0.45;"""),
("""      AudioManager.play(m.kind === 'weapon' || m.proj ? 'clang' : 'block');
      if (def.guard <= 0) {
        def.guard = 60; def.setState('stun'); def.stunT = 1.0 * (1 - def.stunRes * 0.5);
        fx.stamp('GUARD BREAK', ix, iy, 2); AudioManager.play('guardbreak'); fx.hit(ix, iy, dir, 2, 'blunt');
        if (chance(0.5)) world.dropWeapon(def);
      }
      return;""",
"""      AudioManager.play(m.kind === 'weapon' || m.proj ? 'clang' : 'block');
      // the blow lands on his posture (a repeated move wears it down less each time); posture gone, the guard breaks
      if (Budo.postureHit(world, def, (m.gb || m.dmg * 1.3) * (m.proj ? 1 : Budo.stale(att)), ix, iy, dir, att)) { if (chance(0.5)) world.dropWeapon(def); }
      else { Budo.emit(world, att, 'blocked', def, m); Budo.emit(world, def, 'block', att, m); }
      return;"""),
# crit
("""    // critical strikes: counter-hits, blows from behind and the occasional clean strike
    // (a rage art's lesser blows are `quiet`: no critical, no counter tier, so only its finisher lands an impact frame)
    const crit = att.isPlayer && !m.proj && !m.quiet && (counter || !front || chance(0.1));
    if (crit) dmg *= 1.4;""",
"""    // critical strikes (Budo.crit, 13-budo.js): counter-hits, blows from behind, the cut that answers a parry, a blow
    // on a broken guard, and a boss's or sub-boss's punish of a whiff
    // (a rage art's lesser blows are `quiet`: no critical, no counter tier, so only its finisher lands an impact frame)
    const crit = Budo.crit(world, att, def, m, front, counter);
    if (crit) dmg *= crit.mul;"""),
("""    this.damage(world, att, def, dmg * (1 - def.defense), m, ix, iy, dir, tier, crit);
    if (!def.alive) return;""",
"""    this.damage(world, att, def, dmg * (1 - def.defense), m, ix, iy, dir, tier, !!crit);
    if (!def.alive) return;
    // a critical holds the screen still, and (below) throws the struck fighter back
    if (crit) Budo.critFx(world, att, def, crit, ix, iy, dir);"""),
("""    if (m.stun) { def.setState('stun'); def.stunT = m.stun * (1 - def.stunRes); }
    if (m.disarm && chance(""",
"""    if (m.stun) { def.setState('stun'); def.stunT = m.stun * (1 - def.stunRes); }
    if (crit) Budo.reel(world, att, def, dir);
    if (m.disarm && chance("""),
# parry
("""    att.move = null; att.abil = null; att.setState('stun');
    att.stunT = (att.def && att.def.type === 'boss' ? 0.6 : 0.85) * (1 - att.stunRes * 0.5);
    att.vx = -att.facing * 260;""",
"""    att.move = null; att.abil = null; att.setState('stun');
    att.vx = -att.facing * 260;
    // how long the parried fighter reels and what it costs his posture; Kage's own cut is only deflected (Budo.parried)
    Budo.parried(world, att, def, m, ix, iy, dir);"""),
# events
("""    world.onHit && world.onHit(att, def, dmg, m);
    this.checkKO(world, att, def, m);""",
"""    world.onHit && world.onHit(att, def, dmg, m);
    Budo.emit(world, att, 'land', def, m); Budo.emit(world, def, 'hurt', att, m);
    this.checkKO(world, att, def, m);"""),
])

sub('src/js/20-fighter.js', [
("""    this.turnDelay = o.turnDelay || 0; this.turnT = 0; this.superArmor = false;
""",
"""    this.turnDelay = o.turnDelay || 0; this.turnT = 0; this.superArmor = false;
    // Budo (13-budo.js): posture comes back after a pause (postureDelay) at postureRegen a second; `broken` while the
    // guard is broken, `deflected` while a deflected cut recoils, reelT while thrown back by a critical, `riposte` on
    // the cut that answers a parry
    this.postureDelay = 0; this.postureRegen = BUDO.posture.regen; this.broken = false; this.deflected = false; this.reelT = 0; this.riposte = false; this.critCd = 0;
"""),
("""    if (this.guard < 100 && this.state !== 'block') this.guard = Math.min(100, this.guard + 22 * dt);
""",
"""    if (this.postureDelay > 0) this.postureDelay -= dt;
    else if (this.guard < 100 && this.state !== 'block') this.guard = Math.min(100, this.guard + this.postureRegen * dt);
    if (this.reelT > 0) this.reelT -= dt;
    if (this.state !== 'stun') { this.broken = false; this.deflected = false; }
"""),
("""      case 'stun': this.stunT -= dt; this.friction(dt, 10); if (this.stunT <= 0) this.setState('idle'); break;""",
"""      case 'stun':
        this.stunT -= dt; this.friction(dt, 10);
        // a deflected cut (Budo.deflect): a fresh guard press ends the recoil early, in time to turn the answer aside
        if (this.deflected && c.blockP && this.grounded && this.st >= BUDO.deflect.guardAfter) { this.setState('block'); this.blockT = 0; break; }
        if (this.stunT <= 0) this.setState('idle');
        break;"""),
("""      if (this.counterT > 0 && w.counter) return this.startMove(w.counter, world);
      const id = this.weaponMove('ground');""",
"""      if (this.counterT > 0 && w.counter) { const ok = this.startMove(w.counter, world); this.riposte = ok; return ok; }
      const id = this.weaponMove('ground');"""),
("""    if (this.buf.weapon > 0 && this.counterT > 0) { this.buf.weapon = 0; const w = this.weapon(); if (w.counter) { this.startMove(w.counter, world); return; } }""",
"""    if (this.buf.weapon > 0 && this.counterT > 0) { this.buf.weapon = 0; const w = this.weapon(); if (w.counter) { this.riposte = !!this.startMove(w.counter, world); return; } }"""),
("""    this.punishMove = null; this.lateAim = false;
    const now = world ? world.time : 0;""",
"""    this.punishMove = null; this.lateAim = false; this.riposte = false;
    const now = world ? world.time : 0;"""),
("""      case 'hit': copy(this.hitGut ? POSES.hitGut : POSES.hit); rate = 34; break;""",
"""      case 'hit':
        copy(this.hitGut ? POSES.hitGut : POSES.hit); rate = 34;
        // thrown back by a critical (Budo.reel): the whole body goes over backward, arms flung out
        if (this.reelT > 0) { t.lean -= 20; t.head -= 12; t.fs -= 28; t.bs -= 20; t.hp = (t.hp || 0) - 0.12; }
        break;"""),
])
print('ok')
