/* KAGE — the Act I and Act II sub-bosses as anime samurai (anime redesign, ticket 05).
   Same rule as everyone: a black face with white eyes, near-black layered cloth, dark metal, a fine red rim. Each keeps
   its own accent (its ENEMIES `accent`), weapon and title, and reads apart by silhouette at gameplay zoom:
     kuroe    the Ink Censor: a tall black lacquered eboshi slashed with a pale ink stroke and hung with a redaction
              slip, a monk's robe to the ankles with huge sleeves, a gold-trimmed kesa across the chest, a ringed
              shakujō staff with an ink-brush tassel
     garan    the Stormbroken: a horned iron brow band and wild mane over a snarling red oni menpō, a half dō burnt
              ragged down the middle with a glowing lightning scar, one huge laced sode, heavy iron tekko gauntlets
     hisame   the Rain Courier: a close hood with a stiff oiled visor and a face cloth, a fringed rain capelet and a
              long fringed rain cape (mino) from the shoulders, a message tube across the back, slim bound legs,
              lacquered war fans with rain-streaked paper
     shiden   the Last Lieutenant: a star-riveted hoshi kabuto with a forked lightning maedate, a full dō laced in
              violet, stacked sode, kusazuri, and a sashimono banner on his back; a violet-tasselled yari
     tsugumi  the Memory Courier: a wide flat hakobi-gasa hung with three glowing memory vials, an ash haori to the
              knee flecked pale, a satchel of vials at the hip, ring-pommel kunai
     sayo     the Quiet Hand: a close hood with a silver brow band and a mist face cloth, a long drape from the back of
              the head, a strip vest with a strap of message slips, a small shoulder guard, a kodachi in its saya
     utsushi  the Borrowed Face (Hollow): a borrowed white mask that does not quite fit, cracked, its painted face
              slipping between expressions, the eyes glowing through its holes; torn robes and long torn hood tails,
              scraps of the operative's vest it copied
   Each helmet and armour look is also gear Kage can wear (sumi_eboshi, hisame_zukin, hoshi_kabuto, hakobi_gasa,
   kasumi_men, utsushi_men; soryo_e, ikazuchi_do, kasumi_shroud, shiden_yoroi, hai_haori, shirabe_do): the parts are
   drawn per look, so they sit on his body the same way. Drawing only: nothing here moves a joint or touches gameplay. */

// accents per look (the wearer's identity colour), and black lacquer / iron / cloth tones
const SUB_ACC = { sumi_eboshi: '#c9a45c', robe: '#c9a45c', oni: '#ff6a52', half_do: '#ff6a52', rain_hood: '#7fb8ff', mist_shroud: '#7fb8ff',
  sentinel_helm: '#b07cff', vanguard_plate: '#b07cff', courier_hat: '#a98ad8', shadow_cloak: '#a98ad8', veil: '#9b8cc9', operative_vest: '#9b8cc9', borrowed_mask: '#c9bdff' };
const SUB_LACQ = ['#060607', '#111114', '#2a2a30'];
const SUB_LACQ_FAR = ['#050506', '#0b0b0d', '#18181c'];
const SUB_IRON = ['#08090a', '#16181b', '#33373e'];
const SUB_WOOD = ['#0b0806', '#17110c', '#2e231a'];
const SUB_PAPER = ['#857d6c', '#c4bba5', '#e4dcc8'];     // the censor's slips and Sayo's message slips: dull, never white
const SUB_GLASS = ['#1a1626', '#2c2640', '#5a5078'];
const SUB_RED_LACQ = ['#1b0706', '#35100d', '#5e1d17'];  // Garan's oni menpō
const KESA = ['#120d07', '#20180d', '#3b2c17'];
const ASH = ['#121115', '#1e1c22', '#36333c'];           // Tsugumi's ash haori
const RAIN = ['#07090c', '#10151b', '#212a35'];           // Hisame's oiled cloth
const _subToneC = {};
// an accent as [deep, base, bright]
function subTone(hex) {
  let v = _subToneC[hex]; if (v) return v;
  const rgb = _hexRGB(hex) || [200, 40, 40];
  return (_subToneC[hex] = [_mix(rgb, [0, 0, 0], 0.66), _mix(rgb, [0, 0, 0], 0.36), hex]);
}
// a sub-boss's own accent replaces crimson on its body parts (kote straps, collar, obi edges)
const _subPalC = new Map();
function subAccPal(pal, acc) {
  let m = _subPalC.get(pal); if (!m) _subPalC.set(pal, m = {});
  return m[acc] || (m[acc] = Object.assign({}, pal, { acc: subTone(acc)[1], accHi: acc }));
}

/* ---- skins ---- */
ANIME_SKINS.kuroe = { top: 'gi', feet: 'sandal', sleeve: 1.32, kote: false, collar: false, acc: '#c9a45c', sub: 'kuroe' };
ANIME_SKINS.garan = { top: 'gi', feet: 'sandal', sleeve: 1.1, kote: true, collar: false, suneate: true, acc: '#ff6a52', sub: 'garan' };
ANIME_SKINS.hisame = { top: 'gi', feet: 'sandal', sleeve: 0.84, kote: true, collar: false, wrapShin: true, acc: '#7fb8ff', sub: 'hisame' };
ANIME_SKINS.shiden = { top: 'gi', feet: 'sandal', sleeve: 1.04, kote: true, collar: false, suneate: true, acc: '#b07cff', sub: 'shiden' };
ANIME_SKINS.tsugumi = { top: 'gi', feet: 'sandal', sleeve: 0.92, kote: true, collar: false, wrapShin: true, acc: '#a98ad8', sub: 'tsugumi' };
ANIME_SKINS.sayo = { top: 'gi', feet: 'sandal', sleeve: 0.86, kote: true, collar: false, wrapShin: true, saya: true, acc: '#9b8cc9', sub: 'sayo' };
ANIME_SKINS.utsushi = Object.assign({}, _hollowBase, { sleeve: 0.98, sub: 'utsushi',
  hollow: { head: 'borrowed', top: 'rip', fray: 0.9, tails: true, robe: { back: [7, 10.5, 18, 42], flap: [6, 10, 13, 26], teeth: 6, rag: 9 } } });

