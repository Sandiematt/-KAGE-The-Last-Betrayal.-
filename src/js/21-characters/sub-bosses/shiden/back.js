/* ---- the back pieces ---- */
// Shiden's sashimono: a lacquered pole up the back and a dark violet banner with a silver lightning mark, stirring.
// Kept short and leaning back (ticket 13) so that in close camera shots, or when he leaps, it stays out of the HUD band.
Fighter.prototype.shidenBanner = function (ctx, A, S, U) {
  const P = _sP(S, U), Pt = _sPt(S, U), t = this.time || 0, acc = subTone(SUB_ACC.vanguard_plate);
  const wv = (k) => Math.sin(t * 3.2 + k * 2.2) * 2.2;
  celFill(ctx, () => animeCapsule(ctx, Pt(0.5, -12.5), Pt(2.45, -18.6), 1.5 * U, 1.2 * U, 0, 0.5), SUB_LACQ, A, { sd: 1 * U, seam: false });
  const top = 2.38, bot = 1.7, wt = -18.4, wb = -16.2;   // the pole's lean: its back offset at the banner's top and foot
  const pts = [P(top, wt), P(top + 0.02, wt - 9.4 + wv(0)), P(top + 0.04, wt - 18.4 + wv(1)), P(bot + 0.06, wb - 17.4 + wv(2)), P(bot + 0.03, wb - 8.4 + wv(1.5)), P(bot, wb)];
  celFill(ctx, () => _poly(ctx, pts), ['#0b0812', '#171124', '#2b2240'], A, { sd: 3 * U, hd: 0.6 * U, rim: true, detail: (g) => {
    _strokePts(g, [pts[0], pts[1], pts[2]], acc[2], 1.3 * U);
    _strokePts(g, [pts[3], pts[4], pts[5]], acc[1], 1 * U);
    const m = (u, w) => P(lerp(bot, top, u), w + lerp(wb, wt, u) + 14.6 + wv(1));
    g.fillStyle = ANIME.silver; g.beginPath(); _poly(g, [m(0.86, -22.5), m(0.86, -26.5), m(0.55, -24.4), m(0.55, -27.6), m(0.14, -24.2), m(0.42, -22.6), m(0.42, -20.6)]); g.fill();
  } });
  if (!A.flat) { const c = P(top + 0.06, wt + 0.6); ctx.fillStyle = ANIME.silver; ctx.beginPath(); ctx.arc(c[0], c[1], 1.6 * U, 0, TAU); ctx.fill(); }
};
