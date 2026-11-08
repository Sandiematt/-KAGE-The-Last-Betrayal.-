"""A golden kunai striking (or a parried blow's spark): a short white contact, a gold ring, two speeds of sparks
thrown back along the line of the throw, and a few embers that rise and hang."""
from _takashi import *


def recipe():
    return effect('Takashi_Kunai_Impact', 'Golden Kunai Impact', 'hit', 'holy', .5, [
        flash('Contact flash', CORE, 1.1, life=4, delay=1),
        glow('Gold bloom', fade(GOLD, 150), 1.3, life=9, delay=1),
        shock_ring('Gold ring', GOLD, .7, life=11, delay=1, thickness=.22, alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.85, easing='EaseInCubic')),
        radial_sparks('Fast streaks', 8, CORE, color_end=GOLD, distance=(.9, 1.5), life=(6, 9), length=(.35, .6), delay=1) | spray([[-1.6, .2], [-.6, .8], [-.2, .2]], radius=.05),
        *spark_burst('Sparks', 10, HOT, AMBER, distance=(.5, 1.2), life=(12, 20), length=(.15, .3), delay=2, gravity=.0018),
        embers('Embers', 6, delay=4, life=(18, 26)),
    ], peak=1 / 60, impact=.25, light=(1, .8, .45), delivery=dict(kind='projectile', projectile='VFX_Takashi_Kunai'),
        screen=dict(shake=.1, hitstop=.02),
        design='A white contact that is gone in four frames, a gold ring, fast white streaks and drooping gold sparks thrown back along the throw, then a few embers that rise and hang.')
