// the long pink panel from the back of the belt, streaming behind her: darker folds, a pale edge, sakura crests along it
function _akTail(f, ctx, A, U) {
  const cl = f.cloths.find(c => c.kind === 'atail'); if (!cl || !cl.c.init) return;
  const c = cl.c, hol = f.hollow, vio = _akV(f), floorY = f.y + 2 * A.s;
  const n = _akEdges(c, (u) => (14 + 14 * Math.pow(u, 0.8)) * U);
  for (let i = 0; i < n; i++) { _akL[i * 2 + 1] = Math.min(_akL[i * 2 + 1], floorY); _akR[i * 2 + 1] = Math.min(_akR[i * 2 + 1], floorY); }
  celFill(ctx, () => _akStrip(ctx, n, c, 0.7, hol ? 5 : 0, 9 * U), hol ? A.pal.coatB : vio, A, { sd: 6 * U, hd: 0.8 * U, rim: true, detail: (g) => {
    // two folds down the cloth, the pale band along both edges, the crests
    g.strokeStyle = hol ? ANIME.face : vio[0]; g.lineWidth = 1 * A.s; g.beginPath();
    for (const t of [0.36, 0.68]) for (let i = 1; i < n; i++) { const x = lerp(_akL[i * 2], _akR[i * 2], t), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    g.strokeStyle = hol ? vio[1] : vio[2]; g.lineWidth = 1.2 * U;
    if (hol) g.setLineDash([6 * U, 3 * U, 2 * U, 4 * U]);
    for (const E of [_akL, _akR]) { g.beginPath(); g.moveTo(E[2], E[3]); for (let i = 2; i < n; i++) g.lineTo(E[i * 2], E[i * 2 + 1]); g.stroke(); }
    g.setLineDash([]);
    const rot = Math.atan2(c.py[n - 1] - c.py[n - 2], c.px[n - 1] - c.px[n - 2]);
    for (const [j, R] of hol ? [[n - 2, 4.6]] : [[n - 2, 4.6], [Math.round(n * 0.55), 3.6]]) {
      const x = lerp(_akL[j * 2], _akR[j * 2], 0.5), y = lerp(_akL[j * 2 + 1], _akR[j * 2 + 1], 0.5);
      drawSakura(g, x, y, R * U, rot + j, hol ? AK_SAKURA_H[1] : '#fff0f6', hol ? AK_SAKURA_H[2] : vio[1], hol ? 2 : -1);
    }
  } });
}
