const { loadSim } = require('E:/PROJECTS/KAGE/KAGE/tests/helpers/load-sim.js');
const S = loadSim({ seed: 1, exports: ['UNARMED'] });
const k = S.WEAPONS.kagetsu;
console.log('kagetsu', k.moves, k.dirs, k.counter, k.air);
console.log('UNARMED', Object.keys(S.UNARMED));
const e = S.WEAPONS.mugen_no_ha; console.log('mugen', e && e.moves, e && e.dirs);
for (const id of ['k1','k2','k3','hk','dp','kunai']) { const m = S.MOVES[id]; if (m) console.log(id, m.kind, m.aim, m.t, m.dmg); }
const s = S.Logic.defaultSave(); console.log(s.equipped);
console.log(S.Logic.spamKey(S.MOVES.k1), S.Logic.spamKey(S.MOVES[k.dirs.fwd]));
