// a head-frame point (+x the face side) in world coordinates, as the head transform of silhouette() places it
function _akHeadPt(f, lx, ly) {
  const r = f.headRot || 0, c = Math.cos(r), s = Math.sin(r), x = lx * f.facing;
  return [f.sk.head.x + x * c - ly * s, f.sk.head.y + x * s + ly * c];
}

/* ---- the ponytail: two thick tapered locks from the tie on the crown, split into points at the ends ---- */
function _akHairLock(f, ctx, A, cl, r, main) {
  const c = cl.c; if (!c.init) return;
  const hol = f.hollow, root = _akHeadPt(f, -0.5 * r, -0.98 * r);
  const W = r * (main ? 1.9 : 1.1);
  const n = _akEdges(c, (u) => W * (u < 0.1 ? 0.3 + u * 5 : Math.max(0.08, Math.sin(Math.PI * (0.22 + 0.78 * u)) * (1 - u * 0.2))), root[0], root[1]);
  celFill(ctx, () => _akStrip(ctx, n, c, 0, main ? 3 : 2, r * (hol ? 0.13 : 0.09)), main ? AK_HAIR : [AK_HAIR[0], AK_HAIR[0], AK_HAIR[1]], A, { sd: r * 0.3, hd: main ? r * 0.08 : 0, rim: main, detail: (g) => {
    // strands combed along the lock, the lit ones pink
    g.lineCap = 'round';
    for (const [t, col, lw] of [[0.18, '#d93a8a', 1.3], [0.32, AK_HAIR[0], 1], [0.45, '#ff66b2', 1.6], [0.56, '#ff9ccd', 0.9], [0.68, '#b8326f', 1.2], [0.82, '#ff66b2', 1.1]]) {
      g.strokeStyle = col; g.lineWidth = lw * A.s; g.beginPath();
      for (let i = 1; i < n; i++) { const x = lerp(_akL[i * 2], _akR[i * 2], t), y = lerp(_akL[i * 2 + 1], _akR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
    }
  } });
}

/* ---- the head (drawHelmet 'akari_mask'): hair, fringe and side lock, the half-mask, the white eyes, the ornament ---- */
// the hair over the crown and the back of the head: the front edge is the fringe, sharp locks over the brow
const AK_HAIR_CAP = [[1.04, -0.36, 1], [0.98, -0.9], [0.4, -1.22], [-0.42, -1.16], [-0.96, -0.76], [-1.08, -0.14], [-0.98, 0.42], [-0.72, 0.84, 1],
  [-0.56, 0.4], [-0.36, 0.0], [-0.06, -0.34], [0.14, -0.22, 1], [0.26, -0.5], [0.46, -0.2, 1], [0.58, -0.5], [0.8, -0.24, 1], [0.8, -0.52]];

// the side lock: from the temple down in front of the ear, past the jaw, to a point
const AK_SIDE = [[0.02, -0.52], [0.22, -0.36], [0.2, 0.16], [0.24, 0.56], [0.2, 0.9, 1], [0.06, 0.5], [-0.06, 0.1], [-0.16, -0.3]];

// the bead strings from the ornament (cloth 'aribbon'): a short pink cord with beads down it and a tassel
function _akRibbons(f, ctx, A) {
  const r = BODY.head * f.scale * f.build.head, vio = _akV(f), root = _akHeadPt(f, -0.42 * r, -0.86 * r);
  for (const cl of f.cloths) {
    if (cl.kind !== 'aribbon' || !cl.c.init) continue;
    const c = cl.c, n = c.n;
    if (A.flat) { ctx.strokeStyle = A.col; ctx.lineWidth = 1.6 * A.s; ctx.beginPath(); ctx.moveTo(root[0], root[1]); for (let i = 1; i < n; i++) ctx.lineTo(c.px[i], c.py[i]); ctx.stroke(); continue; }
    ctx.strokeStyle = vio[0]; ctx.lineWidth = 1.4 * A.s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(root[0], root[1]); for (let i = 1; i < n; i++) ctx.lineTo(c.px[i], c.py[i]); ctx.stroke();
    for (let i = 1; i < n; i++) { ctx.fillStyle = i === n - 1 ? vio[2] : vio[1]; ctx.beginPath(); ctx.arc(c.px[i], c.py[i], (i === n - 1 ? 1.7 : 1.2) * A.s, 0, TAU); ctx.fill(); }
  }
}
