class_name Akari
extends CharacterBody2D
## Akari, the Memory Blade: the user's art cut into a skinned Polygon2D rig (scenes/akari.tscn, built by
## build/build_akari.gd). This script moves her and poses the body bones procedurally: a stride on the two
## leg chains, a body bob and forward lean while moving, breathing when idle, a tuck in the air. Everything
## that hangs (hair, scarf, coat, skirt panels, blade ribbons) is left to the SecondaryMotionChain nodes, which
## read this body's velocity; the blade's flowers are FlowerSpin sprites.
##
## The art faces left. Visual is mirrored to face right, so in the rig's own space "forward" is always -x.

signal landed

@export_group("Movement")
@export var walk_speed := 300.0
@export var run_speed := 620.0
@export var acceleration := 2200.0
@export var friction := 2600.0
@export var jump_velocity := -820.0
@export var dash_speed := 1350.0
@export var dash_time := 0.17
@export var gravity := 2300.0

@export_group("Pose")
## Screen px per stride cycle at walking pace.
@export var stride_length := 330.0
@export var thigh_swing := 0.34
@export var knee_bend := 0.5
@export var bob_height := 9.0
@export var lean := 0.10
@export var breath := 0.012

## When set, input comes from drive() calls (the demo autopilot) instead of the keyboard.
var autopilot := false
var facing := -1.0          # -1 = left (as drawn), 1 = right

var _move := 0.0            # -1..1 requested by input or autopilot
var _running := false
var _jump_queued := false
var _dash_queued := false
var _dash_left := 0.0
var _phase := 0.0
var _walk := 0.0            # 0 idle .. 1 striding
var _air := 0.0
var _t := 0.0
var _land_squash := 0.0
var _was_on_floor := true
var _base_scale := Vector2.ONE
var _rest := {}             # bone name -> rest Transform2D

@onready var visual: Node2D = $Visual
@onready var skeleton: Skeleton2D = $Visual/Rig/Skeleton2D
@onready var hips: Bone2D = skeleton.get_node("hips")
@onready var torso: Bone2D = hips.get_node("torso")
@onready var head: Bone2D = torso.get_node("head")
@onready var leg_f_up: Bone2D = hips.get_node("leg_f_up")
@onready var leg_f_low: Bone2D = leg_f_up.get_node("leg_f_low")
@onready var leg_b_up: Bone2D = hips.get_node("leg_b_up")
@onready var leg_b_low: Bone2D = leg_b_up.get_node("leg_b_low")


func _ready() -> void:
	_base_scale = visual.scale
	for b: Bone2D in [hips, torso, head, leg_f_up, leg_f_low, leg_b_up, leg_b_low]:
		_rest[b.name] = b.rest
	ensure_input_actions()


## Default keys, added only where the project hasn't defined the action itself.
static func ensure_input_actions() -> void:
	var keys := {
		"move_left": [KEY_A, KEY_LEFT], "move_right": [KEY_D, KEY_RIGHT], "run": [KEY_SHIFT],
		"jump": [KEY_SPACE, KEY_W, KEY_UP], "dash": [KEY_X, KEY_K],
	}
	for action in keys:
		if InputMap.has_action(action):
			continue
		InputMap.add_action(action)
		for k in keys[action]:
			var ev := InputEventKey.new()
			ev.physical_keycode = k
			InputMap.action_add_event(action, ev)


## Autopilot input: direction -1..1, run, and one-shot jump / dash.
func drive(direction: float, run := false, jump := false, dash := false) -> void:
	_move = clampf(direction, -1.0, 1.0)
	_running = run
	_jump_queued = _jump_queued or jump
	_dash_queued = _dash_queued or dash


func _read_input() -> void:
	if autopilot:
		return
	_move = Input.get_axis("move_left", "move_right")
	_running = Input.is_action_pressed("run")
	if Input.is_action_just_pressed("jump"):
		_jump_queued = true
	if Input.is_action_just_pressed("dash"):
		_dash_queued = true


func _physics_process(delta: float) -> void:
	_t += delta
	_read_input()
	var on_floor := is_on_floor()
	if not on_floor:
		velocity.y += gravity * delta
	if _jump_queued and on_floor:
		velocity.y = jump_velocity
	_jump_queued = false
	if _dash_queued and _dash_left <= 0.0:
		_dash_left = dash_time
		var dir := signf(_move) if absf(_move) > 0.1 else facing
		velocity.x = dir * dash_speed
	_dash_queued = false
	if _dash_left > 0.0:
		_dash_left -= delta
		velocity.y = minf(velocity.y, 0.0) if not on_floor else velocity.y
	else:
		var top := run_speed if _running else walk_speed
		var target := _move * top
		var rate := acceleration if absf(target) > absf(velocity.x) or signf(target) != signf(velocity.x) else friction
		velocity.x = move_toward(velocity.x, target, rate * delta)
	move_and_slide()

	if absf(velocity.x) > 25.0 and absf(_move) > 0.1:
		facing = signf(velocity.x)
	var now_on_floor := is_on_floor()
	if now_on_floor and not _was_on_floor:
		_land_squash = 1.0
		landed.emit()
	_was_on_floor = now_on_floor
	_pose(delta, now_on_floor)


func _pose(delta: float, on_floor: bool) -> void:
	var speed := absf(velocity.x)
	var sp01 := clampf(speed / run_speed, 0.0, 1.0)
	_walk = lerpf(_walk, 1.0 if on_floor and speed > 30.0 else 0.0, 1.0 - exp(-8.0 * delta))
	_air = lerpf(_air, 0.0 if on_floor else 1.0, 1.0 - exp(-10.0 * delta))
	_phase += speed * delta / stride_length * TAU * (0.85 if speed > walk_speed * 1.2 else 1.0)
	_land_squash = move_toward(_land_squash, 0.0, delta * 5.0)

	# facing and landing squash; the rig's art faces left, so face right by mirroring
	var squash := 1.0 - 0.06 * sin(_land_squash * PI)
	var stretch := 1.0 + clampf(-velocity.y / 9000.0, -0.04, 0.05) * _air
	visual.scale = Vector2(_base_scale.x * -facing * (2.0 - squash), _base_scale.y * squash * stretch)

	var stride := _walk * lerpf(0.8, 1.05, sp01)
	var s := sin(_phase)
	var breathe := sin(_t * 1.7)
	# legs: a positive thigh angle swings the foot forward (towards -x); a knee bend folds the shin back
	_set_rot(leg_f_up, s * thigh_swing * stride - 0.25 * _air)
	_set_rot(leg_b_up, -s * thigh_swing * stride + 0.15 * _air)
	_set_rot(leg_f_low, -maxf(0.0, sin(_phase + 1.3)) * knee_bend * stride - 0.35 * _air)
	_set_rot(leg_b_low, -maxf(0.0, sin(_phase + PI + 1.3)) * knee_bend * stride - 0.45 * _air)
	# body: bob twice a stride, lean into the run, breathe when still
	var bob := -absf(cos(_phase)) * bob_height * stride + breathe * 1.6 * (1.0 - _walk)
	hips.position = _rest["hips"].origin + Vector2(0.0, bob + 6.0 * _land_squash)
	hips.rotation = _rest["hips"].get_rotation() - lean * 0.35 * sp01
	_set_rot(torso, -lean * sp01 + breath * breathe + 0.04 * _air * signf(velocity.y))
	_set_rot(head, 0.5 * lean * sp01 + 0.018 * sin(_t * 0.9) - 0.6 * breath * breathe)


func _set_rot(b: Bone2D, offset: float) -> void:
	b.rotation = _rest[b.name].get_rotation() + offset
