// A tiny scripted-input harness for combat tests (directional attacks, the spam read): loads the real simulation,
// opens a stage (or an arena config) straight into its fight, and steps it at 60 Hz with virtual key presses.
'use strict';
const { loadSim } = require('./load-sim');

function openFight(target, o) {
  o = o || {};
  const S = loadSim({ seed: o.seed || 7 });
  const save = S.SaveManager.data = S.Logic.defaultSave();
  if (o.difficulty) save.difficulty = o.difficulty;
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const cfg = typeof target === 'string' ? S.Logic.stageConfig(save, target) : Object.assign({ mode: 'campaign', env: 'highlands', diff: 1, ng: 0 }, target);
  const s = new S.FightSession(cfg);
  const held = new Set(), taps = [];
  const api = {
    S, s, get p() { return s.player; }, get e() { return s.enemy; },
    down(a) { if (!held.has(a)) { held.add(a); S.InputManager.virtualDown(a); } },
    up(a) { if (held.has(a)) { held.delete(a); S.InputManager.virtualUp(a); } },
    tap(a) { api.down(a); taps.push({ a, n: 2 }); },
    releaseAll() { for (const a of [...held]) api.up(a); },
    // one 60 Hz frame (hit-stop and slow motion as Game.loop runs them)
    frame() {
      for (let i = taps.length - 1; i >= 0; i--) if (--taps[i].n <= 0) { api.up(taps[i].a); taps.splice(i, 1); }
      if (s.fx.hitStop > 0) { s.fx.update(1 / 60, 0); return; }
      s.step(S.STEP); S.InputManager.endTick(); s.fx.update(1 / 60, 1 / 60);
    },
    run(n, each) { for (let i = 0; i < n; i++) { if (each) each(i); api.frame(); } },
    // step until the fight is live, then stand Kage and the foe `gap` apart, both idle and facing each other
    ready(gap) {
      for (let i = 0; i < 1200 && s.phase !== 'fight'; i++) api.frame();
      const p = s.player, e = s.enemy;
      p.maxHp = p.hp = 100000;
      p.x = 0; e.x = gap == null ? 150 : gap; p.facing = 1; e.facing = -1; p.setState('idle'); e.setState('idle'); e.move = null; e.abil = null;
      return api;
    },
    // what the foe's AI does is out of the test's hands: freeze it (no decisions) unless `live`
    freeze() { s.enemy.ai.t = 1e9; s.enemy.ai.update = function () { clearCtrl(this.f.ctrl); }; return api; }
  };
  function clearCtrl(c) { for (const k in c) c[k] = typeof c[k] === 'number' ? 0 : typeof c[k] === 'boolean' ? false : null; }
  return api;
}

module.exports = { openFight };
