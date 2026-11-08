"""Phase 2+: Poison Trap / False Opening's thrown line, as a ground-skimming blossom ribbon. A spinning blossom races
along the floor, a deep-pink ribbon of light unrolls behind it, blossoms bloom open along the path and petals kick up.
Impact: VFX_Sakura_Pillar erupts where it stops."""
from _sakura import *


def recipe():
    head = sustain(blossom('Head blossom', .55, life=6, spin=[0, 0, 9], cutoff=None, size_curve=None, color_curve=None,
                           fade_in=1, fade_out=2, position=[0, .18, 0]), 3)
    return effect('Sakura_Ribbon', 'Blossom Ribbon', 'projectile', 'sakura', 1.2, [
        sustain(glow('Head glow', fade(PINK, 200), 1.0, life=6, fade_in=1, fade_out=3, position=[0, .15, 0]), 3),
        head,
        sustain(dict(name='Light ribbon', renderer='Track', texture=tex('T_Trail01'), color=list(DEEP), life=22,
                     track_size=[.05, .22, .05], position=[0, .08, 0], fade_in=0, fade_out=14, emissive=1.8, inherit=TRAIL,
                     alpha_texture=tex('T_NoiseStreak01'), alpha_scroll=[-.04, 0], cutoff=dict(start=0, end=.8, easing='EaseInQuadratic')), 1),
        sustain(blossom('Path blossoms', .42, life=30, position=[0, .1, [-.1, .1]], inherit=TRAIL), 4),
        sustain(petals('Kicked petals', 1, life=(22, 30), size=(.1, .16), gravity=.0011, position=[0, .05, 0],
                       velocity=[[-.012, .004], [.012, .026], [-.004, .004]], inherit=TRAIL), 2),
    ], attach='projectile', flight=.55, delivery=dict(kind='projectile'),
        design='A spinning blossom races along the floor; a deep-pink ribbon of light unrolls behind it while blossoms bloom open on the path and petals kick up and fall.')
