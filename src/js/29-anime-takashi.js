/* KAGE — Takashi, the Master's Flow, as an anime master swordsman (anime redesign, ticket 10), from his key art
   (boss_takashi.webp, face_takashi.webp). A main boss: Kage's old master, a calm elderly silhouette, broad and upright,
   the robes doing the talking:
     head      a wide straw kasa (about 5.6 head radii across) tipped forward over the brow, dark straw with gold ribs and a
               gold rim, a long red ribbon from the back of the hat (cloth 'tribbon', two strands). Under it the black face
               with WHITE eyes (the rule), white hair swept back in spiky locks behind the face, a white moustache and a
               long pointed white beard (the beard covers where a mouth would be, so there is still no mouth)
     robes     layered dark plum-black robes: a robe torso with a crossed collar of two gold-edged lapels, a capelet over
               the shoulders edged gold and closed at the chest by a round gold clasp (the Tachibana ring round a dot),
               gold cords swagged from the clasp and a gold tassel under it; a capelet flap over the near shoulder; wide
               kimono sleeves with gold cuffs; long robe skirts to the ankle (cloth 'trobe') with a gold band and gold wave
               embroidery at the hem; a long cape behind him (cloth 'tcape'), gold-edged, gold waves near its hem
     obi       a wide dark obi with gold edges and a gold cord tied in a knot at the front, two gold tassels hanging
     blade     takashi_blade: the plain katana with a gold tsuka wrapped in black diamonds, a gold tsuba, kashira and habaki
   His edge light is gold, as in the key art (skin.rimTint for the outline pass, takashiPal for the rim inside parts).
   Hollow Takashi (hollow_takashi, echoOf takashi) is the same design under the Hollow treatment: the deep near-black
   palette, gold turned to ash-violet, the hair ashen, the kasa's back brim broken off and cracked, one ribbon strand
   gone, the cape, robe skirts and sleeves torn into points, a tear and a glowing crack in the capelet, one obi tassel
   gone. Fighter.draw's glitch, ghost and ash dissolve sit on top.
   All of his cloth is drawn inside the body (silhouette), so the outline, the impact frame and the flat passes carry it.
   Kage can wear the Kasa (trophy helm: the same gold-rimmed kasa over his hair) and the Shinsei Yoroi (the capelet with
   its clasp, cords and shoulder flap over his coat); the common Sugegasa draws the same hat in plain straw.
   Drawing only: no joint, timer or gameplay field is touched, no randomness. */

const TK_GOLD = ['#6e4f1c', '#d0a443', '#f4da8e'];            // trim, ribs, cords, embroidery (TAKASHI_GOLD family)
const TK_GOLD_H = ['#2b2541', '#6a5f98', '#ada2d6'];          // the echo's: gold gone to ash-violet
const TK_ROBE = ['#070407', '#120a10', '#26151f'];            // plum-black robe
const TK_CAPE = ['#060306', '#110910', '#2e1726'];            // the capelet and the long cape, a shade deeper
const TK_INNER = ['#040303', '#0a0808', '#1a1615'];           // the inner kimono under the collar
const TK_STRAW = ['#0c0806', '#1b130d', '#3a2919'];           // the kasa: dark lacquered straw
const TK_STRAW_H = ['#07060b', '#110e18', '#272236'];
const TK_SUGE = ['#2a2216', '#5a4a30', '#8a7650'];            // the common Sugegasa: plain straw
const TK_HAIR = ['#8e887e', '#d6d0c6', '#f2eee6'];            // white hair and beard, never pure white
const TK_HAIR_H = ['#3e3a50', '#7f7996', '#b7b2cc'];          // ash
const TK_RED = ['#4a0910', '#a3172a', '#d8434c'];             // the ribbon
const TK_RED_H = ['#1e1638', '#4a3a86', '#8f80ee'];

/* ---- skins ---- */
ANIME_SKINS.takashi = { top: 'gi', feet: 'sandal', sleeve: 1.18, kote: false, collar: false, cuff: true, cuffTone: TK_GOLD, sash: 'takashi', noGiSash: true,
  takashi: 'boss', rimTint: [226, 170, 70] };
ANIME_SKINS.hollow_takashi = { top: 'gi', feet: 'sandal', sleeve: 1.18, kote: false, collar: false, sash: 'takashi', noGiSash: true, takashi: 'hollow',
  hollow: { fray: 1, robe: {} } };   // `hollow` gives the deep palette and the torn cuffs; the robes and cape are his own
const _tkH = (f) => !!f.hollow;
const _tkG = (f) => (f.hollow ? TK_GOLD_H : TK_GOLD);
// his key art is edge-lit in gold: the fine rim inside his parts follows, and the fabric is plum-black
const _tkPalC = new WeakMap();
function takashiPal(pal) {
  let p = _tkPalC.get(pal);
  if (!p) _tkPalC.set(pal, p = Object.assign({}, pal, { rim: 'rgba(214,160,62,0.5)', acc: TK_GOLD[1], accHi: TK_GOLD[2], fab: TK_ROBE, back: ['#050305', TK_ROBE[0], TK_ROBE[1]], coat: TK_CAPE, coatB: TK_CAPE }));
  return p;
}

