# Thunder Swing's ground wave: red lightning racing along the floor toward the player (jump it or dash through it).
# The whole life of one wave: born in a flare where the blade hits the floor, its front races forward (+X) at a steady
# speed, then it thins out and dies. The front (rearing bolts, hot glow, floor light, spat sparks) travels; the floor
# arcs, embers, dust and a cooling red scorch streak are born on its path and stay where they were born (TRAIL), so the
# wake stretches out behind the front and cools to deep red.
# The front leaves fast and brakes to a stop at the target's feet by STOP (a constant braking force), where it collapses
# into a last strike and a scorch patch. The game plays it once over the wave's life at the wave's position: its export
# camera follows the front (x = SPEED*n - BRAKE*n*n/2 until STOP), so in the game the wake slides back off the moving
# wave exactly as it stays put here.
import random
from vfxkit.primitives import *
from _raikon import *

END = 84        # last strike; the wave thins out from about f66 and is gone by the end (96)
STOP = 76       # the front comes to rest at the target's feet
SPEED = .158    # metres per frame at launch; it brakes uniformly to 0 at STOP (about 6 m travelled)
BRAKE = SPEED / STOP
LIFE = 96


def wake(layer):
    """A layer left on the floor where the front was when it was born."""
    return layer | dict(inherit=TRAIL)


def recipe():
    rnd = random.Random(19)
    front = [
        # a red floor band under the front, cross-faded instances so its light never pops
        sprite('Ground band', 'T_Glow01', fade(RED, 110), billboard='Billboard', scale_start=[2.0, .7, 1], position=[.1, .16, 0],
               count=5, interval=15, life=30, fade_in=15, fade_out=15, emissive=1.2),
    ]
    # bolts rearing up at the leading edge, leaning into the travel
    for k in range(1, 20):
        x = rnd.uniform(.25, .6)
        h = rnd.uniform(.8, 1.4) * (1 if k < 17 else .6)
        a = (x, .03, rnd.uniform(-.1, .1))
        b = (x + rnd.uniform(.1, .35), h, rnd.uniform(-.1, .1))
        front.append(sprite(f'Head glow {k}', 'T_Glow01', fade(RED, 200), billboard='Billboard', size=1.0, position=[x, .35, 0],
                            delay=4 * k, life=5, size_curve=[[0, 1.3], [100, .6]], fade_in=0, fade_out=4, emissive=1.6))
        front.append(seg(f'Head bolt {k}', a, b, .5, HOT, 4 * k, 3, color_end=RED, mirror=1 if k % 2 == 0 else -1, emissive=2.4))
    front.append(pivot('Spit', (.4, .08, 0), [radial_sparks('Spit sparks', 24, HOT, color_end=RED, distance=(.5, 1.2), life=(8, 12),
                                                         interval=3, delay=0, width=.06, gravity=.002, hemisphere=True)]))
    # the wake: arcs re-struck on the floor just behind the front (two per strike), hot nearest the front, cooling
    # further back, sparser, shorter and deeper as the wave dies; each stays where it was struck
    for i in range(2 * (END // 2 + 1)):
        born = 2 * (i // 2)
        fadek = max(0.0, (born - 66) / (END - 66))
        if fadek > 0 and i % 2: continue
        x0 = rnd.uniform(-1.1, .45)
        near = (x0 + 1.1) / 1.55
        a = (x0, rnd.uniform(.03, .12), rnd.uniform(-.2, .2))
        b = (x0 + rnd.uniform(.45, .9) * (1 - .4 * fadek) * rnd.choice([1, 1, -1]), rnd.uniform(.08, .38), rnd.uniform(-.2, .2))
        color = (255, 120, 100, 255) if fadek > 0 else HOT if near > .7 else (255, 120, 100, 255) if near > .35 else RED
        front.append(wake(seg(f'Crawl {i + 1}', a, b, (.26 + .12 * near) * (1 - .4 * fadek), color, born, 3,
                              color_end=RED if near > .35 and not fadek else DEEP, mirror=1 if i % 2 == 0 else -1,
                              emissive=(1.4 + 1.0 * near) * (1 - .4 * fadek))))
    front += [
        # the scorched streak: floor light stamped every 4 frames, cooling red to deep where the front has passed
        wake(sprite('Scorch streak', 'T_Glow01', fade(RED, 220), billboard='Billboard', scale_start=[1.2, .34, 1], position=[0, .07, 0],
                    count=18, interval=4, life=28, fade_in=0, fade_out=12, emissive=1.8,
                    color_curve=ramp((0, fade(RED, 220)), (30, fade((210, 20, 14, 255), 200)), (70, fade(DEEP, 150)),
                                     (100, fade((70, 6, 10, 255), 0)))['color_curve'])),
        # the end: one last strike where the front dies, a scorch patch and a handful of embers left there
        seg('Final strike', (.4, .03, 0), (.62, 1.1, 0), .55, HOT, END, 3, color_end=RED, emissive=2.4),
        wake(glow('Final patch', fade(RED, 200), 1.4, life=12, delay=END, position=[.3, .15, 0])),
        wake(decal('Final scorch', 'T_Crack01', (255, 60, 40, 255), 1.4, 12, delay=END, fade_in=0, fade_out=8, position=[.3, .05, 0],
                   emissive=1.8, color_curve=ramp((0, (255, 60, 40, 255)), (50, DEEP), (100, fade((70, 6, 10, 255), 0)))['color_curve'])),
        wake(pivot('Final embers', (.3, .2, 0), [motes('Final embers', 8, (255, 110, 80, 255), color_end=fade(DEEP, 0),
                                                       size=(.06, .1), life=(9, 12), delay=END, distance=(.3, .7), hemisphere=True,
                                                       rise=.001)])),
        wake(motes('Wake embers', 24, (255, 96, 66, 255), color_end=fade(DEEP, 0), size=(.06, .11), life=(18, 24), interval=3,
                   turbulence=.001) | spray([[-.9, -.2], [.1, .55], [-.2, .2]])),
        wake(smoke('Wake dust', (150, 128, 126, 150), count=7, size=(.4, .6), life=(26, 28), interval=10, delay=2, rise=.0004,
                   radius=(0, .15), position=[-.2, .12, 0])),
    ]
    layers = [
        # birth: the wave tears out of the floor where the blade struck (stays there)
        glow('Birth bloom', fade(RED, 210), 2.2, life=12, delay=0, position=[.2, .35, 0]),
        *bolt('Birth bolt', jag((.3, .03, 0), (.55, 1.9, 0), 3, .2, seed=3), .6, HOT, 0, 4, color_end=RED),
        dict(name='Wave front', renderer='None', life=LIFE - 2, velocity=[SPEED, 0, 0], forces=[dict(type='Gravity', gravity=[-BRAKE, 0, 0])],
             children=front),
    ]
    return effect('Raikon_Thunder_Wave', 'Raikon Thunder Wave', 'boss', 'lightning', LIFE / 60, layers,
                  attach='caster_ground', peak=2 / 60, impact=.3, light=(1, .22, .16), delivery=SELF,
                  design='A red lightning wave tears out of the floor in a flare and races along the ground toward the '
                         'target: short white-cored bolts rear up and lean forward at its front while arcs re-strike on '
                         'the floor behind it and a scorched streak cools to deep red in its wake, with sparks, embers '
                         'and dust shed behind, until it thins out and dies.')
