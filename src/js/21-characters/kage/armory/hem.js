/* ---- the armour's hem (see _themes.js): how the coat's back tail is cut, and the art painted along it. Both work on the
   tail's hem as ../shadow/coat.js hands it over: H(h) a point along it (0 the low corner by the shin, 1 the far tip
   streaming out behind), N(h) = [point, along x, along y, in x, in y] (in: toward the waist), q the hem's scale (px).
   at(h, d) below is the point d px out past the hem (negative: in from it). ---- */

function _kaAt(N, h, d, floor, hang) {
  const [o, , , ux, uy] = N(clamp(h, 0, 1));
  if (!(hang > 0 && d > 0)) return [o[0] - ux * d, Math.min(o[1] - uy * d, floor)];
  // a tooth hangs: its way out leans toward straight down, as cut cloth falls
  let vx = -ux, vy = -uy + hang; const l = Math.hypot(vx, vy) || 1; vx /= l; vy /= l;
  return [o[0] + vx * d, Math.min(o[1] + vy * d, floor)];
}

// the cut hem: points from the low corner to the far tip, in teeth of the theme's kind. The teeth are of uneven width,
// grow much longer toward the far tip (where the coat streams out), lean down as cloth falls, and sweep back toward
// the tip so each one overlaps the next like a strip of torn cloth
//   rags     torn strips of uneven length, some split at the end (Ronin)
//   shards   long tapering blades, long and short in turn (Yami, Shinsen, Raikō)
//   flames   tongues that hook back toward the tip and flicker (Kagehira, Mugen)
//   tatters  long thin ribbons that sway (Yūrei)
function kageArmorHemPts(th, H, N, q, K) {
  const n = th.teeth || 6, t = K.t, floor = K.floor - 1 * K.s, out = [H(0)], kind = th.hem;
  const at = (h, d) => _kaAt(N, h, d, floor, 0.75);
  // uneven tooth widths: the edges of the teeth along the hem
  const cuts = [0]; let sum = 0;
  for (let i = 0; i < n; i++) cuts.push(sum += 0.7 + 0.6 * _kaHash(i * 5.7 + n * 1.3));
  for (let i = 0; i <= n; i++) cuts[i] /= sum;
  for (let i = 0; i < n; i++) {
    const h0 = cuts[i], w = cuts[i + 1] - h0, r = _kaHash(i * 7.31 + n), r2 = _kaHash(i * 3.17 + 9.4);
    // the first tooth starts at the corner itself; the others from a notch cut a little in
    if (i > 0) out.push(at(h0, -(kind === 'rags' ? 2 + 4 * r2 : kind === 'tatters' ? 3 : 2.4) * q));
    const grow = 0.4 + 1.2 * Math.pow((i + 0.5) / n, 1.3);
    if (kind === 'rags') {
      const L = (12 + 18 * r) * grow * q, sw = Math.sin(t * 2.7 + i * 1.9) * 0.12 * w;
      if (r2 > 0.5) out.push(at(h0 + w * 0.2, L * 0.3), at(h0 + w * 0.62 + sw, L), at(h0 + w * 0.7 + sw, L * 0.6), at(h0 + w * 0.92 + sw, L * 0.88), at(h0 + w * 0.9, L * 0.2));
      else out.push(at(h0 + w * 0.24, L * 0.26), at(h0 + w * (0.8 + 0.2 * r2) + sw, L), at(h0 + w * (0.92 + 0.1 * r) + sw, L * 0.74), at(h0 + w * 0.9, L * 0.2));
    } else if (kind === 'shards') {
      const L = (i % 2 ? 14 : 26) * (0.8 + 0.4 * r) * grow * q;
      out.push(at(h0 + w * 0.1, L * 0.14), at(h0 + w * (1.05 + 0.3 * r2), L), at(h0 + w * 0.92, L * 0.22));
    } else if (kind === 'flames') {
      const L = (16 + 12 * r) * grow * q * (1 + 0.14 * Math.sin(t * 7.3 + i * 2.3)), cu = 0.12 * Math.sin(t * 4.1 + i * 1.3);
      out.push(at(h0 + w * 0.14, L * 0.32), at(h0 + w * 0.46, L * 0.7), at(h0 + w * (1.0 + cu), L), at(h0 + w * 0.72, L * 0.56), at(h0 + w * 0.94, L * 0.26));
    } else {   // tatters: a long ribbon that waves along its length, out one side and back up the other
      const L = (18 + 20 * r) * grow * q, ph = t * 2.4 + i * 1.6, wv = (k) => Math.sin(ph - k * 3.2) * 0.22 * w * k;
      for (const k of [0.3, 0.55, 0.8]) out.push(at(h0 + w * (0.22 + 0.36 * k) + wv(k), L * k));
      out.push(at(h0 + w * 0.62 + wv(1), L), at(h0 + w * 0.76 + wv(0.95), L * 0.94));
      for (const k of [0.7, 0.42]) out.push(at(h0 + w * (0.62 + 0.3 * k) + wv(k), L * k * 0.9));
      out.push(at(h0 + w * 0.92, L * 0.18));
    }
  }
  out.push(H(1));
  return out;
}

