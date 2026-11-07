/* KAGE — the Witness, Mirror of the Self, as an anime final boss (anime redesign, ticket 11), from its key art
   (boss_witness.webp, face_witness.webp). The most elaborate figure in the game: tall, thin, hovering, every layer
   edged in violet light with crimson veins running through the black armour:
     head      a tall jagged crown of black spikes (sharp hair), the tallest about 1.5 head radii over the brow, swept up
               and back, each spike edge-lit violet; a side spike framing the face. Under it the black face (the rule)
               with the key art's mask read as markings: two large, angular, upswept WHITE eyes with a violet halo, sharp
               lavender brow marks above them, violet tear lines under them and the faint seam of a black mask plate.
               No nose, no mouth. On a Kage-flicker frame the head is Kage's own hair and eyes.
     coat      a high-collared armoured coat: two collar blades standing up behind the head, a front collar beside the
               jaw, a black coat torso open over a lacquered breastplate with violet edges, three abdominal lames, crimson
               veins branching from the chest core, the core set in an angular bezel (a cracked empty socket once it
               breaks). Long blade-shaped coat tails (cloth 'wcoat', made in the Fighter constructor) black with a crimson
               lining edge, violet light gathering toward their tips, a violet vein, rune circles on some.
     arms      jagged layered pauldrons with a spike, black sleeves, armoured gauntlets with a flared spiked cuff
     legs      slim black legs with cuisses, pointed knee cops, greaves veined crimson and pointed sabatons
     waist     an armoured belt with a crimson gem and two jagged tassets
     halo      a great ring behind the shoulders: a glow, a dark band edged magenta and violet, a turning ring of notches,
               an inner dashed rune ring, four blades at the quarters (the top one tallest)
     core      the white-hot chest core in a violet bloom with its magenta ring, turning circuit ring and the rune cards
               trailing back from it (drawn over the near arm and under the blade, so it is never hidden)
     weapon    Mugen no Ha: obsidian memory shards edge-lit violet with a white core line, re-forming into whatever
               weapon it copies (drawShardWeapon)
   Its edge light is violet (skin.rimTint for the outline pass, witnessPal for the rim inside parts).
   The Kage-flicker (Fighter.draw `kageFrame`) draws the whole body with Kage's own skin (animeSkin), his coat panels and
   scarf tails (cloth marked `kageOnly`, made here) and his real blade, so the flicker is Kage's new design.
   Kage can wear the Kysmei Robe (Epilogue): a violet-edged crossed chest plate with a gem and crimson veins, a standing
   collar behind his own, and the robe's fragments drifting round him (Fighter.drawKysmei).
   Drawing only: no joint, timer or gameplay field is touched, and no randomness. */

const WT_CROWN = ['#020104', '#0a0811', '#251d3b'];
const WT_ARMOR = ['#040308', '#0e0b16', '#2c2342'];           // black lacquered plates with a violet cast
const WT_CLOTH = ['#030205', '#09070e', '#19132a'];
const WT_COAT = ['#030207', '#0b0914', '#231a38'];
const WT_FAR = ['#020103', '#050409', '#0e0b16'];
const WT_VIO = ['#3a1f78', '#8e5cf0', '#dccbff'];
const WT_CRIM = ['#4a0614', '#c41d3f', '#ff6b8a'];
const WT_EDGE = 'rgba(176,138,255,0.85)';                     // violet edge light on plate rims

/* ---- skin ---- */
ANIME_SKINS.witness = { top: 'gi', feet: 'witness', sleeve: 1, kote: false, collar: false, sash: 'witness', noGiSash: true, witness: 'boss', rimTint: [132, 86, 250] };
const _wtPalC = new WeakMap();
function witnessPal(pal) {
  let p = _wtPalC.get(pal);
  if (!p) _wtPalC.set(pal, p = Object.assign({}, pal, { rim: 'rgba(150,104,255,0.6)', acc: WT_CRIM[1], accHi: WT_CRIM[2], fab: WT_CLOTH, back: ['#020103', WT_CLOTH[0], WT_CLOTH[1]], coat: WT_COAT, coatB: WT_COAT, metal: WT_ARMOR }));
  return p;
}
// cloth (from animeCloths): what the Kage-flicker needs that the Witness has no use for, Kage's coat panels and scarf
// tails. The crown's long violet strands and the coat tails are made in the Fighter constructor.
function witnessCloths(f, sk) {
  if (!sk.witness) return;
  const s = f.scale;
  f.cloths.push({ kind: 'coat', part: 'back', kageOnly: 1, c: new Cloth(8, 12 * s, { ph: 2.2, wind: 1150, grav: 1000, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -4 });
  f.cloths.push({ kind: 'coat', part: 'flap', kageOnly: 1, c: new Cloth(7, 11.4 * s, { ph: 4.7, wind: 260, grav: 1250, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });
  f.cloths.push({ kind: 'scarf', kageOnly: 1, c: new Cloth(12, 7.4 * s, { ph: 9, wind: 1400, grav: 430, stiff: 1.85 }), at: 'neck', color: ANIME.scarf, rim: 'rgba(24,6,6,0.7)', w: 6.4 * s, w1: 2.2 * s, dy: -2, dx: 7 });
  f.cloths.push({ kind: 'scarf', kageOnly: 1, c: new Cloth(10, 7 * s, { ph: 12.5, wind: 1250, grav: 480, stiff: 1.85 }), at: 'neck', color: '#a8262c', rim: 'rgba(24,6,6,0.7)', w: 4.8 * s, w1: 1.6 * s, dy: 1, dx: 6 });
}

/* ---- helpers ---- */
// a jagged line a -> b: n segments alternating `amp` px either side (deterministic)
function _wtJag(a, b, n, amp, ph) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, out = [a];
  for (let i = 1; i < n; i++) { const u = i / n, z = (i % 2 ? 1 : -1) * amp * (0.6 + 0.4 * _hash(i * 3.7 + (ph || 0))); out.push([a[0] + dx * u + nx * z, a[1] + dy * u + ny * z]); }
  out.push(b); return out;
}
// a glowing vein: a dark groove, an additive bloom and a bright core (as _bolt, thinner)
function _wtVein(g, pts, w, col, glow) {
  const path = () => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); };
  g.lineJoin = 'miter'; g.lineCap = 'round';
  g.strokeStyle = ANIME.outline; g.lineWidth = w * 2.4; path(); g.stroke();
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= 0.4; g.strokeStyle = glow || col; g.lineWidth = w * 3.6; path(); g.stroke(); g.restore();
  g.strokeStyle = col; g.lineWidth = w; path(); g.stroke();
  g.lineJoin = 'round';
}
// a point in the frame of a limb a -> b: u along it, o px to its front (the fighter's facing side)
function _wtLimb(a, b, f) {
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = dy / l * f, ny = -dx / l * f;
  return { l, ux: dx / l, uy: dy / l, nx, ny, at: (u, o) => [a.x + dx * u + nx * o, a.y + dy * u + ny * o] };
}

/* ---- layers called from the body (21-anime-body.js) ---- */
function witnessLayer(f, ctx, A, skin, U, layer) {
  if (!skin.witness) return;
  if (layer === 'back') { _wtCollarBack(f, ctx, A, U); _wtTails(f, ctx, A, -1); }
  else if (layer === 'front') _wtTails(f, ctx, A, 1);
  else if (layer === 'waist') _wtBelt(f, ctx, A, A.S, U);
  else if (layer === 'core') { if (!f.coreBroken) f.drawCore(ctx, A.flat ? { color: A.col } : A.opt); }   // over the near arm, under the blade
}

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

/* ---- the high collar: two blades standing up behind the head ---- */
function _wtCollarBack(f, ctx, A, U) {
  const S = A.S, P = _sP(S, U), hr = BODY.head * f.scale * f.build.head, n = f.sk.neck;
  const up = [S.ux, S.uy], bk = [-S.nx, -S.ny], at = (k, b) => [n.x + up[0] * k * hr + bk[0] * b * hr, n.y + up[1] * k * hr + bk[1] * b * hr];
  const pts = [P(0.84, -10.5), at(1.75, 1.85), P(0.98, -6), at(2.15, 0.95), P(1.03, -1.5), at(1.2, 0.1), P(0.92, 2)];
  celFill(ctx, () => _poly(ctx, pts), WT_COAT, A, { sd: 3.6 * U, hd: 0.9 * U, rim: true, detail: A.flat ? null : (g) => {
    // the crimson lining inside the collar, the violet edge light along both blades
    g.fillStyle = WT_CRIM[0]; g.beginPath(); _poly(g, [P(0.9, -8), lerp2(pts[1], pts[2], 0.25), P(0.98, -4.6), lerp2(pts[3], pts[4], 0.3), P(1.0, -2.4)]); g.fill();
    _strokePts(g, [pts[0], pts[1], pts[2]], WT_EDGE, 1.2 * A.s);
    _strokePts(g, [pts[2], pts[3], pts[4]], WT_EDGE, 1.2 * A.s);
  } });
}
function lerp2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }

