extends Node
## KAGE Mugen Armor: the user's card art (source/mugen.svg) cut into the armour's parts for the game.
## Loads the SVG, keys the card's backdrop out (shaders/key.gdshader), and renders to .scratch/mugen-armor/raw:
##   figure.png / figure_a.png      the whole figure's colour (opaque, edges unmixed) and alpha
##   mask_<part>.png                each part's cut outline from parts.json, white on black
##   lock.png / lock_a.png          the long lower lock unwrapped along its centre line into a straight strip
## and the design board .scratch/mugen-armor/board.png: the keyed figure with every part's outline, its anchors and name.
## tools/mugen-armor/pack.py turns the raw renders into src/img/mugen_*.webp and src/js/34d-mugen-parts.js.
## Run (from the repo root; a window opens for a few seconds, headless can't render):
##   godot --path godot/mugen-armor --resolution 320x240

const ART := Vector2i(1024, 1536)
var out_dir := ""
var spec: Dictionary
var art_tex: ImageTexture
var key_shader: Shader

func _ready() -> void:
	get_window().content_scale_mode = Window.CONTENT_SCALE_MODE_DISABLED
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--out="): out_dir = arg.trim_prefix("--out=")
	if out_dir == "":
		out_dir = ProjectSettings.globalize_path("res://").path_join("../../.scratch/mugen-armor").simplify_path()
	DirAccess.make_dir_recursive_absolute(out_dir.path_join("raw"))
	spec = JSON.parse_string(FileAccess.get_file_as_string("res://parts.json"))
	var img := Image.new()
	var err := img.load_svg_from_buffer(FileAccess.get_file_as_bytes("res://source/mugen.svg"), 1.0)
	if err != OK: push_error("svg load failed %d" % err); get_tree().quit(1); return
	print("svg ", img.get_size())
	art_tex = ImageTexture.create_from_image(img)
	key_shader = load("res://shaders/key.gdshader")
	await get_tree().process_frame
	await _render_key("figure", ART, {}, false)
	for name in spec["parts"]:
		await _render_mask(name, _poly(spec["parts"][name]))
	var lk: Dictionary = spec["lock"]
	await _render_key("lock", Vector2i(lk["strip"][0], lk["strip"][1]), _lock_params(lk), true)
	await _render_board()
	print("mugen-armor cut done -> ", out_dir)
	get_tree().quit()

# a part's outline: its polygon, or its ring (an arc band) as a polygon
func _poly(p: Dictionary) -> PackedVector2Array:
	var o := PackedVector2Array()
	if p.has("poly"):
		for q in p["poly"]: o.append(Vector2(q[0], q[1]))
		return o
	var r: Dictionary = p["ring"]
	var c := Vector2(r["c"][0], r["c"][1])
	var a0: float = r["a0"]; var a1: float = r["a1"]
	var n := 72
	for i in n + 1: var a := deg_to_rad(lerpf(a0, a1, float(i) / n)); o.append(c + Vector2(cos(a), sin(a)) * float(r["r1"]))
	for i in n + 1: var a := deg_to_rad(lerpf(a1, a0, float(i) / n)); o.append(c + Vector2(cos(a), sin(a)) * float(r["r0"]))
	return o

func _lock_params(lk: Dictionary) -> Dictionary:
	var pts := PackedVector2Array(); var cum := PackedFloat32Array()
	var total := 0.0
	for i in lk["line"].size():
		var p := Vector2(lk["line"][i][0], lk["line"][i][1])
		if i > 0: total += p.distance_to(pts[i - 1])
		pts.append(p); cum.append(total)
	return {"pts": pts, "cum": cum, "width": float(lk["width"])}

func _viewport(size: Vector2i) -> SubViewport:
	var vp := SubViewport.new()
	vp.size = size
	vp.transparent_bg = false
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child(vp)
	var bgr := ColorRect.new(); bgr.color = Color.BLACK; bgr.size = Vector2(size)
	vp.add_child(bgr)
	return vp

