/* ---- Kage's shadow head: the black face in profile (a brow, a short nose, a pointed chin) and the hair, long sharp
   spikes swept up and back off the crown with a fringe thrown forward over the brow. Both in the head frame: head
   units, +x the face side, -y up. The crimson light runs along the upper edge of every spike, the tan along its
   underside, as on the reference sheet. ---- */
function _ksFacePath(ctx, r) {
  ctx.moveTo(-r * 0.94, r * 0.12);
  ctx.bezierCurveTo(-r * 1.02, -r * 0.76, -r * 0.42, -r * 1.06, r * 0.12, -r * 1.03);   // the crown
  ctx.bezierCurveTo(r * 0.66, -r * 0.98, r * 0.96, -r * 0.6, r * 0.95, -r * 0.2);       // the brow
  ctx.lineTo(r * 0.93, r * 0.04);                                                       // the bridge of the nose
  ctx.lineTo(r * 1.13, r * 0.36);                                                       // its tip
  ctx.lineTo(r * 0.94, r * 0.45);
  ctx.lineTo(r * 0.97, r * 0.6);                                                        // the lips
  ctx.lineTo(r * 0.88, r * 0.7);
  ctx.quadraticCurveTo(r * 0.86, r * 0.98, r * 0.6, r * 1.1);                           // the chin
  ctx.quadraticCurveTo(r * 0.1, r * 0.98, -r * 0.36, r * 0.72);                         // the jaw
  ctx.quadraticCurveTo(-r * 0.82, r * 0.6, -r * 0.94, r * 0.12);
  ctx.closePath();
}

// the face (called inside the head frame): the same black as the body, a thin warm edge down the profile
function _ksFace(f, ctx, K) {
  const r = K.hr * 0.9, sv = _ksLightIn(K, f.headRot || 0, 0, 0, -K.fc, 0.1);   // the tan strip on the front of the face
  _ksPart(ctx, K, () => _ksFacePath(ctx, r), ANIME.face, { tan: 0.9 * K.s });
  _ksLightOut(K, sv);
}

// tip / valley pairs (the flagged points are tips); the last three close the hairline inside the head, above the eye
const KS_HAIR = [[1.3, 0.2, 1], [0.98, -0.1], [1.56, -0.16, 1], [1.02, -0.52], [1.4, -0.86, 1], [0.8, -0.92],
  [0.88, -1.64, 1], [0.36, -1.1], [-0.5, -2.18, 1], [-0.3, -1.18], [-1.58, -1.8, 1], [-0.84, -0.94],
  [-2.22, -1.12, 1], [-1.1, -0.54], [-2.12, -0.2, 1], [-1.08, -0.02], [-1.74, 0.36, 1], [-0.92, 0.36],
  [-1.16, 0.88, 1], [-0.46, 0.6],
  [-0.1, 0.2], [0.34, -0.3], [0.74, -0.14]];
const KS_HAIR_RIM = 20;   // the points that carry the spikes (the rest close the shape inside the head)
// his own hair as a style; an armour may give him another (KAGE_HAIRSTYLES, ../armory/hair.js)
const KS_HAIR_STYLE = { pts: KS_HAIR, rim: KS_HAIR_RIM, own: true };

// the points this frame: the tips sway a little, and lean back with his speed
function _ksHairPts(r, f, st) {
  const t = (f && f.time) || 0, vx = f ? clamp((f.vx || 0) * (f.facing || 1) / 600, -1, 1) : 0;
  return st.pts.map((p, i) => p[2] ? [(p[0] + Math.sin(t * 2.6 + i * 1.7) * 0.024 * Math.abs(p[0]) - vx * 0.08 * Math.max(0, -p[1])) * r, (p[1] + Math.cos(t * 2.1 + i) * 0.016) * r, 1] : [p[0] * r, p[1] * r]);
}

// the spikes: each edge bows a little up and back, so they read swept rather than a crown of thorns
function _ksHairPath(ctx, pts, r, n) {
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < n; i++) {
    const p = pts[i], q = pts[i - 1];
    ctx.quadraticCurveTo((p[0] + q[0]) / 2 - 0.05 * r, (p[1] + q[1]) / 2 - 0.045 * r, p[0], p[1]);
  }
  for (let i = n; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

// Kage's hair in this design (drawKageHair, ../hair.js, hands over to it): called in the head frame
function drawShadowHair(ctx, r, ink, flat, f) {
  if (f && !flat && f._A && mugenArtOn(f, _ksK) && _ksK.f === f) { mugenHead(ctx, r); return; }   // the Mugen Armor's art (../armory/mugen.js)
  const st = (f && kageHairStyle(f)) || KS_HAIR_STYLE, fill = st.fill || KS.core;
  const A = f && f._A, pts = _ksHairPts(r, f, st), P = () => _ksHairPath(ctx, pts, r, st.rim);
  if (flat || !A || A.flat) {
    const col = flat ? ink : A ? fill : ink;
    ctx.fillStyle = col; ctx.beginPath(); P(); ctx.fill();
    kageHairExtra(ctx, r, _ksK, st, col);
    return;
  }
  const K = _ksK, s = f.scale, fc = f.facing, keep = [K.A, K.fc, K.s];
  K.A = A; K.fc = fc; K.s = s;
  // crimson along the top of each spike (and the front of the fringe), tan along the underside
  const sv = _ksLightIn(K, f.headRot || 0, -fc * 0.3, 0.95, fc * 0.34, -0.94);
  _ksPart(ctx, K, P, fill, { red: Math.max(1.1, r * 0.1), redCol: st.rimCol, tan: Math.max(0.7, r * 0.05), tanCol: st.tan, detail: !st.own ? (st.tex ? (g) => kageHairCapTex(g, r, K, st) : null) : (g) => {
    // two dark crimson strands where the spikes part, low at the back of the head
    g.fillStyle = KS.redLo;
    for (const [a, b, c] of [[[-0.5, 0.1], [-1.5, 0.06], [-0.6, 0.24]], [[-0.3, -0.3], [-1.6, -0.62], [-0.44, -0.14]]]) {
      g.beginPath(); g.moveTo(a[0] * r, a[1] * r); g.lineTo(b[0] * r, b[1] * r); g.lineTo(c[0] * r, c[1] * r); g.closePath(); g.fill();
    }
  }, after: (g) => {
    // the hairline inside the head carries no light: only the spikes do
    g.strokeStyle = fill; g.lineWidth = Math.max(3, r * 0.24); g.lineCap = 'butt'; g.lineJoin = 'round'; g.beginPath();
    for (let i = st.rim - 1; i < pts.length; i++) i === st.rim - 1 ? g.moveTo(pts[i][0], pts[i][1]) : g.lineTo(pts[i][0], pts[i][1]);
    g.stroke(); g.lineCap = 'round';
  } });
  kageHairExtra(ctx, r, K, st, null);   // the style's tie, bun or bead
  _ksLightOut(K, sv);
  K.A = keep[0]; K.fc = keep[1]; K.s = keep[2];
}
