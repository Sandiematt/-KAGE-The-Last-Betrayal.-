/* KAGE — the shared anime combat FX: the toon smoke, the cyan ground crack, the footwork dust, the heavy-hit impact
   frame and the arena's rolling mist. Authored as Effekseer effects (vfx/src/VFX_Anime_*.py, built, reviewed and
   independently scored with the effekseer-vfx skill in its Godot Lab), then baked by vfx/tools/export_game.py into the
   sheets anime_smoke / anime_dust / anime_mist (two-background mattes, drawn with normal alpha: solid cel-shaded smoke
   that does not wash out over a bright sky) and anime_crack / anime_impact (additive light).

   Rather than touching every call site, this file wraps the central effect calls every fight already makes, so the
   whole roster gets them at once:
     dust(x, 0, n)       on the floor: a dust kick for footwork, a toon smoke blast for landings, knockdowns and slams
     groundShards()      slams that break the floor: the cyan crack opens under the shards, with a smoke blast
     hit(tier >= 2)      heavy blows and criticals: the anime impact frame at the hit point
     finisher()          the decisive cut / KO: the crack and a big blast under the victim
     dashLines()         a dash: a dust kick thrown back from the feet
     Budo.critFx()       a critical: the crack under the victim
   plus a few mist banks rolling low across the floor of every fight (AnimeFx.ambient, called by World.drawSession).

   Purely cosmetic: nothing here touches damage, hitboxes or timing, and it never draws from Math.random (the
   gameplay-lock tests seed that stream per frame), only from its own little generator. Rate limits keep a burst of
   calls (a landing calls dust three times) to one effect. */
const AnimeFx = {
  seed: 0x9e3779b9,
  rnd() { let s = this.seed = (this.seed + 0x6d2b79f5) | 0; s = Math.imul(s ^ (s >>> 15), s | 1); s ^= s + Math.imul(s ^ (s >>> 7), s | 61); return ((s ^ (s >>> 14)) >>> 0) / 4294967296; },
  // recent spawns per kind: skip one within `gap` seconds and `near` px of the last of its kind
  last: {},
  allow(fx, kind, x, gap, near) {
    const t = fx.time || 0, l = this.last[kind];
    if (l && l.fx === fx && t - l.t < gap && Math.abs(l.x - x) < near) return false;
    this.last[kind] = { fx, t, x };
    return true;
  },
  smoke(fx, x, scale) {
    if (!this.allow(fx, 'smoke', x, 0.16, 90 * scale)) return null;
    return fx.playSheet('anime_smoke', x, 0, { scale, dir: this.rnd() < 0.5 ? -1 : 1 });
  },
  dust(fx, x, dir, scale) {
    if (!this.allow(fx, 'dust' + dir, x, 0.12, 50)) return null;
    return fx.playSheet('anime_dust', x, 0, { scale, dir });
  },
  crack(fx, x, scale) {
    if (!this.allow(fx, 'crack', x, 0.35, 160)) return null;
    // dark rock thrown out of the break (the sheet is light only, so its rock is drawn here as matter): a few big
    // near-black chunks burst out and up, brake, fall and settle round the fissures, then smaller slate chips
    for (let i = 0; i < 14; i++) {
      const big = i < 6, a = -Math.PI / 2 + (this.rnd() - 0.5) * (big ? 2.4 : 2.0), v = (big ? 380 : 260) + this.rnd() * 420;
      fx.part({ x: x + (this.rnd() - 0.5) * 70 * scale, y: -4, vx: Math.cos(a) * v * scale, vy: Math.sin(a) * v, life: 0.8 + this.rnd() * 0.4,
        size: (big ? 7 + this.rnd() * 6 : 2.5 + this.rnd() * 3.5) * scale, color: big ? '#0e1119' : i % 3 ? '#1a1e2a' : '#3a4a66',
        type: 'drop', grav: 1500, drag: big ? 1.4 : 0.6, rot: this.rnd() * 6, sq: 0.55 + this.rnd() * 0.4 });
    }
    return fx.playSheet('anime_crack', x, 0, { scale, back: true });
  },
  impact(fx, x, y, dir, scale) {
    if (!this.allow(fx, 'impact', x, 0.08, 40)) return null;
    return fx.playSheet('anime_impact', x, y, { scale, dir, rot: (this.rnd() - 0.5) * 0.5 });
  },
  // a few low mist banks drifting across the visible floor; called once per drawn frame of a fight
  ambient(s, realT) {
    const fx = s && s.fx;
    if (!fx || !s.cam || !VfxSheets.ready('anime_mist')) return;
    const m = fx._mist || (fx._mist = { t: realT, next: 0 });
    const dt = clamp(realT - m.t, 0, 0.1); m.t = realT; m.next -= dt;
    if (m.next > 0) return;
    m.next = 1.3 + this.rnd() * 0.9;
    const zoom = s.cam.zoom || 1, half = W / 2 / zoom;
    const x = s.cam.x - half - 260 + this.rnd() * (2 * half + 120);
    fx.playSheet('anime_mist', x, 6, { scale: 1.0 + this.rnd() * 0.5, alpha: 0.42 + this.rnd() * 0.2, back: true, rate: 0.8 + this.rnd() * 0.3 });
  }
};

(function wrapEffects() {
  const P = Effects.prototype;
  const dust0 = P.dust, ground0 = P.groundShards, hit0 = P.hit, fin0 = P.finisher, dash0 = P.dashLines;
  // floor dust: n says how hard the floor was struck (turn 3, step-in 4, landing 6-14, slam 14-30)
  P.dust = function (x, y, n) {
    dust0.call(this, x, y, n);
    if (Math.abs(y || 0) > 12) return;
    if (n <= 4) AnimeFx.dust(this, x, AnimeFx.rnd() < 0.5 ? -1 : 1, 0.75);
    else AnimeFx.smoke(this, x, clamp(0.3 + n * 0.028, 0.42, 1.15));
  };
  P.groundShards = function (x, n, k) {
    ground0.call(this, x, n, k);
    AnimeFx.crack(this, x, clamp(0.5 + (k || 1) * 0.25, 0.55, 0.95));
    AnimeFx.smoke(this, x, clamp(0.6 + (k || 1) * 0.3, 0.7, 1.2));
  };
  P.hit = function (x, y, dir, tier, kind, color, el, crit) {
    hit0.call(this, x, y, dir, tier, kind, color, el, crit);
    if (tier >= 2 || crit) AnimeFx.impact(this, x, y, dir, 0.5 + clamp(tier, 0, 3) * 0.08 + (crit ? 0.12 : 0));
  };
  P.finisher = function (x, y, dir) {
    fin0.call(this, x, y, dir);
    AnimeFx.crack(this, x, 0.85);
    AnimeFx.smoke(this, x, 1.1);
  };
  P.dashLines = function (f) {
    dash0.call(this, f);
    if (f && f.grounded !== false) AnimeFx.dust(this, f.x - f.facing * 14 * (f.scale || 1), -f.facing, 0.85 * (f.scale || 1));
  };
  const crit0 = Budo.critFx;
  Budo.critFx = function (world, att, def, crit, ix, iy, dir) {
    crit0.call(this, world, att, def, crit, ix, iy, dir);
    if (def && world && world.fx) AnimeFx.crack(world.fx, def.x, 0.7 * (def.scale || 1));
  };
})();
