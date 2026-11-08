/* ---- the robe skirts: long, to the ankle, a gold band and waves at the hem, the front opening edged gold ---- */
function _tkSkirt(f, ctx, A, U, part) {
  const cl = f.cloths.find(c => c.kind === 'trobe' && c.part === part);
  if (!cl || !cl.c.init) return;
  const back = part === 'back', hol = _tkH(f), gold = _tkG(f), pal = A.pal, floorY = f.y + 2 * A.s;
  const n = coatEdges(cl, (back ? 26 : 19) * U, (back ? 50 : 36) * U, floorY);
  const K = hol ? (back ? 6 : 5) : 0, rag = 9 * U;
  const tone = hol ? (back ? pal.coatB : pal.coat) : back ? ['#040204', TK_ROBE[0], TK_ROBE[1]] : TK_ROBE;
  celFill(ctx, () => (K ? tornPanelPath(ctx, n, K, rag, back ? 0 : 3, floorY) : coatPanelPath(ctx, n)), tone, A, { sd: (back ? 7 : 5) * U, hd: back ? 0 : 0.9 * U, rim: true, detail: (g) => {
    g.strokeStyle = back ? ANIME.face : tone[0]; g.lineWidth = 1 * A.s; g.beginPath();
    for (const t of [0.28, 0.56, 0.82]) for (let i = 1; i < n; i++) { const x = lerp(_cpL[i * 2], _cpR[i * 2], t + Math.sin(i * 1.3 + t * 5) * 0.05), y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    // the gold hem band and a thin line over it (broken on the echo)
    if (hol) g.setLineDash([6 * U, 3 * U, 2 * U, 3 * U]);
    _hemLine(g, n, 3.6 * U, back ? gold[0] : gold[1], 2.6 * U);
    _hemLine(g, n, 7.6 * U, back ? gold[0] : gold[1], 0.9 * U);
    g.setLineDash([]);
    // the waves over the hem
    const lx = _cpL[(n - 1) * 2], ly = _cpL[(n - 1) * 2 + 1], rx = _cpR[(n - 1) * 2], ry = _cpR[(n - 1) * 2 + 1], rot = Math.atan2(ry - ly, rx - lx);
    for (const t of back ? [0.22, 0.58] : [0.5]) {
      const i = n - 2, x = lerp(_cpL[i * 2], _cpR[i * 2], t), y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t);
      takashiWave(g, x, y, (back ? 3.6 : 3.2) * U, rot + (f.facing > 0 ? 0 : Math.PI), back ? gold[0] : gold[1], 1 * U);
    }
    // the front opening edged gold
    const front = (_cpL[0] - _cpR[0]) * f.facing > 0 ? _cpL : _cpR;
    g.strokeStyle = back ? gold[0] : gold[1]; g.lineWidth = 1.5 * U; g.beginPath(); g.moveTo(front[2], front[3]);
    for (let i = 2; i < n; i++) g.lineTo(front[i * 2], front[i * 2 + 1]);
    g.stroke();
  } });
}
