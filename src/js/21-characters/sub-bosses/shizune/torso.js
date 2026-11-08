SUBB_ARMORS.jerkin = function (ctx, f, key, A, S, U, P, acc, skin, t, coat) {
  // the kawa-dō: a fitted leather cuirass laced in pale gold over the gi, a chest plate, stitched seams
  const prof = { front: [[0.06, 12.8], [0.34, 12.2], [0.6, 13.6], [0.8, 14.4], [0.92, 12], [0.97, 6.4]], back: [[0.97, -7], [0.92, -13.8], [0.74, -14.6], [0.5, -12.6], [0.26, -12.4], [0.06, -13]] };
  celFill(ctx, () => animeTorso(ctx, S, prof, U), LEATHER, A, { sd: 6.5 * U, hd: 1 * U, rim: true, detail: (g) => {
    const Q = (k, tt) => P(lerp(0.1, 0.72, 1 - tt), lerp(-14, 14, k));
    _lace(g, A, Q, 3, 9, LEATHER, 0.9 * U, acc[0]);
    // the chest plate (munaita) and its stitched edge
    celFill(g, () => _poly(g, [P(0.94, -10), P(0.94, 12.4), P(0.74, 14.6), P(0.72, -12.4)]), LEATHER, A, { sd: 2 * U, hd: 0.8 * U });
    g.setLineDash([1.4 * U, 1.4 * U]); _strokePts(g, [P(0.76, -11.6), P(0.78, 13.4)], acc[1], 0.7 * U); g.setLineDash([]);
    // the side lacing knot
    const k = P(0.6, -11); g.fillStyle = acc[1]; g.beginPath(); g.arc(k[0], k[1], 1.2 * U, 0, TAU); g.fill();
  } });
};
