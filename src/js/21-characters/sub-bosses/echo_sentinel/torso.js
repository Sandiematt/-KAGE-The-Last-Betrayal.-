SUBB_ARMORS.cloak = function (ctx, f, key, A, S, U, P, acc, skin, t, coat) {
  // the echo's cloak over the shoulders: a mantle to mid-chest, a clasp of violet glass at the throat
  const T = [[1.08, -6], [1.06, 7], [0.92, 13], [0.72, 14.6]], hem = [];
  const K = 7; for (let i = 0; i <= K; i++) { const k = i / K; hem.push([lerp(0.72, 0.66, k) - (i % 2 ? 0.07 : 0), lerp(14.6, -17.4, k)]); }
  const pts = T.concat(hem, [[0.88, -17], [1.02, -13]]).map(([u, w]) => P(u, w));
  celFill(ctx, () => _poly(ctx, pts), ['#07060b', '#100e16', '#221e2e'], A, { sd: 4 * U, hd: 0.9 * U, rim: true, detail: (g) => {
    _strokePts(g, [P(0.82, -16), P(0.82, 13)], acc[0], 1.6 * U);
    _strokePts(g, [P(0.96, -13), P(0.95, 8)], ANIME.outline, 1 * A.s);
  } });
  if (!A.flat) { const c = P(1.0, 8); ctx.fillStyle = acc[1]; ctx.beginPath(); ctx.arc(c[0], c[1], 2.2 * U, 0, TAU); ctx.fill(); ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(c[0] - 0.5 * U, c[1] - 0.5 * U, 0.8 * U, 0, TAU); ctx.fill(); }
};
