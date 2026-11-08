# Materials: Kage's palette (the sheet's PALETTE panel) as toon StandardMaterial3D, one per surface.
# The glTF export keeps the name, colour, texture, double-sidedness, alpha cut and emission; the toon diffuse and the
# ink outline (a grown, front-culled next pass) are for the Godot preview, and Three.js re-creates both.
extends RefCounted

const PAL := {
	"cloth": Color("2a2324"),      # primary cloth
	"cloth_dark": Color("1a1516"),
	"red": Color("a3141c"),        # secondary red
	"red_dark": Color("5e0c11"),
	"red_hi": Color("e0383f"),
	"metal": Color("b8b0aa"),      # accent metal
	"metal_dark": Color("5d5654"),
	"detail": Color("3a3030"),     # detail dark
	"leather": Color("221a1a"),
	"face": Color("070505"),
	"hair": Color("120d0d"),
	"eye": Color("ffffff"),
	"sole": Color("8a807a")
}

static var _outline: StandardMaterial3D

static func outline_pass() -> StandardMaterial3D:
	if _outline == null:
		_outline = StandardMaterial3D.new()
		_outline.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		_outline.albedo_color = Color("050303")
		_outline.cull_mode = BaseMaterial3D.CULL_FRONT
		_outline.grow = true
		_outline.grow_amount = 0.0045
	return _outline

# opts: tex (Texture2D), double (bool), cut (alpha scissor), emit (Color), outline (default true)
static func toon(name: String, color: Color, opts := {}) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.resource_name = name
	m.albedo_color = color
	if opts.has("tex"):
		m.albedo_texture = opts.tex
		m.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
	m.diffuse_mode = BaseMaterial3D.DIFFUSE_TOON
	m.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	m.roughness = 1.0
	m.metallic = 0.0
	if opts.get("double", false):
		m.cull_mode = BaseMaterial3D.CULL_DISABLED
	if opts.get("cut", false):
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
		m.alpha_scissor_threshold = 0.5
	if opts.has("emit"):
		m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		m.emission_enabled = true
		m.emission = opts.emit
		m.emission_energy_multiplier = 1.5
	m.rim_enabled = opts.get("rim", true)
	m.rim = 0.35
	m.rim_tint = 0.9
	if opts.get("outline", true):
		m.next_pass = outline_pass()
	return m
