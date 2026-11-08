# The pauldrons: three curved lacquered plates layered down each shoulder, flaring outward, red at their lower edges;
# the top plate carries the silver emblem (the sheet's DETAILS panel).
extends RefCounted

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var P = ctx.M.PAL
	for side in [1.0, -1.0]:
		var s := "L" if side > 0 else "R"
		for k in 3:
			var top := 1.505 - 0.058 * k
			var h := 0.1 if k == 0 else 0.085
			var r0 := 0.062 + 0.016 * k
			var r1 := 0.094 + 0.012 * k
			var rows := []
			var W := []
			for ri in 6:
				var t := ri / 5.0
				var row := []
				var wrow := []
				for ci in 15:
					var phi := lerpf(-1.75, 1.75, ci / 14.0)   # 0 = straight out from the shoulder
					# the top plate domes over the shoulder: its upper rows pull in toward the neck
					var r := lerpf(r0, r1, sqrt(t)) if k > 0 else lerpf(0.035, r1, sin(t * PI / 2))
					var cx: float = side * (0.185 + 0.028 * t + (0.0 if k > 0 else -0.03 * (1.0 - t)))
					var y := top - h * t
					row.append(Vector3(cx + side * cos(phi) * r, y, -0.015 + sin(phi) * r * 0.95))
					wrow.append([["chest", 0.35], ["upperarm_" + s, 0.65]] if k == 0 else [["upperarm_" + s, 1.0]])
				rows.append(row)
				W.append(wrow)
			var c := Vector3(side * 0.18, top - h * 0.5, -0.015)
			kit.grid("pauldron_top" if k == 0 else "pauldron", rows, W, false, func(p: Vector3) -> Vector3: return p - c)
	var tex = ctx.T.new(256, 128, P.detail)
	tex.rect(0, 0.78, 1, 0.9, P.red)
	tex.rect(0, 0.9, 1, 1, P.red_dark)
	tex.line([Vector2(0, 0.1), Vector2(1, 0.1)], 0.012, Color("4a3e3e"))
	var plain = tex.texture(ctx.dir + "pauldron.png")
	tex.emblem(Vector2(0.5, 0.48), 0.16, P.metal, P.detail, 2.0)
	ctx.mats["pauldron"] = ctx.M.toon("pauldron", Color.WHITE, {"tex": plain, "double": true})
	ctx.mats["pauldron_top"] = ctx.M.toon("pauldron_top", Color.WHITE, {"tex": tex.texture(ctx.dir + "pauldron_top.png"), "double": true})
