/* ---- the coat tails (cloth 'wcoat'): blade-shaped panels widening off the anchor to a point ---- */
const _wco = { l: new Float32Array(32), r: new Float32Array(32) };

function _wtTailPath(ctx, c, Lp, Rp, tx, ty, i0) {
  const n = c.n;
  ctx.moveTo(Lp[i0 * 2], Lp[i0 * 2 + 1]);
  for (let i = i0 + 1; i < n; i++) ctx.quadraticCurveTo(Lp[i * 2 - 2], Lp[i * 2 - 1], (Lp[i * 2 - 2] + Lp[i * 2]) / 2, (Lp[i * 2 - 1] + Lp[i * 2 + 1]) / 2);
  ctx.lineTo(tx, ty);
  for (let i = n - 1; i > i0; i--) ctx.quadraticCurveTo(Rp[i * 2], Rp[i * 2 + 1], (Rp[i * 2] + Rp[i * 2 - 2]) / 2, (Rp[i * 2 + 1] + Rp[i * 2 - 1]) / 2);
  ctx.lineTo(Rp[i0 * 2], Rp[i0 * 2 + 1]); ctx.closePath();
}

function _wtTails(f, ctx, A, depth) {
  const s = A.s, t = f.time || 0, fade = f.witFade();
  for (const cl of f.cloths) {
    if (cl.kind !== 'wcoat' || cl.depth !== depth || !cl.c.init) continue;
    const c = cl.c, n = c.n, px = c.px, py = c.py, Lp = _wco.l, Rp = _wco.r;
    for (let i = 0; i < n; i++) {
      const a = i === 0 ? 0 : i - 1, b = i === n - 1 ? n - 1 : i + 1;
      let dx = px[b] - px[a], dy = py[b] - py[a]; const d = Math.sqrt(dx * dx + dy * dy) || 1; dx /= d; dy /= d;
      const u = i / (n - 1), w = cl.w * 0.5 * Math.pow(Math.sin(Math.PI * (0.16 + 0.84 * u)), 0.7) * (1 + 0.1 * Math.sin(i * 2.1 + c.o.ph));
      Lp[i * 2] = px[i] - dy * w; Lp[i * 2 + 1] = py[i] + dx * w; Rp[i * 2] = px[i] + dy * w; Rp[i * 2 + 1] = py[i] - dx * w;
    }
    const tx = px[n - 1] + (px[n - 1] - px[n - 2]) * 1.1, ty = py[n - 1] + (py[n - 1] - py[n - 2]) * 1.1;
    const far = depth < 0 && cl.at === 'hip' && cl.w < 22 * s;
    celFill(ctx, () => _wtTailPath(ctx, c, Lp, Rp, tx, ty, 0), far ? WT_FAR : WT_COAT, A, { sd: cl.w * 0.3, hd: far ? 0 : 1 * s, rim: true, detail: (g) => {
      // violet light gathering toward the tip, in two cel steps (fading out while it comes apart)
      g.save(); g.globalAlpha *= fade;
      g.fillStyle = far ? '#1c0f3c' : '#24124c'; g.beginPath(); _wtTailPath(g, c, Lp, Rp, tx, ty, Math.floor(n * 0.5)); g.fill();
      g.fillStyle = far ? '#3a2276' : '#5a35b8'; g.beginPath(); _wtTailPath(g, c, Lp, Rp, tx, ty, Math.floor(n * 0.78)); g.fill();
      g.restore();
      // the crimson lining down the panel's lower edge, and a fold
      const lo = (Lp[(n >> 1) * 2 + 1] > Rp[(n >> 1) * 2 + 1]) ? Lp : Rp;
      g.strokeStyle = far ? WT_CRIM[0] : WT_CRIM[1]; g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(lo[2], lo[3]);
      for (let i = 2; i < n; i++) g.lineTo(lo[i * 2], lo[i * 2 + 1]);
      g.stroke();
      if (far) return;
      // the violet vein down the middle, zigzag, brightening toward the tip
      const pts = [];
      for (let i = 1; i < n; i++) { const z = (i % 2 ? 1 : -1) * 0.16, nx = Lp[i * 2] - Rp[i * 2], ny = Lp[i * 2 + 1] - Rp[i * 2 + 1]; pts.push([px[i] + nx * z, py[i] + ny * z]); }
      pts.push([lerp(px[n - 1], tx, 0.6), lerp(py[n - 1], ty, 0.6)]);
      g.save(); g.globalAlpha *= fade; _wtVein(g, pts, 1.1 * s, '#c9a8ff', 'rgba(167,123,255,0.9)'); g.restore();
      if (cl.rune) {
        const j = Math.round((n - 1) * 0.6), rx = px[j], ry = py[j], rr = cl.w * 0.24, glow = 0.7 + Math.sin(t * 2.4 + c.o.ph) * 0.3;
        g.save(); g.globalAlpha *= fade; g.strokeStyle = `rgba(255,120,200,${glow})`; g.lineWidth = 1.1 * s;
        g.beginPath(); g.arc(rx, ry, rr, 0, TAU); g.stroke();
        g.beginPath(); g.arc(rx, ry, rr * 0.62, 0, TAU); g.stroke();
        g.beginPath(); g.moveTo(rx, ry - rr * 0.55); g.lineTo(rx + rr * 0.45, ry + rr * 0.3); g.lineTo(rx - rr * 0.45, ry + rr * 0.3); g.closePath(); g.stroke();
        g.restore();
      }
    } });
  }
}
