/* KAGE — Akari's WebGL layer: her scythe sprite, the energy trail its blade sweeps, and the sparks and petals it throws.

   One offscreen WebGL canvas, rendered and composited into the 2D frame exactly where each layer belongs:
     weapon    her scythe, baked once from its vector art (21-characters/bosses/akari/scythe.js) into a texture and drawn as
               a sprite with the 2D canvas's own transform at that moment (so it sits in her hand, behind or in front of
               her parts as before). Its shader adds a glowing pink halo round the edges, a fine rim light and a shimmer
               running along the blade, brighter while she swings. The ribbon tails stay vector (they hang and sway).
     effects   after the fighters (50-world.js): the energy trail and the particles, in world space
   Shaders   sprite: halo from a 12+8 tap alpha dilation, rim from the alpha gradient; trail: a ribbon with a white-hot
             leading edge over deep pink, scrolling noise and age fade; particles: sparks (motion-aligned streaks), petals
             (a notched sakura petal drawn by its distance field, tumbling) and soft glows, one batched draw.
   Particles a CPU pool (sim time, so hit-stop freezes them) of sparks off the blade's edge and petals shed along the swing,
             and bursts where her cuts land.
   Off without WebGL (and in the headless tests, which have none): the scythe draws as 2D vector art, the trail as the
   2D smear, and the sakura sheets play as before. Drawing only. */

