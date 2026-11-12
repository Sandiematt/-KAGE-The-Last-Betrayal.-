shader_type canvas_item;
// Mugen crescent halo: a tapered "C" ring opening toward the lower-right, hard-edged cel layers + baked bloom.
// phase 0..1 over the loop; every time term uses an integer multiple of phase, so frame n -> frame 0 is seamless.

uniform float phase = 0.0;
uniform vec2 cell = vec2(256.0, 256.0);
uniform float ring_r = 90.0;
uniform float gap_deg = 70.0;
uniform float gap_center_deg = 45.0;   // screen angle (y down): 45 deg = lower-right
uniform float wmax = 5.8;              // half-width of the crescent at its thickest
uniform vec3 c_violet = vec3(0.690, 0.294, 1.0);   // #b04bff
uniform vec3 c_magenta = vec3(0.827, 0.361, 1.0);  // #d35cff
uniform vec3 c_hot = vec3(1.0, 0.851, 1.0);        // #ffd9ff
uniform vec3 c_bloom = vec3(0.48, 0.15, 0.80);


float sd_crescent(vec2 p, float scale) {
	float r = length(p);
	float a = atan(p.y, p.x);
	float gc = radians(gap_center_deg);
	float gh = radians(gap_deg) * 0.5;
	float d = mod(a - gc + PI, TAU) - PI;      // signed angle from gap centre
	float da = abs(d);
	if (da < gh) {
		float ta = gc + (d >= 0.0 ? 1.0 : -1.0) * gh;
		return length(p - ring_r * vec2(cos(ta), sin(ta)));
	}
	float t = clamp((da - gh) / (PI - gh), 0.0, 1.0);
	float w = wmax * scale * pow(sin(t * PI * 0.5), 0.8);
	return abs(r - ring_r) - w;
}

void fragment() {
	vec2 p = UV * cell - cell * 0.5;
	float a = atan(p.y, p.x);
	float r = length(p);
	float pulse = 1.0 + 0.15 * sin(TAU * phase);
	// energy: slow travelling ripple + one hot spot circling the ring once per loop
	float flow = 0.86 + 0.14 * sin(a * 3.0 - TAU * phase * 2.0);
	float spot_a = -PI + TAU * phase;
	float ds = abs(mod(a - spot_a + PI, TAU) - PI);
	float spot = exp(-pow(ds / 0.55, 2.0));
	float spot2 = exp(-pow(abs(mod(a - spot_a, TAU) - PI) / 0.55, 2.0)); // opposite spot
	spot = max(spot, 0.6 * spot2);

	float sd = sd_crescent(p, 1.0);
	float sd2 = sd_crescent(p, 0.62 + 0.12 * spot);
	float sd3 = sd_crescent(p, 0.30 + 0.12 * spot);

	float aa = 0.38;
	float b1 = 1.0 - smoothstep(-aa, aa, sd);
	float b2 = 1.0 - smoothstep(-aa, aa, sd2);
	float b3 = 1.0 - smoothstep(-aa, aa, sd3);

	// baked bloom: tight hot shoulder + wide soft skirt, both reaching 0 inside the cell
	float dd = max(sd, 0.0);
	float k = clamp(1.0 - dd / 30.0, 0.0, 1.0);
	float bloom = 0.62 * exp(-dd / 5.0) * k + 0.38 * pow(k, 3.0);
	bloom *= (0.82 + 0.4 * spot) * flow;

	// faint broken echo arc outside the crescent (dashes crawl one step per loop)
	float er = abs(r - (ring_r + 15.0)) - 0.55;
	float gdist = abs(mod(a - radians(gap_center_deg) + PI, TAU) - PI);
	float echo_ok = smoothstep(radians(gap_deg) * 0.5 + 0.12, radians(gap_deg) * 0.5 + 0.5, gdist);
	float dashes = 1.0 - smoothstep(0.45, 0.55, fract(a / TAU * 36.0 + phase));
	float echo = (1.0 - smoothstep(-aa, aa, er)) * echo_ok * dashes * 0.55;

	vec3 col = c_bloom * bloom;
	col += c_violet * echo * 0.7;
	col = mix(col, c_violet * (0.9 + 0.1 * flow), b1);
	col = mix(col, c_magenta, b2);
	col = mix(col, mix(c_hot, vec3(1.0), 0.5 * spot), b3);
	col *= pulse;

	// keep everything inside the cell
	vec2 e = min(UV * cell, (1.0 - UV) * cell);
	col *= smoothstep(0.0, 6.0, min(e.x, e.y));
	COLOR = vec4(clamp(col, 0.0, 1.0), 1.0);
}
