SUB_ARMORS.robe = function (ctx, f, key, A, S, U, P, acc, skin) {
  // the kesa: a patchwork stole from the back shoulder across the chest to the front hip, gold-edged, a ring at the chest
  const a0 = P(1.04, -9), a1 = P(1.06, -2), b1 = P(0.04, 15), b0 = P(0.0, 7.5);
  celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 0.8 * U), KESA, A, { sd: 3 * U, hd: 0.8 * U, rim: true, detail: (g) => {
    const Q = (k, t) => [lerp(lerp(a0[0], a1[0], k), lerp(b0[0], b1[0], k), t), lerp(lerp(a0[1], a1[1], k), lerp(b0[1], b1[1], k), t)];
    g.strokeStyle = acc[0]; g.lineWidth = 1 * U; g.beginPath();
    for (const t of [0.2, 0.38, 0.56, 0.74, 0.9]) { const p = Q(-0.1, t), q = Q(1.1, t + 0.02); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
    const m0 = Q(0.5, 0), m1 = Q(0.5, 1); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]); g.stroke();
    _strokePts(g, [Q(0.08, 0), Q(0.08, 1)], acc[1], 1.5 * U); _strokePts(g, [Q(0.92, 0), Q(0.92, 1)], acc[1], 1.5 * U);
  } });
  if (!A.flat) {
    const c = P(0.74, 7.6);
    ctx.strokeStyle = acc[2]; ctx.lineWidth = 1.3 * U; ctx.beginPath(); ctx.arc(c[0], c[1], 2.4 * U, 0, TAU); ctx.stroke();
    ctx.strokeStyle = acc[0]; ctx.lineWidth = 0.6 * U; ctx.beginPath(); ctx.arc(c[0], c[1], 2.4 * U, 0.6, 2.2); ctx.stroke();
  }
};
