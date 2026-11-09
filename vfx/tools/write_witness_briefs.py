"""Write vfx/briefs/VFX_Witness_*.json: the design text below plus each layer's full indexed path and absolute exit
frame, expanded from the recipe itself (so a moved layer cannot leave a stale path in the brief). Like
write_takashi_briefs.py, for the Witness's four-phase set (2026-11-09).

Run with the effekseer-vfx toolchain python from the game root:
  ~/.cache/effekseer-vfx/venv/Scripts/python.exe vfx/tools/write_witness_briefs.py
then `vfx brief-validate <ID>` for each effect.
"""
import importlib.util, json, os, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[2]
SKILL = Path(os.environ.get('EFFEKSEER_VFX_SKILL', Path.home() / '.claude/skills/effekseer-vfx'))
os.environ.setdefault('VFX_PROJECT', str(HERE))
sys.path[:0] = [str(SKILL / 'scripts'), str(HERE / 'vfx/src')]
from vfxkit.primitives import lifetime   # noqa: E402

STYLE = 'stylized anime combat, additive void light (the reference sheets\' blue, then violet and magenta with gold) over a dark arena, side-view 2D, baked to sheets'
PALETTES = {
    'blue': dict(core=[246, 248, 255], body=[60, 74, 255], dark=[6, 6, 28], matter=[108, 114, 168], accent=[168, 180, 255]),
    'violet': dict(core=[252, 246, 255], body=[146, 44, 248], dark=[12, 2, 26], matter=[128, 108, 160], accent=[90, 170, 255]),
    'magenta': dict(core=[255, 246, 255], body=[184, 40, 255], dark=[16, 2, 24], matter=[140, 110, 160], accent=[255, 196, 110]),
}
REFERENCE = {'id': 'user reference sheets: The Witness, Architect of Echoes, phases I-IV (docs/art-reference/witness-phase-1..4.webp)'}

