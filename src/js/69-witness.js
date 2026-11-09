/* KAGE — The Witness, Architect of Echoes (final boss, core.witness): the four-phase fight, redesigned 2026-11-09 from
   the user's four reference sheets (docs/art-reference/witness-phase-1..4.webp). Numbers: WITNESS_MOVES,
   WITNESS_INPUT, WITNESS_DOMAIN, WITNESS_ADAPT and WITNESS_LINES in 10-data.js; the phases are data on ENEMIES.witness
   (1 / 0.75 / 0.5 / 0.25 of its true health). The colours follow the sheets, which override the written spec's
   violet / magenta wording: blue for phases I and II, violet for III, magenta and gold for IV.

   The seven systems the spec asks for, one object each:
     WitnessPhases   BossPhaseStateMachine: fight / shift / domain / defeat, entered on the true health thresholds
                     (AIController.checkPhase -> FightSession.onBossPhase); the shift is the transition (its lines,
                     the halo reversing, the light changing) and the Witness cannot be hurt while it speaks
     WitnessAttack   AttackStateMachine: every attack runs Telegraph -> Startup -> Active -> Recovery, then Cooldown
                     on the AI (Logic.witnessStages); each stage has its own handler, and the stages it passed through
                     are logged on the session (s.wit.atkLog) for the tests
     WitnessInput    InputModifierLayer: Kage's controls are read from the devices as usual, then this layer writes
                     the modified copy (Logic.witnessInput) over his ctrl; the raw copy is kept (s.wit.raw) and the
                     devices are never touched. Bind / reverse / delay / lock, each warned before it bites
     WitnessHUD      HUDPresentationLayer: what the HUD shows (70-ui.js reads WitnessHUD.view): the phase plate, the
                     modifiers, the locked abilities, the rage lock, and phase III-IV's false readings. The real health
                     and rage values are never changed by it
     WitnessDomain   DomainController: Echo Genesis (the activation's beats, its rules, the three Echo Anchors, each of
                     which gives back part of Kage's control; the third shatters the domain)
     WitnessTracker  AdaptiveTracker: Kage's recent actions (FightSession.onPlayerAction, blocks), read by
                     Logic.witnessAdapt; phase I counters an overused move, phase IV varies its timing and punishes hiding
     WitnessFX       VFXController: the baked Effekseer sheets (wt_*, vfx/src/VFX_Witness_*.py) with canvas fallbacks,
                     the phase aura, trails, shake and glitch overlays
   WitnessBoss is the glue the engine calls (step, input, phase, onHit, onKO, camera, track); its hazards are drawn in
   69b-witness-draw.js. As with Takashi's and Akari's, a sheet plays only once its image has really decoded; until then,
   and always in the headless tests, the canvas effect draws instead.
   Sim-side code changes fighters and session state; everything named draw* only reads. */

const WTC = {
  looks: [
    { key: 'observer', name: 'The Observer', body: '#4a5cff', hot: '#a8b4ff', deep: '#1c268f', core: '#f4f6ff', glow: [74, 92, 255], rim: [168, 180, 255], aura: 'wt_aura1', el: 'echo', kanji: '観測者' },
    { key: 'manipulator', name: 'The Manipulator', body: '#3b48fd', hot: '#b8c2ff', deep: '#1a22a8', core: '#ffffff', glow: [60, 74, 255], rim: [130, 150, 255], aura: 'wt_aura2', el: 'echo', kanji: '操者' },
    { key: 'editor', name: 'The Reality Editor', body: '#922cf8', hot: '#d6a8ff', deep: '#4e0ea0', core: '#fbf2ff', glow: [146, 44, 248], rim: [196, 140, 255], aura: 'wt_aura3', el: 'void', kanji: '改変者' },
    { key: 'true', name: 'The True Witness', body: '#b828ff', hot: '#f0baff', deep: '#680aaa', core: '#fff6ff', glow: [184, 40, 255], rim: [230, 160, 255], aura: 'wt_aura4', el: 'crown', kanji: '真なる証人' }
  ],
  gold: '#ffc46e', goldHot: '#ffecbe', cyan: '#5aaaff', ink: '#06061c'
};
const WT_POSE = {
  // the clawed hand thrust out toward Kage, low and wide (the Manipulator's stance on its sheet)
  hand: P({ lean: 10, head: 4, fs: 96, fe: 12, bs: 18, be: 50, fh: 40, fk: -58, bh: -36, bk: -30 }),
  // the hand raised high, palm up (Echo Genesis, the shifts)
  raise: P({ lean: -8, head: -12, fs: 165, fe: 18, bs: 40, be: 70, fh: 18, fk: -10, bh: -20, bk: -8 }),
  // the blade drawn back low before a cut, and the cut thrown through
  low: P({ lean: -12, head: -2, fs: -30, fe: 40, wa: 200, bs: -40, be: 70, fh: 42, fk: -60, bh: -40, bk: -24 }),
  cut: P({ lean: 28, head: 8, fs: 70, fe: 0, wa: 80, bs: -40, be: 40, fh: 50, fk: -46, bh: -46, bk: -10 }),
  // both arms spread, the halo flaring (the True Witness's call)
  spread: P({ lean: -4, head: -10, fs: 120, fe: 10, bs: 120, be: 10, fh: 22, fk: -14, bh: -22, bk: -12 }),
  // the false death: collapsed to one knee, head down
  fallen: P({ lean: 40, head: 30, fs: -10, fe: 20, bs: -20, be: 30, fh: 90, fk: -150, bh: -10, bk: -110 })
};

/* ======================================================================== */
/* VFXController                                                              */
/* ======================================================================== */
const WitnessFX = {
  on(name) { return !!VfxSheets.ready(name) && typeof VfxSheets.img[name].naturalWidth === 'number'; },
  play(w, name, x, y, o) {
    if (!this.on(name) || !w.fx || !w.fx.playSheet) return null;
    return w.fx.playSheet(name, x, y, o || {});
  },
  // the look of the Witness now (phase colours): its own phase, or the phase of the boss a copy belongs to
  look(f) { return WTC.looks[WitnessBoss.lookOf(f)]; },
  // a four-point glint in the phase's hot colour: the moment before a strike is released
  glint(f, w, x, y) {
    const L = this.look(f);
    w.fx.glint(x != null ? x : f.sk.wt.x, y != null ? y : f.sk.wt.y, L.hot);
    AudioManager.play('orb', { pitch: 1.15 });
  },
  // sparks and flat echo cards out of a point (the canvas stand-in for most of the sheets)
  burst(w, x, y, n, col, spd) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), v = rand(160, 620) * (spd || 1);
      w.fx.part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: rand(0.3, 0.7), size: rand(1.4, 3), color: chance(0.4) ? '#ffffff' : col, type: 'spark', grav: 220, drag: 2.2, add: true });
    }
  },
  cards(w, x, y, n, col, spd) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), v = rand(80, 320) * (spd || 1);
      w.fx.part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: rand(0.5, 1.0), size: rand(3, 6), color: chance(0.5) ? col : '#ffffff', type: 'ash', grav: 30, drag: 2, rot: rand(0, TAU), vr: rand(-8, 8) });
    }
  },
  // motes drawn in toward a point (a gathering)
  gather(w, x, y, r, n, col) {
    for (let i = 0; i < (n || 1); i++) {
      const a = rand(0, TAU), d = r * rand(0.7, 1.1);
      w.fx.part({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * 0.7, vx: -Math.cos(a) * d * 2.6, vy: -Math.sin(a) * d * 1.8, life: 0.36, size: rand(1.4, 2.6), color: col, type: 'spark', grav: 0, drag: 1.2, add: true });
    }
  },
  // the Echo Step's fold of light (wt_step), with a canvas stand-in
  step(w, f, x) {
    const L = this.look(f);
    if (!this.play(w, 'wt_step', x, 0, { scale: f.scale * 0.9 })) { w.fx.ring(x, -120 * f.scale, 110, L.hot, 0.3, 3); this.cards(w, x, -120 * f.scale, 12, L.body); }
    AudioManager.play('teleport', { pitch: 1.25 });
  },
  // the Manipulator's command at its hand (wt_cast) as it takes hold of Kage's controls
  cast(w, f) {
    const h = f.sk.fha, L = this.look(f);
    if (!this.play(w, 'wt_cast', h.x, h.y, { dir: f.facing, scale: f.scale * 0.8 })) { w.fx.ring(h.x, h.y, 70, L.hot, 0.3, 3); this.gather(w, h.x, h.y, 70, 6, L.hot); }
    AudioManager.play('orb', { pitch: 0.7 });
  },
  // a blow landing on it: its echo cracks (phases I-II) or glitches (III-IV)
  hit(w, f, dir) {
    const c = f.corePos ? f.corePos() : { x: f.x, y: f.y - 140 * f.scale }, look = WitnessBoss.lookOf(f);
    if (!this.play(w, look >= 2 ? 'wt_hit_glitch' : 'wt_hit', c.x, c.y, { dir, scale: f.scale * 0.75 })) this.cards(w, c.x, c.y, 5, this.look(f).hot, 0.8);
  },
  shatter(w, f, scale) {
    const c = f.corePos ? f.corePos() : { x: f.x, y: f.y - 140 * f.scale }, L = this.look(f);
    if (!this.play(w, 'wt_shatter', c.x, c.y, { scale: (scale || 1) * f.scale * 0.9 })) { w.fx.ring(c.x, c.y, 240, L.hot, 0.5, 5); this.cards(w, c.x, c.y, 24, L.body, 1.4); }
  },
  // the phase aura: one looped sheet per phase round the Witness, drawn behind it (WitnessDraw.behind); a phase change
  // crossfades the old one out over the new. Advanced on the fight's clock, so hit-stop freezes it like any sheet.
  aura(s, f, dt) {
    const W = s.wit, L = this.look(f), want = f.alive && !f.dissolve && s.phase !== 'ko' ? L.aura : null;
    if (!W.auras) W.auras = [];
    const cur = W.auras.find(a => !a.out);
    if (!cur || cur.name !== want) {
      if (cur) cur.out = true;
      if (want) W.auras.push({ name: want, t: 0, k: 0, out: false });
    }
    for (let i = W.auras.length - 1; i >= 0; i--) {
      const a = W.auras[i]; a.t += dt;
      a.k = a.out ? a.k - dt / 0.6 : Math.min(1, a.k + dt / 0.6);
      if (a.out && a.k <= 0) W.auras.splice(i, 1);
    }
    W.aura = W.auras.some(a => !a.out && this.on(a.name)) ? 1 : null;   // the canvas stand-in draws while no sheet is ready
  }
};

/* ======================================================================== */
/* AdaptiveTracker                                                            */
/* ======================================================================== */
const WitnessTracker = {
  // one of Kage's actions: a move key (Logic.spamKey), 'dash', 'jump' or 'block'
  track(s, key) {
    const W = s.wit; if (!W || !key) return;
    W.log.push(key); if (W.log.length > 40) W.log.shift();
  },
  read(s) { return Logic.witnessAdapt(s.wit ? s.wit.log : [], WITNESS_MOVES.phantomCounter.min); },
  // blocks are not actions the session logs: count each time Kage raises his guard
  step(s) {
    const W = s.wit, p = s.player;
    if (p.state === 'block' && W.pState !== 'block') this.track(s, 'block');
    W.pState = p.state;
  },
  taunt(s, f, kind) {
    const W = s.wit; if (W.tauntT > s.time) return;
    W.tauntT = s.time + 6;
    s.fx.popText(f, pick(WITNESS_ADAPT.taunts[kind]), WitnessFX.look(f).hot);
  }
};

