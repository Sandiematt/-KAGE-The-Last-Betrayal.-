/* KAGE — Rem, Kage's younger brother, as an anime samurai (anime redesign, ticket 07), from his portrait (face_rem.webp).
   One design in three ages, the same black face and white eyes as his brother but told apart at a glance:
     hair      Kage's is a tall, wild crown of long points thrown up and back; Rem's is lower and wind-swept, shorter
               spikes laid almost flat toward the back, with one fringe lock falling forward over the band
     head      Kage wears nothing on his head and a red scarf at his throat; Rem wears a WHITE HEADBAND with a silver
               ring at the temple and two long white tails streaming back (cloth), and no scarf
     accent    Kage's is crimson; Rem's is violet (obi edges, belt tails, coat lining, collar band)
     cut       Kage's long open coat falls to mid-calf over tall boots; Rem's travel coat is knee-length and wrapped shut
               under a wide violet collar band, over wrapped travel leggings (kyahan) and straw sandals
   The three Rem fighters:
     young_rem   the Interlude spar: a training gi with the sleeves tied back by a violet tasuki cord, bound forearms, a
                 violet-edged obi with its tails, a bokken. Young Kage stands beside him in a plain gi with full sleeves
                 and a short crimson training band (20-fighter.js headbandColor), so the brothers differ already as boys.
     rem         the adult look (no fighter def uses the id today; it is the design Hollow Rem copies, and the one a
                 later scene or ticket can put on screen): the travel coat above, a katana and saya
     hollow_rem  the Core's echo: the adult design under the Hollow treatment (23-anime-hollow.js): the coat torn into
                 points at the hem and frayed at the cuffs, the violet gone pale and broken, the band ashen and torn,
                 a cracked shard over one cheek, a rip across the chest; the glitch, ghost and ash dissolve sit on top
   The gear keys headband, training and travel_coat are enemy-only except young Kage's headband + training (the spar),
   which draws his own hair under a crimson band. Drawing only: nothing here moves a joint or touches gameplay. */

const REM_ACC = '#8a5cd6';
const REM_BAND = ['#a59e92', '#e4ded2', '#f6f2ea'];        // the headband: off-white cloth, never pure white
const REM_BAND_H = ['#3a3448', '#6c6484', '#968eae'];      // Hollow Rem's: ash, with only a violet cast
const REM_RING = ['#4a4c52', ANIME.silver, ANIME.silverHi];
const REM_TASUKI = ['#2c1a4c', '#6a44b0', '#9a74e0'];

/* ---- skins ---- */
ANIME_SKINS.young_rem = { top: 'gi', feet: 'sandal', sleeve: 0.94, kote: 'wrap', collar: false, sash: 'obi', acc: REM_ACC, rem: 'young' };
ANIME_SKINS.rem = { top: 'coat', coat: { w0: 20, w1: 38, fw0: 15, fw1: 28, len: 0.74, plain: true }, feet: 'sandal', wrapShin: true, sleeve: 1, sash: 'obi',
  saya: true, collar: false, kote: true, cuff: false, acc: REM_ACC, rem: 'adult' };
ANIME_SKINS.hollow_rem = { top: 'coat', feet: 'sandal', wrapShin: true, sleeve: 1, sash: 'hollow', saya: true, collar: false, kote: 'wrap', rem: 'hollow',
  coatPlain: true, hollow: { head: 'rem', top: 'rem', fray: 0.9, robe: { back: [7, 11, 20, 44], flap: [6, 10.4, 15, 28], teeth: 6, rag: 9 } } };

