/* ---- the Witness's own body (rebuilt from scratch on 2026-11-09 from the user's four phase sheets) ----
   witnessBody draws the whole figure on its skeleton (Fighter.sk) in place of the shared anime rig: the shared
   silhouette hands the Witness over here (except on a Kage-flicker frame, which is Kage's own body). No shared torso,
   sleeve, hakama, boot, hand or head part is used. Every part is a flat near-black shape inside a pale line (WT_L.line),
   with colour only where the sheets put it. Back to front:
     1 the back      the flame curls, the back coat tails, the mantle flaring off the shoulders, the saya
     2 the far arm and its claw, 3 the far leg
     4 the torso     the coat, its gold-lined opening, the standing collar behind the head
     5 the front coat flap over the far thigh, 6 the near leg
     7 the waist     the belt, its plaques, the chains, the pendant and its tassel, the katana's hilt
     8 the head      crown, face, star eye (head.js)
     9 the near arm  the great sleeve; the chest core; the greatsword; the claw over its grip
   The flat passes (the outline stamp, flash, impact frames, glitch ghosts, afterimages) draw every part, its line
   included, in the one colour, so the silhouette is the same shape with or without the art. Drawing only. */
const _wtW = { f: null, A: null, S: null, s: 1, fc: 1, t: 0, lw: 1, lwFar: 1, hr: 1, fade: 1 };

function witnessBody(f, ctx, front, flat, opt) {
  const sk = f.sk, s = f.scale, fc = f.facing, A = animeState(f, front, flat, opt), S = animeSpine(f);
  A.S = S; A.U = s;
  const W = _wtW;
  W.f = f; W.A = A; W.S = S; W.s = s; W.fc = fc; W.t = f.time || 0;
  W.lw = 1.25 * s; W.lwFar = 1 * s; W.hr = BODY.head * s * f.build.head; W.fade = f.witFade();
  f.headRot = f._ghostHead != null ? f._ghostHead : (f.pose.lean + f.pose.head + f.pose.rot + f.extraRot) * DEG * fc;
  ctx.save(); ctx.lineCap = 'round';
  // 1. the back
  _wtFlames(f, ctx, W);
  _wtTails(f, ctx, W, -1);
  _wtMantle(f, ctx, W);
  _wtSaya(f, ctx, W);
  // 2-3. the far arm and leg
  _wtArm(f, ctx, W, sk.shB, sk.bel, sk.bha, true);
  _wtClaw(f, ctx, W, sk.bel, sk.bha, true, true);
  _wtLeg(f, ctx, W, sk.hipB, sk.bkn, sk.bft, true);
  // 4. the torso and its collar
  _wtTorso(f, ctx, W);
  // 5-6. the front flap, the near leg
  _wtTails(f, ctx, W, 1);
  _wtLeg(f, ctx, W, sk.hipF, sk.fkn, sk.fft, false);
  // 7. the waist
  _wtWaist(f, ctx, W);
  // 8. the head
  ctx.save(); ctx.translate(sk.head.x, sk.head.y); ctx.rotate(f.headRot); ctx.scale(fc, 1);
  drawWitnessHead(ctx, f, W.hr, flat ? front : null, flat);
  ctx.restore();
  // 9. the near arm, the core over it, the blade, the claw over the grip
  _wtArm(f, ctx, W, sk.shF, sk.fel, sk.fha, false);
  if (!f.coreBroken) f.drawCore(ctx, flat ? { color: front } : opt);
  f.drawMainWeapon(ctx, front, flat ? Object.assign({}, opt, { color: front }) : opt);
  _wtClaw(f, ctx, W, sk.fel, sk.fha, false, f.shape() !== 'none');
  ctx.restore();
}

/* ---- the part drawers every Witness part file uses ---- */
// a point on the spine frame: u along the spine (0 the hip, 1 the neck, past 1 above it), w design px toward the front
function _wtP(W) { const S = W.S, s = W.s; return (u, w) => [spX(S, u, w * s), spY(S, u, w * s)]; }

// one part: `P` adds its closed path (no beginPath). Cel-filled in `tone` (shade, base, light) with `detail` clipped
// inside, then the pale line round it. o: { lw (0 no line), line, sd shade depth, hd light depth, detail(g) }
function _wtPart(ctx, W, P, tone, o) {
  const A = W.A, lw = o && o.lw != null ? o.lw : W.lw;
  ctx.lineJoin = 'miter'; ctx.miterLimit = 5;
  if (A.flat) {
    ctx.beginPath(); P(); ctx.fillStyle = A.col; ctx.fill();
    if (lw) { ctx.strokeStyle = A.col; ctx.lineWidth = lw; ctx.stroke(); }
  } else {
    celFill(ctx, P, tone, A, { sd: (o && o.sd) || 2.4 * W.s, hd: (o && o.hd) || 0, rim: false, seam: false, detail: o && o.detail });
    if (lw) { ctx.beginPath(); P(); ctx.strokeStyle = (o && o.line) || WT_L.line; ctx.lineWidth = lw; ctx.stroke(); }
  }
  ctx.lineJoin = 'round';
}

// a line (chains, stripes, trims): in the flat colour on the flat passes
function _wtLine(ctx, W, pts, col, lw, close) {
  ctx.strokeStyle = W.A.flat ? W.A.col : col; ctx.lineWidth = lw; ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  if (close) ctx.closePath();
  ctx.stroke();
}

// a flat fill (small trims inside a part's detail, or ornaments): in the flat colour on the flat passes
function _wtFill(ctx, W, P, col) { ctx.beginPath(); P(); ctx.fillStyle = W.A.flat ? W.A.col : col; ctx.fill(); }

// a tapered ribbon along a polyline, w0 wide at its root to w1 at its end, its end drawn to a point
function _wtRibbonPath(ctx, pts, w0, w1) {
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = lerp(w0, w1, i / (n - 1)) * 0.5;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  ctx.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(L[i][0], L[i][1], (L[i][0] + L[i + 1][0]) / 2, (L[i][1] + L[i + 1][1]) / 2);
  ctx.lineTo(pts[n - 1][0], pts[n - 1][1]);
  for (let i = n - 2; i > 0; i--) ctx.quadraticCurveTo(R[i][0], R[i][1], (R[i][0] + R[i - 1][0]) / 2, (R[i][1] + R[i - 1][1]) / 2);
  ctx.lineTo(R[0][0], R[0][1]); ctx.closePath();
}
