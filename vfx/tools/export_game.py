"""KAGE game export: bake the built Effekseer effects into sprite sheets the Canvas 2D game plays additively.

For each effect in SHEETS: render it alone on pure black in Godot through vfx/tools/GameSheet.gd (side-on orthographic
camera, the Lab's HDR bloom and tonemapping), then pack the sampled frames into one WebP sheet at
src/img/<name>.webp, and write src/js/34-vfx-sheets.js with every sheet's grid, frame times, pixels per metre and
where the effect's origin sits in a cell (the build inlines the images through __IMG(name)__).

Renders run in a temporary copy of vfx/godot, so the Lab project (the review stage) is never touched.

Usage (from the game project):  python vfx/tools/export_game.py [ids...]
Needs GODOT (the Godot 4 executable) and Pillow.
"""
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / 'vfx' / 'tools'
LAB = ROOT / 'vfx' / 'godot'
IMG = ROOT / 'src' / 'img'
OUT_JS = ROOT / 'src' / 'js' / '34-vfx-sheets.js'

# name: (effect id, render W, H, ortho size (vertical metres), centre y, centre x, track (m/frame, decel m/frame^2,
#        stop frame) or None, frames, cell scale)
SHEETS = {
    'raikon_sky_strike':   ('VFX_Raikon_Sky_Strike',   400, 680, 8.5, 4.1, 0.0, None, '0:40:2,43:73:3', .8),
    'raikon_blade_charge': ('VFX_Raikon_Blade_Charge', 224, 224, 2.8, 0.0, 0.0, None, '0:44:2', 1.0),
    # the wave front launches at .158 m/frame and brakes uniformly to rest at f76 (VFX_Raikon_Thunder_Wave.py)
    'raikon_thunder_wave': ('VFX_Raikon_Thunder_Wave', 448, 200, 2.2, .85, -.35, (.158, .158 / 76, 76), '0:93:3', 1.0),
    'raikon_redline_guard': ('VFX_Raikon_Redline_Guard', 320, 256, 2.8, 1.2, .4, None, '0:76:2', 1.0),
    'raikon_storm_mantle': ('VFX_Raikon_Storm_Mantle', 192, 256, 2.6, 1.05, 0.0, None, '0:58:2', 1.0),
}


def render(work, name, spec, out):
    eid, w, h, size, cy, cx, track, frames, _ = spec
    godot = os.environ.get('GODOT') or 'godot'
    cmd = [godot, '--path', str(work), 'res://GameSheet.tscn', '--fixed-fps', '60', '--resolution', f'{w}x{h}', '--',
           f'--id={eid}', f'--out={out}', f'--frames={frames}', f'--size={size}', f'--cy={cy}', f'--cx={cx}',
           '--pitch=10'] + ([f'--track={track[0]}', f'--decel={track[1]}', f'--stop={track[2]}'] if track else [])
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)
    return json.loads((out / 'capture.json').read_text())


def clean(cell, feather=32, floor=9, gamma=1.6):
    """The game grade. Played additively onto a dark arena, the soft glow layers that sat on the Lab's lit stage read
    as flat discs, any light the bloom left near a cell's border as a box edge, and the black background's faint lift
    as a grey card: a gamma curve keeps white-hot cores and bolts while pushing the low, flat glow down, a small black
    level is cut and the border is feathered to black."""
    w, h = cell.size
    lut = [round(255 * (max(0, v - floor) / (255 - floor)) ** gamma) for v in range(256)] * 3
    cell = cell.point(lut)
    mask = Image.new('L', (w, h), 0)
    px = mask.load()
    for y in range(h):
        for x in range(w):
            d = min(x, y, w - 1 - x, h - 1 - y)
            px[x, y] = 255 if d >= feather else round(255 * d / feather)
    return Image.composite(cell, Image.new('RGB', (w, h)), mask)


def pack(name, spec, out, cap):
    scale = spec[8]
    samples = cap['samples']
    cells = [Image.open(out / f'f{n:03d}.png').convert('RGB') for n in samples]
    cw, ch = round(cap['width'] * scale), round(cap['height'] * scale)
    if scale != 1:
        cells = [c.resize((cw, ch), Image.LANCZOS) for c in cells]
    cells = [clean(c) for c in cells]
    cols = max(1, min(len(cells), 4096 // cw, math.ceil(math.sqrt(len(cells) * ch / cw))))
    rows = math.ceil(len(cells) / cols)
    sheet = Image.new('RGB', (cols * cw, rows * ch))
    for i, c in enumerate(cells):
        sheet.paste(c, ((i % cols) * cw, (i // cols) * ch))
    IMG.mkdir(parents=True, exist_ok=True)
    sheet.save(IMG / f'{name}.webp', 'WEBP', quality=86, method=6)
    return {'img': f'__IMG({name}.webp)__', 'id': spec[0], 'cols': cols, 'cw': cw, 'ch': ch, 'frames': samples,
            'ppm': round(cap['ppm'] * scale, 3), 'ox': round(cap['origin'][0] * scale, 1), 'oy': round(cap['origin'][1] * scale, 1)}


def main(ids):
    manifest = {e['id']: e for e in json.loads((ROOT / 'vfx' / 'vfx_manifest.json').read_text())}
    meta = json.loads(OUT_JS.read_text().split('=', 1)[1].rsplit(';', 1)[0]) if OUT_JS.exists() else {}
    with tempfile.TemporaryDirectory(prefix='kage_gamesheet_') as tmp:
        work = Path(tmp) / 'godot'
        shutil.copytree(LAB, work)
        shutil.copy(TOOLS / 'GameSheet.gd', work)
        shutil.copy(TOOLS / 'GameSheet.tscn', work)
        for name, spec in SHEETS.items():
            if ids and name not in ids and spec[0] not in ids:
                continue
            out = Path(tmp) / name
            cap = render(work, name, spec, out)
            entry = pack(name, spec, out, cap)
            entry['duration'] = manifest[spec[0]]['duration']
            entry['peak'] = manifest[spec[0]]['peak']
            if spec[6]:
                entry['track'] = list(spec[6])
            meta[name] = entry
            kb = (IMG / f'{name}.webp').stat().st_size / 1024
            print(f'{name}: {len(entry["frames"])} frames, {entry["cols"]} cols, {entry["cw"]}x{entry["ch"]}, {kb:.0f} KB')
    body = json.dumps(meta, indent=1)
    OUT_JS.write_text('/* KAGE: Effekseer VFX baked to sprite sheets (generated by vfx/tools/export_game.py; do not edit).\n'
                      '   Each sheet: cols, cell size cw x ch, frames (60 FPS effect frame of each cell), ppm (cell pixels per\n'
                      '   metre), ox/oy (the effect origin in a cell), duration and peak (s), track ([m/frame, m/frame^2, stop frame] of the front the camera\n'
                      '   followed a travelling front). Played additively by VfxSheets (37-vfx-sheets.js). */\n'
                      f'const VFX_SHEETS = {body};\n', encoding='utf-8')


if __name__ == '__main__':
    main(set(sys.argv[1:]))
