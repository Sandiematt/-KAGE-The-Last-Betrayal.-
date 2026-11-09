const { loadSim } = require('../../tests/helpers/load-sim');
const DT = 1 / 60;
const S = loadSim({ seed: 5 });
S.SaveManager.data = S.Logic.defaultSave(); S.Game.playStory = (id, done) => { if (done) done(); return false; }; S.Game.finishFight = () => {};
const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'core.witness'));
for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
const e = s.enemy, p = s.player; e.ai.decide = () => {}; e.ai.tryAbility = () => false; p.maxHp = p.hp = 5000; e.hp = e.maxHp * 0.7;
for (let i = 0; i < 360; i++) s.step(DT);
for (const id of ['forcedEchoStep', 'mirrorSelf']) {
  e.abil = null; e.setState('idle'); e.x = 0; p.x = 380; p.setState('idle'); p.vx = 0;
  S.BOSS_ABILITIES[id].run(e, s, e.ai, p);
  for (let i = 0; i < 150; i++) { s.step(DT); if (i % 10 === 0) console.log(id, i, e.wAtk && e.wAtk.stage, 'e', e.x.toFixed(0), e.facing, e.visible, 'p', p.x.toFixed(0), p.state, p.invuln.toFixed(2), Math.round(p.hp), 'haz', s.wit.haz.map(h => h.kind).join(',')); }
}
