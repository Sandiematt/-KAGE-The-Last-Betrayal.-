/* KAGE — story art: the speakers' portrait medallions and the static story illustrations, drawn in code.
   Strictly flat 2D in the game's ink style: silhouettes, flat fills, one or two cel-shade tones, no 3D or painterly
   rendering. Self-contained (it uses no other module), so tests/story.test.js can load it under Node and run every
   painter against a recording context.

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

/* ======================================================================== */
/* Portrait medallions                                                        */
/* ======================================================================== */
// The shared bust: a flat two-tone backdrop with an accent rim, black shoulders and head. Looks add the details.
function storyBust(g, o) {
  const K = STORY_INK;
  g.fillStyle = o.bg || K.ink2; g.fillRect(0, 0, 100, 100);
  storyDisc(g, 50, 44, 40, o.glow || 'rgba(255,255,255,0.06)');           // flat halo behind the head
  storyPoly(g, [10, 100, 18, 78, 34, 70, 66, 70, 82, 78, 90, 100], K.ink); // shoulders
  storyPoly(g, [42, 72, 44, 58, 56, 58, 58, 72], K.ink);                   // neck
  storyDisc(g, 50, 44, 17, K.ink);                                         // head
  // a thin cel rim on the lit side
  g.beginPath(); g.arc(50, 44, 17, -1.9, -0.2); g.strokeStyle = o.rim || 'rgba(236,229,211,0.55)'; g.lineWidth = 1.6; g.stroke();
}
function storyEyes(g, color, y, slant) {
  y = y || 44; slant = slant || 0;
  storyPoly(g, [40, y, 47, y - 1 + slant, 47, y + 1.4 + slant, 40, y + 1.2], color);
  storyPoly(g, [53, y - 1 + slant, 60, y, 60, y + 1.2, 53, y + 1.4 + slant], color);
}

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
const SPEAKERS = {
  kage: {
    name: 'Kage', accent: STORY_INK.emberBright,
    portrait(g) {
      const K = STORY_INK;
      storyBust(g, { bg: '#1a0d0b', glow: 'rgba(163,48,42,0.28)' });
      // white face-wrap: a band across the face below the eyes, its loose tail blowing back
      storyPoly(g, [33, 47, 67, 47, 66, 56, 34, 56], K.bone);
      storyPoly(g, [34, 51, 20, 46, 14, 52, 22, 54, 34, 56], K.bone);
      storyPoly(g, [33, 52, 67, 52, 66, 56, 34, 56], K.boneDim);              // its cel-shaded lower fold
      storyEyes(g, K.bone, 42);
      // the red sash across the chest
      storyPoly(g, [26, 74, 34, 70, 78, 96, 70, 100], K.ember);
      storyPoly(g, [30, 72, 34, 70, 78, 96, 74, 98], K.emberBright);
    }
  },
  rem: {
    name: 'Rem', accent: STORY_INK.violet,
    portrait(g) {
      const K = STORY_INK;
      storyBust(g, { bg: '#140d1c', glow: 'rgba(138,92,201,0.3)', rim: 'rgba(198,162,255,0.6)' });
      // loose hair: a few flat spikes falling over the brow
      storyPoly(g, [32, 42, 36, 26, 46, 24, 58, 25, 68, 34, 68, 44, 62, 34, 56, 38, 50, 32, 44, 38, 38, 34], K.ink);
      storyEyes(g, K.bone, 45);
      storyLine(g, [45, 53, 50, 55, 55, 53], 'rgba(236,229,211,0.6)', 1.2);   // the hint of a smile
      // the purple scarf wound at the neck, one end hanging
      storyPoly(g, [34, 66, 66, 66, 70, 74, 30, 74], K.purple);
      storyPoly(g, [56, 72, 64, 72, 62, 96, 54, 92], K.purple);
      storyPoly(g, [34, 70, 66, 70, 70, 74, 30, 74], K.violetDim);
    }
  },
  // Rem as he is now (the Epilogue): older and exhausted, hair grown out and tied back loosely, no smile, a shadow under
  // the eyes, the high collar of his worn dark travel coat (the Kurokumo Yoroi) with its one purple band, frayed at the edge.
  rem_adult: {
    name: 'Rem', accent: STORY_INK.violet,
    portrait(g) {
      const K = STORY_INK;
      storyBust(g, { bg: '#100c15', glow: 'rgba(138,92,201,0.16)', rim: 'rgba(198,162,255,0.4)' });
      // longer, heavier hair: a ragged fall over the brow and down past the jaw on both sides, a loose tail behind
      storyPoly(g, [30, 50, 31, 32, 40, 24, 52, 23, 64, 28, 70, 38, 70, 56, 64, 44, 60, 36, 54, 40, 48, 34, 42, 40, 36, 38, 34, 52], K.ink);
      storyPoly(g, [66, 34, 80, 40, 84, 58, 76, 50, 70, 44], K.ink);
      storyEyes(g, K.boneDim, 46, 0.6);                                        // tired, heavy-lidded
      storyLine(g, [40, 49, 46, 49.5], 'rgba(198,162,255,0.28)', 1.2);         // the shadows under the eyes
      storyLine(g, [54, 49.5, 60, 49], 'rgba(198,162,255,0.28)', 1.2);
      storyLine(g, [45, 55, 55, 55], 'rgba(236,229,211,0.4)', 1.1);            // a flat, tired mouth
      storyLine(g, [38, 56, 41, 60], 'rgba(236,229,211,0.18)', 1);             // stubble shading on the jaw
      // the coat's high collar, dark charcoal with one purple band and a frayed hem at the collar edge
      storyPoly(g, [26, 100, 30, 70, 40, 62, 46, 74, 54, 74, 60, 62, 70, 70, 74, 100], '#1d1a20');
      storyPoly(g, [40, 62, 46, 74, 44, 78, 36, 66], '#2a2630');               // cel-shaded lapel fold
      storyPoly(g, [60, 62, 70, 70, 69, 74, 59, 66], K.purple);                // the one purple accent
      for (let i = 0; i < 6; i++) storyPoly(g, [28 + i * 8, 100, 31 + i * 8, 95, 34 + i * 8, 100], K.ink2); // frayed cloth
    }
  },
  takashi: {
    name: 'Takashi', accent: STORY_INK.gold,
    portrait(g) {
      const K = STORY_INK;
      storyBust(g, { bg: '#17120a', glow: 'rgba(201,164,92,0.26)', rim: 'rgba(232,200,134,0.7)' });
      storyPoly(g, [46, 28, 54, 28, 55, 20, 50, 15, 45, 20], K.ink);           // topknot
      storyPoly(g, [38, 52, 62, 52, 58, 66, 50, 70, 42, 66], K.ink);           // beard
      storyLine(g, [41, 41, 47, 40], K.gold, 1.4); storyLine(g, [53, 40, 59, 41], K.gold, 1.4); // heavy brows
      storyEyes(g, K.boneDim, 44);
      // gold-trimmed haori lapels
      storyPoly(g, [34, 70, 44, 70, 54, 100, 44, 100], K.gold);
      storyPoly(g, [66, 70, 56, 70, 50, 100, 60, 100], K.goldDim);
    }
  },
  raikon: {
    name: 'Raikon', accent: STORY_INK.emberBright,
    portrait(g) {
      const K = STORY_INK;
      storyBust(g, { bg: '#1c0808', glow: 'rgba(210,74,60,0.32)', rim: 'rgba(255,138,122,0.7)' });
      // the Raijin Kabuto: an angular iron helm with a wide brim and a short red lightning crest
      storyPoly(g, [26, 40, 32, 22, 50, 14, 68, 22, 76, 40, 84, 44, 18, 44], K.ink);
      storyPoly(g, [46, 16, 52, 4, 50, 11, 58, 2, 54, 16], K.emberBright);
      storyEyes(g, K.emberBright, 45, -1);
      // a red lightning scar down the cheek
      storyLine(g, [62, 36, 58, 44, 63, 47, 59, 56], K.emberBright, 1.6);
      storyPoly(g, [30, 74, 70, 74, 78, 82, 22, 82], K.ember);                 // red collar
    }
  },
  akari: {
    name: 'Akari', accent: STORY_INK.violetGlow,
    portrait(g) {
      const K = STORY_INK;
      storyBust(g, { bg: '#120b1a', glow: 'rgba(198,162,255,0.26)', rim: 'rgba(198,162,255,0.7)' });
      // hair pulled back tight and tied high: a short tail kicking out behind, a violet tie at its root
      storyPoly(g, [33, 42, 35, 28, 50, 24, 64, 28, 67, 40, 62, 32, 50, 30, 38, 34], K.ink);
      storyPoly(g, [64, 30, 84, 22, 90, 30, 80, 32, 86, 40, 70, 36], K.ink);
      storyPoly(g, [63, 28, 68, 26, 70, 34, 65, 35], K.violet);
      storyEyes(g, K.violetGlow, 43);
      // the half-mask over nose and mouth: a muted violet-grey plate with a centre seam, cel-shaded on one side
      storyPoly(g, [34, 47, 66, 47, 63, 58, 50, 62, 37, 58], '#4a4058');
      storyPoly(g, [50, 47, 66, 47, 63, 58, 50, 62], '#3a3246');
      storyLine(g, [50, 48, 50, 61], 'rgba(198,162,255,0.45)', 1);
      // layered collar of the Mei-En Garb: charcoal over violet
      storyPoly(g, [32, 72, 68, 72, 64, 80, 36, 80], K.violetDim);
      storyPoly(g, [36, 70, 50, 78, 64, 70, 60, 76, 50, 82, 40, 76], '#1d1a22');
    }
  },
  witness: {
    name: 'The Witness', accent: STORY_INK.violetGlow,
    portrait(g) {
      const K = STORY_INK;
      storyBust(g, { bg: '#0c0912', glow: 'rgba(138,92,201,0.22)', rim: 'rgba(198,162,255,0.4)' });
      storyPoly(g, [28, 74, 34, 30, 50, 18, 66, 30, 72, 74], K.ink);           // hood
      // the white mask, cel-shaded on one side, with a single violet eye
      g.beginPath(); g.ellipse(50, 46, 12, 16, 0, 0, Math.PI * 2); g.fillStyle = K.bone; g.fill();
      g.beginPath(); g.ellipse(50, 46, 12, 16, 0, -Math.PI / 2, Math.PI / 2); g.fillStyle = K.boneDim; g.fill();
      storyDisc(g, 50, 42, 3.4, K.violet); storyDisc(g, 50, 42, 1.4, K.violetGlow);
      storyLine(g, [45, 55, 55, 55], 'rgba(10,9,8,0.5)', 1);
    }
  },
  // an outer-district survivor (Act I): an old woman under a ragged grey headcloth, tired pale eyes
  survivor: {
    name: 'Survivor', accent: STORY_INK.boneDim,
    portrait(g) {
      const K = STORY_INK;
      storyBust(g, { bg: '#16151a', glow: 'rgba(191,181,159,0.16)', rim: 'rgba(191,181,159,0.45)' });
      storyPoly(g, [28, 76, 30, 40, 38, 26, 50, 22, 62, 26, 70, 40, 72, 76, 64, 74, 62, 46, 38, 46, 36, 74], K.ash);   // headcloth
      storyPoly(g, [36, 76, 38, 48, 44, 50, 42, 78], K.ash2);                                                          // its lit fold
      storyEyes(g, K.boneDim, 47);
      storyLine(g, [44, 56, 50, 57, 56, 56], 'rgba(191,181,159,0.4)', 1);                                              // a thin mouth
    }
  },
  // a resident of the City of Echoes (Act II): someone rebuilt from a stored memory, a pale face under a plain cloth
  // cap with a faint violet doubled outline offset to one side (the memory not quite lining up), calm violet-white eyes
  resident: {
    name: 'Resident', accent: '#b9a8ff',
    portrait(g) {
      const K = STORY_INK;
      storyBust(g, { bg: '#141020', glow: 'rgba(185,168,255,0.18)', rim: 'rgba(185,168,255,0.55)' });
      g.beginPath(); g.arc(54, 44, 17, 0, Math.PI * 2); g.strokeStyle = 'rgba(185,168,255,0.45)'; g.lineWidth = 1.4; g.stroke();   // the doubled outline
      storyPoly(g, [33, 40, 36, 28, 50, 24, 64, 28, 67, 40, 58, 36, 42, 36], '#2a2438');                                            // cloth cap
      storyPoly(g, [38, 44, 62, 44, 60, 60, 50, 64, 40, 60], '#3e3652');                                                            // a pale, half-there face
      storyPoly(g, [50, 44, 62, 44, 60, 60, 50, 64], '#332c45');
      storyEyes(g, '#e6dcff', 49);
      storyLine(g, [45, 57, 50, 58, 55, 57], 'rgba(230,220,255,0.45)', 1);                                                            // a patient smile
      storyPoly(g, [66, 50, 72, 50, 72, 53, 66, 53], 'rgba(185,168,255,0.5)');                                                      // a glitch slice
    }
  },
  // an Order of Silence officer: slate hood, dark cloth mask over the mouth, the Order mark (a barred circle) on the chest
  order: {
    name: 'Order of Silence', accent: '#c4c8cc',
    portrait(g) {
      const K = STORY_INK;
      storyBust(g, { bg: '#14171b', glow: 'rgba(196,200,204,0.14)', rim: 'rgba(196,200,204,0.5)' });
      storyPoly(g, [30, 70, 31, 36, 40, 25, 50, 22, 60, 25, 69, 36, 70, 70, 62, 66, 62, 44, 38, 44, 38, 66], '#3a4048');  // hood
      storyPoly(g, [37, 49, 63, 49, 61, 62, 39, 62], '#23272d');                                                        // mask
      storyEyes(g, '#c4c8cc', 45);
      g.beginPath(); g.arc(50, 86, 6, 0, Math.PI * 2); g.strokeStyle = '#c4c8cc'; g.lineWidth = 1.8; g.stroke();
      storyLine(g, [46, 86, 54, 86], '#c4c8cc', 1.8);
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
// Kage as a flat silhouette seen from behind/side: black body, white face-wrap tail, red sash. x, y = feet.
function storyKageFigure(g, x, y, s) {
  const K = STORY_INK;
  g.save(); g.translate(x, y); g.scale(s, s);
  storyPoly(g, [-14, 0, -8, -70, 8, -70, 14, 0, 6, 0, 0, -40, -6, 0], K.ink);  // legs
  storyPoly(g, [-16, -66, -12, -122, 12, -122, 16, -66], K.ink);              // torso
  storyDisc(g, 0, -136, 13, K.ink);                                           // head
  storyPoly(g, [-12, -140, 12, -140, 12, -133, -12, -133], K.bone);           // face-wrap
  storyPoly(g, [-12, -138, -40, -146, -48, -136, -12, -133], K.bone);         // its tail in the wind
  storyPoly(g, [-16, -84, 16, -94, 16, -86, -16, -76], K.ember);              // red sash
  storyPoly(g, [-14, -80, -30, -50, -24, -48, -10, -78], K.ember);            // sash end
  storyLine(g, [10, -100, 40, -8], K.ink, 3);                                 // sheathed blade
  g.restore();
}

// Adult Rem as a flat silhouette: a long worn travel coat (the Kurokumo Yoroi) flaring to the knees with a frayed hem,
// one purple band at the collar, hair tied back loosely. x, y = feet. o.sword: an odachi on his back (Shinsen).
function storyRemFigure(g, x, y, s, o) {
  const K = STORY_INK;
  o = o || {};
  g.save(); g.translate(x, y); g.scale(s, s);
  storyPoly(g, [-12, 0, -7, -60, 7, -60, 12, 0, 5, 0, 0, -34, -5, 0], K.ink);               // legs
  // the coat: shoulders to knees, flaring, with a ragged hem
  const coat = [-17, -126, 17, -126, 26, -40];
  for (let i = 1; i <= 8; i++) coat.push(26 - i * 6.25, -40 + (i % 2 ? 7 : 0));        // the ragged hem, right to left
  storyPoly(g, coat, K.ink);
  storyPoly(g, [-17, -126, -6, -126, -10, -44, -22, -44], '#17141a');                        // cel-shaded coat front
  storyPoly(g, [6, -128, 16, -126, 14, -116, 4, -118], K.purple);                            // the purple collar band
  storyPoly(g, [-17, -96, 17, -100, 17, -93, -17, -89], K.purple);                           // his purple sash
  storyDisc(g, 0, -140, 12.5, K.ink);                                                        // head
  storyPoly(g, [6, -146, 22, -142, 30, -126, 20, -132, 8, -136], K.ink);                     // loose tail of hair
  if (o.sword) storyLine(g, [-20, -150, 24, -40], K.ink, 4);                                 // odachi across the back
  g.restore();
}

const ILLUSTRATIONS = {
  /* ---- The Last Choice (the Epilogue) ---- */
  // The Core opened: concentric rings of light unsealed and drifting apart, a column of violet-white light, and adult
  // Rem standing in it, worn coat and purple band; Kage, small and from behind, at the edge of the light.
  epilogue_core: {
    name: 'Rem in the opened Core',
    paint(g) {
      const K = STORY_INK;
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
      storyRemFigure(g, 640, 560, 1.7);
      storyKageFigure(g, 250, 690, 1.25);
      g.fillStyle = 'rgba(3,3,3,0.45)'; g.fillRect(0, 0, 1280, 70); g.fillRect(0, 650, 1280, 70);
    }
  },
  // The handoff: Kage's black arm with its red sash cuff from the left holds Shinsen out hilt first; Rem's frayed dark
  // coat sleeve with the purple cuff reaches in from the right to take the grip. Violet Core light behind.
  epilogue_handoff: {
    name: 'Shinsen returned',
    paint(g) {
      const K = STORY_INK;
      storySky(g, ['#0a0810', '#120d1c', '#1a1228', '#120d1c', '#0a0810'], 0, 720);
      storyDisc(g, 640, 360, 300, 'rgba(198,162,255,0.08)');
      // Kage's arm from the lower left, the red cuff at the wrist
      storyPoly(g, [0, 560, 0, 460, 300, 380, 340, 440], K.ink);
      storyPoly(g, [270, 384, 300, 378, 332, 436, 304, 446], K.ember);
      storyPoly(g, [300, 378, 380, 360, 400, 420, 340, 440], K.ink);                       // his hand round the scabbard
      // the blade: a long black scabbard, gold along the spine, held level, the hilt pointing right toward Rem
      g.save(); g.translate(640, 400); g.rotate(-0.05);
      storyPoly(g, [-360, -14, 200, -18, 214, -6, 200, 8, -360, 10], K.ink);
      storyLine(g, [-360, -16, 200, -20], K.gold, 3);
      storyPoly(g, [200, -24, 216, -24, 218, 14, 202, 14], K.gold);                        // habaki collar
      g.beginPath(); g.ellipse(212, -5, 8, 26, 0, 0, Math.PI * 2); g.fillStyle = K.goldDim; g.fill(); // tsuba
      storyPoly(g, [218, -12, 400, -10, 400, 8, 218, 8], '#2e2834');                       // grip
      for (let i = 0; i < 6; i++) storyLine(g, [232 + i * 26, -10, 244 + i * 26, 6], K.boneDim, 2);
      g.restore();
      // Rem's sleeve from the upper right, frayed at the cuff, one purple band, his hand closing on the grip
      storyPoly(g, [1280, 180, 1280, 330, 1000, 420, 960, 360], '#1d1a20');
      storyPoly(g, [990, 352, 1010, 344, 1040, 410, 1016, 418], K.purple);
      for (let i = 0; i < 5; i++) storyPoly(g, [968 + i * 8, 356 - i * 2, 972 + i * 8, 372 - i * 2, 978 + i * 8, 354 - i * 2], '#1d1a20');
      storyPoly(g, [960, 360, 990, 420, 960, 432, 900, 412, 900, 380], K.ink);                // his hand
      storyLine(g, [900, 380, 960, 360, 990, 420], 'rgba(198,162,255,0.4)', 2);
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
      storyKageFigure(g, 600, 570, 0.95);
      storyRemFigure(g, 680, 570, 0.95, { sword: 1 });
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
  // Dawn over the real Yomi: flat warm sky bands, the sun just over the ridge, a long road, and two small silhouettes
  // seen from behind, walking away side by side, mid-stride. Not a victory pose: they are just leaving.
  epilogue_dawn: {
    name: 'Two silhouettes walking into dawn',
    paint(g) {
      const K = STORY_INK;
      storySky(g, ['#2a2030', '#4a2e34', '#7a4434', '#b0643a', '#d89a58', '#ecc884'], 0, 470);
      storyDisc(g, 640, 470, 110, '#f2dca0');
      storyDisc(g, 640, 470, 80, '#fbefcc');
      storyRidge(g, 450, 50, 601, '#3a2626');
      storyRidge(g, 480, 26, 603, '#241818');
      g.fillStyle = '#140e0c'; g.fillRect(0, 480, 1280, 240);
      storyPoly(g, [440, 720, 840, 720, 660, 484, 620, 484], '#2a1e18');                  // the road to the sun
      storyPoly(g, [560, 720, 720, 720, 650, 484, 630, 484], 'rgba(242,220,160,0.35)');   // sunlight along it
      // two walkers from behind: one stride each, arms loose, a hand's width apart
      const walker = (x, rem) => {
        g.save(); g.translate(x, 610); g.scale(1.05, 1.05);
        storyPoly(g, [-12, 0, -4, -66, 6, -66, 2, -30, 14, -4, 6, 0, -2, -30, -4, 0], K.ink);  // legs mid-stride
        if (rem) storyPoly(g, [-16, -124, 16, -124, 22, -46, -22, -46], K.ink);               // Rem's coat
        else storyPoly(g, [-15, -64, -12, -122, 12, -122, 15, -64], K.ink);
        storyPoly(g, [-15, -118, -22, -70, -16, -68, -10, -112], K.ink);                       // loose arms
        storyPoly(g, [15, -118, 22, -70, 16, -68, 10, -112], K.ink);
        storyDisc(g, 0, -136, 12.5, K.ink);
        if (rem) storyPoly(g, [4, -128, 14, -126, 13, -118, 3, -120], K.purple);
        else { storyPoly(g, [-12, -140, -34, -150, -40, -140, -12, -134], K.bone); storyPoly(g, [-15, -86, 15, -94, 15, -87, -15, -79], K.ember); }
        g.restore();
        storyPoly(g, [x - 10, 610, x + 10, 610, x + 40, 720, x - 30, 720], 'rgba(3,3,3,0.4)'); // the long shadow toward us
      };
      walker(612, false); walker(672, true);
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
  // Hoshimura: the burnt shell of the family house under the red moon.
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
      storyKageFigure(g, 960, 560, 1.15);
    }
  },
  // The photograph found in the ash: Kage, Rem and Takashi. Kage's and Takashi's faces are scratched out; Rem's is not.
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
      storyPoly(g, [230, 230, 330, 230, 330, 120, 300, 160, 280, 150, 270, 200], '#0c0907'); // burnt corner
      storyLine(g, [270, 200, 280, 150, 300, 160, 330, 120], '#4a1c12', 4);
      const fig = (x, h, w, scarf) => {
        const top = 170 - h * 0.62, c = '#2a2118';
        // sloped shoulders, arms at the sides, a neck, the head
        storyPoly(g, [x - w * 0.9, 170, x - w * 1.02, top + 50, x - w * 0.62, top + 4, x - 14, top - 6, x + 14, top - 6, x + w * 0.62, top + 4, x + w * 1.02, top + 50, x + w * 0.9, 170], c);
        storyPoly(g, [x - 13, top + 2, x - 11, top - 22, x + 11, top - 22, x + 13, top + 2], c);
        storyDisc(g, x, top - 50, 34, c);
        storyLine(g, [x - w * 0.55, top + 40, x - w * 0.6, 170], 'rgba(200,180,140,0.25)', 2);   // arm edges
        storyLine(g, [x + w * 0.55, top + 40, x + w * 0.6, 170], 'rgba(200,180,140,0.25)', 2);
        if (scarf) { storyPoly(g, [x - 32, top - 8, x + 32, top - 8, x + 36, top + 10, x - 36, top + 10], scarf); storyPoly(g, [x + 10, top + 6, x + 26, top + 6, x + 22, top + 70, x + 8, top + 64], scarf); }
      };
      fig(-170, 300, 66);                       // Kage
      fig(0, 280, 60, '#6c4a7a');               // Rem, scarf faded by the print
      fig(180, 340, 76);                        // Takashi, the tallest
      // Rem's face is still there: a pale face, eyes and a smile
      const ry = 170 - 280 * 0.62 - 50;
      storyDisc(g, 0, ry + 2, 24, '#d8c6a0');
      storyPoly(g, [-12, ry - 2, -4, ry - 3, -4, ry + 1, -12, ry + 1], '#2a2118');
      storyPoly(g, [4, ry - 3, 12, ry - 2, 12, ry + 1, 4, ry + 1], '#2a2118');
      storyLine(g, [-7, ry + 11, 0, ry + 14, 7, ry + 11], '#2a2118', 2);
      storyPoly(g, [-26, ry - 8, -18, ry - 30, 0, ry - 36, 20, ry - 30, 26, ry - 8, 14, ry - 20, 0, ry - 14, -12, ry - 20], '#2a2118'); // hair
      // Kage's and Takashi's faces scratched away: pale gouges through the print
      // (zigzag gouges: the print torn back to white, edged with dark scored lines)
      const scratch = (x, y, seed) => {
        const r = storyRng(seed);
        storyDisc(g, x, y, 30, '#efe6d2');
        for (let i = 0; i < 12; i++) {
          const ox = (r() - 0.5) * 30, len = 48 + r() * 18, pts = [];
          for (let k = 0; k <= 6; k++) { const t = k / 6 - 0.5; pts.push(x + ox + t * len * 0.5 + (k % 2 ? 6 : -6), y + t * len); }
          storyLine(g, pts, i % 3 === 0 ? '#3a2c1e' : i % 3 === 1 ? '#fbf6ea' : '#d9cbb0', i % 3 === 0 ? 1.6 : 3 + r() * 3);
        }
      };
      scratch(-170, 170 - 300 * 0.62 - 50, 41);
      scratch(180, 170 - 340 * 0.62 - 50, 43);
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
      storyKageFigure(g, 470, 575, 1.1);
    }
  },
  // Raikon's gift: the damaged archive access token, cracked down the middle, lying in Kage's open hand in the rain.
  access_token: {
    name: 'The damaged access token',
    paint(g) {
      const K = STORY_INK;
      storySky(g, ['#0b0707', '#100909', '#140b0a', '#100909', '#0b0707'], 0, 720);
      storyAsh(g, 71, 90, [0, 0, 1280, 720], 'rgba(198,162,255,0.4)', 3);       // Raikon's ash already rising
      const rr = storyRng(80);
      for (let i = 0; i < 60; i++) { const x = rr() * 1280, y = rr() * 720; storyLine(g, [x, y, x - 10, y + 46], 'rgba(191,181,159,0.16)', 1.4); } // rain
      // Kage's open hand from below: a flat black palm and fingers, edged pale against the dark
      const hand = [[380, 720, 430, 520, 520, 470, 760, 470, 860, 500, 900, 560, 940, 720], [860, 520, 960, 450, 990, 470, 900, 560]];
      for (const [x0, x1] of [[520, 500], [600, 590], [680, 680], [760, 770]]) hand.push([x0 - 30, 480, x1 - 26, 380, x1 + 26, 380, x0 + 30, 480]);
      for (const pts of hand) storyLine(g, pts.concat(pts.slice(0, 2)), 'rgba(236,229,211,0.45)', 6);
      for (const pts of hand) storyPoly(g, pts, K.ink);
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
  // wrapping, gold along the spine; violet ash already rising off her sleeves.
  shinsen: {
    name: 'Shinsen',
    paint(g) {
      const K = STORY_INK;
      storySky(g, ['#0a0810', '#100c16', '#151020', '#100c16', '#0a0810'], 0, 720);
      storyAsh(g, 91, 110, [0, 0, 1280, 720], 'rgba(198,162,255,0.42)', 3);    // Akari coming apart
      // two forearms from below, charcoal sleeves with violet cuffs, the hands turned up under the blade
      for (const [x, dir] of [[400, 1], [880, -1]]) {
        storyPoly(g, [x - 70 * dir, 720, x - 10 * dir, 470, x + 60 * dir, 470, x + 70 * dir, 720], '#1d1a22');
        storyPoly(g, [x - 16 * dir, 500, x - 10 * dir, 470, x + 60 * dir, 470, x + 56 * dir, 500], K.violetDim);
        storyPoly(g, [x - 30 * dir, 470, x - 20 * dir, 420, x + 70 * dir, 410, x + 90 * dir, 450, x + 60 * dir, 476], K.ink);
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
      const K = STORY_INK;
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
