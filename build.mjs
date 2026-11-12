// KAGE build: inlines src/styles.css, src/fonts/*.woff2 and src/js/*.js into one self-contained index.html.
// Usage: node build.mjs   (no dependencies)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, 'src');
const template = fs.readFileSync(path.join(src, 'index.template.html'), 'utf8');
const css = fs.readFileSync(path.join(src, 'styles.css'), 'utf8');
const jsDir = path.join(src, 'js');
// every .js under src/js, sub-folders included (src/js/21-characters/<character>/<part>.js), in path order
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(jsDir).filter(f => f.endsWith('.js')).map(f => path.relative(jsDir, f).split(path.sep).join('/')).sort();
const js = files.map(f => `/* ===== ${f} ===== */\n` + fs.readFileSync(path.join(jsDir, f), 'utf8')).join('\n\n');

// Embedded Google Fonts (SIL Open Font License) — inlined so the game runs fully offline / inside Capacitor.
const FONTS = [
  ['marker.woff2', 'KageBrush', 400],      // Permanent Marker — brush logo & big titles
  ['cinzel-600.woff2', 'KageSerif', 600],  // Cinzel — elegant headings, boss names
  ['cinzel-800.woff2', 'KageSerif', 800],
  ['teko-500.woff2', 'KageUI', 500],       // Teko — menus, labels, buttons
  ['teko-600.woff2', 'KageUI', 600],
  ['rajdhani-600.woff2', 'KageNum', 600],  // Rajdhani — HUD numbers & body text
  ['rajdhani-700.woff2', 'KageNum', 700],
  ['yuji-kanji.woff2', 'KageKanji', 400]   // Yuji Boku (subset) — brush calligraphy kanji
];
const fontDir = path.join(src, 'fonts');
const fontCss = FONTS.filter(([f]) => fs.existsSync(path.join(fontDir, f))).map(([f, fam, w]) =>
  `@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fs.readFileSync(path.join(fontDir, f)).toString('base64')}) format('woff2');}`
).join('\n');

// Images referenced from the CSS as url(img/NAME) are inlined as data URIs (keeps the single-file build).
const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml' };
let images = 0;
const cssInlined = css.replace(/url\(img\/([\w.-]+)\)/g, (m, name) => {
  const file = path.join(src, 'img', name);
  if (!fs.existsSync(file)) { console.warn('missing image', name); return m; }
  images++;
  return `url(data:${MIME[name.split('.').pop().toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(file).toString('base64')})`;
});

// JS can embed images too: the token __IMG(NAME)__ becomes a data URI of src/img/NAME.
const jsInlined = js.replace(/__IMG\(([\w.-]+)\)__/g, (m, name) => {
  const file = path.join(src, 'img', name);
  if (!fs.existsSync(file)) { console.warn('missing image', name); return m; }
  images++;
  return `data:${MIME[name.split('.').pop().toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(file).toString('base64')}`;
});

const out = template
  .replace('/*__CSS__*/', () => fontCss + '\n' + cssInlined)
  .replace('/*__JS__*/', () => `(function(){\n'use strict';\n${jsInlined}\n})();`);

// `--out <file>` writes the build somewhere else (render tools and parallel work build their own copy)
const outArg = process.argv.indexOf('--out');
const outFile = outArg > 0 && process.argv[outArg + 1] ? path.resolve(process.argv[outArg + 1]) : path.join(root, 'index.html');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`${path.relative(root, outFile) || outFile} written: ${(out.length / 1024).toFixed(1)} KB from ${files.length} modules + ${FONTS.length} fonts + ${images} images`);