# role per layer name (exact, or a name followed by a number), primitive label
ROLES = {
    'Mantle': ('sustained: dim light round the body, never the brightest value', 'sprite T_Glow01'),
    'Floor light': ('a faint band of light on the floor', 'orbit_band'),
    'Curls': ('shape change: slow curls rising and turning (the reference smoke curls)', 'wisps'),
    'Drifting cards': ('secondary: echo cards drifting at arm length', 'sprite T_EchoCard01'),
    'Rising motes': ('residue: motes lifting and hanging', 'motes'), 'Motes': ('residue: motes rising', 'motes'),
    'Star glint': ('accent: the star in its eye, now and then', 'sparkle'),
    'Sheath': ('sustained volume: tight neon column hugging the body', 'column'),
    'Rising dashes': ('surface motion: hard dashes racing up the sheath', 'speed_streaks'),
    'Body arc': ('secondary: pale arcs snapping between points on the body', 'sprite T_ArcStrand01'),
    'Thread': ('secondary: a control thread thrown out and thinning', 'slice_line'),
    'Violet column': ('sustained volume: violet column', 'column'), 'Cyan edge': ('accent: cyan outer column (the coat underside)', 'column'),
    'Torn wisps': ('shape change: violet wisps torn from the first frame', 'wisps'),
    'Glitch violet': ('signature: hard glitch pixels blinking, no motion', 'sprite T_GlitchPix01'),
    'Glitch cyan': ('accent glitch pixels', 'sprite T_GlitchPix01'), 'Glitch white': ('hot core: a few white glitch pixels', 'sprite T_GlitchPix01'),
    'Glitch': ('glitch pixels blinking where the shape was', 'sprite T_GlitchPix01'), 'Cyan glitch': ('accent glitch pixels', 'sprite T_GlitchPix01'),
    'Hanging glitch': ('residue: glitch pixels hanging in the cut', 'sprite T_GlitchPix01'),
    'Breaking cards': ('secondary: echo cards breaking apart', 'sprite T_EchoCard01'),
    'Shard source': ('pivot for the shard emission', 'pivot'), 'Spark source': ('pivot for the spark emission', 'pivot'),
    'Echo source': ('pivot for the echo burst', 'pivot'), 'Glass source': ('pivot for the glass burst', 'pivot'), 'Cut source': ('pivot along the cut', 'pivot'),
    'Lifting shards': ('secondary: small shards lifting off the shoulders', 'radial_sparks'),
    'Echo seal': ('ownership: the Echo System seal turning on the floor', 'decal T_EchoSeal01'),
    'Outer seal': ('a counter-turning outer seal', 'decal T_EchoSeal01'),
    'Magenta column': ('sustained volume: magenta column', 'column'), 'Magenta wisps': ('shape change: magenta wisps rising', 'wisps'),
    'Gold sparks': ('secondary: gold sparks shooting up off the seal and hanging', 'radial_sparks'),
    'Gold stars': ('accent: gold star glints', 'sparkle'), 'Violet motes': ('residue: violet motes rising', 'motes'),
    'Launch ring': ('launch speed carrier', 'shock_ring'), 'Wave glow': ('head: glow round the crescent', 'glow'),
    'Dark echo': ('dark: the crescent echo lagging behind', 'crescent (slash_arc held)'),
    'Wave body': ('main shape: the standing blue crescent', 'crescent (slash_arc held)'), 'Hot edge': ('core: white leading edge', 'crescent (slash_arc held)'),
    'Floor skim': ('ground feedback: a thin line skimming the floor', 'slice_line'),
    'Peeling cards': ('trail: cards peeling off the back and hanging', 'sprite T_EchoCard01'),
    'Shed shards': ('trail: shards shed on the path', 'radial_sparks'),
    'Gather': ('anticipation: motes drawn in', 'motes'), 'Violet gather': ('anticipation: second tier drawn in', 'motes'),
    'Slit': ('main shape: the vertical slit of light the echo folds into', 'sprite T_Streak01'),
    'Fold star': ('contact: the fold', 'flash'), 'Blue bloom': ('light under the fold', 'glow'),
    'Step ring': ('a ring snapping across the line of the step', 'tilted_ring'),
    'Echo cards': ('body: the echo bursting into cards that hang', 'sprite T_EchoCard01'), 'Shards': ('secondary: shards sprayed sideways', 'radial_sparks'),
    'Glints': ('accent: star glints', 'sparkle'), 'Drift': ('residue: motes drifting', 'motes'),
    'Head glow': ('head: glow round the card', 'glow'), 'Head card': ('head: the spinning echo card', 'sprite T_EchoCard01'),
    'Streak': ('trail: long thin blue streak', 'sprite T_Streak01'), 'Hanging cards': ('trail: tiny cards left hanging', 'sprite T_EchoCard01'),
    'Closing ring': ('anticipation: a ring tightening round the feet', 'floor_ring'), 'Lock star': ('contact: the lock snapping shut', 'flash'),
    'Ankle lock': ('body: the lock ring at the feet', 'orbit_band'), 'Shin lock': ('body: lock ring at the shins', 'orbit_band'),
    'Chest lock': ('body: lock ring at the chest', 'orbit_band'), 'Seal': ('ownership: the seal under the bound man', 'decal T_EchoSeal01'),
    'Sinking motes': ('residue: motes sinking', 'motes'),
    'Well glow': ('sustained: dim violet glow of the well', 'glow'), 'Far band': ('far half of the accretion band', 'orbit_band'),
    'Core': ('dark: the black core', 'sprite T_SoftCircle Blend'), 'Rim': ('hot rim round the core', 'shock_ring'),
    'Near band': ('near half of the accretion band, passing in front', 'orbit_band'),
    'Inward strands': ('motion: strands drawn inward', 'wisps'), 'Drawn motes': ('motion: motes drawn inward', 'motes'),
    'Guide line': ('anticipation: guide line where the cut will fall', 'slice_line'),
    'Impact card': ('impact frame: near-black card on the release frame', 'sprite T_SoftCircle Blend'),
    'Contact star': ('contact', 'flash'), 'Kill line': ('release: one long white line down through the target', 'slice_line'),
    'Crescent body': ('main shape: the huge violet crescent cutting down', 'slash_arc'), 'Crescent edge': ('core: white leading edge', 'slash_arc'),
    'Violet bloom': ('light under the blow', 'glow'), 'Floor shock': ('ground feedback ring', 'floor_ring'), 'Second shock': ('a second ring behind it', 'floor_ring'),
    'Thrown shards': ('secondary: shards thrown low and sideways', 'radial_sparks'),
    'Settling motes': ('residue: motes settling', 'motes'), 'Void residue': ('matter: violet-grey residue settling', 'smoke'),
    'Drawn strands': ('anticipation: strands drawn into the hand', 'wisps'), 'Release star': ('release', 'flash'),
    'Release bloom': ('light at release', 'glow'), 'Floor seal': ('ownership: the Echo System seal flaring on the floor', 'decal T_EchoSeal01'),
    'Standing ring': ('main shape: the giant Echo System ring standing up behind it', 'sprite T_EchoSeal01'),
    'Ring': ('more Echo System rings at other tilts', 'orbit_band'), 'Release ring': ('the release shock ring', 'shock_ring'),
    'Glass shards': ('secondary: the world glass thrown across the frame', 'sprite T_Shard01'),
    'Gold glints': ('accent: gold glints round the rings', 'sparkle'), 'Card storm': ('secondary: a storm of echo cards', 'sprite T_EchoCard01'),
    'Anchor seal': ('ownership: the seal under the anchor', 'decal T_EchoSeal01'), 'Anchor glow': ('sustained light round the anchor', 'glow'),
    'Far ring': ('far half of the gold ring', 'orbit_band'), 'Crystal': ('main shape: the standing crystal', 'crystal'),
    'Pulse': ('surface motion: light climbing the crystal', 'column'), 'Near ring': ('near half of the gold ring', 'orbit_band'),
    'Lifting motes': ('residue: motes lifting off', 'motes'), 'Tip glint': ('accent: a glint on the tip', 'sparkle'),
    'Break bloom': ('light at the break', 'glow'), 'Gold ring': ('ground feedback: gold ring snapping out', 'floor_ring'),
    'Release column': ('body: a column of light shooting up and thinning', 'column'),
    'Crystal shards': ('secondary: crystal shards tumbling and falling', 'sprite T_Shard01'), 'Sparks': ('secondary: sparks', 'radial_sparks'),
    'Gold motes': ('residue: gold motes drifting down', 'motes'),
    'Gathering point': ('anticipation: the point it gathers into', 'glow'), 'Guide': ('anticipation: a guide line flickering across the arena', 'slice_line'),
    'Judgment line': ('release: hair-thin white line the width of the screen', 'slice_line'),
    'Judgment band': ('main shape: the wide magenta band under the line', 'sprite T_Streak01'),
    'Gold ray': ('secondary: gold rays standing up along the cut', 'slice_line'),
    'Left ring': ('the end of the cut: ring racing outward', 'shock_ring'), 'Right ring': ('the end of the cut: ring racing outward', 'shock_ring'),
    'Cut shards': ('secondary: shards along the cut', 'radial_sparks'), 'Settling smoke': ('matter: violet smoke settling along the line', 'smoke'),
    'Core gather': ('anticipation: motes drawn into the core', 'motes'), 'Core crack': ('contact: the core cracking', 'flash'),
    'Core bloom': ('light at the crack', 'glow'), 'Core ring': ('ring snapping out', 'shock_ring'), 'Slow ring': ('a slower second ring', 'shock_ring'),
    'Body shards': ('body: shards of the body tumbling out and hanging', 'sprite T_Shard01'),
    'Echo arc': ('the echo: a thin pale copy of the arc trailing a beat later', 'slash_arc'),
    'Contact line': ('release: a short white line at the contact', 'slice_line'),
    'Blade glint': ('anticipation: where the blade starts', 'glow'), 'Afterimage': ('motion smear lagging the blade', 'slash_arc'),
    'Blade body': ('main shape: the saturated crescent', 'slash_arc'), 'Swing plane': ('pivot setting the arc into its swing plane', 'swing'),
    'Cel crescent': ('the painted crescent held a few frames', 'sprite T_Slash02'), 'Contact flash': ('contact', 'flash'),
    'Stutter': ('shape: copies of the arc snapping in beside it, late (the broken frame)', 'slash_arc'),
    'Glitch pixels': ('secondary: glitch pixels blinking along the cut', 'sprite T_GlitchPix01'), 'Cyan pixels': ('accent pixels', 'sprite T_GlitchPix01'),
    'White pixels': ('hot core pixels', 'sprite T_GlitchPix01'), 'Crack ring': ('a ring snapping across the blow', 'tilted_ring'),
    'Shed cards': ('secondary: cards shed back out of the body along the blow', 'sprite T_EchoCard01'), 'Pale motes': ('residue: pale motes', 'motes'),
    'Scan line': ('a scan line across the hit', 'slice_line'), 'Torn bars': ('body: the struck spot torn into pixel bars', 'sprite T_GlitchPix01'),
    'Late bars': ('pixel bars blinking in late', 'sprite T_GlitchPix01'), 'White bars': ('hot core bars', 'sprite T_GlitchPix01'),
    'Orb glow': ('head: blue glow round the orb', 'glow'), 'Orb core': ('head: the white-hot orb', 'sprite T_Glow01'),
    'Orb ring': ('head: the ring turning round the orb in a tilted plane', 'orbit_band'), 'Tail': ('trail: soft blue tail', 'sprite T_Streak01'),
    'Shed thread': ('trail: fine threads shed and hanging', 'slice_line'), 'Burst ring': ('body: the ring snapping open in its plane', 'tilted_ring'),
    'Cross ring': ('a second ring across it', 'tilted_ring'), 'Whip threads': ('secondary: threads whipping out and curling', 'wisps'),
    'Converging thread': ('anticipation: threads converging on the hand', 'slice_line'),
    'Palm seal': ('main shape: the Echo seal flaring before the palm, eroding', 'sprite T_EchoSeal01'), 'Command star': ('release', 'flash'),
    'Command ring': ('ring at release', 'shock_ring'), 'Command thread': ('release: long threads shot toward the target', 'slice_line'),
    'Tear flash': ('contact: the floor tearing', 'flash'), 'Floor tear': ('ground: a strip of torn floor', 'sprite T_Streak01'),
    'Glitch column': ('body: the column the pixels climb', 'column'), 'Pixel source': ('pivot for the pixel column', 'pivot'),
    'Pixels violet': ('body: hard pixels blinking up the column', 'sprite T_GlitchPix01'), 'Pixels cyan': ('accent pixels up the column', 'sprite T_GlitchPix01'),
    'Scan': ('scan lines racing up', 'slice_line'), 'Hanging pixels': ('residue: pixels hanging after it dies back', 'sprite T_GlitchPix01'), 'Drain mantle': ('sustained: dim violet on Kage', 'glow'),
    'Tightening ring': ('a ring tightening round his chest, eroding', 'tilted_ring'), 'Pull glint': ('hot core: a glint as a ring closes', 'flash'),
    'Drain source': ('pivot for the drained life', 'pivot'), 'Life motes': ('motion: life motes pulled away toward the Witness', 'motes'),
    'Life streaks': ('motion: streaks pulled away toward the Witness', 'radial_sparks'),
    'Control seal': ('ownership: a turning blue Echo seal on the floor', 'decal T_EchoSeal01'),
    'Knee ring': ('a wide control ring circling the body low', 'orbit_band'), 'Chest ring': ('a control ring circling the chest', 'orbit_band'),
    'Blue flames': ('shape change: blue flame wisps licking past the crown', 'wisps'),
    'Broken seal': ('ownership: a violet seal on the floor', 'decal T_EchoSeal01'), 'Seal pixels': ('the seal broken by glitch pixels', 'decal T_GlitchPix01'),
    'Torn arc': ('a ring round the body torn into separate arcs', 'orbit_band'), 'Cyan edges': ('cyan wisp edges', 'wisps'),
}

