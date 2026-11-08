# The hair: a wild mass of big flat spikes, the crown standing up and back, bangs falling over the brow between the
# eyes, long points swept back and out over the ears; black, going dark red toward the tips (the sheet's lit edges).
# Each lock is a tapered lens-section tube on a curve from the scalp, bulging outward.
extends RefCounted

const C := Vector3(0, 1.66, -0.004)
const U := 0.11

# [base (on the scalp), tip, width], in head units round C
const LOCKS := [
	# bangs
	[Vector3(0.0, 0.72, 0.62), Vector3(0.06, 0.02, 1.06), 0.34], [Vector3(0.34, 0.68, 0.58), Vector3(0.5, -0.04, 0.98), 0.3],
	[Vector3(-0.34, 0.68, 0.58), Vector3(-0.48, -0.02, 0.98), 0.3], [Vector3(0.14, 0.86, 0.46), Vector3(0.28, 0.42, 1.24), 0.3],
	[Vector3(-0.16, 0.84, 0.46), Vector3(-0.3, 0.36, 1.2), 0.28], [Vector3(0.62, 0.5, 0.52), Vector3(0.86, -0.22, 0.8), 0.26],
	[Vector3(-0.62, 0.5, 0.52), Vector3(-0.86, -0.24, 0.8), 0.26],
	# the crown, standing up
	[Vector3(0.0, 0.98, 0.1), Vector3(0.12, 2.0, -0.18), 0.5], [Vector3(0.34, 0.9, 0.16), Vector3(0.92, 1.8, 0.1), 0.44],
	[Vector3(-0.34, 0.9, 0.16), Vector3(-0.92, 1.76, 0.06), 0.44], [Vector3(0.2, 0.94, -0.3), Vector3(0.46, 1.9, -0.9), 0.48],
	[Vector3(-0.2, 0.94, -0.3), Vector3(-0.5, 1.86, -0.94), 0.48], [Vector3(0.02, 0.86, 0.42), Vector3(0.06, 1.66, 0.74), 0.38],
	# out to the sides
	[Vector3(0.84, 0.46, 0.0), Vector3(1.66, 0.92, -0.2), 0.4], [Vector3(-0.84, 0.46, 0.0), Vector3(-1.66, 0.86, -0.24), 0.4],
	[Vector3(0.7, 0.72, 0.2), Vector3(1.38, 1.36, 0.24), 0.36], [Vector3(-0.7, 0.72, 0.2), Vector3(-1.38, 1.32, 0.2), 0.36],
	[Vector3(0.8, 0.12, -0.18), Vector3(1.46, 0.02, -0.6), 0.34], [Vector3(-0.8, 0.12, -0.18), Vector3(-1.46, 0.0, -0.64), 0.34],
	# swept back
	[Vector3(0.0, 0.62, -0.8), Vector3(0.0, 1.12, -1.82), 0.5], [Vector3(0.5, 0.52, -0.7), Vector3(1.02, 0.82, -1.62), 0.44],
	[Vector3(-0.5, 0.52, -0.7), Vector3(-1.02, 0.8, -1.62), 0.44], [Vector3(0.0, 0.12, -0.95), Vector3(0.06, -0.2, -1.78), 0.44],
	[Vector3(0.46, 0.02, -0.8), Vector3(0.86, -0.4, -1.42), 0.38], [Vector3(-0.46, 0.02, -0.8), Vector3(-0.86, -0.4, -1.42), 0.38],
	[Vector3(0.22, -0.38, -0.84), Vector3(0.3, -0.92, -1.2), 0.3], [Vector3(-0.22, -0.38, -0.84), Vector3(-0.3, -0.92, -1.2), 0.3]
]

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var wts := [["head", 1.0]]
	# the scalp: an ellipsoid cap, reaching low at the back and stopping above the brow at the front
	var P := []
	var W := []
	for ri in 10:
		var row := []
		var wrow := []
		for ci in 25:
			var lon := TAU * ci / 24.0
			var lat_min := lerpf(0.28, -0.85, (1.0 - cos(lon)) * 0.5)
			var lat := lerpf(PI / 2, lat_min, ri / 9.0)
			var p := C + Vector3(cos(lat) * sin(lon) * 0.104, sin(lat) * 0.112, cos(lat) * cos(lon) * 0.112)
			if ci == 24:
				p = row[0]
			row.append(p)
			wrow.append(wts)
		P.append(row)
		W.append(wrow)
	kit.grid("hair", P, W, true, func(p: Vector3) -> Vector3: return p - C, Vector2(0, 1), Vector2(0, 0.15))
	# the mass: spikes spread over the scalp (a Fibonacci sphere), each leaving along the scalp's normal and swept up
	# and back, longest at the crown and the back, broad enough to overlap into one shape; then the bangs from LOCKS
	var locks := []
	var rng := RandomNumberGenerator.new()
	rng.seed = 7
	var n_pts := 46
	for i in n_pts:
		var yv := 1.0 - 2.0 * (i + 0.5) / n_pts
		var rr := sqrt(1.0 - yv * yv)
		var a := i * 2.39996
		var n := Vector3(cos(a) * rr, yv, sin(a) * rr)
		if n.y < -0.3 or (n.z > 0.35 and n.y < 0.62) or (n.y < 0.15 and n.z > -0.2):
			continue   # leave the face, the jaw and below the ears to the face and the bangs
		var L := 0.72 + 0.6 * maxf(0.0, n.y) + 0.5 * maxf(0.0, -n.z) + rng.randf_range(0.0, 0.3)
		var sweep := Vector3(n.x * 0.35, 0.3 + 0.2 * maxf(0.0, -n.z), -0.55)
		var tdir := (n + sweep).normalized()
		locks.append([n * 0.92, n * 0.95 + tdir * L, rng.randf_range(0.38, 0.5)])
	for L in LOCKS.slice(0, 7):   # the bangs
		locks.append(L)
	for L in locks:
		var base: Vector3 = C + L[0] * U * 0.8
		var tip: Vector3 = C + L[1] * U * 1.05
		var w: float = L[2] * U * 1.7
		var out := (base - C).normalized()
		var ctrl := base.lerp(tip, 0.5) + out * w * 0.6
		var path := []
		var radii := []
		for k in 7:
			var t := k / 6.0
			path.append(base.lerp(ctrl, t).lerp(ctrl.lerp(tip, t), t))
			var taper := pow(1.0 - t, 0.9)
			radii.append(Vector2(w * 0.5 * taper + 0.0008, w * 0.17 * taper + 0.0006))
		var dir := (tip - base).normalized()
		kit.tube("hair", path, radii, wts, 8, dir.cross(out), false, Vector2(0.1, 1.0))
	# black at the root, dark red toward the tips
	var tex = ctx.T.new(8, 128, ctx.M.PAL.hair)
	tex.rect(0, 0.8, 1, 0.9, Color("2a0a0c"))
	tex.rect(0, 0.9, 1, 1, Color("6e1218"))
	ctx.mats["hair"] = ctx.M.toon("hair", Color.WHITE, {"tex": tex.texture(ctx.dir + "hair.png")})
