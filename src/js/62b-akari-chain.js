/* KAGE — Akari's chain and her Petal Burst (her boss fight: BOSS_ABILITIES in 40-ai.js, numbers in AKARI_MOVES).

   The chain   the head of her sakura scythe flies off its staff on a chain (her boss sheet: Blade Launch, Chain Lunge,
               Wrap / Pull, Return & Spin). AkariChain.launch sends it from the end of her staff toward a point; each
               step it flies `speed` px/s until it meets something, reaches `reach` or hits the floor, then is reeled
               back (`back` px/s) spinning. The moves that throw it step it (so it lives and dies with the move) and
               decide what a hit does: Chain Reap cuts, Binding Chain BINDS.
   Bound       Kage caught by the Binding Chain: Fighter state 'bound' (20-fighter.js) — no movement, guard or attack;
               the chain is wrapped round him and pulled taut to her. Only his rage art breaks it (a full rage meter and
               the special: Fighter.updateBound), which calls the move's onBreak and leaves her reeling. While bound
               nothing else can touch him; the move that bound him decides what happens when the hold runs out.
   The petals  Petal Burst's blade petals (AkariChain.petal*): formed in a ring round her, each then swings out in its
               own wide loop round the whole arena, its path traced faintly on the air while they bloom; one cut each.
               A loop is an ellipse from her out past him and back, flattened along the floor where it would dip under
               it, so a low pass skims the ground (jump it) and the high pass goes over his head.
   Everything here only hurts her opponents (Combat.area skips her side) and is cleaned up when her move ends, she
   falls or the fight stops (AkariChain.tick from FightSession.stepHazards). Drawing: drawFloor (the bloom circle,
   under the fighters, from drawAkariHazards) and draw (chain, petals, the lotus, the bound prompt; after them). */

const AK_CHAIN_COL = { link: '#0b0509', glow: 'rgba(255,70,160,0.55)', hi: '#ff8cc6', hot: '#ffe3f0' };

