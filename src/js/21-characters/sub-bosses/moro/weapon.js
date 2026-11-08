// Moro's naginata: a dark lacquered shaft with a glass conduit of violet light running up it, a curved blade
SUB_WEAPON_ART.conduit_naginata = function (ctx, sh, L, s, f) {
  const acc = subTone('#9b7cff'), t = f ? f.time : 0;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 6.2 * s; ctx.beginPath(); ctx.moveTo(-L * 0.42, 0); ctx.lineTo(L * 0.78, 0); ctx.stroke();
  ctx.strokeStyle = VIOLET_LACQ[1]; ctx.lineWidth = 4.2 * s; ctx.beginPath(); ctx.moveTo(-L * 0.42, 0); ctx.lineTo(L * 0.78, 0); ctx.stroke();
  ctx.strokeStyle = VIOLET_LACQ[2]; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(-L * 0.4, -1.2 * s); ctx.lineTo(L * 0.76, -1.2 * s); ctx.stroke();
  // the conduit along the shaft, a pulse running up it
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(155,124,255,${0.4 + 0.2 * Math.sin(t * 6)})`; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(-L * 0.3, 1.2 * s); ctx.lineTo(L * 0.72, 1.2 * s); ctx.stroke();
  const pu = ((t * 0.9) % 1) * 1.02 - 0.3; ctx.fillStyle = 'rgba(220,205,255,0.85)'; ctx.fillRect(L * pu, 0.4 * s, L * 0.06, 1.6 * s);
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'butt'; ctx.strokeStyle = SUB_IRON[2]; ctx.lineWidth = 1.8 * s;
  for (const x of [-0.25, 0.1, 0.45, 0.7]) { ctx.beginPath(); ctx.moveTo(L * x, -3 * s); ctx.lineTo(L * x, 3 * s); ctx.stroke(); }
  ctx.lineCap = 'round';
  ctx.fillStyle = ANIME.silver; ctx.fillRect(-L * 0.43, -2.4 * s, 3 * s, 4.8 * s);
  // the guard and the blade
  ctx.fillStyle = '#030303'; ctx.beginPath(); ctx.ellipse(L * 0.775, 0, 1.8 * s, 5 * s, 0, 0, TAU); ctx.fill();
  _naginataBlade(ctx, L, s); ctx.fillStyle = ANIME.silver; ctx.fill(); ctx.strokeStyle = '#030303'; ctx.lineWidth = 1.1 * s; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(L * 0.79, 1.2 * s); ctx.quadraticCurveTo(L * 0.93, 1.2 * s, L, -10 * s); ctx.quadraticCurveTo(L * 0.95, 3 * s, L * 0.81, 4.6 * s); ctx.closePath(); ctx.fillStyle = '#6c7076'; ctx.fill();
  ctx.strokeStyle = acc[2]; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(L * 0.81, 4 * s); ctx.quadraticCurveTo(L * 0.95, 2.6 * s, L * 0.995, -9 * s); ctx.stroke();
  ctx.fillStyle = ANIME.silver; ctx.fillRect(L * 0.785, -3.4 * s, 2.6 * s, 7 * s);
  return true;
};

function _naginataBlade(ctx, L, s) {
  ctx.beginPath(); ctx.moveTo(L * 0.78, -3.2 * s); ctx.quadraticCurveTo(L * 0.92, -3.6 * s, L, -10 * s); ctx.quadraticCurveTo(L * 0.95, 3 * s, L * 0.81, 4.6 * s); ctx.lineTo(L * 0.78, 4 * s); ctx.closePath();
}

SUBB_WEAPON_FLAT.conduit_naginata = function (ctx, L, s, ink, rim) {
  ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineWidth = 4.6 * s; ctx.beginPath(); ctx.moveTo(-L * 0.42, 0); ctx.lineTo(L * 0.78, 0); ctx.stroke();
  if (rim) return true;
  _naginataBlade(ctx, L, s); ctx.fillStyle = ink; ctx.fill();
  return true;
};
