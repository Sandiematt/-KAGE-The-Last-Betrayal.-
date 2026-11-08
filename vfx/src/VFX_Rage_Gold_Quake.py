"""Iwakudaki, Golden Earthbreaker: the hammer's golden ground impact. The rage art plays it three times, larger each
time, as the three shockwaves race out.
A golden rune seal lit on the floor under the hammer, a white contact, three rings of gold racing out along the floor
one after another (the first widest), short shafts of gold light standing up off the floor, boulders thrown up and
landing hard, gold chips flying, a wall of dust and gold dust rising and hanging. Earth: heavy matter that lands,
ground-bound waves; unlike Takashi's holy gold, nothing rises as a pillar or a halo."""
from _rage import *

P = QUAKE
HIT = 2


def recipe():
    shafts = [standing(f'Light shaft {i + 1}', 'T_Glow01', fade(P['HOT'], 220), (.42, 2.2 - abs(x) * .3), 16, delay=HIT + 2 * i, position=[x, 0, 0], fade_in=2, emissive=1.8)
              for i, x in enumerate([-1.7, -.6, .55, 1.6])]
    return effect('Rage_Gold_Quake', 'Golden Earthbreaker', 'boss', 'earth', 1.15, [
        smoke('Dust wall', (170, 142, 104, 200), count=10, size=(.9, 1.4), life=(30, 44), delay=HIT + 2, rise=.0004, radius=(.4, 3.0), position=[0, .3, 0]),
        decal('Rune seal', 'T_Rune02', P['HOT'], 3.2, 54, delay=0, fade_in=4, fade_out=20, emissive=2.0, color_curve=P['SOFT']),
        decal('Fault', 'T_Crack01', P['BODY'], 5.0, 60, delay=HIT, fade_in=0, fade_out=12, emissive=2.0, alpha_texture='T_NoiseTile01',
              cutoff=dict(start=.05, end=.9, easing='EaseInQuartic'), edge=dict(color=[255, 236, 170, 255], threshold=.08, scaling=2), color_curve=P['COOL']),
        flash('Contact flash', P['CORE'], 2.6, life=5, delay=HIT, position=[0, .4, 0]),
        glow('Gold bloom', fade(P['BODY'], 160), 3.2, life=16, delay=HIT, position=[0, .4, 0]),
        floor_ring('First wave', P['BODY'], 6.0, 26, delay=HIT, thickness=.3, alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.85, easing='EaseInCubic')),
        floor_ring('Second wave', P['HOT'], 4.6, 24, delay=HIT + 8, thickness=.2),
        floor_ring('Third wave', P['BODY'], 3.2, 22, delay=HIT + 16, thickness=.16),
        *shafts,
        debris('Boulders', 14, [[-3.0, 3.0], [1.0, 2.6], [-.5, .5]], color=P['MATTER'], size=(.2, .42), floor=.02, delay=HIT, life=(34, 46)),
        radial_sparks('Gold chips', 22, P['CORE'], color_end=P['BODY'], distance=(1.2, 2.8), life=(14, 22), delay=HIT, gravity=.0018) | spray([[-2.6, 2.6], [1.2, 3.0], [-.3, .3]], radius=.8),
        motes('Gold dust', 16, P['HOT'], color_end=fade(P['DEEP']), size=(.07, .12), life=(28, 40), distance=(.3, 1.4), delay=HIT + 8, rise=.001, radius=(0, 2.2)),
    ], attach='ground', peak=HIT / 60, impact=.95, light=(1, .8, .35), delivery=dict(kind='area'),
        screen=dict(shake=.9, flash_frames=1, flash='white', hitstop=.08),
        design='A golden rune seal lights under the hammer, a white contact, three gold rings race out along the floor one after another, shafts of gold light stand up, boulders are thrown up and land, dust rolls out.')
