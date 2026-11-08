/* KAGE — the seven weapon rage arts: Kage's cinematic ultimates (the 2026-11-08 weapon redesign).

   Each shop weapon has its own rage art (SPECIALS / WEAPONS[id].special), built the same way: an ANTICIPATION in which
   the world freezes around Kage (every other fighter and every projectile holds still: RageArts.holding), a cut-in band
   slides across the screen with the weapon and the art's name, the arena changes (its environment: a blood moon, a
   storm, a violet silence, a hell sky, a flood, the dark, a golden quake) and the camera closes in; an EXECUTION that
   binds the foe and lands several unblockable blows; and a FINISHER with its own impact frame in the art's colour,
   hit-stop, slow motion, a shake and a zoom punch. Every art ends cleanly and gives the arena back.

     crimsonMoon   Kagetsu    a crimson moon rises; three crimson crescent cuts from both sides; the blade is sheathed
                              and the giant crescent falls through the foe (and flies on as Moonfall)
     swallowStorm  Tsubame    lightning gathers on both fangs; Kage strikes from eight directions, each strike leaving
                              a lightning afterimage round the foe; all of them strike at once in a lightning X
     silentMoon    Shizuka    the world goes silent and violet; one invisible draw through the foe; a lattice of violet
                              cuts blooms on them; the blade clicks home and every cut opens at once
     hellSplitter  Onikiri    a demon aura and a hell sky; a leap; the cleaver comes down and splits the floor:
                              fissures race both ways (the old Mountain Split shocks) and lava pillars erupt along them
     waterDragon   Mizuchi    the arena floods and rain falls; a giant water dragon bursts from the spear, coils round
                              the foe, rises and crashes down on them in a tidal splash
     reaperRequiem Yamigama   darkness closes in and eyes open in it; three shadow clones rise, chain the foe and cut
                              in turn; Kage leaps and two enormous scythe crescents carve down through the foe
     goldenQuake   Iwakudaki  runes light, rocks float up and the ground trembles; a leap and a slam: golden shockwaves
                              race out three times and every grounded foe is stunned (the old Earthshatter rule)

   The big contact effects are Effekseer effects (vfx/src/VFX_Rage_*.py, built and reviewed with the effekseer-vfx skill
   in its Godot Lab, baked by vfx/tools/export_game.py into the rage_* sheets of 34-vfx-sheets.js); every one has a
   canvas fallback drawn while its sheet has not decoded (the headless tests always run the fallbacks, as with
   Akari's sakura). Also here: each weapon's footwork trail (WeaponFootwork, ARC_STYLES.move) and Shizuka's delayed
   silent cut (`echo` on a move: RageArts.echo). */

const RAGE_ARTS = {
  crimsonMoon:   { weapon: 'kagetsu',   name: 'Crimson Moon',        kanji: '紅月', col: '#ff2238', hot: '#ffd0d4', deep: '#2a0008', rgb: [255, 34, 56] },
  swallowStorm:  { weapon: 'tsubame',   name: 'Thousand Swallows',   kanji: '雷燕', col: '#38c8ff', hot: '#e6f9ff', deep: '#021626', rgb: [56, 200, 255] },
  silentMoon:    { weapon: 'shizuka',   name: 'Silent Moon',         kanji: '静月', col: '#a46bff', hot: '#f0e6ff', deep: '#12052a', rgb: [164, 107, 255] },
  hellSplitter:  { weapon: 'onikiri',   name: 'Hell Splitter',       kanji: '鬼斬', col: '#ff3a1c', hot: '#ffd2a0', deep: '#2a0500', rgb: [255, 58, 28] },
  waterDragon:   { weapon: 'mizuchi',   name: 'Rising Water Dragon', kanji: '水龍', col: '#2f9dff', hot: '#d4f1ff', deep: '#001428', rgb: [47, 157, 255] },
  reaperRequiem: { weapon: 'yamigama',  name: "Reaper's Requiem",    kanji: '闇鎌', col: '#9a3cff', hot: '#f0c8ff', deep: '#06020c', rgb: [154, 60, 255] },
  goldenQuake:   { weapon: 'iwakudaki', name: 'Golden Earthbreaker', kanji: '岩砕', col: '#ffb51f', hot: '#fff1bf', deep: '#1e1200', rgb: [255, 181, 31] }
};
const _rh = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };   // a stable hash for drawn detail

const RageArts = {
  /* ---- the shared beats ---- */
  // start art `id` for fighter f: the freeze, the cut-in, the environment, the cinematic camera. Returns its state.
  begin(w, f, id, o) {
    const art = RAGE_ARTS[id], tgt = this.target(w, f);
    const A = w.rart = { id, art, owner: f, tgt, t: 0, dur: o.dur, freeze: o.freeze, env: 0, cine: true, flash: 0, moon: 0,
      ax: tgt ? tgt.x : f.x + f.facing * 160, wid: f.weaponId(), ghosts: [], rocks: [], cracks: [], clones: [], dragon: null, petals: [] };
    if (tgt) f.facing = Math.sign(tgt.x - f.x) || f.facing;
    f.invuln = Math.max(f.invuln, o.dur + 0.1); f.rageArt = true; w.fx.impactTint = art.col;
    AudioManager.play('teleport', { pitch: 0.55 }); AudioManager.play('charge');
    w.fx.shake(0.15);
    return A;
  },
  // the nearest living foe
  target(w, f) { return w.nearestEnemy ? w.nearestEnemy(f) : w.opponentOf ? w.opponentOf(f) : null; },
  // the art's owner while the world holds still for its anticipation
  holding(w) { const A = w.rart; return A && A.t < A.freeze && A.owner && A.owner.state === 'ability' ? A.owner : null; },
  // hold a foe in place through the execution (a boss in the middle of an uninterruptible ability keeps it)
  bind(tgt, dur) {
    if (!tgt || !tgt.alive || (tgt.abil && tgt.abil.uninterruptible) || tgt.state === 'down') return;
    tgt.move = null; if (tgt.abil) tgt.endAbility(); tgt.vx = 0;
    if (tgt.state !== 'juggle' && tgt.state !== 'hit') { tgt.setState('stun'); tgt.stunT = Math.max(tgt.stunT || 0, dur); }
  },
  // one unblockable blow of the art (its damage scaled by the weapon, as every rage art)
  hit(w, f, tgt, m) {
    if (!tgt || !tgt.alive) return false;
    const mul = weaponMul(f.weaponId(), f.wlvl).dmg, quiet = (m.imp || 1) < 3, keep = w.fx.impact;
    Combat.applyHit(w, f, tgt, Object.assign({ hsnd: 'slash', unb: 1, hs: 0.35, imp: 1, quiet: quiet ? 1 : 0 }, m, { dmg: m.dmg * mul }), tgt.x, tgt.y - 110 * tgt.scale, Math.sign(tgt.x - f.x) || f.facing);
    if (quiet) w.fx.impact = keep;   // only the finisher gets an impact frame
    return true;
  },
  // the finisher's contact: an impact frame in the art's colour, hit-stop, slow motion, the shake and the zoom punch
  finish(w, x, y, A, o) {
    o = o || {};
    w.fx.impactFrame(x, y, 3);
    w.fx.stop(o.stop || 0.12); w.fx.slowmo(o.slow || 0.3, o.slowT || 0.45); w.fx.shake(o.shake || 0.9); w.fx.punch(o.punch || 0.12);
    w.fx.ring(x, y, o.ring || 220, A.art.col, 0.5, 7); w.fx.ring(x, y, (o.ring || 220) * 0.6, A.art.hot, 0.35, 4);
    if (o.stamp) w.fx.stamp(o.stamp, x, y - 40, 3, A.art.col, A.art.name.toUpperCase());
    A.flash = 1;
    AudioManager.play('impact'); AudioManager.play('slam');
  },
  // a burst of the art's sparks
  sparks(w, x, y, A, n, spd, up) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), v = rand(spd * 0.3, spd);
      w.fx.part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (up || 0), life: rand(0.3, 0.7), size: rand(1.4, 3.4), color: i % 3 ? A.art.col : A.art.hot, type: 'spark', grav: 260, drag: 2.2, add: true });
    }
  },
  // the art's mark (a canvas crescent, slash, ring ... drawn by drawFront while its sheet is not available)
  mark(w, m) { (w.rartFx || (w.rartFx = [])).push(Object.assign({ t: 0, dur: 0.5, rot: 0, s: 1, dir: 1 }, m)); if (w.rartFx.length > 40) w.rartFx.shift(); },
  end(w, f) { const A = w.rart; if (A && A.owner === f) { A.done = true; A.cine = false; } f.invuln = Math.min(f.invuln, 0.25); f.alpha = 1; f.rageArt = false; w.fx.impactTint = null; },

  // Shizuka's silent cut: a move with `echo` that cleanly hits leaves a cut that opens on the foe `delay` seconds later
  echo(w, att, def, m, dir) {
    const e = m.echo, mul = (att.dmgMul || 1) * (att.hasWeapon ? weaponMul(att.weaponId(), att.wlvl).dmg : 1);
    (w.echoes || (w.echoes = [])).push({ att, def, t: 0, delay: e.delay, dir, m: { dmg: e.dmg * mul, kb: e.kb, up: e.up, kd: e.kd, hs: e.hs || 0.35, imp: e.imp || 1, stamp: e.stamp || null, hsnd: 'slash', unb: 1, proj: true, echoCut: 1 } });
    w.fx.glint(def.x, def.y - 110 * def.scale, '#d9c4ff');
  },

  /* ---- each step of the fight (FightSession.simulate) ---- */
  step(w, dt) {
    // silent cuts opening
    if (w.echoes && w.echoes.length) {
      for (let i = w.echoes.length - 1; i >= 0; i--) {
        const e = w.echoes[i]; e.t += dt;
        if (e.t < e.delay) continue;
        w.echoes.splice(i, 1);
        if (!e.def.alive || !e.att.alive) continue;
        const x = e.def.x, y = e.def.y - 110 * e.def.scale;
        RageFx.violet(w, x, y, e.dir > 0 ? -0.35 : 0.35, 0.55, e.dir);
        Combat.applyHit(w, e.att, e.def, e.m, x, y, e.dir);
        AudioManager.play('slash', { pitch: 1.35 });
      }
    }
    if (w.rartFx) for (let i = w.rartFx.length - 1; i >= 0; i--) { const m = w.rartFx[i]; m.t += dt; if (m.t > m.dur) w.rartFx.splice(i, 1); }
    const A = w.rart; if (!A) return;
    A.t += dt;
    const live = !A.done && A.owner.state === 'ability';
    A.env = damp(A.env, live ? 1 : 0, live ? 6 : 3.5, dt);
    A.flash = Math.max(0, A.flash - dt * 2.5);
    if (!live) { A.cine = false; if (A.env < 0.02) { for (const c of A.clones) c.visible = false; w.rart = null; } }
    // puppets (Reaper's shadow clones) pose on the fight's clock
    for (const c of A.clones) { if (!c.puppet) continue; c.time += dt; if (c.abil) c.abil.t += dt; c.updatePose(dt); c.computeSkeleton(); c.updateCloth(dt); }
    for (const r of A.rocks) { r.t += dt; r.vy += (r.fall ? 1500 : -40) * dt; r.y += r.vy * dt; r.x += (r.vx || 0) * dt; r.rot += r.vr * dt; if (r.fall && r.y > 0) { r.y = 0; r.vy *= -0.25; r.vx = (r.vx || 0) * 0.5; } }
    if (A.dragon) RageArts.dragonStep(w, A, dt);
  },
  // the cinematic camera (FightSession.updateCamera): close on Kage through the anticipation, then frame the exchange
  camera(w, tz, ty) {
    const A = w.rart; if (!A || !A.cine) return null;
    const f = A.owner, tgt = A.tgt && A.tgt.alive ? A.tgt : null;
    if (A.t < A.freeze) return { tx: f.x + f.facing * 40, tz: 1.42, ty: -20 };
    const mx = tgt ? (f.x + tgt.x) / 2 : f.x;
    // (the letterbox covers the bottom 70 px: the floor stays just above it)
    return { tx: mx, tz: A.id === 'waterDragon' ? 0.92 : A.id === 'goldenQuake' || A.id === 'hellSplitter' ? 1.0 : 1.18, ty: A.id === 'waterDragon' ? -20 : -8 };
  }
};

