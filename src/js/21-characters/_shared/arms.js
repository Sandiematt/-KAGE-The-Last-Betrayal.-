// the arm, sleeve first: a full upper sleeve with a shoulder seam and creases, a forearm sleeve that bunches at the
// elbow and flares to its opening (Kage's ends in a crimson cuff), a dark strapped kote under it and a small glove on
// the grip. `far` is the arm behind the body: one tone darker and no detail lines.
Fighter.prototype.animeArm = function (ctx, sh, el, ha, A, skin, U, far, noHand) {
  if (skin.akari || skin.witness) {   // Akari's fitted sleeve and long arm guard (bosses/akari/); the Witness's pauldron and gauntlet (bosses/witness/)
    if (skin.akari) akariArm(this, ctx, sh, el, ha, A, U, far); else witnessArm(this, ctx, sh, el, ha, A, U, far);
    if (!noHand && !(far && this.pose.ik > 0.5 && IK_OFF[this.shape()] != null)) this.animeHand(ctx, el, ha, A, U * (skin.akari ? 0.88 : 1), far);
    return;
  }
  const pal = A.pal, tone = far ? pal.back : skin.top === 'coat' ? pal.coat : pal.fab, gi = skin.top !== 'coat';
  const ex = ha.x - el.x, ey = ha.y - el.y, fl = Math.hypot(ex, ey) || 1, fnx = -ey / fl, fny = ex / fl;
  const at = (u, o) => ({ x: el.x + ex * u + fnx * o, y: el.y + ey * u + fny * o });
  // upper sleeve: full at the shoulder, gathered toward the elbow
  celFill(ctx, () => animeCapsule(ctx, sh, el, 8.2 * U, 6.6 * U, 1.5 * U, 0.38), tone, A, { sd: 4.2 * U, hd: far ? 0 : 1.1 * U, rim: !far, detail: far ? null : (g) => {
    const dx = el.x - sh.x, dy = el.y - sh.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    animeFold(g, A, tone, () => {
      for (const [u, o0, o1] of [[0.5, -6, 2], [0.66, -5.6, 3.4], [0.8, -5, 1.4]]) {
        g.moveTo(sh.x + dx * u + nx * o0 * U, sh.y + dy * u + ny * o0 * U); g.quadraticCurveTo(sh.x + dx * (u + 0.08) + nx * (o0 + o1) * 0.5 * U, sh.y + dy * (u + 0.08) + ny * (o0 + o1) * 0.5 * U, sh.x + dx * (u + 0.04) + nx * o1 * U, sh.y + dy * (u + 0.04) + ny * o1 * U);
      }
      g.moveTo(sh.x + dx * 0.18 + nx * 8 * U, sh.y + dy * 0.18 + ny * 8 * U); g.quadraticCurveTo(sh.x + dx * 0.27, sh.y + dy * 0.27, sh.x + dx * 0.18 - nx * 8 * U, sh.y + dy * 0.18 - ny * 8 * U);
    });
  } });
  // the Order's sode over the upper sleeve (enemies/order/)
  if (skin.order && skin.order.sode) this.orderSode(ctx, sh, el, A, U / (skin.sleeve || 1), far, skin.order.sode);
  else { subSode(this, ctx, sh, el, A, U / (skin.sleeve || 1), far); subBSode(this, ctx, sh, el, A, U / (skin.sleeve || 1), far); raikonSode(this, ctx, sh, el, A, U / (skin.sleeve || 1), far); takashiSode(this, ctx, sh, el, A, U / (skin.sleeve || 1), far); gearSode(this, ctx, sh, el, A, U / (skin.sleeve || 1), far); }   // sub-bosses/_shared/arms.js, bosses/raikon/arms.js, bosses/takashi/arms.js, kage/gear/arms.js
  // the kote: a dark lacquered forearm guard from under the sleeve to the wrist, two dark straps with crimson cord
  const hol = skin.hollow, bare = hol && hol.bare;
  if (skin.kote === 'wrap') this.hollowWrap(ctx, at(bare ? 0.02 : 0.3, 0), at(bare ? 0.92 : 0.9, 0), (bare ? 5.4 : 4.4) * U, (bare ? 4.6 : 3.6) * U, A, U, far);
  else if (skin.kote) {
    const a = at(0.3, 0), b = at(0.9, 0);
    celFill(ctx, () => animeCapsule(ctx, a, b, 4.4 * U, 3.6 * U, 0.4 * U, 0.4), far ? [ANIME.metal0, ANIME.metal0, ANIME.metal1] : pal.metal, A, { sd: 2.2 * U, hd: far ? 0 : 0.8 * U, detail: far ? null : (g) => {
      const straps = () => { g.beginPath(); for (const k of [0.62, 0.84]) { const p = at(k, 5 * U), q = at(k + 0.05, -5 * U); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); } g.stroke(); };
      g.strokeStyle = '#030303'; g.lineWidth = 1.6 * U; straps();
      g.strokeStyle = pal.acc; g.lineWidth = 0.6 * A.s; straps();
    } });
  }
  // forearm sleeve: bunched at the elbow, flaring to the opening (a wide kimono sleeve on the gi, the coat sleeve on Kage)
  const u1 = skin.kote ? (gi ? 0.5 : 0.56) : 0.8, r0 = 6.2 * U, r1 = (gi ? 8.4 : 6.8) * U, m = at(u1, 0);
  if (bare) {
    // the husk's sleeve is torn off at the elbow over a bare, bound forearm
    const ux = el.x - sh.x, uy = el.y - sh.y, ul = Math.hypot(ux, uy) || 1, nx = -uy / ul * 6.6 * U, ny = ux / ul * 6.6 * U;
    this.hollowCuff(ctx, { x: el.x + nx, y: el.y + ny }, { x: el.x - nx, y: el.y - ny }, ux / ul, uy / ul, A, tone, U, far, hol.fray);
  } else celFill(ctx, () => animeCapsule(ctx, el, m, r0, r1, 0.4 * U, 0.4), tone, A, { sd: 3.6 * U, hd: far ? 0 : 0.9 * U, rim: !far, detail: far ? null : (g) => {
    animeFold(g, A, tone, () => {
      for (const [u, o0, o1] of [[0.04, 5.4, -3], [0.18, -5.6, 2.6], [u1 * 0.6, 6, -1]]) {
        const p = at(u, o0 * U), q = at(u + 0.1, o1 * U), c = at(u + 0.1, (o0 + o1) * 0.2 * U); g.moveTo(p.x, p.y); g.quadraticCurveTo(c.x, c.y, q.x, q.y);
      }
    });
  } });
  // the sleeve opening: Kage's crimson cuff band, or the gi's dark inner lining (a Hollow's sleeve is torn into points)
  if (hol && !bare) this.hollowCuff(ctx, at(u1, r1 * 0.98), at(u1, -r1 * 0.98), ex / fl, ey / fl, A, tone, U, far, hol.fray);
  else if (!far && !hol) {
    celFill(ctx, () => { const p0 = at(u1 - 0.08, r1 * 0.96), p1 = at(u1 + 0.01, r1 * 1.02), p2 = at(u1 + 0.01, -r1 * 1.02), p3 = at(u1 - 0.08, -r1 * 0.96), pc = at(u1 + 0.05, 0); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.quadraticCurveTo(pc.x, pc.y, p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath(); }, skin.cuff ? (skin.cuffTone || ['#4a0c10', ANIME.crimson, pal.accHi]) : [pal.back[0], pal.back[1], tone[0]], A, { sd: 1.6 * U, hd: skin.cuff ? 0.7 * U : 0, detail: skin.cuff ? (g) => {
      g.strokeStyle = '#30080b'; g.lineWidth = 0.8 * A.s; g.beginPath(); const p = at(u1 - 0.05, r1), q = at(u1 - 0.05, -r1); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
    } : null });
  }
  if (!noHand && !(far && this.pose.ik > 0.5 && IK_OFF[this.shape()] != null)) this.animeHand(ctx, el, ha, A, U, far);
};
