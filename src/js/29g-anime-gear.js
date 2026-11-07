/* KAGE — the last shop gear in the anime style (anime redesign, ticket 13).
   Four helmets and four armours only Kage can wear had kept their old primitive overlays (a plain black ball of a hood,
   a bare black triangle, line-drawn antlers, a floating crescent, a stroked torso blob with bands, a single blue string).
   They are redrawn here the way the sub-bosses' gear is (24- / 25-anime-subs-*.js): cel-shaded parts on the head frame
   and the spine frame, near-black cloth and dark metal, one accent per look, a fine red rim, and one flat colour on
   the flat passes (outline, impact frame, flash, afterimages).
     ronin_hood        Kuro Zukin: a black cloth hood wrapping the head to the jaw, an eye slit, a crimson cord round
                       the brow knotted at the back, a drape over the nape and a hood tail
     sage_antlers      Shika Kabuto: a riveted iron bowl, a jade-laced shikoro, a short visor and a pair of branched
                       lacquered antlers with jade tips
     hollow_crest      Utsuro Kabuto: a dark bowl and shikoro under a great hollow crescent swept back off the crown,
                       its inner edge lit violet
     executioner       Shikkō Zukin: a tall peaked hood of black cloth, a crimson-stitched seam up the peak, an eye slit
                       and a cord at the throat with one tail
     lamellar          Kozane-dō: a full dō of small lacquered scales in close rows laced bronze, scale sode, kusazuri
     executioner_garb  Shikkō Garb: a long black leather vest to the hips, a crimson-stitched front, a baldric with
                       iron rings, a high collar
     colossus_plate    Kurogane-dō: heavy riveted iron bands, an ember seam, a tall gorget, great studded sode and
                       iron kusazuri
     storm_mantle      Raiun Mantle: a storm-blue mantle over the shoulders with a lightning-cloud band, a glass clasp,
                       and a long blue streamer
   Drawing only: nothing here moves a joint or touches gameplay. */

const GEAR_ACC = { ronin_hood: '#b02a31', sage_antlers: '#7fd0c8', hollow_crest: '#9b8cff', executioner: '#b02a31',
  lamellar: '#b08a4e', executioner_garb: '#b02a31', colossus_plate: '#d2603c', storm_mantle: '#7fb8ff' };
const GEAR_HOOD = ['#050404', '#0e0c0c', '#231f1e'];        // black hood cloth
const GEAR_HORN = ['#120e0a', '#251d15', '#4a3c2c'];          // lacquered antler horn
const GEAR_STORM = ['#05070b', '#0c1119', '#1d2836'];         // the Raiun Mantle's storm-blue black
function _gearAcc(key) { return subTone(GEAR_ACC[key] || '#b02a31'); }
// the looks this module draws (drawHelmet / drawArmor dispatch here)
const GEAR_HEAD_LOOKS = ['ronin_hood', 'sage_antlers', 'hollow_crest', 'executioner'];
const GEAR_ARMOR_LOOKS = ['lamellar', 'executioner_garb', 'colossus_plate', 'storm_mantle'];

// cloth for the looks (from animeCloths): the hood tails and the mantle's streamer
function gearCloths(f, sk) {
  const s = f.scale;
  if (f.helmet === 'ronin_hood') {
    f.cloths.push({ kind: 'scarf', c: new Cloth(8, 6.8 * s, { ph: 4.1, wind: 900, grav: 760, stiff: 1.8 }), at: 'head', color: GEAR_HOOD[1], rim: 'rgba(120,22,28,0.8)', w: 8 * s, w1: 2.6 * s, dy: 2, dx: 14 });
  }
  if (f.helmet === 'executioner') {
    f.cloths.push({ kind: 'scarf', c: new Cloth(6, 5.4 * s, { ph: 2.7, wind: 520, grav: 1000, stiff: 1.7 }), at: 'head', color: ANIME.crimson, w: 1.8 * s, w1: 1.2 * s, dy: 12, dx: 8 });
  }
  if (f.armor === 'storm_mantle') {
    f.cloths.push({ kind: 'ribbon', c: new Cloth(11, 8 * s, { ph: 4, wind: 1300, grav: 460, stiff: 1.85 }), at: 'neck', color: subTone(GEAR_ACC.storm_mantle)[1], rim: 'rgba(8,12,20,0.85)', w: 4.6 * s, w1: 1.4 * s, dy: 4, dx: 9 });
  }
  void sk;
}

