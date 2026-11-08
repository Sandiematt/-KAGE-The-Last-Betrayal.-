// Kage, as designed in Godot (godot/kage): loads assets/kage.glb (the skinned mesh, its painted textures and the baked
// idle / walk / slash clips), turns its materials into toon materials with the crimson rim, gives the outer cloak a red
// lining, plays the clips through an AnimationMixer with crossfades, swings the cloth on spring bones, and sets the
// eye expression (neutral / focused / awakened, the sheet's EXPRESSIONS panel).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { toon } from '../core/toon.js';
import { radialTexture } from '../core/textures.js';
import { SpringBones } from './spring-bones.js';

const LINING = '#7a1218';
const RED_EYE = new THREE.Color('#ff3036');

function toToon(src) {
  const name = src.name || '';
  if (name === 'eye') {
    const m = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, side: THREE.DoubleSide });
    m.name = name; m.userData.outlineParameters = { visible: false };
    return m;
  }
  const m = toon(src.color.clone(), {
    map: src.map || null, side: src.side, alphaTest: src.alphaTest || 0,
    rim: name === 'blade' || name === 'metal' ? 0.25 : name === 'face' ? 1.4 : 1
  });
  m.name = name;
  // thinner ink on small hard parts, none on the blade's edge
  m.userData.outlineParameters = { thickness: name === 'blade' || name === 'metal' || name === 'tassel' ? 0.0022 : 0.0042, color: [0.02, 0.008, 0.008], alpha: 1 };
  return m;
}

export class Kage {
  static async load(url) {
    const gltf = await new GLTFLoader().loadAsync(url);
    return new Kage(gltf);
  }

  constructor(gltf) {
    this.root = new THREE.Group();          // turn and place this; the glTF scene sits inside
    this.model = gltf.scene;
    this.root.add(this.model);
    const linings = [];
    this.model.traverse((o) => {
      if (!o.isMesh) return;
      o.frustumCulled = false;
      o.material = toToon(o.material);
      if (o.material.name === 'cloak_outer') {
        // charcoal outside, red lining inside (both faces are the same skin, so the lining moves with it)
        o.material.side = THREE.FrontSide;
        const lining = o.clone();
        lining.material = toon(LINING, { side: THREE.BackSide, rim: 0.2 });
        lining.material.userData.outlineParameters = { visible: false };
        lining.bind(o.skeleton, o.bindMatrix);
        linings.push([o.parent, lining]);
      }
      if (o.material.name === 'eye') this.eyes = o;
    });
    for (const [p, l] of linings) p.add(l);

    // the clips
    this.mixer = new THREE.AnimationMixer(this.model);
    this.actions = {};
    for (const clip of gltf.animations) {
      const a = this.mixer.clipAction(clip);
      if (clip.name === 'slash') { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
      this.actions[clip.name] = a;
    }
    this.clip = 'idle';
    this.loopClip = 'idle';
    this.actions.idle.play();
    this.mixer.addEventListener('finished', (e) => { if (e.action === this.actions.slash) this.play(this.loopClip); });

    // the eyes: the "focused" blend shape (animated by the clips), and a glow that turns red when awakened
    this.expression = 'neutral';
    this.head = this.model.getObjectByName('head');
    this.glows = [];
    const glowMat = new THREE.SpriteMaterial({ map: radialTexture('rgba(255,255,255,0.35)', 'rgba(255,255,255,0)'), blending: THREE.AdditiveBlending,
      depthWrite: false, toneMapped: false, transparent: true });
    glowMat.userData.outlineParameters = { visible: false };
    for (const x of [0.043, -0.043]) {
      const s = new THREE.Sprite(glowMat);
      s.position.set(x, 0.1, 0.118); s.scale.setScalar(0.045);
      this.head.add(s); this.glows.push(s);
    }
    this.katana = this.model.getObjectByName('katana');
    this.springs = new SpringBones(this.model);
  }

  play(name) {
    if (!this.actions[name]) return;
    const next = this.actions[name], cur = this.actions[this.clip];
    if (name !== 'slash') this.loopClip = name;
    if (next === cur && name !== 'slash') return;
    next.reset().play();
    if (cur && cur !== next) cur.crossFadeTo(next, name === 'slash' ? 0.08 : 0.25, false);
    this.clip = name;
  }

  setExpression(name) {
    this.expression = name;
    const red = name === 'awakened';
    if (this.eyes) this.eyes.material.color.copy(red ? RED_EYE : new THREE.Color('#ffffff'));
    for (const g of this.glows) { g.material.color.copy(red ? RED_EYE : new THREE.Color('#ffffff')); g.scale.setScalar(red ? 0.075 : 0.045); }
  }

  // wind: a world-space direction (the scarf streams with it, the cloak a little)
  update(dt, time, wind) {
    this.mixer.update(dt);
    if (this.eyes && this.expression !== 'neutral') {
      const infl = this.eyes.morphTargetInfluences;
      if (infl) infl[0] = Math.max(infl[0], this.expression === 'focused' ? 1 : 0.6);
    }
    this.root.updateMatrixWorld(true);
    this.springs.wind.copy(wind);
    this.springs.update(dt, time);
  }

  // the blade's tip and a point near its base, in world space (for the slash trail)
  bladePoints(tip, base) {
    this.katana.localToWorld(tip.set(0, 0.034, 0.81));
    this.katana.localToWorld(base.set(0, 0.004, 0.2));
  }
}
