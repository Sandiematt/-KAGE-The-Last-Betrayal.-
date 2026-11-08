"""Phases 1 and 3: Golden Kunai and Kunai Execution. A white-hot gold kunai flies flat and fast with a gold glow,
drawing a thin amber streak and shedding sparks that fall away behind it. Impact: VFX_Takashi_Kunai_Impact.
The game turns the sheet to face the flight (the head's long axis is +X, tip forward)."""
from _takashi import *


def recipe():
    return effect('Takashi_Kunai', 'Golden Kunai', 'projectile', 'holy', .7, [
        shock_ring('Launch ring', GOLD, .28, life=9, thickness=.28, inherit=TRAIL),
        sustain(glow('Head glow', fade(GOLD, 110), .38, life=6, fade_in=1, fade_out=3), 3),
        sustain(sprite('Head kunai', 'T_Kunai01', HOT, life=6, scale_start=[1.1, 1.1, 1], fade_in=1, fade_out=2, emissive=1.5), 3),
        sustain(sprite('Streak', 'T_Streak01', AMBER, color_end=fade(AMBER, 0), life=9, scale_start=[.5, 1.7, 1],
                       scale_end=[.3, .5, 1], easing='EaseOutCubic', position=[-.55, 0, 0], rotation=[0, 0, 90], fade_in=0, fade_out=6,
                       alpha_texture='T_NoiseStreak01', alpha_scroll=[.06, 0], cutoff=dict(start=.05, end=.7, easing='EaseInQuadratic'),
                       emissive=1.8, inherit=TRAIL), 1),
        sustain(radial_sparks('Shed sparks', 1, HOT, color_end=fade(AMBER, 0), distance=(.15, .35), life=(10, 16), width=.05,
                              length=(.12, .2), gravity=.0012, inherit=TRAIL), 2),
    ], attach='projectile', flight=.4, delivery=dict(kind='projectile'),
        design='A white-hot gold kunai flies flat and fast inside a gold glow, drawing a thin amber streak and shedding sparks that drop away behind it.')
