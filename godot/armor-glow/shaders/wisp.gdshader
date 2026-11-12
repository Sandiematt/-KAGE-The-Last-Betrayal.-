shader_type canvas_item;
// Yurei spirit wisps: soft pale-blue ribbons rising and curling, with brighter pulses travelling up them and a few
// drifting soft orbs. Low intensity (peak ~70%), soft edges. Integer multiples of phase => seamless loop.

uniform float phase = 0.0;
uniform vec2 cell = vec2(128.0, 192.0);
uniform float base_y = 186.0;
uniform float seed = 3.0;
uniform float peak = 0.70;
uniform vec3 c_pale = vec3(0.812, 0.886, 1.0);   // #cfe2ff
uniform vec3 c_laven = vec3(0.74, 0.76, 1.0);


const float RX[4] = float[4](-22.0, -6.0, 12.0, 28.0);
const float RH[4] = float[4](150.0, 176.0, 160.0, 128.0);
const float RW[4] = float[4](7.0, 9.0, 7.5, 6.0);

float hash(float n) { return fract(sin(n * 127.1 + seed * 311.7) * 43758.5453); }

// returns vec2(soft body, bright inner ribbon) for ribbon i
vec2 ribbon(vec2 q, int i) {
	float fi = float(i);
	float ph = hash(fi) * TAU;
	float ph2 = hash(fi + 9.0) * TAU;
	float k = (i % 2 == 0) ? 1.0 : 2.0;
	float h = RH[i] * (1.0 + 0.06 * sin(TAU * phase + ph2));
	float t = q.y / h;
	if (t < 0.0 || t > 1.0) return vec2(0.0);
	float amp = 11.0 + 7.0 * hash(fi + 2.0);
	float xc = RX[i]
		+ amp * t * sin(TAU * (phase * k - t * 1.15) + ph)
		+ 10.0 * t * t * sin(TAU * (phase * (3.0 - k) - t * 0.6) + ph2);
	float wd = RW[i] * (0.55 + 1.15 * sqrt(t)) * (1.0 - 0.35 * t);
	float dx = (q.x - xc) / wd;
	float along = smoothstep(0.0, 0.16, t) * pow(1.0 - t, 1.15);
	float pulse = 0.62 + 0.38 * sin(TAU * (phase * k - t * 1.4) + ph2);
	float body = exp(-dx * dx * 1.6) * along * (0.55 + 0.45 * pulse);
	float inner = (1.0 - smoothstep(0.12, 0.62, abs(dx))) * along * pulse;
	return vec2(body, inner);
}

void fragment() {
	vec2 px = UV * cell;
	vec2 q = vec2(px.x - cell.x * 0.5, base_y - px.y);
	float body = 0.0, inner = 0.0;
	for (int i = 0; i < 4; i++) {
		vec2 r = ribbon(q, i);
		body = max(body, r.x);
		inner = max(inner, r.y);
	}
	// drifting soft orbs
	float orb = 0.0;
	for (int i = 0; i < 4; i++) {
		float fi = float(i);
		float u = fract(phase * ((i % 2 == 0) ? 1.0 : 2.0) + hash(fi + 50.0));
		vec2 c = vec2((hash(fi + 60.0) - 0.5) * 70.0 + 8.0 * sin(TAU * (phase * 2.0 + hash(fi))), 20.0 + u * 140.0);
		float r = 3.2 + 2.0 * hash(fi + 70.0);
		float d = length(q - c) / r;
		orb = max(orb, exp(-d * d * 1.5) * sin(PI * u));
	}
	float I = clamp(1.2 * body + 0.8 * inner * body + 0.75 * orb, 0.0, 1.0);
	vec3 col = mix(c_laven, c_pale, smoothstep(0.05, 0.6, I)) * I * peak;
	vec2 e = min(px, cell - px);
	col *= smoothstep(0.0, 8.0, e.x) * smoothstep(0.0, 4.0, e.y);
	COLOR = vec4(clamp(col, 0.0, peak), 1.0);
}
