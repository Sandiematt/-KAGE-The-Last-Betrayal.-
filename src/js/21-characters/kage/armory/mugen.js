/* ---- the Mugen Armor from the user's card art (Downloads/image.svg, kept at godot/mugen-armor/source/mugen.svg).
   Godot cut the art into its parts (godot/mugen-armor: the card's backdrop keyed out, each part masked by its outline
   in parts.json, the long lock unwrapped into a strip) and tools/mugen-armor/pack.py packed them into one atlas
   (MUGEN_PARTS, 34d-mugen-parts.js). Here each part is pinned to Kage's skeleton by its anchors: an affine map taking
   two points of the art onto two joints (so it turns and stretches with the bone, mirrored when he faces left).
     halo         the crescent behind his head, glowing
     head         the spiked crown, the violet headband and its diamond, the face (the eye is the game's own)
     collar       the high collar at the throat                  pauldron, bracer   on the near upper arm and forearm
     obi          the belt, its knot and two tassels             charm              hanging from the near hand
     tasset_back / tasset_front   the panels over the thighs     shin_far / shin_near   the guards and boots
     coat         the flame-cut coat, warped onto the coat's cloth tail in two triangles
     locks        the art's lock strip laid along each flowing lock, a tassel hanging from the first
   His scarf is not in the art and is not drawn with it. On the flat passes (outline, flash, afterimages), before the
   atlas has decoded, and under Node, the drawn version (_themes.js mugen, hem.js, pieces.js) stands in. ---- */
const MugenArt = {
  im: null,
  ready() {
    if (typeof MUGEN_PARTS === 'undefined' || typeof Image === 'undefined') return false;
    if (!this.im) { this.im = new Image(); this.im.src = MUGEN_PARTS.img; }
    const w = this.im.naturalWidth;   // a real decoded image only (the test harness's stub Image is never one)
    return !!this.im.complete && typeof w === 'number' && w > 0;
  }
};

// is the art drawn on this fighter this pass: his armour has it, it has decoded, and this is not a flat pass
function mugenArtOn(f, K) { return !!(K && K.th && K.th.art && K.A && !K.A.flat && MugenArt.ready()); }

// does his armour bring its own head (the art's crown and headband, shown over any helmet): a helmet's cloth tails are
// then not drawn (Fighter.draw's cloth loop)
function kageArmorArtHead(f) { const th = kageArmorTheme(f); return !!(th && th.art && MugenArt.ready()); }

const _mgAn = (name, key) => MUGEN_PARTS.parts[name].an[key];
const _mgJ = (p) => [p.x, p.y];

// the affine map taking art point sa to world A and the art direction sa -> sb onto A -> B: scaled by |AB| / |ab| (times
// ks) along it and `ax` times that across it, mirrored for a fighter facing left. [a, b, c, d, e, f] for ctx.transform
function _mgMap(sa, sb, A, B, fc, ax, ks) {
  let vx = sb[0] - sa[0], vy = sb[1] - sa[1]; const L = Math.hypot(vx, vy) || 1; vx /= L; vy /= L;
  let gx = B[0] - A[0], gy = B[1] - A[1]; const G = Math.hypot(gx, gy) || 1; gx /= G; gy /= G;
  const k = G / L * (ks || 1), q = ax == null ? 1 : ax, f2x = -gy * fc, f2y = gx * fc;
  const a = k * (vx * gx - q * vy * f2x), b = k * (vx * gy - q * vy * f2y);
  const c = k * (vy * gx + q * vx * f2x), d = k * (vy * gy + q * vx * f2y);
  return [a, b, c, d, A[0] - (a * sa[0] + c * sa[1]), A[1] - (b * sa[0] + d * sa[1])];
}

// the affine map taking the art triangle P onto the world triangle Q
function _mgTri(P0, P1, P2, Q0, Q1, Q2) {
  const u1x = P1[0] - P0[0], u1y = P1[1] - P0[1], u2x = P2[0] - P0[0], u2y = P2[1] - P0[1];
  const w1x = Q1[0] - Q0[0], w1y = Q1[1] - Q0[1], w2x = Q2[0] - Q0[0], w2y = Q2[1] - Q0[1];
  const det = u1x * u2y - u2x * u1y; if (Math.abs(det) < 1e-6) return null;
  const a = (w1x * u2y - w2x * u1y) / det, c = (w2x * u1x - w1x * u2x) / det;
  const b = (w1y * u2y - w2y * u1y) / det, d = (w2y * u1x - w1y * u2x) / det;
  return [a, b, c, d, Q0[0] - (a * P0[0] + c * P0[1]), Q0[1] - (b * P0[0] + d * P0[1])];
}

