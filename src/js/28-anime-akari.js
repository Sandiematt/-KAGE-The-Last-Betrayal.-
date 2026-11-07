/* KAGE — Akari, the Memory Blade, as an anime kunoichi (anime redesign, ticket 09), from her key art
   (boss_akari.webp, face_akari.webp). A main boss: slim, long-legged and agile, about 1/7 head, drawn with a narrow
   waist, a gentle flare at the hip and a fitted (never revealing) cut:
     head      a black face with WHITE eyes (the rule) above a dark cloth half-mask that covers the face from the cheeks
               down; black hair with a violet sheen: a fringe of sharp locks over the brow, a long side lock framing
               the face, and a high ponytail off the crown (cloth 'ahair', two locks) tied with a violet sakura
               ornament and short violet bead strings (cloth 'aribbon')
     garb      a fitted black top with a high collar and violet piping along a halter line, a wide black belt with a
               silver buckle over a second belt slung low on the hips, a pouch on a strap round the near thigh
     arms      fitted dark sleeves under long lacquered arm guards from above the elbow to the wrist, banded violet
     legs      fitted leggings into tall boots with a violet band at the top and a small knee guard
     sash      one long violet sash down the front from the belt, cut in a V, a pale sakura crest near its end (cloth
               'asash'), and a long dark tail of cloth streaming from the back of the belt, edged violet (cloth 'atail')
     blades    Kagehira & Yurei (drawWeaponShape 'kagehira' / 'yurei', unchanged) with their violet edge light
   Hollow Akari (hollow_akari, echoOf akari) is the same design under the Hollow treatment: the deep near-black palette,
   the violet faded toward ash, the sash and the tail torn into points, the hair ends ragged, one bead string gone, the
   sakura ornament ashen with a petal missing, a glowing crack across the mask and one arm guard, a stronger violet
   halo round the white eyes. Fighter.draw's glitch, ghost and ash dissolve sit on top.
   All of her cloth is drawn inside the body (silhouette), so the outline, the impact frame, the glitch ghost and the
   flat afterimages (her decoy echoes, Smoke Step, Blink) carry the whole silhouette: hair, sash and tail included.
   Kage can wear the Mei-En Garb (trophy armour): on him it is a lacquered chest guard edged violet over his coat and
   a shorter violet sash with the crest. Drawing only: no joint, timer or gameplay field is touched, no randomness. */

const AK_VIO = ['#3a2368', '#7a4fd0', '#b48ae6'];             // the sash, piping, bands (AKARI_VIOLET at the top)
const AK_VIO_H = ['#211a36', '#463a72', '#8a7cc4'];           // the echo's: faded toward ash
const AK_CLOTH = ['#040306', '#0b0a0f', '#1c1824'];           // her black fabric, a violet cast in the lit fold
const AK_GUARD = ['#060509', '#121019', '#2f2a3c'];           // lacquered arm guards, boots, knee guards
const AK_HAIR = ['#040306', '#0c0a12', '#2a2140'];            // black hair, violet in the light
const AK_MASK = ['#100f15', '#1d1b24', '#34303f'];            // the cloth half-mask, a step lighter than the face
const AK_TAIL = ['#060508', '#0e0c13', '#1f1b29'];
const AK_SILVER = ['#4a4c52', ANIME.silver, ANIME.silverHi];
const AK_SAKURA = ['#6b3fb8', '#b384ff', '#f3e6ff'];           // petals shadow / base / heart
const AK_SAKURA_H = ['#3a3448', '#6e6684', '#b9b2c8'];         // ash

/* ---- skins ---- */
ANIME_SKINS.akari = { top: 'gi', feet: 'boot', sleeve: 1, kote: false, collar: false, sash: 'akari', noGiSash: true, akari: 'boss' };
ANIME_SKINS.hollow_akari = { top: 'gi', feet: 'boot', sleeve: 1, kote: false, collar: false, sash: 'akari', noGiSash: true, akari: 'hollow',
  hollow: { fray: 1, robe: {} } };   // `hollow` gives the deep palette; her cloth is her own (ahair, asash, atail)
const _akH = (f) => animeSkin(f).akari === 'hollow';
const _akV = (f) => (f.hollow ? AK_VIO_H : AK_VIO);

