const { loadSim } = require('../../tests/helpers/load-sim.js');
const S = loadSim({ seed: 1, exports: ['MOVES','WEAPONS'] });
for (const id of process.argv[2].split(',')) { const m = S.MOVES[id]; const o = {...m}; delete o.a; delete o.w; delete o.s; delete o.f; console.log(JSON.stringify(o)); }
