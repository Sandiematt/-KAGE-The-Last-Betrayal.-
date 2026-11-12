/* ---- hands: Garan's iron tekko ---- */
Fighter.prototype.subFist = function (ctx, el, ha, A, U, far) {
  const dx = ha.x - el.x, dy = ha.y - el.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
  const acc = subTone(this.isPlayer ? '#ff6a52' : (animeSkin(this).acc || '#ff6a52')), tn = far ? [SUB_IRON[0], SUB_IRON[0], SUB_IRON[1]] : SUB_IRON;
  const r = 4.4 * U, c = { x: ha.x + ux * r * 0.3, y: ha.y + uy * r * 0.3 };
  // the cuff: a flared iron ring over the wrist
  celFill(ctx, () => animeCapsule(ctx, { x: ha.x - ux * 7 * U, y: ha.y - uy * 7 * U }, { x: ha.x - ux * 1.5 * U, y: ha.y - uy * 1.5 * U }, 4.2 * U, 5 * U, 0, 0.5), tn, A, { sd: 1.6 * U, hd: far ? 0 : 0.6 * U });
  celFill(ctx, () => { ctx.moveTo(c.x + ux * r * 1.2, c.y + uy * r * 1.2); ctx.ellipse(c.x, c.y, r * 1.2, r * 1.02, Math.atan2(uy, ux), 0, TAU); }, tn, A, { sd: 2 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far ? null : (g) => {
    // the knuckle plate across the front of the fist, three studs, a crackle of the storm still in it
    const k0 = [c.x + ux * r * 0.55 + nx * r * 0.95, c.y + uy * r * 0.55 + ny * r * 0.95], k1 = [c.x + ux * r * 0.55 - nx * r * 0.95, c.y + uy * r * 0.55 - ny * r * 0.95];
    _strokePts(g, [k0, k1], ANIME.outline, 1.4 * U);
    _strokePts(g, [[k0[0] - ux * 1.2 * U, k0[1] - uy * 1.2 * U], [k1[0] - ux * 1.2 * U, k1[1] - uy * 1.2 * U]], SUB_IRON[2], 0.9 * U);
    g.fillStyle = ANIME.silver;
    for (const t of [-0.55, 0, 0.55]) { g.beginPath(); g.arc(c.x + ux * r * 0.85 + nx * r * t, c.y + uy * r * 0.85 + ny * r * t, 0.8 * U, 0, TAU); g.fill(); }
    if (!A.flat) _bolt(g, [[c.x - ux * r * 0.6 + nx * r * 0.5, c.y - uy * r * 0.6 + ny * r * 0.5], [c.x - nx * r * 0.1, c.y - ny * r * 0.1], [c.x + ux * r * 0.2 + nx * r * 0.3, c.y + uy * r * 0.2 + ny * r * 0.3], [c.x + ux * r * 0.45 - nx * r * 0.5, c.y + uy * r * 0.45 - ny * r * 0.5]], 0.55 * U, acc[2]);
  } });
};
