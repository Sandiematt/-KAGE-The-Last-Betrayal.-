/* ---- the high collar: two blades standing up behind the head ---- */
function _wtCollarBack(f, ctx, A, U) {
  const S = A.S, P = _sP(S, U), hr = BODY.head * f.scale * f.build.head, n = f.sk.neck;
  const up = [S.ux, S.uy], bk = [-S.nx, -S.ny], at = (k, b) => [n.x + up[0] * k * hr + bk[0] * b * hr, n.y + up[1] * k * hr + bk[1] * b * hr];
  const pts = [P(0.84, -10.5), at(1.75, 1.85), P(0.98, -6), at(2.15, 0.95), P(1.03, -1.5), at(1.2, 0.1), P(0.92, 2)];
  celFill(ctx, () => _poly(ctx, pts), WT_COAT, A, { sd: 3.6 * U, hd: 0.9 * U, rim: true, detail: A.flat ? null : (g) => {
    // the crimson lining inside the collar, the violet edge light along both blades
    g.fillStyle = WT_CRIM[0]; g.beginPath(); _poly(g, [P(0.9, -8), lerp2(pts[1], pts[2], 0.25), P(0.98, -4.6), lerp2(pts[3], pts[4], 0.3), P(1.0, -2.4)]); g.fill();
    _strokePts(g, [pts[0], pts[1], pts[2]], WT_EDGE, 1.2 * A.s);
    _strokePts(g, [pts[2], pts[3], pts[4]], WT_EDGE, 1.2 * A.s);
  } });
}
