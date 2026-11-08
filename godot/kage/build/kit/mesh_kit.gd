# MeshKit: skinned geometry for one character, collected into one surface per material.
# Every primitive takes skin weights as an Array of [bone_name, weight] pairs (or a Callable returning them for a
# point), so each body part file only describes shapes and which bones move them.
# Godot's front faces wind clockwise; each triangle is wound to agree with its normal, so the glTF export comes out
# right whatever order a part lists its points in.
extends RefCounted

class Surf:
	var v := PackedVector3Array()
	var n := PackedVector3Array()
	var uv := PackedVector2Array()
	var b := PackedInt32Array()
	var w := PackedFloat32Array()
	var i := PackedInt32Array()

var surfs := {}
var order: Array = []
var bone_index := {}

func surf(mat: String) -> Surf:
	if not surfs.has(mat):
		surfs[mat] = Surf.new()
		order.append(mat)
	return surfs[mat]

# ---- weights ----
static func w1(b: String) -> Array:
	return [[b, 1.0]]

static func w2(a: String, b: String, t: float) -> Array:
	t = clampf(t, 0.0, 1.0)
	return [[a, 1.0 - t], [b, t]]

func _weights(wts) -> Array:
	var acc := {}
	for e in wts:
		var bi: int = bone_index[e[0]]
		acc[bi] = acc.get(bi, 0.0) + float(e[1])
	var pairs := []
	for k in acc:
		if acc[k] > 0.0001:
			pairs.append([k, acc[k]])
	pairs.sort_custom(func(a, b): return a[1] > b[1])
	pairs = pairs.slice(0, 4)
	var tot := 0.0
	for e in pairs:
		tot += e[1]
	var out := []
	for k in 4:
		if k < pairs.size():
			out.append([pairs[k][0], pairs[k][1] / tot])
		else:
			out.append([0, 0.0])
	return out

func _vert(s: Surf, p: Vector3, nrm: Vector3, uv: Vector2, wts) -> void:
	s.v.append(p)
	s.n.append(nrm.normalized() if nrm.length_squared() > 1e-14 else Vector3.UP)
	s.uv.append(uv)
	for e in _weights(wts):
		s.b.append(e[0])
		s.w.append(e[1])

func _tri(s: Surf, a: int, b: int, c: int) -> void:
	# clockwise front face: (b - a) x (c - a) must point away from the vertex normals
	var fn := (s.v[b] - s.v[a]).cross(s.v[c] - s.v[a])
	var nn := s.n[a] + s.n[b] + s.n[c]
	if fn.dot(nn) > 0.0:
		s.i.append_array([a, c, b])
	else:
		s.i.append_array([a, b, c])

# ---- the core primitive: a grid of points (rows x cols) ----
# P[r][c]: Vector3; W: same shape of weight arrays, or a Callable(r, c, p) -> weights.
# seam: the last column repeats the first (a closed tube); normals then wrap across the seam.
# outward: a Callable(p) -> Vector3 giving a rough outward direction, used once to orient the normals.
func grid(mat: String, P: Array, W, seam := false, outward = null, u_range := Vector2(0, 1), v_range := Vector2(0, 1)) -> void:
	var s := surf(mat)
	var rows: int = P.size()
	var cols: int = P[0].size()
	var base := s.v.size()
	var normals := []
	for r in rows:
		var row := []
		for c in cols:
			var cp: Vector3
			var cm: Vector3
			if seam:
				cp = P[r][1] if c == cols - 1 else P[r][c + 1]
				cm = P[r][cols - 2] if c == 0 else P[r][c - 1]
			else:
				cp = P[r][min(c + 1, cols - 1)]
				cm = P[r][max(c - 1, 0)]
			var rp: Vector3 = P[min(r + 1, rows - 1)][c]
			var rm: Vector3 = P[max(r - 1, 0)][c]
			row.append((cp - cm).cross(rp - rm))
		normals.append(row)
	# decide the outward side once, at the middle of the grid
	var flip := false
	if outward != null:
		var mr := rows / 2
		var mc := cols / 2
		var o: Vector3 = outward.call(P[mr][mc])
		var nsum: Vector3 = normals[mr][mc] + normals[max(mr - 1, 0)][mc] + normals[mr][max(mc - 1, 0)]
		flip = nsum.dot(o) < 0.0
	for r in rows:
		for c in cols:
			var nrm: Vector3 = normals[r][c]
			if nrm.length_squared() < 1e-14:
				nrm = normals[max(r - 1, 0)][c]
			if flip:
				nrm = -nrm
			var u := lerpf(u_range.x, u_range.y, float(c) / float(max(cols - 1, 1)))
			var v := lerpf(v_range.x, v_range.y, float(r) / float(max(rows - 1, 1)))
			var wts = W.call(r, c, P[r][c]) if W is Callable else W[r][c]
			_vert(s, P[r][c], nrm, Vector2(u, v), wts)
	for r in rows - 1:
		for c in cols - 1:
			var a := base + r * cols + c
			_tri(s, a, a + 1, a + cols)
			_tri(s, a + 1, a + cols + 1, a + cols)

