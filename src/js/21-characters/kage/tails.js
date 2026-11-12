/* ---- Kage's coat tails (kageBody): three panels of the coat hanging from the waist on cloth chains (kageCloths) —
   the long back tail, a second tail under it, and the front flap over the near thigh. The chain only gives the sweep:
   each panel is one smooth curve from the waist through the chain's middle to its end (so it never kinks or folds over
   itself), flared to the hem, the hem cut into sharp points. Inside: the crimson lining down the leading edge, two
   folds, and a crimson band with a fine line above it following the cut of the hem. ---- */
// width at the waist and at the hem (design px), how much of the width lies behind the curve, and the hem's points:
// [u along the tail (1 the chain's end), t across (0 the back edge, 1 the front)]
const KG_TAILS = {
  back: { w0: 16, w1: 40, bias: 0.66, tone: 'coat', hem: [[1.22, -0.02], [0.96, 0.36], [1.1, 0.52], [0.92, 0.78], [1.0, 1.0]] },
  under: { w0: 14, w1: 30, bias: 0.6, tone: 'coatFar', hem: [[1.16, 0], [0.95, 0.42], [1.06, 0.62], [0.94, 1.0]] },
  flap: { w0: 14, w1: 25, bias: 0.46, tone: 'coat', hem: [[1.16, 0], [0.98, 0.48], [0.9, 1.0]] }
};
const KG_TAIL_N = 7;

function _kgTail(f, ctx, K, part) {
  const cl = f.cloths.find(c => c.kind === 'ktail' && c.part === part && (!c.kageOnly || f.kageFrame));
  if (!cl || !cl.c.init) return;
  const D = KG_TAILS[part], s = K.s, fc = K.fc, c = cl.c, n = c.n, floorY = f.y - 1 * s, flat = K.A.flat, N = KG_TAIL_N;
  // the curve: from the waist through the chain's middle link to its last, kept off the floor
  const mi = n >> 1, ax = c.px[0], ay = c.py[0], mx = c.px[mi], my = Math.min(c.py[mi], floorY - 6 * s), ex = c.px[n - 1], ey = Math.min(c.py[n - 1], floorY - 3 * s);
  const cx = 2 * mx - (ax + ex) / 2, cy = 2 * my - (ay + ey) / 2;
  // the two edges, B the back one and F the front one
  const B = [], F = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1), q = 1 - t;
    const x = q * q * ax + 2 * q * t * cx + t * t * ex, y = q * q * ay + 2 * q * t * cy + t * t * ey;
    let dx = 2 * q * (cx - ax) + 2 * t * (ex - cx), dy = 2 * q * (cy - ay) + 2 * t * (ey - cy); const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = lerp(D.w0, D.w1, Math.pow(t, 0.9)) * s, wb = w * D.bias, wf = w - wb;
    B.push([x - dy * wb * fc, Math.min(y + dx * wb * fc, floorY)]); F.push([x + dy * wf * fc, Math.min(y - dx * wf * fc, floorY)]);
  }
  // a point in the panel: u down it (past 1 runs on beyond the end), t across
  const at = (u, t) => {
    const r = u * (N - 1), i0 = clamp(Math.floor(r), 0, N - 2), k = r - i0;
    const bx = lerp(B[i0][0], B[i0 + 1][0], k), by = lerp(B[i0][1], B[i0 + 1][1], k), fx = lerp(F[i0][0], F[i0 + 1][0], k), fy = lerp(F[i0][1], F[i0 + 1][1], k);
    return [lerp(bx, fx, t), Math.min(lerp(by, fy, t), floorY + 2 * s)];
  };
  const H = D.hem.map(h => at(h[0], h[1]));
  const path = () => {
    ctx.moveTo(B[0][0], B[0][1]);
    for (let i = 1; i < N - 1; i++) ctx.quadraticCurveTo(B[i][0], B[i][1], (B[i][0] + B[i + 1][0]) / 2, (B[i][1] + B[i + 1][1]) / 2);
    for (const p of H) ctx.lineTo(p[0], p[1]);
    ctx.lineTo((F[N - 2][0] + F[N - 1][0]) / 2, (F[N - 2][1] + F[N - 1][1]) / 2);
    for (let i = N - 2; i > 0; i--) ctx.quadraticCurveTo(F[i][0], F[i][1], (F[i][0] + F[i - 1][0]) / 2, (F[i][1] + F[i - 1][1]) / 2);
    ctx.lineTo(F[0][0], F[0][1]); ctx.closePath();
  };
  const far = part === 'under', tone = KG[D.tone];
  _kgPart(ctx, K, path, tone, { sd: 7 * s, hd: far ? 0 : 1.2 * s, rim: !far, lw: far ? K.lwFar : K.lw, line: far ? KG.lineFar : KG.line, detail: flat ? null : (g) => {
    const red = far ? KG.redFar : KG.red;
    // the lining down the leading edge, widening to the hem
    g.fillStyle = red[0]; g.beginPath();
    for (let i = 0; i <= 8; i++) { const p = at(i / 8 * 1.3, 1.1); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
    for (let i = 8; i >= 0; i--) { const p = at(i / 8 * 1.3, 0.96 - 0.12 * (i / 8)); g.lineTo(p[0], p[1]); }
    g.closePath(); g.fill();
    // the hem: a crimson band following the cut of the hem, a fine line above it
    const up = at(0.5, 0.5), dn = at(1, 0.5);
    let ix = up[0] - dn[0], iy = up[1] - dn[1]; const il = Math.hypot(ix, iy) || 1; ix /= il; iy /= il;
    const hemLine = (off, col, w) => {
      g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'miter'; g.beginPath();
      const p0 = at(D.hem[0][0], -0.2); g.moveTo(p0[0] + ix * off, p0[1] + iy * off);
      for (const p of H) g.lineTo(p[0] + ix * off, p[1] + iy * off);
      const p1 = at(D.hem[D.hem.length - 1][0], 1.2); g.lineTo(p1[0] + ix * off, p1[1] + iy * off);
      g.stroke(); g.lineJoin = 'round';
    };
    hemLine(1.6 * s, red[1], 6.4 * s);
    if (far) return;
    hemLine(7.6 * s, red[1], 1 * s);
    for (const [t, c2] of [[0.3, tone[0]], [0.6, tone[2]]]) {
      g.strokeStyle = c2; g.lineWidth = 0.9 * s; g.beginPath();
      for (let i = 0; i <= 6; i++) { const p = at(0.06 + i / 6 * 0.62, t + Math.sin(i * 1.3 + t * 5) * 0.025); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
      g.stroke();
    }
    // the Kage diamond in silver on the back tail
    if (part === 'back') { const e = at(0.5, 0.42); kageEmblem(g, e[0], e[1], 4 * s, Math.atan2(-iy, -ix) + Math.PI / 4, KG.silver, KG.red[2], s); }
  } });
}
