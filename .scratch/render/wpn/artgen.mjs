// builds .scratch/render/wpn/art.html: the real built game (index.html) in a live fight with Kage holding ?w=<weapon>
// against ?en=<enemy>; his rage art fires at frame 0 and the real loop (simulate AND draw) runs; the frames listed in
// ?fr=a,b,c are copied into a filmstrip on #out (cells ?cw wide, 16:9). ?mv=<dir> runs a directional cut instead.
import fs from 'node:fs';
const html = fs.readFileSync('E:/PROJECTS/KAGE/KAGE/index.html', 'utf8');
const inject = `<script>
(function(){
  const Q = new URLSearchParams(location.search);
  setTimeout(() => {
    try {
      const b = document.querySelector('#boot'); if (b) b.style.display = 'none';
      const K = window.KAGE, G = K.Game, S = K.SaveManager.data, wid = Q.get('w') || 'kagetsu';
      S.owned.weapons[wid] = 1; S.equipped.weapon = wid;
      G.startFight({ mode: 'campaign', enemyId: Q.get('en') || 'order_ironclad', env: Q.get('env') || 'highlands', diff: 1, ng: 0 }, { skipBefore: true }); K.UIManager.show('hud');
      setTimeout(() => {
        const s = G.session, e = s.enemy, p = s.player;
        for (let i = 0; i < 3000 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(1 / 60); s.fx.update(1 / 60, 1 / 60); }
        e.ai.update = function () {};
        p.maxHp = p.hp = 5000; e.maxHp = e.hp = 5000;
        e.x = +(Q.get('ex') || 140); p.x = +(Q.get('px') || -140); e.facing = -1; p.facing = 1; p.vx = e.vx = 0; e.setState('idle'); p.setState('idle');
        const lp = G.loop.bind(G); window.requestAnimationFrame = function () { return 0; };
        let ts = (G.last || performance.now());
        const tick = () => { ts += 1000 / 60; lp(ts); };
        for (let i = 0; i < 20; i++) tick();
        const cv = document.querySelector('canvas');
        const fr = (Q.get('fr') || '0,10,20,30,40,50,60,70,80,90,100,110').split(',').map(Number);
        const cw = +(Q.get('cw') || 480), ch = Math.round(cw * cv.height / cv.width), cols = +(Q.get('cols') || 4);
        const out = document.createElement('canvas'); out.id = 'out'; out.width = cols * cw; out.height = Math.ceil(fr.length / cols) * ch;
        out.style.cssText = 'position:fixed;left:0;top:0;z-index:99999'; document.body.appendChild(out);
        const g = out.getContext('2d');
        if (Q.get('mv')) { p.startMove(p.weapon().dirs[Q.get('mv')], s); }
        else if (Q.get('str')) { /* weapon string: press weapon every 14 frames */ }
        else { p.rage = 100; p.doSpecial(s); }
        const last = fr[fr.length - 1];
        const log = [];
        for (let i = 0; i <= last; i++) {
          if (Q.get('str') && i % 14 === 0 && i < 70) { p.buf.weapon = 0.2; }
          const k = fr.indexOf(i);
          if (k >= 0) { g.drawImage(cv, (k % cols) * cw, ((k / cols) | 0) * ch, cw, ch); g.fillStyle = '#fff'; g.font = '14px sans-serif'; g.fillText('f' + i + ' ' + (p.abil ? p.abil.t.toFixed(2) : p.state) + ' ehp ' + Math.round(e.hp) + ' ' + e.state, (k % cols) * cw + 6, ((k / cols) | 0) * ch + 16); }
          tick();
        }
        G.loop = function () {};
        document.title = 'ready';
      }, 80);
    } catch (e) { document.body.innerText = 'ERR ' + e.stack; }
  }, 600);
  window.addEventListener('error', e => { document.body.innerText = 'ERR ' + (e.error && e.error.stack || e.message); });
})();
</script>`;
fs.writeFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/render/wpn/art.html', html.replace('</body>', inject + '</body>'));
console.log('ok');
