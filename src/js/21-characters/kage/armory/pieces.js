/* ---- the armour's pieces (see _themes.js), drawn in the shadow design's way: flat ink shapes read by the crimson key
   light on their leading edge and the tan back light on their trailing edge, one accent per armour.
     chest  (drawKageArmor, from drawArmor at the torso)   sash | strap | cords | plate | lamellar | mantle | emblem
     sode   (kageArmorSode, from _ksArm over each sleeve)  rags | plate | silver | guard | mantle
     strands (kageArmorStrands, before the scarf's tails)  torn strips streaming beside the two tails
   On the flat passes every piece is the one colour. ---- */

// a tone of the armour that works whether or not KS is swapped in (drawArmor is also called outside the body)
function _kaTone(th, k) { return (th && th.tones[k]) || KS_BASE[k]; }

/* ---- the chest (spine frame: P(u, w), u 0 hip .. 1 neck, w px toward the front) ---- */
function drawKageArmor(ctx, f, look, opt) {
  const th = KAGE_ARMOR[look]; if (!th) return;
  const K = _kaFrame(f, opt), P = _kgP(K), s = K.s, tn = (k) => _kaTone(th, k), acc = th.acc;
  if (mugenArtOn(f, K) && kageShadowOn(f)) return;   // the Mugen Armor's art: its collar is drawn at the neck (mugen.js)
  const rim = { red: 1.2 * s, redCol: tn('rim'), tan: 1.2 * s, tanCol: tn('tan') };
  const part = (pts, base, detail) => _ksPart(ctx, K, () => _kgShape(ctx, pts.map(p => P(p[0], p[1], p[2]))), base, Object.assign({ detail }, rim));
  const glowLine = (g, pts, col, lw, glow) => {
    if (glow) { g.shadowColor = glow; g.shadowBlur = 6 * s; }
    _kgLine(g, pts.map(p => P(p[0], p[1])), col, lw); g.shadowBlur = 0;
  };
  // the plate on the upper chest the gold, crimson and violet armours share
  const PLATE = [[1.0, 4.6], [0.97, 12.6, 1], [0.8, 14.2], [0.54, 12.4], [0.42, 5.4, 1], [0.48, -3.6], [0.84, -5.4]];
  switch (th.chest) {
    case 'sash':
      // Ronin: a rust rag slung from the back of the shoulder to the front of the hip, torn along its edges
      part([[1.0, -11.6], [0.94, -14.2, 1], [0.6, -2], [0.2, 10.6], [0.08, 12.6, 1], [0.12, 6.4], [0.3, 2.6], [0.56, -6.4], [0.8, -10.4]], tn('scarfLo'), (g) => {
        _kgLine(g, [P(0.95, -12.4), P(0.6, -4), P(0.15, 9.6)], tn('scarf'), 2.2 * s);
        _kgLine(g, [P(0.7, -9.4), P(0.66, -6.8)], tn('coatLo'), 1 * s);
        _kgLine(g, [P(0.36, 0.6), P(0.32, 3.4)], tn('coatLo'), 1 * s);
      });
      break;
    case 'strap':
      // Yami: a dark guard over the upper chest, its lower edge glowing violet, and a strap across to the far shoulder
      part([[0.98, 3.6], [0.93, 12.4, 1], [0.72, 13.4], [0.6, 9.6, 1], [0.66, 2.4]], '#120c17', (g) => glowLine(g, [[0.6, 10], [0.67, 2.6]], acc, 1.3 * s, th.glow));
      part([[1.0, -12], [0.92, -13.6, 1], [0.34, 6.4], [0.3, 4.2, 1]], '#0b080e', (g) => glowLine(g, [[0.96, -12.6], [0.32, 5.4]], tn('red'), 0.8 * s, th.glow));
      break;
    case 'cords':
      // Shinsen: the black jacket's front panel, a white collar edge and red cords laced across it
      part([[1.02, 2.4], [0.98, 11.4, 1], [0.8, 13], [0.46, 10.8], [0.4, 2.6, 1]], '#0b090c', (g) => {
        _kgFill(g, [P(1.06, 2), P(1.0, 10.6), P(0.94, 8.4), P(0.98, 1)], tn('coat'));
        for (let i = 0; i < 4; i++) {
          const u = 0.88 - i * 0.12;
          _kgLine(g, [P(u, 3.6), P(u - 0.1, 10.6)], tn('red'), 1.1 * s);
          _kgLine(g, [P(u, 10.6), P(u - 0.1, 3.6)], tn('red'), 1.1 * s);
        }
      });
      break;
    case 'plate': case 'lamellar': case 'emblem': {
      const base = th.chest === 'plate' ? '#16110a' : th.chest === 'lamellar' ? '#170a0b' : '#140c1c';
      part(PLATE, base, (g) => {
        if (th.chest === 'lamellar') {
          // Kagehira: rows of small plates laced crimson
          for (const u of [0.86, 0.74, 0.62, 0.52]) _kgLine(g, [P(u, -6), P(u + 0.03, 15)], tn('red'), 1 * s);
          for (const w of [-1, 4, 9]) _kgLine(g, [P(0.95, w), P(0.46, w + 1)], '#2a0c0e', 0.8 * s);
        } else {
          // Raikō / Mugen: trim inset along the plate's edges, two lames
          glowLine(g, [[0.97, 10.6], [0.8, 12.2], [0.56, 10.6], [0.47, 5]], acc, 1.1 * s, th.glow);
          _kgLine(g, [P(0.7, -4.6), P(0.72, 13.6)], '#000000', 1.2 * s);
          _kgLine(g, [P(0.58, -4.2), P(0.6, 12.6)], '#000000', 1.2 * s);
          const c = P(0.8, 5.4), R = (th.chest === 'emblem' ? 3.6 : 2.4) * s;
          if (th.glow) { g.shadowColor = th.glow; g.shadowBlur = 7 * s; }
          g.strokeStyle = acc; g.lineWidth = (th.chest === 'emblem' ? 1.3 : 1) * s; g.beginPath(); g.arc(c[0], c[1], R, 0, TAU); g.stroke();
          g.fillStyle = acc; g.beginPath(); g.arc(c[0], c[1], R * 0.32, 0, TAU); g.fill();
          g.shadowBlur = 0;
        }
      });
      break;
    }
    case 'mantle':
      // Yūrei: the back of a pale burial mantle over the shoulders, its lower edge in tatters, a blue cord along it
      part([[1.13, -3.6], [1.06, -14.6], [0.84, -18.4], [0.66, -17, 1], [0.7, -13], [0.58, -12.4, 1], [0.66, -8.6], [0.6, -5.4, 1], [0.84, -2.4]], tn('coat'), (g) => {
        _kgLine(g, [P(1.02, -15), P(0.8, -15.6), P(0.72, -12)], tn('red'), 1.1 * s);
        _kgFill(g, [P(1.1, -3), P(0.84, -2), P(0.9, -8)], tn('coatLo'));
      });
      break;
  }
}

