/* KAGE — the anime samurai body (anime redesign, ticket 02).
   Every fighter is drawn here on its skeleton (`Fighter.sk`) as cel-shaded vector parts: a black face with glowing
   white eyes, a clothed torso, sleeves, hakama legs, boots or sandals, mitten hands on the grip, and (Kage) a long
   charcoal coat with a crimson-embroidered hem. Nothing here moves a joint: the skeleton is gameplay, the art follows it.

   How it is built (so tickets 03 to 12 add a character by adding data, not by rewriting the body):
   - ANIME            the palette tokens of docs/art-reference/STYLE.md.
   - celFill          one part = one closed path, filled base / shadow / highlight with a red rim strip on the far side,
                      or one flat fill on the flat passes (outline, impact frame, flash, glitch ghost, afterimages).
   - part library     animeCapsule (sleeves, hakama, boots), animeTorso (profile tables), animeHand (mitten grip),
                      animeFoot (boot / sandal), animeHeadPath (the face), drawKageHair, coat panels on cloth chains,
                      embroidery motifs (cloudMotif, hemBand).
   - ANIME_SKINS      a skin per character: which top (coat / gi), coat cut, footwear, sleeve width, sash, saya, accent.
                      animeSkin(f) picks one: a fighter def id or echoOf entry, else the player's, else the shared base.
                      A later ticket adds `ANIME_SKINS.<enemy id> = { ... }` and, where a part is new, a part function.
   - animePalette     the fabric tones for a fighter: black fabric for ink bodies, three tones derived from any other
                      body colour (the Order slate, the flickering Hollow violet) so families still read apart. */

// Values sit low on purpose (polish pass): the figure reads as near-black with a narrow separation tone, crimson accents
// and muted silver only on metal. Layers are told apart by the shadow strips, the fine dark seams celFill draws round
// every part and a thin crimson rim, not by mid-grey fabric.
const ANIME = {
  face: '#050404', cloth0: '#060505', cloth1: '#0d0b0b', cloth2: '#1b1817',
  char0: '#0d0c0e', char1: '#161518', char2: '#252329',
  metal0: '#09090b', metal1: '#141518', metal2: '#2c2f35',
  crimson: '#7e161b', crimsonHi: '#b02a31', scarf: '#c8343a',
  silver: '#9a9ea4', silverHi: '#d6d9dd',
  rim: 'rgba(168,30,36,0.55)', eye: '#f4f1ea', eyeGlow: 'rgba(244,241,234,0.35)', outline: '#030303'
};
// the silhouette rim of the outline pass (Fighter.draw): the stage's rim colour pulled toward deep crimson (violet for
// Hollows) and pre-mixed onto near-black, so the stamped passes stay one even, opaque, thin line
const _rimCache = {};
function animeRimColor(src, hollow) {
  const key = src + (hollow ? 'h' : ''); let v = _rimCache[key]; if (v) return v;
  let rgb = [222, 96, 72], a = 0.75;
  const m = /rgba?\(([^)]+)\)/.exec(src);
  if (m) { const q = m[1].split(',').map(x => +x.trim()); rgb = [q[0], q[1], q[2]]; if (q[3] != null) a = q[3]; }
  else if (_hexRGB(src)) { rgb = _hexRGB(src); a = 1; }
  const tint = hollow ? [124, 92, 224] : [184, 30, 38], k = 0.62, base = [9, 6, 6], t = clamp(a, 0, 1) * 0.86;
  const c = [0, 1, 2].map(i => rgb[i] + (tint[i] - rgb[i]) * k);
  return (_rimCache[key] = `rgb(${[0, 1, 2].map(i => Math.round(base[i] + (c[i] - base[i]) * t)).join(',')})`);
}

