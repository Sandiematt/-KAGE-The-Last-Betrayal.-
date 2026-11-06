/* KAGE — StoryPlayer: plays a story scene (SCENES, 12-scenes.js) over whatever is on screen.
   - the bottom dialogue panel: portrait medallion (SPEAKERS, 52-story-art.js), speaker name, typewriter text;
   - full-screen illustrations (ILLUSTRATIONS), drawn on their own canvas, scaled to cover the screen;
   - the one VIDEO PLACEHOLDER card (Prologue only);
   - an end card: an illustration step with `card` text (the Epilogue's end_card), handed to the painter as { card }.
   One press finishes the line, the next press advances; Skip ends the whole scene. Advance: Enter, Space / W, J, K, U,
   a tap or click, gamepad A / X / Y / RB. Skip: Esc or P, the Skip button, gamepad Start or Back.
   While a scene plays Game.loop does not step the fight (gameplay is frozen, its last frame stays drawn behind) and
   pause, the HUD and the touch controls are put away; when it ends the fight resumes from the same tick.
   Scenes attach to stages (`scenes: { before, after, defeat }`) and clues; see Game.playStory and Logic.stageScene. */
const STORY_CPS = 42;   // typewriter speed, characters per second

const StoryPlayer = {
  active: null, el: null, req: null,
  init() {
    const el = this.el = document.getElementById('story');
    el.innerHTML = `
      <canvas class="st-art" aria-hidden="true"></canvas>
      <div class="st-tint" aria-hidden="true"></div>
      <div class="st-video" role="dialog" aria-label="Video placeholder">
        <div class="st-video-tag">[VIDEO PLACEHOLDER — FINAL PRODUCTION]</div>
        <div class="st-video-desc" data-vdesc></div>
        <button class="btn-ghost st-video-skip" data-st="next">Skip ${ICON.fwd}</button>
      </div>
      <button class="btn-ghost st-skip" data-st="skip">Skip scene ${ICON.fwd}</button>
      <div class="st-panel" data-st="next">
        <div class="medal st-medal"><canvas data-portrait></canvas></div>
        <div class="st-body">
          <div class="st-name" data-name></div>
          <div class="st-text"><span data-shown></span><span class="st-rest" data-rest></span></div>
        </div>
        <i class="st-more" aria-hidden="true"></i>
        <div class="st-hint">Enter / tap · next &nbsp;&nbsp; Esc · skip</div>
      </div>`;
    this.q = {
      art: $('.st-art', el), video: $('.st-video', el), vdesc: $('[data-vdesc]', el), panel: $('.st-panel', el),
      portrait: $('[data-portrait]', el), medal: $('.st-medal', el), name: $('[data-name]', el), shown: $('[data-shown]', el), rest: $('[data-rest]', el)
    };
    // taps and clicks: the panel and the card's Skip advance, the Skip scene button ends the scene
    el.addEventListener('pointerdown', e => {
      if (!this.active) return;
      e.preventDefault(); e.stopPropagation();
      const b = e.target.closest('[data-st]');
      this.req = b && b.dataset.st === 'skip' ? 'skip' : 'next';
    });
    window.addEventListener('keydown', e => {
      if (!this.active || e.repeat) return;
      if (e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); this.req = 'next'; }
    });
    window.addEventListener('resize', () => { if (this.active) this.drawArt(); });
  },

  /* ---- playing ---- */
  // Plays a scene by id. opts.backdrop: a black base behind it (when no fight is on screen). onDone runs when it ends
  // (finished or skipped). Returns false (and runs onDone at once) when there is no such scene.
  play(id, onDone, opts) {
    const scene = Logic.scene(id);
    if (!scene || this.active) { if (onDone) onDone(); return false; }
    opts = opts || {};
    this.active = { id, scene, i: -1, mode: null, t: 0, text: '', typed: 0, illus: null, onDone };
    this.req = null;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    this.el.className = 'on' + (opts.backdrop ? ' backdrop' : '') + (scene.memory ? ' memory' : '');
    document.getElementById('ui').classList.add('story-on');
    this.setIllus(null);
    UIManager.updateTouch();
    this.next();
    return true;
  },
  next() {
    const a = this.active;
    while (a === this.active) {
      a.i++;
      const s = a.scene.steps[a.i];
      if (!s) return this.end();
      a.step = s; a.t = 0;
      if ('video' in s) { a.mode = 'video'; this.show('video'); this.q.vdesc.textContent = s.video; return; }
      if ('say' in s) { const sp = SPEAKERS[s.say] || SPEAKERS.narrator; return this.line(s.name || sp.name, s.text, s.say, !!s.memory); }
      if ('illus' in s) { a.card = s.card || null; this.setIllus(s.illus); if (s.caption) return this.line('', s.caption, null, false); continue; }
      if ('wait' in s) { a.mode = 'wait'; a.wait = s.wait; this.show(null); return; }
      if ('flag' in s) { if (Logic.setStoryFlag(SaveManager.data, s.flag)) SaveManager.save(); continue; }
    }
  },
  line(name, text, speaker, memory) {
    const a = this.active, q = this.q;
    a.mode = 'line'; a.text = text; a.typed = 0;
    this.show('panel');
    const narr = !speaker || speaker === 'narrator';
    q.panel.classList.toggle('narr', narr);
    q.panel.classList.toggle('mem', memory);
    q.panel.classList.remove('typed');
    q.name.textContent = name;
    q.name.style.color = speaker && SPEAKERS[speaker] ? SPEAKERS[speaker].accent : '';
    q.shown.textContent = ''; q.rest.textContent = text;
    if (!narr) this.drawPortrait(speaker);
  },
  show(what) {
    const q = this.q;
    q.video.classList.toggle('on', what === 'video');
    q.panel.classList.toggle('on', what === 'panel');
    this.el.classList.toggle('carding', what === 'video');
  },
  // called by Game.loop every frame while a scene plays (real time, so slow motion never drags the text)
  update(dt) {
    const a = this.active;
    if (!a) return;
    a.t += dt;
    let req = this.req; this.req = null;
    if (InputManager.pressed('pause') || InputManager.pressed('skip')) req = 'skip';
    else if (!req && (InputManager.pressed('punch') || InputManager.pressed('jump') || InputManager.pressed('kick') || InputManager.pressed('weapon'))) req = 'next';
    // the video card's Skip (and any skip press on it) moves past the card only
    if (req === 'skip' && a.mode === 'video') req = 'next';
    if (req === 'skip') {
      // a skipped scene still sets its story flags, so skipping never changes the story
      let changed = false;
      for (const s of a.scene.steps.slice(a.i + 1)) if ('flag' in s) changed = Logic.setStoryFlag(SaveManager.data, s.flag) || changed;
      if (changed) SaveManager.save();
      AudioManager.play('ui'); return this.end();
    }
    if (a.mode === 'line') {
      const n = Math.min(a.text.length, Math.floor(a.t * STORY_CPS));
      if (req === 'next') {
        if (a.typed < a.text.length) a.typed = a.text.length;   // first press: finish the line
        else { AudioManager.play('hover'); return this.next(); } // next press: advance
        a.t = a.text.length / STORY_CPS;
      } else if (n > a.typed) a.typed = n;
      if (this.q.shown.textContent.length !== a.typed) {
        this.q.shown.textContent = a.text.slice(0, a.typed); this.q.rest.textContent = a.text.slice(a.typed);
        if (a.typed >= a.text.length) this.q.panel.classList.add('typed');
      }
    } else if (a.mode === 'video') { if (req === 'next') { AudioManager.play('ui'); this.next(); } }
    else if (a.mode === 'wait') { if (req === 'next' || a.t >= a.wait) this.next(); }
  },
  end() {
    const a = this.active;
    if (!a) return;
    this.active = null; this.req = null;
    this.el.className = ''; this.show(null);
    document.getElementById('ui').classList.remove('story-on');
    if (Logic.markSceneSeen(SaveManager.data, a.id)) SaveManager.save();
    Game.acc = 0;
    UIManager.updateTouch();
    if (a.onDone) try { a.onDone(); } catch (e) { console.error('[KAGE] scene end', e); }
  },

  /* ---- drawing ---- */
  setIllus(id) {
    const a = this.active;
    if (a) a.illus = id && ILLUSTRATIONS[id] ? id : null;
    const art = this.q.art;
    art.classList.remove('on');
    if (a && a.illus) { void art.offsetWidth; this.drawArt(); art.classList.add('on'); }
  },
  drawArt() {
    const a = this.active;
    if (!a || !a.illus) return;
    const { g, w, h } = prepCanvas(this.q.art);
    const s = Math.max(w / 1280, h / 720);
    g.fillStyle = '#030303'; g.fillRect(0, 0, w, h);
    g.save(); g.translate(w / 2, h / 2); g.scale(s, s); g.translate(-640, -360);
    try { ILLUSTRATIONS[a.illus].paint(g, { card: a.card }); } catch (e) { console.error('[KAGE] illustration', a.illus, e); }
    g.restore();
  },
  drawPortrait(id) {
    const cv = this.q.portrait, sp = SPEAKERS[id];
    if (!sp) return;
    const { g, w, h } = prepCanvas(cv);
    g.save(); g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, TAU); g.clip();
    g.scale(w / 100, h / 100);
    sp.portrait(g);
    g.restore();
  }
};
