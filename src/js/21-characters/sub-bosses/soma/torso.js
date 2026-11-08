SUBB_ARMORS.pauldrons = function (ctx, f, key, A, S, U, P, acc, skin, t, coat) {
  // the ō-sode yoroi: a full dō laced in the accent, a mune-ita and a gorget (the great sode hang from the arms)
  f.subKusazuri(ctx, A, S, U, 'back', { rows: 4, len: 1.1, panels: 3, acc: acc[1] });
  celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.heavy, U), SUB_LACQ, A, { sd: 7 * U, hd: 1.1 * U, rim: true, detail: (g) => {
    const Q = (k, tt) => P(lerp(0.08, 0.76, 1 - tt), lerp(-17, 17, k));
    _lace(g, A, Q, 5, 12, SUB_LACQ, 1.1 * U, acc[1]);
    _strokePts(g, [P(0.78, -18), P(0.78, 18)], ANIME.outline, 1.4 * U);
    _strokePts(g, [P(0.94, -6), P(0.9, 12)], SUB_LACQ[2], 1.2 * U);
    // a small gold crest on the chest
    const c = P(0.86, 7); g.strokeStyle = acc[2]; g.lineWidth = 0.9 * U; g.beginPath(); g.arc(c[0], c[1], 2.2 * U, 0, TAU); g.stroke();
    g.beginPath(); g.moveTo(c[0] - 2.2 * U * S.ux, c[1] - 2.2 * U * S.uy); g.lineTo(c[0] + 2.2 * U * S.ux, c[1] + 2.2 * U * S.uy); g.stroke();
  } });
  celFill(ctx, () => animeTorso(ctx, S, { front: [[0.9, 9.4], [1.0, 10], [1.06, 5]], back: [[1.06, -6.4], [1.0, -11.4], [0.9, -11.4]] }, U), SUB_LACQ, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => _strokePts(g, [P(0.97, -12), P(0.97, 11)], acc[1], 1.2 * U) });
};
