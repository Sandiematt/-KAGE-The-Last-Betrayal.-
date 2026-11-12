SUBB_ARMORS.gate_plate = function (ctx, f, key, A, S, U, P, acc, skin, t, coat) {
  // a flat-fronted dō like a piece of the Fortress door: iron boards, two straps of gold studs, the kannuki bar
  f.subKusazuri(ctx, A, S, U, 'back', { rows: 3, len: 1.15, panels: 3, acc: acc[0], iron: true, wide: 1.2 });
  const prof = { front: [[0.0, 15.6], [0.3, 15], [0.56, 16.4], [0.8, 17.4], [0.93, 15.4], [0.99, 9]], back: [[0.99, -10], [0.93, -16.4], [0.74, -17.4], [0.5, -15.6], [0.26, -15.4], [0.0, -16.2]] };
  celFill(ctx, () => animeTorso(ctx, S, prof, U), SUB_IRON, A, { sd: 7 * U, hd: 1.2 * U, rim: true, detail: (g) => {
    // the boards: vertical seams with a lit edge
    for (const w of [-9.6, -3.2, 3.2, 9.6]) { _strokePts(g, [P(-0.02, w + 0.9), P(1.0, w + 0.9)], SUB_IRON[2], 0.8 * A.s); _strokePts(g, [P(-0.02, w), P(1.0, w)], ANIME.outline, 1.2 * A.s); }
    // the straps and their studs
    for (const u of [0.24, 0.78]) {
      celFill(g, () => _poly(g, [P(u - 0.05, -18), P(u - 0.05, 18), P(u + 0.05, 18), P(u + 0.05, -18)]), ['#060708', '#101114', '#262a30'], A, { sd: 1 * U, seam: true });
      for (let w = -14; w <= 15; w += 4.4) {
        const p = P(u, w);
        g.fillStyle = GOLDM[0]; g.beginPath(); g.arc(p[0], p[1], 1.7 * U, 0, TAU); g.fill();
        g.fillStyle = GOLDM[1]; g.beginPath(); g.arc(p[0] - 0.3 * U, p[1] - 0.3 * U, 1.1 * U, 0, TAU); g.fill();
        g.fillStyle = GOLDM[2]; g.beginPath(); g.arc(p[0] - 0.6 * U, p[1] - 0.6 * U, 0.45 * U, 0, TAU); g.fill();
      }
    }
    // the kannuki: a heavy iron bar across the middle, held in two gold brackets
    celFill(g, () => _poly(g, [P(0.46, -19), P(0.46, 20), P(0.56, 20), P(0.56, -19)]), ['#08090a', '#1c1e22', '#3d424a'], A, { sd: 1.6 * U, hd: 0.6 * U });
    for (const w of [-8, 9]) { _strokePts(g, [P(0.42, w), P(0.6, w)], ANIME.outline, 3.4 * U); _strokePts(g, [P(0.42, w), P(0.6, w)], GOLDM[1], 1.8 * U); }
  } });
  // the gorget
  celFill(ctx, () => animeTorso(ctx, S, { front: [[0.9, 10], [1.0, 10.6], [1.06, 5]], back: [[1.06, -7], [1.0, -12], [0.9, -12]] }, U), SUB_IRON, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => _strokePts(g, [P(0.96, -12), P(0.96, 11)], acc[0], 1.2 * U) });
};
