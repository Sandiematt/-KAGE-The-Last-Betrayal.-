import re
p='src/js/21-characters/bosses/witness/_skin.js'
s=open(p,encoding='utf-8').read()
start=s.index('/* KAGE')
end=s.index('*/',start)+2
header='''/* KAGE — the Witness, Architect of Echoes (final boss). Rebuilt from scratch on 2026-11-09 from the user's four
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
   Drawing only: no joint, timer or gameplay field is touched, and no randomness. */'''
s=s[:start]+header+s[end:]
# new keys on every look
add={
'0': "line: '#dfe3ff', dim: 'rgba(150,162,255,0.55)', panel: ['#121a78', '#3144dc', '#5468ff'], pat: '#9fb0ff', pale: ['#a9b3f2', '#d4d9ff', '#f6f7ff'], back: ['#18248c', '#3647e4', '#6476ff'], flame: ['#2436c8', '#4a5eff'], gold: '#e2a54a', goldHi: '#ffd98a', bodyInk: ['#030208', '#09081a', '#151330'], ",
'1': "line: '#eef0ff', dim: 'rgba(160,172,255,0.6)', panel: ['#141c9a', '#3949f4', '#6274ff'], pat: '#b2beff', pale: ['#b0baf6', '#dde1ff', '#ffffff'], back: ['#1a26a8', '#3b4cff', '#6a7cff'], flame: ['#2a3ce0', '#5a70ff'], gold: '#eab050', goldHi: '#ffe0a0', bodyInk: ['#030209', '#0a091e', '#171538'], ",
'2': "line: '#f0e2ff', dim: 'rgba(196,150,255,0.55)', panel: ['#2e0a70', '#6a24dc', '#9a4cff'], pat: '#4fb0ff', pale: ['#c9a9f2', '#efdcff', '#ffffff'], back: ['#3c1088', '#7e2cee', '#a860ff'], flame: ['#5a1ed6', '#3aa6ff'], gold: '#f0a850', goldHi: '#ffd890', bodyInk: ['#040209', '#0d0820', '#1c1236'], ",
'3': "line: '#ffe6ff', dim: 'rgba(236,160,255,0.55)', panel: ['#3e0874', '#9a26ea', '#c860ff'], pat: '#ffd0ff', pale: ['#e2b25c', '#ffe2a8', '#fff6dc'], back: ['#4c0c8a', '#a82cf4', '#d672ff'], flame: ['#8a1ee0', '#e05aff'], gold: '#ffc46e', goldHi: '#fff0c0', bodyInk: ['#05020a', '#100822', '#22103a'], ",
'robe': "line: '#d8ccff', dim: 'rgba(150,118,236,0.5)', panel: ['#24124c', '#5a35b8', '#8e5cf0'], pat: null, pale: ['#8e70d8', '#b8a0ff', '#e6dcff'], back: ['#24124c', '#5a35b8', '#8e5cf0'], flame: ['#3a2276', '#5a35b8'], gold: '#c41d3f', goldHi: '#ff6b8a', bodyInk: ['#030207', '#0b0914', '#231a38'], ",
}
for k,v in add.items():
  key = ('  %s: { ' % k) if k!='robe' else '  robe: { '
  i=s.index(key)
  s=s[:i+len(key)]+v+s[i+len(key):]
open(p,'w',encoding='utf-8').write(s)
print('ok')
