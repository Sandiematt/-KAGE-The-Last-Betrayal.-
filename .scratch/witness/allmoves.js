// Runs every Witness ability in the real simulation, phase by phase, reporting errors and what happened.
const { loadSim } = require('../../tests/helpers/load-sim');
const DT = 1 / 60;
function fight(hpFrac, seed) {
  const S = loadSim({ seed: seed || 5, console: { log() {}, warn() {}, error: console.error, info() {} } });
  S.SaveManager.data = S.Logic.defaultSave();
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, 'core.witness'));
  for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
  const e = s.enemy, p = s.player;
  e.ai.decide = () => {}; e.ai.tryAbility = () => false;
  p.maxHp = p.hp = 5000;
  if (hpFrac != null) e.hp = e.maxHp * hpFrac;
  const run = (sec, each) => { for (let i = 0; i < sec * 60; i++) { if (each) each(i); s.step(DT); } };
  return { S, s, e, p, run };
}
const phases = { 0: ['voidSlash', 'echoStep', 'orbitBlades', 'phantomCounter'], 1: ['echoBind', 'reversal', 'inputDelay', 'mirrorSelf', 'rageSuppression', 'forcedEchoStep'],
  2: ['realityRewrite', 'healthDrain', 'gravityCollapse', 'executionFrames', 'falseDeath'], 3: ['absoluteControl', 'nullProtocol', 'echoExecution', 'timelineBreak', 'finalJudgment'] };
const fr = { 0: 1, 1: 0.7, 2: 0.45, 3: 0.2 };
for (const ph of [0, 1, 2, 3]) {
  const F = fight(fr[ph]);
  F.run(ph === 3 ? 12 : 6);   // the phase shift (and Echo Genesis in IV)
  const W = F.s.wit;
  console.log(`phase ${ph}: wit.phase ${W.phase} state ${W.state} domain ${W.domain ? W.domain.state + ' anchors ' + W.domain.anchors.length : '-'}`);
  for (const id of phases[ph]) {
    try {
      F.e.abil = null; F.e.setState('idle'); F.e.x = 0; F.p.x = 380; F.p.hp = F.p.maxHp; F.e.hp = F.e.maxHp * fr[ph] * 0.9;
      if (id === 'timelineBreak' && !W.history.length) W.history.push('voidSlash');
      if (id === 'phantomCounter') W.log.push('weapon', 'weapon', 'weapon', 'weapon', 'weapon', 'weapon');
      const hp0 = F.p.hp;
      F.S.BOSS_ABILITIES[id].run(F.e, F.s, F.e.ai, F.p);
      let mods = 0, haz = 0;
      F.run(4, () => { mods = Math.max(mods, W.mods.length); haz = Math.max(haz, W.haz.length); });
      const log = W.atkLog[W.atkLog.length - 1];
      console.log(`  ${id.padEnd(16)} dmg ${Math.round(hp0 - F.p.hp)} mods ${mods} haz ${haz} stages ${log ? log.join('>') : '-'}`);
    } catch (err) { console.log(`  ${id} ERROR ${err.stack.split('\n').slice(0, 4).join(' | ')}`); }
  }
}
