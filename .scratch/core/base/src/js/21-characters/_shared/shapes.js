/* ---- part library (paths only; celFill fills them) ---- */
// a tapered sleeve / hakama / boot segment a -> b with radii ra, rb, swelling by `bulge` at `pos` along it
function animeCapsule(ctx, a, b, ra, rb, bulge, pos) {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy) || 0.001;
  const ux = dx / L, uy = dy / L, nx = -uy, ny = ux, an = Math.atan2(ny, nx);
  pos = pos == null ? 0.5 : pos;
  const rm = ra + (rb - ra) * pos + (bulge || 0), mx = a.x + dx * pos, my = a.y + dy * pos;
  const p0x = a.x + nx * ra, p0y = a.y + ny * ra, p2x = b.x + nx * rb, p2y = b.y + ny * rb;
  const q0x = b.x - nx * rb, q0y = b.y - ny * rb, q2x = a.x - nx * ra, q2y = a.y - ny * ra;
  ctx.moveTo(p0x, p0y);
  ctx.quadraticCurveTo(2 * (mx + nx * rm) - (p0x + p2x) / 2, 2 * (my + ny * rm) - (p0y + p2y) / 2, p2x, p2y);
  ctx.arc(b.x, b.y, rb, an, an - Math.PI, true);
  ctx.quadraticCurveTo(2 * (mx - nx * rm) - (q0x + q2x) / 2, 2 * (my - ny * rm) - (q0y + q2y) / 2, q2x, q2y);
  ctx.arc(a.x, a.y, ra, an + Math.PI, an, true);
  ctx.closePath();
}
