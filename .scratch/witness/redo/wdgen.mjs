// builds wd.html: the real game on the Witness fight; draws ONLY the Witness, big, on a plain backdrop.
// query: look=0..3  z=zoom  settle=frames  mv=<ability>  steps=frames after the move  pose=<state>
import fs from 'node:fs';
let html = fs.readFileSync('E:/PROJECTS/KAGE/KAGE/index.html', 'utf8');
html = html.replace('window.KAGE = {', 'window.KAGE = { WitnessBoss, Fighter, ');
const inject = `<script>
(function(){
  const Q = new URLSearchParams(location.search);
  setTimeout(() => {
    try {
      const b = document.querySelector('#boot'); if (b) b.style.display = 'none';
      const K = window.KAGE, G = K.Game;
      G.startFight(K.Logic.stageConfig(K.SaveManager.data, 'core.witness'), { skipBefore: true }); K.UIManager.show('hud');
      if (K.StoryPlayer && K.StoryPlayer.stop) try { K.StoryPlayer.stop(); } catch (e) {}
      G.loop = function () {};
      const s = G.session, e = s.enemy, p = s.player;
      for (let i = 0; i < 3000 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(1 / 60); s.fx.update(1 / 60, 1 / 60); }
      e.ai.decide = function () {}; e.ai.tryAbility = function () { return false; }; e.ai.readStrike = function () { return false; }; e.ai.formCd = 1e9;
      if (K.WitnessBoss.direct) K.WitnessBoss.direct = function () {};
      p.maxHp = p.hp = 5000;
      const look = +(Q.get('look') || 0);
      const lo = K.WitnessBoss.lookOf; K.WitnessBoss.lookOf = function (f) { return f && f.def && f.def.witness ? look : lo.call(this, f); };
      const FL = +(Q.get('face') || 1); e.x = 0; p.x = +(Q.get('px') || 600) * FL; e.facing = FL; p.facing = -FL;
      const adv = (n) => { for (let i = 0; i < n; i++) { s.step(1 / 60); s.fx.update(1 / 60, 1 / 60); e.x = 0; } };
      adv(+(Q.get('settle') || 90));
      if (Q.get('mv')) { K.BOSS_ABILITIES[Q.get('mv')].run(e, s, e.ai, p); adv(+(Q.get('steps') || 20)); }
      if (Q.get('t')) e.time = +Q.get('t');
      if (!Q.get('glitch')) { e.glitchAmount = () => 0; e.witnessFlicker = () => false; }
      const W = 1000, Hh = 1000, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
      cv.style.cssText = 'position:fixed;left:0;top:0;width:1000px;height:1000px;z-index:999999';
      document.body.appendChild(cv);
      const ctx = cv.getContext('2d');
      const bg = ctx.createLinearGradient(0, 0, 0, Hh); bg.addColorStop(0, '#2a0d10'); bg.addColorStop(1, '#170709');
      ctx.fillStyle = Q.get('bg') || '#26090c'; ctx.fillRect(0, 0, W, Hh);
      ctx.fillStyle = '#1a0507'; ctx.fillRect(0, Hh * 0.9, W, Hh);
      const z = +(Q.get('z') || 1.9);
      s.beginRender && s.beginRender(1);
      ctx.setTransform(z, 0, 0, z, W / 2 - e.x * z, Hh * 0.9 - e.y * z);
      const env = { rim: 'rgba(255,146,90,0.8)', light: { x: 0.7, y: -0.7 } };
      e.draw(ctx, { rim: env.rim, light: env.light, shadow: false });
      s.endRender && s.endRender();
      document.title = 'ok ' + e.state + ' ' + e.scale.toFixed(2) + ' look ' + look;
    } catch (err) { document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;top:0;color:#f88;z-index:9999999;font-size:18px;background:#000">' + err.stack + '</pre>'); }
  }, 700);
  window.addEventListener('error', e => document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;top:40px;color:#f88;z-index:9999999;font-size:16px;background:#000">' + (e.error && e.error.stack || e.message) + '</pre>'));
})();
</script>`;
fs.writeFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/witness/redo/wd.html', html.replace('</body>', inject + '</body>'));
console.log('ok');
