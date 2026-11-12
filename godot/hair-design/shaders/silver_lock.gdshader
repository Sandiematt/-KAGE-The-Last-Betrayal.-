// Yūrei's hair: a lock of long silver-white hair. UV.x runs along the lock (0 the root, 1 the tip), UV.y across it
// (0 its lit upper edge, 1 its underside). Drawn normally (alpha): silver-white on top, cool lavender underneath, fine
// strands running its length, a few bright hairs, a soft sheen that ripples down it, and a frayed tip where the strands
// end at different lengths. `phase` (0..1) loops the sheen. The game maps the baked strip onto each lock segment by
// segment (src/js/21-characters/kage/armory/hair.js), so this is exactly what the game draws.
shader_type canvas_item;
render_mode blend_mix;

uniform float phase = 0.0;
uniform float seed = 3.0;
uniform bool alpha_pass = false;   // the bake renders the colour (opaque) and the alpha (as grey) separately,
uniform bool color_pass = false;   // so pack.py rebuilds exact straight alpha (tools/hair-design/pack.py)

float hash(float x) { return fract(sin(x * 127.1 + seed * 311.7) * 43758.5453); }

void fragment() {
	float u = UV.x, v = UV.y;
	vec3 hi = vec3(0.985, 0.985, 1.0);
	vec3 mid = vec3(0.86, 0.875, 0.95);
	vec3 lo = vec3(0.55, 0.57, 0.74);
	vec3 col = mix(hi, mid, smoothstep(0.04, 0.42, v));
	col = mix(col, lo, smoothstep(0.5, 1.0, v));
	// fine strands along the lock, each wandering a little across it
	float s = 0.0;
	for (int k = 0; k < 11; k++) {
		float fk = float(k);
		float c = (fk + 0.5) / 11.0 + 0.03 * sin(u * 8.0 + fk * 2.3 + seed);
		float w = 0.01 + 0.009 * hash(fk);
		s += exp(-pow((v - c) / w, 2.0)) * (0.45 + 0.55 * hash(fk + 7.0));
	}
	col *= 1.0 - 0.24 * clamp(s, 0.0, 1.0);
	// a few bright hairs catching the light near the top
	float b = 0.0;
	for (int k = 0; k < 4; k++) {
		float fk = float(k);
		float c = 0.1 + 0.2 * hash(fk + 3.0) + 0.02 * sin(u * 7.0 + fk);
		b += exp(-pow((v - c) / 0.008, 2.0));
	}
	col += 0.2 * b * (1.0 - 0.5 * u);
	// the sheen: a soft band of light that ripples along the lock and drifts toward the tip
	float sc = 0.24 + 0.05 * sin(TAU * (u * 2.0 - phase));
	float sheen = exp(-pow((v - sc) / 0.07, 2.0)) * (0.55 + 0.45 * sin(TAU * (u - phase)));
	col += vec3(0.15, 0.15, 0.19) * sheen * (1.0 - 0.6 * u);
	// toward the tip a cool blue creeps in and the strands end at different lengths
	col = mix(col, vec3(0.74, 0.82, 1.0), smoothstep(0.5, 1.0, u) * 0.35);
	float end = 0.84 + 0.14 * hash(floor(v * 16.0) + 11.0);
	float a = 1.0 - smoothstep(end - 0.07, end, u);
	COLOR = alpha_pass ? vec4(vec3(a), 1.0) : color_pass ? vec4(col, 1.0) : vec4(col, a);
}