/* ---- the shoulder piece over each sleeve (limb frame: at(u, o), u along the upper arm, o toward its outer, upper side) ---- */
function kageArmorSode(f, ctx, K, sh, el, far, ha) {
  const th = K.th; if (!th || !th.sode) return;
  if (mugenArtOn(f, K)) { if (!far && ha) mugenArm(f, ctx, K, sh, el, ha); return; }   // the Mugen Armor's art (mugen.js)
  const s = K.s, U = _kgLimb(sh, el, K.fc), sz = (far ? 0.86 : 1) * (th.sode === 'silver' ? 1.3 : th.sode === 'plate' ? 1.12 : 1);
  const at = (u, o, sharp) => U.at(u, o * s * sz, sharp);
  const lit = { red: (far ? 1 : 1.5) * s, redCol: far ? KS.rimFar : KS.rim, tan: 1 * s, tanCol: KS.tanFar };
  const part = (pts, base, detail) => _ksPart(ctx, K, () => _kgShape(ctx, pts.map(p => at(p[0], p[1], p[2]))), base, Object.assign({ detail: far ? null : detail }, lit));
  const glow = (g, on) => { if (on && th.glow) { g.shadowColor = th.glow; g.shadowBlur = 6 * s; } else g.shadowBlur = 0; };
  const line = (g, pts, col, lw) => _kgLine(g, pts.map(p => at(p[0], p[1])), col, lw * s);
  switch (th.sode) {
    case 'rags':
      part([[-0.34, -2], [-0.26, 10], [0.08, 12.6], [0.42, 11, 1], [0.34, 8], [0.52, 6.4, 1], [0.36, 3.4], [0.46, 0, 1], [0.12, -3]], KS.scarfLo,
        (g) => { line(g, [[-0.2, 9.6], [0.1, 11.4], [0.36, 10]], KS.scarf, 1.8); line(g, [[0.1, 2], [0.3, 4.6]], KS.coatLo, 0.9); });
      break;
    case 'plate':
      part([[-0.3, -1], [-0.26, 10.6], [0.06, 13.2], [0.36, 11.6, 1], [0.3, 3.2], [0.02, -2]], '#120d17', (g) => {
        line(g, [[-0.04, 12.6], [0.3, 10.8]], '#000000', 1.2);
        glow(g, true); line(g, [[0.04, 12.4], [0.34, 10.8], [0.3, 4]], th.acc, 1.1); glow(g, false);
      });
      part([[0.14, 3.6], [0.18, 11.6], [0.48, 10.6, 1], [0.44, 3.4]], '#1a1222', (g) => { glow(g, true); line(g, [[0.2, 11], [0.46, 10]], th.acc, 1); glow(g, false); });
      break;
    case 'silver': {
      // Shinsen: a domed silver shoulder plate over two lames, each overlapping the one below: a bright top edge, a
      // shaded lower half, a dark line where the next plate tucks under
      const lames = [[[0.26, 1], [0.24, 14.4], [0.48, 13.6, 1], [0.47, 1.6]], [[0.07, 0], [0.05, 15.2], [0.32, 15.4, 1], [0.31, 0.8]],
        [[-0.42, -2], [-0.36, 12], [-0.06, 16.6], [0.17, 15.2, 1], [0.13, 1.4], [-0.12, -3]]];
      lames.forEach((pts, i) => part(pts, '#cdc9d4', (g) => {
        const u1 = pts[2][0], u0 = pts[0][0];
        _kgFill(g, [at(lerp(u0, u1, 0.55), -6), at(lerp(u0, u1, 0.55), 20), at(u1 + 0.2, 20), at(u1 + 0.2, -6)], '#8d8797');
        line(g, [[u0 + 0.03, i === 2 ? 2 : 1], [i === 2 ? -0.32 : u0 + 0.02, i === 2 ? 12.4 : 13.6]], '#fbfaff', 1.4);
        line(g, [[u1 - 0.02, 2], [u1 - 0.03, 13.4]], '#4c4654', 1);
      }));
      break;
    }
    case 'guard':
      part([[-0.24, 0], [-0.2, 9.6], [0.1, 11.6], [0.32, 9.6, 1], [0.26, 2], [0, -1.4]], th.chest === 'lamellar' ? '#170a0b' : '#16110a', (g) => {
        glow(g, true); line(g, [[-0.14, 9], [0.1, 10.6], [0.27, 9]], th.acc, 1.1); glow(g, false);
        line(g, [[-0.02, 1], [0.06, 10]], '#000000', 1);
      });
      break;
    case 'mantle':
      // Yūrei: the mantle's front falling over the shoulder and the upper arm, cut into tatters
      part([[-0.4, -4], [-0.32, 11], [0.04, 14.2], [0.42, 13], [0.56, 10.4, 1], [0.44, 7.4], [0.6, 4, 1], [0.42, 1], [0.5, -3, 1], [0.12, -7]], KS.coat, (g) => {
        line(g, [[-0.24, 10.6], [0.1, 13], [0.4, 12]], KS.red, 1.1);
        _kgFill(g, [at(0.2, -8), at(0.2, 6), at(0.7, 6), at(0.7, -8)], KS.coatLo);
      });
      break;
  }
}

/* ---- extra scarf strands: copies of the tails' chains fanned out to either side and fluttering, cut shorter ---- */
function kageArmorStrands(f, ctx, K, th) {
  const s = K.s, t = K.t, ww = th.strandW || 3.4;
  const sw = th.strand2 && th.scarf2 ? [KS.scarf, KS.scarfLo, KS.scarfHi] : null;
  if (sw) { KS.scarf = th.scarf2[0]; KS.scarfLo = th.scarf2[1]; KS.scarfHi = th.scarf2[2]; }
  for (let k = 0; k < th.strands; k++) {
    const c = _ksCloth(f, k % 2 ? 'scarfB' : 'scarfA'); if (!c) continue;
    const m = Math.max(5, c.n - 1 - (k >> 1) * 2), spread = (2.4 + k * 1.5) * s * (k % 2 ? -1 : 1);
    _ksRibbon(f, ctx, K, _kaFan(c, k, m, spread, t, s, K.floor - 2 * s), 1.6, ww, k % 3 === 2);
  }
  if (sw) { KS.scarf = sw[0]; KS.scarfLo = sw[1]; KS.scarfHi = sw[2]; }
}
