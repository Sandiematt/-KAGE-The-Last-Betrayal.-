extends Node
## KAGE armor-glow baker. Renders each effect's looping frames through a canvas_item shader (offscreen SubViewport, 2x
## supersampled), tiles them into one sheet per effect and writes raw 2x PNGs. tools/armor-glow/pack.py downsamples them,
## writes src/img/armor_glow_<name>.webp and src/js/34b-armor-glow-sheets.js.
##
## Run (from the repo root; a window pops up briefly, headless can't render):
##   godot --path godot/armor-glow --resolution 256x256 --fixed-fps 30 -- [--out=ABSOLUTE_DIR] [--only=halo,wisp_pale]
## (default --out is <repo>/.scratch/armor-glow/raw)

const SS := 2  # supersample factor; pack.py box-filters back down

# name -> shader, cell size, frame count, sheet columns, static shader params
var EFFECTS := {
	"halo": {"shader": "halo", "cell": Vector2i(256, 256), "n": 24, "cols": 8, "params": {}},
	"flame_violet": {"shader": "flame", "cell": Vector2i(128, 192), "n": 16, "cols": 8, "params": {
		"seed": 1.0,
		"c_outer": Vector3(0.545, 0.17, 0.95), "c_mid": Vector3(0.827, 0.361, 1.0),
		"c_core": Vector3(1.0, 0.88, 1.0), "c_bloom": Vector3(0.36, 0.10, 0.62)}},
	"flame_crimson": {"shader": "flame", "cell": Vector2i(128, 192), "n": 16, "cols": 8, "params": {
		"seed": 7.3,
		"c_outer": Vector3(0.80, 0.07, 0.09), "c_mid": Vector3(1.0, 0.165, 0.165),
		"c_core": Vector3(1.0, 0.70, 0.55), "c_bloom": Vector3(0.50, 0.03, 0.04)}},
	"lightning_gold": {"shader": "lightning", "cell": Vector2i(192, 192), "n": 12, "cols": 6, "params": {}},
	"wisp_pale": {"shader": "wisp", "cell": Vector2i(128, 192), "n": 16, "cols": 8, "params": {}},
}

var out_dir := ""
var only: PackedStringArray = []

func _ready() -> void:
	get_window().content_scale_mode = Window.CONTENT_SCALE_MODE_DISABLED
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--out="): out_dir = arg.trim_prefix("--out=")
		elif arg.begins_with("--only="): only = arg.trim_prefix("--only=").split(",")
	if out_dir == "":
		out_dir = ProjectSettings.globalize_path("res://").path_join("../../.scratch/armor-glow/raw").simplify_path()
	DirAccess.make_dir_recursive_absolute(out_dir)
	await get_tree().process_frame
	for name in EFFECTS:
		if only.size() > 0 and not only.has(name): continue
		await _bake(name, EFFECTS[name])
	print("armor-glow bake done -> ", out_dir)
	get_tree().quit()

func _bake(name: String, cfg: Dictionary) -> void:
	var cell: Vector2i = cfg["cell"]
	var n: int = cfg["n"]
	var cols: int = cfg["cols"]
	var rows := int(ceil(float(n) / cols))
	var vp := SubViewport.new()
	vp.size = cell * SS
	vp.transparent_bg = false
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	vp.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	add_child(vp)
	var rect := ColorRect.new()
	rect.color = Color.BLACK
	rect.size = Vector2(cell * SS)
	var mat := ShaderMaterial.new()
	mat.shader = load("res://shaders/%s.gdshader" % cfg["shader"])
	mat.set_shader_parameter("cell", Vector2(cell))
	for k in cfg["params"]: mat.set_shader_parameter(k, cfg["params"][k])
	rect.material = mat
	vp.add_child(rect)
	var sheet := Image.create(cols * cell.x * SS, rows * cell.y * SS, false, Image.FORMAT_RGBA8)
	sheet.fill(Color.BLACK)
	for f in n:
		mat.set_shader_parameter("phase", float(f) / n)
		mat.set_shader_parameter("frame", f)
		if cfg["shader"] == "lightning": _lightning_frame(mat, f, cell)
		await RenderingServer.frame_post_draw
		await RenderingServer.frame_post_draw
		var img := vp.get_texture().get_image()
		img.convert(Image.FORMAT_RGBA8)
		sheet.blit_rect(img, Rect2i(Vector2i.ZERO, img.get_size()), Vector2i((f % cols) * cell.x * SS, (f / cols) * cell.y * SS))
	sheet.save_png(out_dir.path_join("%s.png" % name))
	print("baked ", name, " ", sheet.get_size())
	vp.queue_free()

