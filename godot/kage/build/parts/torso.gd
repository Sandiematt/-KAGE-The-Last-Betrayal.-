# The torso: a fitted dark jacket from the neck to the waist, closed by a crossed front flap edged in red, a red
# inner collar in the V at the throat.
extends RefCounted

const Common = preload("res://build/parts/common.gd")

const RINGS := [
	{"y": 1.478, "rx": 0.072, "rz": 0.068, "cz": -0.012},
	{"y": 1.458, "rx": 0.132, "rz": 0.096, "cz": -0.012},
	{"y": 1.43, "rx": 0.178, "rz": 0.112, "cz": -0.008},
	{"y": 1.38, "rx": 0.182, "rz": 0.121, "cz": 0.0},
	{"y": 1.31, "rx": 0.174, "rz": 0.124, "cz": 0.008},
	{"y": 1.23, "rx": 0.16, "rz": 0.118, "cz": 0.008},
	{"y": 1.14, "rx": 0.146, "rz": 0.11, "cz": 0.004},
	{"y": 1.06, "rx": 0.147, "rz": 0.108, "cz": 0.0},
	{"y": 0.99, "rx": 0.156, "rz": 0.112, "cz": 0.0}]

# the jacket's radius at height y (other parts sit just outside it)
static func radius_at(y: float) -> Vector2:
	for i in RINGS.size() - 1:
		var a: Dictionary = RINGS[i]
		var b: Dictionary = RINGS[i + 1]
		if y <= a.y and y >= b.y:
			var t: float = (a.y - y) / (a.y - b.y)
			return Vector2(lerpf(a.rx, b.rx, t), lerpf(a.rz, b.rz, t))
	return Vector2(RINGS[-1].rx, RINGS[-1].rz)

static func cz_at(y: float) -> float:
	for i in RINGS.size() - 1:
		var a: Dictionary = RINGS[i]
		var b: Dictionary = RINGS[i + 1]
		if y <= a.y and y >= b.y:
			return lerpf(a.cz, b.cz, (a.y - y) / (a.y - b.y))
	return 0.0

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	kit.ring_loft("jacket", RINGS, -PI, PI, 36, func(th: float, ri: int, p: Vector3) -> Array: return Common.torso_w(p.y))
	var P = ctx.M.PAL
	var tex = ctx.T.new(512, 512, P.cloth)
	# the red inner collar showing in the V, then the crossed flap's edge with red piping
	tex.poly([Vector2(0.43, 0.0), Vector2(0.57, 0.0), Vector2(0.505, 0.36)], P.red)
	tex.poly([Vector2(0.455, 0.0), Vector2(0.545, 0.0), Vector2(0.503, 0.24)], P.cloth_dark)
	tex.line([Vector2(0.575, 0.0), Vector2(0.535, 0.2), Vector2(0.49, 0.55), Vector2(0.47, 1.0)], 0.012, P.red)
	tex.line([Vector2(0.588, 0.0), Vector2(0.548, 0.2), Vector2(0.503, 0.55), Vector2(0.483, 1.0)], 0.006, P.cloth_dark)
	# side seams and a few folds
	for u in [0.25, 0.75]:
		tex.line([Vector2(u, 0.1), Vector2(u + 0.005, 1.0)], 0.006, P.cloth_dark)
	for f in [[0.36, 0.5, 0.42, 0.75], [0.62, 0.48, 0.57, 0.8], [0.1, 0.55, 0.14, 0.9], [0.9, 0.55, 0.86, 0.9]]:
		tex.line([Vector2(f[0], f[1]), Vector2(f[2], f[3])], 0.006, P.cloth_dark)
	ctx.mats["jacket"] = ctx.M.toon("jacket", Color.WHITE, {"tex": tex.texture(ctx.dir + "jacket.png")})
