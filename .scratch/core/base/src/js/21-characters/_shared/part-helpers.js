// a plate: a quad (top edge a0-a1, bottom edge b1-b0) with edges bowed outward by `bow` px
function _quad(ctx, a0, a1, b1, b0, bow) {
  const bx = (p, q, k) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [(p[0] + q[0]) / 2 + dy / l * k, (p[1] + q[1]) / 2 - dx / l * k]; };
  const c1 = bx(a1, b1, bow), c2 = bx(b0, a0, bow), c3 = bx(b1, b0, bow * 0.6);
  ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]);
  ctx.quadraticCurveTo(c1[0], c1[1], b1[0], b1[1]);
  ctx.quadraticCurveTo(c3[0], c3[1], b0[0], b0[1]);
  ctx.quadraticCurveTo(c2[0], c2[1], a0[0], a0[1]);
  ctx.closePath();
}

// lames on a quad plate: dark seams across, a lit edge under each, and rows of crimson lacing (kebiki odoshi) below
function _odoshi(g, A, Q, rows, ticks, tone, lw) {
  const s = A.s, acc = A.pal.acc;
  for (let i = 0; i < rows; i++) {
    const t0 = i / rows, t1 = t0 + 0.42 / rows;
    g.strokeStyle = acc; g.lineWidth = lw || 1.1 * s; g.lineCap = 'butt'; g.beginPath();
    for (let j = 0; j < ticks; j++) { const k = (j + 0.5) / ticks, p = Q(k, t0 + 0.06 / rows), q = Q(k, t1); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
    g.stroke();
    if (i === 0) continue;
    const a = Q(-0.1, t0), b = Q(1.1, t0);
    g.lineCap = 'round';
    g.strokeStyle = tone[2]; g.lineWidth = 0.8 * s; g.beginPath(); g.moveTo(a[0] - A.lx * 1.2 * s, a[1] - A.ly * 1.2 * s); g.lineTo(b[0] - A.lx * 1.2 * s, b[1] - A.ly * 1.2 * s); g.stroke();
    g.strokeStyle = ANIME.outline; g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
  g.lineCap = 'round';
}

/* ---- helpers ---- */
const _sP = (S, U) => (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];

const _sPt = (S, U) => (u, w) => ({ x: spX(S, u, w * U), y: spY(S, u, w * U) });

function _poly(ctx, pts) { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }

function _strokePts(g, pts, col, w) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }

// lacing rows on a quad plate (as _odoshi in enemies/order/, with the wearer's accent)
function _lace(g, A, Q, rows, ticks, tone, lw, acc) {
  const s = A.s;
  for (let i = 0; i < rows; i++) {
    const t0 = i / rows, t1 = t0 + 0.42 / rows;
    g.strokeStyle = acc; g.lineWidth = lw; g.lineCap = 'butt'; g.beginPath();
    for (let j = 0; j < ticks; j++) { const k = (j + 0.5) / ticks, p = Q(k, t0 + 0.06 / rows), q = Q(k, t1); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
    g.stroke();
    if (i === 0) continue;
    const a = Q(-0.1, t0), b = Q(1.1, t0);
    g.lineCap = 'round';
    g.strokeStyle = tone[2]; g.lineWidth = 0.8 * s; g.beginPath(); g.moveTo(a[0] - A.lx * 1.2 * s, a[1] - A.ly * 1.2 * s); g.lineTo(b[0] - A.lx * 1.2 * s, b[1] - A.ly * 1.2 * s); g.stroke();
    g.strokeStyle = ANIME.outline; g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
  g.lineCap = 'round';
}

// a glowing bolt / scar: a dark break, an additive bloom in the accent and a bright core
function _bolt(g, pts, w, col) {
  const path = () => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); };
  g.lineJoin = 'miter'; g.lineCap = 'round';
  g.strokeStyle = ANIME.outline; g.lineWidth = w * 2.6; path(); g.stroke();
  g.globalCompositeOperation = 'lighter'; g.globalAlpha *= 0.45; g.strokeStyle = col; g.lineWidth = w * 3.4; path(); g.stroke(); g.globalAlpha /= 0.45;
  g.globalCompositeOperation = 'source-over';
  g.strokeStyle = col; g.lineWidth = w; path(); g.stroke();
  g.lineJoin = 'round';
}

// a quad from a hanging anchor: top centre `top`, hanging direction (dx, dy), length, widths -> [a0, a1, b1, b0, Q]
function _hang(top, dx, dy, len, w0, w1) {
  const nx = -dy, ny = dx;
  const a0 = [top[0] - nx * w0 / 2, top[1] - ny * w0 / 2], a1 = [top[0] + nx * w0 / 2, top[1] + ny * w0 / 2];
  const b1 = [top[0] + dx * len + nx * w1 / 2, top[1] + dy * len + ny * w1 / 2], b0 = [top[0] + dx * len - nx * w1 / 2, top[1] + dy * len - ny * w1 / 2];
  const Q = (k, t) => [lerp(lerp(a0[0], a1[0], k), lerp(b0[0], b1[0], k), t), lerp(lerp(a0[1], a1[1], k), lerp(b0[1], b1[1], k), t)];
  return [a0, a1, b1, b0, Q];
}

// the hem of a panel filled by coatEdges: a band `off` px in from the hem edge, drawn across the panel
function _hemLine(g, n, off, col, lw) {
  const lx = _cpL[(n - 1) * 2], ly = _cpL[(n - 1) * 2 + 1], rx = _cpR[(n - 1) * 2], ry = _cpR[(n - 1) * 2 + 1];
  const ux = lx - _cpL[(n - 2) * 2], uy = ly - _cpL[(n - 2) * 2 + 1], ul = Math.hypot(ux, uy) || 1, ox = ux / ul, oy = uy / ul;
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
  g.moveTo(lx - ox * off - (rx - lx) * 0.4, ly - oy * off - (ry - ly) * 0.4); g.lineTo(rx - ox * off + (rx - lx) * 0.4, ry - oy * off + (ry - ly) * 0.4); g.stroke();
}

function _panelFolds(g, n, col, lw, ts) {
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
  for (const t of ts) { for (let i = 1; i < n; i++) { const x = lerp(_cpL[i * 2], _cpR[i * 2], t + Math.sin(i * 1.3 + t * 5) * 0.05), y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); } }
  g.stroke();
}

// a point inside the panel: link i (fractional), t across (0 the left edge, 1 the right)
function _panelAt(n, i, t) {
  const i0 = Math.max(0, Math.min(n - 1, Math.floor(i))), k = i - i0, i1 = Math.min(n - 1, i0 + 1);
  return [lerp(lerp(_cpL[i0 * 2], _cpR[i0 * 2], t), lerp(_cpL[i1 * 2], _cpR[i1 * 2], t), k), lerp(lerp(_cpL[i0 * 2 + 1], _cpR[i0 * 2 + 1], t), lerp(_cpL[i1 * 2 + 1], _cpR[i1 * 2 + 1], t), k)];
}