/* ---- the torso (drawArmor 'kysmei'): the Witness's armoured coat; the Kysmei Robe's chest plate on Kage ---- */
const WT_TORSO = {
  front: [[-0.14, 10.2], [0.1, 9.2], [0.36, 9], [0.62, 11.6], [0.82, 13.4], [0.95, 12.2], [1.03, 6.6], [1.08, 3.8]],
  back: [[1.08, -5.4], [0.97, -14], [0.8, -14.6], [0.54, -11.2], [0.28, -10], [0.04, -11.2], [-0.14, -11.2]]
};
function drawKysmeiArmor(ctx, f, ink, flat) {
  const A = f._A;
  if (f.kageFrame) return;   // the Kage-flicker wears Kage's own coat (animeSkin)
  if (!A || !A.S) { const sk = f.sk; torsoShape(ctx, sk.hip, sk.neck, f.facing, f.build.w * f.scale * 0.6); return; }
  const S = A.S, U = A.U, P = _sP(S, U), wit = !!animeSkin(f).witness;
  if (!wit) { _wtKageRobe(f, ctx, A, S, U, P); return; }
  const cp = f.corePos(), broken = !!f.coreBroken, fade = f.witFade();
  // the coat torso, open over the breastplate
  celFill(ctx, () => animeTorso(ctx, S, WT_TORSO, U), WT_COAT, A, { sd: 7 * U, hd: 1 * U, rim: true, detail: (g) => {
    _strokePts(g, [P(0.8, -2.5), P(0.5, -4.2), P(0.28, -3.4)], WT_COAT[0], 1 * A.s);
    _strokePts(g, [P(0.66, -9), P(0.4, -7.6)], WT_COAT[2], 0.8 * A.s);
    // a violet vein up the back
    g.save(); g.globalAlpha *= fade; _wtVein(g, _wtJag(P(0.12, -8), P(0.86, -10.5), 6, 1.2 * U, 2), 0.8 * A.s, '#9a6cf2'); g.restore();
  } });
  // the breastplate: a pointed plate from the collarbone to the ribs, edged violet
  const plate = [P(1.02, 0.6), P(1.0, 8.4), P(0.86, 12.6), P(0.66, 12.2), P(0.5, 8.2), P(0.46, 1.4), P(0.6, -2.2), P(0.86, -2.6)];
  celFill(ctx, () => _poly(ctx, plate), WT_ARMOR, A, { sd: 3.4 * U, hd: 1.2 * U, rim: true, detail: A.flat ? null : (g) => {
    _strokePts(g, [plate[1], plate[2], plate[3], plate[4]], WT_EDGE, 1.1 * A.s);
    _strokePts(g, [P(0.98, 3.6), P(0.62, 6.6)], WT_ARMOR[2], 1 * A.s);
    // crimson veins branching from the core down the plate
    g.save(); g.globalAlpha *= fade;
    const c0 = [cp.x, cp.y];
    for (const [u, w, ph] of [[0.5, 9.6, 1], [0.52, 3.2, 2], [0.94, 10.6, 3]]) _wtVein(g, _wtJag(c0, P(u, w), 4, 1.3 * U, ph), 0.9 * A.s, WT_CRIM[1], 'rgba(255,40,90,0.9)');
    g.restore();
    // the bezel round the core: an angular dark setting edged violet (cracked and empty once the core breaks)
    const R = 7.4 * A.s, dia = [[cp.x, cp.y - R * 1.3], [cp.x + R * 1.1, cp.y], [cp.x, cp.y + R * 1.3], [cp.x - R * 1.1, cp.y]];
    g.fillStyle = '#07040c'; g.beginPath(); _poly(g, dia); g.fill();
    _strokePts(g, [dia[0], dia[1], dia[2], dia[3], dia[0]], broken ? 'rgba(120,90,190,0.6)' : WT_EDGE, 1.2 * A.s);
    if (broken) {
      g.fillStyle = '#000'; g.beginPath(); g.arc(cp.x, cp.y, R * 0.62, 0, TAU); g.fill();
      _strokePts(g, [[cp.x - R * 0.5, cp.y - R * 0.9], [cp.x - R * 0.1, cp.y - R * 0.2], [cp.x + R * 0.4, cp.y - R * 0.5], [cp.x + R * 0.8, cp.y + R * 0.6]], 'rgba(167,123,255,0.55)', 0.9 * A.s);
    }
  } });
  // the abdominal lames under the plate, then the front collar standing beside the jaw
  for (let i = 0; i < 3; i++) {
    const u0 = 0.46 - i * 0.12, u1 = u0 - 0.11, w0 = 8.6 - i * 0.4;
    const q = [P(u0, -1.2), P(u0 + 0.01, w0), P(u1, w0 - 0.4), P(u1 - 0.01, -1.6)];
    celFill(ctx, () => _poly(ctx, q), WT_ARMOR, A, { sd: 1.6 * U, hd: 0.7 * U, detail: A.flat ? null : (g) => _strokePts(g, [q[1], q[2]], 'rgba(150,110,240,0.7)', 0.9 * A.s) });
  }
  const hr = BODY.head * f.scale * f.build.head, n = f.sk.neck, fr = [S.nx, S.ny], up = [S.ux, S.uy];
  const tip = [n.x + up[0] * 1.15 * hr + fr[0] * 0.15 * hr, n.y + up[1] * 1.15 * hr + fr[1] * 0.15 * hr];
  const col = [P(0.9, 1.4), tip, P(1.06, 6.2), P(0.94, 6.8)];
  celFill(ctx, () => _poly(ctx, col), WT_COAT, A, { sd: 2 * U, hd: 0.8 * U, rim: true, detail: A.flat ? null : (g) => _strokePts(g, [col[0], col[1], col[2]], WT_EDGE, 1.1 * A.s) });
}
// the Kysmei Robe on Kage: a standing collar behind his own, a violet-edged crossed chest plate with a gem and veins
function _wtKageRobe(f, ctx, A, S, U, P) {
  const hr = BODY.head * f.scale * f.build.head, n = f.sk.neck, up = [S.ux, S.uy], bk = [-S.nx, -S.ny];
  const at = (k, b) => [n.x + up[0] * k * hr + bk[0] * b * hr, n.y + up[1] * k * hr + bk[1] * b * hr];
  const col = [P(0.88, -9), at(1.35, 1.15), P(0.99, -4.6), at(1.6, 0.45), P(1.03, 0)];
  celFill(ctx, () => _poly(ctx, col), WT_COAT, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: A.flat ? null : (g) => _strokePts(g, [col[0], col[1], col[2], col[3]], WT_EDGE, 1.1 * A.s) });
  // the robe over the coat's upper body, its hem broken into points, a violet crossed collar, crimson veins and a rune
  // sigil on the back, a violet gem where the collar crosses
  const pts = _hsp(S, U, WT_ROBE);
  celFill(ctx, () => orderShape(ctx, 1, pts), WT_COAT, A, { sd: 5 * U, hd: 1 * U, rim: true, detail: A.flat ? null : (g) => {
    g.lineJoin = 'miter';
    _strokePts(g, pts.slice(5, 12), 'rgba(150,110,240,0.7)', 1 * A.s);
    _strokePts(g, [P(1.07, 0.6), P(0.62, 7.4), P(0.42, 11)], WT_ARMOR[0], 2.6 * U);
    _strokePts(g, [P(1.07, 0.6), P(0.62, 7.4), P(0.42, 11)], WT_EDGE, 1.2 * A.s);
    _strokePts(g, [P(1.04, 4.8), P(0.74, 9.6)], WT_COAT[2], 0.9 * A.s);
    for (const [a, b, ph] of [[P(0.34, -9.4), P(0.9, -11.2), 1], [P(0.4, -4), P(0.7, -9), 2]]) _wtVein(g, _wtJag(a, b, 5, 1.1 * U, ph), 0.8 * A.s, WT_CRIM[1], 'rgba(255,40,90,0.9)');
    const c = P(0.66, -7.2), rr = 3.4 * U;
    g.strokeStyle = 'rgba(190,150,255,0.85)'; g.lineWidth = 0.9 * A.s;
    g.beginPath(); g.arc(c[0], c[1], rr, 0, TAU); g.stroke(); g.beginPath(); g.arc(c[0], c[1], rr * 0.6, 0, TAU); g.stroke();
    g.beginPath(); g.moveTo(c[0], c[1] - rr * 0.55); g.lineTo(c[0] + rr * 0.45, c[1] + rr * 0.3); g.lineTo(c[0] - rr * 0.45, c[1] + rr * 0.3); g.closePath(); g.stroke();
    const gem = P(0.62, 7.4), R = 2.2 * U;
    g.fillStyle = '#07040c'; g.beginPath(); _poly(g, [[gem[0], gem[1] - R * 1.4], [gem[0] + R, gem[1]], [gem[0], gem[1] + R * 1.4], [gem[0] - R, gem[1]]]); g.fill();
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(167,123,255,0.35)'; g.beginPath(); g.arc(gem[0], gem[1], R * 1.9, 0, TAU); g.fill(); g.restore();
    g.fillStyle = '#b48aff'; g.beginPath(); g.arc(gem[0], gem[1], R * 0.62, 0, TAU); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(gem[0], gem[1], R * 0.3, 0, TAU); g.fill();
  } });
}
// the Kysmei Robe over Kage's coat [u, w(, sharp)]: shoulders to the ribs, the hem broken into points
const WT_ROBE = [[1.09, 3.9], [1.03, 7], [0.95, 12.6], [0.82, 14], [0.6, 12.8], [0.36, 11.4, 1], [0.24, 7.6, 1], [0.32, 4, 1], [0.2, 0.4, 1], [0.3, -3.4, 1], [0.18, -7.4, 1], [0.3, -12, 1],
  [0.55, -12.6], [0.8, -14.8], [0.97, -14], [1.09, -5.8]];

