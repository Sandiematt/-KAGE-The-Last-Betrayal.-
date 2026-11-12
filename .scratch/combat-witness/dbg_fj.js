const { loadSim } = require('E:/PROJECTS/KAGE/KAGE/tests/helpers/load-sim.js');
const EX = ['WitnessBoss', 'WitnessInput', 'WITNESS_MOVES'];
const S = loadSim({ seed: 11, exports: EX });
S.SaveManager.data = S.Logic.defaultSave();
S.Game.playStory = (id, done) => { if (done) done(); return false; };
S.Game.finishFight = () => {};
const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'core.witness'));
for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(1/60); }
const e = s.enemy, p = s.player;
e.ai.decide = () => {}; e.ai.tryAbility = () => false; S.WitnessBoss.direct = () => {};
p.maxHp = p.hp = 5000; e.hp = e.maxHp*0.2;
for (let i=0;i<780;i++) s.step(1/60);
e.abil = null; e.setState('idle'); e.x = 0; e.facing = 1; p.x = 380; p.facing = -1; p.setState('idle'); p.vx=0;
if (s.wit.domain) Object.assign(s.wit.domain.rules, { input: false, zones: false, fakes: false }); s.wit.tiles = null;
S.BOSS_ABILITIES.finalJudgment.run(e, s, e.ai, p);
const j = s.wit.haz.find(h => h.kind === 'judgment');
for (let i=0;i<180;i++) { if (j.t >= j.delay - 0.08 && !j.cut && p.state !== 'block') p.setState('block'); s.step(1/60); if (i%6==0) console.log((i/60).toFixed(2), e.state, e.stunT.toFixed(2), j.t.toFixed(2), j.delay.toFixed(2), j.cut, p.state); }
