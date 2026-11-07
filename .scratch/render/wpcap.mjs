import { spawn } from 'node:child_process'; import fs from 'node:fs';
const [url, out, w, h] = process.argv.slice(2);
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', port = 9900 + Math.floor(Math.random() * 90);
const prof = 'C:/Users/sande/AppData/Local/Temp/claude/af88188064ae6f1f/e295fdea-9530-4e0b-adc0-aae02d089f15/scratchpad/edge-' + port;
const p = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms)); let ws, id = 0; const pend = {};
const send = (m, pa) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method: m, params: pa })); });
try {
  let t; for (let k = 0; k < 40 && !t; k++) { await sleep(250); try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch (e) {} }
  ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d.result || d); delete pend[d.id]; } };
  await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable'); await send('Page.navigate', { url });
  for (let k = 0; k < 40; k++) { await sleep(250); const r = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true }); if (r.result.value === 'ready') break; }
  const s = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(out, Buffer.from(s.data, 'base64')); console.log('written', out);
} finally { try { ws.close(); } catch (e) {} p.kill(); }
