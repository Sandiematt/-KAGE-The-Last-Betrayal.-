/* ---- the torso (drawArmor 'shinsei'): his robe torso, crossed collar, capelet, clasp and cords; on Kage the capelet ---- */
// a broad, upright robed figure: [u along the spine, w in units]
const TK_TORSO = {
  front: [[-0.14, 12.8], [0.1, 12.2], [0.36, 11.8], [0.62, 13.2], [0.82, 14.4], [0.95, 12.6], [1.03, 6.8], [1.08, 3.8]],
  back: [[1.08, -5.6], [0.97, -14.6], [0.8, -15.2], [0.54, -12.8], [0.28, -12.6], [0.04, -14], [-0.14, -14]]
};

// the capelet: closed at the clasp below the collar, its hem sweeping down to the front and round the back
const TK_CAPELET = [[1.13, -5, 1], [1.13, 4.6, 1], [0.86, 7.4, 1], [0.7, 14.8], [0.6, 15.6, 1], [0.54, 6], [0.5, -6], [0.48, -15], [0.56, -18.4, 1], [0.86, -17.6], [1.04, -12]];

const TK_CAPELET_HEM = [[0.86, 7.4], [0.66, 15.2], [0.6, 15.6], [0.54, 6], [0.5, -6], [0.48, -15], [0.56, -18.4]];

function drawShinsei(ctx, f, ink, flat) {
  const A = f._A;
  const S = A.S, U = A.U, P = _sP(S, U), hol = _tkH(f), gold = _tkG(f), skin = animeSkin(f), tk = !!skin.takashi;
  if (tk) {
    // the robe torso: the outer robe's crossed collar of two gold-edged lapels over the dark inner kimono
    const cl = hol ? A.pal.fab : TK_ROBE;
    celFill(ctx, () => animeTorso(ctx, S, TK_TORSO, U), cl, A, { sd: 7 * U, hd: 1 * U, rim: true, detail: (g) => {
      const poly = (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
      poly([P(1.1, 0.4), P(1.1, 6.4), P(0.44, 13), P(0.36, 12.4)], hol ? A.pal.back[1] : TK_INNER[1]);
      _strokePts(g, [P(1.08, 1.6), P(0.48, 11.6)], gold[0], 0.9 * U);
      _strokePts(g, [P(1.1, 0.2), P(0.38, 12.2)], gold[1], 1.4 * U);
      _strokePts(g, [P(1.04, 6.8), P(0.44, 13.4)], cl[2], 1 * A.s);
      // folds from the armpit and over the belly
      _strokePts(g, [P(0.8, -3), P(0.52, -4.6), P(0.3, -3.6)], cl[0], 1 * A.s);
      animeFold(g, A, cl, () => { const a = P(0.36, 2), b = P(0.26, 8); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); });
      if (hol) hollowCrack(g, A, 1, [P(0.4, -8), P(0.32, -5), P(0.26, -7)], 0.7 * U);
    } });
  }
  // the capelet over the shoulders, edged gold
  const pts = _hsp(S, U, TK_CAPELET), tone = hol ? A.pal.coat : TK_CAPE;
  celFill(ctx, () => orderShape(ctx, 1, pts), tone, A, { sd: 4.6 * U, hd: 1.1 * U, rim: true, detail: (g) => {
    // two folds falling from the shoulder, the gold trim along the hem with a fine second line inside
    animeFold(g, A, tone, () => { const a = P(1.02, -8), b = P(0.6, -11); g.moveTo(a[0], a[1]); g.quadraticCurveTo(P(0.8, -11)[0], P(0.8, -11)[1], b[0], b[1]); });
    animeFold(g, A, tone, () => { const a = P(0.98, 2), b = P(0.62, 6); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); });
    if (hol) g.setLineDash([7 * U, 3 * U, 2 * U, 3 * U]);
    g.lineJoin = 'round';
    g.strokeStyle = gold[1]; g.lineWidth = 1.8 * U; g.beginPath(); orderShape(g, 1, pts); g.stroke();
    g.strokeStyle = gold[0]; g.lineWidth = 0.8 * U; g.beginPath();
    _hsp(S, U, TK_CAPELET_HEM).forEach((p, i) => { const q = [p[0] + S.ux * 2.4 * U, p[1] + S.uy * 2.4 * U]; i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); });
    g.stroke(); g.setLineDash([]);
    if (hol) { _tear(g, A, P(0.6, -9)[0], P(0.6, -9)[1], 3.4 * U, 3 * U, 0.3); hollowCrack(g, A, 1, [P(0.98, 2), P(0.86, -1), P(0.78, 2), P(0.66, 0)], 0.8 * U); }
  } });
  if (A.flat) { void ink; void flat; return; }
  // the cords swagged from the clasp across the capelet (the clasp itself is drawn over the near arm: takashiClasp)
  const cl0 = P(TK_CLASP[0], TK_CLASP[1]), clasp = { x: cl0[0], y: cl0[1] };
  for (const [u1, w1, sag] of [[0.62, -9, 5], [0.66, 14, 3]]) {
    const e = P(u1, w1), m = P((TK_CLASP[0] + u1) / 2 - sag * 0.03, (TK_CLASP[1] + w1) / 2);
    ctx.strokeStyle = gold[0]; ctx.lineWidth = 1.9 * U; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(clasp.x, clasp.y); ctx.quadraticCurveTo(m[0], m[1], e[0], e[1]); ctx.stroke();
    ctx.strokeStyle = gold[1]; ctx.lineWidth = 1.1 * U; ctx.beginPath(); ctx.moveTo(clasp.x, clasp.y); ctx.quadraticCurveTo(m[0], m[1], e[0], e[1]); ctx.stroke();
  }
  void tk;
}

