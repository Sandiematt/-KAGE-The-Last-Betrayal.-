// the face the mask was carved from: the operative's, not the Hollow's (a woman's fine nose, full lips, a small chin)
const UTSUSHI_MASK_FACE = { of: 'fem', nose: 0.86, up: 0.05, lip: 1.3, chin: 0.86, jaw: 0.9, brow: 0.4 };

SUB_HEADS.borrowed_mask = function (ctx, key, f, r, ink, flat, A, sv, t, acc, fill) {
  // a torn hood of black shards behind; a borrowed white mask that does not fit: the operative's own profile in white
  // (brow, nose, lips, chin), set forward of the face under it and tilted, cracked, its painted brows and mouth slipping
  // between two expressions; the eyes glow through its holes
  fill([[0.5, -0.9], [-0.1, -1.14], [-0.46, -1.36, 1], [-0.62, -1.08], [-1.24, -1.0, 1], [-1.02, -0.6], [-1.5, -0.2, 1], [-1.08, 0.06], [-1.36, 0.66, 1], [-0.9, 0.5], [-0.72, 1.16, 1], [-0.36, 0.62], [-0.1, 0.0], [0.1, -0.6]], f.hollow ? HOLLOW_MASK_FAR : SUB_LACQ, { sd: r * 0.22, hd: r * 0.06, rim: true });
  const alt = ((t * 1.3) | 0) % 3 === 2, prof = faceProfile({ face: UTSUSHI_MASK_FACE });
  const P = () => animeFacePath(ctx, r * 0.9 * 1.05, prof), OVAL = () => ctx.ellipse(r * 0.34, r * 0.06, r * 0.76, r * 1.06, 0, 0, TAU);
  ctx.save(); ctx.translate(r * 0.11, r * 0.02); ctx.rotate(-0.1);
  // the mask: the face shape in front, cut to an oval behind (its back edge stands off the cheek)
  ctx.beginPath(); OVAL(); ctx.clip();
  celFill(ctx, P, ['#8f87a8', '#ddd6ee', '#f6f3fc'], A, { sd: r * 0.2, hd: r * 0.07, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = Math.max(1.2, r * 0.07); g.beginPath(); OVAL(); g.stroke();
    // the painted face: two brows and a mouth, never the same one twice
    g.strokeStyle = '#7a5cc9'; g.lineWidth = r * 0.09; g.lineCap = 'round';
    g.beginPath(); g.moveTo(r * 0.3, alt ? -r * 0.36 : -r * 0.2); g.lineTo(r * 0.74, alt ? -r * 0.18 : -r * 0.3); g.stroke();
    g.beginPath(); g.moveTo(r * 0.46, r * 0.68); g.quadraticCurveTo(r * 0.64, alt ? r * 0.56 : r * 0.8, r * 0.9, r * 0.66); g.stroke();
  } });
  ctx.restore();
  if (!A.flat) {
    // the eye holes at the wearer's eyes, and the crack from the brow glowing violet
    _eyeHoles(ctx, r);
    ctx.save(); ctx.globalAlpha *= 0.9;
    hollowCrack(ctx, A, r, [[0.34, -0.9], [0.42, -0.6], [0.3, -0.38], [0.4, -0.12]], r * 0.03);
    ctx.restore();
  }
};
