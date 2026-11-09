"""Phase transitions and the defeat: the Witness's body breaking apart. A crack of white light opening in the chest
core, the body's echo blowing out as blue-violet cards and shards that tumble outward and slow to hang, a ring
snapping out level with the core, a second slower ring, glitch pixels blinking where the body was, and pale motes
lifting off and drifting up for a long time after: the echo dissolving, not exploding. Played at the core."""
from _witness import *

B = BLUE
V = VIOLET
HIT = 4


def recipe():
    return effect('Witness_Shatter', 'Echo Shatter', 'boss', 'void', 1.6, [
        motes('Core gather', 16, B['HOT'], color_end=B['CORE'], size=(.05, .1), life=(10, 12), distance=(-1.0, -.7), radius=(.9, 1.2)),
        flash('Core crack', B['CORE'], 2.4, life=5, delay=HIT, angle=-30),
        glow('Core bloom', fade(V['BODY'], 210), 3.6, life=24, delay=HIT),
        shock_ring('Core ring', B['HOT'], 2.6, life=18, delay=HIT, thickness=.14),
        shock_ring('Slow ring', fade(V['HOT'], 200), 3.8, life=34, delay=HIT + 4, thickness=.08),
        cards('Echo cards', fade(B['HOT'], 230), 16, (40, 56), delay=HIT, spread=.4, size=(.2, .34)) |
        dict(travel=dict(end=[[-2.2, 2.2], [-1.4, 1.8], [-.3, .3]], easing='EaseOutQuartic'), spawn=dict(shape='Sphere', radius=[0, .4], rotate=False)),
        sprite('Body shards', 'T_Shard01', V['HOT'], color_end=fade(V['BODY'], 0), count=26, life=[34, 50], delay=HIT, size=[.12, .3],
               rotation=[0, 0, [-180, 180]], spin=[0, 0, [-8, 8]], fade_in=0, fade_out=12, emissive=1.7) |
        spray([[-2.6, 2.6], [-1.6, 2.0], [-.4, .4]], radius=.5),
        glitch('Glitch', V['HOT'], 12, (8, 14), delay=HIT + 2, interval=0, spread=1.0, size=(.26, .5)),
        glitch('Cyan glitch', CYAN, 8, (6, 10), delay=HIT + 8, spread=1.2, size=(.22, .4)),
        motes('Lifting motes', 30, B['HOT'], color_end=fade(V['DEEP'], 0), size=(.05, .1), life=(50, 70), distance=(.3, 1.0), delay=HIT + 6,
              interval=1, rise=.0018, radius=(.2, 1.2)) | dict(count=30, interval=0),
    ], attach='body', peak=HIT / 60, impact=.8, light=(.5, .45, 1), delivery=SELF,
        screen=dict(shake=.6, flash_frames=1, flash='white', hitstop=.08),
        design='A crack of white light in the chest core, the body\'s echo blowing out as cards and shards that tumble and hang, two rings snapping out, glitch pixels blinking and pale motes lifting off for a long time.')
