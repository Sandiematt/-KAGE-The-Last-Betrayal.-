SUB_HEADS.rain_hood = function (ctx, key, f, r, ink, flat, A, sv, t, acc, fill) {
  // a close oiled hood open at the face, its face cloth pulled down round the throat under the chin, a stiff visor
  // jutting over the eyes, a blue cord round it
  fill([[0.75, -0.72], [0.2, -1.12], [-0.56, -1.1], [-1.08, -0.56], [-1.12, 0.36], [-0.86, 1.16], [-0.2, 1.32], [0.3, 1.12], [0.04, 0.56], [-0.18, -0.1], [0.12, -0.46]], RAIN, { sd: r * 0.3, hd: r * 0.06, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.3, -r * 1.0); g.quadraticCurveTo(-r * 0.86, -r * 0.3, -r * 0.6, r * 0.9); g.stroke();
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.07; g.beginPath(); g.moveTo(r * 0.7, -r * 0.62); g.quadraticCurveTo(-r * 0.3, -r * 0.82, -r * 1.06, -r * 0.3); g.stroke();
  } });
  // the face cloth, pulled down: a roll of oiled cloth under the jaw (the chin stands clear over it), its hem in the accent
  fill([[-0.26, 0.74], [0.16, 0.96], [0.5, 1.06], [0.74, 1.1, 1], [0.7, 1.3], [0.2, 1.42], [-0.3, 1.24]], RAIN, { sd: r * 0.14, hd: r * 0.06, rim: true, detail: (g) => {
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(-r * 0.3, r * 0.8); g.quadraticCurveTo(r * 0.24, r * 1.04, r * 0.74, r * 1.12); g.stroke();
  } });
  fill([[-0.1, -0.64], [0.7, -0.68], [1.78, -0.5, 1], [1.72, -0.34, 1], [0.76, -0.32], [0.0, -0.38]], SUB_LACQ, { sd: r * 0.08, hd: r * 0.04, rim: true, detail: (g) => {
    g.strokeStyle = acc[2]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(r * 0.1, -r * 0.4); g.lineTo(r * 0.76, -r * 0.36); g.lineTo(r * 1.7, -r * 0.37); g.stroke();
  } });
  if (!A.flat) {
    // rain beading off the visor's tip
    ctx.fillStyle = 'rgba(159,212,255,0.75)';
    for (let i = 0; i < 2; i++) { const k = (t * 1.3 + i * 0.5) % 1; ctx.beginPath(); ctx.ellipse(r * (1.66 - i * 0.4), -r * 0.3 + k * r * 0.9, r * 0.04, r * 0.08, 0, 0, TAU); ctx.fill(); }
  }
};
