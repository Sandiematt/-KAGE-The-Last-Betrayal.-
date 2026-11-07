"""Shared palette and bolt construction for Raikon, the Lightning Ascendant (KAGE, Act I boss).

One colour family for every Raikon effect: a white-hot core with a red cast, a saturated blood-red body, a deep red the
light cools into, an ink-red dark for backing and scorch, and warm grey ash.

Bolts are never drawn in Python. Each one is a chain of the painted electric strand T_ArcStrand01 (measured vertical,
touching both ends of the card, 90 deg), one card per segment, aimed from point to point on a DirectionalBillboard with
an imperceptible velocity (the verified charge_chain technique). The chain gives the bolt its large zig-zag; the
painted strand gives every segment its fine one. A re-strike is a different point set, mirrored, never the same
shape slid or scaled.
"""
import math
import random
from vfxkit.primitives import *

HOT = (255, 236, 228, 255)    # core: white with a red cast
RED = (255, 40, 28, 255)      # body: saturated red lightning
DEEP = (150, 8, 12, 255)      # the body cooling: deep blood red
INK = (26, 4, 8, 255)         # dark: ink-red backing and scorch
ASH = (104, 86, 88, 255)      # matter: smoke, ash, dust
STONE = (92, 80, 78, 255)     # matter: rooftop debris


def jag(a, b, n, amp, seed, taper=0.0):
    """n segments from a to b: the inner points pushed sideways (perpendicular, in the camera plane x/y) by up to
    amp metres, deterministic per seed. taper > 0 shrinks the push toward b (a bolt pinned to its strike point)."""
    rnd = random.Random(seed)
    dx, dy = b[0] - a[0], b[1] - a[1]
    length = math.hypot(dx, dy) or 1.0
    px, py = -dy / length, dx / length
    pts = [list(a)]
    for i in range(1, n):
        t = i / n
        k = amp * (1 - taper * t) * (rnd.random() * 2 - 1)
        pts.append([a[0] + dx * t + px * k, a[1] + dy * t + py * k, a[2] + (b[2] - a[2]) * t])
    pts.append(list(b))
    return pts


def seg(name, a, b, width, color, delay, life, color_end=None, mirror=1, emissive=2.6, **kw):
    """One strand card from a to b (pivot at a, +Y aimed at b)."""
    d = [q - p for p, q in zip(a, b)]
    n = math.sqrt(sum(c * c for c in d)) or 1.0
    vel = [c / n * 1e-4 for c in d]
    base = dict(life=life, delay=delay, billboard='DirectionalBillboard', pivot='bottom', position=list(a), velocity=vel,
                scale_start=[width * mirror, n, 1], fade_in=0, fade_out=1, emissive=emissive)
    if color_end is not None:
        base['color_end'] = list(color_end)
    return sprite(name, 'T_ArcStrand01', color, **(base | kw))


def bolt(name, pts, width, color, delay, life, color_end=None, mirror=1, taper=0.0, **kw):
    """A whole bolt along a point chain: one strand per segment, alternately mirrored so neighbouring segments never
    repeat the painted zig-zag. taper narrows the far end (a fork thinning out)."""
    out = []
    count = len(pts) - 1
    for i in range(count):
        w = width * (1 - taper * i / max(1, count))
        m = mirror * (1 if i % 2 == 0 else -1)
        out.append(seg(f'{name} {i + 1}', pts[i], pts[i + 1], w, color, delay, life, color_end=color_end, mirror=m, **kw))
    return out


def pivot(name, pos, layers):
    """A renderer-less parent at pos. travel.end is an absolute local position (engine conventions), so a particle
    layer that both sets `position` and travels is pulled back toward the origin; under a pivot it travels from pos."""
    from vfxkit.primitives import lifetime
    return dict(name=name, renderer='None', life=max(lifetime(l) for l in layers), position=list(pos), children=list(layers))
