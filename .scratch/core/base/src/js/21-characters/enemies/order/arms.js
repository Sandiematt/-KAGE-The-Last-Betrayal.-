// sode: a laced shoulder plate hanging from the shoulder over the upper arm, between straight down and the arm
Fighter.prototype.orderSode = function (ctx, sh, el, A, U, far, size) {
  const S = A.S;
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  let dx = ax * 0.45 - S.ux * 0.55, dy = ay * 0.45 - S.uy * 0.55; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const nx = -dy, ny = dx, len = 25 * U * size, w0 = 17 * U * size, w1 = 21 * U * size;
  // hung a little outboard of the arm (toward the viewer's side of the shoulder) so it flares past the sleeve
  const top = [sh.x - dx * 5 * U - S.nx * 1.5 * U, sh.y - dy * 5 * U - S.ny * 1.5 * U];
  const a0 = [top[0] - nx * w0 / 2, top[1] - ny * w0 / 2], a1 = [top[0] + nx * w0 / 2, top[1] + ny * w0 / 2];
  const b1 = [top[0] + dx * len + nx * w1 / 2, top[1] + dy * len + ny * w1 / 2], b0 = [top[0] + dx * len - nx * w1 / 2, top[1] + dy * len - ny * w1 / 2];
  const Q = (k, t) => [lerp(lerp(a0[0], a1[0], k), lerp(b0[0], b1[0], k), t), lerp(lerp(a0[1], a1[1], k), lerp(b0[1], b1[1], k), t)];
  const tone = far ? ORDER_LACQ_FAR : ORDER_LACQ;
  celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 2 * U * size), tone, A, { sd: 3.4 * U, hd: far ? 0 : 1 * U, rim: true, detail: far ? null : (g) => {
    _odoshi(g, A, Q, size > 1.4 ? 5 : 4, 5, tone, 1.1 * U);
    // the top plate's lit edge
    g.strokeStyle = tone[2]; g.lineWidth = 1.3 * U; g.beginPath(); g.moveTo(a0[0] - A.lx * 1.4 * U, a0[1] - A.ly * 1.4 * U + 1.4 * U); g.lineTo(a1[0] - A.lx * 1.4 * U, a1[1] - A.ly * 1.4 * U + 1.4 * U); g.stroke();
  } });
};
