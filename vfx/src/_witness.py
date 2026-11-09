"""The Witness, Architect of Echoes (KAGE final boss, 2026-11-09 four-phase redesign): its palettes and shared pieces.

Axes (all recipes): +X is the way the Witness faces (toward Kage), +Y up, Z toward the camera. The game bakes these to
sprite sheets through a side-on camera with a 10 degree pitch (vfx/tools/GameSheet.gd) and plays them additively in
2D (src/js/69-witness.js, WitnessFX), so every shape that must read lies in the XY plane and floor marks are thin
tilted bands or decals the pitch shows as a strip of light on the floor.

Palettes come from the user's four reference sheets (docs/art-reference/witness-phase-1..4.webp), which override the
written spec's violet/magenta wording: the user asked for the sheets' blue.
  BLUE     phases I and II: the royal / electric blue of the coat pattern, the halo cards and the chest orb (sampled
           #2e49db, #3149da, #3b46fd, #424cff; pale highlight #a6b0fc), white-hot core with a cold cast
  VIOLET   phase III: violet (#8f28f5, #791ff8) with a cyan-blue edge (the coat's underside) and gold rune accents
  MAGENTA  phase IV: magenta-violet (#9a02fb, #b40fff, #e411fe) with gold (the blade crown, the rune banners)
The Witness's element is the void: echoes, cards and seals that hang, re-form and draw in, never fire or lightning.
Each phase's aura differs in shape, motion and rhythm (calm curls; a tight neon column with control threads; hard
glitch pixels; a turning floor seal with gold rising), not only colour.
"""
from vfxkit.primitives import *
from _raikon import jag, seg, bolt, pivot
from _rage import pal, floor_ring

BLUE = pal((246, 248, 255, 255), (168, 180, 255, 255), (60, 74, 255, 255), (28, 38, 170, 255), (6, 6, 28, 255), (108, 114, 168, 255))
VIOLET = pal((252, 246, 255, 255), (214, 168, 255, 255), (146, 44, 248, 255), (78, 14, 160, 255), (12, 2, 26, 255), (128, 108, 160, 255))
MAGENTA = pal((255, 246, 255, 255), (240, 186, 255, 255), (184, 40, 255, 255), (104, 10, 170, 255), (16, 2, 24, 255), (140, 110, 160, 255))
CYAN = (90, 170, 255, 255)
GOLD = (255, 196, 110, 255)
GOLD_HOT = (255, 236, 190, 255)

UP = dict(spawn=dict(shape='Sphere', radius=[.35, 1.0], rotate=False))   # world-direction motion (rising)


def mantle(color, alpha, size, life, y=1.25):
    """The sustained dim light round the body: never the brightest thing on screen."""
    return sprite('Mantle', 'T_Glow01', fade(color, alpha), life=life, size=size, position=[0, y, 0], fade_in=20, fade_out=20,
                  size_curve=[[0, .96], [50, 1.03], [100, .96]])


def floor_light(color, radius, life, alpha=110):
    """A faint band of light on the floor under the figure (tilted 80 degrees: a thin ellipse in the side view)."""
    return orbit_band('Floor light', fade(color, alpha), fade(color, 0), fade(color, 0), radius, .32, life, tilt=(-80, 0, 0), fade_in=20, fade_out=20)


def cards(name, color, count, life, delay=0, interval=0, spread=1.2, size=(.22, .32), **kw):
    """Echo cards (T_EchoCard01): the halo's rectangular shards, popping in, hanging, turning a little, eroding."""
    return sprite(name, 'T_EchoCard01', color, count=count, life=list(life) if isinstance(life, (list, tuple)) else life, delay=delay, interval=interval,
                  size=list(size), rotation=[0, 0, [-35, 35]], spin=[0, 0, [-1.2, 1.2]], billboard='RotatedBillboard',
                  spawn=dict(shape='Sphere', radius=[spread * .4, spread], rotate=False), fade_in=1, fade_out=6, emissive=1.7,
                  alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.7, easing='EaseInCubic')) | kw


def crescent(name, color, radius, width, sweep, life, **kw):
    """A slash_arc held at its full sweep (no racing head): the standing crescent of a travelling blade wave, whose
    instances are re-emitted every few frames and must not each replay the sweep. Ring angles: 0 up, 90 left, 270 +X."""
    layer = slash_arc(name, color, radius=radius, width=width, sweep=sweep, life=life, **kw)
    layer['ring'] = dict(layer['ring'], angle_start=sweep[0], angle_end=sweep[1], angle_fade=[18, 18])
    for k in ('angle_easing',):
        layer['ring'].pop(k, None)
    layer['ring']['inner'] = [radius - width, 0]
    return layer


def glitch(name, color, count, life, delay=0, interval=0, spread=1.1, size=(.28, .55), **kw):
    """Hard glitch pixels (T_GlitchPix01): on for a few frames, off with no fade, never moving: a broken signal."""
    return sprite(name, 'T_GlitchPix01', color, count=count, life=list(life) if isinstance(life, (list, tuple)) else life, delay=delay, interval=interval,
                  size=list(size), billboard='Billboard', spawn=dict(shape='Sphere', radius=[spread * .3, spread], rotate=False),
                  fade_in=0, fade_out=1, emissive=1.9) | kw
