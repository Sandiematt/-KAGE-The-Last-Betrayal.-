"""Takashi, the Master's Flow (KAGE, Act III boss): one gold palette and the shared pieces of his effects.

Axes (all recipes): +X is the way Takashi faces (toward Kage), +Y up, Z toward the camera. The game bakes these to
sprite sheets through a side-on camera with a 10 degree pitch (vfx/tools/GameSheet.gd) and plays them additively in
2D, so every shape that must read is laid out in the XY plane, and floor marks are thin tilted bands or decals that
the pitch shows as a strip of light on the floor.

Palette: gold, not yellow. A white-hot core with a warm cast, a pale gold highlight, the saturated body (#FFBA40,
near his trim #E8C25C), an amber the light cools into, an ink-brown dark for backing and scorch, and warm grey dust.
Gold is the holy element here: it falls and rises vertically, eases in and sustains (seals, pillars, halos), unlike
Raikon's red lightning (jagged, re-struck, never travels) or Akari's sakura (tumbling petals on the wind).
"""
from vfxkit.primitives import *
from _raikon import jag, seg, bolt, pivot   # the painted-strand bolt builder (divine thunder)

CORE = (255, 250, 232, 255)    # core: white with a warm cast
HOT = (255, 228, 156, 255)     # pale gold highlight, where the core cools first
GOLD = (255, 186, 64, 255)     # body: saturated gold
AMBER = (214, 118, 22, 255)    # the body cooling: amber
INK = (40, 22, 4, 255)         # dark: ink-brown backing and scorch
DUST = (156, 132, 100, 255)    # matter: warm grey dust and stone

PALETTE = dict(core=list(CORE[:3]), body=list(GOLD[:3]), dark=list(INK[:3]), matter=list(DUST[:3]), accent=list(AMBER[:3]))

# white -> pale gold -> gold -> amber -> out: the value ramp every glowing gold piece cools through
COOL = ramp((0, CORE), (16, HOT), (42, GOLD), (78, AMBER), (100, fade(AMBER)))['color_curve']
# born already gold (auras, residue): no white flash on every piece
SOFT = ramp((0, fade(HOT, 0)), (14, HOT), (50, GOLD), (85, AMBER), (100, fade(AMBER)))['color_curve']


def embers(name, count, delay=0, life=(18, 30), interval=0, rise=.0012, **kw):
    """Gold embers that rise, slow and hang (holy: they lift, they never fall)."""
    return motes(name, count, HOT, color_end=fade(AMBER, 0), size=(.05, .1), life=life, distance=(.2, .7), delay=delay,
                 interval=interval, rise=rise, turbulence=.003, **kw)


def floor_band(name, color, radius, width, life, delay=0, **kw):
    """A band of light on the floor, tilted 80 degrees: a thin ellipse in the side view."""
    return orbit_band(name, color, fade(color, 0), fade(color, 0), radius, width, life, tilt=(-80, 0, 0), delay=delay, **kw)
