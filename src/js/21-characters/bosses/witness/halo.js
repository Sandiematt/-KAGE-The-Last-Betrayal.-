/* ---- the halo: the Echo System behind the Witness, one design per phase (the user's sheets) ----
   Never a full ring (the user's rule, 2026-11-09): a crescent curving round behind its head and back, thickest
   behind the shoulders and tapering to nothing at both ends, with the echo shards floating outside it.
     0 The Observer       one segmented crescent in the phase's blue, a thin pale crescent inside it, a gold arc
                          outside it at the back; six shards over it (Orbit Blades lights them one by one and looses them)
     1 The Manipulator    three crescents sliding against each other, a ringed white orb inside them, the shards larger
     2 The Reality Editor the crescent broken into jumping pieces, gold among them, a black hole inside it with its ring,
                          three rune banners over it, glitch pixels shed off it
     3 The True Witness   a thick gold crescent with gold blades standing out of it, a violet one inside, two tall rune
                          banners, the great black hole in its middle
   In the facing-right frame its angles run from below the back (about 110 degrees) over the back and the top to just
   past the crown (about 320 degrees). Drawing only. */
// where the halo sits and how big it is: its centre behind the head, so its front is hidden by the figure
Fighter.prototype.haloPos = function () {
  const sk = this.sk, f = this.facing, hr = BODY.head * this.scale * this.build.head, R = hr * 3.9;
  return { x: sk.head.x - f * R * 0.86, y: sk.head.y + R * 0.02, r: R };
};

// the echo shards floating outside the crescent, as the sheets scatter them: [angle (facing-right frame, x PI), out from
// the crescent (design px), length, half-width, tilt off the radial (radians)]; Orbit Blades looses them in this order
const WT_SHARDS = [[1.67, 26, 42, 6.4, 0.32], [1.52, 40, 54, 7.6, -0.1], [1.37, 22, 36, 5.8, 0.28], [1.21, 36, 46, 7, -0.22], [1.05, 24, 34, 5.6, 0.36], [0.9, 30, 40, 6.4, -0.18]];
// where shard i sits (Orbit Blades launches its blades from here: 69-witness.js)
Fighter.prototype.haloShard = function (i) {
  const h = this.haloPos(), S = WT_SHARDS[i % WT_SHARDS.length], s = this.scale, a = S[0] * Math.PI, bob = Math.sin((this.time || 0) * 1.6 + i * 1.3) * 2.4 * s;
  const p = _wtHaloAt(h, this.facing, a, h.r + S[1] * s + bob);
  return { x: p[0], y: p[1], a, len: S[2] * s, wid: S[3] * s, tilt: S[4] };
};

// the point of the halo at angle a (facing-right frame), radius r
function _wtHaloAt(h, fc, a, r) { return [h.x + fc * Math.cos(a) * r, h.y + Math.sin(a) * r]; }

