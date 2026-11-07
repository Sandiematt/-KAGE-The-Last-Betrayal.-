/* KAGE — story art: the speakers' portrait medallions and the static story illustrations, drawn in code.
   Strictly flat 2D in the game's ink style: silhouettes, flat fills, one or two cel-shade tones, no 3D or painterly
   rendering. The characters follow the anime redesign (ticket 12, docs/art-reference/STYLE.md): black faces, softly
   glowing white eyes, no nose or mouth, detailed dark clothing with a fine rim light.

   The cast is the game's own: when the game is loaded, every bust and every figure that has an in-game design is the
   real Fighter in its anime skin (20-fighter.js, 21-anime-body.js to 29w-anime-witness.js), posed with poseFighter and
   drawn exactly as in a fight (STORY_CAST, storyFighter, storyFighterBust). The module still loads on its own:
   tests/story.test.js runs it under Node, where there is no Fighter, and code-drawn anime figures stand in
   (storyAnimeBust, storyBackFigure). The two civilians (survivor, resident), the dawn walk's back views and the close-ups
   of hands and sleeves are always code-drawn, in the same part language and palette (STORY_ANI).

   SPEAKERS[id] = { name, accent, portrait(g) }    portrait draws a bust into a 100 x 100 box (the caller clips it
                                                   to the medallion circle and scales it).
   ILLUSTRATIONS[id] = { name, paint(g) }          paint draws a full 1280 x 720 picture (the caller scales it to
                                                   cover the screen, so keep the subject inside the centre ~1000 x 560).
   Scenes (12-scenes.js) refer to both by id. Add new speakers and illustrations here. */

const STORY_INK = {
  void: '#0a0908', ink: '#030303', ink2: '#15110f', ash: '#3a342b', ash2: '#5a5045', bone: '#ece5d3', boneDim: '#bfb59f',
  gold: '#c9a45c', goldDim: '#7d6638', ember: '#a3302a', emberBright: '#d24a3c', moon: '#b8332a',
  violet: '#8a5cc9', violetDim: '#3e2a5c', violetGlow: '#c6a2ff', purple: '#6c3d9a', sepia: '#c8b48c', sepiaDark: '#8c7856'
};
// the anime redesign's palette tokens (STYLE.md; the values of ANIME in 20-fighter.js, repeated here so this module
// stays self-contained), plus Rem's violet and band, Akari's violet and Takashi's straw
const STORY_ANI = {
  face: '#050404', cloth0: '#060505', cloth1: '#0d0b0b', cloth2: '#1b1817', char0: '#0d0c0e', char1: '#161518', char2: '#252329',
  metal0: '#09090b', metal1: '#141518', metal2: '#2c2f35', crimson: '#7e161b', crimsonHi: '#b02a31', scarf: '#c8343a',
  silver: '#9a9ea4', silverHi: '#d6d9dd', eye: '#f4f1ea', eyeGlow: 'rgba(244,241,234,0.35)', outline: '#030303',
  remAcc: '#8a5cd6', band: '#e4ded2', bandDim: '#a59e92', akari: '#b48ae6', straw: '#4e4230'
};

// tiny deterministic random source, so an illustration is the same picture every time
function storyRng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function storyPoly(g, pts, fill) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill();
}
function storyDisc(g, x, y, r, fill) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); }
function storyLine(g, pts, stroke, w) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.strokeStyle = stroke; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
}
// an inked part: the shape, then a thin ink line round it (the anime parts' interior line weight)
function storyPart(g, pts, fill, line, w) {
  storyPoly(g, pts, fill);
  g.strokeStyle = line || STORY_ANI.outline; g.lineWidth = w || 1; g.lineJoin = 'round'; g.stroke();
}

/* ======================================================================== */
/* The in-game cast                                                           */
/* ======================================================================== */
// The real fighters, built the way the game builds them (the HUD and the menus do the same with drawFighterInto). Each
// maker takes { facing, weapon }. Adult Rem has no fighter of his own in the campaign; he is the design Hollow Rem
// copies (26-anime-rem.js), built here without the Hollow family.
const STORY_CAST = {
  kage: o => makePlayerFighter(Logic.defaultSave(), { facing: o.facing, weapon: o.weapon || 'kagetsu', wlvl: 1 }),
  young_kage: o => makeYoungKage({ facing: o.facing }),
  young_rem: o => makeFighterFromEnemy('young_rem', { facing: o.facing }),
  rem: o => {
    const d = Object.assign({}, ENEMIES.hollow_rem, { id: 'rem', name: 'Rem', title: 'Rem', family: undefined, echoOf: undefined });
    return new Fighter({ def: d, name: 'Rem', weapon: o.weapon || 'kagetsu', helmet: d.helmet, armor: d.armor, build: d.build, eye: d.eye, accent: d.accent, hp: d.hp, facing: o.facing });
  },
  takashi: o => makeFighterFromEnemy('takashi', { facing: o.facing }),
  raikon: o => makeFighterFromEnemy('raikon', { facing: o.facing }),
  akari: o => makeFighterFromEnemy('akari', { facing: o.facing }),
  witness: o => makeFighterFromEnemy('witness', { facing: o.facing }),
  order: o => makeFighterFromEnemy('order_runner', { facing: o.facing })
};
// Story-only stills, not fighting stances: `rest` stands easy with the blade lowered at the side, tip forward and down;
// `shoulder` rests the blade back over the shoulder. They are put on through the fighter's ability-pose path (state
// 'ability' with a pose object), so POSES, the gameplay table, stays untouched.
const STORY_POSES = {
  rest: { lean: 3, head: 8, fs: 14, fe: 20, bs: -4, be: 30, fh: 10, fk: -6, bh: -12, bk: -6, wa: 30, tw: -0.15, ik: 0 },
  shoulder: { lean: 2, head: 6, fs: 8, fe: 12, bs: -6, be: 16, fh: 8, fk: -4, bh: -8, bk: -4, wa: 200, tw: -0.1, ik: 0 }
};
function storyPose(f, name, settle) {
  if (!STORY_POSES[name]) return poseFighter(f, name || null, settle);
  const src = Object.assign({}, BASE_POSE, STORY_POSES[name]);
  f.state = 'ability'; f.abil = { pose: src, rate: 10, t: 0 };
  for (const k of POSE_KEYS) if (src[k] != null) f.pose[k] = src[k];
  f.pose.ik = src.ik || 0;
  f.hipOffInit = false;
  f.computeSkeleton();
  for (let i = 0; i < settle; i++) { f.updatePose(STEP); f.computeSkeleton(); f.updateCloth(STEP); f.time += STEP; }
}
const storyLive = () => typeof Fighter === 'function' && typeof poseFighter === 'function' && typeof makeFighterFromEnemy === 'function';
const _storyFighters = {};
// A posed fighter, built once per look and kept, so a redraw (a resize) is the same picture. null under Node or when
// the character code fails; the caller then falls back to its code-drawn figure. Drawing only: these fighters never
// enter a fight.
function storyFighter(id, o) {
  o = o || {};
  if (!storyLive() || !STORY_CAST[id]) return null;
  const key = [id, o.pose || '', o.facing || 1, o.weapon || '', o.settle || 60].join('|');
  if (key in _storyFighters) return _storyFighters[key];
  let f = null;
  try {
    f = STORY_CAST[id]({ facing: o.facing || 1, weapon: o.weapon });
    f.x = 0; f.y = 0;
    // a still: no glitch frames, and the Witness never flickers to Kage's design
    f.glitchAmount = () => 0; f.witnessFlicker = () => false;
    storyPose(f, o.pose, o.settle || 60);
  } catch (e) { console.error('[KAGE] story figure', id, e); f = null; }
  return (_storyFighters[key] = f);
}
// draws fighter `id` with its feet at (x, y), scaled to a standing height of h px; false when there is no live fighter
function storyFigure(g, id, x, y, h, o) {
  o = o || {};
  const f = storyFighter(id, o);
  if (!f) return false;
  const sc = h / f.height();
  g.save(); g.translate(x, y); g.scale(sc, sc); g.translate(-f.x, -f.y);
  try { f.draw(g, { shadow: false, rim: o.rim || 'rgba(236,229,211,0.6)', light: o.light || { x: 0.5, y: -0.86 }, noGlitch: true }); }
  catch (e) { console.error('[KAGE] story figure', id, e); }
  g.restore();
  return true;
}
// a head-and-shoulders crop of fighter `id` for the 100 x 100 medallion (framed as the HUD's drawPortrait frames the
// live fighter): o.zoom scales the head, o.dx / o.dy shift the crop; false when there is no live fighter
function storyFighterBust(g, id, o) {
  o = o || {};
  const f = storyFighter(id, o);
  if (!f) return false;
  const hr = BODY.head * f.scale * f.build.head, sc = (22 * (o.zoom || 1)) / hr;
  g.save(); g.translate(50 + (o.dx || 0), 54 + (o.dy || 0)); g.scale(sc, sc); g.translate(-f.sk.head.x, -f.sk.head.y + hr * 0.25);
  try { f.draw(g, { shadow: false, rim: o.rim || 'rgba(240,226,200,0.9)', light: { x: 0.6, y: -0.8 }, noGlitch: true }); }
  catch (e) { console.error('[KAGE] story bust', id, e); }
  g.restore();
  return true;
}

