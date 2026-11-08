# Kage's animations, authored in Godot and baked to bone tracks at 30 fps: idle (the battle stance, breathing),
# walk (in place: the game scrolls the world past him) and slash (wind-up over the right shoulder, the cut across
# the body, follow-through, back to the stance).
# A pose is data: joint angles for the body and legs, and targets for the hands in model space (where the sword fist
# is, which way the blade points, where the free hand is and how much it holds the grip). At bake time the arms reach
# the targets by two-bone IK, the lower foot is planted on the floor and both feet are levelled, so the exported
# clips need no IK at runtime. The eyes' "focused" blend shape narrows them through the cut.
extends RefCounted

const FPS := 30.0

static func V(x: float, y: float, z: float) -> Vector3:
	return Vector3(x, y, z)

static func stance() -> Dictionary:
	return {
		"hipsY": -0.035, "hips": V(0, -0.35, 0), "spine": V(0.06, 0.08, 0), "chest": V(0.04, 0.12, 0), "neck": V(0, 0.05, 0), "head": V(-0.06, 0.12, 0.02),
		"thighR": V(-0.42, 0, 0.06), "kneeR": 0.34, "thighL": V(0.34, 0, -0.08), "kneeL": 0.06,
		"handR": V(-0.15, 1.04, 0.33), "blade": V(0.18, -0.22, 1), "edge": V(0, -1, 0.2), "poleR": V(-0.7, 0.9, -0.5),
		"handL": V(0.23, 0.97, 0.1), "gripL": 0.0, "poleL": V(0.8, 0.9, -0.3), "squint": 0.0 }

static func pose(o: Dictionary) -> Dictionary:
	var p := stance()
	p.merge(o, true)
	return p

static func slash_keys() -> Array:
	return [
		[0.0, stance(), "inOut"],
		[0.16, pose({"hipsY": -0.02, "hips": V(0, -0.5, 0), "spine": V(-0.05, -0.1, 0), "chest": V(-0.08, -0.32, 0), "head": V(0.0, 0.3, 0),
			"handR": V(-0.08, 1.64, 0.04), "blade": V(-0.25, 0.6, -0.75), "edge": V(0, 1, 0.3), "handL": V(0.05, 1.5, 0.12), "gripL": 1.0,
			"poleR": V(-0.9, 1.0, -0.2), "poleL": V(0.6, 1.0, 0.4), "squint": 0.4}), "out"],
		[0.24, pose({"hipsY": -0.03, "hips": V(0, -0.52, 0), "spine": V(-0.06, -0.14, 0), "chest": V(-0.1, -0.38, 0), "head": V(0.02, 0.34, 0),
			"handR": V(-0.06, 1.68, 0.0), "blade": V(-0.3, 0.5, -0.82), "edge": V(0, 1, 0.3), "handL": V(0.06, 1.55, 0.08), "gripL": 1.0,
			"poleR": V(-0.9, 1.0, -0.2), "poleL": V(0.6, 1.0, 0.4), "squint": 0.6}), "in"],
		[0.34, pose({"hipsY": -0.085, "hips": V(0, 0.1, 0), "spine": V(0.18, 0.15, 0), "chest": V(0.16, 0.3, 0), "head": V(-0.14, -0.2, 0),
			"thighR": V(-0.7, 0, 0.08), "kneeR": 0.62, "thighL": V(0.5, 0, -0.1), "kneeL": 0.3,
			"handR": V(0.04, 1.02, 0.5), "blade": V(0.4, -0.55, 0.72), "edge": V(0, -1, 0.1), "handL": V(0.08, 1.06, 0.4), "gripL": 1.0,
			"poleR": V(-0.8, 0.9, 0.2), "poleL": V(0.8, 0.8, 0.2), "squint": 1.0}), "outQuint"],
		[0.5, pose({"hipsY": -0.09, "hips": V(0, 0.32, 0), "spine": V(0.22, 0.24, 0), "chest": V(0.14, 0.42, 0), "head": V(-0.12, -0.3, 0),
			"thighR": V(-0.72, 0, 0.08), "kneeR": 0.66, "thighL": V(0.52, 0, -0.1), "kneeL": 0.3,
			"handR": V(0.2, 0.86, 0.34), "blade": V(0.85, -0.42, -0.25), "edge": V(0, -1, -0.3), "handL": V(0.18, 0.9, 0.24), "gripL": 0.9,
			"poleR": V(-0.6, 0.8, 0.3), "poleL": V(0.9, 0.6, 0.1), "squint": 0.8}), "out"],
		[0.66, pose({"hipsY": -0.075, "hips": V(0, 0.22, 0), "spine": V(0.16, 0.2, 0), "chest": V(0.1, 0.32, 0), "head": V(-0.1, -0.22, 0),
			"thighR": V(-0.62, 0, 0.08), "kneeR": 0.55, "thighL": V(0.46, 0, -0.1), "kneeL": 0.34,
			"handR": V(0.16, 0.88, 0.36), "blade": V(0.8, -0.45, -0.2), "edge": V(0, -1, -0.3), "handL": V(0.2, 0.95, 0.18), "gripL": 0.2,
			"poleR": V(-0.6, 0.8, 0.3), "poleL": V(0.9, 0.6, 0.1), "squint": 0.5}), "inOut"],
		[1.1, stance(), "inOut"]]

