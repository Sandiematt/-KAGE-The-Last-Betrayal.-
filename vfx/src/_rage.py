"""Kage's seven rage arts (KAGE, 2026-11-08 weapon redesign): one palette per weapon and the shared pieces.

Axes (all recipes): +X is the way Kage faces (toward the foe), +Y up, Z toward the camera. The game bakes these to
sprite sheets through a side-on camera with a 10 degree pitch (vfx/tools/GameSheet.gd) and plays them additively in
2D (src/js/67-rage-arts.js, RageFx), turned per strike, so every shape that must read lies in the XY plane and floor
marks are thin tilted bands the pitch shows as a strip of light.

Each palette: a white-hot core with the weapon's cast, a pale highlight, the saturated body, a deep tone the light
cools into, an ink dark and a matter grey. The arts differ in shape, motion and rhythm, never only colour:
  crimson   Kagetsu    a crescent that sweeps open and holds like a moon, shards and motes that hang
  bolt      Tsubame    a straight jagged streak, re-struck mirrored, no travel, an after-flicker
  violet    Shizuka    a long hair-thin cut that appears whole, a second cut opening a beat later, slow motes
  hell      Onikiri    an eruption from the floor: fire tongues, a red-hot crack, rock, smoke
  tidal     Mizuchi    a crown of water thrown up and falling back, rings on the floor, mist
  scythe    Yamigama   an enormous crescent with dark strands drawn inward, smoke
  quake     Iwakudaki  rings racing out along the floor three times over a rune seal, rock and dust
"""
from vfxkit.primitives import *


def pal(core, hot, body, deep, ink, matter):
    p = dict(CORE=core, HOT=hot, BODY=body, DEEP=deep, INK=ink, MATTER=matter)
    p['PALETTE'] = dict(core=list(core[:3]), body=list(body[:3]), dark=list(ink[:3]), matter=list(matter[:3]), accent=list(deep[:3]))
    p['COOL'] = ramp((0, core), (16, hot), (42, body), (78, deep), (100, fade(deep)))['color_curve']
    p['SOFT'] = ramp((0, fade(hot, 0)), (14, hot), (50, body), (85, deep), (100, fade(deep)))['color_curve']
    return p


CRIMSON = pal((255, 244, 246, 255), (255, 176, 184, 255), (255, 34, 56, 255), (150, 6, 22, 255), (30, 2, 6, 255), (120, 96, 98, 255))
BOLT = pal((246, 254, 255, 255), (190, 238, 255, 255), (56, 200, 255, 255), (20, 96, 200, 255), (2, 14, 30, 255), (120, 140, 156, 255))
VIOLET = pal((252, 248, 255, 255), (226, 208, 255, 255), (164, 107, 255, 255), (96, 40, 200, 255), (14, 4, 30, 255), (150, 136, 176, 255))
HELL = pal((255, 246, 222, 255), (255, 206, 150, 255), (255, 72, 28, 255), (170, 20, 8, 255), (30, 8, 4, 255), (96, 82, 76, 255))
TIDE = pal((240, 252, 255, 255), (186, 230, 255, 255), (47, 157, 255, 255), (12, 76, 170, 255), (2, 16, 36, 255), (196, 222, 240, 255))
SCYTHE = pal((250, 236, 255, 255), (220, 170, 255, 255), (154, 60, 255, 255), (80, 16, 150, 255), (8, 2, 14, 255), (110, 96, 130, 255))
QUAKE = pal((255, 250, 228, 255), (255, 228, 150, 255), (255, 181, 31, 255), (190, 110, 12, 255), (32, 20, 4, 255), (140, 116, 86, 255))


def floor_ring(name, color, radius, life, delay=0, thickness=.2, **kw):
    """A shock ring lying on the floor (tilted 80 degrees): a thin ellipse of light racing out in the side view."""
    return tilted_ring(name, color, radius, life=life, delay=delay, tilt=(-80, 0, 0), thickness=thickness, **kw)