// cloth (from animeCloths): the ponytail's two locks and the bead strings from the crown, the sash and the tail from
// the belt; Kage in the Mei-En Garb gets the sash only, shorter
function akariCloths(f, sk) {
  const s = f.scale;
  if (sk.akari) {
    f.cloths.push({ kind: 'ahair', main: 1, c: new Cloth(12, 7.8 * s, { ph: 4.5, wind: 1250, grav: 460, stiff: 1.88, hang: 0.5 }), at: 'head', dx: 9, dy: -15 });
    f.cloths.push({ kind: 'ahair', c: new Cloth(9, 7 * s, { ph: 6.6, wind: 1150, grav: 420, stiff: 1.85, hang: 0.7 }), at: 'head', dx: 10, dy: -14 });
    f.cloths.push({ kind: 'aribbon', c: new Cloth(4, 3.8 * s, { ph: 7, wind: 200, grav: 1100, stiff: 1.6 }), at: 'head', dx: 12, dy: -10 });
    if (!(f.def && f.def.echoOf)) f.cloths.push({ kind: 'aribbon', c: new Cloth(4, 3.2 * s, { ph: 8.4, wind: 180, grav: 1100, stiff: 1.6 }), at: 'head', dx: 9, dy: -9 });   // the echo lost one
    f.cloths.push({ kind: 'atail', c: new Cloth(9, 9.4 * s, { ph: 2.4, wind: 1000, grav: 980, stiff: 1.7, hang: 0.5 }), at: 'hip', dx: 8, dy: -3 });
    f.cloths.push({ kind: 'asash', c: new Cloth(8, 10.2 * s, { ph: 2, wind: 260, grav: 1250, stiff: 1.9, hang: 0.12 }), at: 'hip', dx: -6, dy: -2 });
  } else if (f.armor === 'mei_en') {
    f.cloths.push({ kind: 'asash', short: 1, c: new Cloth(6, 9.6 * s, { ph: 2, wind: 260, grav: 1250, stiff: 1.9, hang: 0.12 }), at: 'hip', dx: -7, dy: -2 });
  }
}

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
// a five-petal sakura with notched petal tips (her ornament and crests); petals in `col`, a pale heart
function drawSakura(ctx, x, y, R, rot, col, core, miss) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    if (i !== miss) {
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-R * 0.62, -R * 0.42, -R * 0.44, -R * 1.0, -R * 0.15, -R * 1.0); ctx.lineTo(0, -R * 0.8); ctx.lineTo(R * 0.15, -R * 1.0);
      ctx.bezierCurveTo(R * 0.44, -R * 1.0, R * 0.62, -R * 0.42, 0, 0);
    }
    ctx.rotate(TAU / 5);
  }
  ctx.fill();
  if (core) { ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, R * 0.22, 0, TAU); ctx.fill(); }
  ctx.restore();
}
// a head-frame point (+x the face side) in world coordinates, as the head transform of silhouette() places it
function _akHeadPt(f, lx, ly) {
  const r = f.headRot || 0, c = Math.cos(r), s = Math.sin(r), x = lx * f.facing;
  return [f.sk.head.x + x * c - ly * s, f.sk.head.y + x * s + ly * c];
}

