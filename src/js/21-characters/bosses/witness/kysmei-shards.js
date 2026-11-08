/* ---- the Kysmei Robe's fragments drifting round its wearer (Kage; the Witness wears its armoured coat instead) ---- */
// `depth` -1 draws the shards behind the body, +1 the ones in front. Each shard has an anchor along the torso (u: 0 the
// hip, 1 the neck, below 0 a broken skirt toward the knees), a side offset, a size and a slow drift of its own. While its
// wearer comes apart (dissolve) or the Witness's shards re-form (shardMorph) they drift away from the body.
const KYSMEI_SHARDS = Array.from({ length: 18 }, (_, i) => {
  const r = n => _hash(i * 7.3 + n);
  return { u: i < 7 ? -0.15 - r(1) * 0.75 : r(1) * 1.05, side: (r(2) - 0.5) * 2.4, sz: 0.55 + r(3) * 0.75, ph: r(4) * TAU, rate: 0.8 + r(5) * 1.2, rot: r(6) * TAU, depth: i % 3 === 0 ? -1 : 1, kind: i % 4 };
});

Fighter.prototype.drawKysmei = function (ctx, depth, opt) {
  const sk = this.sk, s = this.scale, t = this.time || 0, flat = !!opt.color;
  const hx = sk.hip.x, hy = sk.hip.y, nx = sk.neck.x, ny = sk.neck.y, ang = Math.atan2(ny - hy, nx - hx), px = Math.cos(ang + Math.PI / 2), py = Math.sin(ang + Math.PI / 2);
  const spread = 1 + (this.dissolve ? this.dissolve * 2.4 : 0) + (this.shardMorph > 0 ? this.shardMorph : 0), U = 15 * s;
  ctx.save(); ctx.lineJoin = 'miter';
  for (const d of KYSMEI_SHARDS) {
    // the shards over the middle of the body drift behind it, so the robe's chest plate stays clear
    if ((d.depth > 0 && Math.abs(d.side) > 0.62 ? 1 : -1) !== depth) continue;
    const dx = Math.sin(t * d.rate + d.ph) * 4 * s, dy = Math.cos(t * d.rate * 0.8 + d.ph) * 5 * s;
    const ox = lerp(hx, nx, d.u) + px * d.side * U * spread + dx * spread - this.facing * (d.u < 0 ? -d.u * 10 * s : 0);
    const oy = lerp(hy, ny, d.u) + py * d.side * U * spread + dy + (d.u < 0 ? Math.abs(d.side) * 2 * s : 0);
    const z = d.sz * U * (d.u < 0 ? 1.05 : 0.8) * (depth > 0 ? 0.8 : 1), rot = d.rot + Math.sin(t * d.rate * 0.6 + d.ph) * 0.35;
    ctx.save(); ctx.translate(ox, oy); ctx.rotate(rot);
    const pts = d.kind === 0 ? [[0, -z], [z * 0.55, z * 0.7], [-z * 0.5, z * 0.5]] : d.kind === 1 ? [[-z * 0.4, -z * 0.8], [z * 0.45, -z * 0.6], [z * 0.3, z * 0.9], [-z * 0.5, z * 0.6]]
      : d.kind === 2 ? [[0, -z * 1.1], [z * 0.3, 0], [0, z * 1.1], [-z * 0.3, 0]] : [[-z * 0.6, -z * 0.3], [z * 0.7, -z * 0.5], [z * 0.2, z * 0.7]];
    ctx.fillStyle = flat ? opt.color : depth < 0 ? '#120d1c' : '#0a0712'; ctx.beginPath(); _poly(ctx, pts); ctx.fill();
    if (!flat) {
      // a lit facet (one cel step) and the violet edge, a crimson vein on some
      ctx.fillStyle = depth < 0 ? '#1d1530' : '#211838'; ctx.beginPath(); _poly(ctx, [pts[0], pts[1], [(pts[0][0] + pts[pts.length - 1][0]) * 0.3, (pts[0][1] + pts[pts.length - 1][1]) * 0.3]]); ctx.fill();
      ctx.strokeStyle = depth < 0 ? 'rgba(167,123,255,0.4)' : 'rgba(196,166,255,0.85)'; ctx.lineWidth = 1.1 * s; ctx.beginPath(); _poly(ctx, pts); ctx.stroke();
      if (d.kind === 1 && depth > 0) { ctx.strokeStyle = WT_CRIM[1]; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(pts[0][0] * 0.6, pts[0][1] * 0.6); ctx.lineTo(0, 0); ctx.lineTo(pts[2][0] * 0.6, pts[2][1] * 0.6); ctx.stroke(); }
    }
    ctx.restore();
  }
  ctx.restore();
};
