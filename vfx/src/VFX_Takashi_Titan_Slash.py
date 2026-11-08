"""Phase 2: Titan Slash. The Yashiro Titan's blade sweeps low across the floor, almost the whole arena wide: a long,
flat gold arc in a steeply leaned plane, white only on its leading edge, a long slice line along the floor at
release, dust and stone thrown up along the cut, sparks dragged behind the blade, and embers rising off the scar."""
from _takashi import *

ROLL, SWEEP, RADIUS, LEAN = 0, (80, 280), 3.2, -74


def recipe():
    arcs = [l for l in slash_set((fade(AMBER, 170), GOLD, CORE), ROLL, sweep=SWEEP, radius=RADIUS, offset=(0, .45, 0), lean=LEAN, delay=1, life=18)
            if l['name'] not in ('Refraction arc', 'Cel crescent')]
    for l in arcs:
        if l['name'] == 'Blade body': l['emissive'] = 2.2
    return effect('Takashi_Titan_Slash', 'Titan Slash', 'slash', 'holy', 1.2, [
        glow('Blade glint', HOT, .9, life=5, size_curve=[[0, 1], [100, .3]], position=[-3.0, .5, 0]),
        *swing(arcs, yaw=0),
        slice_line('Floor slice', CORE, 7.0, width=.08, life=12, delay=6, position=[0, .35, 0]),
        flash('Contact flash', CORE, 2.2, life=4, delay=7, position=[1.0, .5, 0]),
        glow('Gold bloom', fade(GOLD, 140), 3.2, life=14, delay=5, position=[0, .5, 0]),
        radial_sparks('Drag sparks', 22, HOT, color_end=AMBER, distance=(.6, 1.6), life=(10, 18), length=(.25, .5), delay=4,
                      gravity=.0015) | spray([[-1.5, 1.5], [.2, 1.2], [-.3, .3]], radius=2.6),
        debris('Stone', 12, [[-2.8, 2.8], [.6, 1.8], [-.4, .4]], color=DUST, floor=.02, delay=6, life=(30, 46)),
        smoke('Dust wall', fade(DUST, 180), count=8, size=(.7, 1.1), life=(34, 50), delay=6, rise=.0005, radius=(0, 2.6), position=[0, .2, 0]),
        embers('Scar embers', 12, delay=10, life=(26, 38), interval=2, radius=(0, 2.6)),
    ], attach='ground', peak=7 / 60, impact=.75, light=(1, .78, .4), delivery=MELEE,
        screen=dict(shake=.55, flash_frames=1, flash='white', hitstop=.06),
        design='A long, flat gold arc sweeps low across the floor with a white leading edge and a long slice line along the ground; dust and stone are thrown up along the cut, sparks drag behind it and embers rise off the scar.')
