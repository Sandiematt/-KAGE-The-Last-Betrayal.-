// usage: node cdp.mjs <stage> <out.png> <script-js-expression-after-ready>
// launches headless Edge with a debug port, opens game.html, steps the fight via window.adv, screenshots
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const [stage, out, script] = process.argv.slice(2);
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9300 + Math.floor(Math.random() * 400);
const prof = 'C:/Users/sande/AppData/Local/Temp/claude/af88188064ae6f1f/8a34bc17-e6a2-44f5-b71a-2e15efc19c16/scratchpad/edge-' + port;
const p = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' });
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
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `http://localhost:5317/.scratch/render/game.html?stage=${stage}&go=1&t0=800` });
  await sleep(+(process.env.WAIT || 4000));
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result && r.result.value; };
  await ev(`(()=>{const K=window.KAGE,G=K.Game;G.loop=function(){};window.K=K;window.adv=(n)=>{const s=G.session;for(let i=0;i<n;i++){if(s.fx.hitStop>0)s.fx.update(1/60,0);else{s.step(1/60);s.fx.update(1/60,1/60);}}s.beginRender(1);try{K.Renderer.drawFight(s,G.t||1);}finally{s.endRender();}K.UIManager.hud.update(s);return {phase:s.phase,es:s.enemy.state,dx:Math.round(s.enemy.x-s.player.x)}};return 1})()`);
  const v = await ev(script);
  console.log(JSON.stringify(v));
  await sleep(300);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('written', out);
} catch (e) { console.error(e); }
finally { try { ws && ws.close(); } catch (e) {} p.kill(); }
