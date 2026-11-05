/* KAGE — elemental sword VFX. Smears are built from the real blade history (hand position + blade angle per tick),
   interpolated along the arc so every trail follows the sword frame by frame. All effects live on pooled arrays,
   advance with simulation time (so hit-stop freezes them and slow motion slows them) and never touch hit detection. */

const ELEMENTS = {
  // rgb of the smear body, crisp leading edge, glow, alpha and render mode
  ink:       { smear: [236, 229, 211], edge: 'rgba(255,255,255,0.95)', alpha: 0.5 },
  shade:     { smear: [205, 200, 190], edge: '#ffffff', alpha: 0.72 },
  wind:      { smear: [222, 236, 230], edge: 'rgba(255,255,255,0.85)', alpha: 0.34, streaks: 1 },
  moon:      { smear: [150, 122, 255], alt: [255, 72, 98], edge: 'rgba(246,238,255,1)', glow: [150, 122, 255], alpha: 0.5, layers: 1 },
  blood:     { smear: [200, 28, 52], alt: [150, 122, 255], edge: 'rgba(255,214,220,1)', glow: [220, 40, 60], alpha: 0.52, layers: 1 },
  water:     { smear: [64, 148, 255], alt: [170, 225, 255], edge: 'rgba(236,250,255,1)', glow: [80, 170, 255], alpha: 0.55, water: 1 },
  flame:     { smear: [255, 104, 34], alt: [255, 214, 120], edge: 'rgba(255,244,200,1)', glow: [255, 110, 40], alpha: 0.6, add: 1, fire: 1 },
  lightning: { smear: [120, 205, 255], edge: 'rgba(240,252,255,1)', glow: [120, 200, 255], alpha: 0.36, add: 1, bolts: 1 },
  // Raikon's red lightning (Raikō no Tachi): a red slash with a white core and a jagged bolt along its edge
  redline:   { smear: [255, 58, 46], alt: [120, 10, 10], edge: 'rgba(255,240,236,1)', glow: [255, 60, 40], alpha: 0.55, bolts: 1, boltColor: '#ffe9e4' },
  earth:     { smear: [210, 168, 112], edge: 'rgba(255,232,190,0.9)', glow: [255, 150, 70], alpha: 0.48 },
  // Akari's twin blades (Kagehira & Yurei): a NARROW violet slash with a thin white core, shedding a few flat petals
  petal:     { smear: [155, 107, 214], edge: 'rgba(246,238,255,1)', glow: [155, 107, 214], alpha: 0.55, narrow: 0.32 },
  // Shinsen and the Tachibana father style (Takashi): a broad GOLD slash with a pale-gold outer band and a white core
  gold:      { smear: [232, 186, 84], alt: [255, 226, 150], edge: 'rgba(255,250,232,1)', glow: [240, 196, 90], alpha: 0.56, layers: 1 }
};
const _sp = [];
function smearSamples(arr) {
  let n = 0;
  for (let i = 1; i < arr.length; i++) {
    const A = arr[i - 1], B = arr[i];
    let da = B.a - A.a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    const steps = Math.max(1, Math.min(9, Math.ceil(Math.abs(da) / 0.085)));
    for (let s = i === 1 ? 0 : 1; s <= steps; s++) {
      const k = s / steps, a = A.a + da * k, L = lerp(A.L, B.L, k), b0 = lerp(A.b0, B.b0, k);
      const hx = lerp(A.hx, B.hx, k), hy = lerp(A.hy, B.hy, k), ca = Math.cos(a), sa = Math.sin(a);
      const p = _sp[n] || (_sp[n] = {}); n++;
      p.hx = hx; p.hy = hy; p.ca = ca; p.sa = sa; p.L = L; p.age = lerp(A.t, B.t, k);
      p.bx = hx + ca * L * b0; p.by = hy + sa * L * b0; p.tx = hx + ca * L; p.ty = hy + sa * L;
    }
  }
  return n;
}
const VFX = {
  // flat anime slash: a solid crescent swept by the blade, thinning toward its tail, with a white core along the edge
  drawSmear(ctx, f, arr, elId, time) {
    if (arr.length < 2) return;
    const el = ELEMENTS[elId] || ELEMENTS.ink, n = smearSamples(arr);
    if (n < 2) return;
    const newest = _sp[n - 1], fade = Math.max(0, 1 - newest.age / SMEAR_LIFE);
    if (fade <= 0.02) return;
    let i0 = 0; while (i0 < n - 2 && _sp[i0].age > SMEAR_LIFE * 0.9) i0++;
    const span = Math.max(1, n - 1 - i0);
    const band = (outer, innerK, col) => {
      ctx.fillStyle = col; ctx.beginPath();
      for (let i = i0; i < n; i++) { const p = _sp[i], r = p.L * outer; i === i0 ? ctx.moveTo(p.hx + p.ca * r, p.hy + p.sa * r) : ctx.lineTo(p.hx + p.ca * r, p.hy + p.sa * r); }
      for (let i = n - 1; i >= i0; i--) {
        const p = _sp[i], k = (i - i0) / span, inner = p.L * (outer - innerK * k * k * (1 - (p.L * 0.1) / p.L));
        ctx.lineTo(p.hx + p.ca * inner, p.hy + p.sa * inner);
      }
      ctx.closePath(); ctx.fill();
    };
    const c = el.smear, col = `rgb(${c[0]},${c[1]},${c[2]})`;
    ctx.save(); ctx.globalAlpha = Math.min(1, fade * 1.3);
    if (el.layers) band(1.14, 0.22, `rgb(${el.alt[0]},${el.alt[1]},${el.alt[2]})`);
    const nk = el.narrow || 1;   // narrow slashes (petal) keep only a thin band at the blade's edge
    band(1.0, 0.85 * nk, col);
    band(1.0, 0.3 * nk, el.dark ? '#f1ebe0' : '#ffffff');
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (el.water) { // flat white wave lines inside the slash
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      ctx.beginPath(); for (let i = i0; i < n; i++) { const p = _sp[i], r = p.L * (0.6 + 0.04 * Math.sin(i * 0.9 + time * 12)); i === i0 ? ctx.moveTo(p.hx + p.ca * r, p.hy + p.sa * r) : ctx.lineTo(p.hx + p.ca * r, p.hy + p.sa * r); } ctx.stroke();
    }
    if (el.fire) { // flat flame tongues licking off the edge
      for (let i = i0 + 1; i < n; i += 2) {
        const p = _sp[i], k = (i - i0) / span, fl = (9 + 7 * Math.sin(i * 1.9 + time * 30)) * k * f.scale, x = p.tx, y = p.ty;
        ctx.fillStyle = i % 4 ? '#ff7a2c' : '#ffd36a';
        ctx.beginPath(); ctx.moveTo(x - p.sa * fl * 0.5, y + p.ca * fl * 0.5); ctx.lineTo(x - fl * 0.3, y - fl * 1.8); ctx.lineTo(x + p.sa * fl * 0.5, y - p.ca * fl * 0.5); ctx.closePath(); ctx.fill();
      }
    }
    if (el.bolts) { // flat zig-zag bolt along the edge
      ctx.strokeStyle = el.boltColor || '#ffffff'; ctx.lineWidth = 2.2;
      ctx.beginPath(); for (let i = i0; i < n; i++) { const p = _sp[i], j = ((i * 7919) % 13 - 6) * f.scale * (1 + ((time * 20) | 0) % 2), r = p.L * 1.04; const x = p.hx + p.ca * r - p.sa * j, y = p.hy + p.sa * r + p.ca * j; i === i0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    }
    if (el.streaks) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; for (const fr of [0.45, 0.7]) { ctx.beginPath(); for (let i = i0; i < n; i++) { const p = _sp[i], r = p.L * fr; i === i0 ? ctx.moveTo(p.hx + p.ca * r, p.hy + p.sa * r) : ctx.lineTo(p.hx + p.ca * r, p.hy + p.sa * r); } ctx.stroke(); } }
    ctx.restore();
  },
  // particles shed from the blade tip while it is cutting
  emit(f, fx) {
    const arr = f.trail; if (arr.length < 2 || arr[arr.length - 1].t > 0.001) return;
    const m = f.move; if (!(f.state === 'move' && f.mphase === 1) && !(f.state === 'ability' && f.abil && f.abil.trail)) return;
    const el = (f.state === 'ability' && f.abil && f.abil.el) || f.elementOf(m); if (!el || el === 'shade' || el === 'ink') return;
    const A = arr[arr.length - 2], B = arr[arr.length - 1];
    const tx = B.hx + Math.cos(B.a) * B.L, ty = B.hy + Math.sin(B.a) * B.L;
    const vx = (tx - (A.hx + Math.cos(A.a) * A.L)) * 30, vy = (ty - (A.hy + Math.sin(A.a) * A.L)) * 30;
    if (el === 'water') for (let i = 0; i < 2; i++) fx.part({ x: tx, y: ty, vx: vx * rand(0.2, 0.5) + rand(-60, 60), vy: vy * rand(0.2, 0.5) - rand(40, 160), life: rand(0.4, 0.7), size: rand(1.6, 3.2), color: i ? '#bfe6ff' : '#4f9dff', type: 'drop', grav: 1300, drag: 0.6, sq: 0.8 });
    else if (el === 'flame') { fx.part({ x: tx, y: ty, vx: rand(-40, 40), vy: rand(-220, -80), life: rand(0.35, 0.7), size: rand(1.4, 2.6), color: '#ffb35a', type: 'spark', grav: -140, drag: 1.2, add: true }); fx.part({ x: tx, y: ty, vx: rand(-30, 30), vy: rand(-120, -40), life: 0.3, size: rand(6, 10), color: 'rgba(255,120,40,0.5)', type: 'flame', grav: -200, drag: 2, add: true, grow: -10 }); }
    else if (el === 'moon' || el === 'blood') fx.part({ x: tx + rand(-6, 6), y: ty + rand(-6, 6), vx: vx * 0.1, vy: vy * 0.1, life: rand(0.3, 0.55), size: rand(2.5, 4.5), color: el === 'moon' ? (chance(0.5) ? '#d9ccff' : '#ff6a82') : (chance(0.6) ? '#ff5470' : '#cdbfff'), type: 'star', grav: 0, drag: 3, add: true });
    else if (el === 'gold') fx.part({ x: tx + rand(-5, 5), y: ty + rand(-5, 5), vx: vx * 0.1 + rand(-30, 30), vy: vy * 0.1 - rand(10, 40), life: rand(0.3, 0.55), size: rand(1.6, 3), color: chance(0.6) ? '#ffd27a' : '#fff4d6', type: 'spark', grav: 120, drag: 3, add: true });
    else if (el === 'petal') { if (chance(0.5)) fx.part({ x: tx + rand(-5, 5), y: ty + rand(-5, 5), vx: vx * 0.08 + rand(-40, 40), vy: vy * 0.08 - rand(10, 50), life: rand(0.35, 0.6), size: rand(2.6, 4.2), color: chance(0.6) ? '#b48ae6' : '#ece2ff', type: 'ash', grav: 60, drag: 2.4, rot: rand(0, TAU), vr: rand(-10, 10) }); }
    else if (el === 'redline') fx.part({ x: tx, y: ty, vx: rand(-220, 220), vy: rand(-220, 120), life: rand(0.08, 0.18), size: rand(1.2, 2.4), color: chance(0.6) ? '#ff5a46' : '#ffffff', type: 'spark', grav: 0, drag: 4, add: true });
    else if (el === 'lightning') fx.part({ x: tx, y: ty, vx: rand(-200, 200), vy: rand(-200, 200), life: rand(0.08, 0.16), size: rand(1, 2), color: '#cfeeff', type: 'spark', grav: 0, drag: 4, add: true });
    else if (el === 'earth') { if (chance(0.5)) fx.part({ x: tx, y: ty, vx: vx * 0.15 + rand(-60, 60), vy: rand(-200, -60), life: rand(0.4, 0.7), size: rand(2, 4), color: '#2a2018', type: 'drop', grav: 1600, sq: 0.8 }); fx.part({ x: tx, y: ty, vx: rand(-30, 30), vy: rand(-90, -30), life: 0.4, size: rand(1.4, 2.4), color: '#ff9a50', type: 'spark', grav: -60, add: true }); }
    else if (el === 'wind' && chance(0.4)) fx.part({ x: tx, y: ty, vx: vx * 0.25, vy: vy * 0.25, life: 0.2, size: 1.2, color: 'rgba(255,255,255,0.8)', type: 'spark', grav: 0, drag: 3, add: true });
  }
};

