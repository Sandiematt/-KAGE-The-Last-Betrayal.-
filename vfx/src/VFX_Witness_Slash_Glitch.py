"""The Witness's blade broken (Echo Combo, phases III and IV): a violet cut that does not hold together. The crescent
sweeps through the target in violet with a cyan inner edge, then a second copy of it snaps into place a little to
the side two frames late and a third one further on (the cut stutters like a damaged frame), hard glitch pixels blink
on and off along it with no motion, and violet-grey residue lingers where it was. Differs from the clean Echo Cut in
shape (offset copies, torn arc), rhythm (stuttered re-strikes) and secondary (glitch pixels instead of cards)."""
from _witness import *

V = VIOLET
ROLL, SWEEP, RADIUS, LEAN = -6, (100, 264), 1.5, -12


def recipe():
    arcs = [l for l in slash_set((fade(V['DEEP'], 190), V['BODY'], V['CORE']), ROLL, sweep=SWEEP, radius=RADIUS, lean=LEAN, delay=1, life=14)
            if l['name'] not in ('Refraction arc', 'Cel crescent')]
    for l in arcs:
        if l['name'] == 'Blade body': l['emissive'] = 2.5
    pos = arcs[0]['position']
    # the stutter: copies of the body arc snapping in beside it, two and five frames late
    stut = [slash_arc(f'Stutter {i + 1}', c, radius=RADIUS * k, width=RADIUS * .42, sweep=SWEEP, life=10, delay=1 + d, tilt=(LEAN, 0, ROLL),
                      position=[pos[0] + dx, pos[1] + dy, pos[2]], texture='T_Trail01', emissive=2.3, cutoff=dict(start=.05, end=.8, easing='EaseInCubic'))
            for i, (c, k, d, dx, dy) in enumerate(((CYAN, 1.02, 2, .14, .05), (fade(V['HOT'], 220), .97, 5, -.18, -.08)))]
    return effect('Witness_Slash_Glitch', 'Broken Cut', 'slash', 'void', .7, [
        glow('Blade glint', V['HOT'], .55, life=4, size_curve=[[0, 1], [100, .3]], position=[-1.0, .9, .5]),
        *swing(arcs + stut, yaw=-30),
        flash('Contact flash', V['CORE'], 1.7, life=4, delay=3, angle=ROLL),
        glow('Violet bloom', fade(V['BODY'], 160), 2.4, life=14, delay=2),
        glitch('Glitch pixels', V['HOT'], 12, (6, 10), delay=3, spread=1.3, size=(.24, .46), position=[0, .9, 0]),
        glitch('Cyan pixels', CYAN, 8, (4, 8), delay=6, spread=1.4, size=(.2, .38), position=[.2, .8, 0]),
        glitch('White pixels', V['CORE'], 4, (2, 4), delay=4, spread=.9, size=(.14, .24), position=[0, 1.0, 0]),
        smoke('Void residue', (88, 70, 120, 160), count=3, size=(.6, .9), life=(24, 32), delay=6, rise=.0003, radius=(.2, 1.0), position=[0, .8, 0]),
    ], peak=3 / 60, impact=.45, light=(.6, .3, 1), delivery=MELEE,
        screen=dict(shake=.25, hitstop=.05),
        design='A violet crescent with a cyan edge cuts through and stutters: copies of it snap in beside it two and five frames late, hard glitch pixels blink along it and violet residue lingers.')
