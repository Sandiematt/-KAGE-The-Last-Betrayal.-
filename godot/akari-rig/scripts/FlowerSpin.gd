class_name FlowerSpin
extends Sprite2D
## A sakura flower that turns on its own centre: slowly when Akari stands, faster the faster she moves,
## with a soft pulse so the blossoms look alive rather than mechanical.

## Turning speed at rest, degrees per second (negative turns the other way).
@export var spin_speed := 30.0
## Extra turn per px/s of the body's speed, as a fraction of spin_speed.
@export var motion_boost := 0.004
## How much the flower breathes in size (fraction).
@export var pulse := 0.035
## The body whose speed winds the flowers up.
@export var body: Node2D

var _base_scale := Vector2.ONE
var _t := 0.0
var _speed := 0.0
var _last := Vector2.ZERO


func _ready() -> void:
	_base_scale = scale
	_t = randf() * TAU
	if body:
		_last = body.global_position


func _process(delta: float) -> void:
	_t += delta
	var v := 0.0
	if body is CharacterBody2D:
		v = (body as CharacterBody2D).velocity.length()
	elif body:
		v = (body.global_position - _last).length() / maxf(delta, 1e-4)
		_last = body.global_position
	_speed = lerpf(_speed, v, 1.0 - exp(-6.0 * delta))
	rotation += deg_to_rad(spin_speed) * (1.0 + motion_boost * _speed) * delta
	scale = _base_scale * (1.0 + pulse * sin(_t * 2.1))
