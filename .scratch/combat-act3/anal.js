const fs = require('fs'), path = require('path');
let src = fs.readFileSync('E:/PROJECTS/KAGE/KAGE/tools/duel.js', 'utf8');
src = src.replace("require(path.join(__dirname, '..', 'tests', 'helpers', 'load-sim.js'))", "require('E:/PROJECTS/KAGE/KAGE/tests/helpers/load-sim.js')");
src = src.replace("path.join(__dirname, '..', 'tests', 'helpers', 'gameplay-lock.js')", "'E:/PROJECTS/KAGE/KAGE/tests/helpers/gameplay-lock.js'");
// instrumentation
src = src.replace("wrap(S.Combat, 'damage',", `
  { const G = global.__a = global.__a || {st:0,hit:0,blk:0,par:0,sec:0,idle:0,att:0,kHit:0};
    const sm = S.Fighter.prototype.startMove; S.Fighter.prototype.startMove = function(...a){ const ok = sm.apply(this,a); if (ok && !this.isPlayer && this.move && this.move.kind!=='counter') G.st++; return ok; };
    const ah = S.Combat.applyHit; S.Combat.applyHit = function(w, att, def, m, ...r){ const before = def.hp; const bs = def.state; const out = ah.call(this, w, att, def, m, ...r); if(!att.isPlayer && def.isPlayer){ if (def.hp < before) G.hit++; else if (bs==='block') G.blk++; } if (att.isPlayer && !def.isPlayer){ if (def.hp<before) G.kHit++; } return out; };
  }
  wrap(S.Combat, 'damage',`);
src += "\nconst G = global.__a; console.log('foe moves started/run', (G.st/RUNS).toFixed(1), 'landed on Kage', (G.hit/RUNS).toFixed(1), 'blocked', (G.blk/RUNS).toFixed(1), '| kage hits on foe', (G.kHit/RUNS).toFixed(1));\n";
fs.writeFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/combat-act3/_anal.js', src);
