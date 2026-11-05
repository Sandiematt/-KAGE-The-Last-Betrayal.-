/* KAGE — Enemy AI (regular / agile / defensive / ranged / heavy) and BossAI (phases + signature abilities) */

// AI_PROFILES (the per-archetype tuning) live in 10-data.js; Logic.aiTuning applies the stage curve and the difficulty mode.
// Impossible's unique combo variations: follow-ups appended to a string (dash-cancel, jump-in, kick into weapon).
const AI_VARIATIONS = {
  armed: [['dash', 'weapon', 'weapon'], ['kick', 'weapon'], ['jump', 'fwd', 'weapon'], ['punch', 'heavy']],
  unarmed: [['dash', 'punch', 'kick'], ['kick', 'heavy'], ['jump', 'fwd', 'kick'], ['punch', 'punch', 'kick']]
};

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
  retune(opts) { this.opts = opts || {}; this.p = Logic.aiTuning((this.f.def || {}).ai || 'regular', this.opts); }
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
    else if (btn === 'heavy') { c.kickP = true; this.kickHold = rand(0.35, 0.75); }
  }
  startSeq(list, delay) { this.seq = list; this.seqI = 0; this.seqT = delay || 0; this.plan = 'attack'; }

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
    // disarmed: go get the weapon back
    if (!f.hasWeapon && f.weaponId() === 'fists' && f.baseWeapon !== 'fists') {
      const pk = w.pickups.find(k => k.owner === f);
      if (pk && pk.grounded && !(dist < 120 && chance(0.5))) { c.dir = Math.sign(pk.x - f.x); if (Math.abs(pk.x - f.x) > 40 && this.p.dodge > 0.2 && chance(0.02)) c.dashP = true; return; }
    }
    // ---- reactions to incoming attacks ----
    const threat = this.threatened(p, dist);
    if (threat && this.reactTo !== p.move) { this.reactTo = p.move; this.react = rand(this.p.react[0], this.p.react[1]) * (this.lastSeen === p.move.id ? 0.6 : 1); this.lastSeen = p.move.id; }
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
        if (btn) { if (btn === 'fwd') c.dir = toward; else this.press(btn); }
        this.seqT = 0.1;
        if (this.seqI >= this.seq.length) { this.seq = null; this.t = rand(0.15, 0.35) * this.p.idle; }
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
    }
    if (p.state !== 'move' && p.state !== 'stun') this.punishedThis = false;
    // ---- decide ----
    this.t -= dt;
    if (this.t <= 0) this.decide(p, dist, toward);
    // ---- carry out movement plan ----
    if (this.plan === 'approach') { c.dir = toward; if (dist < this.p.pref) this.plan = 'hold'; }
    else if (this.plan === 'retreat') { c.dir = -toward; if (f.x < w.bounds.l + 60 || f.x > w.bounds.r - 60) { this.plan = 'hold'; if (this.p.dodge > 0.2) { c.jumpP = true; c.dir = toward; } } }
    else if (this.plan === 'strafe') { c.dir = this.strafeDir; }
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
    let block = this.p.block, parry = this.p.parry, dodge = this.p.dodge;
    // punish predictable behaviour: spammed moves get read
    const pred = this.world.predictability(m.id);
    if (pred > 0.45) { block += 0.25; parry += 0.18; }
    if (this.adapted && this.adapted === m.id) { parry = 1; this.world.fx.stamp('ADAPTED', f.x, f.y - f.height(), 2, '#7fd0c8'); }
    if (m.unb || m.kind === 'grab') { block = 0; dodge += 0.3; }
    if (m.low && f.def && f.def.shield) { dodge += 0.2; }
    const r = Math.random();
    const startupLeft = p.mdur[0] - p.mt;
    if (r < parry && startupLeft < 0.14 && f.grounded) { c.blockHeld = true; f.setState('block'); f.blockT = 0; this.block = 0.3; return; }
    if (r < parry + block && f.grounded && !m.unb) { this.block = rand(0.3, 0.55); c.blockHeld = true; return; }
    if (r < parry + block + dodge) {
      if (m.low || (m.kind === 'throw')) { c.jumpP = true; c.dir = chance(0.5) ? toward : -toward; }
      else if (chance(0.6)) { c.dashP = true; c.dir = -toward; }
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
      if (pr.dashIn && chance(pr.dashIn) && dist < 420) { this.startSeq(['dash', chance(0.5) ? 'punch' : 'kick']); return; }
      if (pr.jump && chance(pr.jump) && dist < 380) { this.startSeq(['jump', 'fwd', 'fwd', chance(0.5) ? 'kick' : 'weapon']); return; }
      if (dist > 300 && f.ammo > 0 && chance(pr.kunai * 0.6)) { this.startSeq(['special']); return; }
      this.plan = 'approach'; return;
    }
    if (chance(aggr)) { this.attack(dist); return; }
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
    // Impossible: unique combo variations that extend the string and leave fewer openings
    if (pr.unique && chance(0.5)) seq = seq.concat(pick(hasW ? AI_VARIATIONS.armed : AI_VARIATIONS.unarmed));
    if (this.phaseData && this.phaseData.unblockable) f.unblockable = true;
    this.startSeq(seq, delay);
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
      f.move = null; this.seq = null;
      BOSS_ABILITIES.roar.run(f, this.world, this);
    }
    this.phaseData = this.phases[this.phase];
    f.poisonBlade = !!this.phaseData.poison;
    if (this.phaseData.berserk) { f.speedMul = (f.baseSpeed || 1) * 1.25; f.boostAtk = 0.78; }
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
    this.cds[a.id] = a.cd * (this.phaseData && this.phaseData.berserk ? 0.7 : 1);
    a.run(this.f, this.world, this, p);
    return true;
  }
}

