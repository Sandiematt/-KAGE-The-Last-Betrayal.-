"""Phase 2: Domain Pulse (and Heaven Cleaver's landing). The Titan's fists or blade come down on the floor: a white
contact, a wide gold shock ring racing out along the floor, a second thinner ring behind it, cracks of gold light
under the blow, a wall of dust and stone thrown up and out, and embers rising off the scar."""
from _takashi import *

HIT = 2


def recipe():
    return effect('Takashi_Pulse', 'Domain Pulse', 'boss', 'holy', 1.1, [
        flash('Contact flash', CORE, 2.6, life=5, delay=HIT, position=[0, .4, 0]),
        glow('Ground bloom', fade(GOLD, 170), 3.0, life=16, delay=HIT, position=[0, .3, 0]),
        tilted_ring('Shock ring', GOLD, 5.2, life=26, delay=HIT, tilt=(-80, 0, 0), thickness=.22,
                    alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.9, easing='EaseInCubic')),
        tilted_ring('Trailing ring', HOT, 3.6, life=22, delay=HIT + 4, tilt=(-80, 0, 0), thickness=.1),
        shock_ring('Air wave', fade(HOT, 150), 1.5, life=10, delay=HIT, thickness=.16, position=[0, .8, 0]),
        decal('Cracks', 'T_Crack01', HOT, 3.4, 62, delay=HIT, fade_in=0, fade_out=8, emissive=2.2,
              alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.95, easing='EaseInQuintic'), color_curve=COOL),
        radial_sparks('Rising shards', 20, CORE, color_end=GOLD, distance=(1.4, 3.2), life=(14, 22), length=(.4, .8), delay=HIT) | spray([[-2.6, 2.6], [1.6, 3.4], [-.3, .3]], radius=1.0),
        tilted_ring('Halo', HOT, 1.6, life=30, delay=HIT + 4, tilt=(-80, 0, 0), thickness=.12, travel=dict(start=[0, .3, 0], end=[0, 2.2, 0], easing='EaseOutCubic'), fade_out=16),
        debris('Stone', 14, [[-3.0, 3.0], [.8, 2.2], [-.5, .5]], color=DUST, floor=.02, delay=HIT, life=(30, 46)),
        smoke('Dust wall', fade(DUST, 185), count=9, size=(.8, 1.3), life=(32, 44), delay=HIT + 2, rise=.0005, radius=(.4, 2.8), position=[0, .3, 0]),
        embers('Embers', 10, delay=HIT + 8, life=(24, 36), interval=2, radius=(0, 1.4), position=[0, .6, 0]),
    ], attach='ground', peak=HIT / 60, impact=.9, light=(1, .78, .4), delivery=dict(kind='area'),
        screen=dict(shake=.8, flash_frames=1, flash='white', hitstop=.05),
        design='A white contact on the floor, a wide gold shock ring racing out along the ground with a thinner ring behind it, gold cracks under the blow, a wall of dust and stone thrown out and embers rising.')