/* ======================================================================== */
/* InputModifierLayer                                                         */
/* ======================================================================== */
const WitnessInput = {
  // a modifier: { kind, dir (bind), keys + delay (delay), lock (lock), warn, dur, label }. It is shown from now, bites
  // after `warn` seconds and lets go `dur` seconds later (clamped to WITNESS_INPUT.min..max)
  add(s, mod) {
    const W = s.wit; if (!W) return null;
    mod = Object.assign({ warn: 0.5 }, mod, { t: 0, bit: false });
    mod.dur = clamp(mod.dur || 1, WITNESS_INPUT.min, WITNESS_INPUT.max);
    W.mods.push(mod);
    return mod;
  },
  active(s) { const W = s.wit; return W ? W.mods.filter(m => m.t >= m.warn && m.t < m.warn + m.dur) : []; },
  clear(s) { if (s.wit) s.wit.mods.length = 0; },
  // FightSession.simulate, right after the devices were read into Kage's ctrl
  apply(s, ctrl, dt) {
    const W = s.wit; if (!W) return;
    const raw = Object.assign({}, ctrl); raw._f = W.frame++;
    W.raw = raw; W.hist.push(raw); if (W.hist.length > 45) W.hist.shift();
    for (let i = W.mods.length - 1; i >= 0; i--) {
      const m = W.mods[i]; m.t += dt;
      if (!m.bit && m.t >= m.warn) { m.bit = true; m.biteF = raw._f; this.bite(s, m); }
      if (m.t >= m.warn + m.dur) W.mods.splice(i, 1);
    }
    const act = this.active(s);
    if (!act.length) return;
    const d = act.find(m => m.kind === 'delay');
    let late = null;
    if (d) { const back = Math.round(d.delay * 60), c = W.hist[W.hist.length - 1 - back]; late = c && c._f >= d.biteF ? c : null; }
    const out = Logic.witnessInput(raw, act, late);
    delete out._f;
    Object.assign(ctrl, out);
  },
  // the moment a modifier takes hold: the lock seal at Kage's feet, a sound, a word over him
  bite(s, m) {
    const p = s.player, L = WitnessFX.look(s.enemy);
    if (!WitnessFX.play(s, 'wt_bind', p.x, 0, { at: p, scale: p.scale * 0.85 })) s.fx.ring(p.x, -10, 90, L.hot, 0.35, 3);
    AudioManager.play('chain', { pitch: 1.4 });
    s.fx.popText(p, m.label || m.kind.toUpperCase(), L.hot);
  }
};

/* ======================================================================== */
/* HUDPresentationLayer                                                       */
/* ======================================================================== */
const WitnessHUD = {
  // what the HUD shows for a Witness fight (null for any other): 70-ui.js draws from this. `lie` holds false readings
  // (phase III-IV's corrupted HUD and the False Death): the authoritative hp / rage are never written here.
  view(s) {
    const W = s && s.wit; if (!W) return null;
    const look = W.phase, mods = W.mods.map(m => ({ kind: m.kind, label: m.label || m.kind, warn: m.t < m.warn, k: m.t < m.warn ? m.t / m.warn : 1 - (m.t - m.warn) / m.dur }));
    const locks = {};
    for (const m of WitnessInput.active(s)) if (m.kind === 'lock') locks[m.lock] = true;
    return { look, name: WTC.looks[look].name, numeral: ROMAN[look], cls: 'wit-p' + (look + 1), glitch: W.hudGlitch, lie: W.lie, fake: W.fake, mods, locks,
      rageLock: this.rageLocked(s), domain: W.domain ? { state: W.domain.state, broken: W.domain.broken, anchors: W.domain.anchors.length } : null, shift: W.state === 'shift' };
  },
  rageLocked(s) { const W = s.wit; return !!W && (W.rageLock > s.time || (W.domain && W.domain.state === 'active' && W.domain.rules.rage)); },
  // phase III and IV: now and then the HUD lies for a moment (a wrong health reading, a garbled boss bar)
  step(s, dt) {
    const W = s.wit;
    W.hudGlitch = Math.max(0, W.hudGlitch - dt);
    if (W.lie && W.lie.until <= s.time && !W.fake) W.lie = null;
    if (W.phase < 2 || W.state !== 'fight' || W.fake || (W.lie && W.lie.until > s.time)) return;
    W.lieT -= dt;
    if (W.lieT > 0) return;
    W.lieT = rand(5, 8) / (W.phase >= 3 ? 1.3 : 1);
    const p = s.player, kind = pick(['p', 'e', 'both']);
    W.lie = { until: s.time + rand(0.3, 0.5), p: kind !== 'e' ? clamp(p.hp / p.maxHp * rand(0.15, 0.4), 0.02, 1) : null, e: kind !== 'p' ? 1 : null, garble: true };
    W.hudGlitch = 0.45;
  }
};

/* ======================================================================== */
/* AttackStateMachine                                                         */
/* ======================================================================== */
const WitnessAttack = {
  STAGES: ['telegraph', 'startup', 'active', 'recovery'],
  /* Run attack `id` on the Witness (or a copy). spec: { telegraph, startup, active, recovery: (f, w, atk, u, dt) per
     tick of that stage (u = 0..1 through it); enter(stage, f, w, atk) once as each stage begins; pose(stage, u, f) or a
     fixed pose; start, end; unint (uninterruptible), armor (super armour through startup and active), invuln (through
     telegraph and startup), tellMul, rate, trail, quiet (no call-out) }. Returns the attack record. */
  run(f, w, ai, id, spec) {
    const m = WITNESS_MOVES[id], W = w.wit;
    let mul = (ai && ai.p ? ai.p.windup : 1) * (spec.tellMul || 1);
    if (W && W.phase >= 3 && f === w.enemy) mul *= rand(WITNESS_ADAPT.jitter[0], WITNESS_ADAPT.jitter[1]);   // phase IV varies its timing
    const st = Logic.witnessStages(id, mul), total = st[3].at + st[3].dur;
    const atk = { id, m, stages: st, stage: null, t: 0, data: {}, log: [] };
    if (W && f === w.enemy) { W.atkLog.push(atk.log); if (W.atkLog.length > 30) W.atkLog.shift(); if (id !== 'timelineBreak' && id !== 'echoGenesis' && id !== 'phantomCounter') W.history.push(id); }
    const L = WitnessFX.look(f);
    f.telegraph = st[0].dur;
    f.startAbility({ dur: total, rate: spec.rate || 18, uninterruptible: !!spec.unint, trail: !!spec.trail, el: L.el,
      pose: (f, t) => {
        const p = typeof spec.pose === 'function' ? spec.pose(atk.stage || 'telegraph', atk.u || 0, f) : spec.pose;
        return p || (atk.stage === 'telegraph' ? WT_POSE.hand : atk.stage === 'active' ? WT_POSE.cut : WT_POSE.hand);
      },
      start(f) {
        if (w.player && !spec.noFace) f.facing = w.player.x > f.x ? 1 : -1;
        if (!spec.quiet) { w.fx.popText(f, m.label, L.hot); AudioManager.play('teleport', { pitch: 0.7 }); }
        if (spec.start) spec.start(f, w, atk);
      },
      update(f, w, t, dt) {
        const stage = Logic.witnessStageAt(st, t);
        if (stage !== atk.stage && stage !== 'cooldown') {
          atk.stage = stage; atk.log.push(stage);
          f.superArmor = !!spec.armor && (stage === 'startup' || stage === 'active');
          if (spec.invuln) f.invuln = stage === 'telegraph' || stage === 'startup' ? Math.max(f.invuln, 0.1) : f.invuln;
          if (spec.enter) spec.enter(stage, f, w, atk);
        }
        const S = st.find(x => x.stage === stage);
        atk.t = t; atk.u = S ? clamp((t - S.at) / Math.max(1e-6, S.dur), 0, 1) : 1;
        if (spec.invuln && (stage === 'telegraph' || stage === 'startup')) f.invuln = Math.max(f.invuln, 0.05);
        const h = spec[stage];
        if (h) return h(f, w, atk, atk.u, dt);
      },
      end(f) {
        atk.stage = 'cooldown'; atk.log.push('cooldown'); f.superArmor = false;
        if (f.wAtk === atk) f.wAtk = null;
        if (spec.end) spec.end(f, w, atk);
      } });
    f.wAtk = atk;
    return atk;
  }
};

/* ======================================================================== */
/* BossPhaseStateMachine                                                      */
/* ======================================================================== */
const WitnessPhases = {
  // FightSession.onBossPhase: a true-health threshold was crossed (Logic.bossPhaseAt over 1 / .75 / .5 / .25)
  enter(s, f, idx, ph) {
    const W = s.wit;
    W.phase = idx; W.state = 'shift'; W.shiftT = 0;
    W.haloDir = idx === 1 ? -1 : idx === 3 ? 2 : 1;        // the halo reverses at 75%, races in the last phase
    W.gradeFrom = W.grade; W.gradeK = 0;                    // the arena's light crossfades into the new phase's
    WitnessInput.clear(s); W.rageLock = 0; W.lie = null;
    this.clearHaz(s);
    W.hudGlitch = 0.8;
    if (idx === 3) W.domainNext = true;                     // the last phase opens with Echo Genesis
  },
  // the hazards of the phase that ended are cleared, so a transition is never a trap
  clearHaz(s) {
    const W = s.wit;
    for (const h of W.haz) if (h.sheet && h.sheet !== 1) h.sheet.stop = true;
    W.haz.length = 0; W.tiles = null; W.tether = null; W.well = null;
    for (const c of s.fighters) if ((c.wDecoy || c.wPhantom) && c.alive) { c.alive = false; c.visible = false; }
  },
  // the transition itself (BOSS_ABILITIES.roar hands it here): the Witness rises into its new look and speaks; it
  // cannot be hurt or interrupted until it has finished
  // the fight freezes for the phase's dialogue scene (WITNESS_SCENES.shift: it speaks, Kage answers and angers it;
  // Game.playStory stops the fight while it plays), then the new form bursts out and throws Kage back
  shift(f, w) {
    const W = w.wit, dur = 1.5;
    W.storyDone = false;
    f.startAbility({ dur, uninterruptible: true, rate: 8, pose: W.phase >= 3 ? WT_POSE.spread : WT_POSE.raise,
      start(f) { f.invuln = 9; Game.playStory(WITNESS_SCENES.shift[W.phase], () => { W.storyDone = true; }); },
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 10, dt); f.invuln = Math.max(f.invuln, 0.1);
        if (!W.storyDone) { this.t0 = t; return; }
        if (!this.burst) {
          this.burst = 1; const p = w.player, L = WitnessFX.look(f);
          w.fx.banner(`Phase ${ROMAN[W.phase]}`, L.name, L.body, '鏡'); w.fx.popText(f, L.kanji, L.hot);
          w.glitch = Math.max(w.glitch || 0, W.phase >= 2 ? 0.5 : 0.25);
          WitnessFX.shatter(w, f, 1.3); w.fx.ring(f.x, f.y - 140 * f.scale, 420, L.hot, 0.7, 8); w.fx.shake(0.8); w.fx.slowmo(0.5, 0.5);
          w.fx.impactFrame(f.x, f.y - 120, 3); if (w.fx.impact) w.fx.impact.col = L.body;
          AudioManager.play('boss'); AudioManager.play('thunder');
          if (p && p.alive) p.vx = Math.sign(p.x - f.x || 1) * 760;
        }
        if (((t * 60) | 0) % 3 === 0) WitnessFX.gather(w, f.x, f.y - f.height() * 0.6, 160, 1, WitnessFX.look(f).hot);
      },
      end(f) { W.state = 'fight'; f.invuln = Math.min(f.invuln, 0.2); } });
  }
};

