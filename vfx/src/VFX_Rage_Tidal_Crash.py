"""Mizuchi, Rising Water Dragon: the dragon crashes down on the foe in a tidal splash. The rage art plays it where the
dragon hits the floor (the dragon itself is drawn by the game).
A white-blue contact, a column of water shooting up and falling, a crown of long water streaks thrown up and arcing
over under gravity, a wider spray of droplets, two wave rings racing out along the floor one after the other, mist
rolling low and glints of light in the falling water. Water: it rises and falls back; nothing burns or hangs."""
from _rage import *

P = TIDE
HIT = 2


def recipe():
    return effect('Rage_Tidal_Crash', 'Tidal Crash', 'boss', 'water', .85, [
        # round 3: the painted puffs read as grey curls; the mist is a soft blue haze rolling low
        smoke('Mist', (150, 206, 245, 120), count=10, size=(.8, 1.2), life=(24, 34), delay=HIT + 4, rise=.0002, radius=(.2, 2.4), position=[0, .3, 0], texture='T_SoftCircle') | dict(blend='Add', emissive=1.0),
        flash('Contact flash', P['CORE'], 2.4, life=4, delay=HIT, position=[0, .5, 0]),
        glow('Water bloom', fade(P['BODY'], 150), 3.0, life=14, delay=HIT, position=[0, .6, 0]),
        floor_ring('Wave ring', P['HOT'], 5.4, 28, delay=HIT, thickness=.26, alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.85, easing='EaseInCubic')),
        floor_ring('Second wave', P['BODY'], 3.8, 30, delay=HIT + 6, thickness=.18),
        column('Water column', fade(P['BODY'], 210), .55, 3.4, 26, delay=HIT, radius2=.95),
        radial_sparks('Crown', 52, P['CORE'], color_end=P['BODY'], distance=(1.8, 3.8), life=(22, 32), width=.17, length=(.6, 1.3), delay=HIT, gravity=.0022) | spray([[-2.0, 2.0], [1.8, 3.8], [-.3, .3]], radius=.6),
        radial_sparks('Spray', 40, P['HOT'], color_end=P['DEEP'], distance=(.8, 2.4), life=(16, 26), width=.11, delay=HIT + 2, gravity=.003) | spray([[-2.8, 2.8], [.4, 1.6], [-.4, .4]], radius=.8),
        sparkle('Glints', P['CORE'], .3, count=5, life=12, delay=HIT + 3, spread=2.0, position=[0, 1.4, 0]),
    ], attach='ground', peak=HIT / 60, impact=.85, light=(.4, .75, 1), delivery=dict(kind='area'),
        screen=dict(shake=.8, flash_frames=1, flash='white', hitstop=.06),
        design='A white-blue contact, a column of water shooting up, a crown of long water streaks arcing over and falling, spray, two wave rings racing out along the floor and low mist.')
