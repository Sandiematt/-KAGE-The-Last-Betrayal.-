/* KAGE — Kage's "shadow" design (from the user's reference sheet: image(1).svg and the Path2D rig built on it).
   A flat ink silhouette read by its light, not by lines: every part is one closed black shape with a crimson key light
   on its leading (front, upper) edge and a warm tan back light on its trailing edge. Colour is kept to the crimson
   scarf with its two long tails, the dark crimson belt, and the crimson cloud scrolls along the hem of the long coat.
   One file per part, all in this folder:
     _design.js  the tones, the design switch, the cloth chains, the part drawer (this file)
     body.js     kageShadowBody: the draw order
     head.js     the face in profile and the swept spikes of hair
     torso.js    the fitted jacket, the belt and its knot, the hanging ties
     limbs.js    sleeves and fists, baggy trousers gathered into wrapped shins and boots
     coat.js     the long back tail with its cloud hem, the inner drape, the front flap
     scarf.js    the scarf wound round the neck and its two tails
   The earlier armoured design (../body.js and its part files) is kept whole: KAGE_DESIGN.shadow picks between them.
   Drawing only: nothing here moves a joint or touches gameplay. */

const KS = {
  core: '#050404',                                    // the silhouette (ANIME.face: the face is the same black)
  cloth: '#141011', clothLo: '#0b0809',               // coat panels and shin wraps: one shade up from the core
  rim: '#df4e4a', rimFar: '#8f2426',                  // the crimson key light (dimmer on the far limbs)
  tan: '#bd8171', tanFar: '#7d564d',                  // the warm back light
  red: '#7d181a', redLo: '#401212',                   // the hem's cloud scrolls, pipings
  scarf: '#8a191d', scarfLo: '#571214', scarfHi: '#e2504a',
  belt: '#5c1517', beltLo: '#2c0f10', beltHi: '#8e1e21',
  coat: '#141011', coatLo: '#0b0809', coatTan: '#bd8171'   // the coat's panels and their back light (an armour may pale them)
};
// the tones as drawn without armour: an Armory armour (../armory/) swaps some of KS for one body draw and puts these back
const KS_BASE = Object.assign({}, KS);

/* ---- the design switch ----
   shadow: true  the silhouette design (this folder)       false  the earlier armoured design (../body.js)
   Open the game with ?kage=classic to start on the earlier one, or press F8 in a fight to flip between the two. */
const KAGE_DESIGN = { shadow: true };
(function () {
  try {
    if (typeof location !== 'undefined' && typeof location.search === 'string') {
      const m = /[?&]kage=(\w+)/.exec(location.search);
      if (m) KAGE_DESIGN.shadow = !/^(classic|old|armor|armour|0)$/i.test(m[1]);
    }
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('keydown', (e) => { if (e.code === 'F8') { KAGE_DESIGN.shadow = !KAGE_DESIGN.shadow; e.preventDefault(); } });
    }
  } catch (e) { /* no browser: the default stands */ }
})();

// is this fighter drawn as the shadow design this frame? (Kage, and the Witness on its Kage-flicker frames)
function kageShadowOn(f) { return KAGE_DESIGN.shadow && !!animeSkin(f).kage; }

/* ---- cloth (from kageCloths, ../_skin.js). KsChain is the game's verlet chain (Cloth, 20-fighter.js) with a steadier
   wind for this design: every link leans the same way (so a tail streams out from its root instead of hanging first),
   the gusts are a share of the wind, and a wave travels down the chain, growing toward its tip (the scarf's flutter).
   o: { wind, grav px/s2, gust share of the wind, wave px/s2 at the tip, wf wave speed, wk wave number, damp, stiff, ph,
        dampY  the damping of the up-and-down motion alone (a towed chain whips at its tip unless this is firm),
        soft   how fast the chain's root follows his bobbing (1 at once), ease  how fast (ex, ey) follows the far end }
   The coat's panels read only the far end of their chains, eased (ex, ey: its offset from the root): they are drawn as
   clean curves from the waist to it. ---- */