/* ---- the ponytail: two thick tapered locks from the tie on the crown, split into points at the ends ---- */
function _akHairLock(f, ctx, A, cl, r, main) {
  const c = cl.c; if (!c.init) return;
  const hol = f.hollow, root = _akHeadPt(f, -0.5 * r, -0.98 * r);
  const W = r * (main ? 1.5 : 0.9);
  const n = _akEdges(c, (u) => W * (u < 0.12 ? 0.42 + u * 3.6 : Math.max(0.08, Math.sin(Math.PI * (0.25 + 0.75 * u)) * (1 - u * 0.25))), root[0], root[1]);
  celFill(ctx, () => _akStrip(ctx, n, c, 0, main ? 3 : 2, r * (hol ? 0.13 : 0.09)), main ? AK_HAIR : [AK_HAIR[0], AK_HAIR[0], AK_HAIR[1]], A, { sd: r * 0.3, hd: main ? r * 0.08 : 0, rim: main, detail: (g) => {
    // strands combed along the lock, the lit ones violet
    g.lineCap = 'round';
    for (const [t, col, lw] of [[0.3, AK_HAIR[0], 1], [0.55, '#4a3770', 0.9], [0.74, AK_HAIR[0], 1]]) {
      g.strokeStyle = col; g.lineWidth = lw * A.s; g.beginPath();
      for (let i = 1; i < n; i++) { const x = lerp(_akL[i * 2], _akR[i * 2], t), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
    }
  } });
}

/* ---- layers called from the body (21-anime-body.js) ---- */
function akariLayer(f, ctx, A, skin, U, layer) {
  if (layer === 'back') {
    if (!skin.akari) return;
    _akTail(f, ctx, A, U);
    const r = BODY.head * f.scale * f.build.head;
    for (const cl of f.cloths) if (cl.kind === 'ahair' && !cl.main) _akHairLock(f, ctx, A, cl, r, false);
    for (const cl of f.cloths) if (cl.kind === 'ahair' && cl.main) _akHairLock(f, ctx, A, cl, r, true);
    _akRibbons(f, ctx, A);
  } else if (layer === 'front') {
    if (skin.akari || f.armor === 'mei_en') _akSash(f, ctx, A, U);
  } else if (layer === 'waist') {
    if (skin.akari) _akBelt(f, ctx, A, A.S, U);
  }
}
// the tail of dark cloth from the back of the belt, streaming behind her: violet edge, a sakura crest near the end
function _akTail(f, ctx, A, U) {
  const cl = f.cloths.find(c => c.kind === 'atail'); if (!cl || !cl.c.init) return;
  const c = cl.c, hol = f.hollow, vio = _akV(f), floorY = f.y + 2 * A.s;
  const n = _akEdges(c, (u) => (14 + 14 * Math.pow(u, 0.8)) * U);
  for (let i = 0; i < n; i++) { _akL[i * 2 + 1] = Math.min(_akL[i * 2 + 1], floorY); _akR[i * 2 + 1] = Math.min(_akR[i * 2 + 1], floorY); }
  celFill(ctx, () => _akStrip(ctx, n, c, 0.7, hol ? 5 : 0, 9 * U), hol ? A.pal.coatB : AK_TAIL, A, { sd: 6 * U, hd: 0.8 * U, rim: true, detail: (g) => {
    // two folds down the cloth, the violet band along both edges, the crest near the end
    g.strokeStyle = ANIME.face; g.lineWidth = 1 * A.s; g.beginPath();
    for (const t of [0.36, 0.68]) for (let i = 1; i < n; i++) { const x = lerp(_akL[i * 2], _akR[i * 2], t), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    g.strokeStyle = vio[1]; g.lineWidth = 1.5 * U;
    if (hol) g.setLineDash([6 * U, 3 * U, 2 * U, 4 * U]);
    for (const E of [_akL, _akR]) { g.beginPath(); g.moveTo(E[2], E[3]); for (let i = 2; i < n; i++) g.lineTo(E[i * 2], E[i * 2 + 1]); g.stroke(); }
    g.setLineDash([]);
    const j = n - 2, x = lerp(_akL[j * 2], _akR[j * 2], 0.5), y = lerp(_akL[j * 2 + 1], _akR[j * 2 + 1], 0.5);
    drawSakura(g, x, y, 4.6 * U, Math.atan2(c.py[n - 1] - c.py[n - 2], c.px[n - 1] - c.px[n - 2]), hol ? AK_SAKURA_H[1] : vio[1], hol ? AK_SAKURA_H[2] : '#e6d8ff', hol ? 2 : -1);
  } });
}
// the long violet sash down the front from the belt, cut in a V, a pale sakura crest near the end
function _akSash(f, ctx, A, U) {
  const cl = f.cloths.find(c => c.kind === 'asash'); if (!cl || !cl.c.init) return;
  const c = cl.c, hol = f.hollow, vio = _akV(f);
  const n = _akEdges(c, (u) => (8.6 + 2.6 * u) * U);
  celFill(ctx, () => _akStrip(ctx, n, c, 0.8, hol ? 3 : 0, 6 * U), vio, A, { sd: 3 * U, hd: 0.9 * U, detail: (g) => {
    // a fold down the middle, darker near the knot, the pale edge line, the crest
    g.strokeStyle = vio[0]; g.lineWidth = 1 * A.s; g.beginPath();
    for (let i = 1; i < n; i++) { const x = lerp(_akL[i * 2], _akR[i * 2], 0.42 + Math.sin(i * 1.7) * 0.06), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], 0.42); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    g.fillStyle = vio[0]; g.beginPath(); g.moveTo(_akL[0], _akL[1]); g.lineTo(_akR[0], _akR[1]); g.lineTo(_akR[4], _akR[5]); g.lineTo(_akL[4], _akL[5]); g.closePath(); g.globalAlpha *= 0.6; g.fill(); g.globalAlpha /= 0.6;
    const j = Math.round((n - 1) * 0.76), x = lerp(_akL[j * 2], _akR[j * 2], 0.5), y = lerp(_akL[j * 2 + 1], _akR[j * 2 + 1], 0.5);
    drawSakura(g, x, y, 3.6 * U, Math.atan2(c.py[n - 1] - c.py[n - 2], c.px[n - 1] - c.px[n - 2]), hol ? '#c9c2da' : '#f6efff', vio[1], hol ? 1 : -1);
    if (hol) hollowCrack(g, A, 1, [[_akL[6], _akL[7]], [lerp(_akL[8], _akR[8], 0.5), lerp(_akL[9], _akR[9], 0.5)], [_akR[10], _akR[11]]], 0.8 * U);
  } });
}
// the wide belt at the waist with a silver buckle, and a second belt slung low across the hips
function _akBelt(f, ctx, A, S, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)], hol = f.hollow, vio = _akV(f), gt = hol ? A.pal.metal : AK_GUARD;
  const band = (u0f, u0b, u1f, u1b, wf, wb) => { const a = P(u0b, -wb), b = P(u0f, wf), c = P(u1f, wf), d = P(u1b, -wb); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  // the slung belt: lower at the front, riding up at the back
  celFill(ctx, () => band(-0.06, 0.06, -0.14, -0.01, 11.2, 12.4), gt, A, { sd: 1.6 * U, hd: 0.5 * U, detail: (g) => _strokePts(g, [P(-0.1, -12.4), P(-0.12, 11.2)], vio[0], 0.8 * U) });
  // the waist belt
  celFill(ctx, () => band(0.17, 0.16, 0.06, 0.07, 9.6, 9.0), gt, A, { sd: 2 * U, hd: 0.6 * U, detail: (g) => {
    _strokePts(g, [P(0.155, -9), P(0.165, 9.6)], vio[1], 0.9 * U);
    _strokePts(g, [P(0.075, -9), P(0.065, 9.6)], vio[1], 0.9 * U);
  } });
  if (A.flat) return;
  // the buckle: a silver square frame at the front, a dark tongue
  const c = P(0.115, 7.8), rot = Math.atan2(S.dy, S.dx) + Math.PI / 2;
  ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(rot);
  ctx.fillStyle = hol ? '#55505f' : ANIME.silver; ctx.fillRect(-2.6 * U, -2.4 * U, 5.2 * U, 4.8 * U);
  ctx.fillStyle = ANIME.face; ctx.fillRect(-1.5 * U, -1.3 * U, 3 * U, 2.6 * U);
  ctx.fillStyle = hol ? '#7d778a' : ANIME.silverHi; ctx.fillRect(-2.6 * U, -2.4 * U, 5.2 * U, 0.7 * U);
  ctx.restore();
}

