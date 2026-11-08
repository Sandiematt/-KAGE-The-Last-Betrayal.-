# The hands: black leather gloves closed into fists (the right one round the katana's grip), knuckles forward,
# a thumb lobe over the fingers.
extends RefCounted

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var pos: Dictionary = ctx.pos
	for s in ["L", "R"]:
		var side := 1.0 if s == "L" else -1.0
		var h: Vector3 = pos["hand_" + s]
		var w := [["hand_" + s, 1.0]]
		var c := h + Vector3(side * 0.003, -0.05, 0.012)
		kit.ellipsoid("glove", c, Vector3(0.036, 0.048, 0.043), w, 14, 10)
		kit.ellipsoid("glove", c + Vector3(0, -0.006, 0.032), Vector3(0.032, 0.036, 0.016), w, 12, 8)          # the knuckles
		kit.ellipsoid("glove", c + Vector3(-side * 0.03, 0.004, 0.022), Vector3(0.014, 0.026, 0.015), w, 10, 8,
			Basis(Vector3(0, 0, 1), side * 0.5))                                                                     # the thumb
		kit.tube("glove", [h + Vector3(0, 0.012, 0), h + Vector3(side * 0.002, -0.018, 0.006)], [Vector2(0.038, 0.036), Vector2(0.04, 0.04)], w, 12, Vector3(1, 0, 0), false)
	ctx.mats["glove"] = ctx.M.toon("glove", ctx.M.PAL.leather)