// cloth for the looks (from animeCloths): robes, haori skirts, the rain cape, hood tails and cords. By look, so Kage
// wearing the gear gets the same cloth; robe and haori skirts only under a gi (Kage's own coat already hangs there).
function subCloths(f, sk) {
  const s = f.scale, coat = sk.top === 'coat', add = (o) => f.cloths.push(Object.assign({ kind: 'sub' }, o));
  if (f.armor === 'robe' && !coat) {
    add({ part: 'robeB', c: new Cloth(9, 11.2 * s, { ph: 2.4, wind: 520, grav: 1150, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -4 });
    add({ part: 'robeF', c: new Cloth(8, 10.8 * s, { ph: 4.9, wind: 220, grav: 1300, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });
  }
  if (f.armor === 'shadow_cloak' && !coat) {
    add({ part: 'haoriB', c: new Cloth(6, 10.4 * s, { ph: 2.9, wind: 900, grav: 1050, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -6 });
    add({ part: 'haoriF', c: new Cloth(5, 10 * s, { ph: 5.3, wind: 300, grav: 1250, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -5 });
  }
  if (f.armor === 'mist_shroud') add({ part: 'shroud', c: new Cloth(7, 10 * s, { ph: 5.2, wind: 1000, grav: 850, stiff: 1.4, hang: 0.4 }), at: 'sh', dx: 6, dy: 0 });
  if (f.helmet === 'rain_hood') {
    f.cloths.push({ kind: 'scarf', c: new Cloth(9, 7.4 * s, { ph: 3.5, wind: 1100, grav: 600, stiff: 1.8 }), at: 'head', color: RAIN[1], rim: 'rgba(60,96,150,0.85)', w: 7 * s, w1: 1.8 * s, dy: 4, dx: 14 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(8, 6.8 * s, { ph: 6.4, wind: 900, grav: 700, stiff: 1.8 }), at: 'head', color: subTone(SUB_ACC.rain_hood)[1], w: 1.6 * s, w1: 1 * s, dy: -4, dx: 15 });
  }
  if (f.helmet === 'sentinel_helm') {
    // the agemaki cords at the back of the kabuto: two violet tassels
    f.cloths.push({ kind: 'scarf', c: new Cloth(5, 5.6 * s, { ph: 6, wind: 420, grav: 1000, stiff: 1.6 }), at: 'head', color: subTone(SUB_ACC.sentinel_helm)[1], w: 2.6 * s, w1: 3.4 * s, dy: -2, dx: 20 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(4, 5.2 * s, { ph: 8.2, wind: 380, grav: 1050, stiff: 1.6 }), at: 'head', color: subTone(SUB_ACC.sentinel_helm)[0], w: 2.2 * s, w1: 3 * s, dy: 1, dx: 19 });
  }
  if (f.helmet === 'veil') {
    // the long drape from the back of the hood
    f.cloths.push({ kind: 'scarf', c: new Cloth(9, 7.6 * s, { ph: 5, wind: 760, grav: 760, stiff: 1.7 }), at: 'head', color: '#121118', rim: 'rgba(110,98,150,0.7)', w: 13 * s, w1: 5 * s, dy: -6, dx: 13 });
  }
  if (f.helmet === 'sumi_eboshi') {
    // the eboshi's chin cords, loose ends hanging behind the jaw
    f.cloths.push({ kind: 'scarf', c: new Cloth(5, 5 * s, { ph: 4, wind: 300, grav: 1100, stiff: 1.6 }), at: 'head', color: subTone(SUB_ACC.sumi_eboshi)[1], w: 1.4 * s, w1: 1 * s, dy: 8, dx: 10 });
  }
}

/* ---- helpers ---- */
const _sP = (S, U) => (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
const _sPt = (S, U) => (u, w) => ({ x: spX(S, u, w * U), y: spY(S, u, w * U) });
function _poly(ctx, pts) { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
function _strokePts(g, pts, col, w) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
// lacing rows on a quad plate (as _odoshi in 22-anime-order.js, with the wearer's accent)
function _lace(g, A, Q, rows, ticks, tone, lw, acc) {
  const s = A.s;
  for (let i = 0; i < rows; i++) {
    const t0 = i / rows, t1 = t0 + 0.42 / rows;
    g.strokeStyle = acc; g.lineWidth = lw; g.lineCap = 'butt'; g.beginPath();
    for (let j = 0; j < ticks; j++) { const k = (j + 0.5) / ticks, p = Q(k, t0 + 0.06 / rows), q = Q(k, t1); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
    g.stroke();
    if (i === 0) continue;
    const a = Q(-0.1, t0), b = Q(1.1, t0);
    g.lineCap = 'round';
    g.strokeStyle = tone[2]; g.lineWidth = 0.8 * s; g.beginPath(); g.moveTo(a[0] - A.lx * 1.2 * s, a[1] - A.ly * 1.2 * s); g.lineTo(b[0] - A.lx * 1.2 * s, b[1] - A.ly * 1.2 * s); g.stroke();
    g.strokeStyle = ANIME.outline; g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
  g.lineCap = 'round';
}
// a glowing bolt / scar: a dark break, an additive bloom in the accent and a bright core
function _bolt(g, pts, w, col) {
  const path = () => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); };
  g.lineJoin = 'miter'; g.lineCap = 'round';
  g.strokeStyle = ANIME.outline; g.lineWidth = w * 2.6; path(); g.stroke();
  g.globalCompositeOperation = 'lighter'; g.globalAlpha *= 0.45; g.strokeStyle = col; g.lineWidth = w * 3.4; path(); g.stroke(); g.globalAlpha /= 0.45;
  g.globalCompositeOperation = 'source-over';
  g.strokeStyle = col; g.lineWidth = w; path(); g.stroke();
  g.lineJoin = 'round';
}
// a quad from a hanging anchor: top centre `top`, hanging direction (dx, dy), length, widths -> [a0, a1, b1, b0, Q]
function _hang(top, dx, dy, len, w0, w1) {
  const nx = -dy, ny = dx;
  const a0 = [top[0] - nx * w0 / 2, top[1] - ny * w0 / 2], a1 = [top[0] + nx * w0 / 2, top[1] + ny * w0 / 2];
  const b1 = [top[0] + dx * len + nx * w1 / 2, top[1] + dy * len + ny * w1 / 2], b0 = [top[0] + dx * len - nx * w1 / 2, top[1] + dy * len - ny * w1 / 2];
  const Q = (k, t) => [lerp(lerp(a0[0], a1[0], k), lerp(b0[0], b1[0], k), t), lerp(lerp(a0[1], a1[1], k), lerp(b0[1], b1[1], k), t)];
  return [a0, a1, b1, b0, Q];
}
// the hem of a panel filled by coatEdges: a band `off` px in from the hem edge, drawn across the panel
function _hemLine(g, n, off, col, lw) {
  const lx = _cpL[(n - 1) * 2], ly = _cpL[(n - 1) * 2 + 1], rx = _cpR[(n - 1) * 2], ry = _cpR[(n - 1) * 2 + 1];
  const ux = lx - _cpL[(n - 2) * 2], uy = ly - _cpL[(n - 2) * 2 + 1], ul = Math.hypot(ux, uy) || 1, ox = ux / ul, oy = uy / ul;
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
  g.moveTo(lx - ox * off - (rx - lx) * 0.4, ly - oy * off - (ry - ly) * 0.4); g.lineTo(rx - ox * off + (rx - lx) * 0.4, ry - oy * off + (ry - ly) * 0.4); g.stroke();
}
function _panelFolds(g, n, col, lw, ts) {
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
  for (const t of ts) { for (let i = 1; i < n; i++) { const x = lerp(_cpL[i * 2], _cpR[i * 2], t + Math.sin(i * 1.3 + t * 5) * 0.05), y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); } }
  g.stroke();
}
// a point inside the panel: link i (fractional), t across (0 the left edge, 1 the right)
function _panelAt(n, i, t) {
  const i0 = Math.max(0, Math.min(n - 1, Math.floor(i))), k = i - i0, i1 = Math.min(n - 1, i0 + 1);
  return [lerp(lerp(_cpL[i0 * 2], _cpR[i0 * 2], t), lerp(_cpL[i1 * 2], _cpR[i1 * 2], t), k), lerp(lerp(_cpL[i0 * 2 + 1], _cpR[i0 * 2 + 1], t), lerp(_cpL[i1 * 2 + 1], _cpR[i1 * 2 + 1], t), k)];
}

/* ---- layers called from the body (21-anime-body.js): 'back' behind everything, 'front' over the near leg, 'waist'
   at the sash ---- */
function subLayer(f, ctx, A, skin, U, layer) {
  const arm = f.armor, id = skin.sub;
  if (!id && !SUB_ACC[arm]) return;
  const S = A.S;
  if (layer === 'back') {
    if (arm === 'mist_shroud') f.subShroud(ctx, A, U);
    if (id === 'shiden') f.shidenBanner(ctx, A, S, U);
    if (id === 'hisame') f.hisameTube(ctx, A, S, U);
    if (arm === 'robe') f.subPanel(ctx, A, 'robeB', 26 * U, 58 * U, A.pal.coatB, { back: true, kind: 'robe' });
    if (arm === 'shadow_cloak') f.subPanel(ctx, A, 'haoriB', 24 * U, 36 * U, ASH, { back: true, kind: 'haori' });
  } else if (layer === 'front') {
    if (arm === 'robe') f.subPanel(ctx, A, 'robeF', 19 * U, 36 * U, A.pal.coat, { kind: 'robe' });
    if (arm === 'shadow_cloak') f.subPanel(ctx, A, 'haoriF', 17 * U, 25 * U, ASH, { kind: 'haori' });
    if (arm === 'vanguard_plate') f.subKusazuri(ctx, A, S, U, 'front', { rows: 4, len: 1.05, panels: 3, acc: subTone(SUB_ACC.vanguard_plate)[1] });
    if (arm === 'half_do') f.subKusazuri(ctx, A, S, U, 'front', { rows: 3, len: 1.2, panels: 1, acc: subTone(SUB_ACC.half_do)[1], iron: true, wide: 1.25 });
  } else if (layer === 'waist' && id) f.subBelt(ctx, A, S, U, id);
}

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
// Hisame's rain cape: a mino of oiled strands from the shoulders, its hem a long fringe
Fighter.prototype.subShroud = function (ctx, A, U) {
  const cl = this.cloths.find(c => c.kind === 'sub' && c.part === 'shroud');
  if (!cl || !cl.c.init) return;
  const floorY = this.y + 2 * A.s, n = coatEdges(cl, 20 * U, 40 * U, floorY), acc = subTone(SUB_ACC.mist_shroud);
  celFill(ctx, () => tornPanelPath(ctx, n, 8, 7 * U, 2, floorY), RAIN, A, { sd: 6 * U, hd: 0, rim: true, detail: (g) => {
    // overlapping strand rows: short dark strokes down the cape, a lit edge over each row
    for (let r = 1; r < n - 1; r += 1.4) {
      g.strokeStyle = RAIN[2]; g.lineWidth = 0.8 * A.s; g.beginPath();
      const a = _panelAt(n, r, -0.1), b = _panelAt(n, r, 1.1); g.moveTo(a[0], a[1] - 1.2 * A.s); g.lineTo(b[0], b[1] - 1.2 * A.s); g.stroke();
      g.strokeStyle = ANIME.outline; g.lineWidth = 0.9 * A.s; g.beginPath();
      for (let k = 0; k < 9; k++) { const t = (k + 0.5) / 9, p = _panelAt(n, r, t), q = _panelAt(n, r + 1.1, t + 0.02); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
      g.stroke();
    }
    _hemLine(g, n, 8 * U, acc[1], 0.9 * U);
  } });
};

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

/* ---- the back pieces ---- */
// Shiden's sashimono: a lacquered pole up the back and a dark violet banner with a silver lightning mark, stirring.
// Kept short and leaning back (ticket 13) so that in close camera shots, or when he leaps, it stays out of the HUD band.
Fighter.prototype.shidenBanner = function (ctx, A, S, U) {
  const P = _sP(S, U), Pt = _sPt(S, U), t = this.time || 0, acc = subTone(SUB_ACC.vanguard_plate);
  const wv = (k) => Math.sin(t * 3.2 + k * 2.2) * 2.2;
  celFill(ctx, () => animeCapsule(ctx, Pt(0.5, -12.5), Pt(2.45, -18.6), 1.5 * U, 1.2 * U, 0, 0.5), SUB_LACQ, A, { sd: 1 * U, seam: false });
  const top = 2.38, bot = 1.7, wt = -18.4, wb = -16.2;   // the pole's lean: its back offset at the banner's top and foot
  const pts = [P(top, wt), P(top + 0.02, wt - 9.4 + wv(0)), P(top + 0.04, wt - 18.4 + wv(1)), P(bot + 0.06, wb - 17.4 + wv(2)), P(bot + 0.03, wb - 8.4 + wv(1.5)), P(bot, wb)];
  celFill(ctx, () => _poly(ctx, pts), ['#0b0812', '#171124', '#2b2240'], A, { sd: 3 * U, hd: 0.6 * U, rim: true, detail: (g) => {
    _strokePts(g, [pts[0], pts[1], pts[2]], acc[2], 1.3 * U);
    _strokePts(g, [pts[3], pts[4], pts[5]], acc[1], 1 * U);
    const m = (u, w) => P(lerp(bot, top, u), w + lerp(wb, wt, u) + 14.6 + wv(1));
    g.fillStyle = ANIME.silver; g.beginPath(); _poly(g, [m(0.86, -22.5), m(0.86, -26.5), m(0.55, -24.4), m(0.55, -27.6), m(0.14, -24.2), m(0.42, -22.6), m(0.42, -20.6)]); g.fill();
  } });
  if (!A.flat) { const c = P(top + 0.06, wt + 0.6); ctx.fillStyle = ANIME.silver; ctx.beginPath(); ctx.arc(c[0], c[1], 1.6 * U, 0, TAU); ctx.fill(); }
};
// Hisame's message tube slung across the back
Fighter.prototype.hisameTube = function (ctx, A, S, U) {
  const Pt = _sPt(S, U), a = Pt(1.02, -10), b = Pt(0.18, -15.5), acc = subTone(SUB_ACC.rain_hood);
  celFill(ctx, () => animeCapsule(ctx, a, b, 2.9 * U, 2.9 * U, 0, 0.5), SUB_LACQ, A, { sd: 1.8 * U, hd: 0.7 * U, rim: true, detail: (g) => {
    for (const k of [0.1, 0.9]) _strokePts(g, [[lerp(a.x, b.x, k) - 3 * U * (b.y - a.y) / 40, lerp(a.y, b.y, k) + 3 * U * (b.x - a.x) / 40], [lerp(a.x, b.x, k) + 3 * U * (b.y - a.y) / 40, lerp(a.y, b.y, k) - 3 * U * (b.x - a.x) / 40]], acc[1], 1.6 * U);
  } });
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
// the shoulder plates per armour look (called from animeArm): Garan one huge iron sode on the near arm, Shiden a pair
// of stacked lacquered sode, Sayo a small guard on the near shoulder
function subSode(f, ctx, sh, el, A, U, far) {
  const k = f.armor;
  const spec = k === 'half_do' ? (far ? null : { size: 1.4, rows: 4, tone: SUB_IRON, bolt: true }) : k === 'vanguard_plate' ? { size: 0.98, rows: 4, tone: SUB_LACQ, stack: true }
    : k === 'operative_vest' ? (far ? null : { size: 0.62, rows: 2, tone: SUB_LACQ }) : null;
  if (!spec) return;
  const S = A.S, acc = subTone(SUB_ACC[k]), size = spec.size;
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  let dx = ax * 0.45 - S.ux * 0.55, dy = ay * 0.45 - S.uy * 0.55; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const plate = (off, len, wid, rows, tn, detail) => {
    const top = [sh.x - dx * off * U - S.nx * 1.5 * U, sh.y - dy * off * U - S.ny * 1.5 * U];
    const [a0, a1, b1, b0, Q] = _hang(top, dx, dy, len * U * size, wid * U * size, wid * 1.22 * U * size);
    celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 2 * U * size), tn, A, { sd: 3.4 * U, hd: far ? 0 : 1 * U, rim: true, detail: far ? null : (g) => {
      _lace(g, A, Q, rows, 5, tn, 1.1 * U, acc[1]);
      g.strokeStyle = tn[2]; g.lineWidth = 1.3 * U; g.beginPath(); g.moveTo(a0[0] - A.lx * 1.4 * U, a0[1] - A.ly * 1.4 * U + 1.4 * U); g.lineTo(a1[0] - A.lx * 1.4 * U, a1[1] - A.ly * 1.4 * U + 1.4 * U); g.stroke();
      if (detail) detail(g, Q);
    } });
  };
  const tn = far ? SUB_LACQ_FAR : spec.tone;
  if (spec.stack) { plate(6, 13, 15, 2, tn); plate(-4, 18, 17, 3, tn); return; }
  plate(5, 25, 17, spec.rows, tn, spec.bolt ? (g, Q) => _bolt(g, [Q(0.15, 0.1), Q(0.45, 0.35), Q(0.3, 0.5), Q(0.7, 0.78), Q(0.6, 0.95)], 0.9 * U, acc[2]) : null);
}

/* ---- the torso overlays (drawArmor) ---- */
function drawSubArmor(ctx, f, key) {
  const A = f._A;
  const S = A.S, U = A.U, P = _sP(S, U), acc = subTone(SUB_ACC[key]), skin = animeSkin(f);
  switch (key) {
    case 'robe': {
      // the kesa: a patchwork stole from the back shoulder across the chest to the front hip, gold-edged, a ring at the chest
      const a0 = P(1.04, -9), a1 = P(1.06, -2), b1 = P(0.04, 15), b0 = P(0.0, 7.5);
      celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 0.8 * U), KESA, A, { sd: 3 * U, hd: 0.8 * U, rim: true, detail: (g) => {
        const Q = (k, t) => [lerp(lerp(a0[0], a1[0], k), lerp(b0[0], b1[0], k), t), lerp(lerp(a0[1], a1[1], k), lerp(b0[1], b1[1], k), t)];
        g.strokeStyle = acc[0]; g.lineWidth = 1 * U; g.beginPath();
        for (const t of [0.2, 0.38, 0.56, 0.74, 0.9]) { const p = Q(-0.1, t), q = Q(1.1, t + 0.02); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
        const m0 = Q(0.5, 0), m1 = Q(0.5, 1); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]); g.stroke();
        _strokePts(g, [Q(0.08, 0), Q(0.08, 1)], acc[1], 1.5 * U); _strokePts(g, [Q(0.92, 0), Q(0.92, 1)], acc[1], 1.5 * U);
      } });
      if (!A.flat) {
        const c = P(0.74, 7.6);
        ctx.strokeStyle = acc[2]; ctx.lineWidth = 1.3 * U; ctx.beginPath(); ctx.arc(c[0], c[1], 2.4 * U, 0, TAU); ctx.stroke();
        ctx.strokeStyle = acc[0]; ctx.lineWidth = 0.6 * U; ctx.beginPath(); ctx.arc(c[0], c[1], 2.4 * U, 0.6, 2.2); ctx.stroke();
      }
      break;
    }
    case 'half_do': {
      // half a cuirass: plated over the chest, its back edge burnt ragged down the middle, a glowing lightning scar
      const front = [[0.02, 15], [0.3, 14], [0.56, 15.6], [0.8, 16.6], [0.92, 14.6], [0.99, 8.6]];
      const split = [[0.99, 1], [0.88, -2.4], [0.76, 1.6], [0.64, -3.6], [0.52, 0.4], [0.4, -4], [0.28, -0.6], [0.16, -3.4], [0.02, -1]];
      const pts = front.concat(split).map(([u, w]) => P(u, w));
      celFill(ctx, () => _poly(ctx, pts), SUB_IRON, A, { sd: 6 * U, hd: 1.2 * U, rim: true, detail: (g) => {
        const Q = (k, t) => P(lerp(0.1, 0.8, 1 - t), lerp(-3, 17, k));
        _lace(g, A, Q, 4, 7, SUB_IRON, 1.1 * U, acc[1]);
        _strokePts(g, [P(0.8, -4), P(0.8, 18)], ANIME.outline, 1.4 * U);
        _strokePts(g, [P(0.93, 2), P(0.9, 14)], SUB_IRON[2], 1.1 * U);
        // the scorched edge: ember flecks along the split
        if (!A.flat) { g.fillStyle = acc[1]; for (let i = 1; i < split.length - 1; i += 2) { const p = P(split[i][0], split[i][1] + 1.6); g.beginPath(); g.arc(p[0], p[1], 0.9 * U, 0, TAU); g.fill(); } }
        _bolt(g, [P(0.86, 12), P(0.7, 7), P(0.66, 10.4), P(0.48, 4.6), P(0.42, 7.4), P(0.26, 2)], 0.9 * U, acc[2]);
      } });
      break;
    }
    case 'vanguard_plate': {
      // a lieutenant's full dō laced in violet, a lightning mark on the chest plate, a small gorget; back kusazuri
      f.subKusazuri(ctx, A, S, U, 'back', { rows: 4, len: 1.05, panels: 3, acc: acc[1] });
      celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.full, U), SUB_LACQ, A, { sd: 7 * U, hd: 1.1 * U, rim: true, detail: (g) => {
        const Q = (k, t) => P(lerp(0.1, 0.78, 1 - t), lerp(-17, 17, k));
        _lace(g, A, Q, 4, 12, SUB_LACQ, 1.1 * U, acc[1]);
        _strokePts(g, [P(0.78, -18), P(0.78, 18)], ANIME.outline, 1.4 * U);
        _strokePts(g, [P(0.94, -6), P(0.9, 12)], SUB_LACQ[2], 1.2 * U);
        g.fillStyle = ANIME.silver; const m = (u, w) => P(u, w);
        g.beginPath(); _poly(g, [m(0.95, 9.4), m(0.95, 6.4), m(0.87, 8), m(0.87, 5.6), m(0.8, 7.4), m(0.88, 9.6), m(0.88, 11)]); g.fill();
      } });
      celFill(ctx, () => animeTorso(ctx, S, { front: [[0.9, 9], [1.0, 9.6], [1.06, 5]], back: [[1.06, -6], [1.0, -11], [0.9, -11]] }, U), SUB_LACQ, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => _strokePts(g, [P(0.97, -12), P(0.97, 11)], acc[1], 1.2 * U) });
      break;
    }
    case 'mist_shroud': {
      // the fringed rain capelet over the shoulders: layered strands, a blue cord at the throat
      const T = [[1.08, -6], [1.06, 7], [0.92, 13], [0.74, 15.4]], hem = [];
      const K = 9; for (let i = 0; i <= K; i++) { const k = i / K, u = lerp(0.74, 0.7, k) - (i % 2 ? 0.07 : 0), w = lerp(15.4, -17.4, k); hem.push([u, w]); }
      const pts = T.concat(hem, [[0.9, -17], [1.02, -13]]).map(([u, w]) => P(u, w));
      celFill(ctx, () => _poly(ctx, pts), RAIN, A, { sd: 4 * U, hd: 0.9 * U, rim: true, detail: (g) => {
        for (const u of [0.96, 0.86]) {
          _strokePts(g, [P(u + 0.01, -17), P(u + 0.01, 15)], RAIN[2], 0.8 * A.s);
          g.strokeStyle = ANIME.outline; g.lineWidth = 0.9 * A.s; g.beginPath();
          for (let w = -15; w < 14; w += 3) { const p = P(u, w), q = P(u - 0.1, w + 0.6); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
          g.stroke();
        }
        _strokePts(g, [P(1.02, 4), P(0.94, 9.6)], acc[1], 1.4 * U);
      } });
      break;
    }
    case 'shadow_cloak': {
      // the ash haori over the gi: open at the front, ash flecks, a violet himo tie; Tsugumi's satchel strap
      const prof = { front: [[-0.12, 13.4], [0.2, 12.6], [0.5, 13.6], [0.78, 14.8], [0.94, 13], [1.04, 7.4], [1.08, 4]], back: [[1.08, -5.6], [0.98, -14.2], [0.8, -15], [0.5, -12.8], [0.2, -12.8], [-0.12, -13.6]] };
      celFill(ctx, () => animeTorso(ctx, S, prof, U), ASH, A, { sd: 7 * U, hd: 1 * U, rim: true, detail: (g) => {
        g.fillStyle = skin.top === 'coat' ? A.pal.fab[1] : A.pal.fab[0];
        g.beginPath(); _poly(g, [P(1.06, 1.6), P(1.06, 13), P(-0.1, 14), P(0.1, 6.8), P(0.62, 4.6)]); g.fill();
        _strokePts(g, [P(1.06, 1.6), P(0.62, 4.6), P(0.1, 6.8)], ASH[2], 1.4 * U);
        _strokePts(g, [P(1.02, 2.8), P(0.62, 5.8), P(0.12, 7.8)], acc[1], 0.9 * U);
        _strokePts(g, [P(0.8, -2.5), P(0.5, -4), P(0.3, -3.2)], ASH[0], 1 * A.s);
        g.fillStyle = 'rgba(190,184,200,0.3)';
        for (let k = 0; k < 8; k++) { const p = P(0.15 + (k * 0.618 % 1) * 0.8, -12 + (k * 0.381 % 1) * 16); g.fillRect(p[0], p[1], 1.1 * A.s, 1.1 * A.s); }
        if (skin.sub === 'tsugumi') { _strokePts(g, [P(1.0, -9), P(0.12, 14)], '#050405', 3.4 * U); _strokePts(g, [P(1.0, -9), P(0.12, 14)], ASH[1], 1.2 * U); }
      } });
      if (!A.flat) {
        // the himo: a knot and two short tassels
        const k = P(0.66, 7.4), t1 = P(0.5, 8.6), t2 = P(0.52, 6.4);
        ctx.strokeStyle = acc[2]; ctx.lineWidth = 1.2 * U; ctx.beginPath(); ctx.moveTo(k[0], k[1]); ctx.lineTo(t1[0], t1[1]); ctx.moveTo(k[0], k[1]); ctx.lineTo(t2[0], t2[1]); ctx.stroke();
        ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(k[0], k[1], 1.5 * U, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'operative_vest': {
      // a close vest of lacquered strips, a high wrapped collar, a strap of pale message slips across the chest
      const prof = { front: [[0.06, 12.6], [0.36, 12], [0.62, 13.4], [0.82, 14.2], [0.94, 12], [1.0, 6]], back: [[1.0, -7], [0.94, -13.6], [0.76, -14.4], [0.5, -12.2], [0.26, -12], [0.06, -12.8]] };
      celFill(ctx, () => animeTorso(ctx, S, prof, U), SUB_LACQ, A, { sd: 6.5 * U, hd: 1 * U, rim: true, detail: (g) => {
        for (let i = 1; i <= 5; i++) {
          const u = 0.08 + i * 0.145;
          _strokePts(g, [P(u + 0.012, -16), P(u + 0.012, 16)], SUB_LACQ[2], 0.8 * A.s);
          _strokePts(g, [P(u, -16), P(u, 16)], ANIME.outline, 1.1 * A.s);
          g.strokeStyle = acc[1]; g.lineWidth = 0.9 * U; g.beginPath(); for (let w = -10; w <= 12; w += 5.5) { const p = P(u - 0.02, w), q = P(u - 0.05, w); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); } g.stroke();
        }
        _strokePts(g, [P(0.98, -9), P(0.2, 14)], '#050405', 4.2 * U);
        _strokePts(g, [P(0.98, -9), P(0.2, 14)], SUB_LACQ[1], 2.4 * U);
        for (let i = 1; i <= 3; i++) {
          const k = i / 4, c = P(lerp(0.98, 0.2, k), lerp(-9, 14, k));
          g.fillStyle = SUB_PAPER[1]; g.fillRect(c[0] - 1.5 * U, c[1] - 2 * U, 3 * U, 3.4 * U);
          g.fillStyle = SUB_PAPER[0]; g.fillRect(c[0] - 1.5 * U, c[1] + 0.6 * U, 3 * U, 0.8 * U);
        }
      } });
      // the high wrapped collar
      const n0 = _sPt(S, U)(0.94, 0), n1 = { x: lerp(f.sk.neck.x, f.sk.head.x, 0.3), y: lerp(f.sk.neck.y, f.sk.head.y, 0.3) };
      celFill(ctx, () => animeCapsule(ctx, n0, n1, 5.4 * U, 4.6 * U, 0.3 * U, 0.5), SUB_LACQ, A, { sd: 2 * U, hd: 0.6 * U, rim: true, detail: (g) => {
        g.strokeStyle = ANIME.outline; g.lineWidth = 1 * A.s; g.beginPath();
        for (const k of [0.3, 0.65]) { const x = lerp(n0.x, n1.x, k), y = lerp(n0.y, n1.y, k); g.moveTo(x - S.nx * 6 * U, y - S.ny * 6 * U); g.lineTo(x + S.nx * 6 * U - S.ux * U, y + S.ny * 6 * U - S.uy * U); }
        g.stroke();
      } });
      break;
    }
  }
}
// Utsushi wears scraps of the operative's vest it copied: torn strips laced violet over its rags
function drawUtsushiScraps(ctx, f) {
  const A = f._A; if (!A || !A.S || A.flat) return;
  const S = A.S, U = A.U, P = _sP(S, U), acc = A.pal.accHi;
  for (const [u, w0, w1, jag] of [[0.58, -4, 12.4, 1], [0.44, 1, 12, 0], [0.72, -9, 8, 1]]) {
    const pts = [P(u + 0.06, w0), P(u + 0.06, w1), P(u, w1 + 0.4), P(u - 0.005, w0 + (jag ? 3 : 1)), P(u + 0.03, w0 + 1.4), P(u, w0 - 0.6)];
    celFill(ctx, () => _poly(ctx, pts), HOLLOW_MASK_FAR, A, { sd: 1.4 * U, hd: 0.4 * U, detail: (g) => {
      g.strokeStyle = acc; g.lineWidth = 0.8 * U; g.beginPath(); for (let w = w0 + 3; w < w1; w += 4.4) { const p = P(u + 0.05, w), q = P(u + 0.015, w); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); } g.stroke();
    } });
  }
}

/* ---- hands: Garan's iron tekko ---- */
Fighter.prototype.subFist = function (ctx, el, ha, A, U, far) {
  const dx = ha.x - el.x, dy = ha.y - el.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
  const acc = subTone(this.isPlayer ? '#ff6a52' : (animeSkin(this).acc || '#ff6a52')), tn = far ? [SUB_IRON[0], SUB_IRON[0], SUB_IRON[1]] : SUB_IRON;
  const r = 4.4 * U, c = { x: ha.x + ux * r * 0.3, y: ha.y + uy * r * 0.3 };
  // the cuff: a flared iron ring over the wrist
  celFill(ctx, () => animeCapsule(ctx, { x: ha.x - ux * 7 * U, y: ha.y - uy * 7 * U }, { x: ha.x - ux * 1.5 * U, y: ha.y - uy * 1.5 * U }, 4.2 * U, 5 * U, 0, 0.5), tn, A, { sd: 1.6 * U, hd: far ? 0 : 0.6 * U });
  celFill(ctx, () => { ctx.moveTo(c.x + ux * r * 1.2, c.y + uy * r * 1.2); ctx.ellipse(c.x, c.y, r * 1.2, r * 1.02, Math.atan2(uy, ux), 0, TAU); }, tn, A, { sd: 2 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: far ? null : (g) => {
    // the knuckle plate across the front of the fist, three studs, a crackle of the storm still in it
    const k0 = [c.x + ux * r * 0.55 + nx * r * 0.95, c.y + uy * r * 0.55 + ny * r * 0.95], k1 = [c.x + ux * r * 0.55 - nx * r * 0.95, c.y + uy * r * 0.55 - ny * r * 0.95];
    _strokePts(g, [k0, k1], ANIME.outline, 1.4 * U);
    _strokePts(g, [[k0[0] - ux * 1.2 * U, k0[1] - uy * 1.2 * U], [k1[0] - ux * 1.2 * U, k1[1] - uy * 1.2 * U]], SUB_IRON[2], 0.9 * U);
    g.fillStyle = ANIME.silver;
    for (const t of [-0.55, 0, 0.55]) { g.beginPath(); g.arc(c.x + ux * r * 0.85 + nx * r * t, c.y + uy * r * 0.85 + ny * r * t, 0.8 * U, 0, TAU); g.fill(); }
    if (!A.flat) _bolt(g, [[c.x - ux * r * 0.6 + nx * r * 0.5, c.y - uy * r * 0.6 + ny * r * 0.5], [c.x - nx * r * 0.1, c.y - ny * r * 0.1], [c.x + ux * r * 0.2 + nx * r * 0.3, c.y + uy * r * 0.2 + ny * r * 0.3], [c.x + ux * r * 0.45 - nx * r * 0.5, c.y + uy * r * 0.45 - ny * r * 0.5]], 0.55 * U, acc[2]);
  } });
};

/* ---- heads (head frame: +x the face side, r the head radius) ---- */
function drawSubHead(ctx, key, f, r, ink, flat) {
  const A = f._A && f._A.pal ? f._A : animeState(f, ink, flat, {});
  const sv = _headLight(A, f), t = f.time || 0, acc = subTone(SUB_ACC[key] || '#b02a31');
  const fill = (pts, tone, o) => celFill(ctx, () => orderShape(ctx, r, pts), tone, A, o);
  switch (key) {
    case 'sumi_eboshi': {
      // a tall black lacquered court cap leaning back, its peak folded over; a pale dry-brush stroke of ink across it,
      // a censor's slip with black bars hanging from its back edge, gold chin cords
      fill([[-0.62, -0.5], [-1.22, -0.2], [-1.36, 0.82, 1], [-1.0, 0.86, 1], [-0.86, -0.1]], SUB_PAPER, { sd: r * 0.08, detail: (g) => {
        g.fillStyle = '#060505'; g.beginPath(); orderShape(g, r, [[-1.18, 0.12, 1], [-0.9, 0.08, 1], [-0.9, 0.24, 1], [-1.2, 0.28, 1]]); g.fill();
        g.beginPath(); orderShape(g, r, [[-1.28, 0.5, 1], [-0.94, 0.46, 1], [-0.95, 0.58, 1], [-1.3, 0.62, 1]]); g.fill();
      } });
      fill([[0.92, -0.3, 1], [0.8, -0.95], [0.52, -1.8], [0.2, -2.5], [-0.24, -2.84, 1], [-0.66, -2.62], [-1.0, -1.7], [-1.06, -0.72], [-0.98, -0.08, 1], [-0.4, -0.38], [0.4, -0.48]], SUB_LACQ, { sd: r * 0.32, hd: r * 0.08, rim: true, detail: (g) => {
        // folds of the stiff gauze and the pale ink stroke
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath();
        g.moveTo(r * 0.2, -r * 0.5); g.quadraticCurveTo(r * 0.1, -r * 1.6, -r * 0.18, -r * 2.6);
        g.moveTo(-r * 0.5, -r * 0.42); g.quadraticCurveTo(-r * 0.62, -r * 1.4, -r * 0.6, -r * 2.4); g.stroke();
        g.fillStyle = SUB_PAPER[1];
        g.beginPath(); g.moveTo(-r * 0.86, -r * 1.2); g.quadraticCurveTo(-r * 0.2, -r * 1.72, r * 0.62, -r * 1.42); g.lineTo(r * 0.5, -r * 1.3); g.quadraticCurveTo(-r * 0.15, -r * 1.48, -r * 0.84, -r * 1.06); g.closePath(); g.fill();
        g.fillStyle = SUB_LACQ[1];
        for (const [x, y] of [[-0.3, -1.36], [0.1, -1.44], [0.36, -1.42]]) { g.fillRect(r * x, r * y, r * 0.12, r * 0.05); }
        g.fillStyle = SUB_PAPER[0]; g.beginPath(); g.arc(r * 0.76, -r * 1.56, r * 0.05, 0, TAU); g.arc(r * 0.84, -r * 1.3, r * 0.035, 0, TAU); g.fill();
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.07; g.beginPath(); g.moveTo(-r * 0.98, -r * 0.16); g.quadraticCurveTo(0, -r * 0.5, r * 0.9, -r * 0.36); g.stroke();
      } });
      fill([[-0.24, -2.82], [-1.02, -3.02, 1], [-0.66, -2.44]], SUB_LACQ, { sd: r * 0.1, rim: true });
      if (!A.flat) { ctx.strokeStyle = acc[1]; ctx.lineWidth = Math.max(1, r * 0.06); ctx.beginPath(); ctx.moveTo(-r * 0.8, -r * 0.12); ctx.quadraticCurveTo(-r * 0.3, r * 1.12, r * 0.5, r * 0.92); ctx.stroke(); }
      break;
    }
    case 'oni': {
      // Garan: a wild mane bound under a horned iron brow band, a snarling red oni menpō over the jaw
      fill([[0.2, -0.95], [-0.3, -1.3], [-0.86, -1.6, 1], [-0.76, -1.04], [-1.5, -1.12, 1], [-1.06, -0.56], [-1.78, -0.36, 1], [-1.06, -0.04], [-1.6, 0.46, 1], [-0.92, 0.38], [-1.16, 1.0, 1], [-0.6, 0.72], [-0.4, 0.0], [-0.1, -0.6]], A.pal.hair, { sd: r * 0.3, hd: r * 0.06, rim: true });
      fill([[-0.35, -0.85], [-0.95, -1.3], [-1.08, -1.94], [-0.74, -2.6, 1], [-0.76, -1.96], [-0.56, -1.46], [-0.1, -1.04]], SUB_LACQ_FAR, { sd: r * 0.1, rim: true });
      fill([[-1.0, -0.64, 1], [-0.4, -1.0], [0.42, -1.02], [1.0, -0.6], [1.04, -0.28, 1], [0.32, -0.46], [-0.4, -0.4], [-1.0, -0.3, 1]], SUB_IRON, { sd: r * 0.12, hd: r * 0.06, rim: true, detail: (g) => {
        g.fillStyle = ANIME.silver; for (const x of [-0.6, 0.0, 0.6]) { g.beginPath(); g.arc(r * x, -r * (0.68 + (x === 0 ? 0.08 : 0)), r * 0.05, 0, TAU); g.fill(); }
        if (!A.flat) _bolt(g, [[r * 0.75, -r * 0.82], [r * 0.5, -r * 0.6], [r * 0.62, -r * 0.52], [r * 0.34, -r * 0.36]], r * 0.04, acc[2]);
      } });
      fill([[0.05, -0.85], [0.6, -1.06], [1.02, -1.5], [1.08, -2.5, 1], [0.84, -1.72], [0.56, -1.38], [0.0, -1.16]], ORDER_HORN, { sd: r * 0.16, hd: r * 0.05, rim: true, detail: (g) => {
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(r * 0.44, -r * 0.88); g.lineTo(r * 0.3, -r * 1.24); g.stroke();
      } });
      fill([[-0.12, 0.2], [0.55, 0.12], [1.02, 0.22], [1.22, 0.42, 1], [1.06, 0.62], [0.96, 0.92], [0.56, 1.12], [0.14, 1.02], [-0.16, 0.62]], SUB_RED_LACQ, { sd: r * 0.18, hd: r * 0.06, rim: true, detail: (g) => {
        // the snarl: a dark mouth, bone fangs, a bright lip line, wrinkles on the cheek
        g.fillStyle = '#060303'; g.beginPath(); orderShape(g, r, [[0.42, 0.5, 1], [1.12, 0.46, 1], [1.0, 0.76], [0.5, 0.78]]); g.fill();
        g.fillStyle = SUB_PAPER[1];
        for (const [x, d] of [[0.56, 1], [0.78, 1], [0.98, 1]]) { g.beginPath(); g.moveTo(r * (x - 0.07), r * 0.49); g.lineTo(r * (x + 0.07), r * 0.48); g.lineTo(r * x, r * (0.49 + 0.17 * d)); g.closePath(); g.fill(); }
        for (const x of [0.66, 0.88]) { g.beginPath(); g.moveTo(r * (x - 0.06), r * 0.77); g.lineTo(r * (x + 0.06), r * 0.77); g.lineTo(r * x, r * 0.64); g.closePath(); g.fill(); }
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 0.38, r * 0.46); g.quadraticCurveTo(r * 0.8, r * 0.36, r * 1.16, r * 0.44); g.stroke();
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.045; g.beginPath(); g.moveTo(r * 0.2, r * 0.36); g.quadraticCurveTo(r * 0.3, r * 0.6, r * 0.22, r * 0.84); g.moveTo(r * 0.5, r * 0.26); g.quadraticCurveTo(r * 0.7, r * 0.3, r * 0.9, r * 0.28); g.stroke();
      } });
      break;
    }
    case 'rain_hood': {
      // a close oiled hood with a face cloth up to the eyes and a stiff visor jutting over them, a blue cord round it
      fill([[0.75, -0.72], [0.2, -1.12], [-0.56, -1.1], [-1.08, -0.56], [-1.12, 0.36], [-0.86, 1.16], [-0.2, 1.32], [0.3, 1.12], [0.04, 0.56], [-0.18, -0.1], [0.12, -0.46]], RAIN, { sd: r * 0.3, hd: r * 0.06, rim: true, detail: (g) => {
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.3, -r * 1.0); g.quadraticCurveTo(-r * 0.86, -r * 0.3, -r * 0.6, r * 0.9); g.stroke();
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.07; g.beginPath(); g.moveTo(r * 0.7, -r * 0.62); g.quadraticCurveTo(-r * 0.3, -r * 0.82, -r * 1.06, -r * 0.3); g.stroke();
      } });
      fill([[0.0, 0.3], [0.86, 0.26], [1.04, 0.42, 1], [0.92, 0.8], [0.5, 1.06], [0.1, 0.96], [-0.1, 0.56]], RAIN, { sd: r * 0.16, hd: r * 0.05, detail: (g) => {
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.045; g.beginPath(); g.moveTo(r * 0.1, r * 0.56); g.quadraticCurveTo(r * 0.5, r * 0.5, r * 0.94, r * 0.5); g.moveTo(r * 0.18, r * 0.8); g.quadraticCurveTo(r * 0.5, r * 0.74, r * 0.84, r * 0.76); g.stroke();
      } });
      fill([[-0.1, -0.64], [0.7, -0.68], [1.78, -0.5, 1], [1.72, -0.34, 1], [0.76, -0.32], [0.0, -0.38]], SUB_LACQ, { sd: r * 0.08, hd: r * 0.04, rim: true, detail: (g) => {
        g.strokeStyle = acc[2]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(r * 0.1, -r * 0.4); g.lineTo(r * 0.76, -r * 0.36); g.lineTo(r * 1.7, -r * 0.37); g.stroke();
      } });
      if (!A.flat) {
        // rain beading off the visor's tip
        ctx.fillStyle = 'rgba(159,212,255,0.75)';
        for (let i = 0; i < 2; i++) { const k = (t * 1.3 + i * 0.5) % 1; ctx.beginPath(); ctx.ellipse(r * (1.66 - i * 0.4), -r * 0.3 + k * r * 0.9, r * 0.04, r * 0.08, 0, 0, TAU); ctx.fill(); }
      }
      break;
    }
    case 'sentinel_helm': {
      // a hoshi kabuto: a star-riveted bowl, a flared shikoro laced violet, turned-back wings, a forked lightning
      // maedate in silver, an iron half menpō
      const SH = [[0.12, -0.56], [-0.86, -0.82], [-1.5, 0.0], [-1.8, 0.7, 1], [-0.9, 0.9], [-0.42, 0.46], [-0.2, -0.2]];
      fill(SH, SUB_LACQ, { sd: r * 0.26, hd: r * 0.05, rim: true, detail: (g) => {
        for (let i = 1; i <= 3; i++) {
          const k = i / 4;
          g.strokeStyle = acc[1]; g.lineWidth = r * 0.07; g.setLineDash([r * 0.06, r * 0.07]);
          g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.3 + k * 0.95)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.52 + k), r * (-1.2 - k * 0.6), r * (-0.4 + k * 1.25)); g.stroke();
          g.setLineDash([]);
          g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.06;
          g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.4 + k * 0.95)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.62 + k), r * (-1.2 - k * 0.6), r * (-0.5 + k * 1.25)); g.stroke();
        }
      } });
      _halfMask(ctx, A, r);
      fill(KABUTO_BOWL, SUB_LACQ, { sd: r * 0.3, hd: r * 0.08, rim: true, detail: (g) => {
        g.fillStyle = ANIME.silver;
        for (const [x, y0] of [[-0.62, -0.98], [-0.2, -1.18], [0.24, -1.16], [0.62, -0.96]]) for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(r * x * (1 + j * 0.12), r * (y0 + j * 0.2), r * 0.04, 0, TAU); g.fill(); }
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(-r * 1.1, -r * 0.47); g.quadraticCurveTo(0, -r * 0.6, r * 1.05, -r * 0.43); g.stroke();
      } });
      fill([[0.42, -0.5], [1.32, -0.44, 1], [1.24, -0.3, 1], [0.4, -0.34]], SUB_LACQ, { sd: r * 0.06 });
      fill([[0.34, -0.5], [0.24, 0.04, 1], [-0.22, -0.04], [-0.1, -0.52]], [acc[0], acc[0], acc[1]], { sd: r * 0.1, hd: r * 0.04 });
      fill([[0.52, -1.02, 1], [0.86, -1.6, 1], [0.66, -1.62, 1], [1.12, -2.36, 1], [0.92, -1.84, 1], [1.08, -1.82, 1], [0.7, -1.2, 1], [0.66, -1.04, 1]], ['#4a4d53', ANIME.silver, ANIME.silverHi], { sd: r * 0.08, hd: r * 0.03, rim: true });
      fill([[0.4, -1.06, 1], [0.12, -1.66, 1], [0.3, -1.66, 1], [-0.06, -2.2, 1], [0.44, -1.6, 1], [0.28, -1.58, 1], [0.58, -1.08, 1]], ['#3c3f45', '#6f737a', '#aeb2b8'], { sd: r * 0.06 });
      break;
    }
    case 'courier_hat': {
      // a short bob of hair under a wide, flat courier's hat tilted forward; three glass vials of stored memory hang
      // from its brim, one swinging; a pale chin cord
      fill([[-0.2, -0.6], [-1.0, -0.54], [-1.16, 0.3], [-0.84, 0.9, 1], [-0.62, 0.42], [-0.4, 0.84, 1], [-0.3, 0.1]], A.pal.hair, { sd: r * 0.2, hd: r * 0.05, rim: true });
      if (!A.flat) { ctx.strokeStyle = SUB_PAPER[0]; ctx.lineWidth = Math.max(1, r * 0.05); ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.5); ctx.quadraticCurveTo(-r * 0.1, r * 1.16, r * 0.76, r * 0.6); ctx.stroke(); }
      fill([[-0.08, -0.62], [-0.84, -0.92], [-0.1, -1.28], [0.66, -0.94]], [ASH[0], ASH[1], ASH[2]], { sd: r * 0.12, hd: r * 0.04 });
      fill([[-2.12, -0.52, 1], [-0.8, -0.96], [0.04, -1.3], [0.9, -0.96], [2.32, -0.42, 1], [2.24, -0.24, 1], [0.1, -0.56], [-2.04, -0.34, 1]], ['#0c0b0e', '#19171d', '#302c38'], { sd: r * 0.16, hd: r * 0.05, rim: true, detail: (g) => {
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.04; g.beginPath();
        for (const x of [-1.5, -0.9, -0.35, 0.45, 1.0, 1.6]) { g.moveTo(r * 0.04, -r * 1.26); g.lineTo(r * x, -r * (0.48 + Math.abs(x) * 0.02)); }
        g.stroke();
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.07; g.beginPath(); g.moveTo(-r * 2.04, -r * 0.4); g.quadraticCurveTo(0, -r * 0.66, r * 2.24, -r * 0.3); g.stroke();
        g.strokeStyle = acc[0]; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(-r * 0.64, -r * 0.9); g.quadraticCurveTo(0, -r * 1.06, r * 0.62, -r * 0.88); g.stroke();
      } });
      for (let i = 0; i < 3; i++) {
        const vx = r * [-1.7, -0.95, 1.55][i], sw = i === 1 ? Math.sin(t * 3) * r * 0.12 : Math.sin(t * 2 + i) * r * 0.03, vy = -r * 0.44 + r * 0.05 * i, bx = vx + sw, by = vy + r * 0.42;
        if (!A.flat) { ctx.strokeStyle = SUB_PAPER[0]; ctx.lineWidth = Math.max(0.8, r * 0.03); ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(bx, by); ctx.stroke(); }
        celFill(ctx, () => { if (ctx.roundRect) ctx.roundRect(bx - r * 0.11, by, r * 0.22, r * 0.36, r * 0.08); else ctx.rect(bx - r * 0.11, by, r * 0.22, r * 0.36); }, SUB_GLASS, A, { sd: r * 0.05, hd: r * 0.03, detail: (g) => {
          g.globalCompositeOperation = 'lighter'; g.fillStyle = i === 1 ? 'rgba(201,180,255,0.85)' : 'rgba(150,120,230,0.6)'; g.fillRect(bx - r * 0.11, by + r * 0.14, r * 0.22, r * 0.22); g.globalCompositeOperation = 'source-over';
          g.fillStyle = SUB_WOOD[2]; g.fillRect(bx - r * 0.08, by, r * 0.16, r * 0.07);
        } });
      }
      break;
    }
    case 'veil': {
      // a close dark hood with a thin silver brow band, a hairpin crossing its back, and a mist face cloth to the eyes
      fill([[0.6, -0.84], [0.0, -1.12], [-0.62, -1.06], [-1.06, -0.5], [-1.1, 0.4], [-0.82, 1.1], [-0.2, 1.24], [0.26, 1.06], [0.02, 0.56], [-0.2, -0.06], [0.1, -0.54]], ['#08070b', '#121118', '#26232f'], { sd: r * 0.3, hd: r * 0.06, rim: true, detail: (g) => {
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.4, -r * 1.0); g.quadraticCurveTo(-r * 0.9, -r * 0.2, -r * 0.62, r * 0.9); g.stroke();
      } });
      fill([[0.0, 0.28], [0.88, 0.24], [1.08, 0.46, 1], [0.94, 0.86], [0.52, 1.08], [0.08, 0.96], [-0.12, 0.54]], ['#0b0a10', '#17151e', '#2c2936'], { sd: r * 0.14, hd: r * 0.05, detail: (g) => {
        // mist (kasumi) bands painted across the cloth
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.beginPath();
        g.moveTo(r * 0.1, r * 0.6); g.quadraticCurveTo(r * 0.4, r * 0.5, r * 0.62, r * 0.6); g.lineTo(r * 0.98, r * 0.58);
        g.moveTo(r * 0.24, r * 0.84); g.quadraticCurveTo(r * 0.5, r * 0.76, r * 0.82, r * 0.82); g.stroke();
      } });
      if (!A.flat) {
        ctx.strokeStyle = ANIME.silver; ctx.lineWidth = Math.max(1, r * 0.07); ctx.beginPath(); ctx.moveTo(r * 0.88, -r * 0.38); ctx.quadraticCurveTo(0, -r * 0.62, -r * 1.06, -r * 0.3); ctx.stroke();
        ctx.lineWidth = Math.max(1, r * 0.06); ctx.beginPath(); ctx.moveTo(-r * 0.2, -r * 1.02); ctx.lineTo(-r * 1.2, -r * 0.2); ctx.stroke();
        ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(-r * 0.22, -r * 1.02, r * 0.09, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'borrowed_mask': {
      // a torn hood of black shards behind; a borrowed white mask that does not fit (set forward, tilted), cracked,
      // its painted face slipping between two expressions; the eyes glow through its holes
      fill([[0.5, -0.9], [-0.1, -1.14], [-0.46, -1.36, 1], [-0.62, -1.08], [-1.24, -1.0, 1], [-1.02, -0.6], [-1.5, -0.2, 1], [-1.08, 0.06], [-1.36, 0.66, 1], [-0.9, 0.5], [-0.72, 1.16, 1], [-0.36, 0.62], [-0.1, 0.0], [0.1, -0.6]], f.hollow ? HOLLOW_MASK_FAR : SUB_LACQ, { sd: r * 0.22, hd: r * 0.05, rim: true });
      const alt = ((t * 1.3) | 0) % 3 === 2;
      ctx.save(); ctx.translate(r * 0.44, r * 0.06); ctx.rotate(-0.12);
      celFill(ctx, () => ctx.ellipse(0, 0, r * 0.72, r * 1.02, 0, 0, TAU), ['#8f87a8', '#ddd6ee', '#f6f3fc'], A, { sd: r * 0.2, hd: r * 0.06, rim: true, detail: (g) => {
        g.strokeStyle = '#7a5cc9'; g.lineWidth = r * 0.08; g.lineCap = 'round';
        g.beginPath(); g.moveTo(-r * 0.32, -r * 0.3); g.lineTo(-r * 0.06, alt ? -r * 0.44 : -r * 0.24); g.moveTo(r * 0.2, alt ? -r * 0.44 : -r * 0.24); g.lineTo(r * 0.46, -r * 0.3); g.stroke();
        g.beginPath(); g.moveTo(-r * 0.22, r * 0.5); g.quadraticCurveTo(r * 0.06, alt ? r * 0.3 : r * 0.74, r * 0.36, r * 0.5); g.stroke();
      } });
      ctx.restore();
      if (!A.flat) {
        // the eye holes at the wearer's eyes, and the crack from the brow glowing violet
        _eyeHoles(ctx, r);
        ctx.save(); ctx.globalAlpha *= 0.9;
        hollowCrack(ctx, A, r, [[0.28, -0.96], [0.36, -0.6], [0.24, -0.38], [0.34, -0.12]], r * 0.03);
        ctx.restore();
      }
      break;
    }
  }
  A.lx = sv[0]; A.ly = sv[1];
}

