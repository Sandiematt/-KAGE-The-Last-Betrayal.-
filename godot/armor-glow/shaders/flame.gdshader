shader_type canvas_item;
// Stylised anime flame: 4 curling tongues rising from a base line, three hard-edged cel layers (outer / mid / white-hot
// core) plus a baked soft bloom and a few drifting sparks. All motion is sin(TAU * k * phase + ...) with integer k, so
// the loop is seamless.

uniform float phase = 0.0;
uniform vec2 cell = vec2(128.0, 192.0);
uniform float base_y = 186.0;
uniform float seed = 1.0;
uniform vec3 c_outer = vec3(0.545, 0.17, 0.95);
uniform vec3 c_mid = vec3(0.827, 0.361, 1.0);
uniform vec3 c_core = vec3(1.0, 0.88, 1.0);
uniform vec3 c_bloom = vec3(0.36, 0.10, 0.62);


const float TX[4] = float[4](-27.0, -9.0, 10.0, 27.0);   // base x offsets from cell centre
const float TH[4] = float[4](98.0, 148.0, 122.0, 84.0);    // heights
const float TW[4] = float[4](13.0, 18.0, 15.0, 12.0);       // half-widths at the base

float hash(float n) { return fract(sin(n * 127.1 + seed * 311.7) * 43758.5453); }

// approx signed distance (px) from q (x from centre, y up from base) to tongue i, scaled in width / height
float tongue(vec2 q, int i, float sw, float sh) {
	float fi = float(i);
	float ph = hash(fi) * TAU;
	float ph2 = hash(fi + 11.0) * TAU;
	float k = (i % 2 == 0) ? 1.0 : 2.0;
	float h = TH[i] * (1.0 + 0.11 * sin(TAU * phase * k + ph) + 0.05 * sin(TAU * phase * (3.0 - k) + ph2)) * sh;
	float t = q.y / h;
	float tc = clamp(t, 0.0, 1.0);
	float amp = 7.0 + 6.0 * hash(fi + 3.0);
	float curl = (hash(fi + 5.0) - 0.5) * 56.0 * (0.65 + 0.35 * sin(TAU * phase + ph2));
	float xc = TX[i]
		+ amp * tc * sin(TAU * (phase * k - tc * 0.85) + ph)
		+ curl * tc * tc * (0.6 + 0.4 * tc);
	float wd = TW[i] * sw * pow(1.0 - tc, 0.78) * (0.92 + 0.08 * sin(TAU * phase * 2.0 + ph2));
	float dx = abs(q.x - xc);
	float sdh = dx - wd;
	if (t > 1.0) return length(vec2(dx, (t - 1.0) * h));
	if (t < 0.0) return length(vec2(max(sdh, 0.0), -t * h));
	return sdh * 0.88;
}

float union_sd(vec2 q, float sw, float sh) {
	float d = 1e5;
	for (int i = 0; i < 4; i++) d = min(d, tongue(q, i, sw, sh));
	return d;
}

float diamond(vec2 p, vec2 c, float s) {
	vec2 d = abs(p - c);
	return 1.0 - smoothstep(s - 0.4, s + 0.4, d.x + d.y);
}

void fragment() {
	vec2 px = UV * cell;
	vec2 q = vec2(px.x - cell.x * 0.5, base_y - px.y);

	float sd1 = union_sd(q, 1.0, 1.0);
	float sd2 = union_sd(q, 0.64, 0.80);
	float sd3 = union_sd(q, 0.36, 0.58);
	float aa = 0.38;
	// cut flat on the base line; a soft hot bar hides the join
	float on = smoothstep(-0.4, 0.4, q.y);
	float b1 = (1.0 - smoothstep(-aa, aa, sd1)) * on;
	float b2 = (1.0 - smoothstep(-aa, aa, sd2)) * on;
	float b3 = (1.0 - smoothstep(-aa, aa, sd3)) * on;

	float dd = max(sd1, 0.0);
	float k = clamp(1.0 - dd / 26.0, 0.0, 1.0);
	float bloom = 0.55 * exp(-dd / 6.0) * k + 0.30 * pow(k, 3.0);
	// a low ember glow along the base
	float bar = exp(-pow(q.x / 30.0, 2.0)) * exp(-pow(max(q.y, 0.0) / 9.0, 2.0)) * 0.55;
	bloom = max(bloom, bar);
	bloom *= smoothstep(-7.0, 1.0, q.y);   // nothing glows beneath the base

	// sparks drifting up
	float sp = 0.0;
	for (int i = 0; i < 5; i++) {
		float fi = float(i);
		float u = fract(phase * ((i % 2 == 0) ? 1.0 : 2.0) + hash(fi + 20.0));
		float sx = (hash(fi + 30.0) - 0.5) * 70.0 + 5.0 * sin(TAU * (phase * 2.0 + hash(fi)));
		float sy = 30.0 + u * 125.0;
		float size = 3.4 * (1.0 - u) * (0.6 + 0.6 * hash(fi + 40.0));
		sp = max(sp, diamond(q, vec2(sx, sy), size) * (1.0 - u * u));
	}

	vec3 col = c_bloom * bloom;
	col = mix(col, c_outer, b1);
	col = mix(col, c_mid, b2);
	col = mix(col, c_core, b3);
	col = mix(col, c_core, sp);

	vec2 e = min(px, cell - px);
	col *= smoothstep(0.0, 8.0, e.x) * smoothstep(0.0, 6.0, e.y);
	COLOR = vec4(clamp(col, 0.0, 1.0), 1.0);
}