/* ======================================================================== */
/* Code-drawn anime parts (the civilians, the back views, the Node stand-ins) */
/* ======================================================================== */
// Two short, sharp, upswept almond eyes glowing white (eye plus a soft eyeGlow halo), front view, centred on cx at
// height y. `slant` drops the inner corners (a frown, a tired lid), `w` scales them.
function storyEyes(g, color, y, slant, w, cx) {
  const A = STORY_ANI;
  y = y || 44; slant = slant || 0; w = w || 1; cx = cx || 50;
  for (const d of [-1, 1]) {
    const ix = cx + d * 3 * w, ox = cx + d * 10 * w, mx = (ix + ox) / 2;   // inner and outer corners
    g.beginPath(); g.ellipse(mx, y, 6.6 * w, 3.6 * w, 0, 0, Math.PI * 2); g.fillStyle = A.eyeGlow; g.fill();
    storyPoly(g, [ix, y + slant, mx, y - 1.5 * w + slant * 0.4, ox, y - 1.8 * w, mx + d * 0.8, y + 1.5 * w], color || A.eye);
  }
}
// The medallion's backdrop: a flat two-tone field and a flat halo behind the head.
function storyBackdrop(g, o) {
  g.fillStyle = o.bg || STORY_INK.ink2; g.fillRect(0, 0, 100, 100);
  storyDisc(g, 50, 44, 40, o.glow || 'rgba(255,255,255,0.06)');
}
// The code-drawn anime bust (front view): layered dark kimono with a crossed collar, a black face rounded at the brow
// and pointed at the chin, a fine rim on the lit edge. o.collar colours the inner collar, o.coat the outer layer.
function storyAnimeBust(g, o) {
  const A = STORY_ANI, rim = o.rim || 'rgba(236,229,211,0.5)';
  storyBackdrop(g, o);
  storyPart(g, [6, 100, 12, 82, 30, 72, 44, 70, 56, 70, 70, 72, 88, 82, 94, 100], o.coat || A.char1);   // shoulders
  storyPoly(g, [7, 99, 12, 83, 29, 73, 33, 75, 21, 87, 18, 99], A.char0);                             // their shadow side
  storyPoly(g, [70, 73, 87, 83, 92, 99, 86, 99, 82, 86, 68, 76], A.char2);                            // the lit fold
  storyLine(g, [12, 82, 30, 72], rim, 1.2);
  storyPart(g, [38, 70, 50, 88, 62, 70, 66, 72, 52, 100, 34, 72], o.collar || A.crimson);            // inner collar
  storyPart(g, [34, 72, 52, 100, 42, 100, 30, 75], A.cloth1);                                        // left lapel over right
  storyPoly(g, [44, 58, 56, 58, 58, 72, 50, 82, 42, 72], A.face);                                   // neck
  g.beginPath(); g.moveTo(34, 42); g.bezierCurveTo(34, 26, 66, 26, 66, 42); g.bezierCurveTo(66, 54, 58, 62, 50, 65);
  g.bezierCurveTo(42, 62, 34, 54, 34, 42); g.closePath(); g.fillStyle = A.face; g.fill();
  g.strokeStyle = A.outline; g.lineWidth = 1; g.stroke();
  g.beginPath(); g.arc(50, 42, 16, -2.0, -0.4); g.strokeStyle = rim; g.lineWidth = 1.3; g.stroke();
}
// A crown of hair points round a front-view head centred on (50, 42): `pts` are [angle (rad, -PI/2 = up), length]
// pairs from the centre (Kage's tall starburst, Rem's lower back-swept wedge), with fine lit strands and a rim on top.
function storyHair(g, pts, r0, fill, rim) {
  const A = STORY_ANI, poly = [];
  pts.forEach(([a, l], i) => {
    poly.push(50 + Math.cos(a - 0.2) * r0, 42 + Math.sin(a - 0.2) * r0, 50 + Math.cos(a) * l, 42 + Math.sin(a) * l);
    if (i === pts.length - 1) poly.push(50 + Math.cos(a + 0.2) * r0, 42 + Math.sin(a + 0.2) * r0);
  });
  storyPart(g, poly, fill || A.cloth1);
  for (const [a, l] of pts) storyLine(g, [50 + Math.cos(a) * r0 * 0.9, 42 + Math.sin(a) * r0 * 0.9, 50 + Math.cos(a) * l * 0.82, 42 + Math.sin(a) * l * 0.82], A.cloth2, 1);
  if (rim) for (const [a, l] of pts) if (Math.sin(a) < -0.3) storyLine(g, [50 + Math.cos(a - 0.14) * r0 * 1.05, 42 + Math.sin(a - 0.14) * r0 * 1.05, 50 + Math.cos(a) * l, 42 + Math.sin(a) * l], rim, 0.9);
}
// crimson embroidery (a cloud-wave pattern) along a band from (x0, y) to (x1, y), h tall: filled curls, not lines
function storyEmbroidery(g, x0, x1, y, h, col, hi) {
  const step = h * 2.2;
  for (let x = x0 + step * 0.4; x < x1 - h * 0.6; x += step) {
    g.beginPath(); g.arc(x, y, h * 0.5, Math.PI, 0); g.arc(x + h * 0.25, y, h * 0.25, 0, Math.PI, true); g.closePath();
    g.fillStyle = col; g.fill();
    storyDisc(g, x - h * 0.15, y - h * 0.12, h * 0.14, hi || col);
  }
}

// Kage or Rem seen from behind, as the anime design reads from the back (the dawn walk; and the stand-in for the
// live fighter under Node). x, y = feet; about 150 px tall at s = 1. o.stride: 0 standing .. 1 mid-stride (the near
// leg back, heel up); o.rim: the edge light (backlit by the sun ahead, the figure is dark with a warm rim); o.mirror.
function storyBackFigure(g, x, y, s, who, o) {
  const A = STORY_ANI, rem = who === 'rem';
  o = o || {};
  const st = o.stride || 0, rim = o.rim || 'rgba(236,229,211,0.55)';
  g.save(); g.translate(x, y); g.scale(s * (o.mirror ? -1 : 1), s);
  // the legs: the far one planted, the near one striding back with the heel up and the sole showing
  const leg = (hx, fx, fy, near) => {
    const lift = near ? st : 0;
    if (rem) {
      storyPart(g, [hx - 6, -66, hx + 6, -66, fx + 5, fy - 30, fx + 4, fy - 6 - lift * 4, fx - 4, fy - 6 - lift * 4, fx - 5, fy - 30], A.cloth1);   // hakama
      storyPart(g, [fx - 5, fy - 30, fx + 5, fy - 30, fx + 4, fy - 6 - lift * 4, fx - 4, fy - 6 - lift * 4], A.char1);                               // kyahan
      for (let k = 0; k < 4; k++) storyLine(g, [fx - 4.5, fy - 27 + k * 5.5 - lift * k, fx + 4.5, fy - 24 + k * 5.5 - lift * k], A.char2, 1);    // the wrapping
      storyPart(g, [fx - 5, fy - 6 - lift * 4, fx + 5, fy - 6 - lift * 4, fx + 6, fy - lift * 6, fx - 6, fy - lift * 6], A.straw);               // sandal
    } else {
      storyPart(g, [hx - 6, -66, hx + 6, -66, fx + 6, fy - 34, fx - 6, fy - 34], A.cloth1);                                                       // hakama
      storyPart(g, [fx - 6, fy - 36, fx + 6, fy - 36, fx + 5.5, fy - 2 - lift * 5, fx - 5.5, fy - 2 - lift * 5], A.cloth0);                       // tall boot
      storyLine(g, [fx - 5.5, fy - 28, fx + 5.5, fy - 29], A.metal2, 1.2); storyLine(g, [fx - 5.5, fy - 18, fx + 5.5, fy - 19], A.metal2, 1.2);   // straps
      storyPart(g, [fx - 6, fy - 3 - lift * 5, fx + 6, fy - 3 - lift * 5, fx + 6, fy - lift * 7, fx - 6, fy - lift * 7], near && st ? A.metal2 : A.cloth0);   // the sole
    }
  };
  leg(-6, -8 + st * 2, -st * 5, false);
  leg(6, 9 - st * 2, -st * 2, true);
  // the coat: Kage's long open coat to mid-calf, split up the back, the crimson embroidered hem; Rem's knee-length
  // travel coat, wrapped shut, with a mended patch
  const hem = rem ? -46 : -32, hw = rem ? 22 : 26;
  const coat = [-16, -122, 16, -122, hw, hem];
  for (let i = 1; i < 8; i++) coat.push(hw - i * hw * 2 / 8, hem + (i % 2 ? 2 : -1));
  coat.push(-hw, hem);
  storyPart(g, coat, A.char1);
  storyPoly(g, [-16, -122, -4, -122, -8, hem + 1, -hw + 1, hem], A.char0);                                // the shadowed half
  storyLine(g, [-12, -110, -18, hem + 4], A.cloth0, 1); storyLine(g, [10, -108, 16, hem + 4], A.cloth0, 1);   // folds
  if (!rem) {
    storyPoly(g, [-1.5, -74, 1.5, -74, 4, hem, -4, hem], A.cloth0);                                       // the back slit
    g.save(); storyPoly(g, coat, 'rgba(0,0,0,0)'); g.clip();
    g.fillStyle = A.crimson; g.fillRect(-hw - 2, hem - 7, hw * 2 + 4, 2);
    storyEmbroidery(g, -hw, hw, hem - 11, 7, A.crimson, A.crimsonHi);
    g.restore();
  } else {
    storyPart(g, [7, -84, 15, -85, 15, -75, 7, -74], A.char2);                                             // the mended patch
    storyLine(g, [8, -83, 14, -83.5], A.cloth0, 0.8); storyLine(g, [8, -76, 14, -76.5], A.cloth0, 0.8);
  }
  storyLine(g, [-16, -122, -hw, hem], rim, 1.2); storyLine(g, [16, -122, hw, hem], rim, 1.2);              // edge light
  // the saya at the left hip, its end angling out behind
  storyLine(g, [-12, -80, -34, -52], A.outline, 5); storyLine(g, [-12, -80, -34, -52], A.cloth2, 3);
  storyDisc(g, -34, -52, 2, A.silver);
  // the obi: Kage's crimson-lit sash and buckle show at the sides; Rem's violet-edged obi and its knot at the back
  if (rem) {
    storyPart(g, [-17, -84, 17, -86, 17, -78, -17, -76], A.cloth1);
    storyLine(g, [-17, -84, 17, -86], A.remAcc, 1.2); storyLine(g, [-17, -76, 17, -78], A.remAcc, 1.2);
    storyPart(g, [-4, -86, 4, -86, 6, -70, 1, -72, -2, -66, -5, -76], A.cloth1);
  } else storyLine(g, [-16, -84, -12, -85], A.crimsonHi, 2);
  // the arms loose at the sides, a little swing; the coat sleeves wide at the cuff, gloved hands
  for (const d of [-1, 1]) {
    const sw = d * (st * 4), cx = d * 21 + sw;
    storyPart(g, [d * 13, -120, d * 19, -118, cx + d * 4, -78, cx - d * 6, -76], A.char1);
    if (!rem) { storyPoly(g, [cx + d * 4, -82, cx - d * 6, -80, cx - d * 6, -76, cx + d * 4, -78], A.crimson); }
    else storyPoly(g, [cx + d * 4, -82, cx - d * 6, -80, cx - d * 6, -78, cx + d * 4, -80], A.remAcc);
    storyPart(g, [cx - d * 4, -77, cx + d * 3, -78, cx + d * 2, -68, cx - d * 3, -68], A.cloth0);         // the hand
    storyLine(g, [d * 19, -118, cx + d * 4, -78], rim, 1);
  }
  // the head from behind: neck, the black head, then hair (Kage's tall starburst; Rem's lower wedge laid back, under
  // the white band with its knot and long tails)
  storyPoly(g, [-5, -126, 5, -126, 6, -118, -6, -118], A.face);
  storyDisc(g, 0, -136, 12, A.face);
  const crown = rem
    ? [[-3.4, 15], [-3.0, 19], [-2.6, 21], [-2.2, 20], [-1.85, 21], [-1.5, 20], [-1.15, 21], [-0.8, 20], [-0.45, 18], [-0.1, 15], [0.6, 15], [1.2, 17], [1.6, 18], [2.0, 17], [2.5, 15]]
    : [[-3.5, 19], [-3.1, 25], [-2.7, 28], [-2.3, 26], [-1.95, 31], [-1.6, 27], [-1.25, 31], [-0.9, 27], [-0.55, 29], [-0.2, 24], [0.2, 19], [0.7, 14], [1.6, 16], [2.4, 14], [2.9, 18]];
  const hp = [];
  crown.forEach(([a, l]) => { hp.push(Math.cos(a - 0.2) * 11, -136 + Math.sin(a - 0.2) * 11, Math.cos(a) * l, -136 + Math.sin(a) * l); });
  storyPart(g, hp, A.cloth1);
  for (const [a, l] of crown) {
    storyLine(g, [Math.cos(a) * 7, -136 + Math.sin(a) * 7, Math.cos(a) * l * 0.8, -136 + Math.sin(a) * l * 0.8], A.cloth2, 1);
    if (Math.sin(a) < -0.3) storyLine(g, [Math.cos(a - 0.15) * 11, -136 + Math.sin(a - 0.15) * 11, Math.cos(a) * l, -136 + Math.sin(a) * l], rim, 0.9);
  }
  if (rem) {
    storyPart(g, [-12, -140, 12, -140, 12, -134, -12, -134], A.band);
    storyPart(g, [-3, -141, 3, -141, 3, -133, -3, -133], A.bandDim);                                      // the knot
    storyPart(g, [-1, -134, -18, -110, -12, -108, 2, -132], A.band);                                      // its tails
    storyPart(g, [1, -134, 8, -104, 13, -106, 3, -132], A.bandDim);
  } else {
    // the red scarf at the throat, both tails streaming out to one side in the wind
    storyPart(g, [-10, -126, 10, -126, 11, -119, -11, -119], A.scarf);
    storyPoly(g, [-11, -122, 11, -122, 11, -119, -11, -119], A.crimson);
    storyPart(g, [-8, -123, -30, -132, -52, -126, -66, -132, -50, -118, -30, -120, -8, -119], A.scarf);
    storyPart(g, [-8, -121, -28, -116, -44, -104, -58, -106, -42, -98, -26, -110, -8, -119], A.crimsonHi);
  }
  g.restore();
}

