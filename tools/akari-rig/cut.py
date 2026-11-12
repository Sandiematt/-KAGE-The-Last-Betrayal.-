"""Cut the user's Akari art (godot/akari-rig/source/akari.svg) into a skinned 2D cut-out rig for Godot.

    python tools/akari-rig/cut.py            # needs GODOT (or the winget install) for the SVG raster

1. Key the backdrop out. The SVG is a VTracer trace: one flat fill per path. Paths whose fill is the backdrop's red
   (or the moon's dusty rose) are recoloured black in one copy and white in another; Godot rasterises both and the
   difference gives an exact alpha matte with unmixed colour (the two-background matte the VFX pipeline uses).
2. Cut every part in rig.json. Each pixel belongs to the front-most part whose outline holds it. Where a part's
   outline slides under a part in front of it (the coat under the staff, the hair under the shoulder, the legs under
   the skirt), the hidden pixels are inpainted from the part's own pixels, so nothing tears open when the cloth moves.
3. Lift the spinning flowers off the blade: each is cut by colour round its centre, a bite hidden by a flower in
   front is filled from the flower's own 5-fold symmetry, and the blade under it is inpainted.
4. Mesh every part (a dense outline plus a grid of internal vertices, Delaunay-triangulated) and skin it: chain parts
   are weighted along their bone chains (blended between chains across the width, pinned to the parent bone at the
   root), rigid parts to one bone.

Writes godot/akari-rig/art/parts/*.png, art/flowers/*.png and art/akari_rig.json (read by build/build_akari.gd),
plus .scratch/akari-rig/board.png (every part tinted with its outline and bones) and reassembled.png (all parts put
back together: it should read as the original figure).
"""
import colorsys
import glob
import json
import math
import os
import re
import subprocess
import sys

import cv2
import numpy as np
from scipy.spatial import Delaunay

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PROJ = os.path.join(ROOT, "godot", "akari-rig")
ART = os.path.join(PROJ, "art")
SCRATCH = os.path.join(ROOT, ".scratch", "akari-rig")
SVG = os.path.join(PROJ, "source", "akari.svg")


def godot_bin():
    g = os.environ.get("GODOT")
    if g and os.path.exists(g):
        return g
    hits = glob.glob(os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Packages",
                                  "GodotEngine.GodotEngine_*", "Godot_v4*_win64_console.exe"))
    if not hits:
        sys.exit("Godot not found: set GODOT to the Godot 4.7 console executable")
    return sorted(hits)[-1]


# ---------------------------------------------------------------- 1. key the backdrop

def hsv(hexcol):
    r, g, b = (int(hexcol[i:i + 2], 16) / 255 for i in (0, 2, 4))
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    return h * 360, s, v


def is_backdrop(hexcol):
    h, s, v = hsv(hexcol)
    if (h >= 351.5 or h <= 4.5) and s >= 0.6:          # the red sky, pagodas, floor and shadow
        return True
    if (h >= 350 or h <= 6) and 0.3 < s < 0.6 and v > 0.5:   # the moon's dusty rose
        return True
    return False