const AkariGL = {
  gl: null, cv: null, failed: false, P: {}, buf: null, tex: null, texKey: '', box: null,
  parts: [], trails: [], clock: 0, lastClock: 0, verts: null,
  // the fight's own sim clock (FightSession.time, frozen by hit-stop), set by the Renderer before anything is drawn.
  // Particles and trails age on it, NOT on her rig: the rig stops posing her while she is down, juggled, dead or
  // unseen (Smoke Step, Blink), and anything aged on it would hang frozen in the air until she stood up again.
  tickTo(t) {
    if (t < this.clock - 0.5) { this.parts.length = 0; this.trails.length = 0; this.lastClock = t; }   // a new fight
    this.clock = t;
  },

  live() { return !!this.gl || (!this.failed && this._init()); },
  _init() {
    try {
      if (typeof document === 'undefined' || typeof WebGLRenderingContext !== 'function') throw new Error('no webgl');
      const cv = document.createElement('canvas');
      const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true, preserveDrawingBuffer: true });
      if (!(gl instanceof WebGLRenderingContext)) throw new Error('no webgl');
      this.cv = cv; this.gl = gl;
      this.P.sprite = this._prog(AKGL_VS, AKGL_FS_SPRITE, ['a_pos', 'a_uv']);
      this.P.trail = this._prog(AKGL_VS, AKGL_FS_TRAIL, ['a_pos', 'a_uv']);
      this.P.part = this._prog(AKGL_VS_PART, AKGL_FS_PART, ['a_pos', 'a_uv', 'a_col', 'a_kind']);
      this.buf = gl.createBuffer();
      this.verts = new Float32Array(1400 * 6 * 9);
      return true;
    } catch (e) { this.failed = true; this.gl = null; return false; }
  },
  _prog(vs, fs, attrs) {
    const gl = this.gl, sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    attrs.forEach((a, i) => gl.bindAttribLocation(p, i, a)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; for (const n of ['u_tex', 'u_px', 'u_time', 'u_heat']) u[n] = gl.getUniformLocation(p, n);
    return { p, u, n: attrs.length };
  },
  // size the GL canvas to the 2D canvas being drawn into and clear it
  _begin(ctx) {
    const gl = this.gl, w = ctx.canvas.width, h = ctx.canvas.height;
    if (this.cv.width !== w || this.cv.height !== h) { this.cv.width = w; this.cv.height = h; }
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // premultiplied: alpha 0 adds light
    this.W = w; this.H = h;
  },
  _composite(ctx) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(this.cv, 0, 0); ctx.restore(); },
  // a 2D transform (DOMMatrix) applied to a point, to clip space
  _clip(m, x, y, out, i) {
    const px = m.a * x + m.c * y + m.e, py = m.b * x + m.d * y + m.f;
    out[i] = px / this.W * 2 - 1; out[i + 1] = 1 - py / this.H * 2;
  },
  _draw(prog, data, count, mode) {
    const gl = this.gl, stride = (prog.n === 4 ? 9 : 4) * 4;
    gl.useProgram(prog.p); gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    const sizes = prog.n === 4 ? [2, 2, 4, 1] : [2, 2]; let off = 0;
    for (let i = 0; i < 4; i++) { if (i < sizes.length) { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, sizes[i], gl.FLOAT, false, stride, off); off += sizes[i] * 4; } else gl.disableVertexAttribArray(i); }
    gl.drawArrays(mode, 0, count);
  },

  /* ---- the weapon sprite ---- */
  _bake(L, s) {
    const key = (s / L).toFixed(4); if (this.texKey === key) return;
    const L0 = 300, s0 = s / L * L0, x0 = -1.62 * L0, x1 = 2.25 * L0, y0 = -0.56 * L0, y1 = 1.24 * L0;
    const c = document.createElement('canvas'); c.width = Math.ceil(x1 - x0); c.height = Math.ceil(y1 - y0);
    const g = c.getContext('2d'); g.translate(-x0, -y0);
    drawAkariScythe(g, L0, s0, null, { noTails: true, noGlow: true });
    const gl = this.gl; if (!this.tex) this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.box = { x0: x0 / L0, x1: x1 / L0, y0: y0 / L0, y1: y1 / L0, tw: c.width, th: c.height };
    this.texKey = key;
  },
  // draw her scythe as a glowing sprite at the 2D context's current (weapon-frame) transform; false: draw it in 2D
  drawScythe(ctx, L, s, f) {
    if (!ctx || !ctx.getTransform || !ctx.canvas || !this.live()) return false;
    this._bake(L, s);
    const gl = this.gl, m = ctx.getTransform(), B = this.box, v = this._q || (this._q = new Float32Array(24));
    const C = [[B.x0, B.y0, 0, 0], [B.x1, B.y0, 1, 0], [B.x0, B.y1, 0, 1], [B.x1, B.y1, 1, 1]];
    this._begin(ctx);
    let i = 0; for (const k of [0, 1, 2, 2, 1, 3]) { const c = C[k]; this._clip(m, c[0] * L, c[1] * L, v, i); v[i + 2] = c[2]; v[i + 3] = c[3]; i += 4; }
    const P = this.P.sprite; gl.useProgram(P.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.uniform1i(P.u.u_tex, 0);
    gl.uniform2f(P.u.u_px, 1 / B.tw, 1 / B.th); gl.uniform1f(P.u.u_time, f ? f.time || 0 : 0);
    const R = f && f._akRig; gl.uniform1f(P.u.u_heat, R && R.out.swing ? 1.6 : 1);
    this._draw(P, v, 6, gl.TRIANGLES);
    this._composite(ctx);
    return true;
  },

  /* ---- the trail and the particles, fed by the rig once per simulated frame ---- */
  feed(f, P, L) {
    let T = this.trails.find(t => t.f === f); if (!T) { T = { f, pts: [] }; this.trails.push(T); }
    const a = akBladePoint(f, L, AK_BLADE_IN), b = akBladePoint(f, L, AK_BLADE_OUT), t = this.clock;
    if (P.swing) T.pts.push({ ax: a[0], ay: a[1], bx: b[0], by: b[1], t });
    const last = T.last; T.last = { bx: b[0], by: b[1], ax: a[0], ay: a[1] };
    if (!P.swing || !last) return;
    // sparks off the blade's edge along the swing, petals shed from it (more the faster it moves)
    const vx = (b[0] - last.bx) * 60, vy = (b[1] - last.by) * 60, sp = Math.hypot(vx, vy), n = Math.min(4, (sp / 500) | 0) + 1;
    for (let i = 0; i < n; i++) {
      const k = Math.random(), x = lerp(a[0], b[0], 0.5 + k * 0.5), y = lerp(a[1], b[1], 0.5 + k * 0.5);
      this.spawn(0, x, y, vx * rand(0.25, 0.5) + rand(-60, 60), vy * rand(0.25, 0.5) + rand(-60, 60), rand(0.18, 0.32), rand(1.6, 2.6) * f.scale, [1, 0.72, 0.9, 1]);
      if (Math.random() < 0.7) this.spawn(1, x, y, vx * rand(0.08, 0.2) + rand(-40, 40), vy * rand(0.08, 0.2) - rand(10, 60), rand(0.7, 1.2), rand(4.5, 7) * f.scale, Math.random() < 0.5 ? [1, 0.4, 0.7, 1] : [1, 0.72, 0.86, 1]);
    }
    if (P.spin > 9 && Math.random() < 0.5) this.spawn(2, b[0], b[1], 0, 0, 0.22, 16 * f.scale, [1, 0.3, 0.65, 0.5]);
  },
  // where one of her cuts lands: a ring of petals, sparks and a glow (in place of the baked slash sheet)
  burst(x, y, dir, scale) {
    const s = scale || 1;
    this.spawn(2, x, y, 0, 0, 0.26, 70 * s, [1, 0.35, 0.7, 0.7]);
    for (let i = 0; i < 14; i++) { const a = rand(0, TAU), v = rand(260, 620); this.spawn(0, x, y, Math.cos(a) * v + dir * 160, Math.sin(a) * v, rand(0.16, 0.28), rand(1.8, 2.8) * s, [1, 0.8, 0.92, 1]); }
    for (let i = 0; i < 22; i++) { const a = rand(0, TAU), v = rand(80, 340); this.spawn(1, x, y, Math.cos(a) * v + dir * 80, Math.sin(a) * v - 80, rand(0.8, 1.4), rand(5, 8) * s, Math.random() < 0.5 ? [1, 0.4, 0.7, 1] : [1, 0.75, 0.88, 1]); }
    return true;
  },
  spawn(kind, x, y, vx, vy, life, size, col) {
    if (this.parts.length > 1300) this.parts.shift();
    this.parts.push({ kind, x, y, vx, vy, t: 0, life, size, col, rot: rand(0, TAU), vr: rand(-9, 9), ph: rand(0, TAU) });
  },
  _step(dt) {
    const P = this.parts;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.t += dt;
      if (p.t >= p.life) { P.splice(i, 1); continue; }
      if (p.kind === 1) { p.vx *= Math.exp(-2.2 * dt); p.vy = p.vy * Math.exp(-2.2 * dt) + 220 * dt; p.vx += Math.sin(p.t * 5 + p.ph) * 90 * dt; p.rot += p.vr * dt; }
      else if (p.kind === 0) { p.vx *= Math.exp(-5 * dt); p.vy = p.vy * Math.exp(-5 * dt) + 300 * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.y > -2 && p.kind === 1) { p.y = -2; p.vy = 0; p.vx *= 0.6; }   // petals settle on the floor
    }
    for (const T of this.trails) { while (T.pts.length && this.clock - T.pts[0].t > 0.16) T.pts.shift(); }
    this.trails = this.trails.filter(T => T.pts.length || (T.f && T.f.alive));
  },
  // world space, after the fighters: step the particles on sim time, draw trails and particles, composite
  drawEffects(ctx) {
    if (!this.gl || (!this.parts.length && !this.trails.some(T => T.pts.length > 1))) { this.lastClock = this.clock; return; }
    const dt = clamp(this.clock - this.lastClock, 0, 0.05); this.lastClock = this.clock;
    this._step(dt);
    const gl = this.gl, m = ctx.getTransform();
    this._begin(ctx);
    // energy trails: Catmull-Rom smoothed, a quad strip from the staff head (v 0) to the blade's far edge (v 1)
    const P = this.P.trail;
    gl.useProgram(P.p); gl.uniform1f(P.u.u_time, this.clock);
    for (const T of this.trails) {
      const S = T.pts; if (S.length < 2) continue;
      const out = [], cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
      for (let i = 0; i < S.length - 1; i++) {
        const p0 = S[Math.max(0, i - 1)], p1 = S[i], p2 = S[i + 1], p3 = S[Math.min(S.length - 1, i + 2)];
        for (let j = 0; j < 4; j++) {
          const t = j / 4, tt = lerp(p1.t, p2.t, t), age = clamp((this.clock - tt) / 0.16, 0, 1);
          out.push(cr(p0.ax, p1.ax, p2.ax, p3.ax, t), cr(p0.ay, p1.ay, p2.ay, p3.ay, t), cr(p0.bx, p1.bx, p2.bx, p3.bx, t), cr(p0.by, p1.by, p2.by, p3.by, t), age);
        }
      }
      const e = S[S.length - 1]; out.push(e.ax, e.ay, e.bx, e.by, clamp((this.clock - e.t) / 0.16, 0, 1));
      const n = out.length / 5, v = new Float32Array(n * 8);
      for (let i = 0; i < n; i++) {
        const o = i * 5, age = out[o + 4];
        this._clip(m, out[o], out[o + 1], v, i * 8); v[i * 8 + 2] = age; v[i * 8 + 3] = 0;
        this._clip(m, out[o + 2], out[o + 3], v, i * 8 + 4); v[i * 8 + 6] = age; v[i * 8 + 7] = 1;
      }
      this._draw(P, v, n * 2, gl.TRIANGLE_STRIP);
    }
    // particles: one batch of quads (sparks along their velocity, petals tumbling, glows round)
    const V = this.verts; let c = 0;
    const put = (x, y, u, w, col, kind, a) => { this._clip(m, x, y, V, c); V[c + 2] = u; V[c + 3] = w; V[c + 4] = col[0]; V[c + 5] = col[1]; V[c + 6] = col[2]; V[c + 7] = col[3] * a; V[c + 8] = kind; c += 9; };
    for (const p of this.parts) {
      const k = p.t / p.life, a = p.kind === 1 ? Math.min(1, (1 - k) * 2.2) : 1 - k * k;
      let ux, uy, wx, wy;
      if (p.kind === 0) { const sp = Math.hypot(p.vx, p.vy) || 1, l = Math.max(p.size * 2, Math.min(40, sp * 0.03)) ; ux = p.vx / sp * l; uy = p.vy / sp * l; wx = -uy / l * p.size; wy = ux / l * p.size; }
      else { const r = p.kind === 1 ? p.size : p.size * (0.6 + 0.4 * k); ux = Math.cos(p.rot) * r; uy = Math.sin(p.rot) * r; wx = -uy; wy = ux; }
      const q = [[-1, -1], [1, -1], [-1, 1], [-1, 1], [1, -1], [1, 1]];
      for (const [s, t] of q) put(p.x + ux * t + wx * s, p.y + uy * t + wy * s, s, t, p.col, p.kind, a);
      if (c >= V.length) break;
    }
    if (c) this._draw(this.P.part, V.subarray(0, c), c / 9, gl.TRIANGLES);
    this._composite(ctx);
  }
};

