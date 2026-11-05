/* KAGE — core: constants, math helpers, SaveManager, AudioManager, InputManager */

const W = 1280, H = 720, GROUND = 604, FLOOR_DEPTH = 34;
const DEG = Math.PI / 180, TAU = Math.PI * 2;
const STEP = 1 / 60;

// Palette — mirrors the Wonder design tokens
const C = {
  void: '#0a0908', charcoal: '#14120f', smoke: '#1d1a16', ash: '#3a342b', ink: '#030303',
  bone: '#ece5d3', muted: '#a09785', gold: '#c9a45c', goldDim: '#7d6638',
  ember: '#a3302a', emberBright: '#d24a3c'
};
const FD = '"KageSerif","Cinzel","Cormorant Garamond",Georgia,serif';            // elegant headings, boss names
const FU = '"KageUI","Teko","Barlow Condensed","Arial Narrow",sans-serif';            // menus, labels, captions
const FB = '"KageBrush","Permanent Marker","Segoe Print","Comic Sans MS",cursive';      // brush titles & combat words
const FN = '"KageNum","Rajdhani","Barlow Condensed","Arial Narrow",sans-serif';       // numbers & body text

(function flatGradients() {
  const P = CanvasRenderingContext2D.prototype;
  const step = (g) => {
    const add = g.addColorStop.bind(g); let lp = null, lc = null;
    g.addColorStop = (p, c) => { if (lc !== null && p > lp) add(Math.max(lp, p - 0.0005), lc); add(p, c); lp = p; lc = c; };
    return g;
  };
  const L = P.createLinearGradient, R = P.createRadialGradient;
  P.createLinearGradient = function () { return step(L.apply(this, arguments)); };
  P.createRadialGradient = function () { return step(R.apply(this, arguments)); };
})();
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const chance = p => Math.random() < p;
const pick = arr => arr[(Math.random() * arr.length) | 0];
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
const fmt = n => Math.round(n).toLocaleString('en-US');
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const Ease = {
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outQuad: t => 1 - (1 - t) * (1 - t)
};
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const isTouchDevice = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

/* ------------------------------------------------------------------ */
/* SaveManager — localStorage with defensive error handling             */
/* Storage only: the save schema, defaults and corrupt-save fallback    */
/* live in Logic (15-logic.js), which gets the raw text from here.      */
/* ------------------------------------------------------------------ */
const SaveManager = {
  KEY: 'kage.save.v1',
  LEGACY: ['ashbound.save.v1'], // saves from the previous working title are migrated once
  data: null,
  available: true,
  defaults() { return Logic.defaultSave(); },
  load() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(this.KEY);
      if (!raw) for (const k of this.LEGACY) { const r = window.localStorage.getItem(k); if (r) { raw = r; break; } }
    } catch (e) {
      console.warn('[KAGE] Save could not be read, starting fresh.', e);
      this.available = false;
      raw = null;
    }
    const { save, error } = Logic.loadSave(raw);
    if (error) {
      console.warn('[KAGE] Save could not be read, starting fresh.', error);
      this.available = false;
    }
    this.data = save;
    return save;
  },
  save() {
    try {
      window.localStorage.setItem(this.KEY, JSON.stringify(this.data));
      this.available = true;
    } catch (e) {
      console.warn('[KAGE] Save failed (storage full or blocked).', e);
      this.available = false;
    }
  },
  reset() {
    this.data = Logic.resetSave(this.data);
    this.save();
  }
};

