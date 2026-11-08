"""Kagetsu, Crimson Moon: one crimson crescent cut through the foe. The rage art plays it once per cut, turned to the
cut's angle, and the finisher plays it 2.4x as the giant crescent that falls through the foe.
A wide crimson crescent sweeps open with a white-hot edge, a thin pale rim outside it like a moon's halo holds a beat
longer, crimson shards spray along the cut and small red motes hang in the air and fade."""
from _rage import *

P = CRIMSON
ROLL, SWEEP, RADIUS, LEAN = 8, (92, 272), 1.6, -10


def recipe():
    arcs = [l for l in slash_set((fade(P['DEEP'], 170), P['BODY'], P['CORE']), ROLL, sweep=SWEEP, radius=RADIUS, lean=LEAN, delay=1, life=20)
            if l['name'] != 'Refraction arc']   # no refraction: the game plays a baked sheet
    for l in arcs:
        if l['name'] == 'Blade body': l['emissive'] = 2.3
        # round 2: the painted crescent was white over the whole arc; it holds the crimson body instead, the edge stays white
        if l['name'] == 'Cel crescent': l['color'] = list(P['BODY']); l['color_end'] = list(P['DEEP']); l['life'] = 12
    pos = arcs[0]['position']
    rim = slash_arc('Moon rim', fade(P['HOT'], 210), radius=RADIUS * 1.17, width=RADIUS * .07, sweep=(SWEEP[0] + 16, SWEEP[1] - 16), life=30, delay=3,
                    tilt=(LEAN, 0, ROLL), position=pos, texture='T_Trail02', emissive=1.9)
    return effect('Rage_Crimson_Crescent', 'Crimson Moon Cut', 'slash', 'moon', .58, [
        glow('Blade glint', P['HOT'], .6, life=4, size_curve=[[0, 1], [100, .3]], position=[-1.1, .9, .5]),
        *swing(arcs + [rim], yaw=-32),
        flash('Contact flash', P['CORE'], 1.9, life=4, delay=3, angle=ROLL),
        glow('Crimson bloom', fade(P['BODY'], 150), 2.6, life=14, delay=2),
        *spark_burst('Shards', 16, P['HOT'], P['DEEP'], distance=(.8, 2.0), life=(12, 20), delay=3, gravity=.0008),
        motes('Moon motes', 16, P['HOT'], color_end=fade(P['DEEP']), size=(.08, .15), life=(16, 22), distance=(.3, 1.4), delay=5, rise=.0004),
        sparkle('Glints', P['CORE'], .3, count=4, life=12, delay=4, spread=1.2),
    ], peak=3 / 60, impact=.4, light=(1, .3, .35), delivery=MELEE,
        screen=dict(shake=.2, hitstop=.04),
        design='A wide crimson crescent sweeps through the target with a white-hot edge and a pale outer rim like a moon halo; crimson shards spray along the cut and red motes hang and fade.')