// cloth (from animeCloths): the long cape from the shoulders, the robe skirts from the waist, the ribbon from the hat
function takashiCloths(f, sk) {
  if (!sk.takashi) return;
  const s = f.scale, hol = sk.takashi === 'hollow';
  f.cloths.push({ kind: 'tcape', c: new Cloth(10, 13.4 * s, { ph: 1.6, wind: 820, grav: 1100, stiff: 1.93, hang: 0.4 }), at: 'neck', dx: 7, dy: 3, w: 46 });
  f.cloths.push({ kind: 'tcape', far: 1, c: new Cloth(9, 12.6 * s, { ph: 4.3, wind: 1000, grav: 1050, stiff: 1.93, hang: 0.5 }), at: 'neck', dx: 11, dy: 8, w: 34 });
  f.cloths.push({ kind: 'trobe', part: 'back', c: new Cloth(8, 12.8 * s, { ph: 2.2, wind: 340, grav: 1400, stiff: 1.5, hang: 0.3 }), at: 'hip', dx: 5, dy: -4 });
  f.cloths.push({ kind: 'trobe', part: 'flap', c: new Cloth(8, 12.2 * s, { ph: 4.7, wind: 220, grav: 1300, stiff: 1.5, hang: 0.12 }), at: 'hip', dx: 0, dy: -3 });
  f.cloths.push({ kind: 'tribbon', c: new Cloth(11, 7 * s, { ph: 3.1, wind: 1150, grav: 420, stiff: 1.86, hang: 0.6 }), at: 'head', dx: 16, dy: -9, w: 4.4 });
  if (!hol) f.cloths.push({ kind: 'tribbon', c: new Cloth(9, 6.6 * s, { ph: 6.4, wind: 1300, grav: 360, stiff: 1.86, hang: 0.7 }), at: 'head', dx: 17, dy: -7, w: 3.4 });   // the echo lost one
}

/* ---- motifs ---- */
// the wave: a row of seigaiha scallops (two arcs each) under a curling crest, gold, as on the hem of his cape
function takashiWave(g, x, y, R, rot, col, lw) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
  g.beginPath();
  for (const cx of [-R * 1.1, 0, R * 1.1]) for (const k of [1, 0.58]) { g.moveTo(cx - R * 0.55 * k, 0); g.arc(cx, 0, R * 0.55 * k, Math.PI, TAU); }
  // the crest curling over the scallops
  g.moveTo(-R * 1.4, -R * 0.62); g.quadraticCurveTo(-R * 0.3, -R * 1.25, R * 0.55, -R * 0.95);
  g.quadraticCurveTo(R * 1.05, -R * 0.7, R * 0.7, -R * 0.42); g.quadraticCurveTo(R * 0.45, -R * 0.3, R * 0.36, -R * 0.56);
  g.stroke();
  g.restore();
}
// a gold tassel: a cord a -> knot, then the tassel's flared skirt, `dir` the hanging direction (unit)
function _tkTassel(ctx, A, a, len, dx, dy, w, gold) {
  const k = { x: a.x + dx * len, y: a.y + dy * len }, e = { x: k.x + dx * w * 2.6, y: k.y + dy * w * 2.6 }, nx = -dy, ny = dx;
  celFill(ctx, () => animeCapsule(ctx, a, k, w * 0.32, w * 0.32, 0, 0.5), [gold[0], gold[0], gold[1]], A, { sd: w * 0.2, seam: false });
  celFill(ctx, () => { ctx.moveTo(k.x + w * 0.62, k.y); ctx.arc(k.x, k.y, w * 0.62, 0, TAU); }, gold, A, { sd: w * 0.3, hd: w * 0.15 });
  celFill(ctx, () => { ctx.moveTo(k.x + nx * w * 0.45, k.y + ny * w * 0.45); ctx.lineTo(e.x + nx * w * 0.8, e.y + ny * w * 0.8); ctx.lineTo(e.x - nx * w * 0.8, e.y - ny * w * 0.8); ctx.lineTo(k.x - nx * w * 0.45, k.y - ny * w * 0.45); ctx.closePath(); }, gold, A, { sd: w * 0.4, hd: w * 0.15, detail: A.flat ? null : (g) => {
    g.strokeStyle = gold[0]; g.lineWidth = Math.max(0.6, w * 0.16); g.beginPath();
    for (const t of [-0.4, 0, 0.4]) { g.moveTo(k.x + nx * w * 0.45 * t + dx * w * 0.6, k.y + ny * w * 0.45 * t + dy * w * 0.6); g.lineTo(e.x + nx * w * 0.8 * t, e.y + ny * w * 0.8 * t); }
    g.stroke();
  } });
}