def key_backdrop():
    src = open(SVG, encoding="utf-8").read()
    head = src.split("<path", 1)[0]
    paths = re.findall(r'<path d="([^"]*)" fill="#([0-9A-Fa-f]{6})"/>', src)
    bg = [is_backdrop(f) for _, f in paths]
    jobs = []
    for name, fill in (("k_black", "#000000"), ("k_white", "#FFFFFF")):
        body = "".join(f'<path d="{d}" fill="{fill if b else "#" + f}"/>\n' for (d, f), b in zip(paths, bg))
        svg_path = os.path.join(SCRATCH, name + ".svg")
        open(svg_path, "w", encoding="utf-8").write(head + body + "</svg>\n")
        jobs.append(f"{svg_path}={os.path.join(SCRATCH, name + '.png')}")
    subprocess.run([godot_bin(), "--headless", "--path", PROJ, "--script", "res://build/raster.gd", "--",
                    "--scale=1"] + jobs, check=True, capture_output=True)
    black = cv2.imread(os.path.join(SCRATCH, "k_black.png"), cv2.IMREAD_UNCHANGED)[..., :3].astype(np.float32)
    white = cv2.imread(os.path.join(SCRATCH, "k_white.png"), cv2.IMREAD_UNCHANGED)[..., :3].astype(np.float32)
    alpha = 1.0 - np.clip((white - black).mean(axis=2) / 255.0, 0, 1)
    colour = np.clip(np.where(alpha[..., None] > 1e-3, black / np.maximum(alpha[..., None], 1e-3), 0), 0, 255)
    print(f"keyed: {sum(bg)} of {len(paths)} paths are backdrop")
    return colour, alpha  # BGR float 0..255, alpha 0..1


# ---------------------------------------------------------------- 2. cut the parts

def poly_mask(shape, polys):
    m = np.zeros(shape, np.uint8)
    for p in polys:
        cv2.fillPoly(m, [np.round(np.array(p, np.float32)).astype(np.int32)], 1)
    return m.astype(bool)


