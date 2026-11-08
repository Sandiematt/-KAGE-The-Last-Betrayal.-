/* ---- Mugen no Ha: whatever weapon shape the Witness copies (sh), drawn as floating memory shards along its length ---- */
// a black grip with a violet tsuba, then obsidian shards edge-lit violet with a white core line and a soft bloom, gaps
// between them that bob apart, and the copied weapon's head (a hammer's block, a spear's point, a sickle's curve).
// After a weapon change (`shardMorph`) the shards scatter and re-form.
function drawShardWeapon(ctx, sh, L, mode, s, ink, f) {
  if (sh === 'none') return;
  const flat = mode !== 'ink', t = f.time || 0, morph = Math.max(0, f.shardMorph || 0) / 0.4;
  const pole = sh === 'spear' || sh === 'staff' || sh === 'hammer' || sh === 'sickle' || sh === 'hook';
  const grip = pole ? 0.12 : sh === 'short' || sh === 'kagehira' || sh === 'yurei' || sh === 'crescent' || sh === 'fan' ? 0.22 : 0.3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = flat ? ink : '#0c0912'; ctx.lineWidth = 4.2 * s; ctx.beginPath(); ctx.moveTo(-L * grip, 0); ctx.lineTo(0, 0); ctx.stroke();
  if (!flat) {
    ctx.strokeStyle = '#3a2a5e'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
    for (let i = 1; i < 6; i++) { const x = -L * grip * i / 6; ctx.moveTo(x - 1.4 * s, -2 * s); ctx.lineTo(x + 1.4 * s, 2 * s); }
    ctx.stroke();
    ctx.fillStyle = '#140c22'; ctx.beginPath(); ctx.moveTo(0, -6 * s); ctx.lineTo(2.6 * s, 0); ctx.lineTo(0, 6 * s); ctx.lineTo(-2.6 * s, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#b48aff'; ctx.lineWidth = 0.9 * s; ctx.stroke();
  }
  const shard = (x, y, len, w, rot, i) => {
    const j = Math.sin(t * 5 + i * 1.7) * 1.4 * s * (1 + morph * 14), jx = morph * Math.cos(i * 2.3) * 22 * s;
    ctx.save(); ctx.translate(x + jx, y + j); ctx.rotate(rot + morph * Math.sin(i * 3.1) * 1.4);
    const P = () => { ctx.beginPath(); ctx.moveTo(-len * 0.5, 0); ctx.lineTo(-len * 0.1, -w); ctx.lineTo(len * 0.5, -w * 0.3); ctx.lineTo(len * 0.2, w); ctx.closePath(); };
    if (flat) { ctx.fillStyle = ink; P(); ctx.fill(); ctx.restore(); return; }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(150,100,255,0.32)'; ctx.lineWidth = 4 * s; P(); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#150d26'; P(); ctx.fill();
    ctx.fillStyle = '#3a2470'; ctx.beginPath(); ctx.moveTo(-len * 0.5, 0); ctx.lineTo(-len * 0.1, -w); ctx.lineTo(len * 0.5, -w * 0.3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c9b0ff'; ctx.lineWidth = 0.9 * s; P(); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(-len * 0.36, -w * 0.12); ctx.lineTo(len * 0.36, -w * 0.32); ctx.stroke();
    ctx.restore();
  };
  const curve = sh === 'katana' || sh === 'odachi' || sh === 'shinsen' || sh === 'yurei' ? 0.05 : 0;
  const thin = pole ? 1.6 * s : sh === 'cleaver' || sh === 'odachi' ? 4.6 * s : 3.2 * s;
  const end = pole ? (sh === 'hammer' ? 0.78 : 0.86) : 1, n = Math.max(3, Math.round(L * end / (15 * s)));
  for (let i = 0; i < n; i++) {
    const u0 = 0.04 + (end - 0.04) * i / n, u1 = 0.04 + (end - 0.04) * (i + 0.78) / n, um = (u0 + u1) / 2;
    shard(L * um, -curve * L * um * um, L * (u1 - u0), thin * (1 - um * 0.3), 0, i);
  }
  // the copied weapon's head
  if (sh === 'spear') { shard(L * 0.93, 0, L * 0.16, 4.6 * s, 0, 40); }
  else if (sh === 'staff') { shard(L * 0.93, 0, L * 0.12, 2.4 * s, 0, 41); }
  else if (sh === 'hammer') { for (let k = 0; k < 4; k++) shard(L * (0.86 + (k % 2) * 0.08), (k < 2 ? -1 : 1) * 9 * s, 14 * s, 9 * s, Math.PI / 2, 42 + k); }
  else if (sh === 'sickle' || sh === 'hook') { for (let k = 0; k < 4; k++) { const a = -0.2 - k * 0.5; shard(L * 0.9 + Math.cos(a) * 18 * s, Math.sin(a) * 22 * s - 10 * s, 14 * s, 3.4 * s, a + Math.PI / 2, 46 + k); } }
  else if (sh === 'crescent' || sh === 'fan') { for (let k = 0; k < 3; k++) { const a = -0.9 + k * 0.6; shard(Math.cos(a) * L * 0.6, Math.sin(a) * L * 0.6, 16 * s, 4 * s, a + Math.PI / 2, 50 + k); } }
  else shard(L * 0.98, -curve * L * 0.96, 12 * s, thin * 0.8, -0.2, 39);   // a blade's point
}
