/* ---- cloth panels: the robe, the haori skirts ---- */
Fighter.prototype.subPanel = function (ctx, A, part, w0, w1, tone, o) {
  const cl = this.cloths.find(c => c.kind === 'sub' && c.part === part);
  if (!cl || !cl.c.init) return;
  const n = coatEdges(cl, w0, w1, this.y + 2 * A.s), U = A.U, f = this.facing;
  const acc = subTone(SUB_ACC[this.armor]);
  celFill(ctx, () => coatPanelPath(ctx, n), tone, A, { sd: (o.back ? 7 : 5) * U, hd: o.back ? 0 : 0.9 * U, rim: true, detail: (g) => {
    _panelFolds(g, n, o.back ? ANIME.cloth0 : tone[0], 1 * A.s, o.kind === 'robe' ? [0.28, 0.55, 0.8] : [0.4, 0.72]);
    const front = (_cpL[0] - _cpR[0]) * f > 0 ? _cpL : _cpR;
    if (o.kind === 'robe') {
      // gold piping down the open edge, an ink-black hem band edged gold, and black brush blots bleeding up from it
      g.strokeStyle = acc[1]; g.lineWidth = 1.2 * U; g.beginPath(); g.moveTo(front[2], front[3]); for (let i = 2; i < n; i++) g.lineTo(front[i * 2], front[i * 2 + 1]); g.stroke();
      _hemLine(g, n, 3 * U, '#030303', 6 * U);
      _hemLine(g, n, 6.4 * U, acc[1], 1.1 * U);
      g.fillStyle = '#040303';
      for (const [i, t, R] of (o.back ? [[n - 2.2, 0.25, 3.4], [n - 1.8, 0.62, 2.6], [n - 2.6, 0.82, 2]] : [[n - 2, 0.4, 2.6], [n - 1.6, 0.75, 2]])) {
        const p = _panelAt(n, i, t); g.beginPath(); g.ellipse(p[0], p[1], R * U, R * 1.6 * U, 0.2, 0, TAU); g.fill();
      }
    } else {
      // the ash haori: a violet hem band and pale ash flecks
      _hemLine(g, n, 3 * U, acc[0], 3.4 * U);
      _hemLine(g, n, 5.4 * U, acc[1], 0.9 * U);
      g.fillStyle = 'rgba(190,184,200,0.35)';
      for (let k = 0; k < 9; k++) { const p = _panelAt(n, 1 + (k * 0.618 % 1) * (n - 2), (k * 0.381 + 0.1) % 1); g.fillRect(p[0], p[1], 1.2 * A.s, 1.2 * A.s); }
      g.strokeStyle = acc[1]; g.lineWidth = 0.9 * U; g.beginPath(); g.moveTo(front[2], front[3]); for (let i = 2; i < n; i++) g.lineTo(front[i * 2], front[i * 2 + 1]); g.stroke();
    }
  } });
};

