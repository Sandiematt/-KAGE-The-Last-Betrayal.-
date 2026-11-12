SUB_HEADS.oni = function (ctx, key, f, r, ink, flat, A, sv, t, acc, fill) {
  // Garan: a wild mane bound under a horned iron brow band, a snarling red oni menpō over the jaw
  fill([[0.2, -0.95], [-0.3, -1.3], [-0.86, -1.6, 1], [-0.76, -1.04], [-1.5, -1.12, 1], [-1.06, -0.56], [-1.78, -0.36, 1], [-1.06, -0.04], [-1.6, 0.46, 1], [-0.92, 0.38], [-1.16, 1.0, 1], [-0.6, 0.72], [-0.4, 0.0], [-0.1, -0.6]], A.pal.hair, { sd: r * 0.3, hd: r * 0.06, rim: true });
  fill([[-0.35, -0.85], [-0.95, -1.3], [-1.08, -1.94], [-0.74, -2.6, 1], [-0.76, -1.96], [-0.56, -1.46], [-0.1, -1.04]], SUB_LACQ_FAR, { sd: r * 0.1, rim: true });
  fill([[-1.0, -0.64, 1], [-0.4, -1.0], [0.42, -1.02], [1.0, -0.6], [1.04, -0.28, 1], [0.32, -0.46], [-0.4, -0.4], [-1.0, -0.3, 1]], SUB_IRON, { sd: r * 0.12, hd: r * 0.06, rim: true, detail: (g) => {
    g.fillStyle = ANIME.silver; for (const x of [-0.6, 0.0, 0.6]) { g.beginPath(); g.arc(r * x, -r * (0.68 + (x === 0 ? 0.08 : 0)), r * 0.05, 0, TAU); g.fill(); }
    if (!A.flat) _bolt(g, [[r * 0.75, -r * 0.82], [r * 0.5, -r * 0.6], [r * 0.62, -r * 0.52], [r * 0.34, -r * 0.36]], r * 0.04, acc[2]);
  } });
  fill([[0.05, -0.85], [0.6, -1.06], [1.02, -1.5], [1.08, -2.5, 1], [0.84, -1.72], [0.56, -1.38], [0.0, -1.16]], ORDER_HORN, { sd: r * 0.16, hd: r * 0.05, rim: true, detail: (g) => {
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(r * 0.44, -r * 0.88); g.lineTo(r * 0.3, -r * 1.24); g.stroke();
  } });
  // the red oni menpō: his own jaw in lacquer from under the broken nose, the snarl cut where his mouth is
  _subShell(ctx, A, r, f, 'mouth', SUB_RED_LACQ, { sd: r * 0.18, hd: r * 0.07, rim: true, detail: (g) => _subSnarl(g, r, 0.61, acc[1]) });
};