/* ======================================================================== */
/* Portrait medallions                                                        */
/* ======================================================================== */
// The bosses' painted faces for the dialogue medallion (src/img/face_*.webp, cut from their key art; inlined by the
// build). speakerFace(id) gives a loaded-or-loading Image, or null for a speaker without one (or a missing file).
const SPEAKER_FACES = {
  raikon: '__IMG(face_raikon.webp)__', akari: '__IMG(face_akari.webp)__',
  takashi: '__IMG(face_takashi.webp)__', witness: '__IMG(face_witness.webp)__',
  rem: '__IMG(face_rem.webp)__', rem_adult: '__IMG(face_rem.webp)__'
};
const _faceImgs = {};
function speakerFace(id) {
  const src = SPEAKER_FACES[id];
  if (typeof src !== 'string' || !src.startsWith('data:') || typeof Image === 'undefined') return null;
  if (!_faceImgs[id]) { _faceImgs[id] = new Image(); _faceImgs[id].src = src; }
  return _faceImgs[id];
}
// Each portrait draws its backdrop, then the speaker's own fighter, framed on the head (storyFighterBust); without one
// (under Node) the code-drawn anime bust with the look's hair and headgear stands in. The civilians are always drawn.
const SPEAKERS = {
  kage: {
    name: 'Kage', accent: STORY_INK.emberBright,
    portrait(g) {
      const A = STORY_ANI, bd = { bg: '#1a0d0b', glow: 'rgba(163,48,42,0.28)', rim: 'rgba(255,170,150,0.6)' };
      storyBackdrop(g, bd);
      if (storyFighterBust(g, 'kage', { pose: 'rest', dx: -4, rim: 'rgba(255,190,160,0.9)' })) return;
      storyAnimeBust(g, Object.assign({ collar: A.crimson }, bd));
      // the red scarf wound at the throat, one tail thrown back over the shoulder
      storyPart(g, [34, 62, 66, 62, 70, 72, 30, 72], A.scarf);
      storyPoly(g, [34, 68, 66, 68, 70, 72, 30, 72], A.crimson);
      storyPart(g, [30, 66, 12, 74, 4, 92, 14, 84, 30, 72], A.scarf);
      // the tall wild crown of points
      storyHair(g, [[-3.5, 30], [-3.0, 34], [-2.6, 40], [-2.2, 38], [-1.85, 42], [-1.5, 36], [-1.2, 42], [-0.85, 38], [-0.5, 36], [-0.15, 30], [0.25, 26]], 15, A.cloth1, 'rgba(210,60,60,0.7)');
      storyEyes(g, A.eye, 45, 0.8);
    }
  },
  // Young Rem (the Interlude): the training gi, the white band with its silver ring, the lower back-swept hair
  rem: {
    name: 'Rem', accent: STORY_INK.violet,
    portrait(g) {
      const A = STORY_ANI, bd = { bg: '#140d1c', glow: 'rgba(138,92,201,0.3)', rim: 'rgba(198,162,255,0.6)' };
      storyBackdrop(g, bd);
      if (storyFighterBust(g, 'young_rem', { pose: 'rest', dx: -4, rim: 'rgba(214,190,255,0.9)' })) return;
      storyAnimeBust(g, Object.assign({ collar: A.remAcc }, bd));
      storyHair(g, [[-3.3, 26], [-2.8, 32], [-2.4, 34], [-2.0, 33], [-1.6, 30], [-1.25, 28], [-0.9, 26]], 15, A.cloth1);
      storyPart(g, [33, 36, 67, 36, 67, 41, 33, 41], A.band);                                     // the white band
      g.beginPath(); g.arc(63, 38.5, 2.4, 0, Math.PI * 2); g.strokeStyle = A.silver; g.lineWidth = 1.2; g.stroke();
      storyPart(g, [33, 37, 20, 42, 14, 54, 22, 46, 33, 41], A.bandDim);                          // its tail
      storyEyes(g, A.eye, 47);
    }
  },
  // Rem as he is now (the Epilogue): the worn travel coat wrapped shut under its violet collar band, the white band
  rem_adult: {
    name: 'Rem', accent: STORY_INK.violet,
    portrait(g) {
      const A = STORY_ANI, bd = { bg: '#100c15', glow: 'rgba(138,92,201,0.16)', rim: 'rgba(198,162,255,0.4)' };
      storyBackdrop(g, bd);
      if (storyFighterBust(g, 'rem', { pose: 'rest', dx: -4, rim: 'rgba(206,182,255,0.85)' })) return;
      storyAnimeBust(g, Object.assign({ collar: A.remAcc, coat: A.char2 }, bd));
      storyHair(g, [[-3.4, 28], [-2.9, 34], [-2.5, 36], [-2.1, 35], [-1.7, 32], [-1.3, 30], [-0.9, 26]], 15, A.cloth1);
      storyPart(g, [33, 36, 67, 36, 67, 41, 33, 41], A.band);
      storyPart(g, [33, 37, 18, 44, 12, 60, 22, 48, 33, 41], A.bandDim);
      storyEyes(g, A.eye, 47, 0.8);                                                               // tired, heavy-lidded
    }
  },
  takashi: {
    name: 'Takashi', accent: STORY_INK.gold,
    portrait(g) {
      const A = STORY_ANI, K = STORY_INK, bd = { bg: '#17120a', glow: 'rgba(201,164,92,0.26)', rim: 'rgba(232,200,134,0.7)' };
      storyBackdrop(g, bd);
      if (storyFighterBust(g, 'takashi', { pose: 'rest', zoom: 0.72, dx: -4, dy: 6, rim: 'rgba(240,210,140,0.9)' })) return;
      storyAnimeBust(g, Object.assign({ collar: K.gold }, bd));
      storyPart(g, [36, 54, 64, 54, 58, 74, 50, 82, 42, 74], A.band);                             // the white beard
      storyPart(g, [2, 34, 50, 10, 98, 34], A.straw); storyLine(g, [2, 34, 98, 34], K.gold, 2);    // the kasa
      storyEyes(g, A.eye, 45, 1);
    }
  },
  raikon: {
    name: 'Raikon', accent: STORY_INK.emberBright,
    portrait(g) {
      const A = STORY_ANI, K = STORY_INK, bd = { bg: '#1c0808', glow: 'rgba(210,74,60,0.32)', rim: 'rgba(255,138,122,0.7)' };
      storyBackdrop(g, bd);
      if (storyFighterBust(g, 'raikon', { pose: 'rest', zoom: 0.76, dx: -4, dy: 6, rim: 'rgba(255,150,130,0.9)' })) return;
      storyAnimeBust(g, Object.assign({ collar: A.crimson }, bd));
      storyPart(g, [0, 36, 50, 20, 100, 36, 92, 40, 8, 40], A.cloth1); storyLine(g, [0, 37, 100, 37], K.emberBright, 2);   // jingasa
      storyPoly(g, [46, 22, 52, 4, 50, 12, 58, 2, 54, 22], K.emberBright);                       // the flame crest
      storyEyes(g, A.eye, 47, -0.6);
    }
  },
  akari: {
    name: 'Akari', accent: STORY_INK.violetGlow,
    portrait(g) {
      const A = STORY_ANI, bd = { bg: '#120b1a', glow: 'rgba(198,162,255,0.26)', rim: 'rgba(198,162,255,0.7)' };
      storyBackdrop(g, bd);
      if (storyFighterBust(g, 'akari', { pose: 'rest', dx: -4, rim: 'rgba(214,190,255,0.9)' })) return;
      storyAnimeBust(g, Object.assign({ collar: A.akari }, bd));
      storyPart(g, [64, 30, 84, 22, 92, 34, 80, 34, 88, 46, 70, 38], A.cloth1);                  // the high ponytail
      storyPart(g, [34, 40, 36, 28, 50, 24, 64, 28, 66, 40, 58, 32, 50, 34, 42, 32], A.cloth1);  // the fringe
      storyPart(g, [36, 50, 64, 50, 60, 60, 50, 64, 40, 60], A.cloth1);                          // the half-mask
      storyLine(g, [36, 50, 64, 50], A.akari, 1);
      storyEyes(g, A.eye, 45);
    }
  },
  witness: {
    name: 'The Witness', accent: STORY_INK.violetGlow,
    portrait(g) {
      const A = STORY_ANI, bd = { bg: '#0c0912', glow: 'rgba(138,92,201,0.22)', rim: 'rgba(198,162,255,0.4)' };
      storyBackdrop(g, bd);
      if (storyFighterBust(g, 'witness', { pose: 'rest', zoom: 0.8, dx: -4, dy: 4, rim: 'rgba(200,170,255,0.9)' })) return;
      storyAnimeBust(g, Object.assign({ collar: '#6a44b0' }, bd));
      storyHair(g, [[-2.9, 30], [-2.5, 40], [-2.1, 44], [-1.75, 48], [-1.4, 46], [-1.05, 42], [-0.7, 34]], 15, A.cloth0, 'rgba(198,162,255,0.8)');
      storyEyes(g, A.eye, 45, -0.8);
    }
  },
  // an outer-district survivor (Act I): an old woman under a ragged grey headcloth drawn forward round her face and
  // falling past the shoulders, a patched dark kimono, tired eyes. No in-game design: always the code-drawn bust.
  survivor: {
    name: 'Survivor', accent: STORY_INK.boneDim,
    portrait(g) {
      const A = STORY_ANI, K = STORY_INK, rim = 'rgba(214,204,182,0.5)';
      storyAnimeBust(g, { bg: '#16151a', glow: 'rgba(191,181,159,0.16)', rim, collar: '#2a2622', coat: '#1c1a1c' });
      storyPart(g, [70, 82, 80, 80, 82, 90, 72, 92], '#2a2724');                                    // a patch on the shoulder
      storyLine(g, [71, 84, 79, 82.5], '#46403a', 0.8); storyLine(g, [72, 90, 81, 88.5], '#46403a', 0.8);
      // the headcloth: over the crown, drawn in round the face, its ends falling to the chest with ragged edges
      const cloth = [26, 92, 27, 52, 30, 34, 40, 23, 50, 20, 60, 23, 70, 34, 73, 52, 74, 92, 70, 88, 67, 94, 64, 70, 64, 48, 60, 34, 50, 30, 40, 34, 36, 48, 36, 70, 33, 94, 30, 88];
      storyPart(g, cloth, K.ash);
      storyPoly(g, [27, 52, 30, 34, 40, 23, 44, 25, 36, 34, 33, 52, 31, 90, 27, 90], '#2a2620');              // its shadowed side
      storyPoly(g, [60, 23, 70, 34, 73, 52, 70, 52, 66, 36, 58, 26], K.ash2);                                 // the lit fold
      storyLine(g, [40, 24, 60, 24, 70, 34], rim, 1.2);
      storyLine(g, [44, 32, 38, 44], '#2a2620', 1); storyLine(g, [60, 34, 63, 46], '#2a2620', 1);           // folds
      storyEyes(g, A.eye, 47, 1.2, 0.85);                                                                     // tired
    }
  },
  // a resident of the City of Echoes (Act II): someone rebuilt from a stored memory: a plain cloth cap, a dark robe, a
  // faint violet doubled outline offset to one side (the memory not quite lining up), calm violet-white eyes
  resident: {
    name: 'Resident', accent: '#b9a8ff',
    portrait(g) {
      const A = STORY_ANI, rim = 'rgba(185,168,255,0.6)';
      storyAnimeBust(g, { bg: '#141020', glow: 'rgba(185,168,255,0.18)', rim, collar: '#4a3c74', coat: '#1a1626' });
      g.beginPath(); g.moveTo(38, 42); g.bezierCurveTo(38, 26, 70, 26, 70, 42); g.bezierCurveTo(70, 54, 62, 62, 54, 65);
      g.bezierCurveTo(46, 62, 38, 54, 38, 42); g.strokeStyle = 'rgba(185,168,255,0.45)'; g.lineWidth = 1.3; g.stroke();   // the doubled outline
      // the cloth cap: a soft crown tied at the side, its two short ends
      storyPart(g, [32, 40, 33, 30, 40, 23, 50, 21, 60, 23, 67, 30, 68, 40, 62, 35, 50, 33, 38, 35], '#2a2438');
      storyPoly(g, [50, 21, 60, 23, 67, 30, 68, 40, 64, 37, 62, 28], '#3a3250');
      storyPart(g, [66, 34, 76, 40, 74, 46, 68, 40], '#2a2438'); storyPart(g, [66, 36, 72, 48, 68, 50, 65, 40], '#221d30');
      storyLine(g, [36, 28, 50, 22, 62, 24], rim, 1.1);
      storyEyes(g, '#e6dcff', 47, 0, 0.92);
      storyPoly(g, [66, 50, 76, 50, 76, 53, 66, 53], 'rgba(185,168,255,0.5)');                                  // a glitch slice
      storyPoly(g, [22, 78, 34, 78, 34, 80, 22, 80], 'rgba(185,168,255,0.35)');
    }
  },
  // an Order of Silence officer: the runner's peaked hood and fox half-mask (22-anime-order.js)
  order: {
    name: 'Order of Silence', accent: '#c4c8cc',
    portrait(g) {
      const A = STORY_ANI, bd = { bg: '#14171b', glow: 'rgba(196,200,204,0.14)', rim: 'rgba(196,200,204,0.5)' };
      storyBackdrop(g, bd);
      if (storyFighterBust(g, 'order', { pose: 'rest', dx: -4, rim: 'rgba(214,218,222,0.85)' })) return;
      storyAnimeBust(g, Object.assign({ collar: A.crimson, coat: '#1a1d22' }, bd));
      storyPart(g, [30, 70, 31, 36, 40, 25, 50, 14, 60, 25, 69, 36, 70, 70, 62, 66, 62, 40, 38, 40, 38, 66], '#23272d');   // peaked hood
      storyPart(g, [37, 49, 63, 49, 61, 62, 50, 66, 39, 62], '#2c3038');                                                 // fox half-mask
      storyLine(g, [42, 54, 46, 58], A.crimson, 1.2); storyLine(g, [58, 54, 54, 58], A.crimson, 1.2);
      storyEyes(g, A.eye, 45, -0.6);
    }
  },
  narrator: {
    name: '', accent: STORY_INK.gold,
    portrait(g) {
      const K = STORY_INK;
      g.fillStyle = K.ink2; g.fillRect(0, 0, 100, 100);
      // an ink ensō
      g.beginPath(); g.arc(50, 50, 26, -1.2, 4.6); g.strokeStyle = K.gold; g.lineWidth = 7; g.lineCap = 'round'; g.stroke();
      storyDisc(g, 50, 50, 3, K.ember);
    }
  },
  recording: {
    name: 'Recording', accent: STORY_INK.boneDim,
    portrait(g) {
      const K = STORY_INK;
      g.fillStyle = K.ink2; g.fillRect(0, 0, 100, 100);
      // two tape reels and a sound line
      for (const x of [34, 66]) { storyDisc(g, x, 42, 12, K.ash2); storyDisc(g, x, 42, 4, K.ink2); }
      storyPoly(g, [22, 58, 78, 58, 74, 64, 26, 64], K.ash);
      storyLine(g, [20, 78, 30, 78, 34, 70, 40, 86, 46, 72, 52, 82, 58, 74, 64, 80, 70, 78, 80, 78], K.boneDim, 2);
      storyDisc(g, 80, 22, 4, K.emberBright);                                  // REC
    }
  }
};

