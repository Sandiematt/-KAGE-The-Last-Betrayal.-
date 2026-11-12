/* ---- the torso overlay (drawArmor 'hollow_rags') ---- */
function drawHollowArmor(ctx, f, ink, flat) {
  const A = f._A;
  if (A.flat) return;   // the torso is already in the flat silhouette
  const S = A.S, U = A.U, pal = A.pal, sk = animeSkin(f), h = sk.hollow || { top: 'rip' };
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const line = (pts, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); };
  ctx.save(); ctx.beginPath(); animeTorso(ctx, S, sk.top === 'coat' ? ANIME_TORSO.coat : ANIME_TORSO.gi, U); ctx.clip();
  ctx.lineCap = 'round';
  if (sk.top !== 'coat') line([P(1.04, 0.5), P(0.62, 6.6), P(0.3, 8.6)], pal.acc, 1.2 * U);   // the violet edge of the crossed collar
  switch (h.top) {
    case 'rip': case 'coat': {
      // a rip across the chest, its lips frayed violet, the dark under-robe showing through
      const pts = _hsp(S, U, [[0.82, -9, 1], [0.74, -4, 1], [0.7, 0, 1], [0.6, 4, 1], [0.52, 9, 1], [0.44, 13, 1], [0.5, 10.4, 1], [0.56, 6.6, 1], [0.64, 2.4, 1], [0.7, -2.4, 1], [0.76, -6, 1]]);
      ctx.fillStyle = ANIME.face; ctx.beginPath(); orderShape(ctx, 1, pts); ctx.fill();
      line(pts.slice(5).concat([pts[0]]), pal.acc, 0.9 * A.s);
      if (h.top === 'coat') line([P(1.02, 2.4), P(0.62, 5.2), P(0.14, 6.6)], pal.acc, 0.8 * U);
      break;
    }
    case 'rope': {
      // crossed rope bindings and a stitched patch: a straw dummy that learned to stand
      const pa = P(0.72, -6), pb = P(0.3, 4);
      ctx.fillStyle = HOLLOW_SACK[1]; ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); for (const [u, w] of [[0.72, 2], [0.48, 3], [0.46, -6]]) { const p = P(u, w); ctx.lineTo(p[0], p[1]); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = HOLLOW_SACK[2]; ctx.lineWidth = 0.8 * A.s; ctx.setLineDash([1.6 * U, 1.4 * U]); ctx.stroke(); ctx.setLineDash([]);
      for (const [a, b] of [[P(1.0, -10), P(0.1, 12)], [P(1.0, 9), P(0.12, -12)]]) {
        line([a, b], HOLLOW_ROPE[0], 3.2 * U); line([a, b], HOLLOW_ROPE[1], 2.2 * U);
        ctx.strokeStyle = HOLLOW_ROPE[2]; ctx.lineWidth = 0.8 * A.s; ctx.beginPath();
        for (let i = 1; i < 12; i++) { const k = i / 12, x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k); ctx.moveTo(x - S.ux * 1.2 * U, y - S.uy * 1.2 * U); ctx.lineTo(x + S.nx * 1.1 * U, y + S.ny * 1.1 * U); }
        ctx.stroke();
      }
      void pb;
      break;
    }
    case 'wrap': {
      // the torso bound tight in wraps: diagonal bands, each with a dark seam and a lit edge
      for (const u of [0.18, 0.34, 0.5, 0.66]) {
        const q = [P(u, -14), P(u + 0.1, 14), P(u + 0.18, 14), P(u + 0.08, -14)];
        ctx.fillStyle = HOLLOW_WRAP[1]; ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill();
        line([q[3], q[2]], HOLLOW_WRAP[2], 0.9 * A.s); line([q[0], q[1]], ANIME.outline, 1.1 * A.s);
      }
      hollowCrack(ctx, A, 1, [P(0.86, -2), P(0.76, 2), P(0.7, 0.5), P(0.6, 5)], 0.8 * A.s);
      break;
    }
    case 'kesa': {
      // a patchwork kesa over the far shoulder, torn at its end, and a juzu of mask-pale beads
      const k = _hsp(S, U, [[1.02, -11, 1], [1.0, -3, 1], [0.0, 13, 1], [-0.06, 5, 1]]);
      ctx.fillStyle = HOLLOW_KESA[1]; ctx.beginPath(); orderShape(ctx, 1, k); ctx.fill();
      ctx.strokeStyle = HOLLOW_KESA[0]; ctx.lineWidth = 1 * A.s; ctx.beginPath();
      for (let i = 1; i < 6; i++) { const t = i / 6, a = [lerp(k[0][0], k[3][0], t), lerp(k[0][1], k[3][1], t)], b = [lerp(k[1][0], k[2][0], t), lerp(k[1][1], k[2][1], t)]; ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.stroke();
      line([k[1], k[2]], HOLLOW_KESA[2], 1.2 * A.s); line([k[0], k[3]], pal.acc, 1 * A.s);
      for (let i = 0; i < 13; i++) {
        const t = i / 12, u = 1.0 - Math.sin(t * Math.PI) * 0.42, w = lerp(-7, 10, t), p = P(u, w), big = i === 6;
        ctx.fillStyle = HOLLOW_MASK[0]; ctx.beginPath(); ctx.arc(p[0], p[1], (big ? 2.4 : 1.6) * U, 0, TAU); ctx.fill();
        ctx.fillStyle = HOLLOW_MASK[2]; ctx.beginPath(); ctx.arc(p[0] - A.lx * 0.5 * U, p[1] - A.ly * 0.5 * U, (big ? 1.4 : 0.9) * U, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'mirror': {
      // a cracked round mirror of mask lacquer on the chest, a crescent's twin
      const c = P(0.64, 5.6), R = 4.6 * U;
      ctx.fillStyle = HOLLOW_MASK[0]; ctx.beginPath(); ctx.arc(c[0], c[1], R + 0.8 * U, 0, TAU); ctx.fill();
      ctx.fillStyle = HOLLOW_MASK[1]; ctx.beginPath(); ctx.arc(c[0], c[1], R, 0, TAU); ctx.fill();
      ctx.fillStyle = HOLLOW_MASK[2]; ctx.beginPath(); ctx.arc(c[0], c[1], R, Math.PI * 0.9, Math.PI * 1.6); ctx.arc(c[0] + R * 0.25, c[1] + R * 0.1, R * 0.86, Math.PI * 1.6, Math.PI * 0.9, true); ctx.fill();
      ctx.save(); ctx.translate(c[0], c[1]);
      hollowCrack(ctx, A, R, [[-0.9, -0.3], [-0.2, 0.05], [0.1, -0.5], [0.5, 0.2], [0.95, 0.15]], 0.7 * A.s);
      ctx.restore();
      line([P(1.04, -8), P(0.7, 2)], ANIME.outline, 1.1 * A.s);
      break;
    }
    case 'veins': {
      // the robe hangs open on a black chest split by glowing cracks
      const o = _hsp(S, U, [[1.04, 1, 1], [0.7, 3], [0.36, 6, 1], [0.36, 15, 1], [1.04, 15, 1]]);
      ctx.fillStyle = ANIME.face; ctx.beginPath(); orderShape(ctx, 1, o); ctx.fill();
      line([o[0], o[1], o[2]], pal.fab[2], 1.4 * U);
      hollowCrack(ctx, A, 1, [P(0.92, 6), P(0.78, 8.4), P(0.7, 7), P(0.56, 10.6), P(0.44, 9)], 0.9 * A.s);
      hollowCrack(ctx, A, 1, [P(0.78, 8.4), P(0.74, 12)], 0.7 * A.s);
      break;
    }
  }
  ctx.restore();
  void ink; void flat;
}
