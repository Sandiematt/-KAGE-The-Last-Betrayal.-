class_name SecondaryMotionChain
extends Node
## Procedural secondary motion for one chain of Bone2D nodes (a scarf, coat tail, skirt panel, lock of hair or
## ribbon) that a skinned Polygon2D is weighted to.
##
## Every physics tick each bone's angle springs (stiffness + damping) towards a target made of three things:
##   rest      the angle the art was drawn at, measured from the bone's parent, so the chain follows the body;
##   wind      a sine wave whose phase travels from the attachment out to the tip, with a slow gust swell;
##   inertia   an inverse-velocity offset: the body's velocity, negated (-velocity.x, -velocity.y) and turned
##             into each bone's skeleton space, pushes the bone the way air drag would, so the cloth trails
##             behind a moving character and swings back and settles when she stops.
## The springs run on the bones' angles in skeleton space, not on their local rotations, so a bone also lags
## behind its parent when the parent turns: the whip that carries a movement down to the tip.

## First bone of the chain: the one attached to the body.
@export var root_bone: Bone2D
## How many bones the chain has, counted from root_bone along the first Bone2D child.
@export_range(1, 16) var bone_count := 4
## The body whose motion drives the chain. A CharacterBody2D's velocity is used when it has one; otherwise
## the velocity is measured from how far the body moved since the last tick.
@export var body: Node2D

@export_group("Wind")
## Wind sway at the root bone, radians.
@export var wind_amplitude := 0.05
## Wind sway at the tip, as a multiple of the root's.
@export var wind_tip_gain := 2.0
## Cycles per second of the sway.
@export var wind_frequency := 0.55
## Phase lag per bone (radians): the wave travels from the attachment to the tip.
@export var wind_phase_step := 0.7
## This chain's own phase, so neighbouring chains don't move in lockstep.
@export var wind_phase := 0.0
## How much a slow gust swells and calms the sway (0 = steady).
@export_range(0.0, 1.0) var gust_strength := 0.35

@export_group("Inertia")
## Radians of offset per px/s of velocity (the inverse-velocity drag).
@export var velocity_influence := 0.0006
## Largest inertia offset a single bone takes, radians.
@export var max_drag_angle := 0.5
## How fast the measured velocity follows the body (1/s); lower is smoother.
@export var velocity_smoothing := 14.0

@export_group("Spring")
## Spring stiffness at the root bone (1/s²); the root holds firm.
@export var stiffness := 90.0
## Spring stiffness at the tip; lower so the tip lags and whips.
@export var tip_stiffness := 30.0
## 1 settles without overshoot; lower overshoots and swings before it settles.
@export_range(0.05, 1.5) var damping_ratio := 0.32
## Furthest a bone may bend from its rest angle, radians.
@export var max_bend := 1.2

var _bones: Array[Bone2D] = []
var _rest := PackedFloat32Array()      # each bone's rest rotation relative to its parent
var _angle := PackedFloat32Array()     # simulated angle of each bone in skeleton space
var _spin := PackedFloat32Array()      # its angular velocity
var _skeleton: Node2D
var _velocity := Vector2.ZERO
var _last_pos := Vector2.ZERO
var _time := 0.0


func _ready() -> void:
	if root_bone == null:
		push_warning("%s: no root_bone" % name)
		set_physics_process(false)
		return
	var b: Node = root_bone
	while b is Bone2D and _bones.size() < bone_count:
		_bones.append(b)
		_rest.append((b as Bone2D).rest.get_rotation())
		var next: Node = null
		for c in b.get_children():
			if c is Bone2D:
				next = c
				break
		b = next
	_skeleton = root_bone.get_parent()
	while _skeleton and not (_skeleton is Skeleton2D):
		_skeleton = _skeleton.get_parent()
	var parent_angle := _parent_angle()
	for i in _bones.size():
		parent_angle += _rest[i]
		_angle.append(parent_angle)
		_spin.append(0.0)
	if body:
		_last_pos = body.global_position
	_time = wind_phase  # start each chain at a different point of the wave


## The body's velocity in world px/s, smoothed.
func _body_velocity(delta: float) -> Vector2:
	var v := Vector2.ZERO
	if body is CharacterBody2D:
		v = (body as CharacterBody2D).velocity
	elif body:
		v = (body.global_position - _last_pos) / maxf(delta, 1e-4)
	if body:
		_last_pos = body.global_position
	_velocity = _velocity.lerp(v, 1.0 - exp(-velocity_smoothing * delta))
	return _velocity


## Angle in skeleton space of the node the chain hangs from.
func _parent_angle() -> float:
	var p := root_bone.get_parent() as Node2D
	if p == null or p == _skeleton:
		return 0.0
	return (_skeleton.global_transform.affine_inverse() * p.global_transform).get_rotation()


func _physics_process(delta: float) -> void:
	if _bones.is_empty() or _skeleton == null:
		return
	_time += delta
	var v := _body_velocity(delta)
	# The inverse velocity, turned into skeleton space. Only the direction is mapped (so the scale the rig is
	# drawn at doesn't change the feel), which also mirrors it when the character faces the other way.
	var drag := Vector2.ZERO
	if v.length_squared() > 1.0:
		var local_dir := _skeleton.global_transform.affine_inverse().basis_xform(-v).normalized()
		drag = local_dir * v.length() * velocity_influence
	var gust := 1.0 + gust_strength * sin(TAU * 0.13 * _time + wind_phase * 1.7)
	var n := _bones.size()
	var parent_angle := _parent_angle()
	for i in n:
		var t := float(i) / maxf(n - 1, 1)
		var rest_angle := parent_angle + _rest[i]
		# inertia: torque of the drag about the bone's joint (cross of bone direction and drag)
		var inertia := clampf(Vector2.from_angle(rest_angle).cross(drag), -max_drag_angle, max_drag_angle)
		var wind := wind_amplitude * lerpf(1.0, wind_tip_gain, t) * gust \
				* sin(TAU * wind_frequency * _time - i * wind_phase_step)
		var target := rest_angle + wind + inertia
		var k := lerpf(stiffness, tip_stiffness, t)
		var c := 2.0 * damping_ratio * sqrt(k)
		_spin[i] += (k * angle_difference(_angle[i], target) - c * _spin[i]) * delta
		_angle[i] += _spin[i] * delta
		var bend := angle_difference(rest_angle, _angle[i])
		if absf(bend) > max_bend:
			bend = clampf(bend, -max_bend, max_bend)
			_angle[i] = rest_angle + bend
			_spin[i] *= 0.5
		_bones[i].rotation = _rest[i] + bend
		parent_angle = _angle[i]