/* ---- the long cape behind him: two panels from the shoulders, gold-edged, gold waves near the hem ---- */
function _tkCape(f, ctx, A, U) {
  const hol = _tkH(f), gold = _tkG(f), floorY = f.y + 2 * A.s, S = A.S;
  for (const cl of f.cloths) {
    if (cl.kind !== 'tcape' || !cl.c.init || !cl.far) continue;
    _tkCapePanel(f, ctx, A, U, cl, true, hol, gold, floorY, S);
  }
  for (const cl of f.cloths) {
    if (cl.kind !== 'tcape' || !cl.c.init || cl.far) continue;
    _tkCapePanel(f, ctx, A, U, cl, false, hol, gold, floorY, S);
  }
}
function _tkCapePanel(f, ctx, A, U, cl, far, hol, gold, floorY, S) {
  const c = cl.c, W = cl.w * U, root = [spX(S, 0.98, (far ? -9 : -6) * U), spY(S, 0.98, (far ? -9 : -6) * U)];
  const n = _akEdges(c, (u) => W * (0.42 + 0.58 * Math.pow(u, 0.7)), root[0], root[1]);
  for (let i = 0; i < n; i++) { _akL[i * 2 + 1] = Math.min(_akL[i * 2 + 1], floorY); _akR[i * 2 + 1] = Math.min(_akR[i * 2 + 1], floorY); }
  const tone = hol ? (far ? A.pal.back : A.pal.coatB) : far ? [ANIME.face, TK_CAPE[0], TK_CAPE[1]] : TK_CAPE;
  celFill(ctx, () => _akStrip(ctx, n, c, 0.25, hol ? (far ? 4 : 6) : 0, (hol ? 11 : 0) * U), tone, A, { sd: 7 * U, hd: far ? 0 : 0.9 * U, rim: true, detail: (g) => {
    // folds down the cape
    g.strokeStyle = ANIME.face; g.lineWidth = 1 * A.s; g.beginPath();
    for (const t of [0.3, 0.55, 0.78]) for (let i = 1; i < n; i++) { const x = lerp(_akL[i * 2], _akR[i * 2], t + Math.sin(i * 1.1 + t * 7) * 0.04), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    // the gold edge down both sides (the echo's broken)
    g.strokeStyle = far ? gold[0] : gold[1]; g.lineWidth = 1.5 * U;
    if (hol) g.setLineDash([7 * U, 3 * U, 2 * U, 4 * U]);
    for (const E of [_akL, _akR]) { g.beginPath(); g.moveTo(E[2], E[3]); for (let i = 2; i < n; i++) g.lineTo(E[i * 2], E[i * 2 + 1]); g.stroke(); }
    g.setLineDash([]);
    if (far) return;
    // the gold band above the hem, and the waves embroidered over it
    const j = n - 2, rot = Math.atan2(_akR[j * 2 + 1] - _akL[j * 2 + 1], _akR[j * 2] - _akL[j * 2]);
    g.strokeStyle = gold[1]; g.lineWidth = 2.2 * U; g.beginPath();
    if (hol) g.setLineDash([6 * U, 4 * U]);
    g.moveTo(lerp(_akL[j * 2], _akL[j * 2 + 2], 0.6), lerp(_akL[j * 2 + 1], _akL[j * 2 + 3], 0.6)); g.lineTo(lerp(_akR[j * 2], _akR[j * 2 + 2], 0.6), lerp(_akR[j * 2 + 1], _akR[j * 2 + 3], 0.6)); g.stroke();
    g.setLineDash([]);
    for (const [i, t, R] of [[n - 3, 0.3, 5.2], [n - 3, 0.72, 4.4], [n - 4, 0.52, 3.6]]) {
      const x = lerp(_akL[i * 2], _akR[i * 2], t), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], t);
      takashiWave(g, x, y, R * U, rot + (f.facing > 0 ? 0 : Math.PI), gold[1], 1.15 * U);
    }
    if (hol) _tear(g, A, lerp(_akL[8], _akR[8], 0.5), lerp(_akL[9], _akR[9], 0.5), 4 * U, 3.4 * U, 0.6);
  } });
}

/* ---- the robe skirts: long, to the ankle, a gold band and waves at the hem, the front opening edged gold ---- */
function _tkSkirt(f, ctx, A, U, part) {
  const cl = f.cloths.find(c => c.kind === 'trobe' && c.part === part);
  if (!cl || !cl.c.init) return;
  const back = part === 'back', hol = _tkH(f), gold = _tkG(f), pal = A.pal, floorY = f.y + 2 * A.s;
  const n = coatEdges(cl, (back ? 26 : 19) * U, (back ? 50 : 36) * U, floorY);
  const K = hol ? (back ? 6 : 5) : 0, rag = 9 * U;
  const tone = hol ? (back ? pal.coatB : pal.coat) : back ? ['#040204', TK_ROBE[0], TK_ROBE[1]] : TK_ROBE;
  celFill(ctx, () => (K ? tornPanelPath(ctx, n, K, rag, back ? 0 : 3, floorY) : coatPanelPath(ctx, n)), tone, A, { sd: (back ? 7 : 5) * U, hd: back ? 0 : 0.9 * U, rim: true, detail: (g) => {
    g.strokeStyle = back ? ANIME.face : tone[0]; g.lineWidth = 1 * A.s; g.beginPath();
    for (const t of [0.28, 0.56, 0.82]) for (let i = 1; i < n; i++) { const x = lerp(_cpL[i * 2], _cpR[i * 2], t + Math.sin(i * 1.3 + t * 5) * 0.05), y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    // the gold hem band and a thin line over it (broken on the echo)
    if (hol) g.setLineDash([6 * U, 3 * U, 2 * U, 3 * U]);
    _hemLine(g, n, 3.6 * U, back ? gold[0] : gold[1], 2.6 * U);
    _hemLine(g, n, 7.6 * U, back ? gold[0] : gold[1], 0.9 * U);
    g.setLineDash([]);
    // the waves over the hem
    const lx = _cpL[(n - 1) * 2], ly = _cpL[(n - 1) * 2 + 1], rx = _cpR[(n - 1) * 2], ry = _cpR[(n - 1) * 2 + 1], rot = Math.atan2(ry - ly, rx - lx);
    for (const t of back ? [0.22, 0.58] : [0.5]) {
      const i = n - 2, x = lerp(_cpL[i * 2], _cpR[i * 2], t), y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t);
      takashiWave(g, x, y, (back ? 3.6 : 3.2) * U, rot + (f.facing > 0 ? 0 : Math.PI), back ? gold[0] : gold[1], 1 * U);
    }
    // the front opening edged gold
    const front = (_cpL[0] - _cpR[0]) * f.facing > 0 ? _cpL : _cpR;
    g.strokeStyle = back ? gold[0] : gold[1]; g.lineWidth = 1.5 * U; g.beginPath(); g.moveTo(front[2], front[3]);
    for (let i = 2; i < n; i++) g.lineTo(front[i * 2], front[i * 2 + 1]);
    g.stroke();
  } });
}

