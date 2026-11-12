SUBB_HEADS.iron_kabuto = function (ctx, key, f, r, ink, flat, A, sv, t, acc, sub, fill, studs, shikoro) {
  // Gonryu's tetsu kabuto: a deep laced shikoro, an iron menpō, a ribbed bowl banded gold, the visor, and great
  // gold kuwagata rising off the brow round a gate stud; the menpō is cut down to a hōate, so his face shows
  if (f.isPlayer) drawKageHair(ctx, r * 0.9, ink, flat, f);
  shikoro([[0.12, -0.56], [-0.9, -0.84], [-1.62, 0.0], [-2.0, 0.82, 1], [-0.96, 1.02], [-0.42, 0.5], [-0.2, -0.2]], SUB_IRON, 1.0, 0.72, acc[0]);
  // the iron hōate on the jaw and cheeks (nose and lips bare), its gold-edged rim, laced throat lames under it
  _subThroat(ctx, A, r, SUB_IRON, acc[0]);
  _subShell(ctx, A, r, f, 'chin', SUB_IRON, { sd: r * 0.18, hd: r * 0.07, rim: true, detail: (g) => {
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(r * 0.2, r * 0.3); g.lineTo(r * 0.58, r * 0.8); g.lineTo(r * 1.4, r * 0.82); g.stroke();
  } });
  fill([[1.1, -0.34, 1], [0.98, -1.02], [0.2, -1.46], [-0.72, -1.26], [-1.18, -0.4, 1]], SUB_IRON, { sd: r * 0.32, hd: r * 0.08, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.045; g.beginPath();
    for (const x of [-0.7, -0.35, 0.0, 0.35, 0.7]) { g.moveTo(r * 0.1, -r * 1.4); g.quadraticCurveTo(r * (x * 1.1), -r * 1.1, r * x * 1.25, -r * 0.42); }
    g.stroke();
    g.strokeStyle = SUB_IRON[2]; g.lineWidth = r * 0.025; g.beginPath();
    for (const x of [-0.32, 0.03, 0.38]) { g.moveTo(r * 0.12, -r * 1.36); g.quadraticCurveTo(r * (x * 1.1 + 0.03), -r * 1.1, r * (x * 1.25 + 0.04), -r * 0.44); }
    g.stroke();
    g.strokeStyle = acc[0]; g.lineWidth = r * 0.16; g.beginPath(); g.moveTo(-r * 1.14, -r * 0.5); g.quadraticCurveTo(0, -r * 0.66, r * 1.08, -r * 0.46); g.stroke();
    studs(g, [[-0.8, -0.56], [-0.4, -0.6], [0.0, -0.62], [0.4, -0.6], [0.8, -0.54]], 0.05);
  } });
  fill([[0.36, -0.52], [1.46, -0.46, 1], [1.36, -0.28, 1], [0.36, -0.34]], SUB_IRON, { sd: r * 0.06 });
  fill([[0.34, -0.52], [0.18, 0.1, 1], [-0.32, 0.0], [-0.16, -0.54]], SUB_IRON, { sd: r * 0.1, hd: r * 0.04, detail: (g) => { g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 0.3, -r * 0.48); g.lineTo(r * 0.16, r * 0.04); g.stroke(); } });
  // the kuwagata
  fill([[0.5, -1.0, 1], [0.92, -1.6], [1.36, -2.7, 1], [0.82, -1.86], [0.4, -1.2, 1]], CROWN_GOLD, { sd: r * 0.08, hd: r * 0.03, rim: true });
  fill([[0.34, -1.04, 1], [0.14, -1.9], [-0.22, -2.84, 1], [0.3, -1.96], [0.56, -1.12, 1]], [CROWN_GOLD[0], CROWN_GOLD[0], CROWN_GOLD[1]], { sd: r * 0.06 });
  celFill(ctx, () => ctx.arc(r * 0.5, -r * 1.02, r * 0.17, 0, TAU), GOLDM, A, { sd: r * 0.05, hd: r * 0.03 });
};
