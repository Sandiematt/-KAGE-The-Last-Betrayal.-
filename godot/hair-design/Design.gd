extends Node
## KAGE hair design: Yūrei's long silver-white hair tied in a bun, and Mugen's long flowing spectral hair, on Kage's
## head and shoulders, designed here first and then carried into the game.
##   --mode=design  renders each style in motion (four moments of its hair blowing back) to
##                  .scratch/hair-design/<style>_design.png, and one large frame to <style>_hero.png
##   --mode=bake    renders the lock textures the game maps onto every strand (the same shaders as the design):
##                  silver (colour and alpha passes, 8 frames) and spectral (on black, 16 frames), 2x, to
##                  .scratch/hair-design/raw; tools/hair-design/pack.py makes src/img/hair_*.webp + 34c-hair-sheets.js
## The head, hair outline, cloth chain, strand fan and strand widths copy the game's (21-characters/kage/shadow/head.js,
## armory/hair.js, shadow/_design.js KsChain, shadow/scarf.js _ksRibbon), in head units scaled to a large head.
## Run (from the repo root; a window opens for a few seconds, headless can't render):
##   godot --path godot/hair-design --resolution 320x240 -- --mode=design [--only=yurei]

const SS := 2                         # supersampled, then shrunk
const R := 58.0                       # head radius in design px (the game's is 17.4 at fighter scale 1)
const K := R / 17.4                   # design px per game px
const W := 620
const H := 470
const HEAD := Vector2(392, 176)

# head units: +x the face side, -y up (the game's head frame, facing right)
const STYLES := {
	"yurei": {
		"pts": [[1.1, 0.06, 1], [0.95, -0.2], [1.14, -0.45, 1], [0.92, -0.64], [0.96, -0.92], [0.45, -1.16], [-0.2, -1.2], [-0.8, -1.0],
			[-1.1, -0.55], [-1.16, -0.05], [-1.06, 0.4], [-0.82, 0.76, 1], [-0.46, 0.62], [-0.1, 0.2], [0.34, -0.3], [0.74, -0.14]],
		"rim": 13, "shader": "silver", "rimc": Color("#ffffff"), "tanc": Color("#7a84aa"), "body_rim": Color("#e4dcff"), "body_tan": Color("#9fb0dc"),
		"scarf": [Color("#d4daf0"), Color("#8e98bc")], "bg": Color("#22101a"),
		"locks": {"n": 7, "w0": 3.4, "w1": 9.0, "spread": 5.0, "root": Vector2(-0.95, -0.15)}, "bun": true
	},
	"mugen": {
		"pts": [[1.15, 0.12, 1], [0.95, -0.15], [1.22, -0.42, 1], [0.95, -0.64], [1.05, -0.96, 1], [0.58, -1.04], [0.6, -1.62, 1], [0.3, -1.14],
			[0.02, -1.98, 1], [-0.16, -1.16], [-0.62, -1.78, 1], [-0.62, -1.08], [-1.5, -1.3, 1], [-1.0, -0.72], [-1.62, -0.42, 1], [-1.15, -0.1],
			[-1.1, 0.4], [-0.78, 0.8, 1], [-0.46, 0.62], [-0.1, 0.2], [0.34, -0.3], [0.74, -0.14]],
		"rim": 19, "shader": "spectral", "rimc": Color("#d474ff"), "tanc": Color("#64447e"), "body_rim": Color("#d474ff"), "body_tan": Color("#a070c4"),
		"scarf": [Color("#7428b4"), Color("#43166c")], "bg": Color("#1c0d1c"),
		"locks": {"n": 7, "w0": 3.4, "w1": 9.6, "spread": 5.6, "root": Vector2(-1.0, -0.2)}, "bun": false
	}
}

var out_dir := ""
var mode := "design"
var only := PackedStringArray()
var white_tex: ImageTexture

