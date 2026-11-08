/* ---- belts ---- */
Fighter.prototype.subBelt = function (ctx, A, S, U, id) {
  const P = _sP(S, U), acc = subTone(animeSkin(this).acc || '#7e161b');
  const band = (u0, u1, wb, wf) => () => _poly(ctx, [P(u0, -wb), P(u0, wf), P(u1, wf), P(u1, -wb)]);
  const spec = { kuroe: [0, 0.2, 13.6, 13], garan: [-0.02, 0.18, 15.4, 15], hisame: [0.02, 0.13, 11.6, 11], shiden: [0, 0.12, 13.8, 13.4], tsugumi: [0.02, 0.15, 11.8, 11.4], sayo: [0.02, 0.14, 11.6, 11.2], utsushi: null }[id];
  if (!spec) return;
  const [u0, u1, wb, wf] = spec;
  celFill(ctx, band(u0, u1, wb, wf), [ANIME.cloth0, '#121012', '#29252a'], A, { sd: 2.6 * U, hd: 0.6 * U, detail: (g) => {
    // two accent cords along the band and a knot at the front
    g.strokeStyle = acc[1]; g.lineWidth = 1.1 * U; g.beginPath();
    for (const u of id === 'garan' ? [u0 + 0.05, u1 - 0.05] : [(u0 + u1) / 2]) { const a = P(u, -wb), b = P(u, wf); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
    if (id === 'garan') {
      // the iron ring plate of the storm vanguard at the front, a tomoe swirl on it
      const c = P((u0 + u1) / 2, wf - 4);
      g.fillStyle = SUB_IRON[2]; g.beginPath(); g.arc(c[0], c[1], 4.2 * U, 0, TAU); g.fill();
      g.fillStyle = SUB_IRON[0]; g.beginPath(); g.arc(c[0], c[1], 3.2 * U, 0, TAU); g.fill();
      g.strokeStyle = acc[2]; g.lineWidth = 0.9 * U; g.beginPath(); g.arc(c[0], c[1], 1.8 * U, 0.3, 4.6); g.stroke();
    }
  } });
  if (A.flat) return;
  const k = P((u0 + u1) / 2, wf - 2.4);
  if (id === 'kuroe') {
    // a gold-tasselled cord and two redaction slips hanging from the obi
    const s0 = P(u0 - 0.02, wf - 6), s1 = P(u0 - 0.02, wf - 10.5);
    for (const [p, len] of [[s0, 15], [s1, 11]]) {
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.atan2(S.dy, S.dx) + Math.PI / 2 + 0.06 * Math.sin(this.time * 2 + len));
      celFill(ctx, () => ctx.rect(-1.7 * U, 0, 3.4 * U, len * U), SUB_PAPER, A, { sd: 1 * U, detail: (g) => {
        g.fillStyle = '#060505'; g.fillRect(-1.7 * U, len * 0.3 * U, 3.4 * U, 1.7 * U); g.fillRect(-1.7 * U, len * 0.62 * U, 3.4 * U, 1.3 * U);
      } });
      ctx.restore();
    }
  }
  if (id === 'tsugumi') {
    // the courier's satchel at the back hip: a lacquered box, its lid strapped, two vials glowing in the slot
    const b0 = P(0.02, -16), b1 = P(0.02, -6), b2 = P(-0.24, -6), b3 = P(-0.24, -16);
    celFill(ctx, () => _poly(ctx, [b0, b1, b2, b3]), SUB_LACQ, A, { sd: 2.4 * U, hd: 0.7 * U, rim: true, detail: (g) => {
      const l0 = P(-0.06, -16), l1 = P(-0.06, -6); _strokePts(g, [l0, l1], ANIME.outline, 1.2 * U);
      _strokePts(g, [P(0.02, -11), P(-0.24, -11)], acc[1], 1.2 * U);
    } });
    ctx.globalCompositeOperation = 'lighter';
    for (const w of [-14, -12.2]) { const p = P(0.07, w); ctx.fillStyle = 'rgba(169,138,216,0.55)'; ctx.fillRect(p[0] - 0.9 * U, p[1] - 2.6 * U, 1.8 * U, 3.6 * U); }
    ctx.globalCompositeOperation = 'source-over';
  }
  if (id === 'sayo') {
    // two flat pouches on the belt
    for (const w of [-9, -2]) { const a = P(0.0, w), b = P(0.0, w + 5), c = P(-0.16, w + 5), d = P(-0.16, w); celFill(ctx, () => _poly(ctx, [a, b, c, d]), SUB_LACQ, A, { sd: 1.4 * U, hd: 0.5 * U }); }
  }
  // the knot at the front
  ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(k[0], k[1], 1.5 * U, 0, TAU); ctx.fill();
};

