"""Phase 1+: where a petal shot lands. A small white contact, a pink ring, blade splinters thrown on through the
target, one blossom popping open and a scatter of petals that drift down."""
from _sakura import *


def recipe():
    return effect('Sakura_Petal_Impact', 'Petal Impact', 'hit', 'sakura', .7, [
        flash('Contact flash', CORE, 1.15, life=4, delay=1),
        glow('Pink bloom', fade(PINK, 170), 1.6, life=11, delay=1),
        shock_ring('Pink ring', PINK, .95, life=11, delay=1, thickness=.28),
        # two splinter tiers: a few long white streaks gone in 8 frames, then the pink body that droops
        radial_sparks('Splinter streaks', 4, CORE, color_end=HOT, life=(6, 9), width=.05, length=(.5, .8), delay=1, fade_out=3,
                      emissive=2.2, spawn=screen_circle((0, .1)), travel=dict(end=[[1.0, 1.7], 0, 0], easing='EaseOutQuartic')),
        radial_sparks('Splinters', 9, HOT, color_end=DEEP, life=(12, 18), length=(.25, .45), delay=1, gravity=.001,
                      spawn=screen_circle((0, .1)), travel=dict(end=[[.5, 1.2], 0, 0], easing='EaseOutQuartic')),
        blossom('Blossom pop', .85, life=16, delay=2),
        petals('Scatter', 12, delay=2, life=(24, 36), size=(.1, .17), gravity=.0009,
               spawn=screen_circle((0, .15)), travel=dict(end=[[.4, 1.1], 0, 0], easing='EaseOutCubic')),
    ], attach='body', peak=.03, impact=.3, light=(1, .45, .75), delivery=dict(kind='projectile', projectile='VFX_Sakura_Petal_Shot'),
        design='A short white contact and a pink ring, splinters thrown outward, a blossom pops open and falls apart while petals drift down.')
