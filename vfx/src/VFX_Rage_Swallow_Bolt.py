"""Tsubame, Thousand Swallows: one lightning strike straight through the foe. The rage art plays it once per strike,
turned along the line from where Kage stands through the foe, eight times from eight directions, then twice crossed
as the finisher's X.
A hair-thin white core line shoots across, a jagged cyan bolt of painted strands lies along it, struck again on a
different path three frames later (mirrored, never the same shape), short forks spit off it, sparks fly on through
the target, and a dim after-flicker strikes once more as it dies. Lightning: no travel, re-struck, an after-flicker."""
from _rage import *
from _raikon import jag, bolt

P = BOLT


def recipe():
    a, b = (-2.2, 0, 0), (2.2, 0, 0)
    main = bolt('Bolt', jag(a, b, 7, .3, 11), .55, P['CORE'], 1, 5, color_end=P['BODY'])
    restrike = bolt('Restrike', jag(a, b, 6, .38, 23), .5, P['HOT'], 4, 4, color_end=P['BODY'], mirror=-1)
    flicker = bolt('After flicker', jag((-1.6, 0, 0), (1.8, 0, 0), 5, .3, 37), .35, P['BODY'], 11, 3, color_end=P['DEEP'])
    forks = []
    for i, (p0, p1) in enumerate([((-.8, 0, 0), (-.25, .9, 0)), ((.6, 0, 0), (1.25, -.8, 0)), ((1.4, 0, 0), (2.0, .7, 0))]):
        forks += bolt(f'Fork {i + 1}', jag(p0, p1, 3, .16, 50 + i), .3, P['HOT'], 2 + i, 4, color_end=P['BODY'], taper=.6)
    return effect('Rage_Swallow_Bolt', 'Swallow Bolt', 'slash', 'lightning', .3, [
        slice_line('Core line', P['CORE'], 4.6, width=.07, life=9, delay=1),
        sprite('Streak glow', 'T_Glow01', fade(P['BODY'], 140), billboard='Billboard', scale_start=[4.4, .55, 1], life=8, delay=1, fade_in=0, fade_out=6, emissive=1.4),
        *main, *restrike, *forks, *flicker,
        flash('Contact flash', P['CORE'], 1.6, life=4, delay=1),
        radial_sparks('Spat sparks', 22, P['CORE'], color_end=P['BODY'], distance=(.6, 1.6), life=(6, 12), width=.05, delay=1) | spray([[-1.0, 2.6], [-.8, .8], [-.2, .2]], radius=1.0),
        sparkle('Glints', P['CORE'], .28, count=3, life=8, delay=2, spread=1.6),
    ], peak=1 / 60, impact=.35, light=(.5, .85, 1), delivery=MELEE,
        screen=dict(shake=.15, hitstop=.02),
        design='A white core line shoots straight through the target with a jagged cyan bolt along it, struck again on another path, forks spitting off and sparks flying on; a dim after-flicker as it dies.')
