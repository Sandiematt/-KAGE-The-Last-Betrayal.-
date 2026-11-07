import fs from 'node:fs';
const html = fs.readFileSync('E:/PROJECTS/KAGE/KAGE/index.html', 'utf8');
const inject = `<script>
(function(){
  const Q = new URLSearchParams(location.search);
  const key = (code, type) => window.dispatchEvent(new KeyboardEvent(type, { code, key: code, bubbles: true }));
  const tap = (code, at) => { setTimeout(() => key(code, 'keydown'), at); setTimeout(() => key(code, 'keyup'), at + 60); };
  setTimeout(() => {
    try {
      const b = document.querySelector('#boot'); if (b) b.style.display = 'none';
      const K = window.KAGE, stage = Q.get('stage');
      const cfg = stage ? K.Logic.stageConfig(K.SaveManager.data, stage) : { mode: 'campaign', enemyId: Q.get('e') || 'order_footman', env: Q.get('env') || 'highlands', diff: 1, ng: 0 };
      if (Q.get('w')) { K.SaveManager.data.owned.weapons[Q.get('w')] = 1; K.SaveManager.data.equipped.weapon = Q.get('w'); }
      if (Q.get('go')) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter' })); K.Game.startFight(cfg, { skipBefore: true }); K.UIManager.show('hud'); } else K.Game.startFight(cfg, { skipBefore: true });
      if (K.StoryPlayer && K.StoryPlayer.stop) try { K.StoryPlayer.stop(); } catch (e) {}
      const run = () => {
      const acts = (Q.get('keys') || '').split(',').filter(Boolean);
      acts.forEach(a => { const [code, at] = a.split('@'); tap(code, +at); });
      const steps = +(Q.get('steps') || 0);
      if (steps) { const G = K.Game; for (let i = 0; i < steps; i++) { if (G.session.fx.hitStop > 0) G.session.fx.update(1 / 60, 0); else { G.session.step(1 / 60); G.session.fx.update(1 / 60, 1 / 60); } } const lp = G.loop.bind(G); let ts = G.last || performance.now(); ts += 16; lp(ts); G.loop = function () {}; }
      };
      if (Q.get('go')) setTimeout(run, 60); else run();
      document.title = 'started';
    } catch (e) { document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;top:0;color:#f88;z-index:99999;font-size:18px;background:#000">' + e.stack + '</pre>'); }
  }, +(Q.get('t0') || 600));
  window.addEventListener('error', e => document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;top:40px;color:#f88;z-index:99999;font-size:16px;background:#000">' + (e.error && e.error.stack || e.message) + '</pre>'));
  const ce = console.error; console.error = function () { document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;bottom:0;color:#f88;z-index:99999;font-size:14px;background:#000">' + Array.from(arguments).map(a => a && a.stack || a).join(' ') + '</pre>'); ce.apply(console, arguments); };
})();
</script>`;
fs.writeFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/render/game.html', html.replace('</body>', inject + '</body>'));
console.log('ok');
