// count the Witness's plays per phase against the fighter bot (uses the duelw bot via a modified copy)
const fs = require('fs');
let src = fs.readFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/combat-witness/duelw.js', 'utf8');
src = src.replace("wrap(S.Budo, 'reel', () => cnt('reel'));", "wrap(S.Budo, 'reel', () => cnt('reel'));\n  { const st = S.FIGHT_STYLES.witness; if (st) { const d = st.decide; st.decide = function (ai, p, dist, tw) { const o = d.call(this, ai, p, dist, tw); cnt('decide' + ai.phase + (o ? 'T' : 'F')); if (ai.world.wit) cnt('lastPlay:' + ai.world.wit.lastPlay); return o; }; } }");
fs.writeFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/combat-witness/duelw2.js', src);
