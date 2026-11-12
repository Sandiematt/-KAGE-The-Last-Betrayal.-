/* KAGE — UIManager: every DOM screen (title, campaign, armory, pre-fight, HUD, results, settings, Echo Trials) */

const ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  retry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
  swords: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>',
  fwd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>'
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// m:ss for Boss Rush times (seconds in)
const brTime = t => { t = Math.max(0, Math.round(t || 0)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
function currencyHTML() { const s = SaveManager.data; return `<div class="currency"><span><i class="coin"></i><b data-coins>${fmt(s.coins)}</b></span><span><i class="gem"></i><b data-gems>${fmt(s.gems)}</b></span></div>`; }
function prepCanvas(cv) {
  // a canvas on a scaled Wonder stage renders at its on-screen size, not its design size
  const ks = cv.closest('.w-stage') ? Math.min(window.innerWidth / 1600, window.innerHeight / 900) : 1;
  const dpr = Math.min(3, (window.devicePixelRatio || 1) * ks), w = Math.max(1, cv.clientWidth), h = Math.max(1, cv.clientHeight);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  return { g, w, h };
}
function drawWeaponIcon(cv, wid, color) {
  const { g, w, h } = prepCanvas(cv);
  const sh = twinShape(WEAPONS[wid], SHAPE[wid] || 'katana', 0), L = Math.min(w * 0.95, (WEAPONS[wid].len || 80) * 0.75);
  g.save(); g.translate(w / 2 - L * 0.42 * Math.cos(-0.42), h / 2 + L * 0.42 * Math.sin(0.42) * 0.6); g.rotate(-0.42);
  if (sh === 'staff' || sh === 'spear' || sh === 'kb_mizuchi') g.translate(L * 0.1, 0);
  const sc = clamp(h / 46, 0.5, 1.4) * 0.8;
  if (color) drawWeaponShape(g, sh, L, 'flat', sc, color); else drawWeaponShape(g, sh, L, 'art', sc, C.ink);
  g.restore();
}
function drawFighterInto(cv, f, opt) {
  const { g, w, h } = prepCanvas(cv);
  opt = opt || {};
  const sc = (opt.fit || 0.9) * h / (f.height() * (opt.tall || 1.25));
  g.save(); g.translate(w / 2 + (opt.dx || 0) * w, h * (opt.ground || 0.97)); g.scale(sc, sc); g.translate(-f.x, 0);
  if (opt.glow) {
    const gr = g.createRadialGradient(f.x, -f.height() * 0.55, 0, f.x, -f.height() * 0.55, f.height() * 0.9);
    gr.addColorStop(0, opt.glow); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(f.x - 400, -f.height() * 1.6, 800, f.height() * 2);
  }
  f.draw(g, { shadow: false, rim: opt.rim === null ? null : (opt.rim || 'rgba(236,229,211,0.6)'), light: { x: 0.5, y: -0.86 }, color: opt.color });
  g.restore();
}
// bust portrait for the HUD medallions: the live fighter, framed on the head, clipped to a circle
function drawPortrait(cv, f, enemy) {
  const { g, w, h } = prepCanvas(cv);
  g.save(); g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, TAU); g.clip();
  const bg = g.createRadialGradient(w / 2, h * 0.38, 2, w / 2, h / 2, w * 0.62);
  bg.addColorStop(0, enemy ? '#6a1d16' : '#4a2a1a'); bg.addColorStop(1, '#0a0707');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const hr = BODY.head * f.scale * f.build.head, sc = (h * 0.3) / hr;
  g.translate(w / 2, h * 0.5); g.scale(sc, sc); g.translate(-f.sk.head.x, -f.sk.head.y + hr * 0.25);
  f.draw(g, { shadow: false, rim: enemy ? 'rgba(232,96,72,0.95)' : 'rgba(240,226,200,0.9)', light: { x: 0.6, y: -0.8 } });
  g.restore();
}
function gearName(kind, id) { return gearTable(kind)[id].name; }
// Front-view key art of the story bosses for the HUD boss card (src/img/boss_*.webp, inlined by the build). The
// Witness's is cut from its character sheet; Raikon's, Akari's and Takashi's were painted to match it.
const BOSS_ART = {
  raikon: '__IMG(boss_raikon.webp)__', akari: '__IMG(boss_akari.webp)__',
  takashi: '__IMG(boss_takashi.webp)__', witness: '__IMG(boss_witness.webp)__'
};
// The act bosses' reveal cards (src/img/reveal_*.webp, 3:2 key art with the name, title, kanji and line painted in):
// revealed in the campaign's boss slot, beside the stage card, once the main boss is picked.
const BOSS_REVEAL = {
  raikon: '__IMG(reveal_raikon.webp)__', akari: '__IMG(reveal_akari.webp)__',
  takashi: '__IMG(reveal_takashi.webp)__', witness: '__IMG(reveal_witness.webp)__'
};
const hasBossReveal = id => typeof BOSS_REVEAL[id] === 'string' && BOSS_REVEAL[id].startsWith('data:');
// The art for a boss definition: its own, or its original's for a Core echo (`echoOf`); null when it has none. An
// image missing from src/img stays an unreplaced __IMG token in the build, which counts as no art.
const hasBossArt = id => typeof BOSS_ART[id] === 'string' && BOSS_ART[id].startsWith('data:');
// The Witness's card per phase: cut from the user's four reference sheets (docs/art-reference/witness-phase-1..4.webp)
const WITNESS_ART = ['__IMG(boss_witness_p1.webp)__', '__IMG(boss_witness_p2.webp)__', '__IMG(boss_witness_p3.webp)__', '__IMG(boss_witness_p4.webp)__'];
function bossArtFor(def) {
  if (!def) return null;
  const id = hasBossArt(def.id) ? def.id : def.echoOf && hasBossArt(def.echoOf) ? def.echoOf : null;
  return id ? { id, src: BOSS_ART[id], echo: id !== def.id } : null;
}
// The animated portrait card's markup (styles: .bb-art in styles.css). The HUD builds it once and fills it per foe
// (UIManager.hud.bossArt); the campaign's stage card shows it filled for a boss stage (`cls` places and sizes it).
function bossArtHTML(art, def, cls) {
  const acc = art ? (art.echo ? '#9b8cff' : (def && def.accent) || '#c8232f') : '#c8232f';
  return `<div class="bb-art ${cls || ''} ${art ? '' : 'gone'} ${art && art.echo ? 'echo' : ''}" ${art ? `data-who="${art.id}" style="--bb-acc:${acc}"` : ''} aria-hidden="true">
    <div class="bba-card"><i class="bba-aura"></i><img class="bba-img" alt="" draggable="false" ${art ? `src="${art.src}"` : ''}><i class="bba-shine"></i>
      <span class="bba-motes"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>
    <i class="bba-hit"></i><i class="bba-frame"></i>
  </div>`;
}

/* ---- Wonder "Vole" menu parts (styles: wonder.css). Icons are the design's own glyphs. ---- */
const svgF = (vb, d) => `<svg viewBox="${vb}" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
const svgS = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const W_IC = {
  coin: svgF('0 0 256 256', 'M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57ZM56,146.87C36.41,141.4,24,132.39,24,124V109.93c8.16,5.78,19.09,10.44,32,13.57Zm80-23.37c12.910-3.13,23.84-7.79,32-13.57V124c0,8.39-12.41,17.4-32,22.87Zm-16,71.37C100.41,189.4,88,180.39,88,172v-4.17c2.63.1,5.29.17,8,.17,3.88,0,7.67-.13,11.39-.35A121.92,121.92,0,0,0,120,171.41Zm0-44.62A163,163,0,0,1,96,152a163,163,0,0,1-24-1.750V126.46A183.74,183.74,0,0,0,96,128a183.74,183.74,0,0,0,24-1.54Zm64,48a165.45,165.45,0,0,1-48,0V174.4a179.48,179.48,0,0,0,24,1.6,183.74,183.74,0,0,0,24-1.54ZM232,172c0,8.39-12.41,17.4-32,22.87V171.5c12.91-3.13,23.84-7.79,32-13.57Z'),
  jade: svgF('0 0 256 256', 'M240,128a15.85,15.85,0,0,1-4.67,11.28l-96.05,96.06a16,16,0,0,1-22.56,0h0l-96-96.06a16,16,0,0,1,0-22.56l96.05-96.06a16,16,0,0,1,22.56,0l96.05,96.06A15.85,15.85,0,0,1,240,128Z'),
  plus: svgS('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  lotus: svgS('<path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"/><circle cx="12" cy="8" r="2"/><path d="M12 10v12"/><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"/><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"/>'),
  play: svgS('<polygon points="6 3 20 12 6 21 6 3"/>'),
  bars: svgS('<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>'),
  trash: svgS('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>'),
  pagoda: svgF('0 0 512 512', 'M255.967 23.386c19.704 15.157 49.792 21.65 82.52 27.105 21.419 3.57 43.864 6.501 65.163 9.832-7.28 1.686-14.641 3.4-21.609 4.97-21.25 4.789-41 8.38-45.967 8.321H175.8l-.168.006c-4.61.172-24.44-3.34-45.662-8.181-7.035-1.605-14.48-3.364-21.842-5.090 21.346-3.342 43.848-6.279 65.32-9.858 32.727-5.454 62.815-11.948 82.52-27.105zm55 67.228v16h-110v-16zm3.394 34a24.977 24.977 0 0 0 4.563 4.28c3.799 2.763 8.317 4.922 13.701 7.076 10.768 4.307 24.987 8.332 41.158 12.375 18.612 4.653 39.434 9.269 60.069 13.865l-50.182 8.404H128.71l-50.54-8.424c20.606-4.590 41.396-9.200 59.980-13.845 16.172-4.043 30.390-8.068 41.159-12.375 5.384-2.154 9.902-4.313 13.700-7.076a24.977 24.977 0 0 0 4.563-4.280zm28.606 62v30h-46v-30zm-64 0v30h-46v-30zm-64 0v30h-46v-30zm131.123 48c1.246 1.65 2.68 3.113 4.156 4.422 3.592 3.184 8.04 6.026 13.383 8.965 10.686 5.877 24.947 11.954 41.178 18.041 20.082 7.531 43.024 14.894 65.33 21.42l-54.914 9.152H96.263l-54.533-9.133c22.327-6.530 45.294-13.900 65.397-21.439 16.230-6.087 30.492-12.164 41.178-18.041 5.343-2.939 9.790-5.781 13.382-8.965 1.477-1.309 2.910-2.772 4.157-4.422zm28.877 80v30h-238v-30zm3.123 48c1.246 1.65 2.68 3.113 4.156 4.422 3.592 3.184 8.04 6.026 13.383 8.965 10.686 5.877 24.947 11.954 41.178 18.041 20.102 7.539 43.07 14.909 65.396 21.44l-54.533 9.132H64.710l-54.913-9.152c22.305-6.526 45.247-13.889 65.330-21.420 16.230-6.087 30.492-12.164 41.178-18.041 5.343-2.939 9.790-5.781 13.382-8.965 1.477-1.309 2.910-2.772 4.157-4.422zm60.877 80v46h-142v-46zm-160 0v46h-46v-46zm-64 0v46h-142v-46z'),
  swords: svgF('0 0 512 512', 'M19.75 14.438c59.538 112.29 142.51 202.35 232.28 292.718l3.626 3.75.063-.062c21.827 21.93 44.04 43.923 66.405 66.25-18.856 14.813-38.974 28.2-59.938 40.312l28.532 28.53 68.717-68.717c42.337 27.636 76.286 63.646 104.094 105.81l28.064-28.06c-42.47-27.493-79.74-60.206-106.03-103.876l68.936-68.938-28.53-28.53c-11.115 21.853-24.413 42.015-39.47 60.593-43.852-43.8-86.462-85.842-130.125-125.47-.224-.203-.432-.422-.656-.625C183.624 122.75 108.515 63.91 19.75 14.437zm471.875 0c-83.038 46.28-154.122 100.78-221.97 161.156l22.814 21.562 56.81-56.812 13.22 13.187-56.438 56.44 24.594 23.186c61.802-66.92 117.6-136.92 160.97-218.72zm-329.53 125.906l200.56 200.53c-4.36 4.443-8.84 8.793-13.405 13.032L148.875 153.53l13.22-13.186zm-76.69 113.28l-28.5 28.532 68.907 68.906c-26.29 43.673-63.53 76.414-106 103.907l28.063 28.06c27.807-42.164 61.758-78.174 104.094-105.81l68.718 68.717 28.53-28.53c-20.962-12.113-41.08-25.5-59.937-40.313 17.865-17.83 35.61-35.433 53.157-52.97l-24.843-25.655-55.47 55.467c-4.565-4.238-9.014-8.62-13.374-13.062l55.844-55.844-24.53-25.374c-18.28 17.856-36.602 36.06-55.158 54.594-15.068-18.587-28.38-38.758-39.5-60.625z'),
  armor: svgF('0 0 512 512', 'M156.7 25.83L89 39.38c-.1 58.57-1.74 119.32-43.49 167.22C104.4 246.5 189 260.7 247 248.8v-99L108.3 88.22l7.4-16.44L256 134.2l140.3-62.42 7.4 16.44L265 149.8v99c58 11.9 142.6-2.3 201.5-42.2-41.8-47.9-43.4-108.65-43.5-167.22l-67.7-13.55c-12.9 13.88-20.6 28.15-32.9 40.53C308.9 79.78 289.5 89 256 89c-33.5 0-52.9-9.22-66.4-22.64-12.3-12.38-20-26.65-32.9-40.53zM53.88 232.9C75.96 281 96.07 336.6 102.7 392.8l65 22.8c4.2-52.7 28.2-104 63.7-146.1-55.1 6.3-122.7-5.8-177.52-36.6zm404.22 0c-54.8 30.8-122.4 42.9-177.5 36.6 35.5 42.1 59.5 93.4 63.7 146.1l65.2-22.9c6.6-56.8 26.6-111.8 48.6-159.8zM256 269c-40.5 43.1-67.7 97.9-70.7 152.7l61.7 21.6V336h18v107.3l61.7-21.6c-3.1-54.8-30.2-109.6-70.7-152.7zm151.7 143.4L297 451.1v18.8l110.2-44.1c.1-4.5.3-8.9.5-13.4zm-303.3.1c.3 4.5.4 8.9.5 13.4l110.1 44v-18.7l-110.6-38.7zM279 457.4l-23 8.1-23-8v19.6l23 9.2 23-9.2v-19.7z'),
  swirl: svgF('0 0 512 512', 'M19.188 17.5v152.063C66.86 258.63 151.98 320.656 248.28 341.092c7.287 2.303 15.034 3.563 23.064 3.563 6.747 0 13.288-.884 19.53-2.53-47.547 33.525-105.556 53.155-168.187 53.155-36.77 0-71.258-7.8-103.5-20.342v35.625c39.863 9.25 78.667 13.034 114.188 10.812 22.572-1.413 43.213-4.7 63.063-10.53-45.634 33.337-107.435 50.03-177.25 49.686v29.44c6.82.457 13.417.874 20.343.874 132.277 0 245.515-77.08 300.283-188.28.174-.357.357-.708.53-1.064.236-.48.463-.953.688-1.438-.046.417-.076.835-.124 1.25-7.255 62.57-34.964 122.59-82.937 170.563-7.697 7.696-15.647 14.944-23.940 21.594h104.595c28.33-57.514 37.687-120.485 29.125-180.72-3.284-23.093-8.64-45.25-16.938-67.188 53.172 71.838 78.54 160.38 71.47 247.907h73.374C492.68 363.235 416.173 252.043 305.406 199c-.273-.13-.538-.276-.812-.406-1.12-.54-2.227-1.045-3.375-1.53-.6-.278-1.183-.573-1.783-.845.102.086.21.16.313.25-4.324-1.73-8.834-3.08-13.5-4 61.317-7.77 125.604 3.935 183.25 37.218 8.896 5.135 17.562 10.86 25.656 16.78v-94.655c-22.682-5.175-45.22-7.668-68.125-7.97-66.770-.874-133.078 18.29-189.186 54.876-9.19 4.476-17.36 10.758-24.063 18.343 24.015-56.973 66.21-107.004 123.690-140.188 49.576-28.623 104.276-41.016 157.686-39V17.5h-118.78c-41.383 17.778-79.457 43.683-111.282 75.656 16.34-27.53 36.19-52.736 58.594-75.656h-42.032c-60.804 67.31-91.872 156.46-87 245.656-.093 1.544-.156 3.09-.156 4.656 0 14.815 4.25 28.65 11.563 40.407-47.44-37.913-83.766-90.83-100.625-153.75-12.45-46.46-12.248-92.975-2.657-136.970H19.188zm252.156 192.188c32.223 0 58.156 25.902 58.156 58.125 0 32.222-25.933 58.156-58.156 58.156-11.938 0-23.007-3.57-32.22-9.69 6.202 3.168 13.23 4.97 20.72 4.97 25.67 0 46.438-20.802 46.437-46.47.003-23.096-16.51-42.202-38.592-45.81 10.030 6.777 17 18.396 17 31.405 0 20.813-17.123 37.313-37.938 37.313-13.864 0-25.890-7.378-32.438-18.532-.72-3.670-1.125-7.457-1.125-11.344 0-32.223 25.934-58.125 58.157-58.125z'),
  oni: svgF('0 0 512 512', 'M86.55 31.4C58.98 60.64 45.4 99.1 47 136c1.88 43.1 23.9 83.8 69 106.3l5 2.5v5.6c0 45 23.1 100.1 52.5 145.2 14.6 22.5 30.8 42.6 46 57.8 13.9 13.8 27.1 23.2 36.5 27.2 9.4-4 22.5-13.4 36.4-27.3 15.2-15.2 31.4-35.3 46.1-57.8 29.3-45.1 52.5-100.1 52.5-145.1v-5.6l5-2.5c45.1-22.5 67.1-63.2 69-106.3 1.6-36.9-12-75.36-39.5-104.6.9 28.55 2.9 50.9-.6 70.6-4.5 24.4-19.5 43.8-52.9 60.5l-4.9 2.4-4.5-3.3c-2.1-1.6-4.2-3-6.3-4.5-3.3 7-7.9 13.6-13.9 19.7-11.2 11.1-27.4 10.9-39.7 6-12.3-5-23.7-14.4-23.7-28.4v-3.7l2.6-2.7c6-6 10.7-11.2 14.6-16.2-26.3-5.7-54-5.7-80.4 0 3.9 5 8.6 10.2 14.6 16.2l2.6 2.7v3.7c0 14-11.4 23.4-23.7 28.4-12.3 4.9-28.5 5.1-39.7-6-6-6.1-10.6-12.7-13.9-19.7-2.1 1.4-4.2 2.9-6.3 4.5l-4.5 3.3-4.9-2.4c-33.4-16.7-48.42-36.1-52.85-60.5-3.58-19.7-1.54-42.05-.6-70.6zm88.15 52.71C171 94.26 168 104.9 167 115.3c-1.9 18.2 1.5 34.9 15.4 48.7 4.8 4.9 12.6 5.1 20.3 2 5.6-2.2 9.6-6.3 11.3-9.2-14.1-14.7-22.4-27.1-28.3-40.9-4-9.3-7.3-19.9-11-31.79zm162.6 0c-3.7 11.86-7 22.49-11 31.79-5.9 13.8-14.2 26.2-28.3 40.9 1.7 2.9 5.7 7 11.3 9.2 7.7 3.1 15.5 2.9 20.3-2 13.9-13.8 17.3-30.5 15.4-48.7-1-10.4-4-21.04-7.7-31.19zM157.2 192.6l10.9 21.8c11.1 22.2 31.3 45.3 53.3 61.7l-21.8-54.4 16.8-6.6 30.7 76.8 1.9.9v.9h14v-.9l1.9-.9 30.7-76.8 16.8 6.6-21.8 54.4c22-16.4 42.2-39.5 53.3-61.7l10.9-21.8 22.2 88.7v1.1c0 6.2-2.6 12.1-6.3 16.4-3.8 4.4-8.6 7.5-13.9 10-10.5 5-23.3 7.5-36.1 8.6-2.1.2-4.1.3-6.1.4l-17 33.9c9.7-3.6 21.1-8.1 35.1-13.7l12.3-4.9v13.3c0 20.5-13.6 41.3-30.6 58.4-17.1 17-37.9 30.6-58.4 30.6s-41.3-13.6-58.4-30.6c-17-17.1-30.6-37.9-30.6-58.4v-13.3l12.3 4.9c14 5.6 25.4 10.1 35.1 13.7l-17-33.9c-2-.1-4-.2-6.1-.4-12.8-1.1-25.6-3.6-36.1-8.6-5.3-2.5-10.1-5.6-13.9-10-3.7-4.3-6.3-10.2-6.3-16.4v-1.1zm6.3 49l-10.4 41.5c.1 1.3.5 2.5 1.8 3.9 1.5 1.8 4.2 3.8 7.9 5.5 7.5 3.5 18.7 6 29.9 6.9 10.8.9 21.5.5 29.3-.9-22.5-14.2-43.4-34.6-58.5-56.9zm185 0c-15.1 22.3-36 42.7-58.5 56.9 7.8 1.4 18.5 1.8 29.3.9 11.2-.9 22.4-3.4 29.9-6.9 3.7-1.7 6.4-3.7 7.9-5.5 1.3-1.4 1.7-2.6 1.8-3.9zm-106.4 70.1l-22 11 35.9 71.9 35.9-71.9-22-11zm-53.3 49.4c4.3 10 12 21.3 21.6 30.9 11.3 11.3 25 20.1 36 23.6l-20.6-41.1c-10.6-3.1-22.5-7.6-37-13.4zm134.4 0c-14.5 5.8-26.4 10.3-37 13.4l-20.6 41.1c11-3.5 24.7-12.3 36-23.6 9.6-9.6 17.3-20.9 21.6-30.9z'),
  shuriken: svgF('0 0 512 512', 'M234.875 18.78c-26.087 2.367-51.557 8.56-74.875 18.782 15.37 32.763 14.222 66.706-6.72 82.407-20.835 15.617-54.055 7.965-81.124-15.69-16.246 19.452-29.336 41.36-38.875 65.626 33.83 12.333 56.635 37.665 52.94 63.5-3.698 25.835-32.697 43.740-68.626 46.094 2.338 25.796 8.910 50.778 18.937 73.875 17.810-8.182 35.793-11.090 51.095-8.938 13.032 1.870 23.927 7.015 31.156 16.657 15.817 21.097 7.603 54.713-16.780 81.970 19.516 16.350 42.216 29.444 66.594 39.030 12.330-33.828 37.655-56.634 63.500-52.938 25.844 3.697 43.740 32.696 46.094 68.625 26.087-2.365 51.557-8.555 74.875-18.780-15.766-32.997-14.260-67.588 6.843-83.406 9.640-7.230 22.568-9.022 35.594-7.125 15.112 2.160 31.190 10.250 45.563 22.780 16.088-19.345 29.400-41.510 38.875-65.594-33.830-12.332-56.635-37.653-52.938-63.500 3.697-25.846 32.665-43.772 68.594-46.125-2.360-25.944-8.774-50.663-18.906-73.874-32.612 15.117-66.660 13.145-82.282-7.687-15.696-20.944-7.252-53.860 16.688-81.000-19.520-16.352-42.248-29.447-66.625-39.032-12.332 33.828-37.657 56.660-63.500 52.968-25.846-3.693-43.744-32.696-46.095-68.625zm21.656 95.126c79.626 0 144.376 64.752 144.376 144.375 0 79.626-64.750 144.376-144.375 144.376-79.624 0-144.374-64.750-144.374-144.375 0-79.624 64.750-144.374 144.375-144.374zm0 18.688c-69.524 0-125.686 56.162-125.686 125.687 0 69.526 56.162 125.690 125.687 125.690 69.526 0 125.690-56.164 125.690-125.690 0-69.522-56.164-125.686-125.690-125.686zm.033 15.125c61.094 0 110.625 49.530 110.625 110.624 0 61.095-49.530 110.625-110.625 110.625s-110.625-49.530-110.625-110.626c0-61.095 49.530-110.625 110.625-110.625z'),
  skull: svgF('0 0 512 512', 'M425.344 22.22c-9.027.085-18.7 5.826-24.344 19.405-11.143 26.803-31.93 59.156-58.563 93.47 10.57 8.694 19.85 18.92 27.5 30.31 35.1-26.57 68.882-46.81 98.125-56.75 44.6-15.16 12.02-69.72-35.343-35.343 26.91-27.842 11.107-51.27-7.376-51.093zm-341.22.03c-18.5.378-37.604 23.962-16.343 49.875C31.523 38.635-.802 85.48 37.095 102.813c28.085 12.844 62.54 35.66 99.062 64.343 8.125-12.5 18.207-23.61 29.78-32.937-26.782-35.743-48.44-69.835-61.78-98.47-4.515-9.69-12.22-13.66-20.03-13.5zm169.5 99.688c-67.104 0-121.31 54.21-121.31 121.312 0 44.676 24.04 83.613 59.905 104.656v56.406h18.718v-47.468c5.203 1.95 10.576 3.552 16.093 4.78v42.688h18.69v-40.03c2.614.167 5.247.25 7.905.25 2.637 0 5.25-.086 7.844-.25v40.03h18.686v-42.687c5.52-1.226 10.89-2.834 16.094-4.78v47.467h18.688V347.97c35.92-21.03 60-60.003 60-104.72 0-67.105-54.208-121.313-121.313-121.313zm-66.874 88.218c19.88 0 36 16.12 36 36s-16.12 36-36 36-36-16.12-36-36 16.12-36 36-36zm133.563 0c19.878 0 36 16.12 36 36s-16.122 36-36 36c-19.88 0-36-16.12-36-36s16.12-36 36-36zm-66.72 52.344l29.938 48.188h-59.874l29.938-48.188zm-107.28 70.563c-40.263 32.472-78.546 58.41-109.22 72.437-37.896 17.334-5.57 64.146 30.688 30.656-30.237 36.854 21.167 69.05 36.376 36.406 15.072-32.352 40.727-71.7 72.438-112.5-11.352-7.506-21.564-16.603-30.28-27zm213.156 1.718c-8.155 9.415-17.542 17.72-27.908 24.69 31.846 39.39 56.82 76.862 69.438 107.217 17.203 41.383 71.774 9.722 31.720-31.718 47.363 34.376 79.940-20.185 35.342-35.345-32.146-10.926-69.758-34.300-108.593-64.844z'),
  hammer: svgF('0 0 512 512', 'M145.75 19.78L107.906 116l43.03 31.938 48.814-96.97-54-31.187zm77.094 26.907L152.47 186.5l86.468 49.938 88.53-129.344-104.624-60.406zm112.187 82.376L262.376 235.28c17.46 28.874 29.09 63.707 35.375 103.126 56.317-31.27 107.836-85.753 135.28-152.75l-98-56.594zm114.345 66.03c-30.433 72.7-86.892 130.64-148.938 163.063 2.02 18.153 3.012 37.162 3 56.906 71.107-23.5 159.603-92.374 187.907-195.75l-41.970-24.218zm-289.094 17.5c-39.7 79.313-78.154 159.572-137.905 237.157v44.78H66.72c41.425-87.972 93.64-170.09 145.53-251.936l-51.970-30z')
};
// the Wonder file's weapon renders (src/img/ui_w_*.webp); other weapons draw their canvas icon
const WEAPON_ART = {
  kagetsu: '__IMG(ui_w_kagetsu.webp)__', tsubame: '__IMG(ui_w_tsubame.webp)__', shizuka: '__IMG(ui_w_shizuka.webp)__',
  onikiri: '__IMG(ui_w_onikiri.webp)__', mizuchi: '__IMG(ui_w_mizuchi.webp)__', yamigama: '__IMG(ui_w_yamigama.webp)__',
  iwakudaki: '__IMG(ui_w_iwakudaki.webp)__'
};
const weaponArt = id => typeof WEAPON_ART[id] === 'string' && WEAPON_ART[id].startsWith('data:') ? WEAPON_ART[id] : null;
const WEAPON_KANJI = { kagetsu: '影月', tsubame: '燕', shizuka: '静', onikiri: '鬼斬', mizuchi: '蛟', yamigama: '闇鎌', iwakudaki: '岩砕き', shinsen: '神閃' };
// each act's main boss, for the campaign's Act Boss card
const ACT_BOSS = {
  act1: { id: 'raikon', kanji: '雷光の昇者' }, act2: { id: 'akari', kanji: '記憶の刃' },
  act3: { id: 'takashi', kanji: '師の流れ' }, core: { id: 'witness', kanji: '残響の設計者' }
};
// the art slot for a weapon card or tile: the render when the file has one, else a canvas the screen paints
const wArt = (id, owned) => weaponArt(id) ? `<i class="art" style="background-image:url(${weaponArt(id)})"></i>` : `<canvas class="art" data-w="${id}" data-owned="${owned ? 1 : 0}"></canvas>`;
function wPills(extra) {
  const s = SaveManager.data;
  return `<div class="w-cur">
    <div class="w-pill">${W_IC.coin}<b data-coins>${fmt(s.coins)}</b><button data-a="earn" aria-label="Earn coins">${W_IC.plus}</button></div>
    <div class="w-pill jade">${W_IC.jade}<b data-gems>${fmt(s.gems)}</b><button data-a="earn" aria-label="Earn jade">${W_IC.plus}</button></div>${extra || ''}</div>`;
}
const wBack = () => `<button class="w-back" data-a="back" aria-label="Back">${ICON.back}</button>`;
const wKeys = keys => `<div class="w-keys">${keys.map(([k, l]) => `<div class="w-key"><kbd>${k}</kbd><span>${l}</span></div>`).join('')}</div>`;
const wLeaves = (id, pts) => `<svg class="w-leaves w-leaf" viewBox="0 0 1600 900" aria-hidden="true"><defs><path id="${id}" d="M0,-10 L2,-4 L7,-7 L5,-1 L10,0 L5,2 L7,7 L1,4 L0.6,10 L-0.6,10 L-1,4 L-7,7 L-5,2 L-10,0 L-5,-1 L-7,-7 L-2,-4 Z"/></defs><g opacity=".9">${pts.map(([x, y, s, r]) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(${r})"><use href="#${id}"/></g>`).join('')}</g></svg>`;
/* Drifting sakura petals: n petals travelling from (x0, y0) to (x1, y1) in a w x h box, each with its own speed, size,
   sway and spin. The outer <i> travels, the inner <b> sways and tumbles (styles: .w-petals in wonder.css).
   Deterministic per index so a re-render doesn't reshuffle them. */
const wPetals = (cls, n, w, h, dir) => {
  const rnd = k => { const s = Math.sin(k * 127.1 + n * 31.7) * 43758.5453; return s - Math.floor(s); };
  let html = '';
  for (let i = 0; i < n; i++) {
    const a = rnd(i + 1), b = rnd(i + 7.3), c = rnd(i + 13.9), d = rnd(i + 21.1);
    // dir 'fall': from above the box to below it, drifting right; 'wind': from the right edge to the left
    const x0 = dir === 'wind' ? w + 30 : a * w * 1.1 - w * 0.1, y0 = dir === 'wind' ? b * h * 0.9 - 10 : -30;
    const x1 = dir === 'wind' ? -40 : x0 + 120 + b * 220, y1 = dir === 'wind' ? y0 + 30 + c * 70 : h + 40;
    const dur = (dir === 'wind' ? 6 : 11) + c * (dir === 'wind' ? 5 : 9);
    html += `<i style="--x0:${x0.toFixed(0)}px;--y0:${y0.toFixed(0)}px;--x1:${x1.toFixed(0)}px;--y1:${y1.toFixed(0)}px;--t:${dur.toFixed(1)}s;--dl:${(-d * dur).toFixed(1)}s;--s:${(0.6 + a * 0.8).toFixed(2)};--sw:${(1.6 + b * 2.2).toFixed(1)}s;--o:${(0.55 + c * 0.45).toFixed(2)}"><b></b></i>`;
  }
  return `<div class="w-petals ${cls}" aria-hidden="true">${html}</div>`;
};
// A drifting cloud band: [top, width, seconds, delay, opacity, tone ('dark' | 'lit')]
const wClouds = (cls, list) => list.map(([y, w, t, dl, o, tone]) => `<i class="w-cloud ${cls} ${tone}" aria-hidden="true" style="--y:${y}px;--w:${w}px;--t:${t}s;--dl:${dl}s;--o:${o}">
  <svg viewBox="0 0 300 60" preserveAspectRatio="none"><path d="M0 44 Q22 30 54 34 Q70 14 104 20 Q126 4 160 14 Q190 2 214 18 Q244 12 260 28 Q290 30 300 44 Q260 52 210 50 Q170 58 120 52 Q70 58 40 52 Q10 52 0 44Z"/></svg></i>`).join('');

const MENU_IC = {
  rush: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18l3-9 5 5 5-5 3 9z"/><path d="M4 21h16"/><circle cx="7" cy="6" r="1.3" fill="currentColor"/><circle cx="12" cy="4.5" r="1.3" fill="currentColor"/><circle cx="17" cy="6" r="1.3" fill="currentColor"/></svg>',
  swords: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg>',
  torii: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4c6 1.3 14 1.3 20 0"/><path d="M4 8h16"/><path d="M6 6v15M18 6v15"/><path d="M12 8v3"/></svg>',
  anvil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h13c0 3 2 4 5 4v1c-4 0-6 1-7 3H8C7 12 5 11 3 11z"/><path d="M8 15l-2 5h12l-2-5"/></svg>',
  echo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="2.4" fill="currentColor"/><path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9"/><path d="M4.6 4.6a10.4 10.4 0 0 0 0 14.8M19.4 4.6a10.4 10.4 0 0 1 0 14.8" stroke-dasharray="2.2 2.6"/></svg>',
  infinity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c-2-2.7-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.3 6-4zm0 0c2 2.7 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.3-6 4z"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  bars: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V12"/><path d="M10 20V5"/><path d="M16 20v-9"/><path d="M21 20H3"/></svg>'
};
const TOUCH_IC = {
  sword: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20 L17 7"/><path d="M15 5 L20 3 L19 8"/><path d="M7 13 L11 17"/></svg>',
  fist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V7.5a1.5 1.5 0 0 1 3 0V10"/><path d="M10 10V6.5a1.5 1.5 0 0 1 3 0V10"/><path d="M13 10V7.5a1.5 1.5 0 0 1 3 0V12"/><path d="M7 11c-1.7 0-3 1.2-3 3l.6 2.4C5.3 19 7.5 21 10.5 21h1.8c3 0 4.7-2.2 4.7-5v-4"/></svg>',
  foot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v8.5c0 1.6.9 2.7 2.4 3.3l5.6 2.2c1.7.7 2.8 1.6 3 3H7.5C5.6 20 4 18.6 4 16.6V3"/></svg>',
  dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6l6 6-6 6"/><path d="M13 6l6 6-6 6"/></svg>'
};
const UIManager = {
  current: null, selStage: null, armTab: 'weapons', armSel: null, returnTo: 'title',
  pfCfg: null, pfWeapon: null, skip: false, overlay: null, armRAF: 0,
  init() {
    this.ui = document.getElementById('ui');
    this.ui.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b || b.disabled) return;
      AudioManager.play('ui');
      this.action(b.dataset.a, b);
    });
    this.ui.addEventListener('pointerover', e => { const b = e.target.closest('button'); if (b && b !== this._hov && !b.closest('#touch')) { this._hov = b; AudioManager.play('hover'); } });
    this.ui.addEventListener('pointerup', e => { const b = e.target.closest('.btn-primary'); if (b) { b.classList.remove('released'); void b.offsetWidth; b.classList.add('released'); } });
    this.buildTouch();
    const boot = document.getElementById('boot');
    const start = () => {
      if (boot.classList.contains('gone')) return;
      AudioManager.unlock();
      // put the title screen in place first so the splash cross-fades straight into the key art
      this.renderTitle(); this.show('title'); this.runAfterShow();
      boot.classList.add('gone');
      setTimeout(() => boot.remove(), 600);
    };
    boot.addEventListener('pointerdown', start);
    window.addEventListener('keydown', e => { if (!boot.classList.contains('gone')) { e.preventDefault(); start(); } }, { once: false });
    document.addEventListener('pointerdown', () => AudioManager.unlock(), { passive: true });
    if (!SaveManager.available) setTimeout(() => this.toast('Storage blocked', 'Progress will not be saved', true), 1500);
  },
  show(id) {
    for (const s of $$('.screen')) s.classList.toggle('on', s.id === 'scr-' + id);
    this.current = id;
    if (id !== 'armory') cancelAnimationFrame(this.armRAF);
    this.updateTouch();
    const first = $(`#scr-${id} [data-focus]`) || $(`#scr-${id} button`);
    if (first && InputManager.lastDevice !== 'touch' && id !== 'hud') setTimeout(() => first.focus({ preventScroll: true }), 30);
  },
  go(id, setup) {
    const wipe = document.getElementById('wipe');
    if (this.transitioning) { setup && setup(); this.show(id); this.runAfterShow(); return; }
    this.transitioning = true;
    AudioManager.play('wipe');
    wipe.className = ''; void wipe.offsetWidth; wipe.className = 'in';
    setTimeout(() => {
      try { setup && setup(); } catch (e) { console.error(e); }
      this.show(id);
      setTimeout(() => this.runAfterShow(), 16);
      wipe.className = 'out';
      setTimeout(() => { wipe.className = ''; this.transitioning = false; }, 240);
    }, 235);
  },
  runAfterShow() { const f = this.afterShow; this.afterShow = null; if (f) try { f(); } catch (e) { console.error(e); } },
  refreshCurrency() { const s = SaveManager.data; for (const e of $$('[data-coins]')) e.textContent = fmt(s.coins); for (const e of $$('[data-gems]')) e.textContent = fmt(s.gems); },
  toast(eyebrow, title, red) {
    const t = document.createElement('div'); t.className = 'toast' + (red ? ' red' : '');
    t.innerHTML = `<div><div class="eyebrow">${esc(eyebrow)}</div><b>${esc(title)}</b></div>`;
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 2600);
  },
  skipRequested() { const s = this.skip; this.skip = false; return s; },

  /* ---------------- actions ---------------- */
  action(a, el) {
    const save = SaveManager.data, d = el.dataset;
    // a new game asks for a difficulty mode before the first campaign or Echo Trials entry
    if ((a === 'play' || a === 'campaign' || a === 'trials' || a === 'br-start') && !save.difficultyPicked) { this.openModePicker(a); return; }
    switch (a) {
      case 'pick-mode': {
        const next = this._modeNext; this._modeNext = null;
        if (!Logic.setDifficulty(save, d.v)) break;
        SaveManager.save(); this.closeOverlay();
        this.toast('Difficulty', Logic.difficulty(save.difficulty).label);
        if (next) this.action(next, el);
        break;
      }
      case 'difficulty': {
        if (!Logic.setDifficulty(save, d.v)) break;
        SaveManager.save();
        if (Game.session) Game.session.applyDifficulty();
        if (this.current === 'settings') this.renderSettings();
        if (this.overlay === 'pause') this.openPause();
        if (this.current === 'prefight' && this.pfCfg) this.renderPrefight();
        break;
      }
      case 'play': {
        const n = Game.nextStage();
        if (n && Logic.isCombatStage(n)) { this.selStage = n; this.go('prefight', () => this.preparePrefight(Game.stageConfig(n))); }
        else if (n) { this.selStage = n; this.go('campaign', () => this.renderCampaign()); }
        else { this.go('campaign', () => this.renderCampaign()); this.toast('Story complete', save.ngUnlocked ? 'New Game+ awaits in Settings' : 'Replay any stage'); }
        break;
      }
      case 'campaign': this.selStage = Game.nextStage() || this.selStage; this.go('campaign', () => this.renderCampaign()); break;
      case 'trials': this.go('trials', () => this.renderTrials()); break;
      case 'bossrush': this.go('bossrush', () => this.renderBossRush()); break;
      case 'br-pick': {
        const b = Logic.bossRushRoster(save).find(x => x.stageId === d.id);
        if (!b || !b.available) { AudioManager.play('block'); this.toast('Locked', 'Defeat in the story', true); return; }
        this.brFrom = this.brFrom === d.id ? null : d.id; AudioManager.play('ui'); this.renderBossRush(); break;
      }
      case 'br-start': if (!Game.startBossRush(this.brFrom)) { AudioManager.play('block'); this.toast('No boss yet', 'Defeat a boss in the story to add it to the rush', true); } break;
      case 'armory': this.returnTo = this.current; this.go('armory', () => this.renderArmory()); break;
      case 'settings': this.returnTo = this.current === 'settings' ? 'title' : this.current; this.go('settings', () => this.renderSettings()); break;
      case 'title': this.go('title', () => this.renderTitle()); break;
      case 'back': this.back(); break;
      case 'sound': save.settings.sound = !save.settings.sound; save.settings.music = save.settings.sound; SaveManager.save(); AudioManager.applySettings(); this.renderTitle(); break;
      case 'profile': this.openProfile(); break;
      case 'trophies': this.openTrophies(); break;
      case 'loadout': this.openLoadout(); break;
      case 'armory-from-ov': this.closeOverlay(); this.returnTo = this.current; this.go('armory', () => this.renderArmory()); break;
      case 'earn': this.toast('Earn coins & gems', 'Win duels, topple bosses and climb the Echo Trials'); this.go('trials', () => this.renderTrials()); break;
      case 'help': this.openHelp(); break;
      case 'close-ov': this.closeOverlay(); break;
      case 'chapter': {
        const ch = Logic.chapter(d.id);
        if (!Logic.isChapterUnlocked(save, ch.id)) {
          const prev = Logic.chapters()[Logic.chapters().indexOf(ch) - 1];
          this.toast('Chapter locked', `Finish ${prev ? prev.name : 'the story so far'} to open the way`, true); AudioManager.play('block'); return;
        }
        const nx = Game.nextStage();
        this.selStage = nx && Logic.stage(nx).chapter === ch.id ? nx : ch.stages[ch.stages.length - 1].id;
        this._thOrigin = el;   // a new act's palette blooms out of the row that was picked
        this.renderCampaign(true);
        const row = $(`#scr-campaign .cp-chap[data-id="${ch.id}"]`); if (row && InputManager.lastDevice !== 'touch') row.focus({ preventScroll: true });
        break;
      }
      case 'stage': {
        if (!Game.stageUnlocked(d.id)) { AudioManager.play('block'); this.toast('Stage locked', 'Clear the stage before it first', true); return; }
        this.selStage = d.id; this.renderCampaign(true); break;
      }
      case 'fight-stage': {
        const id = this.selStage;
        if (!Game.stageUnlocked(id)) return;
        if (Logic.isCombatStage(id)) this.go('prefight', () => this.preparePrefight(Game.stageConfig(id)));
        else this.playScene(id);
        break;
      }
      case 'pf-weapon': this.pfWeapon = d.id; this.renderPrefight(); break;
      case 'pf-fight': {
        if (this.pfWeapon && save.owned.weapons[this.pfWeapon]) { save.equipped.weapon = this.pfWeapon; SaveManager.save(); }
        const cfg = this.pfCfg;
        this.go('hud', () => Game.startFight(cfg));
        break;
      }
      case 'pf-gear': this.returnTo = 'prefight'; this.go('armory', () => this.renderArmory()); break;
      case 'tab': this.armTab = d.tab; this.armSel = null; this.renderArmory(true); break;
      case 'tile': this.armSel = d.id; this.renderArmory(true); break;
      case 'arm-line': this.armLine = d.line; this.armSel = null; this.renderArmory(true); break;
      case 'buy': this.buy(); break;
      case 'upgrade': this.upgrade(); break;
      case 'equip': this.equip(); break;
      case 'set': {
        const k = d.k; let v = d.v; if (v === 'true') v = true; if (v === 'false') v = false;
        save.settings[k] = v; SaveManager.save(); AudioManager.applySettings(); this.updateTouch();
        if (this.current === 'settings') this.renderSettings(); if (this.overlay === 'pause') this.openPause();
        break;
      }
      case 'ng': this.confirm('Begin New Game+?', 'Campaign progress resets. Enemies hit harder, react faster and guard better. Rewards increase by 60%. You keep coins, gear and levels.', () => { if (Game.startNewGamePlus()) { this.toast(`New Game+ ${save.ng}`, 'The road begins again'); this.renderSettings(); } }); break;
      case 'reset': this.confirm('Erase all progress?', 'Coins, gear, levels and campaign progress will be lost. This cannot be undone.', () => { SaveManager.reset(); Game.buildWarrior(); this.toast('Progress erased', 'A fresh start', true); this.renderSettings(); }); break;
      case 'confirm-yes': { const f = this._confirm; this.closeOverlay(); f && f(); break; }
      case 'sv-start': {
        // wave 1's leader and arena, from the same rules every later wave uses (Logic.echoTrialWave)
        const w = Logic.echoTrialWave(save, 1);
        const cfg = { mode: 'trials', wave: 1, enemyId: w.foes[0], env: w.env, ng: save.ng };
        this.go('prefight', () => this.preparePrefight(cfg));
        break;
      }
      case 'pause': this.openPause(); break;
      case 'resume': this.closeOverlay(); break;
      case 'restart': this.closeOverlay(); Game.paused = false; { const cfg = Object.assign({}, Game.session.cfg); if (cfg.mode === 'trials') cfg.wave = 1;
        if (cfg.mode === 'bossrush') { Game.quitFight(); Game.startBossRush(Game.rushFrom); break; } Game.quitFight(); this.go('hud', () => Game.startFight(cfg, { skipBefore: true })); } break;
      case 'quit': this.closeOverlay(); { const mode = Game.session && Game.session.mode; Game.quitFight(); Game.rush = null; if (mode === 'trials') this.go('trials', () => this.renderTrials()); else if (mode === 'bossrush') this.go('bossrush', () => this.renderBossRush()); else this.go('campaign', () => this.renderCampaign()); } break;
      case 'res-continue': {
        const r = Game.lastResult;
        if (r.mode === 'trials') { this.go('trials', () => this.renderTrials()); break; }
        if (r.mode === 'bossrush') { this.go('bossrush', () => this.renderBossRush()); break; }
        this.selStage = r.win && r.next ? r.next : r.stageId;
        this.go('campaign', () => this.renderCampaign());
        break;
      }
      case 'res-retry': if (Game.lastResult && Game.lastResult.mode === 'bossrush') Game.startBossRush(Game.rushFrom); else Game.retry(); break;
      case 'res-armory': this.returnTo = 'result'; this.go('armory', () => this.renderArmory()); break;
      case 'res-map': this.selStage = Game.lastResult.stageId; this.go('campaign', () => this.renderCampaign()); break;
    }
  },
  back() {
    if (this.overlay) return this.closeOverlay();
    switch (this.current) {
      case 'campaign': this.go('title', () => this.renderTitle()); break;
      case 'armory': case 'settings': {
        const r = this.returnTo;
        if (r === 'prefight' && this.pfCfg) this.go('prefight', () => this.preparePrefight(this.pfCfg));
        else if (r === 'result') this.go('result', () => this.showResult(Game.lastResult));
        else if (r === 'campaign') this.go('campaign', () => this.renderCampaign());
        else this.go('title', () => this.renderTitle());
        break;
      }
      case 'trials': case 'bossrush': this.go('title', () => this.renderTitle()); break;
      case 'prefight': if (this.pfCfg.mode === 'trials') this.go('trials', () => this.renderTrials()); else { this.selStage = this.pfCfg.stageId; this.go('campaign', () => this.renderCampaign()); } break;
      case 'result': this.action('res-continue', document.body); break;
    }
  },
  onKey(e) {
    if (StoryPlayer.active) return;   // a story scene reads its own keys (68-story.js)
    if (e.code === 'Escape' || (e.code === 'KeyP' && this.current === 'hud')) {
      if (this.current === 'hud' && Game.session) { if (this.overlay === 'pause') this.closeOverlay(); else if (!this.overlay) this.openPause(); else this.closeOverlay(); return; }
      this.back(); return;
    }
    if (this.current === 'hud') { if (e.code === 'Enter' || e.code === 'Space') this.skip = true; return; }
    // Campaign: Q / E step through the chapters (the design's key hints)
    if (this.current === 'campaign' && !this.overlay && (e.code === 'KeyQ' || e.code === 'KeyE')) {
      const chs = Logic.chapters(), cur = Logic.stage(this.selStage), i = chs.findIndex(c => cur && c.id === cur.chapter);
      const c = chs[i + (e.code === 'KeyE' ? 1 : -1)];
      const row = c && $(`#scr-campaign .cp-chap[data-id="${c.id}"]`);
      if (row) { AudioManager.play('ui'); this.action('chapter', row); }
      e.preventDefault(); return;
    }
    if (e.code === 'ArrowDown' || e.code === 'ArrowUp' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      const root = this.overlay ? $('#ov-' + this.overlay) : $('#scr-' + this.current);
      if (!root) return;
      const items = $$('button:not([disabled])', root).filter(b => b.offsetParent !== null);
      if (!items.length) return;
      const i = items.indexOf(document.activeElement);
      const dir = e.code === 'ArrowDown' || e.code === 'ArrowRight' ? 1 : -1;
      const n = items[(i + dir + items.length) % items.length];
      n.focus(); e.preventDefault();
    }
  },
  onPad(a) { if (StoryPlayer.active) return; if (a === 'pause' && this.current === 'hud') { if (this.overlay) this.closeOverlay(); else this.openPause(); } },
  onResize() { if (this.current === 'armory') this.renderArmory(true); },

  /* ---------------- title ---------------- */
  /* Wonder "Home Screen": the key art over the lake, the side menu, the Continue card and the three mode tiles. The
     painted art follows the act palette through a hue shift (.th-img); the SVG scenery is drawn in the palette. */
  renderTitle() {
    const save = SaveManager.data, el = $('#scr-title');
    Game.setScene('menu'); AudioManager.setMusic('title');
    Game.buildWarrior();
    // the home screen always wears Act I's crimson; only the Continue card and the three mode tiles take the colour
    // of the act the story has reached (data-pal: the same palettes, scoped to those elements), unless the UI is
    // pinned to one palette (MENU_THEME_PIN, 71-theme.js)
    ActTheme.set('raikon');
    const pal = MENU_THEME_PIN || ActTheme.progress();
    const n = Game.nextStage();
    let eye, ttl;
    if (n) {
      const ch = Logic.chapterOf(n), p = Logic.chapterProgress(save, ch.id);
      eye = `${esc(ch.name)} · ${Math.min(p.total, p.done + 1)} / ${p.total}`; ttl = Logic.stage(n).name;
    } else { eye = save.ngUnlocked ? 'Story complete' : 'The story so far'; ttl = 'Replay any stage'; }
    const xp = clamp(save.xp / xpForLevel(save.level), 0, 1);
    const trophies = Logic.stages().filter(st => Logic.isBossStage(st.id) && Logic.defeatedCount(save, st.id) > 0).length;
    const row = (a, ic, label, on) => `<button class="hm-row ${on ? 'on' : ''}" data-a="${a}"><span class="w-dia">${ic}</span><span class="lb">${label}</span></button>`;
    const sky = 'style="stop-color:var(--th-sky1)"', acc = 'var(--th-acc)';
    el.innerHTML = `<div class="w-scr"><div class="w-stage">
      <svg class="w-bd" viewBox="0 0 1600 900" aria-hidden="true"><defs>
        <linearGradient id="hm-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" ${sky}/><stop offset=".55" style="stop-color:color-mix(in srgb,var(--th-sky1) 55%,var(--th-sky2))"/><stop offset="1" style="stop-color:var(--th-sky3)"/></linearGradient>
        <radialGradient id="hm-glow" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:${acc};stop-opacity:.3"/><stop offset="1" style="stop-color:${acc};stop-opacity:0"/></radialGradient>
        <linearGradient id="hm-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb,var(--th-acc) 22%,var(--th-sky1))"/><stop offset="1" style="stop-color:var(--th-ground)"/></linearGradient>
        <linearGradient id="hm-fall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8d6cf" stop-opacity=".55"/><stop offset="1" stop-color="#e8d6cf" stop-opacity=".05"/></linearGradient></defs>
        <rect width="1600" height="900" fill="url(#hm-sky)"/>
        <circle cx="760" cy="300" r="460" fill="url(#hm-glow)" style="animation:wGlow 5s ease-in-out infinite"/>
        <path d="M1060 132 Q1140 118 1240 124 Q1310 120 1360 128 Q1270 138 1180 136 Q1110 140 1060 132Z" fill="#d8b4aa" opacity=".35"/>
        <path d="M0 560 L90 500 L180 530 L300 440 L420 520 L520 480 L620 540 L760 470 L880 530 L1000 460 L1120 520 L1240 470 L1360 520 L1480 480 L1600 510 L1600 900 L0 900Z" fill="url(#hm-haze)" opacity=".85"/>
        <path d="M1110 560 L1160 440 L1196 252 L1260 236 L1300 228 L1340 200 L1400 188 L1440 152 L1520 140 L1600 128 L1600 900 L1110 900Z" style="fill:var(--th-ground)"/>
        <rect x="1202" y="252" width="26" height="230" fill="url(#hm-fall)"/>
        <rect x="1194" y="250" width="44" height="56" style="fill:var(--th-ground)"/>
        <g style="fill:color-mix(in srgb,var(--th-ground) 55%,#000)"><rect x="1352" y="158" width="148" height="34"/><path d="M1334 162 L1518 162 L1496 146 L1356 146Z"/><rect x="1376" y="120" width="100" height="28"/><path d="M1360 124 L1492 124 L1472 108 L1380 108Z"/><rect x="1400" y="88" width="52" height="22"/><path d="M1386 92 L1466 92 L1452 76 L1400 76Z"/><rect x="1424" y="64" width="4" height="14"/><rect x="1262" y="206" width="46" height="24"/><path d="M1250 210 L1320 210 L1306 198 L1264 198Z"/><rect x="1272" y="186" width="26" height="14"/><path d="M1262 190 L1308 190 L1298 180 L1272 180Z"/></g>
        <g style="fill:var(--th-hot);animation:wGlow 3s ease-in-out infinite"><rect x="1372" y="170" width="8" height="8"/><rect x="1392" y="170" width="8" height="8"/><rect x="1452" y="170" width="8" height="8"/><rect x="1472" y="170" width="8" height="8"/><rect x="1398" y="130" width="7" height="7"/><rect x="1446" y="130" width="7" height="7"/><rect x="1420" y="96" width="6" height="6"/><rect x="1280" y="214" width="6" height="6"/></g>
        <path d="M0 650 C150 610 300 630 420 600 C540 570 640 610 760 600 C900 585 1000 620 1120 610 C1260 598 1400 630 1600 610 L1600 900 L0 900Z" style="fill:color-mix(in srgb,var(--th-ground) 85%,#000)"/>
        <g style="fill:color-mix(in srgb,var(--th-ground) 65%,#000)"><rect x="18" width="12" height="900"/><rect x="44" width="9" height="900"/><rect x="74" width="14" height="900"/><rect x="1556" width="12" height="900"/><rect x="1580" width="9" height="900"/></g>
        <path d="M18 160 H30 M18 360 H30 M18 560 H30 M44 250 H53 M44 470 H53 M74 120 H88 M74 330 H88 M74 540 H88 M1556 220 H1568 M1556 430 H1568 M1580 320 H1589" style="stroke:color-mix(in srgb,var(--th-acc) 18%,var(--th-ground))" stroke-width="2"/>
        <path d="M0 792 C200 772 400 786 600 782 L1000 782 C1200 786 1400 772 1600 788 L1600 808 L0 808Z" style="fill:color-mix(in srgb,var(--th-ground) 50%,#000)"/>
      </svg>
      <i class="hm-water"></i>
      <svg class="hm-refl" viewBox="0 0 1600 96" aria-hidden="true"><g class="sun" opacity=".35"><rect x="660" y="10" width="240" height="4"/><rect x="690" y="24" width="190" height="3"/><rect x="640" y="38" width="260" height="3"/><rect x="710" y="54" width="140" height="3"/><rect x="680" y="70" width="200" height="2"/></g><g fill="#ece5d3" opacity=".08"><rect x="120" y="20" width="300" height="1"/><rect x="1080" y="30" width="360" height="1"/><rect x="260" y="58" width="220" height="1"/><rect x="1180" y="72" width="240" height="1"/></g></svg>
      ${wClouds('far', [[150, 560, 140, -30, 0.5, 'dark'], [420, 700, 170, -110, 0.42, 'dark'], [96, 420, 120, -85, 0.35, 'dark']])}
      <i class="hm-hero th-img" role="img" aria-label="Kage before the red sun"></i>
      <i class="hm-moon" aria-hidden="true"></i>
      ${wClouds('near', [[236, 520, 95, -20, 0.55, 'dark'], [318, 380, 75, -60, 0.32, 'lit'], [170, 300, 85, -12, 0.22, 'lit'], [470, 640, 110, -70, 0.45, 'dark']])}
      <i class="hm-blend"></i>
      ${wPetals('hm-petals', 26, 1600, 900, 'fall')}
      <i class="hm-vign"></i>
      ${Logic.devUnlocked() ? '<div class="dev-badge" role="status" style="left:800px;top:14px">DEV · everything unlocked</div>' : ''}
      <div class="w-top hm-top">
        <div class="grp" style="gap:18px"><div class="hm-seal" aria-hidden="true">影</div>
          <div class="hm-meta"><div class="nm"><b>KAGE</b><span>Lv. ${save.level}</span>${save.ng ? `<span class="cp-ng">NG+${save.ng}</span>` : ''}</div><div class="hm-xp" title="${fmt(save.xp)} / ${fmt(xpForLevel(save.level))} XP"><i style="width:${(xp * 100).toFixed(1)}%"></i></div></div></div>
        ${wPills(`<button class="w-sq" data-a="help" aria-label="Codex: controls">${W_IC.lotus}</button>`)}
      </div>
      <div class="hm-brand"><h1 class="hm-mark th-img" aria-label="KAGE"></h1><span class="hm-sub">THE LAST BETRAYAL</span></div>
      <nav class="hm-menu" aria-label="Main menu">
        ${row('play', W_IC.pagoda, 'Home', true)}
        ${row('campaign', W_IC.swords, 'Campaign')}
        ${row('armory', W_IC.armor, 'Armory')}
        ${row('trials', W_IC.swirl, 'Echo Trials')}
        ${row('bossrush', W_IC.oni, 'Boss Rush')}
        ${row('settings', W_IC.shuriken, 'Settings')}
      </nav>
      <button class="hm-cont" data-pal="${pal}" data-a="play" data-focus aria-label="Continue: ${esc(ttl)}">
        <svg class="scn" viewBox="0 0 556 214" aria-hidden="true"><defs>
          <linearGradient id="hm-cbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb,var(--th-acc) 16%,var(--th-panel))"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--th-acc) 38%,var(--th-sky1))"/></linearGradient>
          <radialGradient id="hm-cglow" cx=".74" cy=".42" r=".5"><stop offset="0" style="stop-color:var(--th-hot);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--th-hot);stop-opacity:0"/></radialGradient>
          <radialGradient id="hm-cmoon" cx=".42" cy=".38" r=".62"><stop offset="0" style="stop-color:color-mix(in srgb,var(--th-hot) 70%,#fff)"/><stop offset="1" style="stop-color:var(--th-sun1)"/></radialGradient></defs>
          <rect width="556" height="214" fill="url(#hm-cbg)"/><rect width="556" height="214" fill="url(#hm-cglow)"/>
          <circle class="moon" cx="470" cy="66" r="38" fill="url(#hm-cmoon)" opacity=".85"/>
          <path class="hill h1" d="M0 140 Q60 104 130 122 Q200 92 270 116 Q340 84 420 110 Q490 90 556 108 L556 214 L0 214Z" style="fill:color-mix(in srgb,var(--th-acc) 42%,var(--th-sky1))" opacity=".55"/>
          <path class="hill h2" d="M0 166 Q80 132 160 152 Q240 122 330 146 Q420 120 490 140 Q530 132 556 138 L556 214 L0 214Z" style="fill:color-mix(in srgb,var(--th-acc) 28%,var(--th-ground))"/>
          <path class="hill h3" d="M0 196 Q110 168 230 186 Q350 162 450 182 Q510 172 556 178 L556 214 L0 214Z" style="fill:color-mix(in srgb,var(--th-ground) 62%,#000)"/>
          <rect y="150" width="556" height="30" style="fill:color-mix(in srgb,var(--th-hot) 30%,transparent)" opacity=".18"/>
        </svg>
        ${wPetals('hm-cpetals', 16, 556, 214, 'wind')}
        <i class="scrim"></i>
        <span class="txt"><span class="eyes"><span>${save.ng ? `NG+${save.ng} · ` : ''}Continue</span><i>›</i><span>${eye}</span></span><span class="ttl">${esc(ttl)}</span></span>
        <span class="hm-play">${W_IC.play}</span>
      </button>
      <div class="hm-tiles" data-pal="${pal}">
        <button class="hm-tile" data-a="armory"><i class="art blade" aria-hidden="true"></i><span class="lb">ARMORY</span></button>
        <button class="hm-tile" data-a="trials"><svg class="art torii" viewBox="0 0 100 80" fill="currentColor" aria-hidden="true"><path d="M2 6 Q50 16 98 6 L96 16 Q50 24 4 16Z"/><rect x="12" y="26" width="76" height="7"/><path d="M22 16 L30 16 L32 80 L20 80Z"/><path d="M70 16 L78 16 L80 80 L68 80Z"/><rect x="46" y="18" width="8" height="10"/></svg><span class="lb">ECHO<br>TRIALS</span></button>
        <button class="hm-tile" data-a="bossrush"><span class="art oni">${W_IC.oni}</span><span class="lb">BOSS<br>RUSH</span></button>
      </div>
      <div class="hm-bot">
        <div class="hm-util">
          <button class="w-dia" data-a="profile" aria-label="Records">${W_IC.bars}</button>
          <button class="w-dia" data-a="trophies" aria-label="Trophies">${MENU_IC.trophy}${trophies ? `<b class="hm-badge">${trophies}</b>` : ''}</button>
          <button class="w-dia" data-a="loadout" aria-label="Profile">${ICON.user}</button>
          <button class="w-dia" data-a="sound" aria-label="Toggle sound">${save.settings.sound ? ICON.sound : ICON.mute}</button>
        </div>
      </div>
    </div></div>`;
  },
  openTrophies() {
    const s = SaveManager.data;
    // every boss-type stage of the story; the old trophy loot returns with the rebuilt gear
    const rows = Logic.stages().filter(st => Logic.isBossStage(st.id)).map(st => {
      const got = Logic.defeatedCount(s, st.id) > 0, ch = Logic.chapterOf(st.id);
      return `<div class="tro ${got ? 'got' : ''}"><span class="tro-k">${BANNER_GLYPH[st.foe] || '影'}</span><div><b>${esc(st.foe)}</b><span>${esc(ch.name)} · ${esc(st.foeTitle || '')}</span><em>${got ? 'Defeated' : 'Not yet defeated'}</em></div></div>`;
    }).join('');
    this.openOverlay('profile', `<div class="ov-card wide"><div class="eyebrow">Trophies</div><h3 class="disp">Fallen Foes</h3><div class="tro-grid">${rows}</div><div class="stack"><button class="btn-primary" data-a="close-ov" data-focus>Close</button></div></div>`);
  },
  openLoadout() {
    const s = SaveManager.data, eq = s.equipped;
    this.openOverlay('profile', `<div class="ov-card"><div class="eyebrow">Profile</div><h3 class="disp">Kage · Level ${s.level}</h3>
      <canvas class="lo-art" data-lo></canvas>
      <div class="xp"><div class="labels"><b>Experience</b><span>${fmt(s.xp)} / ${fmt(xpForLevel(s.level))}</span></div><div class="track"><i style="width:${s.xp / xpForLevel(s.level) * 100}%"></i></div></div>
      <div class="records">
        <div><b>${esc(WEAPONS[eq.weapon].name)}</b><span>Weapon · Lv ${s.owned.weapons[eq.weapon] || 1}</span></div>
        <div><b>${esc(HELMETS[eq.helmet].name)}</b><span>Helm</span></div>
        <div><b>${esc(ARMORS[eq.armor].name)}</b><span>Armor</span></div>
        <div><b>${playerMaxHp(s)}</b><span>Health</span></div>
      </div>
      <div class="stack"><button class="btn-primary" data-a="armory-from-ov" data-focus>Open Armory</button><button class="btn-ghost" data-a="close-ov">Close</button></div></div>`);
    setTimeout(() => { const cv = $('#ov-profile canvas[data-lo]'); if (cv) { const f = makePlayerFighter(s); poseFighter(f, WEAPONS[eq.weapon].hands === 2 && ['katana', 'shinsen'].includes(SHAPE[eq.weapon]) ? 'hasso' : null, 40); drawFighterInto(cv, f, { glow: 'rgba(163,48,42,0.55)', rim: 'rgba(255,190,150,0.9)', fit: 0.95, tall: 1.3 }); } }, 30);
  },

  /* ---------------- campaign ----------------
     One screen: the chapter rail (story order), the selected chapter's stages, and the stage card.
     Everything it shows comes from the campaign map in Logic; stages are selected by their string id. */
  renderCampaign() {
    const save = SaveManager.data;
    Game.setScene('menu'); AudioManager.setMusic('menu');
    const chapters = Logic.chapters(), next = Game.nextStage();
    if (!Logic.stage(this.selStage) || !Logic.isStageUnlocked(save, this.selStage)) this.selStage = next || Logic.stages()[Logic.stages().length - 1].id;
    const sel = Logic.stage(this.selStage), ch = Logic.chapter(sel.chapter);
    const chState = c => Logic.isChapterComplete(save, c.id) ? 'cleared' : Logic.isChapterUnlocked(save, c.id) ? 'open' : 'locked';
    const stState = st => Logic.isStageComplete(save, st.id) ? 'cleared' : Logic.isStageUnlocked(save, st.id) ? 'open' : 'locked';
    const KIND = { stretch: 'Stretch', subboss: 'Sub-boss', boss: 'Main boss', spar: 'Memory spar', echo: 'Echo fight', scene: 'Story scene' };
    const combat = Logic.isCombatStage(sel.id), cfg = combat ? Game.stageConfig(sel.id) : null;
    const selDone = Logic.isStageComplete(save, sel.id), unlocked = Logic.isStageUnlocked(save, sel.id);
    const reward = Logic.stageRewardPreview(save, sel.id);
    const foe = combat ? ENEMIES[cfg.enemyId] : null;
    const dl = combat ? clamp(ch.diff + save.ng + (foe.type === 'boss' ? 1 : foe.type === 'sub' ? 0.5 : 0), 0, 4) | 0 : 0;
    const prog = Logic.chapterProgress(save, ch.id);
    const action = !unlocked ? 'Locked' : combat ? (selDone ? 'Replay' : 'Fight') : (selDone ? 'Replay scene' : 'Play scene');
    this.renderCampaignW({ save, chapters, next, sel, ch, chState, stState, KIND, combat, cfg, selDone, unlocked, reward, foe, dl, prog, action });
  },
  /* Wonder "Campaign Screen": chapter list, the act's stage map (the design's serpentine path), the stage card and
     the act boss card. Picking a chapter of another act changes the palette with the ink bloom from that row. */
  renderCampaignW(o) {
    const { save, chapters, next, sel, ch, chState, stState, KIND, combat, cfg, selDone, unlocked, reward, foe, dl, prog, action } = o;
    const el = $('#scr-campaign');
    ActTheme.set(ActTheme.forChapter(ch.id), this._thOrigin); this._thOrigin = null;
    const num = st => +((st.id.match(/(\d+)$/) || [0, 1])[1]);
    const SLOTS = [[80, 250], [200, 330], [320, 250], [440, 330], [560, 250], [440, 490], [320, 570], [200, 490], [100, 600]];
    const N = ch.stages.length;
    const pos = N === 9 ? SLOTS : N === 1 ? [[340, 420]] : ch.stages.map((_, i) => SLOTS[Math.round(i * 8 / (N - 1))]);
    const BOX = { stretch: 68, spar: 68, scene: 68, subboss: 56, echo: 56, boss: 88 };
    const done = st => stState(st) === 'cleared';
    let lines = '';
    for (let i = 0; i + 1 < N; i++) {
      const [x1, y1] = pos[i], [x2, y2] = pos[i + 1];
      const via = x1 === 560 && y2 > 400 ? ` 560,410` : '';
      const ok = done(ch.stages[i]) && (done(ch.stages[i + 1]) || ch.stages[i + 1].id === next);
      lines += `<polyline class="${ok ? 'done' : 'todo'}" points="${x1},${y1}${via} ${x2},${y2}"/>`;
    }
    const nodes = ch.stages.map((st, i) => {
      const state = stState(st), cur = st.id === next, [x, y] = pos[i];
      const box = cur ? 92 : BOX[st.kind] || 68;
      const big = st.kind === 'stretch' || st.kind === 'spar' || st.kind === 'scene';
      const glyph = state === 'locked' && !big && st.kind !== 'boss' ? ICON.lock
        : st.kind === 'boss' ? W_IC.swords : st.kind === 'subboss' || st.kind === 'echo' ? W_IC.oni
        : st.kind === 'scene' ? '<span class="num">終</span>' : st.kind === 'spar' ? '<span class="num">弟</span>' : `<span class="num">${ROMAN[num(st) - 1] || num(st)}</span>`;
      const ty = cur ? `${KIND[st.kind]} · Next` : st.kind === 'boss' ? 'Main boss' : big ? KIND[st.kind] : '';
      const nm = st.kind === 'boss' ? (st.foe || st.name) : st.name;
      return `<button class="cp-node k-${st.kind} ${state} ${cur ? 'current' : ''} ${st.id === sel.id ? 'sel' : ''}" style="left:${x}px;top:${y - box / 2}px;animation-delay:${(i * 0.04).toFixed(2)}s"
        data-a="stage" data-id="${st.id}" aria-label="${esc(st.name)}, ${KIND[st.kind]}, ${state === 'open' ? 'unlocked' : state}" ${st.id === sel.id ? 'data-focus' : ''}>
        <span class="w-dia">${glyph}</span><span class="nm">${esc(nm)}</span>${ty ? `<span class="ty">${esc(ty)}</span>` : ''}</button>`;
    }).join('');
    // the stage card's words
    const kindLine = `${esc(ch.name)} · ${KIND[sel.kind]}${(sel.kind === 'stretch' || sel.kind === 'subboss' || sel.kind === 'echo') && ch.stages.length > 1 ? ' ' + (ROMAN[num(sel) - 1] || '') : ''}`;
    let desc;
    if (!combat) desc = 'No combat · the story continues.';
    else if (cfg.stretch) { const e = cfg.stretch.encounters.length, c = cfg.stretch.clues.length; desc = `${e} encounter${e === 1 ? '' : 's'} hold the road. Clues found ${Logic.cluesFound(save, sel.id).length} / ${c}.`; }
    else desc = `${esc(cfg.foeName)}${cfg.foeTitle ? `, ${esc(cfg.foeTitle)}` : ''}.${foe && foe.taunt ? ` “${esc(foe.taunt)}”` : ''}`;
    const lit = Math.min(3, Math.max(1, dl));
    const ab = ACT_BOSS[ch.id], bossSt = ab && ch.stages.find(st => st.kind === 'boss');
    const bossDef = ab && ENEMIES[ab.id], bossLocked = bossSt && !Logic.isStageUnlocked(save, bossSt.id);
    const hasArt = ab && hasBossArt(ab.id);
    // the act boss stays hidden until its node is picked: then its card rises under a slimmer stage card; otherwise
    // the stage card takes the whole column
    const showBoss = !!(ab && bossDef && sel.kind === 'boss');
    el.innerHTML = `<div class="w-scr"><div class="w-stage">
      <svg class="w-bd" viewBox="0 0 1600 900" aria-hidden="true"><defs>
        <linearGradient id="cp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--th-sky1)"/><stop offset=".6" style="stop-color:var(--th-sky2)"/><stop offset="1" style="stop-color:var(--th-sky3)"/></linearGradient>
        <radialGradient id="cp-sun" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--th-acc);stop-opacity:.35"/><stop offset="1" style="stop-color:var(--th-acc);stop-opacity:0"/></radialGradient></defs>
        <rect width="1600" height="900" fill="url(#cp-sky)"/><circle cx="1320" cy="180" r="420" fill="url(#cp-sun)"/>
        <circle cx="1320" cy="180" r="130" style="fill:var(--th-deep)" opacity=".55"/>
        <path d="M0 720 L140 660 L280 690 L420 620 L560 670 L720 630 L880 680 L1040 620 L1200 670 L1360 630 L1600 660 L1600 900 L0 900Z" style="fill:var(--th-ground)"/>
      </svg>
      <div class="w-top tall">
        <div class="grp">${wBack()}<div style="display:flex;flex-direction:column;gap:4px"><span class="w-eye" style="font-size:14px;letter-spacing:4.76px">Campaign${save.ng ? `<span class="cp-ng">New Game+ ${save.ng}</span>` : ''}</span><span class="w-title" style="font-size:34px">The Last Betrayal</span></div></div>
        <div class="cp-pips"><div class="p">${chapters.map(c => `<i class="${chState(c) === 'cleared' ? 'on' : c.id === ch.id ? 'cur' : ''}" title="${esc(c.name)}"></i>`).join('')}</div><b>${chapters.filter(c => chState(c) === 'cleared').length} / ${chapters.length}</b></div>
        ${wPills()}
      </div>
      <nav class="cp-chaps" aria-label="Chapters">${chapters.map((c, i) => {
        const st = chState(c), p = Logic.chapterProgress(save, c.id);
        return `<button class="cp-chap ${st} ${c.id === ch.id ? 'sel' : ''}" style="animation-delay:${(i * 0.04).toFixed(2)}s" data-a="chapter" data-id="${c.id}" aria-label="${esc(c.name)}, ${esc(c.title)}${st === 'locked' ? ', locked' : ''}">
          <span class="t"><span class="k">${esc(c.name)}</span><span class="n">${esc(c.title)}</span></span>
          <span class="st ${st === 'cleared' ? 'clr' : ''}">${st === 'locked' ? ICON.lock : st === 'cleared' ? 'CLEARED' : `${p.done} / ${p.total}`}</span></button>`;
      }).join('')}</nav>
      <div class="cp-hints">${wKeys([['ENTER', combat ? 'Fight' : 'Play'], ['ESC', 'Back'], ['Q / E', 'Chapter']])}</div>
      <section class="cp-map" key="${ch.id}">
        <svg class="scn" viewBox="0 0 680 704" aria-hidden="true"><defs>
          <linearGradient id="cp-mbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb,var(--th-acc) 14%,var(--th-sky1))"/><stop offset="1" style="stop-color:var(--th-panel)"/></linearGradient>
          <radialGradient id="cp-moon" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--th-hot);stop-opacity:.35"/><stop offset="1" style="stop-color:var(--th-hot);stop-opacity:0"/></radialGradient></defs>
          <rect width="680" height="704" fill="url(#cp-mbg)"/><circle cx="520" cy="150" r="220" fill="url(#cp-moon)"/><circle cx="520" cy="150" r="64" style="fill:color-mix(in srgb,var(--th-hot) 55%,var(--th-panel))" opacity=".45"/>
          <path d="M0 470 L40 470 L40 430 L20 430 L60 404 L100 430 L80 430 L80 470 L140 470 L140 410 L120 410 L170 376 L220 410 L200 410 L200 470 L260 470 L260 440 L240 440 L280 414 L320 440 L300 440 L300 470 L380 470 L380 390 L356 390 L410 350 L464 390 L440 390 L440 470 L520 470 L520 432 L500 432 L540 406 L580 432 L560 432 L560 470 L680 470 L680 704 L0 704Z" style="fill:color-mix(in srgb,var(--th-ground) 85%,var(--th-panel))"/>
          <g style="fill:var(--th-hot)"><circle cx="60" cy="452" r="4"/><circle cx="170" cy="440" r="4"/><circle cx="410" cy="420" r="4"/><circle cx="540" cy="452" r="4"/></g>
          <g opacity=".18"><g style="fill:var(--th-hot);animation:wGlow 3s ease-in-out infinite"><circle cx="60" cy="452" r="14"/><circle cx="170" cy="440" r="14"/><circle cx="410" cy="420" r="14"/><circle cx="540" cy="452" r="14"/></g></g>
          <rect width="680" height="704" style="fill:var(--th-panel)" opacity=".35"/>
        </svg>
        <svg class="lines" viewBox="0 0 680 704" aria-hidden="true">${lines}</svg>
        <div class="cp-head"><span class="w-eye">${esc(ch.name)} · ${esc(ch.place)}</span><h3>${esc(ch.title)}</h3>
          <div class="cp-prog"><span class="tr"><i style="width:${(prog.done / prog.total * 100).toFixed(1)}%"></i></span><b>${prog.done} / ${prog.total}</b></div></div>
        ${nodes}
      </section>
      <div class="cp-side ${showBoss ? 'with-boss' : ''}">
      <div class="cp-card" key="${sel.id}">
        <div class="strip"><i class="moon" aria-hidden="true"></i><svg viewBox="0 0 440 150" aria-hidden="true"><defs>
          <linearGradient id="cp-dbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb,var(--th-acc) 12%,var(--th-sky1))"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--th-acc) 30%,var(--th-sky1))"/></linearGradient>
          <radialGradient id="cp-dsun" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--th-sun1)"/><stop offset="1" style="stop-color:var(--th-sun2)"/></radialGradient></defs>
          <rect width="440" height="150" fill="url(#cp-dbg)"/><circle class="sun" cx="300" cy="66" r="48" fill="url(#cp-dsun)"/>
          <path d="M0 116 L80 96 L160 108 L240 90 L340 104 L440 92 L440 150 L0 150Z" style="fill:color-mix(in srgb,var(--th-acc) 12%,var(--th-sky1))"/>
          <path d="M20 140 Q220 70 420 136" stroke="#0c0605" stroke-width="7" fill="none"/><path d="M24 126 Q220 58 416 122" stroke="#0c0605" stroke-width="2.5" fill="none"/>
          <path d="M60 128 V114 M100 116 V102 M140 106 V92 M180 100 V86 M220 98 V84 M260 100 V86 M300 106 V92 M340 114 V100 M380 124 V110" stroke="#0c0605" stroke-width="2.5"/>
          <g fill="#0c0605"><circle cx="226" cy="74" r="3.2"/><path d="M223 78 L229 78 L231 94 L221 94Z"/></g></svg></div>
        <div class="body">
          <span class="w-eye">${kindLine}</span>
          <span class="ttl">${esc(sel.kind === 'boss' && cfg ? cfg.foeName : sel.name)}</span>
          <span class="desc">${desc}</span>
          ${combat ? `<div class="meta"><div class="cp-threat"><span class="w-pips">${[0, 1, 2].map(k => `<i class="${k < lit ? 'on' : ''}"></i>`).join('')}</span><b>${DIFF_LABEL[dl]}</b></div>
            <div class="cp-rew">${W_IC.coin}+${reward.coins}${reward.gems ? `<span class="gm">${W_IC.jade}</span>+${reward.gems}` : ''}</div></div>` : ''}
          ${selDone ? '<span class="done">Cleared · replay any time</span>' : ''}
          <button class="w-brush ${unlocked ? '' : 'locked'}" data-a="fight-stage" ${unlocked ? '' : 'disabled'}><span class="kj">${unlocked ? '戦' : ''}</span><span class="lb">${esc(action.toUpperCase())}</span></button>
        </div>
      </div>
      ${showBoss && hasBossReveal(ab.id) ? `<div class="cp-reveal" role="img" aria-label="${ch.id === 'core' ? 'Final boss' : 'Act boss'}: ${esc(bossDef.name)}, ${esc(bossDef.title)}">
        <i class="img" style="background-image:url(${BOSS_REVEAL[ab.id]})"></i><i class="shine"></i></div>`
      : showBoss ? `<button class="cp-boss ${bossLocked ? 'locked' : ''}" data-a="stage" data-id="${bossSt.id}" aria-label="Act boss: ${esc(bossDef.name)}">
        <i class="glow"></i>${hasArt ? `<i class="art" style="background-image:url(${BOSS_ART[ab.id]})"></i>` : ''}<i class="fade"></i>
        <span class="txt"><span class="ey">${ch.id === 'core' ? 'FINAL BOSS' : 'ACT BOSS'}</span><span class="nm">${esc(bossDef.name)}</span><span class="tt">${esc(bossDef.title)}</span><span class="kj">${ab.kanji}</span></span></button>` : ''}
      </div>
    </div></div>`;
  },
  // A scene stage (the Epilogue) plays its scene over the map, then counts as cleared and moves the story on.
  playScene(id) {
    if (!Game.stageUnlocked(id)) return;
    Game.playStory(Logic.stageScene(id, 'before'), () => this.sceneStageDone(id), { backdrop: true });
  },
  sceneStageDone(id) {
    const out = Game.completeSceneStage(id), st = Logic.stage(id);
    if (!out) return;
    AudioManager.play('unlock');
    this.toast(Logic.chapterOf(id).name, `${st.name} · complete`);
    let delay = 700;
    for (const u of out.unlocks) {
      setTimeout(() => {
        if (u.kind === 'ng') this.toast('Story complete', 'New Game+ unlocked in Settings');
        else if (u.kind === 'chapter') this.toast('New chapter unlocked', `${Logic.chapter(u.id).name} · ${Logic.chapter(u.id).title}`);
        else { const it = Logic.gearTable(u.kind)[u.id] || {}; this.toast(it.givenBy ? `Given by ${it.givenBy}` : u.kind === 'weapons' ? 'Boss weapon' : 'Trophy', gearName(u.kind, u.id)); }
      }, delay);
      delay += 700;
    }
    if (out.next) this.selStage = out.next;
    this.renderCampaign(true);
  },
  /* ---------------- armory ---------------- */
  armItems() {
    const t = gearTable(this.armTab), cost = it => (it.price || 0) + (it.gems ? it.gems * 100 : 0);
    // shop gear from cheapest to dearest by tier, then trophies and boss weapons
    let ids = Object.keys(t).filter(id => !t[id].enemy && id !== 'fists');
    // the Armor tab shows one row at a time: the eight-armour line, or the trophies (it opens on the one he wears)
    if (this.armTab === 'armors') { const tr = this.armorLine() === 'trophy'; ids = ids.filter(id => (t[id].tier === 'trophy') === tr); }
    return ids.sort((a, b) => (GEAR_TIERS[t[a].tier || 'common'].rank - GEAR_TIERS[t[b].tier || 'common'].rank) || (cost(t[a]) - cost(t[b])));
  },
  // which row of the Armor tab is showing: 'line' (Shinobi Garb to Mugen) or 'trophy'
  armorLine() { return this.armLine || ((ARMORS[SaveManager.data.equipped.armor] || {}).tier === 'trophy' ? 'trophy' : 'line'); },
  renderArmory(soft) {
    const save = SaveManager.data, el = $('#scr-armory'), kind = this.armTab;
    Game.setScene('menu'); AudioManager.setMusic('menu');
    const items = this.armItems();
    if (!this.armSel || !items.includes(this.armSel)) this.armSel = save.equipped[kind === 'weapons' ? 'weapon' : kind === 'helmets' ? 'helmet' : 'armor'];
    if (!items.includes(this.armSel) && items.length) this.armSel = items[0];
    const id = this.armSel, item = gearTable(kind)[id], owned = save.owned[kind][id], lvl = owned || 0;
    const max = Logic.maxLevel(kind, id), eqKey = kind === 'weapons' ? 'weapon' : kind === 'helmets' ? 'helmet' : 'armor', equipped = save.equipped[eqKey] === id;
    ActTheme.set(ActTheme.progress());
    const lv1 = Math.max(1, lvl), canUp = owned && lvl < max;
    const stat = (k, v, pct, up, upPct) => `<div class="ar-stat"><div class="hd"><span class="k">${k}</span><span class="v">${up ? `<em>+${up}</em>` : ''}${v}</span></div>
      <div class="tr"><i style="width:${clamp(pct, 0, 100).toFixed(1)}%"></i>${up ? `<u style="left:${clamp(pct, 0, 100).toFixed(1)}%;width:${clamp(upPct, 0, 100 - clamp(pct, 0, 100)).toFixed(1)}%"></u>` : ''}</div></div>`;
    let statsHTML = '', box = '';
    if (kind === 'weapons') {
      const s = weaponStats(id, lv1), n = weaponStats(id, Math.min(max, lv1 + 1));
      statsHTML = [['Damage', 'damage'], ['Speed', 'speed'], ['Reach', 'reach']].map(([k, key]) => {
        const up = canUp ? n[key] - s[key] : 0;
        return stat(k, s[key], s[key] / 1.8, up, up / 1.8);
      }).join('');
      const sp = SPECIALS[item.special];
      if (sp) box = `<div class="ar-box"><span class="ic">${W_IC.hammer}</span><span class="t"><b>RAGE ART · ${esc(sp.name)}</b><span>${esc(sp.desc)}</span></span></div>`;
    } else {
      const dNow = Math.round(gearDef(kind, id, lv1) * 100), dNext = Math.round(gearDef(kind, id, Math.min(max, lv1 + 1)) * 100);
      const hNow = gearHp(kind, id, lv1), hNext = gearHp(kind, id, Math.min(max, lv1 + 1));
      const pk = item.perks, perkTxt = Object.keys(pk).map(k => ({ blockRage: 'blocking builds double rage', speed: `${pk[k] > 0 ? '+' : ''}${Math.round(pk[k] * 100)}% speed`, rage: `+${Math.round(pk[k] * 100)}% rage gain`, stunRes: `${Math.round(pk[k] * 100)}% stun resist`, dash: `+${Math.round(pk[k] * 100)}% dash`, ammo: `+${pk[k]} kunai`, kunai: `+${Math.round(pk[k] * 100)}% kunai damage`, dmg: `+${Math.round(pk[k] * 100)}% damage` }[k])).join(' · ');
      const mob = Math.round(100 + (pk.speed || 0) * 100 * 3);
      statsHTML = stat('Defense', `${dNow}%`, dNow * 3.5, canUp ? dNext - dNow : 0, (dNext - dNow) * 3.5)
        + stat('Health', `+${hNow}`, hNow, canUp && hNext > hNow ? hNext - hNow : 0, hNext - hNow)
        + stat('Mobility', mob, mob - 30, 0, 0);
      if (perkTxt) box = `<div class="ar-box"><span class="ic">${W_IC.armor}</span><span class="t"><b>PERKS</b><span>${esc(perkTxt)}</span></span></div>`;
    }
    if (Logic.isLocked(save, kind, id)) box += `<div class="ar-box warn"><span class="ic">${ICON.lock}</span><span class="t"><b>LOCKED</b><span>${esc(Logic.lockHint(kind, id))}</span></span></div>`;
    let primary;
    if (!owned) {
      if (item.exclusive) primary = `<button class="ar-btn" disabled>Locked</button>`;
      else if (item.gems && item.price) primary = `<button class="ar-btn buy" data-a="buy" ${save.gems < item.gems || save.coins < item.price ? 'disabled' : ''}>Buy <b>${W_IC.coin}${fmt(item.price)}</b><b>${W_IC.jade}${item.gems}</b></button>`;
      else if (item.gems) primary = `<button class="ar-btn buy" data-a="buy" ${save.gems < item.gems ? 'disabled' : ''}>Buy <b>${W_IC.jade}${item.gems}</b></button>`;
      else primary = `<button class="ar-btn buy" data-a="buy" ${save.coins < item.price ? 'disabled' : ''}>Buy <b>${W_IC.coin}${fmt(item.price)}</b></button>`;
    } else if (lvl >= max) primary = `<button class="ar-btn" disabled>Mastered</button>`;
    else { const c = upgradeCost(kind, id, lvl); primary = `<button class="ar-btn buy" data-a="upgrade" ${save.coins < c ? 'disabled' : ''}>Upgrade <b>${W_IC.coin}${fmt(c)}</b></button>`; }
    const eqBtn = equipped ? `<button class="ar-btn gold" disabled>Equipped</button>` : `<button class="ar-btn equip" data-a="equip" ${owned ? '' : 'disabled'}>Equip</button>`;
    const kanji = kind === 'weapons' ? (WEAPON_KANJI[id] || '武器') : kind === 'helmets' ? '兜' : '鎧';
    const tier = Logic.itemTier(kind, id, lv1);
    if (kind === 'armors') {
      el.innerHTML = this.armorScreenHTML({ save, items, id, item, owned, lvl, max, equipped, statsHTML, box, primary, eqBtn, tier, lv1, soft });
      const paint = () => this.startArmorCards();
      if (soft) setTimeout(paint, 0); else this.afterShow = paint;
      return;
    }
    el.innerHTML = `<div class="w-scr"><div class="w-stage">
      <svg class="w-bd" viewBox="0 0 1600 900" aria-hidden="true"><defs>
        <linearGradient id="ar-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--th-sky1)"/><stop offset=".6" style="stop-color:var(--th-sky2)"/><stop offset="1" style="stop-color:var(--th-sky3)"/></linearGradient>
        <radialGradient id="ar-glow" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--th-acc);stop-opacity:.45"/><stop offset="1" style="stop-color:var(--th-acc);stop-opacity:0"/></radialGradient>
        <radialGradient id="ar-sun" cx=".42" cy=".38" r=".62"><stop offset="0" style="stop-color:var(--th-sun1)"/><stop offset=".7" style="stop-color:var(--th-deep)"/><stop offset="1" style="stop-color:var(--th-sun2)"/></radialGradient>
        <linearGradient id="ar-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ece5d3" stop-opacity="0"/><stop offset=".5" stop-color="#ece5d3" stop-opacity=".07"/><stop offset="1" stop-color="#ece5d3" stop-opacity="0"/></linearGradient></defs>
        <rect width="1600" height="900" fill="url(#ar-sky)"/><circle cx="500" cy="430" r="420" fill="url(#ar-glow)"/><circle cx="500" cy="430" r="270" fill="url(#ar-sun)"/>
        <circle cx="500" cy="430" r="300" fill="none" stroke="#c9a45c" stroke-opacity=".3" style="animation:wGlow 4s ease-in-out infinite"/>
        <path d="M0 640 L1000 200 L1000 330 L0 770Z" fill="url(#ar-beam)"/>
        <path d="M0 700 L160 650 L320 680 L480 630 L640 670 L820 640 L1000 670 L1000 900 L0 900Z" style="fill:color-mix(in srgb,var(--th-ground) 85%,#000)"/>
        <g style="fill:color-mix(in srgb,var(--th-ground) 65%,#000)"><rect x="20" y="96" width="12" height="804"/><rect x="46" y="96" width="9" height="804"/></g>
        <path d="M1000 110 C940 130 900 150 850 190" style="stroke:color-mix(in srgb,var(--th-ground) 85%,#000)" stroke-width="5" fill="none"/>
        <path d="M0 800 L1000 800 L1000 900 L0 900Z" style="fill:color-mix(in srgb,var(--th-ground) 45%,#000)"/>
        <ellipse cx="500" cy="770" rx="300" ry="20" fill="none" stroke="#ece5d3" stroke-opacity=".15"/>
      </svg>
      ${wLeaves('ar-leaf', [[960, 132, 1.5, 10], [930, 154, 1.2, -25], [890, 168, 1.3, 35], [856, 196, 1.1, -15], [984, 116, 1, 50]])}
      <span class="ar-kanji" aria-hidden="true">${kanji}</span>
      <canvas class="ar-prev" data-prev></canvas>
      <div class="w-top tall ar-top">
        <div class="grp">${wBack()}<span class="w-title">ARMORY</span></div>
        <div class="ar-tabs" role="tablist">${[['weapons', 'Weapons'], ['helmets', 'Helmets'], ['armors', 'Armor']].map(([k, l]) => `<button class="ar-tab ${k === kind ? 'on' : ''}" role="tab" aria-selected="${k === kind}" data-a="tab" data-tab="${k}"><span>${l}</span></button>`).join('')}</div>
        ${wPills()}
      </div>
      <div class="ar-det" key="${kind}:${id}">
        <div class="ar-rar tier-${tier}"><i></i><span>${esc(Logic.tierLabel(kind, id, lv1))}${kind === 'weapons' ? ` · ${esc(item.cls)}` : ''}</span></div>
        <div class="ar-name"><b>${esc(item.name)}</b>${kind === 'weapons' && WEAPON_KANJI[id] ? `<span>${WEAPON_KANJI[id]}</span>` : ''}</div>
        ${item.lore ? `<span class="ar-lore">${esc(item.lore)}</span>` : ''}
        ${item.desc ? `<span class="ar-desc">${esc(item.desc)}</span>` : ''}
        <div class="ar-lvl"><div class="hd"><div><span class="k">LEVEL</span>${equipped ? '<span class="eq">◆ EQUIPPED</span>' : ''}</div><span class="v">${owned ? `${lvl} / ${max}` : 'Not owned'}</span></div>
          <div class="ar-segs">${Array.from({ length: max }, (_, i) => `<i class="${i < lvl ? 'on' : i === lvl && owned ? 'next' : ''}"></i>`).join('')}</div></div>
        <div class="ar-stats">${statsHTML}</div>
        ${box}
      </div>
      <div class="ar-acts">${primary}${eqBtn}</div>
      <div class="ar-grid">${items.map((iid, i) => {
        const it = gearTable(kind)[iid], ow = save.owned[kind][iid], eq = save.equipped[eqKey] === iid;
        const art = kind === 'weapons' && weaponArt(iid) ? `<i class="art" style="background-image:url(${weaponArt(iid)})"></i>` : `<canvas class="art" data-icon="${iid}" data-kind="${kind}" data-owned="${ow ? 1 : 0}"></canvas>`;
        const label = ow ? `<span class="nm">${esc(it.name)}</span>` : it.exclusive ? `<span class="pr ex">${esc(Logic.tierLabel(kind, iid, 1))}</span>`
          : `<span class="pr ${it.gems ? 'gm' : ''}">${it.gems ? `${W_IC.jade}${it.gems}` : `${W_IC.coin}${fmt(it.price)}`}</span>`;
        return `<button class="ar-tile ${iid === id ? 'sel' : ''} ${ow ? '' : 'locked'}" data-a="tile" data-id="${iid}" style="animation-delay:${(i * 0.025).toFixed(3)}s" aria-label="${esc(it.name)}${ow ? '' : ', not owned'}">
          ${eq ? '<i class="eqd"></i>' : ''}${ow ? '' : `<span class="lk">${ICON.lock}</span>`}${art}${label}</button>`;
      }).join('')}</div>
    </div></div>`;
    const paint = () => {
      for (const cv of $$('#scr-armory canvas[data-icon]')) this.paintIcon(cv, cv.dataset.kind, cv.dataset.icon, cv.dataset.owned === '1');
      this.startPreview();
    };
    if (soft) setTimeout(paint, 0); else this.afterShow = paint;
  },
  /* The Armor tab, after the user's armory sheet: a moonlit torii backdrop, one row of tall cards (Kage alive in each
     armour, its name, a diamond in the armour's colour; a gold frame on the one selected), and the selected armour's
     details, perks and buttons under the row. Two chips switch the row between the armour line and the trophies. */
  armorScreenHTML(o) {
    const { save, items, id, item, owned, lvl, max, equipped, statsHTML, box, primary, eqBtn, tier, lv1, soft } = o;
    const line = this.armorLine(), nTr = Object.keys(ARMORS).filter(k => !ARMORS[k].enemy && ARMORS[k].tier === 'trophy').length;
    const hueOf = (it) => it.hue || (it.tier === 'trophy' ? '#e9c46a' : '#c9a45c');
    const cards = items.map((iid, i) => {
      const it = ARMORS[iid], ow = save.owned.armors[iid], eq = save.equipped.armor === iid;
      const tag = eq ? '<span class="tag eq">◆ Equipped</span>' : ow ? `<span class="tag lv">Lv ${ow}</span>`
        : it.exclusive ? `<span class="tag lk">${ICON.lock}</span>`
        : `<span class="tag pr">${it.price ? `${W_IC.coin}${fmt(it.price)}` : ''}${it.gems ? `${W_IC.jade}${it.gems}` : ''}</span>`;
      return `<button class="ar-card ${iid === id ? 'sel' : ''} ${ow ? '' : 'unowned'}" data-a="tile" data-id="${iid}" style="--hue:${hueOf(it)};${soft ? '' : `animation-delay:${(i * 0.05).toFixed(2)}s`}" aria-label="${esc(it.name)}${ow ? '' : ', not owned'}">
        <span class="cf" aria-hidden="true"></span><canvas class="cv" data-card="${iid}"></canvas>${tag}
        <span class="nm">${esc(it.name)}</span><span class="orn" aria-hidden="true"><i></i></span></button>`;
    }).join('');
    const ground = (k) => `style="fill:color-mix(in srgb,var(--th-ground) ${k}%,#000)"`;
    return `<div class="w-scr"><div class="w-stage ar-armor ${soft ? 'soft' : ''}">
      <svg class="w-bd" viewBox="0 0 1600 900" aria-hidden="true"><defs>
        <linearGradient id="al-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--th-sky1)"/><stop offset=".6" style="stop-color:var(--th-sky2)"/><stop offset="1" style="stop-color:var(--th-sky3)"/></linearGradient>
        <radialGradient id="al-glow" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--th-acc);stop-opacity:.5"/><stop offset="1" style="stop-color:var(--th-acc);stop-opacity:0"/></radialGradient>
        <radialGradient id="al-moon" cx=".45" cy=".4" r=".62"><stop offset="0" style="stop-color:var(--th-sun1)"/><stop offset=".72" style="stop-color:var(--th-acc)"/><stop offset="1" style="stop-color:var(--th-deep)"/></radialGradient></defs>
        <rect width="1600" height="900" fill="url(#al-sky)"/>
        <circle cx="800" cy="250" r="380" fill="url(#al-glow)"/><circle cx="800" cy="250" r="230" fill="url(#al-moon)" opacity=".92"/>
        <circle cx="800" cy="250" r="262" fill="none" stroke="#ece5d3" stroke-opacity=".12" style="animation:wGlow 4s ease-in-out infinite"/>
        <path d="M0 330 L130 270 L250 300 L420 220 L560 300 L700 280 L800 330 L930 270 L1080 300 L1220 230 L1380 290 L1600 250 L1600 900 L0 900Z" ${ground(55)} opacity=".8"/>
        <g ${ground(72)}>
          <path d="M702 112 Q800 96 898 112 L903 128 Q800 114 697 128Z"/><rect x="712" y="134" width="176" height="11"/>
          <rect x="736" y="124" width="13" height="196"/><rect x="851" y="124" width="13" height="196"/><rect x="794" y="134" width="12" height="24"/>
          <path d="M890 238 Q922 232 954 238 L956 244 Q922 239 888 244Z"/><rect x="898" y="244" width="6" height="66"/><rect x="940" y="244" width="6" height="66"/>
        </g>
        <path d="M0 312 C260 292 520 336 800 318 C1080 300 1340 330 1600 306 L1600 900 L0 900Z" ${ground(45)}/>
        <path d="M1600 92 C1540 102 1500 126 1440 140 C1400 150 1370 166 1330 190" ${ground(85).replace('fill', 'stroke')} stroke-width="5" fill="none"/>
        <path d="M1504 116 C1484 136 1474 148 1456 166" ${ground(85).replace('fill', 'stroke')} stroke-width="3" fill="none"/>
      </svg>
      ${wLeaves('al-leaf', [[1560, 100, 1.5, 10], [1520, 114, 1.2, -25], [1478, 130, 1.4, 35], [1440, 144, 1.1, -15], [1404, 158, 1.3, 50], [1366, 176, 1, 20], [1458, 168, 1, -40], [1338, 192, 1.2, 5]])}
      <span class="ar-kanji" aria-hidden="true">鎧</span>
      <div class="w-top tall ar-top">
        <div class="grp">${wBack()}<span class="w-title">ARMORY</span></div>
        <div class="ar-tabs" role="tablist">${[['weapons', 'Weapons'], ['helmets', 'Helmets'], ['armors', 'Armor']].map(([k, l]) => `<button class="ar-tab ${k === 'armors' ? 'on' : ''}" role="tab" aria-selected="${k === 'armors'}" data-a="tab" data-tab="${k}"><span>${l}</span></button>`).join('')}</div>
        ${wPills()}
      </div>
      <div class="al-chips" role="tablist">
        <button class="al-chip ${line === 'line' ? 'on' : ''}" data-a="arm-line" data-line="line" role="tab" aria-selected="${line === 'line'}">Armor line</button>
        <button class="al-chip ${line === 'trophy' ? 'on' : ''}" data-a="arm-line" data-line="trophy" role="tab" aria-selected="${line === 'trophy'}">Trophies <em>${nTr}</em></button>
      </div>
      <div class="al-row ${items.length > 8 ? 'scroll' : ''}">${cards}</div>
      <div class="al-det" key="armors:${id}" style="--hue:${hueOf(item)}">
        <div class="al-id">
          <div class="ar-rar tier-${tier}"><i></i><span>${esc(Logic.tierLabel('armors', id, lv1))}</span></div>
          <div class="ar-name"><b>${esc(item.name)}</b></div>
          ${item.lore ? `<span class="ar-lore">${esc(item.lore)}</span>` : ''}
        </div>
        <div class="al-mid"><div class="ar-stats">${statsHTML}</div></div>
      </div>
      <div class="al-side">
        <div class="ar-lvl"><div class="hd"><div><span class="k">LEVEL</span>${equipped ? '<span class="eq">◆ EQUIPPED</span>' : ''}</div><span class="v">${owned ? `${lvl} / ${max}` : 'Not owned'}</span></div>
          <div class="ar-segs">${Array.from({ length: max }, (_, i) => `<i class="${i < lvl ? 'on' : i === lvl && owned ? 'next' : ''}"></i>`).join('')}</div></div>
        ${box || `<div class="ar-box"><span class="ic">${W_IC.armor}</span><span class="t"><b>PERKS</b><span>None: the plain coat he left home in</span></span></div>`}
        <div class="ar-acts">${primary}${eqBtn}</div>
      </div>
    </div></div>`;
  },
  // the cards' live figures: one loop draws every card, Kage in that armour breathing in his guard, his coat and scarf
  // moving, its glow playing. Each card keeps its fighter across re-renders, so picking a card does not restart them.
  startArmorCards() {
    cancelAnimationFrame(this.armRAF);
    const save = SaveManager.data, cache = this._armCards || (this._armCards = {}), list = [];
    for (const cv of $$('#scr-armory canvas[data-card]')) {
      const id = cv.dataset.card;
      let f = cache[id];
      if (!f || f._wpn !== save.equipped.weapon) {
        f = cache[id] = makePlayerFighter(save, { armor: id, helmet: 'shiro_maki' });
        f._wpn = save.equipped.weapon; poseFighter(f, null, 40);
      }
      list.push({ cv, f });
    }
    let last = performance.now();
    const loop = (now) => {
      if (this.current !== 'armory' || this.armTab !== 'armors' || !list.length || !list[0].cv.isConnected) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      for (const { cv, f } of list) {
        f.time += dt; f.updatePose(dt); f.computeSkeleton(); f.updateCloth(dt);
        const { g, w, h } = prepCanvas(cv), sc = h * 0.86 / f.height();
        g.save(); g.translate(w * 0.54, h * 0.985); g.scale(sc, sc); g.translate(-f.x, 0);
        f.draw(g, { shadow: false, rim: 'rgba(236,229,211,0.55)', light: { x: 0.55, y: -0.83 } });
        g.restore();
      }
      this.armRAF = requestAnimationFrame(loop);
    };
    this.armRAF = requestAnimationFrame(loop);
  },
  paintIcon(cv, kind, id, owned) {
    if (kind === 'weapons') { drawWeaponIcon(cv, id, owned ? null : C.ash); return; }
    const f = makePlayerFighter(SaveManager.data, { helmet: kind === 'helmets' ? id : 'shiro_maki', armor: kind === 'armors' ? id : 'tachibana_yoroi', weapon: 'fists', scarf: false });
    poseFighter(f, null, 20);
    if (kind === 'helmets') {
      const { g, w, h } = prepCanvas(cv);
      const r = h * 0.2;
      g.save(); g.translate(w / 2, h * 0.62); drawAnimeHead(g, r, owned ? '#2a2620' : '#1a1814');
      drawHelmet(g, gearLook('helmets', id), r, owned ? '#2a2620' : '#1a1814', {}, f);
      g.restore();
    } else drawFighterInto(cv, f, { fit: 1.2, tall: 1.05, color: owned ? null : '#1a1814', rim: owned ? 'rgba(236,229,211,0.25)' : null, ground: 1.15 });
  },
  startPreview() {
    cancelAnimationFrame(this.armRAF);
    const cv = $('#scr-armory canvas[data-prev]'); if (!cv) return;
    const kind = this.armTab, id = this.armSel, save = SaveManager.data;
    const f = makePlayerFighter(save, kind === 'weapons' ? { weapon: id } : kind === 'helmets' ? { helmet: id } : { armor: id });
    poseFighter(f, null, 30);
    const ghost = makePlayerFighter(save, { weapon: 'fists', scarf: false, helmet: 'shiro_maki', armor: 'tachibana_yoroi' }); poseFighter(ghost, 'taunt', 30);
    let t0 = performance.now();
    const loop = (now) => {
      if (this.current !== 'armory' || !cv.isConnected) return;
      const t = (now - t0) / 1000;
      const { g, w, h } = prepCanvas(cv);
      if (kind === 'weapons') {
        // ghost warrior (faint, over the Wonder backdrop's sun) + the weapon illustration slowly turning
        const sc = h * 0.95 / ghost.height();
        g.save(); g.globalAlpha = 0.32; g.translate(w * 0.42, h * 0.99); g.scale(sc, sc); g.translate(-ghost.x, 0); ghost.draw(g, { color: '#1d0c0a', shadow: false }); g.restore();
        const L = Math.min(w * 0.78, (WEAPONS[id].len || 80) * 4.1), ang = -0.48 + Math.sin(t * 0.9) * 0.08;
        const sx = Math.cos(t * 0.7) * 0.25 + 0.75;
        g.save(); g.translate(w * 0.5 - L * 0.42 * Math.cos(ang), h * 0.5 - L * 0.42 * Math.sin(ang) + Math.sin(t * 1.3) * 6); g.rotate(ang); g.scale(1, sx);
        const sh = SHAPE[id];
        if (sh === 'short') { g.save(); g.translate(0, 18); drawWeaponShape(g, twinShape(WEAPONS[id], sh, 0), L * 0.82, 'art', 3, C.ink); g.restore(); g.save(); g.translate(30, -30); g.rotate(0.25); drawWeaponShape(g, twinShape(WEAPONS[id], sh, 1), L * 0.82, 'art', 3, C.ink); g.restore(); }
        else drawWeaponShape(g, twinShape(WEAPONS[id], sh, 0), L, 'art', 3, C.ink, f);
        g.restore();
        g.globalCompositeOperation = 'lighter';
        const sp = (t * 0.35) % 1; const sg = g.createLinearGradient(w * (sp - 0.2), 0, w * sp, h); sg.addColorStop(0, 'rgba(236,229,211,0)'); sg.addColorStop(0.5, 'rgba(236,229,211,0.05)'); sg.addColorStop(1, 'rgba(236,229,211,0)');
        g.fillStyle = sg; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over';
      } else {
        f.time = t; f.updatePose(1 / 60); f.computeSkeleton(); f.updateCloth(1 / 60);
        const sc = h * (kind === 'helmets' ? 1.5 : 0.95) / f.height();
        g.save(); g.translate(w * 0.48, kind === 'helmets' ? h * 1.85 : h * 0.98); g.scale(sc, sc); g.translate(-f.x, 0);
        f.draw(g, { shadow: false, rim: 'rgba(236,229,211,0.7)', light: { x: 0.55, y: -0.83 } });
        g.restore();
      }
      this.armRAF = requestAnimationFrame(loop);
    };
    this.armRAF = requestAnimationFrame(loop);
  },
  buy() {
    const kind = this.armTab, id = this.armSel;
    if (!Logic.buyItem(SaveManager.data, kind, id)) return;
    SaveManager.save();
    AudioManager.play('unlock'); this.toast('Acquired', gearTable(kind)[id].name); this.renderArmory(true);
  },
  upgrade() {
    const kind = this.armTab, id = this.armSel;
    if (!Logic.upgradeItem(SaveManager.data, kind, id)) return;
    SaveManager.save();
    AudioManager.play('coin'); AudioManager.play('clang', { pitch: 1.3 });
    this.toast(`Level ${SaveManager.data.owned[kind][id]}`, `${gearTable(kind)[id].name} tempered`); this.renderArmory(true);
  },
  equip() {
    if (!Logic.equipItem(SaveManager.data, this.armTab, this.armSel)) return;
    SaveManager.save();
    AudioManager.play('clang', { pitch: 1.1 }); this.renderArmory(true);
  },

  /* ---------------- pre-fight ---------------- */
  preparePrefight(cfg) {
    this.pfCfg = cfg; this.pfWeapon = SaveManager.data.equipped.weapon; this._pfScroll = null;
    AudioManager.setMusic('menu');
    this.renderPrefight();
  },
  renderPrefight() {
    const save = SaveManager.data, cfg = this.pfCfg, d = ENEMIES[cfg.enemyId], el = $('#scr-prefight');
    // the Interlude spar: young Kage with a bokken; the player's gear and weapon choice don't apply (Logic.youngKage)
    const spar = !!(cfg.format && cfg.format.name === 'spar');
    const player = spar ? makeYoungKage({ x: -205 }) : makePlayerFighter(save, { x: -205, weapon: this.pfWeapon || save.equipped.weapon });
    const enemy = makeFighterFromEnemy(cfg.enemyId, { x: 205 });
    poseFighter(player, null, 40); poseFighter(enemy, 'taunt', 40);
    const env = cfg.env;
    const fitZoom = Math.min(1.55, (H * 0.6) / (Math.max(player.height(), enemy.height()) * 1.18));
    Game.setTableau(env, { memory: spar, fighters: [player, enemy], zoom: fitZoom, ground: 612, grade: spar ? null : 'rgba(160,32,30,0.85)', lights: [{ x: 330, y: 470, r: 360, c: 'rgba(201,164,92,0.18)' }, { x: 960, y: 450, r: 400, c: 'rgba(163,48,42,0.32)' }] });
    const dl = clamp((cfg.mode === 'campaign' ? cfg.diff : 2) + (cfg.ng || 0) + (d.type === 'boss' ? 1 : 0), 0, 4);
    const foeName = cfg.foeName || d.name, foeTitle = cfg.foeTitle || d.title;
    const owned = spar ? [] : Object.keys(save.owned.weapons).filter(w => WEAPONS[w] && !WEAPONS[w].enemy);
    // Prepare for Battle is always the crimson screen, whatever the act or the foe
    ActTheme.set('raikon');
    // Wonder "Pre Fight Screen" over the live tableau: the canvas draws the arena and both fighters (x = -205 / 205 on a
    // ground at 612, scaled by fitZoom about the canvas centre); the design stage is the canvas x 1.25
    const fx = 205 * fitZoom * 1.25, rw = Math.max(300, Math.min(480, 240 * fitZoom * 1.25));
    const foeCol = '';
    const kindLabel = cfg.stretch ? 'Stretch' : d.type === 'boss' ? 'Boss' : d.type === 'sub' ? 'Sub-boss' : d.type === 'echo' ? 'Echo' : 'Duelist';
    const eyebrow = cfg.mode === 'trials' ? `Echo Trials · Wave ${ROMAN[cfg.wave - 1] || cfg.wave} · ${DIFF_LABEL[dl]}`
      : spar ? 'Memory spar · no winner' : `${cfg.chapter ? `${Logic.chapter(cfg.chapter).name} · ` : ''}${kindLabel} · ${DIFF_LABEL[dl]}`;
    const title = cfg.stretch && cfg.stageId ? Logic.stage(cfg.stageId).name : foeName;
    const sub = cfg.stretch && cfg.chapter ? Logic.chapter(cfg.chapter).place : foeTitle;
    const reward = cfg.mode === 'campaign' && cfg.stageId ? Logic.stageRewardPreview(save, cfg.stageId) : null;
    let intel = '';
    if (cfg.stretch) {
      const e = cfg.stretch.encounters.length;
      intel = `<div class="w-chip">${W_IC.skull}<span class="v">${e} encounter${e === 1 ? '' : 's'}</span></div>
        <div class="w-chip"><span class="k">Clues</span><span class="v">${Logic.cluesFound(save, cfg.stageId).length} / ${cfg.stretch.clues.length}</span></div>`;
    } else intel = `<div class="w-chip">${W_IC.skull}<span class="v">${esc(kindLabel)}</span></div>`;
    if (reward) intel += `<div class="w-chip gold">${W_IC.coin}<span class="v">+${reward.coins}</span></div>`;
    const lit = Math.min(3, Math.max(1, dl));
    // Kage's loadout as label-over-value cells in one even row, so every value reads at a glance
    const cell = (k, v, extra) => `<div class="pf-cell" ${extra || ''}><span class="k">${k}</span><span class="v">${esc(v)}</span></div>`;
    const mode = Logic.difficulty(save.difficulty).label;
    const chips = spar
      ? cell('Clothes', 'Training') + cell('Blade', 'Bokken') + cell('Mode', mode, 'data-mode-chip')
      : cell('Helm', HELMETS[save.equipped.helmet].name) + cell('Armor', ARMORS[save.equipped.armor].name) + cell('Mode', mode, 'data-mode-chip')
        + `<button class="pf-gear" data-a="pf-gear">${W_IC.armor}<span>Change gear</span></button>`;
    el.innerHTML = `<div class="w-scr" ${foeCol ? `style="--foe:${foeCol}"` : ''}><div class="w-stage">
      <i class="pf-vign"></i><i class="pf-tint"></i><i class="pf-axis"></i>
      <i class="pf-ripple" style="left:${(800 - fx - rw / 2).toFixed(0)}px;width:${rw.toFixed(0)}px"></i>
      <i class="pf-ripple foe" style="left:${(800 + fx - rw / 2).toFixed(0)}px;width:${rw.toFixed(0)}px"></i>
      <div class="pf-vs" aria-hidden="true"><span>対</span></div>
      <div class="w-top pf-top"><div class="grp">${wBack()}<span class="w-eye">PREPARE FOR BATTLE</span></div>${wPills()}</div>
      <div class="pf-me">
        <div class="pf-id"><span class="nm">${spar ? 'YOUNG KAGE' : 'KAGE'}</span>
          <div class="pf-stats">${spar ? '<div class="st"><b>Memory</b></div>' : `<div class="st"><span class="k">LV</span><b>${save.level}</b></div>`}
            <div class="st pf-life"><span class="k">HP</span><b>${spar ? Logic.youngKage(save).hp : playerMaxHp(save)}</b></div></div></div>
        <div class="pf-loadout">${chips}</div>
      </div>
      <div class="pf-foe">
        <div class="ey"><span class="w-pips">${[0, 1, 2].map(k => `<i class="${k < lit ? 'on' : ''}"></i>`).join('')}</span><span>${esc(eyebrow)}</span></div>
        <span class="ttl">${esc(title)}</span>
        <span class="sub">${esc(sub || '')}</span>
        <div class="pf-chips">${intel}</div>
      </div>
      <div class="pf-plate" style="left:${Math.min(1420, 800 + fx + 30).toFixed(0)}px"><i></i><b>${esc(d.name)}</b></div>
      <div class="pf-dock">
        <div class="pf-pick" ${spar ? 'style="visibility:hidden"' : ''}><span>CHOOSE WEAPON <em>${owned.length}</em></span>
          <div class="pf-wrow">
            <button class="pf-arr l" data-dir="-1" aria-label="Previous weapons">${ICON.back}</button>
            <div class="pf-weps">${owned.map(w => `<button class="w-wcard ${w === this.pfWeapon ? 'sel' : ''}" data-a="pf-weapon" data-id="${w}" aria-label="${esc(WEAPONS[w].name)}">${wArt(w, true)}<span class="nm">${esc(WEAPONS[w].name)}</span></button>`).join('')}</div>
            <button class="pf-arr r" data-dir="1" aria-label="More weapons">${ICON.back}</button>
          </div>
        </div>
        <button class="w-brush pf-fight" data-a="pf-fight" data-focus><span class="kj">戦</span><span class="lb">FIGHT</span></button>
      </div>
    </div></div>`;
    // the weapon row scrolls: arrows, the mouse wheel, drag/swipe; it keeps its place when a pick re-renders the screen
    const row = $('#scr-prefight .pf-weps'), keep = this._pfScroll;
    if (row) {
      const arrows = $$('#scr-prefight .pf-arr');
      const sync = () => {
        const max = row.scrollWidth - row.clientWidth;
        this._pfScroll = row.scrollLeft;
        arrows.forEach(b => b.classList.toggle('off', max <= 2 || (+b.dataset.dir < 0 ? row.scrollLeft <= 2 : row.scrollLeft >= max - 2)));
        row.classList.toggle('fade-l', row.scrollLeft > 2); row.classList.toggle('fade-r', row.scrollLeft < max - 2);
      };
      arrows.forEach(b => b.addEventListener('click', e => { e.stopPropagation(); row.scrollBy({ left: +b.dataset.dir * row.clientWidth * 0.7, behavior: 'smooth' }); }));
      row.addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); row.scrollBy({ left: e.deltaY, behavior: 'auto' }); } }, { passive: false });
      row.addEventListener('scroll', sync, { passive: true });
      const fit = () => {
        if (keep != null) row.scrollLeft = keep;
        const sel = row.querySelector('.sel');
        if (sel && (sel.offsetLeft < row.scrollLeft || sel.offsetLeft + sel.offsetWidth > row.scrollLeft + row.clientWidth)) row.scrollLeft = sel.offsetLeft - 24;
        sync();
      };
      requestAnimationFrame(fit);
    }
    const paint = () => { for (const cv of $$('#scr-prefight canvas[data-w]')) drawWeaponIcon(cv, cv.dataset.w); const r = $('#scr-prefight .pf-weps'); if (r) r.dispatchEvent(new Event('scroll')); };
    if (this.current === 'prefight') setTimeout(paint, 0); else this.afterShow = paint;
  },

  /* ---------------- HUD ---------------- */
  showHud(s) {
    // a stretch has no single opponent: no foe portrait, boss bar or round clock; foes carry their own small bars
    // (drawn on the canvas) and the top of the screen shows the road's progress instead
    const el = $('#scr-hud'), e = s.enemy, stretch = !!s.isStretch, bossy = !!e && e.def.type !== 'regular';
    if (s.cfg && s.cfg.stageId && Logic.stage(s.cfg.stageId)) ActTheme.set(ActTheme.forStage(s.cfg.stageId));
    // story bosses (Logic.fightFormat 'boss'): one round and no clock, so neither the clock nor the round pips show
    const clockless = stretch || !!(s.format && !s.format.timer);
    el.innerHTML = `
      <div class="fp left" data-pp>
        <div class="medal"><canvas data-portrait="p"></canvas></div>
        <div class="fp-body">
          <div class="fp-name"><b>${s.spar ? 'Young Kage' : 'Kage'}</b><span>${s.spar ? 'Memory' : `Lv ${SaveManager.data.level}`}</span></div>
          <div class="hbar"><div class="hbar-in"><i class="hb-chip"></i><i class="hb-fill"></i><i class="hb-gloss"></i></div><span class="hb-val" data-php></span></div>
          <div class="rbar" data-rage><span class="rb-ic">怒</span><div class="rbar-in"><i class="rb-fill"></i></div><span class="rb-ready">Rage ready</span><span class="kunai" data-kunai></span></div>
        </div>
      </div>
      <div class="fp right ${bossy || stretch ? 'gone' : ''}" data-ep>
        <div class="medal enemy"><canvas data-portrait="e"></canvas></div>
        <div class="fp-body">
          <div class="fp-name"><b data-ename></b><span data-etitle></span></div>
          <div class="hbar"><div class="hbar-in"><i class="hb-chip"></i><i class="hb-fill"></i><i class="hb-gloss"></i></div><span class="hb-val" data-ehp></span></div>
        </div>
      </div>
      <div class="boss-bar ${bossy ? '' : 'gone'}" data-boss>
        ${bossArtHTML(null, null, '').replace('class="bb-art', 'data-bart class="bb-art')}
        <div class="bb-top"><span class="bb-phases" data-phases></span><span class="bb-title" data-btitle></span></div>
        <b class="bb-name" data-bname></b>
        <div class="bb-track"><i class="hb-chip"></i><i class="hb-fill"></i><i class="hb-gloss"></i><span data-bdivs></span></div>
      </div>
      <div class="wit-plate gone" data-wplate aria-hidden="true">
        <div class="wp-title"><span class="wp-the">The</span><b>Witness<i class="wp-slash"></i></b></div>
        <div class="wp-sub">Architect of Echoes</div>
        <div class="wp-phase"><span data-wpnum>Phase I</span></div>
        <div class="wp-name" data-wpname>The Observer</div>
        <div class="wp-orn"><i></i><b></b><b class="big"></b><b></b><i></i></div>
      </div>
      <div class="wit-mods" data-wmods aria-live="polite"></div>
      <div class="clock ${clockless ? 'gone' : ''}"><b data-timer>--</b><div class="round-pips" data-pips></div></div>
      <div class="hud-road ${stretch ? '' : 'gone'}" data-road><div class="rd-track"><i class="rd-fill"></i><span data-rdmarks></span><b class="rd-kage"></b></div><div class="rd-info" data-rdinfo></div></div>
      <button class="hud-btn hud-pause" data-a="pause" aria-label="Pause">${ICON.pause}</button>
      <div class="hud-wave" data-wave></div>
      <div class="combo" data-combo><b>0</b><span>Hits</span></div>
      <div class="dialogue" data-dlg><div class="who"></div><div class="line"></div><img class="dlg-face" alt="" draggable="false"></div>
      <div class="skip-hint" data-skip>Press J or tap to skip</div>`;
    this.hud.reset();
    this.updateTouch();
    setTimeout(() => this.hud.portraits(s), 0);
  },
  hud: {
    cache: {}, el: null, bars: null, last: 0,
    reset() { this.cache = {}; this.el = null; this.bars = { p: { v: 1, chip: 1, delay: 0, target: 1 }, e: { v: 1, chip: 1, delay: 0, target: 1 } }; this.last = performance.now(); this.lastHurt = { p: 0, e: 0 }; },
    q() {
      if (this.el) return this.el;
      const r = $('#scr-hud');
      const bar = (root) => root ? { fill: $('.hb-fill', root), chip: $('.hb-chip', root) } : null;
      this.el = {
        pp: $('[data-pp]', r), ep: $('[data-ep]', r), boss: $('[data-boss]', r),
        php: $('[data-php]', r), ehp: $('[data-ehp]', r), rage: $('[data-rage]', r), rageFill: $('.rb-fill', r), kunai: $('[data-kunai]', r),
        ename: $('[data-ename]', r), etitle: $('[data-etitle]', r), bname: $('[data-bname]', r), btitle: $('[data-btitle]', r), bdivs: $('[data-bdivs]', r), bart: $('[data-bart]', r),
        road: $('[data-road]', r), rdFill: $('.rd-fill', r), rdKage: $('.rd-kage', r), rdMarks: $('[data-rdmarks]', r), rdInfo: $('[data-rdinfo]', r),
        phases: $('[data-phases]', r), timer: $('[data-timer]', r), pips: $('[data-pips]', r), combo: $('[data-combo]', r), dlg: $('[data-dlg]', r), skip: $('[data-skip]', r), wave: $('[data-wave]', r),
        pBar: bar($('[data-pp] .hbar-in', r)), eBar: bar($('[data-ep] .hbar-in', r)), bBar: bar($('[data-boss] .bb-track', r)),
        wplate: $('[data-wplate]', r), wpnum: $('[data-wpnum]', r), wpname: $('[data-wpname]', r), wmods: $('[data-wmods]', r)
      };
      return this.el;
    },
    set(k, v, fn) { if (this.cache[k] !== v) { this.cache[k] = v; fn(v); } },
    // the boss bar's portrait card: the boss's front-view key art (BOSS_ART), tinted in its accent; a Core echo
    // (`echoOf`) shows its original's art as a violet, glitching memory. Bosses without art have no card.
    bossArt(e, en) {
      const a = e.bart; if (!a) return;
      const art = en && bossArtFor(en.def);
      a.classList.toggle('gone', !art); e.boss.classList.toggle('has-art', !!art);
      if (!art) return;
      const img = $('.bba-img', a); if (img.getAttribute('src') !== art.src) img.setAttribute('src', art.src);
      a.dataset.who = art.id; a.classList.toggle('echo', art.echo); a.classList.remove('low', 'phase');
      a.style.setProperty('--bb-acc', art.echo ? '#9b8cff' : (en.def.accent || '#c8232f'));
    },
    portraits(s) {
      const pc = $('#scr-hud canvas[data-portrait="p"]'), ec = $('#scr-hud canvas[data-portrait="e"]');
      if (pc) drawPortrait(pc, s.player, false);
      if (ec && s.enemy) drawPortrait(ec, s.enemy, true);
    },
    // smooth drain: the fill eases to the new value, the bone chip waits, then follows
    // o (optional): { delay, fill, chip } for a slower bar (the Witness's long fight)
    animBar(b, ratio, dt, els, side, o) {
      if (ratio < b.target - 0.001) { b.delay = o ? o.delay : 0.45; this.hurt(side, Math.round((b.target - ratio) * 1000)); }
      if (ratio > b.target) b.chip = Math.max(b.chip, ratio);
      b.target = ratio;
      b.v = damp(b.v, ratio, o ? o.fill : 16, dt);
      if (b.delay > 0) b.delay -= dt; else b.chip = damp(b.chip, b.v, o ? o.chip : 5, dt);
      b.chip = Math.max(b.chip, b.v);
      if (!els) return;
      els.fill.style.width = (b.v * 100).toFixed(2) + '%';
      els.chip.style.width = (b.chip * 100).toFixed(2) + '%';
    },
    hurt(side, amount) {
      const e = this.q(), now = performance.now();
      const panel = side === 'p' ? e.pp : (e.boss && !e.boss.classList.contains('gone') ? e.boss : e.ep);
      if (!panel || now - this.lastHurt[side] < 90) return;
      this.lastHurt[side] = now;
      panel.classList.remove('hurt'); void panel.offsetWidth; panel.classList.add('hurt');
    },
    update(s) {
      if (UIManager.current !== 'hud') return;
      const e = this.q(), p = s.player, en = s.enemy;
      const now = performance.now(), dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
      // the Witness's HUD presentation layer (69-witness.js): what to show, including its false readings; the real
      // health and rage are only ever read here
      const wv = typeof WitnessHUD !== 'undefined' ? WitnessHUD.view(s) : null, lie = wv && wv.lie;
      if (wv || this.cache.wit) this.updateWitness(s, e, wv);
      if (en) this.updateFoe(s, e, en, dt, wv);
      else if (s.isStretch) this.updateRoad(s, e);
      this.animBar(this.bars.p, lie && lie.p != null ? lie.p : clamp(p.hp / p.maxHp, 0, 1), dt, e.pBar, 'p');
      this.set('plow', p.hp < p.maxHp * 0.25, v => e.pp.classList.toggle('low', v));
      this.set('phpv', lie && lie.garble ? -1 : Math.ceil(Math.max(0, p.hp)), v => e.php.textContent = v < 0 ? '???' : v);
      const rage = Math.round(p.rage);
      this.set('rage', rage, v => {
        e.rageFill.style.width = clamp(v, 0, 100) + '%';
        const full = v >= 100, was = e.rage.classList.contains('full');
        e.rage.classList.toggle('full', full);
        if (full && !was) { AudioManager.play('unlock'); s.fx.popText(p, 'RAGE READY · I', C.gold); }
        const tb = $('#touch .tb.rage'); if (tb) tb.classList.toggle('ready', full);
      });
      this.set('kunai', p.ammo, v => { e.kunai.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 21 L14 10 M14 10 L21 3 L18 11 Z" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linejoin="round"/></svg>${v}`; const k = $('#touch [data-ammo]'); if (k) k.textContent = v; });
      this.set('wave', s.mode === 'trials' ? `${s.wave}-${s.trialCoins}` : s.mode === 'bossrush' ? 'br' + s.rushLabel() : '', () => { e.wave.innerHTML = s.mode === 'trials' ? `<span>Wave ${s.wave}</span><span class="wv-c"><i class="coin"></i>${s.trialCoins}</span><span class="muted">Best ${SaveManager.data.trialsBest}</span>`
        : s.mode === 'bossrush' ? `<span>Boss Rush</span><span>${esc(s.rushLabel())}</span><span class="muted">Best ${SaveManager.data.bossRushBest.bosses}</span>` : ''; });
      this.set('combo', s.combo >= 2 ? s.combo : 0, v => { e.combo.classList.toggle('on', v >= 2); if (v >= 2) { e.combo.firstChild.textContent = v; e.combo.classList.remove('bump'); void e.combo.offsetWidth; e.combo.classList.add('bump'); } });
      const dl = s.dialogue;
      this.set('dlg', dl ? dl.text : '', () => {
        e.dlg.classList.toggle('on', !!dl);
        if (!dl) return;
        e.dlg.children[0].textContent = `${dl.name} · ${dl.title}`; e.dlg.children[1].textContent = dl.text;
        // a boss (or its Core echo) speaks with its painted face
        const d = dl.id && ENEMIES[dl.id], img = speakerFace(dl.id) || (d && d.echoOf ? speakerFace(d.echoOf) : null), fc = e.dlg.children[2];
        e.dlg.classList.toggle('has-face', !!img); if (img) { fc.src = img.src; fc.classList.toggle('echo', !speakerFace(dl.id)); }
      });
      this.set('skip', s.phase === 'intro' || s.phase === 'outro', v => e.skip.style.display = v ? 'block' : 'none');
    },
    // arena: the opponent's panel or boss bar, its phases, the round clock and pips
    updateFoe(s, e, en, dt, wv) {
      const bossy = en.def.type !== 'regular';
      this.set('who', en.uid, () => {
        e.ename.textContent = en.name; e.etitle.textContent = en.title; e.bname.textContent = en.name; e.btitle.textContent = en.title;
        e.ep.classList.toggle('gone', bossy); e.boss.classList.toggle('gone', !bossy);
        // one divider on the bar at each phase threshold (Logic.bossPhases)
        e.bdivs.innerHTML = en.ai && en.ai.phases ? Logic.bossPhases(en.def.id).slice(1).map(p => `<i class="bb-div" style="left:${(p.at * 100).toFixed(1)}%"></i>`).join('') : '';
        this.bars.e = { v: 1, chip: 1, delay: 0, target: clamp(en.hp / en.maxHp, 0, 1) };
        const ec = $('#scr-hud canvas[data-portrait="e"]'); if (ec && ec.clientWidth) drawPortrait(ec, en, true);
        this.bossArt(e, bossy ? en : null);
      });
      this.animBar(this.bars.e, wv && wv.lie && wv.lie.e != null ? wv.lie.e : clamp(en.hp / en.maxHp, 0, 1), dt, bossy ? e.bBar : e.eBar, 'e', wv ? { delay: 1.1, fill: 5, chip: 1.4 } : null);
      // the Witness's card changes with its phase (cut from the user's reference sheets)
      if (wv) this.set('wart', wv.look, v => { const img = e.bart && $('.bba-img', e.bart), src = WITNESS_ART[v]; if (img && typeof src === 'string' && src.startsWith('data:')) img.setAttribute('src', src); });
      this.set('ehpv', Math.ceil(Math.max(0, en.hp)), v => e.ehp.textContent = v);
      this.set('blow', bossy && en.hp < en.maxHp * 0.25, v => e.bart.classList.toggle('low', v));
      const ph = en.ai && en.ai.phases ? en.ai.phase : -1;
      // a new phase (not the first) shakes the portrait with a glitch
      const pk = ph + ':' + en.uid;
      if (this.cache.phase !== pk && ph > 0 && this.cache.phase && this.cache.phase.endsWith(':' + en.uid)) { const a = e.bart; a.classList.remove('phase'); void a.offsetWidth; a.classList.add('phase'); }
      this.set('phase', pk, () => { e.phases.innerHTML = ph < 0 ? '' : Logic.bossPhases(en.def.id).map((_, i) => i).map(i => `<i class="${i < ph ? 'done' : i === ph ? 'on' : ''}"></i>`).join('') + `<em>Phase ${ROMAN[ph]}</em>`; });
      this.set('timer', Math.max(0, Math.ceil(s.timer)), v => { e.timer.textContent = v; e.timer.classList.toggle('urgent', v <= 10); });
      // Echo Trials changes format per wave: a boss echo has no clock (Logic.fightFormat)
      if (!s.isStretch) this.set('clock', !!(s.format && s.format.timer), v => { const c = e.timer.closest('.clock'); if (c) c.classList.toggle('gone', !v); });
      const n = s.roundsToWin * 2 - 1;
      this.set('pips', `${s.rounds.p}-${s.rounds.e}-${n}`, () => { const arr = []; for (let i = 0; i < s.rounds.p; i++) arr.push('p'); for (let i = 0; i < s.rounds.e; i++) arr.push('e'); while (arr.length < n) arr.push(''); e.pips.innerHTML = arr.map(c => `<i class="${c}"></i>`).join(''); });
    },
    // the Witness: its plate (the reference sheets' title block), the phase styling of the whole HUD (stable blue,
    // segmented and flickering blue, glitching violet, fractured magenta), the input modifiers and locked abilities, the
    // rage lock, and the glitch while its HUD lies
    updateWitness(s, e, wv) {
      const r = $('#scr-hud');
      this.set('wit', wv ? wv.cls : '', v => { r.classList.remove('wit', 'wit-p1', 'wit-p2', 'wit-p3', 'wit-p4'); if (v) r.classList.add('wit', v); e.wplate.classList.toggle('gone', !v); });
      if (!wv) { this.set('wmods', '', () => { e.wmods.innerHTML = ''; }); return; }
      this.set('wpn', wv.look, () => { e.wpnum.textContent = 'Phase ' + wv.numeral; e.wpname.textContent = wv.name; e.wplate.classList.remove('shift'); void e.wplate.offsetWidth; e.wplate.classList.add('shift'); });
      this.set('wglitch', !!(wv.glitch > 0 || wv.lie || wv.fake), v => r.classList.toggle('wit-glitch', v));
      this.set('wrage', wv.rageLock, v => e.rage.classList.toggle('locked', v));
      const LOCKS = ['dash', 'jump', 'block', 'special'], anyLock = LOCKS.some(k => wv.locks[k]) || wv.mods.some(m => m.kind === 'lock');
      const key = wv.mods.map(m => m.kind + ':' + m.label + (m.warn ? ':w' : '')).join('|') + '/' + LOCKS.filter(k => wv.locks[k]).join(',') + (wv.rageLock ? '/R' : '');
      this.set('wmods', key, () => {
        const chips = wv.mods.filter(m => m.kind !== 'lock').map(m => `<span class="wm ${m.warn ? 'warn' : 'on'}">${esc(m.label)}</span>`);
        if (wv.rageLock) chips.push('<span class="wm on rage">Rage sealed</span>');
        const locks = anyLock ? `<div class="wl-row">${LOCKS.map(k => `<span class="wl ${wv.locks[k] ? 'off' : ''} ${wv.mods.some(m => m.kind === 'lock' && m.label.toLowerCase().includes(k) && m.warn) ? 'next' : ''}">${k}</span>`).join('')}</div>` : '';
        e.wmods.innerHTML = chips.join('') + locks;
      });
    },
    // stretch: how far along the road Kage is, the encounter and clue marks on it, and the foes left in a fight
    updateRoad(s, e) {
      const L = s.stretch, k = clamp(s.player.x / L.length, 0, 1);
      this.set('road', Math.round(k * 400), () => { e.rdFill.style.width = (k * 100).toFixed(2) + '%'; e.rdKage.style.left = (k * 100).toFixed(2) + '%'; });
      const found = s.clues.filter(c => c.found).length;
      this.set('rdmarks', `${s.cleared}:${found}`, () => {
        e.rdMarks.innerHTML = L.encounters.map((en, i) => `<i class="rd-enc ${i < s.cleared ? 'done' : ''}" style="left:${(en.x / L.length * 100).toFixed(2)}%"></i>`).join('') +
          s.clues.map(c => `<i class="rd-clue ${c.found ? 'done' : ''}" style="left:${(c.x / L.length * 100).toFixed(2)}%"></i>`).join('');
      });
      const enc = s.encounter;
      const info = enc ? `Foes ${s.liveFoes()} · Wave ${Math.max(1, enc.wave + 1)}/${L.encounters[enc.i].waves.length}` : s.cleared >= L.encounters.length ? 'The road is open' : `Encounters ${s.cleared}/${L.encounters.length}`;
      this.set('rdinfo', `${info}|${found}`, () => { e.rdInfo.innerHTML = `<span>${esc(info)}</span><span class="rd-c">Clues ${found}/${s.clues.length}</span>`; });
    }
  },

  /* ---------------- results ---------------- */
  showResult(r) {
    const save = SaveManager.data, el = $('#scr-result'), d = ENEMIES[r.enemyId];
    const player = makePlayerFighter(save, {});
    const foe = makeFighterFromEnemy(r.enemyId, {});
    const env = r.mode === 'trials' ? 'core' : r.env;
    // a win: Kage stands in victory and the beaten foe kneels before him (a standing 'dead' pose read as arms raised)
    if (r.win) {
      player.x = -170; poseFighter(player, 'victory', 50);
      foe.x = -400; foe.facing = 1; poseFighter(foe, 'kneel', 50);
      Game.setTableau(env, { fighters: [foe, player], zoom: 1.2, ground: 610, camEase: 0.04, tint: 'rgba(20,14,6,0.35)', sun: { x: 470, y: 270, r: 130, c: 'rgba(201,164,92,0.75)' }, lights: [{ x: 470, y: 330, r: 520, c: 'rgba(201,164,92,0.2)' }] });
    } else {
      player.x = -400; poseFighter(player, 'kneel', 50);
      foe.x = -120; foe.facing = -1; foe.scale *= 1.3; poseFighter(foe, 'taunt', 50);
      Game.setTableau(env, { fighters: [foe, player], zoom: 1.15, ground: 610, camEase: 0.04, tint: 'rgba(30,6,4,0.45)', lights: [{ x: 520, y: 330, r: 520, c: 'rgba(163,48,42,0.35)' }] });
    }
    const eyebrow = r.mode === 'trials' ? `Echo Trials · ${r.waves} wave${r.waves === 1 ? '' : 's'} cleared` : `${Logic.chapterOf(r.stageId).name} · ${Logic.stage(r.stageId).name}`;
    const foeName = r.foeName || d.name;
    const xpNeed = xpForLevel(save.level), xpNow = save.xp;
    const gainPct = r.levelUps ? xpNow / xpNeed * 100 : Math.min(100, r.xp / xpNeed * 100);
    const basePct = r.levelUps ? 0 : Math.max(0, (xpNow - r.xp) / xpNeed * 100);
    const unlockHTML = r.unlocks.filter(u => u.kind !== 'chapter' && u.kind !== 'ng').map(u => `<div class="item"><canvas data-unlock="${u.kind}:${u.id}"></canvas>${esc(gearName(u.kind, u.id))}</div>`).join('');
    // the Interlude spar has no winner (outcome 'interrupted'): Takashi called the boys in
    const sparred = r.outcome === 'interrupted';
    const sealNames = r.mode === 'trials' ? ['5 waves', '10 waves', '15 waves'] : [sparred ? 'Remembered' : 'Victory', 'Under 60s', 'Flawless'];
    const win = r.mode === 'trials' ? r.waves > 0 : r.win;
    const title = r.mode === 'trials' ? (r.newBest ? 'New Record' : 'Fallen') : sparred ? 'Interrupted' : r.win ? 'Victory' : 'Defeated';
    const stretch = r.kind === 'stretch';
    const line = r.mode === 'trials' ? (r.newBest ? `Wave ${r.waves}. The echoes will remember you.` : `Wave ${r.waves}. Best: wave ${save.trialsBest}.`)
      : sparred ? 'Takashi called you in before anyone won. Nobody ever settled it.'
      : stretch ? (r.win ? `The road is walked.${r.clues ? ` Clues found: ${r.clues}.` : ''}` : `The road still bars the way. Rise again.`)
      : r.win ? `${foeName} ${Logic.bossDefeat(r.enemyId) === 'escape' ? 'escaped. The way opens.' : Logic.bossDefeat(r.enemyId) === 'reabsorb' ? 'is part of you again.' : d.type === 'boss' ? 'has fallen. The way opens.' : 'has fallen.'}` : `${foeName} still stands. Rise again.`;
    el.innerHTML = `
      <div class="res-col">
        <div><div class="eyebrow muted" style="color:var(--text-muted)">${esc(eyebrow)}</div>
          <h2 class="disp ${win && (r.win || r.newBest) ? 'win' : 'lose'}">${title}</h2>
          <div class="line">${esc(line)}</div></div>
        ${r.win || r.mode === 'trials' ? `
          <div style="display:flex;align-items:flex-end">
            <div class="seals">${sealNames.map((n, i) => `<div class="seal-b ${r.seals[i] ? 'on' : ''}" style="animation-delay:${0.25 + i * 0.12}s"><i></i><span>${n}</span></div>`).join('')}</div>
            <div class="rating"><b>${r.rating}</b><span>Rating</span></div>
          </div>
          <div class="rewards">
            <div class="r" style="animation-delay:.5s"><i class="coin"></i><span data-count="${r.coins}">+0</span></div>
            ${r.gems ? `<div class="r" style="animation-delay:.62s"><i class="gem" style="width:.9rem;height:.9rem"></i>+${r.gems}</div>` : ''}
            ${unlockHTML}
          </div>` : `
          <div class="recap">
            <div><b>${Math.round(r.enemyDamage * 100)}%</b><span>${stretch ? 'Encounters cleared' : d.type === 'regular' ? 'Enemy' : 'Boss'}${stretch ? '' : ' health taken'}</span></div>
            <div><b><i class="coin" style="width:1.1rem;height:1.1rem;border-width:4px"></i>+${r.coins}</b><span>Kept</span></div>
          </div>
          <div class="tip">${ICON.bulb}<span>${esc(d.tip || 'Block, then punish the recovery.')}</span></div>`}
        <div class="xp"><div class="labels"><b>Level ${save.level}${r.levelUps ? ' · Level up' : ''}</b><span>${fmt(xpNow)} / ${fmt(xpNeed)} · <em>+${r.xp}</em></span></div>
          <div class="track"><i style="width:${basePct}%"></i><u data-xpu style="left:${basePct}%;width:0%"></u></div></div>
        <div class="res-actions">
          ${r.win || r.mode === 'trials' ? `<button class="btn-primary" data-a="res-continue" data-focus>Continue</button><button class="btn-ghost" data-a="res-retry">${ICON.retry} ${r.mode === 'trials' ? 'Again' : 'Replay'}</button>`
            : `<button class="btn-primary" data-a="res-retry" data-focus>${ICON.retry.replace('<svg', '<svg style="width:1.1rem;height:1.1rem"')} Retry</button><button class="btn-ghost" data-a="res-armory">Upgrade</button><button class="btn-link" data-a="res-map">${ICON.map} Map</button>`}
        </div>
      </div>`;
    this.afterShow = () => {
      const u = $('#scr-result [data-xpu]'); if (u) u.style.width = (gainPct - basePct) + '%';
      for (const cv of $$('#scr-result canvas[data-unlock]')) { const [k, id] = cv.dataset.unlock.split(':'); this.paintIcon(cv, k, id, true); }
      const c = $('#scr-result [data-count]');
      if (c) { const target = +c.dataset.count; const t0 = performance.now(); const tick = now => { const k = clamp((now - t0 - 500) / 900, 0, 1); c.textContent = '+' + fmt(target * Ease.outCubic(k)); if (k < 1 && c.isConnected) requestAnimationFrame(tick); else if (target) AudioManager.play('coin'); }; requestAnimationFrame(tick); }
      let delay = 900;
      for (const u of r.unlocks) {
        setTimeout(() => {
          AudioManager.play('unlock');
          if (u.kind === 'chapter') this.toast('New chapter unlocked', `${Logic.chapter(u.id).name} · ${Logic.chapter(u.id).title}`);
          else if (u.kind === 'ng') this.toast('Story complete', 'New Game+ unlocked in Settings');
          else this.toast(u.kind === 'weapons' ? 'Boss weapon' : 'Trophy', gearName(u.kind, u.id));
        }, delay);
        delay += 700;
      }
      if (r.levelUps) setTimeout(() => this.toast('Level up', `Kage reaches level ${save.level}`), delay);
    };
  },

  /* ---------------- settings ---------------- */
  seg(k, opts) {
    const v = SaveManager.data.settings[k];
    return `<div class="seg">${opts.map(([val, lbl]) => `<button class="${String(v) === String(val) ? 'on' : ''}" data-a="set" data-k="${k}" data-v="${val}">${lbl}</button>`).join('')}</div>`;
  },
  // The difficulty row (pause menu and Settings): all four modes, always available, changed only by the player.
  difficultyRow() {
    const cur = SaveManager.data.difficulty, m = Logic.difficulty(cur);
    return `<div class="set-row"><div class="k">Difficulty<small>${esc(m.blurb)}</small></div><div class="seg">${Logic.DIFFICULTY_IDS.map(id => `<button class="${id === cur ? 'on' : ''}" data-a="difficulty" data-v="${id}">${esc(Logic.difficulty(id).label)}</button>`).join('')}</div></div>`;
  },
  openModePicker(next) {
    this._modeNext = next || null;
    const cur = SaveManager.data.difficulty;
    this.openOverlay('mode', `<div class="ov-card wide"><div class="eyebrow">New game</div><h3 class="disp">Choose your difficulty</h3>
      <div class="big-line">Enemy health, damage and timing follow the mode you pick, never your level. You can change it any time from the pause menu or Settings.</div>
      <div class="mode-grid">${Logic.DIFFICULTY_IDS.map(id => { const m = Logic.difficulty(id); return `<button class="mode-card ${id}${id === cur ? ' on' : ''}" data-a="pick-mode" data-v="${id}" ${id === cur ? 'data-focus' : ''}><b>${esc(m.label)}</b><span>${esc(m.blurb)}</span></button>`; }).join('')}</div>
      <div class="stack"><button class="btn-ghost" data-a="close-ov">Back</button></div></div>`);
  },
  settingsRows() {
    return `
      <div class="set-row"><div class="k">Screen shake<small>Camera shake on heavy impacts</small></div>${this.seg('shake', [['full', 'Full'], ['half', 'Half'], ['off', 'Off']])}</div>
      <div class="set-row"><div class="k">Reduced flashing<small>Replaces inverted impact frames with a soft dim</small></div>${this.seg('reduceFlash', [['false', 'Off'], ['true', 'On']])}</div>
      <div class="set-row"><div class="k">Sound effects</div>${this.seg('sound', [['true', 'On'], ['false', 'Off']])}</div>
      <div class="set-row"><div class="k">Music</div>${this.seg('music', [['true', 'On'], ['false', 'Off']])}</div>
      <div class="set-row"><div class="k">Touch controls<small>Auto shows them on touch screens</small></div>${this.seg('touch', [['auto', 'Auto'], ['on', 'On'], ['off', 'Off']])}</div>
      <div class="set-row"><div class="k">Touch stick<small>Floating follows your thumb</small></div>${this.seg('stick', [['float', 'Floating'], ['fixed', 'Fixed']])}</div>`;
  },
  // Wonder "Settings Screen" (the pause menu keeps the compact rows above)
  wSeg(k, opts) {
    const v = SaveManager.data.settings[k];
    return `<div class="w-seg" role="group">${opts.map(([val, lbl]) => `<button class="${String(v) === String(val) ? 'on' : ''}" aria-pressed="${String(v) === String(val)}" data-a="set" data-k="${k}" data-v="${val}">${lbl}</button>`).join('')}</div>`;
  },
  renderSettings() {
    const save = SaveManager.data, el = $('#scr-settings');
    Game.setScene('menu'); AudioManager.setMusic('menu');
    ActTheme.set(ActTheme.progress());
    const cur = save.difficulty, m = Logic.difficulty(cur);
    const row = (k, hint, ctl, cls) => `<div class="sg-row ${cls || ''}"><div class="t"><b>${k}</b>${hint ? `<span>${hint}</span>` : ''}</div>${ctl}</div>`;
    // the touch stick row only matters where touch controls can show
    const touchy = save.settings.touch === 'on' || (save.settings.touch !== 'off' && window.matchMedia && matchMedia('(pointer: coarse)').matches);
    el.innerHTML = `<div class="w-scr"><div class="w-stage">
      <svg class="w-bd" viewBox="0 0 1600 900" aria-hidden="true"><defs>
        <linearGradient id="sg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--th-sky1)"/><stop offset=".6" style="stop-color:var(--th-sky2)"/><stop offset="1" style="stop-color:var(--th-sky3)"/></linearGradient>
        <radialGradient id="sg-glow" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--th-acc);stop-opacity:.4"/><stop offset="1" style="stop-color:var(--th-acc);stop-opacity:0"/></radialGradient>
        <radialGradient id="sg-sun" cx=".5" cy=".4" r=".6"><stop offset="0" style="stop-color:var(--th-sun1)"/><stop offset="1" style="stop-color:var(--th-deep)"/></radialGradient></defs>
        <rect width="1600" height="900" fill="url(#sg-sky)"/><circle cx="800" cy="880" r="420" fill="url(#sg-glow)"/><circle cx="800" cy="880" r="150" fill="url(#sg-sun)"/>
        <path d="M0 850 L140 812 L300 836 L460 806 L620 838 L800 820 L980 840 L1140 808 L1300 836 L1460 810 L1600 830 L1600 900 L0 900Z" style="fill:color-mix(in srgb,var(--th-ground) 85%,#000)"/>
        <g style="fill:color-mix(in srgb,var(--th-ground) 55%,#000);stroke:color-mix(in srgb,var(--th-acc) 35%,transparent)" stroke-width="1.2"><path d="M724 804 Q800 812 876 804 L873 814 Q800 820 727 814Z"/><rect x="740" y="830" width="120" height="8"/><path d="M754 814 L766 814 L768 900 L752 900Z"/><path d="M834 814 L846 814 L848 900 L832 900Z"/><rect x="795" y="815" width="10" height="16"/></g>
        <rect y="872" width="1600" height="28" style="fill:color-mix(in srgb,var(--th-ground) 45%,#000)"/>
      </svg>
      ${wLeaves('sg-leaf', [[1000, 826, 1.3, 20], [600, 850, 1.1, -30], [1500, 860, 1.4, 40], [990, 500, 1, -10]])}
      <div class="w-top tall sg-top"><div class="grp">${wBack()}<span class="w-title">SETTINGS</span><span class="kj">設定</span></div>${wPills()}</div>
      <div class="sg-panel">
        <div class="w-sec"><i></i><b>Challenge</b><span>難易度</span></div>
        ${row('Difficulty', esc(m.blurb), `<div class="w-seg" role="group">${Logic.DIFFICULTY_IDS.map(id => `<button class="${id === cur ? 'on' : ''}" aria-pressed="${id === cur}" data-a="difficulty" data-v="${id}">${esc(Logic.difficulty(id).label)}</button>`).join('')}</div>`, 'first')}
        <div class="w-sec gap"><i></i><b>Feel &amp; Sound</b><span>音</span></div>
        ${row('Screen Shake', 'Camera shake on heavy impacts', this.wSeg('shake', [['full', 'Full'], ['half', 'Half'], ['off', 'Off']]))}
        ${row('Reduced Flashing', 'Replaces inverted impact frames with a soft dim', this.wSeg('reduceFlash', [['false', 'Off'], ['true', 'On']]))}
        ${row('Sound Effects', '', this.wSeg('sound', [['true', 'On'], ['false', 'Off']]))}
        ${row('Music', '', this.wSeg('music', [['true', 'On'], ['false', 'Off']]))}
        ${row('Touch Controls', '', this.wSeg('touch', [['auto', 'Auto'], ['on', 'On'], ['off', 'Off']]))}
        ${touchy ? row('Touch Stick', 'Floating follows your thumb', this.wSeg('stick', [['float', 'Floating'], ['fixed', 'Fixed']])) : ''}
      </div>
      <div class="sg-ng">
        <div class="strip"><svg viewBox="0 0 550 120" aria-hidden="true"><defs><linearGradient id="sg-nbg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:color-mix(in srgb,var(--th-acc) 12%,var(--th-sky1))"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--th-acc) 30%,var(--th-sky1))"/></linearGradient></defs>
          <rect width="550" height="120" fill="url(#sg-nbg)"/><circle cx="420" cy="70" r="46" style="fill:var(--th-acc)"/>
          <path d="M0 96 L90 76 L180 88 L280 70 L380 86 L460 74 L550 84 L550 120 L0 120Z" style="fill:color-mix(in srgb,var(--th-ground) 85%,#000)"/>
          <path d="M40 120 Q200 92 300 104 T550 100" stroke="#ece5d3" stroke-opacity=".18" stroke-width="2" fill="none" stroke-dasharray="6 8"/></svg></div>
        <div class="body"><span class="w-eye">NEW GAME+</span><span class="ttl">${save.ng ? `Cycle ${save.ng}` : 'The Road Again'}</span>
          <span class="txt">${save.ngUnlocked ? 'Enemies gain health, damage and aggression. Rewards grow by 60% per cycle.' : 'Finish the story, through the Epilogue, to unlock New Game+.'}</span>
          <button class="w-brush ${save.ngUnlocked ? '' : 'locked'}" data-a="ng" ${save.ngUnlocked ? '' : 'disabled'}><span class="lb">${save.ngUnlocked ? `BEGIN NG+ ${save.ng + 1}` : 'LOCKED'}</span></button></div>
      </div>
      <div class="sg-help">
        <div class="w-sec" style="padding:0"><i></i><b>Help &amp; Data</b></div>
        <button class="sg-guide" data-a="help">${ICON.help}<span>CONTROLS GUIDE</span></button>
        <button class="sg-erase" data-a="reset">${W_IC.trash}<span>ERASE ALL PROGRESS</span></button>
        <span class="sg-foot">${SaveManager.available ? 'Progress saves automatically in this browser.' : 'Storage is blocked — progress will not persist.'}</span>
      </div>
      <div class="sg-hints">${wKeys([['ENTER', 'Select'], ['ESC', 'Back'], ['← / →', 'Change']])}</div>
    </div></div>`;
  },
  /* ---------------- Echo Trials ---------------- */
  renderTrials() {
    const save = SaveManager.data, el = $('#scr-trials');
    Game.setScene('menu'); AudioManager.setMusic('menu');
    const echoes = Logic.echoTrialBosses(save);
    const echoLine = echoes.length ? `Echoes waiting: ${echoes.map(b => esc(b.name)).join(', ')}.` : 'No boss has fallen to you yet: every fifth wave sends an elite Hollow pack instead.';
    el.innerHTML = `
      <canvas class="sv-art" data-sv></canvas>
      <div class="topbar"><div class="head"><button class="round-btn" data-a="back" aria-label="Back">${ICON.back}</button><div><div class="eyebrow">Endless mode</div><h2 class="disp">Echo Trials</h2></div></div>${currencyHTML()}</div>
      <div class="trials-hero">
        <div class="eyebrow" style="color:var(--echo-violet)">The shifting memory</div>
        <h2 class="disp">What do you still remember?</h2>
        <div class="big-line">Endless waves of Hollows in an arena that drifts through the places you remember. Every ${TRIALS.bossEvery}th wave an echo of a boss you have beaten returns.</div>
        <div class="best"><div><b>${save.trialsBest}</b><span>Best wave</span></div><div><b>${echoes.length}</b><span>Boss echoes</span></div><div><b>+${TRIALS.coins(1)}…</b><span>Coins per wave</span></div><div><b>${Math.round(TRIALS.heal * 100)}%</b><span>Heal between waves</span></div></div>
        <div class="rules"><b>Echoes</b><span>${echoLine}</span><b>Earn</b><span>Coins rise with every wave. A gem every ${TRIALS.gemsEvery} waves. Everything earned is kept.</span><b>Scale</b><span>More Hollows, heavier Hollows, more health and damage as the waves climb, on your ${esc(Logic.difficulty(save.difficulty).label)} mode.</span></div>
        <div><button class="btn-primary" data-a="sv-start" data-focus style="width:16rem">Enter the echoes</button></div>
      </div>`;
    this.afterShow = () => {
      const cv = $('#scr-trials canvas[data-sv]'); if (!cv) return;
      const f = makeFighterFromEnemy(echoes.length ? echoes[echoes.length - 1].enemyId : 'hollow_husk', { facing: -1 }); poseFighter(f, 'taunt', 40);
      drawFighterInto(cv, f, { glow: 'rgba(120,80,220,0.22)', rim: 'rgba(190,160,255,0.85)', fit: 0.8, tall: 1.15, ground: 0.92 });
    };
  },

  /* ---------------- Boss Rush ----------------
     The roster is Logic.bossRushRoster: every boss of the story in story order, the ones not yet beaten in the story
     shown as locked silhouettes. Picking an available boss makes the run start there; Game.startBossRush runs it. */
  renderBossRush() {
    const save = SaveManager.data, el = $('#scr-bossrush');
    Game.setScene('menu'); AudioManager.setMusic('menu');
    const roster = Logic.bossRushRoster(save), avail = roster.filter(b => b.available);
    if (this.brFrom && !avail.some(b => b.stageId === this.brFrom)) this.brFrom = null;
    const run = Logic.bossRushRun(save, this.brFrom), best = save.bossRushBest;
    const card = b => {
      const inRun = run && run.stages.includes(b.stageId), from = b.stageId === this.brFrom;
      return `<button class="br-card ${b.available ? 'on' : 'locked'}${inRun ? ' run' : ''}${from ? ' from' : ''}" data-a="br-pick" data-id="${b.stageId}" aria-label="${esc(b.available ? b.name : 'Locked boss')}">
        <canvas data-br="${b.stageId}"></canvas>
        <b>${b.available ? esc(b.name) : '???'}</b><span>${b.available ? esc(Logic.chapter(b.chapter).name) : 'Defeat in the story'}</span>${from ? '<em>Start</em>' : ''}</button>`;
    };
    el.innerHTML = `
      <div class="topbar"><div class="head"><button class="round-btn" data-a="back" aria-label="Back">${ICON.back}</button><div><div class="eyebrow">Every boss, back to back</div><h2 class="disp">Boss Rush</h2></div></div>${currencyHTML()}</div>
      <div class="br-wrap">
        <div class="br-side">
          <div class="best"><div><b>${avail.length} / ${roster.length}</b><span>Unlocked</span></div><div><b>${best.bosses || '—'}</b><span>Best run</span></div><div><b>${best.bosses ? brTime(best.time) : '—'}</b><span>Best time</span></div></div>
          <div class="rules"><b>Run</b><span>${run ? `${run.stages.length} boss${run.stages.length === 1 ? '' : 'es'} in story order${this.brFrom ? ', from your chosen start' : ''}. One life, no story scenes.` : 'Every boss you defeat in the story joins the rush.'}</span><b>Health</b><span>Carries over: ${Math.round(Logic.BOSS_RUSH.heal * 100)}% of your health returns between fights.</span><b>Earn</b><span>${Logic.BOSS_RUSH.coins} coins per boss beaten, on your ${esc(Logic.difficulty(save.difficulty).label)} mode.</span></div>
          <button class="btn-primary ${run ? '' : 'locked'}" data-a="br-start" data-focus ${run ? '' : 'disabled'}>${run ? 'Begin the rush' : 'Locked'}</button>
        </div>
        <div class="br-grid">${roster.map(card).join('')}</div>
      </div>`;
    const paint = () => {
      for (const cv of $$('#scr-bossrush canvas[data-br]')) {
        const b = roster.find(x => x.stageId === cv.dataset.br); if (!b) continue;
        const f = makeFighterFromEnemy(b.enemyId, { facing: -1 }); poseFighter(f, 'taunt', 40);
        drawFighterInto(cv, f, b.available ? { rim: 'rgba(236,229,211,0.55)', fit: 0.9, tall: 1.15 } : { color: '#3b2f29', rim: null, fit: 0.9, tall: 1.15 });
      }
    };
    if (this.current === 'bossrush') setTimeout(paint, 0); else this.afterShow = paint;
  },
  // The end of a run (Logic.applyBossRushResult): bosses beaten, time, the record and the coins.
  showBossRushResult(r) {
    const save = SaveManager.data, el = $('#scr-result');
    const player = makePlayerFighter(save, {}), foe = makeFighterFromEnemy(r.lastEnemyId, {});
    if (r.cleared) { player.x = -170; poseFighter(player, 'victory', 50); foe.x = -400; foe.facing = 1; poseFighter(foe, 'kneel', 50); }
    else { player.x = -400; poseFighter(player, 'kneel', 50); foe.x = -120; foe.facing = -1; foe.scale *= 1.3; poseFighter(foe, 'taunt', 50); }
    Game.setTableau(r.env, { fighters: [foe, player], zoom: 1.2, ground: 610, camEase: 0.04, tint: r.cleared ? 'rgba(20,14,6,0.35)' : 'rgba(30,6,4,0.45)', lights: [{ x: 470, y: 330, r: 520, c: r.cleared ? 'rgba(201,164,92,0.2)' : 'rgba(163,48,42,0.35)' }] });
    const title = r.newBest ? 'New Record' : r.cleared ? 'Rush Complete' : 'Fallen';
    const line = r.cleared ? 'Every boss you remember, broken in one run.' : `${r.lastFoe} ended the rush.`;
    el.innerHTML = `
      <div class="res-col">
        <div><div class="eyebrow muted" style="color:var(--text-muted)">Boss Rush · ${esc(Logic.difficulty(save.difficulty).label)}</div>
          <h2 class="disp ${r.cleared || r.newBest ? 'win' : 'lose'}">${title}</h2>
          <div class="line">${esc(line)}</div></div>
        <div class="recap" data-br-result>
          <div><b>${r.beaten} / ${r.total}</b><span>Bosses defeated</span></div>
          <div><b>${brTime(r.time)}</b><span>Time</span></div>
          <div><b>${r.best.bosses ? `${r.best.bosses} · ${brTime(r.best.time)}` : '—'}</b><span>Best</span></div>
        </div>
        <div class="rewards"><div class="r" style="animation-delay:.5s"><i class="coin"></i><span>+${fmt(r.coins)}</span></div></div>
        <div class="res-actions"><button class="btn-primary" data-a="res-continue" data-focus>Continue</button><button class="btn-ghost" data-a="res-retry">${ICON.retry} Again</button></div>
      </div>`;
    this.afterShow = () => { if (r.coins) AudioManager.play('coin'); if (r.newBest) this.toast('Boss Rush', `New record: ${r.beaten} boss${r.beaten === 1 ? '' : 'es'} in ${brTime(r.time)}`); };
  },

  /* ---------------- overlays ---------------- */
  openOverlay(id, html) {
    for (const o of $$('.overlay')) o.classList.remove('on');
    const o = $('#ov-' + id); o.innerHTML = html; o.classList.add('on'); this.overlay = id;
    const f = $('[data-focus]', o) || $('button', o); if (f) setTimeout(() => f.focus({ preventScroll: true }), 30);
  },
  closeOverlay() {
    const id = this.overlay; if (!id) return;
    $('#ov-' + id).classList.remove('on'); this.overlay = null;
    if (id === 'pause' || (this.current === 'hud' && Game.session)) { Game.paused = false; Game.acc = 0; this.updateTouch(); }
  },
  openPause() {
    if (!Game.session || StoryPlayer.active) return;
    Game.paused = true; this.updateTouch();
    this.openOverlay('pause', `<div class="ov-card"><div class="eyebrow">Paused · ${esc(Logic.difficulty(SaveManager.data.difficulty).label)}</div><h3 class="disp">${esc(Game.session.enemy ? Game.session.enemy.name : Game.session.cfg.foeName)}</h3>
      <div class="stack"><button class="btn-primary" data-a="resume" data-focus>Resume</button><button class="btn-ghost" data-a="restart">${ICON.retry} ${Game.session.mode === 'bossrush' ? 'Restart the rush' : 'Restart fight'}</button><button class="btn-ghost" data-a="help">${ICON.help} Controls</button><button class="btn-ghost" data-a="quit">Quit to ${Game.session.mode === 'trials' ? 'trials' : Game.session.mode === 'bossrush' ? 'Boss Rush' : 'map'}</button></div>
      <div>${this.difficultyRow()}${this.settingsRows()}</div></div>`);
  },
  openHelp() {
    const back = this.overlay === 'pause';
    const k = (label, keys) => `<div class="key-row"><span>${label}</span><span>${keys.map(x => `<kbd>${x}</kbd>`).join('')}</span></div>`;
    this.openOverlay('help', `<div class="ov-card wide"><div class="eyebrow">Controls guide</div><h3 class="disp">Every move in one place</h3>
      <div class="keys">
        ${k('Move', ['A', 'D', '← →'])}${k('Jump · double jump', ['W', 'Space'])}
        ${k('Punch (3-hit string)', ['J'])}${k('Kick · hold to charge', ['K'])}
        ${k('Weapon string', ['U'])}${k('Kunai · Rage art when full', ['I'])}
        ${k('Dash · dodge (i-frames)', ['L', 'Shift'])}${k('Block · tap late to parry', ['S'])}
        ${k('Grab & throw (close)', ['S + J'])}${k('Dash punch · slide sweep', ['L→J', 'L→K'])}
        ${k('Counter-slash after block', ['S → U'])}${k('Pause', ['Esc', 'P'])}
        ${k('Forward slash (gap closer)', ['D + U'])}${k('Rising slash · launch', ['W + U'])}
        ${k('Downward slash · knockdown', ['S + U'])}${k('Turn slash · step back', ['A + U'])}
        ${k('Rising dash · low sweep', ['W+D+U', 'S+D+U'])}${k('Spinning slash', ['A+W+U'])}
        ${k('Dash strike', ['D, D + U', 'L→U'])}${k('Air: rising cut · plunge', ['W + U', 'S + U'])}
      </div>
      <div class="help-cols">
        <div><h4>Combat</h4><p>Block just as a blow lands to <b>parry</b>: the attacker is stunned and your weapon’s counter-slash opens up. Blocking too long cracks your guard.</p><p>Repeating one move loses damage. Mixing punches, kicks and weapon strings lets attacks cancel into each other after a hit.</p><p><b>Never spam.</b> Every foe reads a mashed attack, dash or jump: it slips to your other side and punishes. Hold W, A, S or D with the weapon button for a different cut, and branch your string mid-combo. Forward and back are measured toward the foe.</p><p>Heavy blows can <b>disarm</b>. Walk over a dropped weapon to recover it.</p></div>
        <div><h4>Touch &amp; pad</h4><p>Left thumb: the stick (push up to jump). Right thumb: Strike (weapon), Punch, Kick, Jump, Dash, Block and the Rage diamond (kunai / rage art). Choose a floating or fixed stick in Settings.</p><p>Gamepad: A jump · X punch · Y kick · B / LB dash · RB weapon · LT block · RT special · Start pause.</p></div>
      </div>
      <div class="stack"><button class="btn-primary" data-a="${back ? 'pause' : 'close-ov'}" data-focus>${back ? 'Back' : 'Got it'}</button></div></div>`);
  },
  openProfile() {
    const s = SaveManager.data;
    const bossStages = Logic.stages().filter(st => Logic.isBossStage(st.id)), bosses = bossStages.filter(st => Logic.defeatedCount(s, st.id) > 0).length;
    this.openOverlay('profile', `<div class="ov-card"><div class="eyebrow">Records</div><h3 class="disp">Kage · Level ${s.level}</h3>
      <div class="records">
        <div><b>${s.stats.wins}</b><span>Duels won</span></div><div><b>${s.stats.losses}</b><span>Defeats</span></div>
        <div><b>${bosses} / ${bossStages.length}</b><span>Bosses broken</span></div><div><b>${s.trialsBest}</b><span>Best Echo Trials wave</span></div>
        <div><b>${s.stats.perfects}</b><span>Flawless wins</span></div><div><b>${s.ng ? 'NG+' + s.ng : '—'}</b><span>Current cycle</span></div>
      </div>
      <div class="xp"><div class="labels"><b>Experience</b><span>${fmt(s.xp)} / ${fmt(xpForLevel(s.level))}</span></div><div class="track"><i style="width:${s.xp / xpForLevel(s.level) * 100}%"></i></div></div>
      <div class="stack"><button class="btn-primary" data-a="close-ov" data-focus>Close</button></div></div>`);
  },
  confirm(title, body, yes) {
    this._confirm = yes;
    this.openOverlay('confirm', `<div class="ov-card"><div class="eyebrow">Confirm</div><h3 class="disp">${esc(title)}</h3><div class="big-line">${esc(body)}</div>
      <div class="stack"><button class="btn-primary" data-a="confirm-yes">Yes</button><button class="btn-ghost" data-a="close-ov" data-focus>Cancel</button></div></div>`);
  },

  /* ---------------- touch controls ---------------- */
  buildTouch() {
    const t = $('#touch');
    t.innerHTML = `
      <div class="stick-zone" data-zone><div class="stick" data-stick><div class="knob" data-knob></div></div></div>
      <div class="cluster">
        <button class="tb big" data-t="weapon" style="right:.4rem;bottom:.6rem"><span>${TOUCH_IC.sword}<small>Strike</small></span></button>
        <button class="tb m" data-t="punch" style="right:6.7rem;bottom:.2rem"><span>${TOUCH_IC.fist}<small>Punch</small></span></button>
        <button class="tb m" data-t="kick" style="right:6.1rem;bottom:5.1rem"><span>${TOUCH_IC.foot}<small>Kick</small></span></button>
        <button class="tb m" data-t="jump" style="right:1.2rem;bottom:7.6rem"><span>${ICON.up}<small>Jump</small></span></button>
        <button class="tb m" data-t="block" style="right:11.6rem;bottom:2.2rem"><span>${ICON.shield}<small>Guard</small></span></button>
        <button class="tb m" data-t="dash" style="right:11rem;bottom:7.4rem"><span>${TOUCH_IC.dash}<small>Dash</small></span></button>
        <button class="tb m rage" data-t="special" style="right:5.6rem;bottom:10rem"><span><b class="rg-k">怒</b><small data-ammo>5</small></span></button>
      </div>`;
    for (const b of $$('.tb', t)) {
      const a = b.dataset.t;
      const down = e => { e.preventDefault(); InputManager.lastDevice = 'touch'; b.setPointerCapture && b.setPointerCapture(e.pointerId); b.classList.add('down'); InputManager.virtualDown(a); if (navigator.vibrate) try { navigator.vibrate(8); } catch (x) {} };
      const up = e => { b.classList.remove('down'); InputManager.virtualUp(a); };
      b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    }
    const zone = $('[data-zone]', t), stick = $('[data-stick]', t), knob = $('[data-knob]', t);
    let pid = null, ox = 0, oy = 0, jumped = false;
    const setDir = (dx, dy) => {
      const R = stick.offsetWidth / 2 || 60, m = Math.hypot(dx, dy), k = m > R ? R / m : 1;
      knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
      const dead = R * 0.28;
      if (dx < -dead) InputManager.virtualDown('left'); else InputManager.virtualUp('left');
      if (dx > dead) InputManager.virtualDown('right'); else InputManager.virtualUp('right');
      if (dy < -R * 0.62 && !jumped) { jumped = true; InputManager.virtualDown('jump'); setTimeout(() => InputManager.virtualUp('jump'), 60); }
      if (dy > -R * 0.35) jumped = false;
    };
    const place = (x, y) => { const r = zone.getBoundingClientRect(); stick.style.left = (x - r.left) + 'px'; stick.style.top = (y - r.top) + 'px'; };
    const home = () => { const r = zone.getBoundingClientRect(); const fx = Math.min(r.width * 0.32, 150), fy = r.height - Math.min(r.height * 0.32, 120); stick.style.left = fx + 'px'; stick.style.top = fy + 'px'; };
    this._stickHome = home;
    zone.addEventListener('pointerdown', e => {
      e.preventDefault(); if (pid !== null) return; pid = e.pointerId; zone.setPointerCapture(e.pointerId); InputManager.lastDevice = 'touch';
      if (SaveManager.data.settings.stick === 'float') place(e.clientX, e.clientY);
      const r = stick.getBoundingClientRect(); ox = r.left + r.width / 2; oy = r.top + r.height / 2;
      stick.classList.add('active'); setDir(e.clientX - ox, e.clientY - oy);
    });
    zone.addEventListener('pointermove', e => { if (e.pointerId !== pid) return; setDir(e.clientX - ox, e.clientY - oy); });
    const end = e => { if (e.pointerId !== pid) return; pid = null; stick.classList.remove('active'); knob.style.transform = ''; InputManager.virtualUp('left'); InputManager.virtualUp('right'); jumped = false; home(); };
    zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
    t.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    setTimeout(home, 50);
  },
  updateTouch() {
    const s = SaveManager.data.settings;
    const want = this.current === 'hud' && !!Game.session && !Game.paused && !StoryPlayer.active && (s.touch === 'on' || (s.touch === 'auto' && isTouchDevice()));
    $('#touch').classList.toggle('on', want);
    if (want && this._stickHome) setTimeout(this._stickHome, 20);
    if (!want) for (const a of ['left', 'right', 'jump', 'punch', 'kick', 'weapon', 'block', 'dash', 'special']) InputManager.virtualUp(a);
  }
};
