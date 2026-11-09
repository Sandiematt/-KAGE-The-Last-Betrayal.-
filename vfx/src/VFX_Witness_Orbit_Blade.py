"""Phase I: Orbit Blades, one halo blade loosed at Kage. One of the halo's echo cards, turned edge-on into a blade, spins
flat and fast along +X: a white-hot card with a blue edge glow, a long thin blue streak drawn out behind it and tiny
cards left hanging on the path (they never fall: an echo hangs where it was). The game turns the sheet along the flight and plays frames 2-24 in a loop while it flies."""
from _witness import *

B = BLUE


def recipe():
    return effect('Witness_Orbit_Blade', 'Orbit Blade', 'projectile', 'void', .8, [
        shock_ring('Launch ring', B['HOT'], .3, life=9, thickness=.24, inherit=TRAIL),
        sustain(glow('Head glow', fade(B['BODY'], 140), .55, life=6, fade_in=1, fade_out=3), 3),
        sustain(sprite('Head card', 'T_EchoCard01', B['CORE'], life=6, rotation=[0, 0, [0, 360]], spin=[0, 0, -24], scale_start=[.42, .42, 1], fade_in=1, fade_out=2, emissive=1.9), 3),
        sustain(sprite('Streak', 'T_Streak01', B['BODY'], color_end=fade(B['DEEP'], 0), life=10, scale_start=[.6, 1.9, 1], scale_end=[.3, .5, 1],
                       easing='EaseOutCubic', position=[-.6, 0, 0], rotation=[0, 0, 90], fade_in=0, fade_out=7,
                       alpha_texture='T_NoiseStreak01', alpha_scroll=[.06, 0], cutoff=dict(start=.05, end=.7, easing='EaseInQuadratic'),
                       emissive=2.0, inherit=TRAIL), 1),
        sustain(cards('Hanging cards', fade(B['HOT'], 200), 1, (14, 20), spread=.15, size=(.08, .12), inherit=TRAIL), 3),
    ], attach='projectile', flight=.4, delivery=dict(kind='projectile'),
        design='A white-hot echo card spins flat and fast with a blue glow, drawing a long thin blue streak and leaving tiny cards hanging on its path.')