/* ---- the waist: an armoured belt with a crimson gem, two jagged tassets over the thighs ---- */
function _wtBelt(f, ctx, A, S, U) {
  const P = _sP(S, U), dn = [-S.ux, -S.uy], fr = [S.nx, S.ny];
  for (const [w0, w1, len, k] of [[-9.5, 1, 30, 0], [-0.5, 10, 36, 1]]) {
    const a = P(0.02, w0), b = P(0.02, w1), m = P(0.02, (w0 + w1) / 2);
    const L = len * U, tipx = m[0] + dn[0] * L + fr[0] * (k ? 3 : -4) * U, tipy = m[1] + dn[1] * L + fr[1] * (k ? 3 : -4) * U;
    const pts = [a, b, [b[0] + dn[0] * L * 0.62, b[1] + dn[1] * L * 0.62], [tipx, tipy], [lerp(a[0], b[0], 0.5) + dn[0] * L * 0.7, lerp(a[1], b[1], 0.5) + dn[1] * L * 0.7], [a[0] + dn[0] * L * 0.82, a[1] + dn[1] * L * 0.82]];
    celFill(ctx, () => _poly(ctx, pts), k ? WT_ARMOR : WT_FAR, A, { sd: 2.4 * U, hd: k ? 0.9 * U : 0, rim: true, detail: A.flat || !k ? null : (g) => {
      _strokePts(g, [pts[2], pts[3], pts[4], pts[5]], WT_EDGE, 1 * A.s);
      for (const t of [0.3, 0.58]) _strokePts(g, [[lerp(a[0], pts[5][0], t), lerp(a[1], pts[5][1], t)], [lerp(b[0], pts[2][0], t), lerp(b[1], pts[2][1], t)]], WT_ARMOR[0], 1.1 * A.s);
      g.save(); g.globalAlpha *= f.witFade(); _wtVein(g, _wtJag([lerp(a[0], b[0], 0.6), lerp(a[1], b[1], 0.6)], [tipx, tipy], 4, 1 * U, 5), 0.8 * A.s, WT_CRIM[1], 'rgba(255,40,90,0.9)'); g.restore();
    } });
  }
  const band = [P(-0.01, -11.6), P(-0.01, 10.6), P(0.12, 10.2), P(0.12, -11.2)];
  celFill(ctx, () => _poly(ctx, band), WT_ARMOR, A, { sd: 2.6 * U, hd: 0.7 * U, detail: A.flat ? null : (g) => {
    _strokePts(g, [P(0.105, -11.2), P(0.105, 10.2)], 'rgba(150,110,240,0.75)', 0.9 * A.s);
    _strokePts(g, [P(0.005, -11.6), P(0.005, 10.6)], WT_CRIM[0], 1.1 * A.s);
  } });
  if (A.flat) return;
  const gm = P(0.055, 8.4), R = 2.4 * U;
  celFill(ctx, () => _poly(ctx, [[gm[0], gm[1] - R * 1.3], [gm[0] + R, gm[1]], [gm[0], gm[1] + R * 1.3], [gm[0] - R, gm[1]]]), WT_CRIM, A, { sd: R * 0.4, hd: R * 0.25 });
}