// a crescent: the outer edge at radius r from a0 to a1, its thickness w in the middle tapering to nothing at the ends
function _wtCrescent(ctx, h, fc, r, a0, a1, w, pow) {
  const N = 48;
  for (let i = 0; i <= N; i++) { const p = _wtHaloAt(h, fc, lerp(a0, a1, i / N), r); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
  for (let i = N; i >= 0; i--) { const u = i / N, k = Math.pow(Math.sin(Math.PI * u), pow || 0.7), p = _wtHaloAt(h, fc, lerp(a0, a1, u), r - w * k); ctx.lineTo(p[0], p[1]); }
  ctx.closePath();
}

Fighter.prototype.drawWitnessHalo = function (ctx, opt) {
  const s = this.scale, fc = this.facing, t = this.time || 0, flat = !!opt.color, look = WitnessBoss.lookOf(this), L = WT_L;
  const h = this.haloPos(), R = h.r, a0 = 0.6 * Math.PI, a1 = 1.78 * Math.PI, lw = 1.2 * s;
  ctx.save(); ctx.globalAlpha *= this.witFade(); ctx.lineJoin = 'miter'; ctx.miterLimit = 4;
  if (flat) { ctx.fillStyle = opt.color; ctx.beginPath(); _wtCrescent(ctx, h, fc, R, a0, a1, 9 * s); ctx.fill(); ctx.restore(); return; }
  // a crescent band: filled, cut into segments by dark gaps, the pale line round it
  const band = (r, b0, b1, w, fill, line, gaps, jump) => {
    ctx.beginPath(); _wtCrescent(ctx, h, fc, r, b0, b1, w); ctx.fillStyle = fill; ctx.fill();
    if (gaps) {
      ctx.save(); ctx.beginPath(); _wtCrescent(ctx, h, fc, r, b0, b1, w); ctx.clip();
      ctx.strokeStyle = '#05040c'; ctx.lineWidth = 1.6 * s; ctx.beginPath();
      for (let a = b0 + gaps * 0.5; a < b1; a += gaps) { const p = _wtHaloAt(h, fc, a, r + 2 * s), q = _wtHaloAt(h, fc, a, r - w - 2 * s); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
      ctx.stroke(); ctx.restore();
    }
    ctx.beginPath(); _wtCrescent(ctx, h, fc, r, b0, b1, w); ctx.strokeStyle = line; ctx.lineWidth = lw; ctx.stroke();
  };
  const arc = (r, b0, b1, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); for (let i = 0; i <= 32; i++) { const p = _wtHaloAt(h, fc, lerp(b0, b1, i / 32), r); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke(); };
  // an echo shard: a long diamond tilted off the radial, the phase's colour inside the pale line (white once lit)
  const shard = (c, a, tilt, len, wid, lit, inner) => {
    const b = a + fc * tilt, d = [fc * Math.cos(b), Math.sin(b)], n = [-d[1], d[0]], tw = -0.08;
    const q = [[c[0] - d[0] * len * 0.5, c[1] - d[1] * len * 0.5], [c[0] + n[0] * wid + d[0] * len * tw, c[1] + n[1] * wid + d[1] * len * tw],
      [c[0] + d[0] * len * 0.5, c[1] + d[1] * len * 0.5], [c[0] - n[0] * wid - d[0] * len * tw, c[1] - n[1] * wid - d[1] * len * tw]];
    if (lit) { ctx.strokeStyle = L.panel[1]; ctx.lineWidth = 4 * s; ctx.beginPath(); _poly(ctx, q); ctx.stroke(); }   // lit: a band of the phase's colour round the white shard
    ctx.fillStyle = lit ? '#f4f6ff' : L.panel[1]; ctx.beginPath(); _poly(ctx, q); ctx.fill();
    if (!lit) { ctx.fillStyle = L.panel[2]; ctx.beginPath(); _poly(ctx, [q[0], q[1], q[2], [lerp(c[0], q[1][0], 0.2), lerp(c[1], q[1][1], 0.2)]]); ctx.fill(); }   // the lit facet
    if (inner && !lit) { ctx.strokeStyle = L.line; ctx.lineWidth = 0.8 * s; ctx.beginPath(); _poly(ctx, q.map(p => [lerp(c[0], p[0], 0.45), lerp(c[1], p[1], 0.45)])); ctx.stroke(); }
    ctx.strokeStyle = lit ? '#ffffff' : L.line; ctx.lineWidth = lw; ctx.beginPath(); _poly(ctx, q); ctx.stroke();
  };
  // a black hole: its ring's far half, the black core edged in the phase's light, the ring's near half
  const hole = (x, y, r, ring, tilt) => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = wtGlow(ctx, x, y, r * 2.4, L.glow.join(','), 0.5, 2.2); ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, TAU); ctx.fill(); ctx.restore();
    ctx.strokeStyle = ring; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.ellipse(x, y, r * 2.1, r * 0.5, tilt, Math.PI, TAU); ctx.stroke();
    ctx.fillStyle = '#020006'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = L.vio[2]; ctx.lineWidth = 1.8 * s; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = ring; ctx.lineWidth = 1.8 * s; ctx.beginPath(); ctx.ellipse(x, y, r * 2.1, r * 0.5, tilt, 0, Math.PI); ctx.stroke();
  };
  // a rune banner: a tall plate in the phase's dark, gold edges, glyph strokes, a point at the foot
  const banner = (x, y, ht, wd) => {
    const w = wd * s, pts = [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + ht], [x, y + ht + 5 * s], [x - w / 2, y + ht]];
    ctx.fillStyle = L.panel[0]; ctx.beginPath(); _poly(ctx, pts); ctx.fill();
    ctx.strokeStyle = L.gold; ctx.lineWidth = lw; ctx.beginPath(); _poly(ctx, pts); ctx.stroke();
    ctx.strokeStyle = L.goldHi; ctx.lineWidth = 0.9 * s; ctx.beginPath();
    for (let i = 0; i < 4; i++) { const y0 = y + ht * (0.14 + i * 0.21); ctx.moveTo(x - w * 0.24, y0); ctx.lineTo(x + w * 0.24, y0); ctx.moveTo(x, y0 - 1.6 * s); ctx.lineTo(x, y0 + 3.6 * s); }
    ctx.stroke();
  };
  const O = this.wOrbit, shards = (n, k, inner) => {
    for (let i = 0; i < n; i++) {
      if (O && O.gone > i) continue;
      const S = this.haloShard(i);
      shard([S.x, S.y], S.a, S.tilt, S.len * k, S.wid * k, !!(O && O.lit > i), inner);
    }
  };
  const sway = Math.sin(t * 0.7) * 0.05 * (this.wHaloDir || 1);

  if (look === 0) {
    band(R, a0 + sway, a1 + sway, 15 * s, L.panel[1], L.line, 0.17);
    arc(R - 21 * s, a0 + 0.35, a1 - 0.3, L.line, 1.1 * s);
    arc(R + 5 * s, 0.86 * Math.PI, 1.32 * Math.PI, L.gold, 1.6 * s);
    shards(6, 1, false);
  } else if (look === 1) {
    const sl = Math.sin(t * 0.9) * 0.12 * (this.wHaloDir || 1);
    band(R, a0 + sl, a1 + sl, 11 * s, L.panel[1], L.line, 0.18);
    band(R * 0.82, a0 + 0.2 - sl * 1.6, a1 - 0.25 - sl * 1.6, 6 * s, L.panel[0], L.line, 0.12);
    band(R * 0.66, a0 + 0.45 + sl * 2.2, a1 - 0.5 + sl * 2.2, 4 * s, L.panel[1], L.line, 0.3);
    arc(R + 6 * s, 0.82 * Math.PI, 1.36 * Math.PI, L.gold, 1.7 * s);
    // the ringed orb inside the halo
    const o = _wtHaloAt(h, fc, 1.42 * Math.PI, R * 0.42), orr = 5.4 * s;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = wtGlow(ctx, o[0], o[1], orr * 3.4, L.glow.join(','), 0.6, 2); ctx.beginPath(); ctx.arc(o[0], o[1], orr * 3.4, 0, TAU); ctx.fill(); ctx.restore();
    ctx.strokeStyle = L.line; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.ellipse(o[0], o[1], orr * 2.5, orr * 0.62, -0.32 * fc, Math.PI, TAU); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(o[0], o[1], orr, 0, TAU); ctx.fill();
    ctx.strokeStyle = L.line; ctx.beginPath(); ctx.ellipse(o[0], o[1], orr * 2.5, orr * 0.62, -0.32 * fc, 0, Math.PI); ctx.stroke();
    shards(6, 1.2, true);
  } else if (look === 2) {
    // broken: the crescent in pieces, each one off its radius by a little, now and then by a lot
    // each piece is a slice of the one tapering crescent, pushed off it a little (now and then a lot) and turned
    const jump = (Math.floor(t * 3) % 5 === 0 ? 7 : 2.4) * s, n = 5, span = (a1 - a0) / n;
    for (let i = 0; i < n; i++) {
      const b0 = a0 + i * span + 0.035, b1 = b0 + span - 0.07, dr = (_hash(i * 7.1 + Math.floor(t * 5)) - 0.5) * jump, da = (_hash(i * 3.7 + Math.floor(t * 5)) - 0.5) * 0.04 * jump / s;
      ctx.beginPath();
      const N = 14;
      for (let k = 0; k <= N; k++) { const a = lerp(b0, b1, k / N), p = _wtHaloAt(h, fc, a + da, R + dr); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      for (let k = N; k >= 0; k--) { const a = lerp(b0, b1, k / N), w = 15 * s * Math.pow(Math.sin(Math.PI * (a - a0) / (a1 - a0)), 0.7), p = _wtHaloAt(h, fc, a + da, R + dr - w); ctx.lineTo(p[0], p[1]); }
      ctx.closePath();
      ctx.fillStyle = i === 1 || i === 3 ? L.gold : L.panel[1]; ctx.fill(); ctx.strokeStyle = L.line; ctx.lineWidth = lw; ctx.stroke();
    }
    arc(R - 17 * s, a0 + 0.4, a1 - 0.35, L.line, 1 * s);
    const c = _wtHaloAt(h, fc, 1.4 * Math.PI, R * 0.36);
    hole(c[0], c[1], 9 * s, L.vio[2], -0.22 * fc);
    for (const [a, ht] of [[1.06, 30], [1.26, 40], [1.46, 30]]) { const p = _wtHaloAt(h, fc, a * Math.PI, R + 10 * s); banner(p[0], p[1] - ht * s * 0.8, ht * s, 7.4); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) { const q = _hash(i * 3.3 + Math.floor(t * 6)), p = _wtHaloAt(h, fc, lerp(a0, a1, q), R * (1.04 + _hash(i * 1.7) * 0.22)); ctx.fillStyle = i % 2 ? L.panel[2] : L.flame[1]; ctx.fillRect(p[0], p[1], (3 + 5 * _hash(i * 9.1)) * s, 2.2 * s); }
    ctx.restore();
    shards(6, 1.05, true);
  } else {
    // the True Witness: gold blades out of a thick gold crescent, a violet crescent inside, the banners, the great hole
    const rot = Math.sin(t * 0.5) * 0.04;
    // the blades: a few, standing out of its top like a crown, the middle one tallest
    for (let i = 0; i < 7; i++) {
      const a = lerp(1.08 * Math.PI, 1.74 * Math.PI, i / 6) + rot, long = i === 3 ? 2.1 : i === 2 || i === 4 ? 1.4 : 0.9, base = R + 2 * s, tip = R + 24 * s * long;
      const d = [fc * Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], w = (i === 3 ? 5.4 : 4) * s, c = _wtHaloAt(h, fc, a, 0);
      const pts = [[c[0] + d[0] * base + n[0] * w, c[1] + d[1] * base + n[1] * w], [c[0] + d[0] * tip, c[1] + d[1] * tip], [c[0] + d[0] * base - n[0] * w, c[1] + d[1] * base - n[1] * w]];
      ctx.fillStyle = L.gold; ctx.beginPath(); _poly(ctx, pts); ctx.fill(); ctx.strokeStyle = L.goldHi; ctx.lineWidth = 1 * s; ctx.stroke();
    }
    band(R, a0 + rot, a1 + rot, 12 * s, L.gold, L.goldHi, 0.24);
    band(R * 0.8, a0 + 0.3 - rot, a1 - 0.3 - rot, 6 * s, L.panel[1], L.line, 0.16);
    for (const a of [1.12, 1.5]) { const p = _wtHaloAt(h, fc, a * Math.PI, R + 4 * s); banner(p[0], p[1] - 40 * s, 52 * s, 8.4); }
    const c = _wtHaloAt(h, fc, 1.3 * Math.PI, R * 0.3);
    hole(c[0], c[1], 13 * s, L.gold, -0.2 * fc);
    shards(6, 0.8, false);
  }
  ctx.restore();
};
