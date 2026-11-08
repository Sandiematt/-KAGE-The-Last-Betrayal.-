"""Phase 1+: Twin Fang / Shadow Flip cut. A sweeping pink arc that sheds a fan of crescent blade-petals along its path,
then a scatter of glowing petals that tumble down through the cut."""
from _sakura import *

ROLL, SWEEP, RADIUS, LEAN = 22, (110, 262), 1.45, -18


def arc_point(angle_deg, radius, offset=(0, 0, .5)):
    """Where slash_set's ring passes at a ring angle (0 up, 90 left, CCW), in the swing plane, and the tangent there."""
    mid = math.radians(sum(SWEEP) / 2); r = math.radians(ROLL)
    def rot(x, y): return x * math.cos(r) - y * math.sin(r), x * math.sin(r) + y * math.cos(r)
    mx, my = rot(-math.sin(mid), math.cos(mid))
    cx, cy = offset[0] - RADIUS * mx, offset[1] - RADIUS * my
    a = math.radians(angle_deg)
    px, py = rot(-math.sin(a), math.cos(a))
    tx, ty = rot(-math.cos(a), -math.sin(a))         # direction of increasing ring angle (the way the blade travels)
    lean = math.radians(LEAN)
    return [cx + radius * px, (cy + radius * py) * math.cos(lean), offset[2] + (cy + radius * py) * math.sin(lean)], (tx, ty)


def blade_fan():
    """Five blade-petals peel off the arc one frame apart, each flung along the swing and drifting outward."""
    layers = []
    for i, angle in enumerate([130, 160, 190, 220, 248]):
        pos, (tx, ty) = arc_point(angle, RADIUS * 1.04)
        heading = math.degrees(math.atan2(ty, tx))
        layers.append(blade(f'Blade petal {i + 1}', length=.95 - .08 * abs(i - 2), life=13, delay=2 + i, angle=heading,
                            billboard='Fixed', rotation=[LEAN, 0, heading], position=pos,
                            travel=dict(start=pos, end=[pos[0] + tx * .55 + pos[0] * .12, pos[1] + ty * .55 + .1, pos[2]], easing='EaseOutQuartic')))
    return layers


def recipe():
    arcs = [l for l in slash_set((fade(DEEP, 170), PINK, CORE), ROLL, sweep=SWEEP, radius=RADIUS, lean=LEAN, delay=1, life=14)
            if l['name'] not in ('Refraction arc', 'Cel crescent')]   # no refraction: the game plays a baked sheet
    for l in arcs:
        if l['name'] == 'Blade body': l['emissive'] = 2.4   # round 1: the pink body was faint next to the white edge
    return effect('Sakura_Slash', 'Sakura Slash', 'slash', 'sakura', 1.0, [
        glow('Blade glint', HOT, .55, life=5, size_curve=[[0, 1], [100, .3]], position=[-.6, .5, .5]),
        *swing(arcs + blade_fan(), yaw=-30),
        flash('Contact flash', CORE, 1.5, life=4, delay=3, angle=ROLL),
        glow('Pink bloom', fade(PINK, 150), 2.3, life=13, delay=2),
        petals('Shed petals', 16, delay=3, life=(30, 46), **spray([[-.4, 1.6], [-.5, .9], [-.3, .3]], radius=.6)),
        matter('Falling petals', 6, delay=6, life=(40, 50), **spray([[-.3, 1.2], [-.8, .4], [-.2, .2]], radius=.5)),
        sparkle('Glints', CORE, .32, count=4, life=12, delay=4, spread=1.1),
    ], peak=.07, impact=.35, light=(1, .45, .75), delivery=MELEE,
        screen=dict(shake=.12, hitstop=.03),
        design='A pink arc sweeps through the target and sheds five crescent blade-petals along its path, then glowing petals tumble down through the cut.')
