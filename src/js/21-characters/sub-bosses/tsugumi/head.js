SUB_HEADS.courier_hat = function (ctx, key, f, r, ink, flat, A, sv, t, acc, fill) {
  // a short bob of hair under a wide, flat courier's hat tilted forward; three glass vials of stored memory hang
  // from its brim, one swinging; a pale chin cord
  fill([[-0.2, -0.6], [-1.0, -0.54], [-1.16, 0.3], [-0.84, 0.9, 1], [-0.62, 0.42], [-0.4, 0.84, 1], [-0.3, 0.1]], A.pal.hair, { sd: r * 0.2, hd: r * 0.05, rim: true });
  if (!A.flat) { ctx.strokeStyle = SUB_PAPER[0]; ctx.lineWidth = Math.max(1, r * 0.05); ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.5); ctx.quadraticCurveTo(-r * 0.1, r * 1.16, r * 0.76, r * 0.6); ctx.stroke(); }
  fill([[-0.08, -0.62], [-0.84, -0.92], [-0.1, -1.28], [0.66, -0.94]], [ASH[0], ASH[1], ASH[2]], { sd: r * 0.12, hd: r * 0.04 });
  fill([[-2.12, -0.52, 1], [-0.8, -0.96], [0.04, -1.3], [0.9, -0.96], [2.32, -0.42, 1], [2.24, -0.24, 1], [0.1, -0.56], [-2.04, -0.34, 1]], ['#0c0b0e', '#19171d', '#302c38'], { sd: r * 0.16, hd: r * 0.05, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.04; g.beginPath();
    for (const x of [-1.5, -0.9, -0.35, 0.45, 1.0, 1.6]) { g.moveTo(r * 0.04, -r * 1.26); g.lineTo(r * x, -r * (0.48 + Math.abs(x) * 0.02)); }
    g.stroke();
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.07; g.beginPath(); g.moveTo(-r * 2.04, -r * 0.4); g.quadraticCurveTo(0, -r * 0.66, r * 2.24, -r * 0.3); g.stroke();
    g.strokeStyle = acc[0]; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(-r * 0.64, -r * 0.9); g.quadraticCurveTo(0, -r * 1.06, r * 0.62, -r * 0.88); g.stroke();
  } });
  for (let i = 0; i < 3; i++) {
    const vx = r * [-1.7, -0.95, 1.55][i], sw = i === 1 ? Math.sin(t * 3) * r * 0.12 : Math.sin(t * 2 + i) * r * 0.03, vy = -r * 0.44 + r * 0.05 * i, bx = vx + sw, by = vy + r * 0.42;
    if (!A.flat) { ctx.strokeStyle = SUB_PAPER[0]; ctx.lineWidth = Math.max(0.8, r * 0.03); ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(bx, by); ctx.stroke(); }
    celFill(ctx, () => { if (ctx.roundRect) ctx.roundRect(bx - r * 0.11, by, r * 0.22, r * 0.36, r * 0.08); else ctx.rect(bx - r * 0.11, by, r * 0.22, r * 0.36); }, SUB_GLASS, A, { sd: r * 0.05, hd: r * 0.03, detail: (g) => {
      g.globalCompositeOperation = 'lighter'; g.fillStyle = i === 1 ? 'rgba(201,180,255,0.85)' : 'rgba(150,120,230,0.6)'; g.fillRect(bx - r * 0.11, by + r * 0.14, r * 0.22, r * 0.22); g.globalCompositeOperation = 'source-over';
      g.fillStyle = SUB_WOOD[2]; g.fillRect(bx - r * 0.08, by, r * 0.16, r * 0.07);
    } });
  }
};
