/* ---- helpers ---- */
// a cloth chain's two edges, width profile wf(u) (px, full width), into _akL / _akR
const _akL = new Float32Array(32), _akR = new Float32Array(32);

function _akEdges(c, wf, x0, y0) {
  const n = c.n, px = c.px, py = c.py;
  for (let i = 0; i < n; i++) {
    const a = i === 0 ? 0 : i - 1, b = i === n - 1 ? n - 1 : i + 1;
    let dx = px[b] - px[a], dy = py[b] - py[a]; const d = Math.sqrt(dx * dx + dy * dy) || 1; dx /= d; dy /= d;
    const w = wf(i / (n - 1)) * 0.5, x = i === 0 && x0 != null ? x0 : px[i], y = i === 0 && y0 != null ? y0 : py[i];
    _akL[i * 2] = x - dy * w; _akL[i * 2 + 1] = y + dx * w; _akR[i * 2] = x + dy * w; _akR[i * 2 + 1] = y - dx * w;
  }
  return n;
}

// a smooth strip along the edges with a pointed (V) end, or K torn teeth (the echo)
function _akStrip(ctx, n, c, vk, K, rag) {
  const L = _akL, R = _akR, e = (n - 1) * 2;
  ctx.moveTo(L[0], L[1]);
  for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(L[i * 2], L[i * 2 + 1], (L[i * 2] + L[i * 2 + 2]) / 2, (L[i * 2 + 1] + L[i * 2 + 3]) / 2);
  ctx.lineTo(L[e], L[e + 1]);
  const vx = c.px[n - 1] - c.px[n - 2], vy = c.py[n - 1] - c.py[n - 2], vl = Math.hypot(vx, vy) || 1;
  if (K) {
    for (let k = 0; k < K; k++) {
      const t0 = (k + 0.5) / K, t1 = (k + 1) / K, d = HOLLOW_TEETH[(k + 2) % HOLLOW_TEETH.length] * rag;
      ctx.lineTo(lerp(L[e], R[e], t0) + vx / vl * d, lerp(L[e + 1], R[e + 1], t0) + vy / vl * d);
      if (k < K - 1) ctx.lineTo(lerp(L[e], R[e], t1) - vx / vl * rag * 0.25, lerp(L[e + 1], R[e + 1], t1) - vy / vl * rag * 0.25);
    }
  } else {
    ctx.lineTo(L[e] + vx * vk, L[e + 1] + vy * vk); ctx.lineTo(c.px[n - 1] + vx * vk * 0.2, c.py[n - 1] + vy * vk * 0.2); ctx.lineTo(R[e] + vx * vk, R[e + 1] + vy * vk);
  }
  ctx.lineTo(R[e], R[e + 1]);
  for (let i = n - 2; i > 0; i--) ctx.quadraticCurveTo(R[i * 2], R[i * 2 + 1], (R[i * 2] + R[i * 2 - 2]) / 2, (R[i * 2 + 1] + R[i * 2 - 1]) / 2);
  ctx.lineTo(R[0], R[1]);
  ctx.closePath();
}
