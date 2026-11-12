function drawRaikonArmor(ctx, f, ink, flat) {
  const A = f._A;
  const S = A.S, U = A.U, P = _sP(S, U), hol = _raiH(f), red = _raiRed(f), pal = A.pal;
  // the breastplate: three lacquered lames laced red, clipped to the coat's torso
  if (!A.flat) {
    ctx.save(); ctx.beginPath(); animeTorso(ctx, S, ANIME_TORSO.coat, U); ctx.clip();
    const top = (u) => [P(u, -12), P(u, 13.6)];
    const plate = (u0, u1, k) => { const [a0, a1] = top(u0), [b0, b1] = top(u1); _quad(ctx, a0, a1, b1, b0, 1.2 * U * k); };
    for (const [u0, u1] of [[0.62, 0.86], [0.44, 0.64], [0.26, 0.46]]) {
      const [a0, a1] = top(u0), [b0, b1] = top(u1);
      const Q = (k, t) => [lerp(lerp(a0[0], a1[0], k), lerp(b0[0], b1[0], k), t), lerp(lerp(a0[1], a1[1], k), lerp(b0[1], b1[1], k), t)];
      celFill(ctx, () => plate(u0, u1, 1), hol ? RAI_LACQ_H : RAI_PLATE, A, { sd: 2.6 * U, hd: 0.9 * U, detail: (g) => _lace(g, A, Q, 1, 6, RAI_PLATE, 1 * U, red[0]) });
    }
    // the crossed collar of the coat over the plate, piped red
    const lap = () => { const a = P(1.1, -1), b = P(0.62, 10.5), c = P(0.56, 14), d = P(1.1, 6); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
    celFill(ctx, lap, pal.coat, A, { sd: 1.4 * U, hd: 0.6 * U, detail: (g) => _strokePts(g, [P(1.1, 0.8), P(0.62, 11.6)], red[1], 1.1 * U) });
    // the cords crossed over the chest, from each shoulder down to the obi
    for (const [a, b, k] of [[P(1.0, -11), P(0.2, 11), 0], [P(1.02, 9), P(0.22, -8), 1]]) {
      const pa = { x: a[0], y: a[1] }, pb = { x: b[0], y: b[1] };
      celFill(ctx, () => animeCapsule(ctx, pa, pb, 1.05 * U, 1.05 * U, 0, 0.5), k ? red : [red[0], red[0], red[1]], A, { sd: 0.8 * U, hd: 0.4 * U, seam: !!k });
    }
    ctx.restore();
  }
  // the fur mantle round the nape and over the back shoulder
  const ft = hol ? RAI_FUR_H : RAI_FUR;
  // a second, darker layer of tufts behind, so the mantle reads thick
  celFill(ctx, () => { ctx.save(); const cx = spX(S, 0.94, -5 * U), cy = spY(S, 0.94, -5 * U); ctx.translate(cx, cy); ctx.rotate(-0.2 * f.facing); ctx.translate(-cx, -cy); _raiFurPath(ctx, S, U, 0.86, f.facing); ctx.restore(); },
    [ft[0], ft[0], ft[1]], A, { sd: 2 * U, rim: true });
  celFill(ctx, () => _raiFurPath(ctx, S, U, 1, f.facing), ft, A, { sd: 4.6 * U, hd: 1.2 * U, rim: true, detail: (g) => {
    // strands combed out along each tuft from the root
    const m = _raiFurPts(S, U, 0.8), cx = spX(S, 0.94, -5 * U), cy = spY(S, 0.94, -5 * U);
    g.lineCap = 'round'; g.lineWidth = 0.9 * A.s; g.strokeStyle = ft[0]; g.beginPath();
    for (let i = 0; i < m; i += 2) { const x = _rfur[i * 2], y = _rfur[i * 2 + 1]; g.moveTo(lerp(cx, x, 0.3), lerp(cy, y, 0.3)); g.quadraticCurveTo(lerp(cx, x, 0.6) + (y - cy) * 0.08, lerp(cy, y, 0.6) - (x - cx) * 0.08, x, y); }
    g.stroke();
    if (hol) { g.fillStyle = ANIME.face; const p = _hsp(S, U, [[0.9, -12, 1], [0.8, -15, 1], [0.84, -11, 1], [0.74, -9, 1]]); g.beginPath(); orderShape(g, 1, p); g.fill(); }
  } });
  void ink; void flat;
}
