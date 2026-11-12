/* ---- Kage's legs (kageBody): black hakama, full at the thigh and gathered below the knee into tall leather boots; a
   dark steel shin guard with a pointed knee, tied on with crimson cord; a long boot with a low heel and a sharp toe.
   In each limb's frame: u along it, o design px toward the front of the leg. `far` is the leg behind the body. ---- */
function _kgLeg(f, ctx, K, hp, kn, ft, far) {
  const s = K.s, fc = K.fc, lw = far ? K.lwFar : K.lw, line = far ? KG.lineFar : KG.line, flat = K.A.flat;
  const cloth = far ? KG.innerFar : KG.inner, boot = far ? KG.bootFar : KG.boot, metal = far ? KG.metalFar : KG.metal;
  const T = _kgLimb(hp, kn, fc), G = _kgLimb(kn, ft, fc);
  const knee = (o, sharp) => { const a = T.at(1, o * s), b = G.at(0, o * s); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, sharp]; };
  // the hakama: hip to the boot's top, one shape, the knee its fold
  const leg = [T.at(-0.1, 10.4 * s), T.at(0.36, 11 * s), T.at(0.8, 9 * s), knee(8.6), G.at(0.2, 8 * s), G.at(0.46, 6.6 * s, 1),
    G.at(0.46, -6.6 * s, 1), G.at(0.16, -8.6 * s), knee(-7.8), T.at(0.66, -9.6 * s), T.at(0.28, -11.6 * s), T.at(-0.1, -11 * s)];
  _kgPart(ctx, K, () => _kgShape(ctx, leg), cloth, { lw, line, sd: 5 * s, hd: far ? 0 : 1 * s, rim: !far, detail: flat || far ? null : (g) => {
    // the pleats, hip to knee, and the gather above the boot
    _kgLine(g, [T.at(0.04, 4.6 * s), T.at(0.9, 3.4 * s)], KG.inner[2], 0.8 * s);
    _kgLine(g, [T.at(0.06, -2.4 * s), T.at(0.84, -2.8 * s)], KG.inner[2], 0.8 * s);
    _kgLine(g, [G.at(0.08, 3 * s), G.at(0.4, 2 * s)], KG.inner[2], 0.8 * s);
    _kgLine(g, [G.at(0.1, -4 * s), G.at(0.4, -2.6 * s)], KG.inner[2], 0.8 * s);
  } });
  // the boot: a cuffed shaft over the gathered hakama, the foot flexing with the shin
  const at = (a, b, sharp) => [ft.x + G.nx * a * s + G.ux * b * s, ft.y + G.ny * a * s + G.uy * b * s, sharp];
  const bt = [G.at(0.4, 7.6 * s, 1), G.at(0.5, 6.2 * s, 1), G.at(0.86, 5 * s), at(7, -1.4), at(13, 0.4), at(19.6, 3.2, 1), at(11, 3.9, 1), at(-4.4, 3.9, 1),
    at(-6.2, 1.2), at(-5.6, -4), G.at(0.5, -6.2 * s, 1), G.at(0.4, -7.8 * s, 1)];
  _kgPart(ctx, K, () => _kgShape(ctx, bt), boot, { lw, line, sd: 2.6 * s, hd: far ? 0 : 0.8 * s, detail: flat || far ? null : (g) => {
    _kgLine(g, [G.at(0.5, 7 * s), G.at(0.5, -7 * s)], KG.boot[2], 0.9 * s);                    // under the cuff
    _kgLine(g, [at(-5, 2.4), at(17.6, 2.4)], KG.boot[2], 0.8 * s);                            // the sole
    _kgLine(g, [at(4.4, -0.6), at(-4.6, -1.4)], KG.boot[0], 0.9 * s);                         // the ankle's crease
  } });
  // the shin guard: a plate down the front of the boot rising to a point over the knee, two crimson ties
  const guard = [G.at(-0.14, 5.4 * s, 1), G.at(0.04, 10.6 * s, 1), G.at(0.34, 8.6 * s), G.at(0.9, 5.8 * s, 1), G.at(0.92, 1.6 * s, 1), G.at(0.4, 0.6 * s), G.at(0.08, 2.2 * s)];
  _kgPart(ctx, K, () => _kgShape(ctx, guard), metal, { lw, line, sd: 2.4 * s, hd: far ? 0 : 0.9 * s, detail: flat || far ? null : (g) => {
    _kgLine(g, [G.at(0.04, 8.4 * s), G.at(0.34, 6.6 * s), G.at(0.88, 4 * s)], KG.steel, 0.9 * s);   // the lit ridge
  } });
  if (flat || far) return;
  for (const u of [0.56, 0.76]) _kgLine(ctx, [G.at(u, 7 * s - u * 2.4 * s), G.at(u + 0.03, -5.9 * s + u * 1.2 * s)], KG.red[1], 1.5 * s);
}