/* ======================================================================== */
/* The baked Effekseer sheets and their canvas fallbacks                      */
/* ======================================================================== */
const RageFx = {
  // sheet `name` has really decoded (the tests' Image stub never does, so they always draw the canvas fallbacks)
  on(name) { return !!VfxSheets.ready(name) && typeof VfxSheets.img[name].naturalWidth === 'number'; },
  play(w, name, x, y, o) { return this.on(name) && w.fx.playSheet ? w.fx.playSheet(name, x, y, o) : null; },
  // a U-shaped crescent sheet has its origin at the bottom of the arc: shift it (turned with the cut) so the arc's
  // middle lies on (x, y). `up` is how far the arc's middle sits above the origin, in metres
  arcAt(name, x, y, rot, s, dir, up) {
    const d = up * VFX_PPM * s, a = rot * dir;
    return [x - Math.sin(a) * d, y + Math.cos(a) * d];
  },
  // a crimson crescent cut through (x, y), turned `rot`
  crescent(w, x, y, rot, s, dir) {
    const [ox, oy] = this.arcAt('rage_crimson', x, y, rot, s, dir, 0.95);
    if (!this.play(w, 'rage_crimson', ox, oy, { dir, scale: s, rot })) RageArts.mark(w, { type: 'crescent', x, y, rot, s, dir, dur: 0.42, col: '#ff2238', hot: '#ffd0d4' });
  },
  // a lightning streak from (x0, y0) to (x1, y1)
  bolt(w, x0, y0, x1, y1, s) {
    const rot = Math.atan2(y1 - y0, x1 - x0), dir = x1 >= x0 ? 1 : -1;
    if (!this.play(w, 'rage_bolt', (x0 + x1) / 2, (y0 + y1) / 2, { dir, scale: s || 1, rot: dir > 0 ? rot : Math.PI - rot }))
      w.fx.lightning(x0, y0, x1, y1, { w: 3, branches: 3, color: '#7fdcff', dur: 0.2 });
    RageArts.mark(w, { type: 'streak', x: x0, y: y0, x1, y1, dur: 0.22, col: '#38c8ff', hot: '#ffffff' });
  },
  // a thin violet cut at (x, y)
  violet(w, x, y, rot, s, dir) {
    if (!this.play(w, 'rage_violet', x, y, { dir: dir || 1, scale: s, rot })) RageArts.mark(w, { type: 'violet', x, y, rot, s, dir: dir || 1, dur: 0.5, col: '#a46bff', hot: '#f8f2ff' });
  },
  // the cleaver's landing: the floor splits open, fire and rock thrown up
  hell(w, x, dir, s) {
    if (!this.play(w, 'rage_hell', x, 0, { dir, scale: s })) RageArts.mark(w, { type: 'hell', x, y: 0, dir, s, dur: 0.9, col: '#ff3a1c', hot: '#ffd2a0' });
  },
  // the dragon's crash: a tidal splash on the floor
  tidal(w, x, s) {
    if (!this.play(w, 'rage_tidal', x, 0, { scale: s })) RageArts.mark(w, { type: 'tidal', x, y: 0, s, dur: 0.9, col: '#2f9dff', hot: '#d4f1ff' });
  },
  // an enormous dark scythe crescent through (x, y)
  scythe(w, x, y, rot, s, dir) {
    // its dark body is canvas, under the additive sheet (black adds nothing to the bake)
    RageArts.mark(w, { type: 'scythe', x, y, rot, s, dir, dur: 0.6, col: '#9a3cff', hot: '#f0c8ff', under: this.on('rage_scythe') ? 1 : 0 });
    const [ox, oy] = this.arcAt('rage_scythe', x, y, rot, s, dir, 1.4);
    this.play(w, 'rage_scythe', ox, oy, { dir, scale: s, rot });
  },
  // a golden ground impact: shock rings racing out along the floor, rock thrown up
  quake(w, x, s) {
    if (!this.play(w, 'rage_quake', x, 0, { scale: s })) RageArts.mark(w, { type: 'quake', x, y: 0, s, dur: 0.8, col: '#ffb51f', hot: '#fff1bf' });
  }
};

/* ======================================================================== */
/* Footwork: each weapon's dash leaves its own trail, the heavy ones stomp    */
/* ======================================================================== */
const WeaponFootwork = {
  dash(w, f, kind) {
    const x = f.x - f.facing * 20 * f.scale, y = f.y - rand(30, 170) * f.scale;
    switch (kind) {
      case 'lightning':
        if (chance(0.5)) w.fx.lightning(x, y, x - f.facing * rand(40, 90), y + rand(-30, 30), { w: 1.4, branches: 1, color: '#9fe6ff', dur: 0.1 });
        w.fx.afterimage(f, 'rgba(56,200,255,0.32)', { dur: 0.2 });
        break;
      case 'violet':
        w.fx.afterimage(f, 'rgba(164,107,255,0.3)', { dur: 0.3 });
        w.fx.part({ x, y, vx: -f.facing * rand(20, 80), vy: rand(-30, 10), life: rand(0.4, 0.7), size: rand(2, 3.4), color: chance(0.5) ? '#c9a8ff' : '#f0e6ff', type: 'star', grav: 0, drag: 2, add: true });
        break;
      case 'flame':
        w.fx.part({ x, y: f.y - rand(10, 120) * f.scale, vx: -f.facing * rand(40, 140), vy: rand(-160, -60), life: rand(0.3, 0.6), size: rand(1.6, 3), color: chance(0.5) ? '#ffb35a' : '#ff3a1c', type: 'spark', grav: -120, drag: 1.4, add: true });
        w.fx.afterimage(f, 'rgba(255,70,30,0.22)', { dur: 0.18 });
        break;
      case 'water':
        for (let i = 0; i < 2; i++) w.fx.part({ x: f.x - f.facing * rand(0, 30), y: -rand(2, 14), vx: -f.facing * rand(60, 200), vy: rand(-320, -120), life: rand(0.4, 0.7), size: rand(1.6, 3), color: i ? '#bfe6ff' : '#2f9dff', type: 'drop', grav: 1400, drag: 0.5, sq: 0.8 });
        w.fx.afterimage(f, 'rgba(47,157,255,0.24)', { dur: 0.2 });
        break;
      case 'shadow':
        w.fx.part({ x, y, vx: -f.facing * rand(30, 90), vy: rand(-40, 0), life: rand(0.5, 0.8), size: rand(8, 14), color: 'rgba(22,10,34,0.55)', type: 'puff', grav: -20, drag: 1.5, grow: 18 });
        w.fx.afterimage(f, 'rgba(60,20,90,0.45)', { dur: 0.32 });
        break;
      case 'earth':
        if (f.grounded) { w.fx.dust(f.x - f.facing * 30, 0, 2); w.fx.part({ x: f.x, y: -2, vx: -f.facing * rand(40, 160), vy: rand(-300, -120), life: rand(0.4, 0.7), size: rand(2, 4), color: '#4a3a28', type: 'drop', grav: 1600, sq: 0.8 }); }
        w.fx.afterimage(f, 'rgba(255,181,31,0.18)', { dur: 0.16 });
        break;
    }
  },
  // a heavy weapon's footfall: dust and a small tremor
  stomp(w, f, heavy) {
    w.fx.dust(f.x + f.facing * 10, 0, heavy ? 4 : 2);
    if (heavy) w.fx.shake(0.04);
  }
};

