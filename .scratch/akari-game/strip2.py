# python strip2.py dir id cols out [x0 y0 x1 y1 scale]
import sys, glob, cv2, numpy as np
d, ident, cols, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
x0, y0, x1, y1, sc = (list(map(float, sys.argv[5:10])) + [None] * 5)[:5] if len(sys.argv) > 5 else (150, 40, 950, 640, 0.5)
fs = sorted(glob.glob(f'{d}/{ident}_*.png'))
ims = [cv2.imread(f)[int(y0):int(y1), int(x0):int(x1)] for f in fs]
ims = [cv2.resize(i, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA) for i in ims]
for k, i in enumerate(ims): cv2.putText(i, str(k), (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
rows = [np.hstack(ims[r:r + cols] + [np.zeros_like(ims[0])] * (cols - len(ims[r:r + cols]))) for r in range(0, len(ims), cols)]
cv2.imwrite(out, np.vstack(rows))
