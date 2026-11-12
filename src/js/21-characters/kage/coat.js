Fighter.prototype.drawCoatPanel = function (ctx, part, A, skin, U) {
  const cl = this.cloths.find(c => c.kind === 'coat' && c.part === part);
  if (!cl || !cl.c.init) return;
  const back = part === 'back', co = skin.coat;
  const n = coatEdges(cl, (back ? co.w0 : co.fw0) * U, (back ? co.w1 : co.fw1) * U, this.y + 2 * A.s);
  const pal = A.pal, f = this.facing;
  const accRGB = _hexRGB(pal.acc) || [185, 28, 36];
  const hiRGB = _hexRGB(pal.accHi) || [245, 75, 75];

  // Downward unit vector along the lower cloth segments
  const lx = _cpL[(n - 1) * 2], ly = _cpL[(n - 1) * 2 + 1];
  const rx = _cpR[(n - 1) * 2], ry = _cpR[(n - 1) * 2 + 1];
  const ux = lx - _cpL[(n - 2) * 2], uy = ly - _cpL[(n - 2) * 2 + 1];
  const ul = Math.hypot(ux, uy) || 1;
  const ox = ux / ul, oy = uy / ul; // Down-panel vector
  const px = -oy, py = ox;          // Cross-panel vector

  // Jagged / shredded Kage hem teeth profile: [t across width, depth offset in U]
  const teeth = back
    ? [
        [0.00, 1.5], [0.12, -4.5], [0.24, 3.2], [0.38, -5.8],
        [0.50, 2.0], [0.64, -6.2], [0.78, 3.5], [0.90, -4.0], [1.00, 1.8]
      ]
    : [
        [0.00, 1.2], [0.18, -4.2], [0.36, 2.8], [0.55, -5.5],
        [0.74, 2.5], [0.88, -3.8], [1.00, 1.5]
      ];

  const getHemPt = (t, depthU, liftRows = 0) => {
    const row = Math.max(0, (n - 1) - liftRows);
    const r0 = Math.floor(row), rk = row - r0, r1 = Math.min(n - 1, r0 + 1);
    const bx = lerp(lerp(_cpL[r0 * 2], _cpR[r0 * 2], t), lerp(_cpL[r1 * 2], _cpR[r1 * 2], t), rk);
    const by = lerp(lerp(_cpL[r0 * 2 + 1], _cpR[r0 * 2 + 1], t), lerp(_cpL[r1 * 2 + 1], _cpR[r1 * 2 + 1], t), rk);
    return [bx + ox * depthU * U, by + oy * depthU * U];
  };

  // Custom shredded silhouette path replacing flat coatPanelPath
  const kageCoatPath = (g) => {
    g.beginPath();
    g.moveTo(_cpL[0], _cpL[1]);
    for (let i = 1; i < n; i++) {
      // Slight flair notches on outer lower edges
      const flair = i >= n - 2 ? (i === n - 2 ? -1.4 : 0.8) * U : 0;
      g.lineTo(_cpL[i * 2] - px * flair, _cpL[i * 2 + 1] - py * flair);
    }
    for (let ti = 0; ti < teeth.length; ti++) {
      const [t, d] = teeth[ti];
      const [hx, hy] = getHemPt(t, d);
      g.lineTo(hx, hy);
    }
    for (let i = n - 1; i >= 0; i--) {
      const flair = i >= n - 2 ? (i === n - 2 ? -1.4 : 0.8) * U : 0;
      g.lineTo(_cpR[i * 2] + px * flair, _cpR[i * 2 + 1] + py * flair);
    }
    g.closePath();
  };

  // Helper: 4-pointed Kage diamond emblem
  const drawKageEmblem = (g, cx, cy, rad, rotAngle, color, hiColor) => {
    g.save();
    g.translate(cx, cy);
    g.rotate(rotAngle);
    g.strokeStyle = color;
    g.fillStyle = hiColor;
    g.lineWidth = 0.85 * U;
    g.beginPath();
    for (let k = 0; k < 4; k++) {
      const a = k * (Math.PI / 2);
      const ma = a + Math.PI / 4;
      const rOuter = (k % 2 === 0 ? 1.15 : 0.95) * rad;
      const rInner = 0.28 * rad;
      if (k === 0) g.moveTo(Math.cos(a) * rOuter, Math.sin(a) * rOuter);
      else g.lineTo(Math.cos(a) * rOuter, Math.sin(a) * rOuter);
      g.lineTo(Math.cos(ma) * rInner, Math.sin(ma) * rInner);
    }
    g.closePath();
    g.stroke();
    // Inner core diamond
    g.beginPath();
    g.arc(0, 0, 0.16 * rad, 0, Math.PI * 2);
    g.fill();
    g.restore();
  };

  celFill(ctx, () => kageCoatPath(ctx), back ? pal.coatB : pal.coat, A, {
    sd: (back ? 7.5 : 5.5) * U,
    hd: back ? 0.2 * U : 1.1 * U,
    rim: true,
    detail: (g) => {
      // 1. Deep crimson ombre gradient & flame tips at the shredded bottom hem
      const hemStartIdx = Math.max(1, n - 3);
      const gx0 = lerp(_cpL[hemStartIdx * 2], _cpR[hemStartIdx * 2], 0.5);
      const gy0 = lerp(_cpL[hemStartIdx * 2 + 1], _cpR[hemStartIdx * 2 + 1], 0.5);
      const gx1 = lerp(lx, rx, 0.5) + ox * 5 * U;
      const gy1 = lerp(ly, ry, 0.5) + oy * 5 * U;

      const grad = g.createLinearGradient(gx0, gy0, gx1, gy1);
      grad.addColorStop(0, `rgba(${accRGB.join(',')}, 0)`);
      grad.addColorStop(0.45, `rgba(${accRGB.join(',')}, 0.55)`);
      grad.addColorStop(0.85, `rgba(${accRGB.join(',')}, 0.92)`);
      grad.addColorStop(1, `rgba(${hiRGB.join(',')}, 0.98)`);

      g.fillStyle = grad;
      g.beginPath();
      const [fl0x, fl0y] = getHemPt(0, 0, 1.85);
      g.moveTo(fl0x, fl0y);
      for (let ti = 0; ti < teeth.length; ti++) {
        const [t, d] = teeth[ti];
        const [uxPt, uyPt] = getHemPt(t, d * 0.45, 1.55 + (ti % 2) * 0.45);
        g.lineTo(uxPt, uyPt);
      }
      for (let ti = teeth.length - 1; ti >= 0; ti--) {
        const [t, d] = teeth[ti];
        const [hx, hy] = getHemPt(t, d + 1.5);
        g.lineTo(hx, hy);
      }
      g.closePath();
      g.fill();

      // 2. Glowing crimson lining along the leading/open edges
      const front = (_cpL[0] - _cpR[0]) * f > 0 ? _cpL : _cpR;
      const rear = front === _cpL ? _cpR : _cpL;
      g.lineCap = 'round';
      g.lineJoin = 'miter';
      for (let i = 1; i < n - 1; i++) {
        const k = (i - 1) / Math.max(1, n - 2);
        const alpha = 0.45 + 0.55 * k;
        g.strokeStyle = `rgba(${accRGB.join(',')},${alpha})`;
        g.lineWidth = (1.5 + 0.9 * k) * U;
        g.beginPath();
        g.moveTo(front[i * 2], front[i * 2 + 1]);
        g.lineTo(front[(i + 1) * 2], front[(i + 1) * 2 + 1]);
        g.stroke();

        // Subtle secondary trim on opposite edge
        g.strokeStyle = `rgba(${accRGB.join(',')},${alpha * 0.55})`;
        g.lineWidth = (0.9 + 0.4 * k) * U;
        g.beginPath();
        g.moveTo(rear[i * 2], rear[i * 2 + 1]);
        g.lineTo(rear[(i + 1) * 2], rear[(i + 1) * 2 + 1]);
        g.stroke();
      }

      // 3. Sharp pleats & layered cloth folds running down the panel
      const foldCount = back ? 4 : 3;
      for (let fi = 0; fi < foldCount; fi++) {
        const t = (fi + 1) / (foldCount + 1);
        const w = fi === Math.floor(foldCount / 2) ? 1.35 : 0.85;
        g.strokeStyle = back ? ANIME.cloth0 : pal.coat[0];
        g.lineWidth = w * A.s;
        g.beginPath();
        for (let i = 1; i < n; i++) {
          const wave = Math.sin(i * 1.15 + t * 4.5 + fi * 1.4) * 0.045;
          const x = lerp(_cpL[i * 2], _cpR[i * 2], t + wave);
          const y = lerp(_cpL[i * 2 + 1], _cpR[i * 2 + 1], t);
          i === 1 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.stroke();
      }

      if (!co.embroider) return;

      // 4. Jagged double-border crimson bands following the shredded hem teeth
      g.strokeStyle = pal.accHi || `rgb(${hiRGB.join(',')})`;
      g.lineWidth = 1.35 * U;
      g.beginPath();
      for (let ti = 0; ti < teeth.length; ti++) {
        const [t, d] = teeth[ti];
        const [hx, hy] = getHemPt(t, d - 0.8);
        ti === 0 ? g.moveTo(hx, hy) : g.lineTo(hx, hy);
      }
      g.stroke();

      // Inner parallel jagged accent line
      g.strokeStyle = pal.acc;
      g.lineWidth = 0.8 * U;
      g.beginPath();
      for (let ti = 0; ti < teeth.length; ti++) {
        const [t, d] = teeth[ti];
        const [hx, hy] = getHemPt(t, d * 0.55, 0.7);
        ti === 0 ? g.moveTo(hx, hy) : g.lineTo(hx, hy);
      }
      g.stroke();

      // 5. Swirling flame/cloud & wave embroidery above the jagged border
      const rot = Math.atan2(ry - ly, rx - lx);
      const mot = back
        ? [[n - 2.2, 0.25, 4.4], [n - 1.9, 0.72, 4.2], [n - 3.0, 0.50, 3.6], [n - 1.5, 0.45, 3.2]]
        : [[n - 2.1, 0.42, 3.8], [n - 1.5, 0.76, 3.0]];
      for (const [i, t, R] of mot) {
        const i0 = Math.floor(i), k = i - i0, i1 = Math.min(n - 1, i0 + 1);
        const x = lerp(lerp(_cpL[i0 * 2], _cpR[i0 * 2], t), lerp(_cpL[i1 * 2], _cpR[i1 * 2], t), k);
        const y = lerp(lerp(_cpL[i0 * 2 + 1], _cpR[i0 * 2 + 1], t), lerp(_cpL[i1 * 2 + 1], _cpR[i1 * 2 + 1], t), k);
        cloudMotif(g, x, y, R * U, rot + (t > 0.5 ? 0.35 : -0.25), pal.accHi || pal.acc, 1.3 * U);
      }

      const wmot = back
        ? [[n - 2.5, 0.5, 3.4], [n - 1.6, 0.22, 2.8], [n - 1.6, 0.82, 2.8]]
        : [[n - 2.4, 0.35, 2.9], [n - 1.7, 0.65, 2.5]];
      for (const [i, t, w] of wmot) {
        const i0 = Math.floor(i), k = i - i0, i1 = Math.min(n - 1, i0 + 1);
        const x = lerp(lerp(_cpL[i0 * 2], _cpR[i0 * 2], t), lerp(_cpL[i1 * 2], _cpR[i1 * 2], t), k);
        const y = lerp(lerp(_cpL[i0 * 2 + 1], _cpR[i0 * 2 + 1], t), lerp(_cpL[i1 * 2 + 1], _cpR[i1 * 2 + 1], t), k);
        waveMotif(g, x, y, w * U, rot + 0.08, pal.acc, 1.05 * U);
      }

      // 6. Upper pleated waist tasset overlay (dark pleated fan at top of coat)
      const pRows = Math.min(n - 1, 2);
      if (pRows >= 1) {
        const pCount = back ? 5 : 4;
        g.fillStyle = back ? ANIME.cloth0 : pal.coat[0];
        g.strokeStyle = pal.acc;
        g.lineWidth = 0.75 * U;
        for (let pi = 0; pi < pCount; pi++) {
          const t0 = pi / pCount, t1 = (pi + 1) / pCount;
          const x0 = lerp(_cpL[0], _cpR[0], t0), y0 = lerp(_cpL[1], _cpR[1], t0);
          const x1 = lerp(_cpL[0], _cpR[0], t1), y1 = lerp(_cpL[1], _cpR[1], t1);
          const bx1 = lerp(_cpL[pRows * 2], _cpR[pRows * 2], t1) - ox * 1.2 * U;
          const by1 = lerp(_cpL[pRows * 2 + 1], _cpR[pRows * 2 + 1], t1) - oy * 1.2 * U;
          const bx0 = lerp(_cpL[pRows * 2], _cpR[pRows * 2], t0) - ox * 0.4 * U;
          const by0 = lerp(_cpL[pRows * 2 + 1], _cpR[pRows * 2 + 1], t0) - oy * 0.4 * U;

          g.beginPath();
          g.moveTo(x0, y0);
          g.lineTo(x1, y1);
          g.lineTo(bx1, by1);
          g.lineTo(bx0, by0);
          g.closePath();
          g.fill();
          g.beginPath();
          g.moveTo(bx0, by0);
          g.lineTo(bx1, by1);
          g.stroke();
        }
      }

      // 7. Kage 4-Pointed Star Emblem on outer mid-panel
      const emRow = Math.min(n - 1, Math.max(1, n - 2.6));
      const emI0 = Math.floor(emRow), emK = emRow - emI0, emI1 = Math.min(n - 1, emI0 + 1);
      const emT = back ? 0.3 : 0.5;
      const emX = lerp(lerp(_cpL[emI0 * 2], _cpR[emI0 * 2], emT), lerp(_cpL[emI1 * 2], _cpR[emI1 * 2], emT), emK);
      const emY = lerp(lerp(_cpL[emI0 * 2 + 1], _cpR[emI0 * 2 + 1], emT), lerp(_cpL[emI1 * 2 + 1], _cpR[emI1 * 2 + 1], emT), emK);
      drawKageEmblem(g, emX, emY, 2.4 * U, rot + Math.PI / 4, '#d8dce6', pal.acc);
    }
  });

  // 8. Front Panel Overlays: Hanging Red Belt Strap with Silver Buckle + Braided Knot Tassel
  if (!back && n >= 3) {
    ctx.save();
    // The flat pass (hit flash, silhouette) paints every overlay in its one colour
    const fc = (col) => (A.flat ? A.col : col);
    // Hanging red strap along the center-front of the front panel
    const strapRow = Math.min(n - 1, Math.max(2, Math.floor(n * 0.62)));
    const sx0 = lerp(_cpL[0], _cpR[0], 0.42);
    const sy0 = lerp(_cpL[1], _cpR[1], 0.42);
    const sx1 = lerp(_cpL[strapRow * 2], _cpR[strapRow * 2], 0.38);
    const sy1 = lerp(_cpL[strapRow * 2 + 1], _cpR[strapRow * 2 + 1], 0.38);
    const sAngle = Math.atan2(sy1 - sy0, sx1 - sx0);

    // Dark strap backing
    ctx.lineCap = 'butt';
    ctx.strokeStyle = fc(ANIME.cloth0 || '#141418');
    ctx.lineWidth = 3.2 * U;
    ctx.beginPath();
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(sx1, sy1);
    ctx.stroke();

    // Inner crimson strap fill
    ctx.strokeStyle = fc(pal.acc);
    ctx.lineWidth = 2.1 * U;
    ctx.beginPath();
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(sx1, sy1);
    ctx.stroke();

    // Silver rectangular buckle [ ] at the end of the strap
    ctx.save();
    ctx.translate(sx1, sy1);
    ctx.rotate(sAngle - Math.PI / 2);
    const bw = 2.8 * U, bh = 2.4 * U;
    ctx.fillStyle = fc('#18181c');
    ctx.strokeStyle = fc('#d4d8e2');
    ctx.lineWidth = 0.85 * U;
    ctx.beginPath();
    ctx.rect(-bw * 0.5, -bh * 0.5, bw, bh);
    ctx.fill();
    ctx.stroke();
    // Buckle prong
    ctx.beginPath();
    ctx.moveTo(0, -bh * 0.5);
    ctx.lineTo(0, bh * 0.15);
    ctx.stroke();
    ctx.restore();

    // Hanging Crimson Chinese Knot & Tassel on the leading hip edge
    const leadEdge = (_cpL[0] - _cpR[0]) * f > 0 ? _cpL : _cpR;
    const tx0 = leadEdge[0], ty0 = leadEdge[1];
    const tx1 = leadEdge[2] + f * 2.2 * U, ty1 = leadEdge[3] + 2.5 * U;
    const tx2 = tx1 + f * 1.4 * U, ty2 = ty1 + 5.2 * U;

    // Cord from waist
    ctx.strokeStyle = fc(pal.acc);
    ctx.lineWidth = 0.85 * U;
    ctx.beginPath();
    ctx.moveTo(tx0, ty0);
    ctx.quadraticCurveTo(tx1, ty0 + 1.5 * U, tx1, ty1);
    ctx.stroke();

    // Decorative braided diamond knot
    drawKageEmblem(ctx, tx1, ty1, 2.1 * U, 0, fc(pal.accHi || '#ff4d4d'), fc('#d4d8e2'));

    // Flowing red tassel brush
    ctx.strokeStyle = fc(pal.acc);
    ctx.lineWidth = 0.7 * U;
    for (let ti = -2; ti <= 2; ti++) {
      ctx.beginPath();
      ctx.moveTo(tx1, ty1 + 1.4 * U);
      ctx.quadraticCurveTo(
        tx1 + ti * 0.45 * U,
        (ty1 + ty2) * 0.5,
        tx2 + ti * 0.75 * U,
        ty2
      );
      ctx.stroke();
    }
    // Silver tassel cap
    ctx.fillStyle = fc('#d4d8e2');
    ctx.beginPath();
    ctx.arc(tx1, ty1 + 1.4 * U, 0.85 * U, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

};