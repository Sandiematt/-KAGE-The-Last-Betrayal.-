// the red obi, a dark belt over it, the large silver ring at the front and two red cords hanging from it
function _raiSash(f, ctx, A, S, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)], hol = _raiH(f), red = _raiRed(f), t = f.time || 0;
  const band = (u0, u1, w0, w1) => { const a = P(u0, -w0), b = P(u0, w1), c = P(u1, w1), d = P(u1, -w0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  celFill(ctx, () => band(0.0, 0.2, 13, 12.2), red, A, { sd: 4 * U, hd: 0.8 * U, detail: (g) => {
    g.strokeStyle = red[0]; g.lineWidth = 0.9 * A.s; g.beginPath();
    for (const u of [0.05, 0.155]) { const a = P(u, -13), b = P(u + 0.02, 12.2); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  } });
  celFill(ctx, () => band(0.085, 0.13, 13.2, 12.6), [ANIME.cloth0, '#120d0c', '#2e2421'], A, { sd: 1 * U });
  // the cords: from the ring down the front of the skirt, swaying a little, a knot and a short tassel at each end
  const ring = P(0.1, 9.4), dn = [-S.ux, -S.uy];
  for (const [ox, len, ph] of [[-1.6, 17, 0], [1.4, 13, 1.7]]) {
    if (hol && ox > 0) continue;   // the echo's second cord is gone
    const sw = Math.sin(t * 2.1 + ph) * 1.2 * U, a = { x: ring[0] + S.nx * ox * U, y: ring[1] + S.ny * ox * U };
    const b = { x: a.x + dn[0] * len * U + S.nx * sw, y: a.y + dn[1] * len * U + S.ny * sw };
    celFill(ctx, () => animeCapsule(ctx, a, b, 0.9 * U, 0.9 * U, 0, 0.5), red, A, { sd: 0.6 * U, seam: false });
    const tl = { x: b.x + dn[0] * 4.6 * U, y: b.y + dn[1] * 4.6 * U };
    celFill(ctx, () => animeCapsule(ctx, b, tl, 1.4 * U, 2 * U, 0, 0.5), red, A, { sd: 0.8 * U, hd: 0.4 * U });
  }
  // the ring
  const R = 4.4 * U, rt = hol ? RAI_RING_H : RAI_RING;
  celFill(ctx, () => { ctx.moveTo(ring[0] + R, ring[1]); ctx.arc(ring[0], ring[1], R, 0, TAU); ctx.moveTo(ring[0] + R * 0.62, ring[1]); ctx.arc(ring[0], ring[1], R * 0.62, 0, TAU, true); }, rt, A, { sd: R * 0.3, hd: R * 0.16 });
}
