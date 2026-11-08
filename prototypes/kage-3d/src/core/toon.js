// Cel shading for the 3D characters, matching docs/art-reference/STYLE.md:
// - MeshToonMaterial with a stepped gradientMap: a shadow, a base and a thin lit band (never a smooth gradient)
// - a fine crimson rim light on the side away from the key light (STYLE.md "rim"), quantised so it stays a hard line
// - an ink outline as an inverted hull (a back-face copy pushed out along the normals, constant width on screen)
import * as THREE from 'three';

// shared uniforms, updated once per frame by main.js
export const TOON = {
  lightDirView: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },   // the key light's direction in view space
  rimColor: { value: new THREE.Color('#d0303a') },
  outline: { value: 1 }                                                     // 0 hides every outline
};

// the gradient map: three flat steps. The docs require Nearest filtering for gradientMap textures.
let _gradient = null;
export function toonGradient() {
  if (_gradient) return _gradient;
  const steps = [70, 165, 255], data = new Uint8Array(steps.length * 4);
  steps.forEach((v, i) => { data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v; data[i * 4 + 3] = 255; });
  _gradient = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  _gradient.minFilter = _gradient.magFilter = THREE.NearestFilter;
  _gradient.generateMipmaps = false;
  _gradient.needsUpdate = true;
  return _gradient;
}

// a toon material. opts: { rim (0..1.5, default 1), side, map, alphaTest, emissive, rimColor }
export function toon(color, opts = {}) {
  const m = new THREE.MeshToonMaterial({
    color, gradientMap: toonGradient(), side: opts.side ?? THREE.FrontSide,
    map: opts.map || null, alphaTest: opts.alphaTest || 0, transparent: false
  });
  if (opts.emissive) m.emissive = new THREE.Color(opts.emissive);
  const rim = { value: opts.rim ?? 1 }, rimCol = opts.rimColor ? { value: new THREE.Color(opts.rimColor) } : TOON.rimColor;
  m.userData.rim = rim;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uLightDirView = TOON.lightDirView;
    sh.uniforms.uRimColor = rimCol;
    sh.uniforms.uRim = rim;
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uLightDirView;\nuniform vec3 uRimColor;\nuniform float uRim;')
      .replace('#include <opaque_fragment>', `
        {
          // hard crimson rim: grazing angle, on the side turned away from the key light
          vec3 nV = normalize(normal);
          float fres = 1.0 - clamp(dot(nV, normalize(vViewPosition)), 0.0, 1.0);
          float away = clamp(0.1 - dot(nV, uLightDirView), 0.0, 1.0);
          float rim = step(0.8, fres) * smoothstep(0.0, 0.35, away);
          outgoingLight += uRimColor * rim * uRim * 0.4;
        }
        #include <opaque_fragment>`);
  };
  m.customProgramCacheKey = () => 'kage-toon' + (opts.rimColor || '');
  return m;
}

// flat, unlit colour (the glowing eyes, emissive details)
export function flat(color, opts = {}) {
  return new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: !!opts.transparent, opacity: opts.opacity ?? 1,
    blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !opts.additive, side: opts.side ?? THREE.FrontSide });
}

// ---- the ink outline (inverted hull) ----
const _outlineMat = new THREE.ShaderMaterial({
  uniforms: { uThick: { value: 0.0021 }, uColor: { value: new THREE.Color('#050303') }, uOn: TOON.outline },
  vertexShader: `
    uniform float uThick; uniform float uOn;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec3 n = normalize(normalMatrix * normal);
      mv.xyz += n * uThick * uOn * max(1.0, -mv.z);   // grows with distance: constant width on screen
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `uniform vec3 uColor; void main() { gl_FragColor = vec4(uColor, 1.0); }`,
  side: THREE.BackSide
});
// give a closed mesh its outline (a child sharing its geometry, so it follows every deformation)
export function outline(mesh, scale = 1) {
  const mat = scale === 1 ? _outlineMat : _outlineMat.clone();
  if (scale !== 1) { mat.uniforms.uThick = { value: 0.0021 * scale }; mat.uniforms.uOn = TOON.outline; }
  const o = new THREE.Mesh(mesh.geometry, mat);
  o.name = mesh.name + ':outline';
  o.raycast = () => {};
  mesh.add(o);
  return mesh;
}

// a mesh with a toon material and an outline in one call
export function part(geometry, material, name, opts = {}) {
  const m = new THREE.Mesh(geometry, material);
  m.name = name || '';
  if (opts.outline !== false) outline(m, opts.outlineScale || 1);
  return m;
}
