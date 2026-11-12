/* ---- Kage's shadow torso: a fitted black jacket, fuller at the chest and the back of the shoulders, with a crimson
   piping down its front; a wide dark-crimson belt knotted at the front; two black ties hanging from the knot (the
   belt's cloth chains). All in the spine frame: [u along the spine (0 the hip, 1 the neck), w px toward the front]. ---- */
const KS_TORSO = [[-0.06, 10.6], [0.24, 9.4], [0.52, 11.2], [0.8, 13.2], [0.96, 11.6, 1], [1.05, 4.6, 1],
  [1.06, -6, 1], [0.99, -13.2], [0.8, -15.2], [0.5, -12.2], [0.22, -10.6], [-0.06, -11.8]];

function _ksTorso(f, ctx, K) {
  const P = _kgP(K), s = K.s, pts = KS_TORSO.map(p => P(p[0], p[1], p[2]));
  _ksPart(ctx, K, () => _kgShape(ctx, pts), KS.core, { red: 1.2 * s, tan: 1.5 * s, detail: (g) => {
    // the back of the jacket a shade up, as the cloth turns to the back light
    _kgFill(g, [P(1.12, -5.4), P(0.86, -3.4), P(0.6, -6), P(0.34, -3.8), P(-0.1, -5), P(-0.1, -22), P(1.12, -22)], KS.cloth);
    // the piping down the front, three small studs beside it
    _kgLine(g, [P(1.02, 7), P(0.62, 5.4), P(0.24, 4.4), P(-0.08, 4.8)], KS.red, 1.4 * s);
    g.fillStyle = KS.redLo;
    for (const u of [0.74, 0.54, 0.34]) { const c = P(u, 2.2); g.beginPath(); g.arc(c[0], c[1], 0.8 * s, 0, TAU); g.fill(); }
  } });
}

// the neck: the same black, from the collar up into the head (the scarf winds round it)
function _ksNeck(f, ctx, K) {
  const sk = f.sk, S = K.S, s = K.s;
  const n0 = { x: spX(S, 0.96, 0), y: spY(S, 0.96, 0) }, n1 = { x: lerp(sk.neck.x, sk.head.x, 0.62), y: lerp(sk.neck.y, sk.head.y, 0.62) };
  ctx.fillStyle = K.A.flat ? K.A.col : KS.core; ctx.beginPath(); animeCapsule(ctx, n0, n1, 4.2 * s, 3.6 * s, 0, 0.5); ctx.fill();
}

// the belt: a wide band round the waist, darker along its lower edge, the knot a brighter block at the front
function _ksBelt(f, ctx, K) {
  const P = _kgP(K), s = K.s;
  const band = [P(0.2, -11.8, 1), P(0.21, 10.8, 1), P(0.01, 11.6, 1), P(-0.01, -12.8, 1)];
  _ksPart(ctx, K, () => _kgShape(ctx, band), KS.belt, { red: 1.5 * s, tan: 1.3 * s, detail: (g) => {
    _kgFill(g, [P(0.075, -14), P(0.085, 13), P(-0.04, 13), P(-0.04, -14)], KS.beltLo);          // the lower edge
    _kgFill(g, [P(0.24, 1.6), P(0.24, 7.4), P(-0.04, 7.8), P(-0.04, 1.2)], KS.beltHi);          // the knot
    _kgLine(g, [P(0.22, 3.6), P(-0.02, 3.4)], KS.beltLo, 1 * s);
    _kgLine(g, [P(0.22, 5.6), P(-0.02, 5.8)], KS.beltLo, 1 * s);
  } });
}

// the two ties hanging from the knot: flat black straps, a little wider at their cut ends (drawn under the belt)
function _ksTies(f, ctx, K) {
  const s = K.s, fc = K.fc, P = _kgP(K), root = P(0.1, 4.6);
  let i = 0;
  for (const cl of f.cloths) {
    if (cl.kind !== 'belt' || !cl.c.init) continue;
    const c = cl.c, n = c.n, ox = root[0] - c.px[0] + (i ? -2.4 * s * fc : 1.2 * s * fc), oy = root[1] - c.py[0];
    const L = [], R = [];
    for (let j = 0; j < n; j++) {
      const a = Math.max(0, j - 1), b = Math.min(n - 1, j + 1);
      let dx = c.px[b] - c.px[a], dy = c.py[b] - c.py[a]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const w = (i ? 1.9 : 2.3) * s * (1 + 0.5 * j / (n - 1)), x = c.px[j] + ox, y = Math.min(c.py[j] + oy, K.floor - 2 * s);
      L.push([x - dy * w, y + dx * w]); R.push([x + dy * w, y - dx * w]);
    }
    // the cut end: one corner longer than the other
    const e = n - 1, ex = (c.px[e] - c.px[e - 1]) * 0.5, ey = (c.py[e] - c.py[e - 1]) * 0.5;
    R[e] = [R[e][0] + ex, R[e][1] + ey];
    const path = () => {
      ctx.moveTo(L[0][0], L[0][1]);
      for (let j = 1; j < n; j++) ctx.lineTo(L[j][0], L[j][1]);
      for (let j = n - 1; j >= 0; j--) ctx.lineTo(R[j][0], R[j][1]);
      ctx.closePath();
    };
    _ksPart(ctx, K, path, KS.core, { tan: 0.9 * s, tanCol: KS.tanFar, red: 0.8 * s, redCol: KS.rimFar });
    i++;
  }
}
