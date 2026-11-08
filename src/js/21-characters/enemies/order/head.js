const FOX_MASK = [[-0.96, -0.1], [-0.62, -0.9], [0.26, -1.04], [0.86, -0.66], [1.02, -0.2], [1.62, 0.26, 1], [1.2, 0.5], [0.74, 0.62], [0.46, 0.98, 1], [0.0, 0.7], [-0.6, 0.5]];

const FOX_HOOD = [[-0.62, 0.18], [-1.06, 0.62], [-0.92, 1.34], [-0.16, 1.34], [0.44, 1.08], [0.12, 0.62]];

const FOX_EAR_NEAR = [[-0.14, -0.86], [0.1, -2.3, 1], [0.62, -0.78]];

const FOX_EAR_FAR = [[-0.82, -0.6], [-0.8, -2.12, 1], [-0.24, -0.9]];

const HALF_MASK = [[0.02, 0.2], [0.72, 0.18], [1.36, 0.36, 1], [1.06, 0.6], [0.64, 0.86], [0.3, 0.98, 1], [0.02, 0.62]];

const ZUKIN = [[0.42, -0.98], [-0.5, -1.12], [-1.08, -0.5], [-1.06, 0.42], [-0.8, 1.24], [-0.14, 1.26], [0.42, 1.06], [0.0, 0.62], [-0.28, 0.0], [-0.3, -0.7]];

const RUNNER_HOOD = [[0.92, -0.5], [0.42, -1.1], [-0.4, -1.12], [-1.62, -0.86, 1], [-0.98, -0.22], [-0.98, 0.7], [-0.5, 1.28], [0.3, 1.14], [0.16, 0.56], [0.08, 0.04], [0.3, -0.42]];

const KABUTO_BOWL = [[1.0, -0.36, 1], [0.86, -0.92], [0.14, -1.24], [-0.7, -1.06], [-1.08, -0.4, 1]];

const JINGASA = [[-1.9, -0.44, 1], [-0.6, -1.02], [0.04, -1.46, 1], [0.66, -1.02], [1.92, -0.46, 1], [1.8, -0.32, 1], [0.0, -0.66], [-1.82, -0.32, 1]];

// the cloth hood under every helmet: covers the crown and back of the head and wraps the throat
function _hood(ctx, A, r, pal, pts) { celFill(ctx, () => orderShape(ctx, r, pts), pal.fab, A, { sd: r * 0.3, hd: r * 0.05, rim: true }); }

// the fox half-mask (menpō): a lacquered snout over the lower face, a crimson stroke along the muzzle
function _halfMask(ctx, A, r) {
  celFill(ctx, () => orderShape(ctx, r, HALF_MASK), ORDER_LACQ, A, { sd: r * 0.18, hd: r * 0.06, detail: (g) => {
    g.strokeStyle = A.pal.acc; g.lineWidth = r * 0.07; g.lineCap = 'round';
    g.beginPath(); g.moveTo(r * 0.5, r * 0.3); g.quadraticCurveTo(r * 0.9, r * 0.24, r * 1.2, r * 0.36); g.stroke();
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 0.98, r * 0.56); g.lineTo(r * 0.62, r * 0.66); g.stroke();
  } });
}

