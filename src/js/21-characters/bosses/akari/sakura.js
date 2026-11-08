// a five-petal sakura with notched petal tips (her ornament and crests); petals in `col`, a pale heart
function drawSakura(ctx, x, y, R, rot, col, core, miss) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    if (i !== miss) {
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-R * 0.62, -R * 0.42, -R * 0.44, -R * 1.0, -R * 0.15, -R * 1.0); ctx.lineTo(0, -R * 0.8); ctx.lineTo(R * 0.15, -R * 1.0);
      ctx.bezierCurveTo(R * 0.44, -R * 1.0, R * 0.62, -R * 0.42, 0, 0);
    }
    ctx.rotate(TAU / 5);
  }
  ctx.fill();
  if (core) { ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, R * 0.22, 0, TAU); ctx.fill(); }
  ctx.restore();
}
