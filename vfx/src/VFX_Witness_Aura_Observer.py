"""Phase I, The Observer: the Witness's calm presence, looping. A sustained status that never holds the brightest value:
a dim blue mantle, slow pale-blue curls rising and turning round the body (the reference's smoke "S" curls), a few
echo cards drifting at arm's length, pale motes lifting and hanging, a single four-point star glint now and then (the
star in its eye) and a faint band of light on the floor. Slow and sparse: it only watches. One 2 s cycle; the game
crossfades two copies half a cycle apart, so the loop has no seam."""
from _witness import *

P = 120
B = BLUE


def recipe():
    return effect('Witness_Aura_Observer', 'Observer Aura', 'status', 'void', P / 60, [
        mantle(B['BODY'], 34, 4.2, P),
        floor_light(B['BODY'], 1.3, P),
        wisps('Curls', fade(B['HOT'], 190), 1.0, count=5, width=.16, sweep=(0, 210), life=(48, 60), interval=22, delay=2,
              tilt=((-15, 15), (0, 360), (60, 120)), position=[0, 1.35, 0], flow=-.03),
        cards('Drifting cards', fade(B['HOT'], 200), 4, (40, 52), delay=6, interval=26, spread=1.25, position=[0, 1.4, 0],
              velocity=[[-.003, .003], [.002, .006], 0]),
        motes('Rising motes', 22, B['HOT'], color_end=fade(B['BODY'], 0), size=(.04, .09), life=(50, 70), distance=(.2, .6),
              interval=5, rise=.0012, position=[0, 1.0, 0], **UP),
        sparkle('Star glint', B['CORE'], .24, count=1, life=18, interval=29, delay=8, spread=1.1, position=[0, 1.4, 0]),
    ], attach='caster_ground', peak=0, impact=0, light=(.4, .45, 1), loop=True, delivery=SELF,
        design='A dim blue mantle, slow pale-blue curls rising and turning round the body, echo cards drifting at arm length, motes lifting and a single star glint now and then.')
