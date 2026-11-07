/* KAGE — Fighter: procedural skeleton, pose blending, state machine, gear & weapon art (Player / Enemy share it) */

const BODY = { torso: 60, neck: 7, head: 18, upper: 36, fore: 34, thigh: 45, shin: 47 };
const SHAPE = {
  fists: 'none', tsubame: 'short', kagetsu: 'katana', shizuka: 'katana', onikiri: 'cleaver', mizuchi: 'spear',
  yamigama: 'sickle', iwakudaki: 'hammer', shinsen: 'shinsen', raiko_no_tachi: 'odachi', raikon_tachi: 'odachi', takashi_blade: 'katana', kagehira_yurei: 'short', akari_blades: 'short', mugen_no_ha: 'katana', mugen_shards: 'katana',
  shadow_daggers: 'short', hollow_crescents: 'crescent', mist_fans: 'fan',
  courier_kunai: 'short', quiet_kodachi: 'katana', echo_crescents: 'crescent', ledger_kusari: 'sickle',
  gate_kanabo: 'hammer', disciple_blade: 'katana', conduit_naginata: 'spear', silent_odachi: 'katana',
  sentinel_spear: 'spear', vanguard_yari: 'spear', sage_staff: 'staff', storm_orbs: 'none', iron_fists: 'none', chain_hook: 'hook',
  tyrant_cleaver: 'tyrant', cutter_blade: 'katana', temple_staff: 'staff', raider_cleaver: 'cleaver', bokken: 'bokken',
  echo_tachi: 'odachi', echo_fangs: 'short', echo_nameless: 'katana', echo_rem_blade: 'katana'
};
const IK_OFF = { katana: -0.2, spear: -0.3, hammer: 0.3, staff: -0.32 };
const CARRY = { katana: 40, short: 30, cleaver: 60, odachi: 56, spear: 10, sickle: 70, hammer: 100, staff: 0, crescent: 40, fan: 40, hook: 70, tyrant: 60, none: 0 };

/* ---------------- Cloth (verlet chain) for scarves, capes, robes ---------------- */
class Cloth {
  constructor(n, seg, o) {
    this.n = n; this.seg = seg; this.o = o; this.init = false;
    this.px = new Float32Array(n); this.py = new Float32Array(n); this.ox = new Float32Array(n); this.oy = new Float32Array(n);
  }
  update(ax, ay, facing, vx, dt, t) {
    const n = this.n, px = this.px, py = this.py, ox = this.ox, oy = this.oy, seg = this.seg;
    if (!this.init) {
      // `hang` (0..1): start hanging down and slightly back instead of straight out behind (long coat skirts settle at once)
      const hg = this.o.hang, hx = hg ? hg : 1, hy = hg ? Math.sqrt(1 - hg * hg) * seg : 2;
      for (let i = 0; i < n; i++) { px[i] = ox[i] = ax - facing * i * seg * hx; py[i] = oy[i] = ay + i * hy; }
      this.init = true;
    }
    const wind = (this.o.wind || 520) + Math.sin(t * 3.1 + this.o.ph) * 260;
    const g = this.o.grav || 700, dt2 = dt * dt;
    for (let i = 1; i < n; i++) {
      const vx_ = (px[i] - ox[i]) * 0.94, vy_ = (py[i] - oy[i]) * 0.94;
      ox[i] = px[i]; oy[i] = py[i];
      px[i] += vx_ + (-facing * wind - vx * 0.6) * dt2 * (i / n);
      py[i] += vy_ + (g + Math.sin(t * 7 + i + this.o.ph) * 160) * dt2;
    }
    px[0] = ax; py[0] = ay; ox[0] = ax; oy[0] = ay;
    for (let k = 0; k < 3; k++) {
      for (let i = 1; i < n; i++) {
        const dx = px[i] - px[i - 1], dy = py[i] - py[i - 1];
        const d = Math.sqrt(dx * dx + dy * dy) || 0.001, diff = (d - seg) / d;
        px[i] -= dx * diff; py[i] -= dy * diff;
      }
      // bend resistance for thin fabric: links two apart may not close up, so a tail ripples instead of folding into loops
      if (this.o.stiff) for (let i = 2; i < n; i++) {
        const dx = px[i] - px[i - 2], dy = py[i] - py[i - 2], d = Math.sqrt(dx * dx + dy * dy) || 0.001, min = seg * this.o.stiff;
        if (d < min) { const k = (min - d) / d; px[i] += dx * k; py[i] += dy * k; }
      }
    }
  }
  draw(ctx, color, w0, w1, edge) {
    const n = this.n, px = this.px, py = this.py;
    if (!this.init) return;
    ctx.beginPath();
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = i === 0 ? 0 : i - 1, b = i === n - 1 ? n - 1 : i + 1;
      let dx = px[b] - px[a], dy = py[b] - py[a];
      const d = Math.sqrt(dx * dx + dy * dy) || 1; dx /= d; dy /= d;
      const w = lerp(w0, w1, i / (n - 1)) * 0.5;
      L.push(px[i] - dy * w, py[i] + dx * w); R.push(px[i] + dy * w, py[i] - dx * w);
    }
    ctx.moveTo(L[0], L[1]);
    for (let i = 2; i < L.length; i += 2) ctx.lineTo(L[i], L[i + 1]);
    for (let i = R.length - 2; i >= 0; i -= 2) ctx.lineTo(R[i], R[i + 1]);
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
    if (edge) {
      ctx.beginPath(); ctx.moveTo(px[0], py[0]);
      for (let i = 1; i < n; i++) ctx.lineTo(px[i], py[i]);
      ctx.strokeStyle = edge; ctx.lineWidth = 1.2; ctx.stroke();
    }
  }
  // fabric tail: smooth centre line, tapering from the knot (w0) to the tip (w1)
  ribbon(ctx, color, w0, w1) {
    if (!this.init) return;
    const n = this.n, px = this.px, py = this.py, L = this._rl || (this._rl = new Float32Array(n * 2)), R = this._rr || (this._rr = new Float32Array(n * 2));
    for (let i = 0; i < n; i++) {
      const a = i === 0 ? 0 : i - 1, b = i === n - 1 ? n - 1 : i + 1;
      let dx = px[b] - px[a], dy = py[b] - py[a]; const d = Math.sqrt(dx * dx + dy * dy) || 1; dx /= d; dy /= d;
      const u = i / (n - 1), w = (w0 + (w1 - w0) * u * u) * 0.5 * (1 + 0.12 * Math.sin(i * 1.7 + this.o.ph));
      L[i * 2] = px[i] - dy * w; L[i * 2 + 1] = py[i] + dx * w; R[i * 2] = px[i] + dy * w; R[i * 2 + 1] = py[i] - dx * w;
    }
    const side = (A, from, to, step) => {
      for (let i = from; i !== to; i += step) { const j = i + step; ctx.quadraticCurveTo(A[i * 2], A[i * 2 + 1], (A[i * 2] + A[j * 2]) / 2, (A[i * 2 + 1] + A[j * 2 + 1]) / 2); }
    };
    ctx.beginPath(); ctx.moveTo(L[0], L[1]);
    side(L, 0, n - 1, 1); ctx.lineTo(L[(n - 1) * 2], L[(n - 1) * 2 + 1]);
    ctx.lineTo(px[n - 1] + (px[n - 1] - px[n - 2]) * 0.35, py[n - 1] + (py[n - 1] - py[n - 2]) * 0.35); // cut, slightly pointed end
    ctx.lineTo(R[(n - 1) * 2], R[(n - 1) * 2 + 1]);
    side(R, n - 1, 0, -1); ctx.lineTo(R[0], R[1]);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }
  strand(ctx, color, width) {
    if (!this.init) return;
    ctx.beginPath(); ctx.moveTo(this.px[0], this.py[0]);
    for (let i = 1; i < this.n - 1; i++) {
      const mx = (this.px[i] + this.px[i + 1]) / 2, my = (this.py[i] + this.py[i + 1]) / 2;
      ctx.quadraticCurveTo(this.px[i], this.py[i], mx, my);
    }
    ctx.lineTo(this.px[this.n - 1], this.py[this.n - 1]);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.stroke();
  }
}

/* ---------------- Fighter ---------------- */
let FIGHTER_UID = 0;
// double-jump flip: slow wind-up, a very fast middle, then an eased finish (a full 360 that ends exactly upright)
const FLIP_DUR = 0.5;
function flipEase(u) { return u < 0.5 ? 0.5 * Math.pow(2 * u, 2.6) : 1 - 0.5 * Math.pow(2 - 2 * u, 2.6); }
function flipSpeed(u) { return Math.pow(u < 0.5 ? 2 * u : 2 - 2 * u, 1.6); } // 0..1, peaks mid-spin
// knockback tumble: eases out of the launch, rolls fastest mid-air, slows to brace for the landing
function tumbleEase(u) { return u < 0.5 ? 0.5 * Math.pow(2 * u, 1.7) : 1 - 0.5 * Math.pow(2 - 2 * u, 1.7); }
function angDiff(a, b) { return ((a - b) % 360 + 540) % 360 - 180; }
function blendPose(t, src, k) {
  if (k <= 0) return;
  for (let i = 0; i < POSE_KEYS.length; i++) { const key = POSE_KEYS[i], v = src[key]; if (v != null && t[key] != null) t[key] += (v - t[key]) * k; }
}
class Fighter {
  constructor(o) {
    this.uid = ++FIGHTER_UID;
    this.def = o.def || null;
    this.name = o.name; this.title = o.title || '';
    this.team = o.team || 0; this.isPlayer = !!o.isPlayer; this.minion = !!o.minion; this.clone = !!o.clone;
    this.build = Object.assign({ scale: 1, w: 10, head: 1, legs: 1, arms: 1, torso: 1 }, o.build || {});
    this.scale = this.build.scale * 1.22;
    this.x = o.x || 0; this.y = 0; this.vx = 0; this.vy = 0; this.facing = o.facing || 1;
    this.baseWeapon = o.weapon || 'fists'; this.wlvl = o.wlvl || 1; this.hasWeapon = this.baseWeapon !== 'fists';
    // helmet / armor hold the drawing keys; helmetId / armorId the gear ids (see gearLook in 15-logic.js)
    this.helmetId = o.helmet || 'shiro_maki'; this.armorId = o.armor || 'tachibana_yoroi';
    this.helmet = gearLook('helmets', this.helmetId); this.armor = gearLook('armors', this.armorId);
    this.maxHp = o.hp || 200; this.hp = this.maxHp; this.dmgMul = o.dmgMul || 1; this.defense = o.defense || 0; this.speedMul = o.speedMul || 1;
    this.blockRage = o.blockRage || 0; this.rageMul = o.rageMul || 1; this.stunRes = o.stunRes || 0; this.dashBonus = o.dashBonus || 0; this.kunaiMul = o.kunaiMul || 1;
    // difficulty mode: player dash i-frame scale; enemy attack start-up and recovery scales (all 1 on Normal)
    this.dodgeMul = o.dodgeMul || 1; this.windupMul = o.windupMul || 1; this.recoveryMul = o.recoveryMul || 1;
    this.rage = 0; this.ammo = o.ammo == null ? 5 : o.ammo; this.maxAmmo = this.ammo; this.guard = 100;
    this.eye = o.eye || C.bone; this.accent = o.accent || C.emberBright;
    this.state = 'idle'; this.st = 0; this.alive = true;
    this.move = null; this.mphase = 0; this.mt = 0; this.mdur = [0, 0, 0]; this.hitList = []; this.moveHit = false; this.multiN = 0; this.moveCharge = 0;
    this.pose = Object.assign({}, STANCES[this.weapon().stance] || STANCES.fists);
    if (this.pose.wa == null) this.pose.wa = 120; if (this.pose.wb == null) this.pose.wb = 120; this.pose.ik = this.pose.ik || 0;
    if (this.pose.tw == null) this.pose.tw = -0.2; if (this.pose.hp == null) this.pose.hp = 0;
    this.tgt = Object.assign({}, this.pose);
    this.grounded = true; this.jumps = 0; this.airDash = false;
    this.invuln = 0; this.hitstun = 0; this.stunT = 0; this.downT = 0; this.juggle = 0;
    this.buf = { punch: 0, kick: 0, weapon: 0, special: 0, jump: 0, dash: 0 };
    this.comboHits = 0; this.comboT = 0; this.lastMoveId = ''; this.lastMoveT = -9; this.repeat = 0;
    this.trail = []; this.trail2 = []; this.flash = 0; this.telegraph = 0; this.alpha = 1; this.visible = true;
    this.ctrl = makeCtrl(); this.charge = 0; this.blockT = 0; this.counterT = 0; this.dashT = 0; this.dashCd = 0; this.dashDir = 1;
    this.walkT = 0; this.runDir = 0; this.walkPhase = 0; this.flipRot = 0; this.extraRot = 0;
    this.bodyRot = 0; this.bodyRotVel = 0; this.tuckT = 0; this.flipT = 0; this.flipLand = false; this.landT = 0.08; this.landDepth = 0.5; this.jumpDir = 0;
    this.poison = 0; this.slow = 1; this.abil = null; this.grabbedBy = null; this.grabbing = null;
    this.turnDelay = o.turnDelay || 0; this.turnT = 0; this.superArmor = false;
    this.hipOff = -(BODY.thigh + BODY.shin) * this.scale * this.build.legs * 0.94;
    this.sk = {}; for (const k of ['hip', 'neck', 'sh', 'shF', 'shB', 'hipF', 'hipB', 'head', 'fel', 'fha', 'bel', 'bha', 'fkn', 'fft', 'bkn', 'bft', 'wt', 'wb', 'w2t', 'w2b']) this.sk[k] = { x: 0, y: 0 };
    this.wAng = 0; this.w2Ang = 0; this.wVec = { x: 1, y: 0 }; this.w2Vec = { x: 1, y: 0 };
    this.time = Math.random() * 10; this.poseName = null; this.stats = { dealt: 0, taken: 0, maxCombo: 0, parries: 0 };
    this.turnX = 1; this.sqx = 1; this.sqy = 1;
    // regular foes wear their family's palette (ENEMY_FAMILIES): Order slate with a pale sash, flickering Hollow violet
    this.family = (!o.isPlayer && this.def && ENEMY_FAMILIES[this.def.family]) || null;
    this.hollow = !!(this.def && this.def.family === 'hollow');
    this.rank = (this.def && this.def.rank) || 0;
    this.outfit = o.outfit || (o.isPlayer ? 'gi' : (this.def && this.def.outfit) || (this.armor === 'robe' ? 'robe' : 'plain'));
    this.cloths = [];
    if (this.outfit === 'gi') {
      const fam = this.family, sash = this.def && this.def.sash;   // `sash` on an ENEMIES entry colours the obi (young Rem's purple)
      const ord = !o.isPlayer && this.def && this.def.family === 'order';   // the Order's belt tails: crimson cord and dark cloth
      const bc = o.isPlayer ? ANIME.crimsonHi : ord ? ANIME.crimson : sash || (fam ? fam.trim : '#2a2620'), bc2 = o.isPlayer ? ANIME.crimson : ord ? '#1a1c20' : sash ? sash : fam ? '#9298a0' : '#2a2620';
      this.cloths.push({ kind: 'belt', c: new Cloth(6, 5.6 * this.scale, { ph: 7, wind: 200, grav: 1250, stiff: 1.7 }), at: 'hip', color: bc, w: 4 * this.scale, w1: 2.4 * this.scale, dy: -11, dx: -3 });
      this.cloths.push({ kind: 'belt', c: new Cloth(5, 5.4 * this.scale, { ph: 8, wind: 170, grav: 1300, stiff: 1.7 }), at: 'hip', color: bc2, w: 3.2 * this.scale, w1: 2 * this.scale, dy: -10, dx: -1 });
    }
    if (o.isPlayer && this.armor !== 'training' && (o.scarf || this.helmet === 'topknot')) {
      // Kage's signature: a red scarf wound round the neck (drawn with the body, 21-anime-body.js) with two long tails
      // streaming back, out of phase so they never move as one strip
      const sc = this.scale;
      this.cloths.push({ kind: 'scarf', c: new Cloth(12, 7.4 * sc, { ph: 9, wind: 1400, grav: 430, stiff: 1.85 }), at: 'neck', color: ANIME.scarf, rim: 'rgba(24,6,6,0.7)', w: 6.4 * sc, w1: 2.2 * sc, dy: -2, dx: 7 });
      this.cloths.push({ kind: 'scarf', c: new Cloth(10, 7 * sc, { ph: 12.5, wind: 1250, grav: 480, stiff: 1.85 }), at: 'neck', color: '#a8262c', rim: 'rgba(24,6,6,0.7)', w: 4.8 * sc, w1: 1.6 * sc, dy: 1, dx: 6 });
    } else if (this.helmet === 'topknot') {
      // two thin hachimaki tails of different length, out of phase so they never move as one strip
      const hv = this.hollow;   // Hollow Kage's band is torn violet
      this.cloths.push({ kind: 'scarf', c: new Cloth(10, 7.6 * this.scale, { ph: 9, wind: 860, grav: 680, stiff: 1.75 }), at: 'head', color: hv ? '#6a52c0' : C.emberBright, w: 3.4 * this.scale, w1: 1.3 * this.scale, dy: -8, dx: 16 });
      this.cloths.push({ kind: 'scarf', c: new Cloth(8, 7 * this.scale, { ph: 12.5, wind: 740, grav: 760, stiff: 1.75 }), at: 'head', color: hv ? '#4b3a8e' : '#b8362b', w: 2.8 * this.scale, w1: 1.1 * this.scale, dy: -6, dx: 16 });
    }
    if (this.helmet === 'headband' && isRem(this)) {
      // Rem: the band's two long tails come from the anime body (remCloths, 26-anime-rem.js)
    } else if (this.helmet === 'headband') {
      // two short tails of the training band, knotted at the back of the head
      const hc = headbandColor(this);
      this.cloths.push({ kind: 'scarf', c: new Cloth(6, 5.6 * this.scale, { ph: 9, wind: 820, grav: 700, stiff: 1.8 }), at: 'head', color: hc, w: 2.8 * this.scale, w1: 1.1 * this.scale, dy: -5, dx: 16 });
      this.cloths.push({ kind: 'scarf', c: new Cloth(5, 5 * this.scale, { ph: 12.5, wind: 700, grav: 780, stiff: 1.8 }), at: 'head', color: hc, w: 2.3 * this.scale, w1: 1 * this.scale, dy: -3, dx: 16 });
    }
    if (o.scarf && !o.isPlayer) {
      this.cloths.push({ kind: 'scarf', c: new Cloth(9, 7 * this.scale, { ph: 0, wind: 560 }), at: 'neck', color: C.emberBright, w: 5.5 * this.scale });
      this.cloths.push({ kind: 'scarf', c: new Cloth(8, 6.5 * this.scale, { ph: 2, wind: 480 }), at: 'neck', color: C.emberBright, w: 3.6 * this.scale, dy: 4 });
    }
    // capes (cloak, tyrant), robes and hood tails of the sub-boss looks: 24- / 25-anime-subs-*.js
    // Raikon: a long dark scarf from the neck, two tails of different length, edged pale so it reads on the dark arena
    if (this.def && this.def.longScarf) {
      const rk = bossLook(this) === 'raikon' && !this.hollow;   // Hollow Raikon keeps its own violet-black scarf
      const sc = rk ? '#9e1018' : this.def.longScarf, rim = rk ? 'rgba(255,90,80,0.55)' : this.hollow ? 'rgba(150,120,240,0.5)' : 'rgba(236,229,211,0.5)';
      this.cloths.push({ kind: 'scarf', c: new Cloth(14, 8.6 * this.scale, { ph: 2.5, wind: 640, grav: 620, stiff: 1.6 }), at: 'neck', color: sc, rim, w: 7.2 * this.scale, w1: 2.8 * this.scale, dy: 2 });
      this.cloths.push({ kind: 'scarf', c: new Cloth(9, 8 * this.scale, { ph: 6.2, wind: 560, grav: 700, stiff: 1.6 }), at: 'neck', color: sc, rim, w: 5.4 * this.scale, w1: 2.2 * this.scale, dy: 6 });
    }
    // Raikon's tattered cloak and long coat skirts: raikonCloths (27-anime-raikon.js)
    // Akari's ponytail, bead strings, sash and back tail: akariCloths (28-anime-akari.js)
    // long hair tied back at the nape (`hair` on an ENEMIES entry). Takashi's white hair, beard and the red ribbon from
    // his kasa are his own (29-anime-takashi.js)
    if (this.def && this.def.hair && bossLook(this) !== 'takashi') {
      this.cloths.push({ kind: 'scarf', c: new Cloth(9, 6.4 * this.scale, { ph: 3.2, wind: 520, grav: 900, stiff: 1.8 }), at: 'head', color: this.def.hair, rim: 'rgba(236,229,211,0.45)', w: 5.4 * this.scale, w1: 2.4 * this.scale, dy: 4, dx: 14 });
      this.cloths.push({ kind: 'scarf', c: new Cloth(2, 3 * this.scale, { ph: 6, wind: 760, grav: 760, stiff: 1.9 }), at: 'head', color: '#c9a45c', w: 2.2 * this.scale, w1: 1.2 * this.scale, dy: 5, dx: 15 });
    }
    // the Witness: long violet strands streaming back off the spiked crown (violet strands of different length, two dark
    // ones underneath for depth), and its long tattered coat: blade-shaped tails (kind 'wcoat', drawn by
    // the Witness's own layer inside the body, 29w-anime-witness.js) from the upper back and the waist, violet fading out of black
    // with crimson veins and glowing rune circles. `depth` -1 hangs behind the body, +1 in front of it.
    if (this.def && this.def.witness) {
      const sc = this.scale;
      [[12, 7.6, 2.2, 6.4, -12, 8, '#140c22'], [10, 7.4, 6.6, 5.4, -4, 10, '#140c22'],
       [14, 8, 3.6, 5.2, -16, 6, '#5a34b8'], [12, 7.6, 5.1, 4.4, -8, 9, '#6c44d2'], [16, 8.2, 1.4, 5.6, -1, 11, '#4e2ca4'], [10, 7, 7.7, 3.4, -18, 3, '#7d56e6']]
        .forEach(([n, seg, ph, w, dy, dx, color], i) =>
          this.cloths.push({ kind: 'scarf', witness: true, c: new Cloth(n, seg * sc, { ph, wind: 900 + i * 90, grav: 380 + i * 40, stiff: 1.88 }), at: 'head', color, rim: color === '#140c22' ? 'rgba(120,80,220,0.6)' : 'rgba(176,138,255,0.8)', w: w * sc, w1: 0.7 * sc, dy, dx }));
      // [links, link length, phase, max width, dy, dx (back from the anchor), anchor, depth, rune circle]
      [[9, 13.6, 1.1, 30, 12, 8, 'neck', -1, 1], [9, 12.8, 4.2, 24, 20, 4, 'neck', -1, 0],
       [8, 13, 2.6, 28, -2, 10, 'hip', -1, 1], [8, 12.2, 5.6, 24, 0, 16, 'hip', -1, 1], [7, 12.4, 3.3, 20, 3, 4, 'hip', -1, 0],
       [6, 11, 0.4, 16, -1, -4, 'hip', 1, 0]].forEach(([n, seg, ph, w, dy, dx, at, depth, rune], i) =>
        this.cloths.push({ kind: 'wcoat', witness: true, c: new Cloth(n, seg * sc, { ph, wind: depth < 0 ? 1500 + i * 180 : 420, grav: 1000, stiff: 1.96 }), at, w: w * sc, dy, dx, depth, rune }));
    }
    // Rem's travel coat is the anime body's own coat panels (ANIME_SKINS.rem / hollow_rem, 26-anime-rem.js)
    // the Shinsei Yoroi's robes, capelet and cape: Takashi's cloth and drawShinsei (29-anime-takashi.js)
    // the Mei-En Garb's sash (on Akari, and on Kage when he wears it): akariCloths (28-anime-akari.js)
    animeCloths(this);   // the anime body's own cloth (Kage's coat panels: 21-anime-body.js)
  }

