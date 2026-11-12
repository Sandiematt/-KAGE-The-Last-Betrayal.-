# python strip.py outdir id cols out.png  -> grid of frames (crop to the action, half size)
import sys, glob, cv2, numpy as np
d, ident, cols, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
fs = sorted(glob.glob(f'{d}/{ident}_*.png'))
ims = [cv2.imread(f)[60:600, 100:1180] for f in fs]
ims = [cv2.resize(i, (i.shape[1] // 2, i.shape[0] // 2), interpolation=cv2.INTER_AREA) for i in ims]
for k, i in enumerate(ims): cv2.putText(i, str(k), (6, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
rows = [np.hstack(ims[r:r + cols] + [np.zeros_like(ims[0])] * (cols - len(ims[r:r + cols]))) for r in range(0, len(ims), cols)]
cv2.imwrite(out, np.vstack(rows))