/* ---- the arms: black sleeve, jagged layered pauldron with a spike, a spiked-cuff gauntlet ---- */
function witnessArm(f, ctx, sh, el, ha, A, U, far) {
  const fc = f.facing, cloth = far ? WT_FAR : WT_CLOTH, arm = far ? WT_FAR : WT_ARMOR, fade = f.witFade();
  celFill(ctx, () => animeCapsule(ctx, sh, el, 6.8 * U, 5.4 * U, 0.8 * U, 0.4), cloth, A, { sd: 3.4 * U, hd: far ? 0 : 0.8 * U, rim: !far });
  // the gauntlet: elbow to wrist, a flared spiked cuff at the elbow, violet seams and a crimson vein
  const G = _wtLimb(el, ha, fc), a = { x: G.at(0.02, 0)[0], y: G.at(0.02, 0)[1] }, b = { x: G.at(0.88, 0)[0], y: G.at(0.88, 0)[1] };
  celFill(ctx, () => animeCapsule(ctx, a, b, 5.2 * U, 4.1 * U, 0.3 * U, 0.4), arm, A, { sd: 2.4 * U, hd: far ? 0 : 0.9 * U, rim: !far, detail: far || A.flat ? null : (g) => {
    for (const u of [0.42, 0.66]) _strokePts(g, [G.at(u, -5.4 * U), G.at(u + 0.04, 5.4 * U)], WT_ARMOR[0], 1.2 * A.s);
    _strokePts(g, [G.at(0.12, 3.4 * U), G.at(0.86, 2.6 * U)], 'rgba(150,110,240,0.75)', 0.8 * A.s);
    g.save(); g.globalAlpha *= fade; _wtVein(g, _wtJag(G.at(0.2, -1.4 * U), G.at(0.84, -0.8 * U), 4, 0.9 * U, 7), 0.7 * A.s, WT_CRIM[1], 'rgba(255,40,90,0.9)'); g.restore();
  } });
  // the cuff: a jagged flare round the elbow end of the gauntlet, its spike pointing back past the elbow
  const cuff = [G.at(0.06, 6.4 * U), G.at(0.3, 5 * U), G.at(0.3, -5 * U), G.at(0.04, -6.8 * U), G.at(-0.22, -4.2 * U), G.at(-0.02, -2 * U), G.at(-0.12, 1.6 * U)];
  celFill(ctx, () => _poly(ctx, cuff), arm, A, { sd: 1.8 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far || A.flat ? null : (g) => _strokePts(g, [cuff[0], cuff[1]], WT_EDGE, 0.9 * A.s) });
  // the pauldron: three stacked lames down the upper arm, the top one with a spike rising up and back
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  const S = A.S, top = [sh.x - ax * 4 * U + S.ux * 1.5 * U, sh.y - ay * 4 * U + S.uy * 1.5 * U];
  for (let i = 2; i >= 0; i--) {
    const t0 = [top[0] + ax * i * 5.6 * U, top[1] + ay * i * 5.6 * U], [a0, a1, b1, b0] = _hang(t0, ax, ay, 11 * U, (17 - i * 1.6) * U, (20 - i * 2) * U);
    const tipB = [b0[0] + ax * 3.4 * U - ay * fc * 0 , b0[1] + ay * 3.4 * U];
    celFill(ctx, () => { ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.lineTo(b1[0], b1[1]); ctx.lineTo((b0[0] + b1[0]) / 2 + ax * 2 * U, (b0[1] + b1[1]) / 2 + ay * 2 * U); ctx.lineTo(tipB[0], tipB[1]); ctx.lineTo(b0[0], b0[1]); ctx.closePath(); }, arm, A, { sd: 2.4 * U, hd: far ? 0 : 0.9 * U, rim: !far, detail: far || A.flat ? null : (g) => {
      _strokePts(g, [b1, [(b0[0] + b1[0]) / 2 + ax * 2 * U, (b0[1] + b1[1]) / 2 + ay * 2 * U], tipB, b0], i === 0 ? WT_EDGE : 'rgba(150,110,240,0.6)', 1 * A.s);
    } });
  }
  // the spike: from the top lame up and back
  const bk = [-S.nx, -S.ny], up = [S.ux, S.uy], base0 = [top[0] + bk[0] * 6 * U, top[1] + bk[1] * 6 * U], base1 = [top[0] - bk[0] * 3 * U, top[1] - bk[1] * 3 * U];
  const spk = [top[0] + bk[0] * 9 * U + up[0] * 14 * U, top[1] + bk[1] * 9 * U + up[1] * 14 * U];
  celFill(ctx, () => _poly(ctx, [base0, spk, base1]), arm, A, { sd: 1.6 * U, hd: far ? 0 : 0.7 * U, rim: !far, detail: far || A.flat ? null : (g) => _strokePts(g, [base1, spk], WT_EDGE, 0.9 * A.s) });
}

