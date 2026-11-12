// node .scratch/akari-game/cap.mjs jobs.json
// jobs: [{ "q": "stage=act2.boss", "pre": 120, "shots": [{ "js": "...", "out": "x.png", "clip": [x,y,w,h] }] }]
// Opens .scratch/akari-game/game.html (the game + harness), waits for the fight, then per shot runs `js` with helpers
// adv(n) (step n sim frames and draw), place(d) (player d px from her), force(id) (run one of her abilities now),
// s, e (Akari), pl, and screenshots the page (optionally clipped).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9300 + Math.floor(Math.random() * 400);
const prof = 'C:/Users/sande/AppData/Local/Temp/claude/4c059dfae017858f/8fc21e84-20e9-4aa2-bb2c-3fcd3a0e86ed/scratchpad/edge-' + port;
const page = 'file:///' + path.resolve('.scratch/akari-game/game.html').replace(/\\/g, '/');
const p = spawn(EDGE, ['--headless=new', '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--window-size=1280,720', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pend = {};
const send = (method, params) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
try {
  let tgt;
  for (let k = 0; k < 80 && !tgt; k++) { await sleep(250); try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); tgt = l.find(t => t.type === 'page'); } catch (e) {} }
  ws = new WebSocket(tgt.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d.result || d); delete pend[d.id]; } };
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) return 'ERR ' + JSON.stringify(r.exceptionDetails).slice(0, 700); return r.result && r.result.value; };
  for (const job of jobs) {
    await send('Page.navigate', { url: `${page}?${job.q}&go=1&t0=900` });
    await sleep(+(job.wait || 6000));
    const ok = await ev(`(()=>{const K=window.KAGE,G=K.Game;G.loop=function(){};window.K=K;
      window.adv=(n)=>{const s=G.session;const draw=()=>{s.beginRender(1);try{K.Renderer.drawFight(s,G.t||1);}finally{s.endRender();}};for(let i=0;i<n;i++){if(s.fx.hitStop>0)s.fx.update(1/60,0);else{s.step(1/60);s.fx.update(1/60,1/60);}draw();}const t0=performance.now();draw();window.drawMs=performance.now()-t0;K.UIManager.hud.update(s);return {phase:s.phase,es:s.enemy&&s.enemy.state,ms:+window.drawMs.toFixed(1)}};
      window.place=(d)=>{const s=G.session,e=s.enemy,pl=s.player;pl.x=e.x-d*(e.facing||-1);if(Math.abs(pl.x)>2400)pl.x=e.x+d;e.facing=pl.x>e.x?1:-1;pl.facing=-e.facing;};
      window.force=(id,o)=>{const s=G.session,e=s.enemy,a=K.BOSS_ABILITIES[id];if(e.state==='move'){e.endMove();}e.setState('idle');e.ai.cds[id]=a.cd;a.run(e,s,e.ai,s.player,o);return e.state};
      window.hold=()=>{const s=G.session;s.enemy.ai.t=99;s.enemy.ai.update=function(){};s.player.ai=null;};
      const s=G.session;let k=0;while(s.phase!=='fight'&&k++<1200)adv(1);adv(${job.pre || 60});return s.phase+' '+(s.enemy&&s.enemy.def&&s.enemy.name)+' art:'+K.AkariArt.on(s.enemy)})()`);
    console.log(job.q, '->', ok);
    for (const sh of job.shots) {
      const v = await ev(`(()=>{const K=window.KAGE,s=K.Game.session,e=s.enemy,pl=s.player;${sh.js || ''};return adv(0)})()`);
      if (typeof v === 'string' && v.startsWith('ERR')) console.log(v);
      const dbg = await ev('JSON.stringify(window.dbg||null)'); if (dbg && dbg !== 'null') { console.log('  dbg', dbg); await ev('window.dbg=null'); }
      await sleep(60);
      const params = { format: 'png' };
      if (sh.clip) params.clip = { x: sh.clip[0], y: sh.clip[1], width: sh.clip[2], height: sh.clip[3], scale: 1 };
      const shot = await send('Page.captureScreenshot', params);
      fs.writeFileSync(sh.out, Buffer.from(shot.data, 'base64')); console.log('  shot', sh.out, JSON.stringify(v));
    }
  }
} catch (e) { console.error(e); }
finally { try { ws && ws.close(); } catch (e) {} p.kill(); }
