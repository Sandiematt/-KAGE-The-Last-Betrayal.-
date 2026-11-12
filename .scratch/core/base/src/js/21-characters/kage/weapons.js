/* ---- Kage's seven shop weapons: their own drawings (the 2026-11-08 weapon redesign) ----
   Each blade takes one silhouette from the reference sheet (docs/art-reference/weapons-reference.png, numbered left to
   right, top row 1-6, bottom row 7-12) and is drawn here in the game's cel style: muted silver or dark iron flats, dark
   fittings, and ONE glowing edge line in the weapon's element colour (the colour its rage art is built from).

     kagetsu    #7  long katana with back-swept spine spikes and a moon-bite hook at the tip; bone-white grip, crescent
                    tsuba, crimson hamon and edge (Crimson Moon)
     tsubame    #2  twin fang daggers curving like a swallow's wing, swallow-tail pommels and wing guards, electric-cyan edge
     shizuka    #10 a slim needle katana with a winged, spiked guard, violet ridge light and a crescent pommel ring
     onikiri    #6  a squared greatblade with a serrated spine, a horned T-guard and crimson-hot cracks in the iron
     mizuchi    #12 a serpentine kris spearhead in a dragon-head collar on a lacquered, wave-banded shaft, blue tassel
     yamigama   #11 a deep crescent sickle on a ribbed bone hilt with a spur, violet-blood inner edge
     iwakudaki  #9  the hourglass profile as a war-hammer head: flared striking faces, gold rims and rune lines

   Called from drawWeaponShape (20-fighter.js) for the look `twinShape` gives these weapon ids (WEAPON_LOOK). Origin at
   the grip, +x along the blade, -y the spine side, +y the edge, as every other weapon shape. Modes: 'ink' (in the hand),
   'flat' (one colour: shadow, afterimage and silhouette passes), 'rim' (the outline pass: hilt only) and 'art' (the
   Armory illustration). When the wielder's rage is full the edge light pulses: the rage art is ready. Draw only. */
const WEAPON_LOOK = { kagetsu: 'kb_kagetsu', tsubame: 'kb_tsubame', shizuka: 'kb_shizuka', onikiri: 'kb_onikiri', mizuchi: 'kb_mizuchi', yamigama: 'kb_yamigama', iwakudaki: 'kb_iwakudaki' };
// the element light of each blade: [glow, hot core]
const WEAPON_GLOW = {
  kb_kagetsu: ['#ff2238', '#ffc2c6'], kb_tsubame: ['#38c8ff', '#e6f9ff'], kb_shizuka: ['#a46bff', '#eadcff'], kb_onikiri: ['#ff3a1c', '#ffd2a0'],
  kb_mizuchi: ['#2f9dff', '#d4f1ff'], kb_yamigama: ['#9a3cff', '#f0c8ff'], kb_iwakudaki: ['#ffb51f', '#fff1bf']
};

