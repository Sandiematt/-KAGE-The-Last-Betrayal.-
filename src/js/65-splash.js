/* KAGE — The Last Betrayal: opening splash. The moon scene settles, then K-A-G-E is written stroke by stroke,
   each letter cut in by a slash that comes from outside the frame (about 3 seconds), then the subtitle
   "The Last Betrayal", the tagline and the prompt.
   The painted scene still shows the hero in the old red hachimaki, so he is recoloured in code (sceneRecolour)
   into Kage's story-bible look, as the title scene does: the headband and its long red tails are taken out of the
   black silhouette, a flat white face-wrap covers his lower face, and one short white strip trails from its knot. */
const Splash = (() => {
  // everything is laid out in the key art's own pixel space (1774 x 887)
  const ART_W = 1774, ART_H = 887;
  const LF = { x: 321, y: 303, w: 1153, h: 449 };            // frame shared by the four letter layers
  const LCX = LF.x + LF.w / 2, LCY = LF.y + LF.h / 2, LSCALE = 0.9;
  const SRC = {
    scene: '__IMG(splash-scene.webp)__',
    k: '__IMG(kage-k.webp)__', a: '__IMG(kage-a.webp)__', g: '__IMG(kage-g.webp)__', e: '__IMG(kage-e.webp)__'
  };
  // letter bounds inside the letter frame, the window it is written in, and the direction of its stroke
  const LETTERS = [
    { key: 'k', b: [0, 0, 502, 448],    t0: 0.5, t1: 1.0, ang: -1.05 },  // up from the bottom-left
    { key: 'a', b: [344, 24, 629, 358], t0: 1.0, t1: 1.4, ang: -0.55 },
    { key: 'g', b: [590, 59, 830, 393], t0: 1.4, t1: 1.8, ang: -0.1 },
    { key: 'e', b: [829, 40, 1152, 314], t0: 1.8, t1: 2.2, ang: -0.18 }
  ];
  // slashes that carve each letter; straight ones run tail -> head, the A gets a curved swoosh
  const SLASHES = [
    { t0: 0.5, t1: 0.7, fade: 0.32, w: 13, line: [300, 830, 700, 290] },
    { t0: 1.0, t1: 1.24, fade: 0.3, w: 11, arc: [760, 600, 330, 70, -0.1, 2.75, 6.55] },
    { t0: 1.4, t1: 1.58, fade: 0.3, w: 14, line: [1950, 400, 1000, 650] },   // comes in from the right
    { t0: 1.8, t1: 1.96, fade: 0.3, w: 14, line: [1120, 690, 1960, 420] }    // exits off the right edge
  ];
  const CUT = { t0: 2.2, t1: 2.3, line: [462, 670, 1048, 450] };          // the final cut through K-A, it stays
  const MARK_T = 2.6, TAG_T = 2.85, PROMPT_T = 3.2;

  /* ---- Kage's look on the painted scene (art px) ---- */
  const MOON = { x: 926, y: 309, r: 231 };                  // the red moon disc behind him
  const HERO_INK = [3, 2, 2];                               // the silhouette's ink
  // the long headband tails: over the black sky they are red (inked out), over the moon they are black (painted out)
  const TAILS_SKY = [[520, 118], [772, 118], [772, 140], [748, 168], [736, 200], [720, 236], [700, 300], [520, 300]];
  const TAILS_MOON = [[700, 128], [735, 130], [762, 141], [800, 157], [835, 156], [866, 159], [870, 170], [869, 192], [842, 198],
    [815, 204], [790, 207], [760, 217], [728, 228], [700, 236], [690, 200], [695, 160]];
  const MOON_EDGE = 0;                                      // extra reach past the disc for the moon-side fill
  // the headband across his head, from the knot at the back to the hair at his brow
  const BAND = [[868, 162], [904, 158], [932, 160], [960, 168], [985, 180], [1008, 192], [1022, 203], [1029, 216], [1030, 238],
    [1018, 247], [1006, 237], [990, 223], [975, 209], [960, 199], [940, 188], [920, 185], [895, 186], [868, 188]];
  // the face-wrap: everything dark below the eye slit, inside this outline, with a cel-shade under the jaw
  const WRAP = [[926, 236], [960, 239], [986, 243], [1014, 245], [1024, 300], [948, 300], [934, 268]];
  const WRAP_TOP = [[930, 237], [960, 240], [986, 244], [1012, 246]];
  const WRAP_SHADE_Y = x => 270 + (x - 940) * 0.12;
  const KNOT = { x: 868, y: 176 };
  const FACEWRAP = '#efe9dd', FACEWRAP_SHADE = '#b4ac9f';
  const inPoly = (P, x, y) => {
    let c = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const [xi, yi] = P[i], [xj, yj] = P[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const inMoon = (x, y, pad) => Math.hypot(x - MOON.x, y - MOON.y) <= MOON.r + (pad || 0);
  function sceneRecolour(im) {
    const c = document.createElement('canvas'); c.width = ART_W; c.height = ART_H;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0, ART_W, ART_H);
    const x0 = 520, y0 = 110, w = 520, h = 200, id = g.getImageData(x0, y0, w, h), d = id.data;
    const at = (x, y) => ((y - y0) * w + (x - x0)) * 4;
    const ink = (i, k) => { d[i] = lerp(d[i], HERO_INK[0], k); d[i + 1] = lerp(d[i + 1], HERO_INK[1], k); d[i + 2] = lerp(d[i + 2], HERO_INK[2], k); };
    const isMoon = i => d[i] >= 205 && d[i + 1] >= 14 && d[i + 1] <= 50 && d[i + 2] <= 48;
    const marked = new Uint8Array(w * h);
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      const i = at(x, y), r = d[i], gg = d[i + 1], b = d[i + 2];
      if (inMoon(x, y, MOON_EDGE) && inPoly(TAILS_MOON, x, y)) {
        // tails against the moon -> filled with moon (in the ring around the disc, black sky is left alone)
        if (!isMoon(i) && (inMoon(x, y) || Math.max(r, gg, b) > 14)) marked[(y - y0) * w + (x - x0)] = 1;
      } else if (inPoly(TAILS_SKY, x, y)) {                               // red tails against the sky -> ink
        const red = clamp((r - Math.max(gg, b) - 3) / 25, 0, 1); if (red > 0) ink(i, red);
      }
      if (inPoly(BAND, x, y) && !(r > 200 && gg > 150)) ink(i, 1);       // the headband -> ink (the eye stays white)
    }
    // paint the marked tail pixels with the moon around them, interpolating each column between the nearest clean pixels
    for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) {
      if (!marked[(y - y0) * w + (x - x0)]) continue;
      let up = -1, dn = -1;
      const clean = (xx, yy) => xx >= x0 && xx < x0 + w && !marked[(yy - y0) * w + (xx - x0)] && inMoon(xx, yy, MOON_EDGE) && isMoon(at(xx, yy));
      for (let k = 1; k < 60 && y - k >= y0; k++) if (clean(x, y - k)) { up = y - k; break; }
      for (let k = 1; k < 60 && y + k < y0 + h; k++) if (clean(x, y + k)) { dn = y + k; break; }
      if (up < 0 && dn < 0) continue;
      // average a few clean neighbours along each sample row so the fill shows no column streaks
      const sample = yy => { const o = [0, 0, 0]; let n = 0; for (let k = -3; k <= 3; k++) if (clean(x + k, yy)) { const j = at(x + k, yy); o[0] += d[j]; o[1] += d[j + 1]; o[2] += d[j + 2]; n++; } return o.map(v => v / n); };
      const A = sample(up < 0 ? dn : up), B = sample(dn < 0 ? up : dn), t = up < 0 || dn < 0 ? 0 : (y - up) / (dn - up), i = at(x, y);
      for (let ch = 0; ch < 3; ch++) d[i + ch] = lerp(A[ch], B[ch], t);
    }
    // the face-wrap: dark pixels inside the outline, keeping a thin ink edge where the silhouette meets the moon
    const dark = (x, y) => { const i = at(x, y); return Math.max(d[i], d[i + 1], d[i + 2]) < 70; };
    const fill = [];
    for (let y = 230; y < 300; y++) for (let x = 920; x < 1030; x++) {
      if (!inPoly(WRAP, x, y) || !dark(x, y) || !dark(x - 3, y) || !dark(x + 3, y) || !dark(x, y - 3) || !dark(x, y + 3)) continue;
      fill.push(x, y);
    }
    const rgb = hex => [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16)), lit = rgb(FACEWRAP), sh = rgb(FACEWRAP_SHADE);
    for (let k = 0; k < fill.length; k += 2) {
      const x = fill[k], y = fill[k + 1], i = at(x, y), col = y > WRAP_SHADE_Y(x) ? sh : lit;
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2];
    }
    g.putImageData(id, x0, y0);
    // crisp ink edges: the wrap's top under the eye and one fold
    const path = pts => pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]));
    g.save(); g.strokeStyle = 'rgb(3,2,2)'; g.lineWidth = 3; g.lineJoin = g.lineCap = 'round';
    g.beginPath(); path(WRAP_TOP); g.stroke();
    g.beginPath(); g.moveTo(1004, 258); g.quadraticCurveTo(975, 266, 948, 258); g.stroke();
    g.restore();
    return c;
  }
  // the short white strip trailing from the knot, blown back to the left
  function drawStrip(t) {
    const strip = (len, n, w0, w1, ph, lift, col) => {
      const L = [], R = [], pt = u => [KNOT.x - u * len, KNOT.y + u * lift + Math.sin(t * 7 + u * 5 + ph) * 7 * u];
      for (let i = 0; i <= n; i++) {
        const u = i / n, [x, y] = pt(u), [nx, ny] = pt(u + 0.05);
        let dx = nx - x, dy = ny - y; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
        const ww = lerp(w0, w1, u) / 2; L.push([x - dy * ww, y + dx * ww]); R.push([x + dy * ww, y - dx * ww]);
      }
      ctx.fillStyle = col; ctx.beginPath();
      L.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
      ctx.closePath(); ctx.fill();
    };
    strip(62, 10, 9, 5, 2, 14, FACEWRAP_SHADE);
    strip(96, 12, 14, 6, 0, -8, FACEWRAP);
    ctx.fillStyle = FACEWRAP; ctx.strokeStyle = 'rgb(3,2,2)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(KNOT.x, KNOT.y, 9, 7, -0.5, 0, TAU); ctx.fill(); ctx.stroke();
  }

  let cv, ctx, imgs = {}, ready = 0, t0 = 0, raf = 0, petals = [], sparks = [], jag = [];
  const load = () => new Promise(res => {
    const keys = Object.keys(SRC); let n = keys.length;
    for (const k of keys) { const im = new Image(); im.onload = im.onerror = () => { if (--n === 0) res(); }; im.src = SRC[k]; imgs[k] = im; }
  });
  const rnd = prng(7);
  for (let i = 0; i < 4; i++) { const a = []; for (let j = 0; j < 46; j++) a.push((rnd() - 0.5) * 38); jag.push(a); }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect();
    cv.width = Math.max(2, Math.round(r.width * dpr)); cv.height = Math.max(2, Math.round(r.height * dpr));
  }
  function spawnPetal(init) {
    petals.push({ x: init ? Math.random() * ART_W : -40 - Math.random() * 200, y: Math.random() * ART_H * 0.8, vx: 60 + Math.random() * 70, vy: 18 + Math.random() * 30,
      r: 6 + Math.random() * 7, a: Math.random() * TAU, va: (Math.random() - 0.5) * 3, ph: Math.random() * TAU });
  }
  function sparkBurst(x, y, n, dir) {
    for (let i = 0; i < n; i++) { const a = dir + (Math.random() - 0.5) * 1.6, v = 240 + Math.random() * 520; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.25 + Math.random() * 0.3, t: 0, w: Math.random() < 0.4 }); }
  }

  // a tapered blade-light: red body with a white core, thin at the tail, full at the head
  function blade(pts, w, alpha) {
    if (pts.length < 2 || alpha <= 0) return;
    const n = pts.length, edge = (k, side, scale) => {
      const p = pts[k], q = pts[Math.min(n - 1, k + 1)], o = pts[Math.max(0, k - 1)];
      const dx = q[0] - o[0], dy = q[1] - o[1], L = Math.hypot(dx, dy) || 1, f = k / (n - 1);
      const ww = w * scale * Math.sin(Math.PI * Math.min(1, f * 1.15)) ;
      return [p[0] - dy / L * ww * side, p[1] + dx / L * ww * side];
    };
    const shape = (scale, col) => {
      ctx.fillStyle = col; ctx.beginPath();
      for (let k = 0; k < n; k++) { const e = edge(k, 1, scale); k ? ctx.lineTo(e[0], e[1]) : ctx.moveTo(e[0], e[1]); }
      for (let k = n - 1; k >= 0; k--) { const e = edge(k, -1, scale); ctx.lineTo(e[0], e[1]); }
      ctx.closePath(); ctx.fill();
    };
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.shadowColor = 'rgba(255,40,40,0.9)'; ctx.shadowBlur = 22;
    shape(1, '#e3191f');
    ctx.shadowBlur = 0;
    shape(0.38, '#fff3ec');
    ctx.restore();
  }
  function slashPts(s, head, tail) {
    const pts = [], N = 22;
    for (let i = 0; i <= N; i++) {
      const u = tail + (head - tail) * i / N;
      if (s.line) { const [x0, y0, x1, y1] = s.line; pts.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]); }
      else { const [cx, cy, rx, ry, rot, a0, a1] = s.arc, a = a0 + (a1 - a0) * u, x = Math.cos(a) * rx, y = Math.sin(a) * ry; pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); }
    }
    return pts;
  }

  function drawLetter(L, i, t) {
    const im = imgs[L.key]; if (!im || !im.width) return;
    const k = clamp((t - L.t0) / ((L.t1 - L.t0) * 0.72), 0, 1);
    if (k <= 0) return;
    const [bx0, by0, bx1, by1] = L.b, cx = LF.x + (bx0 + bx1) / 2, cy = LF.y + (by0 + by1) / 2;
    const c = Math.cos(L.ang), s = Math.sin(L.ang);
    // extent of the letter along the stroke direction
    let lo = Infinity, hi = -Infinity;
    for (const [x, y] of [[bx0, by0], [bx1, by0], [bx0, by1], [bx1, by1]]) { const p = (LF.x + x - cx) * c + (LF.y + y - cy) * s; lo = Math.min(lo, p); hi = Math.max(hi, p); }
    const front = lo - 40 + (hi - lo + 80) * Ease.outCubic(k);
    ctx.save();
    if (k < 1) {
      // reveal behind a ragged dry-brush front moving along the stroke
      ctx.translate(cx, cy); ctx.rotate(L.ang);
      ctx.beginPath(); ctx.moveTo(-2400, -1200);
      const J = jag[i];
      for (let j = 0; j < J.length; j++) { const yy = -1200 + j * (2400 / (J.length - 1)); ctx.lineTo(front + J[j], yy); }
      ctx.lineTo(-2400, 1200); ctx.closePath();
      ctx.rotate(-L.ang); ctx.translate(-cx, -cy);
      ctx.clip();
    }
    ctx.drawImage(im, LF.x, LF.y, LF.w, LF.h);
    ctx.restore();
  }

  // letter-spaced text centred on cx
  function spaced(txt, cx, y, sp) {
    let w = -sp; for (const ch of txt) w += ctx.measureText(ch).width + sp;
    let x = cx - w / 2; for (const ch of txt) { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + sp; }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const boot = document.getElementById('boot');
    if (!boot) { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); return; }
    if (!ready) return;
    const t = (now - t0) / 1000, dt = Math.min(0.05, frame.last ? (now - frame.last) / 1000 : 0.016); frame.last = now;
    const W = cv.width, H = cv.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#020202'; ctx.fillRect(0, 0, W, H);
    // the composition sits a little smaller than the screen, centred
    const S = Math.min(W / ART_W, H / ART_H) * 0.8;
    let shake = 0; if (t > CUT.t0 && t < CUT.t0 + 0.32) shake = (1 - (t - CUT.t0) / 0.32) * 7;
    const ox = (W - ART_W * S) / 2 + (Math.random() - 0.5) * shake * S * 2, oy = (H - ART_H * S) / 2 + (Math.random() - 0.5) * shake * S * 2;
    ctx.setTransform(S, 0, 0, S, ox, oy);
    // 1) scene setup: fade up from black with a slow push-in
    const sk = Ease.outCubic(clamp(t / 0.6, 0, 1)), zoom = 1.05 - 0.05 * sk + 0.006 * Math.sin(t * 0.6);
    ctx.save(); ctx.globalAlpha = sk;
    ctx.translate(ART_W / 2, ART_H * 0.42); ctx.scale(zoom, zoom); ctx.translate(-ART_W / 2, -ART_H * 0.42);
    if (!imgs.kage) imgs.kage = sceneRecolour(imgs.scene);
    ctx.drawImage(imgs.kage, 0, 0, ART_W, ART_H);
    drawStrip(t);
    ctx.restore();
    // petals drifting on the wind
    if (petals.length < 16 && Math.random() < dt * 3) spawnPetal(false);
    ctx.fillStyle = '#d42a2a';
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i]; p.x += (p.vx + Math.sin(t * 1.3 + p.ph) * 30) * dt; p.y += (p.vy + Math.sin(t * 2 + p.ph) * 14) * dt; p.a += p.va * dt;
      if (p.x > ART_W + 60 || p.y > ART_H + 40) { petals.splice(i, 1); continue; }
      ctx.save(); ctx.globalAlpha = 0.85 * sk; ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(1, 0.45 + 0.35 * Math.abs(Math.sin(t * 3 + p.ph)));
      ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    // 2-5) letters with their slashes, scaled a touch smaller around their centre
    let bump = 1; if (t > CUT.t0) bump = 1 + 0.045 * Math.max(0, 1 - (t - CUT.t0) / 0.18) * Math.sin(clamp((t - CUT.t0) / 0.18, 0, 1) * Math.PI);
    ctx.save(); ctx.translate(LCX, LCY); ctx.scale(LSCALE * bump, LSCALE * bump); ctx.translate(-LCX, -LCY);
    LETTERS.forEach((L, i) => drawLetter(L, i, t));
    for (const s of SLASHES) {
      if (t < s.t0 || t > s.t1 + s.fade) continue;
      const u = clamp((t - s.t0) / (s.t1 - s.t0), 0, 1), head = Ease.outCubic(u), tail = Math.max(0, head - 0.55) + (t > s.t1 ? (t - s.t1) / s.fade : 0) * head;
      const a = t > s.t1 ? 1 - (t - s.t1) / s.fade : 1;
      blade(slashPts(s, head, Math.min(head, tail)), s.w, a);
      if (!s.burst && u > 0.6) { s.burst = 1; const p = slashPts(s, head, head)[0]; sparkBurst(p[0], p[1], 10, Math.atan2((s.line ? s.line[3] - s.line[1] : 1), (s.line ? s.line[2] - s.line[0] : 1))); }
    }
    // 6) the final cut through K-A stays as a thin red stroke, with a flash when it lands
    if (t >= CUT.t0) {
      const u = Ease.outCubic(clamp((t - CUT.t0) / (CUT.t1 - CUT.t0), 0, 1)), [x0, y0, x1, y1] = CUT.line;
      const pts = []; for (let i = 0; i <= 20; i++) { const v = u * i / 20; pts.push([x0 + (x1 - x0) * v, y0 + (y1 - y0) * v]); }
      const glow = clamp(1 - (t - CUT.t1) / 0.5, 0, 1);
      ctx.save(); ctx.globalAlpha = 1; ctx.shadowColor = 'rgba(255,30,30,0.9)'; ctx.shadowBlur = 6 + 22 * glow;
      ctx.fillStyle = '#d8141b'; ctx.beginPath();
      const n = pts.length, nx = -(y1 - y0), ny = x1 - x0, nl = Math.hypot(nx, ny), w = 5 + 5 * glow;
      for (let i = 0; i < n; i++) { const f = Math.sin(Math.PI * i / (n - 1)) * w; const p = pts[i]; i ? ctx.lineTo(p[0] + nx / nl * f, p[1] + ny / nl * f) : ctx.moveTo(p[0], p[1]); }
      for (let i = n - 1; i >= 0; i--) { const f = Math.sin(Math.PI * i / (n - 1)) * w; const p = pts[i]; ctx.lineTo(p[0] - nx / nl * f, p[1] - ny / nl * f); }
      ctx.closePath(); ctx.fill(); ctx.restore();
      if (!CUT.burst && u >= 1) { CUT.burst = 1; sparkBurst((x0 + x1) / 2, (y0 + y1) / 2, 26, Math.atan2(y1 - y0, x1 - x0)); }
      // impact lines radiating from the cut
      const k = (t - CUT.t1) / 0.3;
      if (k > 0 && k < 1) {
        ctx.save(); ctx.strokeStyle = `rgba(255,244,236,${1 - k})`; ctx.lineWidth = 3; ctx.lineCap = 'round';
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + 0.2, r0 = 330 + k * 160, r1 = r0 + 70 * (1 - k); ctx.beginPath(); ctx.moveTo(mx + Math.cos(a) * r0, my + Math.sin(a) * r0 * 0.55); ctx.lineTo(mx + Math.cos(a) * r1, my + Math.sin(a) * r1 * 0.55); ctx.stroke(); }
        ctx.restore();
      }
    }
    ctx.restore();
    // sparks from the blades
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i]; p.t += dt; if (p.t >= p.life) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.93; p.vy = p.vy * 0.93 + 300 * dt;
      ctx.fillStyle = p.w ? '#fff2e8' : '#ff3b2f'; ctx.globalAlpha = 1 - p.t / p.life;
      const sx = LCX + (p.x - LCX) * LSCALE, sy = LCY + (p.y - LCY) * LSCALE;
      ctx.fillRect(sx - 2.5, sy - 2.5, 5, 5);
    }
    ctx.globalAlpha = 1;
    // 7) the subtitle between two rules, then the tagline
    const mk = clamp((t - MARK_T) / 0.4, 0, 1);
    if (mk > 0) {
      const y = 712, e = Ease.outCubic(mk), half = 232;
      ctx.save(); ctx.globalAlpha = e;
      ctx.strokeStyle = 'rgba(232,222,206,0.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(887 - half - 40 - 150 * e, y); ctx.lineTo(887 - half - 40, y); ctx.moveTo(887 + half + 40, y); ctx.lineTo(887 + half + 40 + 150 * e, y); ctx.stroke();
      ctx.translate(887, y); ctx.scale(1.15 - 0.15 * e, 1.15 - 0.15 * e);
      ctx.fillStyle = '#f0dcc0'; ctx.font = '600 44px KageSerif, serif'; ctx.textBaseline = 'middle';
      spaced('THE LAST BETRAYAL', 0, 0, 10);
      ctx.restore();
    }
    const tk = clamp((t - TAG_T) / 0.45, 0, 1);
    if (tk > 0) {
      ctx.save(); ctx.globalAlpha = Ease.outCubic(tk);
      ctx.fillStyle = '#c9a45c'; ctx.font = 'italic 600 30px KageSerif, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Brothers until the end.', 887, 762 + 8 * (1 - tk));
      ctx.restore();
    }
    // 8) prompt, gently pulsing
    const pk = clamp((t - PROMPT_T) / 0.45, 0, 1);
    if (pk > 0) {
      ctx.save(); ctx.globalAlpha = pk * (0.62 + 0.38 * Math.sin((t - PROMPT_T) * 3.2 + 1.6));
      ctx.fillStyle = '#efe4d2'; ctx.font = '500 38px KageUI, sans-serif'; ctx.textBaseline = 'middle';
      const txt = 'TAP  OR  PRESS  ANY  KEY', sp = 9;
      let w = 0; for (const ch of txt) w += ctx.measureText(ch).width + sp;
      let x = 887 - w / 2; for (const ch of txt) { ctx.fillText(ch, x, 832); x += ctx.measureText(ch).width + sp; }
      ctx.restore();
    }
  }

  return {
    start() {
      const boot = document.getElementById('boot'); if (!boot) return;
      cv = boot.querySelector('canvas'); if (!cv) return;
      ctx = cv.getContext('2d');
      resize(); window.addEventListener('resize', resize);
      for (let i = 0; i < 9; i++) spawnPetal(true);
      const fonts = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('600 44px KageSerif', 'THE LAST BETRAYAL'), document.fonts.load('500 38px KageUI', 'TAP')]).catch(() => {}) : Promise.resolve();
      Promise.all([load(), fonts]).then(() => {
        ready = 1; t0 = performance.now();
        // reduced motion: open straight on the finished title card
        if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) t0 -= 4000;
      });
      raf = requestAnimationFrame(frame);
    }
  };
})();
