"""Phase 3: high-density sakura burst AoE. Thousand Petal Requiem's final detonation, Thousand Cuts' heavy last cut,
a Mirror of Petals clone breaking (at small scale), and every phase change. A short inward draw, a big white contact,
two pink shock rings, twenty-four crescent blades flung outward and ninety petals that burst, hang and drift down."""
from _sakura import *

HIT = 6


def recipe():
    radial = lambda d0, d1, ease='EaseOutQuartic': dict(spawn=screen_circle((0, .5)), travel=dict(end=[[d0, d1], 0, 0], easing=ease))
    return effect('Sakura_Burst', 'Sakura Burst', 'boss', 'sakura', 1.6, [
        motes('Draw in', 16, HOT, color_end=PINK, size=(.07, .12), life=(6, 7), distance=(-1.6, -1.1), radius=(1.6, 2.0),
              fade_in=0, fade_out=3),
        glow('Charge', fade(HOT, 220), 1.4, life=HIT, size_curve=[[0, 1.2], [100, .35]], fade_in=0, fade_out=1),
        flash('Detonation flash', CORE, 2.0, life=4, delay=HIT),
        glow('Pink bloom', fade(DEEP, 140), 3.6, life=22, delay=HIT),
        shock_ring('Hot ring', CORE, 3.4, life=12, delay=HIT, thickness=.22, color_end=list(PINK)),
        shock_ring('Pink ring', fade(DEEP, 220), 5.2, life=20, delay=HIT + 2, thickness=.38),
        blade('Flung blades', length=1.25, width=.36, life=(18, 26), count=24, delay=HIT, vertical=True, billboard='DirectionalBillboard',
              **radial(2.6, 4.6)),
        petals('Petal burst', 90, delay=HIT, life=(42, 62), size=(.15, .25), gravity=.0005, turbulence=.004, **radial(1.4, 4.4)),
        blossom('Blossoms', .55, life=26, count=10, delay=HIT + 1, **radial(.6, 2.6, 'EaseOutCubic')),
        sparkle('Glints', CORE, .45, count=10, life=16, delay=HIT + 3, spread=3.0),
        matter('Settling petals', 24, delay=HIT + 16, life=(50, 70), gravity=.0006,
               spawn=dict(shape='Sphere', radius=[.6, 3.6], rotate=False)),
    ], attach='body', peak=HIT / 60, impact=1, light=(1, .45, .75), delivery=dict(kind='area'),
        screen=dict(shake=.7, flash_frames=2, flash='white', hitstop=.08),
        design='Petals rush in, then a big white detonation, two pink shock rings, twenty-four crescent blades flung outward and ninety petals that burst, hang and drift down in a slow pink snow.')
