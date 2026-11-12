/* KAGE — Enemy AI (regular / agile / defensive / ranged / heavy) and BossAI (phases + signature abilities) */

// AI_PROFILES (the per-archetype tuning) live in 10-data.js; Logic.aiTuning applies the stage curve and the difficulty mode.
// Impossible's unique combo variations: follow-ups appended to a string (dash-cancel, jump-in, kick into weapon).
const AI_VARIATIONS = {
  armed: [['dash', 'weapon', 'weapon'], ['kick', 'weapon'], ['jump', 'fwd', 'weapon'], ['punch', 'heavy']],
  unarmed: [['dash', 'punch', 'kick'], ['kick', 'heavy'], ['jump', 'fwd', 'kick'], ['punch', 'punch', 'kick']]
};

// directional combos the sub-bosses and bosses run: every cut in a new direction, so each one flows out of the last
// (DIR_COMBO); a boss runs three, a sub-boss the first two
const AI_ROUTES = [
  ['w:fwd', 'w:up', 'w:down'], ['w:diagDown', 'w:diagUp', 'w:fwd'], ['w:diagUp', 'w:down', 'w:fwd'],
  ['w:fwd', 'w:diagDown', 'w:up'], ['w:down', 'w:diagUp', 'w:diagDown'], ['w:up', 'w:fwd', 'w:diagDown']
];

class AIController {
  constructor(f, world, opts) {
    this.f = f; this.world = world;
    const d = f.def || {};
    // stage level, New Game+ and the difficulty mode sharpen the archetype (Logic.aiTuning); p also carries the
    // mode's timing: windup, recovery, idle (decision gaps), branch (mixed-string chance), unique (Impossible)
    this.retune(opts);
    this.t = rand(0.3, 0.7); this.plan = 'wait'; this.planT = 0; this.seq = null; this.seqI = 0; this.seqT = 0;
    this.dir = 0; this.block = 0; this.kickHold = 0; this.react = 0; this.reactTo = null; this.cds = {};
    this.phase = 0; this.phases = d.phases || null; this.abilities = d.abilities || [];
    this.adapted = null; this.lastSeen = null; this.recentHits = 0;
    // the family form (FAMILY_FORM, Logic.familyForm): a foe with `form` runs it as a scripted chain (startForm)
    this.form = d.form ? Logic.familyForm(d.form) : null; this.running = null; this.formCd = 1.2;
    if (d.type === 'boss' || d.type === 'sub') { f.ammo = 6; f.turnDelay = d.ai === 'defensive' || d.ai === 'heavy' ? 0.35 : 0.08; }
    else { f.ammo = this.p.kunai > 0.3 ? 30 : 3; f.turnDelay = d.ai === 'heavy' ? 0.4 : d.ai === 'defensive' ? 0.25 : 0.1; }
    if (this.p.ranged && f.baseWeapon === 'storm_orbs') this.abilities = this.abilities.concat(['orbVolley']);
  }
  // the foe's own fighting style (FIGHT_STYLES, 13-budo.js) and its role sharpen or tame the archetype
  retune(opts) {
    this.opts = opts || {}; this.style = Budo.style(this.f);
    this.p = Logic.aiTuning((this.f.def || {}).ai || 'regular', Object.assign({}, this.opts, { rank: Budo.role(this.f), style: this.style && this.style.tune }));
    this.fw = Budo.footwork(this.f);
  }
  target() { return this.world.player; }
  reachOf(f, kind) {
    if (kind === 'weapon') { const m = MOVES[f.weapon().moves[0]]; return (m.box[0] + m.box[2]) * f.scale * (f.hasWeapon ? weaponMul(f.weaponId(), f.wlvl).reach : 1); }
    if (kind === 'kick') return 128 * f.scale;
    return 100 * f.scale;
  }
  press(btn) {
    const c = this.f.ctrl;
    if (btn === 'punch') c.punchP = true; else if (btn === 'kick') c.kickP = true; else if (btn === 'weapon') c.weaponP = true;
    else if (btn === 'jump') c.jumpP = true; else if (btn === 'dash') c.dashP = true; else if (btn === 'special') c.specialP = true;
    else if (btn === 'grab') { c.grabP = true; }
    else if (btn.startsWith('w:')) { c.weaponP = true; c.aim = btn.slice(2); }   // a directional form (DIR_FORMS)
    else if (btn === 'heavy') { c.kickP = true; this.kickHold = rand(0.35, 0.75); }
  }
  startSeq(list, delay) { this.seq = list; this.seqI = 0; this.seqT = delay || 0; this.seqWait = 0; this.plan = 'attack'; }
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

  update(dt) {
    const f = this.f, c = f.ctrl, w = this.world, p = this.target();
    clearCtrlEdges(c);
    c.dir = 0; c.blockHeld = false; c.kickHeld = this.kickHold > 0; c.up = false;
    if (this.kickHold > 0) { this.kickHold -= dt; if (this.kickHold <= 0) c.kickR = true; }
    for (const k in this.cds) this.cds[k] -= dt;
    if (!f.alive || !p || w.phase !== 'fight' || f.state === 'grabbed') return;
    if (f.mimic && this.updateMimic(dt, p)) return;
    const dx = p.x - f.x, dist = Math.abs(dx), toward = Math.sign(dx) || 1;
    this.checkPhase();
    if (this.formCd > 0) this.formCd -= dt;
    if (this.running) { this.stepForm(dt, toward); return; }
    if (this.playback) { this.stepPlayback(dt, toward, dist); return; }
    // disarmed: go get the weapon back
    if (!f.hasWeapon && f.weaponId() === 'fists' && f.baseWeapon !== 'fists') {
      const pk = w.pickups.find(k => k.owner === f);
      if (pk && pk.grounded && !(dist < 120 && chance(0.5))) { c.dir = Math.sign(pk.x - f.x); if (Math.abs(pk.x - f.x) > 40 && this.p.dodge > 0.2 && chance(0.02)) c.dashP = true; return; }
    }
    // ---- reactions to incoming attacks ----
    const threat = this.threatened(p, dist);
    if (threat && this.reactTo !== p.move) {
      this.reactTo = p.move; this.react = rand(this.p.react[0], this.p.react[1]) * (this.lastSeen === p.move.id ? 0.6 : 1); this.lastSeen = p.move.id;
      if (this.readStrike(p)) return;   // Takashi: a repeated attack is read the moment it starts
      WitnessBoss.onThreat(this, p);    // the Witness: an overused move is answered by a Phantom Counter (69-witness.js)
    }
    if (!threat && p.state !== 'move') this.reactTo = null;
    if (this.reactTo && this.react > 0) {
      this.react -= dt;
      if (this.react <= 0 && threat && (f.canAct() || f.state === 'move' && f.mphase === 0)) this.respond(p, dist, toward);
    }
    // incoming projectile
    for (const pr of w.projectiles) {
      if (pr.team === f.team || pr.d.ground && !f.grounded) continue;
      const pd = pr.x - f.x;
      if (Math.sign(pd) === -Math.sign(pr.vx) && Math.abs(pd) < 260 && Math.abs(pd) > 60 && f.canAct() && chance(0.08)) {
        if (pr.d.ground) { c.jumpP = true; } else if (chance(this.p.block + 0.2)) this.block = 0.4; else if (chance(this.p.dodge + 0.2)) c.jumpP = true;
      }
    }
    if (this.block > 0) { this.block -= dt; c.blockHeld = true; if (f.isNeutral() || f.state === 'block') { if (dist > 200 && chance(0.02)) this.block = 0; return; } }
    // ---- executing a combo / sequence ----
    if (this.seq) {
      this.seqT -= dt;
      if (this.seqT <= 0 && (f.canAct() || (f.state === 'move' && f.mphase >= 1) || f.state === 'dash' || f.state === 'air')) {
        const btn = this.seq[this.seqI++];
        this.seqT = 0.1;
        if (btn && !this.stepSeq(btn, p, toward)) { this.seqI--; this.seqT = 0.03; if ((this.seqWait = (this.seqWait || 0) + 1) > 40) this.seq = null; }
        else this.seqWait = 0;
        if (this.seq && this.seqI >= this.seq.length) {
          this.seq = null; this.t = rand(0.15, 0.35) * this.p.idle;
          // zanshin: after the string, step back out of the pocket instead of standing in it (BUDO.footwork)
          if (this.fw.away && chance(this.fw.away) && dist < 240) { this.plan = 'retreat'; this.t = rand(0.22, 0.4); }
        }
      }
      if (this.seq && f.isNeutral() && dist > this.reachOf(f, 'weapon') + 60) c.dir = toward;
      return;
    }
    if (f.state === 'ability' || f.state === 'move' || f.state === 'throwing') return;
    // ---- punish openings ----
    const opening = (p.state === 'move' && p.mphase === 2 && p.mt > p.mdur[0] + p.mdur[1] + 0.03) || p.state === 'stun' || p.state === 'land' || (p.state === 'dash' && p.st > 0.12);
    if (opening && f.canAct() && !this.punishedThis) {
      const reach = Math.max(this.reachOf(f, 'weapon'), this.reachOf(f, 'punch'));
      if (dist < reach + 20 && chance(this.p.punish)) { this.punishedThis = true; this.attack(dist, true); return; }
      // a whiff just out of reach: step in on it (BUDO.footwork.stepIn; sub-bosses and bosses)
      if (this.fw.stepIn && dist < reach + this.fw.stepIn && f.dashCd <= 0 && (p.state === 'move' || p.state === 'land') && chance(this.p.punish * 0.75)) {
        this.punishedThis = true; this.startSeq(['dash', f.hasWeapon ? 'weapon' : 'punch']); return;
      }
    }
    if (p.state !== 'move' && p.state !== 'stun') this.punishedThis = false;
    // ---- decide ----
    this.t -= dt;
    if (this.t <= 0) this.decide(p, dist, toward);
    // ---- carry out movement plan ----
    if (this.plan === 'approach') { c.dir = toward; if (dist < this.p.pref) this.plan = 'hold'; }
    else if (this.plan === 'retreat') { c.dir = -toward; if (f.x < w.bounds.l + 60 || f.x > w.bounds.r - 60) { this.plan = 'hold'; if (this.p.dodge > 0.2) { c.jumpP = true; c.dir = toward; } } }
    else if (this.plan === 'strafe') { c.dir = this.strafeDir; }
    else if (this.plan === 'mirror') { c.dir = -(p.ctrl.dir || 0); c.blockHeld = !!p.ctrl.blockHeld; }
    else if (this.plan === 'ring') { c.dir = toward; if (dist < this.ring) this.plan = 'hold'; }
    if (p.state === 'down' || p.state === 'getup') { if (dist < 140) c.dir = -toward; }
  }

  /* Mimic intro (an encounter's `mimicIntro`, see StretchSession.spawnWave): for a moment the foe does nothing but
     stand in Kage's own idle stance, breathing with him, facing as his mirror image would (Fighter.update /
     updatePose read f.mimic). It ends when the time runs out, Kage closes in, or the foe is struck; then it attacks.
     Returns true while the foe is still mimicking. */
  startMimic(src, dur) { this.f.mimic = { src, t: dur }; }
  updateMimic(dt, p) {
    const f = this.f, m = f.mimic;
    m.t -= dt;
    const struck = f.state !== 'idle' && f.state !== 'walk' && f.state !== 'pose';
    if (m.t > 0 && Math.abs(p.x - f.x) > 110 && !struck) return true;
    f.mimic = null;
    this.t = 0.05; this.plan = 'approach';
    if (this.world.onMimicEnd) this.world.onMimicEnd(f);
    return false;
  }

  /* Guard Return's read (Takashi; any foe whose phase lists `guardReturn`): when Kage starts an attack that is a pattern
     (Logic.readsPattern over the session's move history: the same move three times running, or half of the last eight),
     the guard goes up at once, before the blow lands, so the repeated strike is turned aside and punished. A varied
     attack is never read. The chance is the difficulty mode's `punish` (+0.35, capped at 1). Returns true when it fires. */
  readStrike(p) {
    const f = this.f, w = this.world, list = this.phaseData ? this.phaseData.abilities : this.abilities;
    // his own Guard Return, or an Act III sub-boss's reduced one (TAKASHI_VARIANTS)
    const variant = id => TAKASHI_VARIANTS[id] || CORE_ECHO_MOVES[id];
    const gid = list && list.find(id => id === 'guardReturn' || (variant(id) && variant(id).base === 'guardReturn'));
    const a = gid && BOSS_ABILITIES[gid];
    if (!a || (this.cds[gid] || 0) > 0 || !p.move || p.move.kind === 'throw') return false;
    if (!f.grounded || !(f.canAct() || f.state === 'block' || (f.state === 'move' && f.mphase === 0))) return false;
    if (!Logic.readsPattern(w.history || [], p.move.id) || !chance(Math.min(1, this.p.punish + 0.35))) return false;
    this.seq = null; this.block = 0; f.move = null;
    this.cds[gid] = a.cd;
    a.run(f, w, this, p);
    w.fx.popText(f, gid === 'guardReturn' ? 'HE READS YOU' : 'READ', '#7fd0c8');
    return true;
  }

