"""Phase IV, The True Witness: the living Echo System, looping. A turning gold-and-violet seal on the floor under it (the
Echo System's ring, with the chest emblem's triangle at its heart) and a counter-turning violet ring outside it, a
magenta column, gold sparks shooting up off the seal and slowing to hang, magenta wisps, gold star glints and a slow
violet mantle that breathes. The heaviest of the four, but still never brighter than its blows. One 2 s cycle; the
game crossfades two copies half a cycle apart."""
from _witness import *

P = 120
M = MAGENTA


def recipe():
    return effect('Witness_Aura_True', 'True Witness Aura', 'status', 'void', P / 60, [
        decal('Echo seal', 'T_EchoSeal01', fade(GOLD, 200), 3.0, P, spin=.35, fade_in=20, fade_out=20, emissive=1.6),
        decal('Outer seal', 'T_EchoSeal01', fade(M['BODY'], 150), 4.4, P, spin=-.2, fade_in=20, fade_out=20, emissive=1.4, position=[0, .04, 0]),
        mantle(M['BODY'], 52, 4.8, P, y=1.3),
        column('Magenta column', fade(M['BODY'], 80), .75, 3.0, P, scroll=(.004, -.035), fade_in=20, fade_out=20, emissive=1.2),
        wisps('Magenta wisps', fade(M['HOT'], 200), 1.15, count=6, width=.22, sweep=(0, 190), life=(36, 48), interval=19, delay=2,
              tilt=((-20, 20), (0, 360), (60, 120)), position=[0, 1.5, 0]),
        pivot('Spark source', (0, .1, 0), [
            radial_sparks('Gold sparks', 30, GOLD_HOT, color_end=fade(GOLD, 0), life=(30, 40), width=.06, length=(.16, .3), interval=4,
                          delay=1, emissive=2.0) | spray([[-.9, .9], [1.4, 2.6], [-.1, .1]], radius=1.1)]),
        sparkle('Gold stars', GOLD_HOT, .26, count=1, life=20, interval=23, delay=5, spread=1.4, position=[0, 1.6, 0]),
        motes('Violet motes', 18, M['HOT'], color_end=fade(M['DEEP'], 0), size=(.05, .1), life=(50, 70), distance=(.3, .8),
              interval=6, rise=.0014, position=[0, 1.0, 0], **UP),
    ], attach='caster_ground', peak=0, impact=0, light=(.8, .35, 1), loop=True, delivery=SELF,
        design='A turning gold-and-violet Echo seal on the floor with a counter-turning ring outside it, a magenta column, gold sparks shooting up off the seal to hang, magenta wisps and gold star glints.')
