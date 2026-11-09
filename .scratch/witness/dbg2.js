const { loadSim } = require('../../tests/helpers/load-sim');
const DT = 1 / 60;
const S = loadSim({ seed: 11 });
S.SaveManager.data = S.Logic.defaultSave(); S.Game.playStory = (id, done) => { if (done) done(); return false; }; S.Game.finishFight = () => {};
const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'core.witness'));
for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
const e = s.enemy, p = s.player; e.ai.decide = () => {}; e.ai.tryAbility = () => false; p.maxHp = p.hp = 5000;
for (let i = 0; i < 6; i++) s.step(DT);
e.abil = null; e.setState('idle'); e.x = 0; e.facing = 1; p.x = 380; p.facing = -1; p.setState('idle');
S.BOSS_ABILITIES.voidSlash.run(e, s, e.ai, p);
for (let i = 0; i < 200; i++) {
  const near = s.wit.haz.some(h => h.kind === 'wave' && !h.hit && Math.abs(h.x - p.x) < 150 && Math.sign(p.x - h.x) === h.dir);
  if (near && p.grounded) { p.vy = -930; p.grounded = false; p.setState('air'); }
  const hp = p.hp; s.step(DT);
  const hb = p.hurtbox({});
  if (p.hp < hp || i % 8 === 0) console.log(i, 'p', p.x.toFixed(0), p.y.toFixed(0), p.state, 'hb', hb.y.toFixed(0), (hb.y + hb.h).toFixed(0), 'hp', Math.round(p.hp), 'waves', s.wit.haz.filter(h => h.kind === 'wave').map(h => h.x.toFixed(0) + (h.dir > 0 ? '>' : '<') + (h.hit ? '!' : '')).join(' '));
}
