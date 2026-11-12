/* ---- the armour's hairstyle (see _themes.js `hair`), from the user's second armory sheet. Each style is the hair's
   silhouette in the head frame (head units: +x the face side, -y up), in the shape ../shadow/head.js draws: tip and
   valley points round the hair (`rim` of them carry the light), then the points that close it along the hairline;
   and optionally long strands streaming back from the head on the `hair` cloth chain (kageShadowCloths), and an
   ornament drawn over it (a topknot, a tie, a bun). The locks are in the armour's scarf colours (white hair: its own).
     ronin     shaggy and swept back, a rust-tied topknot, three loose locks
     ponytail  Yami: straight bangs, a smooth crown, a high ponytail tied in violet
     swept     Shinsen: layered spikes swept back and low, silver-lit
     mane      Raikō: a great wild mane of long spikes and long gold-lit locks
     shaggy    Kagehira: messy hair falling over the eyes
     bun       Yūrei: long silver-white hair tied in a bun, flowing back in full locks
     spectral  Mugen: a crown of tall thin spikes, long flowing spectral hair that burns violet and comes apart into
               light at its tips
   Shinobi Garb keeps his own spiky hair (KS_HAIR). Only on his bare head: a helmet hides it all.
   Yūrei's and Mugen's hair were designed in Godot first (godot/hair-design: the design renders and the lock textures);
   their locks wear the Godot-baked textures (HAIR_SHEETS, 34c-hair-sheets.js) mapped along each lock, on the heavier
   `hairLong` chain, rooted apart along the back of the head, exactly as the design builds them. ---- */
