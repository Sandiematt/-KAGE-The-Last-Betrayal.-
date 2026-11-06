# Raikon charging Raikō no Tachi during a wind-up (Thunder Swing, Storm Break): red lightning is pulled in from the
# air onto the blade tip, the arcs jumping shorter and hotter as the charge tightens, until one glint marks the
# moment before release. The origin is the blade tip; the game plays it there.
import random
from vfxkit.primitives import *
from _raikon import *

GLINT = 36


def recipe():
    layers = [
        shadow('Backing', fade(INK, 150), 1.4, life=34, delay=4, fade_out=4),
        glow('Aura', fade(RED, 140), 1.7, life=GLINT + 2, size_curve=[[0, .2], [88, 1], [100, 1.1]], fade_out=4),
        motes('Gathering motes', 16, (255, 110, 84, 255), color_end=HOT, size=(.08, .15), life=(16, 20), interval=1.5,
              spawn=dict(shape='Sphere', radius=[.9, 1.4]), travel=dict(end=[0, [-1.4, -.9], 0], easing='EaseInQuadratic'),
              turbulence=.0005),
    ]
    # arcs jumping in from the air to the tip, re-struck on new angles, shorter and hotter as the charge tightens
    rnd = random.Random(7)
    count = 11
    for k in range(count):
        born = 3 + 3 * k
        t = k / (count - 1)
        r = 1.15 - .65 * t
        base = rnd.uniform(0, 2 * math.pi)
        color = RED if k < 4 else (255, 150, 130, 255) if k < 8 else HOT
        for j, ang in enumerate((base, base + rnd.uniform(2.2, 4.0))):
            rr = r * (1 if j == 0 else .8)
            a = (math.cos(ang) * rr, math.sin(ang) * rr, rnd.uniform(-.2, .2))
            b = (math.cos(ang) * .06, math.sin(ang) * .06, 0)
            layers.append(seg(f'Inward arc {k + 1}{"ab"[j]}', a, b, .3 + .12 * t, color, born + j, 3, color_end=RED,
                              mirror=1 if (k + j) % 2 == 0 else -1, emissive=1.6 + 1.0 * t))
    layers += [
        wisps('Crackle', RED, .55, count=4, width=.22, life=(12, 15), interval=6, delay=6, size=(.8, 1.1), emissive=2.6),
        glow('Core', (255, 150, 128, 255), .6, life=GLINT - 6, delay=8, size_curve=[[0, .1], [90, 1], [100, 1.2]], fade_out=3, emissive=1.3),
        # the release: one glint
        flash('Glint', WHITE, 1.9, life=5, delay=GLINT, angle=20),
        flash('Glint cross', (255, 220, 210, 255), 1.1, life=4, delay=GLINT, angle=110),
        shock_ring('Release ring', (255, 80, 60, 220), 1.0, life=9, delay=GLINT, thickness=.2),
        radial_sparks('Release sparks', 10, HOT, color_end=RED, distance=(.5, 1.3), life=(6, 9), delay=GLINT),
    ]
    return effect('Raikon_Blade_Charge', 'Raikon Blade Charge', 'element', 'lightning', .75, layers,
                  attach='caster', peak=GLINT / 60, impact=.35, light=(1, .22, .16), delivery=SELF,
                  design='Red motes and arcs are pulled in from the air onto the blade tip, the arcs jumping shorter and '
                         'hotter while a crackling ring tightens and the core heats to white, then one star glint '
                         'marks the release.')
