/* KAGE — GameEngine: fixed-timestep loop, FightSession (rounds, intros, KO, survival waves) and progression */

class FightSession {
  constructor(cfg) {
    const save = SaveManager.data;
    this.cfg = cfg; this.mode = cfg.mode;
    this.fx = new Effects(); this.projectiles = []; this.pickups = []; this.fighters = [];
    this.time = 0; this.bounds = { l: -820, r: 820 };
    this.cam = { x: 0, y: 0, zoom: 1.05 };
    this.env = getEnv(cfg.env);
    this.history = []; this.letterbox = 1; this.fightFlash = 0;
    this.rounds = { p: 0, e: 0, n: 0 };
    this.wave = cfg.wave || 1; this.survivalCoins = 0; this.survivalGems = 0; this.wavesCleared = 0;
    this.dialogue = null; this.combo = 0; this.comboT = 0; this.damageTaken = 0; this.fightTime = 0;
    this.player = this.makePlayer(save);
    this.enemy = this.makeEnemy(cfg.enemyId, 300);
    this.fighters = [this.player, this.enemy];
    this.isBoss = this.enemy.def.type === 'boss';
    this.isSub = this.enemy.def.type === 'sub';
    this.roundsToWin = this.isBoss || this.mode === 'survival' ? 1 : 2;
    this.timer = this.roundTime();
    this.phase = 'intro'; this.phaseT = 0;
    this.setupIntro();
  }
  roundTime() { return this.mode === 'survival' ? 90 : this.isBoss ? 150 : 75; }

  makePlayer(save) {
    const h = HELMETS[save.equipped.helmet], a = ARMORS[save.equipped.armor];
    const pk = {}; for (const src of [h.perks, a.perks]) for (const k in src) pk[k] = (pk[k] || 0) + src[k];
    const def = gearDef('helmets', h.id, save.owned.helmets[h.id]) + gearDef('armors', a.id, save.owned.armors[a.id]);
    const f = makePlayerFighter(save, {
      x: -300, team: 0, hp: playerMaxHp(save), defense: Math.min(0.5, def), speedMul: 1 + (pk.speed || 0), rageMul: 1 + (pk.rage || 0),
      stunRes: pk.stunRes || 0, dashBonus: pk.dash || 0, ammo: 5 + (pk.ammo || 0), kunaiMul: 1 + (pk.kunai || 0),
      dmgMul: (1 + 0.012 * (save.level - 1)) * (1 + (pk.dmg || 0))
    });
    f.name = 'Kael';
    return f;
  }
  difficultyLevel(d) {
    if (this.mode === 'survival') return 1 + this.wave * 0.35;
    const act = this.cfg.act || 0, st = this.cfg.stage || 0;
    return 1 + act * 1.6 + st * 0.22 + (d.type === 'sub' ? 0.4 : d.type === 'boss' ? 0.8 : 0);
  }
  makeEnemy(id, x, extra) {
    const d = ENEMIES[id], ng = this.cfg.ng || 0;
    let hpMul = 1 + 0.35 * ng, dmgMul = (d.dmg || 1) * (1 + 0.25 * ng);
    if (this.mode === 'survival') { hpMul *= 0.85 + this.wave * 0.07; dmgMul *= 0.9 + this.wave * 0.04; }
    const lvl = this.difficultyLevel(d);
    const wl = clamp(Math.round(1 + (this.cfg.act || 0) * 2.2 + (this.cfg.stage || 0) * 0.3 + ng * 2 + (this.mode === 'survival' ? this.wave * 0.3 : 0)), 1, 8);
    const gearDefE = ((HELMETS[d.helmet] || {}).def || 0) * 0.6 + ((ARMORS[d.armor] || {}).def || 0) * 0.6;
    const f = makeFighterFromEnemy(id, Object.assign({ x, team: 1, hp: Math.round(d.hp * hpMul), dmgMul, wlvl: wl, defense: gearDefE, speedMul: d.speed || 1 }, extra || {}));
    f.baseSpeed = f.speedMul;
    f.ai = new AIController(f, this, { level: lvl, ng });
    return f;
  }