const KAGE_HAIRSTYLES = {
  ronin: {
    pts: [[1.22, 0.1, 1], [0.92, -0.18], [1.36, -0.42, 1], [0.9, -0.62], [1.14, -0.95, 1], [0.55, -1.02], [0.52, -1.36, 1], [0.12, -1.1],
      [-0.55, -1.18], [-1.25, -1.36, 1], [-0.95, -0.86], [-1.72, -0.96, 1], [-1.08, -0.46], [-1.86, -0.26, 1], [-1.1, 0.04],
      [-1.62, 0.56, 1], [-0.95, 0.42], [-1.16, 0.96, 1], [-0.5, 0.62],
      [-0.1, 0.2], [0.34, -0.3], [0.74, -0.14]],
    rim: 19,
    strands: { n: 3, len: 0.8, w0: 2.4, w1: 5.2, spread: 2.2, root: [-0.9, -0.1] },
    extra: 'topknot'
  },
  ponytail: {
    pts: [[1.12, 0.14, 1], [0.97, -0.1], [1.2, -0.28, 1], [0.95, -0.48], [1.12, -0.7, 1], [0.86, -0.98], [0.3, -1.2], [-0.4, -1.18],
      [-0.92, -0.86], [-1.12, -0.34], [-1.02, 0.2], [-0.78, 0.66, 1], [-0.46, 0.6],
      [-0.1, 0.2], [0.34, -0.3], [0.74, -0.14]],
    rim: 13,
    strands: { n: 3, len: 1, w0: 4, w1: 8, spread: 1.4, root: [-0.62, -1.12] },
    extra: 'tie'
  },
  swept: {
    pts: [[1.25, 0.12, 1], [0.95, -0.12], [1.42, -0.32, 1], [0.98, -0.55], [1.25, -0.95, 1], [0.62, -0.98], [0.55, -1.56, 1], [0.1, -1.12],
      [-0.6, -1.84, 1], [-0.4, -1.12], [-1.55, -1.55, 1], [-0.9, -0.92], [-2.15, -0.95, 1], [-1.15, -0.5], [-2.32, -0.18, 1], [-1.1, -0.04],
      [-1.92, 0.46, 1], [-0.95, 0.36], [-1.36, 0.86, 1], [-0.5, 0.6],
      [-0.1, 0.2], [0.34, -0.3], [0.74, -0.14]],
    rim: 20, rimCol: '#eef0f6', tan: '#8f8698'
  },
  mane: {
    pts: [[1.3, 0.15, 1], [0.98, -0.1], [1.5, -0.4, 1], [1.0, -0.62], [1.45, -1.0, 1], [0.6, -1.0], [0.85, -1.74, 1], [0.2, -1.15],
      [-0.3, -2.1, 1], [-0.35, -1.25], [-1.35, -1.95, 1], [-0.85, -1.0], [-2.3, -1.45, 1], [-1.15, -0.65], [-2.6, -0.55, 1], [-1.2, -0.15],
      [-2.45, 0.4, 1], [-1.05, 0.3], [-1.9, 1.05, 1], [-0.75, 0.62], [-1.1, 1.4, 1], [-0.45, 0.66],
      [-0.1, 0.2], [0.34, -0.3], [0.74, -0.14]],
    rim: 22,
    strands: { n: 4, len: 0.9, w0: 2.4, w1: 5.4, spread: 2.6, root: [-1.0, -0.3] }
  },
  shaggy: {
    pts: [[1.16, 0.24, 1], [0.9, -0.02], [1.32, -0.2, 1], [0.92, -0.45], [1.3, -0.72, 1], [0.7, -0.92], [0.9, -1.3, 1], [0.25, -1.1],
      [0.0, -1.6, 1], [-0.3, -1.12], [-1.0, -1.5, 1], [-0.85, -0.95], [-1.66, -1.06, 1], [-1.05, -0.5], [-1.82, -0.3, 1], [-1.05, 0.0],
      [-1.52, 0.5, 1], [-0.9, 0.4], [-1.06, 0.92, 1], [-0.45, 0.6],
      [-0.1, 0.2], [0.34, -0.3], [0.74, -0.14]],
    rim: 20
  },
  bun: {
    pts: [[1.1, 0.06, 1], [0.95, -0.2], [1.14, -0.45, 1], [0.92, -0.64], [0.96, -0.92], [0.45, -1.16], [-0.2, -1.2], [-0.8, -1.0],
      [-1.1, -0.55], [-1.16, -0.05], [-1.06, 0.4], [-0.82, 0.76, 1], [-0.46, 0.62],
      [-0.1, 0.2], [0.34, -0.3], [0.74, -0.14]],
    rim: 13, fill: '#dcdff0', fillLo: '#9aa2c4', rimCol: '#ffffff', tan: '#7a84aa', tex: 'silver',
    strands: { n: 7, len: 1, w0: 3.4, w1: 9, spread: 5, root: [-0.95, -0.15], chain: 'hairLong', tex: 'silver' },
    extra: 'bun'
  },
  spectral: {
    pts: [[1.15, 0.12, 1], [0.95, -0.15], [1.22, -0.42, 1], [0.95, -0.64], [1.05, -0.96, 1], [0.58, -1.04], [0.6, -1.62, 1], [0.3, -1.14],
      [0.02, -1.98, 1], [-0.16, -1.16], [-0.62, -1.78, 1], [-0.62, -1.08], [-1.5, -1.3, 1], [-1.0, -0.72], [-1.62, -0.42, 1], [-1.15, -0.1],
      [-1.1, 0.4], [-0.78, 0.8, 1], [-0.46, 0.62],
      [-0.1, 0.2], [0.34, -0.3], [0.74, -0.14]],
    rim: 19, tex: 'spectral',
    strands: { n: 7, len: 1, w0: 3.4, w1: 9.6, spread: 5.6, root: [-1.0, -0.2], chain: 'hairLong', tex: 'spectral' },
    art: { n: 5, w0: 5, w1: 14, spread: 5, chain: 'hairArt' }   // with the Mugen art (mugen.js): its broad violet locks, streaming back
  }
};

// the hairstyle a fighter wears (null: his own spiky hair): his armour's, on his bare head only
function kageHairStyle(f) {
  const th = kageArmorTheme(f);
  return th && th.hair && f.helmet === 'topknot' ? KAGE_HAIRSTYLES[th.hair] || null : null;
}

