// the travel coat over the torso (drawArmor 'travel_coat'): wrapped shut left over right under a wide violet collar
// band, a stitched patch on the back of the shoulder, a fold at the waist; on Hollow Rem the band is broken and a rip
// opens across the chest. Drawn clipped to the torso, after it.
function drawRemCoat(ctx, f, ink, flat) {
  const A = f._A;
  if (!A || !A.S || A.flat || flat) return;
  const S = A.S, U = A.U, pal = A.pal, hol = animeSkin(f).rem === 'hollow';
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const line = (pts, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); };
  const acc = hol ? [ANIME.cloth0, '#3c3060', '#6a5a9c'] : subTone(REM_ACC);
  ctx.save(); ctx.beginPath(); animeTorso(ctx, S, ANIME_TORSO.coat, U); ctx.clip();
  ctx.lineCap = 'round';
  // the overlap: the front panel's edge running from the throat down to the obi, its shadow on the panel under it
  line([P(1.06, 2.6), P(0.62, 9.4), P(0.08, 11.6)], ANIME.outline, 2.4 * U);
  line([P(1.0, 1.4), P(0.6, 8.2), P(0.1, 10.4)], pal.coat[0], 1.4 * U);
  // the wide violet collar band along that edge, to mid-chest
  const band = () => { const a = P(1.1, -0.6), b = P(0.52, 7.6), c = P(0.5, 10.6), d = P(1.1, 3.2); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  celFill(ctx, band, [acc[0], acc[1], acc[2]], A, { sd: 1.2 * U, hd: 0.5 * U, detail: hol ? (g) => {
    // broken: gaps eaten out of the band
    g.fillStyle = pal.coat[1];
    for (const [u, w] of [[0.86, 4.4], [0.64, 8.2]]) { const p = P(u, w); g.beginPath(); g.moveTo(p[0] - 2 * U, p[1] - 2 * U); g.lineTo(p[0] + 2.6 * U, p[1]); g.lineTo(p[0] - 1 * U, p[1] + 2.4 * U); g.closePath(); g.fill(); }
  } : null });
  // folds from the armpit and at the waist under the obi
  line([P(0.82, -2.6), P(0.54, -4.2), P(0.32, -3.4)], pal.coat[0], 1 * A.s);
  line([P(0.36, 2), P(0.24, 5.4)], pal.coat[0], 1 * A.s);
  // a patch stitched over the back of the shoulder: the coat has been mended on the road
  const q = [P(0.9, -11), P(0.92, -5.4), P(0.7, -5.8), P(0.68, -11.4)];
  ctx.fillStyle = pal.coat[0]; ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill();
  ctx.setLineDash([1.4 * U, 1.2 * U]); ctx.strokeStyle = hol ? 'rgba(150,130,200,0.45)' : 'rgba(170,150,214,0.5)'; ctx.lineWidth = 0.7 * A.s; ctx.stroke(); ctx.setLineDash([]);
  if (hol) {
    // a rip across the chest, its lips frayed violet
    const pts = _hsp(S, U, [[0.5, 2, 1], [0.44, 6, 1], [0.38, 11, 1], [0.42, 8.6, 1], [0.48, 5.4, 1]]);
    ctx.fillStyle = ANIME.face; ctx.beginPath(); orderShape(ctx, 1, pts); ctx.fill();
    line(pts.slice(2).concat([pts[0]]), pal.acc, 0.9 * A.s);
  }
  ctx.restore();
  // the collar band folded round the base of the neck, so the violet still reads when the near arm covers the chest
  const c0 = { x: spX(S, 0.9, -6.4 * U), y: spY(S, 0.9, -6.4 * U) }, c1 = { x: spX(S, 1.02, 5.2 * U), y: spY(S, 1.02, 5.2 * U) };
  celFill(ctx, () => animeCapsule(ctx, c0, c1, 2.6 * U, 2.2 * U, 0.4 * U, 0.5), [acc[0], acc[1], acc[2]], A, { sd: 1.2 * U, hd: 0.6 * U, rim: true });
}
