/* ---- Akari, drawn from the user's art (godot/akari-rig/source/akari.svg), the way it was rigged in Godot ----
   tools/akari-rig/game.py cut the art into parts (AKARI_PARTS, 34e-akari-parts.js; one atlas, akari_parts.webp):
   rigid parts on one bone (head, torso, pauldron, upper arm, forearm, the fist on the staff, the staff and the scythe's
   head) and skinned meshes on bone chains (the ponytail on two chains, the scarf, the coat tail on two, the skirt on
   three, the scythe's ribbon tassels on two, the legs on thigh and shin). Here that rig is posed on her fighter
   skeleton every frame, in the art's own space (it faces left; facing right mirrors it):
     body      the pelvis and chest turn with her spine, the head with her neck, the legs reach her knees and feet (two
               bone IK, the knee on the game's side), the near arm reaches her hand from the art's shoulder, keeping the
               game's arm pose; the far arm is the same arm again, darker, behind her
     scythe    the staff turns with her weapon (AkariRig's clips: 64-akari-rig.js) in the fist that grips it; its head
               leaves on the chain (62b-akari-chain.js) and is drawn there by drawHead
     cloth     every chain is a spring per bone in the art's space (the Godot rig's SecondaryMotionChain): rest angle +
               a travelling sine of wind + an inverse-velocity drag (-vx, -vy), stiffness falling to the tip, damping
               under 1 so it swings past and settles; the skirt panels also follow the leg in front of them
     flowers   the five sakura on the scythe turn on their centres, faster as she swings
     attack    the chest leans after the blade (back on the wind-up, through on the cut), the blade leaves pink
               afterimages along its arc, and her eye flares on every tell
   The figure is rendered once per frame into an offscreen canvas at the screen's resolution; every pass of the body
   (the ink outline, the rim, the impact frame, the flash, her afterimages) stamps that one image, tinted on the flat
   passes. Drawing only: nothing here moves a joint, timer or hitbox, and it uses no game randomness. Without the
   decoded atlas (Node tests, the first frames) her drawn version (_skin.js, scythe.js ...) stands in. ---- */
