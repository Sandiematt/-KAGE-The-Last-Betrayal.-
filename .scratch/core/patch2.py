def sub(path, pairs):
    s = open(path, encoding='utf8').read()
    for old, new in pairs:
        if s.count(old) != 1:
            raise SystemExit('PATCH MISS (%d) in %s:\n%s' % (s.count(old), path, old[:160]))
        s = s.replace(old, new)
    open(path, 'w', encoding='utf8', newline='').write(s)

sub('src/js/20-fighter.js', [
("if (this.reelT > 0) { t.lean -= 20; t.head -= 12; t.fs -= 28; t.bs -= 20; t.hp = (t.hp || 0) - 0.12; }",
 "if (this.reelT > 0) { t.lean -= 20; t.head -= 12; t.fs -= 28; t.bs -= 20; }"),
])

sub('src/js/15-logic.js', [
("""    hpMul *= bossy ? mode.bossHp : mode.hp;
    dmgMul *= bossy ? mode.bossDmg : mode.dmg;
    let hp = Math.round(d.hp * hpMul);""",
"""    hpMul *= bossy ? mode.bossHp : mode.hp;
    dmgMul *= bossy ? mode.bossDmg : mode.dmg;
    // the role (BUDO.roles): the rank and file are easier, sub-bosses a little harder, bosses harder
    const rk = BUDO.roles[Budo.roleOf(d, !!role && role !== 'elite')];
    hpMul *= rk.hp; dmgMul *= rk.dmg;
    let hp = Math.round(d.hp * hpMul);"""),
("""  // An enemy's AI tuning: a fresh copy of AI_PROFILES[profile], sharpened by the authored curve (stage level, New
  // Game+) and scaled by the mode, plus the mode's timing fields the AI and fighter read (windup, recovery, idle,
  // branch, unique). Clones and minions use a fixed aggression (0.8 / 0.6) scaled by the mode. On Normal this is
  // exactly the original tuning.
  aiTuning(profile, opts) {
    opts = opts || {};
    const base = AI_PROFILES[profile] || AI_PROFILES.regular, m = this.difficulty(opts.difficulty);
    const p = Object.assign({}, base, { react: base.react.slice(), combo: base.combo.slice() });""",
"""  // An enemy's AI tuning: a fresh copy of AI_PROFILES[profile] (with the foe's own fighting style on top: opts.style,
  // FIGHT_STYLES[id].tune), sharpened by the authored curve (stage level, New Game+), scaled by the mode and by the
  // foe's role (opts.rank 'regular' | 'sub' | 'boss', BUDO.roles: the rank and file are slower and tamer, sub-bosses
  // a little sharper, bosses sharper), plus the timing fields the AI and fighter read (windup, recovery, idle, branch,
  // unique, spam). Clones and minions use a fixed aggression (0.8 / 0.6) scaled by the mode. Without a rank it is the
  // mode's tuning alone.
  aiTuning(profile, opts) {
    opts = opts || {};
    const base = Object.assign({}, AI_PROFILES[profile] || AI_PROFILES.regular, opts.style || {}), m = this.difficulty(opts.difficulty);
    const p = Object.assign({}, base, { react: base.react.slice(), combo: base.combo.slice() });"""),
("""    if (opts.role === 'minion') p.aggr = Math.min(m.cap, 0.6 * m.aggr);
    Object.assign(p, { windup: m.windup, recovery: m.recovery, idle: m.idle, branch: m.branch, unique: m.unique });
    return p;""",
"""    if (opts.role === 'minion') p.aggr = Math.min(m.cap, 0.6 * m.aggr);
    Object.assign(p, { windup: m.windup, recovery: m.recovery, idle: m.idle, branch: m.branch, unique: m.unique, spam: 1 });
    const rk = opts.rank && BUDO.roles[opts.rank];
    if (rk) {
      p.aggr = Math.min(m.cap, p.aggr * rk.aggr); p.block = Math.min(0.88, p.block * rk.guard); p.parry = Math.min(0.5, p.parry * rk.parry);
      p.react = [p.react[0] * rk.react, p.react[1] * rk.react]; p.punish = Math.min(m.cap, p.punish * rk.punish);
      p.combo = [p.combo[0], Math.max(p.combo[0], p.combo[1] + rk.combo)];
      p.windup *= rk.windup; p.recovery *= rk.recovery; p.idle *= rk.idle; p.spam = rk.spam;
    }
    return p;"""),
])