class KsChain extends Cloth {
  update(ax, ay, facing, vx, dt, t) {
    const n = this.n, px = this.px, py = this.py, ox = this.ox, oy = this.oy, seg = this.seg, o = this.o;
    if (!this.init) {
      // laid out along its rest direction, so nothing whips on the first frames
      const l = Math.hypot(o.wind, o.grav) || 1, rx = -facing * o.wind / l, ry = o.grav / l;
      for (let i = 0; i < n; i++) { px[i] = ox[i] = ax + rx * i * seg; py[i] = oy[i] = ay + ry * i * seg; }
      this.init = true;
    }
    // a jump of the anchor (a teleport, a round restart) carries the whole chain with it
    const jx = ax - px[0], jy = ay - py[0];
    if (jx * jx + jy * jy > 140 * 140) for (let i = 0; i < n; i++) { px[i] += jx; py[i] += jy; ox[i] += jx; oy[i] += jy; }
    else if (o.soft) ay = py[0] + jy * o.soft;   // the root rides his stride softly, so the bob of a run is not cracked down the chain
    const gs = o.gust || 0.1, gust = 1 + Math.sin(t * 2.3 + o.ph) * gs + Math.sin(t * 5.1 + o.ph * 1.7) * gs * 0.4;
    const dt2 = dt * dt, damp = o.damp || 0.9, dampY = o.dampY || damp, wave = o.wave || 0, wf = o.wf || 6, wk = o.wk || 0.9;
    for (let i = 1; i < n; i++) {
      const vx_ = (px[i] - ox[i]) * damp, vy_ = (py[i] - oy[i]) * dampY;
      ox[i] = px[i]; oy[i] = py[i];
      px[i] += vx_ + (-facing * o.wind * gust - vx * 0.6) * dt2;
      py[i] += vy_ + (o.grav + Math.sin(t * wf - i * wk + o.ph) * wave * (i / (n - 1))) * dt2;
    }
    px[0] = ax; py[0] = ay; ox[0] = ax; oy[0] = ay;
    for (let k = 0; k < 3; k++) {
      for (let i = 1; i < n; i++) {
        const dx = px[i] - px[i - 1], dy = py[i] - py[i - 1], d = Math.sqrt(dx * dx + dy * dy) || 0.001, diff = (d - seg) / d;
        px[i] -= dx * diff; py[i] -= dy * diff;
      }
      if (o.stiff) for (let i = 2; i < n; i++) {
        const dx = px[i] - px[i - 2], dy = py[i] - py[i - 2], d = Math.sqrt(dx * dx + dy * dy) || 0.001, min = seg * o.stiff;
        if (d < min) { const q = (min - d) / d; px[i] += dx * q; py[i] += dy * q; }
      }
    }
    // the far end as the panels read it: its offset from the root, eased
    const rx = px[n - 1] - ax, ry = py[n - 1] - ay, e = o.ease || 1;
    if (this.ex == null || jx * jx + jy * jy > 140 * 140) { this.ex = rx; this.ey = ry; } else { this.ex += (rx - this.ex) * e; this.ey += (ry - this.ey) * e; }
  }
}

function kageShadowCloths(f, k) {
  const s = f.scale, add = (part, c, at, dx, dy) => f.cloths.push(Object.assign({ kind: 'kshadow', part, c, at, dx, dy }, k));
  // the coat: the back tail's trailing edge streams out on the wind, its leading edge hangs heavy; the drape and the flap
  add('top', new KsChain(8, 12.2 * s, { ph: 2.2, wind: 1250, grav: 540, gust: 0.1, wave: 70, wf: 3.1, stiff: 1.9, damp: 0.92, dampY: 0.78, soft: 0.3, ease: 0.2 }), 'hip', 10, -6);
  add('lead', new KsChain(7, 12 * s, { ph: 5.9, wind: 560, grav: 1100, gust: 0.08, stiff: 1.9, damp: 0.9, dampY: 0.82, soft: 0.3, ease: 0.2 }), 'hip', -3, -5);
  add('drape', new KsChain(6, 10.6 * s, { ph: 1.3, wind: 270, grav: 1300, gust: 0.08, stiff: 1.8, damp: 0.9, soft: 0.3, ease: 0.25 }), 'hip', 0, -4);
  add('flap', new KsChain(6, 8.6 * s, { ph: 4.7, wind: 110, grav: 1400, gust: 0.08, stiff: 1.8, soft: 0.3, ease: 0.3 }), 'hip', -6, -5);
  // the scarf's two tails: light, long, fluttering toward their tips
  add('scarfA', new KsChain(13, 8.2 * s, { ph: 9, wind: 1500, grav: 430, gust: 0.1, wave: 230, wf: 4.6, wk: 0.7, stiff: 1.94, damp: 0.86, dampY: 0.72, soft: 0.3 }), 'neck', 7, 0);
  // the long hair some armours' styles stream back from the head (../armory/hair.js): heavier than the scarf, slower
  add('hair', new KsChain(11, 7.6 * s, { ph: 3.3, wind: 640, grav: 1150, gust: 0.1, wave: 140, wf: 3.6, wk: 0.8, stiff: 1.9, damp: 0.88, dampY: 0.78, soft: 0.3 }), 'head', 10, -4);
  // the long hair designed in Godot (Yūrei's, Mugen's): longer, blown back further (godot/hair-design Design.gd Chain)
  add('hairLong', new KsChain(13, 7.6 * s, { ph: 3.3, wind: 900, grav: 950, gust: 0.1, wave: 160, wf: 3.6, wk: 0.8, stiff: 1.9, damp: 0.88, dampY: 0.78, soft: 0.3 }), 'head', 10, -4);
  // the Mugen Armor's art locks (../armory/mugen.js): streaming straight back, as on the user's card art
  add('hairArt', new KsChain(13, 7.6 * s, { ph: 4.1, wind: 1500, grav: 520, gust: 0.1, wave: 190, wf: 3.9, wk: 0.8, stiff: 1.9, damp: 0.88, dampY: 0.76, soft: 0.3 }), 'head', 10, -4);
  add('scarfB', new KsChain(9, 7.8 * s, { ph: 12.5, wind: 1500, grav: 150, gust: 0.1, wave: 190, wf: 5.3, wk: 0.85, stiff: 1.94, damp: 0.86, dampY: 0.72, soft: 0.3 }), 'neck', 7, -4);
}

