// builds kd.html: the real game, draws ONLY Kage in a grid of poses on a plain backdrop.
// query: set=<name> z=zoom cols=n bg=css face=1|-1 helmet= armor= w=
import fs from 'node:fs';
let html = fs.readFileSync('E:/PROJECTS/KAGE/KAGE/index.html', 'utf8');
html = html.replace('window.KAGE = {', 'window.KAGE = { Fighter, MOVES, ');
const inject = `<script>
(function(){
  const Q = new URLSearchParams(location.search);
  setTimeout(() => {
    try {
      const b = document.querySelector('#boot'); if (b) b.style.display = 'none';
      const K = window.KAGE, G = K.Game;
      const sv = K.SaveManager.data;
      if (Q.get('helmet')) sv.equipped && (sv.equipped.helmet = Q.get('helmet'));
      G.startFight(K.Logic.stageConfig(sv, Q.get('stage') || 'core.echo1'), { skipBefore: true }); K.UIManager.show('hud');
      if (K.StoryPlayer && K.StoryPlayer.stop) try { K.StoryPlayer.stop(); } catch (e) {}
      G.loop = function () {};
      const s = G.session, e = s.enemy, p = s.player;
      for (let i = 0; i < 3000 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(1 / 60); s.fx.update(1 / 60, 1 / 60); }
      e.ai.update = function () {}; e.maxHp = e.hp = 1e6; p.maxHp = p.hp = 1e6;
      if (Q.get('helmet')) p.helmet = Q.get('helmet');
      if (Q.get('armor')) p.armor = Q.get('armor');
      let want = {};
      K.InputManager.readCtrl = function (c) { for (const k in c) { if (typeof c[k] === 'boolean') c[k] = false; } c.dir = 0; c.tapDir = 0; c.aim = null; Object.assign(c, want); };
      const FL = +(Q.get('face') || 1);
      const adv = (n) => { for (let i = 0; i < n; i++) { e.x = p.x + 900 * FL; e.vx = 0; s.step(1 / 60); s.fx.update(1 / 60, 1 / 60); } };
      const SETS = {
        a: [['idle', {}, 1], ['walk', { dir: 1 }, 26], ['walk2', { dir: 1 }, 36], ['block', { blockHeld: true }, 20],
            ['k1', 'k1', 9], ['k1b', 'k1', 14], ['k2', 'k2', 11], ['k3', 'k3', 14],
            ['jump', { jumpP: true }, 14, { dir: 1 }], ['air', 'jumpka', 0], ['dash', { dashP: true, dir: 1 }, 5], ['hit', 'hit', 6]],
        review: [['idle', {}, 1], ['run', { dir: 1 }, 70], ['slash', 'k1', 14], ['block', { blockHeld: true }, 20], ['dash', { dashP: true, dir: 1 }, 5], ['hit', 'hit', 6]],
        idle: [['idle', {}, 1], ['idle2', {}, 40], ['walk', { dir: 1 }, 26], ['k2', 'k2', 11]],
        one: [[Q.get('n') || 'idle', Q.get('mv') || {}, +(Q.get('steps') || 1)]],
      };
      if (Q.get('live')) {
        // the real scene: the fighter posed, drawn by the game's own renderer on its own canvas
        const st = Q.get('live');
        want = {}; p.move = null; p.setState('idle'); p.vx = p.vy = 0; p.facing = 1; e.x = p.x + (+(Q.get('gap') || 360)); e.facing = -1;
        const run = (n) => { for (let i = 0; i < n; i++) { e.x = p.x + (+(Q.get('gap') || 360)); e.vx = 0; s.step(1 / 60); s.fx.update(1 / 60, 1 / 60); } };
        run(200);
        if (st === 'run') { want = { dir: 1 }; run(40); }
        else if (st !== 'idle') { p.startMove(st, s); run(+(Q.get('steps') || 10)); }
        if (s.beginRender) s.beginRender(1);
        K.Renderer.drawFight(s, G.t || 0);
        if (s.endRender) s.endRender();
        document.title = 'ok';
        return;
      }
      const cells = SETS[Q.get('set') || 'a'];
      const cols = +(Q.get('cols') || Math.min(cells.length, 4)), rows = Math.ceil(cells.length / cols);
      const CW = +(Q.get('cw') || 420), CH = +(Q.get('ch') || 440), z = +(Q.get('z') || 1.9);
      const W = CW * cols, Hh = CH * rows, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
      cv.style.cssText = 'position:fixed;left:0;top:0;z-index:999999';
      document.body.appendChild(cv);
      const ctx = cv.getContext('2d');
      ctx.fillStyle = Q.get('bg') || '#2b1a1c'; ctx.fillRect(0, 0, W, Hh);
      const flat = Q.get('flat');
      cells.forEach((c, i) => {
        want = {}; p.move = null; p.setState('idle'); p.x = 0; p.y = 0; p.vx = p.vy = 0; p.grounded = true; p.facing = FL; p.hitstun = 0;
        adv(+(Q.get('settle') || 260));
        const [name, act, n, hold] = c;
        if (act === 'hit') { p.setState('hit'); p.hitstun = 0.5; p.vx = -260 * FL; adv(n); }
        else if (act === 'jumpka') { want = { jumpP: true }; adv(1); want = {}; adv(16); p.startMove('ka', s); adv(8); }
        else if (typeof act === 'string') { p.startMove(act, s); adv(n); }
        else { want = act; adv(1); if (act.jumpP || act.dashP) want = hold || {}; adv(n - 1); }
        const cx = (i % cols) * CW, cy = Math.floor(i / cols) * CH;
        ctx.save(); ctx.beginPath(); ctx.rect(cx, cy, CW, CH); ctx.clip();
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(cx, cy + CH * 0.9, CW, CH * 0.1);
        ctx.setTransform(z, 0, 0, z, cx + CW / 2 - p.x * z, cy + CH * 0.9 - 0 * z);
        const o = { rim: 'rgba(255,146,90,0.8)', light: { x: 0.55, y: -0.83 }, shadow: false };
        if (flat) o.color = flat;
        p.draw(ctx, o);
        ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#987'; ctx.font = '13px monospace'; ctx.fillText(name + ' ' + p.state, cx + 8, cy + 16);
      });
      document.title = 'ok';
    } catch (err) { document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;top:0;color:#f88;z-index:9999999;font-size:18px;background:#000">' + err.stack + '</pre>'); }
  }, 700);
  window.addEventListener('error', e => document.body.insertAdjacentHTML('beforeend', '<pre style="position:fixed;top:40px;color:#f88;z-index:9999999;font-size:16px;background:#000">' + (e.error && e.error.stack || e.message) + '</pre>'));
})();
</script>`;
fs.writeFileSync('E:/PROJECTS/KAGE/KAGE/.scratch/kage-new/kd.html', html.replace('</body>', inject + '</body>'));
console.log('ok');
