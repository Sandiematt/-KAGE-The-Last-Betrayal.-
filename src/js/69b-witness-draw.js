/* KAGE — The Witness's fight, drawn (69-witness.js runs it). Everything here only reads.

   WitnessArena  the arena per phase, graded over the stage (wasteland: the red sky and orange suns of the reference
                 sheets' phases II-IV): phase I recoloured to the sheet's navy, with its crescent moon; phase III's violet
                 and its distortion; phase IV's magenta. Echo Genesis: the arena going black, the world's glass cracking,
                 the giant Echo System ring and the spectral Kages filling it.
   WitnessDraw   the hazards in the world (blade waves, orbit blades, the floor tiles, the well, the tether, the folds,
                 the frames, the lines, the walls, the anchors, the false tells) as canvas, wherever a baked sheet is not
                 playing; and the screen overlays (the input warnings at the screen edges, the frozen frames, the False
                 Death's fake screen). */

// a radial glow with many stops (every canvas gradient in the game is stepped into flat cel bands, 00-core.js
// flatGradients: a glow needs fine stops or it turns into a flat disc). a = the alpha at the centre.
function wtGlow(g, x, y, r, rgb, a, pow) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  for (let i = 0; i <= 32; i++) { const u = i / 32; gr.addColorStop(u, `rgba(${rgb},${(a * Math.pow(1 - u, pow || 2)).toFixed(3)})`); }
  return gr;
}
const WitnessArena = {
  // after the background and floor, before the fighters: the phase's light over the stage, and the domain behind
  drawBack(ctx, s, toScreen, t) {
    const W = s.wit; if (!W) return;
    const g = W.grade, wI = clamp(1 - g, 0, 1), wIII = clamp(1 - Math.abs(g - 2), 0, 1), wIV = clamp(g - 2, 0, 1);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    // phase I: the sheet's navy (the red sky and suns keep their shapes and values, recoloured blue)
    if (wI > 0.01) {
      ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.92 * wI; ctx.fillStyle = '#26319a'; ctx.fillRect(0, 0, W_ * 1, H);
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.35 * wI; ctx.fillStyle = '#4650a8'; ctx.fillRect(0, 0, W_, H);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = wI; this.moon(ctx, s, t);
    }
    // phase II keeps the red stage, with a cold blue light from the Witness
    if (g > 0.3 && g < 1.7) {
      const k = clamp(1 - Math.abs(g - 1), 0, 1), e = s.enemy, sp = toScreen(e.x, e.y - 160 * e.scale);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1; ctx.fillStyle = wtGlow(ctx, sp.x, sp.y, 460, '50,70,255', 0.2 * k, 2.4); ctx.fillRect(0, 0, W_, H);
    }
    // phase III: violet, the stage distorting
    if (wIII > 0.01) {
      ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.45 * wIII; ctx.fillStyle = '#7a1fd0'; ctx.fillRect(0, 0, W_, H);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      if (!SaveManager.data.settings.reduceFlash && ((t * 7) | 0) % 9 === 0) this.distort(ctx, t, 0.6 * wIII);
    }
    // phase IV: magenta and dark
    if (wIV > 0.01) {
      ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.5 * wIV; ctx.fillStyle = '#a01ee0'; ctx.fillRect(0, 0, W_, H);
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.3 * wIV; ctx.fillStyle = '#5a2a70'; ctx.fillRect(0, 0, W_, H);
    }
    ctx.restore();
    if (W.domain) this.drawDomain(ctx, s, toScreen, t);
  },
  // the crescent moon of the Observer's sheet, high on the left, with a soft halo
  moon(ctx, s, t) {
    const x = 250 - s.cam.x * 0.04, y = 165, r = 64;
    ctx.save();
    ctx.fillStyle = wtGlow(ctx, x, y, r * 2.2, '150,160,255', 0.3, 2.2); ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#a3abf6'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.arc(x + r * 0.42, y - r * 0.18, r * 0.86, 0, TAU, true); ctx.fill('evenodd');
    ctx.restore();
  },
  // a few horizontal bands of the stage slid sideways (the distorted background)
  distort(ctx, t, k) {
    const c = ctx.canvas;
    for (let i = 0; i < 4; i++) {
      const y = ((i * 97 + ((t * 30) | 0) * 53) % (H - 200)), h = 8 + ((i * 41) % 26), dx = ((i % 2) ? 1 : -1) * 14 * k;
      ctx.drawImage(c, 0, y * c.height / H, c.width, h * c.height / H, dx, y, W_, h);
    }
  },
  // Echo Genesis behind the fighters: black, the cracks, the Echo System ring and the spectral Kages
  drawDomain(ctx, s, toScreen, t) {
    const d = s.wit.domain, e = s.enemy, L = WTC.looks[3];
    const c = toScreen(e.x, e.y - 220 * e.scale);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dim = d.state === 'activating' ? d.black : d.state === 'active' ? 0.35 : 0.35 * d.ring;
    if (dim > 0) { ctx.fillStyle = `rgba(4,2,10,${dim})`; ctx.fillRect(0, 0, W_, H); }
    // the giant Echo System behind the Witness: rings of segments turning, the triangle at its heart
    if (d.ring > 0) {
      const R = 300 * Ease.outCubic(d.ring), a = d.ring;
      ctx.translate(c.x, c.y);
      ctx.globalCompositeOperation = 'lighter';
      for (const [r, w, n, dir, col] of [[R, 10, 24, 1, L.body], [R * 0.82, 4, 72, -1, WTC.gold], [R * 0.66, 14, 12, 0.6, L.hot], [R * 0.4, 3, 0, 0, WTC.gold]]) {
        ctx.save(); ctx.rotate(t * 0.25 * dir); ctx.strokeStyle = col; ctx.globalAlpha = 0.55 * a; ctx.lineWidth = w;
        if (n) { const seg = TAU / n; for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(0, 0, r, i * seg, i * seg + seg * 0.72); ctx.stroke(); } }
        else { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); }
        ctx.restore();
      }
      ctx.globalAlpha = 0.6 * a; ctx.strokeStyle = WTC.goldHot; ctx.lineWidth = 3;
      ctx.beginPath(); for (let i = 0; i < 3; i++) { const q = -Math.PI / 2 + i * TAU / 3; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(q) * R * 0.36, Math.sin(q) * R * 0.36); } ctx.closePath(); ctx.stroke();
      // hundreds of spectral Kages: three rings of faint silhouettes facing the centre
      const ghost = this.ghost(s);
      if (ghost) {
        ctx.globalCompositeOperation = 'lighter';
        for (const [rr, n, sc, al] of [[R * 1.25, 48, 0.36, 0.22], [R * 1.6, 64, 0.3, 0.16], [R * 2.0, 88, 0.26, 0.11]]) {
          for (let i = 0; i < n; i++) {
            const q = i / n * TAU + t * 0.05 * (rr > R * 1.5 ? -1 : 1), x = Math.cos(q) * rr, y = Math.sin(q) * rr * 0.55;
            ctx.globalAlpha = al * a * (0.6 + 0.4 * Math.sin(t * 2 + i));
            ctx.drawImage(ghost, x - ghost.width * sc / 2, y - ghost.height * sc / 2, ghost.width * sc, ghost.height * sc);
          }
        }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    // the world's glass cracking out from the Witness
    if (d.crack > 0) {
      ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'round';
      const R = prng(73), n = 14;
      for (let i = 0; i < n; i++) {
        const a0 = i / n * TAU + R() * 0.3, len = (380 + R() * 520) * d.crack;
        let x = c.x, y = c.y;
        ctx.strokeStyle = `rgba(230,220,255,${0.75 * d.crack})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y);
        for (let k = 1; k <= 6; k++) { const a = a0 + (R() - 0.5) * 0.5; x = c.x + Math.cos(a) * len * k / 6; y = c.y + Math.sin(a) * len * k / 6; ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(200,150,255,${0.5 * d.crack})`; ctx.lineWidth = 1;
      for (const r of [90, 170, 260]) { ctx.beginPath(); for (let k = 0; k <= 16; k++) { const a = k / 16 * TAU, rr = r * d.crack * (0.85 + 0.3 * R()); ctx[k ? 'lineTo' : 'moveTo'](c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr); } ctx.stroke(); }
    }
    ctx.restore();
  },
  // Kage's silhouette as one flat ghost, drawn once per session (the domain's spectral Kages)
  ghost(s) {
    const W = s.wit;
    if (W.ghost !== undefined) return W.ghost;
    W.ghost = null;
    try {
      const p = s.player, cv = document.createElement('canvas'); cv.width = 120; cv.height = 220;
      const g = cv.getContext('2d'); if (!g) return null;
      g.translate(60 - p.x, 206 - p.y); p.draw(g, { color: '#8a7cff', shadow: false, noEyes: true });
      W.ghost = cv;
    } catch (e) { W.ghost = null; }
    return W.ghost;
  }
};
const W_ = W;

