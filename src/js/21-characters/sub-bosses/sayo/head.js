SUB_HEADS.veil = function (ctx, key, f, r, ink, flat, A, sv, t, acc, fill) {
  // a close dark hood with a thin silver brow band, a hairpin crossing its back, and a mist face cloth to the eyes
  fill([[0.6, -0.84], [0.0, -1.12], [-0.62, -1.06], [-1.06, -0.5], [-1.1, 0.4], [-0.82, 1.1], [-0.2, 1.24], [0.26, 1.06], [0.02, 0.56], [-0.2, -0.06], [0.1, -0.54]], ['#08070b', '#121118', '#26232f'], { sd: r * 0.3, hd: r * 0.06, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.4, -r * 1.0); g.quadraticCurveTo(-r * 0.9, -r * 0.2, -r * 0.62, r * 0.9); g.stroke();
  } });
  fill([[0.0, 0.28], [0.88, 0.24], [1.08, 0.46, 1], [0.94, 0.86], [0.52, 1.08], [0.08, 0.96], [-0.12, 0.54]], ['#0b0a10', '#17151e', '#2c2936'], { sd: r * 0.14, hd: r * 0.05, detail: (g) => {
    // mist (kasumi) bands painted across the cloth
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.beginPath();
    g.moveTo(r * 0.1, r * 0.6); g.quadraticCurveTo(r * 0.4, r * 0.5, r * 0.62, r * 0.6); g.lineTo(r * 0.98, r * 0.58);
    g.moveTo(r * 0.24, r * 0.84); g.quadraticCurveTo(r * 0.5, r * 0.76, r * 0.82, r * 0.82); g.stroke();
  } });
  if (!A.flat) {
    ctx.strokeStyle = ANIME.silver; ctx.lineWidth = Math.max(1, r * 0.07); ctx.beginPath(); ctx.moveTo(r * 0.88, -r * 0.38); ctx.quadraticCurveTo(0, -r * 0.62, -r * 1.06, -r * 0.3); ctx.stroke();
    ctx.lineWidth = Math.max(1, r * 0.06); ctx.beginPath(); ctx.moveTo(-r * 0.2, -r * 1.02); ctx.lineTo(-r * 1.2, -r * 0.2); ctx.stroke();
    ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(-r * 0.22, -r * 1.02, r * 0.09, 0, TAU); ctx.fill();
  }
};
