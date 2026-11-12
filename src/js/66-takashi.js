/* KAGE — Takashi, the Master's Flow (Act III boss): the redesigned three-phase fight. Numbers: TAKASHI_MOVES,
   TAKASHI_GUARD and TAKASHI_TITAN in 10-data.js; the phases are data on ENEMIES.takashi.

     I    The Unbroken Guard   the deflection duel (TakashiGuard, TakashiKata; his style in 41-styles/takashi.js): a
                               strike Kage repeats is always turned aside, a varied one at a chance that falls with his
                               posture; he answers at a fixed tempo and runs into his kata, beat by beat, and each beat
                               Kage parries wears his posture down. Golden kunai, Kunai Execution, Earth Cleave, Guard
                               Return
     II   Yashiro Titan        he grows, and the golden spectral armour of the Yashiro Titan rises round him
                               (TakashiTitan: its rig and its art). Titan Slash, Heaven Cleaver, Blade Rain, Crushing
                               Grasp, Titan Spear, Domain Pulse: unblockable, a share of Kage's health, a knockdown;
                               between them the titan's own sword strokes (titanKata), slow and parriable
     III  Tenrai               the Titan breaks apart but he stays huge; his phase I kit, Final Flow, and his domain:
                               Tenrai, Heaven's Final Judgment (TakashiDomain: the golden arena, the shrine behind him,
                               the cracking floor and the divine thunder that kills unless the domain is broken)

   His VFX are Effekseer effects (vfx/src/VFX_Takashi_*.py, built and reviewed in the Godot Lab), baked by
   vfx/tools/export_game.py into the tk_* sheets of 34-vfx-sheets.js. As with Akari's (63-akari-sakura.js), a sheet
   plays only once its image has really decoded; until then, and always in the headless tests, a canvas effect draws
   instead. The titan, the shrine, the golden arena and the floor cracks are drawn here in canvas.

   Sim-side code (abilities, TakashiBoss.step, TakashiGuard) changes fighters; everything named draw* only reads. */

const TKV_GOLD = '#e8c25c', TKV_HOT = '#fff2c2', TKV_DEEP = '#b9781c';
const TKV_KANJI = { titan: '八代の巨神', domain: '天雷・天の最終審判' };

/* ---- the baked sheets (with canvas fallbacks) ---- */
const TakashiFX = {
  is(f) { return !!(f && f.def && f.def.id === 'takashi' && !f.clone); },
  on(name) { return !!VfxSheets.ready(name) && typeof VfxSheets.img[name].naturalWidth === 'number'; },
  play(w, name, x, y, o) {
    if (!this.on(name) || !w.fx || !w.fx.playSheet) return null;
    return w.fx.playSheet(name, x, y, o || {});
  }
};

/* ---- shared helpers ---- */
const tkOpt = (id, o) => Object.assign({}, TAKASHI_MOVES[id], o || {});
const tkFace = (f, w) => { f.facing = w.player.x > f.x ? 1 : -1; };
// a gold glint on the blade, or on the titan's blade tip while it stands
function tkGlint(f, w, x, y) { w.fx.glint(x != null ? x : f.sk.wt.x, y != null ? y : f.sk.wt.y, '#fff0b8'); AudioManager.play('orb', { pitch: 1.4 }); }
// gold motes drawn in toward a point (a gathering)
function tkGather(w, x, y, r, n) {
  for (let i = 0; i < (n || 1); i++) {
    const a = rand(0, TAU), d = r * rand(0.7, 1.1);
    w.fx.part({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * 0.7, vx: -Math.cos(a) * d * 2.6, vy: -Math.sin(a) * d * 1.8, life: 0.36, size: rand(1.4, 2.6), color: chance(0.5) ? TKV_HOT : TKV_GOLD, type: 'spark', grav: 0, drag: 1.2, add: true });
  }
}
// a gold burst: sparks and embers out of a point (the canvas stand-in for most impact sheets)
function tkBurst(w, x, y, n, spd) {
  for (let i = 0; i < n; i++) {
    const a = rand(-Math.PI, 0.25), v = rand(220, 760) * (spd || 1);
    w.fx.part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.25, 0.6), size: rand(1.4, 3), color: chance(0.4) ? TKV_HOT : chance(0.6) ? TKV_GOLD : TKV_DEEP, type: 'spark', grav: 900, drag: 2.4, add: true });
  }
}
// the target is on the ground or getting up: a titan blow does not land twice on a fallen man
const tkFallen = pl => pl.state === 'down' || pl.state === 'getup' || pl.state === 'dead';
// a titan blow: unblockable, a share of the target's health, a knockdown that keeps him down longer
function tkTitanBlow(w, f, box, o) {
  const pl = w.player;
  if (!pl || !pl.alive || tkFallen(pl)) return false;
  const hit = Combat.area(w, f, box, Object.assign({ kb: 460, up: -520, hs: 0.6, kd: 1, imp: 3, hsnd: 'heavy', unb: 1, gb: 200 }, o));
  if (hit) { pl.tkDown = TAKASHI_TITAN.down; w.fx.stop(0.1); w.fx.slowmo(0.4, 0.4); }
  return hit;
}

/* ======================================================================== */
/* The Iron Guard and the kata: the deflection duel (phase flag ironGuard)   */
/* ======================================================================== */
/* Two samurai with the same katana: the fight is decided blade on blade. Kage's cut meets the Iron Guard and is
   turned aside (the core's Budo.deflect: a short recoil a fresh guard press ends after BUDO.deflect.guardAfter); the
   father answers at a FIXED tempo (TK_DUEL.riposte after the deflection, a gold glint just before it) and runs on
   into his kata, beat after beat (TK_BEATS). Kage's guard raised in the parry window turns each beat back and costs
   HIM posture; a held guard only blocks and bleeds Kage's own; at 0 posture the father's guard breaks and the next
   clean cut is a critical. The numbers per foe are its style's `duel` (41-styles/takashi.js, hollow_takashi.js) over
   TK_DUEL. */
const TK_DUEL = {
  deflect: 0.5,     // chance a VARIED cut is turned aside while he stands settled at full posture (scaled down to 0 at `floor`)
  floor: 32,        // below this posture his guard is cracking: no varied deflections, his kata's wind-ups lie open
  kageCost: 16,     // posture Kage loses when the Iron Guard turns his cut (the core's deflect costs BUDO.posture.playerParried)
  selfCost: 5,      // posture a varied deflection costs him (a strong cut still weighs on the guard; a repeat costs nothing)
  kataGuard: 1,     // chance a cut thrown into his kata's wind-up is turned aside (while his posture is above the floor)
  riposte: 0.42,    // seconds from the deflection to the riposte's cut: the fixed, learnable tempo
  recoil: 0.14,     // a beat parried mid-kata: his recoil before the next beat
  open: 0.6,        // the last beat of a kata parried: how long he stands open (the moment to cut him)
  tempo: 1,         // a factor on every beat's wind-up
  hitch: 0,         // seconds of stutter added to every other beat's wind-up (Hollow Takashi's broken timing)
  dmg: 1,           // a factor on every beat's damage
  extra: [1, 3],    // how many beats follow the riposte (fewer as his posture falls)
  // what follows the riposte: kata fragments with their own rhythm
  cont: [['kesa'], ['gyaku', 'delay'], ['double', 'rise'], ['overhead'], ['kesa', 'thrust'], ['delay', 'double', 'rise'], ['gyaku', 'kesa', 'overhead']],
  tint: null,       // the echo's violet in place of his gold
  // the father's voice (fx.popText): when he reads a repeat, turns a varied cut, is turned back, has his guard broken
  words: { read: ['YOU REPEAT YOURSELF', 'I HAVE SEEN THAT ONE'], deflect: ['TOO STRAIGHT', 'YOUR SHOULDER TOLD ME', 'AGAIN. CLEANER', 'ELBOWS IN'],
    parried: ['GOOD', 'YES. AGAIN', 'BETTER', 'MEET IT, DO NOT HIDE'], blocked: ['A WALL IS NOT A GUARD', 'MEET THE BLADE'], broken: ['WELL STRUCK, SON', 'THAT IS IT'] }
};
/* The beats of his kata (Itto-ryu / iai forms on Shinsen's cuts): T wind-up (s, x the duel's tempo), R recovery when it is
   not turned back, the strike pose (MOVES id or a named pose), lunge (px/s), box (fbox), and the blow. `crush` (the
   overhead) costs a blocking Kage most of his posture: parry it. `perilous` (the thrust) cannot be blocked or parried:
   step out of it. */
const TK_BEATS = {
  iai:       { name: 'NUKITSUKE', T: 0.42, R: 0.3, pose: 'sh1', lunge: 520, box: [-10, -230, 200, 230], dmg: 11, gb: 26, kb: 320, up: -160, hs: 0.42, imp: 2, stamp: 'RIPOSTE' },
  kesa:      { name: 'KESA', T: 0.36, R: 0.3, pose: 'sh1', lunge: 330, box: [-6, -236, 190, 220], dmg: 10, gb: 24, kb: 280, up: -120, hs: 0.4, imp: 2 },
  gyaku:     { name: 'GYAKU-KESA', T: 0.36, R: 0.3, pose: 'sh2', lunge: 300, box: [-6, -246, 180, 226], dmg: 10, gb: 24, kb: 160, up: -360, hs: 0.4, imp: 2 },
  delay:     { name: 'HELD KESA', T: 0.68, R: 0.32, pose: 'sh1', held: 1, lunge: 360, box: [-6, -236, 190, 220], dmg: 12, gb: 28, kb: 300, up: -140, hs: 0.42, imp: 2 },
  double:    { name: 'NIDAN', T: 0.2, R: 0.28, pose: 'sh3', lunge: 260, box: [10, -190, 200, 120], dmg: 8, gb: 18, kb: 260, up: -80, hs: 0.36, imp: 1 },
  rise:      { name: 'KIRIAGE', T: 0.38, R: 0.4, pose: 'sh2', lunge: 340, box: [-6, -250, 180, 240], dmg: 12, gb: 26, kb: 200, up: -560, hs: 0.5, imp: 2 },
  overhead:  { name: 'KARATAKE-WARI', T: 0.52, R: 0.42, pose: 'over', crush: 1, lunge: 300, box: [0, -260, 190, 260], dmg: 14, gb: 72, kb: 360, up: -200, hs: 0.5, imp: 3, call: '上 PARRY IT' },
  draw:      { name: 'NUKITSUKE', T: 0.46, R: 0.42, pose: 'sh3', lunge: 1250, box: [-10, -210, 210, 200], dmg: 12, gb: 26, kb: 340, up: -140, hs: 0.44, imp: 2, call: '抜' },
  thrust:    { name: 'TSUKI', T: 0.5, R: 0.55, pose: 'thrust', perilous: 1, lunge: 980, box: [0, -196, 236, 80], dmg: 14, unb: 1, kb: 460, up: -160, hs: 0.5, imp: 2, call: '危 TSUKI' },
  // the Yashiro Titan's own sword strokes: slow and huge, but steel all the same: parry them
  titanKesa: { name: 'TITAN KESA', T: 0.7, R: 0.5, pose: 'sh1', lunge: 240, box: [-6, -236, 200, 236], dmg: 18, gb: 44, kb: 380, up: -220, hs: 0.5, imp: 3, titan: 1 },
  titanRise: { name: 'TITAN KIRIAGE', T: 0.56, R: 0.6, pose: 'sh2', lunge: 220, box: [-6, -250, 190, 250], dmg: 16, gb: 40, kb: 260, up: -520, hs: 0.5, imp: 3, titan: 1 }
};
// a foe of Takashi's school (himself, or his echo)
const tkSchool = f => !!(f && f.def && !f.clone && (f.def.id === 'takashi' || f.def.echoOf === 'takashi'));

