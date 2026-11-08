/* ---- the mitsudomoe: three red commas swirling round a centre ---- */
function raikonTomoe(g, x, y, R, rot, col) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col;
  for (let i = 0; i < 3; i++) {
    const a = i * TAU / 3, hx = Math.cos(a) * R * 0.4, hy = Math.sin(a) * R * 0.4, hr = R * 0.3;
    g.beginPath(); g.arc(hx, hy, hr, a - Math.PI * 0.5, a + Math.PI * 0.5, true);
    // the tail sweeps round the rim to the next head
    g.quadraticCurveTo(Math.cos(a + 1.3) * R * 1.1, Math.sin(a + 1.3) * R * 1.1, Math.cos(a + 2.1) * R * 0.95, Math.sin(a + 2.1) * R * 0.95);
    g.quadraticCurveTo(Math.cos(a + 1.2) * R * 0.78, Math.sin(a + 1.2) * R * 0.78, hx + Math.cos(a + Math.PI * 0.5) * hr, hy + Math.sin(a + Math.PI * 0.5) * hr);
    g.closePath(); g.fill();
  }
  g.restore();
}
