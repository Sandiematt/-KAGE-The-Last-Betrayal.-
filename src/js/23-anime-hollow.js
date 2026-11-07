/* KAGE — the Hollows as torn, spectral anime samurai (anime redesign, ticket 04).
   A Hollow is a memory of a samurai coming apart: the same black-faced, white-eyed figure as everyone else, but its
   robes are ragged and layered, the hems torn into points, the sleeves frayed, the limbs bound in wraps, and the face
   half hidden by cracked mask fragments that glow violet along the breaks. Violet replaces crimson as the accent, in
   near-black cloth. The glitch, offset ghost, violet flicker, outline and memory-ash dissolve of Fighter.draw sit on top.
   Each type reads apart by its silhouette at gameplay zoom:
     hollow_shade     the cutter: a ragged cowl with a crown of floating shards, a cracked half-mask, a torn haori skirt
                      to the calf, a rip across the chest, a saya
     hollow_tutorial  the training husk: a stitched sack hood with straw bursting from its crown, a plank practice mask
                      strapped over the eyes, rope bindings crossed over the chest, straw at the cuffs, a short rag skirt
     hollow_flicker   the dagger: slim and hunched, a hood peaked forward like a beak with two long torn tails, a thin
                      cracked visor, a torso bound in wraps, narrow wrapped legs, one long split tatter behind
     hollow_ward      the staff monk: a broken tengai (woven basket hat) cracked open over the face, a patchwork kesa and a
                      juzu of mask beads, huge frayed sleeves, a robe to the ankles
     hollow_mimic     the crescents: a full cracked mask with a crescent-moon shard crest, a cracked mirror on the chest,
                      a long torn cape from the shoulders
     hollow_husk      the fists brute: a heavy horned brow mask, a ragged mantle humped over the shoulders, a torn robe
                      open on a chest of glowing cracks, bare wrapped forearms and huge bandaged fists, a shimenawa rope
                      belt hung with shide papers
     hollow_kage      the ronin (the Witness's copies of Kage): swept hair tied in a topknot with a violet cord and a torn
                      violet hachimaki, a shard over one cheek, Kage's long coat cut, torn at the hem
   Everything here is drawing: parts are celFill paths on the skeleton, honour the flat passes (A.flat) and move no joint.
   hollow_shard and hollow_rags are enemy-only keys. Utsushi (hollow_rags, ticket 05) has no skin entry here and gets the
   generic torn torso; Hollow Rem and the Hollow boss echoes keep their own looks under the Hollow palette. */

// cracked mask fragments: a dull ash-violet lacquer, the lightest thing on a Hollow after its eyes
const HOLLOW_MASK = ['#1d1a25', '#363143', '#625b76'];
const HOLLOW_MASK_FAR = ['#121017', '#1e1b26', '#2e2a38'];
const HOLLOW_WRAP = ['#0e0c12', '#1b1822', '#312d3b'];    // bandage wraps (kote, shins, fists, the flicker's torso)
const HOLLOW_ROPE = ['#17130d', '#2b241a', '#4a3f2c'];    // the husk's rope
const HOLLOW_STRAW = ['#2a2216', '#4a3d27', '#6c5a3a'];   // straw bursting from the training husk
const HOLLOW_WOOD = ['#14100c', '#241d16', '#3d3226'];    // its plank practice mask
const HOLLOW_SACK = ['#120f0d', '#1f1a16', '#342d26'];    // its sack hood
const HOLLOW_WEAVE = ['#0c0a0f', '#18151d', '#2d2935'];   // the monk's tengai
const HOLLOW_KESA = ['#1a1230', '#2a2048', '#43366e'];    // the monk's kesa, the one violet-dyed cloth
const HOLLOW_GLOW = 'rgba(140,110,240,0.42)';

// one design per Hollow type; robe parts are [links, link length px, width at the waist, width at the hem] (design units)
const _hollowBase = { top: 'gi', feet: 'sandal', kote: 'wrap', collar: false, sash: 'hollow', wrapShin: true };
ANIME_SKINS.hollow_shade = Object.assign({}, _hollowBase, { sleeve: 1.04, saya: true,
  hollow: { head: 'shade', top: 'rip', fray: 1, robe: { back: [7, 11, 22, 50], flap: [6, 10.5, 15, 30], teeth: 6, rag: 9 } } });
ANIME_SKINS.hollow_tutorial = Object.assign({}, _hollowBase, { sleeve: 1, sash: 'rope',
  hollow: { head: 'sack', top: 'rope', fray: 'straw', robe: { back: [4, 10, 22, 32], flap: [4, 9.5, 16, 24], teeth: 4, rag: 6 } } });
