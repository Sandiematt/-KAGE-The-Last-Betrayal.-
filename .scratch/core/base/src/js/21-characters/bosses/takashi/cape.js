/* ---- the long cape behind him: two panels from the shoulders, gold-edged, gold waves near the hem ---- */
function _tkCape(f, ctx, A, U) {
  const hol = _tkH(f), gold = _tkG(f), floorY = f.y + 2 * A.s, S = A.S;
  for (const cl of f.cloths) {
    if (cl.kind !== 'tcape' || !cl.c.init || !cl.far) continue;
    _tkCapePanel(f, ctx, A, U, cl, true, hol, gold, floorY, S);
  }
  for (const cl of f.cloths) {
    if (cl.kind !== 'tcape' || !cl.c.init || cl.far) continue;
    _tkCapePanel(f, ctx, A, U, cl, false, hol, gold, floorY, S);
  }
}

function _tkCapePanel(f, ctx, A, U, cl, far, hol, gold, floorY, S) {
  const c = cl.c, W = cl.w * U, root = [spX(S, 0.98, (far ? -9 : -6) * U), spY(S, 0.98, (far ? -9 : -6) * U)];
  const n = _akEdges(c, (u) => W * (0.42 + 0.58 * Math.pow(u, 0.7)), root[0], root[1]);
  for (let i = 0; i < n; i++) { _akL[i * 2 + 1] = Math.min(_akL[i * 2 + 1], floorY); _akR[i * 2 + 1] = Math.min(_akR[i * 2 + 1], floorY); }
  const tone = hol ? (far ? A.pal.back : A.pal.coatB) : far ? [ANIME.face, TK_CAPE[0], TK_CAPE[1]] : TK_CAPE;
  celFill(ctx, () => _akStrip(ctx, n, c, 0.25, hol ? (far ? 4 : 6) : 0, (hol ? 11 : 0) * U), tone, A, { sd: 7 * U, hd: far ? 0 : 0.9 * U, rim: true, detail: (g) => {
    // folds down the cape
    g.strokeStyle = ANIME.face; g.lineWidth = 1 * A.s; g.beginPath();
    for (const t of [0.3, 0.55, 0.78]) for (let i = 1; i < n; i++) { const x = lerp(_akL[i * 2], _akR[i * 2], t + Math.sin(i * 1.1 + t * 7) * 0.04), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    // the gold edge down both sides (the echo's broken)
    g.strokeStyle = far ? gold[0] : gold[1]; g.lineWidth = 1.5 * U;
    if (hol) g.setLineDash([7 * U, 3 * U, 2 * U, 4 * U]);
    for (const E of [_akL, _akR]) { g.beginPath(); g.moveTo(E[2], E[3]); for (let i = 2; i < n; i++) g.lineTo(E[i * 2], E[i * 2 + 1]); g.stroke(); }
    g.setLineDash([]);
    if (far) return;
    // the gold band above the hem, and the waves embroidered over it
    const j = n - 2, rot = Math.atan2(_akR[j * 2 + 1] - _akL[j * 2 + 1], _akR[j * 2] - _akL[j * 2]);
    g.strokeStyle = gold[1]; g.lineWidth = 2.2 * U; g.beginPath();
    if (hol) g.setLineDash([6 * U, 4 * U]);
    g.moveTo(lerp(_akL[j * 2], _akL[j * 2 + 2], 0.6), lerp(_akL[j * 2 + 1], _akL[j * 2 + 3], 0.6)); g.lineTo(lerp(_akR[j * 2], _akR[j * 2 + 2], 0.6), lerp(_akR[j * 2 + 1], _akR[j * 2 + 3], 0.6)); g.stroke();
    g.setLineDash([]);
    for (const [i, t, R] of [[n - 3, 0.3, 5.2], [n - 3, 0.72, 4.4], [n - 4, 0.52, 3.6]]) {
      const x = lerp(_akL[i * 2], _akR[i * 2], t), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], t);
      takashiWave(g, x, y, R * U, rot + (f.facing > 0 ? 0 : Math.PI), gold[1], 1.15 * U);
    }
    if (hol) _tear(g, A, lerp(_akL[8], _akR[8], 0.5), lerp(_akL[9], _akR[9], 0.5), 4 * U, 3.4 * U, 0.6);
  } });
}
