"""Phase II: Orb Pulse striking. The orb bursts into a ring that snaps open in its own tilted plane and a second ring
across it, a white contact, blue threads whipping out from the point and curling, and motes drawn back into the point
as it closes: control, not fire. Paired with VFX_Witness_Orb_Shot."""
from _witness import *

B = BLUE
HIT = 1


def recipe():
    return effect('Witness_Orb_Impact', 'Orb Burst', 'hit', 'void', .6, [
        flash('Contact star', B['CORE'], 1.4, life=4, delay=HIT),
        glow('Blue bloom', fade(B['BODY'], 170), 1.7, life=12, delay=HIT),
        tilted_ring('Burst ring', B['HOT'], 1.1, life=12, delay=HIT, tilt=(-70, 0, 22), thickness=.16),
        tilted_ring('Cross ring', fade(B['HOT'], 200), .9, life=12, delay=HIT + 2, tilt=(20, 60, 0), thickness=.12),
        wisps('Whip threads', fade(B['HOT'], 220), .8, count=5, width=.12, sweep=(0, 160), life=(12, 16), delay=HIT, tilt=((-60, 60), (0, 360), (0, 360))),
        radial_sparks('Sparks', 10, B['CORE'], color_end=fade(B['BODY'], 0), distance=(.5, 1.2), life=(8, 14), width=.05, delay=HIT),
        motes('Drawn motes', 10, B['HOT'], color_end=B['CORE'], size=(.04, .08), life=(10, 14), distance=(-.8, -.5), radius=(.8, 1.0), delay=HIT + 6),
    ], peak=HIT / 60, impact=.35, light=(.4, .45, 1), delivery=dict(kind='projectile', projectile='VFX_Witness_Orb_Shot'),
        design='The orb bursts into a ring snapping open in its tilted plane and a second ring across it, blue threads whip out and curl, and motes are drawn back into the point.')
