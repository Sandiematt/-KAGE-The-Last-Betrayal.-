/* ---- heads (head frame: +x the face side, r the head radius) ---- */
const HOLLOW_COWL = [[0.66, -0.78], [0.2, -1.16], [-0.55, -1.12], [-1.08, -0.6], [-1.2, 0.2], [-1.06, 0.86], [-1.42, 1.42, 1], [-0.86, 1.1], [-0.78, 1.62, 1],
  [-0.4, 1.12], [-0.12, 1.46, 1], [0.04, 1.0], [0.42, 1.02, 1], [0.2, 0.62], [0.0, 0.2], [0.06, -0.32], [0.4, -0.62]];

const HOLLOW_HALF = [[0.02, -0.86, 1], [0.5, -0.98], [0.92, -0.62], [1.03, -0.1, 1], [0.98, 0.3, 1], [0.8, 0.2, 1], [0.68, 0.44, 1], [0.46, 0.24, 1], [0.3, 0.4, 1], [0.16, 0.12, 1], [0.04, 0.22, 1]];

const HOLLOW_JAW = [[0.52, 0.58, 1], [0.94, 0.44, 1], [0.88, 0.76, 1], [0.6, 0.98, 1]];

const HOLLOW_SHARDS = [
  [[-0.62, -1.2, 1], [-1.2, -1.86, 1], [-0.92, -2.0, 1], [-0.3, -1.3, 1]],
  [[-0.2, -1.26, 1], [-0.12, -2.24, 1], [0.14, -2.08, 1], [0.22, -1.24, 1]],
  [[0.36, -1.16, 1], [0.86, -1.72, 1], [0.98, -1.5, 1], [0.64, -1.04, 1]]
];

function _shards(ctx, A, r, t, list) {
  list.forEach((pts, i) => {
    const o = Math.sin(t * 2.2 + i * 2.1) * 0.06;
    _maskPiece(ctx, A, r, pts.map(p => [p[0], p[1] + o, p[2]]), null, false, i === 0);
  });
}

