/* KAGE — Akari's Senbonzakura VFX. Her attack effects are Effekseer effects (vfx/src/VFX_Sakura_*.py, built with the
   effekseer-vfx skill and reviewed in its Godot Lab), baked by vfx/tools/export_game.py into the sakura_* sheets of
   34-vfx-sheets.js and played additively by VfxSheets (37-vfx-sheets.js). Glowing sakura pink #FF66B2 to deep pink
   #FF1493 with white-hot cores, over her three phases:
     1  sweeping petal slash arcs (sakura_slash), drifting petals round her (sakura_ambient), petal projectiles
        (sakura_petal_shot / sakura_petal_impact) and petal veils for her steps and blinks (sakura_veil)
     2  spiralling petal streams (sakura_spiral, Petal Storm), ground-skimming blossom ribbons (sakura_ribbon, Poison
        Trap) and vertical blade/petal pillars (sakura_pillar, Falling Petal, trap bursts, the phase-2 entrance)
     3  the full-screen petal storm vortex (sakura_vortex, Thousand Petal Requiem and the phase-3 entrance), rapid
        multi-directional slash beams (sakura_slash_beam) and dense sakura bursts (sakura_burst); Petal Tornado is
        sakura_tornado
   Only the real Akari wears them: an Act II sub-boss or a corrupted echo running a reduced copy of her moves, and her
   Mirror of Petals copies, keep the canvas effects. Every call falls back to the canvas effect it replaced while a
   sheet has not decoded. The headless tests never decode an image (their Image is a stub), so they always run the
   canvas fallbacks: the gameplay lock replays the same random stream it recorded, since a sheet drawn instead of
   canvas particles would use fewer Math.random() calls within a frame. This file is purely cosmetic: it reads fighter
   state and never writes anything combat, AI, hitboxes or the camera use. */

// her VFX palette per phase (her `petal`): [base, highlight, dark], all in the sakura family
const SAKURA_COL = { violet: ['#ff66b2', '#ffd6ea', '#5a0a32'], crimson: ['#ff3d9a', '#ffc0e0', '#4a0626'], demon: ['#ff1493', '#ff9ccd', '#2a0214'] };
const SAKURA_LV = { violet: 1, crimson: 2, demon: 3 };

