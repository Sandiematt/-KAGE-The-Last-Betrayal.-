"""Shared palette and building blocks of KAGE's anime combat set (VFX_Anime_*.py): the cel-shaded toon smoke, the
glowing cyan ground crack and the impact frames that every fight uses (not one boss's element).

Style: flat anime FX. Smoke is solid white with a lavender cel shadow (T_ToonPuffSheet01: it billows, then tears
into hard-edged chunks), never a soft grey haze; energy is a saturated cyan with a white-hot core."""
from vfxkit.primitives import *

# toon smoke (alpha-blended: its value comes from the texture's own white / lavender)
PUFF = (255, 255, 255, 255)
MIST = (214, 220, 240, 255)
STONE = (78, 86, 104, 255)       # rock chips: dark slate, lit cool
ROCK = (30, 34, 46, 255)         # the big chunks: near-black, darker than any glow

# cyan crack energy (the reference: white-hot fissures in a saturated cyan glow, cooling to deep blue)
CORE = (236, 255, 255, 255)
CYAN = (60, 224, 255, 255)
DEEP = (24, 96, 255, 255)
NIGHT = (8, 22, 70, 255)

# impact frame
HOT = (255, 244, 214, 255)
WARM = (255, 196, 110, 255)
AMBER = (255, 132, 30, 255)    # the saturated body of the impact
EMBER = (190, 56, 16, 255)     # its cooling rim


def toon_puffs(name, count, end, size, life, delay=0, color=PUFF, grow=1.18, radius=.12, easing='EaseOutQuartic', **kw):
    """Cel-shaded puffs thrown to random points in the world box `end` ([[x0,x1],[y0,y1],[z0,z1]]): they burst out
    fast and hang (eased travel), billow open and then tear into hard-edged chunks through the flipbook, its frames
    held (no blending between cells) like hand-drawn anime smoke. No noise alpha: Effekseer multiplies an alpha texture
    into the alpha, which turned the solid puffs see-through in noisy grey patches. Upright (no spin) so the lavender shadow always sits on the lower right."""
    fl = max(1, round(sum(life) / 2 / 16))
    return sprite(name, 'T_ToonPuffSheet01', color, count=count, life=list(life), delay=delay, blend='Blend', billboard='Billboard',
                  rotation=[0, 0, [-6, 6]], size=list(size), size_end=[size[0] * grow, size[1] * grow],
                  flipbook=dict(x=4, y=4, frame_length=fl, loop='Once', lerp=False),
                  spawn=dict(shape='Sphere', radius=[0, radius], rotate=False), travel=dict(end=[list(a) for a in end], easing=easing),
                  fade_in=0, fade_out=3) | kw


def floor_ring(name, color, radius, life, delay=0, thickness=.2, **kw):
    """A shock ring lying on the floor (tilted 80 degrees): a thin ellipse racing out in the side view."""
    return tilted_ring(name, color, radius, life=life, delay=delay, tilt=(-80, 0, 0), thickness=thickness, **kw)


def dome_arc(name, color, radius, a0, a1, life, delay=0, width=.06, **kw):
    """One broken stroke of the air dome over a ground blast: a thin camera-facing ring arc from a0 to a1 degrees
    (0 = straight up, clockwise), swelling out fast while its angle span closes from both ends."""
    mid = (a0 + a1) / 2
    return dict(name=name, renderer='Ring', color=list(color), life=life, delay=delay, billboard='Billboard', blend='Blend',
                ring=dict(vertices=64, outer=[radius, 0], inner=[radius - width, 0], center_ratio=.5,
                          outer_color=list(color), center_color=list(color), inner_color=list(color),
                          angle_start=[a0, mid - 4], angle_end=[a1, mid + 4], angle_easing='EaseInQuadratic', angle_fade=[0, 6]),
                size_curve=[[0, .55], [35, .95], [100, 1.12]], fade_in=0, fade_out=life * .4) | kw