function kbPal(mode, ink, look) {
  const g = WEAPON_GLOW[look] || ['#ffffff', '#ffffff'];
  if (mode === 'flat') return { flat: 1, steel: ink, hi: ink, lo: ink, dark: ink, wrap: ink, wrapHi: ink, fit: ink, fitHi: ink, glow: ink, hot: ink, cord: ink, iron: ink };
  if (mode === 'art') return { art: 1, steel: C.bone, hi: '#fffaf0', lo: '#b3aa98', dark: '#2a2620', wrap: '#3a3129', wrapHi: C.gold, fit: C.gold, fitHi: '#f2dca4', glow: g[0], hot: g[1], cord: g[0], iron: '#5d554a' };
  return { steel: ANIME.silver, hi: ANIME.silverHi, lo: '#6c7179', dark: ink, wrap: '#16131a', wrapHi: '#4e4f55', fit: ANIME.metal1, fitHi: ANIME.metal2, glow: g[0], hot: g[1], cord: g[0], iron: '#45434a' };
}
function kbPath(ctx, pts, close) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close !== false) ctx.closePath();
}
function kbFill(ctx, pts, col) { kbPath(ctx, pts); ctx.fillStyle = col; ctx.fill(); }
function kbLine(ctx, x1, y1, x2, y2, w, col) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
// the one edge light: a wide soft stroke under a thin hot one, added on top; `k` pulses it while the rage art is ready
function kbGlow(ctx, pts, P, w, k) {
  if (P.flat) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  kbPath(ctx, pts, false); ctx.strokeStyle = P.glow; ctx.globalAlpha = 0.28 + 0.3 * k; ctx.lineWidth = w * (3.2 + 1.8 * k); ctx.stroke();
  ctx.globalAlpha = 0.9; ctx.lineWidth = w * 1.25; ctx.stroke();
  ctx.strokeStyle = P.hot; ctx.globalAlpha = 0.7 + 0.3 * k; ctx.lineWidth = w * 0.5; ctx.stroke();
  ctx.restore();
}
// a wrapped grip from x0 to x1: the dark handle and its diamond wraps
function kbGrip(ctx, x0, x1, hw, P, wrap, dia, n) {
  ctx.lineCap = 'round'; kbLine(ctx, x0, 0, x1, 0, hw * 2, wrap);
  if (P.flat) return;
  ctx.fillStyle = dia;
  for (let i = 1; i < n; i++) { ctx.save(); ctx.translate(lerp(x0, x1, (i + 0.1) / (n + 0.2)), 0); ctx.rotate(Math.PI / 4); ctx.fillRect(-hw * 0.45, -hw * 0.45, hw * 0.9, hw * 0.9); ctx.restore(); }
}
// a cord tassel hanging from (x, y), swinging with the wielder's time
function kbTassel(ctx, x, y, len, s, col, f, n) {
  const t = f ? f.time || 0 : 0, sw = Math.sin(t * 5.5) * 0.25;
  ctx.strokeStyle = col; ctx.lineWidth = 1.1 * s; ctx.lineCap = 'round';
  for (let i = 0; i < (n || 3); i++) {
    const o = (i - 1) * 1.1 * s, a = 2.2 + sw + i * 0.12;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - len * 0.35, y + o + len * 0.2, x + Math.cos(a) * len, y + o + Math.sin(a) * len); ctx.stroke();
  }
}
// sample a blade outline: spine from base to tip, then the edge back (both [u, v] in L and s units)
function kbBlade(L, s, spine, edge) {
  const pts = [];
  for (const p of spine) pts.push([p[0] * L, p[1] * s]);
  for (let i = edge.length - 1; i >= 0; i--) pts.push([edge[i][0] * L, edge[i][1] * s]);
  return pts;
}
function kbReady(f) {
  if (!f || !(f.rage >= 100) || !f.isPlayer) return 0;
  return 0.5 + 0.5 * Math.sin((f.time || 0) * 7);
}

