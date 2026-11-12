// usage: node shot.mjs <url-or-file-relative>[?query] out.png [W,H] [budgetMs]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const here = 'E:/PROJECTS/KAGE/KAGE/.scratch/kage-new/';
const [, , target, out, size = '1536,1024', budget = '6000'] = process.argv;
const url = /^(https?|file):/.test(target) ? target : 'file:///' + here + target;
const outAbs = path.win32.normalize(here + out);
try { fs.unlinkSync(outAbs); } catch {}
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const ud = path.win32.normalize('C:/Users/sande/AppData/Local/Temp/claude/edge-kn');
spawn(EDGE, ['--headless=new', '--user-data-dir=' + ud, '--no-first-run', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--hide-scrollbars', '--window-size=' + size, '--virtual-time-budget=' + budget, '--screenshot=' + outAbs, url], { stdio: 'ignore', detached: true }).unref();
const t0 = Date.now();
const iv = setInterval(() => {
  if (fs.existsSync(outAbs) && fs.statSync(outAbs).size > 0) { clearInterval(iv); setTimeout(() => { console.log('written', fs.statSync(outAbs).size, ((Date.now() - t0) / 1000).toFixed(1) + 's'); process.exit(0); }, 400); }
  else if (Date.now() - t0 > 150000) { console.log('TIMEOUT'); process.exit(1); }
}, 250);
