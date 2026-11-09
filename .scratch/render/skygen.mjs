// builds sky.html: the real game, Raikon's boss stage, Kage held far away, Skyfall cast at once, `steps` frames
// simulated, then one frame drawn and the loop frozen (?steps=N)
import fs from 'node:fs';
const html = fs.readFileSync('E:/PROJECTS/KAGE/KAGE/index.html', 'utf8');
const inject = `<script>
(function(){
  const Q = new URLSearchParams(location.search);
  setTimeout(() => {
    try {
      const b = document.querySelector('#boot'); if (b) b.style.display = 'none';
      const K = window.KAGE, G = K.Game;
      G.startFight(K.Logic.stageConfig(K.SaveManager.data, 'act1.boss'), { skipBefore: true }); K.UIManager.show('hud');
      if (K.StoryPlayer && K.StoryPlayer.stop) try { K.StoryPlayer.stop(); } catch (e) {}
      setTimeout(() => {
        const s = G.session, e = s.enemy, p = s.player;
        for (let i = 0; i < 90; i++) { s.step(1 / 60); s.fx.update(1 / 60, 1 / 60); }   // past the intro
        e.ai.decide = function () {}; e.ai.tryAbility = function () { return false; };
        e.x = 0; p.x = +(Q.get('px') || 640); e.facing = 1; p.facing = -1; p.vx = e.vx = 0;
        K.BOSS_ABILITIES.skyfall.run(e, s, e.ai);
        const n = +(Q.get('steps') || 0), dodge = +(Q.get('dodge') || 0);
        for (let i = 0; i < n; i++) {
          if (dodge && i > dodge && i < dodge + 16) p.x += 16;
          if (s.fx.hitStop > 0) s.fx.update(1 / 60, 0); else { s.step(1 / 60); s.fx.update(1 / 60, 1 / 60); }
        }
        const lp = G.loop.bind(G); let ts = (G.last || performance.now()) + 16; lp(ts); G.loop = function () {};
        document.title = 'hp ' + Math.round(p.hp);
      }, 80);
    } catch (e) { document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;top:0;color:#f88;z-index:99999;font-size:18px;background:#000">' + e.stack + '</pre>'); }
  }, 600);
  window.addEventListener('error', e => document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;top:40px;color:#f88;z-index:99999;font-size:16px;background:#000">' + (e.error && e.error.stack || e.message) + '</pre>'));
})();
</script>`;
fs.writeFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/render/sky.html', html.replace('</body>', inject + '</body>'));
console.log('ok');