/* ======================================================================== */
/* The seven arts                                                              */
/* ======================================================================== */
// poses for an art's beats: the first of `beats` whose time has not passed
function artPose(beats) { return (f, t) => { for (const b of beats) if (t < b[0]) return b[1]; return beats[beats.length - 1][1]; }; }
// stand fighter f at distance d (body units) on side `side` of tgt, facing it
function standBy(w, f, tgt, side, d) {
  f.x = clamp(tgt.x + side * d * tgt.scale, w.bounds.l + 20, w.bounds.r - 20); f.facing = Math.sign(tgt.x - f.x) || -side;
  f.trail.length = 0; f.trail2.length = 0;
}

Object.assign(SPECIAL_IMPL, {
  /* ---- Kagetsu: Crimson Moon ---- */
  crimsonMoon(f, w) {
    const A = RageArts.begin(w, f, 'crimsonMoon', { dur: 1.85, freeze: 0.55 }), tgt = A.tgt;
    const cuts = [{ at: 0.55, rot: -0.6, side: -1 }, { at: 0.74, rot: 0.75, side: 1, cross: 1 }, { at: 0.93, rot: 0.08, side: -1, cross: 1 }];
    f.startAbility({ dur: 1.85, uninterruptible: true, rate: 30, trail: true, el: 'crimson',
      pose: artPose([[0.42, MOVES.k1.w], [0.55, MOVES.k1.a], [0.74, MOVES.k1.s], [0.93, MOVES.k2.s], [1.12, MOVES.k3.s], [1.38, MOVES.kc.w], [1.6, MOVES.kc.s], [9, MOVES.kc.f]]),
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 10, dt);
        A.moon = clamp(t / 0.5, 0, 1);
        if (t < 0.55) {
          // crimson motes drawn into the blade, a glint as the cut is ready
          if (((t * 60) | 0) % 2 === 0) { const a = rand(0, TAU), r = rand(80, 160); w.fx.part({ x: f.sk.wt.x + Math.cos(a) * r, y: f.sk.wt.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 3, vy: -Math.sin(a) * r * 3, life: 0.3, size: rand(1.6, 3), color: chance(0.5) ? '#ff2238' : '#ffd0d4', type: 'spark', grav: 0, drag: 0.5, add: true }); }
          if (!this.glint && t > 0.38) { this.glint = 1; w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#ffd0d4'); AudioManager.play('charge'); }
          return;
        }
        const live = tgt && tgt.alive;
        cuts.forEach((c, i) => {
          if (this['c' + i] || t < c.at) return;
          this['c' + i] = 1;
          if (live) { if (c.cross) w.fx.afterimage(f, 'rgba(255,34,56,0.45)', { dur: 0.35 }); standBy(w, f, tgt, c.cross ? -(Math.sign(f.x - tgt.x) || -1) : (Math.sign(f.x - tgt.x) || c.side), 92); w.fx.dashLines(f); }
          const x = live ? tgt.x : f.x + f.facing * 120, y = live ? tgt.y - 110 * tgt.scale : f.y - 110;
          RageFx.crescent(w, x, y, c.rot, 1.05, f.facing);
          RageArts.hit(w, f, tgt, { dmg: 7, kb: 60, up: -90, hs: 0.5, imp: 2 });
          if (i === 0) RageArts.bind(tgt, 1.3);
          w.fx.stop(0.05); w.fx.shake(0.28); RageArts.sparks(w, x, y, A, 10, 420);
          AudioManager.play('heavyswing', { pitch: 1 + i * 0.08 });
        });
        if (t > 1.12 && !this.back) {
          // the step back and the sheathe: a beat of stillness before the moon falls
          this.back = 1; f.vx = -f.facing * 520; w.fx.slowmo(0.4, 0.2); AudioManager.play('clang', { pitch: 1.6 });
        }
        if (t > 1.38 && !this.fin) {
          this.fin = 1;
          const x = live ? tgt.x : f.x + f.facing * 160, y = live ? tgt.y - 110 * tgt.scale : f.y - 110;
          RageFx.crescent(w, x, y, -0.2, 2.4, f.facing);
          RageArts.hit(w, f, tgt, { dmg: 15, kb: 640, up: -540, kd: 1, hs: 0.7, imp: 3, stamp: null });
          RageArts.finish(w, x, y, A, { stamp: 'MOONFALL', ring: 260 });
          RageArts.sparks(w, x, y, A, 26, 900, 120);
          // the crescent flies on through the line as Moonfall (the old Crescent Moon's wave), sparing the foe it just cut
          const p = WeaponSystem.spawn(w, 'crescent', f, { y: f.y - 120 * f.scale, dmgMul: weaponMul(f.weaponId(), f.wlvl).dmg * 0.6 });
          p.tint = '#ff2238'; if (live) p.hit.push(tgt);
        }
      },
      end(f, w) { RageArts.end(w, f); } }, w);
  },

  /* ---- Tsubame: Thousand Swallows ---- */
  swallowStorm(f, w) {
    const A = RageArts.begin(w, f, 'swallowStorm', { dur: 1.95, freeze: 0.5 }), tgt = A.tgt;
    // eight strikes from eight directions round the foe ([dx, dy] in body units from the foe's feet)
    const spots = [[-125, 0], [125, 0], [-95, -160], [105, -140], [-140, -70], [140, -50], [10, -205], [-120, 0]];
    const poses = ['tw1', 'tw2', 'twa', 'twa', 'tw3', 'tw4', 'twa', 'tw1'];
    f.startAbility({ dur: 1.95, uninterruptible: true, rate: 44, trail: true, el: 'lightning',
      pose: (f, t) => t < 0.5 ? MOVES.tw5.a : t < 1.24 ? MOVES[poses[clamp(((t - 0.5) / 0.09) | 0, 0, 7)]].s : t < 1.45 ? MOVES.twc.w : t < 1.62 ? MOVES.twc.s : MOVES.tw5.s,
      update(f, w, t, dt) {
        if (t < 0.5) {
          f.vx = damp(f.vx, 0, 12, dt);
          // lightning crawling between the fangs
          if (((t * 60) | 0) % 3 === 0) w.fx.lightning(f.sk.wt.x, f.sk.wt.y, f.sk.w2t.x, f.sk.w2t.y, { w: 1.6, branches: 1, color: '#9fe6ff', dur: 0.08 });
          if (!this.glint && t > 0.34) { this.glint = 1; w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#e6f9ff'); w.fx.glint(f.sk.w2t.x, f.sk.w2t.y, '#e6f9ff'); AudioManager.play('thunder', { pitch: 1.4 }); }
          return;
        }
        const live = tgt && tgt.alive;
        const i = ((t - 0.5) / 0.09) | 0;
        if (i < 8 && i !== this.last) {
          this.last = i;
          const [dx, dy] = spots[i], sc = live ? tgt.scale : 1, cx = live ? tgt.x : A.ax, cy = live ? tgt.y - 110 * sc : -110;
          f.x = clamp(cx + dx * sc, w.bounds.l + 20, w.bounds.r - 20); f.y = Math.min(0, (live ? tgt.y : 0) + dy * sc); f.vy = 0; f.vx = 0;
          f.grounded = f.y >= 0; f.facing = Math.sign(cx - f.x) || 1; f.trail.length = 0; f.trail2.length = 0;
          f.computeSkeleton();
          w.fx.afterimage(f, 'rgba(56,200,255,0.5)', { dur: 1.25 - i * 0.09 });
          A.ghosts.push({ x: f.x, y: f.y - 110 * f.scale });
          // the streak runs through the foe from where he stands to the far side
          const fx0 = f.x, fy0 = f.y - 100 * f.scale, ex = cx + (cx - fx0) * 0.9, ey = cy + (cy - fy0) * 0.9;
          RageFx.bolt(w, fx0, fy0, ex, ey, 0.8);
          RageArts.hit(w, f, tgt, { dmg: 3, kb: 30, up: -60, hs: 0.45, imp: 1 });
          if (i === 0) RageArts.bind(tgt, 1.3);
          w.fx.stop(0.03); w.fx.shake(0.16); AudioManager.play('swing', { pitch: 1.3 + i * 0.04 });
        }
        if (t > 1.24 && !this.up) {
          // Kage steps out above and behind the foe: every afterimage turns to it
          this.up = 1; const cx = live ? tgt.x : A.ax;
          f.x = clamp(cx - f.facing * 150, w.bounds.l + 20, w.bounds.r - 20); f.y = 0; f.grounded = true; f.facing = Math.sign(cx - f.x) || 1;
          w.fx.dashLines(f); AudioManager.play('teleport', { pitch: 1.5 });
        }
        if (t > 1.45 && !this.fin) {
          this.fin = 1;
          const x = live ? tgt.x : A.ax, y = live ? tgt.y - 110 * tgt.scale : -110;
          // all of them strike at once: a bolt from every afterimage, and the lightning X
          for (const g of A.ghosts) w.fx.lightning(g.x, g.y, x, y, { w: 2.4, branches: 2, color: '#9fe6ff', dur: 0.22 });
          RageFx.bolt(w, x - 170, y - 150, x + 170, y + 120, 1.4); RageFx.bolt(w, x - 170, y + 120, x + 170, y - 150, 1.4);
          RageArts.hit(w, f, tgt, { dmg: 14, kb: 520, up: -620, kd: 1, hs: 0.7, imp: 3 });
          RageArts.finish(w, x, y, A, { stamp: 'RAIJIN', ring: 240 });
          RageArts.sparks(w, x, y, A, 30, 1000, 80);
          AudioManager.play('thunder');
          A.ghosts.length = 0;
        }
      },
      end(f, w) { f.y = Math.min(f.y, 0); RageArts.end(w, f); } }, w);
  },

  /* ---- Shizuka: Silent Moon ---- */
  silentMoon(f, w) {
    const A = RageArts.begin(w, f, 'silentMoon', { dur: 2.05, freeze: 0.6 }), tgt = A.tgt;
    const lattice = [[-0.9, 0.62], [0.7, 0.78], [-0.2, 0.9], [1.25, 0.6], [-1.3, 0.66], [0.35, 0.82], [-0.55, 0.74], [0.95, 0.7]];
    for (let i = 0; i < 26; i++) A.petals.push({ x: _rh(i) * W, y: _rh(i + 40) * H * 0.85, r: 3 + _rh(i + 90) * 4, a: _rh(i + 7) * TAU });
    f.startAbility({ dur: 2.05, uninterruptible: true, rate: 34, trail: true, el: 'violet',
      pose: artPose([[0.6, MOVES.sz4.f], [0.66, MOVES.szc.s], [1.36, MOVES.szc.f], [1.52, MOVES.sz4.f], [9, MOVES.sz4.f]]),
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 14, dt);
        if (t < 0.6) { if (!this.drip && t > 0.25) { this.drip = 1; w.fx.ring(f.x, f.y - 2, 70, 'rgba(200,170,255,0.8)', 0.6, 2); AudioManager.play('parry', { pitch: 0.6 }); } return; }
        const live = tgt && tgt.alive;
        if (!this.draw) {
          // the one draw nobody sees: through the foe to the far side, a thin violet line left across the arena
          this.draw = 1;
          const x0 = f.x; if (live) standBy(w, f, tgt, Math.sign(tgt.x - f.x) || f.facing, 120); else f.x += f.facing * 260;
          RageArts.mark(w, { type: 'line', x: x0, y: f.y - 110 * f.scale, x1: f.x, dur: 0.9, col: '#a46bff', hot: '#ffffff' });
          w.fx.afterimage(f, 'rgba(164,107,255,0.4)', { dur: 0.5 });
          AudioManager.play('whoosh'); w.fx.slowmo(0.35, 0.5);
          RageArts.bind(tgt, 1.6);
        }
        // the lattice blooms on the foe, one cut at a time
        lattice.forEach(([rot, s], i) => {
          const at = 0.74 + i * 0.075;
          if (this['l' + i] || t < at) return;
          this['l' + i] = 1;
          const x = live ? tgt.x + Math.cos(i * 2.4) * 16 : A.ax, y = live ? tgt.y - (110 + Math.sin(i * 1.7) * 30) * tgt.scale : -110;
          RageFx.violet(w, x, y, rot, s, i % 2 ? 1 : -1);
          RageArts.hit(w, f, tgt, { dmg: 2.5, kb: 10, up: -40, hs: 0.5, imp: 1 });
          AudioManager.play('slash', { pitch: 1.5 + i * 0.03 });
        });
        if (t > 1.36 && !this.home) { this.home = 1; AudioManager.play('clang', { pitch: 1.8 }); w.fx.glint(f.x - f.facing * 10 * f.scale, f.y - 96 * f.scale, '#f0e6ff'); }
        if (t > 1.48 && !this.fin) {
          this.fin = 1;
          const x = live ? tgt.x : A.ax, y = live ? tgt.y - 110 * tgt.scale : -110;
          RageFx.violet(w, x, y, -0.45, 1.8, f.facing); RageFx.violet(w, x, y, 0.55, 1.6, -f.facing);
          RageArts.hit(w, f, tgt, { dmg: 16, kb: 600, up: -480, kd: 1, hs: 0.7, imp: 3 });
          RageArts.finish(w, x, y, A, { stamp: 'SILENCE', ring: 230, slow: 0.25, slowT: 0.5 });
          for (let i = 0; i < 24; i++) { const a = rand(0, TAU), v = rand(120, 520); w.fx.part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.5, 0.9), size: rand(2.5, 4.5), color: chance(0.5) ? '#c9a8ff' : '#f0e6ff', type: 'ash', grav: 60, drag: 2.4, rot: rand(0, TAU), vr: rand(-10, 10) }); }
        }
      },
      end(f, w) { RageArts.end(w, f); } }, w);
  },

  /* ---- Onikiri: Hell Splitter ---- */
  hellSplitter(f, w) {
    const A = RageArts.begin(w, f, 'hellSplitter', { dur: 1.9, freeze: 0.5 }), tgt = A.tgt;
    f.startAbility({ dur: 1.9, uninterruptible: true, rate: 24, trail: true, el: 'flame',
      pose: (f, t) => t < 0.5 ? MOVES.c3.a : !f.abil || !f.abil.down ? MOVES.c3.w : t < (f.abil.landT || 9) + 0.25 ? MOVES.c3.s : MOVES.c3.f,
      update(f, w, t, dt) {
        if (t < 0.5) {
          f.vx = damp(f.vx, 0, 12, dt);
          // the demon aura: fire licking up round him, the floor cracking red under his feet
          w.fx.part({ x: f.x + rand(-60, 60), y: -rand(0, 40), vx: rand(-30, 30), vy: rand(-420, -160), life: rand(0.3, 0.6), size: rand(6, 12), color: 'rgba(255,80,30,0.55)', type: 'flame', grav: -200, drag: 2, add: true, grow: -10 });
          if (!this.cr && t > 0.15) { this.cr = 1; for (let i = 0; i < 6; i++) A.cracks.push({ x: f.x, a: (i - 2.5) * 0.5, len: rand(60, 120), t: 0 }); AudioManager.play('rumble'); }
          if (((t * 60) | 0) % 6 === 0) w.fx.shake(0.12);
          return;
        }
        const live = tgt && tgt.alive;
        if (!this.leap) {
          this.leap = 1; const dest = live ? tgt.x - f.facing * 70 * tgt.scale : f.x + f.facing * 220;
          f.vy = -1150; f.grounded = false; f.vx = (dest - f.x) / 0.55; AudioManager.play('jump'); w.fx.dust(f.x, 0, 12);
        }
        if (t > 0.78 && !this.down) { this.down = 1; f.vy = 2000; }
        if (this.down && f.grounded && !this.land) {
          this.land = 1; this.landT = t; f.vx = 0;
          const x = f.x + f.facing * 70 * f.scale;
          RageFx.hell(w, x, f.facing, 1.2);
          for (let i = 0; i < 14; i++) A.cracks.push({ x, a: (i - 6.5) * 0.24 + (i % 2 ? 0.08 : -0.05), len: rand(160, 420), t: 0, hot: 1 });
          Combat.area(w, f, fbox(f, -140, -240, 380, 240), { dmg: 22 * weaponMul(f.weaponId(), f.wlvl).dmg, kb: 360, up: -720, hs: 0.7, kd: 1, imp: 2, hsnd: 'heavy', unb: 1, stamp: null, quiet: 1 });
          // the fissures race both ways (Mountain Split's shocks)
          WeaponSystem.spawn(w, 'bigshock', f, { dir: 1, x: x + 60 }); WeaponSystem.spawn(w, 'bigshock', f, { dir: -1, x: x - 60 });
          RageArts.finish(w, x, -60, A, { stamp: 'HELL SPLIT', ring: 300, shake: 1, stop: 0.14 });
          w.fx.dust(x, 0, 36);
          for (let i = 0; i < 24; i++) w.fx.part({ x: x + rand(-80, 80), y: -rand(0, 10), vx: rand(-420, 420), vy: rand(-900, -300), life: rand(0.6, 1.1), size: rand(3, 7), color: chance(0.3) ? '#ff6a2c' : '#1d1a16', type: 'drop', grav: 1800 });
          AudioManager.play('quake');
          this.pillars = [[150, 0.12], [-150, 0.12], [300, 0.26], [-300, 0.26], [450, 0.4], [-450, 0.4]].map(([dx, at]) => ({ x: x + dx * f.scale, at: t + at }));
        }
        // lava pillars erupt along the fissures
        if (this.pillars) for (const p of this.pillars) {
          if (p.done || t < p.at) continue;
          p.done = 1;
          RageArts.mark(w, { type: 'pillar', x: p.x, y: 0, dur: 0.6, col: '#ff3a1c', hot: '#ffd2a0', s: f.scale });
          Combat.area(w, f, { x: p.x - 50 * f.scale, y: -260 * f.scale, w: 100 * f.scale, h: 260 * f.scale }, { dmg: 5 * weaponMul(f.weaponId(), f.wlvl).dmg, kb: 140, up: -560, hs: 0.4, kd: 1, imp: 2, hsnd: 'heavy', unb: 1, quiet: 1 });
          w.fx.shake(0.3); AudioManager.play('slam', { pitch: 1.2 });
        }
      },
      end(f, w) { RageArts.end(w, f); } }, w);
  },

  /* ---- Mizuchi: Rising Water Dragon ---- */
  waterDragon(f, w) {
    const A = RageArts.begin(w, f, 'waterDragon', { dur: 2.3, freeze: 0.6 }), tgt = A.tgt;
    f.startAbility({ dur: 2.3, uninterruptible: true, rate: 26, trail: true, el: 'water',
      pose: artPose([[0.3, MOVES.sa.w], [0.6, MOVES.s2.w], [0.85, MOVES.s1.s], [1.7, MOVES.s1.f], [9, MOVES.s2.s]]),
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 12, dt);
        if (t < 0.6) {
          // water drawn up off the flooding floor into the spear's head
          if (((t * 60) | 0) % 2 === 0) { const x = f.x + rand(-220, 220); w.fx.part({ x, y: -2, vx: (f.sk.wt.x - x) * 1.6, vy: (f.sk.wt.y + 4) * 1.6, life: 0.55, size: rand(1.8, 3.2), color: chance(0.5) ? '#bfe6ff' : '#2f9dff', type: 'drop', grav: 0, drag: 0.2, sq: 0.8 }); }
          if (!this.glint && t > 0.42) { this.glint = 1; w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#d4f1ff'); AudioManager.play('charge'); }
          return;
        }
        const live = tgt && tgt.alive;
        if (!A.dragon) {
          A.dragon = { t: 0, x: f.sk.wt.x, y: f.sk.wt.y, sx: f.sk.wt.x, sy: f.sk.wt.y, trail: [], hits: 0, dir: f.facing, s: f.scale * 1.7, gone: 0 };
          w.fx.elemImpact('water', f.sk.wt.x, f.sk.wt.y, f.facing, 3, true); AudioManager.play('whoosh'); AudioManager.play('boss');
          RageArts.bind(tgt, 1.5);
        }
        const D = A.dragon;
        // the coil: a blow each time it passes in front of the foe, lifting them
        if (D.phase === 'coil' && live) {
          const k = Math.floor(D.u * 5);
          if (k > D.hits && D.hits < 5) { D.hits = k; RageArts.hit(w, f, tgt, { dmg: 3, kb: 20, up: -240, hs: 0.5, imp: 1, hsnd: 'heavy' }); w.fx.elemImpact('water', tgt.x, tgt.y - 110 * tgt.scale, f.facing, 1); }
        }
        if (D.phase === 'launch' && !this.first && live && Math.hypot(D.x - tgt.x, D.y - (tgt.y - 110 * tgt.scale)) < 90 * tgt.scale) { this.first = 1; RageArts.hit(w, f, tgt, { dmg: 6, kb: 40, up: -200, hs: 0.5, imp: 2 }); w.fx.shake(0.3); }
        if (D.phase === 'crash' && !this.fin) {
          this.fin = 1;
          const x = live ? tgt.x : D.ax;
          RageFx.tidal(w, x, 1.3);
          RageArts.hit(w, f, tgt, { dmg: 16, kb: 300, up: -360, kd: 1, spike: 1400, hs: 0.7, imp: 3 });
          RageArts.finish(w, x, -60, A, { stamp: 'MIZUCHI', ring: 280, shake: 1 });
          for (let i = 0; i < 40; i++) { const a = -Math.PI / 2 + rand(-1.3, 1.3); const v = rand(300, 1000); w.fx.part({ x: x + rand(-40, 40), y: -6, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.6, 1.1), size: rand(2, 5), color: chance(0.4) ? '#e8f6ff' : '#2f9dff', type: 'drop', grav: 1500, drag: 0.4, sq: 0.8 }); }
          AudioManager.play('quake');
        }
      },
      end(f, w) { RageArts.end(w, f); } }, w);
  },

  /* ---- Yamigama: Reaper's Requiem ---- */
  reaperRequiem(f, w) {
    const A = RageArts.begin(w, f, 'reaperRequiem', { dur: 2.2, freeze: 0.6 }), tgt = A.tgt;
    const cx = tgt ? tgt.x : f.x + f.facing * 200;
    // three shadow clones rise round the foe: Hollow-Kage puppets, drawn as living shadow (RageArts.drawClones)
    for (const [dx, at] of [[150, 0.1], [-105, 0.2], [270, 0.3]]) {
      const c = makeFighterFromEnemy('hollow_kage', { team: f.team, x: clamp(cx + dx * f.facing, w.bounds.l + 30, w.bounds.r - 30), facing: 1, weapon: f.weaponId(), wlvl: f.wlvl, hp: 1 });
      c.puppet = true; c.rise = 0; c.riseAt = at; c.facing = Math.sign(cx - c.x) || 1; c.y = 0; c.grounded = true;
      c.state = 'ability'; c.abil = { t: 0, rate: 20, pose: (c, t) => (c.slashT != null && t > c.slashT ? MOVES.h3.s : c.chainT != null && t > c.chainT ? MOVES.h2.s : MOVES.h2.a) };
      poseFighter(c, null, 20); c.state = 'ability';
      A.clones.push(c);
    }
    f.startAbility({ dur: 2.2, uninterruptible: true, rate: 26, trail: true, el: 'blood',
      pose: artPose([[0.6, MOVES.h2.a], [0.85, MOVES.h2.s], [1.3, MOVES.h2.f || MOVES.h2.s], [1.6, MOVES.ha.w], [9, MOVES.ha.s]]),
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 12, dt);
        for (const c of A.clones) c.rise = clamp((t - c.riseAt) / 0.4, 0, 1);
        if (t < 0.6) { if (((t * 60) | 0) % 3 === 0) for (const c of A.clones) w.fx.part({ x: c.x + rand(-30, 30), y: -rand(0, 20), vx: rand(-20, 20), vy: rand(-160, -60), life: rand(0.5, 0.8), size: rand(8, 14), color: 'rgba(30,10,50,0.6)', type: 'puff', grav: -20, drag: 1.5, grow: 16 }); return; }
        const live = tgt && tgt.alive;
        if (!this.chained) {
          // chains from Kage and every clone bind the foe
          this.chained = 1; A.chains = 1; for (const c of A.clones) c.chainT = c.abil.t;
          RageArts.bind(tgt, 1.6); RageArts.hit(w, f, tgt, { dmg: 4, kb: 0, up: 0, hs: 0.6, imp: 1 });
          AudioManager.play('chain'); w.fx.shake(0.2);
        }
        A.clones.forEach((c, i) => {
          const at = 0.85 + i * 0.15;
          if (c.slashed || t < at) return;
          c.slashed = 1; c.slashT = c.abil.t;
          // the clone passes through the foe and cuts: a dark crescent where it went through
          const x = live ? tgt.x : A.ax, y = live ? tgt.y - 110 * tgt.scale : -110, side = Math.sign(c.x - x) || 1;
          c.x = clamp(x - side * 110, w.bounds.l + 30, w.bounds.r - 30); c.facing = side; c.computeSkeleton();
          RageFx.scythe(w, x, y, side > 0 ? 0.5 : -0.5, 0.75, -side);
          RageArts.hit(w, f, tgt, { dmg: 5, kb: 20, up: -80, hs: 0.5, imp: 2 });
          w.fx.stop(0.04); w.fx.shake(0.22); AudioManager.play('slash', { pitch: 0.8 });
        });
        if (t > 1.3 && !this.leap) {
          this.leap = 1; A.chains = 0; f.vy = -980; f.grounded = false; f.vx = live ? (tgt.x - f.facing * 60 - f.x) / 0.45 : 0;
          for (const c of A.clones) { c.fade = 1; w.fx.memoryAsh(c, 10, true); }
          AudioManager.play('whoosh');
        }
        if (t > 1.6 && !this.fin) {
          this.fin = 1; f.vy = 1400;
          const x = live ? tgt.x : A.ax, y = live ? tgt.y - 120 * tgt.scale : -120;
          RageFx.scythe(w, x, y - 30, -0.35, 2.2, f.facing); RageFx.scythe(w, x, y + 20, 0.3, 1.9, -f.facing);
          RageArts.hit(w, f, tgt, { dmg: 16, kb: 420, up: -300, kd: 1, spike: 1300, hs: 0.7, imp: 3 });
          RageArts.finish(w, x, y, A, { stamp: 'REQUIEM', ring: 260 });
          RageArts.sparks(w, x, y, A, 20, 800, 40);
        }
      },
      end(f, w) { for (const c of A.clones) c.fade = 1; RageArts.end(w, f); } }, w);
  },

  /* ---- Iwakudaki: Golden Earthbreaker ---- */
  goldenQuake(f, w) {
    const A = RageArts.begin(w, f, 'goldenQuake', { dur: 2.25, freeze: 0.6 }), tgt = A.tgt;
    for (let i = 0; i < 11; i++) A.rocks.push({ x: f.x + (i - 5) * 64 + rand(-20, 20), y: -2, vy: -rand(60, 150), vr: rand(-1.4, 1.4), rot: rand(0, TAU), r: rand(14, 30), t: 0, seed: i });
    f.startAbility({ dur: 2.25, uninterruptible: true, rate: 22, trail: true, el: 'earth',
      pose: (f, t) => t < 0.35 ? MOVES.m1.a : !f.abil || !f.abil.landT ? MOVES.m1.w : t < f.abil.landT + 0.3 ? MOVES.m1.s : t < f.abil.landT + 0.55 ? MOVES.m2.w : t < f.abil.landT + 0.8 ? MOVES.m2.s : MOVES.m1.s,
      update(f, w, t, dt) {
        const mul = weaponMul(f.weaponId(), f.wlvl).dmg;
        if (t < 0.6) {
          f.vx = damp(f.vx, 0, 12, dt);
          if (((t * 60) | 0) % 5 === 0) { w.fx.shake(0.1); AudioManager.play('rumble'); }
          if (!this.glint && t > 0.45) { this.glint = 1; w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#fff1bf'); }
          return;
        }
        const live = tgt && tgt.alive;
        if (!this.leap) { this.leap = 1; const dest = live ? tgt.x - f.facing * 90 * tgt.scale : f.x + f.facing * 200; f.vy = -900; f.grounded = false; f.vx = (dest - f.x) / 0.5; AudioManager.play('jump'); }
        if (t > 0.86 && !this.down) { this.down = 1; f.vy = 2100; }
        if (this.down && f.grounded && !this.landT) {
          this.landT = t; f.vx = 0;
          const x = f.x + f.facing * 80 * f.scale;
          this.x = x; this.waves = [t, t + 0.3, t + 0.6];
          for (const r of A.rocks) { r.fall = 1; r.vx = (r.x - x) * 1.5; r.vy = -rand(200, 500); }
          for (let i = 0; i < 12; i++) A.cracks.push({ x, a: (i - 5.5) * 0.28, len: rand(200, 460), t: 0, hot: 1 });
          WeaponSystem.spawn(w, 'bigshock', f, { dir: 1, x: x + 60 }); WeaponSystem.spawn(w, 'bigshock', f, { dir: -1, x: x - 60 });
          Combat.area(w, f, fbox(f, -120, -220, 360, 220), { dmg: 12 * mul, kb: 200, up: -520, hs: 0.6, kd: 1, imp: 2, hsnd: 'heavy', unb: 1, quiet: 1 });
          AudioManager.play('quake');
        }
        // three golden shockwaves race out from the hammer; the last stuns every grounded foe (Earthshatter's rule)
        if (this.waves) this.waves.forEach((at, i) => {
          if (this['w' + i] || t < at) return;
          this['w' + i] = 1;
          RageFx.quake(w, this.x, 1 + i * 0.35);
          w.fx.ring(this.x, -4, 260 + i * 140, A.art.col, 0.6, 6);
          if (i < 2) { w.fx.shake(0.55); for (const d of w.fighters) if (d.team !== f.team && d.alive && d.grounded) RageArts.hit(w, f, d, { dmg: 5, kb: 80, up: -260, hs: 0.45, imp: 2, hsnd: 'heavy' }); }
          else {
            for (const d of w.fighters) if (d.team !== f.team && d.alive && (d.grounded || d === tgt)) Combat.applyHit(w, f, d, { dmg: 12 * mul, kb: 120, up: -300, hs: 0.5, imp: 2, hsnd: 'heavy', unb: 1, stun: 1.4, quiet: 1 }, d.x, d.y - 60, Math.sign(d.x - f.x) || 1);
            RageArts.finish(w, live ? tgt.x : this.x, -80, A, { stamp: 'EARTHBREAKER', ring: 340, shake: 1 });   // after the blows: its impact frame is the last
            for (let k = 0; k < 40; k++) w.fx.part({ x: rand(w.bounds.l, w.bounds.r), y: 0, vx: rand(-60, 60), vy: rand(-760, -260), life: rand(0.5, 0.9), size: rand(3, 8), color: chance(0.3) ? '#ffb51f' : '#2a2018', type: 'drop', grav: 1800 });
          }
          AudioManager.play('slam', { pitch: 0.9 - i * 0.1 });
        });
      },
      end(f, w) { RageArts.end(w, f); } }, w);
  }
});