sub('src/js/40-ai.js', [
("""  retune(opts) { this.opts = opts || {}; this.p = Logic.aiTuning((this.f.def || {}).ai || 'regular', this.opts); }""",
"""  // the foe's own fighting style (FIGHT_STYLES, 13-budo.js) and its role sharpen or tame the archetype
  retune(opts) {
    this.opts = opts || {}; this.style = Budo.style(this.f);
    this.p = Logic.aiTuning((this.f.def || {}).ai || 'regular', Object.assign({}, this.opts, { rank: Budo.role(this.f), style: this.style && this.style.tune }));
    this.fw = Budo.footwork(this.f);
  }"""),
("""        const btn = this.seq[this.seqI++];
        if (btn) { if (btn === 'fwd') c.dir = toward; else this.press(btn); }
        this.seqT = 0.1;
        if (this.seqI >= this.seq.length) { this.seq = null; this.t = rand(0.15, 0.35) * this.p.idle; }
      }""",
"""        const btn = this.seq[this.seqI++];
        this.seqT = 0.1;
        if (btn && !this.stepSeq(btn, p, toward)) { this.seqI--; this.seqT = 0.03; if ((this.seqWait = (this.seqWait || 0) + 1) > 40) this.seq = null; }
        else this.seqWait = 0;
        if (this.seq && this.seqI >= this.seq.length) {
          this.seq = null; this.t = rand(0.15, 0.35) * this.p.idle;
          // zanshin: after the string, step back out of the pocket instead of standing in it (BUDO.footwork)
          if (this.fw.away && chance(this.fw.away) && dist < 240) { this.plan = 'retreat'; this.t = rand(0.22, 0.4); }
        }
      }"""),
("""      if (dist < reach + 20 && chance(this.p.punish)) { this.punishedThis = true; this.attack(dist, true); return; }
    }""",
"""      if (dist < reach + 20 && chance(this.p.punish)) { this.punishedThis = true; this.attack(dist, true); return; }
      // a whiff just out of reach: step in on it (BUDO.footwork.stepIn; sub-bosses and bosses)
      if (this.fw.stepIn && dist < reach + this.fw.stepIn && f.dashCd <= 0 && (p.state === 'move' || p.state === 'land') && chance(this.p.punish * 0.75)) {
        this.punishedThis = true; this.startSeq(['dash', f.hasWeapon ? 'weapon' : 'punch']); return;
      }
    }"""),
("""  startSeq(list, delay) { this.seq = list; this.seqI = 0; this.seqT = delay || 0; this.plan = 'attack'; }
""",
"""  startSeq(list, delay) { this.seq = list; this.seqI = 0; this.seqT = delay || 0; this.seqWait = 0; this.plan = 'attack'; }
  /* One step of a string. Besides the buttons of press(): 'fwd' holds toward Kage, 'back' dashes away from him,
     'wait:0.3' holds the string, 'move:<id>' starts that MOVES entry outright (from neutral, or chained from the
     recovery of the move before it), 'ab:<id>' runs that BOSS_ABILITIES entry and ends the string. Returns false when
     the step cannot fire yet (the executor tries again next frame, and gives the string up after a while). */
  stepSeq(btn, p, toward) {
    const f = this.f, c = f.ctrl, w = this.world;
    if (btn === 'fwd') { c.dir = toward; return true; }
    if (btn === 'back') { c.dir = -toward; c.dashP = true; return true; }
    if (btn.startsWith('wait:')) { this.seqT = +btn.slice(5) || 0.1; return true; }
    if (btn.startsWith('move:')) {
      const id = btn.slice(5);
      if (!MOVES[id]) return true;
      if (f.state === 'move') { if (f.mphase < 2 || !f.grounded) return false; f.endMove(); f.setState('idle'); }
      else if (!f.canAct()) return false;
      f.facing = toward; f.startMove(id, w);
      return true;
    }
    if (btn.startsWith('ab:')) {
      const a = BOSS_ABILITIES[btn.slice(3)];
      if (a) { if (f.state === 'move') { if (f.mphase < 2) return false; f.endMove(); f.setState('idle'); } else if (!f.canAct()) return false; this.cds[a.id] = a.cd; a.run(f, w, this, p); }
      this.seq = null;
      return true;
    }
    this.press(btn);
    return true;
  }
  // a string of the foe's own style for this distance (FIGHT_STYLES strings, Budo.pickString); false when it has none
  tryString(p, dist) {
    const s = Budo.pickString(this, p, dist);
    if (!s) return false;
    const f = this.f, tell = s.tell ? s.tell * this.p.windup : 0;
    if (tell) { f.telegraph = Math.max(f.telegraph, tell); AudioManager.play('teleport'); }
    if (this.phaseData && this.phaseData.unblockable) f.unblockable = true;
    this.lastString = s;
    this.startSeq(s.seq.slice(), tell);
    return true;
  }
"""),
("""    const f = this.f, c = f.ctrl, m = p.move;
    let block = this.p.block, parry = this.p.parry, dodge = this.p.dodge;""",
"""    const f = this.f, c = f.ctrl, m = p.move;
    if (this.style && this.style.respond && this.style.respond(this, p, dist, toward, m) === true) return;
    let block = this.p.block, parry = this.p.parry, dodge = this.p.dodge;"""),
("""    // boss / sub-boss signature abilities
    if (this.tryAbility(p, dist, toward)) return;""",
"""    // the foe's own fighting style decides first (FIGHT_STYLES decide, 13-budo.js)
    const st = this.style, role = this.role();
    if (st && st.decide && st.decide(this, p, dist, toward) === true) return;
    // a guard held too long is thrown (BUDO.turtle): turtling never stalls a fight
    const T = BUDO.turtle;
    if (p.state === 'block' && p.st > T.hold && dist < T.range * f.scale && f.canAct() && chance(T.chance[role])) { this.startSeq(['grab']); return; }
    // boss / sub-boss signature abilities
    if (this.tryAbility(p, dist, toward)) return;"""),
("""    if (dist > reach + 30) {
      if (pr.dashIn && chance(pr.dashIn) && dist < 420) {""",
"""    if (dist > reach + 30) {
      if (st && st.strings && chance(aggr) && this.tryString(p, dist)) return;   // the style's openers from range
      if (pr.dashIn && chance(pr.dashIn) && dist < 420) {"""),
("""    const flash = f.def && f.def.flashEyes, tell = pr.windup;
    const delay = flash ? 0.32 * tell : 0;""",
"""    // the foe's own strings (FIGHT_STYLES strings) come before the generic ones
    if (this.style && this.style.strings && this.tryString(this.target(), dist)) return;
    const flash = f.def && f.def.flashEyes, tell = pr.windup;
    const delay = flash ? 0.32 * tell : 0;"""),
("""    if (!this.canReadSpam() || !chance(Math.min(R.cap[role], R.chance[role] + this.p.punish + WitnessBoss.readBonus(this, read)))) return false;""",
"""    if (!this.canReadSpam() || !chance(Math.min(R.cap[role], (R.chance[role] + this.p.punish) * this.p.spam + WitnessBoss.readBonus(this, read)))) return false;"""),
])

