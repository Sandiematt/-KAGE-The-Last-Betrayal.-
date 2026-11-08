/* ---- her weapon: the sakura scythe (her key art, boss_akari.webp; the "front-facing blade" of her boss sheet). Drawn in
   place of Kagehira & Yūrei for her weapon id (akari_blades) only; the weapon's numbers, poses, reach and hitboxes are
   Kagehira & Yūrei's, unchanged, so this is drawing alone. The weapon frame: +x runs along the staff from her hand
   toward the head, +y is the blade side.
     staff     a long black-lacquered staff with a pink inlay line, pink fittings below the head and above the butt
     blade     one long crescent carried FORWARD off the head: it runs on past the end of the staff and hooks round
               toward the blade side, its tip pointing down and back like a reaper's, so the edge leads every swing
               and faces whoever she swings at; deep pink at the spine to a white-hot inner edge, a soft pink bloom
               round it, ornamental thorns curling off the spine and three rings along it
     flowers   a large sakura on the head where the blade meets the staff, a smaller one beside it, one at the butt
     ribbon    a pink bow tied under the head; its two tails and their tassels hang toward the ground and sway
     butt      a short leaf-shaped spike at the foot of the staff, a ribbon tail hanging from it
   The head (blade, thorns, rings, flowers, the counter-spike) also flies off on her chain (Chain Reap, Binding Chain:
   62b-akari-chain.js): opts.noHead draws the staff alone, drawAkariScytheHead the head alone.
   The silhouette passes (outline, impact frame, flat afterimages) draw the same outline in one colour. */

const AK_SCY = {
  staff: ['#030303', '#1b0c14', '#ff66b2'],                 // outline, lacquer, inlay
  blade: ['#a3155c', '#ff5fae', '#ffe3f0'],                 // spine side, body, edge side
  edge: '#fff4f9', spine: '#6e0f3e', glow: 'rgba(255,80,165,0.42)',
  ribbon: ['#b8256d', '#ff5fae', '#ffb8dc'],                // fold, body, light
  flower: ['#ff7ab8', '#fff0f6']
};
const AK_SCY_HEAD = 0.98;   // where the head sits along the staff, in units of L

// cubic bezier point and unit tangent at t (points as [x, y])
function _akBz(p0, p1, p2, p3, t) {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  const x = a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], y = a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1];
  const tx = 3 * (u * u * (p1[0] - p0[0]) + 2 * u * t * (p2[0] - p1[0]) + t * t * (p3[0] - p2[0]));
  const ty = 3 * (u * u * (p1[1] - p0[1]) + 2 * u * t * (p2[1] - p1[1]) + t * t * (p3[1] - p2[1]));
  const l = Math.hypot(tx, ty) || 1;
  return [x, y, tx / l, ty / l];
}

