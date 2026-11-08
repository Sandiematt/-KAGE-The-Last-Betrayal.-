# The coat skirts, three layers from the waist (the sheet's CLOAK (LAYERS) panel):
# - inner robe: long and pleated, open at the front
# - middle layer: to the knee, red flames rising from a red hem, ragged points
# - outer cloak: split at the back into two long panels sweeping out to big torn points, red flames and hem
# Each layer is skinned to the eight cloak chains (rig.gd): a point blends the two chains either side of it by angle
# and the two bones either side of it along the chain, so Three.js's spring bones swing the cloth.
extends RefCounted

const Rig = preload("res://build/rig.gd")

static func _wrap(a: float) -> float:
	return wrapf(a, -PI, PI)

# skin weights for a point at angle th, at fraction s of the chain's length below the waist
static func cloak_w(th: float, s: float) -> Array:
	var th_list: Array = Rig.CLOAK_THETA
	var sorted := []
	for k in th_list.size():
		sorted.append([th_list[k], k])
	sorted.sort_custom(func(a, b): return a[0] < b[0])
	th = _wrap(th)
	var ka := -1
	var kb := -1
	var ta := 0.0
	var n := sorted.size()
	for i in n:
		var a0: float = sorted[i][0]
		var a1: float = sorted[(i + 1) % n][0] + (TAU if i == n - 1 else 0.0)
		var t := th + (TAU if i == n - 1 and th < a0 else 0.0)
		if t >= a0 and t <= a1:
			if a0 < 0 and a1 > 0 and a1 - a0 < PI:   # the open front: no chain there, take the nearer
				ka = sorted[i][1] if absf(t - a0) < absf(t - a1) else sorted[(i + 1) % n][1]
				kb = ka
			else:
				ka = sorted[i][1]
				kb = sorted[(i + 1) % n][1]
				ta = (t - a0) / (a1 - a0)
			break
	if ka < 0:
		ka = 0
		kb = 0
	var q := clampf(s, 0.0, 1.0) * Rig.CLOAK_SEGS - 0.5
	var j0 := clampi(int(floor(q)), 0, Rig.CLOAK_SEGS - 1)
	var j1 := clampi(j0 + 1, 0, Rig.CLOAK_SEGS - 1)
	var tl := clampf(q - floor(q), 0.0, 1.0) if q >= 0.0 else 0.0
	var hips := clampf(1.0 - s / 0.07, 0.0, 1.0)
	var rest := 1.0 - hips
	var out := []
	if hips > 0.0:
		out.append(["hips", hips])
	for e in [[ka, 1.0 - ta], [kb, ta]]:
		for f in [[j0, 1.0 - tl], [j1, tl]]:
			var wv: float = e[1] * f[1] * rest
			if wv > 0.0001:
				out.append(["cloak%d_%d" % [e[0], f[0]], wv])
	return out

# one layer: t0..t1 round the waist; length(th), radius(th, s), jag(th) the hem's extra drop
static func layer(kit, mat: String, t0: float, t1: float, cols: int, rows: int, length: Callable, radius: Callable, jag: Callable) -> void:
	var P := []
	var W := []
	for ri in rows + 1:
		var s := float(ri) / rows
		var row := []
		var wrow := []
		for ci in cols + 1:
			var th := lerpf(t0, t1, float(ci) / cols)
			var L: float = length.call(th) + jag.call(th) * pow(s, 3.0)
			var y := Rig.CLOAK_TOP + 0.005 - s * L
			var r: float = radius.call(th, s)
			var p := Vector3(sin(th) * r, y, cos(th) * r * 0.8)
			row.append(p)
			wrow.append(cloak_w(th, (Rig.CLOAK_TOP - y) / Rig.CLOAK_LEN))
		P.append(row)
		W.append(wrow)
	kit.grid(mat, P, W, false, func(p: Vector3) -> Vector3: return Vector3(p.x, 0, p.z))

static func _tri(x: float) -> float:
	return absf(fposmod(x, 1.0) - 0.5) * 2.0   # 1 at the points, 0 between

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var P = ctx.M.PAL
	# inner robe: long, pleated, a small notched hem
	layer(kit, "robe_inner", 0.58, TAU - 0.58, 56, 10,
		func(th: float) -> float: return 0.7,
		func(th: float, s: float) -> float: return (0.17 + 0.135 * s) * (1.0 + 0.03 * sin(16.0 * th) * s),
		func(th: float) -> float: return 0.025 * _tri(th * 2.6))
	# middle layer: to the knee, flames, ragged points
	layer(kit, "cloak_middle", 0.82, TAU - 0.82, 56, 9,
		func(th: float) -> float: return 0.47 + 0.06 * (1.0 - cos(th)) * 0.5,
		func(th: float, s: float) -> float: return (0.176 + 0.175 * s) * (1.0 + 0.035 * sin(8.0 * th + 0.5) * s),
		func(th: float) -> float: return 0.07 * _tri(th * 1.45 + 0.25))
	# outer cloak: two long panels split at the back, big torn points sweeping down the sides
	var outer_len := func(th: float) -> float:
		var a := absf(_wrap(th))
		return 0.58 + 0.24 * smoothstep(0.95, 2.1, a) - 0.06 * smoothstep(2.6, PI, a)
	var outer_r := func(th: float, s: float) -> float:
		return (0.182 + 0.2 * s + 0.06 * s * s) * (1.0 + 0.05 * sin(6.0 * th) * s)
	var outer_jag := func(th: float) -> float: return 0.13 * _tri(th * 1.25 + 0.1)
	layer(kit, "cloak_outer", 0.98, PI - 0.06, 36, 12, outer_len, outer_r, outer_jag)
	layer(kit, "cloak_outer", PI + 0.06, TAU - 0.98, 36, 12, outer_len, outer_r, outer_jag)
	# ---- textures ----
	var t_out = ctx.T.new(1024, 512, P.cloth)
	for k in 9:
		var u := 0.06 + k * 0.11
		t_out.line([Vector2(u, 0.05), Vector2(u + 0.02, 0.5), Vector2(u - 0.01, 0.95)], 0.006, P.cloth_dark)
	t_out.flames(0.9, 0.17, 8, 11, P.red, P.cloth)
	t_out.rect(0, 0.0, 0.025, 1, P.red)        # red trim down both edges
	t_out.rect(0.975, 0.0, 1, 1, P.red)
	ctx.mats["cloak_outer"] = ctx.M.toon("cloak_outer", Color.WHITE, {"tex": t_out.texture(ctx.dir + "cloak_outer.png"), "double": true})
	var t_mid = ctx.T.new(1024, 256, Color("241d1e"))
	t_mid.flames(0.88, 0.22, 10, 23, P.red, Color("241d1e"))
	ctx.mats["cloak_middle"] = ctx.M.toon("cloak_middle", Color.WHITE, {"tex": t_mid.texture(ctx.dir + "cloak_middle.png"), "double": true})
	var t_in = ctx.T.new(512, 256, Color("1c1718"))
	for k in 16:
		t_in.line([Vector2((k + 0.5) / 16.0, 0.0), Vector2((k + 0.5) / 16.0, 1.0)], 0.004, Color("120e0f"))
	t_in.rect(0, 0.93, 1, 1, Color("2e2526"))
	ctx.mats["robe_inner"] = ctx.M.toon("robe_inner", Color.WHITE, {"tex": t_in.texture(ctx.dir + "robe_inner.png"), "double": true})