// the kabuto: shikoro (neck guard lames flaring back), the bowl with ribs, the visor and a fukigaeshi wing at the temple
function _kabuto(ctx, A, r, heavy) {
  const k = heavy ? 1.18 : 1;
  const SH = [[0.12, -0.56], [-0.86, -0.82], [-1.46 * k, 0.02], [-1.74 * k, 0.64 * k, 1], [-0.9, 0.86 * k], [-0.42, 0.46], [-0.2, -0.2]];
  celFill(ctx, () => orderShape(ctx, r, SH), ORDER_LACQ, A, { sd: r * 0.26, hd: r * 0.05, rim: true, detail: (g) => {
    // three lames: seams sweeping down and back, crimson lacing under each
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      g.strokeStyle = A.pal.acc; g.lineWidth = r * 0.07; g.setLineDash([r * 0.06, r * 0.07]);
      g.beginPath(); g.moveTo(r * (-0.3 - t * 0.2), r * (-0.4 + t * 0.95 + 0.1)); g.quadraticCurveTo(r * (-0.9 - t * 0.3), r * (-0.62 + t * 1.0 + 0.1), r * (-1.2 - t * 0.6) * k, r * (-0.5 + t * 1.25 + 0.1) * k); g.stroke();
      g.setLineDash([]);
      g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.06;
      g.beginPath(); g.moveTo(r * (-0.3 - t * 0.2), r * (-0.4 + t * 0.95)); g.quadraticCurveTo(r * (-0.9 - t * 0.3), r * (-0.62 + t * 1.0), r * (-1.2 - t * 0.6) * k, r * (-0.5 + t * 1.25) * k); g.stroke();
    }
  } });
  celFill(ctx, () => orderShape(ctx, r, KABUTO_BOWL), ORDER_LACQ, A, { sd: r * 0.3, hd: r * 0.08, rim: true, detail: (g) => {
    // the ribs (suji) of a riveted bowl, a crimson band at the brim
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.045;
    g.beginPath();
    for (const x of [-0.55, -0.15, 0.25, 0.6]) { g.moveTo(r * x * 0.5, -r * 1.22); g.quadraticCurveTo(r * x * 1.1, -r * 0.9, r * x * 1.25, -r * 0.4); }
    g.stroke();
    g.strokeStyle = A.pal.acc; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(-r * 1.1, -r * 0.47); g.quadraticCurveTo(0, -r * 0.6, r * 1.05, -r * 0.43); g.stroke();
  } });
  // the visor and the turned-back wing
  celFill(ctx, () => orderShape(ctx, r, [[0.42, -0.5], [1.32, -0.44, 1], [1.24, -0.3, 1], [0.4, -0.34]]), ORDER_LACQ, A, { sd: r * 0.06 });
  celFill(ctx, () => orderShape(ctx, r, [[0.34, -0.5], [0.24, 0.04, 1], [-0.22, -0.04], [-0.1, -0.52]]), ORDER_LACQ, A, { sd: r * 0.12, hd: r * 0.04, detail: (g) => {
    orderMark(g, r * 0.07, -r * 0.24, r * 0.12, A.pal.acc, r * 0.05);
  } });
  if (!A.flat) { ctx.fillStyle = ORDER_SILVER[1]; ctx.beginPath(); ctx.arc(r * 0.12, -r * 1.24, r * 0.09, 0, TAU); ctx.fill(); }
}

