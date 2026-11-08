# The front apron: a long red panel hanging from the belt down the front to the knees, black-edged, with the silver
# H-shaped clasp near its foot (the sheet's front view). It hangs on the apron_ chain, so it swings.
extends RefCounted

const Common = preload("res://build/parts/common.gd")

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var P = ctx.M.PAL
	var pts: Array = []
	for ch in ctx.chains:
		if ch[0] == "apron_":
			pts = ch[2]
	var radii := []
	var wts := []
	for j in pts.size():
		radii.append(Vector2(lerpf(0.04, 0.046, float(j) / (pts.size() - 1)), 0.006))
		wts.append(Common.chain_w("apron_", j, pts.size()))
	kit.tube("apron", pts, radii, wts, 10, Vector3(1, 0, 0), true)
	# the H clasp on its lower part
	var p: Vector3 = pts[3] + Vector3(-0.012, 0.035, 0.012)
	var w := [["apron_2", 0.5], ["apron_3", 0.5]]
	var B := Basis()
	kit.box("metal", p + Vector3(-0.022, 0, 0), Vector3(0.009, 0.07, 0.008), w, B)
	kit.box("metal", p + Vector3(0.022, 0, 0), Vector3(0.009, 0.07, 0.008), w, B)
	kit.box("metal", p + Vector3(0, 0.012, 0), Vector3(0.05, 0.009, 0.008), w, B)
	kit.box("metal", p + Vector3(-0.006, -0.03, 0), Vector3(0.03, 0.008, 0.008), w, B)
	var tex = ctx.T.new(64, 256, P.red)
	tex.rect(0, 0, 0.09, 1, P.cloth_dark)
	tex.rect(0.41, 0, 0.59, 1, P.cloth_dark)
	tex.rect(0.91, 0, 1, 1, P.cloth_dark)
	ctx.mats["apron"] = ctx.M.toon("apron", Color.WHITE, {"tex": tex.texture(ctx.dir + "apron.png"), "double": true})
