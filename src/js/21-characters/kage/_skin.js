/* KAGE — Kage's anime design (docs/art-reference/STYLE.md, "Kage").
   His parts, one file each: hair.js (the wild swept spikes), scarf.js (the red scarf wound round the neck; its tails
   are cloth), coat.js (the long charcoal coat's back panel and front flap), embroidery.js (the crimson cloud / wave /
   plum motifs on the hem and back), sash.js (the crimson sash, belt and silver buckle), gear/ (the shop's helmets and
   armour drawn on his body). The face, eyes, torso, arms, hands, legs and boots are the shared rig (../_shared/),
   dressed by the skin below. */

// Kage: long charcoal coat open at the front, split at the back, crimson-embroidered hem and cuffs, crimson sash with
// a dark belt and silver buckle, black inner kimono, hakama into tall strapped boots, the saya at his hip
ANIME_SKINS.kage = { top: 'coat', coat: { w0: 22, w1: 66, fw0: 16, fw1: 36, embroider: true }, feet: 'boot', sleeve: 1, sash: 'kage', saya: true, collar: true, wrap: true, cuff: true, kote: true };
// young Kage (the Interlude spar): a plain training gi and hakama, straw sandals, no coat yet
ANIME_SKINS.youngKage = { top: 'gi', feet: 'sandal', sleeve: 1.05, collar: false, sash: 'obi' };