const TakashiGuard = {
  // the duel's numbers for this fighter: its style's `duel` over TK_DUEL
  cfg(f) { const st = Budo.style(f); if (!st || !st.duel) return TK_DUEL; return st._duel || (st._duel = Object.assign({}, TK_DUEL, st.duel)); },
  // whether his guard is up: grounded, alive, not reeling, not open (the domain channel, a broken domain)
  up(def) {
    if (!def.ironGuard || !def.alive || !def.grounded || def.tkOpen > 0) return false;
    return !['stun', 'hit', 'juggle', 'down', 'getup', 'dead', 'bound', 'grabbed'].includes(def.state);
  },
  // settled in his stance (kamae), or in the wind-up of a kata beat while his posture holds: a varied cut can be read
  settled(def) {
    if (def.isNeutral() || def.state === 'block' || def.state === 'land') return true;
    return def.state === 'ability' && !!(def.abil && def.abil.tkGuard && !def.abil.cut);
  },
  // the chance a varied cut is turned aside now: falls with his posture, nothing below the floor
  chance(def) {
    const D = this.cfg(def), k = clamp((def.guard - D.floor) / (100 - D.floor), 0, 1);
    return D.deflect * Math.pow(k, 0.7);
  },
  // a guard-breaking blow: Kage's downward slash and the like, or a charged spinning kick: it cannot be turned aside
  breaker(att, m) { return (m.gb || 0) >= 50 || !!m.armor || (m.id === 'hk' && (att.moveCharge || 0) > 0.5); },
  /* Combat.applyHit asks first: does the Iron Guard turn this blow aside? A rage art (unblockable), a guard-breaking
     blow and a blow from behind always get through; any kunai from the front is deflected; a strike Kage has used in
     his last TAKASHI_GUARD.span moves is read and turned aside (certain); any other cut is turned aside at
     TakashiGuard.chance while he stands settled. A turned cut is Budo.deflect, and the father answers (on.parry in his
     style starts TakashiKata.riposte). Returns true when it did. */
  parries(world, att, def, m, front, ix, iy, dir) {
    if (!att.isPlayer || !front || m.unb || m.kind === 'grab' || !def.ironGuard) return false;
    // mid-kata, the recoil from a turned-back beat is not an opening: his guard comes straight back (kataGuard) while
    // his posture holds. Only the last beat, or a broken posture, leaves him open.
    const D0 = this.cfg(def);
    if (def.state === 'stun' && def.tkx && def.tkx.pending && !def.broken && def.alive && def.grounded && !(def.tkOpen > 0) && !m.proj
      && def.guard >= D0.floor && !this.breaker(att, m) && chance(D0.kataGuard)) { this.deflect(world, att, def, m, ix, iy, dir, false); return true; }
    if (!this.up(def)) return false;
    const fx = world.fx, D = this.cfg(def), gold = D.tint || TKV_GOLD, hot = D.tint ? '#e4d6ff' : TKV_HOT;
    if (m.proj) {
      fx.sparks(ix, iy, -dir, 10, hot); AudioManager.play('clang', { pitch: 1.2 });
      if (D.tint || !TakashiFX.play(world, 'tk_parry', ix, iy, { dir: def.facing, scale: def.scale * 0.6 })) fx.ring(ix, iy, 40, 'rgba(255,226,140,0.8)', 0.18, 2);
      fx.popText(def, 'DEFLECT', gold);
      return true;
    }
    if (this.breaker(att, m)) return false;
    const read = !!m.id && Logic.ironGuardReads(world.history || [], m.id);
    // mid-kata (a beat's wind-up) his guard holds at kataGuard while his posture is above the floor
    const kata = def.state === 'ability' && def.abil && def.abil.tkGuard && !def.abil.cut && def.guard >= D.floor;
    if (!read && !(kata ? chance(D.kataGuard) : this.settled(def) && chance(this.chance(def)))) return false;
    this.deflect(world, att, def, m, ix, iy, dir, read);
    return true;
  },
  // Kage's cut turned aside: the core's deflect (a lighter share of his posture), the gold flare, the father's word, and
  // the answer (Budo.emit 'parry': his style's on.parry runs the riposte)
  deflect(world, att, def, m, ix, iy, dir, read) {
    const fx = world.fx, D = this.cfg(def), gold = D.tint || TKV_GOLD, hot = D.tint ? '#e4d6ff' : TKV_HOT;
    att.abil = null;
    att.guard += BUDO.posture.playerParried - D.kageCost;   // Budo.deflect takes the core's share; his costs kageCost
    Budo.deflect(world, att, def, ix, iy, dir);
    att.vx = -att.facing * 300;
    def.stats.parries++;
    if (!read && D.selfCost) Budo.postureHit(world, def, D.selfCost / ((Budo.style(def) || {}).poise || 1), ix, iy, dir, att);
    fx.sparks(ix, iy, -dir, 22, hot, 1.4); fx.clashFlare(ix, iy); fx.stop(0.09); fx.shake(0.28); fx.punch(0.05);
    if (D.tint || !TakashiFX.play(world, 'tk_parry', ix, iy, { dir: def.facing, scale: def.scale * 0.75 })) fx.enso(ix, iy, 110, D.tint ? 'rgba(200,170,255,0.95)' : 'rgba(255,214,120,0.95)', 0.5);
    fx.stamp(read ? 'READ' : 'DEFLECT', ix, iy, 2, gold);
    AudioManager.play('parry');
    world.tkReads = (world.tkReads || 0) + (read ? 1 : 0);
    if (read && (world.tkReads === 1 || world.tkReads % 6 === 0)) fx.popText(att, 'READ: VARY YOUR STRIKES', gold);
    else TakashiKata.say(world, def, read ? 'read' : 'deflect');
    if (def.broken) return;
    Budo.emit(world, def, 'parry', att, m);
  }
};

/* ---- the kata: his strings, beat by beat ----
   A kata is a list of beats (TK_BEATS) run as abilities one after another (f.tkx: { beats, i, pending, ... }). A beat
   that is blocked, dodged or lands runs to its end and the next follows; a beat Kage parries (his style's on.parried)
   recoils TK_DUEL.recoil and the next follows; the LAST beat parried leaves him open TK_DUEL.open. A beat that lands
   clean ends the kata. Each beat's wind-up is f.telegraph (his eyes flash) with a glint just before the cut. */
const TakashiKata = {
  is: tkSchool,
  cfg(f) { return TakashiGuard.cfg(f); },
  active(f) { return !!(f && f.tkx); },
  // start a kata (`beats`: TK_BEATS ids); o: { riposte: true } when it answers a deflection (its first beat at the
  // fixed tempo, its wind-up guarded from the first frame)
  start(f, w, beats, o) {
    if (!beats || !beats.length || !f.alive) return false;
    f.tkx = { beats: beats.slice(), i: 0, pending: false, riposte: !!(o && o.riposte), n: 0 };
    if (f.ai) { f.ai.seq = null; f.ai.block = 0; }
    // deferred: the first beat starts on the next step (TakashiKata.tick), once whatever turned the blow has settled
    if (o && o.defer) f.tkx.pending = true; else this.beat(f, w);
    return true;
  },
  // the answer to a deflection: the draw cut at the fixed tempo, then a fragment of kata (fewer beats as his posture
  // falls), never the same fragment twice running
  riposte(f, w) {
    const D = this.cfg(f), k = clamp((f.guard - D.floor) / (100 - D.floor), 0, 1);
    const n = Math.round(lerp(D.extra[0], D.extra[1], k * (0.4 + Math.random() * 0.6)));
    let beats = ['iai'];
    if (n > 0) {
      const list = D.cont.filter(c => c.length <= n && c !== f.tkLastCont);
      const c = list.length ? pick(list) : D.cont[0];
      f.tkLastCont = c; beats = beats.concat(c);
    }
    return this.start(f, w, beats, { riposte: true, defer: true });
  },
  // the current beat as an ability
  beat(f, w) {
    const x = f.tkx, kind = x.beats[x.i], B = TK_BEATS[kind], D = this.cfg(f);
    if (!B) { f.tkx = null; return; }
    x.pending = false; x.landed = false; x.blocked = false; x.n++;
    const hitch = D.hitch && x.i % 2 === 1 ? D.hitch : 0;
    const T = (kind === 'iai' && x.riposte ? D.riposte : B.T * D.tempo) + hitch, A = 0.1, last = x.i >= x.beats.length - 1;
    const gold = D.tint || TKV_GOLD, glow = D.tint ? '#e4d6ff' : '#fff0b8';
    tkFace(f, w);
    f.telegraph = T;
    const wind = B.pose === 'over' ? RAIKON_POSE.overhead : B.pose === 'thrust' ? TAKASHI_POSE.guard : (MOVES[B.pose].w || MOVES[B.pose].a);
    const strike = B.pose === 'over' ? MOVES.sh1.s : B.pose === 'thrust' ? MOVES.sh3.s : MOVES[B.pose].s;
    const follow = B.pose === 'over' || B.pose === 'thrust' ? strike : (MOVES[B.pose].f || strike);
    f.startAbility({ dur: T + A + B.R + (last ? 0.12 : 0), rate: 30, trail: true, tkBeat: kind, tkGuard: true,
      pose: (f, t) => (t < T ? wind : t < T + 0.16 ? strike : follow),
      start(f) {
        if (B.call) w.fx.popText(f, B.call, B.perilous ? '#ff3b2f' : gold);
        if (B.perilous) AudioManager.play('teleport', { pitch: 0.8 });
      },
      update(f, w, t, dt) {
        if (t < T) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (!this.g && t > T - 0.13) { this.g = 1; w.fx.glint(f.sk.wt.x, f.sk.wt.y, B.perilous ? '#ff6a50' : glow); AudioManager.play('orb', { pitch: B.perilous ? 0.9 : 1.45 }); }
          return;
        }
        if (!this.cut) { this.cut = 1; f.vx = f.facing * B.lunge; AudioManager.play(B.crush || B.titan ? 'heavyswing' : 'swing', { pitch: B.titan ? 0.6 : 0.95 }); }
        f.vx = damp(f.vx, 0, B.perilous ? 7 : 10, dt);
        if (!this.hit && t < T + A) {
          this.hit = Combat.area(w, f, fbox(f, B.box[0], B.box[1], B.box[2], B.box[3]), { dmg: B.dmg * D.dmg * f.dmgMul, kb: B.kb, up: B.up, hs: B.hs, imp: B.imp,
            hsnd: 'slash', gb: B.gb, unb: B.unb || 0, stamp: B.stamp || null, tkBeat: kind, tkRiposte: kind === 'iai' && x.riposte });
        }
      },
      end(f) { TakashiKata.after(f); } });
  },
  // a beat ran to its end (blocked, dodged, or it landed): the next beat, or the kata is over
  after(f) {
    const x = f.tkx; if (!x) return;
    if (x.landed || x.i >= x.beats.length - 1 || !f.alive) { f.tkx = null; return; }
    x.i++; x.pending = true;
  },
  // his style's on.parried: Kage turned the beat back. He recoils briefly and the kata goes on; the last beat leaves
  // him open. Returns true when it was a kata beat.
  parried(f, w, m) {
    const x = f.tkx; if (!x || !m || !m.tkBeat) return false;
    const D = this.cfg(f);
    this.say(w, f, 'parried');
    if (f.broken || !f.alive) { f.tkx = null; return true; }
    if (x.i >= x.beats.length - 1) { f.stunT = D.open * (1 - f.stunRes * 0.5); f.tkx = null; return true; }
    f.stunT = D.recoil; x.i++; x.pending = true;
    return true;
  },
  // per step (TakashiBoss.step): the next beat as soon as he can act; nothing while the fight is not on
  tick(s, f, dt) {
    const x = f.tkx; if (!x) return;
    if (!f.alive || s.phase !== 'fight' || ['juggle', 'down', 'getup', 'grabbed', 'bound', 'hit'].includes(f.state) || f.broken) { f.tkx = null; return; }
    if (x.pending && f.canAct()) { if (f.ai) f.ai.seq = null; this.beat(f, s); }
  },
  // the father's voice, rate-limited
  say(w, f, what) {
    const D = this.cfg(f), list = D.words && D.words[what];
    if (!list || !list.length || (f.tkSaid || 0) > w.time) return;
    f.tkSaid = w.time + 1.8;
    w.fx.popText(f, list[(f.tkSayI = ((f.tkSayI || 0) + 1)) % list.length], D.tint || TKV_GOLD);
  }
};

