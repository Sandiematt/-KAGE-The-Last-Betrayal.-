"""A blow landing on the Witness (phases I and II): its echo cracks and sheds. A small white contact, a blue ring
snapping out across the line of the blow, echo cards and thin glass shards spraying back out of the body the way the
blow travels (+X) and hanging, and a few pale motes. A frequent hit: short, never covering the figure."""
from _witness import *

B = BLUE
HIT = 1


def recipe():
    return effect('Witness_Hit', 'Echo Crack', 'hit', 'void', .5, [
        flash('Contact star', B['CORE'], 1.1, life=4, delay=HIT),
        glow('Blue bloom', fade(B['BODY'], 150), 1.3, life=10, delay=HIT),
        tilted_ring('Crack ring', B['HOT'], .9, life=10, delay=HIT, tilt=(0, 60, 0), thickness=.18),
        cards('Shed cards', fade(B['HOT'], 230), 6, (18, 26), delay=HIT, spread=.2, size=(.12, .2)) |
        dict(travel=dict(end=[[.4, 1.6], [-.5, .8], [-.2, .2]], easing='EaseOutQuartic'), spawn=dict(shape='Sphere', radius=[0, .2], rotate=False)),
        sprite('Glass shards', 'T_Shard01', B['HOT'], color_end=fade(B['BODY'], 0), count=8, life=[12, 18], delay=HIT, size=[.07, .15],
               rotation=[0, 0, [-180, 180]], spin=[0, 0, [-12, 12]], fade_in=0, fade_out=6, emissive=1.7) | spray([[.3, 1.4], [-.4, .7], [-.2, .2]], radius=.15),
        motes('Pale motes', 6, B['HOT'], color_end=fade(B['DEEP']), size=(.04, .08), life=(14, 20), distance=(.2, .6), delay=HIT + 3),
    ], peak=HIT / 60, impact=.25, light=(.4, .45, 1), delivery=MELEE,
        design='A small white contact, a blue ring snapping across the blow, echo cards and thin glass shards spraying back out of the body along the blow and hanging.')
