"""Phase 1+: Poison Kunai / Kunai Rain / Shadow Flip's thrown kunai, as single-target petal projectiles. A white-hot
crescent blade-petal head with a pink glow, a thin deep-pink streak, and petals shed off the path that tumble down.
Impact: VFX_Sakura_Petal_Impact. The director turns the emitter to face the flight (head's long axis is +X)."""
from _sakura import *


def recipe():
    return effect('Sakura_Petal_Shot', 'Petal Shot', 'projectile', 'sakura', 1.0, [
        shock_ring('Launch ring', PINK, .3, life=9, thickness=.3, inherit=TRAIL),
        sustain(blade('Head blade', length=1.35, width=.62, life=6, emissive=2.6, cutoff=None, color_curve=None,
                      color=list(CORE), fade_in=1, fade_out=2), 3),
        sustain(glow('Head glow', fade(PINK, 190), .8, life=6, fade_in=1, fade_out=3), 3),
        sustain(sprite('Streak', 'T_Streak01', DEEP, color_end=fade(DEEP, 0), life=9, scale_start=[.9, 1.6, 1],
                       scale_end=[.5, .4, 1], easing='EaseOutCubic', position=[-.35, 0, 0], fade_in=0, fade_out=6,
                       alpha_texture='T_NoiseStreak01', alpha_scroll=[.06, 0], cutoff=dict(start=.05, end=.7, easing='EaseInQuadratic'),
                       emissive=1.8, inherit=TRAIL), 1),
        sustain(petals('Shed petals', 1, life=(24, 34), size=(.1, .16), gravity=.0012,
                       velocity=[[-.02, -.006], [-.006, .01], [-.005, .005]], inherit=TRAIL), 3),
    ], attach='projectile', flight=.4, delivery=dict(kind='projectile'),
        design='A white-hot crescent petal flies flat and fast with a pink glow, drawing a thin deep-pink streak and shedding petals that tumble down behind it.')
