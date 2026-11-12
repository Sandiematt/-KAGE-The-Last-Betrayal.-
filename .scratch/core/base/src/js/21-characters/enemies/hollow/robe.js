/* ---- robes and cape ---- */
Fighter.prototype.hollowRobe = function (ctx, A, skin, U, part) {
  const cl = this.cloths.find(c => c.kind === 'hrobe' && c.part === part);
  if (!cl || !cl.c.init) return;
  const h = skin.hollow, spec = part === 'cape' ? [0, 0, 14, 40] : h.robe[part], back = part !== 'flap';
  const floorY = this.y + 2 * A.s;
  const n = coatEdges(cl, spec[2] * U, spec[3] * U, floorY);
  const K = part === 'cape' ? 5 : h.robe.teeth - (part === 'flap' ? 1 : 0), rag = h.robe.rag * U * (part === 'cape' ? 1.4 : 1), seed = part === 'flap' ? 3 : part === 'cape' ? 5 : 0;
  const pal = A.pal, tone = part === 'cape' ? pal.back : back ? pal.coatB : pal.fab;
  celFill(ctx, () => tornPanelPath(ctx, n, K, rag, seed, floorY), tone, A, { sd: (back ? 7 : 5) * U, hd: back ? 0 : 0.9 * U, rim: true, detail: (g) => {
    // fold lines running down the panel
    g.strokeStyle = back ? ANIME.cloth0 : pal.fab[0]; g.lineWidth = 1 * A.s;
    g.beginPath();
    for (const t of [0.3, 0.62, 0.84]) { for (let i = 1; i < n; i++) { const x = lerp(_cpL[i * 2], _cpR[i * 2], t + Math.sin(i * 1.3 + t * 5) * 0.05), y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); } }
    g.stroke();
    // the remnant of a violet band near the hem, broken where the cloth tore
    if (n > 3) {
      const i = n - 2;
      g.globalAlpha *= 0.55; g.strokeStyle = pal.acc; g.lineWidth = 1.1 * U; g.setLineDash([5 * U, 3 * U, 2 * U, 4 * U]);
      g.beginPath(); g.moveTo(_cpL[i * 2], _cpL[i * 2 + 1]); g.lineTo(_cpR[i * 2], _cpR[i * 2 + 1]); g.stroke();
      g.setLineDash([]); g.globalAlpha /= 0.55;
    }
    // tears through the cloth
    for (const [ii, t, sz] of [[Math.floor(n * 0.55), 0.3, 1], [n - 2, 0.7, 0.8]]) {
      if (ii < 1 || ii >= n) continue;
      const x = lerp(_cpL[ii * 2], _cpR[ii * 2], t), y = lerp(_cpL[ii * 2 + 1], _cpR[ii * 2 + 1], t);
      const rot = Math.atan2(_cpR[ii * 2 + 1] - _cpL[ii * 2 + 1], _cpR[ii * 2] - _cpL[ii * 2]);
      _tear(g, A, x, y, 3.2 * U * sz, 2.4 * U * sz, rot);
    }
  } });
};