// a strand ribbon fanned out from a chain: its points shifted to one side, more toward the tip, fluttering, cut to m
// links (a chain-like object _ksRibbon draws). root (optional) moves the whole chain so its first link sits there.
function _kaFan(c, k, m, spread, t, s, floor, root) {
  const px = [], py = [], ox = root ? root[0] - c.px[0] : 0, oy = root ? root[1] - c.py[0] : 0;
  for (let i = 0; i < m; i++) {
    const a = Math.max(0, i - 1), b = Math.min(c.n - 1, i + 1);
    let dx = c.px[b] - c.px[a], dy = c.py[b] - c.py[a]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const u = i / (c.n - 1), off = spread * 2.2 * Math.pow(u, 1.1) + Math.sin(t * 6.3 + i * 0.9 + k * 2.1) * 1.6 * s * u;
    px.push(c.px[i] + ox - dy * off); py.push(Math.min(c.py[i] + oy + dx * off, floor));
  }
  return { n: m, px, py, o: { ph: c.o.ph + k * 1.7 } };
}

// the long strands, streaming back from the head (drawn before the head, which covers their roots)
function kageArmorHairStrands(f, ctx, K) {
  // the Mugen Armor's art shows its head (and so its locks) whatever helmet he wears (mugen.js)
  const st = kageHairStyle(f) || (mugenArtOn(f, K) ? KAGE_HAIRSTYLES[K.th.hair] : null), sd = st && st.strands; if (!sd) return;
  if (sd.tex) { _kaLongHair(f, ctx, K, st, sd); return; }
  const c = _ksCloth(f, 'hair'); if (!c) return;
  const s = K.s, r = K.hr, a = f.headRot || 0, hd = f.sk.head, x = sd.root[0] * r * K.fc, y = sd.root[1] * r;
  const root = [hd.x + Math.cos(a) * x - Math.sin(a) * y, hd.y + Math.sin(a) * x + Math.cos(a) * y];
  // the locks take the armour's own colours, as the scarf does (violet, gold, rust...); white hair stays white
  const sw = [KS.scarf, KS.scarfLo, KS.scarfHi];
  if (st.fill) { KS.scarf = st.fill; KS.scarfLo = st.fillLo; KS.scarfHi = st.rimCol || KS.rim; }
  const m0 = Math.max(4, Math.round(c.n * sd.len));
  for (let k = 0; k < sd.n; k++) {
    const side = k % 2 ? -1 : 1, spread = (sd.spread * (0.4 + 0.5 * Math.ceil(k / 2))) * s * side * (k ? 1 : 0.2);
    _ksRibbon(f, ctx, K, _kaFan(c, k, Math.max(4, m0 - (k >> 1) * 2), spread, K.t, s, K.floor - 2 * s, root), sd.w0, sd.w1 * (k ? 0.82 : 1), false);
  }
  KS.scarf = sw[0]; KS.scarfLo = sw[1]; KS.scarfHi = sw[2];
}

