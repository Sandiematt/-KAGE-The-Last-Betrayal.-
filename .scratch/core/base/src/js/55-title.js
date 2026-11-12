/* KAGE — animated title scene: the key art, alive.
   The painted backdrop (title-plate) and the hero (title-hero) are cut from the key art; on top of them the moon
   breathes, clouds and petals drift, the tails of his red scarf blow in the wind, the blade glows, the cracked
   ground smoulders and embers rise, and the hero breathes. A 2.5D camera drifts slowly and follows the pointer.
   The painted hero still wears the old red hachimaki, so it is inked out in code (heroRecolour); what is left is
   Kage's anime look (docs/art-reference/STYLE.md): the black face with white eyes as painted, the red scarf at his
   neck, and its two tails streaming back from there. */
// the key art (1254 px square) sits right-aligned at 0.6 scale; landmarks below are in canvas units
const TA = { x: 528, y: -20, s: 0.6 };
const TITLE_MOON = { x: 894, y: 209, r: 211 };
const TITLE_LAND = { x: 936, y: 625 };       // the hero's ground line
const TITLE_HORIZON = 500;                     // where the ground plane meets the hills
const TITLE_OVERSCAN = 1.07;                   // layers are drawn slightly enlarged so camera moves never reveal an edge
// hero sprite: its top-left in art px, plus anchors in sprite px (the scarf at the back of his neck, sword guard) and the
// blade tip in art px
const HERO_SPR = { ax: 398, ay: 625, knot: [348, 222], guard: [68, 52], tip: [70, 824] };
// the painted head is a circle (sprite px); the red headband inside it is inked out
const HERO_HEAD = { x: 300, y: 112, r: 80 };
const HERO_INK = [16, 7, 8];                                                         // the painted body's ink
const HERO_SCARF = ['#c8343a', '#a8262c'];                                           // Kage's scarf (ANIME.scarf and its second tail)

// Kage's look on the painted hero: ink out the old red headband (the painted black face, white eyes and red scarf at
// the neck are already his), so his outline and rim light stay exactly as painted
function heroRecolour(im) {
  const w = im.naturalWidth, h = im.naturalHeight, Hd = HERO_HEAD;
  return makeLayer(w, h, g => {
    g.drawImage(im, 0, 0);
    const x0 = Hd.x - Hd.r - 4, y0 = Hd.y - Hd.r - 4, sz = (Hd.r + 4) * 2;
    const id = g.getImageData(x0, y0, sz, sz), d = id.data;
    for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) {
      const dx = x0 + x - Hd.x, dy = y0 + y - Hd.y; if (dx * dx + dy * dy > (Hd.r + 3) * (Hd.r + 3)) continue;
      const i = (y * sz + x) * 4, r = d[i], gg = d[i + 1], b = d[i + 2], red = clamp((r - Math.max(gg, b) - 6) / 50, 0, 1);
      if (red <= 0) continue;
      d[i] = lerp(r, HERO_INK[0], red); d[i + 1] = lerp(gg, HERO_INK[1], red); d[i + 2] = lerp(b, HERO_INK[2], red);
    }
    g.putImageData(id, x0, y0);
  });
}

// A smooth radial glow sprite. Canvas gradients are globally stepped for the cel look (see flatGradients in core),
// so soft light is built from many tiny steps instead: rgb at full alpha in the middle, fading by profile(u).
function softGlow(r, rgb, profile) {
  return makeLayer(Math.ceil(r * 2), Math.ceil(r * 2), g => {
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    for (let i = 0; i <= 48; i++) { const u = i / 48, v = profile(u); gr.addColorStop(u, `rgba(${rgb},${(v > 0 ? Math.min(1, v) : 0).toFixed(3)})`); }
    g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2);
  });
}
function titleImage(src) { const im = new Image(); im.decoding = 'async'; im.src = src; return im; }
const imgReady = im => !!im && im.complete && im.naturalWidth > 0;