// one part of the atlas, drawn at its place in the art under the map m
function _mgPart(ctx, name, m, alpha) {
  const p = MUGEN_PARTS.parts[name]; if (!p || !m) return;
  ctx.save(); ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
  if (alpha != null) ctx.globalAlpha *= alpha;
  ctx.drawImage(MugenArt.im, p.r[0], p.r[1], p.r[2], p.r[3], p.at[0], p.at[1], p.r[2], p.r[3]);
  ctx.restore();
}

// the torso's scale: the art's spine (its belt's hip to its collar's neck) against his
function _mgTorsoK(f) { const sk = f.sk; return Math.hypot(sk.neck.x - sk.hip.x, sk.neck.y - sk.hip.y) / Math.hypot(626 - 602, 432 - 742); }

/* ---- the parts, each at its hook in the body's draw order ---- */
// the halo, behind everything: about three heads across, behind and above his head, opening below
function mugenHalo(f, ctx, K) {
  const hd = f.sk.head, hr = K.hr, fc = K.fc, c = _mgAn('halo', 'c'), k = 2.85 * hr / 245;
  const A = [hd.x - fc * 1.0 * hr, hd.y - 0.52 * hr], m = _mgMap(c, [c[0] + 100, c[1]], A, [A[0] + fc * 100 * k, A[1]], fc, 1, 1);
  // its own soft violet glow, breathing (the art's halo casts it, so the glow is exactly its shape)
  ctx.save(); ctx.shadowColor = 'rgba(192,75,255,0.75)'; ctx.shadowBlur = hr * (0.7 + 0.25 * Math.sin(K.t * 2.2));
  _mgPart(ctx, 'halo', m, 0.94 + 0.06 * Math.sin(K.t * 2.2));
  ctx.restore();
}

// the head, in the head frame (head units of r = K.hr, +x his face): pinned by its eye to where the game draws his eye,
// scaled so the art's crown-to-chin fits his
function mugenHead(ctx, r) {
  const e = _mgAn('head', 'eye'), k = 1.97 * r / 133;
  _mgPart(ctx, 'head', [k, 0, 0, k, 0.504 * r - k * e[0], 0.072 * r - k * e[1]]);
}

function mugenCollar(f, ctx, K) {
  _mgPart(ctx, 'collar', _mgMap(_mgAn('collar', 'neck'), _mgAn('obi', 'hip'), _mgJ(f.sk.neck), _mgJ(f.sk.hip), K.fc, 1, 1.3));
}

function mugenObi(f, ctx, K) {
  _mgPart(ctx, 'obi', _mgMap(_mgAn('obi', 'hip'), _mgAn('obi', 'neck'), _mgJ(f.sk.hip), _mgJ(f.sk.neck), K.fc, 0.8, 1));
}

// a panel over the thigh: it follows the thigh, a quarter of the way back to hanging straight down from the waist
function mugenTasset(f, ctx, K, front) {
  const sk = f.sk, name = front ? 'tasset_front' : 'tasset_back', hp = front ? sk.hipF : sk.hipB, kn = front ? sk.fkn : sk.bkn;
  const T = Math.hypot(kn.x - hp.x, kn.y - hp.y);
  let dx = sk.hip.x - sk.neck.x, dy = sk.hip.y - sk.neck.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
  const B = [lerp(kn.x, hp.x + dx * T, 0.25), lerp(kn.y, hp.y + dy * T, 0.25)];
  _mgPart(ctx, name, _mgMap(_mgAn(name, 'hip'), _mgAn(name, 'kn'), _mgJ(hp), B, K.fc, 1.4, 1));
}

function mugenShin(f, ctx, K, kn, ft, far) {
  const name = far ? 'shin_far' : 'shin_near';
  _mgPart(ctx, name, _mgMap(_mgAn(name, 'kn'), _mgAn(name, 'ft'), _mgJ(kn), _mgJ(ft), K.fc, 1, 1));
}

