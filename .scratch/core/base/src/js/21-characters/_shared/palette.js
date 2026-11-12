// Values sit low on purpose (polish pass): the figure reads as near-black with a narrow separation tone, crimson accents
// and muted silver only on metal. Layers are told apart by the shadow strips, the fine dark seams celFill draws round
// every part and a thin crimson rim, not by mid-grey fabric.
const ANIME = {
  face: '#050404', cloth0: '#080606', cloth1: '#100d0d', cloth2: '#241f1e',
  char0: '#0f0d10', char1: '#1a181d', char2: '#2e2a32',
  metal0: '#0b0b0e', metal1: '#181a1f', metal2: '#363a42',
  crimson: '#8c1a20', crimsonHi: '#c4313a', scarf: '#d63e42',
  silver: '#a8adb4', silverHi: '#e2e5ea',
  rim: 'rgba(180,34,40,0.62)', eye: '#f4f1ea', eyeGlow: 'rgba(244,241,234,0.45)', outline: '#030303'
};

// the silhouette rim of the outline pass (Fighter.draw): the stage's rim colour pulled toward deep crimson (pink for
// Hollows) and pre-mixed onto near-black, so the stamped passes stay one even, opaque, thin line
const _rimCache = {};

// (`tint`: a skin's own rim hue in place of crimson, e.g. Akari's pink)
function animeRimColor(src, hollow, tint0) {
  const key = src + (hollow ? 'h' : '') + (tint0 && !hollow ? tint0.join() : ''); let v = _rimCache[key]; if (v) return v;
  let rgb = [222, 96, 72], a = 0.75;
  const m = /rgba?\(([^)]+)\)/.exec(src);
  if (m) { const q = m[1].split(',').map(x => +x.trim()); rgb = [q[0], q[1], q[2]]; if (q[3] != null) a = q[3]; }
  else if (_hexRGB(src)) { rgb = _hexRGB(src); a = 1; }
  const tint = hollow ? [124, 92, 224] : tint0 || [184, 30, 38], k = 0.62, base = [9, 6, 6], t = clamp(a, 0, 1) * 0.86;
  const c = [0, 1, 2].map(i => rgb[i] + (tint[i] - rgb[i]) * k);
  return (_rimCache[key] = `rgb(${[0, 1, 2].map(i => Math.round(base[i] + (c[i] - base[i]) * t)).join(',')})`);
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
    // ink bodies (Kage, the bosses): black fabric, charcoal coat, dark metal — wider separation so layers read apart
    p = { fab: [ANIME.cloth0, ANIME.cloth1, ANIME.cloth2], coat: [ANIME.char0, ANIME.char1, ANIME.char2], back: ['#070606', ANIME.cloth0, '#141111'],
      coatB: ['#131114', ANIME.char0, '#2a2730'], metal: [ANIME.metal0, ANIME.metal1, ANIME.metal2], hair: ['#080606', '#110e0c', '#322a22'], boot: ['#0a0808', '#151110', '#3a3430'] };
  } else {
    // a family colour (the Order slate, the Hollow pink): the same parts in that colour's own three tones
    // pulled far down so the family colour is only a tint in near-black cloth: a generic enemy reads as a dark samurai
    // (the Hollows of ticket 04 sit deeper still: near-black cloth with only a pink cast)
    const dk = [0, 0, 0], m = deep ? (k) => _mix(rgb, dk, 1 - (1 - k) * 0.7) : (k) => _mix(rgb, dk, k);
    p = { fab: [m(0.86), m(0.72), m(0.52)], coat: [m(0.82), m(0.66), m(0.46)],
      back: [m(0.92), m(0.84), m(0.72)], coatB: [m(0.9), m(0.8), m(0.66)], metal: [ANIME.metal0, ANIME.metal1, ANIME.metal2],
      hair: [m(0.92), m(0.86), m(0.7)], boot: [m(0.92), m(0.84), m(0.66)] };
    p.armor = _mix(rgb, dk, 0.5);
  }
  p.acc = acc; p.accHi = accHi; p.rim = deep ? 'rgba(118,88,206,0.42)' : hollow ? 'rgba(150,120,240,0.56)' : ANIME.rim;
  return (_palCache[key] = p);
}

function animeState(f, front, flat, opt) {
  const A = f._A || (f._A = {});
  A.flat = flat; A.col = front; A.opt = opt; A.s = f.scale; A.f = f.facing;
  // light from the upper front of the fighter (STYLE.md): the shadow and the rim sit on the lower back
  A.lx = 0.55 * f.facing; A.ly = -0.83;
  A.pal = animePalette(f, flat ? C.ink : front);
  const sk = animeSkin(f); if (sk.acc && !flat) A.pal = subAccPal(A.pal, sk.acc);   // a sub-boss's own accent (sub-bosses/)
  if (sk.akari && !flat && !f.hollow) A.pal = akariPal(A.pal, f.petal);   // Akari's rim light, in her phase's petal colour (bosses/akari/)
  if (sk.takashi && !flat && !f.hollow) A.pal = takashiPal(A.pal);   // Takashi's plum-black robes and gold rim light (bosses/takashi/)
  if (sk.witness && !flat) A.pal = witnessPal(A.pal);   // the Witness's black-pink armour and pink rim light (bosses/witness/)
  return A;
}