/* ======================================================================== */
/* Illustrations (1280 x 720)                                                 */
/* ======================================================================== */
// flat horizontal sky bands, top to bottom
function storySky(g, colors, top, bottom) {
  const h = (bottom - top) / colors.length;
  colors.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, top + i * h, 1280, h + 1); });
}
// a ridge line of silhouetted hills across the picture
function storyRidge(g, y, amp, seed, fill) {
  const r = storyRng(seed), pts = [0, 720, 0, y];
  for (let x = 0; x <= 1280; x += 80) pts.push(x, y - r() * amp);
  pts.push(1280, y, 1280, 720);
  storyPoly(g, pts, fill);
}
function storyAsh(g, seed, n, area, color, size) {
  const r = storyRng(seed);
  g.fillStyle = color;
  for (let i = 0; i < n; i++) { const s = (0.5 + r()) * size; g.fillRect(area[0] + r() * area[2], area[1] + r() * area[3], s, s); }
}
// Kage standing, his feet at (x, y), about 150 * s px tall: the in-game fighter in its anime skin, the blade lowered
// at the side (STORY_POSES.rest); o.facing (1 right, -1 left), o.rim (the scene's edge light). The code-drawn back view stands in under Node.
function storyKageFigure(g, x, y, s, o) {
  o = o || {};
  if (storyFigure(g, 'kage', x, y, 150 * s, { pose: 'rest', facing: o.facing || 1, rim: o.rim })) return;
  storyBackFigure(g, x, y, s, 'kage', { rim: o.rim });
}
// adult Rem standing, as storyKageFigure: his worn knee-length travel coat wrapped shut under the violet collar band,
// the white band. o.sword: Shinsen, Takashi's odachi, in his hands.
function storyRemFigure(g, x, y, s, o) {
  o = o || {};
  if (storyFigure(g, 'rem', x, y, 150 * s, { pose: o.sword ? 'shoulder' : 'rest', facing: o.facing || -1, weapon: o.sword ? 'shinsen' : null, rim: o.rim })) return;
  storyBackFigure(g, x, y, s, 'rem', { rim: o.rim });
}
// a dark coat sleeve reaching in along the line (x0, y0) -> (x1, y1), w wide, ending at a cuff band: cel-shaded (a
// shadow strip on the underside, one lit fold on top), fold lines, and the cuff (o.cuff fill, o.embroider: Kage's
// crimson cloud embroidery; o.fray: Rem's worn edge). Returns nothing; the hand is drawn by the caller.
function storySleeve(g, x0, y0, x1, y1, w, o) {
  const A = STORY_ANI, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const P = (t, k) => [x0 + dx * t + nx * w * k, y0 + dy * t + ny * w * k];
  const pts = (spec) => spec.flatMap(([t, k]) => P(t, k));
  storyPart(g, pts([[0, -0.55], [1, -0.5], [1, 0.5], [0, 0.6]]), o.cloth || A.char1, A.outline, 2);
  storyPoly(g, pts([[0, 0.25], [1, 0.22], [1, 0.5], [0, 0.6]]), o.shade || A.char0);                // the underside in shadow
  storyPoly(g, pts([[0, -0.55], [1, -0.5], [1, -0.38], [0, -0.42]]), o.lit || A.char2);             // the lit fold on top
  for (const t of [0.3, 0.58]) storyLine(g, pts([[t, -0.3], [t + 0.05, 0.02], [t + 0.03, 0.24]]), A.cloth0, 2);   // fold lines
  if (o.rim) storyLine(g, pts([[0, -0.55], [0.98, -0.5]]), o.rim, 2.5);
  if (o.cuff) {
    storyPart(g, pts([[0.84, -0.52], [1, -0.5], [1, 0.5], [0.84, 0.52]]), o.cuff, A.outline, 2);
    if (o.embroider) {
      g.save(); storyPoly(g, pts([[0.84, -0.52], [1, -0.5], [1, 0.5], [0.84, 0.52]]), 'rgba(0,0,0,0)'); g.clip();
      for (let k = -0.35; k < 0.4; k += 0.24) { const [cx, cy] = P(0.92, k); storyDisc(g, cx, cy, w * 0.07, o.embroider); g.beginPath(); g.arc(cx, cy, w * 0.11, 0, Math.PI * 1.4); g.strokeStyle = o.embroider; g.lineWidth = 2; g.stroke(); }
      g.restore();
    }
  }
  if (o.fray) for (let k = -0.45; k < 0.5; k += 0.13) { const [ax, ay] = P(1, k), [bx, by] = P(1.05, k + 0.05); storyLine(g, [ax, ay, bx, by], o.cloth || A.char1, 3); }
}
// the fingers of a dark gloved hand wrapped round a bar along the x axis (the local frame of a held scabbard or grip):
// n finger bands from x0 to x1 across the bar (half-height h), seams lit by a thin line, the knuckle edge rimmed
function storyGrip(g, x0, x1, h, o) {
  const A = STORY_ANI, n = 4, fw = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * fw;
    storyPart(g, [x + 1, -h - 6, x + fw - 1, -h - 6, x + fw, h + 2, x + fw * 0.5, h + 7, x, h + 2], o.glove || A.cloth1, A.outline, 2);
    storyLine(g, [x + 2, -h - 4, x + fw - 2, -h - 4], A.cloth2, 2);
  }
  if (o.rim) storyLine(g, [x0, -h - 6, x1, -h - 6], o.rim, 2);
}

