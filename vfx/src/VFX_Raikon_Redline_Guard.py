# Raikon's Redline Counter stance: for about a second he holds a guard that turns any blow from the front into a punish
# cut. A red line is drawn across his chest as the stance opens, a crescent barrier of crackling red lightning stands
# in front of him (the side he faces, +X), lit point by point along its length, over a slowly turning red guard ring on
# the floor. Left alone, the barrier breaks into falling sparks. No contact flash: a guard, not an attack.
import math
from vfxkit.primitives import *
from _raikon import *

R = 1.15                 # barrier radius around his chest
CHEST = (0.0, 1.1, 0.0)
ARC = (205, 335)         # ring angles: 0 up, 90 left, counter-clockwise; 270 points to his front (+X)
BREAK = 44


def at(angle):
    a = math.radians(angle)
    return [CHEST[0] - math.sin(a) * R, CHEST[1] + math.cos(a) * R, 0.0]


def recipe():
    anchors = [at(a) for a in range(ARC[0], ARC[1] + 1, 26)]
    layers = [
        orbit_band('Guard ring', fade(RED, 200), fade(RED, 0), fade(DEEP, 0), 1.25, .2, BREAK + 6, tilt=(-90, 0, 0), flow=-.04,
                   position=[0, .05, 0], size=1, size_curve=[[0, .35], [12, 1], [100, 1]], fade_in=0, fade_out=12, emissive=1.4),
        glow('Raise', fade(RED, 180), 2.2, life=10, delay=0, position=list(CHEST)),
        slice_line('Redline', RED, 3.4, width=.05, angle=0, life=12, delay=1, position=[.35, 1.25, 0]),
        orbit_band('Barrier', RED, fade(RED, 0), fade(DEEP, 0), R + .08, .2, BREAK + 4, tilt=(0, 0, 0), arc=ARC, flow=.06, delay=2,
                   position=list(CHEST), fade_in=4, fade_out=8, emissive=1.8, cutoff=dict(start=0, end=.95, easing='EaseInQuintic')),
    ]
    layers += charge_chain('Barrier arc', anchors, RED, HOT, step=2, until=BREAK, width=.32, glow=.35, restrike=3, delay=2)
    layers += [
    ]
    # the break runs down the crescent from its top: each point throws its sparks outward, then they fall and land
    for i, p in enumerate(reversed(anchors)):
        layers.append(pivot(f'Break {i + 1}', p, [
            radial_sparks(f'Break sparks {i + 1}', 9, HOT, color_end=RED, distance=(.4, .8), life=(20, 22),
                          delay=BREAK + 2 * i, width=.12, length=(.4, .75), gravity=.005, emissive=2.2,
                          collide=dict(height=.02, bounce=[.2, .35], friction=.5, reduction=.3)),
        ]))
    layers.append(pivot('Break embers', at(260), [
        motes('Break embers', 8, (255, 90, 64, 255), color_end=fade(DEEP, 0), size=(.06, .1), life=(14, 18), delay=BREAK + 4,
              distance=(.2, .5), radius=(0, .6))]))
    return effect('Raikon_Redline_Guard', 'Raikon Redline Guard', 'status', 'lightning', 1.3, layers,
                  attach='caster_ground', peak=2 / 60, impact=0, light=(1, .22, .16), delivery=SELF,
                  design='A red line is cut across his chest as the stance opens; a crescent barrier of red lightning stands '
                         'in front of him, lit point by point and kept crackling, over a slowly turning red guard ring, '
                         'then it breaks from the top down, each point throwing sparks that fall and land.')
