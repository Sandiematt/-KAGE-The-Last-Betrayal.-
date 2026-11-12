const fs = require('fs');
let src = fs.readFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/combat-witness/duelw.js', 'utf8');
src = src.replace("wrap(S.Combat, 'damage', ([w, att, def, dmg, m]) => {", "wrap(S.Combat, 'damage', ([w, att, def, dmg, m]) => { if (first && !def.isPlayer) log('dmgToFoe', dmg.toFixed(1) + ' hp=' + def.hp.toFixed(0) + ' ' + (m && (m.id||m.stamp)) + ' by ' + att.def.id);");
fs.writeFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/combat-witness/duelw3.js', src);
