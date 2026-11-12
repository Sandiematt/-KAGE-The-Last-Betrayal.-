/* KAGE — the Hollows as torn, spectral anime samurai (anime redesign, ticket 04).
   A Hollow is a memory of a samurai coming apart: the same black-faced, white-eyed figure as everyone else, but its
   robes are ragged and layered, the hems torn into points, the sleeves frayed, the limbs bound in wraps, and the face
   half hidden by cracked mask fragments that glow violet along the breaks. Under them each has a gaunt face of its own
   (the `face` of its skin, _shared/face.js), and every mask breaks off before the parted mouth and the chin. Violet replaces crimson as the accent, in
   near-black cloth. The glitch, offset ghost, violet flicker, outline and memory-ash dissolve of Fighter.draw sit on top.
   Each type reads apart by its silhouette at gameplay zoom:
     hollow_shade     the cutter: a ragged cowl with a crown of floating shards, a cracked half-mask, a torn haori skirt
                      to the calf, a rip across the chest, a saya
     hollow_tutorial  the training husk: a stitched sack hood with straw bursting from its crown, a plank practice mask
                      strapped over the eyes, rope bindings crossed over the chest, straw at the cuffs, a short rag skirt
     hollow_flicker   the dagger: slim and hunched, a hood peaked forward like a beak with two long torn tails, a thin
                      cracked visor, a torso bound in wraps, narrow wrapped legs, one long split tatter behind
     hollow_ward      the staff monk: a broken tengai (woven basket hat) cracked open over the face, a patchwork kesa and a
                      juzu of mask beads, huge frayed sleeves, a robe to the ankles
     hollow_mimic     the crescents: a full cracked mask with a crescent-moon shard crest, a cracked mirror on the chest,
                      a long torn cape from the shoulders
     hollow_husk      the fists brute: a heavy horned brow mask, a ragged mantle humped over the shoulders, a torn robe
                      open on a chest of glowing cracks, bare wrapped forearms and huge bandaged fists, a shimenawa rope
                      belt hung with shide papers
     hollow_kage      the ronin (the Witness's copies of Kage): swept hair tied in a topknot with a violet cord and a torn
                      violet hachimaki, a shard over one cheek, Kage's long coat cut, torn at the hem
   Everything here is drawing: parts are celFill paths on the skeleton, honour the flat passes (A.flat) and move no joint.
   hollow_shard and hollow_rags are enemy-only keys. Utsushi (hollow_rags, ticket 05) has no skin entry here and gets the
   generic torn torso; Hollow Rem and the Hollow boss echoes keep their own looks under the Hollow palette. */

// cracked mask fragments: a dull ash-violet lacquer, the lightest thing on a Hollow after its eyes
const HOLLOW_MASK = ['#1d1a25', '#363143', '#625b76'];

const HOLLOW_MASK_FAR = ['#121017', '#1e1b26', '#2e2a38'];

const HOLLOW_WRAP = ['#0e0c12', '#1b1822', '#312d3b'];    // bandage wraps (kote, shins, fists, the flicker's torso)

const HOLLOW_ROPE = ['#17130d', '#2b241a', '#4a3f2c'];    // the husk's rope

const HOLLOW_STRAW = ['#2a2216', '#4a3d27', '#6c5a3a'];   // straw bursting from the training husk

const HOLLOW_WOOD = ['#14100c', '#241d16', '#3d3226'];    // its plank practice mask

const HOLLOW_SACK = ['#120f0d', '#1f1a16', '#342d26'];    // its sack hood

const HOLLOW_WEAVE = ['#0c0a0f', '#18151d', '#2d2935'];   // the monk's tengai

const HOLLOW_KESA = ['#1a1230', '#2a2048', '#43366e'];    // the monk's kesa, the one violet-dyed cloth

const HOLLOW_GLOW = 'rgba(140,110,240,0.42)';

// one design per Hollow type; robe parts are [links, link length px, width at the waist, width at the hem] (design units)
const _hollowBase = { top: 'gi', feet: 'sandal', kote: 'wrap', collar: false, sash: 'hollow', wrapShin: true };

// the faces (_shared/face.js): gaunt and hollow-cheeked, the mouth a little parted, a violet light down the profile;
// each type its own (the masks of head.js are sculpted on faces too, and stop short of the mouth and chin)
const HOLLOW_FACE_LIGHT = '#9a80f6';
const _hollowFace = (o) => Object.assign({ of: 'gaunt', light: HOLLOW_FACE_LIGHT, depth: 0.1 }, o);

ANIME_SKINS.hollow_shade = Object.assign({}, _hollowBase, { sleeve: 1.04, saya: true,
  face: _hollowFace({ nose: 1.15, open: 0.1 }),
  hollow: { head: 'shade', top: 'rip', fray: 1, robe: { back: [7, 11, 22, 50], flap: [6, 10.5, 15, 30], teeth: 6, rag: 9 } } });

