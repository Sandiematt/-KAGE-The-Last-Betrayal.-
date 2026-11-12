// the waist: a dark uwa-obi over the dō's lower edge with a crimson cord knotted at the front
Fighter.prototype.orderBelt = function (ctx, S, A, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const o = animeSkin(this).order, wf = o.do === 'heavy' ? 15 : 13.4, wb = o.do === 'heavy' ? 15.4 : 13.8;
  celFill(ctx, () => { const a = P(0.0, -wb), b = P(0.0, wf), c = P(0.12, wf), d = P(0.12, -wb); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); },
    [ANIME.cloth0, '#111214', '#26282c'], A, { sd: 2.6 * U, hd: 0.6 * U, detail: (g) => {
      g.strokeStyle = A.pal.acc; g.lineWidth = 1.2 * U; g.beginPath();
      const a = P(0.06, -wb), b = P(0.06, wf); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      const k = P(0.06, wf - 3); g.fillStyle = A.pal.accHi; g.beginPath(); g.arc(k[0], k[1], 1.7 * U, 0, TAU); g.fill();
    } });
};

// kusazuri: plates hanging from the waist, each set swinging between straight down and its thigh; `which` 'back' is
// drawn before the near leg (over the far thigh), 'front' after it
Fighter.prototype.orderKusazuri = function (ctx, S, A, U, which) {
  const o = animeSkin(this).order, ks = o.kusa, sk = this.sk;
  const panel = (w, thighA, thighB, wid, far) => {
    const top = [spX(S, 0.06, w * U), spY(S, 0.06, w * U)];
    let tx = thighB.x - thighA.x, ty = thighB.y - thighA.y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    let dx = -S.ux * 0.5 + tx * 0.5, dy = -S.uy * 0.5 + ty * 0.5; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const nx = -dy, ny = dx, len = 21 * U * ks.len, w0 = wid * U, w1 = wid * 1.16 * U;
    const a0 = [top[0] - nx * w0 / 2, top[1] - ny * w0 / 2], a1 = [top[0] + nx * w0 / 2, top[1] + ny * w0 / 2];
    const b1 = [top[0] + dx * len + nx * w1 / 2, top[1] + dy * len + ny * w1 / 2], b0 = [top[0] + dx * len - nx * w1 / 2, top[1] + dy * len - ny * w1 / 2];
    const Q = (k, t) => [lerp(lerp(a0[0], a1[0], k), lerp(b0[0], b1[0], k), t), lerp(lerp(a0[1], a1[1], k), lerp(b0[1], b1[1], k), t)];
    const tone = far ? ORDER_LACQ_FAR : ORDER_LACQ;
    celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 1.2 * U), tone, A, { sd: 3 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: (g) => _odoshi(g, A, Q, ks.rows, far ? 3 : 5, tone, 1 * U) });
  };
  if (which === 'back') {
    panel(-8, sk.hipB, sk.bkn, 14, true);
    if (ks.panels > 2) panel(1, sk.hipB, sk.bkn, 14, true);
  } else {
    if (ks.panels > 2) panel(-3, sk.hipF, sk.fkn, 14, false);
    panel(7, sk.hipF, sk.fkn, 15, false);
  }
};
