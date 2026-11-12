/* ---- the head (drawHelmet 'straw_kasa'): Takashi's kasa, hair and beard; the Kasa or Sugegasa on Kage ---- */
// the hat's cone in head units (drawn at k = 1.2): back brim tip, apex, front brim tip, then the under edge back
const TK_HAT = [[-2.32, -0.5, 1], [-0.04, -1.36, 1], [2.36, -0.1, 1], [1.1, -0.17], [0, -0.28], [-1.2, -0.4]];

const TK_HAT_H = [[-1.86, -0.66, 1], [-2.1, -0.5, 1], [-1.64, -0.42, 1], [-1.9, -0.78, 1], [-0.04, -1.36, 1], [2.36, -0.1, 1], [1.1, -0.17], [0, -0.28], [-1.2, -0.38, 1]];

// its gold rim along the brim
const TK_BRIM = [[-2.36, -0.52, 1], [-1.2, -0.44], [0, -0.32], [1.1, -0.21], [2.42, -0.13, 1], [2.38, 0.0, 1], [1.1, -0.08], [0, -0.18], [-1.2, -0.3], [-2.3, -0.4, 1]];

const TK_BRIM_H = [[-1.6, -0.46, 1], [-1.2, -0.43], [0, -0.32], [1.1, -0.21], [2.42, -0.13, 1], [2.38, 0.0, 1], [1.1, -0.08], [0, -0.18], [-1.2, -0.29, 1], [-1.44, -0.3, 1], [-1.36, -0.4, 1]];

function _tkHat(ctx, f, r, A, hat, brim, straw, gold, hol) {
  celFill(ctx, () => orderShape(ctx, r, hat), straw, A, { sd: r * 0.24, hd: r * 0.05, rim: true, detail: (g) => {
    // the ribs from the apex, gold, the lit ones brighter; a fine woven ring round the crown
    g.lineCap = 'round';
    const ax = -0.04 * r, ay = -1.36 * r;
    for (const [k, lit] of [[-2.0, 0], [-1.3, 0], [-0.62, 1], [0.1, 1], [0.84, 1], [1.6, 0]]) {
      if (hol && k < -1.5) continue;
      const x1 = k * r, y1 = (-0.47 + (k + 2.32) / 4.68 * 0.36) * r;
      g.strokeStyle = ANIME.outline; g.lineWidth = Math.max(0.8, r * 0.05); g.beginPath(); g.moveTo(ax, ay); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = lit ? gold[1] : gold[0]; g.lineWidth = Math.max(0.6, r * 0.028); g.beginPath(); g.moveTo(ax + r * 0.03, ay + r * 0.02); g.lineTo(x1 + r * 0.03, y1); g.stroke();
    }
    g.strokeStyle = straw[2]; g.lineWidth = Math.max(0.5, r * 0.02); g.beginPath();
    for (const t of [0.3, 0.62]) { g.moveTo(lerp(ax, -2.32 * r, t), lerp(ay, -0.5 * r, t)); g.quadraticCurveTo(lerp(ax, 0, t), lerp(ay, -0.28 * r, t) + r * 0.02, lerp(ax, 2.36 * r, t), lerp(ay, -0.1 * r, t)); }
    g.stroke();
    if (hol) hollowCrack(g, A, r, [[-1.5, -0.56], [-1.1, -0.82], [-0.82, -0.74], [-0.46, -1.08]], Math.max(0.7, r * 0.04));
  } });
  // the gold edge light along the cone's upper edges, then the rim along the brim
  ctx.save(); ctx.strokeStyle = gold[1]; ctx.globalAlpha *= 0.85; ctx.lineWidth = Math.max(0.7, r * 0.035); ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(hat[0][0] * r, hat[0][1] * r - r * 0.02); ctx.lineTo(-0.04 * r, -1.37 * r); ctx.lineTo(2.32 * r, -0.12 * r); ctx.stroke(); ctx.restore();
  celFill(ctx, () => orderShape(ctx, r, brim), gold, A, { sd: r * 0.05, hd: r * 0.03 });
  if (!hol) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(240,186,80,0.22)'; ctx.lineWidth = r * 0.14;
    ctx.beginPath(); ctx.moveTo(-2.3 * r, -0.46 * r); ctx.quadraticCurveTo(0, -0.22 * r, 2.38 * r, -0.07 * r); ctx.stroke(); ctx.restore();
  }
}

