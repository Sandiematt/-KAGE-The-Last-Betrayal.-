"""The anime ground crack: a finishing blow (a critical, a slam) breaks the floor open and light pours out of it.
A white contact, then a shattered web of fissures snaps open across the floor, white-hot in its centre and saturated
cyan outward, over a soft cyan pool. Fans of light shafts rise out of the break, a thin shock ring races out along
the floor, dark rock chips are thrown up and land, cyan sparks spit up. The fissures cool from white to cyan to deep
blue and are eaten away from their thin ends, while a few cyan motes keep drifting up. Big near-black rock chunks,
darker than any glow, burst out and up, brake, fall and settle round the fissures by about f48."""
from _anime import *

HIT = 2
L = 80


def recipe():
    return effect('Anime_Ground_Crack', 'Anime Ground Crack', 'element', 'lightning', 1.45, [
        decal('Floor pool', 'T_SoftCircle', fade(CYAN, 120), 5.4, L - 6, delay=HIT, fade_in=2, fade_out=36, emissive=1.1,
              color_curve=ramp((0, fade(CYAN, 140)), (40, fade(DEEP, 110)), (100, fade(NIGHT, 0)))['color_curve']),
        decal('Crack halo', 'T_CrackWeb01Glow', fade(CYAN, 210), 4.9, L - 4, delay=HIT, fade_in=0, fade_out=30, emissive=1.7,
              size_curve=[[0, .5], [7, 1.0], [100, 1.04]],
              color_curve=ramp((0, fade(CYAN, 230)), (12, fade(CYAN, 190)), (55, fade(DEEP, 150)), (100, fade(NIGHT, 0)))['color_curve']),
        decal('Crack web', 'T_CrackWeb01', CORE, 4.5, L, delay=HIT, fade_in=0, fade_out=12, emissive=2.6,
              size_curve=[[0, .45], [6, 1.0], [100, 1.02]], alpha_texture='T_NoiseTile01',
              cutoff=dict(start=.02, end=.92, easing='EaseInQuartic'), edge=dict(color=list(CYAN), threshold=.1, scaling=2),
              color_curve=ramp((0, CORE), (7, CYAN), (55, DEEP), (100, fade(NIGHT, 160)))['color_curve']),
        flash('Contact flash', CORE, 2.2, life=4, delay=HIT, position=[0, .25, 0]),
        glow('Break bloom', fade(CYAN, 110), 2.6, life=14, delay=HIT, position=[0, .3, 0]),
        # light pouring out of the break: a wide fan that climbs and a narrow hot one that is gone sooner
        standing('Ray fan', 'T_LightRays01', fade(CYAN, 220), (4.6, 3.6), 44, delay=HIT + 1, position=[0, -.45, 0],
                 scale_start=[4.2, 1.4, 1], scale_end=[5.0, 4.0, 1], easing='EaseOutCubic', fade_in=2, fade_out=26, emissive=1.6,
                 color_curve=ramp((0, fade(CORE, 230)), (20, fade(CYAN, 220)), (100, fade(DEEP, 0)))['color_curve']),
        standing('Ray core', 'T_LightRays01', fade(CORE, 180), (2.4, 2.6), 16, delay=HIT, position=[0, -.3, 0],
                 scale_start=[2.2, 1.0, 1], scale_end=[2.6, 3.0, 1], easing='EaseOutQuartic', fade_in=0, fade_out=12, emissive=1.8,
                 color_curve=ramp((0, fade(CORE, 180)), (30, fade(CYAN, 170)), (100, fade(CYAN, 0)))['color_curve']),
        floor_ring('Shock ring', CYAN, 3.6, 14, delay=HIT, thickness=.1),
        # rock thrown out of the break: big near-black chunks that burst out and up fast, brake, fall and settle by
        # about f48, then smaller slate chips
        debris('Rock chunks', 9, [[-2.6, 2.6], [1.0, 2.2], [-.4, .4]], color=ROCK, size=(.3, .6), floor=.05, delay=HIT, life=(46, 50),
               gravity=.0055) | dict(travel=dict(end=[[-2.6, 2.6], [1.0, 2.2], [-.4, .4]], easing='EaseOutQuartic')),
        debris('Rock chips', 12, [[-2.4, 2.4], [1.2, 3.0], [-.4, .4]], color=STONE, size=(.12, .3), floor=.02, delay=HIT, life=(36, 46)),
        radial_sparks('Spit sparks', 16, CORE, color_end=CYAN, distance=(1.0, 2.4), life=(12, 20), length=(.3, .6), width=.06,
                      delay=HIT, gravity=.0022) | spray([[-2.0, 2.0], [1.2, 2.8], [-.3, .3]], radius=.6),
        motes('Rising motes', 14, CYAN, color_end=fade(DEEP), size=(.06, .12), life=(40, 60), distance=(.6, 1.6), delay=HIT + 8,
              rise=.0012, radius=(0, 1.8), hemisphere=True),
    ], attach='ground', peak=HIT / 60, impact=.85, light=(.3, .85, 1), delivery=dict(kind='area'),
        screen=dict(shake=.6, flash_frames=1, flash='white', hitstop=.06),
        design='A white contact, then a shattered web of fissures snaps open across the floor, white-hot in the centre and cyan outward, light shafts fan up out of the break, a shock ring races out, rock chips fly and land, and the fissures cool to deep blue and erode while cyan motes drift up.')
