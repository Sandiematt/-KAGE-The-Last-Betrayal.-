// the shoulder plates (called from animeArm): the great round sode on the near arm with the red ring and the cloud
// crest, a plainer one on the far arm (mostly under the fur)
function raikonSode(f, ctx, sh, el, A, U, far) {
  const skin = animeSkin(f); if (!skin.raikon) return;
  const S = A.S, hol = _raiH(f), red = _raiRed(f);
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  // the plate hangs from the shoulder, down the arm and a little back
  const R = (far ? 9.5 : 12) * U, cx = sh.x + ax * R * 0.5 - S.ux * 1.5 * U, cy = sh.y + ay * R * 0.5 - S.uy * 1.5 * U, rot = Math.atan2(ay, ax);
  const tone = far ? [ANIME.face, RAI_PLATE[0], RAI_PLATE[1]] : hol ? RAI_LACQ_H : RAI_PLATE;
  celFill(ctx, () => { ctx.moveTo(cx + R, cy); ctx.ellipse(cx, cy, R * 1.04, R * 0.94, rot, 0, TAU); }, tone, A, { sd: 3.4 * U, hd: far ? 0 : 1.2 * U, rim: true, detail: far ? null : (g) => {
    // a raised rim, the red ring inside it, the crest at the centre
    g.strokeStyle = tone[2]; g.lineWidth = 1 * A.s; g.beginPath(); g.ellipse(cx - A.lx * 1.2 * U, cy - A.ly * 1.2 * U, R * 0.86, R * 0.78, rot, Math.PI * 0.9, Math.PI * 1.9); g.stroke();
    g.strokeStyle = ANIME.outline; g.lineWidth = 1.4 * A.s; g.beginPath(); g.ellipse(cx, cy, R * 0.84, R * 0.76, rot, 0, TAU); g.stroke();
    g.strokeStyle = red[1]; g.lineWidth = 1.8 * U; g.beginPath(); g.ellipse(cx, cy, R * 0.66, R * 0.6, rot, 0, TAU); g.stroke();
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = hol ? 'rgba(120,96,220,0.35)' : 'rgba(255,40,40,0.3)'; g.lineWidth = 3.4 * U;
    g.beginPath(); g.ellipse(cx, cy, R * 0.66, R * 0.6, rot, 0, TAU); g.stroke(); g.globalCompositeOperation = 'source-over';
    raikonTomoe(g, cx, cy, R * 0.44, rot + (f.facing > 0 ? 0 : Math.PI), hol ? red[1] : red[2]);
    if (hol) hollowCrack(g, A, 1, [[cx - R * 0.9, cy - R * 0.2], [cx - R * 0.4, cy - R * 0.05], [cx - R * 0.2, cy + R * 0.4], [cx + R * 0.3, cy + R * 0.55]], 0.9 * U);
  } });
}
