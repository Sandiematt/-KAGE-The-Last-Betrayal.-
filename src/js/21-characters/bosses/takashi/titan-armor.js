/* ---- the Yashiro Titan's armour (phase II of his fight, 66-takashi.js): golden spectral armour that forms ON his
   body as he grows. Dark lacquered plates with blazing gold edges, following his skeleton like his own clothes:
   a breastplate with the family tomoe, hanging tassets, great layered shoulder guards, bracers, greaves with knee
   caps, and crescent horns and a sun crest rising from his kasa. f.tkArmor (0..1) is how far it has formed; the
   edges flicker like flame. Drawn from takashiLayer ('front': body, far limbs; 'over': near limbs and the horns),
   never on the flat passes (impact frame, afterimages). ---- */

// one plate: dark fill, a wide additive glow under a bright gold edge
function _tkaPlate(ctx, k, s, path, fillA) {
  ctx.beginPath(); path();
  ctx.fillStyle = `rgba(22,14,4,${(fillA == null ? 0.9 : fillA) * k})`; ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgba(255,150,30,${0.32 * k})`; ctx.lineWidth = 5.2 * s; ctx.stroke();
  ctx.strokeStyle = `rgba(255,226,140,${0.95 * k})`; ctx.lineWidth = 1.5 * s; ctx.stroke();
  ctx.restore();
}
// thin inner gold lines (lames, lacing), additive
function _tkaLines(ctx, k, s, path, a) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath(); path();
  ctx.strokeStyle = `rgba(255,200,90,${(a || 0.6) * k})`; ctx.lineWidth = 1.1 * s; ctx.stroke();
  ctx.restore();
}
// a quad along a limb from a to b: from u0 to u1 of its length, w0 / w1 half-widths
function _tkaLimbQuad(ctx, a, b, u0, u1, w0, w1) {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const x0 = a.x + dx * u0, y0 = a.y + dy * u0, x1 = a.x + dx * u1, y1 = a.y + dy * u1;
  ctx.moveTo(x0 + nx * w0, y0 + ny * w0); ctx.lineTo(x1 + nx * w1, y1 + ny * w1); ctx.lineTo(x1 - nx * w1, y1 - ny * w1); ctx.lineTo(x0 - nx * w0, y0 - ny * w0); ctx.closePath();
}
function _tkaBands(ctx, a, b, u0, u1, w0, w1, n) {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  for (let i = 1; i < n; i++) {
    const q = lerp(u0, u1, i / n), w = lerp(w0, w1, i / n), x = a.x + dx * q, y = a.y + dy * q;
    ctx.moveTo(x + nx * w, y + ny * w); ctx.lineTo(x - nx * w, y - ny * w);
  }
}
// spine-frame polygon from [u, w-units] points
function _tkaSpine(ctx, S, U, pts) { pts.forEach(([u, w], i) => (i ? ctx.lineTo(spX(S, u, w * U), spY(S, u, w * U)) : ctx.moveTo(spX(S, u, w * U), spY(S, u, w * U)))); ctx.closePath(); }

function takashiTitanArmor(f, ctx, A, U, layer) {
  const k = clamp(f.tkArmor || 0, 0, 1);
  if (k <= 0.02 || A.flat) return;
  const sk = f.sk, S = A.S, s = f.scale / 1.342, fl = 0.85 + 0.15 * Math.sin(f.time * 11 + (layer === 'over' ? 2 : 0));
  const ka = k * fl;
  // the shoulder guard: five lames hanging from the shoulder, swinging half-way with the upper arm
  const sode = (sh, el) => {
    const ax = el.x - sh.x, ay = el.y - sh.y, L = Math.hypot(ax, ay) || 1;
    const dx = (ax / L) * 0.5, dy = (ay / L) * 0.5 + 0.5, D = Math.hypot(dx, dy) || 1, ux = dx / D, uy = dy / D, nx = -uy, ny = ux;
    const len = 30 * U, w = 13 * U, x0 = sh.x - ux * 5 * U, y0 = sh.y - uy * 5 * U;
    for (let j = 0; j < 5; j++) {
      const q0 = j / 5, q1 = (j + 1) / 5 + 0.04, ww = w * (1 + j * 0.07);
      _tkaPlate(ctx, ka, s, () => {
        ctx.moveTo(x0 + ux * len * q0 + nx * ww, y0 + uy * len * q0 + ny * ww); ctx.lineTo(x0 + ux * len * q1 + nx * ww * 1.04, y0 + uy * len * q1 + ny * ww * 1.04);
        ctx.lineTo(x0 + ux * len * q1 - nx * ww * 1.04, y0 + uy * len * q1 - ny * ww * 1.04); ctx.lineTo(x0 + ux * len * q0 - nx * ww, y0 + uy * len * q0 - ny * ww); ctx.closePath();
      }, 0.92);
    }
    _tkaLines(ctx, ka, s, () => { for (let j = 0; j < 5; j++) for (let d = -0.6; d <= 0.6; d += 0.4) { const q = (j + 0.5) / 5, x = x0 + ux * len * q + nx * w * d, y = y0 + uy * len * q + ny * w * d; ctx.moveTo(x, y); ctx.lineTo(x + ux * 2 * U, y + uy * 2 * U); } }, 0.75);
  };
  const kote = (el, ha) => {   // the bracer, and a plate over the back of the hand
    _tkaPlate(ctx, ka, s, () => _tkaLimbQuad(ctx, el, ha, 0.08, 0.86, 6.2 * U, 5.2 * U));
    _tkaLines(ctx, ka, s, () => _tkaBands(ctx, el, ha, 0.08, 0.86, 6.2 * U, 5.2 * U, 4));
  };
  const sune = (kn, ft) => {   // the greave and a round knee cap
    _tkaPlate(ctx, ka, s, () => _tkaLimbQuad(ctx, kn, ft, 0.12, 0.84, 7.4 * U, 5.6 * U));
    _tkaLines(ctx, ka, s, () => _tkaBands(ctx, kn, ft, 0.12, 0.84, 7.4 * U, 5.6 * U, 3));
    _tkaPlate(ctx, ka, s, () => ctx.arc(kn.x, kn.y, 6.4 * U, 0, TAU));
  };
  if (layer === 'body') {
    // far limbs first, so the breastplate covers where they meet the body
    sode(sk.shB, sk.bel); kote(sk.bel, sk.bha); sune(sk.bkn, sk.bft);
    // the tassets: three plates of three lames hanging below the waist
    for (const [w0, w1] of [[-15, -5], [-6, 6], [5, 16]]) for (let j = 0; j < 3; j++) {
      const u0 = 0.1 - j * 0.14, u1 = u0 - 0.17;
      _tkaPlate(ctx, ka, s, () => _tkaSpine(ctx, S, U, [[u0, w0], [u0, w1], [u1, w1 + 1.2], [u1, w0 - 1.2]]), 0.9);
    }
    // the breastplate (do): broad at the chest, lames across the belly, the tomoe crest
    _tkaPlate(ctx, ka, s, () => _tkaSpine(ctx, S, U, [[0.12, 13.4], [0.46, 12.8], [0.8, 15.4], [0.96, 12.4], [0.96, -13.4], [0.8, -15.8], [0.46, -13.4], [0.12, -14.2]]), 0.93);
    _tkaLines(ctx, ka, s, () => { for (const u of [0.2, 0.3, 0.4]) { ctx.moveTo(spX(S, u, 13 * U), spY(S, u, 13 * U)); ctx.lineTo(spX(S, u, -13.8 * U), spY(S, u, -13.8 * U)); } });
    const cx = spX(S, 0.68, 2 * U), cy = spY(S, 0.68, 2 * U), r = 5.6 * U;
    _tkaPlate(ctx, ka, s, () => ctx.arc(cx, cy, r, 0, TAU), 0.95);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,232,160,${0.95 * ka})`;
    for (let i = 0; i < 3; i++) {
      const a = f.time * 1.2 + i * TAU / 3, hx = cx + Math.cos(a) * r * 0.42, hy = cy + Math.sin(a) * r * 0.42;
      ctx.beginPath(); ctx.arc(hx, hy, r * 0.24, 0, TAU);
      ctx.moveTo(hx + Math.cos(a + 1.6) * r * 0.24, hy + Math.sin(a + 1.6) * r * 0.24);
      ctx.quadraticCurveTo(cx + Math.cos(a + 1.3) * r * 0.85, cy + Math.sin(a + 1.3) * r * 0.85, cx + Math.cos(a + 2.2) * r * 0.75, cy + Math.sin(a + 2.2) * r * 0.75);
      ctx.fill();
    }
    ctx.restore();
    sune(sk.fkn, sk.fft);
  } else if (layer === 'over') {
    sode(sk.shF, sk.fel); kote(sk.fel, sk.fha);
    // the horns and the sun crest rising from the kasa (head units, turned with the head)
    const hr = BODY.head * f.scale * f.build.head;
    ctx.save(); ctx.translate(sk.head.x, sk.head.y); ctx.rotate(f.headRot || 0); ctx.scale(f.facing, 1);
    for (const [bx, tx, ty, back] of [[0.25, 1.35, -3.2, 0], [-0.15, -1.1, -3.0, 1]]) {
      _tkaPlate(ctx, ka * (back ? 0.75 : 1), s, () => {
        ctx.moveTo(bx * hr - 0.18 * hr, -1.5 * hr);
        ctx.quadraticCurveTo((bx + tx) * 0.5 * hr - 0.5 * hr * Math.sign(tx), -2.1 * hr, tx * hr, ty * hr);
        ctx.quadraticCurveTo((bx + tx) * 0.5 * hr + 0.1 * hr * Math.sign(tx), -1.9 * hr, bx * hr + 0.2 * hr, -1.48 * hr); ctx.closePath();
      }, 0.85);
    }
    _tkaPlate(ctx, ka, s, () => ctx.arc(0.18 * hr, -1.72 * hr, 0.3 * hr, 0, TAU), 0.9);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,240,190,${0.9 * ka})`; ctx.beginPath(); ctx.arc(0.18 * hr, -1.72 * hr, 0.14 * hr, 0, TAU); ctx.fill(); ctx.restore();
    // the kasa's brim and cone lit gold along their edges
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round';
    ctx.beginPath(); orderShape(ctx, hr * 1.2, TK_HAT);
    ctx.strokeStyle = `rgba(255,150,30,${0.35 * ka})`; ctx.lineWidth = 5 * s; ctx.stroke();
    ctx.strokeStyle = `rgba(255,226,140,${0.9 * ka})`; ctx.lineWidth = 1.4 * s; ctx.stroke();
    ctx.restore();
    ctx.restore();
  }
}
