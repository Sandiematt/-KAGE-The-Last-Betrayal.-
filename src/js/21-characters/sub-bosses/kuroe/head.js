SUB_HEADS.sumi_eboshi = function (ctx, key, f, r, ink, flat, A, sv, t, acc, fill) {
  // a tall black lacquered court cap leaning back, its peak folded over; a pale dry-brush stroke of ink across it,
  // a censor's slip with black bars hanging from its back edge, gold chin cords
  fill([[-0.62, -0.5], [-1.22, -0.2], [-1.36, 0.82, 1], [-1.0, 0.86, 1], [-0.86, -0.1]], SUB_PAPER, { sd: r * 0.08, detail: (g) => {
    g.fillStyle = '#060505'; g.beginPath(); orderShape(g, r, [[-1.18, 0.12, 1], [-0.9, 0.08, 1], [-0.9, 0.24, 1], [-1.2, 0.28, 1]]); g.fill();
    g.beginPath(); orderShape(g, r, [[-1.28, 0.5, 1], [-0.94, 0.46, 1], [-0.95, 0.58, 1], [-1.3, 0.62, 1]]); g.fill();
  } });
  fill([[0.92, -0.3, 1], [0.8, -0.95], [0.52, -1.8], [0.2, -2.5], [-0.24, -2.84, 1], [-0.66, -2.62], [-1.0, -1.7], [-1.06, -0.72], [-0.98, -0.08, 1], [-0.4, -0.38], [0.4, -0.48]], SUB_LACQ, { sd: r * 0.32, hd: r * 0.08, rim: true, detail: (g) => {
    // folds of the stiff gauze and the pale ink stroke
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath();
    g.moveTo(r * 0.2, -r * 0.5); g.quadraticCurveTo(r * 0.1, -r * 1.6, -r * 0.18, -r * 2.6);
    g.moveTo(-r * 0.5, -r * 0.42); g.quadraticCurveTo(-r * 0.62, -r * 1.4, -r * 0.6, -r * 2.4); g.stroke();
    g.fillStyle = SUB_PAPER[1];
    g.beginPath(); g.moveTo(-r * 0.86, -r * 1.2); g.quadraticCurveTo(-r * 0.2, -r * 1.72, r * 0.62, -r * 1.42); g.lineTo(r * 0.5, -r * 1.3); g.quadraticCurveTo(-r * 0.15, -r * 1.48, -r * 0.84, -r * 1.06); g.closePath(); g.fill();
    g.fillStyle = SUB_LACQ[1];
    for (const [x, y] of [[-0.3, -1.36], [0.1, -1.44], [0.36, -1.42]]) { g.fillRect(r * x, r * y, r * 0.12, r * 0.05); }
    g.fillStyle = SUB_PAPER[0]; g.beginPath(); g.arc(r * 0.76, -r * 1.56, r * 0.05, 0, TAU); g.arc(r * 0.84, -r * 1.3, r * 0.035, 0, TAU); g.fill();
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.07; g.beginPath(); g.moveTo(-r * 0.98, -r * 0.16); g.quadraticCurveTo(0, -r * 0.5, r * 0.9, -r * 0.36); g.stroke();
  } });
  fill([[-0.24, -2.82], [-1.02, -3.02, 1], [-0.66, -2.44]], SUB_LACQ, { sd: r * 0.1, rim: true });
  if (!A.flat) { ctx.strokeStyle = acc[1]; ctx.lineWidth = Math.max(1, r * 0.06); ctx.beginPath(); ctx.moveTo(-r * 0.8, -r * 0.12); ctx.quadraticCurveTo(-r * 0.3, r * 1.12, r * 0.5, r * 0.92); ctx.stroke(); }
};