/* ======================================================================== */
/* DomainController: Echo Genesis                                             */
/* ======================================================================== */
const WitnessDomain = {
  open(s, f) {
    const D = WITNESS_DOMAIN;
    s.wit.domain = { state: 'activating', t: 0, anchors: [], broken: 0, rules: { input: true, rage: true, zones: true, fakes: true },
      modT: D.modEvery, zoneT: 1.5, fakeT: D.fakeEvery, crack: 0, black: 0, ring: 0, silence: false, lines: 0 };
    s.wit.state = 'domain';
  },
  // the player is held still while the domain opens (Kage frozen mid-animation)
  holds(s, f) { const d = s.wit && s.wit.domain; return !!d && d.state === 'activating' && f === s.player && d.t < D_OPEN(); },
  step(s, f, dt) {
    const W = s.wit, d = W.domain, D = WITNESS_DOMAIN; if (!d) return;
    d.t += dt;
    if (d.state === 'activating') {
      d.black = clamp(d.t / D.black, 0, 1) * (d.t < D.open - 0.3 ? 1 : clamp((D.open - d.t) / 0.3, 0, 1));
      if (d.t >= D.crack) d.crack = Math.min(1, d.crack + dt * 3);
      if (d.t >= D.crack) d.ring = Math.min(1, d.ring + dt * 1.2);
      if (!d.silence && d.t >= D.crack) { d.silence = true; AudioManager.setMusic('none'); s.fx.shake(0.6); AudioManager.play('clang', { pitch: 0.5 }); s.glitch = Math.max(s.glitch || 0, 0.4); }
      if (d.lines === 0 && d.t >= 0.6) { d.lines = 1; Game.playStory(WITNESS_SCENES.genesis); }   // the fight freezes while they speak
      if (d.t >= D.crack + D.silence && !d.drop) { d.drop = true; AudioManager.setMusic('boss'); AudioManager.play('drop'); AudioManager.play('thunder'); s.fx.shake(0.9); }
      if (d.t >= D.open) this.activate(s, f);
      return;
    }
    if (d.state === 'shattered') { d.ring = Math.max(0, d.ring - dt * 0.8); d.crack = Math.max(0, d.crack - dt * 0.8); if (d.ring <= 0) W.domain = null; return; }
    // active: the rules, while their anchors stand
    this.hitAnchors(s);
    for (const a of d.anchors) { a.t += dt; a.flash = Math.max(0, a.flash - dt * 4); }
    if (d.rules.input) { d.modT -= dt; if (d.modT <= 0 && !W.mods.length) { d.modT = D.modEvery; WitnessBoss.randomMod(s, f); } }
    if (d.rules.zones) { d.zoneT -= dt; if (d.zoneT <= 0 && !W.tiles) { d.zoneT = D.zoneEvery; WitnessBoss.rewrite(s, f, { void: 2, warn: 1.0, dur: 2.6, dmg: 6, quiet: true }); } }
    if (d.rules.fakes) { d.fakeT -= dt; if (d.fakeT <= 0) { d.fakeT = D.fakeEvery * rand(0.8, 1.2); this.fakeTell(s); } }
  },
  activate(s, f) {
    const W = s.wit, d = W.domain, D = WITNESS_DOMAIN;
    d.state = 'active'; d.black = 0; d.t = 0;
    if (s.dialogue && s.dialogue.id === 'witness') s.dialogue = null;
    for (let i = 0; i < D.anchors; i++) {
      const x = clamp(D.anchorX[i], s.bounds.l + 60, s.bounds.r - 60);
      const a = { x, hp: D.anchorHp, maxHp: D.anchorHp, t: rand(0, 1), flash: 0, broken: false };
      a.sheet = WitnessFX.play(s, 'wt_anchor', x, 0, { loop: true, scale: 1.05 });
      d.anchors.push(a);
      s.fx.ring(x, -80, 160, WTC.gold, 0.5, 4);
    }
    s.fx.banner('Echo Genesis', 'Break the three Echo Anchors', WTC.looks[3].body, '界');
    s.fx.popText(s.player, 'BREAK THE ANCHORS', WTC.goldHot);
    W.state = 'fight';
  },
  // Kage's blade against the anchors (a melee hitbox, once per swing: the anchor joins his hitList like a fighter)
  hitAnchors(s) {
    const W = s.wit, d = W.domain, p = s.player;
    if (!d || d.state !== 'active' || !p.alive) return;
    const hb = p.hitbox(_wtBox); if (!hb) return;
    for (const a of d.anchors) {
      if (a.broken || p.hitList.includes(a)) continue;
      const box = { x: a.x - 34, y: -230, w: 68, h: 230 };
      if (!overlap(hb, box)) continue;
      p.hitList.push(a);
      const m = p.move || {}, dmg = Math.max(4, (m.dmg || 8) * (p.dmgMul || 1));
      a.hp -= dmg; a.flash = 1;
      s.fx.sparks(a.x, -120, p.facing, 10, WTC.looks[3].hot); AudioManager.play('clang', { pitch: 1.5 }); s.fx.shake(0.15);
      p.rage = Math.min(100, p.rage);   // striking an anchor gives no rage (the domain still holds it)
      if (a.hp <= 0) this.breakAnchor(s, a);
    }
  },
  breakAnchor(s, a) {
    const W = s.wit, d = W.domain, D = WITNESS_DOMAIN, f = s.enemy;
    a.broken = true; a.hp = 0; d.broken++;
    if (a.sheet) a.sheet.stop = true;
    if (!WitnessFX.play(s, 'wt_anchor_break', a.x, 0, { scale: 1.05 })) { WitnessFX.burst(s, a.x, -120, 26, WTC.looks[3].hot, 1.2); s.fx.ring(a.x, -10, 200, WTC.gold, 0.5, 4); }
    s.fx.stop(0.06); s.fx.shake(0.4); AudioManager.play('guardbreak');
    const rule = D.restore[d.broken - 1];
    if (rule) d.rules[rule] = false;
    if (rule === 'input') { WitnessInput.clear(s); d.rules.fakes = false; }
    if (rule === 'rage') W.rageLock = 0;
    s.fx.popText(s.player, d.broken < D.anchors ? `CONTROL RESTORED ${d.broken}/${D.anchors}` : 'DOMAIN SHATTERED', WTC.goldHot);
    if (d.broken >= D.anchors) this.shatter(s, f);
  },
  // all three anchors down: the domain breaks, every rule lifts, the Witness reels
  shatter(s, f) {
    const W = s.wit, d = W.domain;
    d.state = 'shattered';
    for (const k in d.rules) d.rules[k] = false;
    WitnessInput.clear(s); W.rageLock = 0;
    if (W.tiles) W.tiles.until = 0;
    s.fx.stamp('DOMAIN SHATTERED', f.x, f.y - 220 * f.scale, 3, WTC.gold, 'ECHO GENESIS BROKEN');
    s.fx.impactFrame(f.x, f.y - 120, 3); s.fx.slowmo(0.4, 0.7); s.glitch = Math.max(s.glitch || 0, 0.6);
    if (f.alive) { if (f.abil) { f.abil.uninterruptible = false; f.endAbility(s); } f.setState('stun'); f.stunT = WITNESS_DOMAIN.stagger; }
    WitnessFX.shatter(s, f, 1.2);
  },
  // a false attack indicator: a hollow, flickering mark with no glint and no blow behind it (the real tells are solid)
  fakeTell(s) {
    const W = s.wit, p = s.player;
    W.haz.push({ kind: 'fake', x: clamp(p.x + rand(-260, 260), s.bounds.l + 60, s.bounds.r - 60), t: 0, life: 1.1, w: rand(120, 180) });
  }
};
function D_OPEN() { return WITNESS_DOMAIN.open; }
const _wtBox = { x: 0, y: 0, w: 0, h: 0 };

