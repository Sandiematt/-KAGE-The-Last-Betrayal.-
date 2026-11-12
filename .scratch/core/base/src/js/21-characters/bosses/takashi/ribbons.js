/* ---- the ribbon from the back of the hat: two long red strands ---- */
function _tkRibbons(f, ctx, A) {
  const r = BODY.head * f.scale * f.build.head, red = f.hollow ? TK_RED_H : TK_RED, root = _akHeadPt(f, -0.86 * r, -0.44 * r), U = A.U;
  let first = true;
  for (const cl of f.cloths) {
    if (cl.kind !== 'tribbon' || !cl.c.init) continue;
    const c = cl.c, W = cl.w * U, main = first; first = false;
    const n = _akEdges(c, (u) => W * (u < 0.08 ? 0.6 : 1 - u * 0.35), root[0], root[1]);
    celFill(ctx, () => _akStrip(ctx, n, c, 0.9, f.hollow ? 2 : 0, 3 * U), main ? red : [red[0], red[0], red[1]], A, { sd: W * 0.35, hd: main ? W * 0.12 : 0, detail: (g) => {
      g.strokeStyle = red[0]; g.lineWidth = 0.8 * A.s; g.beginPath();
      for (let i = 1; i < n; i++) { const x = lerp(_akL[i * 2], _akR[i * 2], 0.5), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], 0.5); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
    } });
  }
}
