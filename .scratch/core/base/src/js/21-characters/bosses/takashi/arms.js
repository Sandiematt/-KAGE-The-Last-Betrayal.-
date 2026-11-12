// the capelet's flap over the shoulder (called from animeArm): it hangs from the shoulder down the upper arm, edged gold
function takashiSode(f, ctx, sh, el, A, U, far) {
  if (f.armor !== 'shinsei') return;
  const hol = _tkH(f), gold = _tkG(f), S = A.S;
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  const top = [sh.x - ax * 3 * U + S.ux * 1.5 * U, sh.y - ay * 3 * U + S.uy * 1.5 * U];
  const [a0, a1, b1, b0] = _hang(top, ax, ay, al * 0.74 + 3 * U, 15 * U, 21 * U);
  const tone = far ? [ANIME.face, TK_CAPE[0], TK_CAPE[1]] : hol ? A.pal.coat : TK_CAPE;
  celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 2.2 * U), tone, A, { sd: 3.4 * U, hd: far ? 0 : 1 * U, rim: true, detail: (g) => {
    if (hol) g.setLineDash([5 * U, 2 * U, 2 * U, 3 * U]);
    const inset = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
    _strokePts(g, [inset(b0, a0, 0.06), inset(b1, a1, 0.06)], far ? gold[0] : gold[1], 1.8 * U);
    if (!far) _strokePts(g, [inset(b0, a0, 0.2), inset(b1, a1, 0.2)], gold[0], 0.8 * U);
    g.setLineDash([]);
    if (far) return;
    // a fold down the flap
    animeFold(g, A, tone, () => { const p = inset(a0, a1, 0.55), q = inset(b0, b1, 0.42); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); });
    if (hol) _tear(g, A, lerp(b0[0], b1[0], 0.3), lerp(b0[1], b1[1], 0.3) - ay * 2 * U, 3 * U, 2.6 * U, Math.atan2(ay, ax) - Math.PI / 2);
  } });
}
