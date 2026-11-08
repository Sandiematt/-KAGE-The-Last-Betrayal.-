/* ---- Kage's coat skirt: one full piece of cloth wrapped round the hips and both legs ----
   The two cloth chains (back panel, front flap: _shared/skins.js) only drive the motion. The skirt is the envelope from
   the furthest-back of their edges to the furthest-forward, so it reads as one garment, not panels with legs between.
   Back to front: the black skirt (pleated waist, folds, crimson-lined edges, flames rising from a torn flame-tipped hem,
   cloud embroidery in the fire); the side tasset with the silver Kage diamond; the front apron with crimson edges and
   its own flame hem; the crimson strap with its silver buckle; the knot and tassel at the leading hip. */

const _skBL = new Float32Array(32), _skBR = new Float32Array(32), _skFL = new Float32Array(32), _skFR = new Float32Array(32);
const SK_ROWS = 12;
const _skRear = new Float32Array((SK_ROWS + 1) * 2), _skFront = new Float32Array((SK_ROWS + 1) * 2);

// a point down a cloth edge buffer at u in [0, 1] (rows interpolated; u past 1 extrapolates the last segment)
function _skAt(E, n, u) {
  const r = u * (n - 1), i0 = clamp(Math.floor(r), 0, n - 2), k = r - i0;
  return [lerp(E[i0 * 2], E[i0 * 2 + 2], k), lerp(E[i0 * 2 + 1], E[i0 * 2 + 3], k)];
}

// the torn hem across the skirt: [t across (0 rear, 1 front; outside that a flared tip), depth below the hem in U]
const SK_HEM = [[-0.18, -3], [0.03, 3.5], [0.09, -1.5], [0.15, 6.5], [0.22, 0], [0.29, 4.5], [0.36, -2], [0.44, 7.5],
  [0.51, 0.5], [0.58, 5], [0.65, -2], [0.72, 6], [0.8, 0], [0.87, 4], [0.94, -1], [1.12, -2]];
// flame tongues rising from the hem: [t, u of the tip, half width in t, lean]
const SK_FLAMES = [[0.08, 0.62, 0.12, -1], [0.3, 0.5, 0.14, 1], [0.52, 0.6, 0.12, -1], [0.74, 0.48, 0.14, 1], [0.94, 0.66, 0.1, -1]];
const SK_PLEAT_U = 0.3;   // how far down the skirt the pleated waist reaches (u)
const SK_SILVER = '#d4d8e2';

// the 4-pointed Kage diamond: a silver star outline round a crimson core
function kageEmblem(g, cx, cy, rad, rot, line, core, U) {
  g.save(); g.translate(cx, cy); g.rotate(rot);
  g.strokeStyle = line; g.lineWidth = 0.85 * U; g.lineJoin = 'miter';
  g.beginPath();
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2, ma = a + Math.PI / 4, ro = (k % 2 ? 0.95 : 1.15) * rad, ri = 0.28 * rad;
    k ? g.lineTo(Math.cos(a) * ro, Math.sin(a) * ro) : g.moveTo(Math.cos(a) * ro, Math.sin(a) * ro);
    g.lineTo(Math.cos(ma) * ri, Math.sin(ma) * ri);
  }
  g.closePath(); g.stroke();
  g.fillStyle = core; g.beginPath(); g.arc(0, 0, 0.2 * rad, 0, TAU); g.fill();
  g.restore();
}

// one curling flame tongue from (bx0..bx1 at the base) up to the tip, filled
function _skFlame(g, P, t, uTip, w, lean) {
  const [b0x, b0y] = P(t - w, 1.08), [b1x, b1y] = P(t + w, 1.08), [tx, ty] = P(t + lean * w * 0.6, uTip);
  const [c0x, c0y] = P(t - w * 1.9 * lean, (uTip + 1) / 2 + 0.04), [c1x, c1y] = P(t + w * 0.9 * lean, (uTip + 1) / 2 + 0.12);
  g.beginPath(); g.moveTo(b0x, b0y);
  g.quadraticCurveTo(lean > 0 ? c1x : c0x, lean > 0 ? c1y : c0y, tx, ty);
  g.quadraticCurveTo(lean > 0 ? c0x : c1x, lean > 0 ? c0y : c1y, b1x, b1y);
  g.closePath(); g.fill();
}

