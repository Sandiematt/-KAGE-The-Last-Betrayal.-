/* ---- Kage's torso (kageBody): the fitted charcoal coat open over a black kimono, its standing collar, the crimson
   obi under a leather belt, the pouch at the back of the hip, and the saya. All in the spine frame: [u along the spine
   (0 the hip, 1 the neck), w design px toward the front, sharp corner?]. ---- */
// a narrow waist, a full chest, a square shoulder line: hip front, up the front to the throat, down the back
const KG_TORSO = [[-0.08, 9.6], [0.2, 8], [0.5, 10.2], [0.78, 12.8, 1], [0.94, 10.6], [1.06, 4.4, 1],
  [1.06, -5, 1], [0.96, -11.8], [0.76, -12.6], [0.42, -9.2], [0.18, -8.6], [-0.08, -10.6]];

function _kgTorso(f, ctx, K) {
  const P = _kgP(K), s = K.s, pts = KG_TORSO.map(p => P(p[0], p[1], p[2]));
  _kgPart(ctx, K, () => _kgShape(ctx, pts), KG.coat, { sd: 6 * s, hd: 1.1 * s, rim: true, detail: K.A.flat ? null : (g) => {
    // the black kimono in the coat's opening, its own crossed collar catching the light
    _kgFill(g, [P(1.08, 0.8), P(1.08, 14), P(0.16, 14), P(0.18, 4.8), P(0.6, 3)], KG.inner[1]);
    _kgLine(g, [P(1.02, 4.6), P(0.7, 9.6)], KG.inner[2], 1.4 * s);
    _kgLine(g, [P(0.94, 7), P(0.74, 10.4)], KG.inner[0], 1 * s);
    // the lapel: a lit edge, and the crimson piping inside it
    _kgLine(g, [P(1.08, 0.8), P(0.6, 3), P(0.18, 4.8)], KG.coat[2], 2.2 * s);
    _kgLine(g, [P(1.06, 1.9), P(0.6, 4.2), P(0.18, 6)], KG.red[1], 1.1 * s);
    // the seam down the back and a fold from the armpit
    _kgLine(g, [P(0.98, -6.6), P(0.6, -5.4), P(0.2, -5.8)], KG.coat[0], 1 * s);
    _kgLine(g, [P(0.8, -1.6), P(0.52, -3.2), P(0.3, -2.2)], KG.coat[2], 0.8 * s);
  } });
}

// the standing collar behind the neck: a tall blade of the coat, crimson inside
function _kgCollar(f, ctx, K) {
  const P = _kgP(K), s = K.s;
  const c = [P(0.96, -10.4, 1), P(1.2, -12.4, 1), P(1.3, -7, 1), P(1.16, -1), P(1.02, 2.4, 1)];
  _kgPart(ctx, K, () => _kgShape(ctx, c), KG.coat, { sd: 3 * s, hd: 0.9 * s, rim: true, detail: K.A.flat ? null : (g) => {
    _kgLine(g, [P(1.28, -7.4), P(1.15, -1.6), P(1.03, 1.8)], KG.red[1], 1.6 * s);
  } });
}

// the waist: a wide crimson obi, a dark leather belt over it with a silver buckle at the front, and a small leather
// pouch sitting at the back of the hip
function _kgWaist(f, ctx, K) {
  const P = _kgP(K), s = K.s, flat = K.A.flat;
  const obi = [P(0.22, -8.9, 1), P(0.23, 8.5, 1), P(0.0, 9.9, 1), P(-0.02, -10.6, 1)];
  _kgPart(ctx, K, () => _kgShape(ctx, obi), KG.red, { sd: 4.4 * s, hd: 0.9 * s, line: KG.lineRed, detail: flat ? null : (g) => {
    _kgLine(g, [P(0.175, -10), P(0.185, 10)], KG.red[0], 0.9 * s);
    _kgLine(g, [P(0.035, -11), P(0.045, 11)], KG.red[0], 0.9 * s);
  } });
  const belt = [P(0.145, -9.6, 1), P(0.155, 9.3, 1), P(0.075, 9.9, 1), P(0.065, -10.2, 1)];
  _kgPart(ctx, K, () => _kgShape(ctx, belt), KG.boot, { sd: 1.4 * s, hd: 0.6 * s, line: '#000' });
  // the pouch: a flap over a small box, a silver stud
  const pouch = [P(0.17, -12.6, 1), P(0.17, -6.2, 1), P(0.0, -5.6, 1), P(-0.03, -9, 1), P(0.0, -12.4, 1)];
  _kgPart(ctx, K, () => _kgShape(ctx, pouch), KG.boot, { sd: 2 * s, hd: 0.7 * s, detail: flat ? null : (g) => {
    _kgLine(g, [P(0.1, -12.8), P(0.085, -9.2), P(0.1, -6)], KG.boot[2], 0.9 * s);
    const st = P(0.07, -9.2); g.fillStyle = KG.silver; g.beginPath(); g.arc(st[0], st[1], 0.9 * s, 0, TAU); g.fill();
  } });
  if (flat) return;
  // the buckle
  const c = P(0.11, 7.6);
  ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(Math.atan2(K.S.dy, K.S.dx) + Math.PI / 2);
  ctx.fillStyle = KG.silver; ctx.fillRect(-2.6 * s, -2.5 * s, 5.2 * s, 5 * s);
  ctx.fillStyle = KG.boot[0]; ctx.fillRect(-1.4 * s, -1.3 * s, 2.8 * s, 2.6 * s);
  ctx.fillStyle = KG.silverHi; ctx.fillRect(-2.6 * s, -2.5 * s, 5.2 * s, 0.9 * s);
  ctx.restore();
}