ANIME_SKINS.hollow_flicker = Object.assign({}, _hollowBase, { sleeve: 0.82,
  hollow: { head: 'beak', top: 'wrap', fray: 0.8, legW: 0.84, tails: true, mantle: 'hunch', robe: { back: [8, 10, 12, 20], teeth: 3, rag: 11 } } });
ANIME_SKINS.hollow_ward = Object.assign({}, _hollowBase, { sleeve: 1.26, wrapShin: false,
  hollow: { head: 'tengai', top: 'kesa', fray: 1.25, robe: { back: [9, 10.5, 26, 60], flap: [8, 10.5, 20, 40], teeth: 7, rag: 8 } } });
ANIME_SKINS.hollow_mimic = Object.assign({}, _hollowBase, { sleeve: 1.1,
  hollow: { head: 'crescent', top: 'mirror', fray: 1.3, cape: true, robe: { back: [6, 10.5, 20, 40], flap: [5, 10, 14, 26], teeth: 5, rag: 8 } } });
ANIME_SKINS.hollow_husk = Object.assign({}, _hollowBase, { sleeve: 1.12, sash: 'shimenawa',
  hollow: { head: 'brute', top: 'veins', fray: 1, bare: true, mantle: true, fist: true, robe: { back: [5, 11, 30, 46], flap: [5, 10.5, 22, 34], teeth: 6, rag: 7 } } });
ANIME_SKINS.hollow_kage = Object.assign({}, _hollowBase, { top: 'coat', collar: true, sleeve: 1, feet: 'boot', saya: true, wrapShin: false,
  hollow: { head: 'ronin', top: 'coat', fray: 0.9, robe: { back: [8, 12, 22, 58], flap: [7, 11.4, 16, 34], teeth: 6, rag: 10 } } });

