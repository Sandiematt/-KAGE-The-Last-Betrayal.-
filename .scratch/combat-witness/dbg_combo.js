const { loadSim } = require('E:/PROJECTS/KAGE/KAGE/tests/helpers/load-sim.js');
const DT = 1/60;
for (const ph of [0, 2]) {
  const S = loadSim({ seed: 11, exports: ['WitnessBoss','WitnessStyle'] });
  S.SaveManager.data = S.Logic.defaultSave();
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'core.witness'));
  for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
  const e = s.enemy, p = s.player; e.ai.decide = () => {}; e.ai.tryAbility = () => false; S.WitnessBoss.direct = () => {};
  p.maxHp = p.hp = 5000;
  const step = n => { for (let i = 0; i < n; i++) { s.step(DT); S.InputManager.endTick(); } };
  if (ph) { e.hp = e.maxHp*0.49; step(60*14); }
  e.x = 0; e.facing = 1; e.abil = null; e.setState('idle'); p.x = 150; p.facing = -1; p.setState('idle');
  const IM = S.InputManager; const log = [];
  const orig = S.Combat.parry; S.Combat.parry = function (w, att, def, m, ...r) { log.push(`${s.time.toFixed(2)} parry ${m.tech} b${m.beat}`); return orig.call(this, w, att, def, m, ...r); };
  const apply = S.Combat.applyHit; S.Combat.applyHit = function (w, att, def, m, ...r) { if (att === e && def === p) log.push(`${s.time.toFixed(2)} hit-on-kage ${m.tech} b${m.beat} state=${def.state}`); return apply.call(this, w, att, def, m, ...r); };
  S.BOSS_ABILITIES.echoCombo.run(e, s, e.ai, p);
  for (let i = 0; i < 60 * 6; i++) {
    p.x = 150; p.hp = p.maxHp;
    if (e.telegraph > 0 && e.telegraph < 0.1 && p.state !== 'block') IM.virtualDown('block');
    if (p.state === 'block' && p.st > 0.2) IM.virtualUp('block');
    step(1);
    if (i % 10 === 0 && i < 200) log.push(`${s.time.toFixed(2)} e=${e.state} tel=${e.telegraph.toFixed(2)} p=${p.state} g=${e.guard.toFixed(0)} comboFrom=${s.wit.comboFrom}`);
  }
  console.log('PHASE', ph); console.log(log.join('\n'));
}
