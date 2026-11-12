// the scarf: a red band wound twice round the neck (n0 the neck's base, n1 up toward the head). Its two long tails are
// cloth (the Cloth chains set up in 20-fighter.js), so they stream with the wind; this draws only the wound band.
function animeScarfWrap(ctx, S, A, U, n0, n1) {
  const w0 = { x: lerp(n0.x, n1.x, 0.05), y: lerp(n0.y, n1.y, 0.05) }, w1 = { x: lerp(n0.x, n1.x, 0.75), y: lerp(n0.y, n1.y, 0.75) };
  celFill(ctx, () => animeCapsule(ctx, w0, w1, 6.2 * U, 5.2 * U, 0.6 * U, 0.5), ['#8e1a1f', ANIME.scarf, '#ea6a5f'], A, { sd: 3.4 * U, hd: 1 * U, detail: (g) => {
    g.strokeStyle = '#6e1216'; g.lineWidth = 1 * A.s; g.beginPath();
    const mx = lerp(w0.x, w1.x, 0.5), my = lerp(w0.y, w1.y, 0.5);
    g.moveTo(mx + S.nx * 6 * U - S.ux * 1.4 * U, my + S.ny * 6 * U - S.uy * 1.4 * U); g.quadraticCurveTo(mx, my + 1.6 * U, mx - S.nx * 6 * U + S.ux * 1.6 * U, my - S.ny * 6 * U + S.uy * 1.6 * U); g.stroke();
  } });
}
