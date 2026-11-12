"""Export Akari's art rig for the web game: python tools/akari-rig/game.py [--preview]

Cuts godot/akari-rig/source/akari.svg by godot/akari-rig/game_rig.json with the same pipeline as cut.py (backdrop
keyed by a two-background matte, each pixel to the front-most part, pixels hidden under a part in front inpainted,
flowers lifted off the scythe), then:
  - meshes every skinned part coarsely (game scale) and weights it on its bones,
  - scales the textures by the spec's `scale`, packs them into one atlas: src/img/akari_parts.webp,
  - writes src/js/34e-akari-parts.js: AKARI_PARTS = { img, scale, pivot, bones, chains, parts, flowers }.
Drawn in the game by src/js/21-characters/bosses/akari/art.js. --preview also writes .scratch/akari-rig/game_*.png
(the atlas on grey, the board with every part's mesh, the figure put back together from the atlas).
"""
import json
import math
import os
import sys

import cv2
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import cut  # noqa: E402

ROOT = cut.ROOT
SPEC = os.path.join(cut.PROJ, "game_rig.json")
OUT_IMG = os.path.join(ROOT, "src", "img", "akari_parts.webp")
OUT_JS = os.path.join(ROOT, "src", "js", "34e-akari-parts.js")
SCR = os.path.join(ROOT, ".scratch", "akari-rig")


def premul_resize(rgba, k):
    """Resize straight-alpha RGBA by k without dark fringes (premultiply, area-filter, unpremultiply)."""
    if k == 1:
        return rgba.copy()
    a = rgba[..., 3:4].astype(np.float32) / 255
    pm = np.dstack([rgba[..., :3].astype(np.float32) * a, a * 255])
    h, w = rgba.shape[:2]
    size = (max(1, int(round(w * k))), max(1, int(round(h * k))))
    small = cv2.resize(pm, size, interpolation=cv2.INTER_AREA)
    sa = small[..., 3:4] / 255
    rgb = np.where(sa > 0.004, small[..., :3] / np.maximum(sa, 0.004), 0)
    # bleed colour into the transparent border, so bilinear sampling at the edge doesn't pull in black
    known = (small[..., 3] > 8).astype(np.uint8)
    if known.any() and not known.all():
        _, idx = cv2.distanceTransformWithLabels(1 - known, cv2.DIST_L2, 3, labelType=cv2.DIST_LABEL_PIXEL)
        ky, kx = np.nonzero(known)
        lut = np.zeros((idx.max() + 1, 3), np.float32)
        lut[idx[ky, kx]] = rgb[ky, kx]
        rgb = np.where(known[..., None] > 0, rgb, lut[idx])
    return np.dstack([rgb, small[..., 3]]).clip(0, 255).astype(np.uint8)


def pack(images, pad=3, width=1024):
    """Shelf-pack (name -> RGBA) into one atlas; returns atlas, {name: [x, y, w, h]}."""
    order = sorted(images, key=lambda n: -images[n].shape[0])
    x = y = shelf = 0
    rects = {}
    for n in order:
        h, w = images[n].shape[:2]
        if x + w + pad > width:
            x, y, shelf = 0, y + shelf + pad, 0
        rects[n] = [x + pad, y + pad, w, h]
        x += w + pad
        shelf = max(shelf, h)
    H = y + shelf + 2 * pad
    atlas = np.zeros((H, width, 4), np.uint8)
    for n, (x0, y0, w, h) in rects.items():
        atlas[y0:y0 + h, x0:x0 + w] = images[n]
    return atlas, rects


