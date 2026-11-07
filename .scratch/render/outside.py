from PIL import Image, ImageChops, ImageDraw
R = {  # character areas (x0, y0, x1, y1) in the 1280x720 screen
 'title': [(680, 330, 1090, 720)],
 'profile': [(860, 330, 1100, 720)],
 'armory': [(20, 120, 610, 680)],
 'trials': [(490, 0, 1280, 720)],
 'bossrush': [(460, 110, 1200, 660)],
 'hud': [(20, 15, 112, 105), (240, 150, 960, 640)],
 'result': [(60, 140, 640, 720)],
}
def mask(a, b):
    return ImageChops.difference(a.convert('RGB'), b.convert('RGB')).convert('L').point(lambda v: 255 if v > 8 else 0)
print('screen     changed  in-char  outside  | noise(cur vs cur) outside')
for n, rects in R.items():
    a, b, c = (Image.open(f'{d}/{n}.png') for d in ('uibase', 'uicur', 'uicur2'))
    m, nm = mask(a, b), mask(b, c)
    cut = Image.new('L', m.size, 255); dr = ImageDraw.Draw(cut)
    for r in rects: dr.rectangle(r, fill=0)
    out = ImageChops.multiply(m, cut); nout = ImageChops.multiply(nm, cut)
    cnt = lambda im: sum(1 for v in im.tobytes() if v)
    t, o, no = cnt(m), cnt(out), cnt(nout)
    print(f'{n:9s} {t:8d} {t - o:8d} {o:8d}  | {no:8d}   outside-bbox {out.getbbox()}')
