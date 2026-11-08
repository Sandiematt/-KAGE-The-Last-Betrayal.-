"""Write vfx/briefs/VFX_Rage_*.json: the design text below plus each layer's full indexed path and absolute exit
frame, expanded from the recipe itself (so a moved layer cannot leave a stale path in the brief). Like
write_takashi_briefs.py, for Kage's seven rage arts (src/js/67-rage-arts.js plays them).

Run with the effekseer-vfx toolchain python from the game root:
  ~/.cache/effekseer-vfx/venv/Scripts/python.exe vfx/tools/write_rage_briefs.py
then `vfx brief-validate <ID>` for each effect.
"""
import importlib.util, json, os, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[2]
SKILL = Path(os.environ.get('EFFEKSEER_VFX_SKILL', Path.home() / '.claude/skills/effekseer-vfx'))
os.environ.setdefault('VFX_PROJECT', str(HERE))
sys.path[:0] = [str(SKILL / 'scripts'), str(HERE / 'vfx/src')]
from vfxkit.primitives import lifetime   # noqa: E402
import _rage   # noqa: E402

STYLE = 'stylized anime combat, additive light over a dark arena, side-view 2D, baked to sheets and turned per strike in the game'
REFERENCE = {'id': 'user request 2026-11-08: Kagetsu crimson moon slashes, Tsubame lightning afterimages, Shizuka purple energy slashes, Onikiri crimson ground-shattering impacts, Mizuchi giant blue water dragon, Yamigama enormous scythe crescents, Iwakudaki golden ground-impact shockwaves'}

ROLES = {
    'Blade glint': ('anticipation: where the blade starts', 'glow'),
    'Swing plane': ('pivot setting the blade arc into its swing plane', 'swing'),
    'Afterimage': ('motion smear lagging the blade', 'slash_arc'), 'Blade body': ('main shape: the saturated crescent', 'slash_arc'),
    'Hot edge': ('core: thin white-hot leading edge', 'slash_arc'), 'Cel crescent': ('painted cel crescent held a few frames, in the body colour', 'sprite T_Slash02'),
    'Moon rim': ('the moon halo: a thin pale rim holding outside the cut', 'slash_arc'), 'Outer edge': ('a thin pale outer edge holding a beat', 'slash_arc'),
    'Contact flash': ('contact', 'flash'), 'Echo star': ('the second cut opening: small contact', 'flash'),
    'Crimson bloom': ('subordinate light under the contact', 'glow'), 'Violet bloom': ('subordinate light under the cut', 'glow'),
    'Storm bloom': ('subordinate light', 'glow'), 'Ground bloom': ('light on the floor under the blow', 'glow'), 'Water bloom': ('light under the splash', 'glow'),
    'Gold bloom': ('light under the hammer', 'glow'),
    'Shards': ('secondary: shards in tiers along the cut', 'spark_burst'),
    'Moon motes': ('residue: red motes that hang', 'motes'), 'Hush motes': ('residue: slow lilac motes', 'motes'), 'Soul motes': ('residue: motes rising', 'motes'),
    'Rising embers': ('residue: embers rising off the scar', 'motes'), 'Gold dust': ('residue: gold dust rising and hanging', 'motes'),
    'Glints': ('accent: star glints', 'sparkle'),
    'Core line': ('core: the hair-thin white line through the foe', 'slice_line'), 'Streak glow': ('body light along the streak', 'sprite T_Glow01'),
    'Bolt': ('main stroke: jagged cyan bolt of painted strands', 'sprite T_ArcStrand01'), 'Restrike': ('re-strike on another path, mirrored', 'sprite T_ArcStrand01'),
    'After flicker': ('after-flicker as it dies', 'sprite T_ArcStrand01'), 'Fork': ('forks spitting off the bolt', 'sprite T_ArcStrand01'),
    'Spat sparks': ('secondary: sparks flying on through the target', 'radial_sparks'),
    'Silent line': ('the first cut: appears whole, no wind-up', 'slice_line'), 'Violet line': ('body: the violet band under the line', 'slice_line'),
    'Thin arc': ('a long, nearly straight thin arc', 'slash_arc'), 'Echo cut': ('the silent second cut a beat later', 'slice_line'),
    'Needles': ('secondary: needles of light along the second cut', 'radial_sparks'),
    'Smoke': ('matter: dark smoke the fire cools into', 'smoke'), 'Crack': ('ground: the red-hot split cooling', 'decal T_Crack01'),
    'Shock ring': ('ground feedback: ring racing out along the floor', 'tilted_ring'), 'Fire tongue': ('body: fire erupting from the split', 'flame'),
    'Eruption': ('body: the fireball boiling up', 'billow'), 'Spit embers': ('secondary: embers spat up', 'radial_sparks'), 'Rock': ('matter: rock thrown up, landing', 'debris'),
    'Mist': ('matter: low blue haze', 'smoke T_SoftCircle'), 'Wave ring': ('ground: the first wave racing out', 'tilted_ring'), 'Second wave': ('a second wave behind it', 'tilted_ring'),
    'Third wave': ('the third, smallest wave', 'tilted_ring'), 'First wave': ('ground: the widest wave racing out', 'tilted_ring'),
    'Water column': ('body: the column of water shooting up', 'column'), 'Crown': ('body: the crown of water streaks arcing over and falling', 'radial_sparks'),
    'Spray': ('secondary: wider droplet spray', 'radial_sparks'),
    'Shadow smoke': ('matter: shadow smoke rolling out', 'smoke'), 'Gathering strands': ('anticipation: dark strands drawn in', 'wisps'),
    'Reap sparks': ('secondary: violet sparks reaped off the blade', 'radial_sparks'),
    'Dust wall': ('matter: a wall of dust', 'smoke'), 'Rune seal': ('ownership: the golden rune seal under the hammer', 'decal T_Rune02'),
    'Fault': ('ground: the gold fault with a hot rim, eroding', 'decal T_Crack01'), 'Light shaft': ('short shafts of light standing up off the floor', 'standing T_Glow01'),
    'Boulders': ('matter: heavy boulders thrown up, landing', 'debris'), 'Gold chips': ('secondary: gold chips flying', 'radial_sparks'),
}

