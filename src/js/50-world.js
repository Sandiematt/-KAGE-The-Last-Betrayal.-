/* KAGE — Renderer: parallax environments, title / pre-fight / result scenes and the fight renderer (impact frames) */

function makeLayer(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  return c;
}
function seeded(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function mountainPath(ctx, w, base, amp, step, rnd, jag) {
  ctx.beginPath(); ctx.moveTo(0, base + 400); ctx.lineTo(0, base);
  let x = 0;
  while (x < w) { x += step * (0.6 + rnd() * 0.8); ctx.lineTo(x, base - rnd() * amp - (jag ? (rnd() < 0.3 ? amp * 0.4 : 0) : 0)); }
  ctx.lineTo(w, base + 400); ctx.closePath();
}

const LW = W + 520; // layer width (room for parallax)
// Parallax layers repeat sideways so a stretch several screens wide never runs out of background. For the
// arena's camera range (layer offsets between -LW + W and 0) this draws exactly one copy, as before.
function wrapX(x, period) { return ((x % period) + period) % period; }
function drawTiled(ctx, img, off) {
  for (let x = wrapX(off, LW) - LW; x < W; x += LW) if (x + LW > 0) ctx.drawImage(img, x, 0);
}

const ENVS = {
  rooftops: {
    name: 'The Forgotten Rooftops', rim: 'rgba(214,208,190,0.78)', light: { x: 0.55, y: -0.83 }, moon: '#d9d2bf', fog: 'rgba(40,38,48,', trail: C.bone,
    build() {
      const r = seeded(11);
      this.sky = makeLayer(W, H, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#070709'); gr.addColorStop(0.62, '#17161d'); gr.addColorStop(1, '#0b0a0c');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(236,229,211,${r() * 0.5})`; g.fillRect(r() * W, r() * H * 0.55, 1.2, 1.2); }
      });
      this.far = makeLayer(LW, H, (g) => {
        g.fillStyle = '#16151b';
        let x = 0;
        while (x < LW) {
          const bw = 40 + r() * 90, bh = 90 + r() * 170, base = 470;
          g.fillRect(x, base - bh, bw, bh + 300);
          if (r() < 0.45) { // pagoda roof tiers
            for (let t = 0; t < 3; t++) { const ty = base - bh - t * 26, ww = bw + 30 - t * 14; g.beginPath(); g.moveTo(x + bw / 2 - ww / 2 - 10, ty + 4); g.quadraticCurveTo(x + bw / 2, ty - 18, x + bw / 2 + ww / 2 + 10, ty + 4); g.lineTo(x + bw / 2 + ww / 2 - 6, ty + 10); g.lineTo(x + bw / 2 - ww / 2 + 6, ty + 10); g.fill(); }
          }
          for (let i = 0; i < 6; i++) if (r() < 0.35) { g.fillStyle = `rgba(201,164,92,${0.25 + r() * 0.4})`; g.fillRect(x + 6 + r() * (bw - 12), base - bh + 20 + r() * bh * 0.7, 3, 4); g.fillStyle = '#16151b'; }
          x += bw + 8 + r() * 30;
        }
      });
      this.mid = makeLayer(LW, H, (g) => {
        g.fillStyle = '#0d0c10';
        let x = -40;
        while (x < LW) {
          const bw = 160 + r() * 200, top = 500 + r() * 30;
          g.beginPath(); g.moveTo(x - 30, top + 20); g.quadraticCurveTo(x + bw / 2, top - 30, x + bw + 30, top + 20); g.lineTo(x + bw + 30, H); g.lineTo(x - 30, H); g.fill();
          g.strokeStyle = 'rgba(160,151,133,0.08)'; g.lineWidth = 1;
          for (let k = 0; k < bw; k += 9) { g.beginPath(); g.moveTo(x + k, top + 6); g.lineTo(x + k - 6, top + 40); g.stroke(); }
          x += bw + 60 + r() * 60;
        }
      });
      this.lanterns = []; for (let i = 0; i < 9; i++) this.lanterns.push({ x: i * (LW / 8) + r() * 60, y: 300 + r() * 80, ph: r() * 6 });
      this.clouds = []; for (let i = 0; i < 6; i++) this.clouds.push({ x: r() * W, y: 60 + r() * 220, w: 160 + r() * 260, s: 6 + r() * 10 });
    },
    back(ctx, cx, t) {
      ctx.drawImage(this.sky, 0, 0);
      const mx = 930 - cx * 0.05, my = 170;
      const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 260); halo.addColorStop(0, 'rgba(217,210,191,0.28)'); halo.addColorStop(1, 'rgba(217,210,191,0)');
      ctx.fillStyle = halo; ctx.fillRect(mx - 260, my - 260, 520, 520);
      ctx.fillStyle = this.moon; ctx.beginPath(); ctx.arc(mx, my, 70, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(160,151,133,0.25)'; ctx.beginPath(); ctx.arc(mx - 20, my - 14, 14, 0, TAU); ctx.arc(mx + 22, my + 18, 9, 0, TAU); ctx.fill();
      for (const c of this.clouds) {
        const x = ((c.x + t * c.s) % (W + 600)) - 300;
        ctx.fillStyle = 'rgba(20,19,26,0.75)'; ctx.beginPath(); ctx.ellipse(x, c.y, c.w, 16, 0, 0, TAU); ctx.fill();
      }
      drawTiled(ctx, this.far, -260 - cx * 0.18);
      ctx.fillStyle = 'rgba(40,38,48,0.35)'; ctx.fillRect(0, 380, W, 160);
      // swaying lantern strings
      const ox = wrapX(-260 - cx * 0.4 + LW, LW) - LW;   // lantern strings repeat with their layer
      ctx.strokeStyle = 'rgba(58,52,43,0.8)'; ctx.lineWidth = 1;
      for (let rep = ox; rep < W; rep += LW) {
      ctx.beginPath(); for (let i = 0; i < this.lanterns.length - 1; i++) { const a = this.lanterns[i], b = this.lanterns[i + 1]; ctx.moveTo(a.x + rep, a.y - 30); ctx.quadraticCurveTo((a.x + b.x) / 2 + rep, a.y + 10, b.x + rep, b.y - 30); } ctx.stroke();
      for (const l of this.lanterns) {
        const sw = Math.sin(t * 1.6 + l.ph) * 4, x = l.x + rep + sw, y = l.y;
        if (x < -40 || x > W + 40) continue;
        const gl = ctx.createRadialGradient(x, y, 0, x, y, 22); gl.addColorStop(0, 'rgba(210,74,60,0.35)'); gl.addColorStop(1, 'rgba(210,74,60,0)');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
        ctx.fillStyle = '#b8392d'; ctx.beginPath(); ctx.ellipse(x, y, 8, 12, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#0d0c10'; ctx.fillRect(x - 5, y - 14, 10, 3); ctx.fillRect(x - 5, y + 11, 10, 3);
      }
      }
      drawTiled(ctx, this.mid, -260 - cx * 0.55);
    },
    floor(ctx, cx) {
      const gr = ctx.createLinearGradient(0, GROUND, 0, H); gr.addColorStop(0, '#141217'); gr.addColorStop(1, '#060507');
      ctx.fillStyle = gr; ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.strokeStyle = 'rgba(58,52,43,0.5)'; ctx.lineWidth = 1;
      const off = (-cx) % 40;
      for (let x = off - 40; x < W + 40; x += 40) { ctx.beginPath(); ctx.moveTo(x, GROUND); ctx.lineTo(x + (x - W / 2) * 0.35, H); ctx.stroke(); }
      for (let y = GROUND + 14, i = 1; y < H; i++, y += 10 + i * 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.fillStyle = '#3a342b'; ctx.fillRect(0, GROUND, W, 1);
    },
    front(ctx, cx, t) {
      for (let i = 0; i < 3; i++) {
        const x = ((t * (14 + i * 6) + i * 500) % (W + 800)) - 400;
        const g = ctx.createRadialGradient(x, GROUND - 20, 0, x, GROUND - 20, 300); g.addColorStop(0, 'rgba(60,58,70,0.18)'); g.addColorStop(1, 'rgba(60,58,70,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 300, GROUND - 160, 600, 260);
      }
    }
  },
  highlands: {
    name: 'The Sacred Highlands', rim: 'rgba(222,96,72,0.72)', light: { x: 0, y: -1 }, trail: C.bone,
    build() {
      const r = seeded(29);
      this.sky = makeLayer(W, H, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0a0908'); gr.addColorStop(0.72, '#14120f'); gr.addColorStop(1, '#0a0908');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
      });
      this.far = makeLayer(LW, H, (g) => {
        g.fillStyle = 'rgba(58,52,43,0.5)'; mountainPath(g, LW, 380, 200, 120, r, true); g.fill();
        g.fillStyle = '#1d1a16'; mountainPath(g, LW, 450, 140, 90, r); g.fill();
        // temples on the ridge
        g.fillStyle = '#16140f';
        for (let i = 0; i < 4; i++) {
          const x = 120 + i * (LW / 4) + r() * 100, y = 300 + r() * 80;
          for (let t = 0; t < 4; t++) { const ww = 70 - t * 14, ty = y - t * 22; g.beginPath(); g.moveTo(x - ww / 2 - 12, ty); g.quadraticCurveTo(x, ty - 18, x + ww / 2 + 12, ty); g.lineTo(x + ww / 2 - 4, ty + 6); g.lineTo(x - ww / 2 + 4, ty + 6); g.fill(); g.fillRect(x - ww / 2 + 6, ty + 6, ww - 12, 16); }
        }
      });
      this.falls = [{ x: 210, top: 330, h: 170, w: 22 }, { x: 980, top: 300, h: 210, w: 30 }];
      this.motes = []; for (let i = 0; i < 40; i++) this.motes.push({ x: r() * W, y: r() * H, s: 4 + r() * 12, ph: r() * 6 });
    },
    back(ctx, cx, t) {
      ctx.drawImage(this.sky, 0, 0);
      const mx = 640 - cx * 0.05, my = 190, br = 1 + Math.sin(t * TAU / 6) * 0.03;
      const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 170 * br); halo.addColorStop(0, 'rgba(163,48,42,0.45)'); halo.addColorStop(1, 'rgba(163,48,42,0)');
      ctx.fillStyle = halo; ctx.fillRect(mx - 200, my - 200, 400, 400);
      ctx.fillStyle = 'rgba(163,48,42,0.78)'; ctx.beginPath(); ctx.arc(mx, my, 60, 0, TAU); ctx.fill();
      const fo = -260 - cx * 0.16;
      drawTiled(ctx, this.far, fo);
      for (const f of this.falls) {
        const x = wrapX(f.x + fo + 260 + 300, LW) - 300;   // repeats with the far layer
        for (let i = 0; i < 6; i++) {
          const yy = (t * 140 + i * 40) % f.h;
          ctx.fillStyle = `rgba(236,229,211,${0.05 + 0.04 * Math.sin(t * 6 + i)})`;
          ctx.fillRect(x + (i % 3) * f.w / 3, f.top, 2, f.h);
          ctx.fillStyle = 'rgba(236,229,211,0.12)'; ctx.fillRect(x + (i * 5) % f.w, f.top + yy, 2, 18);
        }
        const mg = ctx.createRadialGradient(x + f.w / 2, f.top + f.h, 0, x + f.w / 2, f.top + f.h, 90); mg.addColorStop(0, 'rgba(160,151,133,0.18)'); mg.addColorStop(1, 'rgba(160,151,133,0)');
        ctx.fillStyle = mg; ctx.fillRect(x - 90, f.top + f.h - 90, 200, 180);
      }
      // torii gate (Wonder "Temple Gate")
      const gx = wrapX(640 - 300 - cx * 0.45 + 700, 2600) - 700, gy = 236;   // recurs along a stretch
      ctx.fillStyle = '#1d1a16';
      ctx.beginPath(); ctx.moveTo(gx + 10, gy + 60); ctx.quadraticCurveTo(gx + 300, gy + 90, gx + 590, gy + 60); ctx.lineTo(gx + 580, gy + 96); ctx.quadraticCurveTo(gx + 300, gy + 120, gx + 20, gy + 96); ctx.fill();
      ctx.fillRect(gx + 70, gy + 150, 460, 20); ctx.fillRect(gx + 110, gy + 96, 38, 404); ctx.fillRect(gx + 452, gy + 96, 38, 404);
      for (const lx of [gx + 147, gx + 453]) {
        const ly = gy + 222 + Math.sin(t * 1.4 + lx) * 2;
        ctx.strokeStyle = 'rgba(58,52,43,0.9)'; ctx.beginPath(); ctx.moveTo(lx, gy + 170); ctx.lineTo(lx, ly - 10); ctx.stroke();
        const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 40); lg.addColorStop(0, 'rgba(210,74,60,0.4)'); lg.addColorStop(1, 'rgba(210,74,60,0)');
        ctx.fillStyle = lg; ctx.fillRect(lx - 40, ly - 40, 80, 80);
        ctx.fillStyle = C.ember; ctx.fillRect(lx - 7, ly - 10, 14, 22);
      }
      // broken pillars
      const po = wrapX(-cx * 0.7 + 600, 1700) - 600;
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.moveTo(30 + po - 60, GROUND); ctx.lineTo(30 + po - 60, 210); ctx.lineTo(60 + po - 60, 190); ctx.lineTo(74 + po - 60, 218); ctx.lineTo(100 + po - 60, 200); ctx.lineTo(100 + po - 60, GROUND); ctx.fill();
      ctx.beginPath(); ctx.moveTo(1240 + po + 60, GROUND); ctx.lineTo(1240 + po + 60, 270); ctx.lineTo(1262 + po + 60, 290); ctx.lineTo(1290 + po + 60, 258); ctx.lineTo(1310 + po + 60, 284); ctx.lineTo(1310 + po + 60, GROUND); ctx.fill();
      const fog = ctx.createLinearGradient(0, 400, 0, GROUND + 60); fog.addColorStop(0, 'rgba(29,26,22,0)'); fog.addColorStop(0.6, 'rgba(29,26,22,0.6)'); fog.addColorStop(1, 'rgba(29,26,22,0)');
      ctx.fillStyle = fog; ctx.fillRect(0, 400, W, 280);
    },
    floor(ctx) {
      const gr = ctx.createLinearGradient(0, GROUND, 0, H); gr.addColorStop(0, '#14120f'); gr.addColorStop(1, '#0a0908');
      ctx.fillStyle = gr; ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = '#3a342b'; ctx.fillRect(0, GROUND, W, 1);
    },
    front(ctx, cx, t) {
      ctx.globalCompositeOperation = 'source-over';
      for (const m of this.motes) {
        const x = (m.x + Math.sin(t * 0.5 + m.ph) * 30 - cx * 0.8 + W * 4) % W, y = (m.y - t * m.s + H * 20) % H;
        ctx.fillStyle = `rgba(201,164,92,${0.25 + 0.25 * Math.sin(t * 2 + m.ph)})`; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  },
  // Yomi's outer districts in the rain (Act I, Checkpoint Row and the archive road): the rooftops' city layers under a
  // cold slate wash, a pale moon behind the cloud, slanting rain and a wet road that catches the lantern light.
  districts: {
    name: 'The Outer Districts', rim: 'rgba(190,206,220,0.72)', light: { x: 0.4, y: -0.9 }, moon: '#9aa6b0', trail: C.bone,
    build() {
      ENVS.rooftops.build.call(this);
      const r = seeded(53);
      this.rain = []; for (let i = 0; i < 110; i++) this.rain.push({ x: r() * W, y: r() * H, s: 900 + r() * 500, l: 14 + r() * 18, z: 0.5 + r() * 0.7 });
    },
    back(ctx, cx, t) {
      ENVS.rooftops.back.call(this, ctx, cx, t);
      ctx.fillStyle = 'rgba(52,66,82,0.28)'; ctx.fillRect(0, 0, W, H);
      const fog = ctx.createLinearGradient(0, 380, 0, GROUND + 40); fog.addColorStop(0, 'rgba(70,84,98,0)'); fog.addColorStop(1, 'rgba(70,84,98,0.32)');
      ctx.fillStyle = fog; ctx.fillRect(0, 380, W, GROUND - 340);
    },
    floor(ctx, cx, t) {
      ENVS.rooftops.floor.call(this, ctx, cx, t);
      // puddles on the wet road catching the lantern light
      for (let i = 0; i < 7; i++) {
        const x = wrapX(i * 260 - cx, W + 400) - 200, y = GROUND + 18 + (i % 3) * 22;
        ctx.fillStyle = `rgba(210,74,60,${0.1 + 0.04 * Math.sin(t * 2 + i)})`; ctx.beginPath(); ctx.ellipse(x, y, 70 + (i % 2) * 40, 4, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(190,206,220,0.08)'; ctx.fillRect(x - 40, y - 1, 80, 1);
      }
    },
    front(ctx, cx, t) {
      ctx.strokeStyle = 'rgba(190,206,220,0.28)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (const d of this.rain) {
        const x = wrapX(d.x - cx * d.z * 0.5 - t * d.s * 0.18, W), y = (d.y + t * d.s) % H;
        ctx.moveTo(x, y); ctx.lineTo(x - d.l * 0.25, y + d.l);
      }
      ctx.stroke();
    }
  },
  // The City of Echoes (Act II): a district rebuilt from stored memories. The rooftops' city layers under a violet-sepia
  // memory wash, a pale violet moon, ghost buildings that keep half-loading in outline over the skyline, the road
  // ruled in faint memory tiles, and violet flecks drifting up. Its streets repeat (stretch `loop`, Renderer.drawProp).
  echoes: {
    name: 'The City of Echoes', rim: 'rgba(201,189,255,0.75)', light: { x: 0.5, y: -0.86 }, moon: '#c9bdff', trail: '#c9bdff',
    build() {
      ENVS.rooftops.build.call(this);
      const r = seeded(71);
      this.ghosts = []; for (let i = 0; i < 7; i++) this.ghosts.push({ x: i * (LW / 7) + r() * 80, w: 70 + r() * 90, h: 120 + r() * 160, ph: r() * 6, tiers: r() < 0.5 ? 3 : 0 });
      this.flecks = []; for (let i = 0; i < 46; i++) this.flecks.push({ x: r() * W, y: r() * H, s: 8 + r() * 18, ph: r() * 6, z: 0.4 + r() * 0.8 });
    },
    back(ctx, cx, t) {
      ENVS.rooftops.back.call(this, ctx, cx, t);
      // ghost buildings: outlines of a skyline that keeps loading in and out
      const off = wrapX(-260 - cx * 0.3, LW) - LW;
      ctx.lineWidth = 1.2;
      for (let rep = off; rep < W; rep += LW) for (const g of this.ghosts) {
        const x = g.x + rep, a = 0.1 + 0.12 * Math.max(0, Math.sin(t * 0.7 + g.ph));
        if (x + g.w < -20 || x > W + 20) continue;
        ctx.strokeStyle = `rgba(185,168,255,${a})`; ctx.setLineDash([6, 5]); ctx.lineDashOffset = -t * 12;
        ctx.strokeRect(x, 470 - g.h, g.w, g.h);
        for (let k = 0; k < g.tiers; k++) { const ty = 470 - g.h - k * 22; ctx.beginPath(); ctx.moveTo(x - 10 + k * 6, ty); ctx.quadraticCurveTo(x + g.w / 2, ty - 16, x + g.w + 10 - k * 6, ty); ctx.stroke(); }
      }
      ctx.setLineDash([]);
      // the memory wash: violet over the night, warmer sepia low by the road
      ctx.fillStyle = 'rgba(74,59,134,0.22)'; ctx.fillRect(0, 0, W, H);
      const low = ctx.createLinearGradient(0, 360, 0, GROUND + 40); low.addColorStop(0, 'rgba(200,180,140,0)'); low.addColorStop(1, 'rgba(200,180,140,0.12)');
      ctx.fillStyle = low; ctx.fillRect(0, 360, W, GROUND - 320);
    },
    floor(ctx, cx, t) {
      ENVS.rooftops.floor.call(this, ctx, cx, t);
      // faint memory tiles along the road, one now and then lit as if still being written
      const off = wrapX(-cx, 160);
      for (let x = off - 160, i = Math.floor(cx / 160); x < W + 160; x += 160, i++) {
        const lit = Math.sin(t * 1.3 + i * 2.1) > 0.82;
        ctx.fillStyle = lit ? 'rgba(185,168,255,0.16)' : 'rgba(185,168,255,0.04)';
        ctx.fillRect(x + 4, GROUND + 3, 150, 6);
      }
    },
    front(ctx, cx, t) {
      ENVS.rooftops.front.call(this, ctx, cx, t);
      for (const m of this.flecks) {
        const x = wrapX(m.x + Math.sin(t * 0.6 + m.ph) * 20 - cx * m.z * 0.6, W), y = wrapX(m.y - t * m.s, H);
        ctx.fillStyle = `rgba(201,189,255,${0.18 + 0.2 * Math.sin(t * 2 + m.ph)})`; ctx.fillRect(x, y, 2.2 * m.z, 2.2 * m.z);
      }
    }
  },
  // Takashi's training yard in Hoshimura, as the brothers remember it (the Interlude spar): a low dusk sun, the dojo's
  // roof and veranda behind a wooden fence, a pine, a striking post and a rack of practice swords, packed warm earth.
  // Drawn in the memory filter by the fight renderer (Renderer.drawMemoryFilter).
  yard: {
    name: 'Takashi\'s Training Yard', rim: 'rgba(236,206,160,0.75)', light: { x: -0.5, y: -0.86 }, trail: '#c9a878',
    build() {
      const r = seeded(43);
      this.sky = makeLayer(W, H, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a1d17'); gr.addColorStop(0.45, '#6a4128'); gr.addColorStop(0.7, '#a06a3c'); gr.addColorStop(1, '#3a281c');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(236,206,160,${0.05 + r() * 0.06})`; g.beginPath(); g.ellipse(r() * W, 80 + r() * 200, 160 + r() * 200, 10 + r() * 12, 0, 0, TAU); g.fill(); }
      });
      this.far = makeLayer(LW, H, (g) => {
        g.fillStyle = 'rgba(74,48,32,0.75)'; mountainPath(g, LW, 430, 110, 150, r); g.fill();
        g.fillStyle = '#3c2a1e'; mountainPath(g, LW, 470, 60, 120, r); g.fill();
      });
      this.mid = makeLayer(LW, H, (g) => {
        // the dojo: a long hipped roof over a raised veranda, sliding doors lit warm from inside
        const dx = 320, dw = 820, top = 300;
        g.fillStyle = '#24180f';
        g.beginPath(); g.moveTo(dx - 80, top + 60); g.quadraticCurveTo(dx + dw / 2, top - 40, dx + dw + 80, top + 60); g.lineTo(dx + dw + 50, top + 78); g.lineTo(dx - 50, top + 78); g.fill();
        g.fillRect(dx, top + 78, dw, 150);
        for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(236,196,130,${0.16 + r() * 0.12})`; g.fillRect(dx + 24 + i * 100, top + 96, 80, 110); g.fillStyle = 'rgba(36,24,15,0.8)'; g.fillRect(dx + 62 + i * 100, top + 96, 3, 110); g.fillRect(dx + 24 + i * 100, top + 150, 80, 2); }
        g.fillStyle = '#1c130c'; g.fillRect(dx - 30, top + 226, dw + 60, 16);
        // the wooden fence along the back of the yard
        g.fillStyle = '#2e2015';
        g.fillRect(0, 520, LW, 10); g.fillRect(0, 560, LW, 8);
        for (let x = 0; x < LW; x += 34) g.fillRect(x, 500 + r() * 6, 12, 120);
        // a pine at the left
        const px = 150; g.fillStyle = '#20160e'; g.fillRect(px - 9, 260, 18, 300);
        for (let k = 0; k < 5; k++) { const yy = 230 + k * 55, ww = 70 + k * 26; g.beginPath(); g.ellipse(px + (k % 2 ? 30 : -20), yy, ww, 26, 0, 0, TAU); g.fill(); }
      });
      this.leaves = []; for (let i = 0; i < 26; i++) this.leaves.push({ x: r() * W, y: r() * H, s: 18 + r() * 26, ph: r() * 6, sz: 2 + r() * 2.5 });
    },
    back(ctx, cx, t) {
      ctx.drawImage(this.sky, 0, 0);
      // the low dusk sun the boys trained under
      const sx = 860 - cx * 0.04, sy = 330, sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 260);
      sg.addColorStop(0, 'rgba(255,214,150,0.55)'); sg.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = sg; ctx.fillRect(sx - 260, sy - 260, 520, 520);
      ctx.fillStyle = 'rgba(255,224,170,0.85)'; ctx.beginPath(); ctx.arc(sx, sy, 54, 0, TAU); ctx.fill();
      drawTiled(ctx, this.far, -260 - cx * 0.15);
      drawTiled(ctx, this.mid, -260 - cx * 0.4);
      // striking post (makiwara) and a rack of bokken, nearer the fighters
      const po = -cx * 0.75;
      ctx.fillStyle = '#1a110a';
      const mx = 140 + po; ctx.fillRect(mx - 7, 470, 14, GROUND - 470); ctx.fillStyle = '#5a3c22'; ctx.fillRect(mx - 9, 480, 18, 30);
      ctx.fillStyle = '#1a110a';
      const rx = 1120 + po; ctx.fillRect(rx, 500, 8, GROUND - 500); ctx.fillRect(rx + 120, 500, 8, GROUND - 500); ctx.fillRect(rx - 6, 520, 140, 7); ctx.fillRect(rx - 6, 580, 140, 7);
      ctx.strokeStyle = '#7a5532'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(rx + 18 + i * 28, 600); ctx.lineTo(rx + 26 + i * 28, 486); ctx.stroke(); }
      const haze = ctx.createLinearGradient(0, 430, 0, GROUND + 40); haze.addColorStop(0, 'rgba(160,106,60,0)'); haze.addColorStop(1, 'rgba(160,106,60,0.35)');
      ctx.fillStyle = haze; ctx.fillRect(0, 430, W, GROUND - 390);
    },
    floor(ctx) {
      const gr = ctx.createLinearGradient(0, GROUND, 0, H); gr.addColorStop(0, '#4a3220'); gr.addColorStop(1, '#22170e');
      ctx.fillStyle = gr; ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = 'rgba(236,206,160,0.35)'; ctx.fillRect(0, GROUND, W, 1);
    },
    front(ctx, cx, t) {
      // a few leaves drifting across the yard
      for (const l of this.leaves) {
        const x = (l.x + t * l.s - cx * 0.8 + W * 40) % W, y = (l.y + t * l.s * 0.5 + Math.sin(t + l.ph) * 20 + H * 20) % H;
        ctx.fillStyle = `rgba(190,120,60,${0.35 + 0.2 * Math.sin(t * 2 + l.ph)})`; ctx.beginPath(); ctx.ellipse(x, y, l.sz * 1.6, l.sz, t + l.ph, 0, TAU); ctx.fill();
      }
    }
  },
  // Hoshimura, the abandoned village (the Prologue): the highlands' red moon over a burnt-out village. Charred
  // rooftops and broken beams in two parallax rows, a cold ash haze, grey ash falling and a few embers.
  hoshimura: {
    name: 'Hoshimura', rim: 'rgba(214,120,96,0.66)', light: { x: 0.2, y: -1 }, trail: C.bone,
    build() {
      const r = seeded(41);
      this.sky = makeLayer(W, H, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0b0a0b'); gr.addColorStop(0.6, '#1a1617'); gr.addColorStop(0.85, '#231b19'); gr.addColorStop(1, '#0b0a0a');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(40,34,34,${0.25 + r() * 0.2})`; g.beginPath(); g.ellipse(r() * W, 90 + r() * 170, 260 + r() * 260, 18 + r() * 22, 0, 0, TAU); g.fill(); }
      });
      // a burnt house silhouette: posts, a sagging roof with gaps, and a beam or two jutting out
      const house = (g, x, base, w, h, col) => {
        g.fillStyle = col;
        const roofY = base - h, sag = 6 + r() * 14;
        g.fillRect(x + 6, roofY + 10, 7, h); g.fillRect(x + w - 13, roofY + 10, 7, h);
        if (r() < 0.6) g.fillRect(x + w * 0.45, roofY + 16, 6, h);
        // a hipped minka roof, its ridge sagging where the fire ate the beams
        g.beginPath(); g.moveTo(x - 16, roofY + 16); g.lineTo(x + w * 0.22, roofY - 22); g.lineTo(x + w * 0.5, roofY - 22 + sag); g.lineTo(x + w * 0.78, roofY - 22); g.lineTo(x + w + 16, roofY + 16);
        // a burnt gap bitten out of the roof line
        const gx = x + w * (0.25 + r() * 0.4);
        g.lineTo(x + w + 6, roofY + 26); g.lineTo(gx + 26, roofY + 22); g.lineTo(gx + 12, roofY + 6); g.lineTo(gx, roofY + 24); g.lineTo(x - 6, roofY + 26); g.closePath(); g.fill();
        g.save(); g.translate(x + w * r(), roofY + 4); g.rotate(-0.6 + r() * 1.2); g.fillRect(-2, -40 - r() * 30, 5, 60); g.restore();
      };
      this.far = makeLayer(LW, H, (g) => {
        g.fillStyle = 'rgba(54,46,44,0.5)'; mountainPath(g, LW, 400, 150, 120, r, true); g.fill();
        g.fillStyle = '#1d1918'; mountainPath(g, LW, 470, 70, 80, r); g.fill();
        let x = 20; while (x < LW) { house(g, x, 482, 70 + r() * 50, 46 + r() * 26, '#171414'); x += 110 + r() * 120; }
      });
      this.mid = makeLayer(LW, H, (g) => {
        let x = 60; while (x < LW) { house(g, x, 560, 130 + r() * 70, 90 + r() * 40, '#0f0d0d'); x += 260 + r() * 260; }
        // fences and a lone well
        g.fillStyle = '#0f0d0d';
        for (let i = 0; i < 18; i++) { const fx = r() * LW; g.fillRect(fx, 520 + r() * 20, 4, 40); g.fillRect(fx - 20, 532, 44, 3); }
      });
      this.ash = []; for (let i = 0; i < 46; i++) this.ash.push({ x: r() * W, y: r() * H, s: 8 + r() * 18, ph: r() * 6, z: 0.5 + r(), ember: r() < 0.12 });
    },
    back(ctx, cx, t) {
      ctx.drawImage(this.sky, 0, 0);
      const mx = 760 - cx * 0.05, my = 170, br = 1 + Math.sin(t * TAU / 6) * 0.03;
      const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 160 * br); halo.addColorStop(0, 'rgba(163,48,42,0.4)'); halo.addColorStop(1, 'rgba(163,48,42,0)');
      ctx.fillStyle = halo; ctx.fillRect(mx - 200, my - 200, 400, 400);
      ctx.fillStyle = 'rgba(163,48,42,0.72)'; ctx.beginPath(); ctx.arc(mx, my, 54, 0, TAU); ctx.fill();
      drawTiled(ctx, this.far, -260 - cx * 0.16);
      // smoke still rising from a few roofs
      for (let i = 0; i < 3; i++) {
        const sx = wrapX(300 + i * 520 - cx * 0.16, LW) - 200, sy = 420 - ((t * 16 + i * 40) % 160);
        ctx.fillStyle = `rgba(70,62,62,${0.12 + 0.05 * Math.sin(t + i)})`; ctx.beginPath(); ctx.ellipse(sx + Math.sin(t * 0.5 + i) * 18, sy, 34, 60, 0, 0, TAU); ctx.fill();
      }
      drawTiled(ctx, this.mid, -260 - cx * 0.45);
      const fog = ctx.createLinearGradient(0, 420, 0, GROUND + 60); fog.addColorStop(0, 'rgba(36,30,30,0)'); fog.addColorStop(0.6, 'rgba(36,30,30,0.55)'); fog.addColorStop(1, 'rgba(36,30,30,0)');
      ctx.fillStyle = fog; ctx.fillRect(0, 420, W, 280);
    },
    floor(ctx, cx) {
      const gr = ctx.createLinearGradient(0, GROUND, 0, H); gr.addColorStop(0, '#181415'); gr.addColorStop(1, '#0a0909');
      ctx.fillStyle = gr; ctx.fillRect(0, GROUND, W, H - GROUND);
      // ash drifts and cart ruts on the road
      ctx.fillStyle = 'rgba(120,110,108,0.08)';
      for (let i = 0; i < 7; i++) { const x = wrapX(i * 230 - cx, W + 300) - 150; ctx.beginPath(); ctx.ellipse(x, GROUND + 22 + (i % 3) * 14, 90, 6, 0, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#3d3434'; ctx.fillRect(0, GROUND, W, 1);
    },
    front(ctx, cx, t) {
      for (const a of this.ash) {
        const x = ((a.x + Math.sin(t * 0.7 + a.ph) * 26 - cx * a.z * 0.6 - t * 10 * a.z) % W + W) % W, y = (a.y + t * a.s) % H;
        ctx.fillStyle = a.ember ? `rgba(230,110,70,${0.4 + 0.3 * Math.sin(t * 3 + a.ph)})` : 'rgba(150,140,138,0.4)';
        ctx.fillRect(x, y, 2 * a.z, 2 * a.z);
      }
    }
  },
  wasteland: {
    name: 'The Crimson Wasteland', rim: 'rgba(255,146,90,0.8)', light: { x: 0.7, y: -0.7 }, trail: '#ffb38a',
    build() {
      const r = seeded(53);
      this.sky = makeLayer(W, H, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#120505'); gr.addColorStop(0.45, '#3a0e0a'); gr.addColorStop(0.75, '#5c1a10'); gr.addColorStop(1, '#100605');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(10,4,3,${0.3 + r() * 0.3})`; g.beginPath(); g.ellipse(r() * W, 80 + r() * 200, 300 + r() * 300, 26 + r() * 30, 0, 0, TAU); g.fill(); }
      });
      this.far = makeLayer(LW, H, (g) => {
        g.fillStyle = '#1e0807';
        let x = 0;
        while (x < LW) { // crenellated fortress walls & broken towers
          const w = 120 + r() * 160, h = 120 + r() * 120, base = 470;
          g.fillRect(x, base - h, w, h + 300);
          for (let c = x; c < x + w; c += 18) g.fillRect(c, base - h - 12, 10, 14);
          if (r() < 0.5) { const tw = 40 + r() * 30, th = h + 80 + r() * 90; g.beginPath(); g.moveTo(x + w * 0.3, base); g.lineTo(x + w * 0.3, base - th); g.lineTo(x + w * 0.3 + tw * 0.4, base - th + 20); g.lineTo(x + w * 0.3 + tw * 0.7, base - th - 10); g.lineTo(x + w * 0.3 + tw, base - th + 30); g.lineTo(x + w * 0.3 + tw, base); g.fill(); }
          x += w + 30 + r() * 80;
        }
      });
      this.mid = makeLayer(LW, H, (g) => {
        g.fillStyle = '#0c0403';
        mountainPath(g, LW, 540, 50, 70, r); g.fill();
        for (let i = 0; i < 7; i++) { const x = r() * LW; g.fillRect(x, 420 + r() * 50, 14, 200); g.save(); g.translate(x + 7, 430); g.rotate(-0.4 + r() * 0.8); g.fillRect(-60, -4, 120, 8); g.restore(); }
      });
      this.fires = []; for (let i = 0; i < 6; i++) this.fires.push({ x: 100 + i * (LW / 6) + r() * 80, y: 440 + r() * 50, s: 0.7 + r() * 0.8, ph: r() * 6 });
      this.ash = []; for (let i = 0; i < 60; i++) this.ash.push({ x: r() * W, y: r() * H, s: 10 + r() * 30, ph: r() * 6, z: 0.5 + r() });
    },
    back(ctx, cx, t) {
      ctx.drawImage(this.sky, 0, 0);
      const sx = 780 - cx * 0.04, sy = 250;
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 220); sg.addColorStop(0, 'rgba(255,120,70,0.5)'); sg.addColorStop(0.3, 'rgba(210,74,60,0.25)'); sg.addColorStop(1, 'rgba(210,74,60,0)');
      ctx.fillStyle = sg; ctx.fillRect(sx - 220, sy - 220, 440, 440);
      ctx.fillStyle = 'rgba(255,140,90,0.75)'; ctx.beginPath(); ctx.arc(sx, sy, 46, 0, TAU); ctx.fill();
      const fo = -260 - cx * 0.18;
      drawTiled(ctx, this.far, fo);
      for (const f of this.fires) {
        const x = wrapX(f.x + fo + 300, LW) - 300, y = f.y, fl = 1 + Math.sin(t * 9 + f.ph) * 0.12 + Math.sin(t * 23 + f.ph) * 0.06;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 110 * f.s * fl); g.addColorStop(0, 'rgba(255,170,90,0.55)'); g.addColorStop(0.4, 'rgba(210,74,60,0.25)'); g.addColorStop(1, 'rgba(210,74,60,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 120 * f.s, y - 120 * f.s, 240 * f.s, 240 * f.s);
        ctx.fillStyle = 'rgba(255,190,110,0.8)';
        for (let i = 0; i < 4; i++) { const ix = x - 18 * f.s + i * 12 * f.s, h = (26 + Math.sin(t * 12 + i + f.ph) * 10) * f.s; ctx.beginPath(); ctx.moveTo(ix - 6 * f.s, y); ctx.quadraticCurveTo(ix, y - h * 1.3, ix + 6 * f.s, y); ctx.fill(); }
        ctx.fillStyle = 'rgba(30,10,8,0.35)'; ctx.beginPath(); ctx.ellipse(x + Math.sin(t * 0.6 + f.ph) * 20, y - 120 - (t * 20 % 60), 40 * f.s, 70 * f.s, 0, 0, TAU); ctx.fill();
      }
      drawTiled(ctx, this.mid, -260 - cx * 0.5);
    },
    floor(ctx, cx, t) {
      const gr = ctx.createLinearGradient(0, GROUND, 0, H); gr.addColorStop(0, '#1a0907'); gr.addColorStop(1, '#070302');
      ctx.fillStyle = gr; ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.strokeStyle = `rgba(255,106,60,${0.25 + Math.sin(t * 2) * 0.08})`; ctx.lineWidth = 1.5;
      const off = -cx;
      ctx.beginPath();
      for (let i = 0; i < 9; i++) { const x = ((i * 190 + off) % (W + 300) + W + 300) % (W + 300) - 150; ctx.moveTo(x, GROUND + 8); ctx.lineTo(x + 30, GROUND + 30); ctx.lineTo(x + 10, GROUND + 60); ctx.lineTo(x + 50, GROUND + 100); }
      ctx.stroke();
      ctx.fillStyle = '#5c1a10'; ctx.fillRect(0, GROUND, W, 1);
    },
    front(ctx, cx, t) {
      for (const a of this.ash) {
        const x = ((a.x + Math.sin(t + a.ph) * 30 - cx * a.z * 0.6 - t * 18 * a.z) % W + W) % W, y = (a.y + t * a.s) % H;
        ctx.fillStyle = a.z > 1.1 ? 'rgba(255,140,80,0.6)' : 'rgba(120,110,100,0.45)';
        ctx.fillRect(x, y, 2 * a.z, 2 * a.z);
      }
    }
  }
};
function getEnv(id) { const e = ENVS[id] || ENVS.highlands; if (!e.built) { e.build(); e.built = true; } return e; }