// the near arm: the pauldron on the upper arm, the bracer on the forearm (drawn over the sleeve, under the fist).
// His shoulder joint sits much closer to his neck than the art's does (7 px below it against the art's 21 px, at his
// scale), so pinned to the joint itself the pauldron would ride up over the collar and cover it. It is moved down the
// spine by the difference: its top then sits under the collar, as on the card art.
function mugenArm(f, ctx, K, sh, el, ha) {
  const sk = f.sk, nk = _mgAn('collar', 'neck'), psh = _mgAn('pauldron', 'sh'), hp = _mgAn('obi', 'hip');
  let dx = sk.hip.x - sk.neck.x, dy = sk.hip.y - sk.neck.y; const T = Math.hypot(dx, dy) || 1; dx /= T; dy /= T;
  const want = (psh[1] - nk[1]) / (hp[1] - nk[1]) * T, have = (sh.x - sk.neck.x) * dx + (sh.y - sk.neck.y) * dy, d = Math.max(0, want - have);
  const A = [sh.x + dx * d, sh.y + dy * d], B = [el.x + dx * d, el.y + dy * d];
  _mgPart(ctx, 'pauldron', _mgMap(psh, _mgAn('pauldron', 'el'), A, B, K.fc, 1, 1));
  _mgPart(ctx, 'bracer', _mgMap(_mgAn('bracer', 'el'), _mgAn('bracer', 'ha'), _mgJ(el), _mgJ(ha), K.fc, 1, 1));
}

// the charm hanging from the near hand: always hanging down, swaying a little
function mugenCharm(f, ctx, K) {
  const sk = f.sk, el = sk.fel, ha = sk.fha, fc = K.fc, top = _mgAn('charm', 'top'), sh = _mgAn('charm', 'ha');
  const k = Math.hypot(ha.x - el.x, ha.y - el.y) / Math.hypot(812 - 668, 650 - 645);
  const A = [ha.x + fc * (top[0] - sh[0]) * k * 0.6, ha.y + (top[1] - sh[1]) * k * 0.6], sw = Math.sin(K.t * 2.3) * 0.14;
  _mgPart(ctx, 'charm', _mgMap(top, [top[0], top[1] + 100], A, [A[0] + Math.sin(sw) * 100 * k * fc, A[1] + Math.cos(sw) * 100 * k], fc, 1, 1));
}

// the coat: the art's flame-cut coat warped onto the cloth tail's four corners (the waist's front and back, the low
// corner, the far tip) in two triangles split along front-waist to far-tip, each clipped to its own side of that line
function mugenCoat(ctx, K, Al, At, El, Et) {
  const an = MUGEN_PARTS.parts.coat.an, side = (P, Q, S) => {
    let dx = Q[0] - P[0], dy = Q[1] - P[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    let nx = -dy, ny = dx; if (nx * (S[0] - P[0]) + ny * (S[1] - P[1]) < 0) { nx = -nx; ny = -ny; }
    const R = 2000;
    ctx.beginPath(); ctx.moveTo(P[0] - dx * R, P[1] - dy * R); ctx.lineTo(Q[0] + dx * R, Q[1] + dy * R);
    ctx.lineTo(Q[0] + dx * R + nx * R, Q[1] + dy * R + ny * R); ctx.lineTo(P[0] - dx * R + nx * R, P[1] - dy * R + ny * R); ctx.closePath();
  };
  ctx.save(); side(Al, Et, El); ctx.clip(); _mgPart(ctx, 'coat', _mgTri(an.Al, an.El, an.Et, Al, El, Et)); ctx.restore();
  ctx.save(); side(Al, Et, At); ctx.clip(); _mgPart(ctx, 'coat', _mgTri(an.Al, an.Et, an.At, Al, Et, At)); ctx.restore();
}

// a tassel hanging from a point (the first lock), always down
function mugenLockTassel(f, ctx, K, P) {
  const top = _mgAn('lock_tassel', 'top'), k = _mgTorsoK(f) * 1.15, sw = Math.sin(K.t * 2.6 + 1) * 0.18;
  _mgPart(ctx, 'lock_tassel', _mgMap(top, [top[0], top[1] + 100], P, [P[0] + Math.sin(sw) * 100 * k * K.fc, P[1] + Math.cos(sw) * 100 * k], K.fc, 1, 1));
}