// cloth the Hollow designs need (from animeCloths): the torn robe panels from the waist, the mimic's cape from the
// shoulders, the flicker's two long hood tails
function hollowCloths(f, sk) {
  const s = f.scale, h = sk.hollow, r = h.robe;
  if (h.cape) f.cloths.push({ kind: 'hrobe', part: 'cape', c: new Cloth(8, 10 * s, { ph: 5.5, wind: 760, grav: 820, stiff: 1.3, hang: 0.4 }), at: 'sh', dx: 5, dy: 2 });
  if (r.back) f.cloths.push({ kind: 'hrobe', part: 'back', c: new Cloth(r.back[0], r.back[1] * s, { ph: 2.6, wind: 1050, grav: 1000, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -4 });
  if (r.flap) f.cloths.push({ kind: 'hrobe', part: 'flap', c: new Cloth(r.flap[0], r.flap[1] * s, { ph: 5.1, wind: 260, grav: 1250, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });
  if (h.tails) {
    f.cloths.push({ kind: 'scarf', c: new Cloth(11, 7.4 * s, { ph: 3.7, wind: 1300, grav: 500, stiff: 1.85 }), at: 'head', color: '#1a1430', rim: 'rgba(96,70,190,0.7)', w: 7.6 * s, w1: 1.6 * s, dy: -8, dx: 13 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(9, 7 * s, { ph: 7.4, wind: 1150, grav: 580, stiff: 1.85 }), at: 'head', color: '#110d20', rim: 'rgba(96,70,190,0.7)', w: 5.6 * s, w1: 1.2 * s, dy: -4, dx: 12 });
  }
}

/* ---- helpers ---- */
// a glowing crack: a dark break, a soft violet bloom and a thin bright core; pts in units of k (head r, or 1 for px)
function hollowCrack(g, A, k, pts, w) {
  const path = () => { g.beginPath(); for (let i = 0; i < pts.length; i++) i ? g.lineTo(pts[i][0] * k, pts[i][1] * k) : g.moveTo(pts[i][0] * k, pts[i][1] * k); };
  g.lineJoin = 'miter'; g.lineCap = 'round';
  g.strokeStyle = ANIME.outline; g.lineWidth = w * 2.6; path(); g.stroke();
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = HOLLOW_GLOW; g.lineWidth = w * 3.2; path(); g.stroke();
  g.globalCompositeOperation = 'source-over';
  g.strokeStyle = A.pal.accHi; g.lineWidth = w; path(); g.stroke();
  g.lineJoin = 'round';
}
// spine-frame points [u, w(, sharp)] -> absolute points for orderShape(ctx, 1, pts)
function _hsp(S, U, pts) { return pts.map(p => [spX(S, p[0], p[1] * U), spY(S, p[0], p[1] * U), p[2]]); }
const HOLLOW_TEETH = [1, 0.34, 0.82, 0.16, 1.18, 0.5, 0.92, 0.26, 0.7];
// a robe panel from the cloth edges (coatEdges filled _cpL / _cpR): smooth sides, the hem torn into K uneven points
function tornPanelPath(ctx, n, K, rag, seed, floorY) {
  const L = _cpL, R = _cpR, e = (n - 1) * 2;
  ctx.moveTo(L[0], L[1]);
  for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(L[i * 2], L[i * 2 + 1], (L[i * 2] + L[i * 2 + 2]) / 2, (L[i * 2 + 1] + L[i * 2 + 3]) / 2);
  ctx.lineTo(L[e], L[e + 1]);
  let dx = (L[e] + R[e] - L[e - 2] - R[e - 2]) / 2, dy = (L[e + 1] + R[e + 1] - L[e - 1] - R[e - 1]) / 2; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  for (let k = 0; k < K; k++) {
    const t0 = (k + 0.5) / K, t1 = (k + 1) / K, d = HOLLOW_TEETH[(k + seed) % HOLLOW_TEETH.length] * rag;
    ctx.lineTo(lerp(L[e], R[e], t0) + dx * d, Math.min(lerp(L[e + 1], R[e + 1], t0) + dy * d, floorY));
    if (k < K - 1) ctx.lineTo(lerp(L[e], R[e], t1) - dx * rag * 0.22, Math.min(lerp(L[e + 1], R[e + 1], t1) - dy * rag * 0.22, floorY));
  }
  ctx.lineTo(R[e], R[e + 1]);
  for (let i = n - 2; i > 0; i--) ctx.quadraticCurveTo(R[i * 2], R[i * 2 + 1], (R[i * 2] + R[i * 2 - 2]) / 2, (R[i * 2 + 1] + R[i * 2 - 1]) / 2);
  ctx.lineTo(R[0], R[1]);
  ctx.closePath();
}
// a jagged tear in a panel: the dark layer behind showing through, a violet fray on its lower lip
function _tear(g, A, x, y, w, h, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = ANIME.face; g.beginPath();
  g.moveTo(-w, 0); g.lineTo(-w * 0.4, -h * 0.7); g.lineTo(0, -h * 0.2); g.lineTo(w * 0.5, -h); g.lineTo(w, 0.1 * h); g.lineTo(w * 0.2, h * 0.5); g.lineTo(-w * 0.3, h * 0.9); g.closePath(); g.fill();
  g.strokeStyle = A.pal.acc; g.lineWidth = Math.max(0.7, h * 0.18); g.beginPath(); g.moveTo(w, 0.1 * h); g.lineTo(w * 0.2, h * 0.5); g.lineTo(-w * 0.3, h * 0.9); g.stroke();
  g.restore();
}

/* ---- robes and cape ---- */
Fighter.prototype.hollowRobe = function (ctx, A, skin, U, part) {
  const cl = this.cloths.find(c => c.kind === 'hrobe' && c.part === part);
  if (!cl || !cl.c.init) return;
  const h = skin.hollow, spec = part === 'cape' ? [0, 0, 14, 40] : h.robe[part], back = part !== 'flap';
  const floorY = this.y + 2 * A.s;
  const n = coatEdges(cl, spec[2] * U, spec[3] * U, floorY);
  const K = part === 'cape' ? 5 : h.robe.teeth - (part === 'flap' ? 1 : 0), rag = h.robe.rag * U * (part === 'cape' ? 1.4 : 1), seed = part === 'flap' ? 3 : part === 'cape' ? 5 : 0;
  const pal = A.pal, tone = part === 'cape' ? pal.back : back ? pal.coatB : pal.fab;
  celFill(ctx, () => tornPanelPath(ctx, n, K, rag, seed, floorY), tone, A, { sd: (back ? 7 : 5) * U, hd: back ? 0 : 0.9 * U, rim: true, detail: (g) => {
    // fold lines running down the panel
    g.strokeStyle = back ? ANIME.cloth0 : pal.fab[0]; g.lineWidth = 1 * A.s;
    g.beginPath();
    for (const t of [0.3, 0.62, 0.84]) { for (let i = 1; i < n; i++) { const x = lerp(_cpL[i * 2], _cpR[i * 2], t + Math.sin(i * 1.3 + t * 5) * 0.05), y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t); i === 1 ? g.moveTo(x, y) : g.lineTo(x, y); } }
    g.stroke();
    // the remnant of a violet band near the hem, broken where the cloth tore
    if (n > 3) {
      const i = n - 2;
      g.globalAlpha *= 0.55; g.strokeStyle = pal.acc; g.lineWidth = 1.1 * U; g.setLineDash([5 * U, 3 * U, 2 * U, 4 * U]);
      g.beginPath(); g.moveTo(_cpL[i * 2], _cpL[i * 2 + 1]); g.lineTo(_cpR[i * 2], _cpR[i * 2 + 1]); g.stroke();
      g.setLineDash([]); g.globalAlpha /= 0.55;
    }
    // tears through the cloth
    for (const [ii, t, sz] of [[Math.floor(n * 0.55), 0.3, 1], [n - 2, 0.7, 0.8]]) {
      if (ii < 1 || ii >= n) continue;
      const x = lerp(_cpL[ii * 2], _cpR[ii * 2], t), y = lerp(_cpL[ii * 2 + 1], _cpR[ii * 2 + 1], t);
      const rot = Math.atan2(_cpR[ii * 2 + 1] - _cpL[ii * 2 + 1], _cpR[ii * 2] - _cpL[ii * 2]);
      _tear(g, A, x, y, 3.2 * U * sz, 2.4 * U * sz, rot);
    }
  } });
};

/* ---- arms and legs ---- */
// the frayed end of a sleeve: the opening p..q torn into hanging points (straw sticking out on the training husk)
Fighter.prototype.hollowCuff = function (ctx, p, q, fx, fy, A, tone, U, far, fray) {
  let dx = fx * 0.6, dy = fy * 0.6 + 0.55; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  if (fray === 'straw') {
    celFill(ctx, () => {
      for (let j = 0; j < 6; j++) {
        const t = (j + 0.5) / 6, bx = lerp(p.x, q.x, t), by = lerp(p.y, q.y, t), sp = (t - 0.5) * 1.1, c = Math.cos(sp), s = Math.sin(sp);
        const ux = fx * c - fy * s, uy = fx * s + fy * c, len = (5 + HOLLOW_TEETH[j] * 5) * U, nx = -uy * 0.9 * U, ny = ux * 0.9 * U;
        ctx.moveTo(bx - fx * 2 * U + nx, by - fy * 2 * U + ny); ctx.lineTo(bx + ux * len, by + uy * len); ctx.lineTo(bx - fx * 2 * U - nx, by - fy * 2 * U - ny); ctx.closePath();
      }
    }, HOLLOW_STRAW, A, { sd: 0.6 * U, seam: false });
    return;
  }
  const K = 4, rag = 7 * U * fray, bx = -fx * 2.4 * U, by = -fy * 2.4 * U;
  celFill(ctx, () => {
    ctx.moveTo(p.x + bx, p.y + by); ctx.lineTo(p.x, p.y);
    for (let k = 0; k < K; k++) {
      const t0 = (k + 0.5) / K, t1 = (k + 1) / K, d = HOLLOW_TEETH[(k + 2) % HOLLOW_TEETH.length] * rag + 2 * U;
      ctx.lineTo(lerp(p.x, q.x, t0) + dx * d, lerp(p.y, q.y, t0) + dy * d);
      if (k < K - 1) ctx.lineTo(lerp(p.x, q.x, t1) + dx * 1.2 * U, lerp(p.y, q.y, t1) + dy * 1.2 * U);
    }
    ctx.lineTo(q.x, q.y); ctx.lineTo(q.x + bx, q.y + by); ctx.closePath();
  }, tone, A, { sd: 2.4 * U, hd: far ? 0 : 0.7 * U, rim: !far, detail: far ? null : (g) => {
    // the frayed threads and the violet edge of the torn lining
    g.strokeStyle = A.pal.acc; g.lineWidth = 0.9 * A.s; g.beginPath(); g.moveTo(p.x + dx * 1.4 * U, p.y + dy * 1.4 * U); g.lineTo(q.x + dx * 1.4 * U, q.y + dy * 1.4 * U); g.stroke();
  } });
};
// bandage wraps round a limb a -> b: a pale-dark binding with diagonal turns and a loose end
Fighter.prototype.hollowWrap = function (ctx, a, b, ra, rb, A, U, far) {
  celFill(ctx, () => animeCapsule(ctx, a, b, ra, rb, 0.3 * U, 0.4), far ? [HOLLOW_WRAP[0], HOLLOW_WRAP[0], HOLLOW_WRAP[1]] : HOLLOW_WRAP, A, { sd: 2.2 * U, hd: far ? 0 : 0.7 * U, detail: far ? null : (g) => {
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, turns = Math.max(3, Math.round(l / (3.4 * U)));
    const r = Math.max(ra, rb) * 1.2;
    for (let i = 1; i < turns; i++) {
      const k = i / turns, x = a.x + dx * k, y = a.y + dy * k, sk = 0.07 * (i % 2 ? 1 : 0.6);
      g.strokeStyle = ANIME.outline; g.lineWidth = 1 * A.s; g.beginPath(); g.moveTo(x + nx * r - dx * sk, y + ny * r - dy * sk); g.lineTo(x - nx * r + dx * sk, y - ny * r + dy * sk); g.stroke();
      g.strokeStyle = HOLLOW_WRAP[2]; g.lineWidth = 0.7 * A.s; g.beginPath(); g.moveTo(x + nx * r - dx * sk - A.lx * U, y + ny * r - dy * sk - A.ly * U); g.lineTo(x - nx * r + dx * sk - A.lx * U, y - ny * r + dy * sk - A.ly * U); g.stroke();
    }
  } });
};

/* ---- the torso overlay (drawArmor 'hollow_rags') ---- */
function drawHollowArmor(ctx, f, ink, flat) {
  const A = f._A;
  if (A.flat) return;   // the torso is already in the flat silhouette
  const S = A.S, U = A.U, pal = A.pal, sk = animeSkin(f), h = sk.hollow || { top: 'rip' };
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const line = (pts, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); };
  ctx.save(); ctx.beginPath(); animeTorso(ctx, S, sk.top === 'coat' ? ANIME_TORSO.coat : ANIME_TORSO.gi, U); ctx.clip();
  ctx.lineCap = 'round';
  if (sk.top !== 'coat') line([P(1.04, 0.5), P(0.62, 6.6), P(0.3, 8.6)], pal.acc, 1.2 * U);   // the violet edge of the crossed collar
  switch (h.top) {
    case 'rip': case 'coat': {
      // a rip across the chest, its lips frayed violet, the dark under-robe showing through
      const pts = _hsp(S, U, [[0.82, -9, 1], [0.74, -4, 1], [0.7, 0, 1], [0.6, 4, 1], [0.52, 9, 1], [0.44, 13, 1], [0.5, 10.4, 1], [0.56, 6.6, 1], [0.64, 2.4, 1], [0.7, -2.4, 1], [0.76, -6, 1]]);
      ctx.fillStyle = ANIME.face; ctx.beginPath(); orderShape(ctx, 1, pts); ctx.fill();
      line(pts.slice(5).concat([pts[0]]), pal.acc, 0.9 * A.s);
      if (h.top === 'coat') line([P(1.02, 2.4), P(0.62, 5.2), P(0.14, 6.6)], pal.acc, 0.8 * U);
      break;
    }
    case 'rope': {
      // crossed rope bindings and a stitched patch: a straw dummy that learned to stand
      const pa = P(0.72, -6), pb = P(0.3, 4);
      ctx.fillStyle = HOLLOW_SACK[1]; ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); for (const [u, w] of [[0.72, 2], [0.48, 3], [0.46, -6]]) { const p = P(u, w); ctx.lineTo(p[0], p[1]); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = HOLLOW_SACK[2]; ctx.lineWidth = 0.8 * A.s; ctx.setLineDash([1.6 * U, 1.4 * U]); ctx.stroke(); ctx.setLineDash([]);
      for (const [a, b] of [[P(1.0, -10), P(0.1, 12)], [P(1.0, 9), P(0.12, -12)]]) {
        line([a, b], HOLLOW_ROPE[0], 3.2 * U); line([a, b], HOLLOW_ROPE[1], 2.2 * U);
        ctx.strokeStyle = HOLLOW_ROPE[2]; ctx.lineWidth = 0.8 * A.s; ctx.beginPath();
        for (let i = 1; i < 12; i++) { const k = i / 12, x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k); ctx.moveTo(x - S.ux * 1.2 * U, y - S.uy * 1.2 * U); ctx.lineTo(x + S.nx * 1.1 * U, y + S.ny * 1.1 * U); }
        ctx.stroke();
      }
      void pb;
      break;
    }
    case 'wrap': {
      // the torso bound tight in wraps: diagonal bands, each with a dark seam and a lit edge
      for (const u of [0.18, 0.34, 0.5, 0.66]) {
        const q = [P(u, -14), P(u + 0.1, 14), P(u + 0.18, 14), P(u + 0.08, -14)];
        ctx.fillStyle = HOLLOW_WRAP[1]; ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill();
        line([q[3], q[2]], HOLLOW_WRAP[2], 0.9 * A.s); line([q[0], q[1]], ANIME.outline, 1.1 * A.s);
      }
      hollowCrack(ctx, A, 1, [P(0.86, -2), P(0.76, 2), P(0.7, 0.5), P(0.6, 5)], 0.8 * A.s);
      break;
    }
    case 'kesa': {
      // a patchwork kesa over the far shoulder, torn at its end, and a juzu of mask-pale beads
      const k = _hsp(S, U, [[1.02, -11, 1], [1.0, -3, 1], [0.0, 13, 1], [-0.06, 5, 1]]);
      ctx.fillStyle = HOLLOW_KESA[1]; ctx.beginPath(); orderShape(ctx, 1, k); ctx.fill();
      ctx.strokeStyle = HOLLOW_KESA[0]; ctx.lineWidth = 1 * A.s; ctx.beginPath();
      for (let i = 1; i < 6; i++) { const t = i / 6, a = [lerp(k[0][0], k[3][0], t), lerp(k[0][1], k[3][1], t)], b = [lerp(k[1][0], k[2][0], t), lerp(k[1][1], k[2][1], t)]; ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.stroke();
      line([k[1], k[2]], HOLLOW_KESA[2], 1.2 * A.s); line([k[0], k[3]], pal.acc, 1 * A.s);
      for (let i = 0; i < 13; i++) {
        const t = i / 12, u = 1.0 - Math.sin(t * Math.PI) * 0.42, w = lerp(-7, 10, t), p = P(u, w), big = i === 6;
        ctx.fillStyle = HOLLOW_MASK[0]; ctx.beginPath(); ctx.arc(p[0], p[1], (big ? 2.4 : 1.6) * U, 0, TAU); ctx.fill();
        ctx.fillStyle = HOLLOW_MASK[2]; ctx.beginPath(); ctx.arc(p[0] - A.lx * 0.5 * U, p[1] - A.ly * 0.5 * U, (big ? 1.4 : 0.9) * U, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'mirror': {
      // a cracked round mirror of mask lacquer on the chest, a crescent's twin
      const c = P(0.64, 5.6), R = 4.6 * U;
      ctx.fillStyle = HOLLOW_MASK[0]; ctx.beginPath(); ctx.arc(c[0], c[1], R + 0.8 * U, 0, TAU); ctx.fill();
      ctx.fillStyle = HOLLOW_MASK[1]; ctx.beginPath(); ctx.arc(c[0], c[1], R, 0, TAU); ctx.fill();
      ctx.fillStyle = HOLLOW_MASK[2]; ctx.beginPath(); ctx.arc(c[0], c[1], R, Math.PI * 0.9, Math.PI * 1.6); ctx.arc(c[0] + R * 0.25, c[1] + R * 0.1, R * 0.86, Math.PI * 1.6, Math.PI * 0.9, true); ctx.fill();
      ctx.save(); ctx.translate(c[0], c[1]);
      hollowCrack(ctx, A, R, [[-0.9, -0.3], [-0.2, 0.05], [0.1, -0.5], [0.5, 0.2], [0.95, 0.15]], 0.7 * A.s);
      ctx.restore();
      line([P(1.04, -8), P(0.7, 2)], ANIME.outline, 1.1 * A.s);
      break;
    }
    case 'veins': {
      // the robe hangs open on a black chest split by glowing cracks
      const o = _hsp(S, U, [[1.04, 1, 1], [0.7, 3], [0.36, 6, 1], [0.36, 15, 1], [1.04, 15, 1]]);
      ctx.fillStyle = ANIME.face; ctx.beginPath(); orderShape(ctx, 1, o); ctx.fill();
      line([o[0], o[1], o[2]], pal.fab[2], 1.4 * U);
      hollowCrack(ctx, A, 1, [P(0.92, 6), P(0.78, 8.4), P(0.7, 7), P(0.56, 10.6), P(0.44, 9)], 0.9 * A.s);
      hollowCrack(ctx, A, 1, [P(0.78, 8.4), P(0.74, 12)], 0.7 * A.s);
      break;
    }
  }
  ctx.restore();
  void ink; void flat;
}

/* ---- waist ---- */
Fighter.prototype.hollowSash = function (ctx, S, A, U, kind) {
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  const band = (u0, u1, w0, w1) => { const a = P(u0, -w0), b = P(u0, w1), c = P(u1, w1), d = P(u1, -w0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
  const pal = A.pal, s = A.s;
  if (kind === 'rope' || kind === 'shimenawa') {
    const heavy = kind === 'shimenawa', w0 = heavy ? 14.6 : 12.6, w1 = heavy ? 13.6 : 11.8, u1 = heavy ? 0.17 : 0.1;
    if (heavy) {
      // shide: zigzag papers hanging from the rope
      for (const w of [-8, 1, 9]) {
        const a = P(0.02, w);
        celFill(ctx, () => {
          const d = -1, ux = S.ux * d, uy = S.uy * d, nx = S.nx, ny = S.ny, k = 4.2 * U;
          ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + nx * 3 * U, a[1] + ny * 3 * U);
          for (const [x, y] of [[3, 1], [0.6, 1], [3.4, 2], [1, 2], [3.6, 3], [1.4, 3.6], [0, 2.3], [2.4, 2.3], [-0.2, 1.3], [2.2, 1.3], [0, 0.4]]) ctx.lineTo(a[0] + nx * x * U + ux * y * k, a[1] + ny * x * U + uy * y * k);
          ctx.closePath();
        }, ['#3a3548', '#625c78', '#8e88a6'], A, { sd: 1.2 * U, hd: 0.4 * U });
      }
    }
    celFill(ctx, () => band(0.0, u1, w0, w1), HOLLOW_ROPE, A, { sd: 2.2 * U, hd: 0.6 * U, detail: (g) => {
      // the twist of the strands
      g.strokeStyle = HOLLOW_ROPE[0]; g.lineWidth = 1.1 * s; g.beginPath();
      for (let i = 0; i <= 14; i++) { const w = lerp(-w0, w1, i / 14), a = P(0, w - 1.6), b = P(u1, w + 1.6); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      g.stroke();
      g.strokeStyle = HOLLOW_ROPE[2]; g.lineWidth = 0.6 * s; g.beginPath();
      for (let i = 0; i <= 14; i++) { const w = lerp(-w0, w1, i / 14) + 0.8, a = P(u1 * 0.2, w - 1.2), b = P(u1 * 0.8, w + 1.2); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      g.stroke();
    } });
    // the knot at the front with two short ends
    const k = P(u1 * 0.5, w1 - 2.6);
    celFill(ctx, () => { ctx.moveTo(k[0] + 2.4 * U, k[1]); ctx.arc(k[0], k[1], 2.4 * U, 0, TAU); }, HOLLOW_ROPE, A, { sd: 1 * U, hd: 0.5 * U });
    return;
  }
  // a torn obi, its edges frayed violet, one torn end hanging at the front
  const t = P(0.04, 9.5);
  celFill(ctx, () => {
    const dx = -S.ux * 0.7, dy = -S.uy * 0.7 + 0.5, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux, L = 22 * U, w = 2.6 * U;
    ctx.moveTo(t[0] - nx * w, t[1] - ny * w); ctx.lineTo(t[0] + nx * w, t[1] + ny * w);
    ctx.lineTo(t[0] + nx * w * 1.2 + ux * L * 0.86, t[1] + ny * w * 1.2 + uy * L * 0.86); ctx.lineTo(t[0] + nx * w * 0.3 + ux * L * 0.72, t[1] + ny * w * 0.3 + uy * L * 0.72);
    ctx.lineTo(t[0] - nx * w * 0.2 + ux * L, t[1] - ny * w * 0.2 + uy * L); ctx.lineTo(t[0] - nx * w * 1.1 + ux * L * 0.78, t[1] - ny * w * 1.1 + uy * L * 0.78); ctx.closePath();
  }, pal.back, A, { sd: 1.6 * U, rim: true });
  celFill(ctx, () => band(0.0, 0.16, 12.8, 11.8), [ANIME.cloth0, '#120f16', '#26212e'], A, { sd: 3 * U, hd: 0.6 * U, detail: (g) => {
    g.strokeStyle = pal.acc; g.lineWidth = 1 * s; g.setLineDash([4 * U, 1.6 * U, 1.4 * U, 2.4 * U]); g.beginPath();
    for (const u of [0.03, 0.135]) { const a = P(u, -12.8), b = P(u, 11.8); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke(); g.setLineDash([]);
  } });
};

/* ---- the husk's mantle: a ragged hump of cloth over the shoulders ---- */
Fighter.prototype.hollowMantle = function (ctx, S, A, U, kind) {
  // the flicker's hunch: a short shoulder cape bunched high on the back, so it reads stooped
  const pts = kind === 'hunch' ? _hsp(S, U, [[1.16, 2], [1.16, -9], [1.04, -17], [0.84, -18], [0.7, -16, 1], [0.76, -10], [0.62, -9, 1], [0.74, -4], [0.66, -1, 1], [0.82, 2], [0.8, 7, 1], [0.94, 6], [1.04, 7]]) : _hsp(S, U, [[1.14, 3], [1.14, -8], [1.04, -18], [0.84, -22], [0.58, -23, 1], [0.64, -16], [0.48, -17, 1], [0.58, -9], [0.42, -9, 1], [0.56, -2], [0.46, 2, 1], [0.62, 5], [0.56, 10, 1], [0.72, 9], [0.72, 15, 1], [0.88, 12], [1.02, 11]]);
  celFill(ctx, () => orderShape(ctx, 1, pts), A.pal.coat, A, { sd: 6 * U, hd: 1 * U, rim: true, detail: (g) => {
    animeFold(g, A, A.pal.coat, () => {
      for (const [a, b, c] of [[[1.02, -6], [0.8, -10], [0.6, -14]], [[1.0, 2], [0.8, -2], [0.6, -4]], [[0.98, 8], [0.84, 6], [0.66, 8]]]) {
        const p = _hsp(S, U, [a, b, c]); g.moveTo(p[0][0], p[0][1]); g.quadraticCurveTo(p[1][0], p[1][1], p[2][0], p[2][1]);
      }
    });
    const p = _hsp(S, U, [[0.68, -18], [0.66, -6]]);
    g.strokeStyle = A.pal.acc; g.lineWidth = 1.4 * U; g.setLineDash([3 * U, 2 * U]); g.beginPath(); g.moveTo(p[0][0], p[0][1]); g.lineTo(p[1][0], p[1][1]); g.stroke(); g.setLineDash([]);
  } });
};

/* ---- fists: huge bandaged fists with a glowing crack over the knuckles and a loose end trailing ---- */
Fighter.prototype.hollowFist = function (ctx, el, ha, A, U, far) {
  const dx = ha.x - el.x, dy = ha.y - el.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, R = 6.6 * U, ang = Math.atan2(uy, ux);
  const cx = ha.x + ux * R * 0.3, cy = ha.y + uy * R * 0.3;
  if (!far) {
    // the loose end of the binding, trailing back from the wrist
    const t = this.time || 0, w = Math.sin(t * 5) * 2 * U;
    celFill(ctx, () => {
      const bx = ha.x - ux * R * 0.6, by = ha.y - uy * R * 0.6, nx = -uy, ny = ux;
      ctx.moveTo(bx + nx * 1.6 * U, by + ny * 1.6 * U);
      ctx.quadraticCurveTo(bx - ux * 8 * U + nx * (4 * U + w), by - uy * 8 * U + 5 * U, bx - ux * 15 * U + nx * w, by - uy * 15 * U + 9 * U);
      ctx.quadraticCurveTo(bx - ux * 8 * U + nx * (1 * U + w), by - uy * 8 * U + 4 * U, bx - nx * 1.6 * U, by - ny * 1.6 * U);
      ctx.closePath();
    }, HOLLOW_WRAP, A, { sd: 1 * U });
  }
  celFill(ctx, () => { ctx.moveTo(cx + Math.cos(ang) * R * 1.12, cy + Math.sin(ang) * R * 1.12); ctx.ellipse(cx, cy, R * 1.12, R * 0.94, ang, 0, TAU); },
    far ? [HOLLOW_WRAP[0], HOLLOW_WRAP[0], HOLLOW_WRAP[1]] : HOLLOW_WRAP, A, { sd: 2.8 * U, hd: far ? 0 : 0.9 * U, rim: !far, detail: far ? null : (g) => {
      g.save(); g.translate(cx, cy); g.rotate(ang);
      for (const x of [-0.72, -0.3, 0.12, 0.52]) {
        g.strokeStyle = ANIME.outline; g.lineWidth = 1.2 * A.s; g.beginPath(); g.moveTo((x - 0.18) * R, -R); g.lineTo((x + 0.18) * R, R); g.stroke();
        g.strokeStyle = HOLLOW_WRAP[2]; g.lineWidth = 0.7 * A.s; g.beginPath(); g.moveTo((x - 0.1) * R, -R); g.lineTo((x + 0.26) * R, R); g.stroke();
      }
      hollowCrack(g, A, R, [[0.86, -0.5], [0.66, -0.1], [0.82, 0.2], [0.62, 0.58]], 0.8 * A.s);
      g.restore();
    } });
};

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
// a mask fragment: lacquer with a lit edge and the violet rim, eye holes the white eyes shine through, a glowing crack
function _maskPiece(ctx, A, r, pts, crack, holes, far) {
  celFill(ctx, () => orderShape(ctx, r, pts), far ? HOLLOW_MASK_FAR : HOLLOW_MASK, A, { sd: r * 0.2, hd: far ? 0 : r * 0.07, rim: true, detail: (g) => {
    if (holes) _eyeHoles(g, r);
    if (crack) hollowCrack(g, A, r, crack, Math.max(0.6, r * 0.035));
  } });
}
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
