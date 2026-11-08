/* ---- the chest core ---- */
// set in the breastplate, high on the chest toward the front
Fighter.prototype.corePos = function () {
  const sk = this.sk, s = this.scale, dx = sk.neck.x - sk.hip.x, dy = sk.neck.y - sk.hip.y, T = Math.hypot(dx, dy) || 1;
  const nx = -dy / T * this.facing, ny = dx / T * this.facing, w = 5.4 * s * clamp(this.build.w / 10, 0.9, 1.75);
  return { x: sk.hip.x + dx * 0.76 + nx * w, y: sk.hip.y + dy * 0.76 + ny * w };
};

// a white-hot orb in a violet bloom, a magenta ring, a slowly turning dashed circuit ring, the rune cards trailing back
Fighter.prototype.drawCore = function (ctx, opt) {
  const s = this.scale, t = this.time || 0, f = this.facing, { x, y } = this.corePos();
  if (opt.color) { ctx.fillStyle = opt.color; ctx.beginPath(); ctx.arc(x, y, 7 * s, 0, TAU); ctx.fill(); this.drawRuneCards(ctx, x, y, opt); return; }
  const pulse = 1 + Math.sin(t * 5) * 0.1, r = 5.2 * s * pulse, k = this.witFade();
  ctx.save(); ctx.globalAlpha *= k;
  this.drawRuneCards(ctx, x, y, opt);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 4.2);
  g.addColorStop(0, 'rgba(226,200,255,0.7)'); g.addColorStop(0.45, 'rgba(176,110,255,0.3)'); g.addColorStop(1, 'rgba(140,80,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4.2, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#1a0a1e'; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#ff4fa6'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.stroke();
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.9 * f);
  ctx.setLineDash([3 * s, 2.2 * s]); ctx.strokeStyle = 'rgba(255,140,220,0.9)'; ctx.lineWidth = 1.1 * s; ctx.beginPath(); ctx.arc(0, 0, r * 2.15, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#ff6fc0'; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.fillRect(Math.cos(a) * r * 2.15 - 1.2 * s, Math.sin(a) * r * 2.15 - 1.2 * s, 2.4 * s, 2.4 * s); }
  ctx.restore();
  ctx.fillStyle = '#b48aff'; ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
};

// the ofuda-like rune cards: five small dark-crimson tags trailing down and back from the core on a fine thread, each
// edged in glowing pink with a glyph, swaying on their own
Fighter.prototype.drawRuneCards = function (ctx, x, y, opt) {
  const s = this.scale, t = this.time || 0, f = this.facing, flat = !!opt.color, pts = [];
  for (let i = 0; i < 5; i++) {
    const a = 0.5 + i * 0.3 + Math.sin(t * 1.8 + i * 1.3) * 0.06, d = (16 + i * 8.5) * s;
    const ang = f > 0 ? Math.PI - a : a;
    pts.push([x + Math.cos(ang) * d, y + Math.sin(ang) * d + 3 * s, ang]);
  }
  if (!flat) { ctx.strokeStyle = 'rgba(255,110,190,0.6)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(x, y); for (const p of pts) ctx.lineTo(p[0], p[1]); ctx.stroke(); }
  pts.forEach(([cx, cy, ang], i) => {
    const w = (4.2 + (i === 2 ? 0.8 : 0)) * s, h = (9.6 + (i === 2 ? 1.6 : 0)) * s;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang - Math.PI / 2 + Math.sin(t * 2.2 + i) * 0.12);
    ctx.fillStyle = flat ? opt.color : '#2a0b1f'; ctx.fillRect(-w / 2, -h / 2, w, h);
    if (!flat) {
      ctx.strokeStyle = '#ff4f9a'; ctx.lineWidth = 0.9 * s; ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = 'rgba(255,170,220,0.95)'; ctx.lineWidth = 0.8 * s;
      ctx.beginPath(); ctx.moveTo(0, -h * 0.32); ctx.lineTo(0, h * 0.3); ctx.moveTo(-w * 0.25, -h * 0.1); ctx.lineTo(w * 0.25, -h * 0.1); ctx.moveTo(-w * 0.22, h * 0.14); ctx.lineTo(w * 0.22, h * 0.2); ctx.stroke();
    }
    ctx.restore();
  });
};