/* ---- heads (head frame: +x the face side, r the head radius) ---- */
function drawGearHead(ctx, key, f, r, ink, flat) {
  const A = f._A && f._A.pal ? f._A : animeState(f, ink, flat, {});
  const sv = _headLight(A, f), acc = _gearAcc(key);
  const fill = (pts, tone, o) => celFill(ctx, () => orderShape(ctx, r, pts), tone, A, o);
  // the eye slit of a hood: the black face showing through, so the white eyes (drawn after) sit in it
  const slit = (y0, y1) => {
    if (A.flat) return;
    ctx.fillStyle = ANIME.face; ctx.beginPath(); orderShape(ctx, r, [[0.06, y0 + 0.04], [0.6, y0], [1.06, y0 + 0.02, 1], [1.08, y1, 1], [0.6, y1 + 0.02], [0.06, y1 - 0.02]]); ctx.fill();
    ctx.strokeStyle = GEAR_HOOD[2]; ctx.lineWidth = r * 0.04; ctx.beginPath(); ctx.moveTo(r * 0.1, r * (y0 + 0.01)); ctx.quadraticCurveTo(r * 0.6, r * (y0 - 0.05), r * 1.04, r * (y0 - 0.03)); ctx.stroke();
  };
  // a lacquered shikoro, its lames laced in the accent
  const shikoro = (tone, lace) => fill([[0.1, -0.52], [-0.88, -0.82], [-1.56, 0.0], [-1.86, 0.74, 1], [-0.92, 0.94], [-0.42, 0.46], [-0.2, -0.2]], tone, { sd: r * 0.26, hd: r * 0.05, rim: true, detail: (g) => {
    for (let i = 1; i <= 3; i++) {
      const k = i / 4;
      g.strokeStyle = lace; g.lineWidth = r * 0.07; g.setLineDash([r * 0.06, r * 0.07]);
      g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.3 + k)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.52 + k), r * (-1.2 - k * 0.6), r * (-0.4 + k * 1.3)); g.stroke();
      g.setLineDash([]);
      g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.06;
      g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.4 + k)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.62 + k), r * (-1.2 - k * 0.6), r * (-0.5 + k * 1.3)); g.stroke();
    }
  } });
  // a riveted kabuto bowl with a band at the brow in the accent
  const bowl = (tone, band, ribs) => fill([[1.08, -0.34, 1], [0.96, -0.98], [0.2, -1.4], [-0.7, -1.22], [-1.16, -0.4, 1]], tone, { sd: r * 0.3, hd: r * 0.08, rim: true, detail: (g) => {
    g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.045; g.beginPath();
    for (const x of ribs) { g.moveTo(r * 0.1, -r * 1.36); g.quadraticCurveTo(r * x * 1.1, -r * 1.08, r * x * 1.24, -r * 0.42); }
    g.stroke();
    g.fillStyle = ANIME.silver; for (const x of ribs) { g.beginPath(); g.arc(r * x * 1.2, -r * 0.62, r * 0.035, 0, TAU); g.fill(); }
    g.strokeStyle = band; g.lineWidth = r * 0.13; g.beginPath(); g.moveTo(-r * 1.14, -r * 0.48); g.quadraticCurveTo(0, -r * 0.64, r * 1.08, -r * 0.44); g.stroke();
  } });
  switch (key) {
    case 'ronin_hood': {
      // the drape over the nape, then the hood wrapping the head to the jaw, the cord round the brow and its knot
      fill([[-0.36, 0.42], [-1.08, 0.34], [-1.56, 1.2, 1], [-1.02, 1.5], [-0.24, 1.36], [0.24, 1.1]], GEAR_HOOD, { sd: r * 0.24, hd: r * 0.04, rim: true, detail: (g) => {
        animeFold(g, A, GEAR_HOOD, () => { g.moveTo(-r * 0.8, r * 0.6); g.quadraticCurveTo(-r * 1.0, r * 1.0, -r * 0.9, r * 1.38); g.moveTo(-r * 0.36, r * 0.74); g.quadraticCurveTo(-r * 0.5, r * 1.1, -r * 0.4, r * 1.32); });
      } });
      fill([[1.0, -0.34, 1], [0.86, -0.86], [0.2, -1.24], [-0.62, -1.16], [-1.16, -0.52], [-1.18, 0.36], [-0.82, 1.02], [-0.1, 1.24], [0.52, 1.12], [0.98, 0.76], [1.06, 0.36, 1]], GEAR_HOOD, { sd: r * 0.3, hd: r * 0.06, rim: true, detail: (g) => {
        animeFold(g, A, GEAR_HOOD, () => {
          g.moveTo(r * 0.3, -r * 1.14); g.quadraticCurveTo(-r * 0.4, -r * 0.9, -r * 0.86, -r * 0.2);
          g.moveTo(-r * 0.3, r * 0.5); g.quadraticCurveTo(-r * 0.2, r * 0.86, -r * 0.5, r * 1.1);
          g.moveTo(r * 0.06, r * 0.74); g.quadraticCurveTo(r * 0.12, r * 0.98, r * 0.02, r * 1.16);   // the face cloth gathered under the jaw (no mouth line)
        });
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.09; g.beginPath(); g.moveTo(r * 0.98, -r * 0.4); g.quadraticCurveTo(0, -r * 0.62, -r * 1.12, -r * 0.4); g.stroke();
        g.strokeStyle = acc[2]; g.lineWidth = r * 0.03; g.beginPath(); g.moveTo(r * 0.96, -r * 0.44); g.quadraticCurveTo(0, -r * 0.66, -r * 1.1, -r * 0.44); g.stroke();
      } });
      slit(-0.24, 0.3);
      fill([[-1.0, -0.56], [-1.36, -0.72, 1], [-1.34, -0.24, 1], [-1.02, -0.3]], acc, { sd: r * 0.06 });
      break;
    }
    case 'sage_antlers': {
      // a riveted iron kabuto with a jade-laced shikoro and a short visor; two branched antlers of lacquered horn rise
      // from its sides (the far one first, one tone darker), each tine tipped in jade
      if (f.isPlayer) drawKageHair(ctx, r * 0.9, ink, flat, f);
      const tine = (pts, w0, w1, tone, o) => celFill(ctx, () => {
        const L = [], R = [];
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], o2 = pts[Math.max(0, i - 1)];
          let dx = q[0] - o2[0], dy = q[1] - o2[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
          const w = lerp(w0, w1, i / (pts.length - 1)) / 2;
          L.push([r * (p[0] - dy * w), r * (p[1] + dx * w)]); R.push([r * (p[0] + dy * w), r * (p[1] - dx * w)]);
        }
        _poly(ctx, L.concat(R.reverse()));
      }, tone, A, o);
      const antler = (ox, oy, tone, far) => {
        const P = (x, y) => [x + ox, y + oy], o = { sd: r * 0.08, hd: far ? 0 : r * 0.03, rim: !far };
        tine([P(0.0, -1.1), P(0.3, -1.72), P(0.18, -2.36), P(0.44, -3.0)], 0.3, 0.08, tone, o);
        tine([P(0.26, -1.66), P(0.74, -1.98), P(0.98, -1.92)], 0.18, 0.06, tone, o);
        tine([P(0.2, -2.3), P(-0.16, -2.7), P(-0.3, -2.98)], 0.16, 0.06, tone, o);
        tine([P(0.36, -2.72), P(0.74, -2.96)], 0.12, 0.05, tone, o);
        if (!A.flat) { ctx.fillStyle = far ? acc[1] : acc[2]; for (const [x, y] of [[0.44, -3.0], [0.98, -1.92], [-0.3, -2.98], [0.74, -2.96]]) { const p = P(x, y); ctx.beginPath(); ctx.arc(r * p[0], r * p[1], r * 0.06, 0, TAU); ctx.fill(); } }
      };
      antler(-0.62, 0.16, A.flat ? GEAR_HORN : ['#0b0806', '#17120d', '#2c241a'], true);
      shikoro(SUB_LACQ, acc[1]);
      bowl(SUB_IRON, acc[0], [-0.7, -0.35, 0.0, 0.35, 0.7]);
      fill([[0.04, -0.5], [0.9, -0.52], [1.46, -0.36, 1], [1.38, -0.22, 1], [0.8, -0.3], [0.04, -0.34]], SUB_LACQ, { sd: r * 0.08, hd: r * 0.04, rim: true });
      antler(0.06, 0, GEAR_HORN, false);
      break;
    }
    case 'hollow_crest': {
      // a dark kabuto and shikoro under a great hollow crescent swept back off the crown; its inner edge glows violet
      if (f.isPlayer) drawKageHair(ctx, r * 0.9, ink, flat, f);
      celFill(ctx, () => {
        ctx.arc(-r * 0.3, -r * 0.2, r * 2.0, Math.PI * 0.8, Math.PI * 1.7);
        ctx.arc(-r * 0.05, -r * 0.35, r * 1.55, Math.PI * 1.68, Math.PI * 0.82, true); ctx.closePath();
      }, SUB_IRON, A, { sd: r * 0.16, hd: r * 0.05, rim: true, detail: (g) => {
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath();
        for (const a of [0.95, 1.15, 1.35, 1.55]) { g.moveTo(-r * 0.3 + Math.cos(Math.PI * a) * r * 2.0, -r * 0.2 + Math.sin(Math.PI * a) * r * 2.0); g.lineTo(-r * 0.05 + Math.cos(Math.PI * a) * r * 1.55, -r * 0.35 + Math.sin(Math.PI * a) * r * 1.55); }
        g.stroke();
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.12; g.beginPath(); g.arc(-r * 0.05, -r * 0.35, r * 1.6, Math.PI * 0.86, Math.PI * 1.66); g.stroke();
      } });
      if (!A.flat) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(155,140,255,0.35)'; ctx.lineWidth = r * 0.16;
        ctx.beginPath(); ctx.arc(-r * 0.05, -r * 0.35, r * 1.5, Math.PI * 0.9, Math.PI * 1.64); ctx.stroke();
        ctx.strokeStyle = acc[2]; ctx.lineWidth = r * 0.035; ctx.beginPath(); ctx.arc(-r * 0.05, -r * 0.35, r * 1.56, Math.PI * 0.9, Math.PI * 1.64); ctx.stroke(); ctx.restore();
      }
      shikoro(SUB_LACQ, acc[0]);
      bowl(SUB_LACQ, acc[0], [-0.6, -0.2, 0.2, 0.6]);
      fill([[0.04, -0.5], [0.86, -0.5], [1.34, -0.34, 1], [1.26, -0.22, 1], [0.76, -0.3], [0.04, -0.34]], SUB_IRON, { sd: r * 0.08, hd: r * 0.04, rim: true, detail: (g) => {
        g.strokeStyle = acc[2]; g.lineWidth = r * 0.03; g.beginPath(); g.moveTo(r * 0.1, -r * 0.36); g.lineTo(r * 1.24, -r * 0.27); g.stroke();
      } });
      break;
    }
    case 'executioner': {
      // a tall peaked hood of black cloth falling to the shoulders, a seam up the peak stitched in crimson, an eye
      // slit, and a cord at the throat
      fill([[-1.2, 1.0], [-1.18, -0.5], [-0.62, -1.7], [-0.22, -2.9, 1], [0.32, -1.62], [1.02, -0.6], [1.12, 0.4, 1], [1.02, 1.0], [0.4, 1.3], [-0.5, 1.28]], GEAR_HOOD, { sd: r * 0.34, hd: r * 0.07, rim: true, detail: (g) => {
        animeFold(g, A, GEAR_HOOD, () => {
          g.moveTo(-r * 0.4, -r * 2.2); g.quadraticCurveTo(-r * 0.86, -r * 1.0, -r * 0.9, r * 0.2);
          g.moveTo(-r * 0.66, r * 0.5); g.quadraticCurveTo(-r * 0.6, r * 0.9, -r * 0.84, r * 1.2);
          g.moveTo(r * 0.0, r * 0.7); g.quadraticCurveTo(r * 0.08, r * 0.96, -r * 0.04, r * 1.2);
        });
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.setLineDash([r * 0.1, r * 0.08]);
        g.beginPath(); g.moveTo(-r * 0.24, -r * 2.8); g.quadraticCurveTo(r * 0.1, -r * 1.6, r * 0.5, -r * 1.24); g.stroke(); g.setLineDash([]);
      } });
      slit(-0.22, 0.28);
      fill([[-0.9, 1.0], [0.9, 0.96], [0.88, 1.12, 1], [-0.9, 1.16, 1]], acc, { sd: r * 0.04 });
      break;
    }
  }
  A.lx = sv[0]; A.ly = sv[1];
}

