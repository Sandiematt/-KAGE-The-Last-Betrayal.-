// the shoulder plates per armour look (called from animeArm): Garan one huge iron sode on the near arm, Shiden a pair
// of stacked lacquered sode, Sayo a small guard on the near shoulder
function subSode(f, ctx, sh, el, A, U, far) {
  const k = f.armor;
  const spec = k === 'half_do' ? (far ? null : { size: 1.4, rows: 4, tone: SUB_IRON, bolt: true }) : k === 'vanguard_plate' ? { size: 0.98, rows: 4, tone: SUB_LACQ, stack: true }
    : k === 'operative_vest' ? (far ? null : { size: 0.62, rows: 2, tone: SUB_LACQ }) : null;
  if (!spec) return;
  const S = A.S, acc = subTone(SUB_ACC[k]), size = spec.size;
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  let dx = ax * 0.45 - S.ux * 0.55, dy = ay * 0.45 - S.uy * 0.55; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const plate = (off, len, wid, rows, tn, detail) => {
    const top = [sh.x - dx * off * U - S.nx * 1.5 * U, sh.y - dy * off * U - S.ny * 1.5 * U];
    const [a0, a1, b1, b0, Q] = _hang(top, dx, dy, len * U * size, wid * U * size, wid * 1.22 * U * size);
    celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 2 * U * size), tn, A, { sd: 3.4 * U, hd: far ? 0 : 1 * U, rim: true, detail: far ? null : (g) => {
      _lace(g, A, Q, rows, 5, tn, 1.1 * U, acc[1]);
      g.strokeStyle = tn[2]; g.lineWidth = 1.3 * U; g.beginPath(); g.moveTo(a0[0] - A.lx * 1.4 * U, a0[1] - A.ly * 1.4 * U + 1.4 * U); g.lineTo(a1[0] - A.lx * 1.4 * U, a1[1] - A.ly * 1.4 * U + 1.4 * U); g.stroke();
      if (detail) detail(g, Q);
    } });
  };
  const tn = far ? SUB_LACQ_FAR : spec.tone;
  if (spec.stack) { plate(6, 13, 15, 2, tn); plate(-4, 18, 17, 3, tn); return; }
  plate(5, 25, 17, spec.rows, tn, spec.bolt ? (g, Q) => _bolt(g, [Q(0.15, 0.1), Q(0.45, 0.35), Q(0.3, 0.5), Q(0.7, 0.78), Q(0.6, 0.95)], 0.9 * U, acc[2]) : null);
}

/* ---- shoulder plates per armour look (called from animeArm) ---- */
function subBSode(f, ctx, sh, el, A, U, far) {
  const k = f.armor;
  const spec = k === 'gate_plate' ? (far ? null : { size: 1.45, rows: 4, tone: SUB_IRON, studs: true, square: true })
    : k === 'pauldrons' ? { size: 1.32, rows: 5, tone: SUB_LACQ, square: true }
    : k === 'tyrant' ? { size: 1.1, rows: 3, tone: SUB_IRON, spikes: true, stack: true }
    : k === 'jerkin' ? (far ? null : { size: 0.66, rows: 2, tone: LEATHER }) : null;
  if (!spec) return;
  const S = A.S, acc = _subbAcc(f, k), size = spec.size;
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  let dx = ax * 0.45 - S.ux * 0.55, dy = ay * 0.45 - S.uy * 0.55; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const lace = k === 'gate_plate' ? acc[0] : acc[1];
  const plate = (off, len, wid, rows, tn, detail) => {
    const top = [sh.x - dx * off * U - S.nx * 1.5 * U, sh.y - dy * off * U - S.ny * 1.5 * U];
    const [a0, a1, b1, b0, Q] = _hang(top, dx, dy, len * U * size, wid * U * size, wid * (spec.square ? 1.08 : 1.22) * U * size);
    celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, (spec.square ? 0.8 : 2) * U * size), tn, A, { sd: 3.4 * U, hd: far ? 0 : 1 * U, rim: true, detail: far ? null : (g) => {
      _lace(g, A, Q, rows, spec.studs ? 3 : 5, tn, 1.1 * U, lace);
      g.strokeStyle = tn[2]; g.lineWidth = 1.3 * U; g.beginPath(); g.moveTo(a0[0] - A.lx * 1.4 * U, a0[1] - A.ly * 1.4 * U + 1.4 * U); g.lineTo(a1[0] - A.lx * 1.4 * U, a1[1] - A.ly * 1.4 * U + 1.4 * U); g.stroke();
      if (detail) detail(g, Q);
    } });
    return Q;
  };
  const tn = far ? SUB_LACQ_FAR : spec.tone;
  if (spec.stack) {
    // the warden's / Gōka sode: stacked iron lames with spikes along the top edge, an accent vein down them
    plate(7, 12, 16, 2, tn);
    const Q = plate(-3, 17, 18, 3, tn, (g, Q) => _strokePts(g, [Q(0.3, 0.05), Q(0.45, 0.4), Q(0.36, 0.6), Q(0.55, 0.95)], acc[0], 1.2 * U));
    if (!far && !A.flat) void Q;
    const top = [sh.x - dx * 9 * U * size, sh.y - dy * 9 * U * size];
    for (const t of [-0.8, 0, 0.8]) {
      const bx = top[0] + S.nx * t * 7 * U, by = top[1] + S.ny * t * 7 * U, tx = bx - dx * 9 * U + S.nx * t * 3 * U - S.ux * 1 * U, ty = by - dy * 9 * U + S.ny * t * 3 * U - S.uy * 1 * U;
      celFill(ctx, () => _poly(ctx, [[bx - S.nx * 2.4 * U, by - S.ny * 2.4 * U], [tx, ty], [bx + S.nx * 2.4 * U, by + S.ny * 2.4 * U]]), tn, A, { sd: 1.4 * U, hd: far ? 0 : 0.5 * U, rim: !far });
    }
    return;
  }
  plate(5, spec.square ? 24 : 16, spec.square ? 19 : 15, spec.rows, tn, spec.studs ? (g, Q) => {
    // gate studs in rows over the iron
    for (const t of [0.22, 0.5, 0.78]) for (const kk of [0.2, 0.5, 0.8]) {
      const p = Q(kk, t);
      g.fillStyle = GOLDM[0]; g.beginPath(); g.arc(p[0], p[1], 1.6 * U, 0, TAU); g.fill();
      g.fillStyle = GOLDM[2]; g.beginPath(); g.arc(p[0] - 0.4 * U, p[1] - 0.5 * U, 0.7 * U, 0, TAU); g.fill();
    }
  } : null);
}
