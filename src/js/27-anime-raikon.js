/* KAGE — Raikon, the Lightning Ascendant, as an anime samurai (anime redesign, ticket 08), from his key art
   (boss_raikon.webp, face_raikon.webp). A main boss, so drawn heavier and more layered than the sub-bosses, and
   top-heavy as STYLE.md asks:
     head      a wide black jingasa (about 4.5 head radii across) edged in a thick red band, ribbed, a tall red flame
               crest leaning back off its crown and a red tassel on a cord at each end of the brim. Under it the black
               face with WHITE eyes (the rule; his key art's red eyes become a faint red rim light round the sockets
               and along the underside of the brim)
     mantle    a big white fur mantle over the back shoulder and round the back of the neck, swept back in long tufts
     coat      a dark armoured coat: a lacquered breastplate of three lames with red lacing under a crossed collar
               piped red, two red cords crossed over the chest, a red obi with a dark belt and a large silver ring at
               the front, two red cords hanging from the ring; the coat's long skirts split front and back, a red band
               near their torn hem
     sode      a large round lacquered shoulder plate on the near arm, ringed red, with the red cloud crest (mitsudomoe)
     cloak     a long tattered cloak from the shoulders (cloth kind 'rcloak'): black, a crimson band near its torn hem,
               a fine red edge
     tachi     raikon_tachi, the crimson-lit odachi (drawWeaponShape 'odachi', unchanged)
   Hollow Raikon (hollow_raikon, echoOf raikon) is the same design under the Hollow treatment (23-anime-hollow.js): the
   deep near-black palette with a violet cast, violet for red, the fur gone ash, the crest burnt down to torn stubs, the
   brim broken at the back, cracks glowing violet in the hat and the sode, a cracked mask shard over one cheek, the cloak
   and coat skirts torn into more and longer points, frayed cuffs, one tassel gone; the glitch, ghost and ash dissolve of
   Fighter.draw sit on top.
   Raikon's look is keyed on bossLook (his id or echoOf), so the Raijin Kabuto Kage wins keeps its own trophy helm.
   The storm VFX (36-storm.js, 37-vfx-sheets.js) anchor on skeleton joints (wt, head, hip, fha), which nothing here
   moves. Drawing only: no joint, timer or gameplay field is touched, and no randomness is used. */

const RAI_RED = ['#4e080c', '#b3121b', '#ff4a3c'];           // the brim band, crest, cords, obi
const RAI_RED_H = ['#1e1638', '#4a3a86', '#9b8cff'];         // the echo's: violet
const RAI_LACQ = ['#050404', '#0d0a0a', '#251b1b'];          // the jingasa's black lacquer
const RAI_LACQ_H = ['#07060b', '#100d18', '#272236'];
const RAI_FUR = ['#8c8580', '#d6d0c8', '#f1ede6'];            // the mantle: warm white in shadow, never pure white
const RAI_FUR_H = ['#2e2a3a', '#585170', '#8a82a6'];          // ash
const RAI_PLATE = ['#070607', '#121012', '#2c2629'];          // lacquered plate (breastplate, sode)
const RAI_RING = ['#4a4c52', ANIME.silver, ANIME.silverHi];
const RAI_RING_H = ['#2a2732', '#55505f', '#7d778a'];
const RAI_CLOAK = ['#050303', '#0d0808', '#211313'];

/* ---- skins ---- */
ANIME_SKINS.raikon = { top: 'coat', feet: 'boot', sleeve: 1.08, kote: true, collar: false, cuff: false, sash: 'raikon', acc: '#c3161e', raikon: 'boss' };
ANIME_SKINS.hollow_raikon = { top: 'coat', feet: 'boot', sleeve: 1.08, kote: true, collar: false, cuff: false, sash: 'raikon', raikon: 'hollow',
  hollow: { fray: 1, robe: {} } };   // `hollow` gives the deep palette and frayed cuffs; the robes are his own (rcoat, rcloak)
const _raiH = (f) => animeSkin(f).raikon === 'hollow';
const _raiRed = (f) => (_raiH(f) ? RAI_RED_H : RAI_RED);

