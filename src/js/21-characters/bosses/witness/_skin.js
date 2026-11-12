/* KAGE — the Witness, Architect of Echoes (final boss). Rebuilt from scratch on 2026-11-09 from the user's four
   phase sheets (docs/art-reference/witness-phase-1..4.webp). The Witness no longer wears the shared anime rig: its whole
   body is its own mesh (witnessBody in body.js), every part a flat near-black shape inside a pale line, as the sheets
   are drawn, with colour only where the sheets put it:
     head      a small dark wedge of a face pointing forward and down, a four-point star for its eye at the front, and
               a huge crown of lightning spikes: pale ones forward and up, coloured ones swept back, dark ones between
     collar    a tall standing collar behind the head, gold along its front edge, and a mantle flaring back in points
     torso     a dark coat with a pale line round it and a gold-lined opening down the front
     arms      the near arm in a great angular sleeve rising to a horn at the wrist, banded in the phase's colour; claws
     legs      slim dark trousers, a crimson stripe down the near shin, pointed boots
     waist     a gold-edged belt with square plaques, gold chains, a diamond pendant and a white tassel, the katana's hilt
     coat      long blade-shaped tails streaming back (cloth 'wcoat'): dark ones and ones in the phase's colour with the
               sheets' wave pattern (stars on the True Witness), every tip a curved point
     halo      a crescent behind it, never a full ring, with its echo shards floating outside it (halo.js)
     core      the white orb (I, II) or the black hole (III, IV) at the front shoulder (core.js)
     weapon    Mugen no Ha: the blue-steel greatsword (weapon.js)
   The Kage-flicker (Fighter.draw `kageFrame`) draws the whole body with Kage's own skin (animeSkin), his coat panels and
   scarf tails (cloth marked `kageOnly`, made here) and his real blade, so the flicker is Kage's new design.
   Kage can wear the Kysmei Robe (Epilogue): a violet-edged crossed chest plate with a gem and crimson veins, a standing
   collar behind his own, and the robe's fragments drifting round him (Fighter.drawKysmei).
   Drawing only: no joint, timer or gameplay field is touched, and no randomness. */

const WT_CROWN = ['#020104', '#0a0811', '#251d3b'];

const WT_ARMOR = ['#040308', '#0e0b16', '#2c2342'];           // black lacquered plates with a cool cast

const WT_CLOTH = ['#030205', '#09070e', '#19132a'];

const WT_COAT = ['#030207', '#0b0914', '#231a38'];

const WT_FAR = ['#020103', '#050409', '#0e0b16'];

/* ---- the colours of each look (2026-11-09 four-phase redesign, from the user's reference sheets) ----
   0 The Observer and 1 The Manipulator: the sheets' blue (#2e49db / #3b46fd / #4a5cff, pale #a6b0fc), gold trim;
   1 brighter, with the neon blue outline glow of its sheet; 2 The Reality Editor: violet with a cyan edge and gold
   runes; 3 The True Witness: magenta-violet, the crown and trim in gold. 'robe' is the Kysmei Robe's own violet and
   crimson, which Kage keeps when he wears it (the Epilogue). witnessPalette(f) sets them before a figure is drawn; the
   arrays below are rewritten in place, so every part file reads the current look.
     vio      the light ramp (deep, body, pale)          acc     the accent ramp (gold trim; crimson on the robe)
     edge     edge light on plate rims                    seam    seams and thin lines on the plates
     soft     the mask's rim and soft lines               tail    coat-tail light toward the tips (near: mid, tip)
     crownLit the lit edge of each crown spike            crownEdge  the light along the crown's top
     pattern  the coat tails' wave pattern                strands the hair strands (light ones; the dark ones stay dark)
     glow     the look's glow as rgb                      outline the additive outline glow (phase II's neon), or null
   and for the rebuilt body (body.js and the part files):
     line     the pale line round every part              dim     the same on the far side
     panel    the coloured coat panels and sleeve bands   pat     the wave pattern on them (stars on the True Witness)
     pale     the pale crown spikes (shade, base, light)  back    the crown's swept-back spikes
     flame    the flame curls behind the shoulders        gold, goldHi   trim, belt, chains, the hilt's fittings
     bodyInk  the near-black of the body (shade, base, light) */
