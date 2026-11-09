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
#        stop frame) or None, frames, cell scale[, launch distance in metres: fly a projectile effect along +X])
SHEETS = {
    'raikon_sky_strike':   ('VFX_Raikon_Sky_Strike',   400, 680, 8.5, 4.1, 0.0, None, '0:40:2,43:73:3', .8),
    'raikon_blade_charge': ('VFX_Raikon_Blade_Charge', 224, 224, 2.8, 0.0, 0.0, None, '0:44:2', 1.0),
    # the wave front launches at .158 m/frame and brakes uniformly to rest at f76 (VFX_Raikon_Thunder_Wave.py)
    'raikon_thunder_wave': ('VFX_Raikon_Thunder_Wave', 448, 200, 2.2, .85, -.35, (.158, .158 / 76, 76), '0:93:3', 1.0),
    'raikon_redline_guard': ('VFX_Raikon_Redline_Guard', 320, 256, 2.8, 1.2, .4, None, '0:76:2', 1.0),
    'raikon_storm_mantle': ('VFX_Raikon_Storm_Mantle', 192, 256, 2.6, 1.05, 0.0, None, '0:58:2', 1.0),
    # Akari's Senbonzakura set (vfx/src/VFX_Sakura_*.py; 63-akari-sakura.js plays them)
    'sakura_slash':        ('VFX_Sakura_Slash',        384, 384, 4.4, .2, .3, None, '0:20:1,22:56:2', .8),
    'sakura_veil':         ('VFX_Sakura_Veil',         256, 256, 3.4, 0.0, 0.0, None, '0:52:2', 1.0),
    # the petal shot flies 4 m in its 24-frame flight; the camera keeps the head still (frames 2-24 loop on a kunai)
    'sakura_petal_shot':   ('VFX_Sakura_Petal_Shot',   256, 128, 1.6, 0.0, -.3, (4 / 24, 0, 24), '2:24:2', 1.0, 4.0),
    'sakura_petal_impact': ('VFX_Sakura_Petal_Impact', 224, 224, 3.0, 0.0, 0.0, None, '0:40:2', 1.0),
    'sakura_spiral':       ('VFX_Sakura_Spiral',       320, 384, 4.2, 1.7, 0.0, None, '0:42:3,45:150:3', .75),
    'sakura_tornado':      ('VFX_Sakura_Tornado',      256, 384, 4.0, 1.6, 0.0, None, '0:82:3', .75),
    'sakura_pillar':       ('VFX_Sakura_Pillar',       320, 448, 4.6, 1.9, 0.0, None, '0:30:2,33:78:3', .75),
    'sakura_slash_beam':   ('VFX_Sakura_Slash_Beam',   448, 448, 6.4, 0.0, 0.0, None, '0:20:1,22:48:2', .7),
    'sakura_burst':        ('VFX_Sakura_Burst',        512, 512, 10.0, 0.0, 0.0, None, '0:24:2,27:96:3', .7),
    # drawn screen-sized in the game: baked large so its petals do not turn to blocks when scaled up
    'sakura_vortex':       ('VFX_Sakura_Vortex',       768, 512, 12.0, 0.0, 0.0, None, '0:117:3', .85),
    'sakura_ambient':      ('VFX_Sakura_Ambient',      256, 320, 3.6, 0.0, 0.0, None, '0:117:3', .8),
    # the ribbon runs 5 m along the floor in its 33-frame flight; the camera follows the head
    'sakura_ribbon':       ('VFX_Sakura_Ribbon',       576, 240, 1.8, .2, -1.0, (5 / 33, 0, 33), '0:60:2', 1.0, 5.0),
    # Takashi's gold set (vfx/src/VFX_Takashi_*.py; 66-takashi.js plays them)
    # the kunai flies 4 m in its 24-frame flight; the camera keeps the head still (frames 2-24 loop in flight)
    'tk_kunai':            ('VFX_Takashi_Kunai',       256, 128, 1.6, 0.0, -.3, (4 / 24, 0, 24), '2:24:2', 1.0, 4.0),
    'tk_kunai_hit':        ('VFX_Takashi_Kunai_Impact', 224, 224, 3.0, 0.0, 0.0, None, '0:30:2', 1.0),
    'tk_parry':            ('VFX_Takashi_Parry',       256, 256, 3.0, 0.0, 0.0, None, '0:27:1', .8),
    'tk_manifest':         ('VFX_Takashi_Manifest',    384, 640, 7.6, 3.2, 0.0, None, '0:40:2,43:114:3', .75),
    'tk_slash':            ('VFX_Takashi_Titan_Slash', 768, 320, 3.6, 1.0, 0.0, None, '0:30:1,32:72:2', .75),
    'tk_blade':            ('VFX_Takashi_Blade_Fall',  256, 640, 8.6, 3.9, 0.0, None, '0:30:1,32:75:3', .7),
    'tk_pulse':            ('VFX_Takashi_Pulse',       768, 320, 4.4, 1.2, 0.0, None, '0:30:1,32:66:2', .7),
    'tk_crack':            ('VFX_Takashi_Crack',       512, 320, 3.4, 1.0, 0.0, None, '0:87:3', .8),
    'tk_thunder':          ('VFX_Takashi_Thunder',     320, 768, 11.0, 5.0, 0.0, None, '0:30:1,32:87:3', .7),
    # Kage's seven rage arts (vfx/src/VFX_Rage_*.py; 67-rage-arts.js plays them, turned per strike)
    'rage_crimson':        ('VFX_Rage_Crimson_Crescent', 448, 448, 5.0, .6, 0.0, None, '0:20:1,22:34:2', .8),
    'rage_bolt':           ('VFX_Rage_Swallow_Bolt',   576, 224, 2.4, 0.0, 0.0, None, '0:18:1', .8),
    'rage_violet':         ('VFX_Rage_Violet_Slash',   512, 192, 2.0, 0.0, 0.0, None, '0:16:1,18:26:2', .8),
    'rage_hell':           ('VFX_Rage_Hell_Split',     512, 448, 4.6, 1.7, 0.0, None, '0:30:2,33:57:3', .75),
    'rage_tidal':          ('VFX_Rage_Tidal_Crash',    512, 512, 5.4, 2.2, 0.0, None, '0:30:2,33:48:3', .75),
    'rage_scythe':         ('VFX_Rage_Shadow_Scythe',  512, 512, 6.0, 1.8, 0.0, None, '0:24:1,26:28:2', .7),
    'rage_quake':          ('VFX_Rage_Gold_Quake',     896, 320, 4.2, 1.4, 0.0, None, '0:30:2,33:66:3', .7),
    # the Witness, Architect of Echoes (vfx/src/VFX_Witness_*.py; 69-witness.js plays them): one aura per phase (looped)
    'wt_aura1':            ('VFX_Witness_Aura_Observer', 256, 320, 3.8, 1.5, 0.0, None, '0:117:3', .8),
    'wt_aura2':            ('VFX_Witness_Aura_Manipulator', 384, 320, 3.8, 1.45, 0.0, None, '0:58:2', .8),
    'wt_aura3':            ('VFX_Witness_Aura_Editor', 384, 320, 3.8, 1.5, 0.0, None, '0:58:2', .8),
    'wt_aura4':            ('VFX_Witness_Aura_True',   448, 320, 4.0, 1.6, 0.0, None, '0:117:3', .75),
    # the Void Slash wave flies 5 m in its 30-frame flight; the camera keeps the head still (frames 2-30 loop in flight)
    'wt_wave':             ('VFX_Witness_Void_Wave',   256, 256, 2.4, .95, .45, (5 / 30, 0, 30), '2:30:2', 1.0, 5.0),
    'wt_step':             ('VFX_Witness_Echo_Step',   320, 320, 3.2, 1.0, 0.0, None, '0:44:2', .8),
    # an orbit blade flies 4 m in its 24-frame flight (frames 2-24 loop in flight, turned along it)
    'wt_blade':            ('VFX_Witness_Orbit_Blade', 256, 128, 1.6, 0.0, -.3, (4 / 24, 0, 24), '2:24:2', 1.0, 4.0),
    'wt_bind':             ('VFX_Witness_Bind',        256, 320, 3.0, 1.2, 0.0, None, '0:66:2', .8),
    'wt_gravity':          ('VFX_Witness_Gravity',     384, 320, 3.6, 1.0, 0.0, None, '0:58:2', .8),
    'wt_exec':             ('VFX_Witness_Execution',   448, 512, 5.6, 2.0, -.4, None, '0:30:1,32:72:2', .7),
    'wt_genesis':          ('VFX_Witness_Genesis',     768, 512, 8.0, 2.8, 0.0, None, '0:36:4,38:58:2,61:131:3', .7),
    'wt_anchor':           ('VFX_Witness_Anchor',      256, 320, 3.4, 1.2, 0.0, None, '0:58:2', .8),
    'wt_anchor_break':     ('VFX_Witness_Anchor_Break', 320, 448, 4.8, 2.0, 0.0, None, '0:58:2', .75),
    'wt_judgment':         ('VFX_Witness_Judgment',    1024, 384, 5.0, 1.6, 0.0, None, '0:52:4,53:70:1,72:113:3', .6),
    'wt_shatter':          ('VFX_Witness_Shatter',     384, 384, 4.4, 0.0, 0.0, None, '0:30:2,33:95:3', .75),
    # the Witness's blade (Echo Combo), the blows landing on it, the Manipulator's orb and cast, the Editor's rewrite and drain
    'wt_slash':            ('VFX_Witness_Slash',       384, 384, 4.4, .9, .3, None, '0:18:1,20:28:2', .8),
    'wt_slash_glitch':     ('VFX_Witness_Slash_Glitch', 384, 384, 4.4, .9, .3, None, '0:22:1,24:34:2', .8),
    'wt_hit':              ('VFX_Witness_Hit',         224, 224, 2.6, 0.0, .3, None, '0:18:1', .9),
    'wt_hit_glitch':       ('VFX_Witness_Hit_Glitch',  224, 224, 2.6, 0.0, .3, None, '0:14:1', .9),
    # an orb shot flies 4 m in its 27-frame flight; the camera keeps the head still (frames 2-26 loop in flight)
    'wt_orb':              ('VFX_Witness_Orb_Shot',    256, 192, 2.0, 0.0, -.3, (4 / 27, 0, 27), '2:26:2', 1.0, 4.0),
    'wt_orb_hit':          ('VFX_Witness_Orb_Impact',  256, 256, 2.8, 0.0, 0.0, None, '0:24:1', .9),
    'wt_cast':             ('VFX_Witness_Cast',        512, 256, 2.4, 0.0, 1.5, None, '0:40:2', .8),
    'wt_rewrite':          ('VFX_Witness_Rewrite',     192, 320, 3.0, 1.3, 0.0, None, '0:48:2', .8),
    'wt_drain':            ('VFX_Witness_Drain',       448, 256, 2.6, 1.0, -1.2, None, '0:58:2', .8),
}


def render(work, name, spec, out):
    eid, w, h, size, cy, cx, track, frames = spec[:8]
    godot = os.environ.get('GODOT') or 'godot'
    cmd = [godot, '--path', str(work), 'res://GameSheet.tscn', '--fixed-fps', '60', '--resolution', f'{w}x{h}', '--',
           f'--id={eid}', f'--out={out}', f'--frames={frames}', f'--size={size}', f'--cy={cy}', f'--cx={cx}',
           '--pitch=10'] + ([f'--track={track[0]}', f'--decel={track[1]}', f'--stop={track[2]}'] if track else []) +           ([f'--launch={spec[9]}'] if len(spec) > 9 else [])
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
