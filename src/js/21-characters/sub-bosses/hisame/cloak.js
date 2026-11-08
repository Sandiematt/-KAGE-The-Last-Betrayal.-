// Hisame's rain cape: a mino of oiled strands from the shoulders, its hem a long fringe
Fighter.prototype.subShroud = function (ctx, A, U) {
  const cl = this.cloths.find(c => c.kind === 'sub' && c.part === 'shroud');
  if (!cl || !cl.c.init) return;
  const floorY = this.y + 2 * A.s, n = coatEdges(cl, 20 * U, 40 * U, floorY), acc = subTone(SUB_ACC.mist_shroud);
  celFill(ctx, () => tornPanelPath(ctx, n, 8, 7 * U, 2, floorY), RAIN, A, { sd: 6 * U, hd: 0, rim: true, detail: (g) => {
    // overlapping strand rows: short dark strokes down the cape, a lit edge over each row
    for (let r = 1; r < n - 1; r += 1.4) {
      g.strokeStyle = RAIN[2]; g.lineWidth = 0.8 * A.s; g.beginPath();
      const a = _panelAt(n, r, -0.1), b = _panelAt(n, r, 1.1); g.moveTo(a[0], a[1] - 1.2 * A.s); g.lineTo(b[0], b[1] - 1.2 * A.s); g.stroke();
      g.strokeStyle = ANIME.outline; g.lineWidth = 0.9 * A.s; g.beginPath();
      for (let k = 0; k < 9; k++) { const t = (k + 0.5) / 9, p = _panelAt(n, r, t), q = _panelAt(n, r + 1.1, t + 0.02); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
      g.stroke();
    }
    _hemLine(g, n, 8 * U, acc[1], 0.9 * U);
  } });
};