const AkariChain = {
  /* ---- the chain ---- */
  // the end of her staff in the simulation (the drawing uses the rigged scythe's real head: f._akHeadW)
  origin(f) { return { x: f.x + f.facing * 70 * f.scale, y: f.y - 128 * f.scale }; },
  launch(w, f, o, tx, ty) {
    const s0 = this.origin(f);
    let a = Math.atan2(ty - s0.y, tx - s0.x);
    // aimed across the floor at him: never steeper than ~30 degrees, never behind her
    const fwd = f.facing > 0 ? 0 : Math.PI, da = Math.atan2(Math.sin(a - fwd), Math.cos(a - fwd));
    a = fwd + clamp(da, -0.52, 0.52);
    const c = { owner: f, abil: f.abil, x: s0.x, y: s0.y, vx: Math.cos(a) * o.speed, vy: Math.sin(a) * o.speed, speed: o.speed, reach: o.reach, back: o.back || o.speed,
      dist: 0, phase: 'out', t: 0, spin: 0, dir: Math.sign(Math.cos(a)) || f.facing, trail: [], kind: o.kind || 'reap', bound: null };
    (w.akChains || (w.akChains = [])).push(c);
    f.akChainOut = c;
    return c;
  },
  recall(c) { if (c.phase === 'out' || c.phase === 'bind' || c.phase === 'yank') c.phase = 'back'; },
  // one step of the chain; returns its phase ('out', 'back', 'bind', 'yank', 'done')
  step(w, c, dt) {
    c.t += dt;
    const o = this.origin(c.owner);
    if (c.phase === 'out') {
      c.x += c.vx * dt; c.y += c.vy * dt; c.dist += c.speed * dt;
      if (c.dist >= c.reach || c.y > -14 || c.x < w.bounds.l - 60 || c.x > w.bounds.r + 60) {
        if (c.y > -14) { c.y = -14; w.fx.sparks(c.x, -10, -c.dir, 8, AK_CHAIN_COL.hi); w.fx.dust(c.x, 0, 6); }
        this.recall(c);
      }
    } else if (c.phase === 'back') {
      const dx = o.x - c.x, dy = o.y - c.y, d = Math.hypot(dx, dy), st = c.back * dt;
      c.spin += dt * 24;
      if (d <= st + 6) { c.phase = 'done'; if (c.owner.akChainOut === c) c.owner.akChainOut = null; AudioManager.play('block', { pitch: 1.4 }); }
      else { c.x += dx / d * st; c.y += dy / d * st; }
    } else if (c.phase === 'bind' || c.phase === 'yank') {
      const pl = c.bound; if (pl) { c.x = pl.x; c.y = pl.y - 105 * pl.scale; }
    }
    if (c.phase !== 'done') { c.trail.push(c.x, c.y); if (c.trail.length > 16) c.trail.splice(0, 2); }
    return c.phase;
  },
  // what the flying head cuts: round the blade, a little ahead of the socket the chain holds
  box(c, r) { const s = c.owner.scale, x = c.x + c.dir * 24 * s, y = c.y + 16 * s; r = (r || 36) * s; return { x: x - r, y: y - r, w: r * 2, h: r * 2 }; },
  // the chain catches him: he is bound to her for `hold` seconds (only his rage art breaks it)
  bind(w, c, pl, hold) {
    c.phase = 'bind'; c.bound = pl; c.hold = hold; c.dir = Math.sign(pl.x - c.owner.x) || c.dir;
    pl.move = null; if (pl.abil) pl.endAbility(w);
    pl.setState('bound'); pl.boundBy = c.owner; pl.boundT = hold; pl.invuln = Math.max(pl.invuln, hold + 0.2); pl.vx = 0;
    pl.kageFlicker = 0;
    w.fx.shake(0.3); w.fx.stop(0.08); AudioManager.play('chain'); AudioManager.play('clang', { pitch: 0.7 });
    for (let i = 0; i < 14; i++) w.fx.part({ x: pl.x + rand(-24, 24), y: pl.y - rand(40, 170) * pl.scale, vx: rand(-200, 200), vy: rand(-200, 60), life: rand(0.3, 0.6), size: rand(1.6, 2.6), color: chance(0.5) ? AK_CHAIN_COL.hi : AK_CHAIN_COL.hot, type: 'spark', grav: 300, drag: 2, add: true });
  },
  // let him go (the hold ran out, the move ended, the chain broke)
  release(w, c) {
    const pl = c.bound; c.bound = null;
    if (pl && pl.state === 'bound' && pl.boundBy === c.owner) { pl.boundBy = null; pl.invuln = Math.min(pl.invuln, 0.25); pl.setState(pl.grounded ? 'idle' : 'air'); }
    else if (pl && pl.boundBy === c.owner) pl.boundBy = null;
  },
  // the chain breaks apart (his rage art): links scatter as sparks and petals
  shatter(w, c) {
    const o = this.origin(c.owner), n = 12;
    for (let i = 0; i <= n; i++) {
      const k = i / n, x = lerp(o.x, c.x, k), y = lerp(o.y, c.y, k);
      w.fx.part({ x, y, vx: rand(-260, 260), vy: rand(-320, 40), life: rand(0.4, 0.8), size: rand(1.8, 3), color: chance(0.5) ? AK_CHAIN_COL.hi : AK_CHAIN_COL.hot, type: 'spark', grav: 600, drag: 1.5, add: true });
    }
    akariBurst(c.owner, w, c.x, c.y, 14);
    w.fx.ring(c.x, c.y, 150, 'rgba(255,214,234,0.9)', 0.35, 5); w.fx.shake(0.4); AudioManager.play('guardbreak');
    this.release(w, c); c.phase = 'done'; if (c.owner.akChainOut === c) c.owner.akChainOut = null;
    w.akChains = (w.akChains || []).filter(x => x !== c);
  },
  // her move is over: its chain goes, and whoever it held is let go
  end(w, f) {
    for (const c of w.akChains || []) if (c.owner === f) this.release(w, c);
    if (w.akChains) w.akChains = w.akChains.filter(c => c.owner !== f);
    if (w.akPetals) w.akPetals = w.akPetals.filter(p => p.owner !== f);
    if (w.akBloom) w.akBloom = w.akBloom.filter(b => b.owner !== f);
    f.akChainOut = null;
  },
  // every step (FightSession.stepHazards): drop chains and petals whose move is gone (she fell, a new round)
  tick(w) {
    const gone = (x) => !x.owner || !x.owner.alive || x.owner.abil !== x.abil || w.phase !== 'fight';
    if (w.akChains && w.akChains.length) for (const c of w.akChains.slice()) if (gone(c)) { this.release(w, c); w.akChains.splice(w.akChains.indexOf(c), 1); if (c.owner && c.owner.akChainOut === c) c.owner.akChainOut = null; }
    if (w.akPetals && w.akPetals.length) w.akPetals = w.akPetals.filter(p => !gone(p));
    if (w.akBloom && w.akBloom.length) w.akBloom = w.akBloom.filter(b => !gone(b));
    if (w.akLotus && gone(w.akLotus)) w.akLotus = null;
    if (w.akLock > 0) w.akLock -= STEP;
  },

  /* ---- Petal Burst's petals ---- */
  // the ring of `n` petals round her, and each one's loop (decided now, aimed at where he stands)
  petalsForm(w, f, n) {
    const pl = w.player, dir = Math.sign(pl.x - f.x) || f.facing, gap = Math.abs(pl.x - f.x), arr = w.akPetals || (w.akPetals = []);
    const room = (dir > 0 ? w.bounds.r + 40 - f.x : f.x - w.bounds.l + 40) / 2;
    for (let i = 0; i < n; i++) {
      const rx = clamp(Math.max(240, gap / 2 + 90 + (i % 3) * 90), 200, Math.max(200, room));
      arr.push({ owner: f, abil: f.abil, i, n, state: 'bloom', t: 0, x: f.x, y: f.y - 115 * f.scale, px: f.x, py: f.y, vx: 0, vy: 0, rot: 0, hit: 0, trail: [],
        cx: f.x + dir * rx, rx, cy: -(140 + (i % 3) * 26), ry: 118 + (i % 4) * 34, th0: dir > 0 ? Math.PI : 0, sg: i % 2 ? 1 : -1, ph: (i / n) * TAU });
    }
    w.akBloom = (w.akBloom || []).concat([{ owner: f, abil: f.abil, x: f.x, t: 0 }]);
  },
  // a petal's place on its loop `k` seconds after it was let go (lap: seconds a loop)
  loopAt(p, k, lap, out) {
    const th = p.th0 + p.sg * (TAU / lap) * k;
    out.x = p.cx + p.rx * Math.cos(th); out.y = Math.min(p.cy + p.ry * Math.sin(th), -26);
    return out;
  },
  // one step of every petal of hers; `o` the move's numbers, `T` the move's clock, `T0` when the first one flies,
  // `home` true once they are called back; `to` (optional) where they converge instead of on her (the lotus)
  petalsStep(w, f, o, T, T0, dt, home, to) {
    const arr = w.akPetals; if (!arr) return 0;
    const cx = f.x, cy = f.y - 115 * f.scale, R = 96 * f.scale, tmp = this._tmp || (this._tmp = { x: 0, y: 0 });
    let live = 0;
    for (const p of arr) {
      if (p.owner !== f || p.state === 'gone') continue;
      live++;
      p.t += dt; p.px = p.x; p.py = p.y;
      const tL = T0 + p.i * o.gap;   // when this one is let go
      if (to) {
        // converging: drawn in round the lotus, tighter and faster
        if (p.state !== 'converge') { p.state = 'converge'; p.ct = 0; p.r0 = Math.hypot(p.x - to.x, p.y - to.y); p.a0 = Math.atan2(p.y - to.y, p.x - to.x); }
        p.ct += dt; const k = clamp(p.ct / 0.8, 0, 1), r = lerp(p.r0, 46 + (p.i % 3) * 14, k * k * (3 - 2 * k)), a = p.a0 + p.ct * (6 + 4 * k);
        p.x = to.x + Math.cos(a) * r; p.y = to.y + Math.sin(a) * r * 0.6;
      } else if (home && p.state !== 'bloom') {
        // called home: back into her hands
        if (p.state !== 'home') { p.state = 'home'; p.ht = 0; p.hx = p.x; p.hy = p.y; }
        p.ht += dt; const k = clamp(p.ht / 0.35, 0, 1), e = k * k;
        p.x = lerp(p.hx, cx, e); p.y = lerp(p.hy, cy, e);
        if (k >= 1) { p.state = 'gone'; live--; }
      } else if (T < tL) {
        // the bloom: a ring turning round her
        const a = p.ph + T * 2.6;
        p.x = cx + Math.cos(a) * R; p.y = cy + Math.sin(a) * R * 0.8;
      } else {
        // let go: blended off the ring onto its loop
        if (p.state === 'bloom') { p.state = 'fly'; p.fx = p.x; p.fy = p.y; AudioManager.play('swing', { pitch: 1.5 + (p.i % 3) * 0.12 }); }
        const k = T - tL, b = clamp(k / 0.14, 0, 1);
        this.loopAt(p, k, o.lap, tmp);
        p.x = lerp(p.fx, tmp.x, b); p.y = lerp(p.fy, tmp.y, b);
        // one cut each, wherever it meets him (a short shared beat between cuts so a pile-up cannot shred him)
        if (!p.hit && !(w.akLock > 0)) {
          const dirx = Math.sign(p.x - p.px) || 1;
          if (Combat.area(w, f, { x: p.x - 24, y: p.y - 22, w: 48, h: 44 }, { dmg: o.dmg * f.dmgMul, kb: 150, up: -170, hs: 0.18, imp: 1, hsnd: 'slash', proj: 1, dir: dirx })) {
            p.hit = 1; w.akLock = 0.28; w.fx.sparks(p.x, p.y, dirx, 8, AK_CHAIN_COL.hi);
          }
        }
      }
      p.vx = (p.x - p.px) / Math.max(dt, 1e-4); p.vy = (p.y - p.py) / Math.max(dt, 1e-4);
      if (Math.abs(p.vx) + Math.abs(p.vy) > 30) p.rot = Math.atan2(p.vy, p.vx);
      else p.rot += dt * 3;
      p.trail.push(p.x, p.y); if (p.trail.length > 20) p.trail.splice(0, 2);
    }
    return live;
  },
  petalsClear(w, f, burst) {
    if (!w.akPetals) return;
    for (const p of w.akPetals) if (p.owner === f && burst && p.state !== 'gone') akariBurst(f, w, p.x, p.y, 4);
    w.akPetals = w.akPetals.filter(p => p.owner !== f);
    if (w.akBloom) w.akBloom = w.akBloom.filter(b => b.owner !== f);
  },

  /* ---- drawing ---- */
  // a line of chain links from (x0, y0) to (x1, y1), sagging by `sag` at the middle
  _links(ctx, x0, y0, x1, y1, sag, s, T, hot) {
    const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.floor(d / (8 * s))), pts = [];
    for (let i = 0; i <= n; i++) { const k = i / n; pts.push([lerp(x0, x1, k), lerp(y0, y1, k) + Math.sin(k * Math.PI) * sag]); }
    this._linksAlong(ctx, pts, s, T, hot);
  },
  _linksAlong(ctx, pts, s, T, hot) {
    // the glow along the chain, then each link: a ring seen flat, then one seen edge-on, alternating
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = AK_CHAIN_COL.glow; ctx.lineWidth = (hot ? 7 : 5) * s;
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore();
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      ctx.save(); ctx.translate(mx, my); ctx.rotate(ang);
      if (i % 2) {
        ctx.strokeStyle = AK_CHAIN_COL.link; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.ellipse(0, 0, 5.4 * s, 3 * s, 0, 0, TAU); ctx.stroke();
        ctx.strokeStyle = (i + ((T * 12) | 0)) % 7 === 0 ? AK_CHAIN_COL.hot : AK_CHAIN_COL.hi; ctx.lineWidth = 1.2 * s; ctx.stroke();
      } else {
        ctx.strokeStyle = AK_CHAIN_COL.link; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(-5 * s, 0); ctx.lineTo(5 * s, 0); ctx.stroke();
        ctx.strokeStyle = AK_CHAIN_COL.hi; ctx.lineWidth = 1.1 * s; ctx.stroke();
      }
      ctx.restore();
    }
  },
  // the chain wrapped round a bound fighter: three tilted loops (back halves dimmer), pulsing
  _wraps(ctx, pl, T, k) {
    const s = pl.scale, H = 196 * s, cx = pl.x;
    for (const [h, rx, tilt] of [[0.42, 30, 0.22], [0.58, 34, -0.18], [0.74, 28, 0.26]]) {
      const cy = pl.y - H * h, ry = 9 * s, pts = [];
      for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU; pts.push([cx + Math.cos(a) * rx * s * k, cy + Math.sin(a) * ry + Math.cos(a) * tilt * rx * s]); }
      this._linksAlong(ctx, pts, s * 0.85, T, true);
    }
  },
  // a blade petal: a long sakura petal with a notched tail and a knife point, edge-lit, glowing
  _petal(ctx, x, y, rot, len, wid, col, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha;
    const g = ctx.createLinearGradient(-len * 0.5, 0, len * 0.55, 0);
    g.addColorStop(0, '#b8256d'); g.addColorStop(0.55, '#ff5fae'); g.addColorStop(1, '#fff0f6');
    ctx.beginPath(); ctx.moveTo(len * 0.58, 0);
    ctx.quadraticCurveTo(len * 0.1, -wid * 0.8, -len * 0.45, -wid * 0.42); ctx.lineTo(-len * 0.3, 0); ctx.lineTo(-len * 0.45, wid * 0.42);
    ctx.quadraticCurveTo(len * 0.1, wid * 0.8, len * 0.58, 0); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#2a0214'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,244,249,0.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(len * 0.55, 0); ctx.quadraticCurveTo(len * 0.1, -wid * 0.62, -len * 0.38, -wid * 0.34); ctx.stroke();
    ctx.restore();
  },
  // the lotus over a bound Kage (Convergence): three rings of great petals opening, `k` 0..1
  _lotus(ctx, x, y, k, T, s) {
    ctx.save(); ctx.translate(x, y);
    const R = 120 * s * (0.3 + 0.7 * k);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.6); g.addColorStop(0, `rgba(255,220,240,${0.55 * k})`); g.addColorStop(0.5, `rgba(255,80,165,${0.3 * k})`); g.addColorStop(1, 'rgba(255,80,165,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * 1.6, 0, TAU); ctx.fill(); ctx.restore();
    for (const [n, r, open, a0] of [[8, 1, 1, 0], [8, 0.78, 0.8, Math.PI / 8], [6, 0.5, 0.55, 0]]) {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i - (n - 1) / 2) * (Math.PI / (n - 1)) * open * 1.15 + a0 * 0 + Math.sin(T * 2 + i) * 0.02;
        this._petal(ctx, Math.cos(a) * R * r * 0.5, Math.sin(a) * R * r * 0.5 * 0.9, a, R * r, R * r * 0.42, [255, 90, 170], 0.95 * k);
      }
    }
    ctx.fillStyle = `rgba(255,244,249,${k})`; ctx.beginPath(); ctx.arc(0, -4 * s, 10 * s * k, 0, TAU); ctx.fill();
    ctx.restore();
  },
  // under the fighters: the bloom circle opening under her as Petal Burst forms
  drawFloor(ctx, s, T) {
    const B = s.akBloom; if (!B || !B.length) return;
    ctx.save();
    for (const b of B) {
      const f = b.owner, k = clamp(b.t / 0.5, 0, 1), R = 170 * f.scale * (0.4 + 0.6 * k), pulse = 0.75 + 0.25 * Math.sin(T * 9);
      ctx.save(); ctx.translate(f.x, -2); ctx.scale(1, 0.24);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R); g.addColorStop(0, `rgba(255,80,165,${0.25 * k})`); g.addColorStop(0.85, `rgba(255,80,165,${0.4 * k * pulse})`); g.addColorStop(1, 'rgba(255,80,165,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(255,214,234,${0.85 * k})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R * 0.72, 0, TAU); ctx.stroke();
      // the petal marks between the rings, turning
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + T * 0.8; drawSakura(ctx, Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86, 12 * f.scale, a, `rgba(255,140,200,${0.9 * k})`, null, -1); }
      ctx.restore();
      b.t += 1 / 60;
    }
    ctx.restore();
  },
  // after the fighters: chains, petals (with each one's path traced while they bloom), the lotus, the bound prompt
  draw(ctx, s, T) {
    const CH = s.akChains, Pt = s.akPetals, Lo = s.akLotus;
    if (!(CH && CH.length) && !(Pt && Pt.length) && !Lo) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // the petals' paths, faint, while they are still forming (the tell: where each will swing)
    if (Pt && Pt.length) {
      const tmp = { x: 0, y: 0 };
      for (const p of Pt) {
        if (p.state !== 'bloom' || !p.owner.abil) continue;
        const o = Object.assign({}, AKARI_MOVES.petalBurst), a = clamp(p.t / 0.5, 0, 1) * 0.32;
        ctx.strokeStyle = `rgba(255,140,200,${a})`; ctx.lineWidth = 1.6; ctx.setLineDash([6, 9]); ctx.beginPath();
        for (let i = 0; i <= 48; i++) { this.loopAt(p, (i / 48) * o.lap, o.lap, tmp); i ? ctx.lineTo(tmp.x, tmp.y) : ctx.moveTo(tmp.x, tmp.y); }
        ctx.stroke(); ctx.setLineDash([]);
      }
      // the petals: a tapering glowing trail, then the blade petal itself (dimmed once it has cut)
      for (const p of Pt) {
        if (p.state === 'gone') continue;
        const tr = p.trail, sc = p.owner.scale, al = p.hit ? 0.55 : 1;
        if (tr.length > 4) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (let i = 2; i < tr.length; i += 2) {
            const k = i / tr.length; ctx.strokeStyle = `rgba(255,${90 + 120 * k | 0},${170 + 60 * k | 0},${0.5 * k * al})`; ctx.lineWidth = 9 * k * sc;
            ctx.beginPath(); ctx.moveTo(tr[i - 2], tr[i - 1]); ctx.lineTo(tr[i], tr[i + 1]); ctx.stroke();
          }
          ctx.restore();
        }
        this._petal(ctx, p.x, p.y, p.rot, 38 * sc, 17 * sc, [255, 90, 170], al);
      }
    }
    // the chains: from the rigged scythe's staff end (or her hand) to the head, then the head, spinning home
    if (CH) for (const c of CH) {
      const f = c.owner, H = f._akHeadW && Math.abs(f._akHeadW.t - f.time) < 0.1 ? f._akHeadW : this.origin(f), sc = f.scale;
      const taut = c.phase === 'bind' || c.phase === 'yank' || c.phase === 'out';
      this._links(ctx, H.x, H.y, c.x, c.y, taut ? (c.phase === 'out' ? 6 : 2) * sc : 26 * sc * Math.min(1, Math.hypot(c.x - H.x, c.y - H.y) / 300), sc, T, c.phase === 'bind');
      if (c.bound) this._wraps(ctx, c.bound, T, 1 + Math.sin(T * 10) * 0.04);
      // the flying head: its trail, then the blade, edge first along the flight (spinning on the way home)
      if (c.phase === 'out' || c.phase === 'back') {
        const tr = c.trail;
        if (tr.length > 4) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,90,170,0.45)'; ctx.lineWidth = 16 * sc; ctx.beginPath(); for (let i = 0; i < tr.length; i += 2) i ? ctx.lineTo(tr[i], tr[i + 1]) : ctx.moveTo(tr[i], tr[i + 1]); ctx.stroke(); ctx.restore(); }
        const L = f.weaponLen ? f.weaponLen() : 70 * sc, rot = Math.atan2(c.vy, c.vx) + (c.phase === 'back' ? c.spin : 0);
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(rot); if (c.dir < 0) ctx.scale(1, -1);   // the chain holds the socket; the blade runs on ahead and hooks down
        if (!AkariArt.drawHead(ctx, f)) drawAkariScytheHead(ctx, L, sc);   // the art's head (bosses/akari/art.js)
        ctx.restore();
      }
    }
    // the lotus over him, and its pillar of light when it bursts
    if (Lo) {
      const k = clamp(Lo.t / 0.8, 0, 1);
      this._lotus(ctx, Lo.x, Lo.y, k, T, Lo.s);
      if (Lo.beam > 0) {
        const b = Lo.beam, g = ctx.createLinearGradient(Lo.x - 70, 0, Lo.x + 70, 0);
        g.addColorStop(0, 'rgba(255,80,165,0)'); g.addColorStop(0.5, `rgba(255,236,246,${0.9 * b})`); g.addColorStop(1, 'rgba(255,80,165,0)');
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(Lo.x - 70, Lo.y, 140, -Lo.y + 4); ctx.restore();
      }
    }
    // the prompt over a bound fighter
    if (CH) for (const c of CH) {
      const pl = c.bound; if (!pl || pl.state !== 'bound') continue;
      const ready = pl.rage >= 100, y = pl.y - 196 * pl.scale - 46, pulse = 0.65 + 0.35 * Math.sin(T * (ready ? 12 : 6));
      ctx.save(); ctx.textAlign = 'center'; ctx.font = '700 17px sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      const txt = ready ? 'RAGE ART — BREAK THE CHAIN!' : 'BOUND — NO RAGE TO BREAK FREE';
      ctx.globalAlpha = pulse; ctx.strokeText(txt, pl.x, y); ctx.fillStyle = ready ? C_GOLD_SAFE() : '#ff7ab8'; ctx.fillText(txt, pl.x, y);
      // the hold running out: a shrinking bar
      const k = clamp((pl.boundT || 0) / (c.hold || 2.4), 0, 1);
      ctx.globalAlpha = 0.9; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(pl.x - 60, y + 8, 120, 6); ctx.fillStyle = ready ? C_GOLD_SAFE() : '#ff3d9a'; ctx.fillRect(pl.x - 60, y + 8, 120 * k, 6);
      ctx.restore();
    }
    ctx.restore();
  }
};
function C_GOLD_SAFE() { return (typeof C !== 'undefined' && C.gold) || '#e8c25c'; }
