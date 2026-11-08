// The sword's smear: a ribbon between the blade's tip and base over the last few frames, fading along its length,
// crimson with a pale core (the game's Kagetsu moon-crescent arc, simplified).
import * as THREE from 'three';

export class SlashTrail {
  constructor(scene, n = 18) {
    this.n = n; this.tips = []; this.bases = [];
    this.pos = new Float32Array(n * 2 * 3); this.col = new Float32Array(n * 2 * 4);
    const idx = [];
    for (let i = 0; i < n - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.col, 4));
    this.geo.setIndex(idx);
    this.mesh = new THREE.Mesh(this.geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }
  // active: whether the blade is cutting now; tip, base: world points this frame
  update(active, tip, base) {
    if (active) { this.tips.unshift(tip.clone()); this.bases.unshift(base.clone()); }
    else { this.tips.pop(); this.bases.pop(); }
    if (this.tips.length > this.n) { this.tips.length = this.n; this.bases.length = this.n; }
    const m = this.tips.length;
    for (let i = 0; i < this.n; i++) {
      const t = this.tips[Math.min(i, m - 1)], b = this.bases[Math.min(i, m - 1)];
      if (!t) { this.col.fill(0); break; }
      t.toArray(this.pos, i * 6); b.toArray(this.pos, i * 6 + 3);
      const f = i < m ? Math.pow(1 - i / this.n, 1.6) : 0;
      this.col.set([1, 0.3, 0.3, f * 0.55], i * 8);   // the tip: hot crimson
      this.col.set([0.7, 0.04, 0.06, 0], i * 8 + 4);   // fading out toward the base: a crescent, not a slab
    }
    this.geo.attributes.position.needsUpdate = true; this.geo.attributes.color.needsUpdate = true;
  }
}
