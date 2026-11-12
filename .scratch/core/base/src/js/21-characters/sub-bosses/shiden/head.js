SUB_HEADS.sentinel_helm = function (ctx, key, f, r, ink, flat, A, sv, t, acc, fill) {
  // a hoshi kabuto: a star-riveted bowl, a flared shikoro laced violet, turned-back wings, a forked lightning
  // maedate in silver, an iron half menpō
  const SH = [[0.12, -0.56], [-0.86, -0.82], [-1.5, 0.0], [-1.8, 0.7, 1], [-0.9, 0.9], [-0.42, 0.46], [-0.2, -0.2]];
  fill(SH, SUB_LACQ, { sd: r * 0.26, hd: r * 0.05, rim: true, detail: (g) => {
    for (let i = 1; i <= 3; i++) {
      const k = i / 4;
      g.strokeStyle = acc[1]; g.lineWidth = r * 0.07; g.setLineDash([r * 0.06, r * 0.07]);
      g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.3 + k * 0.95)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.52 + k), r * (-1.2 - k * 0.6), r * (-0.4 + k * 1.25)); g.stroke();
      g.setLineDash([]);
      g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.06;
      g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.4 + k * 0.95)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.62 + k), r * (-1.2 - k * 0.6), r * (-0.5 + k * 1.25)); g.stroke();
    }
  } });
  _halfMask(ctx, A, r);
  fill(KABUTO_BOWL, SUB_LACQ, { sd: r * 0.3, hd: r * 0.08, rim: true, detail: (g) => {
    g.fillStyle = ANIME.silver;
    for (const [x, y0] of [[-0.62, -0.98], [-0.2, -1.18], [0.24, -1.16], [0.62, -0.96]]) for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(r * x * (1 + j * 0.12), r * (y0 + j * 0.2), r * 0.04, 0, TAU); g.fill(); }
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(-r * 1.1, -r * 0.47); g.quadraticCurveTo(0, -r * 0.6, r * 1.05, -r * 0.43); g.stroke();
  } });
  fill([[0.42, -0.5], [1.32, -0.44, 1], [1.24, -0.3, 1], [0.4, -0.34]], SUB_LACQ, { sd: r * 0.06 });
  fill([[0.34, -0.5], [0.24, 0.04, 1], [-0.22, -0.04], [-0.1, -0.52]], [acc[0], acc[0], acc[1]], { sd: r * 0.1, hd: r * 0.04 });
  fill([[0.52, -1.02, 1], [0.86, -1.6, 1], [0.66, -1.62, 1], [1.12, -2.36, 1], [0.92, -1.84, 1], [1.08, -1.82, 1], [0.7, -1.2, 1], [0.66, -1.04, 1]], ['#4a4d53', ANIME.silver, ANIME.silverHi], { sd: r * 0.08, hd: r * 0.03, rim: true });
  fill([[0.4, -1.06, 1], [0.12, -1.66, 1], [0.3, -1.66, 1], [-0.06, -2.2, 1], [0.44, -1.6, 1], [0.28, -1.58, 1], [0.58, -1.08, 1]], ['#3c3f45', '#6f737a', '#aeb2b8'], { sd: r * 0.06 });
};
