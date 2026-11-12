// Shiden's yari: a dark lacquered shaft banded violet, a leaf head with a ridge, a violet tassel sheath
SUB_WEAPON_ART.vanguard_yari = function (ctx, sh, L, s, f) {
  const acc = subTone('#b07cff');
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(-L * 0.42, 0); ctx.lineTo(L * 0.84, 0); ctx.stroke();
  ctx.strokeStyle = SUB_LACQ[1]; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(-L * 0.42, 0); ctx.lineTo(L * 0.84, 0); ctx.stroke();
  ctx.strokeStyle = SUB_LACQ[2]; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(-L * 0.4, -1.1 * s); ctx.lineTo(L * 0.82, -1.1 * s); ctx.stroke();
  ctx.lineCap = 'butt'; ctx.strokeStyle = acc[1]; ctx.lineWidth = 2 * s;
  for (const x of [-0.3, 0.2, 0.5]) { ctx.beginPath(); ctx.moveTo(L * x, -2.6 * s); ctx.lineTo(L * x, 2.6 * s); ctx.stroke(); }
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(L * 0.82, -4.6 * s); ctx.quadraticCurveTo(L * 0.92, -8.6 * s, L, 0); ctx.quadraticCurveTo(L * 0.92, 8.6 * s, L * 0.82, 4.6 * s); ctx.closePath();
  ctx.fillStyle = ANIME.silver; ctx.fill();
  ctx.beginPath(); ctx.moveTo(L * 0.82, 0); ctx.lineTo(L, 0); ctx.quadraticCurveTo(L * 0.92, 8.6 * s, L * 0.82, 4.6 * s); ctx.closePath(); ctx.fillStyle = '#6c7076'; ctx.fill();
  ctx.strokeStyle = ANIME.silverHi; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(L * 0.83, 0); ctx.lineTo(L * 0.99, 0); ctx.stroke();
  const sw = f ? Math.sin(f.time * 9) * 4 : 0;
  ctx.strokeStyle = acc[1]; ctx.lineWidth = 2 * s;
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(L * 0.8, i * 2); ctx.quadraticCurveTo(L * 0.76, 10 * s, L * 0.74 + sw, (16 + i * 3) * s); ctx.stroke(); }
  ctx.fillStyle = SUB_IRON[2]; ctx.fillRect(L * 0.78, -3.6 * s, 3.4 * s, 7.2 * s);
  return true;
};
