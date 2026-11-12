/* KAGE — GameEngine: fixed-timestep loop, FightSession (rounds, intros, KO, Echo Trials waves) and progression */

const HOLLOW_DISSOLVE = 0.75;   // seconds a beaten Hollow takes to come apart into memory ash
const BOSS_DISSOLVE = 1.8;      // ... and a story boss after his defeat scene (the 'finisher' outcome)
const BOSS_ESCAPE = 0.7;        // seconds an escaping boss takes to fade out in his smoke
const BOSS_REABSORB = 3.0;      // seconds the Witness takes to come apart while its light flows into Kage

class FightSession {
  constructor(cfg) {
    const save = SaveManager.data;
    this.cfg = cfg; this.mode = cfg.mode;
    this.fx = new Effects(); this.projectiles = []; this.pickups = []; this.fighters = [];
    this.time = 0; this.bounds = { l: -820, r: 820 };
    this.cam = { x: 0, y: 0, zoom: 1.05 };
    this.env = getEnv(cfg.env);
    this.history = []; this.letterbox = 1; this.fightFlash = 0;
    this.actions = []; this.spamCd = 0; this.spamTaught = false;   // the spam read (SPAM_READ, onPlayerAction)
    // the player's moves with whether each landed (Mugen no Ha's Echo Replication rage art reads it), the Memory Break in
    // progress (the Witness's Reality Rewrite), and the Witness's own fight state (69-witness.js, WitnessBoss.init)
    this.hitLog = []; this.memBreak = null; this.memBreakN = 0; this.wit = null;
    this.rounds = { p: 0, e: 0, n: 0 };
    this.wave = cfg.wave || 1; this.trialCoins = 0; this.trialGems = 0; this.wavesCleared = 0;
    this.dialogue = null; this.combo = 0; this.comboT = 0; this.damageTaken = 0; this.fightTime = 0;
    // the Interlude spar (Logic.fightFormat 'spar'): young Kage instead of the geared player, drawn as a memory
    this.spar = !cfg.stretch && (cfg.format || Logic.fightFormat(cfg)).name === 'spar';
    this.memory = this.spar;
    this.player = this.makePlayer(save);
    // Boss Rush: the health the last fight left, plus the partial restore (Logic.bossRushCarryHp)
    if (cfg.carryHp != null) this.player.hp = clamp(Math.round(cfg.carryHp), 1, this.player.maxHp);
    this.setup();
  }
  // The single-screen arena: one main foe, rounds, a round timer and the intro duel. StretchSession overrides this.
  setup() {
    const cfg = this.cfg;
    // Echo Trials: the wave's contents come from Logic.echoTrialWave (its leader, escorts, boss echo and arena)
    const tw = this.mode === 'trials' ? this.trialWave(this.wave) : null;
    this.enemy = this.makeEnemy(tw ? tw.foes[0] : cfg.enemyId, 300, null, tw && tw.elite ? 'elite' : null);
    // campaign stages fight a placeholder rig under the stage's story name (Raikon, Hollow Rem, ...)
    if (cfg.foeName) this.enemy.name = cfg.foeName;
    if (cfg.foeTitle) this.enemy.title = cfg.foeTitle;
    this.fighters = [this.player, this.enemy];
    if (tw) this.spawnEscorts(tw, 1);
    this.isBoss = this.enemy.def.type === 'boss';
    this.isSub = this.enemy.def.type === 'sub';
    // the fight format (Logic.fightFormat): story bosses are one round, one health bar, three phases and no clock
    this.format = tw ? this.trialFormat(tw) : cfg.format || Logic.fightFormat(cfg);
    this.bossFormat = this.format.name === 'boss';
    this.roundsToWin = this.format.roundsToWin;
    this.timer = this.roundTime();
    this.phase = 'intro'; this.phaseT = 0;
    StormDirector.setup(this);   // sub-boss and Raikon fights: the red-lightning storm (36-storm.js)
    this.setupIntro();
  }
  // 0 = no round clock (story bosses): the fight can never be lost on time
  roundTime() { return (this.format && this.format.timer) || 0; }

  makePlayer(save) {
    if (this.spar) {
      // young Kage: fixed health and a bokken, none of the player's gear, level or perks (Logic.youngKage)
      const k = Logic.youngKage(save);
      const y = makeYoungKage({ x: -300, team: 0, hp: k.hp, defense: k.defense, dmgMul: k.dmgMul, ammo: 0, dodgeMul: Logic.difficulty(save.difficulty).dodge });
      y.name = 'Kage';
      return y;
    }
    const g = Logic.playerCombatStats(save), pk = g.perks;
    const f = makePlayerFighter(save, {
      x: -300, team: 0, hp: g.hp, defense: g.defense, speedMul: 1 + (pk.speed || 0), rageMul: 1 + (pk.rage || 0),
      stunRes: pk.stunRes || 0, dashBonus: pk.dash || 0, ammo: 5 + (pk.ammo || 0), kunaiMul: 1 + (pk.kunai || 0), blockRage: pk.blockRage || 0,
      dmgMul: (1 + 0.012 * (save.level - 1)) * (1 + (pk.dmg || 0)),
      dodgeMul: Logic.difficulty(save.difficulty).dodge   // Easy widens the dash i-frames
    });
    f.name = 'Kage';
    return f;
  }
  // ---- Echo Trials ----
  // Wave n's contents (Logic.echoTrialWave): sets the arena (a glitch when it shifts to a new remembered place) and
  // names a boss echo after its story stage.
  trialWave(n) {
    const w = this.trial = Logic.echoTrialWave(SaveManager.data, n);
    if (w.env !== this.envId) {
      if (this.envId) { this.glitch = TRIALS.glitch; AudioManager.play('teleport', { pitch: 0.6 }); this.fx.shake(0.3); }
      this.envId = w.env; this.env = getEnv(w.env);
    }
    return w;
  }
  // A wave's format (Logic.fightFormat): Hollow waves run on the trials clock, a boss echo has none
  trialFormat(w) { return Logic.fightFormat(Object.assign({}, this.cfg, { bossEcho: w.bossEcho })); }
  // The wave's other Hollows: they fight beside the leader with their own small bars (`escort`); the wave is cleared
  // when the last of them is down (see onKO).
  spawnEscorts(w, side) {
    const lead = this.enemy;
    w.foes.slice(1).forEach((id, i) => {
      const x = clamp(lead.x + side * (i % 2 ? 1 : -1) * (130 + 70 * i), this.bounds.l + 40, this.bounds.r - 40);
      const f = this.makeEnemy(id, x, null, w.elite ? 'elite' : null);
      f.minion = true; f.escort = true; f.facing = this.player.x > x ? 1 : -1;
      this.fighters.push(f);
    });
  }
  trialBanner() {
    const w = this.trial, e = this.enemy;
    const sub = w.bossEcho ? `Boss echo · ${e.name}` : w.elite ? `Elite Hollows · ${e.name}` : w.foes.length > 1 ? `${w.foes.length} Hollows · ${TRIALS.envNames[w.env] || ''}` : `${e.name} · ${TRIALS.envNames[w.env] || ''}`;
    this.fx.banner(`Wave ${this.wave}`, sub, w.bossEcho ? ECHO_TINT : w.elite ? C.emberBright : C.gold);
  }
  // The authored challenge curve (chapter tier, stage position, Echo Trials wave); see Logic.stageLevel.
  difficultyLevel(d) { return Logic.stageLevel(this.cfg, d.id, this.wave); }
  // Every foe (campaign, Echo Trials waves, boss minions and clones) is built here from Logic.enemyStats: the chosen
  // difficulty mode and the authored curve only, never the player's level. role: null | 'minion' | 'clone'.
  makeEnemy(id, x, extra, role) {
    const st = this.enemyStats(id, role);
    const f = makeFighterFromEnemy(id, Object.assign({ x, team: 1, hp: st.hp, dmgMul: st.dmgMul, wlvl: st.wlvl, defense: st.defense, speedMul: st.speedMul }, extra || {}));
    f.baseSpeed = f.speedMul; f.role = role || null;
    f.ai = new AIController(f, this, { level: st.level, ng: st.ng, difficulty: st.difficulty, role });
    f.windupMul = f.ai.p.windup; f.recoveryMul = f.ai.p.recovery;
    Budo.join(f, this);   // its fighting style's own posture and set-up (13-budo.js)
    return f;
  }
  enemyStats(id, role) { return Logic.enemyStats(SaveManager.data, this.cfg, id, { wave: this.wave, role }); }
  // The player changed the mode mid-fight (pause menu): re-tune every foe in place, keeping its health fraction.
  applyDifficulty() {
    const mode = Logic.difficulty(SaveManager.data.difficulty);
    this.player.dodgeMul = mode.dodge;
    for (const f of this.fighters) {
      if (!f.ai || !f.def) continue;
      const st = this.enemyStats(f.def.id, f.role), k = f.maxHp > 0 ? f.hp / f.maxHp : 1;
      f.maxHp = st.hp; f.hp = f.alive ? Math.max(1, Math.round(st.hp * k)) : 0; f.dmgMul = st.dmgMul;
      f.ai.retune({ level: st.level, ng: st.ng, difficulty: st.difficulty, role: f.role });
      f.windupMul = f.ai.p.windup; f.recoveryMul = f.ai.p.recovery;
    }
  }

