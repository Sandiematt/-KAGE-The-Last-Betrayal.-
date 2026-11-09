"""Phase III: Reality Rewrite, one floor tile being rewritten. A column of hard violet and cyan glitch pixels erupts
from the floor the width of a tile and blinks up to about a man's height, the floor itself tears into a strip of
light, scan lines race up the column, and it dies back into a few hanging pixels. It stands where the tile hurts.
Played on each rewritten tile as it bites; the game draws the tile's warning in canvas before it."""
from _witness import *

V = VIOLET
HIT = 2


def recipe():
    return effect('Witness_Rewrite', 'Rewrite Pillar', 'element', 'void', 1.0, [
        flash('Tear flash', V['CORE'], 1.0, life=4, delay=HIT, position=[0, .1, 0]),
        sprite('Floor tear', 'T_Streak01', V['HOT'], life=34, delay=HIT, position=[0, .05, 0], scale_start=[1.6, 1.4, 1], scale_end=[1.9, .5, 1],
               easing='EaseOutCubic', fade_in=0, fade_out=14, emissive=2.0),
        column('Glitch column', fade(V['BODY'], 110), .5, 2.2, 40, delay=HIT, scroll=(0, -.07), fade_in=0, fade_out=18, emissive=1.6,
               scale_start=[1, .2, 1], scale_curve=[[0, .2], [20, 1.05], [100, 1]]),
        pivot('Pixel source', (0, 1.0, 0), [
            glitch('Pixels violet', V['HOT'], 18, (4, 8), interval=1, delay=HIT, spread=.8, size=(.22, .44)) | dict(spawn=dict(shape='Sphere', radius=[0, .8], rotate=False)),
            glitch('Pixels cyan', CYAN, 10, (3, 6), interval=2, delay=HIT + 2, spread=.9, size=(.18, .36)) | dict(spawn=dict(shape='Sphere', radius=[0, .9], rotate=False)),
        ]),
        *[slice_line(f'Scan {i + 1}', fade(CYAN, 220), .9, width=.03, life=8, delay=HIT + 3 + i * 6, position=[0, .3 + i * .45, 0]) for i in range(4)],
        glitch('Hanging pixels', V['HOT'], 6, (14, 20), delay=HIT + 26, spread=1.0, size=(.18, .3), position=[0, .8, 0]),
    ], attach='ground', peak=HIT / 60, impact=.3, light=(.6, .3, 1), delivery=dict(kind='area'),
        design='A column of hard violet and cyan glitch pixels erupts from a torn strip of floor to about a man\'s height, scan lines race up it and it dies back into a few hanging pixels.')
