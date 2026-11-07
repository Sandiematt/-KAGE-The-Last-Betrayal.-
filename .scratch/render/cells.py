import sys, json
from PIL import Image, ImageChops
part, ids = sys.argv[1], sys.argv[2].split(',')
vars_ = ['idle','attack','flat','white','left']
a = Image.open(f'before/{part}.png').convert('RGB'); b = Image.open(f'after/{part}.png').convert('RGB')
d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 2 else 0)
cw, ch, cols = 190, 260, 10
labels = [f'{i} {v}' for i in ids for v in vars_]
out = {}
for k, lab in enumerate(labels):
    x, y = (k % cols) * cw, (k // cols) * ch
    bb = d.crop((x, y, x + cw, y + ch)).getbbox()
    if bb: out[lab] = bb
print(json.dumps(out, indent=0))
