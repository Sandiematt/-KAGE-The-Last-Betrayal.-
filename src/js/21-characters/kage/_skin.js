/* KAGE — Kage's design (rebuilt from scratch as his own mesh).
   Kage is no longer dressed on the shared rig: `Fighter.prototype.silhouette` hands any fighter whose skin has `kage`
   to kageBody (body.js), which draws the whole figure on the skeleton as sharp, flat-shaded shapes inside a fine line.
   His parts, one file each: body.js (the draw order and the part drawers), torso.js (the fitted coat, its collar, the
   obi, belt and pouch, the saya), arms.js (sleeve, pointed cuff, kote, glove, the Tachibana pauldron), legs.js (hakama
   into tall boots, shin guards), tails.js (the long coat tails and the front flap, on cloth), scarf.js (the scarf wound
   round the neck; its tails are cloth), hair.js (the swept spikes), embroidery.js (the motifs), gear/ (the shop's
   helmets and armour drawn on his body). Only the eyes and the face shape are the shared rig's (../_shared/).
   This is the armoured design. The silhouette design in shadow/ is the one drawn by default: kageBody hands over to
   kageShadowBody while KAGE_DESIGN.shadow is set (shadow/_design.js; ?kage=classic or F8 brings this one back). */

// the tones (shade, base, light) of each material, and the fine line round every part
const KG = {
  coat: ['#0a090c', '#17151b', '#302d38'], coatFar: ['#060507', '#0d0c10', '#18161c'],          // the charcoal coat
  inner: ['#050405', '#0c0b0d', '#1f1d22'], innerFar: ['#030303', '#070607', '#100f12'],        // black kimono and hakama
  metal: ['#0c0d11', '#1e2129', '#454c59'], metalFar: ['#07080a', '#101216', '#1e2128'],        // kote, suneate, sode
  boot: ['#070606', '#110f10', '#2b2728'], bootFar: ['#040404', '#0a0909', '#161415'],          // leather
  red: ['#5c0e14', '#a01c24', '#dc454b'], redFar: ['#3a090d', '#6a1218', '#8c1a20'],            // lining, obi, cords
  scarf: ['#8a161c', '#d0363c', '#f27868'],
  hair: ['#060507', '#100f13', '#33303d'],
  silver: '#aab0b8', silverHi: '#e6e9ee', steel: '#6d7380',
  line: '#4d2125', lineFar: '#2a1316', lineRed: '#3a0a0e', lineScarf: '#6a1016'
};

// `kage`: drawn by kageBody. The other fields are what the gear overlays read (the coat top, boots, the saya).
ANIME_SKINS.kage = { kage: true, top: 'coat', feet: 'boot', sleeve: 1, saya: true, collar: true, kote: true };
// young Kage (the Interlude spar): a plain training gi and hakama, straw sandals, no coat yet (the shared rig)
ANIME_SKINS.youngKage = { top: 'gi', feet: 'sandal', sleeve: 1.05, collar: false, sash: 'obi' };

// cloth (from animeCloths; `only` marks the Witness's copies, used on its Kage-flicker frames): the long back tail of
// the coat, the shorter second tail under it and the front flap over the near thigh. They hang from the waist, sweep
// back a little at rest and stream when he moves.
function kageCloths(f, sk, only) {
  if (!only && !sk.kage) return;
  const s = f.scale, k = only ? { kageOnly: 1 } : {};
  f.cloths.push(Object.assign({ kind: 'ktail', part: 'back', c: new Cloth(7, 9.6 * s, { ph: 2.2, wind: 700, grav: 1150, stiff: 1.5, hang: 0.5 }), at: 'hip', dx: 8, dy: -7 }, k));
  f.cloths.push(Object.assign({ kind: 'ktail', part: 'under', c: new Cloth(6, 9.4 * s, { ph: 5.9, wind: 460, grav: 1250, stiff: 1.5, hang: 0.34 }), at: 'hip', dx: 4, dy: -5 }, k));
  kageShadowCloths(f, k);   // the silhouette design's coat panels and scarf tails (shadow/_design.js)
  f.cloths.push(Object.assign({ kind: 'ktail', part: 'flap', c: new Cloth(6, 8.6 * s, { ph: 4.7, wind: 200, grav: 1400, stiff: 1.5, hang: 0.1 }), at: 'hip', dx: -4, dy: -5 }, k));
}
