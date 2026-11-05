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
      // long hair falling past the shoulders on both sides
      storyPoly(g, [33, 40, 34, 26, 50, 22, 66, 26, 67, 40, 70, 84, 62, 86, 60, 48, 40, 48, 38, 86, 30, 84], K.ink);
      storyPoly(g, [62, 30, 72, 26, 70, 34], K.violet);                        // violet hair ribbon
      storyEyes(g, K.violetGlow, 44);
      storyPoly(g, [40, 72, 60, 72, 56, 78, 44, 78], K.violetDim);             // collar
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

const ILLUSTRATIONS = {
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