/* ---- Effects extensions: elemental impacts, rings, finisher slash, clash flare, heat haze ---- */
Object.assign(Effects.prototype, {
  vfx() {
    return this._v || (this._v = { puffs: [], marks: [], crosses: [], zaps: [], glints: [], fire: [], ripples: [], bolts: [], cres: [], streaks: [], shards: [], rings: [], flares: [], rise: [], trail: [], lburst: [], finisher: null, tint: null });
  },
  elemImpact(el, x, y, dir, tier, crit) {
    const V = this.vfx(), big = crit ? 1.4 : 1, t = clamp(tier, 0, 3);
    switch (el) {
      case 'flame': {
        V.fire.push({ x, y, t: 0, dur: (0.32 + t * 0.07) * big, r: (36 + t * 22) * big });
        for (let i = 0; i < 10 + t * 5; i++) { const a = rand(0, TAU), v = rand(120, 420) * big; this.part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: rand(0.4, 0.9), size: rand(1.4, 3), color: chance(0.5) ? '#ffcf6a' : '#ff7a2c', type: 'spark', grav: -80, drag: 1.6, add: true }); }
        for (let i = 0; i < 4 + t; i++) this.part({ x: x + rand(-20, 20), y: y + rand(-20, 10), vx: rand(-40, 40), vy: rand(-90, -30), life: rand(0.7, 1.2), size: rand(10, 18), color: 'rgba(30,14,10,0.35)', type: 'puff', grav: -30, drag: 1, grow: 30 });
        break;
      }
      case 'water': {
        V.ripples.push({ x, y, t: 0, dur: 0.5, r: 50 + t * 20, c: 'rgba(170,225,255,' }, { x, y, t: -0.08, dur: 0.6, r: 80 + t * 26, c: 'rgba(80,160,255,' });
        for (let i = 0; i < 14 + t * 6; i++) { const a = -Math.PI / 2 + rand(-1.2, 1.2) + (dir > 0 ? 0.3 : -0.3); const v = rand(200, 520) * big; this.part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.5, 0.9), size: rand(1.8, 4), color: chance(0.4) ? '#e8f6ff' : '#5aa6ff', type: 'drop', grav: 1400, drag: 0.5, sq: 0.8 }); }
        for (let i = 0; i < 5; i++) this.part({ x: x + rand(-14, 14), y: y + rand(-14, 14), vx: rand(-60, 60), vy: rand(-60, 20), life: 0.45, size: rand(5, 9), color: 'rgba(230,246,255,0.55)', type: 'puff', grav: 0, drag: 2, grow: 20 });
        break;
      }
      case 'moon': case 'blood': {
        const a0 = dir > 0 ? rand(-0.5, 0.1) : Math.PI + rand(-0.1, 0.5);
        const c1 = el === 'moon' ? [150, 122, 255] : [220, 36, 58], c2 = el === 'moon' ? [255, 72, 98] : [150, 122, 255];
        V.cres.push({ x, y, a: a0, s: (58 + t * 18) * big, t: 0, dur: 0.38, c: c1 }, { x, y, a: a0 + 1.8, s: (48 + t * 14) * big, t: 0.03, dur: 0.36, c: c2 });
        if (t >= 2) V.rings.push({ x, y, r: 70 + t * 20, t: 0, dur: 0.45, c: c1, flat: 0.5 });
        for (let i = 0; i < 8 + t * 4; i++) { const a = rand(0, TAU), v = rand(80, 300); this.part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.3, 0.6), size: rand(2.5, 5), color: chance(0.5) ? '#e2d8ff' : '#ff6a82', type: 'star', grav: 0, drag: 3, add: true }); }
        break;
      }
      case 'lightning': {
        V.bolts.push({ x, y, t: 0, dur: 0.18 + t * 0.03, n: 4 + t * 2, len: (60 + t * 34) * big, seed: Math.random() * 99 });
        this.sparks(x, y, dir, 8 + t * 4, '#d4f2ff', 1.4);
        break;
      }
      case 'redline': {
        // red lightning forks thrown off the cut, with a red slash streak through the target
        for (let i = 0; i < 3 + t; i++) { const a = (dir > 0 ? 0 : Math.PI) + rand(-1.1, 1.1), L = (50 + t * 30) * big; this.lightning(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, { w: 1.6 + t * 0.3, branches: 1, dur: 0.12 + t * 0.02 }); }
        V.streaks.push({ x, y, a: dir > 0 ? rand(-0.6, -0.2) : Math.PI + rand(0.2, 0.6), len: 100 + t * 40, t: 0, dur: 0.3 });
        this.sparks(x, y, dir, 6 + t * 4, '#ffb0a4', 1.3);
        break;
      }
      case 'gold': {
        // two gold crescents through the target, a flat gold ring on heavy blows and a spray of gold sparks
        const a0 = dir > 0 ? rand(-0.5, 0.1) : Math.PI + rand(-0.1, 0.5);
        V.cres.push({ x, y, a: a0, s: (60 + t * 20) * big, t: 0, dur: 0.38, c: [232, 186, 84] }, { x, y, a: a0 + 1.8, s: (46 + t * 14) * big, t: 0.03, dur: 0.34, c: [255, 240, 200] });
        if (t >= 2) V.rings.push({ x, y, r: 74 + t * 22, t: 0, dur: 0.45, c: [232, 186, 84], flat: 0.45 });
        this.sparks(x, y, dir, 8 + t * 4, '#ffd98a', 1.3);
        break;
      }
      case 'petal': {
        // a thin violet cut through the target and a few flat petals; deliberately small (Akari's style is precise)
        const a = dir > 0 ? rand(-0.7, -0.3) : Math.PI + rand(0.3, 0.7);
        V.crosses.push({ x, y, a, len: 70 + t * 22, t: 0, dur: 0.26, n: 1, dir });
        for (let i = 0; i < 4 + t * 2; i++) { const g = rand(0, TAU), v = rand(60, 220); this.part({ x, y, vx: Math.cos(g) * v, vy: Math.sin(g) * v - 40, life: rand(0.35, 0.6), size: rand(2.6, 4.4), color: chance(0.6) ? '#b48ae6' : '#ece2ff', type: 'ash', grav: 80, drag: 2.4, rot: rand(0, TAU), vr: rand(-10, 10) }); }
        break;
      }
      case 'wind': {
        V.rings.push({ x, y, r: 46 + t * 18, t: 0, dur: 0.28, c: [236, 244, 240], flat: 0.35 }, { x, y, r: 70 + t * 24, t: 0.04, dur: 0.32, c: [236, 244, 240], flat: 0.35 });
        break;
      }
      case 'earth': {
        this.groundShards(x, 6 + t * 3, 1 + t * 0.25);
        this.dust(x, 0, 8 + t * 4);
        break;
      }
      default: {
        // ink / shade: a red cut streak through the target, like a blade passing clean through
        V.streaks.push({ x, y, a: dir > 0 ? rand(-0.6, -0.2) : Math.PI + rand(0.2, 0.6), len: 110 + t * 40, t: 0, dur: 0.3 });
      }
    }
  },
  elemRing(el, x, y, r) {
    const E = ELEMENTS[el || 'ink'] || ELEMENTS.ink;
    this.vfx().rings.push({ x, y, r, t: 0, dur: 0.42, c: E.smear, flat: 0.3, el });
  },
  // a crown of jagged ground shards erupting from the floor (heavy blows, slams)
  groundShards(x, n, k) {
    const V = this.vfx();
    for (let i = 0; i < n; i++) V.shards.push({ x: x + (i - n / 2) * rand(12, 18) * k + rand(-5, 5), w: rand(8, 14) * k, h: rand(22, 48) * k * (1 - Math.abs(i - n / 2) / n), lean: rand(-0.4, 0.4) + (i - n / 2) * 0.08, t: 0, dur: 1.5 });
  },
  riseLines(x, y, n, s) {
    const V = this.vfx();
    for (let i = 0; i < n; i++) V.rise.push({ x: x + rand(-34, 34) * s, y: y - rand(0, 40) * s, len: rand(60, 130) * s, w: rand(1.2, 3), t: -i * 0.012, dur: rand(0.2, 0.32) });
  },
  trailLines(x, y, ang, s) {
    const V = this.vfx(), c = Math.cos(ang), sn = Math.sin(ang);
    for (let i = 0; i < 2; i++) {
      const back = rand(10, 50) * s, side = rand(-46, 46) * s;
      V.trail.push({ x: x - c * back - sn * side, y: y - 60 * s - sn * back + c * side, c, s: sn, len: rand(60, 130) * s, w: rand(1.2, 2.6), t: 0, dur: rand(0.14, 0.24) });
    }
    if (V.trail.length > 60) V.trail.splice(0, V.trail.length - 60);
  },
  landBurst(x, s, p) {
    this.vfx().lburst.push({ x, s, p: clamp(p, 0.3, 1.4), t: 0, dur: 0.3, seed: (Math.random() * 1000) | 0 });
  },
  // Hand-drawn branching lightning from (x0, y0) to (x1, y1): a jagged main bolt with short forks, drawn dark-red-white
  // and re-jagged every other frame for a few held, high-contrast frames. o: { w (core width), branches, dur, color }.
  lightning(x0, y0, x1, y1, o) {
    o = o || {};
    this.vfx().zaps.push({ x0, y0, x1, y1, w: o.w || 2, br: o.branches == null ? 2 : o.branches, color: o.color || '#ff3b2f', t: 0, dur: o.dur || 0.14, seed: (Math.random() * 9999) | 0 });
  },
  // Akari's smoke: a COMPACT puff of a few layered flat discs (charcoal, muted violet, a pale rim so each reads as a clear
  // silhouette). It blooms, rises a little and is gone within `life` seconds (AKARI_MOVES.smokeStep.smoke: 0.5 s,
  // radius 46), so it never hides the fight for long. o: { life, radius }.
  smokePuff(x, y, o) {
    o = o || {}; const R = o.radius || 46, life = o.life || 0.5, rr = Math.random;
    const lobes = [[0, -0.55, 0.62], [-0.55, -0.35, 0.5], [0.55, -0.38, 0.5], [-0.25, -0.95, 0.46], [0.3, -0.92, 0.44], [0, -1.3, 0.34]];
    this.vfx().puffs.push({ x, y, R, t: 0, dur: life, lobes: lobes.map(([dx, dy, r], i) => ({ dx: dx + (rr() - 0.5) * 0.12, dy, r: r * (0.9 + rr() * 0.2), c: i % 3 === 2 ? '#5c4d78' : i % 2 ? '#3a3346' : '#463d55' })) });
    if (this.vfx().puffs.length > 8) this.vfx().puffs.shift();
  },
  // a flat violet ground marker (diamond in a flattened ring): where a short teleport will land (Akari's Blink tell)
  groundMark(x, dur, color) { this.vfx().marks.push({ x, t: 0, dur: dur || 0.4, c: color || [180, 140, 240] }); },
  // Petal Cross: two NARROW violet slashes crossing in an X at (x, y), drawn fast, with petals thrown off the crossing
  petalCross(x, y, dir, size) {
    const s = size || 150, a = dir > 0 ? -0.62 : Math.PI + 0.62;
    this.vfx().crosses.push({ x, y, a, len: s, t: 0, dur: 0.42, n: 2, dir });
    for (let i = 0; i < 14; i++) { const g = rand(0, TAU), v = rand(80, 320); this.part({ x, y, vx: Math.cos(g) * v + dir * 80, vy: Math.sin(g) * v - 60, life: rand(0.5, 0.9), size: rand(3, 5.2), color: chance(0.55) ? '#b48ae6' : '#ece2ff', type: 'ash', grav: 70, drag: 1.8, rot: rand(0, TAU), vr: rand(-10, 10) }); }
  },
  // a four-point glint on a blade edge: the moment before a strike is released
  glint(x, y, color) { this.vfx().glints.push({ x, y, color: color || '#ffffff', t: 0, dur: 0.3 }); },
  clashFlare(x, y) { this.vfx().flares.push({ x, y, t: 0, dur: 0.32, r: 90 }); },
  finisher(x, y, dir) { this.vfx().finisher = { x, y, dir, t: 0, dur: 1.15, a: dir > 0 ? -0.32 : Math.PI + 0.32 }; },
  screenTint(color, dur) { this.vfx().tint = { color, t: 0, dur }; },
  updateVfx(realDt, dt) {
    const V = this.vfx();
    const tick = (arr, d) => { for (let i = arr.length - 1; i >= 0; i--) { arr[i].t += d; if (arr[i].t >= arr[i].dur) arr.splice(i, 1); } };
    tick(V.zaps, dt); tick(V.glints, dt); tick(V.puffs, dt); tick(V.marks, dt); tick(V.crosses, dt);
    tick(V.fire, dt); tick(V.ripples, dt); tick(V.bolts, dt); tick(V.cres, dt); tick(V.streaks, dt); tick(V.shards, dt); tick(V.rings, dt); tick(V.flares, realDt); tick(V.rise, dt); tick(V.trail, dt); tick(V.lburst, dt);
    if (V.finisher) { V.finisher.t += realDt; if (V.finisher.t >= V.finisher.dur) V.finisher = null; }
    if (V.tint) { V.tint.t += realDt; if (V.tint.t >= V.tint.dur) V.tint = null; }
  },
  drawVfx(ctx) {
    const V = this.vfx();
    ctx.save();
    // ground shards (drawn first, they belong to the floor)
    ctx.fillStyle = C.ink;
    for (const s of V.shards) {
      const k = s.t / s.dur, rise = Ease.outBack(clamp(s.t / 0.12, 0, 1)), sink = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      const h = s.h * rise * sink;
      ctx.beginPath(); ctx.moveTo(s.x - s.w / 2, 1); ctx.lineTo(s.x + Math.sin(s.lean) * h, -h); ctx.lineTo(s.x + s.w / 2, 1); ctx.closePath(); ctx.fill();
    }
    // knockback speed lines, trailing opposite the direction of flight
    ctx.lineCap = 'round';
    for (const l of V.trail) {
      const k = l.t / l.dur, hx = l.x - l.c * l.len * k * 0.3, hy = l.y - l.s * l.len * k * 0.3, L = l.len * (1 - k * 0.5);
      ctx.strokeStyle = `rgba(241,235,224,${0.75 * (1 - k)})`; ctx.lineWidth = l.w;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - l.c * L, hy - l.s * L); ctx.stroke();
    }
    // landing impact burst: flat white spikes fanning out along the ground, plus the fall's streaks above
    for (const b of V.lburst) {
      const k = b.t / b.dur, grow = Ease.outCubic(clamp(k / 0.3, 0, 1)), a = 1 - k * k, R = prng(b.seed);
      ctx.fillStyle = `rgba(241,235,224,${a})`;
      for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
        const ang = side > 0 ? -(0.1 + i * 0.24 + R() * 0.08) : Math.PI + 0.1 + i * 0.24 + R() * 0.08;
        const L = (34 + R() * 34) * b.s * b.p * grow * (1 - i * 0.12), w = 6 * b.s * (1 - k * 0.7), bx = b.x + side * 16 * b.s, by = -2;
        const c = Math.cos(ang), sn = Math.sin(ang);
        ctx.beginPath(); ctx.moveTo(bx - sn * w, by + c * w); ctx.lineTo(bx + c * L, by + sn * L); ctx.lineTo(bx + sn * w, by - c * w); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = `rgba(241,235,224,${0.6 * a})`; ctx.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) { const lx = b.x + (i - 1) * 26 * b.s, top = -(110 + i * 16) * b.s - k * 40 * b.s; ctx.beginPath(); ctx.moveTo(lx, top); ctx.lineTo(lx, top + 60 * b.s * (1 - k)); ctx.stroke(); }
    }
    // takeoff speed lines streaming down from a launch
    ctx.lineCap = 'round';
    for (const l of V.rise) {
      if (l.t < 0) continue;
      const k = l.t / l.dur;
      ctx.strokeStyle = `rgba(241,235,224,${0.85 * (1 - k)})`; ctx.lineWidth = l.w;
      ctx.beginPath(); ctx.moveTo(l.x, l.y + l.len * k * 0.6); ctx.lineTo(l.x, l.y + l.len * (0.5 + k)); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    // fireballs: blooming core, rolling flame tongues
    for (const b of V.fire) {
      const k = b.t / b.dur, r = b.r * (0.45 + Ease.outCubic(k) * 0.9), a = 1 - k;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0, `rgba(255,250,220,${a})`); g.addColorStop(0.25, `rgba(255,200,90,${a * 0.9})`); g.addColorStop(0.6, `rgba(255,90,30,${a * 0.6})`); g.addColorStop(1, 'rgba(160,20,10,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(255,130,50,${0.6 * a})`;
      for (let i = 0; i < 9; i++) {
        const ang = i / 9 * TAU + b.x * 0.01, L = r * (0.9 + 0.35 * Math.sin(i * 2.3 + b.t * 30)), w = r * 0.16;
        const cx = b.x + Math.cos(ang) * r * 0.5, cy = b.y + Math.sin(ang) * r * 0.5;
        ctx.beginPath(); ctx.moveTo(cx - Math.sin(ang) * w, cy + Math.cos(ang) * w); ctx.lineTo(b.x + Math.cos(ang) * L, b.y + Math.sin(ang) * L - r * 0.15); ctx.lineTo(cx + Math.sin(ang) * w, cy - Math.cos(ang) * w); ctx.fill();
      }
    }
    // water ripples
    for (const r of V.ripples) {
      if (r.t < 0) continue;
      const k = r.t / r.dur;
      ctx.strokeStyle = r.c + (0.8 * (1 - k)) + ')'; ctx.lineWidth = 3 * (1 - k) + 0.5;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r * (0.3 + k), r.r * (0.3 + k) * 0.42, 0, 0, TAU); ctx.stroke();
    }
    // lightning bolts radiating from the hit
    for (const b of V.bolts) {
      const k = b.t / b.dur, R = prng(b.seed * 100 + ((b.t * 60) | 0));
      for (let i = 0; i < b.n; i++) {
        const a = R() * TAU; let x = b.x, y = b.y;
        ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,0.95)' : 'rgba(120,205,255,0.9)'; ctx.lineWidth = (1 - k) * (i % 2 ? 1.4 : 2.6);
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let s = 1; s <= 5; s++) { x = b.x + Math.cos(a) * b.len * s / 5 + (R() - 0.5) * 22; y = b.y + Math.sin(a) * b.len * s / 5 + (R() - 0.5) * 22; ctx.lineTo(x, y); }
        ctx.stroke();
      }
    }
    // hand-drawn branching lightning (Raikon)
    ctx.lineCap = 'round'; ctx.lineJoin = 'miter';
    for (const z of V.zaps) {
      const R = prng(z.seed + ((z.t * 30) | 0) * 13), dx = z.x1 - z.x0, dy = z.y1 - z.y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      const n = Math.max(4, Math.min(10, (L / 22) | 0)), pts = [z.x0, z.y0];
      for (let i = 1; i < n; i++) { const k = i / n, j = (R() - 0.5) * Math.min(40, L * 0.22); pts.push(z.x0 + dx * k + nx * j, z.y0 + dy * k + ny * j); }
      pts.push(z.x1, z.y1);
      const paths = [pts];
      for (let b = 0; b < z.br; b++) {
        const i = 1 + ((R() * (n - 1)) | 0), bx = pts[i * 2], by = pts[i * 2 + 1], side = R() < 0.5 ? -1 : 1, bl = L * (0.2 + R() * 0.25);
        const fx_ = dx / L * 0.6 + nx * side * 0.8, fy_ = dy / L * 0.6 + ny * side * 0.8, q = [bx, by];
        for (let s = 1; s <= 3; s++) q.push(bx + fx_ * bl * s / 3 + (R() - 0.5) * 14, by + fy_ * bl * s / 3 + (R() - 0.5) * 14);
        paths.push(q);
      }
      const a = 1 - z.t / z.dur;
      for (const [col, k] of [['rgba(18,4,4,' + a + ')', 3.4], [z.color, 2.2], ['#ffffff', 0.9]]) {
        ctx.strokeStyle = col; ctx.globalAlpha = col[0] === '#' ? a : 1;
        paths.forEach((q, pi) => { ctx.lineWidth = z.w * k * (pi ? 0.6 : 1); ctx.beginPath(); ctx.moveTo(q[0], q[1]); for (let i = 2; i < q.length; i += 2) ctx.lineTo(q[i], q[i + 1]); ctx.stroke(); });
      }
      ctx.globalAlpha = 1;
    }
    ctx.lineJoin = 'round';
    // blade glints: a sharp four-point star that flares and shrinks
    for (const g of V.glints) {
      const k = g.t / g.dur, R2 = 34 * Math.sin(Math.min(1, k * 1.4) * Math.PI), a = 1 - k * 0.6;
      ctx.fillStyle = g.color; ctx.globalAlpha = a;
      for (const [dx, dy, w] of [[1, 0, 0.12], [0, 1, 0.12]]) { ctx.beginPath(); ctx.moveTo(g.x - dx * R2, g.y - dy * R2); ctx.lineTo(g.x - dy * R2 * w, g.y + dx * R2 * w); ctx.lineTo(g.x + dx * R2, g.y + dy * R2); ctx.lineTo(g.x + dy * R2 * w, g.y - dx * R2 * w); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(g.x, g.y, R2 * 0.14, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // crossing moon crescents
    for (const c of V.cres) {
      if (c.t < 0) continue;
      const k = c.t / c.dur, grow = Ease.outCubic(clamp(k / 0.35, 0, 1)), a = k < 0.35 ? 1 : 1 - (k - 0.35) / 0.65, S = c.s * (0.9 + k * 0.25);
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a); ctx.globalAlpha = a;
      ctx.fillStyle = `rgb(${c.c[0]},${c.c[1]},${c.c[2]})`;
      const a0 = -1.3, a1 = a0 + 2.6 * grow;
      ctx.beginPath(); ctx.arc(0, 0, S, a0, a1); ctx.arc(-S * 0.18, 0, S * 0.84, a1, a0, true); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, S, a0 + 0.15, a1 - 0.05); ctx.stroke();
      ctx.restore();
    }
    // spin / pressure rings (flattened ellipses read as horizontal waves)
    for (const r of V.rings) {
      if (r.t < 0) continue;
      const k = r.t / r.dur, rr = r.r * (0.5 + Ease.outCubic(k) * 0.8), a = 1 - k;
      ctx.strokeStyle = `rgba(${r.c[0]},${r.c[1]},${r.c[2]},${0.85 * a})`; ctx.lineWidth = 5 * a + 0.5;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, rr, rr * r.flat, 0, 0, TAU); ctx.stroke();
      if (r.el === 'water') { ctx.strokeStyle = `rgba(255,255,255,${0.7 * a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(r.x, r.y - 3, rr * 0.96, rr * r.flat * 0.96, 0, 0.2, Math.PI - 0.2); ctx.stroke(); }
    }
    // clash flare: a four-point star of light where the blades met
    for (const fl of V.flares) {
      const k = fl.t / fl.dur, a = 1 - k, R = fl.r * (0.6 + k * 0.8);
      const g = ctx.createRadialGradient(fl.x, fl.y, 0, fl.x, fl.y, R * 0.5);
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fl.x, fl.y, R * 0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(255,244,214,${a})`;
      for (const [dx, dy, w] of [[1, 0, 0.06], [0, 1, 0.05], [0.7, 0.7, 0.03], [0.7, -0.7, 0.03]]) {
        ctx.beginPath(); ctx.moveTo(fl.x - dx * R, fl.y - dy * R); ctx.lineTo(fl.x - dy * R * w, fl.y + dx * R * w); ctx.lineTo(fl.x + dx * R, fl.y + dy * R); ctx.lineTo(fl.x + dy * R * w, fl.y - dx * R * w); ctx.closePath(); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    // Blink landing markers on the floor
    for (const m of V.marks) {
      const k = m.t / m.dur, a = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8 * 0.6, r = 34 + 10 * Math.sin(k * Math.PI);
      ctx.strokeStyle = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},${0.8 * a})`; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.ellipse(m.x, -1, r, r * 0.22, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},${0.9 * a})`;
      ctx.beginPath(); ctx.moveTo(m.x - 9, -2); ctx.lineTo(m.x, -16); ctx.lineTo(m.x + 9, -2); ctx.lineTo(m.x, 1); ctx.closePath(); ctx.fill();
    }
    // narrow violet slashes (Akari's hits, Petal Cross): a thin violet blade of light with a white core; n = 2 is the X
    ctx.lineCap = 'round';
    for (const c of V.crosses) {
      const k = c.t / c.dur;
      for (let i = 0; i < c.n; i++) {
        const lag = i * 0.18; if (k < lag) continue;
        const kk = clamp((k - lag) / (1 - lag), 0, 1), grow = Ease.outCubic(clamp(kk / 0.25, 0, 1)), a = kk < 0.35 ? 1 : 1 - (kk - 0.35) / 0.65;
        const ang = i ? -c.a : c.a, dx = Math.cos(ang) * c.len, dy = Math.sin(ang) * c.len;
        const ax = c.x - dx * 0.5, ay = c.y - dy * 0.5, bx = lerp(ax, c.x + dx * 0.5, grow), by = lerp(ay, c.y + dy * 0.5, grow);
        ctx.strokeStyle = `rgba(110,64,170,${0.9 * a})`; ctx.lineWidth = 6 * a + 1;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        ctx.strokeStyle = `rgba(200,170,255,${a})`; ctx.lineWidth = 3 * a + 0.6;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(lerp(ax, bx, 0.08), lerp(ay, by, 0.08)); ctx.lineTo(lerp(ax, bx, 0.92), lerp(ay, by, 0.92)); ctx.stroke();
      }
    }
    // Akari's compact smoke puffs: flat layered discs, each with a pale rim, blooming then shrinking away
    for (const p of V.puffs) {
      const k = p.t / p.dur, bloom = Ease.outCubic(clamp(k / 0.3, 0, 1)), sh = k > 0.55 ? 1 - (k - 0.55) / 0.45 : 1, sc = (0.45 + 0.55 * bloom) * (0.35 + 0.65 * sh), rise = k * 18;
      ctx.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      for (const L of p.lobes) { ctx.fillStyle = 'rgba(214,200,236,0.55)'; ctx.beginPath(); ctx.arc(p.x + L.dx * p.R * sc, p.y + L.dy * p.R - rise, L.r * p.R * sc + 2, 0, TAU); ctx.fill(); }
      for (const L of p.lobes) { ctx.fillStyle = L.c; ctx.beginPath(); ctx.arc(p.x + L.dx * p.R * sc, p.y + L.dy * p.R - rise, L.r * p.R * sc, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    // red cut streaks
    for (const s of V.streaks) {
      const k = s.t / s.dur, grow = clamp(k / 0.2, 0, 1), a = k < 0.2 ? 1 : 1 - (k - 0.2) / 0.8;
      const dx = Math.cos(s.a) * s.len, dy = Math.sin(s.a) * s.len;
      ctx.strokeStyle = `rgba(200,26,36,${a})`; ctx.lineWidth = 4 * a + 1; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(s.x - dx * grow, s.y - dy * grow); ctx.lineTo(s.x + dx * grow, s.y + dy * grow); ctx.stroke();
      ctx.strokeStyle = `rgba(255,236,230,${a})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(s.x - dx * grow * 0.8, s.y - dy * grow * 0.8); ctx.lineTo(s.x + dx * grow * 0.8, s.y + dy * grow * 0.8); ctx.stroke();
    }
    ctx.restore();
  },
  // screen-space: the finishing slash across the whole frame, and colour washes for perfect moments
  drawVfxScreen(ctx, toScreen) {
    const V = this.vfx(), set = SaveManager.data.settings;
    if (V.tint) {
      const k = V.tint.t / V.tint.dur, a = (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85) * (set.reduceFlash ? 0.08 : 0.2);
      ctx.fillStyle = V.tint.color + a + ')'; ctx.fillRect(0, 0, W, H);
    }
    const F = V.finisher;
    if (F) {
      const sp = toScreen(F.x, F.y), k = F.t, ca = Math.cos(F.a), sa = Math.sin(F.a), L = 1600;
      ctx.save();
      if (k < 0.5) { ctx.fillStyle = `rgba(0,0,0,${0.45 * Math.sin(Math.min(1, k / 0.5) * Math.PI)})`; ctx.fillRect(0, 0, W, H); }
      const draw = Ease.outCubic(clamp(k / 0.14, 0, 1)), widen = clamp((k - 0.14) / 0.3, 0, 1), fade = k > 0.6 ? 1 - (k - 0.6) / 0.55 : 1;
      const x0 = sp.x - ca * L, y0 = sp.y - sa * L, x1 = lerp(x0, sp.x + ca * L, draw), y1 = lerp(y0, sp.y + sa * L, draw);
      ctx.globalAlpha = fade;
      if (widen > 0) brushStroke(ctx, x0, y0, sp.x + ca * L, sp.y + sa * L, 10 + 36 * Ease.outCubic(widen), C.emberBright, 1, 11, 0.01);
      ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineWidth = 3 + 3 * (1 - widen);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.restore();
    }
  },
  // real heat distortion: re-draw thin horizontal slices of the frame with a wobble around each fireball
  applyHaze(ctx, toScreen) {
    return; // flat 2D art direction: no realistic distortion
    const V = this.vfx(); if (!V.fire.length || SaveManager.data.settings.reduceFlash) return;
    const cv = ctx.canvas, sx = cv.width / W, sy = cv.height / H;
    for (let i = 0; i < Math.min(2, V.fire.length); i++) {
      const b = V.fire[i], k = b.t / b.dur, sp = toScreen(b.x, b.y), R = b.r * 1.6, amp = 4 * (1 - k);
      for (let y = sp.y - R * 1.4; y < sp.y + R * 0.3; y += 4) {
        const off = Math.sin(y * 0.15 + this.time * 24) * amp;
        const x0 = Math.max(0, sp.x - R), w = Math.min(W - x0, R * 2);
        if (w <= 0 || y < 0 || y > H - 4) continue;
        ctx.drawImage(cv, x0 * sx, y * sy, w * sx, 4 * sy, x0 + off, y, w, 4);
      }
    }
  }
});
