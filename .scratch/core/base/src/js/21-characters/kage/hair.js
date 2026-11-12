/* ---- the spiky starburst (KAGE_HAIR, drawSpikeHair: Rem's since the hair swap) and drawKageHair (Rem's old back-swept wedge) ---- */
// tip / valley pairs in head units (+x the face side); the last points close the hairline from the nape to the brow
const KAGE_HAIR = [[0.52, -0.5], [1.08, 0.02], [0.82, -0.56], [1.3, -0.5], [0.84, -0.86], [1.0, -1.36], [0.42, -1.06], [0.08, -1.8], [-0.02, -1.1],
  [-0.78, -1.74], [-0.5, -1.0], [-1.56, -1.36], [-0.88, -0.66], [-2.08, -0.66], [-1.02, -0.3], [-1.86, 0.2], [-0.96, 0.12], [-1.42, 0.7],
  [-0.78, 0.44], [-0.9, 1.0], [-0.44, 0.62]];

function kageHairPath(ctx, r) {
  const H = KAGE_HAIR;
  ctx.moveTo(H[0][0] * r, H[0][1] * r);
  for (let i = 1; i < H.length; i++) {
    const p = H[i], q = H[i - 1];
    // edges bow back and up so the spikes read swept, not a crown
    ctx.quadraticCurveTo((p[0] + q[0]) / 2 * r - 0.12 * r, (p[1] + q[1]) / 2 * r - 0.07 * r, p[0] * r, p[1] * r);
  }
  ctx.quadraticCurveTo(-0.2 * r, 0.2 * r, 0.05 * r, -0.2 * r);
  ctx.quadraticCurveTo(0.25 * r, -0.45 * r, H[0][0] * r, H[0][1] * r);
  ctx.closePath();
}

/* ---- the hair swap: Kage wears the back-swept wedge and fringe locks (REM_HAIR / REM_BANG, bosses/rem/hair.js), and
   Rem wears the spiky starburst (drawSpikeHair, below). Every place that draws Kage calls drawKageHair. ---- */
function drawKageHair(ctx, r, ink, flat, f) {
  const A = f && f._A;
  if (flat || !A || A.flat) {
    ctx.fillStyle = flat ? ink : A ? A.pal.hair[1] : ink;
    ctx.beginPath(); remHairPath(ctx, r); ctx.fill();
    ctx.beginPath(); orderShape(ctx, r, REM_BANG); ctx.fill();
    return;
  }
  const pal = A.pal, sv = _headLight(A, f);
  celFill(ctx, () => remHairPath(ctx, r), pal.hair, A, { sd: r * 0.3, hd: r * 0.06, rim: true, detail: (g) => {
    // lit strands combed back along the long points
    g.strokeStyle = pal.hair[2]; g.lineWidth = Math.max(0.8, r * 0.05); g.lineCap = 'round'; g.beginPath();
    for (const [x0, y0, cx, cy, x1, y1] of [[0.3, -0.86, 0.0, -1.0, -0.4, -1.32], [-0.1, -0.8, -0.6, -0.92, -1.1, -1.1], [-0.4, -0.6, -1.1, -0.66, -1.8, -0.76], [-0.5, -0.3, -1.2, -0.2, -1.8, -0.18], [0.4, -0.7, 0.44, -1.0, 0.46, -1.3]]) {
      g.moveTo(x0 * r, y0 * r); g.quadraticCurveTo(cx * r, cy * r, x1 * r, y1 * r);
    }
    g.stroke();
  } });
  // the fringe locks falling forward over the brow
  celFill(ctx, () => orderShape(ctx, r, REM_BANG), pal.hair, A, { sd: r * 0.12, hd: r * 0.04, rim: true });
  A.lx = sv[0]; A.ly = sv[1];
}

// the spiky starburst (now Rem's: bosses/rem/head.js)
function drawSpikeHair(ctx, r, ink, flat, f) {
  const A = f && f._A, pal = A && A.pal;
  if (flat || !A || A.flat) { ctx.fillStyle = flat ? ink : (pal ? pal.hair[1] : ink); ctx.beginPath(); kageHairPath(ctx, r); ctx.fill(); return; }
  // celFill works in the rotated head frame, so the light is turned into it too
  const sv = [A.lx, A.ly], hl = f.headRot || 0, c = Math.cos(-hl), sn = Math.sin(-hl);
  A.lx = (sv[0] * c - sv[1] * sn) * A.f; A.ly = sv[0] * sn + sv[1] * c;
  celFill(ctx, () => kageHairPath(ctx, r), pal.hair, A, { sd: r * 0.32, hd: r * 0.06, rim: true, detail: (g) => {
    // a few lit strands from the crown out along the upper spikes
    g.strokeStyle = pal.hair[2]; g.lineWidth = Math.max(0.8, r * 0.05); g.lineCap = 'round';
    g.beginPath();
    for (const [x0, y0, x1, y1, cx, cy] of [[0.2, -0.75, 1.1, -1.3, 0.7, -1.15], [0.0, -0.8, 0.26, -1.68, 0.05, -1.3], [-0.3, -0.72, -1.2, -1.32, -0.75, -1.15], [-0.4, -0.45, -1.75, -0.74, -1.1, -0.68], [0.35, -0.6, 1.3, -0.6, 0.85, -0.7]]) {
      g.moveTo(x0 * r, y0 * r); g.quadraticCurveTo(cx * r, cy * r, x1 * r, y1 * r);
    }
    g.stroke();
  } });
  A.lx = sv[0]; A.ly = sv[1];
}