const TitleScene = {
  T: null, t: 0, embers: [], scarf: null, cam: null,

  // entering the title: reset the camera and cloth so the scene opens settled
  restart() { this.t = 0; this.cam = null; this.scarf = null; this.embers.length = 0; },

  /* ---------------- static layers ---------------- */
  build() {
    const R = seeded(77), T = {};
    T.plate = titleImage('__IMG(title-plate.webp)__');
    T.hero = titleImage('__IMG(title-hero.webp)__');
    T.halo = softGlow(TITLE_MOON.r * 2, '255,176,138', u => u < 0.48 ? 1 : Math.pow(1 - (u - 0.48) / 0.52, 2.2));
    T.moonGlow = softGlow(TITLE_MOON.r, '255,226,192', u => Math.pow(1 - u, 1.6));
    T.groundGlow = softGlow(160, '255,64,34', u => Math.pow(1 - u, 1.8));
    T.heroGlow = softGlow(120, '255,90,60', u => Math.pow(1 - u, 2));
    // drifting cloud bands in the art's palette: flat underside, puffy crown, lit top edge
    const cloud = (w, h, dark, lit) => makeLayer(Math.ceil(w + 40), Math.ceil(h * 3 + 20), g => {
      const base = h * 2.2 + 10, puffs = 3 + Math.floor(R() * 3);
      const shape = (dy) => {
        g.beginPath(); g.ellipse(w / 2 + 20, base + dy, w / 2, h * 0.55, 0, 0, TAU); g.fill();
        for (let i = 0; i < puffs; i++) {
          const u = (i + 0.5) / puffs, cx = 20 + w * (0.15 + u * 0.7) + (R() - 0.5) * w * 0.08, r = h * (0.7 + R() * 0.9) * (1 - Math.abs(u - 0.5) * 0.9);
          g.beginPath(); g.arc(cx, base - r * 0.35 + dy, r, Math.PI, 0); g.fill();
        }
      };
      g.fillStyle = lit; shape(-3);
      g.fillStyle = dark; shape(0);
      g.globalCompositeOperation = 'destination-out'; g.fillRect(0, base + h * 0.25, w + 40, h * 3);
    });
    T.clouds = [];
    for (let i = 0; i < 4; i++) {
      const near = i % 2 === 0, w = 200 + R() * 260, h = 12 + R() * 12;
      T.clouds.push({ img: cloud(w, h, near ? '#7a2a28' : '#93403a', near ? '#c27a6a' : '#cf8e7c'), a: near ? 0.45 : 0.32,
        x: R() * (W + 600) - 300, y: 40 + R() * 300, s: (near ? 9 : 5) + R() * 6, bob: R() * 6, d: near ? 0.26 : 0.16 });
    }
    // grassy hills between the painted sky and the ground plane (they hide the plate's lower edge)
    const hillPts = [[-260, 492], [0, 482], [180, 474], [360, 478], [520, 468], [700, 456], [860, 468], [1000, 452], [1130, 440], [1280, 446], [1540, 452]];
    T.hills = makeLayer(W + 520, H + 120, g => {
      g.translate(260, 0);
      g.beginPath(); g.moveTo(-260, H + 120);
      for (let i = 0; i < hillPts.length - 1; i++) { const a = hillPts[i], b = hillPts[i + 1]; g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
      g.lineTo(1540, 452); g.lineTo(1540, H + 120); g.closePath();
      g.fillStyle = '#220b0a'; g.fill();
      g.strokeStyle = 'rgba(214,110,92,0.28)'; g.lineWidth = 2; g.stroke();
      g.strokeStyle = '#1c0807'; g.lineCap = 'round'; g.lineWidth = 3;
      for (let i = 0; i < 90; i++) {
        const x = -240 + R() * 1760, y = this.hillY(hillPts, x) + 3, n = 2 + (R() * 3 | 0);
        for (let j = 0; j < n; j++) { const h = 10 + R() * 18, lx = (R() - 0.5) * 14; g.beginPath(); g.moveTo(x + j * 4, y); g.quadraticCurveTo(x + j * 4 + lx * 0.3, y - h * 0.6, x + j * 4 + lx, y - h); g.stroke(); }
      }
    });
    // the ground plane: smooth falloff from the hazy horizon into dark earth
    T.ground = makeLayer(W + 520, H - TITLE_HORIZON + 140, g => {
      const h = H - TITLE_HORIZON + 140, gr = g.createLinearGradient(0, 0, 0, h);
      for (let i = 0; i <= 40; i++) { const u = i / 40, c = (a, b) => Math.round(lerp(a, b, Math.pow(u, 0.7))); gr.addColorStop(u, `rgb(${c(52, 14)},${c(20, 7)},${c(19, 7)})`); }
      g.fillStyle = gr; g.fillRect(0, 0, W + 520, h);
      for (let i = 0; i < 260; i++) {
        const y = Math.pow(R(), 1.6) * h, x = R() * (W + 520), l = (10 + R() * 60) * (0.3 + y / h);
        g.strokeStyle = R() < 0.5 ? 'rgba(6,2,2,0.45)' : 'rgba(140,70,62,0.10)'; g.lineWidth = 1 + y / h * 2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (R() - 0.5) * 3); g.stroke();
      }
    });
    // glowing cracks radiating from under the hero (flattened for perspective)
    T.cracks = [];
    const crack = (x, y, a, len, w, depth) => {
      const pts = [{ x, y }]; let d = 0;
      while (d < len) {
        const st = 14 + R() * 22; a += (R() - 0.5) * 0.9; d += st;
        x += Math.cos(a) * st; y += Math.sin(a) * st * 0.3;
        pts.push({ x, y });
        if (depth < 1 && R() < 0.24) crack(x, y, a + (R() < 0.5 ? -1 : 1) * (0.5 + R() * 0.6), len * (0.25 + R() * 0.3), w * 0.6, depth + 1);
      }
      T.cracks.push({ pts, w, ph: R() * TAU });
    };
    for (let i = 0; i < 13; i++) {
      const a = lerp(-0.1, Math.PI + 0.1, (i + R() * 0.6) / 13);
      crack(TITLE_LAND.x + Math.cos(a) * 30, TITLE_LAND.y + 2, a, 170 + R() * 260, 2.4 + R() * 1.6, 0);
    }
    // smoke banks resting on both sides of him, as in the key art
    T.dust = [];
    for (let i = 0; i < 30; i++) {
      const side = i % 2 ? 1 : -1, sp = 160 + R() * 600, front = i % 3 === 0;
      const x = TITLE_LAND.x + side * (front ? 170 + R() * 70 : 40 + R() * 80) + side * sp / 3.2;
      T.dust.push({ x, y: TITLE_LAND.y - (R() * 16 - 6), r: (40 + R() * 46) * (1.2 - sp / 1300) * (front ? 0.8 : 1), ph: R() * TAU, front, shade: 0.9 + R() * 0.16 });
    }
    T.petals = []; for (let i = 0; i < 44; i++) T.petals.push({ x: R() * W, y: R() * H, s: 18 + R() * 40, r: 2.4 + R() * 3, sp: R() * 6 });
    T.fg = [];
    for (const [x, w] of [[-10, 150], [190, 90], [1330, 110], [1470, 170]]) {
      const blades = []; for (let i = 0; i < 16; i++) blades.push({ o: (R() - 0.5) * w * 1.5, h: 40 + R() * 70, ph: R() * 6, lean: (R() - 0.5) * 24 });
      T.fg.push({ x, w, blades });
    }
    return (this.T = T);
  },
  hillY(pts, x) { for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) return lerp(pts[i][1], pts[i + 1][1], (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0])); return pts[pts.length - 1][1]; },

  /* ---------------- frame ---------------- */
  frame(dt) {
    const T = this.T || this.build(), ctx = Renderer.ctx;
    this.t += dt;
    const clock = Game.t;
    this.stepCloth(dt, clock, this.spritePt(HERO_SPR.knot[0], HERO_SPR.knot[1], clock));

    // 2.5D camera: every layer sits at a depth d (0 = infinitely far, 1 = the hero's ground, >1 = in front)
    const cam = this.camera(dt, clock);
    const layer = (d) => {
      const s = TITLE_OVERSCAN * (1 + (cam.z - 1) * d);
      ctx.setTransform(s, 0, 0, s, W / 2 - s * lerp(W / 2, cam.x, d), H / 2 - s * lerp(H / 2, cam.y, d));
    };

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#2a0b0b'; ctx.fillRect(0, 0, W, H);
    layer(0.18);
    if (imgReady(T.plate)) ctx.drawImage(T.plate, 0, 0, W, H);
    this.drawMoonGlow(ctx, clock);
    for (const c of T.clouds) {
      layer(c.d);
      const span = W + 600, x = ((c.x + clock * c.s) % span + span) % span - 300;
      ctx.globalAlpha = c.a; ctx.drawImage(c.img, x - c.img.width / 2, c.y - c.img.height * 0.7 + Math.sin(clock * 0.4 + c.bob) * 3);
    }
    ctx.globalAlpha = 1;
    layer(0.42); this.drawPetals(ctx, clock, T, 0);
    layer(0.62); ctx.drawImage(T.hills, -260, 0);
    layer(1); ctx.drawImage(T.ground, -260, TITLE_HORIZON);
    this.drawGround(ctx, clock, T);
    this.drawDust(ctx, clock, T, false);
    this.drawHero(ctx, clock);
    this.drawDust(ctx, clock, T, true);
    this.drawEmbers(ctx, dt, T);
    layer(1.45); this.drawForeground(ctx, clock, T);
    layer(1.7); this.drawPetals(ctx, clock, T, 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(Renderer.vignette, 0, 0);
  },

  // slow drift plus pointer parallax; opens already at rest
  camera(dt, clock) {
    if (!this._ptrBound) {
      this._ptrBound = true; this.ptr = { x: 0, y: 0 };
      window.addEventListener('pointermove', e => { this.ptr.x = (e.clientX / window.innerWidth - 0.5) * 2; this.ptr.y = (e.clientY / window.innerHeight - 0.5) * 2; }, { passive: true });
    }
    const c = this.cam || (this.cam = { x: 720, y: 368, z: 1.04, px: this.ptr.x, py: this.ptr.y });
    c.px = damp(c.px, this.ptr.x, 3, dt); c.py = damp(c.py, this.ptr.y, 3, dt);
    const tx = 720 + Math.sin(clock * 0.23) * 14 + c.px * 34, ty = 368 + Math.sin(clock * 0.31) * 6 + c.py * 20, tz = 1.04 + Math.sin(clock * 0.19) * 0.012;
    c.x = damp(c.x, tx, 1.4, dt); c.y = damp(c.y, ty, 1.4, dt); c.z = damp(c.z, tz, 1.4, dt);
    return c;
  },

  /* ---------------- the scarf's trailing tails ---------------- */
  ribbon(n) { return { n, px: new Float32Array(n), py: new Float32Array(n), ox: new Float32Array(n), oy: new Float32Array(n), init: false }; },
  stepRibbon(rb, ax, ay, seg, wx, wy, dt, t, ph) {
    const n = rb.n, px = rb.px, py = rb.py, ox = rb.ox, oy = rb.oy;
    if (!rb.init) { for (let i = 0; i < n; i++) { px[i] = ox[i] = ax + i * seg; py[i] = oy[i] = ay - i * seg * 0.3; } rb.init = true; }
    const dt2 = dt * dt;
    for (let i = 1; i < n; i++) {
      const vx_ = (px[i] - ox[i]) * 0.9, vy_ = (py[i] - oy[i]) * 0.9, f = i / n;
      ox[i] = px[i]; oy[i] = py[i];
      px[i] += vx_ + (wx + Math.sin(t * 9 + i * 0.7 + ph) * 260) * dt2 * f;
      py[i] += vy_ + (wy + Math.sin(t * 11 + i * 0.9 + ph) * 320) * dt2 * f;
    }
    px[0] = ox[0] = ax; py[0] = oy[0] = ay;
    for (let k = 0; k < 3; k++) for (let i = 1; i < n; i++) {
      const dx = px[i] - px[i - 1], dy = py[i] - py[i - 1], d = Math.sqrt(dx * dx + dy * dy) || 0.001, diff = (d - seg) / d;
      px[i] -= dx * diff; py[i] -= dy * diff;
    }
  },
  // an easterly breeze lifts the scarf's two tails up and to the right
  stepCloth(dt, t, knot) {
    dt = Math.min(dt, 1 / 30); if (dt <= 0) return;
    if (!this.scarf) this.scarf = [this.ribbon(8), this.ribbon(5)];
    this.stepRibbon(this.scarf[0], knot.x, knot.y, 13, 900, -220, dt, t, 0);
    this.stepRibbon(this.scarf[1], knot.x, knot.y + 4, 11, 800, -100, dt, t, 2);
  },
  drawRibbon(ctx, rb, w0, w1, col) {
    if (!rb || !rb.init) return;
    const n = rb.n, px = rb.px, py = rb.py, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
      let dx = px[b] - px[a], dy = py[b] - py[a]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const w = lerp(w0, w1, i / (n - 1)) * 0.5 * (1 + 0.35 * Math.sin(i * 1.3 + this.t * 8));
      L.push(px[i] - dy * w, py[i] + dx * w); R.push(px[i] + dy * w, py[i] - dx * w);
    }
    ctx.beginPath(); ctx.moveTo(L[0], L[1]);
    for (let i = 2; i < L.length; i += 2) ctx.lineTo(L[i], L[i + 1]);
    for (let i = R.length - 2; i >= 0; i -= 2) ctx.lineTo(R[i], R[i + 1]);
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = 'rgb(16,7,8)'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.stroke();   // the ink edge of the cel look
  },

  /* ---------------- the hero (cut from the key art) ---------------- */
  // a slow breath, pivoting on the ground line under his feet
  breath(clock) { const br = Math.sin(clock * 2.1); return { sx: 1 - br * 0.004, sy: 1 + br * 0.012 }; },
  spritePt(px, py, clock) {
    const f = this.breath(clock), o = this._spt || (this._spt = { x: 0, y: 0 });
    const x = TA.x + (HERO_SPR.ax + px) * TA.s, y = TA.y + (HERO_SPR.ay + py) * TA.s;
    o.x = TITLE_LAND.x + (x - TITLE_LAND.x) * f.sx; o.y = TITLE_LAND.y + (y - TITLE_LAND.y) * f.sy; return o;
  },
  drawHero(ctx, clock) {
    const T = this.T, im = T.hero, f = this.breath(clock);
    // a warm glow behind him from the cracked ground
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.22 + 0.06 * Math.sin(clock * 2.2);
    ctx.drawImage(T.heroGlow, TITLE_LAND.x - 220, TITLE_LAND.y - 190, 440, 300); ctx.restore();
    if (this.scarf) { this.drawRibbon(ctx, this.scarf[1], 10, 6, HERO_SCARF[1]); this.drawRibbon(ctx, this.scarf[0], 15, 7, HERO_SCARF[0]); }
    ctx.save(); ctx.translate(TITLE_LAND.x, TITLE_LAND.y); ctx.scale(f.sx, f.sy); ctx.translate(-TITLE_LAND.x, -TITLE_LAND.y);
    if (imgReady(im) && !T.heroKage) T.heroKage = heroRecolour(im);
    if (T.heroKage) ctx.drawImage(T.heroKage, TA.x + HERO_SPR.ax * TA.s, TA.y + HERO_SPR.ay * TA.s, im.naturalWidth * TA.s, im.naturalHeight * TA.s);
    ctx.restore();
    const g = this.spritePt(HERO_SPR.guard[0], HERO_SPR.guard[1], clock), gx = g.x, gy = g.y;
    const tip = this.spritePt(HERO_SPR.tip[0] - HERO_SPR.ax, HERO_SPR.tip[1] - HERO_SPR.ay, clock);
    this.drawBlade(ctx, gx, gy, tip.x, tip.y, 1.15, 0.65 + 0.2 * Math.sin(clock * 2.6));
  },
  drawBlade(ctx, x0, y0, x1, y1, k, glow) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, w = 4.2 * k;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255,40,30,1)'; ctx.shadowBlur = 24 * k;
    ctx.strokeStyle = `rgba(255,56,44,${0.6 * glow})`; ctx.lineWidth = 11 * k;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#f7ece6';
    ctx.beginPath(); ctx.moveTo(x0 + nx * w, y0 + ny * w); ctx.lineTo(x1 - dx / L * 2, y1 - dy / L * 2); ctx.lineTo(x1, y1); ctx.lineTo(x0 - nx * w * 0.4, y0 - ny * w * 0.4); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,120,100,${0.5 * glow})`; ctx.lineWidth = 1.6 * k;
    ctx.beginPath(); ctx.moveTo(x0 - nx * w * 0.4, y0 - ny * w * 0.4); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.restore();
  },

  /* ---------------- ambience ---------------- */
  drawMoonGlow(ctx, clock) {
    const M = TITLE_MOON, T = this.T, br = Math.sin(clock * 1.1);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const hr = M.r * (2 + br * 0.1);
    ctx.globalAlpha = 0.16 + br * 0.07; ctx.drawImage(T.halo, M.x - hr, M.y - hr, hr * 2, hr * 2);
    ctx.globalAlpha = 0.07 + br * 0.05;
    const gr = M.r * 0.95; ctx.drawImage(T.moonGlow, M.x - 30 - gr, M.y - 40 - gr, gr * 2, gr * 2);
    ctx.restore();
  },
  drawForeground(ctx, clock, T) {
    ctx.fillStyle = '#060101'; ctx.strokeStyle = '#060101'; ctx.lineCap = 'round';
    for (const cl of T.fg) {
      ctx.beginPath(); ctx.ellipse(cl.x, H + 30, cl.w, 52, 0, Math.PI, 0); ctx.fill();
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (const b of cl.blades) {
        const bx = cl.x + b.o, sw = Math.sin(clock * 1.6 + b.ph) * 7;
        ctx.moveTo(bx, H - 6); ctx.quadraticCurveTo(bx + sw * 0.4, H - b.h * 0.6, bx + sw + b.lean, H - b.h);
      }
      ctx.stroke();
    }
  },
  // the cracked earth under him smoulders with a slow pulse
  drawGround(ctx, clock, T) {
    const L = TITLE_LAND;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.36 + 0.1 * Math.sin(clock * 2.2);
    ctx.drawImage(T.groundGlow, L.x - 360, L.y - 70, 720, 170);
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.rect(-400, TITLE_HORIZON + 30, W + 800, H); ctx.clip();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const pass of [0, 1, 2]) {
      for (const c of T.cracks) {
        const pulse = 0.55 + 0.25 * Math.sin(clock * 2.4 + c.ph), p = c.pts;
        ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y);
        for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
        if (pass === 0) { ctx.strokeStyle = `rgba(255,40,24,${0.24 * pulse})`; ctx.lineWidth = c.w * 4.5; }
        else if (pass === 1) { ctx.strokeStyle = `rgba(255,80,50,${0.8 * pulse})`; ctx.lineWidth = c.w * 1.6; }
        else { ctx.strokeStyle = `rgba(255,190,150,${0.35 * pulse})`; ctx.lineWidth = c.w * 0.55; }
        ctx.stroke();
      }
    }
    ctx.restore();
  },
  // smoke banks: opaque cartoon puffs drawn on their own layer, gently rolling
  drawDust(ctx, clock, T, front) {
    const key = front ? '_dustF' : '_dustB';
    const lc = this[key] || (this[key] = makeLayer(W + 400, H, () => {}));
    const g = lc.getContext('2d');
    g.setTransform(1, 0, 0, 1, 200, 0); g.clearRect(-200, 0, W + 400, H);
    const pts = [];
    for (const d of T.dust) {
      if (d.front !== front) continue;
      pts.push(d, d.x + Math.sin(clock * 0.5 + d.ph) * 7, d.y - d.r * 0.5 + Math.sin(clock * 0.7 + d.ph) * 2, d.r * (1 + 0.03 * Math.sin(clock * 0.9 + d.ph)));
    }
    const pass = (rgb, dx, dy, k) => {
      for (let i = 0; i < pts.length; i += 4) {
        const d = pts[i], x = pts[i + 1], y = pts[i + 2], r = pts[i + 3];
        g.fillStyle = `rgb(${Math.round(rgb[0] * d.shade)},${Math.round(rgb[1] * d.shade)},${Math.round(rgb[2] * d.shade)})`;
        g.beginPath(); g.arc(x + r * dx, y + r * dy, r * k, 0, TAU); g.fill();
      }
    };
    pass([104, 64, 64], 0, 0.06, 1);
    pass([168, 128, 124], -0.08, -0.12, 0.88);
    pass([206, 172, 164], -0.2, -0.3, 0.55);
    ctx.globalAlpha = 0.9; ctx.drawImage(lc, -200, 0); ctx.globalAlpha = 1;
  },
  // embers rising from the cracks
  drawEmbers(ctx, dt, T) {
    this.emberAcc = (this.emberAcc || 0) + dt * 16;
    while (this.emberAcc > 1) {
      this.emberAcc--;
      const c = T.cracks[(Math.random() * T.cracks.length) | 0], p = c.pts[(Math.random() * c.pts.length) | 0];
      if (this.embers.length < 70) this.embers.push({ x: p.x, y: p.y, vx: rand(-14, 14), vy: -rand(30, 95), age: 0, life: rand(1.4, 3), r: rand(0.9, 2.4), ph: rand(0, TAU) });
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = this.embers.length - 1; i >= 0; i--) {
      const e = this.embers[i]; e.age += dt;
      if (e.age > e.life) { this.embers.splice(i, 1); continue; }
      e.x += (e.vx + Math.sin(e.age * 3 + e.ph) * 18) * dt; e.y += e.vy * dt;
      const a = Math.sin(Math.PI * e.age / e.life);
      ctx.fillStyle = `rgba(255,${110 + 80 * a},70,${a * 0.9})`;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, TAU); ctx.fill();
    }
    ctx.restore();
  },
  drawPetals(ctx, clock, T, near) {
    ctx.fillStyle = near ? '#b81d26' : '#d8282f';
    for (let i = near; i < T.petals.length; i += 2) {
      const p = T.petals[i];
      const x = ((p.x + clock * p.s * 0.9 + Math.sin(clock + p.sp) * 20) % (W + 40) + W + 40) % (W + 40) - 20, y = (p.y + clock * p.s) % H;
      ctx.save(); ctx.translate(x, y); ctx.rotate(clock * 2 + p.sp); const pr = near ? p.r * 1.35 : p.r; ctx.beginPath(); ctx.ellipse(0, 0, pr * 1.5, pr * 0.8, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
  }
};
