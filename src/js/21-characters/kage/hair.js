/* ---- the spiky starburst (KAGE_HAIR, drawSpikeHair: Rem's since the hair swap), and Kage's own hair (drawKageHair) ---- */
// tip / valley pairs in head units (+x the face side); the last points close the hairline from the nape to the brow
const KAGE_HAIR = [[0.52, -0.5], [1.08, 0.02], [0.82, -0.56], [1.3, -0.5], [0.84, -0.86], [1.0, -1.36], [0.42, -1.06], [0.08, -1.8], [-0.02, -1.1],
  [-0.78, -1.74], [-0.5, -1.0], [-1.56, -1.36], [-0.88, -0.66], [-2.08, -0.66], [-1.02, -0.3], [-1.86, 0.2], [-0.96, 0.12], [-1.42, 0.7],
  [-0.78, 0.44], [-0.9, 1.0], [-0.44, 0.62]];

function kageHairPath(ctx, r) {
  const H = KAGE_HAIR;
  ctx.moveTo(H[0][0] * r, H[0][1] * r);
  for (let i = 1; i < H.length; i++) {
    const p = H[i], q = H[i - 1];
    // edges bow back and up so the spikes read swept, not a crown
    ctx.quadraticCurveTo((p[0] + q[0]) / 2 * r - 0.12 * r, (p[1] + q[1]) / 2 * r - 0.07 * r, p[0] * r, p[1] * r);
  }
  ctx.quadraticCurveTo(-0.2 * r, 0.2 * r, 0.05 * r, -0.2 * r);
  ctx.quadraticCurveTo(0.25 * r, -0.45 * r, H[0][0] * r, H[0][1] * r);
  ctx.closePath();
}

/* ---- Kage's hair: long sharp spikes swept up and back off the crown, two short ones thrown forward over the brow, a
   lock in front of the ear. One shape, tip then valley, in head units (+x the face side, -y up); the tips sway a
   little. Every place that draws Kage's head calls drawKageHair (his helmets draw it under them too). ---- */
const KG_HAIR = [[1.12, -0.14, 1], [0.86, -0.56], [1.32, -0.74, 1], [0.66, -0.92], [0.3, -1.74, 1], [0.09, -1.08], [-0.73, -1.83, 1], [-0.48, -0.99],
  [-1.67, -1.31, 1], [-0.92, -0.6], [-2.18, -0.36, 1], [-1.05, -0.07], [-1.74, 0.6, 1], [-0.89, 0.41], [-0.94, 1.04, 1], [-0.45, 0.6],
  [-0.2, 0.06], [0.24, -0.34], [0.6, -0.4]];
const KG_HAIR_RIM = 15;   // the points that carry the outline (the rest close the shape inside the head)
// the lock in front of the ear, and the lit shards laid along the long edge of the upper spikes: [the valley before, the tip]
const KG_LOCK = [[0.3, -0.6], [0.36, -0.1], [0.14, 0.52, 1], [0.04, 0.02], [-0.2, 0.4, 1], [-0.3, -0.4]];
const KG_SHINE = [[3, 4], [5, 6], [7, 8], [9, 10]];

function _kgHairPts(r, f) {
  const t = (f && f.time) || 0, vx = f ? clamp((f.vx || 0) * (f.facing || 1) / 600, -1, 1) : 0;
  return KG_HAIR.map((p, i) => p[2] ? [(p[0] + Math.sin(t * 2.6 + i * 1.7) * 0.022 * Math.abs(p[0]) - vx * 0.07 * Math.max(0, -p[1])) * r, (p[1] + Math.cos(t * 2.1 + i) * 0.014) * r, 1] : [p[0] * r, p[1] * r]);
}

