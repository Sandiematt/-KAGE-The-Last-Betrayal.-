// the band across the brow (head frame): a strip from the knot at the back of the head round to the brow
function remBandPath(ctx, r) {
  ctx.moveTo(-r * 1.04, -r * 0.56); ctx.quadraticCurveTo(0, -r * 0.58, r * 1.02, -r * 0.4);
  ctx.lineTo(r * 1.02, -r * 0.15); ctx.quadraticCurveTo(0, -r * 0.32, -r * 1.02, -r * 0.3); ctx.closePath();
}

function drawRemHead(ctx, f, r, ink, flat) {
  const A = f && f._A, sk = f && animeSkin(f), hol = sk && sk.rem === 'hollow';
  // the hair swap: Rem wears the spiky starburst (kage/hair.js: it turns the light into the head frame itself, so it
  // goes first); Kage wears Rem's old back-swept hair
  drawSpikeHair(ctx, r, ink, flat, f);
  if (flat || !A || A.flat) return;
  const pal = A.pal, sv = _headLight(A, f);
  // the band, wrapped round the head over the hair; the hollow one is torn through at the front
  const band = hol ? REM_BAND_H : REM_BAND;
  celFill(ctx, () => remBandPath(ctx, r), band, A, { sd: r * 0.1, hd: r * 0.04, detail: (g) => {
    g.strokeStyle = band[0]; g.lineWidth = Math.max(0.6, r * 0.035); g.beginPath();
    g.moveTo(-r * 0.7, -r * 0.42); g.quadraticCurveTo(-r * 0.1, -r * 0.46, r * 0.5, -r * 0.34); g.stroke();
    if (hol) {
      g.fillStyle = ANIME.face; g.beginPath(); g.moveTo(r * 0.5, -r * 0.6); g.lineTo(r * 0.62, -r * 0.4); g.lineTo(r * 0.54, -r * 0.18); g.lineTo(r * 0.72, -r * 0.18); g.lineTo(r * 0.78, -r * 0.6); g.closePath(); g.fill();
      g.strokeStyle = pal.acc; g.lineWidth = Math.max(0.6, r * 0.04); g.beginPath(); g.moveTo(r * 0.5, -r * 0.6); g.lineTo(r * 0.62, -r * 0.4); g.lineTo(r * 0.54, -r * 0.18); g.stroke();
    }
  } });
  // the knot at the back of the head
  celFill(ctx, () => { ctx.moveTo(-r * 0.89, -r * 0.43); ctx.ellipse(-r * 1.04, -r * 0.43, r * 0.15, r * 0.2, 0.3, 0, TAU); }, band, A, { sd: r * 0.06 });
  // the silver ring on the band at the temple (tarnished on the echo), its hole showing the black of the head
  const rx = r * 0.1, ry = -r * 0.33, R = r * 0.19;
  celFill(ctx, () => { ctx.moveTo(rx + R, ry); ctx.arc(rx, ry, R, 0, TAU); ctx.moveTo(rx + R * 0.52, ry); ctx.arc(rx, ry, R * 0.52, 0, TAU, true); },
    hol ? ['#2a2732', '#55505f', '#7d778a'] : REM_RING, A, { sd: R * 0.4, hd: R * 0.2 });
  if (hol) _maskPiece(ctx, A, r, [[0.34, -0.12, 1], [0.66, -0.16, 1], [0.6, 0.38, 1], [0.44, 0.62, 1], [0.32, 0.3, 1]], [[0.5, -0.12], [0.44, 0.18], [0.52, 0.44]], false);
  A.lx = sv[0]; A.ly = sv[1];
}