// the band's two long tails, streaming back from the knot (Hollow Rem's are ashen); called from animeCloths
function remCloths(f, sk) {
  if (!sk.rem || f.helmet !== 'headband') return;
  const s = f.scale, h = sk.rem === 'hollow';
  f.cloths.push({ kind: 'scarf', c: new Cloth(11, 7.4 * s, { ph: 9, wind: 950, grav: 520, stiff: 1.8 }), at: 'head', color: h ? REM_BAND_H[1] : REM_BAND[1], rim: h ? 'rgba(10,8,16,0.75)' : 'rgba(14,10,10,0.7)', w: 5 * s, w1: 1.4 * s, dy: -7, dx: 15 });
  f.cloths.push({ kind: 'scarf', c: new Cloth(9, 6.8 * s, { ph: 12.5, wind: 820, grav: 600, stiff: 1.8 }), at: 'head', color: h ? REM_BAND_H[0] : REM_BAND[0], rim: h ? 'rgba(10,8,16,0.75)' : 'rgba(14,10,10,0.7)', w: 4 * s, w1: 1.1 * s, dy: -4, dx: 15 });
}

/* ---- the head: wind-swept hair, the white band and its ring ---- */
// tip / valley pairs in head units (+x the face side). Kage's hair is a starburst, points thrown in every direction
// including forward over the brow; Rem's is a back-swept wedge: no forward points, the crown lower (tallest -1.56,
// Kage's -1.8) and the long points laid back past the nape (to -2.26), every edge bowed up and back as in the portrait
const REM_HAIR = [[0.62, -0.4], [0.9, -0.86], [0.2, -1.56], [0.12, -1.02], [-0.6, -1.58], [-0.42, -0.96], [-1.38, -1.38], [-0.86, -0.72], [-2.1, -0.98],
  [-1.04, -0.4], [-2.26, -0.34], [-1.08, -0.06], [-1.9, 0.32], [-0.96, 0.24], [-1.24, 0.76], [-0.58, 0.5]];
