// a mitten hand round the grip: a rounded block along the forearm with a thumb lobe; fingers implied by one line
function animeHandPath(ctx, el, ha, r) {
  const dx = ha.x - el.x, dy = ha.y - el.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  ctx.moveTo(ha.x + ux * r * 1.25, ha.y + uy * r * 1.25);
  ctx.ellipse(ha.x + ux * r * 0.25, ha.y + uy * r * 0.25, r * 1.0, r * 0.82, Math.atan2(uy, ux), 0, TAU);
}

// a small dark glove closed round the grip, the fingers implied by one line
Fighter.prototype.animeHand = function (ctx, el, ha, A, U, far) {
  if (this.weaponId() === 'iron_fists' && this.hollow && animeSkin(this).hollow) { this.hollowFist(ctx, el, ha, A, U, far); return; }
  if (this.weaponId() === 'iron_fists') { this.subFist(ctx, el, ha, A, U, far); return; }   // the iron tekko (sub-bosses/)
  const pal = A.pal, glove = far ? [ANIME.cloth0, ANIME.cloth0, ANIME.cloth1] : [ANIME.cloth0, ANIME.cloth1, ANIME.cloth2];
  celFill(ctx, () => animeHandPath(ctx, el, ha, 2.9 * U), this.weaponId() === 'iron_fists' ? pal.metal : glove, A, { sd: 1.4 * U, hd: 0.6 * U, detail: (g) => {
    const dx = ha.x - el.x, dy = ha.y - el.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    g.strokeStyle = ANIME.cloth2; g.lineWidth = 0.7 * A.s; g.beginPath();
    g.moveTo(ha.x + ux * 1.6 * U - uy * 2.3 * U, ha.y + uy * 1.6 * U + ux * 2.3 * U); g.lineTo(ha.x + ux * 1.6 * U + uy * 2.3 * U, ha.y + uy * 1.6 * U - ux * 2.3 * U); g.stroke();
  } });
};
