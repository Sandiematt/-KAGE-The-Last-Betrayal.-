// the long pink sash down the front from the belt, cut in a V, a pale sakura crest near the end
function _akSash(f, ctx, A, U) {
  const cl = f.cloths.find(c => c.kind === 'asash'); if (!cl || !cl.c.init) return;
  const c = cl.c, hol = f.hollow, vio = _akV(f);
  const n = _akEdges(c, (u) => (8.6 + 2.6 * u) * U);
  celFill(ctx, () => _akStrip(ctx, n, c, 0.8, hol ? 3 : 0, 6 * U), vio, A, { sd: 3 * U, hd: 0.9 * U, detail: (g) => {
    // a fold down the middle, darker near the knot, the pale edge line, the crest
    g.strokeStyle = vio[0]; g.lineWidth = 1 * A.s; g.beginPath();
    for (let i = 1; i < n; i++) { const x = lerp(_akL[i * 2], _akR[i * 2], 0.42 + Math.sin(i * 1.7) * 0.06), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], 0.42); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    g.fillStyle = vio[0]; g.beginPath(); g.moveTo(_akL[0], _akL[1]); g.lineTo(_akR[0], _akR[1]); g.lineTo(_akR[4], _akR[5]); g.lineTo(_akL[4], _akL[5]); g.closePath(); g.globalAlpha *= 0.6; g.fill(); g.globalAlpha /= 0.6;
    const rot = Math.atan2(c.py[n - 1] - c.py[n - 2], c.px[n - 1] - c.px[n - 2]);
    for (const [k, w, R] of hol ? [[0.76, 0.5, 3.6]] : [[0.5, 0.42, 2.6], [0.66, 0.6, 3.2], [0.82, 0.46, 3.8]]) {
      const j = Math.round((n - 1) * k), x = lerp(_akL[j * 2], _akR[j * 2], w), y = lerp(_akL[j * 2 + 1], _akR[j * 2 + 1], w);
      drawSakura(g, x, y, R * U, rot + k * 3, hol ? '#dac2ce' : '#fff0f6', vio[1], hol ? 1 : -1);
    }
    if (hol) hollowCrack(g, A, 1, [[_akL[6], _akL[7]], [lerp(_akL[8], _akR[8], 0.5), lerp(_akL[9], _akR[9], 0.5)], [_akR[10], _akR[11]]], 0.8 * U);
  } });
}