// two fringe locks hanging forward over the band, stopping just above the eye
const REM_BANG = [[0.3, -0.88], [0.86, -0.86], [1.04, -0.54], [0.98, -0.18, 1], [0.82, -0.44], [0.7, -0.14, 1], [0.54, -0.46], [0.36, -0.6]];
function remHairPath(ctx, r) {
  const H = REM_HAIR;
  ctx.moveTo(H[0][0] * r, H[0][1] * r);
  for (let i = 1; i < H.length; i++) {
    const p = H[i], q = H[i - 1];
    ctx.quadraticCurveTo((p[0] + q[0]) / 2 * r - 0.06 * r, (p[1] + q[1]) / 2 * r - 0.14 * r, p[0] * r, p[1] * r);
  }
  // the hairline from the nape round under the crown to the brow
  ctx.quadraticCurveTo(-0.2 * r, 0.1 * r, 0.1 * r, -0.26 * r);
  ctx.quadraticCurveTo(0.36 * r, -0.4 * r, H[0][0] * r, H[0][1] * r);
  ctx.closePath();
}
// the band across the brow (head frame): a strip from the knot at the back of the head round to the brow
function remBandPath(ctx, r) {
  ctx.moveTo(-r * 1.04, -r * 0.56); ctx.quadraticCurveTo(0, -r * 0.58, r * 1.02, -r * 0.4);
  ctx.lineTo(r * 1.02, -r * 0.15); ctx.quadraticCurveTo(0, -r * 0.32, -r * 1.02, -r * 0.3); ctx.closePath();
}
function drawRemHead(ctx, f, r, ink, flat) {
  const A = f && f._A, sk = f && animeSkin(f), hol = sk && sk.rem === 'hollow';
  if (flat || !A || A.flat) {
    ctx.fillStyle = flat ? ink : A ? A.pal.hair[1] : ink;
    ctx.beginPath(); remHairPath(ctx, r); ctx.fill();
    ctx.beginPath(); orderShape(ctx, r, REM_BANG); ctx.fill();
    return;
  }
  const pal = A.pal, sv = _headLight(A, f);
  celFill(ctx, () => remHairPath(ctx, r), pal.hair, A, { sd: r * 0.3, hd: r * 0.06, rim: true, detail: (g) => {
    // lit strands combed back along the long points
    g.strokeStyle = pal.hair[2]; g.lineWidth = Math.max(0.8, r * 0.05); g.lineCap = 'round'; g.beginPath();
    for (const [x0, y0, cx, cy, x1, y1] of [[0.3, -0.86, 0.0, -1.0, -0.4, -1.32], [-0.1, -0.8, -0.6, -0.92, -1.1, -1.1], [-0.4, -0.6, -1.1, -0.66, -1.8, -0.76], [-0.5, -0.3, -1.2, -0.2, -1.8, -0.18], [0.4, -0.7, 0.44, -1.0, 0.46, -1.3]]) {
      g.moveTo(x0 * r, y0 * r); g.quadraticCurveTo(cx * r, cy * r, x1 * r, y1 * r);
    }
    g.stroke();
  } });
  // the band, wrapped round the head over the hair; the hollow one is torn through at the front
  const band = hol ? REM_BAND_H : REM_BAND;
  celFill(ctx, () => remBandPath(ctx, r), band, A, { sd: r * 0.1, hd: r * 0.04, detail: (g) => {
    g.strokeStyle = band[0]; g.lineWidth = Math.max(0.6, r * 0.035); g.beginPath();
    g.moveTo(-r * 0.7, -r * 0.42); g.quadraticCurveTo(-r * 0.1, -r * 0.46, r * 0.5, -r * 0.34); g.stroke();
    if (hol) {
      g.fillStyle = ANIME.face; g.beginPath(); g.moveTo(r * 0.5, -r * 0.6); g.lineTo(r * 0.62, -r * 0.4); g.lineTo(r * 0.54, -r * 0.18); g.lineTo(r * 0.72, -r * 0.18); g.lineTo(r * 0.78, -r * 0.6); g.closePath(); g.fill();
      g.strokeStyle = pal.acc; g.lineWidth = Math.max(0.6, r * 0.04); g.beginPath(); g.moveTo(r * 0.5, -r * 0.6); g.lineTo(r * 0.62, -r * 0.4); g.lineTo(r * 0.54, -r * 0.18); g.stroke();
    }
  } });
  // the knot at the back of the head
  celFill(ctx, () => { ctx.moveTo(-r * 0.89, -r * 0.43); ctx.ellipse(-r * 1.04, -r * 0.43, r * 0.15, r * 0.2, 0.3, 0, TAU); }, band, A, { sd: r * 0.06 });
  // the fringe lock falling over the band
  celFill(ctx, () => orderShape(ctx, r, REM_BANG), pal.hair, A, { sd: r * 0.12, hd: r * 0.04, rim: true });
  // the silver ring on the band at the temple (tarnished on the echo), its hole showing the black of the head
  const rx = r * 0.1, ry = -r * 0.33, R = r * 0.19;
  celFill(ctx, () => { ctx.moveTo(rx + R, ry); ctx.arc(rx, ry, R, 0, TAU); ctx.moveTo(rx + R * 0.52, ry); ctx.arc(rx, ry, R * 0.52, 0, TAU, true); },
    hol ? ['#2a2732', '#55505f', '#7d778a'] : REM_RING, A, { sd: R * 0.4, hd: R * 0.2 });
  if (hol) _maskPiece(ctx, A, r, [[0.34, -0.12, 1], [0.66, -0.16, 1], [0.6, 0.38, 1], [0.44, 0.62, 1], [0.32, 0.3, 1]], [[0.5, -0.12], [0.44, 0.18], [0.52, 0.44]], false);
  A.lx = sv[0]; A.ly = sv[1];
}