// the shapes, in units of L (the weapon length): the blade's spine (root -> tip, the outer convex side) and edge
// (tip -> root, the inner concave side); `hx` shifts the whole head along the staff (0: on the staff, as she holds it)
function _akScyShapes(L, hx) {
  const H = AK_SCY_HEAD + (hx || 0), P = (x, y) => [(H + x) * L, y * L];
  return {
    H: H * L, head: H * L, butt: -1.2 * L, kx: (H - 0.3) * L,
    spine: [P(-0.05, -0.08), P(0.74, -0.3), P(1.18, 0.36), P(0.86, 1.1)],
    edge: [P(0.86, 1.1), P(0.84, 0.5), P(0.52, 0.07), P(-0.06, 0.1)],
    // [x, y, R, rot] in units of L, about the head
    flowers: [[H + 0.04, -0.06, 0.16, 0.4], [H - 0.14, -0.14, 0.095, 1.2]],
    buttFlower: [-1.11, 0.06, 0.09, 2.1],
    beak: [[(H - 0.02) * L, -0.03 * L], [(H - 0.1) * L, -0.3 * L], [(H + 0.12) * L, -0.05 * L]]   // the counter-spike off the back of the head
  };
}
function _akScyBlade(ctx, S) {
  const a = S.spine, e = S.edge;
  ctx.moveTo(a[0][0], a[0][1]); ctx.bezierCurveTo(a[1][0], a[1][1], a[2][0], a[2][1], a[3][0], a[3][1]);
  ctx.bezierCurveTo(e[1][0], e[1][1], e[2][0], e[2][1], e[3][0], e[3][1]); ctx.closePath();
}
function _akScyBeak(ctx, S) { const b = S.beak; ctx.moveTo(b[0][0], b[0][1]); ctx.quadraticCurveTo(b[1][0] + (b[2][0] - b[1][0]) * 0.2, b[1][1] * 0.6, b[1][0], b[1][1]); ctx.quadraticCurveTo(b[2][0] - (b[2][0] - b[1][0]) * 0.3, b[1][1] * 0.5, b[2][0], b[2][1]); ctx.closePath(); }
// the leaf-shaped spike at the foot of the staff
function _akScyButt(ctx, L, s) {
  const x0 = -1.2 * L, x1 = -1.46 * L, w = 3.4 * s;
  ctx.moveTo(x0, -w); ctx.quadraticCurveTo(x0 - 0.12 * L, -w * 1.6, x1, 0); ctx.quadraticCurveTo(x0 - 0.12 * L, w * 1.6, x0, w); ctx.closePath();
}
// the thorns curling off the spine (outward, away from the edge)
function _akScyThorns(ctx, S, L) {
  const m = _akBz(...S.spine, 0.5), q = _akBz(...S.edge, 0.5);
  for (const [t, len] of [[0.2, 0.16], [0.36, 0.12], [0.5, 0.085]]) {
    const [x, y, tx, ty] = _akBz(...S.spine, t);
    let nx = -ty, ny = tx; if (nx * (m[0] - q[0]) + ny * (m[1] - q[1]) < 0) { nx = -nx; ny = -ny; }   // the spine's outer normal
    const w = 0.035 * L, h = len * L;
    ctx.moveTo(x - tx * w, y - ty * w);
    ctx.quadraticCurveTo(x + nx * h * 0.7 - tx * w * 0.2, y + ny * h * 0.7 - ty * w * 0.2, x + nx * h + tx * h * 0.55, y + ny * h + ty * h * 0.55);   // the curled point leans toward the tip
    ctx.quadraticCurveTo(x + nx * h * 0.35 + tx * w * 1.4, y + ny * h * 0.35 + ty * w * 1.4, x + tx * w * 1.6, y + ty * w * 1.6);
    ctx.closePath();
  }
}
// the bow under the head: two loops either side of the staff and the knot
function _akScyBow(ctx, kx, L) {
  for (const sg of [-1, 1]) {
    ctx.moveTo(kx, 0);
    ctx.bezierCurveTo(kx - 0.2 * L, sg * 0.06 * L, kx - 0.2 * L, sg * 0.3 * L, kx - 0.04 * L, sg * 0.28 * L);
    ctx.bezierCurveTo(kx + 0.1 * L, sg * 0.26 * L, kx + 0.08 * L, sg * 0.08 * L, kx, 0);
  }
}
// the world's down direction in the weapon frame (the ribbons hang toward the ground): undo the hand's rotation
// and the facing flip drawMainWeapon applied
function _akScyDown(f) {
  const a = f ? f.wAng || 0 : 0, fc = f && f.facing < 0 ? -1 : 1;
  return [Math.sin(a), Math.cos(a) * fc];
}
// a hanging ribbon tail from (x, y), `len` long, swaying; filled as a tapered strip with a tassel at the end
function _akScyTail(ctx, x, y, len, w, f, ph, flat, ink) {
  const [dx, dy] = _akScyDown(f), px = -dy, py = dx, t = f ? f.time || 0 : 0, N = 7, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const k = i / N, sw = Math.sin(t * 3.2 + ph + k * 3.6) * len * 0.16 * k, wd = w * (1 - k * 0.45);
    const cx = x + dx * len * k + px * sw, cy = y + dy * len * k + py * sw;
    L.push([cx + px * wd, cy + py * wd]); R.push([cx - px * wd, cy - py * wd]);
  }
  ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); for (const p of L) ctx.lineTo(p[0], p[1]); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath();
  ctx.fillStyle = flat ? ink : AK_SCY.ribbon[1]; ctx.fill();
  const ex = (L[N][0] + R[N][0]) / 2, ey = (L[N][1] + R[N][1]) / 2;
  if (!flat) {
    ctx.strokeStyle = AK_SCY.ribbon[0]; ctx.lineWidth = Math.max(0.6, w * 0.35); ctx.beginPath();
    for (let i = 1; i < N; i++) { const mx = (L[i][0] * 0.35 + R[i][0] * 0.65), my = (L[i][1] * 0.35 + R[i][1] * 0.65); i === 1 ? ctx.moveTo(mx, my) : ctx.lineTo(mx, my); }
    ctx.stroke();
  }
  // the tassel: a cord knot and a short fringe
  ctx.fillStyle = flat ? ink : AK_SCY.ribbon[0]; ctx.beginPath(); ctx.arc(ex, ey, w * 0.8, 0, TAU); ctx.fill();
  ctx.strokeStyle = flat ? ink : AK_SCY.ribbon[1]; ctx.lineWidth = Math.max(0.6, w * 0.4); ctx.beginPath();
  for (const o of [-0.7, 0, 0.7]) { ctx.moveTo(ex + px * w * o, ey + py * w * o); ctx.lineTo(ex + dx * w * 3 + px * w * o * 1.4, ey + dy * w * 3 + py * w * o * 1.4); }
  ctx.stroke();
}

