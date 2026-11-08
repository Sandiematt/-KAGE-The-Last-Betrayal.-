"""Phase 1+: Smoke Step / Blink / Shadow Flip's vanish (and the arrival at the far end). Her old smoke puff becomes a
burst of petals: a quick inward draw, a white pop, a blossom, swirling torn strands and a puff of petals that drifts."""
from _sakura import *


def recipe():
    return effect('Sakura_Veil', 'Petal Veil', 'element', 'sakura', .9, [
        motes('Draw in', 10, HOT, color_end=PINK, size=(.06, .1), life=(6, 8), distance=(-.9, -.6), radius=(.9, 1.2), fade_in=0, fade_out=3),
        flash('Vanish pop', CORE, 1.3, life=4, delay=4),
        blossom('Blossom', 1.15, life=15, delay=4),
        wisps('Swirl', PINK, 1.0, count=3, width=.28, life=(14, 20), delay=4, tilt=((-25, 25), (-25, 25), (0, 360))),
        petals('Petal puff', 26, delay=4, life=(28, 44), size=(.12, .2), gravity=.0007,
               spawn=screen_circle((0, .4)), travel=dict(end=[[.6, 1.5], 0, 0], easing='EaseOutQuartic')),
        matter('Pale puff', 8, delay=6, life=(36, 46), spawn=screen_circle((.2, .6)),
               travel=dict(end=[[.5, 1.1], 0, 0], easing='EaseOutCubic')),
    ], attach='body', peak=.07, delivery=SELF,
        design='Petals rush in, a white pop and a blossom mark where she was, torn pink strands swirl once and a puff of petals drifts down.')
