// builds harness.html: all game modules except boot + harness.js, in one scope
import fs from 'node:fs'; import path from 'node:path';
const root = 'E:/PROJECTS/KAGE/KAGE', js = path.join(root, 'src/js');
const files = fs.readdirSync(js).filter(f => f.endsWith('.js') && f !== '90-main.js').sort();
const src = files.map(f => fs.readFileSync(path.join(js, f), 'utf8')).join('\n;\n')
  .replace(/__IMG\(([\w.-]+)\)__/g, (m, n) => '/src/img/' + n);
const h = fs.readFileSync(path.join(root, '.scratch/render/harness.js'), 'utf8');
fs.writeFileSync(path.join(root, '.scratch/render/harness.html'), `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#111}canvas{display:block}</style>
<canvas id=game width=1280 height=720 style="display:none"></canvas><canvas id=out></canvas>
<script>(function(){'use strict';\n${src}\n;\n${h}\n})();</script>`);
console.log('ok', files.length);
