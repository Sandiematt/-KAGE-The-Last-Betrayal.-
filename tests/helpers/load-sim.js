// Loads the whole game (every src/js module except the 90-main.js boot) headlessly, the way the build concatenates it,
// so the real fight simulation (FightSession, Fighter, Combat, AIController, Effects, StormDirector...) can be stepped
// in Node. The browser is replaced by an inert stub: `window`, `document`, canvases and their 2D contexts, images and
// audio accept any property read, call or construction and do nothing, so module top-level code and any drawing code
// that happens to run cannot fail and cannot feed back into the simulation.
// `Math` is shadowed by a copy whose random() is a seeded generator the caller controls (rng.reseed / rng.next).
// Nothing is drawn: the caller never calls Renderer or Fighter.draw.
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const JS_DIR = path.join(__dirname, '..', '..', 'src', 'js');
const EXPORTS = ['Logic', 'SaveManager', 'InputManager', 'AudioManager', 'UIManager', 'Game', 'FightSession', 'Combat', 'Fighter',
  'ENEMIES', 'WEAPONS', 'MOVES', 'STEP', 'SK_KEYS', 'DEV', 'BOSS_ABILITIES'];

// A function-backed proxy: every property is another stub, calling or constructing it returns a stub, and it converts
// to 0 / '' when used as a number or string. Writes are kept so code that sets and re-reads a field (canvas.width) sees it.
function stub(name) {
  const store = new Map();
  const target = function () {};
  return new Proxy(target, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return (hint) => (hint === 'string' ? '' : 0);
      if (k === 'then') return undefined;                       // never look like a promise
      if (k === Symbol.iterator) return function* () {};
      if (k === 'length') return 0;
      if (store.has(k)) return store.get(k);
      const v = stub(`${name}.${String(k)}`); store.set(k, v); return v;
    },
    set(t, k, v) { store.set(k, v); return true; },
    has() { return true; },
    apply() { return stub(`${name}()`); },
    construct() { return stub(`new ${name}`); }
  });
}

// mulberry32: tiny, fast, good enough for a reproducible stream
function makeRng(seed) {
  let s = seed >>> 0;
  const rng = {
    next() { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; },
    reseed(n) { s = n >>> 0; }
  };
  return rng;
}

// opts: { seed, exports: [extra top-level names to return], console: a console replacement }
function loadSim(opts) {
  const o = opts || {};
  const files = fs.readdirSync(JS_DIR).filter(f => f.endsWith('.js') && f !== '90-main.js').sort();
  const src = files.map(f => fs.readFileSync(path.join(JS_DIR, f), 'utf8')).join('\n;\n');
  const rng = makeRng(o.seed || 1);
  const SimMath = Object.create(Math);
  Object.defineProperty(SimMath, 'random', { value: () => rng.next() });
  const window = stub('window');
  const document = stub('document');
  const navigator = { maxTouchPoints: 0, getGamepads: () => [], userAgent: 'node' };
  const ctx2d = stub('CanvasRenderingContext2D');
  const globals = {
    Math: SimMath, window, document, navigator,
    CanvasRenderingContext2D: ctx2d, Image: stub('Image'), Path2D: stub('Path2D'), OffscreenCanvas: stub('OffscreenCanvas'),
    AudioContext: undefined, requestAnimationFrame: () => 0, cancelAnimationFrame: () => {}, localStorage: stub('localStorage'),
    performance: { now: () => 0 }, getComputedStyle: stub('getComputedStyle'), matchMedia: stub('matchMedia'), FontFace: stub('FontFace'),
    console: { log() {}, warn() {}, error: console.error, info() {} }
  };
  if (o.console) globals.console = o.console;
  const names = Object.keys(globals);
  // `exports`: further top-level names a test asks for (drawing internals such as ANIME_SKINS or drawHelmet)
  const ex = EXPORTS.concat((o.exports || []).filter(n => !EXPORTS.includes(n)));
  // eslint-disable-next-line no-new-func
  const mods = new Function(...names, `'use strict';\n${src}\nreturn { ${ex.join(', ')} };`)(...names.map(n => globals[n]));
  mods.DEV.unlockAll = false;
  mods.rng = rng;
  return mods;
}

module.exports = { loadSim, makeRng };