func _ready() -> void:
	get_window().content_scale_mode = Window.CONTENT_SCALE_MODE_DISABLED
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--mode="): mode = arg.trim_prefix("--mode=")
		elif arg.begins_with("--out="): out_dir = arg.trim_prefix("--out=")
		elif arg.begins_with("--only="): only = arg.trim_prefix("--only=").split(",")
	if out_dir == "":
		out_dir = ProjectSettings.globalize_path("res://").path_join("../../.scratch/hair-design").simplify_path()
	DirAccess.make_dir_recursive_absolute(out_dir.path_join("raw"))
	var im := Image.create(1, 1, false, Image.FORMAT_RGBA8); im.fill(Color.WHITE)
	white_tex = ImageTexture.create_from_image(im)
	await get_tree().process_frame
	if mode == "bake": await _bake_all()
	else:
		for name in STYLES:
			if only.size() > 0 and not only.has(name): continue
			await _design(name, STYLES[name])
	print("hair-design ", mode, " done -> ", out_dir)
	get_tree().quit()

# ---------------------------------------------------------------- geometry (head units -> design px)

func hp(x: float, y: float) -> Vector2: return HEAD + Vector2(x, y) * R

func _quad(a: Vector2, c: Vector2, b: Vector2, out: PackedVector2Array, n := 8) -> void:
	for i in range(1, n + 1):
		var t := float(i) / n
		out.append(a.lerp(c, t).lerp(c.lerp(b, t), t))

func _cubic(a: Vector2, b: Vector2, c: Vector2, d: Vector2, out: PackedVector2Array, n := 12) -> void:
	for i in range(1, n + 1):
		var t := float(i) / n
		var q := 1.0 - t
		out.append(a * q * q * q + b * 3.0 * q * q * t + c * 3.0 * q * t * t + d * t * t * t)

# the black face in profile (shadow/head.js _ksFacePath, at 0.9 of the head radius)
func face_poly() -> PackedVector2Array:
	var o := PackedVector2Array([fp(-0.94, 0.12)])
	_cubic(fp(-0.94, 0.12), fp(-1.02, -0.76), fp(-0.42, -1.06), fp(0.12, -1.03), o)
	_cubic(fp(0.12, -1.03), fp(0.66, -0.98), fp(0.96, -0.6), fp(0.95, -0.2), o)
	for p in [[0.93, 0.04], [1.13, 0.36], [0.94, 0.45], [0.97, 0.6], [0.88, 0.7]]:
		o.append(fp(p[0], p[1]))
	_quad(fp(0.88, 0.7), fp(0.86, 0.98), fp(0.6, 1.1), o)
	_quad(fp(0.6, 1.1), fp(0.1, 0.98), fp(-0.36, 0.72), o)
	_quad(fp(-0.36, 0.72), fp(-0.82, 0.6), fp(-0.94, 0.12), o)
	return o

func fp(x: float, y: float) -> Vector2: return hp(x * 0.9, y * 0.9)

# the hair outline: the rim points joined by edges bowed up and back, then straight along the hairline
func hair_poly(st: Dictionary, t: float) -> PackedVector2Array:
	var pts: Array = st["pts"]
	var n: int = st["rim"]
	var P: Array[Vector2] = []
	for i in pts.size():
		var p: Array = pts[i]
		var x: float = p[0]; var y: float = p[1]
		if p.size() > 2:   # the tips sway a little, as in the game
			x += sin(t * 2.6 + i * 1.7) * 0.024 * absf(x); y += cos(t * 2.1 + i) * 0.016
		P.append(hp(x, y))
	var o := PackedVector2Array([P[0]])
	for i in range(1, n):
		_quad(P[i - 1], (P[i - 1] + P[i]) * 0.5 + Vector2(-0.05, -0.045) * R, P[i], o, 6)
	for i in range(n, P.size()): o.append(P[i])
	return o

# the strip of light a part's edge catches: the part minus itself shifted by `d`
func strips(poly: PackedVector2Array, d: Vector2) -> Array:
	var moved := PackedVector2Array()
	for p in poly: moved.append(p + d)
	return Geometry2D.clip_polygons(poly, moved)

