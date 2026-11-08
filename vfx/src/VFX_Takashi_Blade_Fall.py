"""Phase 2: Blade Rain, one blade. A gold mark tightens on the floor, then a giant golden sword falls point first out
of the sky (fast, easing in) and drives into the floor: a white contact, a ring and cracks of gold light, stone and
dust thrown out, and the blade stands a moment glowing before it is eaten away from the hilt down."""
from _takashi import *

HIT = 18     # the frame the point meets the floor (the game lines its hit up with this)


def recipe():
    fall = dict(start=[0, 7.5, 0], end=[0, 0, 0], easing='EaseInQuadratic')
    return effect('Takashi_Blade_Fall', 'Blade Rain', 'boss', 'holy', 1.25, [
        floor_band('Mark', fade(GOLD, 220), .8, .3, HIT + 4, fade_in=2, fade_out=4, size_curve=[[0, 1.5], [100, .7]]),
        sprite('Falling blade', 'T_GiantBladeV01', CORE, life=HIT, billboard='YAxisFixed', pivot='bottom', scale_start=[3.8, 3.8, 1],
               travel=fall, color_curve=ramp((0, fade(GOLD, 150)), (70, HOT), (100, HOT))['color_curve'], fade_in=4, fade_out=0, emissive=1.3),
        sprite('Fall streak', 'T_Streak01', fade(GOLD, 150), life=HIT, billboard='YAxisFixed', pivot='bottom', scale_start=[.5, 5.0, 1],
               travel=dict(start=[0, 10.5, 0], end=[0, 3.2, 0], easing='EaseInQuadratic'), fade_in=6, fade_out=2, emissive=1.1),
        flash('Contact flash', CORE, 2.0, life=4, delay=HIT, position=[0, .4, 0]),
        sprite('Standing blade', 'T_GiantBladeV01', CORE, life=44, delay=HIT, billboard='YAxisFixed', pivot='bottom',
               scale_start=[3.8, 3.8, 1], position=[0, -.5, 0], color_curve=COOL, alpha_texture='T_NoiseStreak01',
               cutoff=dict(start=0, end=.95, easing='EaseInCubic'), fade_in=0, fade_out=10, emissive=2.0),
        tilted_ring('Floor ring', GOLD, 1.8, life=16, delay=HIT, tilt=(-80, 0, 0), thickness=.28),
        decal('Cracks', 'T_Crack01', HOT, 2.4, 56, delay=HIT, fade_in=0, fade_out=8, emissive=2.2,
              alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.95, easing='EaseInQuintic'), color_curve=COOL),
        radial_sparks('Rising shards', 12, CORE, color_end=GOLD, distance=(1.0, 2.4), life=(12, 18), length=(.3, .6), delay=HIT) | spray([[-1.4, 1.4], [1.2, 2.6], [-.2, .2]], radius=.4),
        tilted_ring('Halo', HOT, .9, life=26, delay=HIT + 3, tilt=(-80, 0, 0), thickness=.1, travel=dict(start=[0, .4, 0], end=[0, 3.0, 0], easing='EaseOutCubic'), fade_out=12),
        debris('Stone', 8, [[-1.6, 1.6], [.6, 1.6], [-.4, .4]], color=DUST, floor=.02, delay=HIT, life=(28, 40)),
        smoke('Dust', fade(DUST, 170), count=4, size=(.6, .9), life=(30, 44), delay=HIT + 1, rise=.0005, radius=(0, .6)),
        embers('Embers', 10, delay=HIT + 6, life=(20, 28), interval=2, radius=(0, .5), position=[0, 1.0, 0]),
    ], attach='ground', peak=HIT / 60, impact=.6, light=(1, .78, .4), delivery=TARGETED,
        screen=dict(shake=.4, hitstop=.03),
        design='A gold mark tightens on the floor, then a giant golden sword falls point first from the sky and drives into it with a white contact, a ring and cracks of gold light, stone and dust thrown out; the blade stands glowing a moment and is eaten away.')
