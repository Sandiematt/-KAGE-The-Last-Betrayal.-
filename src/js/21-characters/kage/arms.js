/* ---- Kage's arms (kageBody): the coat's sleeve to the elbow, a pointed cuff hanging from it with the hem's crimson
   band, a dark steel kote on the forearm bound in crimson cord with a guard over the back of the hand, and a glove.
   In each limb's frame: u along it, o design px toward its outer (upper) side. `far` is the arm behind the body: the
   same shapes a tone darker, without the trims. ---- */
function _kgArm(f, ctx, K, sh, el, ha, far, U) {
  const s = K.s, fc = K.fc, lw = far ? K.lwFar : K.lw, line = far ? KG.lineFar : KG.line, flat = K.A.flat;
  const coat = far ? KG.coatFar : KG.coat, metal = far ? KG.metalFar : KG.metal, red = far ? KG.redFar : KG.red;
  const Ua = _kgLimb(sh, el, fc), Fa = _kgLimb(el, ha, fc);
  // the kote: a tapered plate from under the cuff to the wrist, its guard running on over the back of the hand
  const kote = [Fa.at(0.14, 5.2 * s), Fa.at(0.8, 4.7 * s), Fa.at(1.13, 4.4 * s, 1), Fa.at(1.0, 1.4 * s, 1), Fa.at(0.98, -3.5 * s, 1), Fa.at(0.78, -4.5 * s), Fa.at(0.14, -5 * s)];
  _kgPart(ctx, K, () => _kgShape(ctx, kote), metal, { lw, line, sd: 2.6 * s, hd: far ? 0 : 0.9 * s, detail: flat || far ? null : (g) => {
    _kgLine(g, [Fa.at(0.3, 1.6 * s), Fa.at(0.94, 1.4 * s)], KG.metal[0], 0.9 * s);                 // the plate's ridge
    for (const u of [0.5, 0.62, 0.86]) _kgLine(g, [Fa.at(u, 6 * s), Fa.at(u + 0.04, -6 * s)], KG.red[1], 1.3 * s);   // the cords
  } });
  // the upper sleeve: square at the shoulder, narrowing to the elbow
  const up = [Ua.at(-0.14, 8.8 * s, 1), Ua.at(0.3, 9 * s), Ua.at(0.98, 6.6 * s), Ua.at(1.12, 0.4 * s), Ua.at(0.98, -6.2 * s), Ua.at(0.3, -7.8 * s), Ua.at(-0.14, -7.6 * s, 1)];
  _kgPart(ctx, K, () => _kgShape(ctx, up), coat, { lw, line, sd: 4.4 * s, hd: far ? 0 : 1 * s, rim: !far, detail: flat || far ? null : (g) => {
    _kgLine(g, [Ua.at(0.06, 9 * s), Ua.at(0.16, 0), Ua.at(0.06, -8 * s)], KG.coat[0], 1 * s);     // the shoulder seam
    _kgLine(g, [Ua.at(0.56, -6 * s), Ua.at(0.7, 1.6 * s)], KG.coat[2], 0.8 * s);                  // a crease to the elbow
    _kgLine(g, [Ua.at(0.76, -5.4 * s), Ua.at(0.86, 3 * s)], KG.coat[0], 0.9 * s);
  } });
  // the cuff: the sleeve's open end past the elbow, cut to a point that hangs under the forearm
  const c0 = Fa.at(0.34, 8.4 * s, 1), c1 = Fa.at(0.2, -12.4 * s, 1);
  const cuff = [Fa.at(-0.16, 7 * s), c0, Fa.at(0.37, 0.4 * s, 1), c1, Fa.at(-0.02, -7.4 * s), Fa.at(-0.2, -5.4 * s)];
  _kgPart(ctx, K, () => _kgShape(ctx, cuff), coat, { lw, line, sd: 3.6 * s, hd: far ? 0 : 0.9 * s, detail: flat ? null : (g) => {
    // the crimson band along the open end, a fine line inside it
    const m = Fa.at(0.37, 0.4 * s), ox = -Fa.ux * s, oy = -Fa.uy * s;
    g.lineJoin = 'miter';
    _kgLine(g, [c0, m, c1].map(p => [p[0] + ox * 0.8, p[1] + oy * 0.8]), red[1], 3.4 * s);
    if (!far) _kgLine(g, [c0, m, c1].map(p => [p[0] + ox * 4.4, p[1] + oy * 4.4]), red[1], 0.8 * s);
    g.lineJoin = 'round';
    if (!far) _kgLine(g, [Fa.at(0.0, 5 * s), Fa.at(0.14, -2 * s)], KG.coat[0], 0.9 * s);
  } });
  // the gear's shoulder plates over the sleeve (sub-bosses/, bosses/raikon/, bosses/takashi/, kage/gear/)
  subSode(f, ctx, sh, el, K.A, U, far); subBSode(f, ctx, sh, el, K.A, U, far); raikonSode(f, ctx, sh, el, K.A, U, far); takashiSode(f, ctx, sh, el, K.A, U, far); gearSode(f, ctx, sh, el, K.A, U, far);
}

