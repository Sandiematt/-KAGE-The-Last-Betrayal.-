/* ---- motifs ---- */
// the wave: a row of seigaiha scallops (two arcs each) under a curling crest, gold, as on the hem of his cape
function takashiWave(g, x, y, R, rot, col, lw) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
  g.beginPath();
  for (const cx of [-R * 1.1, 0, R * 1.1]) for (const k of [1, 0.58]) { g.moveTo(cx - R * 0.55 * k, 0); g.arc(cx, 0, R * 0.55 * k, Math.PI, TAU); }
  // the crest curling over the scallops
  g.moveTo(-R * 1.4, -R * 0.62); g.quadraticCurveTo(-R * 0.3, -R * 1.25, R * 0.55, -R * 0.95);
  g.quadraticCurveTo(R * 1.05, -R * 0.7, R * 0.7, -R * 0.42); g.quadraticCurveTo(R * 0.45, -R * 0.3, R * 0.36, -R * 0.56);
  g.stroke();
  g.restore();
}

// a gold tassel: a cord a -> knot, then the tassel's flared skirt, `dir` the hanging direction (unit)
function _tkTassel(ctx, A, a, len, dx, dy, w, gold) {
  const k = { x: a.x + dx * len, y: a.y + dy * len }, e = { x: k.x + dx * w * 2.6, y: k.y + dy * w * 2.6 }, nx = -dy, ny = dx;
  celFill(ctx, () => animeCapsule(ctx, a, k, w * 0.32, w * 0.32, 0, 0.5), [gold[0], gold[0], gold[1]], A, { sd: w * 0.2, seam: false });
  celFill(ctx, () => { ctx.moveTo(k.x + w * 0.62, k.y); ctx.arc(k.x, k.y, w * 0.62, 0, TAU); }, gold, A, { sd: w * 0.3, hd: w * 0.15 });
  celFill(ctx, () => { ctx.moveTo(k.x + nx * w * 0.45, k.y + ny * w * 0.45); ctx.lineTo(e.x + nx * w * 0.8, e.y + ny * w * 0.8); ctx.lineTo(e.x - nx * w * 0.8, e.y - ny * w * 0.8); ctx.lineTo(k.x - nx * w * 0.45, k.y - ny * w * 0.45); ctx.closePath(); }, gold, A, { sd: w * 0.4, hd: w * 0.15, detail: A.flat ? null : (g) => {
    g.strokeStyle = gold[0]; g.lineWidth = Math.max(0.6, w * 0.16); g.beginPath();
    for (const t of [-0.4, 0, 0.4]) { g.moveTo(k.x + nx * w * 0.45 * t + dx * w * 0.6, k.y + ny * w * 0.45 * t + dy * w * 0.6); g.lineTo(e.x + nx * w * 0.8 * t, e.y + ny * w * 0.8 * t); }
    g.stroke();
  } });
}
