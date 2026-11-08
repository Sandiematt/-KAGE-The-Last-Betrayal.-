# The legs: baggy dark trousers, full at the thigh, gathered into the boots below the knee, heavy folds.
extends RefCounted

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var pos: Dictionary = ctx.pos
	for s in ["L", "R"]:
		var side := 1.0 if s == "L" else -1.0
		var th_b: String = "thigh_" + s
		var sh_b: String = "shin_" + s
		var hip: Vector3 = pos[th_b]
		var knee: Vector3 = pos[sh_b]
		var rings := []
		for e in [[0.985, 0.11], [0.92, 0.116], [0.82, 0.12], [0.71, 0.116], [0.61, 0.108], [0.53, 0.1], [0.46, 0.094], [0.41, 0.084]]:
			var y: float = e[0]
			var t := clampf((hip.y - y) / (hip.y - knee.y), 0.0, 1.0)
			var cx := lerpf(hip.x, knee.x, t) - side * (0.008 if y > 0.95 else 0.0)
			rings.append({"y": y, "rx": e[1], "rz": e[1] * 0.92, "cx": cx, "cz": 0.0})
		var weight := func(th: float, ri: int, p: Vector3) -> Array:
			if p.y > 0.9:
				var a := clampf((0.985 - p.y) / 0.085, 0.0, 1.0)
				return [["hips", 1.0 - a], [th_b, a]]
			if p.y > 0.56:
				return [[th_b, 1.0]]
			if p.y > 0.44:
				var b := (0.56 - p.y) / 0.12
				return [[th_b, 1.0 - b], [sh_b, b]]
			return [[sh_b, 1.0]]
		var shape := func(th: float, ri: int) -> float: return 1.0 + 0.045 * sin(5.0 * th + ri * 1.7) * (0.5 if ri == 0 else 1.0)
		kit.ring_loft("pants", rings, -PI, PI, 24, weight, shape)
	var tex = ctx.T.new(128, 256, Color("1d1819"))
	for k in 6:
		var v := 0.15 + k * 0.14
		tex.line([Vector2(0, v), Vector2(0.3, v + 0.04), Vector2(0.6, v - 0.02), Vector2(1, v + 0.02)], 0.03, Color("141011"), true)
	ctx.mats["pants"] = ctx.M.toon("pants", Color.WHITE, {"tex": tex.texture(ctx.dir + "pants.png")})