  /* ---- equipment helpers ---- */
  elementOf(m) {
    if (m && (m.kind === 'punch' || m.kind === 'kick' || m.kind === 'grab' || m.kind === 'throw')) return this.isPlayer ? 'wind' : null;
    if (!this.hasWeapon && this.baseWeapon !== 'storm_orbs' && this.baseWeapon !== 'iron_fists') return this.isPlayer ? 'wind' : null;
    if (this.def && this.def.el) return this.def.el;   // the Witness cuts in violet void whatever weapon it copies
    return this.weapon().el || (this.isPlayer ? 'wind' : 'shade');
  }
  weaponId() { return this.hasWeapon ? this.baseWeapon : (this.baseWeapon === 'storm_orbs' || this.baseWeapon === 'iron_fists' ? this.baseWeapon : 'fists'); }
  weapon() { return WEAPONS[this.weaponId()]; }
  shape() { return SHAPE[this.weaponId()] || 'none'; }
  height() { return 196 * this.scale; }
  standHip() { return (BODY.thigh + BODY.shin) * this.scale * this.build.legs * 0.94; }
  isAttacking() { return this.state === 'move' || this.state === 'ability'; }
  isNeutral() { return this.state === 'idle' || this.state === 'walk' || this.state === 'run'; }
  canAct() { return this.isNeutral() || this.state === 'block' || this.state === 'land'; }
  airborne() { return !this.grounded; }

  setState(s) { if (s !== 'down' && s !== 'getup') this.feetLand = false; this.state = s; this.st = 0; }