  setupIntro() {
    const e = this.enemy, p = this.player;
    p.state = 'pose'; p.poseName = null;
    e.state = 'pose'; e.poseName = 'taunt';
    this.letterbox = 1;
    if (this.isBoss) { e.y = -720; e.grounded = false; e.state = 'air'; }
    else if (this.isSub) { e.x = 760; e.vx = 0; }
    this.cam.x = e.x - 80; this.cam.zoom = 1.3;
    if (this.mode === 'survival') this.fx.banner(`Wave ${this.wave}`, `${e.name}, ${e.title}`, C.gold);
  }

  // ---- world interface used by fighters / combat / AI ----
  opponentOf(f) {
    if (f.team === 0) { let best = null, bd = 1e9; for (const o of this.fighters) if (o.team !== 0 && o.alive && o.visible) { const d = Math.abs(o.x - f.x) + (o === this.enemy ? -80 : 0); if (d < bd) { bd = d; best = o; } } return best || this.enemy; }
    return this.player;
  }
  nearestEnemy(f) { return this.opponentOf(f); }
  spawnProjectile(type, f) { return WeaponSystem.spawn(this, type, f, { dmgMul: 1 }); }
  spawnShock(f, m) { WeaponSystem.spawn(this, 'shock', f, { dmgMul: (f.isPlayer ? weaponMul(f.wlvl).dmg : 1) * (m.dmg > 30 ? 1.3 : 1) }); AudioManager.play('slam'); this.fx.dust(f.x + f.facing * 90, 0, 14); this.fx.shake(0.4); }
  dropWeapon(f) { WeaponSystem.drop(this, f); }
  applyThrow(att, v) { Combat.applyThrow(this, att, v); }
  wallBounce(f) {
    f.vx = -f.vx * 0.55; f.vy = Math.min(f.vy, -420);
    this.fx.dust(f.x, f.y, 10); this.fx.shake(0.45); this.fx.stamp('WALL', f.x, f.y - 100, 2); AudioManager.play('heavy');
  }
  predictability(id) {
    const h = this.history.slice(-8); if (h.length < 4) return 0;
    let n = 0; for (const x of h) if (x === id) n++;
    return n / h.length;
  }
  onMoveStart(f, m) {
    if (!f.isPlayer) return;
    this.history.push(m.id); if (this.history.length > 12) this.history.shift();
    const h = this.history, L = h.length;
    if (L >= 3 && h[L - 1] === h[L - 2] && h[L - 2] === h[L - 3]) {
      for (const e of this.fighters) if (e.ai && e.def && e.def.adapts && e.alive && e.ai.adapted !== m.id) { e.ai.adapted = m.id; e.ai.adaptT = 8; this.fx.popText(e, 'He reads you', '#7fd0c8'); }
    }
  }
  onSpecial(f) { this.fx.slowmo(0.55, 0.35); this.fx.punch(0.05); }
  onHit(att, def, dmg) {
    if (att.isPlayer) {
      this.combo = att.comboHits; this.comboT = 1.2;
      // consecutive-hit milestones get a beat of slow motion and a calligraphy mark
      if (att.comboHits === 5 || att.comboHits === 10 || att.comboHits === 15 || att.comboHits === 25) {
        this.fx.slowmo(0.45, 0.4); this.fx.stamp('COMBO', def.x, def.y - def.height() * 0.7, att.comboHits >= 10 ? 3 : 2, C.gold, `${att.comboHits} HIT COMBO`);
        att.rage = Math.min(100, att.rage + 6);
      }
    }
    if (def.isPlayer) { this.damageTaken += dmg; this.combo = 0; }
    if (def === this.enemy && def.barrier > 0 && dmg > 12) { def.barrier = 0; this.fx.popText(def, 'BARRIER BROKEN', C.gold); }
  }
  onParry(def) { if (def.isPlayer) AudioManager.play('coin', { pitch: 1.4 }); }
  onBossPhase(f, idx, ph) {
    this.fx.banner(`Phase ${ROMAN[idx]}`, ph.name, f.accent || C.emberBright);
    this.fx.impactFrame(f.x, f.y - 100, 3); this.fx.shake(0.6);
    this.cine = { t: 1.2, target: f }; this.fx.elemImpact(f.elementOf(null) || 'ink', f.x, f.y - 100 * f.scale, f.facing, 3, true);
    this.fx.ring(f.x, f.y - 100, 380, f.accent || C.emberBright, 0.7, 10);
    if (ph.berserk) { f.eye = '#8be07a'; }
  }
  spawnClones(owner, n) {
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const c = this.makeEnemy(owner.def.id, clamp(this.player.x + side * rand(260, 380), this.bounds.l + 40, this.bounds.r - 40), { hp: 1, clone: true });
      c.clone = true; c.maxHp = 1; c.hp = 1; c.alpha = 0.72; c.eye = 'rgba(0,0,0,0)'; c.dmgMul *= 0.5;
      c.ai.phases = null; c.ai.abilities = []; c.ai.p.aggr = 0.8; c.life = 9;
      this.fighters.push(c); this.smokeCloud(c.x);
    }
  }
  spawnMinions(owner, n) {
    for (let i = 0; i < n; i++) {
      const x = i % 2 ? this.bounds.r - 30 : this.bounds.l + 30;
      const m = this.makeEnemy('vosk', x, { hp: 70, build: { scale: 0.88, w: 10 } });
      m.minion = true; m.maxHp = 70; m.hp = 70; m.dmgMul *= 0.6; m.ai.p.aggr = 0.6;
      this.fighters.push(m); this.fx.embers(x, -60, 20);
    }
  }
  smokeCloud(x, big) { this.fx.smoke(x, 0, big ? 18 : 12, big); AudioManager.play('smoke'); }

  onKO(def, att) {
    const fx = this.fx;
    if (def.clone) { def.visible = false; this.smokeCloud(def.x); this.fighters.splice(this.fighters.indexOf(def), 1); return; }
    if (def.minion) { fx.embers(def.x, -60, 16); return; }
    if (this.phase !== 'fight') return;
    const main = def === this.player || def === this.enemy;
    if (!main) return;
    fx.slowmo(0.22, 1.15); fx.impactFrame(def.x, def.y - 100 * def.scale, 3); fx.shake(0.9); fx.punch(0.12);
    fx.stamp(def === this.player ? 'FALLEN' : 'FINISH', def.x, def.y - 120, 3, def === this.player ? C.ember : C.emberBright);
    if (def !== this.player) { fx.finisher(def.x, def.y - 100 * def.scale, att.facing); const el = att.elementOf(null); if (el) fx.elemImpact(el, def.x, def.y - 100 * def.scale, att.facing, 3, true); }
    AudioManager.play('ko');
    this.koTarget = def; this.phase = 'ko'; this.phaseT = 0;
    for (const f of this.fighters) if ((f.clone || f.minion) && f.alive) { f.alive = false; f.hp = 0; f.setState('juggle'); f.vy = -300; if (f.clone) { f.visible = false; this.smokeCloud(f.x); } }
    if (def === this.player) this.rounds.e++; else { this.rounds.p++; if (this.mode === 'survival') this.waveCleared(); }
  }
  waveCleared() {
    const coins = SURVIVAL.coins(this.wave);
    this.survivalCoins += coins; this.wavesCleared = this.wave;
    if (this.wave % SURVIVAL.gemsEvery === 0) this.survivalGems += 1;
    this.fx.popText(this.player, `+${coins} COINS`, C.gold);
    AudioManager.play('coin');
  }

  resetRound() {
    const p = this.player;
    this.projectiles.length = 0; this.pickups.length = 0;
    this.fighters = this.fighters.filter(f => f === p || f === this.enemy);
    for (const f of this.fighters) {
      f.alive = true; f.hp = f.maxHp; f.rage = f === p ? f.rage * 0.5 : 0; f.hasWeapon = f.baseWeapon !== 'fists'; f.move = null; f.abil = null;
      f.vx = f.vy = 0; f.y = 0; f.grounded = true; f.invuln = 0; f.poison = 0; f.barrier = 0; f.aura = 0; f.alpha = 1; f.visible = true; f.ammo = f.maxAmmo;
      f.setState('idle'); f.comboHits = 0;
    }
    p.x = -300; this.enemy.x = 300; p.facing = 1; this.enemy.facing = -1;
    if (this.enemy.ai) { this.enemy.ai.seq = null; this.enemy.ai.block = 0; this.enemy.ai.phase = 0; }
    this.timer = this.roundTime();
  }

  nextWave() {
    this.wave++;
    const p = this.player;
    p.hp = Math.min(p.maxHp, p.hp + p.maxHp * SURVIVAL.heal); p.ammo = p.maxAmmo; p.hasWeapon = true; p.poison = 0;
    this.projectiles.length = 0; this.pickups.length = 0;
    const id = this.wave % 5 === 0 ? pick(SURVIVAL.bosses) : pick(SURVIVAL.pool);
    if ((this.wave - 1) % 3 === 0) this.env = getEnv(SURVIVAL.envs[((this.wave - 1) / 3 | 0) % 3]);
    const side = p.x > 0 ? -1 : 1;
    this.enemy = this.makeEnemy(id, clamp(p.x + side * 620, this.bounds.l + 40, this.bounds.r - 40));
    this.enemy.facing = -side;
    this.fighters = [p, this.enemy];
    this.timer = this.roundTime();
    this.fx.banner(`Wave ${this.wave}`, `${this.enemy.name}, ${this.enemy.title}`, this.wave % 5 === 0 ? C.emberBright : C.gold);
    AudioManager.play('round');
    this.phase = 'round'; this.phaseT = 0.4;
  }

  // ---- main simulation tick ----
  step(dt) {
    this.time += dt; this.phaseT += dt;
    const p = this.player, e = this.enemy;
    switch (this.phase) {
      case 'intro': {
        const dur = this.isBoss ? 3.6 : this.isSub ? 3.0 : 2.4;
        if (this.isSub && this.phaseT < 0.5) { e.x = lerp(760, 300, Ease.outCubic(this.phaseT / 0.5)); if (((this.phaseT * 60) | 0) % 3 === 0) this.fx.afterimage(e); }
        if (this.isBoss && e.grounded && !this.bossLanded) {
          this.bossLanded = true; e.state = 'pose'; e.poseName = 'taunt';
          this.fx.shake(0.9); this.fx.dust(e.x, 0, 30); this.fx.ring(e.x, -20, 300, e.accent || C.emberBright, 0.6, 8); AudioManager.play('slam'); AudioManager.play('boss');
          this.fx.impactFrame(e.x, -120, 3);
        }
        if (this.phaseT > 0.5 && !this.dialogue && this.mode !== 'survival') {
          this.dialogue = { name: e.name, title: e.title, text: e.def.taunt, t: 0 };
          if (this.isBoss || this.isSub) this.fx.banner(e.name, e.title, e.accent || C.emberBright);
        }
        const skip = this.phaseT > 0.6 && (InputManager.pressed('punch') || InputManager.pressed('jump') || InputManager.pressed('weapon') || UIManager.skipRequested());
        if (this.phaseT > dur || skip) { this.dialogue = null; this.phase = 'round'; this.phaseT = 0; e.state = 'idle'; p.state = 'idle'; if (this.isBoss && !e.grounded) { e.y = 0; e.grounded = true; } }
        break;
      }
      case 'round':
        if (this.phaseT < 0.05 && !this.roundShown) {
          this.roundShown = true; this.rounds.n++;
          if (this.mode !== 'survival') this.fx.banner(this.roundsToWin > 1 ? `Round ${ROMAN[this.rounds.n - 1]}` : 'Final Duel', this.isBoss ? 'Three phases stand between you and the throne' : `${e.name} · ${DIFF_LABEL[clamp((ACTS[this.cfg.act] || { diff: 1 }).diff + (this.cfg.ng || 0), 0, 4)]}`, C.gold);
          AudioManager.play('round');
        }
        if (this.phaseT > 1.25 && !this.fightShown) { this.fightShown = true; this.fx.stamp('FIGHT', (p.x + e.x) / 2, -150, 3, C.emberBright); this.fightFlash = 1; }
        if (this.phaseT > 1.6) { this.phase = 'fight'; this.phaseT = 0; this.roundShown = false; this.fightShown = false; }
        break;
      case 'fight':
        this.timer -= dt; this.fightTime += dt;
        if (this.timer <= 0) this.timeOut();
        break;
      case 'ko':
        if (this.phaseT > 2.2) this.afterKO();
        break;
      case 'outro':
        if (this.phaseT > 3.2 || (this.phaseT > 0.8 && (InputManager.pressed('punch') || InputManager.pressed('jump') || UIManager.skipRequested()))) { this.phase = 'done'; Game.finishFight(this.buildResult()); }
        break;
    }
    if (this.cine) { this.cine.t -= dt; if (this.cine.t <= 0) this.cine = null; }
    this.letterbox = damp(this.letterbox, this.phase === 'intro' || this.phase === 'outro' || this.cine ? 1 : 0, 6, dt);
    this.fightFlash = Math.max(0, this.fightFlash - dt * 3);
    if (this.dialogue) this.dialogue.t += dt;
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.combo = 0; }

    // controls
    if (this.phase === 'fight') InputManager.readCtrl(p.ctrl); else clearCtrlEdges(p.ctrl), p.ctrl.dir = 0, p.ctrl.blockHeld = false, p.ctrl.kickHeld = false;
    for (const f of this.fighters) if (f.ai) { if (this.phase === 'fight') f.ai.update(dt); else { clearCtrlEdges(f.ctrl); f.ctrl.dir = 0; f.ctrl.blockHeld = false; f.ctrl.kickHeld = false; } if (f.ai.adaptT > 0) { f.ai.adaptT -= dt; if (f.ai.adaptT <= 0) f.ai.adapted = null; } }
    // auras / barriers / clone lifetime
    p.slow = 1;
    for (const f of this.fighters) {
      if (f.barrier > 0) f.barrier -= dt;
      if (f.aura > 0) { f.aura -= dt; if (Math.abs(p.x - f.x) < 330 && f.alive) p.slow = 0.68; }
      if (f.clone && f.alive) { f.life -= dt; if (f.life <= 0) { f.alive = false; f.visible = false; this.smokeCloud(f.x); } }
    }
    // simulate
    for (const f of this.fighters) { f.update(dt, this); VFX.emit(f, this.fx); }
    if (this.phase === 'fight' || this.phase === 'ko') Combat.resolve(this);
    WeaponSystem.update(this, dt);
    WeaponSystem.updatePickups(this, dt);
    this.separate();
    this.fighters = this.fighters.filter(f => f.visible || f.alive || f === p || f === e);
    this.updateCamera(dt);
  }

  timeOut() {
    const p = this.player, e = this.enemy;
    const pk = p.hp / p.maxHp, ek = e.hp / e.maxHp;
    this.fx.stamp('TIME', (p.x + e.x) / 2, -160, 3, C.gold);
    const loser = pk >= ek ? e : p;
    loser.alive = false; loser.hp = 0; loser.move = null; loser.setState('juggle'); loser.grounded = false; loser.vy = -300; loser.vx = (loser === e ? 1 : -1) * 200;
    this.onKO(loser, loser === e ? p : e);
  }
  afterKO() {
    const pWon = this.koTarget !== this.player;
    if (this.mode === 'survival') {
      if (pWon) { this.nextWave(); return; }
      return this.startOutro(false);
    }
    if (this.rounds.p >= this.roundsToWin) return this.startOutro(true);
    if (this.rounds.e >= this.roundsToWin) return this.startOutro(false);
    this.resetRound(); this.phase = 'round'; this.phaseT = 0;
  }
  startOutro(win) {
    this.phase = 'outro'; this.phaseT = 0; this.win = win;
    const w = win ? this.player : this.enemy, l = win ? this.enemy : this.player;
    w.state = 'pose'; w.poseName = 'victory'; w.vx = 0;
    if (!win) w.poseName = 'taunt';
    const line = win ? (l.def.defeat || null) : (w.def && w.def.win) || null;
    if (line && this.mode !== 'survival') this.dialogue = { name: win ? l.name : w.name, title: win ? l.title : w.title, text: line, t: 0 };
    AudioManager.play(win ? 'victory' : 'defeat');
    AudioManager.setMusic('none');
  }
  buildResult() {
    const p = this.player, e = this.enemy;
    return {
      mode: this.mode, win: !!this.win, enemyId: e.def.id, act: this.cfg.act, stage: this.cfg.stage, ng: this.cfg.ng || 0,
      time: this.fightTime, hpLeft: p.hp / p.maxHp, flawless: this.damageTaken < 1, maxCombo: p.stats.maxCombo, parries: p.stats.parries,
      enemyDamage: 1 - Math.max(0, e.hp) / e.maxHp, waves: this.wavesCleared, survivalCoins: this.survivalCoins, survivalGems: this.survivalGems,
      env: this.cfg.env
    };
  }

  separate() {
    const fs = this.fighters;
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
      const a = fs[i], b = fs[j];
      if (!a.alive || !b.alive || !a.visible || !b.visible) continue;
      if (a.state === 'grabbed' || b.state === 'grabbed' || a.state === 'down' || b.state === 'down' || a.state === 'juggle' || b.state === 'juggle') continue;
      if (a.state === 'dash' || b.state === 'dash' || (a.state === 'ability' && a.invuln > 0) || (b.state === 'ability' && b.invuln > 0)) continue;
      if (Math.abs(a.y - b.y) > 110) continue;
      const min = 26 * (a.scale + b.scale) * (a.build.w > 14 || b.build.w > 14 ? 1.2 : 1);
      const dx = b.x - a.x, ad = Math.abs(dx);
      if (ad < min) {
        const push = (min - ad) / 2, s = dx === 0 ? (a.facing > 0 ? 1 : -1) : Math.sign(dx);
        const wa = a.def && a.def.heavyArmor ? 0.2 : 1, wb = b.def && b.def.heavyArmor ? 0.2 : 1;
        a.x -= s * push * (wa / ((wa + wb) / 2)); b.x += s * push * (wb / ((wa + wb) / 2));
        a.x = clamp(a.x, this.bounds.l, this.bounds.r); b.x = clamp(b.x, this.bounds.l, this.bounds.r);
      }
    }
  }

  updateCamera(dt) {
    const p = this.player, e = this.enemy, cam = this.cam;
    let tx, tz, ty = 0;
    if (this.phase === 'intro') { tx = e.x - 90; tz = this.isBoss ? 1.32 : 1.25; ty = -30; }
    else if (this.phase === 'ko' && this.koTarget) { tx = this.koTarget.x; tz = this.isBoss ? 1.55 : 1.35; ty = -40; }
    else if (this.cine && this.cine.t > 0) { tx = this.cine.target.x; tz = 1.42; ty = -50; }
    else if (this.phase === 'outro') { const w = this.win ? p : e; tx = w.x; tz = 1.3; ty = -30; }
    else {
      const dist = Math.abs(p.x - e.x);
      tx = (p.x + e.x) / 2; tz = clamp(1300 / (dist + 560), 0.9, 1.36);
      ty = Math.min(0, Math.min(p.y, e.y) * 0.35);
    }
    const half = W / 2 / tz;
    tx = clamp(tx, this.bounds.l - 70 + half, this.bounds.r + 70 - half);
    cam.x = damp(cam.x, tx, this.phase === 'ko' ? 4 : 5, dt);
    cam.zoom = damp(cam.zoom, tz, this.phase === 'ko' ? 3 : 2.6, dt);
    cam.y = damp(cam.y, ty, 3, dt);
  }
}

