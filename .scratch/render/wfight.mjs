// usage: node wfight.mjs <outPrefix> name~hpFrac~js~frames ...   (js runs with e, s, pl, K, ai in scope, then `frames` steps)
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const [prefix, ...shots] = process.argv.slice(2);
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9400 + Math.floor(Math.random() * 300);
const prof = 'C:/Users/sande/AppData/Local/Temp/claude/af88188064ae6f1f/e295fdea-9530-4e0b-adc0-aae02d089f15/scratchpad/edge-' + port;
const p = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pend = {};
const send = (method, params) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
try {
  let tgt;
  for (let k = 0; k < 40 && !tgt; k++) { await sleep(250); try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); tgt = l.find(t => t.type === 'page'); } catch (e) {} }
  ws = new WebSocket(tgt.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d.result || d); delete pend[d.id]; } };
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 800)); return r.result && r.result.value; };
  for (const shot of shots) {
    const [name, hp, js, frames] = shot.split('~');
    await send('Page.navigate', { url: `http://localhost:5317/.scratch/render/game.html?stage=core.witness&go=1&t0=800` });
    await sleep(+(process.env.WAIT || 4200));
    await ev(`(()=>{const K=window.KAGE,G=K.Game;G.loop=function(){};window.K=K;window.adv=(n)=>{const s=G.session;for(let i=0;i<n;i++){if(s.fx.hitStop>0)s.fx.update(1/60,0);else{s.step(1/60);s.fx.update(1/60,1/60);}}s.beginRender(1);try{K.Renderer.drawFight(s,G.t||1);}finally{s.endRender();}K.UIManager.hud.update(s);return {phase:s.phase,es:s.enemy.state,dx:Math.round(s.enemy.x-s.player.x)}};return 1})()`);
    const v = await ev(`(()=>{const s=K.Game.session;let k=0;while(s.phase!=='fight'&&k++<900)adv(1);
      const e=s.enemy,pl=s.player,ai=e.ai;e.hp=Math.round(e.maxHp*${+hp});adv(${+(process.env.PRE || 170)});
      for(let i=0;i<300&&!e.canAct();i++)adv(1);
      const dist=${process.env.DIST || 170};pl.x=e.x-dist*(e.facing||-1);if(Math.abs(pl.x)>2000)pl.x=e.x+dist;e.facing=pl.x>e.x?1:-1;pl.facing=-e.facing;adv(1);
      ${js || ''};
      const r=adv(${+frames});return Object.assign(r,{name:'${name}',st:e.state,hp:e.hp,ph:ai&&ai.phase,abil:e.abil&&e.abil.id})})()`);
    console.log(JSON.stringify(v));
    await sleep(200);
    const out = `${prefix}-${name}.png`;
    const sh = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(out, Buffer.from(sh.data, 'base64'));
    console.log('written', out);
  }
} catch (e) { console.error(e); }
finally { try { ws && ws.close(); } catch (e) {} p.kill(); }