# ---- rings round the vertical axis (torso, skirts, belts, legs) ----
# rings: Array of {y, rx, rz, cx, cz, (len)} top to bottom; theta 0 = front (+Z), +theta toward +X (his left).
# weight: Callable(theta, ring_index, point) -> weights. shape: optional Callable(theta, ring_index) -> radius scale.
# ydrop: optional Callable(theta, ring_index) -> extra drop below the ring's y (a jagged hem).
func ring_loft(mat: String, rings: Array, t0: float, t1: float, seg: int, weight: Callable, shape = null, ydrop = null) -> void:
	var closed := absf((t1 - t0) - TAU) < 0.001
	var P := []
	var W := []
	for ri in rings.size():
		var R: Dictionary = rings[ri]
		var row := []
		var wrow := []
		for c in seg + 1:
			var th := lerpf(t0, t1, float(c) / float(seg))
			var k: float = shape.call(th, ri) if shape != null else 1.0
			var y: float = R.y - (ydrop.call(th, ri) if ydrop != null else 0.0)
			var p := Vector3(R.get("cx", 0.0) + sin(th) * R.rx * k, y, R.get("cz", 0.0) + cos(th) * R.rz * k)
			if closed and c == seg:
				p = row[0]
			row.append(p)
			wrow.append(weight.call(th, ri, p))
		P.append(row)
		W.append(wrow)
	var cx: float = rings[0].get("cx", 0.0)
	var cz: float = rings[0].get("cz", 0.0)
	grid(mat, P, W, closed, func(p: Vector3) -> Vector3: return Vector3(p.x - cx, 0, p.z - cz))

# ---- a tube along a path (limbs, hair locks, straps, the scarf tails) ----
# radii[i]: Vector2(across side, across front); weights[i] per ring (or a single weights array for all).
func tube(mat: String, path: Array, radii: Array, weights, seg := 12, side_hint := Vector3.RIGHT, caps := true, uv_v := Vector2(0, 1)) -> void:
	var n := path.size()
	var P := []
	var W := []
	var rings := []
	for i in n:
		var a: Vector3 = path[max(i - 1, 0)]
		var b: Vector3 = path[min(i + 1, n - 1)]
		var T := (b - a).normalized()
		var side := (side_hint - T * side_hint.dot(T))
		if side.length_squared() < 1e-8:
			side = T.cross(Vector3.FORWARD)
		side = side.normalized()
		var fwd := T.cross(side).normalized()
		rings.append([path[i], side, fwd, T])
	var all_rings := []
	# rounded caps: two extra rings shrinking past each end
	if caps:
		var r0: Vector2 = radii[0]
		var g0 = rings[0]
		all_rings.append([g0[0] - g0[3] * r0.y * 0.62, g0[1], g0[2], r0 * 0.001, 0])
		all_rings.append([g0[0] - g0[3] * r0.y * 0.4, g0[1], g0[2], r0 * 0.72, 0])
	for i in n:
		all_rings.append([rings[i][0], rings[i][1], rings[i][2], radii[i], i])
	if caps:
		var r1: Vector2 = radii[n - 1]
		var g1 = rings[n - 1]
		all_rings.append([g1[0] + g1[3] * r1.y * 0.4, g1[1], g1[2], r1 * 0.72, n - 1])
		all_rings.append([g1[0] + g1[3] * r1.y * 0.62, g1[1], g1[2], r1 * 0.001, n - 1])
	# weights: one array for the whole tube, one per path point, or a Callable(i) -> weights
	var per_ring: bool = weights is Array and weights.size() > 0 and weights[0] is Array and weights[0].size() > 0 and weights[0][0] is Array
	for g in all_rings:
		var row := []
		var wrow := []
		var wi = weights.call(g[4]) if weights is Callable else (weights[g[4]] if per_ring else weights)
		for c in seg + 1:
			var th := TAU * float(c) / float(seg)
			var rr: Vector2 = g[3]
			var p: Vector3 = g[0] + g[1] * cos(th) * rr.x + g[2] * sin(th) * rr.y
			if c == seg:
				p = row[0]
			row.append(p)
			wrow.append(wi)
		P.append(row)
		W.append(wrow)
	var out_fn := func(p: Vector3) -> Vector3: return _away_from(p, path)
	grid(mat, P, W, true, out_fn, Vector2(0, 1), uv_v)

