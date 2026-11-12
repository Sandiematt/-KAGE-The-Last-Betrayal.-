"""KAGE anime combat masks: the shared ground / impact / atmosphere set (VFX_Anime_*.py).

Every shape here is analytic (unions of discs, Voronoi cell edges, tapered arcs, angular ray bands), so these are math
textures in the skill's sense, not painted ones. Each is also recorded in vfx/texture_prompts.json with an image-model
prompt, so a painted replacement can be dropped in later under the same name.

  T_ToonPuffSheet01  4x4 flipbook (1024): a cel-shaded anime cloud puff. White lobes, each with a lavender shadow
                     crescent on its lower-right rim (light from the upper left). It billows open over the first half,
                     rises a little, then lobes shrink at their own rates while a blobby hard-cut erosion tears holes
                     through it, so it breaks into separate chunks instead of fading. RGBA colour texture.
  T_ToonPuff01       one held puff (256), the same lobes and shading: dust bits, flying droplets, mist banks. RGBA.
  T_ToonSwoosh01     ground wind streaks (512): tapered strokes fanning out left and right from the centre along the
                     floor, their outer ends lifting. Symmetric, so one sprite covers both sides. White mask.
  T_CrackWeb01       a ground fracture web seen from above (512): Voronoi cell edges, dense and bright in the centre
                     and sparse and thin outward, plus jagged radial cracks running past the web. White mask.
  T_CrackWeb01Glow   the same web blurred into a soft halo for the glow under the crack. White mask.
  T_LightRays01      a fan of soft light shafts (256) rising from a wide base at the bottom edge, fading upward and to
                     the sides: the rays escaping the crack. White mask.

Greyscale masks are written to vfx/textures/generated/ and processed with:
  vfx process-texture vfx/textures/generated/T_ToonSwoosh01.png vfx/textures/processed/T_ToonSwoosh01.png --size 512
  vfx process-texture vfx/textures/generated/T_CrackWeb01.png vfx/textures/processed/T_CrackWeb01.png --size 512
  vfx process-texture vfx/textures/generated/T_CrackWeb01Glow.png vfx/textures/processed/T_CrackWeb01Glow.png --size 512
  vfx process-texture vfx/textures/generated/T_LightRays01.png vfx/textures/processed/T_LightRays01.png --size 256
The two RGBA colour puffs are written straight to processed/ (and their originals to generated/): process-texture keys
alpha from luminance, which would turn the lavender shading translucent.

Run: python vfx/tools/make_anime_textures.py   (from the game root; needs numpy and Pillow)
"""
from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
GEN = ROOT / 'textures' / 'generated'
PRO = ROOT / 'textures' / 'processed'
SS = 4
WHITE = np.array([255, 255, 255], np.float64)
SHADE = np.array([190, 186, 228], np.float64)   # lavender cel shadow (the reference's cool underside)
rng = np.random.default_rng(1729)


def grid(n, ss=SS):
    s = n * ss
    y, x = np.mgrid[0:s, 0:s].astype(np.float64)
    return (x + .5) / s * 2 - 1, 1 - (y + .5) / s * 2   # x right, y up, both -1..1


def save_mask(name, value, n):
    v = np.clip(value, 0, 1)
    img = Image.fromarray((v * 255).astype(np.uint8), 'L').resize((n, n), Image.LANCZOS)
    GEN.mkdir(parents=True, exist_ok=True)
    img.convert('RGB').save(GEN / f'{name}.png')
    print('wrote', GEN / f'{name}.png')


def save_rgba(name, rgba):
    GEN.mkdir(parents=True, exist_ok=True)
    PRO.mkdir(parents=True, exist_ok=True)
    rgba.save(GEN / f'{name}.png')
    rgba.save(PRO / f'{name}.png')
    print('wrote', PRO / f'{name}.png')


