/* ---- fists: huge bandaged fists with a glowing crack over the knuckles and a loose end trailing ---- */
Fighter.prototype.hollowFist = function (ctx, el, ha, A, U, far) {
  const dx = ha.x - el.x, dy = ha.y - el.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, R = 6.6 * U, ang = Math.atan2(uy, ux);
  const cx = ha.x + ux * R * 0.3, cy = ha.y + uy * R * 0.3;
  if (!far) {
    // the loose end of the binding, trailing back from the wrist
    const t = this.time || 0, w = Math.sin(t * 5) * 2 * U;
    celFill(ctx, () => {
      const bx = ha.x - ux * R * 0.6, by = ha.y - uy * R * 0.6, nx = -uy, ny = ux;
      ctx.moveTo(bx + nx * 1.6 * U, by + ny * 1.6 * U);
      ctx.quadraticCurveTo(bx - ux * 8 * U + nx * (4 * U + w), by - uy * 8 * U + 5 * U, bx - ux * 15 * U + nx * w, by - uy * 15 * U + 9 * U);
      ctx.quadraticCurveTo(bx - ux * 8 * U + nx * (1 * U + w), by - uy * 8 * U + 4 * U, bx - nx * 1.6 * U, by - ny * 1.6 * U);
      ctx.closePath();
    }, HOLLOW_WRAP, A, { sd: 1 * U });
  }
  celFill(ctx, () => { ctx.moveTo(cx + Math.cos(ang) * R * 1.12, cy + Math.sin(ang) * R * 1.12); ctx.ellipse(cx, cy, R * 1.12, R * 0.94, ang, 0, TAU); },
    far ? [HOLLOW_WRAP[0], HOLLOW_WRAP[0], HOLLOW_WRAP[1]] : HOLLOW_WRAP, A, { sd: 2.8 * U, hd: far ? 0 : 0.9 * U, rim: !far, detail: far ? null : (g) => {
      g.save(); g.translate(cx, cy); g.rotate(ang);
      for (const x of [-0.72, -0.3, 0.12, 0.52]) {
        g.strokeStyle = ANIME.outline; g.lineWidth = 1.2 * A.s; g.beginPath(); g.moveTo((x - 0.18) * R, -R); g.lineTo((x + 0.18) * R, R); g.stroke();
        g.strokeStyle = HOLLOW_WRAP[2]; g.lineWidth = 0.7 * A.s; g.beginPath(); g.moveTo((x - 0.1) * R, -R); g.lineTo((x + 0.26) * R, R); g.stroke();
      }
      hollowCrack(g, A, R, [[0.86, -0.5], [0.66, -0.1], [0.82, 0.2], [0.62, 0.58]], 0.8 * A.s);
      g.restore();
    } });
};