const ILLUSTRATIONS = {
  /* ---- The Last Choice (the Epilogue) ---- */
  // The Core opened: concentric rings of light unsealed and drifting apart, a column of violet-white light, and adult
  // Rem standing in it, worn coat and violet collar band; Kage, small, at the edge of the light, turned toward him.
  epilogue_core: {
    name: 'Rem in the opened Core',
    paint(g) {
      storySky(g, ['#07050b', '#0b0812', '#100b19', '#0b0812', '#07050b'], 0, 720);
      storyPoly(g, [560, 0, 720, 0, 760, 720, 520, 720], 'rgba(198,162,255,0.10)');           // the light column
      storyPoly(g, [600, 0, 680, 0, 700, 720, 580, 720], 'rgba(236,229,211,0.10)');
      // the unsealed rings: thick flat arcs, each with a gap, offset as if turning open
      [[300, 0.4, 'rgba(138,92,201,0.45)'], [230, 1.6, 'rgba(198,162,255,0.4)'], [160, 2.8, 'rgba(236,229,211,0.3)']].forEach(([r, a, c]) => {
        g.beginPath(); g.arc(640, 340, r, a, a + Math.PI * 1.55); g.strokeStyle = c; g.lineWidth = 16; g.lineCap = 'butt'; g.stroke();
      });
      storyAsh(g, 301, 120, [200, 40, 880, 600], 'rgba(198,162,255,0.4)', 3);
      // a floor of flat shards
      storyPoly(g, [0, 600, 1280, 600, 1280, 720, 0, 720], '#0a0810');
      storyPoly(g, [420, 600, 860, 600, 960, 720, 320, 720], '#141020');
      storyRemFigure(g, 640, 560, 1.7, { facing: -1, rim: 'rgba(214,190,255,0.85)' });
      storyKageFigure(g, 250, 690, 1.25, { facing: 1, rim: 'rgba(214,190,255,0.7)' });
      g.fillStyle = 'rgba(3,3,3,0.45)'; g.fillRect(0, 0, 1280, 70); g.fillRect(0, 650, 1280, 70);
    }
  },
  // The handoff: Kage's coat sleeve with its crimson embroidered cuff from the left, his gloved hand holding Shinsen
  // out hilt first; Rem's worn coat sleeve with the violet cuff, frayed at the edge, reaches in from the right and his
  // gloved hand closes on the grip. Violet Core light behind.
  epilogue_handoff: {
    name: 'Shinsen returned',
    paint(g) {
      const K = STORY_INK, A = STORY_ANI;
      storySky(g, ['#0a0810', '#120d1c', '#1a1228', '#120d1c', '#0a0810'], 0, 720);
      storyDisc(g, 640, 360, 300, 'rgba(198,162,255,0.08)');
      // Kage's arm from the lower left: the long coat sleeve, the crimson cuff, the gloved hand under the scabbard
      storySleeve(g, -40, 560, 300, 420, 104, { cuff: A.crimson, embroider: A.crimsonHi, rim: 'rgba(214,190,255,0.5)' });
      storyPart(g, [290, 372, 360, 366, 392, 392, 384, 436, 330, 452, 300, 446], A.cloth1, A.outline, 2);   // the palm under the scabbard
      storyLine(g, [300, 380, 356, 372], A.cloth2, 2);
      // the blade: a long black scabbard, gold along the spine, held level, the hilt pointing right toward Rem
      g.save(); g.translate(640, 400); g.rotate(-0.05);
      storyPoly(g, [-360, -14, 200, -18, 214, -6, 200, 8, -360, 10], K.ink);
      storyLine(g, [-360, -16, 200, -20], K.gold, 3);
      storyPoly(g, [200, -24, 216, -24, 218, 14, 202, 14], K.gold);                        // habaki collar
      g.beginPath(); g.ellipse(212, -5, 8, 26, 0, 0, Math.PI * 2); g.fillStyle = K.goldDim; g.fill(); // tsuba
      storyPoly(g, [218, -12, 400, -10, 400, 8, 218, 8], '#2e2834');                       // grip
      for (let i = 0; i < 6; i++) storyLine(g, [232 + i * 26, -10, 244 + i * 26, 6], K.boneDim, 2);
      storyGrip(g, -330, -250, 13, { rim: 'rgba(214,190,255,0.45)' });                     // Kage's fingers round the scabbard
      storyGrip(g, 300, 380, 11, { rim: 'rgba(214,190,255,0.55)' });                       // Rem's closing on the grip
      g.restore();
      // Rem's sleeve from the upper right: the worn travel coat, the violet cuff band, the frayed edge
      storySleeve(g, 1340, 230, 990, 390, 100, { cloth: '#1d1a20', shade: '#121016', lit: '#2c2832', cuff: A.remAcc, fray: 1, rim: 'rgba(214,190,255,0.5)' });
      storyPart(g, [1000, 352, 1010, 420, 978, 432, 944, 412, 940, 376], A.cloth1, A.outline, 2);   // the back of his hand
      storyLine(g, [944, 380, 996, 360], 'rgba(198,162,255,0.4)', 2);
      g.fillStyle = 'rgba(3,3,3,0.45)'; g.fillRect(0, 0, 1280, 70); g.fillRect(0, 650, 1280, 70);
    }
  },
  // The collapse: the Core's light breaking upward in a broad river of flat shards, the reconstructed skyline coming
  // apart into ash, two small figures standing together at the bottom of it.
  epilogue_collapse: {
    name: 'The system collapses',
    paint(g) {
      const K = STORY_INK;
      storySky(g, ['#08060c', '#0e0a16', '#150f20', '#1c142b', '#241a36'], 0, 720);
      // the reconstructed skyline, breaking: rooftops whose tops dissolve into rising squares
      const r = storyRng(411);
      for (let i = 0; i < 12; i++) {
        const x = i * 110 - 20, h = 140 + r() * 140, top = 560 - h;
        storyPoly(g, [x, 560, x, top + 30, x + 50, top, x + 100, top + 30, x + 100, 560], '#120e19');
        for (let k = 0; k < 8; k++) { const s = 6 + r() * 10; g.fillStyle = k % 2 ? K.violet : '#120e19'; g.fillRect(x + r() * 100, top - 20 - r() * 160, s, s); }
      }
      // the river of light going up out of the Core
      storyPoly(g, [520, 720, 760, 720, 900, 0, 380, 0], 'rgba(198,162,255,0.18)');
      storyPoly(g, [590, 720, 690, 720, 740, 0, 540, 0], 'rgba(236,229,211,0.22)');
      for (let i = 0; i < 160; i++) {
        const t = r(), x = 640 + (r() - 0.5) * (240 + t * 520), y = 720 - t * 720, s = 3 + r() * 9;
        storyPoly(g, [x, y - s, x + s * 0.6, y, x, y + s, x - s * 0.6, y], i % 3 ? K.violetGlow : K.bone);
      }
      g.fillStyle = '#070509'; g.fillRect(0, 540, 1280, 180);
      storyLine(g, [0, 580, 300, 568, 500, 590, 640, 552, 820, 588, 1000, 570, 1280, 586], 'rgba(198,162,255,0.35)', 3); // a fracture
      storyKageFigure(g, 590, 570, 0.95, { facing: 1, rim: 'rgba(220,200,255,0.85)' });
      storyRemFigure(g, 690, 570, 0.95, { facing: -1, sword: 1, rim: 'rgba(220,200,255,0.85)' });
      g.fillStyle = 'rgba(3,3,3,0.45)'; g.fillRect(0, 0, 1280, 70); g.fillRect(0, 650, 1280, 70);
    }
  },
  // The two swords at the ruined entrance: a broken stone gate in first light, Kagetsu (a katana with a bone-white grip)
  // and Shinsen (the long odachi, gold collar) leaning side by side against the fallen stones.
  epilogue_swords: {
    name: 'Two swords at the entrance',
    paint(g) {
      const K = STORY_INK;
      storySky(g, ['#1a1420', '#2a1c26', '#3c2628', '#5a3428', '#7a4a2c'], 0, 520);
      storyRidge(g, 470, 50, 501, '#2a1c1e');
      g.fillStyle = '#120d0c'; g.fillRect(0, 470, 1280, 250);
      g.save(); g.translate(0, -70);
      // the ruined gate: two stone posts, one broken short, a fallen lintel
      storyPoly(g, [300, 560, 310, 240, 400, 240, 410, 560], '#1a1312');
      storyPoly(g, [880, 560, 870, 360, 920, 330, 960, 380, 970, 560], '#1a1312');
      storyPoly(g, [300, 240, 410, 240, 404, 252, 306, 252], '#2c2220');                  // cel highlight on top
      storyPoly(g, [420, 560, 700, 500, 720, 540, 440, 590], '#1a1312');                  // the fallen lintel
      storyPoly(g, [420, 560, 700, 500, 702, 510, 424, 570], '#3a2a24');
      storyPoly(g, [560, 600, 640, 560, 760, 580, 800, 610], '#100b0a');                  // rubble
      // the swords, leaning against the lintel: Kagetsu, then Shinsen
      storyLine(g, [600, 600, 664, 352], K.ink, 9);
      storyLine(g, [655, 388, 670, 330], K.bone, 7);                                      // its bone-white grip
      storyLine(g, [646, 400, 668, 404], K.ink, 6);                                       // tsuba
      storyLine(g, [690, 604, 782, 290], K.ink, 11);
      storyLine(g, [690, 604, 782, 290], 'rgba(201,164,92,0.6)', 2);                      // gold along the spine
      storyLine(g, [762, 352, 788, 358], K.gold, 7);                                      // gold collar and guard
      storyLine(g, [770, 330, 790, 266], '#2e2834', 8);                                   // the long grip
      g.restore();
      storyAsh(g, 521, 50, [100, 100, 1080, 420], 'rgba(236,229,211,0.3)', 2);
      g.fillStyle = 'rgba(3,3,3,0.45)'; g.fillRect(0, 0, 1280, 70); g.fillRect(0, 650, 1280, 70);
    }
  },
  // Dawn over the real Yomi: flat warm sky bands, the sun just over the ridge, a long road, and the two brothers seen
  // from behind, walking away side by side, mid-stride: Kage's spiky crown, red scarf tails and long embroidered coat,
  // Rem's white band and knee-length coat. Backlit, so dark with a warm rim. Not a victory pose: they are just leaving.
  epilogue_dawn: {
    name: 'Two silhouettes walking into dawn',
    paint(g) {
      storySky(g, ['#2a2030', '#4a2e34', '#7a4434', '#b0643a', '#d89a58', '#ecc884'], 0, 470);
      storyDisc(g, 640, 470, 110, '#f2dca0');
      storyDisc(g, 640, 470, 80, '#fbefcc');
      storyRidge(g, 450, 50, 601, '#3a2626');
      storyRidge(g, 480, 26, 603, '#241818');
      g.fillStyle = '#140e0c'; g.fillRect(0, 480, 1280, 240);
      storyPoly(g, [440, 720, 840, 720, 660, 484, 620, 484], '#2a1e18');                  // the road to the sun
      storyPoly(g, [560, 720, 720, 720, 650, 484, 630, 484], 'rgba(242,220,160,0.35)');   // sunlight along it
      // the long shadows toward us, then the two walkers, a hand's width apart, one stride each
      for (const x of [608, 676]) storyPoly(g, [x - 10, 610, x + 10, 610, x + 40, 720, x - 30, 720], 'rgba(3,3,3,0.4)');
      storyBackFigure(g, 608, 610, 1.05, 'kage', { stride: 1, rim: 'rgba(255,214,150,0.85)' });
      storyBackFigure(g, 676, 610, 1.05, 'rem', { stride: 0.6, mirror: true, rim: 'rgba(255,214,150,0.85)' });
      storyAsh(g, 611, 40, [200, 120, 880, 320], 'rgba(255,240,200,0.4)', 2);
      g.fillStyle = 'rgba(3,3,3,0.35)'; g.fillRect(0, 0, 1280, 60); g.fillRect(0, 660, 1280, 60);
    }
  },
  // The end card: black, one brush stroke, the card's text (o.card; "Brothers until the end.") and a small red seal.
  end_card: {
    name: 'End card',
    paint(g, o) {
      const K = STORY_INK, text = (o && o.card) || 'Brothers until the end.';
      g.fillStyle = K.ink; g.fillRect(0, 0, 1280, 720);
      storyPoly(g, [340, 402, 640, 392, 950, 398, 940, 410, 640, 404, 350, 414], 'rgba(236,229,211,0.18)'); // brush stroke
      g.fillStyle = K.bone; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '64px "KageBrush","Permanent Marker","Segoe Print",cursive';
      g.fillText(text, 640, 340);
      g.font = '22px "KageUI","Teko","Barlow Condensed","Arial Narrow",sans-serif';
      g.fillStyle = K.boneDim; g.fillText('KAGE · THE LAST BETRAYAL', 640, 450);
      storyPoly(g, [622, 500, 658, 500, 658, 536, 622, 536], K.ember);                    // the seal
      storyPoly(g, [630, 508, 650, 508, 650, 512, 630, 512], K.ink);
      storyPoly(g, [638, 508, 642, 508, 642, 530, 638, 530], K.ink);
    }
  },
  // Hoshimura: the burnt shell of the family house under the red moon, Kage standing before it.
  hoshimura_ruins: {
    name: 'Hoshimura, the ruined house',
    paint(g) {
      const K = STORY_INK;
      storySky(g, ['#0d0807', '#140a09', '#1c0d0b', '#28110e', '#341511'], 0, 470);
      storyDisc(g, 930, 170, 96, K.moon);                                    // red moon
      g.beginPath(); g.arc(930, 170, 96, -0.4, 2.0); g.fillStyle = '#9a2a22'; g.fill();  // its cel-shaded side
      storyRidge(g, 430, 70, 7, '#1a0d0b');
      storyRidge(g, 480, 40, 11, '#110807');
      g.fillStyle = '#0c0807'; g.fillRect(0, 520, 1280, 200);                // ash ground
      g.fillStyle = '#17100d'; g.fillRect(0, 520, 1280, 10);
      // the house: posts, a fallen roof beam, the sagging roof line, a torn shoji frame
      const ink = K.ink;
      storyPoly(g, [300, 530, 312, 260, 330, 260, 322, 530], ink);
      storyPoly(g, [560, 530, 566, 300, 584, 300, 580, 530], ink);
      storyPoly(g, [800, 530, 790, 330, 808, 326, 818, 530], ink);
      storyPoly(g, [250, 300, 520, 210, 700, 250, 860, 320, 860, 340, 700, 276, 520, 236, 262, 322], ink); // roof, broken
      storyPoly(g, [520, 236, 600, 250, 560, 330, 540, 320], ink);           // the broken roof edge hanging
      storyPoly(g, [600, 530, 760, 430, 772, 446, 616, 538], ink);           // fallen beam
      // shoji lattice, half burnt away
      g.strokeStyle = ink; g.lineWidth = 6;
      g.beginPath();
      for (let i = 0; i <= 3; i++) { g.moveTo(340 + i * 52, 340); g.lineTo(340 + i * 52, 530 - (i === 3 ? 90 : 0)); }
      for (let j = 0; j <= 3; j++) { g.moveTo(340, 340 + j * 60); g.lineTo(496 - (j > 1 ? 60 : 0), 340 + j * 60); }
      g.stroke();
      storyPoly(g, [344, 344, 440, 344, 420, 400, 344, 420], 'rgba(236,229,211,0.16)'); // a scrap of paper left in the frame
      // rubble and glowing embers
      storyPoly(g, [200, 540, 260, 505, 330, 520, 380, 545], '#100907');
      storyPoly(g, [820, 545, 900, 500, 980, 515, 1040, 548], '#100907');
      storyAsh(g, 21, 60, [180, 470, 900, 80], K.emberBright, 3);
      storyAsh(g, 22, 40, [100, 120, 1080, 340], 'rgba(236,229,211,0.35)', 2.4);
      storyKageFigure(g, 960, 560, 1.15, { facing: -1, rim: 'rgba(255,120,96,0.85)' });
    }
  },
  // The photograph found in the ash: young Kage, young Rem and Takashi in the old yard, printed in sepia. Kage's and
  // Takashi's faces are scratched out; Rem's is not.
  photograph: {
    name: 'The scratched photograph',
    paint(g) {
      const K = STORY_INK;
      g.fillStyle = '#0c0907'; g.fillRect(0, 0, 1280, 720);
      storyAsh(g, 31, 140, [0, 0, 1280, 720], 'rgba(90,80,69,0.5)', 4);     // ash on the floorboards
      g.save(); g.translate(640, 350); g.rotate(-0.06);
      // the print: white border, sepia field, one burnt corner
      storyPoly(g, [-330, -230, 330, -230, 330, 230, -330, 230], K.bone);
      storyPoly(g, [-306, -206, 306, -206, 306, 170, -306, 170], K.sepia);
      storyPoly(g, [-306, 60, 306, 30, 306, 170, -306, 170], K.sepiaDark);  // flat floor of the old yard
      // the three, printed: the in-game fighters drawn into a layer and toned to the print's sepia (the darks lifted
      // to a print brown, the eyes and the white band kept pale)
      const heads = storyPhotoFigures(g);
      storyPoly(g, [230, 230, 330, 230, 330, 120, 300, 160, 280, 150, 270, 200], '#0c0907'); // burnt corner
      storyLine(g, [270, 200, 280, 150, 300, 160, 330, 120], '#4a1c12', 4);
      // Kage's and Takashi's faces scratched away: pale zigzag gouges, the print torn back to white, edged with dark
      // scored lines
      const scratch = (x, y, seed) => {
        const r = storyRng(seed);
        storyDisc(g, x, y, 30, '#efe6d2');
        for (let i = 0; i < 12; i++) {
          const ox = (r() - 0.5) * 30, len = 48 + r() * 18, pts = [];
          for (let k = 0; k <= 6; k++) { const t = k / 6 - 0.5; pts.push(x + ox + t * len * 0.5 + (k % 2 ? 6 : -6), y + t * len); }
          storyLine(g, pts, i % 3 === 0 ? '#3a2c1e' : i % 3 === 1 ? '#fbf6ea' : '#d9cbb0', i % 3 === 0 ? 1.6 : 3 + r() * 3);
        }
      };
      scratch(heads.kage[0], heads.kage[1], 41);
      scratch(heads.takashi[0], heads.takashi[1], 43);
      g.restore();
    }
  },
  // The violet memory-ash trail: ash rising off the road ahead of Kage, leading him on.
  memory_ash: {
    name: 'The violet ash trail',
    paint(g) {
      const K = STORY_INK;
      storySky(g, ['#07060b', '#0b0912', '#100c19', '#161022', '#1d142c'], 0, 440);
      storyRidge(g, 420, 60, 51, '#0e0a15');
      storyRidge(g, 450, 30, 53, '#0a0810');
      // the road narrowing to the horizon
      g.fillStyle = '#08070a'; g.fillRect(0, 440, 1280, 280);
      storyPoly(g, [380, 720, 900, 720, 680, 446, 600, 446], '#141019');
      storyPoly(g, [600, 446, 680, 446, 660, 520, 610, 520], '#1b1522');
      // the trail: violet flecks along a curve from Kage's feet up the road into the sky
      const r = storyRng(57);
      for (let i = 0; i < 180; i++) {
        const t = i / 180, x = 520 + Math.sin(t * 5.5) * 90 * (1 - t) + t * 220 + (r() - 0.5) * 60 * (1 - t * 0.6);
        const y = 540 - t * 400 + (r() - 0.5) * 40, s = 7 * (1 - t) + 2;
        g.fillStyle = i % 5 === 0 ? K.violetGlow : i % 2 ? K.violet : K.purple;
        g.fillRect(x, y, s, s);
      }
      storyKageFigure(g, 470, 575, 1.1, { facing: 1, rim: 'rgba(214,190,255,0.85)' });
    }
  },
  // Raikon's gift: the damaged archive access token, cracked down the middle, lying in Kage's open gloved hand in the
  // rain, his coat sleeve and its crimson embroidered cuff at the bottom of the picture.
  access_token: {
    name: 'The damaged access token',
    paint(g) {
      const K = STORY_INK, A = STORY_ANI;
      storySky(g, ['#0b0707', '#100909', '#140b0a', '#100909', '#0b0707'], 0, 720);
      storyAsh(g, 71, 90, [0, 0, 1280, 720], 'rgba(198,162,255,0.4)', 3);       // Raikon's ash already rising
      const rr = storyRng(80);
      for (let i = 0; i < 60; i++) { const x = rr() * 1280, y = rr() * 720; storyLine(g, [x, y, x - 10, y + 46], 'rgba(191,181,159,0.16)', 1.4); } // rain
      // Kage's open hand from below: a dark glove, palm cupped, edged pale against the dark
      const hand = [[380, 720, 430, 520, 520, 470, 760, 470, 860, 500, 900, 560, 940, 720], [860, 520, 960, 450, 990, 470, 900, 560]];
      for (const [x0, x1] of [[520, 500], [600, 590], [680, 680], [760, 770]]) hand.push([x0 - 30, 480, x1 - 26, 380, x1 + 26, 380, x0 + 30, 480]);
      for (const pts of hand) storyLine(g, pts.concat(pts.slice(0, 2)), 'rgba(236,229,211,0.45)', 6);
      for (const pts of hand) storyPoly(g, pts, A.cloth1);
      storyPoly(g, [470, 600, 520, 500, 760, 498, 850, 540, 880, 640, 800, 620, 560, 630], A.cloth2);     // the cupped palm, lit
      for (const [x0, x1] of [[520, 500], [600, 590], [680, 680], [760, 770]]) {
        storyLine(g, [x0 - 30, 480, x0 + 30, 480], A.cloth0, 3);                                         // the knuckle seam
        storyLine(g, [(x0 + x1) / 2 - 28, 430, (x0 + x1) / 2 + 28, 430], A.char2, 2);                     // a finger joint
        storyLine(g, [x1, 386, x0, 474], A.cloth0, 2);                                                    // the glove's finger seam
      }
      storyLine(g, [880, 520, 964, 462], A.char2, 2);                                                     // the thumb
      // the coat sleeve at the wrist, its cuff crimson with the cloud embroidery
      storyPart(g, [330, 720, 360, 640, 980, 640, 1000, 720], A.char1, A.outline, 3);
      storyPart(g, [350, 670, 364, 636, 976, 636, 990, 670], A.crimson, A.outline, 2);
      g.save(); storyPoly(g, [350, 670, 364, 636, 976, 636, 990, 670], 'rgba(0,0,0,0)'); g.clip();
      storyEmbroidery(g, 360, 990, 660, 18, A.crimsonHi, A.scarf);
      g.restore();
      storyLine(g, [364, 636, 976, 636], 'rgba(236,229,211,0.35)', 2);
      // the token: an iron tag with a notched corner, the archive seal, a red lightning crack through it
      g.save(); g.translate(650, 440); g.rotate(-0.12);
      storyPoly(g, [-120, -70, 96, -70, 120, -46, 120, 70, -120, 70], '#3a342b');
      storyPoly(g, [-108, -58, 90, -58, 108, -40, 108, 58, -108, 58], '#5a5045');
      g.beginPath(); g.arc(-40, 0, 34, 0, TAU); g.strokeStyle = K.boneDim; g.lineWidth = 5; g.stroke();   // archive seal
      storyLine(g, [-62, 0, -18, 0], K.boneDim, 5);
      for (let i = 0; i < 4; i++) storyLine(g, [20, -34 + i * 22, 92, -34 + i * 22], 'rgba(191,181,159,0.5)', 3); // worn code lines
      storyLine(g, [10, -70, -4, -30, 18, -8, 2, 24, 22, 70], '#0a0908', 9);          // the crack
      storyLine(g, [10, -70, -4, -30, 18, -8, 2, 24, 22, 70], K.emberBright, 3);
      g.beginPath(); g.arc(104, -54, 9, 0, TAU); g.fillStyle = '#0a0908'; g.fill();  // lanyard hole
      g.restore();
      storyLine(g, [754, 386, 800, 330, 840, 300], '#2a2620', 4);                   // a broken lanyard
      g.fillStyle = 'rgba(3,3,3,0.45)'; g.fillRect(0, 0, 1280, 70); g.fillRect(0, 650, 1280, 70);
    }
  },
  // Akari's dying gift (act2.akari.defeat): her gloved hands lift Shinsen, Takashi's odachi, half out of its grey cloth
  // wrapping, gold along the spine; violet ash already rising off her long lacquered arm guards.
  shinsen: {
    name: 'Shinsen',
    paint(g) {
      const K = STORY_INK, A = STORY_ANI;
      storySky(g, ['#0a0810', '#100c16', '#151020', '#100c16', '#0a0810'], 0, 720);
      storyAsh(g, 91, 110, [0, 0, 1280, 720], 'rgba(198,162,255,0.42)', 3);    // Akari coming apart
      // two forearms from below in her long lacquered arm guards, banded violet, the gloved hands turned up under the blade
      for (const [x, dir] of [[400, 1], [880, -1]]) {
        storyPart(g, [x - 70 * dir, 720, x - 10 * dir, 470, x + 60 * dir, 470, x + 70 * dir, 720], A.metal1, A.outline, 2);
        storyPoly(g, [x - 70 * dir, 720, x - 10 * dir, 470, x + 6 * dir, 470, x - 40 * dir, 720], A.metal0);   // the shadowed side
        storyLine(g, [x + 56 * dir, 478, x + 66 * dir, 712], A.metal2, 3);                                      // the plate's lit edge
        for (let k = 0; k < 4; k++) {                                                                          // the lames, banded violet
          const y = 540 + k * 46, l = x - (10 + (y - 470) * 0.24) * dir, rx = x + (60 + (y - 470) * 0.04) * dir;
          storyLine(g, [l, y, rx, y], A.outline, 3); storyLine(g, [l, y + 4, rx, y + 4], k % 2 ? K.violetDim : A.akari, 2);
        }
        storyPart(g, [x - 16 * dir, 500, x - 10 * dir, 470, x + 60 * dir, 470, x + 56 * dir, 500], K.violetDim, A.outline, 2);
        storyLine(g, [x - 10 * dir, 472, x + 60 * dir, 472], A.akari, 2);
        storyPart(g, [x - 30 * dir, 470, x - 20 * dir, 420, x + 70 * dir, 410, x + 90 * dir, 450, x + 60 * dir, 476], A.cloth1, A.outline, 2);   // the gloved hand
        for (let k = 1; k < 4; k++) storyLine(g, [x + (-22 + k * 22) * dir, 420 - k * 2, x + (-10 + k * 22) * dir, 466], A.cloth2, 2);       // the fingers
        storyLine(g, [x - 20 * dir, 420, x + 70 * dir, 410], 'rgba(198,162,255,0.45)', 2);
      }
      g.save(); g.translate(640, 405); g.rotate(-0.08);
      // the scabbard and grip: long, black, a gold collar; the grey cloth wrapping half unwound off the hilt end
      storyPoly(g, [-520, -14, 300, -20, 330, -8, 300, 6, -520, 10], K.ink);
      storyLine(g, [-520, -16, 300, -22], K.gold, 3);                              // gold along the spine
      storyPoly(g, [300, -26, 320, -26, 322, 14, 302, 14], K.gold);              // habaki collar
      storyPoly(g, [318, -14, 520, -12, 520, 8, 318, 8], '#2e2834');             // the long grip
      storyLine(g, [-520, 12, 300, 8], 'rgba(236,229,211,0.3)', 2);             // a pale rim under the scabbard
      for (let i = 0; i < 7; i++) storyLine(g, [334 + i * 26, -12, 346 + i * 26, 8], K.boneDim, 2);
      g.beginPath(); g.ellipse(316, -6, 8, 28, 0, 0, Math.PI * 2); g.fillStyle = K.goldDim; g.fill();   // tsuba
      storyPoly(g, [-520, -30, -300, -34, -280, 22, -520, 26], '#4a4550');       // grey cloth wrap
      storyPoly(g, [-300, -34, -230, -10, -260, 40, -280, 22], '#5d5866');
      storyLine(g, [-480, -30, -470, 24], '#2c2830', 3); storyLine(g, [-400, -32, -392, 24], '#2c2830', 3);
      g.restore();
      g.fillStyle = 'rgba(3,3,3,0.45)'; g.fillRect(0, 0, 1280, 70); g.fillRect(0, 650, 1280, 70);
    }
  },
  // A generic memory backdrop: a violet void with a faint ensō and drifting ash. Good behind flashback dialogue.
  memory: {
    name: 'Memory',
    paint(g) {
      storySky(g, ['#0a0810', '#0e0b16', '#120e1c', '#0e0b16', '#0a0810'], 0, 720);
      g.beginPath(); g.arc(640, 330, 230, -1.3, 4.5);
      g.strokeStyle = 'rgba(138,92,201,0.28)'; g.lineWidth = 46; g.lineCap = 'round'; g.stroke();
      g.beginPath(); g.arc(640, 330, 230, -1.3, 4.5);
      g.strokeStyle = 'rgba(198,162,255,0.12)'; g.lineWidth = 14; g.stroke();
      storyAsh(g, 61, 120, [0, 0, 1280, 720], 'rgba(198,162,255,0.35)', 3);
      storyAsh(g, 62, 50, [0, 0, 1280, 720], 'rgba(236,229,211,0.25)', 2);
      // flat vignette bands at the edges
      g.fillStyle = 'rgba(3,3,3,0.45)'; g.fillRect(0, 0, 1280, 70); g.fillRect(0, 650, 1280, 70);
    }
  }
};