const KAGE_BLADES = {
  // #7 — Kagetsu, "Shadow Moon": three back-swept teeth on the spine, a crescent bite near the point and a hooked kissaki
  kb_kagetsu(ctx, L, mode, s, ink, f) {
    const P = kbPal(mode, ink, 'kb_kagetsu'), hl = 0.31, k = kbReady(f);
    kbGrip(ctx, -L * hl, -1.6 * s, 2.3 * s, P, P.flat ? ink : P.art ? '#d9cfb8' : '#b9b09d', P.art ? '#2a2620' : '#14110f', 5);   // bone-white tsuka
    ctx.fillStyle = P.fit; ctx.beginPath(); ctx.arc(-L * hl, 0, 2.6 * s, 0, TAU); ctx.fill();                                   // kashira
    if (!P.flat) { kbTassel(ctx, -L * hl - 1.5 * s, 0, 9 * s, s, P.art ? C.emberBright : '#b81c2a', f, 2); ctx.fillStyle = P.glow; ctx.beginPath(); ctx.arc(-L * hl, 0, 1 * s, 0, TAU); ctx.fill(); }
    // crescent-moon tsuba: a dark oval with a crimson crescent inlaid
    ctx.fillStyle = P.fit; ctx.beginPath(); ctx.ellipse(-0.7 * s, 0, 2.3 * s, 6.6 * s, 0, 0, TAU); ctx.fill();
    if (!P.flat) {
      ctx.strokeStyle = P.fitHi; ctx.lineWidth = 0.8 * s; ctx.stroke();
      ctx.fillStyle = P.glow; ctx.beginPath(); ctx.ellipse(-0.7 * s, 0, 1.3 * s, 4.8 * s, 0, -Math.PI / 2, Math.PI / 2); ctx.ellipse(-0.2 * s, 0, 0.9 * s, 4.8 * s, 0, Math.PI / 2, -Math.PI / 2, true); ctx.fill();
    }
    if (mode === 'rim') return;
    const sori = 0.05, cy = u => -sori * u * u * L / s, w = u => lerp(2.5, 1.9, u);
    const spine = [[0.015, cy(0) - w(0)]];
    // three teeth: rise, sweep back toward the hilt, drop back to the spine
    for (const [u, h, b] of [[0.17, 3.2, 0.075], [0.35, 2.7, 0.07], [0.52, 2.1, 0.06]]) {
      spine.push([u - b, cy(u - b) - w(u - b)], [u - b * 0.85, cy(u) - w(u) - h], [u, cy(u) - w(u)]);
    }
    spine.push([0.82, cy(0.82) - w(0.82)], [0.95, cy(0.95) - w(0.95) * 0.7], [1, cy(1) + 0.2]);
    const edge = [[0.015, cy(0) + w(0)], [0.3, cy(0.3) + w(0.3)], [0.6, cy(0.6) + w(0.6)], [0.78, cy(0.78) + w(0.78)],
      [0.82, cy(0.82) + w(0.82) * 0.2], [0.86, cy(0.86) - w(0.86) * 0.15], [0.9, cy(0.9) + w(0.9) * 0.2],   // the moon bite
      [0.93, cy(0.93) + w(0.93) * 1.9], [0.955, cy(0.955) + w(0.955) * 0.9], [1, cy(1) + 0.2]];              // the hook
    const blade = kbBlade(L, s, spine, edge);
    kbFill(ctx, blade, P.steel);
    if (P.flat) return;
    // dark spine band carrying the teeth, a crimson hamon wave, the edge light, habaki and the moon mark
    ctx.save(); kbPath(ctx, blade); ctx.clip();
    ctx.fillStyle = P.art ? '#3a332b' : '#2b2d33'; ctx.fillRect(0, -L * 0.2, L * 1.02, L * 0.2 - 0.05 * s + 0 * s); ctx.restore();
    ctx.save(); kbPath(ctx, blade); ctx.clip();
    const ham = []; for (let i = 0; i <= 24; i++) { const u = 0.04 + 0.74 * i / 24; ham.push([u * L, (cy(u) + w(u) * (0.15 + 0.22 * Math.sin(i * 1.7))) * s]); }
    kbPath(ctx, ham, false); ctx.strokeStyle = P.art ? 'rgba(210,74,60,0.7)' : 'rgba(255,40,60,0.55)'; ctx.lineWidth = 0.7 * s; ctx.stroke();
    ctx.restore();
    const eg = []; for (let i = 0; i <= 12; i++) { const u = 0.04 + 0.74 * i / 12; eg.push([u * L, (cy(u) + w(u) * 0.82) * s]); }
    kbGlow(ctx, eg, P, 0.65 * s, k);
    kbGlow(ctx, [[0.9 * L, (cy(0.9) + w(0.9) * 0.3) * s], [0.93 * L, (cy(0.93) + w(0.93) * 1.7) * s], [L, (cy(1) + 0.2) * s]], P, 0.5 * s, k);
    ctx.fillStyle = P.art ? C.gold : ANIME.silver; ctx.fillRect(0.4 * s, (cy(0) - w(0)) * s, 3 * s, w(0) * 2 * s);   // habaki
    ctx.fillStyle = P.glow; ctx.beginPath(); ctx.arc(0.075 * L, cy(0.075) * s, 1.15 * s, 0, TAU); ctx.fill();         // the red moon
    ctx.fillStyle = P.art ? '#3a332b' : '#2b2d33'; ctx.beginPath(); ctx.arc(0.075 * L + 0.55 * s, cy(0.075) * s - 0.25 * s, 0.85 * s, 0, TAU); ctx.fill();
  },

  // #2 — Tsubame, "Swallow": short fangs bowing toward the spine like a swallow's wing, a hooked bump at the base
  kb_tsubame(ctx, L, mode, s, ink, f) {
    const P = kbPal(mode, ink, 'kb_tsubame'), hl = 0.32, k = kbReady(f);
    kbGrip(ctx, -L * hl, 0, 2.7 * s, P, P.wrap, P.cord, 4);
    // swallow-tail pommel: two prongs
    ctx.fillStyle = P.fit;
    kbFill(ctx, [[-L * hl + 1 * s, -2.4 * s], [-L * hl - 5 * s, -5.6 * s], [-L * hl - 2.4 * s, 0], [-L * hl - 5 * s, 5.6 * s], [-L * hl + 1 * s, 2.4 * s]], P.fit);
    // wing guard, swept back toward the hand
    kbFill(ctx, [[1.2 * s, -1.6 * s], [-1.2 * s, -7.6 * s], [-4.2 * s, -9.4 * s], [-1.6 * s, -4.4 * s], [-1.6 * s, 4.4 * s], [-4.2 * s, 9.4 * s], [-1.2 * s, 7.6 * s], [1.2 * s, 1.6 * s]], P.fit);
    if (!P.flat) { ctx.strokeStyle = P.fitHi; ctx.lineWidth = 0.7 * s; ctx.stroke(); }
    if (mode === 'rim') return;
    const bow = u => -0.24 * L / s * Math.pow(u, 2.2);   // the fang bows toward the spine
    const spine = [[0.02, -2.6], [0.09, -3.3], [0.13, -5.0], [0.16, -3.6]];   // the hooked bump
    for (let i = 1; i <= 8; i++) { const u = 0.16 + 0.84 * i / 8; spine.push([u, bow(u) - lerp(3.3, 0.2, Math.pow((u - 0.16) / 0.84, 1.3))]); }
    const edge = [[0.02, 3.0]];
    for (let i = 1; i <= 10; i++) { const u = 0.02 + 0.98 * i / 10; edge.push([u, bow(u) + lerp(3.6, 0.1, Math.pow(u, 1.15)) + 1.6 * Math.sin(u * Math.PI) ]); }
    const blade = kbBlade(L, s, spine, edge);
    kbFill(ctx, blade, P.steel);
    if (P.flat) return;
    // the lightning engraving along the flat, then the cyan edge on the belly
    const zz = []; for (let i = 0; i <= 6; i++) { const u = 0.12 + 0.6 * i / 6; zz.push([u * L, (bow(u) + (i % 2 ? 1.1 : -0.6)) * s]); }
    kbPath(ctx, zz, false); ctx.strokeStyle = P.art ? C.goldDim : 'rgba(40,46,60,0.85)'; ctx.lineWidth = 0.75 * s; ctx.stroke();
    const eg = []; for (let i = 0; i <= 12; i++) { const u = 0.06 + 0.92 * i / 12; eg.push([u * L, (bow(u) + lerp(3.6, 0.1, Math.pow(u, 1.15)) + 1.6 * Math.sin(u * Math.PI) - 0.5) * s]); }
    kbGlow(ctx, eg, P, 0.6 * s, k);
  },

  // #10 — Shizuka, "Silence": a needle-straight blade, a winged and spiked guard, a crescent pommel ring
  kb_shizuka(ctx, L, mode, s, ink, f) {
    const P = kbPal(mode, ink, 'kb_shizuka'), hl = 0.3, k = kbReady(f);
    kbGrip(ctx, -L * hl, -1.5 * s, 1.9 * s, P, P.flat ? ink : P.art ? '#2f2738' : '#1a1422', P.flat ? ink : P.art ? C.gold : '#5d3f8c', 6);
    // crescent pommel ring and a violet tassel
    ctx.fillStyle = P.fit; ctx.beginPath(); ctx.arc(-L * hl - 2.2 * s, 0, 3 * s, 0, TAU); ctx.arc(-L * hl - 2.9 * s, -0.4 * s, 1.9 * s, 0, TAU, true); ctx.fill('evenodd');
    if (!P.flat) kbTassel(ctx, -L * hl - 4.5 * s, 0.8 * s, 8 * s, s, P.art ? '#9c78d8' : '#7e4ed0', f, 3);
    // the winged guard: a diamond boss with two forward-swept wings, each with a spur
    const gd = [[2.4 * s, 0], [0.6 * s, -2.2 * s], [2.6 * s, -5.4 * s], [0.8 * s, -4.6 * s], [-0.6 * s, -8.2 * s], [-1.6 * s, -4.2 * s], [-2.6 * s, -2.4 * s],
      [-2.6 * s, 2.4 * s], [-1.6 * s, 4.2 * s], [-0.6 * s, 8.2 * s], [0.8 * s, 4.6 * s], [2.6 * s, 5.4 * s], [0.6 * s, 2.2 * s]];
    kbFill(ctx, gd, P.fit);
    if (!P.flat) { ctx.strokeStyle = P.art ? '#f2dca4' : '#6a5a86'; ctx.lineWidth = 0.6 * s; ctx.stroke(); ctx.fillStyle = P.glow; ctx.beginPath(); ctx.arc(0, 0, 1.1 * s, 0, TAU); ctx.fill(); }
    if (mode === 'rim') return;
    const w = u => lerp(1.75, 0.35, Math.pow(u, 1.4));
    const spine = [[0.03, -w(0)], [0.1, -w(0.1) - 0.5], [0.13, -w(0.13)]];   // a small ricasso shoulder
    for (let i = 1; i <= 8; i++) { const u = 0.13 + 0.82 * i / 8; spine.push([u, -w(u)]); }
    spine.push([1, 0]);
    const edge = [[0.03, w(0)], [0.1, w(0.1) + 0.5], [0.13, w(0.13)]];
    for (let i = 1; i <= 8; i++) { const u = 0.13 + 0.82 * i / 8; edge.push([u, w(u)]); }
    edge.push([1, 0]);
    const blade = kbBlade(L, s, spine, edge);
    kbFill(ctx, blade, P.steel);
    if (P.flat) return;
    ctx.save(); kbPath(ctx, blade); ctx.clip(); ctx.fillStyle = P.lo; ctx.fillRect(0, -L * 0.1, L * 1.02, L * 0.1); ctx.restore();   // the spine flat in shadow
    kbGlow(ctx, [[0.15 * L, 0], [0.97 * L, 0]], P, 0.5 * s, k);                                                                  // the violet ridge light
    ctx.fillStyle = P.hi; ctx.beginPath(); ctx.arc(0.1 * L, 0, 0.7 * s, 0, TAU); ctx.fill();
  },

  // #6 — Onikiri, "Demon Cutter": a squared slab of a blade, the spine bitten into irregular teeth, a horned T-guard
  kb_onikiri(ctx, L, mode, s, ink, f) {
    const P = kbPal(mode, ink, 'kb_onikiri'), k = kbReady(f);
    kbGrip(ctx, -L * 0.3, L * 0.03, 3.2 * s, P, P.wrap, P.flat ? ink : P.art ? C.gold : '#7c1c1c', 5);
    // oni pommel: a knob with two horns
    ctx.fillStyle = P.fit; ctx.beginPath(); ctx.arc(-L * 0.3, 0, 3.6 * s, 0, TAU); ctx.fill();
    kbFill(ctx, [[-L * 0.3 - 1 * s, -3 * s], [-L * 0.3 - 6.4 * s, -6.8 * s], [-L * 0.3 - 2.6 * s, -1.4 * s]], P.fit);
    kbFill(ctx, [[-L * 0.3 - 1 * s, 3 * s], [-L * 0.3 - 6.4 * s, 6.8 * s], [-L * 0.3 - 2.6 * s, 1.4 * s]], P.fit);
    // horned T-guard
    const gx = L * 0.035, gw = 3.6 * s;
    kbFill(ctx, [[gx - gw, -15 * s], [gx + gw, -15 * s], [gx + gw, 23 * s], [gx - gw, 23 * s]], P.fit);
    kbFill(ctx, [[gx - gw, -15 * s], [gx - gw - 3 * s, -20 * s], [gx + gw * 0.2, -15.5 * s]], P.fit);
    kbFill(ctx, [[gx - gw, 23 * s], [gx - gw - 3 * s, 28 * s], [gx + gw * 0.2, 23.5 * s]], P.fit);
    if (!P.flat) { ctx.fillStyle = P.fitHi; ctx.fillRect(gx - gw, -15 * s, gw * 0.6, 38 * s); }
    if (mode === 'rim') return;
    // the slab: serrated spine (-y), a straight edge with a slight belly (+y), a squared, slightly raked point
    const x0 = (gx + gw) / L, spine = [[x0, -11]];
    const teeth = [[0.2, 3.2], [0.27, 1.4], [0.34, 3.8], [0.43, 2.2], [0.5, 4.2], [0.58, 1.8], [0.66, 3.6], [0.74, 2.4], [0.82, 3]];
    for (const [u, d] of teeth) spine.push([u - 0.035, -11.5 - 0.6], [u, -11.5 + d]);
    spine.push([0.9, -12.4], [0.975, -12.8], [1, -9]);
    const edge = [[x0, 18], [0.35, 19.4], [0.7, 19.6], [0.95, 19.2], [1, 17]];
    const blade = kbBlade(L, s, spine, edge);
    kbFill(ctx, blade, P.flat ? ink : P.iron);
    if (P.flat) return;
    ctx.save(); kbPath(ctx, blade); ctx.clip();
    ctx.fillStyle = P.steel; ctx.fillRect(x0 * L, 13.2 * s, L, 8 * s);                              // the silver bevel along the edge
    ctx.fillStyle = P.art ? '#4a4239' : '#2f2d33'; ctx.fillRect(x0 * L, -16 * s, L, 6.5 * s);         // the dark serrated spine
    ctx.restore();
    // crimson-hot cracks through the iron
    const cracks = [[[0.16, 2], [0.24, -1.5], [0.3, 1], [0.38, -3], [0.45, 0.5]], [[0.5, 5], [0.57, 1.5], [0.63, 4], [0.7, 0], [0.76, 2.5], [0.84, -2]], [[0.38, -3], [0.42, -7]], [[0.7, 0], [0.73, -5.5]]];
    for (const c of cracks) kbGlow(ctx, c.map(p => [p[0] * L, p[1] * s]), P, 0.45 * s, k * 0.6);
    kbGlow(ctx, [[x0 * L + 2 * s, 17.4 * s], [0.5 * L, 18.6 * s], [0.95 * L, 18.4 * s], [L - 0.5 * s, 16.4 * s]], P, 0.7 * s, k);
    ctx.fillStyle = P.art ? C.void : '#0d0b0d'; ctx.beginPath(); ctx.arc(0.86 * L, -3.6 * s, 2.8 * s, 0, TAU); ctx.fill();    // the old hole
    ctx.strokeStyle = P.glow; ctx.globalAlpha = 0.5; ctx.lineWidth = 0.6 * s; ctx.stroke(); ctx.globalAlpha = 1;
  },

  // #12 — Mizuchi, "Water Dragon": a serpentine kris head held in a dragon's jaws on a long lacquered shaft
  kb_mizuchi(ctx, L, mode, s, ink, f) {
    const P = kbPal(mode, ink, 'kb_mizuchi'), k = kbReady(f), x1 = L * 0.74;
    ctx.lineCap = 'butt'; kbLine(ctx, -L * 0.42, 0, x1, 0, 4.4 * s, P.flat ? ink : P.art ? '#3a3129' : '#121722');
    // butt spike
    kbFill(ctx, [[-L * 0.42, -2.6 * s], [-L * 0.42 - 9 * s, 0], [-L * 0.42, 2.6 * s]], P.fit);
    if (!P.flat) {
      // water bands round the shaft and a wave line between them
      for (const u of [-0.36, -0.12, 0.12, 0.36, 0.6]) { ctx.fillStyle = P.art ? C.gold : '#1d5d8f'; ctx.fillRect(u * L, -2.3 * s, 2.2 * s, 4.6 * s); ctx.fillStyle = P.glow; ctx.globalAlpha = 0.85; ctx.fillRect(u * L + 0.7 * s, -2.3 * s, 0.7 * s, 4.6 * s); ctx.globalAlpha = 1; }
      ctx.strokeStyle = P.art ? 'rgba(201,164,92,0.45)' : 'rgba(60,130,210,0.3)'; ctx.lineWidth = 0.5 * s; ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const x = lerp(-0.34, 0.58, i / 40) * L; ctx.lineTo(x, Math.sin(i * 1.3) * 0.9 * s); } ctx.stroke();
    }
    // the dragon-head collar: a jaw with a back-swept horn and a lit eye
    const hx = x1 - 3 * s;
    kbFill(ctx, [[hx - 6 * s, -2.4 * s], [hx - 2 * s, -5 * s], [hx - 7 * s, -9.6 * s], [hx + 1 * s, -6 * s], [hx + 6 * s, -5 * s], [hx + 7.5 * s, -2.6 * s],
      [hx + 5 * s, -1.2 * s], [hx + 7.5 * s, 1 * s], [hx + 6 * s, 4.4 * s], [hx + 1 * s, 5 * s], [hx - 6 * s, 2.4 * s]], P.fit);
    if (!P.flat) {
      ctx.strokeStyle = P.fitHi; ctx.lineWidth = 0.7 * s; ctx.stroke();
      ctx.fillStyle = P.glow; ctx.beginPath(); ctx.arc(hx + 2.4 * s, -2.8 * s, 1 * s, 0, TAU); ctx.fill();
      kbTassel(ctx, hx - 4 * s, 3 * s, 14 * s, s, P.art ? '#4fa8e8' : '#2a8be0', f, 3);
    }
    if (mode === 'rim') return;
    // the kris: three waves on each edge round a wavy centre line
    const u0 = (hx + 6.5 * s) / L, cy = u => Math.sin((u - u0) / (1 - u0) * Math.PI * 3) * lerp(2.6, 1.2, (u - u0) / (1 - u0)), w = u => lerp(4.4, 0, Math.pow((u - u0) / (1 - u0), 1.35));
    const spine = [], edge = [];
    for (let i = 0; i <= 30; i++) { const u = lerp(u0, 1, i / 30); spine.push([u, cy(u) - w(u)]); edge.push([u, cy(u) + w(u)]); }
    const blade = kbBlade(L, s, spine, edge);
    kbFill(ctx, blade, P.steel);
    if (P.flat) return;
    const mid = []; for (let i = 0; i <= 14; i++) { const u = lerp(u0 + 0.01, 0.97, i / 14); mid.push([u * L, cy(u) * s]); }
    kbGlow(ctx, mid, P, 0.6 * s, k);
  },

  // #11 — Yamigama, "Dark Sickle": a ribbed bone hilt with flanges and a broad crescent blade with a back spur
  kb_yamigama(ctx, L, mode, s, ink, f) {
    const P = kbPal(mode, ink, 'kb_yamigama'), k = kbReady(f), x1 = L * 0.52;
    ctx.lineCap = 'round'; kbLine(ctx, -5 * s, 0, x1, 0, 5 * s, P.flat ? ink : P.art ? '#3a3129' : '#1c1820');
    // the ribs
    for (const u of [0.04, 0.15, 0.26, 0.37]) { ctx.fillStyle = P.fit; ctx.beginPath(); ctx.ellipse(u * L, 0, 1.3 * s, 3.8 * s, 0, 0, TAU); ctx.fill(); }
    if (!P.flat) for (const u of [0.04, 0.15, 0.26, 0.37]) { ctx.fillStyle = P.art ? '#f2dca4' : '#5a4f66'; ctx.fillRect(u * L - 0.4 * s, -3.4 * s, 0.8 * s, 2.2 * s); }
    // the chain ring at the butt, and the flanged collar under the blade
    ctx.strokeStyle = P.fit; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.arc(-6 * s, 0, 2.4 * s, 0, TAU); ctx.stroke();
    kbFill(ctx, [[x1 - 5 * s, -5 * s], [x1 + 2 * s, -4 * s], [x1 + 2 * s, 5.5 * s], [x1 - 5 * s, 4.6 * s]], P.fit);
    if (mode === 'rim') return;
    // the crescent: the outer (back) curve sweeps up to the point, the cutting edge returns inside it; a spur on the back
    const out = [], inn = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16, a = lerp(-0.18, 1.32, t);
      out.push([x1 + Math.sin(a) * L * 0.44 + L * 0.02, -Math.cos(a) * L * 0.0 - (1 - Math.cos(a)) * L * 0.32 + 5.2 * s - t * t * 3 * s]);
    }
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, a = lerp(-0.05, 1.18, t);
      inn.push([x1 + Math.sin(a) * L * 0.33 + L * 0.03, -(1 - Math.cos(a)) * L * 0.36 - 3 * s - t * 2 * s]);
    }
    const tip = [x1 + L * 0.47, -L * 0.62];
    const blade = out.concat([tip]).concat(inn.slice().reverse());
    kbFill(ctx, blade, P.flat ? ink : P.art ? P.steel : '#3a3640');
    kbFill(ctx, [[x1 + L * 0.2, 4.4 * s], [x1 + L * 0.32, 9.6 * s], [x1 + L * 0.3, 3 * s]], P.flat ? ink : P.art ? P.steel : '#3a3640');   // spur
    if (P.flat) return;
    ctx.save(); kbPath(ctx, blade); ctx.clip(); kbPath(ctx, inn.map(p => [p[0] + 1.6 * s, p[1] + 2.4 * s]).concat(out.slice().reverse())); ctx.fillStyle = P.art ? '#c9bfa8' : '#25222b'; ctx.fill(); ctx.restore();
    kbGlow(ctx, inn.slice(1).concat([tip]), P, 0.6 * s, k);
  },

  // #9 — Iwakudaki, "Rock Crusher": the hourglass profile as the head, flared faces rimmed in gold, rune lines, a crown spike
  kb_iwakudaki(ctx, L, mode, s, ink, f) {
    const P = kbPal(mode, ink, 'kb_iwakudaki'), k = kbReady(f), cx = L * 0.87;
    ctx.lineCap = 'butt'; kbLine(ctx, -L * 0.1, 0, cx, 0, 5.8 * s, P.flat ? ink : P.art ? '#4a3a28' : '#1e1712');
    kbFill(ctx, [[-L * 0.1, -3.4 * s], [-L * 0.1 - 8 * s, 0], [-L * 0.1, 3.4 * s]], P.fit);                                // pommel spike
    if (!P.flat) {
      for (const u of [-0.06, 0.18, 0.5, 0.7]) { ctx.fillStyle = P.art ? C.gold : '#a87a1c'; ctx.fillRect(u * L, -3.2 * s, 2.6 * s, 6.4 * s); }   // gold bands
      ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 0.8 * s; for (let x = 0.0; x < 0.16; x += 0.025) { ctx.beginPath(); ctx.moveTo(x * L, -2.9 * s); ctx.lineTo((x + 0.02) * L, 2.9 * s); ctx.stroke(); }   // grip wrap
    }
    if (mode === 'rim') return;
    // the head: wide at the two striking faces (+-H), pinched at the waist
    const H = 27 * s, hw = L * 0.15, ww = L * 0.085, head = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12, y = lerp(-H, H, t), pin = 1 - Math.pow(Math.sin(t * Math.PI), 1.6); head.push([cx - lerp(ww, hw, pin), y]); }
    for (let i = 12; i >= 0; i--) { const t = i / 12, y = lerp(-H, H, t), pin = 1 - Math.pow(Math.sin(t * Math.PI), 1.6); head.push([cx + lerp(ww, hw, pin), y]); }
    kbFill(ctx, head, P.flat ? ink : P.art ? '#7a6a52' : '#4d4440');
    kbFill(ctx, [[cx + ww * 0.7, -4 * s], [cx + ww + 10 * s, 0], [cx + ww * 0.7, 4 * s]], P.flat ? ink : P.fit);               // crown spike
    if (P.flat) return;
    ctx.save(); kbPath(ctx, head); ctx.clip();
    ctx.fillStyle = P.art ? '#5d4f3c' : '#332c2a'; ctx.fillRect(cx, -H, hw * 1.2, H * 2);                                         // the far half in shadow
    ctx.fillStyle = P.art ? C.gold : '#c49326'; ctx.fillRect(cx - hw, -H, hw * 2, 3.4 * s); ctx.fillRect(cx - hw, H - 3.4 * s, hw * 2, 3.4 * s);   // gold face rims
    ctx.restore();
    // rune lines down the waist, lit gold
    kbGlow(ctx, [[cx - ww * 0.4, -H * 0.62], [cx, -H * 0.42], [cx + ww * 0.4, -H * 0.62]], P, 0.55 * s, k);
    kbGlow(ctx, [[cx, -H * 0.3], [cx, H * 0.3]], P, 0.55 * s, k);
    kbGlow(ctx, [[cx - ww * 0.4, H * 0.62], [cx, H * 0.42], [cx + ww * 0.4, H * 0.62]], P, 0.55 * s, k);
    ctx.fillStyle = P.hot; ctx.beginPath(); ctx.arc(cx, 0, 1.5 * s, 0, TAU); ctx.fill();
  }
};