/* ======================================================================== */
/* The Yashiro Titan: Takashi himself, grown, armoured and burning            */
/* ======================================================================== */
// In phase II Takashi grows (TAKASHI_TITAN.scale) and the golden spectral armour forms on his own body
// (titan-armor.js, drawn with his rig from f.tkArmor). Here: the gold fire that swirls off him, his sword wrapped
// in gold flame (it extends, spectral, to reach the far floor in his titan moves), the spectral gold hand of
// Crushing Grasp and the spear he forms for Titan Spear. The moves aim their hit boxes and VFX with these helpers.
const TakashiTitan = {
  // his own size against his full titan size (1 when fully grown)
  unit(f) { return f.scale / (1.342 * TAKASHI_TITAN.scale); },
  root(f) { return { x: f.x, y: 0 }; },
  // what the sword does in a titan move: `name` (slashBack, slashThru, raise, smash, reach, spearBack, spearThrow,
  // slam, slamUp, idle); `aim` (world x): the spectral blade (smash, slashThru) or hand (reach) reaches the floor there
  pose(f, name, rate, aim) { const t = f.tk; if (!t) return; t.want = name; t.aim = aim == null ? null : aim; },
  hand(f) { return f.sk.fha; },
  joint(f, side) { const sk = f.sk; return side === 'L' ? { x: sk.bha.x, y: sk.bha.y, ex: sk.bel.x, ey: sk.bel.y } : { x: sk.fha.x, y: sk.fha.y, ex: sk.fel.x, ey: sk.fel.y }; },
  // the spectral blade: from the grip, along the sword (or toward the floor at `aim`), and how long it is
  blade(f) {
    const t = f.tk, sk = f.sk, bx = sk.wb.x, by = sk.wb.y;
    let dx = sk.wt.x - bx, dy = sk.wt.y - by, L = Math.hypot(dx, dy) || 1;
    dx /= L; dy /= L;
    let len = L * (t && t.want === 'raise' ? 2.6 : 1.7);
    if (t && t.aim != null && (t.want === 'smash' || t.want === 'slashThru')) {
      const ax = t.aim - bx, ay = (t.want === 'smash' ? -6 : -40) - by, d = Math.hypot(ax, ay) || 1;
      dx = ax / d; dy = ay / d; len = d;
    }
    return { x: bx, y: by, dx, dy, len };
  },
  tip(f) { const b = this.blade(f); return { x: b.x + b.dx * b.len, y: b.y + b.dy * b.len }; },
  step(f, dt) {
    const t = f.tk;
    t.reachK = damp(t.reachK || 0, t.want === 'reach' && t.aim != null ? 1 : 0, 10, dt);
    if (t.want === 'reach' && t.aim != null) t.handX = t.aim;
  },

  /* ---- drawing (world space) ---- */
  // gold fire swirling off him: tongues from his shoulders, back, hips and limbs, streaming up and back as if in a
  // wind, gold-edged with dark-gold hearts; 'back' behind him, 'front' a few over his near side
  flames(ctx, f, time, layer) {
    const k = f.tk ? f.tk.k : 0; if (k <= 0.02 || !f.visible) return;
    const sk = f.sk, s = f.scale / 1.342, back = -f.facing;
    // [joint, size, seed, rising straight up from the floor]
    const anchors = layer === 'back'
      ? [[sk.shB, 1.5, 0], [sk.neck, 1.9, 1], [sk.head, 1.3, 2], [sk.hip, 1.6, 3], [sk.hipB, 1.3, 4], [sk.bel, 1.1, 5], [sk.bkn, 1.0, 6], [sk.shF, 1.2, 7], [sk.bft, 0.9, 8, 1], [sk.fft, 0.8, 9, 1]]
      : [[sk.fel, 0.75, 10], [sk.fkn, 0.8, 11], [sk.fha, 0.6, 12]];
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round';
    const N = 9, Lx = new Float32Array(N + 1), Ly = new Float32Array(N + 1), Rx = new Float32Array(N + 1), Ry = new Float32Array(N + 1);
    for (const [p, size, seed, floor] of anchors) {
      for (let j = 0; j < 2; j++) {
        const ph = time * (3.1 + 0.4 * j) + seed * 1.37 + j * 2.1, flick = 0.78 + 0.22 * Math.sin(ph * 2.3);
        const L = 120 * s * size * flick * k * (j ? 0.62 : 1), W = 23 * s * size * (j ? 0.65 : 1);
        // the centreline: up and streaming back, waving, the tip curling
        const ux = floor ? back * 0.25 : back * (0.75 + 0.15 * Math.sin(ph * 0.6)), uy = floor ? -1 : -(0.62 + 0.2 * Math.cos(ph * 0.8));
        const nx = -uy, ny = ux;
        for (let i = 0; i <= N; i++) {
          const u = i / N, wave = Math.sin(ph * 1.6 - u * 4.2) * 16 * s * size * u + (u * u * 18 * s * size * Math.sin(ph));
          const cx = p.x + ux * L * u + nx * wave, cy = p.y + uy * L * u + ny * wave;
          const w = W * Math.pow(1 - u, 0.9) * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, u * 1.6 + 0.2)));
          Lx[i] = cx + nx * w; Ly[i] = cy + ny * w; Rx[i] = cx - nx * w; Ry[i] = cy - ny * w;
        }
        ctx.beginPath(); ctx.moveTo(Lx[0], Ly[0]);
        for (let i = 1; i <= N; i++) ctx.lineTo(Lx[i], Ly[i]);
        for (let i = N; i >= 0; i--) ctx.lineTo(Rx[i], Ry[i]);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,${j ? 210 : 165},${j ? 90 : 35},${(j ? 0.4 : 0.32) * k})`; ctx.fill();
        ctx.strokeStyle = `rgba(255,150,30,${0.3 * k})`; ctx.lineWidth = 6 * s; ctx.stroke();
        ctx.strokeStyle = `rgba(255,232,150,${0.9 * k})`; ctx.lineWidth = 1.8 * s; ctx.stroke();
      }
    }
    ctx.restore();
  },
  // his sword wrapped in gold fire, thicker, extended spectrally past the steel
  sword(ctx, f, time) {
    const k = f.tk ? f.tk.k : 0; if (k <= 0.02 || !f.visible || !f.hasWeapon) return;
    const b = this.blade(f), s = f.scale / 1.342, nx = -b.dy, ny = b.dx, w = 7 * s * (1 + (f.tk.glow || 0) * 0.5);
    const ex = b.x + b.dx * b.len, ey = b.y + b.dy * b.len;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(b.x + nx * w, b.y + ny * w); ctx.lineTo(ex + nx * w * 0.3, ey + ny * w * 0.3); ctx.lineTo(ex + b.dx * w * 2, ey + b.dy * w * 2);
    ctx.lineTo(ex - nx * w * 0.3, ey - ny * w * 0.3); ctx.lineTo(b.x - nx * w, b.y - ny * w); ctx.closePath();
    ctx.fillStyle = `rgba(255,200,90,${0.42 * k})`; ctx.fill();
    ctx.strokeStyle = `rgba(255,160,40,${0.35 * k})`; ctx.lineWidth = 9 * s; ctx.stroke();
    ctx.strokeStyle = `rgba(255,248,220,${0.95 * k})`; ctx.lineWidth = 1.8 * s; ctx.stroke();
    // flame licks peeling off the edge, streaming back
    for (let j = 0; j < 7; j++) {
      const q = (j + 0.5) / 7, ph = time * 6 + j * 1.9, px = b.x + b.dx * b.len * q, py = b.y + b.dy * b.len * q;
      const lx = px - b.dx * 26 * s + nx * (14 + 10 * Math.sin(ph)) * s * (j % 2 ? 1 : -1), ly = py - b.dy * 26 * s + ny * (14 + 10 * Math.sin(ph)) * s * (j % 2 ? 1 : -1) - 8 * s;
      ctx.beginPath(); ctx.moveTo(px + nx * w, py + ny * w); ctx.quadraticCurveTo((px + lx) / 2 + nx * 6 * s, (py + ly) / 2 + ny * 6 * s, lx, ly);
      ctx.strokeStyle = `rgba(255,214,110,${0.7 * k})`; ctx.lineWidth = 2 * s; ctx.stroke();
    }
    ctx.restore();
  },
  // Crushing Grasp: a giant spectral gold hand sliding along the floor (t.handX, t.reachK), closing on Kage
  graspHand(ctx, f, time) {
    const t = f.tk; if (!t || (t.reachK || 0) < 0.03 || t.handX == null) return;
    const k = t.reachK * t.k, s = f.scale / 1.342, x = t.handX, dir = f.facing, y = -46 * s, R = 46 * s, shut = t.closed ? 1 : 0;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round';
    // the arm of light from his near hand to the spectral hand
    const h = f.sk.fha;
    ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.quadraticCurveTo((h.x + x) / 2, Math.min(h.y, y) - 40 * s, x - dir * R, y);
    ctx.strokeStyle = `rgba(255,170,50,${0.3 * k})`; ctx.lineWidth = 26 * s; ctx.stroke();
    ctx.strokeStyle = `rgba(255,226,140,${0.7 * k})`; ctx.lineWidth = 3 * s; ctx.stroke();
    // palm and four fingers (curling shut when it closes)
    const plate = (path) => { ctx.beginPath(); path(); ctx.fillStyle = `rgba(255,170,50,${0.25 * k})`; ctx.fill(); ctx.strokeStyle = `rgba(255,236,170,${0.95 * k})`; ctx.lineWidth = 2 * s; ctx.stroke(); };
    plate(() => ctx.ellipse(x - dir * R * 0.4, y, R * 0.7, R * 0.55, 0, 0, TAU));
    for (let i = 0; i < 4; i++) {
      const a = -0.9 + i * 0.5, curl = shut ? 1.4 : 0.2, fx = x - dir * R * 0.1 + Math.cos(a) * R * 0.5 * dir, fy = y + Math.sin(a) * R * 0.5;
      plate(() => { ctx.moveTo(fx, fy); ctx.quadraticCurveTo(fx + dir * R * 0.6 * Math.cos(a), fy + R * 0.6 * Math.sin(a), fx + dir * R * 0.5 * Math.cos(a + curl), fy + R * 0.5 * Math.sin(a + curl) + R * 0.3); ctx.lineTo(fx + dir * 4 * s, fy + 6 * s); ctx.closePath(); });
    }
    ctx.restore();
  },
  // Titan Spear: a spear of gold held in his far hand while he draws back to throw
  spear(ctx, f, time) {
    const t = f.tk, sp = t && t.spear; if (!sp || sp.k <= 0) return;
    const h = f.sk.bha, s = f.scale / 1.342, L = 210 * s * sp.k, dir = f.facing;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.translate(h.x, h.y); ctx.scale(dir, 1);
    ctx.beginPath(); ctx.moveTo(-L * 0.55, -3 * s); ctx.lineTo(L * 0.4, -4 * s); ctx.lineTo(L * 0.55, 0); ctx.lineTo(L * 0.4, 4 * s); ctx.lineTo(-L * 0.55, 3 * s); ctx.closePath();
    ctx.fillStyle = `rgba(255,200,90,${0.5 * sp.k})`; ctx.fill();
    ctx.strokeStyle = `rgba(255,160,40,${0.35 * sp.k})`; ctx.lineWidth = 8 * s; ctx.stroke();
    ctx.strokeStyle = `rgba(255,250,226,${sp.k})`; ctx.lineWidth = 1.6 * s; ctx.stroke();
    ctx.restore();
  }
};

/* ======================================================================== */
/* The domain: Tenrai, Heaven's Final Judgment (draw side; the move is below) */
/* ======================================================================== */
const TakashiDomain = {
  // the golden sky over the whole arena once the domain has opened (s.tkDomain.k fades it in), and the shrine
  drawSky(ctx, s, toScreen, time) {
    const d = s.tkDomain; if (!d || d.k <= 0.005) return;
    const k = d.k, zoom = s.cam.zoom;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = k;
    const g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, '#1a0d02'); g.addColorStop(0.42, '#6b3a07'); g.addColorStop(0.78, '#d98f1c'); g.addColorStop(1, '#ffd36a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // the great sun behind the shrine
    const sp = toScreen(d.x, 0), sunX = W / 2 + (sp.x - W / 2) * 0.55, sunY = GROUND - 330;
    const sg = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 360);
    sg.addColorStop(0, 'rgba(255,250,220,1)'); sg.addColorStop(0.28, 'rgba(255,226,130,0.95)'); sg.addColorStop(0.5, 'rgba(255,180,60,0.45)'); sg.addColorStop(1, 'rgba(255,150,30,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sunX, sunY, 360, 0, TAU); ctx.fill();
    // light rays and falling gold
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) {
      const x = ((i * 173 + time * 14) % (W + 200)) - 100, w = 30 + (i * 37) % 50;
      const rg = ctx.createLinearGradient(0, 0, 0, GROUND); rg.addColorStop(0, 'rgba(255,220,120,0)'); rg.addColorStop(1, `rgba(255,220,120,${0.07 * k})`);
      ctx.fillStyle = rg; ctx.fillRect(x, 0, w, GROUND);
    }
    for (let i = 0; i < 40; i++) {
      const x = (i * 97.3 + Math.sin(time * 0.7 + i) * 30) % W, y = (i * 61.7 + time * (30 + (i % 5) * 12)) % GROUND;
      ctx.fillStyle = `rgba(255,232,160,${0.5 * k})`; ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    // distant torii along the horizon, then the shrine behind Takashi
    for (let i = -3; i <= 3; i++) if (i) this.torii(ctx, sunX + i * 300 + ((s.cam.x * -0.2) % 300), GROUND - 4, 0.45 + 0.08 * (3 - Math.abs(i)), k * 0.75);
    this.shrine(ctx, sunX, GROUND - 6, 1.05 * Math.min(1.25, zoom + 0.2), k, time);
    ctx.restore();
  },
  // the floor band, gilded, with the reflection of the sun
  drawFloor(ctx, s, toScreen, time) {
    const d = s.tkDomain; if (!d || d.k <= 0.005) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const top = GROUND - FLOOR_DEPTH, g = ctx.createLinearGradient(0, top, 0, H);
    g.addColorStop(0, `rgba(255,214,120,${0.85 * d.k})`); g.addColorStop(0.3, `rgba(196,120,22,${0.75 * d.k})`); g.addColorStop(1, `rgba(40,20,2,${0.8 * d.k})`);
    ctx.fillStyle = g; ctx.fillRect(0, top, W, H - top);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,230,150,${0.22 * d.k})`; ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) { const y = top + 6 + i * i * 1.2; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
  },
  // a torii gate silhouette (screen space): two pillars, the nuki, the upswept kasagi, rimmed in gold
  torii(ctx, x, y, sc, a) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= a;
    ctx.fillStyle = '#1b0e03';
    ctx.fillRect(-92, -250, 20, 250); ctx.fillRect(72, -250, 20, 250);
    ctx.fillRect(-120, -205, 240, 16);
    ctx.beginPath(); ctx.moveTo(-160, -262); ctx.quadraticCurveTo(0, -238, 160, -262); ctx.lineTo(150, -244); ctx.quadraticCurveTo(0, -224, -150, -244); ctx.closePath(); ctx.fill();
    ctx.fillRect(-130, -248, 260, 12); ctx.fillRect(-8, -236, 16, 32);
    ctx.strokeStyle = 'rgba(255,214,120,0.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-160, -262); ctx.quadraticCurveTo(0, -238, 160, -262); ctx.stroke();
    ctx.restore();
  },
  // the shrine behind the father: stone steps, a raised hall with pillars, a sweeping hip-and-gable roof with
  // crossed chigi, gold light in its doorway, and a great torii before it
  shrine(ctx, x, y, sc, a, time) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= a;
    const ink = '#160b02', rim = 'rgba(255,220,130,0.85)';
    ctx.fillStyle = ink;
    for (let i = 0; i < 4; i++) ctx.fillRect(-150 + i * 18, -18 - i * 14, 300 - i * 36, 14);   // steps
    ctx.fillRect(-230, -96, 460, 26);                                                          // platform
    for (let i = -3; i <= 3; i++) ctx.fillRect(i * 62 - 7, -250, 14, 156);                     // pillars
    // the doorway's light
    const dg = ctx.createLinearGradient(0, -240, 0, -96); dg.addColorStop(0, 'rgba(255,240,190,0.9)'); dg.addColorStop(1, 'rgba(255,170,50,0.5)');
    ctx.fillStyle = dg; ctx.fillRect(-48, -236, 96, 140);
    ctx.fillStyle = ink; ctx.fillRect(-2, -236, 4, 140);
    // the roof: a deep, upswept eave, then the upper gable
    ctx.beginPath(); ctx.moveTo(-330, -238); ctx.quadraticCurveTo(-200, -262, -150, -300); ctx.lineTo(150, -300); ctx.quadraticCurveTo(200, -262, 330, -238);
    ctx.lineTo(300, -258); ctx.quadraticCurveTo(170, -290, 120, -360); ctx.lineTo(-120, -360); ctx.quadraticCurveTo(-170, -290, -300, -258); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rim; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-200, -352); ctx.lineTo(200, -352); ctx.lineTo(160, -400); ctx.lineTo(-160, -400); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 140, -392); ctx.lineTo(sd * 200, -460); ctx.lineWidth = 9; ctx.strokeStyle = ink; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = rim; ctx.stroke(); }
    // the crest under the gable
    ctx.strokeStyle = rim; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -378, 13, 0, TAU); ctx.stroke();
    ctx.restore();
    this.torii(ctx, x, y + 2, 1.55 * sc, a);
  },
  // world space, before the fighters: the floor cracks spreading from the planted sword, the seal ring round it
  drawGround(ctx, s, time) {
    const c = s.tkCrack; if (!c) return;
    const k = c.k, reach = c.reach;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // the seal round the sword
    ctx.strokeStyle = `rgba(255,214,110,${0.7 * c.alpha})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(c.x, -2, 90 + 30 * k, 16 + 6 * k, 0, 0, TAU); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(c.x, -2, 130 + 40 * k, 24 + 8 * k, 0, 0, TAU); ctx.stroke();
    for (const crack of c.lines) {
      const n = crack.pts.length, show = clamp(k * reach / crack.len, 0, 1) * (n - 1);
      ctx.beginPath(); ctx.moveTo(crack.pts[0][0], crack.pts[0][1]);
      for (let i = 1; i <= Math.floor(show) && i < n; i++) ctx.lineTo(crack.pts[i][0], crack.pts[i][1]);
      const i = Math.floor(show); if (i < n - 1) { const q = show - i, p0 = crack.pts[i], p1 = crack.pts[i + 1]; ctx.lineTo(lerp(p0[0], p1[0], q), lerp(p0[1], p1[1], q)); }
      ctx.strokeStyle = `rgba(255,160,40,${0.35 * c.alpha})`; ctx.lineWidth = crack.w * 4; ctx.stroke();
      ctx.strokeStyle = `rgba(255,246,206,${0.95 * c.alpha})`; ctx.lineWidth = crack.w; ctx.stroke();
    }
    ctx.restore();
  },
  // world space, over the fighters: the canvas divine thunder (when its sheet is not ready)
  drawWorld(ctx, s, time) {
    const th = s.tkThunder; if (!th || th.sheet) return;
    const k = 1 - clamp(th.t / 0.5, 0, 1);
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(th.x - 90, 0, th.x + 90, 0);
    g.addColorStop(0, 'rgba(255,180,50,0)'); g.addColorStop(0.5, `rgba(255,236,170,${0.6 * k})`); g.addColorStop(1, 'rgba(255,180,50,0)');
    ctx.fillStyle = g; ctx.fillRect(th.x - 90, -2000, 180, 2000);
    ctx.strokeStyle = `rgba(255,255,236,${k})`; ctx.lineWidth = 6;
    ctx.beginPath(); for (let i = 0; i <= 12; i++) ctx.lineTo(th.x + ((i * 53) % 7 - 3) * 9 * (i % 2 ? 1 : -1), -1400 + i * 1400 / 12); ctx.stroke();
    ctx.restore();
  },
  // screen space: the white-gold flash as the domain opens, and its name
  drawScreen(ctx, s) {
    const d = s.tkDomain; if (!d) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (d.flash > 0 && !SaveManager.data.settings.reduceFlash) { ctx.fillStyle = `rgba(255,244,210,${Math.min(1, d.flash)})`; ctx.fillRect(0, 0, W, H); }
    if (d.title > 0) {
      const a = clamp(d.title, 0, 1);
      ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `600 18px ${FU}`; ctx.letterSpacing = '8px'; ctx.fillStyle = '#ffe9b0'; ctx.fillText('DOMAIN EXPANSION', W / 2, 118); ctx.letterSpacing = '0px';
      ctx.font = `64px ${FK}`; ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillText(TKV_KANJI.domain, W / 2 + 4, 182);
      ctx.fillStyle = '#ffd56a'; ctx.fillText(TKV_KANJI.domain, W / 2, 178);
      ctx.font = `600 22px ${FU}`; ctx.letterSpacing = '4px'; ctx.fillStyle = '#fff4d6'; ctx.fillText('TENRAI · HEAVEN\'S FINAL JUDGMENT', W / 2, 232); ctx.letterSpacing = '0px';
    }
    // the break prompt, on a dark plate under the title: how much more he must take, and how long is left
    const c = s.tkCrack;
    if (c && c.alpha > 0.5 && c.prompt) {
      const pct = clamp(c.dealt / c.need, 0, 1), left = 1 - clamp(c.t / c.dur, 0, 1), y = 290;
      ctx.globalAlpha = 1; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(12,6,0,0.72)'; ctx.fillRect(W / 2 - 200, y - 22, 400, 62);
      ctx.strokeStyle = 'rgba(255,214,110,0.7)'; ctx.lineWidth = 1.5; ctx.strokeRect(W / 2 - 200, y - 22, 400, 62);
      ctx.font = `600 22px ${FU}`; ctx.letterSpacing = '3px'; ctx.fillStyle = '#fff0c4'; ctx.fillText('STRIKE HIM — BREAK THE DOMAIN', W / 2, y - 4); ctx.letterSpacing = '0px';
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(W / 2 - 170, y + 16, 340, 9);
      ctx.fillStyle = '#ffd56a'; ctx.fillRect(W / 2 - 170, y + 16, 340 * pct, 9);
      ctx.fillStyle = 'rgba(255,96,60,0.95)'; ctx.fillRect(W / 2 - 170, y + 29, 340 * left, 4);
    }
    ctx.restore();
  }
};

/* ======================================================================== */
/* The boss: per-step state, phase changes, camera                            */
/* ======================================================================== */
const TakashiBoss = {
  init(f) {
    if (f.tk) return f.tk;
    f.tk = { base: f.scale, k: 0, want: 'idle', scaleTo: 1, eyes: 0, glow: 0, aim: null, reachK: 0, handX: null };
    for (const c of f.cloths) c.seg0 = c.c.seg;
    return f.tk;
  },
  // grow or shrink Takashi (his whole rig, cloth included)
  setScale(f, mul) {
    const t = f.tk; f.scale = t.base * mul;
    for (const c of f.cloths) if (c.seg0) c.c.seg = c.seg0 * mul;
  },
  // FightSession.simulate, every step of any fight
  step(s, dt) {
    const f = s.enemy;
    if (tkSchool(f) && f.ai) { TakashiKata.tick(s, f, dt); const st = Budo.style(f); if (st && st.tick) st.tick(f.ai, s, dt); }
    if (!TakashiFX.is(f) || !f.ai) return;
    const t = this.init(f), ph = f.ai.phaseData || {};
    f.ironGuard = !!ph.ironGuard;
    f.titanArmor = ph.titan && t.k > 0.5 ? TAKASHI_TITAN.armor : 0;
    if (f.tkOpen > 0) f.tkOpen -= dt;
    // his size: the titan phase grows him, the last phase keeps him huge
    const want = ph.huge && !t.shrunk ? TAKASHI_TITAN.huge : ph.titan ? TAKASHI_TITAN.scale : 1;
    t.scaleTo = damp(t.scaleTo, want, 2.2 / TAKASHI_TITAN.grow * 2, dt);
    if (Math.abs(f.scale - t.base * t.scaleTo) > 0.001) this.setScale(f, t.scaleTo);
    // the titan: rises in the titan phase, breaks apart after it
    const on = !!ph.titan && f.alive;
    t.k = clamp(t.k + (on ? dt / TAKASHI_TITAN.grow : -dt / 0.5), 0, 1);
    f.tkArmor = t.k;
    if (t.k > 0) TakashiTitan.step(f, dt);
    t.eyes = Math.max(0, t.eyes - dt * 1.5); t.glow = Math.max(0, t.glow - dt * 1.2);
    if (on && t.k > 0.2 && ((s.time * 60) | 0) % 3 === 0) {   // embers rising off the titan
      const h = f.height();
      s.fx.part({ x: f.x + rand(-0.3, 0.3) * h, y: f.y - rand(0.1, 1.05) * h, vx: rand(-30, 30), vy: -rand(60, 160), life: rand(0.5, 1), size: rand(1.4, 2.8), color: chance(0.5) ? TKV_HOT : TKV_GOLD, type: 'spark', grav: -40, drag: 1, add: true });
    }
    if (ph.titan) f.ai.formCd = Math.max(f.ai.formCd, 1);   // the titan fights; the family form waits
    // the last phase opens with the domain
    if (t.domainNext && s.phase === 'fight' && f.canAct() && !f.abil) { t.domainNext = false; f.ai.cds.tenraiJudgment = TAKASHI_MOVES.tenraiJudgment.cd; BOSS_ABILITIES.tenraiJudgment.run(f, s, f.ai, s.player); }
    // the domain's light, the cracks, the thunder
    const d = s.tkDomain;
    // a broken domain fades away and the arena is itself again
    if (d && d.off) { d.k = Math.max(0, d.k - dt * 0.8); d.title = 0; if (d.k <= 0) s.tkDomain = null; }
    else if (d) { d.k = Math.min(1, d.k + dt * 1.6); d.flash = Math.max(0, d.flash - dt * 2.2); d.title = Math.max(0, d.title - dt * 0.6); }
    const c = s.tkCrack;
    if (c) { c.alpha = c.done ? Math.max(0, c.alpha - dt * 1.5) : Math.min(1, c.alpha + dt * 4); if (c.done && c.alpha <= 0) { if (c.sheet) c.sheet.stop = true; s.tkCrack = null; } }
    if (s.tkThunder) { s.tkThunder.t += dt; if (s.tkThunder.t > 0.8) s.tkThunder = null; }
    this.stepHaz(s, f, dt);
  },
  // FightSession.onBossPhase
  phase(s, f, idx, ph) {
    if (!TakashiFX.is(f)) return;
    const t = this.init(f);
    if (ph.titan) {
      s.fx.banner('Yashiro Titan', 'the perfect armour of a samurai\'s will', TKV_GOLD, '巨');
      s.fx.popText(f, TKV_KANJI.titan, TKV_HOT);
      if (!TakashiFX.play(s, 'tk_manifest', f.x, f.y, { scale: f.scale })) { s.fx.ring(f.x, -6, 420, 'rgba(255,214,110,0.9)', 0.9, 8); tkBurst(s, f.x, f.y - 120 * f.scale, 40, 1.3); }
      s.fx.screenTint('rgba(255,196,80,', 0.8); AudioManager.play('thunder'); AudioManager.play('rumble');
      t.eyes = 1.5;
    }
    if (ph.huge) {
      // the titan comes apart into gold; he stays huge; the domain opens the phase
      if (t.k > 0) { tkBurst(s, f.x, f.y - f.height() * 0.6, 60, 1.6); TakashiFX.play(s, 'tk_manifest', f.x, f.y, { scale: f.scale * 0.9, start: 0.2 }); }
      t.domainNext = true;
    }
  },
  // FightSession.onHit: blows on him during the domain's channel count toward breaking it
  onHit(s, att, def, dmg) {
    const c = s.tkCrack;
    if (!c || c.done || def !== c.owner || !att.isPlayer) return;
    c.dealt += dmg * (att.state === 'special' || (att.move && att.move.kind === 'special') ? 3 : 1);
  },
  // FightSession.updateCamera: the titan and the domain need a wider frame
  camera(s, tz, ty) {
    const f = s.enemy; if (!TakashiFX.is(f) || !f.tk) return null;
    const k = Math.max(f.tk.k, f.tk.scaleTo > 1.3 ? 0.55 : 0, s.tkCrack ? 0.7 : 0);
    if (k <= 0.01) return null;
    return { tz: Math.min(tz, lerp(tz, 0.74, k)), ty: ty - 70 * k };
  },
  // drawFight, world space, before the fighters
  drawBehind(ctx, s, time) {
    TakashiDomain.drawGround(ctx, s, time);
    this.drawHaz(ctx, s, time);
    const f = s.enemy; if (TakashiFX.is(f) && f.tk) TakashiTitan.flames(ctx, f, time, 'back');
  },
  drawFront(ctx, s, time) {
    const f = s.enemy;
    if (TakashiFX.is(f) && f.tk) { TakashiTitan.flames(ctx, f, time, 'front'); TakashiTitan.sword(ctx, f, time); TakashiTitan.spear(ctx, f, time); TakashiTitan.graspHand(ctx, f, time); }
    TakashiDomain.drawWorld(ctx, s, time); this.drawHazFront(ctx, s, time);
  },

  /* ---- timed hazards: falling blades, the grasping hand, marks ---- */
  haz(s, h) { (s.tkHaz || (s.tkHaz = [])).push(Object.assign({ t: 0 }, h)); return h; },
  stepHaz(s, f, dt) {
    const arr = s.tkHaz; if (!arr || !arr.length) return;
    for (let i = arr.length - 1; i >= 0; i--) {
      const h = arr[i]; h.t += dt;
      if (!f.alive || s.phase !== 'fight') { arr.splice(i, 1); continue; }
      if (h.kind === 'blade') {
        if (!h.sheet && h.t >= h.delay - 0.3) { h.sheet = TakashiFX.play(s, 'tk_blade', h.x, 0, { scale: f.scale * 0.95, start: Math.max(0, 0.3 - h.delay) }) || 1; }
        if (!h.hit && h.t >= h.delay) {
          h.hit = 1;
          Combat.area(s, f, { x: h.x - h.w / 2, y: -520, w: h.w, h: 520 }, { dmg: h.dmg * f.dmgMul, kb: 240, up: -480, hs: 0.5, kd: 1, imp: 3, hsnd: 'heavy', unb: 1, stamp: 'BLADE RAIN', dir: Math.sign(s.player.x - h.x) || 1 });
          s.fx.shake(0.4); s.fx.groundShards(h.x, 6, 1); s.fx.dust(h.x, 0, 10); AudioManager.play('slam', { pitch: 1.2 });
          if (h.sheet === 1) { tkBurst(s, h.x, -10, 18); s.fx.ring(h.x, -4, 120, 'rgba(255,214,110,0.85)', 0.35, 4); }
        }
        if (h.t > h.delay + 0.7) arr.splice(i, 1);
      }
    }
  },
  drawHaz(ctx, s, time) {
    const b = s.tkBand;
    if (b) {   // Heaven Cleaver's mark: a strip of gold light on the floor, hot and tightening once it locks
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const a = b.lock ? 0.55 + 0.35 * Math.sin(time * 30) : 0.35, hw = b.w / 2;
      const g = ctx.createLinearGradient(0, -220, 0, 0); g.addColorStop(0, 'rgba(255,200,90,0)'); g.addColorStop(1, `rgba(255,${b.lock ? 150 : 210},${b.lock ? 50 : 110},${a * 0.5})`);
      ctx.fillStyle = g; ctx.fillRect(b.x - hw, -220, b.w, 220);
      ctx.fillStyle = `rgba(255,${b.lock ? 170 : 226},${b.lock ? 70 : 140},${a})`; ctx.fillRect(b.x - hw, -6, b.w, 8);
      ctx.strokeStyle = `rgba(255,246,214,${a})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x - hw, 0); ctx.lineTo(b.x - hw, -60); ctx.moveTo(b.x + hw, 0); ctx.lineTo(b.x + hw, -60); ctx.stroke();
      ctx.restore();
    }
    const arr = s.tkHaz; if (!arr) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const h of arr) {
      if (h.kind !== 'blade' || h.t > h.delay) continue;
      const k = clamp(h.t / h.delay, 0, 1);   // the mark tightening on the floor
      ctx.strokeStyle = `rgba(255,214,110,${0.35 + 0.5 * k})`; ctx.lineWidth = 2 + 2 * k;
      ctx.beginPath(); ctx.ellipse(h.x, -2, h.w * (1.2 - 0.6 * k), 9, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = `rgba(255,190,70,${0.12 + 0.2 * k})`; ctx.fill();
    }
    ctx.restore();
  },
  // the canvas blade falling (when its sheet is not ready)
  drawHazFront(ctx, s, time) {
    const arr = s.tkHaz; if (!arr) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const h of arr) {
      if (h.kind !== 'blade' || h.sheet !== 1) continue;
      const k = clamp((h.t - (h.delay - 0.3)) / 0.3, 0, 1), y = -900 * (1 - k * k), fade = h.t > h.delay ? 1 - (h.t - h.delay) / 0.7 : 1;
      if (k <= 0) continue;
      ctx.fillStyle = `rgba(255,214,120,${0.55 * fade})`; ctx.strokeStyle = `rgba(255,250,224,${0.9 * fade})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(h.x, y + 10); ctx.lineTo(h.x - 22, y - 60); ctx.lineTo(h.x - 18, y - 360); ctx.lineTo(h.x + 18, y - 360); ctx.lineTo(h.x + 22, y - 60); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(h.x - 46, y - 372, 92, 10);
    }
    ctx.restore();
  }
};

/* ======================================================================== */
/* His abilities (registered into BOSS_ABILITIES)                             */
/* ======================================================================== */
// one golden kunai from his hand toward (tx, ty), turned `da` radians
function tkKunai(f, w, o, tx, ty, da, speed) {
  const p = WeaponSystem.spawn(w, 'kunai', f, { dmg: o.dmg });
  const a = Math.atan2(ty - p.y, tx - p.x) + (da || 0), sp = speed || o.speed;
  p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp; p.dir = Math.sign(p.vx) || f.facing; p.gold = true; p.life = 1.4;
  return p;
}

Object.assign(BOSS_ABILITIES, {
  // Golden Kunai (phases 1 and 3): the throwing hand drawn back, a gold glint, then a fan of lethal golden kunai.
  goldKunai: { id: 'goldKunai', cd: TAKASHI_MOVES.goldKunai.cd, range: TAKASHI_MOVES.goldKunai.range, chance: TAKASHI_MOVES.goldKunai.chance,
    run(f, w, ai, p, o) {
      o = tkOpt('goldKunai', o);
      const W = o.windup * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.45, rate: 26,
        pose: (f, t) => (t < W ? AKARI_POSE.throwBack : AKARI_POSE.throwOut),
        start(f) { tkFace(f, w); w.fx.popText(f, o.label, TKV_GOLD); AudioManager.play('teleport', { pitch: 1.1 }); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (t < W) { if (((t * 60) | 0) % 4 === 0) tkGather(w, f.sk.fha.x, f.sk.fha.y, 40); if (!this.g && t > W - 0.14) { this.g = 1; tkGlint(f, w, f.sk.fha.x, f.sk.fha.y); } return; }
          if (this.thrown) return;
          this.thrown = 1; tkFace(f, w);
          const pl = w.player;
          for (let i = 0; i < o.count; i++) tkKunai(f, w, o, pl.x, pl.y - 110 * pl.scale, (i - (o.count - 1) / 2) * o.spread);
        } });
    } },
  // Kunai Execution: a long glint, one very fast kunai; if it lands clean Kage is pinned, and Takashi crosses the
  // distance in a single step through the air and cuts once.
  kunaiExecution: { id: 'kunaiExecution', cd: TAKASHI_MOVES.kunaiExecution.cd, range: TAKASHI_MOVES.kunaiExecution.range, chance: TAKASHI_MOVES.kunaiExecution.chance,
    run(f, w, ai, p, o) {
      o = tkOpt('kunaiExecution', o);
      const W = o.windup * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + 1.6, rate: 26,
        pose: (f, t) => (this_exec_pose(f, t, W)),
        start(f) { tkFace(f, w); w.fx.popText(f, o.label, TKV_GOLD); AudioManager.play('teleport', { pitch: 0.9 }); f.superArmor = true; },
        update(f, w, t, dt) {
          const pl = w.player;
          f.vx = damp(f.vx, 0, 12, dt);
          if (t < W) { if (((t * 60) | 0) % 2 === 0) tkGather(w, f.sk.fha.x, f.sk.fha.y, 60); if (!this.g && t > W - 0.2) { this.g = 1; tkGlint(f, w, f.sk.fha.x, f.sk.fha.y); f.tk && (f.tk.eyes = 1); } return; }
          if (!this.k) { this.k = tkKunai(f, w, o, pl.x, pl.y - 110 * pl.scale, 0, o.speed); this.k.exec = true; f.superArmor = false; return; }
          if (!this.landed) {
            // pinned only by a clean hit (not a block, not through i-frames)
            if (this.k.hit.includes(pl) && (pl.state === 'hit' || pl.state === 'stun')) {
              this.landed = t; pl.setState('bound'); pl.boundBy = f; pl.boundT = o.pin; pl.vx = 0;
              w.fx.stamp('PINNED', pl.x, pl.y - 140 * pl.scale, 2, TKV_GOLD); AudioManager.play('chain', { pitch: 1.4 });
              this.from = f.x; this.to = pl.x - Math.sign(pl.x - f.x) * 90 * f.scale; f.invuln = o.step + 0.2;
              if (!TakashiFX.play(w, 'tk_parry', pl.x, pl.y - 120 * pl.scale, { scale: pl.scale * 0.6 })) tkBurst(w, pl.x, pl.y - 120 * pl.scale, 12);
              return;
            }
            if (t > W + 0.9 || this.k.dead || this.k.life <= 0) { this.dur = t; return false; }
            return;
          }
          const k = (t - this.landed) / o.step;
          if (k < 1) {   // the step through the air: afterimages along the path
            f.x = lerp(this.from, this.to, k * k * (3 - 2 * k)); if (((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, 'rgba(255,214,120,0.45)', { dur: 0.25 });
            return;
          }
          if (!this.cut) {
            this.cut = 1; tkFace(f, w); AudioManager.play('heavyswing', { pitch: 0.8 });
            if (pl.state === 'bound' && pl.boundBy === f) { pl.boundBy = null; pl.setState('idle'); }
            Combat.area(w, f, fbox(f, -20, -260, 230, 260), { dmg: o.cut * f.dmgMul, kb: 520, up: -460, hs: 0.7, kd: 1, imp: 3, hsnd: 'slash', unb: 1, stamp: 'EXECUTION' });
            w.fx.impactFrame(pl.x, pl.y - 120, 3); w.fx.shake(0.6);
            TakashiFX.play(w, 'tk_slash', f.x + f.facing * 80 * f.scale, f.y - 120 * f.scale, { dir: f.facing, scale: f.scale * 0.45 }) || w.fx.slashArc(f.x + f.facing * 90, f.y - 130 * f.scale, f.facing > 0 ? -0.4 : Math.PI + 0.4, 170, TKV_HOT, f.facing);
            this.dur = t + 0.5;
          }
        },
        end(f) { f.superArmor = false; const pl = w.player; if (pl && pl.state === 'bound' && pl.boundBy === f) { pl.boundBy = null; pl.setState('idle'); } } });
    } },

  /* ---- the Yashiro Titan ---- */
  // Titan Slash: the titan's blade drawn far back low, its eyes flaring; then one low sweep across the floor
  titanSlash: { id: 'titanSlash', cd: TAKASHI_MOVES.titanSlash.cd, range: TAKASHI_MOVES.titanSlash.range, chance: TAKASHI_MOVES.titanSlash.chance,
    cond: f => f.tk && f.tk.k > 0.8,
    run(f, w, ai, p, o) {
      o = tkOpt('titanSlash', o);
      const W = o.windup * ai.p.windup, S = 0.26;
      f.telegraph = W;
      f.startAbility({ dur: W + S + 0.7, rate: 16, charge: true,
        pose: (f, t) => (t < W ? TAKASHI_POSE.cleaveLow : MOVES.sh3.s),
        start(f) { tkFace(f, w); f.superArmor = true; w.fx.popText(f, o.label, TKV_GOLD); AudioManager.play('rumble'); TakashiTitan.pose(f, 'slashBack', 5); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 10, dt);
          const tip = TakashiTitan.tip(f);
          if (t < W) { f.tk.glow = Math.min(1, t / W); if (((t * 60) | 0) % 2 === 0) tkGather(w, tip.x, tip.y, 80, 2); if (!this.g && t > W - 0.2) { this.g = 1; f.tk.eyes = 1.4; tkGlint(f, w, tip.x, tip.y); } return; }
          if (!this.sw) {
            this.sw = 1; TakashiTitan.pose(f, 'slashThru', 26, f.x + f.facing * o.reach); AudioManager.play('heavyswing', { pitch: 0.55 }); w.fx.shake(0.5);
            TakashiFX.play(w, 'tk_slash', f.x + f.facing * o.reach * 0.5, 0, { dir: f.facing, scale: o.reach / (6.4 * VFX_PPM) })
              || w.fx.slashArc(f.x + f.facing * o.reach * 0.5, -70, f.facing > 0 ? 0.12 : Math.PI - 0.12, o.reach * 0.55, TKV_HOT, f.facing);
          }
          if (t < W + S) {
            const k = (t - W) / S, x0 = f.x - f.facing * 60, x1 = f.x + f.facing * o.reach * k;
            if (!this.hit) this.hit = tkTitanBlow(w, f, { x: Math.min(x0, x1), y: -o.height, w: Math.abs(x1 - x0), h: o.height }, { pct: o.pct, stamp: 'TITAN SLASH', dir: f.facing });
            if (((t * 60) | 0) % 2 === 0) { w.fx.dust(x1, 0, 4); tkBurst(w, x1, -10, 3); }
            return;
          }
          if (!this.tell) { this.tell = 1; f.superArmor = false; TakashiTitan.pose(f, 'idle', 4); w.fx.popText(f, 'OPENING', C.gold); }
        },
        end(f) { f.superArmor = false; TakashiTitan.pose(f, 'idle', 5); } });
    } },
  // Heaven Cleaver: the titan's blade raised high; a band on the floor follows Kage, then locks; the blade falls on it.
  heavenCleaver: { id: 'heavenCleaver', cd: TAKASHI_MOVES.heavenCleaver.cd, range: TAKASHI_MOVES.heavenCleaver.range, chance: TAKASHI_MOVES.heavenCleaver.chance,
    cond: f => f.tk && f.tk.k > 0.8,
    run(f, w, ai, p, o) {
      o = tkOpt('heavenCleaver', o);
      const W = o.windup * ai.p.windup, L = W * o.track, F = 0.2, maxR = 740;
      f.telegraph = W;
      f.startAbility({ dur: W + F + 0.9, rate: 16, charge: true,
        pose: (f, t) => (t < W ? RAIKON_POSE.overhead : RAIKON_POSE.slam),
        start(f) { tkFace(f, w); f.superArmor = true; w.fx.popText(f, o.label, TKV_GOLD); AudioManager.play('rumble'); TakashiTitan.pose(f, 'raise', 5); this.x = w.player.x; },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 10, dt);
          const pl = w.player;
          if (t < L) this.x = damp(this.x, pl.x, 9, dt);
          this.x = clamp(this.x, f.x - maxR, f.x + maxR);
          if (t < W) {
            f.tk.glow = Math.min(1, t / W);
            w.tkBand = { x: this.x, w: o.width, lock: t >= L, k: t / W };
            if (!this.lock && t >= L) { this.lock = 1; f.tk.eyes = 1.5; tkGlint(f, w, TakashiTitan.tip(f).x, TakashiTitan.tip(f).y); AudioManager.play('orb', { pitch: 0.8 }); }
            this.band = this.x; return;
          }
          if (!this.fall) { this.fall = 1; TakashiTitan.pose(f, 'smash', 30, this.band); AudioManager.play('heavyswing', { pitch: 0.45 }); }
          if (t >= W + F && !this.done) {
            this.done = 1; w.tkBand = null;
            tkTitanBlow(w, f, { x: this.band - o.width / 2, y: -600, w: o.width, h: 600 }, { pct: o.pct, stamp: 'HEAVEN CLEAVER', dir: Math.sign(pl.x - this.band) || f.facing, up: -620 });
            w.fx.impactFrame(this.band, -40, 3); w.fx.shake(0.9); AudioManager.play('slam'); AudioManager.play('quake');
            if (!TakashiFX.play(w, 'tk_pulse', this.band, 0, { scale: f.scale * 0.55 })) { w.fx.ring(this.band, -6, 260, 'rgba(255,214,110,0.9)', 0.5, 6); tkBurst(w, this.band, -10, 30, 1.2); }
            w.fx.groundShards(this.band, 10, 1.4); w.fx.dust(this.band, 0, 22);
          }
          if (t > W + F + 0.3 && !this.tell) { this.tell = 1; f.superArmor = false; TakashiTitan.pose(f, 'idle', 3); w.fx.popText(f, 'OPENING', C.gold); }
        },
        end(f) { f.superArmor = false; w.tkBand = null; TakashiTitan.pose(f, 'idle', 5); } });
    } },
  // Blade Rain: giant golden blades marked on the floor, one under Kage and the rest round him, falling in turn
  bladeRain: { id: 'bladeRain', cd: TAKASHI_MOVES.bladeRain.cd, range: TAKASHI_MOVES.bladeRain.range, chance: TAKASHI_MOVES.bladeRain.chance,
    cond: f => f.tk && f.tk.k > 0.8,
    run(f, w, ai, p, o) {
      o = tkOpt('bladeRain', o);
      const W = o.windup * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.6, rate: 16,
        pose: (f, t) => RAIKON_POSE.callSky,
        start(f) { tkFace(f, w); w.fx.popText(f, o.label, TKV_GOLD); AudioManager.play('teleport', { pitch: 0.6 }); TakashiTitan.pose(f, 'slamUp', 6); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 10, dt);
          if (t < W) { const j = TakashiTitan.joint(f, 'L'); if (((t * 60) | 0) % 2 === 0) tkGather(w, j.x, j.y, 70, 2); return; }
          if (this.cast) return;
          this.cast = 1; f.tk.eyes = 1;
          const pl = w.player, l = w.bounds.l + 40, r = w.bounds.r - 40;
          const xs = [pl.x];
          for (let i = 1; xs.length < o.count; i++) { for (const sd of [-1, 1]) { const x = pl.x + sd * i * o.spacing; if (x > l && x < r && xs.length < o.count) xs.push(x); } if (i > 8) break; }
          xs.forEach((x, i) => TakashiBoss.haz(w, { kind: 'blade', x, delay: o.delay + i * o.gap, w: o.width, dmg: o.dmg }));
          AudioManager.play('orb', { pitch: 0.7 });
        },
        end(f) { TakashiTitan.pose(f, 'idle', 5); } });
    } },
  // Crushing Grasp: the titan's free hand sweeps out along the floor; caught, Kage is held, crushed, slammed down
  crushingGrasp: { id: 'crushingGrasp', cd: TAKASHI_MOVES.crushingGrasp.cd, range: TAKASHI_MOVES.crushingGrasp.range, chance: TAKASHI_MOVES.crushingGrasp.chance,
    cond: f => f.tk && f.tk.k > 0.8,
    run(f, w, ai, p, o) {
      o = tkOpt('crushingGrasp', o);
      const W = o.windup * ai.p.windup, out = o.reach / o.speed;
      f.telegraph = W;
      f.startAbility({ dur: W + out * 2 + o.hold + 0.6, rate: 16, charge: true,
        pose: (f, t) => (t < W ? TAKASHI_POSE.guard : RAIKON_POSE.callDown),
        start(f) { tkFace(f, w); f.superArmor = true; w.fx.popText(f, o.label, TKV_GOLD); AudioManager.play('rumble'); TakashiTitan.pose(f, 'idle', 6); this.hx = f.x; },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 10, dt);
          const pl = w.player, root = TakashiTitan.root(f);
          if (t < W) { if (!this.g && t > W - 0.2) { this.g = 1; f.tk.eyes = 1.2; AudioManager.play('orb', { pitch: 0.9 }); } return; }
          if (this.caught) {
            const k = t - this.caught;
            pl.x = damp(pl.x, this.hx, 12, dt); pl.vx = 0;
            if (((t * 60) | 0) % 3 === 0) tkBurst(w, pl.x, pl.y - 100 * pl.scale, 2, 0.6);
            if (k > o.hold && !this.slam) {
              this.slam = 1;
              if (pl.state === 'bound' && pl.boundBy === f) { pl.boundBy = null; pl.setState('idle'); }
              pl.invuln = 0;
              tkTitanBlow(w, f, { x: pl.x - 60, y: -400, w: 120, h: 400 }, { pct: o.pct, stamp: 'CRUSHED', dir: f.facing, up: -380, kb: 300 });
              w.fx.shake(0.7); AudioManager.play('slam'); w.fx.dust(pl.x, 0, 18);
              TakashiTitan.pose(f, 'idle', 4); this.back = t;
            }
            return;
          }
          const k = (t - W) / out;
          if (!this.back) {
            if (k < 1) this.hx = root.x + f.facing * o.reach * k; else this.back = t;
            TakashiTitan.pose(f, 'reach', 30, this.hx);
            if (((t * 60) | 0) % 2 === 0) w.fx.dust(this.hx, 0, 3);
            if (pl.alive && pl.invuln <= 0 && !tkFallen(pl) && pl.grounded && Math.abs(pl.x - this.hx) < 70 * f.scale) {
              this.caught = t; f.tk.closed = true; pl.move = null; pl.abil = null; pl.setState('bound'); pl.boundBy = f; pl.boundT = o.hold + 0.3;
              w.fx.stamp('SEIZED', pl.x, pl.y - 150 * pl.scale, 2, TKV_GOLD); AudioManager.play('grab'); w.fx.stop(0.08);
              this.dur = t + o.hold + 1.0;
            }
            return;
          }
          TakashiTitan.pose(f, 'idle', 6);
          if (!this.tell) { this.tell = 1; f.superArmor = false; w.fx.popText(f, 'OPENING', C.gold); }
        },
        // his rage art breaks the hand's hold: the titan reels
        onBreak(f, w) { this.caught = 0; this.back = this.t; f.superArmor = false; f.tkOpen = 1.2; TakashiTitan.pose(f, 'idle', 4); w.fx.popText(f, 'BROKEN FREE', TKV_GOLD); },
        end(f) { f.superArmor = false; f.tk.closed = false; TakashiTitan.pose(f, 'idle', 5); const pl = w.player; if (pl && pl.state === 'bound' && pl.boundBy === f) { pl.boundBy = null; pl.setState('idle'); } } });
    } },
  // Titan Spear: a spear of gold formed in the titan's free hand and hurled straight across the arena
  titanSpear: { id: 'titanSpear', cd: TAKASHI_MOVES.titanSpear.cd, range: TAKASHI_MOVES.titanSpear.range, chance: TAKASHI_MOVES.titanSpear.chance,
    cond: f => f.tk && f.tk.k > 0.8,
    run(f, w, ai, p, o) {
      o = tkOpt('titanSpear', o);
      const W = o.windup * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.6, rate: 16,
        pose: (f, t) => (t < W ? AKARI_POSE.throwBack : AKARI_POSE.throwOut),
        start(f) { tkFace(f, w); w.fx.popText(f, o.label, TKV_GOLD); AudioManager.play('charge'); TakashiTitan.pose(f, 'spearBack', 6); f.tk.spear = { a: 0, k: 0 }; },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 10, dt);
          if (t < W) { f.tk.spear.k = Math.min(1, t / (W * 0.6)); const j = TakashiTitan.joint(f, 'L'); if (((t * 60) | 0) % 2 === 0) tkGather(w, j.x, j.y, 90, 2); if (!this.g && t > W - 0.18) { this.g = 1; f.tk.eyes = 1.2; tkGlint(f, w, j.x, j.y); } return; }
          if (this.thrown) return;
          this.thrown = 1; f.tk.spear = null; TakashiTitan.pose(f, 'spearThrow', 24);
          const pr = WeaponSystem.spawn(w, 'tkspear', f, { x: f.x + f.facing * 120 * f.scale, y: -125, dmg: o.dmg });
          pr.vx = f.facing * o.speed; pr.vy = 0; pr.gold = true;
          AudioManager.play('heavyswing', { pitch: 0.6 }); w.fx.shake(0.35);
        },
        end(f) { if (f.tk) f.tk.spear = null; TakashiTitan.pose(f, 'idle', 5); } });
    } },
  // Domain Pulse: the titan's fists come down on the floor; a shockwave runs both ways across the whole arena
  domainPulse: { id: 'domainPulse', cd: TAKASHI_MOVES.domainPulse.cd, range: TAKASHI_MOVES.domainPulse.range, chance: TAKASHI_MOVES.domainPulse.chance,
    cond: f => f.tk && f.tk.k > 0.8,
    run(f, w, ai, p, o) {
      o = tkOpt('domainPulse', o);
      const W = o.windup * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + 0.8, rate: 16, charge: true,
        pose: (f, t) => (t < W ? RAIKON_POSE.overhead : RAIKON_POSE.slam),
        start(f) { tkFace(f, w); f.superArmor = true; w.fx.popText(f, o.label, TKV_GOLD); AudioManager.play('rumble'); TakashiTitan.pose(f, 'slamUp', 5); },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 10, dt);
          if (t < W) { if (t > W - 0.2) TakashiTitan.pose(f, 'slam', 26); return; }
          if (this.done) { if (t > W + 0.4 && !this.tell) { this.tell = 1; f.superArmor = false; TakashiTitan.pose(f, 'idle', 4); w.fx.popText(f, 'OPENING', C.gold); } return; }
          this.done = 1; f.tk.eyes = 1;
          const x = TakashiTitan.root(f).x + f.facing * 160 * TakashiTitan.unit(f);
          for (const dir of [-1, 1]) { const pr = WeaponSystem.spawn(w, 'tkpulse', f, { x, dir, dmg: o.dmg }); pr.vx = dir * o.speed; pr.gold = true; }
          w.fx.shake(0.85); AudioManager.play('slam'); AudioManager.play('quake');
          if (!TakashiFX.play(w, 'tk_pulse', x, 0, { scale: f.scale * 0.8 })) { w.fx.ring(x, -6, 360, 'rgba(255,214,110,0.9)', 0.6, 7); tkBurst(w, x, -10, 30, 1.3); }
          w.fx.groundShards(x, 10, 1.3); w.fx.dust(x, 0, 24);
        },
        end(f) { f.superArmor = false; TakashiTitan.pose(f, 'idle', 5); } });
    } },

  /* ---- Tenrai: Heaven's Final Judgment (phase 3, his domain) ---- */
  tenraiJudgment: { id: 'tenraiJudgment', cd: TAKASHI_MOVES.tenraiJudgment.cd, range: TAKASHI_MOVES.tenraiJudgment.range, chance: TAKASHI_MOVES.tenraiJudgment.chance,
    cond: (f, w) => !w.tkCrack,
    run(f, w, ai, p, o) {
      o = tkOpt('tenraiJudgment', o);
      const W = o.windup * ai.p.windup, P = 0.45, C2 = o.channel * ai.p.windup;
      f.telegraph = W;
      f.startAbility({ dur: W + P + C2 + 1.2, rate: 12, uninterruptible: true,
        pose: (f, t) => (t < W ? RAIKON_POSE.overhead : TAKASHI_POSE_PLANT),
        start(f) {
          tkFace(f, w); f.superArmor = true; f.invuln = W + P;
          w.fx.popText(f, o.label, TKV_GOLD); AudioManager.play('boss'); AudioManager.play('rumble');
          // the domain: the arena turns gold, the shrine rises behind him (and stays for the rest of the fight)
          if (!w.tkDomain) w.tkDomain = { k: 0, x: f.x - f.facing * 260, flash: 1.2, title: 2.6 };
          else { w.tkDomain.off = false; w.tkDomain.flash = 0.8; w.tkDomain.title = 2.2; }
          if (f.tk) f.tk.shrunk = false;   // he grows huge again with his domain
          w.fx.slowmo(0.5, 0.6); w.fx.shake(0.5);
        },
        update(f, w, t, dt) {
          f.vx = damp(f.vx, 0, 14, dt);
          const pl = w.player;
          if (t < W) { if (((t * 60) | 0) % 2 === 0) tkGather(w, f.sk.wt.x, f.sk.wt.y, 90, 2); return; }
          if (!this.plant) {
            // the sword goes into the ground; the floor starts to crack; his guard is down until it is over
            this.plant = t; f.superArmor = false; f.invuln = 0; f.tkOpen = P + C2 + 0.2;
            const x = f.x + f.facing * 70 * f.scale;
            AudioManager.play('slam'); AudioManager.play('quake'); w.fx.shake(0.8); w.fx.groundShards(x, 10, 1.4); w.fx.dust(x, 0, 20);
            const lines = [];
            for (const dir of [-1, 1]) for (let j = 0; j < 3; j++) {
              const pts = [[x, -1]], len = 1500 + j * 120;
              let cx = x, cy = -1;
              for (let i = 0; i < 16; i++) { cx += dir * len / 16; cy = -1 - ((i * 7 + j * 3) % 5) * (j + 1) * 0.8; pts.push([cx, cy]); }
              lines.push({ pts, len, w: 3 - j * 0.8 });
            }
            w.tkCrack = { owner: f, x, t: 0, dur: C2, k: 0, reach: 1500, alpha: 0, lines, dealt: 0, need: o.breakPct * f.maxHp, prompt: true, done: false };
            w.tkCrack.sheet = TakashiFX.play(w, 'tk_crack', x, 0, { scale: f.scale * 1.1, loop: true });
            if (!this.taught) { this.taught = 1; w.fx.popText(pl, 'BREAK IT: STRIKE HIM HARD', TKV_HOT); }
          }
          const c = w.tkCrack; if (!c || c.done) return;
          c.t += dt; c.k = clamp(c.t / c.dur, 0, 1);
          if (((t * 60) | 0) % 6 === 0) w.fx.shake(0.08 + 0.2 * c.k);
          if (((t * 60) | 0) % 3 === 0) { const x = c.x + rand(-1, 1) * 1500 * c.k; w.fx.part({ x, y: -2, vx: 0, vy: -rand(120, 300), life: 0.5, size: rand(1.5, 3), color: TKV_HOT, type: 'spark', grav: 0, drag: 1, add: true }); }
          if (c.dealt >= c.need) {
            // broken: the cracks go dark, the sword is torn free, he reels
            c.done = true; c.prompt = false;
            // the domain's light goes out and he shrinks back to his own size until he casts it again
            if (w.tkDomain) w.tkDomain.off = true;
            if (f.tk) f.tk.shrunk = true;
            f.abil && (f.abil.uninterruptible = false);
            f.endAbility(w); f.setState('stun'); f.stunT = o.stagger; f.tkOpen = o.stagger;
            w.fx.stamp('DOMAIN BROKEN', f.x, f.y - 200 * f.scale, 3, TKV_GOLD, 'DOMAIN BROKEN');
            w.fx.impactFrame(f.x, f.y - 120, 3); w.fx.slowmo(0.4, 0.6); AudioManager.play('guardbreak');
            tkBurst(w, c.x, -10, 40, 1.4);
            return false;
          }
          if (c.k >= 1 && !this.judged) {
            // judgment: divine thunder on Kage. It cannot be blocked or dodged; it kills.
            this.judged = 1; c.done = true; c.prompt = false;
            const x = pl.x;
            w.tkThunder = { x, t: 0, sheet: TakashiFX.play(w, 'tk_thunder', x, 0, { scale: 1.3, start: 0.18 }) };   // from its strike frame
            w.fx.impactFrame(x, -200, 3); w.fx.shake(1); AudioManager.play('thunder'); AudioManager.play('impact');
            w.fx.stamp('JUDGMENT', x, -260, 3, TKV_GOLD, 'HEAVEN\'S JUDGMENT');
            if (pl.alive) { pl.invuln = 0; if (pl.state === 'bound') pl.boundBy = null; Combat.damage(w, f, pl, pl.hp + 9999, { imp: 3, hsnd: 'heavy', kd: 1 }, x, pl.y - 120, f.facing, 3); }
            this.dur = t + 1.0;
          }
        },
        end(f) { f.superArmor = false; const c = w.tkCrack; if (c && !c.done) { c.done = true; c.prompt = false; } } });
    } }
});
// Kunai Execution's body: the hand drawn back through the glint, thrown, held after the throw, then the cut
function this_exec_pose(f, t, W) { return t < W ? AKARI_POSE.throwBack : (f.abil && f.abil.cut) ? MOVES.sh3.s : AKARI_POSE.throwOut; }
// the sword driven down into the floor before him, both hands on the hilt (the overhead strike's landing, held)
const TAKASHI_POSE_PLANT = Object.assign({}, RAIKON_POSE.slam, { lean: 30, head: 16 });

/* ---- his projectiles: golden kunai (PROJ.kunai with p.gold), the Titan Spear and the Domain Pulse ---- */
// Titan Spear: straight, fast, chest height, unblockable, a knockdown (dash through it, or jump it)
PROJ.tkspear = { speed: 1700, r: 30, dmg: 24, hs: 0.6, kb: 560, up: -340, life: 1.6, grav: 0, imp: 3, hsnd: 'heavy', kd: 1, unb: 1, stamp: 'TITAN SPEAR' };
// Domain Pulse: a gold shockwave along the floor across the whole arena (jump it)
PROJ.tkpulse = { speed: 900, r: 34, dmg: 16, hs: 0.5, kb: 320, up: -420, life: 2.1, grav: 0, imp: 2, hsnd: 'heavy', kd: 1, ground: 1, unb: 1, stamp: 'PULSE' };

const TakashiProj = {
  // a golden kunai striking or falling: a short gold impact where it ends
  impact(w, p) {
    if (p.type !== 'kunai') return;
    if (!TakashiFX.play(w, 'tk_kunai_hit', p.x, p.y, { scale: 0.6, dir: Math.sign(p.vx) || 1 })) tkBurst(w, p.x, p.y, 6, 0.6);
  },
  // drawn translated to the projectile; true when drawn here
  draw(ctx, p) {
    if (p.type === 'kunai') {
      const a = Math.atan2(p.vy, p.vx), sc = (p.owner && p.owner.scale ? p.owner.scale / 1.342 : 1) * (p.exec ? 1.35 : 1);
      if (TakashiFX.on('tk_kunai')) {
        const d = VfxSheets.ready('tk_kunai');
        ctx.rotate(a);
        VfxSheets.drawCell(ctx, 'tk_kunai', d, VfxSheets.cell(d, 2 / 60 + (p.t % (18 / 60))), 1, 0.55 * sc, Math.min(1, p.life / 0.1));
        return true;
      }
      ctx.rotate(a); ctx.scale(sc, sc);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(-70, 0, 0, 0); g.addColorStop(0, 'rgba(255,170,40,0)'); g.addColorStop(1, 'rgba(255,220,120,0.75)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-70, -2); ctx.lineTo(0, -5); ctx.lineTo(0, 5); ctx.lineTo(-70, 2); ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(2, -6); ctx.lineTo(-10, -2); ctx.lineTo(-10, 2); ctx.lineTo(2, 6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff6d8'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.strokeStyle = '#b9781c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-14, 0, 3.5, 0, TAU); ctx.stroke();
      return true;
    }
    if (p.type === 'tkspear') {
      ctx.scale(p.dir, 1); ctx.globalCompositeOperation = 'lighter';
      const L = 300, g = ctx.createLinearGradient(-L * 1.6, 0, L * 0.6, 0); g.addColorStop(0, 'rgba(255,170,40,0)'); g.addColorStop(0.7, 'rgba(255,210,110,0.5)'); g.addColorStop(1, 'rgba(255,246,214,0.95)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-L * 1.6, -6); ctx.lineTo(L * 0.4, -14); ctx.lineTo(L * 0.62, 0); ctx.lineTo(L * 0.4, 14); ctx.lineTo(-L * 1.6, 6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,240,0.95)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(L * 0.6, 0); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,200,90,0.5)'; ctx.lineWidth = 2;
      for (let j = 0; j < 2; j++) { ctx.beginPath(); for (let i = 0; i <= 10; i++) ctx.lineTo(-L + i * L * 0.16, Math.sin(p.t * 30 + i + j * 3) * 12); ctx.stroke(); }
      return true;
    }
    if (p.type === 'tkpulse') {
      ctx.scale(p.dir, 1); ctx.globalCompositeOperation = 'lighter';
      const k = Math.min(1, p.life / 0.3);
      const g = ctx.createLinearGradient(-160, 0, 20, 0); g.addColorStop(0, 'rgba(255,170,40,0)'); g.addColorStop(1, `rgba(255,226,140,${0.8 * k})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-160, 0); ctx.quadraticCurveTo(-30, -20, 0, -70); ctx.quadraticCurveTo(12, -30, 24, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(255,250,224,${k})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-60, -4); ctx.quadraticCurveTo(-8, -24, 0, -70); ctx.stroke();
      return true;
    }
    return false;
  }
};

/* ---- the duel's pacing (FIGHT_STYLES.takashi, 41-styles/takashi.js): the Yashiro Titan's unblockable blows come less
   often than TAKASHI_MOVES' cool-downs, so its parriable sword strokes (the titanKata) have room between them: the
   spectacle stays, the parry game runs through it ---- */
for (const [id, k] of [['titanSlash', 1.35], ['heavenCleaver', 1.5], ['bladeRain', 1.3], ['crushingGrasp', 1.3], ['titanSpear', 1.2], ['domainPulse', 1.25]]) BOSS_ABILITIES[id].cd = TAKASHI_MOVES[id].cd * k;
