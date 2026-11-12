// Utsushi wears scraps of the operative's vest it copied: torn strips laced violet over its rags
function drawUtsushiScraps(ctx, f) {
  const A = f._A; if (!A || !A.S || A.flat) return;
  const S = A.S, U = A.U, P = _sP(S, U), acc = A.pal.accHi;
  for (const [u, w0, w1, jag] of [[0.58, -4, 12.4, 1], [0.44, 1, 12, 0], [0.72, -9, 8, 1]]) {
    const pts = [P(u + 0.06, w0), P(u + 0.06, w1), P(u, w1 + 0.4), P(u - 0.005, w0 + (jag ? 3 : 1)), P(u + 0.03, w0 + 1.4), P(u, w0 - 0.6)];
    celFill(ctx, () => _poly(ctx, pts), HOLLOW_MASK_FAR, A, { sd: 1.4 * U, hd: 0.4 * U, detail: (g) => {
      g.strokeStyle = acc; g.lineWidth = 0.8 * U; g.beginPath(); for (let w = w0 + 3; w < w1; w += 4.4) { const p = P(u + 0.05, w), q = P(u + 0.015, w); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); } g.stroke();
    } });
  }
}