/* ======================================================================== */
/* GameEngine                                                                 */
/* ======================================================================== */
const Game = {
  canvas: null, ctx: null, session: null, scene: 'title', paused: false, acc: 0, last: 0, t: 0,
  warrior: null, tableau: null,
  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    Renderer.init(this.ctx);
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 200));
    this.resize();
    this.buildWarrior();
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.inFight()) UIManager.openPause(); });
    requestAnimationFrame(ts => { this.last = ts; this.loop(ts); });
  },
  buildWarrior() {
    const save = SaveManager.data;
    this.warrior = makePlayerFighter(save, { x: 0, facing: -1 });
    poseFighter(this.warrior, WEAPONS[save.equipped.weapon].hands === 2 && SHAPE[save.equipped.weapon] === 'katana' ? 'gedan' : null, 60);
  },
  resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    // the title scene fills the screen (cover, framed on the moon and the hero); everything else letterboxes
    const cover = this._cover = this.scene === 'title';
    const s = cover ? Math.max(vw / W, vh / H) : Math.min(vw / W, vh / H);
    const cw = Math.round(W * s), ch = Math.round(H * s);
    const left = cover ? clamp(Math.round(vw * 0.66 - 900 * s), vw - cw, 0) : Math.round((vw - cw) / 2);
    const top = cover ? clamp(Math.round(vh * 0.62 - 470 * s), vh - ch, 0) : Math.round((vh - ch) / 2);
    Object.assign(this.canvas.style, { width: cw + 'px', height: ch + 'px', left: left + 'px', top: top + 'px' });
    let u = Math.min(vw / W, vh / H);
    if (vh < 560) u = Math.max(u, vh / 470);
    u = clamp(u, 0.55, 2.2);
    document.documentElement.style.setProperty('--u', u.toFixed(4));
    document.documentElement.style.setProperty('--vw', vw + 'px');
    document.documentElement.style.setProperty('--vh', vh + 'px');
    UIManager.onResize && UIManager.onResize();
  },
  inFight() { return this.scene === 'fight' && !!this.session && !this.paused; },
  setScene(s) { this.scene = s; },
  animateTableau(dt) {
    if (!this.tableau) return;
    for (const f of this.tableau.opts.fighters) { f.time += dt; f.updatePose(dt); f.computeSkeleton(); f.updateCloth(dt); }
  },
  loop(ts) {
    const real = Math.min(0.1, Math.max(0, (ts - this.last) / 1000)); this.last = ts; this.t += real;
    if ((this.scene === 'title') !== this._cover) this.resize();
    InputManager.pollGamepad();
    AudioManager.update();
    try {
      if (this.scene === 'fight' && this.session) {
        const s = this.session;
        if (!this.paused) {
          if (s.fx.hitStop > 0) s.fx.update(real, 0);
          else {
            this.acc += real * s.fx.slowScale;
            let n = 0;
            while (this.acc >= STEP && n < 5) { s.step(STEP); InputManager.endTick(); this.acc -= STEP; n++; if (this.scene !== 'fight') break; }
            s.fx.update(real, real * s.fx.slowScale);
          }
        }
        if (this.session) { Renderer.drawFight(this.session, this.t); UIManager.hud.update(this.session); }
      } else if (this.scene === 'title') {
        TitleScene.frame(real); InputManager.endTick();
      } else if (this.scene === 'tableau' && this.tableau) {
        this.tableau.t += real; this.animateTableau(real);
        Renderer.drawTableau(this.tableau.env, this.tableau.t, this.tableau.opts); InputManager.endTick();
      } else { Renderer.clear(); InputManager.endTick(); }
    } catch (err) { console.error('[KAGE] frame error', err); InputManager.endTick(); }
    requestAnimationFrame(t => this.loop(t));
  },

  /* ---- flow ---- */
  stageConfig(actIdx, stageIdx) {
    const act = ACTS[actIdx], st = act.stages[stageIdx];
    return { mode: 'campaign', act: actIdx, stage: stageIdx, enemyId: st.enemy, env: act.env, ng: SaveManager.data.ng };
  },
  startFight(cfg) {
    this.session = new FightSession(cfg);
    this.scene = 'fight'; this.paused = false; this.acc = 0; this.tableau = null;
    const d = ENEMIES[cfg.enemyId];
    AudioManager.setMusic(cfg.mode === 'survival' ? 'survival' : d.type === 'boss' ? 'boss' : 'fight');
    UIManager.showHud(this.session);
  },
  retry() { if (this.lastCfg) { const c = Object.assign({}, this.lastCfg); if (c.mode === 'survival') c.wave = 1; UIManager.go('prefight', () => UIManager.preparePrefight(c)); } },
  quitFight() { this.session = null; this.paused = false; AudioManager.setMusic('menu'); },
  setTableau(env, opts) { this.tableau = { env: getEnv(env), t: 0, opts }; this.scene = 'tableau'; },

  finishFight(r) {
    const save = SaveManager.data;
    this.lastCfg = this.session ? this.session.cfg : this.lastCfg;
    const out = Object.assign({}, r, { coins: 0, gems: 0, xp: 0, unlocks: [], levelUps: 0, firstClear: false });
    const ngMul = 1 + 0.6 * (r.ng || 0);
    if (r.mode === 'campaign') {
      const act = ACTS[r.act], d = ENEMIES[r.enemyId], key = `${r.act}-${r.stage}`;
      const typeMul = d.type === 'boss' ? 3.4 : d.type === 'sub' ? 2.2 : 1;
      const base = (60 + 45 * act.diff) * typeMul;
      out.rating = this.rate(r);
      out.seals = [r.win, r.win && r.time < 60, r.win && r.flawless];
      if (r.win) {
        out.firstClear = !save.cleared[key];
        out.coins = Math.round(base * ngMul * ({ S: 1.5, A: 1.25, B: 1.1, C: 1 }[out.rating]) * (out.firstClear ? 1 : 0.5) / 5) * 5;
        out.gems = (out.firstClear ? (d.type === 'boss' ? 5 : d.type === 'sub' ? 2 : 0) : (d.type === 'boss' ? 1 : 0)) + (r.flawless ? 1 : 0);
        out.xp = Math.round((d.type === 'boss' ? 300 : d.type === 'sub' ? 150 : 80) * act.diff * ngMul);
        save.cleared[key] = true;
        save.defeated[d.id] = (save.defeated[d.id] || 0) + 1;
        save.stats.wins++; if (r.flawless) save.stats.perfects++;
        if (d.reward) {
          if (d.reward.weapon && !save.owned.weapons[d.reward.weapon]) { save.owned.weapons[d.reward.weapon] = 1; out.unlocks.push({ kind: 'weapons', id: d.reward.weapon }); }
          if (d.reward.item && !save.owned[d.reward.item[0]][d.reward.item[1]]) { save.owned[d.reward.item[0]][d.reward.item[1]] = 1; out.unlocks.push({ kind: d.reward.item[0], id: d.reward.item[1] }); }
        }
        if (d.type === 'boss') {
          save.stats.bosses++;
          if (r.act + 2 > save.unlockedActs && r.act + 1 < ACTS.length) { save.unlockedActs = r.act + 2; out.unlocks.push({ kind: 'act', id: r.act + 1 }); }
          if (r.act === ACTS.length - 1) {
            if (!save.ngUnlocked) out.unlocks.push({ kind: 'ng' });
            save.ngUnlocked = true; if (out.firstClear) save.ngCompletions = Math.max(save.ngCompletions, (r.ng || 0) + 1);
          }
        }
      } else {
        out.coins = Math.round(base * 0.25 / 5) * 5; out.xp = 20 * act.diff; save.stats.losses++;
      }
    } else {
      out.coins = r.survivalCoins; out.gems = r.survivalGems; out.xp = 40 * r.waves;
      out.rating = r.waves >= 15 ? 'S' : r.waves >= 10 ? 'A' : r.waves >= 5 ? 'B' : 'C';
      out.newBest = r.waves > save.survivalBest;
      if (out.newBest) save.survivalBest = r.waves;
      out.seals = [r.waves >= 5, r.waves >= 10, r.waves >= 15];
      save.stats.wins += r.waves; save.stats.losses++;
    }
    save.coins += out.coins; save.gems += out.gems; save.xp += out.xp;
    out.levelBefore = save.level; out.xpBefore = save.xp - out.xp;
    while (save.xp >= xpForLevel(save.level)) { save.xp -= xpForLevel(save.level); save.level++; out.levelUps++; }
    SaveManager.save();
    this.lastResult = out;
    this.session = null;
    UIManager.go('result', () => UIManager.showResult(out));
  },
  rate(r) {
    if (!r.win) return 'C';
    let s = r.hpLeft * 40 + (r.time < 45 ? 20 : r.time < 80 ? 10 : 0) + Math.min(20, r.maxCombo * 2) + r.parries * 5 + (r.flawless ? 20 : 0);
    return s >= 85 ? 'S' : s >= 62 ? 'A' : s >= 42 ? 'B' : 'C';
  },
  nextStage() {
    const save = SaveManager.data;
    for (let a = 0; a < ACTS.length; a++) {
      if (a >= save.unlockedActs) break;
      for (let s = 0; s < ACTS[a].stages.length; s++) if (!save.cleared[`${a}-${s}`]) return { act: a, stage: s };
    }
    return null;
  },
  stageUnlocked(a, s) {
    const save = SaveManager.data;
    if (a >= save.unlockedActs) return false;
    if (s === 0) return true;
    return !!save.cleared[`${a}-${s - 1}`] || !!save.cleared[`${a}-${s}`];
  },
  startNewGamePlus() {
    const save = SaveManager.data;
    if (!save.ngUnlocked) return false;
    save.ng = (save.ng || 0) + 1; save.cleared = {}; save.unlockedActs = 1;
    SaveManager.save();
    return true;
  }
};