/* ---- the arm: a fitted sleeve, a long lacquered guard from above the elbow to the wrist, banded violet ---- */
function akariArm(f, ctx, sh, el, ha, A, U, far) {
  const hol = f.hollow, vio = _akV(f), cl = hol ? (far ? A.pal.back : A.pal.fab) : far ? [ANIME.face, AK_CLOTH[0], AK_CLOTH[1]] : AK_CLOTH;
  const gt = far ? [ANIME.face, AK_GUARD[0], AK_GUARD[1]] : hol ? A.pal.metal : AK_GUARD;
  const ux = el.x - sh.x, uy = el.y - sh.y, ex = ha.x - el.x, ey = ha.y - el.y, fl = Math.hypot(ex, ey) || 1, fnx = -ey / fl, fny = ex / fl;
  const up = (k) => ({ x: sh.x + ux * k, y: sh.y + uy * k }), at = (k, o) => ({ x: el.x + ex * k + fnx * (o || 0), y: el.y + ey * k + fny * (o || 0) });
  // the sleeve: a slim shoulder and upper arm
  celFill(ctx, () => animeCapsule(ctx, sh, el, 5.8 * U, 4.4 * U, 0.8 * U, 0.3), cl, A, { sd: 2.8 * U, hd: far ? 0 : 0.8 * U, rim: !far });
  // the guard over the upper arm (its top edge banded violet), the elbow cop, the forearm guard flaring at the wrist
  const g0 = up(0.46);
  celFill(ctx, () => animeCapsule(ctx, g0, el, 5 * U, 4.4 * U, 0.2 * U, 0.5), gt, A, { sd: 2.2 * U, hd: far ? 0 : 0.7 * U, detail: (g) => {
    const l = Math.hypot(ux, uy) || 1, nx = -uy / l * 4.8 * U, ny = ux / l * 4.8 * U, b = up(0.5);
    _strokePts(g, [[b.x + nx, b.y + ny], [b.x - nx, b.y - ny]], far ? vio[0] : vio[1], 1.8 * U);
  } });
  const w = at(0.9);
  celFill(ctx, () => animeCapsule(ctx, el, w, 4.4 * U, 3.8 * U, 0.6 * U, 0.35), gt, A, { sd: 2 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far ? null : (g) => {
    // the outer plate's lit ridge, the violet cuff at the wrist, a fine strap
    _strokePts(g, [[at(0.12, 2.4 * U).x, at(0.12, 2.4 * U).y], [at(0.84, 2 * U).x, at(0.84, 2 * U).y]], gt[2], 0.9 * A.s);
    const c0 = at(0.8, 4.4 * U), c1 = at(0.8, -4.4 * U); _strokePts(g, [[c0.x, c0.y], [c1.x, c1.y]], vio[1], 1.8 * U);
    const s0 = at(0.42, 4.4 * U), s1 = at(0.46, -4.4 * U); _strokePts(g, [[s0.x, s0.y], [s1.x, s1.y]], ANIME.outline, 1.2 * U);
    if (hol) hollowCrack(g, A, 1, [[at(0.2, 2 * U).x, at(0.2, 2 * U).y], [at(0.34, -1 * U).x, at(0.34, -1 * U).y], [at(0.52, 1.4 * U).x, at(0.52, 1.4 * U).y]], 0.7 * U);
  } });
  celFill(ctx, () => { ctx.moveTo(el.x + 3.2 * U, el.y); ctx.arc(el.x, el.y, 3.2 * U, 0, TAU); }, gt, A, { sd: 1.4 * U, hd: far ? 0 : 0.6 * U });
}

