"""Phase II (and the domain): Echo Bind, the lock on Kage. Played at his feet the moment a control modifier takes
hold. Thin blue threads drop from above onto him, a wide ring of light on the floor tightens round his feet and
snaps shut with a small white star, two narrower rings lock round his shins and chest and hold, turning slowly, and
fade as the lock lets go. It reads as a seal, not a hit: no sparks thrown, no smoke."""
from _witness import *

B = BLUE
LOCK = 10


def recipe():
    return effect('Witness_Bind', 'Echo Bind', 'status', 'void', 1.1, [
        *[slice_line(f'Thread {i + 1}', fade(B['HOT'], 220), 2.6, width=.025, angle=a, life=12, delay=i * 2, position=[x, 2.3, 0])
          for i, (a, x) in enumerate(((-80, -.5), (-96, .4), (-70, -.9), (-104, .8)))],
        floor_ring('Closing ring', B['HOT'], 1.6, LOCK + 4, thickness=.1, size_curve=[[0, 1], [70, .35], [100, .3]], fade_out=2),
        flash('Lock star', B['CORE'], .9, life=4, delay=LOCK, position=[0, .2, 0]),
        orbit_band('Ankle lock', fade(B['HOT'], 230), fade(B['BODY'], 0), fade(B['BODY'], 0), .5, .1, 50, tilt=(-74, 0, 0), delay=LOCK,
                   flow=-.05, position=[0, .2, 0], fade_in=2, fade_out=14, emissive=1.8, spin=[0, 4, 0]),
        orbit_band('Shin lock', fade(B['HOT'], 200), fade(B['BODY'], 0), fade(B['BODY'], 0), .42, .07, 46, tilt=(-74, 0, 0), delay=LOCK + 2,
                   flow=.05, position=[0, .7, 0], fade_in=2, fade_out=14, emissive=1.6, spin=[0, -4, 0]),
        orbit_band('Chest lock', fade(B['HOT'], 170), fade(B['BODY'], 0), fade(B['BODY'], 0), .5, .06, 42, tilt=(-74, 0, 0), delay=LOCK + 4,
                   flow=-.05, position=[0, 1.3, 0], fade_in=2, fade_out=14, emissive=1.5, spin=[0, 4, 0]),
        decal('Seal', 'T_EchoSeal01', fade(B['BODY'], 200), 1.5, 56, delay=LOCK - 2, spin=.6, fade_in=3, fade_out=16, emissive=1.6),
        motes('Sinking motes', 12, B['HOT'], color_end=fade(B['DEEP'], 0), size=(.04, .08), life=(24, 32), distance=(.2, .6), delay=LOCK + 2,
              rise=-.0006, radius=(.2, .6), position=[0, 1.0, 0]),
    ], attach='ground', peak=LOCK / 60, impact=.2, light=(.4, .45, 1), delivery=TARGETED,
        design='Thin blue threads drop onto Kage, a ring of light tightens round his feet and snaps shut with a small star, rings lock round his shins and chest and turn, over a turning seal.')
