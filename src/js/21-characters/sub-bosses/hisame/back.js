// Hisame's message tube slung across the back
Fighter.prototype.hisameTube = function (ctx, A, S, U) {
  const Pt = _sPt(S, U), a = Pt(1.02, -10), b = Pt(0.18, -15.5), acc = subTone(SUB_ACC.rain_hood);
  celFill(ctx, () => animeCapsule(ctx, a, b, 2.9 * U, 2.9 * U, 0, 0.5), SUB_LACQ, A, { sd: 1.8 * U, hd: 0.7 * U, rim: true, detail: (g) => {
    for (const k of [0.1, 0.9]) _strokePts(g, [[lerp(a.x, b.x, k) - 3 * U * (b.y - a.y) / 40, lerp(a.y, b.y, k) + 3 * U * (b.x - a.x) / 40], [lerp(a.x, b.x, k) + 3 * U * (b.y - a.y) / 40, lerp(a.y, b.y, k) - 3 * U * (b.x - a.x) / 40]], acc[1], 1.6 * U);
  } });
};
