// Character sheet renderer: draws any fighters in a grid of poses with the game's own drawing code, and screenshots it.
// It builds its OWN copy of the game from src/ (never touches index.html), so several people can render at once.
//
//   node tools/render/sheet.mjs --ids raikon,akari,kage --out .scratch/<you>/sheet.png
//
// Options (all optional except --ids and --out):
//   --ids a,b,c        ENEMIES ids; `kage` is the player (his equipped gear), `young_kage` the spar's young Kage
//   --poses a,b,c      idle (default), guard, hit, stun, taunt, attack (first weapon move's strike), windup, or any
//                      POSES name, or `move:<MOVES id>` / `wind:<MOVES id>` for a move's strike / wind-up keyframe
//   --head 1           crop every cell to the head (a close-up of the face); --zoom then defaults to 4.6
//   --zoom n           pixels per world unit (default 1.12: a whole fighter fits its cell)
//   --cell w,h         cell size in px (default 300,330; 300,300 with --head)
//   --cols n           cells per row (default: the number of poses, or 6 when there is one pose)
//   --face 1|-1        which way they look (default 1: to the right)
//   --flat '#fff'      draw the flat one-colour pass instead (the silhouette: outline, flash, afterimage)
//   --bg '#2b2326'     backdrop
//   --phase n          for a boss: 0-based phase to dress it in (eye, petal colour) where the fighter reads one
// Prints the PNG path when done. Needs Microsoft Edge (headless).
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 && process.argv[i + 1] != null ? process.argv[i + 1] : d; };
const ids = (arg('ids', '') || '').split(',').filter(Boolean);
const outArg = arg('out', '');
if (!ids.length || !outArg) { console.error('usage: node tools/render/sheet.mjs --ids a,b --out path/to/sheet.png [--poses ..] [--head 1] [--zoom n]'); process.exit(2); }
const out = path.resolve(root, outArg), dir = path.dirname(out);
fs.mkdirSync(dir, { recursive: true });
const head = !!arg('head', '');
const poses = (arg('poses', 'idle') || 'idle').split(',').filter(Boolean);
const [CW, CH] = (arg('cell', head ? '300,300' : '300,330')).split(',').map(Number);
const cells = ids.length * poses.length;
const cols = +arg('cols', poses.length > 1 ? poses.length : Math.min(ids.length, 6));
const rows = Math.ceil(cells / cols);
const cfg = { ids, poses, head, zoom: +arg('zoom', head ? 4.6 : 1.12), CW, CH, cols, face: +arg('face', 1), flat: arg('flat', ''), bg: arg('bg', '#2b2326'), phase: arg('phase', '') };

// 1. our own build
const html0 = path.join(dir, path.basename(out, '.png') + '.build.html');
execFileSync(process.execPath, [path.join(root, 'build.mjs'), '--out', html0], { stdio: 'ignore' });
let html = fs.readFileSync(html0, 'utf8');
fs.unlinkSync(html0);
if (!html.includes('window.KAGE = {')) { console.error('build has no window.KAGE handle'); process.exit(1); }
html = html.replace('window.KAGE = {', 'window.KAGE = { Fighter, MOVES, POSES, STANCES, makeFighterFromEnemy, makePlayerFighter, makeYoungKage, poseFighter, ');