/* ---- the ribbon from the back of the hat: two long red strands ---- */
function _tkRibbons(f, ctx, A) {
  const r = BODY.head * f.scale * f.build.head, red = f.hollow ? TK_RED_H : TK_RED, root = _akHeadPt(f, -0.86 * r, -0.44 * r), U = A.U;
  let first = true;
  for (const cl of f.cloths) {
    if (cl.kind !== 'tribbon' || !cl.c.init) continue;
    const c = cl.c, W = cl.w * U, main = first; first = false;
    const n = _akEdges(c, (u) => W * (u < 0.08 ? 0.6 : 1 - u * 0.35), root[0], root[1]);
    celFill(ctx, () => _akStrip(ctx, n, c, 0.9, f.hollow ? 2 : 0, 3 * U), main ? red : [red[0], red[0], red[1]], A, { sd: W * 0.35, hd: main ? W * 0.12 : 0, detail: (g) => {
      g.strokeStyle = red[0]; g.lineWidth = 0.8 * A.s; g.beginPath();
      for (let i = 1; i < n; i++) { const x = lerp(_akL[i * 2], _akR[i * 2], 0.5), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], 0.5); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
    } });
  }
}

/* ---- layers called from the body (21-anime-body.js) ---- */
function takashiLayer(f, ctx, A, skin, U, layer) {
  if (layer === 'over') { takashiClasp(f, ctx, A); return; }   // also Kage in the Shinsei Yoroi
  if (!skin.takashi) return;
  if (layer === 'back') { _tkCape(f, ctx, A, U); _tkRibbons(f, ctx, A); _tkSkirt(f, ctx, A, U, 'back'); }
  else if (layer === 'front') _tkSkirt(f, ctx, A, U, 'flap');
  else if (layer === 'waist') _tkObi(f, ctx, A, A.S, U);
}
// the wide obi: dark, edged gold, a gold cord round it tied in a knot at the front, two gold tassels hanging
function _tkObi(f, ctx, A, S, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)], hol = _tkH(f), gold = _tkG(f), t = f.time || 0;
  const band = (u0, u1, w0, w1) => { const a = P(u0, -w0), b = P(u0, w1), c = P(u1, w1), d = P(u1, -w0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  celFill(ctx, () => band(-0.01, 0.22, 13.6, 13), hol ? A.pal.metal : ['#060405', '#120c0f', '#2a1d22'], A, { sd: 3.4 * U, hd: 0.7 * U, detail: (g) => {
    // gold edges and the cord wound twice round
    for (const [u, lw] of [[0.012, 1.3], [0.205, 1.3]]) _strokePts(g, [P(u, -13.6), P(u, 13)], gold[1], lw * U);
    for (const u of [0.085, 0.13]) _strokePts(g, [P(u - 0.01, -13.6), P(u + 0.01, 13)], gold[0], 1.6 * U);
    for (const u of [0.085, 0.13]) _strokePts(g, [P(u - 0.01, -13.6), P(u + 0.01, 13)], gold[1], 0.8 * U);
  } });
  // the knot: two loops and a wrapped centre on the front of the obi
  const k = P(0.108, 10.6), kp = { x: k[0], y: k[1] }, rot = Math.atan2(S.dy, S.dx);
  ctx.save(); ctx.translate(kp.x, kp.y); ctx.rotate(rot);
  celFill(ctx, () => {
    for (const sy of [-1, 1]) { ctx.moveTo(0, 0); ctx.ellipse(sy * 3.4 * U, 0, 3.2 * U, 2.2 * U, sy * 0.3, Math.PI, Math.PI * 3, false); ctx.closePath(); }
  }, gold, A, { sd: 1 * U, hd: 0.5 * U, detail: (g) => { g.fillStyle = gold[0]; for (const sy of [-1, 1]) { g.beginPath(); g.ellipse(sy * 3.4 * U, 0, 1.4 * U, 0.8 * U, sy * 0.3, 0, TAU); g.fill(); } } });
  celFill(ctx, () => { ctx.moveTo(1.8 * U, 0); ctx.arc(0, 0, 1.8 * U, 0, TAU); }, gold, A, { sd: 0.7 * U, hd: 0.4 * U });
  ctx.restore();
  // the tassels: down the front of the robe, swaying a little (the echo has lost one)
  const dn = [-S.ux, -S.uy];
  for (const [ox, len, ph] of [[-1.4, 9, 0], [1.6, 6, 1.9]]) {
    if (hol && ox > 0) continue;
    const sw = Math.sin(t * 1.9 + ph) * 0.12, dx = dn[0] + S.nx * sw, dy = dn[1] + S.ny * sw, l = Math.hypot(dx, dy);
    _tkTassel(ctx, A, { x: kp.x + S.nx * ox * U + dn[0] * 1.6 * U, y: kp.y + S.ny * ox * U + dn[1] * 1.6 * U }, len * U, dx / l, dy / l, 2.4 * U, gold);
  }
}
// the capelet's flap over the shoulder (called from animeArm): it hangs from the shoulder down the upper arm, edged gold
function takashiSode(f, ctx, sh, el, A, U, far) {
  if (f.armor !== 'shinsei') return;
  const hol = _tkH(f), gold = _tkG(f), S = A.S;
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  const top = [sh.x - ax * 3 * U + S.ux * 1.5 * U, sh.y - ay * 3 * U + S.uy * 1.5 * U];
  const [a0, a1, b1, b0] = _hang(top, ax, ay, al * 0.74 + 3 * U, 15 * U, 21 * U);
  const tone = far ? [ANIME.face, TK_CAPE[0], TK_CAPE[1]] : hol ? A.pal.coat : TK_CAPE;
  celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 2.2 * U), tone, A, { sd: 3.4 * U, hd: far ? 0 : 1 * U, rim: true, detail: (g) => {
    if (hol) g.setLineDash([5 * U, 2 * U, 2 * U, 3 * U]);
    const inset = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
    _strokePts(g, [inset(b0, a0, 0.06), inset(b1, a1, 0.06)], far ? gold[0] : gold[1], 1.8 * U);
    if (!far) _strokePts(g, [inset(b0, a0, 0.2), inset(b1, a1, 0.2)], gold[0], 0.8 * U);
    g.setLineDash([]);
    if (far) return;
    // a fold down the flap
    animeFold(g, A, tone, () => { const p = inset(a0, a1, 0.55), q = inset(b0, b1, 0.42); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); });
    if (hol) _tear(g, A, lerp(b0[0], b1[0], 0.3), lerp(b0[1], b1[1], 0.3) - ay * 2 * U, 3 * U, 2.6 * U, Math.atan2(ay, ax) - Math.PI / 2);
  } });
}