/* ---- the legs: slim black legs, a cuisse, a pointed knee cop, a veined greave and a pointed sabaton ---- */
function witnessLeg(f, ctx, hp, kn, ft, A, U, far) {
  const fc = f.facing, cloth = far ? WT_FAR : WT_CLOTH, arm = far ? WT_FAR : WT_ARMOR, fade = f.witFade();
  const se = { x: lerp(kn.x, ft.x, 0.9), y: lerp(kn.y, ft.y, 0.9) };
  celFill(ctx, () => animeCapsule(ctx, kn, se, 7.4 * U, 5.6 * U, 0.6 * U, 0.4), cloth, A, { sd: 3.4 * U, hd: far ? 0 : 0.7 * U, rim: !far });
  celFill(ctx, () => animeCapsule(ctx, hp, kn, 9.4 * U, 7.6 * U, 1.2 * U, 0.42), cloth, A, { sd: 4.2 * U, hd: far ? 0 : 0.8 * U, rim: !far });
  // the cuisse: a plate down the front of the thigh
  const T = _wtLimb(hp, kn, fc), cu = [T.at(0.18, 9.6 * U), T.at(0.84, 8.2 * U), T.at(0.92, 2 * U), T.at(0.7, -2.6 * U), T.at(0.22, -1 * U)];
  celFill(ctx, () => _poly(ctx, cu), arm, A, { sd: 2.6 * U, hd: far ? 0 : 0.9 * U, detail: far || A.flat ? null : (g) => {
    _strokePts(g, [cu[0], cu[1], cu[2]], 'rgba(150,110,240,0.7)', 0.9 * A.s);
    _strokePts(g, [T.at(0.5, 8.8 * U), T.at(0.48, -1.6 * U)], WT_ARMOR[0], 1.1 * A.s);
  } });
  // the greave: down the front of the shin, a crimson vein along it
  const G = _wtLimb(kn, ft, fc), gr = [G.at(0.12, 7.6 * U), G.at(0.86, 6.2 * U), G.at(0.92, -1.4 * U), G.at(0.5, -4.6 * U), G.at(0.14, -3 * U)];
  celFill(ctx, () => _poly(ctx, gr), arm, A, { sd: 2.4 * U, hd: far ? 0 : 1 * U, rim: !far, detail: far || A.flat ? null : (g) => {
    _strokePts(g, [gr[0], gr[1]], WT_EDGE, 1 * A.s);
    g.save(); g.globalAlpha *= fade; _wtVein(g, _wtJag(G.at(0.2, 3 * U), G.at(0.86, 2.4 * U), 5, 1 * U, 9), 0.8 * A.s, WT_CRIM[1], 'rgba(255,40,90,0.9)'); g.restore();
  } });
  // the knee cop: a pointed plate, its point forward and up
  const kc = [G.at(-0.1, 7.6 * U), G.at(-0.3, 12 * U), G.at(0.16, 9.4 * U), G.at(0.2, -2.2 * U), G.at(-0.12, -3.6 * U)];
  celFill(ctx, () => _poly(ctx, kc), arm, A, { sd: 1.8 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far || A.flat ? null : (g) => _strokePts(g, [kc[0], kc[1], kc[2]], WT_EDGE, 0.9 * A.s) });
  // the sabaton: long, pointed
  celFill(ctx, () => animeFootPath(ctx, kn, ft, fc, 4.8 * U, 15 * U), arm, A, { sd: 1.8 * U, hd: far ? 0 : 0.7 * U, detail: far || A.flat ? null : (g) => {
    let sx = ft.x - kn.x, sy = ft.y - kn.y; const sl = Math.hypot(sx, sy) || 1; sx /= sl; sy /= sl;
    const fx = fc > 0 ? sy : -sy, fy = fc > 0 ? -sx : sx;
    _strokePts(g, [[ft.x + fx * 2 * U - sx * 2 * U, ft.y + fy * 2 * U - sy * 2 * U], [ft.x + fx * 13 * U + sx * 3 * U, ft.y + fy * 13 * U + sy * 3 * U]], 'rgba(150,110,240,0.7)', 0.9 * A.s);
  } });
}

/* ---- the head (drawHelmet 'witness_mask'): the crown of spikes, the masked black face's markings and white eyes ---- */
// the crown in head units (+x the face side): spikes swept up and back, a side spike framing the face, then the hairline
// back across the brow (it stays behind the eyes)
const WT_CROWN_PTS = [[0.6, -0.66, 1], [1.0, -1.5, 1], [0.45, -1.05, 1], [0.3, -2.55, 1], [0.04, -1.16, 1], [-0.5, -3.15, 1], [-0.42, -1.1, 1], [-1.34, -2.85, 1],
  [-0.82, -0.95, 1], [-2.15, -2.28, 1], [-1.06, -0.6, 1], [-2.8, -1.45, 1], [-1.16, -0.25, 1], [-2.75, -0.5, 1], [-1.1, 0.1, 1], [-2.2, 0.36, 1], [-1.0, 0.42, 1],
  [-1.45, 0.98, 1], [-0.58, 0.64, 1], [-0.12, 1.3, 1], [-0.06, 0.5, 1], [0.14, 1.02, 1], [0.08, 0.24, 1], [0.26, -0.42, 1]];
// the lit edges along the spikes (root, tip)
const WT_CROWN_LIT = [[[0.62, -0.8], [1.0, -1.5]], [[0.18, -1.2], [0.3, -2.55]], [[-0.3, -1.25], [-0.5, -3.15]], [[-0.7, -1.1], [-1.34, -2.85]], [[-1.0, -0.8], [-2.15, -2.28]],
  [[-1.12, -0.45], [-2.8, -1.45]], [[-1.12, -0.08], [-2.75, -0.5]], [[-1.04, 0.28], [-2.2, 0.36]], [[-0.7, 0.62], [-1.45, 0.98]], [[-0.1, 0.62], [-0.12, 1.3]]];
