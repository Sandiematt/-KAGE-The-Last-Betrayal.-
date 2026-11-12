/* ---- the blade (SUB_WEAPON_ART): the katana with a gold tsuka wrapped in black diamonds and gold fittings ---- */
function _tkBlade(ctx, sh, L, s, f) {
  if (sh !== 'katana') return false;
  drawWeaponShape(ctx, 'katana', L, 'ink', s, C.ink, null);
  const gold = f && f.hollow ? TK_GOLD_H : TK_GOLD, hl = 0.31, hw = 2.2 * s;
  // the tsuka: gold, the black wrap crossing it in diamonds, a gold kashira
  ctx.lineCap = 'butt'; ctx.strokeStyle = C.ink; ctx.lineWidth = hw * 2 + 1.2 * s; ctx.beginPath(); ctx.moveTo(-L * hl, 0); ctx.lineTo(-1.5 * s, 0); ctx.stroke();
  ctx.strokeStyle = gold[1]; ctx.lineWidth = hw * 2; ctx.beginPath(); ctx.moveTo(-L * hl, 0); ctx.lineTo(-1.5 * s, 0); ctx.stroke();
  ctx.lineCap = 'round';
  ctx.fillStyle = '#0a0705';
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(-L * hl * (i + 0.6) / 6.2, 0); ctx.rotate(Math.PI / 4); ctx.fillRect(-1.05 * s, -1.05 * s, 2.1 * s, 2.1 * s); ctx.restore(); }
  ctx.strokeStyle = gold[2]; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(-L * hl, -hw * 0.8); ctx.lineTo(-2 * s, -hw * 0.8); ctx.stroke();
  ctx.fillStyle = gold[1]; ctx.beginPath(); ctx.arc(-L * hl, 0, hw * 1.15, 0, TAU); ctx.fill();
  ctx.fillStyle = gold[0]; ctx.beginPath(); ctx.arc(-L * hl - 0.4 * s, 0, hw * 0.5, 0, TAU); ctx.fill();
  // the tsuba: a round gold guard, rimmed dark, and the gold habaki
  ctx.fillStyle = gold[1]; ctx.beginPath(); ctx.ellipse(-0.6 * s, 0, 2.1 * s, 6 * s, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = gold[0]; ctx.lineWidth = 0.9 * s; ctx.stroke();
  ctx.fillStyle = gold[2]; ctx.fillRect(-1.4 * s, -5.2 * s, 0.8 * s, 3 * s);
  ctx.fillStyle = gold[1]; ctx.fillRect(1.4 * s, -1.75 * s, 3 * s, 3.5 * s);
  return true;
}

Object.assign(SUB_WEAPON_ART, { takashi_blade: _tkBlade, echo_nameless: _tkBlade });
