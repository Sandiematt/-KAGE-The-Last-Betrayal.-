# TexKit: paints flat-colour textures in code (no image files): even-odd polygon fill by scanline spans
# (Image.fill_rect, so it is fast), circles, thick lines, and the motifs of Kage's design sheet: the red flame band,
# the four-point silver emblem, the diamond tsuka wrap. Coordinates are in UV (0..1); `wrap` repeats a shape across
# the left/right edge so tube textures tile round the seam.
extends RefCounted

var img: Image
var W: int
var H: int

func _init(w: int, h: int, bg: Color) -> void:
	W = w
	H = h
	img = Image.create(w, h, false, Image.FORMAT_RGBA8)
	img.fill(bg)

func _px(pts: Array) -> PackedVector2Array:
	var out := PackedVector2Array()
	for p in pts:
		out.append(Vector2(p.x * W, p.y * H))
	return out

func poly_px(pts: PackedVector2Array, col: Color) -> void:
	if pts.size() < 3:
		return
	var y0 := INF
	var y1 := -INF
	for p in pts:
		y0 = minf(y0, p.y)
		y1 = maxf(y1, p.y)
	var n := pts.size()
	for y in range(maxi(0, int(floor(y0))), mini(H - 1, int(ceil(y1))) + 1):
		var yc := float(y) + 0.5
		var xs := PackedFloat32Array()
		for k in n:
			var a := pts[k]
			var b := pts[(k + 1) % n]
			if (a.y <= yc) != (b.y <= yc):
				xs.append(a.x + (yc - a.y) / (b.y - a.y) * (b.x - a.x))
		xs.sort()
		var k2 := 0
		while k2 + 1 < xs.size():
			var xa := clampi(int(round(xs[k2])), 0, W)
			var xb := clampi(int(round(xs[k2 + 1])), 0, W)
			if xb > xa:
				img.fill_rect(Rect2i(xa, y, xb - xa, 1), col)
			k2 += 2

# a polygon in UV space
func poly(pts: Array, col: Color, wrap := false) -> void:
	var px := _px(pts)
	poly_px(px, col)
	if wrap:
		for o in [-W, W]:
			var sh := PackedVector2Array()
			for p in px:
				sh.append(p + Vector2(o, 0))
			poly_px(sh, col)

func circle(c: Vector2, r: float, col: Color, wrap := false, aspect := 1.0) -> void:
	var pts := []
	for k in 28:
		var a := TAU * k / 28.0
		pts.append(c + Vector2(cos(a) * r, sin(a) * r * aspect))
	poly(pts, col, wrap)

func rect(x0: float, y0: float, x1: float, y1: float, col: Color) -> void:
	var a := Vector2i(int(x0 * W), int(y0 * H))
	var b := Vector2i(int(ceil(x1 * W)), int(ceil(y1 * H)))
	img.fill_rect(Rect2i(a, b - a), col)

# a thick polyline (width in UV x-units), round joints
func line(pts: Array, width: float, col: Color, wrap := false) -> void:
	for k in pts.size() - 1:
		var a: Vector2 = pts[k]
		var b: Vector2 = pts[k + 1]
		var d := (b - a)
		var dp := Vector2(d.x * W, d.y * H).normalized()
		var nrm := Vector2(-dp.y / W, dp.x / H) * width * W * 0.5
		poly([a + nrm, b + nrm, b - nrm, a - nrm], col, wrap)
		circle(b, width * 0.5, col, wrap, float(W) / float(H))
	circle(pts[0], width * 0.5, col, wrap, float(W) / float(H))

# ---- motifs ----