/* ---- cloth panels: the ledger haori skirts, the cloak, the warden's cape ---- */
Fighter.prototype.subBPanel = function (ctx, A, part, w0, w1, tone, o) {
  const cl = this.cloths.find(c => c.kind === 'subb' && c.part === part);
  if (!cl || !cl.c.init) return;
  const floorY = this.y + 2 * A.s, n = coatEdges(cl, w0, w1, floorY), U = A.U, f = this.facing;
  const acc = _subbAcc(this, this.armor), torn = o.kind !== 'ledger';
  const path = torn ? () => tornPanelPath(ctx, n, o.kind === 'tyrant' ? 7 : 9, (o.kind === 'tyrant' ? 9 : 7) * U, o.kind === 'tyrant' ? 3 : 1, floorY) : () => coatPanelPath(ctx, n);
  celFill(ctx, path, tone, A, { sd: (o.back || torn ? 7 : 5) * U, hd: o.back || torn ? 0 : 0.9 * U, rim: true, detail: (g) => {
    _panelFolds(g, n, o.back || torn ? ANIME.cloth0 : tone[0], 1 * A.s, torn ? [0.25, 0.5, 0.76] : [0.4, 0.72]);
    const front = (_cpL[0] - _cpR[0]) * f > 0 ? _cpL : _cpR;
    if (o.kind === 'ledger') {
      // shingled rows of pasted ledger pages up from the hem, ruled with ink, a few struck through in violet
      for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) {
        const i = n - 1.3 - r * 0.85, t = (k + (r % 2) * 0.5 + 0.2) / 4.2;
        if (t > 0.96) continue;
        const p = _panelAt(n, i, t), q = _panelAt(n, i, t + 0.2), b = _panelAt(n, i + 0.75, t), c = _panelAt(n, i + 0.75, t + 0.2);
        g.fillStyle = (r + k) % 2 ? LEDGER[1] : LEDGER[0]; g.beginPath(); _poly(g, [p, q, c, b]); g.fill();
        g.strokeStyle = ANIME.outline; g.lineWidth = 0.9 * A.s; g.stroke();
        g.strokeStyle = 'rgba(8,7,8,0.7)'; g.lineWidth = 0.6 * A.s; g.beginPath();
        for (const v of [0.3, 0.55]) { g.moveTo(lerp(p[0], b[0], v) + (q[0] - p[0]) * 0.15, lerp(p[1], b[1], v) + (q[1] - p[1]) * 0.15); g.lineTo(lerp(q[0], c[0], v) - (q[0] - p[0]) * 0.15, lerp(q[1], c[1], v) - (q[1] - p[1]) * 0.15); }
        g.stroke();
        if ((r * 4 + k) % 3 === 1) _strokePts(g, [[p[0], lerp(p[1], b[1], 0.7)], [q[0], lerp(q[1], c[1], 0.25)]], acc[2], 1 * U);
      }
      _hemLine(g, n, 2 * U, acc[0], 3 * U);
      g.strokeStyle = acc[1]; g.lineWidth = 1.1 * U; g.beginPath(); g.moveTo(front[2], front[3]); for (let i = 2; i < n; i++) g.lineTo(front[i * 2], front[i * 2 + 1]); g.stroke();
    } else if (o.kind === 'cloak') {
      // the echo's cloak: a violet-lit band near the torn hem, faint memory script along it
      _hemLine(g, n, 9 * U, '#1a1530', 3 * U);
      _hemLine(g, n, 11 * U, acc[0], 0.9 * U);
      g.fillStyle = 'rgba(185,165,255,0.35)';
      for (let k = 0; k < 7; k++) { const p = _panelAt(n, n - 2.1, 0.1 + k * 0.13); g.fillRect(p[0] - 0.6 * A.s, p[1] - 1.6 * A.s, 1.2 * A.s, 3.2 * A.s); }
    } else {
      // the warden's cape: black, bleeding to the accent at its ragged hem, a lining edge and a crest high on its back
      _hemLine(g, n, 7 * U, f > 0 ? '#16101c' : '#16101c', 6 * U);
      _hemLine(g, n, 10.5 * U, acc[0], 1 * U);
      g.strokeStyle = acc[0]; g.lineWidth = 1.6 * U; g.beginPath(); g.moveTo(front[2], front[3]); for (let i = 2; i < n; i++) g.lineTo(front[i * 2], front[i * 2 + 1]); g.stroke();
      const c = _panelAt(n, 1.6, 0.5); g.strokeStyle = acc[1]; g.lineWidth = 1.2 * U;
      g.beginPath(); g.arc(c[0], c[1], 4 * U, 0, TAU); g.moveTo(c[0] - 2.6 * U, c[1]); g.lineTo(c[0] + 2.6 * U, c[1]); g.moveTo(c[0], c[1] - 2.6 * U); g.lineTo(c[0], c[1] + 2.6 * U); g.stroke();
    }
  } });
};