const WitnessDraw = {
  // world space, before the fighters: the floor, the marks, the well, the anchors, the canvas aura
  behind(ctx, s, t) {
    const W = s.wit; if (!W) return;
    const e = s.enemy, L = WitnessFX.look(e);
    ctx.save();
    // the phase aura, behind the Witness: its baked sheet looped, or the canvas glow while no sheet is ready
    if (e.visible && !e.dissolve) {
      for (const a of W.auras || []) {
        const d = WitnessFX.on(a.name) && VfxSheets.ready(a.name); if (!d) continue;
        const P = d.duration, ph = a.t % P, wq = Math.sin(Math.PI * ph / P) ** 2, al = 0.9 * a.k * e.alpha;
        ctx.save(); ctx.translate(e.x, e.y);
        VfxSheets.drawCell(ctx, a.name, d, VfxSheets.cell(d, ph), e.facing, e.scale * 0.95, al * wq);
        VfxSheets.drawCell(ctx, a.name, d, VfxSheets.cell(d, (ph + P / 2) % P), e.facing, e.scale * 0.95, al * (1 - wq));
        ctx.restore();
      }
      if (!W.aura && e.alive) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const cy = e.y - 130 * e.scale, R = 170 * e.scale * (1 + 0.04 * Math.sin(t * 3));
        ctx.translate(e.x, cy); ctx.scale(0.7, 1);
        ctx.fillStyle = wtGlow(ctx, 0, 0, R, L.glow.join(','), 0.22, 2); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }
    // the corrupted floor: warned tiles flash, rewritten ones are torn glitching strips
    const T = W.tiles;
    if (T) {
      for (const i of T.void) {
        const x = T.L + i * T.w, warn = T.t < T.warn, k = warn ? T.t / T.warn : 1;
        if (warn) {
          const on = ((T.t * 10) | 0) % 2 === 0;
          ctx.fillStyle = `rgba(${L.glow.join(',')},${on ? 0.32 : 0.14})`; ctx.fillRect(x + 4, -8, T.w - 8, 10);
          ctx.strokeStyle = L.hot; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.strokeRect(x + 4, -60 * k, T.w - 8, 60 * k); ctx.setLineDash([]);
          ctx.fillStyle = L.hot; ctx.font = '700 28px KageUI, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', x + T.w / 2, -70);
        } else {
          const R = prng(i * 31 + ((t * 18) | 0));
          ctx.fillStyle = 'rgba(8,2,20,0.85)'; ctx.fillRect(x, -6, T.w, 14);
          ctx.globalCompositeOperation = 'lighter';
          for (let k2 = 0; k2 < 10; k2++) { ctx.fillStyle = R() < 0.5 ? L.body : WTC.cyan; ctx.globalAlpha = 0.5 + 0.5 * R(); ctx.fillRect(x + R() * T.w, -R() * 80, 6 + R() * 28, 3 + R() * 8); }
          ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        }
      }
    }
    // the gravity well (canvas stand-in)
    const g = W.well;
    if (g && (!g.sheet || g.sheet === 1)) {
      const k = Math.min(1, g.t / 0.4), R = 120 * k;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(${L.glow.join(',')},${0.5 - i * 0.12})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(g.x, -100, R * (1 + i * 0.5) * (1 - ((t * 0.8 + i * 0.33) % 1) * 0.5), R * 0.4 * (1 + i * 0.5), 0, 0, TAU); ctx.stroke(); }
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#050010'; ctx.beginPath(); ctx.arc(g.x, -100, 34 * k, 0, TAU); ctx.fill();
    }
    if (g) { ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.2 * Math.sin(t * 8)})`; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.ellipse(g.x, -2, g.core, 10, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    // the domain's anchors (canvas stand-in for their crystals) and their health
    const d = W.domain;
    if (d && d.state === 'active') for (const a of d.anchors) {
      if (a.broken) continue;
      if (!a.sheet) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(184,40,255,${0.5 + 0.3 * a.flash})`; ctx.beginPath(); ctx.moveTo(a.x, -220); ctx.lineTo(a.x + 26, -60); ctx.lineTo(a.x, -6); ctx.lineTo(a.x - 26, -60); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.strokeStyle = WTC.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(a.x, -110, 70, 18, 0, 0, TAU); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      if (a.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,255,255,${0.4 * a.flash})`; ctx.beginPath(); ctx.ellipse(a.x, -110, 40, 120, 0, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      const k = a.hp / a.maxHp;
      ctx.fillStyle = 'rgba(6,4,14,0.8)'; ctx.fillRect(a.x - 40, -262, 80, 7);
      ctx.fillStyle = WTC.gold; ctx.fillRect(a.x - 39, -261, 78 * k, 5);
    }
    // marks on the floor: Echo Step's fold, the frame, the false tells, the wall, the lines' tells
    for (const h of W.haz) {
      if (h.kind === 'fold' && h.life > 0) {
        const k = Math.min(1, h.t / 0.25), hh = 230 * k;
        ctx.globalCompositeOperation = 'lighter';
        const gr = ctx.createLinearGradient(h.x - 16, 0, h.x + 16, 0); gr.addColorStop(0, 'rgba(90,110,255,0)'); gr.addColorStop(0.5, `rgba(200,210,255,${0.7 * k})`); gr.addColorStop(1, 'rgba(90,110,255,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(h.x, -hh / 2, 12 + 4 * Math.sin(t * 20), hh / 2, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = L.hot; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(h.x, -2, 46 * k, 8, 0, 0, TAU); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      } else if (h.kind === 'frame' && !h.cut) {
        const k = clamp(h.t / h.delay, 0, 1), x0 = h.x - h.w / 2, x1 = h.x + h.w / 2, top = -520, c = 40;
        ctx.strokeStyle = `rgba(255,255,255,${0.5 + 0.5 * k})`; ctx.lineWidth = 2 + 3 * k;
        ctx.beginPath();
        for (const [x, y, dx, dy] of [[x0, top, 1, 1], [x1, top, -1, 1], [x0, 0, 1, -1], [x1, 0, -1, -1]]) { ctx.moveTo(x + dx * c, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * c); }
        ctx.stroke();
        ctx.fillStyle = `rgba(${L.glow.join(',')},${0.08 + 0.18 * k})`; ctx.fillRect(x0, top, h.w, -top);
      } else if (h.kind === 'fake') {
        const a = Math.min(1, h.t / 0.2) * (1 - Math.max(0, (h.t - h.life + 0.3) / 0.3)), on = ((h.t * 12) | 0) % 3 !== 0;
        if (on) { ctx.strokeStyle = `rgba(${L.glow.join(',')},${0.7 * a})`; ctx.lineWidth = 2; ctx.setLineDash([4, 10]); ctx.beginPath(); ctx.ellipse(h.x, -2, h.w / 2, 10, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
      } else if (h.kind === 'wall') {
        const k = Math.min(1, h.t / 0.4), x0 = h.x - h.w / 2;
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 7; i++) { const x = x0 + (i + 0.5) * h.w / 7, hh = (180 + 100 * ((i * 37) % 5) / 5) * k; ctx.fillStyle = i % 2 ? L.body : WTC.gold; ctx.beginPath(); ctx.moveTo(x - 8, 0); ctx.lineTo(x, -hh); ctx.lineTo(x + 8, 0); ctx.closePath(); ctx.fill(); }
        ctx.globalCompositeOperation = 'source-over';
      } else if (h.kind === 'line' && !h.cut) {
        const k = clamp(h.t / h.delay, 0, 1), dx = Math.cos(h.a), dy = Math.sin(h.a);
        ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.6 * k})`; ctx.lineWidth = 1 + 5 * k * k; ctx.setLineDash(k > 0.8 ? [] : [12, 8]);
        ctx.beginPath(); ctx.moveTo(h.x0, h.y0); ctx.lineTo(h.x0 + dx * h.len, h.y0 + dy * h.len); ctx.stroke(); ctx.setLineDash([]);
        // the afterimage at its start and its number
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(${L.glow.join(',')},${0.35 + 0.4 * k})`;
        ctx.beginPath(); ctx.ellipse(h.x0, h.y0, 22, 60, 0, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = h.unb ? '#ff6a8a' : WTC.goldHot; ctx.font = '700 30px KageUI, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(h.n), h.x0, h.y0 - 70);
      } else if (h.kind === 'judgment' && !h.cut) {
        const k = clamp(h.t / h.delay, 0, 1), on = k > 0.6 ? ((h.t * 20) | 0) % 2 === 0 : ((h.t * 6) | 0) % 2 === 0;
        if (on) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,220,160,${0.2 + 0.6 * k})`; ctx.lineWidth = 1 + 3 * k; ctx.beginPath(); ctx.moveTo(s.bounds.l - 200, -150); ctx.lineTo(s.bounds.r + 200, -150); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
      }
    }
    ctx.restore();
  },
  // world space, after the fighters: what flies and what binds (canvas wherever no sheet plays)
  front(ctx, s, t) {
    const W = s.wit; if (!W) return;
    const e = s.enemy, L = WitnessFX.look(e), p = s.player;
    ctx.save();
    for (const h of W.haz) {
      if (h.kind === 'wave' && h.sheet === 1) {
        ctx.save(); ctx.translate(h.x, 0); ctx.scale(h.dir, 1); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(${L.glow.join(',')},0.55)`; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(46, -h.h * 0.5, -10, -h.h); ctx.quadraticCurveTo(22, -h.h * 0.5, -10, 0); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, -4); ctx.quadraticCurveTo(42, -h.h * 0.5, -8, -h.h + 4); ctx.stroke();
        ctx.restore();
      } else if (h.kind === 'orb' && h.sheet === 1) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = wtGlow(ctx, h.x, h.y, 34, L.glow.join(','), 0.7, 2); ctx.beginPath(); ctx.arc(h.x, h.y, 34, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(h.x, h.y, 8, 0, TAU); ctx.fill();
        ctx.strokeStyle = L.hot; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(h.x, h.y, 20, 6, -0.3, 0, TAU); ctx.stroke();
        ctx.restore();
      } else if (h.kind === 'blade' && h.sheet === 1) {
        ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(Math.atan2(h.vy, h.vx)); ctx.globalCompositeOperation = 'lighter';
        const gr = ctx.createLinearGradient(-90, 0, 0, 0); gr.addColorStop(0, 'rgba(70,90,255,0)'); gr.addColorStop(1, `rgba(${L.glow.join(',')},0.7)`);
        ctx.fillStyle = gr; ctx.fillRect(-90, -3, 90, 6);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(0, -7); ctx.lineTo(-12, 0); ctx.lineTo(0, 7); ctx.closePath(); ctx.fill();
        ctx.restore();
      } else if (h.kind === 'thread' && h.life > 0 && e.visible) {
        const hand = e.sk.fha, k = Math.min(1, h.t / 0.2);
        ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${L.glow.join(',')},${(h.strong ? 0.9 : 0.6) * k})`; ctx.lineWidth = h.strong ? 3 : 1.6;
        ctx.beginPath(); ctx.moveTo(hand.x, hand.y);
        const tx = p.x, ty = p.y - 90 * p.scale, mx = (hand.x + tx) / 2, my = Math.min(hand.y, ty) - 60;
        ctx.quadraticCurveTo(mx + Math.sin(t * 9) * 12, my, tx, ty); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      } else if (h.kind === 'judgment' && h.cut && h.t < h.delay + 0.35 && h.sheet === 1) {
        const k = 1 - (h.t - h.delay) / 0.35;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(184,40,255,${0.6 * k})`; ctx.fillRect(s.bounds.l - 300, -h.h * 0.62, s.bounds.r - s.bounds.l + 600, h.h * 0.3);
        ctx.fillStyle = `rgba(255,255,255,${k})`; ctx.fillRect(s.bounds.l - 300, -h.h * 0.48, s.bounds.r - s.bounds.l + 600, 4);
        ctx.globalCompositeOperation = 'source-over';
      } else if (h.kind === 'line' && h.cut && h.t < h.delay + 0.25) {
        const k = 1 - (h.t - h.delay) / 0.25, dx = Math.cos(h.a), dy = Math.sin(h.a);
        ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,255,255,${k})`; ctx.lineWidth = 6 * k + 1;
        ctx.beginPath(); ctx.moveTo(h.x0, h.y0); ctx.lineTo(h.x0 + dx * h.len, h.y0 + dy * h.len); ctx.stroke();
        ctx.strokeStyle = `rgba(${L.glow.join(',')},${0.7 * k})`; ctx.lineWidth = 16 * k; ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
      }
    }
    // the drain's tether: a line of light from the Witness's hand to Kage, pulses flowing back along it
    const tt = W.tether;
    if (tt && e.visible) {
      const hand = e.sk.fha, tx = p.x, ty = p.y - 100 * p.scale;
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(${L.glow.join(',')},0.5)`; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(hand.x, hand.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,255,0.9)'; ctx.lineWidth = 2; ctx.stroke();
      for (let i = 0; i < 5; i++) { const u = 1 - ((t * 1.4 + i / 5) % 1); ctx.fillStyle = '#ff6a8a'; ctx.beginPath(); ctx.arc(lerp(hand.x, tx, u), lerp(hand.y, ty, u), 4, 0, TAU); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  },
  // screen space, last: the input warnings, the frozen frames, the False Death's fake screen
  screen(ctx, s, t) {
    const W = s.wit; if (!W) return;
    const L = WitnessFX.look(s.enemy), rf = SaveManager.data.settings.reduceFlash;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    // the modifiers at the screen edges: shown while they warn, solid while they bite
    for (const m of W.mods) {
      const warn = m.t < m.warn, a = warn ? 0.45 + 0.45 * Math.sin(t * 18) : 0.9;
      ctx.globalAlpha = Math.max(0, a); ctx.fillStyle = L.hot; ctx.strokeStyle = L.hot; ctx.lineWidth = 6; ctx.lineJoin = 'round';
      if (m.kind === 'reverse') {
        // both edges: arrows pointing the wrong way (the joystick warning)
        for (const [x, d] of [[44, 1], [W_ - 44, -1]]) { ctx.beginPath(); ctx.moveTo(x - d * 18, H / 2 - 40); ctx.lineTo(x + d * 18, H / 2); ctx.lineTo(x - d * 18, H / 2 + 40); ctx.stroke(); }
        ctx.font = '600 22px KageUI, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(warn ? 'REVERSAL INCOMING' : 'LEFT ⇄ RIGHT', W_ / 2, H - 150);
      } else if (m.kind === 'bind') {
        const x = m.dir > 0 ? W_ - 50 : 50;
        ctx.strokeRect(x - 16, H / 2 - 8, 32, 26); ctx.beginPath(); ctx.arc(x, H / 2 - 8, 11, Math.PI, 0); ctx.stroke();
        ctx.font = '600 22px KageUI, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(m.label, W_ / 2, H - 150);
      } else if (m.kind === 'delay') {
        ctx.beginPath(); ctx.arc(W_ / 2, H - 196, 16, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W_ / 2, H - 196); ctx.lineTo(W_ / 2, H - 206); ctx.moveTo(W_ / 2, H - 196); ctx.lineTo(W_ / 2 + 8, H - 192); ctx.stroke();
        ctx.font = '600 22px KageUI, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(m.label, W_ / 2, H - 150);
      }
    }
    ctx.globalAlpha = 1;
    // Execution Frames: the arena frozen on film
    if (W.frames && W.frames.until > s.time) {
      const k = clamp((W.frames.until - s.time) / 0.3, 0, 1);
      ctx.fillStyle = `rgba(0,0,0,${0.55 * k})`; ctx.fillRect(0, 0, W_, 46); ctx.fillRect(0, H - 46, W_, 46);
      ctx.fillStyle = `rgba(255,255,255,${0.8 * k})`;
      for (let x = 20; x < W_; x += 60) { ctx.fillRect(x, 14, 30, 18); ctx.fillRect(x, H - 32, 30, 18); }
      ctx.font = '600 26px KageNum, monospace'; ctx.textAlign = 'right'; ctx.fillText('FRAME ' + String((s.time * 60 | 0) % 10000).padStart(4, '0'), W_ - 40, 82);
      if (!rf) { ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${0.9 * k})`; ctx.fillRect(0, 0, W_, H); ctx.globalCompositeOperation = 'source-over'; }
    }
    // the False Death: a victory (or a defeat) that never happened
    if (W.fake) {
      const k = clamp(W.fake.t / 0.4, 0, 1), vic = W.fake.kind === 'victory';
      ctx.fillStyle = vic ? `rgba(10,6,4,${0.55 * k})` : `rgba(30,0,4,${0.6 * k})`; ctx.fillRect(0, 0, W_, H);
      ctx.globalAlpha = k; ctx.textAlign = 'center';
      ctx.fillStyle = vic ? '#e8c25c' : '#e83a3a'; ctx.font = '800 92px KageSerif, serif'; ctx.fillText(vic ? 'VICTORY' : 'YOU DIED', W_ / 2, H / 2 - 10);
      ctx.fillStyle = '#ece5d3'; ctx.font = '600 24px KageUI, sans-serif'; ctx.fillText(vic ? 'THE WITNESS HAS FALLEN' : 'THE ECHO ENDS HERE', W_ / 2, H / 2 + 36);
      ctx.globalAlpha = 1;
      if (W.fake.t > 1.2 && !rf) WitnessArena.distort(ctx, t, (W.fake.t - 1.2) * 3);
    }
    // the defeat: the Echo System coming apart (a slow white-violet bloom while it speaks its last line)
    if (W.defeat && s.phase === 'ko') {
      const k = clamp(1 - Math.abs((s.phaseT || 0) - 1), 0, 1) * 0.25;
      if (k > 0) { ctx.fillStyle = `rgba(200,190,255,${k})`; ctx.fillRect(0, 0, W_, H); }
    }
    ctx.restore();
  }
};