// the ornament over the hair (head frame), lit like the hair; one colour on the flat passes
function kageHairExtra(ctx, r, K, st, flatCol) {
  if (!st.extra) return;
  const part = (pts, base, o) => {
    const P = () => _kgShape(ctx, pts.map(p => [p[0] * r, p[1] * r, p[2]]));
    if (flatCol) { ctx.fillStyle = flatCol; ctx.beginPath(); P(); ctx.fill(); return; }
    _ksPart(ctx, K, P, base, Object.assign({ red: Math.max(1, r * 0.09), redCol: st.rimCol || KS.rim, tan: Math.max(0.7, r * 0.05), tanCol: st.tan || KS.tan }, o));
  };
  const band = (pts, col) => part(pts, col, { red: Math.max(0.8, r * 0.06), redCol: KS.scarfHi });
  switch (st.extra) {
    case 'topknot':
      // Ronin: a short tuft standing up off the crown, splayed, tied at its root with a rust cord
      part([[-0.02, -0.8, 1], [0.06, -1.42], [0.02, -1.66], [-0.12, -2.14, 1], [-0.34, -1.6], [-0.68, -2.2, 1], [-0.62, -1.62], [-1.14, -1.92, 1], [-0.7, -1.3], [-0.66, -0.8, 1]], st.fill || KS.core);
      band([[0.02, -1.22, 1], [0.0, -1.44, 1], [-0.66, -1.38, 1], [-0.64, -1.16, 1]], KS.scarf);
      break;
    case 'tie':
      // Yami: the ponytail's violet tie at the back of the crown
      band([[-0.4, -0.98, 1], [-0.46, -1.3, 1], [-0.82, -1.2, 1], [-0.76, -0.9, 1]], KS.scarfHi);
      break;
    case 'bun':
      // Yūrei: a round bun on the crown, a swirl of hair round it, bound with a pale band and a pin
      part([[-0.02, -1.22], [-0.04, -1.62], [-0.36, -1.84], [-0.7, -1.68], [-0.74, -1.3], [-0.4, -1.14]], st.fill, { detail: flatCol ? null : (g) => {
        kageHairCapTex(g, r * 0.32, K, st);   // the silver strands wound round it
        g.strokeStyle = st.fillLo; g.lineWidth = Math.max(0.8, r * 0.06); g.beginPath(); g.arc(-0.38 * r, -1.46 * r, 0.2 * r, 0.4, 4.6); g.stroke();
      } });
      band([[-0.06, -1.16], [-0.1, -1.3], [-0.68, -1.26], [-0.66, -1.12]], KS.red);
      if (!flatCol) _kgLine(ctx, [[-0.9 * r, -1.62 * r], [0.12 * r, -1.36 * r]], '#c9cde4', Math.max(1, r * 0.06));
      break;
  }
}

/* ---- the long hair designed in Godot (Yūrei's silver, Mugen's spectral) ---- */
// the baked lock textures (HAIR_SHEETS): decoded once; the spectral one has its black turned to transparency, as the
// armour glow does (ArmorGlow.unblack), so it adds cleanly on the Armory's transparent cards too
const HairTex = {
  img: {}, lit: {},
  ready(name) {
    const d = typeof HAIR_SHEETS !== 'undefined' && HAIR_SHEETS[name];
    if (!d || typeof Image === 'undefined') return null;
    let im = this.img[name];
    if (!im) { im = this.img[name] = new Image(); im.src = d.img; }
    if (!(im.complete && im.naturalWidth)) return null;
    if (!this.lit[name]) this.lit[name] = d.add ? ArmorGlow.unblack(im) : im;
    return d;
  },
  preload() { if (typeof HAIR_SHEETS !== 'undefined') for (const k in HAIR_SHEETS) this.ready(k); }
};

// frame `fr` of a lock texture laid along the points M (half widths W), segment by segment: each slice of the strip
// (x along the lock) is mapped onto its segment, its upper edge on the lock's upper side U (unit vectors per point)
function _kaLockTex(ctx, name, d, fr, M, W, U) {
  _kaStrip(ctx, HairTex.lit[name], 0, (((fr % d.n) + d.n) % d.n) * d.ch, d.cw, d.ch, M, W, U);
}

// a strip of image (x0, y0, cw x ch: x along it, y across, its upper edge at y0) laid along M segment by segment
function _kaStrip(ctx, im, x0, y0, cw, ch, M, W, U) {
  const n = M.length;
  for (let i = 0; i < n - 1; i++) {
    const a = M[i], b = M[i + 1], sx = i / (n - 1) * cw, sw = cw / (n - 1), hw = Math.max(W[i], W[i + 1]) * 1.12 + 0.5;
    const ux = (U[i][0] + U[i + 1][0]) / 2, uy = (U[i][1] + U[i + 1][1]) / 2, w = Math.min(sw + 1, cw - sx);
    ctx.save();
    ctx.transform((b[0] - a[0]) / sw, (b[1] - a[1]) / sw, -ux * 2 * hw / ch, -uy * 2 * hw / ch, a[0] + ux * hw, a[1] + uy * hw);
    ctx.drawImage(im, x0 + sx, y0, w, ch, 0, 0, w, ch);
    ctx.restore();
  }
}