static func _ease(name: String, t: float) -> float:
	match name:
		"in": return t * t
		"out": return 1.0 - (1.0 - t) * (1.0 - t)
		"outQuint": return 1.0 - pow(1.0 - t, 5.0)
	return 2.0 * t * t if t < 0.5 else 1.0 - pow(-2.0 * t + 2.0, 2.0) / 2.0

static func blend(a: Dictionary, b: Dictionary, k: float) -> Dictionary:
	var out := {}
	for key in a:
		out[key] = a[key].lerp(b[key], k) if a[key] is Vector3 else lerpf(a[key], b[key], k)
	return out

static func sample(clip: String, t: float) -> Dictionary:
	if clip == "idle":
		var b := sin(t * 2.1)
		var p := stance()
		p.hipsY += 0.006 * b
		p.chest += V(0.025 * b, 0, 0)
		p.head += V(-0.015 * b, 0, 0)
		p.handR += V(0, 0.01 * b, 0)
		p.blade += V(0, 0.04 * sin(t * 4.2), 0)   # two sways per breath, so the loop closes
		return p
	if clip == "walk":
		var ph := t * TAU / walk_len()
		var s := sin(ph)
		var c := cos(ph)
		var p := stance()
		p.hips = V(0.02, -0.12 + 0.1 * s, 0.03 * s)
		p.spine = V(0.08, 0.04 - 0.06 * s, 0)
		p.chest = V(0.04, 0.08 - 0.08 * s, 0)
		p.hipsY = -0.02 + 0.025 * absf(c)
		p.thighR = V(-0.55 * s - 0.05, 0, 0.04)
		p.thighL = V(0.55 * s - 0.05, 0, -0.04)
		p.kneeR = 0.12 + 0.75 * maxf(0.0, sin(ph + 1.9))
		p.kneeL = 0.12 + 0.75 * maxf(0.0, sin(ph + 1.9 + PI))
		p.handR = V(-0.16, 0.99 + 0.015 * c, 0.3 + 0.03 * s)
		p.blade = V(0.25, -0.45, 1)
		p.handL = V(0.22, 0.97, 0.08 - 0.04 * s)
		return p
	var keys := slash_keys()
	t = minf(t, 1.1)
	var i := 0
	while i < keys.size() - 2 and t > keys[i + 1][0]:
		i += 1
	var t0: float = keys[i][0]
	var t1: float = keys[i + 1][0]
	return blend(keys[i][1], keys[i + 1][1], _ease(keys[i + 1][2], (t - t0) / (t1 - t0)))

