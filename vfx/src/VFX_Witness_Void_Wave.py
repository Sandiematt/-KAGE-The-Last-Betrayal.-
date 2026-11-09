"""Phase I: Void Slash, one of its three crossing blade waves. A tall crescent of blue-violet light stands on the floor
and races forward (+X), its white leading edge bowed toward the way it travels; a dark echo of the crescent lags just
behind it, cards and shards peel off its back and hang on the path, and a thin line of light skims the floor under it.
It has no contact frame: the game spawns it, moves it and ends it, and the player jumps it or dashes through it.
The camera follows the head while baking, so frames 2-30 loop in flight."""
from _witness import *

B = BLUE
V = VIOLET


def recipe():
    tilt = (0, 0, 0)   # the crescent stands in the camera plane
    return effect('Witness_Void_Wave', 'Void Wave', 'projectile', 'void', .9, [
        shock_ring('Launch ring', B['HOT'], .7, life=10, thickness=.18, inherit=TRAIL, position=[0, .94, 0]),
        sustain(glow('Wave glow', fade(V['BODY'], 34), .8, life=6, fade_in=1, fade_out=3, position=[.7, .94, 0]), 3),
        # the crescent: bulging toward +X (ring angle 270 = +X), from the floor to above a man's head
        sustain(crescent('Dark echo', V['DEEP'], 1.0, .42, (205, 335), 6, tilt=tilt, position=[-.2, .94, 0],
                          fade_in=1, fade_out=3, cutoff=dict(start=.05, end=.3, easing='Linear'), emissive=1.0), 3),
        sustain(crescent('Wave body', B['BODY'], 1.0, .36, (200, 340), 6, tilt=tilt, position=[0, .94, 0],
                          fade_in=1, fade_out=3, cutoff=dict(start=0, end=.2, easing='Linear'), emissive=2.0), 3),
        sustain(crescent('Hot edge', B['CORE'], 1.01, .08, (210, 330), 6, tilt=tilt, position=[.02, .94, 0],
                          fade_in=1, fade_out=3, cutoff=0, emissive=2.6), 3),
        sustain(slice_line('Floor skim', B['HOT'], 1.6, width=.04, life=10, position=[-.6, .04, 0], inherit=TRAIL), 3),
        sustain(cards('Peeling cards', fade(V['HOT'], 210), 1, (16, 22), spread=.5, size=(.14, .2), position=[-.25, .8, 0], inherit=TRAIL), 4),
        sustain(radial_sparks('Shed shards', 1, B['HOT'], color_end=fade(V['BODY'], 0), distance=(.15, .45), life=(12, 18), width=.05,
                              length=(.1, .18), inherit=TRAIL, position=[-.2, .9, 0]), 2),
    ], attach='projectile', flight=.5, delivery=dict(kind='projectile'),
        design='A tall blue-violet crescent standing on the floor races forward with a white leading edge and a dark echo behind it, shedding cards and shards on its path over a thin line skimming the floor.')