/* ---- the torso (drawArmor 'shinsei'): his robe torso, crossed collar, capelet, clasp and cords; on Kage the capelet ---- */
// a broad, upright robed figure: [u along the spine, w in units]
const TK_TORSO = {
  front: [[-0.14, 12.8], [0.1, 12.2], [0.36, 11.8], [0.62, 13.2], [0.82, 14.4], [0.95, 12.6], [1.03, 6.8], [1.08, 3.8]],
  back: [[1.08, -5.6], [0.97, -14.6], [0.8, -15.2], [0.54, -12.8], [0.28, -12.6], [0.04, -14], [-0.14, -14]]
};
// the capelet: closed at the clasp below the collar, its hem sweeping down to the front and round the back
const TK_CAPELET = [[1.13, -5, 1], [1.13, 4.6, 1], [0.86, 7.4, 1], [0.7, 14.8], [0.6, 15.6, 1], [0.54, 6], [0.5, -6], [0.48, -15], [0.56, -18.4, 1], [0.86, -17.6], [1.04, -12]];
const TK_CAPELET_HEM = [[0.86, 7.4], [0.66, 15.2], [0.6, 15.6], [0.54, 6], [0.5, -6], [0.48, -15], [0.56, -18.4]];
function drawShinsei(ctx, f, ink, flat) {
  const A = f._A;
  if (!A || !A.S) { torsoShape(ctx, f.sk.hip, f.sk.neck, f.facing, f.build.w * f.scale * 0.6); return; }
  const S = A.S, U = A.U, P = _sP(S, U), hol = _tkH(f), gold = _tkG(f), skin = animeSkin(f), tk = !!skin.takashi;
  if (tk) {
    // the robe torso: the outer robe's crossed collar of two gold-edged lapels over the dark inner kimono
    const cl = hol ? A.pal.fab : TK_ROBE;
    celFill(ctx, () => animeTorso(ctx, S, TK_TORSO, U), cl, A, { sd: 7 * U, hd: 1 * U, rim: true, detail: (g) => {
      const poly = (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
      poly([P(1.1, 0.4), P(1.1, 6.4), P(0.44, 13), P(0.36, 12.4)], hol ? A.pal.back[1] : TK_INNER[1]);
      _strokePts(g, [P(1.08, 1.6), P(0.48, 11.6)], gold[0], 0.9 * U);
      _strokePts(g, [P(1.1, 0.2), P(0.38, 12.2)], gold[1], 1.4 * U);
      _strokePts(g, [P(1.04, 6.8), P(0.44, 13.4)], cl[2], 1 * A.s);
      // folds from the armpit and over the belly
      _strokePts(g, [P(0.8, -3), P(0.52, -4.6), P(0.3, -3.6)], cl[0], 1 * A.s);
      animeFold(g, A, cl, () => { const a = P(0.36, 2), b = P(0.26, 8); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); });
      if (hol) hollowCrack(g, A, 1, [P(0.4, -8), P(0.32, -5), P(0.26, -7)], 0.7 * U);
    } });
  }
  // the capelet over the shoulders, edged gold
  const pts = _hsp(S, U, TK_CAPELET), tone = hol ? A.pal.coat : TK_CAPE;
  celFill(ctx, () => orderShape(ctx, 1, pts), tone, A, { sd: 4.6 * U, hd: 1.1 * U, rim: true, detail: (g) => {
    // two folds falling from the shoulder, the gold trim along the hem with a fine second line inside
    animeFold(g, A, tone, () => { const a = P(1.02, -8), b = P(0.6, -11); g.moveTo(a[0], a[1]); g.quadraticCurveTo(P(0.8, -11)[0], P(0.8, -11)[1], b[0], b[1]); });
    animeFold(g, A, tone, () => { const a = P(0.98, 2), b = P(0.62, 6); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); });
    if (hol) g.setLineDash([7 * U, 3 * U, 2 * U, 3 * U]);
    g.lineJoin = 'round';
    g.strokeStyle = gold[1]; g.lineWidth = 1.8 * U; g.beginPath(); orderShape(g, 1, pts); g.stroke();
    g.strokeStyle = gold[0]; g.lineWidth = 0.8 * U; g.beginPath();
    _hsp(S, U, TK_CAPELET_HEM).forEach((p, i) => { const q = [p[0] + S.ux * 2.4 * U, p[1] + S.uy * 2.4 * U]; i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); });
    g.stroke(); g.setLineDash([]);
    if (hol) { _tear(g, A, P(0.6, -9)[0], P(0.6, -9)[1], 3.4 * U, 3 * U, 0.3); hollowCrack(g, A, 1, [P(0.98, 2), P(0.86, -1), P(0.78, 2), P(0.66, 0)], 0.8 * U); }
  } });
  if (A.flat) { void ink; void flat; return; }
  // the cords swagged from the clasp across the capelet (the clasp itself is drawn over the near arm: takashiClasp)
  const cl0 = P(TK_CLASP[0], TK_CLASP[1]), clasp = { x: cl0[0], y: cl0[1] };
  for (const [u1, w1, sag] of [[0.62, -9, 5], [0.66, 14, 3]]) {
    const e = P(u1, w1), m = P((TK_CLASP[0] + u1) / 2 - sag * 0.03, (TK_CLASP[1] + w1) / 2);
    ctx.strokeStyle = gold[0]; ctx.lineWidth = 1.9 * U; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(clasp.x, clasp.y); ctx.quadraticCurveTo(m[0], m[1], e[0], e[1]); ctx.stroke();
    ctx.strokeStyle = gold[1]; ctx.lineWidth = 1.1 * U; ctx.beginPath(); ctx.moveTo(clasp.x, clasp.y); ctx.quadraticCurveTo(m[0], m[1], e[0], e[1]); ctx.stroke();
  }
  void tk;
}
// the clasp at the throat, the tassel under it: drawn after the near arm so the sleeve never hides it
const TK_CLASP = [0.8, 8.6];
function takashiClasp(f, ctx, A) {
  if (A.flat || !A.S) return;
  if (f.armor === 'shinsei') _tkClaspDraw(f, ctx, A);
  if (animeSkin(f).takashi && f.helmet === 'straw_kasa') {
    // the beard, in the head's frame as silhouette() sets it, with the light turned into it
    const sk = f.sk, r0 = BODY.head * f.scale * f.build.head;
    ctx.save(); ctx.translate(sk.head.x, sk.head.y); ctx.rotate(f.headRot || 0); ctx.scale(f.facing, 1);
    const sv = _headLight(A, f); _tkBeard(ctx, f, r0, A); A.lx = sv[0]; A.ly = sv[1];
    ctx.restore();
  }
}
function _tkClaspDraw(f, ctx, A) {
  const S = A.S, U = A.U, gold = _tkG(f), hol = _tkH(f);
  const clasp = { x: spX(S, TK_CLASP[0], TK_CLASP[1] * U), y: spY(S, TK_CLASP[0], TK_CLASP[1] * U) };
  _tkTassel(ctx, A, clasp, 6 * U, -S.ux, -S.uy, 2.2 * U, gold);
  // a gold disc, a dark ring and a gold dot (the Tachibana mark), a soft glow
  const R = 3.6 * U;
  if (!hol) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(240,190,80,0.16)'; ctx.beginPath(); ctx.arc(clasp.x, clasp.y, R * 2, 0, TAU); ctx.fill(); ctx.restore(); }
  celFill(ctx, () => { ctx.moveTo(clasp.x + R, clasp.y); ctx.arc(clasp.x, clasp.y, R, 0, TAU); }, gold, A, { sd: R * 0.32, hd: R * 0.16, detail: (g) => {
    g.strokeStyle = gold[0]; g.lineWidth = 0.9 * U; g.beginPath(); g.arc(clasp.x, clasp.y, R * 0.62, 0, TAU); g.stroke();
    g.fillStyle = gold[0]; g.beginPath(); g.arc(clasp.x, clasp.y, R * 0.22, 0, TAU); g.fill();
  } });
}

