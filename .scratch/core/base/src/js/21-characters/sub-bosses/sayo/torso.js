SUB_ARMORS.operative_vest = function (ctx, f, key, A, S, U, P, acc, skin) {
  // a close vest of lacquered strips, a high wrapped collar, a strap of pale message slips across the chest
  const prof = { front: [[0.06, 12.6], [0.36, 12], [0.62, 13.4], [0.82, 14.2], [0.94, 12], [1.0, 6]], back: [[1.0, -7], [0.94, -13.6], [0.76, -14.4], [0.5, -12.2], [0.26, -12], [0.06, -12.8]] };
  celFill(ctx, () => animeTorso(ctx, S, prof, U), SUB_LACQ, A, { sd: 6.5 * U, hd: 1 * U, rim: true, detail: (g) => {
    for (let i = 1; i <= 5; i++) {
      const u = 0.08 + i * 0.145;
      _strokePts(g, [P(u + 0.012, -16), P(u + 0.012, 16)], SUB_LACQ[2], 0.8 * A.s);
      _strokePts(g, [P(u, -16), P(u, 16)], ANIME.outline, 1.1 * A.s);
      g.strokeStyle = acc[1]; g.lineWidth = 0.9 * U; g.beginPath(); for (let w = -10; w <= 12; w += 5.5) { const p = P(u - 0.02, w), q = P(u - 0.05, w); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); } g.stroke();
    }
    _strokePts(g, [P(0.98, -9), P(0.2, 14)], '#050405', 4.2 * U);
    _strokePts(g, [P(0.98, -9), P(0.2, 14)], SUB_LACQ[1], 2.4 * U);
    for (let i = 1; i <= 3; i++) {
      const k = i / 4, c = P(lerp(0.98, 0.2, k), lerp(-9, 14, k));
      g.fillStyle = SUB_PAPER[1]; g.fillRect(c[0] - 1.5 * U, c[1] - 2 * U, 3 * U, 3.4 * U);
      g.fillStyle = SUB_PAPER[0]; g.fillRect(c[0] - 1.5 * U, c[1] + 0.6 * U, 3 * U, 0.8 * U);
    }
  } });
  // the high wrapped collar
  const n0 = _sPt(S, U)(0.94, 0), n1 = { x: lerp(f.sk.neck.x, f.sk.head.x, 0.3), y: lerp(f.sk.neck.y, f.sk.head.y, 0.3) };
  celFill(ctx, () => animeCapsule(ctx, n0, n1, 5.4 * U, 4.6 * U, 0.3 * U, 0.5), SUB_LACQ, A, { sd: 2 * U, hd: 0.6 * U, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = 1 * A.s; g.beginPath();
    for (const k of [0.3, 0.65]) { const x = lerp(n0.x, n1.x, k), y = lerp(n0.y, n1.y, k); g.moveTo(x - S.nx * 6 * U, y - S.ny * 6 * U); g.lineTo(x + S.nx * 6 * U - S.ux * U, y + S.ny * 6 * U - S.uy * U); }
    g.stroke();
  } });
};
