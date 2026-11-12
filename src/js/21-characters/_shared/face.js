/* ---- the face: a clean profile on every fighter, the way Kage's is drawn (kage/shadow/head.js) ----
   One closed black shape in the head frame (head units, +x the face side, -y up): the crown, the brow, the bridge and
   tip of the nose, the lips, the chin and the jaw. It is read by its outline and by one thin strip of light down the
   front of the profile, never by lines drawn inside it.

   A character picks its face in its skin (`ANIME_SKINS.<id>.face`): the name of a FACE_PROFILES entry, or an object of
   the same fields (optionally `of: '<profile name>'` to start from one). Fields, all optional (1 / 0 is Kage's face):
     nose   length of the nose            hook  the tip drops (aquiline)        up    the tip lifts (snub)
     brow   how far the brow ridge juts   lip   how full the lips are           open  the mouth parted (0 closed .. 0.2)
     chin   how far the chin comes out    jaw   how deep and broad the jaw is   slope the forehead leans back
     light  the colour of the strip of light down the profile (false: none; or a function of the fighter);
     depth  its width in head units
   Anything that is not a face shape (a beard, a scar, war paint, a mask) stays in the character's own head.js. */
const FACE_PROFILES = {
  base:  {},                                                                    // Kage's: a short straight nose, a pointed chin
  youth: { nose: 0.8, up: 0.03, lip: 0.9, chin: 0.84, jaw: 0.94, brow: 0.5 },   // a boy's: softer everywhere
  fem:   { nose: 0.74, up: 0.05, lip: 1.25, chin: 0.8, jaw: 0.9, brow: 0.3 },   // a small lifted nose, fuller lips, a fine chin
  heavy: { nose: 0.92, lip: 1.0, chin: 1.2, jaw: 1.16, brow: 1.8 },             // a heavy brow and a block of a jaw
  elder: { nose: 1.22, hook: 0.05, lip: 0.8, chin: 1.08, jaw: 0.97, brow: 1.2, slope: 0.04 },   // a long nose, thin lips
  hawk:  { nose: 1.34, hook: 0.1, lip: 0.88, chin: 1.06, jaw: 1.04, brow: 1.6 },                // aquiline, stern
  gaunt: { nose: 1.1, lip: 0.7, chin: 1.0, jaw: 0.88, brow: 1.1, open: 0.09 }                   // hollow-cheeked, the mouth parted
};
const _faceCache = new Map();

// the profile a skin asks for (a FACE_PROFILES entry, or the skin's own object resolved over its `of`)
function faceProfile(skin) {
  const fp = skin && skin.face;
  if (!fp) return FACE_PROFILES.base;
  if (typeof fp === 'string') return FACE_PROFILES[fp] || FACE_PROFILES.base;
  let p = _faceCache.get(fp);
  if (!p) { p = Object.assign({}, FACE_PROFILES[fp.of] || FACE_PROFILES.base, fp); _faceCache.set(fp, p); }
  return p;
}

// the face path (no beginPath): r is the face radius (0.9 of the head radius on most bodies)
function animeFacePath(ctx, r, p) {
  p = p || FACE_PROFILES.base;
  const n = p.nose == null ? 1 : p.nose, lp = p.lip == null ? 1 : p.lip, ch = p.chin == null ? 1 : p.chin, jw = p.jaw == null ? 1 : p.jaw;
  const br = p.brow == null ? 1 : p.brow, open = p.open || 0, sl = p.slope || 0;
  const bx = 0.95 + 0.035 * (br - 1);                                          // the brow ridge
  const tx = 0.93 + 0.2 * n, ty = 0.36 + (p.hook || 0) - (p.up || 0);          // the tip of the nose
  const cx = 0.6 + 0.13 * (ch - 1), cy = 1.1 + 0.07 * (ch - 1) + open * 0.5;   // the point of the chin
  ctx.moveTo(-r * 0.94, r * 0.12);
  ctx.bezierCurveTo(-r * 1.02, -r * 0.76, -r * 0.42, -r * 1.06, r * (0.12 - sl), -r * 1.03);               // the crown
  ctx.bezierCurveTo(r * (0.66 - sl), -r * 0.98, r * (bx + 0.01 - sl * 0.5), -r * 0.6, r * bx, -r * 0.2);   // the forehead, the brow
  ctx.lineTo(r * 0.93, r * 0.04);                                                                          // the bridge of the nose
  ctx.lineTo(r * tx, r * ty);                                                                              // its tip
  ctx.lineTo(r * 0.94, r * (ty + 0.09));                                                                   // under the nose
  ctx.lineTo(r * (0.9 + 0.07 * lp), r * 0.6);                                                              // the upper lip
  if (open) { ctx.lineTo(r * 0.84, r * 0.645); ctx.lineTo(r * (0.89 + 0.05 * lp), r * (0.69 + open)); }    // the parted mouth, the lower lip
  ctx.lineTo(r * 0.88, r * (0.7 + open * 1.25));
  ctx.quadraticCurveTo(r * (0.86 + 0.09 * (ch - 1)), r * (0.98 + 0.04 * (ch - 1) + open * 0.6), r * cx, r * cy);   // the chin
  ctx.quadraticCurveTo(r * 0.1, r * (0.98 + 0.2 * (jw - 1) + open * 0.3), -r * (0.36 + 0.12 * (jw - 1)), r * (0.72 + 0.1 * (jw - 1)));   // the jaw
  ctx.quadraticCurveTo(-r * 0.82, r * 0.6, -r * 0.94, r * 0.12);
  ctx.closePath();
}

// the light down the profile: a warm back-of-the-stage tone on the living, the family's violet on a Hollow
function faceLight(f, prof) {
  if (typeof prof.light === 'function') return prof.light(f);   // a colour that follows the fighter (a boss phase's)
  if (prof.light != null) return prof.light;
  return f.hollow ? '#6f58c8' : '#a8705f';
}

// the face of a fighter (called in the head frame): black like the body, a thin strip of light down the profile.
// On the flat passes (outline, flash, afterimage) it is the one colour.
function animeFace(f, ctx, A, r, skin) {
  const prof = faceProfile(skin);
  ctx.beginPath(); animeFacePath(ctx, r, prof);
  if (A.flat) { ctx.fillStyle = A.col; ctx.fill(); return; }
  ctx.fillStyle = ANIME.face; ctx.fill();
  const col = faceLight(f, prof);
  if (!col) return;
  const d = Math.max(0.9, r * (prof.depth || 0.085));
  ctx.save(); ctx.clip();
  ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
  ctx.translate(-d, d * 0.14); animeFacePath(ctx, r, prof); ctx.translate(d, -d * 0.14);
  ctx.fillStyle = col; ctx.fill('evenodd');
  ctx.restore();
}

// the old skull without a profile: only for clipping a mask or a hood to the head (bosses/akari, bosses/raikon)
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

// a plain head for UI icons (the gear shop's helmet tiles): the profile in one colour
function drawAnimeHead(ctx, r, col) { ctx.fillStyle = col; ctx.beginPath(); animeFacePath(ctx, r * 0.9); ctx.fill(); }