  /* Playback: a list of [{ id, wait }] MOVES the Witness performs in order, the way Kage did (phase 1 mirrors his latest
     string with his own timing, Logic.mirrorSequence; Echo Replication plays back his last landed string). Each move
     fires once it can (a cut chains from the previous one's follow-through, an air move jumps first), closing the gap
     on the way. o: { speed (a tempo on start-up and recovery), dmg (a damage multiplier), echo }. A move Mugen no Ha
     cannot perform with the weapon it holds now is skipped; getting hit, or a move that cannot fire in time, ends it. */
  startPlayback(steps, o) {
    o = o || {};
    const f = this.f, list = (steps || []).filter(s => MOVES[s.id]);
    if (!list.length) return;
    this.playback = { steps: list, i: 0, t: 0, wait: list[0].wait || 0, boost: f.boostAtk, dmg: f.dmgMul, echo: !!o.echo };
    f.boostAtk = (f.boostAtk || 1) / (o.speed || 1); f.dmgMul *= o.dmg || 1;
    if (o.echo) f.echoing = true;
  }
  endPlayback() {
    const r = this.playback; if (!r) return;
    const f = this.f; f.boostAtk = r.boost; f.dmgMul = r.dmg; f.echoing = false; this.playback = null;
    this.t = rand(0.2, 0.35) * this.p.idle;
  }
  canPerform(id) {
    const m = MOVES[id], w = this.f.weapon(); if (!m || m.kind === 'throw' || m.kind === 'grab') return false;
    if (UNARMED[id]) return true;   // punches, kicks and their air versions: any fighter can copy them
    return (w.moves || []).includes(id) || w.counter === id || w.air === id || !!(w.dirs && Object.values(w.dirs).includes(id));
  }
  stepPlayback(dt, toward, dist) {
    const f = this.f, c = f.ctrl, w = this.world, r = this.playback, st = r.steps[r.i];
    r.t += dt;
    const broken = f.state === 'hit' || f.state === 'juggle' || f.state === 'stun' || f.state === 'down' || f.state === 'getup' || f.state === 'grabbed';
    if (broken || r.t > 1.4) return this.endPlayback();
    if (r.wait > 0) { r.wait -= dt; return; }
    if (!this.canPerform(st.id)) return this.nextPlayback();
    const m = MOVES[st.id], reach = m.box ? (m.box[0] + m.box[2]) * f.scale * (f.hasWeapon ? weaponMul(f.weaponId(), f.wlvl).reach : 1) : 120;
    const ready = f.canAct() || (f.state === 'move' && f.mphase === 2 && f.move.kind !== 'air' && f.grounded);
    if (m.kind === 'air') {
      if (f.state === 'air') { f.startMove(st.id, w); return this.nextPlayback(); }
      if (ready && f.grounded) { f.endMove(); f.setState('idle'); c.dir = toward; f.doJump(w); }
      return;
    }
    if (!f.grounded) { c.dir = toward; return; }
    // close the gap first (a moment at most): a copied cut thrown at empty air reads as a mirror, not an attack
    if (dist > reach + 30 && r.t < 0.6 && f.isNeutral()) { c.dir = toward; return; }
    if (!ready) return;
    f.endMove(); f.facing = toward; f.startMove(st.id, w);
    this.nextPlayback();
  }
  nextPlayback() {
    const r = this.playback; r.i++; r.t = 0;
    if (r.i >= r.steps.length) this.endPlayback(); else r.wait = Math.min(0.6, r.steps[r.i].wait || 0);
  }
  // Phase 1 (and 3): the mirror. Kage's latest string is replayed back at him with his own timing.
  mirrorAttack() {
    const seq = Logic.mirrorSequence(this.world.hitLog);
    if (!seq.length) return false;
    this.startPlayback(seq, { speed: 1 });
    return !!this.playback;
  }
  /* ---- the spam read (every foe; SPAM_READ in 10-data.js, FightSession.onPlayerAction) ----
     Whether this foe is free to answer a spammed action right now: not knocked down, juggled, grabbed, bound or busy
     with a committed ability, not mid-strike, and off its own cool-down. A foe reeling from the spammed blows (hit)
     can still slip out: that is the point of the read. */
  canReadSpam() {
    const f = this.f, s = f.state;
    if (!f.alive || f.mimic || this.playback || this.running || (this.cds.spamRead || 0) > 0) return false;
    if (s === 'move') return f.mphase !== 1;
    if (f.canAct() || s === 'air' || s === 'hit' || s === 'kickcharge') return true;
    // bosses and sub-bosses break out of a juggle or a knockdown to read it: spam never pins a boss
    return this.role() !== 'regular' && f.hp > 0 && (s === 'juggle' || s === 'down' || s === 'getup');
  }
  role() { const t = this.f.def && this.f.def.type; return t === 'boss' ? 'boss' : t === 'sub' ? 'sub' : 'regular'; }
  /* Kage has started the same attack (or dash, or jump) one time too many (read: Logic.spamRead's { key, streak }).
     A red "!" flashes over the foe; it slips out to Kage's far side in a short hop he cannot touch, lands behind him,
     turns, and answers with its weapon's counter cut (its rising launcher if Kage is in the air), under super armour,
     for SPAM_READ.punishMul damage (Combat.applyHit). With no room behind him it springs back out of reach instead and
     lunges in with its dash strike. The chance is the role's base plus the foe's difficulty-scaled `punish`. Returns
     true when the read fires. */
  spamPunish(p, read) {
    const f = this.f, w = this.world, R = SPAM_READ, role = this.role();
    if (!this.canReadSpam() || !chance(Math.min(R.cap[role], (R.chance[role] + this.p.punish) * this.p.spam + WitnessBoss.readBonus(this, read)))) return false;
    this.cds.spamRead = R.cd[role];
    this.seq = null; this.block = 0; this.reactTo = p.move || null; this.punishedThis = true;
    if (f.state === 'move') f.endMove();
    if (f.state === 'juggle' || f.state === 'down' || f.state === 'getup') { f.bodyRot = 0; f.bodyRotVel = 0; f.tumble = null; f.juggle = 0; w.fx.ring(f.x, f.y - 60 * f.scale, 90, f.accent || C.emberBright, 0.3, 4); }
    const s = f.scale, toward = Math.sign(p.x - f.x) || 1, l = w.bounds.l + 30, r = w.bounds.r - 30;
    // the other side of Kage (behind him as he attacks); against a wall, out of reach the other way instead
    let dest = clamp(p.x + toward * R.behind * s, l, r), cross = true;
    if (Math.abs(dest - p.x) < 70 * s) { dest = clamp(f.x - toward * 240 * s, l, r); cross = false; }
    const air = !p.grounded || read.key === 'jump';
    const wpn = f.weapon(), d = wpn.dirs;
    const id = air ? (d && d.up) || 'p3' : cross ? (wpn.counter && f.hasWeapon ? wpn.counter : (d && d.fwd) || 'dp') : (d && d.dash) || 'dp';
    const W = R.react * this.p.windup, E = R.evade, x0 = f.x, col = f.accent || C.emberBright;
    f.telegraph = W + E;
    w.fx.popText(f, '!', '#ff3b2f');
    w.fx.stamp('READ', f.x, f.y - f.height() * 0.9, 2, col, read.key === 'dash' ? 'DASH READ' : read.key === 'jump' ? 'JUMP READ' : 'SPAM READ');
    AudioManager.play('teleport', { pitch: 1.5 });
    f.startAbility({ dur: W + E + 0.2, float: true, uninterruptible: true, rate: 30,
      pose: (f, t) => (t < W ? POSES.land : POSES.jump),
      start(f) { f.invuln = Math.max(f.invuln, W + E + 0.05); f.vx = 0; f.facing = toward; },
      update(f, w, t) {
        f.vx = 0; f.vy = 0;
        if (t < W) return;
        const u = clamp((t - W) / E, 0, 1), e = Ease.inOut(u);
        f.x = lerp(x0, dest, e); f.y = -Math.sin(u * Math.PI) * R.hopH * s * (cross ? 1 : 0.6); f.grounded = false;
        if (((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, 'rgba(255,90,90,0.4)');
        if (u < 1) return;
        f.y = 0; f.grounded = true; f.vy = 0;
        f.facing = Math.sign(p.x - f.x) || -toward;
        w.fx.dust(f.x, 0, 6);
        f.endAbility(w);
        if (f.startMove(id, w)) { f.punishMove = f.move; f.superArmor = true; f.mdur[0] = Math.min(f.mdur[0], 0.12); }
      } });
    return true;
  }

  threatened(p, dist) {
    if (p.state !== 'move' || !p.move || p.mphase > 1) return false;
    if (Math.sign(this.f.x - p.x) !== p.facing) return false;
    const m = p.move;
    if (m.kind === 'throw') return dist < 500;
    const reach = (m.box ? (m.box[0] + m.box[2]) * p.scale * (p.hasWeapon ? weaponMul(p.weaponId(), p.wlvl).reach : 1) : 120) + (m.lunge ? m.lunge * 0.18 : 0);
    return dist < reach + 50;
  }

  respond(p, dist, toward) {
    const f = this.f, c = f.ctrl, m = p.move;
    if (this.style && this.style.respond && this.style.respond(this, p, dist, toward, m) === true) return;
    let block = this.p.block, parry = this.p.parry, dodge = this.p.dodge;
    // punish predictable behaviour: spammed moves get read
    const pred = this.world.predictability(m.id);
    if (pred > 0.45) { block += 0.25; parry += 0.18; }
    if (this.adapted && this.adapted === m.id) { parry = 1; this.world.fx.stamp('ADAPTED', f.x, f.y - f.height(), 2, '#7fd0c8'); }
    if (m.unb || m.kind === 'grab') { block = 0; dodge += 0.3; }
    if (m.low && f.def && f.def.shield) { dodge += 0.2; }
    // the overhead and the kesa cut crush a guard: step out of them rather than block
    if (m.aim === 'down' || m.aim === 'diagDown') { dodge += 0.18; block *= 0.7; }
    const rising = m.aim === 'up' || m.aim === 'diagUp';
    const r = Math.random();
    const startupLeft = p.mdur[0] - p.mt;
    if (r < parry && startupLeft < 0.14 && f.grounded) { c.blockHeld = true; f.setState('block'); f.blockT = 0; this.block = 0.3; return; }
    if (r < parry + block && f.grounded && !m.unb) { this.block = rand(0.3, 0.55); c.blockHeld = true; return; }
    if (r < parry + block + dodge) {
      if (m.low || (m.kind === 'throw')) { c.jumpP = true; c.dir = chance(0.5) ? toward : -toward; }
      else if (rising || chance(0.6)) { c.dashP = true; c.dir = -toward; }   // never jump into a rising cut
      else { c.jumpP = true; c.dir = toward; }
      return;
    }
    // trade / counter-attack if faster
    if (chance(this.p.aggr * 0.4) && dist < this.reachOf(f, 'punch') + 20) this.press('punch');
  }

  decide(p, dist, toward) {
    const f = this.f, pr = this.p, w = this.world;
    this.t = rand(0.22, 0.5) * (pr.heavy ? 1.3 : 1) * pr.idle;
    const hpK = f.hp / f.maxHp;
    let aggr = pr.aggr;
    if (hpK < 0.35) aggr += f.def && (f.def.ai === 'defensive' || f.def.ai === 'ranged') ? -0.1 : 0.15;
    if (this.phaseData && this.phaseData.aggressive) aggr += 0.2;
    if (p.state === 'down' || p.state === 'getup') { this.plan = 'hold'; return; }
    // stretches: only a couple of foes press the attack at once (world.mayEngage); the rest circle at a distance
    if (w.mayEngage && !w.mayEngage(f)) { this.waitTurn(dist, toward); return; }
    // the foe's own fighting style decides first (FIGHT_STYLES decide, 13-budo.js)
    const st = this.style, role = this.role();
    if (st && st.decide && st.decide(this, p, dist, toward) === true) return;
    // a guard held too long is thrown (BUDO.turtle): turtling never stalls a fight
    const T = BUDO.turtle;
    if (p.state === 'block' && p.st > T.hold && dist < T.range * f.scale && f.canAct() && chance(T.chance[role])) { this.startSeq(['grab']); return; }
    // boss / sub-boss signature abilities
    if (this.tryAbility(p, dist, toward)) return;
    // the family form: from dash range, open with the whole chain
    if (this.form && this.formCd <= 0 && dist > 170 && dist < 480 && f.canAct() && chance(0.7)) { this.startForm(); return; }
    // ranged behaviour
    if (pr.ranged) {
      if (dist < pr.pref - 120 && chance(0.6)) { if (chance(pr.dodge)) { f.ctrl.dashP = true; f.ctrl.dir = -toward; } else this.plan = 'retreat'; return; }
      if (dist > 220 && chance(pr.kunai) && f.ammo > 0 && f.canAct()) { this.startSeq(['special']); return; }
    }
    const reachW = this.reachOf(f, 'weapon'), reachP = this.reachOf(f, 'punch');
    const reach = Math.max(reachW, reachP);
    if (dist > reach + 30) {
      if (st && st.strings && chance(aggr) && this.tryString(p, dist)) return;   // the style's openers from range
      if (pr.dashIn && chance(pr.dashIn) && dist < 420) { this.startSeq(['dash', chance(0.5) ? 'punch' : 'kick']); return; }
      if (pr.jump && chance(pr.jump) && dist < 380) { this.startSeq(['jump', 'fwd', 'fwd', chance(0.5) ? 'kick' : 'weapon']); return; }
      if (dist > 300 && f.ammo > 0 && chance(pr.kunai * 0.6)) { this.startSeq(['special']); return; }
      this.plan = 'approach'; return;
    }
    if (chance(aggr)) { if (this.phaseData && this.phaseData.mirror && chance(0.75) && this.mirrorAttack()) return; this.attack(dist); return; }
    // the mirror's footwork: while it waits it moves as Kage's mirror image would (he steps in, it steps in)
    if (this.phaseData && this.phaseData.mirror && chance(0.6)) { this.plan = 'mirror'; this.t = rand(0.3, 0.6); return; }
    if (chance(pr.grab) && dist < 90 && (p.state === 'block' || chance(0.3))) { this.startSeq(['grab']); return; }
    const r = Math.random();
    if (r < 0.35) { this.plan = 'strafe'; this.strafeDir = chance(0.5) ? toward : -toward; this.t = rand(0.15, 0.35); }
    else if (r < 0.55 && pr.block > 0.3) { this.block = rand(0.3, 0.7); }
    else this.plan = 'hold';
  }

  waitTurn(dist, toward) {
    const ring = this.world.waitRing || 360;
    this.ring = ring;
    if (dist < ring - 70) this.plan = 'retreat';
    else if (dist > ring + 90) this.plan = 'ring';
    else if (chance(0.4)) { this.plan = 'strafe'; this.strafeDir = chance(0.5) ? toward : -toward; this.t = rand(0.2, 0.4); }
    else this.plan = 'hold';
  }

  attack(dist, quick) {
    const f = this.f, pr = this.p;
    const reachW = this.reachOf(f, 'weapon');
    const hasW = f.weapon().moves && f.weaponId() !== 'fists' || f.baseWeapon === 'iron_fists';
    const n = randi(pr.combo[0], pr.combo[1]);
    if (quick) {
      const q = dist < 100 * f.scale ? ['punch', 'punch'] : hasW ? ['weapon', 'weapon'] : ['kick'];
      // Impossible: punishes run on into a launcher
      this.startSeq(pr.unique && chance(0.6) ? q.concat(hasW ? ['weapon'] : ['kick']) : q); return;
    }
    // the foe's own strings (FIGHT_STYLES strings) come before the generic ones
    if (this.style && this.style.strings && this.tryString(this.target(), dist)) return;
    const flash = f.def && f.def.flashEyes, tell = pr.windup;
    const delay = flash ? 0.32 * tell : 0;
    if (flash) { f.telegraph = 0.32 * tell; AudioManager.play('teleport'); }
    if (pr.heavy && chance(0.45)) { f.telegraph = Math.max(f.telegraph, 0.3 * tell); this.startSeq(['heavy'], 0.2 * tell); return; }
    const roll = Math.random();
    let seq;
    if (hasW && dist < reachW + 10 && roll < 0.6) seq = new Array(n).fill('weapon');
    else if (dist < 105 * f.scale && roll < 0.75) seq = new Array(Math.min(3, n)).fill('punch');
    else if (roll < 1 - pr.branch) seq = chance(0.5) ? ['kick'] : ['heavy'];
    else seq = hasW ? ['weapon', 'punch', 'punch'] : ['punch', 'kick'];
    // sword arcs (11-sword-arcs.js): foes cut in directions the way Kage can, picked for the moment (aimFor); sub-bosses
    // and bosses also run whole directional combos (AI_ROUTES), each cut in a new direction flowing from the last
    const dirs = hasW && f.weapon().dirs, role = this.role();
    if (dirs && role !== 'regular' && chance(0.2 + pr.branch + (role === 'boss' ? 0.15 : 0))) seq = pick(AI_ROUTES).slice(0, role === 'boss' ? 3 : 2);
    else if (dirs && chance(0.25 + pr.branch)) {
      const form = this.aimFor(this.target(), dist, reachW);
      if (seq[0] === 'weapon') seq = seq.length > 1 && chance(0.6) ? seq.slice(0, -1).concat([form]) : [form].concat(seq.slice(1));
      else if (seq[0] === 'kick' || seq[0] === 'heavy') seq = seq.concat([form]);
      else seq = [form];
    }
    // Impossible: unique combo variations that extend the string and leave fewer openings
    if (pr.unique && chance(0.5)) seq = seq.concat(pick(hasW ? AI_VARIATIONS.armed : AI_VARIATIONS.unarmed));
    if (this.phaseData && this.phaseData.unblockable) f.unblockable = true;
    this.startSeq(seq, delay);
  }

  // the directional cut that fits the moment: rising cuts for a foe in the air, the guard-breaking overhead and
  // diagonal against a raised guard, the travelling cuts from range, any direction up close
  aimFor(p, dist, reachW) {
    if (p && !p.grounded) return chance(0.65) ? 'w:up' : 'w:diagUp';
    if (p && p.state === 'block') return chance(0.6) ? 'w:down' : 'w:diagDown';
    if (dist > reachW + 10) return pick(['w:fwd', 'w:diagDown', 'w:diagUp']);
    return pick(['w:up', 'w:down', 'w:diagUp', 'w:diagDown', 'w:fwd']);
  }

  /* ---- the family form ----
     Runs Logic.familyForm(def.form) step by step as a script: each step waits its `wait`, then fires as soon as the
     fighter can perform it (a cut chains from the previous one's follow-through, an aerial jumps off the rising cut and
     cuts near the top of the jump, a later aerial goes off the double jump). The style's `tempo` scales every cut's
     start-up and recovery while the form runs (Fighter.boostAtk). Getting hit, or a step that cannot fire in time, breaks
     the form off. */
  startForm() {
    const f = this.f;
    this.running = { i: 0, t: 0, wait: this.form.steps[0].wait, boost: f.boostAtk };
    f.boostAtk = (f.boostAtk || 1) * this.form.tempo;
  }
  endForm() {
    const r = this.running; if (!r) return;
    this.f.boostAtk = r.boost; this.running = null;
    this.formCd = rand(1.4, 2.6) * this.p.idle; this.t = rand(0.15, 0.3) * this.p.idle;
  }
  stepForm(dt, toward) {
    const f = this.f, c = f.ctrl, w = this.world, r = this.running, steps = this.form.steps, st = steps[r.i];
    r.t += dt;
    const broken = f.state === 'hit' || f.state === 'juggle' || f.state === 'stun' || f.state === 'down' || f.state === 'getup' || f.state === 'grabbed';
    if (broken || r.t > 1.6) return this.endForm();
    if (!f.grounded || f.state === 'prejump') c.dir = toward;   // drift toward the target through the air
    if (r.wait > 0) { r.wait -= dt; return; }
    const ready = f.canAct() || (f.state === 'move' && f.mphase === 2 && f.move.kind !== 'air' && f.grounded);
    let done = false;
    switch (st.act) {
      case 'stance': done = true; break;   // the stance is the step's hold (its wait)
      case 'dash': if (f.canAct()) { f.startDash(toward, w); done = true; } break;
      case 'move': if (ready) { f.endMove(); f.startMove(st.move, w); done = true; } break;
      case 'air':
        if (f.state === 'air' && f.vy > -420) { f.startMove(st.move, w); done = true; }
        else if (f.state === 'move' && f.move.kind === 'air' && f.mphase === 2 && f.jumps < 2) { f.endMove(); f.setState('air'); c.dir = toward; f.doJump(w); }
        else if (ready && f.grounded) { f.endMove(); f.setState('idle'); c.dir = toward; f.doJump(w); }
        break;
      case 'land': if (f.grounded && f.canAct()) done = true; break;
    }
    if (!done) return;
    r.i++; r.t = 0;
    if (r.i >= steps.length) this.endForm(); else r.wait = steps[r.i].wait;
  }

  /* ---- bosses ---- */
  checkPhase() {
    const f = this.f;
    if (!this.phases) return;
    // the phase thresholds are data on the boss (Logic.bossPhases: 1, 0.66, 0.33 unless it says otherwise)
    const target = Logic.bossPhaseAt(f.def.id, f.hp / f.maxHp);
    if (target > this.phase) {
      this.phase = target;
      this.world.onBossPhase(f, target, this.phases[target]);
      f.move = null; this.seq = null; this.endPlayback();
      BOSS_ABILITIES.roar.run(f, this.world, this);
    }
    this.phaseData = this.phases[this.phase];
    f.poisonBlade = !!this.phaseData.poison;
    if (this.phaseData.berserk) { f.speedMul = (f.baseSpeed || 1) * 1.25; f.boostAtk = 0.78; }
    // a phase's tempo (Akari's): faster movement and harder hits each phase; its eye glow and petal colour
    const tp = this.phaseData.tempo;
    if (tp) {
      if (f._dmg0 == null) f._dmg0 = f.dmgMul;
      f.speedMul = (f.baseSpeed || 1) * tp.speed; f.dmgMul = f._dmg0 * tp.dmg;
    }
    if (this.phaseData.eye) f.eye = this.phaseData.eye;
    if (this.phaseData.petal) f.petal = this.phaseData.petal;
  }
  tryAbility(p, dist, toward) {
    const list = this.phaseData ? this.phaseData.abilities : this.abilities;
    if (!list || !list.length || !this.f.canAct()) return false;
    const opts = [];
    for (const id of list) {
      const a = BOSS_ABILITIES[id];
      if (!a || (this.cds[id] || 0) > 0) continue;
      if (dist < a.range[0] || dist > a.range[1]) continue;
      if (a.cond && !a.cond(this.f, this.world, this, p, dist)) continue;
      opts.push(a);
    }
    if (!opts.length) return false;
    const a = pick(opts);
    if (!chance(a.chance * (this.phaseData && this.phaseData.aggressive ? 1.3 : 1))) return false;
    this.cds[a.id] = a.cd * (this.phaseData && this.phaseData.berserk ? 0.7 : 1) * (this.phaseData && this.phaseData.tempo ? this.phaseData.tempo.cd : 1);
    a.run(this.f, this.world, this, p);
    if (this.world.storm) StormDirector.ability(this.world, this.f, a);   // cosmetic: the sky answers the wind-up
    return true;
  }
}

/* ---- signature abilities. Each one is a scripted Fighter state with its own telegraph ---- */
const BOSS_ABILITIES = {
  roar: { id: 'roar', cd: 0, range: [0, 9999], chance: 1,
    run(f, w) {
      if (WitnessBoss.is(f)) return WitnessBoss.shift(f, w);   // the Witness's own phase shift (69-witness.js)
      f.startAbility({ dur: 1.1, uninterruptible: true, pose: POSES.castUp, rate: 10,
        start(f) { f.invuln = 1.2; AudioManager.play('boss'); w.fx.ring(f.x, f.y - 100, 320, f.accent, 0.6, 8); w.fx.shake(0.5); w.fx.slowmo(0.5, 0.5);
          const pl = w.player; if (pl && Math.abs(pl.x - f.x) < 300 && pl.alive) { pl.vx = Math.sign(pl.x - f.x) * 700; if (pl.isNeutral() || pl.state === 'block') { pl.setState('hit'); pl.hitstun = 0.3; } } } });
    } },
  lunge: { id: 'lunge', cd: 3.5, range: [180, 520], chance: 0.7,
    run(f, w) {
      f.telegraph = 0.35;
      f.startAbility({ dur: 1.3, trail: true, rate: 30,
        pose: (f, t) => (t < 0.35 ? MOVES.tw5.w : t < 0.62 ? MOVES.tw1.s : POSES.land),
        update(f, w, t, dt) {
          if (t < 0.35) { f.vx = damp(f.vx, -f.facing * 60, 8, dt); return; }
          if (t < 0.62) {
            f.vx = f.facing * 1350; if (((t * 60) | 0) % 2 === 0) w.fx.afterimage(f);
            if (!this.hit) { this.hit = Combat.area(w, f, fbox(f, 0, -190, 140, 150), { dmg: 15 * f.dmgMul, kb: 420, up: -200, hs: 0.45, imp: 2, hsnd: 'slash', stamp: 'SLASH' }); }
            if (!this.snd) { this.snd = 1; AudioManager.play('dash'); }
          } else { f.vx = damp(f.vx, 0, 12, dt); if (!this.tell) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); } }
        } });
    } },
  teleport: { id: 'teleport', cd: 5, range: [0, 900], chance: 0.6,
    run(f, w) {
      const pl = w.player;
      f.startAbility({ dur: 1.0, rate: 30,
        start(f) { w.smokeCloud(f.x, true); AudioManager.play('teleport'); f.invuln = 0.9; },
        update(f, w, t) {
          if (t < 0.12) { f.alpha = 1 - t / 0.12; return; }
          if (t < 0.55) {
            f.visible = false;
            if (!this.marked && t > 0.3) { this.marked = 1; const side = pl.facing; this.dest = clamp(pl.x - side * 110, w.bounds.l + 20, w.bounds.r - 20); w.fx.smoke(this.dest, -40, 5); AudioManager.play('smoke'); }
            return;
          }
          if (!this.arrived) {
            this.arrived = 1; f.visible = true; f.alpha = 1; f.x = this.dest != null ? this.dest : f.x; f.facing = pl.x > f.x ? 1 : -1; f.invuln = 0.1;
            w.smokeCloud(f.x); f.endAbility(w); f.startMove(f.weapon().moves[0], w);
          }
        },
        end(f) { f.visible = true; f.alpha = 1; } });
    } },
  smokeBomb: { id: 'smokeBomb', cd: 6, range: [140, 700], chance: 0.6,
    run(f, w) {
      f.startAbility({ dur: 0.5, pose: MOVES.kunai.s, rate: 20,
        update(f, w, t) { if (t > 0.18 && !this.done) { this.done = 1; WeaponSystem.spawn(w, 'smoke', f); } } });
    } },
  moonDash: { id: 'moonDash', cd: 4.5, range: [120, 600], chance: 0.65,
    run(f, w, ai) {
      const n = ai.phaseData && ai.phaseData.berserk ? 3 : 2;
      f.telegraph = 0.4;
      f.startAbility({ dur: 0.4 + n * 0.42 + 0.5, trail: true, rate: 36,
        pose: (f, t) => (t < 0.4 ? MOVES.tw5.w : MOVES[(((t - 0.4) / 0.42) | 0) % 2 ? 'tw2' : 'tw1'].s),
        update(f, w, t, dt) {
          if (t < 0.4) return;
          const i = ((t - 0.4) / 0.42) | 0, k = ((t - 0.4) % 0.42) / 0.42;
          if (i >= n) { f.vx = damp(f.vx, 0, 10, dt); return; }
          if (i !== this.i) { this.i = i; this.hit = false; f.facing = w.player.x > f.x ? 1 : -1; AudioManager.play('dash'); }
          if (k < 0.55) {
            f.vx = f.facing * 1500; w.fx.afterimage(f, 'rgba(155,140,255,0.35)');
            if (!this.hit) this.hit = Combat.area(w, f, fbox(f, -20, -190, 150, 160), { dmg: 11 * f.dmgMul, kb: 280, up: -260, hs: 0.42, imp: 2, hsnd: 'slash' });
          } else f.vx = damp(f.vx, 0, 14, dt);
        } });
    } },
  clones: { id: 'clones', cd: 13, range: [0, 900], chance: 0.8, cond: (f, w) => w.fighters.filter(x => x.clone && x.alive).length === 0,
    run(f, w) {
      f.startAbility({ dur: 0.9, pose: POSES.castUp, rate: 14, uninterruptible: true,
        start(f) { f.invuln = 0.9; w.fx.banner('Hollow Illusions', 'Only the true one has eyes', '#9b8cff'); },
        update(f, w, t) { if (t > 0.5 && !this.done) { this.done = 1; w.spawnClones(f, 2); } } });
    } },
  shieldBash: { id: 'shieldBash', cd: 3, range: [0, 150], chance: 0.6,
    run(f, w) {
      f.startAbility({ dur: 0.75, rate: 26,
        pose: (f, t) => (t < 0.3 ? P({ lean: -6, bs: 40, be: 80, wb: 180, fs: 40, fe: 40, wa: 98 }, STANCES.shield) : P({ lean: 26, rx: 20, bs: 96, be: 0, wb: 180, fs: 30, fe: 40, wa: 98 }, STANCES.shield)),
        update(f, w, t) {
          if (t > 0.3 && !this.done) { this.done = 1; f.vx = f.facing * 520; AudioManager.play('heavyswing');
            Combat.area(w, f, fbox(f, 10, -200, 110, 200), { dmg: 10 * f.dmgMul, kb: 520, hs: 0.4, imp: 2, hsnd: 'heavy', gb: 80, stamp: 'BASH' }); }
        } });
    } },
  float: { id: 'float', cd: 9, range: [0, 900], chance: 0.7,
    run(f, w) {
      f.startAbility({ dur: 3.6, float: true, rate: 10, pose: POSES.cast,
        start(f) { f.vy = -620; f.grounded = false; AudioManager.play('djump'); },
        update(f, w, t, dt) {
          const pl = w.player;
          if (t < 0.4) { f.vy = damp(f.vy, 0, 6, dt); }
          else { f.vy = damp(f.vy, (-240 - f.y) * 2 + Math.sin(t * 3) * 40, 4, dt); f.vx = damp(f.vx, Math.sign(pl.x - f.x) * 60, 3, dt); f.facing = pl.x > f.x ? 1 : -1; }
          const shots = ((t - 0.5) / 0.8) | 0;
          if (t > 0.5 && shots !== this.s && shots < 4) { this.s = shots; const pr = WeaponSystem.spawn(w, 'orb', f, { target: pl }); const a = Math.atan2(pl.y - 100 - f.sk.fha.y, pl.x - f.sk.fha.x); pr.vx = Math.cos(a) * 520; pr.vy = Math.sin(a) * 520; }
          if (t > 3.2) f.vy = 400;
          for (let i = 0; i < 2; i++) w.fx.part({ x: f.x + rand(-20, 20), y: f.y - rand(0, 20), vx: rand(-20, 20), vy: rand(40, 120), life: 0.4, size: 2, color: 'rgba(127,184,255,0.6)', type: 'spark', grav: 0, add: true });
        },
        end(f) { f.vy = Math.max(f.vy, 200); } });
    } },
  orbVolley: { id: 'orbVolley', cd: 3.4, range: [150, 900], chance: 0.6,
    run(f, w, ai) {
      const big = ai.phaseData && ai.phaseData.name === 'Elemental Orbs';
      f.startAbility({ dur: 0.95, pose: POSES.cast, rate: 18,
        start(f) { f.telegraph = 0.3; },
        update(f, w, t) {
          const n = ((t - 0.3) / 0.18) | 0;
          if (t > 0.3 && n !== this.n && n < 3) { this.n = n; const pr = WeaponSystem.spawn(w, big && n === 1 ? 'bigorb' : 'orb', f, { target: w.player }); pr.vy = (n - 1) * 160; }
        } });
    } },
  counterStance: { id: 'counterStance', cd: 4.5, range: [60, 260], chance: 0.55,
    run(f, w) {
      f.startAbility({ dur: 1.3, rate: 16, pose: P({ lean: -4, fs: 70, fe: 30, wa: 180, bs: 20, be: 90 }, STANCES.staff),
        start(f) { f.counterStance = true; f.telegraph = 0.3; },
        update(f, w, t) {
          if (((t * 20) | 0) % 3 === 0) w.fx.part({ x: f.sk.wt.x, y: f.sk.wt.y, vx: 0, vy: -40, life: 0.4, size: 3, color: 'rgba(127,208,200,0.8)', type: 'dot', grav: 0, add: true });
        },
        end(f) { f.counterStance = false; } });
    } },
  barrier: { id: 'barrier', cd: 12, range: [0, 900], chance: 0.6, cond: f => !(f.barrier > 0),
    run(f, w) {
      f.startAbility({ dur: 0.6, pose: POSES.castUp, rate: 14,
        update(f, w, t) { if (t > 0.3 && !this.done) { this.done = 1; f.barrier = 4.5; AudioManager.play('orb', { pitch: 0.6 }); w.fx.ring(f.x, f.y - 100, 160, '#7fd0c8', 0.5, 5); } } });
    } },
  timeAura: { id: 'timeAura', cd: 11, range: [0, 900], chance: 0.7, cond: f => !(f.aura > 0),
    run(f, w) {
      f.startAbility({ dur: 0.8, pose: POSES.castUp, rate: 12, uninterruptible: true,
        start(f) { w.fx.banner('Stilled Time', 'His aura slows you', '#7fd0c8'); },
        update(f, w, t) { if (t > 0.4 && !this.done) { this.done = 1; f.aura = 6; AudioManager.play('teleport'); } } });
    } },
  groundSlam: { id: 'groundSlam', cd: 5.5, range: [0, 520], chance: 0.55,
    run(f, w) {
      f.telegraph = 0.6;
      f.startAbility({ dur: 1.9, rate: 16, uninterruptible: false,
        pose: (f, t) => (t < 0.6 ? POSES.castUp : P({ lean: 40, fs: 40, fe: 0, bs: 30, be: 0, fh: 50, fk: -80, bh: -40, bk: -50, wa: 0, wb: 0 })),
        start(f) { f.superArmor = true; w.fx.popText(f, '!', C.emberBright); },
        update(f, w, t) {
          if (t < 0.6) { if (((t * 30) | 0) % 2 === 0) w.fx.embers(f.sk.fha.x, f.sk.fha.y, 1); return; }
          if (!this.done) {
            this.done = 1; f.superArmor = false;
            WeaponSystem.spawn(w, 'bigshock', f, { dir: 1, x: f.x + 50, dmgMul: 0.75 }); WeaponSystem.spawn(w, 'bigshock', f, { dir: -1, x: f.x - 50, dmgMul: 0.75 });
            Combat.area(w, f, fbox(f, -90, -120, 260, 120), { dmg: 18 * f.dmgMul, kb: 300, up: -500, hs: 0.6, kd: 1, imp: 3, hsnd: 'heavy', unb: 1, stamp: 'SLAM', groundOnly: 1 });
            w.fx.shake(0.75); w.fx.dust(f.x, 0, 26); AudioManager.play('slam');
          }
          if (t > 0.75 && !this.tell) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        } });
    } },
  hook: { id: 'hook', cd: 4.5, range: [220, 620], chance: 0.65,
    run(f, w, ai) {
      f.startAbility({ dur: 0.7, pose: (f, t) => (t < 0.28 ? MOVES.h2.w : MOVES.h2.s), rate: 24,
        start(f) { f.telegraph = 0.28; },
        update(f, w, t) { if (t > 0.28 && !this.done) { this.done = 1; WeaponSystem.spawn(w, 'hook', f, { y: f.sk.fha.y }); } },
        end() { ai.startSeq(['weapon', 'weapon', 'weapon'], 0.2); } });
    } },
  charge: { id: 'charge', cd: 6.5, range: [200, 1200], chance: 0.6,
    run(f, w, ai) {
      f.telegraph = 0.6;
      f.startAbility({ dur: 3.2, rate: 18, trail: false,
        pose: (f, t) => (this_charge_pose(f, t)),
        start(f) { f.superArmor = true; w.fx.stamp('CHARGE', f.x, f.y - f.height(), 2); AudioManager.play('boss'); f.facing = w.player.x > f.x ? 1 : -1; this.dir = f.facing; },
        update(f, w, t, dt) {
          if (t < 0.6) { f.vx = damp(f.vx, -this.dir * 40, 6, dt); w.fx.embers(f.x, f.y - 60, 1); return; }
          if (this.stopped) { f.vx = damp(f.vx, 0, 6, dt); if (t > this.stopT) return false; return; }
          f.vx = this.dir * 1050; f.facing = this.dir;
          if (((t * 60) | 0) % 3 === 0) { w.fx.dust(f.x - this.dir * 30, 0, 2); w.fx.afterimage(f, 'rgba(210,74,60,0.25)'); }
          if (!this.hit) {
            this.hit = Combat.area(w, f, fbox(f, 0, -230, 120, 230), { dmg: 22 * f.dmgMul, kb: 1250, up: -380, hs: 0.7, kd: 1, imp: 3, hsnd: 'heavy', stamp: 'CRUSH', unb: ai.phaseData && ai.phaseData.unblockable ? 1 : 0, gb: 120 });
            if (this.hit) { this.stopped = true; this.stopT = t + 0.6; f.superArmor = false; }
          }
          const atWall = (this.dir > 0 && f.x >= w.bounds.r - 2) || (this.dir < 0 && f.x <= w.bounds.l + 2);
          if (atWall) {
            this.stopped = true; f.superArmor = false;
            w.fx.shake(0.8); w.fx.stamp('STAGGERED', f.x, f.y - f.height(), 3, C.gold); AudioManager.play('slam'); w.fx.dust(f.x, 0, 20);
            f.vx = -this.dir * 300; f.abil = null; f.setState('stun'); f.stunT = 1.7; return false;
          }
        },
        end(f) { f.superArmor = false; } });
    } },
  /* ---- Raikon, the Lightning Ascendant (Act I boss). Every wind-up is scaled by the difficulty mode (ai.p.windup:
     longer on Easy, shorter on Hard / Impossible), holds a readable pose, flashes the eyes white, heats the red groove
     of Raikō no Tachi and crackles with red lightning, with a red glint just before release. ---- */
  // Wind-up, then a wide flat arc that sends a lightning wave racing along the ground (WeaponSystem 'thunderwave':
  // jump it or dash through it). In phase 3 (`secondWave` on the phase) the blade crackles again and a second wave
  // follows after a delay, punishing a dodge made too early.
  // `o` (optional) is a reduced variant's parameters (RAIKON_VARIANTS in 10-data.js): label, windup, dmg, reach,
  // dash, and wave: false for the cut alone (no ground wave and no second wave); a Core echo's (CORE_ECHO_MOVES) adds
  // `tint` (violet for every red: lightning, glint, the wave) and `glitch` (corrupted frames).
  thunderSwing: { id: 'thunderSwing', cd: 5.2, range: [140, 460], chance: 0.75,
    run(f, w, ai, p, o) {
      o = o || {};
      const wave = o.wave !== false, tell = ai.p.windup, W = (o.windup || 0.66) * tell;
      const delay = wave && ai.phaseData && ai.phaseData.secondWave ? ai.phaseData.secondWave * Math.max(1, tell) : 0;
      const T2 = W + delay, rel = { dmg: o.dmg || 1, reach: o.reach || 210, wave, tint: o.tint };
      f.telegraph = W;
      f.startAbility({ dur: (delay ? T2 : W) + 0.6, rate: 22, trail: true, charge: true,
        pose: (f, t) => (t < W || (delay && t > W + 0.2 && t < T2) ? RAIKON_POSE.swingBack : RAIKON_POSE.swingThrough),
        start(f) { f.superArmor = true; f.facing = w.player.x > f.x ? 1 : -1; AudioManager.play('teleport'); w.fx.popText(f, o.label || 'THUNDER SWING', o.tint || '#ff6a52'); corruptFrames(f, o); },
        update(f, w, t, dt) {
          // a reduced cut can dash forward through its release (o.dash), then skids to a stop
          f.vx = o.dash && t >= W && t < W + 0.16 ? f.facing * o.dash : damp(f.vx, 0, 10, dt);
          if (o.dash && t >= W && t < W + 0.16 && ((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, o.tint ? 'rgba(167,123,255,0.3)' : 'rgba(255,74,60,0.3)');
          if (t < W) { this.charge = true; raikonCrackle(f, w, t, o.tint); if (!this.glint && t > W - 0.2) { this.glint = 1; raikonGlint(f, w, o.tint); } return; }
          if (!this.swung) {
            this.swung = 1; this.charge = false; f.superArmor = false;
            if (!o.dash) raikonRelease(f, w, rel);
            if (delay) { f.telegraph = delay; w.fx.popText(f, 'WAIT FOR IT', '#ff6a52'); }
          }
          // the dashing cut lands mid-dash, once
          if (o.dash && !this.cut && t > W + 0.06) { this.cut = 1; raikonRelease(f, w, rel); }
          if (delay && t < T2) {
            if (t > W + 0.2) { this.charge = true; raikonCrackle(f, w, t, o.tint); if (!this.glint2 && t > T2 - 0.2) { this.glint2 = 1; raikonGlint(f, w, o.tint); } }
            return;
          }
          if (delay && !this.swung2) { this.swung2 = 1; this.charge = false; raikonRelease(f, w, rel); }
          if (!this.tell && t > (delay ? T2 : W) + 0.25) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        },
        end(f) { f.superArmor = false; } });
    } },
  // Wind-up overhead (super armour, crackle, glint), then the blade driven into the ground: a crushing hit up close
  // and a short ground shockwave forward.
  // `o` (optional): a reduced variant's label, windup, dmg, reach, shock (shockwave damage, 0 = none) and shockLife;
  // a Core echo's `tint` and `glitch`.
  stormBreak: { id: 'stormBreak', cd: 4.4, range: [0, 340], chance: 0.65,
    run(f, w, ai, p, o) {
      o = o || {};
      const W = (o.windup || 0.58) * ai.p.windup, shock = o.shock != null ? o.shock : 0.9;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.75, rate: 20, trail: true, charge: true,
        pose: (f, t) => (t < W ? RAIKON_POSE.overhead : RAIKON_POSE.slam),
        start(f) { f.superArmor = true; f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label || 'STORM BREAK', o.tint || '#ff6a52'); corruptFrames(f, o); AudioManager.play('teleport'); },
        update(f, w, t, dt) {
          if (t < W) { this.charge = true; f.vx = damp(f.vx, f.facing * 90, 6, dt); raikonCrackle(f, w, t, o.tint); if (!this.glint && t > W - 0.18) { this.glint = 1; raikonGlint(f, w, o.tint); } return; }
          f.vx = damp(f.vx, 0, 14, dt);
          if (!this.done) {
            this.done = 1; this.charge = false; f.superArmor = false;
            const gx = f.x + f.facing * 120 * f.scale;
            Combat.area(w, f, fbox(f, 0, -230, o.reach || 200, 230), { dmg: 19 * (o.dmg || 1) * f.dmgMul, kb: 380, up: -460, hs: 0.6, kd: 1, imp: 3, hsnd: 'heavy', stamp: 'BREAK', gb: 110 });
            if (shock > 0) WeaponSystem.spawn(w, 'shock', f, { x: gx, lifeMul: o.shockLife || 0.6, dmgMul: shock });
            for (let i = 0; i < (o.dmg && o.dmg < 1 ? 2 : 3); i++) w.fx.lightning(gx, 0, gx + rand(-90, 90), -rand(60, 150), { w: 2.2, branches: 2, dur: 0.14, color: o.tint });
            w.fx.groundShards(gx, 7, 1.1); w.fx.dust(gx, 0, 18); w.fx.shake(0.7); AudioManager.play('slam');
            StormDirector.groundStrike(w, gx, o.dmg && o.dmg < 1 ? 0.9 : 1.35, o.tint);   // the sky strikes where the blade does
          }
          if (!this.tell && t > W + 0.3) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        },
        end(f) { f.superArmor = false; } });
    } },
  // A brief guard stance (red ring, crackle). A melee blow from the front during it is turned aside (the counter stance
  // in Combat.applyHit) and answered with a fast diagonal punish; left alone, he drops the guard.
  // `o` (optional): a reduced variant's label, stance (how long the guard is held), punish (its delay), dmg and unb.
  redlineCounter: { id: 'redlineCounter', cd: 6, range: [60, 300], chance: 0.55,
    run(f, w, ai, p, o) {
      o = o || {};
      const P2 = (o.punish || 0.1) * ai.p.windup, dmg = o.dmg || 1, unb = o.unb != null ? o.unb : 1;
      f.startAbility({ dur: o.stance || 1.0, rate: 18, charge: true,
        pose: f => (f.abil && f.abil.cut ? RAIKON_POSE.diagonal : RAIKON_POSE.guard),
        start(f) { f.counterStance = true; f.redline = true; f.telegraph = 0.3; f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label || 'REDLINE', '#ff6a52'); AudioManager.play('block'); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (this.punish == null) { raikonCrackle(f, w, t); return; }
          const k = t - this.punish;
          if (k < P2) return;
          if (!this.cut) {
            this.cut = 1; f.vx = f.facing * 1100; AudioManager.play('heavyswing');
            w.fx.lightning(f.sk.wt.x, f.sk.wt.y - 60, f.sk.wt.x + f.facing * 160, f.sk.wt.y + 120, { w: 2.4, branches: 3, dur: 0.14 });
          }
          if (((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, 'rgba(255,74,60,0.35)');
          if (!this.hit && k < P2 + 0.2) this.hit = Combat.area(w, f, fbox(f, -10, -230, 190, 230), { dmg: 17 * dmg * f.dmgMul, kb: 520, up: -380, hs: 0.55, kd: 1, imp: 3, hsnd: 'slash', stamp: 'REDLINE', unb });
          if (k > P2 + 0.2) f.vx = damp(f.vx, 0, 14, dt);
        },
        // Combat.applyHit calls this when a blow lands on the guard: switch to the punish
        onCounter(f) { f.counterStance = false; this.charge = false; this.punish = this.t; this.dur = this.t + P2 + 0.55; f.telegraph = P2; if (f._redlineFx) { f._redlineFx.stop = true; f._redlineFx = null; } },
        end(f) { f.counterStance = false; f.redline = false; } });
    } },
  // Skyfall: his answer to a foe who keeps their distance (only from far: RAIKON_SKYFALL.range). He raises his hand; a
  // lightning mark opens on the floor under his foe and follows them while a storm cloud gathers above it (charge s,
  // x the mode's windup); then the mark locks, and after RAIKON_SKYFALL.fall seconds a bolt falls from the cloud onto it.
  // Step off the locked mark to dodge it. A foe it catches is electrified and knocked down. Effect: 38-skyfall.js.
  skyfall: { id: 'skyfall', cd: RAIKON_SKYFALL.cd, range: RAIKON_SKYFALL.range, chance: RAIKON_SKYFALL.chance,
    run(f, w, ai) {
      const m = RAIKON_SKYFALL, W = m.charge * ai.p.windup, F = m.fall;
      f.telegraph = W;
      f.startAbility({ dur: W + F + 0.6, rate: 18, charge: true,
        pose: (f, t) => (t < W + F - 0.08 ? RAIKON_POSE.callSky : RAIKON_POSE.callDown),
        start(f) {
          f.superArmor = true; f.facing = w.player.x > f.x ? 1 : -1;
          w.fx.popText(f, 'SKYFALL', m.color); AudioManager.play('teleport', { pitch: 0.7 });
          this.fx = w.fx.skyfallCast({ target: w.player, lockT: W, strikeT: W + F, color: m.color, scale: f.scale });
        },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          // sparks gathering on the raised hand
          if (t < W + F && ((t * 60) | 0) % 3 === 0) {
            const hnd = f.sk.bha;
            w.fx.lightning(hnd.x, hnd.y, hnd.x + rand(-26, 26), hnd.y - rand(10, 40), { w: 1.1, branches: 1, dur: 0.07, color: m.color });
          }
          if (t < W) { f.facing = w.player.x > f.x ? 1 : -1; return; }
          if (!this.hit && t >= W + F) {
            this.hit = 1; f.superArmor = false;
            const x = this.fx.x, half = m.width / 2, dir = Math.sign(w.player.x - x) || f.facing;
            const caught = Combat.area(w, f, { x: x - half, y: -480, w: m.width, h: 490 },
              { dmg: m.dmg * f.dmgMul, kb: 260, up: -460, hs: 0.6, kd: 1, imp: 3, hsnd: 'heavy', stamp: 'SKYFALL', gb: 120, dir });
            if (caught) this.fx.zap = m.zap;   // the foe crackles with it (38-skyfall.js)
          }
          if (!this.tell && t > W + F + 0.15) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        },
        end(f) { f.superArmor = false; } });
    } },
  /* ---- Takashi, the Master's Flow (Act III boss). Numbers come from TAKASHI_MOVES (10-data.js); `o` (optional)
     overrides them (Act III's sub-bosses can run lighter versions). Every tell is `windup x Logic.aiTuning(...).windup`
     seconds with white eyes (telegraph), a held, grounded pose, gold embers gathering on the plain blade and a gold glint
     just before release. Powerful but economical: one decisive cut per move, then a short opening. ---- */
  // Final Flow (phase 3 signature): the same sequence as Shinsen's rage art, run by the shared finalFlow() in
  // 30-combat.js. The gathering stance is the tell (TAKASHI_MOVES.finalFlow.windup, ~0.62 s on Normal, x the mode's
  // windup), with super armour while gathering; the cuts are blockable except the finisher, at the boss's `dmg`
  // multiplier on FINAL_FLOW's cuts (1.5: about 37 base damage for the whole sequence, the old placeholder 0.8 was 20).
  finalFlow: { id: 'finalFlow', cd: TAKASHI_MOVES.finalFlow.cd, range: TAKASHI_MOVES.finalFlow.range, chance: TAKASHI_MOVES.finalFlow.chance,
    run(f, w, ai, p, o) {
      const m = takashiOpt('finalFlow', o);
      const tune = { unb: m.unb, unbFinisher: m.unbFinisher, dmg: m.dmg, windup: m.windup * ai.p.windup, label: m.label };
      // a Core echo's broken Final Flow (CORE_ECHO_MOVES.hollowFlow): its own shorter cut list, the void element, violet
      if (m.cuts) tune.cuts = m.cuts;
      if (m.el) tune.el = m.el;
      f.facing = w.player.x > f.x ? 1 : -1;
      finalFlow(f, w, { tune, target: w.player, dmgMul: f.dmgMul, armor: true, tint: m.tint, glitch: m.glitch });
    } },
  // Earth Cleave: the blade dragged low behind him in a deep, grounded stance, gold dust lifting off the floor; then one
  // heavy low-to-high cut (Shinsen's rising form, sh2) that steps in, throws up ground shards and launches.
  earthCleave: { id: 'earthCleave', cd: TAKASHI_MOVES.earthCleave.cd, range: TAKASHI_MOVES.earthCleave.range, chance: TAKASHI_MOVES.earthCleave.chance,
    run(f, w, ai, p, o) {
      o = takashiOpt('earthCleave', o);
      const W = o.windup * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.72, rate: 22, trail: true, charge: true,
        pose: (f, t) => (t < W ? TAKASHI_POSE.cleaveLow : t < W + 0.24 ? MOVES.sh2.s : MOVES.sh2.f),
        start(f) { f.superArmor = true; f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, o.tint || TAKASHI_GOLD); corruptFrames(f, o); AudioManager.play('teleport', { pitch: 0.7 }); },
        update(f, w, t, dt) {
          if (t < W) {
            f.vx = damp(f.vx, 0, 10, dt); takashiGather(f, w, t, true, o.tint);
            if (!this.glint && t > W - 0.18) { this.glint = 1; takashiGlint(f, w, o.tint); }
            return;
          }
          if (!this.cut) {
            this.cut = 1; f.superArmor = false; f.vx = f.facing * o.dash; AudioManager.play('heavyswing', { pitch: 0.85 });
            const gx = f.x + f.facing * 70 * f.scale;
            w.fx.groundShards(gx, 6, 1); w.fx.dust(gx, 0, 12); w.fx.shake(0.35);
          }
          f.vx = damp(f.vx, 0, 9, dt);
          if (!this.hit && t < W + 0.2) this.hit = Combat.area(w, f, fbox(f, -10, -240, o.reach, 240), { dmg: o.dmg * f.dmgMul, kb: 300, up: -560, hs: 0.55, imp: 3, hsnd: 'slash', stamp: 'CLEAVE', gb: 90 });
          if (!this.tell && t > W + 0.4) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        },
        end(f) { f.superArmor = false; } });
    } },
  // Ground Smash: both hands high, the blade back over his shoulders, a slow step in; then a downward impact into the
  // floor: a crushing hit up close, a gold ring and a SHORT shockwave forward (jump it or dash through it).
  groundSmash: { id: 'groundSmash', cd: TAKASHI_MOVES.groundSmash.cd, range: TAKASHI_MOVES.groundSmash.range, chance: TAKASHI_MOVES.groundSmash.chance,
    run(f, w, ai, p, o) {
      o = takashiOpt('groundSmash', o);
      const W = o.windup * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.75, rate: 20, trail: true, charge: true,
        pose: (f, t) => (t < W ? RAIKON_POSE.overhead : RAIKON_POSE.slam),
        start(f) { f.superArmor = true; f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, o.tint || TAKASHI_GOLD); corruptFrames(f, o); AudioManager.play('teleport', { pitch: 0.6 }); },
        update(f, w, t, dt) {
          if (t < W) {
            f.vx = damp(f.vx, f.facing * 70, 6, dt); takashiGather(f, w, t, false, o.tint);
            if (!this.glint && t > W - 0.18) { this.glint = 1; takashiGlint(f, w, o.tint); }
            return;
          }
          f.vx = damp(f.vx, 0, 14, dt);
          if (!this.done) {
            this.done = 1; f.superArmor = false;
            const gx = f.x + f.facing * 120 * f.scale;
            Combat.area(w, f, fbox(f, 0, -230, o.reach, 230), { dmg: o.dmg * f.dmgMul, kb: 380, up: -460, hs: 0.6, kd: 1, imp: 3, hsnd: 'heavy', stamp: 'SMASH', gb: 110 });
            if (o.shock > 0) WeaponSystem.spawn(w, 'shock', f, { x: gx, lifeMul: o.shockLife, dmgMul: o.shock });
            w.fx.ring(gx, -6, 150, o.tint ? 'rgba(167,123,255,0.85)' : 'rgba(232,186,84,0.85)', 0.4, 5);
            w.fx.groundShards(gx, 7, 1.1); w.fx.dust(gx, 0, 18); w.fx.embers(gx, -10, 10, o.tint || TAKASHI_GOLD); w.fx.shake(0.7); AudioManager.play('slam');
          }
          if (!this.tell && t > W + 0.3) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        },
        end(f) { f.superArmor = false; } });
    } },
  // Guard Return: a quiet low guard, the blade held across his body. A melee blow from the front is turned aside (the
  // counter stance in Combat.applyHit) and answered, after a short gold glint (`windup`), with a rising cut (Shinsen's
  // counter form, shc) that launches. He reads PREDICTABLE strikes: the AI raises it the instant Kage repeats an attack
  // (AIController.readStrike, Logic.readsPattern over FightSession.history), and only picks it on its own while Kage's
  // last move is already a pattern (`cond`). Varied attacks are never read.
  guardReturn: { id: 'guardReturn', cd: TAKASHI_MOVES.guardReturn.cd, range: TAKASHI_MOVES.guardReturn.range, chance: TAKASHI_MOVES.guardReturn.chance,
    cond: (f, w) => { const h = w.history || []; return h.length > 0 && Logic.readsPattern(h, h[h.length - 1]); },
    run(f, w, ai, p, o) {
      o = takashiOpt('guardReturn', o);
      const P2 = o.windup * ai.p.windup;
      f.startAbility({ dur: o.stance, rate: 20, charge: true,
        pose: f => (f.abil && f.abil.cut ? MOVES.shc.s : TAKASHI_POSE.guard),
        start(f) { f.counterStance = true; f.goldGuard = !o.tint; f.guardTint = o.tint || null; f.telegraph = 0.25; f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, o.tint || TAKASHI_GOLD); corruptFrames(f, o); AudioManager.play('block'); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (this.punish == null) { if (((t * 60) | 0) % 6 === 0) w.fx.embers(f.sk.wt.x, f.sk.wt.y, 1, o.tint || TAKASHI_GOLD); return; }
          const k = t - this.punish;
          if (k < P2) return;
          if (!this.cut) { this.cut = 1; f.vx = f.facing * 900; AudioManager.play('heavyswing', { pitch: 0.9 }); }
          if (((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, o.tint ? 'rgba(167,123,255,0.35)' : 'rgba(232,186,84,0.35)');
          if (!this.hit && k < P2 + 0.2) this.hit = Combat.area(w, f, fbox(f, -10, -240, 190, 240), { dmg: o.dmg * f.dmgMul, kb: 420, up: -620, hs: 0.6, kd: 1, imp: 3, hsnd: 'slash', stamp: 'RETURN', unb: o.unb });
          if (k > P2 + 0.2) f.vx = damp(f.vx, 0, 14, dt);
        },
        // Combat.applyHit calls this when a blow lands on the guard: the gold glint, then the rising cut
        onCounter(f, w) { f.counterStance = false; this.charge = false; this.punish = this.t; this.dur = this.t + P2 + 0.6; f.telegraph = P2; takashiGlint(f, w, o.tint); },
        end(f) { f.counterStance = false; f.goldGuard = false; f.guardTint = null; } });
    } },
  /* ---- Akari, the Memory Blade (Act II boss). Numbers come from AKARI_MOVES (10-data.js); `o` (optional) overrides
     them, for Act II's sub-bosses later. Every tell is `windup x Logic.aiTuning(...).windup` seconds long, with white
     eyes (telegraph), a held pose and a violet glint on the blade that will cut. ---- */
  // Twin Fang: blades drawn low behind her, a glint on each (Yūrei, then Kagehira), then two quick alternating cuts:
  // Kagehira's light opener, then Yūrei's heavier punisher.
  twinFang: { id: 'twinFang', cd: AKARI_MOVES.twinFang.cd, range: AKARI_MOVES.twinFang.range, chance: AKARI_MOVES.twinFang.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('twinFang', o);
      const W = o.windup * ai.p.windup, G = 0.17;
      f.telegraph = W;
      f.startAbility({ dur: W + G * 2 + 0.45, rate: 30, trail: true,
        pose: (f, t) => (t < W ? AKARI_POSE.fangBack : t < W + G ? MOVES.tw1.s : MOVES.tw2.s),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, o.tint || AKARI_VIOLET); corruptFrames(f, o); AudioManager.play('teleport', { pitch: 1.4 }); },
        update(f, w, t, dt) {
          if (t < W) {
            f.vx = damp(f.vx, 0, 10, dt);
            if (!this.g1 && t > W * 0.3) { this.g1 = 1; akariGlint(f, w, 'w2t'); }
            if (!this.g2 && t > W - 0.15) { this.g2 = 1; akariGlint(f, w, 'wt'); }
            return;
          }
          if (t > W + G * 2) { f.vx = damp(f.vx, 0, 14, dt); if (!this.tell && t > W + G * 2 + 0.12) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); } return; }
          const i = t < W + G ? 0 : 1;
          if (i !== this.i) { this.i = i; this.hit = false; f.facing = w.player.x > f.x ? 1 : -1; f.vx = f.facing * o.dash; AudioManager.play('swing', { pitch: 1.15 + i * 0.12 });
            AkariSakura.play(w, f, 'sakura_slash', f.x + f.facing * 95 * f.scale, AkariSakura.chest(f), { rot: i ? -0.5 : 0.1, rate: 1.2, scale: f.scale * (i ? 1.08 : 1) }); }
          f.vx = damp(f.vx, 0, 9, dt);
          if (!this.hit) this.hit = Combat.area(w, f, fbox(f, 0, -200, 130, 140), { dmg: o.dmg[i] * f.dmgMul, kb: i ? 380 : 90, up: i ? -240 : -40, hs: i ? 0.4 : 0.22, imp: i ? 2 : 1, hsnd: 'slash', stamp: i ? 'FANG' : null });
        } });
    } },
  // Smoke Step: she sinks low with smoke curling at her feet, vanishes into a COMPACT puff (Effects.smokePuff), steps out
  // of a second puff a short way off (behind Kage or just in front of him), glints, and cuts once.
  smokeStep: { id: 'smokeStep', cd: AKARI_MOVES.smokeStep.cd, range: AKARI_MOVES.smokeStep.range, chance: AKARI_MOVES.smokeStep.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('smokeStep', o);
      const W = o.windup * ai.p.windup, H = 0.2, R = Math.max(0.18, 0.26 * ai.p.windup), pl = w.player, behind = chance(0.55);
      f.telegraph = W;
      f.startAbility({ dur: W + H + R + 0.6, rate: 26, trail: true,
        pose: (f, t) => (t < W ? AKARI_POSE.smokeCrouch : t < W + H + R ? AKARI_POSE.fangBack : MOVES.tw2.s),
        start(f) { f.facing = pl.x > f.x ? 1 : -1; w.fx.popText(f, o.label, o.tint || AKARI_VIOLET); corruptFrames(f, o); AudioManager.play('teleport', { pitch: 1.2 }); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (t < W) { if (((t * 60) | 0) % 4 === 0 && !AkariSakura.live(f, 'sakura_veil')) w.fx.part({ x: f.x + rand(-26, 26), y: -rand(2, 14), vx: rand(-40, 40), vy: rand(-50, -20), life: 0.32, size: rand(5, 9), color: 'rgba(74,61,94,0.7)', type: 'puff', grav: -20, drag: 2, grow: 10 }); return; }
          if (!this.gone) { this.gone = 1; AkariSakura.play(w, f, 'sakura_veil', f.x, AkariSakura.body(f)) || w.fx.smokePuff(f.x, 0, o.smoke); AudioManager.play('smoke'); f.visible = false; f.invuln = H + 0.1; }
          if (t < W + H) return;
          if (!this.out) {
            this.out = 1;
            const side = behind ? -pl.facing : (Math.sign(f.x - pl.x) || 1);
            f.x = akariSpot(w, pl.x, side, o.dist); f.facing = pl.x > f.x ? 1 : -1;
            f.visible = true; f.alpha = 1; AkariSakura.play(w, f, 'sakura_veil', f.x, AkariSakura.body(f), { scale: f.scale * 0.8 }) || w.fx.smokePuff(f.x, 0, o.smoke); f.telegraph = R; akariGlint(f, w, 'w2t');
          }
          if (t < W + H + R) return;
          if (!this.cut) { this.cut = 1; f.vx = f.facing * 520; AudioManager.play('swing', { pitch: 1.2 }); AkariSakura.play(w, f, 'sakura_slash', f.x + f.facing * 100 * f.scale, AkariSakura.chest(f), { rate: 1.2 }); }
          if (!this.hit && t < W + H + R + 0.16) this.hit = Combat.area(w, f, fbox(f, 0, -200, 130, 140), { dmg: o.dmg * f.dmgMul, kb: 320, up: -200, hs: 0.4, imp: 2, hsnd: 'slash' });
          if (!this.tell && t > W + H + R + 0.3) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        },
        end(f) { f.visible = true; f.alpha = 1; } });
    } },
  // Blink, her short-range teleport: a violet marker flares on the floor where she will land (Effects.groundMark) while
  // she gathers; then she flickers there, leaving a violet afterimage, and strikes. Far off she lands in front of Kage,
  // close in she crosses through to his back. In phase 3 (chainBlink) she blinks twice.
  blink: { id: 'blink', cd: AKARI_MOVES.blink.cd, range: AKARI_MOVES.blink.range, chance: AKARI_MOVES.blink.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('blink', o);
      // chainBlink: how many blinks she chains (a phase flag: a number, or true for two)
      const cb = ai.phaseData && ai.phaseData.chainBlink, n = typeof cb === 'number' ? cb : cb ? 2 : 1;
      const W = o.windup * ai.p.windup, pl = w.player, step = 0.24, dests = [];
      let x = f.x;
      for (let i = 0; i < n; i++) {
        const dir = Math.sign(pl.x - x) || 1, gap = Math.abs(pl.x - x);
        const d = gap > 260 ? x + dir * Math.min(o.dist, gap - 110) : akariSpot(w, pl.x, dir, 120);
        dests.push(clamp(d, w.bounds.l + 30, w.bounds.r - 30)); x = dests[i];
      }
      f.telegraph = W;
      f.startAbility({ dur: W + n * step + 0.3, rate: 30,
        pose: () => AKARI_POSE.fangBack,
        start(f) { f.facing = pl.x > f.x ? 1 : -1; w.fx.popText(f, o.label, AKARI_VIOLET); AudioManager.play('teleport', { pitch: 1.7 }); dests.forEach((d, i) => w.fx.groundMark(d, W + i * step + 0.12, AkariSakura.mark(f))); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (t < W) { if (((t * 60) | 0) % 3 === 0) w.fx.part({ x: f.x + rand(-18, 18), y: -rand(0, 160) * f.scale, vx: 0, vy: -rand(40, 90), life: 0.3, size: rand(1.5, 2.5), color: AkariSakura.is(f) ? '#ffb8dc' : '#c9a8ff', type: 'spark', grav: 0, drag: 2, add: true }); return; }
          const i = Math.min(n - 1, ((t - W) / step) | 0);
          if (i !== this.i) {
            this.i = i;
            if (!AkariSakura.play(w, f, 'sakura_veil', f.x, AkariSakura.body(f), { scale: f.scale * 0.75 })) w.fx.afterimage(f, 'rgba(180,140,240,0.5)', { dur: 0.35 });
            f.x = dests[i]; f.facing = pl.x > f.x ? 1 : -1; f.invuln = 0.12;
            if (!AkariSakura.play(w, f, 'sakura_veil', f.x, AkariSakura.body(f), { scale: f.scale * 0.55, start: 0.05 })) w.fx.afterimage(f, 'rgba(236,229,211,0.3)'); AudioManager.play('dash', { pitch: 1.4 });
          }
          if (!this.done && t > W + n * step + 0.08) { this.done = 1; akariGlint(f, w, 'wt'); f.endAbility(w); f.startMove(f.weapon().moves[0], w); }
        } });
    } },
  // False Opening: she lowers both blades and offset violet silhouettes split off her; then she is gone, and an
  // afterimage stands in her place, guard down, at reduced opacity with one or two offset echoes (FightSession.spawnDecoy).
  // Strike it and it vanishes (Combat.applyHit -> strikeDecoy); either way the real Akari steps out behind Kage, glints
  // and punishes with a diagonal cut.
  falseOpening: { id: 'falseOpening', cd: AKARI_MOVES.falseOpening.cd, range: AKARI_MOVES.falseOpening.range, chance: AKARI_MOVES.falseOpening.chance,
    cond: (f, w) => !w.fighters.some(x => x.decoy && x.alive),
    run(f, w, ai, p, o) {
      o = akariOpt('falseOpening', o);
      const W = o.windup * ai.p.windup, R = Math.max(0.2, 0.32 * ai.p.windup), pl = w.player;
      f.telegraph = W;
      f.startAbility({ dur: W + o.hold + R + 1, rate: 22, trail: true,
        pose: (f) => (f.abil && f.abil.cut ? AKARI_POSE.punish : f.abil && f.abil.out ? AKARI_POSE.fangBack : AKARI_POSE.open),
        start(f) { f.facing = pl.x > f.x ? 1 : -1; w.fx.popText(f, o.label, o.tint || AKARI_VIOLET); corruptFrames(f, o); AudioManager.play('teleport', { pitch: 0.8 }); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (t < W) { if (((t * 60) | 0) % 6 === 0) w.fx.afterimage(f, AkariSakura.ghost(f, 0.4, 'rgba(180,140,240,0.4)'), { dur: 0.3, dx: (((t * 10) | 0) % 2 ? 1 : -1) * 18 }); return; }
          if (!this.split) { this.split = 1; this.decoy = w.spawnDecoy(f, o); AkariSakura.play(w, f, 'sakura_veil', f.x, AkariSakura.body(f), { scale: f.scale * 0.7 }); f.visible = false; f.invuln = o.hold + 1; AudioManager.play('smoke', { pitch: 1.5 }); }
          if (!this.out) {
            if (!this.struck && t < W + o.hold) return;
            this.out = 1; this.outT = t;
            if (this.decoy && this.decoy.alive) w.vanishDecoy(this.decoy);
            f.x = akariSpot(w, pl.x, -pl.facing, 120); f.facing = pl.x > f.x ? 1 : -1;
            f.visible = true; f.alpha = 1; f.invuln = 0; f.telegraph = R;
            AkariSakura.play(w, f, 'sakura_veil', f.x, AkariSakura.body(f), { scale: f.scale * 0.8 }) || w.fx.afterimage(f, 'rgba(180,140,240,0.5)', { dur: 0.3 }); akariGlint(f, w, 'w2t');
            this.dur = t + R + 0.8;
            return;
          }
          const k = t - this.outT;
          if (k < R) return;
          if (!this.cut) { this.cut = 1; f.vx = f.facing * 700; AudioManager.play('heavyswing', { pitch: 1.3 }); AkariSakura.play(w, f, 'sakura_slash', f.x + f.facing * 110 * f.scale, AkariSakura.chest(f), { rot: 0.35, scale: f.scale * 1.2 }); }
          if (!this.hit && k < R + 0.18) this.hit = Combat.area(w, f, fbox(f, -10, -210, 150, 190), { dmg: o.dmg * f.dmgMul, kb: 460, up: -320, hs: 0.5, kd: 1, imp: 3, hsnd: 'slash', stamp: 'PUNISH' });
          if (k > R + 0.2) f.vx = damp(f.vx, 0, 14, dt);
          if (!this.tell && k > R + 0.35) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        },
        // FightSession.strikeDecoy calls this when Kage cuts the afterimage
        onDecoy() { this.struck = true; },
        end(f) { f.visible = true; f.alpha = 1; if (this.decoy && this.decoy.alive) w.vanishDecoy(this.decoy); } });
    } },
  // Petal Cross (phase 3 signature): she crosses both blades before her face while violet petals gather to the crossing
  // and it glints; then she dashes through with two crossing cuts that leave a NARROW violet X (Effects.petalCross).
  petalCross: { id: 'petalCross', cd: AKARI_MOVES.petalCross.cd, range: AKARI_MOVES.petalCross.range, chance: AKARI_MOVES.petalCross.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('petalCross', o);
      const W = o.windup * ai.p.windup, D = 0.2;
      f.telegraph = W;
      f.startAbility({ dur: W + D + 0.75, rate: 24, trail: true,
        pose: (f, t) => (t < W ? AKARI_POSE.crossGuard : t < W + D * 0.5 ? MOVES.tw1.s : AKARI_POSE.crossThrough),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, AKARI_VIOLET); AudioManager.play('teleport', { pitch: 0.7 }); },
        update(f, w, t, dt) {
          const cx = (f.sk.wt.x + f.sk.w2t.x) / 2, cy = (f.sk.wt.y + f.sk.w2t.y) / 2;
          if (t < W) {
            f.vx = damp(f.vx, -f.facing * 40, 6, dt);
            if (((t * 60) | 0) % 3 === 0) { const g = rand(0, TAU), r = rand(70, 110); w.fx.part({ x: cx + Math.cos(g) * r, y: cy + Math.sin(g) * r, vx: -Math.cos(g) * r * 2.6, vy: -Math.sin(g) * r * 2.6, life: 0.36, size: rand(2.6, 4), color: chance(0.6) ? AkariSakura.col(f)[0] : AkariSakura.col(f)[1], type: 'ash', grav: 0, drag: 0.5, rot: rand(0, TAU), vr: rand(-8, 8) }); }
            if (!this.g && t > W - 0.18) { this.g = 1; w.fx.glint(cx, cy, AkariSakura.glint(f) || '#e6d6ff'); AudioManager.play('orb', { pitch: 1.9 }); }
            return;
          }
          if (t < W + D) {
            f.vx = f.facing * o.dash;
            if (((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, AkariSakura.ghost(f, 0.35, 'rgba(180,140,240,0.35)'));
            const i = t < W + D * 0.5 ? 0 : 1;
            if (i !== this.i) { this.i = i; this.hit = false; AudioManager.play(i ? 'heavyswing' : 'swing', { pitch: 1.25 }); }
            if (!this.hit) this.hit = Combat.area(w, f, fbox(f, -20, -220, o.reach, 200), { dmg: o.dmg * (i ? 0.6 : 0.4) * f.dmgMul, kb: i ? 620 : 80, up: i ? -420 : -40, hs: i ? 0.6 : 0.3, kd: i, imp: i ? 3 : 1, hsnd: 'slash', stamp: i ? 'PETAL' : null, gb: 90 });
            if (i === 1 && !this.x) { this.x = 1; AkariSakura.play(w, f, 'sakura_slash_beam', f.x + f.facing * 70 * f.scale, f.y - 120 * f.scale, { scale: f.scale * 1.25 }) || w.fx.petalCross(f.x + f.facing * 70 * f.scale, f.y - 120 * f.scale, f.facing, 170); w.fx.shake(0.4); }
            return;
          }
          f.vx = damp(f.vx, 0, 10, dt);
          if (!this.tell && t > W + D + 0.3) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        } });
    } },
  /* ---- Akari's new moves (her three-phase redesign). Numbers: AKARI_MOVES; her hazards: 62-akari-hazards.js. Every
     move keeps a readable tell (windup >= 0.3 s x the mode's windup), white eyes while it winds up, and an opening. ---- */
  // Poison Kunai (phase 1): her throwing hand drawn back with a green glint, then a fan of poisoned kunai; from phase 2
  // a second volley follows (the phase's volleys). Block or deflect them; a hit poisons.
  poisonKunai: { id: 'poisonKunai', cd: AKARI_MOVES.poisonKunai.cd, range: AKARI_MOVES.poisonKunai.range, chance: AKARI_MOVES.poisonKunai.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('poisonKunai', o);
      const W = o.windup * ai.p.windup, V = (ai.phaseData && ai.phaseData.volleys) || 1, gap = 0.3;
      f.telegraph = W;
      f.startAbility({ dur: W + gap * V + 0.35, rate: 26,
        pose: (f, t) => (t < W ? AKARI_POSE.throwBack : ((t - W) % gap) < gap * 0.55 ? AKARI_POSE.throwOut : AKARI_POSE.throwBack),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, akariCol(f)[0]); AudioManager.play('teleport', { pitch: 1.5 }); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (t < W) { if (!this.g && t > W - 0.14) { this.g = 1; w.fx.glint(f.sk.fha.x, f.sk.fha.y, '#b6f0a0'); AudioManager.play('orb', { pitch: 2 }); } return; }
          const v = Math.min(V - 1, ((t - W) / gap) | 0);
          if (v === this.v) return;
          this.v = v; f.facing = w.player.x > f.x ? 1 : -1;
          const pl = w.player;
          for (let i = 0; i < o.count; i++) akariKunai(f, w, o, pl.x, pl.y - 110 * pl.scale, 0, (i - (o.count - 1) / 2) * o.spread);
        } });
    } },
  // Shadow Flip (phase 1): pressed up close she sinks, then backflips away (a brief moment untouchable) and, at the top
  // of the flip, throws poisoned kunai down at him.
  shadowFlip: { id: 'shadowFlip', cd: AKARI_MOVES.shadowFlip.cd, range: AKARI_MOVES.shadowFlip.range, chance: AKARI_MOVES.shadowFlip.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('shadowFlip', o);
      const W = o.windup * ai.p.windup, F = 0.55;
      f.telegraph = W;
      f.startAbility({ dur: W + F + 0.3, rate: 30,
        pose: (f, t) => (t < W ? AKARI_POSE.smokeCrouch : t < W + F ? akariGather(AKARI_POSE.flip, (t - W) / F, 0) : AKARI_POSE.smokeCrouch),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, akariCol(f)[0]); },
        update(f, w, t, dt) {
          if (t < W) { f.vx = damp(f.vx, 0, 12, dt); return; }
          if (!this.up) { this.up = 1; f.grounded = false; f.vy = -820; f.vx = -f.facing * o.dist / F; f.invuln = 0.3; AudioManager.play('djump'); AkariSakura.play(w, f, 'sakura_veil', f.x, AkariSakura.body(f), { scale: f.scale * 0.8 }) || w.fx.afterimage(f, 'rgba(180,140,240,0.4)', { dur: 0.3 }); }
          if (!this.threw && t > W + 0.24) {
            this.threw = 1; const pl = w.player;
            for (let i = 0; i < o.count; i++) akariKunai(f, w, o, pl.x, pl.y - 60 * pl.scale, (i - (o.count - 1) / 2) * 0.16, 0);
          }
          if (f.grounded && t > W + 0.2) f.vx = damp(f.vx, 0, 14, dt);
        } });
    } },
  // Petal Storm (phase 2): she raises both blades and petals start gathering on the floor under Kage (and beside him,
  // the phase's stormCount), a ring closing on each spot; then each spot erupts in a swirling storm. In phase 3 the
  // storms leave poison mist behind (poisonZones).
  petalStorm: { id: 'petalStorm', cd: AKARI_MOVES.petalStorm.cd, range: AKARI_MOVES.petalStorm.range, chance: AKARI_MOVES.petalStorm.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('petalStorm', o);
      const W = o.windup * ai.p.windup, pd = ai.phaseData || {}, n = pd.stormCount || 1;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.5, rate: 18,
        pose: () => AKARI_POSE.crossGuard,
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, akariCol(f)[0]); AudioManager.play('teleport', { pitch: 0.8 }); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          akariSwirl(f, w, t, 90);
          if (t < W || this.cast) return;
          this.cast = 1; AudioManager.play('swing', { pitch: 0.6 });
          const pl = w.player;
          for (let i = 0; i < n; i++) {
            const x = clamp(pl.x + (i === 0 ? 0 : (i % 2 ? 1 : -1) * Math.ceil(i / 2) * o.spacing), w.bounds.l + o.radius * 0.6, w.bounds.r - o.radius * 0.6);
            w.spawnHazard({ kind: 'storm', owner: f, x, r: o.radius, delay: o.delay, dur: o.dur, tick: o.tick, dmg: o.dmg, petal: f.petal, zone: !!pd.poisonZones });
          }
        } });
    } },
  // Kunai Rain (phase 2): a crouch, a leap, and hanging at the top of it a fan of poisoned kunai rained down round him.
  kunaiFan: { id: 'kunaiFan', cd: AKARI_MOVES.kunaiFan.cd, range: AKARI_MOVES.kunaiFan.range, chance: AKARI_MOVES.kunaiFan.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('kunaiFan', o);
      const W = o.windup * ai.p.windup, UP = 0.32, HANG = 0.34;
      f.telegraph = W;
      f.startAbility({ dur: W + UP + HANG + 0.7, rate: 24,
        pose: (f, t) => (t < W ? AKARI_POSE.smokeCrouch : t < W + UP ? AKARI_POSE.flip : t < W + UP + HANG ? AKARI_POSE.throwOut : AKARI_POSE.flip),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, akariCol(f)[0]); },
        update(f, w, t, dt) {
          if (t < W) { f.vx = damp(f.vx, 0, 12, dt); return; }
          if (!this.up) { this.up = 1; f.grounded = false; f.vy = -1050; f.vx = 0; AudioManager.play('djump'); }
          if (t < W + UP) return;
          if (!this.hang) { this.hang = 1; this.float = true; f.vx = 0; f.vy = 0; f.facing = w.player.x > f.x ? 1 : -1; w.fx.glint(f.sk.fha.x, f.sk.fha.y, '#b6f0a0'); }
          if (!this.threw && t > W + UP + 0.12) {
            this.threw = 1; const pl = w.player;
            for (let i = 0; i < o.count; i++) akariKunai(f, w, o, pl.x, pl.y - 40 * pl.scale, (i - (o.count - 1) / 2) * (o.spread / Math.max(1, o.count - 1)), 0);
          }
          if (t > W + UP + HANG && this.float) { this.float = false; f.vy = 300; }
        },
        end(f) { f.vy = Math.max(f.vy, 200); } });
    } },
  // Falling Petal (phase 2): an aerial dive. A crouch, a leap high over him; at the top she hangs, and a petal mark opens
  // on the floor where he stands; then she dives onto it with a cut. Move off the mark.
  aerialDive: { id: 'aerialDive', cd: AKARI_MOVES.aerialDive.cd, range: AKARI_MOVES.aerialDive.range, chance: AKARI_MOVES.aerialDive.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('aerialDive', o);
      const W = o.windup * ai.p.windup, UP = 0.44, H = o.hang;
      f.telegraph = W;
      f.startAbility({ dur: W + UP + H + 0.9, rate: 24, trail: true,
        pose: (f, t) => (t < W ? AKARI_POSE.smokeCrouch : t < W + UP + H ? AKARI_POSE.crossGuard : AKARI_POSE.punish),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, akariCol(f)[0]); AudioManager.play('teleport', { pitch: 1.1 }); },
        update(f, w, t, dt) {
          if (t < W) { f.vx = damp(f.vx, 0, 12, dt); akariSwirl(f, w, t, 50); return; }
          const pl = w.player;
          if (!this.up) { this.up = 1; f.grounded = false; f.vy = -1250; f.vx = clamp((pl.x - f.x) * 0.8 / UP, -900, 900); AudioManager.play('djump'); }
          if (t < W + UP) return;
          if (!this.hang) { this.hang = 1; this.float = true; f.vx = 0; f.vy = 0; this.tx = pl.x; f.facing = pl.x > f.x ? 1 : -1; w.fx.groundMark(this.tx, H + 0.25, hexRgb(AkariSakura.col(f)[0])); akariGlint(f, w, 'wt'); }
          if (t < W + UP + H) return;
          if (!this.dove) { this.dove = 1; this.float = false; f.vx = (this.tx - f.x) / 0.2; f.vy = 1900; AudioManager.play('heavyswing', { pitch: 1.2 }); }
          if (((t * 60) | 0) % 2 === 0 && !f.grounded) w.fx.afterimage(f, AkariSakura.ghost(f, 0.3, 'rgba(200,60,90,0.3)'), { dur: 0.2 });
          if (f.grounded && !this.hit) {
            this.hit = 1; f.vx = 0;
            Combat.area(w, f, { x: f.x - o.reach, y: -220, w: o.reach * 2, h: 220 }, { dmg: o.dmg * f.dmgMul, kb: 420, up: -380, hs: 0.5, kd: 1, imp: 3, hsnd: 'slash', stamp: 'FALLING PETAL', dir: Math.sign(pl.x - f.x) || f.facing });
            const pillar = AkariSakura.play(w, f, 'sakura_pillar', f.x, 0);
            if (!pillar) akariBurst(f, w, f.x, -10, 26); w.fx.shake(0.45); if (!pillar) w.fx.dust(f.x, 0, 14); AudioManager.play('slam');
          }
          if (this.hit) { f.vx = damp(f.vx, 0, 14, dt); if (!this.tell && t > W + UP + H + 0.35) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); } }
        },
        end(f) { f.vy = Math.max(f.vy, 0); } });
    } },
  // Poison Trap (phase 2): a flick of the wrist and small caltrops scatter onto the floor round him; they glow green
  // once armed and burst into poison mist under the first foe to step on one.
  poisonTrap: { id: 'poisonTrap', cd: AKARI_MOVES.poisonTrap.cd, range: AKARI_MOVES.poisonTrap.range, chance: AKARI_MOVES.poisonTrap.chance,
    cond: (f, w) => !(w.hazards || []).some(h => h.kind === 'trap'),
    run(f, w, ai, p, o) {
      o = akariOpt('poisonTrap', o);
      const W = o.windup * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.45, rate: 24,
        pose: (f, t) => (t < W ? AKARI_POSE.throwBack : AKARI_POSE.throwOut),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, '#8be07a'); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (t < W || this.cast) return;
          this.cast = 1; AudioManager.play('throw');
          const pl = w.player;
          for (let i = 0; i < o.count; i++) {
            const x = clamp(pl.x + (i - (o.count - 1) / 2) * o.gap + rand(-20, 20), w.bounds.l + 20, w.bounds.r - 20);
            w.spawnHazard({ kind: 'trap', owner: f, x, r: o.radius, arm: o.arm, life: o.life, dmg: o.dmg, poison: o.poison, petal: f.petal });
            AkariSakura.ribbon(w, f, x) || w.fx.smokePuff(x, 0, { life: 0.3, radius: 20 });
          }
        } });
    } },
  // Phantom Dash (phase 3): a flicker, then near-instant dashes straight through him, each one's landing marked on the
  // floor a moment before, a trail of afterimages along the path. Jump, block or step off the line.
  phantomDash: { id: 'phantomDash', cd: AKARI_MOVES.phantomDash.cd, range: AKARI_MOVES.phantomDash.range, chance: AKARI_MOVES.phantomDash.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('phantomDash', o);
      const W = o.windup * ai.p.windup, G = o.gap, step = G + 0.06;
      f.telegraph = W;
      f.startAbility({ dur: W + o.count * step + 0.5, rate: 30, trail: true,
        pose: (f, t) => (t < W ? AKARI_POSE.fangBack : AKARI_POSE.crossThrough),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, akariCol(f)[1]); AudioManager.play('teleport', { pitch: 1.8 }); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 16, dt);
          if (t < W) { if (((t * 60) | 0) % 5 === 0) w.fx.afterimage(f, AkariSakura.ghost(f, 0.35, 'rgba(200,40,70,0.35)'), { dur: 0.2, dx: rand(-16, 16) }); return; }
          const i = ((t - W) / step) | 0, k = (t - W) - i * step;
          if (i >= o.count) { if (!this.tell && t > W + o.count * step + 0.15) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); } return; }
          const pl = w.player;
          // the mark: where this dash will end, decided now
          if (this.mi !== i) {
            this.mi = i; const dir = Math.sign(pl.x - f.x) || f.facing;
            this.endX = clamp(pl.x + dir * o.through, w.bounds.l + 30, w.bounds.r - 30);
            w.fx.groundMark(this.endX, G + 0.1, hexRgb(AkariSakura.col(f)[1])); AudioManager.play('orb', { pitch: 2.2 });
          }
          if (k < G || this.di === i) return;
          // the dash: afterimages along the path, then she is there, and the path cuts
          this.di = i;
          const x0 = f.x, x1 = this.endX;
          for (let n = 1; n <= 4; n++) w.fx.afterimage(f, AkariSakura.ghost(f, 0.4, 'rgba(200,40,70,0.4)'), { dur: 0.3, dx: (x1 - x0) * n / 5 });
          AkariSakura.play(w, f, 'sakura_veil', x0, AkariSakura.body(f), { scale: f.scale * 0.6 });
          f.x = x1; f.facing = pl.x > f.x ? 1 : -1;
          Combat.area(w, f, { x: Math.min(x0, x1) - 30, y: -210, w: Math.abs(x1 - x0) + 60, h: 210 }, { dmg: o.dmg * f.dmgMul, kb: 220, up: -160, hs: 0.25, imp: 2, hsnd: 'slash', dir: Math.sign(x1 - x0) || 1 });
          AudioManager.play('dash', { pitch: 1.5 }); AkariSakura.play(w, f, 'sakura_slash_beam', (x0 + x1) / 2, AkariSakura.chest(f), { rot: AkariSakura.beamRot(i * 2 + 1) }) || akariBurst(f, w, (x0 + x1) / 2, -120, 8);
        } });
    } },
  // Thousand Cuts (phase 3): up close, both blades drawn back with a glint on each, then a flurry of quick alternating
  // cuts walking forward and a heavy last cut that knocks him down. Blockable; back off or dash through.
  thousandCuts: { id: 'thousandCuts', cd: AKARI_MOVES.thousandCuts.cd, range: AKARI_MOVES.thousandCuts.range, chance: AKARI_MOVES.thousandCuts.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('thousandCuts', o);
      const W = o.windup * ai.p.windup, E = o.every, L = W + o.hits * E + 0.12;
      f.telegraph = W;
      f.startAbility({ dur: L + 0.6, rate: 36, trail: true,
        pose: (f, t) => (t < W ? AKARI_POSE.fangBack : t < L - 0.12 ? ((((t - W) / E) | 0) % 2 ? MOVES.tw2.s : MOVES.tw1.s) : AKARI_POSE.crossThrough),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, akariCol(f)[1]); AudioManager.play('teleport', { pitch: 1.6 }); },
        update(f, w, t, dt) {
          if (t < W) { f.vx = damp(f.vx, 0, 12, dt); if (!this.g1 && t > W * 0.4) { this.g1 = 1; akariGlint(f, w, 'w2t'); } if (!this.g2 && t > W - 0.14) { this.g2 = 1; akariGlint(f, w, 'wt'); } return; }
          if (t < L - 0.12) {
            const i = ((t - W) / E) | 0;
            f.vx = f.facing * 150;
            if (i !== this.i) {
              this.i = i; AudioManager.play('swing', { pitch: 1.3 + (i % 2) * 0.15 });
              Combat.area(w, f, fbox(f, 0, -200, 140, 170), { dmg: o.dmg * f.dmgMul, kb: 40, up: -30, hs: 0.05, imp: 0, hsnd: 'slash' });
              AkariSakura.play(w, f, 'sakura_slash_beam', f.sk.wt.x, f.sk.wt.y, { scale: f.scale * 0.6, rot: AkariSakura.beamRot(i), rate: 1.4 }) || akariBurst(f, w, f.sk.wt.x, f.sk.wt.y, 3);
            }
            return;
          }
          if (!this.last) {
            this.last = 1; f.vx = f.facing * 520; AudioManager.play('heavyswing', { pitch: 1.2 });
            Combat.area(w, f, fbox(f, -10, -220, 170, 200), { dmg: o.last * f.dmgMul, kb: 560, up: -380, hs: 0.5, kd: 1, imp: 3, hsnd: 'slash', stamp: 'THOUSAND CUTS' });
            if (AkariSakura.play(w, f, 'sakura_slash_beam', f.x + f.facing * 70 * f.scale, f.y - 120 * f.scale, { scale: f.scale * 1.1 })) AkariSakura.play(w, f, 'sakura_burst', f.x + f.facing * 70 * f.scale, f.y - 120 * f.scale, { scale: f.scale * 0.55 });
            else w.fx.petalCross(f.x + f.facing * 70 * f.scale, f.y - 120 * f.scale, f.facing, 150);
          }
          f.vx = damp(f.vx, 0, 12, dt);
          if (!this.tell && t > L + 0.25) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        } });
    } },
  // Petal Tornado (phase 3): she spins in place, petals rising round her; a tornado of petals spins up beside her and
  // travels toward him. Dash through it or keep ahead of it.
  petalTornado: { id: 'petalTornado', cd: AKARI_MOVES.petalTornado.cd, range: AKARI_MOVES.petalTornado.range, chance: AKARI_MOVES.petalTornado.chance,
    cond: (f, w) => !(w.hazards || []).some(h => h.kind === 'tornado'),
    run(f, w, ai, p, o) {
      o = akariOpt('petalTornado', o);
      const W = o.windup * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.45, rate: 24,
        pose: (f, t) => (t < W ? akariGather(AKARI_POSE.crossGuard, t / W, 2) : AKARI_POSE.crossThrough),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, akariCol(f)[1]); AudioManager.play('teleport', { pitch: 0.6 }); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          akariSwirl(f, w, t, 70);
          if (t < W || this.cast) return;
          this.cast = 1; AudioManager.play('heavyswing', { pitch: 0.7 }); w.fx.shake(0.3);
          const dir = Math.sign(w.player.x - f.x) || f.facing;
          w.spawnHazard({ kind: 'tornado', owner: f, x: f.x + dir * 90 * f.scale, dir, spin: 0.4, speed: o.speed, dur: o.dur, w: o.width, tick: o.tick, dmg: o.dmg, petal: f.petal });
        } });
    } },
  // Mirror of Petals (phase 3): petals whirl round her and she splits: she blinks away and copies of her step out of the
  // petals round him, with her eyes and her blades. One hit breaks a copy; only the real Akari sheds petals.
  mirrorClones: { id: 'mirrorClones', cd: AKARI_MOVES.mirrorClones.cd, range: AKARI_MOVES.mirrorClones.range, chance: AKARI_MOVES.mirrorClones.chance,
    cond: (f, w) => !w.fighters.some(x => x.clone && !x.decoy && x.alive),
    run(f, w, ai, p, o) {
      o = akariOpt('mirrorClones', o);
      const W = o.windup * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.35, rate: 20,
        pose: (f, t) => (t < W ? akariGather(AKARI_POSE.crossGuard, t / W, 1) : AKARI_POSE.fangBack),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, akariCol(f)[1]); AudioManager.play('teleport', { pitch: 0.9 }); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (t < W) { akariSwirl(f, w, t, 80); if (((t * 60) | 0) % 6 === 0) w.fx.afterimage(f, AkariSakura.ghost(f, 0.3, 'rgba(200,40,70,0.3)'), { dur: 0.25, dx: rand(-30, 30) }); return; }
          if (this.cast) return;
          this.cast = 1;
          const pl = w.player, spots = [akariSpot(w, pl.x, -pl.facing, 190), akariSpot(w, pl.x, pl.facing, 230), clamp(pl.x + rand(-320, 320), w.bounds.l + 40, w.bounds.r - 40)];
          if (!AkariSakura.play(w, f, 'sakura_burst', f.x, AkariSakura.body(f), { scale: f.scale * 0.45 })) { akariBurst(f, w, f.x, f.y - 100 * f.scale, 18);
            w.fx.afterimage(f, 'rgba(200,40,70,0.5)', { dur: 0.35 }); }
          f.x = spots[2]; f.facing = pl.x > f.x ? 1 : -1;
          for (let i = 0; i < o.count; i++) {
            const c = w.makeEnemy(f.def.id, spots[i], { clone: true }, 'clone');
            c.clone = true; c.alpha = 1; c.eye = f.eye; c.hp = c.maxHp = 1; c.life = o.life; c.dmgMul = f.dmgMul * 0.6;
            if (c.ai) { c.ai.phases = null; c.ai.abilities = []; }
            c.facing = pl.x > c.x ? 1 : -1;
            w.fighters.push(c); AkariSakura.play(w, f, 'sakura_veil', c.x, AkariSakura.body(c), { dir: c.facing, scale: c.scale * 0.85 }) || akariBurst(c, w, c.x, c.y - 100 * c.scale, 14);
          }
          AudioManager.play('smoke', { pitch: 1.3 });
        } });
    } },
  // Thousand Petal Requiem (phase 3, once, below AKARI_MOVES.demonRequiem.at of her health): her final ultimate. The
  // world darkens and the petals gather; then three blink cuts (each landing marked first), a leap and a rain of
  // poisoned kunai, and last a petal storm over the whole floor except one clear spot, marked pale. Untouchable while it
  // runs; a long opening after.
  demonRequiem: { id: 'demonRequiem', cd: AKARI_MOVES.demonRequiem.cd, range: AKARI_MOVES.demonRequiem.range, chance: AKARI_MOVES.demonRequiem.chance,
    cond: (f, w, ai) => !ai.requiem && f.hp / f.maxHp <= AKARI_MOVES.demonRequiem.at,
    run(f, w, ai, p, o) {
      o = akariOpt('demonRequiem', o); ai.requiem = 1;
      const W = o.windup * ai.p.windup, BL = 0.5, B0 = W, R0 = B0 + o.blinks * BL + 0.1, S0 = R0 + 1.05, E0 = S0 + o.delay + o.dur;
      f.telegraph = W;
      f.startAbility({ dur: E0 + 1.4, rate: 24, trail: true, uninterruptible: true,
        pose: (f, t) => (t < W ? akariGather(AKARI_POSE.crossGuard, t / W, 1.5) : t < R0 ? AKARI_POSE.punish : t < S0 ? AKARI_POSE.throwOut : t < E0 ? AKARI_POSE.crossGuard : AKARI_POSE.smokeCrouch),
        start(f) {
          f.facing = w.player.x > f.x ? 1 : -1; f.superArmor = true; f.invuln = E0;
          w.fx.banner('Thousand Petal Requiem', 'The Demon of Petals', '#ff2a40');
          w.fx.screenTint('rgba(40,0,10,', E0); w.fx.shake(0.4); AudioManager.play('boss');
          this.vortex = AkariSakura.vortex(w, f);
        },
        update(f, w, t, dt) {
          const pl = w.player;
          if (t < W) { f.vx = damp(f.vx, 0, 12, dt); akariSwirl(f, w, t, 120); return; }
          // the blink cuts: each landing marked a moment before it
          if (t < R0) {
            f.vx = damp(f.vx, 0, 14, dt);
            const i = Math.min(o.blinks - 1, ((t - B0) / BL) | 0), k = t - B0 - i * BL;
            if (this.mi !== i) { this.mi = i; this.to = akariSpot(w, pl.x, i % 2 ? pl.facing : -pl.facing, 120); w.fx.groundMark(this.to, 0.34, hexRgb(AkariSakura.col(f)[1])); }
            if (k > 0.3 && this.bi !== i) {
              this.bi = i;
              if (!AkariSakura.play(w, f, 'sakura_veil', f.x, AkariSakura.body(f), { scale: f.scale * 0.6 })) w.fx.afterimage(f, 'rgba(200,40,70,0.5)', { dur: 0.3 });
              f.x = this.to; f.facing = pl.x > f.x ? 1 : -1; f.vx = f.facing * 500; AudioManager.play('heavyswing', { pitch: 1.4 });
              AkariSakura.play(w, f, 'sakura_slash_beam', f.x + f.facing * 90 * f.scale, AkariSakura.chest(f), { scale: f.scale * 1.1, rot: AkariSakura.beamRot(i + 3) });
              Combat.area(w, f, fbox(f, -10, -210, 150, 190), { dmg: 8 * f.dmgMul, kb: 260, up: -200, hs: 0.3, imp: 2, hsnd: 'slash', stamp: 'REQUIEM' });
            }
            return;
          }
          // the rain: a leap, and hanging at the top a wide fan of poisoned kunai
          if (t < S0) {
            if (!this.up) { this.up = 1; f.grounded = false; f.vy = -1150; f.vx = 0; AudioManager.play('djump'); }
            if (!this.hang && t > R0 + 0.4) { this.hang = 1; this.float = true; f.vy = 0; f.facing = pl.x > f.x ? 1 : -1; }
            if (!this.rained && t > R0 + 0.5) { this.rained = 1; for (let i = 0; i < o.kunai; i++) akariKunai(f, w, { dmg: 4, poison: 1.4 }, pl.x, pl.y, (i - (o.kunai - 1) / 2) * 0.16, 0); }
            if (this.float && t > R0 + 0.75) { this.float = false; f.vy = 400; }
            return;
          }
          // the storm over the whole floor, one clear spot left (marked pale)
          if (!this.storm) {
            this.storm = 1; f.vx = 0;
            const safe = clamp(pl.x + rand(-260, 260), w.bounds.l + o.gap, w.bounds.r - o.gap), r = o.radius;
            w.fx.groundMark(safe, o.delay + o.dur, [236, 240, 255]);
            for (let x = w.bounds.l + r * 0.8; x <= w.bounds.r - r * 0.5; x += r * 1.8) {
              if (Math.abs(x - safe) < o.gap * 0.5 + r) continue;
              w.spawnHazard({ kind: 'storm', owner: f, x, r, delay: o.delay, dur: o.dur, tick: 0.25, dmg: o.dmg, petal: f.petal });
            }
            AudioManager.play('teleport', { pitch: 0.5 });
          }
          if (t < E0) { akariSwirl(f, w, t, 60); return; }
          // spent: the opening
          if (!this.open) { this.open = 1; f.invuln = 0; f.superArmor = false; w.fx.popText(f, 'OPENING', C.gold);
            if (this.vortex) { this.vortex.stop = true; AkariSakura.play(w, f, 'sakura_burst', f.x, AkariSakura.body(f), { scale: f.scale * 1.3 }); } }
        },
        end(f) { f.invuln = 0; f.superArmor = false; if (this.vortex) this.vortex.stop = true; } });
    } },
  /* ---- Akari's scythe (her boss sheet: Ready Stance, Wind-up Swing, Blade Launch, Chain Lunge, Wrap / Pull, Return &
     Spin, and the Petal Burst phase skill). The chain and the petals: 62b-akari-chain.js. ---- */
  // Reaping Arc (every phase, up close): the scythe drawn back over her shoulder, a glint, then one wide forward sweep
  // with a step in and a rising return cut. Blockable; back off out of its reach or dash through.
  reapingArc: { id: 'reapingArc', cd: AKARI_MOVES.reapingArc.cd, range: AKARI_MOVES.reapingArc.range, chance: AKARI_MOVES.reapingArc.chance,
    run(f, w, ai, p, o) {
      o = akariOpt('reapingArc', o);
      const W = o.windup * ai.p.windup, S1 = 0.2, S2 = 0.2;
      f.telegraph = W;
      f.startAbility({ dur: W + S1 + S2 + 0.5, rate: 26, trail: true,
        pose: (f, t) => (t < W ? AKARI_POSE.fangBack : t < W + S1 ? AKARI_POSE.crossThrough : AKARI_POSE.punish),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, o.tint || akariCol(f)[0]); corruptFrames(f, o); AudioManager.play('teleport', { pitch: 1.3 }); },
        update(f, w, t, dt) {
          if (t < W) { f.vx = damp(f.vx, -f.facing * 40, 10, dt); if (!this.g && t > W - 0.16) { this.g = 1; akariGlint(f, w, 'wt'); } return; }
          if (!this.s1) {
            this.s1 = 1; f.vx = f.facing * o.dash; AudioManager.play('heavyswing', { pitch: 1.1 });
            AkariSakura.play(w, f, 'sakura_slash', f.x + f.facing * 115 * f.scale, AkariSakura.chest(f), { rot: 0.55, scale: f.scale * 1.3 }) || akariBurst(f, w, f.x + f.facing * 120 * f.scale, f.y - 110 * f.scale, 8);
          }
          if (!this.h1 && t < W + 0.14) this.h1 = Combat.area(w, f, fbox(f, -20, -240, o.reach, 240), { dmg: o.dmg[0] * f.dmgMul, kb: 300, up: -200, hs: 0.3, imp: 2, hsnd: 'slash', stamp: 'REAP' });
          if (t > W + S1 && !this.s2) {
            this.s2 = 1; f.vx = f.facing * 160; AudioManager.play('swing', { pitch: 1.3 });
            AkariSakura.play(w, f, 'sakura_slash', f.x + f.facing * 95 * f.scale, AkariSakura.chest(f), { rot: -0.7, rate: 1.3, scale: f.scale * 1.05 });
          }
          if (this.s2 && !this.h2 && t < W + S1 + 0.14) this.h2 = Combat.area(w, f, fbox(f, -10, -270, o.reach * 0.8, 270), { dmg: o.dmg[1] * f.dmgMul, kb: 220, up: -560, hs: 0.35, imp: 2, hsnd: 'slash' });
          f.vx = damp(f.vx, 0, 7, dt);
          if (!this.tell && t > W + S1 + S2 + 0.1) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        } });
    } },
  // Chain Reap (every phase, from range): the wind-up swing, then the scythe's head flies off its staff on a chain at
  // his chest, cuts the first thing it meets and is reeled back spinning. Blockable; jump it or dash through it. She is
  // open while it comes home.
  chainReap: { id: 'chainReap', cd: AKARI_MOVES.chainReap.cd, range: AKARI_MOVES.chainReap.range, chance: AKARI_MOVES.chainReap.chance,
    cond: (f, w) => !f.akChainOut,
    run(f, w, ai, p, o) {
      o = akariOpt('chainReap', o);
      const W = o.windup * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + 2.6, rate: 24, trail: true,
        pose: (f, t) => (t < W ? AKARI_POSE.fangBack : AKARI_POSE.throwOut),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, o.tint || akariCol(f)[0]); corruptFrames(f, o); AudioManager.play('teleport', { pitch: 1.1 }); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (t < W) { if (!this.g && t > W - 0.16) { this.g = 1; akariGlint(f, w, 'wt'); } return; }
          const pl = w.player;
          if (!this.c) {
            this.c = AkariChain.launch(w, f, { speed: o.speed, reach: o.reach, back: o.back }, pl.x, pl.y - 110 * pl.scale);
            AudioManager.play('heavyswing', { pitch: 1.0 }); AudioManager.play('throw');
            AkariSakura.play(w, f, 'sakura_slash', f.x + f.facing * 80 * f.scale, AkariSakura.chest(f), { rot: 0.4, rate: 1.3 });
          }
          const c = this.c, ph = AkariChain.step(w, c, dt);
          if (ph === 'out' && Combat.area(w, f, AkariChain.box(c), { dmg: o.dmg * f.dmgMul, kb: 260, up: -180, hs: 0.3, imp: 2, hsnd: 'slash', proj: 1, dir: c.dir, stamp: 'CHAIN REAP' })) {
            AkariChain.recall(c); if (AkariGL.live()) AkariGL.burst(c.x, c.y, c.dir, f.scale);
          }
          if (!this.tell && ph === 'back') { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
          if (ph === 'done') { if (this.doneT == null) this.doneT = t; if (t > this.doneT + 0.2) return false; }
        },
        end(f) { AkariChain.end(w, f); } });
    } },
  // Binding Chain (phase 3): the chain whirled overhead with a red glint, then thrown at him. A chain wraps a guard, so it
  // cannot be blocked: jump it or dash through it. Caught, he is BOUND (Fighter state 'bound'): only his rage art breaks
  // the chain, and leaves her reeling. If he cannot, she reels him in and reaps: heavy damage and a knockdown.
  chainBind: { id: 'chainBind', cd: AKARI_MOVES.chainBind.cd, range: AKARI_MOVES.chainBind.range, chance: AKARI_MOVES.chainBind.chance,
    cond: (f, w) => !f.akChainOut && w.player && w.player.state !== 'bound',
    run(f, w, ai, p, o) {
      o = akariOpt('chainBind', o);
      const W = o.windup * ai.p.windup, hb = {};
      f.telegraph = W;
      f.startAbility({ dur: W + o.hold + 3, rate: 22,
        pose: (f, t) => (t < W ? AKARI_POSE.crossGuard : f.abil && f.abil.yank ? AKARI_POSE.punish : AKARI_POSE.throwOut),
        start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label, o.tint || '#ff2a6a'); corruptFrames(f, o); AudioManager.play('teleport', { pitch: 0.75 }); },
        update(f, w, t, dt) {
          const pl = w.player;
          f.vx = damp(f.vx, 0, 12, dt);
          if (t < W) {
            // the tell: the chain whirled overhead, links of light circling, a red glint at the end
            if (((t * 60) | 0) % 2 === 0) { const a = t * 18, r = 62 * f.scale; w.fx.part({ x: f.x + Math.cos(a) * r, y: f.y - 225 * f.scale + Math.sin(a) * r * 0.35, vx: -Math.sin(a) * 220, vy: 0, life: 0.18, size: 2, color: '#ff8cc6', type: 'spark', grav: 0, drag: 3, add: true }); }
            if (!this.g && t > W - 0.16) { this.g = 1; w.fx.glint(f.x + f.facing * 40 * f.scale, f.y - 225 * f.scale, '#ff2a6a'); AudioManager.play('orb', { pitch: 1.4 }); }
            return;
          }
          if (!this.c) { this.c = AkariChain.launch(w, f, { speed: o.speed, reach: o.reach, back: o.speed, kind: 'bind' }, pl.x, pl.y - 105 * pl.scale); AudioManager.play('heavyswing', { pitch: 0.8 }); AudioManager.play('throw'); }
          const c = this.c, ph = AkariChain.step(w, c, dt);
          if (ph === 'out') {
            if (pl.alive && pl.invuln <= 0 && pl.state !== 'bound' && overlap(AkariChain.box(c), pl.hurtbox(hb))) {
              Combat.applyHit(w, f, pl, { dmg: o.dmg * f.dmgMul, kb: 0, up: 0, hs: 0.1, imp: 1, hsnd: 'slash', proj: 1, unb: 1, dir: c.dir }, c.x, c.y, c.dir);
              if (pl.alive) { AkariChain.bind(w, c, pl, o.hold); this.bindT = t; } else AkariChain.recall(c);
            }
            return;
          }
          if (ph === 'bind') {
            // he struggles; she holds the chain taut
            if (pl.state !== 'bound') { AkariChain.release(w, c); AkariChain.recall(c); return; }
            if (((t * 60) | 0) % 5 === 0) w.fx.part({ x: lerp(f.x, pl.x, Math.random()), y: -rand(110, 140) * f.scale, vx: rand(-40, 40), vy: -rand(20, 60), life: 0.4, size: rand(1.6, 2.4), color: '#ff8cc6', type: 'spark', grav: 0, drag: 2, add: true });
            if (t - this.bindT >= o.hold) { this.yank = 1; c.phase = 'yank'; this.yankT = t; AudioManager.play('heavyswing', { pitch: 0.6 }); w.fx.popText(f, 'REEL IN', '#ff2a6a'); }
            return;
          }
          if (ph === 'yank' && !this.cut) {
            // reeled in: dragged to her, then the reaping cut
            pl.x = damp(pl.x, f.x + f.facing * 95 * f.scale, 14, dt);
            if (t - this.yankT > 0.24) {
              this.cut = 1; AkariChain.release(w, c); AkariChain.recall(c); pl.invuln = 0;
              Combat.applyHit(w, f, pl, { dmg: o.yank * f.dmgMul, kb: 520, up: -520, hs: 0.6, kd: 1, imp: 3, hsnd: 'slash', unb: 1, stamp: 'REAPED' }, pl.x, pl.y - 110 * pl.scale, f.facing);
              AkariSakura.play(w, f, 'sakura_slash_beam', f.x + f.facing * 90 * f.scale, AkariSakura.chest(f), { scale: f.scale * 1.25 }) || w.fx.petalCross(f.x + f.facing * 90 * f.scale, f.y - 120 * f.scale, f.facing, 170);
              w.fx.shake(0.6); AudioManager.play('heavyswing', { pitch: 1.2 });
            }
            return;
          }
          if (!this.tell && ph === 'back') { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
          if (ph === 'done') { if (this.doneT == null) this.doneT = t; if (t > this.doneT + 0.3) return false; }
        },
        // his rage art broke the chain: it shatters and she reels
        onBreak(f, w) {
          if (this.c) AkariChain.shatter(w, this.c); this.c = null;
          w.fx.popText(f, 'CHAIN BROKEN', C.gold);
          f.endAbility(w); f.move = null; f.setState('stun'); f.stunT = 1.2; f.vx = -f.facing * 220;
        },
        end(f) { AkariChain.end(w, f); } });
    } },
  // Petal Burst (phases 2 and 3; her phase skill): the scythe raised, a bloom circle opening under her and blade petals
  // forming a ring round her, each one's loop traced faintly on the air; then one after another they swing out, each
  // in its own wide loop round the whole arena (low passes skim the floor: jump them), one cut each, and come home to
  // burst round her. In phase 3 (burstBind) she throws a Binding Chain into the storm: caught, the petals converge over
  // him into a lotus that bursts ON him, unless his rage art breaks the chain first. Super armour while it runs; she is
  // open after.
  petalBurst: { id: 'petalBurst', cd: AKARI_MOVES.petalBurst.cd, range: AKARI_MOVES.petalBurst.range, chance: AKARI_MOVES.petalBurst.chance,
    cond: (f, w) => !(w.akPetals && w.akPetals.some(q => q.owner === f)) && !f.akChainOut,
    run(f, w, ai, p, o) {
      o = akariOpt('petalBurst', o);
      const pd = ai.phaseData || {}, bindIt = !!pd.burstBind, n = pd.burstCount || o.count, hb = {};
      const W = o.windup * ai.p.windup, T0 = W + o.bloom, FLY = T0 + (n - 1) * o.gap + o.fly;
      const BIND = T0 + (n - 1) * o.gap * 0.5 + 0.7, HOLD = FLY - BIND + 1.2;
      f.telegraph = W;
      f.startAbility({ dur: FLY + 4, rate: 18, uninterruptible: true,
        pose: (f, t) => (t < W ? AKARI_POSE.crossGuard : f.abil && f.abil.burst ? AKARI_POSE.crossThrough : AKARI_POSE.throwBack),
        start(f) {
          f.facing = w.player.x > f.x ? 1 : -1; f.superArmor = true;
          w.fx.banner('Petal Burst', bindIt ? 'Binding Bloom' : 'The Crimson Petal', '#ff3d9a');
          w.fx.screenTint('rgba(60,0,30,', FLY + 1); AudioManager.play('teleport', { pitch: 0.6 });
        },
        update(f, w, t, dt) {
          const pl = w.player;
          f.vx = damp(f.vx, 0, 12, dt); f.superArmor = !this.burst;
          if (t < W) { akariSwirl(f, w, t, 130); return; }
          if (!this.formed) {
            this.formed = 1; AkariChain.petalsForm(w, f, n); AudioManager.play('orb', { pitch: 0.8 });
            w.fx.ring(f.x, -4, 190, 'rgba(255,120,190,0.8)', 0.5, 5);
            AkariSakura.play(w, f, 'sakura_burst', f.x, AkariSakura.body(f), { scale: f.scale * 0.5 });
          }
          // phase 3: the Binding Chain thrown into the storm
          if (bindIt && !this.thrown && t >= BIND) {
            this.thrown = 1; this.c = AkariChain.launch(w, f, { speed: AKARI_MOVES.chainBind.speed, reach: AKARI_MOVES.chainBind.reach, kind: 'bind' }, pl.x, pl.y - 105 * pl.scale);
            AudioManager.play('throw'); w.fx.popText(f, 'BINDING BLOOM', '#ff2a6a');
          }
          if (this.c) {
            const c = this.c, ph = AkariChain.step(w, c, dt);
            if (ph === 'out' && pl.alive && pl.invuln <= 0 && pl.state !== 'bound' && overlap(AkariChain.box(c), pl.hurtbox(hb))) { AkariChain.bind(w, c, pl, HOLD); this.caught = 1; }
            if (ph === 'done') this.c = null;
          }
          const bound = this.caught && pl.state === 'bound';
          // Convergence: once he is caught and the petals have flown, they gather over him into a lotus
          if (bound && t >= FLY - 0.9 && !this.lotus) {
            this.lotus = w.akLotus = { owner: f, abil: f.abil, x: pl.x, y: pl.y - 300 * pl.scale, t: 0, s: pl.scale, beam: 0 };
            AudioManager.play('boss'); w.fx.popText(pl, 'CONVERGENCE', '#ff5aa8');
          }
          const L = this.lotus;
          if (L) { L.t += dt; L.x = pl.x; if (L.beam > 0) L.beam = Math.max(0, L.beam - dt * 1.6); }
          const live = AkariChain.petalsStep(w, f, o, t, T0, dt, t >= FLY, L && !this.burst ? { x: L.x, y: L.y } : null);
          // the burst ON him: the lotus's pillar of light
          if (L && !this.burst && L.t >= 0.95) {
            this.burst = 1; this.doneT = t; L.beam = 1;
            if (this.c) { AkariChain.release(w, this.c); AkariChain.recall(this.c); }
            pl.invuln = 0;
            Combat.applyHit(w, f, pl, { dmg: o.bindDmg * f.dmgMul, kb: 300, up: -700, hs: 0.7, kd: 1, imp: 3, hsnd: 'heavy', unb: 1, stamp: 'PETAL BURST' }, pl.x, pl.y - 110 * pl.scale, f.facing);
            AkariChain.petalsClear(w, f, true);
            w.fx.shake(0.9); w.fx.stop(0.12); w.fx.screenTint('rgba(255,120,190,', 0.4); AudioManager.play('slam');
            AkariSakura.play(w, f, 'sakura_pillar', pl.x, 0, { scale: pl.scale * 1.2 });
            AkariSakura.play(w, f, 'sakura_burst', pl.x, pl.y - 110 * pl.scale, { scale: pl.scale * 1.1 }) || akariBurst(f, w, pl.x, pl.y - 110 * pl.scale, 30);
          }
          // or they come home and burst round her
          if (!L && t >= FLY && !this.burst && live === 0 && !this.c) {
            this.burst = 1; this.doneT = t;
            Combat.area(w, f, { x: f.x - o.burstR * f.scale, y: -280, w: o.burstR * 2 * f.scale, h: 280 }, { dmg: o.burst * f.dmgMul, kb: 520, up: -460, hs: 0.45, kd: 1, imp: 3, hsnd: 'heavy', stamp: 'PETAL BURST', dir: Math.sign(pl.x - f.x) || f.facing });
            w.fx.ring(f.x, f.y - 110 * f.scale, o.burstR * 1.4, 'rgba(255,170,215,0.95)', 0.45, 8); w.fx.shake(0.6); AudioManager.play('slam');
            AkariSakura.play(w, f, 'sakura_burst', f.x, AkariSakura.body(f), { scale: f.scale * 1.2 }) || akariBurst(f, w, f.x, f.y - 110 * f.scale, 30);
            if (w.akBloom) w.akBloom = w.akBloom.filter(b => b.owner !== f);
          }
          if (this.burst) {
            if (!this.tell && t > this.doneT + 0.3) { this.tell = 1; f.superArmor = false; w.fx.popText(f, 'OPENING', C.gold); }
            if (t > this.doneT + 1.1) return false;
          }
        },
        // his rage art broke the chain: the petals scatter, the lotus withers, she reels
        onBreak(f, w) {
          if (this.c) AkariChain.shatter(w, this.c); this.c = null;
          AkariChain.petalsClear(w, f, true); if (w.akLotus === this.lotus) w.akLotus = null;
          w.fx.popText(f, 'CHAIN BROKEN', C.gold);
          f.endAbility(w); f.move = null; f.setState('stun'); f.stunT = 1.4; f.vx = -f.facing * 220;
        },
        end(f) { f.superArmor = false; AkariChain.end(w, f); if (w.akLotus && w.akLotus.owner === f) w.akLotus = null; } });
    } },
  summon: { id: 'summon', cd: 15, range: [0, 1200], chance: 0.7, cond: (f, w) => w.fighters.filter(x => x.minion && x.alive).length === 0,
    run(f, w) {
      f.startAbility({ dur: 1.0, pose: POSES.castUp, rate: 12, uninterruptible: true,
        start(f) { f.invuln = 1; w.fx.banner('Ashen Wrath', 'Minions answer the Tyrant', C.emberBright); AudioManager.play('boss'); },
        update(f, w, t) { if (t > 0.5 && !this.done) { this.done = 1; w.spawnMinions(f, 2); } } });
    } }
};
/* ---- reduced Raikon moves (RAIKON_VARIANTS in 10-data.js): each runs its base ability's code with the variant's
   parameters, so Act I's sub-bosses fight with Raikon's own moves at reduced strength ---- */
