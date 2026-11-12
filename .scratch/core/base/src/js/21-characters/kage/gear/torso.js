/* ---- torso overlays (spine frame: P(u, w), u 0 hip .. 1 neck, w across toward the front) ---- */
function drawGearArmor(ctx, f, key) {
  const A = f._A, S = A.S, U = A.U, P = _sP(S, U), acc = _gearAcc(key), coat = animeSkin(f).top === 'coat';
  switch (key) {
    case 'lamellar': {
      // Kozane-dō: rows of small lacquered scales laced bronze, a mune-ita and a gorget
      f.subKusazuri(ctx, A, S, U, 'back', { rows: 5, len: 1.05, panels: 3, acc: acc[1] });
      celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.full, U), SUB_LACQ, A, { sd: 7 * U, hd: 1 * U, rim: true, detail: (g) => {
        const Q = (k, tt) => P(lerp(0.06, 0.76, 1 - tt), lerp(-16, 16, k));
        _lace(g, A, Q, 7, 14, SUB_LACQ, 0.9 * U, acc[1]);
        // the scale heads: a lit dot at the top of every other scale
        g.fillStyle = SUB_LACQ[2];
        for (let i = 0; i < 7; i++) for (let j = 0; j < 14; j += 2) { const p = Q((j + 1) / 14, i / 7 + 0.01); g.fillRect(p[0] - 0.6 * U, p[1] - 0.6 * U, 1.2 * U, 1.2 * U); }
        _strokePts(g, [P(0.8, -17), P(0.8, 17)], ANIME.outline, 1.4 * U);
        _strokePts(g, [P(0.93, -6), P(0.9, 12)], SUB_LACQ[2], 1.1 * U);
      } });
      celFill(ctx, () => animeTorso(ctx, S, { front: [[0.88, 9.6], [1.0, 10.2], [1.06, 5]], back: [[1.06, -6.6], [1.0, -11.6], [0.88, -11.6]] }, U), SUB_LACQ, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => _strokePts(g, [P(0.95, -12), P(0.95, 11)], acc[1], 1.1 * U) });
      break;
    }
    case 'executioner_garb': {
      // Shikkō Garb: a long black leather vest to the hips, closed down the front with crimson stitching, a baldric
      // across the chest hung with iron rings, and a high collar
      const prof = { front: [[-0.2, 13.6], [0.1, 12.6], [0.4, 12.6], [0.66, 14], [0.84, 14.6], [0.94, 12.4], [1.0, 6.4]], back: [[1.0, -7.2], [0.94, -14], [0.76, -14.8], [0.5, -12.8], [0.2, -12.8], [-0.2, -14]] };
      celFill(ctx, () => animeTorso(ctx, S, prof, U), LEATHER, A, { sd: 6.6 * U, hd: 1 * U, rim: true, detail: (g) => {
        // the front closure and its stitching
        _strokePts(g, [P(0.98, 6), P(0.5, 9.6), P(-0.2, 10.6)], ANIME.outline, 1.4 * U);
        g.setLineDash([1.6 * U, 1.4 * U]); _strokePts(g, [P(0.96, 4.4), P(0.5, 8), P(-0.18, 9)], acc[1], 0.8 * U); g.setLineDash([]);
        // panel seams at the sides
        animeFold(g, A, LEATHER, () => { const a = P(0.9, -10), b = P(-0.16, -9); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); const c = P(0.3, 3), d = P(-0.18, 4); g.moveTo(c[0], c[1]); g.lineTo(d[0], d[1]); });
        // the baldric: from the far shoulder to the near hip, iron rings on it
        celFill(g, () => _poly(g, [P(1.0, -12), P(0.92, -14.4), P(0.06, 12.4), P(0.16, 14)]), ['#070605', '#110d0a', '#2a221b'], A, { sd: 1 * U, hd: 0.5 * U });
        for (const k of [0.3, 0.55, 0.8]) {
          const p = [lerp(P(0.96, -13)[0], P(0.11, 13.2)[0], k), lerp(P(0.96, -13)[1], P(0.11, 13.2)[1], k)];
          g.strokeStyle = ANIME.outline; g.lineWidth = 2.2 * U; g.beginPath(); g.arc(p[0], p[1], 2.1 * U, 0, TAU); g.stroke();
          g.strokeStyle = SUB_IRON[2]; g.lineWidth = 1 * U; g.beginPath(); g.arc(p[0], p[1], 2.1 * U, 0, TAU); g.stroke();
        }
      } });
      celFill(ctx, () => animeTorso(ctx, S, { front: [[0.9, 9], [1.02, 9.6], [1.12, 5]], back: [[1.12, -7], [1.02, -12], [0.9, -12]] }, U), LEATHER, A, { sd: 2.4 * U, hd: 0.8 * U, rim: true, detail: (g) => {
        g.setLineDash([1.4 * U, 1.2 * U]); _strokePts(g, [P(0.94, -11), P(0.95, 8.6)], acc[1], 0.7 * U); g.setLineDash([]);
      } });
      void coat;
      break;
    }
    case 'colossus_plate': {
      // Kurogane-dō: heavy iron bands riveted in silver, an ember seam between them, a tall gorget, iron kusazuri
      f.subKusazuri(ctx, A, S, U, 'back', { rows: 3, len: 1.2, panels: 3, acc: acc[0], iron: true, wide: 1.2 });
      celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.heavy, U), SUB_IRON, A, { sd: 7.4 * U, hd: 1.2 * U, rim: true, detail: (g) => {
        for (const u of [0.22, 0.42, 0.62, 0.8]) {
          _strokePts(g, [P(u - 0.012, -18), P(u - 0.012, 18)], SUB_IRON[2], 0.9 * A.s);
          _strokePts(g, [P(u, -18), P(u, 18)], ANIME.outline, 1.5 * A.s);
          _strokePts(g, [P(u + 0.014, -18), P(u + 0.014, 18)], acc[0], 0.9 * U);
          for (let w = -13; w <= 14; w += 5.4) { const p = P(u - 0.045, w); g.fillStyle = ANIME.silver; g.beginPath(); g.arc(p[0], p[1], 0.75 * U, 0, TAU); g.fill(); }
        }
        _strokePts(g, [P(0.94, -6), P(0.9, 13)], SUB_IRON[2], 1.2 * U);
      } });
      celFill(ctx, () => animeTorso(ctx, S, { front: [[0.86, 10.4], [1.0, 11], [1.1, 5.6]], back: [[1.1, -7.6], [1.0, -13], [0.86, -13]] }, U), SUB_IRON, A, { sd: 2.8 * U, hd: 0.9 * U, rim: true, detail: (g) => {
        _strokePts(g, [P(0.96, -13), P(0.96, 11)], acc[0], 1.3 * U);
        for (const w of [-9, -3, 3, 9]) { const p = P(1.02, w); g.fillStyle = ANIME.silver; g.beginPath(); g.arc(p[0], p[1], 0.7 * U, 0, TAU); g.fill(); }
      } });
      break;
    }
    case 'storm_mantle': {
      // Raiun Mantle: a storm-blue mantle over the shoulders to mid-chest, a lightning-cloud band along its hem, a glass
      // clasp at the throat (its streamer is cloth: gearCloths)
      const T = [[1.08, -6.4], [1.06, 7.4], [0.92, 13.4], [0.7, 15]], hem = [];
      const K = 8; for (let i = 0; i <= K; i++) { const k = i / K; hem.push([lerp(0.7, 0.62, k) - (i % 2 ? 0.05 : 0), lerp(15, -17.6, k)]); }
      const pts = T.concat(hem, [[0.88, -17.2], [1.02, -13.4]]).map(([u, w]) => P(u, w));
      celFill(ctx, () => _poly(ctx, pts), GEAR_STORM, A, { sd: 4.2 * U, hd: 0.9 * U, rim: true, detail: (g) => {
        _strokePts(g, [P(0.78, -17), P(0.8, 14)], acc[0], 2.4 * U);
        for (let i = 0; i < 4; i++) { const c = P(0.79, -13 + i * 8); cloudMotif(g, c[0], c[1], 2.6 * U, Math.atan2(S.dy, S.dx) + Math.PI / 2, acc[1], 0.9 * U); }
        _bolt(g, [P(0.98, -11), P(0.9, -8), P(0.94, -5.6), P(0.84, -2)], 0.6 * U, acc[2]);
        _strokePts(g, [P(0.96, -13.4), P(0.95, 8.4)], ANIME.outline, 1 * A.s);
      } });
      if (!A.flat) {
        const c = P(1.0, 8.4);
        ctx.fillStyle = ANIME.outline; ctx.beginPath(); ctx.arc(c[0], c[1], 3 * U, 0, TAU); ctx.fill();
        ctx.fillStyle = acc[1]; ctx.beginPath(); ctx.arc(c[0], c[1], 2.2 * U, 0, TAU); ctx.fill();
        ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(c[0] - 0.6 * U, c[1] - 0.6 * U, 0.8 * U, 0, TAU); ctx.fill();
      }
      break;
    }
  }
}
