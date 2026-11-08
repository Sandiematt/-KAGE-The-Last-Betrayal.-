/* KAGE — storm VFX: cinematic red lightning striking down from the sky in sub-boss and boss encounters, the light it
   throws over the arena, the storm sky above those fights, and Raikon's lightning presence.

   Authored to the Effekseer VFX skill's craft rules (craft / timing / layering), translated to flat Canvas 2D:
   - Lightning does not travel. Each strike is a jagged polyline RE-STRUCK on separate frames: main strike, a dark
     frame, the return stroke, another dark frame, a thinner after-flicker. Secondary: glowing ground cracks and arcs
     crawling between them.
   - Time structure (60 FPS frames): anticipation (stepped leader + ground mark, only when `warn` > 0) -> contact
     (3 frames: white star, sky flash, camera kick) -> body (re-struck bolt, ~13 frames) -> secondary (cracks, arcs,
     sparks, embers, ~40 frames) -> dissipation (scorch and smoke, ~2 s).
   - Value layering: an ink-dark backing, a saturated red body, a white-hot core; one accent only (white). Draw order
     gives the occlusion: backing for every fork first, then glow, body, core.
   - Budgets: at most STORM.maxStrikes live strikes, at most three screen-sized light layers per frame, particles from
     the shared Effects pool, gradients only while a light is alive.
   Everything here is COSMETIC: no strike deals damage, moves a fighter or changes any timing. Strikes tied to an attack
   land on the attack's own wind-up or hit point, so they read as that attack's telegraph, never as a new hazard.
   Effects advance on simulation time (hit-stop freezes a strike mid-flash, slow motion slows it); every flash honours
   the reduceFlash setting and every camera kick goes through Effects.shake (the shake setting). */