for (const id in RAIKON_VARIANTS) {
  const v = RAIKON_VARIANTS[id], base = BOSS_ABILITIES[v.base];
  BOSS_ABILITIES[id] = { id, cd: v.cd || base.cd, range: v.range || base.range, chance: v.chance || base.chance,
    run(f, w, ai, p) { base.run(f, w, ai, p, v); } };
}
/* ---- reduced Akari moves (AKARI_VARIANTS in 10-data.js): each runs its base ability's code with the variant's numbers
   merged over Akari's (akariOpt), so Act II's sub-bosses fight with her own moves at reduced strength ---- */
for (const id in AKARI_VARIANTS) {
  const v = AKARI_VARIANTS[id], base = BOSS_ABILITIES[v.base];
  BOSS_ABILITIES[id] = { id, cd: v.cd || base.cd, range: v.range || base.range, chance: v.chance || base.chance,
    run(f, w, ai, p) { base.run(f, w, ai, p, v); } };
}
/* ---- reduced Takashi moves (TAKASHI_VARIANTS in 10-data.js): each runs his ability's code with the variant's numbers
   merged over his (takashiOpt), so Act III's sub-bosses fight with his own moves at reduced strength. A Guard Return
   variant keeps his `cond` (picked on its own only while Kage's last move is a pattern) and is raised by
   AIController.readStrike like his. ---- */
