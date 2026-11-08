// Falling red petals (the game's stage ambience): flat sprites drifting down between the backdrop and the camera.
import * as THREE from 'three';
import { canvas, texture } from '../core/textures.js';

export function buildPetals(scene, count = 220) {
  const [c, g] = canvas(32, 32);
  g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(16, 16, 13, 7, 0.5, 0, Math.PI * 2); g.fill();
  const pos = new Float32Array(count * 3), vel = new Float32Array(count);
  const R = () => Math.random();
  for (let i = 0; i < count; i++) { pos[i * 3] = (R() - 0.5) * 22; pos[i * 3 + 1] = R() * 7; pos[i * 3 + 2] = -9 + R() * 12; vel[i] = 0.25 + R() * 0.45; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ map: texture(c), color: '#e0505a', size: 0.075, sizeAttenuation: true, transparent: true, depthWrite: false, opacity: 0.9, toneMapped: false });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  scene.add(pts);
  return {
    update(dt, time, scrollDx) {
      for (let i = 0; i < count; i++) {
        const k = i * 3;
        pos[k + 1] -= vel[i] * dt;
        pos[k] += (Math.sin(time * 1.3 + i) * 0.25 - 0.35) * dt - scrollDx * (0.5 + 0.5 * (pos[k + 2] + 9) / 12);
        if (pos[k + 1] < 0) { pos[k + 1] = 7; pos[k] = (Math.random() - 0.5) * 22; }
        if (pos[k] < -11) pos[k] += 22; else if (pos[k] > 11) pos[k] -= 22;
      }
      geo.attributes.position.needsUpdate = true;
    }
  };
}
