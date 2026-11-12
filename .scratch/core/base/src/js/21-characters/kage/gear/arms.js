/* ---- sode for the looks (called from animeArm) ---- */
function gearSode(f, ctx, sh, el, A, U, far) {
  const k = f.armor;
  const spec = k === 'lamellar' ? { size: 1.0, rows: 6, tone: SUB_LACQ, ticks: 6 }
    : k === 'colossus_plate' ? (far ? { size: 1.2, rows: 3, tone: SUB_IRON, ticks: 3 } : { size: 1.5, rows: 4, tone: SUB_IRON, ticks: 3, studs: true }) : null;
  if (!spec) return;
  const S = A.S, acc = _gearAcc(k), size = spec.size;
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  let dx = ax * 0.45 - S.ux * 0.55, dy = ay * 0.45 - S.uy * 0.55; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const tn = far ? SUB_LACQ_FAR : spec.tone;
  const top = [sh.x - dx * 5 * U - S.nx * 1.5 * U, sh.y - dy * 5 * U - S.ny * 1.5 * U];
  const [a0, a1, b1, b0, Q] = _hang(top, dx, dy, 22 * U * size, 17 * U * size, 19 * U * size);
  celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 1.2 * U * size), tn, A, { sd: 3.4 * U, hd: far ? 0 : 1 * U, rim: true, detail: far ? null : (g) => {
    _lace(g, A, Q, spec.rows, spec.ticks, tn, 1 * U, k === 'colossus_plate' ? acc[0] : acc[1]);
    if (spec.studs) for (const t of [0.2, 0.45, 0.7, 0.92]) for (const kk of [0.15, 0.85]) { const p = Q(kk, t); g.fillStyle = ANIME.silver; g.beginPath(); g.arc(p[0], p[1], 0.9 * U, 0, TAU); g.fill(); }
  } });
}
