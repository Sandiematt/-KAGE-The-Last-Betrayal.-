"""Phase II: Orb Pulse, one shot from the orb in the Manipulator's hand. A white-hot orb inside a blue glow flies
along +X with a thin ring turning round it in a tilted plane (the orb of its sheet), a soft blue tail and small
threads of light shed behind it that hang and thin. Impact: VFX_Witness_Orb_Impact. The camera follows the head
while baking, so frames 2-24 loop in flight."""
from _witness import *

B = BLUE


def recipe():
    return effect('Witness_Orb_Shot', 'Orb Shot', 'projectile', 'void', .8, [
        shock_ring('Launch ring', B['HOT'], .45, life=10, thickness=.2, inherit=TRAIL),
        sustain(glow('Orb glow', fade(B['BODY'], 170), .9, life=6, fade_in=1, fade_out=3), 3),
        sustain(sprite('Orb core', 'T_Glow01', B['CORE'], life=6, size=.3, fade_in=1, fade_out=2, emissive=2.4), 3),
        sustain(orbit_band('Orb ring', fade(B['HOT'], 230), fade(B['BODY'], 0), fade(B['BODY'], 0), .3, .05, 6, tilt=(-70, 0, 22), fade_in=1, fade_out=2, emissive=2.0), 3),
        sustain(sprite('Tail', 'T_Streak01', B['BODY'], color_end=fade(B['DEEP'], 0), life=10, scale_start=[.5, 1.2, 1], scale_end=[.25, .4, 1],
                       easing='EaseOutCubic', position=[-.4, 0, 0], rotation=[0, 0, 90], fade_in=0, fade_out=7, emissive=1.8, inherit=TRAIL), 1),
        sustain(slice_line('Shed thread', fade(B['HOT'], 200), .6, width=.02, angle=[-30, 30], life=10, inherit=TRAIL), 3),
    ], attach='projectile', flight=.45, delivery=dict(kind='projectile'),
        design='A white-hot orb in a blue glow flies with a thin ring turning round it in a tilted plane, a soft blue tail and fine threads of light shed behind it.')
