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
      ctx.drawImage(this.far, -260 - cx * 0.18, 0);
      ctx.fillStyle = 'rgba(40,38,48,0.35)'; ctx.fillRect(0, 380, W, 160);
      // swaying lantern strings
      const ox = -260 - cx * 0.4;
      ctx.strokeStyle = 'rgba(58,52,43,0.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); for (let i = 0; i < this.lanterns.length - 1; i++) { const a = this.lanterns[i], b = this.lanterns[i + 1]; ctx.moveTo(a.x + ox, a.y - 30); ctx.quadraticCurveTo((a.x + b.x) / 2 + ox, a.y + 10, b.x + ox, b.y - 30); } ctx.stroke();
      for (const l of this.lanterns) {
        const sw = Math.sin(t * 1.6 + l.ph) * 4, x = l.x + ox + sw, y = l.y;
        const gl = ctx.createRadialGradient(x, y, 0, x, y, 22); gl.addColorStop(0, 'rgba(210,74,60,0.35)'); gl.addColorStop(1, 'rgba(210,74,60,0)');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
        ctx.fillStyle = '#b8392d'; ctx.beginPath(); ctx.ellipse(x, y, 8, 12, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#0d0c10'; ctx.fillRect(x - 5, y - 14, 10, 3); ctx.fillRect(x - 5, y + 11, 10, 3);
      }
      ctx.drawImage(this.mid, -260 - cx * 0.55, 0);
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
      ctx.drawImage(this.far, fo, 0);
      for (const f of this.falls) {
        const x = f.x + fo + 260;
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
      const gx = 640 - 300 - cx * 0.45, gy = 236;
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
      const po = -cx * 0.7;
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
      ctx.drawImage(this.far, fo, 0);
      for (const f of this.fires) {
        const x = f.x + fo, y = f.y, fl = 1 + Math.sin(t * 9 + f.ph) * 0.12 + Math.sin(t * 23 + f.ph) * 0.06;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 110 * f.s * fl); g.addColorStop(0, 'rgba(255,170,90,0.55)'); g.addColorStop(0.4, 'rgba(210,74,60,0.25)'); g.addColorStop(1, 'rgba(210,74,60,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 120 * f.s, y - 120 * f.s, 240 * f.s, 240 * f.s);
        ctx.fillStyle = 'rgba(255,190,110,0.8)';
        for (let i = 0; i < 4; i++) { const ix = x - 18 * f.s + i * 12 * f.s, h = (26 + Math.sin(t * 12 + i + f.ph) * 10) * f.s; ctx.beginPath(); ctx.moveTo(ix - 6 * f.s, y); ctx.quadraticCurveTo(ix, y - h * 1.3, ix + 6 * f.s, y); ctx.fill(); }
        ctx.fillStyle = 'rgba(30,10,8,0.35)'; ctx.beginPath(); ctx.ellipse(x + Math.sin(t * 0.6 + f.ph) * 20, y - 120 - (t * 20 % 60), 40 * f.s, 70 * f.s, 0, 0, TAU); ctx.fill();
      }
      ctx.drawImage(this.mid, -260 - cx * 0.5, 0);
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
    for (const f of s.fighters) f.drawShadow(ctx);
    for (const f of s.fighters) this.drawAuras(ctx, f, realT);
    const order = s.fighters.slice().sort((a, b) => (a.alive ? 1 : 0) - (b.alive ? 1 : 0) || (a.isPlayer ? 1 : 0) - (b.isPlayer ? 1 : 0));
    for (const f of order) {
      if (f.unblockable && f.state === 'move' && !f.isPlayer) this.drawUnblockableGlow(ctx, f, realT);
      f.draw(ctx, { rim: env.rim, light: env.light });
      if ((f.minion || f.clone) && f.alive && f.visible) this.drawMiniBar(ctx, f);
    }
    for (const f of order) this.drawTrails(ctx, f, realT);
    WeaponSystem.draw(ctx, s);
    fx.drawWorld(ctx);
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
    if (s.fightFlash > 0) { ctx.fillStyle = `rgba(210,74,60,${s.fightFlash * 0.25})`; ctx.fillRect(0, 0, W, H); }
    // cinematic letterbox
    if (s.letterbox > 0.01) { const h = 70 * s.letterbox; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); }
    fx.drawScreen(ctx, toScreen);
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
    // glowing energy around a fighter performing a special art or a boss changing phase
    if ((f.state === 'ability' && (f.isPlayer || (f.def && f.def.type === 'boss'))) || (f.def && f.def.type === 'boss' && f.state === 'pose')) {
      const E = ELEMENTS[f.elementOf(null) || 'ink'] || ELEMENTS.ink, c = E.glow || E.smear, cy = f.y - 100 * f.scale, R = 150 * f.scale * (1 + Math.sin(t * 9) * 0.05);
      ctx.save(); ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createRadialGradient(f.x, cy, 10, f.x, cy, R);
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
      ctx.save(); ctx.strokeStyle = `rgba(127,208,200,${0.4 + Math.sin(t * 20) * 0.2})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(f.x, f.y - 110 * f.scale, 90 * f.scale, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke(); ctx.restore();
    }
  },
  drawUnblockableGlow(ctx, f, t) {
    ctx.save(); ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(f.sk.wt.x, f.sk.wt.y, 0, f.sk.wt.x, f.sk.wt.y, 70);
    g.addColorStop(0, `rgba(255,90,40,${0.5 + Math.sin(t * 30) * 0.2})`); g.addColorStop(1, 'rgba(255,90,40,0)');
    ctx.fillStyle = g; ctx.fillRect(f.sk.wt.x - 70, f.sk.wt.y - 70, 140, 140); ctx.restore();
  },
  drawMiniBar(ctx, f) {
    const w = 60, x = f.x - w / 2, y = f.y - f.height() - 18;
    ctx.fillStyle = 'rgba(3,3,3,0.8)'; ctx.fillRect(x - 1, y - 1, w + 2, 6);
    ctx.fillStyle = C.emberBright; ctx.fillRect(x, y, w * clamp(f.hp / f.maxHp, 0, 1), 4);
  }
};
