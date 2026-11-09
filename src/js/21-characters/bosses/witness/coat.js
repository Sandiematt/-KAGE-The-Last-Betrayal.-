/* ---- the coat (witnessBody): the long tails streaming back, the front flap, the flame curls ----
   Each tail is a cloth chain (kind 'wcoat', made in the Fighter constructor: depth -1 behind the body, +1 the front
   flap over the far thigh; pat 1 for a panel in the phase's colour). Its shape: narrow at the root, widest past the
   middle, then a long point that curls up at the tip like a blade. A patterned panel is dark at its root and the
   phase's colour beyond, with the sheets' wave pattern (rows of nested half rings) in its light tone; the True
   Witness's carries stars instead. */
const _wco = { l: new Float32Array(40), r: new Float32Array(40) };

// the edge path of a tail from link i0 to the tip (and back along the other edge). `jag`: the lower edge (Rp) is cut
// into teeth (the ragged coat of phases II-IV) and drawn straight from point to point
function _wtTailPath(ctx, n, Lp, Rp, tx, ty, i0, jag) {
  ctx.moveTo(Lp[i0 * 2], Lp[i0 * 2 + 1]);
  for (let i = i0 + 1; i < n; i++) ctx.quadraticCurveTo(Lp[i * 2 - 2], Lp[i * 2 - 1], (Lp[i * 2 - 2] + Lp[i * 2]) / 2, (Lp[i * 2 - 1] + Lp[i * 2 + 1]) / 2);
  ctx.quadraticCurveTo(Lp[(n - 1) * 2], Lp[(n - 1) * 2 + 1], tx, ty);
  if (jag) {
    for (let i = n - 1; i > i0; i--) {
      const ax = Rp[i * 2], ay = Rp[i * 2 + 1], bx = Rp[i * 2 - 2], by = Rp[i * 2 - 1], mx = (ax + bx) / 2, my = (ay + by) / 2;
      // a tooth between links i and i-1: out past the edge, pointing back toward the tip
      const cx = Lp[(i - 1) * 2] + (Rp[(i - 1) * 2] - Lp[(i - 1) * 2]) * (1 + jag), cy = Lp[(i - 1) * 2 + 1] + (Rp[(i - 1) * 2 + 1] - Lp[(i - 1) * 2 + 1]) * (1 + jag);
      ctx.lineTo(ax, ay); ctx.lineTo(lerp(cx, ax, 0.35), lerp(cy, ay, 0.35)); ctx.lineTo(mx, my);
    }
  } else {
    ctx.quadraticCurveTo(Rp[(n - 1) * 2], Rp[(n - 1) * 2 + 1], (Rp[(n - 1) * 2] + Rp[(n - 2) * 2]) / 2, (Rp[(n - 1) * 2 + 1] + Rp[(n - 2) * 2 + 1]) / 2);
    for (let i = n - 2; i > i0; i--) ctx.quadraticCurveTo(Rp[i * 2], Rp[i * 2 + 1], (Rp[i * 2] + Rp[i * 2 - 2]) / 2, (Rp[i * 2 + 1] + Rp[i * 2 - 1]) / 2);
  }
  ctx.lineTo(Rp[i0 * 2], Rp[i0 * 2 + 1]); ctx.closePath();
}