const WT_LOOKS = {
  0: { line: '#dfe3ff', dim: 'rgba(150,162,255,0.55)', panel: ['#121a78', '#3144dc', '#5468ff'], pat: '#9fb0ff', pale: ['#a9b3f2', '#d4d9ff', '#f6f7ff'], back: ['#18248c', '#3647e4', '#6476ff'], flame: ['#2436c8', '#4a5eff'], gold: '#e2a54a', goldHi: '#ffd98a', bodyInk: ['#030208', '#09081a', '#151330'], vio: ['#1c268f', '#4a5cff', '#d0d6ff'], acc: ['#5a3a10', '#e8a64a', '#ffd98a'], accGlow: 'rgba(255,190,90,0.9)', edge: 'rgba(176,188,255,0.9)', seam: 'rgba(118,138,255,0.75)',
    soft: 'rgba(150,165,255,0.7)', tail: ['#141c5c', '#3445d0'], tailFar: ['#0e1440', '#222c90'], crownLit: '#c4ccff', crownEdge: '#7f8cff', pattern: 'rgba(120,140,255,0.85)',
    mark: 'rgba(214,220,255,0.95)', tear: 'rgba(110,130,255,0.9)', eye: '#a8b4ff', strands: ['#2a3aa8', '#3a4cd0', '#2232a0', '#4a5cff'], glow: [74, 92, 255], rim: [150, 165, 255], outline: null },
  1: { line: '#eef0ff', dim: 'rgba(160,172,255,0.6)', panel: ['#141c9a', '#3949f4', '#6274ff'], pat: '#b2beff', pale: ['#b0baf6', '#dde1ff', '#ffffff'], back: ['#1a26a8', '#3b4cff', '#6a7cff'], flame: ['#2a3ce0', '#5a70ff'], gold: '#eab050', goldHi: '#ffe0a0', bodyInk: ['#030209', '#0a091e', '#171538'], vio: ['#1a22a8', '#3b48fd', '#dce2ff'], acc: ['#5a3a10', '#f0b050', '#ffe0a0'], accGlow: 'rgba(255,196,100,0.9)', edge: 'rgba(160,178,255,1)', seam: 'rgba(110,130,255,0.85)',
    soft: 'rgba(140,160,255,0.8)', tail: ['#16208a', '#4a5cff'], tailFar: ['#0e1450', '#2a36b8'], crownLit: '#d6dcff', crownEdge: '#5b6bff', pattern: 'rgba(150,170,255,0.9)',
    mark: 'rgba(230,234,255,1)', tear: 'rgba(90,110,255,0.95)', eye: '#c8d0ff', strands: ['#2c3cc8', '#4050f0', '#2434b8', '#6070ff'], glow: [60, 74, 255], rim: [110, 130, 255], outline: null },
  2: { line: '#f0e2ff', dim: 'rgba(196,150,255,0.55)', panel: ['#2e0a70', '#6a24dc', '#9a4cff'], pat: '#4fb0ff', pale: ['#c9a9f2', '#efdcff', '#ffffff'], back: ['#3c1088', '#7e2cee', '#a860ff'], flame: ['#5a1ed6', '#3aa6ff'], gold: '#f0a850', goldHi: '#ffd890', bodyInk: ['#040209', '#0d0820', '#1c1236'], vio: ['#3a0a78', '#922cf8', '#e6ccff'], acc: ['#5a3010', '#f0a050', '#ffd090'], accGlow: 'rgba(255,170,90,0.9)', edge: 'rgba(206,160,255,0.9)', seam: 'rgba(90,170,255,0.8)',
    soft: 'rgba(190,140,255,0.75)', tail: ['#3a0e78', '#922cf8'], tailFar: ['#240850', '#5a1aa8'], crownLit: '#e2c6ff', crownEdge: '#a050ff', pattern: 'rgba(90,170,255,0.85)',
    mark: 'rgba(236,220,255,0.95)', tear: 'rgba(146,44,248,0.9)', eye: '#d6a8ff', strands: ['#5a1ab8', '#7a2ae0', '#4a14a0', '#922cf8'], glow: [146, 44, 248], rim: [196, 140, 255], outline: null },
  3: { line: '#ffe6ff', dim: 'rgba(236,160,255,0.55)', panel: ['#3e0874', '#9a26ea', '#c860ff'], pat: '#ffd0ff', pale: ['#e2b25c', '#ffe2a8', '#fff6dc'], back: ['#4c0c8a', '#a82cf4', '#d672ff'], flame: ['#8a1ee0', '#e05aff'], gold: '#ffc46e', goldHi: '#fff0c0', bodyInk: ['#05020a', '#100822', '#22103a'], vio: ['#4a0a70', '#b828ff', '#f6d0ff'], acc: ['#6a4210', '#ffc46e', '#fff0c0'], accGlow: 'rgba(255,200,110,0.95)', edge: 'rgba(240,176,255,0.95)', seam: 'rgba(255,196,110,0.85)',
    soft: 'rgba(230,160,255,0.8)', tail: ['#4a0a78', '#c040ff'], tailFar: ['#2c0848', '#7a18b0'], crownLit: '#ffd98a', crownEdge: '#ffc46e', pattern: 'rgba(255,220,255,0.9)',
    mark: 'rgba(255,236,255,1)', tear: 'rgba(255,196,110,0.9)', eye: '#f0baff', strands: ['#7a14c0', '#a020e8', '#6010a0', '#c040ff'], glow: [184, 40, 255], rim: [230, 160, 255], outline: null },
  robe: { line: '#d8ccff', dim: 'rgba(150,118,236,0.5)', panel: ['#24124c', '#5a35b8', '#8e5cf0'], pat: null, pale: ['#8e70d8', '#b8a0ff', '#e6dcff'], back: ['#24124c', '#5a35b8', '#8e5cf0'], flame: ['#3a2276', '#5a35b8'], gold: '#c41d3f', goldHi: '#ff6b8a', bodyInk: ['#030207', '#0b0914', '#231a38'], vio: ['#3a1f78', '#8e5cf0', '#dccbff'], acc: ['#4a0614', '#c41d3f', '#ff6b8a'], accGlow: 'rgba(255,40,90,0.9)', edge: 'rgba(176,138,255,0.85)', seam: 'rgba(150,110,240,0.75)',
    soft: 'rgba(150,118,236,0.7)', tail: ['#24124c', '#5a35b8'], tailFar: ['#1c0f3c', '#3a2276'], crownLit: '#6c4bc4', crownEdge: '#7c4fe0', pattern: null,
    mark: 'rgba(226,212,255,0.95)', tear: 'rgba(167,123,255,0.9)', eye: '#a77bff', strands: ['#5a34b8', '#6c44d2', '#4e2ca4', '#7d56e6'], glow: [167, 123, 255], rim: [132, 86, 250], outline: null }
};
const WT_VIO = WT_LOOKS.robe.vio.slice();
const WT_CRIM = WT_LOOKS.robe.acc.slice();                     // the accent: gold trim on the Witness, crimson on the robe
let WT_EDGE = WT_LOOKS.robe.edge, WT_SEAM = WT_LOOKS.robe.seam, WT_ACC_GLOW = WT_LOOKS.robe.accGlow;
let WT_L = WT_LOOKS.robe, _wtLookKey = 'robe';

