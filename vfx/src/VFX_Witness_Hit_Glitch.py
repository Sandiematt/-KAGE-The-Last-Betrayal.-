"""A blow landing on the Witness (phases III and IV): the body glitches instead of cracking. A violet contact, the
figure's outline torn into hard horizontal pixel bars that blink in and out where it was struck (no motion: a broken
signal), a cyan scan line across the hit, and a few violet shards. Differs from the Echo Crack in shape (bars, a scan
line), motion (none: it blinks) and secondary (pixels instead of cards)."""
from _witness import *

V = VIOLET
HIT = 1


def recipe():
    return effect('Witness_Hit_Glitch', 'Glitch Hit', 'hit', 'void', .45, [
        flash('Contact star', V['CORE'], 1.0, life=3, delay=HIT),
        glow('Violet bloom', fade(V['BODY'], 160), 1.3, life=9, delay=HIT),
        slice_line('Scan line', CYAN, 1.8, width=.04, life=6, delay=HIT + 1, alpha_texture='T_NoiseStreak01', cutoff=dict(start=0, end=.8, easing='EaseInQuadratic')),
        slice_line('Scan line 2', fade(V['HOT'], 220), 1.4, width=.03, life=5, delay=HIT + 4, position=[0, .12, 0]),
        glitch('Torn bars', V['HOT'], 10, (3, 6), delay=HIT, spread=.7, size=(.22, .4)),
        glitch('Late bars', CYAN, 6, (3, 5), delay=HIT + 4, spread=.8, size=(.18, .32)),
        glitch('White bars', V['CORE'], 3, (2, 3), delay=HIT + 2, spread=.5, size=(.12, .22)),
        radial_sparks('Shards', 8, V['HOT'], color_end=fade(V['DEEP'], 0), distance=(.4, 1.0), life=(8, 12), width=.05, delay=HIT) |
        spray([[.3, 1.3], [-.4, .6], [-.1, .1]], radius=.15),
    ], peak=HIT / 60, impact=.25, light=(.6, .3, 1), delivery=MELEE,
        design='A violet contact, the struck spot torn into hard pixel bars that blink in and out with no motion, a cyan scan line across the hit and a few violet shards.')
