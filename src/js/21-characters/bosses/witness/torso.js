/* ---- the torso (drawArmor 'kysmei'): the Witness's armoured coat; the Kysmei Robe's chest plate on Kage ---- */
const WT_TORSO = {
  front: [[-0.14, 10.2], [0.1, 9.2], [0.36, 9], [0.62, 11.6], [0.82, 13.4], [0.95, 12.2], [1.03, 6.6], [1.08, 3.8]],
  back: [[1.08, -5.4], [0.97, -14], [0.8, -14.6], [0.54, -11.2], [0.28, -10], [0.04, -11.2], [-0.14, -11.2]]
};

function drawKysmeiArmor(ctx, f, ink, flat) {
  const A = f._A;
  if (f.kageFrame) return;   // the Kage-flicker wears Kage's own coat (animeSkin)
  const S = A.S, U = A.U, P = _sP(S, U), wit = !!animeSkin(f).witness;
  if (!wit) { _wtKageRobe(f, ctx, A, S, U, P); return; }
  const cp = f.corePos(), broken = !!f.coreBroken, fade = f.witFade();
  // the coat torso, open over the breastplate
  celFill(ctx, () => animeTorso(ctx, S, WT_TORSO, U), WT_COAT, A, { sd: 7 * U, hd: 1 * U, rim: true, detail: (g) => {
    _strokePts(g, [P(0.8, -2.5), P(0.5, -4.2), P(0.28, -3.4)], WT_COAT[0], 1 * A.s);
    _strokePts(g, [P(0.66, -9), P(0.4, -7.6)], WT_COAT[2], 0.8 * A.s);
    // a violet vein up the back
    g.save(); g.globalAlpha *= fade; _wtVein(g, _wtJag(P(0.12, -8), P(0.86, -10.5), 6, 1.2 * U, 2), 0.8 * A.s, '#9a6cf2'); g.restore();
  } });
  // the breastplate: a pointed plate from the collarbone to the ribs, edged violet
  const plate = [P(1.02, 0.6), P(1.0, 8.4), P(0.86, 12.6), P(0.66, 12.2), P(0.5, 8.2), P(0.46, 1.4), P(0.6, -2.2), P(0.86, -2.6)];
  celFill(ctx, () => _poly(ctx, plate), WT_ARMOR, A, { sd: 3.4 * U, hd: 1.2 * U, rim: true, detail: A.flat ? null : (g) => {
    _strokePts(g, [plate[1], plate[2], plate[3], plate[4]], WT_EDGE, 1.1 * A.s);
    _strokePts(g, [P(0.98, 3.6), P(0.62, 6.6)], WT_ARMOR[2], 1 * A.s);
    // crimson veins branching from the core down the plate
    g.save(); g.globalAlpha *= fade;
    const c0 = [cp.x, cp.y];
    for (const [u, w, ph] of [[0.5, 9.6, 1], [0.52, 3.2, 2], [0.94, 10.6, 3]]) _wtVein(g, _wtJag(c0, P(u, w), 4, 1.3 * U, ph), 0.9 * A.s, WT_CRIM[1], 'rgba(255,40,90,0.9)');
    g.restore();
    // the bezel round the core: an angular dark setting edged violet (cracked and empty once the core breaks)
    const R = 7.4 * A.s, dia = [[cp.x, cp.y - R * 1.3], [cp.x + R * 1.1, cp.y], [cp.x, cp.y + R * 1.3], [cp.x - R * 1.1, cp.y]];
    g.fillStyle = '#07040c'; g.beginPath(); _poly(g, dia); g.fill();
    _strokePts(g, [dia[0], dia[1], dia[2], dia[3], dia[0]], broken ? 'rgba(120,90,190,0.6)' : WT_EDGE, 1.2 * A.s);
    if (broken) {
      g.fillStyle = '#000'; g.beginPath(); g.arc(cp.x, cp.y, R * 0.62, 0, TAU); g.fill();
      _strokePts(g, [[cp.x - R * 0.5, cp.y - R * 0.9], [cp.x - R * 0.1, cp.y - R * 0.2], [cp.x + R * 0.4, cp.y - R * 0.5], [cp.x + R * 0.8, cp.y + R * 0.6]], 'rgba(167,123,255,0.55)', 0.9 * A.s);
    }
  } });
  // the abdominal lames under the plate, then the front collar standing beside the jaw
  for (let i = 0; i < 3; i++) {
    const u0 = 0.46 - i * 0.12, u1 = u0 - 0.11, w0 = 8.6 - i * 0.4;
    const q = [P(u0, -1.2), P(u0 + 0.01, w0), P(u1, w0 - 0.4), P(u1 - 0.01, -1.6)];
    celFill(ctx, () => _poly(ctx, q), WT_ARMOR, A, { sd: 1.6 * U, hd: 0.7 * U, detail: A.flat ? null : (g) => _strokePts(g, [q[1], q[2]], 'rgba(150,110,240,0.7)', 0.9 * A.s) });
  }
  const hr = BODY.head * f.scale * f.build.head, n = f.sk.neck, fr = [S.nx, S.ny], up = [S.ux, S.uy];
  const tip = [n.x + up[0] * 1.15 * hr + fr[0] * 0.15 * hr, n.y + up[1] * 1.15 * hr + fr[1] * 0.15 * hr];
  const col = [P(0.9, 1.4), tip, P(1.06, 6.2), P(0.94, 6.8)];
  celFill(ctx, () => _poly(ctx, col), WT_COAT, A, { sd: 2 * U, hd: 0.8 * U, rim: true, detail: A.flat ? null : (g) => _strokePts(g, [col[0], col[1], col[2]], WT_EDGE, 1.1 * A.s) });
}

