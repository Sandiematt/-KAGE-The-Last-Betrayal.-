const { loadSim } = require('E:/PROJECTS/KAGE/KAGE/tests/helpers/load-sim.js');
const DT = 1/60;
const S = loadSim({ seed: 11, exports: ['WitnessBoss','WitnessStyle'] });
S.SaveManager.data = S.Logic.defaultSave();
S.Game.playStory = (id, done) => { if (done) done(); return false; };
S.Game.finishFight = () => {};
const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'core.witness'));
for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
const e = s.enemy, p = s.player; e.ai.decide = () => {}; e.ai.tryAbility = () => false; S.WitnessBoss.direct = () => {};
p.maxHp = p.hp = 5000;
const step = n => { for (let i = 0; i < n; i++) { s.step(DT); S.InputManager.endTick(); } };
e.x = 0; e.facing = 1; e.abil = null; e.setState('idle'); p.x = 300; p.facing = -1; p.setState('idle'); step(1);
e.ai.cds = {};
S.WitnessBoss.phantom(e, s, p);
const IM = S.InputManager; const ah = S.Combat.applyHit; S.Combat.applyHit = function (w, att, def, m, ix, iy, dir) { console.log('applyHit', att.def.id, att === e, 'att.x', att.x.toFixed(0), 'def.x', def.x.toFixed(0), 'def.facing', def.facing, 'state', def.state, 'blockT', def.blockT, 'dir', dir, 'unb', m.unb, att.unblockable); return ah.call(this, w, att, def, m, ix, iy, dir); };
for (let i = 0; i < 40; i++) {
  const ph = s.fighters.find(c => c.wPhantom);
  if (ph && ph.abil && ph.telegraph > -0.02 && ph.telegraph < 0.03 && p.state !== 'block') IM.virtualDown('block');
  step(1);
  if (ph) console.log(i, 'ph x', ph.x.toFixed(0), 'tel', ph.telegraph.toFixed(2), 'stage', ph.wAtk && ph.wAtk.stage, 'p', p.state, p.blockT && p.blockT.toFixed(2), 'hp', p.hp.toFixed(0), 'life', ph.life.toFixed(2), 'alive', ph.alive);
}
