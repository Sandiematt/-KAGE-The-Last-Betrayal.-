/* ---- embroidery: crimson cloud swirls, wave crests, and plum blossoms, clipped to the cloth panel by the caller ---- */
function cloudMotif(ctx, x, y, R, rot, col, lw) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 26; i++) { const a = i / 26 * Math.PI * 3.1, rr = R * (0.12 + 0.88 * i / 26); const px = Math.cos(a) * rr, py = Math.sin(a) * rr * 0.86; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.quadraticCurveTo(R * 1.6, R * 0.2, R * 2.1, -R * 0.5);   // the swirl's tail
  ctx.stroke();
  // three lobes of the cloud round it
  ctx.beginPath(); ctx.arc(-R * 0.9, R * 0.55, R * 0.62, Math.PI * 0.6, Math.PI * 1.75); ctx.stroke();
  ctx.beginPath(); ctx.arc(R * 0.5, R * 1.05, R * 0.55, Math.PI * 0.1, Math.PI * 1.05); ctx.stroke();
  ctx.beginPath(); ctx.arc(-R * 0.2, -R * 0.45, R * 0.42, Math.PI * 1.3, Math.PI * 2.4); ctx.stroke();   // the third lobe, upper
  // a second swirl tail curling the opposite way
  ctx.beginPath(); ctx.moveTo(-R * 1.3, R * 0.3);
  ctx.quadraticCurveTo(-R * 1.7, -R * 0.1, -R * 1.55, -R * 0.6); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-R * 1.45, R * 0.15, lw * 0.9, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(R * 0.7, -R * 0.3, lw * 0.65, 0, TAU); ctx.fill();   // a second accent dot
  ctx.restore();
}

// a small wave crest: three rolling arcs (hokusai-style) for embroidery between cloud motifs
function waveMotif(ctx, x, y, w, rot, col, lw) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ox = (i - 1) * w * 0.7, s = 1 - Math.abs(i - 1) * 0.15;
    ctx.beginPath();
    ctx.moveTo(ox - w * 0.35 * s, 0);
    ctx.quadraticCurveTo(ox - w * 0.1 * s, -w * 0.45 * s, ox + w * 0.05 * s, -w * 0.35 * s);
    ctx.quadraticCurveTo(ox + w * 0.2 * s, -w * 0.25 * s, ox + w * 0.35 * s, 0);
    ctx.stroke();
    // the curling crest tip
    ctx.beginPath();
    ctx.moveTo(ox + w * 0.05 * s, -w * 0.35 * s);
    ctx.quadraticCurveTo(ox + w * 0.15 * s, -w * 0.5 * s, ox + w * 0.28 * s, -w * 0.32 * s);
    ctx.stroke();
  }
  ctx.restore();
}

// five-petal plum blossom: a classic Japanese embroidery accent dot
function plumBlossom(ctx, x, y, r, col, lw) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = col; ctx.lineWidth = lw * 0.7; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * TAU - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.42, r * 0.28, a, 0, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, lw * 0.6, 0, TAU); ctx.fill();
  ctx.restore();
}