/* ======================================================================== */
/* Mizuchi's dragon: a head flying a scripted path, its body the head's trail */
/* ======================================================================== */
RageArts.dragonStep = function (w, A, dt) {
  const D = A.dragon, tgt = A.tgt && A.tgt.alive ? A.tgt : null;
  D.t += dt;
  if (tgt) { D.ax = tgt.x; D.ay = tgt.y - 110 * tgt.scale; } else if (D.ax == null) { D.ax = A.ax; D.ay = -110; }
  const t = D.t, R = 100 * D.s;
  let x, y, front = 1;
  if (t < 0.28) { const k = Ease.outCubic(t / 0.28); x = lerp(D.sx, D.ax + D.dir * 70, k); y = lerp(D.sy, D.ay - 50, k) - Math.sin(k * Math.PI) * 60; D.phase = 'launch'; }
  else if (t < 0.85) { const u = (t - 0.28) / 0.57; D.u = u; const a = u * TAU * 1.15; x = D.ax + Math.cos(a) * R * D.dir; y = D.ay - 30 - Math.sin(a) * R * 0.45 - u * 90; front = Math.sin(a) < 0.2 ? 1 : 0; D.phase = 'coil'; }
  else if (t < 1.08) { const k = Ease.inOut((t - 0.85) / 0.23); x = lerp(D.ax + Math.cos(TAU * 1.15) * R * D.dir, D.ax, k); y = lerp(D.ay - 120, -520, k); D.phase = 'rise'; }
  else if (t < 1.2) { const k = Ease.inCubic ? Ease.inCubic((t - 1.08) / 0.12) : ((t - 1.08) / 0.12) ** 3; x = D.ax; y = lerp(-520, 0, k); D.phase = 'dive'; }
  else { x = D.ax; y = 20; D.phase = 'crash'; D.gone = clamp((t - 1.2) / 0.45, 0, 1); }
  D.x = x; D.y = y;
  if (D.gone < 1) {
    D.trail.unshift({ x, y, front });
    if (D.trail.length > 54) D.trail.length = 54;
  } else D.trail.length = Math.max(0, D.trail.length - 3);
  // spray shed off the body
  if (D.gone < 1 && ((t * 60) | 0) % 2 === 0) w.fx.part({ x: x + rand(-14, 14), y: y + rand(-14, 14), vx: rand(-80, 80), vy: rand(-60, 60), life: rand(0.3, 0.6), size: rand(1.6, 3), color: chance(0.5) ? '#d4f1ff' : '#2f9dff', type: 'drop', grav: 900, drag: 0.6, sq: 0.8 });
};

