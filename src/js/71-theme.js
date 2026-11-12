/* KAGE — act palettes for the menus (styles: wonder.css, #ui[data-act]).
   Each act takes the colour of its boss: Act I Raikon's crimson (the Wonder design's own red), Act II Akari's sakura
   pink, Act III Takashi's lacquer gold, the Core the Witness's echo indigo. The Prologue, Interlude and Epilogue keep
   the crimson. Changing act morphs every themed colour (registered --th-* properties transition together) and plays
   an ink bloom: a wash of the new colour opening from where the change came from, two rings, a scatter of ink
   diamonds and the act's seal kanji. */
const ACT_OF_CHAPTER = { prologue: 'raikon', act1: 'raikon', interlude: 'raikon', act2: 'akari', act3: 'takashi', core: 'witness', epilogue: 'raikon' };
const ACT_THEMES = {
  raikon:  { acc: '#c8343a', hot: '#e05a4f', seal: '雷' },
  akari:   { acc: '#e8418f', hot: '#ff7ab6', seal: '刃' },
  takashi: { acc: '#d29a3c', hot: '#f2c66b', seal: '師' },
  witness: { acc: '#4a5cff', hot: '#8f9cff', seal: '響' }
};
// The user asked for the whole UI in red, never the act colours (2026-11-12): every screen wears Raikon's crimson.
// Set this to null to bring the act palettes back.
const MENU_THEME_PIN = 'raikon';
const ActTheme = {
  cur: null,
  forChapter(chapterId) { return ACT_OF_CHAPTER[chapterId] || 'raikon'; },
  forStage(stageId) { const st = stageId && Logic.stage(stageId); return this.forChapter(st ? st.chapter : null); },
  // the act the story has reached (the menus outside the campaign wear it)
  progress() { const n = Game.nextStage(); return n ? this.forStage(n) : 'raikon'; },
  // origin: an element, {x, y} in window pixels, or nothing (the centre)
  set(key, origin) {
    if (MENU_THEME_PIN) key = MENU_THEME_PIN;
    if (!ACT_THEMES[key]) key = 'raikon';
    const ui = document.getElementById('ui');
    if (!ui || this.cur === key) return;
    const first = this.cur === null;
    this.cur = key;
    ui.dataset.act = key;
    if (!first) this.bloom(key, origin);
  },
  bloom(key, origin) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ui = document.getElementById('ui'), th = ACT_THEMES[key];
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    if (origin && origin.getBoundingClientRect) { const r = origin.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    else if (origin && typeof origin.x === 'number') { x = origin.x; y = origin.y; }
    const fx = document.createElement('div');
    fx.className = 'th-fx'; fx.setAttribute('aria-hidden', 'true');
    fx.style.setProperty('--bx', x + 'px'); fx.style.setProperty('--by', y + 'px'); fx.style.setProperty('--c', th.acc);
    let html = `<i class="th-bloom"></i><i class="th-ring" style="--c:${th.hot}"></i><i class="th-ring r2" style="--c:${th.acc}"></i><span class="th-seal">${th.seal}</span>`;
    const R = Math.hypot(window.innerWidth, window.innerHeight) * 0.42;
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2 + Math.random() * 0.4, d = R * (0.35 + Math.random() * 0.75);
      html += `<i class="th-ink" style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px;--s:${(5 + Math.random() * 9).toFixed(1)}px;` +
        `--r:${(Math.random() * 360) | 0}deg;--t:${(0.8 + Math.random() * 0.6).toFixed(2)}s;--d:${(Math.random() * 0.12).toFixed(2)}s;--c:${i % 3 ? th.acc : th.hot}"></i>`;
    }
    fx.innerHTML = html;
    ui.appendChild(fx);
    setTimeout(() => fx.remove(), 1700);
  }
};