const AkariArt = {
  im: null, D: null,
  ready() {
    if (typeof AKARI_PARTS === 'undefined' || typeof Image === 'undefined' || typeof document === 'undefined') return false;
    if (!this.im) { this.im = new Image(); this.im.src = AKARI_PARTS.img; }
    const w = this.im.naturalWidth;   // a real decoded image only (the test harness's stub Image never is)
    if (!(this.im.complete && typeof w === 'number' && w > 0)) return false;
    if (!this.D) this._init();
    return true;
  },
  // drawn on the boss Akari only (her Hollow echo keeps its own ashen drawn look), once the atlas has decoded
  on(f) { return !!(f && !f.hollow && f.def && animeSkin(f).akari === 'boss' && this.ready()); },

  // the rig, in the art's own px: each bone's rest pose (global and relative to its parent), the chains' feel
  _init() {
    const A = AKARI_PARTS, B = A.bones.map(b => ({ ...b }));
    const idx = {}; B.forEach((b, i) => { idx[b.n] = i; });
    for (const b of B) {
      b.rg = _akM(b.a, b.x, b.y);                       // rest, global
      b.rl = b.p < 0 ? b.rg : _akMul(_akInv(B[b.p].rg), b.rg);   // rest, relative to the parent
      b.la = Math.atan2(b.rl[1], b.rl[0]);              // its rest angle relative to the parent
      b.inv = _akInv(b.rg);
    }
    const chains = {};
    for (const k in A.chains) chains[k] = { bones: A.chains[k], feel: AK_ART_FEEL[k] || AK_ART_FEEL.scarf, follow: AK_ART_FOLLOW[k] };
    // the blade's two trail points (inner, outer) in the weapon's frame: [along the staff, across it] in art px
    const w = B[idx.weapon], u = [Math.cos(w.a), Math.sin(w.a)], n = [-u[1], u[0]];
    const loc = (p) => { const d = [p[0] - w.x, p[1] - w.y]; return [d[0] * u[0] + d[1] * u[1], d[0] * n[0] + d[1] * n[1]]; };
    this.D = { A, B, idx, chains, bladeIn: loc([455, 318]), bladeOut: loc([170, 120]), socket: [B[idx.blade].x, B[idx.blade].y],
      legs: { f: [idx.leg_f_up, idx.leg_f_low], b: [idx.leg_b_up, idx.leg_b_low] },
      thigh: { f: B[idx.leg_f_up].l, b: B[idx.leg_b_up].l }, shin: { f: B[idx.leg_f_low].l, b: B[idx.leg_b_low].l },
      armUp: B[idx.arm_up].l, armFore: Math.hypot(B[idx.weapon].x - B[idx.arm_fore].x, B[idx.weapon].y - B[idx.arm_fore].y),
      parts: {} };
    for (const p of A.parts) this.D.parts[p.n] = p;
    this.D.legLen = this.D.thigh.f + this.D.shin.f;
  },

  // world px per art px for this fighter: her art legs as long as her game legs, times AK_ART_SIZE (the art's long
  // legs would make her far taller than Kage otherwise)
  k(f) { return (BODY.thigh + BODY.shin) * f.scale * f.build.legs / this.D.legLen * AK_ART_SIZE; },
  // where the art's hips sit in the world: the game's hip, lowered by what the shorter art legs don't reach
  _anchor(f, out) {
    const sk = f.sk, u = 1 - AK_ART_SIZE;
    out.x = sk.hip.x + ((sk.fft.x + sk.bft.x) / 2 - sk.hip.x) * u; out.y = sk.hip.y + ((sk.fft.y + sk.bft.y) / 2 - sk.hip.y) * u;
    return out;
  },

  /* ---- posing ---- */
  // the per-fighter state: posed bone matrices, chain springs, the scythe's recent poses (afterimages)
  _st(f) {
    const D = this.D;
    let S = f._akArt;
    if (!S) {
      S = f._akArt = { M: D.B.map(b => b.rg.slice()), ang: {}, spin: {}, last: -1, vel: [0, 0], ghosts: [], key: '', poseKey: '', cv: null, tints: {}, eye: 0, t: 0, lunge: 0,
        fl: D.A.flowers.map(fl => (fl.turn || 0) * DEG) };
      for (const k in D.chains) { S.ang[k] = D.chains[k].bones.map(i => D.B[i].a); S.spin[k] = D.chains[k].bones.map(() => 0); }
    }
    return S;
  },
  // a world point into the art's space (the art's hips anchor sits on _anchor)
  _toArt(f, p, k, out) {
    const D = this.D, fc = f.facing < 0 ? 1 : -1, a = f._akArt.anchor;
    out[0] = D.A.pivot[0] + (p.x - a.x) * fc / k; out[1] = D.A.pivot[1] + (p.y - a.y) / k;
    return out;
  },
  _toWorld(f, x, y, k) {
    const D = this.D, fc = f.facing < 0 ? 1 : -1, a = f._akArt.anchor;
    return { x: a.x + (x - D.A.pivot[0]) * k * fc, y: a.y + (y - D.A.pivot[1]) * k };
  },
  // pose the whole rig from her skeleton (and AkariRig's weapon pose P, if it ran); returns the art's hand, blade and
  // head socket in world space so the trail, sparks and chain start where the art's scythe is
  pose(f, P) {
    const D = this.D, B = D.B, I = D.idx, S = this._st(f), sk = f.sk, k = this.k(f), M = S.M;
    // posed once per drawn frame (every pass of the body reuses it; AkariRig moves the hand afterwards)
    const pk = f.time + ':' + sk.hip.x.toFixed(2) + ':' + sk.hip.y.toFixed(2) + ':' + f.facing;
    if (S.poseKey === pk) return S;
    S.poseKey = pk;
    this._anchor(f, S.anchor || (S.anchor = { x: 0, y: 0 }));
    const ta = this._ta || (this._ta = {}), J = (name) => this._toArt(f, sk[name], k, ta[name] || (ta[name] = [0, 0]));
    const neck = J('neck'), head = J('head'), hip = J('hip');
    const anc = D.A.pivot;   // the art's hips turn about their anchor
    const swing = P && P.swing ? 1 : 0;
    // the chest follows the blade: back on the wind-up, thrown through on the cut (art space: -x is forward)
    const wv = [f.wVec.x * (f.facing < 0 ? 1 : -1), f.wVec.y];
    const wa = Math.atan2(wv[1], wv[0]);
    let lunge = 0;
    if (P) { const a = P.a * DEG; lunge = 0.32 * Math.cos(a - 0.8) * (0.5 + 0.5 * swing); }
    if (S.lT !== f.time) { S.lT = f.time; S.lunge = lerp(S.lunge, lunge, 0.5); }
    // her spine against the game's upright (art space: up is -PI/2), split into the body's turn and the lean
    const spineG = Math.atan2(neck[1] - hip[1], neck[0] - hip[0]);
    const rot = -((f.pose.rot || 0) + (f.extraRot || 0)) * DEG;
    const lean = angDiffRad(rot, angDiffRad(-Math.PI / 2, spineG)) - AK_ART_LEAN0;
    const headRel = angDiffRad(spineG, Math.atan2(head[1] - neck[1], head[0] - neck[0]));
    // hips: about the anchor; torso: the turn, the lean and the lunge; head: on the torso, with the neck's own turn
    this._setRoot(M, I.hips, B[I.hips].a + rot + lean * 0.3 - S.lunge * 0.25, anc);
    const tA = rot + lean - S.lunge;
    this._setGlobalA(M, I.torso, B[I.torso].a + tA);
    this._setGlobalA(M, I.head, B[I.head].a + tA + headRel * 0.8 + S.lunge * 0.5);
    // legs: reach the game's feet, the knee on the game's side
    this._leg(M, 'f', J('hipF'), J('fkn'), J('fft'));
    this._leg(M, 'b', J('hipB'), J('bkn'), J('bft'));
    // the near arm: from the art's shoulder, the game's arm pose (shoulder to hand) at the art's arm length
    const armK = (D.armUp + D.armFore) / ((BODY.upper + BODY.fore) * f.scale * f.build.arms / k);
    const shF = J('shF'), fha = J('fha'), fel = J('fel');
    const sh = this._origin(M, I.arm_up);
    const tx = sh[0] + (fha[0] - shF[0]) * armK, ty = sh[1] + (fha[1] - shF[1]) * armK;
    const ex = sh[0] + (fel[0] - shF[0]) * armK, ey = sh[1] + (fel[1] - shF[1]) * armK;
    const el = _akIK(sh[0], sh[1], tx, ty, D.armUp, D.armFore, ex, ey);
    this._setGlobalA(M, I.arm_up, Math.atan2(el[1] - sh[1], el[0] - sh[0]));
    this._setGlobalA(M, I.arm_fore, Math.atan2(el[3] - el[1], el[2] - el[0]) + (B[I.arm_fore].a - Math.atan2(B[I.weapon].y - B[I.arm_fore].y, B[I.weapon].x - B[I.arm_fore].x)));
    // the scythe: in the fist, along her weapon
    this._setGlobalA(M, I.weapon, wa, [el[2], el[3]]);
    this._fk(M, I.blade);
    // the far arm: the same arm, from a shoulder a little behind, toward the game's far hand
    const shB = J('shB'), bha = J('bha'), bel = J('bel');
    const sb = [sh[0] + 14, sh[1] + 4];
    const fx = sb[0] + (bha[0] - shB[0]) * armK, fy = sb[1] + (bha[1] - shB[1]) * armK;
    const el2 = _akIK(sb[0], sb[1], fx, fy, D.armUp, D.armFore, sb[0] + (bel[0] - shB[0]) * armK, sb[1] + (bel[1] - shB[1]) * armK);
    S.far = { sh: sb, el: [el2[0], el2[1]], ha: [el2[2], el2[3]] };
    this._chains(f, S, M, k);
    // the scythe's recent poses, for its afterimages (one per simulated frame while it swings)
    if (S.gT !== f.time) {
      S.gT = f.time;
      if (swing || (P && P.spin > 6)) { S.ghosts.push({ w: M[I.weapon].slice(), b: M[I.blade].slice(), t: f.time }); if (S.ghosts.length > 6) S.ghosts.shift(); }
      while (S.ghosts.length && f.time - S.ghosts[0].t > 0.12) S.ghosts.shift();
      // her eye flares while a tell runs
      S.eye = lerp(S.eye, (f.telegraph || 0) > 0 ? 1 : swing ? 0.6 : 0.15, 0.25);
      // the flowers turn, faster while the scythe swings and while a move runs
      const boost = 1 + clamp((P ? P.spin || 0 : 0) * 0.12, 0, 4) + (f.state === 'ability' || f.state === 'move' ? 0.8 : 0);
      D.A.flowers.forEach((fl, i) => { S.fl[i] += fl.spin * DEG * boost / 60; });
    }
    // world points for the trail, the sparks and the chain
    const W = M[I.weapon], hand = this._toWorld(f, W[4], W[5], k);
    const sock = this._toWorld(f, M[I.blade][4], M[I.blade][5], k);
    S.k = k; S.hand = hand; S.sock = sock;
    return S;
  },
  // set bone i's global angle (and optionally its origin), keeping its children where they are relative to it
  _setGlobalA(M, i, a, origin) {
    const D = this.D, b = D.B[i];
    let ox, oy;
    if (origin) { ox = origin[0]; oy = origin[1]; } else if (b.p < 0) { ox = M[i][4]; oy = M[i][5]; } else { const o = _akApply(M[b.p], b.rl[4], b.rl[5]); ox = o[0]; oy = o[1]; }
    const c = Math.cos(a), s = Math.sin(a), m = M[i];
    m[0] = c; m[1] = s; m[2] = -s; m[3] = c; m[4] = ox; m[5] = oy;
  },
  _setRoot(M, i, a, anchor) {
    // the hips turn about the art's anchor (between its hip joints), which _anchor puts in the world
    const D = this.D, b = D.B[i], pv = D.A.pivot, da = a - b.a, c = Math.cos(da), s = Math.sin(da);
    const rx = b.x - pv[0], ry = b.y - pv[1];
    this._setGlobalA(M, i, a, [anchor[0] + rx * c - ry * s, anchor[1] + rx * s + ry * c]);
  },
  // forward kinematics: bone i at its rest place and angle relative to its posed parent
  _fk(M, i) { const b = this.D.B[i]; if (b.p >= 0) { const m = _akMul(M[b.p], b.rl); for (let j = 0; j < 6; j++) M[i][j] = m[j]; } },
  _origin(M, i) { const b = this.D.B[i]; return b.p < 0 ? [M[i][4], M[i][5]] : _akApply(M[b.p], b.rl[4], b.rl[5]); },
  _leg(M, side, hipJ, knee, foot) {
    const D = this.D, [iu, il] = D.legs[side], h = this._origin(M, iu);
    // the game's hip joint and the art's differ: move the target with the art's own hip
    const z = AK_ART_SIZE, tx = h[0] + (foot[0] - hipJ[0]) * z, ty = h[1] + (foot[1] - hipJ[1]) * z;
    const r = _akIK(h[0], h[1], tx, ty, D.thigh[side], D.shin[side], h[0] + (knee[0] - hipJ[0]) * z, h[1] + (knee[1] - hipJ[1]) * z);
    this._setGlobalA(M, iu, Math.atan2(r[1] - h[1], r[0] - h[0]), h);
    this._setGlobalA(M, il, Math.atan2(r[3] - r[1], r[2] - r[0]), [r[0], r[1]]);
  },
  // the springs: once per simulated frame
  _chains(f, S, M, k) {
    const D = this.D, B = D.B, I = D.idx;
    const dt = S.last < 0 ? 0 : clamp(f.time - S.last, 0, 1 / 20);
    const step = dt > 0;
    S.last = f.time;
    if (step) {
      // her velocity in the art's space, at the speed the Godot rig was tuned for (its draw scale 0.5)
      const fc = f.facing < 0 ? 1 : -1, vk = 0.5 / k * 0.55;
      const vx = (f.vx || 0) * fc * vk, vy = (f.vy || 0) * vk;
      const sm = 1 - Math.exp(-14 * dt);
      S.vel[0] += (vx - S.vel[0]) * sm; S.vel[1] += (vy - S.vel[1]) * sm;
      S.t += dt;
    }
    const vlen = Math.hypot(S.vel[0], S.vel[1]);
    for (const name in D.chains) {
      const C = D.chains[name], F = C.feel, ang = S.ang[name], spin = S.spin[name], bones = C.bones, n = bones.length;
      const par = B[bones[0]].p, parA = Math.atan2(M[par][1], M[par][0]);
      let parentA = parA;
      // the skirt panels follow the leg in front of them
      let follow = 0;
      if (C.follow) for (const [legName, w] of C.follow) { const li = I[legName]; follow += angDiffRad(B[li].a, Math.atan2(M[li][1], M[li][0])) * w; }
      const gust = 1 + 0.35 * Math.sin(TAU * 0.13 * S.t + F[9] * 1.7);
      for (let j = 0; j < n; j++) {
        const bi = bones[j], b = B[bi], t = j / Math.max(1, n - 1);
        const restA = parentA + b.la + (j === 0 ? follow : 0);
        let inertia = 0;
        if (vlen > 1) {
          const dx = -S.vel[0] * F[6], dy = -S.vel[1] * F[6];
          inertia = clamp(Math.cos(restA) * dy - Math.sin(restA) * dx, -F[7], F[7]);
        }
        const wind = F[3] * lerp(1, F[4], t) * gust * Math.sin(TAU * F[5] * S.t - j * 0.7 + F[9]);
        const target = restA + wind + inertia;
        if (step) {
          const kk = lerp(F[0], F[1], t), c = 2 * F[2] * Math.sqrt(kk);
          spin[j] += (kk * angDiffRad(ang[j], target) - c * spin[j]) * dt;
          ang[j] += spin[j] * dt;
        }
        let bend = angDiffRad(restA, ang[j]);
        if (Math.abs(bend) > F[8]) { bend = clamp(bend, -F[8], F[8]); ang[j] = restA + bend; spin[j] *= 0.5; }
        const a = restA + bend;
        this._setGlobalA(M, bi, a);
        parentA = a;
      }
    }
  },

  /* ---- drawing ---- */
  // the figure into the offscreen canvas (once per frame and screen scale); returns the cache
  _render(f, ctx, P) {
    const D = this.D, S = this._st(f);
    this.pose(f, P || (AkariRig.applies(f) && f._akRig ? f._akRig.out : null));
    const m = ctx.getTransform ? ctx.getTransform() : { a: 1, b: 0 };
    const dev = clamp(Math.hypot(m.a, m.b), 0.25, 4), r = Math.min(0.62, S.k * dev);
    const key = S.poseKey + ':' + r.toFixed(3) + ':' + (f.akChainOut ? 1 : 0) + ':' + (f.petal || '');
    if (S.key === key && S.cv) return S;
    S.key = key; S.tints = {};
    // the posed figure's bounds in the art
    const M = S.M, B = D.B, I = D.idx;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    const grow = (x, y) => { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; };
    const def = S.def || (S.def = {});
    for (const p of D.A.parts) {
      if (p.v) {
        const V = p.v, W = p.w, out = def[p.n] || (def[p.n] = new Float32Array(V.length));
        for (let j = 0, q = 0; q < V.length; j++, q += 2) {
          let x = 0, y = 0; const vx = V[q], vy = V[q + 1];
          for (const [bi, w] of W[j]) { const m2 = _akMul(M[bi], B[bi].inv); x += (m2[0] * vx + m2[2] * vy + m2[4]) * w; y += (m2[1] * vx + m2[3] * vy + m2[5]) * w; }
          out[q] = x; out[q + 1] = y; grow(x, y);
        }
      } else {
        const m2 = _akMul(M[p.b], B[p.b].inv);
        for (const [cx, cy] of [[p.at[0], p.at[1]], [p.at[0] + p.sz[0], p.at[1]], [p.at[0], p.at[1] + p.sz[1]], [p.at[0] + p.sz[0], p.at[1] + p.sz[1]]]) { const q = _akApply(m2, cx, cy); grow(q[0], q[1]); }
      }
    }
    x0 -= 30; y0 -= 30; x1 += 30; y1 += 30;
    const w = Math.ceil((x1 - x0) * r), h = Math.ceil((y1 - y0) * r);
    if (w <= 0 || h <= 0 || w > 4096 || h > 4096) return null;
    const cv = S.cv || (S.cv = document.createElement('canvas'));
    if (cv.width < w || cv.height < h || cv.width > w * 2 + 64 || cv.height > h * 2 + 64) { cv.width = w + 32; cv.height = h + 32; }
    const g = cv.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    g.setTransform(r, 0, 0, r, -x0 * r, -y0 * r);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    S.box = [x0, y0, w / r, h / r, w, h]; S.r = r;
    const parts = D.parts, im = this.im;
    const rigid = (p, m) => { if (!p) return; const m2 = _akMul(m, D.B[p.b].inv); g.save(); g.transform(m2[0], m2[1], m2[2], m2[3], m2[4], m2[5]); g.drawImage(im, p.r[0], p.r[1], p.r[2], p.r[3], p.at[0], p.at[1], p.sz[0], p.sz[1]); g.restore(); };
    const mesh = (p) => this._mesh(g, p, def[p.n], im, 0.8 / r);
    // the far arm: the near arm's pieces again, in shadow, behind her
    const far = () => {
      const F = S.far; if (!F) return;
      g.save(); g.filter = 'brightness(0.42) saturate(0.8)';
      const ua = Math.atan2(F.el[1] - F.sh[1], F.el[0] - F.sh[0]), fa = Math.atan2(F.ha[1] - F.el[1], F.ha[0] - F.el[0]);
      rigid(parts.arm_up, _akM(ua, F.sh[0], F.sh[1]));
      const foreRest = Math.atan2(B[I.weapon].y - B[I.arm_fore].y, B[I.weapon].x - B[I.arm_fore].x);
      rigid(parts.fore, _akM(fa + (B[I.arm_fore].a - foreRest), F.el[0], F.el[1]));
      rigid(parts.fist, _akM(Math.atan2(M[I.weapon][1], M[I.weapon][0]), F.ha[0], F.ha[1]));
      g.restore();
    };
    const order = ['hair', '#far', 'leg_back', 'coat', 'leg_front', 'dress', 'scarf', 'head', 'torso', 'arm_up', 'pauldron', 'fore', '#ghosts', 'blade', 'weapon', 'ribbon', '#flowers', 'fist', '#eye'];
    for (const n of order) {
      if (n === '#far') far();
      else if (n === '#ghosts') this._ghosts(g, S, f);
      else if (n === '#flowers') this._flowers(g, S, f);
      else if (n === '#eye') this._eye(g, S, f);
      else if (n === 'blade' && f.akChainOut) continue;
      else { const p = parts[n]; if (!p) continue; if (p.v) mesh(p); else rigid(p, M[p.b]); }
    }
    return S;
  },
  // a skinned part: each triangle of its mesh cut from the atlas onto its deformed place (clip slightly grown so the
  // seams between triangles close)
  _mesh(g, p, V, im, grow) {
    const T = p.t, UV = p.uv;
    for (let q = 0; q < T.length; q += 3) {
      const i0 = T[q] * 2, i1 = T[q + 1] * 2, i2 = T[q + 2] * 2;
      const x0 = V[i0], y0 = V[i0 + 1], x1 = V[i1], y1 = V[i1 + 1], x2 = V[i2], y2 = V[i2 + 1];
      const u0 = UV[i0], v0 = UV[i0 + 1], u1 = UV[i1], v1 = UV[i1 + 1], u2 = UV[i2], v2 = UV[i2 + 1];
      const du1 = u1 - u0, dv1 = v1 - v0, du2 = u2 - u0, dv2 = v2 - v0, det = du1 * dv2 - du2 * dv1;
      if (Math.abs(det) < 1e-6) continue;
      const dx1 = x1 - x0, dy1 = y1 - y0, dx2 = x2 - x0, dy2 = y2 - y0;
      const a = (dx1 * dv2 - dx2 * dv1) / det, b = (dy1 * dv2 - dy2 * dv1) / det;
      const c = (dx2 * du1 - dx1 * du2) / det, d = (dy2 * du1 - dy1 * du2) / det;
      const cx = (x0 + x1 + x2) / 3, cy = (y0 + y1 + y2) / 3;
      const gx = (x, y) => { const l = Math.hypot(x - cx, y - cy) || 1; return [x + (x - cx) / l * grow, y + (y - cy) / l * grow]; };
      const p0 = gx(x0, y0), p1 = gx(x1, y1), p2 = gx(x2, y2);
      g.save();
      g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.closePath(); g.clip();
      g.transform(a, b, c, d, x0 - a * u0 - c * v0, y0 - b * u0 - d * v0);
      g.drawImage(im, 0, 0);
      g.restore();
    }
  },
  _flowers(g, S, f) {
    const D = this.D, M = S.M, t = f.time || 0;
    D.A.flowers.forEach((fl, i) => {
      if (f.akChainOut && fl.b === D.idx.blade) return;
      const m2 = _akMul(M[fl.b], D.B[fl.b].inv), c = _akApply(m2, fl.c[0], fl.c[1]);
      const a = Math.atan2(m2[1], m2[0]) + S.fl[i];
      const sz = fl.sz[0] * fl.k, pulse = 1 + 0.035 * Math.sin(t * 2.1 + fl.c[0]);
      g.save(); g.translate(c[0], c[1]); g.rotate(a); g.scale(pulse, pulse);
      g.drawImage(this.im, fl.rect[0], fl.rect[1], fl.rect[2], fl.rect[3], fl.o[0] * fl.k, fl.o[1] * fl.k, sz, fl.sz[1] * fl.k);
      g.restore();
    });
  },
  // the blade's afterimages: its last few poses along the arc, in fading hot pink
  _ghosts(g, S, f) {
    if (!S.ghosts.length || typeof SaveManager !== 'undefined' && SaveManager.data && SaveManager.data.settings && SaveManager.data.settings.reduceFlash) return;
    const D = this.D, p = D.parts.blade, w = D.parts.weapon, n = S.ghosts.length;
    const tint = this._tinted(p && !f.akChainOut ? 'blade' : 'weapon', '#ff4fa8');
    if (!tint) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const G = S.ghosts[i], age = (f.time - G.t) / 0.12;
      g.globalAlpha = clamp(0.6 * (1 - age) * ((i + 1) / n), 0, 0.6);
      const m2 = _akMul(f.akChainOut ? G.w : G.b, D.B[f.akChainOut ? D.idx.weapon : D.idx.blade].inv), q = f.akChainOut ? w : p;
      g.save(); g.transform(m2[0], m2[1], m2[2], m2[3], m2[4], m2[5]); g.drawImage(tint, 0, 0, tint.width, tint.height, q.at[0], q.at[1], q.sz[0], q.sz[1]); g.restore();
    }
    g.restore();
  },
  // one atlas part filled in one colour (the blade's afterimage), made once
  _tinted(name, col) {
    const T = this._tintParts || (this._tintParts = {}), id = name + col;
    if (T[id]) return T[id];
    const p = this.D.parts[name]; if (!p) return null;
    const cv = document.createElement('canvas'); cv.width = p.r[2]; cv.height = p.r[3];
    const g = cv.getContext('2d'); g.drawImage(this.im, p.r[0], p.r[1], p.r[2], p.r[3], 0, 0, p.r[2], p.r[3]);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, cv.width, cv.height);
    return (T[id] = cv);
  },
  // her glowing eye: a soft pink bloom that flares into a streak while a tell runs
  _eye(g, S, f) {
    if (!f.alive && f.state === 'dead') return;
    const D = this.D, m2 = _akMul(S.M[D.idx.head], D.B[D.idx.head].inv), e = _akApply(m2, 724, 465), k = S.eye;
    const col = (typeof AKARI_PETALS !== 'undefined' && AKARI_PETALS[f.petal]) || ['#ff66b2', '#ffd6ea'];
    g.save(); g.globalCompositeOperation = 'lighter';
    const R = 26 + 30 * k, gr = g.createRadialGradient(e[0], e[1], 0, e[0], e[1], R);
    gr.addColorStop(0, `rgba(255,235,245,${0.55 + 0.4 * k})`); gr.addColorStop(0.25, col[0] + 'aa'); gr.addColorStop(1, 'rgba(255,60,150,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(e[0], e[1], R, 0, TAU); g.fill();
    if (k > 0.3) {
      // the flare: a thin horizontal streak through the eye, longer as the tell builds
      const L = 60 + 170 * k, hw = 2.6 + 2.6 * k, sg = g.createLinearGradient(e[0] - L, 0, e[0] + L * 0.6, 0);
      sg.addColorStop(0, 'rgba(255,80,170,0)'); sg.addColorStop(0.6, `rgba(255,240,250,${0.85 * k})`); sg.addColorStop(1, 'rgba(255,80,170,0)');
      g.fillStyle = sg; g.beginPath(); g.ellipse(e[0] - L * 0.2, e[1], L, hw, -0.05, 0, TAU); g.fill();
    }
    g.restore();
  },
  // the figure, stamped into the frame: the colour image, or one colour on the flat passes
  draw(f, ctx, flatColor) {
    const S = this._render(f, ctx);
    if (!S || !S.cv) return false;
    let img = S.cv;
    if (flatColor) {
      img = S.tints[flatColor];
      if (!img) {
        img = S.tints[flatColor] = document.createElement('canvas'); img.width = S.cv.width; img.height = S.cv.height;
        const g = img.getContext('2d'); g.drawImage(S.cv, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = flatColor; g.fillRect(0, 0, img.width, img.height);
      }
    }
    const D = this.D, k = S.k, fc = f.facing < 0 ? 1 : -1, b = S.box, pv = D.A.pivot;
    ctx.save();
    ctx.translate(S.anchor.x, S.anchor.y); ctx.scale(fc * k, k); ctx.translate(-pv[0], -pv[1]);
    ctx.drawImage(img, 0, 0, b[4], b[5], b[0], b[1], b[2], b[3]);
    ctx.restore();
    return true;
  },
  // the scythe's head alone, out on the chain (62b-akari-chain.js), in the chain's frame: the socket at the origin,
  // the staff's line along +x
  drawHead(ctx, f) {
    if (!this.on(f)) return false;
    const D = this.D, I = D.idx, p = D.parts.blade, k = this.k(f), w = D.B[I.weapon];
    ctx.save(); ctx.scale(k, k); ctx.rotate(-w.a); ctx.translate(-D.socket[0], -D.socket[1]);
    ctx.drawImage(this.im, p.r[0], p.r[1], p.r[2], p.r[3], p.at[0], p.at[1], p.sz[0], p.sz[1]);
    for (const fl of D.A.flowers) if (fl.b === I.blade) {
      ctx.save(); ctx.translate(fl.c[0], fl.c[1]); ctx.rotate((fl.turn || 0) * DEG + fl.spin * DEG * (f.time || 0) * 3);
      ctx.drawImage(this.im, fl.rect[0], fl.rect[1], fl.rect[2], fl.rect[3], fl.o[0] * fl.k, fl.o[1] * fl.k, fl.sz[0] * fl.k, fl.sz[1] * fl.k);
      ctx.restore();
    }
    ctx.restore();
    return true;
  },
  // the blade's trail points for the energy trail and sparks (64-akari-gl.js): [along, across] in units of L
  bladePoints(f, L) {
    const D = this.D, k = this.k(f);
    return [[D.bladeIn[0] * k / L, -D.bladeIn[1] * k / L], [D.bladeOut[0] * k / L, -D.bladeOut[1] * k / L]];
  }
};

// how each chain moves: [stiffness, tip stiffness, damping ratio, wind amplitude, wind tip gain, wind frequency,
// velocity influence, max drag angle, max bend, wind phase] (the Godot rig's FEEL, build/build_akari.gd)
const AK_ART_FEEL = {
  hair_top: [62, 20, 0.26, 0.045, 2.4, 0.5, 0.00075, 0.55, 1.1, 0],
  hair_low: [58, 18, 0.24, 0.05, 2.4, 0.46, 0.0008, 0.6, 1.2, 1.37],
  scarf:    [50, 15, 0.22, 0.07, 2.6, 0.6, 0.00085, 0.7, 1.3, 2.74],
  coat_top: [78, 28, 0.3, 0.04, 2.2, 0.52, 0.00042, 0.3, 0.7, 4.11],
  coat_low: [84, 32, 0.32, 0.035, 2.0, 0.55, 0.00036, 0.26, 0.6, 5.48],
  dress_f:  [150, 70, 0.4, 0.018, 1.8, 0.7, 0.0003, 0.22, 0.45, 6.85],
  dress_m:  [120, 48, 0.36, 0.022, 2.0, 0.62, 0.00028, 0.22, 0.45, 8.22],
  dress_r:  [100, 40, 0.32, 0.03, 2.0, 0.58, 0.00035, 0.26, 0.5, 9.59],
  ribbon_l: [55, 18, 0.18, 0.06, 2.2, 0.75, 0.0007, 0.6, 1.3, 10.96],
  ribbon_r: [50, 16, 0.18, 0.06, 2.2, 0.68, 0.0007, 0.6, 1.3, 12.33]
};
// the skirt panels and the coat lean with the leg in front of them: [[leg bone, share of its turn]]
// her size against the game skeleton (1: art legs as long as the game's; she still stands a head over Kage)
const AK_ART_SIZE = 0.84;
// her idle lean in the game, taken out so the art's own upright stance reads as her neutral
const AK_ART_LEAN0 = 0;
const AK_ART_FOLLOW = {
  dress_f: [['leg_f_up', 0.7]], dress_m: [['leg_f_up', 0.3], ['leg_b_up', 0.3]], dress_r: [['leg_b_up', 0.65]],
  coat_low: [['leg_b_up', 0.45]], coat_top: [['leg_b_up', 0.25]]
};

/* ---- 2D affine helpers: [a, b, c, d, e, f] as ctx.transform takes them ---- */
function _akM(a, x, y) { const c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, x, y]; }
function _akMul(A, B) {
  return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
    A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
}
function _akInv(m) {
  const det = m[0] * m[3] - m[1] * m[2], a = m[3] / det, b = -m[1] / det, c = -m[2] / det, d = m[0] / det;
  return [a, b, c, d, -(a * m[4] + c * m[5]), -(b * m[4] + d * m[5])];
}
function _akApply(m, x, y) { return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
// the signed angle from a to b (radians, -PI..PI)
function angDiffRad(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
// two-bone IK from (sx, sy) to (tx, ty), lengths a and b, the joint on the side of the hint (hx, hy): [jx, jy, ex, ey]
function _akIK(sx, sy, tx, ty, a, b, hx, hy) {
  const dx = tx - sx, dy = ty - sy, d = clamp(Math.hypot(dx, dy), Math.abs(a - b) + 0.01, a + b - 0.01);
  const base = Math.atan2(dy, dx), A = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
  const j1 = [sx + Math.cos(base + A) * a, sy + Math.sin(base + A) * a], j2 = [sx + Math.cos(base - A) * a, sy + Math.sin(base - A) * a];
  const j = (j1[0] - hx) ** 2 + (j1[1] - hy) ** 2 <= (j2[0] - hx) ** 2 + (j2[1] - hy) ** 2 ? j1 : j2;
  const ang = Math.atan2(ty - j[1], tx - j[0]);
  return [j[0], j[1], j[0] + Math.cos(ang) * b, j[1] + Math.sin(ang) * b];
}

// the body hook (_shared/body.js calls this before anything else is drawn for her)
function akariArtBody(f, ctx, front, flat, opt) {
  const col = flat ? (opt && opt.color) || front : null;
  return AkariArt.draw(f, ctx, col);
}
