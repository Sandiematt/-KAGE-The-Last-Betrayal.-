"""Phase 2+: Petal Storm (and, moving, phase 3's Petal Tornado). The 0.75 s tell the fight already teaches ("petals
gathering on the floor mean a storm is about to rise there") becomes petals sliding inward over a pink floor ellipse;
then a white release and a spiraling column of petals rises for the storm's 1.4 s, wrapped in torn pink strands."""
from _sakura import *
from _spiral import storm_layers

TELL = 45      # frames: AKARI_MOVES.petalStorm.delay (0.75 s)
STORM = 84     # frames: petalStorm.dur (1.4 s)


def recipe():
    return effect('Sakura_Spiral', 'Spiral Petal Stream', 'boss', 'sakura', 2.8, [
        # ---- tell: where the storm will rise
        floor_ellipse('Floor tell', fade(DEEP, 200), 1.35, .4, TELL + 8, fade_in=10, fade_out=8),
        petals('Gathering petals', 15, interval=3, life=(16, 18), size=(.1, .15), gravity=0, turbulence=.001, curve=SOFT,
               position=[0, .06, 0], spawn=dict(shape='Circle', radius=[1.0, 1.6], rotate=True),
               travel=dict(end=[[.1, .3], 0, 0], easing='EaseInQuadratic')),
        # ---- release
        flash('Release flash', CORE, 1.7, life=5, delay=TELL, position=[0, .7, 0]),
        tilted_ring('Floor ring', PINK, 1.7, life=16, delay=TELL, tilt=(-80, 0, 0), thickness=.3),
        # ---- the spiral (shared with the moving Petal Tornado)
        *storm_layers(TELL, STORM),
        # ---- exit: the storm drops what it carried
        matter('Thrown petals', 12, delay=TELL + 15, interval=4, life=(36, 48), position=[0, 1.2, 0],
               spawn=dict(shape='Sphere', radius=[.3, 1.2], rotate=False)),
        petals('Falling petals', 20, delay=TELL + STORM - 18, life=(30, 40), position=[0, 1.4, 0], gravity=.0009,
               spawn=dict(shape='Sphere', radius=[.3, 1.4], rotate=False)),
    ], attach='ground', peak=TELL / 60, impact=.3, light=(1, .45, .75), delivery=TARGETED,
        design='Petals slide inward over a pink floor ellipse for 0.75 s, then a white release and a column of petals spirals upward in torn pink strands, and drops its petals as it dies.')
