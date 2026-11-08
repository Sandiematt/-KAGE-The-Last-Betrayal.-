/* ---- the halo: a great ring behind the shoulders ---- */
Fighter.prototype.drawWitnessHalo = function (ctx, opt) {
  const sk = this.sk, s = this.scale, f = this.facing, t = this.time || 0, hr = BODY.head * s * this.build.head, flat = !!opt.color;
  const cx = lerp(sk.neck.x, sk.head.x, 0.25) - f * hr * 1.35, cy = lerp(sk.neck.y, sk.head.y, 0.25) + hr * 0.1, R = hr * 3.5;
  const dark = flat ? opt.color : '#12071c', edge = '#ff5fae';
  ctx.save(); ctx.globalAlpha *= this.witFade();
  if (!flat) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(200,60,200,0.16)'; ctx.lineWidth = 14 * s; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(140,90,255,0.14)'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.arc(cx, cy, R * 0.82, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  // the band, edged magenta outside and violet inside
  ctx.strokeStyle = dark; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  if (!flat) {
    ctx.strokeStyle = `rgba(255,90,170,${0.8 + Math.sin(t * 3) * 0.15})`; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.arc(cx, cy, R + 2.4 * s, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(180,130,255,0.75)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.arc(cx, cy, R - 2.4 * s, 0, TAU); ctx.stroke();
  }
  // the inner rune ring, dashed, turning the other way
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-t * 0.4 * f);
  ctx.setLineDash([5 * s, 3 * s, 1.5 * s, 3 * s]); ctx.strokeStyle = flat ? opt.color : 'rgba(190,150,255,0.7)'; ctx.lineWidth = 1.4 * s;
  ctx.beginPath(); ctx.arc(0, 0, R * 0.82, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  // the notches, turning slowly
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.25 * f);
  for (let i = 0; i < 18; i++) {
    ctx.save(); ctx.rotate(i * TAU / 18);
    ctx.fillStyle = flat ? opt.color : i % 3 ? '#3d0f35' : edge; ctx.fillRect(R - 3.2 * s, -1 * s, 6.4 * s, 2 * s);
    ctx.restore();
  }
  ctx.restore();
  // four blades at the quarters, the top one tallest (these do not turn)
  for (const [a, len, w] of [[-Math.PI / 2, 26, 5], [0, 13, 3.6], [Math.PI, 13, 3.6], [Math.PI / 2, 16, 4]]) {
    const ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux, bx = cx + ux * (R - 3 * s), by = cy + uy * (R - 3 * s);
    ctx.fillStyle = dark; ctx.beginPath();
    ctx.moveTo(bx + px * w * s, by + py * w * s); ctx.lineTo(bx + ux * len * s, by + uy * len * s); ctx.lineTo(bx - px * w * s, by - py * w * s);
    ctx.lineTo(bx - ux * 5 * s, by - uy * 5 * s); ctx.closePath(); ctx.fill();
    if (!flat) { ctx.strokeStyle = edge; ctx.lineWidth = 1 * s; ctx.stroke(); }
  }
  ctx.restore();
};
