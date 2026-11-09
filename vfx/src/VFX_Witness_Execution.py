"""Phase III: Execution Frames, the strike after the arena freezes. The frozen frame breaks: a near-black impact card and
a white star on the same frame, one long white line down through the target from far above, a huge violet crescent
cutting down after it with a white leading edge, a cyan shock ring racing out along the floor, shards thrown out
low and sideways, glitch pixels hanging where the cut passed and violet motes settling. The heaviest single hit."""
from _witness import *

V = VIOLET
HIT = 3


def recipe():
    return effect('Witness_Execution', 'Execution Frames', 'boss', 'void', 1.2, [
        slice_line('Guide line', fade(V['HOT'], 160), 4.4, width=.05, angle=90, life=HIT + 2, position=[0, 2.4, 0]),
        sprite('Impact card', 'T_SoftCircle', (0, 0, 0, 230), life=3, delay=HIT, size=9, blend='Blend', billboard='Billboard', position=[0, 1.6, 0], fade_in=0, fade_out=1),
        flash('Contact star', V['CORE'], 3.0, life=5, delay=HIT, position=[0, 1.0, 0]),
        slice_line('Kill line', V['CORE'], 5.2, width=.09, angle=90, life=14, delay=HIT, position=[0, 1.9, 0]),
        # a crescent bowed toward +X, its head racing DOWN (tilted 180 about X: angle a -> 180 - a, the sweep reversed)
        slash_arc('Crescent body', V['BODY'], radius=1.9, width=.9, sweep=(195, 345), life=20, delay=HIT - 1, tilt=(180, 0, 0), position=[-1.0, 1.6, 0], emissive=2.2, cutoff=dict(start=0, end=.6, easing='EaseInCubic')),
        slash_arc('Crescent edge', V['CORE'], radius=1.92, width=.12, sweep=(200, 340), life=12, delay=HIT - 1, tilt=(180, 0, 0), position=[-1.0, 1.6, 0], emissive=2.6),
        glow('Violet bloom', fade(V['BODY'], 190), 4.4, life=22, delay=HIT, position=[0, 1.0, 0]),
        floor_ring('Floor shock', fade(CYAN, 230), 4.6, 24, delay=HIT, thickness=.14),
        floor_ring('Second shock', V['HOT'], 3.2, 20, delay=HIT + 4, thickness=.08),
        pivot('Shard source', (0, .5, 0), [
            radial_sparks('Thrown shards', 26, V['CORE'], color_end=fade(V['BODY'], 0), distance=(1.4, 3.2), life=(14, 22), width=.07,
                          length=(.3, .6), delay=HIT, gravity=.0014) | spray([[-3.2, 3.2], [-.2, 1.6], [-.3, .3]], radius=.4)]),
        glitch('Hanging glitch', V['HOT'], 10, (14, 22), delay=HIT + 2, spread=1.4, size=(.3, .6), position=[0, 1.2, 0]),
        glitch('Cyan glitch', CYAN, 6, (10, 16), delay=HIT + 5, spread=1.6, size=(.26, .46), position=[0, 1.0, 0]),
        motes('Settling motes', 16, V['HOT'], color_end=fade(V['DEEP'], 0), size=(.05, .1), life=(34, 44), distance=(.3, 1.2), delay=HIT + 8,
              rise=-.0004, radius=(.4, 1.6), position=[0, 1.2, 0]),
        smoke('Void residue', (78, 60, 110, 170), count=5, size=(.8, 1.2), life=(34, 44), delay=HIT + 6, rise=.0003, radius=(.3, 1.6), position=[0, .4, 0]),
    ], attach='ground', peak=HIT / 60, impact=1.0, light=(.7, .4, 1), delivery=dict(kind='area'),
        screen=dict(shake=1.0, flash_frames=2, flash='invert', hitstop=.12),
        design='A near-black impact card and a white star on one frame, a long white line down through the target, a huge violet crescent cutting down after it, cyan rings racing along the floor, shards thrown out low and glitch pixels hanging.')
