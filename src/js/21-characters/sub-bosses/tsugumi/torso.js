SUB_ARMORS.shadow_cloak = function (ctx, f, key, A, S, U, P, acc, skin) {
  // the ash haori over the gi: open at the front, ash flecks, a violet himo tie; Tsugumi's satchel strap
  const prof = { front: [[-0.12, 13.4], [0.2, 12.6], [0.5, 13.6], [0.78, 14.8], [0.94, 13], [1.04, 7.4], [1.08, 4]], back: [[1.08, -5.6], [0.98, -14.2], [0.8, -15], [0.5, -12.8], [0.2, -12.8], [-0.12, -13.6]] };
  celFill(ctx, () => animeTorso(ctx, S, prof, U), ASH, A, { sd: 7 * U, hd: 1 * U, rim: true, detail: (g) => {
    g.fillStyle = skin.top === 'coat' ? A.pal.fab[1] : A.pal.fab[0];
    g.beginPath(); _poly(g, [P(1.06, 1.6), P(1.06, 13), P(-0.1, 14), P(0.1, 6.8), P(0.62, 4.6)]); g.fill();
    _strokePts(g, [P(1.06, 1.6), P(0.62, 4.6), P(0.1, 6.8)], ASH[2], 1.4 * U);
    _strokePts(g, [P(1.02, 2.8), P(0.62, 5.8), P(0.12, 7.8)], acc[1], 0.9 * U);
    _strokePts(g, [P(0.8, -2.5), P(0.5, -4), P(0.3, -3.2)], ASH[0], 1 * A.s);
    g.fillStyle = 'rgba(190,184,200,0.3)';
    for (let k = 0; k < 8; k++) { const p = P(0.15 + (k * 0.618 % 1) * 0.8, -12 + (k * 0.381 % 1) * 16); g.fillRect(p[0], p[1], 1.1 * A.s, 1.1 * A.s); }
    if (skin.sub === 'tsugumi') { _strokePts(g, [P(1.0, -9), P(0.12, 14)], '#050405', 3.4 * U); _strokePts(g, [P(1.0, -9), P(0.12, 14)], ASH[1], 1.2 * U); }
  } });
  if (!A.flat) {
    // the himo: a knot and two short tassels
    const k = P(0.66, 7.4), t1 = P(0.5, 8.6), t2 = P(0.52, 6.4);
    ctx.strokeStyle = acc[2]; ctx.lineWidth = 1.2 * U; ctx.beginPath(); ctx.moveTo(k[0], k[1]); ctx.lineTo(t1[0], t1[1]); ctx.moveTo(k[0], k[1]); ctx.lineTo(t2[0], t2[1]); ctx.stroke();
    ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(k[0], k[1], 1.5 * U, 0, TAU); ctx.fill();
  }
};