// cloth (from animeCloths): the tattered cloak from the shoulders, the coat's long skirts from the waist
function raikonCloths(f, sk) {
  if (!sk.raikon) return;
  const s = f.scale;
  [[10, 15, 1.3, 40, 4, 4], [10, 14, 3.9, 34, 8, 12], [9, 13.4, 5.2, 30, 12, 0], [9, 12.6, 2.2, 26, 2, 18]].forEach(([n, seg, ph, w, dy, dx], i) =>
    f.cloths.push({ kind: 'rcloak', c: new Cloth(n, seg * s, { ph, wind: 1100 + i * 170, grav: 1000, stiff: 1.95 }), at: 'neck', w: w * s, dy, dx }));
  f.cloths.push({ kind: 'rcoat', part: 'back', c: new Cloth(8, 11.6 * s, { ph: 2.2, wind: 1000, grav: 1050, stiff: 1.5, hang: 0.5 }), at: 'hip', dx: 6, dy: -4 });
  f.cloths.push({ kind: 'rcoat', part: 'flap', c: new Cloth(7, 11 * s, { ph: 4.7, wind: 240, grav: 1250, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });
}

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

/* ---- the coat's long skirts: split front and back, torn at the hem, a red band above the tear ---- */
function _raiSkirt(f, ctx, A, U, part) {
  const cl = f.cloths.find(c => c.kind === 'rcoat' && c.part === part);
  if (!cl || !cl.c.init) return;
  const back = part === 'back', hol = _raiH(f), red = _raiRed(f), pal = A.pal, floorY = f.y + 2 * A.s;
  const n = coatEdges(cl, (back ? 24 : 17) * U, (back ? 50 : 34) * U, floorY);
  const K = hol ? (back ? 6 : 5) : back ? 3 : 2, rag = (hol ? 10 : 6) * U;
  celFill(ctx, () => tornPanelPath(ctx, n, K, rag, back ? 0 : 3, floorY), back ? pal.coatB : pal.coat, A, { sd: (back ? 7 : 5) * U, hd: back ? 0 : 0.9 * U, rim: true, detail: (g) => {
    g.strokeStyle = back ? ANIME.cloth0 : pal.coat[0]; g.lineWidth = 1 * A.s; g.beginPath();
    for (const t of [0.3, 0.62, 0.85]) for (let i = 1; i < n; i++) { const x = lerp(_cpL[i * 2], _cpR[i * 2], t + Math.sin(i * 1.3 + t * 5) * 0.05), y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    // the red band above the hem and a thin line over it; the front opening piped red
    if (hol) g.setLineDash([6 * U, 3 * U, 2 * U, 3 * U]);
    _hemLine(g, n, 4.4 * U, back ? red[0] : red[1], 3 * U);
    _hemLine(g, n, 8.6 * U, back ? red[0] : red[1], 0.9 * U);
    g.setLineDash([]);
    const front = (_cpL[0] - _cpR[0]) * f.facing > 0 ? _cpL : _cpR;
    g.strokeStyle = back ? red[0] : red[1]; g.lineWidth = 1.6 * U; g.beginPath(); g.moveTo(front[2], front[3]);
    for (let i = 2; i < n; i++) g.lineTo(front[i * 2], front[i * 2 + 1]);
    g.stroke();
  } });
}

/* ---- the mitsudomoe: three red commas swirling round a centre ---- */
function raikonTomoe(g, x, y, R, rot, col) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col;
  for (let i = 0; i < 3; i++) {
    const a = i * TAU / 3, hx = Math.cos(a) * R * 0.4, hy = Math.sin(a) * R * 0.4, hr = R * 0.3;
    g.beginPath(); g.arc(hx, hy, hr, a - Math.PI * 0.5, a + Math.PI * 0.5, true);
    // the tail sweeps round the rim to the next head
    g.quadraticCurveTo(Math.cos(a + 1.3) * R * 1.1, Math.sin(a + 1.3) * R * 1.1, Math.cos(a + 2.1) * R * 0.95, Math.sin(a + 2.1) * R * 0.95);
    g.quadraticCurveTo(Math.cos(a + 1.2) * R * 0.78, Math.sin(a + 1.2) * R * 0.78, hx + Math.cos(a + Math.PI * 0.5) * hr, hy + Math.sin(a + Math.PI * 0.5) * hr);
    g.closePath(); g.fill();
  }
  g.restore();
}

/* ---- layers called from the body (21-anime-body.js) ---- */
function raikonLayer(f, ctx, A, skin, U, layer) {
  if (!skin.raikon) return;
  if (layer === 'back') { _raiCloak(f, ctx, A); _raiSkirt(f, ctx, A, U, 'back'); }
  else if (layer === 'front') _raiSkirt(f, ctx, A, U, 'flap');
  else if (layer === 'waist') _raiSash(f, ctx, A, A.S, U);
}
// the red obi, a dark belt over it, the large silver ring at the front and two red cords hanging from it
function _raiSash(f, ctx, A, S, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)], hol = _raiH(f), red = _raiRed(f), t = f.time || 0;
  const band = (u0, u1, w0, w1) => { const a = P(u0, -w0), b = P(u0, w1), c = P(u1, w1), d = P(u1, -w0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  celFill(ctx, () => band(0.0, 0.2, 13, 12.2), red, A, { sd: 4 * U, hd: 0.8 * U, detail: (g) => {
    g.strokeStyle = red[0]; g.lineWidth = 0.9 * A.s; g.beginPath();
    for (const u of [0.05, 0.155]) { const a = P(u, -13), b = P(u + 0.02, 12.2); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  } });
  celFill(ctx, () => band(0.085, 0.13, 13.2, 12.6), [ANIME.cloth0, '#120d0c', '#2e2421'], A, { sd: 1 * U });
  // the cords: from the ring down the front of the skirt, swaying a little, a knot and a short tassel at each end
  const ring = P(0.1, 9.4), dn = [-S.ux, -S.uy];
  for (const [ox, len, ph] of [[-1.6, 17, 0], [1.4, 13, 1.7]]) {
    if (hol && ox > 0) continue;   // the echo's second cord is gone
    const sw = Math.sin(t * 2.1 + ph) * 1.2 * U, a = { x: ring[0] + S.nx * ox * U, y: ring[1] + S.ny * ox * U };
    const b = { x: a.x + dn[0] * len * U + S.nx * sw, y: a.y + dn[1] * len * U + S.ny * sw };
    celFill(ctx, () => animeCapsule(ctx, a, b, 0.9 * U, 0.9 * U, 0, 0.5), red, A, { sd: 0.6 * U, seam: false });
    const tl = { x: b.x + dn[0] * 4.6 * U, y: b.y + dn[1] * 4.6 * U };
    celFill(ctx, () => animeCapsule(ctx, b, tl, 1.4 * U, 2 * U, 0, 0.5), red, A, { sd: 0.8 * U, hd: 0.4 * U });
  }
  // the ring
  const R = 4.4 * U, rt = hol ? RAI_RING_H : RAI_RING;
  celFill(ctx, () => { ctx.moveTo(ring[0] + R, ring[1]); ctx.arc(ring[0], ring[1], R, 0, TAU); ctx.moveTo(ring[0] + R * 0.62, ring[1]); ctx.arc(ring[0], ring[1], R * 0.62, 0, TAU, true); }, rt, A, { sd: R * 0.3, hd: R * 0.16 });
}
// the shoulder plates (called from animeArm): the great round sode on the near arm with the red ring and the cloud
// crest, a plainer one on the far arm (mostly under the fur)
function raikonSode(f, ctx, sh, el, A, U, far) {
  const skin = animeSkin(f); if (!skin.raikon) return;
  const S = A.S, hol = _raiH(f), red = _raiRed(f);
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  // the plate hangs from the shoulder, down the arm and a little back
  const R = (far ? 9.5 : 12) * U, cx = sh.x + ax * R * 0.5 - S.ux * 1.5 * U, cy = sh.y + ay * R * 0.5 - S.uy * 1.5 * U, rot = Math.atan2(ay, ax);
  const tone = far ? [ANIME.face, RAI_PLATE[0], RAI_PLATE[1]] : hol ? RAI_LACQ_H : RAI_PLATE;
  celFill(ctx, () => { ctx.moveTo(cx + R, cy); ctx.ellipse(cx, cy, R * 1.04, R * 0.94, rot, 0, TAU); }, tone, A, { sd: 3.4 * U, hd: far ? 0 : 1.2 * U, rim: true, detail: far ? null : (g) => {
    // a raised rim, the red ring inside it, the crest at the centre
    g.strokeStyle = tone[2]; g.lineWidth = 1 * A.s; g.beginPath(); g.ellipse(cx - A.lx * 1.2 * U, cy - A.ly * 1.2 * U, R * 0.86, R * 0.78, rot, Math.PI * 0.9, Math.PI * 1.9); g.stroke();
    g.strokeStyle = ANIME.outline; g.lineWidth = 1.4 * A.s; g.beginPath(); g.ellipse(cx, cy, R * 0.84, R * 0.76, rot, 0, TAU); g.stroke();
    g.strokeStyle = red[1]; g.lineWidth = 1.8 * U; g.beginPath(); g.ellipse(cx, cy, R * 0.66, R * 0.6, rot, 0, TAU); g.stroke();
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = hol ? 'rgba(120,96,220,0.35)' : 'rgba(255,40,40,0.3)'; g.lineWidth = 3.4 * U;
    g.beginPath(); g.ellipse(cx, cy, R * 0.66, R * 0.6, rot, 0, TAU); g.stroke(); g.globalCompositeOperation = 'source-over';
    raikonTomoe(g, cx, cy, R * 0.44, rot + (f.facing > 0 ? 0 : Math.PI), hol ? red[1] : red[2]);
    if (hol) hollowCrack(g, A, 1, [[cx - R * 0.9, cy - R * 0.2], [cx - R * 0.4, cy - R * 0.05], [cx - R * 0.2, cy + R * 0.4], [cx + R * 0.3, cy + R * 0.55]], 0.9 * U);
  } });
}

/* ---- the torso (drawArmor 'raikon_plate'): the fur mantle, the breastplate, collar and crossed cords ---- */
// the fur: a fan of long curled tufts round a root on the back of the shoulder, from straight up (behind the hat
// brim) round the back and down over the shoulder blade; [angle from the spine's up toward the back (rad), length U]
const RAI_FUR_TUFTS = [[-0.32, 16], [0.06, 23], [0.42, 28], [0.8, 24], [1.14, 31], [1.48, 26], [1.82, 28], [2.16, 21], [2.5, 16]];
const _rfur = new Float32Array(160);
function _raiFurPts(S, U, k) {
  // root on the back of the shoulder; returns n points [tip, valley, tip, ...] in _rfur
  const cx = spX(S, 0.94, -5 * U), cy = spY(S, 0.94, -5 * U), T = RAI_FUR_TUFTS, n = T.length;
  const dir = (a) => [S.ux * Math.cos(a) - S.nx * Math.sin(a), S.uy * Math.cos(a) - S.ny * Math.sin(a)];
  let i = 0;
  for (let j = 0; j < n; j++) {
    const [a, len] = T[j], d = dir(a + 0.12), v = dir(j < n - 1 ? (a + T[j + 1][0]) / 2 : a + 0.2);
    _rfur[i++] = cx + d[0] * len * U * k; _rfur[i++] = cy + d[1] * len * U * k;
    const vl = (j < n - 1 ? Math.min(len, T[j + 1][1]) : len) * (j % 2 ? 0.6 : 0.68) * U * k;
    _rfur[i++] = cx + v[0] * vl; _rfur[i++] = cy + v[1] * vl;
  }
  return n * 2;
}
function _raiFurPath(ctx, S, U, k, f) {
  const m = _raiFurPts(S, U, k), cx = spX(S, 0.94, -5 * U), cy = spY(S, 0.94, -5 * U);
  // the near edge: from the front of the neck to the first tuft
  const a0 = [spX(S, 1.02, 4 * U), spY(S, 1.02, 4 * U)], z = [spX(S, 0.66, 2 * U), spY(S, 0.66, 2 * U)];
  ctx.moveTo(a0[0], a0[1]);
  let px = a0[0], py = a0[1];
  for (let i = 0; i < m; i++) {
    const x = _rfur[i * 2], y = _rfur[i * 2 + 1];
    // each edge bows sideways (the tufts curl back), sharper toward the tips
    const mx = (px + x) / 2, my = (py + y) / 2, ex = (x - px) * f, ey = (y - py) * f, b = i % 2 ? -0.16 : 0.24;
    ctx.quadraticCurveTo(mx - ey * b, my + ex * b, x, y);
    px = x; py = y;
  }
  ctx.quadraticCurveTo((px + z[0]) / 2, (py + z[1]) / 2, z[0], z[1]);
  ctx.quadraticCurveTo(cx, cy, a0[0], a0[1]);
  ctx.closePath();
}
function drawRaikonArmor(ctx, f, ink, flat) {
  const A = f._A;
  if (!A || !A.S) { torsoShape(ctx, f.sk.hip, f.sk.neck, f.facing, f.build.w * f.scale * 0.6); return; }
  const S = A.S, U = A.U, P = _sP(S, U), hol = _raiH(f), red = _raiRed(f), pal = A.pal;
  // the breastplate: three lacquered lames laced red, clipped to the coat's torso
  if (!A.flat) {
    ctx.save(); ctx.beginPath(); animeTorso(ctx, S, ANIME_TORSO.coat, U); ctx.clip();
    const top = (u) => [P(u, -12), P(u, 13.6)];
    const plate = (u0, u1, k) => { const [a0, a1] = top(u0), [b0, b1] = top(u1); _quad(ctx, a0, a1, b1, b0, 1.2 * U * k); };
    for (const [u0, u1] of [[0.62, 0.86], [0.44, 0.64], [0.26, 0.46]]) {
      const [a0, a1] = top(u0), [b0, b1] = top(u1);
      const Q = (k, t) => [lerp(lerp(a0[0], a1[0], k), lerp(b0[0], b1[0], k), t), lerp(lerp(a0[1], a1[1], k), lerp(b0[1], b1[1], k), t)];
      celFill(ctx, () => plate(u0, u1, 1), hol ? RAI_LACQ_H : RAI_PLATE, A, { sd: 2.6 * U, hd: 0.9 * U, detail: (g) => _lace(g, A, Q, 1, 6, RAI_PLATE, 1 * U, red[0]) });
    }
    // the crossed collar of the coat over the plate, piped red
    const lap = () => { const a = P(1.1, -1), b = P(0.62, 10.5), c = P(0.56, 14), d = P(1.1, 6); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
    celFill(ctx, lap, pal.coat, A, { sd: 1.4 * U, hd: 0.6 * U, detail: (g) => _strokePts(g, [P(1.1, 0.8), P(0.62, 11.6)], red[1], 1.1 * U) });
    // the cords crossed over the chest, from each shoulder down to the obi
    for (const [a, b, k] of [[P(1.0, -11), P(0.2, 11), 0], [P(1.02, 9), P(0.22, -8), 1]]) {
      const pa = { x: a[0], y: a[1] }, pb = { x: b[0], y: b[1] };
      celFill(ctx, () => animeCapsule(ctx, pa, pb, 1.3 * U, 1.3 * U, 0, 0.5), k ? red : [red[0], red[0], red[1]], A, { sd: 0.8 * U, hd: 0.4 * U, seam: !!k });
    }
    ctx.restore();
  }
  // the fur mantle round the nape and over the back shoulder
  const ft = hol ? RAI_FUR_H : RAI_FUR;
  // a second, darker layer of tufts behind, so the mantle reads thick
  celFill(ctx, () => { ctx.save(); const cx = spX(S, 0.94, -5 * U), cy = spY(S, 0.94, -5 * U); ctx.translate(cx, cy); ctx.rotate(-0.2 * f.facing); ctx.translate(-cx, -cy); _raiFurPath(ctx, S, U, 0.86, f.facing); ctx.restore(); },
    [ft[0], ft[0], ft[1]], A, { sd: 2 * U, rim: true });
  celFill(ctx, () => _raiFurPath(ctx, S, U, 1, f.facing), ft, A, { sd: 4.6 * U, hd: 1.2 * U, rim: true, detail: (g) => {
    // strands combed out along each tuft from the root
    const m = _raiFurPts(S, U, 0.8), cx = spX(S, 0.94, -5 * U), cy = spY(S, 0.94, -5 * U);
    g.lineCap = 'round'; g.lineWidth = 0.9 * A.s; g.strokeStyle = ft[0]; g.beginPath();
    for (let i = 0; i < m; i += 2) { const x = _rfur[i * 2], y = _rfur[i * 2 + 1]; g.moveTo(lerp(cx, x, 0.3), lerp(cy, y, 0.3)); g.quadraticCurveTo(lerp(cx, x, 0.6) + (y - cy) * 0.08, lerp(cy, y, 0.6) - (x - cx) * 0.08, x, y); }
    g.stroke();
    if (hol) { g.fillStyle = ANIME.face; const p = _hsp(S, U, [[0.9, -12, 1], [0.8, -15, 1], [0.84, -11, 1], [0.74, -9, 1]]); g.beginPath(); orderShape(g, 1, p); g.fill(); }
  } });
  void ink; void flat;
}

/* ---- the head (drawHelmet 'raijin_kabuto' on Raikon): the jingasa, its crest and tassels, the red rim light ---- */
// the hat's lacquered cone: brim tips back and front, the apex a little back of centre (head frame, +x the face side)
const RAI_HAT = [[-2.3, -0.62, 1], [-0.08, -1.56, 1], [2.26, -0.22, 1], [1.1, -0.26], [0, -0.38], [-1.2, -0.52]];
const RAI_HAT_H = [[-1.86, -0.78, 1], [-2.14, -0.6, 1], [-1.66, -0.5, 1], [-1.9, -0.92, 1], [-0.08, -1.56, 1], [2.26, -0.22, 1], [1.1, -0.26], [0, -0.38], [-1.2, -0.5, 1]];
// its red edge band along the brim
const RAI_BRIM = [[-2.34, -0.64, 1], [-1.2, -0.56], [0, -0.42], [1.1, -0.3], [2.3, -0.22, 1], [2.26, -0.06, 1], [1.1, -0.12], [0, -0.22], [-1.22, -0.38], [-2.3, -0.48, 1]];
const RAI_BRIM_H = [[-1.62, -0.52, 1], [-1.2, -0.54], [0, -0.42], [1.1, -0.3], [2.3, -0.22, 1], [2.26, -0.06, 1], [1.1, -0.12], [0, -0.22], [-1.22, -0.36, 1], [-1.5, -0.34, 1], [-1.4, -0.44, 1]];
// the flame crest: long sharp tongues off the crown, leaning back
const RAI_CREST = [[-0.34, -1.4, 1], [-0.86, -2.14, 1], [-0.4, -1.86, 1], [-0.56, -2.74, 1], [-0.16, -2.04, 1], [-0.02, -3.06, 1], [0.12, -2.08, 1], [0.44, -2.62, 1], [0.28, -1.84, 1], [0.6, -2.0, 1], [0.24, -1.42, 1]];
const RAI_CREST_IN = [[-0.2, -1.5, 1], [-0.42, -2.3, 1], [-0.08, -1.9, 1], [0.0, -2.6, 1], [0.08, -1.9, 1], [0.3, -2.3, 1], [0.12, -1.5, 1]];
const RAI_CREST_H = [[-0.34, -1.4, 1], [-0.62, -1.86, 1], [-0.34, -1.72, 1], [-0.4, -2.06, 1], [-0.1, -1.8, 1], [0.02, -2.24, 1], [0.12, -1.76, 1], [0.38, -1.9, 1], [0.24, -1.42, 1]];
function drawRaikonHead(ctx, f, r, ink, flat) {
  const A = f && f._A, hol = f && _raiH(f), t = (f && f.time) || 0, r0 = r;
  r = r * 1.22;   // the jingasa and its crest are drawn larger than the head: top-heavy, as in the key art
  const hat = hol ? RAI_HAT_H : RAI_HAT, brim = hol ? RAI_BRIM_H : RAI_BRIM, crest = hol ? RAI_CREST_H : RAI_CREST;
  // the tassels: a cord from each brim tip, a knot, a red tassel; they sway a little (the echo has lost the back one)
  const tassels = (fill) => {
    for (const [bx, by, ph] of [[-2.2, -0.52, 0], [2.18, -0.16, 1.9]]) {
      if (hol && bx < 0) continue;
      const sw = Math.sin(t * 2.3 + ph) * r * 0.1, kx = bx * r + sw * 0.6, ky = by * r + r * 0.5;
      fill(() => animeCapsule(ctx, { x: bx * r, y: by * r }, { x: kx, y: ky }, r * 0.035, r * 0.035, 0, 0.5), 'cord');
      fill(() => { ctx.moveTo(kx + r * 0.09, ky); ctx.arc(kx, ky, r * 0.09, 0, TAU); }, 'knot');
      fill(() => { ctx.moveTo(kx - r * 0.07, ky + r * 0.06); ctx.lineTo(kx + r * 0.07, ky + r * 0.06); ctx.lineTo(kx + sw * 0.5 + r * 0.14, ky + r * 0.62); ctx.lineTo(kx + sw * 0.5 - r * 0.14, ky + r * 0.62); ctx.closePath(); }, 'tassel');
    }
  };
  if (flat || !A || A.flat) {
    ctx.fillStyle = flat ? ink : RAI_LACQ[1];
    for (const pts of [crest, hat, brim]) { ctx.beginPath(); orderShape(ctx, r, pts); ctx.fill(); }
    tassels((P) => { ctx.beginPath(); P(); ctx.fill(); });
    return;
  }
  const red = _raiRed(f), sv = _headLight(A, f);
  // the faint red rim light round the eye sockets (his key art's red eyes, kept as light under the white-eyes rule)
  ctx.save(); ctx.beginPath(); animeHeadPath(ctx, r0 * 0.9); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = hol ? 'rgba(120,90,230,0.16)' : 'rgba(255,36,28,0.17)'; ctx.beginPath(); ctx.ellipse(r0 * 0.62, r0 * 0.04, r0 * 0.48, r0 * 0.24, -0.08, 0, TAU); ctx.fill();
  ctx.fillStyle = hol ? 'rgba(120,90,230,0.12)' : 'rgba(255,36,28,0.12)'; ctx.beginPath(); ctx.ellipse(r0 * 0.3, -r0 * 0.36, r0 * 1.0, r0 * 0.18, 0.08, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; ctx.restore();
  // the crest behind the hat's crown
  celFill(ctx, () => orderShape(ctx, r, crest), hol ? RAI_FUR_H : red, A, { sd: r * 0.18, hd: r * 0.06, detail: hol ? (g) => hollowCrack(g, A, r, [[-0.3, -1.5], [-0.1, -1.7], [0.0, -1.62], [0.2, -1.86]], Math.max(0.6, r * 0.035)) : (g) => {
    g.fillStyle = '#ff8a74'; g.beginPath(); orderShape(g, r, RAI_CREST_IN); g.fill();
    g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,214,200,0.45)'; g.beginPath(); orderShape(g, r, [[-0.04, -1.6, 1], [0.0, -2.3, 1], [0.06, -1.6, 1]]); g.fill(); g.globalCompositeOperation = 'source-over';
  } });
  if (!hol) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,40,30,0.28)'; ctx.lineWidth = r * 0.16; ctx.lineJoin = 'round';
    ctx.beginPath(); orderShape(ctx, r, crest); ctx.stroke(); ctx.restore();
  }
  // the cone: black lacquer with ribs from the apex, the lit ridge toward the light
  const lq = hol ? RAI_LACQ_H : RAI_LACQ;
  celFill(ctx, () => orderShape(ctx, r, hat), lq, A, { sd: r * 0.22, hd: r * 0.05, rim: true, detail: (g) => {
    g.lineCap = 'round';
    for (const k of [-1.7, -0.95, -0.3, 0.45, 1.25]) {
      const x1 = k * r, y1 = (-0.5 + (k + 2.3) / 4.6 * 0.3) * r;
      g.strokeStyle = ANIME.outline; g.lineWidth = Math.max(0.8, r * 0.05); g.beginPath(); g.moveTo(-0.08 * r, -1.5 * r); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = lq[2]; g.lineWidth = Math.max(0.6, r * 0.025); g.beginPath(); g.moveTo(-0.08 * r + r * 0.05, -1.5 * r + r * 0.03); g.lineTo(x1 + r * 0.06, y1); g.stroke();
    }
    if (hol) hollowCrack(g, A, r, [[-1.6, -0.6], [-1.2, -0.9], [-0.9, -0.8], [-0.5, -1.2]], Math.max(0.7, r * 0.04));
  } });
  // the red band along the brim, glowing
  celFill(ctx, () => orderShape(ctx, r, brim), red, A, { sd: r * 0.06, hd: r * 0.04 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = hol ? 'rgba(130,100,240,0.32)' : 'rgba(255,40,30,0.34)'; ctx.lineWidth = r * 0.14;
  ctx.beginPath(); ctx.moveTo((hol ? -1.5 : -2.3) * r, -0.45 * r); ctx.quadraticCurveTo(0, -0.24 * r, 2.26 * r, -0.12 * r); ctx.stroke(); ctx.restore();
  tassels((P, kind) => celFill(ctx, P, kind === 'cord' ? [red[0], red[0], red[1]] : red, A, { sd: r * 0.05, hd: kind === 'tassel' ? r * 0.03 : 0, seam: kind !== 'cord' }));
  if (hol) _maskPiece(ctx, A, r0, [[0.28, -0.14, 1], [0.68, -0.18, 1], [0.62, 0.36, 1], [0.46, 0.62, 1], [0.3, 0.3, 1]], [[0.48, -0.14], [0.42, 0.16], [0.5, 0.42]], false);
  A.lx = sv[0]; A.ly = sv[1];
}