static func idle_len() -> float:
	return TAU / 2.1

static func walk_len() -> float:
	return 1.0 / 0.95

# ---- forward kinematics on the rig (identity rest rotations: a bone's local transform is its offset + rotation) ----
static func euler(e: Vector3) -> Basis:
	return Basis(Vector3(1, 0, 0), e.x) * Basis(Vector3(0, 1, 0), e.y) * Basis(Vector3(0, 0, 1), e.z)

static func frame(dir: Vector3, hint: Vector3) -> Basis:
	var z := dir.normalized()
	var x := (hint - z * hint.dot(z)).normalized()
	return Basis(x, z.cross(x), z)

class Poser:
	var pos: Dictionary      # rest model positions
	var parent: Dictionary
	var rot := {}            # name -> local Basis
	var hip_off := Vector3.ZERO
	var g := {}              # name -> global Transform3D

	func _init(rig: Dictionary) -> void:
		pos = rig.pos
		parent = rig.parent

	func local_t(name: String) -> Transform3D:
		var off: Vector3 = pos[name] - (pos[parent[name]] if parent[name] != "" else Vector3.ZERO)
		if name == "hips":
			off += hip_off
		return Transform3D(rot.get(name, Basis()), off)

	func glob(name: String) -> Transform3D:
		var p: String = parent[name]
		return (glob(p) if p != "" else Transform3D()) * local_t(name)

# solve one arm: shoulder S (upperarm origin), wrist target W, elbow toward pole; returns [upper local, fore local]
static func solve_arm(P: Poser, s: String, wrist: Vector3, pole: Vector3) -> void:
	var ua := "upperarm_" + s
	var fa := "forearm_" + s
	var hd := "hand_" + s
	var S_rest: Vector3 = P.pos[ua]
	var E_rest: Vector3 = P.pos[fa]
	var W_rest: Vector3 = P.pos[hd]
	var la := (E_rest - S_rest).length()
	var lb := (W_rest - E_rest).length()
	var hint0 := (E_rest - S_rest) - (W_rest - S_rest).normalized() * (E_rest - S_rest).dot((W_rest - S_rest).normalized())
	if hint0.length() < 1e-4:
		hint0 = Vector3(0, 0, -1)
	hint0 = (hint0.normalized() + Vector3(0, 0, -1)).normalized()
	P.rot[ua] = Basis()
	P.rot[fa] = Basis()
	var parent_g := P.glob("shoulder_" + s)
	var S := (parent_g * Transform3D(Basis(), S_rest - P.pos["shoulder_" + s])).origin
	var d := wrist - S
	var dist := clampf(d.length(), 0.05, (la + lb) * 0.999)
	var dn := d.normalized()
	var a := (la * la + dist * dist - lb * lb) / (2.0 * la * dist)
	var b := pole - S
	b = (b - dn * b.dot(dn))
	if b.length() < 1e-5:
		b = Vector3(0, 0, -1)
	b = b.normalized()
	var E := S + dn * a * la + b * sqrt(maxf(0.0, 1.0 - a * a)) * la
	var Wp := S + dn * dist
	var Rw := frame(E - S, b) * frame(E_rest - S_rest, hint0).transposed()
	P.rot[ua] = parent_g.basis.transposed() * Rw
	var ug := P.glob(ua)
	var Rw2 := frame(Wp - E, b) * frame(W_rest - E_rest, hint0).transposed()
	P.rot[fa] = ug.basis.orthonormalized().transposed() * Rw2

