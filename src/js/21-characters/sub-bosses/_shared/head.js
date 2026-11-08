/* ---- heads (head frame: +x the face side, r the head radius) ---- */
function drawSubHead(ctx, key, f, r, ink, flat) {
  const A = f._A && f._A.pal ? f._A : animeState(f, ink, flat, {});
  const sv = _headLight(A, f), t = f.time || 0, acc = subTone(SUB_ACC[key] || '#b02a31');
  const fill = (pts, tone, o) => celFill(ctx, () => orderShape(ctx, r, pts), tone, A, o);
  const part = SUB_HEADS[key];   // each look is drawn in its wearer's folder (sub-bosses/<name>/head.js)
  if (part) part(ctx, key, f, r, ink, flat, A, sv, t, acc, fill);
  A.lx = sv[0]; A.ly = sv[1];
}

/* ---- heads (head frame: +x the face side, r the head radius) ---- */
function drawSubBHead(ctx, key, f, r, ink, flat) {
  const A = f._A && f._A.pal ? f._A : animeState(f, ink, flat, {});
  const sv = _headLight(A, f), t = f.time || 0, acc = _subbAcc(f, key === 'oni_echo' ? 'oni' : key), sub = animeSkin(f).sub;
  const fill = (pts, tone, o) => celFill(ctx, () => orderShape(ctx, r, pts), tone, A, o);
  const studs = (g, list, rad) => { for (const [x, y] of list) { g.fillStyle = GOLDM[0]; g.beginPath(); g.arc(r * x, r * y, r * rad, 0, TAU); g.fill(); g.fillStyle = GOLDM[2]; g.beginPath(); g.arc(r * (x - rad * 0.3), r * (y - rad * 0.3), r * rad * 0.45, 0, TAU); g.fill(); } };
  // a lacquered shikoro: lames flaring down and back, laced in the accent
  const shikoro = (pts, tone, k0, k1, lace) => fill(pts, tone, { sd: r * 0.26, hd: r * 0.05, rim: true, detail: (g) => {
    for (let i = 1; i <= 3; i++) {
      const k = i / 4;
      g.strokeStyle = lace; g.lineWidth = r * 0.07; g.setLineDash([r * 0.06, r * 0.07]);
      g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.3 + k * k0)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.52 + k * k0), r * (-1.2 - k * k1), r * (-0.4 + k * (k0 + 0.3))); g.stroke();
      g.setLineDash([]);
      g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.06;
      g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.4 + k * k0)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.62 + k * k0), r * (-1.2 - k * k1), r * (-0.5 + k * (k0 + 0.3))); g.stroke();
    }
  } });
  const part = SUBB_HEADS[key];   // each look is drawn in its wearer's folder (sub-bosses/<name>/head.js)
  if (part) part(ctx, key, f, r, ink, flat, A, sv, t, acc, sub, fill, studs, shikoro);
  A.lx = sv[0]; A.ly = sv[1];
}
