// The 2D backdrop: flat painted layers (canvas textures on planes) at different depths behind the 3D character, like
// the game's parallax stages: smoky sky with the red moon, cloud bands, far mountains, a pagoda ridge, the town's
// rooftops and a torii gate near the front. Flat colour steps, no gradients (the game's ink look). Every layer but the
// sky tiles sideways, so when Kage walks it scrolls past at its own speed.
import * as THREE from 'three';
import { canvas, texture } from '../core/textures.js';

const W = 2048, H = 1024, GROUND = 0.76;   // the floor line in every painting
const rand = (s) => { let x = s; return () => ((x = (x * 16807) % 2147483647) / 2147483647); };

// draw f at x and at x +- W so shapes crossing the seam tile
const wrap = (g, f) => { for (const o of [-W, 0, W]) { g.save(); g.translate(o, 0); f(); g.restore(); } };

function paintSky() {
  const [c, g] = canvas(W * 2, H);   // one wide painting, never tiled: one moon
  const bands = ['#120d0d', '#160f0f', '#1b1312', '#201716', '#261b19', '#2b1f1d'];
  bands.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, (i / bands.length) * H * 0.82, W * 2, H); });
  // the red moon: a wide soft disc, then the solid sun-red core (video-frames/01-idle-stance)
  const mx = W * 0.94, my = H * 0.4;
  g.fillStyle = 'rgba(150,34,34,0.38)'; g.beginPath(); g.arc(mx, my, H * 0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(160,40,38,0.32)'; g.beginPath(); g.arc(mx, my, H * 0.135, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8f2724'; g.beginPath(); g.arc(mx, my, H * 0.075, 0, Math.PI * 2); g.fill();
  // a few faint stars
  const r = rand(7); g.fillStyle = 'rgba(230,200,190,0.35)';
  for (let i = 0; i < 180; i++) g.fillRect(r() * W * 2, r() * H * 0.5, 2, 2);
  return c;
}
function paintClouds() {
  const [c, g] = canvas(W, H), r = rand(11);
  for (let i = 0; i < 14; i++) {
    const x = r() * W, y = H * (0.12 + r() * 0.45), w = 260 + r() * 520, h = 22 + r() * 34;
    wrap(g, () => { g.fillStyle = i % 2 ? 'rgba(70,52,48,0.28)' : 'rgba(54,40,38,0.32)'; g.beginPath(); g.ellipse(x, y, w, h, 0, 0, Math.PI * 2); g.fill(); });
  }
  return c;
}
function ridge(g, seed, base, amp, step, col, edge) {
  const r = rand(seed), pts = [];
  for (let x = 0; x <= W; x += step) pts.push([x, base - amp * (0.35 + 0.65 * r())]);
  pts[pts.length - 1][1] = pts[0][1];   // seamless
  g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
  for (const [x, y] of pts) g.lineTo(x, y);
  g.lineTo(W, H); g.closePath(); g.fill();
  if (edge) { g.strokeStyle = edge; g.lineWidth = 3; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
}
function paintMountains() {
  const [c, g] = canvas(W, H);
  ridge(g, 3, H * 0.6, H * 0.3, 170, '#2a201f', 'rgba(120,70,60,0.25)');
  ridge(g, 5, H * 0.68, H * 0.2, 120, '#241b1a', null);
  return c;
}
function pagoda(g, x, base, s, col) {
  g.fillStyle = col;
  for (let i = 0; i < 5; i++) {
    const y = base - i * 46 * s, w = (120 - i * 16) * s;
    g.fillRect(x - w * 0.32, y - 30 * s, w * 0.64, 30 * s);
    g.beginPath(); g.moveTo(x - w * 0.62, y - 26 * s); g.quadraticCurveTo(x, y - 52 * s, x + w * 0.62, y - 26 * s); g.lineTo(x + w * 0.5, y - 36 * s); g.quadraticCurveTo(x, y - 60 * s, x - w * 0.5, y - 36 * s); g.closePath(); g.fill();
  }
  g.fillRect(x - 3 * s, base - 300 * s, 6 * s, 80 * s);
}
function paintRidge() {
  const [c, g] = canvas(W, H), r = rand(21), base = H * GROUND - 40;
  ridge(g, 9, base - 30, 90, 90, '#1f1716', null);
  for (const x of [W * 0.16, W * 0.71]) wrap(g, () => pagoda(g, x, base - 20, 1.2, '#1c1514'));
  // pines
  g.fillStyle = '#1a1312';
  for (let i = 0; i < 26; i++) { const x = r() * W, h = 60 + r() * 90; wrap(g, () => { g.beginPath(); g.moveTo(x, base - h); g.lineTo(x + 26, base); g.lineTo(x - 26, base); g.closePath(); g.fill(); }); }
  return c;
}
function house(g, x, w, h, base, col, lit) {
  g.fillStyle = col;
  g.fillRect(x - w / 2, base - h, w, h);
  g.beginPath(); g.moveTo(x - w * 0.72, base - h + 8); g.quadraticCurveTo(x, base - h - 26, x + w * 0.72, base - h + 8);
  g.lineTo(x + w * 0.5, base - h - 22); g.quadraticCurveTo(x, base - h - 52, x - w * 0.5, base - h - 22); g.closePath(); g.fill();
  if (lit) { g.fillStyle = 'rgba(190,120,70,0.5)'; g.fillRect(x - w * 0.15, base - h * 0.6, w * 0.16, h * 0.22); }
}
function paintTown() {
  const [c, g] = canvas(W, H), r = rand(33), base = H * GROUND;
  for (let x = 40; x < W; x += 130 + r() * 90) { const w = 120 + r() * 80, h = 70 + r() * 70, lit = r() < 0.35; wrap(g, () => house(g, x, w, h, base, '#191312', lit)); }
  // fence posts
  g.fillStyle = '#140f0e';
  for (let x = 0; x < W; x += 64) { g.fillRect(x, base - 46, 6, 46); }
  g.fillRect(0, base - 34, W, 4);
  return c;
}
function paintGate() {
  const [c, g] = canvas(W, H), base = H * GROUND;
  const torii = (x, s) => {
    g.fillStyle = '#120c0c';
    g.fillRect(x - 150 * s, base - 300 * s, 22 * s, 300 * s); g.fillRect(x + 128 * s, base - 300 * s, 22 * s, 300 * s);
    g.fillRect(x - 175 * s, base - 255 * s, 350 * s, 16 * s);
    g.beginPath(); g.moveTo(x - 215 * s, base - 300 * s); g.quadraticCurveTo(x, base - 285 * s, x + 215 * s, base - 300 * s);
    g.lineTo(x + 200 * s, base - 325 * s); g.quadraticCurveTo(x, base - 310 * s, x - 200 * s, base - 325 * s); g.closePath(); g.fill();
    g.fillStyle = 'rgba(160,40,40,0.35)'; g.fillRect(x - 200 * s, base - 327 * s, 400 * s, 3 * s);   // the moon's red on its top edge
    g.fillStyle = '#7a5a38'; g.fillRect(x - 20 * s, base - 240 * s, 40 * s, 28 * s);                 // the plaque
  };
  wrap(g, () => torii(W * 0.18, 1.0));
  wrap(g, () => { g.fillStyle = '#100a0a'; g.beginPath(); g.moveTo(W * 0.66, base); g.lineTo(W * 0.74, base - 70); g.lineTo(W * 0.86, base); g.closePath(); g.fill(); });   // a rock
  return c;
}

const LAYERS = [
  // painter, depth (z), scroll: 1 = true parallax at its depth (the clouds also drift, the sky stays)
  { paint: paintSky, z: -70, scroll: 0, sky: true },
  { paint: paintClouds, z: -58, scroll: 0.6 },
  { paint: paintMountains, z: -44, scroll: 1 },
  { paint: paintRidge, z: -30, scroll: 1 },
  { paint: paintTown, z: -17, scroll: 1 },
  { paint: paintGate, z: -8.5, scroll: 1 }
];

// Every layer is sized so it spans the view the same way at its own depth (its painted floor line on the world floor,
// its top a little above the top of the view): the paintings keep their proportions on screen, like the 2D game's
// parallax stage, and the true depth gives the parallax when the camera or Kage moves.
export function buildBackdrop(scene, camera, target) {
  const layers = [], cam = camera.position, tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const pitch = Math.atan2(target.y - cam.y, cam.z - target.z);
  for (const L of LAYERS) {
    const D = cam.z - L.z;
    // the top of the view at this depth, and the floor line (y = 0) below it
    const top = cam.y + D * Math.tan(pitch + Math.atan(tanH));
    const h = (top * 1.08) / GROUND, tiles = L.sky ? 1 : 4, wPlane = h * (L.sky ? 4 : 2 * tiles);
    const tex = texture(L.paint());
    tex.wrapS = THREE.RepeatWrapping; tex.repeat.x = tiles;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: !L.sky, depthWrite: false, fog: false, toneMapped: false });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(wPlane, h), mat);
    m.position.set(0, h * (0.5 - (1 - GROUND)), L.z);   // the painted floor line sits on y = 0
    m.renderOrder = -10;
    scene.add(m); layers.push({ L, tex, m, D });
  }
  // the 3D floor in front of the backdrop: dark earth with faint plank-like streaks, fogged into the paintings
  const [c, g] = canvas(512, 512), r = rand(5);
  g.fillStyle = '#171110'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) { g.fillStyle = r() < 0.5 ? 'rgba(48,32,30,0.3)' : 'rgba(6,4,4,0.35)'; g.fillRect(r() * 512, r() * 512, 40 + r() * 140, 2 + r() * 2); }
  const ft = texture(c); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(60, 24);
  // reaches far back under every layer; the fog fades it into the paintings
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 120), new THREE.MeshBasicMaterial({ map: ft, toneMapped: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -50);
  scene.add(floor);
  return {
    // scroll by `dx` world units of floor
    scroll(dx) {
      for (const { L, tex, m } of layers) if (L.scroll) tex.offset.x += dx * L.scroll / m.geometry.parameters.width * tex.repeat.x;
      ft.offset.x += dx / 300 * ft.repeat.x;
    }
  };
}
