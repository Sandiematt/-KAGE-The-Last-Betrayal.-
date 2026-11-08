"""Phase 1+: the petals that always drift round Akari. Looping status aura; the director stacks more instances per phase
(phase 1 one, phase 2 two, phase 3 three and larger), and in phase 3 only the real Akari wears it (mirror clones do not)."""
from _sakura import *


def recipe():
    around = dict(spawn=dict(shape='Sphere', radius=[.5, 1.4], rotate=False))
    return effect('Sakura_Ambient', 'Sakura Drift', 'status', 'sakura', 2.0, [
        sprite('Rim aura', 'T_Glow01', fade(DEEP, 55), life=120, size=2.8, billboard='Billboard', fade_in=30, fade_out=40,
               size_curve=[[0, .92], [50, 1.04], [100, .95]]),
        petals('Drift petals', 16, interval=7, life=(70, 90), size=(.12, .2), gravity=.00025, turbulence=.005, curve=SOFT,
               velocity=[[-.012, -.004], [-.002, .003], 0], **around),
        motes('Glow motes', 10, fade(HOT, 210), color_end=fade(DEEP, 0), size=(.05, .09), life=(50, 70), interval=12,
              distance=(.1, .4), radius=(.4, 1.2), rise=.0003, turbulence=.004),
        matter('Pale petals', 6, interval=20, life=(80, 100), gravity=.0002, velocity=[[-.008, -.002], 0, 0], **around),
        blossom('Drifting blossom', .32, life=60, count=3, delay=10, interval=40, spin=[0, 0, [-1.5, 1.5]],
                velocity=[[-.006, -.002], [-.004, -.001], 0], cutoff=dict(start=0, end=.9, easing='EaseInQuartic'),
                **around),
    ], attach='body', loop=True, delivery=SELF,
        design='Pink petals drift and tumble round Akari on a slow wind with a faint deep-pink rim light; now and then one whole blossom drifts past and falls apart.')
