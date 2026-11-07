# Raikon's red lightning called down from the sky onto one spot (Storm Break's slam point, Thunder Swing's wave
# source, his phase changes). Lightning does not travel: a dim stepped leader feels its way down, then the whole
# channel is struck at once, goes dark, is struck again on a different path, and flickers a third time.
from vfxkit.primitives import *
from _raikon import *

TOP = (-0.9, 7.9, 0.0)
GROUND = (0.0, 0.03, 0.0)


def recipe():
    main = jag(TOP, GROUND, 6, 0.6, seed=11, taper=0.55)
    ret = jag((-0.55, 7.9, 0.0), GROUND, 6, 0.62, seed=23, taper=0.55)
    after = jag((-1.2, 7.9, 0.0), GROUND, 5, 0.5, seed=37, taper=0.5)
    forks = [
        jag(main[1], (main[1][0] + 1.5, main[1][1] - 1.5, 0), 3, 0.28, seed=41),
        jag(main[2], (main[2][0] - 1.3, main[2][1] - 1.8, 0), 3, 0.3, seed=43),
        jag(main[4], (main[4][0] + 0.9, main[4][1] - 0.8, 0), 2, 0.18, seed=47),
    ]

    layers = []
    # ground footprint, drawn first so everything stands on it
    layers.append(decal('Scorch', 'T_SoftCircle', fade(INK, 210), 2.7, 62, delay=11, blend='Blend', fade_in=2, fade_out=26))
    layers.append(decal('Cracks', 'T_Crack01', HOT, 3.3, 62, delay=10, fade_in=0, fade_out=6, emissive=2.6,
                        alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.95, easing='EaseInQuintic'),
                        color_curve=ramp((0, HOT), (10, RED), (70, (220, 24, 18, 255)), (100, DEEP))['color_curve']))
    # anticipation: a red mark tightening on the ground while the leader steps down
    layers.append(shock_ring('Ground mark', (255, 60, 44, 150), 1.7, life=10, delay=0, thickness=.18, ground=True,
                             position=[0, .05, 0], size_curve=[[0, 1], [100, .3]], fade_in=3, fade_out=2))
    for i in range(5):
        born = 1 + 2 * i
        layers.append(seg(f'Leader {i + 1}', main[i], main[i + 1], .32, (255, 72, 56, 130), born, 10 - born,
                          mirror=1 if i % 2 == 0 else -1, emissive=1.2))
    # contact f10: the main strike
    layers.append(glow('Sky lit', (255, 40, 28, 120), 2.6, life=8, delay=10, position=[TOP[0], TOP[1] - .4, 0]))
    layers += bolt('Main backing', main, 1.0, fade(INK, 170), 10, 4, blend='Blend', emissive=1.0)
    layers += bolt('Main body', main, 1.2, RED, 10, 4, color_end=fade(DEEP, 200), emissive=1.5)
    for k, fork in enumerate(forks):
        layers += bolt(f'Fork {k + 1}', fork, .55, HOT, 10, 3, color_end=RED, taper=.5, mirror=-1 if k % 2 else 1)
    layers += bolt('Main core', main, .38, HOT, 10, 4, color_end=(255, 150, 130, 255), emissive=2.1)
    # dark frames f14-15, then the return stroke on another path
    layers += bolt('Return body', ret, .9, RED, 16, 3, color_end=fade(DEEP, 180), mirror=-1, emissive=1.5)
    layers += bolt('Return core', ret, .32, HOT, 16, 3, color_end=RED, mirror=-1, emissive=2.1)
    # dark f19-20, then a thinner after-flicker
    layers += bolt('After flicker', after, .34, (255, 205, 195, 200), 21, 2, color_end=fade(RED, 150))
    # the channel the strikes burned, cooling deep red and eroding away
    layers += bolt('Burnt channel', main, 1.0, fade(RED, 150), 23, 16, color_end=fade(DEEP, 0), emissive=1.4,
                   alpha_texture='T_NoiseStreak01', cutoff=dict(start=.05, end=.9, easing='EaseInQuadratic'), fade_out=6)
    # ground contact
    layers.append(glow('Ground bloom', fade(RED, 170), 2.0, life=18, delay=10, position=[0, .3, 0]))
    layers.append(shock_ring('Ground shock', (255, 90, 66, 230), 2.8, life=16, delay=10, thickness=.22, ground=True, position=[0, .05, 0]))
    layers.append(distortion_ring('Shock haze', 2.2, life=14, delay=10, ground=True, position=[0, .05, 0]))
    # arcs crawling along the floor between the cracks, re-struck, cooling as they go
    rnd = __import__('random').Random(5)
    births = [14, 17, 20, 23, 26, 29, 33, 37, 41, 46, 51, 56, 61, 66]
    for k, born in enumerate(births):
        x0 = rnd.uniform(-1.3, 1.3) * (1 - .3 * k / len(births))
        a = (x0, rnd.uniform(.04, .12), rnd.uniform(-.25, .35))
        b = (x0 + rnd.choice([-1, 1]) * rnd.uniform(.5, .95), rnd.uniform(.08, .32), rnd.uniform(-.25, .35))
        hot = HOT if k < 4 else (255, 120, 100, 255)
        layers.append(seg(f'Crawl {k + 1}', a, b, .34 - .014 * k, hot, born, 3, color_end=RED if k < 6 else DEEP,
                          mirror=1 if k % 2 == 0 else -1, emissive=2.2 - .07 * k))
    layers.append(flash('Contact star', WHITE, 3.0, life=4, delay=10, position=[0, .35, 0]))
    # secondary: sparks thrown up and falling, debris that lands, embers and ash rising off the scorch
    layers += spark_burst('Sparks', 12, (255, 196, 180, 255), RED, distance=(.9, 2.3), life=(12, 20), delay=10,
                          gravity=.0018, floor=.02, hemisphere=True)
    layers.append(debris('Debris', 8, [[-1.9, 1.9], [.4, 1.5], [-.5, .5]], color=STONE, floor=.02, delay=10, life=(30, 44)))
    layers.append(motes('Embers', 12, (255, 120, 84, 255), color_end=fade(DEEP, 0), size=(.08, .14), life=(12, 16),
                        distance=(.3, 1.0), delay=14, interval=4, rise=.0008, hemisphere=True))
    layers.append(smoke('Ash', (150, 128, 126, 190), count=4, size=(.6, 1.0), life=(40, 50), delay=18, rise=.0006, radius=(0, .4),
                        position=[0, .3, 0]))
    layers.append(smoke('Ash trickle', (150, 128, 126, 170), count=3, size=(.35, .55), life=(22, 24), delay=34, interval=8,
                        rise=.0007, radius=(0, .3), position=[0, .15, 0]))

    return effect('Raikon_Sky_Strike', 'Raikon Sky Strike', 'boss', 'lightning', 1.25, layers,
                  attach='ground', peak=10 / 60, impact=1.0, light=(1, .22, .16), delivery=TARGETED,
                  screen=dict(shake=.6, flash_frames=1, flash='white', hitstop=0),
                  design='A dim red leader steps down over a tightening ground mark, then a red bolt with a white core '
                         'strikes from the sky with forks, goes dark, re-strikes on another path and flickers once; the '
                         'burnt channel cools and erodes while red cracks cool, arcs crawl between them, sparks fall, '
                         'debris lands and ash rises off the scorch.')
