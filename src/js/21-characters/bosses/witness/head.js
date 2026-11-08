/* ---- the head (drawHelmet 'witness_mask'): the crown of spikes, the masked black face's markings and white eyes ---- */
// the crown in head units (+x the face side): spikes swept up and back, a side spike framing the face, then the hairline
// back across the brow (it stays behind the eyes)
const WT_CROWN_PTS = [[0.6, -0.66, 1], [1.0, -1.5, 1], [0.45, -1.05, 1], [0.3, -2.55, 1], [0.04, -1.16, 1], [-0.5, -3.15, 1], [-0.42, -1.1, 1], [-1.34, -2.85, 1],
  [-0.82, -0.95, 1], [-2.15, -2.28, 1], [-1.06, -0.6, 1], [-2.8, -1.45, 1], [-1.16, -0.25, 1], [-2.75, -0.5, 1], [-1.1, 0.1, 1], [-2.2, 0.36, 1], [-1.0, 0.42, 1],
  [-1.45, 0.98, 1], [-0.58, 0.64, 1], [-0.12, 1.3, 1], [-0.06, 0.5, 1], [0.14, 1.02, 1], [0.08, 0.24, 1], [0.26, -0.42, 1]];

// the lit edges along the spikes (root, tip)
const WT_CROWN_LIT = [[[0.62, -0.8], [1.0, -1.5]], [[0.18, -1.2], [0.3, -2.55]], [[-0.3, -1.25], [-0.5, -3.15]], [[-0.7, -1.1], [-1.34, -2.85]], [[-1.0, -0.8], [-2.15, -2.28]],
  [[-1.12, -0.45], [-2.8, -1.45]], [[-1.12, -0.08], [-2.75, -0.5]], [[-1.04, 0.28], [-2.2, 0.36]], [[-0.7, 0.62], [-1.45, 0.98]], [[-0.1, 0.62], [-0.12, 1.3]]];

// the mask plate (head units): brow, cheek, the pointed chin, back along the jaw
const WT_MASK = [[0.14, -0.94, 1], [0.72, -0.88, 1], [1.0, -0.4, 1], [1.04, 0.2, 1], [0.86, 0.56, 1], [0.58, 1.1, 1], [0.32, 0.84, 1], [0.04, 0.52, 1], [0.0, -0.3, 1]];

