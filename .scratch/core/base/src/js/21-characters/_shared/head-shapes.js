/* ---- path helpers ---- */
// a closed path through points in head units ([x, y, sharp?]); smooth corners by default, a sharp corner where flagged
function orderShape(ctx, r, pts) {
  const n = pts.length, X = (i) => pts[(i + n) % n][0] * r, Y = (i) => pts[(i + n) % n][1] * r, sharp = (i) => pts[(i + n) % n][2];
  if (sharp(0)) ctx.moveTo(X(0), Y(0)); else ctx.moveTo((X(-1) + X(0)) / 2, (Y(-1) + Y(0)) / 2);
  for (let i = sharp(0) ? 1 : 0; i < n; i++) {
    if (sharp(i)) ctx.lineTo(X(i), Y(i));
    else ctx.quadraticCurveTo(X(i), Y(i), (X(i) + X(i + 1)) / 2, (Y(i) + Y(i + 1)) / 2);
  }
  ctx.closePath();
}

// turn the camera light into the rotated, mirrored head frame (as drawKageHair does); returns the saved light
function _headLight(A, f) {
  const sv = [A.lx, A.ly], hl = f.headRot || 0, c = Math.cos(-hl), sn = Math.sin(-hl);
  A.lx = (sv[0] * c - sv[1] * sn) * A.f; A.ly = sv[0] * sn + sv[1] * c;
  return sv;
}

/* ---- heads (head frame: +x the face side, r the head radius) ---- */
// the eye holes of a mask: dark almonds round the eye positions drawEyes uses, so the white eyes glow through
function _eyeHoles(g, r) {
  const rf = r * 0.9, ey = rf * 0.08;
  g.fillStyle = ANIME.face;
  for (const [x, y, w, h] of [[rf * 0.48, ey, rf * 0.5, rf * 0.3], [rf * 0.88, ey - rf * 0.03, rf * 0.22, rf * 0.24]]) {
    g.beginPath(); g.moveTo(x + w * 0.55, y + h * 0.2);
    g.quadraticCurveTo(x + w * 0.05, y - h * 1.0, x - w * 0.55, y - h * 0.65);
    g.quadraticCurveTo(x - w * 0.05, y + h * 0.9, x + w * 0.55, y + h * 0.2); g.closePath(); g.fill();
  }
}

// a mask fragment: lacquer with a lit edge and the violet rim, eye holes the white eyes shine through, a glowing crack
function _maskPiece(ctx, A, r, pts, crack, holes, far) {
  celFill(ctx, () => orderShape(ctx, r, pts), far ? HOLLOW_MASK_FAR : HOLLOW_MASK, A, { sd: r * 0.2, hd: far ? 0 : r * 0.07, rim: true, detail: (g) => {
    if (holes) _eyeHoles(g, r);
    if (crack) hollowCrack(g, A, r, crack, Math.max(0.6, r * 0.035));
  } });
}
