SUB_ARMORS.vanguard_plate = function (ctx, f, key, A, S, U, P, acc, skin) {
  // a lieutenant's full dō laced in violet, a lightning mark on the chest plate, a small gorget; back kusazuri
  f.subKusazuri(ctx, A, S, U, 'back', { rows: 4, len: 1.05, panels: 3, acc: acc[1] });
  celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.full, U), SUB_LACQ, A, { sd: 7 * U, hd: 1.1 * U, rim: true, detail: (g) => {
    const Q = (k, t) => P(lerp(0.1, 0.78, 1 - t), lerp(-17, 17, k));
    _lace(g, A, Q, 4, 12, SUB_LACQ, 1.1 * U, acc[1]);
    _strokePts(g, [P(0.78, -18), P(0.78, 18)], ANIME.outline, 1.4 * U);
    _strokePts(g, [P(0.94, -6), P(0.9, 12)], SUB_LACQ[2], 1.2 * U);
    g.fillStyle = ANIME.silver; const m = (u, w) => P(u, w);
    g.beginPath(); _poly(g, [m(0.95, 9.4), m(0.95, 6.4), m(0.87, 8), m(0.87, 5.6), m(0.8, 7.4), m(0.88, 9.6), m(0.88, 11)]); g.fill();
  } });
  celFill(ctx, () => animeTorso(ctx, S, { front: [[0.9, 9], [1.0, 9.6], [1.06, 5]], back: [[1.06, -6], [1.0, -11], [0.9, -11]] }, U), SUB_LACQ, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => _strokePts(g, [P(0.97, -12), P(0.97, 11)], acc[1], 1.2 * U) });
};