# the flame band of the coat hems (sheet: red fire tongues and curls rising from the hem). Tongues rise from `base`
# (v) to `base - height`, leaning, each with a dark cut inside so it reads as a curling flame; small embers above.
func flames(base: float, height: float, count: int, rng_seed: int, col: Color, dark: Color, wrap := true) -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = rng_seed
	var step := 1.0 / count
	for i in count:
		var x := (i + rng.randf_range(-0.2, 0.2)) * step
		var w := step * rng.randf_range(0.9, 1.5)
		var h := height * rng.randf_range(0.55, 1.0)
		var lean := rng.randf_range(-0.6, 0.6) * w
		var tip := Vector2(x + lean, base - h)
		var pts := [Vector2(x - w * 0.55, base + 0.02), Vector2(x - w * 0.42, base - h * 0.3), Vector2(x - w * 0.2 + lean * 0.4, base - h * 0.62),
			tip, Vector2(x + w * 0.05 + lean * 0.5, base - h * 0.58), Vector2(x + w * 0.32, base - h * 0.35), Vector2(x + w * 0.55, base + 0.02)]
		poly(pts, col, wrap)
		# the curl: a dark inner tongue, offset, so the flame is an outline of red round a dark core
		var ih := h * 0.55
		var cut := [Vector2(x - w * 0.18, base + 0.02), Vector2(x - w * 0.1 + lean * 0.2, base - ih * 0.55), Vector2(x + lean * 0.45, base - ih),
			Vector2(x + w * 0.12 + lean * 0.3, base - ih * 0.5), Vector2(x + w * 0.2, base + 0.02)]
		poly(cut, dark, wrap)
		# a detached ember/curl above
		if rng.randf() < 0.6:
			var e := Vector2(x + lean * 1.4 + rng.randf_range(-0.3, 0.3) * w, base - h - rng.randf_range(0.03, 0.09))
			var es := w * rng.randf_range(0.12, 0.22)
			poly([e + Vector2(0, -es * 2.2 * W / H), e + Vector2(es, 0), e + Vector2(0, es * 0.8 * W / H), e + Vector2(-es, 0)], col, wrap)
	# a solid red band along the very hem under the flames
	rect(0, base, 1, 1, col)

# the emblem of the sheet: a four-point star (long vertical points), curved inner hooks, a small centre ring.
# c, s: centre and size in UV; aspect: H/W of the texture so it stays square on the surface
func emblem(c: Vector2, s: float, metal: Color, dark: Color, aspect := 1.0) -> void:
	var star := []
	var inner := []
	for k in 16:
		var a := -PI / 2 + TAU * k / 16.0
		var r: float
		match k % 4:
			0: r = 1.0 if (k % 8 == 0) else 0.78    # the four long points (vertical longest)
			2: r = 0.34                                # diagonal hooks
			_: r = 0.2
		star.append(c + Vector2(cos(a) * r * s, sin(a) * r * s * aspect))
		inner.append(c + Vector2(cos(a) * r * s * 0.55, sin(a) * r * s * 0.55 * aspect))
	poly(star, metal)
	poly(inner, dark)
	circle(c, s * 0.16, metal, false, aspect)
	circle(c, s * 0.08, dark, false, aspect)
	# the ring through the hooks
	for k in 24:
		var a0 := TAU * k / 24.0
		var a1 := TAU * (k + 0.55) / 24.0
		line([c + Vector2(cos(a0), sin(a0) * aspect) * s * 0.42, c + Vector2(cos(a1), sin(a1) * aspect) * s * 0.42], s * 0.045, metal)

# diamonds down a strip (the tsuka wrap)
func diamonds(count: int, col: Color, margin := 0.12) -> void:
	for i in count:
		var y0 := (i + 0.1) / count
		var y1 := (i + 0.9) / count
		poly([Vector2(0.5, y0), Vector2(1.0 - margin, (y0 + y1) / 2), Vector2(0.5, y1), Vector2(margin, (y0 + y1) / 2)], col, false)

func texture(path := "") -> ImageTexture:
	if path != "":
		img.save_png(path)
	var im := img.duplicate()
	im.generate_mipmaps()
	return ImageTexture.create_from_image(im)
