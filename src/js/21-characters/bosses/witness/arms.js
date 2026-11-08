/* ---- the arms: black sleeve, jagged layered pauldron with a spike, a spiked-cuff gauntlet ---- */
function witnessArm(f, ctx, sh, el, ha, A, U, far) {
  const fc = f.facing, cloth = far ? WT_FAR : WT_CLOTH, arm = far ? WT_FAR : WT_ARMOR, fade = f.witFade();
  celFill(ctx, () => animeCapsule(ctx, sh, el, 6.8 * U, 5.4 * U, 0.8 * U, 0.4), cloth, A, { sd: 3.4 * U, hd: far ? 0 : 0.8 * U, rim: !far });
  // the gauntlet: elbow to wrist, a flared spiked cuff at the elbow, violet seams and a crimson vein
  const G = _wtLimb(el, ha, fc), a = { x: G.at(0.02, 0)[0], y: G.at(0.02, 0)[1] }, b = { x: G.at(0.88, 0)[0], y: G.at(0.88, 0)[1] };
  celFill(ctx, () => animeCapsule(ctx, a, b, 5.2 * U, 4.1 * U, 0.3 * U, 0.4), arm, A, { sd: 2.4 * U, hd: far ? 0 : 0.9 * U, rim: !far, detail: far || A.flat ? null : (g) => {
    for (const u of [0.42, 0.66]) _strokePts(g, [G.at(u, -5.4 * U), G.at(u + 0.04, 5.4 * U)], WT_ARMOR[0], 1.2 * A.s);
    _strokePts(g, [G.at(0.12, 3.4 * U), G.at(0.86, 2.6 * U)], 'rgba(150,110,240,0.75)', 0.8 * A.s);
    g.save(); g.globalAlpha *= fade; _wtVein(g, _wtJag(G.at(0.2, -1.4 * U), G.at(0.84, -0.8 * U), 4, 0.9 * U, 7), 0.7 * A.s, WT_CRIM[1], 'rgba(255,40,90,0.9)'); g.restore();
  } });
  // the cuff: a jagged flare round the elbow end of the gauntlet, its spike pointing back past the elbow
  const cuff = [G.at(0.06, 6.4 * U), G.at(0.3, 5 * U), G.at(0.3, -5 * U), G.at(0.04, -6.8 * U), G.at(-0.22, -4.2 * U), G.at(-0.02, -2 * U), G.at(-0.12, 1.6 * U)];
  celFill(ctx, () => _poly(ctx, cuff), arm, A, { sd: 1.8 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far || A.flat ? null : (g) => _strokePts(g, [cuff[0], cuff[1]], WT_EDGE, 0.9 * A.s) });
  // the pauldron: three stacked lames down the upper arm, the top one with a spike rising up and back
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  const S = A.S, top = [sh.x - ax * 4 * U + S.ux * 1.5 * U, sh.y - ay * 4 * U + S.uy * 1.5 * U];
  for (let i = 2; i >= 0; i--) {
    const t0 = [top[0] + ax * i * 5.6 * U, top[1] + ay * i * 5.6 * U], [a0, a1, b1, b0] = _hang(t0, ax, ay, 11 * U, (17 - i * 1.6) * U, (20 - i * 2) * U);
    const tipB = [b0[0] + ax * 3.4 * U - ay * fc * 0 , b0[1] + ay * 3.4 * U];
    celFill(ctx, () => { ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.lineTo(b1[0], b1[1]); ctx.lineTo((b0[0] + b1[0]) / 2 + ax * 2 * U, (b0[1] + b1[1]) / 2 + ay * 2 * U); ctx.lineTo(tipB[0], tipB[1]); ctx.lineTo(b0[0], b0[1]); ctx.closePath(); }, arm, A, { sd: 2.4 * U, hd: far ? 0 : 0.9 * U, rim: !far, detail: far || A.flat ? null : (g) => {
      _strokePts(g, [b1, [(b0[0] + b1[0]) / 2 + ax * 2 * U, (b0[1] + b1[1]) / 2 + ay * 2 * U], tipB, b0], i === 0 ? WT_EDGE : 'rgba(150,110,240,0.6)', 1 * A.s);
    } });
  }
  // the spike: from the top lame up and back
  const bk = [-S.nx, -S.ny], up = [S.ux, S.uy], base0 = [top[0] + bk[0] * 6 * U, top[1] + bk[1] * 6 * U], base1 = [top[0] - bk[0] * 3 * U, top[1] - bk[1] * 3 * U];
  const spk = [top[0] + bk[0] * 9 * U + up[0] * 14 * U, top[1] + bk[1] * 9 * U + up[1] * 14 * U];
  celFill(ctx, () => _poly(ctx, [base0, spk, base1]), arm, A, { sd: 1.6 * U, hd: far ? 0 : 0.7 * U, rim: !far, detail: far || A.flat ? null : (g) => _strokePts(g, [base1, spk], WT_EDGE, 0.9 * A.s) });
}
