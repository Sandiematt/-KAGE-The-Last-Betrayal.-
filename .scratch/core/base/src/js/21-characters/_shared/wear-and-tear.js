/* ---- helpers ---- */
// a glowing crack: a dark break, a soft violet bloom and a thin bright core; pts in units of k (head r, or 1 for px)
function hollowCrack(g, A, k, pts, w) {
  const path = () => { g.beginPath(); for (let i = 0; i < pts.length; i++) i ? g.lineTo(pts[i][0] * k, pts[i][1] * k) : g.moveTo(pts[i][0] * k, pts[i][1] * k); };
  g.lineJoin = 'miter'; g.lineCap = 'round';
  g.strokeStyle = ANIME.outline; g.lineWidth = w * 2.6; path(); g.stroke();
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = HOLLOW_GLOW; g.lineWidth = w * 3.2; path(); g.stroke();
  g.globalCompositeOperation = 'source-over';
  g.strokeStyle = A.pal.accHi; g.lineWidth = w; path(); g.stroke();
  g.lineJoin = 'round';
}

// spine-frame points [u, w(, sharp)] -> absolute points for orderShape(ctx, 1, pts)
function _hsp(S, U, pts) { return pts.map(p => [spX(S, p[0], p[1] * U), spY(S, p[0], p[1] * U), p[2]]); }

const HOLLOW_TEETH = [1, 0.34, 0.82, 0.16, 1.18, 0.5, 0.92, 0.26, 0.7];

// a robe panel from the cloth edges (coatEdges filled _cpL / _cpR): smooth sides, the hem torn into K uneven points
function tornPanelPath(ctx, n, K, rag, seed, floorY) {
  const L = _cpL, R = _cpR, e = (n - 1) * 2;
  ctx.moveTo(L[0], L[1]);
  for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(L[i * 2], L[i * 2 + 1], (L[i * 2] + L[i * 2 + 2]) / 2, (L[i * 2 + 1] + L[i * 2 + 3]) / 2);
  ctx.lineTo(L[e], L[e + 1]);
  let dx = (L[e] + R[e] - L[e - 2] - R[e - 2]) / 2, dy = (L[e + 1] + R[e + 1] - L[e - 1] - R[e - 1]) / 2; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  for (let k = 0; k < K; k++) {
    const t0 = (k + 0.5) / K, t1 = (k + 1) / K, d = HOLLOW_TEETH[(k + seed) % HOLLOW_TEETH.length] * rag;
    ctx.lineTo(lerp(L[e], R[e], t0) + dx * d, Math.min(lerp(L[e + 1], R[e + 1], t0) + dy * d, floorY));
    if (k < K - 1) ctx.lineTo(lerp(L[e], R[e], t1) - dx * rag * 0.22, Math.min(lerp(L[e + 1], R[e + 1], t1) - dy * rag * 0.22, floorY));
  }
  ctx.lineTo(R[e], R[e + 1]);
  for (let i = n - 2; i > 0; i--) ctx.quadraticCurveTo(R[i * 2], R[i * 2 + 1], (R[i * 2] + R[i * 2 - 2]) / 2, (R[i * 2 + 1] + R[i * 2 - 1]) / 2);
  ctx.lineTo(R[0], R[1]);
  ctx.closePath();
}

// a jagged tear in a panel: the dark layer behind showing through, a violet fray on its lower lip
function _tear(g, A, x, y, w, h, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = ANIME.face; g.beginPath();
  g.moveTo(-w, 0); g.lineTo(-w * 0.4, -h * 0.7); g.lineTo(0, -h * 0.2); g.lineTo(w * 0.5, -h); g.lineTo(w, 0.1 * h); g.lineTo(w * 0.2, h * 0.5); g.lineTo(-w * 0.3, h * 0.9); g.closePath(); g.fill();
  g.strokeStyle = A.pal.acc; g.lineWidth = Math.max(0.7, h * 0.18); g.beginPath(); g.moveTo(w, 0.1 * h); g.lineTo(w * 0.2, h * 0.5); g.lineTo(-w * 0.3, h * 0.9); g.stroke();
  g.restore();
}