/* ======================================================================== */
/* WitnessBoss: the session glue                                              */
/* ======================================================================== */
const WitnessBoss = {
  is(f) { return !!(f && f.def && f.def.witness && !f.clone); },
  // the look (0-3) the Witness wears: its phase in a fight, a copy's owner's, or f.wLook (story stills, the HUD card)
  lookOf(f) {
    if (!f) return 0;
    if (f.wOwner) return this.lookOf(f.wOwner);
    if (f.ai && f.ai.phaseData && f.ai.phaseData.look != null) return f.ai.phaseData.look;
    return f.wLook || 0;
  },
  // the Witness's cuts take its phase's element (35-vfx.js ELEMENTS: echo blue, void violet, crown magenta-gold)
  element(f) { return WTC.looks[this.lookOf(f)].el; },
  init(s) {
    if (s.wit || !this.is(s.enemy)) return s.wit;
    s.wit = { phase: 0, state: 'fight', shiftT: 0, haloDir: 1, grade: 0, gradeFrom: 0, gradeK: 1,
      log: [], pState: null, tauntT: 0, mods: [], hist: [], raw: null, frame: 0,
      haz: [], tiles: null, tether: null, well: null, orbit: null, frames: null,
      atkLog: [], history: [], lie: null, lieT: 6, hudGlitch: 0, fake: null, rageLock: 0, rage0: 0,
      domain: null, domainNext: false, aura: null, auraName: null, counterT: 0, defeat: null };
    return s.wit;
  },
  // FightSession.simulate, after the devices were read: the InputModifierLayer
  input(s, ctrl, dt) { const W = this.init(s); if (!W) return; if (s.phase === 'fight') WitnessInput.apply(s, ctrl, dt); else WitnessInput.clear(s); },
  // FightSession.simulate's hold: a fighter frozen by the Witness (Kage while Echo Genesis opens)
  holds(s, f) { return !!(s.wit && WitnessDomain.holds(s, f)); },
  // FightSession.onPlayerAction
  track(s, key) { if (s.wit) WitnessTracker.track(s, key); },
  // FightSession.simulate, every step of a Witness fight
  step(s, dt) {
    const f = s.enemy;
    if (!this.is(f)) return;
    const W = this.init(s), p = s.player;
    W.rage0 = p.rage;
    f.wHaloDir = W.haloDir; f.wOrbit = W.orbit;   // the halo's turn and its lit / loosed cards (drawn by the art)
    WitnessTracker.step(s);
    // the arena's light crossfades into the phase's (the grade the renderer reads)
    W.gradeK = Math.min(1, W.gradeK + dt * 0.8); W.grade = lerp(W.gradeFrom, W.phase, Ease.inOut(W.gradeK));
    WitnessFX.aura(s, f, dt);
    WitnessHUD.step(s, dt);
    if (W.domainNext && s.phase === 'fight' && W.state === 'fight' && f.canAct() && !f.abil) { W.domainNext = false; f.ai.cds.echoGenesis = 600; BOSS_ABILITIES.echoGenesis.run(f, s, f.ai, p); }
    if (W.domain) WitnessDomain.step(s, f, dt);
    // Timeline Break's replay, the moment the rewind is over
    if (W.replayNext && s.phase === 'fight' && f.alive && !f.abil && f.canAct()) { const id = W.replayNext; W.replayNext = null; BOSS_ABILITIES[id].run(f, s, f.ai, p); }
    this.direct(s, f, p, dt);
    this.stepHaz(s, f, dt);
    if (W.fake) { W.fake.t += dt; }
    // a copy of the Witness (Phantom Counter, Mirror Self) never outlives its owner's attack
    for (const c of s.fighters) if ((c.wPhantom || c.wDecoy) && c.alive && c.life <= 0.05) { c.alive = false; c.visible = false; WitnessFX.cards(s, c.x, c.y - 120 * c.scale, 10, WitnessFX.look(c).body); }
  },
  /* The intensity director: whenever the Witness has stood free for its phase's pace (WITNESS_PACE.idle, shorter every
     phase) it acts at once. Within reach its blade (Echo Combo) is the likeliest answer; otherwise any of its phase's
     attacks that is off cool-down and in range. The cool-down it sets follows the phase's tempo. */
  direct(s, f, p, dt) {
    const W = s.wit, ai = f.ai;
    const free = s.phase === 'fight' && W.state === 'fight' && f.alive && !f.abil && f.canAct() && !ai.playback && !ai.seq && p.alive
      && p.state !== 'down' && p.state !== 'getup' && !(W.domain && W.domain.state === 'activating');
    if (!free) { W.idleT = 0; return; }
    W.idleT = (W.idleT || 0) + dt;
    if (W.idleT < WITNESS_PACE.idle[W.phase]) return;
    const dist = Math.abs(p.x - f.x), list = (ai.phaseData && ai.phaseData.abilities) || [];
    const ok = id => { const a = BOSS_ABILITIES[id]; return a && id !== 'phantomCounter' && (ai.cds[id] || 0) <= 0 && dist >= a.range[0] && dist <= a.range[1] && (!a.cond || a.cond(f, s, ai, p, dist)); };
    const ready = list.filter(ok);
    if (!ready.length) return;
    const id = ready.includes('echoCombo') && chance(WITNESS_PACE.combo) ? 'echoCombo' : pick(ready);
    W.idleT = 0;
    ai.cds[id] = BOSS_ABILITIES[id].cd * ((ai.phaseData.tempo && ai.phaseData.tempo.cd) || 1);
    BOSS_ABILITIES[id].run(f, s, ai, p);
  },
  // end of FightSession.simulate: rage suppression (growth stopped, what Kage had stays)
  after(s) {
    const W = s.wit; if (!W) return;
    const p = s.player;
    if (WitnessHUD.rageLocked(s) && p.rage > W.rage0) p.rage = W.rage0;
  },
  // FightSession.onBossPhase
  phase(s, f, idx, ph) { if (this.is(f)) { this.init(s); WitnessPhases.enter(s, f, idx, ph); } },
  // BOSS_ABILITIES.roar for the Witness: its own shift
  shift(f, w) { if (!w.wit) this.init(w); WitnessPhases.shift(f, w); },
  // FightSession.onHit: a blow on the Witness while it drains Kage interrupts the tether once it adds up
  onHit(s, att, def, dmg) {
    const W = s.wit; if (!W) return;
    if (def === s.enemy && att.isPlayer && !(W.hitT > s.time)) { W.hitT = s.time + 0.05; WitnessFX.hit(s, def, att.facing); }
    const t = W.tether;
    if (t && def === s.enemy && att.isPlayer) { t.dealt += dmg; if (t.dealt >= t.breakDmg) this.breakTether(s, 'INTERRUPTED'); }
  },
  // FightSession.onKO: the Witness falls. The arena goes quiet, the Echo System destabilises and it speaks its last line
  // before the defeat scene (the reabsorb follows it, FightSession.bossExit)
  onKO(s, def) {
    const W = s.wit; if (!W || def !== s.enemy) return;
    WitnessInput.clear(s); W.rageLock = 0; W.lie = null; W.fake = null;
    WitnessPhases.clearHaz(s);
    if (W.domain) { W.domain.state = 'shattered'; for (const a of W.domain.anchors) if (a.sheet) a.sheet.stop = true; }
    W.defeat = { t: 0 }; W.state = 'defeat';
    WitnessFX.shatter(s, def, 1.3);   // its last words open the defeat scene (core.witness.defeat)
    s.glitch = Math.max(s.glitch || 0, 0.8);
    AudioManager.setMusic('none');
  },
  // FightSession.updateCamera: the domain and the screen-wide moves need a wider frame
  camera(s, tz, ty) {
    const W = s.wit; if (!W) return null;
    const wide = (W.domain && W.domain.state !== 'shattered') || W.haz.some(h => h.kind === 'judgment' || h.kind === 'tiles') || W.well;
    if (!wide) return null;
    return { tz: Math.min(tz, 0.86), ty: ty - 20 };
  },
  // phase III-IV's corrupted floor (Reality Rewrite, and the domain's shifting safe zones): `void` tiles warned, then
  // rewritten for `dur` seconds. Never all of them, and never the tile Kage stands on twice in a row.
  rewrite(s, f, o) {
    const W = s.wit, n = WITNESS_MOVES.realityRewrite.tiles, L = s.bounds.l, w = (s.bounds.r - L) / n;
    const here = clamp(Math.floor((s.player.x - L) / w), 0, n - 1), pool = [];
    for (let i = 0; i < n; i++) if (!(W.lastVoid && W.lastVoid.includes(i) && i === here)) pool.push(i);
    const pickN = [];
    // the tile under Kage is always one of them (he has to move), the rest at random
    if (!(W.lastVoid && W.lastVoid.includes(here))) pickN.push(here);
    while (pickN.length < Math.min(o.void, n - 2)) { const i = pick(pool); if (!pickN.includes(i)) pickN.push(i); }
    W.lastVoid = pickN;
    W.tiles = { L, w, n, void: pickN, t: 0, warn: o.warn, until: o.warn + o.dur, dmg: o.dmg, tick: WITNESS_MOVES.realityRewrite.tick, hitT: 0 };
    if (!o.quiet) s.fx.popText(s.player, 'THE FLOOR IS REWRITTEN', WitnessFX.look(f).hot);
  },
  // a modifier at random (the domain's input rule, and the Manipulator's hand-cast ones go through the same door)
  randomMod(s, f, kind) {
    const p = s.player, k = kind || pick(['bind', 'reverse', 'delay']);
    const toward = Math.sign(f.x - p.x) || 1;
    if (k === 'bind') return WitnessInput.add(s, { kind: 'bind', dir: -toward, warn: 0.55, dur: 1.1, label: `BOUND: ${-toward > 0 ? 'RIGHT' : 'LEFT'} LOCKED` });
    if (k === 'reverse') return WitnessInput.add(s, { kind: 'reverse', warn: 0.7, dur: 1.2, label: 'REVERSED' });
    const set = chance(0.5) ? 'attacks' : 'movement';
    return WitnessInput.add(s, { kind: 'delay', keys: WITNESS_INPUT.delayKeys[set], delay: WITNESS_MOVES.inputDelay.delay, warn: 0.6, dur: 1.2, label: `DELAYED: ${set.toUpperCase()}` });
  },
  breakTether(s, why) {
    const t = s.wit.tether; if (!t) return;
    s.wit.tether = null;
    if (t.sheet) t.sheet.stop = true;
    s.fx.popText(s.player, why || 'TETHER BROKEN', WTC.cyan);
    WitnessFX.burst(s, (t.owner.x + s.player.x) / 2, -150, 14, WitnessFX.look(t.owner).hot);
    AudioManager.play('clang', { pitch: 1.7 });
  },
  // a hit from one of the Witness's hazards (dash i-frames get through: Combat.area skips invulnerable fighters)
  strike(s, f, box, o) {
    const hit = Combat.area(s, f, box, Object.assign({ kb: 380, up: -260, hs: 0.4, imp: 2, hsnd: 'slash', dir: f.facing }, o));
    if (hit && s.fx.impact && s.fx.impact.t < 0.02) s.fx.impact.col = WitnessFX.look(f).body;   // its impact frames in its phase's colour (drawing only)
    return hit;
  },

  /* ---- the hazards: blade waves, orbit blades, the gravity well, the floor, the tether, lines, walls, fakes ---- */
  stepHaz(s, f, dt) {
    const W = s.wit, p = s.player;
    const live = f.alive && s.phase === 'fight';
    for (let i = W.haz.length - 1; i >= 0; i--) {
      const h = W.haz[i]; h.t += dt;
      if (!live) { if (h.sheet && h.sheet !== 1) h.sheet.stop = true; W.haz.splice(i, 1); continue; }
      const done = this.hazStep(s, f, h, dt, p);
      if (done || h.t >= h.life) { if (h.sheet && h.sheet !== 1) h.sheet.stop = true; W.haz.splice(i, 1); }
    }
    // the corrupted floor
    const T = W.tiles;
    if (T) {
      T.t += dt;
      if (T.t >= T.warn && !T.bit && live) { T.bit = true; for (const i of T.void) WitnessFX.play(s, 'wt_rewrite', T.L + (i + 0.5) * T.w, 0, { scale: 1.15 }); AudioManager.play('stamp', { pitch: 0.7 }); }
      if (T.t >= T.until || !live) W.tiles = null;
      else if (T.t >= T.warn && p.alive && p.grounded) {
        const i = clamp(Math.floor((p.x - T.L) / T.w), 0, T.n - 1);
        T.hitT -= dt;
        if (T.void.includes(i) && T.hitT <= 0 && p.invuln <= 0) {
          T.hitT = T.tick;
          Combat.damage(s, f, p, T.dmg * f.dmgMul, { dmg: T.dmg, hsnd: 'punch' }, p.x, p.y - 20, Math.sign(p.x - f.x) || 1, 0);
          s.fx.part({ x: p.x, y: -4, vx: 0, vy: -260, life: 0.4, size: 4, color: WitnessFX.look(f).hot, type: 'spark', grav: 0, drag: 1, add: true });
          s.glitch = Math.max(s.glitch || 0, 0.12);
        }
      }
    }
    // the health drain's tether
    const t = W.tether;
    if (t) {
      t.t += dt;
      const d = Math.abs(p.x - t.owner.x);
      if (!live || !p.alive || t.t >= t.dur || !t.owner.alive || t.owner.state === 'stun' || t.owner.state === 'hit') this.breakTether(s, t.t >= t.dur ? 'TETHER FADES' : 'TETHER BROKEN');
      else if (d > t.reach) this.breakTether(s, 'OUT OF SIGHT');
      else if (p.invuln <= 0) {
        if (t.sheet) { t.sheet.x = p.x; t.sheet.y = p.y; t.sheet.dir = t.owner.x < p.x ? 1 : -1; }
        const amt = t.rate * dt * f.dmgMul;
        p.hp -= amt; t.owner.hp = Math.min(t.owner.maxHp, t.owner.hp + amt * t.heal); t.drained += amt;
        if (((t.t * 60) | 0) % 5 === 0) s.fx.part({ x: p.x, y: p.y - 100, vx: Math.sign(t.owner.x - p.x) * 300, vy: -40, life: 0.5, size: 2.4, color: WitnessFX.look(f).hot, type: 'spark', grav: 0, drag: 0.5, add: true });
        if (p.hp <= 0) { p.hp = 0.0001; Combat.damage(s, f, p, 1, { dmg: 1, hsnd: 'slash' }, p.x, p.y - 100, 1, 3); }
      }
    }
    // the gravity well
    const g = W.well;
    if (g) {
      g.t += dt;
      if (!live) W.well = null;
      else {
        const k = g.t < 0.4 ? g.t / 0.4 : 1;
        if (p.alive && p.state !== 'dash' && p.state !== 'grabbed' && g.t < g.dur) {
          const dx = g.x - p.x, pull = g.pull * k * (p.grounded ? 1 : 0.55);
          if (Math.abs(dx) > 6) p.x += Math.sign(dx) * Math.min(Math.abs(dx), pull * dt);
        }
        if (g.t >= g.dur && !g.done) {
          g.done = true;
          s.fx.shake(0.7); AudioManager.play('slam', { pitch: 0.7 }); s.fx.impactFrame(g.x, -100, 2);
          WitnessFX.burst(s, g.x, -100, 30, WitnessFX.look(f).hot, 1.4);
          this.strike(s, f, { x: g.x - g.core, y: -260, w: g.core * 2, h: 260 }, { dmg: g.dmg * f.dmgMul, kb: 520, up: -520, kd: 1, imp: 3, hsnd: 'heavy', stamp: 'COLLAPSE', unb: 1, dir: Math.sign(p.x - g.x) || 1 });
          if (g.sheet) g.sheet.stop = true;
        }
        if (g.t >= g.dur + 0.4) W.well = null;
      }
    }
  },
  // one hazard's tick; true when it is finished
  hazStep(s, f, h, dt, p) {
    const L = WitnessFX.look(f);
    switch (h.kind) {
      case 'wave': {   // Void Slash: a blade wave along the floor (jump it, or dash through)
        h.x += h.dir * h.speed * dt;
        if (h.sheet && h.sheet !== 1) h.sheet.x = h.x;
        if (!h.hit) {
          const box = { x: h.x - 22, y: -h.h, w: 44, h: h.h };
          if (this.strike(s, f, box, { dmg: h.dmg * f.dmgMul, kb: 300, up: -300, hs: 0.35, imp: 2, stamp: 'VOID', dir: h.dir })) h.hit = true;
        }
        if (((h.t * 60) | 0) % 3 === 0) s.fx.part({ x: h.x - h.dir * 10, y: -rand(10, h.h), vx: -h.dir * 60, vy: -20, life: 0.4, size: rand(2, 3.5), color: chance(0.5) ? L.hot : L.body, type: 'ash', grav: 0, drag: 2, rot: rand(0, TAU), vr: 4 });
        return h.x < s.bounds.l - 120 || h.x > s.bounds.r + 120;
      }
      case 'orb': {   // Orb Pulse: one orb shot flying straight at where Kage was (blockable)
        h.x += h.vx * dt; h.y += h.vy * dt;
        if (h.sheet && h.sheet !== 1) { h.sheet.x = h.x; h.sheet.y = h.y; }
        const end = () => { if (!WitnessFX.play(s, 'wt_orb_hit', h.x, h.y, { scale: 0.8, dir: Math.sign(h.vx) || 1 })) { s.fx.ring(h.x, h.y, 60, L.hot, 0.3, 3); WitnessFX.burst(s, h.x, h.y, 8, L.hot, 0.6); } return true; };
        if (!h.hit && this.strike(s, f, { x: h.x - 20, y: h.y - 20, w: 40, h: 40 }, { dmg: h.dmg * f.dmgMul, kb: 260, up: -140, hs: 0.28, imp: 2, hsnd: 'punch', stamp: 'ORB', dir: Math.sign(h.vx) || 1 })) { h.hit = true; return end(); }
        if (h.y > -4) return end();
        return h.x < s.bounds.l - 200 || h.x > s.bounds.r + 200;
      }
      case 'blade': {   // Orbit Blades: one halo blade flying straight at where Kage was
        h.x += h.vx * dt; h.y += h.vy * dt;
        if (h.sheet && h.sheet !== 1) { h.sheet.x = h.x; h.sheet.y = h.y; }
        if (!h.hit && this.strike(s, f, { x: h.x - 16, y: h.y - 16, w: 32, h: 32 }, { dmg: h.dmg * f.dmgMul, kb: 220, up: -120, hs: 0.25, imp: 1, hsnd: 'slash', stamp: 'BLADE', dir: Math.sign(h.vx) || 1 })) { h.hit = true; WitnessFX.cards(s, h.x, h.y, 6, L.hot); return true; }
        if (h.y > -4) { s.fx.sparks(h.x, -4, Math.sign(h.vx) || 1, 6, L.hot); return true; }
        return h.x < s.bounds.l - 200 || h.x > s.bounds.r + 200;
      }
      case 'line': {   // Echo Execution: an afterimage's strike along its line, after its tell
        if (!h.cut && h.t >= h.delay) {
          h.cut = true;
          const dx = Math.cos(h.a), dy = Math.sin(h.a), n = 8, hitR = 34;
          for (let k = 0; k <= n && !h.hit; k++) {
            const x = h.x0 + dx * h.len * k / n, y = h.y0 + dy * h.len * k / n;
            if (this.strike(s, f, { x: x - hitR, y: y - hitR, w: hitR * 2, h: hitR * 2 }, { dmg: h.dmg * f.dmgMul, kb: 340, up: -220, hs: 0.4, imp: 2, stamp: 'ECHO', unb: h.unb ? 1 : 0, dir: Math.sign(dx) || 1 })) h.hit = true;
          }
          s.fx.shake(0.25); AudioManager.play('heavyswing', { pitch: 1.2 });
        }
        return h.t >= h.delay + 0.3;
      }
      case 'wall': {   // Absolute Control: a wall of blades at an arena edge
        if (h.t >= h.warn && !h.hit && ((h.t * 60) | 0) % 6 === 0) {
          if (this.strike(s, f, { x: h.x - h.w / 2, y: -320, w: h.w, h: 320 }, { dmg: h.dmg * f.dmgMul, kb: 420, up: -380, hs: 0.45, imp: 3, hsnd: 'heavy', stamp: 'CONTROL', kd: 1, unb: 1, dir: -h.side })) h.hit = true;
        }
        return false;
      }
      case 'pull': {   // Forced Echo Step / Absolute Control: Kage drawn toward a point (a dash or a jump breaks it)
        if (h.t < h.warn) return false;
        if (p.state === 'dash' || !p.grounded || p.state === 'grabbed') { if (!h.broke) { h.broke = true; s.fx.popText(p, 'BROKE FREE', WTC.cyan); } return true; }
        const dx = h.tx - p.x;
        if (Math.abs(dx) > 10) p.x += Math.sign(dx) * Math.min(Math.abs(dx), h.speed * dt);
        p.vx = 0;
        return Math.abs(dx) <= 10;
      }
      case 'judgment': {   // Final Judgment's cut: only a dash through it or a guard raised the instant it flashes survives
        if (!h.cut && h.t >= h.delay) {
          h.cut = true;
          const perfect = p.state === 'block' && p.st <= h.perfect && p.alive;
          if (perfect) {
            s.fx.stamp('PERFECT GUARD', p.x, p.y - 200, 3, WTC.goldHot, 'JUDGMENT DENIED');
            s.fx.impactFrame(p.x, p.y - 120, 3); s.fx.slowmo(0.35, 0.6); AudioManager.play('parry');
            p.rage = Math.min(100, p.rage + (WitnessHUD.rageLocked(s) ? 0 : 20));
            if (f.alive) { if (f.abil) { f.abil.uninterruptible = false; f.endAbility(s); } f.setState('stun'); f.stunT = WITNESS_MOVES.finalJudgment.stagger; }
          } else if (p.alive && p.invuln > 0 && p.state === 'dash') {
            s.fx.stamp('THROUGH', p.x, p.y - 200, 2, WTC.goldHot); s.fx.slowmo(0.4, 0.4);
          } else {
            this.strike(s, f, { x: s.bounds.l - 100, y: -h.h, w: s.bounds.r - s.bounds.l + 200, h: h.h }, { dmg: h.dmg * f.dmgMul, kb: 640, up: -480, hs: 0.6, imp: 3, hsnd: 'heavy', stamp: 'JUDGMENT', kd: 1, unb: 1, dir: Math.sign(p.x - f.x) || 1 });
          }
          s.fx.shake(1); AudioManager.play('thunder'); AudioManager.play('impact');
        }
        return h.t >= h.delay + 0.5;
      }
      case 'frame': {   // Execution Frames: the frame closed on Kage's column, then the strike
        if (!h.cut && h.t >= h.delay) {
          h.cut = true;
          this.strike(s, f, { x: h.x - h.w / 2, y: -520, w: h.w, h: 520 }, { dmg: h.dmg * f.dmgMul, kb: 300, up: -620, hs: 0.6, imp: 3, hsnd: 'heavy', stamp: 'EXECUTED', kd: 1, unb: 1 });
          if (!WitnessFX.play(s, 'wt_exec', h.x, 0, { scale: 1.15, start: 0.03 })) { s.fx.impactFrame(h.x, -200, 3); WitnessFX.burst(s, h.x, -150, 30, L.hot, 1.4); }
          s.fx.shake(1); AudioManager.play('impact'); AudioManager.play('slam');
        }
        return h.t >= h.delay + 0.4;
      }
      case 'fold': return false;    // Echo Step's mark behind Kage (drawn; its attack reads it)
      case 'thread': return false;  // a control thread from the Witness's hand to Kage (drawn)
      case 'fake': return false;    // the domain's false indicator: nothing behind it
    }
    return false;
  },
  haz(s, h) { h = Object.assign({ t: 0, life: 4 }, h); s.wit.haz.push(h); return h; },

  /* ---- Phase I: pattern learning ---- */
  // AIController.update, the moment a threat starts: an overused move is answered by a Phantom Counter (phase I, and
  // the True Witness), more likely the more Kage leans on it. The Witness itself stays free.
  onThreat(ai, p) {
    const f = ai.f, w = ai.world;
    if (!this.is(f) || !w.wit || w.wit.state !== 'fight' || !p.move || p.move.kind === 'throw') return false;
    const list = ai.phaseData ? ai.phaseData.abilities : [];
    if (!list.includes('phantomCounter') || (ai.cds.phantomCounter || 0) > 0 || w.wit.counterT > w.time) return false;
    const r = WitnessTracker.read(w), key = Logic.spamKey(p.move);
    if (!r.overused || r.top !== key) return false;
    const c = clamp(0.2 + (r.share - WITNESS_ADAPT.overuse) * WITNESS_ADAPT.counter + (ai.phaseData.adaptive ? 0.15 : 0), 0, 0.85);
    if (!chance(c)) { w.wit.counterT = w.time + 0.8; return false; }
    ai.cds.phantomCounter = WITNESS_MOVES.phantomCounter.cd;
    WitnessTracker.taunt(w, f, 'overuse');
    this.phantom(f, w, p);
    return true;
  },
  // the spam read is likelier against a move the Witness has already marked as overused (never certain)
  readBonus(ai, read) {
    const f = ai.f, w = ai.world;
    if (!this.is(f) || !w.wit) return 0;
    const r = WitnessTracker.read(w);
    return r.overused && read && read.key === r.top ? WITNESS_ADAPT.readBonus * (r.share - WITNESS_ADAPT.overuse + 0.5) : 0;
  },
  // a copy of the Witness behind Kage, cutting once (blockable), then gone
  phantom(f, w, p) {
    const m = WITNESS_MOVES.phantomCounter, side = -p.facing, x = clamp(p.x + side * 110 * p.scale, w.bounds.l + 30, w.bounds.r - 30);
    const c = this.copy(f, w, x, { phantom: true, life: 1.4 });
    c.facing = p.x > x ? 1 : -1;
    WitnessFX.step(w, f, x);
    WitnessAttack.run(c, w, f.ai, 'phantomCounter', { quiet: true, noFace: true, trail: true,
      pose: (stage) => (stage === 'telegraph' ? WT_POSE.low : WT_POSE.cut),
      start(c, w) { w.fx.popText(c, 'PHANTOM COUNTER', WitnessFX.look(f).hot); },
      enter(stage, c, w) { if (stage === 'startup') WitnessFX.glint(c, w); if (stage === 'active') { c.vx = c.facing * 560; AudioManager.play('swing', { pitch: 1.2 }); } },
      active(c, w, atk) { if (!atk.data.hit) atk.data.hit = WitnessBoss.strike(w, c, fbox(c, -10, -220, 190, 220), { dmg: m.dmg * f.dmgMul, kb: 320, up: -200, stamp: 'COUNTER' }); },
      recovery(c, w, atk, u, dt) { c.vx = damp(c.vx, 0, 10, dt); },
      end(c) { c.life = Math.min(c.life, 0.05); } });
  },
  // a copy of the Witness: no AI, its owner's look; `decoy` copies (Mirror Self) vanish when struck and cast no shadow
  copy(f, w, x, o) {
    const c = w.makeEnemy(f.def.id, x, { clone: true, facing: f.facing }, 'clone');
    c.clone = true; c.ai = null; c.wOwner = f; c.hp = c.maxHp = 1; c.life = o.life || 2; c.y = 0; c.grounded = true;
    c.dmgMul = f.dmgMul; c.alpha = o.alpha || 0.92;
    if (o.phantom) { c.wPhantom = true; c.eye = WitnessFX.look(f).hot; }
    if (o.decoy) { c.wDecoy = true; c.decoy = f; }
    w.fighters.push(c);
    return c;
  }
};

