"""Phase III: Gravity Collapse, the well at the centre of the arena that pulls Kage in. A sustained dark element, looping:
a violet accretion band (far half, black core, near half, so the band passes in front of the core), a second band at
another tilt, violet strands and motes drawn inward along curved paths, a cyan rim of light round the black core and
a dim violet glow. It draws in; it never releases. One 1 s cycle; the game crossfades two copies half a cycle apart."""
from _witness import *

P = 60
V = VIOLET


def recipe():
    disk = dict(flow=-.06, fade_in=10, fade_out=10, emissive=1.8)
    return effect('Witness_Gravity', 'Gravity Collapse', 'status', 'void', P / 60, [
        glow('Well glow', fade(V['BODY'], 90), 3.4, life=P, fade_in=10, fade_out=10, size_curve=[[0, 1], [100, 1]], position=[0, 1.0, 0]),
        orbit_band('Far band', V['HOT'], fade(V['BODY'], 0), fade(V['DEEP'], 0), 1.3, .5, P, tilt=(-70, 0, 12), arc=(-90, 90), position=[0, 1.0, 0], **disk),
        orbit_band('Far band 2', fade(CYAN, 200), fade(CYAN, 0), fade(V['DEEP'], 0), 1.0, .3, P, tilt=(-62, 0, -28), arc=(-90, 90), position=[0, 1.0, 0], **disk),
        sprite('Core', 'T_SoftCircle', V['INK'], life=P, size=1.0, blend='Blend', billboard='Billboard', position=[0, 1.0, 0], fade_in=10, fade_out=10),
        shock_ring('Rim', V['HOT'], .55, life=P, thickness=.1, fade_in=10, fade_out=10, size_curve=[[0, 1], [50, 1.05], [100, 1]], position=[0, 1.0, 0], emissive=2.0),
        orbit_band('Near band', V['HOT'], fade(V['BODY'], 0), fade(V['DEEP'], 0), 1.3, .5, P, tilt=(-70, 0, 12), arc=(90, 270), position=[0, 1.0, 0], **disk),
        orbit_band('Near band 2', fade(CYAN, 200), fade(CYAN, 0), fade(V['DEEP'], 0), 1.0, .3, P, tilt=(-62, 0, -28), arc=(90, 270), position=[0, 1.0, 0], **disk),
        wisps('Inward strands', fade(V['HOT'], 210), 1.6, count=5, width=.24, sweep=(0, 140), life=(20, 28), interval=11, delay=1,
              tilt=((-80, -60), (0, 360), (0, 360)), position=[0, 1.0, 0], size=1.0, size_curve=[[0, 1.2], [100, .45]]),
        motes('Drawn motes', 30, V['HOT'], color_end=V['CORE'], size=(.05, .1), life=(18, 24), distance=(-2.2, -1.6), radius=(2.0, 2.4),
              interval=2, position=[0, 1.0, 0], hemisphere=False),
    ], attach='ground', peak=0, impact=0, light=(.6, .3, 1), loop=True, delivery=dict(kind='area'),
        design='A violet accretion band passing in front of a black core with a cyan rim, a second band at another tilt, violet strands and motes drawn inward along curved paths.')
