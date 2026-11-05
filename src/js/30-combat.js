/* KAGE — CombatSystem, WeaponSystem (projectiles / pickups / specials) and ParticleSystem + cinematic effects */

const PARRY_WINDOW = 0.15;
const _ha = { x: 0, y: 0, w: 0, h: 0 }, _hb = { x: 0, y: 0, w: 0, h: 0 }, _hc = { x: 0, y: 0, w: 0, h: 0 };

/* ======================================================================== */
/* ParticleSystem + juice — sumi-e ink presentation: calligraphy marks,       */
/* brush slashes, enso circles, ink splatter, hit-stop, shake, impact frames   */
/* ======================================================================== */
const FK = '"KageKanji","Yu Boku","Yu Mincho","YuMincho","Hiragino Mincho ProN","Hiragino Mincho Pro","MS Mincho","Noto Serif CJK JP","Noto Serif JP","Source Han Serif JP","Songti SC","SimSun",serif';
// calligraphy shown for each impact word (the English word sits underneath as a small caption)
const INK_GLYPH = {
  SMASH: '砕', BREAK: '破', SLASH: '斬', CRACK: '撃', WHAM: '打', PARRY: '弾', COUNTER: '返', 'GUARD BREAK': '崩', CLANG: '剣',
  SWEEP: '払', YANK: '引', REAP: '刈', THROW: '投', PIERCE: '貫', SPLIT: '裂', MOONFALL: '月', SHATTER: '砕', SLAM: '震', BASH: '盾',
  CRUSH: '圧', CHARGE: '突', STAGGERED: '隙', ADAPTED: '読', COUNTERED: '返', 'SHIELD BREAK': '崩', WALL: '壁', FIGHT: '闘', TIME: '時',
  FINISH: '終', FALLEN: '敗', 'K.O.': '斬', PERFECT: '極', CRITICAL: '烈', EVADE: '避', COMBO: '連', 'RAGE READY': '怒', ENOUGH: '止'
};
const BANNER_GLYPH = {
  'Round I': '壱', 'Round II': '弐', 'Round III': '参', 'Final Duel': '決', 'Sparring Match': '稽', 'Phase II': '弐', 'Phase III': '参',
  Raikon: '雷', Akari: '霧', Takashi: '父', Rem: '弟', 'The Witness': '鏡', 'Hollow Raikon': '雷', 'Hollow Akari': '霧', 'Hollow Takashi': '父', 'Hollow Rem': '弟',
  'Shadow Palm': '影', 'Thousand Cuts': '千', 'Crescent Moon': '月', 'Mountain Split': '山', 'Dragon Lance': '龍', "Reaper's Harvest": '刈',
  Earthshatter: '震', 'Hollow Illusions': '幻', 'Stilled Time': '時', 'Ashen Wrath': '怒'
};
function bannerGlyph(text) { return BANNER_GLYPH[text] || (/^Wave/.test(text) ? '波' : '闘'); }
function prng(seed) { let s = (seed * 9301 + 49297) % 233280 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// tapered sumi brush stroke with dry-brush bristle streaks; prog draws it partially (stroke being painted)
function brushStroke(ctx, x0, y0, x1, y1, w, color, prog, seed, curve) {
  const R = prng(seed || 7);
  const ex = lerp(x0, x1, prog), ey = lerp(y0, y1, prog);
  const dx = ex - x0, dy = ey - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, bend = (curve || 0) * L;
  const N = 16, top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, bow = Math.sin(t * Math.PI) * bend;
    const px = x0 + dx * t + nx * bow, py = y0 + dy * t + ny * bow;
    const ww = w * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.92 + 0.08)), 0.55) * (t > 0.85 ? 1 - (t - 0.85) * 3 : 1);
    top.push(px + nx * ww * (0.5 + R() * 0.08), py + ny * ww * (0.5 + R() * 0.08));
    bot.push(px - nx * ww * (0.5 + R() * 0.08), py - ny * ww * (0.5 + R() * 0.08));
  }
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(top[0], top[1]);
  for (let i = 2; i < top.length; i += 2) ctx.lineTo(top[i], top[i + 1]);
  for (let i = bot.length - 2; i >= 0; i -= 2) ctx.lineTo(bot[i], bot[i + 1]);
  ctx.closePath(); ctx.fill();
  // dry-brush gaps along the tail
  ctx.strokeStyle = color; ctx.lineCap = 'round';
  for (let k = 0; k < 5; k++) {
    const off = (R() - 0.5) * w * 0.9, t0 = 0.55 + R() * 0.25, t1 = Math.min(1, t0 + 0.2 + R() * 0.25);
    ctx.lineWidth = Math.max(0.8, w * 0.05); ctx.globalAlpha *= 0.9;
    ctx.beginPath(); ctx.moveTo(x0 + dx * t0 + nx * off, y0 + dy * t0 + ny * off); ctx.lineTo(x0 + dx * t1 + nx * off * 1.1, y0 + dy * t1 + ny * off * 1.1); ctx.stroke();
  }
}
// brush circle (enso) painted around a point, thick at the start and thinning out
function ensoStroke(ctx, x, y, r, color, prog, start, width) {
  const sweep = 5.7 * prog, N = 46;
  ctx.strokeStyle = color; ctx.lineCap = 'round';
  let px = x + Math.cos(start) * r, py = y + Math.sin(start) * r;
  for (let i = 1; i <= N; i++) {
    const t = i / N, a = start + sweep * t, rr = r * (1 + Math.sin(t * 9 + start) * 0.025);
    const qx = x + Math.cos(a) * rr, qy = y + Math.sin(a) * rr;
    ctx.lineWidth = Math.max(0.6, width * (1 - 0.8 * t) * (0.9 + 0.1 * Math.sin(t * 37)));
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke();
    px = qx; py = qy;
  }
}

