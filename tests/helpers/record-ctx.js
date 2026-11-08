// A recording 2D canvas context for drawing tests: every fill and stroke is logged with the colour, alpha and composite
// mode in force, and every clip() and every even-odd fill (celFill's cel-shade strips, 21-characters/_shared/) is counted.
// Paths and transforms are accepted and ignored, so any drawing code runs; nothing is rasterised.
'use strict';
function recordCtx() {
  const st = { fillStyle: '#000', strokeStyle: '#000', globalAlpha: 1, globalCompositeOperation: 'source-over', lineWidth: 1, lineCap: 'butt', lineJoin: 'miter', font: '', textAlign: 'left', textBaseline: 'alphabetic', filter: 'none', shadowBlur: 0, shadowColor: 'rgba(0,0,0,0)', imageSmoothingEnabled: true, lineDashOffset: 0, miterLimit: 10, shadowOffsetX: 0, shadowOffsetY: 0 };
  const stack = [];
  const log = { ops: [], clips: 0, evenodd: 0 };
  const style = (v) => (typeof v === 'string' ? v.toLowerCase().replace(/\s+/g, '') : 'gradient');
  const paint = (op, which, rule) => {
    log.ops.push({ op, color: style(st[which]), alpha: st.globalAlpha, comp: st.globalCompositeOperation });
    if (rule === 'evenodd') log.evenodd++;
  };
  const gradient = () => ({ addColorStop() {} });
  const api = {
    save() { stack.push(Object.assign({}, st)); },
    restore() { const s = stack.pop(); if (s) Object.assign(st, s); },
    fill(a, b) { paint('fill', 'fillStyle', typeof a === 'string' ? a : b); },
    stroke() { paint('stroke', 'strokeStyle'); },
    fillRect() { paint('fill', 'fillStyle'); },
    strokeRect() { paint('stroke', 'strokeStyle'); },
    fillText() { paint('text', 'fillStyle'); },
    clip() { log.clips++; },
    drawImage() { log.ops.push({ op: 'image', color: 'image', alpha: st.globalAlpha, comp: st.globalCompositeOperation }); },
    getTransform() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; },
    createLinearGradient: gradient, createRadialGradient: gradient, createConicGradient: gradient, createPattern: () => ({}),
    measureText: (t) => ({ width: String(t).length * 6 }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(0, w * h * 4)), width: w, height: h }),
    isPointInPath: () => false, getLineDash: () => [],
    canvas: { width: 1280, height: 720 }
  };
  const noop = () => {};
  const ctx = new Proxy(api, {
    get(t, k) { if (k in t) return t[k]; if (k in st) return st[k]; if (k === 'log') return log; return noop; },
    set(t, k, v) { st[k] = v; return true; }
  });
  return ctx;
}
module.exports = { recordCtx };