/* ---- the leg: a fitted legging, a tall boot with a violet band at the top, a knee guard; the thigh strap ---- */
function akariLeg(f, ctx, hp, kn, ft, A, skin, U, far) {
  const hol = f.hollow, vio = _akV(f), fc = f.facing;
  const cl = hol ? (far ? A.pal.back : A.pal.fab) : far ? [ANIME.face, AK_CLOTH[0], AK_CLOTH[1]] : AK_CLOTH;
  const gt = far ? [ANIME.face, AK_GUARD[0], AK_GUARD[1]] : hol ? A.pal.boot : AK_GUARD;
  const sx = ft.x - kn.x, sy = ft.y - kn.y, tx = kn.x - hp.x, ty = kn.y - hp.y, tl = Math.hypot(tx, ty) || 1;
  const sh = (k) => ({ x: kn.x + sx * k, y: kn.y + sy * k }), th = (k, o) => ({ x: hp.x + tx * k - ty / tl * (o || 0), y: hp.y + ty * k + tx / tl * (o || 0) });
  // the boot: from just below the knee to the ankle, the calf's curve in it
  const b0 = sh(0.14);
  celFill(ctx, () => animeCapsule(ctx, b0, ft, 5.9 * U, 4 * U, 1.1 * U, 0.3), gt, A, { sd: 2.6 * U, hd: far ? 0 : 0.7 * U, rim: !far, detail: (g) => {
    const l = Math.hypot(sx, sy) || 1, nx = -sy / l * 6 * U, ny = sx / l * 6 * U, b = sh(0.2);
    _strokePts(g, [[b.x + nx, b.y + ny], [b.x - nx, b.y - ny]], far ? vio[0] : vio[1], 2 * U);
    if (!far) { const a = sh(0.3), c = sh(0.86); _strokePts(g, [[a.x - nx * 0.5, a.y - ny * 0.5], [c.x - nx * 0.4, c.y - ny * 0.4]], gt[2], 0.8 * A.s); }
  } });
  // the thigh: full at the hip, tapering to the knee
  celFill(ctx, () => animeCapsule(ctx, hp, kn, 8.6 * U, 5.4 * U, 1.1 * U, 0.3), cl, A, { sd: 3.6 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far ? null : (g) => {
    animeFold(g, A, cl, () => { const a = th(0.62, -3.6 * U), b = th(0.72, 1.6 * U); g.moveTo(a.x, a.y); g.quadraticCurveTo(th(0.7, -1.2 * U).x, th(0.7, -1.2 * U).y, b.x, b.y); });
  } });
  // the knee guard: a small lacquered plate over the front of the knee
  const kx = kn.x + (-ty / tl) * 0 , ky = kn.y;
  celFill(ctx, () => { ctx.moveTo(kx + 3.4 * U, ky); ctx.ellipse(kx, ky, 3.6 * U, 3 * U, Math.atan2(sy, sx), 0, TAU); }, gt, A, { sd: 1.4 * U, hd: far ? 0 : 0.6 * U });
  // the foot: a slim boot with a clear sole
  celFill(ctx, () => animeFootPath(ctx, kn, ft, fc, 3.9 * U, 11 * U), gt, A, { sd: 1.6 * U, detail: (g) => {
    let ax = sx, ay = sy; const l = Math.hypot(ax, ay) || 1; ax /= l; ay /= l;
    const fx = fc > 0 ? ay : -ay, fy = fc > 0 ? -ax : ax, h = 3.6 * U;
    _strokePts(g, [[ft.x - fx * h + ax * h * 0.85, ft.y - fy * h + ay * h * 0.85], [ft.x + fx * 10 * U + ax * h * 0.85, ft.y + fy * 10 * U + ay * h * 0.85]], ANIME.metal1, 1.2 * U);
  } });
  if (far) return;
  // the near thigh: a strap round it with a small holster pouch on the outside
  const s0 = th(0.4, 7.4 * U), s1 = th(0.46, -7.4 * U);
  celFill(ctx, () => { const a = th(0.36, 7.6 * U), b = th(0.42, -7.6 * U), c = th(0.49, -7.4 * U), d = th(0.43, 7.4 * U); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath(); }, gt, A, { sd: 1 * U, seam: true });
  celFill(ctx, () => { const a = th(0.3, -1 * U), b = th(0.3, 5.6 * U), c = th(0.58, 5.2 * U), d = th(0.58, -0.6 * U); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath(); }, gt, A, { sd: 1.4 * U, hd: 0.5 * U, detail: (g) => {
    const a = th(0.38, -1 * U), b = th(0.38, 5.6 * U); _strokePts(g, [[a.x, a.y], [b.x, b.y]], ANIME.outline, 1 * A.s);
    const k = th(0.44, 2.4 * U); g.fillStyle = vio[1]; g.beginPath(); g.arc(k.x, k.y, 0.8 * U, 0, TAU); g.fill();
  } });
  void s0; void s1; void skin;
}

