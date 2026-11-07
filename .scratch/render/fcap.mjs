// usage: node fcap.mjs jobs.json   jobs: [{ "q": "stage=act1.sub4" | "e=order_footman", "shots": [{ "js": "...", "out": "x.png" }] }]
// each job opens game.html (served at :5317), waits for the fight phase, then for each shot runs `js` (helpers: adv(n),
// s = session, e = enemy, pl = player, place(dist)) and screenshots the canvas page with the HUD
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9800 + Math.floor(Math.random() * 150);
const prof = 'C:/Users/sande/AppData/Local/Temp/claude/af88188064ae6f1f/5adfa3aa-2f2a-4fd9-9905-0be5ee6283d8/scratchpad/edge-' + port;
const base = process.env.BASE || 'http://localhost:5317/.scratch/render/game.html';
const p = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--window-size=1280,720', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pend = {};
const send = (method, params) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
try {
  let tgt;
  for (let k = 0; k < 60 && !tgt; k++) { await sleep(250); try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); tgt = l.find(t => t.type === 'page'); } catch (e) {} }
  ws = new WebSocket(tgt.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d.result || d); delete pend[d.id]; } };
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) return 'ERR ' + JSON.stringify(r.exceptionDetails).slice(0, 500); return r.result && r.result.value; };
  for (const job of jobs) {
    await send('Page.navigate', { url: `${base}?${job.q}&go=1&t0=800` });
    await sleep(+(job.wait || 4200));
    const ok = await ev(`(()=>{const K=window.KAGE,G=K.Game;G.loop=function(){};window.K=K;
      window.adv=(n)=>{const s=G.session;for(let i=0;i<n;i++){if(s.fx.hitStop>0)s.fx.update(1/60,0);else{s.step(1/60);s.fx.update(1/60,1/60);}}s.beginRender(1);try{K.Renderer.drawFight(s,G.t||1);}finally{s.endRender();}K.UIManager.hud.update(s);return {phase:s.phase,es:s.enemy&&s.enemy.state}};
      window.place=(d)=>{const s=G.session,e=s.enemy,pl=s.player;pl.x=e.x-d*(e.facing||-1);if(Math.abs(pl.x)>2400)pl.x=e.x+d;e.facing=pl.x>e.x?1:-1;pl.facing=-e.facing;};
      const s=G.session;let k=0;while(s.phase!=='fight'&&k++<900)adv(1);adv(${job.pre || 120});return s.phase+' '+(s.enemy&&s.enemy.def&&s.enemy.def.id)})()`);
    console.log(job.q, '->', ok);
    for (const sh of job.shots) {
      const v = await ev(`(()=>{const K=window.KAGE,s=K.Game.session,e=s.enemy,pl=s.player;${sh.js || ''};return adv(0)})()`);
      if (typeof v === 'string' && v.startsWith('ERR')) console.log(v);
      await sleep(200);
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(sh.out, Buffer.from(shot.data, 'base64')); console.log('  shot', sh.out, JSON.stringify(v));
    }
  }
} catch (e) { console.error(e); }
finally { try { ws && ws.close(); } catch (e) {} p.kill(); }
