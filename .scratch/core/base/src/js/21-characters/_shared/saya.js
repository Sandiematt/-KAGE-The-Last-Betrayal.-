// the saya at his hip: a dark lacquered sheath angled back and down, a silver mouth and chape, a crimson cord
Fighter.prototype.animeSaya = function (ctx, S, A, U) {
  const sh = this.shape(); if (sh !== 'katana' && sh !== 'shinsen' && sh !== 'odachi') return;
  const len = Math.min(this.weaponLen() * 0.6, 70 * this.scale), a0 = [spX(S, 0.16, 7 * U), spY(S, 0.16, 7 * U)];
  // the sheath hangs back from the hip: along the back normal, tipped down the spine
  const dx = -S.nx * 0.78 - S.ux * 0.62, dy = -S.ny * 0.78 - S.uy * 0.62, dl = Math.hypot(dx, dy);
  const ex = a0[0] + dx / dl * len, ey = a0[1] + dy / dl * len;
  const a = { x: a0[0], y: a0[1] }, b = { x: ex, y: ey };
  celFill(ctx, () => animeCapsule(ctx, a, b, 2.4 * U, 1.9 * U, 0, 0.5), [ANIME.cloth0, '#100d0e', '#2a2425'], A, { sd: 1.6 * U, hd: 0.6 * U, detail: (g) => {
    g.fillStyle = ANIME.silver;
    g.beginPath(); g.arc(b.x, b.y, 2.1 * U, 0, TAU); g.fill();
    g.strokeStyle = ANIME.silver; g.lineWidth = 1.4 * U; g.beginPath(); g.moveTo(lerp(a.x, b.x, 0.04) - dy / dl * 3 * U, lerp(a.y, b.y, 0.04) + dx / dl * 3 * U); g.lineTo(lerp(a.x, b.x, 0.04) + dy / dl * 3 * U, lerp(a.y, b.y, 0.04) - dx / dl * 3 * U); g.stroke();
    g.strokeStyle = ANIME.crimson; g.lineWidth = 1.2 * U; g.beginPath(); g.moveTo(lerp(a.x, b.x, 0.16), lerp(a.y, b.y, 0.16)); g.quadraticCurveTo(lerp(a.x, b.x, 0.25), lerp(a.y, b.y, 0.25) + 6 * U, lerp(a.x, b.x, 0.34), lerp(a.y, b.y, 0.34)); g.stroke();
  } });
};
