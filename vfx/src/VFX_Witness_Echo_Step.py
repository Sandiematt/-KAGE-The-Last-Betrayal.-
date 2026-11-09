"""Phase I and II: Echo Step, the teleport. Played where the Witness vanishes and again where it appears behind Kage.
A thin vertical slit of white light opens the height of a man, the body's echo bursts sideways into blue echo cards
and shards that hang and turn, a blue ring snaps out across the line of the step and pale motes are drawn back into
the slit as it closes. No smoke: an echo is folded away, not burned."""
from _witness import *

B = BLUE
HIT = 2


def recipe():
    return effect('Witness_Echo_Step', 'Echo Step', 'boss', 'void', .75, [
        motes('Gather', 14, B['HOT'], color_end=B['CORE'], size=(.05, .1), life=(10, 12), distance=(-.9, -.6), radius=(.9, 1.1), position=[0, 1.0, 0]),
        sprite('Slit', 'T_Streak01', B['CORE'], life=14, delay=HIT, rotation=[0, 0, 90], position=[0, 1.0, 0],
               scale_start=[1.2, .6, 1], scale_end=[2.3, .08, 1], easing='EaseOutQuartic', fade_in=0, fade_out=8, emissive=2.6),
        flash('Fold star', B['CORE'], 1.3, life=4, delay=HIT, angle=90, position=[0, 1.0, 0]),
        glow('Blue bloom', fade(B['BODY'], 170), 2.4, life=14, delay=HIT, position=[0, 1.0, 0]),
        tilted_ring('Step ring', B['HOT'], 1.4, life=14, delay=HIT, tilt=(0, 70, 0), thickness=.16, position=[0, 1.0, 0]),
        pivot('Echo source', (0, 1.0, 0), [
            cards('Echo cards', fade(B['HOT'], 230), 8, (22, 30), delay=HIT, spread=.3, size=(.2, .3)) |
            dict(travel=dict(end=[[-1.3, 1.3], [-.6, .7], [-.2, .2]], easing='EaseOutQuartic'), spawn=dict(shape='Sphere', radius=[0, .3], rotate=False)),
            radial_sparks('Shards', 16, B['CORE'], color_end=fade(B['BODY'], 0), distance=(.6, 1.4), life=(12, 18), width=.05, delay=HIT) |
            spray([[-1.6, 1.6], [-.8, .9], [-.1, .1]], radius=.3),
        ]),
        sparkle('Glints', B['CORE'], .24, count=3, life=14, delay=HIT + 4, spread=.9, position=[0, 1.1, 0]),
        motes('Drift', 10, B['HOT'], color_end=fade(B['DEEP'], 0), size=(.05, .09), life=(26, 34), distance=(.2, .7), delay=HIT + 6,
              rise=.0006, radius=(.2, .9), position=[0, 1.0, 0]),
    ], attach='caster_ground', peak=HIT / 60, impact=.35, light=(.4, .45, 1), delivery=SELF,
        screen=dict(shake=.15),
        design='A thin vertical slit of white light opens the height of a man, blue echo cards and shards burst sideways and hang, a ring snaps across the line of the step and motes are drawn back as it closes.')
