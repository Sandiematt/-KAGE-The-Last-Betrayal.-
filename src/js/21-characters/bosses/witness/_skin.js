/* KAGE — the Witness, Mirror of the Self, as an anime final boss (anime redesign, ticket 11), from its key art
   (boss_witness.webp, face_witness.webp). The most elaborate figure in the game: tall, thin, hovering, every layer
   edged in violet light with crimson veins running through the black armour:
     head      a tall jagged crown of black spikes (sharp hair), the tallest about 1.5 head radii over the brow, swept up
               and back, each spike edge-lit violet; a side spike framing the face. Under it the black face (the rule)
               with the key art's mask read as markings: two large, angular, upswept WHITE eyes with a violet halo, sharp
               lavender brow marks above them, violet tear lines under them and the faint seam of a black mask plate.
               No nose, no mouth. On a Kage-flicker frame the head is Kage's own hair and eyes.
     coat      a high-collared armoured coat: two collar blades standing up behind the head, a front collar beside the
               jaw, a black coat torso open over a lacquered breastplate with violet edges, three abdominal lames, crimson
               veins branching from the chest core, the core set in an angular bezel (a cracked empty socket once it
               breaks). Long blade-shaped coat tails (cloth 'wcoat', made in the Fighter constructor) black with a crimson
               lining edge, violet light gathering toward their tips, a violet vein, rune circles on some.
     arms      jagged layered pauldrons with a spike, black sleeves, armoured gauntlets with a flared spiked cuff
     legs      slim black legs with cuisses, pointed knee cops, greaves veined crimson and pointed sabatons
     waist     an armoured belt with a crimson gem and two jagged tassets
     halo      a great ring behind the shoulders: a glow, a dark band edged magenta and violet, a turning ring of notches,
               an inner dashed rune ring, four blades at the quarters (the top one tallest)
     core      the white-hot chest core in a violet bloom with its magenta ring, turning circuit ring and the rune cards
               trailing back from it (drawn over the near arm and under the blade, so it is never hidden)
     weapon    Mugen no Ha: obsidian memory shards edge-lit violet with a white core line, re-forming into whatever
               weapon it copies (drawShardWeapon)
   Its edge light is violet (skin.rimTint for the outline pass, witnessPal for the rim inside parts).
   The Kage-flicker (Fighter.draw `kageFrame`) draws the whole body with Kage's own skin (animeSkin), his coat panels and
   scarf tails (cloth marked `kageOnly`, made here) and his real blade, so the flicker is Kage's new design.
   Kage can wear the Kysmei Robe (Epilogue): a violet-edged crossed chest plate with a gem and crimson veins, a standing
   collar behind his own, and the robe's fragments drifting round him (Fighter.drawKysmei).
   Drawing only: no joint, timer or gameplay field is touched, and no randomness. */

const WT_CROWN = ['#020104', '#0a0811', '#251d3b'];

const WT_ARMOR = ['#040308', '#0e0b16', '#2c2342'];           // black lacquered plates with a violet cast

const WT_CLOTH = ['#030205', '#09070e', '#19132a'];

const WT_COAT = ['#030207', '#0b0914', '#231a38'];

const WT_FAR = ['#020103', '#050409', '#0e0b16'];

const WT_VIO = ['#3a1f78', '#8e5cf0', '#dccbff'];

const WT_CRIM = ['#4a0614', '#c41d3f', '#ff6b8a'];

const WT_EDGE = 'rgba(176,138,255,0.85)';                     // violet edge light on plate rims

/* ---- skin ---- */
ANIME_SKINS.witness = { top: 'gi', feet: 'witness', sleeve: 1, kote: false, collar: false, sash: 'witness', noGiSash: true, witness: 'boss', rimTint: [132, 86, 250] };

const _wtPalC = new WeakMap();

function witnessPal(pal) {
  let p = _wtPalC.get(pal);
  if (!p) _wtPalC.set(pal, p = Object.assign({}, pal, { rim: 'rgba(150,104,255,0.6)', acc: WT_CRIM[1], accHi: WT_CRIM[2], fab: WT_CLOTH, back: ['#020103', WT_CLOTH[0], WT_CLOTH[1]], coat: WT_COAT, coatB: WT_COAT, metal: WT_ARMOR }));
  return p;
}

// cloth (from animeCloths): what the Kage-flicker needs that the Witness has no use for, Kage's coat panels and scarf
// tails. The crown's long violet strands and the coat tails are made in the Fighter constructor.
function witnessCloths(f, sk) {
  if (!sk.witness) return;
  const s = f.scale;
  f.cloths.push({ kind: 'coat', part: 'back', kageOnly: 1, c: new Cloth(8, 12 * s, { ph: 2.2, wind: 1150, grav: 1000, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -4 });
  f.cloths.push({ kind: 'coat', part: 'flap', kageOnly: 1, c: new Cloth(7, 11.4 * s, { ph: 4.7, wind: 260, grav: 1250, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });
  f.cloths.push({ kind: 'scarf', kageOnly: 1, c: new Cloth(12, 7.4 * s, { ph: 9, wind: 1400, grav: 430, stiff: 1.85 }), at: 'neck', color: ANIME.scarf, rim: 'rgba(24,6,6,0.7)', w: 6.4 * s, w1: 2.2 * s, dy: -2, dx: 7 });
  f.cloths.push({ kind: 'scarf', kageOnly: 1, c: new Cloth(10, 7 * s, { ph: 12.5, wind: 1250, grav: 480, stiff: 1.85 }), at: 'neck', color: '#a8262c', rim: 'rgba(24,6,6,0.7)', w: 4.8 * s, w1: 1.6 * s, dy: 1, dx: 6 });
}