  /* ---- per-tick simulation ---- */
  update(dt, world) {
    const c = this.ctrl;
    dt *= this.slow;
    this.time += dt; this.st += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.telegraph > 0) this.telegraph -= dt;
    if (this.kageFlicker > 0) this.kageFlicker -= dt;
    if (this.shardMorph > 0) this.shardMorph -= dt;
    if (this.counterT > 0) this.counterT -= dt;
    if (this.dashCd > 0) this.dashCd -= dt;
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.comboHits = 0; }
    if (this.guard < 100 && this.state !== 'block') this.guard = Math.min(100, this.guard + 22 * dt);
    if (this.poison > 0 && this.alive) {
      this.poison -= dt;
      if (((this.time * 4) | 0) !== (((this.time - dt) * 4) | 0)) { this.hp = Math.max(1, this.hp - 2.2); world && world.fx.poisonPuff(this); }
    }
    // input buffering
    // attack presses made during a wind-up are held until the chain window opens, so mashing a heavy weapon never drops inputs
    const b = this.buf, holdAtk = this.state === 'move' && this.mphase === 0;
    for (const k in b) if (b[k] > 0 && !(holdAtk && (k === 'punch' || k === 'kick' || k === 'weapon'))) b[k] -= dt;
    if (c.punchP) b.punch = 0.2; if (c.kickP) b.kick = 0.2; if (c.weaponP) b.weapon = 0.2;
    if (c.specialP) b.special = 0.16; if (c.jumpP) b.jump = 0.12; if (c.dashP) b.dash = 0.12;

    const opp = world ? world.opponentOf(this) : null;
    switch (this.state) {
      case 'idle': case 'walk': case 'run': this.updateNeutral(dt, world, opp); break;
      case 'land':
        this.friction(dt, 26);
        if (this.st > this.landT) this.setState('idle');
        else if (this.st > this.landT * 0.4) this.tryActions(world, opp);
        break;
      case 'prejump':
        this.friction(dt, 20);
        if (this.ctrl.dir) this.jumpDir = this.ctrl.dir;
        if (this.st >= 0.075) this.launchJump(world);
        break;
      case 'kickcharge': this.updateCharge(dt, world); break;
      case 'block': this.updateBlock(dt, world, opp); break;
      case 'dash': this.updateDash(dt, world); break;
      case 'air': this.updateAir(dt, world); break;
      case 'move': this.updateMove(dt, world); break;
      case 'hit': this.hitstun -= dt; this.friction(dt, 8); if (this.hitstun <= 0) this.setState(this.grounded ? 'idle' : 'air'); break;
      case 'juggle': if (this.grounded && this.st > 0.05) this.onLandHard(world); break;
      case 'down':
        this.friction(dt, 10); this.invuln = Math.max(this.invuln, 0.1);
        if (!this.alive) break;
        if (this.st > this.downT) { this.setState('getup'); this.invuln = 0.45; }
        break;
      case 'getup': if (this.st > 0.36) this.setState('idle'); break;
      case 'stun': this.stunT -= dt; this.friction(dt, 10); if (this.stunT <= 0) this.setState('idle'); break;
      case 'grabbed': break;
      case 'throwing': this.updateThrow(dt, world); break;
      case 'ability': {
        const a = this.abil;
        if (!a) { this.setState('idle'); break; }
        a.t += dt;
        const r = a.update ? a.update(this, world, a.t, dt) : undefined;
        if (this.abil === a && (r === false || a.t >= a.dur)) this.endAbility(world);
        break;
      }
      case 'pose': this.friction(dt, 10); break;
      case 'dead': this.friction(dt, 6); break;
    }
    this.physics(dt, world);
    // a mimicking foe (AIController.startMimic) faces the way Kage's mirror image would and breathes with him
    if (this.mimic) { this.facing = -this.mimic.src.facing; this.time = this.mimic.src.time; }
    else if (opp && (this.isNeutral() || this.state === 'block' || this.state === 'land' || this.state === 'kickcharge' || this.state === 'pose')) this.faceToward(opp, dt);
    this.sqx = damp(this.sqx, 1, 14, dt); this.sqy = damp(this.sqy, 1, 14, dt);
    this.updateFlip(dt, world);
    this.updateTumble(dt, world);
    this.updatePose(dt);
    this.computeSkeleton();
    this.updateCloth(dt);
    this.recordTrail();
  }

  faceToward(o, dt) {
    const want = o.x >= this.x ? 1 : -1;
    if (want === this.facing) { this.turnT = 0; return; }
    if (Math.abs(o.x - this.x) < 6) return;
    this.turnT += dt;
    if (this.turnT >= this.turnDelay) { this.facing = want; this.turnT = 0; }
  }
  friction(dt, k) { if (this.grounded) this.vx = damp(this.vx, 0, k, dt); }

  tryActions(world, opp) {
    const c = this.ctrl, b = this.buf;
    if (c.grabP) { b.punch = 0; return this.startMove('grab', world); }
    if (b.special > 0) { b.special = 0; return this.doSpecial(world); }
    if (b.dash > 0 && this.dashCd <= 0) { b.dash = 0; return this.startDash(c.dir || this.facing, world); }
    if (b.jump > 0) { b.jump = 0; return this.doJump(world); }
    if (b.weapon > 0) {
      b.weapon = 0;
      const w = this.weapon();
      if (this.counterT > 0 && w.counter) return this.startMove(w.counter, world);
      return this.startMove(w.moves[0], world);
    }
    if (b.punch > 0) { b.punch = 0; return this.startMove('p1', world); }
    if (c.kickP) { this.setState('kickcharge'); this.charge = 0; return true; }
    return false;
  }

  updateNeutral(dt, world, opp) {
    const c = this.ctrl;
    if (c.blockHeld && !c.punchP) { this.setState('block'); this.blockT = 0; return; }
    if (this.tryActions(world, opp)) return;
    const spd = 245 * this.speedMul;
    if (c.dir !== 0) {
      if (this.runDir === c.dir) this.walkT += dt; else { this.runDir = c.dir; this.walkT = 0; }
      const run = this.walkT > 0.38 && c.dir === this.facing;
      const target = c.dir * (run ? spd * 1.65 : spd * (c.dir === this.facing ? 1 : 0.82));
      this.vx = damp(this.vx, target, 16, dt);
      const s = run ? 'run' : 'walk';
      if (this.state !== s) { this.state = s; }
    } else {
      this.walkT = 0; this.runDir = 0;
      this.vx = damp(this.vx, 0, 18, dt);
      if (this.state !== 'idle') this.state = 'idle';
    }
    this.walkPhase += Math.abs(this.vx) * dt / (30 * this.scale);
  }

  updateCharge(dt, world) {
    const c = this.ctrl;
    this.charge += dt; this.friction(dt, 14);
    if (this.charge > 0.18 && ((this.charge - dt) <= 0.18)) { AudioManager.play('charge'); }
    if (!c.kickHeld || this.charge > 1.0) {
      // a tap: the time spent holding the button already counts as the roundhouse wind-up, so a quick kick adds no extra delay
      if (this.charge < 0.18) { const held = this.charge; if (this.startMove('rk', world)) this.mt = Math.min(held, this.mdur[0] * 0.6); }
      else this.startMove('hk', world, { charge: clamp((this.charge - 0.18) / 0.62, 0, 1) });
    }
  }

  updateBlock(dt, world, opp) {
    const c = this.ctrl;
    this.blockT += dt; this.friction(dt, 20);
    if (c.grabP) { this.buf.punch = 0; this.startMove('grab', world); return; }
    if (this.buf.weapon > 0 && this.counterT > 0) { this.buf.weapon = 0; const w = this.weapon(); if (w.counter) { this.startMove(w.counter, world); return; } }
    if (this.buf.dash > 0 && this.dashCd <= 0) { this.buf.dash = 0; this.startDash(c.dir || -this.facing, world); return; }
    if (!c.blockHeld) this.setState('idle');
  }

  doJump(world) {
    if (this.grounded) {
      // anticipation: crouch for a few frames, then drive up through the legs
      if (this.state === 'prejump') return true;
      this.jumpDir = this.ctrl.dir; this.move = null; this.setState('prejump');
      this.sqx = 1.08; this.sqy = 0.9;
      return true;
    }
    if (this.jumps < 2) {
      this.vy = -840; this.jumps = 2; this.flipT = 1e-4; this.flipLand = true; this.bodyRotVel = 0; this.sqx = 0.86; this.sqy = 1.16;
      world && world.fx.riseLines(this.x, this.y + 10 * this.scale, 7, this.scale);
      if (this.ctrl.dir) this.vx = this.ctrl.dir * 330 * this.speedMul;
      this.setState('air'); AudioManager.play('djump');
      world && world.fx.ring(this.x, this.y - 60 * this.scale, 40, 'rgba(236,229,211,0.5)', 0.25);
      return true;
    }
    return false;
  }

  launchJump(world) {
    this.vy = -930; this.grounded = false; this.jumps = 1; this.airDash = false; this.sqx = 0.84; this.sqy = 1.18;
    this.vx = (this.jumpDir || this.ctrl.dir) * 290 * this.speedMul + this.vx * 0.3;
    this.setState('air'); AudioManager.play('jump');
    world && world.fx.dust(this.x, 0, 8);
  }

  startDash(dir, world) {
    this.dashDir = dir || this.facing;
    this.setState('dash'); this.dashT = 0.2;
    this.invuln = Math.max(this.invuln, (0.17 + this.dashBonus * 0.5) * this.dodgeMul);
    this.dashCd = 0.42 * (1 - this.dashBonus);
    AudioManager.play('dash');
    world && world.fx.dashLines(this);
    if (!this.grounded) { this.airDash = true; this.vy = 0; }
    return true;
  }

  updateDash(dt, world) {
    this.dashT -= dt;
    this.vx = this.dashDir * 900 * this.speedMul * (this.dashDir === this.facing ? 1 : 0.85);
    if (!this.grounded) this.vy = Math.min(this.vy, 60);
    if (this.st > 0.03) {
      if (this.buf.punch > 0 && this.dashDir === this.facing) { this.buf.punch = 0; this.startMove('dp', world); return; }
      if ((this.buf.kick > 0 || this.ctrl.kickP) && this.dashDir === this.facing && this.grounded) { this.buf.kick = 0; this.startMove('slide', world); return; }
    }
    if (world && (this.st * 60 | 0) % 2 === 0) world.fx.afterimage(this);
    if (this.dashT <= 0) { this.vx *= 0.35; this.setState(this.grounded ? 'idle' : 'air'); }
  }

  updateAir(dt, world) {
    const c = this.ctrl, b = this.buf;
    if (c.dir) this.vx = damp(this.vx, c.dir * 330 * this.speedMul, 4, dt);
    if (b.jump > 0 && this.jumps < 2) { b.jump = 0; this.doJump(world); return; }
    if (b.dash > 0 && !this.airDash && this.dashCd <= 0) { b.dash = 0; this.startDash(c.dir || this.facing, world); return; }
    if (b.special > 0) { b.special = 0; if (this.doSpecial(world)) return; }
    if (b.weapon > 0) { b.weapon = 0; const w = this.weapon(); if (w.air) { this.startMove(w.air, world); return; } }
    if (b.punch > 0) { b.punch = 0; this.startMove('ap', world); return; }
    if (b.kick > 0 || c.kickP) { b.kick = 0; this.startMove('ak', world); return; }
    if (this.tuckT > 0) this.tuckT -= dt;
  }

  /* ---- moves ---- */
  startMove(id, world, opts) {
    const m = MOVES[id];
    if (!m) return false;
    if (m.kind === 'throw') { if (this.ammo <= 0) { world && world.fx.popText(this, 'NO KUNAI', C.muted); return false; } }
    const now = world ? world.time : 0;
    if (m.id === this.lastMoveId && now - this.lastMoveT < 2.4) this.repeat++; else this.repeat = 0;
    this.lastMoveId = m.id; this.lastMoveT = now;
    this.move = m; this.setState('move'); this.mt = 0; this.mphase = 0; this.hitList.length = 0; this.moveHit = false; this.multiN = 0;
    this.moveCharge = opts && opts.charge != null ? opts.charge : 0;
    const wm = m.kind === 'weapon' || (m.kind === 'air' && WEAPONS[this.weaponId()].air === m.id) ? weaponMul(this.weaponId(), this.wlvl) : null;
    const spd = (wm ? wm.spd : 1) * (this.isPlayer ? 1 : (this.def && this.def.speed ? Math.sqrt(this.def.speed) : 1));
    this.mdur[0] = m.t[0] / spd; this.mdur[1] = m.t[1]; this.mdur[2] = m.t[2] / spd;
    if (this.boostAtk) { this.mdur[0] *= this.boostAtk; this.mdur[2] *= this.boostAtk; }
    if (this.windupMul !== 1) this.mdur[0] *= this.windupMul;
    if (this.recoveryMul !== 1) this.mdur[2] *= this.recoveryMul;
    // player attack assist: turn to face a foe who crossed over, and glide the last short gap during the wind-up so near-misses connect
    this.magV = 0;
    if (this.isPlayer && world && m.box && m.kind !== 'grab' && m.kind !== 'throw') {
      const o = world.opponentOf(this);
      if (o && o.alive && o.visible && o.state !== 'down' && o.state !== 'getup') {
        const dx = o.x - this.x, ad = Math.abs(dx), side = Math.sign(dx) || this.facing;
        if (ad > 10 && ad < 520 && side !== this.facing) this.facing = side;
        if (this.grounded && side === this.facing) {
          const reach = (m.box[0] + m.box[2]) * this.scale * (wm ? wm.reach : 1);
          const gap = ad - 22 * o.scale - reach * 0.85;
          if (gap > 0 && gap < 75 * this.scale) this.magV = Math.min(gap / Math.max(0.05, this.mdur[0]), 900);
        }
      }
    }
    this.superArmor = !!m.armor || !!(this.def && this.def.heavyArmor && m.imp >= 2);
    this._snap = Object.assign(this._snap || {}, this.pose);
    this.trail.length = 0; this.trail2.length = 0;
    world && world.onMoveStart(this, m);
    return true;
  }

  updateMove(dt, world) {
    const m = this.move; if (!m) { this.setState('idle'); return; }
    this.mt += dt;
    const d0 = this.mdur[0], d1 = d0 + this.mdur[1], d2 = d1 + this.mdur[2];
    if (this.mphase === 0 && this.magV) this.x += this.facing * this.magV * dt;
    if (this.mphase === 0 && this.mt >= d0) {
      this.mphase = 1; this.magV = 0;
      this.sqx = 1.1 + 0.04 * this.heft(); this.sqy = 0.93;
      if (world && (m.kind === 'punch' || m.kind === 'kick' || (m.imp || 0) >= 2) && !this.clone) world.fx.kiai(this);
      if (world && this.heft() >= 1.4) { world.fx.shake(0.05 * this.heft()); if (this.grounded) world.fx.dust(this.x + this.facing * 30 * this.scale, 0, 4); }
      if (world && (m.spin || m.rot) && (m.kind === 'weapon' || m.kind === 'kick')) world.fx.elemRing(this.elementOf(m), this.x, this.y - 95 * this.scale, 120 * this.scale);
      const ch = this.moveCharge;
      if (m.lunge) this.vx = this.facing * m.lunge * (1 + ch * 0.6) * (this.grounded ? 1 : 0.5);
      if (m.hop) { this.vy = m.hop; this.grounded = false; }
      if (m.snd) AudioManager.play(m.snd, { pitch: this.isPlayer ? 1 : 0.9 });
      if (m.proj && world) world.spawnProjectile(m.proj, this);
      if (m.kind === 'throw') this.ammo--;
    }
    if (this.mphase === 1) {
      if (m.multi && this.mt - d0 > (this.multiN + 1) * m.multi[1] && this.multiN < m.multi[0] - 1) { this.multiN++; this.hitList.length = 0; }
      if (this.mt >= d1) {
        this.mphase = 2;
        if (!this.moveHit && this.heft() >= 1.3) this.mdur[2] *= 1 + 0.2 * (this.heft() - 1);
        if (m.shock && world && this.grounded) world.spawnShock(this, m);
      }
    }
    if (this.grounded) { if (this.mphase !== 1 || this.mt - d0 > 0.08) this.vx = damp(this.vx, 0, m.kind === 'kick' && m.id === 'slide' ? 4 : 11, dt); }
    // air move landing
    if (m.kind === 'air' && this.grounded && this.mt > 0.04) { this.move = null; this.setState('land'); AudioManager.play('land'); world && world.fx.dust(this.x, this.y, 6); return; }
    // chains and cancels
    if (this.mphase >= 1 && this.mt > d0 + this.mdur[1] * 0.5) {
      const b = this.buf, wpn = this.weapon();
      const btn = m.kind === 'weapon' ? 'weapon' : m.kind === 'kick' ? 'kick' : m.kind === 'punch' ? 'punch' : null;
      if (m.next && btn && b[btn] > 0 && this.mphase === 2) { b[btn] = 0; this.startMove(m.next, world); return; }
      if (this.moveHit && this.mphase === 2) {
        if (b.special > 0 && this.rage >= 100) { b.special = 0; this.doSpecial(world); return; }
        if (!this.grounded) {
          // air strings: each connecting air attack can flow into a different one, or a double jump to keep the juggle going
          if (b.jump > 0 && this.jumps < 2) { b.jump = 0; this.endMove(); this.doJump(world); return; }
          if (b.weapon > 0 && wpn.air && m.id !== wpn.air) { b.weapon = 0; this.startMove(wpn.air, world); return; }
          if (b.kick > 0 && m.id !== 'ak') { b.kick = 0; this.startMove('ak', world); return; }
          if (b.punch > 0 && m.id !== 'ap') { b.punch = 0; this.startMove('ap', world); return; }
        } else {
          if (b.weapon > 0 && btn !== 'weapon') { b.weapon = 0; this.startMove(wpn.moves[0], world); return; }
          if (b.kick > 0 && btn !== 'kick') { b.kick = 0; this.startMove('rk', world); return; }
          if (b.punch > 0 && btn !== 'punch') { b.punch = 0; this.startMove('p1', world); return; }
          if (b.jump > 0 && this.mt > d1 + this.mdur[2] * 0.4) { b.jump = 0; this.endMove(); this.doJump(world); return; }
        }
      }
    }
    // recovery cancels (player): after a hit the tail of the move flows straight into movement, defence or a new attack;
    // a whiff still commits for most of the recovery, so heavy weapons keep their weight
    if (this.mphase === 2 && this.isPlayer && m.kind !== 'grab') {
      const c = this.ctrl, b = this.buf, rk = (this.mt - d1) / Math.max(0.001, this.mdur[2]);
      if (b.dash > 0 && this.dashCd <= 0 && (this.grounded || !this.airDash) && (this.moveHit || rk > 0.45)) {
        b.dash = 0; this.endMove(); this.startDash(c.dir || this.facing, world); return;
      }
      if (this.grounded && rk > (this.moveHit ? 0.3 : 0.62)) {
        if (c.blockHeld && !c.punchP) { this.endMove(); this.setState('block'); this.blockT = 0; return; }
        if (b.weapon > 0 || b.punch > 0 || b.special > 0 || b.jump > 0 || c.kickP || c.grabP) { this.endMove(); this.setState('idle'); this.tryActions(world); return; }
        if (c.dir !== 0) { this.endMove(); this.setState('walk'); return; }
      }
    }
    if (this.mt >= d2) {
      this.endMove();
      this.setState(this.grounded ? 'idle' : 'air');
    }
  }
  endMove() { this.move = null; this.superArmor = false; this.magV = 0; }

  // hitbox in world space, or null
  hitbox(out) {
    if (this.state !== 'move' || this.mphase !== 1 || !this.move || !this.move.box) return null;
    const b = this.move.box, s = this.scale;
    const reach = (this.move.kind === 'weapon' || this.move.kind === 'air') && this.hasWeapon ? weaponMul(this.weaponId(), this.wlvl).reach : 1;
    const x0 = b[0] * s, w = b[2] * s * reach * (this.move.id === 'hk' ? 1 + this.moveCharge * 0.15 : 1);
    out.x = this.facing > 0 ? this.x + x0 : this.x - x0 - w;
    out.y = this.y + b[1] * s; out.w = w; out.h = b[3] * s;
    return out;
  }
  hurtbox(out) {
    const sk = this.sk;
    let top = sk.head.y - BODY.head * this.scale * this.build.head;
    let bottom = Math.max(sk.fft.y, sk.bft.y, sk.hip.y + 10);
    const cx = (sk.hip.x + sk.neck.x) / 2;
    const w = 46 * this.scale * (this.build.w > 14 ? 1.25 : 1);
    if (this.state === 'down' || this.state === 'dead') { top = this.y - 40 * this.scale; bottom = this.y; }
    out.x = cx - w / 2; out.y = top; out.w = w; out.h = Math.max(30, bottom - top);
    return out;
  }

  doSpecial(world) {
    if (this.rage >= 100) {
      const name = this.weapon().special || 'shadowPalm';
      if (world && SPECIAL_IMPL[name]) { this.rage = 0; SPECIAL_IMPL[name](this, world); world.onSpecial(this, name); return true; }
    }
    if (this.grounded || true) return this.startMove('kunai', world);
  }

  startAbility(a, world) {
    this.abil = Object.assign({ t: 0, dur: 1, pose: null, rate: 18 }, a);
    this.move = null; this.setState('ability');
    if (this.abil.start) this.abil.start(this, world);
  }
  endAbility(world) {
    const a = this.abil; this.abil = null;
    if (a && a.end) a.end(this, world);
    if (this.state === 'ability') this.setState(this.grounded ? 'idle' : 'air');
    this.superArmor = false; this.alpha = 1; this.visible = true;
  }

  updateThrow(dt, world) {
    const v = this.grabbing;
    this.friction(dt, 20);
    if (!v) { this.setState('idle'); return; }
    const t = this.st, dur = 0.5;
    // victim follows the hands up and over
    const k = clamp(t / dur, 0, 1);
    const ang = lerp(0.2, Math.PI * 0.95, Ease.inOut(k));
    v.x = this.x + this.facing * Math.cos(ang) * 70 * this.scale;
    v.y = this.y - Math.sin(ang) * 120 * this.scale;
    v.vx = 0; v.vy = 0; v.grounded = false;
    if (t >= dur) {
      this.grabbing = null; v.grabbedBy = null;
      v.x = this.x - this.facing * 70 * this.scale; v.y = this.y - 30;
      world.applyThrow(this, v);
      this.setState('idle');
    }
  }

  onLandHard(world) {
    if (Math.abs(this.vyLand || 0) > 600 && this.bounced !== true) {
      this.vy = -this.vyLand * 0.32; this.grounded = false; this.bounced = true;
      world && world.fx.dust(this.x, this.y, 14); AudioManager.play('land');
      return;
    }
    const impact = clamp(Math.abs(this.vyLand || 0) / 1400, 0, 1);
    this.bounced = false; this.juggle = 0; this.vx *= 0.3;
    world && world.fx.dust(this.x, this.y, 10 + impact * 14);
    world && world.fx.shake(0.08 + impact * 0.2);
    const feet = this.alive && Math.abs(angDiff(0, this.bodyRot)) < 75;
    if (world) {
      if (feet) { world.fx.landBurst(this.x, this.scale, 0.75 + impact * 0.6); world.fx.dust(this.x - 22, 0, 6); world.fx.dust(this.x + 22, 0, 6); }
      else if (impact > 0.35) world.fx.elemRing('ink', this.x, -3, 70 + impact * 60);
    }
    if (feet) { this.sqx = 1.18; this.sqy = 0.84; }
    AudioManager.play('land');
    if (!this.alive) { this.setState('dead'); return; }
    this.setState('down'); this.downT = 0.4 + impact * 0.45; this.feetLand = feet;
  }

  physics(dt, world) {
    if (this.state === 'grabbed') return;
    const floating = this.state === 'ability' && this.abil && this.abil.float;
    if (!this.grounded && !floating) {
      const g = this.state === 'juggle' ? 2500 * (1 + this.juggle * 0.12) : (this.state === 'dash' ? 0 : 2600);
      this.vy += g * dt;
    }
    this.x += this.vx * dt; this.y += this.vy * dt;
    if (this.y >= 0) {
      if (!this.grounded) {
        this.vyLand = this.vy;
        const impact = clamp(this.vy / 1600, 0, 1); this.sqx = 1 + 0.22 * impact; this.sqy = 1 - 0.2 * impact;
        this.y = 0; this.vy = 0; this.grounded = true; this.jumps = 0; this.airDash = false; this.tuckT = 0;
        if (this.state === 'air') {
          // weight on landing: deeper knees, longer recovery and a dust ring for big drops; no sliding
          this.landDepth = 0.35 + impact * 0.65; this.landT = 0.06 + impact * 0.16; this.vx *= 0.35;
          if (this.flipLand) { this.landDepth = Math.max(this.landDepth, 0.8); this.landT = Math.max(this.landT, 0.17); if (world) { world.fx.dust(this.x - 18, 0, 6); world.fx.dust(this.x + 18, 0, 6); world.fx.landBurst(this.x, this.scale, 0.7); } }
          else if (world && impact > 0.55) world.fx.landBurst(this.x, this.scale, impact * 0.8);
          this.flipLand = false;
          this.setState('land'); AudioManager.play('land');
          if (world) { world.fx.dust(this.x, 0, 4 + impact * 8); if (impact > 0.55) world.fx.elemRing('ink', this.x, -3, 50 + impact * 40); }
        }
        else if (this.state === 'dash') { /* keep dashing along ground */ }
      } else { this.y = 0; this.vy = 0; }
    } else if (!floating) this.grounded = false;
    if (world) {
      const l = world.bounds.l, r = world.bounds.r;
      if (this.x < l) { this.x = l; if (this.state === 'juggle' && Math.abs(this.vx) > 300) world.wallBounce(this); else this.vx = Math.max(0, this.vx); }
      if (this.x > r) { this.x = r; if (this.state === 'juggle' && Math.abs(this.vx) > 300) world.wallBounce(this); else this.vx = Math.min(0, this.vx); }
    }
  }

  /* ---- pose target selection + blending ---- */
  updatePose(dt) {
    // a mimicking foe stands in the stance of the fighter it copies (Kage's), not its own
    const t = this.tgt, wp = this.mimic ? this.mimic.src.weapon() : this.weapon(), stance = STANCES[wp.stance] || STANCES.fists;
    let rate = 14;
    const copy = src => { for (let i = 0; i < POSE_KEYS.length; i++) t[POSE_KEYS[i]] = src[POSE_KEYS[i]]; t.ik = src.ik || 0; };
    this.extraRot = 0;
    let plant = null;
    switch (this.state) {
      case 'idle': case 'land': case 'kickcharge': case 'walk': case 'run': {
        if (this.state === 'idle' || this.state === 'land') plant = stance;
        if (this.state === 'kickcharge' && this.charge > 0.12) { copy(MOVES.hk.w); rate = 16; t.lean += Math.sin(this.time * 40) * 1.5; break; }
        copy(stance);
        // the knee starts to chamber the instant kick is pressed, before we know whether it is a tap or a charge
        if (this.state === 'kickcharge') { blendPose(t, MOVES.rk.w, clamp(this.charge / 0.12, 0, 1) * 0.55); rate = 30; break; }
        if (this.state === 'land') { blendPose(t, POSES.land, this.landDepth * (1 - 0.6 * clamp(this.st / this.landT, 0, 1))); t.wa = stance.wa; t.wb = stance.wb; t.fs = stance.fs; t.fe = stance.fe; t.ik = stance.ik || 0; rate = 32; break; }
        // fighter's bounce: rhythmic knee flex while the guard breathes
        const bt = this.time * TAU * 1.5, bounce = (1 + Math.sin(bt)) * 0.5, lowHp = this.hp < this.maxHp * 0.25;
        t.fk -= bounce * 8; t.bk -= bounce * 7; t.fh += bounce * 2;
        t.lean += Math.sin(bt) * 1.2 + (lowHp ? 7 : 0); t.head += Math.sin(bt) * 1.2 + (lowHp ? 6 : 0);
        t.fe += Math.sin(bt + 0.6) * 4; t.be -= Math.sin(bt + 1.1) * 3;
        if (this.state === 'walk') {
          // shuffle footwork: lead foot first when advancing, rear foot first when retreating, feet never cross
          const p = this.walkPhase, fwd = this.vx * this.facing >= 0;
          const lead = fwd ? p : p - 1.3, rear = fwd ? p - 1.3 : p;
          t.fh += 13 * Math.sin(lead); t.fk -= 26 * Math.max(0, Math.sin(lead));
          t.bh += 13 * Math.sin(rear); t.bk -= 24 * Math.max(0, Math.sin(rear));
          t.lean += fwd ? 3 : -4; rate = 16;
        } else if (this.state === 'run') {
          const p = this.walkPhase;
          t.fh = 8 + 44 * Math.sin(p); t.fk = -10 - 80 * Math.max(0, Math.cos(p));
          t.bh = 8 + 44 * Math.sin(p + Math.PI); t.bk = -10 - 80 * Math.max(0, Math.cos(p + Math.PI));
          t.lean = 24; t.head = 10; rate = 16;
          if (this.shape() === 'none' || this.shape() === 'short') { t.fs = -64 + Math.sin(p) * 8; t.fe = 14; t.bs = -76; t.be = 14; t.wa = -110; t.wb = -120; t.ik = 0; }
          else t.lean = 18;
        }
        break;
      }
      case 'block': plant = this.shape() === 'none' || this.shape() === 'fan' ? POSES.blockFists : POSES.blockArmed; copy(plant); rate = 28;
        if (this.weaponId() === 'sentinel_spear') { t.bs = 96; t.be = 10; t.wb = 180; }
        break;
      case 'dash': copy(this.dashDir === this.facing ? POSES.dash : POSES.backstep); rate = 30; break;
      case 'air': {
        if (this.flipT > 0) {
          // takeoff knee-drive -> tight tuck through the fast spin -> open out and reach for the floor
          const u = clamp(this.flipT / FLIP_DUR, 0, 1);
          if (u < 0.18) { copy(POSES.flipTakeoff); }
          else if (u < 0.72) { copy(POSES.flip); blendPose(t, POSES.flipTakeoff, clamp(1 - (u - 0.18) / 0.12, 0, 1)); }
          else { copy(POSES.flip); blendPose(t, POSES.flipFinish, Ease.outCubic(clamp((u - 0.72) / 0.28, 0, 1))); }
          rate = 34;
        }
        else if (this.tuckT > 0) { copy(POSES.tuck); rate = 20; }
        else {
          // rising -> apex -> falling, blended by vertical speed; legs reach for the floor when close
          copy(POSES.jump); blendPose(t, POSES.fall, clamp((this.vy + 600) / 1300, 0, 1));
          if (this.vy > 0) blendPose(t, POSES.landPrep, clamp(1 + this.y / 170, 0, 1) * 0.9);
          t.fs += Math.sin(this.time * 9) * 4; t.bs -= Math.sin(this.time * 9 + 1) * 4;
          rate = 13;
        }
        if (stance.wa != null) { t.wa = stance.wa + 30; t.wb = stance.wb; }
        break;
      }
      case 'move': {
        const m = this.move;
        if (!m) { copy(stance); break; }
        this.movePose(t); rate = 70;
        if (m.rot && this.mphase === 1) this.extraRot = m.rot * clamp((this.mt - this.mdur[0]) / this.mdur[1], 0, 1);
        if (m.id === 'hk') t.lean -= this.moveCharge * 6;
        break;
      }
      case 'hit': copy(this.hitGut ? POSES.hitGut : POSES.hit); rate = 34; break;
      case 'juggle': {
        const T = this.tumble;
        if (T && T.full && this.alive) {
          // airborne -> controlled tumble -> head-down fall -> brace for landing
          const u = clamp(T.t / T.dur, 0, 1);
          if (u < 0.22) copy(POSES.launched);
          else if (u < 0.58) copy(POSES.tumble);
          else if (u < 0.8) copy(POSES.launchFall);
          else copy(POSES.brace);
          rate = 20;
        } else if (T && T.bounce && this.alive) {
          // ground bounce out of a feet-first landing: a braced crouch-hop, not a second launch
          copy(POSES.brace); blendPose(t, POSES.braceLand, 0.45); rate = 18;
        } else {
          copy(POSES.launched); blendPose(t, POSES.launchFall, clamp((this.vy + 300) / 900, 0, 1)); rate = 12;
          if (this.alive && this.vy > 0) blendPose(t, POSES.brace, clamp(1 + this.y / 160, 0, 1));
        }
        break;
      }
      case 'prejump': copy(stance); blendPose(t, POSES.jumpSquat, 0.85); rate = 40; break;
      case 'down': case 'dead': copy(this.state === 'dead' ? POSES.dead : this.feetLand ? POSES.braceLand : POSES.down); rate = this.feetLand ? 26 : 10; break;
      case 'getup':
        if (this.feetLand) { copy(POSES.land); rate = 12; if (this.st > 0.12) { copy(stance); rate = 10; } break; }
        copy(POSES.getup); rate = 14; if (this.st > 0.15) { copy(stance); rate = 12; } break;
      case 'stun': copy(POSES.stun); rate = 6; t.lean += Math.sin(this.time * 5) * 10; t.head += Math.sin(this.time * 7) * 14; t.rx = Math.sin(this.time * 5) * 6; break;
      case 'grabbed': copy(POSES.grabbed); rate = 20; this.extraRot = this.grabbedBy ? -this.grabbedBy.facing * this.facing * 0 : 0; break;
      case 'throwing': copy(UNARMED.grab.s); t.fs = lerp(86, 200, clamp(this.st / 0.5, 0, 1)); t.bs = lerp(80, 190, clamp(this.st / 0.5, 0, 1)); t.lean = lerp(18, -30, clamp(this.st / 0.5, 0, 1)); rate = 30; break;
      case 'ability': {
        const a = this.abil;
        copy(a && a.pose ? (typeof a.pose === 'function' ? a.pose(this, a.t) : a.pose) : stance); rate = a ? a.rate : 18;
        if (a && a.rot) this.extraRot = a.rot(this, a.t);
        break;
      }
      case 'pose': copy(POSES[this.poseName] || stance); rate = 8;
        if (this.poseName === 'victory' || this.poseName === 'taunt') { const br = Math.sin(this.time * 2); t.lean += br; }
        break;
    }
    // planted feet: while standing, the soles stay where the stance put them and the knees absorb the bounce
    if (plant && this.grounded) this.plantSrc = plant;
    this.plantW = damp(this.plantW || 0, plant && this.grounded ? 1 : 0, plant ? 9 : 16, dt);
    // weapon angles: null -> follow forearm
    const sh = this.shape();
    if (t.tw == null) t.tw = 0; if (t.hp == null) t.hp = 0;
    if (t.wa == null) t.wa = t.fs + t.fe + (CARRY[sh] || 0);
    if (t.wb == null) t.wb = t.bs + t.be + (CARRY[sh] || 0);
    if (sh === 'none') { t.ik = 0; }
    this.updateBodyRot(dt);
    this.extraRot += this.bodyRot + this.flipAngle();
    if (this.state === 'move' && this.move && this.move.spin && this.mphase === 0) this.turnX = Math.cos(clamp(this.mt / this.mdur[0], 0, 1) * TAU);
    else this.turnX = damp(this.turnX, 1, 30, dt);
    const p = this.pose;
    const k = 1 - Math.exp(-rate * dt);
    for (let i = 0; i < POSE_KEYS.length; i++) { const key = POSE_KEYS[i]; p[key] += (t[key] - p[key]) * k; }
    p.ik += ((t.ik || 0) - p.ik) * Math.min(1, k * 1.5);
  }

  flipAngle() { return this.flipT > 0 ? 360 * flipEase(clamp(this.flipT / FLIP_DUR, 0, 1)) : 0; }
  updateFlip(dt, world) {
    if (this.flipT <= 0) return;
    const st = this.state;
    // a hit or touching down ends the flip: whatever angle is left is handed to the body spring, so nothing snaps
    if (this.grounded || st === 'hit' || st === 'juggle' || st === 'grabbed' || st === 'stun' || st === 'down' || st === 'dead') {
      let a = this.flipAngle() % 360; if (a > 180) a -= 360;
      this.bodyRot += a; this.flipT = 0; return;
    }
    const u0 = this.flipT / FLIP_DUR;
    this.flipT += dt;
    const u = this.flipT / FLIP_DUR;
    if (world && dt > 0) {
      if (u0 < 0.16 && u >= 0.16) AudioManager.play('whoosh');
      if (u > 0.2 && u < 0.85 && ((this.flipT * 60) | 0) % 2 === 0) world.fx.afterimage(this, this.flipGhost());
    }
    if (u >= 1) this.flipT = 0;
  }
  // every launch (or re-launch mid-air) plans one backward tumble timed to land feet first;
  // pops too short for a full turn get a small backward tilt instead
  updateTumble(dt, world) {
    if (this.state !== 'juggle') { this.tumble = null; this.lastVy = this.vy; return; }
    const kicked = !this.tumble || this.vy < (this.lastVy || 0) - 150;
    this.lastVy = this.vy;
    if (kicked && !this.grounded) {
      const g = 2500 * (1 + this.juggle * 0.12), y = Math.min(this.y, 0), vy = this.vy;
      const dur = Math.max(0.12, (-vy + Math.sqrt(Math.max(0, vy * vy - 2 * g * y))) / g);
      const a0 = this.bodyRot;
      let dist = a0 >= 0 ? a0 : a0 + 360; if (dist < 180) dist += 360;
      const bounce = this.bounced === true;
      this.tumble = { t: 0, dur, a0, a1: a0 - dist, full: !bounce && this.alive && dur >= 0.28 && dist / dur < 1500, prev: a0, bounce };
    }
    if (!world || dt <= 0 || !this.tumble) return;
    const T = this.tumble, u = T.t / T.dur, n = (this.st * 60) | 0;
    // speed lines streaming behind the body while it travels fast
    if (Math.hypot(this.vx, this.vy) > 420 && n % 2 === 0) world.fx.trailLines(this.sk.hip.x, this.sk.hip.y, Math.atan2(this.vy, this.vx), this.scale);
    if (T.full && u > 0.2 && u < 0.8 && n % 3 === 0) world.fx.afterimage(this, 'rgba(236,229,211,0.16)');
  }
  flipColor() {
    const el = this.elementOf(null) || 'ink';
    if (el === 'wind' || el === 'ink' || el === 'shade' || !ELEMENTS[el]) return [132, 192, 255];
    return ELEMENTS[el].smear;
  }
  flipGhost() { const c = this.flipColor(); return `rgba(${c[0]},${c[1]},${c[2]},0.24)`; }

  // one body angle shared by every state: it springs toward a target, or rides momentum while launched,
  // so it never snaps or resets between jump, knockback, fall, landing and recovery
  updateBodyRot(dt) {
    const st = this.state;
    if (st === 'juggle' && this.alive && this.tumble) {
      const T = this.tumble; T.t += dt;
      const u = clamp(T.t / T.dur, 0, 1);
      const a = T.full ? T.a0 + (T.a1 - T.a0) * tumbleEase(u) : T.a0 * (1 - Ease.outCubic(u)) - (T.bounce ? 10 : 48) * Math.sin(Math.PI * u);
      if (dt > 0) this.bodyRotVel = (a - T.prev) / dt;
      T.prev = a; this.bodyRot = ((a % 360) + 540) % 360 - 180;
      return;
    }
    if (st === 'juggle') {
      this.bodyRotVel += angDiff(-85, this.bodyRot) * (this.vy > 0 ? 5 : 1.2) * dt;
      this.bodyRotVel *= Math.exp(-1.6 * dt);
    } else {
      let target = 0, k = 170;
      if (st === 'air') target = clamp(this.vx * this.facing * 0.012, -7, 7) + (this.tuckT > 0 ? 10 : 0);
      else if (st === 'hit') target = this.st < 0.14 ? (this.hitGut ? 5 : -8) : 0;
      else if (st === 'down' || st === 'dead') { target = this.feetLand && st === 'down' ? 0 : -90; k = this.feetLand ? 200 : 110; }
      else if (st === 'getup') { target = 0; k = 120; }
      else if (st === 'grabbed') target = -25;
      this.bodyRotVel += (k * angDiff(target, this.bodyRot) - 2 * Math.sqrt(k) * this.bodyRotVel) * dt;
    }
    // a whole turn looks identical, so keep the angle in -180..180 and always rotate the short way round
    this.bodyRot += this.bodyRotVel * dt;
    if (this.bodyRot > 180) this.bodyRot -= 360; else if (this.bodyRot <= -180) this.bodyRot += 360;
    // a launched body tips back but never cartwheels: bleed off spin past the flat-on-back angle
    if (st === 'juggle' && this.bodyRot < -110 && this.bodyRotVel < 0) this.bodyRotVel *= Math.exp(-12 * dt);
  }

  /* ---- forward kinematics ---- */
  computeSkeleton() {
    const p = this.pose, s = this.scale, b = this.build, f = this.facing, sk = this.sk;
    const torso = BODY.torso * s * b.torso, upper = BODY.upper * s * b.arms, fore = BODY.fore * s * b.arms;
    const thigh = BODY.thigh * s * b.legs, shin = BODY.shin * s * b.legs, hr = BODY.head * s * b.head, neck = BODY.neck * s;
    const rot = (p.rot + this.extraRot) * DEG;
    const cr = Math.cos(rot), sr = Math.sin(rot);
    // local (facing-right, y down) positions relative to the hip
    const L = this._L || (this._L = {});
    const set = (k, x, y) => { const o = L[k] || (L[k] = { x: 0, y: 0 }); o.x = x; o.y = y; return o; };
    const lean = p.lean * DEG;
    const hip = set('hip', p.rx * s, 0);
    const nk = set('neck', hip.x + Math.sin(lean) * torso, hip.y - Math.cos(lean) * torso);
    const shd = set('sh', lerp(hip.x, nk.x, 0.9), lerp(hip.y, nk.y, 0.9));
    // torso twist separates the shoulders along the chest normal; hip twist opens the pelvis (roundhouse turnover, cross punch)
    const tfx = Math.cos(lean), tfy = Math.sin(lean), big = b.w > 13 ? 1.35 : 1, sep = 8 * s * big, hsep = 7 * s * big;
    const twk = p.tw || 0, hpk = p.hp || 0;
    const shF = set('shF', shd.x - tfx * sep * (twk * 0.55 - 0.12), shd.y - tfy * sep * (twk * 0.55 - 0.12));
    const shB = set('shB', shd.x + tfx * sep * (twk * 0.85 - 0.12), shd.y + tfy * sep * (twk * 0.85 - 0.12));
    const hipF = set('hipF', hip.x - hsep * (hpk * 0.5 - 0.15), hip.y);
    const hipB = set('hipB', hip.x + hsep * (hpk * 0.8 - 0.15), hip.y);
    const ha = (p.lean + p.head) * DEG;
    set('head', nk.x + Math.sin(ha) * (neck + hr), nk.y - Math.cos(ha) * (neck + hr));
    const limb = (ox, oy, a1, a2, l1, l2, k1, k2) => {
      const A = a1 * DEG, B = (a1 + a2) * DEG;
      const j = set(k1, ox + Math.sin(A) * l1, oy + Math.cos(A) * l1);
      set(k2, j.x + Math.sin(B) * l2, j.y + Math.cos(B) * l2);
    };
    limb(shF.x, shF.y, p.fs, p.fe, upper, fore, 'fel', 'fha');
    limb(shB.x, shB.y, p.bs, p.be, upper, fore, 'bel', 'bha');
    limb(hipF.x, hipF.y, p.fh, p.fk, thigh, shin, 'fkn', 'fft');
    limb(hipB.x, hipB.y, p.bh, p.bk, thigh, shin, 'bkn', 'bft');
    const pw = this.plantW || 0, ps = this.plantSrc;
    if (pw > 0.01 && ps && this.grounded) {
      const G = Math.max(L.fft.y, L.bft.y), hp0 = ps.hp || 0;
      const footX = (hx, h, k) => hx + Math.sin(h * DEG) * thigh + Math.sin((h + k) * DEG) * shin;
      this.plantLeg(L.hipF, L.fkn, L.fft, footX(-hsep * (hp0 * 0.5 - 0.15), ps.fh, ps.fk), G, thigh, shin, pw);
      this.plantLeg(L.hipB, L.bkn, L.bft, footX(hsep * (hp0 * 0.8 - 0.15), ps.bh, ps.bk), G, thigh, shin, pw);
    }
    // weapon direction (local)
    const wl = this.weaponLen();
    const wA = p.wa * DEG, wB = p.wb * DEG;
    set('wv', Math.sin(wA), Math.cos(wA)); set('w2v', Math.sin(wB), Math.cos(wB));
    // two-handed IK for the back arm
    if (p.ik > 0.5 && wl > 0 && IK_OFF[this.shape()] != null) {
      const off = IK_OFF[this.shape()] * wl;
      const tx = L.fha.x + L.wv.x * off, ty = L.fha.y + L.wv.y * off;
      this.solveIK(shB, tx, ty, upper, fore, L);
    }
    // rotate around hip and find ground contact
    const keys = ['neck', 'sh', 'shF', 'shB', 'hipF', 'hipB', 'head', 'fel', 'fha', 'bel', 'bha', 'fkn', 'fft', 'bkn', 'bft'];
    let maxY = 0;
    const sole = b.w * s * 0.42 * (b.w >= 13 ? 1.15 : 1) * 0.9;
    for (const k of keys) {
      const o = L[k], x = o.x - hip.x, y = o.y - hip.y;
      o.x = hip.x + x * cr - y * sr; o.y = hip.y + x * sr + y * cr;
      const yy = k === 'head' ? o.y + hr : (k === 'fft' || k === 'bft') ? o.y + sole : o.y;
      if (yy > maxY) maxY = yy;
    }
    for (const k of ['wv', 'w2v']) { const o = L[k], x = o.x, y = o.y; o.x = x * cr - y * sr; o.y = x * sr + y * cr; }
    const targetOff = this.state === 'grabbed' ? -this.standHip() : (this.grounded || this.state === 'juggle') ? -maxY : Math.min(-this.standHip(), -maxY);
    this.hipOff = this.hipOffInit ? lerp(this.hipOff, targetOff, 0.35) : targetOff;
    this.hipOffInit = true;
    const ox = this.x, oy = this.y + this.hipOff;
    const out = (k, o) => { sk[k].x = ox + o.x * f; sk[k].y = oy + o.y; };
    out('hip', hip); for (const k of keys) out(k, L[k]);
    // weapons
    this.wVec.x = L.wv.x * f; this.wVec.y = L.wv.y;
    this.w2Vec.x = L.w2v.x * f; this.w2Vec.y = L.w2v.y;
    this.wAng = Math.atan2(this.wVec.y, this.wVec.x); this.w2Ang = Math.atan2(this.w2Vec.y, this.w2Vec.x);
    let ext = 0;
    if (this.state === 'move' && this.move && this.move.chain) {
      const m = this.move, a = this.mt - this.mdur[0];
      if (this.mphase === 1 || (this.mphase === 2 && a < this.mdur[1] + 0.12)) ext = Math.sin(clamp(a / (this.mdur[1] + 0.12), 0, 1) * Math.PI) * m.chain * s;
    }
    this.chainExt = ext;
    sk.wb.x = sk.fha.x + this.wVec.x * (wl * 0.55 + ext); sk.wb.y = sk.fha.y + this.wVec.y * (wl * 0.55 + ext);
    sk.wt.x = sk.fha.x + this.wVec.x * (wl + ext); sk.wt.y = sk.fha.y + this.wVec.y * (wl + ext);
    const wl2 = this.shape() === 'short' || this.shape() === 'crescent' || this.shape() === 'fan' ? wl : 0;
    sk.w2b.x = sk.bha.x + this.w2Vec.x * wl2 * 0.3; sk.w2b.y = sk.bha.y + this.w2Vec.y * wl2 * 0.3;
    sk.w2t.x = sk.bha.x + this.w2Vec.x * wl2; sk.w2t.y = sk.bha.y + this.w2Vec.y * wl2;
  }
  // two-bone leg IK toward a planted foot (knee always bends forward), blended over the FK leg by w
  plantLeg(hp, kn, ft, tx, ty, a, b, w) {
    const dx = tx - hp.x, dy = ty - hp.y, d = clamp(Math.sqrt(dx * dx + dy * dy), Math.abs(a - b) + 0.01, a + b - 0.01);
    const base = Math.atan2(dy, dx), A = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const k1x = hp.x + Math.cos(base + A) * a, k2x = hp.x + Math.cos(base - A) * a;
    const pick = k1x > k2x ? base + A : base - A;
    const kx = hp.x + Math.cos(pick) * a, ky = hp.y + Math.sin(pick) * a;
    const fa = Math.atan2(ty - ky, tx - kx), fx = kx + Math.cos(fa) * b, fy = ky + Math.sin(fa) * b;
    kn.x += (kx - kn.x) * w; kn.y += (ky - kn.y) * w; ft.x += (fx - ft.x) * w; ft.y += (fy - ft.y) * w;
  }
  solveIK(sh, tx, ty, a, b, L) {
    const dx = tx - sh.x, dy = ty - sh.y;
    let d = Math.sqrt(dx * dx + dy * dy);
    d = clamp(d, Math.abs(a - b) + 0.01, a + b - 0.01);
    const base = Math.atan2(dy, dx);
    const A = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const e1x = sh.x + Math.cos(base + A) * a, e1y = sh.y + Math.sin(base + A) * a;
    const e2x = sh.x + Math.cos(base - A) * a, e2y = sh.y + Math.sin(base - A) * a;
    const pickFirst = e1y > e2y;
    L.bel.x = pickFirst ? e1x : e2x; L.bel.y = pickFirst ? e1y : e2y;
    const ang = Math.atan2(ty - L.bel.y, tx - L.bel.x);
    L.bha.x = L.bel.x + Math.cos(ang) * b; L.bha.y = L.bel.y + Math.sin(ang) * b;
  }
  weaponLen() { const w = this.weapon(); return (w.len || 0) * this.scale * (this.hasWeapon ? weaponMul(this.weaponId(), this.wlvl).reach : 1); }

  updateCloth(dt) {
    for (const cl of this.cloths) {
      const a = cl.at === 'neck' ? this.sk.neck : cl.at === 'sh' ? this.sk.sh : cl.at === 'hip' ? this.sk.hip : this.sk.head;
      const ax = a.x - this.facing * (cl.dx != null ? cl.dx : 3) * this.scale, ay = a.y + (cl.dy || 0) * this.scale;
      cl.c.update(ax, ay, this.facing, this.vx, Math.min(dt, 1 / 30), this.time);
    }
  }

  recordTrail() {
    const m = this.state === 'move' ? this.move : null;
    const total = m ? this.mdur[0] + this.mdur[1] + this.mdur[2] : 0;
    const tracking = (m && (this.mphase === 1 || (this.mphase === 0 && this.mt > this.mdur[0] * 0.5) || (this.mphase === 2 && this.mt < total - this.mdur[2] * 0.62))) || (this.state === 'ability' && this.abil && this.abil.trail);
    const push = (arr, hx, hy, a, len, b0) => {
      const e = arr.length >= 18 ? arr.shift() : {};
      e.hx = hx; e.hy = hy; e.a = a; e.L = len; e.b0 = b0; e.t = 0; arr.push(e);
    };
    if (tracking) {
      const limb = (m && m.limb) || 'w', sk = this.sk, wl = this.weaponLen();
      const seg = (arr, a, b, b0) => push(arr, a.x, a.y, Math.atan2(b.y - a.y, b.x - a.x), Math.hypot(b.x - a.x, b.y - a.y), b0);
      if ((limb === 'w' || !m) && wl > 0) push(this.trail, sk.fha.x, sk.fha.y, this.wAng, wl + (this.chainExt || 0), 0.1);
      else if (limb === 'w2' && wl > 0) push(this.trail2, sk.bha.x, sk.bha.y, this.w2Ang, wl, 0.1);
      else if (limb === 'fhand' || limb === 'w') seg(this.trail, sk.fel, sk.fha, 0.4);
      else if (limb === 'bhand') seg(this.trail, sk.bel, sk.bha, 0.4);
      else if (limb === 'ffoot') seg(this.trail, sk.fkn, sk.fft, 0.35);
      else if (limb === 'bfoot') seg(this.trail, sk.bkn, sk.bft, 0.35);
      if ((this.shape() === 'short' || this.shape() === 'crescent' || this.shape() === 'fan') && limb === 'w' && m && m.rot) push(this.trail2, sk.bha.x, sk.bha.y, this.w2Ang, wl, 0.1);
    }
    for (const arr of [this.trail, this.trail2]) {
      for (const e of arr) e.t += STEP;
      while (arr.length && arr[0].t > SMEAR_LIFE) arr.shift();
    }
  }

  /* ---- timeline animation: snapshot -> anticipation -> wind-up -> strike (whip) -> hold -> follow-through -> stance ---- */
  heft() {
    const m = this.move;
    if (m && (m.kind === 'weapon' || (m.kind === 'air' && this.hasWeapon))) return this.weapon().heft || 1;
    return 0.7;
  }
  movePose(out) {
    const m = this.move, d0 = this.mdur[0], d1 = this.mdur[1], d2 = this.mdur[2], t = this.mt, hf = this.heft();
    const st = this.grounded ? (STANCES[this.weapon().stance] || STANCES.fists) : POSES.fall;
    const K = this._keys || (this._keys = []);
    K.length = 0;
    K.push(this._snap, 0, 'inOut');
    if (m.a) K.push(m.a, d0 * 0.42, 'inOut');
    K.push(m.w, d0, m.a ? 'out' : 'inOut');
    const strikeAt = d0 + Math.min(d1, Math.max(0.028, 0.035 + 0.025 * hf));
    const strikeIdx = K.length / 3;
    K.push(m.s, strikeAt, hf < 1.05 ? 'snap' : 'quart');
    K.push(m.s, d0 + d1, 'lin');
    K.push(m.f || m.s, d0 + d1 + d2 * 0.45, 'out');
    K.push(st, d0 + d1 + d2, 'inOut');
    const n = K.length / 3;
    let j = 0;
    while (j + 1 < n && t >= K[(j + 1) * 3 + 1]) j++;
    const A = K[j * 3], B = j + 1 < n ? K[(j + 1) * 3] : A;
    const ta = K[j * 3 + 1], tb = j + 1 < n ? K[(j + 1) * 3 + 1] : ta + 1;
    const u = clamp((t - ta) / Math.max(0.001, tb - ta), 0, 1);
    const ease = MOVE_EASE[j + 1 < n ? K[(j + 1) * 3 + 2] : 'lin'];
    const e = ease(u);
    // the blade lags behind the hands, then whips through (heavier weapons lag more)
    const lag = j + 1 === strikeIdx ? 0.1 + 0.07 * hf : 0.04;
    const eW = ease(clamp((u - lag) / (1 - lag), 0, 1));
    const eH = ease(clamp((u - 0.1) / 0.9, 0, 1));
    const carry = CARRY[this.shape()] || 0;
    for (let i = 0; i < POSE_KEYS.length; i++) {
      const k = POSE_KEYS[i];
      let a = A[k], b = B[k];
      if (k === 'wa') { if (a == null) a = A.fs + A.fe + carry; if (b == null) b = B.fs + B.fe + carry; out[k] = lerp(a, b, eW); continue; }
      if (k === 'wb') { if (a == null) a = A.bs + A.be + carry; if (b == null) b = B.bs + B.be + carry; out[k] = lerp(a, b, eW); continue; }
      out[k] = lerp(a || 0, b || 0, k === 'head' ? eH : e);
    }
    out.ik = u < 0.5 ? (A.ik || 0) : (B.ik || 0);
    // momentum: heavy weapons drag the body forward through the follow-through; a whiff over-extends
    if (this.mphase === 2) {
      const rk = clamp((t - d0 - d1) / d2, 0, 1), bump = Math.sin(rk * Math.PI);
      const over = (hf - 0.9) * (this.moveHit ? 0.5 : 1.25);
      if (over > 0) { out.lean += 9 * over * bump; out.rx += 7 * over * bump; }
    }
  }
}

