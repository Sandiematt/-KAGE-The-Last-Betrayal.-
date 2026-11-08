# Builds Kage and exports him:
#   godot --headless --path godot/kage --script res://build/build_kage.gd
# - the rig (rig.gd), every body part (parts/*.gd, one file each) skinned to it, the painted textures
# - the animations (anims.gd), baked to bone tracks
# - res://generated/kage.scn: the character scene, opened by preview.tscn
# - res://generated/kage.glb and ../../prototypes/kage-3d/assets/kage.glb: the glTF the Three.js game test loads
extends SceneTree

const MeshKit = preload("res://build/kit/mesh_kit.gd")
const TexKit = preload("res://build/kit/tex_kit.gd")
const Materials = preload("res://build/kit/materials.gd")
const Rig = preload("res://build/rig.gd")
const Anims = preload("res://build/anims.gd")
const Eyes = preload("res://build/parts/eyes.gd")

# drawing order does not matter; listed head to toe
const PARTS := [
	preload("res://build/parts/face.gd"), preload("res://build/parts/hair.gd"), preload("res://build/parts/scarf.gd"),
	preload("res://build/parts/torso.gd"), preload("res://build/parts/harness.gd"), preload("res://build/parts/capelet.gd"),
	preload("res://build/parts/pauldrons.gd"), preload("res://build/parts/arms.gd"), preload("res://build/parts/hands.gd"),
	preload("res://build/parts/belt.gd"), preload("res://build/parts/apron.gd"), preload("res://build/parts/tassel.gd"),
	preload("res://build/parts/cloak.gd"), preload("res://build/parts/legs.gd"), preload("res://build/parts/boots.gd"),
	preload("res://build/parts/katana.gd"), preload("res://build/parts/saya.gd")]

func _initialize() -> void:
	var t0 := Time.get_ticks_msec()
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://generated/textures"))
	var rig := Rig.build()
	var sk: Skeleton3D = rig.skeleton
	var kit := MeshKit.new()
	for i in sk.get_bone_count():
		kit.bone_index[sk.get_bone_name(i)] = i
	var ctx := {"kit": kit, "pos": rig.pos, "chains": Rig.chains(), "mats": {}, "M": Materials, "T": TexKit,
		"dir": ProjectSettings.globalize_path("res://generated/textures/")}
	for part in PARTS:
		part.build(ctx)
	print("body: ", kit.stats(), " (", Time.get_ticks_msec() - t0, " ms)")

	var root := Node3D.new()
	root.name = "Kage"
	get_root().add_child(root)
	root.add_child(sk)
	sk.owner = root
	var body := MeshInstance3D.new()
	body.name = "Body"
	body.mesh = kit.commit(ctx.mats)
	sk.add_child(body)
	body.owner = root
	body.skeleton = NodePath("..")
	body.skin = sk.create_skin_from_rest_transforms()
	var eyes := MeshInstance3D.new()
	eyes.name = "Eyes"
	eyes.mesh = Eyes.build_mesh(ctx, MeshKit)
	sk.add_child(eyes)
	eyes.owner = root
	eyes.skeleton = NodePath("..")
	eyes.skin = body.skin
	var player := AnimationPlayer.new()
	player.name = "AnimationPlayer"
	root.add_child(player)
	player.owner = root
	Anims.build(rig, player)
	print("animations: ", player.get_animation_list())
	call_deferred("_save", root)

func _save(root: Node3D) -> void:
	var packed := PackedScene.new()
	packed.pack(root)
	print("scene: ", ResourceSaver.save(packed, "res://generated/kage.scn", ResourceSaver.FLAG_COMPRESS))
	var doc := GLTFDocument.new()
	var state := GLTFState.new()
	var err := doc.append_from_scene(root, state)
	if err == OK:
		err = doc.write_to_filesystem(state, "res://generated/kage.glb")
	print("glb: ", err)
	var dst := ProjectSettings.globalize_path("res://").path_join("../../prototypes/kage-3d/assets").simplify_path()
	DirAccess.make_dir_recursive_absolute(dst)
	print("copy to Three.js: ", DirAccess.copy_absolute(ProjectSettings.globalize_path("res://generated/kage.glb"), dst.path_join("kage.glb")), " ", dst)
	quit()
