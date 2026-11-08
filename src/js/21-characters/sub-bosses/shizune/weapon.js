// Shizune's blade: a plain katana with a pale-gold wrap and the school's ring on a round iron tsuba
SUB_WEAPON_ART.disciple_blade = function (ctx, sh, L, s) {
  _katanaBase(ctx, L, s);
  const acc = subTone('#d9c08a'), hl = 0.31;
  ctx.fillStyle = acc[1];
  for (let i = 1; i < 6; i++) { ctx.save(); ctx.translate(-L * hl * (i + 0.1) / 6.2, 0); ctx.rotate(Math.PI / 4); ctx.fillRect(-1.05 * s, -1.05 * s, 2.1 * s, 2.1 * s); ctx.restore(); }
  ctx.fillStyle = '#030303'; ctx.beginPath(); ctx.ellipse(-0.6 * s, 0, 2.3 * s, 6.4 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = SUB_IRON[1]; ctx.beginPath(); ctx.ellipse(-0.6 * s, 0, 1.6 * s, 5.6 * s, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = acc[1]; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.ellipse(-0.6 * s, -2.8 * s, 0.9 * s, 1.4 * s, 0, 0.3, 5.2); ctx.stroke();
  return true;
};