// The photograph's three figures, in the print's frame (the yard's floor line at y = 170): young Kage (left, turned
// toward his brother), young Rem (centre) and Takashi (right, the tallest, turned toward his sons). Live: the fighters
// drawn into a layer, then toned to the print (a pale wash lifts the darks, a sepia 'color' pass sets the hue, the
// figures' own alpha masks it back), so the black faces read as a faded print and the eyes and white band stay pale). Under Node: the back views
// in the print's brown. Returns the head centres for the scratches.
function storyPhotoFigures(g) {
  const heads = { kage: [-170, -86], takashi: [180, -120] };
  const cast = [['young_kage', -170, 250, 1], ['young_rem', 0, 236, 1], ['takashi', 180, 330, -1]];
  const fs = cast.map(([id, , , facing]) => storyFighter(id, { pose: 'rest', facing }));
  if (fs.every(Boolean) && typeof document !== 'undefined') {
    const W = 612, H = 376, ox = 306, oy = 206;                          // the sepia field, -306..306 x -206..170
    const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2;
    const c = cv.getContext('2d'); c.scale(2, 2); c.translate(ox, oy);
    cast.forEach(([id, x, h, facing], i) => {
      const f = fs[i], sc = h / f.height();
      c.save(); c.translate(x, 170); c.scale(sc, sc);
      f.draw(c, { shadow: false, rim: 'rgba(236,229,211,0.7)', light: { x: 0.5, y: -0.86 }, noGlitch: true });
      c.restore();
      const hr = BODY.head * f.scale * f.build.head;
      if (id !== 'young_rem') heads[id === 'young_kage' ? 'kage' : 'takashi'] = [x + f.sk.head.x * sc, 170 + (f.sk.head.y + hr * 0.1) * sc];
    });
    c.setTransform(1, 0, 0, 1, 0, 0);
    const mask = document.createElement('canvas'); mask.width = cv.width; mask.height = cv.height; mask.getContext('2d').drawImage(cv, 0, 0);
    c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(200,180,140,0.2)'; c.fillRect(0, 0, cv.width, cv.height);
    c.globalCompositeOperation = 'color'; c.fillStyle = '#8c7856'; c.fillRect(0, 0, cv.width, cv.height);
    c.globalCompositeOperation = 'destination-in'; c.drawImage(mask, 0, 0);
    c.globalCompositeOperation = 'source-over';
    g.save(); g.globalAlpha = 0.92; g.drawImage(cv, -ox, -oy, W, H); g.restore();
    return heads;
  }
  storyBackFigure(g, -170, 170, 1.7, 'kage', { rim: 'rgba(236,229,211,0.3)' });
  storyBackFigure(g, 0, 170, 1.55, 'rem', { rim: 'rgba(236,229,211,0.3)' });
  storyBackFigure(g, 180, 170, 2.1, 'kage', { rim: 'rgba(236,229,211,0.3)' });
  heads.kage = [-170, 170 - 136 * 1.7]; heads.takashi = [180, 170 - 136 * 2.1];
  return heads;
}
