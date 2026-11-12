/* ---- the head (drawHelmet 'raijin_kabuto' on Raikon): the jingasa, its crest and tassels, the red rim light ---- */
// the hat's lacquered cone: brim tips back and front, the apex a little back of centre (head frame, +x the face side)
const RAI_HAT = [[-2.668, -0.62, 1], [-0.093, -1.48, 1], [2.622, -0.22, 1], [1.276, -0.26], [0, -0.38], [-1.392, -0.52]];

const RAI_HAT_H = [[-2.158, -0.78, 1], [-2.482, -0.6, 1], [-1.926, -0.5, 1], [-2.204, -0.92, 1], [-0.093, -1.48, 1], [2.622, -0.22, 1], [1.276, -0.26], [0, -0.38], [-1.392, -0.5, 1]];

// its red edge band along the brim
const RAI_BRIM = [[-2.714, -0.64, 1], [-1.392, -0.56], [0, -0.42], [1.276, -0.3], [2.668, -0.22, 1], [2.622, -0.06, 1], [1.276, -0.12], [0, -0.22], [-1.415, -0.38], [-2.668, -0.48, 1]];

const RAI_BRIM_H = [[-1.879, -0.52, 1], [-1.392, -0.54], [0, -0.42], [1.276, -0.3], [2.668, -0.22, 1], [2.622, -0.06, 1], [1.276, -0.12], [0, -0.22], [-1.415, -0.36, 1], [-1.74, -0.34, 1], [-1.624, -0.44, 1]];

// the flame crest: long sharp tongues off the crown, leaning back
const RAI_CREST = [[-0.34, -1.32, 1], [-0.86, -2.06, 1], [-0.4, -1.78, 1], [-0.56, -2.66, 1], [-0.16, -1.96, 1], [-0.02, -2.98, 1], [0.12, -2, 1], [0.44, -2.54, 1], [0.28, -1.76, 1], [0.6, -1.92, 1], [0.24, -1.34, 1]];

const RAI_CREST_IN = [[-0.2, -1.42, 1], [-0.42, -2.22, 1], [-0.08, -1.82, 1], [0, -2.52, 1], [0.08, -1.82, 1], [0.3, -2.22, 1], [0.12, -1.42, 1]];

const RAI_CREST_H = [[-0.34, -1.32, 1], [-0.62, -1.78, 1], [-0.34, -1.64, 1], [-0.4, -1.98, 1], [-0.1, -1.72, 1], [0.02, -2.16, 1], [0.12, -1.68, 1], [0.38, -1.82, 1], [0.24, -1.34, 1]];

