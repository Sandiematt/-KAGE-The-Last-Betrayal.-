/* KAGE — the Order of Silence as armoured anime samurai (anime redesign, ticket 03).
   The fox-masked swordsman of docs/art-reference/sheets/slash-single.webp is the model: a dark lacquered dō laced in
   crimson (odoshi), sode on the shoulders, a kusazuri skirt of plates over dark hakama, kote, suneate and waraji, and a
   kitsune face as the family mark. Each of the five soldiers gets its own head and armour weight so the silhouette alone
   tells them apart at gameplay zoom:
     order_footman      the cutter: full fox mask with tall pointed ears over a cloth hood, full dō, sode, saya
     order_runner       the dagger runner: a peaked shinobi hood with two long streaming tails, fox half-mask, light
                        breastplate (hara-ate), no sode, short kusazuri
     order_shieldbearer the sentinel spear: kabuto with a tall silver crescent maedate and a flared shikoro, fox menpō,
                        big sode, and a tall lacquered tate (shield) in the off hand
     order_chainthrower the chain hook: a wide flat jingasa over a hood, fox half-mask, light breastplate with a chain
                        bandolier across the chest
     order_ironclad     the raider: horned kabuto (ox-horn wakidate) with a broad shikoro, fox menpō, a heavy dō with a
                        gorget, huge o-sode and long kusazuri
   Everything here is drawing: parts are celFill paths on the skeleton, honour the flat passes (A.flat) and move no joint.
   The helmet and armour keys (order_hood, order_kabuto, order_garb, order_plate) are enemy-only; no gear item uses them. */

// slate-tinted lacquer (the Order's armour): near-black with a cold blue-grey lift, one tone per material step
const ORDER_LACQ = ['#08090b', '#121519', '#2a3038'];
const ORDER_LACQ_FAR = ['#060708', '#0b0d10', '#161a1f'];
const ORDER_SILVER = ['#3c3f45', '#6f737a', '#aeb2b8'];   // muted silver for the crescent crest and fittings
const ORDER_HORN = ['#070707', '#141315', '#34313a'];

// one design per soldier type: `order` holds the Order-only parts; the shared body reads sleeve / kote / feet / saya
const _orderBase = { top: 'gi', feet: 'sandal', kote: true, collar: false, sash: 'order', noGiSash: true, suneate: true };
ANIME_SKINS.order_footman = Object.assign({}, _orderBase, { sleeve: 1.02, saya: true,
  order: { head: 'fox', do: 'full', sode: 1, kusa: { rows: 4, len: 1.1, panels: 3 } } });
ANIME_SKINS.order_runner = Object.assign({}, _orderBase, { sleeve: 0.86,
  order: { head: 'runner', do: 'light', sode: 0, kusa: { rows: 2, len: 0.62, panels: 2 } } });
ANIME_SKINS.order_shieldbearer = Object.assign({}, _orderBase, { sleeve: 1.06,
  order: { head: 'crescent', do: 'full', sode: 1.15, kusa: { rows: 4, len: 1.15, panels: 3 } } });
ANIME_SKINS.order_chainthrower = Object.assign({}, _orderBase, { sleeve: 0.95,
  order: { head: 'jingasa', do: 'light', sode: 0, chain: true, kusa: { rows: 3, len: 0.8, panels: 2 } } });
ANIME_SKINS.order_ironclad = Object.assign({}, _orderBase, { sleeve: 1.1,
  order: { head: 'horns', do: 'heavy', sode: 1.3, kusa: { rows: 5, len: 1.35, panels: 3 } } });

// cloth the Order designs need (from animeCloths): the runner's two long hood tails, the chainthrower's hat cords
function orderCloths(f, sk) {
  const s = f.scale, o = sk.order; if (!o) return;
  if (o.head === 'runner') {
    f.cloths.push({ kind: 'scarf', c: new Cloth(11, 7.6 * s, { ph: 3.3, wind: 1250, grav: 520, stiff: 1.85 }), at: 'head', color: '#121519', rim: 'rgba(52,10,13,0.95)', w: 8.4 * s, w1: 2.6 * s, dy: -6, dx: 16 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(9, 7.2 * s, { ph: 6.8, wind: 1100, grav: 600, stiff: 1.85 }), at: 'head', color: '#0b0d10', rim: 'rgba(52,10,13,0.95)', w: 6.4 * s, w1: 2 * s, dy: -3, dx: 15 });
  } else if (o.head === 'jingasa') {
    f.cloths.push({ kind: 'scarf', c: new Cloth(5, 5.2 * s, { ph: 2.1, wind: 420, grav: 1100, stiff: 1.6 }), at: 'head', color: ANIME.crimson, w: 1.8 * s, w1: 1.2 * s, dy: 10, dx: 12 });
  }
}