/* ---- render interpolation: the simulation ticks at a fixed 60 Hz, but 120/144 Hz displays draw in between ticks.
   Each tick stores the previous skeleton; at draw time the fighter is blended between the two ticks, then restored. ---- */
const SK_KEYS = ['hip', 'neck', 'sh', 'shF', 'shB', 'hipF', 'hipB', 'head', 'fel', 'fha', 'bel', 'bha', 'fkn', 'fft', 'bkn', 'bft', 'wt', 'wb', 'w2t', 'w2b'];
Fighter.prototype.packRender = function (a) {
  let i = 0;
  const sk = this.sk;
  for (let k = 0; k < SK_KEYS.length; k++) { const p = sk[SK_KEYS[k]]; a[i++] = p.x; a[i++] = p.y; }
  a[i++] = this.x; a[i++] = this.y; a[i++] = this.wVec.x; a[i++] = this.wVec.y; a[i++] = this.w2Vec.x; a[i++] = this.w2Vec.y;
  for (const cl of this.cloths) { const c = cl.c; for (let j = 0; j < c.n; j++) { a[i++] = c.px[j]; a[i++] = c.py[j]; } }
  return i;
};
Fighter.prototype.unpackRender = function (a) {
  let i = 0;
  const sk = this.sk;
  for (let k = 0; k < SK_KEYS.length; k++) { const p = sk[SK_KEYS[k]]; p.x = a[i++]; p.y = a[i++]; }
  this.x = a[i++]; this.y = a[i++]; this.wVec.x = a[i++]; this.wVec.y = a[i++]; this.w2Vec.x = a[i++]; this.w2Vec.y = a[i++];
  for (const cl of this.cloths) { const c = cl.c; for (let j = 0; j < c.n; j++) { c.px[j] = a[i++]; c.py[j] = a[i++]; } }
  this.wAng = Math.atan2(this.wVec.y, this.wVec.x); this.w2Ang = Math.atan2(this.w2Vec.y, this.w2Vec.x);
};
Fighter.prototype.snapPrev = function () {
  this._prev = this._prev || [];
  this._prevN = this.packRender(this._prev); this._prevFacing = this.facing;
};
// returns true when the fighter was moved to its in-between pose (call endInterp afterwards)
Fighter.prototype.beginInterp = function (alpha) {
  if (!this._prevN || this._prevFacing !== this.facing || alpha >= 0.999) return false;
  const cur = this._cur || (this._cur = []);
  const n = this.packRender(cur);
  if (n !== this._prevN || Math.abs(cur[40] - this._prev[40]) > 160 || Math.abs(cur[41] - this._prev[41]) > 160) return false; // teleports snap
  const mix = this._mix || (this._mix = []), p = this._prev;
  for (let i = 0; i < n; i++) mix[i] = p[i] + (cur[i] - p[i]) * alpha;
  this.unpackRender(mix);
  // blades rotate rather than slide: rebuild them from the blended hand along the blended direction at full length
  const sk = this.sk;
  const blade = (h, v, tip, base, ih, it, ib) => {
    const L = Math.hypot(v.x, v.y) || 1; v.x /= L; v.y /= L;
    const lt = Math.hypot(cur[it] - cur[ih], cur[it + 1] - cur[ih + 1]), lb = Math.hypot(cur[ib] - cur[ih], cur[ib + 1] - cur[ih + 1]);
    tip.x = h.x + v.x * lt; tip.y = h.y + v.y * lt; base.x = h.x + v.x * lb; base.y = h.y + v.y * lb;
  };
  blade(sk.fha, this.wVec, sk.wt, sk.wb, 18, 32, 34);
  blade(sk.bha, this.w2Vec, sk.w2t, sk.w2b, 22, 36, 38);
  this.wAng = Math.atan2(this.wVec.y, this.wVec.x); this.w2Ang = Math.atan2(this.w2Vec.y, this.w2Vec.x);
  // the newest smear sample is pulled back to the blended blade so the trail never runs ahead of the weapon
  const sv = this._trailSave || (this._trailSave = [{}, {}]);
  [this.trail, this.trail2].forEach((arr, k) => {
    const s = sv[k]; s.e = null;
    const n2 = arr.length, e = arr[n2 - 1], q = arr[n2 - 2];
    if (!e || !q || e.t !== 0) return;
    s.e = e; s.hx = e.hx; s.hy = e.hy; s.a = e.a; s.L = e.L;
    e.hx = lerp(q.hx, e.hx, alpha); e.hy = lerp(q.hy, e.hy, alpha); e.a = q.a + angDiff(e.a / DEG, q.a / DEG) * DEG * alpha; e.L = lerp(q.L, e.L, alpha);
  });
  return true;
};
Fighter.prototype.endInterp = function () {
  this.unpackRender(this._cur);
  if (this._trailSave) for (const s of this._trailSave) if (s.e) { s.e.hx = s.hx; s.e.hy = s.hy; s.e.a = s.a; s.e.L = s.L; s.e = null; }
};

