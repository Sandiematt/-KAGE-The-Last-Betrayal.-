/* ---- waist ---- */
Fighter.prototype.hollowSash = function (ctx, S, A, U, kind) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const band = (u0, u1, w0, w1) => { const a = P(u0, -w0), b = P(u0, w1), c = P(u1, w1), d = P(u1, -w0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  const pal = A.pal, s = A.s;
  if (kind === 'rope' || kind === 'shimenawa') {
    const heavy = kind === 'shimenawa', w0 = heavy ? 14.6 : 12.6, w1 = heavy ? 13.6 : 11.8, u1 = heavy ? 0.17 : 0.1;
    if (heavy) {
      // shide: zigzag papers hanging from the rope
      for (const w of [-8, 1, 9]) {
        const a = P(0.02, w);
        celFill(ctx, () => {
          const d = -1, ux = S.ux * d, uy = S.uy * d, nx = S.nx, ny = S.ny, k = 4.2 * U;
          ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + nx * 3 * U, a[1] + ny * 3 * U);
          for (const [x, y] of [[3, 1], [0.6, 1], [3.4, 2], [1, 2], [3.6, 3], [1.4, 3.6], [0, 2.3], [2.4, 2.3], [-0.2, 1.3], [2.2, 1.3], [0, 0.4]]) ctx.lineTo(a[0] + nx * x * U + ux * y * k, a[1] + ny * x * U + uy * y * k);
          ctx.closePath();
        }, ['#3a3548', '#625c78', '#8e88a6'], A, { sd: 1.2 * U, hd: 0.4 * U });
      }
    }
    celFill(ctx, () => band(0.0, u1, w0, w1), HOLLOW_ROPE, A, { sd: 2.2 * U, hd: 0.6 * U, detail: (g) => {
      // the twist of the strands
      g.strokeStyle = HOLLOW_ROPE[0]; g.lineWidth = 1.1 * s; g.beginPath();
      for (let i = 0; i <= 14; i++) { const w = lerp(-w0, w1, i / 14), a = P(0, w - 1.6), b = P(u1, w + 1.6); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      g.stroke();
      g.strokeStyle = HOLLOW_ROPE[2]; g.lineWidth = 0.6 * s; g.beginPath();
      for (let i = 0; i <= 14; i++) { const w = lerp(-w0, w1, i / 14) + 0.8, a = P(u1 * 0.2, w - 1.2), b = P(u1 * 0.8, w + 1.2); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      g.stroke();
    } });
    // the knot at the front with two short ends
    const k = P(u1 * 0.5, w1 - 2.6);
    celFill(ctx, () => { ctx.moveTo(k[0] + 2.4 * U, k[1]); ctx.arc(k[0], k[1], 2.4 * U, 0, TAU); }, HOLLOW_ROPE, A, { sd: 1 * U, hd: 0.5 * U });
    return;
  }
  // a torn obi, its edges frayed violet, one torn end hanging at the front
  const t = P(0.04, 9.5);
  celFill(ctx, () => {
    const dx = -S.ux * 0.7, dy = -S.uy * 0.7 + 0.5, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux, L = 22 * U, w = 2.6 * U;
    ctx.moveTo(t[0] - nx * w, t[1] - ny * w); ctx.lineTo(t[0] + nx * w, t[1] + ny * w);
    ctx.lineTo(t[0] + nx * w * 1.2 + ux * L * 0.86, t[1] + ny * w * 1.2 + uy * L * 0.86); ctx.lineTo(t[0] + nx * w * 0.3 + ux * L * 0.72, t[1] + ny * w * 0.3 + uy * L * 0.72);
    ctx.lineTo(t[0] - nx * w * 0.2 + ux * L, t[1] - ny * w * 0.2 + uy * L); ctx.lineTo(t[0] - nx * w * 1.1 + ux * L * 0.78, t[1] - ny * w * 1.1 + uy * L * 0.78); ctx.closePath();
  }, pal.back, A, { sd: 1.6 * U, rim: true });
  celFill(ctx, () => band(0.0, 0.16, 12.8, 11.8), [ANIME.cloth0, '#120f16', '#26212e'], A, { sd: 3 * U, hd: 0.6 * U, detail: (g) => {
    g.strokeStyle = pal.acc; g.lineWidth = 1 * s; g.setLineDash([4 * U, 1.6 * U, 1.4 * U, 2.4 * U]); g.beginPath();
    for (const u of [0.03, 0.135]) { const a = P(u, -12.8), b = P(u, 11.8); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke(); g.setLineDash([]);
  } });
};
