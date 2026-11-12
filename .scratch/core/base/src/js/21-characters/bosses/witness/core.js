/* ---- the chest core, one per phase (the user's sheets), at the front of the shoulder over the near arm ----
   0, 1 The Observer, The Manipulator   a white orb in a ring of the phase's blue, a dark ring, a notched gold ring
   2 The Reality Editor                 a black hole: the black core in a violet ring, its accretion band, a gold ring
   3 The True Witness                   the great black hole: gold rays round it, a gold outer ring
   (the Kysmei Robe on Kage keeps the old white-hot violet core). From phase II on, what its free hand holds: the
   ringed orb (II) or the cube of the Reality Editor (III, IV). Drawing only. */
// high on the chest toward the front, where the great sleeve meets the shoulder
Fighter.prototype.corePos = function () {
  const sk = this.sk, s = this.scale, dx = sk.neck.x - sk.hip.x, dy = sk.neck.y - sk.hip.y, T = Math.hypot(dx, dy) || 1;
  const nx = -dy / T * this.facing, ny = dx / T * this.facing, w = 6.4 * s;
  return { x: sk.hip.x + dx * 0.8 + nx * w, y: sk.hip.y + dy * 0.8 + ny * w };
};

Fighter.prototype.drawCore = function (ctx, opt) {
  const s = this.scale, t = this.time || 0, f = this.facing, { x, y } = this.corePos();
  if (opt.color) { ctx.fillStyle = opt.color; ctx.beginPath(); ctx.arc(x, y, 9.4 * s, 0, TAU); ctx.fill(); return; }
  const wit = this.def && this.def.witness, look = wit ? WitnessBoss.lookOf(this) : -1, k = this.witFade(), L = WT_L;
  const gold = L.gold, goldHi = L.goldHi, dim = this.wDecoy ? 0.25 : 1, r = 5.4 * s * (1 + Math.sin(t * 5) * 0.05);
  const bloom = (R, a) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = wtGlow(ctx, x, y, R, L.glow.join(','), a * dim, 2.2); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill(); ctx.restore(); };
  // a notched gold ring: an arc cut into n pieces
  const notched = (R, n, w) => { ctx.strokeStyle = gold; ctx.lineWidth = w; const seg = TAU / n; for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(x, y, R, i * seg + 0.08, (i + 1) * seg - 0.08); ctx.stroke(); } };
  ctx.save(); ctx.globalAlpha *= k;
  if (look === 0 || look === 1) {
    bloom(r * (look ? 4.4 : 3.6), look ? 0.7 : 0.55);
    ctx.fillStyle = '#05040e'; ctx.beginPath(); ctx.arc(x, y, r * 1.85, 0, TAU); ctx.fill();
    notched(r * 1.7, 10, 1.6 * s);
    ctx.strokeStyle = L.line; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.arc(x, y, r * 1.36, 0, TAU); ctx.stroke();
    ctx.fillStyle = L.panel[1]; ctx.beginPath(); ctx.arc(x, y, r * 1.2, 0, TAU); ctx.fill();
    ctx.fillStyle = this.wDecoy ? L.panel[0] : L.eye; ctx.beginPath(); ctx.arc(x, y, r * 0.98, 0, TAU); ctx.fill();
    ctx.fillStyle = this.wDecoy ? L.panel[0] : '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r * 0.78, 0, TAU); ctx.fill();
  } else if (look === 2 || look === 3) {
    const big = look === 3 ? 1.25 : 1;
    if (look === 3) {   // gold rays
      ctx.strokeStyle = gold; ctx.lineWidth = 1.2 * s;
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + t * 0.4, L1 = r * (2.6 + (i % 2) * 1.1) * big; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 2.05 * big, y + Math.sin(a) * r * 2.05 * big); ctx.lineTo(x + Math.cos(a) * L1, y + Math.sin(a) * L1); ctx.stroke(); }
    }
    bloom(r * 3.6 * big, 0.6);
    ctx.strokeStyle = L.vio[2]; ctx.lineWidth = 1.3 * s; ctx.beginPath(); ctx.ellipse(x, y, r * 2.5 * big, r * 0.62 * big, -0.25 * f, Math.PI, TAU); ctx.stroke();
    ctx.fillStyle = '#020006'; ctx.beginPath(); ctx.arc(x, y, r * 1.45 * big, 0, TAU); ctx.fill();
    ctx.strokeStyle = this.wDecoy ? L.panel[0] : L.vio[1]; ctx.lineWidth = 1.8 * s; ctx.beginPath(); ctx.arc(x, y, r * 1.45 * big, 0, TAU); ctx.stroke();
    notched(r * 1.95 * big, 12, 1.1 * s);
    ctx.strokeStyle = L.vio[2]; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.ellipse(x, y, r * 2.5 * big, r * 0.62 * big, -0.25 * f, 0, Math.PI); ctx.stroke();
  } else {
    // the Kysmei Robe's core on Kage: the old white-hot orb in a violet bloom
    bloom(r * 4.2, 0.5);
    ctx.fillStyle = '#1a0a1e'; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ff4fa6'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#b48aff'; ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.restore();
  if (look >= 1) this.drawWitnessHand(ctx);
};