/* ---- signature abilities. Each one is a scripted Fighter state with its own telegraph ---- */
const BOSS_ABILITIES = {
  roar: { id: 'roar', cd: 0, range: [0, 9999], chance: 1,
    run(f, w) {
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
  // dash, and wave: false for the cut alone (no ground wave and no second wave).
  thunderSwing: { id: 'thunderSwing', cd: 5.2, range: [140, 760], chance: 0.75,
    run(f, w, ai, p, o) {
      o = o || {};
      const wave = o.wave !== false, tell = ai.p.windup, W = (o.windup || 0.66) * tell;
      const delay = wave && ai.phaseData && ai.phaseData.secondWave ? ai.phaseData.secondWave * Math.max(1, tell) : 0;
      const T2 = W + delay, rel = { dmg: o.dmg || 1, reach: o.reach || 210, wave };
      f.telegraph = W;
      f.startAbility({ dur: (delay ? T2 : W) + 0.6, rate: 22, trail: true, charge: true,
        pose: (f, t) => (t < W || (delay && t > W + 0.2 && t < T2) ? RAIKON_POSE.swingBack : RAIKON_POSE.swingThrough),
        start(f) { f.superArmor = true; f.facing = w.player.x > f.x ? 1 : -1; AudioManager.play('teleport'); w.fx.popText(f, o.label || 'THUNDER SWING', '#ff6a52'); },
        update(f, w, t, dt) {
          // a reduced cut can dash forward through its release (o.dash), then skids to a stop
          f.vx = o.dash && t >= W && t < W + 0.16 ? f.facing * o.dash : damp(f.vx, 0, 10, dt);
          if (o.dash && t >= W && t < W + 0.16 && ((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, 'rgba(255,74,60,0.3)');
          if (t < W) { this.charge = true; raikonCrackle(f, w, t); if (!this.glint && t > W - 0.2) { this.glint = 1; raikonGlint(f, w); } return; }
          if (!this.swung) {
            this.swung = 1; this.charge = false; f.superArmor = false;
            if (!o.dash) raikonRelease(f, w, rel);
            if (delay) { f.telegraph = delay; w.fx.popText(f, 'WAIT FOR IT', '#ff6a52'); }
          }
          // the dashing cut lands mid-dash, once
          if (o.dash && !this.cut && t > W + 0.06) { this.cut = 1; raikonRelease(f, w, rel); }
          if (delay && t < T2) {
            if (t > W + 0.2) { this.charge = true; raikonCrackle(f, w, t); if (!this.glint2 && t > T2 - 0.2) { this.glint2 = 1; raikonGlint(f, w); } }
            return;
          }
          if (delay && !this.swung2) { this.swung2 = 1; this.charge = false; raikonRelease(f, w, rel); }
          if (!this.tell && t > (delay ? T2 : W) + 0.25) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
        },
        end(f) { f.superArmor = false; } });
    } },
  // Wind-up overhead (super armour, crackle, glint), then the blade driven into the ground: a crushing hit up close
  // and a short ground shockwave forward.
  // `o` (optional): a reduced variant's label, windup, dmg, reach, shock (shockwave damage, 0 = none) and shockLife.
  stormBreak: { id: 'stormBreak', cd: 4.4, range: [0, 340], chance: 0.65,
    run(f, w, ai, p, o) {
      o = o || {};
      const W = (o.windup || 0.58) * ai.p.windup, shock = o.shock != null ? o.shock : 0.9;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.75, rate: 20, trail: true, charge: true,
        pose: (f, t) => (t < W ? RAIKON_POSE.overhead : RAIKON_POSE.slam),
        start(f) { f.superArmor = true; f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label || 'STORM BREAK', '#ff6a52'); AudioManager.play('teleport'); },
        update(f, w, t, dt) {
          if (t < W) { this.charge = true; f.vx = damp(f.vx, f.facing * 90, 6, dt); raikonCrackle(f, w, t); if (!this.glint && t > W - 0.18) { this.glint = 1; raikonGlint(f, w); } return; }
          f.vx = damp(f.vx, 0, 14, dt);
          if (!this.done) {
            this.done = 1; this.charge = false; f.superArmor = false;
            const gx = f.x + f.facing * 120 * f.scale;
            Combat.area(w, f, fbox(f, 0, -230, o.reach || 200, 230), { dmg: 19 * (o.dmg || 1) * f.dmgMul, kb: 380, up: -460, hs: 0.6, kd: 1, imp: 3, hsnd: 'heavy', stamp: 'BREAK', gb: 110 });
            if (shock > 0) WeaponSystem.spawn(w, 'shock', f, { x: gx, lifeMul: o.shockLife || 0.6, dmgMul: shock });
            for (let i = 0; i < (o.dmg && o.dmg < 1 ? 2 : 3); i++) w.fx.lightning(gx, 0, gx + rand(-90, 90), -rand(60, 150), { w: 2.2, branches: 2, dur: 0.14 });
            w.fx.groundShards(gx, 7, 1.1); w.fx.dust(gx, 0, 18); w.fx.shake(0.7); AudioManager.play('slam');
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
        onCounter(f) { f.counterStance = false; this.charge = false; this.punish = this.t; this.dur = this.t + P2 + 0.55; f.telegraph = P2; },
        end(f) { f.counterStance = false; f.redline = false; } });
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
  diagonal: P({ lean: 34, rx: 20, head: 10, fs: 40, fe: 0, wa: 34, bs: -30, be: 30, fh: 54, fk: -60, bh: -50, bk: -8 })
};
// red lightning crackling along Raikō no Tachi while a strike gathers
function raikonCrackle(f, w, t) {
  if (((t * 60) | 0) % 4 !== 0) return;
  const sk = f.sk;
  w.fx.lightning(sk.fha.x, sk.fha.y, sk.wt.x + rand(-10, 10), sk.wt.y + rand(-10, 10), { w: 1.6, branches: 2, dur: 0.1 });
  w.fx.part({ x: sk.wt.x, y: sk.wt.y, vx: rand(-60, 60), vy: rand(-90, -20), life: 0.25, size: rand(1.5, 3), color: '#ff6a52', type: 'spark', grav: 0, drag: 3, add: true });
}
// the red glint on the blade that marks the moment before release
function raikonGlint(f, w) { w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#ff4a3c'); AudioManager.play('orb', { pitch: 1.7 }); }
// Thunder Swing's release: the arc's own hit up close, and the lightning wave sent along the ground
// (a reduced cut, `o` from thunderSwing: dmg multiplier, arc reach, and wave: false sends no ground wave)
function raikonRelease(f, w, o) {
  o = o || {};
  AudioManager.play('heavyswing'); if (o.wave !== false) AudioManager.play('slam');
  Combat.area(w, f, fbox(f, -10, -210, o.reach || 210, 200), { dmg: 15 * (o.dmg || 1) * f.dmgMul, kb: 420, up: -240, hs: 0.5, imp: 2, hsnd: 'slash', stamp: o.wave === false ? 'CUT' : 'THUNDER', gb: 70 });
  if (o.wave !== false) WeaponSystem.spawn(w, 'thunderwave', f, { x: f.x + f.facing * 110 * f.scale });
  w.fx.lightning(f.sk.wt.x, f.sk.wt.y, f.x + f.facing * 120 * f.scale, o.wave === false ? f.sk.wt.y + 60 : 0, { w: o.wave === false ? 1.8 : 2.6, branches: o.wave === false ? 2 : 4, dur: 0.16 });
  w.fx.shake(o.wave === false ? 0.25 : 0.45); w.fx.dust(f.x + f.facing * 80, 0, 10);
}
function this_charge_pose(f, t) {
  return t < 0.6 ? P({ lean: -14, fs: 186, fe: 0, wa: 210, fh: 30, fk: -40, bh: -30, bk: -30 }) : P({ lean: 40, fs: 80, fe: 0, wa: 60, bs: -60, be: 30, fh: 60, fk: -60, bh: -50, bk: -20 });
}