# --- lightning: jagged branching bolts generated here, drawn as capsule segments by the shader ---------------------------

const MAX_SEG := 160

func _lightning_frame(mat: ShaderMaterial, f: int, cell: Vector2i) -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 90210 + f * 7919
	# per-frame intensity: a flickering envelope, some frames almost empty
	var gains := [1.0, 0.25, 0.8, 0.0, 0.95, 0.4, 1.0, 0.12, 0.7, 0.9, 0.0, 0.55]
	var gain: float = gains[f % gains.size()]
	var segs := PackedVector4Array()
	var wts := PackedFloat32Array()
	var c := Vector2(cell) * 0.5
	if gain > 0.0:
		var main_ang := rng.randf() * TAU
		var bolts := 1 if gain < 0.5 else 2
		for b in bolts:
			var ang := main_ang + (b * rng.randf_range(0.9, 1.7) * (1.0 if rng.randf() < 0.5 else -1.0))
			var length := rng.randf_range(70.0, 140.0) * (0.55 if gain < 0.3 else 1.0)
			if b > 0: length *= 0.65
			var center := c + Vector2(rng.randf_range(-10, 10), rng.randf_range(-10, 10))
			var dir := Vector2(cos(ang), sin(ang))
			var a := center - dir * length * 0.5
			var z := center + dir * length * 0.5
			_bolt(rng, segs, wts, a, z, 1.0, 0, c)
	var count := segs.size()
	for i in range(count, MAX_SEG):
		segs.append(Vector4.ZERO)
		wts.append(0.0)
	mat.set_shader_parameter("seg", segs)
	mat.set_shader_parameter("segw", wts)
	mat.set_shader_parameter("nseg", mini(count, MAX_SEG))
	mat.set_shader_parameter("gain", gain)

func _bolt(rng: RandomNumberGenerator, segs: PackedVector4Array, wts: PackedFloat32Array, a: Vector2, z: Vector2, w: float, depth: int, c: Vector2) -> void:
	var d := z - a
	var len := d.length()
	var dir := d / len
	var perp := Vector2(-dir.y, dir.x)
	var amp := 6.5 if depth == 0 else 4.0
	var pts: Array[Vector2] = [a]
	var s_ := 1.0 if rng.randf() < 0.5 else -1.0
	var t := 0.0
	var drift := 0.0   # slow wander so the bolt isn't a straight line with noise on it
	while true:
		t += rng.randf_range(7.0, 17.0) / len
		if t >= 0.94: break
		drift = clampf(drift + rng.randf_range(-3.0, 3.0), -8.0, 8.0)
		var off := rng.randf_range(0.2, 1.0) * s_ * amp + drift
		s_ = -s_ if rng.randf() < 0.65 else s_
		pts.append(a + dir * len * t + perp * off)
	pts.append(z)
	for i in range(pts.size() - 1):
		if segs.size() >= MAX_SEG: return
		var p0 := pts[i]; var p1 := pts[i + 1]
		segs.append(Vector4(p0.x, p0.y, p1.x, p1.y))
		wts.append(w * (1.0 - 0.35 * float(i) / pts.size()))
	if depth >= 1: return
	# branches fork forward off the main bolt
	var nb := rng.randi_range(1, 3)
	for k in nb:
		var i := rng.randi_range(2, pts.size() - 3)
		var base := pts[i]
		var side := 1.0 if rng.randf() < 0.5 else -1.0
		var bang := dir.angle() + side * rng.randf_range(0.4, 0.8)
		var blen := rng.randf_range(18.0, 42.0)
		var tip := base + Vector2(cos(bang), sin(bang)) * blen
		if absf(tip.x - c.x) > 80.0 or absf(tip.y - c.y) > 80.0: continue
		_bolt(rng, segs, wts, base, tip, w * 0.62, depth + 1, c)