func lit_poly(ci: CanvasItem, poly: PackedVector2Array, base: Color, red: Vector2, red_c: Color, tan: Vector2, tan_c: Color) -> void:
	ci.draw_colored_polygon(poly, base)
	_fill_all(ci, strips(poly, tan), tan_c)
	_fill_all(ci, strips(poly, red), red_c)

func _fill_all(ci: CanvasItem, polys: Array, col: Color) -> void:
	for s in polys:
		if s.size() > 2:
			ci.draw_colored_polygon(s, col)

# ---------------------------------------------------------------- the cloth chain (shadow/_design.js KsChain)

class Chain:
	var n: int; var seg: float; var px := PackedFloat32Array(); var py := PackedFloat32Array(); var ox := PackedFloat32Array(); var oy := PackedFloat32Array()
	var wind: float; var grav: float; var wave: float; var ph := 3.3; var init := false
	func _init(n_: int, seg_: float, k: float) -> void:
		n = n_; seg = seg_; wind = 900.0 * k; grav = 950.0 * k; wave = 160.0 * k
		px.resize(n); py.resize(n); ox.resize(n); oy.resize(n)
	func update(ax: float, ay: float, dt: float, t: float) -> void:
		if not init:
			var l := Vector2(wind, grav).length()
			for i in n:
				px[i] = ax - wind / l * i * seg; py[i] = ay + grav / l * i * seg; ox[i] = px[i]; oy[i] = py[i]
			init = true
		var gust := 1.0 + sin(t * 2.3 + ph) * 0.1 + sin(t * 5.1 + ph * 1.7) * 0.04
		for i in range(1, n):
			var vx := (px[i] - ox[i]) * 0.88; var vy := (py[i] - oy[i]) * 0.78
			ox[i] = px[i]; oy[i] = py[i]
			px[i] += vx + (-wind * gust) * dt * dt
			py[i] += vy + (grav + sin(t * 3.6 - i * 0.8 + ph) * wave * (float(i) / (n - 1))) * dt * dt
		px[0] = ax; py[0] = ay; ox[0] = ax; oy[0] = ay
		for k in 3:
			for i in range(1, n):
				var d := Vector2(px[i] - px[i - 1], py[i] - py[i - 1]); var l := maxf(d.length(), 0.001); var f := (l - seg) / l
				px[i] -= d.x * f; py[i] -= d.y * f
			for i in range(2, n):
				var d := Vector2(px[i] - px[i - 2], py[i] - py[i - 2])
				var l := maxf(d.length(), 0.001)
				var mn := seg * 1.9
				if l < mn:
					var q := (mn - l) / l
					px[i] += d.x * q
					py[i] += d.y * q

# a strand fanned out from the chain (armory/hair.js _kaFan): shifted to one side, more toward the tip, fluttering
func fan(c: Chain, k: int, m: int, spread: float, t: float) -> Array[Vector2]:
	var o: Array[Vector2] = []
	for i in m:
		var a := maxi(0, i - 1); var b := mini(c.n - 1, i + 1)
		var d := Vector2(c.px[b] - c.px[a], c.py[b] - c.py[a]).normalized()
		var u := float(i) / (c.n - 1)
		var off := spread * 2.2 * pow(u, 1.1) + sin(t * 6.3 + i * 0.9 + k * 2.1) * 1.6 * K * u
		o.append(Vector2(c.px[i] - d.y * off, c.py[i] + d.x * off))
	return o

