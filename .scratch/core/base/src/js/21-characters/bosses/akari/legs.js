/* ---- the leg: a fitted legging, a tall heeled boot with a wide pink cuff and a pink ankle strap; the thigh strap ---- */
function akariLeg(f, ctx, hp, kn, ft, A, skin, U, far) {
  const hol = f.hollow, vio = _akV(f), fc = f.facing;
  const cl = hol ? (far ? A.pal.back : A.pal.fab) : far ? [ANIME.face, AK_CLOTH[0], AK_CLOTH[1]] : AK_CLOTH;
  const gt = far ? [ANIME.face, AK_GUARD[0], AK_GUARD[1]] : hol ? A.pal.boot : AK_GUARD;
  const sx = ft.x - kn.x, sy = ft.y - kn.y, tx = kn.x - hp.x, ty = kn.y - hp.y, tl = Math.hypot(tx, ty) || 1;
  const sh = (k) => ({ x: kn.x + sx * k, y: kn.y + sy * k }), th = (k, o) => ({ x: hp.x + tx * k - ty / tl * (o || 0), y: hp.y + ty * k + tx / tl * (o || 0) });
  // the boot: from just below the knee to the ankle, the calf's curve in it
  const b0 = sh(0.14);
  celFill(ctx, () => animeCapsule(ctx, b0, ft, 5.9 * U, 4 * U, 1.1 * U, 0.3), gt, A, { sd: 2.6 * U, hd: far ? 0 : 0.7 * U, rim: !far, detail: (g) => {
    const l = Math.hypot(sx, sy) || 1, nx = -sy / l * 6 * U, ny = sx / l * 6 * U, b = sh(0.2);
    _strokePts(g, [[b.x + nx, b.y + ny], [b.x - nx, b.y - ny]], far ? vio[0] : vio[1], 3.4 * U);
    if (!far) { const c2 = sh(0.13); _strokePts(g, [[c2.x + nx, c2.y + ny], [c2.x - nx, c2.y - ny]], vio[2], 0.9 * U); }
    const k = sh(0.9); _strokePts(g, [[k.x + nx * 0.8, k.y + ny * 0.8], [k.x - nx * 0.8, k.y - ny * 0.8]], far ? vio[0] : vio[1], 1.6 * U);   // the ankle strap
    if (!far) { const a = sh(0.3), c = sh(0.82); _strokePts(g, [[a.x - nx * 0.5, a.y - ny * 0.5], [c.x - nx * 0.4, c.y - ny * 0.4]], gt[2], 0.8 * A.s); }
  } });
  // the thigh: full at the hip, tapering to the knee
  celFill(ctx, () => animeCapsule(ctx, hp, kn, 12.6 * U, 6.2 * U, 1.1 * U, 0.3), cl, A, { sd: 3.6 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far ? null : (g) => {
    animeFold(g, A, cl, () => { const a = th(0.62, -3.6 * U), b = th(0.72, 1.6 * U); g.moveTo(a.x, a.y); g.quadraticCurveTo(th(0.7, -1.2 * U).x, th(0.7, -1.2 * U).y, b.x, b.y); });
  } });
  // the foot: a slim boot with a clear sole
  celFill(ctx, () => animeFootPath(ctx, kn, ft, fc, 3.9 * U, 11 * U), gt, A, { sd: 1.6 * U, detail: (g) => {
    let ax = sx, ay = sy; const l = Math.hypot(ax, ay) || 1; ax /= l; ay /= l;
    const fx = fc > 0 ? ay : -ay, fy = fc > 0 ? -ax : ax, h = 3.6 * U;
    _strokePts(g, [[ft.x - fx * h + ax * h * 0.85, ft.y - fy * h + ay * h * 0.85], [ft.x + fx * 10 * U + ax * h * 0.85, ft.y + fy * 10 * U + ay * h * 0.85]], ANIME.metal1, 1.2 * U);
  } });
  // the heel: a slim block under the back of the boot
  { let ax = sx, ay = sy; const l = Math.hypot(ax, ay) || 1; ax /= l; ay /= l; const fx = fc > 0 ? ay : -ay, fy = fc > 0 ? -ax : ax, h = 3.6 * U;
    const b0x = ft.x - fx * h * 1.1 + ax * h * 0.9, b0y = ft.y - fy * h * 1.1 + ay * h * 0.9;
    celFill(ctx, () => { ctx.moveTo(b0x, b0y); ctx.lineTo(b0x + fx * 2.6 * U, b0y + fy * 2.6 * U); ctx.lineTo(b0x + fx * 2 * U + ax * 4.2 * U, b0y + fy * 2 * U + ay * 4.2 * U); ctx.lineTo(b0x + fx * 0.6 * U + ax * 4.2 * U, b0y + fy * 0.6 * U + ay * 4.2 * U); ctx.closePath(); }, gt, A, { sd: 0.8 * U }); }
  if (far) return;
  // the near thigh: a strap round it with a small holster pouch on the outside
  const s0 = th(0.4, 7.4 * U), s1 = th(0.46, -7.4 * U);
  celFill(ctx, () => { const a = th(0.36, 7.6 * U), b = th(0.42, -7.6 * U), c = th(0.49, -7.4 * U), d = th(0.43, 7.4 * U); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath(); }, gt, A, { sd: 1 * U, seam: true });
  celFill(ctx, () => { const a = th(0.3, -1 * U), b = th(0.3, 5.6 * U), c = th(0.58, 5.2 * U), d = th(0.58, -0.6 * U); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath(); }, gt, A, { sd: 1.4 * U, hd: 0.5 * U, detail: (g) => {
    const a = th(0.38, -1 * U), b = th(0.38, 5.6 * U); _strokePts(g, [[a.x, a.y], [b.x, b.y]], ANIME.outline, 1 * A.s);
    const k = th(0.44, 2.4 * U); g.fillStyle = vio[1]; g.beginPath(); g.arc(k.x, k.y, 0.8 * U, 0, TAU); g.fill();
  } });
  void s0; void s1; void skin;
}