function drawHollowHead(ctx, f, r, ink, flat) {
  const A = f && f._A, sk = f && animeSkin(f), h = sk && sk.hollow;
  if (!A) { ctx.fillStyle = ink; ctx.beginPath(); orderShape(ctx, r, HOLLOW_COWL); ctx.fill(); ctx.beginPath(); orderShape(ctx, r, HOLLOW_HALF); ctx.fill(); return; }
  const kind = h ? h.head : 'shade', pal = A.pal, sv = _headLight(A, f), t = f.time || 0;
  const cowl = (pts) => celFill(ctx, () => orderShape(ctx, r, pts || HOLLOW_COWL), pal.fab, A, { sd: r * 0.3, hd: r * 0.05, rim: true, detail: (g) => {
    g.strokeStyle = pal.acc; g.lineWidth = r * 0.06; g.setLineDash([r * 0.3, r * 0.14]); g.beginPath(); g.moveTo(r * 0.5, -r * 0.72); g.quadraticCurveTo(-r * 0.2, -r * 0.6, -r * 0.5, r * 0.6); g.stroke(); g.setLineDash([]);
  } });
  switch (kind) {
    case 'shade': {
      // a ragged cowl, a crown of floating shards (the old Hollow spikes, now pieces of its broken mask), a cracked half-mask
      _shards(ctx, A, r, t, HOLLOW_SHARDS.slice(0, 2));
      cowl();
      _shards(ctx, A, r, t + 1, HOLLOW_SHARDS.slice(2));
      _maskPiece(ctx, A, r, HOLLOW_HALF, [[0.56, -0.97], [0.62, -0.58], [0.5, -0.36], [0.64, -0.12], [0.58, 0.1]], true);
      _maskPiece(ctx, A, r, HOLLOW_JAW, [[0.74, 0.5], [0.7, 0.8]], false);
      break;
    }
    case 'sack': {
      // straw bursting from the crown, a stitched sack hood tied at the throat, a plank practice mask over the eyes
      celFill(ctx, () => {
        for (const [x0, x1, tx, ty] of [[-0.5, -0.2, -0.86, -1.9], [-0.25, 0.05, -0.18, -2.05], [0.0, 0.3, 0.42, -1.86], [-0.7, -0.45, -1.3, -1.56], [0.2, 0.46, 0.86, -1.42]]) {
          ctx.moveTo(x0 * r, -1.0 * r); ctx.lineTo(tx * r, ty * r); ctx.lineTo(x1 * r, -1.02 * r); ctx.closePath();
        }
      }, HOLLOW_STRAW, A, { sd: r * 0.08, seam: false, detail: (g) => {
        g.strokeStyle = HOLLOW_STRAW[0]; g.lineWidth = Math.max(0.6, r * 0.03); g.beginPath();
        for (const [x, tx, ty] of [[-0.35, -0.8, -1.7], [-0.1, -0.15, -1.85], [0.15, 0.4, -1.66]]) { g.moveTo(x * r, -r); g.lineTo(tx * r, ty * r); }
        g.stroke();
      } });
      const SACK = [[0.74, -0.58], [0.44, -1.1], [-0.3, -1.22], [-0.96, -0.82], [-1.14, 0.0], [-0.98, 0.7], [-0.5, 0.98], [0.0, 0.92], [0.2, 0.66], [0.02, 0.2], [0.1, -0.3], [0.5, -0.5]];
      celFill(ctx, () => orderShape(ctx, r, SACK), HOLLOW_SACK, A, { sd: r * 0.3, hd: r * 0.06, rim: true, detail: (g) => {
        // the stitched seam over the crown and a patch
        g.strokeStyle = HOLLOW_ROPE[2]; g.lineWidth = Math.max(0.7, r * 0.04); g.beginPath();
        g.moveTo(-r * 0.1, -r * 1.2); g.quadraticCurveTo(-r * 0.7, -r * 0.6, -r * 0.62, r * 0.6);
        for (let i = 0; i < 7; i++) { const k = i / 6, x = lerp(-0.2, -0.66, k) * r - Math.sin(k * 3) * r * 0.2, y = lerp(-1.1, 0.5, k) * r; g.moveTo(x - r * 0.08, y - r * 0.06); g.lineTo(x + r * 0.08, y + r * 0.06); }
        g.stroke();
        hollowCrack(g, A, r, [[-0.9, -0.4], [-0.62, -0.2], [-0.74, 0.1]], Math.max(0.6, r * 0.03));
      } });
      // the rope at the throat, its two ends hanging at the nape
      celFill(ctx, () => {
        ctx.moveTo(-r * 0.96, r * 0.6); ctx.lineTo(r * 0.24, r * 0.7); ctx.lineTo(r * 0.2, r * 0.86); ctx.lineTo(-r * 0.94, r * 0.78); ctx.closePath();
        ctx.moveTo(-r * 0.9, r * 0.7); ctx.lineTo(-r * 1.3, r * 1.3); ctx.lineTo(-r * 1.16, r * 1.36); ctx.lineTo(-r * 0.8, r * 0.78); ctx.closePath();
        ctx.moveTo(-r * 0.86, r * 0.72); ctx.lineTo(-r * 0.96, r * 1.46); ctx.lineTo(-r * 0.82, r * 1.46); ctx.lineTo(-r * 0.74, r * 0.78); ctx.closePath();
      }, HOLLOW_ROPE, A, { sd: r * 0.06 });
      _maskPiece(ctx, A, r, [[0.08, -0.4, 1], [1.04, -0.38, 1], [1.02, 0.28, 1], [0.86, 0.2, 1], [0.7, 0.3, 1], [0.1, 0.26, 1]], [[0.24, -0.4], [0.32, -0.1], [0.22, 0.26]], true);
      if (!A.flat) {
        // it is a board: wood grain and two nails
        ctx.strokeStyle = HOLLOW_WOOD[0]; ctx.lineWidth = Math.max(0.6, r * 0.03); ctx.beginPath(); ctx.moveTo(r * 0.12, -r * 0.24); ctx.lineTo(r * 1.0, -r * 0.22); ctx.moveTo(r * 0.12, r * 0.18); ctx.lineTo(r * 0.66, r * 0.2); ctx.stroke();
        ctx.fillStyle = HOLLOW_MASK[2]; for (const x of [0.16, 0.96]) { ctx.beginPath(); ctx.arc(x * r, -r * 0.3, r * 0.045, 0, TAU); ctx.fill(); }
      }
      break;
    }
    case 'beak': {
      // a hood peaked forward over the brow like a beak (its long tails are cloth), a thin cracked visor across the eyes
      const HOOD = [[1.56, -0.34, 1], [0.8, -1.06], [-0.2, -1.2], [-0.94, -0.86], [-1.18, -0.1], [-1.02, 0.7], [-0.62, 1.12], [0.0, 1.02], [0.32, 0.72], [0.06, 0.3], [0.0, -0.2], [0.42, -0.4]];
      celFill(ctx, () => orderShape(ctx, r, HOOD), pal.fab, A, { sd: r * 0.3, hd: r * 0.05, rim: true, detail: (g) => {
        g.strokeStyle = pal.acc; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(r * 1.2, -r * 0.48); g.quadraticCurveTo(r * 0.5, -r * 0.6, r * 0.1, -r * 0.24); g.stroke();
      } });
      _maskPiece(ctx, A, r, [[0.1, -0.26, 1], [1.02, -0.3, 1], [1.1, 0.04, 1], [0.84, 0.2, 1], [0.7, 0.08, 1], [0.48, 0.24, 1], [0.12, 0.18, 1]], [[0.66, -0.3], [0.6, -0.06], [0.7, 0.08]], true);
      break;
    }
    case 'tengai': {
      // the komusō basket hat, woven, broken open over the face so the eyes look out of the hole
      const DOME = [[1.0, 0.56, 1], [1.12, -0.4], [0.94, -1.34], [0.32, -1.86], [-0.5, -1.86], [-1.1, -1.34], [-1.24, -0.4], [-1.08, 0.64, 1], [-0.4, 0.86], [0.36, 0.84]];
      const HOLE = [[1.2, -0.66], [0.74, -0.52], [0.56, -0.24], [0.26, -0.12], [0.16, 0.28], [0.42, 0.48], [0.34, 0.9], [1.2, 0.9]];
      celFill(ctx, () => orderShape(ctx, r, DOME), HOLLOW_WEAVE, A, { sd: r * 0.34, hd: r * 0.07, rim: true, detail: (g) => {
        g.strokeStyle = ANIME.outline; g.lineWidth = Math.max(0.7, r * 0.04); g.beginPath();
        for (const y of [-1.5, -1.12, -0.74, -0.36, 0.02, 0.4]) { g.moveTo(-r * 1.3, y * r + r * 0.1); g.quadraticCurveTo(0, y * r - r * 0.12, r * 1.3, y * r + r * 0.1); }
        g.stroke();
        g.strokeStyle = HOLLOW_WEAVE[2]; g.lineWidth = Math.max(0.5, r * 0.025); g.beginPath();
        for (let i = 0; i < 6; i++) for (let j = 0; j < 9; j++) { const x = (-1.1 + j * 0.28 + (i % 2) * 0.14) * r, y = (-1.32 + i * 0.38) * r; g.moveTo(x, y); g.lineTo(x + r * 0.1, y + r * 0.2); }
        g.stroke();
        // the broken hole: the black face shows through, its lip frayed violet
        g.fillStyle = ANIME.face; g.beginPath(); for (let i = 0; i < HOLE.length; i++) i ? g.lineTo(HOLE[i][0] * r, HOLE[i][1] * r) : g.moveTo(HOLE[i][0] * r, HOLE[i][1] * r); g.closePath(); g.fill();
        hollowCrack(g, A, r, HOLE.slice(0, 7), Math.max(0.6, r * 0.03));
        hollowCrack(g, A, r, [[0.32, -1.86], [0.2, -1.4], [0.36, -1.1]], Math.max(0.5, r * 0.025));
      } });
      break;
    }
    case 'crescent': {
      // a full mask cracked in two, the lower half fallen away, a crescent-moon shard rising from the brow
      celFill(ctx, () => orderShape(ctx, r, [[-0.2, -1.0], [-0.9, -1.6], [-1.0, -2.3, 1], [-0.62, -1.62], [0.06, -1.06]]), HOLLOW_MASK_FAR, A, { sd: r * 0.1, rim: true });
      cowl();
      celFill(ctx, () => {
        const o = Math.sin(t * 2) * 0.04 * r;
        ctx.moveTo(r * 0.36, -r * 0.9 + o);
        ctx.quadraticCurveTo(r * 1.62, -r * 1.42 + o, r * 0.72, -r * 2.56 + o);
        ctx.quadraticCurveTo(r * 1.06, -r * 1.56 + o, r * 0.02, -r * 1.06 + o);
        ctx.closePath();
      }, HOLLOW_MASK, A, { sd: r * 0.12, hd: r * 0.05, rim: true, detail: (g) => hollowCrack(g, A, r, [[1.1, -1.9], [0.96, -1.66], [1.08, -1.4]], Math.max(0.6, r * 0.03)) });
      _maskPiece(ctx, A, r, [[-0.04, -0.9, 1], [0.5, -1.0], [0.92, -0.66], [1.04, -0.1, 1], [1.0, 0.36, 1], [0.84, 0.3, 1], [0.76, 0.56, 1], [0.54, 0.36, 1], [0.36, 0.62, 1], [0.2, 0.3, 1], [-0.02, 0.4, 1]],
        [[0.3, -0.98], [0.36, -0.6], [0.24, -0.3], [0.4, 0.0], [0.34, 0.5]], true);
      break;
    }
    case 'brute': {
      // a heavy cowl, a horned brow mask with broken horn stubs, cracks running down it
      _maskPiece(ctx, A, r, [[-0.36, -0.86, 1], [-0.74, -1.42, 1], [-0.5, -1.46, 1], [-0.14, -0.98, 1]], null, false, true);
      cowl([[0.6, -0.84], [0.1, -1.2], [-0.7, -1.12], [-1.24, -0.5], [-1.34, 0.4], [-1.2, 1.1], [-0.4, 1.3], [0.2, 1.2], [0.36, 0.82], [0.04, 0.3], [0.04, -0.3], [0.36, -0.66]]);
      _maskPiece(ctx, A, r, [[-0.1, -0.94, 1], [0.6, -1.02], [1.08, -0.62], [1.14, -0.1, 1], [1.02, 0.5, 1], [0.84, 0.34, 1], [0.7, 0.7, 1], [0.44, 0.42, 1], [0.16, 0.52, 1], [0.0, 0.0]],
        [[0.78, -1.0], [0.68, -0.6], [0.8, -0.34], [0.66, 0.1], [0.76, 0.5]], true);
      _maskPiece(ctx, A, r, [[0.2, -0.92, 1], [0.08, -1.54, 1], [0.32, -1.62, 1], [0.38, -1.36, 1], [0.54, -0.96, 1]], null, false);
      break;
    }
    case 'ronin': {
      // swept hair tied back in a topknot with a violet cord, a torn violet hachimaki (its tails are cloth), a shard on the cheek
      const HAIR = [[0.62, -0.42], [1.02, -0.02, 1], [0.84, -0.6], [0.58, -1.0], [-0.1, -1.14], [-0.72, -0.94], [-1.5, -0.62, 1], [-0.98, -0.36], [-1.62, 0.14, 1], [-0.98, 0.12], [-1.3, 0.64, 1], [-0.82, 0.42], [-0.86, 0.92, 1], [-0.4, 0.5], [-0.1, 0.0], [0.2, -0.3]];
      const KNOT = [[-0.62, -0.98], [-0.6, -1.36], [-0.26, -1.52], [0.32, -1.54, 1], [0.0, -1.3], [-0.26, -1.06]];
      celFill(ctx, () => orderShape(ctx, r, KNOT), pal.hair, A, { sd: r * 0.12, hd: r * 0.04, rim: true, detail: (g) => {
        g.strokeStyle = pal.acc; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(-r * 0.6, -r * 1.36); g.lineTo(-r * 0.32, -r * 1.12); g.stroke();
      } });
      celFill(ctx, () => orderShape(ctx, r, HAIR), pal.hair, A, { sd: r * 0.32, hd: r * 0.06, rim: true, detail: (g) => {
        g.strokeStyle = pal.hair[2]; g.lineWidth = Math.max(0.8, r * 0.05); g.beginPath();
        for (const [x0, y0, cx, cy, x1, y1] of [[0.3, -0.8, -0.4, -0.86, -1.2, -0.56], [0.1, -0.5, -0.5, -0.4, -1.3, 0.1], [0.5, -0.6, 0.8, -0.4, 0.9, -0.1]]) { g.moveTo(x0 * r, y0 * r); g.quadraticCurveTo(cx * r, cy * r, x1 * r, y1 * r); }
        g.stroke();
        // the hachimaki band across the brow, torn at the front
        g.fillStyle = A.pal.acc; g.beginPath(); g.moveTo(-r * 1.2, -r * 0.52); g.lineTo(r * 0.5, -r * 0.5); g.lineTo(r * 0.62, -r * 0.36); g.lineTo(r * 0.46, -r * 0.3); g.lineTo(-r * 1.2, -r * 0.3); g.closePath(); g.fill();
      } });
      _maskPiece(ctx, A, r, [[0.0, -0.3, 1], [0.32, -0.4, 1], [0.28, 0.2, 1], [0.1, 0.48, 1], [-0.04, 0.2, 1]], [[0.18, -0.36], [0.12, 0.0], [0.2, 0.3]], false);
      break;
    }
  }
  A.lx = sv[0]; A.ly = sv[1];
}
