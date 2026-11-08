// Gonryu's kanabo: a wrapped grip and a ring pommel, an octagonal iron club swelling to the head, gold bands, rows
// of gate studs
SUB_WEAPON_ART.gate_kanabo = function (ctx, sh, L, s) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(-L * 0.12, 0, 3.4 * s, 0, TAU); ctx.stroke();
  ctx.strokeStyle = GOLDM[1]; ctx.lineWidth = 1.4 * s; ctx.stroke();
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 7.6 * s; ctx.beginPath(); ctx.moveTo(-L * 0.09, 0); ctx.lineTo(L * 0.3, 0); ctx.stroke();
  ctx.strokeStyle = SUB_WOOD[1]; ctx.lineWidth = 5.4 * s; ctx.beginPath(); ctx.moveTo(-L * 0.09, 0); ctx.lineTo(L * 0.3, 0); ctx.stroke();
  ctx.strokeStyle = GOLDM[0]; ctx.lineWidth = 1.1 * s; ctx.beginPath(); for (let i = 0; i < 9; i++) { const x = -L * 0.07 + i * L * 0.04; ctx.moveTo(x - 1.4 * s, -2.6 * s); ctx.lineTo(x + 1.4 * s, 2.6 * s); } ctx.stroke();
  const body = () => { ctx.beginPath(); _poly(ctx, [[L * 0.28, -4.6 * s], [L * 0.94, -11 * s], [L * 1.02, -8 * s], [L * 1.02, 8 * s], [L * 0.94, 11 * s], [L * 0.28, 4.6 * s]]); };
  body(); ctx.fillStyle = SUB_IRON[1]; ctx.fill();
  ctx.save(); body(); ctx.clip();
  ctx.fillStyle = SUB_IRON[0]; ctx.beginPath(); _poly(ctx, [[L * 0.28, 1.6 * s], [L * 1.04, 3.4 * s], [L * 1.04, 14 * s], [L * 0.28, 14 * s]]); ctx.fill();
  ctx.strokeStyle = SUB_IRON[2]; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(L * 0.3, -2.6 * s); ctx.lineTo(L * 1.0, -6.4 * s); ctx.stroke();
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(L * 0.3, 1.6 * s); ctx.lineTo(L * 1.02, 3.4 * s); ctx.stroke();
  for (let u = 0.4; u < 0.93; u += 0.075) for (const k of [-0.62, 0, 0.62]) {
    const hw = lerp(4.6, 11, (u - 0.28) / 0.66) * s, x = L * (u + (k === 0 ? 0.035 : 0)), y = k * hw;
    ctx.fillStyle = '#030303'; ctx.beginPath(); ctx.arc(x, y, 1.9 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = GOLDM[1]; ctx.beginPath(); ctx.arc(x - 0.2 * s, y - 0.2 * s, 1.3 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = GOLDM[2]; ctx.beginPath(); ctx.arc(x - 0.5 * s, y - 0.5 * s, 0.5 * s, 0, TAU); ctx.fill();
  }
  ctx.restore();
  ctx.lineCap = 'butt';
  for (const u of [0.31, 0.985]) { const hw = lerp(4.6, 11, (u - 0.28) / 0.66) * s + 1 * s; ctx.strokeStyle = '#030303'; ctx.lineWidth = 3.4 * s; ctx.beginPath(); ctx.moveTo(L * u, -hw); ctx.lineTo(L * u, hw); ctx.stroke(); ctx.strokeStyle = GOLDM[1]; ctx.lineWidth = 2 * s; ctx.stroke(); }
  ctx.lineCap = 'round';
  body(); ctx.strokeStyle = '#030303'; ctx.lineWidth = 1.4 * s; ctx.stroke();
  return true;
};

SUBB_WEAPON_FLAT.gate_kanabo = function (ctx, L, s, ink) {
  ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(-L * 0.1, 0); ctx.lineTo(L * 0.3, 0); ctx.stroke();
  ctx.fillStyle = ink; ctx.beginPath(); _poly(ctx, [[L * 0.28, -4.6 * s], [L * 0.94, -11 * s], [L * 1.02, -8 * s], [L * 1.02, 8 * s], [L * 0.94, 11 * s], [L * 0.28, 4.6 * s]]); ctx.fill();
  return true;
};
