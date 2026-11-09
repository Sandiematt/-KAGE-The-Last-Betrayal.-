"""Phase IV: Final Judgment, the screen-wide attack. The Witness's halo crowns itself in gold, then one horizontal
blade of light cuts the whole arena at chest height. A long gather into a point before it (gold and violet motes,
a thin guide line flickering across the arena), then on the release frame a near-black impact card and a white star
together, a hair-thin white line the width of the screen, a wide magenta band under it, gold rays standing up along
it, two gold rings racing outward at the ends, shards and glitch pixels hanging in the cut, and violet smoke settling
along the line. Jumping it is not enough: only a dash through it at the flash (or a guard timed to the flash)
survives, which the game decides; this is the picture."""
from _witness import *

M = MAGENTA
REL = 54


def recipe():
    y = 1.3
    return effect('Witness_Judgment', 'Final Judgment', 'boss', 'void', 1.9, [
        motes('Gather', 40, GOLD_HOT, color_end=M['CORE'], size=(.06, .12), life=(26, 34), distance=(-3.0, -2.2), radius=(2.8, 3.2), delay=REL - 36,
              position=[0, y, 0]),
        motes('Violet gather', 30, M['HOT'], color_end=M['CORE'], size=(.05, .1), life=(22, 28), distance=(-2.4, -1.6), radius=(2.2, 2.6), delay=REL - 30,
              position=[0, y, 0]),
        glow('Gathering point', fade(GOLD_HOT, 200), 1.4, life=REL, delay=0, size_curve=[[0, .2], [90, 1], [100, .4]], fade_in=10, fade_out=2, position=[0, y, 0]),
        *[slice_line(f'Guide {i + 1}', fade(M['HOT'], 120 + 30 * i), 12.0, width=.02, life=6, delay=d, position=[0, y, 0])
          for i, d in enumerate((REL - 30, REL - 18, REL - 8))],
        sprite('Impact card', 'T_SoftCircle', (0, 0, 0, 235), life=3, delay=REL, size=16, blend='Blend', billboard='Billboard', position=[0, y, 0], fade_in=0, fade_out=1),
        flash('Release star', M['CORE'], 4.2, life=6, delay=REL, position=[0, y, 0]),
        slice_line('Judgment line', M['CORE'], 14.0, width=.12, life=22, delay=REL, position=[0, y, 0]),
        sprite('Judgment band', 'T_Streak01', M['BODY'], life=26, delay=REL, position=[0, y, 0], scale_start=[13, 7, 1], scale_end=[15, 1.2, 1],
               easing='EaseOutQuartic', fade_in=0, fade_out=18, emissive=2.0, alpha_texture='T_NoiseStreak01', alpha_scroll=[.05, 0],
               cutoff=dict(start=0, end=.8, easing='EaseInQuadratic')),
        glow('Release bloom', fade(M['BODY'], 220), 8.0, life=26, delay=REL, position=[0, y, 0]),
        *[slice_line(f'Gold ray {i + 1}', GOLD_HOT, 2.6 + .3 * (i % 3), width=.07, angle=90, life=18, delay=REL + 1 + i % 3, position=[x, y + .2, 0])
          for i, x in enumerate((-5.2, -3.6, -2.0, -.6, .8, 2.2, 3.8, 5.4))],
        shock_ring('Left ring', GOLD, 1.6, life=18, delay=REL + 2, thickness=.14, position=[-6.2, y, 0]),
        shock_ring('Right ring', GOLD, 1.6, life=18, delay=REL + 2, thickness=.14, position=[6.2, y, 0]),
        pivot('Cut source', (0, y, 0), [
            radial_sparks('Cut shards', 34, M['CORE'], color_end=fade(M['BODY'], 0), distance=(.5, 1.4), life=(18, 28), width=.06, length=(.2, .4),
                          delay=REL + 1) | spray([[-6.5, 6.5], [-.6, .9], [-.2, .2]], radius=1.0)]),
        glitch('Hanging glitch', M['HOT'], 16, (16, 24), delay=REL + 3, spread=5.5, size=(.3, .6), position=[0, y, 0]),
        smoke('Settling smoke', (96, 70, 130, 170), count=8, size=(.9, 1.4), life=(40, 52), delay=REL + 8, rise=-.0002, radius=(.4, 5.6), position=[0, y, 0]),
    ], attach='ground', peak=REL / 60, impact=1.0, light=(.9, .5, 1), delivery=dict(kind='area'),
        screen=dict(shake=1.0, flash_frames=2, flash='invert', hitstop=.1),
        design='A long gather into a point with a guide line flickering across the arena, then a near-black card and white star, a hair-thin white line the width of the screen over a wide magenta band, gold rays standing up along it and rings racing out at its ends.')
