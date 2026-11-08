/* ---- arms and legs ---- */
// the frayed end of a sleeve: the opening p..q torn into hanging points (straw sticking out on the training husk)
Fighter.prototype.hollowCuff = function (ctx, p, q, fx, fy, A, tone, U, far, fray) {
  let dx = fx * 0.6, dy = fy * 0.6 + 0.55; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  if (fray === 'straw') {
    celFill(ctx, () => {
      for (let j = 0; j < 6; j++) {
        const t = (j + 0.5) / 6, bx = lerp(p.x, q.x, t), by = lerp(p.y, q.y, t), sp = (t - 0.5) * 1.1, c = Math.cos(sp), s = Math.sin(sp);
        const ux = fx * c - fy * s, uy = fx * s + fy * c, len = (5 + HOLLOW_TEETH[j] * 5) * U, nx = -uy * 0.9 * U, ny = ux * 0.9 * U;
        ctx.moveTo(bx - fx * 2 * U + nx, by - fy * 2 * U + ny); ctx.lineTo(bx + ux * len, by + uy * len); ctx.lineTo(bx - fx * 2 * U - nx, by - fy * 2 * U - ny); ctx.closePath();
      }
    }, HOLLOW_STRAW, A, { sd: 0.6 * U, seam: false });
    return;
  }
  const K = 4, rag = 7 * U * fray, bx = -fx * 2.4 * U, by = -fy * 2.4 * U;
  celFill(ctx, () => {
    ctx.moveTo(p.x + bx, p.y + by); ctx.lineTo(p.x, p.y);
    for (let k = 0; k < K; k++) {
      const t0 = (k + 0.5) / K, t1 = (k + 1) / K, d = HOLLOW_TEETH[(k + 2) % HOLLOW_TEETH.length] * rag + 2 * U;
      ctx.lineTo(lerp(p.x, q.x, t0) + dx * d, lerp(p.y, q.y, t0) + dy * d);
      if (k < K - 1) ctx.lineTo(lerp(p.x, q.x, t1) + dx * 1.2 * U, lerp(p.y, q.y, t1) + dy * 1.2 * U);
    }
    ctx.lineTo(q.x, q.y); ctx.lineTo(q.x + bx, q.y + by); ctx.closePath();
  }, tone, A, { sd: 2.4 * U, hd: far ? 0 : 0.7 * U, rim: !far, detail: far ? null : (g) => {
    // the frayed threads and the violet edge of the torn lining
    g.strokeStyle = A.pal.acc; g.lineWidth = 0.9 * A.s; g.beginPath(); g.moveTo(p.x + dx * 1.4 * U, p.y + dy * 1.4 * U); g.lineTo(q.x + dx * 1.4 * U, q.y + dy * 1.4 * U); g.stroke();
  } });
};

// bandage wraps round a limb a -> b: a pale-dark binding with diagonal turns and a loose end
Fighter.prototype.hollowWrap = function (ctx, a, b, ra, rb, A, U, far) {
  celFill(ctx, () => animeCapsule(ctx, a, b, ra, rb, 0.3 * U, 0.4), far ? [HOLLOW_WRAP[0], HOLLOW_WRAP[0], HOLLOW_WRAP[1]] : HOLLOW_WRAP, A, { sd: 2.2 * U, hd: far ? 0 : 0.7 * U, detail: far ? null : (g) => {
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, turns = Math.max(3, Math.round(l / (3.4 * U)));
    const r = Math.max(ra, rb) * 1.2;
    for (let i = 1; i < turns; i++) {
      const k = i / turns, x = a.x + dx * k, y = a.y + dy * k, sk = 0.07 * (i % 2 ? 1 : 0.6);
      g.strokeStyle = ANIME.outline; g.lineWidth = 1 * A.s; g.beginPath(); g.moveTo(x + nx * r - dx * sk, y + ny * r - dy * sk); g.lineTo(x - nx * r + dx * sk, y - ny * r + dy * sk); g.stroke();
      g.strokeStyle = HOLLOW_WRAP[2]; g.lineWidth = 0.7 * A.s; g.beginPath(); g.moveTo(x + nx * r - dx * sk - A.lx * U, y + ny * r - dy * sk - A.ly * U); g.lineTo(x - nx * r + dx * sk - A.lx * U, y - ny * r + dy * sk - A.ly * U); g.stroke();
    }
  } });
};
