"""Write vfx/briefs/VFX_Takashi_*.json: the design text below plus each layer's full indexed path and absolute exit
frame, expanded from the recipe itself (so a moved layer cannot leave a stale path in the brief). Like
write_briefs.py (Akari's), for Takashi's gold set.

Run with the effekseer-vfx toolchain python from the game root:
  ~/.cache/effekseer-vfx/venv/Scripts/python.exe vfx/tools/write_takashi_briefs.py
then `vfx brief-validate <ID>` for each effect.
"""
import importlib.util, json, os, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[2]
SKILL = Path(os.environ.get('EFFEKSEER_VFX_SKILL', Path.home() / '.claude/skills/effekseer-vfx'))
os.environ.setdefault('VFX_PROJECT', str(HERE))
sys.path[:0] = [str(SKILL / 'scripts'), str(HERE / 'vfx/src')]
from vfxkit.primitives import lifetime   # noqa: E402

STYLE = 'stylized anime combat, additive holy gold over a dark fortress night (and his golden domain), side-view 2D, baked to sheets'
PALETTE = dict(core=[255, 250, 232], body=[255, 186, 64], dark=[40, 22, 4], matter=[156, 132, 100], accent=[214, 118, 22])
REFERENCE = {'id': 'user reference sheets: Takashi the Father, Yashiro Titan (phase II) and Ogon Musojin / Tenrai domain (phase III)'}

# role per layer name (exact, or a name followed by a number), primitive label
ROLES = {
    'Launch ring': ('launch speed carrier left at the hand', 'shock_ring'),
    'Head glow': ('head: small gold glow round the kunai', 'glow'),
    'Head kunai': ('head: the kunai silhouette, pale gold', 'sprite T_Kunai01'),
    'Streak': ('trail: thin amber streak that erodes', 'sprite T_Streak01'),
    'Shed sparks': ('secondary: sparks dropping off the path', 'radial_sparks'),
    'Contact flash': ('contact', 'flash'), 'Contact star': ('contact', 'flash'), 'Eruption flash': ('release', 'flash'),
    'Gold bloom': ('subordinate light under the contact', 'glow'), 'Ground bloom': ('light on the floor under the blow', 'glow'),
    'Gold ring': ('body: gold ring eroding', 'shock_ring'), 'Enso': ('body: thin enso ring opening', 'tilted_ring'),
    'Fast streaks': ('secondary tier 1: fast white streaks back along the throw', 'radial_sparks'),
    'Deflect streaks': ('secondary tier 1: hard streaks thrown back at the attacker', 'radial_sparks'),
    'Sparks': ('secondary: gold sparks in tiers', 'spark_burst'),
    'Embers': ('residue: gold embers rising and hanging', 'motes'), 'Scar embers': ('residue: embers rising off the scar', 'motes'),
    'Swing plane': ('pivot setting the blade arc into its swing plane', 'swing'),
    'Afterimage': ('amber motion smear lagging the blade', 'slash_arc'), 'Blade body': ('main shape: saturated gold arc', 'slash_arc'),
    'Hot edge': ('core: thin white-hot leading edge', 'slash_arc'),
    'Seal': ('ownership: the family tomoe seal on the floor', 'decal T_TomoeSeal01'),
    'Floor glow': ('anticipation: light on the floor where it will erupt', 'orbit_band'),
    'Floor light': ('a faint band of light on the floor', 'orbit_band'), 'Mark': ('anticipation: the mark tightening on the floor', 'orbit_band'),
    'Gather': ('anticipation: motes drawn in', 'motes'), 'Floor shock': ('ground feedback ring at release', 'tilted_ring'),
    'Light column': ('main shape: the column of gold light', 'column'), 'Column core': ('core of the column', 'column'),
    'Flame tongues': ('secondary: pale gold flame licking upward', 'flame'), 'Halo': ('holy secondary: a halo rising', 'tilted_ring'),
    'Up streaks': ('secondary: streaks shooting up', 'radial_sparks'), 'Dust': ('matter: dust', 'smoke'),
    'Mantle': ('sustained: dim gold mantle the height of the Titan', 'sprite T_Glow01'),
    'Spirit column': ('sustained volume: faint spectral column', 'column'), 'Rising streaks': ('surface motion: streaks climbing the column', 'speed_streaks'),
    'Rising wisps': ('shape change: broken wisps rising', 'wisps'),
    'Blade glint': ('anticipation: where the blade starts', 'glow'), 'Floor slice': ('release: one long thin line along the floor', 'slice_line'),
    'Drag sparks': ('secondary: sparks dragged behind the blade', 'radial_sparks'), 'Stone': ('matter: stone thrown up, landing', 'debris'),
    'Dust wall': ('matter: a wall of dust along the cut', 'smoke'),
    'Falling blade': ('main shape: the giant sword falling point first', 'sprite T_GiantBladeV01'),
    'Fall streak': ('speed carrier above the falling sword', 'sprite T_Streak01'),
    'Standing blade': ('body: the sword standing in the floor, eaten away', 'sprite T_GiantBladeV01'),
    'Floor ring': ('ground feedback ring', 'tilted_ring'), 'Cracks': ('ground: gold cracks cooling', 'decal T_Crack01'),
    'Rising shards': ('holy secondary: light shards thrown up', 'radial_sparks'),
    'Shock ring': ('main shape: wide gold shock ring racing out along the floor', 'tilted_ring'),
    'Trailing ring': ('a thinner ring behind the first', 'tilted_ring'), 'Air wave': ('the air shock at contact', 'shock_ring'),
    'Blade glow': ('the planted blade glowing', 'column'), 'Crack sparks': ('surface motion: sparks off the cracks at uneven times', 'radial_sparks'),
    'Scorch': ('ground footprint', 'decal T_SoftCircle Blend'), 'Sky opens': ('anticipation: the sky opening gold', 'glow'),
    'Leader': ('anticipation: dim stepped leader', 'sprite T_ArcStrand01'), 'Pillar': ('main volume: pillar of gold light', 'column'),
    'Pillar core': ('core of the pillar', 'column'), 'Bolt body': ('main stroke: the gold bolt', 'sprite T_ArcStrand01'),
    'Bolt core': ('core: white-hot bolt core', 'sprite T_ArcStrand01'), 'Return body': ('return stroke on another path', 'sprite T_ArcStrand01'),
    'Return core': ('return stroke core', 'sprite T_ArcStrand01'), 'Ground shock': ('ground feedback ring', 'tilted_ring'),
    'Ash': ('matter: ash rising', 'smoke'),
}

