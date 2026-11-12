/* KAGE — the Armory's armour line on Kage's shadow design (../shadow/), from the user's armory sheet: eight cuts of his
   own coat, scarf and belt, each a step up from the one before.
     tachibana  Shinobi Garb    the plain design: crimson scarf, black coat, crimson cloud scrolls (no theme, nothing added)
     ronin      Ronin Armor     rust rags: a torn hem over a rope band, shredded rag strands, rags over the shoulder
     yami       Yami Armor      violet: a shard-cut hem with a glowing edge, a violet tomoe on the tail, a dark pauldron
     shinsen    Shinsen Armor   white war-coat painted with red ink wards, a red scarf with a white streamer, a silver
                                lamellar pauldron, red cords across the chest
     raiko      Raikō Armor     gold: lightning veins branching up the coat, a gold-trimmed chest plate, Godot-baked
                                crackle over the figure
     kagehira   Kagehira Armor  crimson: a flame-cut hem burning up the tail, a crimson-seamed chest guard, baked fire
     yurei      Yūrei Armor     pale burial silk with blue spirit clouds, long tatters, a pale mantle, baked wisps
     mugen      Mugen Armor     violet fire: a burning hem, energy veins, a chest plate with a glowing ring, a dark
                                pauldron, baked violet flames on the hem and a crescent-moon halo behind his head
   A theme is: tones (KS keys swapped in for one body draw: his rim light, scarf, belt, coat and hem colours), hem (how
   the coat's hem is cut, hem.js), teeth (how many cuts), motif (the art painted along the hem, hem.js), strands (extra
   scarf strands, pieces.js), scarf2 (the short tail's colours), sode / chest (pieces.js), hair (his hairstyle on his
   bare head, hair.js; none: his own spiky hair), glow (the
   colour the hem art glows), fx (the baked Godot sheet played off the hem, glow.js), halo, acc (the accent of its
   pieces). The armour's stats and price are in ARMORS (10-data.js); `hue` there is its Armory card colour.
   Drawing only: nothing here moves a joint or touches gameplay. */