const SMEAR_LIFE = 0.24;
const MOVE_EASE = {
  lin: t => t, inOut: Ease.inOut, out: Ease.outCubic, quart: t => 1 - Math.pow(1 - t, 4),
  snap: t => { const c1 = 1.35, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
};

/* ======================================================================== */
/*  Drawing                                                                   */
/* ======================================================================== */
// red obi: a band around the waist with a small knot at the front (its tails are cloth)
Fighter.prototype.drawSash = function (ctx, T) {
  const sk = this.sk, s = this.scale, f = this.facing;
  const k = 0.16, x = lerp(sk.hip.x, sk.neck.x, k), y = lerp(sk.hip.y, sk.neck.y, k);
  const dx = sk.neck.x - sk.hip.x, dy = sk.neck.y - sk.hip.y, D = Math.hypot(dx, dy) || 1, ux = dx / D, uy = dy / D;
  let nx = -uy, ny = ux; if (nx * f < 0) { nx = -nx; ny = -ny; }
  const w = T * 0.98, col = this.isPlayer ? C.emberBright : this.def && this.def.sash ? this.def.sash : this.family ? this.family.trim : '#3a342b';
  ctx.strokeStyle = col; ctx.lineWidth = (this.isPlayer ? 7 : this.family ? 5 : 4) * s; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(x - nx * w, y - ny * w); ctx.lineTo(x + nx * w, y + ny * w); ctx.stroke();
  if (this.isPlayer) { ctx.fillStyle = '#b8362b'; ctx.beginPath(); ctx.ellipse(x + nx * w * 0.8, y + ny * w * 0.8 + 1.5 * s, 3 * s, 3.6 * s, 0, 0, TAU); ctx.fill(); }
  ctx.lineCap = 'round';
};

function flipCrescent(ctx, R, ry, p0, p1, w, col) {
  const N = 20, pts = [];
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i <= N; i++) { const k = i / N, p = p0 + (p1 - p0) * k; i ? ctx.lineTo(Math.cos(p) * R, Math.sin(p) * R * ry) : ctx.moveTo(Math.cos(p) * R, Math.sin(p) * R * ry); }
  for (let i = N; i >= 0; i--) {
    const k = i / N, p = p0 + (p1 - p0) * k, th = w * Math.pow(k, 1.25) * (k > 0.88 ? 0.35 + 0.65 * (1 - k) / 0.12 : 1), r = R - th;
    ctx.lineTo(Math.cos(p) * r, Math.sin(p) * r * ry);
  }
  ctx.closePath(); ctx.fill();
}
Fighter.prototype.drawFlipArcs = function (ctx, front) {
  if (this.flipT <= 0) return;
  const u = clamp(this.flipT / FLIP_DUR, 0, 1), spd = flipSpeed(u);
  const a = clamp(spd * 1.8, 0, 1) * (u > 0.85 ? (1 - u) / 0.15 : 1);
  if (a < 0.04) return;
  const sk = this.sk, s = this.scale, f = this.facing;
  const cx = lerp(sk.hip.x, sk.neck.x, 0.35), cy = lerp(sk.hip.y, sk.neck.y, 0.35);
  const R = 84 * s, ry = 0.7, tilt = -0.32 * f;
  // the head's direction around the centre, re-expressed on the tilted ellipse
  const ha = Math.atan2(sk.head.y - cy, sk.head.x - cx) - tilt;
  const lead = Math.atan2(Math.sin(ha) / ry, Math.cos(ha)) + (front ? Math.PI : 0) + 0.25 * f;
  const sweep = (0.7 + 3.0 * spd) * f, col = this.flipColor();
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt); ctx.globalAlpha *= a;
  const R2 = front ? R * 1.06 : R * 1.16;
  flipCrescent(ctx, R2, ry, lead - sweep, lead, 28 * s, `rgb(${col[0]},${col[1]},${col[2]})`);
  flipCrescent(ctx, R2, ry, lead - sweep * 0.8, lead, 11 * s, '#ffffff');
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
  for (const [rr, sw] of [[1.32, 0.45], [0.8, 0.35]]) {
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) { const p = lead - sweep * sw * i / 10 - 0.3 * f; const x = Math.cos(p) * R * rr, y = Math.sin(p) * R * rr * ry; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
};

