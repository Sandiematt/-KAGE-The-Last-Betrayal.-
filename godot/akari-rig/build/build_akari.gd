extends SceneTree
## Builds scenes/akari.tscn from art/akari_rig.json (written by tools/akari-rig/cut.py from rig.json):
##
##   Akari (CharacterBody2D, scripts/Akari.gd)
##     Collision
##     Visual (Node2D: draw scale; mirrored to face right)
##       Rig (Node2D: puts her feet on the body's origin)
##         Skeleton2D
##           hips > torso > head > hair_top_0..3, hair_low_0..3
##                        > staff > ribbon_l_0..3, ribbon_r_0..3, flowers (FlowerSpin), Petals
##                        > scarf_0..3
##                > leg_f_up > leg_f_low, leg_b_up > leg_b_low
##                > coat_top_0..3, coat_low_0..3, dress_f_0..3, dress_m_0..3, dress_r_0..3
##         Parts: one skinned Polygon2D per part, back to front (hair, leg_back, coat, leg_front, dress,
##                scarf, head, body, ribbon), each with internal vertices and weights on its bones
##     SecondaryMotion: one SecondaryMotionChain per bone chain
##
## Run (after `godot --headless --path godot/akari-rig --import` has imported the textures):
##   godot --headless --path godot/akari-rig --script res://build/build_akari.gd

const DRAW_SCALE := 0.5

## How each chain moves: [stiffness, tip_stiffness, damping_ratio, wind_amplitude, wind_tip_gain,
## wind_frequency, velocity_influence, max_drag_angle, max_bend]
const FEEL := {
	"hair_top": [62.0, 20.0, 0.26, 0.045, 2.4, 0.50, 0.00075, 0.55, 1.1],
	"hair_low": [58.0, 18.0, 0.24, 0.050, 2.4, 0.46, 0.00080, 0.60, 1.2],
	"scarf":    [50.0, 15.0, 0.22, 0.070, 2.6, 0.60, 0.00085, 0.70, 1.3],
	"coat_top": [78.0, 28.0, 0.30, 0.040, 2.2, 0.52, 0.00042, 0.30, 0.7],
	"coat_low": [84.0, 32.0, 0.32, 0.035, 2.0, 0.55, 0.00036, 0.26, 0.6],
	"dress_f":  [150.0, 70.0, 0.40, 0.018, 1.8, 0.70, 0.00030, 0.22, 0.45],
	"dress_m":  [120.0, 48.0, 0.36, 0.022, 2.0, 0.62, 0.00028, 0.22, 0.45],
	"dress_r":  [100.0, 40.0, 0.32, 0.030, 2.0, 0.58, 0.00035, 0.26, 0.5],
	"ribbon_l": [55.0, 18.0, 0.18, 0.060, 2.2, 0.75, 0.00070, 0.60, 1.3],
	"ribbon_r": [50.0, 16.0, 0.18, 0.060, 2.2, 0.68, 0.00070, 0.60, 1.3],
}

var akari: CharacterBody2D
var bones := {}          # name -> Bone2D
var skeleton: Skeleton2D


func _init() -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://art/akari_rig.json"))
	if data.is_empty():
		push_error("art/akari_rig.json missing: run tools/akari-rig/cut.py")
		quit(1)
		return
	akari = CharacterBody2D.new()
	akari.name = "Akari"
	akari.set_script(load("res://scripts/Akari.gd"))

	var col := CollisionShape2D.new()
	col.name = "Collision"
	var cap := CapsuleShape2D.new()
	cap.radius = 55.0
	cap.height = 430.0
	col.shape = cap
	col.position = Vector2(0, -cap.height * 0.5)
	_add(akari, col)

	var visual := Node2D.new()
	visual.name = "Visual"
	visual.scale = Vector2(DRAW_SCALE, DRAW_SCALE)
	_add(akari, visual)
	var rig := Node2D.new()
	rig.name = "Rig"
	rig.position = -Vector2(data["pivot"][0], data["pivot"][1])
	_add(visual, rig)

	skeleton = Skeleton2D.new()
	skeleton.name = "Skeleton2D"
	_add(rig, skeleton)
	_build_bones(data["bones"])

	var parts := Node2D.new()
	parts.name = "Parts"
	_add(rig, parts)
	for p in data["parts"]:
		_build_part(parts, p)

	var staff: Bone2D = bones["staff"]
	var z := 0
	for f in data["flowers"]:
		_build_flower(f, z)
		z += 1
	_build_petals(staff, data["flowers"])

	var motion := Node.new()
	motion.name = "SecondaryMotion"
	_add(akari, motion)
	var i := 0
	for cname in data["chains"]:
		var m := Node.new()
		m.name = cname
		m.set_script(load("res://scripts/SecondaryMotionChain.gd"))
		_add(motion, m)
		m.set("root_bone", bones[data["chains"][cname][0]])
		m.set("bone_count", data["chains"][cname].size())
		m.set("body", akari)
		var f: Array = FEEL.get(cname, FEEL["scarf"])
		m.set("stiffness", f[0])
		m.set("tip_stiffness", f[1])
		m.set("damping_ratio", f[2])
		m.set("wind_amplitude", f[3])
		m.set("wind_tip_gain", f[4])
		m.set("wind_frequency", f[5])
		m.set("velocity_influence", f[6])
		m.set("max_drag_angle", f[7])
		m.set("max_bend", f[8])
		m.set("wind_phase", 1.37 * i)
		i += 1

	var scene := PackedScene.new()
	var err := scene.pack(akari)
	if err == OK:
		err = ResourceSaver.save(scene, "res://scenes/akari.tscn")
	print("akari.tscn: ", error_string(err), "  bones ", bones.size(), "  parts ", data["parts"].size(),
			"  flowers ", data["flowers"].size(), "  chains ", data["chains"].size())
	akari.free()
	quit(0 if err == OK else 1)