function _wtTails(f, ctx, W, depth) {
  const s = W.s, L = WT_L, t = W.t;
  for (const cl of f.cloths) {
    if (cl.kind !== 'wcoat' || cl.depth !== depth || !cl.c.init) continue;
    const c = cl.c, n = c.n, px = c.px, py = c.py, Lp = _wco.l, Rp = _wco.r;   // Rp: the lower edge, whichever way it faces
    for (let i = 0; i < n; i++) {
      const a = i === 0 ? 0 : i - 1, b = i === n - 1 ? n - 1 : i + 1;
      let dx = px[b] - px[a], dy = py[b] - py[a]; const d = (Math.sqrt(dx * dx + dy * dy) || 1) * W.fc; dx /= d; dy /= d;
      const u = i / (n - 1), w = cl.w * 0.5 * (0.28 + 0.72 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.1 + u * 0.78)), 0.75));
      Lp[i * 2] = px[i] - dy * w; Lp[i * 2 + 1] = py[i] + dx * w; Rp[i * 2] = px[i] + dy * w; Rp[i * 2 + 1] = py[i] - dx * w;
    }
    // the point: on past the last link, curling up
    const ex = px[n - 1] - px[n - 2], ey = py[n - 1] - py[n - 2], el = Math.hypot(ex, ey) || 1, curl = cl.depth < 0 ? 0.55 : 0.2;
    const tx = px[n - 1] + ex * 1.5, ty = py[n - 1] + ey * 1.5 - el * curl;
    const jag = _wtLookKey !== 'robe' && _wtLookKey >= 1 && depth < 0 ? (_wtLookKey >= 2 ? 0.5 : 0.32) : 0;
    const path = (g, i0) => _wtTailPath(g, n, Lp, Rp, tx, ty, i0, jag);
    const pat = cl.pat && !W.A.flat, far = depth < 0 && !cl.pat && cl.low;
    const tone = pat ? L.panel : far ? WT_FAR : L.bodyInk;
    _wtPart(ctx, W, () => path(ctx, 0), tone, { lw: W.lw, line: L.line, sd: cl.w * 0.22, hd: 1 * s, detail: W.A.flat ? null : (g) => {
      if (pat) {
        // dark at the root, the phase's colour past it, the wave pattern over the coloured part
        const k = Math.max(1, Math.floor(n * 0.28));
        g.fillStyle = L.bodyInk[1]; g.beginPath(); _wtTailRoot(g, n, Lp, Rp, k); g.fill();
        _wtWaves(g, c, Lp, Rp, n, k, cl.w, s, t);
        _wtLine(g, W, [[lerp(Lp[k * 2], Rp[k * 2], -0.1), lerp(Lp[k * 2 + 1], Rp[k * 2 + 1], -0.1)], [lerp(Lp[k * 2], Rp[k * 2], 1.1), lerp(Lp[k * 2 + 1], Rp[k * 2 + 1], 1.1)]], L.line, 1 * s);
        if (jag) { g.strokeStyle = L.flame[1]; g.lineWidth = 5 * s; g.lineJoin = 'miter'; g.beginPath(); path(g, k); g.stroke(); g.lineJoin = 'round'; }
      } else {
        // a dark panel: a lining of the phase's colour down its lower edge, a pale fold
        const lo = (Lp[(n >> 1) * 2 + 1] > Rp[(n >> 1) * 2 + 1]) ? Lp : Rp, hi = lo === Lp ? Rp : Lp;
        g.strokeStyle = L.panel[1]; g.lineWidth = 2.6 * s; g.beginPath(); g.moveTo(lo[2], lo[3]);
        for (let i = 2; i < n; i++) g.lineTo(lo[i * 2], lo[i * 2 + 1]);
        g.lineTo(tx, ty); g.stroke();
        g.strokeStyle = L.bodyInk[2]; g.lineWidth = 0.9 * s; g.beginPath();
        for (let i = 2; i < n - 1; i++) { const x = lerp(hi[i * 2], lo[i * 2], 0.42), y = lerp(hi[i * 2 + 1], lo[i * 2 + 1], 0.42); i === 2 ? g.moveTo(x, y) : g.lineTo(x, y); }
        g.stroke();
      }
    } });
  }
}

// the root span of a tail (links 0..k), to darken it
function _wtTailRoot(g, n, Lp, Rp, k) {
  g.moveTo(Lp[0], Lp[1]); for (let i = 1; i <= k; i++) g.lineTo(Lp[i * 2], Lp[i * 2 + 1]);
  for (let i = k; i >= 0; i--) g.lineTo(Rp[i * 2], Rp[i * 2 + 1]); g.closePath();
}

