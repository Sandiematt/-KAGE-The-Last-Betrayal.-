SUBB_ARMORS.tyrant = function (ctx, f, key, A, S, U, P, acc, skin, t, coat) {
  // the Gōka dō: heavy black iron, burnt veins of the accent running up from the waist, a spiked gorget
  f.subKusazuri(ctx, A, S, U, 'back', { rows: 3, len: 1.2, panels: 3, acc: acc[1], iron: true, wide: 1.15 });
  celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.heavy, U), SUB_IRON, A, { sd: 7 * U, hd: 1.2 * U, rim: true, detail: (g) => {
    const Q = (k, tt) => P(lerp(0.08, 0.72, 1 - tt), lerp(-17, 17, k));
    _lace(g, A, Q, 3, 8, SUB_IRON, 1 * U, acc[0]);
    _strokePts(g, [P(0.76, -18), P(0.76, 18)], ANIME.outline, 1.4 * U);
    _strokePts(g, [P(0.92, -6), P(0.88, 13)], SUB_IRON[2], 1.2 * U);
    if (!A.flat) for (const pts of [[[0.1, 8], [0.3, 6], [0.38, 9], [0.6, 7.4], [0.74, 10]], [[0.12, -2], [0.28, 0.6], [0.46, -1.6], [0.62, 1]]]) _bolt(g, pts.map(([u, w]) => P(u, w)), 0.7 * U, acc[1]);
  } });
  celFill(ctx, () => animeTorso(ctx, S, { front: [[0.88, 10], [1.0, 10.6], [1.08, 5]], back: [[1.08, -7], [1.0, -12.6], [0.88, -12.6]] }, U), SUB_IRON, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => _strokePts(g, [P(0.96, -12), P(0.96, 11)], acc[0], 1.4 * U) });
  // the spikes of the gorget, rising behind the head
  for (const w of [-10, -6.4, -2.8]) celFill(ctx, () => _poly(ctx, [P(1.0, w - 1.6), P(1.2 + (w + 10) * -0.01, w - 2.2), P(1.0, w + 1.6)]), SUB_IRON, A, { sd: 1 * U, rim: true });
};