func _add(parent: Node, child: Node) -> void:
	parent.add_child(child)
	child.owner = akari


func _global(b: Dictionary) -> Transform2D:
	return Transform2D(float(b["angle"]), Vector2(b["pos"][0], b["pos"][1]))


func _build_bones(list: Array) -> void:
	var by_name := {}
	for b in list:
		by_name[b["name"]] = b
	for b in list:  # parents come before their children in the list
		var bone := Bone2D.new()
		bone.name = b["name"]
		var parent_node: Node = skeleton
		var local := _global(b)
		if b["parent"] != null:
			parent_node = bones[b["parent"]]
			local = _global(by_name[b["parent"]]).affine_inverse() * _global(b)
		bone.rest = local
		bone.transform = local
		bone.set_autocalculate_length_and_angle(false)
		bone.set_length(float(b["length"]))
		bone.set_bone_angle(0.0)
		_add(parent_node, bone)
		bones[b["name"]] = bone


func _build_part(parent: Node, p: Dictionary) -> void:
	var poly := Polygon2D.new()
	poly.name = p["name"]
	poly.texture = load(p["texture"])
	var verts := PackedVector2Array()
	var uvs := PackedVector2Array()
	for v in p["verts"]:
		verts.append(Vector2(v[0], v[1]))
	for v in p["uvs"]:
		uvs.append(Vector2(v[0], v[1]))
	poly.polygon = verts
	poly.uv = uvs
	poly.internal_vertex_count = verts.size() - int(p["outline_count"])
	var tris := []
	for t in p["triangles"]:
		tris.append(PackedInt32Array(t))
	poly.polygons = tris
	_add(parent, poly)
	poly.skeleton = poly.get_path_to(skeleton)
	for bname in p["weights"]:
		var w := PackedFloat32Array(p["weights"][bname])
		poly.add_bone(skeleton.get_path_to(bones[bname]), w)


func _build_flower(f: Dictionary, order: int) -> void:
	var bone: Bone2D = bones[f["bone"]]
	var spr := Sprite2D.new()
	spr.name = "Flower_" + f["name"]
	spr.set_script(load("res://scripts/FlowerSpin.gd"))
	spr.texture = load(f["texture"])
	var tex_size := spr.texture.get_size()
	spr.centered = true
	spr.offset = Vector2(f["offset"][0], f["offset"][1]) + tex_size * 0.5
	var bone_global := _bone_global(bone)
	var c := Vector2(f["c"][0], f["c"][1])
	spr.position = bone_global.affine_inverse() * c
	spr.rotation = -bone_global.get_rotation() + deg_to_rad(float(f.get("turn", 0)))
	var k := float(f.get("scale", 1.0))
	spr.scale = Vector2(k, k)
	spr.z_index = 10 + order
	_add(bone, spr)
	spr.set("spin_speed", float(f["spin"]))
	spr.set("body", akari)


func _bone_global(bone: Bone2D) -> Transform2D:
	var t := bone.transform
	var p := bone.get_parent()
	while p is Bone2D:
		t = (p as Bone2D).transform * t
		p = p.get_parent()
	return t


func _build_petals(staff: Bone2D, flowers: Array) -> void:
	# loose petals shed by the blade's blossoms; world-space, so they drift off behind her as she moves
	var c := Vector2.ZERO
	var n := 0
	for f in flowers:
		if String(f["name"]).begins_with("blade"):
			c += Vector2(f["c"][0], f["c"][1])
			n += 1
	c /= maxf(n, 1)
	var p := CPUParticles2D.new()
	p.name = "Petals"
	p.position = _bone_global(staff).affine_inverse() * c
	p.z_index = 20
	p.amount = 18
	p.lifetime = 3.6
	p.preprocess = 2.0
	p.local_coords = false
	p.texture = load("res://art/petal.png")
	p.emission_shape = CPUParticles2D.EMISSION_SHAPE_SPHERE
	p.emission_sphere_radius = 46.0
	p.direction = Vector2(1, -0.35)
	p.spread = 70.0
	p.initial_velocity_min = 25.0
	p.initial_velocity_max = 70.0
	p.gravity = Vector2(18, 38)
	p.damping_min = 4.0
	p.damping_max = 10.0
	p.angular_velocity_min = -220.0
	p.angular_velocity_max = 220.0
	p.angle_min = -180.0
	p.angle_max = 180.0
	p.scale_amount_min = 0.8
	p.scale_amount_max = 1.5
	var ramp := Gradient.new()
	ramp.set_color(0, Color(1, 1, 1, 0.0))
	ramp.set_color(1, Color(1, 1, 1, 0.0))
	ramp.add_point(0.08, Color(1, 1, 1, 1))
	ramp.add_point(0.75, Color(1, 0.92, 0.96, 0.9))
	p.color_ramp = ramp
	p.hue_variation_min = -0.03
	p.hue_variation_max = 0.03
	_add(staff, p)
