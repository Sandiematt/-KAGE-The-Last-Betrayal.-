"""Phase 3: the full-screen petal storm vortex (Thousand Petal Requiem's storm, and the phase-3 entrance). The arena
dims under a wine-dark veil, two pink bands turn round the screen, and a hundred-plus petals and crescent blades
spiral inward round a white-hot eye. Looping; the director holds it for as long as the storm lasts and releases it.
Built in the screen plane (spin about Z) so the 2D emitter shows the whole whirl."""
from _sakura import *

L = 120   # one loop, frames


def recipe():
    infall = dict(spawn=dict(shape='Circle', axis='ZAxis', radius=[1.6, 6.4], rotate=True),
                  travel=dict(end=[[.4, 1.1], 0, 0], easing='EaseInQuadratic'))
    return effect('Sakura_Vortex', 'Petal Storm Vortex', 'boss', 'sakura', 2.0, [
        sprite('Dark veil', 'T_SoftCircle', WINE, life=L, size=15, billboard='Billboard', blend='Blend', fade_in=24, fade_out=24),
        orbit_band('Outer band', fade(DEEP, 70), fade(DEEP, 0), fade(DEEP, 0), 6.0, 1.3, L, tilt=(0, 0, 0), flow=-.025,
                   fade_in=14, fade_out=30, emissive=1.4),
        orbit_band('Inner band', fade(PINK, 85), fade(HOT, 0), fade(PINK, 0), 3.4, .85, L, tilt=(0, 0, 0), flow=-.05,
                   fade_in=10, fade_out=30, emissive=1.6),
        dict(name='Vortex pivot', renderer='None', life=L, spin=[0, 0, 3.2], children=[
            petals('Storm petals', 120, interval=.75, life=(46, 64), size=(.2, .32), gravity=0, turbulence=.003, **infall),
            blade('Storm blades', length=.85, width=.4, life=26, count=24, interval=4.5, rotation=[0, 0, 90],
                  spawn=dict(shape='Circle', axis='ZAxis', radius=[2.2, 5.2], rotate=True),
                  travel=dict(end=[[1.2, 2.0], 0, 0], easing='EaseInCubic')),
        ]),
        wisps('Storm strands', PINK, 4.2, count=10, interval=11, width=.6, life=(24, 34), size=(.7, 1.25),
              tilt=((-12, 12), (-12, 12), (0, 360)), flow=-.06),
        glow('Eye bloom', fade(PINK, 190), 3.0, life=L, fade_in=10, fade_out=30, size_curve=[[0, .7], [50, 1.08], [100, .9]]),
        glow('Eye core', CORE, 1.1, life=L, fade_in=6, fade_out=30, size_curve=[[0, .9], [25, 1.1], [50, .95], [75, 1.12], [100, .9]]),
        sparkle('Storm glints', CORE, .42, count=12, life=16, interval=10, spread=5.0),
    ], attach='body', loop=True, light=(1, .45, .75), delivery=dict(kind='area'),
        design='The arena dims under a wine veil while two pink bands turn round the screen and hundreds of petals and crescent blades spiral inward round a white-hot eye.')
