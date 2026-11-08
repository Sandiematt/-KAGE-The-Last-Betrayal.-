# The katana (the sheet's WEAPON panel): a long slightly curved silver blade with a bright edge, a silver habaki, an
# upright silver tsuba, a black tsuka wrapped over red diamonds, a silver kashira and a red tassel from the pommel.
# Built along +Z from the katana bone (his right fist), the edge down (-Y); the blade curves up toward the spine.
extends RefCounted

const Common = preload("res://build/parts/common.gd")
const Tassel = preload("res://build/parts/tassel.gd")

const BLADE_START := 0.065
const BLADE_LEN := 0.76
const SORI := 0.03

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var P = ctx.M.PAL
	var K: Vector3 = ctx.pos["katana"]
	var w := [["katana", 1.0]]
	# the grip
	kit.tube("tsuka", [K + Vector3(0, 0, -0.205), K + Vector3(0, 0, -0.08), K + Vector3(0, 0, 0.038)], [Vector2(0.0155, 0.019), Vector2(0.0165, 0.0195), Vector2(0.016, 0.02)], w, 12, Vector3(1, 0, 0), false)
	kit.ellipsoid("metal", K + Vector3(0, 0, -0.21), Vector3(0.017, 0.021, 0.012), w, 10, 6)
	# the tsuba: an upright silver plate with a dark inset, then the habaki
	kit.box("metal", K + Vector3(0, 0.004, 0.044), Vector3(0.05, 0.084, 0.008), w)
	kit.box("detail", K + Vector3(0, 0.004, 0.044), Vector3(0.036, 0.068, 0.0095), w)
	kit.box("metal", K + Vector3(0, 0.0, 0.058), Vector3(0.012, 0.03, 0.02), w)
	# the blade: a lens section, curving up toward the tip, the kissaki sweeping the edge up to the point
	var path := []
	var radii := []
	var n := 24
	for k in n + 1:
		var t := float(k) / n
		var z := BLADE_START + BLADE_LEN * t
		var tipk := smoothstep(0.9, 1.0, t)
		var y := SORI * t * t + 0.006 * tipk
		path.append(K + Vector3(0, y, z))
		var wdt := lerpf(0.0135, 0.0105, t) * (1.0 - tipk * 0.97)
		radii.append(Vector2(0.0034 * (1.0 - tipk * 0.8), wdt))
	kit.tube("blade", path, radii, w, 10, Vector3(1, 0, 0), true)
	# the tassel from the pommel
	var pts: Array = []
	for ch in ctx.chains:
		if ch[0] == "swordtassel_":
			pts = ch[2]
	kit.tube("red", [pts[0], pts[1]], [Vector2(0.004, 0.004), Vector2(0.004, 0.004)], [Common.chain_w("swordtassel_", 0, 4), Common.chain_w("swordtassel_", 1, 4)], 6, Vector3(1, 0, 0), false)
	Tassel.diamond(kit, pts[1] + Vector3(0, -0.02, 0), 0.016, Common.chain_w("swordtassel_", 1, 4))
	Tassel.tassel(kit, pts[1] + Vector3(0, -0.05, 0), 0.12, 0.008, 0.022, [["swordtassel_1", 1.0]], [["swordtassel_2", 1.0]])
	# ---- textures ----
	var wrap = ctx.T.new(64, 256, Color("0c0909"))
	wrap.diamonds(9, P.red, 0.18)
	ctx.mats["tsuka"] = ctx.M.toon("tsuka", Color.WHITE, {"tex": wrap.texture(ctx.dir + "tsuka.png")})
	# round the blade (u): the edge sits at u 0.75 (the -Y side), the spine at 0.25
	var bl = ctx.T.new(128, 16, Color("8c9198"))
	bl.rect(0.18, 0, 0.32, 1, Color("5d6168"))
	bl.rect(0.64, 0, 0.86, 1, Color("e8ebef"))
	ctx.mats["blade"] = ctx.M.toon("blade", Color.WHITE, {"tex": bl.texture(ctx.dir + "blade.png"), "rim": false})
	ctx.mats["detail"] = ctx.M.toon("detail", P.detail)