static func apply(P: Poser, p: Dictionary) -> void:
	P.rot.clear()
	P.hip_off = Vector3(0, p.hipsY, 0)
	for e in [["hips", "hips"], ["spine", "spine"], ["chest", "chest"], ["neck", "neck"], ["head", "head"], ["thigh_R", "thighR"], ["thigh_L", "thighL"]]:
		P.rot[e[0]] = euler(p[e[1]])
	P.rot["shin_R"] = Basis(Vector3(1, 0, 0), p.kneeR)
	P.rot["shin_L"] = Basis(Vector3(1, 0, 0), p.kneeL)
	# plant the lower foot on the floor
	var low := minf(P.glob("foot_R").origin.y, P.glob("foot_L").origin.y)
	P.hip_off.y += P.pos["foot_R"].y - low
	# level feet, turned a little with the hips
	var level := Basis(Vector3(0, 1, 0), p.hips.y * 0.8)
	for s in ["R", "L"]:
		P.rot["foot_" + s] = P.glob("shin_" + s).basis.orthonormalized().transposed() * level
	# the sword hand: the katana's frame from the blade and edge directions
	var B: Vector3 = p.blade.normalized()
	var E: Vector3 = p.edge
	var kb := Basis()
	kb.z = B
	kb.y = -(E - B * E.dot(B)).normalized()
	kb.x = kb.y.cross(kb.z)
	var k_off: Vector3 = P.pos["katana"] - P.pos["hand_R"]
	solve_arm(P, "R", p.handR - kb * k_off, p.poleR)
	P.rot["hand_R"] = P.glob("forearm_R").basis.orthonormalized().transposed() * kb
	# the free hand: at its rest point, or on the grip below the sword hand
	var grip_pt: Vector3 = P.glob("katana").origin - B * 0.11
	var l_off := Vector3(0.003, -0.05, 0.012)
	var free_w: Vector3 = p.handL - l_off
	var grip_w: Vector3 = grip_pt - kb * l_off
	solve_arm(P, "L", free_w.lerp(grip_w, p.gripL), p.poleL)
	var fg := P.glob("forearm_L").basis.orthonormalized()
	P.rot["hand_L"] = Basis(Quaternion().slerp(Quaternion(fg.transposed() * kb), p.gripL))

const POSED := ["hips", "spine", "chest", "neck", "head", "upperarm_R", "forearm_R", "hand_R", "upperarm_L", "forearm_L", "hand_L",
	"thigh_R", "shin_R", "foot_R", "thigh_L", "shin_L", "foot_L"]

static func bake(rig: Dictionary, clip: String, length: float, loop: bool) -> Animation:
	var P := Poser.new(rig)
	var anim := Animation.new()
	anim.length = length
	anim.loop_mode = Animation.LOOP_LINEAR if loop else Animation.LOOP_NONE
	var tracks := {}
	for b in POSED:
		var t := anim.add_track(Animation.TYPE_ROTATION_3D)
		anim.track_set_path(t, NodePath("Skeleton3D:" + b))
		tracks[b] = t
	var hip_t := anim.add_track(Animation.TYPE_POSITION_3D)
	anim.track_set_path(hip_t, NodePath("Skeleton3D:hips"))
	var eye_t := anim.add_track(Animation.TYPE_BLEND_SHAPE)
	anim.track_set_path(eye_t, NodePath("Skeleton3D/Eyes:focused"))
	var frames := int(round(length * FPS))
	for f in frames + 1:
		var t := float(f) / FPS
		if f == frames:
			t = length
		var p := sample(clip, t)
		apply(P, p)
		for b in POSED:
			anim.rotation_track_insert_key(tracks[b], t, Quaternion(P.rot.get(b, Basis()).orthonormalized()))
		anim.position_track_insert_key(hip_t, t, P.pos["hips"] + P.hip_off)
		anim.blend_shape_track_insert_key(eye_t, t, p.squint)
	return anim

static func build(rig: Dictionary, player: AnimationPlayer) -> void:
	var lib := AnimationLibrary.new()
	lib.add_animation("idle", bake(rig, "idle", idle_len(), true))
	lib.add_animation("walk", bake(rig, "walk", walk_len(), true))
	lib.add_animation("slash", bake(rig, "slash", 1.1, false))
	player.add_animation_library("", lib)