  setupIntro() {
    const e = this.enemy, p = this.player;
    p.state = 'pose'; p.poseName = null;
    e.state = 'pose'; e.poseName = 'taunt';
    this.letterbox = 1;
    if (this.isBoss) { e.y = -720; e.grounded = false; e.state = 'air'; }
    else if (this.isSub) { e.x = 760; e.vx = 0; }
    this.cam.x = e.x - 80; this.cam.zoom = 1.3;
    if (this.mode === 'trials') { this.nameBossEcho(); this.trialBanner(); }
  }
  // Boss Rush: where this fight sits in the run (cfg.rush from Game.bossRushFight)
  rushLabel() { const r = this.cfg.rush; return r ? `Boss ${r.index + 1} / ${r.total}` : ''; }

  // ---- world interface used by fighters / combat / AI ----
  opponentOf(f) {
    if (f.team === 0) { let best = null, bd = 1e9; for (const o of this.fighters) if (o.team !== 0 && o.alive && o.visible) { const d = Math.abs(o.x - f.x) + (o === this.enemy ? -80 : 0); if (d < bd) { bd = d; best = o; } } return best || this.enemy; }
    return this.player;
  }
  nearestEnemy(f) { return this.opponentOf(f); }
  spawnProjectile(type, f) { return WeaponSystem.spawn(this, type, f, { dmgMul: 1 }); }
  spawnShock(f, m) { WeaponSystem.spawn(this, 'shock', f, { dmgMul: (f.isPlayer ? weaponMul(f.weaponId(), f.wlvl).dmg : 1) * (m.dmg > 30 ? 1.3 : 1) }); AudioManager.play('slam'); this.fx.dust(f.x + f.facing * 90, 0, 14); this.fx.shake(0.4); }
  dropWeapon(f) { WeaponSystem.drop(this, f); }
  applyThrow(att, v) { Combat.applyThrow(this, att, v); }
  wallBounce(f) {
    f.vx = -f.vx * 0.55; f.vy = Math.min(f.vy, -420);
    this.fx.dust(f.x, f.y, 10); this.fx.shake(0.45); this.fx.stamp('WALL', f.x, f.y - 100, 2); AudioManager.play('heavy');
  }
  // how much of the player's recent string is this one move (Logic.predictability; Takashi's Guard Return reads it)
  predictability(id) { return Logic.predictability(this.history, id); }
  /* The spam read (SPAM_READ in 10-data.js): every attack, dash and jump Kage starts is logged under its input key
     (Logic.spamKey). When the newest one completes a spam streak (Logic.spamRead), the nearest foe able to react reads
     it and punishes (AIController.spamPunish); the log then starts over. Every foe reads, not only bosses: regular
     enemies, sub-bosses and bosses, each with its own chance (SPAM_READ.chance by role) and cool-down. */
  onPlayerAction(f, key) {
    if (!f.isPlayer || !key) return;
    this.actions.push({ k: key, t: this.time }); if (this.actions.length > 16) this.actions.shift();
    WitnessBoss.track(this, key);   // the Witness's AdaptiveTracker (69-witness.js)
    if (this.phase !== 'fight' || this.time < this.spamCd) return;
    const w = f.weapon(), read = Logic.spamRead(this.actions, this.time, (w.moves || []).length);
    if (!read) return;
    let best = null, bd = SPAM_READ.range;
    for (const e of this.fighters) {
      if (!e.ai || e.team === f.team || !e.alive || !e.visible || e.clone || e.decoy) continue;
      const d = Math.abs(e.x - f.x);
      if (d < bd && e.ai.canReadSpam()) { bd = d; best = e; }
    }
    if (best && best.ai.spamPunish(f, read)) { this.actions.length = 0; this.spamCd = this.time + SPAM_READ.sessionCd; }
  }
  // the first punish of a fight explains itself once
  onSpamPunish(att, def) {
    if (!def.isPlayer || this.spamTaught) return;
    this.spamTaught = true;
    this.fx.popText(def, 'SPAM READ: MIX W / A / S / D + ATTACK', C.gold);
  }
  onMoveStart(f, m) {
    if (!f.isPlayer) return;
    this.onPlayerAction(f, Logic.spamKey(m));
    this.history.push(m.id); if (this.history.length > 12) this.history.shift();
    this.hitLog.push({ id: m.id, t: this.time, hit: false }); if (this.hitLog.length > 24) this.hitLog.shift();
    const h = this.history, L = h.length;
    if (L >= 3 && h[L - 1] === h[L - 2] && h[L - 2] === h[L - 3]) {
      // sub-bosses and bosses read a move thrown three times running (BUDO.adapt), as any foe with `adapts` does
      for (const e of this.fighters) if (e.ai && e.def && (e.def.adapts || BUDO.adapt[Budo.role(e)]) && e.alive && e.ai.adapted !== m.id) { e.ai.adapted = m.id; e.ai.adaptT = 8; this.fx.popText(e, 'He reads you', '#7fd0c8'); }
    }
  }
  onSpecial(f) { this.fx.slowmo(0.55, 0.35); this.fx.punch(0.05); }
  onHit(att, def, dmg) {
    // the blow that landed marks its move in the hit log: `hit` on the boss,
    // `landed` on any foe (Kage's own Echo Replication rage art, Mugen no Ha, replays those)
    if (att.isPlayer && att.move && def.team !== att.team) { for (let i = this.hitLog.length - 1; i >= 0; i--) if (this.hitLog[i].id === att.move.id) { this.hitLog[i].landed = true; if (def === this.enemy) this.hitLog[i].hit = true; break; } }
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
    TakashiBoss.onHit(this, att, def, dmg);   // blows during his domain's channel count toward breaking it
    WitnessBoss.onHit(this, att, def, dmg);   // blows on the Witness while its tether drains Kage break it
  }
  onParry(def) { if (def.isPlayer) AudioManager.play('coin', { pitch: 1.4 }); }
  onBossPhase(f, idx, ph) {
    // the Witness announces its phases its own way (its banner, its lines, the halo and the arena: 69-witness.js)
    if (WitnessBoss.is(f)) { WitnessBoss.phase(this, f, idx, ph); this.cine = { t: 1.2, target: f }; return; }   // its impact and banner come after the dialogue
    this.fx.banner(`Phase ${ROMAN[idx]}`, ph.name, f.accent || C.emberBright);
    this.fx.impactFrame(f.x, f.y - 100, 3); this.fx.shake(0.6);
    this.cine = { t: 1.2, target: f }; this.fx.elemImpact(f.elementOf(null) || 'ink', f.x, f.y - 100 * f.scale, f.facing, 3, true);
    this.fx.ring(f.x, f.y - 100, 380, AkariSakura.is(f) ? '#ff66b2' : f.accent || C.emberBright, 0.7, 10);
    if (ph.berserk) { f.eye = '#8be07a'; }
    StormDirector.phase(this, f, idx);
    TakashiBoss.phase(this, f, idx, ph);
  }
  // Akari's False Opening: an afterimage of her stands where she was, guard down, at reduced opacity (o.opacity) with
  // o.afterimages offset echoes, for o.hold seconds. It has no AI and no eyes; any blow passes through it (Combat.applyHit
  // -> strikeDecoy) and it vanishes. `decoy` points at its owner, whose ability hears about the strike (onDecoy).
  spawnDecoy(owner, o) {
    const c = this.makeEnemy(owner.def.id, owner.x, { clone: true, facing: owner.facing }, 'clone');
    c.clone = true; c.decoy = owner; c.ai = null; c.alpha = o.opacity; c.eye = 'rgba(0,0,0,0)'; c.life = o.hold; c.echoes = o.afterimages;
    c.hp = c.maxHp = 1; c.y = owner.y; c.grounded = owner.grounded;
    Object.assign(c.pose, owner.pose); c.computeSkeleton();
    c.startAbility({ dur: o.hold + 10, rate: 10, pose: AKARI_POSE.open,
      update(c, w, t) { if (((t * 60) | 0) % 7 === 0) for (let i = 0; i < c.echoes; i++) w.fx.afterimage(c, AkariSakura.ghost(c.decoy, 0.28, 'rgba(180,140,240,0.28)'), { dur: 0.2, dx: (i ? -1 : 1) * (14 + 4 * Math.sin(t * 9)) }); } });
    this.fighters.push(c);
    return c;
  }
  // The afterimage comes apart: a few violet flakes and two pale echoes scattering (no big smoke)
  vanishDecoy(c) {
    if (!c.alive) return;
    c.alive = false; c.visible = false; c.abil = null;
    if (!AkariSakura.decoyVanish(this, c)) {
      this.fx.memoryAsh(c, 14, true);
      this.fx.afterimage(c, 'rgba(236,229,211,0.4)', { dur: 0.25, dx: 22 }); this.fx.afterimage(c, 'rgba(180,140,240,0.4)', { dur: 0.25, dx: -22 });
    }
    AudioManager.play('smoke', { pitch: 1.6 });
  }
  strikeDecoy(c, att) {
    if (!c.alive) return;
    this.fx.popText(c, 'AFTERIMAGE', '#c9a8ff');
    this.vanishDecoy(c);
    const o = c.decoy; if (o && o.abil && o.abil.onDecoy) o.abil.onDecoy(o, this, att);
  }
  spawnClones(owner, n) {
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const c = this.makeEnemy(owner.def.id, clamp(this.player.x + side * rand(260, 380), this.bounds.l + 40, this.bounds.r - 40), { clone: true }, 'clone');
      c.clone = true; c.alpha = 0.72; c.eye = 'rgba(0,0,0,0)';
      c.ai.phases = null; c.ai.abilities = []; c.life = 9;
      this.fighters.push(c); this.smokeCloud(c.x);
    }
  }
  spawnMinions(owner, n) {
    for (let i = 0; i < n; i++) {
      const x = i % 2 ? this.bounds.r - 30 : this.bounds.l + 30;
      const m = this.makeEnemy(Logic.minionId(this.cfg), x, { build: { scale: 0.88, w: 10 } }, 'minion');
      m.minion = true;
      this.fighters.push(m); this.fx.embers(x, -60, 20);
    }
  }
  /* ---- the Witness (69-witness.js) ---- */
  // Memory Break (the Witness's Reality Rewrite): for `m.dur` seconds the arena is a remembered place (Logic.memoryBreakEnv,
  // in turn), seen through the memory filter, with a flat glitch (`m.glitch` seconds) as it shifts in and again as it
  // snaps back.
  memoryBreak(owner, m) {
    if (this.memBreak) return;
    const id = Logic.memoryBreakEnv(this.memBreakN++);
    this.memBreak = { base: this.env, baseMemory: this.memory, t: 0, dur: m.dur, glitch: m.glitch, id };
    this.env = getEnv(id); this.memory = true; this.glitch = m.glitch;
    this.fx.banner('Memory Break', MEMORY_BREAK.names[id] || id, WITNESS_TINT);
    this.fx.shake(0.4); AudioManager.play('teleport', { pitch: 0.5 });
  }
  stepMemoryBreak(dt) {
    if (this.glitch > 0 && !this.isStretch) this.glitch = Math.max(0, this.glitch - dt);
    const mb = this.memBreak; if (!mb) return;
    mb.t += dt;
    if (mb.t >= mb.dur || this.phase === 'outro' || this.phase === 'done') this.endMemoryBreak();
  }
  endMemoryBreak() {
    const mb = this.memBreak; if (!mb) return;
    this.env = mb.base; this.memory = mb.baseMemory; this.glitch = mb.glitch; this.memBreak = null;
    AudioManager.play('teleport', { pitch: 0.7 });
  }
  // A beaten Hollow never ragdolls: it freezes on its last frame, glitches, and comes apart into violet memory ash
  // (a flat particle burst, then a trickle while it fades). stepDissolve runs it; the fighter is dropped when gone.
  dissolve(f) {
    if (f.dissolve) return;
    f.dissolve = 0.001; f.vx = f.vy = 0; f.move = null; f.abil = null; f.bodyRotVel = 0;
    if (!f.fadeOnly) this.fx.memoryAsh(f, f.dissolveDur ? 60 : 32, true);
    AudioManager.play('smoke');
  }
  stepDissolve(f, dt) {
    f.dissolve += dt; f.time += dt;
    const k = Math.min(1, f.dissolve / (f.dissolveDur || HOLLOW_DISSOLVE));
    f.alpha = 1 - k * k;
    if (!f.fadeOnly) { f.sqx = 1 + 0.12 * k; f.sqy = 1 - 0.18 * k; }
    if (k < 1 && !f.fadeOnly && !(f.reabsorb && f.dissolve < 0.5)) this.fx.memoryAsh(f, f.dissolveDur ? 2 : 1);
    if (f.reabsorb) this.stepReabsorb(f, k);
    if (k >= 1) { f.visible = false; f.alpha = 0; }
  }
  /* The Witness's reabsorb (defeat 'reabsorb', after its defeat scene): its chest core shatters into flat shards, violet
     and white light streams flow out of it into Kage's chest, Kage glows, and the Witness's fragments come apart into
     memory ash. stepDissolve calls this each tick with k = 0..1 over BOSS_REABSORB. */
  stepReabsorb(f, k) {
    const p = this.player, s = f.scale, cx = f.sk.neck.x * 0.6 + f.sk.hip.x * 0.4, cy = f.sk.neck.y * 0.6 + f.sk.hip.y * 0.4;
    if (!f.coreBroken) {
      f.coreBroken = true;
      this.fx.coreShatter(cx, cy, 1.2 * s); this.fx.impactFrame(cx, cy, 3); this.fx.shake(0.8); this.fx.punch(0.08);
      this.fx.ring(cx, cy, 260, '#ffffff', 0.5, 6); this.fx.ring(cx, cy, 380, WITNESS_TINT, 0.7, 8);
      this.fx.slowmo(0.4, 0.5); AudioManager.play('clang', { pitch: 0.6 }); AudioManager.play('boss');
    }
    // the light streams: a new ribbon every few ticks, alternating violet and white, from the body into Kage's chest
    if (k < 0.8 && ((f.dissolve * 60) | 0) % 4 === 0) {
      this.fx.lightStream(cx + rand(-26, 26) * s, cy + rand(-70, 70) * s, p, ((f.dissolve * 15) | 0) % 2 ? '#ffffff' : '#7c8cff');
    }
    p.glow = Math.max(p.glow || 0, k < 0.85 ? 0.6 : 0);
    if (k > 0.25 && k < 0.85 && ((f.dissolve * 60) | 0) % 18 === 0) p.flash = 0.06;   // Kage pulses with the light he takes in
  }
  smokeCloud(x, big) { this.fx.smoke(x, 0, big ? 18 : 12, big); AudioManager.play('smoke'); }

  onKO(def, att) {
    const fx = this.fx;
    if (def.hollow) this.dissolve(def);
    if (def.clone) { def.visible = false; if (AkariSakura.cloneBreak(this, def)) AudioManager.play('smoke'); else this.smokeCloud(def.x); this.fighters.splice(this.fighters.indexOf(def), 1); return; }
    if (def.minion) { if (!def.hollow) fx.embers(def.x, -60, 16); return; }
    // Echo Trials: while the wave still has Hollows standing, the next one takes the lead (and the HUD bar)
    if (def === this.enemy && this.mode === 'trials' && this.phase === 'fight') {
      const next = this.fighters.find(f => f.escort && f.alive);
      if (next) { next.minion = false; next.escort = false; this.enemy = next; fx.stamp('FINISH', def.x, def.y - 120, 2, C.emberBright); return; }
    }
    if (this.phase !== 'fight') return;
    const main = def === this.player || def === this.enemy;
    if (!main) return;
    fx.slowmo(0.22, 1.15); fx.impactFrame(def.x, def.y - 100 * def.scale, 3); fx.shake(0.9); fx.punch(0.12);
    fx.stamp(def === this.player ? 'FALLEN' : 'FINISH', def.x, def.y - 120, 3, def === this.player ? C.ember : C.emberBright);
    // a story boss that escapes ('escape') gets no killing blow: he drops to one knee where he stands
    const escapes = def === this.enemy && this.bossFormat && this.format.defeat === 'escape';
    if (escapes) { def.setState('pose'); def.poseName = 'kneel'; def.vx = def.vy = 0; def.bodyRotVel = 0; def.bodyRot = 0; def.y = 0; def.grounded = true; }
    else if (def !== this.player) { fx.finisher(def.x, def.y - 100 * def.scale, att.facing); const el = att.elementOf(null); if (el) fx.elemImpact(el, def.x, def.y - 100 * def.scale, att.facing, 3, true); }
    AudioManager.play('ko');
    StormDirector.ko(this, def);
    this.koTarget = def; this.phase = 'ko'; this.phaseT = 0;
    for (const f of this.fighters) if (f.decoy && f.alive) this.vanishDecoy(f);
    for (const f of this.fighters) if ((f.clone || f.minion) && f.alive) { f.alive = false; f.hp = 0; f.setState('juggle'); f.vy = -300; if (f.clone) { f.visible = false; this.smokeCloud(f.x); } else if (f.hollow) this.dissolve(f); }
    if (def === this.player) this.rounds.e++; else { this.rounds.p++; if (this.mode === 'trials') this.waveCleared(); }
    WitnessBoss.onKO(this, def);   // the Witness falls: the arena goes quiet, its last line, the Echo System breaking
  }
  // a boss echo fights under its story name, as an echo of that memory
  nameBossEcho() {
    const b = this.trial && this.trial.bossEcho; if (!b) return;
    this.enemy.name = b.name; this.enemy.title = `Echo of ${b.kind === 'subboss' ? 'a sub-boss' : b.kind === 'echo' ? 'the Core' : 'a boss'}`;
  }
  waveCleared() {
    const { coins, gems } = Logic.trialWaveReward(this.wave);
    this.trialCoins += coins; this.wavesCleared = this.wave;
    this.trialGems += gems;
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
      f.dissolve = 0; f.sqx = f.sqy = 1;
      f.setState('idle'); f.comboHits = 0;
    }
    p.x = -300; this.enemy.x = 300; p.facing = 1; this.enemy.facing = -1;
    if (this.enemy.ai) { this.enemy.ai.seq = null; this.enemy.ai.block = 0; this.enemy.ai.phase = 0; }
    this.timer = this.roundTime();
  }

  nextWave() {
    this.wave++;
    const p = this.player;
    p.hp = Math.min(p.maxHp, p.hp + p.maxHp * TRIALS.heal); p.ammo = p.maxAmmo; p.hasWeapon = true; p.poison = 0;
    this.projectiles.length = 0; this.pickups.length = 0;
    this.endMemoryBreak();
    const w = this.trialWave(this.wave);
    const side = p.x > 0 ? -1 : 1;
    this.enemy = this.makeEnemy(w.foes[0], clamp(p.x + side * 620, this.bounds.l + 40, this.bounds.r - 40), null, w.elite ? 'elite' : null);
    this.enemy.facing = -side;
    this.fighters = [p, this.enemy];
    this.spawnEscorts(w, side);
    this.nameBossEcho();
    if (w.bossEcho) { this.fx.memoryAsh(this.enemy, 24, true); AudioManager.play('boss'); }
    this.format = this.trialFormat(w);
    this.timer = this.roundTime();
    this.trialBanner();
    AudioManager.play('round');
    this.phase = 'round'; this.phaseT = 0.4;
  }

  // ---- main simulation tick ----
  // render interpolation: remember the previous tick, draw in between ticks, then put the simulation state back
  snapPrev() {
    for (const f of this.fighters) f.snapPrev();
    const c = this.cam; this._pc = this._pc || {}; this._pc.x = c.x; this._pc.y = c.y; this._pc.zoom = c.zoom; this._pcOk = true;
  }
  beginRender(alpha) {
    this._interp = this._interp || []; this._interp.length = 0;
    for (const f of this.fighters) if (f.beginInterp(alpha)) this._interp.push(f);
    const c = this.cam, p = this._pc;
    this._cc = this._cc || {}; this._cc.x = c.x; this._cc.y = c.y; this._cc.zoom = c.zoom;
    if (this._pcOk) { c.x = lerp(p.x, c.x, alpha); c.y = lerp(p.y, c.y, alpha); c.zoom = lerp(p.zoom, c.zoom, alpha); }
  }
  endRender() {
    for (const f of this._interp) f.endInterp();
    this._interp.length = 0;
    const c = this.cam; c.x = this._cc.x; c.y = this._cc.y; c.zoom = this._cc.zoom;
  }
  step(dt) {
    this.snapPrev();
    this.time += dt; this.phaseT += dt;
    const p = this.player, e = this.enemy;
    this.stepPhase(dt, p, e);
    this.simulate(dt, p, e);
  }
  // The arena's flow: intro, round banners, the fight with its timer, KO and outro.
  stepPhase(dt, p, e) {
    switch (this.phase) {
      case 'intro': {
        const dur = this.isBoss ? 3.6 : this.isSub ? 3.0 : 2.4;
        if (this.isSub && this.phaseT < 0.5) { e.x = lerp(760, 300, Ease.outCubic(this.phaseT / 0.5)); if (((this.phaseT * 60) | 0) % 3 === 0) this.fx.afterimage(e); }
        if (this.isBoss && e.grounded && !this.bossLanded) {
          this.bossLanded = true; e.state = 'pose'; e.poseName = 'taunt';
          this.fx.shake(0.9); this.fx.dust(e.x, 0, 30); this.fx.ring(e.x, -20, 300, e.accent || C.emberBright, 0.6, 8); AudioManager.play('slam'); AudioManager.play('boss');
          this.fx.impactFrame(e.x, -120, 3);
        }
        StormDirector.intro(this, e);
        if (this.phaseT > 0.5 && !this.dialogue && this.mode !== 'trials') {
          this.dialogue = { id: e.def.id, name: e.name, title: e.title, text: e.def.taunt, t: 0 };
          if (this.isBoss || this.isSub) { const sty = Budo.style(e); this.fx.banner(e.name, sty && sty.art ? `${e.title} · ${sty.art}` : e.title, e.accent || C.emberBright); }   // its school (FIGHT_STYLES art)
        }
        const skip = this.phaseT > 0.6 && (InputManager.pressed('punch') || InputManager.pressed('jump') || InputManager.pressed('weapon') || UIManager.skipRequested());
        if (this.phaseT > dur || skip) { this.dialogue = null; this.phase = 'round'; this.phaseT = 0; e.state = 'idle'; p.state = 'idle'; if (this.isBoss && !e.grounded) { e.y = 0; e.grounded = true; } }
        break;
      }
      case 'round':
        if (this.phaseT < 0.05 && !this.roundShown) {
          this.roundShown = true; this.rounds.n++;
          if (this.spar) this.fx.banner('Sparring Match', "A memory · Takashi's yard", C.gold);
          else if (this.mode === 'bossrush') this.fx.banner(`Boss Rush · ${this.rushLabel()}`, `${e.name} · ${Logic.difficulty(SaveManager.data.difficulty).label}`, C.gold);
          else if (this.mode !== 'trials') this.fx.banner(this.roundsToWin > 1 ? `Round ${ROMAN[this.rounds.n - 1]}` : 'Final Duel', this.bossFormat ? `One life · ${['one phase', 'two phases', 'three phases'][this.format.phases - 1] || this.format.phases + ' phases'} · ${Logic.difficulty(SaveManager.data.difficulty).label}` : `${e.name} · ${DIFF_LABEL[clamp((this.cfg.diff || 1) + (this.cfg.ng || 0), 0, 4)]} · ${Logic.difficulty(SaveManager.data.difficulty).label}`, C.gold);
          AudioManager.play('round');
        }
        if (this.phaseT > 1.25 && !this.fightShown) { this.fightShown = true; this.fx.stamp('FIGHT', (p.x + e.x) / 2, -150, 3, C.emberBright); this.fightFlash = 1; }
        if (this.phaseT > 1.6) { this.phase = 'fight'; this.phaseT = 0; this.roundShown = false; this.fightShown = false; }
        break;
      case 'fight':
        this.fightTime += dt;
        if (this.format.timer) this.timer -= dt;
        // the spar never times out or ends in a KO: Takashi calls the boys in (Logic.sparOutcome)
        if (this.spar) { if (Logic.sparOutcome(this.format, { playerHp: p.hp / p.maxHp, foeHp: e.hp / e.maxHp, time: this.fightTime })) this.interrupt(); }
        else if (this.format.timer && this.timer <= 0) this.timeOut();
        break;
      case 'interrupt':
        // everyone stops where they stand; once both are down on their feet they drop their guard and face each other
        for (const f of [p, e]) if (f.grounded && f.state !== 'pose' && f.state !== 'down' && f.state !== 'getup' && this.phaseT > 0.5) { f.endMove(); f.abil = null; f.vx = 0; f.setState('pose'); f.poseName = null; f.faceToward(f === p ? e : p, 1); }
        if (this.phaseT > 3.4 || (this.phaseT > 1.2 && (InputManager.pressed('punch') || InputManager.pressed('jump') || UIManager.skipRequested()))) { this.phase = 'done'; Game.finishFight(this.buildResult()); }
        break;
      case 'ko':
        if (this.phaseT > 2.2) this.afterKO();
        break;
      case 'outro':
        if (this.phaseT > 3.2 || (this.phaseT > 0.8 && (InputManager.pressed('punch') || InputManager.pressed('jump') || UIManager.skipRequested()))) { this.phase = 'done'; Game.finishFight(this.buildResult()); }
        break;
    }
  }
  // Everything both modes share each tick: controls, AI, fighters, hits, projectiles, separation and the camera.
  simulate(dt, p, e) {
    if (this.cine) { this.cine.t -= dt; if (this.cine.t <= 0) this.cine = null; }
    this.letterbox = damp(this.letterbox, this.phase === 'intro' || this.phase === 'outro' || this.phase === 'interrupt' || this.cine || (this.rart && this.rart.cine) ? 1 : 0, 6, dt);
    this.fightFlash = Math.max(0, this.fightFlash - dt * 3);
    if (this.dialogue) this.dialogue.t += dt;
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.combo = 0; }

    // controls
    if (this.phase === 'fight') InputManager.readCtrl(p.ctrl); else clearCtrlEdges(p.ctrl), p.ctrl.dir = 0, p.ctrl.blockHeld = false, p.ctrl.kickHeld = false;
    WitnessBoss.input(this, p.ctrl, dt);   // the Witness's InputModifierLayer over the controls just read (69-witness.js)
    // a rage art's anticipation holds the world still round Kage (67-rage-arts.js): no other fighter acts or moves
    // ... and the Witness holds Kage still while Echo Genesis opens (69-witness.js)
    const hold = RageArts.holding(this), held = (f) => (hold && f !== hold && f.team !== hold.team) || WitnessBoss.holds(this, f);
    for (const f of this.fighters) if (f.ai) { if (this.phase === 'fight' && !held(f)) f.ai.update(dt); else { clearCtrlEdges(f.ctrl); f.ctrl.dir = 0; f.ctrl.blockHeld = false; f.ctrl.kickHeld = false; } if (f.ai.adaptT > 0) { f.ai.adaptT -= dt; if (f.ai.adaptT <= 0) f.ai.adapted = null; } }
    // auras / barriers / clone lifetime
    p.slow = 1;
    for (const f of this.fighters) {
      if (f.barrier > 0) f.barrier -= dt;
      if (f.aura > 0) { f.aura -= dt; if (Math.abs(p.x - f.x) < 330 && f.alive) p.slow = 0.68; }
      if (f.clone && f.alive) { f.life -= dt; if (f.life <= 0) { if (f.decoy) this.vanishDecoy(f); else { f.alive = false; f.visible = false; if (AkariSakura.cloneBreak(this, f)) AudioManager.play('smoke'); else this.smokeCloud(f.x); } } }
    }
    this.stepMemoryBreak(dt);
    this.stepHazards(dt); this.stepAkariPresence();   // Akari's storms, mist, traps, tornadoes and petals (62-akari-hazards.js)
    TakashiBoss.step(this, dt);   // Takashi's guard, size, the Yashiro Titan and his domain (66-takashi.js)
    WitnessBoss.step(this, dt);   // the Witness's phases, hazards, domain, HUD readings and tracker (69-witness.js)
    if (p.glow > 0) p.glow = Math.max(0, p.glow - dt * 0.5);
    // simulate
    Budo.step(this, dt);       // reeling fighters (13-budo.js)
    RageArts.step(this, dt);   // the rage arts' arenas, Mizuchi's dragon, Reaper's clones, Shizuka's silent cuts (67-rage-arts.js)
    for (const f of this.fighters) { if (f.dissolve) { this.stepDissolve(f, dt); continue; } if (held(f)) continue; f.update(dt, this); VFX.emit(f, this.fx); }
    if (this.phase === 'fight' || this.phase === 'ko') Combat.resolve(this);
    StormDirector.step(this);
    if (!hold) WeaponSystem.update(this, dt);
    WeaponSystem.updatePickups(this, dt);
    this.separate();
    this.fighters = this.fighters.filter(f => f.visible || f.alive || f === p || f === e);
    WitnessBoss.after(this);   // Rage Suppression: growth this tick is undone, what Kage had stays
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
  // The spar's scripted ending: the fight freezes and Takashi's voice calls the boys in. No KO, no winner; the stage
  // completes as 'interrupted' (Logic.applyFightResult) and the `after` scene plays over the frozen yard.
  interrupt() {
    const p = this.player, e = this.enemy;
    this.outcome = 'interrupted'; this.win = true;
    this.phase = 'interrupt'; this.phaseT = 0;
    for (const f of [p, e]) { f.move = null; f.abil = null; f.ctrl.dir = 0; if (f.grounded && f.state !== 'down') f.vx *= 0.2; }
    this.fx.slowmo(0.35, 0.7); this.fx.shake(0.25);
    this.fx.stamp('ENOUGH', (p.x + e.x) / 2, -190, 3, C.gold, 'ENOUGH!');
    this.dialogue = { id: 'takashi', name: 'Takashi', title: 'from the veranda', text: 'Enough! Both of you. Inside, now.', t: 0 };
    AudioManager.play('round');
    AudioManager.setMusic('none');
  }
  afterKO() {
    const pWon = this.koTarget !== this.player;
    if (this.mode === 'trials') {
      if (pWon) { this.nextWave(); return; }
      return this.startOutro(false);
    }
    if (this.rounds.p >= this.roundsToWin) return this.startOutro(true);
    if (this.rounds.e >= this.roundsToWin) return this.startOutro(false);
    this.resetRound(); this.phase = 'round'; this.phaseT = 0;
  }
  startOutro(win) {
    this.phase = 'outro'; this.phaseT = 0; this.win = win;
    // a beaten boss's `defeat` scene plays here, before the outro and the result screen; then a story boss leaves the
    // way its data says (bossExit)
    const defeatScene = win && this.mode === 'campaign' ? Logic.stageScene(this.cfg.stageId, 'defeat') : null;
    if (win && this.bossFormat) Game.playStory(defeatScene, () => this.bossExit());
    else if (defeatScene) Game.playStory(defeatScene);
    const w = win ? this.player : this.enemy, l = win ? this.enemy : this.player;
    w.state = 'pose'; w.poseName = 'victory'; w.vx = 0;
    if (!win) w.poseName = 'taunt';
    const line = win ? (defeatScene ? null : l.def.defeatLine || null) : (w.def && w.def.win) || null;
    if (line && this.mode === 'campaign') this.dialogue = { id: ((win ? l : w).def || {}).id, name: win ? l.name : w.name, title: win ? l.title : w.title, text: line, t: 0 };
    AudioManager.play(win ? 'victory' : 'defeat');
    AudioManager.setMusic('none');
  }
  // How a beaten story boss leaves, after his defeat scene (Logic.fightFormat: format.defeat):
  //   finisher  he comes apart into violet memory ash (the same dissolve as a Hollow, slower and fuller);
  //   escape    he rises from his knee into a burst of smoke and fades out;
  //   reabsorb  the Witness: its chest core shatters into flat shards, violet and white light streams flow into Kage,
  //             Kage glows, and its fragments come apart into memory ash (stepReabsorb); recorded as reabsorbed.
  bossExit() {
    const e = this.enemy, d = this.format.defeat;
    if (!e || e.dissolve) return;
    if (d === 'escape') { e.fadeOnly = true; e.dissolveDur = BOSS_ESCAPE; this.smokeCloud(e.x, true); this.fx.popText(e, 'ESCAPED', C.gold); this.dissolve(e); return; }
    if (d === 'reabsorb') {
      e.reabsorb = true; e.dissolveDur = BOSS_REABSORB; this.phaseT = 0;   // hold the outro until the light has flowed in
      this.dissolve(e); this.fx.popText(e, 'REABSORBED', WITNESS_TINT);
      return;
    }
    e.dissolveDur = BOSS_DISSOLVE;
    this.dissolve(e);
    this.fx.slowmo(0.6, 0.6);
  }
  buildResult() {
    const p = this.player, e = this.enemy;
    return {
      mode: this.mode, win: !!this.win, outcome: this.outcome || null, enemyId: e.def.id, stageId: this.cfg.stageId, foeName: e.name, ng: this.cfg.ng || 0,
      time: this.fightTime, hpLeft: p.hp / p.maxHp, flawless: this.damageTaken < 1, maxCombo: p.stats.maxCombo, parries: p.stats.parries,
      hp: Math.max(0, p.hp), maxHp: p.maxHp,
      enemyDamage: 1 - Math.max(0, e.hp) / e.maxHp, waves: this.wavesCleared, trialCoins: this.trialCoins, trialGems: this.trialGems,
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
    else if (this.phase === 'outro' && this.win && this.bossFormat) { tx = (p.x + e.x) / 2; tz = 1.2; ty = -30; }  // keep the boss's exit in frame
    else if (this.phase === 'outro') { const w = this.win ? p : e; tx = w.x; tz = 1.3; ty = -30; }
    else {
      const dist = Math.abs(p.x - e.x);
      tx = (p.x + e.x) / 2; tz = clamp(1300 / (dist + 560), 0.9, 1.36);
      ty = Math.min(0, Math.min(p.y, e.y) * 0.35);
    }
    // the Yashiro Titan and Takashi's domain need a wider frame (66-takashi.js)
    if (this.phase === 'fight') { const tk = TakashiBoss.camera(this, tz, ty); if (tk) { tz = tk.tz; ty = tk.ty; } }
    // ... and the Witness's domain and its arena-wide moves (69-witness.js)
    if (this.phase === 'fight') { const wt = WitnessBoss.camera(this, tz, ty); if (wt) { tz = wt.tz; ty = wt.ty; } }
    // a rage art frames its own cinematic (67-rage-arts.js)
    if (this.phase === 'fight') { const ra = RageArts.camera(this, tz, ty); if (ra) { tx = ra.tx; tz = ra.tz; ty = ra.ty; } }
    const half = W / 2 / tz;
    tx = clamp(tx, this.bounds.l - 70 + half, this.bounds.r + 70 - half);
    cam.x = damp(cam.x, tx, this.phase === 'ko' ? 4 : 5, dt);
    cam.zoom = damp(cam.zoom, tz, this.phase === 'ko' ? 3 : 2.6, dt);
    cam.y = damp(cam.y, ty, 3, dt);
  }
}