/* ---- path helpers ---- */
// a closed path through points in head units ([x, y, sharp?]); smooth corners by default, a sharp corner where flagged
function orderShape(ctx, r, pts) {
  const n = pts.length, X = (i) => pts[(i + n) % n][0] * r, Y = (i) => pts[(i + n) % n][1] * r, sharp = (i) => pts[(i + n) % n][2];
  if (sharp(0)) ctx.moveTo(X(0), Y(0)); else ctx.moveTo((X(-1) + X(0)) / 2, (Y(-1) + Y(0)) / 2);
  for (let i = sharp(0) ? 1 : 0; i < n; i++) {
    if (sharp(i)) ctx.lineTo(X(i), Y(i));
    else ctx.quadraticCurveTo(X(i), Y(i), (X(i) + X(i + 1)) / 2, (Y(i) + Y(i + 1)) / 2);
  }
  ctx.closePath();
}
// a plate: a quad (top edge a0-a1, bottom edge b1-b0) with edges bowed outward by `bow` px
function _quad(ctx, a0, a1, b1, b0, bow) {
  const bx = (p, q, k) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [(p[0] + q[0]) / 2 + dy / l * k, (p[1] + q[1]) / 2 - dx / l * k]; };
  const c1 = bx(a1, b1, bow), c2 = bx(b0, a0, bow), c3 = bx(b1, b0, bow * 0.6);
  ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]);
  ctx.quadraticCurveTo(c1[0], c1[1], b1[0], b1[1]);
  ctx.quadraticCurveTo(c3[0], c3[1], b0[0], b0[1]);
  ctx.quadraticCurveTo(c2[0], c2[1], a0[0], a0[1]);
  ctx.closePath();
}
// lames on a quad plate: dark seams across, a lit edge under each, and rows of crimson lacing (kebiki odoshi) below
function _odoshi(g, A, Q, rows, ticks, tone, lw) {
  const s = A.s, acc = A.pal.acc;
  for (let i = 0; i < rows; i++) {
    const t0 = i / rows, t1 = t0 + 0.42 / rows;
    g.strokeStyle = acc; g.lineWidth = lw || 1.1 * s; g.lineCap = 'butt'; g.beginPath();
    for (let j = 0; j < ticks; j++) { const k = (j + 0.5) / ticks, p = Q(k, t0 + 0.06 / rows), q = Q(k, t1); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
    g.stroke();
    if (i === 0) continue;
    const a = Q(-0.1, t0), b = Q(1.1, t0);
    g.lineCap = 'round';
    g.strokeStyle = tone[2]; g.lineWidth = 0.8 * s; g.beginPath(); g.moveTo(a[0] - A.lx * 1.2 * s, a[1] - A.ly * 1.2 * s); g.lineTo(b[0] - A.lx * 1.2 * s, b[1] - A.ly * 1.2 * s); g.stroke();
    g.strokeStyle = ANIME.outline; g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
  g.lineCap = 'round';
}
// the Order mark: a closed circle barred across like a sealed mouth
function orderMark(g, x, y, R, col, lw) {
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke();
  g.beginPath(); g.moveTo(x - R * 0.62, y); g.lineTo(x + R * 0.62, y); g.stroke();
}
// turn the camera light into the rotated, mirrored head frame (as drawKageHair does); returns the saved light
function _headLight(A, f) {
  const sv = [A.lx, A.ly], hl = f.headRot || 0, c = Math.cos(-hl), sn = Math.sin(-hl);
  A.lx = (sv[0] * c - sv[1] * sn) * A.f; A.ly = sv[0] * sn + sv[1] * c;
  return sv;
}

/* ---- heads (head frame: +x the face side, r the head radius) ---- */
// the eye holes of a mask: dark almonds round the eye positions drawEyes uses, so the white eyes glow through
function _eyeHoles(g, r) {
  const rf = r * 0.9, ey = rf * 0.08;
  g.fillStyle = ANIME.face;
  for (const [x, y, w, h] of [[rf * 0.48, ey, rf * 0.5, rf * 0.3], [rf * 0.88, ey - rf * 0.03, rf * 0.22, rf * 0.24]]) {
    g.beginPath(); g.moveTo(x + w * 0.55, y + h * 0.2);
    g.quadraticCurveTo(x + w * 0.05, y - h * 1.0, x - w * 0.55, y - h * 0.65);
    g.quadraticCurveTo(x - w * 0.05, y + h * 0.9, x + w * 0.55, y + h * 0.2); g.closePath(); g.fill();
  }
}
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

/* ---- the body pieces (spine frame: P(u, w), u 0 hip .. 1 neck, w px across toward the front) ---- */
const ORDER_DO = {
  full:  { front: [[0.04, 13.6], [0.3, 12.8], [0.56, 14.6], [0.78, 15.8], [0.91, 14], [0.96, 8]], back: [[0.96, -9], [0.91, -15], [0.74, -16], [0.5, -14], [0.26, -13.6], [0.04, -14.2]] },
  heavy: { front: [[0.02, 14.6], [0.3, 13.8], [0.56, 15.4], [0.8, 16.4], [0.92, 14.4], [0.98, 8.6]], back: [[0.98, -9.4], [0.92, -15.6], [0.74, -16.6], [0.5, -14.6], [0.26, -14.4], [0.02, -15.2]] },
  light: { front: [[0.1, 13.2], [0.36, 12.6], [0.6, 14.2], [0.8, 14.8], [0.91, 12], [0.94, 4]], back: [[0.94, -3], [0.62, -5], [0.3, -5], [0.1, -4]] }
};
// drawn by drawArmor ('order_garb' / 'order_plate') over the gi torso
function drawOrderArmor(ctx, f, ink, flat) {
  const A = f._A, o = animeSkin(f).order;
  const S = A.S, U = A.U, pal = A.pal, kind = o.do;
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const prof = ORDER_DO[kind];
  if (kind === 'light') {
    // the runner's and chainthrower's hara-ate: crossed crimson cords over the back of the gi, then the front plate
    if (!A.flat) {
      ctx.strokeStyle = pal.acc; ctx.lineWidth = 1.3 * U; ctx.beginPath();
      const a = P(0.92, -2), b = P(0.2, -11), c = P(0.9, -10), d = P(0.24, -1);
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke();
    }
  }
  celFill(ctx, () => animeTorso(ctx, S, prof, U), ORDER_LACQ, A, { sd: 7 * U, hd: 1.1 * U, rim: true, detail: (g) => {
    const top = kind === 'heavy' ? 0.82 : 0.78;
    // the lames of the dō: seams across, a lit edge, crimson lacing rows
    const Q = (k, t) => P(lerp(0.1, top, 1 - t), lerp(-17, 17, k));
    _odoshi(g, A, Q, kind === 'heavy' ? 5 : 4, kind === 'light' ? 7 : 12, ORDER_LACQ, 1.1 * U);
    // the chest plate (munaita) with its lit top edge
    const m0 = P(top, -18), m1 = P(top, 18);
    g.strokeStyle = ANIME.outline; g.lineWidth = 1.4 * U; g.beginPath(); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]); g.stroke();
    const e0 = P(0.94, -6), e1 = P(0.9, 12);
    g.strokeStyle = ORDER_LACQ[2]; g.lineWidth = 1.2 * U; g.beginPath(); g.moveTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.stroke();
    // the Order mark on the chest plate
    const mk = P((top + 0.95) / 2, 7.5);
    orderMark(g, mk[0], mk[1], 2.6 * U, pal.accHi, 1.1 * U);
    if (o.chain) {
      // the chainthrower's bandolier of chain from the far shoulder across to the front hip
      g.strokeStyle = '#4a4e55'; g.lineWidth = 1.2 * U;
      for (let i = 0; i <= 9; i++) {
        const k = i / 9, p = P(lerp(0.95, 0.18, k), lerp(-6, 13, k));
        g.beginPath(); g.ellipse(p[0], p[1], 1.9 * U, 1.1 * U, Math.atan2(S.dy, S.dx) + (i % 2 ? 0.9 : -0.9), 0, TAU); g.stroke();
      }
    }
  } });
  if (kind === 'heavy') {
    // the gorget (nodowa) round the throat
    celFill(ctx, () => animeTorso(ctx, S, { front: [[0.9, 9], [1.0, 9.6], [1.06, 5]], back: [[1.06, -6], [1.0, -11], [0.9, -11]] }, U), ORDER_LACQ, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => {
      const a = P(0.97, -12), b = P(0.97, 11); g.strokeStyle = pal.acc; g.lineWidth = 1.2 * U; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    } });
  }
  void ink; void flat;
}
// the waist: a dark uwa-obi over the dō's lower edge with a crimson cord knotted at the front
Fighter.prototype.orderBelt = function (ctx, S, A, U) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const o = animeSkin(this).order, wf = o.do === 'heavy' ? 15 : 13.4, wb = o.do === 'heavy' ? 15.4 : 13.8;
  celFill(ctx, () => { const a = P(0.0, -wb), b = P(0.0, wf), c = P(0.12, wf), d = P(0.12, -wb); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); },
    [ANIME.cloth0, '#111214', '#26282c'], A, { sd: 2.6 * U, hd: 0.6 * U, detail: (g) => {
      g.strokeStyle = A.pal.acc; g.lineWidth = 1.2 * U; g.beginPath();
      const a = P(0.06, -wb), b = P(0.06, wf); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      const k = P(0.06, wf - 3); g.fillStyle = A.pal.accHi; g.beginPath(); g.arc(k[0], k[1], 1.7 * U, 0, TAU); g.fill();
    } });
};
// kusazuri: plates hanging from the waist, each set swinging between straight down and its thigh; `which` 'back' is
// drawn before the near leg (over the far thigh), 'front' after it
Fighter.prototype.orderKusazuri = function (ctx, S, A, U, which) {
  const o = animeSkin(this).order, ks = o.kusa, sk = this.sk;
  const panel = (w, thighA, thighB, wid, far) => {
    const top = [spX(S, 0.06, w * U), spY(S, 0.06, w * U)];
    let tx = thighB.x - thighA.x, ty = thighB.y - thighA.y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    let dx = -S.ux * 0.5 + tx * 0.5, dy = -S.uy * 0.5 + ty * 0.5; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const nx = -dy, ny = dx, len = 21 * U * ks.len, w0 = wid * U, w1 = wid * 1.16 * U;
    const a0 = [top[0] - nx * w0 / 2, top[1] - ny * w0 / 2], a1 = [top[0] + nx * w0 / 2, top[1] + ny * w0 / 2];
    const b1 = [top[0] + dx * len + nx * w1 / 2, top[1] + dy * len + ny * w1 / 2], b0 = [top[0] + dx * len - nx * w1 / 2, top[1] + dy * len - ny * w1 / 2];
    const Q = (k, t) => [lerp(lerp(a0[0], a1[0], k), lerp(b0[0], b1[0], k), t), lerp(lerp(a0[1], a1[1], k), lerp(b0[1], b1[1], k), t)];
    const tone = far ? ORDER_LACQ_FAR : ORDER_LACQ;
    celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 1.2 * U), tone, A, { sd: 3 * U, hd: far ? 0 : 0.8 * U, rim: !far, detail: (g) => _odoshi(g, A, Q, ks.rows, far ? 3 : 5, tone, 1 * U) });
  };
  if (which === 'back') {
    panel(-8, sk.hipB, sk.bkn, 14, true);
    if (ks.panels > 2) panel(1, sk.hipB, sk.bkn, 14, true);
  } else {
    if (ks.panels > 2) panel(-3, sk.hipF, sk.fkn, 14, false);
    panel(7, sk.hipF, sk.fkn, 15, false);
  }
};
// sode: a laced shoulder plate hanging from the shoulder over the upper arm, between straight down and the arm
Fighter.prototype.orderSode = function (ctx, sh, el, A, U, far, size) {
  const S = A.S;
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  let dx = ax * 0.45 - S.ux * 0.55, dy = ay * 0.45 - S.uy * 0.55; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const nx = -dy, ny = dx, len = 25 * U * size, w0 = 17 * U * size, w1 = 21 * U * size;
  // hung a little outboard of the arm (toward the viewer's side of the shoulder) so it flares past the sleeve
  const top = [sh.x - dx * 5 * U - S.nx * 1.5 * U, sh.y - dy * 5 * U - S.ny * 1.5 * U];
  const a0 = [top[0] - nx * w0 / 2, top[1] - ny * w0 / 2], a1 = [top[0] + nx * w0 / 2, top[1] + ny * w0 / 2];
  const b1 = [top[0] + dx * len + nx * w1 / 2, top[1] + dy * len + ny * w1 / 2], b0 = [top[0] + dx * len - nx * w1 / 2, top[1] + dy * len - ny * w1 / 2];
  const Q = (k, t) => [lerp(lerp(a0[0], a1[0], k), lerp(b0[0], b1[0], k), t), lerp(lerp(a0[1], a1[1], k), lerp(b0[1], b1[1], k), t)];
  const tone = far ? ORDER_LACQ_FAR : ORDER_LACQ;
  celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, 2 * U * size), tone, A, { sd: 3.4 * U, hd: far ? 0 : 1 * U, rim: true, detail: far ? null : (g) => {
    _odoshi(g, A, Q, size > 1.4 ? 5 : 4, 5, tone, 1.1 * U);
    // the top plate's lit edge
    g.strokeStyle = tone[2]; g.lineWidth = 1.3 * U; g.beginPath(); g.moveTo(a0[0] - A.lx * 1.4 * U, a0[1] - A.ly * 1.4 * U + 1.4 * U); g.lineTo(a1[0] - A.lx * 1.4 * U, a1[1] - A.ly * 1.4 * U + 1.4 * U); g.stroke();
  } });
};
// suneate: a lacquered shin guard with three splints and crimson ties, over the bloused hakama
Fighter.prototype.orderSuneate = function (ctx, kn, ft, A, U, far) {
  const a = { x: lerp(kn.x, ft.x, 0.32), y: lerp(kn.y, ft.y, 0.32) }, b = { x: lerp(kn.x, ft.x, 0.93), y: lerp(kn.y, ft.y, 0.93) };
  const tone = far ? ORDER_LACQ_FAR : ORDER_LACQ;
  celFill(ctx, () => animeCapsule(ctx, a, b, 5.6 * U, 4.4 * U, 0.4 * U, 0.35), tone, A, { sd: 2.4 * U, hd: far ? 0 : 0.7 * U, detail: far ? null : (g) => {
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    g.strokeStyle = ANIME.outline; g.lineWidth = 1 * A.s; g.beginPath();
    for (const o of [-2.4, 0.4, 3]) { g.moveTo(a.x + nx * o * U + dx * 0.1, a.y + ny * o * U + dy * 0.1); g.lineTo(b.x + nx * o * 0.85 * U - dx * 0.04, b.y + ny * o * 0.85 * U - dy * 0.04); }
    g.stroke();
    g.strokeStyle = A.pal.acc; g.lineWidth = 1.2 * U; g.beginPath();
    for (const k of [0.16, 0.8]) { g.moveTo(a.x + dx * k + nx * 6 * U, a.y + dy * k + ny * 6 * U); g.lineTo(a.x + dx * (k + 0.05) - nx * 6 * U, a.y + dy * (k + 0.05) - ny * 6 * U); }
    g.stroke();
  } });
};
// the shieldbearer's tate: a tall lacquered plank shield with iron bands and the Order mark, held on the off arm
Fighter.prototype.orderShield = function (ctx, A) {
  const s = this.scale, sk = this.sk, f = this.facing, w = 13 * s, h = 40 * s;
  ctx.save(); ctx.translate(sk.bha.x + f * 6 * s, sk.bha.y);
  const P = () => { ctx.moveTo(-w, -h + 4 * s); ctx.quadraticCurveTo(0, -h - 3 * s, w, -h + 4 * s); ctx.lineTo(w * 0.92, h - 2 * s); ctx.quadraticCurveTo(0, h + 3 * s, -w * 0.92, h - 2 * s); ctx.closePath(); };
  celFill(ctx, P, ORDER_LACQ, A, { sd: 4 * s, hd: 1.2 * s, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = 1 * s; g.beginPath();
    for (const x of [-w / 3, w / 3]) { g.moveTo(x, -h); g.lineTo(x * 0.95, h); }
    g.stroke();
    for (const y of [-h * 0.62, h * 0.62]) {
      g.fillStyle = ORDER_LACQ[0]; g.fillRect(-w, y - 2.6 * s, w * 2, 5.2 * s);
      g.fillStyle = ORDER_LACQ[2]; g.fillRect(-w, y - 2.6 * s, w * 2, 1 * s);
      g.fillStyle = ORDER_SILVER[1]; for (const x of [-w * 0.6, 0, w * 0.6]) { g.beginPath(); g.arc(x, y, 1.1 * s, 0, TAU); g.fill(); }
    }
    orderMark(g, 0, 0, 6.4 * s, A.pal.accHi, 2 * s);
    g.strokeStyle = A.pal.acc; g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(-w * 0.7, -h * 0.3); g.quadraticCurveTo(0, -h * 0.18, w * 0.7, -h * 0.3); g.stroke();
  } });
  ctx.restore();
};
