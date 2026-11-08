"""Akari's Senbonzakura kit: one palette and the petal building blocks every sakura recipe shares.

Axes (all recipes): +X is the way Akari faces (toward Kage), +Y up, Z toward the camera. The game plays these in 2D
through EffekseerEmitter2D, where Z only changes draw depth, so every shape that must read is laid out in the XY
plane: radial bursts emit on a Z-axis circle, the storm vortex spins about Z, and floor marks are thin tilted
ellipses rather than flat decals (a ground-plane decal is edge-on in a side view).

Palette: sakura pink #FF66B2 -> deep pink #FF1493 with white-hot cores, additive over the dark arena. One Blend
role (MATTER, pale petals) gives the storm weight, and WINE is the only dark (backing for the vortex).
"""
from vfxkit.primitives import *

CORE = (255, 246, 252, 255)    # white-hot core
HOT = (255, 184, 224, 255)     # pink-white highlight, where the core cools first
PINK = (255, 102, 178, 255)    # #FF66B2, the body
DEEP = (255, 20, 147, 255)     # #FF1493, the saturated rim and the cooled tail
WINE = (70, 6, 40, 150)        # dark backing (Blend)
MATTER = (255, 196, 226, 225)  # pale petals, alpha-blended: the material that stays after the light goes out

PALETTE = dict(core=list(CORE[:3]), body=list(PINK[:3]), dark=list(WINE[:3]), matter=list(MATTER[:3]), accent=list(DEEP[:3]))

# white -> pink-white -> #FF66B2 -> #FF1493 -> out: the value ramp every glowing petal cools through
COOL = ramp((0, CORE), (18, HOT), (45, PINK), (80, DEEP), (100, fade(DEEP)))['color_curve']
# a petal that is born already pink (ambient, residue): no white flash on every petal
SOFT = ramp((0, fade(HOT, 0)), (12, HOT), (50, PINK), (85, DEEP), (100, fade(DEEP)))['color_curve']


def petals(name, count, size=(.14, .22), life=(30, 45), delay=0, interval=0, gravity=.0007, turbulence=.004,
           curve=COOL, emissive=1.6, **kw):
    """Glowing sakura petals that tumble (random roll and spin) and drift down through turbulence.
    Pass spawn/travel (or spray(...)) to place and throw them; additive."""
    forces = [dict(type='Turbulence', power=turbulence, scale=5)]
    if gravity: forces.append(dict(type='Gravity', gravity=[0, -gravity, 0]))
    return sprite(name, 'T_SakuraPetal01', CORE, count=count, life=list(life), delay=delay, interval=interval,
                  size=list(size), rotation=[0, 0, [-180, 180]], spin=[0, 0, [-7, 7]], forces=forces,
                  color_curve=curve, fade_in=1, fade_out=8, emissive=emissive) | kw


def matter(name, count, size=(.13, .2), life=(40, 60), delay=0, interval=0, gravity=.0006, **kw):
    """Pale alpha-blended petals: the same tumble with no glow, so the storm keeps material after the light dies."""
    return sprite(name, 'T_SakuraPetal01', MATTER, count=count, life=list(life), delay=delay, interval=interval,
                  size=list(size), rotation=[0, 0, [-180, 180]], spin=[0, 0, [-5, 5]], blend='Blend',
                  forces=[dict(type='Turbulence', power=.004, scale=5), dict(type='Gravity', gravity=[0, -gravity, 0])],
                  color_end=fade(MATTER, 0), easing='EaseInCubic', fade_in=4, fade_out=14) | kw


def blossom(name, size, life=18, delay=0, count=1, **kw):
    """A five-petal blossom that pops open (POP), turns a little, and is eaten from its thin petal tips (dissolve)."""
    return sprite(name, 'T_SakuraBlossom01', CORE, count=count, life=life, delay=delay, size=size, size_curve=POP,
                  rotation=[0, 0, [-36, 36]], spin=[0, 0, [-2, 2]], color_curve=COOL,
                  alpha_texture='T_NoiseTile01', cutoff=DISSOLVE, fade_in=0, fade_out=6, emissive=1.8) | kw


def blade(name, length=1.0, width=None, life=12, delay=0, angle=0, vertical=False, **kw):
    """One crescent blade-petal (the Senbonzakura blade fragment). Horizontal texture: long axis +X bowing up;
    vertical=True uses the standing copy (long axis +Y) for DirectionalBillboard bursts and base-pivoted blades."""
    w = width if width is not None else length
    texture = 'T_PetalBladeV01' if vertical else 'T_PetalBlade01'
    shortest = min(life) if isinstance(life, (list, tuple)) else life
    return sprite(name, texture, CORE, life=list(life) if isinstance(life, (list, tuple)) else life, delay=delay,
                  scale_start=[w, length, 1] if vertical else [length, w, 1],
                  rotation=[0, 0, angle], color_curve=COOL, alpha_texture='T_NoiseStreak01',
                  cutoff=dict(start=0, end=.85, easing='EaseInCubic'), fade_in=0, fade_out=max(3, shortest * .4), emissive=2.2) | kw


def screen_circle(radius=(0, .3)):
    """Spawn on a circle in the screen plane (axis Z): local +X points outward, so travel end [[d0,d1],0,0] throws
    particles radially in the plane the 2D game shows."""
    return dict(shape='Circle', axis='ZAxis', radius=list(radius), rotate=True)


def floor_ellipse(name, color, radius, width, life, delay=0, **kw):
    """A band on the floor, tilted 80 degrees: a thin ellipse in the side view that reads as light on the ground."""
    return orbit_band(name, color, fade(color, 0), fade(color, 0), radius, width, life, tilt=(-80, 0, 0), delay=delay, **kw)
