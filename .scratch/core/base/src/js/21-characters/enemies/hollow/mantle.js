/* ---- the husk's mantle: a ragged hump of cloth over the shoulders ---- */
Fighter.prototype.hollowMantle = function (ctx, S, A, U, kind) {
  // the flicker's hunch: a short shoulder cape bunched high on the back, so it reads stooped
  const pts = kind === 'hunch' ? _hsp(S, U, [[1.16, 2], [1.16, -9], [1.04, -17], [0.84, -18], [0.7, -16, 1], [0.76, -10], [0.62, -9, 1], [0.74, -4], [0.66, -1, 1], [0.82, 2], [0.8, 7, 1], [0.94, 6], [1.04, 7]]) : _hsp(S, U, [[1.14, 3], [1.14, -8], [1.04, -18], [0.84, -22], [0.58, -23, 1], [0.64, -16], [0.48, -17, 1], [0.58, -9], [0.42, -9, 1], [0.56, -2], [0.46, 2, 1], [0.62, 5], [0.56, 10, 1], [0.72, 9], [0.72, 15, 1], [0.88, 12], [1.02, 11]]);
  celFill(ctx, () => orderShape(ctx, 1, pts), A.pal.coat, A, { sd: 6 * U, hd: 1 * U, rim: true, detail: (g) => {
    animeFold(g, A, A.pal.coat, () => {
      for (const [a, b, c] of [[[1.02, -6], [0.8, -10], [0.6, -14]], [[1.0, 2], [0.8, -2], [0.6, -4]], [[0.98, 8], [0.84, 6], [0.66, 8]]]) {
        const p = _hsp(S, U, [a, b, c]); g.moveTo(p[0][0], p[0][1]); g.quadraticCurveTo(p[1][0], p[1][1], p[2][0], p[2][1]);
      }
    });
    const p = _hsp(S, U, [[0.68, -18], [0.66, -6]]);
    g.strokeStyle = A.pal.acc; g.lineWidth = 1.4 * U; g.setLineDash([3 * U, 2 * U]); g.beginPath(); g.moveTo(p[0][0], p[0][1]); g.lineTo(p[1][0], p[1][1]); g.stroke(); g.setLineDash([]);
  } });
};
