# The hip ornament on his left: a red diamond in a silver frame on a cord from the belt, and a long red tassel under
# it (the sheet's DETAILS panel). On the tassel_ chain, so it swings.
extends RefCounted

const Common = preload("res://build/parts/common.gd")

# a red diamond in a silver frame, flat-ish, facing forward
static func diamond(kit, c: Vector3, s: float, wts) -> void:
	kit.ellipsoid("metal", c, Vector3(s, s * 1.35, s * 0.35), wts, 4, 2)
	kit.ellipsoid("red", c + Vector3(0, 0, s * 0.12), Vector3(s * 0.72, s * 1.0, s * 0.32), wts, 4, 2)

# a tassel: a silver cap, then a bundle of strands flaring out
static func tassel(kit, top: Vector3, length: float, w0: float, w1: float, wts_top, wts_bot) -> void:
	kit.ellipsoid("metal", top, Vector3(w0 * 1.2, w0 * 0.9, w0 * 1.2), wts_top, 10, 6)
	var path := []
	var radii := []
	var wts := []
	for k in 5:
		var t := k / 4.0
		path.append(top + Vector3(0, -length * t, 0))
		var r := lerpf(w0, w1, pow(t, 0.7))
		radii.append(Vector2(r, r))
		wts.append(wts_top if t < 0.5 else wts_bot)
	kit.tube("tassel", path, radii, wts, 12, Vector3(1, 0, 0), true)

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var pts: Array = []
	for ch in ctx.chains:
		if ch[0] == "tassel_":
			pts = ch[2]
	kit.tube("red", [pts[0], pts[1]], [Vector2(0.004, 0.004), Vector2(0.004, 0.004)], [Common.chain_w("tassel_", 0, 4), Common.chain_w("tassel_", 1, 4)], 6, Vector3(1, 0, 0), false)
	diamond(kit, pts[1] + Vector3(0, -0.03, 0), 0.028, Common.chain_w("tassel_", 1, 4))
	tassel(kit, pts[1] + Vector3(0, -0.075, 0), 0.17, 0.011, 0.03, [["tassel_1", 1.0]], [["tassel_2", 1.0]])
	var tex = ctx.T.new(64, 64, ctx.M.PAL.red)
	for k in 8:
		tex.rect(k / 8.0, 0, k / 8.0 + 0.03, 1, ctx.M.PAL.red_dark)
	ctx.mats["tassel"] = ctx.M.toon("tassel", Color.WHITE, {"tex": tex.texture(ctx.dir + "tassel.png")})
