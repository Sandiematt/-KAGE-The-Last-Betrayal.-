// weapon sheet: per weapon a row: art-mode illustration, ink mode zoomed x4, flat silhouette, and Kage holding it (idle + a strike)
const Q = new URLSearchParams(location.search);
let sd = 12345; Math.random = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
SaveManager.data = Logic.defaultSave();
const IDS = (Q.get('ids') || 'kagetsu,tsubame,shizuka,onikiri,mizuchi,yamigama,iwakudaki').split(',');
const out = document.getElementById('out'), RH = 230;
out.width = 1700; out.height = IDS.length * RH;
const g = out.getContext('2d');
g.fillStyle = '#1b1616'; g.fillRect(0, 0, out.width, out.height);
IDS.forEach((id, r) => {
  const y0 = r * RH, w = WEAPONS[id], sh = twinShape(w, SHAPE[id], 0);
  g.fillStyle = r % 2 ? '#211a19' : '#1d1817'; g.fillRect(0, y0, out.width, RH);
  g.fillStyle = '#cfc6b4'; g.font = '13px sans-serif'; g.fillText(`${id} (${sh})`, 8, y0 + 16);
  // art mode (armory)
  const L = Math.min(380, (w.len || 80) * 2.6);
  g.save(); g.translate(30 + (sh === 'kb_mizuchi' ? 120 : 60), y0 + RH * 0.62); g.rotate(-0.32); drawWeaponShape(g, sh, L, 'art', 2.2, C.ink); g.restore();
  // ink mode zoomed
  g.save(); g.translate(500 + (sh === 'kb_mizuchi' ? 110 : 50), y0 + RH * 0.55); g.scale(2.4, 2.4); g.rotate(-0.25); drawWeaponShape(g, sh, w.len, 'ink', 1, C.ink, null); g.restore();
  // flat
  g.save(); g.translate(900 + (sh === 'kb_mizuchi' ? 60 : 20), y0 + RH * 0.55); g.scale(1.4, 1.4); g.rotate(-0.25); drawWeaponShape(g, sh, w.len, 'flat', 1, '#d24a3c', null); g.restore();
  // Kage idle and mid-strike
  const world = { fx: new Effects(), time: 0, bounds: { l: -4000, r: 4000 }, fighters: [], projectiles: [], pickups: [], hazards: [], opponentOf: () => null, onMoveStart() {}, onPlayerAction() {}, spawnProjectile() {}, spawnShock() {}, onHit() {} };
  [[1260, null], [1500, 'fwd']].forEach(([x, dir]) => {
    const f = makePlayerFighter(SaveManager.data, { weapon: id, wlvl: 1 });
    world.fighters.push(f); poseFighter(f, null, 30); f.state = 'idle';
    for (let i = 0; i < 30; i++) f.update(STEP, world);
    if (dir) { f.startMove(w.dirs[dir], world); const n = Math.round((f.mdur[0] + f.mdur[1] * 0.6) * 60); for (let i = 0; i < n; i++) f.update(STEP, world); }
    g.save(); g.translate(x, y0 + RH - 12); g.scale(0.85, 0.85); g.translate(-f.x, 0);
    f.draw(g, { rim: 'rgba(222,96,72,0.72)', light: { x: 0.55, y: -0.83 }, shadow: true });
    g.restore();
  });
});
document.title = 'ready';
