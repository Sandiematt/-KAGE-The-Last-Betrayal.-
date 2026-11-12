/* ---- layers: a translucent fighter or afterimage is drawn opaque into an offscreen canvas, then composited once, so
   its overlapping parts never show through each other ---- */
const _animeLayers = [];

function animeLayer(ctx, alpha, idx, fn) {
  const cv = ctx.canvas;
  if (!cv || typeof document === 'undefined' || !ctx.getTransform) { ctx.save(); ctx.globalAlpha *= alpha; fn(ctx); ctx.restore(); return; }
  let L = _animeLayers[idx];
  if (!L) { L = document.createElement('canvas'); _animeLayers[idx] = L; }
  if (L.width !== cv.width || L.height !== cv.height) { L.width = cv.width; L.height = cv.height; }
  const g = L.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, L.width, L.height);
  g.setTransform(ctx.getTransform()); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.lineCap = 'round'; g.lineJoin = 'round';
  fn(g);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= alpha; ctx.drawImage(L, 0, 0); ctx.restore();
}

// 'rgba(r,g,b,a)' / '#rrggbb' -> [opaque colour, alpha]
const _colA = {};

function splitAlpha(c) {
  let v = _colA[c]; if (v) return v;
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (m) { const p = m[1].split(',').map(x => x.trim()); v = [`rgb(${p[0]},${p[1]},${p[2]})`, p[3] != null ? +p[3] : 1]; } else v = [c, 1];
  return (_colA[c] = v);
}

// an afterimage (Effects.afterimage): the fighter's packed render pose from that moment, drawn as one flat silhouette
Fighter.prototype.drawAfterimage = function (ctx, snap, facing, headRot, color) {
  const cur = this._ghostCur || (this._ghostCur = []);
  const n = this.packRender(cur); if (snap.length < n) return;   // its cloth changed since: skip rather than misread
  const fc = this.facing;
  this.facing = facing; this.unpackRender(snap); this._ghostHead = headRot;
  this.silhouette(ctx, color, color, true, { color, noEyes: true });
  this._ghostHead = null; this.facing = fc; this.unpackRender(cur);
};
