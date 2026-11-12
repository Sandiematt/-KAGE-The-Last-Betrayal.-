// builds .scratch/akari-game/game.html: the game with the KAGE handle and the stage/go harness
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const out = '.scratch/akari-game/game.html';
execFileSync(process.execPath, ['build.mjs', '--out', out], { stdio: 'ignore' });
let html = fs.readFileSync(out, 'utf8');
html = html.replace('window.KAGE = {', 'window.KAGE = { AkariArt, AkariRig, AkariGL, AkariSakura, AKARI_MOVES, Fighter, VFX, ');
html = html.replace('</body>', fs.readFileSync('.scratch/akari-game/harness.html', 'utf8') + '</body>');
fs.writeFileSync(out, html);
console.log('built', out, (html.length / 1e6).toFixed(1), 'MB');
