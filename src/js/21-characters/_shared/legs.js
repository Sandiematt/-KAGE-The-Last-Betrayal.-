// wide split hakama: a full thigh and a shin that stays wide to the ankle (bloused into Kage's tall boots), pleat
// lines, then the boot (Kage) or tabi and straw sandal (everyone else)
Fighter.prototype.animeLeg = function (ctx, hp, kn, ft, A, skin, U, far) {
  if (skin.akari) { akariLeg(this, ctx, hp, kn, ft, A, skin, U, far); return; }   // leggings and tall boots (bosses/akari/)
  const pal = A.pal, tone = far ? pal.back : pal.fab, boot = skin.feet === 'boot', lw = (skin.hollow && skin.hollow.legW) || 1;
  const pleats = (g, a, b, os) => {
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    animeFold(g, A, tone, () => { for (const o of os) { g.moveTo(a.x + nx * o * U + dx * 0.12, a.y + ny * o * U + dy * 0.12); g.lineTo(b.x + nx * o * 1.1 * U, b.y + ny * o * 1.1 * U); } });
  };
  const sun = skin.suneate, se = boot ? 0.62 : sun ? 0.66 : skin.wrapShin ? 0.6 : 0.9, shinEnd = { x: lerp(kn.x, ft.x, se), y: lerp(kn.y, ft.y, se) };
  celFill(ctx, () => animeCapsule(ctx, kn, shinEnd, 9.8 * U * lw, (boot ? 8.4 : 10.6) * U * lw, 1 * U, 0.5), tone, A, { sd: 4.4 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far ? null : (g) => pleats(g, kn, shinEnd, [-3.6, 1, 5]) });
  // the thigh over the shin, so the knee is the thigh's fold, not a round pad
  celFill(ctx, () => animeCapsule(ctx, hp, kn, 11.6 * U * lw, 10 * U * lw, 1.6 * U * lw, 0.42), tone, A, { sd: 5 * U, hd: far ? 0 : 1 * U, rim: !far, detail: far ? null : (g) => pleats(g, hp, kn, [-4.2, 0.2, 4.4]) });
  if (sun) this.orderSuneate(ctx, kn, ft, A, U, far);
  if (skin.wrapShin) this.hollowWrap(ctx, { x: lerp(kn.x, ft.x, 0.4), y: lerp(kn.y, ft.y, 0.4) }, { x: lerp(kn.x, ft.x, 0.93), y: lerp(kn.y, ft.y, 0.93) }, 6 * U * lw, 4.6 * U * lw, A, U, far);
  this.animeFoot(ctx, kn, ft, A, skin, U, far);   // the boot or sandalled foot (feet.js)
};