const ASH_POINTS = ['head', 'neck', 'hip', 'fel', 'fha', 'bel', 'bha', 'fkn', 'bkn', 'fft', 'bft'];
class Effects {
  constructor() {
    this.P = []; for (let i = 0; i < 700; i++) this.P.push({ on: false });
    this.rings = []; this.stamps = []; this.arcs = []; this.ghosts = []; this.pops = []; this.lines = []; this.banners = []; this.ensos = []; this.flashes = []; this.bursts = [];
    this.trauma = 0; this.shakeT = 0; this.hitStop = 0; this.slowT = 0; this.slowScale = 1; this.zoomPunch = 0;
    this.impact = null; this.time = 0;
    this.shakeX = 0; this.shakeY = 0; this.shakeR = 0;
  }
  settings() { return SaveManager.data.settings; }
  part(o) {
    for (let i = 0; i < this.P.length; i++) {
      const p = this.P[i];
      if (!p.on) {
        p.on = true; p.x = o.x; p.y = o.y; p.vx = o.vx || 0; p.vy = o.vy || 0; p.life = o.life || 0.5; p.max = p.life;
        p.size = o.size || 3; p.color = o.color || C.bone; p.type = o.type || 'dot'; p.grav = o.grav == null ? 900 : o.grav;
        p.drag = o.drag == null ? 2 : o.drag; p.rot = o.rot || 0; p.vr = o.vr || 0; p.add = !!o.add; p.grow = o.grow || 0; p.sq = o.sq || 1;
        return p;
      }
    }
    return null;
  }
  sparks(x, y, dir, n, color, spd) {
    for (let i = 0; i < n; i++) {
      const a = (dir > 0 ? 0 : Math.PI) + rand(-0.85, 0.85);
      const v = rand(320, 820) * (spd || 1);
      this.part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 100, life: rand(0.12, 0.3), size: rand(1.2, 2.4), color: color || '#ffd9a8', type: 'spark', grav: 1300, drag: 3.5, add: true });
    }
  }
  // sumi ink splatter: dark crimson droplets that land and stay on the floor
  ink(x, y, dir, n) {
    for (let i = 0; i < n; i++) {
      const a = (dir > 0 ? 0 : Math.PI) + rand(-0.7, 0.7);
      const v = rand(140, 520);
      this.part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.7 - 180, life: rand(0.5, 0.9), size: rand(1.8, 5.5), color: i % 4 === 0 ? '#5a140f' : i % 3 ? '#140504' : '#2a0806', type: 'drop', grav: 1500, drag: 1, rot: rand(0, TAU), sq: rand(0.5, 1) });
    }
  }
  dust(x, y, n) {
    for (let i = 0; i < n; i++) this.part({ x: x + rand(-20, 20), y: y - 2, vx: rand(-170, 170), vy: rand(-90, -10), life: rand(0.35, 0.7), size: rand(8, 16), color: 'rgba(160,151,133,0.15)', type: 'puff', grav: -20, drag: 3, grow: 28 });
  }
  smoke(x, y, n, big) {
    for (let i = 0; i < n; i++) this.part({ x: x + rand(-30, 30), y: y + rand(-120, 0), vx: rand(-90, 90), vy: rand(-60, 10), life: rand(1.2, 2.4) * (big ? 1.5 : 1), size: rand(20, 40) * (big ? 1.6 : 1), color: 'rgba(120,128,132,0.32)', type: 'puff', grav: -15, drag: 1.2, grow: 40 });
  }
  embers(x, y, n, color) {
    for (let i = 0; i < n; i++) this.part({ x: x + rand(-20, 20), y: y + rand(-20, 20), vx: rand(-80, 80), vy: rand(-260, -60), life: rand(0.5, 1.1), size: rand(1.5, 3), color: color || '#ff8a4c', type: 'spark', grav: -60, drag: 1, add: true });
  }
  // memory ash: flat violet flakes shed by a dissolving Hollow, scattered from its skeleton and drifting upward
  memoryAsh(f, n, burst) {
    const sk = f.sk, pts = ASH_POINTS, cols = (f.family && f.family.ash) || ENEMY_FAMILIES.hollow.ash;   // bosses: the same violet ash
    for (let i = 0; i < n; i++) {
      const a = sk[pts[(Math.random() * pts.length) | 0]], b = sk[pts[(Math.random() * pts.length) | 0]], k = Math.random();
      const v = burst ? rand(60, 260) : rand(10, 60), ang = rand(-Math.PI, 0);
      this.part({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), vx: Math.cos(ang) * v + (f.vx || 0) * 0.05, vy: Math.sin(ang) * v - rand(20, 90),
        life: rand(0.6, 1.2), size: rand(3.5, 7) * f.scale, color: cols[i % cols.length], type: 'ash', grav: -70, drag: 1.6, rot: rand(0, TAU), vr: rand(-8, 8) });
    }
  }
  poisonPuff(f) {
    this.part({ x: f.x + rand(-14, 14), y: f.y - rand(60, 150) * f.scale, vx: rand(-20, 20), vy: -40, life: 0.7, size: rand(4, 8), color: 'rgba(120,230,110,0.5)', type: 'puff', grav: -40, drag: 1, grow: 10, add: true });
    if (f.isPlayer) AudioManager.play('poison');
  }
  // kiai: a short breath of air leaves the mouth as the strike lands
  kiai(f) {
    const sk = f.sk, r = BODY.head * f.scale * f.build.head;
    const x = sk.head.x + f.facing * r * 0.95, y = sk.head.y + r * 0.35;
    for (let i = 0; i < 3; i++) this.part({ x, y, vx: f.facing * rand(70, 170), vy: rand(-30, 8), life: rand(0.22, 0.38), size: rand(2.5, 4.5), color: 'rgba(236,229,211,0.22)', type: 'puff', grav: -20, drag: 3, grow: 16 });
  }
  ring(x, y, r, color, dur, width) { this.rings.push({ x, y, r0: r * 0.2, r1: r, t: 0, dur: dur || 0.3, color: color || C.bone, w: width || 3 }); }
  enso(x, y, r, color, dur) { this.ensos.push({ x, y, r, color: color || C.bone, t: 0, dur: dur || 0.5, start: rand(0, TAU) }); }
  slashArc(x, y, ang, size, color, dir) { this.arcs.push({ x, y, ang, size, color: color || C.bone, t: 0, dur: 0.24, dir: dir || 1, seed: Math.random() * 1000 }); }
  stamp(text, x, y, tier, color, caption) {
    if (this.stamps.length > 2) this.stamps.shift();
    this.stamps.push({ text, glyph: INK_GLYPH[text] || null, x, y, t: 0, dur: tier >= 3 ? 1.05 : 0.8, rot: rand(-0.1, 0.06), tier, color: color || C.emberBright, seed: (Math.random() * 1000) | 0, side: Math.random() < 0.5 ? -1 : 1, caption: caption || text });
    AudioManager.play('stamp');
  }
  popText(f, text, color) { this.pops.push({ text, x: f.x, y: f.y - f.height() - 24, t: 0, dur: 1.0, color: color || C.gold }); }
  banner(text, sub, color, glyph) { this.banners.length = 0; this.banners.push({ text, sub, t: 0, dur: 1.55, color: color || C.gold, glyph: glyph || bannerGlyph(text), seed: (Math.random() * 1000) | 0 }); }
  // o (optional): { dur, dx } a longer-lived echo, offset sideways (Akari's afterimage silhouettes, the Smoke Step decoy)
  afterimage(f, color, o) {
    const sk = f.sk, pts = [], dx = (o && o.dx) || 0;
    for (const k of ['hip', 'neck', 'head', 'sh', 'fel', 'fha', 'bel', 'bha', 'fkn', 'fft', 'bkn', 'bft', 'wb', 'wt']) pts.push(sk[k].x + dx, sk[k].y);
    this.ghosts.push({ pts, lw: f.build.w * f.scale * 1.3, r: BODY.head * f.scale * f.build.head, t: 0, dur: (o && o.dur) || 0.22, color: color || 'rgba(236,229,211,0.2)', wl: f.weaponLen() > 0 });
    if (this.ghosts.length > 14) this.ghosts.shift();
  }
  dashLines(f) {
    for (let i = 0; i < 7; i++) this.lines.push({ x: f.x - f.facing * rand(0, 60), y: f.y - rand(20, 200) * f.scale, len: rand(70, 190), dir: f.facing, t: 0, dur: rand(0.15, 0.3), w: rand(1, 3.2) });
  }
  shake(a) {
    const s = this.settings().shake;
    if (s === 'off') return;
    this.trauma = Math.min(1, this.trauma + a * (s === 'half' ? 0.5 : 1));
  }
  stop(t) { this.hitStop = Math.max(this.hitStop, t); }
  slowmo(scale, dur) { this.slowScale = scale; this.slowT = dur; }
  punch(z) { this.zoomPunch = Math.max(this.zoomPunch, z); }
  impactFrame(x, y, tier) { this.impact = { x, y, t: 0, dur: tier >= 3 ? 0.12 : 0.05, tier }; }
  // one call per hit: layered feedback scaled by importance tier
  hit(x, y, dir, tier, kind, color, el, crit) {
    const t = clamp(tier, 0, 3);
    if (el) this.elemImpact(el, x, y, dir, t, crit);
    this.stop([0.045, 0.06, 0.095, 0.15][t]);
    this.shake([0.1, 0.2, 0.4, 0.66][t]);
    this.flashes.push({ x, y, t: 0, dur: 0.07 + t * 0.025, r: 26 + t * 24 });
    this.sparks(x, y, dir, [3, 6, 10, 16][t], kind === 'slash' ? '#fff4e0' : '#ffd9a8', 1 + t * 0.2);
    if (kind === 'slash') this.slashArc(x, y, dir > 0 ? rand(-0.7, 0.2) : Math.PI + rand(-0.2, 0.7), 52 + t * 24, color || C.bone, dir);
    else this.bursts.push({ x, y, dir, t: 0, dur: 0.14 + t * 0.03, n: 6 + t * 3, r: 26 + t * 16, seed: Math.random() * 6 });
    if (t >= 1) this.ink(x, y, dir, 3 + t * 4);
    if (t >= 2) { this.enso(x, y, 64 + t * 24, t >= 3 ? 'rgba(210,74,60,0.95)' : 'rgba(236,229,211,0.85)', 0.5); this.punch(0.035 * t); this.impactFrame(x, y, t); }
  }
  update(realDt, simDt) {
    this.time += realDt;
    if (this.hitStop > 0) this.hitStop -= realDt;
    if (this.slowT > 0) { this.slowT -= realDt; if (this.slowT <= 0) this.slowScale = 1; }
    this.trauma = Math.max(0, this.trauma - realDt * 1.5);
    this.shakeT += realDt * 38;
    const sh = this.trauma * this.trauma;
    this.shakeX = 22 * sh * Math.sin(this.shakeT * 1.7); this.shakeY = 15 * sh * Math.sin(this.shakeT * 2.3 + 1); this.shakeR = 0.025 * sh * Math.sin(this.shakeT * 1.1);
    this.zoomPunch = damp(this.zoomPunch, 0, 9, realDt);
    if (this.impact) { this.impact.t += realDt; if (this.impact.t > this.impact.dur + 0.25) this.impact = null; }
    const dt = simDt;
    for (const p of this.P) {
      if (!p.on) continue;
      p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
      p.vy += p.grav * dt; p.vx *= 1 - Math.min(1, p.drag * dt); p.vy *= 1 - Math.min(1, p.drag * dt * 0.5);
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.size += p.grow * dt;
      if (p.type === 'drop' && p.y > 0) { p.y = 0; p.vy = 0; p.vx *= 0.25; p.type = 'splat'; p.life = Math.min(p.life + 0.8, 1.6); p.max = p.life; }
    }
    const tick = (arr, d) => { for (let i = arr.length - 1; i >= 0; i--) { arr[i].t += d; if (arr[i].t >= arr[i].dur) arr.splice(i, 1); } };
    tick(this.rings, realDt); tick(this.arcs, realDt); tick(this.ghosts, realDt); tick(this.pops, realDt); tick(this.lines, realDt);
    tick(this.stamps, realDt); tick(this.banners, realDt); tick(this.ensos, realDt); tick(this.flashes, realDt); tick(this.bursts, realDt);
    this.updateVfx(realDt, simDt);
  }
  drawWorldBack(ctx) {
    ctx.lineCap = 'round';
    // brushed wind streaks behind a dash
    for (const l of this.lines) {
      const k = l.t / l.dur;
      ctx.strokeStyle = `rgba(236,229,211,${0.22 * (1 - k)})`; ctx.lineWidth = l.w;
      ctx.beginPath(); ctx.moveTo(l.x - l.dir * l.len * k, l.y); ctx.lineTo(l.x - l.dir * (l.len * k + l.len), l.y); ctx.stroke();
    }
    // afterimages: translucent body echoes
    for (const g of this.ghosts) {
      const a = 1 - g.t / g.dur, p = g.pts;
      ctx.globalAlpha = a; ctx.strokeStyle = g.color; ctx.lineWidth = g.lw;
      const seg = (i, j) => { ctx.moveTo(p[i * 2], p[i * 2 + 1]); ctx.lineTo(p[j * 2], p[j * 2 + 1]); };
      ctx.beginPath(); seg(0, 1); seg(3, 4); seg(4, 5); seg(3, 6); seg(6, 7); seg(0, 8); seg(8, 9); seg(0, 10); seg(10, 11); if (g.wl) seg(5, 13); ctx.stroke();
      ctx.fillStyle = g.color; ctx.beginPath(); ctx.arc(p[4], p[5], g.r, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  drawWorld(ctx) {
    for (const p of this.P) {
      if (!p.on) continue;
      const k = p.life / p.max;
      if (p.add) ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = p.type === 'puff' ? k : Math.min(1, k * 1.6);
      ctx.fillStyle = p.color;
      if (p.type === 'spark') {
        ctx.strokeStyle = p.color; ctx.lineWidth = p.size;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.026, p.y - p.vy * 0.026); ctx.stroke();
      } else if (p.type === 'splat') {
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size * 2, p.size * 0.45, 0, 0, TAU); ctx.fill();
      } else if (p.type === 'star') {
        const r = p.size; ctx.beginPath(); ctx.moveTo(p.x - r, p.y); ctx.lineTo(p.x - r * 0.18, p.y - r * 0.18); ctx.lineTo(p.x, p.y - r); ctx.lineTo(p.x + r * 0.18, p.y - r * 0.18); ctx.lineTo(p.x + r, p.y); ctx.lineTo(p.x + r * 0.18, p.y + r * 0.18); ctx.lineTo(p.x, p.y + r); ctx.lineTo(p.x - r * 0.18, p.y + r * 0.18); ctx.closePath(); ctx.fill();
      } else if (p.type === 'flame') {
        const r = Math.max(1, p.size); ctx.beginPath(); ctx.moveTo(p.x - r * 0.6, p.y); ctx.quadraticCurveTo(p.x, p.y - r * 2.6, p.x + r * 0.6, p.y); ctx.arc(p.x, p.y, r * 0.6, 0, Math.PI); ctx.fill();
      } else if (p.type === 'ash') {
        // a flat flake: a small diamond that tumbles (rot) and shrinks as it fades
        const r = p.size * (0.5 + 0.5 * k), c = Math.cos(p.rot) * r, sn = Math.sin(p.rot) * r * 0.55;
        ctx.beginPath(); ctx.moveTo(p.x + c, p.y + sn); ctx.lineTo(p.x - sn, p.y + c * 0.55); ctx.lineTo(p.x - c, p.y - sn); ctx.lineTo(p.x + sn, p.y - c * 0.55); ctx.closePath(); ctx.fill();
      } else if (p.type === 'drop') {
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size * p.sq, Math.atan2(p.vy, p.vx), 0, TAU); ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    for (const r of this.rings) {
      const k = Ease.outCubic(r.t / r.dur);
      ctx.strokeStyle = r.color; ctx.globalAlpha = 1 - k; ctx.lineWidth = r.w * (1 - k) + 0.5;
      ctx.beginPath(); ctx.arc(r.x, r.y, lerp(r.r0, r.r1, k), 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // white-hot core flash at the point of contact
    ctx.globalCompositeOperation = 'source-over';
    for (const f of this.flashes) {
      const k = f.t / f.dur, r = f.r * (0.6 + k * 0.7);
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      g.addColorStop(0, `rgba(255,255,255,${0.95 * (1 - k)})`); g.addColorStop(0.35, `rgba(255,220,180,${0.55 * (1 - k)})`); g.addColorStop(1, 'rgba(255,160,120,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, TAU); ctx.fill();
    }
    // blunt impact: radial strike lines that burst outward
    for (const b of this.bursts) {
      const k = b.t / b.dur, R = prng(b.seed * 1000);
      ctx.strokeStyle = `rgba(255,244,224,${0.9 * (1 - k)})`; ctx.lineCap = 'round';
      for (let i = 0; i < b.n; i++) {
        const a = (b.dir > 0 ? 0 : Math.PI) + (R() - 0.5) * 2.6, r0 = b.r * (0.35 + k * 0.9), r1 = r0 + b.r * (0.5 + R() * 0.6) * (1 - k * 0.5);
        ctx.lineWidth = (1 - k) * (1.5 + R() * 2.5);
        ctx.beginPath(); ctx.moveTo(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0); ctx.lineTo(b.x + Math.cos(a) * r1, b.y + Math.sin(a) * r1); ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    // brush-stroke slash crescents
    for (const a of this.arcs) {
      const k = a.t / a.dur, grow = Ease.outCubic(clamp(k / 0.3, 0, 1)), fade = k < 0.3 ? 1 : 1 - (k - 0.3) / 0.7;
      const S = a.size, a0 = -1.25, a1 = a0 + 2.5 * grow;
      ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.ang);
      ctx.globalAlpha = fade * 0.92; ctx.fillStyle = a.color;
      ctx.beginPath(); ctx.arc(0, 0, S, a0, a1); ctx.arc(-S * 0.14, S * 0.05, S * 0.88, a1, a0, true); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = a.color; ctx.lineCap = 'round';
      for (let i = 1; i <= 4; i++) { ctx.globalAlpha = fade * (0.42 - i * 0.07); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(-S * 0.04 * i, 0, S * (0.84 - i * 0.06), a0 + 0.12 * i, a1 - 0.18 * i); ctx.stroke(); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fade; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, S * 0.985, a0 + 0.25, a1 - 0.08); ctx.stroke();
      ctx.restore();
    }
    // enso: a brush circle painted round the strongest blows
    for (const e of this.ensos) {
      const k = e.t / e.dur, prog = Ease.outCubic(clamp(k / 0.32, 0, 1)), fade = k < 0.5 ? 1 : 1 - (k - 0.5) / 0.5;
      ctx.globalAlpha = fade; ensoStroke(ctx, e.x, e.y, e.r * (1 + k * 0.12), e.color, prog, e.start, e.r * 0.2);
      ctx.globalAlpha = 1;
    }
    this.drawVfx(ctx);
  }
  // screen-space overlays: calligraphy marks, small captions, brush banners
  drawScreen(ctx, toScreen) {
    this.drawVfxScreen(ctx, toScreen);
    for (const p of this.pops) {
      const k = p.t / p.dur, sp = toScreen(p.x, p.y), a = k < 0.15 ? k / 0.15 : k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(sp.x, sp.y - k * 26);
      ctx.font = `600 18px ${FU}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '3px';
      const w = ctx.measureText(p.text).width;
      ctx.fillStyle = 'rgba(3,3,3,0.7)'; brushStroke(ctx, -w / 2 - 16, 2, w / 2 + 16, -2, 22, 'rgba(3,3,3,0.72)', 1, 3);
      ctx.fillStyle = p.color; ctx.fillText(p.text, 2, 0);
      ctx.letterSpacing = '0px'; ctx.restore();
    }
    for (const s of this.stamps) this.drawInkMark(ctx, s, toScreen(s.x, s.y));
    for (const b of this.banners) this.drawBanner(ctx, b);
  }
  drawInkMark(ctx, s, sp) {
    const k = s.t / s.dur, size = s.tier >= 3 ? 156 : s.tier === 2 ? 112 : 84;
    const inK = clamp(s.t / 0.1, 0, 1), e = Ease.outCubic(inK);
    const alpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    const x = clamp(sp.x + s.side * size * 0.55, size * 0.7, W - size * 0.7), y = clamp(sp.y - size * 0.75 - k * 12, size * 0.8, H - size * 0.4);
    ctx.save(); ctx.translate(x, y); ctx.rotate(s.rot); ctx.globalAlpha = alpha;
    const sc = lerp(1.45, 1, e) * (1 + Math.max(0, k - 0.7) * 0.18); ctx.scale(sc, sc);
    // red brush swash painted behind the character
    ctx.globalAlpha = alpha * 0.92;
    brushStroke(ctx, -size * 0.78, size * 0.32, size * 0.82, -size * 0.28, size * 0.36, s.color, Ease.outCubic(clamp(s.t / 0.14, 0, 1)), s.seed, 0.06);
    ctx.globalAlpha = alpha;
    if (s.glyph) {
      ctx.font = `900 ${size}px ${FK}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(3,3,3,0.85)'; ctx.fillText(s.glyph, 6, 7);
      const R = prng(s.seed);
      ctx.fillStyle = C.bone;
      for (let i = 0; i < 3; i++) { ctx.globalAlpha = alpha * 0.35; ctx.fillText(s.glyph, (R() - 0.5) * 4, (R() - 0.5) * 4); }
      ctx.globalAlpha = alpha; ctx.fillText(s.glyph, 0, 0);
      ctx.font = `${Math.round(size * 0.24)}px ${FB}`; ctx.letterSpacing = `${Math.round(size * 0.02)}px`;
      ctx.fillStyle = 'rgba(3,3,3,0.85)'; ctx.fillText(s.caption, 3, size * 0.66 + 3);
      ctx.fillStyle = s.tier >= 3 ? '#ffe6c4' : C.bone; ctx.fillText(s.caption, 0, size * 0.66);
      ctx.letterSpacing = '0px';
      if (s.tier >= 3) { // red hanko seal
        ctx.save(); ctx.translate(size * 0.5, size * 0.3); ctx.rotate(0.06);
        ctx.fillStyle = C.ember; ctx.fillRect(-size * 0.11, -size * 0.11, size * 0.22, size * 0.22);
        ctx.font = `900 ${Math.round(size * 0.15)}px ${FK}`; ctx.fillStyle = C.bone; ctx.fillText('影', 0, 1);
        ctx.restore();
      }
    } else {
      ctx.font = `italic 700 ${Math.round(size * 0.48)}px ${FD}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(3,3,3,0.85)'; ctx.fillText(s.text, 4, 5); ctx.fillStyle = C.bone; ctx.fillText(s.text, 0, 0);
    }
    ctx.restore();
  }
  drawBanner(ctx, b) {
    const k = b.t / b.dur, inK = Ease.outCubic(clamp(b.t / 0.32, 0, 1)), outK = k > 0.78 ? (k - 0.78) / 0.22 : 0;
    const cy = H * 0.4, R = prng(b.seed);
    ctx.save(); ctx.globalAlpha = 1 - outK;
    // ink band painted from left to right with ragged bristle edges
    const x1 = W * inK, hh = 62;
    ctx.fillStyle = 'rgba(3,3,3,0.84)'; ctx.beginPath(); ctx.moveTo(0, cy - hh);
    for (let x = 0; x <= x1; x += 32) ctx.lineTo(x, cy - hh + (R() - 0.5) * 12 + Math.sin(x * 0.01) * 6);
    ctx.lineTo(x1 + 30, cy - hh * 0.2); ctx.lineTo(x1, cy + hh * 0.9);
    for (let x = x1; x >= 0; x -= 32) ctx.lineTo(x, cy + hh + (R() - 0.5) * 14 - Math.sin(x * 0.012) * 5);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = (1 - outK) * 0.85;
    brushStroke(ctx, 40, cy - hh + 4, Math.max(41, x1 - 40), cy - hh - 2, 5, b.color, 1, b.seed + 1);
    brushStroke(ctx, Math.max(41, x1 - 40), cy + hh - 2, 60, cy + hh + 3, 3, 'rgba(236,229,211,0.35)', 1, b.seed + 2);
    ctx.globalAlpha = 1 - outK;
    const slide = (1 - inK) * -80;
    // calligraphy + title block
    ctx.textBaseline = 'middle';
    ctx.font = `900 112px ${FK}`; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(b.glyph, W / 2 - 190 + slide + 5, cy + 6);
    ctx.fillStyle = b.color; ctx.fillText(b.glyph, W / 2 - 190 + slide, cy);
    ctx.textAlign = 'left';
    ctx.font = `58px ${FB}`; ctx.fillStyle = C.bone; ctx.fillText(b.text, W / 2 - 110 + slide * 0.6, cy - 10);
    if (b.sub) { ctx.font = `600 14px ${FU}`; ctx.letterSpacing = '5px'; ctx.fillStyle = b.color; ctx.fillText(b.sub.toUpperCase(), W / 2 - 108 + slide * 0.4, cy + 30); ctx.letterSpacing = '0px'; }
    ctx.restore();
  }
}

/* ======================================================================== */
/* Projectiles, shockwaves and dropped weapons                                */
/* ======================================================================== */
const PROJ = {
  kunai:    { speed: 1250, r: 10, dmg: 6, hs: 0.22, kb: 140, life: 1.2, grav: 120, imp: 0, hsnd: 'slash', deflect: 1 },
  orb:      { speed: 520, r: 16, dmg: 9, hs: 0.32, kb: 220, life: 2.6, grav: 0, imp: 1, hsnd: 'heavy', home: 1.4 },
  bigorb:   { speed: 380, r: 26, dmg: 14, hs: 0.45, kb: 380, life: 3.2, grav: 0, imp: 2, hsnd: 'heavy', home: 0.9, kd: 1 },
  crescent: { speed: 980, r: 70, dmg: 24, hs: 0.6, kb: 520, up: -300, life: 1.1, grav: 0, imp: 3, hsnd: 'slash', kd: 1, stamp: 'MOONFALL', pierce: 0 },
  shock:    { speed: 760, r: 34, dmg: 13, hs: 0.5, kb: 260, up: -420, life: 0.75, grav: 0, imp: 2, hsnd: 'heavy', kd: 1, ground: 1 },
  bigshock: { speed: 900, r: 44, dmg: 22, hs: 0.6, kb: 420, up: -520, life: 0.9, grav: 0, imp: 3, hsnd: 'heavy', kd: 1, ground: 1, unb: 1, stamp: 'BREAK' },
  hook:     { speed: 1150, r: 16, dmg: 8, hs: 0.5, kb: 0, life: 0.8, grav: 0, imp: 1, hsnd: 'slash', pullTo: 1, ret: 1 },
  // Thunder Swing: red lightning racing along the ground (jump it, or dash through it). Raikon's and the rage art's.
  thunderwave: { speed: 640, r: 30, dmg: 15, hs: 0.5, kb: 320, up: -380, life: 1.7, grav: 0, imp: 2, hsnd: 'heavy', kd: 1, ground: 1, unb: 1, stamp: 'THUNDER', bolt: 1 },
  smoke:    { speed: 520, r: 14, dmg: 4, hs: 0.2, kb: 60, life: 1.6, grav: 1500, imp: 0, hsnd: 'punch', smoke: 1 }
};

const WeaponSystem = {
  spawn(world, type, owner, o) {
    const d = PROJ[type]; o = o || {};
    const f = owner, sk = f.sk, dir = o.dir || f.facing;
    const p = {
      type, d, owner: f, team: f.team, x: o.x != null ? o.x : (d.ground ? f.x + dir * 70 * f.scale : sk.fha.x + dir * 10),
      y: o.y != null ? o.y : (d.ground ? 0 : sk.fha.y), vx: dir * d.speed * (o.speedMul || 1), vy: o.vy || 0,
      life: d.life * (o.lifeMul || 1), dmg: (o.dmg || d.dmg) * (o.dmgMul || 1) * f.dmgMul, t: 0, dir, hit: [], dead: false, ret: false,
      target: o.target || null, sx: 0, sy: 0
    };
    if (type === 'kunai') {
      p.dmg *= f.kunaiMul;
      p.y = f.y - 132 * f.scale; p.x = f.x + dir * 30 * f.scale; p.sx = p.x; p.sy = p.y;
      const tgt = world.opponentOf(f);
      if (tgt) { const tt = Math.max(0.08, Math.abs(tgt.x - p.x) / d.speed); p.vy = clamp(((tgt.y - 110 * tgt.scale) - p.y) / tt - d.grav * tt * 0.5, -700, 700); }
    }
    if (type === 'smoke') { p.vy = -520; p.vx = dir * rand(380, 560); }
    p.sx = p.x; p.sy = p.y;
    world.projectiles.push(p);
    if (type === 'orb' || type === 'bigorb') AudioManager.play('orb', { pitch: type === 'bigorb' ? 0.7 : 1 });
    if (type === 'hook') AudioManager.play('chain');
    if (type === 'kunai') AudioManager.play('throw');
    return p;
  },
  update(world, dt) {
    const arr = world.projectiles;
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i], d = p.d;
      p.t += dt; p.life -= dt;
      if (d.home && p.target && p.target.alive) {
        const ty = p.target.y - 110 * p.target.scale, tx = p.target.x;
        const ang = Math.atan2(ty - p.y, tx - p.x), cur = Math.atan2(p.vy, p.vx);
        let da = ang - cur; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
        const na = cur + clamp(da, -d.home * dt, d.home * dt), sp = Math.hypot(p.vx, p.vy);
        p.vx = Math.cos(na) * sp; p.vy = Math.sin(na) * sp;
      }
      if (d.ret) {
        const o = p.owner, dist = Math.abs(p.x - p.sx);
        if (!p.ret && (dist > 560 || p.life < d.life * 0.45)) p.ret = true;
        if (p.ret) { const hx = o.sk.fha.x, hy = o.sk.fha.y; const a = Math.atan2(hy - p.y, hx - p.x); p.vx = Math.cos(a) * d.speed * 1.2; p.vy = Math.sin(a) * d.speed * 1.2; if (Math.hypot(hx - p.x, hy - p.y) < 30) p.dead = true; }
      }
      p.vy += d.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (d.bolt) { p.y = 0; if (((p.t * 60) | 0) % 3 === 0) world.fx.part({ x: p.x + rand(-20, 20), y: -rand(0, 60), vx: rand(-80, 80), vy: rand(-260, -60), life: 0.25, size: rand(1.5, 3), color: chance(0.5) ? '#ff6a52' : '#ffffff', type: 'spark', grav: 300, drag: 2, add: true }); }
      else if (d.ground) { p.y = 0; if (((p.t * 30) | 0) % 2 === 0) { world.fx.dust(p.x, 0, 1); world.fx.part({ x: p.x + rand(-14, 14), y: -rand(0, 30), vx: rand(-40, 40), vy: rand(-420, -200), life: 0.4, size: rand(3, 6), color: '#2a2620', type: 'drop', grav: 1600 }); } }
      if (d.smoke && p.y >= 0) { world.smokeCloud(p.x); p.dead = true; }
      if (p.type === 'orb' || p.type === 'bigorb') world.fx.part({ x: p.x, y: p.y, vx: rand(-20, 20), vy: rand(-20, 20), life: 0.3, size: d.r * 0.4, color: 'rgba(127,184,255,0.35)', type: 'dot', grav: 0, add: true });
      if (p.type === 'crescent') world.fx.part({ x: p.x - p.dir * 30, y: p.y + rand(-60, 60), vx: -p.dir * 100, vy: 0, life: 0.3, size: 2, color: C.bone, type: 'spark', grav: 0, add: true });
      // hit fighters
      if (!p.ret || d.ret) {
        for (const f of world.fighters) {
          if (f.team === p.team || !f.alive || f.invuln > 0 || p.hit.includes(f)) continue;
          if (d.ground && !f.grounded) continue;
          const hb = f.hurtbox(_hb);
          const R = d.r;
          if (p.x + R > hb.x && p.x - R < hb.x + hb.w && p.y + R > hb.y && p.y - R < hb.y + hb.h) {
            p.hit.push(f);
            const m = { dmg: p.dmg, kb: d.kb, up: d.up || (d.kd ? -300 : 0), hs: d.hs, imp: d.imp, hsnd: d.hsnd, kd: d.kd, unb: d.unb, stamp: d.stamp, proj: true, gb: p.dmg * 1.5, pullTo: d.pullTo };
            Combat.applyHit(world, p.owner, f, m, p.x, p.y, p.dir);
            if (d.pullTo && !f.def?.heavyArmor) { p.ret = true; f.pulledBy = p.owner; }
            if (!d.ground && p.type !== 'crescent') { if (!d.ret) p.dead = true; else p.ret = true; }
          }
        }
      }
      // weapon swings deflect kunai and cancel orbs
      if (d.deflect || p.type === 'orb') {
        for (const f of world.fighters) {
          if (f.team === p.team) continue;
          const hb = f.hitbox(_ha);
          if (hb && p.x > hb.x && p.x < hb.x + hb.w && p.y > hb.y && p.y < hb.y + hb.h) { p.dead = true; world.fx.sparks(p.x, p.y, -p.dir, 8, C.gold); AudioManager.play('clang'); world.fx.popText(f, 'DEFLECT', C.bone); }
        }
      }
      if (p.life <= 0 || p.dead || p.x < world.bounds.l - 300 || p.x > world.bounds.r + 300 || p.y > 40) arr.splice(i, 1);
    }
    // projectile vs projectile
    for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
      const a = arr[i], b = arr[j];
      if (a.team === b.team || a.d.ground || b.d.ground) continue;
      if (Math.hypot(a.x - b.x, a.y - b.y) < a.d.r + b.d.r) {
        if (a.type !== 'crescent') a.dead = true; if (b.type !== 'crescent') b.dead = true;
        world.fx.sparks((a.x + b.x) / 2, (a.y + b.y) / 2, 1, 10, C.gold); world.fx.ring((a.x + b.x) / 2, (a.y + b.y) / 2, 50, C.bone, 0.2);
        AudioManager.play('clang');
      }
    }
  },
  draw(ctx, world) {
    for (const p of world.projectiles) {
      const d = p.d;
      ctx.save(); ctx.translate(p.x, p.y);
      switch (p.type) {
        case 'kunai': {
          ctx.rotate(Math.atan2(p.vy, p.vx));
          ctx.strokeStyle = 'rgba(236,229,211,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-8, 0); ctx.stroke();
          ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(0, -4); ctx.lineTo(-10, -1.5); ctx.lineTo(-10, 1.5); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(236,229,211,0.7)'; ctx.lineWidth = 1; ctx.stroke();
          ctx.strokeStyle = C.emberBright; ctx.beginPath(); ctx.arc(-13, 0, 3, 0, TAU); ctx.stroke();
          break;
        }
        case 'orb': case 'bigorb': {
          const r = d.r * (1 + Math.sin(p.t * 20) * 0.08);
          ctx.globalCompositeOperation = 'source-over';
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2); g.addColorStop(0, 'rgba(230,245,255,1)'); g.addColorStop(0.3, 'rgba(127,184,255,0.8)'); g.addColorStop(1, 'rgba(127,184,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 2, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(200,230,255,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath();
          for (let i = 0; i < 5; i++) { const a = p.t * 9 + i * 1.3; ctx.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5); ctx.lineTo(Math.cos(a + 0.4) * r * 1.4, Math.sin(a + 0.4) * r * 1.4); }
          ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
          break;
        }
        case 'crescent': {
          ctx.scale(p.dir, 1);
          ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(236,229,211,0.25)';
          ctx.beginPath(); ctx.arc(-30, 0, 92, -1.25, 1.25); ctx.arc(-58, 0, 80, 1.1, -1.1, true); ctx.closePath(); ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = C.bone; ctx.beginPath(); ctx.arc(-20, 0, 82, -1.2, 1.2); ctx.arc(-44, 0, 74, 1.08, -1.08, true); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = C.emberBright; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-20, 0, 82, -1.2, 1.2); ctx.stroke();
          break;
        }
        case 'shock': case 'bigshock': {
          const big = p.type === 'bigshock';
          ctx.scale(p.dir, 1);
          ctx.fillStyle = C.ink;
          for (let i = 0; i < 5; i++) {
            const hh = (big ? 90 : 55) * (1 - i * 0.17) * (0.8 + 0.2 * Math.sin(p.t * 30 + i));
            ctx.beginPath(); ctx.moveTo(-i * 26 - 14, 0); ctx.lineTo(-i * 26, -hh); ctx.lineTo(-i * 26 + 12, 0); ctx.fill();
          }
          ctx.strokeStyle = big ? 'rgba(255,106,60,0.8)' : 'rgba(236,229,211,0.45)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-130, -2); ctx.lineTo(10, -2); ctx.stroke();
          break;
        }
        case 'thunderwave': {
          // hand-drawn branching red lightning: a crackling column at the front and bolts skittering along the
          // ground behind it. The shape is redrawn every other frame (a few held, high-contrast frames).
          ctx.scale(p.dir, 1);
          const fade = Math.min(1, p.life / 0.25), R = prng(((p.t * 30) | 0) * 7 + (p.seed || (p.seed = (Math.random() * 999) | 0)));
          ctx.globalAlpha *= fade; ctx.lineCap = 'round'; ctx.lineJoin = 'miter';
          const bolt = (pts, w) => {
            for (const [col, lw] of [['#120404', w * 5.6], ['#ff3b2f', w * 3.6], ['#ffffff', w * 1.4]]) {
              ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
              for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.stroke();
            }
          };
          // a flat red scorch along the ground under the wave, then the front column: jagged forks rising from the ground
          ctx.fillStyle = 'rgba(255,59,47,0.35)'; ctx.beginPath(); ctx.ellipse(-50, 0, 110, 9, 0, 0, TAU); ctx.fill();
          for (let k = 0; k < 4; k++) {
            const pts = [(R() - 0.5) * 12, 0]; let x = pts[0], y = 0;
            const top = 100 + R() * 70;
            while (y > -top) { y -= 14 + R() * 12; x += (R() - 0.5) * 26 - k * 3; pts.push(x, y); }
            bolt(pts, k === 0 ? 2.2 : 1.4);
          }
          // the trail along the ground
          const pts = [0, -4]; let x = 0;
          for (let i = 0; i < 7; i++) { x -= 18 + R() * 12; pts.push(x, -2 - R() * 18); }
          bolt(pts, 1.6);
          break;
        }
        case 'hook': {
          ctx.restore(); ctx.save();
          const o = p.owner.sk.fha;
          ctx.strokeStyle = '#4a443b'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.setLineDash([]);
          ctx.translate(p.x, p.y); ctx.scale(p.dir, 1);
          ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(-6, -4); ctx.quadraticCurveTo(18, -6, 14, 14); ctx.lineTo(8, 8); ctx.quadraticCurveTo(10, 0, -6, 4); ctx.fill();
          ctx.strokeStyle = C.emberBright; ctx.lineWidth = 1.2; ctx.stroke();
          break;
        }
        case 'smoke':
          ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(185,196,201,0.7)'; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.strokeStyle = C.emberBright; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(4, -15); ctx.stroke();
          break;
      }
      ctx.restore();
    }
    // dropped weapons
    for (const k of world.pickups) {
      ctx.save(); ctx.translate(k.x, k.y - 6); ctx.rotate(k.rot);
      drawWeaponShape(ctx, SHAPE[k.wid] || 'katana', (WEAPONS[k.wid].len || 80) * k.owner.scale, 'ink', k.owner.scale, C.ink);
      ctx.restore();
      if (k.grounded) {
        const a = 0.35 + Math.sin(world.time * 5) * 0.2;
        ctx.strokeStyle = k.owner.isPlayer ? `rgba(201,164,92,${a})` : `rgba(210,74,60,${a})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(k.x, 2, 46, 8, 0, 0, TAU); ctx.stroke();
      }
    }
  },
  drop(world, f) {
    if (!f.hasWeapon || f.weaponId() === 'fists' || f.baseWeapon === 'storm_orbs' || f.baseWeapon === 'iron_fists') return;
    f.hasWeapon = false;
    if (f.state === 'move') { f.move = null; }
    world.pickups.push({ wid: f.baseWeapon, owner: f, x: f.sk.fha.x, y: Math.min(-40, f.sk.fha.y), vx: -f.facing * rand(260, 420), vy: -rand(500, 700), rot: f.wAng, vr: rand(14, 20) * -f.facing, grounded: false, t: 0 });
    world.fx.popText(f, 'DISARMED', C.emberBright);
    AudioManager.play('clang', { pitch: 0.8 });
  },
  updatePickups(world, dt) {
    for (let i = world.pickups.length - 1; i >= 0; i--) {
      const k = world.pickups[i];
      k.t += dt;
      if (!k.grounded) {
        k.vy += 2200 * dt; k.x += k.vx * dt; k.y += k.vy * dt; k.rot += k.vr * dt;
        if (k.x < world.bounds.l) { k.x = world.bounds.l; k.vx *= -0.5; }
        if (k.x > world.bounds.r) { k.x = world.bounds.r; k.vx *= -0.5; }
        if (k.y >= 0) {
          k.y = 0;
          if (k.vy > 300) { k.vy *= -0.3; k.vx *= 0.5; k.vr *= 0.4; AudioManager.play('block', { pitch: 1.6 }); world.fx.sparks(k.x, 0, 1, 4, C.gold); }
          else { k.grounded = true; k.vy = 0; k.rot = Math.round(k.rot / Math.PI) * Math.PI + (k.owner.facing > 0 ? 0.05 : -0.05); }
        }
      }
      const o = k.owner;
      if (k.t > 0.6 && o.alive && o.grounded && Math.abs(o.x - k.x) < 46 && (o.isNeutral() || o.state === 'land' || o.state === 'block' || o.state === 'dash')) {
        o.hasWeapon = true; world.pickups.splice(i, 1);
        world.fx.popText(o, 'RECOVERED', C.gold); AudioManager.play('unlock');
        world.fx.ring(o.x, -60, 60, C.gold, 0.3);
      }
    }
  }
};

/* ======================================================================== */
/* CombatSystem — hit detection, block / parry / guard break, reactions        */
/* ======================================================================== */
const Combat = {
  resolve(world) {
    const fs = world.fighters;
    for (const att of fs) {
      if (!att.alive) continue;
      const hb = att.hitbox(_ha);
      if (!hb) continue;
      const m = att.move;
      for (const def of fs) {
        if (def === att || def.team === att.team || !def.alive || att.hitList.includes(def) || def.state === 'grabbed') continue;
        if (def.invuln > 0) {
          // perfect dodge: dashing through a live attack during the invulnerable frames
          if (def.isPlayer && def.state === 'dash' && overlap(hb, def.hurtbox(_hb))) { att.hitList.push(def); this.perfectDodge(world, def, att); }
          continue;
        }
        if (m.low && !def.grounded) continue;
        const hurt = def.hurtbox(_hb);
        if (!overlap(hb, hurt)) continue;
        att.hitList.push(def);
        // weapon clash
        const dh = def.hitbox(_hc);
        if (dh && overlap(hb, dh) && m.kind === 'weapon' && def.move.kind === 'weapon' && !def.hitList.includes(att)) { this.clash(world, att, def, hb); continue; }
        if (m.kind === 'grab') { this.grab(world, att, def); continue; }
        const ix = (Math.max(hb.x, hurt.x) + Math.min(hb.x + hb.w, hurt.x + hurt.w)) / 2;
        const iy = (Math.max(hb.y, hurt.y) + Math.min(hb.y + hb.h, hurt.y + hurt.h)) / 2;
        this.applyHit(world, att, def, m, ix, iy, att.facing);
      }
    }
  },
  clash(world, a, b, hb) {
    const x = (a.x + b.x) / 2, y = hb.y + hb.h / 2;
    for (const f of [a, b]) { f.vx = (f.x < x ? -1 : 1) * 420; f.move = null; f.setState('hit'); f.hitstun = 0.22; f.hitList.push(f === a ? b : a); }
    world.fx.sparks(x, y, 1, 24, '#ffe2a8', 1.5); world.fx.sparks(x, y, -1, 24, '#ffe2a8', 1.5);
    world.fx.clashFlare(x, y); world.fx.ring(x, y, 120, C.gold, 0.3, 4); world.fx.stop(0.13); world.fx.shake(0.45); world.fx.slowmo(0.5, 0.25);
    if (chance(0.4)) world.fx.stamp('CLASH', x, y, 2, C.gold);
    AudioManager.play('clang');
  },
  grab(world, att, def) {
    if (!def.grounded || def.state === 'down' || def.state === 'getup') return;
    if (def.def && def.def.noGrab) {
      world.fx.popText(def, 'TOO HEAVY', C.emberBright);
      att.move = null; att.setState('stun'); att.stunT = 0.45; att.vx = -att.facing * 380;
      AudioManager.play('block'); world.fx.shake(0.2);
      return;
    }
    def.move = null; def.abil = null; def.setState('grabbed'); def.grabbedBy = att; def.facing = -att.facing;
    att.move = null; att.setState('throwing'); att.grabbing = def;
    AudioManager.play('grab'); world.fx.stop(0.06);
  },
  perfectDodge(world, def, att) {
    const fx = world.fx;
    fx.slowmo(0.3, 0.75); fx.screenTint('rgba(120,200,255,', 0.6);
    def.rage = Math.min(100, def.rage + 12 * def.rageMul); def.counterT = 0.8;
    for (let i = 0; i < 3; i++) fx.afterimage(def, 'rgba(140,210,255,0.45)');
    fx.stamp('EVADE', def.x, def.y - def.height() * 0.6, 2, '#5aa6ff', 'PERFECT DODGE');
    AudioManager.play('teleport');
    world.onPerfect && world.onPerfect('dodge');
  },
  applyThrow(world, att, v) {
    v.setState('juggle'); v.vx = -att.facing * 360; v.vy = -380; v.grounded = false;
    const dmg = 16 * att.dmgMul * (1 - v.defense);
    this.damage(world, att, v, dmg, { imp: 2, hsnd: 'heavy' }, v.x, v.y - 40, -att.facing);
    world.fx.stamp('THROW', v.x, v.y - 60, 2);
  },
  applyHit(world, att, def, m, ix, iy, dir) {
    const fx = world.fx;
    const front = Math.sign(att.x - def.x || dir * -1) === def.facing || (m.proj && Math.sign(-dir) === def.facing);
    if (att.unblockable && !m.proj && m.kind) m = Object.assign({}, m, { unb: 1 });
    // Akari's False Opening decoy: any blow passes through the afterimage, which vanishes; the real Akari answers
    if (def.decoy) { world.strikeDecoy && world.strikeDecoy(def, att); return; }
    // counter stance: any melee blow from the front is turned aside and answered
    if (def.counterStance && !m.proj && front && m.kind !== 'grab') {
      def.counterStance = false;
      this.parry(world, att, def, m, ix, iy, dir);
      fx.stamp('COUNTERED', ix, iy, 2, def.redline ? '#ff4a3c' : '#7fd0c8');
      // an ability may answer the blow itself (Raikon's Redline Counter); otherwise the first weapon strike
      if (def.abil && def.abil.onCounter) { def.setState('ability'); def.abil.onCounter(def, world, att); }   // parry() set him idle
      else { def.endAbility(world); def.startMove(def.weapon().moves[0], world); }
      return;
    }
    // shield bearers: auto-blocks frontal, non-low, non-heavy attacks when not committed
    const shield = def.def && def.def.shield && def.hasWeapon && front && !m.low && def.grounded && !m.unb && (def.isNeutral() || def.state === 'block' || def.state === 'land' || (def.state === 'move' && def.mphase === 0));
    if (shield) {
      if ((m.gb || 0) >= 60 || (m.imp || 0) >= 3) {
        def.move = null; def.setState('stun'); def.stunT = 0.9; fx.stamp('SHIELD BREAK', ix, iy, 2, C.gold); AudioManager.play('guardbreak'); fx.hit(ix, iy, dir, 2, 'blunt', C.gold);
        def.hp -= m.dmg * 0.3 * att.dmgMul; this.checkKO(world, att, def, m);
      } else {
        fx.sparks(ix, iy, -dir, 10, C.gold); fx.stop(0.05); fx.shake(0.15); AudioManager.play('clang', { pitch: 0.9 });
        if (!m.proj) { att.vx = -att.facing * 300; if (att.state === 'move') att.mdur[2] *= 1.4; }
        if (chance(0.15)) fx.popText(def, 'SHIELDED', C.gold);
        def.counterT = 0.5;
      }
      return;
    }
    const blocking = def.state === 'block' && front && !m.unb && def.grounded;
    if (blocking) {
      if (def.blockT < PARRY_WINDOW && !m.proj) return this.parry(world, att, def, m, ix, iy, dir);
      const chip = m.dmg * 0.12 * att.dmgMul;
      def.hp = Math.max(1, def.hp - chip);
      def.guard -= (m.gb || m.dmg * 1.3);
      def.vx = dir * (m.kb || 150) * 0.45;
      def.counterT = 0.45;
      def.rage = Math.min(100, def.rage + m.dmg * 0.4 * def.rageMul * (1 + (def.blockRage || 0)));
      if (!m.proj) att.vx = -att.facing * 120;
      fx.sparks(ix, iy, -dir, 7, att.hasWeapon && m.kind === 'weapon' ? C.gold : C.bone);
      fx.stop(0.04); fx.shake(0.1);
      AudioManager.play(m.kind === 'weapon' || m.proj ? 'clang' : 'block');
      if (def.guard <= 0) {
        def.guard = 60; def.setState('stun'); def.stunT = 1.0 * (1 - def.stunRes * 0.5);
        fx.stamp('GUARD BREAK', ix, iy, 2); AudioManager.play('guardbreak'); fx.hit(ix, iy, dir, 2, 'blunt');
        if (chance(0.5)) world.dropWeapon(def);
      }
      return;
    }
    // ---- clean hit ----
    let dmg = m.dmg * (m.id === 'hk' ? 1 + att.moveCharge * 0.9 : 1);
    if (!m.proj) dmg *= att.dmgMul * ((m.kind === 'weapon' || m.kind === 'air') && att.hasWeapon ? weaponMul(att.weaponId(), att.wlvl).dmg : 1);
    const comboing = def.state === 'hit' || def.state === 'juggle' || def.state === 'stun';
    if (comboing) dmg *= Math.max(0.45, 1 - 0.07 * att.comboHits); else att.comboHits = 0;
    if (!m.proj) dmg *= Math.max(0.55, Math.pow(0.86, att.repeat));
    let counter = def.state === 'move' && def.mphase === 0;
    if (counter) dmg *= 1.2;
    // critical strikes: counter-hits, blows from behind and the occasional clean strike
    const crit = att.isPlayer && !m.proj && (counter || !front || chance(0.1));
    if (crit) dmg *= 1.4;
    if (!front && !m.proj) dmg *= 1.1;
    if (def.def && def.def.heavyArmor && (m.imp || 0) <= 1) dmg *= 0.75;
    if (def.barrier > 0) { dmg *= 0.25; fx.popText(def, 'BARRIER', '#7fd0c8'); }
    let tier = m.imp || 0;
    if ((counter || crit) && tier < 3) tier++;
    if (m.counter) tier = 3;
    if (counter && att.isPlayer) fx.stamp('COUNTER', ix, iy, Math.max(2, tier), C.gold);
    else if (crit) fx.stamp('CRITICAL', ix, iy, Math.max(2, tier), C.emberBright);
    this.damage(world, att, def, dmg * (1 - def.defense), m, ix, iy, dir, tier, crit);
    if (!def.alive) return;
    // reaction
    const armored = def.superArmor && (def.state === 'move' || def.state === 'ability') || (def.def && def.def.heavyArmor && (m.imp || 0) <= 1 && !m.kd && def.grounded);
    if (armored && !m.unb) { def.flash = 0.08; return; }
    def.move = null;
    if (def.abil) { const keep = def.abil.uninterruptible; if (!keep) def.endAbility(world); else { def.flash = 0.08; return; } }
    const launch = m.kd || (m.up && m.up < -300) || !def.grounded || def.state === 'juggle';
    const kbMul = def.def && def.def.heavyArmor ? 0.5 : 1;
    if (m.pull || m.pullTo) {
      if (def.def && def.def.heavyArmor) { fx.popText(def, 'TOO HEAVY', C.emberBright); }
      else { const dest = att.x + att.facing * 80 * att.scale; def.vx = (dest - def.x) * 5.5; def.setState('hit'); def.hitstun = m.hs; def.hitGut = true; return; }
    }
    if (launch) {
      def.setState('juggle'); def.grounded = false; def.juggle++;
      def.bodyRotVel = (def.bodyRotVel || 0) - (m.kd || (m.imp || 0) >= 2 ? 200 : 80);
      def.vy = (m.up || -260) * (def.grounded ? 1 : 0.8) * (def.juggle > 3 ? 0.6 : 1); def.vx = dir * (m.kb || 200) * kbMul;
      if (def.juggle > 4) def.invuln = 0.5;
    } else {
      def.setState('hit'); def.hitstun = (m.hs || 0.3) * (1 - def.stunRes * 0.4); def.vx = dir * (m.kb || 150) * kbMul; def.hitGut = chance(0.4);
    }
    if (m.stun) { def.setState('stun'); def.stunT = m.stun * (1 - def.stunRes); }
    if (m.disarm && chance(m.disarm * (def.def && def.def.type === 'boss' ? 0.4 : 1))) world.dropWeapon(def);
    if (m.id === 'hk' && att.moveCharge > 0.8 && chance(0.25)) world.dropWeapon(def);
  },
  parry(world, att, def, m, ix, iy, dir) {
    const fx = world.fx;
    att.move = null; att.abil = null; att.setState('stun');
    att.stunT = (att.def && att.def.type === 'boss' ? 0.6 : 0.85) * (1 - att.stunRes * 0.5);
    att.vx = -att.facing * 260;
    def.counterT = 0.75; def.rage = Math.min(100, def.rage + 14 * def.rageMul); def.stats.parries++;
    def.setState('idle');
    fx.sparks(ix, iy, -dir, 26, '#ffe2a8', 1.5); fx.clashFlare(ix, iy); fx.enso(ix, iy, 120, 'rgba(201,164,92,0.95)', 0.6);
    fx.stop(def.isPlayer ? 0.2 : 0.13); fx.shake(0.35); fx.impactFrame(ix, iy, 2); fx.punch(0.07);
    if (def.isPlayer) { fx.slowmo(0.4, 0.55); fx.screenTint('rgba(201,164,92,', 0.5); fx.stamp('PERFECT', ix, iy, 3, C.gold, 'PERFECT PARRY'); world.onPerfect && world.onPerfect('parry'); }
    else fx.stamp('PARRY', ix, iy, 2, C.gold);
    AudioManager.play('parry');
    if (m.kind === 'weapon' && chance(att.def && att.def.type === 'boss' ? 0.12 : 0.3)) world.dropWeapon(att);
    world.onParry && world.onParry(def, att);
  },
  damage(world, att, def, dmg, m, ix, iy, dir, tier, crit) {
    const fx = world.fx;
    dmg = Math.max(1, dmg);
    def.hp -= dmg; def.flash = 0.06; def.sqx = 0.86; def.sqy = 1.1;
    att.stats.dealt += dmg; def.stats.taken += dmg;
    att.rage = Math.min(100, att.rage + dmg * 0.9 * att.rageMul);
    def.rage = Math.min(100, def.rage + dmg * 0.45 * def.rageMul);
    att.comboHits++; att.comboT = 1.1; att.moveHit = true;
    // air attacks that connect hang the attacker briefly so juggles can be extended instead of falling away from the target
    if (!m.proj && !att.grounded && att.state === 'move' && att.move && att.move.kind === 'air') att.vy = Math.min(att.vy, -170);
    if (att.comboHits > att.stats.maxCombo) att.stats.maxCombo = att.comboHits;
    if (att.poisonBlade && !m.proj) def.poison = 3;
    tier = tier == null ? (m.imp || 0) : tier;
    const lethal = def.hp <= 0;
    if (lethal) tier = 3;
    const kind = m.hsnd === 'slash' ? 'slash' : 'blunt';
    const wpTrail = att.weapon().trail;
    const el = m.proj ? null : att.elementOf(m);
    fx.hit(ix, iy, dir, tier, kind, kind === 'slash' ? (att.poisonBlade ? '#8be07a' : wpTrail) : null, el, crit);
    AudioManager.play(m.hsnd || 'punch', { pitch: rand(0.92, 1.08) });
    if (tier >= 3) AudioManager.play('impact');
    if (m.stamp && !lethal && tier >= 3 && !crit) fx.stamp(m.stamp, ix, iy, tier);
    world.onHit && world.onHit(att, def, dmg, m);
    this.checkKO(world, att, def, m);
  },
  checkKO(world, att, def, m) {
    // the spar (Logic.fightFormat 'spar', preventKO): no blow ever knocks a brother out; Takashi interrupts first
    if (def.hp <= 0 && world.format && world.format.preventKO && (def === world.player || def === world.enemy)) def.hp = Logic.sparHealth(world.format, def.hp);
    if (def.hp > 0 || !def.alive) return;
    def.hp = 0; def.alive = false; def.move = null; def.abil = null; def.visible = true; def.alpha = 1;
    def.setState('juggle'); def.grounded = false; def.vy = -560; def.vx = att.facing * 560; def.bodyRotVel = -240;
    world.onKO(def, att, m);
  },
  // generic area hit used by specials and boss abilities
  area(world, att, box, m) {
    let any = false;
    for (const def of world.fighters) {
      if (def.team === att.team || !def.alive || def.invuln > 0) continue;
      if (m.groundOnly && !def.grounded) continue;
      const hb = def.hurtbox(_hb);
      if (!overlap(box, hb)) continue;
      const ix = (Math.max(box.x, hb.x) + Math.min(box.x + box.w, hb.x + hb.w)) / 2, iy = (Math.max(box.y, hb.y) + Math.min(box.y + box.h, hb.y + hb.h)) / 2;
      this.applyHit(world, att, def, m, ix, iy, m.dir || att.facing);
      any = true;
    }
    return any;
  }
};

function fbox(f, x, y, w, h) {
  const s = f.scale;
  return { x: f.facing > 0 ? f.x + x * s : f.x - x * s - w * s, y: f.y + y * s, w: w * s, h: h * s };
}

/* ======================================================================== */
/* Rage specials (one per weapon)                                             */
/* ======================================================================== */
const SPECIAL_IMPL = {
  shadowPalm(f, world) {
    f.startAbility({ dur: 0.7, uninterruptible: true, pose: POSES.cast, rate: 22,
      start(f) { f.invuln = 0.4; world.fx.banner('Shadow Palm', 'Rage art', C.emberBright); },
      update(f, w, t) {
        if (t > 0.28 && !this.done) {
          this.done = true; f.vx = f.facing * 200;
          const box = fbox(f, 10, -200, 170, 200);
          w.fx.ring(box.x + box.w / 2, -110, 150, 'rgba(3,3,3,0.9)', 0.35, 14);
          for (let i = 0; i < 26; i++) w.fx.part({ x: f.sk.fha.x, y: f.sk.fha.y, vx: f.facing * rand(200, 900), vy: rand(-300, 300), life: rand(0.3, 0.6), size: rand(4, 10), color: i % 4 ? '#050404' : C.emberBright, type: 'dot', grav: 200, drag: 3 });
          Combat.area(w, f, box, { dmg: 26, kb: 720, up: -380, hs: 0.7, kd: 1, imp: 3, hsnd: 'heavy', stamp: 'BREAK', unb: 1 });
        }
      } });
  },
  thousandCuts(f, world) {
    const tgt = world.nearestEnemy(f);
    f.startAbility({ dur: 0.95, uninterruptible: true, rate: 40, trail: true,
      pose: (f, t) => (t < 0.18 ? MOVES.tw5.w : MOVES[['tw1', 'tw2', 'tw3', 'tw4'][((t * 14) | 0) % 4]].s),
      start(f) { f.invuln = 1; world.fx.banner('Thousand Cuts', 'Rage art', C.bone); },
      update(f, w, t) {
        if (t < 0.18) return;
        const i = ((t - 0.18) / 0.1) | 0;
        if (tgt && tgt.alive && i !== this.last && i < 6) {
          this.last = i;
          const side = i % 2 ? 1 : -1;
          f.x = clamp(tgt.x + side * 110, w.bounds.l, w.bounds.r); f.facing = -side; f.y = tgt.y;
          w.fx.afterimage(f, 'rgba(236,229,211,0.45)');
          const m = { dmg: i === 5 ? 10 : 5, kb: i === 5 ? 520 : 40, up: i === 5 ? -420 : -60, hs: 0.45, imp: i === 5 ? 3 : 1, hsnd: 'slash', unb: 1, stamp: i === 5 ? 'SLASH' : null, kd: i === 5 ? 1 : 0 };
          Combat.applyHit(w, f, tgt, m, tgt.x, tgt.y - 110 * tgt.scale, f.facing);
          AudioManager.play('swing', { pitch: 1.2 });
        }
      },
      end(f) { f.invuln = 0.2; } });
  },
  crescentMoon(f, world) {
    f.startAbility({ dur: 0.62, uninterruptible: true, rate: 30, trail: true,
      pose: (f, t) => (t < 0.22 ? MOVES.k1.w : MOVES.k1.s),
      start(f) { f.invuln = 0.3; world.fx.banner('Crescent Moon', 'Rage art', C.bone); },
      update(f, w, t) { if (t > 0.22 && !this.done) { this.done = true; WeaponSystem.spawn(w, 'crescent', f, { y: f.y - 120 * f.scale, dmgMul: weaponMul(f.weaponId(), f.wlvl).dmg }); AudioManager.play('heavyswing'); w.fx.shake(0.3); } } });
  },
  mountainSplit(f, world) {
    f.startAbility({ dur: 1.0, uninterruptible: true, rate: 24, trail: true,
      pose: (f, t) => (t < 0.45 ? MOVES.c3.w : MOVES.c3.s),
      start(f) { f.vy = -900; f.grounded = false; f.vx = f.facing * 220; f.invuln = 0.6; world.fx.banner('Mountain Split', 'Rage art', C.emberBright); },
      update(f, w, t) {
        if (t > 0.3 && !this.down) { this.down = true; f.vy = 1600; }
        if (this.down && f.grounded && !this.done) {
          this.done = true; f.vx = 0;
          WeaponSystem.spawn(w, 'bigshock', f, { dir: 1, x: f.x + 60 }); WeaponSystem.spawn(w, 'bigshock', f, { dir: -1, x: f.x - 60 });
          Combat.area(w, f, fbox(f, -120, -220, 330, 220), { dmg: 26, kb: 400, up: -560, hs: 0.7, kd: 1, imp: 3, hsnd: 'heavy', unb: 1, stamp: 'SPLIT' });
          w.fx.shake(0.9); w.fx.dust(f.x, 0, 30); AudioManager.play('slam');
        }
      } });
  },
  dragonLance(f, world) {
    f.startAbility({ dur: 0.85, uninterruptible: true, rate: 34, trail: true,
      pose: (f, t) => (t < 0.2 ? MOVES.s1.w : MOVES.s1.s),
      start(f) { f.invuln = 0.75; world.fx.banner('Dragon Lance', 'Rage art', C.gold); },
      update(f, w, t, dt) {
        if (t < 0.2) return;
        if (t < 0.55) {
          f.vx = f.facing * 1500;
          if (((t * 60) | 0) % 2 === 0) { w.fx.afterimage(f, 'rgba(201,164,92,0.4)'); w.fx.embers(f.sk.wt.x, f.sk.wt.y, 3, C.gold); }
          const i = ((t - 0.2) / 0.11) | 0;
          if (i !== this.last) { this.last = i; this.segHit = false; }
          if (!this.segHit) this.segHit = Combat.area(w, f, fbox(f, -40, -190, 260, 110), { dmg: i >= 2 ? 14 : 6, kb: i >= 2 ? 300 : 120, up: i >= 2 ? -700 : -80, hs: 0.5, imp: i >= 2 ? 3 : 1, hsnd: 'slash', unb: 1, kd: i >= 2 ? 1 : 0, stamp: i >= 2 ? 'PIERCE' : null });
        } else f.vx = damp(f.vx, 0, 10, dt);
      } });
  },
  reapersHarvest(f, world) {
    const tgt = world.nearestEnemy(f);
    f.startAbility({ dur: 1.15, uninterruptible: true, rate: 26,
      pose: (f, t) => (t < 0.25 ? MOVES.h2.w : t < 0.7 ? MOVES.h2.s : MOVES.h3.s),
      start(f) { f.invuln = 1.1; world.fx.banner("Reaper's Harvest", 'Rage art', '#9b8cff'); AudioManager.play('chain'); },
      update(f, w, t, dt) {
        f.chainExt = 0;
        if (!tgt || !tgt.alive) return;
        if (t > 0.25 && t < 0.7) {
          if (!this.caught) { this.caught = true; tgt.move = null; tgt.abil = null; tgt.setState('stun'); tgt.stunT = 1.2; AudioManager.play('slash'); w.fx.sparks(tgt.x, tgt.y - 100, -f.facing, 14, '#9b8cff'); }
          const dest = f.x + f.facing * 90 * f.scale;
          tgt.x = damp(tgt.x, dest, 10, dt);
        }
        if (t > 0.7 && !this.done) {
          this.done = true;
          Combat.applyHit(w, f, tgt, { dmg: 30, kb: 380, up: -820, hs: 0.8, kd: 1, imp: 3, hsnd: 'slash', unb: 1, stamp: 'REAP' }, tgt.x, tgt.y - 110 * tgt.scale, f.facing);
        }
      } });
  },
  // Raikō no Tachi: the player's Thunder Swing. A short wind-up (crackle, glint), then a wide flat arc that sends a
  // red lightning wave along the ground; it hits anything in the arc and every grounded foe the wave crosses.
  thunderSwing(f, world) {
    f.startAbility({ dur: 0.85, uninterruptible: true, rate: 26, trail: true, charge: true,
      pose: (f, t) => (t < 0.3 ? RAIKON_POSE.swingBack : RAIKON_POSE.swingThrough),
      start(f) { f.invuln = 0.5; world.fx.banner('Thunder Swing', 'Rage art', '#ff4a3c'); AudioManager.play('teleport'); },
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 10, dt);
        if (t < 0.3) { raikonCrackle(f, w, t); if (!this.glint && t > 0.16) { this.glint = 1; raikonGlint(f, w); } return; }
        if (!this.done) {
          this.done = true; this.charge = false;
          const mul = weaponMul(f.weaponId(), f.wlvl).dmg;
          Combat.area(w, f, fbox(f, -10, -210, 220, 200), { dmg: 16 * mul, kb: 460, up: -320, hs: 0.55, kd: 1, imp: 3, hsnd: 'slash', unb: 1, stamp: 'THUNDER' });
          WeaponSystem.spawn(w, 'thunderwave', f, { x: f.x + f.facing * 110 * f.scale, dmgMul: mul, speedMul: 1.25 });
          w.fx.lightning(f.sk.wt.x, f.sk.wt.y, f.x + f.facing * 130, 0, { w: 2.6, branches: 4, dur: 0.16 });
          w.fx.shake(0.55); AudioManager.play('heavyswing'); AudioManager.play('slam');
        }
      } });
  },
  // Kagehira & Yūrei: Smoke Step. Kage drops into a compact smoke puff and leaves an afterimage decoy standing where he
  // was (two offset pale silhouettes); the foe turns to it, and Kage steps out of a second puff behind them for Kagehira's
  // opener and Yūrei's punishing cut (narrow violet slashes). Unblockable.
  smokeStep(f, world) {
    const tgt = world.nearestEnemy(f), puff = AKARI_MOVES.smokeStep.smoke;
    f.startAbility({ dur: 0.92, uninterruptible: true, rate: 32, trail: true,
      pose: (f, t) => (t < 0.12 ? AKARI_POSE.smokeCrouch : t < 0.4 ? AKARI_POSE.fangBack : t < 0.56 ? MOVES.tw1.s : MOVES.tw2.s),
      start(f) { f.invuln = 0.75; world.fx.banner('Smoke Step', 'Rage art', '#9b6bd6'); AudioManager.play('teleport', { pitch: 1.3 }); },
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 12, dt);
        if (t < 0.12) return;
        if (!this.gone) {
          this.gone = 1;
          w.fx.smokePuff(f.x, 0, puff); AudioManager.play('smoke');
          w.fx.afterimage(f, 'rgba(236,229,211,0.42)', { dur: 0.9, dx: -10 * f.facing }); w.fx.afterimage(f, 'rgba(180,140,240,0.32)', { dur: 0.9, dx: 12 * f.facing });
          f.alpha = 0;
          this.decoyX = f.x;
        }
        if (t < 0.3) return;
        if (!this.out) {
          this.out = 1;
          if (tgt && tgt.alive) {
            // the foe turns to the afterimage, Kage comes out on its other side
            const toDecoy = Math.sign(this.decoyX - tgt.x) || -f.facing;
            if (!tgt.superArmor && tgt.state !== 'ability') tgt.facing = toDecoy;
            f.x = clamp(tgt.x - toDecoy * 105 * tgt.scale, w.bounds.l + 20, w.bounds.r - 20); f.facing = Math.sign(tgt.x - f.x) || 1;
          }
          f.alpha = 1; w.fx.smokePuff(f.x, 0, puff); w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#c9a8ff');
        }
        const mul = weaponMul(f.weaponId(), f.wlvl).dmg;
        for (const [i, at] of [[0, 0.4], [1, 0.56]]) {
          if (t < at || this['c' + i] || !tgt || !tgt.alive) continue;
          this['c' + i] = 1; AudioManager.play('swing', { pitch: 1.2 + i * 0.1 });
          Combat.applyHit(w, f, tgt, { dmg: (i ? 16 : 8) * mul, kb: i ? 520 : 60, up: i ? -380 : -60, hs: i ? 0.55 : 0.3, imp: i ? 3 : 1, hsnd: 'slash', unb: 1, kd: i, stamp: i ? 'SLASH' : null }, tgt.x, tgt.y - 110 * tgt.scale, f.facing);
          if (i) w.fx.petalCross(tgt.x, tgt.y - 110 * tgt.scale, f.facing, 130);
        }
      },
      end(f) { f.alpha = 1; f.invuln = 0.2; } });
  },
  earthshatter(f, world) {
    f.startAbility({ dur: 1.25, uninterruptible: true, rate: 20, trail: true,
      pose: (f, t) => (t < 0.55 ? MOVES.m1.w : MOVES.m1.s),
      start(f) { f.vy = -760; f.grounded = false; f.invuln = 0.9; world.fx.banner('Earthshatter', 'Rage art', C.emberBright); },
      update(f, w, t) {
        if (t > 0.4 && !this.down) { this.down = true; f.vy = 1800; }
        if (this.down && f.grounded && !this.done) {
          this.done = true;
          w.fx.shake(1); w.fx.slowmo(0.4, 0.5); AudioManager.play('quake');
          for (let i = 0; i < 40; i++) w.fx.part({ x: rand(w.bounds.l, w.bounds.r), y: 0, vx: rand(-60, 60), vy: rand(-700, -250), life: rand(0.5, 0.9), size: rand(3, 8), color: '#1d1a16', type: 'drop', grav: 1800 });
          for (const d of w.fighters) if (d.team !== f.team && d.alive && d.grounded) {
            Combat.applyHit(w, f, d, { dmg: 28, kb: 120, up: -300, hs: 0.5, imp: 3, hsnd: 'heavy', unb: 1, stamp: 'SHATTER', stun: 1.4 }, d.x, d.y - 60, Math.sign(d.x - f.x) || 1);
          }
        }
      } });
  }
};
