// the kasumi veil's cut: from under the eyes across the bridge of the nose, back to the hood behind the cheek
const SAYO_VEIL = [[-0.4, 0.34, 1], [0.3, 0.24, 1], [0.8, 0.17, 1], [1.8, 0.15, 1], [1.8, 1.9, 1], [-0.4, 1.9, 1]];

SUB_HEADS.veil = function (ctx, key, f, r, ink, flat, A, sv, t, acc, fill) {
  // a close dark hood open at the face, a thin silver brow band, a hairpin crossing its back, and the kasumi veil: grey
  // mourning gauze drawn tight from under the eyes, following her own nose, lips and chin, a mist band across it
  fill([[0.6, -0.84], [0.0, -1.12], [-0.62, -1.06], [-1.06, -0.5], [-1.1, 0.4], [-0.82, 1.1], [-0.2, 1.24], [0.26, 1.06], [0.02, 0.56], [-0.2, -0.06], [0.1, -0.54]], ['#08070b', '#121118', '#26232f'], { sd: r * 0.3, hd: r * 0.06, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.4, -r * 1.0); g.quadraticCurveTo(-r * 0.9, -r * 0.2, -r * 0.62, r * 0.9); g.stroke();
  } });
  _subShell(ctx, A, r, f, SAYO_VEIL, ['#16141d', '#2a2734', '#4b4560'], { sd: r * 0.14, hd: r * 0.08, rim: true, detail: (g) => {
    g.strokeStyle = acc[1]; g.lineWidth = r * 0.07; g.beginPath();
    g.moveTo(r * 0.0, r * 0.78); g.quadraticCurveTo(r * 0.4, r * 0.66, r * 0.62, r * 0.78); g.lineTo(r * 1.3, r * 0.74); g.stroke();
  } }, 1.05);
  if (!A.flat) {
    ctx.strokeStyle = ANIME.silver; ctx.lineWidth = Math.max(1, r * 0.07); ctx.beginPath(); ctx.moveTo(r * 0.88, -r * 0.38); ctx.quadraticCurveTo(0, -r * 0.62, -r * 1.06, -r * 0.3); ctx.stroke();
    ctx.lineWidth = Math.max(1, r * 0.06); ctx.beginPath(); ctx.moveTo(-r * 0.2, -r * 1.02); ctx.lineTo(-r * 1.2, -r * 0.2); ctx.stroke();
    ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(-r * 0.22, -r * 1.02, r * 0.09, 0, TAU); ctx.fill();
  }
};