const AKGL_VS = `attribute vec2 a_pos; attribute vec2 a_uv; varying vec2 v_uv;
void main() { v_uv = a_uv; gl_Position = vec4(a_pos, 0.0, 1.0); }`;

// the scythe: its baked colours, a pink halo grown out of its silhouette, a pale rim light on its edges and a shimmer
// running along the blade (u_heat brightens it all while she swings)
const AKGL_FS_SPRITE = `precision mediump float;
varying vec2 v_uv; uniform sampler2D u_tex; uniform vec2 u_px; uniform float u_time; uniform float u_heat;
void main() {
  vec4 c = texture2D(u_tex, v_uv);
  float near = 0.0, far = 0.0;
  for (int i = 0; i < 12; i++) { float a = float(i) * 0.5236; near = max(near, texture2D(u_tex, v_uv + vec2(cos(a), sin(a)) * u_px * 5.0).a); }
  for (int i = 0; i < 8; i++) { float a = float(i) * 0.7854 + 0.39; far = max(far, texture2D(u_tex, v_uv + vec2(cos(a), sin(a)) * u_px * 12.0).a); }
  float halo = clamp(max(near - c.a, (far - c.a) * 0.45), 0.0, 1.0);
  float gx = texture2D(u_tex, v_uv + vec2(u_px.x * 1.5, 0.0)).a - texture2D(u_tex, v_uv - vec2(u_px.x * 1.5, 0.0)).a;
  float gy = texture2D(u_tex, v_uv + vec2(0.0, u_px.y * 1.5)).a - texture2D(u_tex, v_uv - vec2(0.0, u_px.y * 1.5)).a;
  float rim = clamp(length(vec2(gx, gy)), 0.0, 1.0) * c.a;
  float shimmer = 0.5 + 0.5 * sin(v_uv.x * 24.0 - v_uv.y * 9.0 - u_time * 7.0);
  vec3 glow = vec3(1.0, 0.32, 0.68) * halo * (0.5 + 0.35 * shimmer) * u_heat;
  vec3 lit = vec3(1.0, 0.86, 0.95) * rim * (0.45 + 0.3 * shimmer) * u_heat;
  gl_FragColor = vec4(c.rgb + lit * c.a + glow, c.a + halo * 0.12);
}`;