// the wave pattern (seigaiha): rows of three nested half rings across the panel, opening toward its tip; stars and
// specks on the True Witness's cosmic coat
function _wtWaves(g, c, Lp, Rp, n, k, w, s, t) {
  const px = c.px, py = c.py, r = w * 0.15, cosmic = _wtLookKey === 3;
  g.strokeStyle = WT_L.pat; g.fillStyle = WT_L.pat; g.lineWidth = 1.1 * s; g.lineCap = 'butt';
  for (let i = k; i < n; i++) {
    const a = Math.min(i, n - 2), ang = Math.atan2(py[a + 1] - py[a], px[a + 1] - px[a]);
    const cols = (i - k) % 2 ? [0.25, 0.75] : [0.5];
    for (const q of cols) {
      const ox = lerp(Lp[i * 2], Rp[i * 2], q), oy = lerp(Lp[i * 2 + 1], Rp[i * 2 + 1], q);
      if (cosmic) {
        const z = (1.1 + 1.4 * _hash(i * 3.1 + q * 7)) * s * (0.85 + 0.15 * Math.sin(t * 3 + i));
        g.beginPath(); g.moveTo(ox, oy - z * 2.2); g.lineTo(ox + z * 0.4, oy); g.lineTo(ox, oy + z * 2.2); g.lineTo(ox - z * 0.4, oy); g.closePath(); g.fill();
        g.fillRect(ox + z * 3, oy + z * 2, 1.2 * s, 1.2 * s);
      } else for (const m of [1, 0.66, 0.33]) { g.beginPath(); g.arc(ox, oy, r * m, ang - Math.PI / 2, ang + Math.PI / 2); g.stroke(); }
    }
  }
  g.lineCap = 'round';
}

// the flame curls behind the shoulders: tapered tongues of the phase's colour swept back, each ending in a hook
// (two on the Observer, three on the Manipulator and the Reality Editor, four on the True Witness)
const WT_FLAMES = [
  { u: 0.96, w: -9, pts: [[0, 0], [-16, 4], [-34, 2], [-48, -6], [-52, -16], [-44, -20], [-40, -13]], wid: 15, ph: 0 },
  { u: 0.58, w: -11, pts: [[0, 0], [-18, 6], [-38, 8], [-54, 4], [-60, -6], [-52, -10], [-48, -4]], wid: 14, ph: 1.7 },
  { u: 1.2, w: -14, pts: [[0, 0], [-12, -8], [-26, -18], [-42, -22], [-50, -16], [-46, -10], [-40, -14]], wid: 12, ph: 3.1 },
  { u: 0.3, w: -12, pts: [[0, 0], [-20, 10], [-42, 16], [-58, 12], [-64, 2], [-56, -2], [-52, 4]], wid: 12, ph: 4.4 }
];
function _wtFlames(f, ctx, W) {
  if (W.A.flat) return;   // light, not cloth: no part of the silhouette
  const s = W.s, L = WT_L, fc = W.fc, t = W.t, P = _wtP(W), up = [W.S.ux, W.S.uy], bk = [-W.S.nx, -W.S.ny];
  const count = [2, 3, 3, 4][_wtLookKey] || 0;
  ctx.save(); ctx.globalAlpha *= W.fade;
  for (let k = 0; k < count; k++) {
    const F = WT_FLAMES[k], o = P(F.u, F.w), pts = F.pts.map(([x, y], i) => {
      const sw = Math.sin(t * 2.2 + F.ph + i * 0.6) * i * 0.7;
      return [o[0] - bk[0] * x * s - up[0] * (y + sw) * s, o[1] - bk[1] * x * s - up[1] * (y + sw) * s];
    });
    const path = () => _wtRibbonPath(ctx, pts, F.wid * s, 1.6 * s);
    ctx.lineJoin = 'round';
    ctx.beginPath(); path(); ctx.fillStyle = L.flame[0]; ctx.fill();
    ctx.save(); ctx.clip(); ctx.translate(-bk[0] * 0 + up[0] * 2.4 * s, up[1] * 2.4 * s); ctx.beginPath(); path(); ctx.fillStyle = L.flame[1]; ctx.fill(); ctx.restore();
    ctx.beginPath(); path(); ctx.strokeStyle = L.line; ctx.lineWidth = W.lw * 0.9; ctx.stroke();
  }
  ctx.restore();
}
