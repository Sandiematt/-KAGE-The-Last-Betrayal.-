// Spring bones for Kage's cloth: the cloak's eight chains, the two scarf tails, the front apron and the two tassels.
// The Godot rig exports them as bone chains with no animation tracks; each frame, after the AnimationMixer has posed
// the body, every chain bone's tail point is integrated (inertia, a pull back toward its rest direction, gravity,
// wind), kept at its bone's length, pushed out of the body's collision spheres, and the bone is turned to point at it.
// (The same idea as VRM spring bones, kept small.)
import * as THREE from 'three';

const _hw = new THREE.Vector3(), _rest = new THREE.Vector3(), _next = new THREE.Vector3(), _d = new THREE.Vector3(), _c = new THREE.Vector3();
const _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _bq = new THREE.Quaternion(), _from = new THREE.Vector3(), _to = new THREE.Vector3();

// per chain kind: stiffness (pull to rest, 1/s), drag (0..1 per frame at 60 fps), gravity (m/s^2), wind scale,
// tail radius for collisions, which collider group
export const SETTINGS = {
  cloak: { stiffness: 5.5, drag: 0.22, gravity: 3.5, wind: 0.12, radius: 0.025, group: 'legs' },
  scarf: { stiffness: 0.6, drag: 0.1, gravity: 1.2, wind: 1.0, radius: 0.02, group: 'upper' },
  apron: { stiffness: 3.0, drag: 0.25, gravity: 4.0, wind: 0.25, radius: 0.02, group: 'legs' },
  tassel: { stiffness: 0.8, drag: 0.16, gravity: 6.0, wind: 0.2, radius: 0.015, group: 'legs' },
  swordtassel: { stiffness: 0.6, drag: 0.14, gravity: 7.0, wind: 0.15, radius: 0.01, group: 'none' }
};

// collision spheres, attached to body bones: [bone, local offset, radius, group]
const COLLIDERS = [
  ['hips', [0, -0.03, 0.0], 0.155, 'legs'],
  ['thigh_L', [0, -0.08, 0.0], 0.125, 'legs'], ['thigh_L', [0, -0.22, 0.0], 0.12, 'legs'], ['thigh_L', [0, -0.36, 0.0], 0.11, 'legs'],
  ['shin_L', [0, -0.02, 0.01], 0.1, 'legs'], ['shin_L', [0, -0.16, 0.0], 0.09, 'legs'], ['shin_L', [0, -0.3, 0.0], 0.08, 'legs'],
  ['thigh_R', [0, -0.08, 0.0], 0.125, 'legs'], ['thigh_R', [0, -0.22, 0.0], 0.12, 'legs'], ['thigh_R', [0, -0.36, 0.0], 0.11, 'legs'],
  ['shin_R', [0, -0.02, 0.01], 0.1, 'legs'], ['shin_R', [0, -0.16, 0.0], 0.09, 'legs'], ['shin_R', [0, -0.3, 0.0], 0.08, 'legs'],
  ['chest', [0, 0.1, -0.02], 0.2, 'upper'], ['spine', [0, 0.06, -0.02], 0.18, 'upper'], ['hips', [0, 0.0, -0.02], 0.19, 'upper'],
  ['head', [0, 0.11, -0.02], 0.15, 'upper']
];

export class SpringBones {
  constructor(model) {
    this.joints = [];
    this.colliders = COLLIDERS.map(([b, o, r, g]) => ({ bone: model.getObjectByName(b), off: new THREE.Vector3(...o), r, g, c: new THREE.Vector3() }))
      .filter(c => c.bone);
    model.updateMatrixWorld(true);
    // a chain: prefix0 .. prefixN, each bone (but the last) springs toward its child
    const prefixes = new Set();
    model.traverse(o => { const m = /^(cloak\d+_|scarf[AB]_|apron_|tassel_|swordtassel_)0$/.exec(o.name); if (m) prefixes.add(m[1]); });
    for (const p of prefixes) {
      const kind = p.startsWith('cloak') ? 'cloak' : p.startsWith('scarf') ? 'scarf' : p.replace(/_$/, '');
      for (let j = 0; ; j++) {
        const bone = model.getObjectByName(p + j), child = model.getObjectByName(p + (j + 1));
        if (!bone || !child) break;
        const tail = child.getWorldPosition(new THREE.Vector3());
        this.joints.push({ bone, child, kind, s: SETTINGS[kind], restQ: bone.quaternion.clone(), restLocal: child.position.clone(),
          len: child.position.length(), tail, prev: tail.clone(), depth: j });
      }
    }
    // roots first, so every bone springs from its already-moved parent
    this.joints.sort((a, b) => a.depth - b.depth);
    this.wind = new THREE.Vector3();
  }
  // jump to rest (no velocity): call after a teleport or a frozen-frame seek
  reset() {
    for (const J of this.joints) {
      J.bone.quaternion.copy(J.restQ); J.bone.updateMatrixWorld(true);
      J.child.getWorldPosition(J.tail); J.prev.copy(J.tail);
    }
  }
  update(dt, time) {
    dt = Math.min(dt, 1 / 30);
    for (const c of this.colliders) c.c.copy(c.off).applyMatrix4(c.bone.matrixWorld);
    for (const J of this.joints) {
      const { bone, s } = J;
      bone.quaternion.copy(J.restQ);
      bone.updateMatrixWorld(true);
      bone.getWorldPosition(_hw);
      _rest.copy(J.restLocal).applyMatrix4(bone.matrixWorld);           // where the tail would be at rest
      // verlet: inertia with drag, a pull toward the rest pose, gravity and wind
      const k = Math.pow(1 - s.drag, dt * 60);
      _next.copy(J.tail).sub(J.prev).multiplyScalar(k).add(J.tail);
      _next.addScaledVector(_d.subVectors(_rest, J.tail), Math.min(1, s.stiffness * dt));
      _next.y -= s.gravity * dt * dt;
      const gust = 0.65 + 0.35 * Math.sin(time * 2.7 + J.depth * 0.9) + 0.2 * Math.sin(time * 6.1 + J.depth * 2.3);
      _next.addScaledVector(this.wind, s.wind * gust * dt * dt * (1 + J.depth * 0.25));
      // keep the bone's length, then stay outside the body
      _next.sub(_hw).setLength(J.len).add(_hw);
      if (s.group !== 'none') for (const c of this.colliders) {
        if (c.g !== s.group) continue;
        const r = c.r + s.radius, dd = _next.distanceTo(c.c);
        if (dd < r) { _next.sub(c.c).setLength(r).add(c.c); _next.sub(_hw).setLength(J.len).add(_hw); }
      }
      J.prev.copy(J.tail); J.tail.copy(_next);
      // turn the bone from its rest direction to the tail
      _from.subVectors(_rest, _hw).normalize();
      _to.subVectors(_next, _hw).normalize();
      _q.setFromUnitVectors(_from, _to);
      bone.getWorldQuaternion(_bq);
      bone.parent.getWorldQuaternion(_pq);
      bone.quaternion.copy(_pq.invert().multiply(_q.multiply(_bq)));
      bone.updateMatrixWorld(true);
    }
  }
}
