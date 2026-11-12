/* ---- Kage's shadow coat, below the belt: three panels on cloth chains (kageShadowCloths). Only the far end of each
   chain is read; a panel is drawn as clean curves from the waist to it, so it sweeps and never kinks.
     the back tail   one great panel fanning back from the waist: its trailing edge streams out on the wind, its
                     leading edge hangs heavy toward the shin, and the hem between them carries a crimson band with
                     four cloud scrolls rising from it, running to solid crimson at the far tip
     the drape       the coat's inner side, hanging between the legs
     the front flap  the near side, lying over the near thigh, a dark crimson band above its hem ---- */

// the hem band's depth in px across the back tail: h along the hem (0 the low corner, 1 the far tip). A thin band,
// turning up at the low corner and running to solid crimson at the far tip
function _ksBandD(h) {
  const k = clamp((h - 0.62) / 0.38, 0, 1);
  return 3 + 3 * Math.max(0, 1 - h / 0.09) + 16 * k * k * (3 - 2 * k);
}

// the scrolls: [h along the hem, radius px]
const KS_SCROLLS = [[0.15, 6.6], [0.36, 8.4], [0.56, 7.6], [0.73, 5.6]];

function _ksBackTail(f, ctx, K) {
  const ct = _ksCloth(f, 'top'), cl = _ksCloth(f, 'lead'); if (!ct || !cl) return;
  const s = K.s, P = _kgP(K);
  const fc = K.fc, Al = P(0.1, 4.6), At = P(0.12, -11.2), fl = (p, lift) => [p[0], Math.min(p[1], K.floor - lift * s)];
  // the trailing edge stays behind him, the leading edge under it; and the panel keeps its width: the leading edge
  // never closes to less than half a radian under the trailing one, however hard he runs
  const Et = fl(_ksHold(At, _ksEnd(ct, K, 7), fc, 0.4, 2.2), 7), aT = _ksAng(At, Et, fc);
  const El = fl(_ksHold(Al, _ksEnd(cl, K, 3), fc, -0.22, aT - 0.5), 3);
  const apex = [(Al[0] + At[0]) / 2, (Al[1] + At[1]) / 2];
  // a control point off the middle of a -> b, pushed `k` of its length away from `from`
  const bow = (a, b, from, k) => {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    let nx = -dy / l, ny = dx / l; if (nx * (from[0] - mx) + ny * (from[1] - my) > 0) { nx = -nx; ny = -ny; }
    return [mx + nx * l * k, my + ny * l * k];
  };
  const Ct = bow(At, Et, El, 0.15), Cl = bow(Al, El, Et, 0.03);
  const hm = [(El[0] + Et[0]) / 2, (El[1] + Et[1]) / 2], Ch = [hm[0] + (apex[0] - hm[0]) * 0.36, hm[1] + (apex[1] - hm[1]) * 0.36];
  const path = () => {
    ctx.moveTo(Al[0], Al[1]);
    ctx.quadraticCurveTo(Cl[0], Cl[1], El[0], El[1]);
    ctx.quadraticCurveTo(Ch[0], Ch[1], Et[0], Et[1]);
    ctx.quadraticCurveTo(Ct[0], Ct[1], At[0], At[1]);
    ctx.closePath();
  };
  const edge = (g, a, c, b, col, lw) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(c[0], c[1], b[0], b[1]); g.stroke(); };
  _ksPart(ctx, K, path, KS.cloth, { detail: (g) => {
    g.lineCap = 'round'; g.lineJoin = 'round';
    // a fold falling from the waist, and the dark crimson piping just inside the leading edge
    _kgFill(g, [apex, _ksQ(El, Ch, Et, 0.42), _ksQ(El, Ch, Et, 0.5)], KS.clothLo);
    edge(g, Al, Cl, El, KS.redLo, 10 * s); edge(g, Al, Cl, El, KS.cloth, 6.6 * s);
    // the hem: H(h) runs along it, N(h) is the way in from it (toward the waist)
    const H = (h) => _ksQ(El, Ch, Et, h);
    const N = (h) => {
      const a = H(h - 0.02), b = H(h + 0.02); let ex = b[0] - a[0], ey = b[1] - a[1]; const el = Math.hypot(ex, ey) || 1; ex /= el; ey /= el;
      const o = H(h); let ux = -ey, uy = ex; if (ux * (apex[0] - o[0]) + uy * (apex[1] - o[1]) < 0) { ux = -ux; uy = -uy; }
      return [o, ex, ey, ux, uy];
    };
    const hemLen = Math.hypot(Et[0] - El[0], Et[1] - El[1]), q = clamp(hemLen / (86 * s), 0.5, 1.12) * s;
    g.fillStyle = KS.red; g.strokeStyle = KS.red;
    g.beginPath();
    for (let i = 0; i <= 16; i++) { const p = H(i / 16 * 1.04 - 0.02); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
    for (let i = 16; i >= 0; i--) { const h = i / 16, [o, , , ux, uy] = N(h), d = _ksBandD(h) * q; g.lineTo(o[0] + ux * d, o[1] + uy * d); }
    g.closePath(); g.fill();
    // the cloud scrolls: each rises from the band, turns over and curls in on itself, with a small flick beside it
    for (const [h0, R0] of KS_SCROLLS) {
      const R = R0 * q, [O, ex, ey, ux, uy] = N(h0), bh = _ksBandD(h0) * q, cy = bh + R * 0.9;
      const W = (x, y) => [O[0] + ex * x + ux * y, O[1] + ey * x + uy * y];
      g.lineWidth = R * 0.5; g.beginPath();
      let p = W(-R * 1.25, bh * 0.5); g.moveTo(p[0], p[1]);
      for (let i = 0; i <= 26; i++) {
        const k = i / 26, ph = (205 - 430 * k) * DEG, rr = R * (1 - 0.64 * k);
        p = W(Math.cos(ph) * rr, cy + Math.sin(ph) * rr); g.lineTo(p[0], p[1]);
      }
      g.stroke();
      g.beginPath(); g.arc(p[0], p[1], R * 0.3, 0, TAU); g.fill();
      const f0 = W(R * 0.9, bh * 0.6), f1 = W(R * 1.58, bh + R * 0.1), f2 = W(R * 1.36, bh + R * 0.8);
      g.lineWidth = R * 0.3; g.beginPath(); g.moveTo(f0[0], f0[1]); g.quadraticCurveTo(f1[0], f1[1], f2[0], f2[1]); g.stroke();
    }
    // the back light along both long edges
    edge(g, At, Ct, Et, KS.tan, 2.8 * s); edge(g, Al, Cl, El, KS.tan, 2.6 * s);
  } });
}

