# usage: python pdiff.py a.png b.png [out.png] -> prints changed-pixel count and bbox; writes a diff mask if out given
import sys
from PIL import Image, ImageChops
a = Image.open(sys.argv[1]).convert('RGB'); b = Image.open(sys.argv[2]).convert('RGB')
if a.size != b.size: print('SIZE', a.size, b.size); sys.exit(1)
d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 2 else 0)
n = sum(1 for v in d.getdata() if v); print(sys.argv[2], 'changed px:', n, 'bbox:', d.getbbox())
if len(sys.argv) > 3 and n: d.save(sys.argv[3])
