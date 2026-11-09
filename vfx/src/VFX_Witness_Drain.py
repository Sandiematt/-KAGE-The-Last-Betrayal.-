"""Phase III: Health Drain, on Kage while the tether holds, looping. His light is pulled out of him: pale red-violet
motes and thin streaks peel off his body and stream away toward the Witness (-X, the way back along the tether), a
violet ring tightens round his chest over and over, and a dim violet mantle sits on him. Draws OUT and away, never in.
One 1 s cycle; the game crossfades two copies half a cycle apart, mirrored so it always streams toward the Witness."""
from _witness import *

V = VIOLET
P = 60
DRAIN = (255, 120, 170, 255)   # Kage's life: a pale red the violet carries away


def recipe():
    return effect('Witness_Drain', 'Health Drain', 'status', 'void', P / 60, [
        glow('Drain mantle', fade(V['BODY'], 60), 2.4, life=P, fade_in=10, fade_out=10, size_curve=[[0, 1], [100, 1]], position=[0, 1.0, 0]),
        *[tilted_ring(f'Tightening ring {i + 1}', fade(V['HOT'], 200), .9, life=20, delay=i * 20, tilt=(-70, 0, 0), thickness=.1, position=[0, 1.1, 0],
                      size_curve=[[0, 1.3], [100, .45]], alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.8, easing='EaseInQuadratic')) for i in range(3)],
        *[flash(f'Pull glint {i + 1}', V['CORE'], .5, life=4, delay=18 + i * 20, position=[0, 1.1, 0]) for i in range(2)],
        pivot('Drain source', (0, 1.0, 0), [
            motes('Life motes', 30, DRAIN, color_end=fade(V['BODY'], 0), size=(.05, .1), life=(20, 28), interval=2, distance=(.2, .5), radius=(.1, .5)) |
            dict(travel=dict(end=[[-2.6, -1.6], [.1, .7], [-.1, .1]], easing='EaseInCubic'), spawn=dict(shape='Sphere', radius=[.1, .5], rotate=False)),
            radial_sparks('Life streaks', 20, fade(DRAIN, 220), color_end=fade(V['HOT'], 0), life=(12, 16), width=.04, length=(.2, .4), interval=3) |
            spray([[-2.2, -1.4], [.0, .6], [-.1, .1]], radius=.4),
        ]),
    ], attach='body', peak=0, impact=0, light=(.6, .3, 1), loop=True, delivery=TARGETED,
        design='Pale red-violet motes and thin streaks peel off Kage and stream away toward the Witness while a violet ring tightens round his chest over and over.')
