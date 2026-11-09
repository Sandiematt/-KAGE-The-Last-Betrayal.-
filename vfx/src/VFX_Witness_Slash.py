"""The Witness's own blade (Echo Combo, phases I and II): one clean blue cut. The game plays it on every cut of the
combo, turned to the cut. A wide blue crescent sweeps open through the target with a white-hot edge, a thin pale
echo of the same arc trails it a beat later (the echo the Witness is named for), echo cards burst off the arc and hang,
a short white line at the contact and blue motes settle. Clean and fast: no smoke, no glitch (that is phase III's)."""
from _witness import *

B = BLUE
ROLL, SWEEP, RADIUS, LEAN = 4, (96, 268), 1.5, -12


def recipe():
    arcs = [l for l in slash_set((fade(B['DEEP'], 180), B['BODY'], B['CORE']), ROLL, sweep=SWEEP, radius=RADIUS, lean=LEAN, delay=1, life=16)
            if l['name'] != 'Refraction arc']   # the game plays a baked sheet: no refraction
    for l in arcs:
        if l['name'] == 'Blade body': l['emissive'] = 2.3
        if l['name'] == 'Cel crescent': l['color'] = list(B['HOT']); l['color_end'] = list(B['BODY']); l['life'] = 10
    pos = arcs[0]['position']
    echo = slash_arc('Echo arc', fade(B['HOT'], 200), radius=RADIUS * 1.14, width=RADIUS * .08, sweep=(SWEEP[0] + 10, SWEEP[1] - 10), life=18, delay=5,
                     tilt=(LEAN, 0, ROLL), position=pos, texture='T_Trail02', emissive=1.9)
    return effect('Witness_Slash', 'Echo Cut', 'slash', 'void', .55, [
        glow('Blade glint', B['HOT'], .55, life=4, size_curve=[[0, 1], [100, .3]], position=[-1.0, .9, .5]),
        *swing(arcs + [echo], yaw=-30),
        flash('Contact flash', B['CORE'], 1.7, life=4, delay=3, angle=ROLL),
        slice_line('Contact line', B['CORE'], 2.6, width=.05, angle=ROLL - 8, life=10, delay=3),
        glow('Blue bloom', fade(B['BODY'], 150), 2.4, life=14, delay=2),
        cards('Echo cards', fade(B['HOT'], 230), 9, (20, 28), delay=3, spread=.3, size=(.16, .26)) |
        dict(travel=dict(end=[[-.4, 2.0], [-.6, 1.0], [-.2, .2]], easing='EaseOutQuartic'), spawn=dict(shape='Sphere', radius=[0, .3], rotate=False)),
        motes('Settling motes', 12, B['HOT'], color_end=fade(B['DEEP']), size=(.06, .12), life=(16, 22), distance=(.3, 1.2), delay=5, rise=-.0003),
        sparkle('Glints', B['CORE'], .28, count=3, life=12, delay=4, spread=1.1),
    ], peak=3 / 60, impact=.4, light=(.4, .45, 1), delivery=MELEE,
        screen=dict(shake=.2, hitstop=.04),
        design='A wide blue crescent sweeps through the target with a white-hot edge, a thin pale echo of the arc trails it a beat later, echo cards burst off and hang, blue motes settle.')
