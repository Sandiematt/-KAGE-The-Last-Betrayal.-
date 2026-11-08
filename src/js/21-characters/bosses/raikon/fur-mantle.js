/* ---- the torso (drawArmor 'raikon_plate'): the fur mantle, the breastplate, collar and crossed cords ---- */
// the fur: a fan of long curled tufts round a root on the back of the shoulder, from straight up (behind the hat
// brim) round the back and down over the shoulder blade; [angle from the spine's up toward the back (rad), length U]
const RAI_FUR_TUFTS = [[-0.32, 16], [0.06, 23], [0.42, 28], [0.8, 24], [1.14, 31], [1.48, 26], [1.82, 28], [2.16, 21], [2.5, 16]];

const _rfur = new Float32Array(160);

function _raiFurPts(S, U, k) {
  // root on the back of the shoulder; returns n points [tip, valley, tip, ...] in _rfur
  const cx = spX(S, 0.94, -5 * U), cy = spY(S, 0.94, -5 * U), T = RAI_FUR_TUFTS, n = T.length; k *= 1.16;
  const dir = (a) => [S.ux * Math.cos(a) - S.nx * Math.sin(a), S.uy * Math.cos(a) - S.ny * Math.sin(a)];
  let i = 0;
  for (let j = 0; j < n; j++) {
    const [a, len] = T[j], d = dir(a + 0.12), v = dir(j < n - 1 ? (a + T[j + 1][0]) / 2 : a + 0.2);
    _rfur[i++] = cx + d[0] * len * U * k; _rfur[i++] = cy + d[1] * len * U * k;
    const vl = (j < n - 1 ? Math.min(len, T[j + 1][1]) : len) * (j % 2 ? 0.6 : 0.68) * U * k;
    _rfur[i++] = cx + v[0] * vl; _rfur[i++] = cy + v[1] * vl;
  }
  return n * 2;
}

function _raiFurPath(ctx, S, U, k, f) {
  const m = _raiFurPts(S, U, k), cx = spX(S, 0.94, -5 * U), cy = spY(S, 0.94, -5 * U);
  // the near edge: from the front of the neck to the first tuft
  const a0 = [spX(S, 1.02, 4 * U), spY(S, 1.02, 4 * U)], z = [spX(S, 0.66, 2 * U), spY(S, 0.66, 2 * U)];
  ctx.moveTo(a0[0], a0[1]);
  let px = a0[0], py = a0[1];
  for (let i = 0; i < m; i++) {
    const x = _rfur[i * 2], y = _rfur[i * 2 + 1];
    // each edge bows sideways (the tufts curl back), sharper toward the tips
    const mx = (px + x) / 2, my = (py + y) / 2, ex = (x - px) * f, ey = (y - py) * f, b = i % 2 ? -0.16 : 0.24;
    ctx.quadraticCurveTo(mx - ey * b, my + ex * b, x, y);
    px = x; py = y;
  }
  ctx.quadraticCurveTo((px + z[0]) / 2, (py + z[1]) / 2, z[0], z[1]);
  ctx.quadraticCurveTo(cx, cy, a0[0], a0[1]);
  ctx.closePath();
}