function drawOrderHead(ctx, f, r, ink, flat) {
  const A = f && f._A, sk = f && animeSkin(f), o = sk && sk.order;
  if (!A || !o) {   // no body state (a UI icon): a plain hood shape in one colour
    ctx.fillStyle = ink; ctx.beginPath(); orderShape(ctx, r, ZUKIN); ctx.fill();
    ctx.beginPath(); orderShape(ctx, r, HALF_MASK); ctx.fill(); return;
  }
  const pal = A.pal, sv = _headLight(A, f);
  switch (o.head) {
    case 'fox': {
      // the core swordsman: a full kitsune mask with tall pointed ears over a close cloth hood
      celFill(ctx, () => orderShape(ctx, r, FOX_EAR_FAR), ORDER_LACQ_FAR, A, { sd: r * 0.12, rim: true });
      _hood(ctx, A, r, pal, FOX_HOOD);
      celFill(ctx, () => orderShape(ctx, r, FOX_EAR_NEAR), ORDER_LACQ, A, { sd: r * 0.16, hd: r * 0.05, rim: true, detail: (g) => {
        g.fillStyle = A.pal.acc; g.beginPath(); orderShape(g, r, [[0.04, -0.9], [0.14, -1.94, 1], [0.44, -0.88]]); g.fill();
      } });
      celFill(ctx, () => orderShape(ctx, r, FOX_MASK), ORDER_LACQ, A, { sd: r * 0.22, hd: r * 0.07, rim: true, detail: (g) => {
        // crimson kitsune markings: flames over the brow sweeping back to the ears, a stroke down the muzzle
        g.fillStyle = A.pal.acc;
        g.beginPath(); orderShape(g, r, [[0.2, -0.28], [0.02, -0.78, 1], [0.34, -0.44], [0.62, -0.86, 1], [0.6, -0.3]]); g.fill();
        g.strokeStyle = A.pal.acc; g.lineWidth = r * 0.07; g.lineCap = 'round';
        g.beginPath(); g.moveTo(r * 0.8, r * 0.28); g.quadraticCurveTo(r * 1.05, r * 0.24, r * 1.26, r * 0.3); g.stroke();
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 1.04, r * 0.5); g.lineTo(r * 0.66, r * 0.64); g.stroke();
        _eyeHoles(g, r);
      } });
      break;
    }
    case 'runner': {
      // a peaked shinobi hood (its two long tails are cloth) and a fox half-mask; the eyes sit on the black face
      _hood(ctx, A, r, pal, RUNNER_HOOD);
      if (!A.flat) {
        // the knot at the back where the tails leave the hood
        celFill(ctx, () => { ctx.ellipse(-r * 0.98, -r * 0.3, r * 0.2, r * 0.26, 0.4, 0, TAU); }, pal.fab, A, { sd: r * 0.08 });
        ctx.strokeStyle = pal.acc; ctx.lineWidth = r * 0.07; ctx.beginPath(); ctx.moveTo(r * 0.86, -r * 0.46); ctx.quadraticCurveTo(r * 0.2, -r * 0.62, -r * 0.92, -r * 0.42); ctx.stroke();
      }
      _halfMask(ctx, A, r);
      break;
    }
    case 'jingasa': {
      // a wide, flat iron jingasa over the hood, the Order mark on its crown; a fox half-mask below
      _hood(ctx, A, r, pal, ZUKIN);
      _halfMask(ctx, A, r);
      celFill(ctx, () => orderShape(ctx, r, JINGASA), ORDER_LACQ, A, { sd: r * 0.2, hd: r * 0.07, rim: true, detail: (g) => {
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.045; g.beginPath();
        for (const x of [-1.2, -0.6, 0.6, 1.2]) { g.moveTo(r * 0.04, -r * 1.4); g.lineTo(r * x, -r * (0.66 + Math.abs(x) * 0.12)); }
        g.stroke();
        g.strokeStyle = A.pal.acc; g.lineWidth = r * 0.08; g.beginPath(); g.moveTo(-r * 1.86, -r * 0.4); g.quadraticCurveTo(0, -r * 0.6, r * 1.88, -r * 0.42); g.stroke();
        orderMark(g, r * 0.05, -r * 0.96, r * 0.17, A.pal.acc, r * 0.07);
      } });
      break;
    }
    case 'crescent': case 'horns': {
      _hood(ctx, A, r, pal, ZUKIN);
      if (o.head === 'horns') {
        // the far horn behind the bowl
        celFill(ctx, () => orderShape(ctx, r, [[-0.42, -0.9], [-1.24, -1.18], [-1.38, -1.66], [-1.02, -2.42, 1], [-1.04, -1.72], [-0.82, -1.38], [-0.3, -1.12]]), ORDER_LACQ_FAR, A, { sd: r * 0.1, rim: true });
      }
      _halfMask(ctx, A, r);
      _kabuto(ctx, A, r, o.head === 'horns');
      if (o.head === 'crescent') {
        // the tall silver crescent maedate on the brow
        celFill(ctx, () => {
          ctx.moveTo(r * 0.56, -r * 1.02);
          ctx.quadraticCurveTo(r * 1.62, -r * 1.24, r * 1.58, -r * 2.36);
          ctx.quadraticCurveTo(r * 1.36, -r * 1.48, r * 0.5, -r * 1.3);
          ctx.quadraticCurveTo(-r * 0.4, -r * 1.48, -r * 0.62, -r * 2.36);
          ctx.quadraticCurveTo(-r * 0.62, -r * 1.24, r * 0.56, -r * 1.02); ctx.closePath();
        }, ORDER_SILVER, A, { sd: r * 0.1, hd: r * 0.05, rim: true });
        celFill(ctx, () => { ctx.ellipse(r * 0.53, -r * 1.06, r * 0.16, r * 0.12, 0, 0, TAU); }, ORDER_LACQ, A, { sd: r * 0.05 });
      } else {
        // the near ox horn: thick at the bowl, sweeping out, forward and up to a hooked point; a crimson band at its root
        celFill(ctx, () => orderShape(ctx, r, [[0.3, -0.8], [1.12, -1.0], [1.56, -1.42], [1.52, -2.42, 1], [1.24, -1.62], [0.86, -1.32], [0.16, -1.16]]), ORDER_HORN, A, { sd: r * 0.16, hd: r * 0.05, rim: true, detail: (g) => {
          g.strokeStyle = A.pal.acc; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(r * 0.62, -r * 0.82); g.lineTo(r * 0.5, -r * 1.24); g.stroke();
        } });
      }
      break;
    }
  }
  A.lx = sv[0]; A.ly = sv[1];
}