const STORM = {
  maxStrikes: 5,
  skyY: -1500,          // world y the bolts come from (well above the top of the frame at any fight zoom)
  red: [255, 46, 34],   // body colour of the red lightning
  // the re-strike timeline after contact, in seconds: [start, end, which bolt shape, brightness]; gaps are dark frames
  strokes: [[0, 0.05, 0, 1], [0.085, 0.13, 1, 0.82], [0.17, 0.205, 2, 0.58]],
  boltDur: 0.46,        // the bolt and its fading channel are gone by then
  lightDur: 0.62        // the arena light it throws
};
function stormRgb(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
// light intensity of a strike t seconds after contact: bright on each stroke, dim in the dark frames, then a tail
function stormFlicker(t) {
  if (t < 0) return 0;
  for (const s of STORM.strokes) if (t >= s[0] && t < s[1]) return s[3];
  const last = STORM.strokes[STORM.strokes.length - 1][1];
  if (t < last) return 0.28;
  return Math.max(0, 0.3 * (1 - (t - last) / (STORM.lightDur - last)));
}
// midpoint displacement: a jagged polyline from (x0, y0) to (x1, y1), `levels` subdivisions, offsets proportional to
// each segment's length (so the zig-zag reads at every scale) — flat array [x, y, x, y, ...]
function boltPath(x0, y0, x1, y1, R, disp, levels) {
  let pts = [x0, y0, x1, y1];
  for (let l = 0; l < levels; l++) {
    const out = [pts[0], pts[1]];
    for (let i = 2; i < pts.length; i += 2) {
      const ax = pts[i - 2], ay = pts[i - 1], bx = pts[i], by = pts[i + 1], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
      const off = (R() - 0.5) * disp * L;
      out.push((ax + bx) / 2 - dy / L * off, (ay + by) / 2 + dx / L * off, bx, by);
    }
    pts = out;
  }
  return pts;
}
// a full bolt: the main channel plus forks off its upper part (each fork may fork once more); widths are relative
function boltTree(x0, y0, x1, y1, R, forks) {
  const main = boltPath(x0, y0, x1, y1, R, 0.44, 5), paths = [{ p: main, w: 1 }], n = main.length / 2, H = Math.abs(y1 - y0);
  for (let b = 0; b < forks; b++) {
    const i = 2 + ((R() * n * 0.72) | 0), bx = main[i * 2], by = main[i * 2 + 1], side = R() < 0.5 ? -1 : 1, len = H * (0.1 + R() * 0.2);
    const p = boltPath(bx, by, bx + side * len * (0.5 + R() * 0.7), by + len * (0.55 + R() * 0.5), R, 0.55, 4);
    paths.push({ p, w: 0.5 });
    if (R() < 0.55) { const j = ((p.length / 4) | 0) * 2; paths.push({ p: boltPath(p[j], p[j + 1], p[j] + side * len * 0.45, p[j + 1] + len * 0.4, R, 0.6, 3), w: 0.26 }); }
  }
  return paths;
}
// stroke a bolt tree in layers (backing -> glow -> body -> core). `shift` bends the bolt so its foot follows a moving
// target: each point moves by (dx, dy) scaled by how far down the bolt it is. `upto` (0..1) draws only the top part
// (the stepped leader).
function strokeBolt(ctx, tree, w, col, a, layers, shift, upto) {
  const y0 = tree[0].p[1], y1 = tree[0].p[tree[0].p.length - 1], span = (y1 - y0) || 1, sdx = shift ? shift[0] : 0, sdy = shift ? shift[1] : 0;
  const cut = upto == null ? 1e9 : y0 + span * upto;
  const trace = (q) => {
    ctx.beginPath();
    for (let i = 0; i < q.length; i += 2) {
      if (q[i + 1] > cut) break;
      const k = (q[i + 1] - y0) / span, x = q[i] + sdx * k, y = q[i + 1] + sdy * k;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  };
  for (const [kind, wk, alpha] of layers) {
    ctx.strokeStyle = kind === 'ink' ? `rgba(14,2,4,${alpha * a})` : kind === 'glow' ? stormRgb(col, alpha * a) : kind === 'body' ? stormRgb(col, Math.min(1, alpha * a)) : `rgba(255,246,240,${Math.min(1, alpha * a)})`;
    for (const path of tree) { ctx.lineWidth = Math.max(0.6, w * wk * path.w); trace(path.p); }
  }
}
const BOLT_LAYERS = [['ink', 3.4, 0.8], ['glow', 7, 0.2], ['body', 1.7, 1], ['core', 0.62, 1]];
const BOLT_LAYERS_DIM = [['ink', 2.4, 0.5], ['body', 1.1, 0.9], ['core', 0.4, 0.8]];

/* ---- Effects extension: strikes, cracks, light, storm sky, aura ---- */
Object.assign(Effects.prototype, {
  storm() {
    return this._st || (this._st = {
      strikes: [], cracks: [], scorch: [], crawl: [], light: null, bg: [],
      amb: { lv: 0, target: 0, col: STORM.red, rain: 0, rainT: 0, next: 2.5, sheetNext: 1.2, sheet: 0, sheetT: 0, calm: false },
      aura: null, eyes: []
    });
  },
  /* A red lightning strike from the sky onto world x (ground) or onto a fighter.
     o: { p (power, 0.5..2), warn (s of stepped-leader telegraph before contact), forks, color ('#rrggbb'),
          onto (a fighter: the bolt's foot follows it), anchor ('wt' blade tip, 'head', 'hip'; default 'wt'),
          y (impact y when not onto a fighter, default the ground), shake (camera kick at contact), quiet (no sound),
          sheet (a baked Effekseer strike, 37-vfx-sheets.js, for a ground strike: it draws the bolt, cracks, sparks and
          ash, timed so its contact frame lands on this strike's contact; the strike keeps only its light, camera kick
          and thunder), scale (the sheet's fighter scale) } */
  skyStrike(x, o) {
    o = o || {};
    const S = this.storm(), p = o.p || 1, seed = (Math.random() * 99999) | 0;
    if (S.strikes.length >= STORM.maxStrikes) S.strikes.shift();
    const tgt = o.onto ? stormAnchor(o.onto, o.anchor) : { x, y: o.y || 0 };
    const sx = tgt.x + (Math.random() - 0.5) * 380 * Math.min(1.4, p), sy = STORM.skyY;
    const forks = o.forks != null ? o.forks : Math.round(2 + p * 2.2), trees = [];
    for (let k = 0; k < 3; k++) { const R = prng(seed + k * 7919); trees.push(boltTree(sx, sy, tgt.x, tgt.y, R, Math.max(1, forks - k))); }
    S.strikes.push({ x: tgt.x, y: tgt.y, x0: tgt.x, y0: tgt.y, sx, sy, p, t: -(o.warn || 0), warn: o.warn || 0, trees, onto: o.onto || null, anchor: o.anchor,
      col: o.color ? hexRgb(o.color) : STORM.red, hit: false, shakeAmt: o.shake != null ? o.shake : 0.32 * p, quiet: !!o.quiet, seed, crawlT: 0 });
    if (o.sheet && !o.onto && tgt.y > -40) {
      // the baked strike's contact is its frame 10: start it so that frame lands on this strike's contact
      const lead = 10 / 60, warn = o.warn || 0;
      const h = this.playSheet(o.sheet, tgt.x, tgt.y, { scale: o.scale || 1, start: Math.max(0, lead - warn), delay: Math.max(0, warn - lead) });
      if (h) S.strikes[S.strikes.length - 1].ghost = true;
    }
  },
  // a distant strike behind the arena (screen space, on the horizon): pure atmosphere, never near the fighters
  bgStrike(sxScreen, p, color) {
    const S = this.storm(), seed = (Math.random() * 99999) | 0, R = prng(seed);
    if (S.bg.length > 3) S.bg.shift();
    const top = -40, bot = GROUND - FLOOR_DEPTH - 4, x1 = sxScreen + (R() - 0.5) * 120;
    S.bg.push({ trees: [boltTree(sxScreen, top, x1, bot, R, 2), boltTree(sxScreen, top, x1, bot, prng(seed + 1), 1)], t: 0, p: p || 1, col: color ? hexRgb(color) : S.amb.col, x1, bot });
    this.stormLight(null, 0.35 * (p || 1), color ? hexRgb(color) : S.amb.col, sxScreen);
    AudioManager.play('rumble', { pitch: 0.8 + Math.random() * 0.4 });
  },
  // the light a strike throws: one at a time, the brightest wins
  stormLight(wx, k, col, screenX) {
    const S = this.storm(), cur = S.light;
    if (cur && cur.k * stormFlicker(cur.t) > k) return;
    S.light = { wx, sx: screenX, k, col, t: 0 };
  },
  // the contact frame: everything the strike throws at once
  stormContact(s) {
    const p = s.p, col = s.col, x = s.x, y = s.y, onGround = y > -40;
    this.stormLight(x, Math.min(1, 0.55 + p * 0.3), col);
    if (s.ghost) {
      // a baked strike draws its own star, sparks, cracks and ash: keep only the camera kick and the thunder
      this.shake(s.shakeAmt); if (p >= 1.3) this.punch(0.025 * p);
      if (!s.quiet) AudioManager.play('thunder', { pitch: clamp(1.25 - p * 0.18, 0.8, 1.2) });
      return;
    }
    this.flashes.push({ x, y: y - 6, t: 0, dur: 0.06 + p * 0.02, r: 70 + p * 46 });   // the white star, gone at once
    this.shake(s.shakeAmt);
    if (p >= 1.3) this.punch(0.025 * p);
    const hex = '#' + col.map(v => v.toString(16).padStart(2, '0')).join('');
    // sparks: a hot white-and-red spray, mostly up and out, falling fast (ease out: drag)
    const n = Math.round(14 + p * 10);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * (onGround ? 2.6 : TAU), v = rand(260, 720) * (0.7 + p * 0.3);
      this.part({ x, y: y - 4, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.18, 0.42), size: rand(1.2, 2.6), color: i % 3 ? hex : '#fff4ee', type: 'spark', grav: 1500, drag: 3.2, add: true });
    }
    for (let i = 0; i < 4 + p * 4; i++) this.part({ x: x + rand(-24, 24), y: y - rand(0, 30), vx: rand(-70, 70), vy: rand(-240, -80), life: rand(0.6, 1.2), size: rand(1.4, 2.6), color: chance(0.5) ? '#ff8a6a' : hex, type: 'spark', grav: -50, drag: 1.2, add: true });
    if (onGround) {
      // glowing cracks radiating across the floor (flattened: the floor is seen at a low angle)
      const S = this.storm(), nc = Math.round(5 + p * 2.5);
      for (let i = 0; i < nc; i++) {
        const a = (i / nc) * TAU + rand(-0.25, 0.25), L = rand(50, 120) * p, seg = [x, 0];
        let cx = x, cy = 0;
        for (let k = 1; k <= 5; k++) { const ang = a + rand(-0.5, 0.5); cx += Math.cos(ang) * L / 5; cy += Math.sin(ang) * L / 5 * 0.24; seg.push(cx, cy); }
        S.cracks.push({ seg, t: 0, dur: rand(1.1, 1.6), col });
      }
      if (S.cracks.length > 40) S.cracks.splice(0, S.cracks.length - 40);
      S.scorch.push({ x, r: 64 * p, t: 0, dur: 2.6, col });
      if (S.scorch.length > 4) S.scorch.shift();
      this.dust(x, 0, Math.round(6 + p * 6));
      for (let i = 0; i < 3 + p * 2; i++) this.part({ x: x + rand(-30, 30), y: -rand(4, 30), vx: rand(-50, 50), vy: rand(-80, -30), life: rand(1.1, 1.9), size: rand(14, 26), color: 'rgba(26,14,14,0.38)', type: 'puff', grav: -24, drag: 1, grow: 34 });
      this.groundShards(x, Math.round(3 + p * 2), 0.6 + p * 0.25);
    }
    if (!s.quiet) AudioManager.play('thunder', { pitch: clamp(1.25 - p * 0.18, 0.8, 1.2) });
  },
  updateStorm(realDt, dt) {
    const S = this.storm();
    for (let i = S.strikes.length - 1; i >= 0; i--) {
      const s = S.strikes[i], wasBefore = s.t < 0;
      s.t += dt;
      if (s.onto && s.onto.sk) { const a = stormAnchor(s.onto, s.anchor); s.x = a.x; s.y = a.y; }
      // the ground mark breathes out a few rising sparks while the leader comes down
      if (s.t < 0 && s.warn && !s.ghost && Math.random() < 0.35) this.part({ x: s.x + rand(-26, 26), y: s.y - 2, vx: rand(-20, 20), vy: rand(-160, -60), life: rand(0.2, 0.4), size: rand(1, 2), color: '#ff6a52', type: 'spark', grav: -40, drag: 2, add: true });
      if (wasBefore && s.t >= 0 && !s.hit) { s.hit = true; this.stormContact(s); }
      // crawling arcs between the crack ends while the floor is still hot
      if (s.hit && !s.ghost && s.y > -40 && s.t < 0.55) {
        s.crawlT -= dt;
        if (s.crawlT <= 0) {
          s.crawlT = 0.05;
          const c = S.cracks[S.cracks.length - 1 - ((Math.random() * Math.min(S.cracks.length, 6)) | 0)];
          if (c) { const j = 2 + (((Math.random() * (c.seg.length / 2 - 1)) | 0) * 2); this.lightning(c.seg[0] + rand(-8, 8), -2, c.seg[j], c.seg[j + 1] - rand(4, 20), { w: 1 + s.p * 0.3, branches: 1, dur: 0.06, color: '#' + s.col.map(v => v.toString(16).padStart(2, '0')).join('') }); }
        }
      }
      if (s.t >= STORM.boltDur) S.strikes.splice(i, 1);
    }
    for (let i = S.bg.length - 1; i >= 0; i--) { S.bg[i].t += dt; if (S.bg[i].t > 0.4) S.bg.splice(i, 1); }
    for (const arr of [S.cracks, S.scorch]) for (let i = arr.length - 1; i >= 0; i--) { arr[i].t += dt; if (arr[i].t >= arr[i].dur) arr.splice(i, 1); }
    if (S.light) { S.light.t += dt; if (S.light.t >= STORM.lightDur) S.light = null; }
    // the storm overhead: its strength eases toward the target; distant strikes and sheet lightning on their timers
    const A = S.amb;
    A.lv = damp(A.lv, A.target, 1.2, realDt);
    A.rain = damp(A.rain, A.rainTarget || 0, 0.8, realDt); A.rainT += dt;
    if (A.sheet > 0) { A.sheetT += dt; if (A.sheetT > 0.5) A.sheet = 0; }
    if (A.target > 0.2 && !A.calm) {
      A.next -= dt; A.sheetNext -= dt;
      if (A.next <= 0) { A.next = rand(4.5, 9) / Math.max(1, A.target * 0.8); this.bgStrike(rand(0.08, 0.92) * W, rand(0.7, 1.1) * Math.min(1.3, 0.6 + A.target * 0.25), A.colHex); }
      if (A.sheetNext <= 0) { A.sheetNext = rand(1.8, 4.2) / Math.max(1, A.target * 0.7); A.sheet = rand(0.35, 0.7); A.sheetT = 0; A.sheetX = rand(0.15, 0.85) * W; if (Math.random() < 0.5) AudioManager.play('rumble', { pitch: rand(0.6, 0.85) }); }
    }
    // Raikon's eyes leave a short red trace when he moves fast
    const au = S.aura;
    if (au && au.f && au.f.sk && au.lv >= 2 && au.f.visible) {
      const f = au.f, r = BODY.head * f.scale * f.build.head;
      S.eyes.push({ x: f.sk.head.x + f.facing * r * 0.4, y: f.sk.head.y - r * 0.08, t: 0 });
    }
    for (let i = S.eyes.length - 1; i >= 0; i--) { S.eyes[i].t += dt; if (S.eyes[i].t > 0.16) S.eyes.splice(i, 1); }
    if (S.eyes.length > 14) S.eyes.splice(0, S.eyes.length - 14);
  },
  // the storm's strength: 0 = clear, 1 = sub-boss storm, 2-3 = Raikon. o: { color, rain (0..1), calm (no more strikes) }
  setStorm(lv, o) {
    const A = this.storm().amb; o = o || {};
    A.target = lv; if (o.color) { A.col = hexRgb(o.color); A.colHex = o.color; } else if (!A.colHex) A.colHex = '#ff2e22';
    if (o.rain != null) A.rainTarget = o.rain;
    A.calm = !!o.calm;
  },
  // Raikon's presence, called once per simulation step with his phase level (1..3): arcs crawling over his body,
  // embers lifting off him, and in his last phase stray bolts from the blade to the floor. Purely visual.
  stormAura(f, lv, mantle) {
    const S = this.storm();
    S.aura = { f, lv };
    if (!f.visible || !f.alive || !f.sk) return;
    const sk = f.sk, j = ['hip', 'neck', 'head', 'sh', 'fel', 'fha', 'bel', 'bha', 'fkn', 'bkn', 'wt'];
    f._stormT = (f._stormT || 0) + 1;
    const every = lv >= 3 ? 4 : lv >= 2 ? 6 : 9;
    if (!mantle && f._stormT % every === 0) {
      const a = sk[j[(Math.random() * j.length) | 0]], b = sk[j[(Math.random() * j.length) | 0]];
      if (a !== b && Math.hypot(a.x - b.x, a.y - b.y) > 18) this.lightning(a.x, a.y, b.x + rand(-6, 6), b.y + rand(-6, 6), { w: 0.9 + lv * 0.2, branches: 1, dur: 0.06 });
    }
    if (Math.random() < 0.12 * lv) this.part({ x: f.x + rand(-26, 26) * f.scale, y: f.y - rand(20, 200) * f.scale, vx: rand(-20, 20), vy: rand(-110, -40), life: rand(0.5, 0.9), size: rand(1.2, 2.2), color: chance(0.7) ? '#ff4a3c' : '#ffd0c4', type: 'spark', grav: -30, drag: 1.5, add: true });
    if (lv >= 3 && f._stormT % 70 === 0 && f.grounded) this.lightning(sk.wt.x, sk.wt.y, sk.wt.x + f.facing * rand(30, 90), 0, { w: 1.6, branches: 2, dur: 0.1 });
  },

  /* ---- drawing ---- */
  // screen space, right after the background: storm darkness, clouds, sheet lightning, distant strikes and the sky
  // lit up by the latest strike
  drawStormSky(ctx, s, toScreen, realT) {
    const S = this.storm(), A = S.amb, set = SaveManager.data.settings, rf = set.reduceFlash ? 0.3 : 1;
    const lvK = clamp(A.lv / 3, 0, 1), L = S.light, lightK = L ? L.k * stormFlicker(L.t) * rf : 0;
    if (lvK < 0.01 && lightK < 0.01 && !S.bg.length) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (lvK > 0.01) {
      // the storm darkens the arena and pulls it toward a bruised red
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.25 + lvK * 0.55;
      ctx.fillStyle = 'rgb(118,82,92)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      // a low red glow along the horizon: the storm's underside lit by lightning out of sight
      const hz = GROUND - FLOOR_DEPTH, g = ctx.createLinearGradient(0, hz - 220, 0, hz);
      g.addColorStop(0, 'rgba(120,10,10,0)'); g.addColorStop(1, `rgba(150,18,14,${0.22 * lvK})`);
      ctx.fillStyle = g; ctx.fillRect(0, hz - 220, W, 220);
    }
    // distant strikes on the horizon, under the cloud deck
    for (const b of S.bg) {
      const st = b.t < 0.05 ? 0 : b.t < 0.1 ? -1 : b.t < 0.16 ? 1 : -1, a = b.t < 0.2 ? 1 : 1 - (b.t - 0.2) / 0.2;
      ctx.lineCap = 'round'; ctx.lineJoin = 'miter';
      if (st >= 0) strokeBolt(ctx, b.trees[st], 1.3 * b.p, b.col, a * 0.9, BOLT_LAYERS);
      else strokeBolt(ctx, b.trees[0], 0.8 * b.p, b.col, a * 0.35, BOLT_LAYERS_DIM);
      // the small flare where it touches the horizon
      if (b.t < 0.12) { const r = 70 * b.p, k = 1 - b.t / 0.12, gg = ctx.createRadialGradient(0, 0, 0, 0, 0, r); gg.addColorStop(0, stormRgb(b.col, 0.55 * k)); gg.addColorStop(1, 'rgba(255,60,40,0)'); ctx.save(); ctx.translate(b.x1, b.bot); ctx.scale(1, 0.18); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.restore(); }
    }
    if (lvK > 0.01) {
      const sheet = A.sheet > 0 ? A.sheet * stormFlicker(A.sheetT * 0.9) * rf : 0;
      stormClouds(ctx, s.cam.x, realT, lvK, Math.max(sheet, lightK * 0.9), A.sheetX || W / 2, A.col);
    }
    // the sky lit by a strike: a red wash from the top, hottest above where it fell
    if (lightK > 0.01) {
      const sx = L.wx != null ? toScreen(L.wx, 0).x : L.sx;
      ctx.globalCompositeOperation = 'screen';
      const g = ctx.createLinearGradient(0, 0, 0, GROUND);
      g.addColorStop(0, stormRgb(L.col, 0.4 * lightK)); g.addColorStop(0.6, stormRgb([L.col[0] * 0.6 | 0, L.col[1] * 0.4 | 0, L.col[2] * 0.4 | 0], 0.22 * lightK)); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, GROUND);
      const rg = ctx.createRadialGradient(sx, 0, 0, sx, 0, 560);
      rg.addColorStop(0, `rgba(255,190,176,${0.3 * lightK})`); rg.addColorStop(1, 'rgba(255,40,30,0)');
      ctx.fillStyle = rg; ctx.fillRect(sx - 560, 0, 1120, 560);
    }
    ctx.restore();
  },
  // world space, under the fighters: scorch, cracks, Raikon's ground glow, ground marks of strikes still coming
  drawStormGround(ctx) {
    const S = this.storm(), T = this.time;
    if (!S.scorch.length && !S.cracks.length && !S.aura && !S.strikes.length) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const c of S.scorch) {
      const k = c.t / c.dur, a = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      ctx.fillStyle = `rgba(10,3,4,${0.55 * a})`; ctx.beginPath(); ctx.ellipse(c.x, 2, c.r, c.r * 0.2, 0, 0, TAU); ctx.fill();
      if (k < 0.35) { const h = 1 - k / 0.35; ctx.fillStyle = stormRgb(c.col, 0.5 * h); ctx.beginPath(); ctx.ellipse(c.x, 1, c.r * 0.55, c.r * 0.11, 0, 0, TAU); ctx.fill(); }
    }
    for (const c of S.cracks) {
      const k = c.t / c.dur, grow = Ease.outCubic(clamp(c.t / 0.08, 0, 1)), heat = clamp(1 - k / 0.7, 0, 1), a = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25;
      const n = Math.max(2, Math.round((c.seg.length / 2) * grow));
      const path = () => { ctx.beginPath(); ctx.moveTo(c.seg[0], c.seg[1]); for (let i = 1; i < n; i++) ctx.lineTo(c.seg[i * 2], c.seg[i * 2 + 1]); ctx.stroke(); };
      ctx.strokeStyle = `rgba(8,2,3,${0.85 * a})`; ctx.lineWidth = 3.4; path();
      if (heat > 0) { ctx.strokeStyle = stormRgb(c.col, heat * 0.95); ctx.lineWidth = 1.8; path(); }
      if (c.t < 0.14) { ctx.strokeStyle = `rgba(255,244,236,${1 - c.t / 0.14})`; ctx.lineWidth = 0.9; path(); }
    }
    // strikes still on their way down: a flat red mark on the floor, tightening as contact nears
    for (const s of S.strikes) {
      if (s.t >= 0 || !s.warn || s.ghost || s.y < -40) continue;
      const k = 1 - (-s.t / s.warn), r = lerp(90, 34, Ease.outCubic(k)) * Math.min(1.4, s.p), pulse = 0.6 + 0.4 * Math.sin(T * 40);
      ctx.strokeStyle = stormRgb(s.col, (0.35 + 0.55 * k) * pulse); ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(s.x, 0, r, r * 0.22, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = stormRgb(s.col, 0.18 * k); ctx.beginPath(); ctx.ellipse(s.x, 0, r * 0.6, r * 0.13, 0, 0, TAU); ctx.fill();
    }
    // Raikon: a red underglow breathing at his feet, stronger each phase
    const au = S.aura;
    if (au && au.f.visible && au.f.alive) {
      const f = au.f, R = (110 + au.lv * 30) * f.scale, a = (0.12 + au.lv * 0.07) * (0.8 + 0.2 * Math.sin(T * 5));
      const g = ctx.createRadialGradient(f.x, 0, 0, f.x, 0, R);
      g.addColorStop(0, `rgba(255,40,28,${a})`); g.addColorStop(1, 'rgba(255,40,28,0)');
      ctx.fillStyle = g; ctx.save(); ctx.translate(f.x, 0); ctx.scale(1, 0.2); ctx.translate(-f.x, 0); ctx.beginPath(); ctx.arc(f.x, 0, R, 0, TAU); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  },
  // world space, over the fighters: the bolts themselves (leaders, strokes, the fading channel) and Raikon's eye trace
  drawStormWorld(ctx) {
    const S = this.storm();
    if (!S.strikes.length && !S.eyes.length) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'miter';
    for (const s of S.strikes) {
      if (s.ghost) continue;
      const shift = [s.x - s.x0, s.y - s.y0], w = 3.2 * Math.min(1.6, s.p);
      if (s.t < 0) {
        // the stepped leader: a thin flickering channel feeling its way down, one held frame in three dark
        const k = Ease.inCubic(clamp(1 + s.t / s.warn, 0, 1)), on = ((s.t * 60) | 0) % 3 !== 0;
        if (on) strokeBolt(ctx, [s.trees[0][0]], w * 0.45, s.col, 0.85, BOLT_LAYERS_DIM, shift, 0.1 + k * 0.82);
        continue;
      }
      let st = null;
      for (const r of STORM.strokes) if (s.t >= r[0] && s.t < r[1]) st = r;
      if (st) {
        // contact: the first 3 frames are thicker and hotter
        const hot = s.t < 0.034 ? 1.35 : 1;
        strokeBolt(ctx, s.trees[st[2]], w * hot, s.col, st[3], BOLT_LAYERS, shift);
      } else {
        // dark frames and the tail: only the glowing channel of the main stroke, cooling
        const a = s.t < STORM.strokes[2][1] ? 0.5 : Math.max(0, 0.5 * (1 - (s.t - STORM.strokes[2][1]) / (STORM.boltDur - STORM.strokes[2][1])));
        if (a > 0.02) strokeBolt(ctx, [s.trees[0][0]], w * 0.55, s.col, a, BOLT_LAYERS_DIM, shift);
      }
    }
    if (S.eyes.length > 1) {
      ctx.lineCap = 'round';
      for (let i = 1; i < S.eyes.length; i++) {
        const a = S.eyes[i], b = S.eyes[i - 1], k = 1 - a.t / 0.16;
        if (Math.hypot(a.x - b.x, a.y - b.y) > 60) continue;
        ctx.strokeStyle = `rgba(255,60,44,${0.8 * k})`; ctx.lineWidth = 3.4 * k + 0.6;
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(a.x, a.y); ctx.stroke();
      }
    }
    ctx.restore();
  },
  // screen space, after the world: the floor and fighters lit by the strike, the contact veil, and rain
  drawStormLight(ctx, s, toScreen, realT, zoom) {
    const S = this.storm(), A = S.amb, set = SaveManager.data.settings, rf = set.reduceFlash ? 0.3 : 1, L = S.light;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (L) {
      const k = L.k * stormFlicker(L.t) * rf;
      if (k > 0.01 && L.wx != null) {
        const sp = toScreen(L.wx, 0), R = 460 * zoom;
        ctx.globalCompositeOperation = 'screen';
        ctx.save(); ctx.translate(sp.x, sp.y); ctx.scale(1, 0.55);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
        g.addColorStop(0, stormRgb([255, 150, 130], 0.5 * k)); g.addColorStop(0.4, stormRgb(L.col, 0.22 * k)); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
        // the contact veil: two frames of pale light over everything (strong strikes only)
        if (L.t < 0.034 && L.k > 0.7) { ctx.fillStyle = `rgba(255,232,226,${0.3 * rf * L.k})`; ctx.fillRect(0, 0, W, H); }
      }
    }
    // rain: long slanted streaks, brighter when lightning flashes
    if (A.rain > 0.02) {
      const flash = (L ? L.k * stormFlicker(L.t) : 0) + (A.sheet > 0 ? A.sheet * 0.4 : 0), n = Math.round(90 * A.rain), sl = 0.22;
      ctx.strokeStyle = `rgba(${200 + flash * 55 | 0},${200 - flash * 40 | 0},${205 - flash * 40 | 0},${(0.16 + flash * 0.3) * A.rain})`; ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const spd = 900 + (i * 37) % 400, len = 30 + (i * 13) % 26, y = ((i * 211.3 + A.rainT * spd) % (H + 80)) - 40, x = ((i * 97.7 - s.cam.x * 0.6 + y * sl) % (W + 60) + W + 60) % (W + 60) - 30;
        ctx.moveTo(x, y); ctx.lineTo(x - len * sl, y - len);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
});
// where a strike lands on a fighter
function stormAnchor(f, anchor) {
  const sk = f.sk; if (!sk) return { x: f.x, y: 0 };
  const j = anchor === 'head' ? sk.head : anchor === 'hip' ? sk.hip : (f.weaponLen && f.weaponLen() > 0 ? sk.wt : sk.fha);
  return { x: j.x, y: j.y };
}
// the cloud deck: two cached strips (dark and lit), scrolled with a slow parallax; the lit strip shows through by the
// light of a strike or sheet lightning, hottest around `lx`
let _stormClouds = null;
function stormClouds(ctx, camX, t, lvK, lit, lx, col) {
  if (!_stormClouds) {
    const CW = W * 2, CH = 300, paint = (litUp) => makeLayer(CW, CH, (g) => {
      const r = seeded(77);   // same seed: the lit strip lines up with the dark one
      for (let pass = 0; pass < 3; pass++) for (let i = 0; i < 70; i++) {
        const x = r() * CW, y = r() * CH * (0.25 + pass * 0.22), rx = 80 + r() * 160, ry = 26 + r() * 46;
        if (litUp) {
          // light caught in the underside of each lobe: a soft glow, never a hard shape
          const cy = y + ry * 0.4, rg = g.createRadialGradient(x, cy, 0, x, cy, rx * 0.85);
          rg.addColorStop(0, pass === 2 ? 'rgba(255,120,96,0.42)' : 'rgba(255,60,44,0.22)'); rg.addColorStop(1, 'rgba(255,40,30,0)');
          g.fillStyle = rg; g.save(); g.translate(x, cy); g.scale(1, ry / rx); g.translate(-x, -cy); g.beginPath(); g.arc(x, cy, rx * 0.85, 0, TAU); g.fill(); g.restore();
        }
        else { g.fillStyle = `rgba(${8 + pass * 5},${5 + pass * 3},${8 + pass * 4},${0.6 + pass * 0.12})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(120,40,40,0.06)'; g.beginPath(); g.ellipse(x, y - ry * 0.35, rx * 0.8, ry * 0.4, 0, 0, TAU); g.fill(); }
      }
      // fade the deck's lower edge out
      g.globalCompositeOperation = 'destination-in';
      const fg = g.createLinearGradient(0, 0, 0, CH); fg.addColorStop(0, 'rgba(0,0,0,1)'); fg.addColorStop(0.65, 'rgba(0,0,0,0.85)'); fg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = fg; g.fillRect(0, 0, CW, CH);
    });
    _stormClouds = { dark: paint(false), lit: paint(true), w: W * 2 };
  }
  const C2 = _stormClouds, off = ((camX * 0.08 + t * 7) % C2.w + C2.w) % C2.w;
  ctx.globalAlpha = 0.5 + lvK * 0.5;
  ctx.drawImage(C2.dark, -off, -20); ctx.drawImage(C2.dark, C2.w - off, -20);
  if (lit > 0.02) {
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = Math.min(1, lit);
    ctx.drawImage(C2.lit, -off, -20); ctx.drawImage(C2.lit, C2.w - off, -20);
    const g = ctx.createRadialGradient(lx, 60, 0, lx, 60, 420);
    g.addColorStop(0, stormRgb(col, 0.35 * lit)); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(lx - 420, 0, 840, 420);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 1;
}

/* ======================================================================== */
/* StormDirector: when the sky strikes in a fight. FightSession calls it at  */
/* setup, each intro tick, each step, on boss phases, abilities and the KO. */
/* ======================================================================== */
// Sub-bosses (every act) fight under a storm: a strike lands on them as they arrive, on each phase change, on each
// signature move's wind-up, and on their defeat. Raikon gets the full storm: a heavier sky that deepens each phase,
// a strike he rides down as he lands, an intro where he calls lightning onto his raised blade, strikes on the blade as
// each move gathers and on the ground where Storm Break lands, his crackling aura, and when he falls the storm breaks
// into rain. A Core echo (def.echoOf) keeps its corrupted violet for every bolt.
const StormDirector = {
  setup(s) {
    const e = s.enemy;
    s.storm = null;
    if (!e || s.spar || s.memory || !(s.isBoss || s.isSub)) return;
    const raikon = e.def.id === 'raikon';
    if (!s.isSub && !raikon) return;   // the other story bosses keep their own identity (violet, gold, void)
    const color = e.def.echoOf ? ECHO_TINT : '#ff2e22';
    // a Core echo fights in the violet void: its bolts strike, but no storm sky hangs over it
    s.storm = { raikon, color, introStruck: false, called: 0, lv: raikon ? 2 : e.def.echoOf ? 0 : 1 };
    s.fx.setStorm(s.storm.lv, { color, rain: 0 });
    s.fx.storm().amb.lv = s.storm.lv * 0.6;   // already gathering as the fight opens
    if (raikon && typeof RAIKON_POSE !== 'undefined' && !POSES.raikonCall) POSES.raikonCall = RAIKON_POSE.overhead;
  },
  intro(s, e) {
    const st = s.storm; if (!st) return;
    const t = s.phaseT, fx = s.fx;
    if (st.raikon) {
      // he rides the strike down: the bolt lands with him (bossLanded fires on the same tick he touches down)
      if (s.bossLanded && !st.introStruck) { st.introStruck = true; fx.skyStrike(e.x, { p: 1.9, forks: 6, color: st.color, shake: 0.5, sheet: 'raikon_sky_strike', scale: e.scale }); fx.bgStrike(W * 0.18, 1.1, st.color); }
      // then he raises the blade and calls the storm onto it
      if (st.introStruck && st.called === 0 && t > 1.45) { st.called = 1; e.poseName = 'raikonCall'; fx.skyStrike(0, { onto: e, anchor: 'wt', p: 1.25, warn: 0.3, color: st.color, shake: 0.3 }); }
      if (st.called === 1 && t > 2.05) { st.called = 2; fx.bgStrike(W * 0.82, 1.2, st.color); }
      if (st.called === 2 && t > 2.6) { st.called = 3; e.poseName = 'taunt'; }
      if (st.called >= 1) fx.stormAura(e, 3);
    } else {
      // the sub-boss arrives on a strike: the leader comes down as he closes in, contact as he plants his feet
      if (!st.introStruck && t > 0.2) { st.introStruck = true; fx.skyStrike(300, { p: 1.3, warn: 0.3, color: st.color, forks: 4 }); }
      if (st.called === 0 && t > 1.2) { st.called = 1; fx.bgStrike(W * (Math.random() < 0.5 ? 0.15 : 0.85), 1, st.color); }
    }
  },
  step(s) {
    const st = s.storm; if (!st || !st.raikon) return;
    const e = s.enemy;
    if (e && e.alive && s.phase !== 'intro') {
      const lv = 1 + ((e.ai && e.ai.phase) || 0);
      // his storm presence, drawn on the canvas: arcs crawling over his body, embers, his underglow and eye trace,
      // stronger each phase (the baked Storm Mantle's red rings round his body are no longer played)
      s.fx.stormAura(e, lv, false);
    } else if (e && !e.alive) { s.fx.storm().aura = null; if (st.mantle) { st.mantle.stop = true; st.mantle.fadeDur = 0.6; st.mantle = null; } }
  },
  phase(s, f, idx) {
    const st = s.storm; if (!st || f !== s.enemy) return;
    if (st.raikon) s.fx.skyStrike(f.x, { p: 1.8, color: st.color, forks: 5, shake: 0.45, warn: 10 / 60, sheet: 'raikon_sky_strike', scale: f.scale });
    else s.fx.skyStrike(0, { onto: f, anchor: 'head', p: 1.35, color: st.color, forks: 5, shake: 0.45 });
    if (st.raikon) {
      st.lv = 2 + idx * 0.5; s.fx.setStorm(st.lv, { color: st.color });
      s.fx.bgStrike(W * 0.2, 1.2, st.color); s.fx.bgStrike(W * 0.8, 1.2, st.color);
      if (idx >= 2) s.fx.screenTint('rgba(255,30,20,', 0.9);
      AudioManager.play('boss');
    }
  },
  // a signature move begins (BossAI.tryAbility): the storm answers its wind-up with a strike on the weapon
  ability(s, f, a) {
    const st = s.storm; if (!st || f !== s.enemy || !f.alive) return;
    if (a.id === 'skyfall') return;   // Skyfall calls the storm with his hand and draws its own (38-skyfall.js)
    if (st.raikon) {
      // Redline Counter: the crescent barrier for the stance (40-ai.js fades it when the counter triggers); the other
      // moves: lightning pulled onto the blade tip, played so its glint lands just before the release
      if (a.id === 'redlineCounter') { f._redlineFx = s.fx.playSheet('raikon_redline_guard', f.x, f.y, { at: f, scale: f.scale }); if (f._redlineFx) return; }
      else if (s.fx.playSheet('raikon_blade_charge', f.x, f.y, { at: f, anchor: 'wt', scale: f.scale, rate: 0.6 / Math.max(0.25, (f.telegraph || 0.6) - 0.05) })) return;
      s.fx.skyStrike(0, { onto: f, anchor: 'wt', p: 1.15, color: st.color, forks: 3, shake: 0.22 });
    } else s.fx.skyStrike(0, { onto: f, anchor: 'wt', p: 0.8, color: st.color, forks: 2, shake: 0.16 });
  },
  // Storm Break (Raikon's, and Garan's / Shiden's reduced versions) lands: the sky strikes the same spot the blade does
  groundStrike(w, x, p, tint) {
    if (!w.storm) return;
    w.fx.skyStrike(x, { p: p, color: tint || w.storm.color, forks: 3, shake: 0.2, sheet: w.storm.raikon && !tint ? 'raikon_sky_strike' : null,
      scale: w.enemy ? w.enemy.scale : 1 });
  },
  ko(s, def) {
    const st = s.storm; if (!st) return;
    if (def === s.enemy) {
      if (st.raikon) s.fx.skyStrike(def.x, { p: 1.7, color: st.color, forks: 5, shake: 0.3, warn: 10 / 60, sheet: 'raikon_sky_strike', scale: def.scale });
      else s.fx.skyStrike(0, { onto: def, anchor: 'hip', p: 1.3, color: st.color, forks: 5, shake: 0.3 });
      // Raikon: the binding breaks and the storm with it; it comes down as rain ("It feels like rain.")
      if (st.raikon) s.fx.setStorm(0.8, { color: st.color, rain: 1, calm: true });
      else s.fx.setStorm(0, { color: st.color, calm: true });
    } else s.fx.setStorm(st.lv, { color: st.color, calm: true });
  }
};