// the glove closed in a fist (round a grip when he holds one): a wedge past the wrist, the knuckles squared off
function _kgHand(f, ctx, K, el, ha, far) {
  if (f.weaponId() === 'iron_fists') { if (far) f.subFist(ctx, el, ha, K.A, K.A.U, true); else f.drawFistGear(ctx); return; }
  const s = K.s, G = _kgLimb(el, ha, K.fc), u = (px) => px * s / G.l;
  const fist = [G.at(1 - u(3), 4 * s), G.at(1 + u(4.4), 4.8 * s, 1), G.at(1 + u(7.6), 1.4 * s, 1), G.at(1 + u(6.6), -3.8 * s, 1), G.at(1 + u(1.4), -4.9 * s), G.at(1 - u(3), -3.8 * s)];
  _kgPart(ctx, K, () => _kgShape(ctx, fist), far ? KG.bootFar : KG.boot, { lw: (far ? K.lwFar : K.lw) * 0.9, line: far ? KG.lineFar : KG.line, sd: 1.5 * s, hd: far ? 0 : 0.6 * s, detail: K.A.flat || far ? null : (g) => {
    _kgLine(g, [G.at(1 + u(3.4), 4.6 * s), G.at(1 + u(4.4), -4.4 * s)], KG.boot[2], 0.8 * s);
  } });
}

/* ---- the Tachibana Yoroi's near pauldron: three angular lames hanging from the shoulder over the sleeve, each cut to
   a shallow point, laced in crimson, a fine steel edge on each, the Kage diamond in silver on the top one ---- */
function _kgPauldron(f, ctx, K, sh, el) {
  const s = K.s, S = K.S, flat = K.A.flat;
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  let dx = ax * 0.62 - S.ux * 0.38, dy = ay * 0.62 - S.uy * 0.38; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const nx = dy * K.fc, ny = -dx * K.fc, ox = sh.x - dx * 6 * s, oy = sh.y - dy * 6 * s;
  const at = (u, o) => [ox + dx * u * s + nx * o * s, oy + dy * u * s + ny * o * s];
  for (let i = 2; i >= 0; i--) {
    const u = i * 6.4, w = 9.6 + i * 0.9;
    const lame = [at(u - 1, w), at(u + 7.4, w + 1.2), at(u + 10.6, 0), at(u + 7.4, -w - 1.2), at(u - 1, -w)];
    if (i === 0) { lame[0] = at(-2.6, w - 2.4); lame[4] = at(-2.6, -w + 2.4); }   // the top lame's shoulders are cut
    _kgPart(ctx, K, () => _poly(ctx, lame), KG.metal, { sd: 2.8 * s, hd: 1 * s, lw: 0.9 * s, detail: flat ? null : (g) => {
      _kgLine(g, [at(u + 6.6, w + 1), at(u + 9.4, 0), at(u + 6.6, -w - 1)], KG.steel, 1 * s);    // the steel edge
      if (i) for (const o of [-6, -3, 0, 3, 6]) _kgLine(g, [at(u - 1, o), at(u + 1.8, o)], KG.red[1], 1.3 * s);   // the lacing
      else kageEmblem(g, at(3.6, 0)[0], at(3.6, 0)[1], 3.4 * s, Math.atan2(dy, dx), KG.silver, KG.red[2], s);
    } });
  }
}