def refine_pink(colour, alpha, mask, grow, centre_line=None, band=20):
    """The scarf: the pink regions inside its loose outline that touch its centre line (or the largest one),
    closed and grown to take in its dark ink line."""
    hsvim = cv2.cvtColor(colour.astype(np.uint8), cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
    s, v = hsvim[..., 1] / 255, hsvim[..., 2] / 255
    pink = mask & (alpha > 0.5) & (v > 0.42) & (s > 0.3)
    n, lab, st, _ = cv2.connectedComponentsWithStats(pink.astype(np.uint8), 8)
    if n <= 1:
        return mask
    if centre_line is not None:
        line = np.zeros(mask.shape, np.uint8)
        cv2.polylines(line, [np.round(np.array(centre_line)).astype(np.int32)], False, 1, band)
        hit = np.unique(lab[(line > 0) & (lab > 0)])
        hit = [h for h in hit if st[h, cv2.CC_STAT_AREA] >= 25]
        core = np.isin(lab, hit).astype(np.uint8)
    else:
        big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        core = (lab == big).astype(np.uint8)
    core = cv2.morphologyEx(core, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    k = 2 * grow + 1
    core = cv2.dilate(core, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    return mask & core.astype(bool)


def inpaint(colour, known, fill, radius=6):
    """Fill `fill` pixels of colour from `known` ones (Telea); returns a new BGR float image."""
    todo = fill & ~known
    if not todo.any():
        return colour
    ys, xs = np.nonzero(todo | known)
    y0, y1, x0, x1 = max(ys.min() - 8, 0), ys.max() + 9, max(xs.min() - 8, 0), xs.max() + 9
    crop = colour[y0:y1, x0:x1].astype(np.uint8).copy()
    unknown = (~known[y0:y1, x0:x1]).astype(np.uint8)
    # seed far-away unknown pixels with the nearest known colour first, so Telea only blends locally
    _, idx = cv2.distanceTransformWithLabels(unknown, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
    ky, kx = np.nonzero(unknown == 0)
    if len(ky) == 0:
        return colour
    lut = np.zeros((idx.max() + 1, 3), np.uint8)
    lab_known = idx[ky, kx]
    lut[lab_known] = crop[ky, kx]
    seeded = np.where(unknown[..., None] == 1, lut[idx], crop)
    hole = (todo[y0:y1, x0:x1]).astype(np.uint8)
    seeded = cv2.inpaint(seeded, hole, radius, cv2.INPAINT_TELEA)
    out = colour.copy()
    out[y0:y1, x0:x1] = np.where(todo[y0:y1, x0:x1, None], seeded.astype(np.float32), out[y0:y1, x0:x1])
    return out


def cut_flowers(rig, colour, alpha):
    """Each flower: petal-coloured pixels joined to its centre, inside its disk; bites filled by symmetry."""
    H, W = alpha.shape
    hsvim = cv2.cvtColor(colour.astype(np.uint8), cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
    s, v = hsvim[..., 1] / 255, hsvim[..., 2] / 255
    yy, xx = np.mgrid[0:H, 0:W]
    out = {}
    for name, f in rig["flowers"].items():
        if name.startswith("_"):
            continue
        cx, cy = f["c"]
        r = f["r"]
        disk = (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r
        petal = disk & (alpha > 0.5) & (v > 0.62) & (s < 0.72)
        # the white-gold stamen marks the true centre
        stamen = petal & (s < 0.3) & ((xx - cx) ** 2 + (yy - cy) ** 2 <= (r * 0.45) ** 2)
        if stamen.sum() > 6:
            cy, cx = float(yy[stamen].mean()), float(xx[stamen].mean())
        n, lab = cv2.connectedComponents(petal.astype(np.uint8), connectivity=8)
        seed = lab[int(round(cy)), int(round(cx))]
        if seed == 0:
            near = np.argmin(np.where(lab > 0, (xx - cx) ** 2 + (yy - cy) ** 2, 1e12))
            seed = lab.flat[near]
        m = (lab == seed).astype(np.uint8)
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
        filled = m.copy()
        ff = np.zeros((H + 2, W + 2), np.uint8)
        cv2.floodFill(filled, ff, (0, 0), 1)
        m = m | (1 - filled)                      # holes inside the flower
        m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))).astype(bool) & disk & (alpha > 0.02)
        out[name] = {"mask": m, "c": (cx, cy), "r": r, **f}
    # fill the bite another flower takes out of a flower behind it, from the flower's own 5-fold symmetry
    names = list(out)
    for name in names:
        fl = out[name]
        others = np.zeros_like(fl["mask"])
        for o in names:
            if o != name and out[o]["r"] > fl["r"]:
                others |= out[o]["mask"]
        cx, cy = fl["c"]
        r = fl["r"]
        disk = (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r
        bite = disk & others & ~fl["mask"]
        fl["colour"] = colour.copy()
        if bite.any():
            add = np.zeros_like(bite)
            by, bx = np.nonzero(bite)
            for k in (1, 2, 3, 4):
                a = math.radians(72 * k)
                qx = cx + (bx - cx) * math.cos(a) - (by - cy) * math.sin(a)
                qy = cy + (bx - cx) * math.sin(a) + (by - cy) * math.cos(a)
                qxi, qyi = np.clip(np.round(qx).astype(int), 0, W - 1), np.clip(np.round(qy).astype(int), 0, H - 1)
                ok = fl["mask"][qyi, qxi] & ~add[by, bx]
                fl["colour"][by[ok], bx[ok]] = colour[qyi[ok], qxi[ok]]
                add[by[ok], bx[ok]] = True
            fl["mask_full"] = fl["mask"] | add
            print(f"flower {name}: filled {int(add.sum())} px of bite by symmetry")
        else:
            fl["mask_full"] = fl["mask"]
    return out


# ---------------------------------------------------------------- 3. mesh + weights

def outline_and_grid(mask, spacing, eps=1.6):
    """Outline loop(s) round the mask (closed so strands merge) and internal grid points; Delaunay triangles."""
    m = mask.astype(np.uint8)
    k = max(3, int(spacing * 0.8) | 1)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    contours, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contours = [c for c in contours if cv2.contourArea(c) > 40]
    verts, tris, outline_n = [], [], 0
    loops = []
    for c in contours:
        c = cv2.approxPolyDP(c, eps, True)[:, 0, :].astype(np.float64)
        pts = []
        for i in range(len(c)):
            a, b = c[i], c[(i + 1) % len(c)]
            L = np.linalg.norm(b - a)
            n = max(1, int(math.ceil(L / (spacing * 0.75))))
            for j in range(n):
                pts.append(a + (b - a) * j / n)
        loops.append((c, np.array(pts)))
    # outline vertices first (all loops), internal after: Godot's internal_vertex_count convention
    for c, pts in loops:
        verts.extend(pts.tolist())
    outline_n = len(verts)
    for c, pts in loops:
        x0, y0 = c.min(axis=0)
        x1, y1 = c.max(axis=0)
        cc = c.astype(np.float32).reshape(-1, 1, 2)
        for gy in np.arange(y0 + spacing / 2, y1, spacing * 0.866):
            off = spacing / 2 if int((gy - y0) / (spacing * 0.866)) % 2 else 0
            for gx in np.arange(x0 + off, x1, spacing):
                if cv2.pointPolygonTest(cc, (float(gx), float(gy)), True) > spacing * 0.38:
                    verts.append([gx, gy])
    V = np.array(verts)
    dl = Delaunay(V)
    loops_cc = [c.astype(np.float32).reshape(-1, 1, 2) for c, _ in loops]
    for t in dl.simplices:
        p = V[t]
        ok = True
        for q in (p.mean(axis=0), (p[0] + p[1]) / 2, (p[1] + p[2]) / 2, (p[2] + p[0]) / 2):
            if not any(cv2.pointPolygonTest(cc, (float(q[0]), float(q[1])), True) >= -0.75 for cc in loops_cc):
                ok = False
                break
        if ok:
            tris.append([int(i) for i in t])
    return V, tris, outline_n, m.astype(bool)


def project(v, pts):
    """Closest point of v on polyline pts: (segment index, t in [0,1], distance, unclamped t on segment 0)."""
    best = (0, 0.0, 1e18)
    t0 = 0.0
    for k in range(len(pts) - 1):
        a, b = pts[k], pts[k + 1]
        ab = b - a
        tu = float(np.dot(v - a, ab) / np.dot(ab, ab))
        if k == 0:
            t0 = tu
        t = min(1.0, max(0.0, tu))
        d = float(np.linalg.norm(a + ab * t - v))
        if d < best[2]:
            best = (k, t, d)
    return best[0], best[1], best[2], t0


def chain_weights(v, pts, bones, parent, pin):
    n = len(bones)
    k, t, d, t0 = project(v, pts)
    s = k + t
    w = {}
    if s <= 0.5:
        if pin and parent:
            su = t0 if k == 0 else s
            wp = min(1.0, max(0.0, 0.5 - su))
            w[parent] = wp
            w[bones[0]] = 1.0 - wp
        else:
            w[bones[0]] = 1.0
    elif s >= n - 0.5:
        w[bones[-1]] = 1.0
    else:
        j = int(math.floor(s - 0.5))
        f = s - 0.5 - j
        w[bones[j]] = 1.0 - f
        w[bones[j + 1]] = f
    return w, d


def rest_globals(rig):
    """Every bone's rest pose in SVG space: (origin, angle, length)."""
    g = {}
    for name, b in rig["bones"].items():
        p, q = np.array(b["pos"], float), np.array(b["tip"], float)
        g[name] = (p, math.atan2(*(q - p)[::-1]), float(np.linalg.norm(q - p)), b["parent"])
    for cname, c in rig["chains"].items():
        pts = np.array(c["points"], float)
        for k in range(len(pts) - 1):
            parent = c["parent"] if k == 0 else f"{cname}_{k - 1}"
            d = pts[k + 1] - pts[k]
            g[f"{cname}_{k}"] = (pts[k], math.atan2(d[1], d[0]), float(np.linalg.norm(d)), parent)
    return g


def write_petal(path):
    """One loose sakura petal for the drifting particles, in the blade flowers' pinks: a rounded teardrop with
    the notch at its tip, deep pink at the base fading to blush, a dark ink edge like the art's."""
    S = 4
    w, h = 26 * S, 18 * S
    img = np.zeros((h, w, 4), np.float32)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    u = xx / w          # 0 at the base, 1 at the tip
    vv = (yy - h / 2) / (h / 2)
    half = np.sin(np.clip(u, 0, 1) * math.pi * 0.92) ** 0.75 * (0.55 + 0.45 * u)
    inside = np.abs(vv) <= half
    notch = (u > 0.86) & (np.abs(vv) < (u - 0.86) * 2.6)
    inside &= ~notch
    m = inside.astype(np.uint8)
    edge = m - cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * S + 1, 2 * S + 1)))
    deep = np.array([110, 40, 235], np.float32)       # BGR #EB286E
    blush = np.array([200, 160, 252], np.float32)     # BGR #FCA0C8
    t = np.clip(u * 1.3, 0, 1)[..., None]
    col = deep * (1 - t) + blush * t
    col = np.where(edge[..., None] > 0, np.array([60, 20, 90], np.float32), col)
    img[..., :3] = col * m[..., None]          # premultiplied, so the downsample doesn't darken the edge
    img[..., 3] = m * 255
    small = cv2.resize(img, (26, 18), interpolation=cv2.INTER_AREA)
    a = small[..., 3:4] / 255
    small[..., :3] = np.where(a > 0.01, small[..., :3] / np.maximum(a, 0.01), 0)
    cv2.imwrite(path, small.clip(0, 255).astype(np.uint8))


# ---------------------------------------------------------------- main

def main():
    os.makedirs(SCRATCH, exist_ok=True)
    for d in ("parts", "flowers"):
        os.makedirs(os.path.join(ART, d), exist_ok=True)
    rig = json.load(open(os.path.join(PROJ, "rig.json"), encoding="utf-8"))
    colour, alpha = key_backdrop()
    H, W = alpha.shape
    for x0, y0, x1, y1 in rig.get("drop", []):         # backdrop marks the colour key can't tell apart
        alpha[y0:y1, x0:x1] = 0.0
    cv2.imwrite(os.path.join(SCRATCH, "keyed.png"),
                np.dstack([colour, alpha * 255]).clip(0, 255).astype(np.uint8))

    names = list(rig["parts"])                      # back to front
    masks = {}
    for name in names:
        p = rig["parts"][name]
        m = poly_mask((H, W), p["polys"])
        if "refine" in p:
            rf = p["refine"]
            line = rf.get("line") or (rig["chains"][rf["along"]]["points"] if "along" in rf else None)
            m = refine_pink(colour, alpha, m, rf.get("grow", 3), line, rf.get("band", 20))
        masks[name] = m
    owner = np.full((H, W), -1, np.int32)
    for i, name in enumerate(names):
        owner[masks[name] & (alpha > 0.0)] = i
    stray = (alpha > 0.25) & (owner < 0)
    print(f"pixels outside every part: {int(stray.sum())}")

    flowers = cut_flowers(rig, colour, alpha)
    lifted = {}                                     # part -> pixels under its flowers
    for fl in flowers.values():
        k = cv2.dilate(fl["mask_full"].astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
        lifted[fl["on"]] = lifted.get(fl["on"], np.zeros((H, W), bool)) | k

    bones_g = rest_globals(rig)
    out_parts = []
    reasm = np.zeros((H, W, 4), np.float32)
    board = cv2.addWeighted(np.dstack([colour * alpha[..., None] + 40 * (1 - alpha[..., None])]).astype(np.uint8),
                            0.55, np.full((H, W, 3), 40, np.uint8), 0.45, 0)
    tints = [(255, 80, 80), (80, 200, 255), (80, 255, 120), (255, 200, 60), (200, 120, 255), (60, 255, 255),
             (255, 120, 200), (160, 255, 60), (255, 255, 255), (255, 150, 40)]
    for i, name in enumerate(names):
        p = rig["parts"][name]
        own = (owner == i)
        hidden = masks[name] & (owner > i) & (alpha > 0.0)
        under = lifted.get(name, np.zeros((H, W), bool))
        a = np.where(own | hidden, alpha, 0.0)
        a = np.where(under & masks[name], np.maximum(a, alpha), a)
        known = own & ~under & (alpha > 0.6)
        col = inpaint(colour, known, (a > 0.0) | cv2.dilate((a > 0).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool))
        # mesh over everything the part covers
        V, tris, outline_n, meshmask = outline_and_grid(a > 0.02, p.get("mesh", 26))
        cover = (a > 0.05) & ~meshmask
        if cover.sum() > 0:
            print(f"  warning: {name}: {int(cover.sum())} px outside its mesh")
        x0, y0 = np.floor(V.min(axis=0)).astype(int) - 2
        x1, y1 = np.ceil(V.max(axis=0)).astype(int) + 3
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, W), min(y1, H)
        tex = np.dstack([col[y0:y1, x0:x1], a[y0:y1, x0:x1] * 255]).clip(0, 255).astype(np.uint8)
        cv2.imwrite(os.path.join(ART, "parts", name + ".png"), tex)
        # weights
        weights = {}
        if p.get("bind"):
            weights[p["bind"]] = [1.0] * len(V)
        else:
            chain_defs = []
            for cname in p.get("chains", []):
                c = rig["chains"][cname]
                pts = np.array(c["points"], float)
                chain_defs.append((pts, [f"{cname}_{k}" for k in range(len(pts) - 1)], c["parent"], True))
            if p.get("bones"):
                bl = p["bones"]
                pts = np.array([rig["bones"][b]["pos"] for b in bl] + [rig["bones"][bl[-1]]["tip"]], float)
                chain_defs.append((pts, bl, rig["bones"][bl[0]]["parent"], False))
            per_vertex = []
            for v in V:
                acc, tot = {}, 0.0
                ws = []
                for pts, bl, parent, pin in chain_defs:
                    w, d = chain_weights(v, pts, bl, parent, pin)
                    ws.append((w, 1.0 / (d * d + 400.0)))
                for w, cw in ws:
                    for b, x in w.items():
                        acc[b] = acc.get(b, 0.0) + x * cw
                    tot += cw
                acc = {b: x / tot for b, x in acc.items()}
                top = sorted(acc.items(), key=lambda kv: -kv[1])[:4]
                s = sum(x for _, x in top)
                per_vertex.append({b: x / s for b, x in top})
            used = sorted({b for pv in per_vertex for b in pv})
            for b in used:
                weights[b] = [round(pv.get(b, 0.0), 4) for pv in per_vertex]
        out_parts.append({
            "name": name, "z": i, "texture": f"res://art/parts/{name}.png", "tex_origin": [int(x0), int(y0)],
            "verts": [[round(float(x), 2), round(float(y), 2)] for x, y in V],
            "uvs": [[round(float(x - x0), 2), round(float(y - y0), 2)] for x, y in V],
            "outline_count": outline_n, "triangles": tris, "weights": weights,
        })
        print(f"part {name:10s} z{i} tex {x1 - x0}x{y1 - y0}  verts {len(V)} (internal {len(V) - outline_n})"
              f"  tris {len(tris)}  bones {list(weights)}")
        # reassembly + board
        al = a[..., None]
        reasm[..., :3] = col * al + reasm[..., :3] * (1 - al)
        reasm[..., 3:] = al + reasm[..., 3:] * (1 - al)
        tint = np.array(tints[i % len(tints)], np.float32)[::-1]
        sel = own
        board[sel] = (board[sel] * 0.55 + tint * 0.45).astype(np.uint8)
        for t in tris:
            cv2.polylines(board, [V[t].astype(np.int32)], True, tuple(int(c * 0.5) for c in tint), 1, cv2.LINE_AA)
    # flowers
    out_flowers = []
    done = {}
    for name, fl in flowers.items():
        cx, cy = fl["c"]
        if "template" in fl:
            # a flower half hidden behind leaves or another flower: drawn as a whole copy of a clean one, scaled
            t = done[fl["template"]]
            k = fl["r"] / t["r"]
            out_flowers.append({**t, "name": name, "c": [round(cx, 2), round(cy, 2)], "bone": fl["bone"],
                                "spin": fl["spin"], "r": fl["r"], "scale": round(k, 4),
                                "turn": fl.get("turn", 0)})
            cv2.circle(board, (int(cx), int(cy)), int(fl["r"]), (200, 200, 255), 1, cv2.LINE_AA)
            continue
        r = int(math.ceil(fl["r"])) + 2
        x0, y0 = int(round(cx)) - r, int(round(cy)) - r
        m = fl["mask_full"][y0:y0 + 2 * r, x0:x0 + 2 * r]
        tex = np.dstack([fl["colour"][y0:y0 + 2 * r, x0:x0 + 2 * r],
                         np.where(m, alpha[y0:y0 + 2 * r, x0:x0 + 2 * r] * 255, 0)]).clip(0, 255).astype(np.uint8)
        cv2.imwrite(os.path.join(ART, "flowers", name + ".png"), tex)
        done[name] = {"name": name, "texture": f"res://art/flowers/{name}.png", "c": [round(cx, 2), round(cy, 2)],
                      "offset": [round(x0 - cx, 2), round(y0 - cy, 2)], "bone": fl["bone"], "spin": fl["spin"],
                      "r": fl["r"], "scale": 1.0, "turn": 0}
        out_flowers.append(done[name])
        fa = np.where(fl["mask_full"], alpha, 0)[..., None]
        reasm[..., :3] = fl["colour"] * fa + reasm[..., :3] * (1 - fa)
        reasm[..., 3:] = fa + reasm[..., 3:] * (1 - fa)
        cv2.circle(board, (int(cx), int(cy)), int(fl["r"]), (255, 255, 255), 1, cv2.LINE_AA)
    # flowers drawn back to front: the smaller (further) ones first
    out_flowers.sort(key=lambda f: f["r"])
    # bones on the board
    bones_out = []
    for name, (p0, ang, length, parent) in bones_g.items():
        q = p0 + np.array([math.cos(ang), math.sin(ang)]) * length
        cv2.line(board, tuple(p0.astype(int)), tuple(q.astype(int)), (0, 255, 255), 2, cv2.LINE_AA)
        cv2.circle(board, tuple(p0.astype(int)), 4, (0, 140, 255), -1)
        bones_out.append({"name": name, "parent": parent, "pos": [round(float(p0[0]), 2), round(float(p0[1]), 2)],
                          "angle": round(ang, 5), "length": round(length, 2)})
    cv2.imwrite(os.path.join(SCRATCH, "board.png"), board)
    write_petal(os.path.join(ART, "petal.png"))
    bg = np.full((H, W, 3), (70, 110, 70), np.float32)
    cv2.imwrite(os.path.join(SCRATCH, "reassembled.png"),
                (reasm[..., :3] + bg * (1 - reasm[..., 3:])).clip(0, 255).astype(np.uint8))
    diff = np.abs(reasm[..., 3] - alpha).mean()
    print(f"reassembly alpha error {diff:.4f}")
    json.dump({"_about": "generated by tools/akari-rig/cut.py from rig.json; do not edit",
               "size": [W, H], "pivot": rig["pivot"], "bones": bones_out, "chains": {
                   k: [f"{k}_{i}" for i in range(len(v["points"]) - 1)] for k, v in rig["chains"].items()},
               "parts": out_parts, "flowers": out_flowers},
              open(os.path.join(ART, "akari_rig.json"), "w", encoding="utf-8"), separators=(",", ":"))
    print("wrote", os.path.join(ART, "akari_rig.json"))


if __name__ == "__main__":
    main()
