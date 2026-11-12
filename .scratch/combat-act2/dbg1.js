const { loadSim } = require('E:/PROJECTS/KAGE/KAGE/tests/helpers/load-sim.js');
const S = loadSim({ seed: 11, exports: ['WeaponSystem'] });
S.SaveManager.data = S.Logic.defaultSave();
S.Game.playStory = (sid, done) => { if (done) done(); return false; };
S.Game.finishFight = () => {};
const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'act2.sub3'));
for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(1/60); }
const e = s.enemy, p = s.player; e.ai.decide = () => {}; e.ai.tryAbility = () => false; e.ai.t=1e9;
e.x = 0; p.x = 420; e.facing = 1; p.facing=-1;
S.BOSS_ABILITIES.utsushiMoon.run(e, s, e.ai, p);
for (let i=0;i<72;i++){ s.step(1/60); const c = s.projectiles.find(x=>x.type==='crescent'); if (c) { console.log(i, c.vx, c.d.deflect, c.x, c.y); break; } }
