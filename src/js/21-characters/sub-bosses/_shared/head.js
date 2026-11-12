/* ---- heads (head frame: +x the face side, r the head radius) ---- */
function drawSubHead(ctx, key, f, r, ink, flat) {
  const A = f._A && f._A.pal ? f._A : animeState(f, ink, flat, {});
  const sv = _headLight(A, f), t = f.time || 0, acc = subTone(SUB_ACC[key] || '#b02a31');
  const fill = (pts, tone, o) => celFill(ctx, () => orderShape(ctx, r, pts), tone, A, o);
  const part = SUB_HEADS[key];   // each look is drawn in its wearer's folder (sub-bosses/<name>/head.js)
  if (part) part(ctx, key, f, r, ink, flat, A, sv, t, acc, fill);
  A.lx = sv[0]; A.ly = sv[1];
}

/* ---- masks that follow the face ----
   Every sub-boss shows the profile of _shared/face.js (brow, nose, lips, chin: its skin's `face`; Kage's own when he
   wears the look). A mask or guard is never a blank plate over it: it is the wearer's own face path, drawn a few percent
   proud of the face (a shell) and cut to the part it covers, so the nose, the mouth and the chin still read in the
   silhouette through it. Head units throughout (r the head radius; the face is 0.9 of it). */
function _subFacePath(ctx, r, f, k) { animeFacePath(ctx, r * 0.9 * (k || 1), faceProfile(f ? animeSkin(f) : null)); }

// the regions a shell is cut to (orderShape points, all sharp):
const SUB_CUT = {
  // from under the nose: the mouth, the chin and the jaw (a menpō with the nose left bare)
  mouth: [[-0.5, 0.12, 1], [0.5, 0.34, 1], [0.86, 0.5, 1], [1.8, 0.5, 1], [1.8, 1.9, 1], [-0.5, 1.9, 1]],
  // from under the mouth: the chin and the jaw, the cheek plate up to the ear (a hōate: nose and lips bare)
  chin: [[-0.5, 0.1, 1], [0.24, 0.24, 1], [0.6, 0.72, 1], [1.8, 0.74, 1], [1.8, 1.9, 1], [-0.5, 1.9, 1]],
  // the whole face in front of the ear, from the brow down (a full mask)
  full: [[-0.06, -0.86, 1], [1.8, -0.86, 1], [1.8, 1.9, 1], [0.1, 1.9, 1], [-0.18, 0.4, 1]]
};

// a shell over the face cut to `cut` (a SUB_CUT name or points), cel-filled in `tone` (celFill's options in `o`), its
// cut edge a dark seam. k: how far it stands proud of the face (1.07: about a twentieth of the head).
function _subShell(ctx, A, r, f, cut, tone, o, k) {
  const pts = typeof cut === 'string' ? SUB_CUT[cut] : cut, P = () => _subFacePath(ctx, r, f, k || 1.07);
  ctx.save(); ctx.beginPath(); orderShape(ctx, r, pts); ctx.clip();
  celFill(ctx, P, tone, A, o);
  if (!A.flat) {
    ctx.beginPath(); P(); ctx.clip();
    ctx.beginPath(); orderShape(ctx, r, pts); ctx.strokeStyle = ANIME.outline; ctx.lineWidth = Math.max(1.2, r * 0.07); ctx.stroke();
  }
  ctx.restore();
}

// fangs: [x, y, length (+ down from the upper jaw, - up from the lower), half width] in head units, bone-pale
function _subFangs(g, r, list, col) {
  g.fillStyle = col || SUB_PAPER[1];
  for (const [x, y, l, w] of list) { g.beginPath(); g.moveTo(r * (x - w), r * y); g.lineTo(r * (x + w), r * y); g.lineTo(r * x, r * (y + l)); g.closePath(); g.fill(); }
}

