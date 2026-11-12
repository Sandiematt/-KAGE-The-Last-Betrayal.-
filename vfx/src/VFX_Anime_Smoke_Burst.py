"""The anime ground blast: a heavy body or blade hits the floor and the air is shoved outward. Cel-shaded white
cloud banks burst out left and right and pile up, leaving a hollow dome of clear air over the contact. Broken white
strokes trace the dome, wind streaks fan along the floor, and blobs of smoke spit upward and fall. The banks billow,
then tear into hard-edged chunks and are gone.
The contact is the strongest beat: a hard white starburst squashed onto the floor and a short flash at f1-f4, with the
dome strokes and the streaks at their widest by f3, while the banks ease out more slowly and only peak around f20-f28
as the secondary."""
from _anime import *

HIT = 1


def recipe():
    return effect('Anime_Smoke_Burst', 'Anime Smoke Burst', 'element', 'physical', 1.2, [
        # the two big banks either side of the hollow (drawn first: everything else sits in front)
        toon_puffs('Left bank', 3, [[-2.2, -1.1], [.45, 1.0], [-.5, -.2]], (1.35, 1.75), (62, 68), delay=HIT + 1, easing='EaseOutCubic'),
        toon_puffs('Right bank', 3, [[1.1, 2.2], [.45, 1.0], [-.5, -.2]], (1.35, 1.75), (62, 68), delay=HIT + 1, easing='EaseOutCubic'),
        # low rollers racing further along the floor in front of the banks
        toon_puffs('Low rollers', 6, [[-3.0, 3.0], [.22, .4], [.1, .5]], (.6, .9), (50, 58), delay=HIT + 1, radius=.3),
        # the contact pop: a squat puff that swells over the hit for a few frames and is torn away by the banks
        sprite('Contact pop', 'T_ToonPuff01', PUFF, life=9, delay=HIT, blend='Blend', billboard='Billboard', position=[0, .32, 0],
               scale_start=[1.2, .7, 1], scale_end=[2.3, 1.1, 1], easing='EaseOutQuartic', fade_in=0, fade_out=4),
        # the contact: a hard white starburst squashed on the floor and a short flash, gone by f7
        hard_edge(sprite('Contact burst', 'T_Impact01', PUFF, life=6, delay=0, blend='Blend', billboard='Billboard', position=[0, .3, 0],
                         scale_start=[1.4, .7, 1], scale_end=[2.8, 1.2, 1], easing='EaseOutQuartic', alpha_texture='T_NoiseTile01',
                         fade_in=0, fade_out=2), threshold=.25, outline=(190, 186, 228, 255), width=.06, erode=(.2, .95)),
        flash('Contact flash', WHITE, 1.8, life=4, delay=HIT, position=[0, .3, 0], emissive=1.2),
        # the dome of shoved air: broken strokes either side, at their widest by f3, a second pair a beat later
        dome_arc('Dome stroke left', PUFF, 1.5, -88, -30, 12, delay=0, position=[0, .2, 0], size_curve=[[0, .75], [22, 1.0], [100, 1.1]]),
        dome_arc('Dome stroke right', PUFF, 1.5, 30, 88, 12, delay=0, position=[0, .2, 0], size_curve=[[0, .75], [22, 1.0], [100, 1.1]]),
        dome_arc('Outer stroke left', PUFF, 2.05, -80, -48, 12, delay=HIT + 2, width=.04, position=[0, .2, 0]),
        dome_arc('Outer stroke right', PUFF, 2.05, 48, 80, 12, delay=HIT + 2, width=.04, position=[0, .2, 0]),
        # wind streaks fanning out along the floor, already wide at the contact
        sprite('Ground streaks', 'T_ToonSwoosh01', PUFF, life=16, delay=0, blend='Blend', billboard='Billboard', position=[0, .14, 0],
               scale_start=[4.0, 2.6, 1], scale_end=[6.6, 3.2, 1], easing='EaseOutQuartic', fade_in=0, fade_out=8),
        floor_ring('Floor shove', fade(PUFF, 170), 2.1, 10, delay=HIT, thickness=.1, blend='Blend'),
        # smoke spat upward that arcs and falls
        sprite('Spat blobs', 'T_ToonPuff01', PUFF, count=9, life=[24, 34], delay=HIT + 1, blend='Blend', billboard='Billboard',
               size=[.14, .26], size_end=[.06, .12], easing='EaseInQuadratic', forces=[dict(type='Gravity', gravity=[0, -.0032, 0])],
               fade_in=0, fade_out=6) | spray([[-1.8, 1.8], [1.6, 2.8], [-.2, .2]], radius=.2),
    ], attach='ground', peak=HIT / 60, impact=.5, light=(1, 1, 1), delivery=dict(kind='area'),
        screen=dict(shake=.4, flash_frames=0, hitstop=.03),
        design='A hard white starburst and flash squash onto the floor; cel-shaded white cloud banks then ease out left and right, leaving a hollow dome of clear air traced by broken white strokes; wind streaks fan along the floor, blobs of smoke spit up and fall, and the banks tear into hard-edged chunks.')