/* ======================================================================== */
/* StretchSession: a side-scrolling stretch stage (CAMPAIGN stage `stretch`)  */
/* ======================================================================== */
// A level several screens wide that Kage walks right through. No rounds and no timer: crossing an encounter's
// trigger locks the arena between its left edge and its gate and spawns its waves (every foe of a wave is active
// at once); the gate opens when the last wave falls. Clue pickups record a flag through Logic.collectClue.
// Reaching the end with every encounter cleared wins the stage through the usual Game.finishFight path.
// The rules (which encounter starts, where the gate is, when the stretch is complete) live in Logic.
const STRETCH = {
  arena: 1500,       // width of a locked encounter arena, ending at its gate
  maxEngaged: 2,     // foes allowed to press the attack at once; the rest circle at a distance
  waitRing: 360,     // how close a waiting foe stays
  deadzone: 70,      // camera deadzone half-width (world units)
  lookAhead: 230,    // camera look-ahead in the facing direction (the follow lag eats about 80 of it at a run)
  zoom: 1.0, fightZoom: 0.94,
  clueReach: 46,
  tutorialWalk: 140  // how far Kage must walk to clear the "move" prompt
};
class StretchSession extends FightSession {
  setup() {
    const cfg = this.cfg, L = cfg.stretch, p = this.player, save = SaveManager.data;
    this.stretch = L; this.isStretch = true;
    this.enemy = null; this.isBoss = false; this.isSub = false; this.roundsToWin = 1; this.timer = 0;
    this.format = this.cfg.format || Logic.fightFormat(this.cfg); this.bossFormat = false;
    this.level = { l: 0, r: L.length };
    this.cleared = 0; this.encounter = null; this.engaged = new Set();
    const found = Logic.cluesFound(save, cfg.stageId);
    this.clues = L.clues.map(c => ({ id: c.id, x: c.x, label: c.label, found: found.includes(c.id), ph: rand(0, TAU), got: found.includes(c.id) ? 9 : 0 }));   // clues found on an earlier run stay gone
    p.x = L.start || 160; p.facing = 1; p.state = 'pose'; p.poseName = null;
    this.fighters = [p];
    this.bounds = { l: this.level.l, r: Logic.stretchLimit(L, 0) };
    this.look = STRETCH.lookAhead * 0.6;
    this.cam.zoom = STRETCH.zoom; this.cam.x = this.clampCam(p.x + this.look, STRETCH.zoom); this.cam.y = 0;
    this.letterbox = 1;
    this.phase = 'intro'; this.phaseT = 0;
    // tutorial prompts (stretch `tutorial`): done = prompts cleared; cleared = the last cleared prompt, fading out
    this.tut = { done: 0, cur: null, walked: 0, showT: 0, cleared: null };
    // the title banner waits for the first simulated tick, so it never hangs frozen behind the opening scene
    this.bannerDue = true;
    // the street as drawn (Logic.streetProps: props plus the City of Echoes' repeating block), each sign's state by id
    // (Logic.signStep), the seams where the street starts over, and the screen glitch when Kage crosses one
    this.street = Logic.streetProps(L);
    this.signs = {}; this.seams = this.street.filter(pr => pr.type === 'seam').map(pr => pr.x);
    this.glitch = 0; this.lastX = p.x;
  }
  roundTime() { return 0; }
  // the player targets the nearest live foe; with none around, nothing (he faces where he walks)
  opponentOf(f) {
    if (f.team !== 0) return this.player;
    let best = null, bd = 1e9;
    for (const o of this.fighters) if (o.team !== 0 && o.alive && o.visible) { const d = Math.abs(o.x - f.x); if (d < bd) { bd = d; best = o; } }
    return best;
  }
  // Only the nearest STRETCH.maxEngaged foes press the attack; AIController keeps the others at a distance.
  mayEngage(f) { return this.engaged.has(f); }
  get waitRing() { return STRETCH.waitRing; }
  updateEngaged() {
    const p = this.player, live = this._live || (this._live = []);
    live.length = 0;
    for (const f of this.fighters) if (f.ai && f.alive && f.visible) live.push(f);
    live.sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x));
    this.engaged.clear();
    for (let i = 0; i < live.length && i < STRETCH.maxEngaged; i++) this.engaged.add(live[i]);
  }
  liveFoes() { let n = 0; for (const f of this.fighters) if (f.ai && f.alive) n++; return n; }

  stepPhase(dt, p) {
    const L = this.stretch;
    switch (this.phase) {
      case 'intro': {
        if (this.bannerDue) { this.bannerDue = false; this.fx.banner(this.cfg.foeName || 'Stretch', this.cfg.foeTitle || '', C.gold); }
        const skip = this.phaseT > 0.5 && (InputManager.pressed('punch') || InputManager.pressed('jump') || UIManager.skipRequested());
        if (this.phaseT > 1.6 || skip) { this.phase = 'fight'; this.phaseT = 0; p.state = 'idle'; }
        break;
      }
      case 'fight':
        this.fightTime += dt;
        if (!this.encounter) {
          const i = Logic.encounterAt(L, this.cleared, p.x);
          if (i >= 0) this.startEncounter(i);
          else if (Logic.isStretchComplete(L, this.cleared, p.x)) this.finishStretch();
        } else this.updateEncounter(dt);
        this.updateClues(dt);
        break;
      case 'ko':
        if (this.phaseT > 2.2) this.startOutro(false);
        break;
      case 'outro':
        if (this.phaseT > 3.2 || (this.phaseT > 0.8 && (InputManager.pressed('punch') || InputManager.pressed('jump') || UIManager.skipRequested()))) { this.phase = 'done'; Game.finishFight(this.buildResult()); }
        break;
    }
  }
  simulate(dt, p, e) {
    const c = p.ctrl;
    this.updateEngaged();
    // with no foe to square up to, Kage turns to where he walks (so he can break into a run)
    if (this.phase === 'fight' && !this.opponentOf(p) && p.isNeutral() && c.dir) p.facing = c.dir;
    super.simulate(dt, p, e);
    if (this.phase === 'fight') this.updateTutorial(dt);
    this.updateAshTrail(dt);
    this.updateEchoes(dt);
    // fallen foes fade out once they have hit the floor, so a long stretch never piles up bodies
    for (const f of this.fighters) {
      if (f === p || f.alive || !f.visible || f.dissolve) continue;
      f.deadT = (f.deadT || 0) + dt;
      if (f.deadT > 2.2) { f.alpha = Math.max(0, 1 - (f.deadT - 2.2) / 0.8); if (f.alpha <= 0) f.visible = false; }
    }
  }

  /* ---- encounters ---- */
  startEncounter(i) {
    const enc = this.stretch.encounters[i];
    this.encounter = { i, wave: -1, gate: enc.gate, l: Math.max(this.level.l, enc.gate - STRETCH.arena), next: 0.35 };
    this.bounds = { l: this.encounter.l, r: enc.gate };
    // a mimic encounter opens in silence; its FIGHT mark lands when the copy breaks (onMimicEnd)
    if (!enc.mimicIntro) this.fightMark();
  }
  fightMark() { this.fx.stamp('FIGHT', this.player.x + 120, -170, 3, C.emberBright); this.fightFlash = 1; AudioManager.play('round'); }
  spawnWave(k) {
    const enc = this.encounter, ids = this.stretch.encounters[enc.i].waves[k], p = this.player;
    enc.wave = k;
    ids.forEach((id, j) => {
      // alternate ahead (near the gate) and behind (the arena's left edge), so foes close in from both sides
      const ahead = j % 2 === 0, row = (j / 2) | 0;
      let x = ahead ? enc.gate - 50 - row * 90 : enc.l + 50 + row * 90;
      const mimic = k === 0 && this.stretch.encounters[enc.i].mimicIntro;
      if (mimic) x = clamp(p.x + (ahead ? 1 : -1) * 400, enc.l + 30, enc.gate - 30);   // a mirror stands in plain view
      if (Math.abs(x - p.x) < 260) x = clamp(p.x + (ahead ? 1 : -1) * 320, enc.l + 30, enc.gate - 30);
      const f = this.makeEnemy(id, x);
      f.facing = p.x > x ? 1 : -1;
      // an encounter's mimicIntro: the first wave stands mirroring Kage's idle stance before it attacks
      if (mimic) { f.ai.startMimic(p, mimic); this.fx.popText(f, '. . .', '#b9a8ff'); }
      this.fighters.push(f); this.smokeCloud(x);
    });
    if (k > 0) this.fx.banner(`Wave ${k + 1}`, `${ids.length} foes`, C.emberBright);
  }
  updateEncounter(dt) {
    const enc = this.encounter, waves = this.stretch.encounters[enc.i].waves;
    if (this.liveFoes() > 0) return;
    enc.next -= dt;
    if (enc.next > 0) return;
    if (enc.wave + 1 < waves.length) { this.spawnWave(enc.wave + 1); enc.next = 0.8; return; }
    // encounter cleared: the gate opens up to the next encounter's gate (or the end of the level)
    this.cleared++; this.encounter = null;
    this.bounds = { l: this.level.l, r: Logic.stretchLimit(this.stretch, this.cleared) };
    this.fx.banner('The way opens', this.cleared < this.stretch.encounters.length ? 'Press on' : 'Reach the end of the road', C.gold);
    AudioManager.play('unlock');
  }

  // a mimicking foe drops the copy and comes for him
  onMimicEnd(f) {
    if (!f.alive) return;
    this.fx.memoryAsh(f, 16, false); AudioManager.play('whoosh');
    if (this.encounter && !this.fighters.some(o => o !== f && o.mimic)) this.fightMark();
  }

  /* ---- tutorial prompts: shown one at a time in the world (Renderer.drawTutorial), cleared by doing the action ---- */
  updateTutorial(dt) {
    const L = this.stretch, T = this.tut, p = this.player, c = p.ctrl;
    T.x = T.x == null ? p.x : damp(T.x, p.x, 5, dt);   // the prompt drifts after Kage
    if (T.cleared) { T.cleared.t += dt; if (T.cleared.t > 1.2) T.cleared = null; }
    if (!L.tutorial || T.done >= L.tutorial.length) return;
    const cur = Logic.tutorialPrompt(L, T.done, p.x);
    if (cur !== T.cur) { T.cur = cur; T.walked = 0; T.showT = 0; }
    if (!cur) return;
    T.showT += dt;
    if (c.dir && p.grounded) T.walked += Math.abs(p.vx) * dt;
    const did = [];
    if (T.walked > STRETCH.tutorialWalk) did.push('move');
    if (c.jumpP) did.push('jump');
    if (c.weaponP) did.push('slash');
    if (c.blockP || c.blockHeld) did.push('block');
    if (c.dashP) did.push('dodge');
    const n = Logic.advanceTutorial(L, T.done, p.x, did);
    if (n === T.done) return;
    T.done = n; T.cleared = { step: cur.step, t: 0 };
    T.cur = null;
    AudioManager.play('coin', { pitch: 1.2 });
  }
  // stretch `ashTrail`: once every encounter is cleared, violet memory ash drifts up off the road ahead (Effects 'ash')
  updateAshTrail(dt) {
    const A = this.stretch.ashTrail;
    if (!A || this.cleared < this.stretch.encounters.length) return;
    const half = W / 2 / this.cam.zoom, l = Math.max(A.from, this.cam.x - half), r = Math.min(A.to, this.cam.x + half);
    if (r <= l) return;
    this.ashAcc = (this.ashAcc || 0) + dt * 26 * (r - l) / (2 * half);
    const cols = ENEMY_FAMILIES.hollow.ash;
    while (this.ashAcc >= 1) {
      this.ashAcc -= 1;
      this.fx.part({ x: rand(l, r), y: rand(-6, 2), vx: rand(20, 70), vy: rand(-60, -20), life: rand(1.2, 2.2), size: rand(3, 6),
        color: cols[(Math.random() * cols.length) | 0], type: 'ash', grav: -18, drag: 0.6, rot: rand(0, TAU), vr: rand(-4, 4) });
    }
  }
  // The City of Echoes: a sign reads its next text when it comes back into view (any copy of it on screen counts as the
  // sign being watched), and crossing a seam where the street starts over makes the frame skip.
  updateEchoes(dt) {
    const half = W / 2 / this.cam.zoom, vl = this.cam.x - half, vr = this.cam.x + half, seen = {};
    for (const pr of this.street) if (pr.type === 'sign') seen[pr.id] = seen[pr.id] || (pr.x + 220 > vl && pr.x - 60 < vr);
    for (const id in seen) this.signs[id] = Logic.signStep(this.signs[id] || null, seen[id]);
    this.glitch = Math.max(0, this.glitch - dt);
    const x = this.player.x;
    for (const sx of this.seams) if ((this.lastX < sx) !== (x < sx)) { this.glitch = 0.3; AudioManager.play('teleport', { pitch: 0.6 }); this.fx.shake(0.15); }
    this.lastX = x;
  }
  // Which input device the prompts name: the last one used (InputManager), else touch when the touch controls show.
  inputDevice() { return InputManager.lastDevice === 'pad' ? 'pad' : InputManager.lastDevice === 'touch' ? 'touch' : 'keyboard'; }

  /* ---- clues: walk over one to pick it up ---- */
  updateClues(dt) {
    const p = this.player;
    for (const c of this.clues) {
      if (c.got > 0) c.got += dt;
      if (c.found || Math.abs(p.x - c.x) > STRETCH.clueReach || p.y < -60) continue;
      c.found = true; c.got = 0.001;
      if (Logic.collectClue(SaveManager.data, this.cfg.stageId, c.id)) SaveManager.save();
      this.fx.popText(p, 'CLUE FOUND', C.gold); this.fx.embers(c.x, -60, 18, C.gold);
      AudioManager.play('unlock');
      UIManager.toast('Clue found', c.label);
      Game.playStory(Logic.clueScene(this.cfg.stageId, c.id));   // a clue can carry a short scene
    }
  }

  /* ---- KO, outro and the result ---- */
  onKO(def, att) {
    if (def.clone || def.minion) return super.onKO(def, att);
    const fx = this.fx;
    def.mimic = null;
    if (def.hollow) this.dissolve(def);
    if (def !== this.player) {
      fx.impactFrame(def.x, def.y - 100 * def.scale, 2); fx.shake(0.5);
      fx.stamp('FINISH', def.x, def.y - 120, 2, C.emberBright);
      if (this.liveFoes() === 0) fx.slowmo(0.3, 0.6);
      return;
    }
    if (this.phase !== 'fight') return;
    fx.slowmo(0.22, 1.15); fx.impactFrame(def.x, def.y - 100 * def.scale, 3); fx.shake(0.9); fx.punch(0.12);
    fx.stamp('FALLEN', def.x, def.y - 120, 3, C.ember);
    AudioManager.play('ko');
    this.koTarget = def; this.phase = 'ko'; this.phaseT = 0;
  }
  finishStretch() { this.startOutro(true); this.fx.banner('Stretch cleared', this.cfg.foeName || '', C.gold); }
  startOutro(win) {
    this.phase = 'outro'; this.phaseT = 0; this.win = win;
    const p = this.player;
    if (win) { p.move = null; p.state = 'pose'; p.poseName = 'victory'; p.vx = 0; }
    AudioManager.play(win ? 'victory' : 'defeat');
    AudioManager.setMusic('none');
  }
  buildResult() {
    const p = this.player, n = this.stretch.encounters.length;
    return {
      mode: this.mode, kind: 'stretch', win: !!this.win, enemyId: this.cfg.enemyId, stageId: this.cfg.stageId, foeName: this.cfg.foeName, ng: this.cfg.ng || 0,
      time: this.fightTime, hpLeft: p.hp / p.maxHp, flawless: this.damageTaken < 1, maxCombo: p.stats.maxCombo, parries: p.stats.parries,
      enemyDamage: n ? this.cleared / n : 1, encounters: this.cleared, clues: this.clues.filter(c => c.found).length, waves: 0, trialCoins: 0, trialGems: 0,
      env: this.cfg.env
    };
  }

  /* ---- follow camera: deadzone, look-ahead, clamped to the level (and framed on a locked arena) ---- */
  clampCam(x, zoom) {
    const half = W / 2 / zoom;
    return clamp(x, this.level.l + half, this.level.r - half);
  }
  updateCamera(dt) {
    const p = this.player, cam = this.cam, enc = this.encounter;
    const moving = Math.abs(p.vx) > 40;
    this.look = damp(this.look, p.facing * STRETCH.lookAhead * (moving ? 1 : 0.55), 1.6, dt);
    const want = p.x + this.look;
    let tx = cam.x;
    if (want > cam.x + STRETCH.deadzone) tx = want - STRETCH.deadzone;
    else if (want < cam.x - STRETCH.deadzone) tx = want + STRETCH.deadzone;
    const tz = this.phase === 'outro' ? 1.2 : this.phase === 'ko' ? 1.3 : enc ? STRETCH.fightZoom : STRETCH.zoom;
    if (this.phase === 'ko' || this.phase === 'outro') tx = p.x;
    if (enc) { const half = W / 2 / tz; tx = clamp(tx, enc.l + half, Math.max(enc.l + half, enc.gate - half)); }
    cam.zoom = damp(cam.zoom, tz, 2.4, dt);
    cam.x = this.clampCam(damp(cam.x, tx, 5, dt), cam.zoom);
    cam.y = damp(cam.y, Math.min(0, p.y * 0.35) - (this.phase === 'outro' ? 30 : 0), 3, dt);
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
    poseFighter(this.warrior, WEAPONS[save.equipped.weapon].hands === 2 && ['katana', 'shinsen'].includes(SHAPE[save.equipped.weapon]) ? 'gedan' : null, 60);
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
      // a story scene freezes gameplay: the fight is not stepped (it stays drawn behind the scene) and the scene
      // consumes this frame's presses, so the press that ends a scene never reaches the fight
      const story = !!StoryPlayer.active;
      if (story) { StoryPlayer.update(real); InputManager.endTick(); }
      if (this.scene === 'fight' && this.session) {
        const s = this.session;
        if (!this.paused && !story) {
          if (s.fx.hitStop > 0) s.fx.update(real, 0);
          else {
            this.acc += real * s.fx.slowScale;
            let n = 0;
            while (this.acc >= STEP && n < 5) { s.step(STEP); InputManager.endTick(); this.acc -= STEP; n++; if (this.scene !== 'fight' || StoryPlayer.active) break; }
            if (this.acc > STEP) this.acc = STEP; // never try to catch up a backlog after a hitch
            s.fx.update(real, real * s.fx.slowScale);
          }
        }
        if (this.session) {
          const ss = this.session;
          ss.beginRender(clamp(this.acc / STEP, 0, 1));
          try { Renderer.drawFight(ss, this.t); } finally { ss.endRender(); }
          UIManager.hud.update(ss);
        }
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
  stageConfig(stageId) { return Logic.stageConfig(SaveManager.data, stageId); },
  // opts.skipBefore: restarting from the pause menu does not replay the stage's opening scene
  startFight(cfg, opts) {
    this.session = cfg.stretch ? new StretchSession(cfg) : new FightSession(cfg);
    this.scene = 'fight'; this.paused = false; this.acc = 0; this.tableau = null;
    const d = ENEMIES[cfg.enemyId];
    AudioManager.setMusic(cfg.mode === 'trials' ? 'trials' : d.type === 'boss' || cfg.mode === 'bossrush' ? 'boss' : 'fight');
    UIManager.showHud(this.session);
    if (cfg.mode === 'campaign' && !(opts && opts.skipBefore)) this.playStory(Logic.stageScene(cfg.stageId, 'before'));
  },
  // Plays a story scene (see StoryPlayer, 68-story.js); onDone runs when it ends, or at once when id is null.
  playStory(id, onDone, opts) {
    if (!id) { if (onDone) onDone(); return false; }
    return StoryPlayer.play(id, onDone, opts);
  },
  retry() { if (this.lastCfg) { const c = Object.assign({}, this.lastCfg); if (c.mode === 'trials') c.wave = 1; UIManager.go('prefight', () => UIManager.preparePrefight(c)); } },
  quitFight() { this.session = null; this.paused = false; AudioManager.setMusic('menu'); },
  setTableau(env, opts) { this.tableau = { env: getEnv(env), t: 0, opts }; this.scene = 'tableau'; },

  /* ---- Boss Rush ----
     A run (Logic.bossRushRun) is held in Game.rush; each boss is its own FightSession in mode 'bossrush'
     (Logic.bossRushConfig: the story boss format in its stage's arena, no story scenes). finishFight hands each result
     to Logic.bossRushAdvance, which carries the health over, and the last fight (or a loss) goes to the results. */
  startBossRush(from) {
    const run = Logic.bossRushRun(SaveManager.data, from);
    if (!run) return false;
    this.rush = run; this.rushFrom = from || null;
    UIManager.go('hud', () => this.startFight(this.bossRushFight()));
    return true;
  },
  bossRushFight() {
    const run = this.rush, cfg = Logic.bossRushConfig(SaveManager.data, run.stages[run.index]);
    cfg.rush = { index: run.index, total: run.stages.length };
    if (run.hp != null) cfg.carryHp = run.hp;
    return cfg;
  },
  finishBossRushFight(r) {
    this.lastCfg = this.session ? this.session.cfg : this.lastCfg;
    const run = this.rush = Logic.bossRushAdvance(this.rush, { win: r.win, time: r.time, hp: r.hp, maxHp: r.maxHp });
    if (!run.done) { this.session = null; UIManager.go('hud', () => this.startFight(this.bossRushFight())); return; }
    const out = Logic.applyBossRushResult(SaveManager.data, run);
    out.lastEnemyId = r.enemyId; out.lastFoe = r.foeName; out.win = run.cleared; out.env = r.env;
    SaveManager.save();
    this.lastResult = out; this.rush = null;
    this.session = null;
    UIManager.go('result', () => UIManager.showBossRushResult(out));
  },
  finishFight(r) {
    if (r.mode === 'bossrush') return this.finishBossRushFight(r);
    this.lastCfg = this.session ? this.session.cfg : this.lastCfg;
    const out = Logic.applyFightResult(SaveManager.data, r);
    SaveManager.save();
    this.lastResult = out;
    // a won campaign stage plays its `after` scene over the last frame of the fight, then the result screen
    const after = r.win && r.mode === 'campaign' ? Logic.stageScene(r.stageId, 'after') : null;
    this.playStory(after, () => {
      this.session = null;
      UIManager.go('result', () => UIManager.showResult(out));
    });
  },
  // progression queries are answered by Logic (15-logic.js); these keep the engine's old entry points
  rate(r) { return Logic.rateFight(r); },
  nextStage() { return Logic.nextStage(SaveManager.data); },
  stageUnlocked(id) { return Logic.isStageUnlocked(SaveManager.data, id); },
  // A `scene` stage (the Epilogue) has no fight: once its scene has played, it is complete.
  completeSceneStage(id) {
    const out = Logic.completeStage(SaveManager.data, id);
    if (out) SaveManager.save();
    return out;
  },
  startNewGamePlus() {
    if (!Logic.startNewGamePlus(SaveManager.data)) return false;
    SaveManager.save();
    return true;
  }
};
