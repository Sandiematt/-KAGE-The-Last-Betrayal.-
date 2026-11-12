// the neck (black like the face), the coat's high collar behind it, Kage's scarf wound round it
Fighter.prototype.animeNeck = function (ctx, S, A, skin, U, hr) {
  const sk = this.sk, pal = A.pal;
  const n0 = { x: spX(S, 0.96, 0), y: spY(S, 0.96, 0) }, n1 = { x: lerp(sk.neck.x, sk.head.x, 0.62), y: lerp(sk.neck.y, sk.head.y, 0.62) };
  ctx.fillStyle = A.flat ? A.col : ANIME.face; ctx.beginPath(); animeCapsule(ctx, n0, n1, 3.6 * U, 3.2 * U, 0, 0.5); ctx.fill();
  if (skin.collar) {
    // a tall stiff collar standing up behind the neck, open at the throat
    const c0 = { x: spX(S, 0.95, -2.6 * U), y: spY(S, 0.95, -2.6 * U) }, c1 = { x: lerp(sk.neck.x, sk.head.x, 0.55) - S.nx * 3 * U, y: lerp(sk.neck.y, sk.head.y, 0.55) - S.ny * 3 * U };
    celFill(ctx, () => animeCapsule(ctx, c0, c1, 5.6 * U, 4.6 * U, 0.4 * U, 0.5), pal.coat, A, { sd: 2.6 * U, hd: 0.7 * U, rim: true });
  }
  if (skin.wrap) animeScarfWrap(ctx, S, A, U, n0, n1);   // Kage's scarf (kage/scarf.js)
};
