// builds .scratch/render/wpn/<name>.html from every game module (except boot) + wpn/<name>.js
import fs from 'node:fs'; import path from 'node:path';
const root = 'E:/PROJECTS/KAGE/KAGE', js = path.join(root, 'src/js');
const name = process.argv[2] || 'wpn';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(js).filter(f => f.endsWith('.js')).map(f => path.relative(js, f).split(path.sep).join('/')).filter(f => f !== '90-main.js').sort();
const src = files.map(f => fs.readFileSync(path.join(js, f), 'utf8')).join('\n;\n').replace(/__IMG\(([\w.-]+)\)__/g, (m, n) => '/src/img/' + n);
const h = fs.readFileSync(path.join(root, `.scratch/render/wpn/${name}.js`), 'utf8');
fs.writeFileSync(path.join(root, `.scratch/render/wpn/${name}.html`), `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#111}canvas{display:block}</style>
<canvas id=game width=1280 height=720 style="display:none"></canvas><canvas id=out></canvas>
<script>(function(){'use strict';\ntry{\n${src}\n;\n${h}\n}catch(e){document.body.innerText='ERR '+e.stack;}\n})();</script>`);
console.log('ok', files.length);
