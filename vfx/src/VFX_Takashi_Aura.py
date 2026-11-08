"""Phase 2: the Yashiro Titan's presence round Takashi, looping. A sustained status: a dim gold mantle the height of
the Titan, gold flame licking up its sides at uneven times, rising wisps, embers drifting up off it, and a faint
band of light on the floor. Never the brightest thing on screen (the Titan's eyes and blade are). One 2 s cycle;
the game crossfades two copies half a cycle apart, so the loop has no seam."""
from _takashi import *

P = 120


def recipe():
    up = dict(spawn=dict(shape='Sphere', radius=[.6, 1.8], rotate=False))
    return effect('Takashi_Aura', 'Yashiro Titan Aura', 'status', 'holy', P / 60, [
        sprite('Mantle', 'T_Glow01', fade(GOLD, 40), life=P, size=5.0, position=[0, 2.3, 0], fade_in=20, fade_out=20,
               size_curve=[[0, .95], [50, 1.04], [100, .95]]),
        floor_band('Floor light', fade(GOLD, 120), 1.6, .4, P, fade_in=20, fade_out=20),
        column('Spirit column', fade(GOLD, 70), 1.5, 4.6, P, scroll=(.004, -.03), fade_in=20, fade_out=20, emissive=1.1),
        speed_streaks('Rising streaks', fade(HOT, 150), 1.3, 4.2, P, speed=.05, fade_in=20, fade_out=20),
        wisps('Rising wisps', fade(HOT, 200), 1.4, count=6, width=.25, sweep=(0, 120), life=(30, 40), interval=18, delay=4,
              tilt=((-20, 20), (0, 360), (60, 120)), position=[0, 1.6, 0]),
        embers('Embers', 30, interval=4, delay=1, life=(50, 70), rise=.0016, position=[0, 1.2, 0], **up),
    ], attach='caster_ground', peak=0, impact=0, light=(1, .78, .4), loop=True, delivery=SELF,
        design='A dim gold mantle the height of the Titan, gold flame licking up its sides at uneven times, rising wisps, embers drifting up off it and a faint band of light on the floor.')
