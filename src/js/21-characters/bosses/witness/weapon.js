/* ---- Mugen no Ha: the Witness's greatsword (2026-11-09, from the user's reference) ---- */
// A broad, straight slab of blue steel as long as the Witness is tall:
// - an L-shaped grip whose pommel bends down, wrapped in navy rings;
// - a tall riveted guard plate;
// - a blade with a flat top spine and a chisel tip cut back from the spine to the edge;
// - panel seams and hash marks on the flat, and a long slot of energy cells that glow in the phase's colour;
// - a silver bevel along the edge with a white stripe, the edge itself lit in the phase's colour.
// Origin at the grip (the hand holds just behind the guard), +x along the blade, the edge on +y (as the cleaver).
// The blade is H = 0.13 L tall: from -0.4 H (spine) to +0.6 H (edge), so the grip line runs through its upper half.
// Flat passes (outline, silhouette) draw one clean shape in `ink`.
const WT_GS = { steel: '#5b6d9e', steelHi: '#7f91c0', steelDk: '#3b4a78', line: '#1c2446', bevel: '#c4cde3', stripe: '#f4f7ff',
  guard: '#c9d0e0', guardDk: '#8a95b2', grip: '#25325c', gripHi: '#4a5c96', slot: '#121a36' };

function wtGreatPath(ctx, L, H, g) {
  const x0 = 0.045 * L, top = -0.4 * H, bot = 0.6 * H;
  ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(L, top); ctx.lineTo(L * 0.82, bot); ctx.lineTo(x0, bot); ctx.closePath();
  if (g) { ctx.rect(-0.012 * L, -0.66 * H, 0.057 * L, 1.42 * H); }
}