ANIME_SKINS.hollow_tutorial = Object.assign({}, _hollowBase, { sleeve: 1, sash: 'rope',
  face: _hollowFace({ nose: 0.92, up: 0.03, lip: 0.85, chin: 0.9, jaw: 0.94, brow: 0.8, open: 0.07 }),
  hollow: { head: 'sack', top: 'rope', fray: 'straw', robe: { back: [4, 10, 22, 32], flap: [4, 9.5, 16, 24], teeth: 4, rag: 6 } } });

ANIME_SKINS.hollow_flicker = Object.assign({}, _hollowBase, { sleeve: 0.82,
  face: _hollowFace({ nose: 1.3, hook: 0.05, lip: 0.6, chin: 0.86, jaw: 0.78, slope: 0.04, open: 0.13 }),
  hollow: { head: 'beak', top: 'wrap', fray: 0.8, legW: 0.84, tails: true, mantle: 'hunch', robe: { back: [8, 10, 12, 20], teeth: 3, rag: 11 } } });

ANIME_SKINS.hollow_ward = Object.assign({}, _hollowBase, { sleeve: 1.26, wrapShin: false,
  face: _hollowFace({ nose: 1.36, hook: 0.08, lip: 0.6, chin: 1.14, jaw: 0.9, brow: 1.4, slope: 0.03, open: 0.07 }),
  hollow: { head: 'tengai', top: 'kesa', fray: 1.25, robe: { back: [9, 10.5, 26, 60], flap: [8, 10.5, 20, 40], teeth: 7, rag: 8 } } });

ANIME_SKINS.hollow_mimic = Object.assign({}, _hollowBase, { sleeve: 1.1,
  face: _hollowFace({ nose: 1.0, lip: 0.7, chin: 0.96, jaw: 0.86, open: 0.15 }),
  hollow: { head: 'crescent', top: 'mirror', fray: 1.3, cape: true, robe: { back: [6, 10.5, 20, 40], flap: [5, 10, 14, 26], teeth: 5, rag: 8 } } });

ANIME_SKINS.hollow_husk = Object.assign({}, _hollowBase, { sleeve: 1.12, sash: 'shimenawa',
  face: _hollowFace({ nose: 0.98, lip: 0.95, chin: 1.35, jaw: 1.35, brow: 2.1, open: 0.13 }),
  hollow: { head: 'brute', top: 'veins', fray: 1, bare: true, mantle: true, fist: true, robe: { back: [5, 11, 30, 46], flap: [5, 10.5, 22, 34], teeth: 6, rag: 7 } } });

// Kage's own profile (the short straight nose, the pointed chin), drawn thin: the lips pressed, the mouth just parted
ANIME_SKINS.hollow_kage = Object.assign({}, _hollowBase, { top: 'coat', collar: true, sleeve: 1, feet: 'boot', saya: true, wrapShin: false,
  face: _hollowFace({ of: 'base', lip: 0.8, jaw: 0.9, open: 0.06 }),
  hollow: { head: 'ronin', top: 'coat', fray: 0.9, robe: { back: [8, 12, 22, 58], flap: [7, 11.4, 16, 34], teeth: 6, rag: 10 } } });

// cloth the Hollow designs need (from animeCloths): the torn robe panels from the waist, the mimic's cape from the
// shoulders, the flicker's two long hood tails
function hollowCloths(f, sk) {
  const s = f.scale, h = sk.hollow, r = h.robe;
  if (h.cape) f.cloths.push({ kind: 'hrobe', part: 'cape', c: new Cloth(8, 10 * s, { ph: 5.5, wind: 760, grav: 820, stiff: 1.3, hang: 0.4 }), at: 'sh', dx: 5, dy: 2 });
  if (r.back) f.cloths.push({ kind: 'hrobe', part: 'back', c: new Cloth(r.back[0], r.back[1] * s, { ph: 2.6, wind: 1050, grav: 1000, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -4 });
  if (r.flap) f.cloths.push({ kind: 'hrobe', part: 'flap', c: new Cloth(r.flap[0], r.flap[1] * s, { ph: 5.1, wind: 260, grav: 1250, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });
  if (h.tails) {
    f.cloths.push({ kind: 'scarf', c: new Cloth(11, 7.4 * s, { ph: 3.7, wind: 1300, grav: 500, stiff: 1.85 }), at: 'head', color: '#1a1430', rim: 'rgba(96,70,190,0.7)', w: 7.6 * s, w1: 1.6 * s, dy: -8, dx: 13 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(9, 7 * s, { ph: 7.4, wind: 1150, grav: 580, stiff: 1.85 }), at: 'head', color: '#110d20', rim: 'rgba(96,70,190,0.7)', w: 5.6 * s, w1: 1.2 * s, dy: -4, dx: 12 });
  }
}
