"""The Witness's masks (KAGE final boss, 2026-11-09 four-phase redesign): white shapes on black, written to
vfx/textures/generated/ (originals, never edited).

Like Takashi's and the sakura masks these are analytic silhouettes (straight edges, rings and squares), not painted
shapes, so they are math textures in the skill's sense; each one is recorded in vfx/texture_prompts.json with an
image-model prompt so a painted replacement can be dropped in under the same name.

  T_EchoCard01   one of the halo's echo cards from the reference sheets: a tall rectangle frame, long axis +Y, with a
                 diamond in the middle and a short bar at each end (Orbit Blades, the halo shards)
  T_GlitchPix01  a loose cluster of hard square pixels of mixed sizes (the Reality Editor's glitch break-up)
  T_EchoSeal01   the Echo System seal: an outer ring, a ring of segments with gaps, a ring of tick marks, an inner
                 ring and a triangle (the Witness's chest emblem) for the True Witness's floor seal and Echo Genesis

Process them with:
  vfx process-texture vfx/textures/generated/T_EchoCard01.png vfx/textures/processed/T_EchoCard01.png --size 256
  vfx process-texture vfx/textures/generated/T_GlitchPix01.png vfx/textures/processed/T_GlitchPix01.png --size 256
  vfx process-texture vfx/textures/generated/T_EchoSeal01.png vfx/textures/processed/T_EchoSeal01.png --size 512

Run: python vfx/tools/make_witness_textures.py   (from the game root; needs numpy and Pillow)
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


def box(x, y, hw, hh):
    """1 inside the axis-aligned box, soft edge."""
    return smooth(np.minimum(hw - np.abs(x), hh - np.abs(y)), .012)


def card(n=256):
    x, y = grid(n)
    hw, hh, t = .3, .86, .07
    frame = np.clip(box(x, y, hw, hh) - box(x, y, hw - t, hh - t), 0, 1)
    dia = smooth(.2 - (np.abs(x) / .62 + np.abs(y)) * .62, .012)          # the diamond in the middle
    dia_in = smooth(.09 - (np.abs(x) / .62 + np.abs(y)) * .62, .012)
    bars = box(x, y - .62, .14, .025) + box(x, y + .62, .14, .025)       # a short bar at each end
    inner = box(x, y, hw - t * 1.9, hh - t * 1.9) * .22                  # a faint fill so the card reads as a plate
    return np.clip(frame + dia - dia_in * .55 + bars + inner, 0, 1)


def glitch(n=256):
    x, y = grid(n)
    rng = np.random.default_rng(11)
    v = np.zeros_like(x)
    for _ in range(46):
        cx, cy = rng.normal(0, .38, 2)
        s = rng.choice([.03, .045, .06, .09, .12], p=[.3, .25, .2, .15, .1])
        w = s * rng.choice([1, 1, 1, 2.6, 4.2])                           # some pixels smear sideways into bars
        v = np.maximum(v, box(x - cx, y - cy, w, s) * rng.uniform(.55, 1))
    fall = np.clip(1.15 - np.hypot(x, y), 0, 1)                           # thinning toward the border
    return v * fall


def seal(n=512):
    x, y = grid(n)
    r, a = np.hypot(x, y), np.arctan2(y, x)
    ring = lambda R, w: smooth(w - np.abs(r - R), .006)
    v = ring(.93, .022) + ring(.86, .008) + ring(.5, .012) + ring(.44, .006)
    # a ring of 12 segments with gaps between .64 and .78
    seg = (np.mod(a / (2 * np.pi) * 12, 1) < .78) * smooth(.07 - np.abs(r - .71), .006)
    # tick marks between the outer rings
    ticks = (np.abs(np.mod(a / (2 * np.pi) * 72 + .5, 1) - .5) < .09) * smooth(.025 - np.abs(r - .895), .004)
    # long spokes at the quarters
    spoke = (np.abs(np.mod(a / (2 * np.pi) * 4 + .5, 1) - .5) < .018) * (r > .5) * (r < .93)
    # the chest emblem: a triangle in the inner ring, point up
    tri_d = np.maximum.reduce([-(y + .2), (x * .866 + y * .5) - .2, (-x * .866 + y * .5) - .2])
    tri = smooth(.02 - np.abs(tri_d), .006) * (r < .44)
    return np.clip(v + seg + ticks + spoke + tri, 0, 1)


if __name__ == '__main__':
    save('T_EchoCard01', card(), 256)
    save('T_GlitchPix01', glitch(), 256)
    save('T_EchoSeal01', seal(), 512)