/* ------------------------------------------------------------------ */
/* AudioManager — every sound synthesised with Web Audio               */
/* ------------------------------------------------------------------ */
const AudioManager = {
  ctx: null, master: null, sfx: null, music: null, noise: null, unlocked: false,
  last: {}, musicMode: 'none', musicNodes: [], nextBeat: 0, beat: 0, nextPluck: 0,
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const ctx = this.ctx = new AC();
      this.master = ctx.createGain(); this.master.gain.value = 0.85;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
      comp.connect(this.master); this.master.connect(ctx.destination);
      this.sfx = ctx.createGain(); this.sfx.connect(comp);
      this.music = ctx.createGain(); this.music.connect(comp);
      const len = ctx.sampleRate * 2;
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      this.applySettings();
    } catch (e) { console.warn('[KAGE] Audio unavailable', e); this.ctx = null; }
  },
  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    this.unlocked = true;
  },
  applySettings() {
    if (!this.ctx) return;
    const s = SaveManager.data.settings, t = this.ctx.currentTime;
    this.sfx.gain.setTargetAtTime(s.sound ? 1 : 0, t, 0.02);
    this.music.gain.setTargetAtTime(s.music ? 0.42 : 0, t, 0.2);
  },
  // primitive: oscillator with pitch sweep and AD envelope
  tone(o) {
    const ctx = this.ctx, t = ctx.currentTime + (o.delay || 0);
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f0, t);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t + (o.sweep || o.dur));
    if (o.detune) osc.detune.value = o.detune;
    const v = o.vol == null ? 0.3 : o.vol, a = o.attack || 0.004;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    let node = osc;
    if (o.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; osc.connect(f); node = f; }
    node.connect(g); g.connect(o.dest || this.sfx);
    osc.start(t); osc.stop(t + o.dur + 0.05);
  },
  // primitive: filtered noise burst with frequency sweep
  burst(o) {
    const ctx = this.ctx, t = ctx.currentTime + (o.delay || 0);
    const src = ctx.createBufferSource(); src.buffer = this.noise;
    src.playbackRate.value = o.rate || 1;
    const f = ctx.createBiquadFilter(); f.type = o.filter || 'lowpass'; f.Q.value = o.q || 0.8;
    f.frequency.setValueAtTime(o.f0 || 1200, t);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
    const g = ctx.createGain(), v = o.vol == null ? 0.3 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (o.attack || 0.003));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f); f.connect(g); g.connect(o.dest || this.sfx);
    src.start(t, Math.random() * 1.5); src.stop(t + o.dur + 0.05);
  },
  play(name, opt) {
    if (!this.ctx || !this.unlocked) return;
    const now = this.ctx.currentTime;
    if (this.last[name] && now - this.last[name] < 0.025) return;
    this.last[name] = now;
    const p = (opt && opt.pitch) || 1;
    switch (name) {
      case 'punch':
        this.tone({ type: 'sine', f0: 150 * p, f1: 48, dur: 0.14, vol: 0.55 });
        this.burst({ f0: 2400, f1: 400, dur: 0.07, vol: 0.32 });
        break;
      case 'kick':
        this.tone({ type: 'sine', f0: 120 * p, f1: 40, dur: 0.2, vol: 0.6 });
        this.burst({ f0: 1600, f1: 300, dur: 0.1, vol: 0.3 });
        break;
      case 'heavy':
        this.tone({ type: 'sine', f0: 95 * p, f1: 30, dur: 0.38, vol: 0.85 });
        this.tone({ type: 'triangle', f0: 200 * p, f1: 60, dur: 0.18, vol: 0.3 });
        this.burst({ f0: 3200, f1: 200, dur: 0.22, vol: 0.45 });
        break;
      case 'slash':
        this.burst({ filter: 'bandpass', f0: 5200 * p, f1: 1800, q: 2, dur: 0.12, vol: 0.4 });
        this.tone({ type: 'sine', f0: 140 * p, f1: 55, dur: 0.12, vol: 0.4 });
        this.tone({ type: 'triangle', f0: 2600 * p, f1: 2400, dur: 0.18, vol: 0.05 });
        break;
      case 'swing':
        this.burst({ filter: 'bandpass', f0: 900 * p, f1: 3200 * p, q: 1.6, dur: 0.16, vol: 0.22, attack: 0.03 });
        break;
      case 'heavyswing':
        this.burst({ filter: 'bandpass', f0: 300 * p, f1: 1400 * p, q: 1.2, dur: 0.3, vol: 0.3, attack: 0.08 });
        break;
      case 'parry':
      case 'clang': {
        const base = name === 'parry' ? 1650 : 1180;
        for (const r of [1, 1.51, 2.27, 3.03]) this.tone({ type: 'triangle', f0: base * r * p, dur: name === 'parry' ? 0.9 : 0.5, vol: 0.09, attack: 0.001 });
        this.burst({ filter: 'highpass', f0: 3000, dur: 0.06, vol: 0.35 });
        break;
      }
      case 'block':
        this.tone({ type: 'square', f0: 220 * p, f1: 120, dur: 0.08, vol: 0.12, lp: 1200 });
        this.burst({ f0: 900, f1: 300, dur: 0.08, vol: 0.25 });
        break;
      case 'guardbreak':
        this.tone({ type: 'sawtooth', f0: 300, f1: 60, dur: 0.4, vol: 0.25, lp: 1600 });
        this.burst({ f0: 4000, f1: 300, dur: 0.3, vol: 0.4 });
        break;
      case 'jump':
        this.tone({ type: 'sine', f0: 260, f1: 520, dur: 0.12, vol: 0.12, sweep: 0.1 });
        this.burst({ filter: 'bandpass', f0: 600, f1: 1800, dur: 0.12, vol: 0.08 });
        break;
      case 'djump':
        this.tone({ type: 'sine', f0: 380, f1: 900, dur: 0.16, vol: 0.12, sweep: 0.14 });
        this.burst({ filter: 'bandpass', f0: 800, f1: 3000, dur: 0.2, vol: 0.12 });
        break;
      case 'whoosh':
        this.burst({ filter: 'bandpass', f0: 320, f1: 2300, q: 1.3, dur: 0.34, vol: 0.34, attack: 0.12 });
        this.burst({ filter: 'bandpass', f0: 1400, f1: 4200, q: 2, dur: 0.2, vol: 0.12, attack: 0.06 });
        break;
      case 'dash':
        this.burst({ filter: 'bandpass', f0: 500, f1: 2600, q: 0.9, dur: 0.22, vol: 0.28, attack: 0.02 });
        break;
      case 'land':
        this.tone({ type: 'sine', f0: 90, f1: 40, dur: 0.12, vol: 0.25 });
        this.burst({ f0: 700, f1: 120, dur: 0.1, vol: 0.12 });
        break;
      case 'throw':
        this.burst({ filter: 'bandpass', f0: 1800, f1: 5200, q: 2, dur: 0.14, vol: 0.18 });
        break;
      case 'grab':
        this.tone({ type: 'sine', f0: 180, f1: 90, dur: 0.15, vol: 0.3 });
        this.burst({ f0: 1200, f1: 300, dur: 0.1, vol: 0.18 });
        break;
      case 'charge':
        this.tone({ type: 'sawtooth', f0: 80, f1: 220, dur: 0.6, vol: 0.06, lp: 900, sweep: 0.6, attack: 0.1 });
        break;
      case 'stamp':
        this.tone({ type: 'sine', f0: 70, f1: 28, dur: 0.5, vol: 0.7 });
        this.burst({ f0: 6000, f1: 200, dur: 0.18, vol: 0.4 });
        break;
      case 'impact':
        this.tone({ type: 'sine', f0: 60, f1: 22, dur: 0.7, vol: 0.9 });
        this.burst({ f0: 7000, f1: 120, dur: 0.45, vol: 0.55 });
        this.tone({ type: 'sawtooth', f0: 110, f1: 40, dur: 0.3, vol: 0.12, lp: 900 });
        break;
      case 'orb':
        this.tone({ type: 'sine', f0: 700 * p, f1: 300, dur: 0.3, vol: 0.12 });
        this.tone({ type: 'triangle', f0: 1050 * p, f1: 450, dur: 0.3, vol: 0.06, detune: 12 });
        break;
      case 'teleport':
        this.tone({ type: 'sine', f0: 1400, f1: 200, dur: 0.25, vol: 0.12 });
        this.burst({ filter: 'highpass', f0: 2000, dur: 0.25, vol: 0.12 });
        break;
      case 'smoke':
        this.burst({ f0: 900, f1: 150, dur: 0.6, vol: 0.3, attack: 0.02 });
        break;
      case 'chain':
        for (let i = 0; i < 5; i++) this.tone({ type: 'square', f0: 2200 + i * 130, dur: 0.04, vol: 0.04, delay: i * 0.035, lp: 5000 });
        break;
      case 'slam':
        this.tone({ type: 'sine', f0: 70, f1: 25, dur: 0.6, vol: 0.9 });
        this.burst({ f0: 1500, f1: 80, dur: 0.5, vol: 0.5 });
        break;
      case 'quake':
        this.tone({ type: 'sine', f0: 45, f1: 25, dur: 1.2, vol: 0.9 });
        this.burst({ f0: 400, f1: 60, dur: 1.1, vol: 0.5, attack: 0.05 });
        break;
      case 'boss':
        this.tone({ type: 'sawtooth', f0: 55, f1: 41, dur: 2.4, vol: 0.22, lp: 420, attack: 0.3 });
        this.tone({ type: 'sawtooth', f0: 82, f1: 61, dur: 2.4, vol: 0.12, lp: 420, attack: 0.3, detune: 8 });
        for (let i = 0; i < 3; i++) this.tone({ type: 'sine', f0: 110, f1: 38, dur: 0.5, vol: 0.8, delay: i * 0.42 });
        break;
      case 'round':
        this.tone({ type: 'sine', f0: 100, f1: 40, dur: 0.5, vol: 0.7 });
        this.tone({ type: 'triangle', f0: 660, dur: 0.6, vol: 0.06, delay: 0.05 });
        break;
      case 'ko':
        this.tone({ type: 'sine', f0: 80, f1: 20, dur: 1.4, vol: 1 });
        this.burst({ f0: 5000, f1: 90, dur: 0.9, vol: 0.5 });
        break;
      case 'victory': {
        const notes = [293.66, 349.23, 392, 440, 587.33];
        notes.forEach((f, i) => this.pluck(f, i * 0.12, 0.25, this.sfx));
        this.tone({ type: 'triangle', f0: 587.33, dur: 1.8, vol: 0.08, delay: 0.6, attack: 0.08 });
        break;
      }
      case 'defeat':
        [293.66, 261.63, 220, 174.61].forEach((f, i) => this.pluck(f, i * 0.28, 0.22, this.sfx));
        this.tone({ type: 'sawtooth', f0: 73, f1: 55, dur: 2.2, vol: 0.12, lp: 300, attack: 0.2 });
        break;
      case 'coin':
        this.tone({ type: 'triangle', f0: 1320 * p, dur: 0.12, vol: 0.08 });
        this.tone({ type: 'triangle', f0: 1980 * p, dur: 0.2, vol: 0.06, delay: 0.05 });
        break;
      case 'unlock':
        [587.33, 739.99, 880, 1174.66].forEach((f, i) => this.pluck(f, i * 0.07, 0.18, this.sfx));
        break;
      case 'ui':
        this.tone({ type: 'triangle', f0: 880, f1: 660, dur: 0.07, vol: 0.06 });
        this.burst({ filter: 'bandpass', f0: 3000, dur: 0.03, vol: 0.05 });
        break;
      case 'hover':
        this.tone({ type: 'sine', f0: 1400, dur: 0.04, vol: 0.025 });
        break;
      case 'wipe':
        this.burst({ filter: 'bandpass', f0: 300, f1: 2400, q: 0.7, dur: 0.42, vol: 0.12, attack: 0.15 });
        break;
      case 'poison':
        this.tone({ type: 'sine', f0: 300, f1: 180, dur: 0.2, vol: 0.06 });
        break;
    }
  },
  // koto-like plucked string
  pluck(f, delay, vol, dest) {
    const ctx = this.ctx, t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    o.type = 'triangle'; o2.type = 'sine';
    o.frequency.value = f; o2.frequency.value = f * 2.005;
    fl.type = 'lowpass'; fl.frequency.setValueAtTime(f * 8, t); fl.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.8);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    const g2 = ctx.createGain(); g2.gain.value = 0.3;
    o.connect(fl); o2.connect(g2); g2.connect(fl); fl.connect(g); g.connect(dest || this.music);
    o.start(t); o2.start(t); o.stop(t + 1.7); o2.stop(t + 1.7);
  },
  drum(t, f, vol, dur) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.4, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.music); o.start(t); o.stop(t + dur + 0.05);
  },
  clack(t, vol) {
    const ctx = this.ctx, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.noise; f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 6;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    src.connect(f); f.connect(g); g.connect(this.music); src.start(t, Math.random()); src.stop(t + 0.1);
  },
  setMusic(mode) {
    if (!this.ctx || mode === this.musicMode) return;
    this.musicMode = mode;
    const t = this.ctx.currentTime;
    for (const n of this.musicNodes) { try { n.g.gain.setTargetAtTime(0.0001, t, 0.4); n.o.stop(t + 2); } catch (e) {} }
    this.musicNodes = [];
    if (mode === 'none') return;
    // drone bed
    const roots = { title: [73.42, 110], menu: [73.42, 110], fight: [65.41, 98], boss: [55, 82.41], survival: [61.74, 92.5] };
    for (const f of roots[mode] || roots.menu) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain(), fl = this.ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = rand(-6, 6);
      fl.type = 'lowpass'; fl.frequency.value = mode === 'boss' ? 380 : 260; fl.Q.value = 2;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(mode === 'title' ? 0.05 : 0.04, t + 2.5);
      o.connect(fl); fl.connect(g); g.connect(this.music); o.start(t);
      this.musicNodes.push({ o, g });
    }
    this.nextBeat = t + 0.3; this.beat = 0; this.nextPluck = t + 0.8;
  },
  update() {
    if (!this.ctx || this.musicMode === 'none' || !SaveManager.data.settings.music) return;
    const t = this.ctx.currentTime, mode = this.musicMode;
    const scale = [146.83, 174.61, 196, 220, 261.63, 293.66, 349.23, 392];
    if (mode === 'fight' || mode === 'boss' || mode === 'survival') {
      const bpm = mode === 'boss' ? 112 : 96, spb = 60 / bpm / 2;
      while (this.nextBeat < t + 0.2) {
        const b = this.beat % 16, nb = this.nextBeat;
        if (b === 0 || b === 6 || b === 10) this.drum(nb, mode === 'boss' ? 70 : 82, 0.55, 0.45);
        if (b === 4 || b === 12) this.drum(nb, 140, 0.25, 0.2);
        if (b % 2 === 1 && chance(0.6)) this.clack(nb, 0.06);
        if (mode === 'boss' && (b === 14 || b === 15)) this.drum(nb, 95, 0.4, 0.25);
        if (b % 4 === 0 && chance(0.35)) this.pluck(scale[randi(0, 4)] / 2, nb - t, 0.08);
        this.beat++; this.nextBeat += spb;
      }
    } else if (t > this.nextPluck) {
      const n = randi(1, 3);
      for (let i = 0; i < n; i++) this.pluck(pick(scale), i * 0.16, 0.06);
      this.nextPluck = t + rand(1.4, 3.2);
    }
  }
};

