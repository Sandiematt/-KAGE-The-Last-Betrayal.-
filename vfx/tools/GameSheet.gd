extends Node3D
## KAGE game export: renders one built Effekseer effect, alone, on pure black, through a side-on orthographic camera
## that matches the game's view (a slight downward pitch so ground decals read as the game's floor band), with the
## Lab's HDR glow and Filmic settings, and saves the frames the game needs as PNGs. vfx/tools/pack_sheets.py turns
## them into the sprite sheets the Canvas 2D game plays additively (black adds nothing).
##
## Run (from the game project; the files are copied into vfx/godot first):
##   godot --path vfx/godot res://GameSheet.tscn --fixed-fps 60 --resolution WxH -- \
##     --id=VFX_X --out=DIR --frames=0:30:1,32:78:2 --size=9.5 --cy=3.5 --pitch=10 [--cx=0.4] [--track=0.07]
## --launch=D flies a projectile effect (Vfx.launch, its manifest flight time) from the origin to D metres along +X;
## pair it with --track=D/flight_frames and --stop=flight_frames so the head stays put and its trail slides back.
## --cx shifts the view right (metres); --track moves the camera +X that many metres per effect frame (less --decel
## per frame squared, until --stop), so a travelling front stays put in the frame while what it leaves behind slides
## back (the game moves the sprite).
## --bg=V renders on a flat grey V (0..1) instead of black, and --flat switches the HDR glow off with a linear tonemap:
## export_game.py renders alpha-blended effects (the toon smoke) twice, on black and on white, and recovers their real
## alpha from the difference (a two-background matte), so the game draws them normally instead of adding them.
## Writes DIR/fNNN.png per sampled frame and DIR/capture.json (pixels per metre, where the effect origin lands).

var id := ""
var out_dir := ""
var samples: Array[int] = []
var ortho_size := 8.0
var center_y := 2.0
var center_x := 0.0
var track := 0.0
var decel := 0.0
var stop_frame := 100000
var launch_dist := 0.0
var origin0 := Vector2.ZERO
var cam0 := Vector3.ZERO
var pitch_deg := 10.0
var bg := 0.0
var flat := false
var frame := -1
var last_sample := 0
var camera: Camera3D

func _ready() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--id="): id = arg.trim_prefix("--id=")
		elif arg.begins_with("--out="): out_dir = arg.trim_prefix("--out=")
		elif arg.begins_with("--size="): ortho_size = float(arg.trim_prefix("--size="))
		elif arg.begins_with("--cy="): center_y = float(arg.trim_prefix("--cy="))
		elif arg.begins_with("--cx="): center_x = float(arg.trim_prefix("--cx="))
		elif arg.begins_with("--track="): track = float(arg.trim_prefix("--track="))
		elif arg.begins_with("--decel="): decel = float(arg.trim_prefix("--decel="))
		elif arg.begins_with("--stop="): stop_frame = int(arg.trim_prefix("--stop="))
		elif arg.begins_with("--pitch="): pitch_deg = float(arg.trim_prefix("--pitch="))
		elif arg.begins_with("--launch="): launch_dist = float(arg.trim_prefix("--launch="))
		elif arg.begins_with("--bg="): bg = float(arg.trim_prefix("--bg="))
		elif arg == "--flat": flat = true
		elif arg.begins_with("--frames="):
			for span in arg.trim_prefix("--frames=").split(","):
				var p := span.split(":")
				var a := int(p[0]); var b := int(p[1]); var s := int(p[2]) if p.size() > 2 else 1
				var f := a
				while f <= b:
					samples.append(f); f += s
	DirAccess.make_dir_recursive_absolute(out_dir)
	last_sample = samples.max()
	get_window().content_scale_mode = Window.CONTENT_SCALE_MODE_DISABLED
	var world := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(bg, bg, bg)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0, 0, 0)
	# The Lab's measured HDR bloom and tonemapping (vfx/godot/scripts/VfxLab.gd), so the effect looks as reviewed.
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.tonemap_white = 4.0
	env.glow_enabled = true
	env.glow_intensity = 1.5
	env.glow_strength = 1.1
	env.glow_bloom = 0.0
	env.glow_hdr_threshold = 2.8
	env.glow_hdr_scale = 3.2
	env.glow_hdr_luminance_cap = 24.0
	for level in range(7): env.set_glow_level(level, 0.0)
	env.set_glow_level(1, 1.0)
	env.set_glow_level(2, 1.0)
	env.set_glow_level(3, 0.85)
	env.set_glow_level(4, 0.6)
	env.set_glow_level(5, 0.35)
	env.glow_blend_mode = Environment.GLOW_BLEND_MODE_ADDITIVE
	if flat:
		env.glow_enabled = false
		env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
		env.tonemap_white = 1.0
	world.environment = env
	add_child(world)
	camera = Camera3D.new()
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = ortho_size
	camera.near = 0.05
	camera.far = 200.0
	add_child(camera)
	var p := deg_to_rad(pitch_deg)
	var target := Vector3(center_x, center_y, 0)
	camera.look_at_from_position(target + Vector3(0, sin(p), cos(p)) * 40.0, target)
	camera.current = true
	cam0 = camera.position

func _process(_delta: float) -> void:
	frame += 1
	# frame -1 -> 0: start the effect at the origin; effect frame n is the n-th rendered frame after the start
	if frame == 0:
		origin0 = camera.unproject_position(Vector3.ZERO)
		if launch_dist > 0.0: Vfx.launch(id, Vector3.ZERO, Vector3(launch_dist, 0, 0))
		else: Vfx.play(id, Vector3.ZERO)
		return
	var n := frame - 1
	var m := float(mini(n, stop_frame))
	camera.position = cam0 + Vector3(track * m - decel * m * m / 2.0, 0, 0)
	if samples.has(n): _save(n)
	if n >= last_sample + 2:
		var vp := get_viewport().get_visible_rect().size
		var origin := origin0
		var info := {"id": id, "width": vp.x, "height": vp.y, "ppm": vp.y / ortho_size, "origin": [origin.x, origin.y],
			"pitch": pitch_deg, "size": ortho_size, "center_y": center_y, "center_x": center_x, "track": track, "samples": samples}
		var f := FileAccess.open(out_dir.path_join("capture.json"), FileAccess.WRITE)
		f.store_string(JSON.stringify(info))
		f.close()
		get_tree().quit()

func _save(n: int) -> void:
	await RenderingServer.frame_post_draw
	var image := get_viewport().get_texture().get_image()
	image.save_png(out_dir.path_join("f%03d.png" % n))
