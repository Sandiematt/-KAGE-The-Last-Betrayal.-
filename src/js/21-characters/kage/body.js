/* ---- Kage's own body (rebuilt from scratch) ----
   kageBody draws the whole figure on its skeleton (Fighter.sk) in place of the shared anime rig. Every part is one
   sharp closed shape, cel-filled in its material's three tones, inside a fine dark-crimson line; colour is kept to the
   crimson (lining, obi, cords, the hem's band), the red scarf and muted silver fittings. Back to front:
     1 the back      the coat's two long tails (tails.js), the gear's capes
     2 the far arm, 3 the far leg
     4 the torso     the standing collar, the fitted coat over the black kimono (torso.js), the armour's chest pieces
     5 the near leg, the coat's front flap over its thigh
     6 the waist     the crimson obi, the belt and its buckle, the pouch, the saya
     7 the scarf wound round the neck, 8 the head: black face, hair or helmet, white eyes; the scarf's front fold
     9 the near arm, the pauldron, the weapon, the gloves closed on its grip
   The gear hooks are the shared body's, in the same slots, so every helmet and armour still sits on him.
   The flat passes (the outline stamp, flash, impact frames, afterimages) draw every part, its line included, in the
   one colour, so the silhouette is the same shape with or without the art. Drawing only: nothing moves a joint. */
const _kgK = { f: null, A: null, S: null, s: 1, fc: 1, t: 0, lw: 1, lwFar: 1, hr: 1 };

function kageBody(f, ctx, front, flat, opt) {
  if (KAGE_DESIGN.shadow) { kageShadowBody(f, ctx, front, flat, opt); return; }   // the silhouette design (shadow/)
  const sk = f.sk, s = f.scale, b = f.build, fc = f.facing, skin = ANIME_SKINS.kage;
  const A = animeState(f, front, flat, opt), S = animeSpine(f), pal = A.pal;
  const big = b.w >= 16 ? 1.45 : b.w >= 13 ? 1.2 : 1, L = b.w * s * 0.42 * (b.w >= 13 ? 1.15 : 1), T = L * 1.25 * big;
  const U = s * clamp(b.w / 10, 0.9, 1.75) * (b.w >= 13 ? 1.08 : 1);   // the gear overlays' clothing unit
  A.S = S; A.U = U;
  const K = _kgK;
  K.f = f; K.A = A; K.S = S; K.s = s; K.fc = fc; K.t = f.time || 0; K.lw = 1.05 * s; K.lwFar = 0.9 * s;
  K.hr = BODY.head * s * b.head * 0.92;   // the head is drawn a little under the skeleton's, the hair carries its volume
  const ov = flat ? { color: front } : opt, armInk = flat ? front : pal.metal[1];
  const wopt = flat ? Object.assign({}, opt, { color: front }) : opt;
  f.headRot = f._ghostHead != null ? f._ghostHead : (f.pose.lean + f.pose.head + f.pose.rot + f.extraRot) * DEG * fc;
  const twoHand = f.pose.ik > 0.5 && IK_OFF[f.shape()] != null;
  ctx.save(); ctx.lineCap = 'round';
  // 1. the back
  _kgTail(f, ctx, K, 'under');
  _kgTail(f, ctx, K, 'back');
  subLayer(f, ctx, A, skin, U, 'back'); subBLayer(f, ctx, A, skin, U, 'back');
  // 2. the far arm (then any off-hand weapon)
  _kgArm(f, ctx, K, sk.shB, sk.bel, sk.bha, true, U);
  if (!twoHand) _kgHand(f, ctx, K, sk.bel, sk.bha, true);
  f.drawOffhand(ctx, front, wopt);
  // 3. the far leg
  _kgLeg(f, ctx, K, sk.hipB, sk.bkn, sk.bft, true);
  // 4. the torso
  _kgCollar(f, ctx, K);
  _kgTorso(f, ctx, K);
  drawArmor(ctx, f, armInk, ov, T * 1.25);
  // 5. the near leg, the gear's skirts, the coat's front flap
  _kgLeg(f, ctx, K, sk.hipF, sk.fkn, sk.fft, false);
  subLayer(f, ctx, A, skin, U, 'front'); subBLayer(f, ctx, A, skin, U, 'front');
  _kgTail(f, ctx, K, 'flap');
  akariLayer(f, ctx, A, skin, U, 'gear');   // the Mei-En Garb's sash, over his coat (bosses/akari/)
  // 6. the waist
  _kgWaist(f, ctx, K);
  subLayer(f, ctx, A, skin, U, 'waist'); subBLayer(f, ctx, A, skin, U, 'waist');
  if (f.hasWeapon) _kgSaya(f, ctx, K);
  // 7. the scarf round the neck
  _kgScarf(f, ctx, K, false);
  // 8. the head
  ctx.save(); ctx.translate(sk.head.x, sk.head.y); ctx.rotate(f.headRot); ctx.scale(fc, 1);
  animeFace(f, ctx, A, K.hr * 0.9, skin);   // the profile (brow, nose, lips, chin: _shared/face.js), as on the shadow design
  drawHelmet(ctx, f.helmet, K.hr, flat ? front : pal.metal[1], ov, f);
  if (!flat && !opt.noEyes) drawEyes(ctx, f, K.hr, opt);
  ctx.restore();
  _kgScarf(f, ctx, K, true);
  // 9. the near arm, the pauldron, the weapon, the gloves over its grip
  _kgArm(f, ctx, K, sk.shF, sk.fel, sk.fha, false, U);
  if (f.armor === 'tachibana') _kgPauldron(f, ctx, K, sk.shF, sk.fel);
  takashiLayer(f, ctx, A, skin, U, 'over');   // the Shinsei Yoroi's gold clasp and tassel at the throat (bosses/takashi/)
  f.drawMainWeapon(ctx, front, wopt);
  _kgHand(f, ctx, K, sk.fel, sk.fha, false);
  if (twoHand) _kgHand(f, ctx, K, sk.bel, sk.bha, true);
  ctx.restore();
}

