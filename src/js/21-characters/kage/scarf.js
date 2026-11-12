/* ---- Kage's scarf (kageBody): a red scarf wound high round the neck. Its two long tails are cloth (the chains set up
   in 20-fighter.js), so they stream with the wind; this draws the wound band in two passes: the cowl standing behind
   the nape (before the head), then the fold crossing under the jaw (after it), so the chin sits down into the scarf. ---- */
function _kgScarf(f, ctx, K, front) {
  const P = _kgP(K), s = K.s, flat = K.A.flat;
  if (!front) {
    const cowl = [P(0.94, -9.4), P(1.14, -13.2), P(1.36, -10.6, 1), P(1.3, -2), P(1.2, 5), P(1.0, 8), P(0.9, 0)];
    _kgPart(ctx, K, () => _kgShape(ctx, cowl), KG.scarf, { sd: 4 * s, hd: 1 * s, line: KG.lineScarf, detail: flat ? null : (g) => {
      _kgLine(g, [P(1.3, -9.6), P(1.1, -6), P(0.98, -8.4)], KG.scarf[0], 1.1 * s);
    } });
    return;
  }
  const fold = [P(1.25, -10, 1), P(1.16, -2), P(1.22, 10, 1), P(1.06, 12.8), P(0.82, 8.4, 1), P(0.93, -1), P(0.96, -11.4, 1)];
  _kgPart(ctx, K, () => _kgShape(ctx, fold), KG.scarf, { sd: 4.2 * s, hd: 1.3 * s, line: KG.lineScarf, detail: flat ? null : (g) => {
    _kgLine(g, [P(1.17, -9), P(1.06, 0), P(1.1, 10.6)], KG.scarf[0], 1.1 * s);
    _kgLine(g, [P(1.05, -10), P(0.96, 0), P(0.9, 7)], KG.scarf[0], 1 * s);
    _kgLine(g, [P(1.1, 5), P(0.98, 9.4)], KG.scarf[2], 0.9 * s);
  } });
}
