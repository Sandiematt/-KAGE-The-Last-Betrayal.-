/* ---- the torso (witnessBody): the coat, its opening, the standing collar and the mantle flaring off the shoulders;
   drawArmor 'kysmei' is the Kysmei Robe's chest plate on Kage ---- */
function drawKysmeiArmor(ctx, f, ink, flat) {
  const A = f._A;
  if (f.kageFrame || animeSkin(f).witness) return;   // the flicker wears Kage's own coat; the Witness's coat is witnessBody's
  const S = A.S, U = A.U, P = _sP(S, U);
  _wtKageRobe(f, ctx, A, S, U, P);
}

// the coat torso [u along the spine, w design px to the front]: hip, waist, chest, shoulder, neck; back down
const WT_TORSO_PTS = [[-0.04, 10.4], [0.3, 9.6], [0.6, 12.4], [0.84, 14.6], [0.98, 12.4], [1.07, 5.4], [1.07, -5], [0.97, -13.6], [0.76, -15], [0.46, -12.4], [0.18, -11], [-0.04, -12]];

function _wtTorso(f, ctx, W) {
  const P = _wtP(W), s = W.s, L = WT_L, pts = WT_TORSO_PTS.map(p => P(p[0], p[1]));
  _wtCollar(f, ctx, W, P);
  _wtPart(ctx, W, () => _poly(ctx, pts), L.bodyInk, { sd: 5 * s, hd: 1.2 * s, detail: W.A.flat ? null : (g) => {
    // the coat's opening down the front: a lighter panel, the gold line along its edge, a pale crease
    const op = [P(1.07, 5.4), P(0.98, 12.4), P(0.84, 14.6), P(0.6, 12.4), P(0.3, 9.6), P(0.02, 10.4), P(0.02, 6.6), P(0.46, 4.2), P(0.9, 2.6)];
    g.fillStyle = L.bodyInk[2]; g.beginPath(); _poly(g, op); g.fill();
    _wtLine(g, W, [P(1.04, 2.6), P(0.92, 2.2), P(0.46, 3.6), P(0.02, 6.2)], L.gold, 1.3 * s);
    _wtLine(g, W, [P(0.82, -2), P(0.5, -4.2), P(0.24, -3)], L.bodyInk[2], 1 * s);
  } });
}

// the standing collar behind the head: dark, gold along its front edge, rising past the crown's root
function _wtCollar(f, ctx, W, P) {
  const s = W.s, L = WT_L;
  const c = [P(1.0, 3.4), P(1.22, 4.6), P(1.5, 1.2), P(1.46, -5), P(1.66, -11.6), P(1.3, -13.8), P(1.0, -10.8)];
  _wtPart(ctx, W, () => _poly(ctx, c), L.bodyInk, { sd: 3 * s, hd: 0.8 * s, detail: W.A.flat ? null : (g) => {
    _wtLine(g, W, [P(1.04, 2.6), P(1.24, 3.4), P(1.47, 0.6), P(1.43, -5.2)], L.gold, 1.4 * s);
  } });
}

// the mantle off the upper back: three pointed flares swept back (the sheets' dark wings behind the head), a band of
// the phase's colour inside their lower edge; they lift and settle a little with the cloth's own sway
function _wtMantle(f, ctx, W) {
  const P = _wtP(W), s = W.s, L = WT_L, t = W.t, sw = Math.sin(t * 1.7) * 2.2, sw2 = Math.sin(t * 1.7 + 1.2) * 2.6;
  const m = [P(1.06, -3.2), P(1.3, -16), P(1.56, -50 + sw), P(1.08, -32), P(0.92, -58 + sw2), P(0.74, -26), P(0.78, -11)];
  _wtPart(ctx, W, () => _poly(ctx, m), L.bodyInk, { sd: 4 * s, hd: 1 * s, detail: W.A.flat ? null : (g) => {
    // a band of the phase's colour inside each flare's lower edge
    for (const [a, b, c] of [[P(1.02, -10), m[3], m[2]], [P(0.82, -12), m[5], m[4]]]) {
      const q = [a, lerp2(a, b, 1.0), lerp2(b, c, 0.62), lerp2(b, c, 0.5), [lerp(a[0], b[0], 0.86) + (b[0] - a[0]) * 0.0, lerp(a[1], b[1], 0.86) - 4 * s], [a[0], a[1] - 3 * s]];
      g.fillStyle = L.panel[1]; g.beginPath(); _poly(g, q); g.fill();
    }
  } });
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
    _strokePts(g, pts.slice(5, 12), WT_SEAM, 1 * A.s);
    _strokePts(g, [P(1.07, 0.6), P(0.62, 7.4), P(0.42, 11)], WT_ARMOR[0], 2.6 * U);
    _strokePts(g, [P(1.07, 0.6), P(0.62, 7.4), P(0.42, 11)], WT_EDGE, 1.2 * A.s);
    _strokePts(g, [P(1.04, 4.8), P(0.74, 9.6)], WT_COAT[2], 0.9 * A.s);
    for (const [a, b, ph] of [[P(0.34, -9.4), P(0.9, -11.2), 1], [P(0.4, -4), P(0.7, -9), 2]]) _wtVein(g, _wtJag(a, b, 5, 1.1 * U, ph), 0.8 * A.s, WT_CRIM[1], WT_ACC_GLOW);
    const c = P(0.66, -7.2), rr = 3.4 * U;
    g.strokeStyle = WT_EDGE; g.lineWidth = 0.9 * A.s;
    g.beginPath(); g.arc(c[0], c[1], rr, 0, TAU); g.stroke(); g.beginPath(); g.arc(c[0], c[1], rr * 0.6, 0, TAU); g.stroke();
    g.beginPath(); g.moveTo(c[0], c[1] - rr * 0.55); g.lineTo(c[0] + rr * 0.45, c[1] + rr * 0.3); g.lineTo(c[0] - rr * 0.45, c[1] + rr * 0.3); g.closePath(); g.stroke();
    const gem = P(0.62, 7.4), R = 2.2 * U;
    g.fillStyle = '#07040c'; g.beginPath(); _poly(g, [[gem[0], gem[1] - R * 1.4], [gem[0] + R, gem[1]], [gem[0], gem[1] + R * 1.4], [gem[0] - R, gem[1]]]); g.fill();
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${WT_L.glow.join(',')},0.35)`; g.beginPath(); g.arc(gem[0], gem[1], R * 1.9, 0, TAU); g.fill(); g.restore();
    g.fillStyle = WT_VIO[1]; g.beginPath(); g.arc(gem[0], gem[1], R * 0.62, 0, TAU); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(gem[0], gem[1], R * 0.3, 0, TAU); g.fill();
  } });
}

// the Kysmei Robe over Kage's coat [u, w(, sharp)]: shoulders to the ribs, the hem broken into points
const WT_ROBE = [[1.09, 3.9], [1.03, 7], [0.95, 12.6], [0.82, 14], [0.6, 12.8], [0.36, 11.4, 1], [0.24, 7.6, 1], [0.32, 4, 1], [0.2, 0.4, 1], [0.3, -3.4, 1], [0.18, -7.4, 1], [0.3, -12, 1],
  [0.55, -12.6], [0.8, -14.8], [0.97, -14], [1.09, -5.8]];