# the lock's outline and UVs (shadow/scarf.js _ksRibbon, no fork: full by a third of the way, tapering to a point)
func lock_mesh(M: Array[Vector2], w0: float, w1: float) -> Array:
	var n := M.size(); var T := PackedVector2Array(); var B := PackedVector2Array(); var UT := PackedVector2Array(); var UB := PackedVector2Array()
	var ed := Vector2.RIGHT
	for i in n:
		var d := (M[mini(n - 1, i + 1)] - M[maxi(0, i - 1)]).normalized()
		var u := float(i) / (n - 1); var g := clampf(u / 0.34, 0, 1); var grow := g * g * (3 - 2 * g)
		var taper := 1.0 - 0.95 * pow((u - 0.56) / 0.44, 1.5) if u > 0.56 else 1.0
		var w := lerpf(w0, w1, grow) * taper * 0.5 * K
		var nrm := Vector2(-d.y, d.x)   # facing right, streaming back: this side is the upper one
		T.append(M[i] - nrm * w); B.append(M[i] + nrm * w); UT.append(Vector2(u, 0)); UB.append(Vector2(u, 1)); ed = d
	var poly := PackedVector2Array(T); var uv := PackedVector2Array(UT)
	poly.append(M[n - 1] + ed * 6.0 * K); uv.append(Vector2(1, 0.5))
	for i in range(n - 1, -1, -1): poly.append(B[i]); uv.append(UB[i])
	return [poly, uv]

# ---------------------------------------------------------------- the design render

func _shader(name: String, params := {}) -> ShaderMaterial:
	var m := ShaderMaterial.new()
	m.shader = load("res://shaders/%s_lock.gdshader" % name)
	for k in params: m.set_shader_parameter(k, params[k])
	return m

func _design(name: String, st: Dictionary) -> void:
	var vp := SubViewport.new()
	vp.size = Vector2i(W, H) * SS
	vp.transparent_bg = false
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child(vp)
	var root := Node2D.new(); root.scale = Vector2(SS, SS); vp.add_child(root)
	var bg := Node2D.new(); root.add_child(bg)
	var body := Node2D.new(); root.add_child(body)
	var locks := Node2D.new(); root.add_child(locks)
	var head := Node2D.new(); root.add_child(head)
	var lk: Dictionary = st["locks"]
	var spectral: bool = st["shader"] == "spectral"
	# the locks: a dark body under the spectral light, or silver hair drawn as it is
	var bodies: Array[Polygon2D] = []; var lights: Array[Polygon2D] = []
	var mat := _shader(st["shader"])
	for k in lk["n"]:
		if spectral:
			var b := Polygon2D.new(); b.texture = white_tex; locks.add_child(b); bodies.append(b)
		var p := Polygon2D.new(); p.texture = white_tex; p.material = mat; locks.add_child(p); lights.append(p)
	# the hair over the crown: the same texture, run from the brow back over the head
	var cap := Polygon2D.new(); cap.texture = white_tex; cap.material = mat
	var bun := Polygon2D.new(); bun.texture = white_tex; bun.material = mat
	var chain := Chain.new(13, 7.6 * K, K)
	var t := 0.0
	var frames: Array[Image] = []
	var shots := [2.2, 2.55, 2.9, 3.25]
	var hero_at := 3.6
	var state := {"t": 0.0, "hair": PackedVector2Array()}
	bg.draw.connect(_draw_bg.bind(bg, st))
	body.draw.connect(_draw_body.bind(body, st))
	head.draw.connect(_draw_head.bind(head, st, state))
	head.add_child(cap); head.add_child(bun)
	while t <= hero_at + 0.001:
		var bob := Vector2(sin(t * 2.2) * 0.03, sin(t * 4.4) * 0.025) * R
		var rp: Vector2 = lk["root"]
		var root_pt := hp(rp.x, rp.y) + bob
		chain.update(root_pt.x, root_pt.y + 0.0, 1.0 / 60.0, t)
		t += 1.0 / 60.0
		var shoot := false
		for s in shots:
			if absf(t - s) < 0.5 / 60.0:
				shoot = true
		var hero := absf(t - hero_at) < 0.5 / 60.0
		if not (shoot or hero): continue
		mat.set_shader_parameter("phase", fmod(t * (0.6 if spectral else 0.35), 1.0))
		state["t"] = t
		state["hair"] = hair_poly(st, t)
		# the locks
		for k in lk["n"]:
			var side := -1.0 if k % 2 else 1.0
			var spread: float = lk["spread"] * (0.4 + 0.5 * ceil(k / 2.0)) * K * side * (1.0 if k else 0.2)
			var M := fan(chain, k, maxi(4, 13 - (k >> 1) * 2), spread, t)
			var lift: Vector2 = Vector2(0.06, -1.0) * R * 0.13 * ceil(k / 2.0) * side   # the roots spread along the back of the head
			for i in M.size():
				M[i] += lift * (1.0 - float(i) / M.size() * 0.6)
			var mesh := lock_mesh(M, lk["w0"], lk["w1"] * (0.82 if k else 1.0))
			lights[k].polygon = mesh[0]; lights[k].uv = mesh[1]
			if spectral:
				bodies[k].polygon = mesh[0]; bodies[k].uv = mesh[1]
				var cols := PackedColorArray()
				for uvp in mesh[1]: cols.append(Color(0.1, 0.03, 0.17, 0.94 * (1.0 - smoothstep(0.45, 1.0, uvp.x))))
				bodies[k].vertex_colors = cols
		_set_cap(cap, state["hair"], st, spectral)
		_set_bun(bun, st)
		bg.queue_redraw(); body.queue_redraw(); head.queue_redraw()
		await RenderingServer.frame_post_draw
		await RenderingServer.frame_post_draw
		var img := vp.get_texture().get_image()
		img.convert(Image.FORMAT_RGBA8)
		img.resize(W, H, Image.INTERPOLATE_LANCZOS)
		if hero: img.save_png(out_dir.path_join("%s_hero.png" % name))
		else: frames.append(img)
	var sheet := Image.create(W * frames.size(), H, false, Image.FORMAT_RGBA8)
	for i in frames.size(): sheet.blit_rect(frames[i], Rect2i(0, 0, W, H), Vector2i(i * W, 0))
	sheet.save_png(out_dir.path_join("%s_design.png" % name))
	print("designed ", name)
	vp.queue_free()

