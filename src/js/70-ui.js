/* KAGE — UIManager: every DOM screen (title, campaign, armory, pre-fight, HUD, results, settings, survival) */

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
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
function currencyHTML() { const s = SaveManager.data; return `<div class="currency"><span><i class="coin"></i><b data-coins>${fmt(s.coins)}</b></span><span><i class="gem"></i><b data-gems>${fmt(s.gems)}</b></span></div>`; }
function prepCanvas(cv) {
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(1, cv.clientWidth), h = Math.max(1, cv.clientHeight);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  return { g, w, h };
}
function drawWeaponIcon(cv, wid, color) {
  const { g, w, h } = prepCanvas(cv);
  const sh = SHAPE[wid] || 'katana', L = Math.min(w * 0.95, (WEAPONS[wid].len || 80) * 0.75);
  g.save(); g.translate(w / 2 - L * 0.42 * Math.cos(-0.42), h / 2 + L * 0.42 * Math.sin(0.42) * 0.6); g.rotate(-0.42);
  if (sh === 'staff' || sh === 'spear') g.translate(L * 0.1, 0);
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

const MENU_IC = {
  swords: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg>',
  torii: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4c6 1.3 14 1.3 20 0"/><path d="M4 8h16"/><path d="M6 6v15M18 6v15"/><path d="M12 8v3"/></svg>',
  anvil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h13c0 3 2 4 5 4v1c-4 0-6 1-7 3H8C7 12 5 11 3 11z"/><path d="M8 15l-2 5h12l-2-5"/></svg>',
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
    switch (a) {
      case 'play': {
        const n = Game.nextStage();
        if (n && Logic.isCombatStage(n)) { this.selStage = n; this.go('prefight', () => this.preparePrefight(Game.stageConfig(n))); }
        else if (n) { this.selStage = n; this.go('campaign', () => this.renderCampaign()); }
        else { this.go('campaign', () => this.renderCampaign()); this.toast('Story complete', save.ngUnlocked ? 'New Game+ awaits in Settings' : 'Replay any stage'); }
        break;
      }
      case 'campaign': this.selStage = Game.nextStage() || this.selStage; this.go('campaign', () => this.renderCampaign()); break;
      case 'survival': this.go('survival', () => this.renderSurvival()); break;
      case 'armory': this.returnTo = this.current; this.go('armory', () => this.renderArmory()); break;
      case 'settings': this.returnTo = this.current === 'settings' ? 'title' : this.current; this.go('settings', () => this.renderSettings()); break;
      case 'title': this.go('title', () => this.renderTitle()); break;
      case 'back': this.back(); break;
      case 'sound': save.settings.sound = !save.settings.sound; save.settings.music = save.settings.sound; SaveManager.save(); AudioManager.applySettings(); this.renderTitle(); break;
      case 'profile': this.openProfile(); break;
      case 'trophies': this.openTrophies(); break;
      case 'loadout': this.openLoadout(); break;
      case 'armory-from-ov': this.closeOverlay(); this.returnTo = this.current; this.go('armory', () => this.renderArmory()); break;
      case 'earn': this.toast('Earn coins & gems', 'Win duels, topple bosses and climb Survival waves'); this.go('survival', () => this.renderSurvival()); break;
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
        this.renderCampaign(true);
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
        const cfg = { mode: 'survival', wave: 1, enemyId: pick(SURVIVAL.pool.slice(0, 4)), env: 'rooftops', ng: save.ng };
        this.go('prefight', () => this.preparePrefight(cfg));
        break;
      }
      case 'pause': this.openPause(); break;
      case 'resume': this.closeOverlay(); break;
      case 'restart': this.closeOverlay(); Game.paused = false; { const cfg = Object.assign({}, Game.session.cfg); if (cfg.mode === 'survival') cfg.wave = 1; Game.quitFight(); this.go('hud', () => Game.startFight(cfg)); } break;
      case 'quit': this.closeOverlay(); { const mode = Game.session && Game.session.mode; Game.quitFight(); if (mode === 'survival') this.go('survival', () => this.renderSurvival()); else this.go('campaign', () => this.renderCampaign()); } break;
      case 'res-continue': {
        const r = Game.lastResult;
        if (r.mode === 'survival') { this.go('survival', () => this.renderSurvival()); break; }
        this.selStage = r.win && r.next ? r.next : r.stageId;
        this.go('campaign', () => this.renderCampaign());
        break;
      }
      case 'res-retry': Game.retry(); break;
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
      case 'survival': this.go('title', () => this.renderTitle()); break;
      case 'prefight': if (this.pfCfg.mode === 'survival') this.go('survival', () => this.renderSurvival()); else { this.selStage = this.pfCfg.stageId; this.go('campaign', () => this.renderCampaign()); } break;
      case 'result': this.action('res-continue', document.body); break;
    }
  },
  onKey(e) {
    if (e.code === 'Escape' || (e.code === 'KeyP' && this.current === 'hud')) {
      if (this.current === 'hud' && Game.session) { if (this.overlay === 'pause') this.closeOverlay(); else if (!this.overlay) this.openPause(); else this.closeOverlay(); return; }
      this.back(); return;
    }
    if (this.current === 'hud') { if (e.code === 'Enter' || e.code === 'Space') this.skip = true; return; }
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
  onPad(a) { if (a === 'pause' && this.current === 'hud') { if (this.overlay) this.closeOverlay(); else this.openPause(); } },
  onResize() { if (this.current === 'armory') this.renderArmory(true); },

  /* ---------------- title ---------------- */
  renderTitle() {
    const save = SaveManager.data, el = $('#scr-title');
    Game.setScene('title'); AudioManager.setMusic('title');
    if (this.current !== 'title') TitleScene.restart(); // entering the title resets its camera and cloth; re-renders keep it running
    Game.buildWarrior();
    const n = Game.nextStage();
    const ctx = n ? `${Logic.chapterOf(n).name} · ${Logic.stage(n).name}` : (save.ngUnlocked ? 'Story complete' : '');
    const item = (a, ic, label, extra, primary) => `<button class="tm ${primary ? 'primary' : ''}" data-a="${a}" ${primary ? 'data-focus' : ''}><span class="tm-ic">${ic}</span><span class="tm-lb">${label}</span>${extra || ''}</button>`;
    el.innerHTML = `
      <div class="tl-art" aria-hidden="true"></div>
      <div class="tl-logo">
        <div class="logo-row"><h1 class="logo-mark" aria-label="KAGE — The Last Betrayal"></h1><div class="logo-banner"><span>影</span></div></div>
        <div class="logo-sub"><i></i><span>The Last Betrayal</span><i></i></div>
        <p class="logo-tag">Brothers until the end.</p>
      </div>
      <nav class="tl-menu">
        ${item('play', MENU_IC.swords, 'Play', `<span class="tm-ctx">${esc(ctx)}${save.ng ? ` · NG+${save.ng}` : ''}</span><span class="tm-chev">${ICON.back}</span>`, true)}
        ${item('campaign', MENU_IC.torii, 'Campaign')}
        ${item('armory', MENU_IC.anvil, 'Armory')}
        ${item('survival', MENU_IC.infinity, 'Survival')}
        ${item('settings', MENU_IC.gear, 'Settings')}
      </nav>
      <div class="tl-currency">
        <div class="pill"><i class="coin-ic"></i><b data-coins>${fmt(save.coins)}</b><button class="plus" data-a="earn" aria-label="Earn coins">+</button></div>
        <div class="pill"><i class="gem-ic"></i><b data-gems>${fmt(save.gems)}</b><button class="plus" data-a="earn" aria-label="Earn gems">+</button></div>
      </div>
      <div class="tl-corner">
        <button class="dia" data-a="trophies" aria-label="Trophies">${MENU_IC.trophy}</button>
        <button class="dia" data-a="profile" aria-label="Records">${MENU_IC.bars}</button>
        <button class="dia" data-a="loadout" aria-label="Profile">${ICON.user}</button>
        <button class="dia" data-a="sound" aria-label="Toggle sound">${save.settings.sound ? ICON.sound : ICON.mute}</button>
      </div>`;
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
    setTimeout(() => { const cv = $('#ov-profile canvas[data-lo]'); if (cv) { const f = makePlayerFighter(s); poseFighter(f, WEAPONS[eq.weapon].hands === 2 && SHAPE[eq.weapon] === 'katana' ? 'hasso' : null, 40); drawFighterInto(cv, f, { glow: 'rgba(163,48,42,0.55)', rim: 'rgba(255,190,150,0.9)', fit: 0.95, tall: 1.3 }); } }, 30);
  },

  /* ---------------- campaign ----------------
     One screen: the chapter rail (story order), the selected chapter's stages, and the stage card.
     Everything it shows comes from the campaign map in Logic; stages are selected by their string id. */
  renderCampaign() {
    const save = SaveManager.data, el = $('#scr-campaign');
    Game.setScene('menu'); AudioManager.setMusic('menu');
    const chapters = Logic.chapters(), next = Game.nextStage();
    if (!Logic.stage(this.selStage) || !Logic.isStageUnlocked(save, this.selStage)) this.selStage = next || Logic.stages()[Logic.stages().length - 1].id;
    const sel = Logic.stage(this.selStage), ch = Logic.chapter(sel.chapter);
    const chState = c => Logic.isChapterComplete(save, c.id) ? 'cleared' : Logic.isChapterUnlocked(save, c.id) ? 'open' : 'locked';
    const stState = st => Logic.isStageComplete(save, st.id) ? 'cleared' : Logic.isStageUnlocked(save, st.id) ? 'open' : 'locked';
    const KIND = { stretch: 'Stretch', subboss: 'Sub-boss', boss: 'Main boss', spar: 'Memory spar', echo: 'Echo fight', scene: 'Story scene' };
    const glyph = st => {
      if (st.kind === 'boss') return ICON.swords;
      if (st.kind === 'scene') return '<span class="kj">終</span>';
      if (st.kind === 'spar') return '<span class="kj">弟</span>';
      const n = +((st.id.match(/(\d+)$/) || [0, 1])[1]);
      return `<span>${ROMAN[n - 1] || n}</span>`;
    };
    const combat = Logic.isCombatStage(sel.id), cfg = combat ? Game.stageConfig(sel.id) : null;
    const selDone = Logic.isStageComplete(save, sel.id), unlocked = Logic.isStageUnlocked(save, sel.id);
    const reward = Logic.stageRewardPreview(save, sel.id);
    const foe = combat ? ENEMIES[cfg.enemyId] : null;
    const dl = combat ? clamp(ch.diff + save.ng + (foe.type === 'boss' ? 1 : foe.type === 'sub' ? 0.5 : 0), 0, 4) | 0 : 0;
    const prog = Logic.chapterProgress(save, ch.id);
    const action = !unlocked ? 'Locked' : combat ? (selDone ? 'Replay' : 'Fight') : (selDone ? 'Replay scene' : 'Play scene');
    el.innerHTML = `
      ${this.mapSVG('plain')}
      <div class="topbar">
        <div class="head"><button class="round-btn" data-a="back" aria-label="Back">${ICON.back}</button>
          <div><div class="eyebrow">Campaign${save.ng ? ` · <span class="ng-badge">New Game+ ${save.ng}</span>` : ''}</div><h2 class="disp">The Last Betrayal</h2></div></div>
        <div class="diamond-pips">${chapters.map(c => `<i class="${chState(c) === 'cleared' ? 'on' : c.id === ch.id ? 'cur' : ''}"></i>`).join('')}<span class="muted" style="margin-left:.6rem;letter-spacing:.12em">${chapters.filter(c => chState(c) === 'cleared').length} / ${chapters.length}</span></div>
        ${currencyHTML()}
      </div>
      <div class="camp">
        <nav class="chap-rail" aria-label="Chapters">
          ${chapters.map((c, i) => {
            const st = chState(c), p = Logic.chapterProgress(save, c.id);
            return `<button class="chap ${st} ${c.id === ch.id ? 'sel' : ''}" style="animation-delay:${i * 0.04}s" data-a="chapter" data-id="${c.id}" aria-label="${esc(c.name)}, ${esc(c.title)}${st === 'locked' ? ', locked' : ''}">
              <span class="chap-k">${esc(c.name)}</span><b>${esc(c.title)}</b>
              <span class="chap-st">${st === 'locked' ? `<span class="lock-ic">${ICON.lock}</span>` : st === 'cleared' ? 'Cleared' : `${p.done} / ${p.total}`}</span>
            </button>`;
          }).join('')}
        </nav>
        <section class="chap-main">
          <div class="chap-head"><div class="eyebrow">${esc(ch.name)} · ${esc(ch.place)}</div><h3 class="disp">${esc(ch.title)}</h3>
            <div class="row"><div class="bar"><i style="width:${prog.done / prog.total * 100}%"></i></div><span class="muted">${prog.done} / ${prog.total}</span></div></div>
          <div class="stg-path">
            ${ch.stages.map(st => {
              const state = stState(st);
              const cls = ['stg', state, `k-${st.kind}`, st.id === next ? 'current' : '', st.id === sel.id ? 'selected' : ''].join(' ');
              return `<button class="${cls}" data-a="stage" data-id="${st.id}" aria-label="${esc(st.name)}, ${KIND[st.kind]}, ${state === 'open' ? 'unlocked' : state}" ${st.id === sel.id ? 'data-focus' : ''}>
                <i class="stg-d">${glyph(st)}</i><span class="stg-n">${esc(st.name)}</span><span class="stg-k">${KIND[st.kind]}</span></button>`;
            }).join('')}
          </div>
        </section>
        <div class="stage-card" key="${sel.id}">
          <div><div class="eyebrow">${esc(ch.name)} · ${KIND[sel.kind]}</div>
            <div class="name disp">${esc(sel.name)}</div>
            <div class="foe">${combat ? `${esc(cfg.foeName)}${cfg.foeTitle ? `, ${esc(cfg.foeTitle)}` : ''}` : 'No combat · the story continues'}</div></div>
          ${combat ? `<div class="meta"><div class="diff"><div class="pips">${[0, 1, 2].map(k => `<i class="${k < Math.min(3, Math.max(1, dl)) ? 'on' : ''}"></i>`).join('')}</div>${DIFF_LABEL[dl]}${save.ng ? ' · NG+' + save.ng : ''}</div>
            <div class="reward"><i class="coin" style="width:.875rem;height:.875rem"></i>+${reward.coins}${reward.gems ? ` <i class="gem" style="margin-left:.4rem"></i>+${reward.gems}` : ''}</div></div>` : ''}
          ${selDone ? '<div class="muted stg-cleared">Cleared · replay any time</div>' : ''}
          <button class="btn-primary ${unlocked ? '' : 'locked'}" data-a="fight-stage" ${unlocked ? '' : 'disabled'}>${action}</button>
        </div>
      </div>
      <div class="vignette"></div>`;
  },
  // Story scenes have no fight yet: playing one completes it and moves the story on.
  playScene(id) {
    const out = Game.playScene(id), st = Logic.stage(id);
    if (!out) return;
    AudioManager.play('unlock');
    this.toast(Logic.chapterOf(id).name, `${st.name} · scene coming in a later update`);
    let delay = 700;
    for (const u of out.unlocks) {
      setTimeout(() => {
        if (u.kind === 'ng') this.toast('Story complete', 'New Game+ unlocked in Settings');
        else if (u.kind === 'chapter') this.toast('New chapter unlocked', `${Logic.chapter(u.id).name} · ${Logic.chapter(u.id).title}`);
      }, delay);
      delay += 700;
    }
    if (out.next) this.selStage = out.next;
    this.renderCampaign(true);
  },
  mapSVG(world) {
    const m = (x, y, w, h, o) => `<path d="M${x} ${y} L${x + w * 0.3} ${y - h * 0.7} L${x + w * 0.42} ${y - h * 0.45} L${x + w * 0.6} ${y - h} L${x + w} ${y} Z" fill="#1d1a16" opacity="${o}"/>`;
    return `<svg class="map-bg" viewBox="0 0 1440 900" preserveAspectRatio="none">
      <defs><radialGradient id="bg1" cx="78%" cy="30%" r="40%"><stop offset="0" stop-color="#3b1410" stop-opacity=".9"/><stop offset="1" stop-color="#14120f" stop-opacity="0"/></radialGradient></defs>
      <rect width="1440" height="900" fill="#14120f"/>
      <rect width="1440" height="900" fill="url(#bg1)"/>
      <path d="M0 820 C200 780 400 830 600 760 C800 690 1000 640 1200 670 C1300 690 1380 700 1440 690" stroke="#1d1a16" stroke-width="70" fill="none" opacity=".9"/>
      ${m(40, 470, 180, 130, 0.8)}${m(380, 420, 160, 100, 0.8)}${m(560, 300, 160, 90, 0.7)}${m(760, 380, 170, 100, 0.7)}${m(900, 300, 190, 120, 0.8)}${m(1080, 600, 160, 100, 0.6)}${m(640, 860, 180, 110, 0.7)}${m(220, 860, 160, 100, 0.5)}
      ${world === 'plain' ? '' : world ? '<path d="M317 558 C470 470 560 380 720 360 C860 340 980 470 1123 540" stroke="#a3302a" stroke-width="2.5" stroke-dasharray="6 8" fill="none" opacity=".7"/>' : '<path d="M1060 460 C1150 400 1260 340 1440 360 L1440 460 Z" fill="#050404"/>'}
    </svg>`;
  },
  /* ---------------- armory ---------------- */
  armItems() {
    const save = SaveManager.data;
    if (this.armTab === 'weapons') return Object.keys(WEAPONS).filter(id => !WEAPONS[id].enemy && id !== 'fists');
    return Object.keys(gearTable(this.armTab));
  },
  renderArmory(soft) {
    const save = SaveManager.data, el = $('#scr-armory'), kind = this.armTab;
    Game.setScene('menu'); AudioManager.setMusic('menu');
    const items = this.armItems();
    if (!this.armSel || !items.includes(this.armSel)) this.armSel = save.equipped[kind === 'weapons' ? 'weapon' : kind === 'helmets' ? 'helmet' : 'armor'];
    const id = this.armSel, item = gearTable(kind)[id], owned = save.owned[kind][id], lvl = owned || 0;
    const max = GEAR_MAX[kind], eqKey = kind === 'weapons' ? 'weapon' : kind === 'helmets' ? 'helmet' : 'armor', equipped = save.equipped[eqKey] === id;
    let statsHTML = '', special = '';
    if (kind === 'weapons') {
      const s = weaponStats(id, Math.max(1, lvl)), n = weaponStats(id, Math.min(max, Math.max(1, lvl) + 1)), canUp = owned && lvl < max;
      statsHTML = [['Damage', 'damage'], ['Speed', 'speed'], ['Reach', 'reach']].map(([k, key]) => {
        const up = canUp ? n[key] - s[key] : 0;
        return `<div class="stat"><div class="labels"><span>${k}</span><span class="val">${up ? `<em>+${up}</em>` : ''}<b>${s[key]}</b></span></div><div class="track"><i style="width:${s[key]}%"></i><u style="left:${s[key]}%;width:${up}%"></u></div></div>`;
      }).join('');
      const sp = SPECIALS[item.special];
      special = sp ? `<div class="special-line"><b>Rage art</b>${esc(sp.name)} — ${esc(sp.desc)}</div>` : '';
    } else {
      const dNow = Math.round(gearDef(kind, id, Math.max(1, lvl)) * 100), dNext = Math.round(gearDef(kind, id, Math.min(max, Math.max(1, lvl) + 1)) * 100);
      const pk = item.perks, perkTxt = Object.keys(pk).map(k => ({ hp: `+${pk[k]} health`, speed: `${pk[k] > 0 ? '+' : ''}${Math.round(pk[k] * 100)}% speed`, rage: `+${Math.round(pk[k] * 100)}% rage gain`, stunRes: `${Math.round(pk[k] * 100)}% stun resist`, dash: `+${Math.round(pk[k] * 100)}% dash`, ammo: `+${pk[k]} kunai`, kunai: `+${Math.round(pk[k] * 100)}% kunai damage`, dmg: `+${Math.round(pk[k] * 100)}% damage` }[k])).join(' · ');
      const mob = Math.round(100 + (pk.speed || 0) * 100 * 3);
      statsHTML = `<div class="stat"><div class="labels"><span>Defense</span><span class="val">${owned && lvl < max ? `<em>+${dNext - dNow}</em>` : ''}<b>${dNow}%</b></span></div><div class="track"><i style="width:${dNow * 3.5}%"></i><u style="left:${dNow * 3.5}%;width:${owned && lvl < max ? (dNext - dNow) * 3.5 : 0}%"></u></div></div>
        <div class="stat"><div class="labels"><span>Mobility</span><span class="val"><b>${mob}</b></span></div><div class="track"><i style="width:${clamp(mob - 30, 0, 100)}%"></i></div></div>
        ${perkTxt ? `<div class="special-line"><b>Perks</b>${esc(perkTxt)}</div>` : ''}`;
    }
    let primary;
    if (!owned) {
      if (item.exclusive) primary = `<button class="btn-primary locked" disabled>Boss trophy</button>`;
      else if (item.gems) primary = `<button class="btn-primary" data-a="buy" ${save.gems < item.gems ? 'disabled' : ''}>Buy <span style="display:inline-flex;align-items:center;gap:.4rem;letter-spacing:.05em"><i class="gem" style="background:var(--bg-void)"></i>${item.gems}</span></button>`;
      else primary = `<button class="btn-primary" data-a="buy" ${save.coins < item.price ? 'disabled' : ''}>Buy <span style="display:inline-flex;align-items:center;gap:.4rem;letter-spacing:.05em"><i class="coin"></i>${fmt(item.price)}</span></button>`;
    } else if (lvl >= max) primary = `<button class="btn-primary locked" disabled>Mastered</button>`;
    else { const c = upgradeCost(kind, id, lvl); primary = `<button class="btn-primary" data-a="upgrade" ${save.coins < c ? 'disabled' : ''}>Upgrade <span style="display:inline-flex;align-items:center;gap:.4rem;letter-spacing:.05em"><i class="coin"></i>${fmt(c)}</span></button>`; }
    const trophyOf = ENEMIES[item.exclusive]; // a trophy names its enemy; `true` = locked until the gear rebuild
    const exclusiveTxt = item.exclusive && !owned ? `<div class="special-line"><b>Locked</b>${trophyOf ? `Defeat ${esc(trophyOf.name)}, ${esc(trophyOf.title)}` : 'A trophy of a fallen foe. Not obtainable yet.'}</div>` : '';
    el.innerHTML = `
      <canvas class="arm-preview" data-prev></canvas>
      <div class="topbar">
        <div class="head"><button class="round-btn" data-a="back" aria-label="Back">${ICON.back}</button><h2 class="disp">Armory</h2></div>
        <div class="tabs">${[['weapons', 'Weapons'], ['helmets', 'Helmets'], ['armors', 'Armor']].map(([k, l]) => `<button class="tab ${k === kind ? 'on' : ''}" data-a="tab" data-tab="${k}">${l}</button>`).join('')}</div>
        ${currencyHTML()}
      </div>
      <div class="arm-details">
        <div><div class="eyebrow rarity">${esc(item.rarity || item.cls)}${kind === 'weapons' ? ` · ${esc(item.cls)}` : ''}</div><h3 class="disp">${esc(item.name)}</h3><div class="desc">${esc(item.desc || '')}</div></div>
        <div><div class="lvl-row"><span class="k">Level ${equipped ? '<span class="equipped-tag" style="margin-left:.8rem">Equipped</span>' : ''}</span><span class="v">${owned ? `${lvl} / ${max}` : 'Not owned'}</span></div>
          <div class="lvl-pips">${Array.from({ length: max }, (_, i) => `<i class="${i < lvl ? 'on' : i === lvl && owned ? 'next' : ''}"></i>`).join('')}</div></div>
        <div class="stats-col">${statsHTML}${special}${exclusiveTxt}</div>
        <div class="arm-actions">${primary}<button class="btn-ghost" data-a="equip" ${!owned || equipped ? 'disabled' : ''}>${equipped ? 'Equipped' : 'Equip'}</button></div>
      </div>
      <div class="rail">${items.map((iid, i) => {
        const it = gearTable(kind)[iid], ow = save.owned[kind][iid], eq = save.equipped[eqKey] === iid;
        return `<button class="tile ${iid === id ? 'sel' : ''} ${ow ? '' : 'locked'}" data-a="tile" data-id="${iid}" style="animation-delay:${i * 0.03}s" aria-label="${esc(it.name)}">
          ${eq ? '<i class="eq"></i>' : ''}${ow ? '' : `<span class="lock">${ICON.lock}</span>`}
          <canvas data-icon="${iid}" data-kind="${kind}" data-owned="${ow ? 1 : 0}"></canvas>
          ${ow ? `<span class="nm">${esc(it.name)}</span>` : it.exclusive ? `<span class="price" style="color:var(--accent-ember-bright)">Boss trophy</span>` : `<span class="price">${it.gems ? `<i class="gem" style="width:.5rem;height:.5rem"></i>${it.gems}` : `<i class="coin"></i>${fmt(it.price)}`}</span>`}
        </button>`;
      }).join('')}</div>`;
    const paint = () => {
      for (const cv of $$('#scr-armory canvas[data-icon]')) this.paintIcon(cv, cv.dataset.kind, cv.dataset.icon, cv.dataset.owned === '1');
      this.startPreview();
    };
    if (soft) setTimeout(paint, 0); else this.afterShow = paint;
  },
  paintIcon(cv, kind, id, owned) {
    if (kind === 'weapons') { drawWeaponIcon(cv, id, owned ? null : C.ash); return; }
    const f = makePlayerFighter(SaveManager.data, { helmet: kind === 'helmets' ? id : 'topknot', armor: kind === 'armors' ? id : 'wraps', weapon: 'fists', scarf: false });
    poseFighter(f, null, 20);
    if (kind === 'helmets') {
      const { g, w, h } = prepCanvas(cv);
      const r = h * 0.2;
      g.save(); g.translate(w / 2, h * 0.62); g.fillStyle = owned ? '#2a2620' : '#1a1814'; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
      drawHelmet(g, id, r, owned ? '#2a2620' : '#1a1814', {}, f);
      g.restore();
    } else drawFighterInto(cv, f, { fit: 1.2, tall: 1.05, color: owned ? null : '#1a1814', rim: owned ? 'rgba(236,229,211,0.25)' : null, ground: 1.15 });
  },
  startPreview() {
    cancelAnimationFrame(this.armRAF);
    const cv = $('#scr-armory canvas[data-prev]'); if (!cv) return;
    const kind = this.armTab, id = this.armSel, save = SaveManager.data;
    const f = makePlayerFighter(save, kind === 'weapons' ? { weapon: id } : kind === 'helmets' ? { helmet: id } : { armor: id });
    poseFighter(f, null, 30);
    const ghost = makePlayerFighter(save, { weapon: 'fists', scarf: false, helmet: 'topknot', armor: 'wraps' }); poseFighter(ghost, 'taunt', 30);
    let t0 = performance.now();
    const loop = (now) => {
      if (this.current !== 'armory' || !cv.isConnected) return;
      const t = (now - t0) / 1000;
      const { g, w, h } = prepCanvas(cv);
      const gl = g.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.min(w, h) * 0.5); gl.addColorStop(0, 'rgba(163,48,42,0.25)'); gl.addColorStop(1, 'rgba(163,48,42,0)');
      g.fillStyle = gl; g.fillRect(0, 0, w, h);
      if (kind === 'weapons') {
        // ghost warrior + the weapon illustration slowly turning
        const sc = h * 0.95 / ghost.height();
        g.save(); g.translate(w * 0.42, h * 0.99); g.scale(sc, sc); g.translate(-ghost.x, 0); ghost.draw(g, { color: '#1d1a16', shadow: false }); g.restore();
        const L = Math.min(w * 0.78, (WEAPONS[id].len || 80) * 4.1), ang = -0.48 + Math.sin(t * 0.9) * 0.08;
        const sx = Math.cos(t * 0.7) * 0.25 + 0.75;
        g.save(); g.translate(w * 0.5 - L * 0.42 * Math.cos(ang), h * 0.5 - L * 0.42 * Math.sin(ang) + Math.sin(t * 1.3) * 6); g.rotate(ang); g.scale(1, sx);
        const sh = SHAPE[id];
        if (sh === 'short') { g.save(); g.translate(0, 18); drawWeaponShape(g, sh, L * 0.82, 'art', 3, C.ink); g.restore(); g.save(); g.translate(30, -30); g.rotate(0.25); drawWeaponShape(g, sh, L * 0.82, 'art', 3, C.ink); g.restore(); }
        else drawWeaponShape(g, sh, L, 'art', 3, C.ink, f);
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
    this.pfCfg = cfg; this.pfWeapon = SaveManager.data.equipped.weapon;
    AudioManager.setMusic('menu');
    this.renderPrefight();
  },
  renderPrefight() {
    const save = SaveManager.data, cfg = this.pfCfg, d = ENEMIES[cfg.enemyId], el = $('#scr-prefight');
    const player = makePlayerFighter(save, { x: -205, weapon: this.pfWeapon || save.equipped.weapon });
    const enemy = makeFighterFromEnemy(cfg.enemyId, { x: 205 });
    poseFighter(player, null, 40); poseFighter(enemy, 'taunt', 40);
    const env = cfg.env;
    const fitZoom = Math.min(1.55, (H * 0.6) / (Math.max(player.height(), enemy.height()) * 1.18));
    Game.setTableau(env, { fighters: [player, enemy], zoom: fitZoom, ground: 612, lights: [{ x: 330, y: 470, r: 360, c: 'rgba(201,164,92,0.18)' }, { x: 960, y: 450, r: 400, c: 'rgba(163,48,42,0.32)' }] });
    const dl = clamp((cfg.mode === 'campaign' ? cfg.diff : 2) + (cfg.ng || 0) + (d.type === 'boss' ? 1 : 0), 0, 4);
    const foeName = cfg.foeName || d.name, foeTitle = cfg.foeTitle || d.title;
    const tag = cfg.mode === 'survival' ? `Survival · Wave ${ROMAN[cfg.wave - 1] || cfg.wave}` : `${d.type === 'boss' ? 'Boss' : d.type === 'sub' ? 'Sub-boss' : 'Duelist'} · ${DIFF_LABEL[dl]}`;
    const owned = Object.keys(save.owned.weapons).filter(w => WEAPONS[w] && !WEAPONS[w].enemy);
    el.innerHTML = `
      <button class="round-btn pf-back" data-a="back" aria-label="Back">${ICON.back}</button>
      <div class="plate left">
        <div class="eyebrow">Level ${save.level} · ${playerMaxHp(save)} HP</div>
        <div class="nm disp">Kage</div>
        <div class="gear-chips"><span class="chip">Helm <b>${esc(HELMETS[save.equipped.helmet].name)}</b></span><span class="chip">Armor <b>${esc(ARMORS[save.equipped.armor].name)}</b></span><button class="chip" data-a="pf-gear" style="color:var(--accent-gold);border-color:var(--accent-gold-dim)">Change gear</button></div>
      </div>
      <div class="plate right">
        <div class="tag"><div class="diff"><div class="pips">${[0, 1, 2].map(k => `<i class="${k < Math.min(3, Math.max(1, dl)) ? 'on' : ''}"></i>`).join('')}</div></div><span class="eyebrow red">${esc(tag)}</span></div>
        <div class="nm disp">${esc(foeName)}</div>
        <div class="ttl">${esc(foeTitle)}${cfg.mode === 'campaign' ? ` · ${esc(Logic.chapter(cfg.chapter).name)} · ${esc(Logic.stage(cfg.stageId).name)}` : ''}</div>
      </div>
      <div class="taunt">${esc(d.taunt)}</div>
      <div class="vs"><i></i><span>vs</span><i></i></div>
      <div class="dock">
        <div class="choose"><span class="eyebrow">Choose weapon</span>
          <div class="slots">${owned.map(w => `<button class="slot ${w === this.pfWeapon ? 'sel' : ''}" data-a="pf-weapon" data-id="${w}" aria-label="${esc(WEAPONS[w].name)}"><canvas data-w="${w}"></canvas><span class="nm">${esc(WEAPONS[w].name)}</span></button>`).join('')}</div>
        </div>
        <button class="btn-primary" data-a="pf-fight" data-focus>Fight</button>
      </div>`;
    const paint = () => { for (const cv of $$('#scr-prefight canvas[data-w]')) drawWeaponIcon(cv, cv.dataset.w); };
    if (this.current === 'prefight') setTimeout(paint, 0); else this.afterShow = paint;
  },

  /* ---------------- HUD ---------------- */
  showHud(s) {
    const el = $('#scr-hud'), e = s.enemy, bossy = e.def.type !== 'regular';
    el.innerHTML = `
      <div class="fp left" data-pp>
        <div class="medal"><canvas data-portrait="p"></canvas></div>
        <div class="fp-body">
          <div class="fp-name"><b>Kage</b><span>Lv ${SaveManager.data.level}</span></div>
          <div class="hbar"><div class="hbar-in"><i class="hb-chip"></i><i class="hb-fill"></i><i class="hb-gloss"></i></div><span class="hb-val" data-php></span></div>
          <div class="rbar" data-rage><span class="rb-ic">怒</span><div class="rbar-in"><i class="rb-fill"></i></div><span class="rb-ready">Rage ready</span><span class="kunai" data-kunai></span></div>
        </div>
      </div>
      <div class="fp right ${bossy ? 'gone' : ''}" data-ep>
        <div class="medal enemy"><canvas data-portrait="e"></canvas></div>
        <div class="fp-body">
          <div class="fp-name"><b data-ename></b><span data-etitle></span></div>
          <div class="hbar"><div class="hbar-in"><i class="hb-chip"></i><i class="hb-fill"></i><i class="hb-gloss"></i></div><span class="hb-val" data-ehp></span></div>
        </div>
      </div>
      <div class="boss-bar ${bossy ? '' : 'gone'}" data-boss>
        <div class="bb-top"><span class="bb-phases" data-phases></span><span class="bb-title" data-btitle></span></div>
        <b class="bb-name" data-bname></b>
        <div class="bb-track"><i class="hb-chip"></i><i class="hb-fill"></i><i class="hb-gloss"></i><span data-bdivs></span></div>
      </div>
      <div class="clock"><b data-timer>--</b><div class="round-pips" data-pips></div></div>
      <button class="hud-btn hud-pause" data-a="pause" aria-label="Pause">${ICON.pause}</button>
      <div class="hud-wave" data-wave></div>
      <div class="combo" data-combo><b>0</b><span>Hits</span></div>
      <div class="dialogue" data-dlg><div class="who"></div><div class="line"></div></div>
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
        ename: $('[data-ename]', r), etitle: $('[data-etitle]', r), bname: $('[data-bname]', r), btitle: $('[data-btitle]', r), bdivs: $('[data-bdivs]', r),
        phases: $('[data-phases]', r), timer: $('[data-timer]', r), pips: $('[data-pips]', r), combo: $('[data-combo]', r), dlg: $('[data-dlg]', r), skip: $('[data-skip]', r), wave: $('[data-wave]', r),
        pBar: bar($('[data-pp] .hbar-in', r)), eBar: bar($('[data-ep] .hbar-in', r)), bBar: bar($('[data-boss] .bb-track', r))
      };
      return this.el;
    },
    set(k, v, fn) { if (this.cache[k] !== v) { this.cache[k] = v; fn(v); } },
    portraits(s) {
      const pc = $('#scr-hud canvas[data-portrait="p"]'), ec = $('#scr-hud canvas[data-portrait="e"]');
      if (pc) drawPortrait(pc, s.player, false);
      if (ec) drawPortrait(ec, s.enemy, true);
    },
    // smooth drain: the fill eases to the new value, the bone chip waits, then follows
    animBar(b, ratio, dt, els, side) {
      if (ratio < b.target - 0.001) { b.delay = 0.45; this.hurt(side, Math.round((b.target - ratio) * 1000)); }
      if (ratio > b.target) b.chip = Math.max(b.chip, ratio);
      b.target = ratio;
      b.v = damp(b.v, ratio, 16, dt);
      if (b.delay > 0) b.delay -= dt; else b.chip = damp(b.chip, b.v, 5, dt);
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
      const bossy = en.def.type !== 'regular';
      this.set('who', en.uid, () => {
        e.ename.textContent = en.name; e.etitle.textContent = en.title; e.bname.textContent = en.name; e.btitle.textContent = en.title;
        e.ep.classList.toggle('gone', bossy); e.boss.classList.toggle('gone', !bossy);
        e.bdivs.innerHTML = en.ai && en.ai.phases ? '<i class="bb-div" style="left:33.3%"></i><i class="bb-div" style="left:66.6%"></i>' : '';
        this.bars.e = { v: 1, chip: 1, delay: 0, target: clamp(en.hp / en.maxHp, 0, 1) };
        const ec = $('#scr-hud canvas[data-portrait="e"]'); if (ec && ec.clientWidth) drawPortrait(ec, en, true);
      });
      this.animBar(this.bars.p, clamp(p.hp / p.maxHp, 0, 1), dt, e.pBar, 'p');
      this.animBar(this.bars.e, clamp(en.hp / en.maxHp, 0, 1), dt, bossy ? e.bBar : e.eBar, 'e');
      this.set('plow', p.hp < p.maxHp * 0.25, v => e.pp.classList.toggle('low', v));
      this.set('phpv', Math.ceil(Math.max(0, p.hp)), v => e.php.textContent = v);
      this.set('ehpv', Math.ceil(Math.max(0, en.hp)), v => e.ehp.textContent = v);
      const rage = Math.round(p.rage);
      this.set('rage', rage, v => {
        e.rageFill.style.width = clamp(v, 0, 100) + '%';
        const full = v >= 100, was = e.rage.classList.contains('full');
        e.rage.classList.toggle('full', full);
        if (full && !was) { AudioManager.play('unlock'); s.fx.popText(p, 'RAGE READY · I', C.gold); }
        const tb = $('#touch .tb.rage'); if (tb) tb.classList.toggle('ready', full);
      });
      this.set('kunai', p.ammo, v => { e.kunai.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 21 L14 10 M14 10 L21 3 L18 11 Z" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linejoin="round"/></svg>${v}`; const k = $('#touch [data-ammo]'); if (k) k.textContent = v; });
      const ph = en.ai && en.ai.phases ? en.ai.phase : -1;
      this.set('phase', ph + ':' + en.uid, () => { e.phases.innerHTML = ph < 0 ? '' : [0, 1, 2].map(i => `<i class="${i < ph ? 'done' : i === ph ? 'on' : ''}"></i>`).join('') + `<em>Phase ${ROMAN[ph]}</em>`; });
      this.set('timer', Math.max(0, Math.ceil(s.timer)), v => { e.timer.textContent = v; e.timer.classList.toggle('urgent', v <= 10); });
      const n = s.roundsToWin * 2 - 1;
      this.set('pips', `${s.rounds.p}-${s.rounds.e}-${n}`, () => { const arr = []; for (let i = 0; i < s.rounds.p; i++) arr.push('p'); for (let i = 0; i < s.rounds.e; i++) arr.push('e'); while (arr.length < n) arr.push(''); e.pips.innerHTML = arr.map(c => `<i class="${c}"></i>`).join(''); });
      this.set('wave', s.mode === 'survival' ? `${s.wave}-${s.survivalCoins}` : '', () => { e.wave.innerHTML = s.mode === 'survival' ? `<span>Wave ${s.wave}</span><span class="wv-c"><i class="coin"></i>${s.survivalCoins}</span><span class="muted">Best ${SaveManager.data.survivalBest}</span>` : ''; });
      this.set('combo', s.combo >= 2 ? s.combo : 0, v => { e.combo.classList.toggle('on', v >= 2); if (v >= 2) { e.combo.firstChild.textContent = v; e.combo.classList.remove('bump'); void e.combo.offsetWidth; e.combo.classList.add('bump'); } });
      const dl = s.dialogue;
      this.set('dlg', dl ? dl.text : '', () => { e.dlg.classList.toggle('on', !!dl); if (dl) { e.dlg.children[0].textContent = `${dl.name} · ${dl.title}`; e.dlg.children[1].textContent = dl.text; } });
      this.set('skip', s.phase === 'intro' || s.phase === 'outro', v => e.skip.style.display = v ? 'block' : 'none');
    }
  },

  /* ---------------- results ---------------- */
  showResult(r) {
    const save = SaveManager.data, el = $('#scr-result'), d = ENEMIES[r.enemyId];
    const player = makePlayerFighter(save, {});
    const foe = makeFighterFromEnemy(r.enemyId, {});
    const env = r.mode === 'survival' ? 'wasteland' : r.env;
    if (r.win) {
      player.x = -170; poseFighter(player, 'victory', 50);
      foe.x = -400; foe.facing = 1; poseFighter(foe, 'dead', 50);
      Game.setTableau(env, { fighters: [foe, player], zoom: 1.2, ground: 610, camEase: 0.04, tint: 'rgba(20,14,6,0.35)', sun: { x: 470, y: 270, r: 130, c: 'rgba(201,164,92,0.75)' }, lights: [{ x: 470, y: 330, r: 520, c: 'rgba(201,164,92,0.2)' }] });
    } else {
      player.x = -400; poseFighter(player, 'kneel', 50);
      foe.x = -120; foe.facing = -1; foe.scale *= 1.3; poseFighter(foe, 'taunt', 50);
      Game.setTableau(env, { fighters: [foe, player], zoom: 1.15, ground: 610, camEase: 0.04, tint: 'rgba(30,6,4,0.45)', lights: [{ x: 520, y: 330, r: 520, c: 'rgba(163,48,42,0.35)' }] });
    }
    const eyebrow = r.mode === 'survival' ? `Survival · ${r.waves} waves cleared` : `${Logic.chapterOf(r.stageId).name} · ${Logic.stage(r.stageId).name}`;
    const foeName = r.foeName || d.name;
    const xpNeed = xpForLevel(save.level), xpNow = save.xp;
    const gainPct = r.levelUps ? xpNow / xpNeed * 100 : Math.min(100, r.xp / xpNeed * 100);
    const basePct = r.levelUps ? 0 : Math.max(0, (xpNow - r.xp) / xpNeed * 100);
    const unlockHTML = r.unlocks.filter(u => u.kind !== 'chapter' && u.kind !== 'ng').map(u => `<div class="item"><canvas data-unlock="${u.kind}:${u.id}"></canvas>${esc(gearName(u.kind, u.id))}</div>`).join('');
    const sealNames = r.mode === 'survival' ? ['5 waves', '10 waves', '15 waves'] : ['Victory', 'Under 60s', 'Flawless'];
    const win = r.mode === 'survival' ? r.waves > 0 : r.win;
    const title = r.mode === 'survival' ? (r.newBest ? 'New Record' : 'Fallen') : r.win ? 'Victory' : 'Defeated';
    const line = r.mode === 'survival' ? (r.newBest ? `Wave ${r.waves}. The pit will remember your name.` : `Wave ${r.waves}. Best: wave ${save.survivalBest}.`) : r.win ? `${foeName} ${d.type === 'boss' ? 'has fallen. The way opens.' : 'has fallen.'}` : `${foeName} still stands. Rise again.`;
    el.innerHTML = `
      <div class="res-col">
        <div><div class="eyebrow muted" style="color:var(--text-muted)">${esc(eyebrow)}</div>
          <h2 class="disp ${win && (r.win || r.newBest) ? 'win' : 'lose'}">${title}</h2>
          <div class="line">${esc(line)}</div></div>
        ${r.win || r.mode === 'survival' ? `
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
            <div><b>${Math.round(r.enemyDamage * 100)}%</b><span>${d.type === 'regular' ? 'Enemy' : 'Boss'} health taken</span></div>
            <div><b><i class="coin" style="width:1.1rem;height:1.1rem;border-width:4px"></i>+${r.coins}</b><span>Kept</span></div>
          </div>
          <div class="tip">${ICON.bulb}<span>${esc(d.tip || 'Block, then punish the recovery.')}</span></div>`}
        <div class="xp"><div class="labels"><b>Level ${save.level}${r.levelUps ? ' · Level up' : ''}</b><span>${fmt(xpNow)} / ${fmt(xpNeed)} · <em>+${r.xp}</em></span></div>
          <div class="track"><i style="width:${basePct}%"></i><u data-xpu style="left:${basePct}%;width:0%"></u></div></div>
        <div class="res-actions">
          ${r.win || r.mode === 'survival' ? `<button class="btn-primary" data-a="res-continue" data-focus>Continue</button><button class="btn-ghost" data-a="res-retry">${ICON.retry} ${r.mode === 'survival' ? 'Again' : 'Replay'}</button>`
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
          else this.toast(u.kind === 'weapons' ? 'Exclusive weapon' : 'Boss trophy', gearName(u.kind, u.id));
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
  settingsRows() {
    return `
      <div class="set-row"><div class="k">Screen shake<small>Camera shake on heavy impacts</small></div>${this.seg('shake', [['full', 'Full'], ['half', 'Half'], ['off', 'Off']])}</div>
      <div class="set-row"><div class="k">Reduced flashing<small>Replaces inverted impact frames with a soft dim</small></div>${this.seg('reduceFlash', [['false', 'Off'], ['true', 'On']])}</div>
      <div class="set-row"><div class="k">Sound effects</div>${this.seg('sound', [['true', 'On'], ['false', 'Off']])}</div>
      <div class="set-row"><div class="k">Music</div>${this.seg('music', [['true', 'On'], ['false', 'Off']])}</div>
      <div class="set-row"><div class="k">Touch controls<small>Auto shows them on touch screens</small></div>${this.seg('touch', [['auto', 'Auto'], ['on', 'On'], ['off', 'Off']])}</div>
      <div class="set-row"><div class="k">Touch stick<small>Floating follows your thumb</small></div>${this.seg('stick', [['float', 'Floating'], ['fixed', 'Fixed']])}</div>`;
  },
  renderSettings() {
    const save = SaveManager.data, el = $('#scr-settings');
    Game.setScene('menu'); AudioManager.setMusic('menu');
    el.innerHTML = `
      <div class="topbar"><div class="head"><button class="round-btn" data-a="back" aria-label="Back">${ICON.back}</button><h2 class="disp">Settings</h2></div>${currencyHTML()}</div>
      <div class="panel-wrap">
        <div class="panel"><div class="eyebrow">Feel &amp; sound</div>${this.settingsRows()}</div>
        <div style="display:flex;flex-direction:column;gap:1.6rem">
          <div class="panel" style="animation-delay:.08s"><div class="eyebrow">New Game+</div><h3 class="disp">${save.ng ? `Cycle ${save.ng}` : 'The road again'}</h3>
            <div class="big-line">${save.ngUnlocked ? 'Enemies gain health, damage and aggression. Rewards grow by 60% per cycle.' : 'Finish the story, through the Epilogue, to unlock New Game+.'}</div>
            <button class="btn-primary ${save.ngUnlocked ? '' : 'locked'}" data-a="ng" ${save.ngUnlocked ? '' : 'disabled'}>${save.ngUnlocked ? `Begin NG+ ${save.ng + 1}` : 'Locked'}</button></div>
          <div class="panel" style="animation-delay:.16s"><div class="eyebrow">Help &amp; data</div>
            <button class="btn-ghost" data-a="help">${ICON.help} Controls guide</button>
            <button class="btn-link" data-a="reset" style="color:var(--accent-ember-bright)">Erase all progress</button>
            <div class="muted" style="font-size:.85rem;letter-spacing:.06em">${SaveManager.available ? 'Progress saves automatically in this browser.' : 'Storage is blocked — progress will not persist.'}</div></div>
        </div>
      </div>`;
  },

  /* ---------------- survival ---------------- */
  renderSurvival() {
    const save = SaveManager.data, el = $('#scr-survival');
    Game.setScene('menu'); AudioManager.setMusic('menu');
    el.innerHTML = `
      <canvas class="sv-art" data-sv></canvas>
      <div class="topbar"><div class="head"><button class="round-btn" data-a="back" aria-label="Back">${ICON.back}</button><div><div class="eyebrow">Endless mode</div><h2 class="disp">Survival</h2></div></div>${currencyHTML()}</div>
      <div class="survival-hero">
        <div class="eyebrow" style="color:var(--accent-ember-bright)">The Endless Pit</div>
        <h2 class="disp">How long can you stand?</h2>
        <div class="big-line">One life. Foes from every act, one after another. Every fifth wave a sub-boss steps into the ring.</div>
        <div class="best"><div><b>${save.survivalBest}</b><span>Best wave</span></div><div><b>+${SURVIVAL.coins(1)}…</b><span>Coins per wave</span></div><div><b>${Math.round(SURVIVAL.heal * 100)}%</b><span>Heal between waves</span></div></div>
        <div class="rules"><b>Earn</b><span>Coins rise with every wave. A gem every ${SURVIVAL.gemsEvery} waves. Everything earned is kept.</span><b>Scale</b><span>Enemies gain health and damage as the waves climb.</span><b>Gear</b><span>Your equipped weapon, helm and armor fight with you.</span></div>
        <div><button class="btn-primary" data-a="sv-start" data-focus style="width:16rem">Enter the pit</button></div>
      </div>`;
    this.afterShow = () => {
      const cv = $('#scr-survival canvas[data-sv]'); if (!cv) return;
      const f = makeFighterFromEnemy('echo_sentinel', { facing: -1 }); poseFighter(f, 'taunt', 40);
      drawFighterInto(cv, f, { glow: 'rgba(163,48,42,0.5)', rim: 'rgba(255,130,80,0.85)', fit: 0.8, tall: 1.15, ground: 0.92 });
    };
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
    if (!Game.session) return;
    Game.paused = true; this.updateTouch();
    this.openOverlay('pause', `<div class="ov-card"><div class="eyebrow">Paused</div><h3 class="disp">${esc(Game.session.enemy.name)}</h3>
      <div class="stack"><button class="btn-primary" data-a="resume" data-focus>Resume</button><button class="btn-ghost" data-a="restart">${ICON.retry} Restart fight</button><button class="btn-ghost" data-a="help">${ICON.help} Controls</button><button class="btn-ghost" data-a="quit">Quit to ${Game.session.mode === 'survival' ? 'survival' : 'map'}</button></div>
      <div>${this.settingsRows()}</div></div>`);
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
      </div>
      <div class="help-cols">
        <div><h4>Combat</h4><p>Block just as a blow lands to <b>parry</b>: the attacker is stunned and your weapon’s counter-slash opens up. Blocking too long cracks your guard.</p><p>Repeating one move loses damage. Mixing punches, kicks and weapon strings lets attacks cancel into each other after a hit.</p><p>Heavy blows can <b>disarm</b>. Walk over a dropped weapon to recover it.</p></div>
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
        <div><b>${bosses} / ${bossStages.length}</b><span>Bosses broken</span></div><div><b>${s.survivalBest}</b><span>Best survival wave</span></div>
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
    const want = this.current === 'hud' && !!Game.session && !Game.paused && (s.touch === 'on' || (s.touch === 'auto' && isTouchDevice()));
    $('#touch').classList.toggle('on', want);
    if (want && this._stickHome) setTimeout(this._stickHome, 20);
    if (!want) for (const a of ['left', 'right', 'jump', 'punch', 'kick', 'weapon', 'block', 'dash', 'special']) InputManager.virtualUp(a);
  }
};
