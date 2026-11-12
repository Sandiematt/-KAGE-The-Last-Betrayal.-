/* KAGE — Akari's hazards and presence (her boss fight: BOSS_ABILITIES in 40-ai.js, numbers in AKARI_MOVES).
   Hazards are things her moves leave in the arena that keep cutting after she has moved on. Each is telegraphed
   before it can hurt, and each only hurts her opponents (Combat.area skips her own side):
     storm    Petal Storm: petals gather on the floor (a closing ring) for `delay` s, then a swirling storm `r` wide cuts
              every `tick` s for `dur` s; with `zone` set it leaves poison mist behind
     zone     poison mist on the floor: whoever stands in it is poisoned (no hit, no stagger)
     trap     a poison trap: a small caltrop that arms after `arm` s; the first foe to step within `r` sets it off
     tornado  Petal Tornado: spins up for `spin` s, then travels at `speed` (dir) for `dur` s, cutting every `tick` s
   Her presence: petals shed off her in her phase's colour (AKARI_PETALS), faster each phase; in the last phase dark
   wisps and afterimages trail her. Only the real Akari sheds petals: her Mirror of Petals copies do not. */

Object.assign(FightSession.prototype, {
  spawnHazard(h) {
    const arr = this.hazards || (this.hazards = []);
    arr.push(Object.assign({ t: 0, tickT: 0, petal: 'violet' }, h));
    return h;
  },
  stepHazards(dt) {
    AkariChain.tick(this);   // her chain and Petal Burst's petals go with the move that made them (62b-akari-chain.js)
    const arr = this.hazards; if (!arr || !arr.length) return;
    const fx = this.fx;
    for (let i = arr.length - 1; i >= 0; i--) {
      const h = arr[i], o = h.owner, col = AKARI_PETALS[h.petal] || AKARI_PETALS.violet;
      h.t += dt;
      // her hazards go with her
      if (!o || !o.alive || this.phase !== 'fight') { AkariSakura.end(h); arr.splice(i, 1); continue; }
      const foe = this.opponentOf ? this.opponentOf(o) : this.player;
      if (h.kind === 'storm') {
        // the real Akari's storm is the baked sakura spiral (63-akari-sakura.js); the canvas petals are its fallback
        const sk = AkariSakura.storm(this, h);
        if (h.t < h.delay) {
          // the gathering: petals spiralling in to the spot along the floor
          if (!sk && Math.random() < 0.6) { const a = rand(0, TAU), r = h.r * rand(0.9, 1.3); fx.part({ x: h.x + Math.cos(a) * r, y: -rand(4, 30), vx: -Math.cos(a) * r * 1.8, vy: -rand(10, 40), life: 0.45, size: rand(2.4, 3.6), color: chance(0.7) ? col[0] : col[1], type: 'ash', grav: 0, drag: 0.6, rot: rand(0, TAU), vr: rand(-8, 8) }); }
          continue;
        }
        const k = h.t - h.delay;
        if (k > h.dur) {
          if (h.zone) this.spawnHazard({ kind: 'zone', owner: o, x: h.x, r: h.r * 0.9, life: 3, petal: h.petal });
          arr.splice(i, 1); continue;
        }
        // the storm: petals whirling up round the spot
        if (!sk) for (let n = 0; n < 3; n++) { const a = rand(0, TAU), r = h.r * rand(0.2, 1); fx.part({ x: h.x + Math.cos(a) * r, y: -rand(0, 240), vx: -Math.sin(a) * 420, vy: -rand(80, 260), life: rand(0.25, 0.45), size: rand(2.4, 4), color: chance(0.6) ? col[0] : chance(0.5) ? col[1] : col[2], type: 'ash', grav: 0, drag: 1, rot: rand(0, TAU), vr: rand(-14, 14) }); }
        h.tickT -= dt;
        if (h.tickT <= 0) {
          h.tickT = h.tick;
          Combat.area(this, o, { x: h.x - h.r, y: -300, w: h.r * 2, h: 300 }, { dmg: h.dmg * o.dmgMul, kb: 90, up: -120, hs: 0.06, imp: 0, hsnd: 'slash', dir: foe ? Math.sign(foe.x - h.x) || 1 : 1 });
          if (h.t - h.delay < dt * 1.5) { fx.shake(0.18); AudioManager.play('swing', { pitch: 0.7 }); }
        }
      } else if (h.kind === 'zone') {
        if (h.t > h.life) { arr.splice(i, 1); continue; }
        if (Math.random() < 0.4) fx.part({ x: h.x + rand(-h.r, h.r), y: -rand(0, 20), vx: rand(-15, 15), vy: -rand(15, 50), life: rand(0.6, 1), size: rand(5, 9), color: chance(0.6) ? 'rgba(110,200,90,0.32)' : 'rgba(150,90,200,0.3)', type: 'puff', grav: -10, drag: 1, grow: 8 });
        h.tickT -= dt;
        if (h.tickT <= 0 && foe && foe.alive && foe.grounded && foe.invuln <= 0 && Math.abs(foe.x - h.x) < h.r) {
          h.tickT = 0.4; foe.poison = Math.max(foe.poison || 0, 1.2);
        }
      } else if (h.kind === 'trap') {
        if (h.t > h.life) { AkariSakura.play(this, o, 'sakura_veil', h.x, -30, { dir: 1, scale: 0.45 }) || fx.smokePuff(h.x, 0, { life: 0.3, radius: 22 }); arr.splice(i, 1); continue; }
        if (h.t > h.arm && foe && foe.alive && foe.grounded && foe.invuln <= 0 && Math.abs(foe.x - h.x) < h.r) {
          // sprung: a burst of poison mist and a cut from below
          Combat.area(this, o, { x: h.x - h.r, y: -160, w: h.r * 2, h: 160 }, { dmg: h.dmg * o.dmgMul, kb: 120, up: -260, hs: 0.2, imp: 1, hsnd: 'slash', stamp: 'TRAP', poison: h.poison });
          for (let n = 0; n < 16; n++) fx.part({ x: h.x + rand(-20, 20), y: -rand(0, 20), vx: rand(-160, 160), vy: -rand(60, 260), life: rand(0.5, 0.9), size: rand(5, 10), color: chance(0.6) ? 'rgba(110,200,90,0.45)' : 'rgba(150,90,200,0.4)', type: 'puff', grav: -10, drag: 2, grow: 12 });
          AudioManager.play('poison');
          AkariSakura.play(this, o, 'sakura_pillar', h.x, 0, { dir: 1, scale: 0.6 * (o.scale || 1) });   // a blade-petal pillar out of the sprung trap
          this.spawnHazard({ kind: 'zone', owner: o, x: h.x, r: h.r * 1.6, life: 2.2, petal: h.petal });
          arr.splice(i, 1); continue;
        }
      } else if (h.kind === 'tornado') {
        const sk = AkariSakura.tornado(this, h);
        if (h.t > h.spin + h.dur || h.x < this.bounds.l - 60 || h.x > this.bounds.r + 60) { AkariSakura.end(h); if (!sk) fx.smokePuff(h.x, 0, { life: 0.4, radius: 50 }); arr.splice(i, 1); continue; }
        if (h.t > h.spin) h.x += h.dir * h.speed * dt;
        if (!sk) for (let n = 0; n < 4; n++) { const y = -rand(0, 440), wy = h.w * (0.5 + 0.9 * (-y / 440)), a = rand(0, TAU); fx.part({ x: h.x + Math.cos(a) * wy, y, vx: -Math.sin(a) * 520 + h.dir * h.speed * 0.6, vy: -rand(60, 200), life: rand(0.2, 0.4), size: rand(2.4, 4.2), color: chance(0.5) ? col[0] : chance(0.5) ? col[1] : col[2], type: 'ash', grav: 0, drag: 1, rot: rand(0, TAU), vr: rand(-16, 16) }); }
        if (h.t > h.spin) {
          h.tickT -= dt;
          if (h.tickT <= 0) { h.tickT = h.tick; Combat.area(this, o, { x: h.x - h.w, y: -440, w: h.w * 2, h: 440 }, { dmg: h.dmg * o.dmgMul, kb: 160, up: -220, hs: 0.06, imp: 0, hsnd: 'slash', dir: h.dir }); }
        }
      }
    }
  },
  // Akari's presence each step: petals shed in her phase's colour, faster each phase; in the last phase dark wisps and
  // an afterimage trail when she moves fast. Her Mirror of Petals copies shed nothing: that is how to tell her apart.
  stepAkariPresence() {
    const f = this.enemy; if (!f || !f.alive || !f.petal || !f.visible || this.phase !== 'fight') return;
    const lv = f.petal === 'demon' ? 3 : f.petal === 'crimson' ? 2 : 1, col = AKARI_PETALS[f.petal];
    // the real Akari wears the baked sakura drift (one layer a phase) and plays her phase entrances (63-akari-sakura.js);
    // in her last phase a pink afterimage still trails her fast moves
    if (AkariSakura.presence(this, f)) {
      f._trailT = (f._trailT || 0) + 1;
      if (lv >= 3 && Math.abs(f.vx) > 380 && f._trailT % 4 === 0) this.fx.afterimage(f, 'rgba(255,20,147,0.3)', { dur: 0.26 });
      return;
    }
    if (Math.random() < 0.08 + 0.14 * lv) this.fx.part({ x: f.x + rand(-30, 30) * f.scale, y: f.y - rand(30, 210) * f.scale, vx: rand(-60, 60) - f.facing * 40, vy: rand(-40, 30), life: rand(0.6, 1.1), size: rand(2.2, 3.4), color: chance(0.7) ? col[0] : col[1], type: 'ash', grav: 40, drag: 1.2, rot: rand(0, TAU), vr: rand(-6, 6) });
    if (lv >= 3) {
      if (Math.random() < 0.3) this.fx.part({ x: f.x + rand(-26, 26) * f.scale, y: f.y - rand(0, 60) * f.scale, vx: rand(-20, 20), vy: -rand(30, 80), life: rand(0.5, 0.8), size: rand(6, 11), color: 'rgba(10,2,4,0.45)', type: 'puff', grav: -20, drag: 1, grow: 10 });
      f._trailT = (f._trailT || 0) + 1;
      if (Math.abs(f.vx) > 380 && f._trailT % 4 === 0) this.fx.afterimage(f, 'rgba(160,20,40,0.32)', { dur: 0.26 });
    }
  }
});

