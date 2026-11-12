class_name RigDebug
extends Node2D
## Overlay that shows the rig at work: every skinned Polygon2D's triangles (outline and internal vertices) as
## they are deformed right now, and every bone. Skinning runs on the GPU, so the deformed vertices are
## recomputed here on the CPU the same way: sum of weight * (bone pose * inverse bone rest) * vertex.
## Add it as a child of the Rig node (it draws in the rig's space).

@export var parts_path: NodePath = ^"../Parts"
@export var skeleton_path: NodePath = ^"../Skeleton2D"

var _skel: Skeleton2D
var _parts: Node


func _ready() -> void:
	_skel = get_node(skeleton_path)
	_parts = get_node(parts_path)
	z_index = 200


func _process(_delta: float) -> void:
	if visible:
		queue_redraw()


func _rest_in_skeleton(b: Bone2D) -> Transform2D:
	var t := b.rest
	var p := b.get_parent()
	while p is Bone2D:
		t = (p as Bone2D).rest * t
		p = p.get_parent()
	return t


func _pose_in_skeleton(b: Bone2D) -> Transform2D:
	var t := b.transform
	var p := b.get_parent()
	while p is Bone2D:
		t = (p as Bone2D).transform * t
		p = p.get_parent()
	return t


func _draw() -> void:
	var palette := [Color(1, 0.5, 0.5), Color(0.5, 0.85, 1), Color(0.5, 1, 0.6), Color(1, 0.85, 0.3),
			Color(0.85, 0.55, 1), Color(0.3, 1, 1), Color(1, 0.6, 0.85), Color(0.7, 1, 0.3), Color(1, 1, 1)]
	var ci := 0
	for poly in _parts.get_children():
		if not (poly is Polygon2D):
			continue
		var pg := poly as Polygon2D
		var verts := pg.polygon
		var out := PackedVector2Array()
		out.resize(verts.size())
		var xf := []
		var ws := []
		for i in pg.get_bone_count():
			var b := _skel.get_node_or_null(pg.get_bone_path(i)) as Bone2D
			if b == null:
				continue
			xf.append(_pose_in_skeleton(b) * _rest_in_skeleton(b).affine_inverse())
			ws.append(pg.get_bone_weights(i))
		for v in verts.size():
			var acc := Vector2.ZERO
			var tot := 0.0
			for j in xf.size():
				var w: float = ws[j][v]
				if w > 0.0:
					acc += (xf[j] as Transform2D) * verts[v] * w
					tot += w
			out[v] = acc / tot if tot > 0.0 else verts[v]
		var c: Color = palette[ci % palette.size()]
		ci += 1
		for tri in pg.polygons:
			var t := tri as PackedInt32Array
			var line := PackedVector2Array([out[t[0]], out[t[1]], out[t[2]], out[t[0]]])
			draw_polyline(line, Color(c, 0.55), 1.0)
		var first_internal := verts.size() - pg.internal_vertex_count
		for v in range(first_internal, verts.size()):
			draw_circle(out[v], 2.5, Color(c, 0.9))
	# bones
	for b in _skel.find_children("*", "Bone2D", true, false):
		var bone := b as Bone2D
		var t := _pose_in_skeleton(bone)
		var tip := t * Vector2(bone.get_length(), 0)
		draw_line(t.origin, tip, Color(1, 0.95, 0.2), 3.0)
		draw_circle(t.origin, 5.0, Color(1, 0.55, 0.0))
