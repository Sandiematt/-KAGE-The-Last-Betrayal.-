// usage: node dmgsrc.js foe bot runs  -> damage to Kage by source, plus whiff stats. Reuses duel.js by monkeypatching via env.
process.env.DUEL_SRC = '1';
const fs = require('fs'), path = require('path');
let src = fs.readFileSync(path.join(__dirname, '../../tools/duel.js'), 'utf8');
src = src.replace("wrap(S.Combat, 'damage', ([w, att, def, dmg]) => {", "wrap(S.Combat, 'damage', ([w, att, def, dmg, m]) => { if (def.isPlayer) { const k = (m && (m.id || m.stamp || (m.shDraw&&'draw')||'?')); (global.__src = global.__src || {})[k] = (global.__src[k]||0) + Math.max(1,dmg); }");
src = src.replace("require(path.join(__dirname, '..', 'tests'", "require(path.join('E:/PROJECTS/KAGE/KAGE/tools', '..', 'tests'");
src = src.replace(/path\.join\(__dirname, '\.\.', 'tests', 'helpers', 'gameplay-lock\.js'\)/, "path.join('E:/PROJECTS/KAGE/KAGE/tests/helpers/gameplay-lock.js')");
src += "\nconst o = global.__src||{}; const tot = Object.values(o).reduce((a,b)=>a+b,0); console.log('damage to kage by source (per run):', Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+Math.round(v/RUNS)).join(', '), 'total', Math.round(tot/RUNS));\n";
fs.writeFileSync(path.join(__dirname, '_duel_patched.js'), src);
