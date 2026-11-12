// the base obi: a dark wrapped band at the waist with thin crimson edges
Fighter.prototype.animeObi = function (ctx, S, A, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const band = (u0, u1, w0, w1) => { const a = P(u0, -w0), b = P(u0, w1), c = P(u1, w1), d = P(u1, -w0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  celFill(ctx, () => band(0.0, 0.17, 12.8, 11.8), [ANIME.cloth0, '#151112', '#2a2324'], A, { sd: 3 * U, hd: 0.6 * U, detail: (g) => {
    g.strokeStyle = A.pal.acc; g.lineWidth = 1 * A.s; g.beginPath();
    for (const u of [0.03, 0.145]) { const a = P(u, -12.8), b = P(u, 11.8); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  } });
};
