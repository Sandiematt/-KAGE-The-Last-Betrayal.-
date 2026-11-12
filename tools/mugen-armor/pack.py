"""Pack the Mugen Armor parts cut by godot/mugen-armor for the game.

Reads .scratch/mugen-armor/raw (figure.png + figure_a.png: the keyed art's colour and alpha; mask_<part>.png: each
part's outline; lock.png + lock_a.png: the unwrapped lock strip) and godot/mugen-armor/parts.json, and writes:
  src/img/mugen_parts.webp     one atlas: every part, trimmed to its pixels (straight alpha), and the lock strip
  src/js/34d-mugen-parts.js    MUGEN_PARTS: each part's rectangle in the atlas, where its top-left sits in the art
                               (SVG px), its anchors (SVG px) and the halo ring; the lock strip's rectangle
Run from the repo root:  python -I tools/mugen-armor/pack.py [--preview]
--preview writes .scratch/mugen-armor/parts_preview.png (the atlas over a dark ground) and reassembled.png (every part
put back at its place in the art: it should read as the original figure).
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RAW = os.path.join(ROOT, '.scratch', 'mugen-armor', 'raw')
SPEC = json.load(open(os.path.join(ROOT, 'godot', 'mugen-armor', 'parts.json'), encoding='utf-8'))
ORDER = ['coat', 'halo', 'tasset_back', 'tasset_front', 'pauldron', 'head', 'obi', 'shin_far', 'shin_near', 'collar', 'bracer', 'charm', 'lock_tassel']
PAD = 2
FEATHER = {'head': 1.2, 'collar': 1.2}   # mask edge softness per part (art px; default 1.2: anti-aliasing only, so no part fades out anywhere). The head's is just anti-aliasing: a wider fade showed as a smudge
# where its cut runs over open background (the back of the neck)
ATLAS_W = 1024


def main():
    col = Image.open(os.path.join(RAW, 'figure.png')).convert('RGB')
    alp = Image.open(os.path.join(RAW, 'figure_a.png')).convert('L')
    pieces = []
    for name in ORDER:
        mask = Image.open(os.path.join(RAW, 'mask_%s.png' % name)).convert('L')
        # feathered cuts: where an outline runs through the figure (the neck under the head, the hair behind it), the
        # part fades out over a few pixels instead of ending on a hard straight line; along the figure's own edge the
        # alpha is already 0 outside it, so nothing else changes
        mask = mask.filter(ImageFilter.GaussianBlur(FEATHER.get(name, 1.2)))
        a = Image.composite(alp, Image.new('L', alp.size, 0), mask)   # alpha only inside the part
        # scale the alpha by the mask's soft edge too
        a = Image.frombytes('L', a.size, bytes((x * y + 127) // 255 for x, y in zip(a.tobytes(), mask.tobytes())))
        box = a.getbbox()
        if not box:
            print('empty part', name); continue
        x0, y0, x1, y1 = box
        rgba = col.crop(box).convert('RGBA')
        rgba.putalpha(a.crop(box))
        bo = SPEC['parts'][name].get('blackout')
        if bo:
            # the neck below the collar band's top, painted solid black: the head carries a plain black neck down into
            # the collar (which is drawn over it), never a second copy of the band
            m2 = Image.new('L', (1024, 1536), 0)
            ImageDraw.Draw(m2).polygon([tuple(q) for q in bo], fill=255)
            m2 = m2.filter(ImageFilter.GaussianBlur(1.5)).crop(box)
            black = Image.new('RGBA', rgba.size, (0, 0, 0, 255))
            black.putalpha(rgba.getchannel('A'))
            rgba = Image.composite(black, rgba, m2)
        if name == 'head':
            # the art's eye is painted out: the game draws its own (it squints in a hit, narrows as he moves) at the
            # same place (the head is pinned by its eye, see the anchors)
            ex, ey = SPEC['parts']['head']['anchors']['eye']
            px = rgba.load()
            for yy in range(ey - 16 - y0, ey + 16 - y0):
                for xx in range(ex - 20 - x0, ex + 20 - x0):
                    r, g, b_, al = px[xx, yy]
                    if r + g + b_ > 330: px[xx, yy] = (0, 0, 0, al)
        pieces.append((name, x0, y0, rgba))
    lock = Image.open(os.path.join(RAW, 'lock.png')).convert('RGB').convert('RGBA')
    lock.putalpha(Image.open(os.path.join(RAW, 'lock_a.png')).convert('L'))
    pieces.append(('lock', 0, 0, lock))
    # shelf packing, tallest first
    order = sorted(pieces, key=lambda p: -p[3].height)
    x = y = shelf = 0
    rects = {}
    for name, ox, oy, im in order:
        if x + im.width + PAD > ATLAS_W:
            x = 0; y += shelf + PAD; shelf = 0
        rects[name] = (x, y, im.width, im.height, ox, oy)
        x += im.width + PAD; shelf = max(shelf, im.height)
    H = y + shelf
    atlas = Image.new('RGBA', (ATLAS_W, H), (0, 0, 0, 0))
    for name, ox, oy, im in pieces:
        r = rects[name]; atlas.paste(im, (r[0], r[1]))
    out = os.path.join(ROOT, 'src', 'img', 'mugen_parts.webp')
    atlas.save(out, 'WEBP', quality=92, method=6)
    print('atlas %dx%d, %.1f KB' % (ATLAS_W, H, os.path.getsize(out) / 1024))
    parts = {}
    for name in ORDER:
        if name not in rects: continue
        r = rects[name]; p = SPEC['parts'][name]
        e = {'r': list(r[:4]), 'at': [r[4], r[5]], 'an': p['anchors']}
        if 'ring' in p: e['ring'] = p['ring']
        parts[name] = e
    lr = rects['lock']
    meta = {'img': '__IMG(mugen_parts.webp)__', 'parts': parts, 'lock': {'r': list(lr[:4])}}
    js = ('/* KAGE: the Mugen Armor, cut from the user\'s card art in Godot (godot/mugen-armor; generated by\n'
          '   tools/mugen-armor/pack.py; do not edit). parts.<name>: r [x, y, w, h] in the atlas, at [x, y] where its top-left\n'
          '   sits in the art (1024x1536 SVG px), an: its anchors in the art. lock.r: the unwrapped lock strip (x along it,\n'
          '   root at 0; y across, upper edge at 0). Drawn on Kage\'s skeleton by 21-characters/kage/armory/mugen.js. */\n'
          'const MUGEN_PARTS = ' + json.dumps(meta, separators=(',', ':')) + ';\n')
    with open(os.path.join(ROOT, 'src', 'js', '34d-mugen-parts.js'), 'w', encoding='utf-8') as f:
        f.write(js)
    if '--preview' in sys.argv:
        bg = Image.new('RGBA', atlas.size, (40, 30, 36, 255))
        Image.alpha_composite(bg, atlas).convert('RGB').save(os.path.join(ROOT, '.scratch', 'mugen-armor', 'parts_preview.png'))
        board = Image.new('RGBA', (1024, 1536), (59, 45, 52, 255))
        for name, ox, oy, im in pieces:
            if name == 'lock': continue
            board.alpha_composite(im, (ox, oy))
        board.convert('RGB').resize((512, 768), Image.LANCZOS).save(os.path.join(ROOT, '.scratch', 'mugen-armor', 'reassembled.png'))


if __name__ == '__main__':
    main()
