# Kage's skeleton. Model space: +Y up, +Z forward (he faces +Z, the glTF convention), +X his left; metres.
# Every bone's rest rotation is identity, so a pose rotation is simply a rotation in model axes, and a bone's direction
# is the offset to its child. Rest pose: standing, arms hanging slightly out, the katana held forward in his right hand.
# Cloth chains (the cloak's eight chains round the waist, the two scarf tails, the front apron, the hip tassel and the
# sword tassel) are bones too: Three.js swings them as spring bones.
extends RefCounted

const HIP_Y := 0.97

# [name, parent, model-space rest position]
const BODY := [
	["root", "", Vector3(0, 0, 0)],
	["hips", "root", Vector3(0, HIP_Y, 0)],
	["spine", "hips", Vector3(0, 1.07, -0.005)],
	["chest", "spine", Vector3(0, 1.26, -0.01)],
	["neck", "chest", Vector3(0, 1.47, -0.012)],
	["head", "neck", Vector3(0, 1.555, -0.005)],
	["shoulder_L", "chest", Vector3(0.06, 1.43, -0.015)],
	["upperarm_L", "shoulder_L", Vector3(0.185, 1.415, -0.015)],
	["forearm_L", "upperarm_L", Vector3(0.225, 1.15, -0.03)],
	["hand_L", "forearm_L", Vector3(0.25, 0.905, -0.005)],
	["shoulder_R", "chest", Vector3(-0.06, 1.43, -0.015)],
	["upperarm_R", "shoulder_R", Vector3(-0.185, 1.415, -0.015)],
	["forearm_R", "upperarm_R", Vector3(-0.225, 1.15, -0.03)],
	["hand_R", "forearm_R", Vector3(-0.25, 0.905, -0.005)],
	["katana", "hand_R", Vector3(-0.255, 0.855, 0.015)],
	["thigh_L", "hips", Vector3(0.092, 0.925, 0)],
	["shin_L", "thigh_L", Vector3(0.096, 0.49, 0.005)],
	["foot_L", "shin_L", Vector3(0.098, 0.075, -0.01)],
	["thigh_R", "hips", Vector3(-0.092, 0.925, 0)],
	["shin_R", "thigh_R", Vector3(-0.096, 0.49, 0.005)],
	["foot_R", "shin_R", Vector3(-0.098, 0.075, -0.01)],
	["saya", "hips", Vector3(0.175, 0.985, 0.075)]
]

# the cloak: eight chains round the waist (theta from the front toward his left), each 4 bones plus a tail, running
# down a cone from the waist (radius 0.17) to the hem (radius 0.36) over CLOAK_LEN
const CLOAK_THETA := [0.62, 1.22, 1.85, 2.6, -0.62, -1.22, -1.85, -2.6]
const CLOAK_SEGS := 4
const CLOAK_TOP := 0.985
const CLOAK_LEN := 0.86

static func cloak_point(theta: float, s: float) -> Vector3:
	var r := 0.172 + 0.2 * s
	return Vector3(sin(theta) * r, CLOAK_TOP - s * CLOAK_LEN, cos(theta) * r * 0.8)

static func chains() -> Array:
	# [name prefix, parent, points (first = root of the chain)]
	var out := []
	for k in CLOAK_THETA.size():
		var pts := []
		for j in CLOAK_SEGS + 1:
			pts.append(cloak_point(CLOAK_THETA[k], float(j) / CLOAK_SEGS))
		out.append(["cloak%d_" % k, "hips", pts])
	# the scarf tails hang down his back from the knot behind the neck
	var a := []
	var b := []
	for j in 7:
		a.append(Vector3(0.035 + 0.01 * j, 1.5 - 0.13 * j, -0.085 - 0.012 * j))
	for j in 6:
		b.append(Vector3(-0.02 - 0.006 * j, 1.49 - 0.11 * j, -0.09 - 0.01 * j))
	out.append(["scarfA_", "neck", a])
	out.append(["scarfB_", "neck", b])
	# the red apron down the front, the tassel at his left hip, the tassel on the katana's pommel
	var ap := []
	for j in 5:
		ap.append(Vector3(0.0, 0.955 - 0.13 * j, 0.152 + 0.012 * j))
	out.append(["apron_", "hips", ap])
	out.append(["tassel_", "hips", [Vector3(0.135, 0.93, 0.115), Vector3(0.14, 0.84, 0.12), Vector3(0.14, 0.72, 0.12), Vector3(0.14, 0.6, 0.12)]])
	out.append(["swordtassel_", "katana", [Vector3(-0.255, 0.855, -0.205), Vector3(-0.255, 0.79, -0.21), Vector3(-0.255, 0.69, -0.21), Vector3(-0.255, 0.6, -0.21)]])
	return out

# build the Skeleton3D; returns {skeleton, pos: {name: model pos}, parent: {name: parent}}
static func build() -> Dictionary:
	var sk := Skeleton3D.new()
	sk.name = "Skeleton3D"
	var pos := {}
	var par := {}
	var add := func(name: String, parent: String, p: Vector3) -> void:
		var i := sk.get_bone_count()
		sk.add_bone(name)
		if parent != "":
			sk.set_bone_parent(i, sk.find_bone(parent))
		var local: Vector3 = p - (pos[parent] if parent != "" else Vector3.ZERO)
		sk.set_bone_rest(i, Transform3D(Basis(), local))
		pos[name] = p
		par[name] = parent
	for b in BODY:
		add.call(b[0], b[1], b[2])
	for ch in chains():
		var prev: String = ch[1]
		var pts: Array = ch[2]
		for j in pts.size():
			var nm: String = ch[0] + str(j)
			add.call(nm, prev, pts[j])
			prev = nm
	sk.reset_bone_poses()
	return {"skeleton": sk, "pos": pos, "parent": par}
