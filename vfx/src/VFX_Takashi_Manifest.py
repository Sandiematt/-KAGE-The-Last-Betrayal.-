"""Phase 2 entrance (and the Titan breaking apart at phase 3): the Yashiro Titan manifests. The family seal opens on
the floor, gold motes are drawn in, then a column of gold light and flame erupts round Takashi, halos rise up it,
gold flame tongues lick upward, sparks shoot up and embers hang over him while the column thins away."""
from _takashi import *

HIT = 14


def recipe():
    return effect('Takashi_Manifest', 'Yashiro Titan Manifest', 'boss', 'holy', 1.9, [
        decal('Seal', 'T_TomoeSeal01', HOT, 3.4, 96, delay=0, spin=.4, fade_in=10, fade_out=40, emissive=1.6,
              size_curve=[[0, .55], [15, 1], [100, 1.08]], alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.9, easing='EaseInQuartic')),
        floor_band('Floor glow', fade(GOLD, 200), 1.5, .5, 70, delay=2, fade_in=8, fade_out=30),
        motes('Gather', 18, HOT, color_end=GOLD, size=(.06, .11), life=(12, 14), distance=(-1.6, -1.1), radius=(1.6, 2.0),
              position=[0, 1.2, 0], fade_in=2, fade_out=3),
        flash('Eruption flash', CORE, 2.6, life=5, delay=HIT, position=[0, 1.4, 0]),
        tilted_ring('Floor shock', GOLD, 3.0, life=18, delay=HIT, tilt=(-80, 0, 0), thickness=.3),
        column('Light column', fade(GOLD, 200), .9, 6.5, 70, delay=HIT, scroll=(.01, -.06), fade_in=0, fade_out=34,
               scale_start=[1, .1, 1], scale_end=[1, 1, 1], easing='EaseOutQuartic', emissive=1.4),
        column('Column core', fade(CORE, 160), .3, 6.0, 30, delay=HIT, scroll=(.01, -.09), fade_in=0, fade_out=16,
               scale_start=[1, .15, 1], scale_end=[1, 1, 1], easing='EaseOutQuartic', emissive=1.8),
        flame('Flame tongues', HOT, fade(GOLD, 0), 1.4, (22, 34), count=7, delay=HIT + 1,
              spawn=dict(shape='Circle', axis='YAxis', radius=[.4, 1.0], rotate=False)),
        tilted_ring('Halo 1', HOT, 1.2, life=30, delay=HIT + 4, tilt=(-80, 0, 0), thickness=.14,
                    travel=dict(start=[0, .4, 0], end=[0, 4.0, 0], easing='EaseOutCubic'), fade_out=14),
        tilted_ring('Halo 2', HOT, 1.0, life=30, delay=HIT + 12, tilt=(-80, 0, 0), thickness=.12,
                    travel=dict(start=[0, .4, 0], end=[0, 4.6, 0], easing='EaseOutCubic'), fade_out=14),
        radial_sparks('Up streaks', 16, CORE, color_end=GOLD, distance=(2.5, 4.6), life=(12, 18), length=(.5, 1.0), delay=HIT,
                      hemisphere=True) | spray([[-1.0, 1.0], [2.6, 4.6], [-.2, .2]], radius=.5),
        embers('Embers', 20, delay=HIT + 6, life=(34, 48), interval=2, rise=.0016, radius=(.5, 1.4), position=[0, 1.0, 0]),
        smoke('Dust', fade(DUST, 170), count=5, size=(.8, 1.2), life=(40, 56), delay=HIT, rise=.0004, radius=(.6, 1.2)),
    ], attach='ground', peak=HIT / 60, impact=.8, light=(1, .78, .4), delivery=SELF,
        screen=dict(shake=.6, flash_frames=1, flash='white', hitstop=0),
        design='The family seal opens gold on the floor and motes are drawn in; a column of gold light erupts round him, halos rise up it, flame tongues lick upward, sparks shoot up and embers hang as the column thins away.')
