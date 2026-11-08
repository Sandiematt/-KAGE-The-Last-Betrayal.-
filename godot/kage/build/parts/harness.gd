# The chest harness: two straps over the shoulders down to the belt, crossed by two straps round the chest, each with
# a silver buckle at the front (the sheet's front view and DETAILS panel).
extends RefCounted

const Common = preload("res://build/parts/common.gd")
const Torso = preload("res://build/parts/torso.gd")

static func _on_torso(th: float, y: float, lift: float) -> Vector3:
	var r := Torso.radius_at(y)
	return Vector3(sin(th) * (r.x + lift), y, Torso.cz_at(y) + cos(th) * (r.y + lift))

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var P = ctx.M.PAL
	# the straps round the chest: thin bands just outside the jacket
	for band in [[1.372, 1.348], [1.292, 1.268]]:
		var rings := []
		for y in [band[0], band[0] - 0.002, band[1] + 0.002, band[1]]:
			var r := Torso.radius_at(y)
			var lift := 0.006 if (y == band[0] or y == band[1]) else 0.009
			rings.append({"y": y, "rx": r.x + lift, "rz": r.y + lift, "cz": Torso.cz_at(y)})
		kit.ring_loft("strap", rings, -PI, PI, 36, func(th: float, ri: int, p: Vector3) -> Array: return Common.torso_w(p.y))
	# the straps over the shoulders, front and back, down to the belt
	for side in [1.0, -1.0]:
		for front in [true, false]:
			var path := [Vector3(side * 0.105, 1.478, -0.012)]
			for y in [1.44, 1.38, 1.3, 1.2, 1.1, 1.02]:
				var th: float = side * lerpf(0.62, 0.42, (1.44 - y) / 0.42)
				if not front:
					th = side * PI - side * lerpf(0.62, 0.4, (1.44 - y) / 0.42)
				path.append(_on_torso(th, y, 0.01))
			var wts := []
			for p in path:
				wts.append(Common.torso_w(p.y))
			# lie flat on the torso: the strap's width runs round the body
			var th_mid: float = side * 0.5 if front else side * (PI - 0.5)
			kit.tube("strap", path, _radii(path.size()), wts, 6, Vector3(cos(th_mid), 0, -sin(th_mid)), false)
	# buckles at the front of the chest straps, off-centre as on the sheet
	for b in [[-0.42, 1.36], [0.02, 1.28], [0.62, 1.28]]:
		var th: float = b[0]
		var p := _on_torso(th, b[1], 0.014)
		var n := Vector3(sin(th), 0, cos(th))
		Common.buckle(kit, p, n, Vector3.UP, 0.046, 0.034, Common.torso_w(b[1]))
	# leather strap: near-black with a red edge line top and bottom
	var tex = ctx.T.new(32, 32, P.leather)
	tex.rect(0, 0, 1, 0.14, P.red_dark)
	tex.rect(0, 0.86, 1, 1, P.red_dark)
	ctx.mats["strap"] = ctx.M.toon("strap", Color.WHITE, {"tex": tex.texture(ctx.dir + "strap.png")})
	ctx.mats["metal"] = ctx.M.toon("metal", P.metal, {"rim": false})

static func _radii(n: int) -> Array:
	var out := []
	for i in n:
		out.append(Vector2(0.018, 0.0045))
	return out