# the hair over the crown: its outline, the lock texture run from the brow (u 0) back over the head (u 1)
func _set_cap(cap: Polygon2D, hair: PackedVector2Array, st: Dictionary, spectral: bool) -> void:
	if spectral: cap.polygon = PackedVector2Array(); return   # Mugen's crown stays black; its rim light is drawn in _draw_head
	var uv := PackedVector2Array()
	for p in hair:
		var q := (p - HEAD) / R
		uv.append(Vector2(clampf((1.1 - q.x) / 2.6, 0, 1) * 0.55, clampf((q.y + 1.3) / 2.2, 0, 1)))
	cap.polygon = hair; cap.uv = uv

# Yūrei's bun: a round coil on the crown, the texture wound round it
func _set_bun(bun: Polygon2D, st: Dictionary) -> void:
	if not st["bun"]: bun.polygon = PackedVector2Array(); return
	var c := hp(-0.38, -1.46); var poly := PackedVector2Array(); var uv := PackedVector2Array()
	for i in 40:
		var a := TAU * i / 40.0
		var r := R * 0.36 * (1.0 + 0.05 * sin(a * 5.0))
		poly.append(c + Vector2(cos(a), sin(a) * 0.92) * r); uv.append(Vector2(float(i) / 40.0 * 0.5, 0.15 + 0.6 * (0.5 + 0.5 * sin(a))))
	bun.polygon = poly; bun.uv = uv

func _draw_bg(ci: CanvasItem, st: Dictionary) -> void:
	ci.draw_rect(Rect2(0, 0, W, H), st["bg"])
	for i in 6:
		ci.draw_circle(HEAD + Vector2(-40, 60), 260.0 - i * 38.0, Color(0.55, 0.06, 0.12, 0.05))