for (const id in TAKASHI_VARIANTS) {
  const v = TAKASHI_VARIANTS[id], base = BOSS_ABILITIES[v.base];
  BOSS_ABILITIES[id] = { id, cd: v.cd || base.cd, range: v.range || base.range, chance: v.chance || base.chance, cond: base.cond,
    run(f, w, ai, p) { base.run(f, w, ai, p, v); } };
}
/* ---- the Core echoes' corrupted moves (CORE_ECHO_MOVES in 10-data.js): each runs its original's own ability code
   (Raikon's, Akari's or Takashi's) with the echo's numbers, a violet tint for the original's accents and glitch frames.
   A Guard Return or False Opening echo keeps the base's `cond`; a Guard Return echo is raised by readStrike like his.
   `cd` 600 is once a fight (Hollow Akari's single False Opening). ---- */
for (const id in CORE_ECHO_MOVES) {
  const v = CORE_ECHO_MOVES[id], base = BOSS_ABILITIES[v.base];
  BOSS_ABILITIES[id] = { id, cd: v.cd || base.cd, range: v.range || base.range, chance: v.chance || base.chance, cond: base.cond,
    run(f, w, ai, p) { base.run(f, w, ai, p, v); } };
}
/* ---- Raikon's poses and shared effects (also used by the player's Thunder Swing rage art, 30-combat.js) ---- */
const RAIKON_POSE = {
  // Thunder Swing: the odachi drawn far back at shoulder height, weight on the rear leg, ready to sweep flat
  swingBack: P({ lean: -18, head: -4, rx: -14, fs: -34, fe: 64, wa: 262, bs: -24, be: 84, fh: 26, fk: -36, bh: -34, bk: -20 }),
  // ... then the wide horizontal arc, blade level and fully extended
  swingThrough: P({ lean: 26, rx: 18, head: 8, fs: 64, fe: 0, wa: 92, bs: -40, be: 40, fh: 46, fk: -40, bh: -44, bk: -10 }),
  // Storm Break: both hands high overhead, the blade pointing back over the shoulders
  overhead: P({ lean: -16, head: -8, fs: 200, fe: 10, wa: 250, bs: 190, be: 20, fh: 20, fk: -30, bh: -26, bk: -24 }),
  // ... then the overhead strike driven into the ground
  slam: P({ lean: 42, head: 12, fs: 40, fe: 0, wa: 4, bs: 30, be: 0, fh: 58, fk: -84, bh: -44, bk: -52 }),
  // Redline Counter: a low guard, the blade held diagonally across the body, edge out
  guard: P({ lean: -4, head: 4, fs: 70, fe: 80, wa: 140, bs: 50, be: 100, fh: 30, fk: -30, bh: -30, bk: -14 }),
  // ... and the fast diagonal punish (kesa-giri, high to low)
  diagonal: P({ lean: 34, rx: 20, head: 10, fs: 40, fe: 0, wa: 34, bs: -30, be: 30, fh: 54, fk: -60, bh: -50, bk: -8 }),
  // Skyfall: the free hand raised high toward his foe, calling the storm down; the odachi held low at his side
  callSky: P({ lean: -10, head: -10, fs: 16, fe: 24, wa: 40, bs: 128, be: 4, fh: 24, fk: -24, bh: -30, bk: -18, ik: 0 }),
  // ... and the hand brought down onto the mark as the bolt falls
  callDown: P({ lean: 14, head: 6, fs: 20, fe: 28, wa: 36, bs: 86, be: 0, fh: 34, fk: -40, bh: -34, bk: -22, ik: 0 })
};
// red lightning crackling along Raikō no Tachi while a strike gathers
// (`tint`: a corrupted echo's violet instead of the red)
function raikonCrackle(f, w, t, tint) {
  if (((t * 60) | 0) % 4 !== 0) return;
  const sk = f.sk;
  w.fx.lightning(sk.fha.x, sk.fha.y, sk.wt.x + rand(-10, 10), sk.wt.y + rand(-10, 10), { w: 1.6, branches: 2, dur: 0.1, color: tint });
  w.fx.part({ x: sk.wt.x, y: sk.wt.y, vx: rand(-60, 60), vy: rand(-90, -20), life: 0.25, size: rand(1.5, 3), color: tint || '#ff6a52', type: 'spark', grav: 0, drag: 3, add: true });
}
// the red glint on the blade that marks the moment before release
function raikonGlint(f, w, tint) { w.fx.glint(f.sk.wt.x, f.sk.wt.y, tint ? '#e4d6ff' : '#ff4a3c'); AudioManager.play('orb', { pitch: tint ? 1.3 : 1.7 }); }
// Thunder Swing's release: the arc's own hit up close, and the lightning wave sent along the ground
// (a reduced cut, `o` from thunderSwing: dmg multiplier, arc reach, and wave: false sends no ground wave)
function raikonRelease(f, w, o) {
  o = o || {};
  AudioManager.play('heavyswing'); if (o.wave !== false) AudioManager.play('slam');
  Combat.area(w, f, fbox(f, -10, -210, o.reach || 210, 200), { dmg: 15 * (o.dmg || 1) * f.dmgMul, kb: 420, up: -240, hs: 0.5, imp: 2, hsnd: 'slash', stamp: o.wave === false ? 'CUT' : 'THUNDER', gb: 70 });
  if (o.wave !== false) WeaponSystem.spawn(w, 'thunderwave', f, { x: f.x + f.facing * 110 * f.scale, tint: o.tint, dmgMul: o.tint ? o.dmg || 1 : 1 });
  w.fx.lightning(f.sk.wt.x, f.sk.wt.y, f.x + f.facing * 120 * f.scale, o.wave === false ? f.sk.wt.y + 60 : 0, { w: o.wave === false ? 1.8 : 2.6, branches: o.wave === false ? 2 : 4, dur: 0.16, color: o.tint });
  w.fx.shake(o.wave === false ? 0.25 : 0.45); w.fx.dust(f.x + f.facing * 80, 0, 10);
  if (o.wave !== false) StormDirector.groundStrike(w, f.x + f.facing * 110 * f.scale, 1.15, o.tint);   // the wave's source
}
/* ---- Akari's poses and helpers (the player's Smoke Step rage art, 30-combat.js, uses them too) ---- */
const AKARI_VIOLET = '#ff66b2';   // (old name) her sakura pink: move labels
const AKARI_POSE = {
  // Twin Fang / Smoke Step wind-up: low, both blades drawn back behind her hips
  fangBack: P({ lean: 24, head: 10, fs: 20, fe: 50, wa: -40, bs: 10, be: 60, wb: -60, fh: 52, fk: -76, bh: -40, bk: -54 }),
  // Smoke Step: sunk into a crouch, blades tucked along the forearms
  smokeCrouch: P({ lean: 30, head: 14, fs: 40, fe: 70, wa: 130, bs: 30, be: 90, wb: 150, fh: 74, fk: -110, bh: -50, bk: -76 }),
  // False Opening: guard dropped, both blades hanging low and wide, chest open (the decoy holds it)
  open: P({ lean: -8, head: -6, fs: 16, fe: 10, wa: 24, bs: -22, be: 10, wb: -36, fh: 18, fk: -6, bh: -18, bk: -6 }),
  // ... and the punishing diagonal cut from behind
  punish: P({ lean: 30, rx: 16, head: 8, fs: 50, fe: 0, wa: 30, bs: -30, be: 20, wb: -10, fh: 52, fk: -60, bh: -48, bk: -10 }),
  // Petal Cross: both blades crossed in an X before her face
  crossGuard: P({ lean: -4, head: 6, fs: 130, fe: 70, wa: 150, bs: 140, be: 76, wb: 50, fh: 30, fk: -40, bh: -30, bk: -20 }),
  // ... and swept through, both arms flung out low after the crossing cuts
  crossThrough: P({ lean: 30, rx: 18, head: 8, fs: 60, fe: 0, wa: 20, bs: -50, be: 10, wb: -30, fh: 54, fk: -52, bh: -52, bk: -10 }),
  // Poison Kunai: the throwing hand drawn back high over the shoulder, the other blade held low
  throwBack: P({ lean: -8, head: 4, fs: 196, fe: 70, wa: 150, bs: 26, be: 80, wb: 160, fh: 30, fk: -36, bh: -30, bk: -18 }),
  // ... and flung forward, arm extended toward him
  throwOut: P({ lean: 22, rx: 12, head: 8, fs: 84, fe: 0, wa: 110, bs: -20, be: 40, wb: -20, fh: 44, fk: -50, bh: -40, bk: -12 }),
  // Shadow Flip / Kunai Rain: tucked tight in the air, knees drawn up, blades in close
  flip: P({ lean: 10, head: 10, fs: 120, fe: 100, wa: 170, bs: 110, be: 100, wb: 160, fh: 104, fk: -136, bh: 84, bk: -124 })
};
const akariOpt = (id, o) => Object.assign({}, AKARI_MOVES[id], o || {});
// her phase's petal colours (AKARI_PETALS): [base, highlight, dark]
const akariCol = (f) => AKARI_PETALS[f.petal] || AKARI_PETALS.violet;
// one poisoned kunai from her hand toward (tx, ty): da turns it (radians), dvy adds vertical speed (a fan)
function akariKunai(f, w, o, tx, ty, da, dvy) {
  const p = WeaponSystem.spawn(w, 'kunai', f, { dmg: o.dmg });
  const sp = 1150, a = Math.atan2(ty - p.y, tx - p.x) + (da || 0);
  p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp + (dvy || 0); p.dir = Math.sign(p.vx) || f.facing;
  p.poison = o.poison;
  return p;
}
// petals whirling in round her while a move gathers (r: how far out they start)
function akariSwirl(f, w, t, r) {
  if (((t * 60) | 0) % 2 !== 0) return;
  const col = AkariSakura.col(f), a = rand(0, TAU), cx = f.x, cy = f.y - 110 * f.scale;
  w.fx.part({ x: cx + Math.cos(a) * r * f.scale, y: cy + Math.sin(a) * r * 0.6 * f.scale, vx: -Math.sin(a) * 300 - Math.cos(a) * 120, vy: Math.cos(a) * 180 - Math.sin(a) * 80, life: 0.4, size: rand(2.4, 3.8), color: chance(0.6) ? col[0] : col[1], type: 'ash', grav: 0, drag: 0.8, rot: rand(0, TAU), vr: rand(-10, 10) });
}
// a burst of petals out of a point
function akariBurst(f, w, x, y, n) {
  const col = AkariSakura.col(f);
  for (let i = 0; i < n; i++) w.fx.part({ x, y, vx: rand(-360, 360), vy: rand(-360, 120), life: rand(0.35, 0.7), size: rand(2.4, 4), color: chance(0.5) ? col[0] : chance(0.5) ? col[1] : col[2], type: 'ash', grav: 200, drag: 1.5, rot: rand(0, TAU), vr: rand(-12, 12) });
}
/* ---- Takashi's poses and helpers ---- */
const TAKASHI_GOLD = '#e8c25c';
const TAKASHI_POSE = {
  // Earth Cleave wind-up: sunk deep and grounded, the plain blade dragged low behind him, edge up, ready to rise
  cleaveLow: P({ lean: 26, head: 12, rx: -8, fs: 0, fe: 10, wa: -56, bs: -10, be: 20, fh: 62, fk: -86, bh: -44, bk: -40 }),
  // Guard Return: a quiet low guard, blade held across the body, point forward and down; weight settled
  guard: P({ lean: -6, head: 2, fs: 60, fe: 70, wa: 110, bs: 40, be: 90, fh: 34, fk: -36, bh: -30, bk: -18 })
};
const takashiOpt = (id, o) => Object.assign({}, TAKASHI_MOVES[id], o || {});
// gold embers gathering on the blade while a strike winds up (and, `low`, gold dust lifting off the floor ahead)
function takashiGather(f, w, t, low, tint) {
  if (((t * 60) | 0) % 3 !== 0) return;
  w.fx.embers(f.sk.wt.x, f.sk.wt.y, 1, tint || TAKASHI_GOLD);
  if (low) w.fx.part({ x: f.x + f.facing * rand(20, 90) * f.scale, y: -rand(0, 6), vx: rand(-30, 30), vy: -rand(40, 90), life: 0.4, size: rand(1.5, 2.6), color: tint ? '#8f6bff' : '#d9b055', type: 'spark', grav: 0, drag: 2, add: true });
}
// the gold glint on the plain blade that marks the moment before release
function takashiGlint(f, w, tint) { w.fx.glint(f.sk.wt.x, f.sk.wt.y, tint ? '#e4d6ff' : '#ffe6a0'); AudioManager.play('orb', { pitch: tint ? 1.2 : 1.5 }); }
// the Witness's violet glint: the moment before a cut or a playback is released
function witnessGlint(f, w) { w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#e4d6ff'); AudioManager.play('orb', { pitch: 1.1 }); }
// a corrupted move (a Core echo's, `o.glitch`) glitches the fighter's frames while it runs
function corruptFrames(f, o) { if (o && o.glitch) f.corruptUntil = f.time + 1.8; }
// a violet glint on one of her blades ('wt' Kagehira, 'w2t' Yūrei): the moment before that blade cuts
function akariGlint(f, w, tip) { w.fx.glint(f.sk[tip].x, f.sk[tip].y, AkariSakura.glint(f) || '#e0ccff'); AudioManager.play('orb', { pitch: 1.9 }); }
// where she lands `dist` from x on `side`, inside the arena (the other side when the wall is in the way)
function akariSpot(w, x, side, dist) {
  const l = w.bounds.l + 30, r = w.bounds.r - 30;
  let d = x + side * dist;
  if (d < l || d > r) d = x - side * dist;
  return clamp(d, l, r);
}
function this_charge_pose(f, t) {
  return t < 0.6 ? P({ lean: -14, fs: 186, fe: 0, wa: 210, fh: 30, fk: -40, bh: -30, bk: -30 }) : P({ lean: 40, fs: 80, fe: 0, wa: 60, bs: -60, be: 30, fh: 60, fk: -60, bh: -50, bk: -20 });
}

// Akari's wind-ups and evasions without turning her whole body over (only Kage's double jump does that): she sinks and
// rises, the torso twisting back and forth `turns` times, while her scythe rig twirls the weapon (64-akari-rig.js).
// turns 0: the shadow flip's tucked back-leap (knees drawn up, then opening for the landing).
function akariGather(base, u, turns) {
  u = clamp(u, 0, 1);
  if (!turns) return P({ lean: base.lean - 18 * Math.sin(u * Math.PI), head: (base.head || 0) - 10 * Math.sin(u * Math.PI), fh: 70, fk: -110, bh: 30, bk: -100, tw: 0.4 }, base);
  const w = Math.sin(u * Math.PI * 2 * turns), sink = Math.sin(u * Math.PI);
  return P({ lean: base.lean + 6 * w, tw: 0.9 * w, hp: 0.5 * w, rx: 4 * w, fk: (base.fk || 0) - 22 * sink, bk: (base.bk || 0) - 22 * sink }, base);
}