def value_noise(x, y, freq, seed):
    """Smooth value noise in 0..1 (bicubic-interpolated random lattice): blobby, low frequency."""
    r = np.random.default_rng(seed)
    n = freq + 3
    lat = r.random((n, n))
    img = Image.fromarray((lat * 255).astype(np.uint8), 'L')
    s = x.shape[0]
    big = np.asarray(img.resize((s * (n - 1) // freq, s * (n - 1) // freq), Image.BICUBIC), np.float64) / 255
    return big[:s, :s]


# ---------------------------------------------------------------- toon puff
LOBES = [  # cx, cy, r  (a cloud wider than tall, its bottom lobes larger and in front)
    (-.42, -.30, .30), (.40, -.32, .31), (-.05, -.36, .36), (-.66, -.40, .20), (.68, -.42, .20),
    (-.24, -.02, .30), (.20, -.04, .32), (-.02, .26, .27), (.44, .14, .20), (-.46, .12, .19),
]
_lobe_rand = rng.random((len(LOBES), 3))


def puff_cell(x, y, t, erode=True):
    """RGBA float arrays for the puff at normalised time t (0..1)."""
    open_k = 1 - (1 - min(t / .45, 1)) ** 3                 # billows open fast, then slows
    rise = .10 * t
    inside_any = np.zeros_like(x, bool)
    best_depth = np.full_like(x, 9.0)
    lit = np.zeros_like(x, bool)
    for i, (cx, cy, r) in enumerate(LOBES):
        core = i in (2, 5, 6)                                # the three centre lobes are there from the first frame
        appear = 0 if core else .03 + _lobe_rand[i, 0] * .2  # the rest pop in staggered
        a = np.clip((t - appear) / .18 + (.5 if core else 0), 0, 1)
        if a <= 0:
            continue
        k = (.42 + .62 * open_k) * (1 - (1 - a) ** 2)
        late = max(0.0, (t - .52) / .48)
        k *= 1 - late ** 1.4 * (.55 + .45 * _lobe_rand[i, 1])  # each lobe shrinks at its own rate
        if k <= .02:
            continue
        rr = r * k
        ccx = cx * (.8 + .3 * open_k) + (_lobe_rand[i, 2] - .5) * .06 * t
        ccy = cy * (.85 + .2 * open_k) + rise * (1 + .5 * (cy + .4))
        d = np.hypot(x - ccx, y - ccy)
        ins = d < rr
        depth = ccy                                         # lower lobes sit in front
        take = ins & (depth < best_depth)
        best_depth = np.where(take, depth, best_depth)
        # lit core: the same disc pulled toward the light (upper left) and a little smaller
        dl = np.hypot(x - (ccx - .2 * rr), y - (ccy + .26 * rr))
        lit = np.where(take, dl < rr * .86, lit)
        inside_any |= ins
    alpha = inside_any.astype(np.float64)
    if erode and t > .5:
        e = ((t - .5) / .5) ** 1.25 * .95
        nz = value_noise(x, y, 5, 99) * .75 + value_noise(x, y, 11, 7) * .25
        alpha *= (nz > e)
    col = np.where(lit[..., None], WHITE, SHADE)
    return col, alpha


def to_rgba(col, alpha, n):
    s = col.shape[0]
    a = alpha[..., None]
    pre = np.concatenate([col * a, a * 255], axis=-1)       # premultiply, then box-downsample, then un-premultiply
    pre = pre.reshape(n, s // n, n, s // n, 4).mean(axis=(1, 3))
    out = np.zeros_like(pre)
    am = pre[..., 3:4] / 255
    # transparent pixels carry the lavender shadow colour, not black: bilinear filtering, mipmaps and the noise cutoff
    # blend edge texels with their neighbours' colour, and black there drew dark smudges inside overlapping puffs
    out[..., :3] = np.where(am > 1e-4, pre[..., :3] / np.maximum(am, 1e-4), SHADE)
    out[..., 3] = pre[..., 3]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA')


def puff_sheet(cell=256):
    x, y = grid(cell)
    x, y = x * 1.08, y * 1.08 + .04                          # a margin so no lobe touches the cell border
    sheet = Image.new('RGBA', (cell * 4, cell * 4))
    for i in range(16):
        col, a = puff_cell(x, y, i / 15)
        sheet.paste(to_rgba(col, a, cell), ((i % 4) * cell, (i // 4) * cell))
    save_rgba('T_ToonPuffSheet01', sheet)


def puff_single(n=256):
    x, y = grid(n)
    col, a = puff_cell(x * 1.08, y * 1.08 + .04, .42, erode=False)
    save_rgba('T_ToonPuff01', to_rgba(col, a, n))


# ---------------------------------------------------------------- ground swoosh
def swoosh(n=512):
    s = n * SS
    img = Image.new('L', (s, s), 0)
    d = ImageDraw.Draw(img)
    strokes = [(.10, .00, .95, .30, 1.0), (.18, -.10, .80, .16, .8), (.26, .10, .70, .22, .65), (.34, -.20, .60, .10, .5)]
    for side in (-1, 1):
        for x0, y0, x1, lift, w in strokes:
            pts = []
            for k in np.linspace(0, 1, 160):
                px = x0 + (x1 - x0) * k
                py = y0 * .25 + lift * k ** 2.4 * .9 - .05
                taper = math.sin(math.pi * min(1, k * 1.15)) ** .8 * (1 - k * .35)
                pts.append((px, py, max(.0, .028 * w * taper)))
            for (ax, ay, aw), (bx, by, bw) in zip(pts, pts[1:]):
                X0, Y0 = (side * ax + 1) / 2 * s, (1 - (ay + .3)) / 2 * s
                X1, Y1 = (side * bx + 1) / 2 * s, (1 - (by + .3)) / 2 * s
                r = max(aw, bw) * s / 2
                if r < .5:
                    continue
                d.line([(X0, Y0), (X1, Y1)], fill=255, width=int(r * 2))
                d.ellipse([X1 - r, Y1 - r, X1 + r, Y1 + r], fill=255)
    v = np.asarray(img, np.float64) / 255
    save_mask('T_ToonSwoosh01', v, n)


# ---------------------------------------------------------------- crack web
def crack_web(n=512):
    s = n * 2
    ys, xs = np.mgrid[0:s, 0:s].astype(np.float64)
    x, y = (xs + .5) / s * 2 - 1, 1 - (ys + .5) / s * 2
    r = np.hypot(x, y)
    th = np.arctan2(y, x)
    # irregular outline of the web
    edge_r = .62 + .12 * np.sin(th * 3 + .7) + .08 * np.sin(th * 7 + 2.1) + .05 * np.sin(th * 13)
    # seeds on jittered rings: small cells in the centre, larger ones outward, so the web is a round shattered disc
    pr = np.random.default_rng(42)
    pts = [(pr.uniform(-.02, .02), pr.uniform(-.02, .02))]
    for rad, cnt in ((.09, 6), (.19, 10), (.31, 14), (.45, 18), (.6, 22), (.76, 26), (.92, 30)):
        off = pr.random() * math.tau
        for j in range(cnt):
            a = off + j / cnt * math.tau + pr.uniform(-.35, .35) * math.tau / cnt
            rj = rad * pr.uniform(.88, 1.1)
            pts.append((rj * math.cos(a), rj * math.sin(a)))
    pts = np.array(pts)
    d1 = np.full_like(x, 9.0)
    d2 = np.full_like(x, 9.0)
    for px, py in pts:
        dd = np.hypot(x - px, y - py)
        d2 = np.where(dd < d1, d1, np.minimum(d2, dd))
        d1 = np.minimum(d1, dd)
    w = .024 * (1 - .6 * np.clip(r / .8, 0, 1)) + .004
    web = np.clip(1.6 - (d2 - d1) / w, 0, 1) ** 1.5
    fall = np.clip((edge_r - r) / .16, 0, 1)
    web *= fall * (.65 + .35 * np.clip(1 - r / .8, 0, 1))
    # a broken patch in the centre (shattered, not a clean hub)
    web = np.maximum(web, np.clip(1 - r / .09, 0, 1) * .0)
    # radial cracks running past the web
    img = Image.new('L', (s, s), 0)
    dr = ImageDraw.Draw(img)
    cr = np.random.default_rng(5)
    for i in range(11):
        ang = i / 11 * math.tau + cr.uniform(-.2, .2)
        rad = cr.uniform(.35, .5)
        width = cr.uniform(2.2, 3.4) * s / 512
        px, py = rad * math.cos(ang), rad * math.sin(ang)
        end = cr.uniform(.82, .97)
        while rad < end:
            step = cr.uniform(.03, .06)
            ang += cr.uniform(-.28, .28)
            nx, ny = px + step * math.cos(ang), py + step * math.sin(ang)
            ww = max(1, int(width * (1 - (rad - .35) / .7)))
            dr.line([((px + 1) / 2 * s, (1 - py) / 2 * s), ((nx + 1) / 2 * s, (1 - ny) / 2 * s)], fill=255, width=ww)
            if cr.random() < .22:   # a short branch
                ba = ang + cr.choice([-1, 1]) * cr.uniform(.5, 1.0)
                bl = cr.uniform(.04, .09)
                dr.line([((nx + 1) / 2 * s, (1 - ny) / 2 * s),
                         ((nx + bl * math.cos(ba) + 1) / 2 * s, (1 - (ny + bl * math.sin(ba))) / 2 * s)], fill=200, width=max(1, ww - 1))
            px, py, rad = nx, ny, np.hypot(nx, ny)
    radial = np.asarray(img, np.float64) / 255
    v = np.maximum(web, radial)
    save_mask('T_CrackWeb01', v, n)
    glow = Image.fromarray((np.clip(v, 0, 1) * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(s / 70))
    g = np.asarray(glow, np.float64) / 255
    g = np.clip(g / max(g.max(), 1e-3) * 1.15, 0, 1)
    save_mask('T_CrackWeb01Glow', g, n)


# ---------------------------------------------------------------- light rays
def light_rays(n=256):
    x, y = grid(n, 2)
    ox, oy = 0.0, -2.2                                       # the rays fan out from a point under the floor
    ang = np.arctan2(x - ox, y - oy)                         # 0 = straight up
    rr = np.random.default_rng(11)
    v = np.zeros_like(x)
    for _ in range(14):
        c = rr.uniform(-.36, .36)
        w = rr.uniform(.012, .045)
        a = rr.uniform(.35, 1.0)
        v += a * np.exp(-((ang - c) / w) ** 2)
    v = np.clip(v, 0, 1.4) / 1.4
    up = (y + 1) / 2                                         # 0 at the bottom edge, 1 at the top
    v *= np.clip(1 - up, 0, 1) ** 1.6 * np.clip(up / .06, 0, 1)
    v *= np.clip(1 - np.abs(x) / .95, 0, 1) ** .6
    save_mask('T_LightRays01', v, n)


if __name__ == '__main__':
    puff_sheet()
    puff_single()
    swoosh()
    crack_web()
    light_rays()
