// suneate: a lacquered shin guard with three splints and crimson ties, over the bloused hakama
Fighter.prototype.orderSuneate = function (ctx, kn, ft, A, U, far) {
  const a = { x: lerp(kn.x, ft.x, 0.32), y: lerp(kn.y, ft.y, 0.32) }, b = { x: lerp(kn.x, ft.x, 0.93), y: lerp(kn.y, ft.y, 0.93) };
  const tone = far ? ORDER_LACQ_FAR : ORDER_LACQ;
  celFill(ctx, () => animeCapsule(ctx, a, b, 5.6 * U, 4.4 * U, 0.4 * U, 0.35), tone, A, { sd: 2.4 * U, hd: far ? 0 : 0.7 * U, detail: far ? null : (g) => {
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    g.strokeStyle = ANIME.outline; g.lineWidth = 1 * A.s; g.beginPath();
    for (const o of [-2.4, 0.4, 3]) { g.moveTo(a.x + nx * o * U + dx * 0.1, a.y + ny * o * U + dy * 0.1); g.lineTo(b.x + nx * o * 0.85 * U - dx * 0.04, b.y + ny * o * 0.85 * U - dy * 0.04); }
    g.stroke();
    g.strokeStyle = A.pal.acc; g.lineWidth = 1.2 * U; g.beginPath();
    for (const k of [0.16, 0.8]) { g.moveTo(a.x + dx * k + nx * 6 * U, a.y + dy * k + ny * 6 * U); g.lineTo(a.x + dx * (k + 0.05) - nx * 6 * U, a.y + dy * (k + 0.05) - ny * 6 * U); }
    g.stroke();
  } });
};