const AkariSakura = {
  // the real Akari: not a copy of her (Mirror of Petals, False Opening's afterimage), not someone borrowing her moves
  is(f) { return !!(f && f.def && f.def.id === 'akari' && !f.clone); },
  // sheet `name` has really decoded (a browser Image reports a numeric naturalWidth; the tests' stub does not)
  on(name) { return !!VfxSheets.ready(name) && typeof VfxSheets.img[name].naturalWidth === 'number'; },
  // she can show sheet `name` now
  live(f, name) { return this.is(f) && this.on(name); },
  // her phase's VFX colours (the canvas fallbacks use them too), or a borrower's own (akariCol)
  col(f) { return this.is(f) ? SAKURA_COL[f.petal] || SAKURA_COL.violet : akariCol(f); },
  // the colour of a floor mark, as [r, g, b] (undefined: the default)
  mark(f, i) { return this.is(f) ? hexRgb(this.col(f)[i || 0]) : undefined; },
  // an afterimage tint: hers in sakura pink, anyone else's unchanged
  ghost(f, a, other) { return this.is(f) ? `rgba(255,${a > 0.45 ? 72 : 102},${a > 0.45 ? 160 : 178},${a})` : other; },
  glint(f) { return this.is(f) ? '#ffd6ea' : null; },
  // anchors (Lab: 'body' 0.95 m, a strike about 1.05 m, at 118 px/m and the fighter's scale)
  body(f) { return f.y - 112 * f.scale; },
  chest(f) { return f.y - 125 * f.scale; },
  // play sheet `name` for her at world (x, y); null when f is not the real Akari or the sheet is not ready
  play(w, f, name, x, y, o) {
    // her scythe's cuts: the WebGL rig already sweeps an energy trail through the swing, so the landing gets petals and
    // sparks thrown along it instead of the baked short-blade slash sheet
    if (name === 'sakura_slash' && this.is(f) && typeof AkariGL !== 'undefined' && AkariGL.live()) return AkariGL.burst(x, y, f.facing || 1, (o && o.scale) || f.scale);
    if (!this.live(f, name) || !w.fx || !w.fx.playSheet) return null;
    return w.fx.playSheet(name, x, y, Object.assign({ dir: f.facing || 1, scale: f.scale || 1 }, o || {}));
  },
  // a rapid cut's turn (radians): Thousand Cuts and Phantom Dash never repeat a direction back to back
  beamRot(i) { return [0, 0.62, -0.55, 1.15, -1.1, 0.32][i % 6]; },

  // a blossom ribbon skimming the floor from her feet to x; its baked head runs 5 m in 33 frames, so the sheet is
  // sped up or slowed so the head arrives at x as the bake's head does
  ribbon(w, f, x) {
    if (!this.live(f, 'sakura_ribbon')) return null;
    const x0 = f.x + f.facing * 30 * f.scale, dist = Math.abs(x - x0) || 1, dir = Math.sign(x - x0) || f.facing;
    const bake = 5 * VFX_PPM * f.scale, rate = clamp(bake / dist, 0.7, 2.6), flight = 33 / 60;
    return w.fx.playSheet('sakura_ribbon', x0, 0, { dir, scale: f.scale, rate, vx: dir * dist / (flight / rate), until: flight });
  },
  // a Mirror of Petals copy breaking (one hit, or its time up): a small sakura burst instead of grey smoke
  cloneBreak(w, c) {
    if (!(c && c.clone && !c.decoy && c.def && c.def.id === 'akari') || !this.on('sakura_burst')) return false;
    w.fx.playSheet('sakura_burst', c.x, this.body(c), { scale: (c.scale || 1) * 0.4 });
    return true;
  },
  // False Opening's afterimage coming apart: a petal veil in its place
  decoyVanish(w, c) {
    const o = c && c.decoy;
    if (!this.live(o, 'sakura_veil')) return false;
    w.fx.playSheet('sakura_veil', c.x, this.body(c), { dir: c.facing || 1, scale: (c.scale || 1) * 0.8 });
    return true;
  },

  // Her poisoned kunai (WeaponSystem 'kunai' with p.poison), drawn translated to the projectile: the baked crescent
  // petal head, looping its flight frames, pointed along the flight (mirrored, not flipped, when it flies left so the
  // crescent keeps bowing upward). Returns false when the canvas kunai should draw instead.
  drawShot(ctx, p) {
    if (!this.live(p.owner, 'sakura_petal_shot')) return false;
    const d = VfxSheets.ready('sakura_petal_shot');
    const left = p.vx < 0, rot = left ? Math.atan2(-p.vy, -p.vx) : Math.atan2(p.vy, p.vx);
    ctx.rotate(rot);
    VfxSheets.drawCell(ctx, 'sakura_petal_shot', d, VfxSheets.cell(d, 2 / 60 + (p.t % (20 / 60))), left ? -1 : 1, 0.5 * ((p.owner && p.owner.scale) || 1), Math.min(1, p.life / 0.1));
    return true;
  },
  shotImpact(w, p) { return this.play(w, p.owner, 'sakura_petal_impact', p.x, p.y, { scale: 0.55 * (p.owner.scale || 1), dir: Math.sign(p.vx) || 1 }); },

  // Her presence (FightSession.stepAkariPresence, every step while she fights): the drift aura, one layer per phase,
  // and the phase entrances when her petal colour changes. Returns false while the aura sheet is not ready.
  presence(s, f) {
    if (!this.live(f, 'sakura_ambient')) return false;
    const lv = SAKURA_LV[f.petal] || 1;
    if (f._sakuraLv !== lv) {
      const first = f._sakuraLv == null;
      for (const h of f._sakuraAura || []) h.stop = true;
      f._sakuraAura = [];
      for (let i = 0; i < lv; i++) {
        const h = s.fx.playSheet('sakura_ambient', f.x, f.y, { at: f, loop: true, scale: f.scale * (1 + 0.12 * (lv - 1)), rate: 1 + 0.13 * i,
          ox: (i - (lv - 1) / 2) * 26 * f.scale, oy: -(112 + i * 14) * f.scale, start: i * 0.6, alpha: i ? 0.5 : 1 });   // extra layers add petals, not a brighter rim
        if (h) { h.fadeDur = 0.6; f._sakuraAura.push(h); }
      }
      if (!first && lv === 2) {   // The Crimson Petal: a fan of blade-petal pillars erupts round her
        s.fx.playSheet('sakura_pillar', f.x, f.y, { scale: f.scale * 1.25 });
        s.fx.playSheet('sakura_burst', f.x, this.body(f), { scale: f.scale * 0.6 });
      } else if (!first && lv === 3) {   // The Demon of Petals: a burst, and the storm vortex fills the screen a moment
        s.fx.playSheet('sakura_burst', f.x, this.body(f), { scale: f.scale });
        s.fx.playSheet('sakura_vortex', f.x, this.body(f), { scale: 0.85, life: 1.6, loop: true });
      }
      f._sakuraLv = lv;
    }
    return true;
  },
  // the storm vortex over the whole screen while Thousand Petal Requiem runs (it follows the camera)
  vortex(w, f) {
    if (!this.live(f, 'sakura_vortex') || !w.cam) return null;
    const h = w.fx.playSheet('sakura_vortex', w.cam.x, w.cam.y, { at: w.cam, loop: true, scale: 0.95, oy: -240, alpha: 0.9 });
    if (h) h.fadeDur = 0.5;
    return h;
  },

  // ---- her hazards (FightSession.stepHazards): the sheet that draws each one, started on its first step ----
  // Petal Storm: the sheet carries its own 0.75 s floor tell and 1.4 s storm, lined up so the tell ends as the storm
  // starts cutting (a longer delay waits, a shorter one skips the start of the tell)
  storm(s, h) {
    if (h.sk === undefined) h.sk = this.play(s, h.owner, 'sakura_spiral', h.x, 0, { dir: 1, scale: h.r / 105, delay: Math.max(0, h.delay - 0.75), start: Math.max(0, 0.75 - h.delay) }) || null;
    return !!h.sk;
  },
  tornado(s, h) {
    if (h.sk === undefined) h.sk = this.play(s, h.owner, 'sakura_tornado', h.x, 0, { at: h, loop: true, dir: h.dir || 1, scale: Math.max(0.6, h.w / 72) }) || null;
    return !!h.sk;
  },
  // a hazard leaving the arena takes its sheet with it
  end(h) { if (h && h.sk) h.sk.stop = true; }
};
