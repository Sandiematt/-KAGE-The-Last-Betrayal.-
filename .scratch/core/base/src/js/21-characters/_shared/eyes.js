/* ---- the eye: one flat 2D eye, a sharp angry triangle, pure white ----
   The blade: a straight top edge slanting down hard toward the nose (+x, the scowl), a short inner edge, and a lower
   lid rising from a pointed bottom corner back up to the outer corner. No glow: the white fades evenly from the outer
   corner toward the inner one, inside the shape, so the edge stays crisp on the black face. */
// the three corners of an eye of size w x h centred at (x, y): outer top, inner (toward the nose), bottom
function eyeCorners(x, y, w, h) {
  return [[x - w * 0.5, y - h * 0.62], [x + w * 0.5, y + h * 0.12], [x - w * 0.08, y + h * 0.5]];
}
function drawEyes(ctx, f, r, opt) {
  if (opt.color || (f.helmet === 'witness_mask' && !f.kageFrame) || f.helmet === 'akari_mask') return;   // the Witness's and Akari's eyes are drawn with their masks
  if (f.eye === 'rgba(0,0,0,0)') return;   // a decoy or clone: no light behind the eyes
  const squint = f.state === 'move' || f.state === 'ability' ? 0.55 : f.state === 'hit' || f.state === 'stun' ? 0.75 : 1;
  const rf = r * 0.9, isHollow = f.hollow;
  const ex = rf * 0.56, ey = rf * 0.08, ew = rf * 0.42, eh = rf * 0.24 * squint;
  const [o, i, b] = eyeCorners(ex, ey, ew, eh);
  ctx.save();

  // --- the eye: solid white, then the fade laid over it: clear at the outer corner, deepening evenly toward the inner
  // one (violet on a Hollow), all inside the shape ---
  ctx.fillStyle = f.telegraph > 0 ? '#ffffff' : ANIME.eye;
  ctx.beginPath(); ctx.moveTo(...o); ctx.lineTo(...i); ctx.lineTo(...b); ctx.closePath(); ctx.fill();
  const tint = isHollow ? '90,60,170' : '60,52,48';
  const fade = ctx.createLinearGradient(o[0], o[1], i[0], i[1]);
  fade.addColorStop(0, `rgba(${tint},0)`);
  fade.addColorStop(0.5, `rgba(${tint},0)`);
  fade.addColorStop(1, `rgba(${tint},${isHollow ? 0.45 : 0.32})`);
  ctx.fillStyle = fade; ctx.fill();

  // --- telegraph: pulsing burst lines from the eye (the attack tell) ---
  if (f.telegraph > 0) {
    const t = f.time * 50, burstR = r * (0.6 + 0.25 * Math.sin(t));
    ctx.strokeStyle = f.eye; ctx.lineWidth = Math.max(1, r * 0.03); ctx.lineCap = 'round';
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * TAU + t * 0.15, innerR = r * 0.2, outerR = burstR * (0.7 + 0.3 * Math.sin(t + k * 1.2));
      ctx.moveTo(ex + Math.cos(a) * innerR, ey + Math.sin(a) * innerR);
      ctx.lineTo(ex + Math.cos(a) * outerR, ey + Math.sin(a) * outerR);
    }
    ctx.stroke();
  }

  ctx.restore();
}
