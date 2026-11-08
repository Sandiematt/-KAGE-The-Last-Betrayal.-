"""Akari's sakura masks: white shapes on black, written to vfx/textures/generated/ (originals, never edited).

These are analytic silhouettes (circle intersections and a polar petal), not painted shapes, so they are math
textures in the skill's sense; each one is still recorded in vfx/texture_prompts.json with an image-model prompt
so a painted replacement can be dropped in under the same name. Process them with:

  vfx process-texture vfx/textures/generated/T_SakuraPetal01.png vfx/textures/processed/T_SakuraPetal01.png --size 128
  vfx process-texture vfx/textures/generated/T_SakuraBlossom01.png vfx/textures/processed/T_SakuraBlossom01.png --size 256
  vfx process-texture vfx/textures/generated/T_PetalBlade01.png vfx/textures/processed/T_PetalBlade01.png --size 256

Run: python vfx/tools/make_sakura_textures.py   (from the game root; needs numpy and Pillow)
"""
from pathlib import Path
import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parents[1] / 'textures' / 'generated'   # vfx/textures/generated
SS = 4  # supersampling for clean edges


def grid(n):
    s = n * SS
    y, x = np.mgrid[0:s, 0:s].astype(np.float64)
    return (x + .5) / s * 2 - 1, 1 - (y + .5) / s * 2   # x right, y up, both -1..1


def save(name, value, n):
    v = np.clip(value, 0, 1)
    img = Image.fromarray((v * 255).astype(np.uint8), 'L').resize((n, n), Image.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True)
    img.convert('RGB').save(OUT / f'{name}.png')
    print('wrote', OUT / f'{name}.png')


def smooth(d, w):
    """0 outside, 1 inside, soft over w (d is a signed distance-like value, positive inside)."""
    return np.clip(d / w + .5, 0, 1)


def petal_field(px, py):
    """One sakura petal, base at y=-0.85, tip lobes at y~0.85 with the V notch in the middle. Returns (mask, value)."""
    t = (py + .85) / 1.7                                  # 0 at the base, 1 at the top
    width = .62 * np.clip(np.sin(np.clip(t, 0, 1) * np.pi * .78), 0, 1) ** .8   # narrow base, widest near the top
    top = .85 - .55 * px ** 2 - .32 * np.clip(1 - np.abs(px) / .2, 0, 1)       # rounded lobes with a centre notch
    inside = np.minimum(width - np.abs(px), np.minimum(top - py, py + .85))
    mask = smooth(inside, .035)
    # internal value: a hot spine from the base up the centre, cooler toward the rim (so Add reads core -> body)
    rim = np.clip(inside / .25, 0, 1)
    spine = np.exp(-(px / .12) ** 2) * np.clip(1 - t * .9, 0, 1)
    value = mask * (.55 + .3 * rim + .35 * spine)
    return mask, np.clip(value, 0, 1)


def sakura_petal(n=128):
    x, y = grid(n)
    _, v = petal_field(x / .9, y / .9)
    save('T_SakuraPetal01', v, n)


def sakura_blossom(n=256):
    x, y = grid(n)
    total = np.zeros_like(x)
    for i in range(5):
        a = np.radians(90 + i * 72)
        # rotate into the petal's frame: petal axis points outward from the centre
        ca, sa = np.cos(a - np.pi / 2), np.sin(a - np.pi / 2)
        lx, ly = ca * x + sa * y, -sa * x + ca * y
        _, v = petal_field(lx / .5, (ly - .47) / .5)
        total = np.maximum(total, v * .9)
    r = np.hypot(x, y)
    total = np.maximum(total, smooth(.13 - r, .03) * .55)          # the cup: a dimmer ring
    for i in range(7):                                             # stamens: small hot dots round the centre
        a = np.radians(i * 360 / 7 + 10)
        d = np.hypot(x - .09 * np.cos(a), y - .09 * np.sin(a))
        total = np.maximum(total, smooth(.028 - d, .012))
    save('T_SakuraBlossom01', total, n)


def petal_blade(n=256):
    """A long, thin crescent blade-petal: inside circle A, outside circle B (both centred below), so it bows upward,
    pointed at both ends, with a white-hot spine along its outer edge. Long axis is +X."""
    x, y = grid(n)
    # A lune: both circles pass through the tips (+-0.86, -0.01), so the band is thickest mid-way and pointed at
    # both ends. Outer arc tops out at y=0.30, inner at y=0.18.
    ra, ca = 1.35, -1.05          # outer arc
    rb, cb = 2.041, -1.861        # inner arc
    da = ra - np.hypot(x, y - ca)
    db = np.hypot(x, y - cb) - rb
    inside = np.minimum(da, db)
    mask = smooth(inside, .01)
    # thickness tapers to points; spine hugs the outer (upper) edge
    spine = np.exp(-(da / .022) ** 2) * mask
    body = mask * (.45 + .55 * np.clip(1 - np.abs(x) / .9, 0, 1) ** .6)
    value = np.clip(np.maximum(body, spine), 0, 1)
    save('T_PetalBlade01', value, n)
    # The same blade standing up (long axis +Y, bowing left): for DirectionalBillboard bursts, which align +Y with
    # the motion, and for blades that grow from their base (pivot bottom).
    save('T_PetalBladeV01', np.rot90(value), n)


if __name__ == '__main__':
    sakura_petal()
    sakura_blossom()
    petal_blade()
