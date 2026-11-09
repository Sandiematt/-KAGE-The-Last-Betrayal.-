// builds wt.html: the real game, Takashi's boss stage, past the intro; ?hp=<fraction> picks his phase (settled for
// `settle` frames), ?mv=<ability> runs one move with Kage at ?px, then `steps` frames of the real loop (simulate AND
// draw) and the loop frozen. ?jump=<frame> makes Kage jump then; ?kill=0 keeps Kage alive (huge health).
import fs from 'node:fs';
const html = fs.readFileSync('E:/PROJECTS/KAGE/KAGE/index.html', 'utf8');
const inject = `<script>
(function(){
  const Q = new URLSearchParams(location.search);
  setTimeout(() => {
    try {
      const b = document.querySelector('#boot'); if (b) b.style.display = 'none';
      const K = window.KAGE, G = K.Game;
      G.startFight(K.Logic.stageConfig(K.SaveManager.data, 'core.witness'), { skipBefore: true }); K.UIManager.show('hud');
      if (K.StoryPlayer && K.StoryPlayer.stop) try { K.StoryPlayer.stop(); } catch (e) {}
      setTimeout(() => {
        const s = G.session, e = s.enemy, p = s.player;
        for (let i = 0; i < 3000 && s.phase !== "fight"; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(1 / 60); s.fx.update(1 / 60, 1 / 60); }
        e.ai.decide = function () {}; e.ai.tryAbility = function () { return false; }; e.ai.readStrike = function () { return false; }; e.ai.formCd = 1e9;
        p.maxHp = p.hp = 5000;
        e.hp = e.maxHp * +(Q.get('hp') || 1);
        const lp = G.loop.bind(G); window.requestAnimationFrame = function () { return 0; };
        let ts = (G.last || performance.now());
        const tick = () => { ts += 1000 / 60; lp(ts); };
        const settle = +(Q.get('settle') || 0);
        for (let i = 0; i < settle; i++) tick();
        if (!Q.get('keep')) { e.x = +(Q.get('ex') || 0); p.x = +(Q.get('px') || 420); e.facing = 1; p.facing = -1; p.vx = e.vx = 0;
        if (e.abil) e.endAbility(s); e.setState('idle'); }
        if (Q.get('mv')) K.BOSS_ABILITIES[Q.get('mv')].run(e, s, e.ai, p);
        const n = +(Q.get('steps') || 0), jump = +(Q.get('jump') || -1);
        for (let i = 0; i < n; i++) { if (i === jump) { p.vy = -930; p.grounded = false; p.setState('air'); } tick(); }
        tick(); G.loop = function () {};
        const cc = s.tkCrack; document.title = 'crack ' + (cc ? [cc.alpha, cc.prompt, cc.done, cc.t.toFixed(2), cc.dur].join(',') : 'none') + ' hp ' + Math.round(p.hp) + ' alive ' + p.alive + ' phase ' + s.phase + ' p ' + p.x.toFixed(0) + ',' + p.y.toFixed(0) + ' ' + p.state + ' vis ' + p.visible + ' a ' + p.alpha + ' sc ' + p.scale.toFixed(2) + ' e ' + e.x.toFixed(0) + ' vis ' + e.visible + ' a ' + e.alpha + ' cam ' + s.cam.x.toFixed(0) + ',' + s.cam.y.toFixed(0) + ',' + s.cam.zoom.toFixed(2) + ' n ' + s.fighters.length;
      }, 80);
    } catch (e) { document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;top:0;color:#f88;z-index:99999;font-size:18px;background:#000">' + e.stack + '</pre>'); }
  }, 600);
  window.addEventListener('error', e => document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;top:40px;color:#f88;z-index:99999;font-size:16px;background:#000">' + (e.error && e.error.stack || e.message) + '</pre>'));
})();
</script>`;
fs.writeFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/render/wt.html', html.replace('</body>', inject + '</body>'));
console.log('ok');
