SUBB_ARMORS.ledger_coat = function (ctx, f, key, A, S, U, P, acc, skin, t, coat) {
  // the haori over the gi (or Kage's coat): open at the front, a violet collar band ruled like a ledger column,
  // shingled pages pasted over the chest and back, one struck through
  const prof = { front: [[-0.12, 13.6], [0.2, 12.8], [0.5, 13.8], [0.78, 15], [0.94, 13.2], [1.04, 7.6], [1.08, 4]], back: [[1.08, -5.6], [0.98, -14.6], [0.8, -15.4], [0.5, -13], [0.2, -13], [-0.12, -13.8]] };
  celFill(ctx, () => animeTorso(ctx, S, prof, U), A.pal.coat, A, { sd: 7 * U, hd: 1 * U, rim: true, detail: (g) => {
    g.fillStyle = coat ? A.pal.fab[1] : A.pal.fab[0];
    g.beginPath(); _poly(g, [P(1.06, 1.6), P(1.06, 13), P(-0.1, 14), P(0.1, 7.6), P(0.62, 5)]); g.fill();
    // pages on the back and chest
    for (const [u, w, rot] of [[0.62, -9.5, 0.08], [0.4, -10, -0.06], [0.82, -6.5, 0.1], [0.3, -4, 0.04], [0.55, -3.6, -0.05]]) {
      const c = P(u, w); g.save(); g.translate(c[0], c[1]); g.rotate(Math.atan2(S.dy, S.dx) + Math.PI / 2 + rot);
      g.fillStyle = LEDGER[(u * 10 | 0) % 2]; g.fillRect(-3.2 * U, -2.2 * U, 6.4 * U, 4.4 * U);
      g.strokeStyle = ANIME.outline; g.lineWidth = 0.8 * A.s; g.strokeRect(-3.2 * U, -2.2 * U, 6.4 * U, 4.4 * U);
      g.strokeStyle = 'rgba(8,7,8,0.75)'; g.lineWidth = 0.55 * A.s; g.beginPath(); g.moveTo(-2.4 * U, -0.6 * U); g.lineTo(2.4 * U, -0.6 * U); g.moveTo(-2.4 * U, 0.8 * U); g.lineTo(1.4 * U, 0.8 * U); g.stroke();
      if (u === 0.4) { g.strokeStyle = acc[2]; g.lineWidth = 0.9 * U; g.beginPath(); g.moveTo(-3 * U, 1.8 * U); g.lineTo(3 * U, -1.8 * U); g.stroke(); }
      g.restore();
    }
    _strokePts(g, [P(1.06, 1.6), P(0.62, 5), P(0.1, 7.6)], A.pal.coat[2], 1.3 * U);
    _strokePts(g, [P(1.04, 3.2), P(0.62, 6.6), P(0.1, 9.4)], acc[0], 2.6 * U);
    g.strokeStyle = acc[1]; g.lineWidth = 0.7 * A.s; g.beginPath();
    for (let k = 1; k < 7; k++) { const u = lerp(1.0, 0.18, k / 7), w = lerp(3.6, 8.8, k / 7); const a = P(u, w - 1.1), b = P(u - 0.015, w + 1.1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
    _strokePts(g, [P(0.8, -2.5), P(0.5, -4), P(0.3, -3.2)], A.pal.coat[0], 1 * A.s);
  } });
};
