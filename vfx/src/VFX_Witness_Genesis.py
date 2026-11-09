"""Phase IV: Domain Expansion, ECHO GENESIS. Played behind the Witness as the arena goes black and the glass of the
world cracks. A long gather (motes and strands drawn into its raised hand), one release: a white star, the Echo
System's seal flaring open on the floor and standing up as a giant turning ring of segments behind it, a second and
third ring opening at other tilts, glass shards thrown out across the whole frame and hanging, gold star glints
blooming round the rings, violet mantle swelling. The rings hold and keep turning as the release dies down; the
game lays its own canvas domain (the spectral Kages, the cracked sky) over what remains."""
from _witness import *

M = MAGENTA
REL = 40


def recipe():
    ring = dict(fade_in=4, fade_out=24, emissive=1.3)
    return effect('Witness_Genesis', 'Echo Genesis', 'boss', 'void', 2.2, [
        motes('Gather', 40, M['HOT'], color_end=M['CORE'], size=(.06, .12), life=(24, 30), distance=(-2.8, -2.0), radius=(2.6, 3.0), position=[.4, 2.4, 0], delay=8),
        wisps('Drawn strands', fade(M['HOT'], 210), 2.2, count=6, width=.3, sweep=(0, 140), life=(22, 30), interval=5, delay=4,
              tilt=((-30, 30), (0, 360), (0, 360)), position=[.4, 2.4, 0], size=1.0, size_curve=[[0, 1.3], [100, .4]]),
        flash('Release star', M['CORE'], 3.0, life=4, delay=REL, position=[.4, 2.4, 0]),
        glow('Release bloom', fade(M['BODY'], 150), 5.5, life=36, delay=REL, position=[0, 2.4, 0]),
        decal('Floor seal', 'T_EchoSeal01', fade(GOLD, 230), 6.0, 92, delay=REL - 6, spin=.5, fade_in=6, fade_out=30, emissive=1.8),
        sprite('Standing ring', 'T_EchoSeal01', fade(M['BODY'], 210), life=90, delay=REL, size=6.4, billboard='Fixed', position=[0, 2.8, -.6],
               spin=[0, 0, .4], size_curve=[[0, .2], [14, 1.05], [30, 1], [100, 1.04]], **ring),
        orbit_band('Ring 2', fade(M['HOT'], 220), fade(M['BODY'], 0), fade(M['BODY'], 0), 3.8, .16, 86, tilt=(-58, 0, 18), delay=REL + 3,
                   position=[0, 2.8, 0], flow=-.05, size_curve=[[0, .2], [16, 1.05], [100, 1]], **ring),
        orbit_band('Ring 3', fade(GOLD, 220), fade(GOLD, 0), fade(GOLD, 0), 4.6, .12, 82, tilt=(-74, 0, -14), delay=REL + 6,
                   position=[0, 2.8, 0], flow=.05, size_curve=[[0, .2], [18, 1.05], [100, 1]], **ring),
        shock_ring('Release ring', M['CORE'], 7.5, life=20, delay=REL, thickness=.12, position=[0, 2.4, 0]),
        pivot('Glass source', (0, 2.4, 0), [
            sprite('Glass shards', 'T_Shard01', (230, 220, 255, 255), color_end=fade(M['BODY'], 0), count=40, life=[40, 60], delay=REL, size=[.18, .5],
                   rotation=[0, 0, [-180, 180]], spin=[0, 0, [-6, 6]], fade_in=0, fade_out=14, emissive=1.6) |
            spray([[-6.5, 6.5], [-2.2, 3.4], [-.4, .4]], radius=.6)]),
        sparkle('Gold glints', GOLD_HOT, .5, count=10, life=26, delay=REL + 6, spread=4.0, position=[0, 2.8, 0]),
        cards('Card storm', fade(M['HOT'], 220), 18, (40, 60), delay=REL + 2, spread=4.2, size=(.3, .5), position=[0, 2.6, 0]),
    ], attach='caster_ground', peak=REL / 60, impact=1.0, light=(.8, .35, 1), delivery=SELF,
        screen=dict(shake=.8, flash_frames=2, flash='white', hitstop=0),
        design='Motes and strands drawn into a raised hand, one release: the Echo System seal flares on the floor and stands up as a giant turning ring behind it, two more rings open at other tilts, glass shards fly across the frame and hang, gold glints bloom.')