/* ======================================================================== */
/* Drawing (Renderer.drawFight hooks)                                          */
/* ======================================================================== */
Object.assign(RageArts, {
  // screen space, over the sky: the art's arena (drawn under the floor and everything in the world)
  drawSky(ctx, s, toScreen, rt) {
    const A = s.rart; if (!A || A.env < 0.01) return;
    const k = A.env, art = A.art, f = A.owner;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 0.62 * k; ctx.fillStyle = art.deep; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    const p = toScreen(f.x, -200);
    switch (A.id) {
      case 'crimsonMoon': {
        // the blood moon rising behind Kage, banded in flat cel steps, flaring white at the finisher
        const r = 170, mx = clamp(p.x - f.facing * 140, 200, W - 200), my = lerp(H * 0.62, H * 0.3, Ease.outCubic(A.moon || 0));
        for (const [dr, al] of [[46, 0.1], [20, 0.18]]) { ctx.globalAlpha = k * al; ctx.fillStyle = '#ff2238'; ctx.beginPath(); ctx.arc(mx, my, r + dr, 0, TAU); ctx.fill(); }
        ctx.globalAlpha = k; ctx.fillStyle = A.flash > 0.05 ? '#ffe6e8' : '#c4182c'; ctx.beginPath(); ctx.arc(mx, my, r, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(80,0,12,0.45)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(mx + (_rh(i) - 0.5) * r * 1.2, my + (_rh(i + 9) - 0.5) * r * 1.2, r * (0.08 + _rh(i + 3) * 0.12), 0, TAU); ctx.fill(); }
        ctx.fillStyle = art.deep; ctx.globalAlpha = k * 0.85; ctx.beginPath(); ctx.arc(mx + r * 0.42, my - r * 0.18, r * 0.92, 0, TAU); ctx.fill();   // the crescent's shadow
        break;
      }
      case 'swallowStorm': {
        // storm light: the sky flickers as bolts strike far off, slanted wind streaks
        const fl = (Math.floor(rt * 14) % 7 === 0) ? 0.22 : 0;
        if (fl) { ctx.globalAlpha = fl * k; ctx.fillStyle = '#bfefff'; ctx.fillRect(0, 0, W, H); }
        ctx.globalAlpha = 0.35 * k; ctx.strokeStyle = '#7fdcff'; ctx.lineWidth = 1.5;
        for (let i = 0; i < 40; i++) { const x = (_rh(i) * W * 1.4 + rt * 1400) % (W * 1.4) - W * 0.2, y = _rh(i + 50) * H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 60, y + 20); ctx.stroke(); }
        break;
      }
      case 'silentMoon': {
        // a pale violet moon high and small, perfectly still
        ctx.globalAlpha = k * 0.9; ctx.fillStyle = '#e7dcff'; ctx.beginPath(); ctx.arc(W * 0.78, H * 0.22, 46, 0, TAU); ctx.fill();
        ctx.fillStyle = art.deep; ctx.beginPath(); ctx.arc(W * 0.78 + 18, H * 0.22 - 8, 42, 0, TAU); ctx.fill();
        break;
      }
      case 'hellSplitter': {
        // a hell sky: a burning horizon, ash drifting up
        for (let i = 0; i < 6; i++) { ctx.globalAlpha = k * 0.1; ctx.fillStyle = i % 2 ? '#ff3a1c' : '#ff7a2c'; ctx.fillRect(0, H * (0.42 + i * 0.07), W, H); }
        ctx.globalAlpha = 0.6 * k; ctx.fillStyle = '#ffb35a';
        for (let i = 0; i < 50; i++) { const x = _rh(i) * W, y = H - ((_rh(i + 30) * H + rt * (60 + _rh(i + 60) * 90)) % H); ctx.fillRect(x, y, 2, 2); }
        break;
      }
      case 'waterDragon': {
        // rain
        ctx.globalAlpha = 0.45 * k; ctx.strokeStyle = '#9fd4ff'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 90; i++) { const x = _rh(i) * W, y = (_rh(i + 70) * H + rt * 1300) % H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 26); ctx.stroke(); }
        break;
      }
      case 'reaperRequiem': {
        // eyes opening in the dark
        for (let i = 0; i < 9; i++) {
          const open = clamp((A.t - 0.05 - i * 0.05) / 0.2, 0, 1) * k; if (open <= 0) continue;
          const x = 60 + _rh(i) * (W - 120), y = 80 + _rh(i + 20) * H * 0.45, sz = 5 + _rh(i + 40) * 6;
          ctx.globalAlpha = open; ctx.fillStyle = '#c38bff';
          for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + d * sz * 1.7, y, sz, sz * 0.35 * open, d * 0.2, 0, TAU); ctx.fill(); }
        }
        break;
      }
      case 'goldenQuake': {
        // light rising off the ground in long gold rays
        ctx.globalAlpha = k * 0.22; ctx.fillStyle = '#ffb51f';
        for (let i = 0; i < 9; i++) { const x = _rh(i) * W, w2 = 20 + _rh(i + 5) * 50; ctx.beginPath(); ctx.moveTo(x - w2, H); ctx.lineTo(x + w2, H); ctx.lineTo(x + w2 * 0.2 + 40, 0); ctx.lineTo(x - w2 * 0.2 + 40, 0); ctx.fill(); }
        break;
      }
    }
    ctx.restore();
  },
  // world space, behind the fighters: floor cracks, the flood, rocks, the dragon's far coils, the shadow clones
  drawBehind(ctx, s, rt) {
    const A = s.rart; if (!A) return;
    const k = A.env;
    for (const c of A.cracks) {
      const life = clamp((A.t - (c.t0 == null ? (c.t0 = A.t) : c.t0)) / 0.25, 0, 1), fade = c.hot ? clamp(1.6 - (A.t - c.t0) * 0.8, 0, 1) : k;
      if (fade <= 0) continue;
      const x1 = c.x + Math.sin(c.a) * c.len * life, y1 = 6 + Math.cos(c.a) * 14 * life;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      ctx.strokeStyle = A.art.col; ctx.globalAlpha = 0.5 * fade; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(c.x, 2); for (let i = 1; i <= 5; i++) ctx.lineTo(lerp(c.x, x1, i / 5) + (i % 2 ? 6 : -6), lerp(2, y1, i / 5)); ctx.stroke();
      ctx.strokeStyle = A.art.hot; ctx.globalAlpha = 0.9 * fade; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }
    for (const r of A.rocks) this.drawRock(ctx, r, A);
    if (A.dragon) this.drawDragon(ctx, A, 0);
    this.drawClones(ctx, s, A);
    if (A.chains && A.tgt && A.tgt.alive) {
      const tx = A.tgt.x, ty = A.tgt.y - 110 * A.tgt.scale;
      ctx.save(); ctx.strokeStyle = '#3a2a4e'; ctx.lineWidth = 3; ctx.setLineDash([7, 4]);
      for (const src of [A.owner].concat(A.clones)) { if (!src.sk) continue; ctx.beginPath(); ctx.moveTo(src.sk.fha.x, src.sk.fha.y); ctx.quadraticCurveTo((src.sk.fha.x + tx) / 2, Math.max(src.sk.fha.y, ty) + 30, tx, ty); ctx.stroke(); }
      ctx.setLineDash([]); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(154,60,255,0.5)'; ctx.lineWidth = 1.2;
      for (const src of [A.owner].concat(A.clones)) { if (!src.sk) continue; ctx.beginPath(); ctx.moveTo(src.sk.fha.x, src.sk.fha.y); ctx.quadraticCurveTo((src.sk.fha.x + tx) / 2, Math.max(src.sk.fha.y, ty) + 30, tx, ty); ctx.stroke(); }
      ctx.restore();
    }
  },
  // world space, in front of the fighters: the flood's surface, the dragon's near coils and head, the marks
  drawFront(ctx, s, rt) {
    const A = s.rart;
    if (A && A.id === 'silentMoon' && A.env > 0.01) {
      // silence: the whole frame drained to violet monochrome (the cuts drawn after it keep their light)
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.85 * A.env; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.55 * A.env; ctx.fillStyle = '#8a5cff'; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    if (A && A.id === 'waterDragon' && A.env > 0.01) {
      // the flood: a shallow sheet of water over the floor, ripples where the fighters stand
      const k = A.env, l = s.bounds.l - 300, r = s.bounds.r + 300;
      ctx.save(); ctx.globalAlpha = 0.34 * k; ctx.fillStyle = '#1a6fd0'; ctx.fillRect(l, -3, r - l, 30);
      ctx.globalAlpha = 0.55 * k; ctx.fillStyle = '#9fd4ff'; ctx.fillRect(l, -4, r - l, 2.5);
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#7fc4ff'; ctx.lineWidth = 1.5;
      for (const f of s.fighters) { if (!f.visible) continue; for (let i = 0; i < 2; i++) { const ph = ((rt * 1.3 + i * 0.5) % 1); ctx.globalAlpha = 0.5 * k * (1 - ph); ctx.beginPath(); ctx.ellipse(f.x, 2, 30 + ph * 60, 4 + ph * 6, 0, 0, TAU); ctx.stroke(); } }
      ctx.restore();
    }
    if (A && A.dragon) this.drawDragon(ctx, A, 1);
    if (s.rartFx) for (const m of s.rartFx) this.drawMark(ctx, m);
  },
  // screen space, over everything but the letterbox: the art's grade, the darkness, frozen petals, the cut-in band
  drawScreen(ctx, s, toScreen, rt) {
    const A = s.rart; if (!A || A.env < 0.01) return;
    const k = A.env, art = A.art, f = A.owner;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (A.id === 'silentMoon') {
      // the petals hanging where they were (the grade itself is drawn in drawFront, under the cuts)
      for (const p of A.petals) { ctx.globalAlpha = 0.75 * k; ctx.fillStyle = '#d9c4ff'; ctx.beginPath(); ctx.ellipse(p.x, p.y + (A.t > 1.5 ? (A.t - 1.5) * 90 : 0), p.r, p.r * 0.45, p.a, 0, TAU); ctx.fill(); }
    }
    if (A.id === 'reaperRequiem') {
      // the dark closing in round Kage and the foe
      const a = toScreen(f.x, -110), b = A.tgt ? toScreen(A.tgt.x, -110) : a, cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      const rr = Math.max(220, Math.abs(a.x - b.x) * 0.7 + 180) * (1.6 - 0.6 * k);
      ctx.globalAlpha = 0.9 * k; ctx.fillStyle = '#05020a';
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.ellipse(cx, cy, rr, rr * 0.75, 0, 0, TAU, true); ctx.fill('evenodd');
      for (let i = 1; i <= 4; i++) { ctx.globalAlpha = 0.18 * k; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.ellipse(cx, cy, rr * (1 - i * 0.07), rr * 0.75 * (1 - i * 0.07), 0, 0, TAU, true); ctx.fill('evenodd'); }
    }
    if (A.id === 'hellSplitter' || A.id === 'goldenQuake' || A.id === 'crimsonMoon') {
      // a vignette in the art's colour
      for (let i = 0; i < 4; i++) { ctx.globalAlpha = 0.09 * k; ctx.strokeStyle = art.deep; ctx.lineWidth = 120 - i * 26; ctx.strokeRect(0, 0, W, H); }
    }
    // the finisher's flash, then speed lines through the anticipation
    if (A.flash > 0.01 && !SaveManager.data.settings.reduceFlash) { ctx.globalAlpha = A.flash * 0.16; ctx.fillStyle = art.hot; ctx.fillRect(0, 0, W, H); }
    if (A.t < A.freeze + 0.15) this.drawCutIn(ctx, A, rt);
    ctx.restore();
  },
  // the cut-in: a slanted band across the frame with the weapon sliding through it and the art's name
  drawCutIn(ctx, A, rt) {
    const t = A.t, inK = Ease.outCubic(clamp(t / 0.16, 0, 1)), outK = clamp((t - A.freeze + 0.05) / 0.18, 0, 1);
    const k = inK * (1 - outK); if (k <= 0) return;
    const art = A.art, cy = H * 0.36, hh = 64 * k, sk = 60;
    ctx.save();
    ctx.globalAlpha = 0.92; ctx.fillStyle = '#060404';
    ctx.beginPath(); ctx.moveTo(0, cy - hh + sk * 0.3); ctx.lineTo(W, cy - hh - sk * 0.3); ctx.lineTo(W, cy + hh - sk * 0.3); ctx.lineTo(0, cy + hh + sk * 0.3); ctx.closePath(); ctx.fill();
    ctx.clip();
    ctx.globalAlpha = 1; ctx.strokeStyle = art.col; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, cy - hh + sk * 0.3 + 3); ctx.lineTo(W, cy - hh - sk * 0.3 + 3); ctx.moveTo(0, cy + hh + sk * 0.3 - 3); ctx.lineTo(W, cy + hh - sk * 0.3 - 3); ctx.stroke();
    // speed streaks racing through the band
    ctx.globalAlpha = 0.5; ctx.strokeStyle = art.col; ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) { const y = cy + (_rh(i) - 0.5) * hh * 1.7, x = W - ((rt * 2600 + _rh(i + 3) * W) % (W + 300)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 140 + _rh(i + 8) * 160, y - 8); ctx.stroke(); }
    // the weapon, sweeping across
    const wid = A.wid, sh = twinShape(WEAPONS[wid], SHAPE[wid] || 'katana', 0), L = Math.min(560, (WEAPONS[wid].len || 80) * 3.2);
    ctx.globalAlpha = 1; ctx.save(); ctx.translate(lerp(W * 0.02, W * 0.12, t / A.freeze) + 40, cy + 8); ctx.rotate(-0.16); drawWeaponShape(ctx, sh, L, 'art', 2.6, C.ink); ctx.restore();
    // the name
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.font = `64px ${FB}`; ctx.fillStyle = art.col; ctx.fillText(art.name, W - 70 + (1 - inK) * 300, cy - 6);
    ctx.font = `600 15px ${FU}`; ctx.fillStyle = art.hot; ctx.fillText(`RAGE ART · ${WEAPONS[wid].name.toUpperCase()}`, W - 74 + (1 - inK) * 300, cy + 38);
    ctx.font = '46px "KageKanji","Yu Mincho",serif'; ctx.globalAlpha = 0.85; ctx.fillStyle = art.hot; ctx.textAlign = 'left'; ctx.fillText(art.kanji || '', W * 0.44, cy + 4);
    ctx.restore();
  },
  drawRock(ctx, r, A) {
    ctx.save(); ctx.translate(r.x, r.y - r.r); ctx.rotate(r.rot);
    ctx.fillStyle = '#3d3226'; ctx.beginPath();
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, rr = r.r * (0.7 + _rh(r.seed * 7 + i) * 0.45); i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = A.art.col; ctx.globalAlpha = 0.7 * A.env; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-r.r * 0.4, -r.r * 0.2); ctx.lineTo(r.r * 0.1, r.r * 0.1); ctx.lineTo(r.r * 0.35, -r.r * 0.3); ctx.stroke();
    ctx.restore();
  },
  // the shadow clones: Kage's silhouette in living shadow, a violet edge, rising out of the floor
  drawClones(ctx, s, A) {
    for (const c of A.clones) {
      if (!c.sk || c.rise <= 0) continue;
      const a = c.fade ? Math.max(0, 1 - (A.t - (c.fadeT == null ? (c.fadeT = A.t) : c.fadeT)) / 0.35) : 1;
      if (a <= 0) continue;
      ctx.save();
      ctx.beginPath(); ctx.rect(c.x - 300, -900, 600, 900 + 4); ctx.clip();            // the floor hides what has not risen yet
      ctx.translate(0, (1 - c.rise) * 230 * c.scale);
      ctx.globalAlpha = a * 0.9; for (const [ox, oy] of [[-3, 0], [3, 0], [0, -3]]) { ctx.translate(ox, oy); c.draw(ctx, { color: '#b46cff', shadow: false, noEyes: true }); ctx.translate(-ox, -oy); }
      ctx.globalAlpha = a; c.draw(ctx, { color: '#0c0614', shadow: false, noEyes: true });
      const hx = c.sk.head.x + c.facing * 4 * c.scale, hy = c.sk.head.y;
      ctx.fillStyle = '#e8c8ff'; for (const d of [0, 6]) { ctx.beginPath(); ctx.ellipse(hx + c.facing * d * c.scale, hy, 2.4 * c.scale, 1 * c.scale, 0, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
  },
  // the water dragon: its body is the head's trail, drawn as a tapering cel-shaded ribbon (layer 0: the coils behind
  // the foe, 1: the rest and the head)
  drawDragon(ctx, A, layer) {
    const D = A.dragon, T = D.trail, n = T.length; if (n < 3) return;
    const s = D.s, fade = 1 - D.gone;
    const width = (i) => (34 - 26 * Math.pow(i / (n - 1), 0.8)) * s;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = fade;
    const seg = (i, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(T[i].x, T[i].y); ctx.lineTo(T[i + 1].x, T[i + 1].y); ctx.stroke(); };
    for (let i = n - 2; i >= 0; i--) { if ((T[i].front ? 1 : 0) !== layer) continue; seg(i, width(i) + 5 * s, '#04213f'); }
    for (let i = n - 2; i >= 0; i--) { if ((T[i].front ? 1 : 0) !== layer) continue; seg(i, width(i), '#1f7fe0'); }
    // belly band, scales and the dorsal fins
    for (let i = n - 2; i >= 0; i--) {
      if ((T[i].front ? 1 : 0) !== layer) continue;
      const a = Math.atan2(T[i + 1].y - T[i].y, T[i + 1].x - T[i].x), nx = -Math.sin(a), ny = Math.cos(a), wv = width(i);
      ctx.strokeStyle = '#8fd0ff'; ctx.lineWidth = wv * 0.3; ctx.beginPath(); ctx.moveTo(T[i].x + nx * wv * 0.22, T[i].y + ny * wv * 0.22); ctx.lineTo(T[i + 1].x + nx * wv * 0.22, T[i + 1].y + ny * wv * 0.22); ctx.stroke();
      if (i % 3 === 0) { ctx.strokeStyle = '#0a3a6e'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.arc(T[i].x - nx * wv * 0.12, T[i].y - ny * wv * 0.12, wv * 0.22, a - 1.2, a + 1.2); ctx.stroke(); }
      if (i % 4 === 1 && i > 2) { ctx.fillStyle = '#d4f1ff'; ctx.beginPath(); ctx.moveTo(T[i].x - nx * wv * 0.45, T[i].y - ny * wv * 0.45); ctx.lineTo(T[i].x - nx * wv * 1.05 + Math.cos(a) * wv * 0.5, T[i].y - ny * wv * 1.05 + Math.sin(a) * wv * 0.5); ctx.lineTo(T[i + 1].x - nx * wv * 0.45, T[i + 1].y - ny * wv * 0.45); ctx.fill(); }
    }
    if (layer === 1 && D.gone < 1) {
      // the head, pointing along its flight
      const h = T[0], b = T[Math.min(3, n - 1)], a = Math.atan2(h.y - b.y, h.x - b.x), fl = Math.cos(a) < 0 ? -1 : 1;
      ctx.translate(h.x, h.y); ctx.rotate(a); ctx.scale(s, s * fl);
      ctx.fillStyle = '#04213f'; ctx.beginPath(); ctx.moveTo(48, 2); ctx.lineTo(20, -18); ctx.lineTo(-6, -22); ctx.lineTo(-26, -14); ctx.lineTo(-26, 16); ctx.lineTo(-4, 22); ctx.lineTo(30, 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2f9dff'; ctx.beginPath(); ctx.moveTo(44, 0); ctx.lineTo(18, -15); ctx.lineTo(-4, -18); ctx.lineTo(-22, -11); ctx.lineTo(-22, 2); ctx.lineTo(40, 2); ctx.closePath(); ctx.fill();   // upper jaw
      ctx.fillStyle = '#1a6fd0'; ctx.beginPath(); ctx.moveTo(36, 8); ctx.lineTo(-20, 6); ctx.lineTo(-20, 13); ctx.lineTo(0, 18); ctx.lineTo(28, 13); ctx.closePath(); ctx.fill();         // lower jaw, open
      ctx.fillStyle = '#e8f8ff'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(30 - i * 9, 2); ctx.lineTo(27 - i * 9, 7); ctx.lineTo(24 - i * 9, 2); ctx.fill(); }   // fangs
      ctx.fillStyle = '#d4f1ff'; ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(-46, -40); ctx.lineTo(-18, -14); ctx.fill(); ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(-56, -22); ctx.lineTo(-22, -6); ctx.fill();   // horns
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(6, -9, 5, 2.6, -0.2, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(7, -9, 1.6, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#bfe8ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(40, 4); ctx.quadraticCurveTo(10, 30, -40, 34); ctx.moveTo(38, -4); ctx.quadraticCurveTo(0, -36, -60, -30); ctx.stroke();   // whiskers
    }
    ctx.restore();
  },
  // the canvas marks: crescents, cuts, streaks, pillars and impacts (the sheets' fallbacks, and the lines both draw)
  drawMark(ctx, m) {
    const u = clamp(m.t / m.dur, 0, 1), a = 1 - u;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    switch (m.type) {
      case 'crescent': case 'scythe': {
        // a crescent: the outer arc sweeps open, the body thins from its tips
        const big = m.type === 'scythe', R = (big ? 120 : 100) * m.s, sw = Math.min(1, u * 4);
        ctx.translate(m.x, m.y); ctx.rotate(m.rot * m.dir); ctx.scale(m.dir, 1);
        const a0 = -1.35, a1 = a0 + 2.7 * sw;
        if (big) { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.6 * a; ctx.fillStyle = '#0a0412'; ctx.beginPath(); ctx.arc(-R * 0.1, 0, R * 1.04, a0, a1); ctx.arc(-R * 0.42, 0, R * 0.82, a1 - 0.1, a0 + 0.1, true); ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; }
        if (m.under) break;   // the baked sheet draws the light
        ctx.globalAlpha = 0.85 * a; ctx.fillStyle = m.col; ctx.beginPath(); ctx.arc(0, 0, R, a0, a1); ctx.arc(-R * 0.3, 0, R * 0.86, a1 - 0.12, a0 + 0.12, true); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = a; ctx.strokeStyle = m.hot; ctx.lineWidth = 3 * m.s; ctx.beginPath(); ctx.arc(0, 0, R, a0 + 0.15, a1 - 0.05); ctx.stroke();
        break;
      }
      case 'violet': {
        // a long thin lens of violet light with a white core
        const L = 170 * m.s * Math.min(1, u * 5), wv = 9 * m.s * a;
        ctx.translate(m.x, m.y); ctx.rotate(m.rot * m.dir);
        ctx.globalAlpha = 0.85 * a; ctx.fillStyle = m.col; ctx.beginPath(); ctx.moveTo(-L, 0); ctx.quadraticCurveTo(0, -wv, L, 0); ctx.quadraticCurveTo(0, wv, -L, 0); ctx.fill();
        ctx.fillStyle = m.hot; ctx.beginPath(); ctx.moveTo(-L * 0.8, 0); ctx.quadraticCurveTo(0, -wv * 0.3, L * 0.8, 0); ctx.quadraticCurveTo(0, wv * 0.3, -L * 0.8, 0); ctx.fill();
        break;
      }
      case 'streak': case 'line': {
        const x1 = m.x1, y1 = m.y1 == null ? m.y : m.y1;
        ctx.globalAlpha = a; ctx.strokeStyle = m.col; ctx.lineWidth = m.type === 'line' ? 6 * a + 1 : 8 * a; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.strokeStyle = m.hot; ctx.lineWidth = Math.max(1, 2 * a); ctx.stroke();
        break;
      }
      case 'pillar': {
        // a column of lava bursting out of the fissure
        const hgt = 260 * m.s * Math.sin(Math.min(1, u * 1.6) * Math.PI * 0.5) * (u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3), wv = 36 * m.s;
        ctx.globalAlpha = 0.85; ctx.fillStyle = m.col; ctx.beginPath(); ctx.moveTo(m.x - wv, 0); ctx.quadraticCurveTo(m.x - wv * 0.3, -hgt * 0.6, m.x, -hgt); ctx.quadraticCurveTo(m.x + wv * 0.3, -hgt * 0.6, m.x + wv, 0); ctx.fill();
        ctx.fillStyle = m.hot; ctx.beginPath(); ctx.moveTo(m.x - wv * 0.4, 0); ctx.quadraticCurveTo(m.x, -hgt * 0.5, m.x + wv * 0.4, 0); ctx.fill();
        break;
      }
      case 'hell': case 'tidal': case 'quake': {
        // a ground impact: a flattened shock ring racing out and a burst column
        const R = (m.type === 'quake' ? 300 : 220) * m.s * Ease.outCubic(u), hgt = (m.type === 'tidal' ? 300 : 200) * m.s * Math.sin(Math.min(1, u * 2) * Math.PI * 0.5) * a;
        ctx.globalAlpha = 0.8 * a; ctx.strokeStyle = m.col; ctx.lineWidth = 10 * a + 2; ctx.beginPath(); ctx.ellipse(m.x, 0, R, R * 0.12, 0, 0, TAU); ctx.stroke();
        ctx.strokeStyle = m.hot; ctx.lineWidth = 3 * a + 1; ctx.stroke();
        ctx.fillStyle = m.col; ctx.globalAlpha = 0.6 * a; ctx.beginPath(); ctx.moveTo(m.x - 60 * m.s, 0); ctx.quadraticCurveTo(m.x, -hgt * 1.4, m.x + 60 * m.s, 0); ctx.fill();
        break;
      }
    }
    ctx.restore();
  }
});
