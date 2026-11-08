"""Phase 3: Tenrai, the judgment. Divine thunder falls on Kage: the sky opens in gold over him, a dim leader feels its
way down, then a massive gold bolt with a white core strikes inside a pillar of gold light, goes dark, strikes again
on another path, and the pillar holds a moment and thins while gold cracks cool on the floor and embers rise.
Holy, not Raikon's storm: the light is a vertical pillar that eases out, with one jagged bolt inside it."""
from _takashi import *

TOP = (-.6, 9.5, 0.0)
GROUND = (0.0, 0.03, 0.0)
HIT = 12


def recipe():
    main = jag(TOP, GROUND, 7, .7, seed=71, taper=.5)
    ret = jag((-.2, 9.5, 0.0), GROUND, 7, .65, seed=83, taper=.5)
    forks = [jag(main[2], (main[2][0] + 1.6, main[2][1] - 2.0, 0), 3, .3, seed=91),
             jag(main[4], (main[4][0] - 1.3, main[4][1] - 1.5, 0), 3, .3, seed=97)]
    layers = [
        decal('Scorch', 'T_SoftCircle', fade(INK, 200), 3.0, 70, delay=HIT, blend='Blend', fade_in=2, fade_out=30),
        glow('Sky opens', fade(GOLD, 110), 4.0, life=HIT + 20, position=[TOP[0], TOP[1] - .5, 0], fade_in=8, fade_out=14),
        floor_band('Mark', fade(GOLD, 220), 1.0, .3, HIT + 2, fade_in=2, fade_out=2, size_curve=[[0, 1.6], [100, .6]]),
    ]
    for i in range(6):
        born = 1 + 2 * i
        layers.append(seg(f'Leader {i + 1}', main[i], main[i + 1], .36, fade(HOT, 130), born, HIT - born,
                          mirror=1 if i % 2 == 0 else -1, emissive=1.2))
    layers += [
        column('Pillar', fade(GOLD, 140), 1.1, 10.0, 46, delay=HIT, scroll=(.01, -.08), fade_in=0, fade_out=30,
               scale_start=[.4, 1, .4], scale_end=[1, 1, 1], easing='EaseOutQuartic', emissive=1.5),
        column('Pillar core', fade(HOT, 110), .3, 10.0, 14, delay=HIT + 2, scroll=(.01, -.12), fade_in=2, fade_out=10, emissive=1.5),
    ]
    layers += bolt('Bolt body', main, 1.5, GOLD, HIT, 5, color_end=fade(AMBER, 200), emissive=1.6)
    for k, fork in enumerate(forks):
        layers += bolt(f'Fork {k + 1}', fork, .6, HOT, HIT, 4, color_end=GOLD, taper=.5, mirror=-1 if k % 2 else 1)
    layers += bolt('Bolt core', main, .5, CORE, HIT, 5, color_end=HOT, emissive=2.3)
    layers += bolt('Return body', ret, 1.2, GOLD, HIT + 7, 4, color_end=fade(AMBER, 180), mirror=-1, emissive=1.6)
    layers += bolt('Return core', ret, .42, CORE, HIT + 7, 4, color_end=HOT, mirror=-1, emissive=2.2)
    layers += [
        flash('Contact star', CORE, 2.2, life=4, delay=HIT, position=[0, .4, 0]),
        tilted_ring('Ground shock', GOLD, 3.6, life=20, delay=HIT, tilt=(-80, 0, 0), thickness=.26),
        decal('Cracks', 'T_Crack01', HOT, 3.6, 60, delay=HIT, fade_in=0, fade_out=8, emissive=2.4,
              alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.95, easing='EaseInQuintic'), color_curve=COOL),
        *spark_burst('Sparks', 16, CORE, AMBER, distance=(1.0, 2.6), life=(12, 22), length=(.3, .6), delay=HIT, gravity=.0018, floor=.02, hemisphere=True),
        tilted_ring('Halo', HOT, 1.4, life=34, delay=HIT + 6, tilt=(-80, 0, 0), thickness=.12,
                    travel=dict(start=[0, .5, 0], end=[0, 5.0, 0], easing='EaseOutCubic'), fade_out=16),
        embers('Embers', 14, delay=HIT + 8, life=(30, 40), interval=2, rise=.0016, radius=(.2, 1.2), position=[0, .6, 0]),
        smoke('Ash', fade(DUST, 160), count=4, size=(.7, 1.0), life=(36, 46), delay=HIT + 6, rise=.0006, radius=(0, .5), position=[0, .3, 0]),
    ]
    return effect('Takashi_Thunder', 'Tenrai Divine Thunder', 'boss', 'holy', 1.45, layers,
                  attach='ground', peak=HIT / 60, impact=1.0, light=(1, .78, .4), delivery=TARGETED,
                  screen=dict(shake=1.0, flash_frames=2, flash='white', hitstop=0),
                  design='The sky opens gold over him and a dim leader feels its way down; a massive gold bolt with a white core strikes inside a pillar of gold light, goes dark, strikes again on another path, and the pillar thins while gold cracks cool and embers rise.')
