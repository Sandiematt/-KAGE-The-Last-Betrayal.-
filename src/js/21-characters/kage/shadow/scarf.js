/* ---- Kage's shadow scarf: a crimson scarf wound round the neck, low and pointed at the front, high at the nape, and
   its two tails streaming back on the wind (cloth chains, kageShadowCloths): the long one tapering to a point, the
   shorter one behind it cut to a swallow tail. Each tail is one ribbon with a lit ridge along its upper side and a
   darker fold along its underside, as on the reference sheet. ---- */
function _ksScarfTails(f, ctx, K) {
  const th = K.th;
  // an Armory armour's extra torn strands streaming with the tails (../armory/), behind them
  if (th && th.strands) kageArmorStrands(f, ctx, K, th);
  // the short tail in the armour's second scarf colour, if it has one (the Shinsen's white streamer)
  const sw = th && th.scarf2 ? [KS.scarf, KS.scarfLo, KS.scarfHi] : null;
  if (sw) { KS.scarf = th.scarf2[0]; KS.scarfLo = th.scarf2[1]; KS.scarfHi = th.scarf2[2]; }
  _ksRibbon(f, ctx, K, 'scarfB', 4.6, 10.6, true);
  if (sw) { KS.scarf = sw[0]; KS.scarfLo = sw[1]; KS.scarfHi = sw[2]; }
  _ksRibbon(f, ctx, K, 'scarfA', 5.2, 12.6, false);
}

// a smooth open curve through pts[from..to] (either direction), continuing the current path
function _ksThrough(ctx, pts, from, to) {
  const st = to > from ? 1 : -1;
  for (let i = from; i !== to; i += st) { const p = pts[i], q = pts[i + st]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  ctx.lineTo(pts[to][0], pts[to][1]);
}

// part: a cloth part name, or a chain-like { n, px, py, o: { ph } } (an armour's strands)
function _ksRibbon(f, ctx, K, part, w0, w1, fork) {
  const c = typeof part === 'string' ? _ksCloth(f, part) : part; if (!c) return;
  const s = K.s, fc = K.fc, n = c.n, T = [], B = [], M = [], floor = K.floor - 2 * s;
  let ex = 0, ey = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
    let dx = c.px[b] - c.px[a], dy = c.py[b] - c.py[a]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const u = i / (n - 1), g = clamp(u / 0.34, 0, 1), grow = g * g * (3 - 2 * g);
    // narrow at the knot, full by a third of the way; the long tail then tapers to its point, the short one keeps its width
    const taper = fork ? 1 - 0.22 * clamp((u - 0.6) / 0.4, 0, 1) : u > 0.56 ? 1 - 0.95 * Math.pow((u - 0.56) / 0.44, 1.5) : 1;
    const w = lerp(w0, w1, grow) * taper * 0.5 * s * (1 + 0.1 * Math.sin(i * 1.7 + c.o.ph));
    const x = c.px[i], y = Math.min(c.py[i], floor), nx = -dy * fc, ny = dx * fc;   // (nx, ny): the upper side as it streams back
    T.push([x + nx * w, y + ny * w]); B.push([x - nx * w, y - ny * w]); M.push([x, y]);
    ex = dx; ey = dy;
  }
  const e = n - 1;
  const path = () => {
    ctx.moveTo(T[0][0], T[0][1]); _ksThrough(ctx, T, 0, e);
    if (fork) { ctx.lineTo(T[e][0] + ex * 5 * s, T[e][1] + ey * 5 * s); ctx.lineTo(M[e][0] - ex * 3.4 * s, M[e][1] - ey * 3.4 * s); ctx.lineTo(B[e][0] + ex * 8 * s, B[e][1] + ey * 8 * s); }
    else ctx.lineTo(M[e][0] + ex * 6 * s, M[e][1] + ey * 6 * s);
    ctx.lineTo(B[e][0], B[e][1]); _ksThrough(ctx, B, e, 0);
    ctx.closePath();
  };
  ctx.beginPath(); path();
  if (K.A.flat) { ctx.fillStyle = K.A.col; ctx.fill(); return; }
  ctx.fillStyle = fork ? KS.scarfLo : KS.scarf; ctx.fill();
  ctx.save(); ctx.clip();
  const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  // a band between one side and a line `k` of the way across, over links i0..i1 (thinning to nothing at i0)
  const band = (S1, S2, k, i0, i1, col) => {
    const In = []; for (let i = i0; i <= i1; i++) In.push(mix(S1[i], S2[i], k * clamp((i - i0) / 2, 0, 1)));
    ctx.beginPath(); ctx.moveTo(S1[i0][0], S1[i0][1]); _ksThrough(ctx, S1, i0, i1);
    if (i1 === e) ctx.lineTo(M[e][0] + ex * 9 * s, M[e][1] + ey * 9 * s);
    ctx.lineTo(In[In.length - 1][0], In[In.length - 1][1]); _ksThrough(ctx, In, In.length - 1, 0);
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  };
  if (fork) { band(T, B, 0.5, 0, e, KS.scarf); band(T, B, 0.16, Math.round(n * 0.34), e, KS.scarfHi); }
  else { band(B, T, 0.34, 0, Math.round(n * 0.72), KS.scarfLo); band(T, B, 0.2, Math.round(n * 0.4), e, KS.scarfHi); }
  ctx.restore();
}

// the wound band, in two passes: the cowl standing behind the nape (before the head), then the fold that crosses
// under the jaw and runs down to a point on the chest (after it), so the chin sits down into the scarf
function _ksScarfWrap(f, ctx, K, front) {
  const P = _kgP(K), s = K.s;
  // the scarf's own lights: a bright ridge on the edges facing up, its own shade on the underside
  const sv = [K.rx, K.ry, K.tx, K.ty]; K.rx = -K.fc * 0.3; K.ry = 0.95; K.tx = K.fc * 0.3; K.ty = -0.95;
  if (!front) {
    const cowl = [P(0.96, -10.4), P(1.12, -13.2), P(1.27, -10.2, 1), P(1.25, -2), P(1.15, 6), P(1.0, 8.8), P(0.9, 0)];
    _ksPart(ctx, K, () => _kgShape(ctx, cowl), KS.scarfLo, { red: 1.3 * s, redCol: KS.scarf });
  } else {
    const fold = [P(1.21, -10.6, 1), P(1.15, -2), P(1.07, 7), P(0.96, 16.8, 1), P(0.84, 10.4), P(0.93, -1), P(0.98, -12.2, 1)];
    _ksPart(ctx, K, () => _kgShape(ctx, fold), KS.scarf, { red: 1.5 * s, redCol: KS.scarfHi, tan: 2.4 * s, tanCol: KS.scarfLo, detail: (g) => {
      _kgLine(g, [P(1.12, -10), P(1.04, 0), P(0.95, 10)], KS.scarfLo, 1 * s);
    } });
  }
  K.rx = sv[0]; K.ry = sv[1]; K.tx = sv[2]; K.ty = sv[3];
}
