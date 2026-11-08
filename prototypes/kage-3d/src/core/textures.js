// Small canvas-texture helpers: everything painted in code, like the 2D game (no image files needed).
import * as THREE from 'three';

export function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

export function texture(c, opts = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (opts.repeatX) { t.wrapS = THREE.RepeatWrapping; }
  if (opts.nearest) { t.magFilter = THREE.NearestFilter; }
  return t;
}

// a soft round glow (the eye halo, the moon bloom)
export function radialTexture(inner, outer, size = 128) {
  const [c, g] = canvas(size, size), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  return texture(c);
}

// the crimson cloud swirl of Kage's embroidery (a port of cloudMotif in src/js/21-characters/kage/embroidery.js)
export function cloudMotif(g, x, y, R, rot, col, lw) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
  g.beginPath();
  for (let i = 0; i <= 26; i++) { const a = i / 26 * Math.PI * 3.1, rr = R * (0.12 + 0.88 * i / 26); const px = Math.cos(a) * rr, py = Math.sin(a) * rr * 0.86; i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.quadraticCurveTo(R * 1.6, R * 0.2, R * 2.1, -R * 0.5);
  g.stroke();
  g.beginPath(); g.arc(-R * 0.9, R * 0.55, R * 0.62, Math.PI * 0.6, Math.PI * 1.75); g.stroke();
  g.beginPath(); g.arc(R * 0.5, R * 1.05, R * 0.55, Math.PI * 0.1, Math.PI * 1.05); g.stroke();
  g.beginPath(); g.arc(-R * 0.2, -R * 0.45, R * 0.42, Math.PI * 1.3, Math.PI * 2.4); g.stroke();
  g.beginPath(); g.moveTo(-R * 1.3, R * 0.3); g.quadraticCurveTo(-R * 1.7, -R * 0.1, -R * 1.55, -R * 0.6); g.stroke();
  g.fillStyle = col; g.beginPath(); g.arc(-R * 1.45, R * 0.15, lw * 0.9, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(R * 0.7, -R * 0.3, lw * 0.65, 0, Math.PI * 2); g.fill();
  g.restore();
}
// the wave crest and plum blossom accents of the same hem
export function waveMotif(g, x, y, w, rot, col, lw) {
  g.save(); g.translate(x, y); g.rotate(rot); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ox = (i - 1) * w * 0.7, s = 1 - Math.abs(i - 1) * 0.15;
    g.beginPath(); g.moveTo(ox - w * 0.35 * s, 0);
    g.quadraticCurveTo(ox - w * 0.1 * s, -w * 0.45 * s, ox + w * 0.05 * s, -w * 0.35 * s);
    g.quadraticCurveTo(ox + w * 0.2 * s, -w * 0.25 * s, ox + w * 0.35 * s, 0); g.stroke();
    g.beginPath(); g.moveTo(ox + w * 0.05 * s, -w * 0.35 * s); g.quadraticCurveTo(ox + w * 0.15 * s, -w * 0.5 * s, ox + w * 0.28 * s, -w * 0.32 * s); g.stroke();
  }
  g.restore();
}
export function plumBlossom(g, x, y, r, col, lw) {
  g.save(); g.translate(x, y); g.strokeStyle = col; g.lineWidth = lw * 0.7;
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; g.beginPath(); g.ellipse(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.42, r * 0.28, a, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = col; g.beginPath(); g.arc(0, 0, lw * 0.6, 0, Math.PI * 2); g.fill();
  g.restore();
}