// what the free (far) hand holds: the ringed orb of the Manipulator, the cube of the Reality Editor and the True
// Witness, each turning in its own ring with small shards round it
Fighter.prototype.drawWitnessHand = function (ctx) {
  if (this.kageFrame || this.wDecoy) return;
  const look = WitnessBoss.lookOf(this), s = this.scale, t = this.time || 0, f = this.facing, h = this.sk.bha, el = this.sk.bel, L = WT_L;
  let ux = h.x - el.x, uy = h.y - el.y; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
  const x = h.x + ux * 10 * s, y = h.y + uy * 10 * s - 13 * s, tilt = -0.35 * f + Math.sin(t) * 0.1;
  ctx.save(); ctx.globalAlpha *= this.witFade();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = wtGlow(ctx, x, y, 26 * s, L.glow.join(','), 0.55, 2.2); ctx.beginPath(); ctx.arc(x, y, 26 * s, 0, TAU); ctx.fill(); ctx.restore();
  const ring = (a0, a1, w) => { ctx.strokeStyle = L.line; ctx.lineWidth = w * s; ctx.beginPath(); ctx.ellipse(x, y, 19 * s, 5 * s, tilt, a0, a1); ctx.stroke(); };
  ring(Math.PI, TAU, 1.1);
  if (look === 1) {
    ctx.fillStyle = L.panel[1]; ctx.beginPath(); ctx.arc(x, y, 8.4 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 6.2 * s, 0, TAU); ctx.fill();
    ctx.strokeStyle = L.line; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.arc(x, y, 8.4 * s, 0, TAU); ctx.stroke();
  } else {
    // a dark cube turning: three faces, the pale line on its edges, a glyph on its front
    const a = t * 0.8, c = Math.cos(a), sn = Math.sin(a), z = 7.4 * s;
    const P = (px, py, pz) => [x + (px * c - pz * sn) * z, y + py * z * 0.9 - (px * sn + pz * c) * z * 0.35];
    const top = [P(-1, -1, -1), P(1, -1, -1), P(1, -1, 1), P(-1, -1, 1)], fr = [P(-1, -1, 1), P(1, -1, 1), P(1, 1, 1), P(-1, 1, 1)], sd = [P(1, -1, -1), P(1, -1, 1), P(1, 1, 1), P(1, 1, -1)];
    ctx.lineJoin = 'miter';
    for (const [q, col] of [[sd, L.panel[0]], [fr, '#07020f'], [top, L.panel[1]]]) { ctx.fillStyle = col; ctx.beginPath(); _poly(ctx, q); ctx.fill(); ctx.strokeStyle = L.line; ctx.lineWidth = 1 * s; ctx.stroke(); }
    ctx.lineJoin = 'round';
    const m = [(fr[0][0] + fr[2][0]) / 2, (fr[0][1] + fr[2][1]) / 2];
    ctx.strokeStyle = look === 3 ? L.gold : L.panel[2]; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(m[0], m[1] - 2.6 * s); ctx.lineTo(m[0], m[1] + 2.6 * s); ctx.moveTo(m[0] - 2 * s, m[1] - 0.6 * s); ctx.lineTo(m[0] + 2 * s, m[1] - 0.6 * s); ctx.stroke();
    ctx.fillStyle = look === 3 ? L.gold : L.panel[2];
    for (let i = 0; i < 6; i++) { const q = t * 1.6 + i * TAU / 6, rr = (16 + 3 * Math.sin(t * 3 + i)) * s; ctx.fillRect(x + Math.cos(q) * rr, y + Math.sin(q) * rr * 0.5, 2.4 * s, 2.4 * s); }
  }
  ring(0, Math.PI, 1.3);
  ctx.restore();
};
