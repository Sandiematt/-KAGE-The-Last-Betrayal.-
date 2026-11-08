"""Takashi's gold masks: white shapes on black, written to vfx/textures/generated/ (originals, never edited).

Like the sakura masks (make_sakura_textures.py) these are analytic silhouettes (straight edges, circles and a polar
comma), not painted shapes, so they are math textures in the skill's sense; each one is recorded in
vfx/texture_prompts.json with an image-model prompt so a painted replacement can be dropped in under the same name.

  T_Kunai01       a kunai seen side on, long axis +X, tip at +X: a leaf blade with a hot ridge, a wrapped grip and
                  the ring pommel at -X
  T_GiantBladeV01 a giant straight-backed blade standing point DOWN (long axis -Y): the Blade Rain sword, with a
                  bright hamon edge, a tsuba bar and a short grip at the top
  T_TomoeSeal01   the family seal: a ring, an inner ring and three tomoe commas (the mitsudomoe), for the domain

Process them with:
  vfx process-texture vfx/textures/generated/T_Kunai01.png vfx/textures/processed/T_Kunai01.png --size 256
  vfx process-texture vfx/textures/generated/T_GiantBladeV01.png vfx/textures/processed/T_GiantBladeV01.png --size 256
  vfx process-texture vfx/textures/generated/T_TomoeSeal01.png vfx/textures/processed/T_TomoeSeal01.png --size 512

Run: python vfx/tools/make_takashi_textures.py   (from the game root; needs numpy and Pillow)
"""
from pathlib import Path
import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parents[1] / 'textures' / 'generated'
SS = 4


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
    return np.clip(d / w + .5, 0, 1)


def kunai(n=256):
    x, y = grid(n)
    # the leaf blade: tip at x=.92, widest at x=.18, narrowing to the guard at x=-.12
    t = np.clip((x + .12) / 1.04, 0, 1)
    half = .2 * np.where(t < .29, (t / .29) ** .7, ((1 - t) / .71) ** 1.05)
    blade = smooth(np.minimum(half - np.abs(y), np.minimum(x + .12, .92 - x)), .012)
    ridge = np.exp(-(y / .02) ** 2) * blade
    bval = blade * (.5 + .35 * np.clip(1 - np.abs(y) / .2, 0, 1)) + ridge * .6
    # the grip: a thin bar wrapped in cord (bands), then the ring
    grip = smooth(np.minimum(.035 - np.abs(y), np.minimum(x + .62, -.12 - x)), .01)
    wrap = .55 + .3 * (np.sin(x * 70) > 0)
    r = np.hypot(x + .74, y)
    ring = smooth(.035 - np.abs(r - .1), .01)
    value = np.maximum(np.maximum(bval, grip * wrap), ring * .85)
    save('T_Kunai01', value, n)


def giant_blade(n=256):
    x, y = grid(n)
    # the blade: point at y=-.96, straight back at x=-.07, the edge at x=+.07 curving into the point; grip at the top
    yy = np.clip((y + .96) / 1.56, 0, 1)                   # 0 at the point, 1 at the tsuba (y=.6)
    edge = .075 * np.clip(yy / .14, 0, 1) ** .55
    blade = smooth(np.minimum(np.minimum(edge - x, x + .075 * np.clip(yy / .08, 0, 1) ** .4), np.minimum(y + .96, .6 - y)), .008)
    hamon = np.exp(-((x - edge + .018) / .012) ** 2) * blade
    bval = blade * (.45 + .3 * np.clip((x + .075) / .15, 0, 1)) + hamon * .7
    tsuba = smooth(np.minimum(.17 - np.abs(x), .03 - np.abs(y - .64)), .01)
    grip = smooth(np.minimum(.045 - np.abs(x), np.minimum(y - .66, .95 - y)), .01) * (.55 + .3 * (np.sin(y * 80) > 0))
    value = np.maximum(np.maximum(bval, tsuba * .9), grip)
    save('T_GiantBladeV01', value, n)


def tomoe_seal(n=512):
    x, y = grid(n)
    r, a = np.hypot(x, y), np.arctan2(y, x)
    outer = smooth(.022 - np.abs(r - .9), .008)
    inner = smooth(.012 - np.abs(r - .78), .006)
    ticks = smooth(.012 - np.abs(r - .84), .006) * (np.cos(a * 24) > .6)
    value = np.maximum(np.maximum(outer, inner * .8), ticks * .7)
    for i in range(3):
        c = i * 2 * np.pi / 3
        hx, hy = .34 * np.cos(c), .34 * np.sin(c)
        head = smooth(.13 - np.hypot(x - hx, y - hy), .01)
        # the tail: leaves the head's outer side and sweeps round the centre, thinning to a point
        rel = np.mod(np.arctan2(y, x) - c, 2 * np.pi)
        q = np.clip(rel / 1.9, 0, 1)
        tail = smooth(np.minimum(.11 * (1 - q) - np.abs(r - (.39 + .12 * q)), .02 + 1.9 - rel), .01) * (rel < 1.9)
        value = np.maximum(value, np.maximum(head, tail) * .9)
    save('T_TomoeSeal01', value, n)


if __name__ == '__main__':
    kunai()
    giant_blade()
    tomoe_seal()
