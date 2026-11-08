"""Shizuka, Silent Moon: one silent violet cut. The rage art blooms a lattice of them on the foe, each turned its own
way, then two large crossed ones as the blade clicks home. Shizuka's delayed silent cut (`echo`) plays it small.
A hair-thin white line appears whole across the target with no wind-up, a slightly wider violet line under it and a
long, nearly straight thin arc; nothing happens for a beat; then a second cut opens across it at a shallow angle with
a small star, needles of light spray along it and slow lilac motes drift and hang. Quiet: no burst, no debris."""
from _rage import *

P = VIOLET
ECHO = 10   # the second cut opens a beat after the first


def recipe():
    arc = slash_arc('Thin arc', P['BODY'], radius=3.2, width=.2, sweep=(160, 200), life=14, delay=1, tilt=(0, 0, 0),
                    position=[0, 3.2, 0], texture='T_Trail02', emissive=2.0)
    return effect('Rage_Violet_Slash', 'Silent Violet Cut', 'slash', 'silence', .45, [
        slice_line('Silent line', P['CORE'], 3.8, width=.05, life=14, delay=0),
        slice_line('Violet line', P['BODY'], 4.2, width=.32, life=18, delay=1),
        *swing([arc], yaw=0),
        slice_line('Echo cut', P['HOT'], 3.0, width=.08, angle=-14, life=12, delay=ECHO),
        flash('Echo star', P['CORE'], 1.1, life=3, delay=ECHO, angle=-14),
        glow('Violet bloom', fade(P['BODY'], 160), 2.4, life=16, delay=1),
        radial_sparks('Needles', 10, P['CORE'], color_end=P['BODY'], distance=(.5, 1.3), life=(8, 14), width=.03, delay=ECHO) | spray([[-1.8, 1.8], [-.3, .3], [-.1, .1]], radius=.4),
        motes('Hush motes', 16, P['HOT'], color_end=fade(P['DEEP']), size=(.07, .13), life=(18, 24), distance=(.2, 1.0), delay=2, rise=.0002, radius=(0, 1.2)),
        sparkle('Glints', P['CORE'], .26, count=3, life=12, delay=ECHO, spread=1.4),
    ], peak=ECHO / 60, impact=.3, light=(.7, .5, 1), delivery=MELEE,
        screen=dict(shake=.1, hitstop=.02),
        design='A hair-thin white line appears whole across the target over a violet one and a long thin arc; a beat later a second cut opens across it with a small star, needles of light along it, and lilac motes drift and hang.')