/* ======================================================================== */
/* The attacks (registered into BOSS_ABILITIES)                               */
/* ======================================================================== */
const wtSide = (w, x) => clamp(x, w.bounds.l + 40, w.bounds.r - 40);
Object.assign(BOSS_ABILITIES, {
  /* ---- every phase: its own blade ---- */
  // Echo Combo: a string of cuts (3 in phase I, 4 in II and III, 5 in IV), each dashing in with its own slash; from
  // phase III it blinks to Kage's other side between cuts. The last cut is a heavy finisher that floors him. Blockable.
  echoCombo: { id: 'echoCombo', cd: WITNESS_MOVES.echoCombo.cd, range: WITNESS_MOVES.echoCombo.range, chance: WITNESS_MOVES.echoCombo.chance,
    // Mugen no Ha's string (21-characters/bosses/witness/weapon.js): every cut a full-body heave of the greatsword that
    // lunges in, crushes a guard (`gb`) and shakes the floor; from phase III it blinks through Kage between cuts. The last
    // is an overhead cleave driven into the floor that knocks down and sends floor waves out (jump them).
    run(f, w, ai) {
      const m = WITNESS_MOVES.echoCombo, p = w.player, look = WitnessBoss.lookOf(f), n = m.cuts[look] || 3;
      const poses = [RAIKON_POSE.swingThrough, TAKASHI_POSE.cleaveLow, WT_POSE.cut, RAIKON_POSE.swingThrough], rots = [-0.3, 0.42, -0.1, 0.5];
      const reach = () => 70 * f.scale + f.weaponLen();
      WitnessAttack.run(f, w, ai, 'echoCombo', { trail: true,
        pose: (stage, u) => {
          if (stage === 'telegraph') return RAIKON_POSE.swingBack;
          if (stage !== 'active') return WT_POSE.cut;
          const t = u * m.active, k = Math.min(n - 1, Math.floor(t / m.every)), v = (t - k * m.every) / m.every;
          if (k === n - 1) return v < 0.3 ? RAIKON_POSE.overhead : RAIKON_POSE.slam;   // the cleave: raised, then driven down
          return v < 0.22 ? RAIKON_POSE.swingBack : poses[k % poses.length];              // a heave back, then the cut thrown through
        },
        telegraph(f, w, atk, u) { if (u > 0.6 && !atk.data.glint) { atk.data.glint = 1; WitnessFX.glint(f, w); } },
        active(f, w, atk, u, dt) {
          const t = u * m.active, k = Math.floor(t / m.every), last = k === n - 1;
          if (k < n && k !== atk.data.k) {
            atk.data.k = k; atk.data.hit = false; atk.data.t0 = t; atk.data.fx = false;
            if (look >= 2 && k % 2 === 1) {   // a blink through Kage to his other side
              WitnessFX.step(w, f, f.x);
              f.x = wtSide(w, p.x + Math.sign(p.x - f.x || 1) * 120 * f.scale);
              WitnessFX.step(w, f, f.x);
            }
            f.facing = p.x > f.x ? 1 : -1;
            f.vx = f.facing * Math.min(m.dash, Math.max(0, Math.abs(p.x - f.x) - 110 * f.scale)) / 0.16;
            AudioManager.play('heavyswing', { pitch: last ? 0.6 : 0.78 + k * 0.05 });
          }
          f.vx = damp(f.vx, 0, 8, dt);
          if (k >= n) return;
          const since = t - atk.data.t0, swing = last ? 0.3 * m.every : 0.22 * m.every;
          if (since < swing) return;   // the heave back before each cut
          if (!atk.data.fx) {
            atk.data.fx = true;
            const sx = f.x + f.facing * 110 * f.scale, sy = f.y - (last ? 90 : 120) * f.scale;
            if (!WitnessFX.play(w, look >= 2 ? 'wt_slash_glitch' : 'wt_slash', sx, sy, { dir: f.facing, scale: f.scale * (last ? 1.4 : 1.05), rot: last ? 1.1 : rots[k % rots.length] })) w.fx.ring(sx, sy, 120, WitnessFX.look(f).hot, 0.25, 4);
            w.fx.shake(last ? 0.3 : 0.12);
            if (last) {   // the cleave lands: the floor splits and waves run out from the blade
              const x = f.x + f.facing * f.weaponLen() * 0.9, L = WitnessFX.look(f);
              w.fx.dust(x, 0, 16); w.fx.ring(x, -6, 150, L.hot, 0.3, 4); WitnessFX.burst(w, x, -10, 12, L.hot, 0.8);
              AudioManager.play('slam', { pitch: 0.8 });
              for (let i = 0; i < (m.waves[look] || 1); i++) {
                const dir = i === 0 ? f.facing : -f.facing;
                const h = WitnessBoss.haz(w, { kind: 'wave', x, dir, speed: m.wave.speed, h: m.wave.h, dmg: m.wave.dmg, life: 2.4 });
                h.sheet = WitnessFX.play(w, 'wt_wave', x, 0, { dir, scale: 0.56, loop: true }) || 1;
              }
            }
          }
          if (!atk.data.hit && since - swing < 0.13) {
            const box = last ? fbox(f, -20, -280, reach() + 20 * f.scale, 280) : fbox(f, -30, -260, reach(), 260);
            atk.data.hit = WitnessBoss.strike(w, f, box, last
              ? { dmg: m.finisher * f.dmgMul, kb: 600, up: -520, hs: 0.55, imp: 3, kd: 1, hsnd: 'heavy', stamp: 'ECHO CLEAVE', gb: m.finisher * m.gb }
              : { dmg: m.dmg * f.dmgMul, kb: 320, up: -140, hs: 0.26, imp: 2, hsnd: 'heavy', gb: m.dmg * m.gb });
            if (atk.data.hit) { w.fx.shake(last ? 0.7 : 0.3); if (last) w.fx.slowmo(0.45, 0.35); }
          }
        },
        recovery(f, w, atk, u, dt) { f.vx = damp(f.vx, 0, 10, dt); } });
    } },
  // Echo Breaker: the greatsword raised overhead while a mark opens under Kage (it follows him), a leap high over
  // him, a hang at the top, then the blade plunged down onto the mark: a blast round it and a floor wave each way
  echoBreaker: { id: 'echoBreaker', cd: WITNESS_MOVES.echoBreaker.cd, range: WITNESS_MOVES.echoBreaker.range, chance: WITNESS_MOVES.echoBreaker.chance,
    run(f, w, ai) {
      const m = WITNESS_MOVES.echoBreaker, p = w.player, L = WitnessFX.look(f);
      WitnessAttack.run(f, w, ai, 'echoBreaker', { trail: true, unint: true, armor: true,
        pose: (stage) => (stage === 'telegraph' || stage === 'startup' ? RAIKON_POSE.overhead : RAIKON_POSE.slam),
        start(f, w, atk) { atk.data.tx = p.x; },
        telegraph(f, w, atk, u, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (u < 0.8) atk.data.tx = wtSide(w, p.x);
          if (((atk.t * 60) | 0) % 6 === 0) w.fx.groundMark(atk.data.tx, 0.25, L.glow);
          if (u > 0.7 && !atk.data.glint) { atk.data.glint = 1; WitnessFX.glint(f, w); }
        },
        enter(stage, f, w, atk) {
          if (stage === 'startup') {   // the leap
            f.grounded = false; f.vy = -1250; f.vx = clamp((atk.data.tx - f.x) * 0.85 / 0.42, -1100, 1100);
            f.facing = atk.data.tx > f.x ? 1 : -1; AudioManager.play('djump'); w.fx.dust(f.x, 0, 10);
          }
          if (stage === 'active') {   // the plunge
            if (f.abil) f.abil.float = false;
            f.vx = (atk.data.tx - f.x) / 0.16; f.vy = 2100; AudioManager.play('heavyswing', { pitch: 0.55 });
          }
        },
        startup(f, w, atk, u) {
          if (u > 0.84 && f.abil && !f.abil.float) { f.abil.float = true; f.vx = 0; f.vy = 0; }   // the hang at the top
          w.fx.groundMark(atk.data.tx, 0.12, L.glow);
        },
        active(f, w, atk, u, dt) {
          if (!f.grounded) { if (((atk.t * 60) | 0) % 2 === 0) w.fx.afterimage(f, `rgba(${L.glow.join(',')},0.3)`, { dur: 0.18 }); return; }
          f.vx = damp(f.vx, 0, 16, dt);
          if (atk.data.hit != null) return;
          atk.data.hit = WitnessBoss.strike(w, f, { x: f.x - m.reach, y: -240, w: m.reach * 2, h: 240 },
            { dmg: m.dmg * f.dmgMul, kb: 560, up: -560, hs: 0.5, imp: 3, kd: 1, hsnd: 'heavy', stamp: 'ECHO BREAKER', gb: m.dmg * 3, dir: Math.sign(p.x - f.x) || f.facing });
          if (!WitnessFX.play(w, 'wt_shatter', f.x, -40, { scale: f.scale * 0.7 })) w.fx.ring(f.x, -20, m.reach, L.hot, 0.35, 5);
          w.fx.ring(f.x, -6, m.reach * 1.2, L.hot, 0.3, 4); w.fx.dust(f.x, 0, 22); WitnessFX.burst(w, f.x, -10, 16, L.hot, 1);
          w.fx.shake(0.8); AudioManager.play('slam', { pitch: 0.7 });
          for (const dir of [-1, 1]) {
            const h = WitnessBoss.haz(w, { kind: 'wave', x: f.x + dir * 40, dir, speed: m.wave.speed, h: m.wave.h, dmg: m.wave.dmg, life: 2.4 });
            h.sheet = WitnessFX.play(w, 'wt_wave', h.x, 0, { dir, scale: 0.6, loop: true }) || 1;
          }
        },
        recovery(f, w, atk, u, dt) { f.vx = damp(f.vx, 0, 12, dt); },
        end(f) { if (f.abil) f.abil.float = false; f.vy = Math.max(f.vy, 0); } });
    } },

  /* ---- Phase I: The Observer ---- */
  // Void Slash: three blade waves crossing along the floor, from the Witness and from a fold opened behind Kage, a beat
  // apart: jump each one or dash through it
  voidSlash: { id: 'voidSlash', cd: WITNESS_MOVES.voidSlash.cd, range: WITNESS_MOVES.voidSlash.range, chance: WITNESS_MOVES.voidSlash.chance,
    run(f, w, ai) {
      const m = WITNESS_MOVES.voidSlash, p = w.player;
      WitnessAttack.run(f, w, ai, 'voidSlash', { trail: true,
        pose: (stage) => (stage === 'telegraph' ? WT_POSE.low : WT_POSE.cut),
        start(f, w, atk) { atk.data.n = 0; atk.data.back = wtSide(w, p.x + Math.sign(p.x - f.x) * 380); atk.data.fold = WitnessBoss.haz(w, { kind: 'fold', x: atk.data.back, life: 3, flip: 1 }); },
        telegraph(f, w, atk, u) { if (u > 0.75 && !atk.data.glint) { atk.data.glint = 1; WitnessFX.glint(f, w); } },
        enter(stage, f, w, atk) { if (stage === 'startup') AudioManager.play('heavyswing', { pitch: 0.7 }); },
        active(f, w, atk, u) {
          const t = u * WITNESS_MOVES.voidSlash.active, k = Math.floor(t / m.gap);
          while (atk.data.n < m.waves && atk.data.n <= k) {
            const i = atk.data.n++, fromBack = i === 1, x = fromBack ? atk.data.back : f.x + f.facing * 60 * f.scale, dir = fromBack ? -f.facing : f.facing;
            const h = WitnessBoss.haz(w, { kind: 'wave', x, dir, speed: m.speed, h: m.h, dmg: m.dmg, life: 3 });
            h.sheet = WitnessFX.play(w, 'wt_wave', x, 0, { dir, scale: 0.62, loop: true }) || 1;
            AudioManager.play('swing', { pitch: 0.6 });
          }
        },
        end(f, w, atk) { if (atk.data.fold) atk.data.fold.life = 0; } });
    } },
  // Echo Step: a fold of light opens behind Kage (it follows him while it tells), the Witness folds away into it and
  // steps out behind him with a quick cut
  echoStep: { id: 'echoStep', cd: WITNESS_MOVES.echoStep.cd, range: WITNESS_MOVES.echoStep.range, chance: WITNESS_MOVES.echoStep.chance,
    run(f, w, ai) { BOSS_ABILITIES.echoStep.perform(f, w, ai, 'echoStep'); },
    perform(f, w, ai, id, o) {
      const m = Object.assign({}, WITNESS_MOVES.echoStep, o || {}), p = w.player;
      WitnessAttack.run(f, w, ai, id, { trail: true, invuln: true, tellMul: m.tellMul,
        pose: (stage) => (stage === 'active' ? WT_POSE.cut : stage === 'telegraph' ? WT_POSE.hand : WT_POSE.low),
        start(f, w, atk) { atk.data.fold = WitnessBoss.haz(w, { kind: 'fold', x: p.x, life: 4 }); },
        telegraph(f, w, atk, u) {
          const side = -p.facing || 1;
          atk.data.fold.x = wtSide(w, p.x + side * m.behind * p.scale);
          if (u > 0.7 && !atk.data.glint) { atk.data.glint = 1; WitnessFX.glint(f, w); }
        },
        enter(stage, f, w, atk) {
          if (stage === 'startup') { WitnessFX.step(w, f, f.x); f.visible = false; f.alpha = 0; }
          if (stage === 'active') {
            f.x = atk.data.fold.x; f.visible = true; f.alpha = 1; f.facing = p.x > f.x ? 1 : -1; f.invuln = 0;
            WitnessFX.step(w, f, f.x); atk.data.fold.life = 0; f.vx = f.facing * 420; AudioManager.play('swing', { pitch: 1.1 });
          }
        },
        active(f, w, atk) { if (!atk.data.hit) atk.data.hit = WitnessBoss.strike(w, f, fbox(f, -10, -230, 200, 230), { dmg: m.dmg * f.dmgMul, kb: 360, up: -220, stamp: 'ECHO STEP' }); },
        recovery(f, w, atk, u, dt) { f.vx = damp(f.vx, 0, 10, dt); },
        end(f, w, atk) { f.visible = true; f.alpha = 1; if (atk.data.fold) atk.data.fold.life = 0; } });
    } },
  // Orbit Blades: the halo's six blades light one after another and each flies at where Kage stands as it lights
  orbitBlades: { id: 'orbitBlades', cd: WITNESS_MOVES.orbitBlades.cd, range: WITNESS_MOVES.orbitBlades.range, chance: WITNESS_MOVES.orbitBlades.chance,
    run(f, w, ai) {
      const m = WITNESS_MOVES.orbitBlades, p = w.player;
      WitnessAttack.run(f, w, ai, 'orbitBlades', { pose: WT_POSE.raise,
        start(f, w) { w.wit.orbit = { lit: 0, gone: 0 }; },
        telegraph(f, w, atk, u) { w.wit.orbit.lit = Math.floor(u * m.count); },
        active(f, w, atk, u, dt) {
          const O = w.wit.orbit; if (!O) return;
          O.lit = m.count;
          const due = Math.min(m.count, Math.floor(u * WITNESS_MOVES.orbitBlades.active / m.every) + 1);
          while (O.gone < due) {
            const i = O.gone++, hc = f.haloShard ? f.haloShard(i) : { x: f.x, y: f.y - 200 * f.scale };   // from the halo's own shard i
            const x = hc.x, y = hc.y, tx = p.x, ty = p.y - 70 * p.scale, d = Math.hypot(tx - x, ty - y) || 1;
            const h = WitnessBoss.haz(w, { kind: 'blade', x, y, vx: (tx - x) / d * m.speed, vy: (ty - y) / d * m.speed, dmg: m.dmg, life: 2 });
            h.sheet = WitnessFX.play(w, 'wt_blade', x, y, { scale: 0.7, loop: true, rot: Math.atan2(h.vy, Math.abs(h.vx)), dir: h.vx >= 0 ? 1 : -1 }) || 1;
            AudioManager.play('throw', { pitch: 1.4 });
          }
        },
        end(f, w) { w.wit.orbit = null; } });
    } },
  // Phantom Counter: raised by WitnessBoss.onThreat on an overused move; picked on its own only to punish a habit
  phantomCounter: { id: 'phantomCounter', cd: WITNESS_MOVES.phantomCounter.cd, range: WITNESS_MOVES.phantomCounter.range, chance: 0.6,
    cond: (f, w) => { const r = WitnessTracker.read(w); return r.overused && r.share >= WITNESS_MOVES.phantomCounter.share; },
    run(f, w) { WitnessTracker.taunt(w, f, 'overuse'); WitnessBoss.phantom(f, w, w.player); } },

  /* ---- Phase II: The Manipulator ---- */
  // the three control modifiers: the hand thrust at Kage, a thread to him, the modifier warned and then biting
  echoBind: { id: 'echoBind', cd: WITNESS_MOVES.echoBind.cd, range: WITNESS_MOVES.echoBind.range, chance: WITNESS_MOVES.echoBind.chance, cond: (f, w) => !w.wit.mods.length,
    run(f, w, ai) { BOSS_ABILITIES.echoBind.cast(f, w, ai, 'echoBind', 'bind'); },
    cast(f, w, ai, id, kind) {
      WitnessAttack.run(f, w, ai, id, { pose: WT_POSE.hand,
        start(f, w, atk) { atk.data.thread = WitnessBoss.haz(w, { kind: 'thread', life: 1.4 }); },
        enter(stage, f, w) { if (stage === 'startup') WitnessFX.cast(w, f); if (stage === 'active') WitnessBoss.randomMod(w, f, kind); },
        end(f, w, atk) { atk.data.thread.life = 0; } });
    } },
  reversal: { id: 'reversal', cd: WITNESS_MOVES.reversal.cd, range: WITNESS_MOVES.reversal.range, chance: WITNESS_MOVES.reversal.chance, cond: (f, w) => !w.wit.mods.length,
    run(f, w, ai) { BOSS_ABILITIES.echoBind.cast(f, w, ai, 'reversal', 'reverse'); } },
  inputDelay: { id: 'inputDelay', cd: WITNESS_MOVES.inputDelay.cd, range: WITNESS_MOVES.inputDelay.range, chance: WITNESS_MOVES.inputDelay.chance, cond: (f, w) => !w.wit.mods.length,
    run(f, w, ai) { BOSS_ABILITIES.echoBind.cast(f, w, ai, 'inputDelay', 'delay'); } },
  // Mirror Self: three of it round Kage, only one of them real. The real one casts a shadow and its core burns; the
  // copies have neither. All three raise their blades together; only the real one's cut is a blow.
  mirrorSelf: { id: 'mirrorSelf', cd: WITNESS_MOVES.mirrorSelf.cd, range: WITNESS_MOVES.mirrorSelf.range, chance: WITNESS_MOVES.mirrorSelf.chance,
    cond: (f, w) => !w.fighters.some(c => c.wDecoy && c.alive),
    run(f, w, ai) {
      const m = WITNESS_MOVES.mirrorSelf, p = w.player;
      const pose = (stage, u) => (stage === 'active' ? (u < m.tell / m.active ? WT_POSE.low : WT_POSE.cut) : WT_POSE.hand);
      WitnessAttack.run(f, w, ai, 'mirrorSelf', { invuln: true, trail: true, pose,
        enter(stage, f, w, atk) {
          if (stage === 'startup') { WitnessFX.step(w, f, f.x); f.visible = false; }
          if (stage === 'active') {
            const spots = [wtSide(w, p.x - 240), wtSide(w, p.x + 240), wtSide(w, p.x + (p.x < 0 ? 380 : -380))], real = (Math.random() * 3) | 0;
            atk.data.copies = [];
            spots.forEach((x, i) => {
              if (i === real) { f.x = x; f.visible = true; f.alpha = 1; f.facing = p.x > x ? 1 : -1; f.invuln = 0; WitnessFX.step(w, f, x); return; }
              const c = WitnessBoss.copy(f, w, x, { decoy: true, life: m.active + 0.4 });
              c.facing = p.x > x ? 1 : -1; Object.assign(c.pose, f.pose);
              c.startAbility({ dur: m.active + 0.3, rate: 18, pose: (c, t) => pose('active', t / m.active) });
              WitnessFX.step(w, c, x); atk.data.copies.push(c);
            });
          }
        },
        active(f, w, atk, u, dt) {
          const t = u * m.active;
          if (t >= m.tell - 0.12 && !atk.data.glint) { atk.data.glint = 1; WitnessFX.glint(f, w); }
          if (t >= m.tell && !atk.data.cut) { atk.data.cut = 1; const lunge = c => c.facing * Math.max(700, (Math.abs(p.x - c.x) - 60) / 0.3); f.vx = lunge(f); AudioManager.play('swing', { pitch: 0.9 }); for (const c of atk.data.copies) if (c.alive) c.vx = lunge(c); }
          if (atk.data.cut) { f.vx = damp(f.vx, 0, 6, dt); for (const c of atk.data.copies) c.vx = damp(c.vx, 0, 6, dt); }
          if (atk.data.cut && !atk.data.hit && t < m.tell + 0.3) atk.data.hit = WitnessBoss.strike(w, f, fbox(f, -10, -230, 220, 230), { dmg: m.dmg * f.dmgMul, kb: 380, up: -240, stamp: 'MIRROR' });
        },
        end(f, w, atk) { f.visible = true; f.alpha = 1; for (const c of atk.data.copies || []) if (c.alive) { c.life = 0.05; } } });
    } },
  // Rage Suppression: Kage's rage stops growing (what he has stays)
  rageSuppression: { id: 'rageSuppression', cd: WITNESS_MOVES.rageSuppression.cd, range: WITNESS_MOVES.rageSuppression.range, chance: WITNESS_MOVES.rageSuppression.chance,
    cond: (f, w) => w.wit.rageLock <= w.time,
    run(f, w, ai) {
      const m = WITNESS_MOVES.rageSuppression;
      WitnessAttack.run(f, w, ai, 'rageSuppression', { pose: WT_POSE.hand,
        enter(stage, f, w) {
          if (stage !== 'active') return;
          w.wit.rageLock = w.time + m.dur; WitnessFX.cast(w, f);
          w.fx.popText(w.player, 'RAGE SUPPRESSED', WitnessFX.look(f).hot);
          if (!WitnessFX.play(w, 'wt_bind', w.player.x, 0, { at: w.player, scale: w.player.scale * 0.8 })) w.fx.ring(w.player.x, -100, 120, WitnessFX.look(f).hot, 0.4, 3);
          AudioManager.play('chain', { pitch: 0.8 });
        } });
    } },
  // Forced Echo Step: a thread from the hand to Kage (the strong tell), then he is drawn toward the Witness into a
  // waiting cut. A dash or a jump during the pull breaks it.
  forcedEchoStep: { id: 'forcedEchoStep', cd: WITNESS_MOVES.forcedEchoStep.cd, range: WITNESS_MOVES.forcedEchoStep.range, chance: WITNESS_MOVES.forcedEchoStep.chance,
    run(f, w, ai) {
      const m = WITNESS_MOVES.forcedEchoStep, p = w.player;
      WitnessAttack.run(f, w, ai, 'forcedEchoStep', { trail: true,
        pose: (stage, u) => (stage === 'active' && u > 0.6 ? WT_POSE.cut : WT_POSE.hand),
        start(f, w, atk) { atk.data.thread = WitnessBoss.haz(w, { kind: 'thread', life: 2, strong: true }); w.fx.popText(p, '!', WitnessFX.look(f).hot); },
        telegraph(f, w, atk, u) { if (u > 0.8 && !atk.data.glint) { atk.data.glint = 1; WitnessFX.glint(f, w); } },
        enter(stage, f, w, atk) {
          if (stage === 'active') {
            const tx = wtSide(w, f.x + f.facing * 150 * f.scale);
            atk.data.pull = WitnessBoss.haz(w, { kind: 'pull', tx, speed: m.pull / 0.3, warn: 0, life: 0.45 }); WitnessFX.cast(w, f);
            if (!WitnessFX.play(w, 'wt_bind', p.x, 0, { at: p, scale: p.scale * 0.8 })) w.fx.ring(p.x, -10, 80, WitnessFX.look(f).hot, 0.3, 3);
            AudioManager.play('chain', { pitch: 1.2 });
          }
        },
        active(f, w, atk, u) {
          if (u > 0.6 && !atk.data.cut) { atk.data.cut = 1; AudioManager.play('swing'); }
          if (atk.data.cut && !atk.data.hit) atk.data.hit = WitnessBoss.strike(w, f, fbox(f, -10, -230, 230, 230), { dmg: m.dmg * f.dmgMul, kb: 420, up: -260, stamp: 'DRAWN IN' });
        },
        end(f, w, atk) { if (atk.data.thread) atk.data.thread.life = 0; } });
    } },

  // Orb Pulse (phases II-III): the orb in its free hand fires a spread of shots at Kage, one after another
  orbPulse: { id: 'orbPulse', cd: WITNESS_MOVES.orbPulse.cd, range: WITNESS_MOVES.orbPulse.range, chance: WITNESS_MOVES.orbPulse.chance,
    run(f, w, ai) {
      const m = WITNESS_MOVES.orbPulse, p = w.player;
      WitnessAttack.run(f, w, ai, 'orbPulse', { pose: WT_POSE.hand,
        telegraph(f, w, atk, u) { if (((u * 100) | 0) % 5 === 0) WitnessFX.gather(w, f.sk.bha.x, f.sk.bha.y, 80, 1, WitnessFX.look(f).hot); },
        active(f, w, atk, u) {
          const due = Math.min(m.count, Math.floor(u * m.active / m.every) + 1);
          atk.data.n = atk.data.n || 0;
          while (atk.data.n < due) {
            const i = atk.data.n++, h = f.sk.bha, tx = p.x, ty = p.y - 80 * p.scale + (i - (m.count - 1) / 2) * 45, d = Math.hypot(tx - h.x, ty - h.y) || 1;
            const o = WitnessBoss.haz(w, { kind: 'orb', x: h.x, y: h.y, vx: (tx - h.x) / d * m.speed, vy: (ty - h.y) / d * m.speed, dmg: m.dmg, life: 2 });
            o.sheet = WitnessFX.play(w, 'wt_orb', h.x, h.y, { scale: 0.8, loop: true, rot: Math.atan2(o.vy, Math.abs(o.vx)), dir: o.vx >= 0 ? 1 : -1 }) || 1;
            AudioManager.play('orb', { pitch: 0.8 + i * 0.1 });
          }
        } });
    } },

  /* ---- Phase III: The Reality Editor ---- */
  // Reality Rewrite: the arena becomes a remembered place and the floor is cut into tiles; the marked ones are
  // rewritten (a tick of damage while standing on one). The tile under Kage is always among them.
  realityRewrite: { id: 'realityRewrite', cd: WITNESS_MOVES.realityRewrite.cd, range: WITNESS_MOVES.realityRewrite.range, chance: WITNESS_MOVES.realityRewrite.chance,
    cond: (f, w) => !w.wit.tiles,
    run(f, w, ai) {
      const m = WITNESS_MOVES.realityRewrite;
      WitnessAttack.run(f, w, ai, 'realityRewrite', { pose: WT_POSE.raise,
        enter(stage, f, w) { if (stage === 'active') { WitnessBoss.rewrite(w, f, m); if (!w.memBreak) w.memoryBreak(f, { dur: m.warn + m.dur, glitch: 0.35 }); } } });
    } },
  // Health Drain: a tether from the hand to Kage drains him and heals the Witness, until he gets out of its reach (out
  // of sight) or strikes it hard enough to interrupt
  healthDrain: { id: 'healthDrain', cd: WITNESS_MOVES.healthDrain.cd, range: WITNESS_MOVES.healthDrain.range, chance: WITNESS_MOVES.healthDrain.chance,
    cond: (f, w) => !w.wit.tether,
    run(f, w, ai) {
      const m = WITNESS_MOVES.healthDrain;
      WitnessAttack.run(f, w, ai, 'healthDrain', { pose: WT_POSE.hand,
        enter(stage, f, w) {
          if (stage === 'active') { const p = w.player; w.wit.tether = { owner: f, t: 0, dur: m.active, reach: m.reach, rate: m.rate, heal: m.heal, breakDmg: m.breakDmg, dealt: 0, drained: 0,
              sheet: WitnessFX.play(w, 'wt_drain', p.x, p.y, { loop: true, dir: f.x < p.x ? 1 : -1, scale: p.scale * 0.9 }) }; w.fx.popText(w.player, 'DRAINED: GET AWAY OR STRIKE IT', WitnessFX.look(f).hot); AudioManager.play('chain', { pitch: 0.6 }); }
        },
        active(f, w, atk, u, dt) { f.vx = damp(f.vx, 0, 10, dt); if (!w.wit.tether) return false; },
        end(f, w) { if (w.wit.tether && w.wit.tether.owner === f) WitnessBoss.breakTether(w, 'TETHER BROKEN'); } });
    } },
  // Gravity Collapse: a well at the centre of the arena pulls Kage in (he can walk against it; a dash escapes it);
  // whoever is inside its core when it collapses is crushed
  gravityCollapse: { id: 'gravityCollapse', cd: WITNESS_MOVES.gravityCollapse.cd, range: WITNESS_MOVES.gravityCollapse.range, chance: WITNESS_MOVES.gravityCollapse.chance,
    cond: (f, w) => !w.wit.well,
    run(f, w, ai) {
      const m = WITNESS_MOVES.gravityCollapse;
      WitnessAttack.run(f, w, ai, 'gravityCollapse', { pose: WT_POSE.raise,
        enter(stage, f, w) {
          if (stage !== 'startup') return;
          const x = (w.bounds.l + w.bounds.r) / 2;
          w.wit.well = { x, t: 0, dur: m.active, pull: m.pull, core: m.core, dmg: m.dmg, done: false };
          w.wit.well.sheet = WitnessFX.play(w, 'wt_gravity', x, 0, { loop: true, scale: 1.2 });
          w.fx.popText(w.player, 'GRAVITY COLLAPSE: GET OUT', WitnessFX.look(f).hot); AudioManager.play('rumble');
        } });
    } },
  // Execution Frames: the arena freezes for a beat (the frames), a frame closes on Kage's column, then the massive strike
  executionFrames: { id: 'executionFrames', cd: WITNESS_MOVES.executionFrames.cd, range: WITNESS_MOVES.executionFrames.range, chance: WITNESS_MOVES.executionFrames.chance,
    run(f, w, ai) {
      const m = WITNESS_MOVES.executionFrames, p = w.player;
      WitnessAttack.run(f, w, ai, 'executionFrames', { pose: (stage) => (stage === 'active' ? WT_POSE.cut : WT_POSE.raise), unint: true,
        enter(stage, f, w, atk) {
          if (stage === 'startup') { w.fx.stop(m.freeze); w.wit.frames = { t: 0, until: w.time + m.freeze + 0.3 }; AudioManager.play('stamp', { pitch: 0.6 }); w.glitch = Math.max(w.glitch || 0, 0.2); }
          if (stage === 'active') { atk.data.mark = WitnessBoss.haz(w, { kind: 'frame', x: p.x, w: m.w, delay: m.active * 0.78, dmg: m.dmg, life: m.active + 0.5 }); w.fx.popText(p, 'EXECUTION: LEAVE THE FRAME', WitnessFX.look(f).hot); }
        },
        active(f, w, atk, u) { if (u > 0.62 && !atk.data.glint) { atk.data.glint = 1; WitnessFX.glint(f, w); } } });
    } },
  // False Death: it falls, a false victory screen rises, then it steps out behind Kage with a white glint and cuts
  falseDeath: { id: 'falseDeath', cd: WITNESS_MOVES.falseDeath.cd, range: WITNESS_MOVES.falseDeath.range, chance: WITNESS_MOVES.falseDeath.chance,
    cond: (f, w) => !w.wit.fake && f.hp < f.maxHp * 0.42,
    run(f, w, ai) {
      const m = WITNESS_MOVES.falseDeath, p = w.player;
      WitnessAttack.run(f, w, ai, 'falseDeath', { quiet: true, invuln: true, unint: true,
        pose: (stage) => (stage === 'telegraph' || stage === 'startup' ? WT_POSE.fallen : WT_POSE.cut),
        start(f, w) { w.fx.stamp('FINISH', f.x, f.y - 120, 3, C.emberBright); w.fx.slowmo(0.3, 0.6); AudioManager.play('ko'); w.wit.lie = { until: 1e9, e: 0, p: null }; },
        enter(stage, f, w, atk) {
          if (stage === 'startup') w.wit.fake = { kind: p.hp < p.maxHp * 0.3 ? 'death' : 'victory', t: 0 };
          if (stage === 'active') {
            w.wit.fake = null; w.wit.lie = null; w.wit.hudGlitch = 0.6; w.glitch = Math.max(w.glitch || 0, 0.5);
            w.dialogue = { id: 'witness', name: f.name, title: WTC.looks[w.wit.phase].name, text: WITNESS_LINES.falseWin, t: 0 };
            f.x = wtSide(w, p.x - p.facing * 130); f.facing = p.x > f.x ? 1 : -1; f.invuln = 0;
            WitnessFX.step(w, f, f.x); WitnessFX.glint(f, w, f.x + f.facing * 40, f.y - 160 * f.scale);
          }
        },
        active(f, w, atk, u) {
          if (u * m.active >= m.tell * 0.9 && !atk.data.cut) { atk.data.cut = 1; f.vx = f.facing * 620; AudioManager.play('swing'); }
          if (atk.data.cut && !atk.data.hit) atk.data.hit = WitnessBoss.strike(w, f, fbox(f, -10, -230, 210, 230), { dmg: m.dmg * f.dmgMul, kb: 420, up: -260, stamp: 'FOOLED' });
        },
        recovery(f, w, atk, u, dt) { f.vx = damp(f.vx, 0, 10, dt); },
        end(f, w) { w.wit.fake = null; if (w.wit.lie && w.wit.lie.until > 1e8) w.wit.lie = null; if (w.dialogue && w.dialogue.text === WITNESS_LINES.falseWin) w.dialogue = null; } });
    } },

  /* ---- Phase IV: The True Witness ---- */
  // Absolute Control: a wall of blades rises at the arena edge behind Kage and he is drawn toward it; dash or jump out
  absoluteControl: { id: 'absoluteControl', cd: WITNESS_MOVES.absoluteControl.cd, range: WITNESS_MOVES.absoluteControl.range, chance: WITNESS_MOVES.absoluteControl.chance,
    run(f, w, ai) {
      const m = WITNESS_MOVES.absoluteControl, p = w.player;
      WitnessAttack.run(f, w, ai, 'absoluteControl', { pose: WT_POSE.hand,
        start(f, w, atk) {
          const side = p.x >= f.x ? 1 : -1, x = side > 0 ? w.bounds.r - m.wall / 2 : w.bounds.l + m.wall / 2;
          atk.data.wall = WitnessBoss.haz(w, { kind: 'wall', x, side, w: m.wall, warn: 0, dmg: m.dmg, life: 3 });
          atk.data.thread = WitnessBoss.haz(w, { kind: 'thread', life: 2.5, strong: true });
        },
        enter(stage, f, w, atk) {
          if (stage === 'active') { atk.data.pull = WitnessBoss.haz(w, { kind: 'pull', tx: atk.data.wall.x, speed: m.pull, warn: 0, life: m.active }); AudioManager.play('chain', { pitch: 0.9 }); w.fx.popText(p, 'ABSOLUTE CONTROL: DASH OUT', WitnessFX.look(f).hot); }
        },
        end(f, w, atk) { if (atk.data.wall) atk.data.wall.life = Math.min(atk.data.wall.life, atk.data.wall.t + 0.3); if (atk.data.thread) atk.data.thread.life = 0; if (atk.data.pull) atk.data.pull.life = 0; } });
    } },
  // Null Protocol: Kage's abilities are locked out one after another (dash, jump, block, special), each shown on the HUD
  nullProtocol: { id: 'nullProtocol', cd: WITNESS_MOVES.nullProtocol.cd, range: WITNESS_MOVES.nullProtocol.range, chance: WITNESS_MOVES.nullProtocol.chance,
    cond: (f, w) => !w.wit.mods.some(m => m.kind === 'lock'),
    run(f, w, ai) {
      const m = WITNESS_MOVES.nullProtocol;
      WitnessAttack.run(f, w, ai, 'nullProtocol', { pose: WT_POSE.spread,
        enter(stage, f, w) {
          if (stage !== 'active') return;
          const locks = m.locks.slice().sort(() => Math.random() - 0.5).slice(0, m.count);
          locks.forEach((lock, i) => WitnessInput.add(w, { kind: 'lock', lock, warn: 0.4 + i * m.each, dur: Math.min(WITNESS_INPUT.max, m.each), label: `NULL: ${lock.toUpperCase()}` }));
        } });
    } },
  // Echo Execution: afterimages round Kage, each with its own numbered line, striking along it one after another
  echoExecution: { id: 'echoExecution', cd: WITNESS_MOVES.echoExecution.cd, range: WITNESS_MOVES.echoExecution.range, chance: WITNESS_MOVES.echoExecution.chance,
    run(f, w, ai) {
      const m = WITNESS_MOVES.echoExecution, p = w.player;
      WitnessAttack.run(f, w, ai, 'echoExecution', { pose: WT_POSE.spread,
        enter(stage, f, w, atk) {
          if (stage !== 'startup') return;
          const cx = p.x, cy = p.y - 90 * p.scale, defs = [[Math.PI, 0], [0, 0], [-Math.PI * 0.75, 0], [-Math.PI * 0.25, 1]];
          const r = WitnessTracker.read(w), unb = r.defensive >= WITNESS_ADAPT.defensive;   // hiding behind a guard: these cuts ignore it
          if (unb) WitnessTracker.taunt(w, f, 'defensive');
          for (let i = 0; i < m.count; i++) {
            const [a] = defs[i % defs.length], R = 360, x0 = cx + Math.cos(a) * R, y0 = Math.min(-30, cy + Math.sin(a) * R);
            const ang = Math.atan2(cy - y0, cx - x0), len = R * 2;
            WitnessBoss.haz(w, { kind: 'line', n: i + 1, x0, y0, a: ang, len, delay: m.tell + i * m.every, dmg: m.dmg, unb, life: m.tell + i * m.every + 0.4 });
          }
          AudioManager.play('teleport', { pitch: 0.9 });
        } });
    } },
  // Timeline Break: one of its own earlier attacks again, from Kage's other side and on a new beat
  timelineBreak: { id: 'timelineBreak', cd: WITNESS_MOVES.timelineBreak.cd, range: WITNESS_MOVES.timelineBreak.range, chance: WITNESS_MOVES.timelineBreak.chance,
    cond: (f, w) => w.wit.history.some(id => BOSS_ABILITIES[id] && id !== 'finalJudgment'),
    run(f, w, ai) {
      const m = WITNESS_MOVES.timelineBreak, p = w.player, past = w.wit.history.filter(id => BOSS_ABILITIES[id] && id !== 'finalJudgment' && id !== 'echoGenesis');
      const replay = past.length ? pick(past.slice(-6)) : 'voidSlash';
      WitnessAttack.run(f, w, ai, 'timelineBreak', { invuln: true, pose: WT_POSE.raise,
        start(f, w) { w.fx.popText(f, 'REWIND: ' + WITNESS_MOVES[replay].label, WitnessFX.look(f).hot); w.glitch = Math.max(w.glitch || 0, 0.3); },
        enter(stage, f, w) {
          if (stage === 'startup') { WitnessFX.step(w, f, f.x); f.x = wtSide(w, p.x + (p.x > f.x ? 1 : -1) * 300); f.facing = p.x > f.x ? 1 : -1; WitnessFX.step(w, f, f.x); }
        },
        end(f, w) { if (f.alive && f.state !== 'stun' && f.state !== 'hit') w.wit.replayNext = replay; } });
    } },
  // Final Judgment: the halo crowns itself in gold and one blade of light cuts the whole arena. Only a dash through it
  // inside the flash, or a guard raised the instant it flashes (which staggers it), survives.
  finalJudgment: { id: 'finalJudgment', cd: WITNESS_MOVES.finalJudgment.cd, range: WITNESS_MOVES.finalJudgment.range, chance: WITNESS_MOVES.finalJudgment.chance,
    cond: (f, w) => !w.wit.haz.some(h => h.kind === 'judgment'),
    run(f, w, ai) {
      const m = WITNESS_MOVES.finalJudgment;
      WitnessAttack.run(f, w, ai, 'finalJudgment', { pose: (stage) => (stage === 'active' || stage === 'recovery' ? WT_POSE.cut : WT_POSE.spread), unint: true, armor: true,
        start(f, w, atk) {
          const tell = atk.stages[0].dur + atk.stages[1].dur;
          atk.data.j = WitnessBoss.haz(w, { kind: 'judgment', delay: tell, perfect: m.perfect, h: m.h, dmg: m.dmg, life: tell + 0.6 });
          atk.data.j.sheet = WitnessFX.play(w, 'wt_judgment', (w.bounds.l + w.bounds.r) / 2, 0, { scale: 1.35, start: Math.max(0, 54 / 60 - tell) }) || 1;
          f.superArmor = true; AudioManager.play('charge', { pitch: 0.6 });
          w.fx.popText(w.player, 'DASH THROUGH IT, OR GUARD AT THE FLASH', WTC.goldHot);
        },
        telegraph(f, w, atk, u) { if (((u * 100) | 0) % 4 === 0) WitnessFX.gather(w, f.x, f.y - f.height() * 0.7, 220, 2, chance(0.5) ? WTC.goldHot : WitnessFX.look(f).hot); } });
    } },
  // Echo Genesis: the domain, opened once as the last phase begins (WitnessDomain runs it)
  echoGenesis: { id: 'echoGenesis', cd: 600, range: [0, 9999], chance: 0, cond: () => false,
    run(f, w, ai) {
      WitnessAttack.run(f, w, ai, 'echoGenesis', { quiet: true, unint: true, invuln: true, pose: WT_POSE.raise,
        start(f, w) {
          WitnessDomain.open(w, f);
          w.fx.banner('Domain Expansion', 'ECHO GENESIS', WTC.looks[3].body, '界');
          WitnessFX.play(w, 'wt_genesis', f.x, 0, { scale: 1.25, delay: 0.75 });
          AudioManager.play('boss');
        },
        startup(f, w, atk, u, dt) { f.vx = damp(f.vx, 0, 10, dt); f.invuln = Math.max(f.invuln, 0.1); } });
    } }
});