/* ---- the torso (drawArmor 'mei_en'): her fitted top; on anyone else (Kage) the garb's chest guard ---- */
// a slim figure: narrow waist, a modest chest, a gentle flare at the hip and seat; [u along the spine, w in units]
const AKARI_TORSO = {
  front: [[-0.16, 11.4], [0.04, 10.6], [0.3, 8.4], [0.5, 9.2], [0.66, 10.8], [0.8, 10.6], [0.92, 9], [1.02, 5.4], [1.08, 3.4]],
  back: [[1.08, -4.6], [0.98, -10.8], [0.82, -11], [0.6, -8.8], [0.36, -8], [0.14, -10.8], [-0.04, -12.6], [-0.16, -11.8]]
};
function drawMeiEn(ctx, f, ink, flat) {
  const A = f._A;
  if (!A || !A.S) { torsoShape(ctx, f.sk.hip, f.sk.neck, f.facing, f.build.w * f.scale * 0.55); return; }
  const S = A.S, U = A.U, P = _sP(S, U), hol = f.hollow, vio = _akV(f), skin = animeSkin(f);
  if (!skin.akari) {
    // Kage in the Mei-En Garb: a lacquered chest guard of two overlapping plates edged violet, over his coat
    for (const [u0, u1, w0, w1] of [[0.5, 0.92, -9, 11.6], [0.34, 0.62, -8, 11]]) {
      const a0 = P(u1, w0), a1 = P(u1, w1), b1 = P(u0, w1 - 1), b0 = P(u0, w0 + 1);
      celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 1.2 * U), AK_GUARD, A, { sd: 2.4 * U, hd: 0.8 * U, detail: (g) => _strokePts(g, [b0, b1], vio[1], 1.4 * U) });
    }
    void ink; void flat;
    return;
  }
  const cl = hol ? A.pal.fab : AK_CLOTH;
  celFill(ctx, () => animeTorso(ctx, S, AKARI_TORSO, U), cl, A, { sd: 5.6 * U, hd: 0.9 * U, rim: true, detail: (g) => {
    // the halter line, piped violet: from the collar down across the chest to under the far arm
    g.lineCap = 'round';
    _strokePts(g, [P(1.02, 4.4), P(0.86, 2), P(0.76, -3), P(0.72, -9)], cl[0], 2.4 * U);
    g.strokeStyle = vio[1]; g.lineWidth = 0.9 * U; g.beginPath();
    const a = P(1.02, 4.8), b = P(0.84, 1.6), c = P(0.75, -9.4);
    g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.stroke();
    // a soft fold under the chest and one at the waist (the fabric's fit, nothing more)
    animeFold(g, A, cl, () => { const p = P(0.56, 4), q = P(0.58, 9.2); g.moveTo(p[0], p[1]); g.quadraticCurveTo(P(0.54, 7.4)[0], P(0.54, 7.4)[1], q[0], q[1]); });
    animeFold(g, A, cl, () => { const p = P(0.34, -6.6), q = P(0.44, -3.4); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); });
    // the side seam from the armpit to the hip
    _strokePts(g, [P(0.8, -4.6), P(0.5, -2.6), P(0.2, -3.4)], cl[0], 1 * A.s);
    if (hol) { _tear(g, A, P(0.22, -7)[0], P(0.22, -7)[1], 2.6 * U, 2.2 * U, 0.4); hollowCrack(g, A, 1, [P(0.48, 6), P(0.42, 3), P(0.36, 5)], 0.7 * U); }
  } });
  // the high collar round the neck, its upper edge violet
  const n0 = { x: spX(S, 0.98, -0.4 * U), y: spY(S, 0.98, -0.4 * U) }, n1 = { x: spX(S, 1.12, 0.2 * U), y: spY(S, 1.12, 0.2 * U) };
  celFill(ctx, () => animeCapsule(ctx, n0, n1, 4.6 * U, 4.2 * U, 0.2 * U, 0.5), cl, A, { sd: 2 * U, hd: 0.6 * U, rim: true, detail: (g) => {
    const p = P(1.13, -4.2), q = P(1.13, 4.4); _strokePts(g, [p, q], vio[1], 1.1 * U);
  } });
  void ink; void flat;
}

