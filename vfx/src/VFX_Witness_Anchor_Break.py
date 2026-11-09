"""Echo Genesis: an Echo Anchor shattering under Kage's blade. A short white contact high on the crystal, the crystal's
light thrown out as violet shards that tumble and fall, a gold ring snapping out level with the floor, a column of
light shooting up where it stood and thinning, glitch pixels hanging for a moment and gold motes drifting down. It
reads as control coming back: the light goes UP and out, not a dark implosion."""
from _witness import *

M = MAGENTA
HIT = 2


def recipe():
    return effect('Witness_Anchor_Break', 'Anchor Break', 'boss', 'void', 1.0, [
        flash('Contact star', M['CORE'], 2.0, life=4, delay=HIT, position=[0, 1.1, 0]),
        glow('Break bloom', fade(M['BODY'], 200), 3.2, life=16, delay=HIT, position=[0, 1.0, 0]),
        floor_ring('Gold ring', GOLD, 2.6, 22, delay=HIT, thickness=.14),
        column('Release column', fade(M['HOT'], 200), .4, 4.4, 30, delay=HIT, scroll=(0, -.08), fade_in=0, fade_out=24, emissive=2.0,
               scale_start=[1, 1, 1], scale_end=[.3, 1, .3]),
        pivot('Shard source', (0, 1.0, 0), [
            sprite('Crystal shards', 'T_Shard01', M['HOT'], color_end=fade(M['BODY'], 0), count=18, life=[26, 38], delay=HIT, size=[.14, .3],
                   rotation=[0, 0, [-180, 180]], spin=[0, 0, [-10, 10]], forces=[dict(type='Gravity', gravity=[0, -.003, 0])], fade_in=0, fade_out=8,
                   emissive=1.7) | spray([[-1.8, 1.8], [.2, 1.8], [-.3, .3]], radius=.4),
            radial_sparks('Sparks', 14, M['CORE'], color_end=fade(GOLD, 0), distance=(.8, 1.8), life=(10, 16), width=.05, delay=HIT)]),
        glitch('Glitch', M['HOT'], 6, (10, 14), delay=HIT + 2, spread=.9, size=(.22, .4), position=[0, 1.0, 0]),
        motes('Gold motes', 14, GOLD_HOT, color_end=fade(GOLD, 0), size=(.05, .09), life=(30, 40), distance=(.4, 1.2), delay=HIT + 6,
              rise=-.0005, radius=(.2, 1.0), position=[0, 1.8, 0]),
    ], attach='ground', peak=HIT / 60, impact=.6, light=(.9, .6, 1), delivery=dict(kind='area'),
        screen=dict(shake=.4, flash_frames=1, flash='white', hitstop=.06),
        design='A white contact high on the crystal, violet shards thrown out and falling, a gold ring snapping out along the floor, a column of light shooting up and thinning, gold motes drifting down.')
