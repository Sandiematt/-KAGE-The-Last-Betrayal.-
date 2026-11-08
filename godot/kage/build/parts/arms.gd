# The arms: a dark sleeve gathered at the elbow under a red band, a dark forearm guard with two silver bands and a
# red band at the wrist (the sheet's front view and DETAILS panel).
extends RefCounted

static func _p(a: Vector3, b: Vector3, t: float) -> Vector3:
	return a.lerp(b, t)

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var P = ctx.M.PAL
	var pos: Dictionary = ctx.pos
	for s in ["L", "R"]:
		var S: Vector3 = pos["upperarm_" + s]
		var E: Vector3 = pos["forearm_" + s]
		var Wr: Vector3 = pos["hand_" + s]
		var ua: String = "upperarm_" + s
		var fa: String = "forearm_" + s
		# the sleeve, shoulder to wrist
		var path := []
		var radii := []
		var wts := []
		var up := [[0.0, 0.06], [0.25, 0.062], [0.5, 0.058], [0.75, 0.053], [0.95, 0.05]]
		for e in up:
			path.append(_p(S + Vector3(0, 0.02, 0), E, e[0]))
			radii.append(Vector2(e[1], e[1] * 0.95))
			wts.append([["chest", 0.35], [ua, 0.65]] if e[0] == 0.0 else [[ua, 1.0]])
		for e in [[0.08, 0.047], [0.3, 0.046], [0.55, 0.043], [0.8, 0.04], [0.97, 0.037]]:
			path.append(_p(E, Wr, e[0]))
			radii.append(Vector2(e[1], e[1] * 0.92))
			wts.append([[ua, 0.5], [fa, 0.5]] if e[0] < 0.1 else [[fa, 1.0]])
		kit.tube("sleeve", path, radii, wts, 14, Vector3(1, 0, 0), false)
		# the red band round the elbow
		kit.tube("red", [_p(S, E, 0.86), _p(E, Wr, 0.06)], [Vector2(0.057, 0.055), Vector2(0.053, 0.051)], [[ua, 0.6], [fa, 0.4]], 14, Vector3(1, 0, 0), false)
		# the forearm guard and its bands
		kit.tube("bracer", [_p(E, Wr, 0.32), _p(E, Wr, 0.6), _p(E, Wr, 0.9)], [Vector2(0.049, 0.047), Vector2(0.048, 0.046), Vector2(0.045, 0.043)], [[fa, 1.0]], 14, Vector3(1, 0, 0), false)
		for t in [0.42, 0.8]:
			kit.tube("metal", [_p(E, Wr, t - 0.035), _p(E, Wr, t + 0.035)], [Vector2(0.052, 0.05), Vector2(0.051, 0.049)], [[fa, 1.0]], 14, Vector3(1, 0, 0), false)
		kit.tube("red", [_p(E, Wr, 0.93), _p(E, Wr, 1.0)], [Vector2(0.044, 0.042), Vector2(0.042, 0.04)], [[fa, 1.0]], 14, Vector3(1, 0, 0), false)
	var tex = ctx.T.new(64, 128, P.cloth)
	for v in [0.3, 0.55, 0.8]:
		tex.line([Vector2(0, v), Vector2(0.5, v + 0.04), Vector2(1, v)], 0.04, P.cloth_dark, true)
	ctx.mats["sleeve"] = ctx.M.toon("sleeve", Color.WHITE, {"tex": tex.texture(ctx.dir + "sleeve.png")})
	ctx.mats["red"] = ctx.M.toon("red", P.red)
	ctx.mats["bracer"] = ctx.M.toon("bracer", P.detail)
