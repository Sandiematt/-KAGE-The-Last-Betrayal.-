/* ---- the torso (drawArmor 'mei_en'): her fitted top; on anyone else (Kage) the garb's chest guard ---- */
// a tall, powerful figure: a narrow waist between a full chest and wide hips and seat (the garb stays fitted and
// covered); [u along the spine, w in units]
const AKARI_TORSO = {
  front: [[-0.16, 15.6], [0.04, 14], [0.3, 8.4], [0.46, 10.8], [0.6, 15.8], [0.72, 17.6], [0.84, 14.8], [0.95, 9.8], [1.02, 5.8], [1.08, 3.4]],
  back: [[1.08, -4.8], [0.98, -11.4], [0.82, -11.4], [0.6, -8.8], [0.38, -7.8], [0.2, -13.8], [0.02, -19], [-0.12, -18], [-0.18, -15.4]]
};

function drawMeiEn(ctx, f, ink, flat) {
  const A = f._A;
  const S = A.S, U = A.U, P = _sP(S, U), hol = f.hollow, vio = _akV(f), skin = animeSkin(f);
  if (!skin.akari) {
    // Kage in the Mei-En Garb: a lacquered chest guard of two overlapping plates edged pink, over his coat
    for (const [u0, u1, w0, w1] of [[0.5, 0.92, -9, 11.6], [0.34, 0.62, -8, 11]]) {
      const a0 = P(u1, w0), a1 = P(u1, w1), b1 = P(u0, w1 - 1), b0 = P(u0, w0 + 1);
      celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 1.2 * U), AK_GUARD, A, { sd: 2.4 * U, hd: 0.8 * U, rim: true, detail: (g) => { _strokePts(g, [b0, b1], vio[1], 1.6 * U); _strokePts(g, [a1, b1], vio[2], 1 * U); } });
    }
    void ink; void flat;
    return;
  }
  const cl = hol ? A.pal.fab : AK_CLOTH;
  celFill(ctx, () => animeTorso(ctx, S, AKARI_TORSO, U), cl, A, { sd: 5.6 * U, hd: 0.9 * U, rim: true, detail: (g) => {
    // the halter line, piped pink: from the collar down across the chest to under the far arm
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
  // the high collar round the neck, its upper edge pink
  const n0 = { x: spX(S, 0.98, -0.4 * U), y: spY(S, 0.98, -0.4 * U) }, n1 = { x: spX(S, 1.12, 0.2 * U), y: spY(S, 1.12, 0.2 * U) };
  celFill(ctx, () => animeCapsule(ctx, n0, n1, 4.6 * U, 4.2 * U, 0.2 * U, 0.5), cl, A, { sd: 2 * U, hd: 0.6 * U, rim: true, detail: (g) => {
    const p = P(1.13, -4.2), q = P(1.13, 4.4); _strokePts(g, [p, q], vio[1], 1.1 * U);
  } });
  void ink; void flat;
}