function _ksCloth(f, part) {
  const cl = f.cloths.find(c => c.kind === 'kshadow' && c.part === part && (!c.kageOnly || f.kageFrame));
  return cl && cl.c.init ? cl.c : null;
}

/* ---- the part drawer ---- */
// the draw state shared by the part files: the fighter, its anime state and spine frame, and the two lights as the
// offsets a part is shifted by to leave a strip of light along one side (r* the crimson key, t* the tan back light)
const _ksK = { f: null, A: null, S: null, s: 1, fc: 1, t: 0, hr: 1, rx: 0, ry: 0, tx: 0, ty: 0, floor: 0 };

// a strip of `col` along one side of the part: everything of the part that a copy shifted by (dx, dy) leaves bare
function _ksStrip(ctx, P, dx, dy, col) {
  ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
  ctx.translate(dx, dy); P(); ctx.translate(-dx, -dy);
  ctx.fillStyle = col; ctx.fill('evenodd');
}

// one part: `P` adds its closed path (no beginPath). Filled flat in `base`, `detail` clipped inside it, then the lights.
// o: { red: depth px of the crimson edge (0 none), tan: depth px of the tan edge, redCol, tanCol, detail(g) under the
// lights, after(g) over them }
function _ksPart(ctx, K, P, base, o) {
  const A = K.A;
  ctx.beginPath(); P();
  if (A.flat) { ctx.fillStyle = A.col; ctx.fill(); return; }
  ctx.fillStyle = base; ctx.fill();
  if (!o) return;
  ctx.save(); ctx.clip();
  if (o.detail) o.detail(ctx);
  if (o.tan) _ksStrip(ctx, P, K.tx * o.tan, K.ty * o.tan, o.tanCol || KS.tan);
  if (o.red) _ksStrip(ctx, P, K.rx * o.red, K.ry * o.red, o.redCol || KS.rim);
  if (o.after) o.after(ctx);
  ctx.restore();
}

// turn the two lights into a frame rotated by `rot` and mirrored by the facing (the head's); returns what to restore
function _ksLightIn(K, rot, rx, ry, tx, ty) {
  const sv = [K.rx, K.ry, K.tx, K.ty], c = Math.cos(-rot), sn = Math.sin(-rot), fc = K.fc;
  K.rx = (rx * c - ry * sn) * fc; K.ry = rx * sn + ry * c;
  K.tx = (tx * c - ty * sn) * fc; K.ty = tx * sn + ty * c;
  return sv;
}
function _ksLightOut(K, sv) { K.rx = sv[0]; K.ry = sv[1]; K.tx = sv[2]; K.ty = sv[3]; }

// a point on the quadratic a -> b with control c
function _ksQ(a, c, b, t) { const q = 1 - t; return [q * q * a[0] + 2 * q * t * c[0] + t * t * b[0], q * q * a[1] + 2 * q * t * c[1] + t * t * b[1]]; }

// the angle of a -> e from straight down, positive toward his back (a quarter turn is straight back)
function _ksAng(a, e, fc) { return Math.atan2(-(e[0] - a[0]) * fc, e[1] - a[1]); }

// e turned about a to the angle `ang`, its length kept
function _ksTurn(a, e, fc, ang) { const l = Math.hypot(e[0] - a[0], e[1] - a[1]); return [a[0] - fc * Math.sin(ang) * l, a[1] + Math.cos(ang) * l]; }

// e held between the angles lo and hi about a (a panel never swings out in front of him, or up over his back)
function _ksHold(a, e, fc, lo, hi) { const g = _ksAng(a, e, fc); return g < lo ? _ksTurn(a, e, fc, lo) : g > hi ? _ksTurn(a, e, fc, hi) : e; }

// the (eased) far end of a chain, kept off the floor
function _ksEnd(c, K, lift) { return [c.px[0] + c.ex, Math.min(c.py[0] + c.ey, K.floor - (lift || 2) * K.s)]; }