// the saya at his hip: a slim black lacquered sheath angled back and down, silver at its mouth and tip, bound in
// crimson cord (only with a blade that has one)
function _kgSaya(f, ctx, K) {
  const sh = f.shape(); if (sh !== 'katana' && sh !== 'shinsen' && sh !== 'odachi') return;
  const S = K.S, s = K.s, P = _kgP(K), len = Math.min(f.weaponLen() * 0.62, 74 * s), a = P(0.15, 5);
  let dx = -S.nx * 0.82 - S.ux * 0.57, dy = -S.ny * 0.82 - S.uy * 0.57; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const nx = -dy, ny = dx, at = (u, o) => [a[0] + dx * len * u + nx * o * s, a[1] + dy * len * u + ny * o * s];
  const body = [at(-0.04, 2.6), at(0.9, 2), at(1.02, 0), at(0.9, -2), at(-0.04, -2.6)];
  _kgPart(ctx, K, () => _poly(ctx, body), KG.inner, { sd: 1.6 * s, hd: 0.7 * s, lw: 0.9 * s, detail: K.A.flat ? null : (g) => {
    _kgFill(g, [at(-0.06, 4), at(0.05, 4), at(0.05, -4), at(-0.06, -4)], KG.silver);          // the mouth (koiguchi)
    _kgFill(g, [at(0.84, 4), at(1.1, 4), at(1.1, -4), at(0.84, -4)], KG.steel);              // the tip (kojiri)
    for (const u of [0.2, 0.26, 0.32]) _kgLine(g, [at(u, 4), at(u + 0.03, -4)], KG.red[1], 1.5 * s);   // the cord (sageo)
  } });
}

/* ---- the Tachibana Yoroi's far shoulder (drawArmor 'tachibana'): three dark lames laced in crimson peeking out
   behind the back shoulder. The near pauldron is drawn over the near arm (arms.js). ---- */
function drawTachibana(ctx, f, ink, flat) {
  const sk = f.sk, s = f.scale, S = f._spine || animeSpine(f);
  const sh = sk.shB, dx = -S.nx * 0.5 - S.ux * 0.86, dy = -S.ny * 0.5 - S.uy * 0.86, nx = -dy, ny = dx;
  const at = (u, o) => [sh.x - S.nx * 3 * s + dx * u * s + nx * o * s, sh.y - S.ny * 3 * s + dy * u * s + ny * o * s];
  for (let i = 2; i >= 0; i--) {
    const u = i * 4.6, lame = [at(u - 3, -6.6), at(u - 3, 6.6), at(u + 3.4, 7.4), at(u + 5.2, 0), at(u + 3.4, -7.4)];
    ctx.fillStyle = flat ? ink : i === 0 ? ANIME.metal1 : ANIME.metal0; ctx.beginPath(); _poly(ctx, lame); ctx.fill();
    if (flat) continue;
    ctx.strokeStyle = ANIME.metal2; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(...lame[2]); ctx.lineTo(...lame[3]); ctx.lineTo(...lame[4]); ctx.stroke();
    ctx.fillStyle = ANIME.crimson; for (const o of [-3.4, 0, 3.4]) { const p = at(u - 1, o); ctx.fillRect(p[0] - 0.7 * s, p[1] - 0.7 * s, 1.4 * s, 1.4 * s); }
  }
}