/* ---- the part drawers every Kage part file uses ---- */
// a point on the spine frame: u along the spine (0 the hip, 1 the neck, past 1 above it), w design px toward the front
function _kgP(K) { const S = K.S, s = K.s; return (u, w, sharp) => [spX(S, u, w * s), spY(S, u, w * s), sharp]; }

// a limb's frame a -> b: at(u, o) is u along it, o px to its front side (a leg) or its outer, upper side (an arm)
function _kgLimb(a, b, fc) {
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = dy / l * fc, ny = -dx / l * fc;
  return { l, ux: dx / l, uy: dy / l, nx, ny, at: (u, o, sharp) => [a.x + dx * u + nx * o, a.y + dy * u + ny * o, sharp] };
}

// a closed path through points [x, y, sharp?]: a sharp corner where flagged, a soft one elsewhere
function _kgShape(ctx, pts) { orderShape(ctx, 1, pts); }

// one part: `P` adds its closed path (no beginPath). Cel-filled in `tone` (shade, base, light) with `detail` clipped
// inside, then the fine line round it. o: { lw (0 no line), line, sd shade depth, hd light depth, rim, detail(g) }
function _kgPart(ctx, K, P, tone, o) {
  const A = K.A, lw = o && o.lw != null ? o.lw : K.lw;
  ctx.lineJoin = 'miter'; ctx.miterLimit = 4;
  if (A.flat) {
    ctx.beginPath(); P(); ctx.fillStyle = A.col; ctx.fill();
    if (lw) { ctx.strokeStyle = A.col; ctx.lineWidth = lw; ctx.stroke(); }
  } else {
    celFill(ctx, P, tone, A, { sd: (o && o.sd) || 2.4 * K.s, hd: (o && o.hd) || 0, rim: !!(o && o.rim), seam: false, detail: o && o.detail });
    if (lw) { ctx.beginPath(); P(); ctx.strokeStyle = (o && o.line) || KG.line; ctx.lineWidth = lw; ctx.stroke(); }
  }
  ctx.lineJoin = 'round';
}

// a line inside a part's detail (seams, cords, trims)
function _kgLine(g, pts, col, lw, close) {
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
  pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]));
  if (close) g.closePath();
  g.stroke();
}

// a flat fill inside a part's detail
function _kgFill(g, pts, col) { g.fillStyle = col; g.beginPath(); _poly(g, pts); g.fill(); }

function _kgMix(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
