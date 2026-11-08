// Kuroe's temple staff: dark wood, gold bands, an iron shakujō ring head with loose rings, an ink-brush tassel
SUB_WEAPON_ART.temple_staff = function (ctx, sh, L, s, f) {
  const acc = subTone('#c9a45c');
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 6.2 * s; ctx.beginPath(); ctx.moveTo(-L * 0.5, 0); ctx.lineTo(L * 0.44, 0); ctx.stroke();
  ctx.strokeStyle = SUB_WOOD[1]; ctx.lineWidth = 4.2 * s; ctx.beginPath(); ctx.moveTo(-L * 0.5, 0); ctx.lineTo(L * 0.44, 0); ctx.stroke();
  ctx.strokeStyle = SUB_WOOD[2]; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(-L * 0.48, -1.2 * s); ctx.lineTo(L * 0.42, -1.2 * s); ctx.stroke();
  ctx.lineCap = 'butt'; ctx.strokeStyle = acc[1]; ctx.lineWidth = 2.2 * s;
  for (const x of [-0.42, -0.36, 0.34, 0.4]) { ctx.beginPath(); ctx.moveTo(L * x, -3 * s); ctx.lineTo(L * x, 3 * s); ctx.stroke(); }
  ctx.lineCap = 'round';
  // the ring head
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 3.6 * s; ctx.beginPath(); ctx.ellipse(L * 0.5, 0, 8 * s, 6.4 * s, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = SUB_IRON[2]; ctx.lineWidth = 1.8 * s; ctx.beginPath(); ctx.ellipse(L * 0.5, 0, 8 * s, 6.4 * s, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = ANIME.silver; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.ellipse(L * 0.5, 0, 8 * s, 6.4 * s, 0, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();
  ctx.lineWidth = 1.2 * s; ctx.strokeStyle = SUB_IRON[2];
  const sw = Math.sin((f ? f.time : 0) * 6) * 0.4;
  for (const a of [-1.2 + sw, 1.2 - sw]) { ctx.beginPath(); ctx.arc(L * 0.5 + Math.cos(a) * 8 * s, Math.sin(a) * 6.4 * s, 2.4 * s, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = acc[1]; ctx.beginPath(); ctx.arc(L * 0.5 + 8 * s, 0, 1.6 * s, 0, TAU); ctx.fill();
  // the butt: a black brush tuft
  ctx.fillStyle = '#050404'; ctx.beginPath(); ctx.moveTo(-L * 0.49, -2.4 * s); ctx.quadraticCurveTo(-L * 0.55, -3.6 * s, -L * 0.6, 0); ctx.quadraticCurveTo(-L * 0.55, 3.6 * s, -L * 0.49, 2.4 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = acc[1]; ctx.fillRect(-L * 0.5, -2.6 * s, 2 * s, 5.2 * s);
  return true;
};
