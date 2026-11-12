const { loadSim } = require('E:/PROJECTS/KAGE/KAGE/tests/helpers/load-sim.js');
const S = loadSim({ seed: 11, exports: ['FIGHT_STYLES', 'Budo'] });
S.SaveManager.data = S.Logic.defaultSave();
S.Game.playStory = (sid, done) => { if (done) done(); return false; }; S.Game.finishFight = () => {};
const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'act1.sub4'));
for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(1/60); }
const e = s.enemy, p = s.player; e.ai.decide = () => {}; e.ai.tryAbility = () => false; e.ai.t = 1e9; p.maxHp = p.hp = 5000;
e.x = 0; p.x = 330; e.facing = 1; p.facing = -1;
const oc = S.Budo.crit; S.Budo.crit = function (w, a, d, m, fr, co) { const r = oc.apply(this, arguments); console.log('crit?', a.isPlayer, r, a.braceCrit, w.time, a.critCd, d.state); return r; };
S.BOSS_ABILITIES.shidenBrace.run(e, s, e.ai, p); const u0 = e.abil.update; e.abil.update = function (f, w, t, dt) { const r = u0.call(this, f, w, t, dt); if (this.thrust != null) console.log('upd', t.toFixed(2), this.hit, f.x|0, p.x|0, p.invuln, JSON.stringify(p.hurtbox({})), JSON.stringify(S.fbox ? 0 : 0)); return r; };
for (let i = 0; i < 24; i++) s.step(1/60);
p.invuln = 0; S.InputManager.virtualDown('left');
for (let i = 0; i < 48; i++) { s.step(1/60); }
console.log(p.hp, p.state);