/* ---- kusazuri and sode ---- */
Fighter.prototype.subKusazuri = function (ctx, A, S, U, which, o) {
  const sk = this.sk, tone = o.iron ? SUB_IRON : SUB_LACQ, far = which === 'back';
  const panel = (w, thighA, thighB, wid) => {
    const top = [spX(S, 0.06, w * U), spY(S, 0.06, w * U)];
    let tx = thighB.x - thighA.x, ty = thighB.y - thighA.y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    let dx = -S.ux * 0.5 + tx * 0.5, dy = -S.uy * 0.5 + ty * 0.5; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const [a0, a1, b1, b0, Q] = _hang(top, dx, dy, 21 * U * o.len, wid * U, wid * 1.16 * U), tn = far ? SUB_LACQ_FAR : tone;
    celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 1.2 * U), tn, A, { sd: 3 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: (g) => _lace(g, A, Q, o.rows, far ? 3 : 5, tn, 1 * U, o.acc) });
  };
  const wd = 14 * (o.wide || 1);
  if (far) { panel(-8, sk.hipB, sk.bkn, wd); if (o.panels > 2) panel(1, sk.hipB, sk.bkn, wd); }
  else { if (o.panels > 2) panel(-3, sk.hipF, sk.fkn, wd); panel(7, sk.hipF, sk.fkn, wd + 1); }
};