func _grab(vp: SubViewport) -> Image:
	await RenderingServer.frame_post_draw
	await RenderingServer.frame_post_draw
	var im := vp.get_texture().get_image(); im.convert(Image.FORMAT_RGBA8)
	return im

# the keyed art (or the unwrapped lock): its colour pass and its alpha pass
func _render_key(name: String, size: Vector2i, params: Dictionary, lock: bool) -> void:
	var vp := _viewport(size)
	var rect := ColorRect.new(); rect.size = Vector2(size)
	var mat := ShaderMaterial.new(); mat.shader = key_shader
	mat.set_shader_parameter("art", art_tex)
	mat.set_shader_parameter("art_size", Vector2(ART))
	mat.set_shader_parameter("lock", lock)
	for k in params: mat.set_shader_parameter(k, params[k])
	rect.material = mat; vp.add_child(rect)
	for mode in [0, 1]:
		mat.set_shader_parameter("mode", mode)
		var im := await _grab(vp)
		im.save_png(out_dir.path_join("raw").path_join("%s%s.png" % [name, "_a" if mode == 1 else ""]))
	print("keyed ", name, " ", size)
	vp.queue_free()

func _render_mask(name: String, poly: PackedVector2Array) -> void:
	var vp := _viewport(ART)
	var pg := Polygon2D.new(); pg.polygon = poly; pg.color = Color.WHITE; pg.antialiased = true
	vp.add_child(pg)
	var im := await _grab(vp)
	im.convert(Image.FORMAT_L8)
	im.save_png(out_dir.path_join("raw").path_join("mask_%s.png" % name))
	vp.queue_free()

# the design board: the keyed figure on a plain ground, each part outlined in its own colour with its anchors and name
func _render_board() -> void:
	var vp := _viewport(ART)
	(vp.get_child(0) as ColorRect).color = Color("#3b2d34")
	var rect := ColorRect.new(); rect.size = Vector2(ART)
	var mat := ShaderMaterial.new(); mat.shader = key_shader
	mat.set_shader_parameter("art", art_tex); mat.set_shader_parameter("art_size", Vector2(ART)); mat.set_shader_parameter("mode", 2)
	rect.material = mat; vp.add_child(rect)
	var cols := [Color("#00ff88"), Color("#ffd400"), Color("#00c8ff"), Color("#ff5050"), Color("#ffffff"), Color("#78ffff"),
		Color("#ff8c00"), Color("#a0ff00"), Color("#ff00c8"), Color("#00ffff"), Color("#c8c8ff"), Color("#ffff00"), Color("#ff9ad5")]
	var i := 0
	for name in spec["parts"]:
		var p: Dictionary = spec["parts"][name]
		var col: Color = cols[i % cols.size()]; i += 1
		var ln := Line2D.new(); ln.width = 2.5; ln.default_color = col; ln.closed = true; ln.points = _poly(p)
		vp.add_child(ln)
		for k in p["anchors"]:
			var a := Vector2(p["anchors"][k][0], p["anchors"][k][1])
			var dot := Polygon2D.new(); dot.color = col
			var circ := PackedVector2Array()
			for j in 12: circ.append(a + Vector2(cos(TAU * j / 12.0), sin(TAU * j / 12.0)) * 6.0)
			dot.polygon = circ; vp.add_child(dot)
		var lb := Label.new(); lb.text = name; lb.add_theme_color_override("font_color", col); lb.add_theme_font_size_override("font_size", 22)
		var first: Vector2 = _poly(p)[0]
		lb.position = first + Vector2(4, -30); vp.add_child(lb)
	var lk := Line2D.new(); lk.width = 2.0; lk.default_color = Color("#ffff00")
	for q in spec["lock"]["line"]: lk.add_point(Vector2(q[0], q[1]))
	vp.add_child(lk)
	var im := await _grab(vp)
	im.resize(683, 1024, Image.INTERPOLATE_LANCZOS)
	im.save_png(out_dir.path_join("board.png"))
	vp.queue_free()
