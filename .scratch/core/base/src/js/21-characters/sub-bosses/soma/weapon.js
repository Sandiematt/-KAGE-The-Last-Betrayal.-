// Soma's odachi: a black grip with gold menuki, a paper seal wound round it, a square gold-rimmed tsuba
SUB_WEAPON_ART.silent_odachi = function (ctx, sh, L, s) {
  _katanaBase(ctx, L, s);
  const acc = subTone('#e8c25c'), hl = 0.31;
  ctx.fillStyle = '#030303'; if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(-3.2 * s, -6.4 * s, 4.4 * s, 12.8 * s, 1.4 * s); ctx.fill(); } else ctx.fillRect(-3.2 * s, -6.4 * s, 4.4 * s, 12.8 * s);
  ctx.strokeStyle = acc[1]; ctx.lineWidth = 0.9 * s; ctx.strokeRect(-2.6 * s, -5.8 * s, 3.2 * s, 11.6 * s);
  ctx.fillStyle = SUB_PAPER[0]; ctx.fillRect(-L * hl * 0.42, -2.6 * s, L * 0.06, 5.2 * s);
  ctx.fillStyle = '#060505'; ctx.fillRect(-L * hl * 0.42 + L * 0.02, -2.6 * s, 0.9 * s, 5.2 * s);
  ctx.fillStyle = acc[1]; ctx.fillRect(-L * hl * 0.72, -1.4 * s, 3.4 * s, 1.6 * s);
  return true;
};
