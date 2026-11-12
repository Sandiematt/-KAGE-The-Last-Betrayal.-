// the Echo Sentinel's crescents: a violet-wrapped grip, a silver crescent with a violet inner edge
SUB_WEAPON_ART.hollow_crescents = function (ctx, sh, L, s, f) {
  if (!f || !f.def || f.def.id !== 'echo_sentinel') return false;
  const acc = subTone('#9b8cff');
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 6.4 * s; ctx.beginPath(); ctx.moveTo(-L * 0.18, 0); ctx.lineTo(0, 0); ctx.stroke();
  ctx.strokeStyle = acc[0]; ctx.lineWidth = 4.2 * s; ctx.stroke();
  ctx.strokeStyle = acc[1]; ctx.lineWidth = 0.9 * s; ctx.beginPath(); for (let i = 1; i < 5; i++) { const x = -L * 0.18 * i / 5; ctx.moveTo(x - 1.2 * s, -1.8 * s); ctx.lineTo(x + 1.2 * s, 1.8 * s); } ctx.stroke();
  ctx.beginPath(); ctx.arc(L * 0.45, -L * 0.05, L * 0.55, Math.PI * 0.95, Math.PI * 2.05, false); ctx.arc(L * 0.45, -L * 0.22, L * 0.42, Math.PI * 2.0, Math.PI * 0.98, true); ctx.closePath();
  ctx.fillStyle = ANIME.silver; ctx.fill(); ctx.strokeStyle = '#030303'; ctx.lineWidth = 1.2 * s; ctx.stroke();
  ctx.beginPath(); ctx.arc(L * 0.45, -L * 0.05, L * 0.47, Math.PI * 1.05, Math.PI * 1.95, false); ctx.strokeStyle = '#6c7076'; ctx.lineWidth = 2.4 * s; ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; ctx.beginPath(); ctx.arc(L * 0.45, -L * 0.22, L * 0.43, Math.PI * 1.02, Math.PI * 1.98, false); ctx.strokeStyle = 'rgba(155,140,255,0.7)'; ctx.lineWidth = 1.4 * s; ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
  return true;
};
