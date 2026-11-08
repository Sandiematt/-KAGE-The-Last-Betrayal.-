# Preview stage for the built character (res://generated/kage.scn): a camera, a warm key light, a red back light, a
# dark environment, the floor. Keys: 1 idle, 2 walk, 3 / Space slash, T turntable, left-drag to orbit, wheel to zoom.
# Screenshot mode (used to check the build): godot --path . -- --shot=out.png --anim=idle --t=1.2 --yaw=0
extends Node3D

var kage: Node3D
var player: AnimationPlayer
var cam: Camera3D
var orbit := Vector2(0.0, 0.08)
var dist := 4.2
var turntable := false
var args := {}

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=")
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("140e0d")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("6d5856")
	env.ambient_light_energy = 0.55
	env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var key := DirectionalLight3D.new()
	key.rotation_degrees = Vector3(-38, 28, 0)
	key.light_energy = 1.25
	key.light_color = Color("fff0e0")
	add_child(key)
	var moon := DirectionalLight3D.new()
	moon.rotation_degrees = Vector3(-20, 190, 0)
	moon.light_energy = 1.1
	moon.light_color = Color("ff3a30")
	add_child(moon)
	var floor_mesh := MeshInstance3D.new()
	var plane := PlaneMesh.new()
	plane.size = Vector2(30, 30)
	floor_mesh.mesh = plane
	var fm := StandardMaterial3D.new()
	fm.albedo_color = Color("1a1312")
	floor_mesh.material_override = fm
	add_child(floor_mesh)
	kage = load("res://generated/kage.scn").instantiate()
	add_child(kage)
	kage.rotation.y = deg_to_rad(float(args.get("yaw", "0")))
	player = kage.get_node("AnimationPlayer")
	cam = Camera3D.new()
	cam.fov = 32
	add_child(cam)
	cam.make_current()
	_place_camera()
	play(args.get("anim", "idle"))
	if args.has("shot"):
		player.seek(float(args.get("t", "1.0")), true)
		player.pause()
		await get_tree().process_frame
		await get_tree().process_frame
		await RenderingServer.frame_post_draw
		get_viewport().get_texture().get_image().save_png(args.shot)
		get_tree().quit()

func play(name: String) -> void:
	player.play(name)
	if name == "slash":
		player.animation_finished.connect(func(_n): player.play("idle"), CONNECT_ONE_SHOT)

func _place_camera() -> void:
	var target := Vector3(0, 1.0, 0)
	cam.position = target + Vector3(sin(orbit.x) * cos(orbit.y), sin(orbit.y), cos(orbit.x) * cos(orbit.y)) * dist
	cam.look_at(target)

func _process(delta: float) -> void:
	if turntable:
		kage.rotate_y(delta * 0.6)

func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventKey and e.pressed:
		match e.keycode:
			KEY_1: play("idle")
			KEY_2: play("walk")
			KEY_3, KEY_SPACE: play("slash")
			KEY_T: turntable = not turntable
	if e is InputEventMouseMotion and (e.button_mask & MOUSE_BUTTON_MASK_LEFT):
		orbit += Vector2(-e.relative.x, e.relative.y) * 0.008
		orbit.y = clampf(orbit.y, -0.4, 1.0)
		_place_camera()
	if e is InputEventMouseButton and e.pressed:
		if e.button_index == MOUSE_BUTTON_WHEEL_UP:
			dist = maxf(1.2, dist * 0.9)
		elif e.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			dist = minf(9.0, dist * 1.1)
		_place_camera()
