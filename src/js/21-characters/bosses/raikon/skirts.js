/* ---- the coat's long skirts: split front and back, torn at the hem, a red band above the tear ---- */
function _raiSkirt(f, ctx, A, U, part) {
  const cl = f.cloths.find(c => c.kind === 'rcoat' && c.part === part);
  if (!cl || !cl.c.init) return;
  const back = part === 'back', hol = _raiH(f), red = _raiRed(f), pal = A.pal, floorY = f.y + 2 * A.s;
  const n = coatEdges(cl, (back ? 24 : 17) * U, (back ? 50 : 34) * U, floorY);
  const K = hol ? (back ? 6 : 5) : back ? 3 : 2, rag = (hol ? 10 : 6) * U;
  celFill(ctx, () => tornPanelPath(ctx, n, K, rag, back ? 0 : 3, floorY), back ? pal.coatB : pal.coat, A, { sd: (back ? 7 : 5) * U, hd: back ? 0 : 0.9 * U, rim: true, detail: (g) => {
    g.strokeStyle = back ? ANIME.cloth0 : pal.coat[0]; g.lineWidth = 1 * A.s; g.beginPath();
    for (const t of [0.3, 0.62, 0.85]) for (let i = 1; i < n; i++) { const x = lerp(_cpL[i * 2], _cpR[i * 2], t + Math.sin(i * 1.3 + t * 5) * 0.05), y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    // the red band above the hem and a thin line over it; the front opening piped red
    if (hol) g.setLineDash([6 * U, 3 * U, 2 * U, 3 * U]);
    _hemLine(g, n, 4.4 * U, back ? red[0] : red[1], 3 * U);
    _hemLine(g, n, 8.6 * U, back ? red[0] : red[1], 0.9 * U);
    g.setLineDash([]);
    const front = (_cpL[0] - _cpR[0]) * f.facing > 0 ? _cpL : _cpR;
    g.strokeStyle = back ? red[0] : red[1]; g.lineWidth = 1.6 * U; g.beginPath(); g.moveTo(front[2], front[3]);
    for (let i = 2; i < n; i++) g.lineTo(front[i * 2], front[i * 2 + 1]);
    g.stroke();
  } });
}
