/* ---- the head (drawHelmet 'witness_mask', and witnessBody): crown, face and the star in its eye ----
   In the head frame: +x the way it faces, y down, in head radii (r). From the sheets:
     face   a mask: Kage's own profile cut in hard planes (it is his mirror), a jutting brow over the eye, the ridge
            of the nose to a sharp tip, a closed mouth notched under it, a pointed chin; dark, a pale line down the
            whole profile with the phase's light inside it, a lit cheek plane, the mouth a short slit of light
     eye    a four-point star at the front of the face, its long points up and down, reaching past the face's edge
     crown  a burst of lightning spikes far bigger than the face: pale ones thrown forward and up (a zigzag), dark
            ones between, coloured ones swept back (blue I-II, violet III, violet with gold IV), every one inside the
            pale line
   On a Kage-flicker frame the head is Kage's own hair (drawEyes adds his eyes). */
// the mask in profile: from under the crown, the forehead, the brow, the socket of the eye, the nose, the lips with the
// mouth between them, the chin, back along the jaw. The first eleven points are the profile (lit), the rest the jaw
// It is Kage's own face (FACE_PROFILES.base, _shared/face.js) a little sharpened, as a mask: WT_MASK is its profile,
// drawn at WT_MASK_K head radii. The Witness stands leaning far forward, its head with it, so the mask is tipped back
// by WT_TILT about the middle of the head: the profile then stands near upright on screen and reads as a face, not as
// one more spike of the crown
const WT_MASK = { nose: 1.2, brow: 1.4, lip: 1.0, chin: 1.12, jaw: 0.98 };
const WT_MASK_K = 0.96, WT_TILT = -0.32;
// the lit plane of the cheek (in face radii): under the eye's socket from the nose back toward the jaw
const WT_CHEEK = [[0.86, 0.22], [0.92, 0.46], [0.78, 0.6], [0.36, 0.8], [0.16, 0.42]];
// the mouth: a short slit running back from between the lips (face radii)
const WT_MOUTH = [[0.95, 0.65], [0.6, 0.71], [0.92, 0.69]];
// tip the head frame back for the mask
function _wtMaskFrame(ctx, r0) { ctx.translate(r0 * 0.1, r0 * 0.3); ctx.rotate(WT_TILT); ctx.translate(-r0 * 0.1, -r0 * 0.3); }
// a group of spikes on the crown's root: bases B0..Bn along the root, tip i standing between bases i and i+1, a notch
// partway up each spike's leading edge (the bolt's zigzag); closed back through the root's inside points
function _wtSpikes(bases, tips, inside, notch) {
  const out = [];
  for (let i = 0; i < tips.length; i++) {
    const b0 = bases[i], b1 = bases[i + 1], t = tips[i], k = notch == null ? 0.3 : notch;
    out.push(b0, [lerp(b0[0], t[0], 0.46) + (b1[0] - b0[0]) * k, lerp(b0[1], t[1], 0.46) + (b1[1] - b0[1]) * k], [lerp(b0[0], t[0], 0.52) - (b1[0] - b0[0]) * k * 0.2, lerp(b0[1], t[1], 0.52) - (b1[1] - b0[1]) * k * 0.2], t);
  }
  out.push(bases[bases.length - 1]);
  return out.concat(inside);
}
// the pale bolts thrown forward and up, from the lowest (just over the brow) to the tallest
const WT_CROWN_PALE = _wtSpikes([[0.5, -0.2], [0.66, -0.66], [0.5, -1.02], [0.18, -1.22], [-0.18, -1.16]],
  [[2.66, -0.66], [2.6, -2.02], [1.8, -2.98], [0.62, -3.4]], [[-0.18, -0.6], [0.24, -0.34]]);
// the gold inside the pale bolts (the Reality Editor and the True Witness)
const WT_CROWN_GOLD = _wtSpikes([[0.5, -0.32], [0.6, -0.68], [0.44, -0.98], [0.16, -1.12], [-0.12, -1.06]],
  [[1.7, -0.62], [1.74, -1.56], [1.22, -2.2], [0.4, -2.5]], [[-0.1, -0.66], [0.26, -0.44]], 0.2);
// the dark spikes in the middle, behind the pale ones
const WT_CROWN_DARK = _wtSpikes([[0.2, -1.0], [-0.2, -1.12], [-0.56, -0.96], [-0.8, -0.62]],
  [[0.06, -2.5], [-0.62, -2.36], [-1.5, -1.82]], [[-0.5, -0.3], [0.1, -0.5]], 0.2);
// the swept-back spikes, top to bottom
const WT_CROWN_BACK = _wtSpikes([[-0.1, -1.18], [-0.5, -1.06], [-0.8, -0.76], [-0.94, -0.4], [-0.92, -0.02], [-0.7, 0.3]],
  [[-0.78, -3.04], [-2.0, -2.62], [-2.56, -1.5], [-2.44, -0.4], [-1.78, 0.56]], [[-0.3, 0.1], [-0.2, -0.6]]);
// the light inside the back spikes: a pale stroke from each spike's root toward its tip
const WT_CROWN_VEINS = [[[-0.4, -1.3], [-0.7, -2.6]], [[-0.78, -1.04], [-1.76, -2.3]], [[-0.98, -0.66], [-2.2, -1.38]], [[-1.06, -0.24], [-2.1, -0.4]], [[-0.92, 0.2], [-1.5, 0.46]]];

// a sharp-cornered closed path through points in head radii
function _wtHP(ctx, r, pts) { ctx.moveTo(pts[0][0] * r, pts[0][1] * r); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * r, pts[i][1] * r); ctx.closePath(); }

