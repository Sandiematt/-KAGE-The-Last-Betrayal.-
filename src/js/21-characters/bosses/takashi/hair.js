// white hair swept back behind the face in spiky locks, a few falling past the temple
const TK_HAIRP = [[0.24, -0.5, 1], [0.1, -0.1], [0.22, 0.34, 1], [-0.04, 0.08], [-0.02, 0.66, 1], [-0.26, 0.32], [-0.4, 0.86, 1], [-0.56, 0.46], [-0.92, 0.96, 1],
  [-0.8, 0.42], [-1.5, 0.66, 1], [-1.04, 0.2], [-1.76, 0.12, 1], [-1.08, -0.1], [-1.6, -0.36, 1], [-1.0, -0.42], [-1.2, -0.62, 1], [-0.6, -0.56, 1]];

// the moustache and the beard sit on his face (TK_FACE, _skin.js), never in front of it: the lips and the point of the
// chin stay the profile's own. The moustache: a wing from under the nose, behind the upper lip, drooping back past the
// corner of the mouth to a point at the jaw
const TK_MOUST = [[0.84, 0.46, 1], [0.62, 0.39], [0.4, 0.48], [0.3, 0.8], [0.3, 1.14, 1], [0.5, 0.84], [0.6, 0.64], [0.75, 0.57, 1]];

// the beard: from under the jaw and the point of the chin, a long white point split at its end, hanging in front of
// the chest
const TK_BEARD = [[0.57, 0.95, 1], [0.66, 1.28], [0.72, 1.78, 1], [0.58, 1.5], [0.46, 1.9, 1], [0.38, 1.42], [0.26, 1.06], [0.12, 0.88, 1], [0.36, 0.9]];

// the beard and moustache (head frame): drawn after the near arm (takashiClasp), since they hang in front of the chest
function _tkBeard(ctx, f, r0, A) {
  const hc = _tkH(f) ? TK_HAIR_H : TK_HAIR;
  // the beard, then the moustache over it: flat white locks, one parting each
  celFill(ctx, () => orderShape(ctx, r0, TK_BEARD), hc, A, { sd: r0 * 0.16, hd: r0 * 0.05, rim: true, detail: (g) => {
    g.lineCap = 'round'; g.strokeStyle = hc[0]; g.lineWidth = Math.max(0.7, r0 * 0.05); g.beginPath();
    g.moveTo(0.46 * r0, 1.0 * r0); g.quadraticCurveTo(0.56 * r0, 1.3 * r0, 0.58 * r0, 1.56 * r0); g.stroke();
  } });
  celFill(ctx, () => orderShape(ctx, r0, TK_MOUST), hc, A, { sd: r0 * 0.1, hd: r0 * 0.05, rim: true });
}