// the energy trail: v 0 at the staff head, 1 at the blade's far edge; u is age (0 newest)
const AKGL_FS_TRAIL = `precision mediump float;
varying vec2 v_uv; uniform float u_time;
float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
void main() {
  float age = v_uv.x, v = v_uv.y;
  float body = smoothstep(0.05, 0.75, v) * (1.0 - smoothstep(0.93, 1.0, v));
  float edge = exp(-pow((v - 0.9) * 8.0, 2.0));
  float fl = n(vec2(age * 9.0 - u_time * 6.0, v * 4.0));
  float life = pow(1.0 - age, 1.5);
  vec3 col = mix(vec3(1.0, 0.08, 0.58), vec3(1.0, 0.42, 0.74), body);
  col = mix(col, vec3(1.0, 0.97, 0.99), edge * (1.0 - age * 0.8));
  float a = (body * 0.55 + edge * 0.9) * life * (0.6 + 0.4 * fl);
  gl_FragColor = vec4(col * a, a * 0.2);
}`;

const AKGL_VS_PART = `attribute vec2 a_pos; attribute vec2 a_uv; attribute vec4 a_col; attribute float a_kind;
varying vec2 v_uv; varying vec4 v_col; varying float v_kind;
void main() { v_uv = a_uv; v_col = a_col; v_kind = a_kind; gl_Position = vec4(a_pos, 0.0, 1.0); }`;

