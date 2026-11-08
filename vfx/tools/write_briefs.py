"""Write vfx/briefs/VFX_Sakura_*.json: the design text below plus each layer's full indexed path and absolute exit
frame, expanded from the recipe itself (so a moved layer cannot leave a stale path in the brief).

Run with the effekseer-vfx toolchain python from the game root:
  ~/.cache/effekseer-vfx/venv/Scripts/python.exe vfx/tools/write_briefs.py
then `vfx brief-validate <ID>` for each effect.
"""
import importlib.util, json, os, sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[2]   # the game root (vfx/ lives under it)
SKILL = Path(os.environ.get('EFFEKSEER_VFX_SKILL', Path.home() / '.claude/skills/effekseer-vfx'))
os.environ.setdefault('VFX_PROJECT', str(HERE))
sys.path[:0] = [str(SKILL / 'scripts'), str(HERE / 'vfx/src')]
from vfxkit.primitives import lifetime   # noqa: E402

STYLE = 'stylized anime combat, glowing additive sakura (Senbonzakura) over a dark night arena, side-view 2D'
PALETTE = dict(core=[255, 246, 252], body=[255, 102, 178], dark=[70, 6, 40], matter=[255, 196, 226], accent=[255, 20, 147])

# role per layer name (prefix match for numbered layers), primitive label per layer name
ROLES = {
    'Blade glint': ('anticipation: where the blade starts', 'glow'),
    'Swing plane': ('pivot yawing the blade set into a 3D swing plane', 'swing'),
    'Afterimage': ('deep-pink motion smear lagging the blade', 'slash_arc'),
    'Blade body': ('main shape: saturated #FF66B2 arc', 'slash_arc'),
    'Hot edge': ('core: thin white-hot leading edge', 'slash_arc'),
    'Blade petal': ('signature: crescent blade-petals peeling off the arc', 'sprite T_PetalBlade01'),
    'Contact flash': ('contact', 'flash'),
    'Pink bloom': ('subordinate light under the contact', 'glow'),
    'Shed petals': ('secondary: glowing petals shed off the cut / path', 'sprite T_SakuraPetal01'),
    'Falling petals': ('residue: petals left falling', 'sprite T_SakuraPetal01'),
    'Glints': ('accent: four-point glints', 'sparkle'),
    'Rim aura': ('soft deep-pink rim light round her body', 'glow'),
    'Drift petals': ('main shape: drifting tumbling petals', 'sprite T_SakuraPetal01'),
    'Glow motes': ('secondary: tiny rising glints', 'motes'),
    'Pale petals': ('matter: alpha-blended petals for weight', 'sprite T_SakuraPetal01 Blend'),
    'Drifting blossom': ('accent: an occasional whole blossom that dissolves', 'sprite T_SakuraBlossom01'),
    'Launch ring': ('launch speed carrier left at the muzzle', 'shock_ring'),
    'Head blade': ('head: white-hot crescent petal', 'sprite T_PetalBlade01'),
    'Head glow': ('head: pink glow round the head', 'glow'),
    'Streak': ('trail: thin deep-pink streak that erodes', 'sprite T_Streak01'),
    'Pink ring': ('body: expanding pink ring', 'shock_ring'),
    'Splinter streaks': ('secondary tier 1: fast white streaks', 'radial_sparks'),
    'Splinters': ('secondary tier 2: pink splinters that droop', 'radial_sparks'),
    'Blossom pop': ('body: blossom pops open and dissolves', 'sprite T_SakuraBlossom01'),
    'Scatter': ('secondary: petals scattered outward', 'sprite T_SakuraPetal01'),
    'Draw in': ('anticipation: glints drawn inward', 'motes'),
    'Vanish pop': ('contact: the vanish', 'flash'),
    'Blossom': ('body: blossom marking where she was', 'sprite T_SakuraBlossom01'),
    'Swirl': ('shape change: torn swirling strands', 'wisps'),
    'Petal puff': ('main shape: puff of petals replacing her smoke', 'sprite T_SakuraPetal01'),
    'Pale puff': ('matter: pale petals in the puff', 'sprite T_SakuraPetal01 Blend'),
    'Floor tell': ('anticipation: pink ellipse on the floor where it will rise', 'orbit_band'),
    'Gathering petals': ('anticipation: petals sliding inward over the floor', 'sprite T_SakuraPetal01'),
    'Release flash': ('release', 'flash'),
    'Floor ring': ('ground feedback ring at release', 'tilted_ring'),
    'Spiral pivot': ('pivot yawing the stream so rising petals trace a helix', 'renderer None'),
    'Spiral stream': ('main shape: petals spiralling upward', 'sprite T_SakuraPetal01'),
    'Spiral strands': ('shape change: torn strands wrapping the column', 'wisps'),
    'Wind column': ('volume: scrolling pink wind column', 'column'),
    'Thrown petals': ('matter: pale petals thrown off the storm', 'sprite T_SakuraPetal01 Blend'),
    'Head blossom': ('head: spinning blossom', 'sprite T_SakuraBlossom01'),
    'Light ribbon': ('trail: deep-pink light ribbon on the floor', 'Track'),
    'Path blossoms': ('trail: blossoms blooming on the path', 'sprite T_SakuraBlossom01'),
    'Kicked petals': ('secondary: petals kicked up off the floor', 'sprite T_SakuraPetal01'),
    'Gather': ('anticipation: glints drawn to the eruption point', 'motes'),
    'Floor shock': ('ground feedback ring', 'tilted_ring'),
    'Pillar body': ('volume: tall pink light column', 'column'),
    'Pillar core': ('core: thin white column inside', 'column'),
    'Standing blade': ('signature: crescent blades shooting up in a fan', 'sprite T_PetalBladeV01 pivot bottom'),
    'Up streaks': ('secondary: upward streaks', 'radial_sparks'),
    'Petal geyser': ('secondary: petals thrown up, then drifting down', 'sprite T_SakuraPetal01'),
    'Settling petals': ('residue: pale petals settling', 'sprite T_SakuraPetal01 Blend'),
    'Dark veil': ('dark: wine veil that dims the arena', 'sprite T_SoftCircle Blend'),
    'Outer band': ('volume: deep-pink band turning round the screen', 'orbit_band'),
    'Inner band': ('volume: pink inner band, faster', 'orbit_band'),
    'Vortex pivot': ('pivot spinning the storm about Z', 'renderer None'),
    'Storm petals': ('main shape: petals spiralling inward', 'sprite T_SakuraPetal01'),
    'Storm blades': ('signature: crescent blades riding the vortex', 'sprite T_PetalBlade01'),
    'Storm strands': ('shape change: torn strands in the whirl', 'wisps'),
    'Eye bloom': ('light: pink bloom of the eye', 'glow'),
    'Eye core': ('core: white-hot eye', 'glow'),
    'Storm glints': ('accent: glints in the storm', 'sparkle'),
    'Beam glow': ('body: deep-pink glow of one slash beam', 'slice_line'),
    'Beam core': ('core: long white-hot line of one slash beam', 'slice_line'),
    'Cut star': ('contact of one cut', 'flash'),
    'Cut blades': ('signature: crescent blades flung along one cut', 'sprite T_PetalBlade01 Line spawn'),
    'Cut petals': ('secondary: petals sprayed after one cut', 'sprite T_SakuraPetal01'),
    'Cut residue': ('matter: pale petals left in the air', 'sprite T_SakuraPetal01 Blend'),
    'Charge': ('anticipation: shrinking hot glow', 'glow'),
    'Base glow': ('ground: deep-pink glow under the travelling column', 'orbit_band'),
    'Flung petals': ('secondary: petals flung off the base as it travels', 'sprite T_SakuraPetal01'),
    'Base pulse': ('ground feedback ring, once per loop', 'tilted_ring'),
    'Detonation flash': ('contact', 'flash'),
    'Hot ring': ('body: white ring cooling to pink', 'shock_ring'),
    'Flung blades': ('signature: crescent blades flung outward', 'sprite T_PetalBladeV01 DirectionalBillboard'),
    'Petal burst': ('main shape: dense petal burst that hangs and drifts', 'sprite T_SakuraPetal01'),
    'Blossoms': ('accent: blossoms popping in the burst', 'sprite T_SakuraBlossom01'),
}

