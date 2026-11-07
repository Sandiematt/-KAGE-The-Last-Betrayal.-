// usage: node ui.mjs <url> <script.json>   script: [{ "eval": "js", "wait": ms, "shot": "out.png", "clip": [x,y,w,h] }]
// launches its own headless Edge (killed by PID at the end), real time, 1280x720 viewport
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const [url, scriptPath] = process.argv.slice(2);
const steps = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9400 + Math.floor(Math.random() * 400);
const prof = 'C:/Users/sande/AppData/Local/Temp/claude/af88188064ae6f1f/5adfa3aa-2f2a-4fd9-9905-0be5ee6283d8/scratchpad/edge-' + port;
const p = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--window-size=1280,720', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pend = {};
const send = (method, params) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
try {
  let tgt;
  for (let k = 0; k < 60 && !tgt; k++) { await sleep(250); try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); tgt = l.find(t => t.type === 'page'); } catch (e) {} }
  ws = new WebSocket(tgt.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d.result || d); delete pend[d.id]; } };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  if (process.env.FREEZE) {
    // a deterministic page: Math.random reseeded every animation frame, and a clock that only moves while a frame
    // budget is left (window.__budget frames of 1/60 s each); with no budget the canvases redraw the same frame
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `(()=>{let sd=1,T=1000,fr=0;const rnd=()=>((sd=(sd*16807)%2147483647)/2147483647);Math.random=rnd;
      window.__budget=0;performance.now=()=>T;const D0=1700000000000;Date.now=()=>D0+T;
      const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=(cb)=>raf(()=>{if(window.__budget>0){window.__budget--;T+=1000/60;fr++;}sd=fr*7919+17;cb(T);});})();` });
  }
  await send('Page.navigate', { url });
  await sleep(2500);
  for (const s of steps) {
    if (s.eval) {
      const r = await send('Runtime.evaluate', { expression: s.eval, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) console.log('ERR', JSON.stringify(r.exceptionDetails).slice(0, 400)); else if (r.result && r.result.value !== undefined) console.log('=>', JSON.stringify(r.result.value).slice(0, 300));
    }
    if (s.key) { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: s.key, code: s.code || s.key, windowsVirtualKeyCode: s.vk || 0 }); }
    if (s.click) { for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: s.click[0], y: s.click[1], button: 'left', clickCount: 1 }); }
    if (s.wait) await sleep(s.wait);
    if (s.shot) {
      const prm = { format: 'png' }; if (s.clip) prm.clip = { x: s.clip[0], y: s.clip[1], width: s.clip[2], height: s.clip[3], scale: 1 };
      const shot = await send('Page.captureScreenshot', prm);
      fs.writeFileSync(s.shot, Buffer.from(shot.data, 'base64')); console.log('shot', s.shot);
    }
  }
} catch (e) { console.error(e); }
finally { try { ws && ws.close(); } catch (e) {} p.kill(); }