BRIEFS = {
    'VFX_Takashi_Kunai': dict(role='projectile (Golden Kunai, Kunai Execution)', dominant_shape='a pale gold kunai flying flat with a thin amber streak',
        beats=[(2, 'launch', 'gold ring at the hand, kunai leaves'), (12, 'flight', 'the kunai silhouette reads, not a glow ball'), (24, 'arrival', 'head released; the streak stays on the path')],
        acceptance=['The kunai shape (ring, grip, blade) reads at combat distance', 'Sparks fall behind the path'], avoid=['A white glow ball hiding the kunai']),
    'VFX_Takashi_Kunai_Impact': dict(role='paired projectile impact', dominant_shape='a gold ring with sparks thrown back along the throw',
        beats=[(1, 'contact', 'short white contact'), (6, 'body', 'gold ring and two speeds of sparks'), (24, 'tail', 'embers rising')],
        acceptance=['The white contact is gone by f6'], avoid=['A white blob lasting more than five frames']),
    'VFX_Takashi_Parry': dict(role='frequent defensive hit (the Iron Guard parry, the execution pin)', dominant_shape='a gold crescent across the contact with sparks fanned back',
        beats=[(1, 'contact', 'gold crescent and a small star'), (6, 'body', 'enso ring opening, sparks fanned back'), (20, 'tail', 'embers')],
        acceptance=['The crescent reads before the star takes over', 'Sparks go back toward the attacker'], avoid=['A full-screen flash on every parry']),
    'VFX_Takashi_Manifest': dict(role='phase entrance (the Yashiro Titan rising)', dominant_shape='a column of gold light erupting out of the family seal',
        beats=[(6, 'seal', 'the tomoe seal opens on the floor, motes drawn in'), (14, 'release', 'eruption flash, the column shoots up'), (40, 'body', 'halos rising, flame licking up'), (96, 'tail', 'the column thinned, embers hanging')],
        acceptance=['The seal reads before the eruption', 'The column keeps its gold after the flash'], avoid=['Orange fireball puffs']),
    'VFX_Takashi_Aura': dict(role='sustained status round the Yashiro Titan', dominant_shape='a faint spectral gold column with streaks climbing it',
        beats=[(20, 'arrive', 'column and floor light fade in'), (60, 'hold', 'streaks and embers climbing'), (110, 'loop', 'no seam')],
        acceptance=['Never the brightest thing on screen', 'Takashi and the Titan read through it'], avoid=['Fire flipbook puffs']),
    'VFX_Takashi_Titan_Slash': dict(role='boss melee (Titan Slash): the arena-wide low sweep', dominant_shape='a long, flat gold crescent skimming the floor',
        beats=[(1, 'glint', 'blade glint'), (7, 'contact', 'slice line along the floor, star'), (12, 'body', 'gold arc sweeping with a white edge'), (36, 'tail', 'dust wall and embers')],
        acceptance=['The arc reads as a sweep across the floor, wider than a character', 'White only on the leading edge'], avoid=['A small upright crescent']),
    'VFX_Takashi_Blade_Fall': dict(role='targeted boss hazard (Blade Rain, one blade)', dominant_shape='a giant gold sword falling point first and standing in the floor',
        beats=[(4, 'mark', 'gold mark on the floor'), (16, 'fall', 'the sword reads as a sword while falling'), (18, 'contact', 'white contact, ring, cracks'), (40, 'tail', 'the blade eaten away, halo rising')],
        acceptance=['The falling sword reads as a sword, not a white streak', 'It stands in the floor after the hit'], avoid=['A thin needle of light']),
    'VFX_Takashi_Pulse': dict(role='area boss hit (Domain Pulse, Heaven Cleaver landing)', dominant_shape='a wide gold shock ring racing out along the floor',
        beats=[(2, 'contact', 'white contact on the floor'), (12, 'body', 'ring racing out, cracks under the blow'), (36, 'tail', 'dust and embers')],
        acceptance=['The ring reads as running along the floor', 'Light rises (shards, halo), it does not rain down'], avoid=['A floating bubble']),
    'VFX_Takashi_Crack': dict(role='sustained channel (Tenrai: the planted sword)', dominant_shape='the family seal turning round gold cracks that pulse',
        beats=[(14, 'arrive', 'seal and cracks fade in'), (45, 'hold', 'cracks pulse, sparks shoot up'), (85, 'loop', 'no seam')],
        acceptance=['The cracks pulse instead of flashing', 'The seal turns slowly'], avoid=['A steady white blob']),
    'VFX_Takashi_Thunder': dict(role='finisher (Tenrai: the divine thunder that kills)', dominant_shape='a jagged gold bolt inside a pillar of gold light',
        beats=[(6, 'leader', 'dim leader feeling its way down'), (12, 'strike', 'bolt with a white core'), (20, 'return', 'return stroke on another path'), (44, 'body', 'gold pillar thinning'), (70, 'tail', 'cracks cooling, embers')],
        acceptance=['The bolt reads inside the pillar', 'The white is gone within four frames'], avoid=['A white wash hiding the bolt']),
}


