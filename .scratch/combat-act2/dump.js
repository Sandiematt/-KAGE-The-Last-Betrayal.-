const { loadSim } = require('../../tests/helpers/load-sim.js');
const S = loadSim({ seed: 1, exports: ['MOVES','WEAPONS'] });
const fmt = m => m ? `${m.id} ${m.kind||''} dmg${m.dmg} w${(m.w||m.wind||'')} box${JSON.stringify(m.box)} dur${JSON.stringify(m.dur)} kb${m.kb} aim${m.aim||''} ${m.low?'low ':''}${m.unb?'unb ':''}${m.lunge?'lunge'+m.lunge:''} ${m.counter?'counter':''} ${m.chain||''}` : 'nil';
for (const id of process.argv[2].split(',')) {
  const w = S.WEAPONS[id];
  console.log('== ', id, 'stance', w.stance, 'moves', w.moves, 'counter', w.counter, 'air', w.air, 'dirs', JSON.stringify(w.dirs), 'special', w.special);
  const all = new Set([...(w.moves||[]), w.counter, w.air, ...Object.values(w.dirs||{})]);
  for (const m of all) if (m) console.log('  ', fmt(S.MOVES[m]));
}
console.log(Object.keys(S.MOVES.k1||{}), JSON.stringify(S.MOVES.k1));
