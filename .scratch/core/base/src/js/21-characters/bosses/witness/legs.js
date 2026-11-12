/* ---- the legs (witnessBody): slim dark trousers, one shape from hip to ankle, a crimson stripe down the near shin,
   and pointed boots. In each limb's frame: o design px toward the front of the leg (the way it faces). ---- */
function _wtLeg(f, ctx, W, hp, kn, ft, far) {
  const s = W.s, L = WT_L, fc = W.fc, lw = far ? W.lwFar : W.lw, line = far ? L.dim : L.line, ink = far ? WT_FAR : L.bodyInk;
  const T = _wtLimb(hp, kn, fc), G = _wtLimb(kn, ft, fc);
  const knee = (o) => lerp2(T.at(1, o * s), G.at(0, o * s), 0.5);
  const leg = [T.at(-0.06, 12 * s), T.at(0.5, 10.8 * s), knee(8), G.at(0.5, 6.4 * s), G.at(0.86, 5 * s), G.at(0.86, -5 * s), G.at(0.36, -7.2 * s), knee(-8), T.at(0.44, -11.4 * s), T.at(-0.06, -13 * s)];
  _wtPart(ctx, W, () => _poly(ctx, leg), ink, { lw, line, sd: 4 * s, hd: far ? 0 : 1 * s, detail: W.A.flat ? null : (g) => {
    _wtLine(g, W, [knee(-1.4), T.at(0.42, -2.6 * s)], far ? L.bodyInk[0] : L.bodyInk[2], 1 * s);   // a crease down the thigh
    if (!far) _wtLine(g, W, [G.at(0.06, -4.8 * s), G.at(0.84, -3.4 * s)], '#c0303c', 1.3 * s);    // the crimson stripe
  } });
  // the boot: the shaft over the ankle, a long pointed toe, a low heel
  const fx = G.nx, fy = G.ny, dx = G.ux, dy = G.uy, at = (a, b) => [ft.x + fx * a * s + dx * b * s, ft.y + fy * a * s + dy * b * s];
  const boot = [G.at(0.74, 5.4 * s), at(5.4, -1.2), at(10, 0.6), at(17.4, 2.6), at(10.4, 3.6), at(-3.2, 3.6), at(-5.2, 1.6), at(-5.6, -3.4), G.at(0.74, -5.4 * s)];
  _wtPart(ctx, W, () => _poly(ctx, boot), ink, { lw, line, sd: 2 * s, hd: far ? 0 : 0.8 * s, detail: W.A.flat || far ? null : (g) => {
    _wtLine(g, W, [G.at(0.8, 5.2 * s), G.at(0.8, -5.2 * s)], L.bodyInk[2], 1 * s);   // the top of the boot
  } });
}
