const { loadSim } = require('../../../tests/helpers/load-sim');
const S = loadSim({ seed: 11, exports: ['WitnessBoss', 'BOSS_ABILITIES'] });
S.SaveManager.data = S.Logic.defaultSave();
S.Game.playStory = (id, done) => { if (done) done(); return false; };
S.Game.finishFight = () => {};
const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'core.witness'));
for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(1/60); }
const e = s.enemy, p = s.player;
e.ai.decide = () => {}; e.ai.tryAbility = () => false; S.WitnessBoss.direct = () => {};
p.maxHp = p.hp = 5000; e.x = 0; p.x = 600; e.facing = 1; p.facing = -1;
for (let i = 0; i < 60; i++) s.step(1/60);
const dump = (tag) => { const sk = e.sk, o = {}; for (const k in sk) if (sk[k] && sk[k].x != null) o[k] = [Math.round(sk[k].x - e.x), Math.round(sk[k].y - e.y)]; console.log(tag, e.state, 'scale', e.scale.toFixed(2), JSON.stringify(o)); };
dump('idle');
console.log('build', JSON.stringify(e.build), 'shape', e.shape());
const mv = process.argv[2];
if (mv) { S.BOSS_ABILITIES[mv].run(e, s, e.ai, p); for (let k = 0; k < 6; k++) { for (let i = 0; i < 10; i++) s.step(1/60); dump(mv + '+' + (k + 1) * 10); } }