Fighter.prototype.drawKageSkirt = function (ctx, A, skin, U) {
  const cb = this.cloths.find(c => c.kind === 'coat' && c.part === 'back');
  const cf = this.cloths.find(c => c.kind === 'coat' && c.part === 'flap');
  if (!cb || !cf || !cb.c.init || !cf.c.init) return;
  const co = skin.coat, pal = A.pal, f = this.facing, floorY = this.y + 2 * A.s;
  const nb = coatEdges(cb, co.w0 * U, co.w1 * U, floorY); _skBL.set(_cpL); _skBR.set(_cpR);
  const nf = coatEdges(cf, co.fw0 * U, co.fw1 * U, floorY); _skFL.set(_cpL); _skFR.set(_cpR);
  const fc = (col) => (A.flat ? A.col : col);
  const acc = pal.acc, hi = pal.accHi || pal.acc, rgb = (_hexRGB(acc) || [140, 26, 32]).join(','), hiRgb = (_hexRGB(hi) || [196, 49, 58]).join(',');

  // the envelope, row by row: rear = the furthest-back of the four cloth edges, front = the furthest-forward; then
  // widened to cover the legs, so a knee or shin stepping out in a wide stance stays under the cloth (by at most
  // SK_LEG_MAX, so a leg kicked out level does not drag the skirt with it)
  const sk = this.sk, legs = [[sk.hipF, sk.fkn, sk.fft], [sk.hipB, sk.bkn, sk.bft]], legW = 6.5 * U, legMax = 20 * U;
  for (let r = 0; r <= SK_ROWS; r++) {
    const u = r / SK_ROWS;
    const pts = [_skAt(_skBL, nb, u), _skAt(_skBR, nb, u), _skAt(_skFL, nf, u), _skAt(_skFR, nf, u)];
    let rear = pts[0], front = pts[0];
    for (const p of pts) { if (p[0] * f < rear[0] * f) rear = p; if (p[0] * f > front[0] * f) front = p; }
    let rx = rear[0] * f, fx = front[0] * f;
    if (u > 0.12) {
      const y = (rear[1] + front[1]) / 2;
      for (const L of legs) for (let i = 0; i < 2; i++) {
        const a = L[i], b = L[i + 1];
        if (!a || !b || (y - a.y) * (y - b.y) > 0 || a.y === b.y) continue;
        const x = lerp(a.x, b.x, (y - a.y) / (b.y - a.y)) * f;
        fx = Math.max(fx, Math.min(x + legW, front[0] * f + legMax));
        rx = Math.min(rx, Math.max(x - legW, rear[0] * f - legMax));
      }
    }
    _skRear[r * 2] = rx * f; _skRear[r * 2 + 1] = rear[1]; _skFront[r * 2] = fx * f; _skFront[r * 2 + 1] = front[1];
  }
  const P = (t, u) => { const a = _skAt(_skRear, SK_ROWS + 1, u), b = _skAt(_skFront, SK_ROWS + 1, u); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; };
  const [m0x, m0y] = P(0.5, 0.85), [m1x, m1y] = P(0.5, 1), dl = Math.hypot(m1x - m0x, m1y - m0y) || 1;
  const dnx = (m1x - m0x) / dl, dny = (m1y - m0y) / dl;
  const H = (t, d) => { const [x, y] = P(t, t < 0 || t > 1 ? 0.97 : 1); return [x + dnx * d * U, Math.min(y + dny * d * U, floorY + 1.5 * U)]; };

  const skirtPath = () => {
    ctx.moveTo(...P(0, 0));
    for (let r = 1; r <= SK_ROWS - 1; r++) ctx.lineTo(...P(0, r / SK_ROWS));
    for (const [t, d] of SK_HEM) ctx.lineTo(...H(t, d));
    for (let r = SK_ROWS - 1; r >= 0; r--) ctx.lineTo(...P(1, r / SK_ROWS));
    ctx.closePath();
  };

  // --- 1. the skirt
  celFill(ctx, skirtPath, pal.coat, A, {
    sd: 5 * U, hd: 0.8 * U, rim: true,
    detail: (g) => {
      const uP = SK_PLEAT_U;
      // long folds down the cloth below the pleats
      for (const t of [0.14, 0.33, 0.52, 0.7, 0.86]) {
        animeFold(g, A, pal.coat, () => { g.moveTo(...P(t, uP + 0.04)); g.quadraticCurveTo(...P(t + 0.03, 0.6), ...P(t - 0.02, 0.95)); });
      }
      // the ember glow rising from the hem
      const [gx0, gy0] = P(0.5, 0.58), [gx1, gy1] = H(0.5, 4);
      const grad = g.createLinearGradient(gx0, gy0, gx1, gy1);
      grad.addColorStop(0, `rgba(${rgb},0)`); grad.addColorStop(0.45, `rgba(${rgb},0.35)`);
      grad.addColorStop(0.8, `rgba(${rgb},0.85)`); grad.addColorStop(1, `rgba(${hiRgb},1)`);
      g.fillStyle = grad; g.fillRect(-1e5, -1e5, 2e5, 2e5);
      // flames: a crimson tongue, a bright one inside it, a hot core
      for (const [t, ut, w, ln] of SK_FLAMES) {
        g.fillStyle = acc; _skFlame(g, P, t, ut, w, ln);
        g.fillStyle = hi; _skFlame(g, P, t + ln * 0.01, ut + 0.13, w * 0.6, ln);
        g.fillStyle = 'rgba(255,112,84,0.85)'; _skFlame(g, P, t + ln * 0.015, ut + 0.25, w * 0.3, ln);
      }
      // dark cloud embroidery stitched through the fire
      const [rx0, ry0] = P(0, 1), [rx1, ry1] = P(1, 1), rot = Math.atan2(ry1 - ry0, rx1 - rx0);
      for (const [t, u, R] of [[0.24, 0.8, 3.4], [0.56, 0.86, 2.8], [0.8, 0.79, 3.1]]) {
        const [x, y] = P(t, u); cloudMotif(g, x, y, R * U, rot + (t > 0.5 ? 0.3 : -0.25), '#2a0709', 1.1 * U);
      }
      // a bright crimson line just inside the torn hem
      g.strokeStyle = hi; g.lineWidth = 1.2 * U; g.lineJoin = 'miter'; g.beginPath();
      SK_HEM.forEach(([t, d], i) => { const p = H(t, d - 1.1); i ? g.lineTo(...p) : g.moveTo(...p); });
      g.stroke();
      // crimson lining showing along both outer edges
      g.strokeStyle = acc; g.lineWidth = 2.2 * U;
      for (const t of [0, 1]) {
        g.beginPath();
        for (let r = 3; r <= SK_ROWS; r++) { const p = P(t, r / SK_ROWS); r === 3 ? g.moveTo(...p) : g.lineTo(...p); }
        g.stroke();
      }
    }
  });

  // --- 2. the side tasset at the rear hip: dark plate of cloth, a long swept flame tip, the silver Kage diamond
  const tasset = () => {
    ctx.moveTo(...P(-0.08, SK_PLEAT_U)); ctx.lineTo(...P(0.3, SK_PLEAT_U + 0.02));
    ctx.quadraticCurveTo(...P(0.33, 0.45), ...P(0.29, 0.72));
    ctx.quadraticCurveTo(...P(0.1, 0.86), ...P(-0.24, 0.94));
    ctx.quadraticCurveTo(...P(-0.06, 0.78), ...P(-0.05, 0.5));
    ctx.closePath();
  };
  celFill(ctx, tasset, pal.coatB, A, {
    sd: 3 * U, hd: 0.7 * U,
    detail: (g) => {
      const [ax, ay] = P(0.12, 0.55), [bx, by] = P(-0.22, 0.92), grad = g.createLinearGradient(ax, ay, bx, by);
      grad.addColorStop(0, `rgba(${rgb},0)`); grad.addColorStop(0.35, `rgba(${rgb},0.25)`); grad.addColorStop(0.75, `rgba(${rgb},0.8)`); grad.addColorStop(1, `rgba(${hiRgb},1)`);
      g.fillStyle = grad; g.fillRect(-1e5, -1e5, 2e5, 2e5);
      g.fillStyle = acc; _skFlame(g, P, 0.06, 0.66, 0.11, 1);
      g.fillStyle = hi; _skFlame(g, P, 0.07, 0.76, 0.06, 1);
      g.strokeStyle = hi; g.lineWidth = 1.6 * U; g.beginPath(); tasset(); g.stroke();
      g.strokeStyle = acc; g.lineWidth = 0.7 * U; g.beginPath();
      g.moveTo(...P(0.24, SK_PLEAT_U + 0.02)); g.quadraticCurveTo(...P(0.26, 0.5), ...P(0.23, 0.68)); g.stroke();
      const [ex, ey] = P(0.13, 0.46), [qx, qy] = P(0.13, 0.66);
      kageEmblem(g, ex, ey, 3.3 * U, Math.atan2(qy - ey, qx - ex) - Math.PI / 2 + Math.PI / 4, '#d8dce6', acc, U);
    }
  });

  // --- 2b. the pleated waist: a fan of knife pleats from the belt flaring out over the rear hip (over the tasset's top,
  // clear of the apron); each pleat lit on its leading face and dark on its turned face, crimson piping on the seams
  const PL = 7, uP = SK_PLEAT_U + 0.06;
  const PB = (t, v) => {   // t across the fan (0 rear, 1 toward the apron), v down it (0 belt, 1 foot)
    const [ax, ay] = P(lerp(-0.02, 0.5, t), 0.01), [bx, by] = P(lerp(-0.16, 0.56, t), uP);
    return [lerp(ax, bx, v), lerp(ay, by, v)];
  };
  const band = () => {
    ctx.moveTo(...PB(0, 0)); ctx.lineTo(...PB(1, 0));
    for (let i = PL; i > 0; i--) { ctx.lineTo(...PB(i / PL, 1)); ctx.lineTo(...PB((i - 0.5) / PL, 1.1)); }
    ctx.lineTo(...PB(0, 1)); ctx.closePath();
  };
  celFill(ctx, band, pal.coat, A, {
    sd: 2.5 * U, hd: 0, rim: true,
    detail: (g) => {
      for (let i = 0; i < PL; i++) {
        const t0 = i / PL, t1 = (i + 1) / PL, tm = (t0 + t1) / 2;
        g.fillStyle = "#050405";   // the turned face
        g.beginPath(); g.moveTo(...PB(tm, 0)); g.lineTo(...PB(t1, 0)); g.lineTo(...PB(t1, 1)); g.lineTo(...PB(tm, 1.1)); g.closePath(); g.fill();
        g.fillStyle = "#3a3540";   // the lit fold along the leading edge
        g.beginPath(); g.moveTo(...PB(t0, 0)); g.lineTo(...PB(lerp(t0, t1, 0.22), 0)); g.lineTo(...PB(lerp(t0, t1, 0.3), 1.04)); g.lineTo(...PB(t0, 1)); g.closePath(); g.fill();
        g.strokeStyle = i % 2 ? hi : acc; g.lineWidth = (i % 2 ? 1 : 0.7) * U; g.lineCap = "round";
        g.beginPath(); g.moveTo(...PB(t1, 0.05)); g.lineTo(...PB(t1, 1)); g.stroke();
      }
      // crimson piping along the pleats' pointed foot, and a stitched band under the belt
      g.strokeStyle = acc; g.lineWidth = 1.1 * U; g.lineJoin = "miter"; g.beginPath(); g.moveTo(...PB(0, 0.97));
      for (let i = 1; i <= PL; i++) { g.lineTo(...PB((i - 0.5) / PL, 1.07)); g.lineTo(...PB(i / PL, 0.97)); }
      g.stroke();
      g.lineWidth = 1.4 * U; g.beginPath(); g.moveTo(...PB(0, 0.1)); g.lineTo(...PB(1, 0.1)); g.stroke();
    }
  });

  // --- 3. the front apron on the flap chain: black, crimson-edged, its own flame hem
  const AP = (t, u) => { const a = _skAt(_skFL, nf, u), b = _skAt(_skFR, nf, u); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; };
  const [a0x, a0y] = AP(0.5, 0.85), [a1x, a1y] = AP(0.5, 1), al = Math.hypot(a1x - a0x, a1y - a0y) || 1;
  const AH = (t, d) => { const [x, y] = AP(t, 1); return [x + (a1x - a0x) / al * d * U, Math.min(y + (a1y - a0y) / al * d * U, floorY + 1.5 * U)]; };
  const APH = [[0, 0], [0.2, 5.5], [0.36, 0.5], [0.5, -2.5], [0.66, 1], [0.82, 4.5], [1, -0.5]];
  const apron = () => {
    ctx.moveTo(...AP(0, 0));
    for (let r = 1; r <= 8; r++) ctx.lineTo(...AP(0, r / 9));
    for (const [t, d] of APH) ctx.lineTo(...AH(t, d));
    for (let r = 8; r >= 0; r--) ctx.lineTo(...AP(1, r / 9));
    ctx.closePath();
  };
  celFill(ctx, apron, pal.coat, A, {
    sd: 3.5 * U, hd: 1 * U, rim: true,
    detail: (g) => {
      animeFold(g, A, pal.coat, () => { g.moveTo(...AP(0.62, 0.2)); g.quadraticCurveTo(...AP(0.66, 0.55), ...AP(0.6, 0.92)); });
      const [gx0, gy0] = AP(0.5, 0.6), [gx1, gy1] = AH(0.5, 4), grad = g.createLinearGradient(gx0, gy0, gx1, gy1);
      grad.addColorStop(0, `rgba(${rgb},0)`); grad.addColorStop(0.6, `rgba(${rgb},0.75)`); grad.addColorStop(1, `rgba(${hiRgb},1)`);
      g.fillStyle = grad; g.fillRect(-1e5, -1e5, 2e5, 2e5);
      for (const [t, ut, w, ln] of [[0.25, 0.7, 0.12, 1], [0.7, 0.66, 0.13, -1]]) {
        g.fillStyle = acc; _skFlame(g, AP, t, ut, w, ln);
        g.fillStyle = hi; _skFlame(g, AP, t + ln * 0.02, ut + 0.12, w * 0.55, ln);
      }
      const [cx, cy] = AP(0.5, 0.86), [dx, dy] = AP(1, 0.86);
      cloudMotif(g, cx, cy, 2.6 * U, Math.atan2(dy - cy, dx - cx), '#2a0709', 1 * U);
      // crimson borders down both long edges, with a fine bright line inside each
      for (const [t, w, col] of [[0, 2.6, acc], [1, 2.6, acc], [0.09, 0.7, hi], [0.91, 0.7, hi]]) {
        g.strokeStyle = col; g.lineWidth = w * U; g.beginPath();
        for (let r = 0; r <= 9; r++) { const p = AP(t, r / 9); r ? g.lineTo(...p) : g.moveTo(...p); }
        g.stroke();
      }
      g.strokeStyle = hi; g.lineWidth = 1 * U; g.beginPath();
      APH.forEach(([t, d], i) => { const p = AH(t, d - 1); i ? g.lineTo(...p) : g.moveTo(...p); });
      g.stroke();
    }
  });

  ctx.save();
  ctx.lineCap = 'butt';
  // --- 4. the crimson strap down the apron, ending in a silver buckle
  const [sx0, sy0] = AP(0.4, 0), [sx1, sy1] = AP(0.36, 0.6), sAng = Math.atan2(sy1 - sy0, sx1 - sx0);
  for (const [w, col] of [[3.4, ANIME.outline], [2.2, acc]]) {
    ctx.strokeStyle = fc(col); ctx.lineWidth = w * U; ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.lineTo(sx1, sy1); ctx.stroke();
  }
  ctx.save(); ctx.translate(sx1, sy1); ctx.rotate(sAng - Math.PI / 2);
  const bw = 3.2 * U, bh = 2.6 * U;
  ctx.fillStyle = fc('#18181c'); ctx.strokeStyle = fc(SK_SILVER); ctx.lineWidth = 0.9 * U;
  ctx.beginPath(); ctx.rect(-bw / 2, -bh / 2, bw, bh); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -bh / 2); ctx.lineTo(0, bh * 0.2); ctx.stroke();
  // the strap's tail hanging below the buckle
  ctx.fillStyle = fc(acc); ctx.fillRect(-1 * U, bh / 2, 2 * U, 3.2 * U);
  ctx.restore();

  // --- 5. the knot and tassel at the leading hip
  const [kx0, ky0] = AP(1, 0), [kx1, ky1] = AP(1, 0.16), kx = kx1 + f * 2.2 * U, ky = ky1 + 1.5 * U;
  ctx.strokeStyle = fc(acc); ctx.lineWidth = 0.9 * U; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(kx0, ky0); ctx.quadraticCurveTo(kx, ky0 + 1.5 * U, kx, ky); ctx.stroke();
  kageEmblem(ctx, kx, ky, 2.1 * U, 0, fc(hi), fc(SK_SILVER), U);
  ctx.strokeStyle = fc(acc); ctx.lineWidth = 0.75 * U;
  const ty = ky + 7 * U;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(kx, ky + 1.6 * U);
    ctx.quadraticCurveTo(kx + i * 0.45 * U, (ky + ty) / 2, kx + f * 1.2 * U + i * 0.7 * U, ty); ctx.stroke();
  }
  ctx.fillStyle = fc(SK_SILVER); ctx.beginPath(); ctx.arc(kx, ky + 1.6 * U, 0.9 * U, 0, TAU); ctx.fill();
  ctx.restore();
};