/* ---- torso overlays (spine frame: P(u, w), u 0 hip .. 1 neck, w across toward the front) ---- */
function drawGearArmor(ctx, f, key) {
  const A = f._A, S = A.S, U = A.U, P = _sP(S, U), acc = _gearAcc(key), coat = animeSkin(f).top === 'coat';
  switch (key) {
    case 'lamellar': {
      // Kozane-dō: rows of small lacquered scales laced bronze, a mune-ita and a gorget
      f.subKusazuri(ctx, A, S, U, 'back', { rows: 5, len: 1.05, panels: 3, acc: acc[1] });
      celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.full, U), SUB_LACQ, A, { sd: 7 * U, hd: 1 * U, rim: true, detail: (g) => {
        const Q = (k, tt) => P(lerp(0.06, 0.76, 1 - tt), lerp(-16, 16, k));
        _lace(g, A, Q, 7, 14, SUB_LACQ, 0.9 * U, acc[1]);
        // the scale heads: a lit dot at the top of every other scale
        g.fillStyle = SUB_LACQ[2];
        for (let i = 0; i < 7; i++) for (let j = 0; j < 14; j += 2) { const p = Q((j + 1) / 14, i / 7 + 0.01); g.fillRect(p[0] - 0.6 * U, p[1] - 0.6 * U, 1.2 * U, 1.2 * U); }
        _strokePts(g, [P(0.8, -17), P(0.8, 17)], ANIME.outline, 1.4 * U);
        _strokePts(g, [P(0.93, -6), P(0.9, 12)], SUB_LACQ[2], 1.1 * U);
      } });
      celFill(ctx, () => animeTorso(ctx, S, { front: [[0.88, 9.6], [1.0, 10.2], [1.06, 5]], back: [[1.06, -6.6], [1.0, -11.6], [0.88, -11.6]] }, U), SUB_LACQ, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => _strokePts(g, [P(0.95, -12), P(0.95, 11)], acc[1], 1.1 * U) });
      break;
    }
    case 'executioner_garb': {
      // Shikkō Garb: a long black leather vest to the hips, closed down the front with crimson stitching, a baldric
      // across the chest hung with iron rings, and a high collar
      const prof = { front: [[-0.2, 13.6], [0.1, 12.6], [0.4, 12.6], [0.66, 14], [0.84, 14.6], [0.94, 12.4], [1.0, 6.4]], back: [[1.0, -7.2], [0.94, -14], [0.76, -14.8], [0.5, -12.8], [0.2, -12.8], [-0.2, -14]] };
      celFill(ctx, () => animeTorso(ctx, S, prof, U), LEATHER, A, { sd: 6.6 * U, hd: 1 * U, rim: true, detail: (g) => {
        // the front closure and its stitching
        _strokePts(g, [P(0.98, 6), P(0.5, 9.6), P(-0.2, 10.6)], ANIME.outline, 1.4 * U);
        g.setLineDash([1.6 * U, 1.4 * U]); _strokePts(g, [P(0.96, 4.4), P(0.5, 8), P(-0.18, 9)], acc[1], 0.8 * U); g.setLineDash([]);
        // panel seams at the sides
        animeFold(g, A, LEATHER, () => { const a = P(0.9, -10), b = P(-0.16, -9); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); const c = P(0.3, 3), d = P(-0.18, 4); g.moveTo(c[0], c[1]); g.lineTo(d[0], d[1]); });
        // the baldric: from the far shoulder to the near hip, iron rings on it
        celFill(g, () => _poly(g, [P(1.0, -12), P(0.92, -14.4), P(0.06, 12.4), P(0.16, 14)]), ['#070605', '#110d0a', '#2a221b'], A, { sd: 1 * U, hd: 0.5 * U });
        for (const k of [0.3, 0.55, 0.8]) {
          const p = [lerp(P(0.96, -13)[0], P(0.11, 13.2)[0], k), lerp(P(0.96, -13)[1], P(0.11, 13.2)[1], k)];
          g.strokeStyle = ANIME.outline; g.lineWidth = 2.2 * U; g.beginPath(); g.arc(p[0], p[1], 2.1 * U, 0, TAU); g.stroke();
          g.strokeStyle = SUB_IRON[2]; g.lineWidth = 1 * U; g.beginPath(); g.arc(p[0], p[1], 2.1 * U, 0, TAU); g.stroke();
        }
      } });
      celFill(ctx, () => animeTorso(ctx, S, { front: [[0.9, 9], [1.02, 9.6], [1.12, 5]], back: [[1.12, -7], [1.02, -12], [0.9, -12]] }, U), LEATHER, A, { sd: 2.4 * U, hd: 0.8 * U, rim: true, detail: (g) => {
        g.setLineDash([1.4 * U, 1.2 * U]); _strokePts(g, [P(0.94, -11), P(0.95, 8.6)], acc[1], 0.7 * U); g.setLineDash([]);
      } });
      void coat;
      break;
    }
    case 'colossus_plate': {
      // Kurogane-dō: heavy iron bands riveted in silver, an ember seam between them, a tall gorget, iron kusazuri
      f.subKusazuri(ctx, A, S, U, 'back', { rows: 3, len: 1.2, panels: 3, acc: acc[0], iron: true, wide: 1.2 });
      celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.heavy, U), SUB_IRON, A, { sd: 7.4 * U, hd: 1.2 * U, rim: true, detail: (g) => {
        for (const u of [0.22, 0.42, 0.62, 0.8]) {
          _strokePts(g, [P(u - 0.012, -18), P(u - 0.012, 18)], SUB_IRON[2], 0.9 * A.s);
          _strokePts(g, [P(u, -18), P(u, 18)], ANIME.outline, 1.5 * A.s);
          _strokePts(g, [P(u + 0.014, -18), P(u + 0.014, 18)], acc[0], 0.9 * U);
          for (let w = -13; w <= 14; w += 5.4) { const p = P(u - 0.045, w); g.fillStyle = ANIME.silver; g.beginPath(); g.arc(p[0], p[1], 0.75 * U, 0, TAU); g.fill(); }
        }
        _strokePts(g, [P(0.94, -6), P(0.9, 13)], SUB_IRON[2], 1.2 * U);
      } });
      celFill(ctx, () => animeTorso(ctx, S, { front: [[0.86, 10.4], [1.0, 11], [1.1, 5.6]], back: [[1.1, -7.6], [1.0, -13], [0.86, -13]] }, U), SUB_IRON, A, { sd: 2.8 * U, hd: 0.9 * U, rim: true, detail: (g) => {
        _strokePts(g, [P(0.96, -13), P(0.96, 11)], acc[0], 1.3 * U);
        for (const w of [-9, -3, 3, 9]) { const p = P(1.02, w); g.fillStyle = ANIME.silver; g.beginPath(); g.arc(p[0], p[1], 0.7 * U, 0, TAU); g.fill(); }
      } });
      break;
    }
    case 'storm_mantle': {
      // Raiun Mantle: a storm-blue mantle over the shoulders to mid-chest, a lightning-cloud band along its hem, a glass
      // clasp at the throat (its streamer is cloth: gearCloths)
      const T = [[1.08, -6.4], [1.06, 7.4], [0.92, 13.4], [0.7, 15]], hem = [];
      const K = 8; for (let i = 0; i <= K; i++) { const k = i / K; hem.push([lerp(0.7, 0.62, k) - (i % 2 ? 0.05 : 0), lerp(15, -17.6, k)]); }
      const pts = T.concat(hem, [[0.88, -17.2], [1.02, -13.4]]).map(([u, w]) => P(u, w));
      celFill(ctx, () => _poly(ctx, pts), GEAR_STORM, A, { sd: 4.2 * U, hd: 0.9 * U, rim: true, detail: (g) => {
        _strokePts(g, [P(0.78, -17), P(0.8, 14)], acc[0], 2.4 * U);
        for (let i = 0; i < 4; i++) { const c = P(0.79, -13 + i * 8); cloudMotif(g, c[0], c[1], 2.6 * U, Math.atan2(S.dy, S.dx) + Math.PI / 2, acc[1], 0.9 * U); }
        _bolt(g, [P(0.98, -11), P(0.9, -8), P(0.94, -5.6), P(0.84, -2)], 0.6 * U, acc[2]);
        _strokePts(g, [P(0.96, -13.4), P(0.95, 8.4)], ANIME.outline, 1 * A.s);
      } });
      if (!A.flat) {
        const c = P(1.0, 8.4);
        ctx.fillStyle = ANIME.outline; ctx.beginPath(); ctx.arc(c[0], c[1], 3 * U, 0, TAU); ctx.fill();
        ctx.fillStyle = acc[1]; ctx.beginPath(); ctx.arc(c[0], c[1], 2.2 * U, 0, TAU); ctx.fill();
        ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(c[0] - 0.6 * U, c[1] - 0.6 * U, 0.8 * U, 0, TAU); ctx.fill();
      }
      break;
    }
  }
}

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
