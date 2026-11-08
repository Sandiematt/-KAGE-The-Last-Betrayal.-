# The eyes: two sharp, upswept glowing white almonds lying on the face (the sheet's EXPRESSIONS panel). They are their
# own mesh with a blend shape, "focused" (narrowed, slanted harder); the "awakened" red glow is a material swap in
# Three.js. Built twice (open and focused) with the same vertex order, so the second becomes the blend shape.
extends RefCounted

const Face = preload("res://build/parts/face.gd")

# one eye as a 2-row strip between its upper and lower lid curves; side +1 his left, -1 his right
static func _eye(kit, side: float, focus: float) -> void:
	var cols := 9
	var top := []
	var bot := []
	for c in cols:
		var t := float(c) / (cols - 1)            # 0 inner corner .. 1 outer corner
		var lon := side * lerpf(0.18, 0.66, t)
		var lift := 0.1 * t * t + 0.05 * focus * t    # the outer corner sweeps up to a point
		var open := sin(PI * pow(t, 0.65)) * lerpf(0.07, 0.03, focus)
		var lat_mid := 0.05 + lift - 0.03 * focus * (1.0 - t)
		top.append(Face.surface(lat_mid + open * 0.6, lon) * 1.0)
		bot.append(Face.surface(lat_mid - open * 0.4, lon))
	var P := [[], []]
	var W := [[], []]
	for c in cols:
		var n0: Vector3 = (top[c] - Face.CENTER).normalized()
		var n1: Vector3 = (bot[c] - Face.CENTER).normalized()
		P[0].append(top[c] + n0 * 0.003)
		P[1].append(bot[c] + n1 * 0.003)
		W[0].append([["head", 1.0]])
		W[1].append([["head", 1.0]])
	kit.grid("eye", P, W, false, func(p: Vector3) -> Vector3: return p - Face.CENTER)

static func build_mesh(ctx: Dictionary, MeshKit) -> ArrayMesh:
	var base = MeshKit.new()
	var focused = MeshKit.new()
	base.bone_index = ctx.kit.bone_index
	focused.bone_index = ctx.kit.bone_index
	for side in [1.0, -1.0]:
		_eye(base, side, 0.0)
		_eye(focused, side, 1.0)
	var s = base.surfs["eye"]
	var f = focused.surfs["eye"]
	var mesh := ArrayMesh.new()
	mesh.blend_shape_mode = Mesh.BLEND_SHAPE_MODE_NORMALIZED
	mesh.add_blend_shape("focused")
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = s.v
	arr[Mesh.ARRAY_NORMAL] = s.n
	arr[Mesh.ARRAY_TEX_UV] = s.uv
	arr[Mesh.ARRAY_BONES] = s.b
	arr[Mesh.ARRAY_WEIGHTS] = s.w
	arr[Mesh.ARRAY_INDEX] = s.i
	var bs := []
	bs.resize(Mesh.ARRAY_MAX)
	bs[Mesh.ARRAY_VERTEX] = f.v
	bs[Mesh.ARRAY_NORMAL] = f.n
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr, [bs])
	mesh.surface_set_name(0, "eye")
	mesh.surface_set_material(0, ctx.M.toon("eye", ctx.M.PAL.eye, {"emit": Color(1, 0.98, 0.95), "outline": false, "rim": false, "double": true}))
	return mesh