// one long lock along M: tapered as the scarf's tails are (full by a third of the way, to a point at the tip)
function _kaLongLock(ctx, K, st, sd, M, w0, w1, k) {
  const s = K.s, fc = K.fc, n = M.length, T = [], B = [], W = [], U = [], tex = sd.tex;
  let ex = 1, ey = 0;
  for (let i = 0; i < n; i++) {
    const a = M[Math.max(0, i - 1)], b = M[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const u = i / (n - 1), g = clamp(u / 0.34, 0, 1), grow = g * g * (3 - 2 * g), taper = u > 0.56 ? 1 - 0.95 * Math.pow((u - 0.56) / 0.44, 1.5) : 1;
    const w = lerp(w0, w1, grow) * taper * 0.5 * s, nx = -dy * fc, ny = dx * fc;   // (nx, ny): the upper side
    T.push([M[i][0] + nx * w, M[i][1] + ny * w]); B.push([M[i][0] - nx * w, M[i][1] - ny * w]); W.push(w); U.push([nx, ny]);
    ex = dx; ey = dy;
  }
  const e = n - 1, tip = [M[e][0] + ex * 6 * s, M[e][1] + ey * 6 * s];
  const path = () => { ctx.moveTo(T[0][0], T[0][1]); _ksThrough(ctx, T, 0, e); ctx.lineTo(tip[0], tip[1]); ctx.lineTo(B[e][0], B[e][1]); _ksThrough(ctx, B, e, 0); ctx.closePath(); };
  ctx.beginPath(); path();
  if (K.A.flat) { ctx.fillStyle = K.A.col; ctx.fill(); return; }
  const d = HairTex.ready(tex), fr = Math.floor(K.t * ((d && d.fps) || 10)) + k * 3;
  if (tex === 'silver') {
    // silver-white hair: the texture is the whole lock (its strands, sheen and frayed tip); a plain fill before it decodes
    if (!d) { ctx.fillStyle = st.fill; ctx.fill(); return; }
    ctx.save(); ctx.clip(); _kaLockTex(ctx, tex, d, fr, M, W, U); ctx.restore();
    return;
  }
  // spectral hair: a dark violet body fading out toward the tip, the baked light added over it, its upper edge glowing
  const gr = ctx.createLinearGradient(M[0][0], M[0][1], M[e][0], M[e][1]);
  gr.addColorStop(0, 'rgba(26,8,44,0.95)'); gr.addColorStop(0.45, 'rgba(26,8,44,0.85)'); gr.addColorStop(1, 'rgba(26,8,44,0)');
  ctx.fillStyle = gr; ctx.fill();
  if (d) { ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; _kaLockTex(ctx, tex, d, fr, M, W, U); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = KS.red; ctx.lineWidth = 0.9 * s; ctx.shadowColor = KS.red; ctx.shadowBlur = 6 * s;
  for (let i = 0; i < e; i++) {
    ctx.globalAlpha = 0.7 * (1 - i / e); ctx.beginPath(); ctx.moveTo(T[i][0], T[i][1]); ctx.lineTo(T[i + 1][0], T[i + 1][1]); ctx.stroke();
  }
  // motes of light drifting off the tip
  ctx.shadowBlur = 5 * s; ctx.fillStyle = KS.scarfHi;
  for (let j = 0; j < 3; j++) {
    const ph = (K.t * 0.9 + j / 3 + k * 0.37) % 1, wob = Math.sin(K.t * 3 + j * 2.1 + k) * 4 * s * ph;
    const x = tip[0] + ex * ph * 18 * s - ey * wob, y = tip[1] + ey * ph * 18 * s + ex * wob - ph * 6 * s;
    ctx.globalAlpha = 0.8 * (1 - ph); ctx.beginPath(); ctx.arc(x, y, (1.4 - ph * 0.8) * s, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// the long hair: the locks fanned out from the long chain as the Godot design does it, each rooted a little apart along
// the back of the head so the hair is full where it leaves it, the widest lock last (over the others)
function _kaLongHair(f, ctx, K, st, sd) {
  const art = st.art && mugenArtOn(f, K);   // the Mugen Armor's art: fewer, broader locks wearing the art's lock strip
  if (art) sd = Object.assign({}, sd, st.art);
  const c = _ksCloth(f, sd.chain); if (!c) return;
  const s = K.s, r = K.hr, a = f.headRot || 0, hd = f.sk.head, x = sd.root[0] * r * K.fc, y = sd.root[1] * r;
  const root = [hd.x + Math.cos(a) * x - Math.sin(a) * y, hd.y + Math.sin(a) * x + Math.cos(a) * y];
  for (let k = sd.n - 1; k >= 0; k--) {
    const side = k % 2 ? -1 : 1, spread = sd.spread * (0.4 + 0.5 * Math.ceil(k / 2)) * s * side * (k ? 1 : 0.2);
    const m = Math.max(4, c.n - (k >> 1) * 2), L = _kaFan(c, k, m, spread, K.t, s, K.floor - 2 * s, root);
    const lx = 0.06 * K.fc * r * 0.13 * Math.ceil(k / 2) * side, ly = -r * 0.13 * Math.ceil(k / 2) * side, M = [];
    for (let i = 0; i < m; i++) { const q = 1 - i / m * 0.6; M.push([L.px[i] + lx * q, L.py[i] + ly * q]); }
    if (art) _kaArtLock(ctx, K, M, sd.w0, sd.w1 * (k ? 0.82 : 1));
    else _kaLongLock(ctx, K, st, sd, M, sd.w0, sd.w1 * (k ? 0.82 : 1), k);
    if (art && k === 0) mugenLockTassel(f, ctx, K, M[Math.min(M.length - 1, 5)]);
  }
}

// a lock wearing the Mugen art's lock strip: the strip is the whole lock (its colours, its edges), clipped to the
// lock's taper; a plain violet fill would show only if the strip went missing
function _kaArtLock(ctx, K, M, w0, w1) {
  const s = K.s, fc = K.fc, n = M.length, T = [], B = [], W = [], U = [];
  let ex = 1, ey = 0;
  for (let i = 0; i < n; i++) {
    const a = M[Math.max(0, i - 1)], b = M[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const u = i / (n - 1), g = clamp(u / 0.3, 0, 1), grow = g * g * (3 - 2 * g), taper = u > 0.6 ? 1 - 0.9 * Math.pow((u - 0.6) / 0.4, 1.4) : 1;
    const w = lerp(w0, w1, grow) * taper * 0.5 * s, nx = -dy * fc, ny = dx * fc;
    T.push([M[i][0] + nx * w, M[i][1] + ny * w]); B.push([M[i][0] - nx * w, M[i][1] - ny * w]); W.push(w); U.push([nx, ny]);
    ex = dx; ey = dy;
  }
  const e = n - 1, tip = [M[e][0] + ex * 8 * s, M[e][1] + ey * 8 * s], r = MUGEN_PARTS.lock.r;
  ctx.save(); ctx.beginPath(); ctx.moveTo(T[0][0], T[0][1]); _ksThrough(ctx, T, 0, e); ctx.lineTo(tip[0], tip[1]); ctx.lineTo(B[e][0], B[e][1]); _ksThrough(ctx, B, e, 0); ctx.closePath();
  ctx.clip();
  _kaStrip(ctx, MugenArt.im, r[0], r[1], r[2], r[3], M, W, U);
  ctx.restore();
}

// the textured hair over the crown (head frame): the lock texture run from the brow back over the head, as the design
// lays it; the silver crown is wholly textured, the spectral one keeps its black and takes the light faintly
function kageHairCapTex(g, r, K, st) {
  const d = HairTex.ready(st.tex); if (!d) return;
  const fr = Math.floor(K.t * d.fps), sy = (fr % d.n) * d.ch, sw = d.cw * 0.55;
  g.save();
  if (d.add) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.45; }
  // x: from the brow (1.2 r) back to the nape (-1.3 r); y: from above the crown (-1.3 r) to below the ear (0.9 r)
  g.transform(-2.5 * r / sw, 0, 0, 2.2 * r / d.ch, 1.2 * r, -1.3 * r);
  g.drawImage(HairTex.lit[st.tex], 0, sy, sw, d.ch, 0, 0, sw, d.ch);
  g.restore();
}