/* ---- the blade (SUB_WEAPON_ART): the katana with a gold tsuka wrapped in black diamonds and gold fittings ---- */
function _tkBlade(ctx, sh, L, s, f) {
  if (sh !== 'katana') return false;
  drawWeaponShape(ctx, 'katana', L, 'ink', s, C.ink, null);
  const gold = f && f.hollow ? TK_GOLD_H : TK_GOLD, hl = 0.31, hw = 2.2 * s;
  // the tsuka: gold, the black wrap crossing it in diamonds, a gold kashira
  ctx.lineCap = 'butt'; ctx.strokeStyle = C.ink; ctx.lineWidth = hw * 2 + 1.2 * s; ctx.beginPath(); ctx.moveTo(-L * hl, 0); ctx.lineTo(-1.5 * s, 0); ctx.stroke();
  ctx.strokeStyle = gold[1]; ctx.lineWidth = hw * 2; ctx.beginPath(); ctx.moveTo(-L * hl, 0); ctx.lineTo(-1.5 * s, 0); ctx.stroke();
  ctx.lineCap = 'round';
  ctx.fillStyle = '#0a0705';
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(-L * hl * (i + 0.6) / 6.2, 0); ctx.rotate(Math.PI / 4); ctx.fillRect(-1.05 * s, -1.05 * s, 2.1 * s, 2.1 * s); ctx.restore(); }
  ctx.strokeStyle = gold[2]; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(-L * hl, -hw * 0.8); ctx.lineTo(-2 * s, -hw * 0.8); ctx.stroke();
  ctx.fillStyle = gold[1]; ctx.beginPath(); ctx.arc(-L * hl, 0, hw * 1.15, 0, TAU); ctx.fill();
  ctx.fillStyle = gold[0]; ctx.beginPath(); ctx.arc(-L * hl - 0.4 * s, 0, hw * 0.5, 0, TAU); ctx.fill();
  // the tsuba: a round gold guard, rimmed dark, and the gold habaki
  ctx.fillStyle = gold[1]; ctx.beginPath(); ctx.ellipse(-0.6 * s, 0, 2.1 * s, 6 * s, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = gold[0]; ctx.lineWidth = 0.9 * s; ctx.stroke();
  ctx.fillStyle = gold[2]; ctx.fillRect(-1.4 * s, -5.2 * s, 0.8 * s, 3 * s);
  ctx.fillStyle = gold[1]; ctx.fillRect(1.4 * s, -1.75 * s, 3 * s, 3.5 * s);
  return true;
}
Object.assign(SUB_WEAPON_ART, { takashi_blade: _tkBlade, echo_nameless: _tkBlade });

