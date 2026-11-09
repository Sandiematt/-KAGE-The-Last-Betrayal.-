const { loadSim } = require('../../tests/helpers/load-sim');
const DT = 1 / 60;
const S = loadSim({ seed: 11 });
S.SaveManager.data = S.Logic.defaultSave(); S.Game.playStory = (id, done) => { if (done) done(); return false; }; S.Game.finishFight = () => {};
const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'core.witness'));
for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
const e = s.enemy, p = s.player; e.ai.decide = () => {}; e.ai.tryAbility = () => false; p.maxHp = p.hp = 5000; e.hp = e.maxHp * 0.2;
for (let i = 0; i < 1200; i++) {
  s.step(DT);
  if (!isFinite(s.cam.x) || !isFinite(s.cam.zoom)) { console.log('NaN at', i, 'cine', JSON.stringify(s.cine && { t: s.cine.t }), 'p', p.x, p.y, 'e', e.x, e.y, 'phase', s.phase, 'wit', s.wit.state, s.wit.domain && s.wit.domain.state); break; }
}
console.log('done', s.cam);
