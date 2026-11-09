/* ---- the waist (witnessBody): the belt, the gold plaques, the chains with the diamond pendant and the white tassel,
   the katana's hilt forward at the hip; the saya behind the coat. From the Reality Editor on, a rune banner hangs from
   the belt down the front (gold edges, glyphs). ---- */
function _wtWaist(f, ctx, W) {
  const P = _wtP(W), s = W.s, L = WT_L, t = W.t, flat = W.A.flat, look = _wtLookKey;
  // the rune banner under the belt (III, IV)
  if (look === 2 || look === 3) {
    const sw = Math.sin(t * 1.9) * 1.6, b = [P(-0.02, 2.2), P(-0.02, 8.6), P(-0.58, 8.2 + sw), P(-0.66, 5.6 + sw), P(-0.58, 3 + sw)];
    _wtPart(ctx, W, () => _poly(ctx, b), [L.panel[0], L.panel[0], L.panel[1]], { lw: W.lw, line: L.gold, sd: 1.2 * s, detail: flat ? null : (g) => {
      g.strokeStyle = L.goldHi; g.lineWidth = 0.9 * s; g.beginPath();
      for (let i = 0; i < 4; i++) { const u = -0.1 - i * 0.12, a = P(u, 3.8 + sw * (i / 4)), c = P(u, 7 + sw * (i / 4)), m = P(u - 0.05, 5.4 + sw * (i / 4)); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.moveTo(m[0], m[1]); g.lineTo(lerp(a[0], c[0], 0.5), lerp(a[1], c[1], 0.5)); }
      g.stroke();
    } });
  }
  // the belt: a dark band edged gold
  const band = [P(-0.03, -11.4), P(-0.03, 10.4), P(0.085, 9.8), P(0.085, -10.6)];
  _wtPart(ctx, W, () => _poly(ctx, band), L.bodyInk, { lw: W.lw * 0.9, line: L.gold, sd: 1.4 * s });
  // the plaques: gold squares, dark inside, a diamond in each
  for (const w of [1.6, 7.2]) {
    const c = P(0.028, w), z = 2.9 * s, sq = [[c[0] - z, c[1] - z], [c[0] + z, c[1] - z], [c[0] + z, c[1] + z], [c[0] - z, c[1] + z]];
    _wtPart(ctx, W, () => _poly(ctx, sq), [L.gold, L.gold, L.goldHi], { lw: 0, sd: 0.8 * s, detail: flat ? null : (g) => {
      g.fillStyle = L.bodyInk[1]; g.fillRect(c[0] - z * 0.62, c[1] - z * 0.62, z * 1.24, z * 1.24);
      g.fillStyle = L.goldHi; g.beginPath(); _poly(g, [[c[0], c[1] - z * 0.5], [c[0] + z * 0.32, c[1]], [c[0], c[1] + z * 0.5], [c[0] - z * 0.32, c[1]]]); g.fill();
    } });
  }
  // the chains: two gold loops from the plaques, the pendant on the longer one, its tassel swaying under it
  const sw = Math.sin(t * 2.1) * 1.4;
  ctx.lineCap = 'round';
  _wtLine(ctx, W, [P(-0.01, 7.2), P(-0.2, 7.6 + sw * 0.4), P(-0.3, 4.6 + sw * 0.6)], L.gold, 1.1 * s);
  _wtLine(ctx, W, [P(-0.01, 1.6), P(-0.16, 1.8 + sw * 0.3), P(-0.3, 4.6 + sw * 0.6)], L.gold, 1.1 * s);
  _wtLine(ctx, W, [P(-0.01, 4.2), P(-0.1, 9.4 + sw * 0.3), P(-0.02, 12.4)], L.gold, 0.9 * s);
  const pd = P(-0.36, 4.6 + sw * 0.6), z = 3 * s, dia = [[pd[0], pd[1] - z * 1.3], [pd[0] + z, pd[1]], [pd[0], pd[1] + z * 1.3], [pd[0] - z, pd[1]]];
  _wtPart(ctx, W, () => _poly(ctx, dia), [L.gold, L.gold, L.goldHi], { lw: 0, sd: 0.8 * s, detail: flat ? null : (g) => {
    g.fillStyle = L.bodyInk[1]; g.beginPath(); _poly(g, [[pd[0], pd[1] - z * 0.78], [pd[0] + z * 0.58, pd[1]], [pd[0], pd[1] + z * 0.78], [pd[0] - z * 0.58, pd[1]]]); g.fill();
    g.fillStyle = L.panel[2]; g.beginPath(); g.arc(pd[0], pd[1], z * 0.24, 0, TAU); g.fill();
  } });
  // the tassel: white strands from under the pendant
  const tp = [pd[0], pd[1] + z * 1.3], dn = [-W.S.ux, -W.S.uy], fr = [W.S.nx, W.S.ny];
  _wtFill(ctx, W, () => _poly(ctx, [[tp[0] - fr[0] * 1.4 * s, tp[1] - fr[1] * 1.4 * s], [tp[0] + fr[0] * 1.4 * s, tp[1] + fr[1] * 1.4 * s], [tp[0] + dn[0] * 3 * s, tp[1] + dn[1] * 3 * s]]), L.gold);
  for (let i = -2; i <= 2; i++) {
    const a = [tp[0] + dn[0] * 2.4 * s + fr[0] * i * 0.7 * s, tp[1] + dn[1] * 2.4 * s + fr[1] * i * 0.7 * s], len = (17 - Math.abs(i) * 1.6) * s, sx = Math.sin(t * 2.4 + i * 0.4) * 2 * s;
    _wtLine(ctx, W, [a, [a[0] + dn[0] * len + fr[0] * (i * 1.1 * s + sx), a[1] + dn[1] * len + fr[1] * (i * 1.1 * s + sx)]], '#eef0ff', 1.2 * s);
  }
  _wtHilt(f, ctx, W, P);
}

