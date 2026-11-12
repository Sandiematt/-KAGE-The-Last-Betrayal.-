SUBB_HEADS.blademaster_kabuto = function (ctx, key, f, r, ink, flat, A, sv, t, acc, sub, fill, studs, shikoro) {
  // Soma's mokushi kabuto: a wide swept shikoro, a closed menpō bound with the gold oath cord, a tall bowl, a
  // straight pale-gold blade crest laid across the brow
  if (f.isPlayer) drawKageHair(ctx, r * 0.9, ink, flat, f);
  shikoro([[0.1, -0.6], [-0.92, -0.92], [-1.74, -0.24], [-2.3, 0.56, 1], [-1.94, 0.92], [-0.92, 0.92], [-0.42, 0.42], [-0.2, -0.2]], SUB_LACQ, 0.92, 0.95, acc[1]);
  fill([[0.0, 0.16], [0.8, 0.12], [1.18, 0.26, 1], [1.1, 0.6], [0.7, 0.98], [0.3, 1.06, 1], [0.0, 0.66]], SUB_IRON, { sd: r * 0.18, hd: r * 0.06, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(r * 0.36, r * 0.6); g.lineTo(r * 1.06, r * 0.56); g.stroke();
    g.strokeStyle = SUB_IRON[2]; g.lineWidth = r * 0.025; g.beginPath(); g.moveTo(r * 0.36, r * 0.64); g.lineTo(r * 1.04, r * 0.6); g.stroke();
    // the oath cord: wound across the mouth, knotted at the cheek
    g.strokeStyle = acc[0]; g.lineWidth = r * 0.09; g.beginPath(); g.moveTo(-r * 0.05, r * 0.46); g.quadraticCurveTo(r * 0.6, r * 0.4, r * 1.2, r * 0.5); g.stroke();
    g.strokeStyle = acc[2]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(-r * 0.05, r * 0.44); g.quadraticCurveTo(r * 0.6, r * 0.38, r * 1.2, r * 0.48); g.stroke();
  } });
  if (!A.flat) {
    ctx.fillStyle = acc[1]; ctx.beginPath(); ctx.arc(r * 0.06, r * 0.5, r * 0.1, 0, TAU); ctx.fill();
    ctx.strokeStyle = acc[0]; ctx.lineWidth = Math.max(1, r * 0.06); const sw = Math.sin(t * 2.2) * r * 0.05;
    ctx.beginPath(); ctx.moveTo(r * 0.04, r * 0.56); ctx.lineTo(-r * 0.02 + sw, r * 1.0); ctx.moveTo(r * 0.1, r * 0.56); ctx.lineTo(r * 0.12 + sw, r * 0.92); ctx.stroke();
  }
  fill([[1.06, -0.36, 1], [0.98, -1.12], [0.52, -1.8], [-0.2, -2.0], [-0.82, -1.62], [-1.14, -0.4, 1]], SUB_LACQ, { sd: r * 0.34, hd: r * 0.08, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.04; g.beginPath();
    for (const x of [-0.6, -0.2, 0.2, 0.6]) { g.moveTo(-r * 0.12, -r * 1.96); g.quadraticCurveTo(r * x, -r * 1.5, r * x * 1.6, -r * 0.44); }
    g.stroke();
    g.strokeStyle = acc[0]; g.lineWidth = r * 0.03; g.beginPath(); g.moveTo(-r * 0.1, -r * 1.94); g.quadraticCurveTo(r * 0.0, -r * 1.5, r * 0.04, -r * 0.44); g.stroke();
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(-r * 1.12, -r * 0.48); g.quadraticCurveTo(0, -r * 0.62, r * 1.04, -r * 0.45); g.stroke();
    g.fillStyle = acc[1]; g.beginPath(); g.arc(-r * 0.12, -r * 1.98, r * 0.08, 0, TAU); g.fill();
  } });
  fill([[0.34, -0.52], [1.4, -0.46, 1], [1.32, -0.3, 1], [0.34, -0.34]], SUB_LACQ, { sd: r * 0.06 });
  fill([[0.34, -0.52], [0.2, 0.06, 1], [-0.28, -0.04], [-0.14, -0.54]], SUB_LACQ, { sd: r * 0.1, hd: r * 0.04, detail: (g) => { g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 0.3, -r * 0.48); g.lineTo(r * 0.18, r * 0.02); g.stroke(); } });
  // the blade crest on its holder
  fill([[0.6, -0.56], [0.74, -1.42, 1], [0.92, -1.42, 1], [0.84, -0.56]], GOLDM, { sd: r * 0.05 });
  fill([[-0.56, -1.4, 1], [2.1, -1.62, 1], [2.04, -1.48, 1], [-0.56, -1.28, 1]], PALE_GOLD, { sd: r * 0.04, hd: r * 0.02, rim: true });
};
