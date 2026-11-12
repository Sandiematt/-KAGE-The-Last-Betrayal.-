"""The anime impact frame for heavy blows and criticals, at the hit point. A two-frame pinch of light, then a
white contact star, a jagged cream-white impact burst that snaps open and is eaten away from its spikes with a hard
edge, radial speed lines thrown out around it and a thin air ring crossing the blow. Warm sparks spray through the
target along the blow (+X; the game mirrors it), and three four-point glints pop and pinch out as it clears."""
from _anime import *

HIT = 2


def recipe():
    return effect('Anime_Impact', 'Anime Impact', 'hit', 'physical', .38, [
        glow('Pinch', fade(HOT, 200), .6, life=3, delay=0, size_curve=[[0, 1.0], [100, .3]]),
        flash('Contact flash', WHITE, 1.5, life=3, delay=HIT, angle=14),
        # the saturated body behind the cream spikes: a larger amber burst turned against it, cooling to a deep orange
        # rim that outlasts the cream (core / body / rim instead of cream on cream). It opens near full size at once,
        # so from the contact frame it is a saturated orange ring round the small white core, not hidden under it
        hard_edge(sprite('Amber body', 'T_Impact01', AMBER, delay=HIT, life=16, size=3.3,
                         size_curve=[[0, .85], [12, 1.0], [100, 1.12]], rotation=[0, 0, [150, 200]], alpha_texture='T_NoiseTile01',
                         color_curve=ramp((0, AMBER), (35, AMBER), (65, EMBER), (100, fade(EMBER, 200)))['color_curve'],
                         fade_in=0, fade_out=4, emissive=1.7), threshold=.2, outline=EMBER, width=.1, erode=(.25, .95)),
        hard_edge(sprite('Impact burst', 'T_Impact01', HOT, color_end=WARM, delay=HIT + 1, life=14, size=2.3,
                         size_curve=[[0, .3], [20, 1.0], [100, 1.1]], rotation=[0, 0, [-25, 25]], alpha_texture='T_NoiseTile01',
                         fade_in=0, fade_out=3, emissive=1.4), threshold=.2, outline=WARM, width=.06, erode=(.1, .95)),
        sprite('Speed lines', 'T_SpeedLines01', HOT, delay=HIT, life=8, size=4.6, size_curve=[[0, .45], [40, 1.0], [100, 1.2]],
               rotation=[0, 0, [0, 360]], fade_in=0, fade_out=5, emissive=1.2),
        tilted_ring('Air ring', fade(HOT, 200), 1.8, life=10, delay=HIT + 1, thickness=.14, tilt=(0, 58, 0)),
        *spark_burst('Sparks', 12, HOT, (255, 120, 40, 255), distance=(1.0, 2.4), life=(8, 12), length=(.45, .9), delay=HIT),
        sparkle('Glints', HOT, .7, count=3, life=14, delay=HIT + 5, spread=.9),
    ], attach='impact', peak=HIT / 60, impact=.8, light=(1, .9, .7), delivery=MELEE,
        screen=dict(shake=.3, flash_frames=1, flash='white', hitstop=.05),
        design='A two-frame pinch, a white contact star, a jagged cream burst over a larger amber body that snap open and erode from their spikes, radial speed lines and an air ring, warm sparks through the target and three glints that pop and pinch out.')
