// the Echo Warden's cutter: a katana whose edge burns violet, a spiked dark tsuba
SUB_WEAPON_ART.cutter_blade = function (ctx, sh, L, s, f) {
  if (!f || !f.def || f.def.id !== 'echo_warden') return false;
  _katanaBase(ctx, L, s);
  const sori = L * 0.045, X = u => 1.4 * s + (L - 1.4 * s) * u;
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(155,140,255,0.55)'; ctx.lineWidth = 1.4 * s; ctx.beginPath();
  for (let i = 0; i <= 9; i++) { const u = 0.9 * i / 9; ctx.lineTo(X(u), -sori * u * u + lerp(1.75, 1.2, u / 0.9) * s * 0.85); } ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#030303'; ctx.beginPath(); _poly(ctx, [[-0.6 * s, -8 * s], [1.4 * s, -4 * s], [1.4 * s, 4 * s], [-0.6 * s, 8 * s], [-2.6 * s, 4 * s], [-2.6 * s, -4 * s]]); ctx.fill();
  ctx.strokeStyle = '#7c6ad6'; ctx.lineWidth = 0.8 * s; ctx.stroke();
  return true;
};
