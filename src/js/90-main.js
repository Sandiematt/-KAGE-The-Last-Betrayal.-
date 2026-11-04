/* KAGE — boot */
(function boot() {
  SaveManager.load();
  // embedded fonts: request them up front so canvas text (kanji marks, brush words) never falls back
  if (document.fonts && document.fonts.load) for (const f of ['400 40px KageBrush', '800 40px KageSerif', '600 40px KageUI', '700 40px KageNum', '400 40px KageKanji']) document.fonts.load(f, f.indexOf('Kanji') > 0 ? '影斬' : 'KAGE').catch(() => {});
  InputManager.init();
  UIManager.init();
  Splash.start();
  Game.init();
  // expose a tiny debug handle for testing in the console
  window.KAGE = { Game, SaveManager, UIManager, ENEMIES, WEAPONS, ACTS, FightSession, AIController, Renderer, AudioManager, BOSS_ABILITIES, Combat, InputManager, TitleScene };
})();
