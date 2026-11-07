# Raikon's storm presence (his later phases): red lightning that keeps crawling over his body. A sustained status, so
# it never holds the scene's brightest value: a dim red mantle of light, dark red strands circling him, short arcs
# jumping between points on his body at uneven times, embers rising off him and a few arcs at his feet.
# One 1 s cycle; every layer lives inside it. The game crossfades two copies half a cycle apart, so the loop has no seam.
import random
from vfxkit.primitives import *
from _raikon import *

P = 60


def recipe():
    rnd = random.Random(29)
    layers = [
        glow('Mantle', fade(RED, 45), 2.2, life=P, delay=0, position=[0, 1.05, 0], size_curve=[[0, 1], [100, 1]], fade_in=4, fade_out=4),
    ]
    # hard red ribbons orbiting him at three heights and tilts, each turning about once every 30 frames, their noise
    # mask streaming round them; the near half passes in front of him
    for i, (h, roll, turn) in enumerate(((.55, 14, 12), (1.1, -18, -12), (1.6, 8, 12))):
        layers.append(dict(name=f'Orbit {i + 1}', renderer='None', life=P, position=[0, h, 0], spin=[0, turn, 0], children=[
            orbit_band(f'Ribbon {i + 1}', (215, 22, 16, 235), fade(RED, 0), fade(DEEP, 0), .55 - .06 * abs(i - 1), .13, P - 2 * i,
                       tilt=(-72, 0, roll), arc=(0, 210), flow=-.06, delay=2 * i, fade_in=5, fade_out=9, emissive=1.7)]))
    # arcs jumping between two points ON his body (both ends inside the capsule, on its camera-facing surface),
    # at uneven times: shoulder to hip, chest to the opposite arm; only the odd one has a white core
    births = sorted(rnd.sample(range(2, P - 4), 18))
    for k, born in enumerate(births):
        y0 = rnd.uniform(.4, 1.6)
        a = (rnd.uniform(-.2, .2), y0, .26)
        b = (rnd.uniform(-.22, .22), y0 + rnd.choice([-1, 1]) * rnd.uniform(.3, .55), .26)
        layers.append(seg(f'Body arc {k + 1}', a, b, .3, HOT if k % 4 == 0 else (255, 120, 100, 255), born, 3, color_end=RED,
                          mirror=1 if k % 2 == 0 else -1, emissive=1.7))
    for k, born in enumerate((6, 27, 44)):
        x0 = rnd.uniform(-.6, .3)
        layers.append(seg(f'Foot arc {k + 1}', (x0, .04, .1), (x0 + rnd.uniform(.4, .7), rnd.uniform(.1, .3), -.05), .28, RED, born, 3,
                          color_end=DEEP, mirror=-1 if k % 2 else 1, emissive=1.6))
    # embers shoot up off his shoulders and back, slow sharply and hang above his head as they fade
    layers.append(pivot('Ember source', (0, .75, 0), [
        radial_sparks('Embers', 26, (255, 150, 110, 255), color_end=fade(DEEP, 0), life=(16, 20), interval=2, delay=2,
                      width=.08, length=(.18, .3), emissive=2.0) | spray([[-.35, .35], [1.1, 1.7], [-.1, .1]], radius=.45)]))
    return effect('Raikon_Storm_Mantle', 'Raikon Storm Mantle', 'status', 'lightning', P / 60, layers,
                  attach='caster_ground', peak=0, impact=0, light=(1, .22, .16), loop=True, delivery=SELF,
                  design='Hard red ribbons orbiting him at three heights inside a faint red mantle, short red arcs jumping between '
                         'points on his body at uneven times, embers rising off him and a few arcs at his feet.')
