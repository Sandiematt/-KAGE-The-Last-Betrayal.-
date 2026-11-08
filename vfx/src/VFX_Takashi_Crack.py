"""Phase 3: Tenrai, the channel. His sword stands in the floor and the domain holds: the family seal turning slowly
round the blade, gold light welling out of the cracks under it and pulsing, sparks shooting up off the cracks at
uneven times, and embers rising. Looping (the game holds it for the channel); a sustained status, so the cracks
pulse rather than flash. One 1.5 s cycle; the game crossfades two copies half a cycle apart."""
from _takashi import *

P = 90


def recipe():
    return effect('Takashi_Crack', 'Tenrai Channel', 'status', 'holy', P / 60, [
        decal('Seal', 'T_TomoeSeal01', fade(HOT, 220), 3.0, P, spin=.6, fade_in=14, fade_out=14, emissive=1.5),
        decal('Cracks', 'T_Crack01', HOT, 4.2, P, fade_in=10, fade_out=10, emissive=2.3, rotation=[0, 0, 0],
              size_curve=[[0, .94], [50, 1.04], [100, .94]], alpha_texture='T_NoiseTile01', alpha_scroll=[.004, .002]),
        floor_band('Floor light', fade(GOLD, 170), 1.8, .5, P, fade_in=15, fade_out=15),
        column('Blade glow', fade(GOLD, 150), .18, 2.2, P, scroll=(.01, -.05), fade_in=15, fade_out=15, emissive=1.3),
        radial_sparks('Crack sparks', 24, CORE, color_end=GOLD, distance=(1.0, 2.0), life=(10, 16), length=(.3, .55), interval=4, delay=2,
                      width=.06) | spray([[-.3, .3], [1.0, 2.0], [-.1, .1]], radius=1.8),
        embers('Embers', 24, interval=4, delay=1, life=(40, 56), rise=.0016, radius=(0, 2.0), position=[0, .4, 0]),
    ], attach='ground', peak=0, impact=0, light=(1, .78, .4), loop=True, delivery=SELF,
        design='The family seal turns slowly round the planted blade while gold light wells out of the cracks and pulses, sparks shoot up off the cracks at uneven times and embers rise.')
