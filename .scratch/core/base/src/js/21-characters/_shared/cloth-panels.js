/* ---- the coat panels (Kage): cloth chains from the waist, flared to the hem ---- */
const _cpL = new Float32Array(32), _cpR = new Float32Array(32);

function coatEdges(cl, w0, w1, floorY) {
  const c = cl.c, n = c.n, px = c.px, py = c.py;
  for (let i = 0; i < n; i++) {
    const a = i === 0 ? 0 : i - 1, b = i === n - 1 ? n - 1 : i + 1;
    let dx = px[b] - px[a], dy = py[b] - py[a]; const d = Math.sqrt(dx * dx + dy * dy) || 1; dx /= d; dy /= d;
    const u = i / (n - 1), w = (w0 + (w1 - w0) * Math.pow(u, 0.85)) * 0.5;
    _cpL[i * 2] = px[i] - dy * w; _cpL[i * 2 + 1] = Math.min(py[i] + dx * w, floorY);
    _cpR[i * 2] = px[i] + dy * w; _cpR[i * 2 + 1] = Math.min(py[i] - dx * w, floorY);
  }
  return n;
}

function coatPanelPath(ctx, n) {
  ctx.moveTo(_cpL[0], _cpL[1]);
  for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(_cpL[i * 2], _cpL[i * 2 + 1], (_cpL[i * 2] + _cpL[i * 2 + 2]) / 2, (_cpL[i * 2 + 1] + _cpL[i * 2 + 3]) / 2);
  ctx.lineTo(_cpL[(n - 1) * 2], _cpL[(n - 1) * 2 + 1]);
  // the hem: three ragged points for a battle-worn split coat with slight asymmetry
  const lx = _cpL[(n - 1) * 2], ly = _cpL[(n - 1) * 2 + 1], rx = _cpR[(n - 1) * 2], ry = _cpR[(n - 1) * 2 + 1];
  const tdx = _cpL[(n - 1) * 2] - _cpL[(n - 2) * 2], tdy = _cpL[(n - 1) * 2 + 1] - _cpL[(n - 2) * 2 + 1];
  const e1x = lx + (rx - lx) * 0.28 + tdx * 0.35, e1y = ly + (ry - ly) * 0.28 + tdy * 0.35;
  const e2x = (lx + rx) / 2 + tdx * 0.22, e2y = (ly + ry) / 2 + tdy * 0.22;
  const e3x = lx + (rx - lx) * 0.74 + tdx * 0.3, e3y = ly + (ry - ly) * 0.74 + tdy * 0.3;
  ctx.lineTo(e1x, e1y);
  ctx.lineTo(lx + (rx - lx) * 0.38, ly + (ry - ly) * 0.38);
  ctx.lineTo(e2x, e2y);
  ctx.lineTo(lx + (rx - lx) * 0.62, ly + (ry - ly) * 0.62);
  ctx.lineTo(e3x, e3y);
  ctx.lineTo(rx, ry);
  for (let i = n - 2; i > 0; i--) ctx.quadraticCurveTo(_cpR[i * 2], _cpR[i * 2 + 1], (_cpR[i * 2] + _cpR[i * 2 - 2]) / 2, (_cpR[i * 2 + 1] + _cpR[i * 2 - 1]) / 2);
  ctx.lineTo(_cpR[0], _cpR[1]);
  ctx.closePath();
}