// sparks (uv.y runs along the motion), sakura petals (a notched teardrop, uv.y toward the tip) and soft glows
const AKGL_FS_PART = `precision mediump float;
varying vec2 v_uv; varying vec4 v_col; varying float v_kind;
void main() {
  vec2 p = v_uv;
  if (v_kind < 0.5) {
    float a = (1.0 - abs(p.x)) * smoothstep(-1.0, 0.5, p.y) * (1.0 - smoothstep(0.75, 1.0, p.y));
    a = pow(max(a, 0.0), 1.4) * v_col.a;
    gl_FragColor = vec4(mix(v_col.rgb, vec3(1.0), 0.5) * a, 0.0);
  } else if (v_kind < 1.5) {
    float t = (p.y + 1.0) * 0.5;
    float w = 0.66 * pow(sin(clamp(t, 0.0, 1.0) * 2.75), 0.8);
    float top = 0.78 - p.x * p.x * 0.5 - 0.3 * max(0.0, 1.0 - abs(p.x) / 0.22);
    float m = smoothstep(0.05, -0.05, abs(p.x) - w) * smoothstep(0.05, -0.05, p.y - top);
    float glow = smoothstep(0.35, -0.2, abs(p.x) - w) * smoothstep(0.3, -0.1, p.y - top) * 0.35;
    vec3 c = mix(v_col.rgb, vec3(1.0, 0.95, 0.98), (1.0 - abs(p.x) / 0.66) * 0.45 * (1.0 - t));
    gl_FragColor = vec4((c * m + v_col.rgb * glow) * v_col.a, m * v_col.a * 0.8);
  } else {
    float d = length(p), a = exp(-d * d * 3.2) * v_col.a;
    gl_FragColor = vec4(v_col.rgb * a, 0.0);
  }
}`;
