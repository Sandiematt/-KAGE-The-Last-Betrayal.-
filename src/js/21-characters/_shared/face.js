// the face: a rounded crown and back of the head, a near-vertical brow, a narrow jaw to a pointed chin (+x the face side)
function animeHeadPath(ctx, r) {
  ctx.moveTo(-r * 0.94, r * 0.12);
  ctx.bezierCurveTo(-r * 1.02, -r * 0.76, -r * 0.42, -r * 1.06, r * 0.12, -r * 1.03);
  ctx.bezierCurveTo(r * 0.7, -r * 0.98, r * 0.98, -r * 0.55, r * 0.96, -r * 0.1);
  ctx.quadraticCurveTo(r * 0.99, r * 0.36, r * 0.8, r * 0.66);
  ctx.quadraticCurveTo(r * 0.6, r * 1.0, r * 0.42, r * 1.1);
  ctx.quadraticCurveTo(r * 0.04, r * 0.96, -r * 0.36, r * 0.72);
  ctx.quadraticCurveTo(-r * 0.82, r * 0.6, -r * 0.94, r * 0.12);
  ctx.closePath();
}

// a plain head for UI icons (the gear shop's helmet tiles): the face shape in one colour
function drawAnimeHead(ctx, r, col) { ctx.fillStyle = col; ctx.beginPath(); animeHeadPath(ctx, r * 0.9); ctx.fill(); }
