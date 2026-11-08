// a boot or sandalled foot: heel, flat sole, rounded toe; flexed with the shin like the old foot
function animeFootPath(ctx, knee, ankle, facing, h, len) {
  let sx = ankle.x - knee.x, sy = ankle.y - knee.y; const sl = Math.sqrt(sx * sx + sy * sy) || 1; sx /= sl; sy /= sl;
  const fx = facing > 0 ? sy : -sy, fy = facing > 0 ? -sx : sx, ax = ankle.x, ay = ankle.y;
  ctx.moveTo(ax - fx * h * 0.95 - sx * h * 0.7, ay - fy * h * 0.95 - sy * h * 0.7);
  ctx.lineTo(ax - fx * h * 1.05 + sx * h * 0.95, ay - fy * h * 1.05 + sy * h * 0.95);
  ctx.lineTo(ax + fx * len * 0.92 + sx * h * 0.95, ay + fy * len * 0.92 + sy * h * 0.95);
  ctx.quadraticCurveTo(ax + fx * (len + h * 0.5) + sx * h * 0.7, ay + fy * (len + h * 0.5) + sy * h * 0.7, ax + fx * len * 0.82 - sx * h * 0.05, ay + fy * len * 0.82 - sy * h * 0.05);
  ctx.quadraticCurveTo(ax + fx * h * 0.9 - sx * h * 0.5, ay + fy * h * 0.9 - sy * h * 0.5, ax + fx * h * 0.55 - sx * h * 0.85, ay + fy * h * 0.55 - sy * h * 0.85);
  ctx.closePath();
}
// the foot below the hakama: Kage's tall strapped boot shaft (feet 'boot'), then the boot or tabi-and-sandal foot with
// its sole (a straw sole on sandals). `far` is the leg behind the body: one tone darker, no detail lines.
Fighter.prototype.animeFoot = function (ctx, kn, ft, A, skin, U, far) {
  const pal = A.pal, f = this.facing, boot = skin.feet === 'boot';
  const btone = far ? [pal.boot[0], pal.boot[0], pal.boot[1]] : pal.boot;
  if (boot) {
    const bt = { x: lerp(kn.x, ft.x, 0.42), y: lerp(kn.y, ft.y, 0.42) };
    celFill(ctx, () => { animeCapsule(ctx, bt, ft, 6.2 * U, 5.0 * U, 0.3 * U, 0.4); }, btone, A, { sd: 2.6 * U, hd: far ? 0 : 0.7 * U, detail: far ? null : (g) => {
      // two dark straps with a dull buckle edge
      const dx = ft.x - bt.x, dy = ft.y - bt.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      const straps = () => { g.beginPath(); for (const k of [0.38, 0.64]) { g.moveTo(bt.x + dx * k + nx * 6.4 * U, bt.y + dy * k + ny * 6.4 * U); g.lineTo(bt.x + dx * (k + 0.1) - nx * 6.4 * U, bt.y + dy * (k + 0.1) - ny * 6.4 * U); } g.stroke(); };
      g.strokeStyle = '#030303'; g.lineWidth = 1.6 * U; straps();
      g.strokeStyle = ANIME.metal2; g.lineWidth = 0.6 * A.s; straps();
    } });
  }
  celFill(ctx, () => animeFootPath(ctx, kn, ft, f, 5 * U, 12.5 * U), btone, A, { sd: 1.8 * U, detail: (g) => {
    // the sole: a dull edge along the floor (a straw sole on sandals)
    let sx = ft.x - kn.x, sy = ft.y - kn.y; const sl = Math.hypot(sx, sy) || 1; sx /= sl; sy /= sl;
    const fx = f > 0 ? sy : -sy, fy = f > 0 ? -sx : sx, h = 4.6 * U;
    g.strokeStyle = boot ? ANIME.metal1 : '#3e3326'; g.lineWidth = 1.4 * U; g.beginPath();
    g.moveTo(ft.x - fx * h + sx * h * 0.85, ft.y - fy * h + sy * h * 0.85); g.lineTo(ft.x + fx * 11 * U + sx * h * 0.85, ft.y + fy * 11 * U + sy * h * 0.85); g.stroke();
  } });
};
