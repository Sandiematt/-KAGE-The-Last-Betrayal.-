/* ---- cel fill: base, a shadow strip on the side away from the light, an optional lit edge and the red rim ---- */
// P() adds one closed sub-path (no beginPath); tone = [shadow, base, highlight]; A = the draw state (animeState)
// o: { sd shadow depth px, hd highlight depth px (0 none), rim true for the red rim strip, detail(ctx) drawn clipped }
function celFill(ctx, P, tone, A, o) {
  ctx.beginPath(); P();
  if (A.flat) { ctx.fillStyle = A.col; ctx.fill(); return; }
  ctx.fillStyle = tone[1]; ctx.fill();
  ctx.save(); ctx.clip();
  const lx = A.lx, ly = A.ly, sd = (o && o.sd) || 3 * A.s;
  const strip = (dx, dy, col) => {
    ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
    ctx.translate(dx, dy); P(); ctx.translate(-dx, -dy);
    ctx.fillStyle = col; ctx.fill('evenodd');
  };
  strip(lx * sd, ly * sd, tone[0]);
  if (o && o.hd) strip(-lx * o.hd, -ly * o.hd, tone[2]);
  if (o && o.detail) o.detail(ctx);
  // a thin crimson rim on the part's back edge (only the parts that carry the silhouette ask for it), then a fine dark
  // seam round the part, half its width inside the clip, so overlapping layers separate without a bright outline
  if (o && o.rim) strip(lx * 0.8 * A.s, ly * 0.8 * A.s, A.pal.rim);
  if (!(o && o.seam === false)) { ctx.beginPath(); P(); ctx.strokeStyle = ANIME.outline; ctx.lineWidth = 1.5 * A.s; ctx.stroke(); }
  ctx.restore();
}

// a fold line: the dark crease with a lit edge one pixel toward the light, so folds still read on near-black cloth
function animeFold(g, A, tone, path) {
  const ox = -A.lx * 1.1 * A.s, oy = -A.ly * 1.1 * A.s;
  g.lineCap = 'round'; g.lineWidth = 0.8 * A.s; g.strokeStyle = tone[2];
  g.translate(ox, oy); g.beginPath(); path(); g.stroke(); g.translate(-ox, -oy);
  g.lineWidth = 1.1 * A.s; g.strokeStyle = ANIME.outline; g.beginPath(); path(); g.stroke();
}
