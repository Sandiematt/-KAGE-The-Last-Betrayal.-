// Hisame's war fans: lacquered guard sticks, rain-dark paper in cel-shaded pleats, pale rain streaks, a blue edge
SUB_WEAPON_ART.mist_fans = function (ctx, sh, L, s) {
  const acc = subTone('#7fb8ff'), a0 = -0.42, a1 = 0.18, n = 7;
  for (let i = 0; i < n; i++) {
    const p = a0 + (a1 - a0) * i / n, q = a0 + (a1 - a0) * (i + 1) / n;
    ctx.beginPath(); ctx.moveTo(Math.cos(p) * L * 0.3, Math.sin(p) * L * 0.3); ctx.arc(0, 0, L, p, q); ctx.lineTo(Math.cos(q) * L * 0.3, Math.sin(q) * L * 0.3); ctx.arc(0, 0, L * 0.3, q, p, true); ctx.closePath();
    ctx.fillStyle = i % 2 ? '#1a2532' : '#253447'; ctx.fill();
  }
  ctx.strokeStyle = 'rgba(159,212,255,0.4)'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
  for (const [r0, r1, a] of [[0.5, 0.7, -0.3], [0.62, 0.86, -0.12], [0.45, 0.62, 0.05], [0.72, 0.94, -0.36], [0.55, 0.74, 0.12]]) { ctx.moveTo(Math.cos(a) * L * r0, Math.sin(a) * L * r0); ctx.lineTo(Math.cos(a + 0.05) * L * r1, Math.sin(a + 0.05) * L * r1); }
  ctx.stroke();
  ctx.strokeStyle = acc[2]; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.arc(0, 0, L - 0.7 * s, a0, a1); ctx.stroke();
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 3.4 * s; ctx.lineCap = 'round';
  for (const a of [a0, a1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.stroke(); }
  ctx.strokeStyle = SUB_LACQ[2]; ctx.lineWidth = 1.2 * s;
  for (const a of [a0, a1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.stroke(); }
  ctx.fillStyle = ANIME.silver; ctx.beginPath(); ctx.arc(0, 0, 2 * s, 0, TAU); ctx.fill();
  return true;
};