function drawRaikonHead(ctx, f, r, ink, flat) {
  const A = f && f._A, hol = f && _raiH(f), t = (f && f.time) || 0, r0 = r;
  r = r * 1.22;   // the jingasa and its crest are drawn larger than the head: top-heavy, as in the key art
  const hat = hol ? RAI_HAT_H : RAI_HAT, brim = hol ? RAI_BRIM_H : RAI_BRIM, crest = hol ? RAI_CREST_H : RAI_CREST;
  // the tassels: a cord from each brim tip, a knot, a red tassel; they sway a little (the echo has lost the back one)
  const tassels = (fill) => {
    for (const [bx, by, ph] of [[-2.55, -0.52, 0], [2.53, -0.16, 1.9]]) {
      if (hol && bx < 0) continue;
      const sw = Math.sin(t * 2.3 + ph) * r * 0.1, kx = bx * r + sw * 0.6, ky = by * r + r * 0.5;
      fill(() => animeCapsule(ctx, { x: bx * r, y: by * r }, { x: kx, y: ky }, r * 0.035, r * 0.035, 0, 0.5), 'cord');
      fill(() => { ctx.moveTo(kx + r * 0.09, ky); ctx.arc(kx, ky, r * 0.09, 0, TAU); }, 'knot');
      fill(() => { ctx.moveTo(kx - r * 0.07, ky + r * 0.06); ctx.lineTo(kx + r * 0.07, ky + r * 0.06); ctx.lineTo(kx + sw * 0.5 + r * 0.14, ky + r * 0.62); ctx.lineTo(kx + sw * 0.5 - r * 0.14, ky + r * 0.62); ctx.closePath(); }, 'tassel');
    }
  };
  if (flat || !A || A.flat) {
    ctx.fillStyle = flat ? ink : RAI_LACQ[1];
    for (const pts of [crest, hat, brim]) { ctx.beginPath(); orderShape(ctx, r, pts); ctx.fill(); }
    tassels((P) => { ctx.beginPath(); P(); ctx.fill(); });
    return;
  }
  const red = _raiRed(f), sv = _headLight(A, f);
  // the faint red rim light round the eye socket (his key art's red eyes, kept as light under the white-eyes rule),
  // kept off the nose so the profile stays clean; clipped to his face
  ctx.save(); ctx.beginPath(); animeFacePath(ctx, r0 * 0.9, faceProfile(animeSkin(f))); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = hol ? 'rgba(120,90,230,0.14)' : 'rgba(255,36,28,0.15)'; ctx.beginPath(); ctx.ellipse(r0 * 0.5, r0 * 0.04, r0 * 0.32, r0 * 0.17, -0.08, 0, TAU); ctx.fill();
  ctx.fillStyle = hol ? 'rgba(120,90,230,0.12)' : 'rgba(255,36,28,0.12)'; ctx.beginPath(); ctx.ellipse(r0 * 0.3, -r0 * 0.36, r0 * 1.0, r0 * 0.18, 0.08, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; ctx.restore();
  // the crest behind the hat's crown
  celFill(ctx, () => orderShape(ctx, r, crest), hol ? RAI_FUR_H : red, A, { sd: r * 0.18, hd: r * 0.06, detail: hol ? (g) => hollowCrack(g, A, r, [[-0.3, -1.5], [-0.1, -1.7], [0.0, -1.62], [0.2, -1.86]], Math.max(0.6, r * 0.035)) : (g) => {
    g.fillStyle = '#ff8a74'; g.beginPath(); orderShape(g, r, RAI_CREST_IN); g.fill();
    g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,214,200,0.45)'; g.beginPath(); orderShape(g, r, [[-0.04, -1.6, 1], [0.0, -2.3, 1], [0.06, -1.6, 1]]); g.fill(); g.globalCompositeOperation = 'source-over';
  } });
  if (!hol) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,40,30,0.28)'; ctx.lineWidth = r * 0.16; ctx.lineJoin = 'round';
    ctx.beginPath(); orderShape(ctx, r, crest); ctx.stroke(); ctx.restore();
  }
  // the cone: black lacquer with ribs from the apex, the lit ridge toward the light
  const lq = hol ? RAI_LACQ_H : RAI_LACQ;
  celFill(ctx, () => orderShape(ctx, r, hat), lq, A, { sd: r * 0.22, hd: r * 0.05, rim: true, detail: (g) => {
    g.lineCap = 'round';
    for (const k of [-1.97, -1.1, -0.35, 0.52, 1.45]) {
      const x1 = k * r, y1 = (-0.5 + (k + 2.67) / 5.3 * 0.3) * r;
      g.strokeStyle = ANIME.outline; g.lineWidth = Math.max(0.8, r * 0.05); g.beginPath(); g.moveTo(-0.09 * r, -1.44 * r); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = lq[2]; g.lineWidth = Math.max(0.6, r * 0.025); g.beginPath(); g.moveTo(-0.09 * r + r * 0.05, -1.44 * r + r * 0.03); g.lineTo(x1 + r * 0.06, y1); g.stroke();
    }
    if (hol) hollowCrack(g, A, r, [[-1.6, -0.6], [-1.2, -0.9], [-0.9, -0.8], [-0.5, -1.2]], Math.max(0.7, r * 0.04));
  } });
  // the red band along the brim, glowing
  celFill(ctx, () => orderShape(ctx, r, brim), red, A, { sd: r * 0.06, hd: r * 0.04 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = hol ? 'rgba(130,100,240,0.32)' : 'rgba(255,40,30,0.34)'; ctx.lineWidth = r * 0.14;
  ctx.beginPath(); ctx.moveTo((hol ? -1.74 : -2.67) * r, -0.45 * r); ctx.quadraticCurveTo(0, -0.24 * r, 2.62 * r, -0.12 * r); ctx.stroke(); ctx.restore();
  tassels((P, kind) => celFill(ctx, P, kind === 'cord' ? [red[0], red[0], red[1]] : red, A, { sd: r * 0.05, hd: kind === 'tassel' ? r * 0.03 : 0, seam: kind !== 'cord' }));
  if (hol) _maskPiece(ctx, A, r0, [[0.28, -0.14, 1], [0.68, -0.18, 1], [0.62, 0.36, 1], [0.46, 0.62, 1], [0.3, 0.3, 1]], [[0.48, -0.14], [0.42, 0.16], [0.5, 0.42]], false);
  A.lx = sv[0]; A.ly = sv[1];
}