/* ---- skins: one entry per character design ---- */
const ANIME_SKINS = {
  // Kage: long charcoal coat open at the front, split at the back, crimson-embroidered hem and cuffs, crimson sash with
  // a dark belt and silver buckle, black inner kimono, hakama into tall strapped boots, the saya at his hip
  kage: { top: 'coat', coat: { w0: 22, w1: 66, fw0: 16, fw1: 36, embroider: true }, feet: 'boot', sleeve: 1, sash: 'kage', saya: true, collar: true, wrap: true, cuff: true, kote: true },
  // young Kage (the Interlude spar): a plain training gi and hakama, straw sandals, no coat yet
  youngKage: { top: 'gi', feet: 'sandal', sleeve: 1.05, collar: false, sash: 'obi' },
  // every other fighter until its own ticket gives it an identity: dark kimono top with wide sleeves over strapped kote,
  // a dark obi, wide split hakama, tabi and sandals
  base: { top: 'gi', feet: 'sandal', sleeve: 1.08, collar: false, kote: true, sash: 'obi' }
};
function animeSkin(f) {
  if (f.isPlayer) return f.armor === 'training' ? ANIME_SKINS.youngKage : ANIME_SKINS.kage;
  const d = f.def;
  return (d && (ANIME_SKINS[d.id] || (d.echoOf && ANIME_SKINS[d.echoOf]))) || ANIME_SKINS.base;
}
// cloth a skin needs (called from the Fighter constructor): the coat's back panel and near flap hang from the waist
function animeCloths(f) {
  const sk = animeSkin(f), s = f.scale;
  if (sk.coat) {
    // to mid-calf: the back panel ~84 px from the waist, the near flap a little shorter (`len` cuts a shorter coat: Rem's)
    const k = sk.coat.len || 1;
    f.cloths.push({ kind: 'coat', part: 'back', c: new Cloth(8, 12 * s * k, { ph: 2.2, wind: 1150, grav: 1000, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -4 });
    f.cloths.push({ kind: 'coat', part: 'flap', c: new Cloth(7, 11.4 * s * k, { ph: 4.7, wind: 260, grav: 1250, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });
  }
  if (sk.order) orderCloths(f, sk);   // the Order's hood tails and hat cords (22-anime-order.js)
  if (sk.hollow) hollowCloths(f, sk);   // the Hollows' torn robes, cape and hood tails (23-anime-hollow.js)
  subCloths(f, sk);   // the sub-bosses' robes, capes, hood tails and cords, by look (24-anime-subs-a.js)
  subBCloths(f, sk);   // the later sub-bosses' haori skirts, capes, band tails and hair (25-anime-subs-b.js)
  remCloths(f, sk);   // Rem's headband tails (26-anime-rem.js)
}

/* ---- palette ---- */
const _palCache = {};
function _hexRGB(h) {
  if (h[0] !== '#') return null;
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  const n = parseInt(h.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function _mix(c, d, k) { return `rgb(${Math.round(c[0] + (d[0] - c[0]) * k)},${Math.round(c[1] + (d[1] - c[1]) * k)},${Math.round(c[2] + (d[2] - c[2]) * k)})`; }
function animePalette(f, body) {
  const hollow = f.hollow, deep = hollow && !!animeSkin(f).hollow, key = (f.isPlayer ? 'P' : 'E') + body + (hollow ? 'h' : '') + (deep ? 'd' : '');
  let p = _palCache[key]; if (p) return p;
  const rgb = _hexRGB(body) || [3, 3, 3], lum = rgb[0] + rgb[1] + rgb[2];
  const acc = hollow ? '#7b5ad6' : ANIME.crimson, accHi = hollow ? '#b9a8ff' : ANIME.crimsonHi;
  if (lum < 60) {
    // ink bodies (Kage, the bosses): black fabric, charcoal coat, dark metal
    p = { fab: [ANIME.cloth0, ANIME.cloth1, ANIME.cloth2], coat: [ANIME.char0, ANIME.char1, ANIME.char2], back: ['#070606', ANIME.cloth0, ANIME.cloth1],
      coatB: ['#121113', ANIME.char0, '#252427'], metal: [ANIME.metal0, ANIME.metal1, ANIME.metal2], hair: ['#070606', '#0e0c0c', '#2a2422'], boot: ['#080707', '#121011', '#34302f'] };
  } else {
    // a family colour (the Order slate, the Hollow violet): the same parts in that colour's own three tones
    // pulled far down so the family colour is only a tint in near-black cloth: a generic enemy reads as a dark samurai
    // (the Hollows of ticket 04 sit deeper still: near-black cloth with only a violet cast)
    const dk = [0, 0, 0], m = deep ? (k) => _mix(rgb, dk, 1 - (1 - k) * 0.7) : (k) => _mix(rgb, dk, k);
    p = { fab: [m(0.86), m(0.72), m(0.52)], coat: [m(0.82), m(0.66), m(0.46)],
      back: [m(0.92), m(0.84), m(0.72)], coatB: [m(0.9), m(0.8), m(0.66)], metal: [ANIME.metal0, ANIME.metal1, ANIME.metal2],
      hair: [m(0.92), m(0.86), m(0.7)], boot: [m(0.92), m(0.84), m(0.66)] };
    p.armor = _mix(rgb, dk, 0.5);
  }
  p.acc = acc; p.accHi = accHi; p.rim = deep ? 'rgba(118,88,206,0.36)' : hollow ? 'rgba(150,120,240,0.5)' : ANIME.rim;
  return (_palCache[key] = p);
}

/* ---- cel fill: base, a shadow strip on the side away from the light, an optional lit edge and the red rim ---- */
// P() adds one closed sub-path (no beginPath); tone = [shadow, base, highlight]; A = the draw state (animeState)
// o: { sd shadow depth px, hd highlight depth px (0 none), rim true for the red rim strip, detail(ctx) drawn clipped }
function celFill(ctx, P, tone, A, o) {
  ctx.beginPath(); P();
  if (A.flat) { ctx.fillStyle = A.col; ctx.fill(); return; }
  ctx.fillStyle = tone[1]; ctx.fill();
  ctx.save(); ctx.clip();
  const lx = A.lx, ly = A.ly, sd = (o && o.sd) || 3 * A.s;
  const strip = (dx, dy, col) => {
    ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
    ctx.translate(dx, dy); P(); ctx.translate(-dx, -dy);
    ctx.fillStyle = col; ctx.fill('evenodd');
  };
  strip(lx * sd, ly * sd, tone[0]);
  if (o && o.hd) strip(-lx * o.hd, -ly * o.hd, tone[2]);
  if (o && o.detail) o.detail(ctx);
  // a thin crimson rim on the part's back edge (only the parts that carry the silhouette ask for it), then a fine dark
  // seam round the part, half its width inside the clip, so overlapping layers separate without a bright outline
  if (o && o.rim) strip(lx * 0.8 * A.s, ly * 0.8 * A.s, A.pal.rim);
  if (!(o && o.seam === false)) { ctx.beginPath(); P(); ctx.strokeStyle = ANIME.outline; ctx.lineWidth = 1.5 * A.s; ctx.stroke(); }
  ctx.restore();
}
// a fold line: the dark crease with a lit edge one pixel toward the light, so folds still read on near-black cloth
function animeFold(g, A, tone, path) {
  const ox = -A.lx * 1.1 * A.s, oy = -A.ly * 1.1 * A.s;
  g.lineCap = 'round'; g.lineWidth = 0.8 * A.s; g.strokeStyle = tone[2];
  g.translate(ox, oy); g.beginPath(); path(); g.stroke(); g.translate(-ox, -oy);
  g.lineWidth = 1.1 * A.s; g.strokeStyle = ANIME.outline; g.beginPath(); path(); g.stroke();
}
function animeState(f, front, flat, opt) {
  const A = f._A || (f._A = {});
  A.flat = flat; A.col = front; A.opt = opt; A.s = f.scale; A.f = f.facing;
  // light from the upper front of the fighter (STYLE.md): the shadow and the rim sit on the lower back
  A.lx = 0.55 * f.facing; A.ly = -0.83;
  A.pal = animePalette(f, flat ? C.ink : front);
  const sk = animeSkin(f); if (sk.acc && !flat) A.pal = subAccPal(A.pal, sk.acc);   // a sub-boss's own accent (24-anime-subs-a.js)
  return A;
}

/* ---- part library (paths only; celFill fills them) ---- */
// a tapered sleeve / hakama / boot segment a -> b with radii ra, rb, swelling by `bulge` at `pos` along it
function animeCapsule(ctx, a, b, ra, rb, bulge, pos) {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy) || 0.001;
  const ux = dx / L, uy = dy / L, nx = -uy, ny = ux, an = Math.atan2(ny, nx);
  pos = pos == null ? 0.5 : pos;
  const rm = ra + (rb - ra) * pos + (bulge || 0), mx = a.x + dx * pos, my = a.y + dy * pos;
  const p0x = a.x + nx * ra, p0y = a.y + ny * ra, p2x = b.x + nx * rb, p2y = b.y + ny * rb;
  const q0x = b.x - nx * rb, q0y = b.y - ny * rb, q2x = a.x - nx * ra, q2y = a.y - ny * ra;
  ctx.moveTo(p0x, p0y);
  ctx.quadraticCurveTo(2 * (mx + nx * rm) - (p0x + p2x) / 2, 2 * (my + ny * rm) - (p0y + p2y) / 2, p2x, p2y);
  ctx.arc(b.x, b.y, rb, an, an - Math.PI, true);
  ctx.quadraticCurveTo(2 * (mx - nx * rm) - (q0x + q2x) / 2, 2 * (my - ny * rm) - (q0y + q2y) / 2, q2x, q2y);
  ctx.arc(a.x, a.y, ra, an + Math.PI, an, true);
  ctx.closePath();
}
// the torso: a profile table [u along the spine 0 hip .. 1 neck, w across in clothing units] for the front and back
const ANIME_TORSO = {
  coat: { front: [[-0.14, 11.8], [0.1, 11], [0.34, 10.2], [0.6, 12.2], [0.8, 13.6], [0.93, 12], [1.02, 6.6], [1.07, 3.8]],
          back: [[1.07, -5.4], [0.97, -13.4], [0.8, -14.2], [0.55, -11.6], [0.3, -11.2], [0.06, -12.6], [-0.14, -12.6]] },
  gi:   { front: [[-0.14, 11.6], [0.1, 11], [0.36, 10.4], [0.62, 11.8], [0.82, 13], [0.95, 11], [1.03, 6.2], [1.07, 3.6]],
          back: [[1.07, -5.2], [0.97, -13], [0.8, -13.8], [0.54, -11.4], [0.28, -11.4], [0.04, -12.8], [-0.14, -12.8]] }
};
const _atp = new Float32Array(40);
// spine frame shared by the torso parts: P(u, w) = hip + u * spine + w * front normal (w in px)
function animeSpine(f) {
  const sk = f.sk, hx = sk.hip.x, hy = sk.hip.y, dx = sk.neck.x - hx, dy = sk.neck.y - hy, T = Math.hypot(dx, dy) || 1;
  const S = f._spine || (f._spine = {});
  S.hx = hx; S.hy = hy; S.dx = dx; S.dy = dy; S.T = T; S.nx = -dy / T * f.facing; S.ny = dx / T * f.facing;
  S.ux = dx / T; S.uy = dy / T;
  return S;
}
function spX(S, u, w) { return S.hx + S.dx * u + S.nx * w; }
function spY(S, u, w) { return S.hy + S.dy * u + S.ny * w; }
function animeTorso(ctx, S, prof, U) {
  let k = 0;
  for (const [u, w] of prof.front) { _atp[k++] = spX(S, u, w * U); _atp[k++] = spY(S, u, w * U); }
  for (const [u, w] of prof.back) { _atp[k++] = spX(S, u, w * U); _atp[k++] = spY(S, u, w * U); }
  const n = k / 2;
  ctx.moveTo((_atp[0] + _atp[2]) / 2, (_atp[1] + _atp[3]) / 2);
  for (let i = 1; i <= n; i++) {
    const c = (i % n) * 2, nx = ((i + 1) % n) * 2;
    ctx.quadraticCurveTo(_atp[c], _atp[c + 1], (_atp[c] + _atp[nx]) / 2, (_atp[c + 1] + _atp[nx + 1]) / 2);
  }
  ctx.closePath();
}
// a mitten hand round the grip: a rounded block along the forearm with a thumb lobe; fingers implied by one line
function animeHandPath(ctx, el, ha, r) {
  const dx = ha.x - el.x, dy = ha.y - el.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  ctx.moveTo(ha.x + ux * r * 1.25, ha.y + uy * r * 1.25);
  ctx.ellipse(ha.x + ux * r * 0.25, ha.y + uy * r * 0.25, r * 1.0, r * 0.82, Math.atan2(uy, ux), 0, TAU);
}
// a boot or sandalled foot: heel, flat sole, rounded toe; flexed with the shin like the old foot
function animeFootPath(ctx, knee, ankle, facing, h, len) {
  let sx = ankle.x - knee.x, sy = ankle.y - knee.y; const sl = Math.sqrt(sx * sx + sy * sy) || 1; sx /= sl; sy /= sl;
  const fx = facing > 0 ? sy : -sy, fy = facing > 0 ? -sx : sx, ax = ankle.x, ay = ankle.y;
  ctx.moveTo(ax - fx * h * 0.95 - sx * h * 0.7, ay - fy * h * 0.95 - sy * h * 0.7);
  ctx.lineTo(ax - fx * h * 1.05 + sx * h * 0.95, ay - fy * h * 1.05 + sy * h * 0.95);
  ctx.lineTo(ax + fx * len * 0.92 + sx * h * 0.95, ay + fy * len * 0.92 + sy * h * 0.95);
  ctx.quadraticCurveTo(ax + fx * (len + h * 0.5) + sx * h * 0.7, ay + fy * (len + h * 0.5) + sy * h * 0.7, ax + fx * len * 0.82 - sx * h * 0.05, ay + fy * len * 0.82 - sy * h * 0.05);
  ctx.quadraticCurveTo(ax + fx * h * 0.9 - sx * h * 0.5, ay + fy * h * 0.9 - sy * h * 0.5, ax + fx * h * 0.55 - sx * h * 0.85, ay + fy * h * 0.55 - sy * h * 0.85);
  ctx.closePath();
}
// the face: a rounded crown and back of the head, a near-vertical brow, a narrow jaw to a pointed chin (+x the face side)
function animeHeadPath(ctx, r) {
  ctx.moveTo(-r * 0.94, r * 0.12);
  ctx.bezierCurveTo(-r * 1.02, -r * 0.76, -r * 0.42, -r * 1.06, r * 0.12, -r * 1.03);
  ctx.bezierCurveTo(r * 0.7, -r * 0.98, r * 0.98, -r * 0.55, r * 0.96, -r * 0.1);
  ctx.quadraticCurveTo(r * 0.99, r * 0.36, r * 0.8, r * 0.66);
  ctx.quadraticCurveTo(r * 0.6, r * 1.0, r * 0.42, r * 1.1);
  ctx.quadraticCurveTo(r * 0.04, r * 0.96, -r * 0.36, r * 0.72);
  ctx.quadraticCurveTo(-r * 0.82, r * 0.6, -r * 0.94, r * 0.12);
  ctx.closePath();
}
// a plain head for UI icons (the gear shop's helmet tiles): the face shape in one colour
function drawAnimeHead(ctx, r, col) { ctx.fillStyle = col; ctx.beginPath(); animeHeadPath(ctx, r * 0.9); ctx.fill(); }

/* ---- Kage's hair: a wild mass of long swept spikes, sweeping back and up, two bangs forward over the brow ---- */
// tip / valley pairs in head units (+x the face side); the last points close the hairline from the nape to the brow
const KAGE_HAIR = [[0.52, -0.5], [1.08, 0.02], [0.82, -0.56], [1.3, -0.5], [0.84, -0.86], [1.0, -1.36], [0.42, -1.06], [0.08, -1.8], [-0.02, -1.1],
  [-0.78, -1.74], [-0.5, -1.0], [-1.56, -1.36], [-0.88, -0.66], [-2.08, -0.66], [-1.02, -0.3], [-1.86, 0.2], [-0.96, 0.12], [-1.42, 0.7],
  [-0.78, 0.44], [-0.9, 1.0], [-0.44, 0.62]];
function kageHairPath(ctx, r) {
  const H = KAGE_HAIR;
  ctx.moveTo(H[0][0] * r, H[0][1] * r);
  for (let i = 1; i < H.length; i++) {
    const p = H[i], q = H[i - 1];
    // edges bow back and up so the spikes read swept, not a crown
    ctx.quadraticCurveTo((p[0] + q[0]) / 2 * r - 0.12 * r, (p[1] + q[1]) / 2 * r - 0.07 * r, p[0] * r, p[1] * r);
  }
  ctx.quadraticCurveTo(-0.2 * r, 0.2 * r, 0.05 * r, -0.2 * r);
  ctx.quadraticCurveTo(0.25 * r, -0.45 * r, H[0][0] * r, H[0][1] * r);
  ctx.closePath();
}
function drawKageHair(ctx, r, ink, flat, f) {
  const A = f && f._A, pal = A && A.pal;
  if (flat || !A || A.flat) { ctx.fillStyle = flat ? ink : (pal ? pal.hair[1] : ink); ctx.beginPath(); kageHairPath(ctx, r); ctx.fill(); return; }
  // celFill works in the rotated head frame, so the light is turned into it too
  const sv = [A.lx, A.ly], hl = f.headRot || 0, c = Math.cos(-hl), sn = Math.sin(-hl);
  A.lx = (sv[0] * c - sv[1] * sn) * A.f; A.ly = sv[0] * sn + sv[1] * c;
  celFill(ctx, () => kageHairPath(ctx, r), pal.hair, A, { sd: r * 0.32, hd: r * 0.06, rim: true, detail: (g) => {
    // a few lit strands from the crown out along the upper spikes
    g.strokeStyle = pal.hair[2]; g.lineWidth = Math.max(0.8, r * 0.05); g.lineCap = 'round';
    g.beginPath();
    for (const [x0, y0, x1, y1, cx, cy] of [[0.2, -0.75, 1.1, -1.3, 0.7, -1.15], [0.0, -0.8, 0.26, -1.68, 0.05, -1.3], [-0.3, -0.72, -1.2, -1.32, -0.75, -1.15], [-0.4, -0.45, -1.75, -0.74, -1.1, -0.68], [0.35, -0.6, 1.3, -0.6, 0.85, -0.7]]) {
      g.moveTo(x0 * r, y0 * r); g.quadraticCurveTo(cx * r, cy * r, x1 * r, y1 * r);
    }
    g.stroke();
  } });
  A.lx = sv[0]; A.ly = sv[1];
}

/* ---- embroidery: crimson cloud swirls and a wave band, clipped to the cloth panel by the caller ---- */
function cloudMotif(ctx, x, y, R, rot, col, lw) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 26; i++) { const a = i / 26 * Math.PI * 3.1, rr = R * (0.12 + 0.88 * i / 26); const px = Math.cos(a) * rr, py = Math.sin(a) * rr * 0.86; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.quadraticCurveTo(R * 1.6, R * 0.2, R * 2.1, -R * 0.5);   // the swirl's tail
  ctx.stroke();
  // two lobes of the cloud round it
  ctx.beginPath(); ctx.arc(-R * 0.9, R * 0.55, R * 0.62, Math.PI * 0.6, Math.PI * 1.75); ctx.stroke();
  ctx.beginPath(); ctx.arc(R * 0.5, R * 1.05, R * 0.55, Math.PI * 0.1, Math.PI * 1.05); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-R * 1.45, R * 0.15, lw * 0.9, 0, TAU); ctx.fill();
  ctx.restore();
}

/* ---- the coat panels (Kage): cloth chains from the waist, flared to the hem ---- */
const _cpL = new Float32Array(32), _cpR = new Float32Array(32);
function coatEdges(cl, w0, w1, floorY) {
  const c = cl.c, n = c.n, px = c.px, py = c.py;
  for (let i = 0; i < n; i++) {
    const a = i === 0 ? 0 : i - 1, b = i === n - 1 ? n - 1 : i + 1;
    let dx = px[b] - px[a], dy = py[b] - py[a]; const d = Math.sqrt(dx * dx + dy * dy) || 1; dx /= d; dy /= d;
    const u = i / (n - 1), w = (w0 + (w1 - w0) * Math.pow(u, 0.85)) * 0.5;
    _cpL[i * 2] = px[i] - dy * w; _cpL[i * 2 + 1] = Math.min(py[i] + dx * w, floorY);
    _cpR[i * 2] = px[i] + dy * w; _cpR[i * 2 + 1] = Math.min(py[i] - dx * w, floorY);
  }
  return n;
}
function coatPanelPath(ctx, n) {
  ctx.moveTo(_cpL[0], _cpL[1]);
  for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(_cpL[i * 2], _cpL[i * 2 + 1], (_cpL[i * 2] + _cpL[i * 2 + 2]) / 2, (_cpL[i * 2 + 1] + _cpL[i * 2 + 3]) / 2);
  ctx.lineTo(_cpL[(n - 1) * 2], _cpL[(n - 1) * 2 + 1]);
  // the hem: two shallow points (the split coat's ragged tails)
  const lx = _cpL[(n - 1) * 2], ly = _cpL[(n - 1) * 2 + 1], rx = _cpR[(n - 1) * 2], ry = _cpR[(n - 1) * 2 + 1];
  const ex = (lx + rx) / 2 + (_cpL[(n - 1) * 2] - _cpL[(n - 2) * 2]) * 0.3, ey = (ly + ry) / 2 + (_cpL[(n - 1) * 2 + 1] - _cpL[(n - 2) * 2 + 1]) * 0.3;
  ctx.lineTo(ex, ey);
  ctx.lineTo(rx, ry);
  for (let i = n - 2; i > 0; i--) ctx.quadraticCurveTo(_cpR[i * 2], _cpR[i * 2 + 1], (_cpR[i * 2] + _cpR[i * 2 - 2]) / 2, (_cpR[i * 2 + 1] + _cpR[i * 2 - 1]) / 2);
  ctx.lineTo(_cpR[0], _cpR[1]);
  ctx.closePath();
}
Fighter.prototype.drawCoatPanel = function (ctx, part, A, skin, U) {
  const cl = this.cloths.find(c => c.kind === 'coat' && c.part === part);
  if (!cl || !cl.c.init) return;
  const back = part === 'back', co = skin.coat;
  const n = coatEdges(cl, (back ? co.w0 : co.fw0) * U, (back ? co.w1 : co.fw1) * U, this.y + 2 * A.s);
  const pal = A.pal, f = this.facing;
  celFill(ctx, () => coatPanelPath(ctx, n), back ? pal.coatB : pal.coat, A, { sd: (back ? 7 : 5) * U, hd: back ? 0 : 0.9 * U, rim: true, detail: (g) => {
    // the crimson lining along the open edge (whichever edge is nearer the fighter's front)
    const front = (_cpL[0] - _cpR[0]) * f > 0 ? _cpL : _cpR;
    g.strokeStyle = pal.acc; g.lineWidth = 2.2 * U; g.lineCap = 'round';
    g.beginPath(); g.moveTo(front[2], front[3]); for (let i = 2; i < n; i++) g.lineTo(front[i * 2], front[i * 2 + 1]); g.stroke();
    // fold lines running down the panel
    g.strokeStyle = back ? ANIME.cloth0 : pal.coat[0]; g.lineWidth = 1 * A.s;
    g.beginPath();
    for (const t of [0.35, 0.68]) { for (let i = 1; i < n; i++) { const x = lerp(_cpL[i * 2], _cpR[i * 2], t + Math.sin(i * 1.3 + t * 5) * 0.05), y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); } }
    g.stroke();
    if (!co.embroider) return;
    // the embroidered hem: a crimson band at the edge, a thin line over it and cloud swirls on the lower quarter
    const lx = _cpL[(n - 1) * 2], ly = _cpL[(n - 1) * 2 + 1], rx = _cpR[(n - 1) * 2], ry = _cpR[(n - 1) * 2 + 1];
    const ux = lx - _cpL[(n - 2) * 2], uy = ly - _cpL[(n - 2) * 2 + 1], ul = Math.hypot(ux, uy) || 1;
    const ox = ux / ul, oy = uy / ul;
    g.strokeStyle = pal.acc; g.lineWidth = 3.2 * U;
    g.beginPath(); g.moveTo(lx + ox * 2 * U - (rx - lx) * 0.3, ly + oy * 2 * U - (ry - ly) * 0.3); g.lineTo(rx + ox * 2 * U + (rx - lx) * 0.3, ry + oy * 2 * U + (ry - ly) * 0.3); g.stroke();
    g.lineWidth = 0.9 * U;
    g.beginPath(); g.moveTo(lx - ox * 3.4 * U - (rx - lx) * 0.3, ly - oy * 3.4 * U - (ry - ly) * 0.3); g.lineTo(rx - ox * 3.4 * U + (rx - lx) * 0.3, ry - oy * 3.4 * U + (ry - ly) * 0.3); g.stroke();
    const rot = Math.atan2(ry - ly, rx - lx);
    const mot = back ? [[n - 2.1, 0.28, 4.6], [n - 1.9, 0.7, 4.2], [n - 3.1, 0.5, 3.4], [n - 1.3, 0.5, 3]] : [[n - 2, 0.45, 3.6], [n - 1.4, 0.8, 2.8]];
    for (const [i, t, R] of mot) {
      const i0 = Math.floor(i), k = i - i0, i1 = Math.min(n - 1, i0 + 1);
      const x = lerp(lerp(_cpL[i0 * 2], _cpR[i0 * 2], t), lerp(_cpL[i1 * 2], _cpR[i1 * 2], t), k);
      const y = lerp(lerp(_cpL[i0 * 2 + 1], _cpR[i0 * 2 + 1], t), lerp(_cpL[i1 * 2 + 1], _cpR[i1 * 2 + 1], t), k);
      cloudMotif(g, x, y, R * U, rot + (t > 0.5 ? 0.4 : -0.3), pal.acc, 1.35 * U);
    }
  } });
};

/* ---- the body ---- */
Fighter.prototype.silhouette = function (ctx, front, back, flat, opt) {
  const sk = this.sk, s = this.scale, b = this.build, f = this.facing;
  const skin = animeSkin(this), A = animeState(this, front, flat, opt), pal = A.pal, ord = skin.order, hol = skin.hollow;
  const big = b.w >= 16 ? 1.45 : b.w >= 13 ? 1.2 : 1;
  const L = b.w * s * 0.42 * (b.w >= 13 ? 1.15 : 1), T = L * 1.25 * big;   // the old limb units: armour overlays are sized by them
  const U = s * clamp(b.w / 10, 0.9, 1.75) * (b.w >= 13 ? 1.08 : 1);       // clothing unit (px per design unit)
  const hr = BODY.head * s * b.head, S = animeSpine(this);
  A.S = S; A.U = U;   // armour parts drawn from drawArmor / drawHelmet (22-anime-order.js) share the spine frame
  const akari = this.helmet === 'akari_mask', slv = skin.sleeve || 1, boot = skin.feet === 'boot';
  const ov = flat ? { color: front } : opt;
  const fabB = pal.back, fab = pal.fab, coatT = skin.top === 'coat' ? pal.coat : pal.fab;
  const armInk = flat ? front : this.isPlayer ? pal.metal[1] : (pal.armor || front);
  this.headRot = this._ghostHead != null ? this._ghostHead : (this.pose.lean + this.pose.head + this.pose.rot + this.extraRot) * DEG * f;

  // --- 1. the coat's back panel, behind everything
  if (skin.coat) this.drawCoatPanel(ctx, 'back', A, skin, U);
  if (hol) { this.hollowRobe(ctx, A, skin, U, 'cape'); this.hollowRobe(ctx, A, skin, U, 'back'); }   // 23-anime-hollow.js
  subLayer(this, ctx, A, skin, U, 'back');   // capes, banners, robes behind the body (24-anime-subs-a.js)
  subBLayer(this, ctx, A, skin, U, 'back');   // 25-anime-subs-b.js
  // --- 2. the far arm: sleeve, cuff, hand (then any off-hand weapon)
  this.animeArm(ctx, sk.shB, sk.bel, sk.bha, A, skin, U * slv, true);
  this.drawOffhand(ctx, front, flat ? Object.assign({}, opt, { color: front }) : opt);
  // --- 3. the far leg
  this.animeLeg(ctx, sk.hipB, sk.bkn, sk.bft, A, skin, U, true);
  // --- 4. the torso (Akari's figure is her garb's own cut, drawArmor 'mei_en')
  if (!akari) this.animeTorsoDraw(ctx, S, A, skin, U, coatT);
  if (ord) this.orderKusazuri(ctx, S, A, U, 'back');
  drawArmor(ctx, this, armInk, ov, T * 1.25);
  // --- 5. the near leg, then the coat's near flap over its thigh (the Order: the front kusazuri plates)
  this.animeLeg(ctx, sk.hipF, sk.fkn, sk.fft, A, skin, U, false);
  if (ord) this.orderKusazuri(ctx, S, A, U, 'front');
  subLayer(this, ctx, A, skin, U, 'front');
  subBLayer(this, ctx, A, skin, U, 'front');
  if (skin.coat) this.drawCoatPanel(ctx, 'flap', A, skin, U);
  if (hol) this.hollowRobe(ctx, A, skin, U, 'flap');
  // --- 6. sash / obi and the saya at the hip
  if (skin.sash === 'kage') this.animeSash(ctx, S, A, U);
  else if (skin.sash === 'obi' && !akari) this.animeObi(ctx, S, A, U);
  else if (skin.sash === 'order') this.orderBelt(ctx, S, A, U);
  else if (hol) this.hollowSash(ctx, S, A, U, skin.sash);
  if (hol && hol.mantle) this.hollowMantle(ctx, S, A, U, hol.mantle);
  subLayer(this, ctx, A, skin, U, 'waist');
  subBLayer(this, ctx, A, skin, U, 'waist');
  remLayer(this, ctx, A, skin, U, 'waist');   // young Rem's tasuki (26-anime-rem.js)
  if (this.outfit === 'gi' && !flat && skin.sash !== 'kage' && !skin.noGiSash) this.drawSash(ctx, T);
  if (skin.saya && this.hasWeapon) this.animeSaya(ctx, S, A, U);
  // --- 7. neck, collar and scarf wrap
  this.animeNeck(ctx, S, A, skin, U, hr);
  // --- 8. the head: black face, hair or helmet, white eyes
  ctx.save(); ctx.translate(sk.head.x, sk.head.y); ctx.rotate(this.headRot); ctx.scale(f, 1);
  const takashi = bossLook(this) === 'takashi';
  ctx.fillStyle = flat ? front : ANIME.face; ctx.beginPath();
  if (akari) akariHeadPath(ctx, hr); else if (takashi) takashiHeadPath(ctx, hr); else animeHeadPath(ctx, hr * 0.9);
  ctx.fill();
  if (takashi) drawTakashiBeard(ctx, hr, front, flat);
  drawHelmet(ctx, this.helmet, hr, flat ? front : this.isPlayer ? pal.metal[1] : (pal.armor || front), ov, this);
  if (!flat && !opt.noEyes) drawEyes(ctx, this, hr, opt);
  ctx.restore();
  // --- 9. the near arm, the weapon in its hand, and the hands closed over the grip
  this.animeArm(ctx, sk.shF, sk.fel, sk.fha, A, skin, U * slv, false, true);
  if (this.weaponId() === 'iron_fists' || this.weaponId() === 'storm_orbs') this.drawFistGear(ctx, front, ov);
  this.drawMainWeapon(ctx, front, flat ? Object.assign({}, opt, { color: front }) : opt);
  const grip = this.shape() !== 'none' && this.weaponId() !== 'iron_fists';
  if (grip) {
    this.animeHand(ctx, sk.fel, sk.fha, A, U, false);
    if (this.pose.ik > 0.5 && IK_OFF[this.shape()] != null) this.animeHand(ctx, sk.bel, sk.bha, A, U, true);
  }
};

// the arm, sleeve first: a full upper sleeve with a shoulder seam and creases, a forearm sleeve that bunches at the
// elbow and flares to its opening (Kage's ends in a crimson cuff), a dark strapped kote under it and a small glove on
// the grip. `far` is the arm behind the body: one tone darker and no detail lines.
Fighter.prototype.animeArm = function (ctx, sh, el, ha, A, skin, U, far, noHand) {
  const pal = A.pal, tone = far ? pal.back : skin.top === 'coat' ? pal.coat : pal.fab, gi = skin.top !== 'coat';
  const ex = ha.x - el.x, ey = ha.y - el.y, fl = Math.hypot(ex, ey) || 1, fnx = -ey / fl, fny = ex / fl;
  const at = (u, o) => ({ x: el.x + ex * u + fnx * o, y: el.y + ey * u + fny * o });
  // upper sleeve: full at the shoulder, gathered toward the elbow
  celFill(ctx, () => animeCapsule(ctx, sh, el, 8.2 * U, 6.6 * U, 1.5 * U, 0.38), tone, A, { sd: 4.2 * U, hd: far ? 0 : 1.1 * U, rim: !far, detail: far ? null : (g) => {
    const dx = el.x - sh.x, dy = el.y - sh.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    animeFold(g, A, tone, () => {
      for (const [u, o0, o1] of [[0.5, -6, 2], [0.66, -5.6, 3.4], [0.8, -5, 1.4]]) {
        g.moveTo(sh.x + dx * u + nx * o0 * U, sh.y + dy * u + ny * o0 * U); g.quadraticCurveTo(sh.x + dx * (u + 0.08) + nx * (o0 + o1) * 0.5 * U, sh.y + dy * (u + 0.08) + ny * (o0 + o1) * 0.5 * U, sh.x + dx * (u + 0.04) + nx * o1 * U, sh.y + dy * (u + 0.04) + ny * o1 * U);
      }
      g.moveTo(sh.x + dx * 0.18 + nx * 8 * U, sh.y + dy * 0.18 + ny * 8 * U); g.quadraticCurveTo(sh.x + dx * 0.27, sh.y + dy * 0.27, sh.x + dx * 0.18 - nx * 8 * U, sh.y + dy * 0.18 - ny * 8 * U);
    });
  } });
  // the Order's sode over the upper sleeve (22-anime-order.js)
  if (skin.order && skin.order.sode) this.orderSode(ctx, sh, el, A, U / (skin.sleeve || 1), far, skin.order.sode);
  else { subSode(this, ctx, sh, el, A, U / (skin.sleeve || 1), far); subBSode(this, ctx, sh, el, A, U / (skin.sleeve || 1), far); }   // 24- / 25-anime-subs-*.js
  // the kote: a dark lacquered forearm guard from under the sleeve to the wrist, two dark straps with crimson cord
  const hol = skin.hollow, bare = hol && hol.bare;
  if (skin.kote === 'wrap') this.hollowWrap(ctx, at(bare ? 0.02 : 0.3, 0), at(bare ? 0.92 : 0.9, 0), (bare ? 5.4 : 4.4) * U, (bare ? 4.6 : 3.6) * U, A, U, far);
  else if (skin.kote) {
    const a = at(0.3, 0), b = at(0.9, 0);
    celFill(ctx, () => animeCapsule(ctx, a, b, 4.4 * U, 3.6 * U, 0.4 * U, 0.4), far ? [ANIME.metal0, ANIME.metal0, ANIME.metal1] : pal.metal, A, { sd: 2.2 * U, hd: far ? 0 : 0.8 * U, detail: far ? null : (g) => {
      const straps = () => { g.beginPath(); for (const k of [0.62, 0.84]) { const p = at(k, 5 * U), q = at(k + 0.05, -5 * U); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); } g.stroke(); };
      g.strokeStyle = '#030303'; g.lineWidth = 1.6 * U; straps();
      g.strokeStyle = pal.acc; g.lineWidth = 0.6 * A.s; straps();
    } });
  }
  // forearm sleeve: bunched at the elbow, flaring to the opening (a wide kimono sleeve on the gi, the coat sleeve on Kage)
  const u1 = skin.kote ? (gi ? 0.5 : 0.56) : 0.8, r0 = 6.2 * U, r1 = (gi ? 8.4 : 6.8) * U, m = at(u1, 0);
  if (bare) {
    // the husk's sleeve is torn off at the elbow over a bare, bound forearm
    const ux = el.x - sh.x, uy = el.y - sh.y, ul = Math.hypot(ux, uy) || 1, nx = -uy / ul * 6.6 * U, ny = ux / ul * 6.6 * U;
    this.hollowCuff(ctx, { x: el.x + nx, y: el.y + ny }, { x: el.x - nx, y: el.y - ny }, ux / ul, uy / ul, A, tone, U, far, hol.fray);
  } else celFill(ctx, () => animeCapsule(ctx, el, m, r0, r1, 0.4 * U, 0.4), tone, A, { sd: 3.6 * U, hd: far ? 0 : 0.9 * U, rim: !far, detail: far ? null : (g) => {
    animeFold(g, A, tone, () => {
      for (const [u, o0, o1] of [[0.04, 5.4, -3], [0.18, -5.6, 2.6], [u1 * 0.6, 6, -1]]) {
        const p = at(u, o0 * U), q = at(u + 0.1, o1 * U), c = at(u + 0.1, (o0 + o1) * 0.2 * U); g.moveTo(p.x, p.y); g.quadraticCurveTo(c.x, c.y, q.x, q.y);
      }
    });
  } });
  // the sleeve opening: Kage's crimson cuff band, or the gi's dark inner lining (a Hollow's sleeve is torn into points)
  if (hol && !bare) this.hollowCuff(ctx, at(u1, r1 * 0.98), at(u1, -r1 * 0.98), ex / fl, ey / fl, A, tone, U, far, hol.fray);
  else if (!far && !hol) {
    celFill(ctx, () => { const p0 = at(u1 - 0.08, r1 * 0.96), p1 = at(u1 + 0.01, r1 * 1.02), p2 = at(u1 + 0.01, -r1 * 1.02), p3 = at(u1 - 0.08, -r1 * 0.96), pc = at(u1 + 0.05, 0); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.quadraticCurveTo(pc.x, pc.y, p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath(); }, skin.cuff ? ['#4a0c10', ANIME.crimson, pal.accHi] : [pal.back[0], pal.back[1], tone[0]], A, { sd: 1.6 * U, hd: skin.cuff ? 0.7 * U : 0, detail: skin.cuff ? (g) => {
      g.strokeStyle = '#30080b'; g.lineWidth = 0.8 * A.s; g.beginPath(); const p = at(u1 - 0.05, r1), q = at(u1 - 0.05, -r1); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
    } : null });
  }
  if (!noHand && !(far && this.pose.ik > 0.5 && IK_OFF[this.shape()] != null)) this.animeHand(ctx, el, ha, A, U, far);
};
// a small dark glove closed round the grip, the fingers implied by one line
Fighter.prototype.animeHand = function (ctx, el, ha, A, U, far) {
  if (this.weaponId() === 'iron_fists' && this.hollow && animeSkin(this).hollow) { this.hollowFist(ctx, el, ha, A, U, far); return; }
  if (this.weaponId() === 'iron_fists') { this.subFist(ctx, el, ha, A, U, far); return; }   // the iron tekko (24-anime-subs-a.js)
  const pal = A.pal, glove = far ? [ANIME.cloth0, ANIME.cloth0, ANIME.cloth1] : [ANIME.cloth0, ANIME.cloth1, ANIME.cloth2];
  celFill(ctx, () => animeHandPath(ctx, el, ha, 2.9 * U), this.weaponId() === 'iron_fists' ? pal.metal : glove, A, { sd: 1.4 * U, hd: 0.6 * U, detail: (g) => {
    const dx = ha.x - el.x, dy = ha.y - el.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    g.strokeStyle = ANIME.cloth2; g.lineWidth = 0.7 * A.s; g.beginPath();
    g.moveTo(ha.x + ux * 1.6 * U - uy * 2.3 * U, ha.y + uy * 1.6 * U + ux * 2.3 * U); g.lineTo(ha.x + ux * 1.6 * U + uy * 2.3 * U, ha.y + uy * 1.6 * U - ux * 2.3 * U); g.stroke();
  } });
};
// wide split hakama: a full thigh and a shin that stays wide to the ankle (bloused into Kage's tall boots), pleat
// lines, then the boot (Kage) or tabi and straw sandal (everyone else)
Fighter.prototype.animeLeg = function (ctx, hp, kn, ft, A, skin, U, far) {
  const pal = A.pal, tone = far ? pal.back : pal.fab, f = this.facing, boot = skin.feet === 'boot', lw = (skin.hollow && skin.hollow.legW) || 1;
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
  const btone = far ? [pal.boot[0], pal.boot[0], pal.boot[1]] : pal.boot;
  if (boot) {
    const bt = { x: lerp(kn.x, ft.x, 0.42), y: lerp(kn.y, ft.y, 0.42) };
    celFill(ctx, () => { animeCapsule(ctx, bt, ft, 6.2 * U, 5.0 * U, 0.3 * U, 0.4); }, btone, A, { sd: 2.6 * U, hd: far ? 0 : 0.7 * U, detail: far ? null : (g) => {
      // two dark straps with a dull buckle edge
      const dx = ft.x - bt.x, dy = ft.y - bt.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      const straps = () => { g.beginPath(); for (const k of [0.38, 0.64]) { g.moveTo(bt.x + dx * k + nx * 6.4 * U, bt.y + dy * k + ny * 6.4 * U); g.lineTo(bt.x + dx * (k + 0.1) - nx * 6.4 * U, bt.y + dy * (k + 0.1) - ny * 6.4 * U); } g.stroke(); };
      g.strokeStyle = '#030303'; g.lineWidth = 1.6 * U; straps();
      g.strokeStyle = ANIME.metal2; g.lineWidth = 0.6 * A.s; straps();
    } });
  }
  celFill(ctx, () => animeFootPath(ctx, kn, ft, f, 5 * U, 12.5 * U), btone, A, { sd: 1.8 * U, detail: (g) => {
    // the sole: a dull edge along the floor (a straw sole on sandals)
    let sx = ft.x - kn.x, sy = ft.y - kn.y; const sl = Math.hypot(sx, sy) || 1; sx /= sl; sy /= sl;
    const fx = f > 0 ? sy : -sy, fy = f > 0 ? -sx : sx, h = 4.6 * U;
    g.strokeStyle = boot ? ANIME.metal1 : '#3e3326'; g.lineWidth = 1.4 * U; g.beginPath();
    g.moveTo(ft.x - fx * h + sx * h * 0.85, ft.y - fy * h + sy * h * 0.85); g.lineTo(ft.x + fx * 11 * U + sx * h * 0.85, ft.y + fy * 11 * U + sy * h * 0.85); g.stroke();
  } });
};
// the base obi: a dark wrapped band at the waist with thin crimson edges
Fighter.prototype.animeObi = function (ctx, S, A, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const band = (u0, u1, w0, w1) => { const a = P(u0, -w0), b = P(u0, w1), c = P(u1, w1), d = P(u1, -w0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  celFill(ctx, () => band(0.0, 0.17, 12.8, 11.8), [ANIME.cloth0, '#151112', '#2a2324'], A, { sd: 3 * U, hd: 0.6 * U, detail: (g) => {
    g.strokeStyle = A.pal.acc; g.lineWidth = 1 * A.s; g.beginPath();
    for (const u of [0.03, 0.145]) { const a = P(u, -12.8), b = P(u, 11.8); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  } });
};
Fighter.prototype.animeTorsoDraw = function (ctx, S, A, skin, U, tone) {
  const pal = A.pal, coat = skin.top === 'coat';
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  celFill(ctx, () => animeTorso(ctx, S, coat ? ANIME_TORSO.coat : ANIME_TORSO.gi, U), tone, A, { sd: 7.5 * U, hd: 1 * U, rim: true, detail: (g) => {
    const line = (pts, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
    const poly = (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
    if (coat && skin.rem) return;   // Rem's travel coat is wrapped shut: its front is drawArmor 'travel_coat' (26-anime-rem.js)
    if (coat) {
      // the open front: the black inner kimono between the coat's lapel and the chest, its own crossed collar
      poly([P(1.06, 1.2), P(1.06, 12), P(0.1, 12), P(0.12, 5.6), P(0.62, 4.2)], pal.fab[1]);
      line([P(1.0, 3.2), P(0.66, 7.4)], pal.fab[2], 1.1 * A.s);
      line([P(0.96, 5.6), P(0.72, 8.6)], pal.fab[0], 1 * A.s);
      // the coat's lapel edge catching the light, and a crimson piping inside it
      line([P(1.06, 1.2), P(0.62, 4.2), P(0.12, 5.6)], pal.coat[2], 1.5 * U);
      line([P(1.02, 2.4), P(0.62, 5.2), P(0.14, 6.6)], pal.acc, 0.8 * U);
      // folds from the armpit and an embroidered cloud crest on the back
      line([P(0.8, -2.5), P(0.5, -4), P(0.3, -3.2)], pal.coat[0], 1 * A.s);
      cloudMotif(g, P(0.66, -6.6)[0], P(0.66, -6.6)[1], 2.6 * U, 0.3, pal.acc, 1 * U);
    } else {
      // the kimono's crossed collar and a fold
      line([P(1.04, 0.5), P(0.62, 6.6), P(0.3, 8.6)], pal.fab[2], 1.4 * U);
      line([P(1.0, 4.4), P(0.74, 8.4)], pal.fab[0], 1 * A.s);
      line([P(0.8, -2.5), P(0.5, -4), P(0.3, -3.2)], pal.fab[0], 1 * A.s);
    }
  } });
};
// Kage's crimson sash with a dark leather belt over it and a silver buckle at the front
Fighter.prototype.animeSash = function (ctx, S, A, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const band = (u0, u1, w0, w1) => { const a = P(u0, -w0), b = P(u0, w1), c = P(u1, w1), d = P(u1, -w0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  celFill(ctx, () => band(0.02, 0.19, 9.8, 9.2), [ANIME.crimson, ANIME.crimsonHi, '#e0574f'], A, { sd: 4 * U, hd: 0.8 * U, detail: (g) => {
    g.strokeStyle = '#5a0f13'; g.lineWidth = 0.9 * A.s; g.beginPath();
    for (const u of [0.07, 0.14]) { const a = P(u, -9.8), b = P(u + 0.02, 9.2); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  } });
  celFill(ctx, () => band(0.085, 0.13, 10, 9.6), [ANIME.cloth0, '#120d0c', '#2e2421'], A, { sd: 1 * U });
  if (A.flat) return;
  const c = P(0.108, 8.2), v = P(0.108, 9.6);
  ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(Math.atan2(S.dy, S.dx) + Math.PI / 2);
  ctx.fillStyle = ANIME.silver; ctx.fillRect(-2.2 * U, -1.6 * U, 4.4 * U, 3.2 * U);
  ctx.fillStyle = ANIME.cloth0; ctx.fillRect(-1.2 * U, -0.7 * U, 2.4 * U, 1.4 * U);
  ctx.fillStyle = ANIME.silverHi; ctx.fillRect(-2.2 * U, -1.6 * U, 4.4 * U, 0.6 * U);
  ctx.restore(); void v;
};
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
// the neck (black like the face), the coat's high collar behind it, Kage's scarf wound round it
Fighter.prototype.animeNeck = function (ctx, S, A, skin, U, hr) {
  const sk = this.sk, pal = A.pal;
  const n0 = { x: spX(S, 0.96, 0), y: spY(S, 0.96, 0) }, n1 = { x: lerp(sk.neck.x, sk.head.x, 0.62), y: lerp(sk.neck.y, sk.head.y, 0.62) };
  ctx.fillStyle = A.flat ? A.col : ANIME.face; ctx.beginPath(); animeCapsule(ctx, n0, n1, 3.6 * U, 3.2 * U, 0, 0.5); ctx.fill();
  if (skin.collar) {
    // a tall stiff collar standing up behind the neck, open at the throat
    const c0 = { x: spX(S, 0.95, -2.6 * U), y: spY(S, 0.95, -2.6 * U) }, c1 = { x: lerp(sk.neck.x, sk.head.x, 0.55) - S.nx * 3 * U, y: lerp(sk.neck.y, sk.head.y, 0.55) - S.ny * 3 * U };
    celFill(ctx, () => animeCapsule(ctx, c0, c1, 5.6 * U, 4.6 * U, 0.4 * U, 0.5), pal.coat, A, { sd: 2.6 * U, hd: 0.7 * U, rim: true });
  }
  if (skin.wrap) {
    // the scarf: a red band wound twice round the neck, its tails are cloth
    const w0 = { x: lerp(n0.x, n1.x, 0.05), y: lerp(n0.y, n1.y, 0.05) }, w1 = { x: lerp(n0.x, n1.x, 0.75), y: lerp(n0.y, n1.y, 0.75) };
    celFill(ctx, () => animeCapsule(ctx, w0, w1, 6.2 * U, 5.2 * U, 0.6 * U, 0.5), ['#8e1a1f', ANIME.scarf, '#ea6a5f'], A, { sd: 3.4 * U, hd: 1 * U, detail: (g) => {
      g.strokeStyle = '#6e1216'; g.lineWidth = 1 * A.s; g.beginPath();
      const mx = lerp(w0.x, w1.x, 0.5), my = lerp(w0.y, w1.y, 0.5);
      g.moveTo(mx + S.nx * 6 * U - S.ux * 1.4 * U, my + S.ny * 6 * U - S.uy * 1.4 * U); g.quadraticCurveTo(mx, my + 1.6 * U, mx - S.nx * 6 * U + S.ux * 1.6 * U, my - S.ny * 6 * U + S.uy * 1.6 * U); g.stroke();
    } });
  }
};

/* ---- the eyes: two short, sharp, slightly upswept almonds that glow white; narrowed while attacking ---- */
function drawEyes(ctx, f, r, opt) {
  if (opt.color || f.helmet === 'witness_mask' || f.helmet === 'akari_mask') return;   // the Witness's and Akari's eyes are part of their masks
  if (f.eye === 'rgba(0,0,0,0)') return;   // a decoy or clone: no light behind the eyes
  const squint = f.state === 'move' || f.state === 'ability' ? 0.55 : f.state === 'hit' || f.state === 'stun' ? 0.75 : 1;
  const rf = r * 0.9, glow = f.hollow ? 'rgba(185,150,255,0.4)' : 'rgba(244,241,234,0.16)';
  const eye = (x, y, w, h) => {
    ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h * 0.15);
    ctx.quadraticCurveTo(x + w * 0.05, y - h * 0.85, x - w * 0.5, y - h * 0.55);   // the top lid sweeps up to the outer corner
    ctx.quadraticCurveTo(x - w * 0.05, y + h * 0.75, x + w * 0.5, y + h * 0.15);
    ctx.closePath();
  };
  ctx.save();
  const ey = rf * 0.08;
  // the soft halo, then the eyes themselves
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = glow;
  eye(rf * 0.48, ey, rf * 0.5, rf * 0.34 * squint); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = f.telegraph > 0 ? '#ffffff' : ANIME.eye;
  eye(rf * 0.48, ey, rf * 0.36, rf * 0.2 * squint); ctx.fill();
  eye(rf * 0.88, ey - rf * 0.03, rf * 0.14, rf * 0.16 * squint); ctx.fill();
  if (f.telegraph > 0) { ctx.strokeStyle = f.eye; ctx.lineWidth = 2; const fl = r * (1 + 0.3 * Math.sin(f.time * 50)); ctx.beginPath(); ctx.moveTo(r * 0.45 - fl, ey); ctx.lineTo(r * 0.45 + fl, ey); ctx.moveTo(r * 0.45, ey - fl * 0.5); ctx.lineTo(r * 0.45, ey + fl * 0.5); ctx.stroke(); }
  ctx.restore();
}

/* ---- layers: a translucent fighter or afterimage is drawn opaque into an offscreen canvas, then composited once, so
   its overlapping parts never show through each other ---- */
const _animeLayers = [];
function animeLayer(ctx, alpha, idx, fn) {
  const cv = ctx.canvas;
  if (!cv || typeof document === 'undefined' || !ctx.getTransform) { ctx.save(); ctx.globalAlpha *= alpha; fn(ctx); ctx.restore(); return; }
  let L = _animeLayers[idx];
  if (!L) { L = document.createElement('canvas'); _animeLayers[idx] = L; }
  if (L.width !== cv.width || L.height !== cv.height) { L.width = cv.width; L.height = cv.height; }
  const g = L.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, L.width, L.height);
  g.setTransform(ctx.getTransform()); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.lineCap = 'round'; g.lineJoin = 'round';
  fn(g);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= alpha; ctx.drawImage(L, 0, 0); ctx.restore();
}
// 'rgba(r,g,b,a)' / '#rrggbb' -> [opaque colour, alpha]
const _colA = {};
function splitAlpha(c) {
  let v = _colA[c]; if (v) return v;
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (m) { const p = m[1].split(',').map(x => x.trim()); v = [`rgb(${p[0]},${p[1]},${p[2]})`, p[3] != null ? +p[3] : 1]; } else v = [c, 1];
  return (_colA[c] = v);
}
// an afterimage (Effects.afterimage): the fighter's packed render pose from that moment, drawn as one flat silhouette
Fighter.prototype.drawAfterimage = function (ctx, snap, facing, headRot, color) {
  const cur = this._ghostCur || (this._ghostCur = []);
  const n = this.packRender(cur); if (snap.length < n) return;   // its cloth changed since: skip rather than misread
  const fc = this.facing;
  this.facing = facing; this.unpackRender(snap); this._ghostHead = headRot;
  this.silhouette(ctx, color, color, true, { color, noEyes: true });
  this._ghostHead = null; this.facing = fc; this.unpackRender(cur);
};
