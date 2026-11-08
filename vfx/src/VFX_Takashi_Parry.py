"""The Iron Guard turning a blow aside (phases 1 and 3), and the pin of Kunai Execution. A gold crescent of the
blade's edge flashes across the point of contact, a white star, a fan of hard gold sparks thrown back at the
attacker, an enso ring that opens, and a few embers."""
from _takashi import *

ROLL, SWEEP, RADIUS, LEAN = -20, (130, 250), 1.0, -12


def recipe():
    arcs = [l for l in slash_set((fade(AMBER, 160), GOLD, CORE), ROLL, sweep=SWEEP, radius=RADIUS, lean=LEAN, delay=0, life=11)
            if l['name'] not in ('Refraction arc', 'Cel crescent')]
    return effect('Takashi_Parry', 'Iron Guard Parry', 'hit', 'holy', .45, [
        *swing(arcs, yaw=-20),
        flash('Contact star', CORE, .9, life=3, delay=1, angle=45),
        glow('Gold bloom', fade(GOLD, 140), 1.4, life=8, delay=1),
        tilted_ring('Enso', HOT, .8, life=14, delay=2, tilt=(0, 0, 0), thickness=.12, size_curve=[[0, .5], [100, 1.1]]),
        radial_sparks('Deflect streaks', 10, CORE, color_end=GOLD, distance=(1.0, 1.8), life=(5, 8), length=(.35, .6), delay=1) | spray([[-1.8, -.3], [-.4, .9], [-.2, .2]], radius=.05),
        *spark_burst('Sparks', 12, HOT, AMBER, distance=(.6, 1.4), life=(10, 18), length=(.14, .28), delay=1, gravity=.0018),
        embers('Embers', 5, delay=5, life=(16, 22)),
    ], peak=1 / 60, impact=.3, light=(1, .8, .45), delivery=MELEE, screen=dict(shake=.2, hitstop=.08),
        design='A gold crescent of the edge flashes across the contact with a white star, hard gold sparks fan back at the attacker, a thin enso ring opens and a few embers rise.')
