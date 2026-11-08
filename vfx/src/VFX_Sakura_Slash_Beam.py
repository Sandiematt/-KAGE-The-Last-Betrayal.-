"""Phase 3: Phantom Dash / Thousand Cuts / Petal Cross. Three slash beams cross the target from different directions
three frames apart: each a long white-hot line in a deep-pink glow, with its own contact star, crescent blades flung
along the cut and petals sprayed after it. The director rotates each instance so rapid cuts never repeat a direction."""
from _sakura import *

CUTS = [(18, 1), (-38, 4), (74, 7)]    # (angle in degrees CCW from +X, delay in frames)


def cut(i, angle, delay):
    a = math.radians(angle); dx, dy = math.cos(a), math.sin(a)
    return [
        slice_line(f'Beam glow {i}', fade(DEEP, 210), 5.6, width=.34, angle=angle, life=13, delay=delay, emissive=1.6),
        slice_line(f'Beam core {i}', CORE, 6.2, width=.07, angle=angle, life=10, delay=delay),
        flash(f'Cut star {i}', CORE, 1.05, life=3, delay=delay, angle=angle),
        blade(f'Cut blades {i}', length=.75, width=.36, life=12, delay=delay + 1, count=3, angle=angle, emissive=2.4,
              spawn=dict(shape='Line', start=[-1.6 * dx, -1.6 * dy, 0], end=[1.6 * dx, 1.6 * dy, 0], division=3, order='Order', rotate=False),
              velocity=[.07 * dx, .07 * dy, 0], acceleration=[-.004 * dx, -.004 * dy, 0]),
        petals(f'Cut petals {i}', 8, delay=delay + 1, life=(22, 32), size=(.1, .16), gravity=.0009,
               **spray([sorted([.6 * dx, 2.0 * dx]), sorted([.6 * dy, 2.0 * dy]), [-.2, .2]], radius=.35)),
    ]


def recipe():
    return effect('Sakura_Slash_Beam', 'Sakura Slash Beams', 'slash', 'sakura', .8, [
        glow('Pink bloom', fade(DEEP, 160), 2.6, life=18, delay=1),
        *[layer for i, (angle, delay) in enumerate(CUTS, 1) for layer in cut(i, angle, delay)],
        matter('Cut residue', 8, delay=10, life=(28, 36), spawn=dict(shape='Sphere', radius=[.2, 1.3], rotate=False)),
    ], peak=.05, impact=.45, light=(1, .45, .75), delivery=MELEE, screen=dict(shake=.22, hitstop=.04),
        design='Three white-hot slash beams in deep-pink glow cross the target from three directions three frames apart, each flinging crescent blades and petals along its cut.')
