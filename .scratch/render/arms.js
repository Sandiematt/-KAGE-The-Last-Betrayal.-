// the arm, sleeve first: a full upper sleeve with a shoulder seam and creases, a forearm sleeve that bunches at the
// elbow and flares to its opening (Kage's ends in a crimson cuff), a dark strapped kote under it and a small glove on
// the grip. `far` is the arm behind the body: one tone darker and no detail lines.
Fighter.prototype.animeArm = function (ctx, sh, el, ha, A, skin, U, far, noHand) {
  const pal = A.pal, tone = far ? pal.back : skin.top === 'coat' ? pal.coat : pal.fab, gi = skin.top !== 'coat';
  const ex = ha.x - el.x, ey = ha.y - el.y, fl = Math.hypot(ex, ey) || 1, fnx = -ey / fl, fny = ex / fl;
  const at = (u, o) => ({ x: el.x + ex * u + fnx * o, y: el.y + ey * u + fny * o });
  // upper sleeve: full at the shoulder, gathered toward the elbow
  celFill(ctx, () => animeCapsule(ctx, sh, el, 8.2 * U, 6.6 * U, 1.5 * U, 0.38), tone, A, { sd: 4.2 * U, hd: far ? 0 : 1.1 * U, rim: !far, detail: far ? null : (g) => {
    const dx = el.x - sh.x, dy = el.y - sh.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    g.strokeStyle = tone[0]; g.lineWidth = 1 * A.s; g.beginPath();
    for (const [u, o0, o1] of [[0.5, -6, 2], [0.66, -5.6, 3.4], [0.8, -5, 1.4]]) {
      g.moveTo(sh.x + dx * u + nx * o0 * U, sh.y + dy * u + ny * o0 * U); g.quadraticCurveTo(sh.x + dx * (u + 0.08) + nx * (o0 + o1) * 0.5 * U, sh.y + dy * (u + 0.08) + ny * (o0 + o1) * 0.5 * U, sh.x + dx * (u + 0.04) + nx * o1 * U, sh.y + dy * (u + 0.04) + ny * o1 * U);
    }
    g.moveTo(sh.x + dx * 0.18 + nx * 8 * U, sh.y + dy * 0.18 + ny * 8 * U); g.quadraticCurveTo(sh.x + dx * 0.27, sh.y + dy * 0.27, sh.x + dx * 0.18 - nx * 8 * U, sh.y + dy * 0.18 - ny * 8 * U);
    g.stroke();
  } });
  // the kote: a dark lacquered forearm guard from under the sleeve to the wrist, two dark straps with crimson cord
  if (skin.kote) {
    const a = at(0.3, 0), b = at(0.9, 0);
    celFill(ctx, () => animeCapsule(ctx, a, b, 4.4 * U, 3.6 * U, 0.4 * U, 0.4), far ? [ANIME.metal0, ANIME.metal0, ANIME.metal1] : pal.metal, A, { sd: 2.2 * U, hd: far ? 0 : 0.8 * U, detail: far ? null : (g) => {
      const straps = () => { g.beginPath(); for (const k of [0.62, 0.84]) { const p = at(k, 5 * U), q = at(k + 0.05, -5 * U); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); } g.stroke(); };
      g.strokeStyle = '#030303'; g.lineWidth = 1.6 * U; straps();
      g.strokeStyle = pal.acc; g.lineWidth = 0.6 * A.s; straps();
    } });
  }
  // forearm sleeve: bunched at the elbow, flaring to the opening (a wide kimono sleeve on the gi, the coat sleeve on Kage)
  const u1 = skin.kote ? (gi ? 0.5 : 0.56) : 0.8, r0 = 6.2 * U, r1 = (gi ? 8.4 : 6.8) * U, m = at(u1, 0);
  celFill(ctx, () => animeCapsule(ctx, el, m, r0, r1, 0.4 * U, 0.4), tone, A, { sd: 3.6 * U, hd: far ? 0 : 0.9 * U, rim: !far, detail: far ? null : (g) => {
    g.strokeStyle = tone[0]; g.lineWidth = 1 * A.s; g.beginPath();
    for (const [u, o0, o1] of [[0.04, 5.4, -3], [0.18, -5.6, 2.6], [u1 * 0.6, 6, -1]]) {
      const p = at(u, o0 * U), q = at(u + 0.1, o1 * U), c = at(u + 0.1, (o0 + o1) * 0.2 * U); g.moveTo(p.x, p.y); g.quadraticCurveTo(c.x, c.y, q.x, q.y);
    }
    g.stroke();
  } });
  // the sleeve opening: Kage's crimson cuff band, or the gi's dark inner lining
  if (!far) {
    const c0 = at(u1 - 0.1, 0), c1 = at(u1 + 0.02, 0);
    celFill(ctx, () => animeCapsule(ctx, c0, c1, r1 * 0.94, r1 * 1.02, 0, 0.5), skin.cuff ? ['#4a0c10', ANIME.crimson, pal.accHi] : [pal.back[0], pal.back[1], tone[0]], A, { sd: 1.6 * U, hd: skin.cuff ? 0.7 * U : 0, detail: skin.cuff ? (g) => {
      g.strokeStyle = '#30080b'; g.lineWidth = 0.8 * A.s; g.beginPath(); const p = at(u1 - 0.05, r1), q = at(u1 - 0.05, -r1); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
    } : null });
  }
  if (!noHand && !(far && this.pose.ik > 0.5 && IK_OFF[this.shape()] != null)) this.animeHand(ctx, el, ha, A, U, far);
};
// a small dark glove closed round the grip, the fingers implied by one line
Fighter.prototype.animeHand = function (ctx, el, ha, A, U, far) {
  const pal = A.pal, glove = far ? [ANIME.cloth0, ANIME.cloth0, ANIME.cloth1] : [ANIME.cloth0, ANIME.cloth1, ANIME.cloth2];
  celFill(ctx, () => animeHandPath(ctx, el, ha, 2.9 * U), this.weaponId() === 'iron_fists' ? pal.metal : glove, A, { sd: 1.4 * U, hd: 0.6 * U, detail: (g) => {
    const dx = ha.x - el.x, dy = ha.y - el.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    g.strokeStyle = ANIME.cloth2; g.lineWidth = 0.7 * A.s; g.beginPath();
    g.moveTo(ha.x + ux * 1.6 * U - uy * 2.3 * U, ha.y + uy * 1.6 * U + ux * 2.3 * U); g.lineTo(ha.x + ux * 1.6 * U + uy * 2.3 * U, ha.y + uy * 1.6 * U - ux * 2.3 * U); g.stroke();
  } });
};
// wide split hakama: a full thigh and a shin that stays wide to the ankle (bloused into Kage's tall boots), pleat
// lines, then the boot (Kage) or tabi and straw sandal (everyone else)
Fighter.prototype.animeLeg = function (ctx, hp, kn, ft, A, skin, U, far) {
  const pal = A.pal, tone = far ? pal.back : pal.fab, f = this.facing, boot = skin.feet === 'boot';
  const pleats = (g, a, b, os) => {
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    g.strokeStyle = tone[0]; g.lineWidth = 1 * A.s; g.beginPath();
    for (const o of os) { g.moveTo(a.x + nx * o * U + dx * 0.12, a.y + ny * o * U + dy * 0.12); g.lineTo(b.x + nx * o * 1.1 * U, b.y + ny * o * 1.1 * U); }
    g.stroke();
  };
  celFill(ctx, () => animeCapsule(ctx, hp, kn, 11.6 * U, 10 * U, 1.6 * U, 0.42), tone, A, { sd: 5 * U, hd: far ? 0 : 1 * U, rim: !far, detail: far ? null : (g) => pleats(g, hp, kn, [-4.2, 0.2, 4.4]) });
  const se = boot ? 0.62 : 0.9, shinEnd = { x: lerp(kn.x, ft.x, se), y: lerp(kn.y, ft.y, se) };
  celFill(ctx, () => animeCapsule(ctx, kn, shinEnd, 9.8 * U, boot ? 8.4 * U : 10.6 * U, 1 * U, 0.5), tone, A, { sd: 4.4 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far ? null : (g) => pleats(g, kn, shinEnd, [-3.6, 1, 5]) });
  const btone = far ? [pal.boot[0], pal.boot[0], pal.boot[1]] : pal.boot;
  if (boot) {
    const bt = { x: lerp(kn.x, ft.x, 0.42), y: lerp(kn.y, ft.y, 0.42) };
    celFill(ctx, () => { animeCapsule(ctx, bt, ft, 6.2 * U, 5.0 * U, 0.3 * U, 0.4); }, btone, A, { sd: 2.6 * U, hd: far ? 0 : 0.7 * U, detail: far ? null : (g) => {
      // two dark straps with a dull buckle edge
      const dx = ft.x - bt.x, dy = ft.y - bt.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      const straps = () => { g.beginPath(); for (const k of [0.38, 0.64]) { g.moveTo(bt.x + dx * k + nx * 6.4 * U, bt.y + dy * k + ny * 6.4 * U); g.lineTo(bt.x + dx * (k + 0.1) - nx * 6.4 * U, bt.y + dy * (k + 0.1) - ny * 6.4 * U); } g.stroke(); };
      g.strokeStyle = '#030303'; g.lineWidth = 1.6 * U; straps();
      g.strokeStyle = ANIME.metal2; g.lineWidth = 0.6 * A.s; straps();
    } });
  }
  celFill(ctx, () => animeFootPath(ctx, kn, ft, f, 5 * U, 12.5 * U), btone, A, { sd: 1.8 * U, detail: (g) => {
    // the sole: a dull edge along the floor (a straw sole on sandals)
    let sx = ft.x - kn.x, sy = ft.y - kn.y; const sl = Math.hypot(sx, sy) || 1; sx /= sl; sy /= sl;
    const fx = f > 0 ? sy : -sy, fy = f > 0 ? -sx : sx, h = 4.6 * U;
    g.strokeStyle = boot ? ANIME.metal1 : '#3e3326'; g.lineWidth = 1.4 * U; g.beginPath();
    g.moveTo(ft.x - fx * h + sx * h * 0.85, ft.y - fy * h + sy * h * 0.85); g.lineTo(ft.x + fx * 11 * U + sx * h * 0.85, ft.y + fy * 11 * U + sy * h * 0.85); g.stroke();
  } });
};
// the base obi: a dark wrapped band at the waist with thin crimson edges
Fighter.prototype.animeObi = function (ctx, S, A, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const band = (u0, u1, w0, w1) => { const a = P(u0, -w0), b = P(u0, w1), c = P(u1, w1), d = P(u1, -w0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  celFill(ctx, () => band(0.0, 0.17, 12.8, 11.8), [ANIME.cloth0, '#151112', '#2a2324'], A, { sd: 3 * U, hd: 0.6 * U, detail: (g) => {
    g.strokeStyle = A.pal.acc; g.lineWidth = 1 * A.s; g.beginPath();
    for (const u of [0.03, 0.145]) { const a = P(u, -12.8), b = P(u, 11.8); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  } });
};
