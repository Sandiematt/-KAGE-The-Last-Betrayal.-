"""Phase II: the Manipulator's cast, at its hand, as it reaches for Kage's controls (Echo Bind, Reversal, Input
Delay, Rage Suppression, Forced Echo Step). Threads of light converge on the clawed hand from all round, an Echo seal
flares open in front of the palm facing the camera and turns, a ring snaps out, and three long threads shoot from the
palm toward the target (+X) and thin. Reads as a command given, not a blast: no sparks thrown, no smoke."""
from _witness import *

B = BLUE
REL = 14


def recipe():
    return effect('Witness_Cast', 'Control Cast', 'element', 'void', .9, [
        *[slice_line(f'Converging thread {i + 1}', fade(B['HOT'], 200), 1.4, width=.02, angle=a, life=10, delay=i * 2,
                     position=[math.cos(math.radians(a)) * .9, math.sin(math.radians(a)) * .9, 0])
          for i, a in enumerate((20, 75, 140, 200, 250, 320))],
        motes('Gather', 16, B['HOT'], color_end=B['CORE'], size=(.04, .08), life=(10, 14), distance=(-1.0, -.7), radius=(1.0, 1.2)),
        sprite('Palm seal', 'T_EchoSeal01', fade(B['HOT'], 230), life=34, delay=REL - 4, size=1.2, billboard='Billboard', spin=[0, 0, 2.4],
               size_curve=[[0, .2], [25, 1.08], [40, 1], [100, 1.05]], fade_in=2, fade_out=14, emissive=1.9,
               alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.85, easing='EaseInCubic')),
        flash('Command star', B['CORE'], 1.3, life=4, delay=REL),
        shock_ring('Command ring', B['HOT'], 1.4, life=12, delay=REL, thickness=.14),
        *[slice_line(f'Command thread {i + 1}', B['CORE'], 4.2, width=.035, angle=a, life=14, delay=REL + i, position=[1.8, a * .012, 0])
          for i, a in enumerate((-6, 2, 9))],
        glow('Blue bloom', fade(B['BODY'], 160), 1.8, life=16, delay=REL),
    ], peak=REL / 60, impact=.3, light=(.4, .45, 1), delivery=SELF,
        design='Threads of light converge on the hand, an Echo seal flares open before the palm and turns, a ring snaps out and three long threads shoot from the palm toward the target.')