/* ---- the head (drawHelmet 'straw_kasa'): Takashi's kasa, hair and beard; the Kasa or Sugegasa on Kage ---- */
// the hat's cone in head units (drawn at k = 1.2): back brim tip, apex, front brim tip, then the under edge back
const TK_HAT = [[-2.32, -0.5, 1], [-0.04, -1.36, 1], [2.36, -0.1, 1], [1.1, -0.17], [0, -0.28], [-1.2, -0.4]];
const TK_HAT_H = [[-1.86, -0.66, 1], [-2.1, -0.5, 1], [-1.64, -0.42, 1], [-1.9, -0.78, 1], [-0.04, -1.36, 1], [2.36, -0.1, 1], [1.1, -0.17], [0, -0.28], [-1.2, -0.38, 1]];
// its gold rim along the brim
const TK_BRIM = [[-2.36, -0.52, 1], [-1.2, -0.44], [0, -0.32], [1.1, -0.21], [2.42, -0.13, 1], [2.38, 0.0, 1], [1.1, -0.08], [0, -0.18], [-1.2, -0.3], [-2.3, -0.4, 1]];
const TK_BRIM_H = [[-1.6, -0.46, 1], [-1.2, -0.43], [0, -0.32], [1.1, -0.21], [2.42, -0.13, 1], [2.38, 0.0, 1], [1.1, -0.08], [0, -0.18], [-1.2, -0.29, 1], [-1.44, -0.3, 1], [-1.36, -0.4, 1]];
// white hair swept back behind the face in spiky locks, a few falling past the temple
const TK_HAIRP = [[0.24, -0.5, 1], [0.1, -0.1], [0.22, 0.34, 1], [-0.04, 0.08], [-0.02, 0.66, 1], [-0.26, 0.32], [-0.4, 0.86, 1], [-0.56, 0.46], [-0.92, 0.96, 1],
  [-0.8, 0.42], [-1.5, 0.66, 1], [-1.04, 0.2], [-1.76, 0.12, 1], [-1.08, -0.1], [-1.6, -0.36, 1], [-1.0, -0.42], [-1.2, -0.62, 1], [-0.6, -0.56, 1]];