# shoulders, neck and the scarf wound round it (context for the hair; the game's figure is the same flat ink)
func _draw_body(ci: CanvasItem, st: Dictionary) -> void:
	var red := Vector2(-0.85, 0.52) * 2.2; var tan := Vector2(1.0, -0.12) * 2.6
	var torso := PackedVector2Array([hp(-1.2, 1.45), hp(0.5, 1.3), hp(1.25, 1.9), hp(1.35, 3.4), hp(1.0, 5.2), hp(-1.3, 5.2), hp(-1.7, 3.2), hp(-1.65, 2.1)])
	lit_poly(ci, torso, Color("#050404"), red, st["body_rim"], tan, st["body_tan"])
	var neck := PackedVector2Array([hp(-0.42, 0.55), hp(0.4, 0.62), hp(0.5, 1.5), hp(-0.5, 1.5)])
	ci.draw_colored_polygon(neck, Color("#050404"))
	var sc: Array = st["scarf"]
	var wrap := PackedVector2Array([hp(-0.9, 0.85), hp(0.2, 0.95), hp(0.85, 1.05), hp(0.95, 1.5), hp(0.3, 1.85), hp(-0.6, 1.7), hp(-1.05, 1.35)])
	lit_poly(ci, wrap, sc[1], Vector2(0, 2.4), sc[0], Vector2(0, -1.5), sc[1].darkened(0.3))

func _draw_head(ci: CanvasItem, st: Dictionary, state: Dictionary) -> void:
	var red := Vector2(-0.3, 0.95) * maxf(1.1, R * 0.1); var tan := Vector2(0.34, -0.94) * maxf(0.7, R * 0.05)
	ci.draw_colored_polygon(face_poly(), Color("#050404"))
	_fill_all(ci, strips(face_poly(), Vector2(-1.0, 0.1) * R * 0.05), Color("#bd8171"))
	var hair: PackedVector2Array = state["hair"]
	if hair.size() > 2:
		if st["shader"] == "spectral": lit_poly(ci, hair, Color("#050404"), red, st["rimc"], tan, st["tanc"])
		else:
			# under the textured cap: just its lights, which show past its edges
			_fill_all(ci, strips(hair, tan), st["tanc"])
	# the eye: a white sliver under the brow
	ci.draw_colored_polygon(PackedVector2Array([hp(0.42, -0.14), hp(0.7, -0.24), hp(0.66, -0.06)]), Color.WHITE)

# ---------------------------------------------------------------- the bake: the lock textures the game maps onto strands

func _bake_all() -> void:
	await _bake_strip("silver", 8, Vector2i(256, 48), false)
	await _bake_strip("silver", 8, Vector2i(256, 48), true)
	await _bake_strip("spectral", 16, Vector2i(256, 48), false)

func _bake_strip(shader: String, n: int, cell: Vector2i, alpha_pass: bool) -> void:
	var vp := SubViewport.new()
	vp.size = cell * SS
	vp.transparent_bg = false
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child(vp)
	var rect := ColorRect.new(); rect.color = Color.BLACK; rect.size = Vector2(cell * SS)
	var bgr := ColorRect.new(); bgr.color = Color.BLACK; bgr.size = Vector2(cell * SS)
	vp.add_child(bgr)
	var mat := _shader(shader, {"alpha_pass": alpha_pass, "color_pass": not alpha_pass} if shader == "silver" else {})
	rect.material = mat; vp.add_child(rect)
	var sheet := Image.create(cell.x * SS, cell.y * SS * n, false, Image.FORMAT_RGBA8)
	for f in n:
		mat.set_shader_parameter("phase", float(f) / n)
		await RenderingServer.frame_post_draw
		await RenderingServer.frame_post_draw
		var img := vp.get_texture().get_image(); img.convert(Image.FORMAT_RGBA8)
		sheet.blit_rect(img, Rect2i(Vector2i.ZERO, img.get_size()), Vector2i(0, f * cell.y * SS))
	var fname := "%s%s.png" % [shader, "_alpha" if alpha_pass else ""]
	sheet.save_png(out_dir.path_join("raw").path_join(fname))
	print("baked ", fname, " ", sheet.get_size())
	vp.queue_free()
