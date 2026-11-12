const { loadSim } = require('../../tests/helpers/load-sim.js');
const S = loadSim({ seed: 1, exports: ['FIGHT_STYLES'] });
for (const w of ['gate_kanabo','disciple_blade','conduit_naginata','silent_odachi','bokken','echo_rem_blade']) {
  const wp = S.WEAPONS[w];
  console.log('==', w, 'len', wp.len, 'moves', wp.moves, 'air', wp.air, 'counter', wp.counter);
  const ids = [...wp.moves, wp.air, wp.counter, ...Object.values(wp.dirs||{})].filter(Boolean);
  for (const id of [...new Set(ids)]) { const m = S.MOVES[id]; if(!m) continue;
    console.log(' ', id.padEnd(14), 't', JSON.stringify(m.t), 'dmg', m.dmg, 'gb', m.gb||0, 'kb', m.kb, 'up', m.up||0, 'kd', m.kd||0, 'imp', m.imp, 'box', JSON.stringify(m.box), 'lunge', m.lunge||0, 'armor', m.armor||0, 'low', m.low||0, 'aim', m.aim||'', m.label||'', 'next', m.next||'', m.multi?('multi '+m.multi):'', m.shock?'shock':'', m.unb?'unb':''); }
}
console.log('dirs gate', JSON.stringify(S.WEAPONS.gate_kanabo.dirs));
