import sys
from PIL import Image, ImageOps
# usage: cmp.py ours.png phase out.png   (ref mirrored to face right, scaled to our body height, feet aligned)
ours, ph, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
R = Image.open('../../../docs/art-reference/witness-phase-%d.webp' % ph).convert('RGB')
R = ImageOps.mirror(R)
# ref: head centre and feet (mirrored x = 1254 - x)
hx, hy, fy = 1254 - 530, 470, 1140
k = 560 / (fy - hy)
R = R.resize((int(1254 * k), int(1254 * k)))
O = Image.open(ours).convert('RGB')
# our head: x = 500 + 19*1.9 = 536, feet at y = 900 (hover ~ -15)
ox, oy = 536, 900 - 14
canvas = Image.new('RGB', (1000, 1000), (20, 6, 8))
canvas.paste(R, (int(ox - hx * k), int(oy - fy * k)))
o = Image.new('RGB', (2000, 1000)); o.paste(canvas, (0, 0)); o.paste(O, (1000, 0))
o.resize((1400, 700)).save(out)
