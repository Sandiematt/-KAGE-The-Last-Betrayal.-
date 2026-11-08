/* ---- the head: wind-swept hair, the white band and its ring ---- */
// tip / valley pairs in head units (+x the face side). Kage's hair is a starburst, points thrown in every direction
// including forward over the brow; Rem's is a back-swept wedge: no forward points, the crown lower (tallest -1.56,
// Kage's -1.8) and the long points laid back past the nape (to -2.26), every edge bowed up and back as in the portrait
const REM_HAIR = [[0.62, -0.4], [0.9, -0.86], [0.2, -1.56], [0.12, -1.02], [-0.6, -1.58], [-0.42, -0.96], [-1.38, -1.38], [-0.86, -0.72], [-2.1, -0.98],
  [-1.04, -0.4], [-2.26, -0.34], [-1.08, -0.06], [-1.9, 0.32], [-0.96, 0.24], [-1.24, 0.76], [-0.58, 0.5]];

// two fringe locks hanging forward over the band, stopping just above the eye
const REM_BANG = [[0.3, -0.88], [0.86, -0.86], [1.04, -0.54], [0.98, -0.18, 1], [0.82, -0.44], [0.7, -0.14, 1], [0.54, -0.46], [0.36, -0.6]];

function remHairPath(ctx, r) {
  const H = REM_HAIR;
  ctx.moveTo(H[0][0] * r, H[0][1] * r);
  for (let i = 1; i < H.length; i++) {
    const p = H[i], q = H[i - 1];
    ctx.quadraticCurveTo((p[0] + q[0]) / 2 * r - 0.06 * r, (p[1] + q[1]) / 2 * r - 0.14 * r, p[0] * r, p[1] * r);
  }
  // the hairline from the nape round under the crown to the brow
  ctx.quadraticCurveTo(-0.2 * r, 0.1 * r, 0.1 * r, -0.26 * r);
  ctx.quadraticCurveTo(0.36 * r, -0.4 * r, H[0][0] * r, H[0][1] * r);
  ctx.closePath();
}
