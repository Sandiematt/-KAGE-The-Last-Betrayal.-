SUB_HEADS.borrowed_mask = function (ctx, key, f, r, ink, flat, A, sv, t, acc, fill) {
  // a torn hood of black shards behind; a borrowed white mask that does not fit (set forward, tilted), cracked,
  // its painted face slipping between two expressions; the eyes glow through its holes
  fill([[0.5, -0.9], [-0.1, -1.14], [-0.46, -1.36, 1], [-0.62, -1.08], [-1.24, -1.0, 1], [-1.02, -0.6], [-1.5, -0.2, 1], [-1.08, 0.06], [-1.36, 0.66, 1], [-0.9, 0.5], [-0.72, 1.16, 1], [-0.36, 0.62], [-0.1, 0.0], [0.1, -0.6]], f.hollow ? HOLLOW_MASK_FAR : SUB_LACQ, { sd: r * 0.22, hd: r * 0.05, rim: true });
  const alt = ((t * 1.3) | 0) % 3 === 2;
  ctx.save(); ctx.translate(r * 0.44, r * 0.06); ctx.rotate(-0.12);
  celFill(ctx, () => ctx.ellipse(0, 0, r * 0.72, r * 1.02, 0, 0, TAU), ['#8f87a8', '#ddd6ee', '#f6f3fc'], A, { sd: r * 0.2, hd: r * 0.06, rim: true, detail: (g) => {
    g.strokeStyle = '#7a5cc9'; g.lineWidth = r * 0.08; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-r * 0.32, -r * 0.3); g.lineTo(-r * 0.06, alt ? -r * 0.44 : -r * 0.24); g.moveTo(r * 0.2, alt ? -r * 0.44 : -r * 0.24); g.lineTo(r * 0.46, -r * 0.3); g.stroke();
    g.beginPath(); g.moveTo(-r * 0.22, r * 0.5); g.quadraticCurveTo(r * 0.06, alt ? r * 0.3 : r * 0.74, r * 0.36, r * 0.5); g.stroke();
  } });
  ctx.restore();
  if (!A.flat) {
    // the eye holes at the wearer's eyes, and the crack from the brow glowing violet
    _eyeHoles(ctx, r);
    ctx.save(); ctx.globalAlpha *= 0.9;
    hollowCrack(ctx, A, r, [[0.28, -0.96], [0.36, -0.6], [0.24, -0.38], [0.34, -0.12]], r * 0.03);
    ctx.restore();
  }
};
