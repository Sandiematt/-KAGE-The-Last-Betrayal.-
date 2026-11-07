import fs from 'node:fs';
const p = 'E:/PROJECTS/KAGE/KAGE/src/js/21-anime-body.js';
let s = fs.readFileSync(p, 'utf8');
const a = s.indexOf('// sleeve (upper and fore, with a flared cuff) and the hand;'), b = s.indexOf('Fighter.prototype.animeTorsoDraw = function');
if (a < 0 || b < 0) throw new Error('anchors');
s = s.slice(0, a) + fs.readFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/render/arms.js', 'utf8') + s.slice(b);
fs.writeFileSync(p, s);
console.log('spliced');
