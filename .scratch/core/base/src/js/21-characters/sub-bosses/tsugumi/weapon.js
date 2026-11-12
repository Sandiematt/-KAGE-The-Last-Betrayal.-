// Tsugumi's kunai: a leaf blade with a ridge, a violet-wrapped grip and a ring pommel
SUB_WEAPON_ART.courier_kunai = function (ctx, sh, L, s) {
  const acc = subTone('#a98ad8');
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 5.2 * s; ctx.beginPath(); ctx.moveTo(-L * 0.3, 0); ctx.lineTo(0, 0); ctx.stroke();
  ctx.strokeStyle = acc[0]; ctx.lineWidth = 3.4 * s; ctx.beginPath(); ctx.moveTo(-L * 0.3, 0); ctx.lineTo(0, 0); ctx.stroke();
  ctx.strokeStyle = acc[1]; ctx.lineWidth = 0.9 * s; ctx.beginPath(); for (let i = 1; i < 6; i++) { const x = -L * 0.3 * i / 6; ctx.moveTo(x - 1.2 * s, -1.7 * s); ctx.lineTo(x + 1.2 * s, 1.7 * s); } ctx.stroke();
  ctx.strokeStyle = SUB_IRON[2]; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.arc(-L * 0.3 - 3.2 * s, 0, 3 * s, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -1.8 * s); ctx.quadraticCurveTo(L * 0.3, -4.6 * s, L, 0); ctx.quadraticCurveTo(L * 0.3, 4.6 * s, 0, 1.8 * s); ctx.closePath();
  ctx.fillStyle = ANIME.silver; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.3, 4.6 * s, L, 0); ctx.quadraticCurveTo(L * 0.3, 1 * s, 0, 0); ctx.closePath(); ctx.fillStyle = '#6c7076'; ctx.fill();
  ctx.strokeStyle = ANIME.silverHi; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(L * 0.1, -2.6 * s); ctx.quadraticCurveTo(L * 0.4, -3.6 * s, L * 0.94, -0.3 * s); ctx.stroke();
  return true;
};