// the head of the scythe: the blade with its bloom, edge, spine line, thorns and rings, the counter-spike and the
// flowers on the head (S from _akScyShapes); `glow` adds the additive bloom
function _akScyDrawHead(ctx, S, L, s, glow) {
  const C3 = AK_SCY, sp = S.spine, ed = S.edge;
  if (glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = C3.glow; ctx.lineWidth = 6 * s;
    ctx.beginPath(); _akScyBlade(ctx, S); ctx.stroke(); ctx.restore(); }
  // the thorns behind the blade (their roots tuck under its spine)
  ctx.beginPath(); _akScyThorns(ctx, S, L); ctx.fillStyle = C3.blade[1]; ctx.fill(); ctx.strokeStyle = C3.staff[0]; ctx.lineWidth = 1 * s; ctx.stroke();
  // the one curved blade: deep pink at the spine to a pale edge, outlined in ink
  const m0 = _akBz(...sp, 0.5), m1 = _akBz(...ed, 0.5), g = ctx.createLinearGradient(m0[0], m0[1], m1[0], m1[1]);
  g.addColorStop(0, C3.blade[0]); g.addColorStop(0.5, C3.blade[1]); g.addColorStop(1, C3.blade[2]);
  ctx.beginPath(); _akScyBlade(ctx, S); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = C3.staff[0]; ctx.lineWidth = 1.1 * s; ctx.stroke();
  // the white-hot cutting edge, the dark spine line
  ctx.strokeStyle = C3.edge; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(ed[0][0], ed[0][1]); ctx.bezierCurveTo(ed[1][0], ed[1][1], ed[2][0], ed[2][1], ed[3][0], ed[3][1]); ctx.stroke();
  ctx.strokeStyle = C3.spine; ctx.lineWidth = 0.9 * s; ctx.beginPath();
  for (let i = 0; i <= 10; i++) { const p = _akBz(...sp, 0.04 + i * 0.075), q = _akBz(...ed, 0.96 - i * 0.075); const x = lerp(p[0], q[0], 0.22), y = lerp(p[1], q[1], 0.22); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  // the three rings along the spine
  for (const t of [0.3, 0.42, 0.54]) {
    const p = _akBz(...sp, t), q = _akBz(...ed, 1 - t), x = lerp(p[0], q[0], 0.3), y = lerp(p[1], q[1], 0.3), r = 0.042 * L;
    ctx.fillStyle = C3.staff[1]; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = C3.blade[2]; ctx.lineWidth = 1.1 * s; ctx.stroke();
  }
  // the counter-spike off the back of the head
  ctx.beginPath(); _akScyBeak(ctx, S); ctx.fillStyle = C3.blade[1]; ctx.fill(); ctx.strokeStyle = C3.staff[0]; ctx.lineWidth = 1 * s; ctx.stroke();
  // the head's socket over the staff end, then the flowers on it
  ctx.fillStyle = C3.staff[0]; ctx.beginPath(); ctx.ellipse(S.H, 0.01 * L, 0.075 * L, 0.06 * L, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C3.blade[1]; ctx.beginPath(); ctx.ellipse(S.H, 0.01 * L, 0.055 * L, 0.042 * L, 0, 0, TAU); ctx.fill();
  for (const [x, y, R, rot] of S.flowers) {
    if (glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,120,190,0.25)'; ctx.beginPath(); ctx.arc(x * L, y * L, R * L * 1.5, 0, TAU); ctx.fill(); ctx.restore(); }
    drawSakura(ctx, x * L, y * L, R * L * 1.08, rot, C3.staff[0], null, -1);
    drawSakura(ctx, x * L, y * L, R * L, rot, C3.flower[0], C3.flower[1], -1);
  }
}

// opts.noTails / opts.noGlow: the WebGL sprite bake (64-akari-gl.js) leaves out the swaying tails and the 2D bloom;
// opts.noHead: the head is off on its chain (62b-akari-chain.js), only the staff is in her hands
function drawAkariScythe(ctx, L, s, f, opts) {
  const S = _akScyShapes(L), C3 = AK_SCY, o = opts || {}, end = o.noHead ? S.H - 0.06 * L : S.H;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // the staff: black lacquer, a pink inlay line, pink fittings under the head and above the butt
  ctx.strokeStyle = C3.staff[0]; ctx.lineWidth = 6.2 * s; ctx.beginPath(); ctx.moveTo(S.butt, 0); ctx.lineTo(end, 0); ctx.stroke();
  ctx.strokeStyle = C3.staff[1]; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(S.butt, 0); ctx.lineTo(end, 0); ctx.stroke();
  ctx.strokeStyle = C3.staff[2]; ctx.globalAlpha *= 0.85; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(S.butt + 0.05 * L, -1.1 * s); ctx.lineTo(end - 0.05 * L, -1.1 * s); ctx.stroke(); ctx.globalAlpha /= 0.85;
  ctx.lineCap = 'butt';
  for (const [x0, x1] of [[S.H / L - 0.2, S.H / L - 0.1], [-1.11, -1.05]]) {
    ctx.strokeStyle = C3.staff[0]; ctx.lineWidth = 7 * s; ctx.beginPath(); ctx.moveTo(x0 * L, 0); ctx.lineTo(x1 * L, 0); ctx.stroke();
    ctx.strokeStyle = C3.blade[1]; ctx.lineWidth = 5.4 * s; ctx.beginPath(); ctx.moveTo(x0 * L + 0.6 * s, 0); ctx.lineTo(x1 * L - 0.6 * s, 0); ctx.stroke();
  }
  ctx.lineCap = 'round';
  // the ribbon tails hang behind the bow (drawn first so the bow's knot sits over them)
  if (!o.noTails) drawAkariScytheTails(ctx, L, s, f);
  // with the head away, the chain's ring at the end of the staff
  if (o.noHead) { ctx.strokeStyle = C3.staff[0]; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.arc(end + 0.04 * L, 0, 0.04 * L, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C3.blade[1]; ctx.lineWidth = 1.3 * s; ctx.stroke(); }
  else _akScyDrawHead(ctx, S, L, s, !o.noGlow);
  // the butt spike
  ctx.beginPath(); _akScyButt(ctx, L, s); ctx.fillStyle = C3.blade[1]; ctx.fill(); ctx.strokeStyle = C3.staff[0]; ctx.lineWidth = 1 * s; ctx.stroke();
  ctx.strokeStyle = C3.edge; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(-1.25 * L, -0.6 * s); ctx.lineTo(-1.42 * L, 0); ctx.stroke();
  // the bow and its knot: open ribbon loops (a band of ribbon, not a filled shape): ink under, pink over, a pale light
  ctx.beginPath(); _akScyBow(ctx, S.kx, L); ctx.strokeStyle = C3.staff[0]; ctx.lineWidth = 4.4 * s; ctx.stroke();
  ctx.strokeStyle = C3.ribbon[1]; ctx.lineWidth = 2.8 * s; ctx.stroke(); ctx.strokeStyle = C3.ribbon[2]; ctx.lineWidth = 0.8 * s; ctx.stroke();
  ctx.fillStyle = C3.ribbon[2]; ctx.beginPath(); ctx.ellipse(S.kx, 0, 0.04 * L, 0.06 * L, 0, 0, TAU); ctx.fill();
  // the flower at the butt
  const [bx, by, bR, brot] = S.buttFlower;
  if (!o.noGlow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,120,190,0.25)'; ctx.beginPath(); ctx.arc(bx * L, by * L, bR * L * 1.5, 0, TAU); ctx.fill(); ctx.restore(); }
  drawSakura(ctx, bx * L, by * L, bR * L * 1.08, brot, C3.staff[0], null, -1);
  drawSakura(ctx, bx * L, by * L, bR * L, brot, C3.flower[0], C3.flower[1], -1);
}

// the head alone, flying on its chain: drawn about the socket (the origin), the staff's direction along +x
function drawAkariScytheHead(ctx, L, s) {
  const S = _akScyShapes(L, -AK_SCY_HEAD);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  _akScyDrawHead(ctx, S, L, s, true);
}

// the one-colour silhouette (outline pass, impact frame, flat afterimages); the rim pass gets the staff only
function drawAkariScytheFlat(ctx, L, s, ink, rim, f) {
  const S = _akScyShapes(L), noHead = !!(f && f.akChainOut);
  ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(S.butt, 0); ctx.lineTo(noHead ? S.H - 0.06 * L : S.H, 0); ctx.stroke();
  if (rim) return true;
  ctx.fillStyle = ink;
  ctx.beginPath(); if (!noHead) { _akScyBlade(ctx, S); _akScyThorns(ctx, S, L); _akScyBeak(ctx, S); } _akScyButt(ctx, L, s); ctx.fill();
  ctx.beginPath(); _akScyBow(ctx, S.kx, L); ctx.lineWidth = 4.4 * s; ctx.stroke();
  for (const [x, y, R, rot] of noHead ? [S.buttFlower] : S.flowers.concat([S.buttFlower])) drawSakura(ctx, x * L, y * L, R * L * 1.08, rot, ink, null, -1);
  _akScyTail(ctx, S.kx, 0.02 * L, 0.78 * L, 1.7 * s, f, 0, true, ink);
  _akScyTail(ctx, S.kx + 0.03 * L, 0.02 * L, 0.6 * L, 1.5 * s, f, 1.7, true, ink);
  _akScyTail(ctx, -1.15 * L, 0.02 * L, 0.42 * L, 1.3 * s, f, 3.1, true, ink);
  return true;
}

// the ribbon tails alone: they hang toward the ground and sway, so they stay vector over the WebGL sprite
function drawAkariScytheTails(ctx, L, s, f) {
  const kx = (AK_SCY_HEAD - 0.3) * L;
  _akScyTail(ctx, kx, 0.02 * L, 0.78 * L, 1.7 * s, f, 0, false);
  _akScyTail(ctx, kx + 0.03 * L, 0.02 * L, 0.6 * L, 1.5 * s, f, 1.7, false);
  _akScyTail(ctx, -1.15 * L, 0.02 * L, 0.42 * L, 1.3 * s, f, 3.1, false);
}

// her weapon id draws the scythe (main hand): the glowing WebGL sprite with vector ribbons, or all of it in 2D without
// WebGL; the off hand holds nothing (Fighter.drawOffhand skips it)
SUB_WEAPON_ART.akari_blades = function (ctx, sh, L, s, f) {
  if (sh === 'yurei') return true;
  if (f && f.akChainOut) drawAkariScythe(ctx, L, s, f, { noHead: true });   // the head is out on its chain
  else if (typeof AkariGL !== 'undefined' && AkariGL.drawScythe(ctx, L, s, f)) drawAkariScytheTails(ctx, L, s, f);
  else drawAkariScythe(ctx, L, s, f);
  return true;
};
SUBB_WEAPON_FLAT.akari_blades = function (ctx, L, s, ink, rim, f) { return drawAkariScytheFlat(ctx, L, s, ink, rim, f); };

// her blade trail follows the scythe's blade, not a short blade's: a band from mid-staff out past the blade's spine
const _akTrail = [];
function akariScytheTrail(arr) {
  _akTrail.length = arr.length;
  for (let i = 0; i < arr.length; i++) {
    const e = arr[i], o = _akTrail[i] || (_akTrail[i] = {});
    o.hx = e.hx; o.hy = e.hy; o.a = e.a; o.t = e.t; o.L = e.L * 1.9; o.b0 = 0.55;
  }
  return _akTrail;
}
