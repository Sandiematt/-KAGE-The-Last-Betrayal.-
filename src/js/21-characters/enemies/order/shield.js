// the shieldbearer's tate: a tall lacquered plank shield with iron bands and the Order mark, held on the off arm
Fighter.prototype.orderShield = function (ctx, A) {
  const s = this.scale, sk = this.sk, f = this.facing, w = 13 * s, h = 40 * s;
  ctx.save(); ctx.translate(sk.bha.x + f * 6 * s, sk.bha.y);
  const P = () => { ctx.moveTo(-w, -h + 4 * s); ctx.quadraticCurveTo(0, -h - 3 * s, w, -h + 4 * s); ctx.lineTo(w * 0.92, h - 2 * s); ctx.quadraticCurveTo(0, h + 3 * s, -w * 0.92, h - 2 * s); ctx.closePath(); };
  celFill(ctx, P, ORDER_LACQ, A, { sd: 4 * s, hd: 1.2 * s, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = 1 * s; g.beginPath();
    for (const x of [-w / 3, w / 3]) { g.moveTo(x, -h); g.lineTo(x * 0.95, h); }
    g.stroke();
    for (const y of [-h * 0.62, h * 0.62]) {
      g.fillStyle = ORDER_LACQ[0]; g.fillRect(-w, y - 2.6 * s, w * 2, 5.2 * s);
      g.fillStyle = ORDER_LACQ[2]; g.fillRect(-w, y - 2.6 * s, w * 2, 1 * s);
      g.fillStyle = ORDER_SILVER[1]; for (const x of [-w * 0.6, 0, w * 0.6]) { g.beginPath(); g.arc(x, y, 1.1 * s, 0, TAU); g.fill(); }
    }
    orderMark(g, 0, 0, 6.4 * s, A.pal.accHi, 2 * s);
    g.strokeStyle = A.pal.acc; g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(-w * 0.7, -h * 0.3); g.quadraticCurveTo(0, -h * 0.18, w * 0.7, -h * 0.3); g.stroke();
  } });
  ctx.restore();
};