BRIEFS = {
    'VFX_Sakura_Slash': dict(
        role='frequent melee cut (Twin Fang, Shadow Flip)', dominant_shape='tilted pink arc shedding crescent blade-petals',
        beats=[(1, 'blade', 'white glint and the arc starts sweeping'), (4, 'contact', 'white star for 3-4 frames on the target'),
               (8, 'body', 'pink arc with blade-petals peeling off it, white only on the leading edge'),
               (30, 'tail', 'arc gone; glowing petals tumble down through the cut'), (54, 'clear', 'last pale petals fading')],
        acceptance=['The arc reads as #FF66B2 pink with a thin white edge, not a white crescent',
                    'Five blade-petals leave the arc one frame apart and keep flying after the arc erodes',
                    'Petals fall and tumble after the arc is gone; nothing large remains at f54'],
        avoid=['A full white crescent sticker', 'Petals bursting symmetrically like fireworks']),
    'VFX_Sakura_Ambient': dict(
        role='sustained status aura round Akari (stacked per phase)', dominant_shape='petals drifting on a slow wind round her body',
        beats=[(10, 'arrive', 'first petals appear round her'), (60, 'hold', 'steady drift, rim light at its fullest'),
               (110, 'loop', 'drift continues with no visible seam')],
        acceptance=['Akari stays readable inside the drift', 'Petals tumble (roll and spin), never slide as flat dots',
                    'No flash: the aura never holds the brightest value on screen'],
        avoid=['A bright halo that hides her silhouette', 'All petals moving in the same direction at the same speed']),
    'VFX_Sakura_Petal_Shot': dict(
        role='single-target projectile (Poison Kunai, Kunai Rain)', dominant_shape='white-hot crescent petal head with a pink streak',
        beats=[(2, 'launch', 'pink ring at the hand, head leaves'), (12, 'flight', 'head, glow and streak read at combat distance'),
               (24, 'arrival', 'head released; the trail stays on the path'), (50, 'tail', 'shed petals falling, streak gone')],
        acceptance=['The head reads as a crescent pointing along the flight', 'Shed petals fall behind the path, not ahead of it'],
        avoid=['A round glowing ball', 'A uniform tube trail']),
    'VFX_Sakura_Petal_Impact': dict(
        role='paired projectile impact', dominant_shape='blossom popping open in a pink ring',
        beats=[(2, 'contact', 'short white contact'), (8, 'body', 'pink ring and blossom open, splinters out'),
               (30, 'tail', 'petals drifting down')],
        acceptance=['The white contact is gone by f6 and the blossom keeps its pink shape', 'Splinters read in two speeds'],
        avoid=['A white blob lasting more than five frames']),
    'VFX_Sakura_Veil': dict(
        role='teleport vanish/arrival (Smoke Step, Blink)', dominant_shape='puff of petals round a blossom',
        beats=[(2, 'draw', 'glints rush inward'), (5, 'pop', 'white pop and the blossom'), (14, 'body', 'petal puff and torn strands'),
               (44, 'tail', 'petals drift down')],
        acceptance=['Reads as petals, not smoke', 'The puff stays smaller than about two of her body widths'],
        avoid=['A grey smoke cloud', 'A puff big enough to hide Kage']),
    'VFX_Sakura_Spiral': dict(
        role='area storm with a 0.75 s tell (Petal Storm, moving Petal Tornado)', dominant_shape='spiralling petal column',
        beats=[(10, 'tell', 'pink floor ellipse, petals sliding inward'), (45, 'release', 'white release flash and floor ring'),
               (70, 'storm', 'petals spiral up in a helix, wrapped in torn strands'), (125, 'drop', 'column fades, petals fall'),
               (160, 'clear', 'last petals fading')],
        acceptance=['The floor tell is readable from f10 to f45 (the dodge window)', 'Rising petals trace a helix, not a straight column',
                    'The storm cuts off cleanly enough that its end is visible'],
        avoid=['A tell so bright it reads as the storm already hitting', 'A solid pink cylinder sticker']),
    'VFX_Sakura_Ribbon': dict(
        role='ground-skimming projectile ending in a pillar (Poison Trap, False Opening)', dominant_shape='blossom ribbon unrolling along the floor',
        beats=[(3, 'launch', 'spinning blossom leaves her feet'), (18, 'flight', 'ribbon and blossoms on the path'),
               (33, 'arrival', 'head released at the target'), (60, 'tail', 'path blossoms dissolving')],
        acceptance=['The ribbon stays on the floor line', 'Path blossoms bloom (pop open) after the head passes'],
        avoid=['A ribbon floating at body height']),
    'VFX_Sakura_Pillar': dict(
        role='vertical eruption (ribbon impact, Falling Petal landing, phase-2 entrance)', dominant_shape='fan of standing crescent blades round a pink light column',
        beats=[(3, 'tell', 'floor ellipse flares, glints drawn in'), (6, 'contact', 'white contact at the base'),
               (14, 'body', 'seven blades shoot up in a fan, column at full height'), (40, 'tail', 'blades eroded, petals drifting down'),
               (74, 'clear', 'settling pale petals')],
        acceptance=['Blades grow from the floor, the centre one tallest', 'The column fades top-down without a hard cut',
                    'Petals rise and then drift back down'],
        avoid=['A static vertical bar', 'Blades appearing at full height']),
    'VFX_Sakura_Tornado': dict(
        role='travelling sustained column (Petal Tornado, 3.2 s)', dominant_shape='narrow spiralling petal column over a floor glow',
        beats=[(6, 'rise', 'base glow and first rising petals'), (40, 'hold', 'helix of petals and strands at full height'),
               (80, 'loop', 'next loop takes over with no visible seam')],
        acceptance=['Reads as a narrow travelling column, clearly different from the wide Petal Storm',
                    'Petals flung off the base trail behind it as it moves'],
        avoid=['A tell or release flash (it has none: the wind-up belongs to Akari)', 'A column wider than about two character widths']),
    'VFX_Sakura_Vortex': dict(
        role='full-screen sustained storm (Thousand Petal Requiem, phase-3 entrance)', dominant_shape='screen-filling petal whirlpool round a white eye',
        beats=[(20, 'rise', 'veil dims the arena, bands fade in'), (60, 'hold', 'petals and blades spiral inward round the eye'),
               (110, 'loop', 'storm keeps turning with no visible seam')],
        acceptance=['The whirl turns visibly (petals travel inward along a spiral)', 'Characters stay readable through the veil',
                    'At most three screen-sized additive layers at once'],
        avoid=['A flat rotating icon', 'The veil going so dark the fighters disappear']),
    'VFX_Sakura_Slash_Beam': dict(
        role='rapid multi-directional cuts (Phantom Dash, Thousand Cuts, Petal Cross)', dominant_shape='three long slash beams crossing the target',
        beats=[(1, 'cut 1', 'first beam and star'), (4, 'cut 2', 'second beam from another direction'), (7, 'cut 3', 'third beam'),
               (18, 'body', 'beams thinned out, blades still flying'), (40, 'tail', 'petals and residue only')],
        acceptance=['Each beam has its own contact frame', 'Beams are long thin lines (over 15:1), white cores in deep-pink glow'],
        avoid=['Three beams appearing on the same frame', 'A wide white blob at the crossing']),
    'VFX_Sakura_Burst': dict(
        role='finisher AoE (Requiem end, Thousand Cuts last cut, clone break, phase change)', dominant_shape='dense radial petal burst with two shock rings',
        beats=[(3, 'draw', 'glints drawn in, hot glow shrinking'), (6, 'contact', 'big white detonation'),
               (14, 'body', 'rings expand, blades and petals fly outward'), (40, 'hang', 'petals hang and start drifting'),
               (90, 'clear', 'pale petals settling')],
        acceptance=['The white contact is gone by f12 and the rings and petals carry the shape after it',
                    'Petals burst fast then hang (eased), then drift down', 'Ninety-plus petals visible at f20'],
        avoid=['A long white screen wash', 'Petals moving at constant speed']),
}


