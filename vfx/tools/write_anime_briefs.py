"""Write vfx/briefs/VFX_Anime_*.json: the design text below plus each layer's full indexed path and absolute exit
frame, expanded from the recipe itself (so a moved layer cannot leave a stale path in the brief). Like
write_rage_briefs.py, for the shared anime combat set (src/js/39-anime-fx.js plays them).

Run with the effekseer-vfx toolchain python from the game root:
  ~/.cache/effekseer-vfx/venv/Scripts/python.exe vfx/tools/write_anime_briefs.py
then `vfx brief-validate <ID>` for each effect.
"""
import importlib.util, json, os, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[2]
SKILL = Path(os.environ.get('EFFEKSEER_VFX_SKILL', Path.home() / '.claude/skills/effekseer-vfx'))
os.environ.setdefault('VFX_PROJECT', str(HERE))
sys.path[:0] = [str(SKILL / 'scripts'), str(HERE / 'vfx/src')]
from vfxkit.primitives import lifetime   # noqa: E402

STYLE = ('stylized anime combat, flat cel-shaded toon smoke (solid white, lavender shadow, hard-edged break-up) and '
         'saturated cyan energy with a white-hot core; side-view 2D, baked to sprite sheets for the Canvas game')
REFERENCE = {'id': 'user request 2026-11-12: two reference images, a cel-shaded white cartoon smoke blast with a hollow '
                    'dome and ground swooshes, and a glowing cyan ground crack web with light rays and flying rock shards; '
                    'apply across all combat, atmosphere and special anime effects'}
SMOKE_PAL = {'core': [255, 255, 255], 'body': [255, 255, 255], 'dark': [190, 186, 228], 'matter': [78, 86, 104]}
CRACK_PAL = {'core': [236, 255, 255], 'body': [60, 224, 255], 'dark': [8, 22, 70], 'matter': [78, 86, 104]}
HIT_PAL = {'core': [255, 255, 255], 'body': [255, 244, 214], 'dark': [255, 120, 40], 'matter': [255, 196, 110]}

ROLES = {
    'Left bank': ('main shape: the left cloud bank, bursting out and piling up, then tearing apart', 'toon_puffs T_ToonPuffSheet01'),
    'Right bank': ('main shape: the right cloud bank (the hollow dome lies between the banks)', 'toon_puffs T_ToonPuffSheet01'),
    'Low rollers': ('secondary: small puffs racing further along the floor', 'toon_puffs T_ToonPuffSheet01'),
    'Contact burst': ('contact: a hard white starburst squashed on the floor, gone by f7', 'sprite T_Impact01 + hard_edge'),
    'Rock chunks': ('matter: big near-black rock chunks bursting out and up, settling by f48', 'debris'),
    'Contact pop': ('contact: a squat puff swelling over the hit for a few frames', 'sprite T_ToonPuff01'),
    'Dome stroke': ('shape accent: a broken stroke tracing the dome of shoved air', 'dome_arc ring'),
    'Outer stroke': ('shape accent: a thinner outer stroke a beat later', 'dome_arc ring'),
    'Ground streaks': ('ground feedback: wind streaks fanning out along the floor', 'sprite T_ToonSwoosh01'),
    'Floor shove': ('ground feedback: a thin white ring shoved out along the floor', 'tilted_ring'),
    'Spat blobs': ('secondary: blobs of smoke spat up that arc and fall', 'sprite T_ToonPuff01'),
    'Floor pool': ('light on the floor: the soft cyan pool under the break', 'decal T_SoftCircle'),
    'Crack halo': ('body light: the glow following the fissures', 'decal T_CrackWeb01Glow'),
    'Crack web': ('main shape: the shattered fissure web, white-hot to cyan to deep blue, eroding', 'decal T_CrackWeb01'),
    'Contact flash': ('contact', 'flash'),
    'Break bloom': ('subordinate light over the break', 'glow'),
    'Ray fan': ('body: the wide fan of light shafts climbing out of the break', 'standing T_LightRays01'),
    'Ray core': ('core: the narrow white-hot fan, gone sooner', 'standing T_LightRays01'),
    'Shock ring': ('ground feedback: a thin cyan ring racing out along the floor', 'tilted_ring'),
    'Rock chips': ('matter: dark rock chips thrown up, landing', 'debris'),
    'Spit sparks': ('secondary: cyan sparks spat up out of the break', 'radial_sparks'),
    'Rising motes': ('residue: cyan motes drifting up after the light', 'motes'),
    'Kick puffs': ('main shape: the dust spurt thrown back along the floor', 'toon_puffs T_ToonPuffSheet01'),
    'Heel puffs': ('small puffs at the heel', 'toon_puffs T_ToonPuffSheet01'),
    'Floor streak': ('ground feedback: a white streak skimming the floor', 'sprite T_Streak01'),
    'Pebbles': ('matter: pebbles skipping', 'debris'),
    'Pinch': ('anticipation: a two-frame pinch of light', 'glow'),
    'Amber body': ('body: a larger saturated amber burst behind the cream spikes, cooling to a deep orange rim', 'sprite T_Impact01 + hard_edge'),
    'Impact burst': ('main shape: the jagged cream burst, eroding from its spikes with a hard edge', 'sprite T_Impact01 + hard_edge'),
    'Speed lines': ('contact accent: radial speed lines', 'sprite T_SpeedLines01'),
    'Air ring': ('body: a thin air ring crossing the blow', 'tilted_ring'),
    'Sparks': ('secondary: warm sparks in tiers through the target', 'spark_burst'),
    'Glints': ('accent: four-point glints as it clears', 'sparkle'),
    'Bank': ('main shape: a flattened toon mist lobe drifting downwind, nibbled and torn', 'sprite T_ToonPuff01'),
    'Wisps': ('secondary: small mist scraps drifting a little faster', 'sprite T_ToonPuff01'),
}