function drawWitnessGreatsword(ctx, L, mode, s, ink, f) {
  const H = 0.13 * L, flat = mode !== 'ink', t = (f && f.time) || 0;
  const look = WT_L, glow = look.glow, hot = look.vio[2], mid = look.vio[1];
  const gx = -0.2 * L, drop = 0.07 * L, gw = Math.max(3, 0.034 * L);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // the grip, bending down into the pommel
  ctx.strokeStyle = flat ? ink : WT_GS.grip; ctx.lineWidth = gw;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(gx, 0); ctx.lineTo(gx - 0.012 * L, drop); ctx.stroke();
  if (flat) { ctx.fillStyle = ink; wtGreatPath(ctx, L, H, true); ctx.fill(); return; }
  ctx.strokeStyle = WT_GS.gripHi; ctx.lineWidth = Math.max(1, gw * 0.42);
  ctx.beginPath(); for (let i = 0; i < 5; i++) { const x = -0.025 * L - i * 0.022 * L; ctx.moveTo(x, -gw * 0.42); ctx.lineTo(x, gw * 0.42); } ctx.stroke();
  ctx.strokeStyle = 'rgba(200,214,255,0.35)'; ctx.lineWidth = Math.max(0.8, gw * 0.22);
  ctx.beginPath(); ctx.moveTo(-0.13 * L, -gw * 0.25); ctx.lineTo(gx, -gw * 0.25); ctx.stroke();
  ctx.fillStyle = WT_GS.gripHi; ctx.beginPath(); ctx.arc(gx - 0.012 * L, drop, gw * 0.62, 0, TAU); ctx.fill();   // the pommel cap

  // the blade
  const x0 = 0.045 * L, top = -0.4 * H, bot = 0.6 * H;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';   // a soft halo of the phase's colour round the whole blade
  ctx.strokeStyle = `rgba(${glow.join(',')},0.28)`; ctx.lineWidth = 5 * s; wtGreatPath(ctx, L, H, false); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = WT_GS.steel; wtGreatPath(ctx, L, H, false); ctx.fill();
  ctx.save(); wtGreatPath(ctx, L, H, false); ctx.clip();
  ctx.fillStyle = WT_GS.steelHi; ctx.fillRect(x0, top, L, 0.12 * H);                     // the lit spine
  ctx.fillStyle = WT_GS.steelDk; ctx.fillRect(x0, 0.02 * H, L, 0.2 * H);                  // the shadowed middle
  ctx.fillStyle = WT_GS.bevel; ctx.fillRect(x0, 0.22 * H, L, 0.38 * H);                   // the silver bevel
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x0, 0.5 * H, L, 0.1 * H);
  // panel seams on the flat
  ctx.strokeStyle = WT_GS.line; ctx.lineWidth = Math.max(0.7, 0.8 * s);
  ctx.beginPath();
  ctx.moveTo(x0, 0.02 * H); ctx.lineTo(L, 0.02 * H);
  ctx.moveTo(x0, 0.22 * H); ctx.lineTo(L, 0.22 * H);
  for (const u of [0.31, 0.6, 0.8]) { ctx.moveTo(L * u, top); ctx.lineTo(L * u, 0.02 * H); }
  ctx.moveTo(L * 0.6, -0.14 * H); ctx.lineTo(L * 0.8, -0.14 * H);
  ctx.stroke();
  // the white stripe along the bevel, stepping up once near the guard
  ctx.strokeStyle = WT_GS.stripe; ctx.lineWidth = Math.max(1, 0.06 * H);
  ctx.beginPath(); ctx.moveTo(L * 0.08, 0.4 * H); ctx.lineTo(L * 0.22, 0.4 * H); ctx.lineTo(L * 0.25, 0.32 * H); ctx.lineTo(L * 0.92, 0.32 * H); ctx.stroke();
  ctx.restore();
  // the slot of energy cells (glowing in the phase's colour, a slow pulse running down the blade)
  const sx0 = L * 0.33, sx1 = L * 0.57, sy = -0.31 * H, sh = 0.2 * H;
  ctx.fillStyle = WT_GS.slot; ctx.fillRect(sx0, sy, sx1 - sx0, sh);
  const n = 7, cw = (sx1 - sx0) / n;
  for (let i = 0; i < n; i++) {
    const k = 0.5 + 0.5 * Math.sin(t * 4 - i * 0.9);
    ctx.fillStyle = k > 0.6 ? hot : mid;
    ctx.fillRect(sx0 + i * cw + cw * 0.14, sy + sh * 0.18, cw * 0.72, sh * 0.64);
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(${glow.join(',')},0.35)`; ctx.fillRect(sx0 - 2 * s, sy - 2 * s, sx1 - sx0 + 4 * s, sh + 4 * s);
  ctx.restore();
  // the hash marks and the dark inset by the guard, the rivets
  ctx.strokeStyle = WT_GS.line; ctx.lineWidth = Math.max(0.9, 0.05 * H);
  ctx.beginPath();
  for (let i = 0; i < 3; i++) { const x = L * (0.075 + i * 0.022); ctx.moveTo(x, -0.36 * H); ctx.lineTo(x + 0.02 * L, -0.22 * H); }
  for (let i = 0; i < 3; i++) { const x = L * (0.47 + i * 0.022); ctx.moveTo(x, 0.04 * H); ctx.lineTo(x + 0.02 * L, 0.18 * H); }
  ctx.stroke();
  ctx.fillStyle = WT_GS.slot; ctx.beginPath();
  ctx.moveTo(L * 0.055, 0.1 * H); ctx.lineTo(L * 0.09, -0.02 * H); ctx.lineTo(L * 0.25, -0.02 * H); ctx.lineTo(L * 0.25, 0.18 * H); ctx.lineTo(L * 0.09, 0.18 * H); ctx.closePath(); ctx.fill();
  const rivet = (u, v, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(L * u, v * H, Math.max(0.8, 0.045 * H), 0, TAU); ctx.fill(); };
  rivet(0.13, -0.1, WT_GS.stripe); rivet(0.155, -0.1, WT_GS.stripe); rivet(0.21, -0.1, WT_GS.stripe);
  rivet(0.62, -0.3, WT_GS.line); rivet(0.78, -0.3, WT_GS.line); rivet(0.9, -0.3, WT_GS.line); rivet(0.66, 0.12, WT_GS.line); rivet(0.43, 0.42, WT_GS.line);
  // the outline, then the edge lit in the phase's colour
  ctx.strokeStyle = WT_GS.line; ctx.lineWidth = Math.max(1, 1.1 * s); wtGreatPath(ctx, L, H, false); ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = look.edge; ctx.lineWidth = Math.max(1, 1.3 * s);
  ctx.beginPath(); ctx.moveTo(x0, bot); ctx.lineTo(L * 0.82, bot); ctx.lineTo(L, top); ctx.stroke();
  ctx.restore();

  // the guard plate
  const gx0 = -0.012 * L, gy0 = -0.66 * H, gwid = 0.057 * L, ght = 1.42 * H;
  ctx.fillStyle = WT_GS.guard; ctx.fillRect(gx0, gy0, gwid, ght);
  ctx.fillStyle = WT_GS.guardDk; ctx.fillRect(gx0 + gwid * 0.55, gy0, gwid * 0.45, ght);
  ctx.strokeStyle = WT_GS.line; ctx.lineWidth = Math.max(0.9, 0.9 * s); ctx.strokeRect(gx0, gy0, gwid, ght);
  ctx.beginPath(); ctx.moveTo(gx0 + gwid * 0.55, gy0); ctx.lineTo(gx0 + gwid * 0.55, gy0 + ght); ctx.stroke();
  for (const v of [0.1, 0.3, 0.7, 0.9]) { ctx.fillStyle = WT_GS.line; ctx.beginPath(); ctx.arc(gx0 + gwid * 0.28, gy0 + ght * v, Math.max(0.8, gwid * 0.13), 0, TAU); ctx.fill(); }
  ctx.fillStyle = look.acc[1]; ctx.fillRect(gx0 + gwid * 0.62, gy0 + ght * 0.44, gwid * 0.3, ght * 0.12);   // a gold tab, the sheets' trim
}