function drawWitnessHead(ctx, f, r, ink, flat) {
  if (f && f.kageFrame) { drawKageHair(ctx, r, ink, flat, f); return; }   // the flicker: Kage's own hair (drawEyes adds his eyes)
  const A = f && f._A;
  if (flat || !A || A.flat) { ctx.fillStyle = flat ? ink : WT_CROWN[1]; ctx.beginPath(); orderShape(ctx, r, WT_CROWN_PTS); orderShape(ctx, r, WT_MASK); ctx.fill(); return; }
  const sv = _headLight(A, f), t = f.time || 0, fade = f.witFade();
  celFill(ctx, () => orderShape(ctx, r, WT_CROWN_PTS), WT_CROWN, A, { sd: r * 0.3, hd: r * 0.07, rim: true, detail: (g) => {
    g.lineCap = 'round';
    for (const [[x0, y0], [x1, y1]] of WT_CROWN_LIT) {
      g.strokeStyle = '#6c4bc4'; g.lineWidth = Math.max(0.8, r * 0.06); g.beginPath(); g.moveTo(x0 * r, y0 * r); g.quadraticCurveTo((x0 + x1) * 0.5 * r + r * 0.06, (y0 + y1) * 0.5 * r, x1 * r, y1 * r); g.stroke();
    }
    g.strokeStyle = WT_CRIM[1]; g.lineWidth = Math.max(0.6, r * 0.03); g.beginPath();
    for (const [[x0, y0], [x1, y1]] of [WT_CROWN_LIT[2], WT_CROWN_LIT[5]]) { g.moveTo(lerp(x0, x1, 0.2) * r, lerp(y0, y1, 0.2) * r); g.lineTo(lerp(x0, x1, 0.7) * r, lerp(y0, y1, 0.7) * r); }
    g.stroke();
  } });
  // violet edge light along the crown's top and back, additive
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.5 * fade; ctx.strokeStyle = '#7c4fe0'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.lineJoin = 'miter';
  ctx.beginPath(); for (let i = 1; i <= 17; i++) { const p = WT_CROWN_PTS[i]; i === 1 ? ctx.moveTo(p[0] * r, p[1] * r) : ctx.lineTo(p[0] * r, p[1] * r); } ctx.stroke(); ctx.restore();
  // the mask: a black plate over the face, angular at the cheek, its chin jutting to a point, rimmed lavender
  celFill(ctx, () => orderShape(ctx, r, WT_MASK), [ANIME.face, ANIME.face, '#15111f'], A, { sd: r * 0.12, hd: r * 0.05, detail: (g) => {
    g.strokeStyle = 'rgba(150,118,236,0.7)'; g.lineWidth = Math.max(0.8, r * 0.045); g.lineJoin = 'miter'; g.beginPath(); orderShape(g, r, WT_MASK); g.stroke();
  } });
  A.lx = sv[0]; A.ly = sv[1];
  if (f.eye === 'rgba(0,0,0,0)') return;
  // the mask's markings on the black face: the seam of the mask plate, sharp brow marks, violet tear lines
  const rf = r * 0.9, ey = rf * 0.06, hot = f.telegraph > 0;
  const squint = f.state === 'move' || f.state === 'ability' ? 0.6 : f.state === 'hit' || f.state === 'stun' ? 0.75 : 1;
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(120,92,200,0.55)'; ctx.lineWidth = Math.max(0.7, r * 0.035);
  ctx.beginPath(); ctx.moveTo(rf * 0.32, -rf * 0.92); ctx.quadraticCurveTo(rf * 0.18, rf * 0.2, rf * 0.42, rf * 1.02); ctx.stroke();
  ctx.strokeStyle = 'rgba(226,212,255,0.95)'; ctx.lineWidth = Math.max(1, r * 0.065);
  ctx.beginPath(); ctx.moveTo(rf * 0.86, ey - rf * 0.3); ctx.lineTo(rf * 0.5, ey - rf * 0.3); ctx.lineTo(rf * 0.2, ey - rf * 0.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rf * 1.0, ey - rf * 0.26); ctx.lineTo(rf * 0.88, ey - rf * 0.36); ctx.stroke();
  ctx.strokeStyle = 'rgba(167,123,255,0.9)'; ctx.lineWidth = Math.max(0.8, r * 0.045);
  ctx.beginPath(); ctx.moveTo(rf * 0.46, ey + rf * 0.2); ctx.lineTo(rf * 0.42, ey + rf * 0.56); ctx.moveTo(rf * 0.58, ey + rf * 0.2); ctx.lineTo(rf * 0.56, ey + rf * 0.42); ctx.stroke();
  // the eyes: large angular white shapes with a sharp upswept flick at the outer corner, a violet halo
  const eye = (x, y, w, h) => {
    ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h * 0.1);
    ctx.lineTo(x + w * 0.1, y - h * 0.62); ctx.lineTo(x - w * 0.62, y - h * 1.0);
    ctx.lineTo(x - w * 0.3, y + h * 0.3); ctx.quadraticCurveTo(x + w * 0.1, y + h * 0.62, x + w * 0.5, y + h * 0.1); ctx.closePath();
  };
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(167,123,255,${0.55 * fade + (hot ? 0.3 : 0)})`;
  ctx.beginPath(); ctx.ellipse(rf * 0.5, ey - rf * 0.06, rf * 0.46, rf * 0.3, -0.2, 0, TAU); ctx.fill();
  eye(rf * 0.5, ey, rf * 0.62, rf * 0.34 * squint); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = hot ? '#ffffff' : ANIME.eye;
  eye(rf * 0.5, ey, rf * 0.5, rf * 0.25 * squint); ctx.fill();
  eye(rf * 0.9, ey - rf * 0.03, rf * 0.16, rf * 0.18 * squint); ctx.fill();
  if (hot) { ctx.strokeStyle = '#a77bff'; ctx.lineWidth = 2; const fl = r * (1 + 0.3 * Math.sin(t * 50)), ex = rf * 0.5; ctx.beginPath(); ctx.moveTo(ex - fl, ey); ctx.lineTo(ex + fl, ey); ctx.moveTo(ex, ey - fl * 0.5); ctx.lineTo(ex, ey + fl * 0.5); ctx.stroke(); }
  ctx.restore();
}