/* ------------------------------------------------------------------ */
/* InputManager — keyboard, virtual touch buttons and gamepad          */
/* ------------------------------------------------------------------ */
const InputManager = {
  map: {
    left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'], up: ['KeyW', 'ArrowUp'],
    jump: ['KeyW', 'Space', 'ArrowUp'], punch: ['KeyJ'], kick: ['KeyK'], dash: ['KeyL', 'ShiftLeft', 'ShiftRight'],
    block: ['KeyS', 'ArrowDown'], weapon: ['KeyU'], special: ['KeyI'], pause: ['Escape', 'KeyP']
  },
  codeToActions: {},
  down: new Set(),        // physical key codes held
  virtual: {},            // action -> bool (touch / gamepad)
  pressedSet: new Set(),  // action edges since last sim tick
  releasedSet: new Set(),
  padPrev: {},
  enabled: true,
  lastDevice: 'keyboard',
  init() {
    for (const [a, codes] of Object.entries(this.map)) for (const c of codes) (this.codeToActions[c] = this.codeToActions[c] || []).push(a);
    window.addEventListener('keydown', e => {
      const acts = this.codeToActions[e.code];
      if (acts && Game.inFight()) e.preventDefault();
      if (e.repeat) return;
      this.lastDevice = 'keyboard';
      this.down.add(e.code);
      if (acts) for (const a of acts) this.pressedSet.add(a);
      UIManager.onKey(e);
    });
    window.addEventListener('keyup', e => {
      this.down.delete(e.code);
      const acts = this.codeToActions[e.code];
      if (acts) for (const a of acts) this.releasedSet.add(a);
    });
    window.addEventListener('blur', () => { this.down.clear(); this.virtual = {}; });
  },
  isDown(a) {
    if (this.virtual[a]) return true;
    const codes = this.map[a];
    for (let i = 0; i < codes.length; i++) if (this.down.has(codes[i])) return true;
    return false;
  },
  pressed(a) { return this.pressedSet.has(a); },
  released(a) { return this.releasedSet.has(a); },
  virtualDown(a) { if (!this.virtual[a]) { this.virtual[a] = true; this.pressedSet.add(a); } },
  virtualUp(a) { if (this.virtual[a]) { this.virtual[a] = false; this.releasedSet.add(a); } },
  endTick() { this.pressedSet.clear(); this.releasedSet.clear(); },
  pollGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads && Array.from(pads).find(p => p && p.connected);
    if (!gp) return;
    const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed);
    const ax = gp.axes[0] || 0;
    const st = {
      left: ax < -0.4 || b(14), right: ax > 0.4 || b(15), up: (gp.axes[1] || 0) < -0.6 || b(12),
      jump: b(0), punch: b(2), kick: b(3), dash: b(1) || b(4), weapon: b(5), block: b(6) || b(13), special: b(7), pause: b(9)
    };
    for (const a in st) {
      if (st[a] && !this.padPrev[a]) { this.virtual[a] = true; this.pressedSet.add(a); this.lastDevice = 'pad'; if (a === 'pause' || a === 'jump') UIManager.onPad(a); }
      else if (!st[a] && this.padPrev[a]) { this.virtual[a] = false; this.releasedSet.add(a); }
    }
    this.padPrev = st;
  },
  // snapshot for the player fighter, read once per simulation tick
  readCtrl(ctrl) {
    ctrl.dir = (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0);
    ctrl.up = this.isDown('up');
    ctrl.jumpP = this.pressed('jump');
    ctrl.punchP = this.pressed('punch');
    ctrl.kickP = this.pressed('kick');
    ctrl.kickHeld = this.isDown('kick');
    ctrl.kickR = this.released('kick');
    ctrl.weaponP = this.pressed('weapon');
    ctrl.blockHeld = this.isDown('block');
    ctrl.blockP = this.pressed('block');
    ctrl.dashP = this.pressed('dash');
    ctrl.specialP = this.pressed('special');
    ctrl.grabP = ctrl.blockHeld && ctrl.punchP;
    return ctrl;
  }
};

function makeCtrl() {
  return { dir: 0, up: false, jumpP: false, punchP: false, kickP: false, kickHeld: false, kickR: false, weaponP: false, blockHeld: false, blockP: false, dashP: false, specialP: false, grabP: false };
}
function clearCtrlEdges(c) { c.jumpP = c.punchP = c.kickP = c.kickR = c.weaponP = c.blockP = c.dashP = c.specialP = c.grabP = false; }