function drawKageHair(ctx, r, ink, flat, f) {
  if (f && kageShadowOn(f)) { drawShadowHair(ctx, r, ink, flat, f); return; }   // the silhouette design's hair (shadow/head.js)
  const A = f && f._A, pts = _kgHairPts(r, f);
  if (flat || !A || A.flat) {
    ctx.fillStyle = flat ? ink : A ? KG.hair[1] : ink;
    ctx.beginPath(); orderShape(ctx, 1, pts); ctx.fill();
    ctx.beginPath(); orderShape(ctx, r, KG_LOCK); ctx.fill();
    return;
  }
  const sv = _headLight(A, f);
  celFill(ctx, () => orderShape(ctx, 1, pts), KG.hair, A, { sd: r * 0.3, hd: 0, rim: true, seam: false, detail: (g) => {
    // flat shards of light laid along the upper spikes
    g.fillStyle = KG.hair[2];
    for (const [vi, ti] of KG_SHINE) {
      const v = pts[vi], tp = pts[ti], w = pts[ti + 1], a = _kgMix(v, tp, 0.2), b = _kgMix(v, tp, 0.88), c = _kgMix(_kgMix(v, w, 0.42), tp, 0.34);
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.closePath(); g.fill();
    }
  } });
  // the fine line round the spikes (not across the hairline, which sits on the black face)
  ctx.lineJoin = 'miter'; ctx.miterLimit = 4; ctx.strokeStyle = KG.line; ctx.lineWidth = Math.max(0.7, r * 0.045);
  ctx.beginPath();
  for (let i = 0; i < KG_HAIR_RIM; i++) {
    const p = pts[i], q = pts[i + 1];
    if (i === 0) ctx.moveTo(p[0], p[1]);
    if (q[2]) ctx.lineTo(q[0], q[1]); else if (i + 2 < pts.length && i + 1 < KG_HAIR_RIM) { const n = pts[i + 2]; ctx.quadraticCurveTo(q[0], q[1], (q[0] + n[0]) / 2, (q[1] + n[1]) / 2); }
  }
  ctx.stroke();
  celFill(ctx, () => orderShape(ctx, r, KG_LOCK), KG.hair, A, { sd: r * 0.1, hd: 0, seam: false });
  ctx.lineJoin = 'round';
  A.lx = sv[0]; A.ly = sv[1];
}

// the spiky starburst (now Rem's: bosses/rem/head.js)
function drawSpikeHair(ctx, r, ink, flat, f) {
  const A = f && f._A, pal = A && A.pal;
  if (flat || !A || A.flat) { ctx.fillStyle = flat ? ink : (pal ? pal.hair[1] : ink); ctx.beginPath(); kageHairPath(ctx, r); ctx.fill(); return; }
  // celFill works in the rotated head frame, so the light is turned into it too
  const sv = [A.lx, A.ly], hl = f.headRot || 0, c = Math.cos(-hl), sn = Math.sin(-hl);
  A.lx = (sv[0] * c - sv[1] * sn) * A.f; A.ly = sv[0] * sn + sv[1] * c;
  celFill(ctx, () => kageHairPath(ctx, r), pal.hair, A, { sd: r * 0.32, hd: r * 0.06, rim: true, detail: (g) => {
    // a few lit strands from the crown out along the upper spikes
    g.strokeStyle = pal.hair[2]; g.lineWidth = Math.max(0.8, r * 0.05); g.lineCap = 'round';
    g.beginPath();
    for (const [x0, y0, x1, y1, cx, cy] of [[0.2, -0.75, 1.1, -1.3, 0.7, -1.15], [0.0, -0.8, 0.26, -1.68, 0.05, -1.3], [-0.3, -0.72, -1.2, -1.32, -0.75, -1.15], [-0.4, -0.45, -1.75, -0.74, -1.1, -0.68], [0.35, -0.6, 1.3, -0.6, 0.85, -0.7]]) {
      g.moveTo(x0 * r, y0 * r); g.quadraticCurveTo(cx * r, cy * r, x1 * r, y1 * r);
    }
    g.stroke();
  } });
  A.lx = sv[0]; A.ly = sv[1];
}
