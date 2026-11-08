# The red scarf: wound round the neck and pulled up over the lower face like a mask (just under the eyes, lower at
# the back), heavy folds, a knot behind the neck and two long tails hanging from it (spring bones stream them).
extends RefCounted

const Common = preload("res://build/parts/common.gd")

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var rings := [
		{"y": 1.618, "rx": 0.088, "rz": 0.094, "cz": 0.024},   # the top edge, under the eyes (dropped at the back below)
		{"y": 1.598, "rx": 0.097, "rz": 0.104, "cz": 0.024},
		{"y": 1.56, "rx": 0.098, "rz": 0.104, "cz": 0.02},
		{"y": 1.52, "rx": 0.094, "rz": 0.098, "cz": 0.012},
		{"y": 1.485, "rx": 0.1, "rz": 0.096, "cz": 0.004},
		{"y": 1.455, "rx": 0.112, "rz": 0.1, "cz": -0.004}]
	var weight := func(th: float, ri: int, p: Vector3) -> Array:
		if ri <= 2:
			return [["head", 1.0]]
		if ri == 3:
			return [["head", 0.5], ["neck", 0.5]]
		if ri == 4:
			return [["neck", 1.0]]
		return [["neck", 0.5], ["chest", 0.5]]
	var shape := func(th: float, ri: int) -> float:
		return 1.0 + 0.045 * sin(3.0 * th + ri * 1.3) * (0.4 + 0.15 * ri) + (0.04 if ri == 1 or ri == 4 else 0.0)
	var drop := func(th: float, ri: int) -> float:
		var back := (1.0 - cos(th)) * 0.5
		return back * (0.05 if ri == 0 else 0.03 if ri == 1 else 0.012 if ri == 2 else 0.0)
	kit.ring_loft("scarf", rings, -PI, PI, 32, weight, shape, drop)
	# the knot behind the neck
	kit.ellipsoid("scarf", Vector3(0.028, 1.505, -0.088), Vector3(0.05, 0.042, 0.034), [["neck", 1.0]], 12, 8)
	# the tails
	for ch in ctx.chains:
		if ch[0] != "scarfA_" and ch[0] != "scarfB_":
			continue
		var pts: Array = ch[2]
		var radii := []
		var wts := []
		for j in pts.size():
			var t := float(j) / (pts.size() - 1)
			var w := lerpf(0.045, 0.066, minf(t * 2.0, 1.0)) * (1.0 - smoothstep(0.82, 1.0, t) * 0.85)
			radii.append(Vector2(w, 0.007))
			wts.append(Common.chain_w(ch[0], j, pts.size()))
		kit.tube("scarf", pts, radii, wts, 10, Vector3(1, 0, 0.25), true)
	# red cloth, darker fold bands
	var tex = ctx.T.new(256, 256, ctx.M.PAL.red)
	for k in 4:
		var y := 0.14 + k * 0.22
		tex.line([Vector2(0, y), Vector2(0.35, y + 0.03), Vector2(0.7, y - 0.02), Vector2(1, y + 0.01)], 0.012, ctx.M.PAL.red_dark, true)
	tex.line([Vector2(0, 0.012), Vector2(1, 0.012)], 0.02, ctx.M.PAL.red_hi, false)
	ctx.mats["scarf"] = ctx.M.toon("scarf", Color.WHITE, {"tex": tex.texture(ctx.dir + "scarf.png"), "double": true})