sub('src/js/60-engine.js', [
("""    f.ai = new AIController(f, this, { level: st.level, ng: st.ng, difficulty: st.difficulty, role });
    f.windupMul = f.ai.p.windup; f.recoveryMul = f.ai.p.recovery;
    return f;""",
"""    f.ai = new AIController(f, this, { level: st.level, ng: st.ng, difficulty: st.difficulty, role });
    f.windupMul = f.ai.p.windup; f.recoveryMul = f.ai.p.recovery;
    Budo.join(f, this);   // its fighting style's own posture and set-up (13-budo.js)
    return f;"""),
("""      for (const e of this.fighters) if (e.ai && e.def && e.def.adapts && e.alive && e.ai.adapted !== m.id) {""",
"""      // sub-bosses and bosses read a move thrown three times running (BUDO.adapt), as any foe with `adapts` does
      for (const e of this.fighters) if (e.ai && e.def && (e.def.adapts || BUDO.adapt[Budo.role(e)]) && e.alive && e.ai.adapted !== m.id) {"""),
("""    RageArts.step(this, dt);   // the rage arts' arenas""",
"""    Budo.step(this, dt);       // reeling fighters (13-budo.js)
    RageArts.step(this, dt);   // the rage arts' arenas"""),
])

sub('src/js/50-world.js', [
("""    WeaponSystem.draw(ctx, s);
""",
"""    WeaponSystem.draw(ctx, s);
    Budo.drawWorld(ctx, s);   // posture bars over fighters whose guard is hurt or broken (13-budo.js)
"""),
])
print('ok')