function drawStrawKasa(ctx, f, r, ink, flat) {
  const A = f && f._A, tk = !!(f && animeSkin(f).takashi), hol = tk && _tkH(f), r0 = r;
  const kage = !tk && f && f.isPlayer, kasaGear = !tk && f && f.helmetId === 'kasa';
  r = r * 1.2;
  const hat = hol ? TK_HAT_H : TK_HAT, brim = hol ? TK_BRIM_H : TK_BRIM;
  if (flat || !A || A.flat) {
    if (kage) { ctx.save(); ctx.beginPath(); ctx.rect(-4 * r0, -0.36 * r0, 8 * r0, 6 * r0); ctx.clip(); drawKageHair(ctx, r0, ink, flat, f); ctx.restore(); }
    ctx.fillStyle = flat ? ink : (A ? TK_STRAW[1] : ink);
    if (tk) for (const pts of [TK_HAIRP, TK_MOUST, TK_BEARD]) { ctx.beginPath(); orderShape(ctx, r0, pts); ctx.fill(); }   // (flat: the beard stays in the head pass)
    for (const pts of [hat, brim]) { ctx.beginPath(); orderShape(ctx, r, pts); ctx.fill(); }
    if (!flat && !A) {   // the gear shop's icon: ribs and the rim in gold on the plain shape
      ctx.strokeStyle = kasaGear ? 'rgba(208,164,67,0.8)' : 'rgba(201,164,92,0.5)'; ctx.lineWidth = 1;
      for (const k of [-2.0, -1.3, -0.62, 0.1, 0.84, 1.6]) { ctx.beginPath(); ctx.moveTo(-0.04 * r, -1.36 * r); ctx.lineTo(k * r, (-0.47 + (k + 2.32) / 4.68 * 0.36) * r); ctx.stroke(); }
      if (kasaGear) { ctx.fillStyle = TK_GOLD[1]; ctx.beginPath(); orderShape(ctx, r, TK_BRIM); ctx.fill(); }
    }
    return;
  }
  const sv = _headLight(A, f);
  if (tk) {
    const hc = hol ? TK_HAIR_H : TK_HAIR;
    // the hair behind the face, combed back in locks
    celFill(ctx, () => orderShape(ctx, r0, TK_HAIRP), hc, A, { sd: r0 * 0.24, hd: r0 * 0.06, rim: true, detail: (g) => {
      g.lineCap = 'round'; g.strokeStyle = hc[0]; g.lineWidth = Math.max(0.7, r0 * 0.045); g.beginPath();
      for (const [x0, y0, x1, y1] of [[-0.5, -0.3, -1.1, -0.06], [-0.4, 0.04, -0.86, 0.44], [-0.12, 0.08, -0.3, 0.56]]) {
        g.moveTo(x0 * r0, y0 * r0); g.quadraticCurveTo((x0 + x1) * 0.5 * r0, (y0 + y1) * 0.5 * r0 - 0.08 * r0, x1 * r0, y1 * r0);
      }
      g.stroke();
    } });
  } else if (kage) {
    // Kage keeps his hair under the hat: only what shows below the brim
    ctx.save(); ctx.beginPath(); ctx.rect(-4 * r0, -0.36 * r0, 8 * r0, 6 * r0); ctx.clip();
    A.lx = sv[0]; A.ly = sv[1]; drawKageHair(ctx, r0, ink, flat, f); _headLight(A, f);
    ctx.restore();
  }
  const straw = hol ? TK_STRAW_H : kasaGear || tk ? TK_STRAW : TK_SUGE;
  const gold = tk ? _tkG(f) : kasaGear ? TK_GOLD : ['#3a2f1f', '#6e5c3e', '#8f7a54'];
  _tkHat(ctx, f, r, A, hat, brim, straw, gold, hol);
  A.lx = sv[0]; A.ly = sv[1];
}
