// the half-mask over the lower face (clipped to the face): its top edge under the eyes, across the bridge
const AK_MASK_PTS = [[0.02, 0.16, 1], [0.5, 0.14], [1.1, 0.06, 1], [1.1, 1.2, 1], [0.0, 1.2, 1]];

function drawAkariHead(ctx, f, r, ink, flat) {
  const A = f && f._A;
  if (flat || !A || A.flat) {
    ctx.fillStyle = flat ? ink : AK_HAIR[1];
    ctx.beginPath(); orderShape(ctx, r, AK_HAIR_CAP); orderShape(ctx, r, AK_SIDE); ctx.fill();
    ctx.beginPath(); ctx.arc(-0.5 * r, -0.98 * r, 0.3 * r, 0, TAU); ctx.fill();
    return;
  }
  const hol = f.hollow, vio = _akV(f), t = f.time || 0, sv = _headLight(A, f), rf = r * 0.86;
  // the mask, clipped to the face, with two soft folds and a pink-lit top edge; the echo's cracked across
  ctx.save(); ctx.beginPath(); animeHeadPath(ctx, rf); ctx.clip();
  celFill(ctx, () => orderShape(ctx, r, AK_MASK_PTS), AK_MASK, A, { sd: r * 0.14, hd: r * 0.05, detail: (g) => {
    g.strokeStyle = AK_MASK[0]; g.lineWidth = Math.max(0.7, r * 0.04); g.beginPath();
    g.moveTo(0.3 * r, 0.4 * r); g.quadraticCurveTo(0.6 * r, 0.34 * r, 0.9 * r, 0.36 * r);
    g.moveTo(0.24 * r, 0.62 * r); g.quadraticCurveTo(0.5 * r, 0.56 * r, 0.8 * r, 0.62 * r); g.stroke();
    if (hol) hollowCrack(g, A, r, [[0.32, 0.2], [0.44, 0.42], [0.38, 0.6], [0.52, 0.86]], Math.max(0.6, r * 0.035));
  } });
  ctx.strokeStyle = vio[2]; ctx.globalAlpha *= 0.85; ctx.lineWidth = Math.max(0.8, r * 0.05); ctx.beginPath(); ctx.moveTo(0.04 * r, 0.16 * r); ctx.quadraticCurveTo(0.5 * r, 0.12 * r, 1.0 * r, 0.06 * r); ctx.stroke(); ctx.globalAlpha /= 0.85;
  ctx.restore();
  // the eyes: white almonds above the mask, a soft halo (pink-tinged; stronger on the echo), narrowed when striking
  if (f.eye !== 'rgba(0,0,0,0)') {
    const squint = f.state === 'move' || f.state === 'ability' ? 0.6 : f.state === 'hit' || f.state === 'stun' ? 0.75 : 1, hot = f.telegraph > 0;
    // one flat eye, a sharp scowling triangle (eyeCorners, _shared/eyes.js), no glow: a villain's glare
    const ex = 0.46 * r, ey = -0.02 * r;
    const [o, i2, b] = eyeCorners(ex, ey, r * 0.44, r * 0.24 * squint);
    ctx.save();
    // her key art: the eyes glow pink (a soft bloom, then a pale pink almond; white-hot while a move winds up)
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = hol ? 'rgba(200,120,160,0.3)' : 'rgba(255,60,160,0.45)';
    ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.42, r * 0.22, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.fillStyle = hot ? '#ffffff' : hol ? ANIME.eye : '#ff7cc0';
    ctx.beginPath(); ctx.moveTo(...o); ctx.lineTo(...i2); ctx.lineTo(...b); ctx.closePath(); ctx.fill();
    // the white-hot heart of the glow (the style's white eyes, kept inside the pink)
    if (!hot && !hol) { const [o2, i3, b2] = eyeCorners(ex, ey, r * 0.3, r * 0.13 * squint); ctx.fillStyle = ANIME.eye; ctx.beginPath(); ctx.moveTo(...o2); ctx.lineTo(...i3); ctx.lineTo(...b2); ctx.closePath(); ctx.fill(); }
    if (hot) { ctx.strokeStyle = f.eye; ctx.lineWidth = 2; const fl = r * (1 + 0.3 * Math.sin(t * 50)); ctx.beginPath(); ctx.moveTo(ex - fl, ey); ctx.lineTo(ex + fl, ey); ctx.moveTo(ex, ey - fl * 0.5); ctx.lineTo(ex, ey + fl * 0.5); ctx.stroke(); }
    ctx.restore();
  }
  // the hair over the crown, the fringe over the brow
  celFill(ctx, () => orderShape(ctx, r, AK_HAIR_CAP), AK_HAIR, A, { sd: r * 0.3, hd: r * 0.07, rim: true, detail: (g) => {
    // the pink sheen across the crown and a few lit strands into the fringe
    g.lineCap = 'round'; g.strokeStyle = '#923f6c'; g.lineWidth = Math.max(1, r * 0.09);
    g.beginPath(); g.moveTo(-0.72 * r, -0.84 * r); g.quadraticCurveTo(-0.1 * r, -1.14 * r, 0.56 * r, -0.94 * r); g.stroke();
    g.strokeStyle = AK_HAIR[2]; g.lineWidth = Math.max(0.7, r * 0.04); g.beginPath();
    for (const [x0, y0, x1, y1] of [[0.2, -0.9, 0.5, -0.3], [0.5, -0.92, 0.76, -0.34], [-0.1, -0.8, 0.18, -0.3], [-0.6, -0.6, -0.86, 0.3]]) { g.moveTo(x0 * r, y0 * r); g.quadraticCurveTo((x0 + x1) * 0.5 * r + 0.06 * r, (y0 + y1) * 0.5 * r, x1 * r, y1 * r); }
    g.stroke();
  } });
  // the side lock over the mask's edge
  celFill(ctx, () => orderShape(ctx, r, AK_SIDE), AK_HAIR, A, { sd: r * 0.1, hd: r * 0.05, detail: (g) => {
    g.strokeStyle = '#5a2a44'; g.lineWidth = Math.max(0.7, r * 0.04); g.beginPath(); g.moveTo(0.08 * r, -0.36 * r); g.quadraticCurveTo(0.16 * r, 0.1 * r, 0.18 * r, 0.76 * r); g.stroke();
  } });
  // the tie at the ponytail's root and the sakura ornament on it (the echo's ashen, a petal gone)
  celFill(ctx, () => { ctx.moveTo(-0.26 * r, -0.98 * r); ctx.ellipse(-0.5 * r, -0.98 * r, 0.24 * r, 0.18 * r, -0.5, 0, TAU); }, [vio[0], vio[0], vio[1]], A, { sd: r * 0.06 });
  const sk = hol ? AK_SAKURA_H : AK_SAKURA;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = hol ? 'rgba(180,100,140,0.12)' : 'rgba(255,130,200,0.16)';
  ctx.beginPath(); ctx.arc(-0.42 * r, -0.9 * r, 0.5 * r, 0, TAU); ctx.fill(); ctx.restore();
  drawSakura(ctx, -0.42 * r, -0.9 * r, 0.46 * r, 0.3, sk[0], null, hol ? 3 : -1);
  drawSakura(ctx, -0.44 * r, -0.92 * r, 0.4 * r, 0.3, sk[1], sk[2], hol ? 3 : -1);
  A.lx = sv[0]; A.ly = sv[1];
}
