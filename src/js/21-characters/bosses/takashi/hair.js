// white hair swept back behind the face in spiky locks, a few falling past the temple
const TK_HAIRP = [[0.24, -0.5, 1], [0.1, -0.1], [0.22, 0.34, 1], [-0.04, 0.08], [-0.02, 0.66, 1], [-0.26, 0.32], [-0.4, 0.86, 1], [-0.56, 0.46], [-0.92, 0.96, 1],
  [-0.8, 0.42], [-1.5, 0.66, 1], [-1.04, 0.2], [-1.76, 0.12, 1], [-1.08, -0.1], [-1.6, -0.36, 1], [-1.0, -0.42], [-1.2, -0.62, 1], [-0.6, -0.56, 1]];

// the moustache: drooping wings from under the nose, and the long beard to a point, split at the end
const TK_MOUST = [[0.92, 0.32, 1], [1.16, 0.44], [1.3, 0.8, 1], [1.04, 0.56], [0.78, 0.5], [0.5, 0.58], [0.22, 0.9, 1], [0.32, 0.48], [0.64, 0.36]];

const TK_BEARD = [[0.82, 0.56], [0.94, 0.84], [0.88, 1.2], [0.92, 1.46, 1], [0.78, 1.36], [0.66, 1.96, 1], [0.58, 1.46], [0.44, 1.6, 1], [0.44, 1.16], [0.36, 0.86], [0.5, 0.62]];

// the beard and moustache (head frame): drawn after the near arm (takashiClasp), since they hang in front of the chest
function _tkBeard(ctx, f, r0, A) {
  const hc = _tkH(f) ? TK_HAIR_H : TK_HAIR;
  // the beard, then the moustache over it
  celFill(ctx, () => orderShape(ctx, r0, TK_BEARD), hc, A, { sd: r0 * 0.18, hd: r0 * 0.05, rim: true, detail: (g) => {
    g.lineCap = 'round'; g.strokeStyle = hc[0]; g.lineWidth = Math.max(0.7, r0 * 0.045); g.beginPath();
    for (const [x0, y0, x1, y1] of [[0.78, 0.74, 0.84, 1.3], [0.64, 0.74, 0.66, 1.76], [0.5, 0.8, 0.5, 1.4]]) { g.moveTo(x0 * r0, y0 * r0); g.quadraticCurveTo((x0 + x1) * 0.5 * r0 + 0.05 * r0, (y0 + y1) * 0.5 * r0, x1 * r0, y1 * r0); }
    g.stroke();
  } });
  celFill(ctx, () => orderShape(ctx, r0, TK_MOUST), hc, A, { sd: r0 * 0.1, hd: r0 * 0.05, detail: (g) => {
    g.strokeStyle = hc[0]; g.lineWidth = Math.max(0.6, r0 * 0.035); g.beginPath(); g.moveTo(1.18 * r0, 0.66 * r0); g.quadraticCurveTo(0.8 * r0, 0.44 * r0, 0.3 * r0, 0.8 * r0); g.stroke();
  } });
}