/* ---- the head (drawHelmet 'akari_mask'): hair, fringe and side lock, the half-mask, the white eyes, the ornament ---- */
// the hair over the crown and the back of the head: the front edge is the fringe, sharp locks over the brow
const AK_HAIR_CAP = [[1.04, -0.36, 1], [0.98, -0.9], [0.4, -1.22], [-0.42, -1.16], [-0.96, -0.76], [-1.08, -0.14], [-0.98, 0.42], [-0.72, 0.84, 1],
  [-0.56, 0.4], [-0.36, 0.0], [-0.06, -0.34], [0.14, -0.22, 1], [0.26, -0.5], [0.46, -0.2, 1], [0.58, -0.5], [0.8, -0.24, 1], [0.8, -0.52]];
// the side lock: from the temple down in front of the ear, past the jaw, to a point
const AK_SIDE = [[0.02, -0.52], [0.22, -0.36], [0.2, 0.16], [0.24, 0.56], [0.2, 0.9, 1], [0.06, 0.5], [-0.06, 0.1], [-0.16, -0.3]];
// the half-mask over the lower face (clipped to the face): its top edge under the eyes, across the bridge
const AK_MASK_PTS = [[0.02, 0.16, 1], [0.5, 0.14], [1.1, 0.06, 1], [1.1, 1.2, 1], [0.0, 1.2, 1]];
function drawAkariHead(ctx, f, r, ink, flat) {
  const A = f && f._A;
  if (flat || !A || A.flat) {
    ctx.fillStyle = flat ? ink : AK_HAIR[1];
    ctx.beginPath(); orderShape(ctx, r, AK_HAIR_CAP); orderShape(ctx, r, AK_SIDE); ctx.fill();
    ctx.beginPath(); ctx.arc(-0.5 * r, -0.98 * r, 0.3 * r, 0, TAU); ctx.fill();
    return;
  }
  const hol = f.hollow, vio = _akV(f), t = f.time || 0, sv = _headLight(A, f), rf = r * 0.86;
  // the mask, clipped to the face, with two soft folds and a violet-lit top edge; the echo's cracked across
  ctx.save(); ctx.beginPath(); animeHeadPath(ctx, rf); ctx.clip();
  celFill(ctx, () => orderShape(ctx, r, AK_MASK_PTS), AK_MASK, A, { sd: r * 0.14, hd: r * 0.05, detail: (g) => {
    g.strokeStyle = AK_MASK[0]; g.lineWidth = Math.max(0.7, r * 0.04); g.beginPath();
    g.moveTo(0.3 * r, 0.4 * r); g.quadraticCurveTo(0.6 * r, 0.34 * r, 0.9 * r, 0.36 * r);
    g.moveTo(0.24 * r, 0.62 * r); g.quadraticCurveTo(0.5 * r, 0.56 * r, 0.8 * r, 0.62 * r); g.stroke();
    if (hol) hollowCrack(g, A, r, [[0.32, 0.2], [0.44, 0.42], [0.38, 0.6], [0.52, 0.86]], Math.max(0.6, r * 0.035));
  } });
  ctx.strokeStyle = vio[2]; ctx.globalAlpha *= 0.85; ctx.lineWidth = Math.max(0.8, r * 0.05); ctx.beginPath(); ctx.moveTo(0.04 * r, 0.16 * r); ctx.quadraticCurveTo(0.5 * r, 0.12 * r, 1.0 * r, 0.06 * r); ctx.stroke(); ctx.globalAlpha /= 0.85;
  ctx.restore();
  // the eyes: white almonds above the mask, a soft halo (violet-tinged; stronger on the echo), narrowed when striking
  if (f.eye !== 'rgba(0,0,0,0)') {
    const squint = f.state === 'move' || f.state === 'ability' ? 0.6 : f.state === 'hit' || f.state === 'stun' ? 0.75 : 1, hot = f.telegraph > 0;
    const eye = (x, y, w, h) => { ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h * 0.1); ctx.quadraticCurveTo(x + w * 0.05, y - h * 0.9, x - w * 0.5, y - h * 0.5); ctx.quadraticCurveTo(x - w * 0.05, y + h * 0.75, x + w * 0.5, y + h * 0.1); ctx.closePath(); };
    const ex = 0.42 * r, ey = -0.02 * r;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = hol ? 'rgba(170,130,255,0.5)' : 'rgba(226,212,255,0.26)'; eye(ex, ey, r * 0.6, r * 0.42 * squint); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = hot ? '#ffffff' : ANIME.eye;
    eye(ex, ey, r * 0.4, r * 0.22 * squint); ctx.fill();
    eye(0.8 * r, ey - 0.03 * r, r * 0.15, r * 0.17 * squint); ctx.fill();
    if (hot) { ctx.strokeStyle = f.eye; ctx.lineWidth = 2; const fl = r * (1 + 0.3 * Math.sin(t * 50)); ctx.beginPath(); ctx.moveTo(ex - fl, ey); ctx.lineTo(ex + fl, ey); ctx.moveTo(ex, ey - fl * 0.5); ctx.lineTo(ex, ey + fl * 0.5); ctx.stroke(); }
    ctx.restore();
  }
  // the hair over the crown, the fringe over the brow
  celFill(ctx, () => orderShape(ctx, r, AK_HAIR_CAP), AK_HAIR, A, { sd: r * 0.3, hd: r * 0.07, rim: true, detail: (g) => {
    // the violet sheen across the crown and a few lit strands into the fringe
    g.lineCap = 'round'; g.strokeStyle = '#4a3770'; g.lineWidth = Math.max(1, r * 0.09);
    g.beginPath(); g.moveTo(-0.72 * r, -0.84 * r); g.quadraticCurveTo(-0.1 * r, -1.14 * r, 0.56 * r, -0.94 * r); g.stroke();
    g.strokeStyle = AK_HAIR[2]; g.lineWidth = Math.max(0.7, r * 0.04); g.beginPath();
    for (const [x0, y0, x1, y1] of [[0.2, -0.9, 0.5, -0.3], [0.5, -0.92, 0.76, -0.34], [-0.1, -0.8, 0.18, -0.3], [-0.6, -0.6, -0.86, 0.3]]) { g.moveTo(x0 * r, y0 * r); g.quadraticCurveTo((x0 + x1) * 0.5 * r + 0.06 * r, (y0 + y1) * 0.5 * r, x1 * r, y1 * r); }
    g.stroke();
  } });
  // the side lock over the mask's edge
  celFill(ctx, () => orderShape(ctx, r, AK_SIDE), AK_HAIR, A, { sd: r * 0.1, hd: r * 0.05, detail: (g) => {
    g.strokeStyle = '#3a2a5a'; g.lineWidth = Math.max(0.7, r * 0.04); g.beginPath(); g.moveTo(0.08 * r, -0.36 * r); g.quadraticCurveTo(0.16 * r, 0.1 * r, 0.18 * r, 0.76 * r); g.stroke();
  } });
  // the tie at the ponytail's root and the sakura ornament on it (the echo's ashen, a petal gone)
  celFill(ctx, () => { ctx.moveTo(-0.26 * r, -0.98 * r); ctx.ellipse(-0.5 * r, -0.98 * r, 0.24 * r, 0.18 * r, -0.5, 0, TAU); }, [vio[0], vio[0], vio[1]], A, { sd: r * 0.06 });
  const sk = hol ? AK_SAKURA_H : AK_SAKURA;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = hol ? 'rgba(120,100,180,0.18)' : 'rgba(180,130,255,0.28)';
  ctx.beginPath(); ctx.arc(-0.42 * r, -0.9 * r, 0.5 * r, 0, TAU); ctx.fill(); ctx.restore();
  drawSakura(ctx, -0.42 * r, -0.9 * r, 0.46 * r, 0.3, sk[0], null, hol ? 3 : -1);
  drawSakura(ctx, -0.44 * r, -0.92 * r, 0.4 * r, 0.3, sk[1], sk[2], hol ? 3 : -1);
  A.lx = sv[0]; A.ly = sv[1];
}
// the bead strings from the ornament (cloth 'aribbon'): a short violet cord with beads down it and a tassel
function _akRibbons(f, ctx, A) {
  const r = BODY.head * f.scale * f.build.head, vio = _akV(f), root = _akHeadPt(f, -0.42 * r, -0.86 * r);
  for (const cl of f.cloths) {
    if (cl.kind !== 'aribbon' || !cl.c.init) continue;
    const c = cl.c, n = c.n;
    if (A.flat) { ctx.strokeStyle = A.col; ctx.lineWidth = 1.6 * A.s; ctx.beginPath(); ctx.moveTo(root[0], root[1]); for (let i = 1; i < n; i++) ctx.lineTo(c.px[i], c.py[i]); ctx.stroke(); continue; }
    ctx.strokeStyle = vio[0]; ctx.lineWidth = 1.4 * A.s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(root[0], root[1]); for (let i = 1; i < n; i++) ctx.lineTo(c.px[i], c.py[i]); ctx.stroke();
    for (let i = 1; i < n; i++) { ctx.fillStyle = i === n - 1 ? vio[2] : vio[1]; ctx.beginPath(); ctx.arc(c.px[i], c.py[i], (i === n - 1 ? 1.7 : 1.2) * A.s, 0, TAU); ctx.fill(); }
  }
}
