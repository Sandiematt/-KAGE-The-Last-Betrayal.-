// the wide pink belt at the waist with a square pink buckle, and a second black belt slung low across the hips
function _akBelt(f, ctx, A, S, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)], hol = f.hollow, vio = _akV(f), gt = hol ? A.pal.metal : AK_GUARD;
  const band = (u0f, u0b, u1f, u1b, wf, wb) => { const a = P(u0b, -wb), b = P(u0f, wf), c = P(u1f, wf), d = P(u1b, -wb); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  // the slung belt: lower at the front, riding up at the back
  celFill(ctx, () => band(-0.06, 0.06, -0.14, -0.01, 11.2, 12.4), gt, A, { sd: 1.6 * U, hd: 0.5 * U, detail: (g) => _strokePts(g, [P(-0.1, -12.4), P(-0.12, 11.2)], vio[0], 0.8 * U) });
  // the waist belt: pink, a pale line along its top edge, a dark one along its bottom
  celFill(ctx, () => band(0.17, 0.16, 0.06, 0.07, 9.6, 9.0), hol ? gt : vio, A, { sd: 2 * U, hd: 0.6 * U, detail: (g) => {
    _strokePts(g, [P(0.155, -9), P(0.165, 9.6)], hol ? vio[1] : vio[2], 0.9 * U);
    _strokePts(g, [P(0.075, -9), P(0.065, 9.6)], vio[0], 0.9 * U);
  } });
  if (A.flat) return;
  // the buckle: a square pink frame at the front, a dark centre, a pale lit top edge
  const c = P(0.115, 7.8), rot = Math.atan2(S.dy, S.dx) + Math.PI / 2;
  ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(rot);
  ctx.fillStyle = ANIME.outline; ctx.fillRect(-3.1 * U, -2.9 * U, 6.2 * U, 5.8 * U);
  ctx.fillStyle = hol ? '#55505f' : vio[1]; ctx.fillRect(-2.6 * U, -2.4 * U, 5.2 * U, 4.8 * U);
  ctx.fillStyle = ANIME.face; ctx.fillRect(-1.4 * U, -1.2 * U, 2.8 * U, 2.4 * U);
  ctx.fillStyle = hol ? '#7d778a' : vio[2]; ctx.fillRect(-2.6 * U, -2.4 * U, 5.2 * U, 0.7 * U);
  ctx.restore();
}