AURA = dict(acceptance=['Never the brightest thing on screen; the figure reads through it', 'The loop has no visible seam when crossfaded'],
            avoid=['A flat glowing disc', 'Fire flipbook puffs'])
BRIEFS = {
    'VFX_Witness_Aura_Observer': dict(pal='blue', role='sustained status round the Witness, phase I (The Observer)', dominant_shape='slow pale-blue curls rising round the body',
        beats=[(20, 'arrive', 'mantle and floor light fade in'), (60, 'hold', 'curls turning, a card drifting'), (110, 'loop', 'no seam')], **AURA),
    'VFX_Witness_Aura_Manipulator': dict(pal='blue', role='sustained status, phase II (The Manipulator)', dominant_shape='a tight neon-blue sheath hugging the body',
        beats=[(10, 'arrive', 'sheath fades in'), (30, 'hold', 'arcs snapping, threads thrown out'), (55, 'loop', 'no seam')], **AURA),
    'VFX_Witness_Aura_Editor': dict(pal='violet', role='sustained status, phase III (The Reality Editor)', dominant_shape='hard violet and cyan glitch pixels blinking round a violet column',
        beats=[(10, 'arrive', 'column fades in'), (30, 'hold', 'glitch pixels blink with no motion'), (55, 'loop', 'no seam')], **AURA),
    'VFX_Witness_Aura_True': dict(pal='magenta', role='sustained status, phase IV (The True Witness)', dominant_shape='a turning gold-and-violet seal on the floor with gold rising',
        beats=[(20, 'arrive', 'seal and column fade in'), (60, 'hold', 'seal turning, sparks rising'), (110, 'loop', 'no seam')], **AURA),
    'VFX_Witness_Void_Wave': dict(pal='blue', role='projectile (Void Slash: one of three crossing waves)', dominant_shape='a tall blue crescent standing on the floor, racing forward',
        beats=[(2, 'launch', 'ring, the crescent stands'), (16, 'flight', 'crescent reads with a white leading edge'), (30, 'arrival', 'head released; cards hang on the path')],
        acceptance=['The crescent reads as a wall to jump or dash through', 'The leading edge faces the way it travels'], avoid=['A flat glowing ball']),
    'VFX_Witness_Echo_Step': dict(pal='blue', role='teleport out and in (Echo Step, Forced Echo Step)', dominant_shape='a vertical slit of light the echo folds into',
        beats=[(1, 'gather', 'motes drawn in'), (3, 'fold', 'slit and star'), (12, 'body', 'cards burst sideways and hang'), (34, 'tail', 'motes drifting')],
        acceptance=['The slit reads before the cards take over', 'No smoke'], avoid=['A smoke cloud']),
    'VFX_Witness_Orbit_Blade': dict(pal='blue', role='projectile (Orbit Blades: one halo blade)', dominant_shape='a spinning echo card with a long thin blue streak',
        beats=[(2, 'launch', 'ring at the halo'), (12, 'flight', 'the card shape reads'), (24, 'arrival', 'head released, cards hang')],
        acceptance=['The card silhouette reads at combat distance'], avoid=['A white glow ball hiding the card']),
    'VFX_Witness_Bind': dict(pal='blue', role='control lock on the player (Echo Bind and the other modifiers)', dominant_shape='rings of light locking round Kage',
        beats=[(4, 'threads', 'threads drop onto him'), (10, 'lock', 'the floor ring snaps shut with a small star'), (40, 'hold', 'lock rings turning'), (64, 'tail', 'lock fades')],
        acceptance=['Reads as a seal, not a hit', 'The lock is visible for its whole hold'], avoid=['Sparks thrown like a hit']),
    'VFX_Witness_Gravity': dict(pal='violet', role='sustained hazard (Gravity Collapse well)', dominant_shape='a violet accretion band passing in front of a black core',
        beats=[(10, 'arrive', 'bands fade in'), (30, 'hold', 'strands and motes drawn inward'), (55, 'loop', 'no seam')],
        acceptance=['The near band passes in front of the core', 'Motion reads inward'], avoid=['A camera-facing vortex sticker']),
    'VFX_Witness_Execution': dict(pal='violet', role='boss finisher hit (Execution Frames)', dominant_shape='a long white line and a huge violet crescent cutting down',
        beats=[(1, 'guide', 'thin guide line'), (3, 'contact', 'impact card and star on one frame'), (10, 'body', 'crescent cutting down, rings racing out'), (40, 'tail', 'glitch hanging, motes settling')],
        acceptance=['The white is gone within five frames', 'The crescent keeps its violet after the flash'], avoid=['A white wash']),
    'VFX_Witness_Genesis': dict(pal='magenta', role='domain activation (Echo Genesis)', dominant_shape='the Echo System seal standing up as a giant turning ring',
        beats=[(20, 'gather', 'motes and strands drawn into the hand'), (40, 'release', 'star, the seal flares'), (60, 'body', 'rings standing and turning, glass hanging'), (120, 'tail', 'rings still turning, fading')],
        acceptance=['The gather reads before the release', 'The standing ring reads as the Echo System'], avoid=['A white screen for more than three frames']),
    'VFX_Witness_Anchor': dict(pal='magenta', role='sustained target (an Echo Anchor)', dominant_shape='a tall violet crystal with a gold ring at its waist',
        beats=[(10, 'arrive', 'crystal fades in'), (30, 'hold', 'pulse climbing, ring turning'), (55, 'loop', 'no seam')],
        acceptance=['Reads as a thing to strike', 'The near ring passes in front of the crystal'], avoid=['Flashing every frame']),
    'VFX_Witness_Anchor_Break': dict(pal='magenta', role='target destroyed (an anchor breaking)', dominant_shape='crystal shards thrown out and a column of light shooting up',
        beats=[(2, 'contact', 'white contact'), (10, 'body', 'shards out, column up, gold ring'), (40, 'tail', 'gold motes drifting down')],
        acceptance=['Light goes up and out', 'The white is gone within four frames'], avoid=['A dark implosion']),
    'VFX_Witness_Judgment': dict(pal='magenta', role='screen-wide boss attack (Final Judgment)', dominant_shape='a hair-thin white line the width of the screen over a magenta band',
        beats=[(30, 'gather', 'motes drawn in, guide lines flicker'), (54, 'release', 'impact card and star on one frame'), (62, 'body', 'line and band across the arena, gold rays'), (100, 'tail', 'smoke settling, glitch hanging')],
        acceptance=['The guide lines warn where the cut will fall', 'The band keeps its magenta after the flash'], avoid=['A white screen for more than three frames']),
    'VFX_Witness_Shatter': dict(pal='blue', role='phase transitions and the defeat (the body breaking apart)', dominant_shape='cards and shards blowing out of a cracked core and hanging',
        beats=[(2, 'gather', 'motes drawn into the core'), (4, 'crack', 'white crack in the core'), (16, 'body', 'cards and shards out, rings'), (70, 'tail', 'motes lifting')],
        acceptance=['Dissolving, not exploding: the pieces slow and hang'], avoid=['A fireball']),
    'VFX_Witness_Slash': dict(pal='blue', role='boss melee (Echo Combo cut, phases I-II)', dominant_shape='a clean blue crescent with a pale echo arc trailing it',
        beats=[(1, 'glint', 'blade glint'), (3, 'contact', 'contact flash and line'), (8, 'body', 'crescent sweeping, echo arc following'), (24, 'tail', 'cards hanging, motes settling')],
        acceptance=['The crescent reads through the target', 'The echo arc reads as a separate later copy'], avoid=['Glitch pixels (phase III only)']),
    'VFX_Witness_Slash_Glitch': dict(pal='violet', role='boss melee (Echo Combo cut, phases III-IV)', dominant_shape='a violet crescent stuttering into offset copies',
        beats=[(1, 'glint', 'blade glint'), (3, 'contact', 'contact flash'), (7, 'stutter', 'late copies snap in beside it'), (30, 'tail', 'pixels and residue')],
        acceptance=['The stutter reads as a damaged frame', 'Glitch pixels never drift'], avoid=['A clean single arc']),
    'VFX_Witness_Hit': dict(pal='blue', role='frequent hit on the Witness (phases I-II)', dominant_shape='echo cards and glass shards shed out of the body along the blow',
        beats=[(1, 'contact', 'small white contact'), (6, 'body', 'ring and cards'), (20, 'tail', 'cards hanging')],
        acceptance=['Never covers the figure'], avoid=['A big flash on every hit']),
    'VFX_Witness_Hit_Glitch': dict(pal='violet', role='frequent hit on the Witness (phases III-IV)', dominant_shape='pixel bars blinking where it was struck',
        beats=[(1, 'contact', 'violet contact'), (4, 'body', 'bars blinking, scan line'), (14, 'tail', 'late bars')],
        acceptance=['Bars blink with no motion'], avoid=['Drifting particles']),
    'VFX_Witness_Orb_Shot': dict(pal='blue', role='projectile (Orb Pulse, phase II)', dominant_shape='a white orb with a tilted ring turning round it',
        beats=[(2, 'launch', 'ring at the hand'), (12, 'flight', 'orb and ring read'), (27, 'arrival', 'head released, threads hang')],
        acceptance=['The ring reads round the orb'], avoid=['A plain glow ball']),
    'VFX_Witness_Orb_Impact': dict(pal='blue', role='paired projectile impact (Orb Pulse)', dominant_shape='rings snapping open in tilted planes, threads whipping out',
        beats=[(1, 'contact', 'white contact'), (6, 'body', 'rings and threads'), (20, 'tail', 'motes drawn back in')],
        acceptance=['Reads as control, not fire'], avoid=['Smoke']),
    'VFX_Witness_Cast': dict(pal='blue', role='status cast (the Manipulator taking control)', dominant_shape='an Echo seal flaring before the palm, threads shot at the target',
        beats=[(6, 'gather', 'threads converge on the hand'), (14, 'release', 'seal open, star, threads shot'), (40, 'tail', 'seal eroding')],
        acceptance=['Reads as a command, not a blast'], avoid=['Sparks thrown like a hit']),
    'VFX_Witness_Rewrite': dict(pal='violet', role='area hazard (Reality Rewrite tile)', dominant_shape='a column of glitch pixels erupting from a torn strip of floor',
        beats=[(2, 'tear', 'floor tears'), (12, 'body', 'pixels blink up the column'), (40, 'tail', 'hanging pixels')],
        acceptance=['It stands where the tile hurts'], avoid=['A smooth glowing pillar']),
    'VFX_Witness_Drain': dict(pal='violet', role='sustained status on Kage (Health Drain)', dominant_shape='life motes and streaks pulled out of him toward the Witness',
        beats=[(10, 'arrive', 'mantle and first ring'), (30, 'hold', 'motes streaming away'), (55, 'loop', 'no seam')],
        acceptance=['The motion reads OUT and away'], avoid=['Motes drawn in']),
}


def load(effect_id):
    spec = importlib.util.spec_from_file_location(effect_id, HERE / 'vfx/src' / f'{effect_id}.py')
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module.recipe()


def role(name):
    if name in ROLES: return ROLES[name]
    base = re.sub(r'(\s+\d+)+$', '', name)
    if base in ROLES: return ROLES[base]
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
                     palette=PALETTES[d['pal']], delivery=recipe.get('delivery', {'kind': 'self'}), anchor=recipe['attach'], reference=REFERENCE,
                     beats=[dict(frame=f, name=n, expect=e) for f, n, e in d['beats']],
                     layer_plan=plan(recipe['layers']), acceptance=d['acceptance'], avoid=d['avoid'])
        out = HERE / 'vfx/briefs' / f'{effect_id}.json'
        out.write_text(json.dumps(brief, indent=2) + '\n', encoding='utf-8')
        print('wrote', out.name, len(brief['layer_plan']), 'layers')


if __name__ == '__main__':
    main()
