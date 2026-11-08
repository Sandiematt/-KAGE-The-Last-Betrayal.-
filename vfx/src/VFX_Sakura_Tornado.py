"""Phase 3: Petal Tornado. The Petal Storm's spiraling column with no tell, looping, narrower and taller, that the
director carries across the floor toward Kage for the move's 3.2 s (AKARI_MOVES.petalTornado: speed 260, width 80).
Low petals are flung off the base and a floor ring pulses each loop, so it reads as travelling, not standing."""
from _sakura import *
from _spiral import storm_layers


def recipe():
    return effect('Sakura_Tornado', 'Petal Tornado', 'boss', 'sakura', 1.4, [
        floor_ellipse('Base glow', fade(DEEP, 190), .95, .35, 84, fade_in=8, fade_out=20),
        *storm_layers(0, 84, radius=.62, height=2.9, pivot_life=84, spin=9),
        petals('Flung petals', 18, interval=4, life=(22, 30), size=(.1, .16), gravity=.0012, position=[0, .25, 0],
               spawn=dict(shape='Circle', radius=[.5, .7], rotate=True), travel=dict(end=[[1.0, 1.6], [.2, .7], 0], easing='EaseOutCubic')),
        tilted_ring('Base pulse', PINK, 1.2, life=16, delay=2, tilt=(-80, 0, 0), thickness=.3),
    ], attach='ground', loop=True, light=(1, .45, .75), delivery=dict(kind='area'),
        design='A narrow column of petals spirals up in torn pink strands over a deep-pink base glow, flinging petals off its foot as it travels across the floor.')