// 2. the page script: pose each fighter and draw it into a grid
const page = `<script>
(function () {
  const CFG = ${JSON.stringify(cfg)};
  const fail = (e) => document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;top:0;left:0;color:#f88;z-index:9999999;font-size:15px;background:#000;white-space:pre-wrap">' + (e && e.stack || e) + '</pre>');
  window.addEventListener('error', (e) => fail(e.error || e.message));
  setTimeout(() => {
    try {
      const K = window.KAGE;
      if (K.Game) K.Game.loop = function () {};
      for (const el of Array.from(document.body.children)) if (el.tagName !== 'SCRIPT') el.style.display = 'none';
      const W = CFG.CW * CFG.cols, H = CFG.CH * Math.ceil(CFG.ids.length * CFG.poses.length / CFG.cols);
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:999999';
      document.body.appendChild(cv); document.body.style.background = CFG.bg;
      const ctx = cv.getContext('2d'); ctx.fillStyle = CFG.bg; ctx.fillRect(0, 0, W, H);
      const make = (id) => /^kage@/.test(id) ? K.makePlayerFighter(K.SaveManager.data, { x: 0, facing: CFG.face, helmet: id.slice(5) }) : id === 'kage' ? K.makePlayerFighter(K.SaveManager.data, { x: 0, facing: CFG.face })
        : id === 'young_kage' ? K.makeYoungKage({ x: 0, facing: CFG.face })
        : K.makeFighterFromEnemy(id, { x: 0, team: 1, facing: CFG.face });
      const POSE_OF = { idle: null, guard: 'blockArmed', hit: 'hit', stun: 'stun', taunt: 'taunt' };
      let n = 0;
      for (const id of CFG.ids) for (const pose of CFG.poses) {
        const cx = (n % CFG.cols) * CFG.CW, cy = Math.floor(n / CFG.cols) * CFG.CH; n++;
        let f, label = id + (CFG.poses.length > 1 ? ' · ' + pose : '');
        try {
          f = make(id);
          if (CFG.phase !== '' && f.def && f.def.phases && f.def.phases[+CFG.phase]) { const ph = f.def.phases[+CFG.phase]; if (ph.eye) f.eye = ph.eye; if (ph.petal) f.petal = ph.petal; }
          let name = pose in POSE_OF ? POSE_OF[pose] : pose;
          const w = f.weapon(), first = w.moves && w.moves[0];
          if (pose === 'attack' && first) name = 'move:' + first;
          if (pose === 'windup' && first) name = 'wind:' + first;
          if (name && /^(move|wind):/.test(name)) {
            const m = K.MOVES[name.slice(5)]; if (!m) throw new Error('no move ' + name.slice(5));
            K.POSES.__sheet = name[0] === 'm' ? m.s : m.w; name = '__sheet';
          }
          if (name && name !== '__sheet' && !K.POSES[name]) throw new Error('no pose ' + name);
          K.poseFighter(f, name, 160);
        } catch (e) { ctx.fillStyle = '#f88'; ctx.font = '12px monospace'; ctx.fillText(label + ': ' + e.message, cx + 6, cy + 30); continue; }
        ctx.save(); ctx.beginPath(); ctx.rect(cx, cy, CFG.CW, CFG.CH); ctx.clip();
        const z = CFG.zoom;
        if (CFG.head) ctx.setTransform(z, 0, 0, z, cx + CFG.CW / 2 - f.sk.head.x * z, cy + CFG.CH / 2 - f.sk.head.y * z);
        else { ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(cx, cy + CFG.CH * 0.9, CFG.CW, CFG.CH * 0.1); ctx.setTransform(z, 0, 0, z, cx + CFG.CW / 2 - f.x * z, cy + CFG.CH * 0.9); }
        const o = { rim: 'rgba(255,146,90,0.8)', light: { x: 0.55, y: -0.83 }, shadow: false };
        if (CFG.flat) o.color = CFG.flat;
        try { f.draw(ctx, o); } catch (e) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#f88'; ctx.font = '12px monospace'; ctx.fillText(String(e.message).slice(0, 60), cx + 6, cy + 46); }
        ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#c8b8b0'; ctx.font = '13px monospace'; ctx.fillText(label, cx + 8, cy + 16);
      }
      document.title = 'ok';
    } catch (e) { fail(e); }
  }, 600);
})();
</script>`;
const pageFile = path.join(dir, path.basename(out, '.png') + '.sheet.html');
fs.writeFileSync(pageFile, html.replace('</body>', page + '</body>'));

// 3. headless Edge screenshot (Edge returns at once, so poll for the file)
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
if (!EDGE) { console.error('Microsoft Edge not found; open ' + pageFile + ' in a browser instead'); process.exit(1); }
try { fs.unlinkSync(out); } catch {}
const ud = path.join(os.tmpdir(), 'kage-sheet-' + process.pid);
const size = `${CW * cols},${CH * rows}`;
spawn(EDGE, ['--headless=new', '--user-data-dir=' + ud, '--no-first-run', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--hide-scrollbars',
  '--window-size=' + size, '--virtual-time-budget=6000', '--screenshot=' + out, 'file:///' + pageFile.split(path.sep).join('/')], { stdio: 'ignore', detached: true }).unref();
const t0 = Date.now();
const iv = setInterval(() => {
  if (fs.existsSync(out) && fs.statSync(out).size > 0) {
    clearInterval(iv);
    setTimeout(() => { try { fs.unlinkSync(pageFile); } catch {} try { fs.rmSync(ud, { recursive: true, force: true }); } catch {} console.log(out); process.exit(0); }, 500);
  } else if (Date.now() - t0 > 120000) { console.error('TIMEOUT: no screenshot; the page is at ' + pageFile); process.exit(1); }
}, 250);
