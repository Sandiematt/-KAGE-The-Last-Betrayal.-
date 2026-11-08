# The waist: a wide red sash wound round it, a black belt over the sash and a second belt slung lower and tilted, both
# with silver buckles, and at the back a knot with two hanging red ends and a cord ending in a small tassel.
extends RefCounted

const Common = preload("res://build/parts/common.gd")

static func _band(kit, mat: String, y0: float, y1: float, r: Vector2, tilt: float, wts: Array, folds := 0.0) -> void:
	var rings := [{"y": y0, "rx": r.x - 0.004, "rz": r.y - 0.004}, {"y": y0 - 0.003, "rx": r.x, "rz": r.y},
		{"y": y1 + 0.003, "rx": r.x, "rz": r.y}, {"y": y1, "rx": r.x - 0.004, "rz": r.y - 0.004}]
	var shape := func(th: float, ri: int) -> float: return 1.0 + folds * sin(9.0 * th + ri)
	var drop := func(th: float, ri: int) -> float: return tilt * (sin(th) + 1.0) * 0.5
	kit.ring_loft(mat, rings, -PI, PI, 40, func(th: float, ri: int, p: Vector3) -> Array: return wts, shape, drop)

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var P = ctx.M.PAL
	var hips := [["hips", 1.0]]
	_band(kit, "sash", 1.095, 0.955, Vector2(0.166, 0.124), 0.0, [["hips", 0.75], ["spine", 0.25]], 0.012)
	_band(kit, "strap", 1.052, 1.018, Vector2(0.176, 0.133), 0.0, hips)
	_band(kit, "strap", 0.99, 0.958, Vector2(0.18, 0.137), 0.028, hips)
	# buckles: the big one at the front of the upper belt, one off to the side on the lower belt
	Common.buckle(kit, Vector3(0, 1.035, 0.139), Vector3(0, 0, 1), Vector3.UP, 0.06, 0.044, hips)
	Common.buckle(kit, Vector3(-0.08, 0.98, 0.128), Vector3(-0.45, 0, 0.9), Vector3.UP, 0.044, 0.036, hips)
	Common.buckle(kit, Vector3(0.15, 1.035, 0.085), Vector3(0.85, 0, 0.55), Vector3.UP, 0.034, 0.03, hips)
	# the knot at the back, its two hanging ends and the cord with a tassel
	kit.ellipsoid("sash", Vector3(0.0, 1.03, -0.132), Vector3(0.05, 0.04, 0.03), hips, 12, 8)
	for e in [[-0.03, 0.26, -0.15], [0.035, 0.2, -0.15]]:
		var x: float = e[0]
		kit.tube("sash", [Vector3(x, 1.02, -0.14), Vector3(x * 1.2, 1.02 - e[1] * 0.5, -0.16), Vector3(x * 1.3, 1.02 - e[1], -0.165)],
			[Vector2(0.022, 0.005), Vector2(0.026, 0.005), Vector2(0.024, 0.005)], hips, 8, Vector3(1, 0, 0), true)
	kit.tube("red", [Vector3(0.0, 1.0, -0.14), Vector3(0.0, 0.85, -0.165), Vector3(0.0, 0.74, -0.17)], [Vector2(0.004, 0.004), Vector2(0.004, 0.004), Vector2(0.004, 0.004)], hips, 6, Vector3(1, 0, 0), false)
	kit.tube("red", [Vector3(0.0, 0.74, -0.17), Vector3(0.0, 0.68, -0.172), Vector3(0.0, 0.6, -0.175)], [Vector2(0.008, 0.008), Vector2(0.014, 0.014), Vector2(0.02, 0.02)], hips, 10, Vector3(1, 0, 0), true)
	kit.ellipsoid("metal", Vector3(0.0, 0.745, -0.17), Vector3(0.011, 0.011, 0.011), hips, 8, 6)
	var tex = ctx.T.new(128, 128, P.red)
	for v in [0.25, 0.55, 0.8]:
		tex.line([Vector2(0, v), Vector2(0.5, v + 0.03), Vector2(1, v)], 0.025, P.red_dark, true)
	ctx.mats["sash"] = ctx.M.toon("sash", Color.WHITE, {"tex": tex.texture(ctx.dir + "sash.png"), "double": true})
