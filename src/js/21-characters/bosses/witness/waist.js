/* ---- the waist: an armoured belt with a crimson gem, two jagged tassets over the thighs ---- */
function _wtBelt(f, ctx, A, S, U) {
  const P = _sP(S, U), dn = [-S.ux, -S.uy], fr = [S.nx, S.ny];
  for (const [w0, w1, len, k] of [[-9.5, 1, 30, 0], [-0.5, 10, 36, 1]]) {
    const a = P(0.02, w0), b = P(0.02, w1), m = P(0.02, (w0 + w1) / 2);
    const L = len * U, tipx = m[0] + dn[0] * L + fr[0] * (k ? 3 : -4) * U, tipy = m[1] + dn[1] * L + fr[1] * (k ? 3 : -4) * U;
    const pts = [a, b, [b[0] + dn[0] * L * 0.62, b[1] + dn[1] * L * 0.62], [tipx, tipy], [lerp(a[0], b[0], 0.5) + dn[0] * L * 0.7, lerp(a[1], b[1], 0.5) + dn[1] * L * 0.7], [a[0] + dn[0] * L * 0.82, a[1] + dn[1] * L * 0.82]];
    celFill(ctx, () => _poly(ctx, pts), k ? WT_ARMOR : WT_FAR, A, { sd: 2.4 * U, hd: k ? 0.9 * U : 0, rim: true, detail: A.flat || !k ? null : (g) => {
      _strokePts(g, [pts[2], pts[3], pts[4], pts[5]], WT_EDGE, 1 * A.s);
      for (const t of [0.3, 0.58]) _strokePts(g, [[lerp(a[0], pts[5][0], t), lerp(a[1], pts[5][1], t)], [lerp(b[0], pts[2][0], t), lerp(b[1], pts[2][1], t)]], WT_ARMOR[0], 1.1 * A.s);
      g.save(); g.globalAlpha *= f.witFade(); _wtVein(g, _wtJag([lerp(a[0], b[0], 0.6), lerp(a[1], b[1], 0.6)], [tipx, tipy], 4, 1 * U, 5), 0.8 * A.s, WT_CRIM[1], 'rgba(255,40,90,0.9)'); g.restore();
    } });
  }
  const band = [P(-0.01, -11.6), P(-0.01, 10.6), P(0.12, 10.2), P(0.12, -11.2)];
  celFill(ctx, () => _poly(ctx, band), WT_ARMOR, A, { sd: 2.6 * U, hd: 0.7 * U, detail: A.flat ? null : (g) => {
    _strokePts(g, [P(0.105, -11.2), P(0.105, 10.2)], 'rgba(150,110,240,0.75)', 0.9 * A.s);
    _strokePts(g, [P(0.005, -11.6), P(0.005, 10.6)], WT_CRIM[0], 1.1 * A.s);
  } });
  if (A.flat) return;
  const gm = P(0.055, 8.4), R = 2.4 * U;
  celFill(ctx, () => _poly(ctx, [[gm[0], gm[1] - R * 1.3], [gm[0] + R, gm[1]], [gm[0], gm[1] + R * 1.3], [gm[0] - R, gm[1]]]), WT_CRIM, A, { sd: R * 0.4, hd: R * 0.25 });
}
