# The capelet: a short cape over the shoulders and the upper back, the silver emblem at its centre, a red band and
# three points at its hem (the sheet's back view).
extends RefCounted

const Common = preload("res://build/parts/common.gd")
const Torso = preload("res://build/parts/torso.gd")

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var P = ctx.M.PAL
	var rings := []
	var ys := [1.485, 1.46, 1.43, 1.39, 1.34, 1.29, 1.24]
	for i in ys.size():
		var y: float = ys[i]
		var r := Torso.radius_at(y)
		var lift := 0.02 + 0.02 * float(i) / (ys.size() - 1)
		if i == 0:
			r = Vector2(0.09, 0.08)
		rings.append({"y": y, "rx": r.x + lift + (0.035 if i == 1 or i == 2 else 0.0), "rz": r.y + lift, "cz": Torso.cz_at(y) - 0.004})
	# three points at the hem: the centre one lowest
	var drop := func(th: float, ri: int) -> float:
		if ri < ys.size() - 1:
			return 0.0
		var u := (th - 1.55) / (TAU - 3.1)
		var tri := absf(fposmod(u * 3.0, 1.0) - 0.5) * 2.0
		return (1.0 - tri) * 0.05 + 0.03 * (1.0 - absf(u - 0.5) * 2.0)
	kit.ring_loft("capelet", rings, 1.55, TAU - 1.55, 26, func(th: float, ri: int, p: Vector3) -> Array: return Common.torso_w(maxf(p.y, 1.31)), null, drop)
	var tex = ctx.T.new(512, 256, P.cloth)
	tex.emblem(Vector2(0.5, 0.42), 0.085, P.metal, P.cloth, 2.0)
	tex.rect(0, 0.84, 1, 0.9, P.red)
	tex.rect(0, 0.93, 1, 1, P.red_dark)
	tex.line([Vector2(0, 0.06), Vector2(1, 0.06)], 0.01, P.cloth_dark)
	ctx.mats["capelet"] = ctx.M.toon("capelet", Color.WHITE, {"tex": tex.texture(ctx.dir + "capelet.png"), "double": true})