/* ======================================================================== */
const Renderer = {
  ctx: null,
  vignette: null,
  init(ctx) {
    this.ctx = ctx;
    setTimeout(() => { this.paperTex(); for (const id in ENVS) getEnv(id); }, 0); // pre-build heavy layers so the first impact frame never hitches
    this.vignette = makeLayer(W, H, (g) => {
      const v = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.78)');
      g.fillStyle = v; g.fillRect(0, 0, W, H);
    });
  },
  paper: null,
  paperTex() {
    if (this.paper) return this.paper;
    return (this.paper = makeLayer(W, H, (g) => {
      g.fillStyle = C.bone; g.fillRect(0, 0, W, H);
      const r = seeded(5);
      for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(90,70,40,${r() * 0.1})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1); }
      for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(120,100,70,${r() * 0.08})`; g.lineWidth = 1; g.beginPath(); const x = r() * W, y = r() * H; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 20); g.stroke(); }
      const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H); v.addColorStop(0, 'rgba(120,96,60,0)'); v.addColorStop(1, 'rgba(120,96,60,0.28)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
    }));
  },
  clear() { const c = this.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = C.void; c.fillRect(0, 0, W, H); },

  /* ---- static arena with posed fighters (pre-fight, results) ---- */
  drawTableau(env, t, opts) {
    const ctx = this.ctx;
    const gy0 = opts.ground || GROUND;
    env.back(ctx, 0, t); this.drawFloor(ctx, env, 0, t, gy0);
    if (opts.tint) { ctx.fillStyle = opts.tint; ctx.fillRect(0, 0, W, H); }
    for (const l of opts.lights || []) {
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r); g.addColorStop(0, l.c); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
    }
    if (opts.sun) {
      const g = ctx.createRadialGradient(opts.sun.x, opts.sun.y, 0, opts.sun.x, opts.sun.y, opts.sun.r); g.addColorStop(0, opts.sun.c); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(opts.sun.x, opts.sun.y, opts.sun.r, 0, TAU); ctx.fill();
    }
    const z = opts.zoom || 1.6, gy = opts.ground || GROUND, cz = 1 + Math.min(1, t / 2) * (opts.camEase || 0);
    ctx.save(); ctx.translate(W / 2, gy); ctx.scale(z * cz, z * cz);
    for (const f of opts.fighters) f.drawShadow(ctx);
    for (const f of opts.fighters) { f.draw(ctx, { rim: opts.rim || env.rim, light: env.light, shadow: true }); }
    ctx.restore();
    env.front(ctx, 0, t);
    ctx.drawImage(this.vignette, 0, 0);
    if (opts.memory) this.drawMemoryFilter(ctx, t);
  },
  /* ---- the memory filter (the Interlude spar, FightSession.memory): the scene drawn as a flashback while staying flat
     2D. Colour drained toward a warm sepia, a soft warm vignette, and a few violet memory flecks drifting up. ---- */
  memVignette: null,
  drawMemoryFilter(ctx, t) {
    if (!this.memVignette) this.memVignette = makeLayer(W, H, (g) => {
      const v = g.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H / 2, H * 0.92);
      v.addColorStop(0, 'rgba(60,36,18,0)'); v.addColorStop(0.7, 'rgba(60,36,18,0.22)'); v.addColorStop(1, 'rgba(34,20,10,0.72)');
      g.fillStyle = v; g.fillRect(0, 0, W, H);
    });
    ctx.save();
    ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'color'; ctx.fillStyle = 'rgba(178,134,84,0.32)'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.memVignette, 0, 0);
    // violet memory flecks: a handful at a time, each fading in and out as it drifts up
    for (let i = 0; i < 16; i++) {
      const life = 5 + (i * 1.37) % 3, u = ((t + i * 0.83) % life) / life;
      const x = (i * 263.7 + Math.sin(t * 0.4 + i) * 30) % W, y = H - u * (H + 60) + ((i * 97) % 120);
      const a = Math.sin(u * Math.PI) * (0.35 + 0.25 * Math.sin(t * 3 + i)), sz = 1.5 + (i % 3);
      ctx.fillStyle = `rgba(185,160,255,${Math.max(0, a)})`; ctx.beginPath(); ctx.ellipse(x, y, sz * 1.6, sz, t + i, 0, TAU); ctx.fill();
    }
    ctx.restore();
  },

  /* ---- live fight ---- */
  drawFight(s, realT) {
    const ctx = this.ctx, fx = s.fx, cam = s.cam, env = s.env, set = SaveManager.data.settings;
    const zoom = cam.zoom * (1 + fx.zoomPunch);
    const imp = fx.impact;
    const impactPhase = imp && imp.t < imp.dur ? (imp.t < Math.min(0.035, imp.dur * 0.45) ? 1 : 2) : 0;
    const toScreen = (x, y) => ({ x: W / 2 + (x - cam.x) * zoom + fx.shakeX, y: GROUND + (y - cam.y) * zoom + fx.shakeY });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (impactPhase && !set.reduceFlash) {
      // IMPACT FRAME: a two-step inverted frame (paper -> ink) with radial focus lines and colour misregistration
      const white = impactPhase === 1;
      if (white) ctx.drawImage(this.paperTex(), 0, 0); else { ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H); }
      const sp = toScreen(imp.x, imp.y);
      // the red sun behind the blow on the paper frame, a red enso on the ink frame
      if (white) { ctx.fillStyle = C.emberBright; ctx.beginPath(); ctx.arc(sp.x, sp.y, 150 + imp.tier * 20, 0, TAU); ctx.fill(); }
      this.focusLines(ctx, sp.x, sp.y, white ? C.ink : C.emberBright, white ? 0.92 : 0.8, 40);
      if (!white) { ctx.globalAlpha = 0.9; ensoStroke(ctx, sp.x, sp.y, 175, C.emberBright, 1, 2.2, 30); ctx.globalAlpha = 1; }
      ctx.save(); this.worldTransform(ctx, s, zoom);
      ctx.fillStyle = white ? 'rgba(3,3,3,0.9)' : 'rgba(236,229,211,0.3)'; ctx.fillRect(cam.x - 2000, 0, 4000, 4);
      if (!white) { ctx.save(); ctx.translate(7, 3); for (const f of s.fighters) f.draw(ctx, { color: C.emberBright, shadow: false, noEyes: true }); ctx.restore(); }
      for (const f of s.fighters) f.draw(ctx, { color: white ? C.ink : C.bone, shadow: false });
      ctx.restore();
      fx.drawScreen(ctx, toScreen);
      return;
    }
    // background
    env.back(ctx, cam.x, realT);
    this.drawFloor(ctx, env, cam.x, realT, GROUND - cam.y * zoom + fx.shakeY);
    // world
    ctx.save(); this.worldTransform(ctx, s, zoom);
    fx.drawWorldBack(ctx);
    if (s.isStretch) this.drawStretchProps(ctx, s, realT);
    for (const f of s.fighters) f.drawShadow(ctx);
    for (const f of s.fighters) this.drawAuras(ctx, f, realT);
    const order = s.fighters.slice().sort((a, b) => (a.alive ? 1 : 0) - (b.alive ? 1 : 0) || (a.isPlayer ? 1 : 0) - (b.isPlayer ? 1 : 0));
    for (const f of order) {
      if (f.unblockable && f.state === 'move' && !f.isPlayer) this.drawUnblockableGlow(ctx, f, realT);
      f.draw(ctx, { rim: env.rim, light: env.light });
      if ((f.minion || (f.clone && !f.decoy) || (s.isStretch && !f.isPlayer)) && f.alive && f.visible) this.drawMiniBar(ctx, f);
    }
    for (const f of order) this.drawTrails(ctx, f, realT);
    WeaponSystem.draw(ctx, s);
    fx.drawWorld(ctx);
    if (s.isStretch && !StoryPlayer.active) this.drawTutorial(ctx, s, realT);
    ctx.restore();
    fx.applyHaze(ctx, toScreen);
    env.front(ctx, cam.x, realT);
    if (imp && imp.t < imp.dur + 0.2) {
      // reduced-flash fallback and the after-glow of a real impact frame
      const k = clamp((imp.t - imp.dur) / 0.2, 0, 1);
      const sp = toScreen(imp.x, imp.y);
      if (set.reduceFlash && imp.t < imp.dur) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H); this.focusLines(ctx, sp.x, sp.y, C.bone, 0.18, 30); }
      else this.focusLines(ctx, sp.x, sp.y, C.bone, 0.22 * (1 - k), 30);
    }
    if (s.memory) this.drawMemoryFilter(ctx, realT);
    if (s.fightFlash > 0) { ctx.fillStyle = `rgba(210,74,60,${s.fightFlash * 0.25})`; ctx.fillRect(0, 0, W, H); }
    if (s.glitch > 0) this.drawGlitch(ctx, s.glitch, realT);
    // cinematic letterbox
    if (s.letterbox > 0.01) { const h = 70 * s.letterbox; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); }
    fx.drawScreen(ctx, toScreen);
  },
  // The City of Echoes skips as Kage crosses a seam where its street starts over (StretchSession: `glitch` seconds):
  // a few horizontal slices of the frame jump sideways, one ghosted in violet. Flat, brief, and off with reduceFlash.
  drawGlitch(ctx, k, t) {
    if (SaveManager.data.settings.reduceFlash) return;
    const n = 6, c = ctx.canvas;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < n; i++) {
      const y = ((i * 131 + ((t * 40) | 0) * 37) % H), h = 10 + ((i * 53) % 34), dx = ((i % 2) ? 1 : -1) * (12 + (i * 17) % 30) * Math.min(1, k * 4);
      ctx.drawImage(c, 0, y * c.height / H, c.width, h * c.height / H, dx, y, W, h);
    }
    ctx.fillStyle = `rgba(155,140,255,${0.12 * Math.min(1, k * 4)})`; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  },
  // the floor plane follows the camera, and its far edge sits FLOOR_DEPTH above the line the fighters stand on,
  // so they read as standing on the floor rather than balanced on its back edge
  drawFloor(ctx, env, cx, t, groundY) {
    const top = groundY - FLOOR_DEPTH;
    ctx.save(); ctx.translate(0, top); ctx.scale(1, Math.max(0.2, (H - top) / (H - GROUND))); ctx.translate(0, -GROUND);
    env.floor(ctx, cx, t);
    ctx.restore();
  },
  worldTransform(ctx, s, zoom) {
    const fx = s.fx, cam = s.cam;
    ctx.translate(W / 2 + fx.shakeX, GROUND + fx.shakeY); ctx.rotate(fx.shakeR); ctx.scale(zoom, zoom); ctx.translate(-cam.x, -cam.y);
  },
  // brush speed lines converging on the blow: thin at the centre, swelling, ragged at the frame edge
  focusLines(ctx, x, y, color, alpha, n) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
    const R = 1500;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + ((i * 7.31) % 1) * 0.12, r0 = 140 + ((i * 5.3) % 1) * 170, w = 3 + ((i * 3.7) % 1) * 11;
      const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, rm = r0 + (R - r0) * 0.3;
      ctx.beginPath(); ctx.moveTo(x + ca * r0, y + sa * r0);
      ctx.quadraticCurveTo(x + ca * rm + nx * w, y + sa * rm + ny * w, x + ca * R + nx * w * 0.5, y + sa * R + ny * w * 0.5);
      ctx.lineTo(x + ca * R - nx * w * 0.5, y + sa * R - ny * w * 0.5);
      ctx.quadraticCurveTo(x + ca * rm - nx * w, y + sa * rm - ny * w, x + ca * r0, y + sa * r0);
      ctx.fill();
    }
    ctx.restore();
  },
  // weapon / limb smears built from the real blade history, styled by element
  drawTrails(ctx, f, t) {
    const el = f.poisonBlade ? 'blood' : (f.state === 'ability' && f.abil && f.abil.el) || f.elementOf(f.move);
    VFX.drawSmear(ctx, f, f.trail, el || 'shade', t);
    VFX.drawSmear(ctx, f, f.trail2, el || 'shade', t);
  },
  drawAuras(ctx, f, t) {
    if (!f.visible || f.alpha <= 0.05 || f.decoy) return;   // a hidden fighter (Akari in her smoke) or her afterimage gives nothing away
    // glowing energy around a fighter performing a special art or a boss changing phase
    if ((f.state === 'ability' && (f.isPlayer || (f.def && (f.def.type === 'boss' || f.def.type === 'sub')))) || (f.def && f.def.type === 'boss' && f.state === 'pose')) {
      const E = ELEMENTS[f.elementOf(null) || 'ink'] || ELEMENTS.ink, c = E.glow || E.smear, cy = f.y - 100 * f.scale, R = 150 * f.scale * (1 + Math.sin(t * 9) * 0.05);
      ctx.save(); ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createRadialGradient(f.x, cy, 10, f.x, cy, R * 0.75);   // fades out inside the ellipse: no hard rim
      g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.32)`); g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(f.x, cy, R * 0.75, R, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
    if (f.aura > 0) {
      const r = 330;
      ctx.save(); ctx.translate(f.x, f.y - 100);
      ctx.strokeStyle = 'rgba(127,208,200,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([4, 10]); ctx.lineDashOffset = -t * 20;
      ctx.beginPath(); ctx.ellipse(0, 70, r, r * 0.3, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * 0.4; ctx.fillStyle = 'rgba(127,208,200,0.5)'; ctx.fillRect(Math.cos(a) * r - 2, 70 + Math.sin(a) * r * 0.3 - 2, 4, 4); }
      ctx.restore();
    }
    if (f.barrier > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createRadialGradient(f.x, f.y - 100 * f.scale, 60, f.x, f.y - 100 * f.scale, 140 * f.scale);
      g.addColorStop(0, 'rgba(127,208,200,0)'); g.addColorStop(0.85, 'rgba(127,208,200,0.18)'); g.addColorStop(1, 'rgba(127,208,200,0.45)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y - 100 * f.scale, 140 * f.scale, 0, TAU); ctx.fill();
      ctx.restore();
    }
    if (f.counterStance) {
      ctx.save(); ctx.strokeStyle = f.redline ? `rgba(255,74,60,${0.55 + Math.sin(t * 20) * 0.25})` : `rgba(127,208,200,${0.4 + Math.sin(t * 20) * 0.2})`; ctx.lineWidth = f.redline ? 4 : 3;   // Raikon's Redline guard glows red
      ctx.beginPath(); ctx.arc(f.x, f.y - 110 * f.scale, 90 * f.scale, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke(); ctx.restore();
    }
  },
  drawUnblockableGlow(ctx, f, t) {
    ctx.save(); ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(f.sk.wt.x, f.sk.wt.y, 0, f.sk.wt.x, f.sk.wt.y, 70);
    g.addColorStop(0, `rgba(255,90,40,${0.5 + Math.sin(t * 30) * 0.2})`); g.addColorStop(1, 'rgba(255,90,40,0)');
    ctx.fillStyle = g; ctx.fillRect(f.sk.wt.x - 70, f.sk.wt.y - 70, 140, 140); ctx.restore();
  },
  // Stretch set dressing in world space: clue pickups, the encounter walls (left edge and gate) and the road's end.
  drawStretchProps(ctx, s, t) {
    const L = s.stretch, cam = s.cam, half = W / 2 / cam.zoom + 200, vl = cam.x - half, vr = cam.x + half;
    // set dressing (Logic.streetProps: the stretch's `props` and its repeating street block, if any)
    // seams (where a repeating street starts over) tear through whatever stands on them, so they draw last
    const street = s.street || L.props || [];
    for (const pr of street) if (pr.type !== 'seam' && pr.x > vl - 300 && pr.x < vr + 300) this.drawProp(ctx, pr, t, s);
    for (const pr of street) if (pr.type === 'seam' && pr.x > vl - 300 && pr.x < vr + 300) this.drawProp(ctx, pr, t, s);
    // the memory-ash trail (stretch `ashTrail`): a faint violet smear on the road once the way is clear
    const A = L.ashTrail;
    if (A && s.cleared >= L.encounters.length && A.to > vl && A.from < vr) {
      const g = ctx.createLinearGradient(A.from, 0, A.to, 0);
      g.addColorStop(0, 'rgba(155,140,255,0)'); g.addColorStop(0.15, 'rgba(155,140,255,0.22)'); g.addColorStop(1, 'rgba(155,140,255,0.08)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse((A.from + A.to) / 2, 2, (A.to - A.from) / 2, 7, 0, 0, TAU); ctx.fill();
      for (let x = A.from + 30; x < A.to; x += 70) {
        if (x < vl || x > vr) continue;
        ctx.fillStyle = `rgba(201,189,255,${0.25 + 0.2 * Math.sin(t * 3 + x * 0.05)})`; ctx.fillRect(x + Math.sin(x) * 14, -2, 4, 3);
      }
    }
    // clues: a paper talisman bobbing over a faint gold glow; found ones fade away
    for (const c of s.clues) {
      if (c.x < vl || c.x > vr) continue;
      const a = c.found ? Math.max(0, 1 - c.got * 1.5) : 1;
      if (a <= 0) continue;
      const y = -70 + Math.sin(t * 2.2 + c.ph) * 8 - (c.found ? c.got * 80 : 0);
      ctx.save(); ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(c.x, y, 0, c.x, y, 60); g.addColorStop(0, 'rgba(201,164,92,0.45)'); g.addColorStop(1, 'rgba(201,164,92,0)');
      ctx.fillStyle = g; ctx.fillRect(c.x - 60, y - 60, 120, 120);
      ctx.translate(c.x, y); ctx.rotate(Math.sin(t * 1.7 + c.ph) * 0.12);
      ctx.fillStyle = C.bone; ctx.fillRect(-11, -20, 22, 40);
      ctx.fillStyle = C.ember; ctx.fillRect(-7, -14, 14, 3); ctx.fillRect(-2, -9, 4, 20);
      ctx.restore();
      ctx.fillStyle = `rgba(201,164,92,${0.25 * a})`; ctx.beginPath(); ctx.ellipse(c.x, 0, 26, 5, 0, 0, TAU); ctx.fill();
    }
    // encounter walls: shimmering ink-and-ember barriers at both edges of a locked arena; the next closed gate ahead
    const walls = [];
    if (s.encounter) walls.push({ x: s.encounter.l, on: 1 }, { x: s.encounter.gate, on: 1 });
    else if (s.bounds.r < s.level.r) walls.push({ x: s.bounds.r, on: 0.35 });
    for (const w of walls) {
      if (w.x < vl || w.x > vr || w.x <= s.level.l) continue;
      ctx.save();
      const g = ctx.createLinearGradient(w.x - 40, 0, w.x + 40, 0);
      g.addColorStop(0, 'rgba(210,74,60,0)'); g.addColorStop(0.5, `rgba(210,74,60,${0.28 * w.on})`); g.addColorStop(1, 'rgba(210,74,60,0)');
      ctx.fillStyle = g; ctx.fillRect(w.x - 40, -420, 80, 420);
      ctx.strokeStyle = `rgba(255,120,80,${(0.45 + Math.sin(t * 6 + w.x) * 0.15) * w.on})`; ctx.lineWidth = 2;
      ctx.beginPath(); for (let y = 0; y > -420; y -= 14) ctx.lineTo(w.x + Math.sin(y * 0.05 + t * 5) * 5, y); ctx.stroke();
      // ofuda seals on a rope
      ctx.fillStyle = `rgba(236,229,211,${0.85 * Math.max(0.4, w.on)})`;
      for (let k = 0; k < 3; k++) ctx.fillRect(w.x - 6, -330 + k * 90 + Math.sin(t * 2 + k) * 3, 12, 26);
      ctx.restore();
    }
    // the road's end: a torii gate
    const ex = L.length - 40;
    if (ex > vl - 200 && ex < vr + 200) {
      ctx.fillStyle = C.ink;
      ctx.fillRect(ex - 110, -260, 16, 260); ctx.fillRect(ex + 94, -260, 16, 260); ctx.fillRect(ex - 120, -215, 240, 12);
      ctx.beginPath(); ctx.moveTo(ex - 150, -262); ctx.quadraticCurveTo(ex, -240, ex + 150, -262); ctx.lineTo(ex + 140, -280); ctx.quadraticCurveTo(ex, -262, ex - 140, -280); ctx.fill();
      ctx.fillStyle = C.ember; ctx.fillRect(ex - 120, -262, 240, 4);
    }
  },
  // One stretch prop, standing on the road at pr.x (world units, y = 0 is the ground).
  drawProp(ctx, pr, t, s) {
    const x = pr.x, ink = '#0c0a0a';
    ctx.save(); ctx.fillStyle = ink; ctx.strokeStyle = 'rgba(214,120,96,0.22)'; ctx.lineWidth = 2;
    if (pr.type === 'house') {
      // a burnt-out house: four charred posts, a broken lintel, a roof with a hole burnt through it
      for (const px of [-150, -60, 60, 150]) ctx.fillRect(x + px - 7, -230 + Math.abs(px) * 0.08, 14, 230);
      ctx.fillRect(x - 160, -200, 210, 10); ctx.fillRect(x + 80, -192, 80, 9);
      ctx.beginPath(); ctx.moveTo(x - 200, -222); ctx.quadraticCurveTo(x - 20, -300, x + 200, -226);
      ctx.lineTo(x + 182, -206); ctx.lineTo(x + 70, -228); ctx.lineTo(x + 40, -262); ctx.lineTo(x + 6, -232); ctx.lineTo(x - 182, -204); ctx.closePath(); ctx.fill(); ctx.stroke();
      // a lone frame still hanging inside, and scorched paper screens
      ctx.fillStyle = 'rgba(236,229,211,0.07)'; ctx.fillRect(x - 52, -180, 100, 150);
      ctx.fillStyle = 'rgba(201,164,92,0.35)'; ctx.fillRect(x - 12, -150, 24, 18);
    } else if (pr.type === 'shrine') {
      // a small roadside hokora on a post; a recorder's red light blinks inside
      ctx.fillRect(x - 5, -90, 10, 90);
      ctx.fillRect(x - 30, -140, 60, 50);
      ctx.beginPath(); ctx.moveTo(x - 44, -136); ctx.quadraticCurveTo(x, -170, x + 44, -136); ctx.lineTo(x + 38, -128); ctx.lineTo(x - 38, -128); ctx.closePath(); ctx.fill(); ctx.stroke();
      const on = Math.sin(t * 5) > 0;
      ctx.fillStyle = on ? 'rgba(255,74,60,0.95)' : 'rgba(120,30,26,0.8)'; ctx.fillRect(x - 3, -118, 6, 6);
      if (on) { const g = ctx.createRadialGradient(x, -115, 0, x, -115, 26); g.addColorStop(0, 'rgba(255,74,60,0.35)'); g.addColorStop(1, 'rgba(255,74,60,0)'); ctx.fillStyle = g; ctx.fillRect(x - 26, -141, 52, 52); }
    } else if (pr.type === 'edict') {
      // an Order notice board: two posts, a roofed board pasted over with notices, each stamped with the Order mark
      ctx.fillRect(x - 70, -170, 8, 170); ctx.fillRect(x + 62, -170, 8, 170);
      ctx.fillRect(x - 80, -175, 160, 100);
      ctx.beginPath(); ctx.moveTo(x - 96, -172); ctx.quadraticCurveTo(x, -200, x + 96, -172); ctx.lineTo(x + 90, -164); ctx.lineTo(x - 90, -164); ctx.closePath(); ctx.fill(); ctx.stroke();
      const notes = [[-66, -158, 38, 50], [-20, -162, 34, 44], [20, -156, 40, 52], [-44, -112, 30, 30], [8, -106, 44, 26]];
      for (const [nx, ny, nw, nh] of notes) {
        ctx.fillStyle = 'rgba(214,206,186,0.42)'; ctx.fillRect(x + nx, ny, nw, nh);
        ctx.strokeStyle = 'rgba(30,32,36,0.8)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(x + nx + nw / 2, ny + nh * 0.45, 5, 0, TAU); ctx.moveTo(x + nx + nw / 2 - 3, ny + nh * 0.45); ctx.lineTo(x + nx + nw / 2 + 3, ny + nh * 0.45); ctx.stroke();
      }
    } else if (pr.type === 'barricade') {
      // an Order checkpoint barricade: crossed timbers, a slate banner with the Order mark, a lantern on a pole
      for (const sgn of [-1, 1]) { ctx.save(); ctx.translate(x + sgn * 40, -40); ctx.rotate(sgn * 0.5); ctx.fillRect(-8, -60, 16, 120); ctx.restore(); }
      ctx.fillRect(x - 110, -66, 220, 12);
      ctx.fillStyle = '#2a2f36'; ctx.fillRect(x - 30, -150, 60, 84);
      ctx.strokeStyle = 'rgba(196,200,204,0.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, -118, 11, 0, TAU); ctx.moveTo(x - 7, -118); ctx.lineTo(x + 7, -118); ctx.stroke();
      ctx.fillStyle = ink; ctx.fillRect(x + 96, -200, 6, 200);
      const ly = -186 + Math.sin(t * 1.5 + x) * 2, g = ctx.createRadialGradient(x + 99, ly, 0, x + 99, ly, 30);
      g.addColorStop(0, 'rgba(210,74,60,0.4)'); g.addColorStop(1, 'rgba(210,74,60,0)'); ctx.fillStyle = g; ctx.fillRect(x + 69, ly - 30, 60, 60);
      ctx.fillStyle = '#b8392d'; ctx.beginPath(); ctx.ellipse(x + 99, ly, 7, 10, 0, 0, TAU); ctx.fill();
    } else if (pr.type === 'echo_house') {
      // the City of Echoes: a whole townhouse, as somebody remembered it. Two storeys, warm paper windows, a noren
      // over the door, a tiled roof (alt: a gabled one); every copy is the same house. `unfinished`: its far half is
      // only an outline, the memory never filled in.
      const w = 300, h = 250, unf = pr.unfinished;
      ctx.fillRect(x - w / 2, -h, unf ? w / 2 : w, h);
      if (unf) { ctx.save(); ctx.strokeStyle = 'rgba(185,168,255,0.45)'; ctx.setLineDash([7, 6]); ctx.lineDashOffset = -t * 14; ctx.strokeRect(x, -h, w / 2, h); ctx.beginPath(); ctx.moveTo(x, -h * 0.55); ctx.lineTo(x + w / 2, -h * 0.55); ctx.stroke(); ctx.restore(); }
      ctx.fillStyle = ink; ctx.fillRect(x - w / 2 - 14, -h * 0.55, w + 28, 10);   // the eave between the storeys
      ctx.beginPath();
      if (pr.alt) { ctx.moveTo(x - w / 2 - 30, -h); ctx.lineTo(x, -h - 90); ctx.lineTo(x + w / 2 + 30, -h); }
      else { ctx.moveTo(x - w / 2 - 36, -h + 4); ctx.quadraticCurveTo(x, -h - 60, x + w / 2 + 36, -h + 4); ctx.lineTo(x + w / 2 + 20, -h - 26); ctx.lineTo(x - w / 2 - 20, -h - 26); }
      ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(185,168,255,0.28)'; ctx.stroke();
      const win = (wx, wy, ww, wh) => { ctx.fillStyle = 'rgba(214,178,120,0.42)'; ctx.fillRect(wx, wy, ww, wh); ctx.strokeStyle = 'rgba(12,10,10,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke(); };
      win(x - 120, -h + 36, 70, 52); if (!unf) win(x + 50, -h + 36, 70, 52);
      win(x - 120, -h * 0.42, 60, 46);
      // the noren curtain over the door, split in three
      ctx.fillStyle = '#4a3b86'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 36 + i * 26, -h * 0.5, 22, 50 + Math.sin(t * 1.1 + i) * 2);
      ctx.fillStyle = 'rgba(12,10,10,0.85)'; ctx.fillRect(x - 36, -h * 0.5 + 54, 74, h * 0.5 - 54);
    } else if (pr.type === 'lantern_post') {
      // a street lantern on a post. Every lantern in the City swings at exactly the same angle, in no wind.
      ctx.fillRect(x - 4, -230, 8, 230); ctx.fillRect(x - 4, -230, 46, 6);
      const sw = Math.sin(t * 1.2) * 0.18;
      ctx.save(); ctx.translate(x + 38, -224); ctx.rotate(sw);
      const g = ctx.createRadialGradient(0, 30, 0, 0, 30, 46); g.addColorStop(0, 'rgba(201,189,255,0.35)'); g.addColorStop(1, 'rgba(201,189,255,0)');
      ctx.fillStyle = g; ctx.fillRect(-46, -16, 92, 92);
      ctx.strokeStyle = 'rgba(58,52,43,0.9)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 14); ctx.stroke();
      ctx.fillStyle = '#d8c9a0'; ctx.beginPath(); ctx.ellipse(0, 32, 12, 18, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = ink; ctx.fillRect(-8, 12, 16, 4); ctx.fillRect(-8, 48, 16, 4);
      ctx.restore();
    } else if (pr.type === 'sign') {
      // a hanging shop sign on a bracket post. Its board reads whatever the City remembers right now: the text only ever
      // changes while the sign is off screen (Logic.signStep / signText; StretchSession.updateSigns keeps the state).
      const text = Logic.signText(pr, s && s.signs ? s.signs[pr.id] : null);
      ctx.fillRect(x - 5, -250, 10, 250); ctx.fillRect(x - 5, -250, 130, 7);
      ctx.strokeStyle = 'rgba(58,52,43,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 4 + 18, -243); ctx.lineTo(x + 18, -226); ctx.moveTo(x + 114, -243); ctx.lineTo(x + 114, -226); ctx.stroke();
      ctx.font = `600 22px ${FU}`;
      const bw = Math.max(170, ctx.measureText(text).width + 34), bx = x + 66 - bw / 2;
      ctx.fillStyle = '#1b1722'; ctx.fillRect(bx, -226, bw, 46);
      ctx.strokeStyle = 'rgba(201,189,255,0.55)'; ctx.lineWidth = 2; ctx.strokeRect(bx + 3, -223, bw - 6, 40);
      ctx.fillStyle = '#ece5d3'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 66, -202);
      // a thin violet scanline drifting over the board
      const sy = -226 + wrapX(t * 30, 46); ctx.fillStyle = 'rgba(185,168,255,0.22)'; ctx.fillRect(bx, sy, bw, 2);
    } else if (pr.type === 'seam') {
      // where the street starts over: a vertical tear in the reconstruction, sliced and misregistered, flickering
      const h = 470;
      for (let y = 0; y > -h; y -= 18) {
        const k = Math.sin(y * 0.37 + t * 9) * Math.sin(y * 0.11 - t * 3), dx = k * 14, on = k > -0.3;
        if (!on) continue;
        ctx.fillStyle = 'rgba(185,168,255,0.55)'; ctx.fillRect(x - 6 + dx, y - 14, 12, 12);
        ctx.fillStyle = 'rgba(236,229,211,0.25)'; ctx.fillRect(x - 2 + dx * 1.6, y - 10, 3, 6);
        ctx.fillStyle = 'rgba(210,74,60,0.2)'; ctx.fillRect(x + 4 - dx * 0.8, y - 13, 3, 10);
      }
      const g = ctx.createLinearGradient(x - 70, 0, x + 70, 0);
      g.addColorStop(0, 'rgba(155,140,255,0)'); g.addColorStop(0.5, `rgba(155,140,255,${0.12 + 0.06 * Math.sin(t * 7)})`); g.addColorStop(1, 'rgba(155,140,255,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 70, -h, 140, h);
    } else if (pr.type === 'collapsed') {
      // a fallen house: beams in a heap across the road's edge
      ctx.save(); ctx.translate(x - 60, -8); ctx.rotate(-0.22); ctx.fillRect(-90, -9, 200, 16); ctx.restore();
      ctx.save(); ctx.translate(x + 30, -20); ctx.rotate(0.35); ctx.fillRect(-70, -7, 150, 13); ctx.restore();
      ctx.beginPath(); ctx.moveTo(x - 140, 0); ctx.lineTo(x - 90, -46); ctx.lineTo(x - 30, -30); ctx.lineTo(x + 40, -64); ctx.lineTo(x + 120, -20); ctx.lineTo(x + 150, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = `rgba(230,110,70,${0.35 + 0.25 * Math.sin(t * 4 + x)})`; ctx.fillRect(x - 20, -26, 4, 3); ctx.fillRect(x + 60, -18, 3, 3);
    }
    ctx.restore();
  },
  // Tutorial prompts (StretchSession.updateTutorial): a paper slip drifting above Kage with the verb and the keys of
  // the input device in use; a cleared prompt flashes gold, crosses out and floats away.
  drawTutorial(ctx, s, t) {
    const T = s.tut;
    if (!T || T.x == null) return;
    const dev = s.inputDevice(), list = [];
    if (T.cur) list.push({ step: T.cur.step, a: clamp(T.showT * 3, 0, 1), done: 0, rise: 0 });
    if (T.cleared) list.push({ step: T.cleared.step, a: 1 - clamp((T.cleared.t - 0.45) / 0.7, 0, 1), done: 1, rise: T.cleared.t * 50 });
    const baseY = s.player.y - s.player.height() - 120;
    for (const it of list) {
      const lab = Logic.tutorialLabel(it.step, dev);
      if (!lab || it.a <= 0) continue;
      ctx.save(); ctx.globalAlpha = it.a;
      ctx.font = `30px ${FB}`; const vw = ctx.measureText(lab.verb).width;
      ctx.font = `600 22px ${FU}`;
      const caps = lab.keys.map(k => ({ k, w: Math.max(34, ctx.measureText(k).width + 18) }));
      const capsW = caps.reduce((n, c) => n + c.w, 0) + (caps.length - 1) * 22;
      ctx.font = `500 16px ${FU}`; const hw = ctx.measureText(lab.hint).width;
      const w = Math.max(vw + 24 + capsW, hw) + 40, h = 74, y = baseY - it.rise - h;
      const half = W / 2 / s.cam.zoom, x = clamp(T.x - w / 2, s.cam.x - half + 24, s.cam.x + half - w - 24);   // stays on screen
      // the paper slip, a red seal and a thin ink border
      ctx.fillStyle = it.done ? 'rgba(201,164,92,0.94)' : 'rgba(236,229,211,0.93)';
      ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 3, y + h); ctx.lineTo(x + 2, y + h - 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.ember; ctx.fillRect(x - 6, y + 10, 6, h - 22);
      ctx.fillStyle = C.ink; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.font = `30px ${FB}`; ctx.fillText(lab.verb, x + 20, y + 28);
      let cx = x + 20 + vw + 24;
      for (let i = 0; i < caps.length; i++) {
        const c = caps[i];
        ctx.fillStyle = C.ink;
        if (dev === 'keyboard') ctx.fillRect(cx, y + 12, c.w, 32);
        else { ctx.beginPath(); ctx.ellipse(cx + c.w / 2, y + 28, c.w / 2, 16, 0, 0, TAU); ctx.fill(); }
        ctx.fillStyle = C.bone; ctx.font = `600 22px ${FU}`; ctx.textAlign = 'center'; ctx.fillText(c.k, cx + c.w / 2, y + 29);
        ctx.textAlign = 'left'; cx += c.w;
        if (i < caps.length - 1) { ctx.fillStyle = C.ink; ctx.fillText('/', cx + 6, y + 29); cx += 22; }
      }
      ctx.fillStyle = 'rgba(3,3,3,0.7)'; ctx.font = `500 16px ${FU}`; ctx.fillText(lab.hint, x + 20, y + 58);
      if (it.done) { ctx.strokeStyle = C.ember; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 14, y + 30); ctx.lineTo(x + 20 + vw + 8, y + 26); ctx.stroke(); }
      ctx.restore();
    }
  },
  drawMiniBar(ctx, f) {
    const w = 60, x = f.x - w / 2, y = f.y - f.height() - 18;
    ctx.fillStyle = 'rgba(3,3,3,0.8)'; ctx.fillRect(x - 1, y - 1, w + 2, 6);
    ctx.fillStyle = C.emberBright; ctx.fillRect(x, y, w * clamp(f.hp / f.maxHp, 0, 1), 4);
  }
};
