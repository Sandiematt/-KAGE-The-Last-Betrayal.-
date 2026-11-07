// usage: node hcap.mjs "<query>" out.png  — renders harness.html?<query> headless, saves the #out canvas
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const [q, out] = process.argv.slice(2);
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9700 + Math.floor(Math.random() * 200);
const prof = 'C:/Users/sande/AppData/Local/Temp/claude/af88188064ae6f1f/8a34bc17-e6a2-44f5-b71a-2e15efc19c16/scratchpad/edge-' + port;
const p = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pend = {};
const send = (method, params) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
try {
  let tgt;
  for (let k = 0; k < 40 && !tgt; k++) { await sleep(250); try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); tgt = l.find(t => t.type === 'page'); } catch (e) {} }
  ws = new WebSocket(tgt.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d.result || d); delete pend[d.id]; } };
  await send('Page.enable');
  await send('Page.navigate', { url: `http://localhost:5317/.scratch/render/harness.html?${q}` });
  let v;
  for (let k = 0; k < 60; k++) { await sleep(250); const r = await send('Runtime.evaluate', { expression: `document.title==='ready'?document.getElementById('out').toDataURL('image/png'):(document.body&&document.body.innerText.slice(0,400))`, returnByValue: true }); v = r.result && r.result.value; if (v && v.startsWith('data:image')) break; }
  if (!v || !v.startsWith('data:image')) { console.error('not ready:', v); } else { fs.writeFileSync(out, Buffer.from(v.split(',')[1], 'base64')); console.log('written', out); }
} catch (e) { console.error(e); }
finally { try { ws && ws.close(); } catch (e) {} p.kill(); }
