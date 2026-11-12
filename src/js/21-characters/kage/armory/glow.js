/* ---- the armour's baked light (see _themes.js): looping sprite sheets rendered in Godot (godot/armor-glow, packed by
   tools/armor-glow/pack.py into ARMOR_GLOW_SHEETS, 34b-armor-glow-sheets.js) on black, so they play additively.
     back   the Mugen's crescent-moon halo behind his head
     coat   fire (Mugen violet, Kagehira crimson) or spirit wisps (Yūrei) rising off the coat's hem
     over   the Raikō's gold crackle jumping over his coat and scarf
   They play on the fighter's own clock (hit-stop freezes them). Never on the flat passes. Before a sheet has decoded
   (and under Node) nothing is drawn, except the halo, which falls back to a canvas arc. ---- */
const ArmorGlow = {
  img: {}, lit: {},
  // the sheet's data once its image has decoded, else null
  ready(name) {
    const d = typeof ARMOR_GLOW_SHEETS !== 'undefined' && ARMOR_GLOW_SHEETS[name];
    if (!d || typeof Image === 'undefined') return null;
    let im = this.img[name];
    if (!im) { im = this.img[name] = new Image(); im.src = d.img; }
    if (!(im.complete && im.naturalWidth)) return null;
    if (!this.lit[name]) this.lit[name] = this.unblack(im);
    return d;
  },
  // the sheet with its black turned to transparency (alpha = the brightest channel, colour divided by it): added with
  // 'lighter' it lights an opaque scene exactly as the black-backed sheet would, and on a transparent canvas (the
  // Armory's cards) it leaves no black box behind. Falls back to the raw image where pixels cannot be read.
  unblack(im) {
    try {
      const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
      const g = c.getContext('2d'); g.drawImage(im, 0, 0);
      const px = g.getImageData(0, 0, c.width, c.height), a = px.data;
      for (let i = 0; i < a.length; i += 4) {
        const m = Math.max(a[i], a[i + 1], a[i + 2]);
        if (m) { const k = 255 / m; a[i] = a[i] * k; a[i + 1] = a[i + 1] * k; a[i + 2] = a[i + 2] * k; }
        a[i + 3] = m;
      }
      g.putImageData(px, 0, 0);
      return c;
    } catch (e) { return im; }
  },
  preload() { if (typeof ARMOR_GLOW_SHEETS !== 'undefined') for (const k in ARMOR_GLOW_SHEETS) this.ready(k); },
  // frame i of a sheet with its origin at (x, y), `sc` cell px to world px, mirrored for dir -1, turned rot, alpha a
  draw(ctx, name, d, i, x, y, sc, dir, rot, a) {
    if (a <= 0.01) return;
    i = ((i % d.n) + d.n) % d.n;
    const sx = (i % d.cols) * d.cw, sy = Math.floor(i / d.cols) * d.ch;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, a);
    ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(dir * sc, sc);
    ctx.drawImage(this.lit[name] || this.img[name], sx, sy, d.cw, d.ch, -d.ox, -d.oy, d.cw, d.ch);
    ctx.restore();
  }
};

// where each armour's sheets play on the coat: [h along the hem, depth in px of the base above the hem (inside the
// burning band), height in px of the flame, frame offset]; a = alpha, h0 the sheet's flame height in cell px
const KA_HEM_FX = {
  flame_violet: { at: [[0.3, 9, 40, 0], [0.56, 12, 46, 6], [0.82, 10, 38, 11]], a: 0.62, h0: 180 },
  flame_crimson: { at: [[0.4, 8, 34, 2], [0.74, 9, 38, 9]], a: 0.55, h0: 180 },
  wisp_pale: { at: [[0.22, 2, 36, 0], [0.52, 2, 44, 6], [0.82, 2, 34, 11]], a: 0.5, h0: 180 }
};

function kageArmorFx(f, ctx, K, layer) {
  const th = K.th; if (!th || K.A.flat || f.hollow) return;
  const s = K.s, t = K.t, fc = K.fc;
  if (mugenArtOn(f, K)) {   // the Mugen Armor's art (mugen.js)
    if (layer === 'back') mugenHalo(f, ctx, K);
    if (layer === 'over') mugenCharm(f, ctx, K);
    return;
  }
  if (layer === 'back' && th.halo) {
    // the halo: a crescent about two heads across, behind and a little above the head, its opening toward the face
    const hd = f.sk.head, hr = K.hr, cx = hd.x - fc * 0.3 * hr, cy = hd.y - 0.5 * hr, R = 2.1 * hr, pulse = 0.9 + 0.1 * Math.sin(t * 2.2);
    const d = ArmorGlow.ready('halo');
    if (d) ArmorGlow.draw(ctx, 'halo', d, Math.floor(t * d.fps), cx, cy, R / 91, fc, 0, pulse);
    else {
      const g0 = fc > 0 ? 80 : 100, g1 = fc > 0 ? 370 : -190;   // the gap at the lower front
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#d35cff'; ctx.lineWidth = 2.6 * s;
      ctx.shadowColor = '#b04bff'; ctx.shadowBlur = 14 * s; ctx.globalAlpha = 0.85 * pulse;
      ctx.beginPath(); ctx.arc(cx, cy, R, g0 * DEG, g1 * DEG, fc < 0); ctx.stroke();
      ctx.restore();
    }
  }
  if (layer === 'coat' && th.fx && KA_HEM_FX[th.fx] && K.hem) {
    const spec = KA_HEM_FX[th.fx], d = ArmorGlow.ready(th.fx); if (!d) return;
    for (const [h, dep, ht, off] of spec.at) {
      const p = _kaAt(K.hem.N, h, -dep * K.hem.q, K.floor);
      ArmorGlow.draw(ctx, th.fx, d, Math.floor(t * d.fps) + off, p[0], p[1], ht * s / spec.h0, fc, 0, spec.a);
    }
  }
  if (layer === 'over' && th.fx === 'lightning_gold') {
    // two crackles at a time, each jumping to a new spot on the coat's hem or along the scarf a few times a second
    const d = ArmorGlow.ready('lightning_gold'); if (!d) return;
    for (let j = 0; j < 2; j++) {
      const k = t * 3.2 + j * 0.5, slot = Math.floor(k), u = k - slot, r = _kaHash(slot * 7.7 + j * 3.1), r2 = _kaHash(slot * 2.9 + j * 5.3);
      let p = null;
      if (r < 0.62 && K.hem) p = K.hem.H(0.1 + 0.85 * r2);
      else { const c = _ksCloth(f, j ? 'scarfB' : 'scarfA'); if (c) { const i = Math.min(c.n - 1, 2 + Math.floor(r2 * (c.n - 2))); p = [c.px[i], c.py[i]]; } }
      if (!p) continue;
      ArmorGlow.draw(ctx, 'lightning_gold', d, Math.floor(u * d.n * 0.6), p[0], p[1], 0.26 * s * (0.8 + 0.4 * r), fc, r2 * TAU, 0.9);
    }
  }
}