// the mask plate (head units): brow, cheek, the pointed chin, back along the jaw
const WT_MASK = [[0.14, -0.94, 1], [0.72, -0.88, 1], [1.0, -0.4, 1], [1.04, 0.2, 1], [0.86, 0.56, 1], [0.58, 1.1, 1], [0.32, 0.84, 1], [0.04, 0.52, 1], [0.0, -0.3, 1]];
function drawWitnessHead(ctx, f, r, ink, flat) {
  if (f && f.kageFrame) { drawKageHair(ctx, r, ink, flat, f); return; }   // the flicker: Kage's own hair (drawEyes adds his eyes)
  const A = f && f._A;
  if (flat || !A || A.flat) { ctx.fillStyle = flat ? ink : WT_CROWN[1]; ctx.beginPath(); orderShape(ctx, r, WT_CROWN_PTS); orderShape(ctx, r, WT_MASK); ctx.fill(); return; }
  const sv = _headLight(A, f), t = f.time || 0, fade = f.witFade();
  celFill(ctx, () => orderShape(ctx, r, WT_CROWN_PTS), WT_CROWN, A, { sd: r * 0.3, hd: r * 0.07, rim: true, detail: (g) => {
    g.lineCap = 'round';
    for (const [[x0, y0], [x1, y1]] of WT_CROWN_LIT) {
      g.strokeStyle = '#6c4bc4'; g.lineWidth = Math.max(0.8, r * 0.06); g.beginPath(); g.moveTo(x0 * r, y0 * r); g.quadraticCurveTo((x0 + x1) * 0.5 * r + r * 0.06, (y0 + y1) * 0.5 * r, x1 * r, y1 * r); g.stroke();
    }
    g.strokeStyle = WT_CRIM[1]; g.lineWidth = Math.max(0.6, r * 0.03); g.beginPath();
    for (const [[x0, y0], [x1, y1]] of [WT_CROWN_LIT[2], WT_CROWN_LIT[5]]) { g.moveTo(lerp(x0, x1, 0.2) * r, lerp(y0, y1, 0.2) * r); g.lineTo(lerp(x0, x1, 0.7) * r, lerp(y0, y1, 0.7) * r); }
    g.stroke();
  } });
  // violet edge light along the crown's top and back, additive
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.5 * fade; ctx.strokeStyle = '#7c4fe0'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.lineJoin = 'miter';
  ctx.beginPath(); for (let i = 1; i <= 17; i++) { const p = WT_CROWN_PTS[i]; i === 1 ? ctx.moveTo(p[0] * r, p[1] * r) : ctx.lineTo(p[0] * r, p[1] * r); } ctx.stroke(); ctx.restore();
  // the mask: a black plate over the face, angular at the cheek, its chin jutting to a point, rimmed lavender
  celFill(ctx, () => orderShape(ctx, r, WT_MASK), [ANIME.face, ANIME.face, '#15111f'], A, { sd: r * 0.12, hd: r * 0.05, detail: (g) => {
    g.strokeStyle = 'rgba(150,118,236,0.7)'; g.lineWidth = Math.max(0.8, r * 0.045); g.lineJoin = 'miter'; g.beginPath(); orderShape(g, r, WT_MASK); g.stroke();
  } });
  A.lx = sv[0]; A.ly = sv[1];
  if (f.eye === 'rgba(0,0,0,0)') return;
  // the mask's markings on the black face: the seam of the mask plate, sharp brow marks, violet tear lines
  const rf = r * 0.9, ey = rf * 0.06, hot = f.telegraph > 0;
  const squint = f.state === 'move' || f.state === 'ability' ? 0.6 : f.state === 'hit' || f.state === 'stun' ? 0.75 : 1;
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(120,92,200,0.55)'; ctx.lineWidth = Math.max(0.7, r * 0.035);
  ctx.beginPath(); ctx.moveTo(rf * 0.32, -rf * 0.92); ctx.quadraticCurveTo(rf * 0.18, rf * 0.2, rf * 0.42, rf * 1.02); ctx.stroke();
  ctx.strokeStyle = 'rgba(226,212,255,0.95)'; ctx.lineWidth = Math.max(1, r * 0.065);
  ctx.beginPath(); ctx.moveTo(rf * 0.86, ey - rf * 0.3); ctx.lineTo(rf * 0.5, ey - rf * 0.3); ctx.lineTo(rf * 0.2, ey - rf * 0.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rf * 1.0, ey - rf * 0.26); ctx.lineTo(rf * 0.88, ey - rf * 0.36); ctx.stroke();
  ctx.strokeStyle = 'rgba(167,123,255,0.9)'; ctx.lineWidth = Math.max(0.8, r * 0.045);
  ctx.beginPath(); ctx.moveTo(rf * 0.46, ey + rf * 0.2); ctx.lineTo(rf * 0.42, ey + rf * 0.56); ctx.moveTo(rf * 0.58, ey + rf * 0.2); ctx.lineTo(rf * 0.56, ey + rf * 0.42); ctx.stroke();
  // the eyes: large angular white shapes with a sharp upswept flick at the outer corner, a violet halo
  const eye = (x, y, w, h) => {
    ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h * 0.1);
    ctx.lineTo(x + w * 0.1, y - h * 0.62); ctx.lineTo(x - w * 0.62, y - h * 1.0);
    ctx.lineTo(x - w * 0.3, y + h * 0.3); ctx.quadraticCurveTo(x + w * 0.1, y + h * 0.62, x + w * 0.5, y + h * 0.1); ctx.closePath();
  };
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(167,123,255,${0.55 * fade + (hot ? 0.3 : 0)})`;
  ctx.beginPath(); ctx.ellipse(rf * 0.5, ey - rf * 0.06, rf * 0.46, rf * 0.3, -0.2, 0, TAU); ctx.fill();
  eye(rf * 0.5, ey, rf * 0.62, rf * 0.34 * squint); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = hot ? '#ffffff' : ANIME.eye;
  eye(rf * 0.5, ey, rf * 0.5, rf * 0.25 * squint); ctx.fill();
  eye(rf * 0.9, ey - rf * 0.03, rf * 0.16, rf * 0.18 * squint); ctx.fill();
  if (hot) { ctx.strokeStyle = '#a77bff'; ctx.lineWidth = 2; const fl = r * (1 + 0.3 * Math.sin(t * 50)), ex = rf * 0.5; ctx.beginPath(); ctx.moveTo(ex - fl, ey); ctx.lineTo(ex + fl, ey); ctx.moveTo(ex, ey - fl * 0.5); ctx.lineTo(ex, ey + fl * 0.5); ctx.stroke(); }
  ctx.restore();
}

/* ---- the halo: a great ring behind the shoulders ---- */
Fighter.prototype.drawWitnessHalo = function (ctx, opt) {
  const sk = this.sk, s = this.scale, f = this.facing, t = this.time || 0, hr = BODY.head * s * this.build.head, flat = !!opt.color;
  const cx = lerp(sk.neck.x, sk.head.x, 0.25) - f * hr * 1.35, cy = lerp(sk.neck.y, sk.head.y, 0.25) + hr * 0.1, R = hr * 3.5;
  const dark = flat ? opt.color : '#12071c', edge = '#ff5fae';
  ctx.save(); ctx.globalAlpha *= this.witFade();
  if (!flat) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(200,60,200,0.16)'; ctx.lineWidth = 14 * s; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(140,90,255,0.14)'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.arc(cx, cy, R * 0.82, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  // the band, edged magenta outside and violet inside
  ctx.strokeStyle = dark; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  if (!flat) {
    ctx.strokeStyle = `rgba(255,90,170,${0.8 + Math.sin(t * 3) * 0.15})`; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.arc(cx, cy, R + 2.4 * s, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(180,130,255,0.75)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.arc(cx, cy, R - 2.4 * s, 0, TAU); ctx.stroke();
  }
  // the inner rune ring, dashed, turning the other way
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-t * 0.4 * f);
  ctx.setLineDash([5 * s, 3 * s, 1.5 * s, 3 * s]); ctx.strokeStyle = flat ? opt.color : 'rgba(190,150,255,0.7)'; ctx.lineWidth = 1.4 * s;
  ctx.beginPath(); ctx.arc(0, 0, R * 0.82, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  // the notches, turning slowly
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.25 * f);
  for (let i = 0; i < 18; i++) {
    ctx.save(); ctx.rotate(i * TAU / 18);
    ctx.fillStyle = flat ? opt.color : i % 3 ? '#3d0f35' : edge; ctx.fillRect(R - 3.2 * s, -1 * s, 6.4 * s, 2 * s);
    ctx.restore();
  }
  ctx.restore();
  // four blades at the quarters, the top one tallest (these do not turn)
  for (const [a, len, w] of [[-Math.PI / 2, 26, 5], [0, 13, 3.6], [Math.PI, 13, 3.6], [Math.PI / 2, 16, 4]]) {
    const ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux, bx = cx + ux * (R - 3 * s), by = cy + uy * (R - 3 * s);
    ctx.fillStyle = dark; ctx.beginPath();
    ctx.moveTo(bx + px * w * s, by + py * w * s); ctx.lineTo(bx + ux * len * s, by + uy * len * s); ctx.lineTo(bx - px * w * s, by - py * w * s);
    ctx.lineTo(bx - ux * 5 * s, by - uy * 5 * s); ctx.closePath(); ctx.fill();
    if (!flat) { ctx.strokeStyle = edge; ctx.lineWidth = 1 * s; ctx.stroke(); }
  }
  ctx.restore();
};

/* ---- the chest core ---- */
// set in the breastplate, high on the chest toward the front
Fighter.prototype.corePos = function () {
  const sk = this.sk, s = this.scale, dx = sk.neck.x - sk.hip.x, dy = sk.neck.y - sk.hip.y, T = Math.hypot(dx, dy) || 1;
  const nx = -dy / T * this.facing, ny = dx / T * this.facing, w = 5.4 * s * clamp(this.build.w / 10, 0.9, 1.75);
  return { x: sk.hip.x + dx * 0.76 + nx * w, y: sk.hip.y + dy * 0.76 + ny * w };
};
// a white-hot orb in a violet bloom, a magenta ring, a slowly turning dashed circuit ring, the rune cards trailing back
Fighter.prototype.drawCore = function (ctx, opt) {
  const s = this.scale, t = this.time || 0, f = this.facing, { x, y } = this.corePos();
  if (opt.color) { ctx.fillStyle = opt.color; ctx.beginPath(); ctx.arc(x, y, 7 * s, 0, TAU); ctx.fill(); this.drawRuneCards(ctx, x, y, opt); return; }
  const pulse = 1 + Math.sin(t * 5) * 0.1, r = 5.2 * s * pulse, k = this.witFade();
  ctx.save(); ctx.globalAlpha *= k;
  this.drawRuneCards(ctx, x, y, opt);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 4.2);
  g.addColorStop(0, 'rgba(226,200,255,0.7)'); g.addColorStop(0.45, 'rgba(176,110,255,0.3)'); g.addColorStop(1, 'rgba(140,80,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4.2, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#1a0a1e'; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#ff4fa6'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.stroke();
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.9 * f);
  ctx.setLineDash([3 * s, 2.2 * s]); ctx.strokeStyle = 'rgba(255,140,220,0.9)'; ctx.lineWidth = 1.1 * s; ctx.beginPath(); ctx.arc(0, 0, r * 2.15, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#ff6fc0'; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.fillRect(Math.cos(a) * r * 2.15 - 1.2 * s, Math.sin(a) * r * 2.15 - 1.2 * s, 2.4 * s, 2.4 * s); }
  ctx.restore();
  ctx.fillStyle = '#b48aff'; ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
};
// the ofuda-like rune cards: five small dark-crimson tags trailing down and back from the core on a fine thread, each
// edged in glowing pink with a glyph, swaying on their own
Fighter.prototype.drawRuneCards = function (ctx, x, y, opt) {
  const s = this.scale, t = this.time || 0, f = this.facing, flat = !!opt.color, pts = [];
  for (let i = 0; i < 5; i++) {
    const a = 0.5 + i * 0.3 + Math.sin(t * 1.8 + i * 1.3) * 0.06, d = (16 + i * 8.5) * s;
    const ang = f > 0 ? Math.PI - a : a;
    pts.push([x + Math.cos(ang) * d, y + Math.sin(ang) * d + 3 * s, ang]);
  }
  if (!flat) { ctx.strokeStyle = 'rgba(255,110,190,0.6)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(x, y); for (const p of pts) ctx.lineTo(p[0], p[1]); ctx.stroke(); }
  pts.forEach(([cx, cy, ang], i) => {
    const w = (4.2 + (i === 2 ? 0.8 : 0)) * s, h = (9.6 + (i === 2 ? 1.6 : 0)) * s;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang - Math.PI / 2 + Math.sin(t * 2.2 + i) * 0.12);
    ctx.fillStyle = flat ? opt.color : '#2a0b1f'; ctx.fillRect(-w / 2, -h / 2, w, h);
    if (!flat) {
      ctx.strokeStyle = '#ff4f9a'; ctx.lineWidth = 0.9 * s; ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = 'rgba(255,170,220,0.95)'; ctx.lineWidth = 0.8 * s;
      ctx.beginPath(); ctx.moveTo(0, -h * 0.32); ctx.lineTo(0, h * 0.3); ctx.moveTo(-w * 0.25, -h * 0.1); ctx.lineTo(w * 0.25, -h * 0.1); ctx.moveTo(-w * 0.22, h * 0.14); ctx.lineTo(w * 0.22, h * 0.2); ctx.stroke();
    }
    ctx.restore();
  });
};

/* ---- the Kysmei Robe's fragments drifting round its wearer (Kage; the Witness wears its armoured coat instead) ---- */
// `depth` -1 draws the shards behind the body, +1 the ones in front. Each shard has an anchor along the torso (u: 0 the
// hip, 1 the neck, below 0 a broken skirt toward the knees), a side offset, a size and a slow drift of its own. While its
// wearer comes apart (dissolve) or the Witness's shards re-form (shardMorph) they drift away from the body.
const KYSMEI_SHARDS = Array.from({ length: 18 }, (_, i) => {
  const r = n => _hash(i * 7.3 + n);
  return { u: i < 7 ? -0.15 - r(1) * 0.75 : r(1) * 1.05, side: (r(2) - 0.5) * 2.4, sz: 0.55 + r(3) * 0.75, ph: r(4) * TAU, rate: 0.8 + r(5) * 1.2, rot: r(6) * TAU, depth: i % 3 === 0 ? -1 : 1, kind: i % 4 };
});
Fighter.prototype.drawKysmei = function (ctx, depth, opt) {
  const sk = this.sk, s = this.scale, t = this.time || 0, flat = !!opt.color;
  const hx = sk.hip.x, hy = sk.hip.y, nx = sk.neck.x, ny = sk.neck.y, ang = Math.atan2(ny - hy, nx - hx), px = Math.cos(ang + Math.PI / 2), py = Math.sin(ang + Math.PI / 2);
  const spread = 1 + (this.dissolve ? this.dissolve * 2.4 : 0) + (this.shardMorph > 0 ? this.shardMorph : 0), U = 15 * s;
  ctx.save(); ctx.lineJoin = 'miter';
  for (const d of KYSMEI_SHARDS) {
    // the shards over the middle of the body drift behind it, so the robe's chest plate stays clear
    if ((d.depth > 0 && Math.abs(d.side) > 0.62 ? 1 : -1) !== depth) continue;
    const dx = Math.sin(t * d.rate + d.ph) * 4 * s, dy = Math.cos(t * d.rate * 0.8 + d.ph) * 5 * s;
    const ox = lerp(hx, nx, d.u) + px * d.side * U * spread + dx * spread - this.facing * (d.u < 0 ? -d.u * 10 * s : 0);
    const oy = lerp(hy, ny, d.u) + py * d.side * U * spread + dy + (d.u < 0 ? Math.abs(d.side) * 2 * s : 0);
    const z = d.sz * U * (d.u < 0 ? 1.05 : 0.8) * (depth > 0 ? 0.8 : 1), rot = d.rot + Math.sin(t * d.rate * 0.6 + d.ph) * 0.35;
    ctx.save(); ctx.translate(ox, oy); ctx.rotate(rot);
    const pts = d.kind === 0 ? [[0, -z], [z * 0.55, z * 0.7], [-z * 0.5, z * 0.5]] : d.kind === 1 ? [[-z * 0.4, -z * 0.8], [z * 0.45, -z * 0.6], [z * 0.3, z * 0.9], [-z * 0.5, z * 0.6]]
      : d.kind === 2 ? [[0, -z * 1.1], [z * 0.3, 0], [0, z * 1.1], [-z * 0.3, 0]] : [[-z * 0.6, -z * 0.3], [z * 0.7, -z * 0.5], [z * 0.2, z * 0.7]];
    ctx.fillStyle = flat ? opt.color : depth < 0 ? '#120d1c' : '#0a0712'; ctx.beginPath(); _poly(ctx, pts); ctx.fill();
    if (!flat) {
      // a lit facet (one cel step) and the violet edge, a crimson vein on some
      ctx.fillStyle = depth < 0 ? '#1d1530' : '#211838'; ctx.beginPath(); _poly(ctx, [pts[0], pts[1], [(pts[0][0] + pts[pts.length - 1][0]) * 0.3, (pts[0][1] + pts[pts.length - 1][1]) * 0.3]]); ctx.fill();
      ctx.strokeStyle = depth < 0 ? 'rgba(167,123,255,0.4)' : 'rgba(196,166,255,0.85)'; ctx.lineWidth = 1.1 * s; ctx.beginPath(); _poly(ctx, pts); ctx.stroke();
      if (d.kind === 1 && depth > 0) { ctx.strokeStyle = WT_CRIM[1]; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(pts[0][0] * 0.6, pts[0][1] * 0.6); ctx.lineTo(0, 0); ctx.lineTo(pts[2][0] * 0.6, pts[2][1] * 0.6); ctx.stroke(); }
    }
    ctx.restore();
  }
  ctx.restore();
};

/* ---- Mugen no Ha: whatever weapon shape the Witness copies (sh), drawn as floating memory shards along its length ---- */
// a black grip with a violet tsuba, then obsidian shards edge-lit violet with a white core line and a soft bloom, gaps
// between them that bob apart, and the copied weapon's head (a hammer's block, a spear's point, a sickle's curve).
// After a weapon change (`shardMorph`) the shards scatter and re-form.
function drawShardWeapon(ctx, sh, L, mode, s, ink, f) {
  if (sh === 'none') return;
  const flat = mode !== 'ink', t = f.time || 0, morph = Math.max(0, f.shardMorph || 0) / 0.4;
  const pole = sh === 'spear' || sh === 'staff' || sh === 'hammer' || sh === 'sickle' || sh === 'hook';
  const grip = pole ? 0.12 : sh === 'short' || sh === 'kagehira' || sh === 'yurei' || sh === 'crescent' || sh === 'fan' ? 0.22 : 0.3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = flat ? ink : '#0c0912'; ctx.lineWidth = 4.2 * s; ctx.beginPath(); ctx.moveTo(-L * grip, 0); ctx.lineTo(0, 0); ctx.stroke();
  if (!flat) {
    ctx.strokeStyle = '#3a2a5e'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
    for (let i = 1; i < 6; i++) { const x = -L * grip * i / 6; ctx.moveTo(x - 1.4 * s, -2 * s); ctx.lineTo(x + 1.4 * s, 2 * s); }
    ctx.stroke();
    ctx.fillStyle = '#140c22'; ctx.beginPath(); ctx.moveTo(0, -6 * s); ctx.lineTo(2.6 * s, 0); ctx.lineTo(0, 6 * s); ctx.lineTo(-2.6 * s, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#b48aff'; ctx.lineWidth = 0.9 * s; ctx.stroke();
  }
  const shard = (x, y, len, w, rot, i) => {
    const j = Math.sin(t * 5 + i * 1.7) * 1.4 * s * (1 + morph * 14), jx = morph * Math.cos(i * 2.3) * 22 * s;
    ctx.save(); ctx.translate(x + jx, y + j); ctx.rotate(rot + morph * Math.sin(i * 3.1) * 1.4);
    const P = () => { ctx.beginPath(); ctx.moveTo(-len * 0.5, 0); ctx.lineTo(-len * 0.1, -w); ctx.lineTo(len * 0.5, -w * 0.3); ctx.lineTo(len * 0.2, w); ctx.closePath(); };
    if (flat) { ctx.fillStyle = ink; P(); ctx.fill(); ctx.restore(); return; }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(150,100,255,0.32)'; ctx.lineWidth = 4 * s; P(); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#150d26'; P(); ctx.fill();
    ctx.fillStyle = '#3a2470'; ctx.beginPath(); ctx.moveTo(-len * 0.5, 0); ctx.lineTo(-len * 0.1, -w); ctx.lineTo(len * 0.5, -w * 0.3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c9b0ff'; ctx.lineWidth = 0.9 * s; P(); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(-len * 0.36, -w * 0.12); ctx.lineTo(len * 0.36, -w * 0.32); ctx.stroke();
    ctx.restore();
  };
  const curve = sh === 'katana' || sh === 'odachi' || sh === 'shinsen' || sh === 'yurei' ? 0.05 : 0;
  const thin = pole ? 1.6 * s : sh === 'cleaver' || sh === 'odachi' ? 4.6 * s : 3.2 * s;
  const end = pole ? (sh === 'hammer' ? 0.78 : 0.86) : 1, n = Math.max(3, Math.round(L * end / (15 * s)));
  for (let i = 0; i < n; i++) {
    const u0 = 0.04 + (end - 0.04) * i / n, u1 = 0.04 + (end - 0.04) * (i + 0.78) / n, um = (u0 + u1) / 2;
    shard(L * um, -curve * L * um * um, L * (u1 - u0), thin * (1 - um * 0.3), 0, i);
  }
  // the copied weapon's head
  if (sh === 'spear') { shard(L * 0.93, 0, L * 0.16, 4.6 * s, 0, 40); }
  else if (sh === 'staff') { shard(L * 0.93, 0, L * 0.12, 2.4 * s, 0, 41); }
  else if (sh === 'hammer') { for (let k = 0; k < 4; k++) shard(L * (0.86 + (k % 2) * 0.08), (k < 2 ? -1 : 1) * 9 * s, 14 * s, 9 * s, Math.PI / 2, 42 + k); }
  else if (sh === 'sickle' || sh === 'hook') { for (let k = 0; k < 4; k++) { const a = -0.2 - k * 0.5; shard(L * 0.9 + Math.cos(a) * 18 * s, Math.sin(a) * 22 * s - 10 * s, 14 * s, 3.4 * s, a + Math.PI / 2, 46 + k); } }
  else if (sh === 'crescent' || sh === 'fan') { for (let k = 0; k < 3; k++) { const a = -0.9 + k * 0.6; shard(Math.cos(a) * L * 0.6, Math.sin(a) * L * 0.6, 16 * s, 4 * s, a + Math.PI / 2, 50 + k); } }
  else shard(L * 0.98, -curve * L * 0.96, 12 * s, thin * 0.8, -0.2, 39);   // a blade's point
}
