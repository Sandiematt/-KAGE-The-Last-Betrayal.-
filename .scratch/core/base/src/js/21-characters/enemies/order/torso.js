// the Order mark: a closed circle barred across like a sealed mouth
function orderMark(g, x, y, R, col, lw) {
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke();
  g.beginPath(); g.moveTo(x - R * 0.62, y); g.lineTo(x + R * 0.62, y); g.stroke();
}

/* ---- the body pieces (spine frame: P(u, w), u 0 hip .. 1 neck, w px across toward the front) ---- */
const ORDER_DO = {
  full:  { front: [[0.04, 13.6], [0.3, 12.8], [0.56, 14.6], [0.78, 15.8], [0.91, 14], [0.96, 8]], back: [[0.96, -9], [0.91, -15], [0.74, -16], [0.5, -14], [0.26, -13.6], [0.04, -14.2]] },
  heavy: { front: [[0.02, 14.6], [0.3, 13.8], [0.56, 15.4], [0.8, 16.4], [0.92, 14.4], [0.98, 8.6]], back: [[0.98, -9.4], [0.92, -15.6], [0.74, -16.6], [0.5, -14.6], [0.26, -14.4], [0.02, -15.2]] },
  light: { front: [[0.1, 13.2], [0.36, 12.6], [0.6, 14.2], [0.8, 14.8], [0.91, 12], [0.94, 4]], back: [[0.94, -3], [0.62, -5], [0.3, -5], [0.1, -4]] }
};

// drawn by drawArmor ('order_garb' / 'order_plate') over the gi torso
function drawOrderArmor(ctx, f, ink, flat) {
  const A = f._A, o = animeSkin(f).order;
  const S = A.S, U = A.U, pal = A.pal, kind = o.do;
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const prof = ORDER_DO[kind];
  if (kind === 'light') {
    // the runner's and chainthrower's hara-ate: crossed crimson cords over the back of the gi, then the front plate
    if (!A.flat) {
      ctx.strokeStyle = pal.acc; ctx.lineWidth = 1.3 * U; ctx.beginPath();
      const a = P(0.92, -2), b = P(0.2, -11), c = P(0.9, -10), d = P(0.24, -1);
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke();
    }
  }
  celFill(ctx, () => animeTorso(ctx, S, prof, U), ORDER_LACQ, A, { sd: 7 * U, hd: 1.1 * U, rim: true, detail: (g) => {
    const top = kind === 'heavy' ? 0.82 : 0.78;
    // the lames of the dō: seams across, a lit edge, crimson lacing rows
    const Q = (k, t) => P(lerp(0.1, top, 1 - t), lerp(-17, 17, k));
    _odoshi(g, A, Q, kind === 'heavy' ? 5 : 4, kind === 'light' ? 7 : 12, ORDER_LACQ, 1.1 * U);
    // the chest plate (munaita) with its lit top edge
    const m0 = P(top, -18), m1 = P(top, 18);
    g.strokeStyle = ANIME.outline; g.lineWidth = 1.4 * U; g.beginPath(); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]); g.stroke();
    const e0 = P(0.94, -6), e1 = P(0.9, 12);
    g.strokeStyle = ORDER_LACQ[2]; g.lineWidth = 1.2 * U; g.beginPath(); g.moveTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.stroke();
    // the Order mark on the chest plate
    const mk = P((top + 0.95) / 2, 7.5);
    orderMark(g, mk[0], mk[1], 2.6 * U, pal.accHi, 1.1 * U);
    if (o.chain) {
      // the chainthrower's bandolier of chain from the far shoulder across to the front hip
      g.strokeStyle = '#4a4e55'; g.lineWidth = 1.2 * U;
      for (let i = 0; i <= 9; i++) {
        const k = i / 9, p = P(lerp(0.95, 0.18, k), lerp(-6, 13, k));
        g.beginPath(); g.ellipse(p[0], p[1], 1.9 * U, 1.1 * U, Math.atan2(S.dy, S.dx) + (i % 2 ? 0.9 : -0.9), 0, TAU); g.stroke();
      }
    }
  } });
  if (kind === 'heavy') {
    // the gorget (nodowa) round the throat
    celFill(ctx, () => animeTorso(ctx, S, { front: [[0.9, 9], [1.0, 9.6], [1.06, 5]], back: [[1.06, -6], [1.0, -11], [0.9, -11]] }, U), ORDER_LACQ, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => {
      const a = P(0.97, -12), b = P(0.97, 11); g.strokeStyle = pal.acc; g.lineWidth = 1.2 * U; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    } });
  }
  void ink; void flat;
}
