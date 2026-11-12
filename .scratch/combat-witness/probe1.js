const { loadSim } = require('E:/PROJECTS/KAGE/KAGE/tests/helpers/load-sim.js');
const S = loadSim({ seed: 1 });
const w = S.WEAPONS.witness_greatsword, o = S.WEAPONS.onikiri;
console.log(Object.keys(w), w.moves, w.dirs, w.counter, w.air, w.chain);
for (const id of [...(w.moves||[]), ...(Object.values(w.dirs||{})), w.counter, w.air]) { const m = S.MOVES[id]; if (m) console.log(id, JSON.stringify({t: m.t, dmg: m.dmg, kb: m.kb, hs: m.hs, gb: m.gb, imp: m.imp, aim: m.aim, kd: m.kd, box: m.box, lunge: m.lunge, next: m.next, kind: m.kind, armor: m.armor, unb: m.unb})); }
const e = S.ENEMIES.witness; console.log(e.hp);
const st = S.Logic.enemyStats(S.Logic.defaultSave(), {diff:5,pos:0}, 'witness'); console.log(st);
