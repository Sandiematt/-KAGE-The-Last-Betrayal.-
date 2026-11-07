/* KAGE — Effekseer VFX in the game. Raikon's red lightning is authored as real Effekseer effects (vfx/src, built with
   the effekseer-vfx skill, rendered and reviewed in its Godot Lab), then baked by vfx/tools/export_game.py into the
   sprite sheets of 34-vfx-sheets.js: each effect rendered alone on black through a side-on camera with the Lab's HDR
   bloom. Here they play back additively ('lighter': black adds nothing) in world space.

   Effects: raikon_sky_strike (a bolt from the sky, re-struck, cracks and ash), raikon_blade_charge (lightning pulled
   onto the blade tip during a wind-up, one glint), raikon_thunder_wave (Thunder Swing's travelling ground wave),
   raikon_redline_guard (Redline Counter's crescent barrier) and raikon_storm_mantle (his looping storm presence).

   Sheets advance on simulation time like every other effect: hit-stop freezes them, slow motion slows them.
   Purely cosmetic: nothing here touches damage, hitboxes or timing. */
const VFX_PPM = 118;   // game pixels per metre at fighter scale 1 (the Lab's 1.95 m stand-in is a 230 px fighter)

const VfxSheets = {
  img: {},
  // the sheet's metadata once its image has decoded, else null (callers fall back to the canvas-drawn effect)
  ready(name) {
    const d = typeof VFX_SHEETS !== 'undefined' && VFX_SHEETS[name];
    if (!d) return null;
    let im = this.img[name];
    if (!im) { im = this.img[name] = new Image(); im.src = d.img; }
    return im.complete && im.naturalWidth ? d : null;
  },
  preload() { if (typeof VFX_SHEETS !== 'undefined') for (const k in VFX_SHEETS) this.ready(k); },
  // the last baked cell at or before effect time t (seconds)
  cell(d, t) {
    const f = t * 60, fr = d.frames;
    let i = 0;
    while (i + 1 < fr.length && fr[i + 1] <= f) i++;
    return i;
  },
  // draw cell i with the effect's origin at the current (0, 0), mirrored for dir -1, `scale` = fighter scale
  drawCell(ctx, name, d, i, dir, scale, alpha) {
    if (alpha <= 0.003) return;
    const s = VFX_PPM * scale / d.ppm, sx = (i % d.cols) * d.cw, sy = ((i / d.cols) | 0) * d.ch;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, alpha);
    ctx.scale(dir * s, s);
    ctx.drawImage(this.img[name], sx, sy, d.cw, d.ch, -d.ox, -d.oy, d.cw, d.ch);
    ctx.restore();
  },
  // Thunder Swing's wave (WeaponSystem 'thunderwave', drawn translated to the projectile): the baked wave plays once
  // over the projectile's whole life. Returns false while the sheet is not ready, so the canvas wave draws instead.
  drawWave(ctx, p) {
    const d = this.ready('raikon_thunder_wave');
    if (!d) return false;
    const k = p.t / Math.max(0.01, p.t + p.life), rf = SaveManager.data.settings.reduceFlash ? 0.8 : 1;
    this.drawCell(ctx, 'raikon_thunder_wave', d, this.cell(d, k * d.duration), p.dir, (p.owner && p.owner.scale) || 1, rf * Math.min(1, p.life / 0.12));
    return true;
  }
};
VfxSheets.preload();

/* ---- Effects extension: baked-effect instances ---- */
Object.assign(Effects.prototype, {
  sheetFx() { return this._shx || (this._shx = []); },
  /* Play a baked effect at world (x, y). o: {
       dir (1 / -1, mirror), scale (fighter scale), at (a fighter to follow), anchor ('feet' or a skeleton joint such as
       'wt', the blade tip), start (seconds of the effect to skip), delay (seconds before it shows), rate (playback
       speed), loop (repeat until stopped, crossfading two copies half a cycle apart so the seam never shows),
       alpha }
     Returns the instance: set .stop = true to fade it out over .fadeDur seconds (default 0.15). */
  playSheet(name, x, y, o) {
    o = o || {};
    if (!VfxSheets.ready(name)) return null;
    const list = this.sheetFx();
    if (list.length > 24) list.shift();
    const h = { name, x, y, t: (o.start || 0) - (o.delay || 0), rate: o.rate || 1, dir: o.dir || 1, scale: o.scale || 1, at: o.at || null,
      anchor: o.anchor || 'feet', loop: !!o.loop, alpha: o.alpha != null ? o.alpha : 1, stop: false, fade: 1, fadeDur: 0.15 };
    list.push(h);
    return h;
  },
  updateSheets(dt) {
    const list = this.sheetFx();
    for (let i = list.length - 1; i >= 0; i--) {
      const h = list[i], d = VFX_SHEETS[h.name];
      h.t += dt * h.rate;
      if (h.stop) h.fade -= dt / h.fadeDur;
      if (h.fade <= 0 || (!h.loop && h.t > d.duration) || (h.at && !h.at.visible && !h.loop)) list.splice(i, 1);
    }
  },
  drawSheets(ctx) {
    const list = this.sheetFx();
    if (!list.length) return;
    const rf = SaveManager.data.settings.reduceFlash ? 0.8 : 1;
    for (const h of list) {
      if (h.t < 0) continue;
      const d = VfxSheets.ready(h.name);
      if (!d) continue;
      let x = h.x, y = h.y;
      if (h.at) {
        const f = h.at;
        if (h.anchor === 'feet' || !f.sk || !f.sk[h.anchor]) { x = f.x; y = f.y; } else { x = f.sk[h.anchor].x; y = f.sk[h.anchor].y; }
        if (h.at.facing) h.dir = h.at.facing;
      }
      const a = h.alpha * Math.max(0, h.fade) * rf;
      ctx.save(); ctx.translate(x, y);
      if (h.loop) {
        // two copies half a cycle apart, weighted sin^2 / cos^2: their sum is constant and each is silent at its seam
        const P = d.duration, ph = h.t % P, w = Math.sin(Math.PI * ph / P) ** 2;
        VfxSheets.drawCell(ctx, h.name, d, VfxSheets.cell(d, ph), h.dir, h.scale, a * w);
        VfxSheets.drawCell(ctx, h.name, d, VfxSheets.cell(d, (ph + P / 2) % P), h.dir, h.scale, a * (1 - w));
      } else VfxSheets.drawCell(ctx, h.name, d, VfxSheets.cell(d, h.t), h.dir, h.scale, a);
      ctx.restore();
    }
  },
  clearSheets() { this.sheetFx().length = 0; }
});
