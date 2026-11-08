// Kage 3D test: Kage as designed and rigged in Godot (godot/kage -> assets/kage.glb), toon-shaded with ink outlines,
// in front of the game's flat 2D painted backdrop.
// URL parameters (screenshots): ?anim=idle|walk|slash  &t=<seconds>: freeze then  &yaw=<deg>  &orbit=<deg>  &zoom=<x>
// &ty=<camera target height>  &eyes=neutral|focused|awakened  &outline=0
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { TOON } from './core/toon.js';
import { buildBackdrop } from './background/layers.js';
import { buildPetals } from './background/petals.js';
import { Kage } from './kage/kage.js';
import { SlashTrail } from './fx/slash-trail.js';
import { radialTexture } from './core/textures.js';

const Q = new URLSearchParams(location.search);
const canvasEl = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
const effect = new OutlineEffect(renderer, { defaultThickness: 0.004, defaultColor: [0.02, 0.008, 0.008], defaultAlpha: 1 });
let outlines = Q.get('outline') !== '0';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#140e0d');
scene.fog = new THREE.Fog('#1f1615', 9, 34);

const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 300);
camera.position.set(0, 0.78, 5.6);   // a little below his chest, looking up slightly: the horizon sits low, as in the game
const target = new THREE.Vector3(0, +(Q.get('ty') || 1.08), 0);
camera.lookAt(target);

// a warm key from the upper front, a dim fill, and the red moon behind him as a back light
scene.add(new THREE.HemisphereLight('#6d5856', '#120b0b', 1.15));
const key = new THREE.DirectionalLight('#fff0e0', 2.4); key.position.set(2.6, 4.5, 5); scene.add(key);
const moon = new THREE.DirectionalLight('#ff3a30', 1.2); moon.position.set(-1.5, 2.5, -6); scene.add(moon);

// the 2D world: painted layers, petals, a soft ground shadow (none of them get outlines)
const backdrop = buildBackdrop(scene, camera, target);
const petals = buildPetals(scene);
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.75)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.004; shadow.scale.set(1.3, 0.62, 1);
scene.add(shadow);
const trail = new SlashTrail(scene, 11);
scene.traverse((o) => { if (o.material) o.material.userData.outlineParameters = { visible: false }; });

const controls = new OrbitControls(camera, canvasEl);
controls.target.copy(target);
controls.enablePan = false; controls.enableDamping = true;
controls.minDistance = 1.6; controls.maxDistance = 9;
controls.minAzimuthAngle = -1.0; controls.maxAzimuthAngle = 1.0;     // keep the flat backdrop facing the camera
controls.minPolarAngle = 0.9; controls.maxPolarAngle = 1.66;
if (Q.get('orbit')) { const a = THREE.MathUtils.degToRad(+Q.get('orbit')), d = camera.position.distanceTo(target); camera.position.set(target.x + Math.sin(a) * d, camera.position.y, target.z + Math.cos(a) * d); }
if (Q.get('zoom')) camera.position.sub(target).multiplyScalar(1 / +Q.get('zoom')).add(target);
controls.update();

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 1 ? 30 * Math.min(1.8, 1.2 / (w / h)) : 30;   // a phone held upright: pull back
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

const kage = await Kage.load('./assets/kage.glb');
scene.add(kage.root);
// side-on, facing right as in the game, turned a little toward us so the 3D reads
const BASE_YAW = Math.PI / 2 - 0.5;
kage.root.rotation.y = BASE_YAW + THREE.MathUtils.degToRad(+(Q.get('yaw') || 0));

// ---- UI ----
const state = { turntable: false };
const buttons = [...document.querySelectorAll('.bar button')];
function refresh() {
  for (const b of buttons) {
    if (b.dataset.anim) b.classList.toggle('on', b.dataset.anim === kage.clip);
    if (b.dataset.eyes) b.classList.toggle('on', b.dataset.eyes === kage.expression);
    if (b.dataset.toggle === 'turntable') b.classList.toggle('on', state.turntable);
    if (b.dataset.toggle === 'outline') b.classList.toggle('on', outlines);
  }
}
function act(b) {
  if (b.dataset.anim) kage.play(b.dataset.anim);
  if (b.dataset.eyes) kage.setExpression(b.dataset.eyes);
  if (b.dataset.toggle === 'turntable') state.turntable = !state.turntable;
  if (b.dataset.toggle === 'outline') outlines = !outlines;
  refresh();
}
for (const b of buttons) b.addEventListener('click', () => act(b));
addEventListener('keydown', (e) => {
  const map = { 1: 'idle', 2: 'walk', 3: 'slash', ' ': 'slash' };
  if (map[e.key]) { e.preventDefault(); kage.play(map[e.key]); }
  else if (e.key === 't' || e.key === 'T') state.turntable = !state.turntable;
  else if (e.key === 'o' || e.key === 'O') outlines = !outlines;
  else if (e.key === 'e' || e.key === 'E') kage.setExpression({ neutral: 'focused', focused: 'awakened', awakened: 'neutral' }[kage.expression]);
  refresh();
});
if (Q.get('anim')) kage.play(Q.get('anim'));
if (Q.get('eyes')) kage.setExpression(Q.get('eyes'));
refresh();

// ---- the loop ----
const tip = new THREE.Vector3(), base = new THREE.Vector3(), keyDir = new THREE.Vector3(), wind = new THREE.Vector3(), hips = new THREE.Vector3();
let time = 0;
function frame(dt) {
  time += dt;
  if (state.turntable) kage.root.rotation.y += dt * 0.6;
  const walking = kage.clip === 'walk' || (kage.clip === 'slash' && kage.loopClip === 'walk');
  const dx = walking ? 1.35 * dt : 0;
  backdrop.scroll(dx); petals.update(dt, time, dx);
  // the wind blows from in front of him (and harder while he walks), so the scarf streams behind
  wind.set(0, 0, -1).applyQuaternion(kage.root.quaternion).multiplyScalar(walking ? 34 : 22).add(new THREE.Vector3(0, 3, 0));
  kage.update(dt, time, wind);
  kage.bladePoints(tip, base);
  const t = kage.actions.slash.time;
  trail.update(kage.clip === 'slash' && t > 0.2 && t < 0.58, tip, base);
  kage.model.getObjectByName('hips').getWorldPosition(hips);
  shadow.position.x = hips.x; shadow.position.z = hips.z;
  keyDir.copy(key.position).normalize().transformDirection(camera.matrixWorldInverse);
  TOON.lightDirView.value.copy(keyDir);
}
function draw() { if (outlines) effect.render(scene, camera); else renderer.render(scene, camera); }

if (Q.has('t')) {
  // a frozen frame: settle the cloth, run the clip up to t at 60 fps, then keep drawing that frame
  const T = +Q.get('t');
  for (let i = 0; i < 90; i++) { kage.mixer.update(0); kage.root.updateMatrixWorld(true); kage.springs.update(1 / 60, i / 60); }
  for (let t = 0; t < T; t += 1 / 60) frame(1 / 60);
  renderer.setAnimationLoop(() => { controls.update(); draw(); });
  document.title = 'ready';
} else {
  let last = performance.now();
  renderer.setAnimationLoop(() => {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    controls.update();
    frame(dt);
    draw();
  });
}