// the katana's hilt forward at the front hip, rising a little: the gold tsuba, the wrapped tsuka with its gold
// diamonds, the gold kashira
function _wtHilt(f, ctx, W, P) {
  const s = W.s, L = WT_L, fr = [W.S.nx, W.S.ny], up = [W.S.ux, W.S.uy], ts = P(0.06, 10.6);
  const d = [fr[0] * 0.94 + up[0] * 0.34, fr[1] * 0.94 + up[1] * 0.34], nn = [-d[1], d[0]], len = 30 * s, hw = 2.4 * s;
  const at = (a, b) => [ts[0] + d[0] * a + nn[0] * b, ts[1] + d[1] * a + nn[1] * b];
  const tsuka = [at(1.6 * s, hw), at(len, hw * 0.9), at(len, -hw * 0.9), at(1.6 * s, -hw)];
  _wtPart(ctx, W, () => _poly(ctx, tsuka), L.bodyInk, { lw: W.lw * 0.8, line: L.line, sd: 1 * s, detail: W.A.flat ? null : (g) => {
    g.fillStyle = L.gold;
    for (let i = 1; i < 6; i++) { const c = at(1.6 * s + i * (len - 3 * s) / 6, 0), z = 1.2 * s; g.beginPath(); _poly(g, [[c[0] - d[0] * z * 1.2, c[1] - d[1] * z * 1.2], [c[0] + nn[0] * z, c[1] + nn[1] * z], [c[0] + d[0] * z * 1.2, c[1] + d[1] * z * 1.2], [c[0] - nn[0] * z, c[1] - nn[1] * z]]); g.fill(); }
  } });
  const kash = [at(len - 1 * s, hw * 1.1), at(len + 2.4 * s, hw * 1.1), at(len + 2.4 * s, -hw * 1.1), at(len - 1 * s, -hw * 1.1)];
  _wtPart(ctx, W, () => _poly(ctx, kash), [L.gold, L.gold, L.goldHi], { lw: 0, sd: 0.6 * s });
  const tsuba = [at(-0.6 * s, 4.6 * s), at(1.8 * s, 4.6 * s), at(1.8 * s, -4.6 * s), at(-0.6 * s, -4.6 * s)];
  _wtPart(ctx, W, () => _poly(ctx, tsuba), [L.panel[0], L.panel[1], L.panel[2]], { lw: W.lw * 0.8, line: L.gold, sd: 0.8 * s });
}

// the saya behind the coat: from the hip back and down, black with gold diamonds and a gold chape
function _wtSaya(f, ctx, W) {
  const P = _wtP(W), s = W.s, L = WT_L, a = P(0.04, 8), b = P(-0.32, -44);
  const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]) || 1, nn = [-d[1] / l * 2.4 * s, d[0] / l * 2.4 * s];
  const saya = [[a[0] + nn[0], a[1] + nn[1]], [b[0] + nn[0] * 0.8, b[1] + nn[1] * 0.8], [b[0] - nn[0] * 0.8, b[1] - nn[1] * 0.8], [a[0] - nn[0], a[1] - nn[1]]];
  _wtPart(ctx, W, () => _poly(ctx, saya), WT_FAR, { lw: W.lwFar, line: L.dim, sd: 1 * s, detail: W.A.flat ? null : (g) => {
    g.fillStyle = L.gold;
    for (let i = 1; i < 7; i++) { const u = i / 7, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), z = 1.1 * s; g.beginPath(); _poly(g, [[x, y - z], [x + z * 0.8, y], [x, y + z], [x - z * 0.8, y]]); g.fill(); }
    g.fillRect(b[0] - 2 * s, b[1] - 2 * s, 4 * s, 4 * s);
  } });
}