// world space, on the floor under the fighters: storm rings, poison mist, traps; then the tornadoes' columns
function drawAkariHazards(ctx, s, T) {
  AkariChain.drawFloor(ctx, s, T);   // Petal Burst's bloom circle (62b-akari-chain.js)
  const arr = s.hazards; if (!arr || !arr.length) return;
  ctx.save(); ctx.lineCap = 'round';
  for (const h of arr) {
    const col = AKARI_PETALS[h.petal] || AKARI_PETALS.violet, rgb = hexRgb(col[0]), hi = hexRgb(col[1]);
    if (h.kind === 'storm') {
      if (h.sk) continue;   // drawn by its sakura sheet
      if (h.t < h.delay) {
        // the warning: a ring of petal light on the floor closing on the spot, brighter as it nears
        const k = h.t / h.delay, r = h.r * (1.35 - 0.35 * k), pulse = 0.7 + 0.3 * Math.sin(T * (18 + 30 * k));
        ctx.strokeStyle = stormRgb(rgb, (0.4 + 0.5 * k) * pulse); ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.ellipse(h.x, 0, r, r * 0.22, 0, 0, TAU); ctx.stroke();
        ctx.fillStyle = stormRgb(rgb, 0.12 + 0.18 * k); ctx.beginPath(); ctx.ellipse(h.x, 0, h.r, h.r * 0.22, 0, 0, TAU); ctx.fill();
      } else {
        // the storm: whirling bands of petal colour round a dark column
        const k = (h.t - h.delay) / h.dur, a = k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1;
        const g = ctx.createLinearGradient(0, 0, 0, -280);
        g.addColorStop(0, stormRgb(rgb, 0.35 * a)); g.addColorStop(1, stormRgb(rgb, 0));
        ctx.fillStyle = g; ctx.fillRect(h.x - h.r, -280, h.r * 2, 280);
        for (let b = 0; b < 5; b++) {
          const y = -30 - b * 50, rr = h.r * (0.75 + 0.1 * b), ph = T * 9 + b * 1.3;
          ctx.strokeStyle = stormRgb(b % 2 ? hi : rgb, 0.55 * a); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(h.x, y, rr, rr * 0.2, 0, ph % TAU, (ph % TAU) + Math.PI * 1.2); ctx.stroke();
        }
      }
    } else if (h.kind === 'zone') {
      const a = Math.min(1, h.t / 0.3) * Math.min(1, (h.life - h.t) / 0.5), pulse = 0.8 + 0.2 * Math.sin(T * 5);
      ctx.save(); ctx.translate(h.x, 0); ctx.scale(1, 0.22);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, h.r);
      g.addColorStop(0, `rgba(110,200,90,${0.4 * a * pulse})`); g.addColorStop(0.7, `rgba(140,80,190,${0.22 * a})`); g.addColorStop(1, 'rgba(140,80,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, h.r, 0, TAU); ctx.fill(); ctx.restore();
    } else if (h.kind === 'trap') {
      // a small dark caltrop, its heart glowing green once armed
      const armed = h.t > h.arm, blink = armed ? 0.6 + 0.4 * Math.sin(T * 10) : 0.3;
      ctx.fillStyle = '#0c0a0e'; ctx.strokeStyle = stormRgb(rgb, 0.8); ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let n = 0; n < 4; n++) { const a = n * Math.PI / 2 + Math.PI / 4; ctx.moveTo(h.x, -5); ctx.lineTo(h.x + Math.cos(a) * 11, -5 + Math.sin(a) * 4 - (n % 2 ? 6 : 0)); }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(h.x, -5, 4.5, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = `rgba(130,230,110,${blink})`; ctx.beginPath(); ctx.arc(h.x, -5, 2.2, 0, TAU); ctx.fill();
      if (armed) { ctx.strokeStyle = `rgba(130,230,110,${0.25 * blink})`; ctx.beginPath(); ctx.ellipse(h.x, 0, h.r, h.r * 0.2, 0, 0, TAU); ctx.stroke(); }
    } else if (h.kind === 'tornado') {
      if (h.sk) continue;   // drawn by its sakura sheet
      // a dark twisting column wrapped in bands of petals, spinning up then travelling
      const spin = Math.min(1, h.t / h.spin), end = Math.min(1, (h.spin + h.dur - h.t) / 0.4), a = spin * end;
      const g = ctx.createLinearGradient(h.x - h.w * 1.4, 0, h.x + h.w * 1.4, 0);
      g.addColorStop(0, stormRgb(hexRgb(col[2]), 0)); g.addColorStop(0.5, stormRgb(hexRgb(col[2]), 0.55 * a)); g.addColorStop(1, stormRgb(hexRgb(col[2]), 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(h.x - h.w * 0.35, 0); ctx.lineTo(h.x - h.w * 1.4, -440); ctx.lineTo(h.x + h.w * 1.4, -440); ctx.lineTo(h.x + h.w * 0.35, 0); ctx.closePath(); ctx.fill();
      for (let b = 0; b < 9; b++) {
        const y = -20 - b * 48, rr = h.w * (0.45 + 0.11 * b) * spin, ph = T * 12 + b * 0.9, sway = Math.sin(T * 3 + b * 0.6) * 10;
        ctx.strokeStyle = stormRgb(b % 2 ? hi : rgb, 0.7 * a); ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.ellipse(h.x + sway, y, rr, rr * 0.22, 0, ph % TAU, (ph % TAU) + Math.PI * 1.3); ctx.stroke();
      }
    }
  }
  ctx.restore();
}