// the clasp at the throat, the tassel under it: drawn after the near arm so the sleeve never hides it
const TK_CLASP = [0.8, 8.6];

function takashiClasp(f, ctx, A) {
  if (A.flat || !A.S) return;
  if (f.armor === 'shinsei') _tkClaspDraw(f, ctx, A);
  if (animeSkin(f).takashi && f.helmet === 'straw_kasa') {
    // the beard, in the head's frame as silhouette() sets it, with the light turned into it
    const sk = f.sk, r0 = BODY.head * f.scale * f.build.head;
    ctx.save(); ctx.translate(sk.head.x, sk.head.y); ctx.rotate(f.headRot || 0); ctx.scale(f.facing, 1);
    const sv = _headLight(A, f); _tkBeard(ctx, f, r0, A); A.lx = sv[0]; A.ly = sv[1];
    ctx.restore();
  }
}

function _tkClaspDraw(f, ctx, A) {
  const S = A.S, U = A.U, gold = _tkG(f), hol = _tkH(f);
  const clasp = { x: spX(S, TK_CLASP[0], TK_CLASP[1] * U), y: spY(S, TK_CLASP[0], TK_CLASP[1] * U) };
  _tkTassel(ctx, A, clasp, 6 * U, -S.ux, -S.uy, 2.2 * U, gold);
  // a gold disc, a dark ring and a gold dot (the Tachibana mark), a soft glow
  const R = 3.6 * U;
  if (!hol) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(240,190,80,0.16)'; ctx.beginPath(); ctx.arc(clasp.x, clasp.y, R * 2, 0, TAU); ctx.fill(); ctx.restore(); }
  celFill(ctx, () => { ctx.moveTo(clasp.x + R, clasp.y); ctx.arc(clasp.x, clasp.y, R, 0, TAU); }, gold, A, { sd: R * 0.32, hd: R * 0.16, detail: (g) => {
    g.strokeStyle = gold[0]; g.lineWidth = 0.9 * U; g.beginPath(); g.arc(clasp.x, clasp.y, R * 0.62, 0, TAU); g.stroke();
    g.fillStyle = gold[0]; g.beginPath(); g.arc(clasp.x, clasp.y, R * 0.22, 0, TAU); g.fill();
  } });
}
