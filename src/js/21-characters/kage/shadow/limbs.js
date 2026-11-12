/* ---- Kage's shadow limbs. Each is one shape from joint to joint, so no line crosses an elbow or a knee: the sleeve
   from the shoulder to the wrist; the fist; baggy trousers from the hip, gathered into a cuff below the knee; the
   wrapped shin and the boot under it. In each limb's frame: u along it, o px toward its front (a leg) or its outer,
   upper side (an arm). `far` is the limb behind the body: the same shape, its lights dimmer. ---- */
function _ksArm(f, ctx, K, sh, el, ha, far, U) {
  const s = K.s, fc = K.fc, Ua = _kgLimb(sh, el, fc), Fa = _kgLimb(el, ha, fc);
  const elbow = (o) => { const a = Ua.at(1, o * s), b = Fa.at(0, o * s); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
  const arm = [Ua.at(-0.14, 8.6 * s), Ua.at(0.42, 8.8 * s), elbow(7.2), Fa.at(0.5, 6 * s), Fa.at(0.97, 4.7 * s, 1),
    Fa.at(0.97, -4.5 * s, 1), Fa.at(0.5, -5.6 * s), elbow(-6.6), Ua.at(0.42, -7.8 * s), Ua.at(-0.14, -7.8 * s)];
  _ksPart(ctx, K, () => _kgShape(ctx, arm), KS.core, { red: (far ? 1.2 : 1.7) * s, redCol: far ? KS.rimFar : KS.rim, tan: 0.9 * s, tanCol: KS.tanFar, detail: far ? null : (g) => {
    // the bracer: the forearm a shade up, bound twice at the wrist
    _kgFill(g, [Fa.at(0.36, 9 * s), Fa.at(1.1, 9 * s), Fa.at(1.1, -9 * s), Fa.at(0.42, -9 * s)], KS.cloth);
    _kgLine(g, [Fa.at(0.8, 7 * s), Fa.at(0.83, -7 * s)], KS.core, 1.1 * s);
    _kgLine(g, [Fa.at(0.9, 7 * s), Fa.at(0.93, -7 * s)], KS.core, 1.1 * s);
  } });
  // the gear's shoulder plates over the sleeve (sub-bosses/, bosses/raikon/, bosses/takashi/, kage/gear/)
  subSode(f, ctx, sh, el, K.A, U, far); subBSode(f, ctx, sh, el, K.A, U, far); raikonSode(f, ctx, sh, el, K.A, U, far); takashiSode(f, ctx, sh, el, K.A, U, far); gearSode(f, ctx, sh, el, K.A, U, far);
}

// the fist (closed round a grip when he holds one): a wedge past the wrist, the knuckles squared off
function _ksHand(f, ctx, K, el, ha, far) {
  if (f.weaponId() === 'iron_fists') { if (far) f.subFist(ctx, el, ha, K.A, K.A.U, true); else f.drawFistGear(ctx); return; }
  const s = K.s, G = _kgLimb(el, ha, K.fc), u = (px) => px * s / G.l;
  const fist = [G.at(1 - u(3), 4.4 * s), G.at(1 + u(4.6), 5.2 * s, 1), G.at(1 + u(8), 1.4 * s, 1), G.at(1 + u(7), -4.2 * s, 1), G.at(1 + u(1.4), -5.2 * s), G.at(1 - u(3), -4.2 * s)];
  _ksPart(ctx, K, () => _kgShape(ctx, fist), KS.core, { red: (far ? 0.9 : 1.2) * s, redCol: far ? KS.rimFar : KS.rim });
}

function _ksLeg(f, ctx, K, hp, kn, ft, far) {
  const s = K.s, fc = K.fc, T = _kgLimb(hp, kn, fc), G = _kgLimb(kn, ft, fc);
  // the near leg leads with the crimson light, the far leg with the tan; the other light is only a faint edge
  const rim = far ? KS.rimFar : KS.rim, tan = far ? KS.tan : KS.tanFar, rd = far ? 0.9 : 1.7, td = far ? 1.5 : 0.9;
  const knee = (o, sharp) => { const a = T.at(1, o * s), b = G.at(0, o * s); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, sharp]; };
  // the boot sits flatter than the shin: its frame is the shin's turned most of the way back to the ground
  let bx = lerp(G.nx, fc, 0.62), by = lerp(G.ny, 0, 0.62); const bl = Math.hypot(bx, by) || 1; bx /= bl; by /= bl;
  const dx = -by * fc, dy = bx * fc;   // down, out of the sole
  const at = (a, b, sharp) => [ft.x + bx * a * s + dx * b * s, ft.y + by * a * s + dy * b * s, sharp];
  // the wrapped shin running into the boot: a low heel, a short round toe
  const shin = [G.at(0.2, 6.6 * s), G.at(0.6, 5.7 * s), G.at(0.84, 5.4 * s), at(7.4, -3.6), at(12.6, -1.6), at(16.6, 1.8), at(15.2, 4.2, 1),
    at(-4.8, 4.2, 1), at(-6.8, 1), at(-6.2, -4.6), G.at(0.84, -5.4 * s), G.at(0.6, -5.8 * s), G.at(0.2, -6.8 * s)];
  _ksPart(ctx, K, () => _kgShape(ctx, shin), KS.cloth, { red: rd * 0.85 * s, redCol: rim, tan: td * s, tanCol: tan, detail: (g) => {
    // the boot, black under the paler wraps, and two turns of the wrap across the shin
    const ub = 1 - 8.6 * s / G.l;
    _kgFill(g, [G.at(ub, 14 * s), G.at(ub + 0.03, -14 * s), G.at(1.8, -40 * s), G.at(1.8, 40 * s)], KS.core);
    if (far) return;
    _kgLine(g, [G.at(0.44, 8 * s), G.at(0.52, -8 * s)], KS.clothLo, 1 * s);
    _kgLine(g, [G.at(0.6, 8 * s), G.at(0.68, -8 * s)], KS.clothLo, 1 * s);
  } });
  // the trousers: full from the hip, widest above the knee, gathered into a cuff over the top of the shin
  const leg = [T.at(-0.12, 10.8 * s), T.at(0.34, 13.2 * s), T.at(0.78, 12.6 * s), knee(11.2), G.at(0.2, 10.4 * s), G.at(0.37, 8.4 * s, 1),
    G.at(0.37, -8 * s, 1), G.at(0.18, -10.6 * s), knee(-9.8), T.at(0.62, -12 * s), T.at(0.22, -12.4 * s), T.at(-0.12, -11.4 * s)];
  _ksPart(ctx, K, () => _kgShape(ctx, leg), KS.core, { red: rd * s, redCol: rim, tan: td * s, tanCol: tan, detail: far ? null : (g) => {
    // the cuff's band, and a fold falling from the hip
    _kgLine(g, [G.at(0.31, 12 * s), G.at(0.31, -12 * s)], KS.cloth, 2 * s);
    _kgFill(g, [T.at(0.1, -2 * s), T.at(0.9, -7.4 * s), T.at(0.96, -3 * s)], KS.clothLo);
  } });
}