// a hanging panel from the waist edge a0 (front) - a1 (back) to the end E: returns its frame
function _ksHang(a0, a1, E, fc) {
  const mx = (a0[0] + a1[0]) / 2, my = (a0[1] + a1[1]) / 2;
  let dx = E[0] - mx, dy = E[1] - my; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
  return { dx, dy, nx: dy * fc, ny: -dx * fc, l };   // (dx, dy) down the panel, (nx, ny) toward its front edge
}

function _ksDrape(f, ctx, K) {
  const c = _ksCloth(f, 'drape'); if (!c) return;
  const s = K.s, P = _kgP(K), a0 = P(0.06, 7.4), a1 = P(0.06, -7.4), am = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2];
  const E = _ksHold(am, _ksEnd(c, K, 3), K.fc, -0.3, 1), F = _ksHang(a0, a1, E, K.fc);
  const fl = (p) => [p[0], Math.min(p[1], K.floor - 1 * s)];
  const e0 = fl([E[0] + F.nx * 9 * s, E[1] + F.ny * 9 * s]), e1 = fl([E[0] - F.nx * 11 * s + F.dx * 6 * s, E[1] - F.ny * 11 * s + F.dy * 6 * s]);
  const em = [(e0[0] + e1[0]) / 2 - F.dx * 3 * s, (e0[1] + e1[1]) / 2 - F.dy * 3 * s];
  const path = () => {
    ctx.moveTo(a0[0], a0[1]);
    ctx.quadraticCurveTo((a0[0] + e0[0]) / 2 + F.nx * 2 * s, (a0[1] + e0[1]) / 2 + F.ny * 2 * s, e0[0], e0[1]);
    ctx.lineTo(em[0], em[1]); ctx.lineTo(e1[0], e1[1]);
    ctx.quadraticCurveTo((a1[0] + e1[0]) / 2 - F.nx * 2 * s, (a1[1] + e1[1]) / 2 - F.ny * 2 * s, a1[0], a1[1]);
    ctx.closePath();
  };
  _ksPart(ctx, K, path, KS.clothLo, { tan: 1.4 * s, tanCol: KS.tanFar, red: 1 * s, redCol: KS.rimFar });
}

function _ksFlap(f, ctx, K) {
  const c = _ksCloth(f, 'flap'); if (!c) return;
  const s = K.s, fc = K.fc, sk = f.sk, P = _kgP(K), a0 = P(0.12, 11.4), a1 = P(0.1, -3.4);
  // the flap lies on the near thigh: its end is drawn halfway from where the cloth hangs to the knee
  let E = _ksHold(a0, _ksEnd(c, K, 3), fc, -0.5, 0.6); E = [lerp(E[0], sk.fkn.x + fc * 3 * s, 0.5), lerp(E[1], sk.fkn.y + 5 * s, 0.5)];
  const F = _ksHang(a0, a1, E, fc);
  const e0 = [E[0] + F.nx * 10.5 * s + F.dx * 5 * s, E[1] + F.ny * 10.5 * s + F.dy * 5 * s], e1 = [E[0] - F.nx * 11 * s, E[1] - F.ny * 11 * s];
  const path = () => {
    ctx.moveTo(a0[0], a0[1]);
    ctx.quadraticCurveTo((a0[0] + e0[0]) / 2 + F.nx * 3.4 * s, (a0[1] + e0[1]) / 2 + F.ny * 3.4 * s, e0[0], e0[1]);
    ctx.lineTo(e1[0], e1[1]);
    ctx.quadraticCurveTo((a1[0] + e1[0]) / 2 - F.nx * 1.5 * s, (a1[1] + e1[1]) / 2 - F.ny * 1.5 * s, a1[0], a1[1]);
    ctx.closePath();
  };
  _ksPart(ctx, K, path, KS.cloth, { red: 1.9 * s, tan: 0.9 * s, tanCol: KS.tanFar, detail: (g) => {
    const up = (p, k) => [p[0] - F.dx * k * s, p[1] - F.dy * k * s], mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    // the dark crimson band above the hem, and two folds from the belt
    _kgLine(g, [up(mix(e0, e1, -0.2), 5), up(mix(e0, e1, 1.2), 5)], KS.redLo, 3 * s);
    _kgFill(g, [mix(a0, a1, 0.42), up(mix(e0, e1, 0.36), 8), up(mix(e0, e1, 0.48), 8)], KS.core);
    _kgFill(g, [mix(a0, a1, 0.78), up(mix(e0, e1, 0.74), 14), up(mix(e0, e1, 0.84), 14)], KS.clothLo);
  } });
}