/* ---- the body ---- */
// layers called from the body (21-anime-body.js): 'waist' at the sash. Young Rem's tasuki cord, crossed over the gi to
// tie back his sleeves
function remLayer(f, ctx, A, skin, U, layer) {
  if (skin.rem !== 'young' || layer !== 'waist') return;
  const S = A.S, P = (u, w) => ({ x: spX(S, u, w * U), y: spY(S, u, w * U) });
  for (const [a, b] of [[P(1.0, -9), P(0.42, 11.6)], [P(0.98, 7.4), P(0.5, -12.4)]]) {
    celFill(ctx, () => animeCapsule(ctx, a, b, 1.8 * U, 1.5 * U, 0, 0.5), REM_TASUKI, A, { sd: 0.8 * U, hd: 0.4 * U });
  }
  if (A.flat) return;
  // the knot where the cords cross at the back
  const k = P(0.8, -8.6);
  celFill(ctx, () => { ctx.moveTo(k.x + 2 * U, k.y); ctx.arc(k.x, k.y, 2 * U, 0, TAU); }, REM_TASUKI, A, { sd: 0.8 * U, hd: 0.4 * U });
}
// the travel coat over the torso (drawArmor 'travel_coat'): wrapped shut left over right under a wide violet collar
// band, a stitched patch on the back of the shoulder, a fold at the waist; on Hollow Rem the band is broken and a rip
// opens across the chest. Drawn clipped to the torso, after it.
function drawRemCoat(ctx, f, ink, flat) {
  const A = f._A;
  if (!A || !A.S || A.flat || flat) return;
  const S = A.S, U = A.U, pal = A.pal, hol = animeSkin(f).rem === 'hollow';
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const line = (pts, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); };
  const acc = hol ? [ANIME.cloth0, '#3c3060', '#6a5a9c'] : subTone(REM_ACC);
  ctx.save(); ctx.beginPath(); animeTorso(ctx, S, ANIME_TORSO.coat, U); ctx.clip();
  ctx.lineCap = 'round';
  // the overlap: the front panel's edge running from the throat down to the obi, its shadow on the panel under it
  line([P(1.06, 2.6), P(0.62, 9.4), P(0.08, 11.6)], ANIME.outline, 2.4 * U);
  line([P(1.0, 1.4), P(0.6, 8.2), P(0.1, 10.4)], pal.coat[0], 1.4 * U);
  // the wide violet collar band along that edge, to mid-chest
  const band = () => { const a = P(1.1, -0.6), b = P(0.52, 7.6), c = P(0.5, 10.6), d = P(1.1, 3.2); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  celFill(ctx, band, [acc[0], acc[1], acc[2]], A, { sd: 1.2 * U, hd: 0.5 * U, detail: hol ? (g) => {
    // broken: gaps eaten out of the band
    g.fillStyle = pal.coat[1];
    for (const [u, w] of [[0.86, 4.4], [0.64, 8.2]]) { const p = P(u, w); g.beginPath(); g.moveTo(p[0] - 2 * U, p[1] - 2 * U); g.lineTo(p[0] + 2.6 * U, p[1]); g.lineTo(p[0] - 1 * U, p[1] + 2.4 * U); g.closePath(); g.fill(); }
  } : null });
  // folds from the armpit and at the waist under the obi
  line([P(0.82, -2.6), P(0.54, -4.2), P(0.32, -3.4)], pal.coat[0], 1 * A.s);
  line([P(0.36, 2), P(0.24, 5.4)], pal.coat[0], 1 * A.s);
  // a patch stitched over the back of the shoulder: the coat has been mended on the road
  const q = [P(0.9, -11), P(0.92, -5.4), P(0.7, -5.8), P(0.68, -11.4)];
  ctx.fillStyle = pal.coat[0]; ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill();
  ctx.setLineDash([1.4 * U, 1.2 * U]); ctx.strokeStyle = hol ? 'rgba(150,130,200,0.45)' : 'rgba(170,150,214,0.5)'; ctx.lineWidth = 0.7 * A.s; ctx.stroke(); ctx.setLineDash([]);
  if (hol) {
    // a rip across the chest, its lips frayed violet
    const pts = _hsp(S, U, [[0.5, 2, 1], [0.44, 6, 1], [0.38, 11, 1], [0.42, 8.6, 1], [0.48, 5.4, 1]]);
    ctx.fillStyle = ANIME.face; ctx.beginPath(); orderShape(ctx, 1, pts); ctx.fill();
    line(pts.slice(2).concat([pts[0]]), pal.acc, 0.9 * A.s);
  }
  ctx.restore();
}
