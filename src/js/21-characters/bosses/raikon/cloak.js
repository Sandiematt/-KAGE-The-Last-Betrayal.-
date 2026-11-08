/* ---- the cloak: ragged panels from the shoulders, behind everything ---- */
const _rcl = new Float32Array(28), _rcr = new Float32Array(28);

function _raiCloakPath(ctx, cl, hol) {
  const c = cl.c, n = c.n, px = c.px, py = c.py;
  for (let i = 0; i < n; i++) {
    const a = i === 0 ? 0 : i - 1, b = i === n - 1 ? n - 1 : i + 1;
    let dx = px[b] - px[a], dy = py[b] - py[a]; const d = Math.sqrt(dx * dx + dy * dy) || 1; dx /= d; dy /= d;
    const u = i / (n - 1), tear = u > (hol ? 0.4 : 0.6) ? (i % 2 ? 1 : hol ? 0.4 : 0.66) : 1;   // the lower part torn into teeth
    const w = cl.w * 0.5 * (0.45 + 0.75 * Math.sin(Math.PI * (0.2 + 0.7 * u)));
    _rcl[i * 2] = px[i] - dy * w * tear; _rcl[i * 2 + 1] = py[i] + dx * w * tear;
    _rcr[i * 2] = px[i] + dy * w * (2 - tear) * 0.8; _rcr[i * 2 + 1] = py[i] - dx * w * (2 - tear) * 0.8;
  }
  const e = (n - 1) * 2, vx = px[n - 1] - px[n - 2], vy = py[n - 1] - py[n - 2], k = hol ? 1.6 : 1;
  ctx.moveTo(_rcl[0], _rcl[1]);
  for (let i = 1; i < n; i++) ctx.lineTo(_rcl[i * 2], _rcl[i * 2 + 1]);
  ctx.lineTo(_rcl[e] + vx * 0.9 * k, _rcl[e + 1] + vy * 0.9 * k); ctx.lineTo(px[n - 1] + vx * 0.25, py[n - 1] + vy * 0.25);
  ctx.lineTo(px[n - 1] + vx * 0.8 * k, py[n - 1] + vy * 0.8 * k); ctx.lineTo(_rcr[e] + vx * 0.2, _rcr[e + 1] + vy * 0.2);
  ctx.lineTo(_rcr[e] + vx * 1.1 * k, _rcr[e + 1] + vy * 1.1 * k);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(_rcr[i * 2], _rcr[i * 2 + 1]);
  ctx.closePath();
  return n;
}

function _raiCloak(f, ctx, A) {
  const hol = _raiH(f), red = _raiRed(f), U = A.U;
  let idx = 0;
  for (const cl of f.cloths) {
    if (cl.kind !== 'rcloak' || !cl.c.init) continue;
    const far = idx++ > 0;
    celFill(ctx, () => _raiCloakPath(ctx, cl, hol), hol ? A.pal.back : far ? [ANIME.face, RAI_CLOAK[0], RAI_CLOAK[1]] : RAI_CLOAK, A, { sd: 5 * U, hd: far ? 0 : 0.8 * U, rim: true, detail: (g) => {
      const n = cl.c.n;
      // folds down the panel
      g.strokeStyle = ANIME.face; g.lineWidth = 1 * A.s; g.beginPath();
      for (const t of [0.34, 0.66]) for (let i = 1; i < n - 1; i++) { const x = lerp(_rcl[i * 2], _rcr[i * 2], t), y = lerp(_rcl[i * 2 + 1], _rcr[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
      // the crimson band near the torn hem (the echo's is broken), and the red edge along the panel's outer side
      const i0 = Math.max(1, n - 3);
      g.strokeStyle = far ? red[0] : red[1]; g.lineWidth = 3.2 * U;
      if (hol) g.setLineDash([5 * U, 3 * U, 2 * U, 4 * U]);
      g.beginPath(); g.moveTo(_rcl[i0 * 2], _rcl[i0 * 2 + 1]); for (let i = i0; i < n; i++) g.lineTo(lerp(_rcl[i * 2], _rcr[i * 2], 0.02), lerp(_rcl[i * 2 + 1], _rcr[i * 2 + 1], 0.02));
      for (let i = n - 1; i >= i0; i--) g.lineTo(lerp(_rcl[i * 2], _rcr[i * 2], 0.98), lerp(_rcl[i * 2 + 1], _rcr[i * 2 + 1], 0.98));
      g.stroke(); g.setLineDash([]);
      g.strokeStyle = far ? red[0] : red[2]; g.lineWidth = 0.9 * A.s; g.globalAlpha *= far ? 0.6 : 0.8;
      g.beginPath(); g.moveTo(_rcl[2], _rcl[3]); for (let i = 2; i < n; i++) g.lineTo(_rcl[i * 2], _rcl[i * 2 + 1]); g.stroke();
      g.globalAlpha /= far ? 0.6 : 0.8;
    } });
  }
}