def load(effect_id):
    spec = importlib.util.spec_from_file_location(effect_id, HERE / 'vfx/src' / f'{effect_id}.py')
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module.recipe()


def role(name):
    if name in ROLES: return ROLES[name]
    base = re.sub(r'(\s+\d+)+$', '', name)
    if base in ROLES: return ROLES[base]
    for key, value in ROLES.items():   # spark_burst tiers ('Sparks streaks', 'Sparks heavy'), 'Fork 1 2'...
        if name.startswith(key + ' '): return value
    if name.startswith('Fork'): return ('branch forks off the bolt', 'sprite T_ArcStrand01')
    raise KeyError(f'no role for layer {name!r}')


def plan(layers, prefix='', start=0):
    out = []
    for i, layer in enumerate(layers):
        path = f'{prefix}{i}:{layer["name"]}'
        r, prim = role(layer['name'])
        out.append(dict(name=path, role=r, primitive=prim, exit=f'gone by absolute f{lifetime(layer, start)}'))
        out += plan(layer.get('children', []), path + '/', start + layer.get('delay', 0))
    return out


def main():
    for effect_id, d in BRIEFS.items():
        recipe = load(effect_id)
        brief = dict(schema_version=1, effect_id=effect_id, role=d['role'], style=STYLE, dominant_shape=d['dominant_shape'],
                     palette=PALETTE, delivery=recipe.get('delivery', {'kind': 'self'}), anchor=recipe['attach'], reference=REFERENCE,
                     beats=[dict(frame=f, name=n, expect=e) for f, n, e in d['beats']],
                     layer_plan=plan(recipe['layers']), acceptance=d['acceptance'], avoid=d['avoid'])
        out = HERE / 'vfx/briefs' / f'{effect_id}.json'
        out.write_text(json.dumps(brief, indent=2) + '\n', encoding='utf-8')
        print('wrote', out.name, len(brief['layer_plan']), 'layers')


if __name__ == '__main__':
    main()
