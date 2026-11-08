# The boots: chunky knee-high dark boots with a flared cuff, a knee guard, three straps with silver buckles on the
# outer side, a heavy foot and a thick pale sole (the sheet's DETAILS panel).
extends RefCounted

const Common = preload("res://build/parts/common.gd")

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var P = ctx.M.PAL
	var pos: Dictionary = ctx.pos
	for s in ["L", "R"]:
		var side := 1.0 if s == "L" else -1.0
		var sh := [["shin_" + s, 1.0]]
		var ft := [["foot_" + s, 1.0]]
		var knee: Vector3 = pos["shin_" + s]
		var ank: Vector3 = pos["foot_" + s]
		var cx := func(y: float) -> float: return lerpf(ank.x, knee.x, clampf((y - ank.y) / (knee.y - ank.y), 0.0, 1.0))
		# the shaft, cuff down to the ankle
		var rings := []
		for e in [[0.47, 0.092], [0.455, 0.09], [0.43, 0.08], [0.36, 0.073], [0.26, 0.068], [0.17, 0.065], [0.11, 0.066], [0.075, 0.07]]:
			rings.append({"y": e[0], "rx": e[1], "rz": e[1] * 0.95, "cx": cx.call(e[0]), "cz": 0.004})
		var wts := func(th: float, ri: int, p: Vector3) -> Array:
			return sh if p.y > 0.11 else [["shin_" + s, 0.5], ["foot_" + s, 0.5]]
		kit.ring_loft("boot", rings, -PI, PI, 24, wts)
		# the knee guard: a curved plate over the front of the cuff
		var G := []
		var GW := []
		for ri in 5:
			var y := lerpf(0.53, 0.43, ri / 4.0)
			var row := []
			var wrow := []
			for ci in 9:
				var th := lerpf(-0.7, 0.7, ci / 8.0) * (1.0 - 0.35 * float(ri) / 4.0)
				var r := 0.098 + 0.01 * sin(PI * ri / 4.0)
				row.append(Vector3(cx.call(y) + sin(th) * r, y, 0.006 + cos(th) * r * 0.95))
				wrow.append(sh)
			G.append(row)
			GW.append(wrow)
		var gc := Vector3(cx.call(0.48), 0.48, 0.0)
		kit.grid("boot", G, GW, false, func(p: Vector3) -> Vector3: return p - gc)
		kit.ellipsoid("red", Vector3(cx.call(0.5), 0.5, 0.11), Vector3(0.012, 0.012, 0.006), sh, 8, 6)
		# three straps, each with a buckle on the outer side
		for y in [0.385, 0.285, 0.185]:
			var r := 0.074 if y > 0.3 else 0.069
			var band := [{"y": y + 0.014, "rx": r + 0.004, "rz": r * 0.95 + 0.004, "cx": cx.call(y), "cz": 0.004},
				{"y": y - 0.014, "rx": r + 0.004, "rz": r * 0.95 + 0.004, "cx": cx.call(y), "cz": 0.004}]
			kit.ring_loft("strap", band, -PI, PI, 24, func(th: float, ri: int, p: Vector3) -> Array: return sh)
			var bp := Vector3(cx.call(y) + side * (r + 0.008), y, 0.02)
			Common.buckle(kit, bp, Vector3(side, 0, 0.25), Vector3.UP, 0.03, 0.03, sh)
		# the foot: heel to toe, round-toed, then the thick sole under it
		var path := []
		var radii := []
		var fw := []
		for e in [[-0.075, 0.068, 0.046, 0.05], [-0.03, 0.062, 0.05, 0.052], [0.03, 0.052, 0.05, 0.042], [0.09, 0.044, 0.046, 0.032], [0.15, 0.04, 0.04, 0.024]]:
			path.append(Vector3(ank.x + side * 0.004, e[1], ank.z + e[0]))
			radii.append(Vector2(e[2], e[3]))
			fw.append(ft)
		kit.tube("boot", path, radii, fw, 14, Vector3(1, 0, 0), true)
		var sp := []
		var sr := []
		for e in [[-0.085, 0.052], [-0.03, 0.056], [0.04, 0.054], [0.12, 0.048], [0.175, 0.036]]:
			sp.append(Vector3(ank.x + side * 0.004, 0.017, ank.z + e[0]))
			sr.append(Vector2(e[1], 0.017))
		kit.tube("sole", sp, sr, ft, 14, Vector3(1, 0, 0), true)
		kit.ellipsoid("metal", Vector3(ank.x + side * 0.052, 0.07, ank.z + 0.0), Vector3(0.006, 0.012, 0.012), ft, 8, 6)
	var tex = ctx.T.new(128, 256, Color("191414"))
	tex.rect(0, 0.0, 1, 0.08, Color("2a2222"))
	for k in 4:
		tex.line([Vector2(k * 0.25 + 0.05, 0.12), Vector2(k * 0.25 + 0.08, 0.6)], 0.02, Color("100c0c"), true)
	ctx.mats["boot"] = ctx.M.toon("boot", Color.WHITE, {"tex": tex.texture(ctx.dir + "boot.png")})
	ctx.mats["sole"] = ctx.M.toon("sole", P.sole)
