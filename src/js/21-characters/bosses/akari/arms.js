/* ---- the arm: a bare shoulder and upper arm, a long black glove from above the elbow to the wrist, banded pink (her key
   art: sleeveless, bare-shouldered) ---- */
function akariArm(f, ctx, sh, el, ha, A, U, far) {
  const hol = f.hollow, vio = _akV(f), cl = hol ? (far ? A.pal.back : A.pal.fab) : far ? [ANIME.face, AK_CLOTH[0], AK_CLOTH[1]] : AK_CLOTH;
  const gt = far ? [ANIME.face, AK_GUARD[0], AK_GUARD[1]] : hol ? A.pal.metal : AK_GUARD;
  const ux = el.x - sh.x, uy = el.y - sh.y, ex = ha.x - el.x, ey = ha.y - el.y, fl = Math.hypot(ex, ey) || 1, fnx = -ey / fl, fny = ex / fl;
  const up = (k) => ({ x: sh.x + ux * k, y: sh.y + uy * k }), at = (k, o) => ({ x: el.x + ex * k + fnx * (o || 0), y: el.y + ey * k + fny * (o || 0) });
  // the bare shoulder and upper arm (skin, a step lighter than the glove), lit along its edge
  const skn = far ? [ANIME.face, ANIME.face, AK_SKIN[0]] : hol ? cl : AK_SKIN;
  celFill(ctx, () => animeCapsule(ctx, sh, el, 5.4 * U, 4.2 * U, 0.8 * U, 0.3), skn, A, { sd: 2.6 * U, hd: far ? 0 : 0.8 * U, rim: !far });
  // the glove over the upper arm (its top edge banded pink), the elbow, the forearm flaring at the wrist
  const g0 = up(0.46);
  celFill(ctx, () => animeCapsule(ctx, g0, el, 5 * U, 4.4 * U, 0.2 * U, 0.5), gt, A, { sd: 2.2 * U, hd: far ? 0 : 0.7 * U, detail: (g) => {
    const l = Math.hypot(ux, uy) || 1, nx = -uy / l * 4.8 * U, ny = ux / l * 4.8 * U, b = up(0.5);
    _strokePts(g, [[b.x + nx, b.y + ny], [b.x - nx, b.y - ny]], far ? vio[0] : vio[1], 2.6 * U);
  } });
  const w = at(0.9);
  celFill(ctx, () => animeCapsule(ctx, el, w, 4.4 * U, 3.8 * U, 0.6 * U, 0.35), gt, A, { sd: 2 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far ? null : (g) => {
    // the outer plate's lit ridge, the pink cuff at the wrist, a fine strap
    _strokePts(g, [[at(0.12, 2.4 * U).x, at(0.12, 2.4 * U).y], [at(0.84, 2 * U).x, at(0.84, 2 * U).y]], gt[2], 0.9 * A.s);
    const c0 = at(0.8, 4.4 * U), c1 = at(0.8, -4.4 * U); _strokePts(g, [[c0.x, c0.y], [c1.x, c1.y]], vio[1], 2.4 * U);
    const s0 = at(0.42, 4.4 * U), s1 = at(0.46, -4.4 * U); _strokePts(g, [[s0.x, s0.y], [s1.x, s1.y]], ANIME.outline, 1.2 * U);
    if (hol) hollowCrack(g, A, 1, [[at(0.2, 2 * U).x, at(0.2, 2 * U).y], [at(0.34, -1 * U).x, at(0.34, -1 * U).y], [at(0.52, 1.4 * U).x, at(0.52, 1.4 * U).y]], 0.7 * U);
  } });
  celFill(ctx, () => { ctx.moveTo(el.x + 3.2 * U, el.y); ctx.arc(el.x, el.y, 3.2 * U, 0, TAU); }, gt, A, { sd: 1.4 * U, hd: far ? 0 : 0.6 * U });
  return;   // (her key art has bare shoulders: the old spiked shoulder plate below is no longer drawn)
  // the villain's shoulder guard: a lacquered plate over the shoulder with two swept spikes, its lower edge pink
  const ul = Math.hypot(ux, uy) || 1, ax = -ux / ul, ay = -uy / ul, nx = -ay, ny = ax;
  const PU = 1.45 * U, S = (b, a) => [sh.x + (nx * b + ax * a) * PU, sh.y + (ny * b + ay * a) * PU];
  const plate = [[-5.6, -1.8], [-6.6, 3], [-5.4, 10.2], [-2.6, 4.6], [0.8, 8.8], [2.6, 4.2], [6.2, 2.4], [5.8, -2.2]];
  const path = () => { const p0 = S(...plate[0]); ctx.moveTo(p0[0], p0[1]); for (let k = 1; k < plate.length; k++) { const p = S(...plate[k]); ctx.lineTo(p[0], p[1]); } const q = S(0, -4.4); ctx.quadraticCurveTo(q[0], q[1], p0[0], p0[1]); ctx.closePath(); };
  celFill(ctx, path, gt, A, { sd: 2 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: (g) => {
    const e0 = S(-5.4, -1.2), eq = S(0, -3.6), e1 = S(5.6, -1.6);
    g.strokeStyle = far ? vio[1] : vio[2]; g.lineWidth = 2 * U; g.beginPath(); g.moveTo(e0[0], e0[1]); g.quadraticCurveTo(eq[0], eq[1], e1[0], e1[1]); g.stroke();
    if (!far) { const r0 = S(-4.4, 2.6), r1 = S(-4.6, 8.4); _strokePts(g, [r0, r1], gt[2], 0.8 * A.s); }
  } });
}