/* ---- the hem art (called inside the tail's clip, under its lights). K.hem = { H, N, q, apex, rag } ---- */
function kageArmorHem(g, K, th) {
  const { N, q } = K.hem, s = K.s, t = K.t, floor = 1e9;
  const at = (h, d) => _kaAt(N, h, d, floor);
  // a band along the hem from `out` px outside it (60: over the cut teeth, clipped to the tail; 0: from the hem line,
  // leaving the teeth in the coat's cloth) to depth(h) px in from it
  const band = (depth, col, out) => {
    const o = out == null ? 60 : out;
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i <= 24; i++) { const p = _kaAt(N, i / 24 * 1.06 - 0.03, o * q, floor, 0.75); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
    for (let i = 24; i >= 0; i--) { const h = i / 24 * 1.06 - 0.03, p = at(h, -depth(h) * q); g.lineTo(p[0], p[1]); }
    g.closePath(); g.fill();
  };
  // the cut edge itself in a colour (teeth left in cloth get a coloured fringe)
  const fringe = (col, lw) => { const rag = K.hem.rag; if (rag) line(rag, col, lw * s); };
  const glow = (on) => { if (th.glow && on) { g.shadowColor = th.glow; g.shadowBlur = 7 * s; } else g.shadowBlur = 0; };
  const line = (pts, col, lw) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
  // the far tip runs to solid colour as on the plain coat (_ksBandD), so every cut keeps its line
  const tipD = (h) => { const k = clamp((h - 0.7) / 0.3, 0, 1); return 16 * k * k * (3 - 2 * k); };
  switch (th.motif) {
    case 'rope': {
      // a rust band over the torn teeth, scorched patches, and a twisted rope stitched across the tail above it
      band(() => 0, KS.redLo);
      band((h) => 3 + tipD(h) * 0.6, KS.red, 0);
      fringe(KS.red, 1.6);
      for (const [h, d, r] of [[0.22, 6, 3.2], [0.47, 5, 2.6], [0.66, 7, 3.6]]) {
        const p = at(h, -d * q); g.fillStyle = KS.redLo; g.beginPath(); g.ellipse(p[0], p[1], r * 1.6 * q, r * q, 0, 0, TAU); g.fill();
      }
      const ra = [], rb = [];
      for (let i = 0; i <= 18; i++) { const h = 0.04 + i / 18 * 0.86; ra.push(at(h, -11 * q)); rb.push(at(h, -15.5 * q)); }
      line(ra, KS.beltHi, 1.1 * s); line(rb, KS.beltHi, 1.1 * s);
      g.strokeStyle = KS.beltHi; g.lineWidth = 0.9 * s; g.beginPath();
      for (let i = 0; i < 18; i++) { g.moveTo(ra[i][0], ra[i][1]); g.lineTo(rb[i + 1][0], rb[i + 1][1]); }
      g.stroke();
      // tears running up from the notches
      for (const h of [0.33, 0.55, 0.78]) line([at(h, 0), at(h + 0.02, -9 * q), at(h - 0.01, -17 * q)], KS.coatLo, 1.2 * s);
      break;
    }
    case 'tomoe': {
      // a thin violet edge that glows, and the tomoe: a swirl with a sweeping tail, and a smaller one near the tip
      band(() => 0, KS.redLo);
      glow(true);
      band((h) => 2.2 + tipD(h) * 0.35, KS.red, 0);
      fringe(KS.red, 2);
      g.fillStyle = KS.red; g.strokeStyle = KS.red;
      _ksScroll(g, N, 0.44, 9.5 * q, 14 * q);
      _ksScroll(g, N, 0.74, 5.6 * q, 10 * q);
      line([at(0.3, -26 * q), at(0.45, -33 * q), at(0.62, -30 * q), at(0.72, -22 * q)], KS.red, 1.3 * s);
      glow(false);
      break;
    }
    case 'wards': {
      // red ink wards on the white silk: thorned flames rising from the hem, splashes above them, a red tip
      band((h) => 2.4 + tipD(h), KS.red, 0);
      fringe(KS.red, 1.8);
      g.fillStyle = KS.red;
      for (const [h, R] of [[0.18, 1], [0.42, 1.25], [0.66, 1.05]]) {
        const sp = [[-0.07, 0], [-0.05, 14], [-0.03, 6], [0, 24], [0.02, 8], [0.05, 17], [0.06, 4], [0.075, 0]];
        g.beginPath(); sp.forEach(([dh, d], i) => { const p = at(h + dh * R, -(4 + d * R) * q); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); g.fill();
      }
      g.fillStyle = KS.redLo;
      for (const [h, d, r] of [[0.3, 30, 1.6], [0.55, 36, 1.2], [0.36, 40, 0.9], [0.8, 26, 1.4]]) { const p = at(h, -d * q); g.beginPath(); g.arc(p[0], p[1], r * q, 0, TAU); g.fill(); }
      g.strokeStyle = KS.red;
      for (const [h, d] of [[0.27, 28], [0.52, 33]]) line([at(h, -d * q), at(h + 0.03, -(d + 7) * q), at(h + 0.07, -(d + 6) * q)], KS.red, 1.6 * s);
      break;
    }
    case 'lightning': {
      // a gold edge, and bolts branching up from the hem that re-strike a few times a second
      band(() => 0, KS.redLo);
      glow(true);
      band((h) => 1.8 + tipD(h) * 0.3, KS.red, 0);
      fringe(KS.red, 1.8);
      const seed = Math.floor(t * 5);
      for (let b = 0; b < 4; b++) {
        const h0 = 0.12 + b * 0.24 + (_kaHash(seed * 1.3 + b) - 0.5) * 0.06, len = 22 + 18 * _kaHash(b * 5.1 + seed), pts = [at(h0, 0)];
        let h = h0;
        for (let k = 1; k <= 6; k++) { h += (_kaHash(seed * 7 + b * 13 + k) - 0.5) * 0.08; pts.push(at(h, -len * k / 6 * q)); }
        line(pts, KS.red, 1.7 * s);
        line([pts[3], at(h + 0.06, -len * 0.62 * q), at(h + 0.1, -len * 0.82 * q)], KS.red, 1.1 * s);   // a fork off it
        g.shadowBlur = 0; line(pts, '#fff4c8', 0.6 * s); glow(true);
      }
      glow(false);
      break;
    }
    case 'flames':
    case 'violetfire': {
      // the lower tail burning: tongues of colour rising from the hem and hooking back toward the tip, cut through with
      // black flames; the Mugen's burns violet, glows, and sends thin energy veins up the coat
      const vi = th.motif === 'violetfire', fl = (h) => {
        let d = 6 + tipD(h) * 0.6;
        for (let j = 0; j < 5; j++) {
          const c = 0.1 + j * 0.2 + 0.03 * Math.sin(t * 2.3 + j), k = 1 - Math.abs(h - c) / 0.1;
          if (k > 0) d = Math.max(d, 6 + (13 + 7 * _kaHash(j + 2)) * Math.pow(k, 1.6) * (1 + 0.15 * Math.sin(t * 6.1 + j * 1.7)));
        }
        return d;
      };
      glow(true);
      band(fl, KS.red);
      glow(false);
      // black flame cut-outs inside the burning band
      g.fillStyle = KS.coat;
      for (const [h, d, L] of [[0.26, 3, 8], [0.5, 4, 10], [0.73, 3, 8]]) {
        g.beginPath(); const a = at(h - 0.035, -d * q), b = at(h + 0.05, -(d + L) * q), c = at(h + 0.03, -d * q);
        g.moveTo(a[0], a[1]); g.quadraticCurveTo(at(h - 0.02, -(d + L * 0.7) * q)[0], at(h - 0.02, -(d + L * 0.7) * q)[1], b[0], b[1]); g.lineTo(c[0], c[1]); g.closePath(); g.fill();
      }
      // a brighter core along the burning edge
      const core = []; for (let i = 0; i <= 24; i++) { const h = i / 24; core.push(at(h, -(fl(h) - 1.2) * q)); }
      line(core, vi ? KS.scarfHi : '#ff8a6a', 1 * s);
      if (vi) {
        glow(true);
        for (const [h, L] of [[0.2, 34], [0.46, 42], [0.7, 30]]) {
          const pts = []; for (let k = 0; k <= 8; k++) pts.push(at(h + 0.04 * Math.sin(k * 1.3 + t * 2 + h * 9), -(fl(h) + L * k / 8) * q));
          line(pts, KS.red, 0.9 * s);
        }
        glow(false);
      } else {
        g.fillStyle = KS.red;
        for (const [h, d, r] of [[0.32, 26, 1.4], [0.58, 31, 1.1], [0.62, 24, 0.8], [0.85, 22, 1.2]]) { const p = at(h, -d * q); g.beginPath(); g.arc(p[0], p[1], r * q, 0, TAU); g.fill(); }
      }
      break;
    }
    case 'spirit': {
      // blue spirit clouds on the pale silk: a thin band, scrolls along the hem and smaller ones drifting higher, and
      // two lines of spirit script running up the tail
      band((h) => 1.6 + tipD(h) * 0.4, KS.red, 0);
      fringe(KS.red, 2.2);
      g.fillStyle = KS.red; g.strokeStyle = KS.red;
      for (const [h, R, d] of [[0.14, 5.6, 4], [0.34, 7, 4], [0.56, 6.4, 4], [0.76, 5, 4], [0.28, 3.6, 22], [0.62, 4, 26]]) _ksScroll(g, N, h, R * q, d * q);
      for (const h of [0.45, 0.85]) {
        const pts = []; for (let k = 0; k <= 10; k++) pts.push(at(h + 0.025 * Math.sin(k * 1.4), -(14 + k * 3.2) * q));
        line(pts, KS.redLo, 1 * s);
      }
      break;
    }
  }
  g.shadowBlur = 0;
}