const KAGE_ARMOR = {
  ronin: {
    tones: { rim: '#d2683f', rimFar: '#8a3a26', tan: '#b48a6c', tanFar: '#76563f', red: '#8c3b22', redLo: '#4c2116',
      scarf: '#7e3624', scarfLo: '#4e2117', scarfHi: '#d0683f', belt: '#4e3424', beltLo: '#271a12', beltHi: '#9a7452',
      coat: '#1c1311', coatLo: '#110b0a', coatTan: '#a07a5e' },
    hem: 'rags', teeth: 7, motif: 'rope', strands: 4, strandW: 3.6, sode: 'rags', chest: 'sash', hair: 'ronin', acc: '#d2683f', trim: '#9a7452'
  },
  yami: {
    tones: { rim: '#b65cff', rimFar: '#5c2a90', tan: '#8a6aaa', tanFar: '#5a4672', red: '#a447ff', redLo: '#3a1660',
      scarf: '#5e24a0', scarfLo: '#371563', scarfHi: '#c58cff', belt: '#341a4e', beltLo: '#1a0d28', beltHi: '#7a3cc0',
      coat: '#120c17', coatLo: '#09070d', coatTan: '#8a6aaa' },
    hem: 'shards', teeth: 5, motif: 'tomoe', strands: 3, strandW: 3.2, sode: 'plate', chest: 'strap', hair: 'ponytail', glow: '#b04bff', acc: '#b65cff'
  },
  shinsen: {
    tones: { rim: '#ff5a5a', rimFar: '#9a2026', red: '#c8202c', redLo: '#7a1218', scarf: '#c8202c', scarfLo: '#7a1218', scarfHi: '#ff6464',
      belt: '#8a1a20', beltLo: '#4a0e12', beltHi: '#d0303a', coat: '#ebe6ee', coatLo: '#b8b0c2', coatTan: '#8f8698' },
    scarf2: ['#ece8f0', '#aea6b8', '#ffffff'], hem: 'shards', teeth: 4, motif: 'wards', strands: 2, strandW: 3.4, strand2: true,
    sode: 'silver', chest: 'cords', hair: 'swept', acc: '#ece8f0'
  },
  raiko: {
    tones: { rim: '#ffc23a', rimFar: '#9a6a14', tan: '#c99a52', tanFar: '#7a5c30', red: '#ffcf4a', redLo: '#5e3e0a',
      scarf: '#b07a14', scarfLo: '#5e3e0a', scarfHi: '#ffe08a', belt: '#3a2a10', beltLo: '#1e150a', beltHi: '#c8961e',
      coat: '#140f09', coatLo: '#0b0805', coatTan: '#c99a52' },
    hem: 'shards', teeth: 5, motif: 'lightning', strands: 3, strandW: 3.2, sode: 'guard', chest: 'plate', hair: 'mane', glow: '#ffb21a', acc: '#ffc23a', fx: 'lightning_gold'
  },
  kagehira: {
    tones: { rim: '#ff3c3c', rimFar: '#9a1a1e', tan: '#c46a5a', red: '#e8222c', redLo: '#6a0c12', scarf: '#d01c26', scarfLo: '#7e101a', scarfHi: '#ff6a5a',
      belt: '#5a1014', beltLo: '#2a080a', beltHi: '#c0202c', coat: '#160808', coatLo: '#0c0505' },
    hem: 'flames', teeth: 5, motif: 'flames', strands: 2, strandW: 3.6, sode: 'guard', chest: 'lamellar', hair: 'shaggy', glow: '#ff2a36', acc: '#ff3c3c', fx: 'flame_crimson'
  },
  yurei: {
    tones: { rim: '#e4dcff', rimFar: '#6e6890', tan: '#9fb0dc', tanFar: '#6a7498', red: '#4f86d8', redLo: '#2c4a86',
      scarf: '#d4daf0', scarfLo: '#8e98bc', scarfHi: '#ffffff', belt: '#262838', beltLo: '#141520', beltHi: '#5a6284',
      coat: '#d6daee', coatLo: '#9aa2c4', coatTan: '#7a84aa' },
    hem: 'tatters', teeth: 6, motif: 'spirit', strands: 4, strandW: 3.4, sode: 'mantle', chest: 'mantle', hair: 'bun', glow: '#8fc2ff', acc: '#8fc2ff', fx: 'wisp_pale'
  },
  mugen: {
    tones: { rim: '#d474ff', rimFar: '#6a2a9a', tan: '#a070c4', tanFar: '#64447e', red: '#c04bff', redLo: '#4a1470',
      scarf: '#7428b4', scarfLo: '#43166c', scarfHi: '#e2a4ff', belt: '#36124c', beltLo: '#1a0826', beltHi: '#f060ff',
      coat: '#100a16', coatLo: '#08060c', coatTan: '#a070c4' },
    hem: 'flames', teeth: 6, motif: 'violetfire', strands: 4, strandW: 3.6, sode: 'plate', chest: 'emblem', hair: 'spectral', glow: '#c04bff', acc: '#d474ff',
    fx: 'flame_violet', halo: true, art: 'mugen'   // drawn from the user's card art when it has decoded (mugen.js)
  }
};

// the theme of the armour a fighter wears (null: the plain design, or not one of these looks)
function kageArmorTheme(f) { return (f && KAGE_ARMOR[f.armor]) || null; }

// swap a theme's tones into KS for one body draw (null puts the plain tones back)
function kageArmorTones(th) {
  if (!th) { Object.assign(KS, KS_BASE); return; }
  Object.assign(KS, KS_BASE, th.tones);
}

// a steady pseudo-random number in [0, 1) from a seed: the armour art never draws from Math.random (the gameplay-lock
// tests seed that stream)
function _kaHash(x) { const v = Math.sin(x * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); }

// the draw frame of a piece drawn outside the body's own pass (drawArmor): the spine frame, the two lights, and a flat
// flag from the call's options
function _kaFrame(f, opt) {
  const flat = !!(opt && opt.color), fc = f.facing;
  return { f, A: { flat, col: flat ? opt.color : null }, S: animeSpine(f), s: f.scale, fc, t: f.time || 0, hr: BODY.head * f.scale * f.build.head * 0.92,
    rx: -fc * 0.85, ry: 0.52, tx: fc, ty: -0.12, floor: f.y, th: kageArmorTheme(f) };
}
