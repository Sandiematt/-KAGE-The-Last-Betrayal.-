// sword-arc filmstrip: ?w=<weapon>&dirs=fwd,up,...&enemy=<id>  — each row one directional cut stepped through the
// real simulation, columns at fixed frames; the last column overlays every frame (onion skin) to show the arc path
const Q = new URLSearchParams(location.search);
let sd = 12345; Math.random = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
const out = document.getElementById('out');
SaveManager.data = Logic.defaultSave();
const WPN = Q.get('w') || 'kagetsu';
const ADIRS = (Q.get('dirs') || 'fwd,up,down,diagUp,diagDown,dash,airUp,airDown').split(',');
const FR = (Q.get('fr') || '0,4,7,9,11,13,17,24').split(',').map(Number);
const CW = +(Q.get('cw') || 260), CH = +(Q.get('ch') || 330), Z = +(Q.get('z') || 0.62);
const enemyId = Q.get('enemy');
function mkWorld() {
  const fx = new Effects();
  return { fx, time: 0, bounds: { l: -4000, r: 4000 }, fighters: [], projectiles: [], pickups: [], hazards: [],
    opponentOf: () => null, onMoveStart() {}, onPlayerAction() {}, spawnProjectile() {}, spawnShock() {}, onHit() {} };
}
function mk(world) {
  const f = enemyId ? makeEnemyFighter ? null : null : makePlayerFighter(SaveManager.data, { weapon: WPN, wlvl: 1 });
  return f;
}
const rows = ADIRS.length, cols = FR.length + 1;
out.width = cols * CW; out.height = rows * CH;
const g = out.getContext('2d');
g.fillStyle = '#1c1717'; g.fillRect(0, 0, out.width, out.height);
ADIRS.forEach((dir, r) => {
  const world = mkWorld();
  let f;
  if (enemyId) { const S = new FightSession({ mode: 'campaign', enemyId, env: 'highlands', diff: 1, ng: 0 }); f = S.enemy; f.x = 0; }
  else f = makePlayerFighter(SaveManager.data, { weapon: WPN, wlvl: 1 });
  world.fighters.push(f);
  poseFighter(f, null, 30); f.state = 'idle';
  for (let i = 0; i < 30; i++) f.update(STEP, world);
  const air = dir === 'airUp' || dir === 'airDown';
  if (air) { f.y = -160; f.grounded = false; f.vy = -200; f.setState('air'); for (let i = 0; i < 4; i++) f.update(STEP, world); }
  const id = f.weapon().dirs[dir];
  f.startMove(id, world);
  const total = Math.round((f.mdur[0] + f.mdur[1] + f.mdur[2]) * 60);
  const shots = [];
  const cell = (c, label, drawFn) => {
    const cx = c * CW, cy = r * CH;
    g.save(); g.beginPath(); g.rect(cx, cy, CW, CH); g.clip();
    g.fillStyle = (c + r) % 2 ? '#211b1a' : '#1d1817'; g.fillRect(cx, cy, CW, CH);
    g.strokeStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.moveTo(cx, cy + CH - 34); g.lineTo(cx + CW, cy + CH - 34); g.stroke();
    g.translate(cx + CW * 0.36, cy + CH - 34); g.scale(Z, Z); g.translate(-f.x * 0, 0);
    drawFn();
    g.restore();
    g.fillStyle = '#cfc6b4'; g.font = '12px sans-serif'; g.fillText(label, cx + 6, cy + 14);
  };
  const drawNow = (alpha) => {
    g.save(); g.translate(-f.x, 0); g.globalAlpha = alpha == null ? 1 : alpha;
    Renderer.drawTrails(g, f, world.time);
    f.draw(g, { rim: 'rgba(222,96,72,0.72)', light: { x: 0.55, y: -0.83 }, shadow: true });
    world.fx.drawWorldBack(g); world.fx.drawWorld(g);
    g.restore();
  };
  const onion = [];
  for (let i = 0; i <= Math.max(total, FR[FR.length - 1]); i++) {
    const k = FR.indexOf(i);
    const ph = ['ant', 'act', 'rec'][f.mphase] || '';
    if (k >= 0) cell(k, `${dir} ${id} f${i} ${f.state === 'move' ? ph : f.state}`, () => drawNow());
    if (i % 2 === 0 && i <= total) onion.push({ x: f.x, sk: JSON.parse(JSON.stringify(f.sk)) });
    f.update(STEP, world); world.fx.update(STEP, STEP); world.time += STEP;
  }
  // onion skin of the blade line and arms: the arc path
  cell(FR.length, `${dir}: arc path (${total}f, box ${JSON.stringify(MOVES[id].box)})`, () => {
    g.save(); g.translate(-f.x, 0);
    onion.forEach((o, i) => {
      const a = 0.25 + 0.75 * i / onion.length, s = o.sk;
      g.strokeStyle = `rgba(236,229,211,${a})`; g.lineWidth = 3;
      g.beginPath(); g.moveTo(s.fha.x, s.fha.y); g.lineTo(s.wt.x, s.wt.y); g.stroke();
      g.strokeStyle = `rgba(210,74,60,${a})`; g.lineWidth = 2;
      g.beginPath(); g.moveTo(s.shF.x, s.shF.y); g.lineTo(s.fel.x, s.fel.y); g.lineTo(s.fha.x, s.fha.y); g.stroke();
      g.fillStyle = `rgba(120,200,255,${a})`; g.beginPath(); g.arc(s.wt.x, s.wt.y, 3, 0, TAU); g.fill();
    });
    const m = MOVES[id];
    if (m.sweep) for (const [k, b] of m.sweep.entries()) { g.strokeStyle = k ? 'rgba(255,90,90,0.8)' : 'rgba(255,200,90,0.8)'; g.lineWidth = 1.5; g.strokeRect(onion[0].x + b[0] * f.scale * f.facing - (f.facing < 0 ? b[2] * f.scale : 0), b[1] * f.scale, b[2] * f.scale, b[3] * f.scale); }
    g.restore();
  });
});
document.title = 'ready';
