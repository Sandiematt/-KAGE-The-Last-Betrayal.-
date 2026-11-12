SUBB_HEADS.oni_mask = SUBB_HEADS.oni_echo = function (ctx, key, f, r, ink, flat, A, sv, t, acc, sub, fill, studs, shikoro) {
  const echo = key === 'oni_echo', warden = sub === 'echo_warden', moro = sub === 'moro';
  if (f.isPlayer) drawKageHair(ctx, r * 0.92, ink, flat, f);
  if (echo && warden) {
    // the Echo Warden: a heavy oni kabuto, a crest of violet-edged spikes, long horns, a fanged menpō
    shikoro([[0.12, -0.56], [-0.9, -0.84], [-1.6, 0.0], [-1.96, 0.8, 1], [-0.96, 1.0], [-0.42, 0.5], [-0.2, -0.2]], VIOLET_LACQ, 1.0, 0.7, acc[1]);
    fill([[-0.4, -1.1], [-0.7, -1.9, 1], [-0.28, -1.5], [-0.1, -2.3, 1], [0.12, -1.5], [0.42, -2.0, 1], [0.48, -1.2]], VIOLET_LACQ, { sd: r * 0.1, rim: true, detail: (g) => {
      g.strokeStyle = acc[1]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(-r * 0.7, -r * 1.9); g.lineTo(-r * 0.48, -r * 1.3); g.moveTo(-r * 0.1, -r * 2.3); g.lineTo(-r * 0.06, -r * 1.5); g.moveTo(r * 0.42, -r * 2.0); g.lineTo(r * 0.34, -r * 1.3); g.stroke();
    } });
    fill([[1.08, -0.34, 1], [0.96, -1.0], [0.2, -1.38], [-0.72, -1.2], [-1.16, -0.4, 1]], VIOLET_LACQ, { sd: r * 0.3, hd: r * 0.08, rim: true, detail: (g) => {
      g.strokeStyle = acc[1]; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(-r * 1.12, -r * 0.48); g.quadraticCurveTo(0, -r * 0.62, r * 1.06, -r * 0.44); g.stroke();
    } });
    fill([[0.6, -0.94], [1.3, -1.4], [1.9, -2.3, 1], [1.2, -1.36], [0.7, -0.72]], ORDER_HORN, { sd: r * 0.12, hd: r * 0.04, rim: true });
    fill([[-0.3, -1.0], [-0.9, -1.6], [-1.2, -2.5, 1], [-0.64, -1.5], [-0.1, -1.08]], ORDER_HORN, { sd: r * 0.1 });
  } else if (echo) {
    // the Echo Sentinel: a close hood, long horns swept back from it
    fill([[0.5, -0.9], [-0.3, -1.12], [-1.02, -0.7], [-1.12, 0.3], [-0.82, 1.2], [-0.1, 1.3], [0.3, 1.06], [0.0, 0.6], [-0.2, 0.0], [0.1, -0.6]], ['#08060d', '#110e18', '#241f31'], { sd: r * 0.3, hd: r * 0.05, rim: true });
    fill([[0.62, -0.84], [0.5, -1.5], [-0.1, -2.0], [-1.0, -2.1, 1], [-0.3, -1.7], [0.18, -1.3], [0.36, -0.84]], ORDER_HORN, { sd: r * 0.1, rim: true });
    fill([[0.3, -0.92], [0.0, -1.4], [-0.8, -1.68], [-1.95, -1.46, 1], [-0.9, -1.34], [-0.3, -1.04], [-0.05, -0.84]], ORDER_HORN, { sd: r * 0.1, hd: r * 0.04, rim: true, detail: (g) => { g.strokeStyle = acc[1]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(r * 0.1, -r * 1.1); g.quadraticCurveTo(-r * 0.6, -r * 1.5, -r * 1.8, -r * 1.47); g.stroke(); } });
  } else if (moro) {
    // Moro: a close dark hood under the brow plate (the conduit tube runs into it from the back)
    fill([[0.5, -0.9], [-0.3, -1.12], [-1.02, -0.7], [-1.12, 0.3], [-0.82, 1.2], [-0.1, 1.3], [0.3, 1.06], [0.0, 0.6], [-0.2, 0.0], [0.1, -0.6]], A.pal.fab, { sd: r * 0.3, hd: r * 0.05, rim: true, detail: (g) => {
      g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.3, -r * 1.0); g.quadraticCurveTo(-r * 0.86, -r * 0.3, -r * 0.6, r * 0.9); g.stroke();
      if (!A.flat) { g.fillStyle = SUB_IRON[2]; g.beginPath(); g.arc(-r * 0.92, r * 0.2, r * 0.12, 0, TAU); g.fill(); }
    } });
  }
  if (!echo) {
    // the brow plate and its two short iron horns
    const tone = moro ? VIOLET_LACQ : SUB_IRON;
    fill([[-0.36, -0.92], [-0.52, -1.5], [-0.7, -1.96, 1], [-0.26, -1.42], [-0.06, -0.98]], ORDER_HORN, { sd: r * 0.08 });
    fill([[0.2, -0.9], [0.48, -1.5], [0.36, -2.12, 1], [0.74, -1.5], [0.68, -0.9]], ORDER_HORN, { sd: r * 0.12, hd: r * 0.04, rim: true });
    fill([[-0.92, -0.72, 1], [-0.2, -0.98], [0.6, -0.94], [1.0, -0.62], [1.04, -0.34, 1], [0.3, -0.5], [-0.5, -0.46], [-0.94, -0.4, 1]], tone, { sd: r * 0.12, hd: r * 0.06, rim: true, detail: (g) => {
      g.fillStyle = ANIME.silver; for (const x of [-0.6, 0.0, 0.62]) { g.beginPath(); g.arc(r * x, -r * 0.66, r * 0.045, 0, TAU); g.fill(); }
      g.strokeStyle = acc[1]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(-r * 0.9, -r * 0.44); g.quadraticCurveTo(0, -r * 0.56, r * 1.0, -r * 0.38); g.stroke();
    } });
  }
  // the menpō (the sentinel's covers the whole face, the eyes glowing through its holes)
  const full = echo && !warden;
  const MASK = full ? [[0.0, -0.78], [0.78, -0.74], [1.08, -0.3], [1.22, 0.32, 1], [1.02, 0.72], [0.6, 1.12], [0.16, 1.02], [-0.12, 0.4]]
    : [[-0.12, 0.2], [0.55, 0.12], [1.04, 0.2], [1.24, 0.42, 1], [1.08, 0.64], [0.98, 0.94], [0.56, 1.12], [0.12, 1.02], [-0.16, 0.6]];
  fill(MASK, echo || moro ? VIOLET_LACQ : SUB_IRON, { sd: r * 0.18, hd: r * 0.06, rim: true, detail: (g) => {
    if (full) {
      _eyeHoles(g, r);
      g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 0.2, -r * 0.22); g.quadraticCurveTo(r * 0.5, -r * 0.4, r * 0.98, -r * 0.2); g.stroke();
    }
    const y0 = full ? 0.54 : 0.5;
    g.fillStyle = '#060406'; g.beginPath(); orderShape(g, r, [[0.42, y0, 1], [1.12, y0 - 0.04, 1], [1.0, y0 + 0.28], [0.5, y0 + 0.3]]); g.fill();
    g.fillStyle = SUB_PAPER[0];
    for (const x of [0.56, 0.98]) { g.beginPath(); g.moveTo(r * (x - 0.07), r * (y0 - 0.01)); g.lineTo(r * (x + 0.07), r * (y0 - 0.02)); g.lineTo(r * x, r * (y0 + 0.18)); g.closePath(); g.fill(); }
    for (const x of [0.7, 0.86]) { g.beginPath(); g.moveTo(r * (x - 0.06), r * (y0 + 0.28)); g.lineTo(r * (x + 0.06), r * (y0 + 0.28)); g.lineTo(r * x, r * (y0 + 0.14)); g.closePath(); g.fill(); }
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 0.38, r * (y0 - 0.04)); g.quadraticCurveTo(r * 0.8, r * (y0 - 0.14), r * 1.16, r * (y0 - 0.06)); g.stroke();
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.045; g.beginPath(); g.moveTo(r * 0.2, r * 0.36); g.quadraticCurveTo(r * 0.3, r * 0.6, r * 0.22, r * 0.84); g.stroke();
  } });
  // a crack of violet memory light through the iron (Moro is half a Hollow; the echoes are memory)
  if (!A.flat && (moro || echo)) _bolt(ctx, [[r * 0.3, r * (full ? -0.62 : 0.2)], [r * 0.38, r * (full ? -0.3 : 0.42)], [r * 0.26, r * (full ? -0.1 : 0.56)], [r * 0.36, r * (full ? 0.3 : 0.8)]], r * 0.025, acc[2]);
};
