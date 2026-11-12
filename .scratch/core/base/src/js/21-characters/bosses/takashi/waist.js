// the wide obi: dark, edged gold, a gold cord round it tied in a knot at the front, two gold tassels hanging
function _tkObi(f, ctx, A, S, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)], hol = _tkH(f), gold = _tkG(f), t = f.time || 0;
  const band = (u0, u1, w0, w1) => { const a = P(u0, -w0), b = P(u0, w1), c = P(u1, w1), d = P(u1, -w0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  celFill(ctx, () => band(-0.01, 0.22, 13.6, 13), hol ? A.pal.metal : ['#060405', '#120c0f', '#2a1d22'], A, { sd: 3.4 * U, hd: 0.7 * U, detail: (g) => {
    // gold edges and the cord wound twice round
    for (const [u, lw] of [[0.012, 1.3], [0.205, 1.3]]) _strokePts(g, [P(u, -13.6), P(u, 13)], gold[1], lw * U);
    for (const u of [0.085, 0.13]) _strokePts(g, [P(u - 0.01, -13.6), P(u + 0.01, 13)], gold[0], 1.6 * U);
    for (const u of [0.085, 0.13]) _strokePts(g, [P(u - 0.01, -13.6), P(u + 0.01, 13)], gold[1], 0.8 * U);
  } });
  // the knot: two loops and a wrapped centre on the front of the obi
  const k = P(0.108, 10.6), kp = { x: k[0], y: k[1] }, rot = Math.atan2(S.dy, S.dx);
  ctx.save(); ctx.translate(kp.x, kp.y); ctx.rotate(rot);
  celFill(ctx, () => {
    for (const sy of [-1, 1]) { ctx.moveTo(0, 0); ctx.ellipse(sy * 3.4 * U, 0, 3.2 * U, 2.2 * U, sy * 0.3, Math.PI, Math.PI * 3, false); ctx.closePath(); }
  }, gold, A, { sd: 1 * U, hd: 0.5 * U, detail: (g) => { g.fillStyle = gold[0]; for (const sy of [-1, 1]) { g.beginPath(); g.ellipse(sy * 3.4 * U, 0, 1.4 * U, 0.8 * U, sy * 0.3, 0, TAU); g.fill(); } } });
  celFill(ctx, () => { ctx.moveTo(1.8 * U, 0); ctx.arc(0, 0, 1.8 * U, 0, TAU); }, gold, A, { sd: 0.7 * U, hd: 0.4 * U });
  ctx.restore();
  // the tassels: down the front of the robe, swaying a little (the echo has lost one)
  const dn = [-S.ux, -S.uy];
  for (const [ox, len, ph] of [[-1.4, 9, 0], [1.6, 6, 1.9]]) {
    if (hol && ox > 0) continue;
    const sw = Math.sin(t * 1.9 + ph) * 0.12, dx = dn[0] + S.nx * sw, dy = dn[1] + S.ny * sw, l = Math.hypot(dx, dy);
    _tkTassel(ctx, A, { x: kp.x + S.nx * ox * U + dn[0] * 1.6 * U, y: kp.y + S.ny * ox * U + dn[1] * 1.6 * U }, len * U, dx / l, dy / l, 2.4 * U, gold);
  }
}
