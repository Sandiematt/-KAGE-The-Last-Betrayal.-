"""Phase II, The Manipulator: the Witness's presence once it takes control, looping. It must read round the figure (the
game draws it behind the body), so most of it lies outside the silhouette: a turning blue Echo seal on the floor, two
wide control rings circling the body at the knees and the chest in tilted planes, blue flame wisps licking up past the
shoulders and over the crown, long control threads thrown out from the body toward the floor and the air, pale arcs
snapping between points on the body, and a tight neon sheath of streaming light behind it all (the sheet's hard blue
outline glow). Faster and tighter than the Observer's. One 1 s cycle; the game crossfades two copies half a cycle apart."""
import random
from _witness import *

P = 60
B = BLUE


def recipe():
    rnd = random.Random(41)
    ring = dict(flow=-.07, fade_in=10, fade_out=10, emissive=1.9)
    layers = [
        mantle(B['BODY'], 70, 5.2, P, y=1.3),
        decal('Control seal', 'T_EchoSeal01', fade(B['HOT'], 210), 3.2, P, spin=.9, fade_in=10, fade_out=10, emissive=1.7),
        floor_light(B['BODY'], 1.5, P, alpha=170),
        column('Sheath', fade(B['BODY'], 95), .66, 2.8, P, scroll=(.006, -.05), fade_in=10, fade_out=10, emissive=1.4),
        speed_streaks('Rising dashes', fade(B['HOT'], 190), .74, 2.7, P, speed=-.07, fade_in=10, fade_out=10),
        orbit_band('Knee ring', fade(B['HOT'], 220), fade(B['BODY'], 0), fade(B['BODY'], 0), 1.15, .1, P, tilt=(-72, 0, 10), position=[0, .55, 0], **ring),
        orbit_band('Chest ring', fade(B['HOT'], 200), fade(B['BODY'], 0), fade(B['BODY'], 0), .95, .08, P, tilt=(-64, 0, -16), position=[0, 1.45, 0],
                   **(ring | dict(flow=.07))),
        wisps('Blue flames', fade(B['HOT'], 220), 1.15, count=8, width=.24, sweep=(0, 140), life=(16, 24), interval=6, delay=1,
              tilt=((-20, 20), (0, 360), (70, 110)), position=[0, 1.9, 0], broken=.15),
    ]
    # pale arcs jumping between two points on the body at uneven times
    for k, born in enumerate(sorted(rnd.sample(range(2, P - 4), 9))):
        y0 = rnd.uniform(.45, 2.0)
        a = (rnd.uniform(-.25, .25), y0, .28)
        b = (rnd.uniform(-.3, .3), y0 + rnd.choice([-1, 1]) * rnd.uniform(.3, .5), .28)
        layers.append(seg(f'Body arc {k + 1}', a, b, .26, B['CORE'] if k % 3 == 0 else B['HOT'], born, 3, color_end=B['BODY'],
                          mirror=1 if k % 2 == 0 else -1, emissive=1.8))
    # control threads: long thin lines thrown out from the body at uneven times
    for k, (born, ang, y) in enumerate(((4, 28, 1.6), (13, -24, 1.1), (22, 152, 1.5), (31, -160, .9), (40, 64, 1.9), (49, 118, 1.2), (55, -40, 1.7))):
        layers.append(slice_line(f'Thread {k + 1}', fade(B['HOT'], 230), 3.4, width=.03, angle=ang, life=12, delay=born, position=[0, y, 0]))
    layers.append(motes('Motes', 24, B['HOT'], color_end=fade(B['BODY'], 0), size=(.05, .09), life=(26, 34), distance=(.3, .9),
                        interval=2, rise=.002, position=[0, 1.0, 0], spawn=dict(shape='Sphere', radius=[.5, 1.3], rotate=False)))
    return effect('Witness_Aura_Manipulator', 'Manipulator Aura', 'status', 'void', P / 60, layers,
                  attach='caster_ground', peak=0, impact=0, light=(.35, .42, 1), loop=True, delivery=SELF,
                  design='A turning blue Echo seal on the floor, two wide control rings circling the body, blue flame wisps licking past the crown, long control threads thrown out and pale arcs snapping over a neon sheath.')