// the moustache: drooping wings from under the nose, and the long beard to a point, split at the end
const TK_MOUST = [[0.92, 0.32, 1], [1.16, 0.44], [1.3, 0.8, 1], [1.04, 0.56], [0.78, 0.5], [0.5, 0.58], [0.22, 0.9, 1], [0.32, 0.48], [0.64, 0.36]];
const TK_BEARD = [[0.82, 0.56], [0.94, 0.84], [0.88, 1.2], [0.92, 1.46, 1], [0.78, 1.36], [0.66, 1.96, 1], [0.58, 1.46], [0.44, 1.6, 1], [0.44, 1.16], [0.36, 0.86], [0.5, 0.62]];
function _tkHat(ctx, f, r, A, hat, brim, straw, gold, hol) {
  celFill(ctx, () => orderShape(ctx, r, hat), straw, A, { sd: r * 0.24, hd: r * 0.05, rim: true, detail: (g) => {
    // the ribs from the apex, gold, the lit ones brighter; a fine woven ring round the crown
    g.lineCap = 'round';
    const ax = -0.04 * r, ay = -1.36 * r;
    for (const [k, lit] of [[-2.0, 0], [-1.3, 0], [-0.62, 1], [0.1, 1], [0.84, 1], [1.6, 0]]) {
      if (hol && k < -1.5) continue;
      const x1 = k * r, y1 = (-0.47 + (k + 2.32) / 4.68 * 0.36) * r;
      g.strokeStyle = ANIME.outline; g.lineWidth = Math.max(0.8, r * 0.05); g.beginPath(); g.moveTo(ax, ay); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = lit ? gold[1] : gold[0]; g.lineWidth = Math.max(0.6, r * 0.028); g.beginPath(); g.moveTo(ax + r * 0.03, ay + r * 0.02); g.lineTo(x1 + r * 0.03, y1); g.stroke();
    }
    g.strokeStyle = straw[2]; g.lineWidth = Math.max(0.5, r * 0.02); g.beginPath();
    for (const t of [0.3, 0.62]) { g.moveTo(lerp(ax, -2.32 * r, t), lerp(ay, -0.5 * r, t)); g.quadraticCurveTo(lerp(ax, 0, t), lerp(ay, -0.28 * r, t) + r * 0.02, lerp(ax, 2.36 * r, t), lerp(ay, -0.1 * r, t)); }
    g.stroke();
    if (hol) hollowCrack(g, A, r, [[-1.5, -0.56], [-1.1, -0.82], [-0.82, -0.74], [-0.46, -1.08]], Math.max(0.7, r * 0.04));
  } });
  // the gold edge light along the cone's upper edges, then the rim along the brim
  ctx.save(); ctx.strokeStyle = gold[1]; ctx.globalAlpha *= 0.85; ctx.lineWidth = Math.max(0.7, r * 0.035); ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(hat[0][0] * r, hat[0][1] * r - r * 0.02); ctx.lineTo(-0.04 * r, -1.37 * r); ctx.lineTo(2.32 * r, -0.12 * r); ctx.stroke(); ctx.restore();
  celFill(ctx, () => orderShape(ctx, r, brim), gold, A, { sd: r * 0.05, hd: r * 0.03 });
  if (!hol) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(240,186,80,0.22)'; ctx.lineWidth = r * 0.14;
    ctx.beginPath(); ctx.moveTo(-2.3 * r, -0.46 * r); ctx.quadraticCurveTo(0, -0.22 * r, 2.38 * r, -0.07 * r); ctx.stroke(); ctx.restore();
  }
}
// the beard and moustache (head frame): drawn after the near arm (takashiClasp), since they hang in front of the chest
function _tkBeard(ctx, f, r0, A) {
  const hc = _tkH(f) ? TK_HAIR_H : TK_HAIR;
  // the beard, then the moustache over it
  celFill(ctx, () => orderShape(ctx, r0, TK_BEARD), hc, A, { sd: r0 * 0.18, hd: r0 * 0.05, rim: true, detail: (g) => {
    g.lineCap = 'round'; g.strokeStyle = hc[0]; g.lineWidth = Math.max(0.7, r0 * 0.045); g.beginPath();
    for (const [x0, y0, x1, y1] of [[0.78, 0.74, 0.84, 1.3], [0.64, 0.74, 0.66, 1.76], [0.5, 0.8, 0.5, 1.4]]) { g.moveTo(x0 * r0, y0 * r0); g.quadraticCurveTo((x0 + x1) * 0.5 * r0 + 0.05 * r0, (y0 + y1) * 0.5 * r0, x1 * r0, y1 * r0); }
    g.stroke();
  } });
  celFill(ctx, () => orderShape(ctx, r0, TK_MOUST), hc, A, { sd: r0 * 0.1, hd: r0 * 0.05, detail: (g) => {
    g.strokeStyle = hc[0]; g.lineWidth = Math.max(0.6, r0 * 0.035); g.beginPath(); g.moveTo(1.18 * r0, 0.66 * r0); g.quadraticCurveTo(0.8 * r0, 0.44 * r0, 0.3 * r0, 0.8 * r0); g.stroke();
  } });
}
function drawStrawKasa(ctx, f, r, ink, flat) {
  const A = f && f._A, tk = !!(f && animeSkin(f).takashi), hol = tk && _tkH(f), r0 = r;
  const kage = !tk && f && f.isPlayer, kasaGear = !tk && f && f.helmetId === 'kasa';
  r = r * 1.2;
  const hat = hol ? TK_HAT_H : TK_HAT, brim = hol ? TK_BRIM_H : TK_BRIM;
  if (flat || !A || A.flat) {
    if (kage) { ctx.save(); ctx.beginPath(); ctx.rect(-4 * r0, -0.36 * r0, 8 * r0, 6 * r0); ctx.clip(); drawKageHair(ctx, r0, ink, flat, f); ctx.restore(); }
    ctx.fillStyle = flat ? ink : (A ? TK_STRAW[1] : ink);
    if (tk) for (const pts of [TK_HAIRP, TK_MOUST, TK_BEARD]) { ctx.beginPath(); orderShape(ctx, r0, pts); ctx.fill(); }   // (flat: the beard stays in the head pass)
    for (const pts of [hat, brim]) { ctx.beginPath(); orderShape(ctx, r, pts); ctx.fill(); }
    if (!flat && !A) {   // the gear shop's icon: ribs and the rim in gold on the plain shape
      ctx.strokeStyle = kasaGear ? 'rgba(208,164,67,0.8)' : 'rgba(201,164,92,0.5)'; ctx.lineWidth = 1;
      for (const k of [-2.0, -1.3, -0.62, 0.1, 0.84, 1.6]) { ctx.beginPath(); ctx.moveTo(-0.04 * r, -1.36 * r); ctx.lineTo(k * r, (-0.47 + (k + 2.32) / 4.68 * 0.36) * r); ctx.stroke(); }
      if (kasaGear) { ctx.fillStyle = TK_GOLD[1]; ctx.beginPath(); orderShape(ctx, r, TK_BRIM); ctx.fill(); }
    }
    return;
  }
  const sv = _headLight(A, f);
  if (tk) {
    const hc = hol ? TK_HAIR_H : TK_HAIR;
    // the hair behind the face, combed back in locks
    celFill(ctx, () => orderShape(ctx, r0, TK_HAIRP), hc, A, { sd: r0 * 0.24, hd: r0 * 0.06, rim: true, detail: (g) => {
      g.lineCap = 'round'; g.strokeStyle = hc[0]; g.lineWidth = Math.max(0.7, r0 * 0.045); g.beginPath();
      for (const [x0, y0, x1, y1] of [[-0.5, -0.3, -1.1, -0.06], [-0.4, 0.04, -0.86, 0.44], [-0.12, 0.08, -0.3, 0.56]]) {
        g.moveTo(x0 * r0, y0 * r0); g.quadraticCurveTo((x0 + x1) * 0.5 * r0, (y0 + y1) * 0.5 * r0 - 0.08 * r0, x1 * r0, y1 * r0);
      }
      g.stroke();
    } });
  } else if (kage) {
    // Kage keeps his hair under the hat: only what shows below the brim
    ctx.save(); ctx.beginPath(); ctx.rect(-4 * r0, -0.36 * r0, 8 * r0, 6 * r0); ctx.clip();
    A.lx = sv[0]; A.ly = sv[1]; drawKageHair(ctx, r0, ink, flat, f); _headLight(A, f);
    ctx.restore();
  }
  const straw = hol ? TK_STRAW_H : kasaGear || tk ? TK_STRAW : TK_SUGE;
  const gold = tk ? _tkG(f) : kasaGear ? TK_GOLD : ['#3a2f1f', '#6e5c3e', '#8f7a54'];
  _tkHat(ctx, f, r, A, hat, brim, straw, gold, hol);
  A.lx = sv[0]; A.ly = sv[1];
}
