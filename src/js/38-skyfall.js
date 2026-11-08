/* KAGE — Skyfall's effect (Raikon's far-range move, BOSS_ABILITIES.skyfall in 40-ai.js; numbers: RAIKON_SKYFALL).
   The beats: (1) he raises his hand; (2) a lightning mark opens on the floor under his foe and follows them; (3) a dark
   storm cloud gathers above it, lit from inside; the mark locks; (4) the bolt falls from the cloud onto the mark;
   (5) a foe it catches is electrified; (6) the electricity dissipates, the cloud breaks up, the floor smokes.
   Purely visual: the ability deals the damage and decides whether the foe was hit (handle.zap). */

// fx.skyfallCast({ target, lockT, strikeT, color, scale }): starts one cast and returns its handle.
//   target   the fighter the mark follows until lockT (seconds); strikeT: when the bolt lands on the mark
//   handle   { x (the mark's world x), locked, struck, zap (set > 0 by the ability: seconds the target is electrified) }
Object.assign(Effects.prototype, {
  skyfalls() { return this._sf || (this._sf = []); },
  skyfallCast(o) {
    const h = { target: o.target, x: o.target ? o.target.x : o.x, t: 0, lockT: o.lockT, strikeT: o.strikeT, col: hexRgb(o.color || '#ff3b2f'),
      hex: o.color || '#ff3b2f', s: o.scale || 1, locked: false, struck: false, zap: 0, trees: null, seed: (Math.random() * 99999) | 0, spin: Math.random() * TAU };
    this.skyfalls().push(h);
    return h;
  },
  updateSkyfall(realDt, dt) {
    const L = this.skyfalls();
    for (let i = L.length - 1; i >= 0; i--) {
      const h = L[i]; h.t += dt;
      // the mark follows the foe until it locks
      if (!h.locked && h.target && h.target.alive) h.x = h.target.x;
      if (!h.locked && h.t >= h.lockT) { h.locked = true; AudioManager.play('orb', { pitch: 0.55 }); }
      // light rising off the mark while it waits
      if (!h.struck && Math.random() < (h.locked ? 0.7 : 0.4)) this.part({ x: h.x + rand(-60, 60) * h.s, y: -2, vx: rand(-10, 10), vy: rand(-260, -120), life: rand(0.18, 0.36), size: rand(1, 2.2), color: h.hex, type: 'spark', grav: -60, drag: 1.5, add: true });
      // flickers inside the gathering cloud
      if (!h.struck && h.top != null && Math.random() < 0.18) {
        const cx = h.x, cy = h.top, r = 150 * h.s * this._sfGrow(h);
        const a = rand(0, TAU), b = a + rand(0.6, 1.6);
        this.lightning(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.3, cx + Math.cos(b) * r * 0.7, cy + Math.sin(b) * r * 0.22, { w: 1.2, branches: 1, dur: 0.07, color: h.hex });
      }
      if (!h.struck && h.t >= h.strikeT) {
        h.struck = true;
        // the strike: arena light, a hard camera kick, thunder, the burst of arcs out of the impact
        this.stormLight(h.x, 1.2, h.col);
        this.shake(0.65);
        AudioManager.play('slam'); AudioManager.play('rumble', { pitch: 0.7 });
        for (let k = 0; k < 9; k++) {
          const side = k % 2 ? 1 : -1, len = rand(50, 170) * h.s;
          this.lightning(h.x, -4, h.x + side * len, -rand(10, 150) * h.s, { w: 1.6, branches: 2, dur: rand(0.1, 0.22), color: h.hex });
        }
        for (let k = 0; k < 26; k++) this.part({ x: h.x + rand(-20, 20), y: -6, vx: rand(-420, 420), vy: rand(-520, -120), life: rand(0.25, 0.6), size: rand(1.2, 2.8), color: chance(0.6) ? h.hex : '#ffffff', type: 'spark', grav: 700, drag: 1.2, add: true });
        this.dust(h.x, 0, 14);
      }
      // the foe it caught crackles: arcs between their joints, sparks off the body
      if (h.zap > 0) {
        h.zap -= dt;
        const f = h.target;
        if (f && f.sk && Math.random() < 0.55) {
          const j = ['hip', 'neck', 'head', 'sh', 'fel', 'fha', 'bel', 'bha', 'fkn', 'bkn', 'fft', 'bft'];
          const a = f.sk[j[(Math.random() * j.length) | 0]], b = f.sk[j[(Math.random() * j.length) | 0]];
          if (a && b && a !== b) this.lightning(a.x, a.y, b.x + rand(-8, 8), b.y + rand(-8, 8), { w: 1.1, branches: 1, dur: 0.06, color: h.hex });
          this.part({ x: f.x + rand(-24, 24) * f.scale, y: f.y - rand(10, 190) * f.scale, vx: rand(-90, 90), vy: rand(-140, 40), life: rand(0.12, 0.3), size: rand(1, 2), color: chance(0.5) ? h.hex : '#ffffff', type: 'spark', grav: 0, drag: 3, add: true });
        }
      }
      // the aftermath: smoke and dying sparks rising off the scorched mark
      const after = h.t - h.strikeT;
      if (h.struck && after < 0.8 && Math.random() < 0.5) this.part({ x: h.x + rand(-40, 40) * h.s, y: -4, vx: rand(-20, 20), vy: rand(-90, -40), life: rand(0.5, 0.9), size: rand(2, 4), color: chance(0.7) ? 'rgba(110,60,58,0.35)' : h.hex, type: chance(0.7) ? 'dot' : 'spark', grav: -20, drag: 1, add: false });
      if (after > 1.4 && h.zap <= 0) L.splice(i, 1);
    }
  },
  // how far the cloud has gathered (0..1): it builds from the cast to the strike, then breaks up
  _sfGrow(h) {
    if (!h.struck) return Ease.outCubic(clamp(h.t / Math.max(0.05, h.strikeT * 0.85), 0, 1));
    return 1 + (h.t - h.strikeT) * 0.25;
  },

  // world space, under the fighters: the mark on the floor, its rising light, then the scorch
  drawSkyfallGround(ctx) {
    const L = this._sf; if (!L || !L.length) return;
    const T = this.time;
    ctx.save();
    for (const h of L) {
      const R = 78 * h.s, after = h.t - h.strikeT;
      if (h.struck) {
        // the scorch: a burnt ellipse, a blue-white glow cooling out of it
        const k = clamp(after / 1.2, 0, 1);
        ctx.fillStyle = `rgba(14,5,5,${0.6 * (1 - k)})`; ctx.beginPath(); ctx.ellipse(h.x, 1, R * 1.1, R * 0.24, 0, 0, TAU); ctx.fill();
        if (after < 0.5) { const g = 1 - after / 0.5; ctx.fillStyle = stormRgb(h.col, 0.55 * g); ctx.beginPath(); ctx.ellipse(h.x, 0, R * 0.8, R * 0.17, 0, 0, TAU); ctx.fill(); }
        continue;
      }
      const open = Ease.outCubic(clamp(h.t / 0.15, 0, 1)), lock = h.locked ? 1 : 0;
      const pulse = 0.7 + 0.3 * Math.sin(T * (h.locked ? 46 : 18));
      // the glow pooled in the circle
      ctx.save(); ctx.translate(h.x, 0); ctx.scale(1, 0.22);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * open);
      g.addColorStop(0, stormRgb(h.col, (0.35 + 0.25 * lock) * pulse)); g.addColorStop(1, stormRgb(h.col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * open, 0, TAU); ctx.fill();
      ctx.restore();
      // the two rings: the outer one tightening slightly as the strike nears
      const tight = 1 - 0.12 * clamp((h.t - h.lockT) / Math.max(0.05, h.strikeT - h.lockT), 0, 1) * lock;
      ctx.lineWidth = 2.6; ctx.strokeStyle = stormRgb(h.col, 0.9 * pulse * open);
      ctx.beginPath(); ctx.ellipse(h.x, 0, R * open * tight, R * 0.22 * open * tight, 0, 0, TAU); ctx.stroke();
      ctx.lineWidth = 1.4; ctx.strokeStyle = `rgba(255,226,216,${0.8 * pulse * open})`;
      ctx.beginPath(); ctx.ellipse(h.x, 0, R * 0.62 * open, R * 0.136 * open, 0, 0, TAU); ctx.stroke();
      // light rising off the circle in thin vertical streaks
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 11; k++) {
        const u = (k / 10) * 2 - 1, x = h.x + u * R * 0.9 * open, y = Math.sqrt(Math.max(0, 1 - u * u)) * R * 0.2 * (k % 2 ? 1 : -1);
        const hgt = (50 + 90 * (0.5 + 0.5 * Math.sin(T * 9 + k * 1.7)) * (1 - 0.5 * Math.abs(u))) * h.s * open * (1 + 0.5 * lock);
        const lg = ctx.createLinearGradient(0, y, 0, y - hgt);
        lg.addColorStop(0, stormRgb(h.col, 0.75)); lg.addColorStop(1, stormRgb(h.col, 0));
        ctx.fillStyle = lg; ctx.fillRect(x - 1.4, y - hgt, 2.8, hgt);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  },
  // world space, over the fighters: the storm cloud at the top of the frame (`top`: its world y), then the bolt
  drawSkyfallWorld(ctx, top) {
    const L = this._sf; if (!L || !L.length) return;
    const T = this.time;
    ctx.save();
    for (const h of L) {
      h.top = top;
      const grow = this._sfGrow(h), after = h.t - h.strikeT;
      const fade = h.struck ? clamp(1 - (after - 0.25) / 0.9, 0, 1) : 1;
      if (fade <= 0) continue;
      const cx = h.x, cy = top, RX = 170 * h.s * grow, RY = 44 * h.s * grow;
      // the cloud: a dark ring of churning puffs round an eye, lit blue from inside
      ctx.save(); ctx.globalAlpha = fade;
      const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, RX);
      inner.addColorStop(0, stormRgb(h.col, h.struck && after < 0.3 ? 0.75 : 0.4)); inner.addColorStop(0.45, stormRgb(h.col, 0.12)); inner.addColorStop(1, stormRgb(h.col, 0));
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, RY / RX); ctx.translate(-cx, -cy);
      ctx.fillStyle = inner; ctx.beginPath(); ctx.arc(cx, cy, RX * 1.15, 0, TAU); ctx.fill(); ctx.restore();
      const N = 14, rot = h.spin + T * 0.9;
      for (let k = 0; k < N; k++) {
        const a = rot + (k / N) * TAU, rr = 0.78 + 0.22 * Math.sin(k * 2.3 + h.seed);
        const px = cx + Math.cos(a) * RX * rr, py = cy + Math.sin(a) * RY * rr, pr = (34 + 16 * Math.sin(k * 1.9 + h.seed)) * h.s * grow;
        ctx.fillStyle = `rgba(30,8,10,0.92)`; ctx.beginPath(); ctx.ellipse(px, py, pr, pr * 0.5, a * 0.3, 0, TAU); ctx.fill();
        // the puff's underside catching the light below it
        ctx.strokeStyle = stormRgb(h.col, 0.55 + 0.35 * Math.sin(T * 13 + k)); ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.ellipse(px, py, pr, pr * 0.5, a * 0.3, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
      }
      // the eye of the vortex
      ctx.fillStyle = 'rgba(12,3,4,0.95)'; ctx.beginPath(); ctx.ellipse(cx, cy, RX * 0.42, RY * 0.38, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = stormRgb(h.col, 0.8); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(cx, cy, RX * 0.46, RY * 0.42, 0, 0, TAU); ctx.stroke();
      ctx.restore();
      // the bolt: one thick column from the eye of the cloud to the mark, flickering through its re-strikes
      if (h.struck && after < STORM.boltDur) {
        if (!h.trees) { h.trees = []; for (let k = 0; k < 3; k++) h.trees.push(boltTree(cx + rand(-30, 30), cy, h.x, 0, prng(h.seed + k * 7919), 6 - k)); }
        const fl = stormFlicker(after), st = after < 0.05 ? 0 : after < 0.13 ? 1 : 2;
        if (fl > 0.05) {
          ctx.lineCap = 'round'; ctx.lineJoin = 'miter';
          strokeBolt(ctx, h.trees[st], 5.5 * h.s, h.col, fl, SKYFALL_BOLT);
          // the flash where it meets the floor
          const r = 150 * h.s, gg = ctx.createRadialGradient(h.x, -10, 0, h.x, -10, r);
          gg.addColorStop(0, `rgba(255,236,228,${0.85 * fl})`); gg.addColorStop(0.35, stormRgb(h.col, 0.5 * fl)); gg.addColorStop(1, stormRgb(h.col, 0));
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(h.x, -10, r, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
        }
      }
    }
    ctx.restore();
  }
});
// Skyfall's bolt is far heavier than a storm strike: a wide soft glow, a broad body and a white-hot core
const SKYFALL_BOLT = [['ink', 3.6, 0.7], ['glow', 18, 0.16], ['glow', 8, 0.35], ['body', 2.2, 1], ['core', 0.9, 1]];