# outward from a polyline: away from its nearest point
static func _away_from(p: Vector3, pts: Array) -> Vector3:
	var best: Vector3 = pts[0]
	for q in pts:
		if p.distance_squared_to(q) < p.distance_squared_to(best):
			best = q
	return p - best

# ---- an ellipsoid ----
func ellipsoid(mat: String, c: Vector3, r: Vector3, wts, seg := 16, rows := 10, basis := Basis()) -> void:
	var P := []
	var W := []
	for ri in rows + 1:
		var lat := lerpf(PI / 2, -PI / 2, float(ri) / float(rows))
		var row := []
		var wrow := []
		for ci in seg + 1:
			var lon := TAU * float(ci) / float(seg)
			var p := c + basis * Vector3(cos(lat) * sin(lon) * r.x, sin(lat) * r.y, cos(lat) * cos(lon) * r.z)
			if ci == seg:
				p = row[0]
			row.append(p)
			wrow.append(wts)
		P.append(row)
		W.append(wrow)
	grid(mat, P, W, true, func(p: Vector3): return p - c)

# ---- a box (buckles, plates) with flat faces; bevel: corner cut ----
func box(mat: String, c: Vector3, size: Vector3, wts, basis := Basis()) -> void:
	var s := surf(mat)
	var h := size * 0.5
	var faces := [
		[Vector3(1, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, 1)], [Vector3(-1, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, -1)],
		[Vector3(0, 1, 0), Vector3(0, 0, 1), Vector3(1, 0, 0)], [Vector3(0, -1, 0), Vector3(0, 0, 1), Vector3(-1, 0, 0)],
		[Vector3(0, 0, 1), Vector3(1, 0, 0), Vector3(0, 1, 0)], [Vector3(0, 0, -1), Vector3(-1, 0, 0), Vector3(0, 1, 0)]]
	for f in faces:
		var nrm: Vector3 = f[0]
		var a: Vector3 = f[1]
		var b: Vector3 = f[2]
		var base := s.v.size()
		for k in 4:
			var sa := -1.0 if (k == 0 or k == 3) else 1.0
			var sb := -1.0 if k < 2 else 1.0
			var local := (nrm + a * sa + b * sb) * h
			_vert(s, c + basis * local, basis * nrm, Vector2(0.5 + sa * 0.5, 0.5 + sb * 0.5), wts)
		_tri(s, base, base + 1, base + 2)
		_tri(s, base, base + 2, base + 3)

# ---- finish: one ArrayMesh with a surface per material ----
func commit(materials: Dictionary) -> ArrayMesh:
	var mesh := ArrayMesh.new()
	for name in order:
		var s: Surf = surfs[name]
		var arr := []
		arr.resize(Mesh.ARRAY_MAX)
		arr[Mesh.ARRAY_VERTEX] = s.v
		arr[Mesh.ARRAY_NORMAL] = s.n
		arr[Mesh.ARRAY_TEX_UV] = s.uv
		arr[Mesh.ARRAY_BONES] = s.b
		arr[Mesh.ARRAY_WEIGHTS] = s.w
		arr[Mesh.ARRAY_INDEX] = s.i
		mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
		var si := mesh.get_surface_count() - 1
		mesh.surface_set_name(si, name)
		if materials.has(name):
			mesh.surface_set_material(si, materials[name])
	return mesh

func stats() -> String:
	var t := 0
	var vv := 0
	for k in surfs:
		t += surfs[k].i.size() / 3
		vv += surfs[k].v.size()
	return "%d surfaces, %d vertices, %d triangles" % [surfs.size(), vv, t]