/* ---- weapons (ink mode; the flat and outline passes keep the shared shape from drawWeaponShape) ---- */
const SUB_WEAPON_ART = {
  // Kuroe's temple staff: dark wood, gold bands, an iron shakujō ring head with loose rings, an ink-brush tassel
  temple_staff(ctx, sh, L, s, f) {
    const acc = subTone('#c9a45c');
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 6.2 * s; ctx.beginPath(); ctx.moveTo(-L * 0.5, 0); ctx.lineTo(L * 0.44, 0); ctx.stroke();
    ctx.strokeStyle = SUB_WOOD[1]; ctx.lineWidth = 4.2 * s; ctx.beginPath(); ctx.moveTo(-L * 0.5, 0); ctx.lineTo(L * 0.44, 0); ctx.stroke();
    ctx.strokeStyle = SUB_WOOD[2]; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(-L * 0.48, -1.2 * s); ctx.lineTo(L * 0.42, -1.2 * s); ctx.stroke();
    ctx.lineCap = 'butt'; ctx.strokeStyle = acc[1]; ctx.lineWidth = 2.2 * s;
    for (const x of [-0.42, -0.36, 0.34, 0.4]) { ctx.beginPath(); ctx.moveTo(L * x, -3 * s); ctx.lineTo(L * x, 3 * s); ctx.stroke(); }
    ctx.lineCap = 'round';
    // the ring head
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 3.6 * s; ctx.beginPath(); ctx.ellipse(L * 0.5, 0, 8 * s, 6.4 * s, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = SUB_IRON[2]; ctx.lineWidth = 1.8 * s; ctx.beginPath(); ctx.ellipse(L * 0.5, 0, 8 * s, 6.4 * s, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = ANIME.silver; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.ellipse(L * 0.5, 0, 8 * s, 6.4 * s, 0, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();
    ctx.lineWidth = 1.2 * s; ctx.strokeStyle = SUB_IRON[2];
    const sw = Math.sin((f ? f.time : 0) * 6) * 0.4;
    for (const a of [-1.2 + sw, 1.2 - sw]) { ctx.beginPath(); ctx.arc(L * 0.5 + Math.cos(a) * 8 * s, Math.sin(a) * 6.4 * s, 2.4 * s, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = acc[1]; ctx.beginPath(); ctx.arc(L * 0.5 + 8 * s, 0, 1.6 * s, 0, TAU); ctx.fill();
    // the butt: a black brush tuft
    ctx.fillStyle = '#050404'; ctx.beginPath(); ctx.moveTo(-L * 0.49, -2.4 * s); ctx.quadraticCurveTo(-L * 0.55, -3.6 * s, -L * 0.6, 0); ctx.quadraticCurveTo(-L * 0.55, 3.6 * s, -L * 0.49, 2.4 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = acc[1]; ctx.fillRect(-L * 0.5, -2.6 * s, 2 * s, 5.2 * s);
    return true;
  },
  // Hisame's war fans: lacquered guard sticks, rain-dark paper in cel-shaded pleats, pale rain streaks, a blue edge
  mist_fans(ctx, sh, L, s) {
    const acc = subTone('#7fb8ff'), a0 = -0.42, a1 = 0.18, n = 7;
    for (let i = 0; i < n; i++) {
      const p = a0 + (a1 - a0) * i / n, q = a0 + (a1 - a0) * (i + 1) / n;
      ctx.beginPath(); ctx.moveTo(Math.cos(p) * L * 0.3, Math.sin(p) * L * 0.3); ctx.arc(0, 0, L, p, q); ctx.lineTo(Math.cos(q) * L * 0.3, Math.sin(q) * L * 0.3); ctx.arc(0, 0, L * 0.3, q, p, true); ctx.closePath();
      ctx.fillStyle = i % 2 ? '#1a2532' : '#253447'; ctx.fill();
    }
    ctx.strokeStyle = 'rgba(159,212,255,0.4)'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
    for (const [r0, r1, a] of [[0.5, 0.7, -0.3], [0.62, 0.86, -0.12], [0.45, 0.62, 0.05], [0.72, 0.94, -0.36], [0.55, 0.74, 0.12]]) { ctx.moveTo(Math.cos(a) * L * r0, Math.sin(a) * L * r0); ctx.lineTo(Math.cos(a + 0.05) * L * r1, Math.sin(a + 0.05) * L * r1); }
    ctx.stroke();
    ctx.strokeStyle = acc[2]; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.arc(0, 0, L - 0.7 * s, a0, a1); ctx.stroke();
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 3.4 * s; ctx.lineCap = 'round';
    for (const a of [a0, a1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.stroke(); }
    ctx.strokeStyle = SUB_LACQ[2]; ctx.lineWidth = 1.2 * s;
    for (const a of [a0, a1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.stroke(); }
    ctx.fillStyle = ANIME.silver; ctx.beginPath(); ctx.arc(0, 0, 2 * s, 0, TAU); ctx.fill();
    return true;
  },
  // Tsugumi's kunai: a leaf blade with a ridge, a violet-wrapped grip and a ring pommel
  courier_kunai(ctx, sh, L, s) {
    const acc = subTone('#a98ad8');
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 5.2 * s; ctx.beginPath(); ctx.moveTo(-L * 0.3, 0); ctx.lineTo(0, 0); ctx.stroke();
    ctx.strokeStyle = acc[0]; ctx.lineWidth = 3.4 * s; ctx.beginPath(); ctx.moveTo(-L * 0.3, 0); ctx.lineTo(0, 0); ctx.stroke();
    ctx.strokeStyle = acc[1]; ctx.lineWidth = 0.9 * s; ctx.beginPath(); for (let i = 1; i < 6; i++) { const x = -L * 0.3 * i / 6; ctx.moveTo(x - 1.2 * s, -1.7 * s); ctx.lineTo(x + 1.2 * s, 1.7 * s); } ctx.stroke();
    ctx.strokeStyle = SUB_IRON[2]; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.arc(-L * 0.3 - 3.2 * s, 0, 3 * s, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -1.8 * s); ctx.quadraticCurveTo(L * 0.3, -4.6 * s, L, 0); ctx.quadraticCurveTo(L * 0.3, 4.6 * s, 0, 1.8 * s); ctx.closePath();
    ctx.fillStyle = ANIME.silver; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.3, 4.6 * s, L, 0); ctx.quadraticCurveTo(L * 0.3, 1 * s, 0, 0); ctx.closePath(); ctx.fillStyle = '#6c7076'; ctx.fill();
    ctx.strokeStyle = ANIME.silverHi; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(L * 0.1, -2.6 * s); ctx.quadraticCurveTo(L * 0.4, -3.6 * s, L * 0.94, -0.3 * s); ctx.stroke();
    return true;
  },
  // Shiden's yari: a dark lacquered shaft banded violet, a leaf head with a ridge, a violet tassel sheath
  vanguard_yari(ctx, sh, L, s, f) {
    const acc = subTone('#b07cff');
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(-L * 0.42, 0); ctx.lineTo(L * 0.84, 0); ctx.stroke();
    ctx.strokeStyle = SUB_LACQ[1]; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(-L * 0.42, 0); ctx.lineTo(L * 0.84, 0); ctx.stroke();
    ctx.strokeStyle = SUB_LACQ[2]; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(-L * 0.4, -1.1 * s); ctx.lineTo(L * 0.82, -1.1 * s); ctx.stroke();
    ctx.lineCap = 'butt'; ctx.strokeStyle = acc[1]; ctx.lineWidth = 2 * s;
    for (const x of [-0.3, 0.2, 0.5]) { ctx.beginPath(); ctx.moveTo(L * x, -2.6 * s); ctx.lineTo(L * x, 2.6 * s); ctx.stroke(); }
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(L * 0.82, -4.6 * s); ctx.quadraticCurveTo(L * 0.92, -8.6 * s, L, 0); ctx.quadraticCurveTo(L * 0.92, 8.6 * s, L * 0.82, 4.6 * s); ctx.closePath();
    ctx.fillStyle = ANIME.silver; ctx.fill();
    ctx.beginPath(); ctx.moveTo(L * 0.82, 0); ctx.lineTo(L, 0); ctx.quadraticCurveTo(L * 0.92, 8.6 * s, L * 0.82, 4.6 * s); ctx.closePath(); ctx.fillStyle = '#6c7076'; ctx.fill();
    ctx.strokeStyle = ANIME.silverHi; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(L * 0.83, 0); ctx.lineTo(L * 0.99, 0); ctx.stroke();
    const sw = f ? Math.sin(f.time * 9) * 4 : 0;
    ctx.strokeStyle = acc[1]; ctx.lineWidth = 2 * s;
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(L * 0.8, i * 2); ctx.quadraticCurveTo(L * 0.76, 10 * s, L * 0.74 + sw, (16 + i * 3) * s); ctx.stroke(); }
    ctx.fillStyle = SUB_IRON[2]; ctx.fillRect(L * 0.78, -3.6 * s, 3.4 * s, 7.2 * s);
    return true;
  }
};
