// Keys the card's backdrop out of the Mugen art. The backdrop is one flat colour (bg); the figure's black is pure black
// and its dark violets sit close to the backdrop colour, so a plain colour key would turn them see-through. Only pixels
// of the backdrop colour itself are cleared, and only the soft edge pixels within 2 px of real backdrop take a partial
// alpha (their colour unmixed from it); everything else in the figure stays solid.
//   mode 0: the figure's colour, opaque (edges unmixed)   mode 1: its alpha, as grey   mode 2: the figure blended over
//   whatever is behind (the design board)
// Lock mode (lock = true) samples the art along a curve instead of in place: UV.x runs along the polyline pts (root to
// tip, by length), UV.y across it (0 its upper edge), `width` px wide, unwrapping a curved lock into a straight strip.
shader_type canvas_item;

uniform int mode = 0;
uniform vec3 bg = vec3(40.0, 2.0, 26.0);
uniform vec2 art_size = vec2(1024.0, 1536.0);
uniform bool lock = false;
uniform vec2 pts[11];
uniform float cum[11];
uniform float width = 64.0;
uniform sampler2D art : filter_nearest;

float dbg(vec3 c) { return distance(c * 255.0, bg); }

vec2 lock_px(vec2 uv) {
	float s = uv.x * cum[10];
	int i = 0;
	for (int k = 0; k < 9; k++) { if (s > cum[k + 1]) i = k + 1; }
	float t = clamp((s - cum[i]) / max(cum[i + 1] - cum[i], 0.001), 0.0, 1.0);
	vec2 p = mix(pts[i], pts[i + 1], t);
	vec2 d = normalize(pts[i + 1] - pts[i]);
	vec2 n = vec2(d.y, -d.x);   // the lock's upper side as it streams back and down to the left
	return p + n * (0.5 - uv.y) * width;
}

void fragment() {
	vec2 px = lock ? lock_px(UV) : UV * art_size;
	vec2 ps = 1.0 / art_size;
	vec3 c = texture(art, px * ps).rgb;
	float d = dbg(c);
	float near = 0.0;
	for (int y = -2; y <= 2; y++) {
		for (int x = -2; x <= 2; x++) {
			if (dbg(texture(art, (px + vec2(float(x), float(y))) * ps).rgb) < 3.0) near = 1.0;
		}
	}
	float a = d < 3.0 ? 0.0 : (near > 0.5 ? clamp((d - 3.0) / 24.0, 0.0, 1.0) : 1.0);
	vec3 fg = a > 0.001 ? clamp((c - (1.0 - a) * bg / 255.0) / a, 0.0, 1.0) : vec3(0.0);
	if (mode == 1) COLOR = vec4(vec3(a), 1.0);
	else if (mode == 2) COLOR = vec4(fg, a);
	else COLOR = vec4(fg, 1.0);
}
