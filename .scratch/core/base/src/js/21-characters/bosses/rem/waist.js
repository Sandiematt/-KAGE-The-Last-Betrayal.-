/* ---- the body ---- */
// layers called from the body (_shared/): 'waist' at the sash. Young Rem's tasuki cord, crossed over the gi to
// tie back his sleeves
function remLayer(f, ctx, A, skin, U, layer) {
  if (skin.rem !== 'young' || layer !== 'waist') return;
  const S = A.S, P = (u, w) => ({ x: spX(S, u, w * U), y: spY(S, u, w * U) });
  for (const [a, b] of [[P(1.0, -9), P(0.42, 11.6)], [P(0.98, 7.4), P(0.5, -12.4)]]) {
    celFill(ctx, () => animeCapsule(ctx, a, b, 1.8 * U, 1.5 * U, 0, 0.5), REM_TASUKI, A, { sd: 0.8 * U, hd: 0.4 * U });
  }
  if (A.flat) return;
  // the knot where the cords cross at the back
  const k = P(0.8, -8.6);
  celFill(ctx, () => { ctx.moveTo(k.x + 2 * U, k.y); ctx.arc(k.x, k.y, 2 * U, 0, TAU); }, REM_TASUKI, A, { sd: 0.8 * U, hd: 0.4 * U });
}
