extends Node2D
## Akari demo arena: a long crimson courtyard under the moon, a following camera, and Akari.
## Keys: A/D or arrows move, Shift run, Space jump, X dash, T autopilot, M mesh + bone overlay.
## Command line (after --): --auto starts on autopilot, --mesh starts with the overlay.

const FLOOR_Y := 0.0
const HALF_WIDTH := 4200.0

var akari: Akari
var cam: Camera2D
var overlay: Node2D
var hud: Label
var backdrop: Node2D
var _auto_t := 0.0

## The autopilot's routine: [seconds, direction, run, jump, dash]
const ROUTINE := [
	[1.6, 0.0, false, false, false],     # stand: wind only
	[2.6, -1.0, false, false, false],    # walk left: everything trails right
	[1.8, 0.0, false, false, false],     # stop: the cloth swings past and settles
	[2.2, 1.0, true, false, false],      # turn and run right
	[0.9, 1.0, true, true, false],       # leap while running
	[1.8, 0.0, false, false, false],     # land and settle
	[0.25, -1.0, false, false, true],    # dash left
	[2.2, 0.0, false, false, false],     # settle
]


func _ready() -> void:
	RenderingServer.set_default_clear_color(Color("2a0306"))
	var args := OS.get_cmdline_user_args()

	var sky := CanvasLayer.new()
	sky.layer = -10
	add_child(sky)
	backdrop = Node2D.new()
	backdrop.set_script(load("res://scripts/Backdrop.gd"))
	sky.add_child(backdrop)

	var floor_body := StaticBody2D.new()
	var shape := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = Vector2(HALF_WIDTH * 2.0, 400)
	shape.shape = rect
	shape.position = Vector2(0, FLOOR_Y + 200)
	floor_body.add_child(shape)
	add_child(floor_body)
	for side in [-1, 1]:
		var wall := CollisionShape2D.new()
		var wr := RectangleShape2D.new()
		wr.size = Vector2(100, 3000)
		wall.shape = wr
		wall.position = Vector2(side * (HALF_WIDTH - 600), -1400)
		floor_body.add_child(wall)

	akari = load("res://scenes/akari.tscn").instantiate()
	akari.position = Vector2(300, FLOOR_Y - 2)
	add_child(akari)
	akari.autopilot = "--auto" in args

	overlay = RigDebug.new()
	overlay.visible = "--mesh" in args
	akari.get_node("Visual/Rig").add_child(overlay)

	cam = Camera2D.new()
	cam.position_smoothing_enabled = true
	cam.position_smoothing_speed = 4.0
	cam.zoom = Vector2(0.95, 0.95)
	add_child(cam)
	cam.global_position = Vector2(akari.global_position.x, FLOOR_Y - 330.0)
	cam.reset_smoothing()

	var ui := CanvasLayer.new()
	add_child(ui)
	hud = Label.new()
	hud.position = Vector2(18, 12)
	hud.add_theme_font_size_override("font_size", 17)
	hud.add_theme_color_override("font_color", Color(1, 0.85, 0.9, 0.85))
	ui.add_child(hud)


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_T:
				akari.autopilot = not akari.autopilot
				akari.drive(0.0)
				_auto_t = 0.0
			KEY_M:
				overlay.visible = not overlay.visible


func _physics_process(delta: float) -> void:
	if akari.autopilot:
		_auto_t += delta
		var total := 0.0
		for step in ROUTINE:
			total += step[0]
		var t := fmod(_auto_t, total)
		for step in ROUTINE:
			if t < step[0]:
				akari.drive(step[1], step[2], step[3], step[4])
				break
			t -= step[0]
	# follow her across, not up: the floor stays put on screen when she jumps
	cam.global_position = Vector2(akari.global_position.x + akari.velocity.x * 0.25, FLOOR_Y - 330.0)
	backdrop.set("floor_y", get_viewport_rect().size.y * 0.5 + (FLOOR_Y - cam.get_screen_center_position().y) * cam.zoom.y)
	backdrop.set("scroll", cam.get_screen_center_position().x)
	hud.text = "AKARI  ·  A/D move   Shift run   Space jump   X dash   T autopilot %s   M mesh %s\nspeed %4d px/s" % [
			"on" if akari.autopilot else "off", "on" if overlay.visible else "off", int(absf(akari.velocity.x))]
