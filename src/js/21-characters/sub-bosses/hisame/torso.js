SUB_ARMORS.mist_shroud = function (ctx, f, key, A, S, U, P, acc, skin) {
  // the fringed rain capelet over the shoulders: layered strands, a blue cord at the throat
  const T = [[1.08, -6], [1.06, 7], [0.92, 13], [0.74, 15.4]], hem = [];
  const K = 9; for (let i = 0; i <= K; i++) { const k = i / K, u = lerp(0.74, 0.7, k) - (i % 2 ? 0.07 : 0), w = lerp(15.4, -17.4, k); hem.push([u, w]); }
  const pts = T.concat(hem, [[0.9, -17], [1.02, -13]]).map(([u, w]) => P(u, w));
  celFill(ctx, () => _poly(ctx, pts), RAIN, A, { sd: 4 * U, hd: 0.9 * U, rim: true, detail: (g) => {
    for (const u of [0.96, 0.86]) {
      _strokePts(g, [P(u + 0.01, -17), P(u + 0.01, 15)], RAIN[2], 0.8 * A.s);
      g.strokeStyle = ANIME.outline; g.lineWidth = 0.9 * A.s; g.beginPath();
      for (let w = -15; w < 14; w += 3) { const p = P(u, w), q = P(u - 0.1, w + 0.6); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
      g.stroke();
    }
    _strokePts(g, [P(1.02, 4), P(0.94, 9.6)], acc[1], 1.4 * U);
  } });
};
