SUBB_ARMORS.conduit_harness = function (ctx, f, key, A, S, U, P, acc, skin, t, coat) {
  // a leather harness crossed over the chest, each strap coiled with a glass tube of pulsing violet light, a ring
  // where they cross; a short leather dō under it
  celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.light, U), LEATHER, A, { sd: 5 * U, hd: 0.9 * U, rim: true, detail: (g) => {
    _strokePts(g, [P(0.4, 12.6), P(0.4, -4)], LEATHER[0], 1 * A.s);
  } });
  if (!A.flat) {
    const glow = 0.45 + 0.35 * Math.sin(t * 5);
    for (const [a, b] of [[P(1.0, -10), P(0.12, 13)], [P(1.0, 11), P(0.12, -12)]]) {
      ctx.lineCap = 'round';
      _strokePts(ctx, [a, b], ANIME.outline, 5 * U); _strokePts(ctx, [a, b], LEATHER[1], 3.4 * U);
      _strokePts(ctx, [[a[0] - A.lx * U, a[1] - A.ly * U], [b[0] - A.lx * U, b[1] - A.ly * U]], LEATHER[2], 0.7 * U);
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(165,135,255,${glow})`; ctx.lineWidth = 1.5 * U; ctx.beginPath();
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      for (let k = 0; k <= 16; k++) { const q = k / 16, w = Math.sin(q * Math.PI * 6 + t * 6) * 1.6 * U; const x = a[0] + dx * q + nx * w, y = a[1] + dy * q + ny * w; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
    }
    const c = P(0.57, -0.4);
    ctx.strokeStyle = ANIME.outline; ctx.lineWidth = 3 * U; ctx.beginPath(); ctx.arc(c[0], c[1], 3.4 * U, 0, TAU); ctx.stroke();
    ctx.strokeStyle = SUB_IRON[2]; ctx.lineWidth = 1.6 * U; ctx.beginPath(); ctx.arc(c[0], c[1], 3.4 * U, 0, TAU); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(201,189,255,${glow})`; ctx.beginPath(); ctx.arc(c[0], c[1], 2 * U, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
  } else {
    for (const [a, b] of [[P(1.0, -10), P(0.12, 13)], [P(1.0, 11), P(0.12, -12)]]) _strokePts(ctx, [a, b], A.col, 4 * U);
  }
  void acc;
};