// soft ground shadow under the body plus a darker contact patch under each foot that is on the floor
Fighter.prototype.drawShadow = function (ctx) {
  if (!this.visible || this.alpha <= 0.01) return;
  const sk = this.sk, s = this.scale, h = Math.max(0, -this.y), k = clamp(1 - h / 320, 0.2, 1);
  const lying = this.state === 'down' || this.state === 'dead';
  const cx = lying ? (sk.hip.x + sk.neck.x) / 2 : lerp(sk.hip.x, (sk.fft.x + sk.bft.x) / 2, 0.6);
  const rx = (lying ? 90 : 54 + Math.abs(sk.fft.x - sk.bft.x) * 0.35) * s * (0.6 + 0.4 * k), ry = 9 * s * (0.6 + 0.4 * k);
  ctx.save(); ctx.globalAlpha *= this.alpha;
  ctx.translate(cx, 1); ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(0,0,0,${0.85 * k})`); g.addColorStop(0.5, `rgba(0,0,0,${0.55 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill();
  ctx.restore();
  if (lying) return;
  ctx.save(); ctx.globalAlpha *= this.alpha;
  for (const ft of [sk.fft, sk.bft]) {
    const c = clamp(1 - (-ft.y - 6 * s) / (26 * s), 0, 1);   // ankle height above the floor -> contact strength
    if (c <= 0.02) continue;
    ctx.fillStyle = `rgba(0,0,0,${0.8 * c})`;
    ctx.beginPath(); ctx.ellipse(ft.x + this.facing * 3 * s, 1, 13 * s, 3 * s, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
};

const OUTLINE_DIRS = Array.from({ length: 12 }, (_, i) => [Math.cos(i * Math.PI / 6), Math.sin(i * Math.PI / 6)]);
Fighter.prototype.draw = function (ctx, opt) {
  opt = opt || {};
  if (!this.visible || this.alpha <= 0.01) return;
  // a translucent fighter (clones, Akari's decoy) is drawn opaque into a layer and composited once (21-anime-body.js)
  if (this.alpha < 0.99 && !opt.layered) {
    const a = this.alpha, lo = Object.assign({}, opt, { layered: true });
    animeLayer(ctx, a, 0, (g) => { this.alpha = 1; this.draw(g, lo); this.alpha = a; });
    return;
  }
  const sk = this.sk, s = this.scale;
  const flashing = this.flash > 0 && !opt.noFlash && !opt.color;
  const flat = !!opt.color || flashing;
  const ink = opt.color || (flashing ? (opt.flashColor || C.bone) : this.bodyColor());
  // Hollows: now and then a frame "glitches": the body skips sideways, the outline doubles and jitters. The Witness
  // glitches too (all the time while a corrupted move runs), and now and then its outline flickers to Kage's own
  // silhouette (face-wrap, red sash, no robe shards: `kageFrame`), more often while it copies him (`kageFlicker`).
  const wit = this.def && this.def.witness;
  if (wit) this.kageFrame = !opt.color && this.alive && !this.coreBroken && this.witnessFlicker();
  const corrupt = (wit || this.hollow) && this.corruptUntil > this.time;   // a corrupted move (the Witness, the Core's echoes)
  const glitch = (this.hollow || (wit && !this.kageFrame)) && !opt.color && !opt.noGlitch ? this.glitchAmount(corrupt ? 0.6 : 0) : 0;
  // the Witness glitches like a broken signal (drawWitnessGlitch); Hollows keep their offset ghost below
  if (wit && glitch && !opt.rimPass && this.drawWitnessGlitch(ctx, opt, glitch, corrupt)) return;
  const gcol = this.hollow ? this.family.trim : '#7b5ad6';
  ctx.save();
  ctx.globalAlpha *= this.alpha;
  // the Witness hovers, almost weightless: a slow bob a hand's width above the floor
  if (wit && this.grounded && this.alive && !opt.color) ctx.translate(0, -(7 + Math.sin(this.time * 2.1) * 4) * s);
  if (glitch) {
    ctx.save(); ctx.globalAlpha *= 0.42; ctx.translate(glitch * 26 * s, -Math.abs(glitch) * 4 * s);
    this.silhouette(ctx, gcol, gcol, true, { color: gcol, noEyes: true });
    ctx.restore();
    ctx.translate(-glitch * 7 * s, 0);
    if (wit) { ctx.translate(this.x, this.y); ctx.scale(1 - Math.abs(glitch) * 0.12, 1 + Math.abs(glitch) * 0.14); ctx.translate(-this.x, -this.y); }   // the impossible version: too tall, too thin
  }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // squash & stretch around the feet, then the spin turn
  if (this.sqx !== 1 || this.sqy !== 1) { ctx.translate(this.x, this.y); ctx.scale(this.sqx, this.sqy); ctx.translate(-this.x, -this.y); }
  if (this.turnX !== 1) { ctx.translate(this.x, 0); ctx.scale(Math.abs(this.turnX) < 0.12 ? 0.12 * Math.sign(this.turnX || 1) : this.turnX, 1); ctx.translate(-this.x, 0); }
  if (!opt.color) this.drawFlipArcs(ctx, false);
  // the Witness's own look (not while it flickers to Kage): the halo ring, high collar and back coat tails behind the
  // body, then (below) the front tail, the chest core with its rune cards and the crimson veins over it
  const witArt = wit && !this.kageFrame;
  if (witArt) this.drawWitnessHalo(ctx, opt);   // its coat tails, armour and chest core are drawn with the body (29w-anime-witness.js)
  if (this.armor === 'kysmei' && !this.kageFrame && !wit) this.drawKysmei(ctx, -1, opt);
  for (const cl of this.cloths) if (cl.kind === 'cape' || cl.kind === 'robe') cl.c.draw(ctx, opt.color || cl.color, cl.w0, cl.w1, null);
  // the outline: the silhouette stamped around itself as a thin near-black ink line, then a thinner rim in the stage's
  // rim colour (deepened toward crimson, animeRimColor) on the back and top edges only, then the body on top
  if (opt.rim && !opt.color) {
    const gk = glitch ? 1 + Math.abs(glitch) * 3 : 1, src = (this.hollow && this.family.outline) || opt.outline || (typeof opt.rim === 'string' ? opt.rim : '#f1ebe0');
    const oc = animeRimColor(src, this.hollow, animeSkin(this).rimTint), ro = this._rimOpt || (this._rimOpt = {}), f = this.facing;
    for (const k in ro) delete ro[k];
    Object.assign(ro, opt, { rimPass: true });
    const di = 1.5 * s * gk, dr = 1.1 * s * gk;
    for (const [dx, dy] of OUTLINE_DIRS) { ctx.save(); ctx.translate(dx * di, dy * di); this.silhouette(ctx, C.ink, C.ink, true, ro); ctx.restore(); }
    for (const [dx, dy] of OUTLINE_DIRS) {
      if (-dx * f * 0.6 - dy * 0.8 < 0.05) continue;   // the back and top edges, away from the camera light
      ctx.save(); ctx.translate(dx * dr, dy * dr); this.silhouette(ctx, oc, oc, true, ro); ctx.restore();
    }
  }
  for (const cl of this.cloths) if (cl.kind === 'scarf' || cl.kind === 'ribbon' || cl.kind === 'belt') {
    if (cl.witness && this.kageFrame) continue;
    if (cl.kageOnly && !this.kageFrame) continue;   // Kage's scarf tails, only on the Witness's Kage-flicker frames
    const col = opt.color || (flashing ? ink : cl.color);
    if (cl.rim && !opt.color && cl.w1) cl.c.ribbon(ctx, cl.rim, cl.w + 3 * s, cl.w1 + 3 * s);
    if (cl.w1) cl.c.ribbon(ctx, col, cl.w, cl.w1); else cl.c.strand(ctx, col, cl.w);
  }
  this.silhouette(ctx, ink, ink, flat, opt);
  if (this.armor === 'kysmei' && !this.kageFrame && !wit) this.drawKysmei(ctx, 1, opt);
  if (!opt.color) this.drawFlipArcs(ctx, true);
  if (this.state === 'kickcharge' && this.charge > 0.18 && !opt.color) {
    const k = clamp((this.charge - 0.18) / 0.62, 0, 1), r = 10 + k * 18 + Math.sin(this.time * 40) * 2;
    ctx.fillStyle = C.emberBright; ctx.beginPath(); ctx.arc(sk.fft.x, sk.fft.y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.arc(sk.fft.x, sk.fft.y, r * 0.55, 0, TAU); ctx.fill();
  }
  ctx.restore();
};

// flat body fill: Kage and the bosses are ink, the Order slate, Hollows a violet that flickers between close tones
const _hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
Fighter.prototype.bodyColor = function () {
  const fam = this.family; if (!fam) return (this.def && this.def.body) || C.ink;   // `body`: a boss's own flat fill (Akari's charcoal)
  if (!fam.flicker) return fam.body;
  return fam.flicker[(_hash(Math.floor(this.time * 11) + this.seed()) * fam.flicker.length) | 0];
};
Fighter.prototype.seed = function () { return this._seed || (this._seed = 1 + Math.random() * 97); };
// 0 most frames; on roughly one 1/7 s slice in six a signed jolt in [-0.5, 0.5] (always on while dissolving; `more`
// raises the share of glitching slices, the Witness's corrupted moves)
Fighter.prototype.glitchAmount = function (more) {
  const k = Math.floor(this.time * 7) + this.seed() * 3, h = _hash(k);
  if (h > (this.dissolve ? 0.75 : Math.max(0.16, more || 0))) return 0;
  const g = _hash(k * 1.73 + 5) - 0.5;
  return Math.abs(g) < 0.12 ? 0.12 * Math.sign(g || 1) : g;
};

/* ---- the Witness ---- */
// Whether this frame shows Kage's familiar silhouette: a brief flicker on about one 1/9 s slice in fourteen, every other
// slice while it copies him (`kageFlicker`: Echo Replication's tell, summoning his Hollow copies).
Fighter.prototype.witnessFlicker = function () {
  const k = Math.floor(this.time * 9), h = _hash(k * 3.1 + this.seed());
  return h < (this.kageFlicker > 0 ? 0.5 : 0.07);
};
// The Kysmei Robe's drifting fragments (Fighter.drawKysmei), the Witness's halo, core, rune cards, coat tails and its
// shard weapon (drawShardWeapon): 29w-anime-witness.js
// Which story boss's own look a fighter wears: the boss itself or its Core echo (echoOf) give that boss's id
// ('raikon', 'akari', 'takashi', 'witness'); anyone else gives their own id or null. The bosses' redesigns key on this,
// so the gear they drop (the Raijin Kabuto, the Kasa) keeps its own look on Kage.
function bossLook(f) { const d = f && f.def; return d ? d.echoOf || d.id || null : null; }

/* ---- Raikon: 27-anime-raikon.js (cloak, coat, fur, sode, jingasa) ---- */

/* ---- Takashi: 29-anime-takashi.js (kasa, hair, beard, robes, capelet, cape, obi, gold-wrapped blade) ---- */

/* ---- Rem ---- */
// Rem (young Rem in the spar, Hollow Rem in the Core): his own hairstyle and band from his key art
function isRem(f) { const d = f && f.def; return !!d && (d.id === 'young_rem' || d.id === 'rem' || d.echoOf === 'rem'); }
// his head, hair, band and coat: 26-anime-rem.js

/* ---- Akari: 28-anime-akari.js (hair, mask, fitted garb, arm guards, boots, sash and tail) ---- */
// The Witness's glitch frame: the figure is drawn once into an offscreen canvas, then put back as horizontal slices,
// some torn sideways, over a magenta / cyan colour split, with dark scanlines across the figure and a few bright pixel
// blocks flickering beside it. Deterministic per 1/30 s, stronger during a corrupted move. Returns false (draw it the
// plain way) when the context gives no transform or the frame would be too large to copy.
const _glitchCv = [];
function glitchCanvas(i, w, h) {
  const c = _glitchCv[i] || (_glitchCv[i] = document.createElement('canvas'));
  if (c.width < w || c.height < h) { c.width = Math.max(c.width, w); c.height = Math.max(c.height, h); }
  return c;
}
Fighter.prototype.drawWitnessGlitch = function (ctx, opt, g, corrupt) {
  if (typeof document === 'undefined' || !ctx.getTransform) return false;
  const T = ctx.getTransform(), cv = ctx.canvas, s = this.scale;
  const corners = [[this.x - 260 * s, this.y - 380 * s], [this.x + 260 * s, this.y - 380 * s], [this.x - 260 * s, this.y + 30 * s], [this.x + 260 * s, this.y + 30 * s]]
    .map(([x, y]) => [T.a * x + T.c * y + T.e, T.b * x + T.d * y + T.f]);
  const bx = Math.max(0, Math.floor(Math.min(...corners.map(p => p[0])))), by = Math.max(0, Math.floor(Math.min(...corners.map(p => p[1]))));
  const bw = Math.min(cv.width, Math.ceil(Math.max(...corners.map(p => p[0])))) - bx, bh = Math.min(cv.height, Math.ceil(Math.max(...corners.map(p => p[1])))) - by;
  if (bw <= 0 || bh <= 0) return true;   // off screen
  if (bw * bh > 5e6) return false;
  const off = glitchCanvas(0, bw, bh), og = off.getContext('2d');
  og.setTransform(1, 0, 0, 1, 0, 0); og.globalCompositeOperation = 'source-over'; og.globalAlpha = 1; og.clearRect(0, 0, bw, bh);
  og.setTransform(T.a, T.b, T.c, T.d, T.e - bx, T.f - by);
  this.draw(og, Object.assign({}, opt, { noGlitch: true }));
  og.setTransform(1, 0, 0, 1, 0, 0);
  const unit = Math.hypot(T.a, T.b) * s, amp = Math.abs(g) * (corrupt ? 1.6 : 1), k = Math.floor((this.time || 0) * 30);
  // scanlines and a violet wash, on the figure's own pixels only
  og.globalCompositeOperation = 'source-atop';
  og.fillStyle = 'rgba(150,90,255,0.14)'; og.fillRect(0, 0, bw, bh);
  og.fillStyle = 'rgba(8,0,18,0.45)'; const step = Math.max(3, Math.round(unit * 2.4));
  for (let y = (k % 2) * Math.round(step / 2); y < bh; y += step) og.fillRect(0, y, bw, Math.max(1, Math.round(step / 3)));
  og.globalCompositeOperation = 'source-over';
  // the colour split: the figure in flat magenta and cyan, pushed apart
  const tint = (i, col) => { const c = glitchCanvas(i, bw, bh), t = c.getContext('2d'); t.setTransform(1, 0, 0, 1, 0, 0); t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, bw, bh); t.drawImage(off, 0, 0, bw, bh, 0, 0, bw, bh); t.globalCompositeOperation = 'source-in'; t.fillStyle = col; t.fillRect(0, 0, bw, bh); t.globalCompositeOperation = 'source-over'; return c; };
  const mag = tint(1, '#ff2bd6'), cya = tint(2, '#38e8ff');
  const base = ctx.globalAlpha, split = (3 + amp * 8) * unit;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = base * 0.5;
  ctx.drawImage(mag, 0, 0, bw, bh, bx - split, by, bw, bh);
  ctx.drawImage(cya, 0, 0, bw, bh, bx + split * 0.7, by + unit, bw, bh);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = base;
  // the slices: bands of varied height, about half of them torn sideways
  for (let y = 0, i = 0; y < bh; i++) {
    const h = Math.min(bh - y, Math.max(3, Math.round((0.03 + _hash(k * 7.1 + i) * 0.14) * bh)));
    const torn = _hash(k * 3.3 + i * 1.9) < 0.5, shift = torn ? (_hash(k + i * 5.7) - 0.5) * 2 * (10 + amp * 60) * unit : 0;
    ctx.drawImage(off, 0, y, bw, h, bx + shift, by + y, bw, h);
    if (torn && _hash(k * 2.2 + i) < 0.3) { ctx.globalAlpha = base * 0.35; ctx.drawImage(off, 0, y, bw, h, bx - shift * 0.6, by + y, bw, h); ctx.globalAlpha = base; }   // a doubled band
    y += h;
  }
  // pixel blocks flickering round the figure
  ctx.globalCompositeOperation = 'lighter';
  for (let j = 0; j < 9; j++) {
    if (_hash(k * 1.7 + j * 9.1) < 0.45) continue;
    const w = (3 + _hash(k + j * 3.1) * 16) * unit, h = (1.5 + _hash(k * 1.3 + j) * 4) * unit;
    const x = bx + bw * (0.3 + 0.4 * _hash(k * 0.7 + j * 4.3)), y = by + bh * (0.08 + 0.8 * _hash(k * 2.9 + j * 1.1));
    ctx.fillStyle = j % 3 === 0 ? 'rgba(255,255,255,0.75)' : j % 3 === 1 ? 'rgba(190,140,255,0.85)' : 'rgba(255,60,190,0.75)';
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
  return true;
};
// How much of the Witness's own glow shows: all of it, fading out while it comes apart
Fighter.prototype.witFade = function () { return this.dissolve ? clamp(1 - this.dissolve * 1.6, 0, 1) : 1; };
Fighter.prototype.drawMainWeapon = function (ctx, ink, opt) {
  const sh = this.shape(); if (sh === 'none') return;
  const L = this.weaponLen(), sk = this.sk;
  ctx.save();
  if (this.chainExt > 1) {
    // sickle / hook chain thrown out
    const ex = sk.fha.x + this.wVec.x * this.chainExt, ey = sk.fha.y + this.wVec.y * this.chainExt;
    ctx.strokeStyle = opt.color || '#4a443b'; ctx.lineWidth = 2.2 * this.scale; ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(sk.fha.x, sk.fha.y); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
    ctx.translate(ex, ey);
  } else ctx.translate(sk.fha.x, sk.fha.y);
  ctx.rotate(this.wAng); if (this.facing < 0) ctx.scale(1, -1);
  drawWeaponShape(ctx, twinShape(this.weapon(), sh, 0), L, opt.rimPass ? 'rim' : opt.color ? 'flat' : 'ink', this.scale, opt.color || ink, this);
  ctx.restore();
  // sickle chain hanging to the back hand
  if ((sh === 'sickle' || sh === 'hook') && this.chainExt <= 1) {
    ctx.strokeStyle = opt.color || '#3a342b'; ctx.lineWidth = 1.8 * this.scale;
    const px = sk.fha.x - this.wVec.x * 6 * this.scale, py = sk.fha.y - this.wVec.y * 6 * this.scale;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo((px + sk.bha.x) / 2, Math.max(py, sk.bha.y) + 30 * this.scale, sk.bha.x, sk.bha.y); ctx.stroke();
  }
};
Fighter.prototype.drawOffhand = function (ctx, ink, opt) {
  const sh = this.shape(), sk = this.sk;
  if (sh === 'short' || sh === 'crescent' || sh === 'fan') {
    ctx.save(); ctx.translate(sk.bha.x, sk.bha.y); ctx.rotate(this.w2Ang); if (this.facing < 0) ctx.scale(1, -1);
    drawWeaponShape(ctx, twinShape(this.weapon(), sh, 1), this.weaponLen(), opt.color ? 'flat' : 'ink', this.scale, opt.color || ink, this);
    ctx.restore();
  }
  if (this.weapon().shield && this.hasWeapon) this.orderShield(ctx, this._A);   // the Order's tate (22-anime-order.js)
};
// iron fists: the Hollow husk's bandaged fists (23-anime-hollow.js), Garan's tekko (24-anime-subs-a.js); the far one is
// drawn with its arm, behind the body
Fighter.prototype.drawFistGear = function (ctx) {
  const sk = this.sk;
  if (this.hollow && animeSkin(this).hollow) this.hollowFist(ctx, sk.fel, sk.fha, this._A, this._A.U, false);
  else this.subFist(ctx, sk.fel, sk.fha, this._A, this._A.U, false);
};

// a `twin` weapon (Kagehira & Yūrei) draws a different blade in each hand: Kagehira in the main hand, Yūrei in the off hand
function twinShape(w, sh, offhand) { return w && w.twin && sh === 'short' ? (offhand ? 'yurei' : 'kagehira') : sh; }
/* ---- weapon art: origin at the grip, +x along the blade ---- */
function drawWeaponShape(ctx, sh, L, mode, s, ink, f) {
  if (f && f.def && f.def.mirrorWeapon && !f.kageFrame && mode !== 'art') return drawShardWeapon(ctx, sh, L, mode, s, ink, f);
  if (mode === 'ink' && f && SUB_WEAPON_ART[f.weaponId()] && SUB_WEAPON_ART[f.weaponId()](ctx, sh, L, s, f)) return;   // 24-anime-subs-a.js
  if ((mode === 'flat' || mode === 'rim') && f && SUBB_WEAPON_FLAT[f.weaponId()] && SUBB_WEAPON_FLAT[f.weaponId()](ctx, L, s, ink, mode === 'rim', f)) return;   // 25-anime-subs-b.js
  const rim = mode === 'rim'; if (rim) mode = 'flat';   // outline pass: the steel stays thin, only the hilt gets the white edge
  const art = mode === 'art';
  const steel = art ? C.bone : mode === 'flat' ? ink : ANIME.silver;   // muted silver (STYLE.md), never pure white
  const edge = art ? C.emberBright : null;
  const dark = art ? '#2a2620' : ink;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const line = (x1, y1, x2, y2, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  switch (sh) {
    case 'katana': {
      // tsuka (wrapped grip) long enough for two hands, small oval tsuba, then a slim blade with a gentle sori and an angled kissaki
      const hl = 0.31, hw = 2.2 * s;
      line(-L * hl, 0, -1.5 * s, 0, hw * 2, dark);
      if (!rim && mode !== 'flat') {
        ctx.fillStyle = art ? C.gold : '#4e4f55';
        for (let i = 1; i < 5; i++) { ctx.save(); ctx.translate(-L * hl * (i + 0.1) / 5.2, 0); ctx.rotate(Math.PI / 4); ctx.fillRect(-0.95 * s, -0.95 * s, 1.9 * s, 1.9 * s); ctx.restore(); }
      }
      if (art) { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(-L * hl, 0, hw * 1.1, 0, TAU); ctx.fill(); }
      ctx.fillStyle = art ? C.gold : ink; ctx.beginPath(); ctx.ellipse(-0.6 * s, 0, 1.9 * s, 5.4 * s, 0, 0, TAU); ctx.fill();
      if (!rim && mode !== 'flat' && !art) { ctx.strokeStyle = ANIME.metal2; ctx.lineWidth = 0.9 * s; ctx.stroke(); ctx.fillStyle = ANIME.silver; ctx.beginPath(); ctx.arc(-L * hl, 0, hw * 1.05, 0, TAU); ctx.fill(); }   // round tsuba rim, silver kashira
      if (rim) break;
      // centre line y(u) = -sori * u^2, half-width tapers from the habaki to the yokote
      const N = 9, sori = L * 0.045, w0 = 1.75 * s, w1 = 1.2 * s, yk = 0.9, bx = 1.4 * s;
      const cy = u => -sori * u * u, X = u => bx + (L - bx) * u;
      ctx.beginPath(); ctx.moveTo(bx, cy(0) - w0);
      for (let i = 1; i <= N; i++) { const u = yk * i / N; ctx.lineTo(X(u), cy(u) - lerp(w0, w1, u / yk)); }   // mune (back)
      ctx.lineTo(L, cy(1) - w1 * 0.55);                                                                         // tip
      ctx.quadraticCurveTo(X(0.97), cy(0.97) + w1 * 0.9, X(yk), cy(yk) + w1);                                  // kissaki edge sweeps back
      for (let i = N - 1; i >= 0; i--) { const u = yk * i / N; ctx.lineTo(X(u), cy(u) + lerp(w0, w1, u / yk)); } // ha (edge)
      ctx.closePath(); ctx.fillStyle = steel; ctx.fill();
      if (mode !== 'flat') {
        ctx.strokeStyle = art ? C.emberBright : 'rgba(84,90,98,0.8)'; ctx.lineWidth = (art ? 1.2 : 0.7) * s;
        ctx.beginPath(); ctx.moveTo(bx + 3 * s, cy(0) - w0 * 0.25);
        for (let i = 1; i <= N; i++) { const u = yk * i / N; ctx.lineTo(X(u), cy(u) - lerp(w0, w1, u / yk) * 0.25); } ctx.stroke();  // shinogi line
        if (!art) {   // the one bright edge line along the ha
          ctx.strokeStyle = ANIME.silverHi; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(bx + 4 * s, cy(0) + w0 * 0.8);
          for (let i = 1; i <= N; i++) { const u = yk * i / N; ctx.lineTo(X(u), cy(u) + lerp(w0, w1, u / yk) * 0.8); } ctx.stroke();
        }
        ctx.fillStyle = art ? C.gold : ANIME.silver; ctx.fillRect(bx, cy(0) - w0, 3 * s, w0 * 2);                    // habaki
      }
      break;
    }
    case 'shinsen': {
      // Shinsen, Takashi's odachi: a long, well-balanced blade with a gentle sori, a gold line along the spine, a gold
      // habaki, a simple round tsuba rimmed in gold, a long two-hand tsuka with gold wraps, and the Tachibana family mark
      // (a small ring around a dot) engraved in gold near the guard. Never heavy-looking: slimmer than Raiko no Tachi.
      const hl = 0.29, hw = 2.3 * s, gold = art ? C.gold : '#d9b055';
      line(-L * hl, 0, -1.8 * s, 0, hw * 2, dark);
      if (!rim && mode !== 'flat') {
        ctx.fillStyle = gold;
        for (let i = 1; i < 6; i++) { ctx.save(); ctx.translate(-L * hl * (i + 0.1) / 6.2, 0); ctx.rotate(Math.PI / 4); ctx.fillRect(-0.95 * s, -0.95 * s, 1.9 * s, 1.9 * s); ctx.restore(); }
        ctx.beginPath(); ctx.arc(-L * hl, 0, hw * 1.05, 0, TAU); ctx.fill();                                          // gold kashira
      }
      ctx.fillStyle = art ? C.gold : ink; ctx.beginPath(); ctx.ellipse(-0.8 * s, 0, 2 * s, 6.2 * s, 0, 0, TAU); ctx.fill();   // round tsuba
      if (!rim && mode !== 'flat') { ctx.strokeStyle = gold; ctx.lineWidth = 0.9 * s; ctx.stroke(); }
      if (rim) break;
      const N = 10, sori = L * 0.05, w0 = 2 * s, w1 = 1.35 * s, yk = 0.9, bx = 1.6 * s;
      const cy = u => -sori * u * u, X = u => bx + (L - bx) * u;
      ctx.beginPath(); ctx.moveTo(bx, cy(0) - w0);
      for (let i = 1; i <= N; i++) { const u = yk * i / N; ctx.lineTo(X(u), cy(u) - lerp(w0, w1, u / yk)); }
      ctx.lineTo(L, cy(1) - w1 * 0.55);
      ctx.quadraticCurveTo(X(0.97), cy(0.97) + w1 * 0.9, X(yk), cy(yk) + w1);
      for (let i = N - 1; i >= 0; i--) { const u = yk * i / N; ctx.lineTo(X(u), cy(u) + lerp(w0, w1, u / yk)); }
      ctx.closePath(); ctx.fillStyle = steel; ctx.fill();
      if (mode !== 'flat') {
        ctx.strokeStyle = gold; ctx.lineWidth = (art ? 1.4 : 1) * s;                                                    // gold spine
        ctx.beginPath(); ctx.moveTo(bx + 3 * s, cy(0) - w0 * 0.85);
        for (let i = 1; i <= N; i++) { const u = yk * i / N; ctx.lineTo(X(u), cy(u) - lerp(w0, w1, u / yk) * 0.85); } ctx.stroke();
        ctx.fillStyle = gold; ctx.fillRect(bx, cy(0) - w0, 3.2 * s, w0 * 2);                                               // habaki
        const mx = X(0.09), my = cy(0.09);                                                                                // family mark
        ctx.beginPath(); ctx.arc(mx, my, 1.15 * s, 0, TAU); ctx.lineWidth = 0.45 * s; ctx.stroke();
        ctx.beginPath(); ctx.arc(mx, my, 0.4 * s, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'bokken': {
      // the Interlude's wooden practice sword: one piece of pale oak with a gentle curve, a darker worn grip and a
      // small round guard, no steel and no edge line
      const hl = 0.3, wood = art ? '#c9a878' : mode === 'flat' ? ink : '#b8915e', grip = art ? '#5a3c22' : mode === 'flat' ? ink : '#6e4a2a';
      line(-L * hl, 0, -1.5 * s, 0, 2.2 * s * 2, grip);
      ctx.fillStyle = grip; ctx.beginPath(); ctx.ellipse(-0.6 * s, 0, 1.6 * s, 4.2 * s, 0, 0, TAU); ctx.fill();
      if (rim) break;
      const N = 8, sori = L * 0.035, w0 = 2.1 * s, w1 = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(1.2 * s, -w0);
      for (let i = 1; i <= N; i++) { const u = i / N; ctx.lineTo(1.2 * s + (L - 1.2 * s) * u, -sori * u * u - lerp(w0, w1, u)); }
      ctx.quadraticCurveTo(L + w1 * 1.2, -sori, L, -sori + w1);
      for (let i = N; i >= 0; i--) { const u = i / N; ctx.lineTo(1.2 * s + (L - 1.2 * s) * u, -sori * u * u + lerp(w0, w1, u)); }
      ctx.closePath(); ctx.fillStyle = wood; ctx.fill();
      break;
    }
    case 'short': {
      if (rim) { line(-L * 0.32, 0, 0, 0, 6 * s, dark); break; }
      const hl = 0.32;
      line(-L * hl, 0, 0, 0, 6 * s, dark);
      if (art) { ctx.fillStyle = C.gold; for (let i = 1; i < 5; i++) { ctx.save(); ctx.translate(-L * hl * i / 5, 0); ctx.rotate(Math.PI / 4); ctx.fillRect(-2 * s, -2 * s, 4 * s, 4 * s); ctx.restore(); } }
      ctx.fillStyle = art ? C.gold : ink; ctx.beginPath(); ctx.ellipse(0, 0, 2.6 * s, 7.5 * s, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(1, -2.6 * s); ctx.quadraticCurveTo(L * 0.6, -3 * s - L * 0.02, L, -L * 0.08);
      ctx.quadraticCurveTo(L * 0.58, 3.4 * s - L * 0.012, 1, 2.6 * s); ctx.closePath();
      ctx.fillStyle = steel; ctx.fill();
      if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = art ? 1.6 : 1.1; ctx.beginPath(); ctx.moveTo(4, -2.6 * s); ctx.quadraticCurveTo(L * 0.6, -3 * s - L * 0.02, L, -L * 0.08); ctx.stroke(); }
      if (art) line(-L * hl, 0, -L * hl, 0, 9 * s, C.gold);
      break;
    }
    // Akari's Kagehira & Yūrei (twinShape): two short, narrow blades with different guards. Kagehira (main hand) is
    // straight with a squared bar guard and a chisel tip; Yūrei (off hand) has a ring guard, a slight curve and a violet
    // edge line.
    case 'kagehira': case 'yurei': {
      const yurei = sh === 'yurei', hl = 0.3;
      line(-L * hl, 0, -1 * s, 0, 5.2 * s, dark);
      ctx.fillStyle = art ? C.gold : yurei && mode !== 'flat' ? '#5c4d78' : ink;
      if (yurei) { ctx.beginPath(); ctx.arc(-0.4 * s, 0, 6 * s, 0, TAU); ctx.arc(-0.4 * s, 0, 2.6 * s, 0, TAU, true); ctx.fill('evenodd'); }
      else { ctx.fillRect(-2 * s, -7 * s, 3.6 * s, 14 * s); ctx.fillRect(-2 * s, -7 * s, 6 * s, 2.2 * s); ctx.fillRect(-2 * s, 4.8 * s, 6 * s, 2.2 * s); }
      if (rim) break;
      const w = 1.9 * s, b0 = 3 * s;
      ctx.beginPath();
      if (!yurei) { ctx.moveTo(b0, -w); ctx.lineTo(L * 0.9, -w); ctx.lineTo(L, -w * 0.15); ctx.lineTo(L * 0.86, w); ctx.lineTo(b0, w); }
      else { const sori = L * 0.06; ctx.moveTo(b0, -w); ctx.quadraticCurveTo(L * 0.55, -w - sori, L, -sori * 1.4); ctx.quadraticCurveTo(L * 0.55, w - sori * 0.6, b0, w); }
      ctx.closePath();
      // in Akari's own hands the blades glow violet (a soft bloom round a lilac blade)
      const glow = mode === 'ink' && f && f.helmet === 'akari_mask';
      if (glow) { ctx.strokeStyle = 'rgba(170,110,255,0.45)'; ctx.lineWidth = 4 * s; ctx.stroke(); }
      ctx.fillStyle = glow ? '#e4d6ff' : steel; ctx.fill();
      if (mode !== 'flat') {
        ctx.strokeStyle = art ? C.emberBright : yurei || glow ? 'rgba(180,140,240,0.85)' : 'rgba(120,114,104,0.6)'; ctx.lineWidth = (art ? 1.3 : 0.9) * s;
        ctx.beginPath(); if (yurei) { const sori = L * 0.06; ctx.moveTo(b0 + 2 * s, w * 0.6); ctx.quadraticCurveTo(L * 0.55, w * 0.6 - sori * 0.6, L * 0.96, -sori * 1.3); } else { ctx.moveTo(b0 + 2 * s, 0); ctx.lineTo(L * 0.88, 0); } ctx.stroke();
      }
      break;
    }
    case 'crescent': {
      line(-L * 0.18, 0, 0, 0, 6 * s, dark);
      ctx.beginPath(); ctx.arc(L * 0.45, -L * 0.05, L * 0.55, Math.PI * 0.95, Math.PI * 2.05, false);
      ctx.arc(L * 0.45, -L * 0.22, L * 0.42, Math.PI * 2.0, Math.PI * 0.98, true); ctx.closePath();
      ctx.fillStyle = steel; ctx.fill();
      if (!art && mode !== 'flat') { ctx.strokeStyle = 'rgba(155,140,255,0.6)'; ctx.lineWidth = 1.3; ctx.stroke(); }
      break;
    }
    case 'fan': {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, L, -0.42, 0.18); ctx.closePath();
      ctx.fillStyle = steel; ctx.fill();
      if (mode === 'flat') break;   // flat passes: one clean silhouette
      ctx.strokeStyle = art ? C.goldDim : 'rgba(185,196,201,0.45)'; ctx.lineWidth = 1;
      for (let a = -0.4; a <= 0.18; a += 0.1) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.stroke(); }
      break;
    }
    case 'cleaver': case 'tyrant': {
      const big = sh === 'tyrant';
      line(-L * 0.3, 0, L * 0.05, 0, (big ? 8 : 6.5) * s, dark);
      ctx.beginPath();
      ctx.moveTo(L * 0.04, -6 * s); ctx.lineTo(L * 0.86, -12 * s); ctx.lineTo(L, -2 * s); ctx.lineTo(L * 0.98, (big ? 26 : 18) * s);
      if (big) { for (let i = 0; i < 5; i++) ctx.lineTo(L * (0.84 - i * 0.15), (i % 2 ? 22 : 30) * s); }
      ctx.lineTo(L * 0.2, (big ? 22 : 15) * s); ctx.lineTo(L * 0.04, 7 * s); ctx.closePath();
      ctx.fillStyle = steel; ctx.fill();
      if (edge) { ctx.strokeStyle = big && !art ? 'rgba(255,106,60,0.7)' : edge; ctx.lineWidth = art ? 2 : 1.3; ctx.beginPath(); ctx.moveTo(L * 0.2, (big ? 22 : 15) * s); ctx.lineTo(L * 0.98, (big ? 26 : 18) * s); ctx.stroke(); }
      ctx.fillStyle = art ? C.void : 'rgba(236,229,211,0.2)'; ctx.beginPath(); ctx.arc(L * 0.8, -3 * s, 3 * s, 0, TAU); ctx.fill();
      break;
    }
    case 'odachi': {
      // Raikō no Tachi: a long wrapped grip, a heavy square guard, then a broad, rugged blade with a notched spine,
      // a clipped point and a red lightning groove down its length. Broad, never comically large.
      const hl = 0.27, hw = 2.6 * s;
      line(-L * hl, 0, -2 * s, 0, hw * 2, dark);
      if (!rim && mode !== 'flat') {
        ctx.fillStyle = art ? C.gold : '#5a3a34';
        for (let i = 1; i < 5; i++) { ctx.save(); ctx.translate(-L * hl * (i + 0.1) / 5.2, 0); ctx.rotate(Math.PI / 4); ctx.fillRect(-1.1 * s, -1.1 * s, 2.2 * s, 2.2 * s); ctx.restore(); }
      }
      ctx.fillStyle = art ? C.gold : ink; ctx.fillRect(-3.6 * s, -7.5 * s, 4.6 * s, 15 * s);   // square tsuba
      if (rim) break;
      const N = 9, sori = L * 0.035, bx = 1.4 * s, yk = 0.9;
      const cy = u => -sori * u * u, X = u => bx + (L - bx) * u;
      const wb = u => lerp(4.2, 3.4, u) * s, we = u => lerp(7.6, 6, u) * s;
      ctx.beginPath(); ctx.moveTo(bx, cy(0) - wb(0));
      for (let i = 1; i <= N; i++) { const u = yk * i / N; ctx.lineTo(X(u), cy(u) - wb(u) + (i === 3 || i === 6 ? 1.8 * s : 0)); }  // spine, two notches
      ctx.lineTo(L, cy(1) - wb(1) * 0.3);                                          // clipped point
      ctx.lineTo(X(0.95), cy(0.95) + we(0.95));
      for (let i = N; i >= 0; i--) { const u = yk * i / N; ctx.lineTo(X(u), cy(u) + we(u)); } // broad edge
      ctx.closePath();
      // in the Storm King's own hand the blade burns: a red bloom round a pale-hot edge
      const burn = mode === 'ink' && bossLook(f) === 'raikon' && !(f && f.hollow);
      if (burn) { ctx.strokeStyle = 'rgba(255,40,40,0.4)'; ctx.lineWidth = 5 * s; ctx.stroke(); }
      ctx.fillStyle = burn ? '#ffe3de' : steel; ctx.fill();
      if (mode !== 'flat') {
        // the red lightning groove; it flares while the blade gathers a strike
        const hot = f && (f.telegraph > 0 || (f.state === 'ability' && f.abil && f.abil.charge));
        const echo = f && f.hollow;   // Hollow Raikon's corrupted copy (the Core): the groove runs violet
        ctx.strokeStyle = art ? C.emberBright : echo ? (hot ? '#e4d6ff' : '#b48aff') : hot ? '#ff6a52' : '#c8261e'; ctx.lineWidth = (hot ? 2.2 : 1.5) * s; ctx.lineJoin = 'miter';
        ctx.beginPath();
        for (let i = 0; i <= 8; i++) { const u = 0.06 + 0.78 * i / 8; ctx.lineTo(X(u), cy(u) + (i % 2 ? 1.6 : -0.6) * s); }
        ctx.stroke(); ctx.lineJoin = 'round';
        ctx.fillStyle = art ? C.gold : '#9a948a'; ctx.fillRect(bx, cy(0) - wb(0), 3.4 * s, wb(0) + we(0));   // habaki
      }
      break;
    }
    case 'spear': {
      line(-L * 0.42, 0, L * 0.84, 0, 4.2 * s, dark);
      ctx.beginPath(); ctx.moveTo(L * 0.82, -5 * s); ctx.quadraticCurveTo(L * 0.92, -9 * s, L, 0); ctx.quadraticCurveTo(L * 0.92, 9 * s, L * 0.82, 5 * s); ctx.closePath();
      ctx.fillStyle = steel; ctx.fill();
      if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = 1.1; ctx.stroke(); }
      ctx.strokeStyle = art ? C.emberBright : 'rgba(210,74,60,0.85)'; ctx.lineWidth = 2;
      const sw = f ? Math.sin(f.time * 9) * 4 : 0;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(L * 0.8, i * 2); ctx.quadraticCurveTo(L * 0.76, 10 * s, L * 0.74 + sw, (16 + i * 3) * s); ctx.stroke(); }
      ctx.fillStyle = art ? C.gold : dark; ctx.fillRect(L * 0.78, -4 * s, 3 * s, 8 * s);
      break;
    }
    case 'staff': {
      line(-L * 0.5, 0, L * 0.5, 0, 4.6 * s, dark);
      if (mode !== 'flat') {   // flat passes: one clean silhouette, no bands
        ctx.strokeStyle = art ? C.gold : ANIME.silver; ctx.lineWidth = 2;
        for (const x of [-0.46, -0.4, 0.4, 0.46]) { ctx.beginPath(); ctx.moveTo(L * x, -4 * s); ctx.lineTo(L * x, 4 * s); ctx.stroke(); }
      }
      break;
    }
    case 'sickle': case 'hook': {
      line(-6 * s, 0, L * 0.55, 0, 5 * s, dark);
      ctx.beginPath();
      if (sh === 'sickle') {
        ctx.moveTo(L * 0.5, -3 * s); ctx.quadraticCurveTo(L * 0.95, -8 * s, L * 1.0, -L * 0.62); ctx.quadraticCurveTo(L * 0.8, -12 * s, L * 0.5, 4 * s);
      } else {
        ctx.moveTo(L * 0.5, -3 * s); ctx.quadraticCurveTo(L * 1.05, -4 * s, L * 0.9, -L * 0.42); ctx.lineTo(L * 0.8, -L * 0.3); ctx.quadraticCurveTo(L * 0.85, -6 * s, L * 0.5, 4 * s);
      }
      ctx.closePath(); ctx.fillStyle = steel; ctx.fill();
      if (edge) { ctx.strokeStyle = sh === 'sickle' && !art ? 'rgba(155,140,255,0.65)' : edge; ctx.lineWidth = 1.2; ctx.stroke(); }
      break;
    }
    case 'hammer': {
      line(-L * 0.08, 0, L * 0.84, 0, 5 * s, dark);
      ctx.fillStyle = steel; ctx.fillRect(L * 0.74, -24 * s, L * 0.28, 48 * s);
      ctx.fillStyle = art ? C.goldDim : 'rgba(236,229,211,0.18)';
      ctx.fillRect(L * 0.74, -24 * s, L * 0.04, 48 * s); ctx.fillRect(L * 0.98, -24 * s, L * 0.04, 48 * s);
      if (!art && mode !== 'flat') { ctx.strokeStyle = 'rgba(210,74,60,0.6)'; ctx.lineWidth = 1.4; ctx.strokeRect(L * 0.74, -24 * s, L * 0.28, 48 * s); }
      break;
    }
  }
}

/* ---- helmets: local head frame, origin = head centre, +x = facing ---- */
function drawHelmet(ctx, key, r, ink, opt, f) {
  const flat = !!opt.color;
  const acc = (c) => (flat ? ink : c);
  ctx.fillStyle = ink; ctx.strokeStyle = ink;
  switch (key) {
    case 'topknot': // Kage's spiky hair over his black face (his red scarf is drawn with the body); anyone else adds a crimson hachimaki
      if (f && f.hollow && !f.isPlayer && animeSkin(f).hollow) { drawHollowHead(ctx, f, r, ink, flat); break; }   // Hollow Kage: the ronin (23-anime-hollow.js)
      drawKageHair(ctx, r, ink, flat, f);
      if (f && f.isPlayer) break;
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * 1.04, 0, TAU); ctx.clip();
      ctx.fillStyle = flat ? ink : C.emberBright;
      ctx.beginPath(); ctx.moveTo(-r * 1.1, -r * 0.5); ctx.lineTo(r * 1.1, -r * 0.4); ctx.lineTo(r * 1.1, -r * 0.2); ctx.lineTo(-r * 1.1, -r * 0.29); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = flat ? ink : '#b8362b'; ctx.beginPath(); ctx.ellipse(-r * 1.0, -r * 0.39, r * 0.15, r * 0.12, 0.4, 0, TAU); ctx.fill();
      break;
    case 'witness_mask': // the Witness: a crown of black spikes, the masked face's markings, white eyes; on a Kage-flicker frame, Kage's hair
      drawWitnessHead(ctx, f, r, ink, flat);   // 29w-anime-witness.js
      break;
    case 'headband': { // the Interlude's young brothers: Rem's white band and ring (26-anime-rem.js); young Kage's short crimson band
      if (isRem(f)) { drawRemHead(ctx, f, r, ink, flat); break; }
      drawKageHair(ctx, r, ink, flat, f);
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * 1.04, 0, TAU); ctx.clip();
      ctx.fillStyle = flat ? ink : headbandColor(f);
      ctx.beginPath(); ctx.moveTo(-r * 1.1, -r * 0.42); ctx.lineTo(r * 1.1, -r * 0.34); ctx.lineTo(r * 1.1, -r * 0.12); ctx.lineTo(-r * 1.1, -r * 0.2); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = flat ? ink : headbandColor(f); ctx.beginPath(); ctx.ellipse(-r * 1.0, -r * 0.3, r * 0.15, r * 0.12, 0.4, 0, TAU); ctx.fill();
      break;
    }
    case 'ronin_hood': case 'sage_antlers': case 'hollow_crest': case 'executioner':
      // the shop's hoods and kabuto with no wearer of their own: Kuro Zukin, Shika Kabuto, Utsuro Kabuto, Shikkō Zukin (29g-anime-gear.js)
      drawGearHead(ctx, key, f, r, ink, flat);
      break;
    case 'straw_kasa':
      // Takashi's gold-rimmed kasa with his white hair and beard; the Kasa or the plain Sugegasa on Kage (29-anime-takashi.js)
      drawStrawKasa(ctx, f, r, ink, flat);
      break;
    case 'oni':   // Garan's oni (24-anime-subs-a.js); the Echo placeholders' violet oni (25-anime-subs-b.js)
      if (f && /^echo_/.test(animeSkin(f).sub || '')) drawSubBHead(ctx, 'oni_echo', f, r, ink, flat); else drawSubHead(ctx, 'oni', f, r, ink, flat);
      break;
    case 'iron_kabuto': case 'oni_mask': case 'storm_band': case 'disciple_wrap': case 'blademaster_kabuto':
      // the Act II / III sub-bosses' heads, also gear (25-anime-subs-b.js)
      drawSubBHead(ctx, key, f, r, ink, flat);
      break;
    case 'sentinel_helm': case 'veil': case 'sumi_eboshi': case 'rain_hood': case 'courier_hat': case 'borrowed_mask':
      // the Act I / II sub-bosses' heads (24-anime-subs-a.js)
      drawSubHead(ctx, key, f, r, ink, flat);
      break;
    case 'raijin_kabuto': {
      // Raikon himself (and his echo): the red-edged jingasa with its flame crest and tassels (27-anime-raikon.js)
      if (bossLook(f) === 'raikon') { drawRaikonHead(ctx, f, r, ink, flat); break; }
      // Raikon's Raijin Kabuto: an angular faceted bowl, a peak jutting over the brow, a stepped neck guard swept back,
      // and a short red lightning crest on the front
      ctx.beginPath(); ctx.moveTo(-r * 1.15, -r * 0.1); ctx.lineTo(-r * 0.98, -r * 0.92); ctx.lineTo(-r * 0.3, -r * 1.34); ctx.lineTo(r * 0.5, -r * 1.24); ctx.lineTo(r * 1.1, -r * 0.66); ctx.lineTo(r * 1.2, -r * 0.18); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.55); ctx.lineTo(-r * 1.7, -r * 0.05); ctx.lineTo(-r * 1.55, r * 0.28); ctx.lineTo(-r * 1.95, r * 0.42); ctx.lineTo(-r * 1.75, r * 0.72); ctx.lineTo(-r * 0.85, r * 0.78); ctx.lineTo(-r * 0.3, r * 0.15); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(r * 0.1, -r * 0.42); ctx.lineTo(r * 1.62, -r * 0.34); ctx.lineTo(r * 1.15, -r * 0.08); ctx.lineTo(r * 0.1, -r * 0.1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = acc(C.emberBright);
      ctx.beginPath(); ctx.moveTo(r * 0.12, -r * 1.24); ctx.lineTo(r * 0.5, -r * 1.86); ctx.lineTo(r * 0.36, -r * 1.78); ctx.lineTo(r * 0.82, -r * 2.36); ctx.lineTo(r * 0.62, -r * 1.62); ctx.lineTo(r * 0.8, -r * 1.68); ctx.lineTo(r * 0.56, -r * 1.2); ctx.closePath(); ctx.fill();
      if (!flat) {
        ctx.strokeStyle = 'rgba(255,74,60,0.45)'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.lineJoin = 'miter';
        ctx.beginPath(); ctx.moveTo(-r * 0.98, -r * 0.92); ctx.lineTo(r * 1.1, -r * 0.66); ctx.stroke();               // facet ridge
        ctx.beginPath(); ctx.moveTo(-r * 1.62, r * 0.3); ctx.lineTo(-r * 0.62, r * 0.28); ctx.stroke();                // neck guard step
        ctx.lineJoin = 'round';
      }
      break;
    }
    case 'akari_mask':
      // Akari (and her echo): ponytail tie and sakura ornament, fringe, side lock, half-mask and white eyes (28-anime-akari.js)
      drawAkariHead(ctx, f, r, ink, flat);
      break;
    case 'order_hood': case 'order_kabuto':
      // the Order of Silence: each soldier type's own hood or kabuto over a fox mask (22-anime-order.js)
      drawOrderHead(ctx, f, r, ink, flat);
      break;
    case 'hollow_shard':
      // the Hollows: each type's cowl, hood or hat with its cracked mask fragments (23-anime-hollow.js)
      drawHollowHead(ctx, f, r, ink, flat);
      break;
  }
}

/* ---- armor drawn over the torso (Ut = torso width unit) ---- */
function drawArmor(ctx, f, ink, opt, Ut) {
  const sk = f.sk, s = f.scale, flat = !!opt.color, fc = f.facing;
  const hx = sk.hip.x, hy = sk.hip.y, nx = sk.neck.x, ny = sk.neck.y;
  const ang = Math.atan2(ny - hy, nx - hx);
  ctx.fillStyle = ink;
  switch (f.armor) {
    case 'training': break;   // the Interlude's plain training clothes: just the gi and its obi
    case 'travel_coat':
      // Rem's worn travel coat, wrapped shut under a violet collar band (26-anime-rem.js)
      drawRemCoat(ctx, f, ink, flat);
      break;
    case 'tachibana': {
      // Kage's starting Tachibana Yoroi: a compact dark-metal shoulder guard of three lames laced in crimson, and the
      // small family crest, half-hidden behind the near arm
      const r = Ut * 0.5, a = ang + Math.PI / 2;
      for (let i = 2; i >= 0; i--) {
        const cx = sk.sh.x - fc * r * 0.18 + Math.cos(ang) * -r * 0.45 * i, cy = sk.sh.y + r * 0.2 + Math.sin(ang) * -r * 0.45 * i;
        ctx.fillStyle = flat ? ink : i === 0 ? ANIME.metal1 : ANIME.metal0;
        ctx.beginPath(); ctx.ellipse(cx, cy, r * (1.12 - i * 0.06), r * 0.62, a, Math.PI * 0.95, Math.PI * 2.05); ctx.closePath(); ctx.fill();
        if (!flat) {
          ctx.strokeStyle = ANIME.metal2; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.ellipse(cx, cy, r * (1.12 - i * 0.06), r * 0.62, a, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
          ctx.fillStyle = ANIME.crimson; for (const k of [-0.5, 0, 0.5]) { ctx.beginPath(); ctx.arc(cx + Math.cos(a) * k * r, cy + Math.sin(a) * k * r + r * 0.15, 0.8 * s, 0, TAU); ctx.fill(); }
        }
      }
      if (!flat) {
        const px = lerp(hx, nx, 0.72) - fc * Ut * 0.3, py = lerp(hy, ny, 0.72);
        ctx.fillStyle = 'rgba(169,173,179,0.55)'; ctx.beginPath(); ctx.arc(px, py, 1.4 * s, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'jerkin': case 'gate_plate': case 'conduit_harness': case 'ledger_coat': case 'pauldrons': case 'tyrant': case 'cloak':
      // the Act II / III sub-bosses' armour, also gear (25-anime-subs-b.js)
      drawSubBArmor(ctx, f, f.armor);
      break;
    case 'lamellar': case 'executioner_garb': case 'colossus_plate': case 'storm_mantle':
      // the shop's armour with no wearer of its own: Kozane-dō, Shikkō Garb, Kurogane-dō, Raiun Mantle (29g-anime-gear.js)
      drawGearArmor(ctx, f, f.armor);
      break;
    case 'mei_en':
      // the Mei-En Garb: Akari's fitted top and high collar on her, a violet-edged chest guard on Kage (28-anime-akari.js)
      drawMeiEn(ctx, f, ink, flat);
      break;
    case 'kysmei':
      // the Witness's armoured coat, breastplate and core bezel; the Kysmei Robe's chest plate and collar on Kage; nothing
      // on the Witness's Kage-flicker frames, which wear Kage's own coat (29w-anime-witness.js)
      drawKysmeiArmor(ctx, f, ink, flat);
      break;
    case 'shinsei':
      // the Shinsei Yoroi: Takashi's robe torso, capelet, gold clasp and cords; the capelet over Kage's coat (29-anime-takashi.js)
      drawShinsei(ctx, f, ink, flat);
      break;
    case 'raikon_plate':
      // Raikon's armoured coat, breastplate, crossed cords and white fur mantle (27-anime-raikon.js); enemy-only
      drawRaikonArmor(ctx, f, ink, flat);
      break;
    case 'half_do': case 'vanguard_plate': case 'robe': case 'mist_shroud': case 'shadow_cloak': case 'operative_vest':
      // the Act I / II sub-bosses' armour (24-anime-subs-a.js)
      drawSubArmor(ctx, f, f.armor);
      break;
    case 'order_garb': case 'order_plate':
      // the Order's lacquered dō laced in crimson: full, light (hara-ate) or heavy per soldier type (22-anime-order.js)
      drawOrderArmor(ctx, f, ink, flat);
      break;
    case 'hollow_rags':
      // the Hollows' torn robe over the gi: a rip, rope, wraps, a kesa, a mirror or a cracked chest per type (23-anime-hollow.js)
      drawHollowArmor(ctx, f, ink, flat);
      if (animeSkin(f).sub === 'utsushi') drawUtsushiScraps(ctx, f);   // 24-anime-subs-a.js
      break;
  }
}

/* ---- render a fighter into a UI canvas (portraits, armory preview, map silhouettes) ---- */
function makeFighterFromEnemy(id, extra) {
  const d = ENEMIES[id];
  return new Fighter(Object.assign({ def: d, name: d.name, title: d.title, weapon: d.weapon, helmet: d.helmet, armor: d.armor, build: d.build, eye: d.eye, accent: d.accent, hp: d.hp, facing: -1 }, extra || {}));
}
// the training headband's colour: crimson for young Kage (his colour long before the scarf; Rem's band is white), the
// accent for anyone else
function headbandColor(f) { return f && !f.isPlayer ? (f.accent || '#9a6bff') : ANIME.crimsonHi; }
// Young Kage for the Interlude spar: a smaller build in plain training clothes with a pale headband and a bokken. None
// of the player's gear applies (Logic.youngKage); no face-wrap yet, that comes later in his life.
function makeYoungKage(extra) {
  const k = Logic.youngKage();
  return new Fighter(Object.assign({ name: 'Kage', title: 'Young Kage', isPlayer: true, scarf: false, weapon: k.weapon, wlvl: 1, helmet: k.helmet, armor: k.armor, build: k.build, hp: k.hp, ammo: 0, facing: 1 }, extra || {}));
}
function makePlayerFighter(save, extra) {
  return new Fighter(Object.assign({ name: 'Kage', isPlayer: true, scarf: true, weapon: save.equipped.weapon, wlvl: save.owned.weapons[save.equipped.weapon] || 1, helmet: save.equipped.helmet, armor: save.equipped.armor, build: { scale: 1, w: 9.6, legs: 0.9, head: 1.05 }, facing: 1 }, extra || {}));
}
function poseFighter(f, poseName, settle) {
  f.state = 'pose'; f.poseName = poseName;
  const src = POSES[poseName] || STANCES[f.weapon().stance] || STANCES.fists;
  for (const k of POSE_KEYS) if (src[k] != null) f.pose[k] = src[k];
  f.pose.ik = src.ik || 0;
  if (src.wa == null) f.pose.wa = f.pose.fs + f.pose.fe + (CARRY[f.shape()] || 0);
  if (src.wb == null) f.pose.wb = f.pose.bs + f.pose.be + (CARRY[f.shape()] || 0);
  f.hipOffInit = false;
  f.computeSkeleton();
  for (let i = 0; i < (settle || 40); i++) { f.updatePose(STEP); f.computeSkeleton(); f.updateCloth(STEP); f.time += STEP; }
}
