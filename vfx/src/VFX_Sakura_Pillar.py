"""Phase 2+: vertical blade/petal pillar (the reference's fan of standing pink blades). Erupts where a Blossom Ribbon
stops, where Falling Petal (Aerial Dive) lands, and round Akari on her phase-2 entrance. A pink floor tell, a white
contact, a tall pink light column, seven crescent blades that shoot up from the floor in a fan, and a geyser of
petals that rises and drifts back down."""
from _sakura import *

HIT = 6
# seven overlapping additive blades starting white fused into one blob: they start pink-white instead
BLADE = ramp((0, HOT), (30, PINK), (75, DEEP), (100, fade(DEEP)))['color_curve']


def blade_fan():
    layers = []
    for i, angle in enumerate([-48, -32, -16, 0, 16, 32, 48]):
        tall = 2.7 - abs(angle) / 48 * .9
        layers.append(blade(f'Standing blade {i + 1}', length=tall, width=.42, life=26, delay=HIT + abs(i - 3), vertical=True,
                            angle=angle, pivot='bottom', position=[angle / 160, 0, 0], scale_start=[.42, tall * .08, 1],
                            scale_end=[.42, tall, 1], easing='EaseOutQuartic', color_curve=BLADE))
    return layers


def recipe():
    return effect('Sakura_Pillar', 'Blade Petal Pillar', 'boss', 'sakura', 1.3, [
        floor_ellipse('Floor tell', fade(DEEP, 210), 1.0, .32, HIT + 6, fade_in=2, fade_out=4),
        motes('Gather', 10, HOT, color_end=PINK, size=(.06, .1), life=(6, 7), distance=(-.8, -.5), radius=(.8, 1.0),
              position=[0, .3, 0], fade_in=0, fade_out=3),
        flash('Contact flash', CORE, 1.2, life=4, delay=HIT, position=[0, .55, 0], angle=90),
        tilted_ring('Floor shock', PINK, 2.1, life=14, delay=HIT, tilt=(-80, 0, 0), thickness=.28),
        column('Pillar body', fade(PINK, 210), .55, 3.3, 40, delay=HIT, scroll=(.01, -.05), fade_in=0, fade_out=20,
               scale_start=[1, .15, 1], scale_end=[1, 1, 1], easing='EaseOutQuartic', emissive=1.3),
        column('Pillar core', fade(CORE, 150), .12, 3.1, 16, delay=HIT, scroll=(.01, -.08), fade_in=0, fade_out=10,
               scale_start=[1, .2, 1], scale_end=[1, 1, 1], easing='EaseOutQuartic', emissive=1.6),
        *blade_fan(),
        radial_sparks('Up streaks', 10, CORE, color_end=PINK, distance=(1.6, 3.0), life=(10, 15), length=(.4, .8), delay=HIT,
                      hemisphere=True),
        petals('Petal geyser', 40, delay=HIT + 1, life=(42, 60), gravity=.0007, turbulence=.005,
               **spray([[-1.3, 1.3], [1.6, 3.4], [-.3, .3]], radius=.35)),
        sparkle('Glints', CORE, .38, count=5, life=14, delay=HIT + 2, spread=1.4, position=[0, 1.6, 0]),
        matter('Settling petals', 10, delay=HIT + 24, life=(36, 44), position=[0, 2.0, 0], gravity=.0008,
               spawn=dict(shape='Sphere', radius=[.2, 1.2], rotate=False)),
    ], attach='ground', peak=HIT / 60, impact=.55, light=(1, .45, .75),
        delivery=dict(kind='projectile', projectile='VFX_Sakura_Ribbon'), screen=dict(shake=.35, hitstop=.05),
        design='A pink ellipse flares on the floor, then a white contact, a tall pink light column and a fan of seven crescent blades shoot up while a geyser of petals rises and drifts back down.')
