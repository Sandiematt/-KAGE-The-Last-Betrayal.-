shader_type canvas_item;
// Crackling electric arcs. The bolt polylines are generated per frame in Bake.gd and passed as capsule segments;
// this shader draws them as a gold body, a near-white core and a baked bloom.

uniform vec2 cell = vec2(192.0, 192.0);
uniform vec4 seg[160];
uniform float segw[160];
uniform int nseg = 0;
uniform float gain = 1.0;
uniform vec3 c_gold = vec3(1.0, 0.784, 0.227);     // #ffc83a
uniform vec3 c_hot = vec3(1.0, 0.957, 0.784);      // #fff4c8
uniform vec3 c_bloom = vec3(0.70, 0.42, 0.04);

float dseg(vec2 p, vec2 a, vec2 b) {
	vec2 pa = p - a, ba = b - a;
	float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
	return length(pa - ba * h);
}

void fragment() {
	vec2 px = UV * cell;
	float db = 1e5, dc = 1e5, dbl = 1e5;
	for (int i = 0; i < 160; i++) {
		if (i >= nseg) break;
		float w = segw[i];
		float d = dseg(px, seg[i].xy, seg[i].zw);
		db = min(db, d - 1.55 * w);
		dc = min(dc, d - 0.62 * w);
		dbl = min(dbl, d + (1.0 - w) * 4.0);   // thinner branches glow less far
	}
	float aa = 0.38;
	float on = clamp(gain * 1.4, 0.0, 1.0);
	float b1 = (1.0 - smoothstep(-aa, aa, db)) * on;
	float b3 = (1.0 - smoothstep(-aa, aa, dc)) * on;
	float dd = max(db, 0.0);
	float k = clamp(1.0 - max(dbl, 0.0) / 20.0, 0.0, 1.0);
	float bloom = 0.60 * exp(-dd / 3.6) * k + 0.30 * pow(k, 3.0);
	vec3 col = c_bloom * bloom * gain;
	col = mix(col, c_gold * (0.55 + 0.45 * gain), b1);
	col = mix(col, c_hot, b3);
	vec2 e = min(px, cell - px);
	col *= smoothstep(0.0, 9.0, min(e.x, e.y));
	COLOR = vec4(clamp(col, 0.0, 1.0), 1.0);
}
