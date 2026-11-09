/* ---- the arms (witnessBody): a dark sleeve on the upper arm, the great sleeve on the forearm, the claws ----
   The great sleeve of the sheets: an angular plate far wider than the arm, its top edge dipping once and rising into a
   horn at the wrist, its underside hanging to a point below the forearm, two bands of the phase's colour inside it
   following its edges. In the forearm's frame: u from the elbow (0) to the hand (1), o design px toward the arm's
   outer (upper) side. The far arm wears a smaller, darker one. */
const WT_SLEEVE = [[-0.5, 4.2], [-0.06, 10.6], [0.4, 8.4], [0.74, 12.4], [1.02, 27], [0.92, 11], [1.1, 6.6], [1.12, -3.4], [0.94, -12.6], [0.58, -23], [0.4, -15.4], [-0.04, -14], [-0.5, -6.4]];
// the bands inside it: one along the underside (a chevron to the hanging point), one under the top edge into the horn
const WT_SLEEVE_BANDS = [
  [[-0.34, -4.4], [0.34, -8.8], [0.57, -17], [0.86, -9], [1.0, -2.4], [0.84, -5.2], [0.6, -12], [0.42, -5.4], [-0.3, -1.8]],
  [[-0.3, 4.4], [0.4, 4.8], [0.74, 8.4], [0.95, 19.4], [0.83, 8.8], [0.7, 5.6], [0.4, 2.2], [-0.28, 1.6]]
];

function _wtArm(f, ctx, W, sh, el, ha, far) {
  const s = W.s, L = WT_L, fc = W.fc, lw = far ? W.lwFar : W.lw, line = far ? L.dim : L.line;
  const ink = far ? WT_FAR : L.bodyInk;
  // the upper arm: a tapered dark sleeve, shoulder to elbow
  const U = _wtLimb(sh, el, fc), ua = [U.at(-0.1, 9.4 * s), U.at(1.04, 7 * s), U.at(1.12, 0), U.at(1.04, -7 * s), U.at(-0.1, -9.4 * s)];
  _wtPart(ctx, W, () => _poly(ctx, ua), ink, { lw, line, sd: 3 * s, hd: far ? 0 : 0.8 * s });
  // the shoulder plate: an angular cap over the joint, a band of the phase's colour round its lower edge (the core sits on it)
  if (!far) {
    const S = W.S, up = [S.ux, S.uy], fr = [S.nx, S.ny], c = [sh.x + fr[0] * 3 * s + up[0] * 1 * s, sh.y + fr[1] * 3 * s + up[1] * 1 * s];
    const at2 = (a, b) => [c[0] + fr[0] * a * s + up[0] * b * s, c[1] + fr[1] * a * s + up[1] * b * s];
    const cap = [at2(-6, 9), at2(8, 8), at2(15, 1), at2(14, -10), at2(5, -17), at2(-6, -12), at2(-22, -14), at2(-12, -2)];
    _wtPart(ctx, W, () => _poly(ctx, cap), ink, { lw, line, sd: 3 * s, hd: 1 * s, detail: W.A.flat ? null : (g) => {
      const b = [at2(12, -9), at2(5, -14.4), at2(-5, -10.6), at2(-16, -12.4), at2(-9, -7.4), at2(-3, -7.6), at2(5, -11), at2(9.6, -7.6)];
      g.fillStyle = L.panel[1]; g.beginPath(); _poly(g, b); g.fill();
      g.strokeStyle = L.line; g.lineWidth = 0.8 * s; g.lineJoin = 'miter'; g.beginPath(); _poly(g, b); g.stroke(); g.lineJoin = 'round';
    } });
  }
  // the great sleeve on the forearm
  const G = _wtLimb(el, ha, fc), k = far ? 0.8 : 1.3, at = (p) => G.at(p[0], p[1] * s * k);
  const slv = WT_SLEEVE.map(at);
  _wtPart(ctx, W, () => _poly(ctx, slv), ink, { lw, line, sd: 3.4 * s, hd: far ? 0 : 1 * s, detail: W.A.flat ? null : (g) => {
    for (const b of WT_SLEEVE_BANDS) {
      const q = b.map(at);
      g.fillStyle = far ? L.panel[0] : L.panel[1]; g.beginPath(); _poly(g, q); g.fill();
      g.strokeStyle = far ? L.dim : L.line; g.lineWidth = 0.8 * s; g.lineJoin = 'miter'; g.beginPath(); _poly(g, q); g.stroke(); g.lineJoin = 'round';
    }
    // ragged flame teeth along the underside on the Reality Editor and the True Witness
    if (!far && _wtLookKey >= 2) {
      g.fillStyle = L.flame[1]; g.beginPath();
      for (let i = 0; i < 4; i++) { const u = 0.1 + i * 0.2, j = Math.sin(W.t * 6 + i * 2) * 1.6; _poly(g, [G.at(u, -13 * s), G.at(u + 0.08, -(20 + j) * s), G.at(u + 0.13, -12 * s)]); }
      g.fill();
    }
  } });
}

// a claw: the dark hand closed on the grip with three hooked claws over it, or open with long pointed fingers raised
// (the free hand that holds the orb and the cube); in the forearm's frame past the wrist
function _wtClaw(f, ctx, W, el, ha, far, grip) {
  const s = W.s, L = WT_L, G = _wtLimb(el, ha, W.fc), lw = far ? W.lwFar * 0.9 : W.lw * 0.9, line = far ? L.dim : L.line;
  const ink = far ? WT_FAR : L.bodyInk, l = G.l || 1, u = (px) => px * s / l;
  if (grip) {
    const fist = [G.at(1 - u(3), 5.4 * s), G.at(1 + u(5.6), 6.2 * s), G.at(1 + u(8.6), 1.6 * s), G.at(1 + u(7), -3.6 * s), G.at(1 + u(9.6), -7.6 * s), G.at(1 + u(4.4), -5 * s),
      G.at(1 + u(5.2), -8.6 * s), G.at(1 + u(1), -5.4 * s), G.at(1 - u(3.4), -5 * s)];
    _wtPart(ctx, W, () => _poly(ctx, fist), ink, { lw, line, sd: 1.6 * s, hd: far ? 0 : 0.6 * s });
    return;
  }
  // open: the palm past the wrist, four long fingers curling up toward what it holds
  const palm = [G.at(1 - u(2), 5 * s), G.at(1 + u(6), 5.8 * s), G.at(1 + u(7.4), -4.6 * s), G.at(1 - u(2), -5 * s)];
  _wtPart(ctx, W, () => _poly(ctx, palm), ink, { lw, line, sd: 1.4 * s, hd: 0 });
  for (let i = 0; i < 4; i++) {
    const o = (4.4 - i * 3) * s, sp = Math.sin(W.t * 2.2 + i) * 0.6;
    const fing = [G.at(1 + u(5), o + 1.3 * s), G.at(1 + u(13 + i * 0.6), o + (4.2 + sp + (3 - i) * 1.4) * s), G.at(1 + u(16 + (i === 1 || i === 2 ? 3 : 0)), o + (8.6 + (3 - i) * 2) * s), G.at(1 + u(10.4), o - 0.4 * s), G.at(1 + u(5.4), o - 1.4 * s)];
    _wtPart(ctx, W, () => _poly(ctx, fing), ink, { lw: lw * 0.8, line, sd: 1 * s, hd: 0 });
  }
}
