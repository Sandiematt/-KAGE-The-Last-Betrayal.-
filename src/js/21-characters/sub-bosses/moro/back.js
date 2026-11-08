// Moro's canister on his back: a lacquered drum strapped high, a window of violet memory light, a tube to his hood
Fighter.prototype.moroCanister = function (ctx, A, S, U) {
  const P = _sP(S, U), Pt = _sPt(S, U), acc = _subbAcc(this, 'conduit_harness'), t = this.time || 0;
  const a = Pt(0.88, -14), b = Pt(0.45, -15);
  celFill(ctx, () => animeCapsule(ctx, a, b, 5.4 * U, 5.4 * U, 0, 0.5), VIOLET_LACQ, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => {
    for (const k of [0.12, 0.88]) { const p = P(lerp(0.88, 0.45, k), -9), q = P(lerp(0.88, 0.45, k), -20); _strokePts(g, [p, q], SUB_IRON[2], 1.4 * U); }
    if (!A.flat) {
      const glow = 0.5 + 0.35 * Math.sin(t * 5);
      g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(155,124,255,${glow})`;
      g.beginPath(); _poly(g, [P(0.78, -12.6), P(0.78, -17.4), P(0.55, -17.4), P(0.55, -12.6)]); g.fill();
      g.globalCompositeOperation = 'source-over';
    }
  } });
  if (A.flat) return;
  // the tube from the canister's cap up into the hood
  const c0 = P(0.9, -15), c1 = P(1.18, -12), sk = this.sk, h = [lerp(sk.neck.x, sk.head.x, 0.7) - S.nx * 7 * U, lerp(sk.neck.y, sk.head.y, 0.7) - S.ny * 7 * U];
  ctx.lineCap = 'round';
  for (const [col, w] of [[ANIME.outline, 3.6], ['#2a2433', 2.4]]) { ctx.strokeStyle = col; ctx.lineWidth = w * U; ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.quadraticCurveTo(c1[0], c1[1], h[0], h[1]); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(185,150,255,${0.45 + 0.3 * Math.sin(t * 6)})`; ctx.lineWidth = 1.1 * U;
  ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.quadraticCurveTo(c1[0], c1[1], h[0], h[1]); ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  void acc;
};
