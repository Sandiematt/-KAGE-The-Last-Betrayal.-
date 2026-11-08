# The saya at his left hip (the sheet's WEAPON panel): black lacquer with red flames, silver mouth, bands and chape,
# a red cord. It hangs from the saya bone, back and down.
extends RefCounted

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var P = ctx.M.PAL
	var A: Vector3 = ctx.pos["saya"]
	var w := [["saya", 1.0]]
	var dir := Vector3(0.07, -0.48, -1.0).normalized()
	var up := Vector3(0, 1, 0)
	up = (up - dir * up.dot(dir)).normalized()
	var path := []
	var radii := []
	for k in 13:
		var t := k / 12.0
		path.append(A + dir * 0.8 * t + up * 0.035 * t * t)
		radii.append(Vector2(0.016, 0.024 * (1.0 - 0.15 * t)))
	kit.tube("saya", path, radii, w, 12, Vector3(1, 0, 0), true, Vector2(0, 1))
	kit.tube("metal", [A - dir * 0.012, A + dir * 0.03], [Vector2(0.019, 0.027), Vector2(0.019, 0.027)], w, 12, Vector3(1, 0, 0), false)
	for t in [0.1, 0.2]:
		kit.tube("metal", [A + dir * (0.8 * t - 0.008), A + dir * (0.8 * t + 0.008)], [Vector2(0.018, 0.026), Vector2(0.018, 0.026)], w, 12, Vector3(1, 0, 0), false)
	kit.ellipsoid("metal", path[12], Vector3(0.017, 0.022, 0.03), w, 10, 6, Basis.looking_at(dir, up))
	kit.tube("red", [A + dir * 0.12 + up * 0.03, A + dir * 0.17 - up * 0.04, A + dir * 0.24 + up * 0.02], [Vector2(0.004, 0.004), Vector2(0.004, 0.004), Vector2(0.004, 0.004)], w, 6, Vector3(1, 0, 0), false)
	var tex = ctx.T.new(128, 512, Color("0c0909"))
	# red flames licking along the scabbard (v along its length)
	var rng := RandomNumberGenerator.new()
	rng.seed = 5
	for k in 6:
		var v := 0.3 + k * 0.11
		var u := rng.randf()
		tex.poly([Vector2(u - 0.2, v + 0.02), Vector2(u, v - 0.06), Vector2(u + 0.08, v - 0.1), Vector2(u + 0.05, v - 0.03), Vector2(u + 0.25, v + 0.03)], P.red, true)
	ctx.mats["saya"] = ctx.M.toon("saya", Color.WHITE, {"tex": tex.texture(ctx.dir + "saya.png")})
