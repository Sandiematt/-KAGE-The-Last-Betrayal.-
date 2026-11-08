"""Yamigama, Reaper's Requiem: an enormous scythe crescent carving down through the foe. The rage art plays two,
crossed, as the finisher, and a small one for each shadow clone's cut. (Its dark body is drawn by the game under the
additive sheet, since black adds nothing to the bake.)
Dark strands are drawn in to where the blade will pass, then a huge violet crescent sweeps open, wider than a
character is tall, with a white-violet edge and a thin pale outer edge holding a beat longer; violet sparks reap off
it, shadow smoke rolls out and slow motes rise. Dark: it draws inward first, then one release."""
from _rage import *

P = SCYTHE
ROLL, SWEEP, RADIUS, LEAN = -14, (70, 292), 2.3, -8


def recipe():
    arcs = [l for l in slash_set((fade(P['DEEP'], 190), P['BODY'], P['CORE']), ROLL, sweep=SWEEP, radius=RADIUS, lean=LEAN, delay=4, life=20)
            if l['name'] != 'Refraction arc']
    for l in arcs:
        if l['name'] == 'Blade body': l['emissive'] = 2.0
        # round 2: the painted crescent was white over the whole arc; it holds the violet body, the edge stays white
        if l['name'] == 'Cel crescent': l['color'] = list(P['BODY']); l['color_end'] = list(P['DEEP']); l['life'] = 14
    edge = slash_arc('Outer edge', fade(P['HOT'], 200), radius=RADIUS * 1.12, width=RADIUS * .06, sweep=(SWEEP[0] + 20, SWEEP[1] - 20), life=20, delay=6,
                     tilt=(LEAN, 0, ROLL), position=arcs[0]['position'], texture='T_Trail02', emissive=1.8)
    return effect('Rage_Shadow_Scythe', 'Reaper Crescent', 'slash', 'dark', .5, [
        smoke('Shadow smoke', (72, 44, 100, 200), count=8, size=(.7, 1.1), life=(18, 21), delay=8, rise=.0003, radius=(.4, 2.0)),
        wisps('Gathering strands', fade(P['BODY'], 200), 1.6, count=5, width=.22, life=(8, 12), delay=0),
        *swing(arcs + [edge], yaw=-26),
        flash('Contact flash', P['CORE'], 2.0, life=4, delay=6),
        glow('Violet bloom', fade(P['BODY'], 140), 3.0, life=16, delay=5),
        radial_sparks('Reap sparks', 16, P['HOT'], color_end=P['DEEP'], distance=(.8, 2.0), life=(10, 18), delay=6) | spray([[-1.6, 2.4], [-1.6, 1.2], [-.3, .3]], radius=1.0),
        motes('Soul motes', 16, P['HOT'], color_end=fade(P['DEEP']), size=(.08, .14), life=(16, 21), distance=(.3, 1.2), delay=8, rise=.0008, radius=(0, 1.6)),
    ], peak=6 / 60, impact=.5, light=(.6, .3, 1), delivery=MELEE,
        screen=dict(shake=.35, hitstop=.04),
        design='Dark strands drawn in, then a huge violet crescent sweeps open with a white-violet edge and a thin pale outer edge; violet sparks reap off it, shadow smoke rolls out and motes rise.')
