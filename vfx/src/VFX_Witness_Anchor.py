"""Echo Genesis: an Echo Anchor, one of the three the domain stands on, looping. A tall six-sided crystal of violet light
standing on the floor with white edges, a gold ring turning round its waist (far half behind, near half in front), a
small seal under it, and motes lifting off it. It must read as a thing to strike:
it holds a clear silhouette and never flashes. One 1 s cycle; the game crossfades two copies half a cycle apart and
scales it down as the anchor is damaged."""
from _witness import *

P = 60
M = MAGENTA


def recipe():
    band = dict(flow=-.05, fade_in=10, fade_out=10, emissive=1.8, position=[0, .9, 0])
    return effect('Witness_Anchor', 'Echo Anchor', 'status', 'void', P / 60, [
        decal('Anchor seal', 'T_EchoSeal01', fade(GOLD, 190), 1.4, P, spin=.8, fade_in=10, fade_out=10, emissive=1.6),
        glow('Anchor glow', fade(M['BODY'], 40), 1.1, life=P, fade_in=10, fade_out=10, size_curve=[[0, .95], [50, 1.06], [100, .95]], position=[0, .9, 0]),
        orbit_band('Far ring', GOLD, fade(GOLD, 0), fade(GOLD, 0), .62, .09, P, tilt=(-74, 0, 8), arc=(-90, 90), **band),
        crystal('Crystal', fade(M['BODY'], 120), 1.9, .3, P, edge=fade(M['HOT'], 200), fade_in=10, fade_out=10, spin=[0, 1.5, 0], emissive=1.0),
        orbit_band('Near ring', GOLD, fade(GOLD, 0), fade(GOLD, 0), .62, .09, P, tilt=(-74, 0, 8), arc=(90, 270), **band),
        motes('Lifting motes', 12, M['HOT'], color_end=fade(M['DEEP'], 0), size=(.04, .08), life=(24, 32), distance=(.3, .7), interval=5,
              rise=.0016, position=[0, .6, 0], **UP),
        sparkle('Tip glint', M['CORE'], .28, count=1, life=16, interval=30, delay=4, position=[0, 1.95, 0]),
    ], attach='ground', peak=0, impact=0, light=(.8, .35, 1), loop=True, delivery=dict(kind='area'),
        design='A tall six-sided crystal of violet light with white edges standing on a small gold seal, a gold ring turning round its waist and motes lifting off it.')
