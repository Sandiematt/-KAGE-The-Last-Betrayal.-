"""The anime dust kick: a foot drives off or digs into the floor (dash, step-in, landing skid, sharp turn) and
throws a short spurt of cel-shaded dust back along the floor (+X; the game mirrors it). Three or four toon puffs
burst out low and hang, a white streak skims the floor, a few pebbles skip. Small and quick: it marks the footwork,
it never hides the feet."""
from _anime import *


def recipe():
    return effect('Anime_Dust_Kick', 'Anime Dust Kick', 'hit', 'physical', .6, [
        toon_puffs('Kick puffs', 4, [[.35, 1.25], [.12, .42], [-.15, .2]], (.36, .58), (26, 32), delay=0),
        toon_puffs('Heel puffs', 2, [[-.1, .3], [.1, .22], [0, .2]], (.24, .34), (20, 24), delay=1, radius=.05),
        sprite('Floor streak', 'T_Streak01', PUFF, life=9, delay=0, blend='Blend', position=[.5, .05, .1],
               scale_start=[.8, .9, 1], scale_end=[2.0, .2, 1], easing='EaseOutQuartic', fade_in=0, fade_out=5),
        debris('Pebbles', 5, [[.4, 1.4], [.25, .7], [-.1, .2]], color=STONE, size=(.04, .08), floor=.02, delay=0, life=(20, 28)),
    ], attach='ground', peak=0, impact=.1, light=(1, 1, 1), delivery=SELF,
        design='A short spurt of cel-shaded dust bursts back along the floor from the foot and hangs, a white streak skims the floor and a few pebbles skip.')
