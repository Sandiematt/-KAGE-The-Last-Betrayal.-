"""Atmosphere: a low anime mist bank rolling across the arena floor. Flattened cel-shaded cloud lobes in a pale
blue-white fade in along the floor and drift slowly downwind (+X), billowing through the toon puff flipbook played
slowly (frames blended for a soft drift), and finally tear into hard-edged scraps. Translucent and low (under the fighters' knees): the game keeps a
few of these rolling across each stage at different depths, staggered so the floor never loops visibly."""
from _anime import *

L = 200


def recipe():
    banks = []
    for i, (x, w, h, d) in enumerate([(-1.9, 2.4, .75, 0), (-.4, 3.0, .9, 18), (1.3, 2.2, .7, 34), (2.6, 1.8, .6, 50)]):
        banks.append(sprite(f'Bank {i + 1}', 'T_ToonPuffSheet01', fade(MIST, 110), life=L - d, delay=d, blend='Blend', billboard='Billboard',
                            position=[x, h * .28, -.2 * i], scale_start=[w, h, 1], scale_end=[w * 1.25, h * 1.1, 1], easing='Linear',
                            flipbook=dict(x=4, y=4, frame_length=max(1, round((L - d) / 16)), loop='Once', lerp=True),
                            velocity=[.006, 0, 0], fade_in=40, fade_out=50))
    return effect('Anime_Mist_Bank', 'Anime Mist Bank', 'status', 'physical', L / 60, [
        *banks,
        sprite('Wisps', 'T_ToonPuff01', fade(MIST, 80), count=6, life=[90, 120], delay=10, blend='Blend', billboard='Billboard',
               scale_start=[.7, .3, 1], scale_end=[1.1, .4, 1], easing='Linear', velocity=[.009, .0006, 0],
               spawn=dict(shape='Line', start=[-2.4, 0, 0], end=[2.4, 0, 0], division=8, order='Random', noise=.2), position=[0, .3, .2],
               fade_in=25, fade_out=35),
    ], attach='ground', peak=0, impact=0, light=(1, 1, 1), delivery=dict(kind='area'),
        design='Flattened pale blue-white toon cloud lobes fade in low along the floor, billow slowly as they drift downwind, and tear into hard-edged scraps as they go.')
