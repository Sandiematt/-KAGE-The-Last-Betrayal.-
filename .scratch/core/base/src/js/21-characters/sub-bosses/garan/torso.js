SUB_ARMORS.half_do = function (ctx, f, key, A, S, U, P, acc, skin) {
  // half a cuirass: plated over the chest, its back edge burnt ragged down the middle, a glowing lightning scar
  const front = [[0.02, 15], [0.3, 14], [0.56, 15.6], [0.8, 16.6], [0.92, 14.6], [0.99, 8.6]];
  const split = [[0.99, 1], [0.88, -2.4], [0.76, 1.6], [0.64, -3.6], [0.52, 0.4], [0.4, -4], [0.28, -0.6], [0.16, -3.4], [0.02, -1]];
  const pts = front.concat(split).map(([u, w]) => P(u, w));
  celFill(ctx, () => _poly(ctx, pts), SUB_IRON, A, { sd: 6 * U, hd: 1.2 * U, rim: true, detail: (g) => {
    const Q = (k, t) => P(lerp(0.1, 0.8, 1 - t), lerp(-3, 17, k));
    _lace(g, A, Q, 4, 7, SUB_IRON, 1.1 * U, acc[1]);
    _strokePts(g, [P(0.8, -4), P(0.8, 18)], ANIME.outline, 1.4 * U);
    _strokePts(g, [P(0.93, 2), P(0.9, 14)], SUB_IRON[2], 1.1 * U);
    // the scorched edge: ember flecks along the split
    if (!A.flat) { g.fillStyle = acc[1]; for (let i = 1; i < split.length - 1; i += 2) { const p = P(split[i][0], split[i][1] + 1.6); g.beginPath(); g.arc(p[0], p[1], 0.9 * U, 0, TAU); g.fill(); } }
    _bolt(g, [P(0.86, 12), P(0.7, 7), P(0.66, 10.4), P(0.48, 4.6), P(0.42, 7.4), P(0.26, 2)], 0.9 * U, acc[2]);
  } });
};