BRIEFS = {
    'VFX_Anime_Smoke_Burst': dict(pal=SMOKE_PAL, role='ground blast for slams, knockdowns, wall hits and heavy landings (frequent, scaled by force)',
        dominant_shape='two cel-shaded white cloud banks left and right with a hollow dome of clear air between them',
        beats=[(2, 'contact', 'hard white starburst and flash on the floor, dome strokes and streaks at their widest'), (12, 'body', 'the banks have burst out either side, the dome is hollow, streaks fan along the floor'),
               (26, 'banks', 'the banks reach their full spread either side, spat blobs falling'), (52, 'break', 'the banks tear into hard-edged chunks'), (66, 'clear', 'gone')],
        acceptance=['The centre over the contact stays clear while the banks pile up either side', 'The smoke reads as solid flat white with a lavender underside, not grey haze',
                    'The banks break into hard-edged chunks instead of fading'],
        avoid=['A grey soft-glow haze', 'One round blob covering the fighter', 'A full closed ring for the dome']),
    'VFX_Anime_Ground_Crack': dict(pal=CRACK_PAL, role='finisher ground break: criticals, slams, finishers (rare, high importance)',
        dominant_shape='a shattered web of glowing fissures across the floor with a fan of light shafts rising out of it',
        beats=[(2, 'contact', 'white contact and the web snaps open white-hot'), (10, 'body', 'cyan web, light fan climbing, chips flying'),
               (30, 'cool', 'web cooled to cyan-blue, fan fading, chips landing'), (60, 'erode', 'deep-blue fissures eroding from their thin ends, motes drifting'), (87, 'clear', 'gone')],
        acceptance=['The fissure web reads as a shattered cell network, white in the centre and cyan outward', 'Light visibly pours up out of the break',
                    'The fissures cool and erode instead of switching off'],
        avoid=['A flat cyan disc', 'A white blob over the whole floor', 'Light shafts that read as a solid wall']),
    'VFX_Anime_Dust_Kick': dict(pal=SMOKE_PAL, role='footwork dust: dashes, step-ins, skids, sharp turns (very frequent, small)',
        dominant_shape='a short low spurt of cel-shaded dust thrown back along the floor',
        beats=[(1, 'kick', 'puffs burst out low, streak skims'), (10, 'hang', 'puffs hang and billow'), (26, 'break', 'puffs tear apart'), (36, 'clear', 'gone')],
        acceptance=['Small: stays under knee height and never hides the feet', 'Reads as the same toon smoke as the ground blast'],
        avoid=['A big cloud for a step', 'Soft grey dust']),
    'VFX_Anime_Impact': dict(pal=HIT_PAL, role='heavy-hit and critical impact frame at the hit point (tier 2+ hits)',
        dominant_shape='a jagged impact star: white core, cream spikes over a saturated amber body, with radial speed lines',
        beats=[(1, 'pinch', 'a small pinch of light'), (3, 'contact', 'white star, burst snapping open'), (8, 'body', 'burst eroding from its spikes, speed lines and ring out'),
               (16, 'glints', 'glints pop, sparks drooping'), (27, 'clear', 'gone')],
        acceptance=['The burst is white only for the first frames, then cream and eroding with a hard edge', 'The contact is clearer than its neighbours'],
        avoid=['A lingering white blob', 'Fireworks: sparks in every direction']),
    'VFX_Anime_Mist_Bank': dict(pal={'core': [214, 220, 240], 'body': [214, 220, 240], 'dark': [190, 186, 228], 'matter': [214, 220, 240]},
        role='arena atmosphere: low toon mist banks rolling across the floor, several staggered per stage',
        dominant_shape='flattened translucent toon cloud lobes along the floor',
        beats=[(20, 'fade-in', 'banks fading in along the floor'), (80, 'drift', 'banks drift downwind, edges nibbled'), (150, 'break', 'banks tearing into scraps'), (200, 'clear', 'gone')],
        acceptance=['Low and translucent: the fighters\' feet and legs stay readable', 'Moves and changes shape the whole time'],
        avoid=['An opaque white wall', 'A static sticker band']),
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
                     palette=d['pal'], delivery=recipe.get('delivery', {'kind': 'self'}), anchor=recipe['attach'], reference=REFERENCE,
                     beats=[dict(frame=f, name=n, expect=e) for f, n, e in d['beats']],
                     layer_plan=plan(recipe['layers']), acceptance=d['acceptance'], avoid=d['avoid'])
        out = HERE / 'vfx/briefs' / f'{effect_id}.json'
        out.write_text(json.dumps(brief, indent=2) + '\n', encoding='utf-8')
        print('wrote', out.name, len(brief['layer_plan']), 'layers')


if __name__ == '__main__':
    main()