/* ---- skin ---- */
ANIME_SKINS.witness = { top: 'gi', feet: 'witness', sleeve: 1, kote: false, collar: false, sash: 'witness', noGiSash: true, witness: 'boss', rimTint: [132, 86, 250] };

// set the colours for figure f (Fighter.draw calls it first): its phase's look on the Witness, the robe's on anyone else
function witnessPalette(f) {
  const key = f && f.def && f.def.witness ? WitnessBoss.lookOf(f) : 'robe';
  if (key !== _wtLookKey) {
    _wtLookKey = key; WT_L = WT_LOOKS[key] || WT_LOOKS.robe;
    for (let i = 0; i < 3; i++) { WT_VIO[i] = WT_L.vio[i]; WT_CRIM[i] = WT_L.acc[i]; }
    WT_EDGE = WT_L.edge; WT_SEAM = WT_L.seam; WT_ACC_GLOW = WT_L.accGlow;
    ANIME_SKINS.witness.rimTint = WT_L.rim;
  }
  // the hair strands take the look's colours (the dark under-strands stay dark)
  if (f && f.def && f.def.witness && f._wtStrands !== key) {
    f._wtStrands = key; let i = 0;
    for (const cl of f.cloths) if (cl.witness && cl.kind === 'scarf' && !cl.wtDark) { cl.color = WT_L.strands[i++ % WT_L.strands.length]; cl.rim = WT_EDGE; }
  }
  return WT_L;
}

const _wtPalC = new WeakMap();

function witnessPal(pal) {
  const key = _wtLookKey;
  let byLook = _wtPalC.get(pal); if (!byLook) _wtPalC.set(pal, byLook = {});
  let p = byLook[key];
  if (!p) byLook[key] = p = Object.assign({}, pal, { rim: WT_L.soft, acc: WT_CRIM[1], accHi: WT_CRIM[2], fab: WT_CLOTH, back: ['#020103', WT_CLOTH[0], WT_CLOTH[1]], coat: WT_COAT, coatB: WT_COAT, metal: WT_ARMOR });
  return p;
}

// cloth (from animeCloths): what the Kage-flicker needs that the Witness has no use for, Kage's coat panels and scarf
// tails. The crown's long violet strands and the coat tails are made in the Fighter constructor.
function witnessCloths(f, sk) {
  if (!sk.witness) return;
  const s = f.scale;
  kageCloths(f, sk, true);   // his coat tails and front flap (kage/_skin.js)
  f.cloths.push({ kind: 'scarf', kageOnly: 1, c: new Cloth(12, 7.4 * s, { ph: 9, wind: 1400, grav: 430, stiff: 1.85 }), at: 'neck', color: ANIME.scarf, rim: 'rgba(24,6,6,0.7)', w: 6.4 * s, w1: 2.2 * s, dy: -2, dx: 7 });
  f.cloths.push({ kind: 'scarf', kageOnly: 1, c: new Cloth(10, 7 * s, { ph: 12.5, wind: 1250, grav: 480, stiff: 1.85 }), at: 'neck', color: '#a8262c', rim: 'rgba(24,6,6,0.7)', w: 4.8 * s, w1: 1.6 * s, dy: 1, dx: 6 });
}
