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
    case 'raijin_kabuto': {
      // Raikon's Raijin Kabuto as gear (Raikon's own jingasa is bosses/raikon/): an angular faceted bowl, a peak
      // jutting over the brow, a stepped neck guard swept back, a short red lightning crest; dark iron, cel-shaded
      const red = subTone('#d24a3c');
      fill([[-0.4, -0.55, 1], [-1.7, -0.05, 1], [-1.55, 0.28, 1], [-1.95, 0.42, 1], [-1.75, 0.72, 1], [-0.85, 0.78, 1], [-0.3, 0.15, 1]], SUB_IRON, { sd: r * 0.2, hd: r * 0.05, rim: true, detail: (g) => {
        g.strokeStyle = red[1]; g.lineWidth = Math.max(1, r * 0.08); g.beginPath(); g.moveTo(-r * 1.62, r * 0.3); g.lineTo(-r * 0.62, r * 0.28); g.stroke();   // the neck guard's step
      } });
      fill([[-1.15, -0.1, 1], [-0.98, -0.92, 1], [-0.3, -1.34, 1], [0.5, -1.24, 1], [1.1, -0.66, 1], [1.2, -0.18, 1]], SUB_IRON, { sd: r * 0.28, hd: r * 0.07, rim: true, detail: (g) => {
        g.strokeStyle = red[1]; g.lineWidth = Math.max(1, r * 0.08); g.lineJoin = 'miter'; g.beginPath(); g.moveTo(-r * 0.98, -r * 0.92); g.lineTo(r * 1.1, -r * 0.66); g.stroke(); g.lineJoin = 'round';   // the facet ridge
      } });
      fill([[0.1, -0.42, 1], [1.62, -0.34, 1], [1.15, -0.08, 1], [0.1, -0.1, 1]], SUB_IRON, { sd: r * 0.08, hd: r * 0.04, rim: true });
      fill([[0.12, -1.24, 1], [0.5, -1.86, 1], [0.36, -1.78, 1], [0.82, -2.36, 1], [0.62, -1.62, 1], [0.8, -1.68, 1], [0.56, -1.2, 1]], red, { sd: r * 0.08, hd: r * 0.04 });
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