// the Kysmei Robe on Kage: a standing collar behind his own, a violet-edged crossed chest plate with a gem and veins
function _wtKageRobe(f, ctx, A, S, U, P) {
  const hr = BODY.head * f.scale * f.build.head, n = f.sk.neck, up = [S.ux, S.uy], bk = [-S.nx, -S.ny];
  const at = (k, b) => [n.x + up[0] * k * hr + bk[0] * b * hr, n.y + up[1] * k * hr + bk[1] * b * hr];
  const col = [P(0.88, -9), at(1.35, 1.15), P(0.99, -4.6), at(1.6, 0.45), P(1.03, 0)];
  celFill(ctx, () => _poly(ctx, col), WT_COAT, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: A.flat ? null : (g) => _strokePts(g, [col[0], col[1], col[2], col[3]], WT_EDGE, 1.1 * A.s) });
  // the robe over the coat's upper body, its hem broken into points, a violet crossed collar, crimson veins and a rune
  // sigil on the back, a violet gem where the collar crosses
  const pts = _hsp(S, U, WT_ROBE);
  celFill(ctx, () => orderShape(ctx, 1, pts), WT_COAT, A, { sd: 5 * U, hd: 1 * U, rim: true, detail: A.flat ? null : (g) => {
    g.lineJoin = 'miter';
    _strokePts(g, pts.slice(5, 12), 'rgba(150,110,240,0.7)', 1 * A.s);
    _strokePts(g, [P(1.07, 0.6), P(0.62, 7.4), P(0.42, 11)], WT_ARMOR[0], 2.6 * U);
    _strokePts(g, [P(1.07, 0.6), P(0.62, 7.4), P(0.42, 11)], WT_EDGE, 1.2 * A.s);
    _strokePts(g, [P(1.04, 4.8), P(0.74, 9.6)], WT_COAT[2], 0.9 * A.s);
    for (const [a, b, ph] of [[P(0.34, -9.4), P(0.9, -11.2), 1], [P(0.4, -4), P(0.7, -9), 2]]) _wtVein(g, _wtJag(a, b, 5, 1.1 * U, ph), 0.8 * A.s, WT_CRIM[1], 'rgba(255,40,90,0.9)');
    const c = P(0.66, -7.2), rr = 3.4 * U;
    g.strokeStyle = 'rgba(190,150,255,0.85)'; g.lineWidth = 0.9 * A.s;
    g.beginPath(); g.arc(c[0], c[1], rr, 0, TAU); g.stroke(); g.beginPath(); g.arc(c[0], c[1], rr * 0.6, 0, TAU); g.stroke();
    g.beginPath(); g.moveTo(c[0], c[1] - rr * 0.55); g.lineTo(c[0] + rr * 0.45, c[1] + rr * 0.3); g.lineTo(c[0] - rr * 0.45, c[1] + rr * 0.3); g.closePath(); g.stroke();
    const gem = P(0.62, 7.4), R = 2.2 * U;
    g.fillStyle = '#07040c'; g.beginPath(); _poly(g, [[gem[0], gem[1] - R * 1.4], [gem[0] + R, gem[1]], [gem[0], gem[1] + R * 1.4], [gem[0] - R, gem[1]]]); g.fill();
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(167,123,255,0.35)'; g.beginPath(); g.arc(gem[0], gem[1], R * 1.9, 0, TAU); g.fill(); g.restore();
    g.fillStyle = '#b48aff'; g.beginPath(); g.arc(gem[0], gem[1], R * 0.62, 0, TAU); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(gem[0], gem[1], R * 0.3, 0, TAU); g.fill();
  } });
}

// the Kysmei Robe over Kage's coat [u, w(, sharp)]: shoulders to the ribs, the hem broken into points
const WT_ROBE = [[1.09, 3.9], [1.03, 7], [0.95, 12.6], [0.82, 14], [0.6, 12.8], [0.36, 11.4, 1], [0.24, 7.6, 1], [0.32, 4, 1], [0.2, 0.4, 1], [0.3, -3.4, 1], [0.18, -7.4, 1], [0.3, -12, 1],
  [0.55, -12.6], [0.8, -14.8], [0.97, -14], [1.09, -5.8]];
