// Kage's crimson sash with a dark leather belt over it and a silver buckle at the front
Fighter.prototype.animeSash = function (ctx, S, A, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const band = (u0, u1, w0, w1) => { const a = P(u0, -w0), b = P(u0, w1), c = P(u1, w1), d = P(u1, -w0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  celFill(ctx, () => band(0.02, 0.19, 9.8, 9.2), [ANIME.crimson, ANIME.crimsonHi, '#e0574f'], A, { sd: 4 * U, hd: 0.8 * U, detail: (g) => {
    g.strokeStyle = '#5a0f13'; g.lineWidth = 0.9 * A.s; g.beginPath();
    for (const u of [0.07, 0.14]) { const a = P(u, -9.8), b = P(u + 0.02, 9.2); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  } });
  celFill(ctx, () => band(0.085, 0.13, 10, 9.6), [ANIME.cloth0, '#120d0c', '#2e2421'], A, { sd: 1 * U });
  if (A.flat) return;
  const c = P(0.108, 8.2), v = P(0.108, 9.6);
  ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(Math.atan2(S.dy, S.dx) + Math.PI / 2);
  ctx.fillStyle = ANIME.silver; ctx.fillRect(-2.2 * U, -1.6 * U, 4.4 * U, 3.2 * U);
  ctx.fillStyle = ANIME.cloth0; ctx.fillRect(-1.2 * U, -0.7 * U, 2.4 * U, 1.4 * U);
  ctx.fillStyle = ANIME.silverHi; ctx.fillRect(-2.2 * U, -1.6 * U, 4.4 * U, 0.6 * U);
  ctx.restore(); void v;
};
