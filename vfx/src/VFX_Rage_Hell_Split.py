"""Onikiri, Hell Splitter: the cleaver comes down and the floor splits open. The rage art plays it where the blade
lands (the fissures and lava pillars that race on are the game's).
A white contact on the floor, a red-hot crack opening under the blow and cooling, a crimson shock ring racing out
along the floor, fire tongues erupting out of the split one after another from the middle outward, a fireball
boiling up and cooling into dark smoke, rock thrown up and landing, embers rising off the scar. Fire: it rises."""
from _rage import *

P = HELL
HIT = 2


def recipe():
    tongues = [flame(f'Fire tongue {i + 1}', P['BODY'], P['DEEP'], s, [24, 30], position=[x, 0, 0], delay=HIT + d)
               for i, (x, s, d) in enumerate([(0, 3.0, 0), (-.7, 2.3, 2), (.7, 2.4, 2), (-1.4, 1.8, 4), (1.4, 1.9, 4), (-2.0, 1.3, 6), (2.0, 1.35, 6)])]
    return effect('Rage_Hell_Split', 'Hell Splitter Impact', 'boss', 'fire', 1.0, [
        smoke('Smoke', (78, 58, 52, 205), count=8, size=(.8, 1.3), life=(30, 44), delay=HIT + 6, rise=.0006, radius=(.2, 1.6), position=[0, .6, 0]),
        flash('Contact flash', P['CORE'], 2.8, life=5, delay=HIT, position=[0, .4, 0]),
        glow('Ground bloom', fade(P['BODY'], 170), 3.4, life=18, delay=HIT, position=[0, .3, 0]),
        decal('Crack', 'T_Crack01', P['HOT'], 4.2, 54, delay=HIT, fade_in=0, fade_out=10, emissive=2.4,
              alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.95, easing='EaseInQuintic'), color_curve=P['COOL']),
        floor_ring('Shock ring', P['BODY'], 5.0, 24, delay=HIT, thickness=.24, alpha_texture='T_NoiseTile01', cutoff=dict(start=0, end=.9, easing='EaseInCubic')),
        *tongues,
        billow('Eruption', ((0, P['CORE']), (18, P['HOT']), (45, P['BODY']), (80, P['DEEP']), (100, fade(P['DEEP']))), 3.0, 30, delay=HIT, position=[0, .7, 0]),
        radial_sparks('Spit embers', 24, P['CORE'], color_end=P['BODY'], distance=(1.2, 2.8), life=(14, 22), delay=HIT, gravity=.0012) | spray([[-2.4, 2.4], [1.2, 3.2], [-.3, .3]], radius=.6),
        debris('Rock', 16, [[-2.6, 2.6], [.8, 2.4], [-.4, .4]], color=P['MATTER'], floor=.02, delay=HIT, life=(30, 44)),
        motes('Rising embers', 16, P['HOT'], color_end=fade(P['DEEP']), size=(.07, .12), life=(26, 36), distance=(.3, 1.2), delay=HIT + 6, rise=.0012, radius=(0, 1.6)),
    ], attach='ground', peak=HIT / 60, impact=.9, light=(1, .4, .2), delivery=dict(kind='area'),
        screen=dict(shake=.9, flash_frames=1, flash='white', hitstop=.08),
        design='A white contact on the floor, a red-hot crack opening and cooling, a crimson ring racing out, fire tongues erupting from the split from the middle outward, a fireball cooling into smoke, rock thrown up, embers rising.')