/* ---- belts ---- */
Fighter.prototype.subBBelt = function (ctx, A, S, U, id) {
  const P = _sP(S, U), acc = subTone(animeSkin(this).acc);
  const band = (u0, u1, wb, wf) => () => _poly(ctx, [P(u0, -wb), P(u0, wf), P(u1, wf), P(u1, -wb)]);
  const spec = { kasane: [0.02, 0.15, 12.4, 12], gonryu: [-0.03, 0.17, 16, 15.6], shizune: [0.01, 0.16, 11.6, 11.2], moro: [0.02, 0.14, 12, 11.6], soma: [0.0, 0.16, 13.4, 13], echo_sentinel: [0.02, 0.14, 11.6, 11.2], echo_warden: [0.0, 0.16, 14.4, 14] }[id];
  if (!spec) return;
  const [u0, u1, wb, wf] = spec;
  const tone = id === 'shizune' ? ['#1d1912', '#3c3428', '#5a4f3c'] : id === 'moro' ? LEATHER : id === 'gonryu' ? ['#120f0a', '#221c13', '#3d3222'] : [ANIME.cloth0, '#121012', '#29252a'];
  celFill(ctx, band(u0, u1, wb, wf), tone, A, { sd: 2.6 * U, hd: 0.6 * U, detail: (g) => {
    if (id === 'gonryu') {
      // a thick twisted rope: diagonal twists, a dull gold cord through it
      g.strokeStyle = tone[0]; g.lineWidth = 1.2 * U; g.beginPath();
      for (let w = -wb + 2; w < wf; w += 3.4) { const a = P(u0, w), b = P(u1, w + 2.6); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      g.stroke();
      g.strokeStyle = tone[2]; g.lineWidth = 0.6 * A.s; g.beginPath();
      for (let w = -wb + 3; w < wf; w += 3.4) { const a = P(u0 + 0.02, w), b = P(u1 - 0.02, w + 2); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      g.stroke();
      return;
    }
    g.strokeStyle = id === 'shizune' ? '#6e6148' : acc[1]; g.lineWidth = (id === 'shizune' ? 0.8 : 1) * U; g.beginPath();
    for (const u of [u0 + 0.025, u1 - 0.025]) { const a = P(u, -wb), b = P(u, wf); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  } });
  if (A.flat) return;
  if (id === 'kasane') {
    // the ledger at the hip: a bound book on a cord, its stitched spine violet, its page edges pale
    const top = P(0.0, 6);
    ctx.save(); ctx.translate(top[0], top[1]); ctx.rotate(0.08 * Math.sin(this.time * 1.6));
    _strokePts(ctx, [[0, 0], [0, 3 * U]], acc[1], 1 * U);
    celFill(ctx, () => ctx.rect(-4.6 * U, 3 * U, 9.2 * U, 11.6 * U), ['#0a0810', '#18121f', '#2d2438'], A, { sd: 1.6 * U, hd: 0.6 * U, detail: (g) => {
      g.fillStyle = LEDGER[2]; g.fillRect(3.2 * U, 3.6 * U, 1.2 * U, 10.4 * U);
      g.strokeStyle = acc[1]; g.lineWidth = 0.8 * U; g.beginPath(); for (let k = 0; k < 4; k++) { const y = (5 + k * 2.8) * U; g.moveTo(-4.6 * U, y); g.lineTo(-3 * U, y); } g.stroke();
      g.strokeStyle = acc[0]; g.lineWidth = 0.9 * U; g.beginPath(); g.moveTo(-1.4 * U, 6 * U); g.lineTo(1.8 * U, 6 * U); g.moveTo(-1.4 * U, 8 * U); g.lineTo(1.2 * U, 8 * U); g.stroke();
    } });
    ctx.restore();
  } else if (id === 'gonryu') {
    // the gate-knocker ring hanging at the front of the rope belt, on a gold boss
    const c = P(0.07, wf - 3.5), r = 4.4 * U;
    ctx.strokeStyle = ANIME.outline; ctx.lineWidth = 3.6 * U; ctx.beginPath(); ctx.arc(c[0], c[1] + r, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = GOLDM[1]; ctx.lineWidth = 2 * U; ctx.beginPath(); ctx.arc(c[0], c[1] + r, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = GOLDM[2]; ctx.lineWidth = 0.8 * U; ctx.beginPath(); ctx.arc(c[0], c[1] + r, r, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();
    ctx.fillStyle = ANIME.outline; ctx.beginPath(); ctx.arc(c[0], c[1], 2.8 * U, 0, TAU); ctx.fill();
    ctx.fillStyle = GOLDM[1]; ctx.beginPath(); ctx.arc(c[0], c[1], 2 * U, 0, TAU); ctx.fill();
  } else if (id === 'shizune') {
    // the obi knot at the front, plain, tied the way the school ties it
    const k = P(0.085, wf - 1);
    ctx.fillStyle = '#2b251c'; ctx.beginPath(); ctx.ellipse(k[0], k[1], 2.6 * U, 3.4 * U, Math.atan2(S.dy, S.dx), 0, TAU); ctx.fill();
    ctx.strokeStyle = '#6e6148'; ctx.lineWidth = 0.8 * U; ctx.stroke();
  } else if (id === 'moro') {
    // a pouch and a glass vial of memory light at the hip
    const a = P(0.02, -8), b = P(0.02, -2), c = P(-0.17, -2), d = P(-0.17, -8);
    celFill(ctx, () => _poly(ctx, [a, b, c, d]), LEATHER, A, { sd: 1.4 * U, hd: 0.5 * U });
    const v = P(0.02, 3);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(160,130,255,${0.5 + 0.3 * Math.sin(this.time * 5)})`; ctx.fillRect(v[0] - 1 * U, v[1] - 1 * U, 2 * U, 5 * U); ctx.globalCompositeOperation = 'source-over';
  } else {
    const k = P((u0 + u1) / 2, wf - 2.4);
    ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(k[0], k[1], 1.5 * U, 0, TAU); ctx.fill();
  }
};
