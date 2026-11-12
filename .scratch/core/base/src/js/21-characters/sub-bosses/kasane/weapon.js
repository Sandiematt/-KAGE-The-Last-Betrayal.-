// Kasane's kusari: the chain hanging under gravity from the butt of the kusarigama, swaying; returns the link joints
// (weapon frame) and the weight's centre, shared by the drawn chain and its flat silhouette
const _kusariPts = [];

function _kusariChain(ctx, s, t) {
  const [gx, gy] = _localDown(ctx), sw = Math.sin(t * 2.4) * 0.35, cx = gx * Math.cos(sw) - gy * Math.sin(sw), cy = gx * Math.sin(sw) + gy * Math.cos(sw);
  let px = -6 * s, py = 0; _kusariPts.length = 0; _kusariPts.push([px, py]);
  for (let i = 0; i < 9; i++) {
    const k = i / 8, bend = Math.sin(k * 2.4) * 0.25, dx = cx - cy * bend, dy = cy + cx * bend;
    px += dx * 4.2 * s; py += dy * 4.2 * s; _kusariPts.push([px, py]);
  }
  return { pts: _kusariPts, wx: px + cx * 2 * s, wy: py + cy * 2 * s };
}

// Kasane's kusarigama: a dark handle wrapped violet, a silver sickle with a violet edge, a chain from the butt
SUB_WEAPON_ART.ledger_kusari = function (ctx, sh, L, s, f) {
  const acc = subTone('#b48ae6'), t = f ? f.time : 0;
  // the chain, hanging under gravity from the butt, a weight at its end
  const ch = _kusariChain(ctx, s, t);
  for (let i = 0; i < 9; i++) {
    const [px, py] = ch.pts[i], [nx, ny] = ch.pts[i + 1];
    ctx.save(); ctx.translate((px + nx) / 2, (py + ny) / 2); ctx.rotate(Math.atan2(ny - py, nx - px));
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.ellipse(0, 0, 2.6 * s, i % 2 ? 0.6 * s : 1.4 * s, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = i % 2 ? '#4a4d53' : ANIME.silver; ctx.lineWidth = 1 * s; ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#030303'; ctx.beginPath(); ctx.arc(ch.wx, ch.wy, 3.4 * s, 0, TAU); ctx.fill();
  ctx.fillStyle = SUB_IRON[2]; ctx.beginPath(); ctx.arc(ch.wx, ch.wy, 2.3 * s, 0, TAU); ctx.fill();
  // the handle
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 6.4 * s; ctx.beginPath(); ctx.moveTo(-6 * s, 0); ctx.lineTo(L * 0.55, 0); ctx.stroke();
  ctx.strokeStyle = SUB_WOOD[1]; ctx.lineWidth = 4.2 * s; ctx.beginPath(); ctx.moveTo(-6 * s, 0); ctx.lineTo(L * 0.55, 0); ctx.stroke();
  ctx.strokeStyle = acc[1]; ctx.lineWidth = 1 * s; ctx.beginPath(); for (let i = 0; i < 7; i++) { const x = -4 * s + i * L * 0.05; ctx.moveTo(x - 1.2 * s, -2 * s); ctx.lineTo(x + 1.2 * s, 2 * s); } ctx.stroke();
  ctx.fillStyle = ANIME.silver; ctx.fillRect(-7 * s, -2.6 * s, 2 * s, 5.2 * s); ctx.fillRect(L * 0.46, -2.8 * s, 2.4 * s, 5.6 * s);
  // the blade
  ctx.beginPath(); ctx.moveTo(L * 0.5, -3 * s); ctx.quadraticCurveTo(L * 0.95, -8 * s, L * 1.0, -L * 0.62); ctx.quadraticCurveTo(L * 0.8, -12 * s, L * 0.5, 4 * s); ctx.closePath();
  ctx.fillStyle = ANIME.silver; ctx.fill();
  ctx.strokeStyle = '#030303'; ctx.lineWidth = 1.2 * s; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(L * 0.52, 0); ctx.quadraticCurveTo(L * 0.86, -6 * s, L * 0.98, -L * 0.58); ctx.quadraticCurveTo(L * 0.8, -12 * s, L * 0.5, 4 * s); ctx.closePath(); ctx.fillStyle = '#6c7076'; ctx.fill();
  ctx.strokeStyle = acc[2]; ctx.lineWidth = 1.1 * s; ctx.beginPath(); ctx.moveTo(L * 0.52, 3 * s); ctx.quadraticCurveTo(L * 0.81, -11 * s, L * 0.99, -L * 0.6); ctx.stroke();
  return true;
};

// Kasane's kusarigama: the handle, the sickle and the chain hanging from the butt, all in the one colour
SUBB_WEAPON_FLAT.ledger_kusari = function (ctx, L, s, ink, rim, f) {
  const ch = _kusariChain(ctx, s, f ? f.time : 0);
  ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3.6 * s;
  ctx.beginPath(); ch.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(ch.wx, ch.wy, 3.4 * s, 0, TAU); ctx.fill();
  ctx.lineWidth = 6.4 * s; ctx.beginPath(); ctx.moveTo(-6 * s, 0); ctx.lineTo(L * 0.55, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(L * 0.5, -3 * s); ctx.quadraticCurveTo(L * 0.95, -8 * s, L * 1.0, -L * 0.62); ctx.quadraticCurveTo(L * 0.8, -12 * s, L * 0.5, 4 * s); ctx.closePath(); ctx.fill();
  void rim;
  return true;
};
