// Mugen's hair: a lock of long spectral hair, the light half of it (drawn added on top of a dark violet body that fades
// out toward the tip). UV.x runs along the lock (0 the root, 1 the tip), UV.y across it (0 its upper edge, 1 its
// underside). Both edges burn violet, threads of energy flow from root to tip weaving across it with pulses running
// down them, a faint inner glow, and the tip breaks apart into flecks of light. `phase` (0..1) is a seamless loop:
// everything that moves is periodic in it. Rendered on black; the game adds it ('lighter').
shader_type canvas_item;
render_mode blend_add;

uniform float phase = 0.0;
uniform float seed = 5.0;

float hash(float x) { return fract(sin(x * 127.1 + seed * 311.7) * 43758.5453); }

void fragment() {
	float u = UV.x, v = UV.y;
	vec3 violet = vec3(0.66, 0.26, 1.0);
	vec3 magenta = vec3(0.9, 0.42, 1.0);
	vec3 white = vec3(1.0, 0.9, 1.0);
	// the edges: a bright line along the upper edge, a dimmer one along the underside
	float edge = exp(-pow(v / 0.075, 2.0)) + 0.55 * exp(-pow((1.0 - v) / 0.06, 2.0));
	// energy threads flowing root to tip, weaving across the lock, pulses running down them
	float th = 0.0;
	for (int k = 0; k < 5; k++) {
		float fk = float(k);
		float c = 0.2 + 0.6 * hash(fk) + 0.09 * sin(TAU * (u * 1.5 - phase) + fk * 1.9);
		float pulse = 0.3 + 0.7 * pow(0.5 + 0.5 * sin(TAU * (u * 3.0 - phase * 2.0) + fk * 2.7), 3.0);
		th += exp(-pow((v - c) / 0.026, 2.0)) * pulse;
	}
	float inner = 0.1 * (0.6 + 0.4 * sin(TAU * (u * 2.0 - phase) + v * 3.0));
	float I = edge + 0.9 * th + inner;
	// the tip comes apart into light: it fades and breaks into flecks drifting toward the end
	float fade = 1.0 - smoothstep(0.5, 1.0, u);
	float fleck = step(0.62, hash(floor(u * 40.0 - phase * 40.0) + floor(v * 8.0) * 13.0));
	I *= fade + (1.0 - fade) * fleck * 0.85 * (1.0 - smoothstep(0.92, 1.0, u));
	vec3 col = violet * I + magenta * th * 0.45 + white * pow(max(th - 0.55, 0.0), 2.0) * 0.7 + white * pow(edge, 4.0) * 0.22;
	COLOR = vec4(col, 1.0);
}
