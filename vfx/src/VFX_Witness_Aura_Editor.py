"""Phase III, The Reality Editor: the Witness coming apart into digital shards, looping. Drawn behind the body by the
game, so it reads round the figure: a violet seal on the floor broken by glitch pixels, a wide ring of light round the
body torn into separate arcs that jump, violet flame wisps with a cyan edge licking up past the crown, hard glitch
pixels in violet, cyan and white blinking on and off well outside the body with no fade and no motion (a broken
signal, never drifting particles), cyan scan lines racing up past it, and a violet column behind it all. One 1 s cycle;
the game crossfades two copies half a cycle apart."""
from _witness import *

P = 60
V = VIOLET


def recipe():
    arcs = [orbit_band(f'Torn arc {i + 1}', fade(V['HOT'], 220), fade(V['BODY'], 0), fade(V['BODY'], 0), 1.1 + .08 * (i % 2), .1, P,
                       tilt=(-70, 0, 8), arc=(a, a + 60), position=[0, .9 + .05 * i, 0], flow=-.08, fade_in=8, fade_out=8, emissive=1.9)
            for i, a in enumerate((0, 95, 190, 280))]
    return effect('Witness_Aura_Editor', 'Reality Editor Aura', 'status', 'void', P / 60, [
        mantle(V['BODY'], 70, 5.2, P, y=1.3),
        decal('Broken seal', 'T_EchoSeal01', fade(V['HOT'], 200), 3.0, P, spin=-.6, fade_in=10, fade_out=10, emissive=1.6),
        decal('Seal pixels', 'T_GlitchPix01', fade(CYAN, 200), 3.4, P, fade_in=10, fade_out=10, emissive=1.6, position=[0, .06, 0]),
        floor_light(CYAN, 1.4, P, alpha=150),
        column('Violet column', fade(V['BODY'], 95), .7, 2.9, P, scroll=(.004, -.04), fade_in=10, fade_out=10, emissive=1.3),
        *arcs,
        wisps('Torn wisps', fade(V['HOT'], 220), 1.2, count=8, width=.24, sweep=(0, 150), life=(16, 22), interval=6, delay=1,
              tilt=((-20, 20), (0, 360), (70, 110)), position=[0, 1.9, 0], broken=.3),
        wisps('Cyan edges', fade(CYAN, 200), 1.0, count=5, width=.12, sweep=(0, 120), life=(14, 20), interval=10, delay=4,
              tilt=((-20, 20), (0, 360), (70, 110)), position=[0, 1.7, 0], broken=.35),
        glitch('Glitch violet', V['HOT'], 20, (4, 7), interval=3, spread=2.0, size=(.3, .6), position=[0, 1.3, 0]),
        glitch('Glitch cyan', CYAN, 14, (3, 6), interval=4, delay=2, spread=2.1, size=(.26, .5), position=[0, 1.2, 0]),
        glitch('Glitch white', V['CORE'], 6, (2, 3), interval=9, delay=5, spread=1.6, size=(.16, .28), position=[0, 1.4, 0]),
        *[slice_line(f'Scan {i + 1}', fade(CYAN, 200), 2.4, width=.025, life=8, delay=7 + i * 13, position=[0, .2 + i * .55, 0]) for i in range(4)],
        cards('Breaking cards', fade(V['HOT'], 210), 4, (20, 26), delay=3, interval=14, spread=1.6, position=[0, 1.5, 0],
              cutoff=dict(start=.15, end=.9, easing='EaseInQuadratic')),
    ], attach='caster_ground', peak=0, impact=0, light=(.6, .3, 1), loop=True, delivery=SELF,
        design='A violet floor seal broken by glitch pixels, a wide ring round the body torn into jumping arcs, violet flame wisps with cyan edges past the crown, hard glitch pixels blinking well outside the body and cyan scan lines racing up.')