def main():
    preview = "--preview" in sys.argv
    os.makedirs(SCR, exist_ok=True)
    rig = json.load(open(SPEC, encoding="utf-8"))
    K = float(rig.get("scale", 0.5))
    colour, alpha = cut.key_backdrop()
    H, W = alpha.shape
    for x0, y0, x1, y1 in rig.get("drop", []):
        alpha[y0:y1, x0:x1] = 0.0

    names = list(rig["parts"])
    masks = {}
    for name in names:
        p = rig["parts"][name]
        m = cut.poly_mask((H, W), p["polys"])
        if "refine" in p:
            rf = p["refine"]
            m = cut.refine_pink(colour, alpha, m, rf.get("grow", 3), rf.get("line"), rf.get("band", 20))
        masks[name] = m
    owner = np.full((H, W), -1, np.int32)
    for i, name in enumerate(names):
        owner[masks[name] & (alpha > 0.0)] = i
    print(f"pixels outside every part: {int(((alpha > 0.25) & (owner < 0)).sum())}")

    flowers = cut.cut_flowers(rig, colour, alpha)
    lifted = {}
    for fl in flowers.values():
        k = cv2.dilate(fl["mask_full"].astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
        lifted[fl["on"]] = lifted.get(fl["on"], np.zeros((H, W), bool)) | k

    # bones: rest pose in art space, parents before children
    bone_g = cut.rest_globals(rig)
    bone_names = list(bone_g)
    bidx = {n: i for i, n in enumerate(bone_names)}
    bones_out = []
    for n in bone_names:
        p0, ang, length, parent = bone_g[n]
        bones_out.append({"n": n, "p": bidx[parent] if parent else -1, "x": round(float(p0[0]), 2),
                          "y": round(float(p0[1]), 2), "a": round(ang, 5), "l": round(length, 2)})

    images, parts_out, boards = {}, [], []
    reasm = np.zeros((H, W, 4), np.float32)
    for i, name in enumerate(names):
        p = rig["parts"][name]
        own = owner == i
        hidden = masks[name] & (owner > i) & (alpha > 0.0)
        under = lifted.get(name, np.zeros((H, W), bool))
        a = np.where(own | hidden, alpha, 0.0)
        a = np.where(under & masks[name], np.maximum(a, alpha), a)
        known = own & ~under & (alpha > 0.6)
        grow = cv2.dilate((a > 0).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
        col = cut.inpaint(colour, known, (a > 0.0) | grow)
        ys, xs = np.nonzero(a > 0.01)
        if len(ys) == 0:
            print("  empty part", name)
            continue
        entry = {"n": name}
        if p.get("bind"):
            x0, y0 = int(xs.min()) - 2, int(ys.min()) - 2
            x1, y1 = int(xs.max()) + 3, int(ys.max()) + 3
            entry["b"] = bidx[p["bind"]]
        else:
            V, tris, outline_n, meshmask = cut.outline_and_grid(a > 0.02, p.get("mesh", 50), eps=3.0)
            miss = int(((a > 0.05) & ~meshmask).sum())
            if miss:
                print(f"  warning: {name}: {miss} px outside its mesh")
            x0, y0 = np.floor(V.min(axis=0)).astype(int) - 2
            x1, y1 = np.ceil(V.max(axis=0)).astype(int) + 3
            chain_defs = []
            for cname in p.get("chains", []):
                c = rig["chains"][cname]
                pts = np.array(c["points"], float)
                chain_defs.append((pts, [f"{cname}_{k}" for k in range(len(pts) - 1)], c["parent"], True))
            if p.get("bones"):
                bl = p["bones"]
                pts = np.array([rig["bones"][b]["pos"] for b in bl] + [rig["bones"][bl[-1]]["tip"]], float)
                chain_defs.append((pts, bl, rig["bones"][bl[0]]["parent"], False))
            wts = []
            for v in V:
                acc, tot = {}, 0.0
                for pts, bl, parent, pin in chain_defs:
                    w, d = cut.chain_weights(v, pts, bl, parent, pin)
                    cw = 1.0 / (d * d + 400.0)
                    for b, x in w.items():
                        acc[b] = acc.get(b, 0.0) + x * cw
                    tot += cw
                top = sorted(((b, x / tot) for b, x in acc.items()), key=lambda kv: -kv[1])[:3]
                s = sum(x for _, x in top)
                wts.append([[bidx[b], round(x / s, 3)] for b, x in top if x / s > 0.004])
            entry["v"] = [round(float(c), 1) for xy in V for c in xy]
            entry["t"] = [int(k) for t in tris for k in t]
            entry["w"] = wts
            print(f"part {name:9s} verts {len(V):4d}  tris {len(tris):4d}")
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, W), min(y1, H)
        tex = np.dstack([col[y0:y1, x0:x1], a[y0:y1, x0:x1] * 255]).clip(0, 255).astype(np.uint8)
        images[name] = premul_resize(tex, K)
        entry["at"] = [int(x0), int(y0)]
        entry["sz"] = [int(x1 - x0), int(y1 - y0)]
        parts_out.append(entry)
        al = a[..., None]
        reasm[..., :3] = col * al + reasm[..., :3] * (1 - al)
        reasm[..., 3:] = al + reasm[..., 3:] * (1 - al)
        if "v" in entry:
            boards.append((name, np.array(entry["v"]).reshape(-1, 2), np.array(entry["t"]).reshape(-1, 3)))

    flowers_out, done = [], {}
    for name, fl in flowers.items():
        cx, cy = fl["c"]
        if "template" in fl:
            t = done[fl["template"]]
            flowers_out.append({**t, "n": name, "c": [round(cx, 1), round(cy, 1)], "b": bidx[fl["bone"]],
                                "spin": fl["spin"], "k": round(fl["r"] / t["r"], 4), "turn": fl.get("turn", 0),
                                "r": fl["r"]})
            continue
        r = int(math.ceil(fl["r"])) + 2
        x0, y0 = int(round(cx)) - r, int(round(cy)) - r
        m = fl["mask_full"][y0:y0 + 2 * r, x0:x0 + 2 * r]
        tex = np.dstack([fl["colour"][y0:y0 + 2 * r, x0:x0 + 2 * r],
                         np.where(m, alpha[y0:y0 + 2 * r, x0:x0 + 2 * r] * 255, 0)]).clip(0, 255).astype(np.uint8)
        images["flower_" + name] = premul_resize(tex, K)
        done[name] = {"n": name, "img": "flower_" + name, "c": [round(cx, 1), round(cy, 1)], "b": bidx[fl["bone"]],
                      "o": [round(x0 - cx, 1), round(y0 - cy, 1)], "sz": [2 * r, 2 * r], "spin": fl["spin"],
                      "k": 1.0, "turn": 0, "r": fl["r"]}
        flowers_out.append(done[name])
        fa = np.where(fl["mask_full"], alpha, 0)[..., None]
        reasm[..., :3] = fl["colour"] * fa + reasm[..., :3] * (1 - fa)
        reasm[..., 3:] = fa + reasm[..., 3:] * (1 - fa)
    flowers_out.sort(key=lambda f: f["r"])

    atlas, rects = pack(images)
    for e in parts_out:
        e["r"] = rects[e["n"]]
    for f in flowers_out:
        f["rect"] = rects[f["img"]]
        del f["img"]
    # uv: atlas px of each vertex (scaled art px inside the part's rect)
    for e in parts_out:
        if "v" in e:
            V = np.array(e["v"]).reshape(-1, 2)
            uv = (V - np.array(e["at"])) * K + np.array(e["r"][:2])
            e["uv"] = [round(float(c), 1) for xy in uv for c in xy]
    rgba = cv2.cvtColor(atlas, cv2.COLOR_BGRA2RGBA)
    Image.fromarray(rgba, "RGBA").save(OUT_IMG, "WEBP", quality=92, method=6)
    chains = {k: [bidx[f"{k}_{i}"] for i in range(len(v["points"]) - 1)] for k, v in rig["chains"].items()}
    data = {"img": "__IMG(akari_parts.webp)__", "scale": K, "size": [W, H], "pivot": rig["pivot"],
            "bones": bones_out, "chains": chains, "parts": parts_out, "flowers": flowers_out}
    head = ("/* KAGE: Akari, cut from the user's art (godot/akari-rig/source/akari.svg) by tools/akari-rig/game.py from\n"
            "   godot/akari-rig/game_rig.json; generated, do not edit. All positions are in the art's own px (it faces left).\n"
            "   bones: n name, p parent index, x y a l its rest pose (origin, angle, length). chains: bone indices root to tip.\n"
            "   parts (back to front): r its rect in the atlas (scaled by `scale`), at where its top-left sits in the art,\n"
            "   b the bone it is rigid on, or v / uv / t / w a skinned mesh: vertices (art px), atlas uv, triangles, and per\n"
            "   vertex [[bone, weight], ...]. flowers: c centre, b bone, rect, o offset of the image from the centre, k scale,\n"
            "   spin deg/s. Drawn by 21-characters/bosses/akari/art.js. */\n")
    open(OUT_JS, "w", encoding="utf-8").write(head + "const AKARI_PARTS = " + json.dumps(data, separators=(",", ":")) + ";\n")
    tri_total = sum(len(e.get("t", [])) // 3 for e in parts_out)
    print(f"atlas {atlas.shape[1]}x{atlas.shape[0]}  {os.path.getsize(OUT_IMG) // 1024} KB   js {os.path.getsize(OUT_JS) // 1024} KB"
          f"   skinned triangles {tri_total}")
    if preview:
        bg = np.full((H, W, 3), (70, 110, 70), np.float32)
        cv2.imwrite(os.path.join(SCR, "game_reassembled.png"),
                    (reasm[..., :3] + bg * (1 - reasm[..., 3:])).clip(0, 255).astype(np.uint8))
        a = atlas[..., 3:4] / 255
        cv2.imwrite(os.path.join(SCR, "game_atlas.png"),
                    (atlas[..., :3] * a + np.array([70, 110, 70]) * (1 - a)).astype(np.uint8))
        board = (reasm[..., :3] * 0.6 + 40).clip(0, 255).astype(np.uint8)
        for name, V, T in boards:
            for t in T:
                cv2.polylines(board, [V[t].astype(np.int32)], True, (80, 255, 255), 1, cv2.LINE_AA)
        for b in bones_out:
            q = (int(b["x"] + math.cos(b["a"]) * b["l"]), int(b["y"] + math.sin(b["a"]) * b["l"]))
            cv2.line(board, (int(b["x"]), int(b["y"])), q, (0, 200, 255), 2, cv2.LINE_AA)
        cv2.imwrite(os.path.join(SCR, "game_board.png"), board)


if __name__ == "__main__":
    main()
