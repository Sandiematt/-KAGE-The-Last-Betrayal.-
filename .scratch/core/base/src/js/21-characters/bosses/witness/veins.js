/* ---- helpers ---- */
// a jagged line a -> b: n segments alternating `amp` px either side (deterministic)
function _wtJag(a, b, n, amp, ph) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, out = [a];
  for (let i = 1; i < n; i++) { const u = i / n, z = (i % 2 ? 1 : -1) * amp * (0.6 + 0.4 * _hash(i * 3.7 + (ph || 0))); out.push([a[0] + dx * u + nx * z, a[1] + dy * u + ny * z]); }
  out.push(b); return out;
}

// a glowing vein: a dark groove, an additive bloom and a bright core (as _bolt, thinner)
function _wtVein(g, pts, w, col, glow) {
  const path = () => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); };
  g.lineJoin = 'miter'; g.lineCap = 'round';
  g.strokeStyle = ANIME.outline; g.lineWidth = w * 2.4; path(); g.stroke();
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= 0.4; g.strokeStyle = glow || col; g.lineWidth = w * 3.6; path(); g.stroke(); g.restore();
  g.strokeStyle = col; g.lineWidth = w; path(); g.stroke();
  g.lineJoin = 'round';
}

// a point in the frame of a limb a -> b: u along it, o px to its front (the fighter's facing side)
function _wtLimb(a, b, f) {
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = dy / l * f, ny = -dx / l * f;
  return { l, ux: dx / l, uy: dy / l, nx, ny, at: (u, o) => [a.x + dx * u + nx * o, a.y + dy * u + ny * o] };
}

function lerp2(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