// a snarl cut into a mask at the wearer's mouth: a dark slot through the lip line, fangs top and bottom, a lit lip
function _subSnarl(g, r, y, lip) {
  g.fillStyle = '#050304'; g.beginPath(); orderShape(g, r, [[0.42, y + 0.05, 1], [0.7, y - 0.01, 1], [1.4, y - 0.03, 1], [1.4, y + 0.11, 1], [0.7, y + 0.13, 1]]); g.fill();
  _subFangs(g, r, [[0.62, y - 0.005, 0.12, 0.05], [0.8, y - 0.02, 0.13, 0.055], [0.72, y + 0.125, -0.1, 0.045]]);
  if (lip) { g.strokeStyle = lip; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 0.4, r * (y + 0.03)); g.quadraticCurveTo(r * 0.7, r * (y - 0.06), r * 1.1, r * (y - 0.06)); g.stroke(); }
}

// the yodare-kake: two laced lames hanging under the chin guard, over the throat
function _subThroat(ctx, A, r, tone, lace) {
  celFill(ctx, () => orderShape(ctx, r, [[-0.12, 0.9], [0.34, 1.02, 1], [0.66, 1.04, 1], [0.7, 1.42, 1], [0.02, 1.48, 1], [-0.24, 1.16]]), tone, A, { sd: r * 0.12, hd: r * 0.05, rim: true, detail: (g) => {
    for (const y of [1.17, 1.31]) {
      g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(-r * 0.3, r * (y - 0.05)); g.lineTo(r * 0.8, r * y); g.stroke();
      g.strokeStyle = lace; g.lineWidth = r * 0.05; g.setLineDash([r * 0.06, r * 0.06]); g.beginPath(); g.moveTo(-r * 0.3, r * (y + 0.01)); g.lineTo(r * 0.8, r * (y + 0.06)); g.stroke(); g.setLineDash([]);
    }
  } });
}

/* ---- heads (head frame: +x the face side, r the head radius) ---- */
function drawSubBHead(ctx, key, f, r, ink, flat) {
  const A = f._A && f._A.pal ? f._A : animeState(f, ink, flat, {});
  const sv = _headLight(A, f), t = f.time || 0, acc = _subbAcc(f, key === 'oni_echo' ? 'oni' : key), sub = animeSkin(f).sub;
  const fill = (pts, tone, o) => celFill(ctx, () => orderShape(ctx, r, pts), tone, A, o);
  const studs = (g, list, rad) => { for (const [x, y] of list) { g.fillStyle = GOLDM[0]; g.beginPath(); g.arc(r * x, r * y, r * rad, 0, TAU); g.fill(); g.fillStyle = GOLDM[2]; g.beginPath(); g.arc(r * (x - rad * 0.3), r * (y - rad * 0.3), r * rad * 0.45, 0, TAU); g.fill(); } };
  // a lacquered shikoro: lames flaring down and back, laced in the accent
  const shikoro = (pts, tone, k0, k1, lace) => fill(pts, tone, { sd: r * 0.26, hd: r * 0.05, rim: true, detail: (g) => {
    for (let i = 1; i <= 3; i++) {
      const k = i / 4;
      g.strokeStyle = lace; g.lineWidth = r * 0.07; g.setLineDash([r * 0.06, r * 0.07]);
      g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.3 + k * k0)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.52 + k * k0), r * (-1.2 - k * k1), r * (-0.4 + k * (k0 + 0.3))); g.stroke();
      g.setLineDash([]);
      g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.06;
      g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.4 + k * k0)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.62 + k * k0), r * (-1.2 - k * k1), r * (-0.5 + k * (k0 + 0.3))); g.stroke();
    }
  } });
  const part = SUBB_HEADS[key];   // each look is drawn in its wearer's folder (sub-bosses/<name>/head.js)
  if (part) part(ctx, key, f, r, ink, flat, A, sv, t, acc, sub, fill, studs, shikoro);
  A.lx = sv[0]; A.ly = sv[1];
}
