SUBB_HEADS.storm_band = function (ctx, key, f, r, ink, flat, A, sv, t, acc, sub, fill, studs, shikoro) {
  // Kasane: hair swept back and tied short at the nape; Kage keeps his own hair under the band
  if (f.isPlayer) drawKageHair(ctx, r, ink, flat, f);
  else {
    fill([[-0.9, -0.5], [-1.5, -0.78], [-2.0, -0.42, 1], [-1.56, -0.3], [-1.86, 0.02, 1], [-1.3, -0.08], [-0.94, -0.1]], A.pal.hair, { sd: r * 0.12, rim: true });
    fill([[0.72, -0.6], [0.3, -1.04], [-0.42, -1.1], [-0.98, -0.68], [-1.06, 0.12], [-0.84, 0.66, 1], [-0.62, 0.22], [-0.34, -0.3], [0.3, -0.52]], A.pal.hair, { sd: r * 0.26, hd: r * 0.06, rim: true, detail: (g) => {
      g.strokeStyle = A.pal.hair[2]; g.lineWidth = r * 0.05; g.beginPath();
      for (const y of [-0.92, -0.78]) { g.moveTo(r * 0.5, r * (y + 0.2)); g.quadraticCurveTo(-r * 0.2, r * (y - 0.12), -r * 0.92, r * (y + 0.36)); }
      g.stroke();
    } });
  }
  // the band round the brow, its edges in the accent
  fill([[-1.02, -0.66, 1], [0.0, -0.76], [1.0, -0.6, 1], [1.0, -0.32, 1], [0.0, -0.46], [-1.02, -0.38, 1]], ['#08070b', '#141219', '#28242f'], { sd: r * 0.08, detail: (g) => {
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(-r, -r * 0.62); g.quadraticCurveTo(0, -r * 0.72, r, -r * 0.57); g.moveTo(-r, -r * 0.42); g.quadraticCurveTo(0, -r * 0.5, r, -r * 0.35); g.stroke();
  } });
  // the iron plate on the front: riveted, engraved with a ledger entry struck through
  fill([[0.06, -0.8, 1], [0.98, -0.68, 1], [1.04, -0.26, 1], [0.08, -0.32, 1]], SUB_IRON, { sd: r * 0.1, hd: r * 0.05, rim: true, detail: (g) => {
    g.fillStyle = ANIME.silver; for (const [x, y] of [[0.16, -0.72], [0.9, -0.62], [0.92, -0.33], [0.18, -0.38]]) { g.beginPath(); g.arc(r * x, r * y, r * 0.035, 0, TAU); g.fill(); }
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.035; g.beginPath();
    for (const [y, w] of [[-0.62, 0.42], [-0.52, 0.3], [-0.42, 0.38]]) { g.moveTo(r * 0.36, r * y); g.lineTo(r * (0.36 + w), r * (y + 0.01)); }
    g.stroke();
    g.strokeStyle = acc[2]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(r * 0.32, -r * 0.36); g.lineTo(r * 0.84, -r * 0.68); g.stroke();
  } });
  // the knot at the back
  fill([[-0.92, -0.62], [-1.24, -0.7, 1], [-1.2, -0.3, 1], [-0.92, -0.38]], [acc[0], acc[0], acc[1]], { sd: r * 0.06 });
};
