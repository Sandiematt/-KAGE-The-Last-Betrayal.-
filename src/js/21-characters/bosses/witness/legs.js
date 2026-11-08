/* ---- the legs: slim black legs, a cuisse, a pointed knee cop, a veined greave and a pointed sabaton ---- */
function witnessLeg(f, ctx, hp, kn, ft, A, U, far) {
  const fc = f.facing, cloth = far ? WT_FAR : WT_CLOTH, arm = far ? WT_FAR : WT_ARMOR, fade = f.witFade();
  const se = { x: lerp(kn.x, ft.x, 0.9), y: lerp(kn.y, ft.y, 0.9) };
  celFill(ctx, () => animeCapsule(ctx, kn, se, 7.4 * U, 5.6 * U, 0.6 * U, 0.4), cloth, A, { sd: 3.4 * U, hd: far ? 0 : 0.7 * U, rim: !far });
  celFill(ctx, () => animeCapsule(ctx, hp, kn, 9.4 * U, 7.6 * U, 1.2 * U, 0.42), cloth, A, { sd: 4.2 * U, hd: far ? 0 : 0.8 * U, rim: !far });
  // the cuisse: a plate down the front of the thigh
  const T = _wtLimb(hp, kn, fc), cu = [T.at(0.18, 9.6 * U), T.at(0.84, 8.2 * U), T.at(0.92, 2 * U), T.at(0.7, -2.6 * U), T.at(0.22, -1 * U)];
  celFill(ctx, () => _poly(ctx, cu), arm, A, { sd: 2.6 * U, hd: far ? 0 : 0.9 * U, detail: far || A.flat ? null : (g) => {
    _strokePts(g, [cu[0], cu[1], cu[2]], 'rgba(150,110,240,0.7)', 0.9 * A.s);
    _strokePts(g, [T.at(0.5, 8.8 * U), T.at(0.48, -1.6 * U)], WT_ARMOR[0], 1.1 * A.s);
  } });
  // the greave: down the front of the shin, a crimson vein along it
  const G = _wtLimb(kn, ft, fc), gr = [G.at(0.12, 7.6 * U), G.at(0.86, 6.2 * U), G.at(0.92, -1.4 * U), G.at(0.5, -4.6 * U), G.at(0.14, -3 * U)];
  celFill(ctx, () => _poly(ctx, gr), arm, A, { sd: 2.4 * U, hd: far ? 0 : 1 * U, rim: !far, detail: far || A.flat ? null : (g) => {
    _strokePts(g, [gr[0], gr[1]], WT_EDGE, 1 * A.s);
    g.save(); g.globalAlpha *= fade; _wtVein(g, _wtJag(G.at(0.2, 3 * U), G.at(0.86, 2.4 * U), 5, 1 * U, 9), 0.8 * A.s, WT_CRIM[1], 'rgba(255,40,90,0.9)'); g.restore();
  } });
  // the knee cop: a pointed plate, its point forward and up
  const kc = [G.at(-0.1, 7.6 * U), G.at(-0.3, 12 * U), G.at(0.16, 9.4 * U), G.at(0.2, -2.2 * U), G.at(-0.12, -3.6 * U)];
  celFill(ctx, () => _poly(ctx, kc), arm, A, { sd: 1.8 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far || A.flat ? null : (g) => _strokePts(g, [kc[0], kc[1], kc[2]], WT_EDGE, 0.9 * A.s) });
  // the sabaton: long, pointed
  celFill(ctx, () => animeFootPath(ctx, kn, ft, fc, 4.8 * U, 15 * U), arm, A, { sd: 1.8 * U, hd: far ? 0 : 0.7 * U, detail: far || A.flat ? null : (g) => {
    let sx = ft.x - kn.x, sy = ft.y - kn.y; const sl = Math.hypot(sx, sy) || 1; sx /= sl; sy /= sl;
    const fx = fc > 0 ? sy : -sy, fy = fc > 0 ? -sx : sx;
    _strokePts(g, [[ft.x + fx * 2 * U - sx * 2 * U, ft.y + fy * 2 * U - sy * 2 * U], [ft.x + fx * 13 * U + sx * 3 * U, ft.y + fy * 13 * U + sy * 3 * U]], 'rgba(150,110,240,0.7)', 0.9 * A.s);
  } });
}
