import sys
from PIL import Image, ImageChops
name, out = sys.argv[1], sys.argv[2]
a = Image.open(f'uibase/{name}.png').convert('RGB'); b = Image.open(f'uicur/{name}.png').convert('RGB')
n2 = Image.open(f'uicur2/{name}.png').convert('RGB') if len(sys.argv) > 3 else None
d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 8 else 0)
heat = Image.blend(b.convert('L').convert('RGB'), Image.new('RGB', b.size, (0, 0, 0)), 0.6)
red = Image.new('RGB', b.size, (255, 40, 40)); heat.paste(red, (0, 0), d)
W, H = a.size; c = Image.new('RGB', (W * 3, H + 30), (20, 20, 20)); c.paste(a, (0, 30)); c.paste(b, (W, 30)); c.paste(heat, (W * 2, 30))
from PIL import ImageDraw; dr = ImageDraw.Draw(c)
for i, t in enumerate(['pre-redesign f4756e6', 'after (SAN-58)', 'difference (red, >8/255)']): dr.text((i * W + 8, 8), f'{name}: {t}', fill=(230, 220, 200))
c.save(out)
