import { spawn } from 'node:child_process';
const [q] = process.argv.slice(2);
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9700 + Math.floor(Math.random() * 200);
const prof = 'C:/Users/sande/AppData/Local/Temp/claude/af88188064ae6f1f/b959fe56-752e-4e98-acc9-0c1c76c0caea/scratchpad/edge-' + port;
const p = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pend = {};
const send = (method, params) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
try {
  let tgt;
  for (let k = 0; k < 40 && !tgt; k++) { await sleep(250); try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); tgt = l.find(t => t.type === 'page'); } catch (e) {} }
  ws = new WebSocket(tgt.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.method === 'Runtime.exceptionThrown') console.log('EXC', d.params.exceptionDetails.exception && d.params.exceptionDetails.exception.description); if (d.method === 'Runtime.consoleAPICalled') console.log('LOG', JSON.stringify(d.params.args).slice(0, 400)); if (d.id && pend[d.id]) { pend[d.id](d.result || d); delete pend[d.id]; } };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.navigate', { url: `http://localhost:5317/.scratch/render/arcs.html?${q}` });
  await sleep(5000);
} finally { try { ws && ws.close(); } catch (e) {} p.kill(); }
