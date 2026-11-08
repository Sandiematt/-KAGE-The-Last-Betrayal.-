# Helpers the part files share: torso skin weights by height, and the silver buckle of the sheet's straps.
extends RefCounted

# which spine bones a point on the torso follows, by its height
static func torso_w(y: float) -> Array:
	if y < 1.0:
		return [["hips", 1.0]]
	if y < 1.12:
		return [["hips", 1.0 - (y - 1.0) / 0.12], ["spine", (y - 1.0) / 0.12]]
	if y < 1.3:
		return [["spine", 1.0 - (y - 1.12) / 0.18], ["chest", (y - 1.12) / 0.18]]
	if y < 1.47:
		return [["chest", 1.0]]
	var t := clampf((y - 1.47) / 0.06, 0.0, 1.0)
	return [["chest", 1.0 - t], ["neck", t]]

# a buckle: a silver rectangular frame with a bar across it, lying on a surface. c centre, n the surface normal,
# up the strap's direction along the surface, w/h its size
static func buckle(kit, c: Vector3, n: Vector3, up: Vector3, w: float, h: float, wts, mat := "metal") -> void:
	n = n.normalized()
	up = (up - n * up.dot(n)).normalized()
	var side := up.cross(n).normalized()
	var B := Basis(side, up, n)
	var t := 0.006
	var bar := w * 0.16
	kit.box(mat, c + B * Vector3(0, h * 0.5 - bar * 0.5, 0), Vector3(w, bar, t), wts, B)
	kit.box(mat, c + B * Vector3(0, -h * 0.5 + bar * 0.5, 0), Vector3(w, bar, t), wts, B)
	kit.box(mat, c + B * Vector3(w * 0.5 - bar * 0.5, 0, 0), Vector3(bar, h, t), wts, B)
	kit.box(mat, c + B * Vector3(-w * 0.5 + bar * 0.5, 0, 0), Vector3(bar, h, t), wts, B)
	kit.box(mat, c + B * Vector3(w * 0.08, 0, t * 0.4), Vector3(bar * 0.8, h * 0.9, t), wts, B)   # the prong

# weights for a point along a bone chain: a ring at joint j is shared half and half with the bone before it
static func chain_w(prefix: String, j: int, n: int) -> Array:
	if j <= 0:
		return [[prefix + "0", 1.0]]
	return [[prefix + str(j - 1), 0.5], [prefix + str(mini(j, n - 1)), 0.5]]
