# The face: one flat black shape, a rounded crown, a narrow jaw to a pointed chin; no nose, no mouth (the scarf covers
# the lower half anyway). The neck under it, black as well.
extends RefCounted

const CENTER := Vector3(0, 1.648, 0.012)
const R := Vector3(0.094, 0.118, 0.104)

# a point on the face surface (lat -PI/2 chin .. PI/2 crown, lon 0 = front)
static func surface(lat: float, lon: float) -> Vector3:
	var x := cos(lat) * sin(lon) * R.x
	var y := sin(lat) * R.y
	var z := cos(lat) * cos(lon) * R.z
	var low := maxf(0.0, -y / R.y)
	x *= 1.0 - 0.36 * low * low                                  # the jaw narrows
	z = z * (1.0 - 0.12 * low) + R.z * 0.18 * low * low * maxf(0.0, cos(lon))   # the chin comes forward
	return CENTER + Vector3(x, y * (1.06 if y < 0 else 1.0), z)

static func build(ctx: Dictionary) -> void:
	var kit = ctx.kit
	var P := []
	var W := []
	for ri in 15:
		var lat := lerpf(PI / 2, -PI / 2, ri / 14.0)
		var row := []
		var wrow := []
		for ci in 25:
			var p := surface(lat, TAU * ci / 24.0)
			if ci == 24:
				p = row[0]
			row.append(p)
			wrow.append([["head", 1.0]])
		P.append(row)
		W.append(wrow)
	kit.grid("face", P, W, true, func(p: Vector3) -> Vector3: return p - CENTER)
	kit.tube("face", [Vector3(0, 1.45, -0.014), Vector3(0, 1.52, -0.01), Vector3(0, 1.6, -0.004)],
		[Vector2(0.046, 0.044), Vector2(0.043, 0.042), Vector2(0.042, 0.042)], [[["chest", 0.4], ["neck", 0.6]], [["neck", 1.0]], [["neck", 0.4], ["head", 0.6]]], 12)
	ctx.mats["face"] = ctx.M.toon("face", ctx.M.PAL.face)