def load(effect_id):
    spec = importlib.util.spec_from_file_location(effect_id, HERE / 'vfx/src' / f'{effect_id}.py')
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module.recipe()


def role(name):
    for key, value in ROLES.items():
        if name == key or (name.startswith(key) and name[len(key):].strip().isdigit()):
            return value
    raise KeyError(f'no role for layer {name!r}')


def plan(layers, prefix='', start=0):
    out = []
    for i, layer in enumerate(layers):
        path = f'{prefix}{i}:{layer["name"]}'
        r, prim = role(layer['name'])
        out.append(dict(name=path, role=r, primitive=prim, exit=f'gone by absolute f{lifetime(layer, start)}'))
        born = start + layer.get('delay', 0)
        out += plan(layer.get('children', []), path + '/', born)
    return out


def main():
    for effect_id, d in BRIEFS.items():
        recipe = load(effect_id)
        brief = dict(schema_version=1, effect_id=effect_id, role=d['role'], style=STYLE, dominant_shape=d['dominant_shape'],
                     palette=PALETTE, delivery=recipe.get('delivery', {'kind': 'self'}), anchor=recipe['attach'],
                     reference={'id': 'gemini_generated_video_9ba223ac.mp4 (user reference: Senbonzakura boss duel)'},
                     beats=[dict(frame=f, name=n, expect=e) for f, n, e in d['beats']],
                     layer_plan=plan(recipe['layers']), acceptance=d['acceptance'], avoid=d['avoid'])
        out = HERE / 'vfx/briefs' / f'{effect_id}.json'
        out.write_text(json.dumps(brief, indent=2) + '\n', encoding='utf-8')
        print('wrote', out.name, len(brief['layer_plan']), 'layers')


if __name__ == '__main__':
    main()