function drawWitnessHead(ctx, f, r, ink, flat) {
  if (f && f.kageFrame) { drawKageHair(ctx, r, ink, flat, f); return; }   // the flicker: Kage's own hair (drawEyes adds his eyes)
  const A = f && f._A, r0 = r; r = r0 * 1.22;   // the sheets' head: a small face under a crown far bigger than it
  const poly = (pts) => () => _wtHP(ctx, r, pts);
  if (flat || !A || A.flat) {
    ctx.fillStyle = flat ? ink : WT_CROWN[1]; ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(1, r * 0.06); ctx.lineJoin = 'miter'; ctx.miterLimit = 5;
    for (const pts of [WT_CROWN_BACK, WT_CROWN_DARK, WT_CROWN_PALE]) { ctx.beginPath(); _wtHP(ctx, r, pts); ctx.fill(); ctx.stroke(); }
    ctx.save(); _wtMaskFrame(ctx, r0); ctx.beginPath(); animeFacePath(ctx, r0 * WT_MASK_K, WT_MASK); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.lineJoin = 'round';
    return;
  }
  const L = WT_L, t = f.time || 0, fade = f.witFade(), lw = Math.max(1, r * 0.06), sv = _headLight(A, f);
  const part = (pts, tone, line, detail) => {
    celFill(ctx, poly(pts), tone, A, { sd: r * 0.09, hd: 0, rim: false, seam: false, detail });
    ctx.lineJoin = 'miter'; ctx.miterLimit = 5; ctx.strokeStyle = line; ctx.lineWidth = lw; ctx.beginPath(); _wtHP(ctx, r, pts); ctx.stroke(); ctx.lineJoin = 'round';
  };
  const stroke = (g, segs, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); for (const [[x0, y0], [x1, y1]] of segs) { g.moveTo(x0 * r, y0 * r); g.lineTo(x1 * r, y1 * r); } g.stroke(); };
  // the mask first, the crown's roots over the back of its skull (tipped back, _wtMaskFrame): Kage's profile in
  // near-black, the cheek a plane in the phase's deep tone, a strip of the phase's light down the front of the profile,
  // the mouth a slit of the pale line's colour; then the pale line down the profile, brow to chin (the back of the jaw
  // melts into the collar)
  const rf = r0 * WT_MASK_K, d = rf * 0.12, P = () => animeFacePath(ctx, rf, WT_MASK);
  ctx.save(); _wtMaskFrame(ctx, r0);
  ctx.beginPath(); P(); ctx.fillStyle = ANIME.face; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = L.panel[0]; ctx.beginPath(); _wtHP(ctx, rf, WT_CHEEK); ctx.fill();
  ctx.fillStyle = L.back[1]; ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5); ctx.translate(-d, d * 0.14); P(); ctx.translate(d, -d * 0.14); ctx.fill('evenodd');
  ctx.fillStyle = L.line; ctx.beginPath(); _wtHP(ctx, rf, WT_MOUTH); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.rect(rf * 0.2, -rf * 0.9, rf * 4, rf * 1.8); ctx.rect(rf * 0.5, rf * 0.9, rf * 4, rf * 0.6); ctx.clip();
  ctx.lineJoin = 'miter'; ctx.strokeStyle = L.line; ctx.lineWidth = lw; ctx.beginPath(); P(); ctx.stroke(); ctx.lineJoin = 'round';
  ctx.restore();
  // the swept-back spikes: the phase's colour, a light stroke up each one (gold edges on the True Witness)
  part(WT_CROWN_BACK, L.back, _wtLookKey === 3 ? L.gold : L.line, (g) => { g.lineCap = 'round'; stroke(g, WT_CROWN_VEINS, L.back[2], r * 0.07); });
  // the dark spikes in the middle
  part(WT_CROWN_DARK, L.bodyInk, L.line);
  // the pale zigzag (gold inside it from the Reality Editor on)
  part(WT_CROWN_PALE, L.pale, '#ffffff', _wtLookKey === 2 || _wtLookKey === 3 ? (g) => {
    g.fillStyle = L.gold; g.beginPath(); _wtHP(g, r, WT_CROWN_GOLD); g.fill();
  } : null);
  A.lx = sv[0]; A.ly = sv[1];
  if (f.eye === 'rgba(0,0,0,0)' || (A.opt && A.opt.noEyes)) return;
  ctx.save(); _wtMaskFrame(ctx, r0);
  // the star in its eye: long points up and down, short ones fore and aft, a white core; brighter and larger on a tell
  // (in the socket under the brow where Kage's eye is, kept clear of the nose so the mask's profile reads past it)
  const hot = f.telegraph > 0, sx = rf * 0.56, sy = rf * 0.08;
  const squint = f.state === 'hit' || f.state === 'stun' ? 0.7 : 1, sz = r0 * (hot ? 0.66 : 0.46) * squint * (1 + 0.06 * Math.sin(t * 6));
  const star = (k, w) => {
    const a = sz * k, b = sz * k * 0.62, q = sz * k * w;
    ctx.beginPath(); ctx.moveTo(sx, sy - a); ctx.lineTo(sx + q, sy - q); ctx.lineTo(sx + b, sy); ctx.lineTo(sx + q, sy + q); ctx.lineTo(sx, sy + a);
    ctx.lineTo(sx - q, sy + q); ctx.lineTo(sx - b, sy); ctx.lineTo(sx - q, sy - q); ctx.closePath();
  };
  ctx.save();
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.5 * fade;
  ctx.fillStyle = `rgba(${L.glow.join(',')},0.9)`; ctx.beginPath(); ctx.arc(sx, sy, sz * 0.42, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = L.eye; star(1.14, 0.17); ctx.fill();
  ctx.fillStyle = '#ffffff'; star(0.9, 0.11); ctx.fill();
  ctx.restore();
}