BRIEFS = {
    'VFX_Rage_Crimson_Crescent': dict(pal='CRIMSON', role='rage art cut (Kagetsu, Crimson Moon): one per cut, 2.4x as the finisher', dominant_shape='a wide crimson crescent with a pale moon rim',
        beats=[(1, 'glint', 'blade glint'), (4, 'contact', 'crescent sweeps open, white only on the edge'), (12, 'body', 'crimson body and the rim, shards along the cut'), (30, 'tail', 'the rim and motes hang')],
        acceptance=['The crescent reads crimson, not white', 'The rim outlasts the body like a moon halo'], avoid=['A white arc with a red tint']),
    'VFX_Rage_Swallow_Bolt': dict(pal='BOLT', role='rage art strike (Tsubame, Thousand Swallows): eight per art from eight directions', dominant_shape='a straight jagged cyan bolt through the target',
        beats=[(1, 'contact', 'core line and bolt at once'), (4, 'restrike', 'the bolt struck again on another path'), (11, 'flicker', 'dim after-flicker')],
        acceptance=['It never travels: it strikes, re-strikes, flickers', 'The core line is hair-thin'], avoid=['A soft glow tube']),
    'VFX_Rage_Violet_Slash': dict(pal='VIOLET', role='rage art cut (Shizuka, Silent Moon): a lattice of them, and the delayed silent cut', dominant_shape='a hair-thin white line over a violet band',
        beats=[(0, 'cut', 'the line appears whole, no wind-up'), (10, 'echo', 'the second cut opens a beat later with a small star'), (20, 'tail', 'lilac motes drift')],
        acceptance=['A beat of nothing between the two cuts', 'Quiet: no burst, no debris'], avoid=['A wide crescent']),
    'VFX_Rage_Hell_Split': dict(pal='HELL', role='rage art finisher (Onikiri, Hell Splitter): where the cleaver lands', dominant_shape='fire tongues erupting out of a red-hot split in the floor',
        beats=[(2, 'contact', 'white contact on the floor'), (8, 'eruption', 'fire tongues from the middle outward, ring racing out'), (24, 'body', 'fireball cooling, rock in the air'), (44, 'tail', 'crack cooling, embers')],
        acceptance=['The fire rises and cools to smoke', 'The crack stays on the floor'], avoid=['A round fireball sticker']),
    'VFX_Rage_Tidal_Crash': dict(pal='TIDE', role='rage art finisher (Mizuchi, Rising Water Dragon): the dragon crashing down', dominant_shape='a column and crown of water thrown up and falling back',
        beats=[(2, 'contact', 'white-blue contact'), (12, 'crown', 'column up, crown arcing over'), (24, 'fall', 'water falling back, rings racing out'), (36, 'tail', 'haze and the last ring')],
        acceptance=['Water rises and falls back under gravity', 'Two rings on the floor'], avoid=['Grey smoke curls']),
    'VFX_Rage_Shadow_Scythe': dict(pal='SCYTHE', role="rage art finisher (Yamigama, Reaper's Requiem): two crossed, and one per clone's cut", dominant_shape='an enormous violet crescent wider than a character is tall',
        beats=[(1, 'gather', 'dark strands drawn in'), (6, 'contact', 'the crescent sweeps open with a white-violet edge'), (14, 'body', 'violet body and pale outer edge'), (24, 'tail', 'smoke and motes')],
        acceptance=['It draws in before it releases', 'Violet, never white, through the body'], avoid=['A small crescent']),
    'VFX_Rage_Gold_Quake': dict(pal='QUAKE', role='rage art shockwave (Iwakudaki, Golden Earthbreaker): three per art, larger each time', dominant_shape='gold rings racing out along the floor over a rune seal',
        beats=[(1, 'seal', 'the rune seal lights'), (2, 'contact', 'white contact'), (18, 'waves', 'three rings one after another'), (40, 'tail', 'fault eroding, boulders landing')],
        acceptance=['The rings run along the floor, never a pillar or a halo', 'Heavy matter lands'], avoid=['A recolour of Takashi\'s holy pulse']),
}


def load(effect_id):
    spec = importlib.util.spec_from_file_location(effect_id, HERE / 'vfx/src' / f'{effect_id}.py')
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module.recipe()


def role(name):
    if name in ROLES: return ROLES[name]
    base = re.sub(r'(\s+\d+)+$', '', name)
    if base in ROLES: return ROLES[base]
    for key, value in ROLES.items():
        if name.startswith(key + ' '): return value
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
                     palette=getattr(_rage, d['pal'])['PALETTE'], delivery=recipe.get('delivery', {'kind': 'self'}), anchor=recipe['attach'], reference=REFERENCE,
                     beats=[dict(frame=f, name=n, expect=e) for f, n, e in d['beats']],
                     layer_plan=plan(recipe['layers']), acceptance=d['acceptance'], avoid=d['avoid'])
        out = HERE / 'vfx/briefs' / f'{effect_id}.json'
        out.write_text(json.dumps(brief, indent=2) + '\n', encoding='utf-8')
        print('wrote', out.name, len(brief['layer_plan']), 'layers')


if __name__ == '__main__':
    main()
